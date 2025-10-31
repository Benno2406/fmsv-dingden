-- FMSV Development Database Initialization
-- Wird automatisch von Docker Compose ausgeführt

-- Erstelle Development User (falls nicht existiert)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'fmsv_dev_user') THEN
        CREATE USER fmsv_dev_user WITH PASSWORD 'dev123';
    END IF;
END
$$;

-- Gebe Berechtigungen
GRANT ALL PRIVILEGES ON DATABASE fmsv_dev TO fmsv_dev_user;

-- Erstelle Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Info
\echo '✅ Development Database initialized!'
\echo '   Database: fmsv_dev'
\echo '   User: postgres / fmsv_dev_user'
\echo '   Password: postgres / dev123'
\echo ''
\echo '📝 Nächste Schritte:'
\echo '   1. Backend starten: cd ../backend && npm run dev'
\echo '   2. Schema laden: npm run init-db'
\echo '   3. Test-Daten laden: npm run seed'
