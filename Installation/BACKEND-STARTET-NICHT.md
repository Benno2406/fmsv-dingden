# Backend startet nicht - Fehlerdiagnose

## 🔍 Problem
Der Backend-Service startet, beendet sich aber sofort wieder.

## ✅ Schnelldiagnose

### Schritt 1: Fehler anzeigen
```bash
sudo fmsv-errors
```

Dieses Script zeigt dir:
- Systemd Service Logs
- Backend Error Logs
- Combined Logs
- Manuellen Start-Test (zeigt echte Fehler!)
- .env Konfiguration
- Datenbank Status

### Schritt 2: Häufigste Ursachen

#### 1. Datenbank-Verbindung fehlgeschlagen

**Symptom:**
```
❌ PostgreSQL Pool Fehler: connect ECONNREFUSED
```

**Lösung:**
```bash
# Prüfe ob PostgreSQL läuft
sudo systemctl status postgresql

# Starte PostgreSQL wenn nötig
sudo systemctl start postgresql

# Prüfe .env Konfiguration
sudo nano /var/www/fmsv-dingden/backend/.env
```

Überprüfe in `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fmsv_database
DB_USER=fmsv_user
DB_PASSWORD=dein-sicheres-passwort
```

#### 2. .env Datei fehlt

**Symptom:**
```
✗ Fehlende Env-Variablen: JWT_SECRET, DB_PASSWORD, ...
```

**Lösung:**
```bash
cd /var/www/fmsv-dingden/backend
sudo cp env.example.txt .env
sudo nano .env
# Fülle alle Werte aus!
```

#### 3. Port bereits belegt

**Symptom:**
```
❌ Port 5000 ist bereits belegt (EADDRINUSE)
```

**Lösung:**
```bash
# Finde Prozess auf Port 5000
sudo netstat -tulpn | grep :5000

# Beende Prozess (ersetze PID)
sudo kill <PID>

# Oder wähle anderen Port in .env
sudo nano /var/www/fmsv-dingden/backend/.env
# PORT=5001
```

#### 4. node_modules fehlen

**Symptom:**
```
Error: Cannot find module 'express'
```

**Lösung:**
```bash
cd /var/www/fmsv-dingden/backend
sudo npm install
sudo systemctl restart fmsv-backend
```

#### 5. Datenbank existiert nicht

**Symptom:**
```
error: database "fmsv_database" does not exist
```

**Lösung:**
```bash
# Datenbank initialisieren
cd /var/www/fmsv-dingden/backend
sudo -u postgres psql

-- In psql:
CREATE DATABASE fmsv_database;
CREATE USER fmsv_user WITH PASSWORD 'dein-passwort';
GRANT ALL PRIVILEGES ON DATABASE fmsv_database TO fmsv_user;
\q

# Schema initialisieren
node scripts/initDatabase.js
```

## 🛠️ Weitere Debug-Befehle

### Live-Logs anzeigen
```bash
sudo journalctl -u fmsv-backend -f
```

### Backend manuell starten (zeigt alle Fehler)
```bash
cd /var/www/fmsv-dingden/backend
sudo node server.js
```

### Kompletter Test-Durchlauf
```bash
sudo fmsv-test
```

### Service neu starten
```bash
sudo systemctl restart fmsv-backend
sudo systemctl status fmsv-backend
```

## 📋 Checkliste

- [ ] PostgreSQL läuft (`systemctl status postgresql`)
- [ ] `.env` Datei existiert und ist korrekt ausgefüllt
- [ ] Datenbank `fmsv_database` existiert
- [ ] Benutzer `fmsv_user` hat Rechte auf Datenbank
- [ ] Port ist nicht belegt
- [ ] `node_modules` existiert
- [ ] Schema ist initialisiert (`node scripts/initDatabase.js`)

## 🆘 Immer noch Probleme?

### Komplette Logs sammeln:
```bash
sudo fmsv-errors > ~/backend-debug.txt
cat ~/backend-debug.txt
```

### Debug-Modus aktivieren:
```bash
sudo nano /var/www/fmsv-dingden/backend/.env
# Setze:
NODE_ENV=development

sudo systemctl restart fmsv-backend
```

### Service-Status im Detail:
```bash
sudo systemctl status fmsv-backend -l --no-pager
sudo journalctl -u fmsv-backend -n 100 --no-pager
```

## 💡 Tipps

1. **Immer zuerst `fmsv-errors` ausführen** - zeigt alle relevanten Infos
2. **Logs lesen von unten nach oben** - der letzte Fehler ist meist der wichtigste
3. **Test mit manuellem Start** - `node server.js` zeigt echte Fehler, die systemd verschluckt
4. **Datenbank-Verbindung zuerst** - 90% der Probleme sind DB-bezogen

## 📝 Bekannte Probleme und Lösungen

### Problem: "FATAL: Peer authentication failed"
**Lösung:** PostgreSQL pg_hba.conf anpassen:
```bash
sudo nano /etc/postgresql/*/main/pg_hba.conf
# Ändere "peer" zu "md5" für local connections
sudo systemctl restart postgresql
```

### Problem: "permission denied" beim Schreiben von Logs
**Lösung:** Logs-Verzeichnis Rechte setzen:
```bash
sudo chown -R root:root /var/www/fmsv-dingden/Logs
sudo chmod -R 755 /var/www/fmsv-dingden/Logs
```

### Problem: "Module not found" trotz node_modules
**Lösung:** Cache löschen und neu installieren:
```bash
cd /var/www/fmsv-dingden/backend
sudo rm -rf node_modules package-lock.json
sudo npm install
```

---

**Erstellt:** 2025-10-30  
**Version:** 1.0
