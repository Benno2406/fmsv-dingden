# Entwicklung vs. Production - Klare Trennung

## 🎯 Überblick

Dieses Projekt unterstützt **zwei verschiedene Setups**:

1. **🔧 Development (Lokale Entwicklung)** - Für Entwickler
2. **🚀 Production (Server-Deployment)** - Für den Live-Betrieb

**WICHTIG:** Beide Setups sind komplett getrennt und sollten nicht vermischt werden!

---

## 🔧 Development Setup (Lokal)

### Für wen?
- Entwickler, die am Code arbeiten
- Lokales Testen neuer Features
- Frontend/Backend Development

### Wo läuft es?
- Auf deinem **lokalen Computer** (Windows, Mac, Linux)
- Port 5173 (Frontend) + Port 3000 (Backend)
- Datenbank lokal (PostgreSQL oder Docker)

### Wie starten?

#### Option 1: Manuell (empfohlen für Entwicklung)

**Terminal 1 - Backend:**
```bash
cd backend
npm install
cp env.example.txt .env
# .env bearbeiten (lokale DB-Zugangsdaten)
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm install
npm run dev
```

Frontend öffnet sich automatisch auf `http://localhost:5173`

#### Option 2: Docker Compose (einfacher)

```bash
# Kommt bald - Docker Compose Setup für lokale DB
docker-compose -f docker-compose.dev.yml up
```

### Verzeichnisstruktur (Development)

```
/
├── App.tsx              # Frontend-Code
├── backend/             # Backend-Code
├── package.json         # Frontend Dependencies
├── vite.config.ts       # Vite Dev-Server Config
│
└── dev/                 # 👈 DEVELOPMENT TOOLS
    ├── README.md        # Development-Anleitung
    ├── start-dev.sh     # Start-Script (verschoben hierher)
    ├── .env.example     # Frontend .env Beispiel
    ├── docker-compose.dev.yml  # Lokale DB
    └── backend/
        └── .env.example # Backend .env Beispiel
```

### Environment Variables (Development)

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:3000/api
```

**Backend `backend/.env`:**
```env
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=5432
DB_NAME=fmsv_dev
DB_USER=postgres
DB_PASSWORD=dev123
```

---

## 🚀 Production Setup (Server)

### Für wen?
- Server-Administratoren
- Deployment auf Linux-Server
- Live-Website für Benutzer

### Wo läuft es?
- Auf einem **Linux-Server** (Debian/Ubuntu)
- Port 80/443 (Nginx)
- PostgreSQL Server
- Systemd Services

### Wie installieren?

```bash
# Auf dem Linux-Server:
cd /tmp
git clone https://github.com/Achim-Sommer/fmsv-dingden.git
cd fmsv-dingden/Installation/scripts
chmod +x install.sh
sudo ./install.sh
```

Das Install-Script macht alles automatisch:
- Nginx Installation
- PostgreSQL Setup
- Backend als Systemd Service
- SSL-Zertifikate
- Firewall-Konfiguration

### Verzeichnisstruktur (Production)

```
/var/www/fmsv-dingden/
├── dist/                # Frontend (gebaut mit npm run build)
├── backend/             # Backend (läuft als Service)
│   ├── .env            # Production .env
│   └── server.js
├── Saves/               # Uploads
├── Logs/                # Log-Dateien
│
└── Installation/        # 👈 PRODUCTION TOOLS
    ├── README.md        # Server-Installations-Anleitung
    └── scripts/
        ├── install.sh   # Haupt-Installation
        ├── update.sh    # Updates
        ├── debug.sh     # Diagnose
        └── setup-pgadmin-nginx.sh
```

### Environment Variables (Production)

**Backend `/var/www/fmsv-dingden/backend/.env`:**
```env
NODE_ENV=production
PORT=3000
BASE_URL=https://fmsv.bartholmes.eu

DB_HOST=localhost
DB_PORT=5432
DB_NAME=fmsv_dingden
DB_USER=fmsv_user
DB_PASSWORD=SICHERES_PASSWORT
```

**Frontend:** Verwendet `/api` (relative URL, wird von Nginx proxied)

---

## 📊 Vergleich

| Aspekt | Development | Production |
|--------|-------------|------------|
| **Ort** | Lokaler PC | Linux-Server |
| **Frontend** | Vite Dev Server (Port 5173) | Nginx serviert `dist/` |
| **Backend** | `npm run dev` (Port 3000) | Systemd Service (Port 3000) |
| **Datenbank** | Lokal (Docker/PostgreSQL) | Server PostgreSQL |
| **Hot Reload** | ✅ Ja | ❌ Nein (Build erforderlich) |
| **HTTPS** | ❌ Nein (localhost) | ✅ Ja (Let's Encrypt) |
| **Logs** | Terminal/Console | Systemd Journal + Dateien |
| **Start** | `npm run dev` | `systemctl start` |
| **Monitoring** | Browser DevTools | Server-Monitoring-Tools |

---

## 🗂️ Neue Ordner-Struktur

### Vorher (verwirrend):
```
/
├── start-dev.sh              # ❓ Für wen?
├── SCHNELLSTART.md           # ❓ Dev oder Prod?
├── Installation/
│   ├── scripts/install.sh    # Production
│   └── README.md             # ❓ Für wen?
├── backend/
│   ├── diagnose.sh           # ❓ Für wen?
│   └── quick-start.sh        # ❓ Für wen?
```

### Nachher (klar):
```
/
├── README.md                 # 👈 HAUPTDOKUMENTATION (zeigt auf beide)
│
├── dev/                      # 👈 NUR DEVELOPMENT
│   ├── README.md             # Development-Anleitung
│   ├── SCHNELLSTART.md       # Development Quick-Start
│   ├── start.sh              # Start-Script (Frontend + Backend)
│   ├── docker-compose.yml    # Lokale DB
│   ├── .env.example          # Frontend .env Beispiel
│   └── backend/
│       └── .env.example      # Backend .env Beispiel
│
├── Installation/             # 👈 NUR PRODUCTION
│   ├── README.md             # Server-Installations-Anleitung
│   ├── SCHNELLSTART.md       # Production Quick-Start
│   └── scripts/
│       ├── install.sh        # Server-Installation
│       ├── update.sh         # Server-Updates
│       ├── debug.sh          # Server-Diagnose
│       └── backup.sh         # Backups
│
├── docs/                     # 👈 ALLGEMEINE DOKUMENTATION
│   ├── API.md                # API-Dokumentation
│   ├── ARCHITEKTUR.md        # System-Architektur
│   └── BEITRAGEN.md          # Contribution Guide
│
├── App.tsx                   # Frontend-Code
├── backend/                  # Backend-Code
└── package.json              # Dependencies
```

---

## 🚦 Workflow

### Development Workflow

```bash
# 1. Repository klonen
git clone https://github.com/Achim-Sommer/fmsv-dingden.git
cd fmsv-dingden

# 2. Development Setup
cd dev
./setup.sh              # Erstellt .env Dateien, startet DB

# 3. Development starten
./start.sh              # Startet Frontend + Backend

# 4. Entwickeln
# - Frontend: http://localhost:5173
# - Backend: http://localhost:3000
# - Änderungen werden automatisch neu geladen

# 5. Testen
npm run test

# 6. Build testen
npm run build
npm run preview
```

### Production Workflow

```bash
# 1. Auf Server einloggen
ssh user@fmsv.bartholmes.eu

# 2. Installation
cd /tmp
git clone https://github.com/Benno2406fmsv-dingden.git
cd fmsv-dingden/Installation/scripts
sudo ./install.sh

# 3. Nach Updates
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./update.sh

# 4. Bei Problemen
sudo ./debug.sh

# 5. Logs ansehen
sudo journalctl -u fmsv-backend -f
sudo tail -f /var/log/nginx/error.log
```

---

## ⚠️ Häufige Fehler (was NICHT zu tun)

### ❌ FALSCH: Production-Script auf Dev-System

```bash
# NICHT auf lokalem PC ausführen!
sudo ./Installation/scripts/install.sh  # ❌
# → Würde versuchen, Nginx, Systemd etc. zu installieren
```

### ❌ FALSCH: Dev-Script auf Production-Server

```bash
# NICHT auf Server ausführen!
./dev/start.sh  # ❌
# → Würde Vite Dev Server starten (langsam, unsicher)
```

### ❌ FALSCH: Production .env in Development

```bash
# NICHT lokale .env mit Production-Werten!
BASE_URL=https://fmsv.bartholmes.eu  # ❌
# → Frontend kann Backend nicht erreichen
```

### ✅ RICHTIG: Klare Trennung

**Auf lokalem PC:**
```bash
cd dev
./start.sh
```

**Auf Server:**
```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./install.sh
```

---

## 🔄 Migration (für bestehende Installationen)

### Wenn du bereits installiert hast:

**Lokale Entwicklung:**
```bash
# Alte Scripts entfernen
rm start-dev.sh
rm SCHNELLSTART.md  # (wird nach dev/ verschoben)

# Neue Struktur pullen
git pull origin main

# Development Setup
cd dev
./setup.sh
```

**Production Server:**
```bash
# Keine Änderung nötig!
# Installation/ bleibt gleich
cd /var/www/fmsv-dingden
git pull origin main
# Backend läuft weiter wie gewohnt
```

---

## 📚 Dokumentation

### Development
- [dev/README.md](dev/README.md) - Development Setup
- [dev/SCHNELLSTART.md](dev/SCHNELLSTART.md) - Quick Start für Entwickler
- [dev/TROUBLESHOOTING.md](dev/TROUBLESHOOTING.md) - Häufige Probleme

### Production
- [Installation/README.md](Installation/README.md) - Server-Installation
- [Installation/NACH-INSTALLATION.md](Installation/NACH-INSTALLATION.md) - Nach Installation
- [Installation/scripts/README.md](Installation/scripts/README.md) - Script-Übersicht

### Allgemein
- [docs/API.md](docs/API.md) - API-Dokumentation
- [docs/ARCHITEKTUR.md](docs/ARCHITEKTUR.md) - System-Architektur
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) - Deployment-Prozess

---

## 🎯 Zusammenfassung

**Entwickler:**
→ Gehe zu [dev/README.md](dev/README.md)
→ Verwende `dev/start.sh`
→ Frontend: Port 5173, Backend: Port 3000

**Server-Admin:**
→ Gehe zu [Installation/README.md](Installation/README.md)
→ Verwende `Installation/scripts/install.sh`
→ Nginx: Port 80/443, Backend: Systemd Service

**Beide nicht mischen!** 🚫

Die Trennung macht das System:
- ✅ Klarer und verständlicher
- ✅ Weniger fehleranfällig
- ✅ Einfacher zu warten
- ✅ Besser dokumentiert

---

## 🚀 Nächste Schritte

1. **Entscheide:** Willst du entwickeln oder deployen?
2. **Development:** Gehe zu `dev/`
3. **Production:** Gehe zu `Installation/`
4. **Folge der jeweiligen README**

Viel Erfolg! 🎉
