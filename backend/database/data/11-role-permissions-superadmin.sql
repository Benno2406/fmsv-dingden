-- FMSV Dingden - Role Permissions: Superadmin
-- Super-Administrator: ALLE Berechtigungen

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'superadmin';
