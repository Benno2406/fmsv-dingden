-- FMSV Dingden - Initial Roles
-- 12 System-Rollen

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
