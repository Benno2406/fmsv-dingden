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
    logger.info(`📂 Working Directory: ${process.cwd()}`);
    logger.info(`📂 Script Directory: ${__dirname}`);

    // Read schema file
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    logger.info(`📄 Suche Schema-Datei: ${schemaPath}`);
    
    // Check if schema file exists
    if (!fs.existsSync(schemaPath)) {
      logger.error(`❌ Schema-Datei nicht gefunden: ${schemaPath}`);
      logger.error('');
      logger.error('Mögliche Ursachen:');
      logger.error('  • Datei wurde nicht vom Repository geklont');
      logger.error('  • Falsches Working Directory');
      logger.error('  • Dateiberechtigungen');
      logger.error('');
      logger.error(`Prüfe ob die Datei existiert mit: ls -la ${schemaPath}`);
      process.exit(1);
    }
    
    logger.info('✅ Schema-Datei gefunden');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    logger.info(`📊 Schema-Größe: ${schema.length} bytes`);

    // Test database connection
    logger.info('🔌 Teste Datenbankverbindung...');
    const client = await pool.connect();
    logger.info('✅ Datenbankverbindung erfolgreich');
    client.release();

    // Execute schema
    logger.info('⚙️  Führe Schema-SQL aus...');
    await pool.query(schema);

    logger.info('✅ Datenbank erfolgreich initialisiert!');
    logger.info('📊 Alle Tabellen, Indizes und Trigger wurden erstellt.');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    logger.error('❌ Fehler beim Initialisieren der Datenbank:');
    logger.error('');
    
    if (error.code) {
      logger.error(`Fehlercode: ${error.code}`);
    }
    
    if (error.code === 'ECONNREFUSED') {
      logger.error('PostgreSQL Server ist nicht erreichbar!');
      logger.error('');
      logger.error('Lösungen:');
      logger.error('  1. Prüfe ob PostgreSQL läuft: systemctl status postgresql');
      logger.error('  2. Starte PostgreSQL: systemctl start postgresql');
      logger.error('  3. Prüfe DB-Credentials in .env Datei');
    } else if (error.code === 'ENOTFOUND') {
      logger.error('Datenbank-Host nicht gefunden!');
      logger.error('Prüfe DB_HOST in .env Datei');
    } else if (error.message && error.message.includes('password authentication failed')) {
      logger.error('Datenbank-Authentifizierung fehlgeschlagen!');
      logger.error('Prüfe DB_USER und DB_PASSWORD in .env Datei');
    } else if (error.message && error.message.includes('database') && error.message.includes('does not exist')) {
      logger.error('Datenbank existiert nicht!');
      logger.error('Erstelle die Datenbank zuerst mit dem install.sh Script');
    } else {
      logger.error(error.message);
      if (error.stack) {
        logger.error('');
        logger.error('Stack Trace:');
        logger.error(error.stack);
      }
    }
    
    logger.error('');
    process.exit(1);
  }
}

initDatabase();
