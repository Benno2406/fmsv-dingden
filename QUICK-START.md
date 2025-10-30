# FMSV Dingden - Quick Start Guide

Schnellanleitung für lokale Entwicklung und Produktion.

---

## 🎯 Wähle deine Installation

### 👨‍💻 Option 1: Lokale Entwicklung (Automatisch)

```bash
git clone https://github.com/dein-username/fmsv-dingden.git
cd fmsv-dingden

# Windows:
setup-dev.bat

# Linux/macOS:
chmod +x setup-dev.sh
./setup-dev.sh
```

**Script installiert automatisch:** Frontend, Backend, .env-Datei

**Dann:** Datenbank einrichten → siehe unten

**Vollständige Anleitung:** [`DEV-SETUP.md`](DEV-SETUP.md)

---

### 🖥️ Option 2: Server-Installation (Automatisch)

```bash
cd /var/www
git clone https://github.com/Benno2406/fmsv-dingden.git
cd fmsv-dingden/Installation/scripts
chmod +x install.sh
sudo ./install.sh
```

**Script richtet ein:** PostgreSQL, Node.js, PM2, Nginx, Cloudflare Tunnel, Auto-Update

**Vollständige Anleitung:** [`Installation/README.md`](Installation/README.md)

---

## 🚀 Lokale Entwicklung (Manuell)

### Voraussetzungen
- Node.js 20+ LTS
- PostgreSQL 14+
- Git

### 1. Repository clonen

```bash
git clone https://github.com/dein-username/fmsv-dingden.git
cd fmsv-dingden

# Dateien umbenennen
chmod +x rename-files.sh
./rename-files.sh  # oder rename-files.bat
```

### 2. Datenbank erstellen

```bash
# PostgreSQL starten (je nach OS)
sudo systemctl start postgresql  # Linux
brew services start postgresql   # macOS

# Datenbank erstellen
sudo -u postgres psql
```

In der PostgreSQL Console:

```sql
CREATE DATABASE fmsv_database;
CREATE USER fmsv_user WITH ENCRYPTED PASSWORD 'dev123';
GRANT ALL PRIVILEGES ON DATABASE fmsv_database TO fmsv_user;
ALTER DATABASE fmsv_database OWNER TO fmsv_user;
\c fmsv_database
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
\q
```

### 3. Backend einrichten

```bash
cd backend
npm install

# .env erstellen
cp .env.example .env
```

**.env bearbeiten** (nur für Dev notwendig):

```env
DB_PASSWORD=dev123
JWT_SECRET=dev_secret_change_in_production
JWT_REFRESH_SECRET=dev_refresh_secret_change_in_production
```

```bash
# Datenbank initialisieren
npm run init-db

# Test-Daten einfügen
npm run seed

# Backend starten
npm run dev
```

✅ Backend läuft auf: `http://localhost:3000`

### 4. Frontend starten

```bash
# Neues Terminal öffnen
cd ..  # zurück zum Projekt-Root
npm install
npm run dev
```

✅ Frontend läuft auf: `http://localhost:5173`

### 5. Einloggen

Öffne Browser: `http://localhost:5173`

**Test-Accounts:**
- Admin: `admin@fmsv-dingden.de` / `admin123`
- Member: `member@fmsv-dingden.de` / `member123`

---

## 🌐 Production Deployment (10-15 Minuten)

### Voraussetzungen
- Debian 12/13 Server
- Root-Zugriff
- Domain bei Cloudflare verwaltet

### 1. Repository klonen

```bash
cd /var/www
git clone https://github.com/dein-username/fmsv-dingden.git
cd fmsv-dingden
```

### 2. Installation starten

```bash
cd Installation/scripts
chmod +x install.sh
sudo ./install.sh
```

### 3. Installations-Dialog folgen

Das Script fragt dich:

1. **Update-Kanal**: Stable (empfohlen) oder Testing
2. **Cloudflare Tunnel**: Ja (empfohlen) oder Nein
3. **GitHub Repository**: URL eingeben
4. **Auto-Update**: Täglich, Wöchentlich, oder Manuell
5. **Datenbank**: Name, Benutzer, Passwort

### 4. Das Script installiert automatisch

- ✅ PostgreSQL + Node.js
- ✅ Backend mit allen Dependencies
- ✅ Frontend (gebaut und deployed)
- ✅ Nginx Webserver
- ✅ Cloudflare Tunnel (optional)
- ✅ Auto-Update System (optional)

### 4. Nginx installieren und konfigurieren

```bash
apt-get install -y nginx

# Nginx-Config erstellen
nano /etc/nginx/sites-available/fmsv-dingden
```

Kopiere die Nginx-Config aus `/Installation/Anleitung/Komplette-Installation.md`

```bash
# Config aktivieren
ln -s /etc/nginx/sites-available/fmsv-dingden /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# Nginx testen und starten
nginx -t
systemctl restart nginx
```

### 5. Fertig! 🎉

**Deine Website läuft auf:** `https://fmsv.bartholmes.eu`

**Login:**
- Admin: `admin@fmsv-dingden.de` / `admin123`
- Member: `member@fmsv-dingden.de` / `member123`

**Services:**
```bash
systemctl status fmsv-backend
systemctl status nginx
systemctl status cloudflared  # falls Cloudflare Tunnel
systemctl status fmsv-auto-update.timer  # falls Auto-Update
```

### 6. E-Mail konfigurieren (Optional)

```bash
nano /var/www/fmsv-dingden/backend/.env
```

Siehe: `/Installation/Anleitung/E-Mail-Setup.md`

---

## 🔧 Häufige Commands

### Backend

```bash
# Status prüfen
systemctl status fmsv-backend

# Logs ansehen
journalctl -u fmsv-backend -f

# Neustart
systemctl restart fmsv-backend

# Stoppen
systemctl stop fmsv-backend
```

### Frontend

```bash
# Development
npm run dev

# Production Build
npm run build

# Build Preview
npm run preview
```

### Datenbank

```bash
# PostgreSQL Console
sudo -u postgres psql fmsv_database

# Backup erstellen
sudo -u postgres pg_dump fmsv_database > backup.sql

# Backup wiederherstellen
sudo -u postgres psql fmsv_database < backup.sql
```

---

## 🆘 Troubleshooting

### Backend startet nicht

```bash
# Logs prüfen
journalctl -u fmsv-backend -f

# Häufige Ursachen:
# 1. Datenbank läuft nicht
systemctl status postgresql

# 2. .env fehlt oder falsch
cat /var/www/fmsv-dingden/backend/.env

# 3. Port 3000 bereits belegt
lsof -i :3000
```

### Frontend zeigt weißen Bildschirm

```bash
# Console im Browser prüfen (F12)
# Häufige Ursachen:
# 1. Backend nicht erreichbar
curl http://localhost:3000/api/health

# 2. CORS-Fehler
# BASE_URL in backend/.env prüfen
```

### Datenbank-Verbindungsfehler

```bash
# PostgreSQL läuft?
systemctl status postgresql

# Credentials korrekt?
sudo -u postgres psql fmsv_database

# In .env:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=fmsv_database
# DB_USER=fmsv_user
# DB_PASSWORD=<dein_passwort>
```

---

## 📚 Weitere Dokumentation

- **Installation**: `/Installation/Anleitung/Installation.md`
- **E-Mail Setup**: `/Installation/Anleitung/E-Mail-Setup.md`
- **Cloudflare Tunnel**: `/Installation/Anleitung/Cloudflare-Tunnel-Setup.md`
- **Backend API**: `/backend/API-Dokumentation.md`
- **Haupt-README**: `/README.md`

---

## 🎯 Nächste Schritte

Nach erfolgreicher Installation:

1. ✅ Admin-Passwort ändern
2. ✅ Test-Daten löschen
3. ✅ Echte Mitglieder anlegen
4. ✅ Artikel und Termine erstellen
5. ✅ Logo und Bilder hochladen
6. ✅ E-Mail-Versand testen
7. ✅ 2FA für Admin aktivieren
8. ✅ Backup-System testen

---

**Viel Erfolg!** ✈️

Bei Fragen: Siehe Troubleshooting oder Dokumentation.
