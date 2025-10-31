# FMSV Dingden - Wartungs-Scripts

Diese Scripts helfen dir bei der Verwaltung deiner FMSV-Installation.

---

## 📋 **Verfügbare Scripts**

### `install.sh` - Haupt-Installation
```bash
sudo ./install.sh
```

Führt die komplette Installation durch:
- System-Updates
- PostgreSQL Installation
- Node.js & Backend Setup
- Frontend Build
- Nginx Konfiguration
- Cloudflare Tunnel (optional)
- Auto-Update System

**Optionen:**
- `--help` - Hilfe anzeigen
- `--no-cloudflare` - Cloudflare Tunnel überspringen

---

### `restart.sh` - Service Neustart
```bash
sudo fmsv-restart
# oder
sudo /var/www/fmsv-dingden/Installation/scripts/restart.sh
```

Startet alle Services neu:
- PostgreSQL
- FMSV Backend
- Nginx
- Cloudflare Tunnel (falls vorhanden)

Führt automatisch API-Tests durch.

**Wann verwenden?**
- Nach Config-Änderungen
- Bei "Backend nicht erreichbar" Fehlern
- Nach System-Updates
- Wenn Services hängen

---

### `rebuild-frontend.sh` - Frontend neu builden
```bash
sudo fmsv-rebuild
# oder
sudo /var/www/fmsv-dingden/Installation/scripts/rebuild-frontend.sh
```

Baut das Frontend mit Production-Einstellungen neu:
- Erstellt `.env.production` falls nicht vorhanden
- Erstellt `.env.development` falls nicht vorhanden
- Installiert Dependencies
- Führt Production-Build durch
- Setzt Berechtigungen
- Lädt Nginx neu

**Wann verwenden?**
- Nach Frontend-Code-Änderungen
- Bei "Backend nicht erreichbar" (erste Hilfe)
- Nach Git Pull von neuen Frontend-Updates
- Wenn `.env` Dateien fehlen

---

### `update.sh` - System-Update
```bash
sudo fmsv-update
# oder
sudo /var/www/fmsv-dingden/Installation/scripts/update.sh
```

Aktualisiert das komplette System:
- Git Pull vom Repository
- Backend Dependencies
- Frontend Build
- Service Neustart
- Backup-Empfehlung vor Update

**Wann verwenden?**
- Für manuelle Updates (wenn Auto-Update deaktiviert)
- Wenn neue Features verfügbar sind
- Nach Bug-Fixes im Repository

---

### `debug.sh` - Diagnose
```bash
sudo fmsv-debug
# oder
sudo /var/www/fmsv-dingden/Installation/scripts/debug.sh
```

Führt vollständige Diagnose durch:
- System-Informationen
- Service-Status
- Port-Checks
- Datei-Berechtigungen
- Config-Validierung
- API-Tests
- Log-Auszüge

**Wann verwenden?**
- Bei Problemen jeder Art
- Vor Support-Anfragen
- Zur Fehlersuche
- Zum Überprüfen der Installation

---

## 🚀 **Quick-Start nach Problemen**

### Problem: Backend nicht erreichbar
```bash
# 1. Services neu starten
sudo fmsv-restart

# 2. Wenn das nicht hilft: Frontend neu builden
sudo fmsv-rebuild

# 3. Immer noch Probleme? Debug-Info holen
sudo fmsv-debug
```

### Problem: Updates verfügbar
```bash
# 1. Backup erstellen (empfohlen)
sudo -u postgres pg_dump fmsv_database > backup_$(date +%Y%m%d).sql

# 2. Update durchführen
sudo fmsv-update

# 3. Prüfen ob alles läuft
sudo fmsv-restart
```

### Problem: Nach Config-Änderung
```bash
# Backend .env geändert?
sudo systemctl restart fmsv-backend

# Nginx Config geändert?
sudo nginx -t
sudo systemctl reload nginx

# Frontend .env geändert?
sudo fmsv-rebuild
```

---

## 📝 **Script-Standorte**

Nach Installation sind die Scripts an 2 Stellen verfügbar:

### 1. Original-Verzeichnis
```bash
/var/www/fmsv-dingden/Installation/scripts/
├── install.sh           # Haupt-Installation
├── restart.sh           # Service Neustart
├── rebuild-frontend.sh  # Frontend Build
├── update.sh            # System Update
└── debug.sh             # Diagnose
```

### 2. System-Befehle (kopiert während Installation)
```bash
/usr/local/bin/
├── fmsv-restart  → restart.sh
├── fmsv-rebuild  → rebuild-frontend.sh
├── fmsv-update   → update.sh
└── fmsv-debug    → debug.sh
```

Die System-Befehle sind überall verfügbar (im PATH).

---

## 🔒 **Berechtigungen**

Alle Scripts benötigen **root-Rechte**:

```bash
# Richtig ✅
sudo fmsv-restart

# Falsch ❌
fmsv-restart
```

**Warum?**
- Service-Verwaltung (systemctl)
- Port-Binding (Port 80/443)
- Datei-Berechtigungen setzen
- Nginx-Konfiguration

---

## 🧪 **Scripts testen**

### Test 1: Restart-Script
```bash
sudo fmsv-restart
# Sollte alle Services starten und API-Test durchführen
```

### Test 2: Debug-Script
```bash
sudo fmsv-debug
# Sollte umfangreiche System-Info ausgeben
```

### Test 3: Rebuild-Script
```bash
sudo fmsv-rebuild
# Sollte Frontend bauen und Nginx neu laden
```

---

## 📚 **Weitere Informationen**

- **Installation:** `/var/www/fmsv-dingden/Installation/Anleitung/Installation.md`
- **API-Probleme:** `/var/www/fmsv-dingden/Installation/Anleitung/Frontend-Backend-Verbindung.md`
- **Datenbank-Admin:** `/var/www/fmsv-dingden/Installation/Anleitung/Database-Admin-NodeJS.md`

---

## ⚠️ **Wichtige Hinweise**

### Vor Updates
- **Backup erstellen!**
  ```bash
  sudo -u postgres pg_dump fmsv_database > backup.sql
  cp -r /var/www/fmsv-dingden/Saves /root/backup_saves/
  ```

### Bei Problemen
1. **Logs ansehen:**
   ```bash
   journalctl -u fmsv-backend -n 50
   tail -f /var/log/nginx/error.log
   ```

2. **Services prüfen:**
   ```bash
   systemctl status fmsv-backend
   systemctl status nginx
   systemctl status postgresql
   ```

3. **API-Test:**
   ```bash
   curl http://localhost:3000/api/health
   curl http://localhost/api/health
   ```

### Scripts bearbeiten
Scripts können bearbeitet werden:
```bash
# Original bearbeiten
sudo nano /var/www/fmsv-dingden/Installation/scripts/restart.sh

# Nach Änderung neu kopieren
sudo cp /var/www/fmsv-dingden/Installation/scripts/restart.sh /usr/local/bin/fmsv-restart
sudo chmod +x /usr/local/bin/fmsv-restart
```

---

**Viel Erfolg! 🚀**
