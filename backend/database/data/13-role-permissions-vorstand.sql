-- FMSV Dingden - Role Permissions: Vorstand
-- Vorstand: Erweiterte Rechte

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'vorstand'
AND p.name IN (
    'members.view', 'members.view_all', 'members.view_details', 'members.edit', 'members.export',
    'articles.view', 'articles.view_unpublished', 'articles.create', 'articles.edit', 'articles.edit_all', 'articles.publish',
    'events.view', 'events.view_all', 'events.create', 'events.edit', 'events.edit_all',
    'flugbuch.view', 'flugbuch.view_all', 'flugbuch.export', 'flugbuch.statistics',
    'images.view', 'images.view_all', 'images.upload', 'images.edit', 'images.edit_all', 
    'galleries.create', 'galleries.edit', 'galleries.edit_all',
    'documents.view', 'documents.view_all', 'documents.upload', 'documents.edit', 'documents.edit_all',
    'protocols.view', 'protocols.view_all', 'protocols.create', 'protocols.edit', 'protocols.edit_all', 
    'protocols.publish', 'protocols.export',
    'notifications.view', 'notifications.create', 'notifications.send_all',
    'statistics.view_basic', 'statistics.view_advanced', 'statistics.export',
    'audit.view', 'audit.export',
    'security.manage_2fa', 'security.view_sessions'
);
