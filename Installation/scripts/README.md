# FMSV Dingden - Installation Scripts

## 📋 Überblick

Alle Installations-, Diagnose- und Update-Funktionen sind in **3 Scripts** konsolidiert:

| Script | Zweck | Verwendung |
|--------|-------|------------|
| **install.sh** | Erstinstallation | Einmalig beim ersten Setup |
| **debug.sh** | Diagnose & Reparatur | Bei Problemen jederzeit |
| **update.sh** | Updates einspielen | Regelmäßig für Updates |

---

## 🚀 install.sh - Erstinstallation

### Was macht es?

- Fragt nach **Development** vs. **Production** Installation
- Installiert alle benötigten Pakete (Nginx, PostgreSQL, Node.js)
- Richtet Backend als Systemd-Service ein
- Konfiguriert Nginx
- Optional: pgAdmin 4 Installation
- Optional: Cloudflare Tunnel Setup

### Verwendung

```bash
cd /var/www/fmsv-dingden/Installation/scripts
chmod +x install.sh
sudo ./install.sh
```

### Optionen

```bash
sudo ./install.sh                  # Normale Installation
sudo ./install.sh --help           # Hilfe anzeigen
sudo ./install.sh --version        # Zeigt Script-Version an
sudo ./install.sh --no-cloudflare  # Cloudflare überspringen
```

**Verfügbare Optionen:**
- `--help, -h` - Zeigt ausführliche Hilfe an
- `--version, -v` - Zeigt Script-Version und Features
- `--no-cloudflare` - Überspringt Cloudflare Tunnel Setup

### Installations-Modus

Beim Start fragt das Script:

```
[1] Production - Server-Installation (Live-Website)
    ► Nginx, PostgreSQL, Systemd Services
    ► Für Linux-Server im Internet

[2] Development - Lokale Entwicklungsumgebung
    ► Verweis auf dev/ Ordner
    ► Für lokalen PC/Laptop
```

**Wichtig:** Für Development nutze `dev/setup.sh` statt install.sh!

---

## 🔧 debug.sh - Diagnose & Reparatur

### Was macht es?

Konsolidiertes Tool für alle Diagnose- und Reparatur-Aufgaben:

- Vollständige System-Diagnose
- Backend-Probleme beheben
- pgAdmin reparieren
- Nginx-Configs prüfen
- Datenbank testen
- Logs anzeigen

### Verwendung

```bash
cd /var/www/fmsv-dingden/Installation/scripts
chmod +x debug.sh
sudo ./debug.sh
```

### Menü-Optionen

#### Backend-Diagnose
1. **Vollständige Diagnose** - Prüft alles (empfohlen)
2. **Quick-Fix** - Behebt häufige Probleme automatisch
3. **Backend-Logs** - Zeigt Logs an
4. **Dienste-Status** - Prüft alle Services
5. **Datenbank testen** - Testet DB-Verbindung
6. **.env prüfen** - Prüft Konfiguration

#### pgAdmin-Diagnose
7. **pgAdmin Apache reparieren** - Behebt WSGI-Duplikat-Fehler
8. **pgAdmin Nginx reparieren** - Behebt "lädt dauerhaft" Problem
9. **Domain-Konflikt beheben** - Wenn Haupt-Domain auf pgAdmin zeigt
10. **Vollständige Reparatur** - Führt alle Reparaturen durch

#### Erweitert
11. **Cache-Reset** - Kompletter Neustart
12. **Port-Diagnose** - Zeigt Port-Belegung
13. **Nginx-Configs anzeigen** - Listet alle Configs auf

### Beispiel-Workflows

#### Problem: Backend läuft nicht
```bash
sudo ./debug.sh
# → Wähle: 1 (Vollständige Diagnose)
# → Dann: 2 (Quick-Fix)
```

#### Problem: pgAdmin lädt dauerhaft
```bash
sudo ./debug.sh
# → Wähle: 10 (pgAdmin vollständige Reparatur)
```

#### Problem: Haupt-Domain zeigt auf pgAdmin
```bash
sudo ./debug.sh
# → Wähle: 9 (Domain-Konflikt beheben)
```

---

## 📦 update.sh - Updates

### Was macht es?

- Pullt neueste Änderungen von GitHub
- Aktualisiert Frontend (npm install + build)
- Aktualisiert Backend (npm install)
- Startet Services neu
- Optional: Datenbank-Migrationen

### Verwendung

```bash
cd /var/www/fmsv-dingden/Installation/scripts
chmod +x update.sh
sudo ./update.sh
```

### Update-Ablauf

1. Backup erstellen (optional)
2. Git Pull
3. Dependencies aktualisieren
4. Frontend bauen
5. Services neu starten
6. Erfolg prüfen

---

## 🆘 Häufige Probleme

### "Permission denied"

```bash
chmod +x install.sh debug.sh update.sh
```

### "Command not found"

```bash
cd /var/www/fmsv-dingden/Installation/scripts
./install.sh  # ❌ FALSCH

sudo ./install.sh  # ✅ RICHTIG
```

### Backend läuft nicht

```bash
sudo ./debug.sh
# → Option 1: Vollständige Diagnose
# → Option 2: Quick-Fix
```

### pgAdmin Probleme

```bash
sudo ./debug.sh
# → Option 10: pgAdmin vollständige Reparatur
```

### Nach Update läuft nichts

```bash
sudo ./debug.sh
# → Option 11: Kompletter Cache-Reset
```

---

## 📁 Script-Dateien

```
/var/www/fmsv-dingden/Installation/scripts/
├── install.sh              # Erstinstallation
├── debug.sh                # Diagnose & Reparatur
├── update.sh               # Updates
├── UPDATE-SCRIPTS.sh       # Script-Update Utility
└── README.md               # Diese Datei
```

### Alte Scripts (gelöscht)

Diese Scripts wurden konsolidiert und sind nicht mehr nötig:

- ~~fix-pgadmin-domain.sh~~ → Jetzt in `debug.sh` (Option 9)
- ~~setup-pgadmin-nginx.sh~~ → Jetzt in `install.sh`
- ~~diagnose.sh~~ → Jetzt `debug.sh`

---

## 🔄 Script-Updates

Falls du das Projekt aktualisiert hast und noch alte Script-Dateien hast:

```bash
cd /var/www/fmsv-dingden/Installation/scripts
chmod +x UPDATE-SCRIPTS.sh
sudo ./UPDATE-SCRIPTS.sh
```

Dies:
- Benennt `debug-new.sh` → `debug.sh` um
- Löscht veraltete Scripts
- Setzt Berechtigungen

---

## 📚 Weitere Dokumentation

- **Installation:** [../README.md](../README.md)
- **Nach Installation:** [../NACH-INSTALLATION.md](../NACH-INSTALLATION.md)
- **Backend API:** [../../backend/API-Dokumentation.md](../../backend/API-Dokumentation.md)
- **Development:** [../../dev/README.md](../../dev/README.md)

---

## 🎯 Workflow-Beispiele

### Erstinstallation auf Server

```bash
# 1. Repository klonen
cd /tmp
git clone https://github.com/Achim-Sommer/fmsv-dingden.git
cd fmsv-dingden/Installation/scripts

# 2. Installation
chmod +x install.sh
sudo ./install.sh

# 3. Development oder Production wählen
# → Wähle: 1 (Production)

# 4. Cloudflare einrichten (optional)
# → Folge den Anweisungen
```

### Regelmäßige Wartung

```bash
# Einmal pro Woche:
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./update.sh
```

### Diagnose bei Problemen

```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./debug.sh

# Starte mit Option 1 (Vollständige Diagnose)
# Das Script zeigt dir dann, was zu tun ist
```

---

## ⚙️ Technische Details

### install.sh

- **Zweck:** Einmalige Erstinstallation
- **Version:** 4.0.0 (2025-10-31)
- **Dauer:** 10-30 Minuten (je nach Server)
- **Root-Rechte:** Erforderlich
- **Logs:** `/var/log/fmsv-install.log`

**Neue Features in Version 4.0:**
- ✅ pgAdmin4 Installation (optional, mit Apache2 auf Ports 1880/18443)
- ✅ Nginx Reverse Proxy für pgAdmin4
- ✅ Cloudflare Tunnel für pgAdmin4 Subdomain
- ✅ Erweiterte Firewall-Regeln für pgAdmin4
- ✅ Verbesserte Versions-Anzeige
- ✅ Neue CLI-Optionen (--version, --help)

### debug.sh

- **Zweck:** Diagnose & Reparatur
- **Dauer:** 1-10 Minuten
- **Root-Rechte:** Erforderlich
- **Interaktiv:** Ja (Menü)

### update.sh

- **Zweck:** Updates einspielen
- **Dauer:** 2-5 Minuten
- **Root-Rechte:** Erforderlich
- **Logs:** `/var/log/fmsv-update.log`

---

## 🛡️ Sicherheit

Alle Scripts:
- Erstellen automatisch Backups
- Prüfen Berechtigungen
- Validieren Konfigurationen
- Loggen alle Aktionen
- Können bei Fehler rückgängig gemacht werden

**Backup-Locations:**
- Nginx: `/root/nginx-backup-TIMESTAMP/`
- Apache: `/root/apache-backup-TIMESTAMP/`
- Datenbank: `/var/backups/postgresql/`

---

## 💡 Tipps

### Logs ansehen

```bash
# Installation
tail -f /var/log/fmsv-install.log

# Backend
journalctl -u fmsv-backend -f

# Nginx
tail -f /var/log/nginx/error.log

# pgAdmin
tail -f /var/log/apache2/pgadmin_error.log
```

### Dienste manuell steuern

```bash
# Backend
sudo systemctl status fmsv-backend
sudo systemctl restart fmsv-backend

# Nginx
sudo systemctl status nginx
sudo systemctl reload nginx

# PostgreSQL
sudo systemctl status postgresql

# pgAdmin (Apache)
sudo systemctl status apache2
```

### Konfigurationen bearbeiten

```bash
# Backend
sudo nano /var/www/fmsv-dingden/backend/.env

# Nginx (Haupt-Website)
sudo nano /etc/nginx/sites-available/fmsv.bartholmes.eu

# Nginx (pgAdmin)
sudo nano /etc/nginx/sites-available/pgadmin.fmsv.bartholmes.eu
```

---

## ✅ Checkliste "Alles läuft"

Nach Installation sollten alle diese Checks grün sein:

```bash
# Services
sudo systemctl is-active fmsv-backend  # → active
sudo systemctl is-active nginx         # → active
sudo systemctl is-active postgresql    # → active
sudo systemctl is-active apache2       # → active (falls pgAdmin)

# Ports
sudo netstat -tulpn | grep :3000  # Backend
sudo netstat -tulpn | grep :80    # Nginx
sudo netstat -tulpn | grep :5432  # PostgreSQL
sudo netstat -tulpn | grep :1880  # pgAdmin

# HTTP-Endpoints
curl http://localhost:3000/api/health  # Backend
curl http://localhost:80               # Frontend
curl http://localhost:1880/pgadmin4    # pgAdmin
```

---

## 🔗 Links

- **GitHub:** https://github.com/Achim-Sommer/fmsv-dingden
- **Issues:** https://github.com/Achim-Sommer/fmsv-dingden/issues
- **Projekt-README:** [../../README.md](../../README.md)

---

**Viel Erfolg! 🚀**

Bei Fragen oder Problemen nutze `sudo ./debug.sh` oder erstelle ein GitHub Issue.
