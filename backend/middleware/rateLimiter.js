const rateLimit = require('express-rate-limit');
const { logger } = require('../utils/logger');
const { logAudit, AUDIT_ACTIONS } = require('../utils/audit');

// General API rate limiter
const generalLimiter = rateLimit({
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
const authLimiter = rateLimit({
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
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 uploads per hour
  message: {
    success: false,
    message: 'Upload-Limit erreicht. Bitte versuche es in einer Stunde erneut.'
  }
});

// Setup rate limiters
const setupRateLimiter = (app) => {
  app.use('/api/', generalLimiter);
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);
};

module.exports = {
  generalLimiter,
  authLimiter,
  uploadLimiter,
  setupRateLimiter
};
