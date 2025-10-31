# FMSV Dingden - Installation

Komplette Installations-Anleitung für Production-Server (Debian 12/13).

---

## 📖 Navigation

- [🚀 Schnellstart](#-schnellstart-empfohlen) - Für die meisten Nutzer
- [⚠️ SSH/PuTTY-Nutzer](#️-sshputty-nutzer-aufgepasst) - Cloudflare Browser-Problem
- [📋 Detaillierte Schritte](#-detaillierte-schritte) - Ausführliche Anleitung
- [⚙️ Konfiguration](#️-konfiguration) - Nach der Installation
- [🔧 Troubleshooting](#-troubleshooting) - Probleme lösen

---

## 🚀 Schnellstart (Empfohlen)

### Voraussetzungen
- Debian 12 (Bookworm) oder 13 (Trixie) Server
- Root-Zugriff
- Domain zeigt auf Server (bei Cloudflare verwaltet)

### Installation

```bash
# 1. Repository klonen
cd /var/www
git clone https://github.com/Benno2406/fmsv-dingden.git
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
git clone -b main https://github.com/Benno2406/fmsv-dingden.git
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

---

##### ⚠️ SSH/PuTTY-Nutzer aufgepasst!

Wenn du per **SSH oder PuTTY** verbunden bist, kann sich kein Browser für den Cloudflare-Login öffnen.

**Du hast 2 einfache Lösungen:**

**Option 1: URL manuell öffnen** (SCHNELLSTE METHODE)
```bash
# Auf dem Server:
cloudflared tunnel login

# URL wird angezeigt → komplett kopieren
# Auf deinem PC im Browser öffnen
# Bei Cloudflare einloggen → Domain wählen → Authorize
```

**📖 Schritt-für-Schritt:** [`../CLOUDFLARE-PUTTY-ANLEITUNG.md`](../CLOUDFLARE-PUTTY-ANLEITUNG.md)

**Option 2: Setup-Script nutzen** (AUTOMATISCH)
```bash
cd /var/www/fmsv-dingden/Installation/scripts
chmod +x cloudflare-setup-manual.sh
./cloudflare-setup-manual.sh
```

Das Script führt dich durch den kompletten Setup!

**📚 Alle Lösungen:** [`../CLOUDFLARE-SSH-LOGIN.md`](../CLOUDFLARE-SSH-LOGIN.md)

---

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

#### Status prüfen

```bash
# Service-Status
systemctl status cloudflared

# Tunnel-Liste
cloudflared tunnel list

# Tunnel-Info
cloudflared tunnel info fmsv-dingden

# Verbindungen
cloudflared tunnel info fmsv-dingden | grep Connections
```

#### Logs ansehen

```bash
# Live-Logs
journalctl -u cloudflared -f

# Letzte 100 Zeilen
journalctl -u cloudflared -n 100

# Fehler filtern
journalctl -u cloudflared -p err
```

#### Service verwalten

```bash
# Neu starten
systemctl restart cloudflared

# Stoppen
systemctl stop cloudflared

# Starten
systemctl start cloudflared

# Deaktivieren
systemctl disable cloudflared

# Status
systemctl is-active cloudflared
```

#### Troubleshooting

**Problem: "Connection refused"**
```bash
# Backend läuft?
systemctl status fmsv-backend

# Nginx läuft?
systemctl status nginx

# Config prüfen
cat /root/.cloudflared/config.yml

# Ports prüfen
netstat -tulpn | grep -E ':(80|3000)'
```

**Problem: "Tunnel not found"**
```bash
# Tunnel existiert?
cloudflared tunnel list

# Credentials vorhanden?
ls -la /root/.cloudflared/*.json

# Service neu installieren
cloudflared service uninstall
cloudflared service install
systemctl start cloudflared
```

**Problem: Browser öffnet sich nicht (SSH/PuTTY)**

Siehe: [`../CLOUDFLARE-SSH-LOGIN.md`](../CLOUDFLARE-SSH-LOGIN.md) oder [`../CLOUDFLARE-PUTTY-ANLEITUNG.md`](../CLOUDFLARE-PUTTY-ANLEITUNG.md)

Oder nutze das Setup-Script:
```bash
cd /var/www/fmsv-dingden/Installation/scripts
./cloudflare-setup-manual.sh
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

### SSH/PuTTY: Browser öffnet sich nicht

**Problem:** Cloudflare-Login scheitert bei SSH/PuTTY

**Fehler:**
```
Failed to open browser
Cannot open browser window
```

**Lösung 1 - URL manuell öffnen (SCHNELLSTE METHODE):**

```bash
# Auf Server:
cloudflared tunnel login

# URL kopieren → Auf PC im Browser öffnen → Einloggen
```

**📖 Schritt-für-Schritt:** [`../CLOUDFLARE-PUTTY-ANLEITUNG.md`](../CLOUDFLARE-PUTTY-ANLEITUNG.md)

**Lösung 2 - Setup-Script:**

```bash
cd /var/www/fmsv-dingden/Installation/scripts
./cloudflare-setup-manual.sh
```

**📚 Alle Lösungen:** [`../CLOUDFLARE-SSH-LOGIN.md`](../CLOUDFLARE-SSH-LOGIN.md)

---

### Installation bricht ab

**Problem:** Script stoppt bei "Aktualisiere Paket-Listen"

**Debug-Script ausführen:**
```bash
cd /var/www/fmsv-dingden/Installation/scripts
./debug-install.sh
```

**Logs ansehen:**
```bash
cat /var/log/fmsv-install.log
```

**📚 Mehr Hilfe:** [`../INSTALLATIONS-HILFE.md`](../INSTALLATIONS-HILFE.md)

---

### Git Clone schlägt fehl

**Fehler:** `authentication failed` oder `repository not found`

**Lösung:**
```bash
# Repository ist public - keine Authentifizierung nötig!
git clone https://github.com/Benno2406/fmsv-dingden.git

# NICHT:
git clone https://github.com/Benno2406/fmsv-dingden
```

**📚 Details:** [`../GIT-CLONE-FEHLER.md`](../GIT-CLONE-FEHLER.md)

---

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

### Vor der Installation

- [ ] Als root eingeloggt (`su -`)
- [ ] Repository geklont
- [ ] Dateien umbenannt (`./rename-files.sh`)
- [ ] Bei SSH/PuTTY: Cloudflare-Anleitung gelesen

### Während Installation

- [ ] Update-Kanal gewählt (stable/testing)
- [ ] Cloudflare Tunnel Entscheidung getroffen
- [ ] Bei SSH: URL manuell geöffnet oder Script genutzt
- [ ] GitHub Repository-URL eingegeben
- [ ] Auto-Update konfiguriert
- [ ] Datenbank-Credentials notiert

### Nach der Installation

- [ ] Alle Services laufen
  ```bash
  systemctl status fmsv-backend
  systemctl status nginx
  systemctl status cloudflared  # falls aktiviert
  ```
- [ ] Website erreichbar (`https://fmsv.bartholmes.eu`)
- [ ] Admin-Passwort geändert
- [ ] Test-Accounts Passwörter geändert
- [ ] SMTP konfiguriert und getestet
- [ ] Firewall aktiviert
- [ ] SSL/TLS funktioniert
- [ ] Auto-Update getestet (falls aktiviert)
- [ ] Backup-System eingerichtet
- [ ] Monitoring eingerichtet

### Hilfedokumente

Wenn Probleme auftreten:

| Problem | Dokument |
|---------|----------|
| **Browser öffnet sich nicht** | [`../CLOUDFLARE-PUTTY-ANLEITUNG.md`](../CLOUDFLARE-PUTTY-ANLEITUNG.md) |
| **Installation bricht ab** | [`../INSTALLATIONS-HILFE.md`](../INSTALLATIONS-HILFE.md) |
| **Git Clone Fehler** | [`../GIT-CLONE-FEHLER.md`](../GIT-CLONE-FEHLER.md) |
| **Alle Hilfen Übersicht** | [`../HILFE-UEBERSICHT.md`](../HILFE-UEBERSICHT.md) |
| **Quick Commands** | [`../QUICK-REFERENCE.md`](../QUICK-REFERENCE.md) |

---

**Installation abgeschlossen?** 🎉

Öffne: `https://fmsv.bartholmes.eu` und teste alle Features!

**Bei Fragen:** Siehe [Troubleshooting](#-troubleshooting) oder [`../HILFE-UEBERSICHT.md`](../HILFE-UEBERSICHT.md)
