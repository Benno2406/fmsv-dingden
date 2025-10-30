# 🚀 Start Hier!

Willkommen beim FMSV Dingden Projekt!

---

## 🎯 Was möchtest du tun?

### A) Lokale Entwicklung (für Entwickler)

Setup auf deinem lokalen Rechner zum Entwickeln:

```bash
# 1. Repository klonen/herunterladen
git clone https://github.com/dein-username/fmsv-dingden.git
cd fmsv-dingden

# 2. Setup ausführen
# Windows:
setup-dev.bat

# Linux/macOS:
chmod +x setup-dev.sh
./setup-dev.sh
```

**Das wars!** Script installiert alles automatisch.

**Weiter:** [`DEV-SETUP.md`](DEV-SETUP.md)

---

### B) Server-Installation (für Produktion)

Deployment auf einem Debian Server:

```bash
# Auf dem Server
cd /var/www
git clone https://github.com/Benno2406/fmsv-dingden.git
cd fmsv-dingden/Installation/scripts
chmod +x install.sh
sudo ./install.sh
```

**Weiter:** [`Installation/README.md`](Installation/README.md)

---

## ⚡ Kurz-Anleitung (Entwicklung)

### 1. Repository klonen

```bash
git clone https://github.com/dein-username/fmsv-dingden.git
cd fmsv-dingden
```

### 2. Setup ausführen

**Windows:**
```cmd
setup-dev.bat
```

**Linux/macOS:**
```bash
chmod +x setup-dev.sh
./setup-dev.sh
```

**Was macht das Script?**
- ✅ Benennt `.txt` Dateien um
- ✅ Installiert Frontend Dependencies
- ✅ Installiert Backend Dependencies
- ✅ Erstellt `.env` Beispiel-Datei

### 3. Datenbank einrichten

```bash
# PostgreSQL installieren (falls noch nicht installiert)
# Windows: https://www.postgresql.org/download/windows/
# macOS: brew install postgresql@14
# Linux: sudo apt install postgresql

# Datenbank erstellen
sudo -u postgres createdb fmsv_dingden

# Backend .env anpassen (DB-Zugangsdaten eintragen)
nano backend/.env

# Datenbank initialisieren
cd backend
npm run init-db
npm run seed    # Optional: Beispiel-Daten
```

### 4. Server starten

**2 Terminals öffnen:**

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 5. Browser öffnen

```
http://localhost:5173
```

**Fertig!** 🎉

---

## 📚 Weiterführende Guides

| Für wen? | Anleitung |
|----------|-----------|
| **Entwickler** | [`DEV-SETUP.md`](DEV-SETUP.md) |
| **Server-Admin** | [`Installation/README.md`](Installation/README.md) |
| **GitHub Setup** | [`Installation/GitHub-QUICK-START.md`](Installation/GitHub-QUICK-START.md) |
| **Quick Commands** | [`QUICK-COMMANDS.md`](QUICK-COMMANDS.md) |

---

## 📚 Dokumentation

| Was suchst du? | Wo findest du es? |
|----------------|-------------------|
| **Projekt-Übersicht** | [`README.md`](README.md) |
| **Schnellstart** | Diese Datei oder [`QUICK-START.md`](QUICK-START.md) |
| **Installation** | [`Installation/README.md`](Installation/README.md) |
| **GitHub Setup** | [`Installation/GitHub-QUICK-START.md`](Installation/GitHub-QUICK-START.md) |
| **Dateien umbenennen** | [`Installation/DATEIEN-UMBENENNEN.md`](Installation/DATEIEN-UMBENENNEN.md) |
| **.gitignore Erklärung** | [`Installation/GITIGNORE-ERKLAERUNG.md`](Installation/GITIGNORE-ERKLAERUNG.md) |
| **Projekt-Struktur** | [`PROJEKT-STRUKTUR.md`](PROJEKT-STRUKTUR.md) |
| **Backend API** | [`backend/API-Dokumentation.md`](backend/API-Dokumentation.md) |

---

## ✅ Checkliste

Vor dem Start:

- [ ] `rename-files.bat` / `rename-files.sh` ausgeführt
- [ ] `.gitignore` existiert (ohne .txt)
- [ ] `Saves/.gitkeep` existiert (ohne .txt)
- [ ] `Logs/.gitkeep` existiert (ohne .txt)
- [ ] `Logs/Audit/.gitkeep` existiert (ohne .txt)
- [ ] Code zu Git committed
- [ ] GitHub Repository erstellt
- [ ] Code zu GitHub gepusht

Dann bereit für Server-Installation! 🚀

---

## 🆘 Häufige Fragen

### Warum .txt Dateien?

Dateien die mit `.` beginnen können in der Entwicklungsumgebung nicht erstellt werden. Deshalb liegen sie als `.txt` vor und müssen umbenannt werden.

### Warum .gitkeep?

Git speichert keine leeren Ordner. Mit `.gitkeep` Dateien bleiben die Ordner erhalten:

```
Saves/        ← Für File-Uploads
Logs/         ← Für Application-Logs
Logs/Audit/   ← Für Audit-Logs
```

### Warum .gitignore?

Schützt sensible Daten vor versehentlichem Commit:

```
.env           ← API-Keys, Passwörter
Saves/*        ← User-Uploads
Logs/*.log     ← Log-Dateien
node_modules/  ← Dependencies
```

### Muss ich das manuell machen?

Nein! Nutze die Scripts:

```bash
# Windows
rename-files.bat

# Linux/macOS
./rename-files.sh
```

---

## 🔧 Technologie

### Frontend
- React 18 + TypeScript
- Tailwind CSS 4.0
- Shadcn/ui Components
- Vite Build Tool

### Backend
- Node.js 20+ LTS
- Express.js
- PostgreSQL 14+
- JWT + 2FA

### Server
- Debian 13
- GitHub Auto-Update
- Cloudflare Tunnel
- PM2 Process Manager

---

## 📞 Support

Bei Problemen siehe:

1. **Troubleshooting:** [`Installation/README.md`](Installation/README.md) - Abschnitt "🆘 Probleme?"
2. **Installation Details:** [`Installation/Anleitung/Installation.md`](Installation/Anleitung/Installation.md)
3. **GitHub Issues:** (erstelle ein Issue im Repository)

---

**Viel Erfolg!** 🚀
