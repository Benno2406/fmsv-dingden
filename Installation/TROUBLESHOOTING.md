# 🔧 FMSV Dingden - Troubleshooting Guide

Umfassende Fehlersuche und Problemlösungen für das FMSV Dingden System.

---

## 🚀 Schnellstart: Sofort-Hilfe

### Problem nicht sicher? Starte hier:

```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./quick-500-debug.sh
```

Dieser Befehl findet automatisch die häufigsten Probleme und zeigt Lösungen.

---

## 📋 Inhaltsverzeichnis

1. [500 Internal Server Error](#500-internal-server-error)
2. [502 Bad Gateway](#502-bad-gateway)
3. [Backend startet nicht](#backend-startet-nicht)
4. [Datenbank-Probleme](#datenbank-probleme)
5. [Nginx-Probleme](#nginx-probleme)
6. [Cloudflare Tunnel](#cloudflare-tunnel)
7. [Fehlende Dateien](#fehlende-dateien)
8. [Performance-Probleme](#performance-probleme)
9. [Authentifizierung](#authentifizierung)
10. [Upload-Probleme](#upload-probleme)

---

## 🚨 500 Internal Server Error

### Symptome
- Frontend zeigt "500 Internal Server Error"
- API-Aufrufe schlagen fehl
- Backend läuft aber antwortet nicht korrekt

### Schnelle Diagnose

```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./quick-500-debug.sh
```

### Häufigste Ursachen & Lösungen

#### 1. .env Datei fehlt oder unvollständig

**Prüfen:**
```bash
cat /var/www/fmsv-dingden/backend/.env | grep JWT_SECRET
cat /var/www/fmsv-dingden/backend/.env | grep DB_PASSWORD
```

**Lösung:**
```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./debug.sh
# Option [2] → Quick-Fix mit "j" bestätigen
```

#### 2. Datenbank nicht initialisiert

**Prüfen:**
```bash
sudo -u postgres psql -d fmsv_dingden -c "\dt"
```

**Lösung:**
```bash
cd /var/www/fmsv-dingden/backend
sudo node scripts/initDatabase.js
sudo systemctl restart fmsv-backend
```

#### 3. Node.js Dependencies fehlen

**Prüfen:**
```bash
ls /var/www/fmsv-dingden/backend/node_modules/ | grep express
```

**Lösung:**
```bash
cd /var/www/fmsv-dingden/backend
sudo npm install
sudo systemctl restart fmsv-backend
```

#### 4. JWT_SECRET fehlt

**Prüfen:**
```bash
grep "^JWT_SECRET=" /var/www/fmsv-dingden/backend/.env
```

**Lösung:**
```bash
# Generiere neuen Secret
NEW_SECRET=$(openssl rand -base64 64 | tr -d '\n')

# Füge zu .env hinzu
echo "JWT_SECRET=$NEW_SECRET" | sudo tee -a /var/www/fmsv-dingden/backend/.env

# Service neustarten
sudo systemctl restart fmsv-backend
```

### Erweiterte Diagnose

```bash
# Vollständiger Backend-Test
sudo ./test-backend.sh

# Live-Logs ansehen
sudo journalctl -u fmsv-backend -f
```

---

## 🔌 502 Bad Gateway

### Symptome
- Nginx zeigt "502 Bad Gateway"
- Frontend lädt nicht
- API nicht erreichbar

### Diagnose

```bash
# 1. Backend Status
sudo systemctl status fmsv-backend

# 2. Nginx Status
sudo systemctl status nginx

# 3. Port Check
sudo netstat -tulpn | grep :5000
```

### Lösungen

#### Backend läuft nicht

```bash
sudo systemctl start fmsv-backend
sudo systemctl enable fmsv-backend
```

#### Nginx Proxy fehlkonfiguriert

```bash
# Config testen
sudo nginx -t

# Wenn Fehler, Config prüfen
sudo nano /etc/nginx/sites-available/fmsv-dingden

# Sollte enthalten:
# location /api {
#     proxy_pass http://localhost:5000;
#     ...
# }

# Nginx neu laden
sudo systemctl reload nginx
```

#### Port-Konflikt

```bash
# Prüfe welcher Prozess Port 5000 nutzt
sudo netstat -tulpn | grep :5000

# Anderen Prozess beenden oder Port in .env ändern
sudo nano /var/www/fmsv-dingden/backend/.env
# PORT=5001

sudo systemctl restart fmsv-backend
```

---

## 💀 Backend startet nicht

### Symptome
- `systemctl status fmsv-backend` zeigt "failed"
- Service startet kurz und stirbt sofort
- Fehler in Logs

### Diagnose

```bash
# Detaillierte Logs
sudo journalctl -u fmsv-backend -n 100 --no-pager

# Test ob server.js lädt
cd /var/www/fmsv-dingden/backend
node -c server.js
```

### Häufige Fehler

#### SyntaxError in JavaScript

**Symptom:**
```
SyntaxError: Unexpected token
```

**Lösung:**
```bash
# Prüfe server.js auf Syntax
node -c /var/www/fmsv-dingden/backend/server.js

# Falls Fehler: Code-Review oder aus Git wiederherstellen
cd /var/www/fmsv-dingden
sudo git checkout -- backend/server.js
sudo systemctl restart fmsv-backend
```

#### Cannot find module 'xxx'

**Symptom:**
```
Error: Cannot find module 'express'
```

**Lösung:**
```bash
cd /var/www/fmsv-dingden/backend
sudo npm install
sudo systemctl restart fmsv-backend
```

#### EADDRINUSE: Port bereits belegt

**Symptom:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Lösung:**
```bash
# Finde den Prozess
sudo lsof -i :5000

# Beende ihn
sudo kill -9 <PID>

# Oder ändere Port
sudo nano /var/www/fmsv-dingden/backend/.env
# PORT=5001

sudo systemctl restart fmsv-backend
```

#### Database connection error

**Symptom:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Lösung:**
```bash
# PostgreSQL starten
sudo systemctl start postgresql

# .env prüfen
cat /var/www/fmsv-dingden/backend/.env | grep DB_

# Verbindung testen
sudo -u postgres psql -d fmsv_dingden -c "SELECT 1;"
```

---

## 🗃️ Datenbank-Probleme

### PostgreSQL läuft nicht

```bash
# Status prüfen
sudo systemctl status postgresql

# Starten
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Logs ansehen
sudo journalctl -u postgresql -n 50
```

### Datenbank existiert nicht

```bash
# Prüfen
sudo -u postgres psql -l | grep fmsv

# Erstellen
sudo -u postgres psql <<EOF
CREATE DATABASE fmsv_dingden;
CREATE USER fmsv_user WITH PASSWORD 'dein_passwort';
GRANT ALL PRIVILEGES ON DATABASE fmsv_dingden TO fmsv_user;
ALTER DATABASE fmsv_dingden OWNER TO fmsv_user;
EOF

# Schema initialisieren
cd /var/www/fmsv-dingden/backend
sudo node scripts/initDatabase.js
```

### Verbindungsfehler

```bash
# pg_hba.conf prüfen
sudo cat /etc/postgresql/*/main/pg_hba.conf | grep local

# Sollte enthalten:
# local   all   all   trust
# oder
# local   all   all   md5

# PostgreSQL neu starten
sudo systemctl restart postgresql
```

### Tabellen fehlen

```bash
# Prüfen
sudo -u postgres psql -d fmsv_dingden -c "\dt"

# Schema neu initialisieren
cd /var/www/fmsv-dingden/backend
sudo node scripts/initDatabase.js
```

### Backup & Restore

```bash
# Backup erstellen
sudo -u postgres pg_dump fmsv_dingden > /tmp/backup-$(date +%Y%m%d).sql

# Restore
sudo -u postgres psql fmsv_dingden < /tmp/backup-20251030.sql
```

---

## 🌐 Nginx-Probleme

### Nginx startet nicht

```bash
# Config testen
sudo nginx -t

# Fehler beheben (meist Syntax)
sudo nano /etc/nginx/sites-available/fmsv-dingden

# Starten
sudo systemctl start nginx
```

### 404 Not Found

**Ursache:** Frontend-Routing nicht konfiguriert

**Lösung:**
```nginx
# In /etc/nginx/sites-available/fmsv-dingden

location / {
    try_files $uri $uri/ /index.html;
}
```

```bash
sudo systemctl reload nginx
```

### CORS-Fehler

**Symptom:** Browser Console zeigt CORS-Fehler

**Lösung 1:** Backend CORS konfigurieren
```javascript
// In backend/server.js sollte sein:
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));
```

**Lösung 2:** Nginx Proxy Headers
```nginx
location /api {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

---

## ☁️ Cloudflare Tunnel

### Tunnel läuft nicht

```bash
# Status prüfen
sudo systemctl status cloudflared

# Starten
sudo systemctl start cloudflared

# Logs
sudo journalctl -u cloudflared -n 50
```

### Tunnel verbindet nicht

```bash
# Config prüfen
sudo cat /etc/cloudflared/config.yml

# Test
sudo cloudflared tunnel run <tunnel-name>

# Wenn erfolgreich, als Service
sudo systemctl restart cloudflared
```

### DNS funktioniert nicht

```bash
# Cloudflare Dashboard → DNS → CNAME prüfen
# Sollte zeigen: xxx.cfargotunnel.com

# DNS-Test
nslookup deine-domain.de

# Cloudflare Tunnel Test
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./debug.sh
# Option [3]: Cloudflare Tunnel Test
```

---

## 📁 Fehlende Dateien

### schema.sql fehlt

```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./repair-files.sh
# Option [1]: Git Pull
```

### node_modules fehlt

```bash
cd /var/www/fmsv-dingden/backend
sudo npm install
```

### Frontend Build fehlt

```bash
cd /var/www/fmsv-dingden
sudo npm install
sudo npm run build
```

---

## 🐌 Performance-Probleme

### Backend langsam

```bash
# 1. PostgreSQL Verbindungen prüfen
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"

# 2. Logs auf langsame Queries prüfen
sudo journalctl -u fmsv-backend -n 100 | grep "slow query"

# 3. PostgreSQL tunen
sudo nano /etc/postgresql/*/main/postgresql.conf
# shared_buffers = 256MB
# effective_cache_size = 1GB

sudo systemctl restart postgresql
```

### Disk Space voll

```bash
# Prüfen
df -h

# Alte Logs löschen
sudo journalctl --vacuum-time=7d

# Alte Backups löschen
sudo find /tmp -name "backup-*.sql" -mtime +30 -delete
```

---

## 🔐 Authentifizierung

### JWT Token ungültig

```bash
# JWT_SECRET prüfen
grep JWT_SECRET /var/www/fmsv-dingden/backend/.env

# Wenn leer, neu generieren
NEW_SECRET=$(openssl rand -base64 64)
echo "JWT_SECRET=$NEW_SECRET" | sudo tee -a /var/www/fmsv-dingden/backend/.env

sudo systemctl restart fmsv-backend
```

### 2FA funktioniert nicht

```bash
# Logs prüfen
sudo journalctl -u fmsv-backend -n 50 | grep "2FA"

# Datenbank prüfen
sudo -u postgres psql -d fmsv_dingden -c "SELECT email, two_fa_enabled FROM users;"
```

---

## 📤 Upload-Probleme

### Upload schlägt fehl

```bash
# 1. Verzeichnis prüfen
ls -la /var/www/fmsv-dingden/Saves/

# 2. Berechtigungen setzen
sudo chown -R www-data:www-data /var/www/fmsv-dingden/Saves
sudo chmod -R 755 /var/www/fmsv-dingden/Saves

# 3. Nginx Upload-Größe
sudo nano /etc/nginx/nginx.conf
# client_max_body_size 50M;

sudo systemctl reload nginx
```

---

## 🛠️ Debug-Tools Übersicht

### Quick-Diagnose (Schnellste)
```bash
sudo ./quick-500-debug.sh
```

### Backend Runtime Test
```bash
sudo ./test-backend.sh
```

### Haupt-Debug-Menü
```bash
sudo ./debug.sh
```

### Datei-Reparatur
```bash
sudo ./repair-files.sh
```

---

## 📞 Wenn nichts hilft

### 1. Komplette Diagnose erstellen

```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./debug.sh > /tmp/full-diagnose.txt 2>&1
# Option [4]: Vollständige Diagnose
```

### 2. Alle Logs sammeln

```bash
# Backend
sudo journalctl -u fmsv-backend -n 200 > /tmp/backend-logs.txt

# PostgreSQL
sudo journalctl -u postgresql -n 100 > /tmp/postgres-logs.txt

# Nginx
sudo cat /var/log/nginx/fmsv-error.log > /tmp/nginx-errors.txt

# Cloudflare
sudo journalctl -u cloudflared -n 50 > /tmp/cloudflare-logs.txt
```

### 3. System-Info

```bash
{
    echo "=== System ==="
    uname -a
    echo ""
    echo "=== Node.js ==="
    node --version
    npm --version
    echo ""
    echo "=== PostgreSQL ==="
    psql --version
    echo ""
    echo "=== Nginx ==="
    nginx -v
    echo ""
    echo "=== Disk Space ==="
    df -h
    echo ""
    echo "=== Memory ==="
    free -h
} > /tmp/system-info.txt
```

### 4. Neuinstallation

**NUR als letzter Ausweg!**

```bash
# Backup!
sudo -u postgres pg_dump fmsv_dingden > /tmp/db-backup.sql
sudo cp /var/www/fmsv-dingden/backend/.env /tmp/env-backup

# Neu installieren
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./install.sh

# Daten wiederherstellen
sudo -u postgres psql fmsv_dingden < /tmp/db-backup.sql
```

---

**Version:** 1.0  
**Letzte Aktualisierung:** 30. Oktober 2025
