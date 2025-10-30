# 🚨 500 Internal Server Error - LÖSUNG

## Problem
Du siehst einen **500 Internal Server Error**, obwohl das Debug-Tool keine Fehler findet.

## ✅ NEUE Lösung verfügbar!

Ich habe 3 neue spezielle Debug-Tools erstellt, die **echte Runtime-Probleme** finden:

---

## 🔥 Option 1: Quick-Diagnose (Empfohlen!)

**Schnellste Methode - zeigt sofort das Problem:**

```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./quick-500-debug.sh
```

**Was es macht:**
- ⚡ 10-Punkte-Blitz-Check in Sekunden
- ✅ Zeigt genau was fehlt oder falsch ist
- 💡 Gibt konkrete Lösungsvorschläge
- 📋 Zeigt letzte Backend-Logs automatisch

**Output-Beispiel:**
```
[1/10] Backend Service läuft...        ✓
[2/10] .env Datei existiert...         ✓
[3/10] JWT_SECRET gesetzt...           ✗ FEHLER!
        → JWT_SECRET fehlt oder ist leer!
[4/10] DB Credentials gesetzt...       ✓
[5/10] PostgreSQL läuft...             ✓
[6/10] Datenbank existiert...          ✗ FEHLER!
        → Datenbank 'fmsv_dingden' existiert nicht!
...

❌ 2 KRITISCHE FEHLER GEFUNDEN!

💡 Empfohlene Maßnahmen:
  1. .env neu erstellen:
     ./debug.sh → Option [2] → Quick-Fix
  ...
```

---

## 🔧 Option 2: Umfassender Backend-Test

**Detaillierte Analyse mit HTTP-Tests:**

```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./test-backend.sh
```

**Was es macht:**
- 🌐 Testet **echte HTTP-Anfragen** an den Backend-Server
- 🗃️ Prüft Datenbank-Verbindung mit echten Queries
- 📦 Testet ob Node.js Runtime funktioniert
- 🔌 Port-Checks
- 📊 Nginx Proxy Tests

**7 Test-Suiten:**
1. Systemd Service Status
2. Port Check (liest aus .env)
3. **HTTP Request** (echter Request an `/api/health`)
4. Datenbank-Verbindung (echte Query)
5. Node.js Runtime (lädt server.js)
6. Backend-Logs
7. Nginx Proxy

---

## 🎯 Option 3: Debug-Tool Menü

**Über das Haupt-Debug-Tool:**

```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./debug.sh
```

**Dann wähle:**
- **Option [2]**: 500 Error Diagnose (führt Quick-Debug aus + Quick-Fix)
- **Option [7]**: Backend Runtime Test (umfassende Tests)

---

## 🚀 Häufigste Probleme & Schnelle Fixes

### Problem 1: Backend läuft nicht

```bash
# Status prüfen
sudo systemctl status fmsv-backend

# Logs ansehen
sudo journalctl -u fmsv-backend -n 50

# Neu starten
sudo systemctl restart fmsv-backend
```

---

### Problem 2: .env fehlt oder unvollständig

**Automatischer Fix:**
```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./debug.sh
# Option [2] wählen
# Quick-Fix mit "j" bestätigen
```

Oder manuell:
```bash
cd /var/www/fmsv-dingden/backend
cp env.example.txt .env
nano .env  # Ausfüllen
```

---

### Problem 3: Datenbank nicht initialisiert

```bash
# Prüfe ob Datenbank existiert
sudo -u postgres psql -l | grep fmsv_dingden

# Wenn nicht, erstelle sie
sudo -u postgres psql <<EOF
CREATE DATABASE fmsv_dingden OWNER fmsv_user;
GRANT ALL PRIVILEGES ON DATABASE fmsv_dingden TO fmsv_user;
EOF

# Initialisiere Schema
cd /var/www/fmsv-dingden/backend
sudo node scripts/initDatabase.js
```

---

### Problem 4: schema.sql fehlt

```bash
# Reparatur-Tool verwenden
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./repair-files.sh

# Option [1] wählen: Git Pull
```

---

### Problem 5: Port bereits belegt

```bash
# Prüfe welcher Prozess Port 5000/3000 nutzt
sudo netstat -tulpn | grep :5000
sudo netstat -tulpn | grep :3000

# Alten Prozess beenden
sudo kill <PID>

# Backend neu starten
sudo systemctl restart fmsv-backend
```

---

### Problem 6: Node.js Fehler beim Start

```bash
# Dependencies neu installieren
cd /var/www/fmsv-dingden/backend
sudo npm install

# Test ob server.js lädt
sudo node -c server.js

# Service neu starten
sudo systemctl restart fmsv-backend
```

---

## 🔍 Live-Debugging

**Während der Server läuft Fehler finden:**

```bash
# Terminal 1: Live-Logs
sudo journalctl -u fmsv-backend -f

# Terminal 2: Test-Request senden
curl -v http://localhost:5000/api/health

# Terminal 3: Debug-Tool laufen lassen
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./quick-500-debug.sh
```

---

## 📊 Vollständiger Workflow

### Schritt 1: Quick-Diagnose
```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./quick-500-debug.sh
```

### Schritt 2: Fehler beheben
Je nach Fehler:
- **.env fehlt** → Quick-Fix: `./debug.sh` → [2] → "j"
- **DB fehlt** → `cd ../backend && node scripts/initDatabase.js`
- **Service tot** → `systemctl restart fmsv-backend`
- **schema.sql fehlt** → `./repair-files.sh` → [1]

### Schritt 3: Nochmal testen
```bash
sudo ./test-backend.sh
```

Sollte jetzt alles ✅ zeigen.

### Schritt 4: HTTP-Test
```bash
curl http://localhost:5000/api/health
```

Sollte antworten:
```json
{"status":"ok","timestamp":"..."}
```

---

## 🆘 Immer noch 500 Error?

### Erweiterte Fehlersuche:

```bash
# 1. Vollständige Diagnose
sudo ./debug.sh
# Option [4]: Vollständige System-Diagnose

# 2. Prüfe server.js auf Syntax-Fehler
cd /var/www/fmsv-dingden/backend
node -c server.js

# 3. Teste Datenbank-Verbindung direkt
cat > /tmp/test-db.js << 'EOF'
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('DB Error:', err);
        process.exit(1);
    }
    console.log('DB OK:', res.rows[0]);
    pool.end();
});
EOF

node /tmp/test-db.js

# 4. Nginx Error-Logs ansehen
sudo tail -50 /var/log/nginx/fmsv-error.log

# 5. PostgreSQL Logs
sudo journalctl -u postgresql -n 50
```

---

## 🔄 Letzter Ausweg: Komplette Neuinstallation

**NUR wenn wirklich nichts hilft!**

```bash
# 1. WICHTIG: Backup erstellen!
sudo -u postgres pg_dump fmsv_dingden > /tmp/fmsv-backup-$(date +%Y%m%d).sql
sudo cp /var/www/fmsv-dingden/backend/.env /tmp/env-backup

# 2. Service stoppen
sudo systemctl stop fmsv-backend

# 3. Alte Installation löschen
sudo rm -rf /var/www/fmsv-dingden

# 4. Neu klonen
sudo git clone <dein-repo> /var/www/fmsv-dingden

# 5. Neu installieren
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./install.sh

# 6. Daten wiederherstellen
sudo -u postgres psql fmsv_dingden < /tmp/fmsv-backup-$(date +%Y%m%d).sql
sudo cp /tmp/env-backup /var/www/fmsv-dingden/backend/.env
sudo systemctl restart fmsv-backend
```

---

## 📞 Hilfe holen

Wenn immer noch nichts funktioniert, sammle diese Infos:

```bash
# Diagnose-Report erstellen
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./debug.sh > /tmp/diagnose-$(date +%Y%m%d).txt 2>&1
# Option [4] wählen

# Logs sammeln
sudo journalctl -u fmsv-backend -n 200 > /tmp/backend-logs.txt
sudo cat /var/log/nginx/fmsv-error.log > /tmp/nginx-errors.txt

# System-Info
uname -a > /tmp/system-info.txt
node --version >> /tmp/system-info.txt
npm --version >> /tmp/system-info.txt
psql --version >> /tmp/system-info.txt
```

Dann diese Dateien bereitstellen:
- `/tmp/diagnose-*.txt`
- `/tmp/backend-logs.txt`
- `/tmp/nginx-errors.txt`
- `/tmp/system-info.txt`

⚠ **WICHTIG:** Entferne Passwörter/Secrets aus den Logs bevor du sie teilst!

---

## ✅ Checkliste "Alles funktioniert"

Wenn alles klappt, sollten alle diese Tests ✓ zeigen:

```bash
# 1. Quick-Debug
sudo ./quick-500-debug.sh
# → Alle [1-10] zeigen ✓

# 2. Service läuft
sudo systemctl status fmsv-backend
# → Active: active (running)

# 3. HTTP antwortet
curl http://localhost:5000/api/health
# → {"status":"ok",...}

# 4. Datenbank antwortet
sudo -u postgres psql -d fmsv_dingden -c "SELECT 1;"
# → ?column? 
#        1

# 5. Port ist offen
sudo netstat -tulpn | grep :5000
# → tcp ... LISTEN ... node

# 6. Keine Fehler in Logs
sudo journalctl -u fmsv-backend -n 20 --no-pager
# → Keine ERROR/FATAL Meldungen
```

---

**Viel Erfolg! 🚀**

**Version:** 1.0  
**Erstellt:** 30. Oktober 2025  
**Für:** FMSV Dingden Backend Debugging
