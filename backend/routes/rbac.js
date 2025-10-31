const express = require('express');
const { body, param, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { requirePermission, requireAnyPermission } = require('../middleware/rbac');
const { logAudit, AUDIT_ACTIONS } = require('../utils/audit');
const { logger } = require('../utils/logger');

const router = express.Router();

// Alle RBAC-Routes erfordern Authentifizierung
router.use(authenticate);

// ============================================
// ROLES - Liste
// ============================================
router.get('/roles', requirePermission('roles.view'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, 
             COUNT(DISTINCT ur.user_id) as user_count,
             COUNT(DISTINCT rp.permission_id) as permission_count
      FROM roles r
      LEFT JOIN user_roles ur ON r.id = ur.role_id
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      GROUP BY r.id
      ORDER BY r.level DESC
    `);

    res.json({
      success: true,
      roles: result.rows
    });
  } catch (error) {
    logger.error('Get roles error:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Laden der Rollen'
    });
  }
});

// ============================================
// ROLE - Details mit Permissions
// ============================================
router.get('/roles/:id', requirePermission('roles.view'), async (req, res) => {
  try {
    const { id } = req.params;

    // Role-Details
    const roleResult = await pool.query(
      'SELECT * FROM roles WHERE id = $1',
      [id]
    );

    if (roleResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rolle nicht gefunden'
      });
    }

    const role = roleResult.rows[0];

    // Permissions der Rolle
    const permissionsResult = await pool.query(`
      SELECT p.*, rp.granted_at, u.email as granted_by_email
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      LEFT JOIN users u ON rp.granted_by = u.id
      WHERE rp.role_id = $1
      ORDER BY p.category, p.name
    `, [id]);

    role.permissions = permissionsResult.rows;

    // User mit dieser Rolle
    const usersResult = await pool.query(`
      SELECT u.id, u.email, u.first_name, u.last_name, ur.assigned_at
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      WHERE ur.role_id = $1
      ORDER BY u.last_name, u.first_name
    `, [id]);

    role.users = usersResult.rows;

    res.json({
      success: true,
      role
    });
  } catch (error) {
    logger.error('Get role error:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Laden der Rolle'
    });
  }
});

// ============================================
// ROLE - Erstellen
// ============================================
router.post('/roles', [
  requirePermission('roles.create'),
  body('name').notEmpty().matches(/^[a-z_]+$/),
  body('display_name').notEmpty(),
  body('level').isInt({ min: 0, max: 999 }),
  body('max_upload_size_mb').isInt({ min: 1 }),
  body('max_total_storage_mb').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Ungültige Eingabe',
        errors: errors.array()
      });
    }

    const {
      name,
      display_name,
      description,
      level,
      max_upload_size_mb,
      max_total_storage_mb
    } = req.body;

    // Prüfe ob Name schon existiert
    const existing = await pool.query(
      'SELECT id FROM roles WHERE name = $1',
      [name]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Eine Rolle mit diesem Namen existiert bereits'
      });
    }

    // Erstelle Rolle
    const result = await pool.query(`
      INSERT INTO roles 
      (name, display_name, description, level, max_upload_size_mb, max_total_storage_mb, is_system_role)
      VALUES ($1, $2, $3, $4, $5, $6, FALSE)
      RETURNING *
    `, [name, display_name, description, level, max_upload_size_mb, max_total_storage_mb]);

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'ROLE_CREATED',
      entityType: 'role',
      entityId: result.rows[0].id,
      details: { name, display_name },
      req
    });

    res.status(201).json({
      success: true,
      role: result.rows[0],
      message: 'Rolle erfolgreich erstellt'
    });
  } catch (error) {
    logger.error('Create role error:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Erstellen der Rolle'
    });
  }
});

// ============================================
// ROLE - Bearbeiten
// ============================================
router.put('/roles/:id', [
  requirePermission('roles.edit'),
  param('id').isUUID(),
  body('display_name').optional().notEmpty(),
  body('description').optional(),
  body('level').optional().isInt({ min: 0, max: 999 }),
  body('max_upload_size_mb').optional().isInt({ min: 1 }),
  body('max_total_storage_mb').optional().isInt({ min: 1 }),
  body('is_active').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Ungültige Eingabe',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updates = req.body;

    // Prüfe ob Rolle existiert
    const existing = await pool.query(
      'SELECT * FROM roles WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rolle nicht gefunden'
      });
    }

    const role = existing.rows[0];

    // System-Rollen können nicht deaktiviert werden
    if (role.is_system_role && updates.is_active === false) {
      return res.status(403).json({
        success: false,
        message: 'System-Rollen können nicht deaktiviert werden'
      });
    }

    // Build UPDATE query dynamically
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (['display_name', 'description', 'level', 'max_upload_size_mb', 'max_total_storage_mb', 'is_active'].includes(key)) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Keine Felder zum Aktualisieren'
      });
    }

    values.push(id);

    const result = await pool.query(`
      UPDATE roles
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'ROLE_UPDATED',
      entityType: 'role',
      entityId: id,
      details: updates,
      req
    });

    res.json({
      success: true,
      role: result.rows[0],
      message: 'Rolle erfolgreich aktualisiert'
    });
  } catch (error) {
    logger.error('Update role error:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Aktualisieren der Rolle'
    });
  }
});

// ============================================
// ROLE - Löschen
// ============================================
router.delete('/roles/:id', [
  requirePermission('roles.delete'),
  param('id').isUUID()
], async (req, res) => {
  try {
    const { id } = req.params;

    // Prüfe ob Rolle existiert
    const existing = await pool.query(
      'SELECT * FROM roles WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rolle nicht gefunden'
      });
    }

    const role = existing.rows[0];

    // System-Rollen können nicht gelöscht werden
    if (role.is_system_role) {
      return res.status(403).json({
        success: false,
        message: 'System-Rollen können nicht gelöscht werden'
      });
    }

    // Prüfe ob Rolle noch Usern zugewiesen ist
    const usersResult = await pool.query(
      'SELECT COUNT(*) as count FROM user_roles WHERE role_id = $1',
      [id]
    );

    if (parseInt(usersResult.rows[0].count) > 0) {
      return res.status(409).json({
        success: false,
        message: 'Rolle ist noch Benutzern zugewiesen und kann nicht gelöscht werden'
      });
    }

    // Lösche Rolle
    await pool.query('DELETE FROM roles WHERE id = $1', [id]);

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'ROLE_DELETED',
      entityType: 'role',
      entityId: id,
      details: { name: role.name },
      req
    });

    res.json({
      success: true,
      message: 'Rolle erfolgreich gelöscht'
    });
  } catch (error) {
    logger.error('Delete role error:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Löschen der Rolle'
    });
  }
});

// ============================================
// PERMISSIONS - Liste (alle)
// ============================================
router.get('/permissions', requirePermission('permissions.view'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*,
             COUNT(rp.role_id) as role_count
      FROM permissions p
      LEFT JOIN role_permissions rp ON p.id = rp.permission_id
      GROUP BY p.id
      ORDER BY p.category, p.name
    `);

    // Gruppiere nach Kategorie
    const grouped = {};
    result.rows.forEach(perm => {
      if (!grouped[perm.category]) {
        grouped[perm.category] = [];
      }
      grouped[perm.category].push(perm);
    });

    res.json({
      success: true,
      permissions: result.rows,
      grouped: grouped
    });
  } catch (error) {
    logger.error('Get permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Laden der Berechtigungen'
    });
  }
});

// ============================================
// ROLE PERMISSIONS - Zuweisung verwalten
// ============================================
router.post('/roles/:roleId/permissions', [
  requirePermission('permissions.manage'),
  param('roleId').isUUID(),
  body('permissionIds').isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Ungültige Eingabe',
        errors: errors.array()
      });
    }

    const { roleId } = req.params;
    const { permissionIds } = req.body;

    // Prüfe ob Rolle existiert
    const roleCheck = await pool.query(
      'SELECT * FROM roles WHERE id = $1',
      [roleId]
    );

    if (roleCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rolle nicht gefunden'
      });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Lösche alte Zuweisungen
      await client.query(
        'DELETE FROM role_permissions WHERE role_id = $1',
        [roleId]
      );

      // Füge neue Zuweisungen hinzu
      for (const permissionId of permissionIds) {
        await client.query(
          `INSERT INTO role_permissions (role_id, permission_id, granted_by)
           VALUES ($1, $2, $3)`,
          [roleId, permissionId, req.user.id]
        );
      }

      await client.query('COMMIT');

      await logAudit({
        userId: req.user.id,
        userEmail: req.user.email,
        action: AUDIT_ACTIONS.PERMISSION_GRANTED,
        entityType: 'role',
        entityId: roleId,
        details: { permissionCount: permissionIds.length },
        req
      });

      res.json({
        success: true,
        message: 'Berechtigungen erfolgreich aktualisiert'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error('Assign permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Zuweisen der Berechtigungen'
    });
  }
});

// ============================================
// USER ROLES - Benutzer-Rollen verwalten
// ============================================
router.get('/users/:userId/roles', requirePermission('roles.view'), async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(`
      SELECT r.*, ur.assigned_at, u.email as assigned_by_email
      FROM roles r
      JOIN user_roles ur ON r.id = ur.role_id
      LEFT JOIN users u ON ur.assigned_by = u.id
      WHERE ur.user_id = $1
      ORDER BY r.level DESC
    `, [userId]);

    res.json({
      success: true,
      roles: result.rows
    });
  } catch (error) {
    logger.error('Get user roles error:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Laden der Benutzer-Rollen'
    });
  }
});

// ============================================
// USER ROLES - Rolle zuweisen
// ============================================
router.post('/users/:userId/roles/:roleId', requirePermission('roles.assign'), async (req, res) => {
  try {
    const { userId, roleId } = req.params;

    // Prüfe ob Zuweisung bereits existiert
    const existing = await pool.query(
      'SELECT * FROM user_roles WHERE user_id = $1 AND role_id = $2',
      [userId, roleId]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Rolle ist bereits zugewiesen'
      });
    }

    // Weise Rolle zu
    await pool.query(
      'INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES ($1, $2, $3)',
      [userId, roleId, req.user.id]
    );

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: AUDIT_ACTIONS.ROLE_ASSIGNED,
      entityType: 'user',
      entityId: userId,
      details: { roleId },
      req
    });

    res.json({
      success: true,
      message: 'Rolle erfolgreich zugewiesen'
    });
  } catch (error) {
    logger.error('Assign role error:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Zuweisen der Rolle'
    });
  }
});

// ============================================
// USER ROLES - Rolle entfernen
// ============================================
router.delete('/users/:userId/roles/:roleId', requirePermission('roles.assign'), async (req, res) => {
  try {
    const { userId, roleId } = req.params;

    // Lösche Zuweisung
    const result = await pool.query(
      'DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2',
      [userId, roleId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rollenzuweisung nicht gefunden'
      });
    }

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: AUDIT_ACTIONS.ROLE_REMOVED,
      entityType: 'user',
      entityId: userId,
      details: { roleId },
      req
    });

    res.json({
      success: true,
      message: 'Rolle erfolgreich entfernt'
    });
  } catch (error) {
    logger.error('Remove role error:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Entfernen der Rolle'
    });
  }
});

module.exports = router;
