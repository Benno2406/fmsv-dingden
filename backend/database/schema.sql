-- FMSV Dingden Database Schema
-- PostgreSQL 14+

-- Enable UUID extension (if not already enabled by install script)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public;

-- ============================================
-- RBAC: ROLES & PERMISSIONS
-- ============================================

-- Rollen-Definitionstabelle
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Upload-Limits (in MB)
    max_upload_size_mb INTEGER DEFAULT 5,
    max_total_storage_mb INTEGER DEFAULT 100,
    
    -- Hierarchie
    level INTEGER NOT NULL DEFAULT 0, -- Höher = mehr Rechte
    
    -- System-Rolle (nicht löschbar)
    is_system_role BOOLEAN DEFAULT FALSE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Berechtigungen
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rollen <-> Berechtigungen (Many-to-Many)
CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    PRIMARY KEY (role_id, permission_id)
);

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    street VARCHAR(255),
    postal_code VARCHAR(10),
    city VARCHAR(100),
    
    -- 2FA (Authenticator App)
    two_fa_enabled BOOLEAN DEFAULT FALSE,
    two_fa_secret VARCHAR(255), -- Base32 encoded secret
    two_fa_backup_codes TEXT[], -- Array von Backup-Codes (gehashed)
    two_fa_enabled_at TIMESTAMP,
    
    -- Legacy Flags (kompatibilität)
    is_admin BOOLEAN DEFAULT FALSE,
    is_member BOOLEAN DEFAULT TRUE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    account_locked BOOLEAN DEFAULT FALSE,
    lock_reason TEXT,
    locked_at TIMESTAMP,
    
    -- Login-Tracking
    failed_login_attempts INTEGER DEFAULT 0,
    last_failed_login TIMESTAMP,
    
    -- Membership
    member_since DATE,
    member_number VARCHAR(50) UNIQUE,
    
    -- Storage-Tracking
    used_storage_bytes BIGINT DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    
    -- Avatar
    avatar_url VARCHAR(500)
);

-- User <-> Roles (Many-to-Many)
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    PRIMARY KEY (user_id, role_id)
);

-- 2FA Backup Codes (separiert für bessere Security)
CREATE TABLE two_fa_backup_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    code_hash VARCHAR(255) NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refresh Tokens für JWT
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    device_info TEXT, -- User Agent / Device Info
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP
);

-- Session-Tracking für 2FA
CREATE TABLE two_fa_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    temp_token VARCHAR(500) UNIQUE NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ARTICLES & NEWS
-- ============================================

CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    category VARCHAR(50) DEFAULT 'news',
    
    -- Author
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Media
    featured_image VARCHAR(500),
    
    -- Status
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,
    
    -- SEO
    meta_description TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Views
    view_count INTEGER DEFAULT 0
);

-- ============================================
-- EVENTS & CALENDAR
-- ============================================

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Date & Time
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    all_day BOOLEAN DEFAULT FALSE,
    
    -- Location
    location VARCHAR(255),
    
    -- Visibility
    is_public BOOLEAN DEFAULT TRUE,
    
    -- Creator
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- FLUGBUCH (Flight Log)
-- ============================================

CREATE TABLE flugbuch_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Pilot
    pilot_id UUID REFERENCES users(id) ON DELETE SET NULL,
    pilot_name VARCHAR(255) NOT NULL,
    
    -- Flight Details
    aircraft_type VARCHAR(100),
    aircraft_name VARCHAR(100),
    
    -- Times
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration_minutes INTEGER,
    
    -- Notes
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- IMAGES & GALLERIES
-- ============================================

CREATE TABLE image_galleries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Visibility
    is_public BOOLEAN DEFAULT TRUE,
    
    -- Creator
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gallery_id UUID REFERENCES image_galleries(id) ON DELETE CASCADE,
    
    -- File Info
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    
    -- Image Details
    title VARCHAR(255),
    description TEXT,
    width INTEGER,
    height INTEGER,
    
    -- Uploader
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Order
    sort_order INTEGER DEFAULT 0
);

-- ============================================
-- DOCUMENTS & PROTOCOLS
-- ============================================

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- File Info
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    
    -- Category
    category VARCHAR(50) DEFAULT 'general',
    
    -- Visibility
    is_public BOOLEAN DEFAULT FALSE,
    
    -- Uploader
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Protocols (Protokolle)
CREATE TABLE protocols (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    protocol_date DATE NOT NULL,
    
    -- Type
    protocol_type VARCHAR(50) DEFAULT 'meeting',
    
    -- Visibility
    is_public BOOLEAN DEFAULT FALSE,
    
    -- Creator
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    
    -- Link
    link_url VARCHAR(500),
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

-- ============================================
-- AUDIT LOG
-- ============================================

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- User
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    
    -- Action
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    
    -- Details
    details JSONB,
    
    -- Request Info
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES für Performance
-- ============================================

-- Roles
CREATE INDEX idx_roles_name ON roles(name);
CREATE INDEX idx_roles_level ON roles(level);
CREATE INDEX idx_roles_active ON roles(is_active);

-- Permissions
CREATE INDEX idx_permissions_name ON permissions(name);
CREATE INDEX idx_permissions_category ON permissions(category);

-- User Roles
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_member_number ON users(member_number);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_2fa ON users(two_fa_enabled);
CREATE INDEX idx_users_locked ON users(account_locked);

-- 2FA
CREATE INDEX idx_2fa_backup_user ON two_fa_backup_codes(user_id);
CREATE INDEX idx_2fa_sessions_user ON two_fa_sessions(user_id);
CREATE INDEX idx_2fa_sessions_token ON two_fa_sessions(temp_token);

-- Refresh Tokens
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- Articles
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_published ON articles(is_published, published_at);
CREATE INDEX idx_articles_category ON articles(category);

-- Events
CREATE INDEX idx_events_dates ON events(start_date, end_date);
CREATE INDEX idx_events_public ON events(is_public);

-- Flugbuch
CREATE INDEX idx_flugbuch_pilot ON flugbuch_entries(pilot_id);
CREATE INDEX idx_flugbuch_dates ON flugbuch_entries(start_time);

-- Images
CREATE INDEX idx_images_gallery ON images(gallery_id);

-- Documents
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_public ON documents(is_public);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- Audit Log
CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_created ON audit_log(created_at);

-- ============================================
-- TRIGGERS für updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flugbuch_updated_at BEFORE UPDATE ON flugbuch_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_galleries_updated_at BEFORE UPDATE ON image_galleries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_protocols_updated_at BEFORE UPDATE ON protocols
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INITIAL-DATEN: System-Rollen
-- ============================================

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

-- ============================================
-- INITIAL-DATEN: Permissions (140+ Berechtigungen)
-- ============================================

-- Kategorie: Mitglieder-Verwaltung (members)
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
('members.import', 'Mitglieder importieren', 'Mitgliederdaten importieren', 'members'),

-- Kategorie: Rollen & Berechtigungen (roles)
('roles.view', 'Rollen ansehen', 'Rollenliste ansehen', 'roles'),
('roles.create', 'Rollen erstellen', 'Neue Rollen anlegen', 'roles'),
('roles.edit', 'Rollen bearbeiten', 'Rollen-Einstellungen ändern', 'roles'),
('roles.delete', 'Rollen löschen', 'Nicht-System-Rollen löschen', 'roles'),
('roles.assign', 'Rollen zuweisen', 'Benutzern Rollen zuweisen', 'roles'),
('permissions.view', 'Berechtigungen ansehen', 'Berechtigungen einsehen', 'roles'),
('permissions.manage', 'Berechtigungen verwalten', 'Berechtigungen zuweisen/entziehen', 'roles'),

-- Kategorie: Artikel & News (articles)
('articles.view', 'Artikel ansehen', 'Veröffentlichte Artikel lesen', 'articles'),
('articles.view_unpublished', 'Unveröffentlichte Artikel ansehen', 'Entwürfe ansehen', 'articles'),
('articles.create', 'Artikel erstellen', 'Neue Artikel/News erstellen', 'articles'),
('articles.edit', 'Artikel bearbeiten', 'Eigene Artikel bearbeiten', 'articles'),
('articles.edit_all', 'Alle Artikel bearbeiten', 'Auch fremde Artikel bearbeiten', 'articles'),
('articles.delete', 'Artikel löschen', 'Eigene Artikel löschen', 'articles'),
('articles.delete_all', 'Alle Artikel löschen', 'Auch fremde Artikel löschen', 'articles'),
('articles.publish', 'Artikel veröffentlichen', 'Artikel freigeben/zurückziehen', 'articles'),

-- Kategorie: Termine & Events (events)
('events.view', 'Termine ansehen', 'Öffentliche Termine ansehen', 'events'),
('events.view_all', 'Alle Termine ansehen', 'Auch interne Termine', 'events'),
('events.create', 'Termine erstellen', 'Neue Termine anlegen', 'events'),
('events.edit', 'Termine bearbeiten', 'Eigene Termine bearbeiten', 'events'),
('events.edit_all', 'Alle Termine bearbeiten', 'Auch fremde Termine bearbeiten', 'events'),
('events.delete', 'Termine löschen', 'Eigene Termine löschen', 'events'),
('events.delete_all', 'Alle Termine löschen', 'Auch fremde Termine löschen', 'events'),

-- Kategorie: Flugbuch (flugbuch)
('flugbuch.view', 'Flugbuch ansehen', 'Eigene Flüge ansehen', 'flugbuch'),
('flugbuch.view_all', 'Alle Flüge ansehen', 'Gesamtes Flugbuch einsehen', 'flugbuch'),
('flugbuch.create', 'Flug eintragen', 'Neue Flüge erfassen', 'flugbuch'),
('flugbuch.edit', 'Flüge bearbeiten', 'Eigene Flüge bearbeiten', 'flugbuch'),
('flugbuch.edit_all', 'Alle Flüge bearbeiten', 'Auch fremde Flüge bearbeiten', 'flugbuch'),
('flugbuch.delete', 'Flüge löschen', 'Eigene Flüge löschen', 'flugbuch'),
('flugbuch.delete_all', 'Alle Flüge löschen', 'Auch fremde Flüge löschen', 'flugbuch'),
('flugbuch.export', 'Flugbuch exportieren', 'Flugdaten exportieren (CSV/PDF)', 'flugbuch'),
('flugbuch.statistics', 'Statistiken ansehen', 'Flugstatistiken einsehen', 'flugbuch'),

-- Kategorie: Bilder & Galerien (images)
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
('galleries.delete_all', 'Alle Galerien löschen', 'Auch fremde Galerien löschen', 'images'),

-- Kategorie: Dokumente (documents)
('documents.view', 'Dokumente ansehen', 'Öffentliche Dokumente ansehen', 'documents'),
('documents.view_all', 'Alle Dokumente ansehen', 'Auch interne Dokumente', 'documents'),
('documents.upload', 'Dokumente hochladen', 'Neue Dokumente hochladen', 'documents'),
('documents.edit', 'Dokumente bearbeiten', 'Eigene Dokumente bearbeiten', 'documents'),
('documents.edit_all', 'Alle Dokumente bearbeiten', 'Auch fremde Dokumente bearbeiten', 'documents'),
('documents.delete', 'Dokumente löschen', 'Eigene Dokumente löschen', 'documents'),
('documents.delete_all', 'Alle Dokumente löschen', 'Auch fremde Dokumente löschen', 'documents'),

-- Kategorie: Protokolle (protocols)
('protocols.view', 'Protokolle ansehen', 'Veröffentlichte Protokolle lesen', 'protocols'),
('protocols.view_all', 'Alle Protokolle ansehen', 'Auch unveröffentlichte Protokolle', 'protocols'),
('protocols.create', 'Protokolle erstellen', 'Neue Protokolle anlegen', 'protocols'),
('protocols.edit', 'Protokolle bearbeiten', 'Eigene Protokolle bearbeiten', 'protocols'),
('protocols.edit_all', 'Alle Protokolle bearbeiten', 'Auch fremde Protokolle bearbeiten', 'protocols'),
('protocols.delete', 'Protokolle löschen', 'Eigene Protokolle löschen', 'protocols'),
('protocols.delete_all', 'Alle Protokolle löschen', 'Auch fremde Protokolle löschen', 'protocols'),
('protocols.publish', 'Protokolle veröffentlichen', 'Protokolle freigeben', 'protocols'),
('protocols.export', 'Protokolle exportieren', 'Protokolle als PDF exportieren', 'protocols'),

-- Kategorie: Benachrichtigungen (notifications)
('notifications.view', 'Benachrichtigungen ansehen', 'Eigene Benachrichtigungen', 'notifications'),
('notifications.create', 'Benachrichtigungen erstellen', 'Benachrichtigungen versenden', 'notifications'),
('notifications.send_all', 'An alle senden', 'System-Benachrichtigungen an alle', 'notifications'),
('notifications.delete', 'Benachrichtigungen löschen', 'Eigene Benachrichtigungen löschen', 'notifications'),

-- Kategorie: System & Einstellungen (system)
('system.view_settings', 'Einstellungen ansehen', 'System-Einstellungen einsehen', 'system'),
('system.edit_settings', 'Einstellungen bearbeiten', 'System-Einstellungen ändern', 'system'),
('system.view_logs', 'Logs ansehen', 'System- und Audit-Logs einsehen', 'system'),
('system.manage_backups', 'Backups verwalten', 'Backups erstellen und wiederherstellen', 'system'),
('system.database_access', 'Datenbank-Zugriff', 'Direkter Datenbank-Zugriff', 'system'),
('system.maintenance_mode', 'Wartungsmodus', 'Wartungsmodus aktivieren', 'system'),

-- Kategorie: Statistiken & Reports (statistics)
('statistics.view_basic', 'Basis-Statistiken', 'Öffentliche Statistiken ansehen', 'statistics'),
('statistics.view_advanced', 'Erweiterte Statistiken', 'Detaillierte Auswertungen', 'statistics'),
('statistics.export', 'Statistiken exportieren', 'Reports erstellen und exportieren', 'statistics'),

-- Kategorie: Audit & Sicherheit (audit)
('audit.view', 'Audit-Log ansehen', 'Systemaktivitäten einsehen', 'audit'),
('audit.view_all', 'Alle Audit-Logs', 'Vollständiger Audit-Zugriff', 'audit'),
('audit.export', 'Audit-Logs exportieren', 'Audit-Daten exportieren', 'audit'),

-- Kategorie: 2FA & Sicherheit (security)
('security.manage_2fa', '2FA verwalten', 'Eigene 2FA-Einstellungen', 'security'),
('security.reset_2fa', '2FA zurücksetzen', '2FA für andere Benutzer zurücksetzen', 'security'),
('security.view_sessions', 'Sessions ansehen', 'Aktive Sessions einsehen', 'security'),
('security.manage_sessions', 'Sessions verwalten', 'Sessions beenden', 'security');

-- ============================================
-- INITIAL-DATEN: Standard-Berechtigungen für Rollen
-- ============================================

-- Super-Administrator: ALLE Berechtigungen
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'superadmin';

-- Administrator: Fast alle Berechtigungen (außer sensible System-Ops)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin'
AND p.name NOT IN ('system.database_access');

-- Vorstand: Erweiterte Rechte
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'vorstand'
AND p.name IN (
    -- Mitglieder
    'members.view', 'members.view_all', 'members.view_details', 'members.edit', 'members.export',
    -- Artikel
    'articles.view', 'articles.view_unpublished', 'articles.create', 'articles.edit', 'articles.edit_all', 'articles.publish',
    -- Events
    'events.view', 'events.view_all', 'events.create', 'events.edit', 'events.edit_all',
    -- Flugbuch
    'flugbuch.view', 'flugbuch.view_all', 'flugbuch.export', 'flugbuch.statistics',
    -- Bilder
    'images.view', 'images.view_all', 'images.upload', 'images.edit', 'images.edit_all', 'galleries.create', 'galleries.edit', 'galleries.edit_all',
    -- Dokumente
    'documents.view', 'documents.view_all', 'documents.upload', 'documents.edit', 'documents.edit_all',
    -- Protokolle
    'protocols.view', 'protocols.view_all', 'protocols.create', 'protocols.edit', 'protocols.edit_all', 'protocols.publish', 'protocols.export',
    -- Benachrichtigungen
    'notifications.view', 'notifications.create', 'notifications.send_all',
    -- Statistiken
    'statistics.view_basic', 'statistics.view_advanced', 'statistics.export',
    -- Audit
    'audit.view', 'audit.export',
    -- Security
    'security.manage_2fa', 'security.view_sessions'
);

-- Webmaster: Technische & Content-Rechte
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'webmaster'
AND p.category IN ('articles', 'events', 'images', 'documents', 'system', 'statistics')
OR p.name IN ('members.view', 'members.view_all', 'audit.view', 'notifications.create', 'notifications.send_all');

-- Aktives Mitglied: Basis-Rechte
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'aktives_mitglied'
AND p.name IN (
    'members.view',
    'articles.view',
    'events.view', 'events.view_all', 'events.create',
    'flugbuch.view', 'flugbuch.create', 'flugbuch.edit',
    'images.view', 'images.upload', 'images.edit', 'galleries.create',
    'documents.view', 'documents.view_all',
    'protocols.view',
    'notifications.view',
    'security.manage_2fa', 'security.view_sessions'
);

-- ============================================
-- BERECHTIGUNGEN
-- ============================================
-- Diese Berechtigungen werden automatisch gesetzt durch die Installation
-- Sie stellen sicher, dass der DB_USER volle Rechte auf alle Objekte hat

-- Hinweis: Diese SQL-Befehle werden nur ausgeführt wenn der User, der das
-- Schema erstellt (normalerweise postgres), die Rechte dann an DB_USER weitergibt.
-- Das install.sh Script führt zusätzlich GRANT-Befehle aus.
