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

    // Get full user data
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
        req.user = result.rows[0];
      }
    }

    next();
  } catch (error) {
    logger.error('Optional auth error:', error);
    req.user = null;
    next();
  }
};
