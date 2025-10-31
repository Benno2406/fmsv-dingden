const { Pool } = require('pg');
require('dotenv').config();

// Logger kommt später - erstmal minimales Logging
const logger = {
  info: console.log,
  error: console.error,
  debug: () => {}, // Debug deaktiviert für jetzt
  warn: console.warn
};

// PostgreSQL Connection Pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'fmsv_database',
  user: process.env.DB_USER || 'fmsv_user',
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
pool.on('connect', () => {
  logger.info('✅ PostgreSQL Verbindung hergestellt');
});

pool.on('error', (err) => {
  logger.error('❌ PostgreSQL Pool Fehler:', err);
  // NICHT process.exit() - sonst stirbt der Server komplett!
  // Der Pool wird automatisch neu verbinden
});

// Query helper with error handling and logging
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    // Nur Query-Typ loggen, nicht den gesamten Text (verhindert Stack Overflow)
    const queryType = text.trim().split(' ')[0];
    logger.debug(`Query ausgeführt: ${queryType}`, { duration, rows: result.rowCount });
    return result;
  } catch (error) {
    // Nur Fehler-Message loggen, nicht den gesamten Query-Text
    const queryType = text.trim().split(' ')[0];
    logger.error(`Query Fehler (${queryType}):`, error.message);
    throw error;
  }
};

// Transaction helper
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Get client for complex transactions
const getClient = () => pool.connect();

module.exports = pool;
module.exports.query = query;
module.exports.transaction = transaction;
module.exports.getClient = getClient;
