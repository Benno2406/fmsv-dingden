-- FMSV Dingden - Permissions: Other Categories
-- Kategorien: Notifications, System, Statistics, Audit, Security

-- Benachrichtigungen (notifications)
INSERT INTO permissions (name, display_name, description, category) VALUES
('notifications.view', 'Benachrichtigungen ansehen', 'Eigene Benachrichtigungen', 'notifications'),
('notifications.create', 'Benachrichtigungen erstellen', 'Benachrichtigungen versenden', 'notifications'),
('notifications.send_all', 'An alle senden', 'System-Benachrichtigungen an alle', 'notifications'),
('notifications.delete', 'Benachrichtigungen löschen', 'Eigene Benachrichtigungen löschen', 'notifications');

-- System & Einstellungen (system)
INSERT INTO permissions (name, display_name, description, category) VALUES
('system.view_settings', 'Einstellungen ansehen', 'System-Einstellungen einsehen', 'system'),
('system.edit_settings', 'Einstellungen bearbeiten', 'System-Einstellungen ändern', 'system'),
('system.view_logs', 'Logs ansehen', 'System- und Audit-Logs einsehen', 'system'),
('system.manage_backups', 'Backups verwalten', 'Backups erstellen und wiederherstellen', 'system'),
('system.database_access', 'Datenbank-Zugriff', 'Direkter Datenbank-Zugriff', 'system'),
('system.maintenance_mode', 'Wartungsmodus', 'Wartungsmodus aktivieren', 'system');

-- Statistiken & Reports (statistics)
INSERT INTO permissions (name, display_name, description, category) VALUES
('statistics.view_basic', 'Basis-Statistiken', 'Öffentliche Statistiken ansehen', 'statistics'),
('statistics.view_advanced', 'Erweiterte Statistiken', 'Detaillierte Auswertungen', 'statistics'),
('statistics.export', 'Statistiken exportieren', 'Reports erstellen und exportieren', 'statistics');

-- Audit & Sicherheit (audit)
INSERT INTO permissions (name, display_name, description, category) VALUES
('audit.view', 'Audit-Log ansehen', 'Systemaktivitäten einsehen', 'audit'),
('audit.view_all', 'Alle Audit-Logs', 'Vollständiger Audit-Zugriff', 'audit'),
('audit.export', 'Audit-Logs exportieren', 'Audit-Daten exportieren', 'audit');

-- 2FA & Sicherheit (security)
INSERT INTO permissions (name, display_name, description, category) VALUES
('security.manage_2fa', '2FA verwalten', 'Eigene 2FA-Einstellungen', 'security'),
('security.reset_2fa', '2FA zurücksetzen', '2FA für andere Benutzer zurücksetzen', 'security'),
('security.view_sessions', 'Sessions ansehen', 'Aktive Sessions einsehen', 'security'),
('security.manage_sessions', 'Sessions verwalten', 'Sessions beenden', 'security');
