-- FMSV Dingden - Permissions: Articles
-- Kategorie: Artikel & News (articles)

INSERT INTO permissions (name, display_name, description, category) VALUES
('articles.view', 'Artikel ansehen', 'Veröffentlichte Artikel lesen', 'articles'),
('articles.view_unpublished', 'Unveröffentlichte Artikel ansehen', 'Entwürfe ansehen', 'articles'),
('articles.create', 'Artikel erstellen', 'Neue Artikel/News erstellen', 'articles'),
('articles.edit', 'Artikel bearbeiten', 'Eigene Artikel bearbeiten', 'articles'),
('articles.edit_all', 'Alle Artikel bearbeiten', 'Auch fremde Artikel bearbeiten', 'articles'),
('articles.delete', 'Artikel löschen', 'Eigene Artikel löschen', 'articles'),
('articles.delete_all', 'Alle Artikel löschen', 'Auch fremde Artikel löschen', 'articles'),
('articles.publish', 'Artikel veröffentlichen', 'Artikel freigeben/zurückziehen', 'articles');
