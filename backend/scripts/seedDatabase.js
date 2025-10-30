import bcrypt from 'bcrypt';
import pool from '../config/database.js';
import { logger } from '../utils/logger.js';

async function seedDatabase() {
  try {
    logger.info('🌱 Füge Test-Daten hinzu...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    
    await pool.query(
      `INSERT INTO users 
       (email, password_hash, first_name, last_name, is_admin, is_member, is_active, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (email) DO NOTHING`,
      ['admin@fmsv-dingden.de', adminPassword, 'Admin', 'User', true, true, true, true]
    );

    logger.info('✅ Admin-Benutzer erstellt:');
    logger.info('   E-Mail: admin@fmsv-dingden.de');
    logger.info('   Passwort: admin123');
    logger.info('⚠️  BITTE ÄNDERE DAS PASSWORT NACH DEM ERSTEN LOGIN!');

    // Create test member
    const memberPassword = await bcrypt.hash('member123', 12);
    
    await pool.query(
      `INSERT INTO users 
       (email, password_hash, first_name, last_name, is_admin, is_member, is_active, email_verified, member_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (email) DO NOTHING`,
      ['member@fmsv-dingden.de', memberPassword, 'Test', 'Member', false, true, true, true, 'M001']
    );

    logger.info('✅ Test-Mitglied erstellt:');
    logger.info('   E-Mail: member@fmsv-dingden.de');
    logger.info('   Passwort: member123');

    // Create sample article
    await pool.query(
      `INSERT INTO articles 
       (title, slug, content, excerpt, category, is_published, published_at, author_id)
       SELECT 
         'Willkommen beim FMSV Dingden',
         'willkommen-fmsv-dingden',
         '<p>Herzlich willkommen auf der neuen Website des Flugmodellsportvereins Dingden!</p>',
         'Herzlich willkommen auf unserer neuen Website',
         'news',
         true,
         CURRENT_TIMESTAMP,
         id
       FROM users WHERE email = 'admin@fmsv-dingden.de'
       ON CONFLICT (slug) DO NOTHING`
    );

    logger.info('✅ Beispiel-Artikel erstellt');

    // Create sample event
    await pool.query(
      `INSERT INTO events 
       (title, description, start_date, end_date, location, is_public, created_by)
       SELECT 
         'Vereinstreffen',
         'Monatliches Vereinstreffen',
         CURRENT_TIMESTAMP + INTERVAL '7 days',
         CURRENT_TIMESTAMP + INTERVAL '7 days' + INTERVAL '2 hours',
         'Vereinsheim',
         true,
         id
       FROM users WHERE email = 'admin@fmsv-dingden.de'`
    );

    logger.info('✅ Beispiel-Termin erstellt');

    logger.info('🎉 Datenbank erfolgreich mit Test-Daten gefüllt!');
    
    process.exit(0);
  } catch (error) {
    logger.error('❌ Fehler beim Füllen der Datenbank:', error);
    process.exit(1);
  }
}

seedDatabase();
