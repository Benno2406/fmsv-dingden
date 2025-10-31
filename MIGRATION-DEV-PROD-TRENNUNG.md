# Migration: Development/Production Trennung

## 📋 Überblick

Die Projekt-Struktur wurde umorganisiert für klarere Trennung zwischen:
- **Development** (lokale Entwicklung) → `/dev/`
- **Production** (Server-Deployment) → `/Installation/`

---

## 🔄 Was hat sich geändert?

### Vorher (verwirrend)

```
/
├── start-dev.sh              # ❓ Für wen?
├── SCHNELLSTART.md           # ❓ Dev oder Prod?
├── FRONTEND-BACKEND-INTEGRATION.md
├── Installation/
│   ├── scripts/install.sh    # Production
│   └── README.md
├── backend/
│   ├── diagnose.sh           # ❓ Für wen?
│   └── quick-start.sh        # ❓ Für wen?
```

**Problem:** Unklare Trennung führte zu Verwirrung!

### Nachher (klar)

```
/
├── README.md                 # 👈 Hauptdoku (zeigt auf beide)
├── ENTWICKLUNG-VS-PRODUCTION.md  # Erklärt Unterschiede
│
├── dev/                      # 👈 NUR DEVELOPMENT
│   ├── README.md             # Development-Anleitung
│   ├── SCHNELLSTART.md       # Development Quick-Start
│   ├── setup.sh              # Einmalige Einrichtung
│   ├── start.sh              # Start-Script
│   ├── docker-compose.yml    # Lokale DB
│   ├── .env.frontend.example
│   └── .env.backend.example
│
├── Installation/             # 👈 NUR PRODUCTION
│   ├── README.md             # Server-Installation
│   └── scripts/
│       ├── install.sh        # Server-Installation
│       ├── update.sh         # Updates
│       └── debug.sh          # Diagnose
│
├── backend/                  # Backend-Code
├── pages/                    # Frontend-Code
└── components/               # React Components
```

**Vorteil:** Jeder weiß sofort, was wo ist!

---

## 🔧 Migration für Entwickler (lokale Entwicklung)

### Wenn du aktuell entwickelst:

```bash
# 1. Aktuelle Änderungen sichern
git stash

# 2. Neueste Version holen
git pull origin main

# 3. Alte Scripts entfernen (werden nicht mehr gebraucht)
rm -f start-dev.sh
rm -f SCHNELLSTART.md  # (ist jetzt in dev/)
rm -f FRONTEND-BACKEND-INTEGRATION.md  # (Info in dev/README.md)

# 4. Neue Development-Struktur nutzen
cd dev
./setup.sh    # Richtet alles ein
./start.sh    # Startet Server

# 5. Gesicherte Änderungen wieder herstellen
git stash pop
```

### .env Dateien

**Vorher:**
```
/.env                   # Frontend
/backend/.env           # Backend
```

**Nachher (gleich!):**
```
/.env                   # Frontend (unverändert)
/backend/.env           # Backend (unverändert)
```

**Beispiel-Dateien jetzt in:**
```
/dev/.env.frontend.example  → kopieren nach /.env
/dev/.env.backend.example   → kopieren nach /backend/.env
```

**Deine existierenden .env Dateien bleiben gleich!**

---

## 🚀 Migration für Server-Admins (Production)

### Wenn du bereits einen Server betreibst:

**GUTE NACHRICHT:** Keine Änderung nötig!

```bash
# Auf dem Server:
cd /var/www/fmsv-dingden

# Einfach updaten wie gewohnt:
git pull origin main

# Installation/ Scripts funktionieren weiter gleich:
cd Installation/scripts
sudo ./update.sh
```

**Die Production-Scripts in `Installation/` sind unverändert!**

---

## 📊 Vergleich Alt vs. Neu

### Development starten

**Vorher:**
```bash
./start-dev.sh  # Im Root
```

**Nachher:**
```bash
cd dev
./start.sh
```

### Production installieren

**Vorher:**
```bash
cd Installation/scripts
sudo ./install.sh
```

**Nachher (gleich!):**
```bash
cd Installation/scripts
sudo ./install.sh
```

---

## 📁 Gelöschte/Verschobene Dateien

### Gelöscht (nicht mehr nötig)

```
/start-dev.sh                        → Ersetzt durch dev/start.sh
/SCHNELLSTART.md                     → Verschoben nach dev/SCHNELLSTART.md
/FRONTEND-BACKEND-INTEGRATION.md     → Info jetzt in dev/README.md
```

### Neue Dateien

```
/dev/
  ├── README.md                      # Development-Anleitung
  ├── SCHNELLSTART.md                # Quick-Start
  ├── setup.sh                       # Einmalige Einrichtung
  ├── start.sh                       # Start-Script
  ├── docker-compose.yml             # Lokale DB
  ├── init-db.sql                    # DB-Init
  ├── .env.frontend.example          # Frontend .env Vorlage
  └── .env.backend.example           # Backend .env Vorlage

/ENTWICKLUNG-VS-PRODUCTION.md        # Erklärt Unterschiede
/MIGRATION-DEV-PROD-TRENNUNG.md      # Diese Datei
```

---

## ✅ Checkliste für Migration

### Entwickler (lokal)

- [ ] `git pull origin main`
- [ ] `rm start-dev.sh` (alt entfernen)
- [ ] `cd dev`
- [ ] `./setup.sh` (nur beim ersten Mal)
- [ ] `./start.sh` (ab jetzt immer)
- [ ] Lesezeichen aktualisieren: `dev/README.md`

### Server-Admin (Production)

- [ ] `cd /var/www/fmsv-dingden`
- [ ] `git pull origin main`
- [ ] Fertig! (Keine weitere Aktion nötig)

---

## 🆘 Probleme nach Migration?

### "start-dev.sh not found"

**Lösung:**
```bash
cd dev
./start.sh
```

### ".env.example nicht gefunden"

**Vorher:**
```
/backend/env.example.txt
```

**Nachher:**
```
/dev/.env.backend.example
```

**Lösung:**
```bash
cd dev
cp .env.backend.example ../backend/.env
cp .env.frontend.example ../.env
```

### "Datenbank verbindet nicht"

**Entwickler:**
```bash
cd dev
docker-compose up -d
```

**Production:**
```bash
# Unverändert
sudo systemctl status postgresql
```

---

## 📚 Neue Dokumentations-Struktur

### Für Entwickler

Lese **ZUERST:** [dev/README.md](dev/README.md)

Weitere Docs:
- [dev/SCHNELLSTART.md](dev/SCHNELLSTART.md) - Quick Start
- [dev/TROUBLESHOOTING.md](dev/TROUBLESHOOTING.md) - Probleme
- [backend/README.md](backend/README.md) - Backend API
- [backend/API-Dokumentation.md](backend/API-Dokumentation.md) - API Docs

### Für Server-Admins

Lese **ZUERST:** [Installation/README.md](Installation/README.md)

Weitere Docs:
- [Installation/NACH-INSTALLATION.md](Installation/NACH-INSTALLATION.md)
- [Installation/scripts/README.md](Installation/scripts/README.md)
- Alle `Installation/*.md` Dateien

### Für beide

- [ENTWICKLUNG-VS-PRODUCTION.md](ENTWICKLUNG-VS-PRODUCTION.md) - Unterschiede erklärt
- [README.md](README.md) - Projekt-Übersicht

---

## 🎯 Warum diese Änderung?

### Vorher: Probleme

1. ❌ "Ist `start-dev.sh` für Development oder Production?"
2. ❌ "Welche .env soll ich verwenden?"
3. ❌ "Kann ich `install.sh` lokal ausführen?"
4. ❌ Scripts vermischt (dev + prod im selben Ordner)
5. ❌ Unklare Dokumentation

### Nachher: Vorteile

1. ✅ Klare Trennung: `dev/` vs. `Installation/`
2. ✅ Eindeutige Scripts: `dev/start.sh` vs. `Installation/scripts/install.sh`
3. ✅ Separate .env Beispiele
4. ✅ Dedizierte Dokumentation
5. ✅ Weniger Verwirrung, weniger Fehler

---

## 🚀 Los geht's!

### Entwickler

```bash
cd dev
./setup.sh    # Beim ersten Mal
./start.sh    # Ab jetzt immer
```

### Server-Admin

```bash
# Nichts zu tun! Alles läuft weiter wie vorher.
cd Installation/scripts
sudo ./update.sh  # Für Updates
```

---

## ❓ Fragen?

- **Development:** [dev/README.md](dev/README.md)
- **Production:** [Installation/README.md](Installation/README.md)
- **Unterschiede:** [ENTWICKLUNG-VS-PRODUCTION.md](ENTWICKLUNG-VS-PRODUCTION.md)
- **GitHub Issues:** https://github.com/Achim-Sommer/fmsv-dingden/issues

---

**Migration abgeschlossen! 🎉**

Die neue Struktur macht das Projekt klarer und einfacher zu nutzen.
