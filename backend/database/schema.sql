-- FMSV Dingden Database Schema
-- PostgreSQL 14+

-- Enable UUID extension (if not already enabled by install script)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public;

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
    
    -- 2FA
    two_fa_enabled BOOLEAN DEFAULT FALSE,
    two_fa_secret VARCHAR(255),
    
    -- Role (später erweiterbar)
    is_admin BOOLEAN DEFAULT FALSE,
    is_member BOOLEAN DEFAULT TRUE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    
    -- Membership
    member_since DATE,
    member_number VARCHAR(50) UNIQUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    
    -- Avatar
    avatar_url VARCHAR(500)
);

-- Refresh Tokens für JWT
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
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

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_member_number ON users(member_number);
CREATE INDEX idx_users_is_active ON users(is_active);

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
-- RBAC (Role-Based Access Control)
-- ============================================

-- Roles (Rollen wie Mitglied, Vorstand, Webmaster, etc.)
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Upload limit in MB
    upload_limit_mb INTEGER DEFAULT 5,
    
    -- Priority (höher = mehr Rechte, für UI-Sortierung)
    priority INTEGER DEFAULT 0,
    
    -- System roles können nicht gelöscht werden
    is_system_role BOOLEAN DEFAULT FALSE,
    
    -- Color for UI (hex)
    color VARCHAR(7) DEFAULT '#6B7280',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permissions (Granulare Berechtigungen)
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Category for grouping in UI
    category VARCHAR(50) NOT NULL,
    
    -- System permissions können nicht gelöscht werden
    is_system_permission BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Role-Permission Zuordnung (N:M)
CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (role_id, permission_id)
);

-- User-Role Zuordnung (N:M - ein User kann mehrere Rollen haben)
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    
    -- Audit
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    PRIMARY KEY (user_id, role_id)
);

-- ============================================
-- RBAC INDEXES
-- ============================================

CREATE INDEX idx_roles_name ON roles(name);
CREATE INDEX idx_permissions_name ON permissions(name);
CREATE INDEX idx_permissions_category ON permissions(category);
CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission ON role_permissions(permission_id);
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);

-- ============================================
-- RBAC TRIGGERS
-- ============================================

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RBAC INITIAL DATA
-- ============================================

-- Standard-Rollen
INSERT INTO roles (name, display_name, description, upload_limit_mb, priority, is_system_role, color) VALUES
('mitglied', 'Mitglied', 'Standard-Mitglied des Vereins', 5, 10, true, '#3B82F6'),
('vorstand', 'Vorstand', 'Vorstandsmitglied mit erweiterten Rechten', 50, 50, true, '#F59E0B'),
('webmaster', 'Webmaster', 'Webmaster mit vollständigen Systemrechten', 100, 100, true, '#EF4444'),
('jugendwart', 'Jugendwart', 'Zuständig für Jugendarbeit', 20, 30, true, '#10B981'),
('kassenwart', 'Kassenwart', 'Zuständig für Finanzen', 20, 30, true, '#8B5CF6');

-- Standard-Berechtigungen

-- Artikel & Content
INSERT INTO permissions (name, display_name, description, category, is_system_permission) VALUES
('articles.view', 'Artikel ansehen', 'Kann interne Artikel ansehen', 'articles', true),
('articles.create', 'Artikel erstellen', 'Kann neue Artikel erstellen', 'articles', true),
('articles.edit.own', 'Eigene Artikel bearbeiten', 'Kann eigene Artikel bearbeiten', 'articles', true),
('articles.edit.all', 'Alle Artikel bearbeiten', 'Kann alle Artikel bearbeiten', 'articles', true),
('articles.delete', 'Artikel löschen', 'Kann Artikel löschen', 'articles', true),
('articles.publish', 'Artikel veröffentlichen', 'Kann Artikel veröffentlichen', 'articles', true);

-- Mitgliederverwaltung
INSERT INTO permissions (name, display_name, description, category, is_system_permission) VALUES
('members.view', 'Mitglieder ansehen', 'Kann Mitgliederliste ansehen', 'members', true),
('members.view.details', 'Mitgliederdetails ansehen', 'Kann Details aller Mitglieder ansehen', 'members', true),
('members.edit', 'Mitglieder bearbeiten', 'Kann Mitgliederdaten bearbeiten', 'members', true),
('members.delete', 'Mitglieder löschen', 'Kann Mitglieder löschen', 'members', true),
('members.roles.manage', 'Rollen verwalten', 'Kann Rollen von Mitgliedern verwalten', 'members', true);

-- Flugbuch
INSERT INTO permissions (name, display_name, description, category, is_system_permission) VALUES
('flugbuch.view', 'Flugbuch ansehen', 'Kann Flugbucheinträge ansehen', 'flugbuch', true),
('flugbuch.create', 'Flugbuch erstellen', 'Kann Flugbucheinträge erstellen', 'flugbuch', true),
('flugbuch.edit.own', 'Eigene Einträge bearbeiten', 'Kann eigene Flugbucheinträge bearbeiten', 'flugbuch', true),
('flugbuch.edit.all', 'Alle Einträge bearbeiten', 'Kann alle Flugbucheinträge bearbeiten', 'flugbuch', true),
('flugbuch.delete', 'Einträge löschen', 'Kann Flugbucheinträge löschen', 'flugbuch', true),
('flugbuch.export', 'Flugbuch exportieren', 'Kann Flugbuch exportieren', 'flugbuch', true);

-- Termine & Events
INSERT INTO permissions (name, display_name, description, category, is_system_permission) VALUES
('events.view', 'Termine ansehen', 'Kann interne Termine ansehen', 'events', true),
('events.create', 'Termine erstellen', 'Kann neue Termine erstellen', 'events', true),
('events.edit', 'Termine bearbeiten', 'Kann Termine bearbeiten', 'events', true),
('events.delete', 'Termine löschen', 'Kann Termine löschen', 'events', true);

-- Bilder & Galerien
INSERT INTO permissions (name, display_name, description, category, is_system_permission) VALUES
('images.view', 'Bilder ansehen', 'Kann interne Bilder ansehen', 'images', true),
('images.upload', 'Bilder hochladen', 'Kann Bilder hochladen', 'images', true),
('images.delete.own', 'Eigene Bilder löschen', 'Kann eigene Bilder löschen', 'images', true),
('images.delete.all', 'Alle Bilder löschen', 'Kann alle Bilder löschen', 'images', true),
('images.galleries.manage', 'Galerien verwalten', 'Kann Galerien erstellen und verwalten', 'images', true);

-- Dokumente
INSERT INTO permissions (name, display_name, description, category, is_system_permission) VALUES
('documents.view', 'Dokumente ansehen', 'Kann interne Dokumente ansehen', 'documents', true),
('documents.upload', 'Dokumente hochladen', 'Kann Dokumente hochladen', 'documents', true),
('documents.delete', 'Dokumente löschen', 'Kann Dokumente löschen', 'documents', true),
('protocols.view', 'Protokolle ansehen', 'Kann Protokolle ansehen', 'documents', true),
('protocols.create', 'Protokolle erstellen', 'Kann Protokolle erstellen', 'documents', true),
('protocols.edit', 'Protokolle bearbeiten', 'Kann Protokolle bearbeiten', 'documents', true);

-- Benachrichtigungen
INSERT INTO permissions (name, display_name, description, category, is_system_permission) VALUES
('notifications.send.own', 'Benachrichtigungen senden', 'Kann Benachrichtigungen an einzelne Mitglieder senden', 'notifications', true),
('notifications.send.all', 'Massenbenachrichtigungen', 'Kann Benachrichtigungen an alle Mitglieder senden', 'notifications', true);

-- System & Administration
INSERT INTO permissions (name, display_name, description, category, is_system_permission) VALUES
('system.settings', 'Systemeinstellungen', 'Kann Systemeinstellungen ändern', 'system', true),
('system.database', 'Datenbankzugriff', 'Kann auf die Datenbankverwaltung zugreifen', 'system', true),
('system.audit.view', 'Audit-Log ansehen', 'Kann Audit-Logs ansehen', 'system', true),
('system.roles.manage', 'Rollen verwalten', 'Kann Rollen und Berechtigungen verwalten', 'system', true);

-- ============================================
-- RBAC BERECHTIGUNGEN ZUORDNUNG
-- ============================================

-- Mitglied Berechtigungen
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'mitglied' AND p.name IN (
    'articles.view',
    'members.view',
    'flugbuch.view',
    'flugbuch.create',
    'flugbuch.edit.own',
    'events.view',
    'images.view',
    'images.upload',
    'images.delete.own',
    'documents.view',
    'protocols.view'
);

-- Vorstand Berechtigungen (Mitglied + erweiterte Rechte)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'vorstand' AND p.name IN (
    -- Alle Mitglieder-Rechte
    'articles.view',
    'members.view',
    'flugbuch.view',
    'flugbuch.create',
    'flugbuch.edit.own',
    'events.view',
    'images.view',
    'images.upload',
    'images.delete.own',
    'documents.view',
    'protocols.view',
    -- Erweiterte Rechte
    'articles.create',
    'articles.edit.own',
    'articles.publish',
    'members.view.details',
    'members.edit',
    'flugbuch.edit.all',
    'flugbuch.delete',
    'flugbuch.export',
    'events.create',
    'events.edit',
    'events.delete',
    'images.delete.all',
    'images.galleries.manage',
    'documents.upload',
    'documents.delete',
    'protocols.create',
    'protocols.edit',
    'notifications.send.own',
    'notifications.send.all',
    'system.audit.view'
);

-- Webmaster Berechtigungen (alle Rechte)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'webmaster';

-- Jugendwart Berechtigungen
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'jugendwart' AND p.name IN (
    -- Basis-Rechte
    'articles.view',
    'members.view',
    'members.view.details',
    'flugbuch.view',
    'flugbuch.create',
    'flugbuch.edit.own',
    'events.view',
    'events.create',
    'images.view',
    'images.upload',
    'images.delete.own',
    'images.galleries.manage',
    'documents.view',
    'documents.upload',
    'protocols.view',
    'notifications.send.own'
);

-- Kassenwart Berechtigungen
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'kassenwart' AND p.name IN (
    -- Basis-Rechte
    'articles.view',
    'members.view',
    'members.view.details',
    'flugbuch.view',
    'events.view',
    'images.view',
    'documents.view',
    'documents.upload',
    'protocols.view',
    'protocols.create',
    'protocols.edit'
);

-- ============================================
-- BERECHTIGUNGEN
-- ============================================
-- Diese Berechtigungen werden automatisch gesetzt durch die Installation
-- Sie stellen sicher, dass der DB_USER volle Rechte auf alle Objekte hat

-- Hinweis: Diese SQL-Befehle werden nur ausgeführt wenn der User, der das
-- Schema erstellt (normalerweise postgres), die Rechte dann an DB_USER weitergibt.
-- Das install.sh Script führt zusätzlich GRANT-Befehle aus.
