import { query } from '../config/database.js';
import { logger } from '../utils/logger.js';

/**
 * Migration Script: Migrate from old is_admin/is_member system to RBAC
 * 
 * This script will:
 * 1. Assign "mitglied" role to all users with is_member = true
 * 2. Assign "webmaster" role to all users with is_admin = true
 * 3. Keep the old columns for backwards compatibility
 */

async function migrateToRBAC() {
  try {
    logger.info('🔄 Starting RBAC migration...');

    // Get role IDs
    const rolesResult = await query(`
      SELECT id, name FROM roles WHERE name IN ('mitglied', 'webmaster', 'vorstand')
    `);

    const roleMap = {};
    rolesResult.rows.forEach(role => {
      roleMap[role.name] = role.id;
    });

    if (!roleMap.mitglied || !roleMap.webmaster) {
      throw new Error('Required roles (mitglied, webmaster) not found in database. Please run schema.sql first.');
    }

    // Get all users
    const usersResult = await query(`
      SELECT id, email, is_admin, is_member FROM users WHERE is_active = true
    `);

    logger.info(`Found ${usersResult.rows.length} active users to migrate`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const user of usersResult.rows) {
      try {
        // Check if user already has roles assigned
        const existingRoles = await query(
          'SELECT COUNT(*) FROM user_roles WHERE user_id = $1',
          [user.id]
        );

        if (parseInt(existingRoles.rows[0].count) > 0) {
          logger.info(`⏭️  User ${user.email} already has roles assigned, skipping`);
          skippedCount++;
          continue;
        }

        // Assign roles based on old system
        const rolesToAssign = [];

        // All active users get "mitglied" role
        if (user.is_member) {
          rolesToAssign.push(roleMap.mitglied);
        }

        // Admins get "webmaster" role
        if (user.is_admin) {
          rolesToAssign.push(roleMap.webmaster);
        }

        // Assign roles
        for (const roleId of rolesToAssign) {
          await query(
            'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [user.id, roleId]
          );
        }

        logger.info(`✅ Migrated user ${user.email} - Assigned roles: ${rolesToAssign.length}`);
        migratedCount++;

      } catch (error) {
        logger.error(`❌ Error migrating user ${user.email}:`, error);
      }
    }

    logger.info('✅ RBAC migration completed!');
    logger.info(`   Migrated: ${migratedCount} users`);
    logger.info(`   Skipped: ${skippedCount} users (already had roles)`);
    logger.info(`   Total: ${usersResult.rows.length} users`);

    // Show statistics
    const statsResult = await query(`
      SELECT 
        r.name,
        r.display_name,
        COUNT(ur.user_id) as user_count
      FROM roles r
      LEFT JOIN user_roles ur ON r.id = ur.role_id
      GROUP BY r.id, r.name, r.display_name
      ORDER BY user_count DESC
    `);

    logger.info('\n📊 Role Statistics:');
    statsResult.rows.forEach(stat => {
      logger.info(`   ${stat.display_name}: ${stat.user_count} users`);
    });

  } catch (error) {
    logger.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateToRBAC()
    .then(() => {
      logger.info('Migration script completed successfully');
      process.exit(0);
    })
    .catch(error => {
      logger.error('Migration script failed:', error);
      process.exit(1);
    });
}

export { migrateToRBAC };
