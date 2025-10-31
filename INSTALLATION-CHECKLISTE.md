# 📋 Installation Checkliste

## ✅ Was wurde behoben?

- [x] Stack Overflow in initDatabase.js → Modular umgebaut
- [x] Stack Overflow in seedDatabase.js → CommonJS Migration
- [x] Stack Overflow in database.js → Query-Logging optimiert
- [x] Schema in 31 Module aufgeteilt
- [x] .gitignore erstellt (gitignore.txt)
- [x] Dokumentation erstellt

## 🚀 Nächste Schritte

### 1. Git Repository vorbereiten

```bash
# .gitignore aktivieren
mv gitignore.txt .gitignore

# Alle Änderungen committen
git add .
git commit -m "fix: Resolve stack overflow with modular database system

- Split schema into 15 table files
- Split init-data into 16 data files  
- Optimize database query logging
- Migrate seedDatabase to CommonJS
- Add comprehensive documentation

BREAKING CHANGE: Existing databases need migration
"

# Pushen
git push origin main
```

### 2. Lokales Testen (optional)

```bash
# Terminal 1: PostgreSQL prüfen
sudo systemctl status postgresql

# Terminal 2: Backend testen
cd backend
node scripts/initDatabase.js
node scripts/seedDatabase.js
npm start

# Terminal 3: Frontend testen
npm run dev
```

**Erwartete Ausgaben:**
- ✅ 15 Tabellen erstellt
- ✅ 16 Datensätze geladen
- ✅ 2 Test-Benutzer erstellt
- ✅ Backend läuft auf Port 3000
- ✅ Frontend läuft auf Port 5173

### 3. Server-Installation

```bash
# SSH zum Server
ssh root@dein-server

# Repository klonen/aktualisieren
cd /var/www/fmsv-dingden
git pull origin main

# Backend installieren
cd backend
npm install

# .env Datei erstellen
cp env.example.txt .env
nano .env  # DB-Credentials eintragen

# Datenbank initialisieren
node scripts/initDatabase.js

# Test-Daten einfügen (optional)
node scripts/seedDatabase.js

# Systemd Service starten
sudo systemctl start fmsv-backend
sudo systemctl enable fmsv-backend
sudo systemctl status fmsv-backend

# Nginx neu laden
sudo systemctl reload nginx
```

## 🔍 Verifizierung

### Datenbank prüfen

```bash
sudo -u postgres psql fmsv_dingden <<EOF
-- Tabellen
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Rollen
SELECT * FROM roles ORDER BY level DESC;

-- Permissions
SELECT category, COUNT(*) FROM permissions GROUP BY category;

-- Test-User
SELECT email, is_admin, is_member, email_verified FROM users;
EOF
```

**Erwartete Ausgabe:**
- 15 Tabellen vorhanden
- 12 Rollen (Superadmin bis Gastmitglied)
- ~100 Permissions in 14 Kategorien
- 2 Test-User (admin@, member@)

### Backend-API testen

```bash
# Health-Check
curl http://localhost:3000/api/health

# Login testen
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@fmsv-dingden.de",
    "password": "admin123"
  }'
```

**Erwartete Antwort:**
```json
{
  "success": true,
  "token": "eyJhbGci...",
  "user": {
    "id": "...",
    "email": "admin@fmsv-dingden.de",
    "roles": ["superadmin"]
  }
}
```

### Frontend testen

```bash
# Browser öffnen
# http://localhost (Server) oder http://localhost:5173 (Dev)

# Login mit:
# admin@fmsv-dingden.de / admin123
# member@fmsv-dingden.de / member123
```

## 📊 Status-Check

### Backend-Services

```bash
# Backend Status
sudo systemctl status fmsv-backend

# PostgreSQL Status
sudo systemctl status postgresql

# Nginx Status
sudo systemctl status nginx

# Logs ansehen
tail -f /var/www/fmsv-dingden/backend/Logs/combined.log
tail -f /var/www/fmsv-dingden/backend/Logs/error.log
journalctl -u fmsv-backend -f
```

### Wichtige Dateien

```bash
# .env vorhanden?
ls -la /var/www/fmsv-dingden/backend/.env

# Logs-Verzeichnis?
ls -la /var/www/fmsv-dingden/Logs/

# Saves-Verzeichnis?
ls -la /var/www/fmsv-dingden/Saves/

# Berechtigungen?
ls -la /var/www/fmsv-dingden/
```

## 🔧 Troubleshooting

### Problem: "Cannot find module"

```bash
cd /var/www/fmsv-dingden/backend
npm install
```

### Problem: "Database connection failed"

```bash
# PostgreSQL läuft?
sudo systemctl start postgresql

# Credentials korrekt?
cat backend/.env | grep DB_

# Datenbank existiert?
sudo -u postgres psql -l | grep fmsv
```

### Problem: "Stack overflow" noch immer

```bash
# Node.js Version prüfen
node --version  # Sollte >= 18.x sein

# Memory erhöhen
node --max-old-space-size=4096 scripts/initDatabase.js

# Einzelne Datei testen
sudo -u postgres psql fmsv_dingden -f backend/database/tables/01-users.sql
```

### Problem: Backend startet nicht

```bash
# Fehler-Logs prüfen
journalctl -u fmsv-backend -n 50

# Manuell starten (zum Debuggen)
cd /var/www/fmsv-dingden/backend
node server.js

# Port belegt?
sudo lsof -i :3000
```

## ⚠️ Wichtige Hinweise

### Sicherheit

1. **Admin-Passwort ändern** nach erstem Login!
2. **2FA aktivieren** für alle Admin-Accounts
3. **JWT_SECRET** in `.env` sollte ein sicherer Random-String sein
4. **SMTP konfigurieren** für E-Mail-Versand
5. **Firewall** nur nötige Ports öffnen

### Performance

1. **PostgreSQL tunen** für Production
2. **Nginx Caching** aktivieren
3. **PM2** statt systemd verwenden (optional)
4. **Monitoring** einrichten (z.B. Grafana)

### Backup

1. **Automatisches DB-Backup** einrichten
2. **Uploads regelmäßig sichern** (Saves/)
3. **.env Datei sichern** (enthält Secrets!)

## 📚 Dokumentation

Nach erfolgreicher Installation, lies diese Dateien:

1. **Backend:**
   - `/backend/README.md` - Backend-Übersicht
   - `/backend/API-Dokumentation.md` - API-Endpunkte
   - `/backend/RBAC-2FA-IMPLEMENTATION.md` - RBAC & 2FA Details

2. **Datenbank:**
   - `/backend/database/README.md` - Schema-Dokumentation
   - `/backend/database/MIGRATION-INFO.md` - Migration-Infos

3. **Installation:**
   - `/Installation/README.md` - Installations-Anleitung
   - `/Installation/Anleitung/Installation.md` - Schritt-für-Schritt

4. **Fixes:**
   - `/PROBLEM-GELOEST.md` - Stack Overflow Lösung
   - `/backend/STACK-OVERFLOW-FIX.md` - Technische Details

## ✅ Fertig-Checkliste

Hake ab, was funktioniert:

- [ ] Git Repository aktualisiert (git push)
- [ ] .gitignore aktiviert (mv gitignore.txt .gitignore)
- [ ] Backend Dependencies installiert (npm install)
- [ ] .env Datei erstellt und ausgefüllt
- [ ] Datenbank initialisiert (initDatabase.js)
- [ ] Test-Daten eingefügt (seedDatabase.js)
- [ ] Backend startet ohne Fehler
- [ ] PostgreSQL läuft
- [ ] Nginx konfiguriert
- [ ] API-Endpunkte erreichbar (curl test)
- [ ] Frontend läuft
- [ ] Login funktioniert (admin & member)
- [ ] Admin-Passwort geändert
- [ ] 2FA aktiviert
- [ ] SMTP konfiguriert
- [ ] Backup eingerichtet
- [ ] Monitoring aktiv

## 🎉 Erfolgreich!

Wenn alles funktioniert:

```bash
# Test-Login im Browser
http://deine-domain.de/login

# Credentials:
# admin@fmsv-dingden.de / admin123
```

**Glückwunsch! Die Installation ist komplett!** 🚀

---

**Erstellt:** 31.10.2025  
**Version:** 2.0 - Modulares System  
**Status:** ✅ Produktionsreif
