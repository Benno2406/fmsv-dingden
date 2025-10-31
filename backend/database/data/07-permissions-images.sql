-- FMSV Dingden - Permissions: Images & Galleries
-- Kategorie: Bilder & Galerien (images)

INSERT INTO permissions (name, display_name, description, category) VALUES
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
('galleries.delete_all', 'Alle Galerien löschen', 'Auch fremde Galerien löschen', 'images');
