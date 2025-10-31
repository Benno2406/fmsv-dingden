# 🔧 Backend nicht erreichbar - Lösungen

## 🎯 Schnelle Diagnose

```bash
cd backend

# Mache Diagnose-Script ausführbar
chmod +x diagnose.sh

# Führe Diagnose aus
./diagnose.sh
```

Das Script zeigt dir **genau**, was das Problem ist.

## 🔍 Häufige Probleme & Lösungen

### 1. Dependencies fehlen

**Problem:**
```
Error: Cannot find module 'express'
```

**Lösung:**
```bash
cd backend
npm install
```

### 2. .env Datei fehlt

**Problem:**
```
Datenbank-Verbindung fehlgeschlagen
DB_HOST: nicht gesetzt
```

**Lösung:**
```bash
# .env Datei erstellen
cp env.example.txt .env

# Mit Editor öffnen und ausfüllen
nano .env
```

**Mindest-Konfiguration in `.env`:**
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fmsv_database
DB_USER=fmsv_user
DB_PASSWORD=dein_sicheres_passwort

# JWT
JWT_SECRET=generiere_einen_langen_zufaelligen_string
JWT_REFRESH_SECRET=noch_ein_anderer_langer_string
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=production
BASE_URL=https://fmsv.bartholmes.eu
```

### 3. Port bereits belegt

**Problem:**
```
Port 3000 ist bereits belegt!
```

**Lösung A - Anderen Prozess beenden:**
```bash
# Finde Prozess
lsof -i :3000

# Beende Prozess
kill -9 $(lsof -t -i:3000)
```

**Lösung B - Anderen Port verwenden:**
```bash
# In .env ändern
PORT=3001
```

### 4. PostgreSQL läuft nicht

**Problem:**
```
Datenbank-Verbindung fehlgeschlagen
connection refused
```

**Lösung:**
```bash
# PostgreSQL starten
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Status prüfen
sudo systemctl status postgresql
```

### 5. Datenbank existiert nicht

**Problem:**
```
database "fmsv_database" does not exist
```

**Lösung:**
```bash
# Datenbank erstellen
sudo -u postgres psql <<EOF
CREATE DATABASE fmsv_database;
CREATE USER fmsv_user WITH PASSWORD 'dein_passwort';
GRANT ALL PRIVILEGES ON DATABASE fmsv_database TO fmsv_user;
\c fmsv_database
GRANT ALL ON SCHEMA public TO fmsv_user;
EOF

# Datenbank initialisieren
cd backend
node scripts/initDatabase.js
```

### 6. Logs/Saves Verzeichnisse fehlen

**Problem:**
```
ENOENT: no such file or directory, mkdir '../Logs'
```

**Lösung:**
```bash
# Verzeichnisse erstellen
mkdir -p Logs/Audit
mkdir -p Saves
```

### 7. Module-Fehler (ESM vs CommonJS)

**Problem:**
```
SyntaxError: Cannot use import statement outside a module
```

**Lösung:**
Das sollte jetzt behoben sein. Falls es noch auftritt:

```bash
# Prüfe package.json
cat backend/package.json | grep "type"

# Sollte KEINE "type": "module" Zeile haben!
# Falls doch, entfernen!
```

### 8. Stack Overflow beim Start

**Problem:**
```
RangeError: Maximum call stack size exceeded
```

**Lösung:**
Siehe `/PROBLEM-GELOEST.md` - sollte bereits behoben sein.

```bash
# Falls nicht, Database neu initialisieren
cd backend
node scripts/initDatabase.js
```

## 🧪 Manuelle Tests

### Test 1: Node.js Module laden

```bash
cd backend
node test-backend.js
```

**Erwartete Ausgabe:**
```
✅ ALLE TESTS BESTANDEN!
```

### Test 2: Server manuell starten

```bash
cd backend
node server.js
```

**Erwartete Ausgabe:**
```
✅ Datenbank-Verbindung erfolgreich
🚀 FMSV Backend läuft auf Port 3000
📍 Environment: production
🔗 Base URL: https://fmsv.bartholmes.eu
🔐 RBAC-System: AKTIV
🔑 2FA-Support: AKTIV
📊 Upload-Limits: Pro Rolle konfigurierbar
✨ Backend bereit!
```

### Test 3: API-Endpunkt testen

```bash
# Health-Check
curl http://localhost:3000/api/health

# Erwartete Antwort:
{
  "status": "ok",
  "timestamp": "2025-10-31T...",
  "uptime": 123.456
}
```

### Test 4: Login testen

```bash
# Admin-Login (nach seedDatabase.js)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@fmsv-dingden.de",
    "password": "admin123"
  }'

# Erwartete Antwort:
{
  "success": true,
  "token": "eyJhbGci...",
  "user": {
    "id": "...",
    "email": "admin@fmsv-dingden.de"
  }
}
```

## 📋 Checkliste

Gehe diese Punkte durch:

- [ ] Node.js installiert (`node --version`)
- [ ] npm installiert (`npm --version`)
- [ ] Dependencies installiert (`npm install`)
- [ ] .env Datei existiert und ausgefüllt
- [ ] PostgreSQL läuft (`systemctl status postgresql`)
- [ ] Datenbank existiert (`sudo -u postgres psql -l | grep fmsv`)
- [ ] Datenbank initialisiert (`node scripts/initDatabase.js`)
- [ ] Port 3000 verfügbar (`lsof -i :3000`)
- [ ] Logs/ Verzeichnis existiert
- [ ] Saves/ Verzeichnis existiert
- [ ] Alle Module laden (`node test-backend.js`)
- [ ] Server startet (`node server.js`)
- [ ] Health-Check OK (`curl localhost:3000/api/health`)

## 🚀 Wenn alles funktioniert

### Mit npm:

```bash
cd backend
npm start
```

### Als Systemd Service:

```bash
# Service-Datei erstellen
sudo nano /etc/systemd/system/fmsv-backend.service
```

```ini
[Unit]
Description=FMSV Backend Server
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/fmsv-dingden/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node /var/www/fmsv-dingden/backend/server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=fmsv-backend

[Install]
WantedBy=multi-user.target
```

```bash
# Service aktivieren
sudo systemctl daemon-reload
sudo systemctl enable fmsv-backend
sudo systemctl start fmsv-backend
sudo systemctl status fmsv-backend

# Logs anschauen
journalctl -u fmsv-backend -f
```

## 📊 Debugging-Tipps

### Detaillierte Logs

```bash
# Backend im Debug-Modus starten
NODE_ENV=development node server.js

# Oder mit mehr Details
DEBUG=* node server.js
```

### PostgreSQL Query-Logs

```bash
# Logs ansehen
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### Backend-Logs

```bash
# Echtzeit-Logs
tail -f backend/Logs/combined.log

# Fehler-Logs
tail -f backend/Logs/error.log

# Audit-Logs
tail -f backend/Logs/Audit/audit-*.log
```

### Memory Issues

```bash
# Backend mit mehr Memory starten
node --max-old-space-size=4096 server.js
```

### Netzwerk prüfen

```bash
# Welche Prozesse hören auf Ports?
netstat -tulpn | grep :3000
netstat -tulpn | grep :5432

# Firewall OK?
sudo ufw status

# Port 3000 offen?
sudo ufw allow 3000
```

## 🆘 Immer noch Probleme?

### Kompletter Neustart

```bash
# 1. Alles stoppen
sudo systemctl stop fmsv-backend
sudo pkill -f "node.*server.js"

# 2. Neu installieren
cd /var/www/fmsv-dingden/backend
rm -rf node_modules
npm install

# 3. Datenbank neu initialisieren
node scripts/initDatabase.js
node scripts/seedDatabase.js

# 4. Neu starten
node server.js
```

### Von vorne beginnen

```bash
# PostgreSQL komplett neu
sudo -u postgres psql <<EOF
DROP DATABASE IF EXISTS fmsv_database;
DROP USER IF EXISTS fmsv_user;

CREATE DATABASE fmsv_database;
CREATE USER fmsv_user WITH PASSWORD 'neues_passwort';
GRANT ALL PRIVILEGES ON DATABASE fmsv_database TO fmsv_user;
\c fmsv_database
GRANT ALL ON SCHEMA public TO fmsv_user;
EOF

# Backend neu aufsetzen
cd /var/www/fmsv-dingden/backend
rm -rf node_modules Logs
npm install
mkdir -p ../Logs/Audit ../Saves

# .env neu erstellen
cp env.example.txt .env
nano .env  # Ausfüllen!

# Datenbank initialisieren
node scripts/initDatabase.js
node scripts/seedDatabase.js

# Starten
npm start
```

## 📞 Logs für Support

Falls du Hilfe brauchst, sammle diese Infos:

```bash
#!/bin/bash
echo "=== System Info ===" > backend-debug.txt
node --version >> backend-debug.txt
npm --version >> backend-debug.txt
echo "" >> backend-debug.txt

echo "=== PostgreSQL ===" >> backend-debug.txt
pg_config --version >> backend-debug.txt
systemctl status postgresql >> backend-debug.txt
echo "" >> backend-debug.txt

echo "=== Backend Diagnose ===" >> backend-debug.txt
cd backend
./diagnose.sh >> ../backend-debug.txt 2>&1
echo "" >> ../backend-debug.txt

echo "=== Module Test ===" >> ../backend-debug.txt
node test-backend.js >> ../backend-debug.txt 2>&1
echo "" >> ../backend-debug.txt

echo "=== Error Logs ===" >> ../backend-debug.txt
tail -50 backend/Logs/error.log >> ../backend-debug.txt 2>&1

echo "Debug-Infos gespeichert in: backend-debug.txt"
```

---

**Erstellt:** 31.10.2025  
**Letzte Aktualisierung:** 31.10.2025  
**Status:** Aktiv
