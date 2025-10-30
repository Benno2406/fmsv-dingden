# 🚀 FMSV Dingden - Quick Start

## 3 Scripts - Das ist alles was du brauchst!

```
├── install.sh  →  Erstinstallation
├── debug.sh    →  Probleme finden & beheben
└── update.sh   →  System aktualisieren
```

---

## 📦 1. Installation

```bash
cd /tmp
git clone https://github.com/Achim-Sommer/fmsv-dingden.git
cd fmsv-dingden/Installation/scripts
chmod +x install.sh
sudo ./install.sh
```

**Dauer:** 15-30 Minuten

---

## 🔧 2. Probleme? → Debug!

```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./debug.sh
```

### Menü-Optionen:

| Nr | Was | Wann |
|----|-----|------|
| 1 | **Vollständige Diagnose** | Ersten Überblick bekommen |
| 2 | **Quick-Fix** | Häufige Probleme automatisch beheben |
| 3 | **Logs anzeigen** | Fehler im Detail sehen |
| 4 | **Backend manuell starten** | Genaue Fehlermeldung bekommen |
| 5 | **Services Status** | Prüfen was läuft |
| 6 | **Node Modules installieren** | Dependencies neu installieren |
| 7 | **Datenbank testen** | DB-Verbindung prüfen |
| 8 | **.env prüfen** | Konfiguration validieren |
| 9 | **HTTP-Test** | API-Endpoints testen |

### Häufige Probleme:

| Problem | Lösung |
|---------|--------|
| ❌ Backend startet nicht | `debug.sh` → Option 2 (Quick-Fix) |
| ❌ 500 Error | `debug.sh` → Option 1 (Diagnose) |
| ❌ Datenbank-Fehler | `debug.sh` → Option 7 (DB-Test) |
| ❌ node_modules fehlen | `debug.sh` → Option 6 (Module installieren) |
| ❌ .env fehlt | `debug.sh` → Option 8 (.env prüfen) |

---

## 🔄 3. Updates

```bash
sudo fmsv-update
# oder direkt:
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./update.sh
```

**Macht:**
- ✅ Git Pull
- ✅ npm install
- ✅ Services neu starten
- ✅ Backup erstellen

---

## 💡 Wichtige Befehle

### Services steuern
```bash
# Status prüfen
systemctl status fmsv-backend
systemctl status nginx
systemctl status postgresql

# Neu starten
systemctl restart fmsv-backend
systemctl restart nginx

# Logs ansehen
journalctl -u fmsv-backend -f
```

### Konfiguration
```bash
# Backend .env bearbeiten
nano /var/www/fmsv-dingden/backend/.env

# Nach Änderungen: Backend neu starten
systemctl restart fmsv-backend
```

### Schnell-Tests
```bash
# Ist Backend erreichbar?
curl http://localhost:5000/api/health

# Läuft PostgreSQL?
systemctl status postgresql

# Funktioniert Datenbank?
sudo -u postgres psql -d fmsv_dingden -c "SELECT 1;"
```

---

## 🎯 Typischer Workflow bei Problemen

1. **Führe debug.sh aus:**
   ```bash
   cd /var/www/fmsv-dingden/Installation/scripts
   sudo ./debug.sh
   ```

2. **Starte mit Option 1 (Vollständige Diagnose)**
   - Zeigt dir genau was fehlt
   - Gibt Tipps zur Behebung

3. **Wenn Quick-Fix angeboten wird → bestätigen**
   - Behebt viele Probleme automatisch

4. **Wenn nicht gelöst: Logs ansehen (Option 3)**
   - Zeigt genaue Fehlermeldung
   - Danach: Spezifische Option wählen

5. **Immer nach Fixes: Services neu starten**
   ```bash
   systemctl restart fmsv-backend
   ```

---

## 📚 Mehr Infos

- **Vollständige Anleitung:** `/Installation/README.md`
- **Troubleshooting:** `/Installation/TROUBLESHOOTING.md`
- **Scripts Doku:** `/Installation/scripts/README.md`
- **API Doku:** `/backend/API-Dokumentation.md`

---

## 🆘 Support-Checklist

Wenn du Hilfe brauchst, führe aus und teile:

```bash
# 1. System-Info
uname -a
cat /etc/os-release

# 2. Debug-Diagnose
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./debug.sh
# → Option 1 (Screenshot vom Ergebnis machen)

# 3. Logs
journalctl -u fmsv-backend -n 50
```

---

**Das ist alles! 3 Scripts, klare Struktur. 🎉**
