-- FMSV Dingden - Role Permissions: Member Roles
-- Aktives Mitglied, Passives Mitglied, Ehrenmitglied, Gastmitglied

-- Aktives Mitglied
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'aktives_mitglied'
AND p.name IN (
    'members.view',
    'articles.view',
    'events.view', 'events.view_all',
    'flugbuch.view', 'flugbuch.create', 'flugbuch.edit',
    'images.view', 'images.upload', 'images.edit',
    'galleries.create', 'galleries.edit',
    'documents.view',
    'protocols.view',
    'notifications.view',
    'security.manage_2fa'
);

-- Passives Mitglied
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'passives_mitglied'
AND p.name IN (
    'members.view',
    'articles.view',
    'events.view',
    'documents.view',
    'protocols.view',
    'notifications.view',
    'security.manage_2fa'
);

-- Ehrenmitglied
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'ehrenmitglied'
AND p.name IN (
    'members.view',
    'articles.view',
    'events.view', 'events.view_all',
    'flugbuch.view',
    'images.view', 'images.upload',
    'documents.view', 'documents.view_all',
    'protocols.view',
    'notifications.view',
    'security.manage_2fa'
);

-- Gastmitglied
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'gastmitglied'
AND p.name IN (
    'articles.view',
    'events.view',
    'notifications.view',
    'security.manage_2fa'
);
