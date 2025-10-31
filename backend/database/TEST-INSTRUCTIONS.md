# 🧪 Datenbank-Initialisierung testen

## Schnelltest (Local)

```bash
# 1. PostgreSQL starten (falls nicht läuft)
sudo systemctl start postgresql

# 2. Testdatenbank erstellen
sudo -u postgres psql <<EOF
DROP DATABASE IF EXISTS fmsv_test;
DROP USER IF EXISTS fmsv_test_user;
CREATE USER fmsv_test_user WITH PASSWORD 'test123';
CREATE DATABASE fmsv_test OWNER fmsv_test_user;
GRANT ALL PRIVILEGES ON DATABASE fmsv_test TO fmsv_test_user;
\c fmsv_test
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
GRANT ALL ON SCHEMA public TO fmsv_test_user;
ALTER SCHEMA public OWNER TO fmsv_test_user;
EOF

# 3. .env für Test erstellen
cd backend
cp .env .env.backup  # Backup erstellen
cat > .env.test <<EOF
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fmsv_test
DB_USER=fmsv_test_user
DB_PASSWORD=test123
EOF

# 4. Test ausführen
NODE_ENV=development node -r dotenv/config scripts/initDatabase.js dotenv_config_path=.env.test

# 5. Ergebnis prüfen
sudo -u postgres psql fmsv_test <<EOF
-- Tabellen zählen
SELECT COUNT(*) AS table_count FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Rollen zählen
SELECT COUNT(*) AS role_count FROM roles;

-- Permissions zählen
SELECT COUNT(*) AS permission_count FROM permissions;

-- Role-Permission-Zuordnungen zählen
SELECT COUNT(*) AS assignment_count FROM role_permissions;

-- Übersicht der Rollen
SELECT name, display_name, level, max_upload_size_mb 
FROM roles 
ORDER BY level DESC;
EOF

# 6. Aufräumen
mv .env.backup .env
sudo -u postgres psql <<EOF
DROP DATABASE IF EXISTS fmsv_test;
DROP USER IF EXISTS fmsv_test_user;
EOF
```

## Erwartete Ergebnisse

### Tabellen-Anzahl: **15**

- users
- refresh_tokens
- two_fa_sessions
- two_fa_backup_codes
- roles
- permissions
- role_permissions
- user_roles
- articles
- events
- flugbuch
- images
- protocols
- notifications
- audit_log

### Rollen-Anzahl: **12**

| Rolle | Level |
|-------|-------|
| superadmin | 1000 |
| admin | 900 |
| vorstand | 800 |
| webmaster | 750 |
| kassenwart | 700 |
| schriftfuehrer | 650 |
| jugendwart | 600 |
| fluglehrer | 550 |
| aktives_mitglied | 500 |
| ehrenmitglied | 450 |
| passives_mitglied | 400 |
| gastmitglied | 300 |

### Permissions-Anzahl: **~100**

- members: 10
- roles: 7
- articles: 8
- events: 7
- flugbuch: 9
- images: 12
- documents: 7
- protocols: 9
- notifications: 4
- system: 6
- statistics: 3
- audit: 3
- security: 4

**Gesamt: ~90 Permissions**

### Role-Permission-Assignments: **~300**

- Superadmin: Alle (~90)
- Admin: ~85 (alle außer database_access)
- Vorstand: ~40
- Webmaster: ~35
- Andere Rollen: 10-30 je nach Rolle

## Fehlersuche

### Fehler: "Datei nicht gefunden"

```bash
# Prüfe ob alle Dateien existieren
ls -la backend/database/tables/
ls -la backend/database/data/
```

### Fehler: "ECONNREFUSED"

```bash
# PostgreSQL Status prüfen
sudo systemctl status postgresql

# Starten falls nötig
sudo systemctl start postgresql
```

### Fehler: "password authentication failed"

```bash
# Credentials in .env prüfen
cat backend/.env | grep DB_

# Oder Test-User neu erstellen
sudo -u postgres psql <<EOF
DROP USER IF EXISTS fmsv_test_user;
CREATE USER fmsv_test_user WITH PASSWORD 'test123';
EOF
```

### Fehler: "SQL syntax error"

```bash
# Einzelne Datei testen
sudo -u postgres psql fmsv_test -f backend/database/tables/01-users.sql

# Logs ansehen
journalctl -u postgresql -n 50
```

## Production-Test (auf Server)

```bash
# SSH zum Server
ssh root@dein-server

# Ins Projekt-Verzeichnis
cd /var/www/fmsv-dingden/backend

# Backup erstellen (WICHTIG!)
sudo -u postgres pg_dump fmsv_dingden > /tmp/fmsv_backup_$(date +%Y%m%d_%H%M%S).sql

# Test mit --dry-run (simuliert nur)
# TODO: Dry-run Modus implementieren

# Echte Initialisierung
node scripts/initDatabase.js

# Prüfen
sudo -u postgres psql fmsv_dingden -c "\dt"  # Tabellen
sudo -u postgres psql fmsv_dingden -c "SELECT COUNT(*) FROM roles;"
sudo -u postgres psql fmsv_dingden -c "SELECT COUNT(*) FROM permissions;"
```

## Automatischer Test (CI/CD)

Erstelle `.github/workflows/test-database.yml`:

```yaml
name: Test Database Init

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: |
          cd backend
          npm install
      
      - name: Create test database
        run: |
          PGPASSWORD=postgres psql -h localhost -U postgres <<EOF
          CREATE USER fmsv_test WITH PASSWORD 'test123';
          CREATE DATABASE fmsv_test OWNER fmsv_test;
          \c fmsv_test
          CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
          GRANT ALL ON SCHEMA public TO fmsv_test;
          EOF
      
      - name: Run database init
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_NAME: fmsv_test
          DB_USER: fmsv_test
          DB_PASSWORD: test123
        run: |
          cd backend
          node scripts/initDatabase.js
      
      - name: Verify tables
        run: |
          RESULT=$(PGPASSWORD=test123 psql -h localhost -U fmsv_test fmsv_test -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'")
          if [ "$RESULT" -ne 15 ]; then
            echo "Expected 15 tables, got $RESULT"
            exit 1
          fi
      
      - name: Verify roles
        run: |
          RESULT=$(PGPASSWORD=test123 psql -h localhost -U fmsv_test fmsv_test -t -c "SELECT COUNT(*) FROM roles")
          if [ "$RESULT" -ne 12 ]; then
            echo "Expected 12 roles, got $RESULT"
            exit 1
          fi
```

## Performance-Test

```bash
# Zeit messen
time node scripts/initDatabase.js

# Erwartete Dauer: < 5 Sekunden
```

## Rollback

Falls etwas schiefgeht:

```bash
# Backup wiederherstellen
sudo -u postgres psql <<EOF
DROP DATABASE IF EXISTS fmsv_dingden;
CREATE DATABASE fmsv_dingden;
EOF

sudo -u postgres psql fmsv_dingden < /tmp/fmsv_backup_DATUM.sql
```
