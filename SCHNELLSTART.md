# FMSV Dingden - Schnellstart

## 🚀 Projekt starten (3 Optionen)

### Option 1: Automatisches Start-Script (EMPFOHLEN ⭐)

```bash
cd /var/www/fmsv-dingden
chmod +x start-dev.sh
./start-dev.sh
```

**Das Script:**
- ✅ Prüft alle Dependencies
- ✅ Prüft .env Konfiguration
- ✅ Startet Backend & Frontend
- ✅ Zeigt Status & URLs
- ✅ Öffnet optional den Browser
- ✅ Stoppt beide mit Ctrl+C

---

### Option 2: Manuell (2 Terminals)

**Terminal 1 - Backend:**
```bash
cd /var/www/fmsv-dingden/backend
npm install              # Nur beim ersten Mal
npm run dev              # Oder: npm start
```

**Terminal 2 - Frontend:**
```bash
cd /var/www/fmsv-dingden
npm install              # Nur beim ersten Mal
npm run dev
```

Browser öffnen: `http://localhost:5173`

---

### Option 3: Production Build testen

```bash
# 1. Frontend bauen
cd /var/www/fmsv-dingden
npm run build

# 2. Backend starten (serviert automatisch Frontend)
cd backend
NODE_ENV=production npm start
```

Frontend + Backend auf: `http://localhost:3000`

---

## 🔧 Erste Einrichtung

### 1. Backend-Konfiguration

```bash
cd /var/www/fmsv-dingden/backend
cp env.example.txt .env
nano .env
```

**Wichtigste Einstellungen:**
```env
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=5432
DB_NAME=fmsv_dingden
DB_USER=fmsv_user
DB_PASSWORD=dein_sicheres_passwort

JWT_SECRET=generiere-einen-sicheren-secret
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=deine@email.de
SMTP_PASSWORD=dein_passwort
```

### 2. Datenbank initialisieren

```bash
cd /var/www/fmsv-dingden/backend

# Datenbank erstellen
sudo -u postgres psql

# In psql:
CREATE DATABASE fmsv_dingden;
CREATE USER fmsv_user WITH PASSWORD 'dein_passwort';
GRANT ALL PRIVILEGES ON DATABASE fmsv_dingden TO fmsv_user;
\q

# Schema & Daten laden
npm run init-db    # Erstellt Tabellen
npm run seed       # Fügt Test-Daten ein (optional)
```

### 3. Frontend-Konfiguration (optional)

```bash
cd /var/www/fmsv-dingden
nano .env
```

```env
VITE_API_URL=http://localhost:3000/api
```

---

## ✅ Überprüfung

### Backend läuft?
```bash
curl http://localhost:3000/api/health

# Sollte zurückgeben:
# {"status":"ok","timestamp":"...","uptime":...}
```

### Frontend läuft?
```bash
curl http://localhost:5173

# Sollte HTML zurückgeben
```

### Beide kommunizieren?
1. Öffne `http://localhost:5173`
2. Gehe zu Login
3. Versuche Login → Sollte Backend kontaktieren

---

## 🆘 Häufige Probleme

### "Port 3000 already in use"

```bash
# Finde Prozess
lsof -ti:3000

# Prozess beenden
kill -9 $(lsof -ti:3000)

# Oder:
pkill -f "node.*server.js"
```

### "Backend nicht erreichbar"

```bash
# Prüfe ob Backend läuft
ps aux | grep "node.*server.js"

# Prüfe Logs
tail -f /var/www/fmsv-dingden/Logs/*.log

# Oder mit Debug-Tool
cd /var/www/fmsv-dingden/Installation/scripts
./debug.sh
```

### "Database connection failed"

```bash
# Prüfe PostgreSQL
sudo systemctl status postgresql

# Starte PostgreSQL
sudo systemctl start postgresql

# Teste Verbindung
psql -U fmsv_user -d fmsv_dingden -h localhost

# Prüfe .env
cat /var/www/fmsv-dingden/backend/.env | grep DB_
```

### "node_modules not found"

```bash
# Frontend
cd /var/www/fmsv-dingden
npm install

# Backend
cd /var/www/fmsv-dingden/backend
npm install
```

---

## 📝 Nützliche Commands

### Status prüfen
```bash
# Backend Status
curl http://localhost:3000/api/health

# Prozesse finden
ps aux | grep -E "(node|vite)"

# Ports prüfen
netstat -tulpn | grep -E "(3000|5173)"
```

### Logs ansehen
```bash
# Backend Logs (wenn als Service)
journalctl -u fmsv-backend -f

# Backend Logs (Entwicklung)
tail -f /var/www/fmsv-dingden/backend-dev.log

# Frontend Logs (Entwicklung)
tail -f /var/www/fmsv-dingden/frontend-dev.log
```

### Neustart
```bash
# Mit Start-Script (Ctrl+C, dann neu starten)
./start-dev.sh

# Manuell
pkill -f "node.*server.js"
pkill -f "vite"
# Dann neu starten
```

### Production Build
```bash
cd /var/www/fmsv-dingden
npm run build

# Testen
npm run preview

# Oder Backend startet Frontend
cd backend
NODE_ENV=production npm start
# → http://localhost:3000
```

---

## 🎯 Standard-Workflow

### Täglich

```bash
# 1. Projekt öffnen
cd /var/www/fmsv-dingden

# 2. Aktualisieren (optional)
git pull

# 3. Development starten
./start-dev.sh

# 4. Browser öffnen
# http://localhost:5173

# 5. Entwickeln...

# 6. Stoppen
# Ctrl+C
```

### Vor Deployment

```bash
# 1. Testen
npm run build
npm run preview

# 2. Backend Test
cd backend
npm test  # Falls Tests vorhanden

# 3. Deployment
npm run deploy  # Falls vorhanden
# Oder manuell dist/ hochladen
```

---

## 📚 Weitere Hilfe

- **Integration-Probleme:** [FRONTEND-BACKEND-INTEGRATION.md](FRONTEND-BACKEND-INTEGRATION.md)
- **Backend-Probleme:** [Installation/BACKEND-DIAGNOSE.md](Installation/BACKEND-DIAGNOSE.md)
- **Installation:** [Installation/README.md](Installation/README.md)
- **API-Dokumentation:** [backend/API-Dokumentation.md](backend/API-Dokumentation.md)

---

## 🎉 Los geht's!

```bash
cd /var/www/fmsv-dingden
./start-dev.sh
```

**Happy Coding!** 🚀
