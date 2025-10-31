# 🔧 FMSV Dingden - Development Setup

**Dieser Ordner ist NUR für lokale Entwicklung!**

Für Server-Deployment → siehe [../Installation/README.md](../Installation/README.md)

---

## 🎯 Quick Start

### Voraussetzungen

- **Node.js 20+** LTS
- **PostgreSQL 14+** (oder Docker)
- **Git**
- **Code Editor** (VS Code empfohlen)

### In 3 Schritten starten

```bash
# 1. Repository klonen (falls noch nicht geschehen)
git clone https://github.com/Achim-Sommer/fmsv-dingden.git
cd fmsv-dingden

# 2. Development Setup
cd dev
chmod +x setup.sh start.sh
./setup.sh

# 3. Development Server starten
./start.sh
```

**Fertig!** 🎉
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- API: http://localhost:3000/api/health

---

## 📋 Detaillierte Anleitung

### 1. Dependencies installieren

```bash
# Im Projekt-Root:
cd ..

# Frontend Dependencies
npm install

# Backend Dependencies
cd backend
npm install
cd ..
```

### 2. Datenbank einrichten

#### Option A: Lokales PostgreSQL

```bash
# PostgreSQL installieren (falls nicht vorhanden)
# Ubuntu/Debian:
sudo apt-get install postgresql postgresql-contrib

# macOS:
brew install postgresql@14
brew services start postgresql@14

# Windows:
# PostgreSQL Installer von postgresql.org

# Datenbank erstellen
sudo -u postgres psql

# In psql:
CREATE DATABASE fmsv_dev;
CREATE USER fmsv_dev_user WITH PASSWORD 'dev123';
GRANT ALL PRIVILEGES ON DATABASE fmsv_dev TO fmsv_dev_user;
\q
```

#### Option B: Docker (einfacher!)

```bash
cd dev

# Docker Compose starten
docker-compose up -d

# Prüfen
docker-compose ps
```

Die `docker-compose.yml` erstellt automatisch:
- PostgreSQL auf Port 5432
- pgAdmin auf Port 8080
- Volume für Daten-Persistenz

### 3. Environment Variables konfigurieren

```bash
cd dev

# Frontend .env erstellen
cp .env.frontend.example ../.env
# Bearbeiten falls nötig (meistens nicht)

# Backend .env erstellen
cp .env.backend.example ../backend/.env
# Bearbeiten falls nötig (DB-Zugangsdaten)
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:3000/api
```

**Backend `backend/.env`:**
```env
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:5173

# Datenbank (lokal)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fmsv_dev
DB_USER=fmsv_dev_user
DB_PASSWORD=dev123

# JWT Secrets (nur für Development!)
JWT_SECRET=dev-secret-key-not-for-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# SMTP (optional, für E-Mail-Tests)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-user
SMTP_PASSWORD=your-mailtrap-password
```

### 4. Datenbank initialisieren

```bash
cd ../backend

# Schema + Tabellen erstellen
npm run init-db

# Test-Daten einfügen (optional)
npm run seed
```

Dies erstellt:
- Alle Tabellen
- RBAC-System (Roles & Permissions)
- Test-User (siehe unten)

**Test-Accounts:**
```
Superadmin:
  E-Mail: dev@admin
  Passwort: (egal, Offline-Mode)

Admin:
  E-Mail: dev@vorstand  
  Passwort: (egal, Offline-Mode)

Member:
  E-Mail: dev@member
  Passwort: (egal, Offline-Mode)
```

---

## 🚀 Development Server starten

### Option 1: Start-Script (empfohlen)

```bash
cd dev
./start.sh
```

Das Script:
- Prüft Dependencies
- Prüft Datenbank
- Startet Backend
- Startet Frontend
- Öffnet Browser
- Zeigt Logs

**Stoppen:** `Ctrl+C`

### Option 2: Manuell (2 Terminals)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Option 3: VS Code Tasks

Wenn du VS Code verwendest, drücke:
- `Cmd/Ctrl + Shift + B` → "Start Development Servers"

Siehe [.vscode/tasks.json](../.vscode/tasks.json)

---

## 🔧 Development Tools

### Hot Reload

- **Frontend:** Vite Hot Module Replacement (sofort)
- **Backend:** Nodemon (automatischer Restart)

Änderungen werden automatisch übernommen!

### Offline-Entwicklung

Das Frontend hat einen **Offline-Modus**:
- Bei Login mit E-Mail die mit `dev@` beginnt
- Keine Backend-Verbindung nötig
- Test-Daten im Frontend

Beispiel: `dev@admin` → Login ohne Backend!

### Debug-Mode

**Backend:**
```bash
cd backend
DEBUG=* npm run dev
```

**Frontend:**
Browser Console (F12) zeigt alle API-Calls

### API-Testing

```bash
# Health Check
curl http://localhost:3000/api/health

# Mit jq (pretty print)
curl http://localhost:3000/api/health | jq

# Login testen
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

Oder verwende **Postman/Insomnia** für komfortables API-Testing.

### Database Viewer

#### Option 1: pgAdmin (Docker)

```bash
cd dev
docker-compose up -d

# Öffne: http://localhost:8080
# Login:
#   Email: dev@pgadmin.local
#   Password: dev123

# Server verbinden:
#   Host: postgres (oder localhost)
#   Port: 5432
#   User: fmsv_dev_user
#   Password: dev123
```

#### Option 2: VS Code Extension

Installiere: "PostgreSQL" by Chris Kolkman

### Logs ansehen

**Backend Logs:**
```bash
cd dev
tail -f ../backend-dev.log
```

**Frontend Logs:**
Terminal wo `npm run dev` läuft

**Datenbank Logs:**
```bash
docker-compose logs -f postgres
```

---

## 🧪 Testing

### Unit Tests

```bash
# Alle Tests
npm run test

# Mit Coverage
npm run test:coverage

# Watch Mode
npm run test:watch
```

### E2E Tests

```bash
# Noch nicht implementiert
# TODO: Playwright/Cypress Setup
```

### Linting

```bash
# ESLint
npm run lint

# TypeScript Type Check
npx tsc --noEmit
```

---

## 📦 Build & Preview

### Production Build testen

```bash
# Frontend bauen
npm run build

# Build testen
npm run preview
# → http://localhost:4173
```

### Backend Production Mode

```bash
cd backend
NODE_ENV=production npm start
```

---

## 🗂️ Projekt-Struktur

```
fmsv-dingden/
├── dev/                     # 👈 DU BIST HIER
│   ├── README.md           # Diese Datei
│   ├── setup.sh            # Erstmal-Setup
│   ├── start.sh            # Dev-Server starten
│   ├── docker-compose.yml  # Lokale DB
│   ├── .env.frontend.example
│   └── .env.backend.example
│
├── backend/                 # Backend-Code
│   ├── server.js           # Express Server
│   ├── routes/             # API Routes
│   ├── middleware/         # Auth, RBAC, etc.
│   └── database/           # SQL Schema
│
├── pages/                   # Frontend Pages
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   └── admin/              # Admin-Bereich
│
├── components/              # React Components
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── ui/                 # Shadcn Components
│
├── lib/                     # Utilities
│   ├── api-client.ts       # Axios Client
│   └── api/                # API Services
│
└── Installation/            # Production (NICHT für Dev!)
    └── scripts/
        └── install.sh      # Server-Installation
```

---

## 🆘 Troubleshooting

### Port bereits belegt

**Problem:** `Port 3000 is already in use`

**Lösung:**
```bash
# Prozess finden
lsof -ti:3000

# Prozess beenden
kill -9 $(lsof -ti:3000)

# Oder anderen Port verwenden
PORT=3001 npm run dev
```

### Datenbank-Verbindung fehlgeschlagen

**Problem:** `ECONNREFUSED 127.0.0.1:5432`

**Lösung:**
```bash
# PostgreSQL läuft?
# macOS:
brew services list | grep postgres

# Linux:
sudo systemctl status postgresql

# Docker:
docker-compose ps

# Docker neu starten:
docker-compose restart postgres
```

### Frontend kann Backend nicht erreichen

**Problem:** API-Calls schlagen fehl

**Lösung:**
```bash
# 1. Backend läuft?
curl http://localhost:3000/api/health

# 2. Frontend .env korrekt?
cat ../.env | grep VITE_API_URL
# Sollte sein: VITE_API_URL=http://localhost:3000/api

# 3. Vite neu starten (nach .env Änderung)
# Ctrl+C, dann:
npm run dev
```

### "Cannot find module"

**Problem:** Module nicht gefunden

**Lösung:**
```bash
# Dependencies neu installieren
rm -rf node_modules package-lock.json
npm install

# Backend auch:
cd backend
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

**Problem:** TS-Fehler im Editor

**Lösung:**
```bash
# VS Code: TypeScript Server neu starten
# Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"

# Type Checking manuell
npx tsc --noEmit
```

---

## 🎨 Code Style

### Prettier (Auto-Format)

```bash
# Formatieren
npm run format

# Check (ohne Änderung)
npm run format:check
```

### ESLint (Code Quality)

```bash
# Prüfen
npm run lint

# Auto-Fix
npm run lint:fix
```

### VS Code Settings

Empfohlene Extensions:
- ESLint
- Prettier
- TypeScript Vue Plugin
- Tailwind CSS IntelliSense
- PostgreSQL

Siehe [../.vscode/extensions.json](../.vscode/extensions.json)

---

## 📚 Weitere Dokumentation

- [SCHNELLSTART.md](SCHNELLSTART.md) - Quick Reference
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Häufige Probleme
- [CONTRIBUTING.md](../docs/CONTRIBUTING.md) - Contribution Guide
- [API.md](../docs/API.md) - API-Dokumentation
- [../backend/README.md](../backend/README.md) - Backend-Details

---

## 🚀 Workflow-Tipps

### Typischer Arbeitstag

```bash
# Morgens
cd dev
./start.sh                # Startet alles

# Entwickeln...
# - Code ändern
# - Browser automatisch neu laden
# - Logs im Terminal beobachten

# Vor Commit
npm run lint              # Code prüfen
npm run test              # Tests laufen lassen
git add .
git commit -m "feat: neue Funktion"

# Abends
# Ctrl+C                  # Stoppt Server
docker-compose down       # Stoppt DB (optional)
```

### Branches

```bash
# Neues Feature
git checkout -b feature/mein-feature

# Nach Fertigstellung
git push origin feature/mein-feature
# → Pull Request auf GitHub erstellen
```

### Database Migrations

Bei Änderungen am Datenbankschema:

```bash
# 1. SQL-Datei erstellen
cd backend/database/migrations
nano 001_meine_aenderung.sql

# 2. Migration anwenden
npm run migrate

# 3. Seeds anpassen (falls nötig)
nano database/seeds/dev-data.sql
npm run seed
```

---

## 🎯 Zusammenfassung

**Start Development:**
```bash
cd dev && ./start.sh
```

**URLs:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- pgAdmin: http://localhost:8080 (Docker)

**Stoppen:**
- `Ctrl+C`

**Bei Problemen:**
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- [GitHub Issues](https://github.com/Achim-Sommer/fmsv-dingden/issues)

**Viel Erfolg beim Entwickeln!** 🚀
