# Entwicklungsumgebung Setup

Anleitung zum Einrichten der lokalen Entwicklungsumgebung für FMSV Dingden.

---

## 🚀 Quick Start (Automatisch)

### Windows
```cmd
setup-dev.bat
```

### Linux/macOS
```bash
chmod +x setup-dev.sh
./setup-dev.sh
```

Das Script installiert automatisch:
- ✅ Frontend Dependencies
- ✅ Backend Dependencies
- ✅ Erstellt `.env` Beispiel-Datei
- ✅ Benennt `.txt` Dateien um

**Dann weiter mit:** [Datenbank einrichten](#3-datenbank-einrichten)

---

## 📋 Voraussetzungen

### Software

| Software | Version | Download |
|----------|---------|----------|
| **Node.js** | 20.x LTS | https://nodejs.org |
| **PostgreSQL** | 14+ | https://www.postgresql.org/download/ |
| **Git** | Latest | https://git-scm.com/downloads |

**Optional:**
- **pgAdmin 4** (GUI für PostgreSQL)
- **VSCode** (empfohlener Editor)
- **Postman** (API-Testing)

### Ports

Stelle sicher, dass folgende Ports frei sind:

| Port | Service |
|------|---------|
| **3001** | Backend API |
| **5173** | Frontend (Vite) |
| **5432** | PostgreSQL |

---

## 📥 Installation (Schritt für Schritt)

### 1. Repository klonen

```bash
# HTTPS
git clone https://github.com/dein-username/fmsv-dingden.git
cd fmsv-dingden

# SSH (empfohlen für Entwickler)
git clone git@github.com:dein-username/fmsv-dingden.git
cd fmsv-dingden
```

---

### 2. Dependencies installieren

#### Automatisch (Empfohlen)

**Windows:**
```cmd
setup-dev.bat
```

**Linux/macOS:**
```bash
chmod +x setup-dev.sh
./setup-dev.sh
```

#### Manuell

**Dateien umbenennen:**
```bash
# Windows
rename-files.bat

# Linux/macOS
chmod +x rename-files.sh
./rename-files.sh
```

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd backend
npm install
cd ..
```

---

### 3. Datenbank einrichten

#### PostgreSQL installieren

**Windows:**
1. Installer von https://www.postgresql.org/download/windows/ herunterladen
2. Installation durchführen (Standard-Einstellungen OK)
3. Passwort für `postgres` User setzen

**macOS (Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Debian/Ubuntu):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Datenbank erstellen

**Methode 1: createdb Kommando**
```bash
# Als postgres User
sudo -u postgres createdb fmsv_dingden

# Eigener User
createdb fmsv_dingden
```

**Methode 2: psql**
```bash
# PostgreSQL CLI öffnen
sudo -u postgres psql

# In psql:
CREATE DATABASE fmsv_dingden;
CREATE USER fmsv_user WITH PASSWORD 'dein_sicheres_passwort';
GRANT ALL PRIVILEGES ON DATABASE fmsv_dingden TO fmsv_user;
\q
```

**Methode 3: pgAdmin GUI**
1. pgAdmin öffnen
2. Rechtsklick auf "Databases" → "Create" → "Database"
3. Name: `fmsv_dingden`
4. Owner: `postgres` (oder eigener User)
5. Save

---

### 4. Umgebungsvariablen konfigurieren

#### backend/.env erstellen

**Falls nicht vom Setup-Script erstellt:**

```bash
cd backend
cp .env.example .env   # Falls vorhanden
# ODER:
nano .env              # Neues File erstellen
```

**Inhalt (anpassen!):**

```env
# PostgreSQL Datenbank
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fmsv_dingden
DB_USER=fmsv_user
DB_PASSWORD=DEIN_SICHERES_PASSWORT

# Server
PORT=3001
NODE_ENV=development

# JWT (mindestens 32 Zeichen!)
JWT_SECRET=dein_sehr_langes_und_sicheres_jwt_secret_hier_mindestens_32_zeichen
JWT_EXPIRES_IN=24h

# SMTP E-Mail (optional für Entwicklung)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=deine-email@gmail.com
SMTP_PASS=dein-app-passwort
SMTP_FROM=noreply@fmsv-dingden.de

# Uploads
UPLOAD_DIR=../Saves
MAX_FILE_SIZE_MB_MEMBER=5
MAX_FILE_SIZE_MB_ADMIN=50

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3001
```

#### JWT Secret generieren

**Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**OpenSSL:**
```bash
openssl rand -hex 32
```

**Online:**
https://generate-secret.vercel.app/32

---

### 5. Datenbank initialisieren

```bash
cd backend

# Schema erstellen (Tabellen, Indizes, etc.)
npm run init-db

# Beispiel-Daten laden (optional)
npm run seed
```

**Output sollte sein:**
```
[INFO] Verbinde mit Datenbank...
[OK] Datenbank verbunden
[INFO] Erstelle Tabellen...
[OK] Tabellen erstellt
[INFO] Erstelle Indizes...
[OK] Indizes erstellt
[OK] Datenbank erfolgreich initialisiert!
```

---

### 6. Entwicklungsserver starten

Du benötigst **2 Terminals** (oder Terminal-Tabs):

#### Terminal 1: Backend

```bash
cd backend
npm run dev
```

**Output:**
```
[INFO] Server läuft auf Port 3001
[INFO] Datenbank verbunden
[INFO] CORS aktiviert für: http://localhost:5173
```

#### Terminal 2: Frontend

```bash
npm run dev
```

**Output:**
```
  VITE v5.1.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

#### Browser öffnen

http://localhost:5173

---

## ✅ Funktionstest

### 1. Backend API testen

**Browser:**
```
http://localhost:3001/api/health
```

**Sollte zurückgeben:**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-01-30T12:00:00.000Z"
}
```

**cURL:**
```bash
curl http://localhost:3001/api/health
```

**Postman:**
- GET Request zu `http://localhost:3001/api/health`
- Sollte Status 200 zurückgeben

### 2. Frontend testen

1. Browser öffnen: http://localhost:5173
2. Homepage sollte laden
3. Navigation testen
4. Login-Seite aufrufen: http://localhost:5173/login

### 3. Login testen (mit Seed-Daten)

Falls `npm run seed` ausgeführt wurde:

**Admin:**
- E-Mail: `admin@fmsv-dingden.de`
- Passwort: `Admin123!`

**Member:**
- E-Mail: `member@fmsv-dingden.de`
- Passwort: `Member123!`

---

## 🔧 Entwickler-Befehle

### Frontend

```bash
# Development Server
npm run dev

# Production Build
npm run build

# Preview Build
npm run preview

# Linting
npm run lint
```

### Backend

```bash
# Development (mit Auto-Reload)
cd backend
npm run dev

# Production
npm start

# Datenbank neu initialisieren
npm run init-db

# Beispiel-Daten laden
npm run seed
```

### Kombiniert

```bash
# Setup (Installation)
npm run setup

# Backend installieren
npm run backend:install

# Backend Dev-Server
npm run backend:dev

# Backend Production
npm run backend:start
```

---

## 📁 Projekt-Struktur

```
fmsv-dingden/
├── 🎨 Frontend (React)
│   ├── components/      # React Components
│   ├── pages/           # Page Components
│   ├── lib/             # API Services
│   ├── contexts/        # React Contexts
│   └── styles/          # Global Styles
│
├── 🔧 Backend (Node.js)
│   ├── routes/          # API Endpoints
│   ├── middleware/      # Express Middleware
│   ├── database/        # DB Schema
│   ├── utils/           # Helper Functions
│   └── scripts/         # DB Scripts
│
├── 📦 Data
│   ├── Saves/           # File Uploads (lokal)
│   └── Logs/            # Application Logs
│
└── 📚 Dokumentation
    ├── README.md
    ├── DEV-SETUP.md     # Diese Datei
    └── Installation/    # Server-Installation
```

---

## 🐛 Troubleshooting

### Port bereits belegt

**Fehler:**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Lösung:**

**Windows:**
```cmd
# Port-Nutzung prüfen
netstat -ano | findstr :3001

# Prozess beenden (PID aus obigem Befehl)
taskkill /PID <PID> /F
```

**Linux/macOS:**
```bash
# Port-Nutzung prüfen
lsof -i :3001

# Prozess beenden
kill -9 <PID>
```

### Datenbank-Verbindung fehlgeschlagen

**Fehler:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Lösung:**

1. **PostgreSQL läuft?**
   ```bash
   # Status prüfen
   sudo systemctl status postgresql   # Linux
   brew services list                  # macOS
   # Windows: Services → PostgreSQL
   ```

2. **Starten:**
   ```bash
   sudo systemctl start postgresql    # Linux
   brew services start postgresql@14  # macOS
   # Windows: Services → PostgreSQL → Start
   ```

3. **Zugangsdaten korrekt?**
   - `backend/.env` prüfen
   - DB_HOST, DB_PORT, DB_USER, DB_PASSWORD

4. **Datenbank existiert?**
   ```bash
   sudo -u postgres psql -l | grep fmsv_dingden
   ```

### npm install schlägt fehl

**Fehler:**
```
npm ERR! code EACCES
```

**Lösung:**

1. **Ohne sudo ausführen**
   ```bash
   npm config set prefix ~/.npm-global
   export PATH=~/.npm-global/bin:$PATH
   npm install
   ```

2. **Cache leeren**
   ```bash
   npm cache clean --force
   npm install
   ```

3. **node_modules löschen**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Frontend lädt nicht

**Fehler:** Weiße Seite oder Fehler in Console

**Lösung:**

1. **Browser-Cache leeren** (Strg+Shift+R / Cmd+Shift+R)

2. **Vite Cache löschen**
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

3. **API-URL prüfen**
   - In `lib/api-client.ts`
   - Sollte `http://localhost:3001` sein

### CORS Fehler

**Fehler in Browser Console:**
```
Access to fetch at 'http://localhost:3001/api/...' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Lösung:**

1. **Backend .env prüfen:**
   ```env
   FRONTEND_URL=http://localhost:5173
   ```

2. **Backend neu starten:**
   ```bash
   cd backend
   npm run dev
   ```

---

## 🧪 Testing

### API mit cURL

**Health Check:**
```bash
curl http://localhost:3001/api/health
```

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fmsv-dingden.de","password":"Admin123!"}'
```

**Mit JWT:**
```bash
TOKEN="dein-jwt-token"
curl http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer $TOKEN"
```

### API mit Postman

1. **Collection erstellen:** "FMSV Dingden API"
2. **Environment erstellen:**
   - Variable: `baseUrl` = `http://localhost:3001`
   - Variable: `token` = (leer, wird beim Login gesetzt)
3. **Requests erstellen:**
   - POST `{{baseUrl}}/api/auth/login`
   - GET `{{baseUrl}}/api/users/profile` (mit Bearer Token)

---

## 📚 Weitere Dokumentation

| Thema | Datei |
|-------|-------|
| **Backend API** | [`backend/API-Dokumentation.md`](backend/API-Dokumentation.md) |
| **Projekt-Struktur** | [`PROJEKT-STRUKTUR.md`](PROJEKT-STRUKTUR.md) |
| **Server-Installation** | [`Installation/README.md`](Installation/README.md) |
| **GitHub Setup** | [`Installation/GitHub-QUICK-START.md`](Installation/GitHub-QUICK-START.md) |
| **Quick Commands** | [`QUICK-COMMANDS.md`](QUICK-COMMANDS.md) |

---

## 💡 Entwickler-Tipps

### VSCode Extensions

Empfohlene Extensions:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "PostgreSQL.vscode-postgresql"
  ]
}
```

### Git Workflow

```bash
# Feature Branch erstellen
git checkout -b feature/mein-feature

# Änderungen committen
git add .
git commit -m "feat: Mein neues Feature"

# Pushen
git push origin feature/mein-feature

# Pull Request erstellen auf GitHub
```

### Hot Reload

- **Frontend:** Automatisch via Vite
- **Backend:** Automatisch via Nodemon (npm run dev)

### Debugging

**VSCode Launch Config** (`.vscode/launch.json`):

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Backend Debug",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/backend/server.js",
      "envFile": "${workspaceFolder}/backend/.env"
    }
  ]
}
```

---

## 🚀 Produktions-Build

```bash
# Frontend bauen
npm run build

# Output in: dist/

# Preview testen
npm run preview
```

**Dann:** Siehe [`Installation/README.md`](Installation/README.md) für Server-Deployment

---

**Viel Erfolg bei der Entwicklung!** 🎉
