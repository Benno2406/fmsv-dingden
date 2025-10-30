# FMSV Dingden - Installation

Komplette Installations-Anleitung für Production-Server (Debian 12/13).

## 🚀 Schnellstart (Empfohlen)

### Voraussetzungen
- Debian 12 (Bookworm) oder 13 (Trixie) Server
- Root-Zugriff
- Domain zeigt auf Server (bei Cloudflare verwaltet)

### Installation

```bash
# 1. Repository klonen
cd /var/www
git clone https://github.com/dein-username/fmsv-dingden.git
cd fmsv-dingden

# 2. Installations-Script ausführen
cd Installation/scripts
chmod +x install.sh
sudo ./install.sh
```

### Installations-Dialog

Das Script führt dich durch:

1. **Update-Kanal**
   - Stable (main) - Empfohlen für Production
   - Testing (testing) - Neueste Features, für Entwicklung

2. **Cloudflare Tunnel**
   - Ja - Keine Port-Weiterleitungen nötig (empfohlen)
   - Nein - Klassisches Setup mit Port-Forwarding

3. **GitHub Repository**
   - URL deines GitHub-Repos

4. **Auto-Update**
   - Täglich um 03:00 Uhr
   - Wöchentlich (Sonntag 03:00)
   - Manuell

5. **Datenbank-Konfiguration**
   - Name, Benutzer, Passwort

### Was wird installiert?

✅ PostgreSQL (Datenbank)
✅ Node.js LTS (Backend)
✅ Nginx (Webserver)
✅ Cloudflare Tunnel (optional)
✅ Backend mit allen Dependencies
✅ Frontend (gebaut und deployed)
✅ Auto-Update System (optional)

**Dauer:** ~10-15 Minuten

---

## 📋 Detaillierte Schritte

### 1. Server vorbereiten

```bash
# System aktualisieren
apt-get update
apt-get upgrade -y

# Benutzer erstellen (optional)
adduser fmsv
usermod -aG sudo fmsv
```

### 2. Repository klonen

```bash
cd /var/www
git clone -b main https://github.com/dein-username/fmsv-dingden.git
cd fmsv-dingden
```

### 3. Installation starten

```bash
cd Installation/scripts
chmod +x install.sh
sudo ./install.sh
```

### 4. Installations-Optionen wählen

#### Update-Kanal

**Stable (Empfohlen für Production):**
- Branch: `main`
- Nur getestete, stabile Releases
- Weniger Updates
- Produktions-sicher

**Testing (Für Entwicklung):**
- Branch: `testing`
- Neueste Features
- Häufigere Updates
- Kann instabil sein

#### Cloudflare Tunnel

**Ja (Empfohlen):**
- ✅ Keine Port-Weiterleitungen nötig
- ✅ Automatisches SSL/TLS
- ✅ DDoS-Schutz
- ✅ Funktioniert hinter jedem Router
- ✅ Kostenlos

**Nein:**
- Port-Weiterleitungen im Router erforderlich (80, 443)
- Cloudflare SSL manuell konfigurieren

#### Auto-Update

**Täglich:**
- Jeden Tag um 03:00 Uhr
- Automatischer Pull vom GitHub
- Services werden neu gestartet

**Wöchentlich:**
- Jeden Sonntag um 03:00 Uhr
- Für stabilere Umgebungen

**Manuell:**
- Keine automatischen Updates
- Updates via `sudo ./update.sh`

### 5. Nach der Installation

#### Services überprüfen

```bash
# Backend
systemctl status fmsv-backend

# Nginx
systemctl status nginx

# Cloudflare Tunnel (falls aktiviert)
systemctl status cloudflared

# Auto-Update Timer (falls aktiviert)
systemctl status fmsv-auto-update.timer
```

#### Logs ansehen

```bash
# Backend
journalctl -u fmsv-backend -f

# Nginx
tail -f /var/log/nginx/error.log

# Cloudflare Tunnel
journalctl -u cloudflared -f

# Auto-Update
tail -f /var/log/fmsv-auto-update.log
```

#### Website testen

```bash
# Lokal
curl http://localhost

# Öffentlich
curl https://fmsv.bartholmes.eu
```

#### Login testen

Öffne Browser: `https://fmsv.bartholmes.eu`

**Test-Accounts:**
- Admin: `admin@fmsv-dingden.de` / `admin123`
- Member: `member@fmsv-dingden.de` / `member123`

⚠️ **Passwörter sofort ändern nach erstem Login!**

---

## ⚙️ Konfiguration

### SMTP (E-Mail)

Siehe: [`E-Mail-Setup.md`](E-Mail-Setup.md)

```bash
# .env bearbeiten
nano /var/www/fmsv-dingden/backend/.env

# SMTP-Einstellungen anpassen
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=DEIN_API_KEY
EMAIL_FROM=noreply@fmsv.bartholmes.eu

# Backend neu starten
systemctl restart fmsv-backend
```

### Cloudflare Tunnel

Siehe: [`Cloudflare-Tunnel-Setup.md`](Cloudflare-Tunnel-Setup.md)

**Status prüfen:**
```bash
systemctl status cloudflared
cloudflared tunnel list
```

**Logs:**
```bash
journalctl -u cloudflared -f
```

**Neu starten:**
```bash
systemctl restart cloudflared
```

---

## 🔄 Updates

### Automatische Updates

Falls bei Installation aktiviert:

```bash
# Timer-Status
systemctl status fmsv-auto-update.timer

# Nächster Update-Zeitpunkt
systemctl list-timers

# Logs
tail -f /var/log/fmsv-auto-update.log

# Timer stoppen
systemctl stop fmsv-auto-update.timer
systemctl disable fmsv-auto-update.timer

# Timer starten
systemctl start fmsv-auto-update.timer
systemctl enable fmsv-auto-update.timer
```

### Manuelle Updates

```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./update.sh
```

Optionen:
1. Update durchführen (aktueller Branch)
2. Zwischen Stable/Testing wechseln
3. Abbrechen

### Branch wechseln

Von Stable zu Testing (oder umgekehrt):

```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./update.sh
# Option 2 wählen
```

⚠️ **Automatisches Backup wird erstellt**

---

## 💾 Backup & Restore

### Backup erstellen

```bash
# Backup-Verzeichnis
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

### Backup wiederherstellen

```bash
# Backup entpacken
tar -xzf fmsv-backup-YYYYMMDD.tar.gz

# Services stoppen
systemctl stop fmsv-backend
systemctl stop nginx

# Datenbank wiederherstellen
sudo -u postgres psql fmsv_database < backup/database.sql

# Uploads wiederherstellen
tar -xzf backup/uploads.tar.gz -C /var/www/fmsv-dingden/

# .env wiederherstellen
cp backup/.env /var/www/fmsv-dingden/backend/.env

# Services starten
systemctl start fmsv-backend
systemctl start nginx
```

---

## 🔒 Sicherheit

### SSL/TLS

**Mit Cloudflare Tunnel:**
- ✅ Automatisch konfiguriert
- Keine weiteren Schritte nötig

**Ohne Cloudflare Tunnel:**
1. Cloudflare Dashboard → SSL/TLS
2. Modus: "Full"
3. Edge Certificates → Always Use HTTPS: On

### Firewall

**Mit Cloudflare Tunnel:**
```bash
# Nur SSH erlauben
ufw allow 22/tcp
ufw enable
```

**Ohne Cloudflare Tunnel:**
```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### Updates

```bash
# System-Updates
apt-get update
apt-get upgrade -y

# Services neu starten
systemctl restart fmsv-backend
systemctl restart nginx
```

### Passwörter

1. **Admin-Passwort ändern** (nach erstem Login)
2. **Datenbank-Passwort** sicher aufbewahren
3. **JWT-Secrets** nicht weitergeben (in `.env`)

---

## 🆘 Troubleshooting

### Website nicht erreichbar

```bash
# Backend läuft?
systemctl status fmsv-backend
journalctl -u fmsv-backend -n 50

# Nginx läuft?
systemctl status nginx
nginx -t

# Cloudflare Tunnel läuft?
systemctl status cloudflared
journalctl -u cloudflared -n 50
```

### 502 Bad Gateway

```bash
# Backend-Port 3000 erreichbar?
curl http://localhost:3000/api/health

# Backend neu starten
systemctl restart fmsv-backend

# Logs prüfen
journalctl -u fmsv-backend -f
```

### Datenbank-Fehler

```bash
# PostgreSQL läuft?
systemctl status postgresql

# Verbindung testen
sudo -u postgres psql -c "SELECT version();"

# Logs prüfen
journalctl -u postgresql -n 50
```

### Upload-Fehler

```bash
# Berechtigungen prüfen
ls -la /var/www/fmsv-dingden/Saves/

# Berechtigungen setzen
chown -R www-data:www-data /var/www/fmsv-dingden/Saves/
chmod -R 755 /var/www/fmsv-dingden/Saves/
```

### Auto-Update funktioniert nicht

```bash
# Timer aktiv?
systemctl status fmsv-auto-update.timer

# Timer manuell auslösen
systemctl start fmsv-auto-update.service

# Logs prüfen
journalctl -u fmsv-auto-update.service -f
```

---

## 📚 Weitere Dokumentation

- **E-Mail Setup:** [`E-Mail-Setup.md`](E-Mail-Setup.md)
- **Cloudflare Tunnel:** [`Cloudflare-Tunnel-Setup.md`](Cloudflare-Tunnel-Setup.md)
- **API Dokumentation:** [`/backend/API-Dokumentation.md`](../../backend/API-Dokumentation.md)

---

## 🎯 Production Checklist

Nach der Installation:

- [ ] Admin-Passwort geändert
- [ ] SMTP konfiguriert und getestet
- [ ] Test-Accounts gelöscht oder Passwörter geändert
- [ ] Backup-System eingerichtet
- [ ] Firewall aktiviert
- [ ] SSL/TLS funktioniert
- [ ] Alle Services laufen
- [ ] Auto-Update getestet (falls aktiviert)
- [ ] Monitoring eingerichtet

---

**Installation abgeschlossen?** 🎉

Öffne: `https://fmsv.bartholmes.eu` und teste alle Features!
