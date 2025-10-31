-- FMSV Dingden - Initial Data
-- Roles & Permissions Setup

-- ============================================
-- SYSTEM-ROLLEN (12 Rollen)
-- ============================================

INSERT INTO roles (name, display_name, description, level, max_upload_size_mb, max_total_storage_mb, is_system_role) VALUES
('superadmin', 'Super-Administrator', 'Volle System-Kontrolle, alle Berechtigungen', 1000, 500, 10000, TRUE),
('admin', 'Administrator', 'Vollständige Verwaltungsrechte', 900, 200, 5000, TRUE),
('vorstand', 'Vorstand', 'Vorstandsmitglied mit erweiterten Rechten', 800, 100, 2000, TRUE),
('webmaster', 'Webmaster', 'Technische Administration und Content-Management', 750, 150, 3000, TRUE),
('kassenwart', 'Kassenwart', 'Finanz- und Mitgliederverwaltung', 700, 50, 1000, TRUE),
('schriftfuehrer', 'Schriftführer', 'Protokoll- und Dokumentenverwaltung', 650, 50, 1000, TRUE),
('jugendwart', 'Jugendwart', 'Jugendarbeit und Veranstaltungen', 600, 50, 1000, TRUE),
('fluglehrer', 'Fluglehrer', 'Flugbuch und Schulungsverwaltung', 550, 30, 500, TRUE),
('aktives_mitglied', 'Aktives Mitglied', 'Vollmitglied mit Standardrechten', 500, 20, 300, TRUE),
('passives_mitglied', 'Passives Mitglied', 'Eingeschränkte Mitgliederrechte', 400, 10, 100, TRUE),
('ehrenmitglied', 'Ehrenmitglied', 'Ehrenmitglied mit erweiterten Rechten', 450, 20, 300, TRUE),
('gastmitglied', 'Gastmitglied', 'Temporäres Mitglied, eingeschränkte Rechte', 300, 5, 50, TRUE);

-- ============================================
-- PERMISSIONS (100+ Berechtigungen)
-- ============================================

INSERT INTO permissions (name, display_name, description, category) VALUES
-- Kategorie: Mitglieder (members)
('members.view', 'Mitglieder ansehen', 'Mitgliederliste und Profile ansehen', 'members'),
('members.view_all', 'Alle Mitglieder ansehen', 'Auch inaktive und gesperrte Mitglieder', 'members'),
('members.view_details', 'Mitgliederdetails ansehen', 'Vollständige Kontaktdaten einsehen', 'members'),
('members.create', 'Mitglieder anlegen', 'Neue Mitglieder erstellen', 'members'),
('members.edit', 'Mitglieder bearbeiten', 'Mitgliederdaten ändern', 'members'),
('members.delete', 'Mitglieder löschen', 'Mitglieder endgültig löschen', 'members'),
('members.activate', 'Mitglieder aktivieren', 'Mitglieder aktivieren/deaktivieren', 'members'),
('members.lock', 'Mitglieder sperren', 'Accounts sperren/entsperren', 'members'),
('members.export', 'Mitglieder exportieren', 'Mitgliederdaten exportieren', 'members'),
('members.import', 'Mitglieder importieren', 'Mitgliederdaten importieren', 'members'),

-- Kategorie: Rollen & Berechtigungen (roles)
('roles.view', 'Rollen ansehen', 'Rollenliste ansehen', 'roles'),
('roles.create', 'Rollen erstellen', 'Neue Rollen anlegen', 'roles'),
('roles.edit', 'Rollen bearbeiten', 'Rollen-Einstellungen ändern', 'roles'),
('roles.delete', 'Rollen löschen', 'Nicht-System-Rollen löschen', 'roles'),
('roles.assign', 'Rollen zuweisen', 'Benutzern Rollen zuweisen', 'roles'),
('permissions.view', 'Berechtigungen ansehen', 'Berechtigungen einsehen', 'roles'),
('permissions.manage', 'Berechtigungen verwalten', 'Berechtigungen zuweisen/entziehen', 'roles'),

-- Kategorie: Artikel & News (articles)
('articles.view', 'Artikel ansehen', 'Veröffentlichte Artikel lesen', 'articles'),
('articles.view_unpublished', 'Unveröffentlichte Artikel ansehen', 'Entwürfe ansehen', 'articles'),
('articles.create', 'Artikel erstellen', 'Neue Artikel/News erstellen', 'articles'),
('articles.edit', 'Artikel bearbeiten', 'Eigene Artikel bearbeiten', 'articles'),
('articles.edit_all', 'Alle Artikel bearbeiten', 'Auch fremde Artikel bearbeiten', 'articles'),
('articles.delete', 'Artikel löschen', 'Eigene Artikel löschen', 'articles'),
('articles.delete_all', 'Alle Artikel löschen', 'Auch fremde Artikel löschen', 'articles'),
('articles.publish', 'Artikel veröffentlichen', 'Artikel freigeben/zurückziehen', 'articles'),

-- Kategorie: Termine & Events (events)
('events.view', 'Termine ansehen', 'Öffentliche Termine ansehen', 'events'),
('events.view_all', 'Alle Termine ansehen', 'Auch interne Termine', 'events'),
('events.create', 'Termine erstellen', 'Neue Termine anlegen', 'events'),
('events.edit', 'Termine bearbeiten', 'Eigene Termine bearbeiten', 'events'),
('events.edit_all', 'Alle Termine bearbeiten', 'Auch fremde Termine bearbeiten', 'events'),
('events.delete', 'Termine löschen', 'Eigene Termine löschen', 'events'),
('events.delete_all', 'Alle Termine löschen', 'Auch fremde Termine löschen', 'events'),

-- Kategorie: Flugbuch (flugbuch)
('flugbuch.view', 'Flugbuch ansehen', 'Eigene Flüge ansehen', 'flugbuch'),
('flugbuch.view_all', 'Alle Flüge ansehen', 'Gesamtes Flugbuch einsehen', 'flugbuch'),
('flugbuch.create', 'Flug eintragen', 'Neue Flüge erfassen', 'flugbuch'),
('flugbuch.edit', 'Flüge bearbeiten', 'Eigene Flüge bearbeiten', 'flugbuch'),
('flugbuch.edit_all', 'Alle Flüge bearbeiten', 'Auch fremde Flüge bearbeiten', 'flugbuch'),
('flugbuch.delete', 'Flüge löschen', 'Eigene Flüge löschen', 'flugbuch'),
('flugbuch.delete_all', 'Alle Flüge löschen', 'Auch fremde Flüge löschen', 'flugbuch'),
('flugbuch.export', 'Flugbuch exportieren', 'Flugdaten exportieren (CSV/PDF)', 'flugbuch'),
('flugbuch.statistics', 'Statistiken ansehen', 'Flugstatistiken einsehen', 'flugbuch'),

-- Kategorie: Bilder & Galerien (images)
('images.view', 'Bilder ansehen', 'Öffentliche Galerien ansehen', 'images'),
('images.view_all', 'Alle Bilder ansehen', 'Auch private Galerien', 'images'),
('images.upload', 'Bilder hochladen', 'Eigene Bilder hochladen', 'images'),
('images.edit', 'Bilder bearbeiten', 'Eigene Bilder bearbeiten', 'images'),
('images.edit_all', 'Alle Bilder bearbeiten', 'Auch fremde Bilder bearbeiten', 'images'),
('images.delete', 'Bilder löschen', 'Eigene Bilder löschen', 'images'),
('images.delete_all', 'Alle Bilder löschen', 'Auch fremde Bilder löschen', 'images'),
('galleries.create', 'Galerien erstellen', 'Neue Fotogalerien anlegen', 'images'),
('galleries.edit', 'Galerien bearbeiten', 'Eigene Galerien bearbeiten', 'images'),
('galleries.edit_all', 'Alle Galerien bearbeiten', 'Auch fremde Galerien bearbeiten', 'images'),
('galleries.delete', 'Galerien löschen', 'Eigene Galerien löschen', 'images'),
('galleries.delete_all', 'Alle Galerien löschen', 'Auch fremde Galerien löschen', 'images'),

-- Kategorie: Dokumente (documents)
('documents.view', 'Dokumente ansehen', 'Öffentliche Dokumente ansehen', 'documents'),
('documents.view_all', 'Alle Dokumente ansehen', 'Auch interne Dokumente', 'documents'),
('documents.upload', 'Dokumente hochladen', 'Neue Dokumente hochladen', 'documents'),
('documents.edit', 'Dokumente bearbeiten', 'Eigene Dokumente bearbeiten', 'documents'),
('documents.edit_all', 'Alle Dokumente bearbeiten', 'Auch fremde Dokumente bearbeiten', 'documents'),
('documents.delete', 'Dokumente löschen', 'Eigene Dokumente löschen', 'documents'),
('documents.delete_all', 'Alle Dokumente löschen', 'Auch fremde Dokumente löschen', 'documents'),

-- Kategorie: Protokolle (protocols)
('protocols.view', 'Protokolle ansehen', 'Veröffentlichte Protokolle lesen', 'protocols'),
('protocols.view_all', 'Alle Protokolle ansehen', 'Auch unveröffentlichte Protokolle', 'protocols'),
('protocols.create', 'Protokolle erstellen', 'Neue Protokolle anlegen', 'protocols'),
('protocols.edit', 'Protokolle bearbeiten', 'Eigene Protokolle bearbeiten', 'protocols'),
('protocols.edit_all', 'Alle Protokolle bearbeiten', 'Auch fremde Protokolle bearbeiten', 'protocols'),
('protocols.delete', 'Protokolle löschen', 'Eigene Protokolle löschen', 'protocols'),
('protocols.delete_all', 'Alle Protokolle löschen', 'Auch fremde Protokolle löschen', 'protocols'),
('protocols.publish', 'Protokolle veröffentlichen', 'Protokolle freigeben', 'protocols'),
('protocols.export', 'Protokolle exportieren', 'Protokolle als PDF exportieren', 'protocols'),

-- Kategorie: Benachrichtigungen (notifications)
('notifications.view', 'Benachrichtigungen ansehen', 'Eigene Benachrichtigungen', 'notifications'),
('notifications.create', 'Benachrichtigungen erstellen', 'Benachrichtigungen versenden', 'notifications'),
('notifications.send_all', 'An alle senden', 'System-Benachrichtigungen an alle', 'notifications'),
('notifications.delete', 'Benachrichtigungen löschen', 'Eigene Benachrichtigungen löschen', 'notifications'),

-- Kategorie: System & Einstellungen (system)
('system.view_settings', 'Einstellungen ansehen', 'System-Einstellungen einsehen', 'system'),
('system.edit_settings', 'Einstellungen bearbeiten', 'System-Einstellungen ändern', 'system'),
('system.view_logs', 'Logs ansehen', 'System- und Audit-Logs einsehen', 'system'),
('system.manage_backups', 'Backups verwalten', 'Backups erstellen und wiederherstellen', 'system'),
('system.database_access', 'Datenbank-Zugriff', 'Direkter Datenbank-Zugriff', 'system'),
('system.maintenance_mode', 'Wartungsmodus', 'Wartungsmodus aktivieren', 'system'),

-- Kategorie: Statistiken & Reports (statistics)
('statistics.view_basic', 'Basis-Statistiken', 'Öffentliche Statistiken ansehen', 'statistics'),
('statistics.view_advanced', 'Erweiterte Statistiken', 'Detaillierte Auswertungen', 'statistics'),
('statistics.export', 'Statistiken exportieren', 'Reports erstellen und exportieren', 'statistics'),

-- Kategorie: Audit & Sicherheit (audit)
('audit.view', 'Audit-Log ansehen', 'Systemaktivitäten einsehen', 'audit'),
('audit.view_all', 'Alle Audit-Logs', 'Vollständiger Audit-Zugriff', 'audit'),
('audit.export', 'Audit-Logs exportieren', 'Audit-Daten exportieren', 'audit'),

-- Kategorie: 2FA & Sicherheit (security)
('security.manage_2fa', '2FA verwalten', 'Eigene 2FA-Einstellungen', 'security'),
('security.reset_2fa', '2FA zurücksetzen', '2FA für andere Benutzer zurücksetzen', 'security'),
('security.view_sessions', 'Sessions ansehen', 'Aktive Sessions einsehen', 'security'),
('security.manage_sessions', 'Sessions verwalten', 'Sessions beenden', 'security');

-- ============================================
-- ROLE-PERMISSION ASSIGNMENTS
-- ============================================

-- Super-Administrator: ALLE Berechtigungen
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'superadmin';

-- Administrator: Fast alle (außer system.database_access)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin'
AND p.name != 'system.database_access';

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

-- Aktives Mitglied: Basis-Rechte
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'aktives_mitglied'
AND p.name IN (
    'members.view',
    'articles.view',
    'events.view', 'events.view_all', 'events.create',
    'flugbuch.view', 'flugbuch.create', 'flugbuch.edit',
    'images.view', 'images.upload', 'images.edit', 'galleries.create',
    'documents.view', 'documents.view_all',
    'protocols.view',
    'notifications.view',
    'security.manage_2fa', 'security.view_sessions'
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
    'images.view',
    'documents.view', 'documents.view_all',
    'protocols.view',
    'notifications.view',
    'security.manage_2fa'
);

-- Ehrenmitglied (wie aktives Mitglied)
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
    'images.view', 'images.view_all',
    'documents.view', 'documents.view_all',
    'protocols.view', 'protocols.view_all',
    'notifications.view',
    'security.manage_2fa'
);

-- Gastmitglied (minimale Rechte)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'gastmitglied'
AND p.name IN (
    'articles.view',
    'events.view',
    'images.view',
    'notifications.view',
    'security.manage_2fa'
);
