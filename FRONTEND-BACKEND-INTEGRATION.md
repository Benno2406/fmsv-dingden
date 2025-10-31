# Frontend-Backend-Integration - Problemlösung

## 🎯 Aktuelles Setup

Dein Projekt hat eine **moderne, getrennte Architektur**:

```
┌─────────────────┐         ┌──────────────────┐
│   Frontend      │  API    │    Backend       │
│   React/Vite    │ ──────► │  Node.js/Express │
│   Port 5173     │  /api   │    Port 3000     │
└─────────────────┘         └──────────────────┘
```

**Das ist KORREKT und moderne Best Practice!**

---

## 🚀 Wie du das System startest

### Development Mode (Empfohlen für Entwicklung)

#### Option 1: Beide separat starten

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

Frontend öffnet sich automatisch im Browser auf `http://localhost:5173`

#### Option 2: Beide zusammen starten (mit npm-run-all)

Installiere zuerst `npm-run-all`:
```bash
npm install --save-dev npm-run-all
```

Dann aktualisiere `package.json`:
```json
{
  "scripts": {
    "dev:full": "npm-run-all --parallel dev backend:dev"
  }
}
```

Jetzt kannst du beides starten mit:
```bash
npm run dev:full
```

### Production Mode (Für Server-Deployment)

#### Schritt 1: Frontend bauen
```bash
cd /var/www/fmsv-dingden
npm run build
```

Dies erstellt eine `dist/` Ordner mit optimierten Dateien.

#### Schritt 2: Backend konfigurieren zum Servieren des Frontends

**Methode A: Backend serviert Frontend (Einfach)**

Bearbeite `/backend/server.js`:

```javascript
// NACH allen API-Routes, VOR dem 404 Handler:

// Serve Frontend in Production
if (process.env.NODE_ENV === 'production') {
  // Serve static files
  app.use(express.static(path.join(__dirname, '..', 'dist')));
  
  // Handle React Router (SPA)
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
  });
}
```

Dann Backend starten:
```bash
cd /var/www/fmsv-dingden/backend
NODE_ENV=production npm start
```

Frontend ist jetzt auf `http://localhost:3000` erreichbar! ✅

**Methode B: Nginx als Reverse Proxy (Professionell)**

Dies ist bereits im `install.sh` implementiert! Nginx:
- Serviert statische Frontend-Dateien von `/dist`
- Proxied API-Requests zu Backend auf Port 3000

Nginx Config (automatisch erstellt):
```nginx
server {
    listen 80;
    server_name fmsv.bartholmes.eu;
    
    # Frontend
    root /var/www/fmsv-dingden/dist;
    index index.html;
    
    # API Proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # SPA Fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## ❌ Häufige Probleme & Lösungen

### Problem 1: "Backend nicht erreichbar"

**Symptome:**
- Login funktioniert nicht
- API-Requests schlagen fehl
- Console zeigt: `ERR_CONNECTION_REFUSED`

**Lösung:**
```bash
# 1. Prüfe ob Backend läuft
cd /var/www/fmsv-dingden/backend
npm start

# 2. Teste Backend direkt
curl http://localhost:3000/api/health

# Sollte zurückgeben:
# {"status":"ok","timestamp":"...","uptime":...}

# 3. Wenn nicht, prüfe Logs
tail -f /var/www/fmsv-dingden/Logs/*.log
```

**Häufige Ursachen:**
- ✅ Backend nicht gestartet
- ✅ Port 3000 bereits belegt
- ✅ Datenbank nicht erreichbar
- ✅ `.env` fehlt oder fehlerhaft

### Problem 2: "CORS Error"

**Symptome:**
```
Access to XMLHttpRequest at 'http://localhost:3000/api/...' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Lösung:**

Backend `.env` prüfen:
```bash
cd /var/www/fmsv-dingden/backend
cat .env | grep BASE_URL
```

Sollte enthalten:
```env
# Development
BASE_URL=http://localhost:5173

# Production
# BASE_URL=https://fmsv.bartholmes.eu
```

Oder in `server.js` anpassen (bereits korrekt):
```javascript
app.use(cors({
  origin: process.env.BASE_URL || 'http://localhost:5173',
  credentials: true
}));
```

### Problem 3: "API URL nicht korrekt"

**Symptome:**
- Requests gehen an falsche URL
- 404 Fehler bei API-Calls

**Lösung:**

Erstelle `.env` im **Frontend-Root** (nicht backend!):
```bash
cd /var/www/fmsv-dingden
nano .env
```

Inhalt:
```env
# Development
VITE_API_URL=http://localhost:3000/api

# Production (wird beim Build verwendet)
# VITE_API_URL=/api
```

**WICHTIG:** Vite muss nach `.env` Änderungen neu gestartet werden!

```bash
# Stoppen: Ctrl+C
npm run dev  # Neu starten
```

### Problem 4: "Frontend zeigt nur leere Seite"

**Symptome:**
- Browser zeigt weiße Seite
- Console zeigt Fehler

**Lösung:**

```bash
# 1. Prüfe ob Vite läuft
ps aux | grep vite

# 2. Prüfe Browser Console (F12)
# Schaue nach JavaScript-Fehlern

# 3. Prüfe Vite-Output im Terminal
# Sollte zeigen:
#   VITE v5.x.x  ready in xxx ms
#   ➜  Local:   http://localhost:5173/
#   ➜  Network: use --host to expose

# 4. Rebuild
npm run build
npm run preview  # Teste Production Build
```

### Problem 5: "Nach Production Build funktioniert nichts"

**Symptome:**
- Development funktioniert
- Production Build zeigt Fehler

**Lösung:**

```bash
# 1. Build mit Verbose Output
npm run build

# 2. Prüfe dist/ Ordner
ls -la dist/

# Sollte enthalten:
# - index.html
# - assets/
# - vite.svg (optional)

# 3. API URL für Production setzen
# In .env:
VITE_API_URL=/api  # Relative URL!

# 4. Rebuild
npm run build

# 5. Teste mit Preview
npm run preview
```

**API Client Fix:**

In `/lib/api-client.ts` prüfen:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
```

Für Production sollte es `/api` sein (relative URL), nicht `http://localhost:3000/api`!

---

## 🔧 Entwicklungs-Workflow

### Typischer Workflow

```bash
# 1. Morgens: Beide Systeme starten
cd /var/www/fmsv-dingden/backend && npm run dev &
cd /var/www/fmsv-dingden && npm run dev

# 2. Entwickeln
# - Frontend: Änderungen in .tsx Dateien → Auto-Reload
# - Backend: Änderungen in .js Dateien → Nodemon Auto-Restart

# 3. Testen
# - Frontend: http://localhost:5173
# - Backend API: http://localhost:3000/api/health

# 4. Production Build testen
npm run build
npm run preview

# 5. Deployment
npm run build
# Dann dist/ auf Server hochladen
```

### Debug-Modus

**Backend:**
```bash
cd /var/www/fmsv-dingden/backend
DEBUG=* npm run dev
```

**Frontend:**
Browser Console öffnen (F12) und Network Tab beobachten

---

## 📝 Nützliche Commands

### Status prüfen

```bash
# Backend läuft?
curl http://localhost:3000/api/health

# Frontend läuft?
curl http://localhost:5173

# Beide Prozesse finden
ps aux | grep -E "(node|vite)"

# Ports prüfen
netstat -tulpn | grep -E "(3000|5173)"
```

### Neu starten

```bash
# Backend neu starten
cd /var/www/fmsv-dingden/backend
pkill -f "node.*server.js"  # Alten Prozess killen
npm start

# Frontend neu starten
# Ctrl+C im Terminal, dann:
npm run dev
```

### Logs ansehen

```bash
# Backend Logs (wenn als Service läuft)
journalctl -u fmsv-backend -f

# Backend Logs (Datei)
tail -f /var/www/fmsv-dingden/Logs/*.log

# Frontend Logs
# Direkt im Terminal wo `npm run dev` läuft
```

---

## 🎯 Empfohlene Konfiguration

### Für lokale Entwicklung

**Backend `.env`:**
```env
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=5432
DB_NAME=fmsv_dingden
DB_USER=fmsv_user
DB_PASSWORD=dein_passwort

JWT_SECRET=dein_geheimer_key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:3000/api
```

### Für Production (Server)

**Backend `.env`:**
```env
NODE_ENV=production
PORT=3000
BASE_URL=https://fmsv.bartholmes.eu

DB_HOST=localhost
DB_PORT=5432
DB_NAME=fmsv_dingden
DB_USER=fmsv_user
DB_PASSWORD=SICHERES_PASSWORT

JWT_SECRET=SEHR_SICHERER_SECRET_KEY
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

**Frontend `.env.production`:**
```env
VITE_API_URL=/api
```

Dann bauen mit:
```bash
npm run build  # Verwendet automatisch .env.production
```

---

## 🚀 Quick Start Script

Erstelle `/start-dev.sh`:

```bash
#!/bin/bash

echo "🚀 Starting FMSV Development Environment..."

# Backend starten
cd /var/www/fmsv-dingden/backend
echo "📦 Starting Backend..."
npm run dev &
BACKEND_PID=$!

# Warte kurz
sleep 2

# Frontend starten
cd /var/www/fmsv-dingden
echo "🎨 Starting Frontend..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Development servers started!"
echo "   Backend:  http://localhost:3000"
echo "   Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"

# Warte auf Strg+C
wait
```

Dann:
```bash
chmod +x /var/www/fmsv-dingden/start-dev.sh
./start-dev.sh
```

---

## 📚 Zusammenfassung

**Development:**
- Backend: Port 3000
- Frontend: Port 5173
- API Proxy: Vite proxied `/api` zu Backend

**Production:**
- Alles auf Port 80/443 via Nginx
- Backend: Port 3000 (intern)
- Frontend: Statische Dateien aus `dist/`
- API: Nginx proxied `/api` zu Backend

**Das System ist RICHTIG so!** Es ist nicht "im Backend implementiert" sondern getrennt - das ist moderne Best Practice! 🎉
