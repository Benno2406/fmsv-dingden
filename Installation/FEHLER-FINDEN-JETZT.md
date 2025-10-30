# 🔍 BACKEND FEHLER FINDEN - JETZT!

## Problem
Der Backend-Service startet nicht und die bisherigen Debug-Tools zeigen den Fehler nicht an.

## ✅ LÖSUNG: Verwende diese 3 Scripts

### Script 1: Manual Start (BEGINNE HIER!)

Dieses Script startet den Backend-Server **MANUELL** und zeigt **ALLE** Fehler direkt an:

```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo chmod +x manual-start.sh
sudo ./manual-start.sh
```

**Was es macht:**
1. Stoppt den systemd Service
2. Zeigt .env Status
3. Startet `node server.js` DIREKT
4. Zeigt ALLE Fehler im Klartext

**DER FEHLER WIRD HIER ANGEZEIGT!** ⬆️

---

### Script 2: Simple Debug (Schritt-für-Schritt)

Falls Script 1 nicht reicht, nutze das Schritt-für-Schritt Debug:

```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo chmod +x simple-debug.sh
sudo ./simple-debug.sh
```

**Was es prüft:**
- ✓ .env existiert?
- ✓ PostgreSQL läuft?
- ✓ Datenbank-Verbindung OK?
- ✓ node_modules vorhanden?
- ✓ Dependencies laden?
- ✓ Server startet manuell?

---

### Script 3: Show Real Error (Log-Analyse)

Zeigt alle Logs mit frischem Service-Neustart:

```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo chmod +x show-real-error.sh
sudo ./show-real-error.sh
```

**Was es zeigt:**
- Systemd Logs (neueste zuerst)
- Backend Error Log
- Manueller Start-Test

---

## 🎯 SCHNELLSTE METHODE

Kopiere das und führe es aus:

```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo chmod +x *.sh
sudo ./manual-start.sh
```

Dann siehst du **SOFORT** den echten Fehler!

---

## 📋 Häufigste Fehler die du sehen wirst:

### 1. `.env` fehlt
```
✗ .env EXISTIERT NICHT!
```

**Lösung:**
```bash
cd /var/www/fmsv-dingden/backend
sudo cp env.example.txt .env
sudo nano .env
# Fülle ALLE Werte aus!
sudo systemctl restart fmsv-backend
```

### 2. Datenbank-Verbindung fehlgeschlagen
```
error: connect ECONNREFUSED 127.0.0.1:5432
```

**Lösung:**
```bash
sudo systemctl start postgresql
sudo systemctl restart fmsv-backend
```

### 3. Datenbank existiert nicht
```
error: database "fmsv_database" does not exist
```

**Lösung:**
```bash
sudo -u postgres psql
CREATE DATABASE fmsv_database;
CREATE USER fmsv_user WITH PASSWORD 'dein-passwort';
GRANT ALL PRIVILEGES ON DATABASE fmsv_database TO fmsv_user;
\q

cd /var/www/fmsv-dingden/backend
node scripts/initDatabase.js
```

### 4. JWT_SECRET fehlt
```
✗ Fehlende Env-Variablen: JWT_SECRET
```

**Lösung:**
```bash
cd /var/www/fmsv-dingden/backend
sudo nano .env
# Füge hinzu:
JWT_SECRET=dein-super-geheimer-schlüssel-min-32-zeichen-lang
```

### 5. Port bereits belegt
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Lösung:**
```bash
# Finde den Prozess
sudo netstat -tulpn | grep :5000
# Töte ihn (ersetze PID)
sudo kill <PID>
# ODER wähle anderen Port
sudo nano /var/www/fmsv-dingden/backend/.env
# PORT=5001
```

### 6. node_modules fehlen
```
Error: Cannot find module 'express'
```

**Lösung:**
```bash
cd /var/www/fmsv-dingden/backend
sudo npm install
sudo systemctl restart fmsv-backend
```

---

## 📝 Nach dem Fehler gefunden wurde:

1. **Behebe den Fehler** (siehe Lösungen oben)
2. **Teste manuell:**
   ```bash
   cd /var/www/fmsv-dingden/backend
   sudo node server.js
   # Sollte jetzt ohne Fehler starten
   # Strg+C zum Beenden
   ```
3. **Starte Service:**
   ```bash
   sudo systemctl restart fmsv-backend
   sudo systemctl status fmsv-backend
   ```
4. **Teste HTTP:**
   ```bash
   curl http://localhost:5000/api/health
   # Sollte: {"status":"ok",...} zurückgeben
   ```

---

## 🆘 Wenn IMMER NOCH nichts funktioniert:

Sende mir die komplette Ausgabe von:

```bash
sudo ./manual-start.sh > ~/backend-fehler.txt 2>&1
cat ~/backend-fehler.txt
```

Dann kann ich den genauen Fehler sehen!

---

**Erstellt:** 2025-10-30  
**Version:** 1.0  
**Zweck:** Den ECHTEN Backend-Fehler finden, nicht raten!
