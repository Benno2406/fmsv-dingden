const fs = require('fs');
const path = require('path');
const pool = require('../config/database');
const { logger } = require('../utils/logger');

async function initDatabase() {
  const client = await pool.connect();
  
  try {
    logger.info('🚀 Initialisiere Datenbank...');
    logger.info(`📂 Working Directory: ${process.cwd()}`);
    
    // Test database connection
    logger.info('🔌 Teste Datenbankverbindung...');
    await client.query('SELECT NOW()');
    logger.info('✅ Datenbankverbindung erfolgreich');
    
    // Enable UUID extension
    logger.info('📦 Aktiviere UUID Extension...');
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    logger.info('✅ UUID Extension aktiviert');
    
    // Load table schemas in order
    logger.info('');
    logger.info('📊 Erstelle Tabellen...');
    logger.info('─'.repeat(60));
    
    const tableFiles = [
      '01-users.sql',
      '02-refresh_tokens.sql',
      '03-two_fa_sessions.sql',
      '04-two_fa_backup_codes.sql',
      '05-roles.sql',
      '06-permissions.sql',
      '07-role_permissions.sql',
      '08-user_roles.sql',
      '09-articles.sql',
      '10-events.sql',
      '11-flugbuch.sql',
      '12-images.sql',
      '13-protocols.sql',
      '14-notifications.sql',
      '15-audit_log.sql'
    ];
    
    for (const file of tableFiles) {
      const filePath = path.join(__dirname, '..', 'database', 'tables', file);
      
      if (!fs.existsSync(filePath)) {
        logger.error(`❌ Datei nicht gefunden: ${filePath}`);
        throw new Error(`Table file missing: ${file}`);
      }
      
      const sql = fs.readFileSync(filePath, 'utf8');
      const tableName = file.replace(/^\d+-/, '').replace('.sql', '');
      
      logger.info(`  📄 ${tableName}...`);
      
      try {
        await client.query(sql);
        logger.info(`  ✅ ${tableName} erstellt`);
      } catch (error) {
        logger.error(`  ❌ Fehler bei ${tableName}:`);
        logger.error(`     ${error.message}`);
        throw error;
      }
    }
    
    logger.info('─'.repeat(60));
    logger.info('✅ Alle Tabellen erfolgreich erstellt!');
    
    // Load initial data
    logger.info('');
    logger.info('📊 Lade Initial-Daten...');
    logger.info('─'.repeat(60));
    
    const dataFiles = [
      '01-roles.sql',
      '02-permissions-members.sql',
      '03-permissions-roles.sql',
      '04-permissions-articles.sql',
      '05-permissions-events.sql',
      '06-permissions-flugbuch.sql',
      '07-permissions-images.sql',
      '08-permissions-documents.sql',
      '09-permissions-protocols.sql',
      '10-permissions-other.sql',
      '11-role-permissions-superadmin.sql',
      '12-role-permissions-admin.sql',
      '13-role-permissions-vorstand.sql',
      '14-role-permissions-webmaster.sql',
      '15-role-permissions-other-roles.sql',
      '16-role-permissions-members.sql'
    ];
    
    for (const file of dataFiles) {
      const filePath = path.join(__dirname, '..', 'database', 'data', file);
      
      if (!fs.existsSync(filePath)) {
        logger.error(`❌ Datei nicht gefunden: ${filePath}`);
        throw new Error(`Data file missing: ${file}`);
      }
      
      const sql = fs.readFileSync(filePath, 'utf8');
      const dataName = file.replace(/^\d+-/, '').replace('.sql', '');
      
      logger.info(`  📄 ${dataName}...`);
      
      try {
        await client.query(sql);
        logger.info(`  ✅ ${dataName} geladen`);
      } catch (error) {
        logger.error(`  ❌ Fehler bei ${dataName}:`);
        logger.error(`     ${error.message}`);
        throw error;
      }
    }
    
    logger.info('─'.repeat(60));
    logger.info('✅ Alle Initial-Daten erfolgreich geladen!');
    
    // Summary
    logger.info('');
    logger.info('🎉 Datenbank-Initialisierung abgeschlossen!');
    logger.info('');
    logger.info('📊 Zusammenfassung:');
    logger.info(`   • ${tableFiles.length} Tabellen erstellt`);
    logger.info(`   • ${dataFiles.length} Datensätze geladen`);
    logger.info('   • RBAC-System vollständig konfiguriert');
    logger.info('   • 12 Rollen angelegt');
    logger.info('   • 100+ Permissions konfiguriert');
    logger.info('');
    
  } catch (error) {
    logger.error('');
    logger.error('❌ Datenbank-Initialisierung fehlgeschlagen!');
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
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run initialization
initDatabase()
  .then(() => {
    logger.info('✨ Fertig!');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Installation fehlgeschlagen!');
    process.exit(1);
  });
