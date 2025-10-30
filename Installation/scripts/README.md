# Installations-Scripts

Automatisierte Installation und Updates für FMSV Dingden.

## 🚀 Scripts

### install.sh - Haupt-Installation

**Das eine Script für alles!**

```bash
cd /var/www/fmsv-dingden/Installation/scripts
chmod +x install.sh
sudo ./install.sh
```

**Features:**
- ✅ Systematische Installation mit 14 Schritten
- ✅ Fortschrittsanzeige für jeden Schritt
- ✅ Farbcodierte Ausgabe (Info/Erfolg/Warnung/Fehler)
- ✅ PostgreSQL + Node.js Installation
- ✅ Wahl zwischen Stable/Testing
- ✅ Optional: Cloudflare Tunnel
- ✅ GitHub Auto-Update System
- ✅ Interaktiver Dialog

**Installiert:**
- Backend (Node.js, Express, PostgreSQL)
- Frontend (React, Vite)
- Nginx (Webserver)
- Cloudflare Tunnel (optional)
- Auto-Update Timer (optional)

**Dauer:** ~10-15 Minuten

**Beispiel-Ausgabe:** Siehe [`/Installation/BEISPIEL-AUSGABE.md`](../BEISPIEL-AUSGABE.md)

---

### update.sh - Manuelle Updates

```bash
cd /var/www/fmsv-dingden/Installation/scripts
chmod +x update.sh
sudo ./update.sh
```

**Features:**
- ✅ Systematische Updates mit Fortschrittsanzeige
- ✅ Update von GitHub ziehen
- ✅ Zwischen Stable/Testing wechseln
- ✅ Automatisches Backup vor Update
- ✅ Service-Neustart
- ✅ Farbcodierte Ausgabe

**Optionen:**
1. Update durchführen (7 Schritte)
   - Auf Updates prüfen
   - Backup erstellen
   - Updates ziehen
   - Backend aktualisieren
   - Frontend bauen
   - Services neu starten
   - Überprüfung

2. Branch wechseln (8 Schritte)
   - Branch auswählen
   - Backup erstellen
   - Branch wechseln
   - Konfiguration anpassen
   - Backend aktualisieren
   - Frontend bauen
   - Services neu starten
   - Überprüfung

3. Abbrechen

---

### auto-update.sh - Automatische Updates

**Automatisch erstellt** durch `install.sh` (falls Auto-Update aktiviert).

```bash
# Manuell ausführen
/var/www/fmsv-dingden/Installation/scripts/auto-update.sh

# Via systemd
systemctl start fmsv-auto-update.service

# Timer-Status
systemctl status fmsv-auto-update.timer
```

**Läuft automatisch:**
- Täglich um 03:00 Uhr (oder)
- Wöchentlich Sonntag 03:00 Uhr

**Macht:**
- Git Pull vom konfigurierten Branch
- Backend-Update (npm install)
- Frontend-Update (npm build)
- Service-Neustart

**Logs:**
```bash
tail -f /var/log/fmsv-auto-update.log
```

---

## 🎯 Empfohlener Workflow

### Erstinstallation

```bash
# 1. Repository klonen
cd /var/www
git clone https://github.com/Benno2406/fmsv-dingden.git

# 2. Installation starten
cd fmsv-dingden/Installation/scripts
chmod +x install.sh
sudo ./install.sh
```

### Manuelle Updates

```bash
# Update-Script ausführen
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./update.sh
# Option 1 wählen
```

### Branch wechseln

```bash
# Update-Script ausführen
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./update.sh
# Option 2 wählen
```

---

## 📋 Update-Kanäle

### Stable (main)

**Empfohlen für:**
- Production-Server
- Vereins-Website
- Maximale Stabilität

**Updates:**
- Nur getestete Features
- Seltenere Updates
- Release-Notes

**Branch:** `main`

### Testing (testing)

**Empfohlen für:**
- Entwicklungs-Server
- Test-Umgebungen
- Feature-Preview

**Updates:**
- Neueste Features
- Häufigere Updates
- Kann instabil sein

**Branch:** `testing`

---

## 🔄 GitHub Integration

### Lokaler PC ↔ GitHub ↔ Server

```
┌──────────────┐
│  Lokaler PC  │
└──────┬───────┘
       │ git push
       ▼
┌──────────────┐
│   GitHub     │ ← main (Stable)
│              │ ← testing (Testing)
└──────┬───────┘
       │ auto-update
       ▼
┌──────────────┐
│   Server     │
└──────────────┘
```

### Workflow

**Lokaler PC:**
```bash
# Feature entwickeln
git checkout testing
git add .
git commit -m "Neues Feature"
git push origin testing

# Nach Testing → Stable
git checkout main
git merge testing
git push origin main
```

**Server:**
```bash
# Testing-Server (auto-update von testing)
# Zieht automatisch neueste Changes

# Production-Server (auto-update von main)
# Zieht nur stabile Releases
```

---

## ⚙️ Konfiguration

### Auto-Update aktivieren/deaktivieren

**Stoppen:**
```bash
systemctl stop fmsv-auto-update.timer
systemctl disable fmsv-auto-update.timer
```

**Starten:**
```bash
systemctl start fmsv-auto-update.timer
systemctl enable fmsv-auto-update.timer
```

**Zeitplan ändern:**
```bash
# Timer-Konfiguration bearbeiten
nano /etc/systemd/system/fmsv-auto-update.timer

# Reload
systemctl daemon-reload
systemctl restart fmsv-auto-update.timer
```

### Branch manuell wechseln

```bash
cd /var/www/fmsv-dingden

# Zu Testing
git checkout testing
git pull origin testing

# Zu Stable
git checkout main
git pull origin main

# .env anpassen
nano backend/.env
# UPDATE_BRANCH=main (oder testing)
# UPDATE_CHANNEL=Stable (oder Testing)

# Services neu starten
systemctl restart fmsv-backend
systemctl restart nginx
```

---

## 🆘 Troubleshooting

### Installation schlägt fehl

```bash
# Logs prüfen
journalctl -xe

# Script mit Debug
bash -x install.sh
```

### Update funktioniert nicht

```bash
# Git-Status prüfen
cd /var/www/fmsv-dingden
git status
git fetch origin

# Lokale Änderungen verwerfen
git reset --hard origin/main

# Update erneut versuchen
./Installation/scripts/update.sh
```

### Auto-Update läuft nicht

```bash
# Timer aktiv?
systemctl status fmsv-auto-update.timer

# Service-Logs
journalctl -u fmsv-auto-update.service -f

# Manuell testen
/var/www/fmsv-dingden/Installation/scripts/auto-update.sh
```

---

## 📚 Weitere Dokumentation

- **Installation:** [`/Installation/Anleitung/Installation.md`](../Anleitung/Installation.md)
- **E-Mail Setup:** [`/Installation/Anleitung/E-Mail-Setup.md`](../Anleitung/E-Mail-Setup.md)
- **Cloudflare Tunnel:** [`/Installation/Anleitung/Cloudflare-Tunnel-Setup.md`](../Anleitung/Cloudflare-Tunnel-Setup.md)

---

**Ein Script. Alles drin. Einfach.** 🚀
