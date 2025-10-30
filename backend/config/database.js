import pg from 'pg';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';

dotenv.config();

const { Pool } = pg;

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
  process.exit(-1);
});

// Query helper with error handling and logging
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Query ausgeführt', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    logger.error('Query Fehler:', { text, error: error.message });
    throw error;
  }
};

// Transaction helper
export const transaction = async (callback) => {
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
export const getClient = () => pool.connect();

export default pool;
