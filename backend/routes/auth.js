import express from 'express';
import bcrypt from 'bcrypt';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { body, validationResult } from 'express-validator';
import { query } from '../config/database.js';
import { 
  generateAccessToken, 
  generateRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens
} from '../utils/jwt.js';
import { authenticate } from '../middleware/auth.js';
import { logAudit, AUDIT_ACTIONS } from '../utils/audit.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// ============================================
// LOGIN
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

    const { email, password, twoFactorCode } = req.body;

    // Get user
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
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
        message: 'E-Mail oder Passwort falsch'
      });
    }

    const user = result.rows[0];

    // Check if user is active
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
        message: 'Dein Konto wurde deaktiviert'
      });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      await logAudit({
        userId: user.id,
        userEmail: user.email,
        action: AUDIT_ACTIONS.LOGIN_FAILED,
        details: { reason: 'Wrong password' },
        req
      });

      return res.status(401).json({
        success: false,
        message: 'E-Mail oder Passwort falsch'
      });
    }

    // Check 2FA if enabled
    if (user.two_fa_enabled) {
      if (!twoFactorCode) {
        return res.status(200).json({
          success: false,
          requiresTwoFactor: true,
          message: '2FA-Code erforderlich'
        });
      }

      const verified = speakeasy.totp.verify({
        secret: user.two_fa_secret,
        encoding: 'base32',
        token: twoFactorCode,
        window: 2 // Allow 2 time steps before/after
      });

      if (!verified) {
        await logAudit({
          userId: user.id,
          userEmail: user.email,
          action: AUDIT_ACTIONS.LOGIN_FAILED,
          details: { reason: 'Invalid 2FA code' },
          req
        });

        return res.status(401).json({
          success: false,
          message: 'Ungültiger 2FA-Code'
        });
      }
    }

    // Update last login
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user.id);

    // Log successful login
    await logAudit({
      userId: user.id,
      userEmail: user.email,
      action: AUDIT_ACTIONS.LOGIN,
      req
    });

    res.json({
      success: true,
      message: 'Login erfolgreich',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        isAdmin: user.is_admin,
        isMember: user.is_member,
        twoFaEnabled: user.two_fa_enabled
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login fehlgeschlagen'
    });
  }
});

// ============================================
// LOGOUT
// ============================================
router.post('/logout', authenticate, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: AUDIT_ACTIONS.LOGOUT,
      req
    });

    res.json({
      success: true,
      message: 'Logout erfolgreich'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout fehlgeschlagen'
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
      return res.status(400).json({
        success: false,
        message: 'Refresh token fehlt'
      });
    }

    const decoded = await verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Ungültiger refresh token'
      });
    }

    // Get user
    const result = await query(
      'SELECT * FROM users WHERE id = $1 AND is_active = true',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Benutzer nicht gefunden'
      });
    }

    const user = result.rows[0];

    // Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = await generateRefreshToken(user.id);

    // Revoke old refresh token
    await revokeRefreshToken(refreshToken);

    res.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    logger.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Token refresh fehlgeschlagen'
    });
  }
});

// ============================================
// 2FA SETUP
// ============================================
router.post('/2fa/setup', authenticate, async (req, res) => {
  try {
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `${process.env.TWO_FA_APP_NAME || 'FMSV Dingden'} (${req.user.email})`
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      secret: secret.base32,
      qrCode: qrCodeUrl
    });
  } catch (error) {
    logger.error('2FA setup error:', error);
    res.status(500).json({
      success: false,
      message: '2FA Setup fehlgeschlagen'
    });
  }
});

// ============================================
// 2FA ENABLE
// ============================================
router.post('/2fa/enable', [
  authenticate,
  body('secret').notEmpty(),
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

    const { secret, code } = req.body;

    // Verify the code
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Ungültiger Code'
      });
    }

    // Enable 2FA for user
    await query(
      'UPDATE users SET two_fa_enabled = true, two_fa_secret = $1 WHERE id = $2',
      [secret, req.user.id]
    );

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: AUDIT_ACTIONS.TWO_FA_ENABLED,
      req
    });

    res.json({
      success: true,
      message: '2FA erfolgreich aktiviert'
    });
  } catch (error) {
    logger.error('2FA enable error:', error);
    res.status(500).json({
      success: false,
      message: '2FA Aktivierung fehlgeschlagen'
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

    const { password } = req.body;

    // Get user with password
    const result = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );

    const passwordMatch = await bcrypt.compare(password, result.rows[0].password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Falsches Passwort'
      });
    }

    // Disable 2FA
    await query(
      'UPDATE users SET two_fa_enabled = false, two_fa_secret = NULL WHERE id = $1',
      [req.user.id]
    );

    await logAudit({
      userId: req.user.id,
      userEmail: req.user.email,
      action: AUDIT_ACTIONS.TWO_FA_DISABLED,
      req
    });

    res.json({
      success: true,
      message: '2FA erfolgreich deaktiviert'
    });
  } catch (error) {
    logger.error('2FA disable error:', error);
    res.status(500).json({
      success: false,
      message: '2FA Deaktivierung fehlgeschlagen'
    });
  }
});

// ============================================
// VERIFY TOKEN (Check if token is valid)
// ============================================
router.get('/verify', authenticate, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.first_name,
      lastName: req.user.last_name,
      isAdmin: req.user.is_admin,
      isMember: req.user.is_member
    }
  });
});

export default router;
