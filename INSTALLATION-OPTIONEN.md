# FMSV Dingden - Installations-Optionen

Übersicht über alle Installations-Möglichkeiten.

---

## 🎯 Wähle deine Option

| Option | Für wen? | Zeit | Anleitung |
|--------|----------|------|-----------|
| **1. Lokale Entwicklung (Auto)** | Entwickler | 5 Min | [Siehe unten](#1-lokale-entwicklung-automatisch) |
| **2. Lokale Entwicklung (Manuell)** | Erfahrene Devs | 10 Min | [`DEV-SETUP.md`](DEV-SETUP.md) |
| **3. Server-Installation (Auto)** | Produktion | 10 Min | [Siehe unten](#3-server-installation-automatisch) |
| **4. Server-Installation (Manuell)** | Server-Admins | 30 Min | [`Installation/README.md`](Installation/README.md) |

---

## 1. Lokale Entwicklung (Automatisch)

**Für:** Entwickler, die schnell loslegen wollen

### Schritt 1: Repository klonen

```bash
git clone https://github.com/dein-username/fmsv-dingden.git
cd fmsv-dingden
```

### Schritt 2: Setup-Script ausführen

**Windows:**
```cmd
setup-dev.bat
```

**Linux/macOS:**
```bash
chmod +x setup-dev.sh
./setup-dev.sh
```

**Das Script:**
- ✅ Benennt `.txt` Dateien um
- ✅ Installiert Frontend Dependencies
- ✅ Installiert Backend Dependencies  
- ✅ Erstellt `backend/.env` Beispiel-Datei

### Schritt 3: PostgreSQL einrichten

```bash
# PostgreSQL installieren (falls noch nicht vorhanden)
# Windows: https://www.postgresql.org/download/windows/
# macOS: brew install postgresql@14
# Linux: sudo apt install postgresql

# Datenbank erstellen
sudo -u postgres createdb fmsv_dingden

# Backend .env anpassen
nano backend/.env
# DB_PASSWORD und JWT_SECRET ändern!

# Datenbank initialisieren
cd backend
npm run init-db
npm run seed  # Optional: Beispiel-Daten
```

### Schritt 4: Server starten

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Schritt 5: Browser öffnen

```
http://localhost:5173
```

**Login (mit Seed-Daten):**
- Admin: `admin@fmsv-dingden.de` / `Admin123!`
- Member: `member@fmsv-dingden.de` / `Member123!`

---

## 2. Lokale Entwicklung (Manuell)

**Für:** Erfahrene Entwickler, die jeden Schritt selbst machen wollen

**Vollständige Anleitung:** [`DEV-SETUP.md`](DEV-SETUP.md)

**Kurz:**
```bash
# 1. Klonen
git clone https://github.com/dein-username/fmsv-dingden.git
cd fmsv-dingden

# 2. Dateien umbenennen
./rename-files.sh  # oder .bat

# 3. Frontend
npm install

# 4. Backend
cd backend
npm install
cp env.example.txt .env
nano .env  # Anpassen!

# 5. Datenbank
npm run init-db
npm run seed

# 6. Starten
npm run dev  # Backend
# Neues Terminal:
npm run dev  # Frontend (im Root)
```

---

## 3. Server-Installation (Automatisch)

**Für:** Produktion auf Debian Server

### Voraussetzungen

- Debian 13 (Bookworm) Server
- Root-Zugriff (sudo)
- GitHub Personal Access Token

### Installation

```bash
# Auf dem Server (SSH)
ssh user@server-ip

# Repository klonen
cd /var/www
sudo git clone https://github.com/dein-username/fmsv-dingden.git
cd fmsv-dingden

# Dateien umbenennen (WICHTIG!)
sudo chmod +x rename-files.sh
sudo ./rename-files.sh

# Installation starten
cd Installation/scripts
sudo chmod +x install.sh
sudo ./install.sh
```

**Das Script installiert:**
- ✅ PostgreSQL
- ✅ Node.js 20 LTS
- ✅ PM2 Process Manager
- ✅ Nginx Reverse Proxy
- ✅ Cloudflare Tunnel
- ✅ Auto-Update System
- ✅ SSL-Zertifikate (via Cloudflare)

**Nach Installation:**
- Website: `https://deine-domain.de`
- PM2 Status: `pm2 status`
- Logs: `tail -f /var/log/fmsv-auto-update.log`

---

## 4. Server-Installation (Manuell)

**Für:** Server-Admins, die volle Kontrolle wollen

**Vollständige Anleitung:** [`Installation/README.md`](Installation/README.md)

---

## 📋 Vergleich

| Feature | Lokale Dev (Auto) | Lokale Dev (Manuell) | Server (Auto) | Server (Manuell) |
|---------|-------------------|----------------------|---------------|------------------|
| **Zeit** | 5 Min | 10 Min | 10 Min | 30 Min |
| **Schwierigkeit** | ⭐ Einfach | ⭐⭐ Mittel | ⭐⭐ Mittel | ⭐⭐⭐ Schwer |
| **PostgreSQL** | Manuell | Manuell | ✅ Auto | Manuell |
| **Dependencies** | ✅ Auto | Manuell | ✅ Auto | Manuell |
| **.env Setup** | ✅ Auto | Manuell | ✅ Auto | Manuell |
| **Nginx** | ❌ | ❌ | ✅ Auto | Manuell |
| **PM2** | ❌ | ❌ | ✅ Auto | Manuell |
| **SSL** | ❌ | ❌ | ✅ Auto | Manuell |
| **Auto-Update** | ❌ | ❌ | ✅ Auto | Manuell |
| **Ideal für** | Entwicklung | Entwicklung | Produktion | Produktion |

---

## 🚀 Quick Start Commands

### Lokale Entwicklung

```bash
# Klonen
git clone https://github.com/dein-username/fmsv-dingden.git
cd fmsv-dingden

# Setup
./setup-dev.sh  # oder .bat

# Datenbank
sudo -u postgres createdb fmsv_dingden
cd backend && npm run init-db && npm run seed

# Starten
cd backend && npm run dev  # Terminal 1
npm run dev                 # Terminal 2 (im Root)

# Browser
http://localhost:5173
```

### Server-Installation

```bash
# Auf Server
cd /var/www
sudo git clone https://github.com/dein-username/fmsv-dingden.git
cd fmsv-dingden

# Setup
sudo ./rename-files.sh
cd Installation/scripts
sudo ./install.sh

# Status
pm2 status
systemctl status cloudflared
```

---

## 📚 Weitere Dokumentation

| Was? | Datei |
|------|-------|
| **Start-Guide** | [`START-HIER.md`](START-HIER.md) |
| **Dev-Setup (Lokal)** | [`DEV-SETUP.md`](DEV-SETUP.md) |
| **Server-Setup** | [`Installation/README.md`](Installation/README.md) |
| **GitHub Setup** | [`Installation/GitHub-QUICK-START.md`](Installation/GitHub-QUICK-START.md) |
| **Quick Commands** | [`QUICK-COMMANDS.md`](QUICK-COMMANDS.md) |
| **Contributing** | [`CONTRIBUTING.md`](CONTRIBUTING.md) |
| **API Docs** | [`backend/API-Dokumentation.md`](backend/API-Dokumentation.md) |

---

## 🆘 Probleme?

### Lokale Entwicklung

**Port bereits belegt:**
```bash
# Port prüfen
lsof -i :3001  # Backend
lsof -i :5173  # Frontend

# Prozess beenden
kill -9 <PID>
```

**Datenbank-Verbindung:**
```bash
# PostgreSQL Status
sudo systemctl status postgresql

# Starten
sudo systemctl start postgresql
```

**Details:** [`DEV-SETUP.md`](DEV-SETUP.md) - Abschnitt "Troubleshooting"

### Server-Installation

**Installation fehlgeschlagen:**
```bash
# Logs ansehen
cat /var/log/fmsv-install.log

# Erneut versuchen
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./install.sh
```

**Details:** [`Installation/README.md`](Installation/README.md) - Abschnitt "🆘 Probleme?"

---

## ✅ Checkliste

### Vor jeder Installation

- [ ] Git installiert
- [ ] Node.js 20+ installiert
- [ ] PostgreSQL 14+ installiert (Lokal) oder Server mit sudo-Zugriff
- [ ] `.txt` Dateien umbenannt (`rename-files.sh` / `.bat`)
- [ ] GitHub Repository erstellt (falls benötigt)

### Nach Installation (Lokal)

- [ ] Frontend läuft: `http://localhost:5173`
- [ ] Backend läuft: `http://localhost:3001`
- [ ] Datenbank verbunden
- [ ] Login funktioniert
- [ ] API-Calls funktionieren

### Nach Installation (Server)

- [ ] Website erreichbar via Domain
- [ ] PM2 läuft: `pm2 status`
- [ ] Nginx läuft: `systemctl status nginx`
- [ ] PostgreSQL läuft: `systemctl status postgresql`
- [ ] Cloudflare Tunnel läuft: `systemctl status cloudflared`
- [ ] Auto-Update läuft: `systemctl status fmsv-auto-update.timer`
- [ ] Login funktioniert

---

**Wähle deine Option und los geht's!** 🎉
