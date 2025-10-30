# Installation Scripts - Übersicht

Dieses Verzeichnis enthält alle Scripts für Installation, Wartung und Debugging des FMSV Dingden Systems.

## 📋 Script-Übersicht

### 🚀 Installation & Updates

#### `install.sh`
**Vollständige Neu-Installation**

Führt eine komplette Installation durch:
- System-Pakete (Node.js, PostgreSQL, Nginx, Cloudflare)
- Backend-Dependencies
- Datenbank-Initialisierung
- Systemd Services
- Nginx Konfiguration

```bash
sudo ./install.sh
```

**Features:**
- ✅ Automatische Dependency-Checks
- ✅ Interaktive Konfiguration
- ✅ Optional: Testdaten
- ✅ Validierung nach Installation
- ✅ Cloudflare Tunnel Setup

---

#### `update.sh`
**System-Updates durchführen**

Aktualisiert die Installation:
- Git Pull vom Repository
- npm install für neue Dependencies
- Datenbank-Migrationen (falls vorhanden)
- Service-Neustart
- Optional: Backup vor Update

```bash
sudo ./update.sh
```

**Sicherheit:**
- Erstellt automatisch Backups
- Rollback bei Fehlern
- Validiert Updates

---

### 🔧 Debugging & Diagnose

#### `debug.sh`
**Haupt-Debug-Tool mit interaktivem Menü**

Das zentrale Debug-Tool für alle Probleme:

```bash
sudo ./debug.sh
```

**Menü-Optionen:**

1. **Pre-Installation Check**
   - Prüft System-Voraussetzungen
   - Node.js, PostgreSQL, Disk Space, etc.

2. **500 Error Diagnose** ⭐
   - 10-Punkte-Schnellcheck
   - Zeigt kritische Fehler
   - Bietet automatischen Quick-Fix

3. **Cloudflare Tunnel Test**
   - Prüft Cloudflare-Konfiguration
   - Testet Verbindung
   - DNS-Checks

4. **Vollständige System-Diagnose**
   - Kombiniert alle Tests
   - Detaillierter Report

5. **Logs anzeigen**
   - Backend-Logs
   - Nginx-Logs
   - PostgreSQL-Logs

6. **Fehlende Dateien reparieren**
   - Prüft Repository-Vollständigkeit
   - Git Pull/Reset
   - schema.sql wiederherstellen

7. **Backend Runtime Test** ⭐ NEU
   - Testet echte HTTP-Requests
   - Datenbank-Verbindung
   - Node.js Runtime-Checks

---

#### `quick-500-debug.sh` ⭐ NEU
**Blitz-Diagnose für 500 Errors**

Schnelle 10-Punkte-Diagnose bei 500 Internal Server Errors:

```bash
sudo ./quick-500-debug.sh
```

**Prüft in Sekunden:**
- ✅ Backend Service läuft
- ✅ .env Datei vorhanden
- ✅ JWT_SECRET gesetzt
- ✅ DB Credentials korrekt
- ✅ PostgreSQL läuft
- ✅ Datenbank existiert
- ✅ Tabellen initialisiert
- ✅ Port ist offen
- ✅ node_modules installiert
- ✅ Backend antwortet auf HTTP

**Output:**
- ✓ = OK
- ✗ = FEHLER (kritisch)
- ⚠ = WARNUNG (unkritisch)

Zeigt automatisch:
- Anzahl Fehler/Warnungen
- Letzte Backend-Logs
- Konkrete Lösungsvorschläge

---

#### `test-backend.sh` ⭐ NEU
**Umfassender Backend Runtime Test**

Detaillierte Tests ob Backend wirklich funktioniert:

```bash
sudo ./test-backend.sh
```

**7 Test-Suiten:**

1. **Systemd Service Status**
   - Service-Status
   - Automatischer Start-Versuch

2. **Port Check**
   - Liest Port aus .env
   - Prüft ob Port offen

3. **HTTP Request (Health Check)**
   - Echter HTTP-Request an `/api/health`
   - Analysiert Response
   - Erkennt 500 Errors

4. **Datenbank-Verbindung**
   - PostgreSQL Connection Test
   - Prüft Tabellen-Existenz
   - Zeigt Tabellenliste

5. **Node.js Runtime Test**
   - Lädt server.js ohne zu starten
   - Prüft alle require()
   - Testet DB-Connection

6. **Letzte Backend-Logs**
   - 20 neueste Log-Einträge
   - Fehleranalyse

7. **Nginx Proxy Test**
   - Nginx-Status
   - Config-Validierung
   - Proxy-Setup prüfen

**Verwendung:**
- Als Standalone: `./test-backend.sh`
- Über debug.sh: Menü-Option [7]

---

#### `repair-files.sh`
**Repository-Dateien wiederherstellen**

Repariert fehlende oder beschädigte Dateien:

```bash
sudo ./repair-files.sh
```

**Optionen:**

1. **Git Pull**
   - Holt fehlende Dateien
   - Behält lokale Änderungen

2. **Git Reset**
   - Setzt alle Dateien zurück
   - ⚠ Lokale Änderungen gehen verloren
   - Sichert .env automatisch

3. **Neuinstallation**
   - Anleitung für komplette Neuinstallation
   - Datenbank bleibt erhalten

**Prüft kritische Dateien:**
- backend/database/schema.sql
- backend/server.js
- backend/config/database.js
- backend/scripts/*
- package.json

---

## 🚨 Häufige Probleme & Lösungen

### Problem: 500 Internal Server Error

**Schnellste Lösung:**
```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./quick-500-debug.sh
```

Folge den angezeigten Lösungsvorschlägen.

**Alternative:**
```bash
sudo ./debug.sh
# Option [2] wählen: 500 Error Diagnose
# Quick-Fix mit "j" bestätigen
```

---

### Problem: Backend startet nicht

```bash
# 1. Logs ansehen
sudo journalctl -u fmsv-backend -n 50

# 2. Test durchführen
sudo ./test-backend.sh

# 3. Wenn .env oder DB fehlt
sudo ./debug.sh
# Option [2] → Quick-Fix
```

---

### Problem: schema.sql fehlt

```bash
sudo ./repair-files.sh
# Option [1]: Git Pull
```

Oder:
```bash
cd /var/www/fmsv-dingden
sudo git pull origin main
```

---

### Problem: Nginx 502 Bad Gateway

```bash
# 1. Prüfe ob Backend läuft
sudo systemctl status fmsv-backend

# 2. Prüfe Nginx Config
sudo nginx -t

# 3. Beide neu starten
sudo systemctl restart fmsv-backend
sudo systemctl restart nginx
```

---

### Problem: Datenbank-Fehler

```bash
# 1. PostgreSQL Status
sudo systemctl status postgresql

# 2. Verbindung testen
sudo -u postgres psql -d fmsv_dingden -c "SELECT 1;"

# 3. Schema neu initialisieren
cd /var/www/fmsv-dingden/backend
sudo node scripts/initDatabase.js
```

---

## 📊 Workflow-Beispiele

### Erste Installation
```bash
# 1. Repository klonen
git clone <repo-url> /var/www/fmsv-dingden

# 2. Installation durchführen
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./install.sh

# 3. Nach Installation testen
sudo ./test-backend.sh
```

---

### Nach Git Pull
```bash
# 1. Updates holen
cd /var/www/fmsv-dingden
sudo git pull origin main

# 2. Update-Script ausführen
cd Installation/scripts
sudo ./update.sh
```

---

### Fehlersuche
```bash
# 1. Quick-Debug
sudo ./quick-500-debug.sh

# 2. Wenn nicht gefunden, detailliert
sudo ./test-backend.sh

# 3. Wenn immer noch unklar
sudo ./debug.sh
# Option [4]: Vollständige Diagnose
```

---

## 🔐 Sicherheitshinweise

### Berechtigungen

Alle Scripts müssen als root ausgeführt werden:
```bash
sudo ./script.sh
```

### Sensible Daten

Die Scripts greifen auf sensible Daten zu:
- `.env` Dateien (Passwörter, Secrets)
- Datenbank-Credentials
- Audit Logs

⚠ **Logs niemals öffentlich teilen!**

### Backups

Vor größeren Änderungen:
```bash
# Datenbank-Backup
sudo -u postgres pg_dump fmsv_dingden > /tmp/backup-$(date +%Y%m%d).sql

# .env Backup
sudo cp /var/www/fmsv-dingden/backend/.env /tmp/env-backup
```

---

## 📝 Logging

### Wo finde ich Logs?

**Backend-Logs (Systemd):**
```bash
journalctl -u fmsv-backend -n 50         # Letzte 50 Zeilen
journalctl -u fmsv-backend -f            # Live-Logs
journalctl -u fmsv-backend --since today # Nur heute
```

**Application-Logs:**
```bash
/var/www/fmsv-dingden/Logs/*.log         # App-Logs
/var/www/fmsv-dingden/Logs/Audit/*.log   # Audit-Logs
```

**Nginx-Logs:**
```bash
/var/log/nginx/fmsv-access.log
/var/log/nginx/fmsv-error.log
```

**PostgreSQL-Logs:**
```bash
journalctl -u postgresql -n 50
/var/log/postgresql/postgresql-*.log
```

---

## 🆘 Support

Wenn nichts hilft:

1. **Vollständige Diagnose erstellen:**
   ```bash
   sudo ./debug.sh > /tmp/diagnose.txt 2>&1
   # Option [4]: Vollständige Diagnose
   ```

2. **Logs sammeln:**
   ```bash
   sudo journalctl -u fmsv-backend -n 100 > /tmp/backend-logs.txt
   ```

3. **System-Info sammeln:**
   ```bash
   sudo ./debug.sh
   # Option [1]: Pre-Installation Check
   ```

4. **Neuinstallation als letzter Ausweg:**
   ```bash
   # Backup erstellen!
   sudo -u postgres pg_dump fmsv_dingden > /tmp/db-backup.sql
   
   # Neu installieren
   sudo ./install.sh
   
   # Daten wiederherstellen
   sudo -u postgres psql fmsv_dingden < /tmp/db-backup.sql
   ```

---

**Version:** 1.0  
**Letzte Aktualisierung:** 30. Oktober 2025  
**Maintainer:** FMSV Dingden Webteam
