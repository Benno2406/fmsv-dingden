# Auto-Update System

Automatische Updates von GitHub für FMSV Dingden.

## 🎯 Übersicht

Das Auto-Update-System zieht automatisch Updates von GitHub und deployed sie auf den Server.

```
GitHub (main/testing)
        ↓
Auto-Update Script (läuft via systemd timer)
        ↓
Server Update (Backend + Frontend)
        ↓
Service Restart
```

---

## ⚙️ Konfiguration

### Bei Installation

Während der Installation (`install.sh`) wirst du gefragt:

```
Automatische Updates:
  [1] Täglich um 03:00 Uhr
  [2] Wöchentlich (Sonntag 03:00 Uhr)
  [3] Manuell (keine automatischen Updates)
```

### Nach Installation

**Update-Kanal in Backend .env:**
```bash
nano /var/www/fmsv-dingden/backend/.env
```

```env
UPDATE_CHANNEL=Stable    # oder Testing
UPDATE_BRANCH=main       # oder testing
```

---

## 🔄 Funktionsweise

### Was passiert automatisch?

1. **Git Fetch** - Prüft auf neue Commits
2. **Vergleich** - Lokale vs. Remote Version
3. **Pull** - Zieht Updates (falls vorhanden)
4. **Backend Update** - `npm install --production`
5. **Frontend Build** - `npm run build`
6. **Service Restart** - Backend, Nginx, Cloudflare

### Wann läuft es?

**Täglich:**
- Jeden Tag um 03:00 Uhr morgens

**Wöchentlich:**
- Jeden Sonntag um 03:00 Uhr morgens

### Was wird geloggt?

Alle Updates werden geloggt in:
```
/var/log/fmsv-auto-update.log
```

---

## 📊 Monitoring

### Timer-Status prüfen

```bash
# Status
systemctl status fmsv-auto-update.timer

# Wann läuft der nächste Update?
systemctl list-timers | grep fmsv

# Letzte Ausführung
journalctl -u fmsv-auto-update.service -n 1
```

### Logs ansehen

```bash
# Live-Logs
tail -f /var/log/fmsv-auto-update.log

# Letzte 50 Zeilen
tail -n 50 /var/log/fmsv-auto-update.log

# Logs filtern
grep "Update" /var/log/fmsv-auto-update.log
```

### Service-Logs

```bash
# Systemd Logs
journalctl -u fmsv-auto-update.service -f

# Letzte Ausführung
journalctl -u fmsv-auto-update.service -n 100
```

---

## ⚙️ Verwaltung

### Timer stoppen

```bash
systemctl stop fmsv-auto-update.timer
systemctl disable fmsv-auto-update.timer
```

### Timer starten

```bash
systemctl start fmsv-auto-update.timer
systemctl enable fmsv-auto-update.timer
```

### Manuell auslösen

```bash
# Sofort ausführen
systemctl start fmsv-auto-update.service

# Logs dabei ansehen
journalctl -u fmsv-auto-update.service -f
```

### Zeitplan ändern

```bash
# Timer-Konfiguration bearbeiten
nano /etc/systemd/system/fmsv-auto-update.timer
```

**Beispiel - Täglich um 04:00 Uhr:**
```ini
[Timer]
OnCalendar=*-*-* 04:00:00
Persistent=true
```

**Beispiel - Montags um 02:00 Uhr:**
```ini
[Timer]
OnCalendar=Mon *-*-* 02:00:00
Persistent=true
```

**Änderungen aktivieren:**
```bash
systemctl daemon-reload
systemctl restart fmsv-auto-update.timer
```

---

## 🌿 Branch wechseln

### Von Stable zu Testing

```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./update.sh
# Option 2 wählen
# Testing wählen
```

Oder manuell:

```bash
cd /var/www/fmsv-dingden

# Branch wechseln
git checkout testing
git pull origin testing

# .env anpassen
nano backend/.env
# UPDATE_BRANCH=testing
# UPDATE_CHANNEL=Testing

# Services neu starten
systemctl restart fmsv-backend
systemctl restart nginx
```

### Von Testing zu Stable

Gleiche Schritte, aber `main` statt `testing`.

---

## 🔍 Troubleshooting

### Updates werden nicht gezogen

**Prüfen:**
```bash
# Timer aktiv?
systemctl status fmsv-auto-update.timer

# Service läuft?
systemctl status fmsv-auto-update.service

# Git Status
cd /var/www/fmsv-dingden
git status
git fetch origin
git log --oneline -5
```

**Lösung:**
```bash
# Timer neu starten
systemctl restart fmsv-auto-update.timer

# Manuell testen
/var/www/fmsv-dingden/Installation/scripts/auto-update.sh
```

### Git-Konflikte

**Symptom:**
```
error: Your local changes to the following files would be overwritten by merge
```

**Lösung:**
```bash
cd /var/www/fmsv-dingden

# Lokale Änderungen verwerfen
git reset --hard origin/main  # oder origin/testing

# Update erneut versuchen
git pull origin main  # oder testing
```

### Build schlägt fehl

**Prüfen:**
```bash
# Logs
tail -n 100 /var/log/fmsv-auto-update.log

# Manuell bauen
cd /var/www/fmsv-dingden
npm install
npm run build
```

**Häufige Ursachen:**
- Node.js Version zu alt
- Diskspace voll
- npm cache korrupt

**Lösungen:**
```bash
# npm cache leeren
npm cache clean --force

# node_modules neu installieren
rm -rf node_modules
npm install
```

### Services starten nicht

**Prüfen:**
```bash
# Backend
systemctl status fmsv-backend
journalctl -u fmsv-backend -n 50

# Nginx
systemctl status nginx
nginx -t
```

**Lösung:**
```bash
# Services neu starten
systemctl restart fmsv-backend
systemctl restart nginx
```

---

## 💾 Backups

### Automatisches Backup

Das Update-Script erstellt **automatisch** Backups vor Updates:

```
/var/backups/fmsv-YYYYMMDD-HHMMSS/
├── database.sql       # Datenbank
├── uploads.tar.gz     # Uploads
└── .env               # Konfiguration
```

### Backup wiederherstellen

```bash
# Services stoppen
systemctl stop fmsv-backend
systemctl stop nginx

# Datenbank
sudo -u postgres psql fmsv_database < /var/backups/fmsv-YYYYMMDD-HHMMSS/database.sql

# Uploads
tar -xzf /var/backups/fmsv-YYYYMMDD-HHMMSS/uploads.tar.gz -C /var/www/fmsv-dingden/

# .env
cp /var/backups/fmsv-YYYYMMDD-HHMMSS/.env /var/www/fmsv-dingden/backend/.env

# Services starten
systemctl start fmsv-backend
systemctl start nginx
```

---

## 📋 Best Practices

### Für Production-Server

✅ **Verwende Stable (main)**
- Nur getestete Features
- Weniger Updates
- Sicherer

✅ **Wöchentliche Updates**
- Weniger Störungen
- Zeit für Tests

✅ **Monitoring einrichten**
- Logs regelmäßig prüfen
- Benachrichtigungen bei Fehlern

### Für Testing-Server

✅ **Verwende Testing**
- Neueste Features
- Früh testen

✅ **Tägliche Updates**
- Immer aktuell
- Bugs schnell finden

✅ **Parallel zu Production**
- Erst Testing, dann Production
- Keine Experimente auf Production

---

## 🔧 Script-Details

### Auto-Update Script

**Location:** `/var/www/fmsv-dingden/Installation/scripts/auto-update.sh`

**Was es macht:**
1. Liest Branch aus `.env`
2. Fetcht Updates von GitHub
3. Vergleicht Versionen
4. Pullt Changes (falls vorhanden)
5. Installiert Dependencies
6. Baut Frontend
7. Startet Services neu
8. Loggt alles

**Wichtig:**
- Läuft als `root`
- Verwendet `www-data` User für Files
- Erstellt Backups automatisch

---

## 📚 Weitere Informationen

- **Installation:** [`Installation.md`](Installation.md)
- **Update-Script:** [`/Installation/scripts/README.md`](../scripts/README.md)
- **GitHub Workflows:** [`/.github/README.md`](../../.github/README.md)

---

**Automatische Updates = Weniger Arbeit!** 🚀

Bei Problemen: Logs prüfen oder manuelles Update durchführen.
