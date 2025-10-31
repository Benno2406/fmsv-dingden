import express from 'express';
import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { query, transaction } from '../config/database.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { uploadAvatar } from '../middleware/upload.js';
import { logAudit, AUDIT_ACTIONS } from '../utils/audit.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// ============================================
// GET ALL USERS (Admin only)
// ============================================
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', isActive } = req.query;
    const offset = (page - 1) * limit;

    let queryText = `
      SELECT id, email, first_name, last_name, phone, street, postal_code, city,
             is_admin, is_member, is_active, email_verified, member_since, member_number,
             avatar_url, created_at, last_login
      FROM users
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (search) {
      queryText += ` AND (
        email ILIKE $${paramIndex} OR 
        first_name ILIKE $${paramIndex} OR 
        last_name ILIKE $${paramIndex} OR
        member_number ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (isActive !== undefined) {
      queryText += ` AND is_active = $${paramIndex}`;
      params.push(isActive === 'true');
      paramIndex++;
    }

    queryText += ` ORDER BY last_name, first_name LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM users WHERE 1=1';
    const countParams = [];
    if (search) {
      countQuery += ` AND (email ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1 OR member_number ILIKE $1)`;
      countParams.push(`%${search}%`);
    }
    if (isActive !== undefined) {
      countQuery += ` AND is_active = $${countParams.length + 1}`;
      countParams.push(isActive === 'true');
    }

    const countResult = await query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      users: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Laden der Benutzer'
    });
  }
});

// ============================================
// GET USER BY ID
// ============================================
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Users can only see their own data unless admin
    if (req.user.id !== id && !req.user.is_admin) {
      return res.status(403).json({
        success: false,
        message: 'Keine Berechtigung'
      });
    }

    const result = await query(
      `SELECT id, email, first_name, last_name, phone, street, postal_code, city,
              is_admin, is_member, is_active, email_verified, member_since, member_number,
              avatar_url, created_at, last_login, two_fa_enabled
       FROM users WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Benutzer nicht gefunden'
      });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Laden des Benutzers'
    });
  }
});

// ============================================
// CREATE USER (Admin only)
// ============================================
router.post('/', [
  authenticate,
  requireAdmin,
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validierungsfehler',
        errors: errors.array()
      });
    }

    const {
      email, password, firstName, lastName, phone,
      street, postalCode, city, isAdmin, isMember,
      memberSince, memberNumber
    } = req.body;

    // Check if email already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'E-Mail bereits registriert'
      });
    }

    // Hash password
    const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, bcryptRounds);

    // Create user
    const result = await query(
      `INSERT INTO users 
       (email, password_hash, first_name, last_name, phone, street, postal_code, city,
        is_admin, is_member, member_since, member_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id, email, first_name, last_name, is_admin, is_member, created_at`,
      [email, passwordHash, firstName, lastName, phone, street, postalCode, city,
       isAdmin || false, isMember !== false, memberSince, memberNumber]
    );

    const newUser = result.rows[0];

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: AUDIT_ACTIONS.USER_CREATED,
      entityType: 'user',
      entityId: newUser.id,
      details: { createdUserEmail: email },
      req
    });

    res.status(201).json({
      success: true,
      message: 'Benutzer erfolgreich erstellt',
      user: newUser
    });
  } catch (error) {
    logger.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Erstellen des Benutzers'
    });
  }
});

// ============================================
// UPDATE USER
// ============================================
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Users can only update their own data unless admin
    if (req.user.id !== id && !req.user.is_admin) {
      return res.status(403).json({
        success: false,
        message: 'Keine Berechtigung'
      });
    }

    const {
      firstName, lastName, phone, street, postalCode, city,
      isAdmin, isMember, isActive, memberSince, memberNumber
    } = req.body;

    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (firstName !== undefined) {
      updates.push(`first_name = $${paramIndex}`);
      params.push(firstName);
      paramIndex++;
    }
    if (lastName !== undefined) {
      updates.push(`last_name = $${paramIndex}`);
      params.push(lastName);
      paramIndex++;
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramIndex}`);
      params.push(phone);
      paramIndex++;
    }
    if (street !== undefined) {
      updates.push(`street = $${paramIndex}`);
      params.push(street);
      paramIndex++;
    }
    if (postalCode !== undefined) {
      updates.push(`postal_code = $${paramIndex}`);
      params.push(postalCode);
      paramIndex++;
    }
    if (city !== undefined) {
      updates.push(`city = $${paramIndex}`);
      params.push(city);
      paramIndex++;
    }

    // Admin-only fields
    if (req.user.is_admin) {
      if (isAdmin !== undefined) {
        updates.push(`is_admin = $${paramIndex}`);
        params.push(isAdmin);
        paramIndex++;
      }
      if (isMember !== undefined) {
        updates.push(`is_member = $${paramIndex}`);
        params.push(isMember);
        paramIndex++;
      }
      if (isActive !== undefined) {
        updates.push(`is_active = $${paramIndex}`);
        params.push(isActive);
        paramIndex++;
      }
      if (memberSince !== undefined) {
        updates.push(`member_since = $${paramIndex}`);
        params.push(memberSince);
        paramIndex++;
      }
      if (memberNumber !== undefined) {
        updates.push(`member_number = $${paramIndex}`);
        params.push(memberNumber);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Keine Änderungen angegeben'
      });
    }

    params.push(id);
    const queryText = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, email, first_name, last_name, is_admin, is_member, updated_at
    `;

    const result = await query(queryText, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Benutzer nicht gefunden'
      });
    }

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: AUDIT_ACTIONS.USER_UPDATED,
      entityType: 'user',
      entityId: id,
      details: { updates: Object.keys(req.body) },
      req
    });

    res.json({
      success: true,
      message: 'Benutzer erfolgreich aktualisiert',
      user: result.rows[0]
    });
  } catch (error) {
    logger.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Aktualisieren des Benutzers'
    });
  }
});

// ============================================
// DELETE USER (Admin only)
// ============================================
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'Du kannst dich nicht selbst löschen'
      });
    }

    const result = await query(
      'DELETE FROM users WHERE id = $1 RETURNING email',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Benutzer nicht gefunden'
      });
    }

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: AUDIT_ACTIONS.USER_DELETED,
      entityType: 'user',
      entityId: id,
      details: { deletedUserEmail: result.rows[0].email },
      req
    });

    res.json({
      success: true,
      message: 'Benutzer erfolgreich gelöscht'
    });
  } catch (error) {
    logger.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Löschen des Benutzers'
    });
  }
});

// ============================================
// UPLOAD AVATAR
// ============================================
router.post('/:id/avatar', authenticate, uploadAvatar, async (req, res) => {
  try {
    const { id } = req.params;

    // Users can only upload their own avatar unless admin
    if (req.user.id !== id && !req.user.is_admin) {
      return res.status(403).json({
        success: false,
        message: 'Keine Berechtigung'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Keine Datei hochgeladen'
      });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    await query(
      'UPDATE users SET avatar_url = $1 WHERE id = $2',
      [avatarUrl, id]
    );

    res.json({
      success: true,
      message: 'Avatar erfolgreich hochgeladen',
      avatarUrl
    });
  } catch (error) {
    logger.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Hochladen des Avatars'
    });
  }
});

export default router;
