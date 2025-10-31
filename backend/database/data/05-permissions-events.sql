-- FMSV Dingden - Permissions: Events
-- Kategorie: Termine & Events (events)

INSERT INTO permissions (name, display_name, description, category) VALUES
('events.view', 'Termine ansehen', 'Öffentliche Termine ansehen', 'events'),
('events.view_all', 'Alle Termine ansehen', 'Auch interne Termine', 'events'),
('events.create', 'Termine erstellen', 'Neue Termine anlegen', 'events'),
('events.edit', 'Termine bearbeiten', 'Eigene Termine bearbeiten', 'events'),
('events.edit_all', 'Alle Termine bearbeiten', 'Auch fremde Termine bearbeiten', 'events'),
('events.delete', 'Termine löschen', 'Eigene Termine löschen', 'events'),
('events.delete_all', 'Alle Termine löschen', 'Auch fremde Termine löschen', 'events');
