-- FMSV Dingden - Protocols Table
-- Protokolle und Sitzungen

CREATE TABLE IF NOT EXISTS protocols (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    protocol_date DATE NOT NULL,
    content TEXT NOT NULL,
    protocol_type VARCHAR(50),
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index für schnellere Suche
CREATE INDEX IF NOT EXISTS idx_protocols_protocol_date ON protocols(protocol_date);
CREATE INDEX IF NOT EXISTS idx_protocols_author_id ON protocols(author_id);
CREATE INDEX IF NOT EXISTS idx_protocols_is_published ON protocols(is_published);
CREATE INDEX IF NOT EXISTS idx_protocols_type ON protocols(protocol_type);
