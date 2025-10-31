-- FMSV Dingden - Role Permissions: Webmaster
-- Webmaster: Technische & Content-Rechte

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'webmaster'
AND (
    p.category IN ('articles', 'events', 'images', 'documents', 'system', 'statistics')
    OR p.name IN ('members.view', 'members.view_all', 'audit.view', 'notifications.create', 'notifications.send_all')
);
