-- FMSV Dingden - Permissions: Flugbuch
-- Kategorie: Flugbuch (flugbuch)

INSERT INTO permissions (name, display_name, description, category) VALUES
('flugbuch.view', 'Flugbuch ansehen', 'Eigene Flüge ansehen', 'flugbuch'),
('flugbuch.view_all', 'Alle Flüge ansehen', 'Gesamtes Flugbuch einsehen', 'flugbuch'),
('flugbuch.create', 'Flug eintragen', 'Neue Flüge erfassen', 'flugbuch'),
('flugbuch.edit', 'Flüge bearbeiten', 'Eigene Flüge bearbeiten', 'flugbuch'),
('flugbuch.edit_all', 'Alle Flüge bearbeiten', 'Auch fremde Flüge bearbeiten', 'flugbuch'),
('flugbuch.delete', 'Flüge löschen', 'Eigene Flüge löschen', 'flugbuch'),
('flugbuch.delete_all', 'Alle Flüge löschen', 'Auch fremde Flüge löschen', 'flugbuch'),
('flugbuch.export', 'Flugbuch exportieren', 'Flugdaten exportieren (CSV/PDF)', 'flugbuch'),
('flugbuch.statistics', 'Statistiken ansehen', 'Flugstatistiken einsehen', 'flugbuch');
