# 🔧 Backend Debug Tools - Komplette Übersicht

## 🚨 BACKEND STARTET NICHT?

### ⚡ **SCHNELLSTE LÖSUNG** (starte hier!)

```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./quick-fix.sh
```

☝️ Findet und behebt 90% aller Probleme automatisch!

---

## 📊 Alle verfügbaren Tools

### 1️⃣ **Quick Fix** - Automatische Problemlösung
```bash
sudo ./quick-fix.sh
```
**Was es macht:**
- Prüft .env Datei
- Prüft PostgreSQL
- Prüft Datenbank-Verbindung
- Prüft node_modules
- Prüft Port-Konflikte
- Testet Server-Start
- **Behebt Probleme automatisch!**

**Verwende wenn:** Backend startet nicht und du weißt nicht warum

---

### 2️⃣ **Manual Start** - Zeigt echte Fehler
```bash
sudo ./manual-start.sh
```
**Was es macht:**
- Stoppt systemd Service
- Startet Backend DIREKT mit `node server.js`
- Zeigt ALLE Fehler im Klartext

**Verwende wenn:** Quick Fix zeigt keine Fehler, aber Backend startet trotzdem nicht

---

### 3️⃣ **Simple Debug** - Schritt-für-Schritt
```bash
sudo ./simple-debug.sh
```
**Was es macht:**
- Prüft jeden Schritt einzeln
- Zeigt genau wo das Problem ist
- Gibt klare Lösungsvorschläge

**Verwende wenn:** Du willst verstehen was genau falsch ist

---

### 4️⃣ **Show Real Error** - Log-Analyse
```bash
sudo ./show-real-error.sh
```
**Was es macht:**
- Zeigt Systemd Logs
- Zeigt Backend Error Logs
- Zeigt Combined Logs
- Macht frischen Neustart-Test

**Verwende wenn:** Du suchst nach vergangenen Fehlern

---

### 5️⃣ **Test Backend** - Vollständiger Test
```bash
sudo ./test-backend.sh
```
**Was es macht:**
- 7 umfassende Tests
- Service-Status
- Port-Check
- HTTP-Request
- Datenbank-Verbindung
- Node.js Runtime
- Nginx Proxy

**Verwende wenn:** Du alles prüfen willst

---

### 6️⃣ **Diagnose Menü** - Interaktives Tool
```bash
sudo ./diagnose.sh
```
**Was es macht:**
- Interaktives Menü
- Alle Tools an einem Ort
- Service-Management
- Live-Logs

**Verwende wenn:** Du eine GUI willst

---

### 7️⃣ **Show Backend Errors** - Detaillierte Fehler
```bash
sudo ./show-backend-errors.sh
```
**Was es macht:**
- Alle Log-Quellen
- .env Check
- Datenbank-Status
- Manueller Start-Test

**Verwende wenn:** Du alle Details brauchst

---

## 🎯 Entscheidungsbaum

```
Backend startet nicht?
│
├─ Weiß nicht warum
│  └─> sudo ./quick-fix.sh
│
├─ Quick Fix hat nicht geholfen
│  └─> sudo ./manual-start.sh
│
├─ Will Schritt-für-Schritt verstehen
│  └─> sudo ./simple-debug.sh
│
├─ Suche nach Logs/Fehlern
│  └─> sudo ./show-real-error.sh
│
├─ Will alles testen
│  └─> sudo ./test-backend.sh
│
└─ Will interaktives Menü
   └─> sudo ./diagnose.sh
```

---

## 📝 Nach der Installation verfügbare Befehle

Nach `install.sh` sind diese Befehle überall verfügbar:

```bash
# Probleme beheben
fmsv-fix

# Manueller Start
fmsv-manual

# Vollständige Diagnose
fmsv-debug

# Tests
fmsv-test

# Fehler anzeigen
fmsv-errors

# System updaten
fmsv-update
```

---

## 🆘 Häufigste Fehler & Lösungen

### `.env fehlt`
```bash
cd /var/www/fmsv-dingden/backend
cp env.example.txt .env
nano .env  # Alle Werte ausfüllen!
```

### `PostgreSQL läuft nicht`
```bash
systemctl start postgresql
```

### `Datenbank existiert nicht`
```bash
sudo -u postgres psql
CREATE DATABASE fmsv_database;
CREATE USER fmsv_user WITH PASSWORD 'passwort';
GRANT ALL PRIVILEGES ON DATABASE fmsv_database TO fmsv_user;
\q

node scripts/initDatabase.js
```

### `Port bereits belegt`
```bash
# Finde Prozess
netstat -tulpn | grep :5000
# Töte Prozess
kill <PID>
```

### `node_modules fehlen`
```bash
cd /var/www/fmsv-dingden/backend
npm install
```

---

## 💡 Tipps

1. **Starte immer mit `quick-fix.sh`**
2. **Bei Fehlern nutze `manual-start.sh`** - zeigt echte Fehler!
3. **Logs lesen von unten nach oben**
4. **Bei DB-Problemen: PostgreSQL prüfen**
5. **Bei Port-Problemen: `netstat` nutzen**

---

## 📚 Weitere Dokumentation

- `/Installation/START-HIER.md` - Schnellstart
- `/Installation/FEHLER-FINDEN-JETZT.md` - Detaillierte Anleitung
- `/Installation/BACKEND-STARTET-NICHT.md` - Troubleshooting
- `/Installation/TROUBLESHOOTING.md` - Allgemeine Probleme

---

## 🔄 Updates

Diese Scripts werden regelmäßig verbessert. Nach einem Update:

```bash
cd /var/www/fmsv-dingden/Installation/scripts
chmod +x *.sh
```

---

**Erstellt:** 2025-10-30  
**Version:** 2.0  
**Maintainer:** FMSV Dingden Team
