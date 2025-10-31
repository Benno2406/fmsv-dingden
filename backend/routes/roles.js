import express from 'express';
import { query } from '../config/database.js';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { logAudit, AUDIT_ACTIONS } from '../utils/audit.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// ============================================
// ROLES MANAGEMENT
// ============================================

// Get all roles
router.get('/', authenticate, requirePermission('system.roles.manage'), async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        r.*,
        COUNT(DISTINCT ur.user_id) as user_count,
        COUNT(DISTINCT rp.permission_id) as permission_count
      FROM roles r
      LEFT JOIN user_roles ur ON r.id = ur.role_id
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      GROUP BY r.id
      ORDER BY r.priority DESC, r.display_name ASC
    `);

    res.json({
      success: true,
      roles: result.rows
    });
  } catch (error) {
    logger.error('Error fetching roles:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Laden der Rollen'
    });
  }
});

// Get single role with permissions
router.get('/:id', authenticate, requirePermission('system.roles.manage'), async (req, res) => {
  try {
    const { id } = req.params;

    // Get role
    const roleResult = await query('SELECT * FROM roles WHERE id = $1', [id]);
    
    if (roleResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rolle nicht gefunden'
      });
    }

    // Get permissions for this role
    const permissionsResult = await query(`
      SELECT p.*
      FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = $1
      ORDER BY p.category, p.display_name
    `, [id]);

    res.json({
      success: true,
      role: {
        ...roleResult.rows[0],
        permissions: permissionsResult.rows
      }
    });
  } catch (error) {
    logger.error('Error fetching role:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Laden der Rolle'
    });
  }
});

// Create new role
router.post('/', authenticate, requirePermission('system.roles.manage'), async (req, res) => {
  try {
    const {
      name,
      display_name,
      description,
      upload_limit_mb,
      priority,
      color,
      permissions
    } = req.body;

    // Validate
    if (!name || !display_name) {
      return res.status(400).json({
        success: false,
        message: 'Name und Anzeigename sind erforderlich'
      });
    }

    // Check if name already exists
    const existingRole = await query('SELECT id FROM roles WHERE name = $1', [name]);
    if (existingRole.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Eine Rolle mit diesem Namen existiert bereits'
      });
    }

    // Insert role
    const result = await query(`
      INSERT INTO roles (name, display_name, description, upload_limit_mb, priority, color, is_system_role)
      VALUES ($1, $2, $3, $4, $5, $6, false)
      RETURNING *
    `, [name, display_name, description || null, upload_limit_mb || 5, priority || 0, color || '#6B7280']);

    const newRole = result.rows[0];

    // Add permissions if provided
    if (permissions && Array.isArray(permissions) && permissions.length > 0) {
      for (const permissionId of permissions) {
        await query(
          'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [newRole.id, permissionId]
        );
      }
    }

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: AUDIT_ACTIONS.CREATE,
      entityType: 'role',
      entityId: newRole.id,
      details: { role: newRole },
      req
    });

    res.status(201).json({
      success: true,
      message: 'Rolle erfolgreich erstellt',
      role: newRole
    });
  } catch (error) {
    logger.error('Error creating role:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Erstellen der Rolle'
    });
  }
});

// Update role
router.put('/:id', authenticate, requirePermission('system.roles.manage'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      display_name,
      description,
      upload_limit_mb,
      priority,
      color,
      permissions
    } = req.body;

    // Check if role exists
    const existingRole = await query('SELECT * FROM roles WHERE id = $1', [id]);
    if (existingRole.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rolle nicht gefunden'
      });
    }

    // Don't allow updating system role name
    const role = existingRole.rows[0];

    // Update role
    const result = await query(`
      UPDATE roles
      SET display_name = $1,
          description = $2,
          upload_limit_mb = $3,
          priority = $4,
          color = $5
      WHERE id = $6
      RETURNING *
    `, [
      display_name || role.display_name,
      description !== undefined ? description : role.description,
      upload_limit_mb !== undefined ? upload_limit_mb : role.upload_limit_mb,
      priority !== undefined ? priority : role.priority,
      color || role.color,
      id
    ]);

    // Update permissions if provided
    if (permissions && Array.isArray(permissions)) {
      // Remove all existing permissions
      await query('DELETE FROM role_permissions WHERE role_id = $1', [id]);

      // Add new permissions
      for (const permissionId of permissions) {
        await query(
          'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [id, permissionId]
        );
      }
    }

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: 'role',
      entityId: id,
      details: { changes: req.body },
      req
    });

    res.json({
      success: true,
      message: 'Rolle erfolgreich aktualisiert',
      role: result.rows[0]
    });
  } catch (error) {
    logger.error('Error updating role:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Aktualisieren der Rolle'
    });
  }
});

// Delete role
router.delete('/:id', authenticate, requirePermission('system.roles.manage'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if role exists
    const existingRole = await query('SELECT * FROM roles WHERE id = $1', [id]);
    if (existingRole.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rolle nicht gefunden'
      });
    }

    const role = existingRole.rows[0];

    // Don't allow deleting system roles
    if (role.is_system_role) {
      return res.status(400).json({
        success: false,
        message: 'System-Rollen können nicht gelöscht werden'
      });
    }

    // Check if role is assigned to users
    const userCount = await query('SELECT COUNT(*) FROM user_roles WHERE role_id = $1', [id]);
    if (parseInt(userCount.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Diese Rolle kann nicht gelöscht werden, da sie noch Benutzern zugewiesen ist'
      });
    }

    // Delete role
    await query('DELETE FROM roles WHERE id = $1', [id]);

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: AUDIT_ACTIONS.DELETE,
      entityType: 'role',
      entityId: id,
      details: { role },
      req
    });

    res.json({
      success: true,
      message: 'Rolle erfolgreich gelöscht'
    });
  } catch (error) {
    logger.error('Error deleting role:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Löschen der Rolle'
    });
  }
});

// ============================================
// PERMISSIONS MANAGEMENT
// ============================================

// Get all permissions (grouped by category)
router.get('/permissions/all', authenticate, requirePermission('system.roles.manage'), async (req, res) => {
  try {
    const result = await query(`
      SELECT *
      FROM permissions
      ORDER BY category, display_name
    `);

    // Group by category
    const grouped = result.rows.reduce((acc, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      acc[perm.category].push(perm);
      return acc;
    }, {});

    res.json({
      success: true,
      permissions: result.rows,
      grouped
    });
  } catch (error) {
    logger.error('Error fetching permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Laden der Berechtigungen'
    });
  }
});

// Create new permission
router.post('/permissions', authenticate, requirePermission('system.roles.manage'), async (req, res) => {
  try {
    const { name, display_name, description, category } = req.body;

    // Validate
    if (!name || !display_name || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, Anzeigename und Kategorie sind erforderlich'
      });
    }

    // Check if permission already exists
    const existing = await query('SELECT id FROM permissions WHERE name = $1', [name]);
    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Eine Berechtigung mit diesem Namen existiert bereits'
      });
    }

    const result = await query(`
      INSERT INTO permissions (name, display_name, description, category, is_system_permission)
      VALUES ($1, $2, $3, $4, false)
      RETURNING *
    `, [name, display_name, description || null, category]);

    const newPermission = result.rows[0];

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: AUDIT_ACTIONS.CREATE,
      entityType: 'permission',
      entityId: newPermission.id,
      details: { permission: newPermission },
      req
    });

    res.status(201).json({
      success: true,
      message: 'Berechtigung erfolgreich erstellt',
      permission: newPermission
    });
  } catch (error) {
    logger.error('Error creating permission:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Erstellen der Berechtigung'
    });
  }
});

// Update permission
router.put('/permissions/:id', authenticate, requirePermission('system.roles.manage'), async (req, res) => {
  try {
    const { id } = req.params;
    const { display_name, description, category } = req.body;

    // Check if permission exists
    const existing = await query('SELECT * FROM permissions WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Berechtigung nicht gefunden'
      });
    }

    const permission = existing.rows[0];

    const result = await query(`
      UPDATE permissions
      SET display_name = $1,
          description = $2,
          category = $3
      WHERE id = $4
      RETURNING *
    `, [
      display_name || permission.display_name,
      description !== undefined ? description : permission.description,
      category || permission.category,
      id
    ]);

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: 'permission',
      entityId: id,
      details: { changes: req.body },
      req
    });

    res.json({
      success: true,
      message: 'Berechtigung erfolgreich aktualisiert',
      permission: result.rows[0]
    });
  } catch (error) {
    logger.error('Error updating permission:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Aktualisieren der Berechtigung'
    });
  }
});

// Delete permission
router.delete('/permissions/:id', authenticate, requirePermission('system.roles.manage'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if permission exists
    const existing = await query('SELECT * FROM permissions WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Berechtigung nicht gefunden'
      });
    }

    const permission = existing.rows[0];

    // Don't allow deleting system permissions
    if (permission.is_system_permission) {
      return res.status(400).json({
        success: false,
        message: 'System-Berechtigungen können nicht gelöscht werden'
      });
    }

    // Delete permission
    await query('DELETE FROM permissions WHERE id = $1', [id]);

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: AUDIT_ACTIONS.DELETE,
      entityType: 'permission',
      entityId: id,
      details: { permission },
      req
    });

    res.json({
      success: true,
      message: 'Berechtigung erfolgreich gelöscht'
    });
  } catch (error) {
    logger.error('Error deleting permission:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Löschen der Berechtigung'
    });
  }
});

// ============================================
// USER ROLES MANAGEMENT
// ============================================

// Get user roles
router.get('/user/:userId', authenticate, requirePermission('members.roles.manage'), async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await query(`
      SELECT 
        r.*,
        ur.granted_at,
        u2.email as granted_by_email,
        u2.first_name as granted_by_first_name,
        u2.last_name as granted_by_last_name
      FROM roles r
      INNER JOIN user_roles ur ON r.id = ur.role_id
      LEFT JOIN users u2 ON ur.granted_by = u2.id
      WHERE ur.user_id = $1
      ORDER BY r.priority DESC
    `, [userId]);

    res.json({
      success: true,
      roles: result.rows
    });
  } catch (error) {
    logger.error('Error fetching user roles:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Laden der Benutzerrollen'
    });
  }
});

// Assign role to user
router.post('/user/:userId/assign', authenticate, requirePermission('members.roles.manage'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { roleId } = req.body;

    // Check if user exists
    const userResult = await query('SELECT id, email FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Benutzer nicht gefunden'
      });
    }

    // Check if role exists
    const roleResult = await query('SELECT id, name FROM roles WHERE id = $1', [roleId]);
    if (roleResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rolle nicht gefunden'
      });
    }

    // Assign role
    await query(`
      INSERT INTO user_roles (user_id, role_id, granted_by)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, role_id) DO NOTHING
    `, [userId, roleId, req.user.id]);

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: 'user_role',
      entityId: userId,
      details: { 
        action: 'assign',
        roleId,
        roleName: roleResult.rows[0].name,
        targetUser: userResult.rows[0].email
      },
      req
    });

    res.json({
      success: true,
      message: 'Rolle erfolgreich zugewiesen'
    });
  } catch (error) {
    logger.error('Error assigning role:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Zuweisen der Rolle'
    });
  }
});

// Remove role from user
router.post('/user/:userId/remove', authenticate, requirePermission('members.roles.manage'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { roleId } = req.body;

    // Check if user exists
    const userResult = await query('SELECT id, email FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Benutzer nicht gefunden'
      });
    }

    // Get role name for audit
    const roleResult = await query('SELECT name FROM roles WHERE id = $1', [roleId]);

    // Remove role
    await query(
      'DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2',
      [userId, roleId]
    );

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: 'user_role',
      entityId: userId,
      details: { 
        action: 'remove',
        roleId,
        roleName: roleResult.rows[0]?.name,
        targetUser: userResult.rows[0].email
      },
      req
    });

    res.json({
      success: true,
      message: 'Rolle erfolgreich entfernt'
    });
  } catch (error) {
    logger.error('Error removing role:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Entfernen der Rolle'
    });
  }
});

export default router;
