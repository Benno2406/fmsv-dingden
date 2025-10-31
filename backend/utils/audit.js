const pool = require('../config/database');
const { logger } = require('./logger');
const fs = require('fs');
const path = require('path');

// Audit log in database AND file
const logAudit = async ({
  userId,
  userEmail,
  action,
  entityType = null,
  entityId = null,
  details = {},
  req = null
}) => {
  try {
    // Get IP and User Agent from request
    const ipAddress = req ? (req.ip || req.connection.remoteAddress) : null;
    const userAgent = req ? req.get('user-agent') : null;

    // Store in database
    await pool.query(
      `INSERT INTO audit_log 
       (user_id, user_email, action, entity_type, entity_id, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [userId, userEmail, action, entityType, entityId, JSON.stringify(details), ipAddress, userAgent]
    );

    // Also log to file for redundancy
    const auditLogPath = path.join(__dirname, '..', '..', 'Logs', 'Audit');
    const logFile = path.join(auditLogPath, `audit-${new Date().toISOString().split('T')[0]}.log`);
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      userId,
      userEmail,
      action,
      entityType,
      entityId,
      details,
      ipAddress,
      userAgent
    };

    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');

    logger.info('Audit log created', { action, userId, entityType });
  } catch (error) {
    logger.error('Failed to create audit log:', error);
  }
};

// Predefined audit actions
const AUDIT_ACTIONS = {
  // Authentication
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  LOGIN_FAILED: 'LOGIN_FAILED',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  TWO_FA_ENABLED: 'TWO_FA_ENABLED',
  TWO_FA_DISABLED: 'TWO_FA_DISABLED',
  
  // Users
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED',
  USER_ACTIVATED: 'USER_ACTIVATED',
  USER_DEACTIVATED: 'USER_DEACTIVATED',
  
  // Articles
  ARTICLE_CREATED: 'ARTICLE_CREATED',
  ARTICLE_UPDATED: 'ARTICLE_UPDATED',
  ARTICLE_DELETED: 'ARTICLE_DELETED',
  ARTICLE_PUBLISHED: 'ARTICLE_PUBLISHED',
  ARTICLE_UNPUBLISHED: 'ARTICLE_UNPUBLISHED',
  
  // Events
  EVENT_CREATED: 'EVENT_CREATED',
  EVENT_UPDATED: 'EVENT_UPDATED',
  EVENT_DELETED: 'EVENT_DELETED',
  
  // Images
  IMAGE_UPLOADED: 'IMAGE_UPLOADED',
  IMAGE_DELETED: 'IMAGE_DELETED',
  GALLERY_CREATED: 'GALLERY_CREATED',
  GALLERY_DELETED: 'GALLERY_DELETED',
  
  // Documents
  DOCUMENT_UPLOADED: 'DOCUMENT_UPLOADED',
  DOCUMENT_DELETED: 'DOCUMENT_DELETED',
  
  // Flugbuch
  FLIGHT_LOGGED: 'FLIGHT_LOGGED',
  FLIGHT_UPDATED: 'FLIGHT_UPDATED',
  FLIGHT_DELETED: 'FLIGHT_DELETED',
  
  // Protocols
  PROTOCOL_CREATED: 'PROTOCOL_CREATED',
  PROTOCOL_UPDATED: 'PROTOCOL_UPDATED',
  PROTOCOL_DELETED: 'PROTOCOL_DELETED',
  
  // Security
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // RBAC
  ROLE_ASSIGNED: 'ROLE_ASSIGNED',
  ROLE_REMOVED: 'ROLE_REMOVED',
  PERMISSION_GRANTED: 'PERMISSION_GRANTED',
  PERMISSION_REVOKED: 'PERMISSION_REVOKED'
};

module.exports = {
  logAudit,
  AUDIT_ACTIONS
};
module.exports.default = logAudit;
