# FMSV Dingden - Scripts

## 📋 Verfügbare Scripts

### 1. `install.sh` - Initiale Installation
Führt die komplette Erstinstallation durch.

```bash
sudo ./install.sh
```

**Was es macht:**
- Installiert alle Abhängigkeiten (Node.js, PostgreSQL, Nginx, etc.)
- Richtet Backend und Frontend ein
- Konfiguriert Datenbank
- Erstellt systemd Services
- Optional: Cloudflare Tunnel Setup

**Wann verwenden:**
- Erste Installation auf neuem Server
- Komplette Neuinstallation

---

### 2. `debug.sh` - Debug & Fix Tool
Interaktives Tool zum Finden und Beheben von Problemen.

```bash
sudo ./debug.sh
```

**Features:**
- 🔍 Vollständige Diagnose
- ⚡ Quick-Fix (häufige Probleme)
- 📋 Live-Logs anzeigen
- 🔧 Backend manuell starten
- 📊 Services-Status prüfen
- 📦 Node Modules installieren
- 🗄️ Datenbank testen
- ⚙️ .env Konfiguration prüfen
- 🌐 HTTP-Endpoints testen

**Wann verwenden:**
- Backend startet nicht
- Fehlersuche
- Nach Änderungen an Konfiguration
- Wenn etwas nicht funktioniert

---

### 3. `update.sh` - System aktualisieren
Aktualisiert das System auf die neueste Version.

```bash
sudo ./update.sh
```

**Was es macht:**
- Lädt neueste Version von GitHub
- Aktualisiert Backend
- Aktualisiert Frontend
- Startet Services neu
- Behält Konfiguration bei

**Wann verwenden:**
- Regelmäßige Updates
- Neue Features verfügbar
- Bugfixes

---

## 🚀 Quick Start

### Problem: Backend startet nicht?
```bash
sudo ./debug.sh
# Wähle: 1 (Vollständige Diagnose)
# oder: 2 (Quick-Fix)
```

### Problem: 500 Error?
```bash
sudo ./debug.sh
# Wähle: 3 (Logs anzeigen)
```

### Problem: Datenbank-Fehler?
```bash
sudo ./debug.sh
# Wähle: 7 (Datenbank testen)
```

---

## 📁 Weitere Dateien

- `make-executable.sh` - Macht alle Scripts ausführbar
  ```bash
  sudo ./make-executable.sh
  ```

---

## 🆘 Hilfe

### Scripts laufen nicht?
```bash
# Mache sie ausführbar
sudo chmod +x /var/www/fmsv-dingden/Installation/scripts/*.sh
```

### Welches Script brauche ich?
- **Erstinstallation?** → `install.sh`
- **Fehler/Probleme?** → `debug.sh`
- **Aktualisieren?** → `update.sh`

---

## 📚 Dokumentation

Siehe:
- `/Installation/README.md` - Hauptdokumentation
- `/Installation/TROUBLESHOOTING.md` - Problemlösungen
- `/backend/API-Dokumentation.md` - API Referenz

---

**Tipp:** Bei Problemen IMMER zuerst `debug.sh` ausführen!
