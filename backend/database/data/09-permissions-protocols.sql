-- FMSV Dingden - Permissions: Protocols
-- Kategorie: Protokolle (protocols)

INSERT INTO permissions (name, display_name, description, category) VALUES
('protocols.view', 'Protokolle ansehen', 'Veröffentlichte Protokolle lesen', 'protocols'),
('protocols.view_all', 'Alle Protokolle ansehen', 'Auch unveröffentlichte Protokolle', 'protocols'),
('protocols.create', 'Protokolle erstellen', 'Neue Protokolle anlegen', 'protocols'),
('protocols.edit', 'Protokolle bearbeiten', 'Eigene Protokolle bearbeiten', 'protocols'),
('protocols.edit_all', 'Alle Protokolle bearbeiten', 'Auch fremde Protokolle bearbeiten', 'protocols'),
('protocols.delete', 'Protokolle löschen', 'Eigene Protokolle löschen', 'protocols'),
('protocols.delete_all', 'Alle Protokolle löschen', 'Auch fremde Protokolle löschen', 'protocols'),
('protocols.publish', 'Protokolle veröffentlichen', 'Protokolle freigeben', 'protocols'),
('protocols.export', 'Protokolle exportieren', 'Protokolle als PDF exportieren', 'protocols');
