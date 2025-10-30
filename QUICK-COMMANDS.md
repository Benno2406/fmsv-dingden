# Quick Commands - Alle wichtigen Befehle auf einen Blick

---

## ⚡ Setup-Scripts

### Lokale Entwicklung (Automatisch)

**Windows:**
```cmd
setup-dev.bat
```

**Linux/macOS:**
```bash
chmod +x setup-dev.sh
./setup-dev.sh
```

**Installiert:** Frontend, Backend, .env-Datei

---

### Dateien umbenennen (Manuell)

**Windows:**
```cmd
rename-files.bat
```

**Linux/macOS:**
```bash
chmod +x rename-files.sh
./rename-files.sh
```

---

## 📦 Git initialisieren & zu GitHub pushen

```bash
# Git initialisieren (falls nötig)
git init

# Alle Dateien hinzufügen
git add .

# Status prüfen
git status

# Committen
git commit -m "Initial commit - FMSV Dingden"

# GitHub Repository verbinden
git remote add origin https://github.com/dein-username/fmsv-dingden.git

# Pushen
git push -u origin main
```

---

## 🚀 3. Auf Server installieren

```bash
# Auf dem Server einloggen (SSH)
ssh user@deine-server-ip

# Repository klonen
cd /var/www
sudo git clone https://github.com/dein-username/fmsv-dingden.git
cd fmsv-dingden

# Installation starten
cd Installation/scripts
chmod +x install.sh
sudo ./install.sh
```

---

## 🔄 Updates

### Manuelles Update
```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./update.sh
```

### Auto-Update Status
```bash
# Timer-Status
systemctl status fmsv-auto-update.timer

# Service-Status
systemctl status fmsv-auto-update.service

# Logs ansehen
tail -f /var/log/fmsv-auto-update.log
```

---

## 🗂️ Backend Befehle

### Lokale Entwicklung

```bash
# Dependencies installieren
cd backend
npm install

# .env Datei erstellen & anpassen
nano .env

# Datenbank initialisieren
npm run init-db

# Beispiel-Daten laden (optional)
npm run seed

# Development Server (mit Auto-Reload)
npm run dev

# Oder direkt:
node server.js
```

### Production

```bash
cd backend
npm install --production
npm start
```

### Datenbank-Scripts

```bash
cd backend

# Schema erstellen (Tabellen, Indizes)
npm run init-db
# Oder: node scripts/initDatabase.js

# Beispiel-Daten laden
npm run seed
# Oder: node scripts/seedDatabase.js
```

---

## 🌐 Frontend Befehle

### Lokale Entwicklung

```bash
# Dependencies installieren
npm install

# Development Server (Vite)
npm run dev
# Öffnet: http://localhost:5173

# Mit spezifischem Port
npm run dev -- --port 3000

# Mit Host-Zugriff (für lokales Netzwerk)
npm run dev -- --host
```

### Production Build

```bash
# Production Build erstellen
npm run build
# Output: dist/

# Build testen
npm run preview

# Linting
npm run lint
```

### Kombinierte Scripts

```bash
# Alles installieren (Frontend + Backend)
npm run setup

# Backend installieren
npm run backend:install

# Backend Dev-Server
npm run backend:dev

# Backend Production
npm run backend:start
```

---

## 📊 Status-Checks

### PM2 Prozesse
```bash
pm2 status
pm2 logs fmsv-backend
pm2 logs fmsv-frontend
```

### Nginx
```bash
sudo systemctl status nginx
sudo nginx -t
sudo systemctl restart nginx
```

### PostgreSQL
```bash
sudo systemctl status postgresql
sudo -u postgres psql fmsv_dingden
```

---

## 🔐 Cloudflare Tunnel

### Status
```bash
sudo systemctl status cloudflared
```

### Logs
```bash
sudo journalctl -u cloudflared -f
```

### Neustart
```bash
sudo systemctl restart cloudflared
```

---

## 📝 Logs ansehen

### Application Logs
```bash
tail -f /var/www/fmsv-dingden/Logs/app.log
```

### Audit Logs
```bash
tail -f /var/www/fmsv-dingden/Logs/Audit/$(date +%Y-%m-%d).log
```

### Auto-Update Logs
```bash
tail -f /var/log/fmsv-auto-update.log
```

### PM2 Logs
```bash
pm2 logs
pm2 logs fmsv-backend
pm2 logs fmsv-frontend
```

### Nginx Logs
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 🔍 Diagnose

### System-Status
```bash
# Alle Services
systemctl status fmsv-*
systemctl status cloudflared
systemctl status postgresql
systemctl status nginx

# Ports prüfen
sudo netstat -tulpn | grep LISTEN

# Festplatte
df -h

# RAM
free -h

# Prozesse
top
```

### Git-Status
```bash
cd /var/www/fmsv-dingden

# Branch
git branch

# Letzte Commits
git log --oneline -5

# Änderungen
git status

# Remote
git remote -v
```

---

## 🔧 Wartung

### Backup Datenbank
```bash
sudo -u postgres pg_dump fmsv_dingden > backup-$(date +%Y%m%d).sql
```

### Datenbank wiederherstellen
```bash
sudo -u postgres psql fmsv_dingden < backup-20250130.sql
```

### PM2 Neustart
```bash
pm2 restart all
pm2 restart fmsv-backend
pm2 restart fmsv-frontend
```

### Nginx Neustart
```bash
sudo systemctl restart nginx
```

### Vollständiger Neustart
```bash
pm2 restart all
sudo systemctl restart nginx
sudo systemctl restart postgresql
sudo systemctl restart cloudflared
```

---

## 🛑 Stoppen/Starten

### Alles stoppen
```bash
pm2 stop all
sudo systemctl stop nginx
```

### Alles starten
```bash
pm2 start all
sudo systemctl start nginx
```

---

## 🧹 Aufräumen

### PM2 Logs löschen
```bash
pm2 flush
```

### NPM Cache leeren
```bash
npm cache clean --force
```

### Alte Builds löschen
```bash
rm -rf dist/
rm -rf build/
```

---

## 📚 Weitere Befehle

Siehe:
- [`Installation/QUICK-REFERENCE.md`](Installation/QUICK-REFERENCE.md)
- [`Installation/README.md`](Installation/README.md)
- [`backend/README.md`](backend/README.md)

---

**Quick Tip:** Diese Datei als Lesezeichen speichern! 📌
