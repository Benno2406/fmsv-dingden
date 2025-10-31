# pgAdmin 4 Troubleshooting & Repair

Wenn pgAdmin 4 beim Install nicht korrekt gestartet ist, hier die Lösung.

---

## ⚠️ **WICHTIG: Apache2 Problem**

**Das offizielle `/usr/pgadmin4/bin/setup-web.sh` Script installiert und startet Apache2!**

**Wir wollen das NICHT**, weil wir nginx verwenden!

### Symptom:
```
Apache successfully enabled.
Job for apache2.service failed because the control process exited with error code.
Error starting apache2. Please check the systemd logs
```

### Sofort-Lösung:
```bash
# Apache2 stoppen und deaktivieren
sudo systemctl stop apache2
sudo systemctl disable apache2

# Optional: Komplett entfernen
sudo apt-get remove --purge -y apache2 apache2-bin apache2-data apache2-utils
sudo apt-get autoremove -y

# pgAdmin neu starten (läuft OHNE Apache2!)
sudo systemctl start pgadmin4
```

**✅ pgAdmin funktioniert OHNE Apache2!** Es läuft als eigenständiger Python-Server auf Port 5050, nginx macht den Reverse Proxy.

---

## 🚨 **Problem: "ModuleNotFoundError: No module named 'flask'"**

### Symptom:
```
Traceback (most recent call last):
  File "/tmp/create_pgadmin_user.py", line 4, in <module>
    from pgadmin import create_app
  File "/usr/pgadmin4/web/pgadmin/__init__.py", line 24, in <module>
    from flask import Flask, abort, request, current_app, session, url_for
ModuleNotFoundError: No module named 'flask'
```

### Ursache:
pgAdmin4-web wurde installiert, aber die Python-Abhängigkeiten (Flask, etc.) fehlen oder sind nicht korrekt verlinkt.

### Lösung 1: Neuinstallation (empfohlen)

```bash
# Schritt 1: pgAdmin komplett entfernen
sudo systemctl stop pgadmin4
sudo systemctl disable pgadmin4
sudo apt-get remove --purge -y pgadmin4-web
sudo apt-get autoremove -y

# Schritt 2: Verzeichnisse bereinigen
sudo rm -rf /var/lib/pgadmin
sudo rm -rf /var/log/pgadmin
sudo rm -rf /usr/pgadmin4

# Schritt 3: Repository aktualisieren
sudo apt-get update

# Schritt 4: pgAdmin neu installieren MIT allen Dependencies
sudo apt-get install -y pgadmin4-web

# Schritt 5: Manuelle Setup mit dem offiziellen Script
sudo /usr/pgadmin4/bin/setup-web.sh

# Folge den Prompts:
# - Email: deine@email.com
# - Password: ******
# - Apache2 Setup? NO (wir nutzen nginx!)

# Schritt 6: Service neu erstellen
sudo systemctl daemon-reload
sudo systemctl enable pgadmin4
sudo systemctl start pgadmin4

# Schritt 7: Status prüfen
sudo systemctl status pgadmin4
```

### Lösung 2: Dependencies manuell installieren

Falls du pgAdmin nicht neu installieren möchtest:

```bash
# Python3-pip installieren
sudo apt-get install -y python3-pip python3-venv

# Prüfe ob pgAdmin eine venv verwendet
ls -la /usr/pgadmin4/

# Falls venv existiert, aktiviere sie:
source /usr/pgadmin4/venv/bin/activate

# Installiere Dependencies
pip3 install flask flask-login flask-mail werkzeug

# Deaktiviere venv
deactivate

# Service neu starten
sudo systemctl restart pgadmin4
```

### Lösung 3: Alternatives Setup (Docker)

Falls beide Lösungen nicht funktionieren, nutze Docker:

```bash
# pgAdmin als Docker Container (einfachste Lösung!)
docker run -d \
  --name pgadmin \
  -p 5050:80 \
  -e PGADMIN_DEFAULT_EMAIL=admin@fmsv-dingden.de \
  -e PGADMIN_DEFAULT_PASSWORD=dein-passwort \
  -v /var/lib/pgadmin:/var/lib/pgadmin \
  dpage/pgadmin4

# Zugriff via:
# http://localhost:5050
```

---

## 🚨 **Problem: pgAdmin Service startet nicht**

### Debug-Schritte:

#### 1. Status prüfen
```bash
sudo systemctl status pgadmin4
```

**Mögliche Ausgaben:**

**A) "Active: failed"**
```bash
# Logs ansehen:
sudo journalctl -u pgadmin4 -n 50

# Häufige Fehler:
# - Port 5050 belegt
# - Berechtigungen falsch
# - Python-Fehler
```

**B) "Unit not found"**
```bash
# Service existiert nicht - erstelle ihn:
sudo nano /etc/systemd/system/pgadmin4.service
```

Inhalt:
```ini
[Unit]
Description=pgAdmin 4 Web Service
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/usr/pgadmin4/web

# pgAdmin starten
ExecStart=/usr/bin/python3 /usr/pgadmin4/web/pgAdmin4.py

# Auto-Restart bei Fehler
Restart=always
RestartSec=10

# Logging
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

```bash
# Service aktivieren:
sudo systemctl daemon-reload
sudo systemctl enable pgadmin4
sudo systemctl start pgadmin4
```

#### 2. Manueller Start-Test
```bash
# Als www-data User testen:
sudo -u www-data python3 /usr/pgadmin4/web/pgAdmin4.py
```

**Mögliche Fehler:**

**A) "Permission denied"**
```bash
# Berechtigungen reparieren:
sudo chown -R www-data:www-data /var/lib/pgadmin
sudo chown -R www-data:www-data /var/log/pgadmin
sudo chmod 700 /var/lib/pgadmin
```

**B) "Address already in use"**
```bash
# Port 5050 ist belegt - finde Prozess:
sudo lsof -i :5050

# Prozess beenden:
sudo kill -9 <PID>

# Oder ändere Port in /var/lib/pgadmin/config_local.py:
DEFAULT_SERVER_PORT = 5051
```

**C) "No such file or directory"**
```bash
# pgAdmin ist nicht vollständig installiert:
sudo apt-get install --reinstall -y pgadmin4-web
```

#### 3. Konfiguration prüfen
```bash
# Config-Datei prüfen:
sudo cat /var/lib/pgadmin/config_local.py

# Sollte enthalten:
# SERVER_MODE = True
# DEFAULT_SERVER = '127.0.0.1'
# DEFAULT_SERVER_PORT = 5050
```

Falls Datei fehlt:
```bash
sudo mkdir -p /var/lib/pgadmin

sudo nano /var/lib/pgadmin/config_local.py
```

Inhalt:
```python
# pgAdmin 4 Konfiguration
import os

# Server Mode
SERVER_MODE = True

# Bind-Adresse (nur localhost, nginx proxied darauf)
DEFAULT_SERVER = '127.0.0.1'
DEFAULT_SERVER_PORT = 5050

# Session und Security
SECRET_KEY = 'ÄNDERE-MICH-ZUFÄLLIGER-STRING'
SECURITY_PASSWORD_SALT = 'ÄNDERE-MICH-AUCH'

# Datenverzeichnis
DATA_DIR = '/var/lib/pgadmin'
LOG_FILE = '/var/log/pgadmin/pgadmin4.log'
SQLITE_PATH = os.path.join(DATA_DIR, 'pgadmin4.db')
SESSION_DB_PATH = os.path.join(DATA_DIR, 'sessions')
STORAGE_DIR = os.path.join(DATA_DIR, 'storage')

# Disable Update Check
UPGRADE_CHECK_ENABLED = False
```

```bash
# Berechtigungen setzen:
sudo chown www-data:www-data /var/lib/pgadmin/config_local.py
sudo chmod 600 /var/lib/pgadmin/config_local.py
```

---

## 🚨 **Problem: pgAdmin läuft, aber nicht erreichbar**

### 1. Port prüfen
```bash
# Lauscht pgAdmin auf Port 5050?
sudo ss -tlnp | grep 5050

# Sollte zeigen:
# LISTEN    0    5    127.0.0.1:5050
```

Falls nichts:
```bash
# pgAdmin läuft nicht oder falscher Port
sudo systemctl status pgadmin4
```

### 2. nginx Proxy prüfen
```bash
# nginx Config prüfen:
sudo cat /etc/nginx/sites-available/pgadmin

# Sollte enthalten:
# proxy_pass http://127.0.0.1:5050;

# nginx testen:
sudo nginx -t

# nginx neu laden:
sudo systemctl reload nginx
```

### 3. Lokal testen
```bash
# Direkt auf Port 5050:
curl -I http://localhost:5050

# Sollte HTTP 200 oder 302 zurückgeben
```

Falls "Connection refused":
```bash
# pgAdmin läuft nicht korrekt
sudo journalctl -u pgadmin4 -f
```

### 4. Firewall prüfen
```bash
# Ist Port 5050 blockiert?
sudo ufw status

# Port sollte NICHT öffentlich sein (nur via nginx!)
```

---

## 🚨 **Problem: Login funktioniert nicht**

### 1. Admin-User existiert nicht
```bash
# User manuell erstellen:
cd /usr/pgadmin4/web

sudo -u www-data python3 << 'EOF'
import sys
sys.path.insert(0, '/usr/pgadmin4/web')

from pgadmin.setup import db, User
from werkzeug.security import generate_password_hash

# Erstelle App-Context
from pgadmin import create_app
app = create_app()

with app.app_context():
    # Datenbank initialisieren
    db.create_all()
    
    # User erstellen
    email = 'admin@fmsv-dingden.de'
    password = 'dein-passwort'
    
    user = User.query.filter_by(email=email).first()
    
    if not user:
        user = User(
            email=email,
            password=generate_password_hash(password),
            active=True,
            role=1  # Admin
        )
        db.session.add(user)
        db.session.commit()
        print(f'User {email} created!')
    else:
        print(f'User {email} already exists!')
EOF
```

### 2. Passwort vergessen
```bash
# Passwort zurücksetzen:
cd /usr/pgadmin4/web

sudo -u www-data python3 << 'EOF'
import sys
sys.path.insert(0, '/usr/pgadmin4/web')

from pgadmin.setup import db, User
from werkzeug.security import generate_password_hash
from pgadmin import create_app

app = create_app()

with app.app_context():
    email = 'admin@fmsv-dingden.de'
    new_password = 'neues-passwort'
    
    user = User.query.filter_by(email=email).first()
    
    if user:
        user.password = generate_password_hash(new_password)
        db.session.commit()
        print(f'Password for {email} updated!')
    else:
        print(f'User {email} not found!')
EOF
```

### 3. Datenbank korrupt
```bash
# SQLite-Datenbank neu erstellen:
sudo systemctl stop pgadmin4

# Backup erstellen (zur Sicherheit):
sudo cp /var/lib/pgadmin/pgadmin4.db /var/lib/pgadmin/pgadmin4.db.backup

# Datenbank löschen:
sudo rm /var/lib/pgadmin/pgadmin4.db

# Service starten (erstellt neue DB):
sudo systemctl start pgadmin4

# Admin-User neu erstellen (siehe oben)
```

---

## 🚨 **Problem: Cloudflare Tunnel funktioniert nicht**

### 1. DNS-Route prüfen
```bash
# Ist pgAdmin-Subdomain konfiguriert?
cloudflared tunnel route dns list | grep pgadmin

# Sollte zeigen:
# pgadmin.fmsv.bartholmes.eu → CNAME zu Tunnel
```

Falls nicht:
```bash
# Route hinzufügen:
cloudflared tunnel route dns fmsv-dingden pgadmin.fmsv.bartholmes.eu
```

### 2. Tunnel-Config prüfen
```bash
# Config ansehen:
cat ~/.cloudflared/config.yml | grep -A 5 pgadmin

# Sollte enthalten:
# - hostname: pgadmin.fmsv.bartholmes.eu
#   service: http://localhost:5050
```

Falls fehlt, hinzufügen (GANZ OBEN in ingress!):
```bash
sudo nano ~/.cloudflared/config.yml
```

```yaml
ingress:
  # pgAdmin - MUSS VOR der Hauptdomain stehen!
  - hostname: pgadmin.fmsv.bartholmes.eu
    service: http://localhost:5050
    originRequest:
      noTLSVerify: true
  
  # ... rest der Config ...
```

```bash
# Tunnel neu starten:
sudo systemctl restart cloudflared
```

### 3. Tunnel-Status prüfen
```bash
# Läuft der Tunnel?
sudo systemctl status cloudflared

# Logs ansehen:
sudo journalctl -u cloudflared -n 50

# Tunnel-Info:
cloudflared tunnel info fmsv-dingden
```

### 4. Lokal testen, dann via Tunnel
```bash
# 1. Lokal funktioniert?
curl -I http://localhost:5050
# ✅ Sollte 200/302 geben

# 2. Via nginx funktioniert?
curl -I http://localhost/
# (nginx sollte laufen)

# 3. Via Cloudflare Tunnel?
curl -I https://pgadmin.fmsv.bartholmes.eu
# ✅ Sollte auch 200/302 geben
```

---

## 🛠️ **Komplette Neuinstallation (Nuclear Option)**

Falls gar nichts mehr funktioniert:

```bash
# 1. ALLES entfernen
sudo systemctl stop pgadmin4 nginx cloudflared
sudo systemctl disable pgadmin4

sudo apt-get remove --purge -y pgadmin4-web
sudo apt-get autoremove -y

sudo rm -rf /var/lib/pgadmin
sudo rm -rf /var/log/pgadmin
sudo rm -rf /usr/pgadmin4
sudo rm /etc/systemd/system/pgadmin4.service
sudo rm /etc/nginx/sites-enabled/pgadmin
sudo rm /etc/nginx/sites-available/pgadmin

# 2. Repository neu hinzufügen
curl -fsS https://www.pgadmin.org/static/packages_pgadmin_org.pub | \
  sudo gpg --dearmor -o /usr/share/keyrings/packages-pgadmin-org.gpg

echo "deb [signed-by=/usr/share/keyrings/packages-pgadmin-org.gpg] https://ftp.postgresql.org/pub/pgadmin/pgadmin4/apt/$(lsb_release -cs) pgadmin4 main" | \
  sudo tee /etc/apt/sources.list.d/pgadmin4.list

sudo apt-get update

# 3. Neu installieren
sudo apt-get install -y pgadmin4-web

# 4. Offizielles Setup
sudo /usr/pgadmin4/bin/setup-web.sh
# Email: admin@fmsv-dingden.de
# Password: *****
# Apache2? NO

# 5. Service erstellen (siehe oben)
# 6. nginx Config erstellen (siehe oben)

# 7. Services starten
sudo systemctl daemon-reload
sudo systemctl start pgadmin4
sudo systemctl start nginx
sudo systemctl restart cloudflared

# 8. Testen
curl http://localhost:5050
```

---

## 📋 **Checkliste: pgAdmin funktioniert?**

- [ ] **1. pgAdmin Service läuft**
  ```bash
  sudo systemctl status pgadmin4
  # ✅ Active: active (running)
  ```

- [ ] **2. Port 5050 lauscht**
  ```bash
  sudo ss -tlnp | grep 5050
  # ✅ LISTEN ... 127.0.0.1:5050
  ```

- [ ] **3. Lokal erreichbar**
  ```bash
  curl -I http://localhost:5050
  # ✅ HTTP/1.1 200 OK oder 302
  ```

- [ ] **4. nginx Proxy funktioniert**
  ```bash
  sudo nginx -t
  # ✅ syntax is ok
  ```

- [ ] **5. Cloudflare Tunnel läuft**
  ```bash
  sudo systemctl status cloudflared
  # ✅ Active: active (running)
  ```

- [ ] **6. Via Browser erreichbar**
  - Lokal: `http://localhost:5050` ✅
  - Via Tunnel: `https://pgadmin.fmsv.bartholmes.eu` ✅

- [ ] **7. Login funktioniert**
  - E-Mail und Passwort eingeben ✅
  - pgAdmin Dashboard erscheint ✅

---

## 💡 **Tipps**

### Automatisches Monitoring

Erstelle ein Monitoring-Script:

```bash
sudo nano /usr/local/bin/check-pgadmin.sh
```

```bash
#!/bin/bash

echo "=== pgAdmin Health Check ==="
echo ""

# Service Status
if systemctl is-active --quiet pgadmin4; then
    echo "✅ Service läuft"
else
    echo "❌ Service läuft NICHT"
    echo "   Starte neu..."
    systemctl start pgadmin4
fi

# Port Check
if ss -tln | grep -q ":5050"; then
    echo "✅ Port 5050 lauscht"
else
    echo "❌ Port 5050 lauscht NICHT"
fi

# HTTP Check
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5050 | grep -q "200\|302"; then
    echo "✅ HTTP Response OK"
else
    echo "❌ HTTP Response FEHLER"
fi

echo ""
echo "=== Ende Health Check ==="
```

```bash
chmod +x /usr/local/bin/check-pgadmin.sh

# In Cron eintragen (alle 5 Minuten):
sudo crontab -e
```

```cron
*/5 * * * * /usr/local/bin/check-pgadmin.sh >> /var/log/pgadmin-health.log 2>&1
```

---

## 📚 **Weitere Hilfe**

- **Offizielle Docs:** https://www.pgadmin.org/docs/
- **Installation Guide:** https://www.pgadmin.org/download/pgadmin-4-apt/
- **Forum:** https://www.postgresql.org/community/

---

**Problem gelöst?** Großartig! 🎉

**Nicht gelöst?** Öffne ein Issue mit:
- Ausgabe von `systemctl status pgadmin4`
- Ausgabe von `journalctl -u pgadmin4 -n 50`
- Betriebssystem & Version
