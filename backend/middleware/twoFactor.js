// 2FA Middleware - Two-Factor Authentication
// Unterstützt Authenticator Apps (TOTP) und Backup-Codes

const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const pool = require('../config/database');

/**
 * Generiert ein neues 2FA-Secret für einen Benutzer
 * @param {string} userEmail - E-Mail des Benutzers
 * @returns {Object} - {secret, qrCode}
 */
async function generate2FASecret(userEmail) {
    const secret = speakeasy.generateSecret({
        name: `FMSV Dingden (${userEmail})`,
        issuer: 'FMSV Dingden',
        length: 32
    });
    
    // QR-Code für Authenticator App generieren
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);
    
    return {
        secret: secret.base32,
        qrCode
    };
}

/**
 * Verifiziert einen TOTP-Token
 * @param {string} secret - Base32 encoded secret
 * @param {string} token - 6-stelliger Token vom User
 * @returns {boolean}
 */
function verifyTOTP(secret, token) {
    return speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 2 // Erlaubt ±2 Zeitfenster (1 Minute Toleranz)
    });
}

/**
 * Generiert Backup-Codes für 2FA
 * @param {number} count - Anzahl der Codes (Standard: 10)
 * @returns {Array<string>} - Array von Backup-Codes
 */
function generateBackupCodes(count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
        // Generiere 8-stelligen Code (Format: XXXX-XXXX)
        const code = crypto.randomBytes(4).toString('hex').toUpperCase();
        const formatted = `${code.slice(0, 4)}-${code.slice(4)}`;
        codes.push(formatted);
    }
    return codes;
}

/**
 * Hasht einen Backup-Code
 * @param {string} code - Backup-Code
 * @returns {string} - Gehashter Code
 */
function hashBackupCode(code) {
    return crypto.createHash('sha256').update(code).digest('hex');
}

/**
 * Speichert Backup-Codes in der Datenbank
 * @param {UUID} userId - User ID
 * @param {Array<string>} codes - Array von Backup-Codes
 */
async function saveBackupCodes(userId, codes) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Lösche alte Backup-Codes
        await client.query(
            'DELETE FROM two_fa_backup_codes WHERE user_id = $1',
            [userId]
        );
        
        // Speichere neue Codes (gehashed)
        for (const code of codes) {
            const codeHash = hashBackupCode(code);
            await client.query(
                'INSERT INTO two_fa_backup_codes (user_id, code_hash) VALUES ($1, $2)',
                [userId, codeHash]
            );
        }
        
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Prüft ob ein Backup-Code gültig ist und markiert ihn als verwendet
 * @param {UUID} userId - User ID
 * @param {string} code - Backup-Code
 * @returns {Promise<boolean>}
 */
async function verifyAndUseBackupCode(userId, code) {
    const codeHash = hashBackupCode(code);
    
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Suche nach ungenutztem Backup-Code
        const result = await client.query(
            `SELECT id FROM two_fa_backup_codes 
             WHERE user_id = $1 AND code_hash = $2 AND used = FALSE`,
            [userId, codeHash]
        );
        
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return false;
        }
        
        // Markiere Code als verwendet
        await client.query(
            `UPDATE two_fa_backup_codes 
             SET used = TRUE, used_at = CURRENT_TIMESTAMP 
             WHERE id = $1`,
            [result.rows[0].id]
        );
        
        await client.query('COMMIT');
        return true;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Aktiviert 2FA für einen Benutzer
 * @param {UUID} userId - User ID
 * @param {string} secret - Base32 Secret
 * @param {Array<string>} backupCodes - Backup-Codes
 */
async function enable2FA(userId, secret, backupCodes) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Aktiviere 2FA in users-Tabelle
        await client.query(
            `UPDATE users 
             SET two_fa_enabled = TRUE, 
                 two_fa_secret = $1,
                 two_fa_enabled_at = CURRENT_TIMESTAMP
             WHERE id = $2`,
            [secret, userId]
        );
        
        // Speichere Backup-Codes
        await saveBackupCodes(userId, backupCodes);
        
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Deaktiviert 2FA für einen Benutzer
 * @param {UUID} userId - User ID
 */
async function disable2FA(userId) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Deaktiviere 2FA
        await client.query(
            `UPDATE users 
             SET two_fa_enabled = FALSE, 
                 two_fa_secret = NULL,
                 two_fa_enabled_at = NULL
             WHERE id = $1`,
            [userId]
        );
        
        // Lösche Backup-Codes
        await client.query(
            'DELETE FROM two_fa_backup_codes WHERE user_id = $1',
            [userId]
        );
        
        // Lösche 2FA-Sessions
        await client.query(
            'DELETE FROM two_fa_sessions WHERE user_id = $1',
            [userId]
        );
        
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Erstellt eine temporäre 2FA-Session nach erfolgreichem Login (1. Faktor)
 * @param {UUID} userId - User ID
 * @param {string} ipAddress - IP-Adresse
 * @returns {Promise<string>} - Temporärer Token
 */
async function create2FASession(userId, ipAddress) {
    const tempToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 Minuten
    
    await pool.query(
        `INSERT INTO two_fa_sessions (user_id, temp_token, expires_at, ip_address)
         VALUES ($1, $2, $3, $4)`,
        [userId, tempToken, expiresAt, ipAddress]
    );
    
    return tempToken;
}

/**
 * Verifiziert eine 2FA-Session
 * @param {string} tempToken - Temporärer Token
 * @returns {Promise<Object|null>} - Session-Daten oder null
 */
async function verify2FASession(tempToken) {
    const result = await pool.query(
        `SELECT user_id, verified, expires_at
         FROM two_fa_sessions
         WHERE temp_token = $1
         AND expires_at > CURRENT_TIMESTAMP`,
        [tempToken]
    );
    
    if (result.rows.length === 0) {
        return null;
    }
    
    return result.rows[0];
}

/**
 * Markiert eine 2FA-Session als verifiziert
 * @param {string} tempToken - Temporärer Token
 */
async function mark2FASessionVerified(tempToken) {
    await pool.query(
        `UPDATE two_fa_sessions
         SET verified = TRUE
         WHERE temp_token = $1`,
        [tempToken]
    );
}

/**
 * Löscht abgelaufene 2FA-Sessions (Cleanup)
 */
async function cleanupExpired2FASessions() {
    await pool.query(
        'DELETE FROM two_fa_sessions WHERE expires_at < CURRENT_TIMESTAMP'
    );
}

/**
 * Middleware: Erfordert 2FA-Verifizierung
 * Prüft ob User 2FA aktiviert hat und verifiziert ist
 */
function require2FA(req, res, next) {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ 
            error: 'Nicht authentifiziert',
            code: 'NOT_AUTHENTICATED'
        });
    }
    
    // Wenn User 2FA aktiviert hat, prüfe Verifizierung
    if (req.user.two_fa_enabled) {
        if (!req.user.two_fa_verified) {
            return res.status(403).json({
                error: '2FA-Verifizierung erforderlich',
                code: '2FA_REQUIRED',
                two_fa_required: true
            });
        }
    }
    
    next();
}

/**
 * Zählt verbleibende Backup-Codes
 * @param {UUID} userId - User ID
 * @returns {Promise<number>}
 */
async function getRemainingBackupCodesCount(userId) {
    const result = await pool.query(
        'SELECT COUNT(*) as count FROM two_fa_backup_codes WHERE user_id = $1 AND used = FALSE',
        [userId]
    );
    return parseInt(result.rows[0]?.count || 0);
}

module.exports = {
    // Secret & QR-Code
    generate2FASecret,
    
    // TOTP Verification
    verifyTOTP,
    
    // Backup-Codes
    generateBackupCodes,
    hashBackupCode,
    saveBackupCodes,
    verifyAndUseBackupCode,
    getRemainingBackupCodesCount,
    
    // Enable/Disable
    enable2FA,
    disable2FA,
    
    // Sessions
    create2FASession,
    verify2FASession,
    mark2FASessionVerified,
    cleanupExpired2FASessions,
    
    // Middleware
    require2FA
};
