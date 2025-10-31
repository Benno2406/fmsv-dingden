-- FMSV Dingden - Permissions: Roles & Permissions
-- Kategorie: Rollen & Berechtigungen (roles)

INSERT INTO permissions (name, display_name, description, category) VALUES
('roles.view', 'Rollen ansehen', 'Rollenliste ansehen', 'roles'),
('roles.create', 'Rollen erstellen', 'Neue Rollen anlegen', 'roles'),
('roles.edit', 'Rollen bearbeiten', 'Rollen-Einstellungen ändern', 'roles'),
('roles.delete', 'Rollen löschen', 'Nicht-System-Rollen löschen', 'roles'),
('roles.assign', 'Rollen zuweisen', 'Benutzern Rollen zuweisen', 'roles'),
('permissions.view', 'Berechtigungen ansehen', 'Berechtigungen einsehen', 'roles'),
('permissions.manage', 'Berechtigungen verwalten', 'Berechtigungen zuweisen/entziehen', 'roles');
