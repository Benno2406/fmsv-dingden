# 🏗️ FMSV Dingden - Modulare Installation

## ⚡ Schnellstart

```bash
cd Installation/scripts
bash make-executable.sh
sudo ./install-modular.sh
```

**Das war's!** 🎉

---

## 📋 Überblick

### Hauptscript

**`install-modular.sh`** - Modulare Komplett-Installation
- ✅ Automatisches Cleanup alter Installation
- ✅ 19 Installations-Schritte (0-18)
- ✅ 14 Kern-Module + 3 optionale Module
- ✅ Vollständiges Logging nach `/var/log/fmsv-install.log`
- ✅ Error-Handling & Validierung
- ✅ Interaktive Konfiguration

### Module

#### **Kern-Module (00-13)**
| # | Modul | Beschreibung |
|---|-------|--------------|
| 00 | **cleanup** | Deinstalliert vorherige Installation |
| 01 | **system-check** | Prüft Systemvoraussetzungen |
| 02 | **options** | Fragt Installations-Optionen ab |
| 03 | **system-update** | Aktualisiert System-Pakete |
| 04 | **base-tools** | Installiert Basis-Tools (curl, git, etc.) |
| 05 | **postgres** | Installiert PostgreSQL 16 |
| 06 | **nodejs** | Installiert Node.js 22.x |
| 07 | **repository** | Klont GitHub Repository |
| 08 | **database** | Erstellt Datenbank & Schema |
| 09 | **backend** | Installiert Backend Dependencies |
| 10 | **frontend** | Baut Frontend (Vite) |
| 11 | **nginx** | Konfiguriert Nginx |
| 12 | **services** | Startet Systemd Services |
| 13 | **firewall** | Konfiguriert UFW Firewall |

#### **Optionale Module**
| # | Modul | Beschreibung |
|---|-------|--------------|
| 14 | **pgadmin** | pgAdmin 4 (optional) |
| 15 | **cloudflare** | Cloudflare Tunnel (optional) |
| 16 | **auto-update** | Auto-Update System (optional) |

---

## 🆕 Was ist neu?

### ✅ Automatisches Cleanup (Modul 00)

**Problem gelöst:** Alte Installation muss manuell entfernt werden

**Neue Features:**
- Automatische Erkennung vorheriger Installation
- Stoppt FMSV Backend Service
- Entfernt Nginx Konfiguration
- Löscht PostgreSQL Datenbank & User
- Bereinigt Build-Dateien (node_modules, dist)
- Optional: Backend .env behalten/löschen
- Optional: Uploads (Saves/) behalten/löschen
- Optional: Log-Dateien behalten/löschen
- ⚠️ **Scripts bleiben erhalten** (selektiver Cleanup!)

**Ablauf:**
```
═══════════════════════════════════════════════════════
⚠️  Cleanup vorheriger Installation
═══════════════════════════════════════════════════════

⚠️  WARNUNG: Vorherige Installation gefunden!

Folgendes wird entfernt:
  • FMSV Backend Service
  • FMSV Datenbank (fmsv_database)
  • Datenbank-User (fmsv_user)
  • Nginx Konfiguration
  • Build-Dateien (node_modules, dist)
  • Optional: Backend .env
  • Optional: Uploads (Saves/)

ℹ️  Installation Scripts bleiben erhalten!
⚠️  Datenbank-Daten gehen VERLOREN!

   ► Vorherige Installation WIRKLICH entfernen? (j/N): 
```

### ✅ Grafik-Fixes

**Problem gelöst:** Text erschien erst nach Eingabe

**Technische Änderung:**
```bash
# VORHER (verzögert):
echo -ne "Frage: "
read REPLY

# NACHHER (sofort):
printf "Frage: "
read -r REPLY
```

**Betroffene Funktionen:**
- `ask_yes_no()` - Ja/Nein-Fragen
- `ask_input()` - Text-Eingabe
- `ask_password()` - Passwort-Eingabe
- `ask_choice()` - Auswahl aus Liste

### ✅ Robustes Error-Handling

**Problem gelöst:** `INSTALL_MODE ist nicht gesetzt`

**Neue Features:**
- Retry-Loop bei ungültiger Eingabe
- Fallback auf Production-Modus
- Bessere Fehler-Messages
- Variable immer gesetzt

**Beispiel:**
```bash
# Ungültige Eingabe (99)
   ► Auswahl (1-2): 99
⚠️  Ungültige Auswahl!
⚠️  Bitte wähle eine gültige Option!

# Erneut fragen
   ► Auswahl (1-2): 1
✓ Production-Modus ausgewählt
```

---

## 🎯 Installation

### Schritt 1: Vorbereitung

```bash
# Repository klonen (falls noch nicht geschehen)
cd /var/www
git clone https://github.com/Benno2406/fmsv-dingden.git
cd fmsv-dingden/Installation/scripts
```

### Schritt 2: Berechtigungen setzen

```bash
bash make-executable.sh
```

**Ausgabe:**
```
Setze Berechtigungen für modulare Struktur...

✓ install-modular.sh
✓ install.sh
✓ update.sh
✓ debug-new.sh
✓ setup-modular.sh
✓ test-modular.sh
✓ lib/*.sh
✓ modules/**/*.sh (17 Dateien)
✓ modules/00-cleanup.sh (Cleanup-Modul)

✅ Alle Scripts sind jetzt ausführbar!
```

### Schritt 3: Installation starten

```bash
sudo ./install-modular.sh
```

### Schritt 4: Fragen beantworten

#### Frage 1: Installation starten?
```
   ► Installation starten? (J/n): j
```

#### Frage 2: Cleanup? (falls alte Installation gefunden)
```
   ► Vorherige Installation WIRKLICH entfernen? (j/N): j
   ► Log-Dateien auch löschen? (j/N): n
```

#### Frage 3: Installations-Modus
```
   Welchen Modus möchtest du installieren?

     1. Production (empfohlen für Server)
     2. Development (für lokale Entwicklung)

   ► Auswahl (1-2): 1
```

#### Frage 4: Update-Kanal
```
   Welchen Update-Kanal möchtest du verwenden?

     1. Stable (empfohlen)
     2. Testing (experimentell)

   ► Auswahl (1-2): 1
```

#### Frage 5: Repository URL
```
   ► GitHub Repository URL [https://github.com/Benno2406/fmsv-dingden.git]: 
   (Enter drücken für Default)
```

#### Frage 6: Cloudflare Tunnel?
```
   ► Cloudflare Tunnel installieren? (j/N): n
```

#### Frage 7: Domain
```
   ► Domain für die Installation [fmsv.bartholmes.eu]: 
```

#### Frage 8: pgAdmin?
```
   ► pgAdmin 4 installieren? (j/N): n
```

#### Frage 9: Auto-Update?
```
   Auto-Update Zeitplan auswählen:

     1. Täglich (empfohlen)
     2. Wöchentlich (Sonntag 3 Uhr)
     3. Manuell (kein Auto-Update)

   ► Auswahl (1-3): 3
```

#### Frage 10-13: Datenbank
```
   ► Datenbank-Name [fmsv_database]: 
   ► Datenbank-User [fmsv_user]: 
   ► Datenbank-Passwort (min. 8 Zeichen): ***********
   ► Passwort wiederholen: ***********
```

#### Frage 14: Test-Daten?
```
   ► Test-Daten installieren (empfohlen)? (J/n): j
```

#### Frage 15: Admin-Email
```
   ► E-Mail für Admin-Account [benno@bartholmes.eu]: 
```

---

## 📊 Installations-Fortschritt

```
╔════════════════════════════════════════════════════════════╗
║                      [ 0 / 19 ]                           ║
║                                                            ║
║          Cleanup vorheriger Installation                   ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

✓ FMSV Backend gestoppt
✓ Service-Datei entfernt
✓ Nginx Config entfernt
✓ Datenbank gelöscht
✓ Verzeichnis gelöscht
✓ Cleanup abgeschlossen

╔════════════════════════════════════════════════════════════╗
║                      [ 1 / 19 ]                           ║
║                                                            ║
║                   System-Prüfung                          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

✓ Root-Rechte: OK
✓ Ubuntu/Debian: OK
✓ Internet: OK
✓ Freier Speicher: 12.5 GB
✓ System-Check abgeschlossen

... (weitere Schritte)
```

---

## ✅ Nach der Installation

### Services prüfen

```bash
# Backend
systemctl status fmsv-backend

# Nginx
systemctl status nginx
```

### Website aufrufen

```bash
# Lokal
http://localhost

# Extern
https://deine-domain.de
```

### Logs ansehen

```bash
# Installation
cat /var/log/fmsv-install.log

# Backend
journalctl -u fmsv-backend -f

# Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Test-Accounts

**Admin:**
- E-Mail: `admin@example.com`
- Passwort: `admin123`

**Member:**
- E-Mail: `user@example.com`
- Passwort: `user123`

**⚠️ WICHTIG:** Passwörter sofort ändern!

---

## 🔧 Wartung

### Installation wiederholen

```bash
# Stoppt automatisch alte Installation
sudo ./install-modular.sh
```

### Einzelnes Modul testen

```bash
# Libraries laden
source lib/colors.sh
source lib/logging.sh
source lib/ui.sh
source lib/error-handler.sh

# Variablen setzen
export LOG_FILE="/tmp/test.log"
export INSTALL_DIR="/var/www/fmsv-dingden"

# Logging initialisieren
init_logging "$LOG_FILE"

# Modul testen
bash modules/01-system-check.sh
```

### Logs bereinigen

```bash
sudo rm -f /var/log/fmsv-install.log
sudo journalctl --vacuum-time=7d
```

---

## 🐛 Fehlerbehandlung

### Problem: "LOG_FILE kann nicht berührt werden"

**Ursache:** `LOG_FILE` nicht gesetzt  
**Lösung:** Bereits gefixt in v3.1

```bash
# Prüfen
grep "init_logging" install-modular.sh
# Sollte VOR ask_yes_no sein!
```

### Problem: "INSTALL_MODE ist nicht gesetzt"

**Ursache:** Ungültige Eingabe  
**Lösung:** Bereits gefixt mit Retry-Loop

```bash
# Test
sudo ./install-modular.sh
# Bei Modus-Auswahl: "99" eingeben
# Sollte erneut fragen, nicht abstürzen
```

### Problem: Text erscheint erst nach Eingabe

**Ursache:** stdout buffering  
**Lösung:** Bereits gefixt mit `printf`

```bash
# Prüfen
grep "printf" lib/ui.sh
# Sollte in allen ask_* Funktionen sein
```

### Problem: Cleanup überspringt Datenbank

**Ursache:** PostgreSQL läuft nicht  
**Lösung:** PostgreSQL starten

```bash
sudo systemctl start postgresql
sudo ./install-modular.sh
```

---

## 📁 Datei-Struktur

```
Installation/scripts/
├── install-modular.sh          # Haupt-Script (271 Zeilen)
├── make-executable.sh          # Berechtigungen setzen
├── lib/                        # Libraries (4 Dateien)
│   ├── colors.sh              # Farben & Formatierung
│   ├── logging.sh             # Log-Funktionen
│   ├── ui.sh                  # UI-Funktionen
│   └── error-handler.sh       # Error-Handling
├── modules/                    # Module (17 Dateien)
│   ├── 00-cleanup.sh          # ✨ NEU: Cleanup
│   ├── 01-system-check.sh
│   ├── 02-options.sh          # 🔧 FIXED: Error-Handling
│   ├── 03-system-update.sh
│   ├── 04-base-tools.sh
│   ├── 05-postgres.sh
│   ├── 06-nodejs.sh
│   ├── 07-repository.sh
│   ├── 08-database.sh
│   ├── 09-backend.sh
│   ├── 10-frontend.sh
│   ├── 11-nginx.sh
│   ├── 12-services.sh
│   ├── 13-firewall.sh
│   └── optional/
│       ├── pgadmin.sh
│       ├── cloudflare.sh
│       └── auto-update.sh
├── templates/                  # Nginx Templates
│   ├── nginx-with-cloudflare.conf
│   └── nginx-without-cloudflare.conf
└── *.md                       # Dokumentation

Total: 36 Dateien, 4410+ Zeilen Code
```

---

## 🎯 Checkliste: Installation erfolgreich?

- [ ] Cleanup ohne Fehler durchgelaufen
- [ ] Alle 19 Schritte abgeschlossen
- [ ] `systemctl status fmsv-backend` zeigt "active (running)"
- [ ] `systemctl status nginx` zeigt "active (running)"
- [ ] `curl http://localhost` liefert HTML
- [ ] `curl http://localhost:3000/api/health` liefert JSON
- [ ] Website im Browser erreichbar
- [ ] Login mit Test-Account funktioniert
- [ ] `/var/log/fmsv-install.log` enthält "COMPLETED"

---

## 📞 Support

### Logs prüfen
```bash
# Installation
cat /var/log/fmsv-install.log

# Backend
journalctl -u fmsv-backend -f

# Postgres
sudo tail -f /var/log/postgresql/postgresql-16-main.log
```

### Debug-Modus
```bash
DEBUG=yes sudo ./install-modular.sh
```

### Syntax-Check
```bash
bash -n install-modular.sh
bash -n modules/*.sh
bash -n lib/*.sh
```

---

## 📝 Changelog

### v3.1 (2025-01-31)
- ✨ Neues Modul: `00-cleanup.sh`
- 🔧 Grafik-Fixes: `printf` statt `echo -ne`
- 🔧 Error-Handling: Retry-Loop + Fallback
- 🔧 INSTALL_MODE: Immer gesetzt
- 📊 19 Schritte statt 18

### v3.0 (2025-01-31)
- ✨ Modulare Struktur (13+3 Module)
- ✨ 4 Libraries
- ✨ Vollständiges Logging
- ✨ Error-Handling

---

## 🚀 Nächste Schritte

Nach erfolgreicher Installation:

1. **SSL-Zertifikat installieren**
   ```bash
   sudo certbot --nginx -d deine-domain.de
   ```

2. **SMTP konfigurieren**
   ```bash
   sudo nano /var/www/fmsv-dingden/backend/.env
   # SMTP_HOST, SMTP_PORT, etc.
   sudo systemctl restart fmsv-backend
   ```

3. **Passwörter ändern**
   - Login: https://deine-domain.de/login
   - Admin-Account: `admin@example.com`
   - Profil → Einstellungen → Passwort ändern

4. **Backup einrichten**
   ```bash
   # PostgreSQL Backup
   sudo -u postgres pg_dump fmsv_database > backup.sql
   
   # Dateien Backup
   tar -czf fmsv-backup.tar.gz /var/www/fmsv-dingden
   ```

---

**Version:** 3.1-modular  
**Datum:** 2025-01-31  
**Autor:** Benno Bartholmes  
**Status:** ✅ Production Ready
