import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../config/database.js';
import { authenticate, requireAdmin, requireMember } from '../middleware/auth.js';
import { logAudit, AUDIT_ACTIONS } from '../utils/audit.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// GET all protocols (Members only)
router.get('/', authenticate, requireMember, async (req, res) => {
  try {
    const { year, type } = req.query;

    let queryText = `
      SELECT p.*, u.first_name, u.last_name
      FROM protocols p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    // Non-admins can only see published protocols
    if (!req.user.is_admin) {
      queryText += ` AND p.is_public = true`;
    }

    if (year) {
      queryText += ` AND EXTRACT(YEAR FROM p.protocol_date) = $${paramIndex}`;
      params.push(year);
      paramIndex++;
    }

    if (type) {
      queryText += ` AND p.protocol_type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    queryText += ` ORDER BY p.protocol_date DESC`;

    const result = await query(queryText, params);

    res.json({
      success: true,
      protocols: result.rows
    });
  } catch (error) {
    logger.error('Get protocols error:', error);
    res.status(500).json({ success: false, message: 'Fehler beim Laden der Protokolle' });
  }
});

// CREATE protocol (Admin only)
router.post('/', [
  authenticate,
  requireAdmin,
  body('title').trim().notEmpty(),
  body('content').trim().notEmpty(),
  body('protocolDate').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, content, protocolDate, protocolType, isPublic } = req.body;

    const result = await query(
      `INSERT INTO protocols (title, content, protocol_date, protocol_type, is_public, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, content, protocolDate, protocolType || 'meeting', isPublic || false, req.user.id]
    );

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: AUDIT_ACTIONS.PROTOCOL_CREATED,
      entityType: 'protocol',
      entityId: result.rows[0].id,
      req
    });

    res.status(201).json({
      success: true,
      message: 'Protokoll erfolgreich erstellt',
      protocol: result.rows[0]
    });
  } catch (error) {
    logger.error('Create protocol error:', error);
    res.status(500).json({ success: false, message: 'Fehler beim Erstellen des Protokolls' });
  }
});

// UPDATE protocol (Admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, protocolDate, protocolType, isPublic } = req.body;

    const result = await query(
      `UPDATE protocols 
       SET title = COALESCE($1, title),
           content = COALESCE($2, content),
           protocol_date = COALESCE($3, protocol_date),
           protocol_type = COALESCE($4, protocol_type),
           is_public = COALESCE($5, is_public)
       WHERE id = $6
       RETURNING *`,
      [title, content, protocolDate, protocolType, isPublic, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Protokoll nicht gefunden' });
    }

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: AUDIT_ACTIONS.PROTOCOL_UPDATED,
      entityType: 'protocol',
      entityId: id,
      req
    });

    res.json({
      success: true,
      message: 'Protokoll erfolgreich aktualisiert',
      protocol: result.rows[0]
    });
  } catch (error) {
    logger.error('Update protocol error:', error);
    res.status(500).json({ success: false, message: 'Fehler beim Aktualisieren des Protokolls' });
  }
});

// DELETE protocol (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query('DELETE FROM protocols WHERE id = $1 RETURNING title', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Protokoll nicht gefunden' });
    }

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: AUDIT_ACTIONS.PROTOCOL_DELETED,
      entityType: 'protocol',
      entityId: id,
      details: { title: result.rows[0].title },
      req
    });

    res.json({
      success: true,
      message: 'Protokoll erfolgreich gelöscht'
    });
  } catch (error) {
    logger.error('Delete protocol error:', error);
    res.status(500).json({ success: false, message: 'Fehler beim Löschen des Protokolls' });
  }
});

export default router;
