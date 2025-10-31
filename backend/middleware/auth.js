const { verifyAccessToken } = require('../utils/jwt');
const pool = require('../config/database');
const { logAudit, AUDIT_ACTIONS } = require('../utils/audit');
const { logger } = require('../utils/logger');
const { getUserPermissions, getUserRoles } = require('./rbac');

// Verify JWT Token
const authenticate = async (req, res, next) => {
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

    // Get full user data including 2FA status
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, is_admin, is_member, is_active, 
              two_fa_enabled, account_locked 
       FROM users WHERE id = $1`,
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

    // Check if account is locked
    if (user.account_locked) {
      await logAudit({
        userId: user.id,
        userEmail: user.email,
        action: AUDIT_ACTIONS.UNAUTHORIZED_ACCESS,
        details: { reason: 'Account locked' },
        req
      });

      return res.status(403).json({
        success: false,
        message: 'Dein Konto wurde gesperrt',
        code: 'ACCOUNT_LOCKED'
      });
    }

    // Load user permissions and roles (for RBAC)
    user.permissions = await getUserPermissions(user.id);
    user.roles = await getUserRoles(user.id);
    
    // Check if 2FA is required and verified
    if (user.two_fa_enabled && !decoded.two_fa_verified) {
      return res.status(403).json({
        success: false,
        message: '2FA-Verifizierung erforderlich',
        code: '2FA_REQUIRED',
        two_fa_required: true
      });
    }
    
    user.two_fa_verified = decoded.two_fa_verified || false;

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
const requireMember = (req, res, next) => {
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
const requireAdmin = (req, res, next) => {
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
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    if (decoded) {
      const result = await pool.query(
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

module.exports = {
  authenticate,
  requireMember,
  requireAdmin,
  optionalAuth
};
