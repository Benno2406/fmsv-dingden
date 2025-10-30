import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import { logger } from './logger.js';

// Generate Access Token (short-lived)
export const generateAccessToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    isAdmin: user.is_admin,
    isMember: user.is_member
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

// Generate Refresh Token (long-lived)
export const generateRefreshToken = async (userId) => {
  const payload = { id: userId };
  
  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  // Store refresh token in database
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  try {
    await query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [userId, refreshToken, expiresAt]
    );
  } catch (error) {
    logger.error('Error storing refresh token:', error);
    throw error;
  }

  return refreshToken;
};

// Verify Access Token
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    logger.warn('Invalid access token:', error.message);
    return null;
  }
};

// Verify Refresh Token
export const verifyRefreshToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    
    // Check if token exists in database
    const result = await query(
      'SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
      [token]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return decoded;
  } catch (error) {
    logger.warn('Invalid refresh token:', error.message);
    return null;
  }
};

// Revoke Refresh Token
export const revokeRefreshToken = async (token) => {
  try {
    await query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
    return true;
  } catch (error) {
    logger.error('Error revoking refresh token:', error);
    return false;
  }
};

// Revoke all user tokens (logout from all devices)
export const revokeAllUserTokens = async (userId) => {
  try {
    await query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
    return true;
  } catch (error) {
    logger.error('Error revoking all user tokens:', error);
    return false;
  }
};

// Clean expired tokens (run periodically)
export const cleanExpiredTokens = async () => {
  try {
    const result = await query('DELETE FROM refresh_tokens WHERE expires_at < NOW()');
    logger.info(`Cleaned ${result.rowCount} expired refresh tokens`);
    return result.rowCount;
  } catch (error) {
    logger.error('Error cleaning expired tokens:', error);
    return 0;
  }
};
