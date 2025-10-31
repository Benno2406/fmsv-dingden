# pgAdmin 4 OHNE Apache2 - Setup-Guide

Diese Anleitung erklärt, warum und wie pgAdmin **ohne Apache2** läuft.

---

## ❓ **Warum OHNE Apache2?**

### Das Problem mit Apache2

Das offizielle pgAdmin Setup-Script (`/usr/pgadmin4/bin/setup-web.sh`) ist darauf ausgelegt, mit Apache2 zu arbeiten:

```
/usr/pgadmin4/bin/setup-web.sh
  ↓
Installiert Apache2 automatisch
  ↓
Konfiguriert Apache2 als Reverse Proxy
  ↓
Startet Apache2
```

**Aber wir wollen nginx verwenden!**

### Probleme mit Apache2 + nginx

1. **Port-Konflikt**: Beide wollen Port 80/443
2. **Ressourcen-Verschwendung**: Zwei Webserver parallel
3. **Komplexität**: Zwei Configs pflegen
4. **Sicherheit**: Mehr Angriffsfläche

### Unsere Lösung: Server Mode

```
pgAdmin 4 Python Server (Port 5050)
  ↓
nginx Reverse Proxy (Port 80/443)
  ↓
Internet
```

✅ **Nur ein Webserver** (nginx)  
✅ **Kein Apache2** benötigt  
✅ **pgAdmin läuft standalone** als Python-Prozess  
✅ **Einfacher & sicherer**

---

## 🏗️ **Architektur**

### Komponenten:

```
┌─────────────────────────────────────────────────────────┐
│                    Internet / Cloudflare                │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ↓
        ┌──────────────────────────────┐
        │   nginx (Port 80/443)       │
        │   Reverse Proxy             │
        └──────────────┬───────────────┘
                       │
        ┌──────────────┴───────────────┐
        │                              │
        ↓                              ↓
┌────────────────┐          ┌──────────────────────┐
│ FMSV Backend   │          │ pgAdmin Python       │
│ (Port 3000)    │          │ (Port 5050)         │
│ Node.js        │          │ Flask/Werkzeug      │
└────────────────┘          └──────────────────────┘
```

### Datenfluss:

1. **Request:** `https://pgadmin.fmsv.bartholmes.eu`
2. **Cloudflare Tunnel:** Leitet zu nginx
3. **nginx:** Erkennt Subdomain, proxied zu `localhost:5050`
4. **pgAdmin:** Antwortet direkt (kein Apache2!)

---

## 🚀 **Installation (richtig)**

### Schritt 1: pgAdmin installieren

```bash
# Package installieren
sudo apt-get install -y pgadmin4-web
```

### Schritt 2: Konfiguration erstellen

**NICHT** das offizielle Setup verwenden!

```bash
# Config-Verzeichnis
sudo mkdir -p /var/lib/pgadmin
sudo mkdir -p /var/log/pgadmin

# Konfigurationsdatei
sudo nano /var/lib/pgadmin/config_local.py
```

Inhalt:
```python
# pgAdmin 4 Server Mode Configuration
import os

# Server Mode aktivieren (kein Apache2!)
SERVER_MODE = True

# Bind auf localhost (nginx proxied darauf)
DEFAULT_SERVER = '127.0.0.1'
DEFAULT_SERVER_PORT = 5050

# Security
SECRET_KEY = 'ÄNDERE-MICH-ZU-ZUFÄLLIGEM-STRING'
SECURITY_PASSWORD_SALT = 'ÄNDERE-MICH-AUCH'

# Datenverzeichnisse
DATA_DIR = '/var/lib/pgadmin'
LOG_FILE = '/var/log/pgadmin/pgadmin4.log'
SQLITE_PATH = os.path.join(DATA_DIR, 'pgadmin4.db')
SESSION_DB_PATH = os.path.join(DATA_DIR, 'sessions')
STORAGE_DIR = os.path.join(DATA_DIR, 'storage')

# Disable Update Check
UPGRADE_CHECK_ENABLED = False
```

### Schritt 3: Berechtigungen

```bash
sudo chown -R www-data:www-data /var/lib/pgadmin
sudo chown -R www-data:www-data /var/log/pgadmin
sudo chmod 700 /var/lib/pgadmin
```

### Schritt 4: Datenbank initialisieren

```bash
cd /usr/pgadmin4/web

sudo -u www-data python3 << 'EOF'
import sys
sys.path.insert(0, '/usr/pgadmin4/web')

from pgadmin.model import db
from pgadmin import create_app

app = create_app()

with app.app_context():
    db.create_all()
    print("✅ Datenbank initialisiert!")
EOF
```

### Schritt 5: Admin-User erstellen

```bash
cd /usr/pgadmin4/web

sudo -u www-data python3 << 'EOF'
import sys
sys.path.insert(0, '/usr/pgadmin4/web')

from pgadmin.model import db, User
from werkzeug.security import generate_password_hash
from pgadmin import create_app

app = create_app()

with app.app_context():
    email = 'admin@fmsv-dingden.de'
    password = 'dein-sicheres-passwort'
    
    user = User(
        email=email,
        password=generate_password_hash(password),
        active=True,
        role=1  # Administrator
    )
    
    db.session.add(user)
    db.session.commit()
    
    print(f"✅ Admin-User erstellt: {email}")
EOF
```

### Schritt 6: systemd Service

```bash
sudo nano /etc/systemd/system/pgadmin4.service
```

Inhalt:
```ini
[Unit]
Description=pgAdmin 4 Web Service (Server Mode)
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/usr/pgadmin4/web

# pgAdmin Python Server starten (KEIN Apache2!)
ExecStart=/usr/bin/python3 /usr/pgadmin4/web/pgAdmin4.py

# Auto-Restart
Restart=always
RestartSec=10

# Logging
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

```bash
# Service aktivieren
sudo systemctl daemon-reload
sudo systemctl enable pgadmin4
sudo systemctl start pgadmin4

# Status prüfen
sudo systemctl status pgadmin4
```

### Schritt 7: nginx Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/pgadmin
```

Inhalt:
```nginx
# pgAdmin 4 - PostgreSQL Web Interface
server {
    listen 80;
    server_name pgadmin.fmsv.bartholmes.eu;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    location / {
        # Proxy zu pgAdmin Python Server
        proxy_pass http://127.0.0.1:5050;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_buffering off;
        
        # Timeouts
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
        proxy_read_timeout 300;
        send_timeout 300;
    }
}
```

```bash
# Config aktivieren
sudo ln -sf /etc/nginx/sites-available/pgadmin /etc/nginx/sites-enabled/

# nginx testen & neu laden
sudo nginx -t
sudo systemctl reload nginx
```

---

## ✅ **Verifikation**

### 1. pgAdmin läuft?
```bash
sudo systemctl status pgadmin4
# ✅ Active: active (running)
```

### 2. Port 5050 lauscht?
```bash
sudo ss -tlnp | grep 5050
# ✅ LISTEN ... 127.0.0.1:5050 ... python3
```

### 3. Direkt erreichbar?
```bash
curl -I http://localhost:5050
# ✅ HTTP/1.1 200 OK oder 302 Found
```

### 4. Via nginx erreichbar?
```bash
curl -I http://localhost -H "Host: pgadmin.fmsv.bartholmes.eu"
# ✅ HTTP/1.1 200 OK oder 302 Found
```

### 5. Apache2 läuft NICHT?
```bash
systemctl is-active apache2
# ❌ inactive (oder command not found)
```

---

## 🚫 **Was NICHT zu tun ist**

### ❌ setup-web.sh verwenden

```bash
# NIEMALS DIES AUSFÜHREN:
sudo /usr/pgadmin4/bin/setup-web.sh
```

**Warum nicht?**
- Installiert Apache2 automatisch
- Konfiguriert Apache2 statt nginx
- Erstellt Apache2 VirtualHost
- Startet Apache2 Service

**Ergebnis:** Port-Konflikt mit nginx!

### Falls du es doch getan hast:

```bash
# Apache2 stoppen & entfernen
sudo systemctl stop apache2
sudo systemctl disable apache2
sudo apt-get remove --purge -y apache2 apache2-bin apache2-data apache2-utils
sudo apt-get autoremove -y

# pgAdmin neu starten (läuft ohne Apache2!)
sudo systemctl restart pgadmin4
```

---

## 🔧 **Troubleshooting**

### Problem: Apache2 läuft

**Symptom:**
```bash
sudo systemctl status apache2
# Active: active (running)
```

**Lösung:**
```bash
# Stoppen
sudo systemctl stop apache2
sudo systemctl disable apache2

# Optional: Komplett entfernen
sudo apt-get remove --purge -y apache2 apache2-bin
sudo apt-get autoremove -y

# pgAdmin läuft weiter!
sudo systemctl status pgadmin4
```

### Problem: Port 5050 nicht erreichbar

**Debug:**
```bash
# Läuft pgAdmin?
sudo systemctl status pgadmin4

# Lauscht Port 5050?
sudo ss -tlnp | grep 5050

# Logs prüfen
sudo journalctl -u pgadmin4 -n 50
```

**Häufige Ursachen:**
- Berechtigungen falsch → siehe Schritt 3
- Config fehlt → siehe Schritt 2
- Service nicht gestartet → `sudo systemctl start pgadmin4`

### Problem: Login funktioniert nicht

**User erstellen:**
```bash
cd /usr/pgadmin4/web
sudo -u www-data python3 << 'EOF'
import sys
sys.path.insert(0, '/usr/pgadmin4/web')

from pgadmin.model import db, User
from werkzeug.security import generate_password_hash
from pgadmin import create_app

app = create_app()

with app.app_context():
    # Deine Login-Daten:
    email = 'deine@email.de'
    password = 'dein-passwort'
    
    # User erstellen oder aktualisieren
    user = User.query.filter_by(email=email).first()
    
    if user:
        # Passwort zurücksetzen
        user.password = generate_password_hash(password)
        print(f"✅ Passwort aktualisiert für {email}")
    else:
        # Neuen User erstellen
        user = User(
            email=email,
            password=generate_password_hash(password),
            active=True,
            role=1
        )
        db.session.add(user)
        print(f"✅ User erstellt: {email}")
    
    db.session.commit()
EOF
```

---

## 📊 **Vergleich: Apache2 vs. Server Mode**

| Feature | Mit Apache2 | Server Mode (unsere Lösung) |
|---------|-------------|------------------------------|
| **Webserver** | Apache2 + nginx | Nur nginx |
| **pgAdmin** | WSGI-Modul | Python Standalone |
| **Ressourcen** | 2x Webserver | 1x Webserver |
| **Ports** | 80 (Apache), 80 (nginx) KONFLIKT! | 5050 (pgAdmin), 80 (nginx) ✅ |
| **Komplexität** | 2 Configs (Apache + nginx) | 1 Config (nginx) |
| **Setup** | `setup-web.sh` | Manuell |
| **Wartung** | Apache + nginx Updates | Nur nginx Updates |
| **Performance** | Langsamer (2 Proxies) | Schneller (1 Proxy) |

---

## 💡 **Best Practices**

### 1. Sicherheit

```bash
# pgAdmin nur auf localhost binden
DEFAULT_SERVER = '127.0.0.1'  # NICHT 0.0.0.0!

# nginx macht den öffentlichen Zugang
# Mit IP-Whitelist oder Cloudflare Access
```

### 2. Monitoring

```bash
# Watchdog-Script
sudo nano /usr/local/bin/pgadmin-watchdog.sh
```

```bash
#!/bin/bash

if ! systemctl is-active --quiet pgadmin4; then
    echo "pgAdmin ist down - starte neu..."
    systemctl start pgadmin4
fi

if ! ss -tln | grep -q ":5050"; then
    echo "Port 5050 lauscht nicht - starte pgAdmin neu..."
    systemctl restart pgadmin4
fi
```

```bash
chmod +x /usr/local/bin/pgadmin-watchdog.sh

# Cron (alle 5 Minuten)
sudo crontab -e
```

```cron
*/5 * * * * /usr/local/bin/pgadmin-watchdog.sh >> /var/log/pgadmin-watchdog.log 2>&1
```

### 3. Backups

```bash
# Datenbank sichern
sudo cp /var/lib/pgadmin/pgadmin4.db /root/backups/pgadmin4.db.$(date +%Y%m%d)

# Logs sichern
sudo tar -czf /root/backups/pgadmin-logs-$(date +%Y%m%d).tar.gz /var/log/pgadmin/
```

---

## 📚 **Weitere Ressourcen**

- [pgAdmin-Setup.md](pgAdmin-Setup.md) - Haupt-Setup-Anleitung
- [pgAdmin-Troubleshooting.md](pgAdmin-Troubleshooting.md) - Problemlösung
- [pgAdmin-Sicherheits-Checkliste.md](pgAdmin-Sicherheits-Checkliste.md) - Security
- [Cloudflare-Access-pgAdmin.md](Cloudflare-Access-pgAdmin.md) - Zero-Trust

---

## ✨ **Zusammenfassung**

✅ **pgAdmin läuft als Python Server** (Port 5050)  
✅ **nginx macht Reverse Proxy** (Port 80/443)  
✅ **KEIN Apache2 benötigt**  
✅ **Einfacher & sicherer**  
✅ **Weniger Ressourcen**  
✅ **Bessere Performance**

**Apache2 ist NICHT Teil dieser Installation!**

Falls Apache2 trotzdem installiert wurde:
```bash
sudo ./Installation/scripts/fix-pgadmin.sh
# Option 4: Apache2 entfernen
```

---

**Happy pgAdmin-ing! 🚀🐘**
