-- FMSV Dingden - Permissions: Documents
-- Kategorie: Dokumente (documents)

INSERT INTO permissions (name, display_name, description, category) VALUES
('documents.view', 'Dokumente ansehen', 'Öffentliche Dokumente ansehen', 'documents'),
('documents.view_all', 'Alle Dokumente ansehen', 'Auch interne Dokumente', 'documents'),
('documents.upload', 'Dokumente hochladen', 'Neue Dokumente hochladen', 'documents'),
('documents.edit', 'Dokumente bearbeiten', 'Eigene Dokumente bearbeiten', 'documents'),
('documents.edit_all', 'Alle Dokumente bearbeiten', 'Auch fremde Dokumente bearbeiten', 'documents'),
('documents.delete', 'Dokumente löschen', 'Eigene Dokumente löschen', 'documents'),
('documents.delete_all', 'Alle Dokumente löschen', 'Auch fremde Dokumente löschen', 'documents');
