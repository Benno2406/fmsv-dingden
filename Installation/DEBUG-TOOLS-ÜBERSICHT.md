# 🔧 Debug-Tools Übersicht

Schneller Überblick über alle verfügbaren Debug- und Reparatur-Tools.

---

## 🎯 Welches Tool wofür?

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROBLEM-ÜBERSICHT                            │
└─────────────────────────────────────────────────────────────────┘

❌ 500 Internal Server Error
   └─► quick-500-debug.sh        (⚡ Schnellste Lösung!)
   └─► test-backend.sh           (Detaillierte Analyse)
   └─► debug.sh → Option [2]     (Mit Auto-Fix)

❌ Backend startet nicht
   └─► test-backend.sh           (Runtime-Tests)
   └─► debug.sh → Option [7]     (Backend Runtime Test)

❌ Dateien fehlen (schema.sql, etc.)
   └─► repair-files.sh           (Git Reparatur)
   └─► debug.sh → Option [6]     (Datei-Reparatur)

❌ Cloudflare Tunnel Problem
   └─► debug.sh → Option [3]     (Tunnel Tests)

❓ Nicht sicher was das Problem ist
   └─► debug.sh → Option [4]     (Vollständige Diagnose)
   └─► quick-500-debug.sh        (Quick-Check)

📊 Vor Installation prüfen
   └─► debug.sh → Option [1]     (Pre-Installation Check)

🔄 Nach Update Probleme
   └─► test-backend.sh           (Validierung)
   └─► quick-500-debug.sh        (Schnell-Check)
```

---

## 📁 Tool-Übersicht

### 1️⃣ `quick-500-debug.sh` ⭐ NEU

**Wofür:** Schnellste Diagnose bei 500 Errors  
**Dauer:** ~5 Sekunden  
**Verwendung:**
```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./quick-500-debug.sh
```

**Features:**
- ⚡ Blitz-Check in 10 Punkten
- ✅/✗ Klare Fehleranzeige
- 💡 Konkrete Lösungsvorschläge
- 📋 Automatische Log-Anzeige
- 🎯 Zeigt nur echte Probleme

**Output-Beispiel:**
```
[1/10] Backend Service läuft...        ✓
[2/10] .env Datei existiert...         ✓
[3/10] JWT_SECRET gesetzt...           ✗ FEHLER!
[4/10] DB Credentials gesetzt...       ✓
...

❌ 2 KRITISCHE FEHLER GEFUNDEN!
```

---

### 2️⃣ `test-backend.sh` ⭐ NEU

**Wofür:** Umfassende Backend-Tests mit echten HTTP-Requests  
**Dauer:** ~15-30 Sekunden  
**Verwendung:**
```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./test-backend.sh
```

**Features:**
- 🌐 Echte HTTP-Anfragen an Backend
- 🗃️ Datenbank Connection Tests
- 📦 Node.js Runtime-Checks
- 🔌 Port-Validierung
- 📊 Nginx Proxy Tests
- 📝 Detaillierte Logs
- ✅ 7 Test-Suiten

**Test-Suiten:**
1. Systemd Service Status
2. Port Check (aus .env)
3. HTTP Request (`/api/health`)
4. Datenbank-Verbindung
5. Node.js Runtime
6. Backend-Logs
7. Nginx Proxy

---

### 3️⃣ `debug.sh`

**Wofür:** Haupt-Debug-Tool mit interaktivem Menü  
**Dauer:** Je nach gewählter Option  
**Verwendung:**
```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./debug.sh
```

**Menü-Optionen:**

```
[1] Pre-Installation Check
    → System-Voraussetzungen prüfen
    
[2] 500 Error Diagnose ⭐
    → Führt quick-500-debug.sh aus
    → Bietet automatischen Quick-Fix
    
[3] Cloudflare Tunnel Test
    → Cloudflare Konfiguration
    → DNS-Checks
    → Tunnel-Status
    
[4] Vollständige System-Diagnose
    → Alle Tests durchführen
    → Kompletter Report
    
[5] Logs anzeigen
    → Backend, Nginx, PostgreSQL
    → Interaktive Auswahl
    
[6] Fehlende Dateien reparieren
    → Startet repair-files.sh
    
[7] Backend Runtime Test ⭐ NEU
    → Startet test-backend.sh
    
[0] Beenden
```

---

### 4️⃣ `repair-files.sh`

**Wofür:** Fehlende Repository-Dateien wiederherstellen  
**Dauer:** ~10-60 Sekunden  
**Verwendung:**
```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./repair-files.sh
```

**Features:**
- 🔍 Prüft kritische Dateien
- 📋 Zeigt fehlende Dateien
- 🔧 3 Reparatur-Optionen
- 💾 Sichert .env automatisch

**Reparatur-Optionen:**

```
[1] Git Pull
    → Holt fehlende Dateien
    → Behält lokale Änderungen
    → Schnellste Option
    
[2] Git Reset
    → Setzt alle Dateien zurück
    ⚠  Lokale Änderungen gehen verloren
    → Sichert .env automatisch
    
[3] Neuinstallation
    → Anleitung für komplette Neuinstallation
    → Datenbank bleibt erhalten
```

**Geprüfte Dateien:**
- backend/database/schema.sql
- backend/server.js
- backend/config/database.js
- backend/scripts/*
- package.json

---

### 5️⃣ `install.sh`

**Wofür:** Vollständige Installation  
**Dauer:** ~15-30 Minuten  
**Verwendung:**
```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./install.sh
```

**Features:**
- 📦 Installiert alle Abhängigkeiten
- 🗃️ Richtet Datenbank ein
- ⚙️ Konfiguriert Services
- 🌐 Nginx Setup
- ☁️ Optional: Cloudflare Tunnel
- ✅ Validierung nach Installation

---

### 6️⃣ `update.sh`

**Wofür:** System-Updates  
**Dauer:** ~5-15 Minuten  
**Verwendung:**
```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./update.sh
```

**Features:**
- 🔄 Git Pull
- 📦 npm install
- 🗃️ Datenbank-Migrationen
- 🔄 Service-Neustart
- 💾 Optional: Backup
- ✅ Validierung

---

## 🎯 Entscheidungsbaum

```
Problem?
│
├─ Weißt du was das Problem ist?
│  │
│  ├─ JA → Gehe zu spezifischem Tool
│  │  ├─ 500 Error → quick-500-debug.sh
│  │  ├─ Dateien fehlen → repair-files.sh
│  │  ├─ Backend läuft nicht → test-backend.sh
│  │  └─ Cloudflare → debug.sh → [3]
│  │
│  └─ NEIN → Starte mit Diagnose
│     ├─ 1. quick-500-debug.sh (5 Sek)
│     ├─ 2. Wenn nicht gefunden: test-backend.sh (30 Sek)
│     └─ 3. Wenn immer noch unklar: debug.sh → [4]
│
└─ Vor Installation?
   └─ debug.sh → [1] (Pre-Installation Check)
```

---

## 📊 Vergleichstabelle

| Tool | Dauer | Verwendung | Auto-Fix | Details |
|------|-------|------------|----------|---------|
| `quick-500-debug.sh` | ⚡ 5s | 500 Errors | ❌ | ⭐⭐⭐⭐⭐ |
| `test-backend.sh` | ⏱️ 30s | Backend Tests | ❌ | ⭐⭐⭐⭐⭐ |
| `debug.sh` | 🕐 variabel | Alles | ✅ | ⭐⭐⭐⭐ |
| `repair-files.sh` | ⏱️ 10-60s | Dateien | ✅ | ⭐⭐⭐⭐ |
| `install.sh` | 🕐 15-30min | Installation | ✅ | ⭐⭐⭐ |
| `update.sh` | 🕐 5-15min | Updates | ✅ | ⭐⭐⭐ |

**Legende:**
- ⚡ = Sehr schnell (< 10s)
- ⏱️ = Schnell (< 1min)
- 🕐 = Dauert länger (> 1min)
- ✅ = Automatische Reparatur möglich
- ❌ = Nur Diagnose, manuelle Reparatur

---

## 🚀 Quick-Reference

### Schnellste Problemlösung

```bash
# Terminal öffnen
ssh root@dein-server

# Zu Scripts navigieren
cd /var/www/fmsv-dingden/Installation/scripts

# EINE dieser Optionen:

# 1. Bei 500 Error (empfohlen!)
sudo ./quick-500-debug.sh

# 2. Backend prüfen
sudo ./test-backend.sh

# 3. Alles prüfen
sudo ./debug.sh

# 4. Dateien reparieren
sudo ./repair-files.sh
```

---

## 📋 Häufige Workflows

### Workflow 1: Fehlersuche bei 500 Error

```bash
cd /var/www/fmsv-dingden/Installation/scripts

# Schritt 1: Quick-Check
sudo ./quick-500-debug.sh

# Wenn Fehler gefunden → Folge den Anweisungen

# Schritt 2: Falls nicht gefunden
sudo ./test-backend.sh

# Schritt 3: Falls immer noch unklar
sudo ./debug.sh
# Option [2] wählen
# Quick-Fix mit "j" bestätigen
```

---

### Workflow 2: Backend startet nicht

```bash
cd /var/www/fmsv-dingden/Installation/scripts

# Schritt 1: Runtime-Test
sudo ./test-backend.sh

# Schritt 2: Logs live ansehen
sudo journalctl -u fmsv-backend -f

# (In anderem Terminal)
# Schritt 3: Service neu starten
sudo systemctl restart fmsv-backend
```

---

### Workflow 3: Nach Git Pull Probleme

```bash
cd /var/www/fmsv-dingden

# Pull durchführen
sudo git pull origin main

# Prüfen ob alles OK
cd Installation/scripts
sudo ./quick-500-debug.sh

# Wenn Fehler
sudo ./update.sh
```

---

## 💡 Pro-Tipps

### Tipp 1: Live-Debugging

```bash
# Terminal 1: Live-Logs
sudo journalctl -u fmsv-backend -f

# Terminal 2: Tests durchführen
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./test-backend.sh

# Terminal 3: Backend Control
sudo systemctl restart fmsv-backend
sudo systemctl status fmsv-backend
```

### Tipp 2: Regelmäßige Checks

```bash
# Cronjob erstellen für täglichen Health-Check
sudo crontab -e

# Füge hinzu:
0 3 * * * /var/www/fmsv-dingden/Installation/scripts/quick-500-debug.sh > /tmp/health-check.log 2>&1
```

### Tipp 3: Schnelle Validierung nach Änderungen

```bash
# Nach Code-Änderungen immer:
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./test-backend.sh

# Wenn ✓✓✓ → Alles OK
# Wenn ✗ → Problem beheben
```

---

## 🔗 Weitere Ressourcen

- **[500-ERROR-LÖSUNG.md](500-ERROR-LÖSUNG.md)** - Ausführliche 500 Error Hilfe
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Komplettes Troubleshooting
- **[WICHTIG-SCHEMA-FIX.md](WICHTIG-SCHEMA-FIX.md)** - schema.sql Problem
- **[scripts/README.md](scripts/README.md)** - Detaillierte Script-Doku

---

**Erstellt:** 30. Oktober 2025  
**Version:** 1.0  
**Status:** ⭐ Neu - Mit erweiterten Debug-Tools
