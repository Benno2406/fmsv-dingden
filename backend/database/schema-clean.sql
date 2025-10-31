-- FMSV Dingden Database Schema
-- PostgreSQL 14+
-- 
-- Hinweis: Initial-Daten (Roles, Permissions) werden separat geladen
-- Siehe: init-data.sql in scripts/

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
