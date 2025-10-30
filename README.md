# FMSV Dingden - Vereinshomepage

Moderne Vereinshomepage für den Flugmodellsportverein Dingden mit integrierter Mitgliederverwaltung.

---

## ⚡ NEU HIER? → [`START-HIER.md`](START-HIER.md)

**Quick Start in 3 Schritten:**
1. `rename-files.bat` / `rename-files.sh` ausführen
2. Code zu GitHub pushen
3. Auf Server installieren

**Alle Details:** [`START-HIER.md`](START-HIER.md)

---

## 🚀 Features

### Frontend (React + TypeScript)
- ✅ Öffentliche Seiten (Home, Termine, Mitgliedschaft, Jugendarbeit, etc.)
- ✅ Mitgliederbereich mit Dokumenten, Flugbuch, Fotoalben
- ✅ Verwaltungsbereich für Vorstand/Webmaster
- ✅ Responsive Design (Desktop & Mobile)
- ✅ Dark/Light Mode
- ✅ Rich Text Editor für Artikel
- ✅ PDF/CSV Export (Flugbuch, Protokolle)
- ✅ Kiosk-Modus für Flugplatz-Display
- ✅ Cookie Consent

### Backend (Node.js + PostgreSQL)
- ✅ RESTful API mit Express.js
- ✅ JWT-Authentifizierung + 2FA (Authenticator App)
- ✅ PostgreSQL Datenbank
- ✅ Lokale Datei-Speicherung (`/Saves`)
- ✅ Audit Logging (Datenbank + Dateien)
- ✅ Rate Limiting & Security Headers
- ✅ SMTP E-Mail-Versand
- ✅ File Uploads (Bilder, PDFs)
- ✅ Rang-abhängige Upload-Größen (5MB Member, 50MB Admin)

## 📁 Projekt-Struktur

```
fmsv-dingden/
├── 📱 Frontend (React + TypeScript)
│   ├── pages/          # React Pages (public, member, admin)
│   ├── components/     # React Components + UI
│   ├── lib/            # API Services & Utils
│   └── contexts/       # Auth & Theme Context
│
├── 🔧 Backend (Node.js + Express)
│   └── backend/
│       ├── routes/     # API Endpoints
│       ├── middleware/ # Auth, Upload, etc.
│       └── database/   # PostgreSQL Schema
│
├── 📦 Installation
│   └── Installation/
│       ├── scripts/    # install.sh, update.sh
│       └── Anleitung/  # Dokumentation
│
└── 📚 Dokumentation
    ├── README.md       # Diese Datei
    ├── QUICK-START.md  # Schnellstart
    └── PROJEKT-STRUKTUR.md  # Detaillierte Struktur
```

**Detaillierte Übersicht:** [`PROJEKT-STRUKTUR.md`](PROJEKT-STRUKTUR.md)

## 🛠️ Technologie-Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Shadcn/ui
- **Icons**: Lucide React
- **Charts**: Recharts
- **Routing**: React Router
- **PDF Export**: jsPDF
- **Forms**: React Hook Form

### Backend
- **Runtime**: Node.js 20+ LTS
- **Framework**: Express.js
- **Datenbank**: PostgreSQL 14+
- **Authentifizierung**: JWT + 2FA (Speakeasy)
- **Validation**: Express-Validator
- **Security**: Helmet, bcrypt, CORS
- **Logging**: Winston
- **File Upload**: Multer

## 🚀 Schnellstart

### 📌 Zwei Installations-Optionen

#### Option 1: Lokale Entwicklung

Für Entwickler - Setup auf lokalem Rechner:

```bash
# Repository klonen
git clone https://github.com/Benno2406/fmsv-dingden.git
cd fmsv-dingden

# Automatisches Setup
# Windows:
setup-dev.bat

# Linux/macOS:
chmod +x setup-dev.sh
./setup-dev.sh
```

**Details:** [`DEV-SETUP.md`](DEV-SETUP.md)

#### Option 2: Server-Installation

Für Produktion - Deployment auf Debian Server:

```bash
cd /var/www
git clone https://github.com/dein-username/fmsv-dingden.git
cd fmsv-dingden/Installation/scripts
chmod +x install.sh
sudo ./install.sh
```

**Details:** [`Installation/README.md`](Installation/README.md)

---

### 1️⃣ Dateien vorbereiten (ZUERST!)

**Vor jeder Installation:**

```bash
# Windows
rename-files.bat

# Linux/macOS
chmod +x rename-files.sh
./rename-files.sh
```

Das Script benennt um:
- `gitignore.txt` → `.gitignore`
- `Saves/gitkeep.txt` → `Saves/.gitkeep`
- `Logs/gitkeep.txt` → `Logs/.gitkeep`
- `Logs/Audit/gitkeep.txt` → `Logs/Audit/.gitkeep`

---

### 2️⃣ GitHub Repository einrichten (Optional für Entwicklung)

Falls du das Projekt auf GitHub hostest:

```bash
git init
git add .
git commit -m "Initial commit - FMSV Dingden"
git remote add origin https://github.com/dein-username/fmsv-dingden.git
git push -u origin main
```

**5-Minuten Guide:** [`Installation/GitHub-QUICK-START.md`](Installation/GitHub-QUICK-START.md)

---

### 3️⃣ Installation durchführen

**Lokale Entwicklung:**
```bash
./setup-dev.sh   # oder setup-dev.bat
```
→ Siehe [`DEV-SETUP.md`](DEV-SETUP.md)

**Server-Produktion:**

**2. Server-Installation** (10-15 Minuten)

```bash
# Repository klonen
cd /var/www
git clone https://github.com/dein-username/fmsv-dingden.git
cd fmsv-dingden

# Installation starten (Debian 12/13)
cd Installation/scripts
chmod +x install.sh
sudo ./install.sh
```

**Das Script fragt interaktiv:**
- Update-Kanal (Stable/Testing)
- Cloudflare Tunnel (Ja/Nein)
- GitHub Repository URL
- Auto-Update (Täglich/Wöchentlich/Manuell)
- Datenbank-Konfiguration

**Dauer:** ~10-15 Minuten

**Beispiel-Ausgabe:** [`/Installation/BEISPIEL-AUSGABE.md`](Installation/BEISPIEL-AUSGABE.md)

## 🔄 Auto-Update System

Das System zieht automatisch Updates von GitHub:

1. **Prüft** ob neue Commits verfügbar sind
2. **Pulled** nur wenn Updates vorhanden
3. **Baut** Frontend & Backend neu
4. **Startet** Services neu

```
GitHub (main/testing)
        ↓
Server prüft (täglich/wöchentlich)
        ↓
Neue Commits? → Update
Keine Commits? → Nichts tun
```

**Details:** [`/Installation/Anleitung/Auto-Update-System.md`](Installation/Anleitung/Auto-Update-System.md)

## 🌿 Branch-Strategie

### main (Stable - Production)
- Nur getestete, stabile Features
- Production-Server pullen von hier
- Weniger Updates, maximale Stabilität

### testing (Testing - Development)
- Neueste Features und Entwicklungen
- Testing-Server pullen von hier
- Häufigere Updates

**Workflow:**
```
Entwickeln → Testing → Testen → Merge → Main → Production
```

## 📚 Dokumentation

### Schnellstart
- **5-Minuten Start:** [`QUICK-START.md`](QUICK-START.md)
- **GitHub Setup:** [`/Installation/GitHub-QUICK-START.md`](Installation/GitHub-QUICK-START.md)
- **Beispiel-Ausgabe:** [`/Installation/BEISPIEL-AUSGABE.md`](Installation/BEISPIEL-AUSGABE.md)

### Installation
- **Detaillierte Anleitung:** [`/Installation/Anleitung/Installation.md`](Installation/Anleitung/Installation.md)
- **E-Mail Setup:** [`/Installation/Anleitung/E-Mail-Setup.md`](Installation/Anleitung/E-Mail-Setup.md)
- **Cloudflare Tunnel:** [`/Installation/Anleitung/Cloudflare-Tunnel-Setup.md`](Installation/Anleitung/Cloudflare-Tunnel-Setup.md)
- **Auto-Update:** [`/Installation/Anleitung/Auto-Update-System.md`](Installation/Anleitung/Auto-Update-System.md)
- **GitHub Setup:** [`/Installation/Anleitung/GitHub-Setup.md`](Installation/Anleitung/GitHub-Setup.md)

### Backend
- **API Dokumentation:** [`/backend/API-Dokumentation.md`](backend/API-Dokumentation.md)
- **Backend README:** [`/backend/README.md`](backend/README.md)

### Referenz
- **Projekt-Struktur:** [`PROJEKT-STRUKTUR.md`](PROJEKT-STRUKTUR.md)
- **Quick Reference:** [`/Installation/QUICK-REFERENCE.md`](Installation/QUICK-REFERENCE.md)

## 🎯 Update-Workflow

### Neue Features entwickeln

```bash
# Lokal auf PC
cd /path/to/fmsv-dingden
git checkout testing

# Feature entwickeln...
nano App.tsx

# Committen & Pushen
git add .
git commit -m "Feature: XYZ"
git push origin testing
```

**Testing-Server** zieht automatisch und deployed das Feature.

### Nach erfolgreichem Test → Production

```bash
# Lokal auf PC
git checkout main
git merge testing
git push origin main
```

**Production-Server** zieht automatisch und deployed die neue Version.

## 🔒 Sicherheit

### Wichtige Regeln

- ❌ **NIEMALS** `.env` Dateien zu GitHub pushen
- ❌ **NIEMALS** `Saves/` Uploads zu GitHub pushen
- ❌ **NIEMALS** Datenbank-Passwörter in Code
- ✅ **IMMER** `.gitignore` prüfen
- ✅ **IMMER** Personal Access Token verwenden
- ✅ Testing vor Production

### Bereits geschützt (via .gitignore)

```
✅ .env Dateien
✅ node_modules/
✅ Saves/ (Uploads)
✅ Logs/
✅ Datenbank-Backups
```

## 📊 Services

### Status prüfen

```bash
# Backend
systemctl status fmsv-backend

# Nginx
systemctl status nginx

# Cloudflare Tunnel (falls aktiviert)
systemctl status cloudflared

# Auto-Update Timer
systemctl status fmsv-auto-update.timer
```

### Logs ansehen

```bash
# Backend
journalctl -u fmsv-backend -f

# Nginx
tail -f /var/log/nginx/error.log

# Auto-Update
tail -f /var/log/fmsv-auto-update.log
```

## 🛠️ Entwicklung

### Lokale Entwicklung

Siehe: [`QUICK-START.md`](QUICK-START.md) - Abschnitt "Lokale Entwicklung"

### Backend starten

```bash
cd backend
npm install
npm run dev
```

### Frontend starten

```bash
npm install
npm run dev
```

## 📝 Lizenz

Vereinsprojekt - Alle Rechte vorbehalten.

## 👥 Kontakt

**Flugmodellsportverein Dingden e.V.**

Bei Fragen zur Installation oder Verwendung siehe Dokumentation.

---

## ⚡ Quick Commands

```bash
# Installation
sudo ./Installation/scripts/install.sh

# Update durchführen
sudo ./Installation/scripts/update.sh

# Auto-Update Status
systemctl status fmsv-auto-update.timer

# Logs ansehen
tail -f /var/log/fmsv-auto-update.log

# Services neu starten
systemctl restart fmsv-backend
systemctl restart nginx
```

---

**Bereit zum Starten?** Folge dem [`QUICK-START.md`](QUICK-START.md)! 🚀
