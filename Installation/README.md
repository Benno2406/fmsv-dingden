# FMSV Dingden - Installations- & Wartungsanleitung

## 📋 Inhaltsverzeichnis

- [Schnellstart](#schnellstart)
- [Wartungs-Tools](#wartungs-tools)
- [Detaillierte Anleitungen](#detaillierte-anleitungen)
- [Fehlerbehebung](#fehlerbehebung)
- [Häufige Fragen](#häufige-fragen)

---

## 🚀 Schnellstart

### Voraussetzungen

- **Debian 11/12** oder **Ubuntu 20.04/22.04** Server
- **Root-Zugriff** (via SSH oder direkt)
- **Mindestens 2GB RAM** und 10GB freier Speicher
- **Stabile Internetverbindung**

### Installation in 3 Schritten

```bash
# 1. Repository klonen
cd /tmp
git clone https://github.com/Achim-Sommer/fmsv-dingden.git
cd fmsv-dingden/Installation/scripts

# 2. Installation starten
chmod +x install.sh
sudo ./install.sh

# 3. Den Anweisungen folgen
```

Das wars! Das Script führt dich durch:
- Update-Kanal Auswahl (Stable/Beta)
- Cloudflare Tunnel Setup (optional)
- Domain-Eingabe
- Auto-Update Konfiguration
- Datenbank-Setup
- Service-Installation

**Installation dauert ca. 15-30 Minuten**

---

## 🆘 Probleme?

### 🚨 500 Internal Server Error

**Schnelle Lösung:**
```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./quick-500-debug.sh
```

Siehe auch: [**500-ERROR-LÖSUNG.md**](500-ERROR-LÖSUNG.md)

### 🔧 Allgemeine Probleme

**Vollständiges Troubleshooting:**
```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./debug.sh
```

Siehe auch: [**TROUBLESHOOTING.md**](TROUBLESHOOTING.md)

### 📁 Fehlende Dateien (z.B. schema.sql)

```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./repair-files.sh
```

Siehe auch: [**WICHTIG-SCHEMA-FIX.md**](WICHTIG-SCHEMA-FIX.md)

---

## 🛠️ Wartungs-Tools

Nach der Installation stehen dir zwei wichtige Tools zur Verfügung:

### fmsv-update

Aktualisiert das gesamte System (Code + Dependencies).

```bash
sudo fmsv-update
```

**Features:**
- Automatisches Backup vor Update
- Git Pull vom gewählten Branch
- Dependency Updates
- Service Neustart
- Rollback bei Fehlern

### fmsv-debug

Interaktives Diagnose-Tool für Problemsuche.

```bash
sudo fmsv-debug
```

**Menü-Optionen:**
1. **Pre-Installation Check** - System-Voraussetzungen prüfen
2. **500 Error Diagnose** - Backend/Nginx/DB Probleme finden + **Quick-Fix**
3. **Cloudflare Tunnel Test** - Cloudflare Konfiguration prüfen
4. **Vollständige System-Diagnose** - Alle Tests durchführen
5. **Logs anzeigen** - Backend/Nginx/Postgres/Cloudflare Logs

**Neu: Quick-Fix Feature**
- Automatische Reparatur bei fehlender `.env` Datei
- Datenbank-Erstellung wenn nicht vorhanden
- Schema-Initialisierung
- Service-Neustart

**Beispiel-Ausgabe:**
```
✓ Root-Rechte
✓ Internet-Verbindung
✓ DNS (github.com)
✓ apt update Test
✓ Freier Speicherplatz (15GB)
```

---

## 📚 Detaillierte Anleitungen

Alle Anleitungen befinden sich im Verzeichnis `/Installation/Anleitung/`:

### Installation.md
Komplette Schritt-für-Schritt-Anleitung mit Screenshots und Erklärungen.

**Wichtige Themen:**
- SSH-Zugang einrichten
- WinSCP/PuTTY unter Windows
- Installations-Optionen erklärt
- Troubleshooting während Installation

[→ Installation.md lesen](Anleitung/Installation.md)

### Cloudflare-Tunnel-Setup.md
Cloudflare Tunnel für sicheren HTTPS-Zugang ohne Port-Forwarding.

**Inhalte:**
- Was ist Cloudflare Tunnel?
- SSH vs. Lokaler PC Setup
- Zertifikat kopieren
- DNS-Einstellungen
- Troubleshooting

[→ Cloudflare-Tunnel-Setup.md lesen](Anleitung/Cloudflare-Tunnel-Setup.md)

### GitHub-Setup.md
Eigenes Repository für Updates und Versionskontrolle.

**Inhalte:**
- Fork erstellen
- Deploy Keys
- Auto-Update System
- Branch-Strategie (stable/beta)
- GitHub Actions

[→ GitHub-Setup.md lesen](Anleitung/GitHub-Setup.md)

### E-Mail-Setup.md
SMTP-Konfiguration für E-Mail-Benachrichtigungen.

**Unterstützte Dienste:**
- SendGrid (empfohlen)
- Gmail
- Custom SMTP
- Eigener Mail-Server

[→ E-Mail-Setup.md lesen](Anleitung/E-Mail-Setup.md)

### Auto-Update-System.md
Automatische Updates per systemd Timer.

**Konfiguration:**
- Täglich, wöchentlich, oder manuell
- Update-Kanal (stable/beta)
- Backup-Strategie
- Logs und Monitoring

[→ Auto-Update-System.md lesen](Anleitung/Auto-Update-System.md)

---

## 🔧 Fehlerbehebung

### Installation bricht ab

**Problem:** Script stoppt mit Fehler

**Lösung:**
```bash
# 1. Debug-Tool verwenden
sudo fmsv-debug
# Option 1 wählen: Pre-Installation Check

# 2. Logs ansehen
tail -f /var/log/fmsv-install.log

# 3. Neu starten
sudo ./install.sh
```

### 500 Server Error nach Installation

**Problem:** Website zeigt 500 Fehler

**Lösung:**
```bash
# 1. Debug-Tool starten (empfohlen!)
sudo fmsv-debug
# Option 2 wählen: 500 Error Diagnose
# → Quick-Fix wird automatisch angeboten wenn .env oder DB fehlen

# 2. Manuell: Services prüfen
systemctl status fmsv-backend
systemctl status nginx
systemctl status postgresql

# 3. Services neustarten
systemctl restart fmsv-backend
systemctl restart nginx
```

**Häufige Ursachen:**
- `.env` Datei fehlt → Quick-Fix repariert automatisch
- Datenbank nicht erstellt → Quick-Fix erstellt DB
- Backend-Port belegt → Service neustart mit `systemctl restart fmsv-backend`

### Backend startet nicht

**Problem:** `systemctl status fmsv-backend` zeigt Fehler

**Lösung:**
```bash
# 1. Logs ansehen
journalctl -u fmsv-backend -n 50

# 2. Häufige Ursachen:
# - Datenbank nicht erreichbar
# - Port 3000 belegt
# - Fehler in .env

# 3. .env prüfen
nano /var/www/fmsv-dingden/backend/.env

# 4. Datenbank testen
su - postgres -c "psql -d fmsv_database -c 'SELECT 1;'"

# 5. Manuelle Berechtigungen reparieren
sudo fmsv-debug
# Option 2 wählen
```

### Cloudflare Tunnel funktioniert nicht

**Problem:** Domain nicht erreichbar

**Lösung:**
```bash
# 1. Cloudflare Test
sudo fmsv-debug
# Option 3 wählen: Cloudflare Tunnel Test

# 2. Service Status
systemctl status cloudflared
journalctl -u cloudflared -f

# 3. Config prüfen
cat /etc/cloudflared/config.yml

# 4. Tunnel neu erstellen
cloudflared tunnel delete fmsv-dingden
cloudflared tunnel create fmsv-dingden
```

### Updates schlagen fehl

**Problem:** `fmsv-update` bricht ab

**Lösung:**
```bash
# 1. Manuelles Update
cd /var/www/fmsv-dingden
git status
git pull origin main

# 2. Dependencies aktualisieren
cd backend && npm install
cd .. && npm install

# 3. Services neustarten
systemctl restart fmsv-backend
systemctl restart nginx
```

---

## ❓ Häufige Fragen

### Kann ich mehrere Instanzen betreiben?

Ja! Einfach andere Ports und Datenbanknamen verwenden:
- Backend Port ändern in `.env`
- Nginx Config anpassen
- Eigene Datenbank erstellen

### Wie sichere ich die Datenbank?

```bash
# Backup erstellen
pg_dump -U postgres fmsv_database > backup.sql

# Backup einspielen
psql -U postgres fmsv_database < backup.sql
```

### Wo werden Uploads gespeichert?

Alle Uploads landen in: `/var/www/fmsv-dingden/Saves/`

**Backup-Empfehlung:** Dieses Verzeichnis regelmäßig sichern!

### Wie ändere ich die Domain?

1. `.env` bearbeiten: `BASE_URL=https://neue-domain.de`
2. Cloudflare DNS anpassen
3. Nginx Config aktualisieren
4. Services neustarten

### Kann ich ohne Cloudflare betreiben?

Ja! Bei Installation `--no-cloudflare` verwenden:

```bash
./install.sh --no-cloudflare
```

Dann musst du selbst SSL-Zertifikate einrichten:
```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d deine-domain.de
```

### Wo finde ich die Logs?

```bash
# Installation
tail -f /var/log/fmsv-install.log

# Backend
journalctl -u fmsv-backend -f

# Nginx
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# PostgreSQL
journalctl -u postgresql -f

# Cloudflare
journalctl -u cloudflared -f

# Oder: fmsv-debug Tool nutzen (Option 5)
```

### Wie deinstalliere ich das System?

```bash
# Services stoppen
systemctl stop fmsv-backend nginx cloudflared
systemctl disable fmsv-backend nginx cloudflared

# Datenbank löschen
su - postgres -c "dropdb fmsv_database"
su - postgres -c "dropuser fmsv_user"

# Dateien löschen
rm -rf /var/www/fmsv-dingden
rm /etc/nginx/sites-enabled/fmsv-dingden
rm /etc/nginx/sites-available/fmsv-dingden
rm /etc/systemd/system/fmsv-backend.service
rm /etc/cloudflared/config.yml
rm /usr/local/bin/fmsv-*

# Systemd neu laden
systemctl daemon-reload
```

---

## 🆘 Support

### Bei Problemen

1. **fmsv-debug** Tool nutzen für Diagnose
2. **Logs ansehen** (siehe "Wo finde ich die Logs?")
3. **Installation.md** durchlesen für Details
4. **GitHub Issues** erstellen mit:
   - Beschreibung des Problems
   - Logs (fmsv-debug Ausgabe)
   - System-Informationen (Debian/Ubuntu Version)

### Nützliche Befehle

```bash
# Status aller Services
systemctl status fmsv-backend nginx postgresql cloudflared

# Alle Services neustarten
systemctl restart fmsv-backend nginx

# Debug-Tool
sudo fmsv-debug

# Update durchführen
sudo fmsv-update

# Logs live ansehen
journalctl -u fmsv-backend -f

# Config bearbeiten
nano /var/www/fmsv-dingden/backend/.env
```

---

## 📖 Projekt-Struktur

```
fmsv-dingden/
├── Installation/
│   ├── README.md              # Diese Datei
│   ├── Anleitung/            # Detaillierte Anleitungen
│   │   ├── Installation.md
│   │   ├── Cloudflare-Tunnel-Setup.md
│   │   ├── GitHub-Setup.md
│   │   ├── E-Mail-Setup.md
│   │   └── Auto-Update-System.md
│   └── scripts/              # Installations-Scripts
│       ├── install.sh        # Hauptinstallation
│       ├── update.sh         # Update-Script
│       └── debug.sh          # Debug-Tool
├── backend/                   # Node.js Backend
├── components/               # React Components
├── pages/                    # React Pages
└── Saves/                    # Upload-Verzeichnis
```

---

**Version:** 3.0  
**Letztes Update:** Oktober 2025  
**Lizenz:** MIT

**✈️ Viel Erfolg mit der FMSV Dingden Vereinshomepage! ✈️**
