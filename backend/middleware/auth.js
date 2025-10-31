import { verifyAccessToken } from '../utils/jwt.js';
import { query } from '../config/database.js';
import { logAudit, AUDIT_ACTIONS } from '../utils/audit.js';
import { logger } from '../utils/logger.js';

// Verify JWT Token
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Kein Authentifizierungs-Token gefunden'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Ungültiger oder abgelaufener Token'
      });
    }

    // Get full user data with roles and permissions
    const result = await query(
      'SELECT id, email, first_name, last_name, is_admin, is_member, is_active FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Benutzer nicht gefunden'
      });
    }

    const user = result.rows[0];

    // Load user roles and permissions
    const rolesResult = await query(`
      SELECT DISTINCT r.id, r.name, r.upload_limit_mb, r.priority
      FROM roles r
      INNER JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = $1
    `, [user.id]);

    const permissionsResult = await query(`
      SELECT DISTINCT p.name
      FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      INNER JOIN user_roles ur ON rp.role_id = ur.role_id
      WHERE ur.user_id = $1
    `, [user.id]);

    user.roles = rolesResult.rows;
    user.permissions = permissionsResult.rows.map(p => p.name);
    
    // Fallback: If user has no RBAC roles yet but is_admin or is_member is set (legacy system),
    // automatically assign appropriate role
    if (rolesResult.rows.length === 0) {
      // Auto-migrate on the fly
      if (user.is_admin) {
        // Assign webmaster role
        const webmasterRole = await query('SELECT id, name, upload_limit_mb, priority FROM roles WHERE name = $1', ['webmaster']);
        if (webmasterRole.rows.length > 0) {
          await query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [user.id, webmasterRole.rows[0].id]);
          user.roles = [webmasterRole.rows[0]];
          // Load permissions for webmaster
          const webmasterPerms = await query(`
            SELECT DISTINCT p.name
            FROM permissions p
            INNER JOIN role_permissions rp ON p.id = rp.permission_id
            WHERE rp.role_id = $1
          `, [webmasterRole.rows[0].id]);
          user.permissions = webmasterPerms.rows.map(p => p.name);
        }
      } else if (user.is_member) {
        // Assign mitglied role
        const memberRole = await query('SELECT id, name, upload_limit_mb, priority FROM roles WHERE name = $1', ['mitglied']);
        if (memberRole.rows.length > 0) {
          await query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [user.id, memberRole.rows[0].id]);
          user.roles = [memberRole.rows[0]];
          // Load permissions for mitglied
          const memberPerms = await query(`
            SELECT DISTINCT p.name
            FROM permissions p
            INNER JOIN role_permissions rp ON p.id = rp.permission_id
            WHERE rp.role_id = $1
          `, [memberRole.rows[0].id]);
          user.permissions = memberPerms.rows.map(p => p.name);
        }
      }
    }
    
    // Calculate max upload limit based on highest role priority
    user.maxUploadMb = user.roles.length > 0
      ? Math.max(...user.roles.map(r => r.upload_limit_mb))
      : 5; // Default 5MB

    if (!user.is_active) {
      await logAudit({
        userId: user.id,
        userEmail: user.email,
        action: AUDIT_ACTIONS.UNAUTHORIZED_ACCESS,
        details: { reason: 'User account is inactive' },
        req
      });

      return res.status(403).json({
        success: false,
        message: 'Dein Konto wurde deaktiviert'
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentifizierungsfehler'
    });
  }
};

// Check if user is a member
export const requireMember = (req, res, next) => {
  if (!req.user || !req.user.is_member) {
    logAudit({
      userId: req.user?.id,
      userEmail: req.user?.email,
      action: AUDIT_ACTIONS.UNAUTHORIZED_ACCESS,
      details: { reason: 'Not a member', path: req.path },
      req
    });

    return res.status(403).json({
      success: false,
      message: 'Nur für Mitglieder zugänglich'
    });
  }
  next();
};

// Check if user is admin
export const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    logAudit({
      userId: req.user?.id,
      userEmail: req.user?.email,
      action: AUDIT_ACTIONS.UNAUTHORIZED_ACCESS,
      details: { reason: 'Not an admin', path: req.path },
      req
    });

    return res.status(403).json({
      success: false,
      message: 'Nur für Administratoren zugänglich'
    });
  }
  next();
};

// Check if user has specific permission
export const requirePermission = (permission) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Nicht authentifiziert'
      });
    }

    // Admins (old system) have all permissions
    if (req.user.is_admin) {
      return next();
    }

    // Check if user has the permission
    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      await logAudit({
        userId: req.user.id,
        userEmail: req.user.email,
        action: AUDIT_ACTIONS.UNAUTHORIZED_ACCESS,
        details: { 
          reason: 'Missing permission',
          requiredPermission: permission,
          path: req.path 
        },
        req
      });

      return res.status(403).json({
        success: false,
        message: 'Keine Berechtigung für diese Aktion'
      });
    }

    next();
  };
};

// Check if user has ANY of the specified permissions
export const requireAnyPermission = (permissions) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Nicht authentifiziert'
      });
    }

    // Admins have all permissions
    if (req.user.is_admin) {
      return next();
    }

    // Check if user has any of the permissions
    const hasPermission = permissions.some(p => 
      req.user.permissions && req.user.permissions.includes(p)
    );

    if (!hasPermission) {
      await logAudit({
        userId: req.user.id,
        userEmail: req.user.email,
        action: AUDIT_ACTIONS.UNAUTHORIZED_ACCESS,
        details: { 
          reason: 'Missing permissions',
          requiredPermissions: permissions,
          path: req.path 
        },
        req
      });

      return res.status(403).json({
        success: false,
        message: 'Keine Berechtigung für diese Aktion'
      });
    }

    next();
  };
};

// Check if user has specific role
export const requireRole = (roleName) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Nicht authentifiziert'
      });
    }

    // Check if user has the role
    const hasRole = req.user.roles && req.user.roles.some(r => r.name === roleName);

    if (!hasRole) {
      await logAudit({
        userId: req.user.id,
        userEmail: req.user.email,
        action: AUDIT_ACTIONS.UNAUTHORIZED_ACCESS,
        details: { 
          reason: 'Missing role',
          requiredRole: roleName,
          path: req.path 
        },
        req
      });

      return res.status(403).json({
        success: false,
        message: 'Keine Berechtigung für diese Aktion'
      });
    }

    next();
  };
};

// Optional authentication (user might be logged in or not)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    if (decoded) {
      const result = await query(
        'SELECT id, email, first_name, last_name, is_admin, is_member, is_active FROM users WHERE id = $1',
        [decoded.id]
      );

      if (result.rows.length > 0 && result.rows[0].is_active) {
        const user = result.rows[0];
        
        // Load user roles and permissions
        const rolesResult = await query(`
          SELECT DISTINCT r.id, r.name, r.upload_limit_mb, r.priority
          FROM roles r
          INNER JOIN user_roles ur ON r.id = ur.role_id
          WHERE ur.user_id = $1
        `, [user.id]);

        const permissionsResult = await query(`
          SELECT DISTINCT p.name
          FROM permissions p
          INNER JOIN role_permissions rp ON p.id = rp.permission_id
          INNER JOIN user_roles ur ON rp.role_id = ur.role_id
          WHERE ur.user_id = $1
        `, [user.id]);

        user.roles = rolesResult.rows;
        user.permissions = permissionsResult.rows.map(p => p.name);
        
        // Auto-migrate if no roles assigned yet
        if (rolesResult.rows.length === 0) {
          if (user.is_admin) {
            const webmasterRole = await query('SELECT id, name, upload_limit_mb, priority FROM roles WHERE name = $1', ['webmaster']);
            if (webmasterRole.rows.length > 0) {
              await query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [user.id, webmasterRole.rows[0].id]);
              user.roles = [webmasterRole.rows[0]];
              const webmasterPerms = await query(`
                SELECT DISTINCT p.name
                FROM permissions p
                INNER JOIN role_permissions rp ON p.id = rp.permission_id
                WHERE rp.role_id = $1
              `, [webmasterRole.rows[0].id]);
              user.permissions = webmasterPerms.rows.map(p => p.name);
            }
          } else if (user.is_member) {
            const memberRole = await query('SELECT id, name, upload_limit_mb, priority FROM roles WHERE name = $1', ['mitglied']);
            if (memberRole.rows.length > 0) {
              await query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [user.id, memberRole.rows[0].id]);
              user.roles = [memberRole.rows[0]];
              const memberPerms = await query(`
                SELECT DISTINCT p.name
                FROM permissions p
                INNER JOIN role_permissions rp ON p.id = rp.permission_id
                WHERE rp.role_id = $1
              `, [memberRole.rows[0].id]);
              user.permissions = memberPerms.rows.map(p => p.name);
            }
          }
        }
        
        user.maxUploadMb = user.roles.length > 0
          ? Math.max(...user.roles.map(r => r.upload_limit_mb))
          : 5;
        
        req.user = user;
      }
    }

    next();
  } catch (error) {
    logger.error('Optional auth error:', error);
    req.user = null;
    next();
  }
};
