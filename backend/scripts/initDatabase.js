import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/database.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDatabase() {
  try {
    logger.info('🚀 Initialisiere Datenbank...');

    // Read schema file
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema
    await pool.query(schema);

    logger.info('✅ Datenbank erfolgreich initialisiert!');
    logger.info('📊 Alle Tabellen, Indizes und Trigger wurden erstellt.');
    
    process.exit(0);
  } catch (error) {
    logger.error('❌ Fehler beim Initialisieren der Datenbank:', error);
    process.exit(1);
  }
}

initDatabase();
