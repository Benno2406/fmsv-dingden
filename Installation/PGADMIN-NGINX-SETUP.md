# pgAdmin 4 - Nginx Reverse Proxy Setup

## ✅ Was wurde behoben

### Problem 1: "ERROR: Conf pgadmin4 does not exist!"

**Ursache:**
Das `setup-web.sh` Script von pgAdmin erstellt automatisch Apache-Konfigurationen, die dann vom Install-Script gelöscht wurden, bevor Apache sie aktivieren konnte.

**Lösung:**
```bash
# VORHER (falsche Reihenfolge):
/usr/pgadmin4/bin/setup-web.sh --yes
rm -f /etc/apache2/conf-available/pgadmin4.conf  # Löscht die gerade erstellte Config!
# → ERROR: Conf pgadmin4 does not exist!

# NACHHER (richtige Reihenfolge):
rm -f /etc/apache2/conf-available/pgadmin4.conf  # Bereinige ALTE Configs zuerst
/usr/pgadmin4/bin/setup-web.sh --yes            # Erstelle neue Config
a2disconf pgadmin4                               # Deaktiviere (ohne Fehler)
# Unsere eigene Config auf Port 1880 wird aktiviert
```

Der Fehler erscheint nun nicht mehr, weil die Deaktivierung mit `|| true` abgefangen wird.

---

### Problem 2: Optionaler Nginx Reverse Proxy

**Vorher:**
```
Optional - Nginx Reverse Proxy:
  Du kannst später eine Nginx-Konfiguration erstellen für:
  pgadmin.deineadomain.de → http://localhost:1880
```
→ Nur Text, keine echte Implementation!

**Nachher:**
Das Install-Script fragt interaktiv, ob ein Nginx Reverse Proxy eingerichtet werden soll und erstellt automatisch:
- Nginx-Konfiguration
- Subdomain-Setup
- Reverse Proxy zu Apache Port 1880
- SSL-Ready (Certbot-Anleitung)

---

## 🚀 Verwendung

### Während Installation

Wenn pgAdmin installiert ist, erscheint:

```
╔════════════════════════════════════════════════════════╗
║            pgAdmin 4 erfolgreich installiert!          ║
╚════════════════════════════════════════════════════════╝

Zugriff:
  ► Lokal:   http://localhost:1880/pgadmin4
  ► Extern:  http://192.168.178.26:1880/pgadmin4

Optional - Nginx Reverse Proxy einrichten?
  Ermöglicht Zugriff über: pgadmin.deineadomain.de
  (Mit SSL-Unterstützung via Certbot)

Nginx Reverse Proxy jetzt einrichten? (j/n)
```

### Wenn "j" gewählt wird:

```
Domain eingeben (z.B. pgadmin.deineadomain.de): pgadmin.example.com

✓ Nginx Reverse Proxy konfiguriert

╔════════════════════════════════════════════════════════╗
║         Nginx Reverse Proxy eingerichtet! ✓           ║
╚════════════════════════════════════════════════════════╝

Zugriff (nach DNS-Setup):
  ► http://pgadmin.example.com

Nächste Schritte:
  1. DNS A-Record erstellen:
     pgadmin.example.com → 192.168.178.26

  2. SSL-Zertifikat installieren (optional):
     sudo certbot --nginx -d pgadmin.example.com

  3. Firewall öffnen (falls aktiv):
     sudo ufw allow 'Nginx Full'
```

---

## 📋 Manuelle Installation (nachträglich)

Falls du während der Installation "n" gewählt hast, kannst du den Reverse Proxy nachträglich einrichten:

### Schritt 1: Nginx-Konfiguration erstellen

```bash
sudo nano /etc/nginx/sites-available/pgadmin.deineadomain.de
```

Inhalt:
```nginx
# pgAdmin 4 Reverse Proxy
server {
    listen 80;
    listen [::]:80;
    server_name pgadmin.deineadomain.de;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Logging
    access_log /var/log/nginx/pgadmin.deineadomain.de_access.log;
    error_log /var/log/nginx/pgadmin.deineadomain.de_error.log;
    
    # Reverse Proxy zu Apache auf Port 1880
    location / {
        proxy_pass http://localhost:1880;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket Support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts für lange Queries
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
        proxy_read_timeout 300;
        send_timeout 300;
    }
}
```

### Schritt 2: Site aktivieren

```bash
sudo ln -s /etc/nginx/sites-available/pgadmin.deineadomain.de /etc/nginx/sites-enabled/
```

### Schritt 3: Nginx testen & neu laden

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Schritt 4: DNS konfigurieren

Erstelle einen A-Record bei deinem DNS-Provider:
```
pgadmin.deineadomain.de  →  Deine-Server-IP
```

### Schritt 5: SSL-Zertifikat (optional)

```bash
sudo certbot --nginx -d pgadmin.deineadomain.de
```

Certbot wird automatisch:
- SSL-Zertifikat von Let's Encrypt holen
- Nginx-Config für HTTPS erweitern
- HTTP → HTTPS Redirect einrichten
- Auto-Renewal konfigurieren

---

## 🔧 Nginx-Konfiguration erklärt

### Reverse Proxy Settings

```nginx
location / {
    proxy_pass http://localhost:1880;
```
→ Leitet alle Requests zu Apache auf Port 1880 weiter

### Header-Weitergabe

```nginx
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```
→ Wichtig, damit Apache die echte Client-IP sieht

### WebSocket Support

```nginx
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```
→ Ermöglicht WebSocket-Verbindungen (für pgAdmin Live-Features)

### Timeouts

```nginx
proxy_connect_timeout 300;
proxy_send_timeout 300;
proxy_read_timeout 300;
send_timeout 300;
```
→ Lange Timeouts für komplexe Datenbank-Queries

---

## 🌐 Architektur

### Ohne Nginx (Direkt):
```
Browser → Apache:1880 → pgAdmin
```

### Mit Nginx Reverse Proxy:
```
Browser → Nginx:80/443 → Apache:1880 → pgAdmin
         (Domain + SSL)    (Lokal)
```

**Vorteile:**
- ✅ Schöne Domain statt IP:Port
- ✅ SSL/HTTPS Support
- ✅ Bessere Security (Nginx als Schutzschicht)
- ✅ Load Balancing möglich
- ✅ Caching möglich
- ✅ Rate Limiting möglich

---

## 🔐 Sicherheits-Empfehlungen

### 1. IP-Whitelist (optional)

Begrenze Zugriff auf bestimmte IPs:
```nginx
location / {
    # Nur von diesen IPs erlauben
    allow 192.168.178.0/24;  # Lokales Netzwerk
    allow 1.2.3.4;           # Deine feste IP
    deny all;                # Rest blockieren
    
    proxy_pass http://localhost:1880;
    # ... rest der config
}
```

### 2. Basic Auth (optional)

Zusätzlicher Login vor pgAdmin:
```bash
# Passwort-Datei erstellen
sudo apt-get install apache2-utils
sudo htpasswd -c /etc/nginx/.htpasswd pgadmin_user

# In Nginx-Config:
```

```nginx
location / {
    auth_basic "pgAdmin Access";
    auth_basic_user_file /etc/nginx/.htpasswd;
    
    proxy_pass http://localhost:1880;
    # ... rest der config
}
```

### 3. Rate Limiting

Schutz vor Brute-Force:
```nginx
# In http-Block (/etc/nginx/nginx.conf):
limit_req_zone $binary_remote_addr zone=pgadmin:10m rate=10r/m;

# In server-Block:
location / {
    limit_req zone=pgadmin burst=5;
    
    proxy_pass http://localhost:1880;
    # ... rest der config
}
```

---

## 🆘 Troubleshooting

### "502 Bad Gateway"

**Ursachen:**
- Apache auf Port 1880 läuft nicht
- Firewall blockiert lokale Verbindung

**Lösung:**
```bash
# Apache Status prüfen
sudo systemctl status apache2

# Apache neu starten
sudo systemctl restart apache2

# Port 1880 prüfen
sudo netstat -tulpn | grep 1880
```

### "Connection timeout"

**Ursachen:**
- Timeout zu kurz für große Queries
- pgAdmin Session abgelaufen

**Lösung:**
Timeouts erhöhen (siehe Nginx-Config oben)

### SSL-Zertifikat Fehler

**Ursachen:**
- DNS nicht richtig konfiguriert
- Port 80/443 nicht offen

**Lösung:**
```bash
# DNS prüfen
dig pgadmin.deineadomain.de

# Sollte zeigen:
# ;; ANSWER SECTION:
# pgadmin.deineadomain.de. 300 IN A 192.168.178.26

# Firewall prüfen
sudo ufw status

# Ports öffnen
sudo ufw allow 'Nginx Full'
```

---

## 📊 Performance-Tipps

### Caching für statische Assets

```nginx
location /static/ {
    proxy_pass http://localhost:1880;
    proxy_cache_valid 200 1d;
    proxy_cache_bypass $http_pragma $http_authorization;
    add_header X-Cache-Status $upstream_cache_status;
}
```

### Gzip Compression

```nginx
server {
    # ... andere config
    
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript;
    gzip_comp_level 6;
}
```

---

## 🎯 Zusammenfassung

**Was wurde behoben:**
1. ✅ "ERROR: Conf pgadmin4 does not exist!" - Fehler beseitigt
2. ✅ Optionaler Nginx Reverse Proxy - Jetzt wirklich implementiert!

**Neue Features:**
- Interaktive Einrichtung während Installation
- Automatische Nginx-Config-Erstellung
- SSL-Ready mit Certbot-Anleitung
- Detaillierte Dokumentation

**Zugriff auf pgAdmin:**
- Direkt: `http://localhost:1880/pgadmin4`
- Via Nginx: `http://pgadmin.deineadomain.de`
- Mit SSL: `https://pgadmin.deineadomain.de`

🎉 **Jetzt vollständig und sauber implementiert!**
