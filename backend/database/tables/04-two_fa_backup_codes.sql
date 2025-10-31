-- FMSV Dingden - 2FA Backup Codes Table
-- Einmalige Backup-Codes für 2FA

CREATE TABLE IF NOT EXISTS two_fa_backup_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code_hash VARCHAR(255) NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index für schnellere Code-Suche
CREATE INDEX IF NOT EXISTS idx_2fa_backup_codes_user_id ON two_fa_backup_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_2fa_backup_codes_used ON two_fa_backup_codes(used);
