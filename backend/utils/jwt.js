const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const logger = {
  info: console.log,
  error: console.error,
  warn: console.warn,
  debug: () => {}
};

// Generate Access Token (short-lived)
const generateAccessToken = (user, twoFAVerified = false) => {
  const payload = {
    id: user.id,
    email: user.email,
    isAdmin: user.is_admin,
    isMember: user.is_member,
    two_fa_verified: twoFAVerified // Für 2FA-Status
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

// Generate Refresh Token (long-lived)
const generateRefreshToken = async (userId, deviceInfo = null, ipAddress = null) => {
  const payload = { id: userId };
  
  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  // Store refresh token in database
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  try {
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at, device_info, ip_address, last_used_at) VALUES ($1, $2, $3, $4, $5, NOW())',
      [userId, refreshToken, expiresAt, deviceInfo, ipAddress]
    );
  } catch (error) {
    logger.error('Error storing refresh token:', error);
    throw error;
  }

  return refreshToken;
};

// Verify Access Token
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    logger.warn('Invalid access token:', error.message);
    return null;
  }
};

// Verify Refresh Token
const verifyRefreshToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    
    // Check if token exists in database
    const result = await pool.query(
      'SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
      [token]
    );

    if (result.rows.length === 0) {
      return null;
    }

    // Update last_used_at
    await pool.query(
      'UPDATE refresh_tokens SET last_used_at = NOW() WHERE token = $1',
      [token]
    );

    return decoded;
  } catch (error) {
    logger.warn('Invalid refresh token:', error.message);
    return null;
  }
};

// Revoke Refresh Token
const revokeRefreshToken = async (token) => {
  try {
    await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
    return true;
  } catch (error) {
    logger.error('Error revoking refresh token:', error);
    return false;
  }
};

// Revoke all user tokens (logout from all devices)
const revokeAllUserTokens = async (userId) => {
  try {
    await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
    return true;
  } catch (error) {
    logger.error('Error revoking all user tokens:', error);
    return false;
  }
};

// Clean expired tokens (run periodically)
const cleanExpiredTokens = async () => {
  try {
    const result = await pool.query('DELETE FROM refresh_tokens WHERE expires_at < NOW()');
    logger.info(`Cleaned ${result.rowCount} expired refresh tokens`);
    return result.rowCount;
  } catch (error) {
    logger.error('Error cleaning expired tokens:', error);
    return 0;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  cleanExpiredTokens
};
