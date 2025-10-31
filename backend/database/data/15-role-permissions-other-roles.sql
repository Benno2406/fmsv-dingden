-- FMSV Dingden - Role Permissions: Other Roles
-- Kassenwart, Schriftführer, Jugendwart, Fluglehrer

-- Kassenwart
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'kassenwart'
AND p.name IN (
    'members.view', 'members.view_all', 'members.view_details', 'members.edit', 'members.export',
    'articles.view',
    'events.view', 'events.view_all',
    'documents.view', 'documents.view_all', 'documents.upload',
    'protocols.view', 'protocols.view_all',
    'notifications.view',
    'statistics.view_basic',
    'security.manage_2fa'
);

-- Schriftführer
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'schriftfuehrer'
AND p.name IN (
    'members.view', 'members.view_all',
    'articles.view', 'articles.create', 'articles.edit',
    'events.view', 'events.view_all', 'events.create', 'events.edit',
    'documents.view', 'documents.view_all', 'documents.upload', 'documents.edit',
    'protocols.view', 'protocols.view_all', 'protocols.create', 'protocols.edit', 
    'protocols.edit_all', 'protocols.publish', 'protocols.export',
    'notifications.view', 'notifications.create',
    'security.manage_2fa'
);

-- Jugendwart
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'jugendwart'
AND p.name IN (
    'members.view',
    'articles.view', 'articles.create', 'articles.edit',
    'events.view', 'events.view_all', 'events.create', 'events.edit', 'events.edit_all',
    'images.view', 'images.view_all', 'images.upload', 'images.edit', 
    'galleries.create', 'galleries.edit',
    'documents.view', 'documents.view_all',
    'notifications.view', 'notifications.create',
    'security.manage_2fa'
);

-- Fluglehrer
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'fluglehrer'
AND p.name IN (
    'members.view',
    'articles.view',
    'events.view', 'events.view_all',
    'flugbuch.view', 'flugbuch.view_all', 'flugbuch.create', 'flugbuch.edit', 
    'flugbuch.edit_all', 'flugbuch.export', 'flugbuch.statistics',
    'documents.view', 'documents.view_all',
    'notifications.view',
    'security.manage_2fa'
);
