/**
 * Database Admin Routes
 * Nur für Webmaster zugänglich!
 * Ermöglicht Datenbank-Management direkt im Browser
 */

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, requireRoles } = require('../middleware/auth');
const { auditLog } = require('../utils/audit');

// Alle Routes nur für Webmaster
router.use(authenticateToken);
router.use(requireRoles(['webmaster']));

/**
 * GET /api/database/tables
 * Liste aller Tabellen
 */
router.get('/tables', async (req, res, next) => {
    try {
        const result = await pool.query(`
            SELECT 
                table_name,
                (SELECT COUNT(*) FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = t.table_name) as column_count,
                pg_size_pretty(pg_total_relation_size(quote_ident(table_name)::regclass)) as size
            FROM information_schema.tables t
            WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);

        // Für jede Tabelle die Row-Count holen
        const tablesWithCounts = await Promise.all(
            result.rows.map(async (table) => {
                const countResult = await pool.query(
                    `SELECT COUNT(*) FROM ${table.table_name}`
                );
                return {
                    ...table,
                    row_count: parseInt(countResult.rows[0].count)
                };
            })
        );

        await auditLog(
            req.user.id,
            'database_tables_view',
            'database',
            null,
            req.ip
        );

        res.json(tablesWithCounts);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/database/tables/:tableName/schema
 * Schema einer Tabelle
 */
router.get('/tables/:tableName/schema', async (req, res, next) => {
    try {
        const { tableName } = req.params;

        // Validierung: Nur existierende Tabellen
        const tableExists = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = $1
            )
        `, [tableName]);

        if (!tableExists.rows[0].exists) {
            return res.status(404).json({ error: 'Tabelle nicht gefunden' });
        }

        // Spalten-Informationen
        const columns = await pool.query(`
            SELECT 
                column_name,
                data_type,
                character_maximum_length,
                is_nullable,
                column_default
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = $1
            ORDER BY ordinal_position
        `, [tableName]);

        // Constraints (Primary Keys, Foreign Keys, etc.)
        const constraints = await pool.query(`
            SELECT
                tc.constraint_name,
                tc.constraint_type,
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
            FROM information_schema.table_constraints tc
            LEFT JOIN information_schema.key_column_usage kcu
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
            LEFT JOIN information_schema.constraint_column_usage ccu
                ON ccu.constraint_name = tc.constraint_name
                AND ccu.table_schema = tc.table_schema
            WHERE tc.table_schema = 'public'
            AND tc.table_name = $1
        `, [tableName]);

        // Indizes
        const indexes = await pool.query(`
            SELECT
                indexname,
                indexdef
            FROM pg_indexes
            WHERE schemaname = 'public'
            AND tablename = $1
        `, [tableName]);

        await auditLog(
            req.user.id,
            'database_schema_view',
            'database',
            tableName,
            req.ip
        );

        res.json({
            table_name: tableName,
            columns: columns.rows,
            constraints: constraints.rows,
            indexes: indexes.rows
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/database/tables/:tableName/data
 * Daten einer Tabelle (mit Pagination)
 */
router.get('/tables/:tableName/data', async (req, res, next) => {
    try {
        const { tableName } = req.params;
        const { page = 1, limit = 50, orderBy = null, orderDir = 'ASC' } = req.query;

        // Validierung
        const tableExists = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = $1
            )
        `, [tableName]);

        if (!tableExists.rows[0].exists) {
            return res.status(404).json({ error: 'Tabelle nicht gefunden' });
        }

        // Validiere orderBy (nur existierende Spalten erlauben)
        let orderClause = '';
        if (orderBy) {
            const columnExists = await pool.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.columns
                    WHERE table_schema = 'public'
                    AND table_name = $1
                    AND column_name = $2
                )
            `, [tableName, orderBy]);

            if (columnExists.rows[0].exists) {
                const safeOrderDir = orderDir.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
                orderClause = `ORDER BY "${orderBy}" ${safeOrderDir}`;
            }
        }

        // Total count
        const countResult = await pool.query(`SELECT COUNT(*) FROM ${tableName}`);
        const totalRows = parseInt(countResult.rows[0].count);

        // Data mit Pagination
        const offset = (page - 1) * limit;
        const dataResult = await pool.query(`
            SELECT * FROM ${tableName}
            ${orderClause}
            LIMIT $1 OFFSET $2
        `, [limit, offset]);

        await auditLog(
            req.user.id,
            'database_data_view',
            'database',
            tableName,
            req.ip
        );

        res.json({
            table_name: tableName,
            total_rows: totalRows,
            page: parseInt(page),
            limit: parseInt(limit),
            total_pages: Math.ceil(totalRows / limit),
            data: dataResult.rows
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/database/query
 * SQL Query ausführen (READ-ONLY für mehr Sicherheit)
 */
router.post('/query', async (req, res, next) => {
    try {
        const { query, readonly = true } = req.body;

        if (!query || typeof query !== 'string') {
            return res.status(400).json({ error: 'SQL Query erforderlich' });
        }

        // Sicherheits-Check: Nur SELECT erlauben wenn readonly=true
        if (readonly) {
            const trimmedQuery = query.trim().toUpperCase();
            if (!trimmedQuery.startsWith('SELECT') && 
                !trimmedQuery.startsWith('SHOW') && 
                !trimmedQuery.startsWith('DESCRIBE')) {
                return res.status(403).json({ 
                    error: 'Nur SELECT Queries erlaubt im Read-Only Modus' 
                });
            }
        }

        // Query Timeout (max 30 Sekunden)
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Query Timeout (30s)')), 30000);
        });

        const queryPromise = pool.query(query);

        const result = await Promise.race([queryPromise, timeoutPromise]);

        await auditLog(
            req.user.id,
            'database_query',
            'database',
            query.substring(0, 200), // Ersten 200 Zeichen loggen
            req.ip
        );

        res.json({
            rows: result.rows,
            rowCount: result.rowCount,
            fields: result.fields?.map(f => ({
                name: f.name,
                dataTypeID: f.dataTypeID
            }))
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/database/backup
 * Trigger Database Backup (erstellt pg_dump)
 */
router.post('/backup', async (req, res, next) => {
    try {
        const { exec } = require('child_process');
        const fs = require('fs').promises;
        const path = require('path');

        const backupDir = path.join(__dirname, '../../backups');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(backupDir, `fmsv_backup_${timestamp}.sql`);

        // Backup-Verzeichnis erstellen falls nicht vorhanden
        await fs.mkdir(backupDir, { recursive: true });

        // pg_dump ausführen
        const dbConfig = require('../config/database');
        const dumpCommand = `PGPASSWORD="${process.env.DB_PASSWORD}" pg_dump -h ${process.env.DB_HOST} -U ${process.env.DB_USER} -d ${process.env.DB_NAME} -F p -f ${backupFile}`;

        exec(dumpCommand, async (error, stdout, stderr) => {
            if (error) {
                await auditLog(
                    req.user.id,
                    'database_backup_failed',
                    'database',
                    error.message,
                    req.ip
                );
                return res.status(500).json({ error: 'Backup fehlgeschlagen', details: stderr });
            }

            await auditLog(
                req.user.id,
                'database_backup_created',
                'database',
                backupFile,
                req.ip
            );

            res.json({
                success: true,
                backup_file: backupFile,
                timestamp
            });
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/database/stats
 * Datenbank-Statistiken
 */
router.get('/stats', async (req, res, next) => {
    try {
        // Database Size
        const sizeResult = await pool.query(`
            SELECT pg_size_pretty(pg_database_size(current_database())) as size
        `);

        // Connection Stats
        const connectionsResult = await pool.query(`
            SELECT 
                count(*) as total,
                count(*) FILTER (WHERE state = 'active') as active,
                count(*) FILTER (WHERE state = 'idle') as idle
            FROM pg_stat_activity
            WHERE datname = current_database()
        `);

        // Table Stats
        const tableStatsResult = await pool.query(`
            SELECT 
                schemaname,
                COUNT(*) as table_count,
                pg_size_pretty(SUM(pg_total_relation_size(schemaname||'.'||tablename))::bigint) as total_size
            FROM pg_tables
            WHERE schemaname = 'public'
            GROUP BY schemaname
        `);

        // Recent Activity
        const activityResult = await pool.query(`
            SELECT 
                usename,
                datname,
                state,
                query_start,
                state_change,
                LEFT(query, 100) as query_preview
            FROM pg_stat_activity
            WHERE datname = current_database()
            AND state != 'idle'
            ORDER BY query_start DESC
            LIMIT 10
        `);

        res.json({
            database_size: sizeResult.rows[0].size,
            connections: connectionsResult.rows[0],
            tables: tableStatsResult.rows[0],
            recent_activity: activityResult.rows
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/database/health
 * Health Check
 */
router.get('/health', async (req, res, next) => {
    try {
        const result = await pool.query('SELECT NOW() as server_time, version() as version');
        
        res.json({
            status: 'healthy',
            server_time: result.rows[0].server_time,
            postgres_version: result.rows[0].version,
            pool_total: pool.totalCount,
            pool_idle: pool.idleCount,
            pool_waiting: pool.waitingCount
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
