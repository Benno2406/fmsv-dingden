# pgAdmin 4 Setup mit Apache2

## Übersicht

pgAdmin 4 wurde parallel zu nginx installiert und läuft auf Apache2 mit separaten Ports:
- **HTTP**: Port 1880
- **HTTPS**: Port 18443

Dies ermöglicht den Betrieb von nginx (für die Hauptwebsite) und Apache2 (für pgAdmin) ohne Konflikte.

## Zugriff

### Lokal (direkt auf dem Server)
```bash
# HTTP
http://localhost:1880

# HTTPS
https://localhost:18443
```

### Über Subdomain (wenn Cloudflare aktiviert)
Die Subdomain wird automatisch konfiguriert:
```
https://db.fmsv.bartholmes.eu
```

### Über externe IP (ohne Cloudflare)
```bash
# HTTP
http://DEINE-SERVER-IP:1880

# HTTPS (selbstsigniertes Zertifikat)
https://DEINE-SERVER-IP:18443
```

## Services

### Apache2 Status prüfen
```bash
systemctl status apache2
```

### Apache2 neu starten
```bash
systemctl restart apache2
```

### Logs ansehen
```bash
# Allgemeine Logs
tail -f /var/log/apache2/error.log
tail -f /var/log/apache2/access.log

# pgAdmin spezifische Logs
tail -f /var/log/apache2/pgadmin_error.log
tail -f /var/log/apache2/pgadmin_access.log
```

## Konfiguration

### Apache2 Konfiguration
```bash
nano /etc/apache2/sites-available/pgadmin.conf
```

### Port-Konfiguration
```bash
nano /etc/apache2/ports.conf
```

### pgAdmin Konfiguration
```bash
nano /usr/pgadmin4/web/config_local.py
```

## Erste Einrichtung von pgAdmin

1. **Öffne pgAdmin im Browser** (http://localhost:1880)

2. **Erstelle einen Admin-Account** beim ersten Start

3. **Füge den PostgreSQL Server hinzu**:
   - Rechtsklick auf "Servers" → "Create" → "Server"
   - **General Tab**:
     - Name: `FMSV Database`
   - **Connection Tab**:
     - Host: `localhost`
     - Port: `5432`
     - Username: `fmsv_user` (oder dein DB-User)
     - Password: (dein DB-Passwort aus .env)
     - Save password: ✓

## Troubleshooting

### Apache2 startet nicht

**Problem**: Port-Konflikt oder Konfigurationsfehler

**Lösung**:
```bash
# Teste Apache Konfiguration
apache2ctl configtest

# Prüfe ob Ports belegt sind
netstat -tulpn | grep ':1880'
netstat -tulpn | grep ':18443'

# Prüfe Fehler-Logs
tail -50 /var/log/apache2/error.log

# Apache neu starten
systemctl restart apache2
```

### pgAdmin zeigt "500 Internal Server Error"

**Problem**: WSGI oder Python-Konfiguration

**Lösung**:
```bash
# Prüfe pgAdmin Logs
tail -50 /var/log/apache2/pgadmin_error.log

# Prüfe Python/WSGI Installation
ls -la /usr/pgadmin4/web/pgAdmin4.wsgi
python3 -m pip list | grep pgadmin

# Apache neu starten
systemctl restart apache2
```

### pgAdmin ist nicht erreichbar

**Lösung**:
```bash
# Prüfe ob Apache läuft
systemctl status apache2

# Prüfe Firewall
ufw status | grep 1880
ufw status | grep 18443

# Falls nicht erlaubt:
ufw allow 1880/tcp
ufw allow 18443/tcp

# Teste Verbindung
curl http://localhost:1880
```

### Cloudflare Subdomain funktioniert nicht

**Lösung**:
```bash
# Prüfe Cloudflare Tunnel Konfiguration
cat ~/.cloudflared/config.yml

# Sollte enthalten:
#  - hostname: db.fmsv.bartholmes.eu
#    service: http://localhost:1880

# Tunnel neu starten
systemctl restart cloudflared

# Prüfe Tunnel Status
systemctl status cloudflared
journalctl -u cloudflared -n 50
```

## Parallelbetrieb nginx & Apache2

### Port-Übersicht
```
nginx (Hauptwebsite):
  - Port 80 (HTTP)
  - Port 443 (HTTPS)

Apache2 (pgAdmin):
  - Port 1880 (HTTP)
  - Port 18443 (HTTPS)

Backend API:
  - Port 3000

PostgreSQL:
  - Port 5432 (nur lokal)
```

### Beide Webserver starten
```bash
systemctl start nginx
systemctl start apache2
```

### Beide Webserver stoppen
```bash
systemctl stop nginx
systemctl stop apache2
```

### Beide Webserver Status
```bash
systemctl status nginx
systemctl status apache2
```

## Sicherheit

### SSL-Zertifikat für Apache2

Das Standard-Setup nutzt ein selbstsigniertes Zertifikat. Für Produktion solltest du ein echtes SSL-Zertifikat verwenden:

```bash
# Mit Let's Encrypt
apt-get install python3-certbot-apache
certbot --apache -d db.fmsv.bartholmes.eu
```

### Zugriff beschränken

Beschränke den Zugriff auf pgAdmin nur auf bestimmte IPs:

```bash
nano /etc/apache2/sites-available/pgadmin.conf
```

Füge hinzu:
```apache
<Directory /usr/pgadmin4/web/>
    Require ip 192.168.1.0/24
    Require ip DEINE-IP
</Directory>
```

### Starkes Passwort

- Nutze ein starkes Passwort für den pgAdmin Admin-Account
- Nutze verschiedene Passwörter für pgAdmin und PostgreSQL
- Aktiviere 2FA in pgAdmin (Settings → Security)

## Nützliche Befehle

```bash
# System-Übersicht
fmsv-debug     # Vollständige Diagnose
fmsv-test      # Backend Test
fmsv-fix       # Automatische Reparatur

# Apache2
systemctl status apache2
systemctl restart apache2
apache2ctl configtest
tail -f /var/log/apache2/pgadmin_error.log

# Cloudflare Tunnel
systemctl status cloudflared
journalctl -u cloudflared -f

# Firewall
ufw status
ufw allow 1880/tcp
ufw allow 18443/tcp
```

## Support

Bei Problemen:
1. Führe `fmsv-debug` aus für eine vollständige Diagnose
2. Prüfe die Logs mit `tail -f /var/log/apache2/pgadmin_error.log`
3. Prüfe Apache Status mit `systemctl status apache2`
4. Teste mit `curl http://localhost:1880`

---

**Wichtig**: pgAdmin ist ein mächtiges Tool mit vollem Datenbank-Zugriff. Stelle sicher, dass der Zugriff geschützt ist!
