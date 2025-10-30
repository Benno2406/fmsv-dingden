# Nginx startet nicht - Problemlösung

## 🎯 Problem

Bei der Installation erscheint:
```
❌ Job for nginx.service failed because the control process exited with error code.
```

---

## 🔍 Schnell-Diagnose

### Schritt 1: Nginx Status prüfen

```bash
systemctl status nginx
```

**Achte auf:**
- `Active:` - sollte `active (running)` sein
- Fehlermeldungen in rot
- Port-Konflikte

---

### Schritt 2: Nginx Konfiguration testen

```bash
nginx -t
```

**Mögliche Ausgaben:**

✅ **Erfolgreich:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

❌ **Fehler:**
```
nginx: [emerg] open() "/var/www/fmsv-dingden/dist/index.html" failed (2: No such file or directory)
```
→ **Lösung:** Frontend muss gebaut werden! Siehe unten.

---

### Schritt 3: Nginx Error Log ansehen

```bash
tail -50 /var/log/nginx/error.log
```

**Häufige Fehler:**

1. **Port bereits belegt:**
   ```
   bind() to 0.0.0.0:80 failed (98: Address already in use)
   ```

2. **Datei/Verzeichnis fehlt:**
   ```
   open() "/var/www/fmsv-dingden/dist/index.html" failed (2: No such file or directory)
   ```

3. **Berechtigungsproblem:**
   ```
   open() "/var/www/fmsv-dingden/dist/index.html" failed (13: Permission denied)
   ```

---

## 🔧 Lösungen

### Lösung 1: Frontend ist nicht gebaut

**Problem:** Das `dist/` Verzeichnis existiert nicht.

**Prüfen:**
```bash
ls -la /var/www/fmsv-dingden/dist/
```

**Falls nicht vorhanden:**
```bash
cd /var/www/fmsv-dingden

# Dependencies installieren
npm install

# Frontend bauen
npm run build

# Prüfen ob dist/ jetzt existiert
ls -la dist/

# Nginx neu starten
systemctl restart nginx
```

---

### Lösung 2: Port 80 bereits belegt

**Prüfen welcher Prozess Port 80 nutzt:**
```bash
netstat -tulpn | grep :80
# Oder:
lsof -i :80
```

**Mögliche Prozesse:**
- Apache (`apache2`)
- Anderer Webserver
- Alter nginx-Prozess

**Apache stoppen (falls installiert):**
```bash
systemctl stop apache2
systemctl disable apache2

# Nginx starten
systemctl start nginx
```

**Alten nginx-Prozess killen:**
```bash
pkill -9 nginx

# Nginx neu starten
systemctl start nginx
```

---

### Lösung 3: Berechtigungsproblem

**Berechtigungen reparieren:**
```bash
cd /var/www/fmsv-dingden

# Besitzer setzen
chown -R www-data:www-data .

# Verzeichnisse: 755 (rwxr-xr-x)
find . -type d -exec chmod 755 {} \;

# Dateien: 644 (rw-r--r--)
find . -type f -exec chmod 644 {} \;

# dist/ Verzeichnis prüfen
ls -la dist/

# Nginx neu starten
systemctl restart nginx
```

---

### Lösung 4: Syntax-Fehler in nginx Config

**Konfiguration prüfen:**
```bash
nginx -t
```

**Falls Fehler, Config manuell prüfen:**
```bash
nano /etc/nginx/sites-available/fmsv-dingden
```

**Achte auf:**
- Fehlende Semikolons (`;`)
- Falsche Pfade
- Doppelte `server_name` Einträge
- Nicht escapte `$` Zeichen (müssen `\$` sein)

**Nach Änderungen:**
```bash
nginx -t                    # Testen
systemctl reload nginx       # Neu laden (wenn läuft)
# Oder:
systemctl restart nginx      # Neu starten (wenn gestoppt)
```

---

### Lösung 5: Nginx komplett neu installieren

**Wenn nichts hilft:**

```bash
# 1. Nginx stoppen und deinstallieren
systemctl stop nginx
apt-get purge nginx nginx-common nginx-full

# 2. Config-Reste löschen
rm -rf /etc/nginx/
rm -rf /var/log/nginx/
rm -rf /var/lib/nginx/

# 3. Neu installieren
apt-get update
apt-get install -y nginx

# 4. Prüfen
nginx -v

# 5. FMSV Konfiguration neu erstellen (aus install.sh kopieren)
# Oder: Installations-Script neu starten
cd /var/www/fmsv-dingden/Installation/scripts
./install.sh
```

---

## 🎯 Spezielle Szenarien

### Szenario 1: Installation wurde abgebrochen

**Wenn Installation bei Nginx-Fehler abgebrochen wurde:**

```bash
cd /var/www/fmsv-dingden/Installation/scripts

# Installation neu starten
./install.sh

# Oder: Nginx-Fehler ignorieren beim Neustart
# Das Script fragt jetzt ob fortfahren werden soll
```

---

### Szenario 2: Nginx läuft, zeigt aber 404

**Problem:** Nginx läuft, aber Browser zeigt "404 Not Found"

**Prüfen:**
```bash
# 1. Ist dist/ vorhanden?
ls -la /var/www/fmsv-dingden/dist/index.html

# 2. Nginx Config prüfen
cat /etc/nginx/sites-enabled/fmsv-dingden | grep "root"

# Sollte zeigen:
#   root /var/www/fmsv-dingden/dist;
```

**Beheben:**
```bash
# Falls dist/ fehlt:
cd /var/www/fmsv-dingden
npm run build

# Nginx neu starten
systemctl restart nginx
```

---

### Szenario 3: Nginx läuft, zeigt aber 403 Forbidden

**Problem:** Nginx läuft, aber Browser zeigt "403 Forbidden"

**Ursache:** Berechtigungsproblem

**Beheben:**
```bash
# Berechtigungen setzen
cd /var/www/fmsv-dingden
chown -R www-data:www-data dist/
chmod -R 755 dist/

# Nginx Error Log prüfen
tail /var/log/nginx/error.log

# Nginx neu starten
systemctl restart nginx
```

---

### Szenario 4: Nach Update geht nginx nicht mehr

**Nach `git pull` oder Update:**

```bash
cd /var/www/fmsv-dingden

# 1. Dependencies neu installieren
npm install

# 2. Frontend neu bauen
npm run build

# 3. Berechtigungen setzen
chown -R www-data:www-data .

# 4. Nginx neu starten
systemctl restart nginx

# 5. Status prüfen
systemctl status nginx
```

---

## 📋 Diagnose-Checkliste

Arbeite diese Liste durch:

- [ ] `systemctl status nginx` ausgeführt → Status?
- [ ] `nginx -t` ausgeführt → Erfolgreich?
- [ ] `/var/log/nginx/error.log` angesehen → Fehler?
- [ ] `netstat -tulpn | grep :80` → Port frei?
- [ ] `ls -la /var/www/fmsv-dingden/dist/` → Verzeichnis existiert?
- [ ] `ls -la /var/www/fmsv-dingden/dist/index.html` → Datei existiert?
- [ ] Berechtigungen geprüft → `www-data:www-data`?

---

## 🔄 Kompletter Neustart

Falls nichts hilft - kompletter Neustart:

```bash
# 1. Alle Services stoppen
systemctl stop nginx
systemctl stop fmsv-backend
systemctl stop cloudflared 2>/dev/null

# 2. Nginx purgen
apt-get purge nginx nginx-common
rm -rf /etc/nginx

# 3. Projekt neu bauen
cd /var/www/fmsv-dingden
npm install
npm run build

# 4. Installation neu starten (ab Schritt 10)
cd Installation/scripts

# Nginx wird neu installiert und konfiguriert
# Backend bleibt erhalten!
```

---

## 🆘 Manuelle nginx Konfiguration

Falls die automatische Installation nicht funktioniert, hier die manuelle Konfiguration:

### Ohne Cloudflare (mit Backend Proxy):

```bash
cat > /etc/nginx/sites-available/fmsv-dingden <<'EOF'
server {
    listen 80;
    server_name _;
    client_max_body_size 50M;
    
    root /var/www/fmsv-dingden/dist;
    index index.html;
    
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Backend API
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
    
    # Uploads
    location /uploads/ {
        alias /var/www/fmsv-dingden/Saves/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # SPA Fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Static Assets Caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Aktivieren
ln -sf /etc/nginx/sites-available/fmsv-dingden /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Testen & Starten
nginx -t
systemctl restart nginx
```

### Mit Cloudflare (ohne Backend Proxy):

```bash
cat > /etc/nginx/sites-available/fmsv-dingden <<'EOF'
server {
    listen 80;
    server_name localhost;
    client_max_body_size 50M;
    
    root /var/www/fmsv-dingden/dist;
    index index.html;
    
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Uploads (Cloudflare routet /api direkt zum Backend)
    location /uploads/ {
        alias /var/www/fmsv-dingden/Saves/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # SPA Fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Static Assets Caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Aktivieren
ln -sf /etc/nginx/sites-available/fmsv-dingden /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Testen & Starten
nginx -t
systemctl restart nginx
```

---

## ✅ Erfolgreich wenn:

```bash
# Status Check:
systemctl status nginx

# Zeigt:
● nginx.service - A high performance web server and a reverse proxy server
     Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
     Active: active (running) since ...
```

**Und im Browser:**
- `http://deine-server-ip` → Zeigt die FMSV Website
- Oder: `http://localhost` (auf dem Server selbst mit `curl`)

---

## 📖 Weitere Hilfe

- [`INSTALLATIONS-HILFE.md`](INSTALLATIONS-HILFE.md) - Allgemeine Probleme
- [`SCRIPT-BRICHT-AB.md`](SCRIPT-BRICHT-AB.md) - Script bricht ab
- [Nginx Dokumentation](https://nginx.org/en/docs/)

---

**Nginx Grundlagen:**

```bash
# Status prüfen
systemctl status nginx

# Starten
systemctl start nginx

# Stoppen
systemctl stop nginx

# Neu starten
systemctl restart nginx

# Konfiguration neu laden (ohne Neustart)
systemctl reload nginx

# Konfiguration testen
nginx -t

# Logs ansehen
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

---

**Viel Erfolg!** 🚀
