# Backend Diagnose & Fehlerbehebung

## Quick Commands

Die Installation hat automatisch folgende Diagnose-Tools installiert:

```bash
fmsv-test      # Backend Test & Diagnose
fmsv-errors    # Zeige Backend Fehler
fmsv-manual    # Backend manuell starten (Debug-Modus)
fmsv-fix       # Automatische Problembehebung
fmsv-debug     # Vollständige System-Diagnose
```

## Backend ist nicht erreichbar

### Symptome
- `curl http://localhost:3000/api/health` funktioniert nicht
- Frontend zeigt "Network Error" oder "API nicht erreichbar"
- Login schlägt fehl

### Schritt-für-Schritt Diagnose

#### 1. Service Status prüfen
```bash
systemctl status fmsv-backend
```

**Erwartete Ausgabe**: `active (running)`

Falls nicht aktiv:
```bash
systemctl start fmsv-backend
systemctl status fmsv-backend
```

#### 2. Port prüfen
```bash
netstat -tulpn | grep 3000
# oder
ss -tulpn | grep 3000
```

**Erwartete Ausgabe**: Zeile mit `node` oder `fmsv-backend` auf Port 3000

Falls Port nicht offen:
```bash
# Backend neu starten
systemctl restart fmsv-backend
sleep 3
netstat -tulpn | grep 3000
```

#### 3. API-Test
```bash
curl -v http://localhost:3000/api/health
```

**Erwartete Ausgabe**: HTTP 200 mit JSON Response

Falls Fehler:
```bash
# Prüfe Backend-Logs
journalctl -u fmsv-backend -n 50
```

#### 4. Firewall prüfen
```bash
ufw status | grep 3000
```

Falls nicht erlaubt:
```bash
ufw allow 3000/tcp
```

#### 5. .env Datei prüfen
```bash
cat /var/www/fmsv-dingden/backend/.env
```

Prüfe:
- `PORT=3000` ist gesetzt
- `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` sind korrekt
- `JWT_SECRET` und `JWT_REFRESH_SECRET` sind gesetzt

#### 6. Datenbank-Verbindung testen
```bash
# Als postgres User
su - postgres -c "psql -d fmsv_database -c 'SELECT 1;'"
```

Falls Fehler → Datenbank-Credentials in `.env` prüfen

## Häufige Fehler

### Fehler: "EADDRINUSE - Port 3000 already in use"

**Problem**: Ein anderer Prozess blockiert Port 3000

**Lösung**:
```bash
# Finde den Prozess
lsof -i :3000
# oder
netstat -tulpn | grep :3000

# Beende den Prozess (PID aus obigem Befehl)
kill -9 PID

# Backend neu starten
systemctl restart fmsv-backend
```

### Fehler: "Cannot connect to database"

**Problem**: Datenbank-Verbindung fehlgeschlagen

**Lösung**:
```bash
# 1. Prüfe ob PostgreSQL läuft
systemctl status postgresql

# 2. Falls nicht aktiv
systemctl start postgresql

# 3. Teste Verbindung manuell
source /var/www/fmsv-dingden/backend/.env
su - postgres -c "psql -d $DB_NAME -U $DB_USER"

# 4. Falls Fehler → Passwort oder User falsch
# Setze neues Passwort:
su - postgres -c "psql"
# Im psql:
ALTER USER fmsv_user WITH PASSWORD 'neues_passwort';
\q

# 5. Update .env mit neuem Passwort
nano /var/www/fmsv-dingden/backend/.env

# 6. Backend neu starten
systemctl restart fmsv-backend
```

### Fehler: "Cannot find module ..."

**Problem**: Node Modules fehlen oder sind beschädigt

**Lösung**:
```bash
cd /var/www/fmsv-dingden/backend
rm -rf node_modules package-lock.json
npm install --production
systemctl restart fmsv-backend
```

### Fehler: "JWT secret is not defined"

**Problem**: JWT_SECRET fehlt in .env

**Lösung**:
```bash
cd /var/www/fmsv-dingden/backend

# Generiere neue Secrets
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# Füge zu .env hinzu
echo "" >> .env
echo "JWT_SECRET=$JWT_SECRET" >> .env
echo "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET" >> .env

# Backend neu starten
systemctl restart fmsv-backend
```

### Fehler: "Maximum call stack size exceeded"

**Problem**: Zirkuläre Dependencies oder rekursive Funktionen

**Lösung**:
```bash
# Prüfe backend Version
cd /var/www/fmsv-dingden
git log -1

# Update auf neueste Version
git pull origin main
cd backend
npm install --production
systemctl restart fmsv-backend
```

## Nginx Proxy Probleme

### Frontend erreicht Backend nicht

**Problem**: Nginx leitet /api/* nicht korrekt weiter

**Lösung**:
```bash
# Prüfe Nginx Config
cat /etc/nginx/sites-enabled/fmsv-dingden

# Sollte enthalten:
# location /api/ {
#     proxy_pass http://localhost:3000;
#     ...
# }

# Falls fehlt → Config neu erstellen
nano /etc/nginx/sites-enabled/fmsv-dingden

# Nginx testen und neu laden
nginx -t
systemctl reload nginx
```

### Beispiel Nginx Config für /api/
```nginx
location /api/ {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

## Performance Probleme

### Backend ist langsam

**Diagnose**:
```bash
# Prüfe CPU & RAM
htop

# Prüfe Backend-Prozess
ps aux | grep node

# Prüfe Logs auf langsame Queries
journalctl -u fmsv-backend -n 200 | grep -i "slow\|timeout"
```

**Optimierung**:
```bash
# Erhöhe Node.js Memory Limit
nano /etc/systemd/system/fmsv-backend.service

# Füge hinzu in [Service]:
Environment="NODE_OPTIONS=--max-old-space-size=2048"

# Reload und restart
systemctl daemon-reload
systemctl restart fmsv-backend
```

### Datenbank ist langsam

```bash
# PostgreSQL Performance Monitoring
su - postgres -c "psql -d fmsv_database"

# Im psql:
SELECT * FROM pg_stat_activity;
SELECT schemaname, tablename, n_tup_ins, n_tup_upd, n_tup_del FROM pg_stat_user_tables;
```

## Debugging im Detail

### Backend manuell starten (Debug-Modus)

```bash
# Nutze das fmsv-manual Script
fmsv-manual

# Oder manuell:
systemctl stop fmsv-backend
cd /var/www/fmsv-dingden/backend
NODE_ENV=development node server.js
```

Dies startet das Backend im Vordergrund und zeigt alle Logs direkt an.

### Live-Logs verfolgen

```bash
# Backend Logs
journalctl -u fmsv-backend -f

# Nginx Logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# Alle relevanten Logs gleichzeitig
multitail \
  /var/log/nginx/error.log \
  /var/log/nginx/access.log \
  -l "journalctl -u fmsv-backend -f"
```

### Node.js Debugging

```bash
# Mit Node Inspector
systemctl stop fmsv-backend
cd /var/www/fmsv-dingden/backend
node --inspect server.js

# In einem anderen Terminal:
# Chrome öffnen: chrome://inspect
```

## Automatische Diagnose

### Quick Fix ausführen
```bash
fmsv-fix
```

Dieser Befehl:
- Prüft alle Services
- Startet gestoppte Services neu
- Korrigiert Firewall-Regeln
- Setzt Berechtigungen
- Testet API-Erreichbarkeit

### Vollständige Diagnose
```bash
fmsv-debug
```

Dieser Befehl:
- Prüft alle System-Komponenten
- Zeigt detaillierte Logs
- Gibt Empfehlungen zur Fehlerbehebung

### Backend spezifischer Test
```bash
fmsv-test
```

Dieser Befehl testet:
- Service Status
- Port Verfügbarkeit
- API Erreichbarkeit
- Environment Variablen
- Datenbank-Verbindung
- Nginx Proxy
- Firewall-Regeln

## Checkliste: Backend ist nicht erreichbar

Führe diese Schritte nacheinander aus:

- [ ] `systemctl status fmsv-backend` - läuft der Service?
- [ ] `netstat -tulpn | grep 3000` - ist Port 3000 offen?
- [ ] `curl http://localhost:3000/api/health` - antwortet die API?
- [ ] `ufw status | grep 3000` - ist Port in Firewall erlaubt?
- [ ] `cat /var/www/fmsv-dingden/backend/.env` - ist .env korrekt?
- [ ] `journalctl -u fmsv-backend -n 50` - gibt es Fehler in Logs?
- [ ] `systemctl status postgresql` - läuft die Datenbank?
- [ ] `nginx -t` - ist Nginx Config korrekt?

Falls alle Punkte OK sind, aber Backend immer noch nicht erreichbar:
```bash
fmsv-fix  # Automatische Reparatur
```

## Support & Logs

### Log-Dateien Übersicht
```
/var/log/fmsv-install.log           # Installations-Log
/var/log/fmsv-quickfix.log          # Quick-Fix Log
/var/log/fmsv-auto-update.log       # Auto-Update Log
/var/log/nginx/error.log            # Nginx Fehler
/var/log/nginx/access.log           # Nginx Zugriffe
/var/log/apache2/pgadmin_error.log  # pgAdmin Fehler
journalctl -u fmsv-backend          # Backend Service Logs
journalctl -u cloudflared           # Cloudflare Tunnel Logs
```

### Log-Sammlung für Support
```bash
# Sammle alle relevanten Logs
cat > /tmp/fmsv-debug-info.txt <<EOF
=== System Info ===
$(uname -a)
$(cat /etc/os-release)

=== Service Status ===
$(systemctl status fmsv-backend --no-pager)
$(systemctl status nginx --no-pager)
$(systemctl status postgresql --no-pager)

=== Port Check ===
$(netstat -tulpn | grep -E ':80|:443|:3000|:1880|:18443|:5432')

=== Backend Logs ===
$(journalctl -u fmsv-backend -n 100 --no-pager)

=== Nginx Config ===
$(cat /etc/nginx/sites-enabled/fmsv-dingden)

=== Environment ===
PORT and DB settings (passwords hidden)
EOF

echo "Debug-Info gespeichert in: /tmp/fmsv-debug-info.txt"
cat /tmp/fmsv-debug-info.txt
```

---

**Wichtig**: Bei persistierenden Problemen immer zuerst `fmsv-test` und `fmsv-fix` ausführen!
