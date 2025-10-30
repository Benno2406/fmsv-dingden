# 🔴 500 Internal Server Error - Diagnose & Lösung

## Was bedeutet der 500 Fehler?

Der **500 Internal Server Error** bedeutet, dass:
- ✅ nginx läuft (sonst würde "Connection Refused" erscheinen)
- ❌ Das Node.js Backend NICHT läuft oder abgestürzt ist
- ❌ nginx kann das Backend nicht erreichen

---

## 🔍 Schritt 1: Backend-Status prüfen

Prüfe ob das Backend läuft:

```bash
systemctl status fmsv-backend
```

### ✅ Backend läuft
Wenn du `active (running)` siehst → Weiter zu Schritt 2

### ❌ Backend läuft NICHT
Wenn du `inactive (dead)` oder `failed` siehst:

```bash
# Zeige die letzten Fehlermeldungen
journalctl -u fmsv-backend -n 50 --no-pager

# Oder mit Echtzeit-Anzeige
journalctl -u fmsv-backend -f
```

---

## 🔍 Schritt 2: Häufige Fehlerursachen

### A) Datenbank nicht initialisiert

**Symptom:** Backend-Logs zeigen Datenbank-Fehler

**Lösung:**
```bash
cd /var/www/fmsv-dingden/backend
node scripts/initDatabase.js
```

Wenn Fehler auftreten:
```bash
# Prüfe ob schema.sql existiert
ls -la /var/www/fmsv-dingden/backend/database/schema.sql

# Prüfe PostgreSQL Status
systemctl status postgresql

# Prüfe ob Datenbank existiert
su - postgres -c "psql -l" | grep fmsv
```

---

### B) PostgreSQL läuft nicht

**Symptom:** `ECONNREFUSED` Fehler in den Logs

**Lösung:**
```bash
# Starte PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Prüfe Status
systemctl status postgresql

# Dann Backend neu starten
systemctl restart fmsv-backend
```

---

### C) Datenbank-Credentials falsch

**Symptom:** `password authentication failed` in den Logs

**Lösung:**
```bash
# Prüfe .env Datei
cat /var/www/fmsv-dingden/backend/.env | grep DB_

# Teste Verbindung manuell
psql -h localhost -U fmsv_user -d fmsv_database -W
# (Passwort aus .env Datei eingeben)
```

Wenn Login fehlschlägt:
```bash
# Setze Passwort neu
su - postgres
psql
ALTER USER fmsv_user WITH PASSWORD 'NEUES_PASSWORT';
\q
exit

# Aktualisiere .env
nano /var/www/fmsv-dingden/backend/.env
# → DB_PASSWORD=NEUES_PASSWORT ändern

# Backend neu starten
systemctl restart fmsv-backend
```

---

### D) Port 3000 bereits belegt

**Symptom:** `EADDRINUSE` oder Port-Fehler in den Logs

**Lösung:**
```bash
# Prüfe was auf Port 3000 läuft
netstat -tulpn | grep :3000
# oder
lsof -i :3000

# Stoppe den anderen Prozess oder ändere Port in .env
nano /var/www/fmsv-dingden/backend/.env
# → PORT=3001 ändern

# nginx Konfiguration anpassen
nano /etc/nginx/sites-available/fmsv-dingden
# → proxy_pass http://localhost:3001 ändern

# Services neu starten
systemctl restart fmsv-backend
systemctl restart nginx
```

---

### E) Fehlende Dependencies

**Symptom:** `Cannot find module` in den Logs

**Lösung:**
```bash
cd /var/www/fmsv-dingden/backend
npm install --production

# Backend neu starten
systemctl restart fmsv-backend
```

---

### F) Dateiberechtigungen

**Symptom:** `EACCES` oder Permission-Fehler

**Lösung:**
```bash
# Setze korrekte Berechtigungen
chown -R www-data:www-data /var/www/fmsv-dingden
chmod -R 755 /var/www/fmsv-dingden

# Spezielle Verzeichnisse
chmod 700 /var/www/fmsv-dingden/Saves
chmod 700 /var/www/fmsv-dingden/Logs

# Backend neu starten
systemctl restart fmsv-backend
```

---

## 🔍 Schritt 3: Manueller Backend-Test

Teste das Backend manuell (ohne systemd):

```bash
cd /var/www/fmsv-dingden/backend

# Als www-data User
sudo -u www-data node server.js
```

**Erwartete Ausgabe:**
```
🚀 Server läuft auf Port 3000
📊 Datenbank-Verbindung erfolgreich
```

Wenn Fehler erscheinen → Lies die Fehlermeldung genau!

**Beende mit:** `Strg + C`

Wenn es manuell funktioniert:
```bash
systemctl start fmsv-backend
systemctl status fmsv-backend
```

---

## 🔍 Schritt 4: nginx Konfiguration prüfen

```bash
# Teste nginx Config
nginx -t

# Zeige aktuelle Config
cat /etc/nginx/sites-available/fmsv-dingden | grep -A5 "location /api"

# Prüfe ob Symlink existiert
ls -la /etc/nginx/sites-enabled/ | grep fmsv
```

**Korrigiere nginx:**
```bash
# Link neu erstellen
ln -sf /etc/nginx/sites-available/fmsv-dingden /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# nginx neu starten
systemctl restart nginx
```

---

## 🔍 Schritt 5: Kompletter Neustart

Wenn alles andere fehlschlägt:

```bash
# 1. Stoppe alle Services
systemctl stop fmsv-backend
systemctl stop nginx
systemctl stop postgresql

# 2. Starte in der richtigen Reihenfolge
systemctl start postgresql
sleep 2
systemctl start fmsv-backend
sleep 2
systemctl start nginx

# 3. Prüfe Status
systemctl status postgresql
systemctl status fmsv-backend
systemctl status nginx

# 4. Teste im Browser
curl http://localhost
curl http://localhost/api/health
```

---

## 📋 Vollständiger Diagnose-Befehl

Führe alle Checks auf einmal aus:

```bash
cat << 'EOF' | bash
echo "═══════════════════════════════════════════════════════════"
echo "🔍 FMSV Backend Diagnose"
echo "═══════════════════════════════════════════════════════════"
echo ""

echo "1️⃣  PostgreSQL Status:"
systemctl status postgresql --no-pager -l | head -5
echo ""

echo "2️⃣  Backend Status:"
systemctl status fmsv-backend --no-pager -l | head -10
echo ""

echo "3️⃣  nginx Status:"
systemctl status nginx --no-pager -l | head -5
echo ""

echo "4️⃣  Port-Belegung:"
echo "   Port 3000 (Backend):"
netstat -tulpn 2>/dev/null | grep :3000 || echo "   ✗ Nicht belegt"
echo "   Port 80 (nginx):"
netstat -tulpn 2>/dev/null | grep :80 || echo "   ✗ Nicht belegt"
echo ""

echo "5️⃣  Schema-Datei:"
if [ -f /var/www/fmsv-dingden/backend/database/schema.sql ]; then
    echo "   ✓ schema.sql existiert"
else
    echo "   ✗ schema.sql FEHLT!"
fi
echo ""

echo "6️⃣  Backend Logs (letzte 10 Zeilen):"
journalctl -u fmsv-backend -n 10 --no-pager
echo ""

echo "7️⃣  Datenbank-Verbindung:"
su - postgres -c "psql -l" | grep fmsv || echo "   ✗ Datenbank nicht gefunden"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "✅ Diagnose abgeschlossen"
echo "═══════════════════════════════════════════════════════════"
EOF
```

---

## 🚀 Quick-Fix (meistens hilft das)

```bash
# Alles in einem Befehl
cd /var/www/fmsv-dingden/backend && \
node scripts/initDatabase.js && \
systemctl restart fmsv-backend && \
sleep 2 && \
systemctl restart nginx && \
echo "✅ Services neu gestartet" && \
systemctl status fmsv-backend --no-pager
```

---

## 📞 Weitere Hilfe

Wenn der Fehler weiterhin besteht:

1. **Logs sammeln:**
   ```bash
   journalctl -u fmsv-backend -n 100 > /tmp/backend-logs.txt
   cat /var/log/fmsv-install.log > /tmp/install-logs.txt
   ```

2. **Schema prüfen:**
   ```bash
   ls -la /var/www/fmsv-dingden/backend/database/
   head -20 /var/www/fmsv-dingden/backend/database/schema.sql
   ```

3. **Environment prüfen:**
   ```bash
   cat /var/www/fmsv-dingden/backend/.env
   ```

4. **Installation neu durchführen:**
   ```bash
   cd /var/www/fmsv-dingden/Installation/scripts
   ./install.sh
   ```

---

## 🎯 Zusammenfassung

Der 500 Fehler kommt **fast immer** daher, dass:

1. ❌ **Datenbank nicht initialisiert** → `node scripts/initDatabase.js`
2. ❌ **Backend läuft nicht** → `systemctl start fmsv-backend`
3. ❌ **PostgreSQL läuft nicht** → `systemctl start postgresql`
4. ❌ **Falsche DB-Credentials** → `.env` Datei prüfen

**Standard-Lösungsweg:**
```bash
# 1. Datenbank initialisieren
cd /var/www/fmsv-dingden/backend
node scripts/initDatabase.js

# 2. Backend starten
systemctl restart fmsv-backend

# 3. Status prüfen
systemctl status fmsv-backend

# 4. Logs ansehen falls fehlgeschlagen
journalctl -u fmsv-backend -n 50
```
