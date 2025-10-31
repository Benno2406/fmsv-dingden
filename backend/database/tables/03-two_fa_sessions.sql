-- FMSV Dingden - 2FA Sessions Table
-- Temporäre Sessions für 2-Stufen-Authentifizierung

CREATE TABLE IF NOT EXISTS two_fa_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    temp_token VARCHAR(500) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    verified BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index für schnellere Session-Suche
CREATE INDEX IF NOT EXISTS idx_2fa_sessions_temp_token ON two_fa_sessions(temp_token);
CREATE INDEX IF NOT EXISTS idx_2fa_sessions_user_id ON two_fa_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_2fa_sessions_expires_at ON two_fa_sessions(expires_at);
