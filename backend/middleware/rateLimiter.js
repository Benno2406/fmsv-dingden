import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger.js';
import { logAudit, AUDIT_ACTIONS } from '../utils/audit.js';

// General API rate limiter
export const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Zu viele Anfragen. Bitte versuche es später erneut.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path
    });

    logAudit({
      userId: req.user?.id || null,
      userEmail: req.user?.email || null,
      action: AUDIT_ACTIONS.RATE_LIMIT_EXCEEDED,
      details: { path: req.path },
      req
    });

    res.status(429).json({
      success: false,
      message: 'Zu viele Anfragen. Bitte versuche es später erneut.'
    });
  }
});

// Strict limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Zu viele Login-Versuche. Bitte warte 15 Minuten.'
  },
  handler: (req, res) => {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      email: req.body?.email
    });

    logAudit({
      userId: null,
      userEmail: req.body?.email || null,
      action: AUDIT_ACTIONS.RATE_LIMIT_EXCEEDED,
      details: { endpoint: 'auth', path: req.path },
      req
    });

    res.status(429).json({
      success: false,
      message: 'Zu viele Login-Versuche. Bitte warte 15 Minuten.'
    });
  }
});

// Upload limiter
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 uploads per hour
  message: {
    success: false,
    message: 'Upload-Limit erreicht. Bitte versuche es in einer Stunde erneut.'
  }
});

// Setup rate limiters
export const setupRateLimiter = (app) => {
  app.use('/api/', generalLimiter);
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);
};
