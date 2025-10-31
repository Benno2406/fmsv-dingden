const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { 
  generateAccessToken, 
  generateRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens
} = require('../utils/jwt');
const { authenticate, requireMember } = require('../middleware/auth');
const { logAudit, AUDIT_ACTIONS } = require('../utils/audit');
const { logger } = require('../utils/logger');
const { 
  generate2FASecret,
  verifyTOTP,
  generateBackupCodes,
  enable2FA,
  disable2FA,
  create2FASession,
  verify2FASession,
  mark2FASessionVerified,
  verifyAndUseBackupCode,
  getRemainingBackupCodesCount
} = require('../middleware/twoFactor');

const router = express.Router();

// ============================================
// LOGIN (Stufe 1 - Username/Password)
// ============================================
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
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

    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');

    // Get user
    const result = await pool.query(
      `SELECT id, email, password_hash, first_name, last_name, 
              is_admin, is_member, is_active, account_locked, 
              two_fa_enabled, failed_login_attempts
       FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      await logAudit({
        userId: null,
        userEmail: email,
        action: AUDIT_ACTIONS.LOGIN_FAILED,
        details: { reason: 'User not found' },
        req
      });

      return res.status(401).json({
        success: false,
        message: 'E-Mail oder Passwort ungültig'
      });
    }

    const user = result.rows[0];

    // Check if account is locked
    if (user.account_locked) {
      await logAudit({
        userId: user.id,
        userEmail: user.email,
        action: AUDIT_ACTIONS.LOGIN_FAILED,
        details: { reason: 'Account locked' },
        req
      });

      return res.status(403).json({
        success: false,
        message: 'Dein Konto wurde gesperrt. Bitte kontaktiere einen Administrator.'
      });
    }

    // Check if account is active
    if (!user.is_active) {
      await logAudit({
        userId: user.id,
        userEmail: user.email,
        action: AUDIT_ACTIONS.LOGIN_FAILED,
        details: { reason: 'Account inactive' },
        req
      });

      return res.status(403).json({
        success: false,
        message: 'Dein Konto ist nicht aktiv'
      });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      // Increment failed login attempts
      const newAttempts = user.failed_login_attempts + 1;
      await pool.query(
        `UPDATE users 
         SET failed_login_attempts = $1, last_failed_login = NOW() 
         WHERE id = $2`,
        [newAttempts, user.id]
      );

      // Lock account after 5 failed attempts
      if (newAttempts >= 5) {
        await pool.query(
          `UPDATE users 
           SET account_locked = TRUE, lock_reason = 'Too many failed login attempts'
           WHERE id = $1`,
          [user.id]
        );

        await logAudit({
          userId: user.id,
          userEmail: user.email,
          action: AUDIT_ACTIONS.USER_DEACTIVATED,
          details: { reason: 'Account locked after 5 failed attempts' },
          req
        });

        return res.status(403).json({
          success: false,
          message: 'Zu viele fehlgeschlagene Login-Versuche. Dein Konto wurde gesperrt.'
        });
      }

      await logAudit({
        userId: user.id,
        userEmail: user.email,
        action: AUDIT_ACTIONS.LOGIN_FAILED,
        details: { reason: 'Invalid password', attempts: newAttempts },
        req
      });

      return res.status(401).json({
        success: false,
        message: 'E-Mail oder Passwort ungültig'
      });
    }

    // Reset failed login attempts on successful password verification
    await pool.query(
      'UPDATE users SET failed_login_attempts = 0 WHERE id = $1',
      [user.id]
    );

    // Check if 2FA is enabled
    if (user.two_fa_enabled) {
      // Create temporary 2FA session
      const tempToken = await create2FASession(user.id, ipAddress);

      await logAudit({
        userId: user.id,
        userEmail: user.email,
        action: AUDIT_ACTIONS.LOGIN,
        details: { stage: '2FA required', ip: ipAddress },
        req
      });

      return res.json({
        success: true,
        requires2FA: true,
        tempToken: tempToken,
        message: 'Bitte 2FA-Code eingeben'
      });
    }

    // No 2FA - Generate tokens directly
    const accessToken = generateAccessToken(user, true);
    const refreshToken = await generateRefreshToken(user.id, userAgent, ipAddress);

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    await logAudit({
      userId: user.id,
      userEmail: user.email,
      action: AUDIT_ACTIONS.LOGIN,
      details: { ip: ipAddress },
      req
    });

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        isAdmin: user.is_admin,
        isMember: user.is_member
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Login'
    });
  }
});

// ============================================
// 2FA VERIFY (Stufe 2 - Nach Password)
// ============================================
router.post('/2fa/verify', [
  body('tempToken').notEmpty(),
  body('code').notEmpty()
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

    const { tempToken, code, useBackupCode } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');

    // Verify 2FA session
    const session = await verify2FASession(tempToken);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: '2FA-Session abgelaufen oder ungültig'
      });
    }

    // Get user
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, is_admin, is_member, 
              two_fa_secret, two_fa_enabled 
       FROM users WHERE id = $1`,
      [session.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Benutzer nicht gefunden'
      });
    }

    const user = result.rows[0];

    // Verify code
    let codeValid = false;

    if (useBackupCode) {
      // Verify backup code
      codeValid = await verifyAndUseBackupCode(user.id, code);
      
      if (codeValid) {
        const remaining = await getRemainingBackupCodesCount(user.id);
        logger.info(`User ${user.email} used backup code. ${remaining} remaining.`);
      }
    } else {
      // Verify TOTP
      codeValid = verifyTOTP(user.two_fa_secret, code);
    }

    if (!codeValid) {
      await logAudit({
        userId: user.id,
        userEmail: user.email,
        action: AUDIT_ACTIONS.LOGIN_FAILED,
        details: { reason: 'Invalid 2FA code', useBackupCode },
        req
      });

      return res.status(401).json({
        success: false,
        message: 'Ungültiger 2FA-Code'
      });
    }

    // Mark session as verified
    await mark2FASessionVerified(tempToken);

    // Generate tokens with 2FA verified flag
    const accessToken = generateAccessToken(user, true);
    const refreshToken = await generateRefreshToken(user.id, userAgent, ipAddress);

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    await logAudit({
      userId: user.id,
      userEmail: user.email,
      action: AUDIT_ACTIONS.LOGIN,
      details: { stage: '2FA verified', ip: ipAddress },
      req
    });

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        isAdmin: user.is_admin,
        isMember: user.is_member
      }
    });
  } catch (error) {
    logger.error('2FA verify error:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler bei 2FA-Verifizierung'
    });
  }
});

// ============================================
// 2FA SETUP - Generate Secret
// ============================================
router.post('/2fa/setup', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    // Generate new secret
    const { secret, qrCode } = await generate2FASecret(userEmail);

    // Speichere Secret temporär (noch nicht aktiviert!)
    await pool.query(
      'UPDATE users SET two_fa_secret = $1 WHERE id = $2',
      [secret, userId]
    );

    res.json({
      success: true,
      secret: secret,
      qrCode: qrCode,
      message: 'Scanne den QR-Code mit deiner Authenticator App'
    });
  } catch (error) {
    logger.error('2FA setup error:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim 2FA-Setup'
    });
  }
});

// ============================================
// 2FA ENABLE - Activate after verification
// ============================================
router.post('/2fa/enable', [
  authenticate,
  body('code').notEmpty()
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

    const userId = req.user.id;
    const { code } = req.body;

    // Get user secret
    const result = await pool.query(
      'SELECT two_fa_secret FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0 || !result.rows[0].two_fa_secret) {
      return res.status(400).json({
        success: false,
        message: '2FA-Setup wurde noch nicht gestartet'
      });
    }

    const secret = result.rows[0].two_fa_secret;

    // Verify code
    const codeValid = verifyTOTP(secret, code);

    if (!codeValid) {
      return res.status(401).json({
        success: false,
        message: 'Ungültiger Code'
      });
    }

    // Generate backup codes
    const backupCodes = generateBackupCodes(10);

    // Enable 2FA
    await enable2FA(userId, secret, backupCodes);

    await logAudit({
      userId: userId,
      userEmail: req.user.email,
      action: AUDIT_ACTIONS.TWO_FA_ENABLED,
      details: {},
      req
    });

    res.json({
      success: true,
      backupCodes: backupCodes,
      message: '2FA wurde erfolgreich aktiviert. Speichere deine Backup-Codes!'
    });
  } catch (error) {
    logger.error('2FA enable error:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Aktivieren von 2FA'
    });
  }
});

// ============================================
// 2FA DISABLE
// ============================================
router.post('/2fa/disable', [
  authenticate,
  body('password').notEmpty()
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

    const userId = req.user.id;
    const { password } = req.body;

    // Verify password
    const result = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    const passwordMatch = await bcrypt.compare(password, result.rows[0].password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Falsches Passwort'
      });
    }

    // Disable 2FA
    await disable2FA(userId);

    await logAudit({
      userId: userId,
      userEmail: req.user.email,
      action: AUDIT_ACTIONS.TWO_FA_DISABLED,
      details: {},
      req
    });

    res.json({
      success: true,
      message: '2FA wurde deaktiviert'
    });
  } catch (error) {
    logger.error('2FA disable error:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Deaktivieren von 2FA'
    });
  }
});

// ============================================
// LOGOUT
// ============================================
router.post('/logout', authenticate, async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken;

    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: AUDIT_ACTIONS.LOGOUT,
      details: {},
      req
    });

    res.json({
      success: true,
      message: 'Erfolgreich ausgeloggt'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Logout'
    });
  }
});

// ============================================
// REFRESH TOKEN
// ============================================
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh Token fehlt'
      });
    }

    const decoded = await verifyRefreshToken(refreshToken);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Ungültiger Refresh Token'
      });
    }

    // Get user
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, is_admin, is_member, 
              is_active, two_fa_enabled 
       FROM users WHERE id = $1`,
      [decoded.id]
    );

    if (result.rows.length === 0 || !result.rows[0].is_active) {
      return res.status(401).json({
        success: false,
        message: 'Benutzer nicht gefunden oder inaktiv'
      });
    }

    const user = result.rows[0];

    // Generate new access token (2FA already verified if we have refresh token)
    const accessToken = generateAccessToken(user, user.two_fa_enabled);

    res.json({
      success: true,
      accessToken
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Token-Refresh'
    });
  }
});

// ============================================
// GET CURRENT USER
// ============================================
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, phone, street, postal_code, city,
              is_admin, is_member, is_active, member_since, member_number, avatar_url,
              two_fa_enabled, created_at, last_login
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Benutzer nicht gefunden'
      });
    }

    // Add permissions and roles from middleware
    const user = result.rows[0];
    user.permissions = req.user.permissions || [];
    user.roles = req.user.roles || [];

    // Count remaining backup codes
    if (user.two_fa_enabled) {
      user.backup_codes_remaining = await getRemainingBackupCodesCount(user.id);
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Laden der Benutzerdaten'
    });
  }
});

module.exports = router;
