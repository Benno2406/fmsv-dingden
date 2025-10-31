const bcrypt = require('bcrypt');
const pool = require('../config/database');
const { logger } = require('../utils/logger');

async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    logger.info('🌱 Füge Test-Daten hinzu...');

    // Create admin user
    logger.info('📝 Erstelle Admin-Benutzer...');
    const adminPassword = await bcrypt.hash('admin123', 12);
    
    await client.query(
      `INSERT INTO users 
       (email, password_hash, first_name, last_name, is_admin, is_member, is_active, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (email) DO NOTHING`,
      ['admin@fmsv-dingden.de', adminPassword, 'Admin', 'User', true, true, true, true]
    );

    logger.info('✅ Admin-Benutzer erstellt:');
    logger.info('   E-Mail: admin@fmsv-dingden.de');
    logger.info('   Passwort: admin123');
    logger.info('   ⚠️  BITTE ÄNDERE DAS PASSWORT NACH DEM ERSTEN LOGIN!');

    // Assign admin to superadmin role
    logger.info('📝 Weise Admin die Superadmin-Rolle zu...');
    await client.query(
      `INSERT INTO user_roles (user_id, role_id)
       SELECT u.id, r.id
       FROM users u
       CROSS JOIN roles r
       WHERE u.email = 'admin@fmsv-dingden.de' 
       AND r.name = 'superadmin'
       ON CONFLICT DO NOTHING`
    );
    logger.info('✅ Superadmin-Rolle zugewiesen');

    // Create test member
    logger.info('📝 Erstelle Test-Mitglied...');
    const memberPassword = await bcrypt.hash('member123', 12);
    
    await client.query(
      `INSERT INTO users 
       (email, password_hash, first_name, last_name, is_admin, is_member, is_active, email_verified, member_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (email) DO NOTHING`,
      ['member@fmsv-dingden.de', memberPassword, 'Test', 'Member', false, true, true, true, 'M001']
    );

    // Assign member to active member role
    await client.query(
      `INSERT INTO user_roles (user_id, role_id)
       SELECT u.id, r.id
       FROM users u
       CROSS JOIN roles r
       WHERE u.email = 'member@fmsv-dingden.de' 
       AND r.name = 'aktives_mitglied'
       ON CONFLICT DO NOTHING`
    );

    logger.info('✅ Test-Mitglied erstellt:');
    logger.info('   E-Mail: member@fmsv-dingden.de');
    logger.info('   Passwort: member123');

    // Create sample article
    logger.info('📝 Erstelle Beispiel-Artikel...');
    await client.query(
      `INSERT INTO articles 
       (title, slug, content, excerpt, category, is_published, published_at, author_id)
       SELECT 
         'Willkommen beim FMSV Dingden',
         'willkommen-fmsv-dingden',
         '<p>Herzlich willkommen auf der neuen Website des Flugmodellsportvereins Dingden!</p><p>Wir freuen uns, euch unsere komplett überarbeitete Website präsentieren zu können.</p>',
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
    logger.info('📝 Erstelle Beispiel-Termin...');
    await client.query(
      `INSERT INTO events 
       (title, description, start_date, end_date, location, is_public, created_by)
       SELECT 
         'Vereinstreffen',
         'Monatliches Vereinstreffen im Vereinsheim',
         CURRENT_TIMESTAMP + INTERVAL '7 days',
         CURRENT_TIMESTAMP + INTERVAL '7 days' + INTERVAL '2 hours',
         'Vereinsheim',
         true,
         id
       FROM users WHERE email = 'admin@fmsv-dingden.de'`
    );

    logger.info('✅ Beispiel-Termin erstellt');

    logger.info('');
    logger.info('🎉 Datenbank erfolgreich mit Test-Daten gefüllt!');
    logger.info('');
    logger.info('📊 Zusammenfassung:');
    logger.info('   • 2 Test-Benutzer erstellt');
    logger.info('   • Rollen zugewiesen');
    logger.info('   • 1 Beispiel-Artikel erstellt');
    logger.info('   • 1 Beispiel-Termin erstellt');
    logger.info('');
    logger.info('🔐 Login-Daten:');
    logger.info('   Admin:  admin@fmsv-dingden.de / admin123');
    logger.info('   Member: member@fmsv-dingden.de / member123');
    logger.info('');
    
  } catch (error) {
    logger.error('');
    logger.error('❌ Fehler beim Füllen der Datenbank:');
    logger.error('');
    logger.error(error.message);
    
    if (error.code) {
      logger.error(`Fehlercode: ${error.code}`);
    }
    
    if (error.constraint) {
      logger.error(`Constraint: ${error.constraint}`);
    }
    
    logger.error('');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run seeding
seedDatabase()
  .then(() => {
    logger.info('✨ Fertig!');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Seeding fehlgeschlagen!');
    process.exit(1);
  });
