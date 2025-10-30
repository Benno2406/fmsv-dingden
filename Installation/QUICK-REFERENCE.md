# Quick Reference - FMSV Installation

Schnelle Befehls-Referenz für alle wichtigen Operationen.

## 🚀 Installation

```bash
# Auf Server einloggen
ssh root@dein-server

# Repository klonen
cd /var/www
git clone https://github.com/dein-username/fmsv-dingden.git
cd fmsv-dingden/Installation/scripts

# Installation starten
chmod +x install.sh
sudo ./install.sh
```

**Dauer:** 10-15 Minuten  
**Schritte:** 14 (automatisch)

---

## 🔄 Updates

### Manuelles Update

```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./update.sh
# Option 1 wählen
```

### Branch wechseln

```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./update.sh
# Option 2 wählen
```

### Auto-Update Status

```bash
# Timer-Status
systemctl status fmsv-auto-update.timer

# Logs ansehen
tail -f /var/log/fmsv-auto-update.log

# Manuell auslösen
systemctl start fmsv-auto-update.service
```

---

## ⚙️ Services

### Backend

```bash
# Status
systemctl status fmsv-backend

# Starten
systemctl start fmsv-backend

# Stoppen
systemctl stop fmsv-backend

# Neu starten
systemctl restart fmsv-backend

# Logs (live)
journalctl -u fmsv-backend -f

# Logs (letzte 100)
journalctl -u fmsv-backend -n 100
```

### Nginx

```bash
# Status
systemctl status nginx

# Neu starten
systemctl restart nginx

# Config testen
nginx -t

# Logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### Cloudflare Tunnel

```bash
# Status
systemctl status cloudflared

# Neu starten
systemctl restart cloudflared

# Logs
journalctl -u cloudflared -f

# Tunnel-Info
cloudflared tunnel list
cloudflared tunnel info fmsv-dingden
```

---

## 💾 Datenbank

### PostgreSQL

```bash
# Status
systemctl status postgresql

# Console öffnen
sudo -u postgres psql fmsv_database

# Backup erstellen
sudo -u postgres pg_dump fmsv_database > backup.sql

# Backup wiederherstellen
sudo -u postgres psql fmsv_database < backup.sql

# Alle Datenbanken anzeigen
sudo -u postgres psql -c "\l"
```

### Datenbank-Reset

```bash
# Achtung: Löscht alle Daten!
cd /var/www/fmsv-dingden/backend

# Schema neu initialisieren
node scripts/initDatabase.js

# Test-Daten einfügen
node scripts/seedDatabase.js
```

---

## 📁 Dateien & Verzeichnisse

### Wichtige Pfade

```bash
# Projekt-Root
cd /var/www/fmsv-dingden

# Backend
cd /var/www/fmsv-dingden/backend

# Frontend (gebaut)
cd /var/www/fmsv-dingden/dist

# Uploads
cd /var/www/fmsv-dingden/Saves

# Logs
cd /var/www/fmsv-dingden/Logs
```

### Konfiguration

```bash
# Backend .env
nano /var/www/fmsv-dingden/backend/.env

# Nginx Config
nano /etc/nginx/sites-available/fmsv-dingden

# Systemd Services
nano /etc/systemd/system/fmsv-backend.service
nano /etc/systemd/system/fmsv-auto-update.service
nano /etc/systemd/system/fmsv-auto-update.timer
```

---

## 🔧 Wartung

### Frontend neu bauen

```bash
cd /var/www/fmsv-dingden

# Dependencies installieren
npm install

# Build
npm run build

# Nginx neu starten
systemctl restart nginx
```

### Backend neu deployen

```bash
cd /var/www/fmsv-dingden/backend

# Dependencies installieren
npm install --production

# Service neu starten
systemctl restart fmsv-backend
```

### Berechtigungen setzen

```bash
# Alle Dateien
chown -R www-data:www-data /var/www/fmsv-dingden

# Nur Uploads
chown -R www-data:www-data /var/www/fmsv-dingden/Saves
chmod -R 755 /var/www/fmsv-dingden/Saves

# Backend .env
chmod 600 /var/www/fmsv-dingden/backend/.env
```

---

## 🔍 Troubleshooting

### Website nicht erreichbar

```bash
# 1. Backend läuft?
systemctl status fmsv-backend
journalctl -u fmsv-backend -n 50

# 2. Nginx läuft?
systemctl status nginx
nginx -t

# 3. Cloudflare Tunnel läuft? (falls verwendet)
systemctl status cloudflared
journalctl -u cloudflared -n 50

# 4. Firewall?
ufw status

# 5. Ports offen?
netstat -tlnp | grep :3000
netstat -tlnp | grep :80
```

### 502 Bad Gateway

```bash
# Backend-Port erreichbar?
curl http://localhost:3000/api/health

# Backend neu starten
systemctl restart fmsv-backend

# Logs prüfen
journalctl -u fmsv-backend -f
```

### Datenbank-Verbindungsfehler

```bash
# PostgreSQL läuft?
systemctl status postgresql

# Verbindung testen
sudo -u postgres psql -c "SELECT version();"

# .env prüfen
cat /var/www/fmsv-dingden/backend/.env | grep DB_
```

### Upload-Fehler

```bash
# Berechtigungen prüfen
ls -la /var/www/fmsv-dingden/Saves/

# Berechtigungen setzen
chown -R www-data:www-data /var/www/fmsv-dingden/Saves/
chmod -R 755 /var/www/fmsv-dingden/Saves/

# Nginx Upload-Größe
grep client_max_body_size /etc/nginx/sites-available/fmsv-dingden
```

### Services nach Reboot

```bash
# Alle Services neu starten
systemctl restart fmsv-backend
systemctl restart nginx
systemctl restart cloudflared  # falls verwendet

# Auto-Start prüfen
systemctl is-enabled fmsv-backend
systemctl is-enabled nginx
systemctl is-enabled cloudflared
```

---

## 🔒 Sicherheit

### Firewall

```bash
# Status
ufw status

# Regel hinzufügen
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Aktivieren
ufw enable

# Regel löschen
ufw delete allow 80/tcp
```

### SSL/TLS (mit Cloudflare)

```bash
# Cloudflare Dashboard
# → SSL/TLS → Full

# DNS-Einstellungen prüfen
dig fmsv.bartholmes.eu

# Cloudflare Tunnel Status
cloudflared tunnel list
```

### System-Updates

```bash
# System aktualisieren
apt-get update
apt-get upgrade -y

# Services neu starten
systemctl restart fmsv-backend
systemctl restart nginx
systemctl restart postgresql
```

---

## 📊 Monitoring

### Disk Space

```bash
# Speicherplatz prüfen
df -h

# Größte Verzeichnisse finden
du -sh /var/www/fmsv-dingden/*

# Logs rotieren
journalctl --vacuum-time=7d
```

### Logs

```bash
# Backend Logs
journalctl -u fmsv-backend --since today
journalctl -u fmsv-backend --since "1 hour ago"

# Nginx Access Logs
tail -f /var/log/nginx/access.log

# Nginx Error Logs
tail -f /var/log/nginx/error.log

# Auto-Update Logs
tail -f /var/log/fmsv-auto-update.log

# PostgreSQL Logs
tail -f /var/log/postgresql/postgresql-16-main.log
```

### System-Status

```bash
# RAM-Nutzung
free -h

# CPU-Nutzung
top
htop  # falls installiert

# Laufende Prozesse
ps aux | grep node
ps aux | grep nginx
ps aux | grep postgres

# Netzwerk-Verbindungen
netstat -tulpn
```

---

## 💾 Backup & Restore

### Manuelles Backup

```bash
# Backup-Verzeichnis erstellen
BACKUP_DIR="/var/backups/fmsv-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Datenbank
sudo -u postgres pg_dump fmsv_database > "$BACKUP_DIR/database.sql"

# Uploads
tar -czf "$BACKUP_DIR/uploads.tar.gz" /var/www/fmsv-dingden/Saves/

# Konfiguration
cp /var/www/fmsv-dingden/backend/.env "$BACKUP_DIR/.env"

# Komprimieren
tar -czf "fmsv-backup-$(date +%Y%m%d).tar.gz" "$BACKUP_DIR"
```

### Restore

```bash
# Backup entpacken
tar -xzf fmsv-backup-YYYYMMDD.tar.gz

# Services stoppen
systemctl stop fmsv-backend
systemctl stop nginx

# Datenbank
sudo -u postgres psql fmsv_database < backup/database.sql

# Uploads
tar -xzf backup/uploads.tar.gz -C /var/www/fmsv-dingden/

# .env
cp backup/.env /var/www/fmsv-dingden/backend/.env

# Services starten
systemctl start fmsv-backend
systemctl start nginx
```

---

## 🎯 Schnell-Befehle

### Alles neu starten

```bash
systemctl restart fmsv-backend && \
systemctl restart nginx && \
systemctl restart cloudflared
```

### Status aller Services

```bash
systemctl status fmsv-backend nginx cloudflared postgresql
```

### Logs aller Services

```bash
# Terminal 1
journalctl -u fmsv-backend -f

# Terminal 2
tail -f /var/log/nginx/error.log

# Terminal 3
journalctl -u cloudflared -f
```

### Komplettes Update

```bash
cd /var/www/fmsv-dingden/Installation/scripts && \
sudo ./update.sh
# Option 1 wählen
```

---

**Alles auf einer Seite!** Bookmark diese Seite für schnellen Zugriff. 📌
