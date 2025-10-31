// RBAC Middleware - Role-Based Access Control
// Überprüft Permissions basierend auf Benutzer-Rollen

const pool = require('../config/database');

/**
 * Lädt alle Permissions eines Users aus der Datenbank
 * @param {UUID} userId - User ID
 * @returns {Promise<Array<string>>} - Array von Permission-Namen
 */
async function getUserPermissions(userId) {
    try {
        const result = await pool.query(`
            SELECT DISTINCT p.name
            FROM permissions p
            JOIN role_permissions rp ON p.id = rp.permission_id
            JOIN user_roles ur ON rp.role_id = ur.role_id
            WHERE ur.user_id = $1
            AND EXISTS (
                SELECT 1 FROM roles r
                WHERE r.id = ur.role_id
                AND r.is_active = TRUE
            )
        `, [userId]);
        
        return result.rows.map(row => row.name);
    } catch (error) {
        console.error('Error loading user permissions:', error);
        return [];
    }
}

/**
 * Lädt alle Rollen eines Users
 * @param {UUID} userId - User ID
 * @returns {Promise<Array<Object>>} - Array von Rollen-Objekten
 */
async function getUserRoles(userId) {
    try {
        const result = await pool.query(`
            SELECT r.id, r.name, r.display_name, r.level, 
                   r.max_upload_size_mb, r.max_total_storage_mb
            FROM roles r
            JOIN user_roles ur ON r.id = ur.role_id
            WHERE ur.user_id = $1
            AND r.is_active = TRUE
            ORDER BY r.level DESC
        `, [userId]);
        
        return result.rows;
    } catch (error) {
        console.error('Error loading user roles:', error);
        return [];
    }
}

/**
 * Prüft ob User eine bestimmte Permission hat
 * @param {UUID} userId - User ID
 * @param {string} permissionName - Name der Permission (z.B. 'articles.edit')
 * @returns {Promise<boolean>}
 */
async function hasPermission(userId, permissionName) {
    try {
        const result = await pool.query(`
            SELECT EXISTS (
                SELECT 1
                FROM permissions p
                JOIN role_permissions rp ON p.id = rp.permission_id
                JOIN user_roles ur ON rp.role_id = ur.role_id
                JOIN roles r ON ur.role_id = r.id
                WHERE ur.user_id = $1
                AND p.name = $2
                AND r.is_active = TRUE
            ) as has_permission
        `, [userId, permissionName]);
        
        return result.rows[0]?.has_permission || false;
    } catch (error) {
        console.error('Error checking permission:', error);
        return false;
    }
}

/**
 * Prüft ob User EINE VON mehreren Permissions hat (OR)
 * @param {UUID} userId - User ID
 * @param {Array<string>} permissionNames - Array von Permission-Namen
 * @returns {Promise<boolean>}
 */
async function hasAnyPermission(userId, permissionNames) {
    if (!permissionNames || permissionNames.length === 0) return false;
    
    try {
        const result = await pool.query(`
            SELECT EXISTS (
                SELECT 1
                FROM permissions p
                JOIN role_permissions rp ON p.id = rp.permission_id
                JOIN user_roles ur ON rp.role_id = ur.role_id
                JOIN roles r ON ur.role_id = r.id
                WHERE ur.user_id = $1
                AND p.name = ANY($2)
                AND r.is_active = TRUE
            ) as has_permission
        `, [userId, permissionNames]);
        
        return result.rows[0]?.has_permission || false;
    } catch (error) {
        console.error('Error checking any permission:', error);
        return false;
    }
}

/**
 * Prüft ob User ALLE gegebenen Permissions hat (AND)
 * @param {UUID} userId - User ID
 * @param {Array<string>} permissionNames - Array von Permission-Namen
 * @returns {Promise<boolean>}
 */
async function hasAllPermissions(userId, permissionNames) {
    if (!permissionNames || permissionNames.length === 0) return true;
    
    for (const permission of permissionNames) {
        if (!await hasPermission(userId, permission)) {
            return false;
        }
    }
    
    return true;
}

/**
 * Middleware: Erfordert eine spezifische Permission
 * @param {string} permissionName - Name der erforderlichen Permission
 */
function requirePermission(permissionName) {
    return async (req, res, next) => {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ 
                error: 'Nicht authentifiziert',
                code: 'NOT_AUTHENTICATED'
            });
        }
        
        const userId = req.user.id;
        
        // Super-Admin Bypass (optional)
        if (req.user.is_admin === true) {
            return next();
        }
        
        const allowed = await hasPermission(userId, permissionName);
        
        if (!allowed) {
            return res.status(403).json({ 
                error: 'Fehlende Berechtigung',
                required_permission: permissionName,
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }
        
        next();
    };
}

/**
 * Middleware: Erfordert EINE VON mehreren Permissions (OR)
 * @param {Array<string>} permissionNames - Array von Permission-Namen
 */
function requireAnyPermission(permissionNames) {
    return async (req, res, next) => {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ 
                error: 'Nicht authentifiziert',
                code: 'NOT_AUTHENTICATED'
            });
        }
        
        const userId = req.user.id;
        
        // Super-Admin Bypass
        if (req.user.is_admin === true) {
            return next();
        }
        
        const allowed = await hasAnyPermission(userId, permissionNames);
        
        if (!allowed) {
            return res.status(403).json({ 
                error: 'Fehlende Berechtigung',
                required_permissions_any_of: permissionNames,
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }
        
        next();
    };
}

/**
 * Middleware: Erfordert ALLE gegebenen Permissions (AND)
 * @param {Array<string>} permissionNames - Array von Permission-Namen
 */
function requireAllPermissions(permissionNames) {
    return async (req, res, next) => {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ 
                error: 'Nicht authentifiziert',
                code: 'NOT_AUTHENTICATED'
            });
        }
        
        const userId = req.user.id;
        
        // Super-Admin Bypass
        if (req.user.is_admin === true) {
            return next();
        }
        
        const allowed = await hasAllPermissions(userId, permissionNames);
        
        if (!allowed) {
            return res.status(403).json({ 
                error: 'Fehlende Berechtigung',
                required_permissions_all: permissionNames,
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }
        
        next();
    };
}

/**
 * Middleware: Erfordert eine bestimmte Rolle (direkt)
 * @param {string} roleName - Name der Rolle
 */
function requireRole(roleName) {
    return async (req, res, next) => {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ 
                error: 'Nicht authentifiziert',
                code: 'NOT_AUTHENTICATED'
            });
        }
        
        const userId = req.user.id;
        
        try {
            const result = await pool.query(`
                SELECT EXISTS (
                    SELECT 1
                    FROM user_roles ur
                    JOIN roles r ON ur.role_id = r.id
                    WHERE ur.user_id = $1
                    AND r.name = $2
                    AND r.is_active = TRUE
                ) as has_role
            `, [userId, roleName]);
            
            if (!result.rows[0]?.has_role) {
                return res.status(403).json({ 
                    error: 'Fehlende Rolle',
                    required_role: roleName,
                    code: 'INSUFFICIENT_ROLE'
                });
            }
            
            next();
        } catch (error) {
            console.error('Error checking role:', error);
            return res.status(500).json({ error: 'Fehler bei Rollen-Prüfung' });
        }
    };
}

/**
 * Middleware: Erfordert minimales Rollen-Level
 * @param {number} minLevel - Minimales Level (z.B. 500 für aktives_mitglied)
 */
function requireMinLevel(minLevel) {
    return async (req, res, next) => {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ 
                error: 'Nicht authentifiziert',
                code: 'NOT_AUTHENTICATED'
            });
        }
        
        const userId = req.user.id;
        
        try {
            const result = await pool.query(`
                SELECT MAX(r.level) as max_level
                FROM user_roles ur
                JOIN roles r ON ur.role_id = r.id
                WHERE ur.user_id = $1
                AND r.is_active = TRUE
            `, [userId]);
            
            const userLevel = result.rows[0]?.max_level || 0;
            
            if (userLevel < minLevel) {
                return res.status(403).json({ 
                    error: 'Unzureichendes Berechtigungslevel',
                    required_level: minLevel,
                    user_level: userLevel,
                    code: 'INSUFFICIENT_LEVEL'
                });
            }
            
            next();
        } catch (error) {
            console.error('Error checking level:', error);
            return res.status(500).json({ error: 'Fehler bei Level-Prüfung' });
        }
    };
}

/**
 * Holt User-Upload-Limits basierend auf höchster Rolle
 * @param {UUID} userId - User ID
 * @returns {Promise<Object>} - {maxUploadSizeMB, maxTotalStorageMB}
 */
async function getUserUploadLimits(userId) {
    try {
        const result = await pool.query(`
            SELECT 
                MAX(r.max_upload_size_mb) as max_upload_size_mb,
                MAX(r.max_total_storage_mb) as max_total_storage_mb
            FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = $1
            AND r.is_active = TRUE
        `, [userId]);
        
        return {
            maxUploadSizeMB: result.rows[0]?.max_upload_size_mb || 5,
            maxTotalStorageMB: result.rows[0]?.max_total_storage_mb || 100
        };
    } catch (error) {
        console.error('Error getting upload limits:', error);
        return { maxUploadSizeMB: 5, maxTotalStorageMB: 100 };
    }
}

module.exports = {
    // Funktionen
    getUserPermissions,
    getUserRoles,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getUserUploadLimits,
    
    // Middleware
    requirePermission,
    requireAnyPermission,
    requireAllPermissions,
    requireRole,
    requireMinLevel
};
