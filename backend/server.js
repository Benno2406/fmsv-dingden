const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
require('dotenv').config();
const path = require('path');

// Import utilities
const { logger } = require('./utils/logger');
const { errorHandler } = require('./middleware/errorHandler');
const { setupRateLimiter } = require('./middleware/rateLimiter');
const pool = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const articleRoutes = require('./routes/articles');
const eventRoutes = require('./routes/events');
const imageRoutes = require('./routes/images');
const flugbuchRoutes = require('./routes/flugbuch');
const protocolRoutes = require('./routes/protocols');
const notificationRoutes = require('./routes/notifications');
const rbacRoutes = require('./routes/rbac');

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS Configuration
app.use(cors({
  origin: process.env.BASE_URL || 'https://fmsv.bartholmes.eu',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parser & Compression
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// Rate Limiting
setupRateLimiter(app);

// Serve static files from Saves directory
app.use('/uploads', express.static(path.join(__dirname, '..', 'Saves')));

// Request Logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/flugbuch', flugbuchRoutes);
app.use('/api/protocols', protocolRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/rbac', rbacRoutes); // NEU: RBAC-Verwaltung

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint nicht gefunden'
  });
});

// Error Handler (must be last)
app.use(errorHandler);

// Test database connection before starting server
async function startServer() {
  try {
    // Test DB connection
    logger.info('🔍 Teste Datenbank-Verbindung...');
    await pool.query('SELECT NOW()');
    logger.info('✅ Datenbank-Verbindung erfolgreich');
    
    // Start Server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 FMSV Backend läuft auf Port ${PORT}`);
      logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 Base URL: ${process.env.BASE_URL || 'http://localhost:' + PORT}`);
      logger.info('');
      logger.info('🔐 RBAC-System: AKTIV');
      logger.info('🔑 2FA-Support: AKTIV');
      logger.info('📊 Upload-Limits: Pro Rolle konfigurierbar');
      logger.info('');
      logger.info('✨ Backend bereit!');
    }).on('error', (err) => {
      logger.error('❌ Server konnte nicht gestartet werden:', err);
      if (err.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} ist bereits belegt!`);
      }
      process.exit(1);
    });
    
  } catch (error) {
    logger.error('❌ Datenbank-Verbindung fehlgeschlagen:', error);
    logger.error('Überprüfe die .env Konfiguration:');
    logger.error(`  DB_HOST: ${process.env.DB_HOST || 'nicht gesetzt'}`);
    logger.error(`  DB_PORT: ${process.env.DB_PORT || 'nicht gesetzt'}`);
    logger.error(`  DB_NAME: ${process.env.DB_NAME || 'nicht gesetzt'}`);
    logger.error(`  DB_USER: ${process.env.DB_USER || 'nicht gesetzt'}`);
    logger.error(`  DB_PASSWORD: ${process.env.DB_PASSWORD ? '[***gesetzt***]' : 'nicht gesetzt'}`);
    process.exit(1);
  }
}

// Start the server
startServer();

// Graceful Shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM empfangen, fahre Server herunter...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT empfangen, fahre Server herunter...');
  process.exit(0);
});
