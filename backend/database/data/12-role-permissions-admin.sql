-- FMSV Dingden - Role Permissions: Admin
-- Administrator: Fast alle (außer system.database_access)

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin'
AND p.name != 'system.database_access';
