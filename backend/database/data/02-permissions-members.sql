-- FMSV Dingden - Permissions: Members
-- Kategorie: Mitglieder (members)

INSERT INTO permissions (name, display_name, description, category) VALUES
('members.view', 'Mitglieder ansehen', 'Mitgliederliste und Profile ansehen', 'members'),
('members.view_all', 'Alle Mitglieder ansehen', 'Auch inaktive und gesperrte Mitglieder', 'members'),
('members.view_details', 'Mitgliederdetails ansehen', 'Vollständige Kontaktdaten einsehen', 'members'),
('members.create', 'Mitglieder anlegen', 'Neue Mitglieder erstellen', 'members'),
('members.edit', 'Mitglieder bearbeiten', 'Mitgliederdaten ändern', 'members'),
('members.delete', 'Mitglieder löschen', 'Mitglieder endgültig löschen', 'members'),
('members.activate', 'Mitglieder aktivieren', 'Mitglieder aktivieren/deaktivieren', 'members'),
('members.lock', 'Mitglieder sperren', 'Accounts sperren/entsperren', 'members'),
('members.export', 'Mitglieder exportieren', 'Mitgliederdaten exportieren', 'members'),
('members.import', 'Mitglieder importieren', 'Mitgliederdaten importieren', 'members');
