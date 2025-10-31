# pgAdmin 4 - PostgreSQL Web Interface

pgAdmin 4 wird automatisch während der Installation eingerichtet und bietet ein komfortables Web-Interface zur Verwaltung deiner PostgreSQL-Datenbanken.

---

## 🎯 **Was ist pgAdmin?**

pgAdmin 4 ist das offizielle Web-Interface für PostgreSQL und ermöglicht:
- ✅ Grafische Datenbankverwaltung
- ✅ SQL-Abfragen ausführen
- ✅ Tabellen erstellen und bearbeiten
- ✅ Backup & Restore
- ✅ Benutzerverwaltung
- ✅ Performance-Monitoring

---

## 🔐 **Zugriff auf pgAdmin**

### Standard-Zugriff (lokal)
```
http://DEINE-SERVER-IP:5050
```

### Via Nginx (über Domain)
```
http://pgadmin.fmsv.bartholmes.eu
```

### Via Cloudflare Tunnel ⭐ **Empfohlen!**

**✅ pgAdmin ist bereits via Cloudflare Tunnel erreichbar!**

Falls das Install-Script Cloudflare Tunnel aktiviert hat, ist pgAdmin bereits unter der Subdomain erreichbar:

```
https://pgadmin.fmsv.bartholmes.eu
```

**Vorteile:**
- ✅ Automatisches SSL/TLS (HTTPS)
- ✅ Kein Port-Forwarding nötig
- ✅ DDoS-Schutz durch Cloudflare
- ✅ Weltweit erreichbar (sicher mit IP-Whitelist!)

**Konfiguration prüfen:**
```bash
cat ~/.cloudflared/config.yml
```

Sollte enthalten:
```yaml
ingress:
  - hostname: pgadmin.fmsv.bartholmes.eu
    service: http://localhost:5050
    originRequest:
      noTLSVerify: true
  # ... andere Einträge ...
```

**Falls pgAdmin fehlt in der Config:**

1. **Config bearbeiten:**
   ```bash
   sudo nano ~/.cloudflared/config.yml
   ```

2. **pgAdmin-Block GANZ OBEN hinzufügen** (vor der Hauptdomain!):
   ```yaml
   ingress:
     # pgAdmin - MUSS VOR der Hauptdomain stehen!
     - hostname: pgadmin.fmsv.bartholmes.eu
       service: http://localhost:5050
       originRequest:
         noTLSVerify: true
     
     # Hauptdomain
     - hostname: fmsv.bartholmes.eu
       service: http://localhost:80
     # ... rest ...
   ```

3. **DNS-Route hinzufügen:**
   ```bash
   cloudflared tunnel route dns fmsv-dingden pgadmin.fmsv.bartholmes.eu
   ```

4. **Tunnel neu starten:**
   ```bash
   sudo systemctl restart cloudflared
   ```

5. **Status prüfen:**
   ```bash
   sudo systemctl status cloudflared
   journalctl -u cloudflared -n 20
   ```

**Test:**
```bash
# pgAdmin erreichbar?
curl -I https://pgadmin.fmsv.bartholmes.eu

# DNS-Route vorhanden?
cloudflared tunnel route dns list
```

---

## 🔒 **IP-Whitelist konfigurieren (WICHTIG!)**

⚠️ **SICHERHEITSRISIKO:** Standardmäßig ist pgAdmin für JEDEN erreichbar!

### 🎯 **Zwei Möglichkeiten zur Absicherung:**

#### **Option A: Cloudflare Access (empfohlen für Tunnel-Nutzer)**

Falls du Cloudflare Tunnel verwendest, kannst du **Cloudflare Access** nutzen - eine kostenlose Zero-Trust-Lösung:

**Vorteile:**
- ✅ Zentrale Verwaltung im Cloudflare Dashboard
- ✅ Mehrere Authentifizierungsmethoden (E-Mail, Google, etc.)
- ✅ Kein nginx-Config nötig
- ✅ Logs & Analytics

**Setup:**
1. Cloudflare Dashboard → **Zero Trust** → **Access** → **Applications**
2. **Add an application** → **Self-hosted**
3. Application Name: `pgAdmin FMSV`
4. Subdomain: `pgadmin`
5. Domain: `fmsv.bartholmes.eu`
6. **Create Policy:**
   - Policy Name: `Allow Admin`
   - Action: `Allow`
   - Include: `Emails` → Deine E-Mail-Adresse(n)
7. **Save**

**Fertig!** pgAdmin ist jetzt nur für autorisierte E-Mails erreichbar.

**Mehr Info:** https://developers.cloudflare.com/cloudflare-one/applications/configure-apps/self-hosted-apps/

---

#### **Option B: nginx IP-Whitelist (klassisch)**

Für lokalen Zugriff oder ohne Cloudflare Access:

### Schritt 1: Nginx-Config öffnen
```bash
sudo nano /etc/nginx/sites-available/pgadmin
```

### Schritt 2: IP-Whitelist aktivieren

Finde den Abschnitt:
```nginx
# IP-Whitelist - WICHTIG: Passe deine IPs an!
# IPv4 Beispiele:
# allow 88.123.45.67;        # Einzelne IPv4
# allow 88.123.45.0/24;      # IPv4 Range

# IPv6 Beispiele:
# allow 2a01:1234:5678:9abc::1;      # Einzelne IPv6
# allow 2a01:1234:5678:9abc::/64;    # IPv6 Subnet

# Localhost erlauben
allow 127.0.0.1;
allow ::1;

# ALLE ANDEREN BLOCKIEREN
# deny all;  # Aktiviere nach IP-Whitelist-Konfiguration!
```

### Schritt 3: Deine IPs hinzufügen

**Beispiel für einzelne IPs:**
```nginx
# Meine Home-IP
allow 88.123.45.67;

# Meine IPv6-Adresse
allow 2a01:1234:5678:9abc::1;

# Localhost
allow 127.0.0.1;
allow ::1;

# ALLE ANDEREN BLOCKIEREN
deny all;
```

**Beispiel für IP-Ranges:**
```nginx
# Mein Home-Netzwerk (IPv4)
allow 192.168.1.0/24;

# Mein IPv6-Subnet
allow 2a01:1234:5678:9abc::/64;

# Localhost
allow 127.0.0.1;
allow ::1;

# ALLE ANDEREN BLOCKIEREN
deny all;
```

### Schritt 4: Nginx neu laden
```bash
sudo nginx -t          # Konfiguration testen
sudo systemctl reload nginx
```

---

## 🔑 **Zusätzliche Absicherung: HTTP Basic Auth**

Für maximale Sicherheit kannst du zusätzlich Basic Auth aktivieren:

### Schritt 1: Passwort-Datei erstellen
```bash
sudo apt install apache2-utils
sudo htpasswd -c /etc/nginx/.htpasswd admin
```

Es wird nach einem Passwort gefragt - merke es dir!

### Schritt 2: Nginx-Config erweitern
```bash
sudo nano /etc/nginx/sites-available/pgadmin
```

Füge im `location /` Block hinzu:
```nginx
location / {
    # HTTP Basic Auth
    auth_basic "Restricted Area - pgAdmin";
    auth_basic_user_file /etc/nginx/.htpasswd;
    
    # Proxy Settings
    proxy_pass http://127.0.0.1:5050;
    proxy_set_header Host $host;
    # ... rest bleibt gleich ...
}
```

### Schritt 3: Nginx neu laden
```bash
sudo systemctl reload nginx
```

Jetzt wird beim Zugriff auf pgAdmin **zweimal** nach Credentials gefragt:
1. HTTP Basic Auth (Nginx)
2. pgAdmin Login

---

## 🌐 **Deine IP-Adresse herausfinden**

### Aktuelle öffentliche IPv4:
```bash
curl -4 ifconfig.me
```

### Aktuelle öffentliche IPv6:
```bash
curl -6 ifconfig.me
```

### Dynamische IP? Verwende DynDNS:
Falls du eine dynamische IP hast, nutze einen DynDNS-Dienst:
- **No-IP**: https://www.noip.com
- **DynDNS**: https://dyn.com
- **Cloudflare DDNS**: Kostenlos mit Cloudflare API

Dann kannst du statt IP-Adressen den Hostnamen verwenden:
```nginx
# Erfordert nginx resolver
resolver 8.8.8.8 valid=300s;
allow mein-home.ddns.net;
```

---

## 🗄️ **PostgreSQL-Server in pgAdmin hinzufügen**

### 1. pgAdmin öffnen
Rufe pgAdmin in deinem Browser auf (mit IP-Whitelist & Passwort)

### 2. Server hinzufügen
- **Rechtsklick** auf **"Servers"** (linke Seitenleiste)
- → **"Register"** → **"Server..."**

### 3. Tab "General"
- **Name:** `FMSV Dingden` (oder beliebig)

### 4. Tab "Connection"
- **Host name/address:** `localhost`
- **Port:** `5432`
- **Maintenance database:** `postgres`
- **Username:** `postgres` (oder dein DB-User)
- **Password:** [Dein PostgreSQL Passwort]
- **Save password:** ✅ (optional - für Komfort)

### 5. "Save" klicken
Der Server sollte nun in der Liste erscheinen!

---

## 📊 **pgAdmin verwenden**

### Tabellen anzeigen
1. **Servers** → **FMSV Dingden** → **Databases** → **fmsv_database**
2. → **Schemas** → **public** → **Tables**

### SQL-Abfrage ausführen
1. **Rechtsklick auf Datenbank** → **"Query Tool"**
2. SQL eingeben:
   ```sql
   SELECT * FROM users;
   ```
3. **Execute/Refresh** Button (F5)

### Backup erstellen
1. **Rechtsklick auf Datenbank**
2. → **"Backup..."**
3. Dateiname wählen (z.B. `backup_2024-10-31.sql`)
4. Format: **Plain** (für .sql Datei)
5. → **"Backup"**

### Restore durchführen
1. **Rechtsklick auf Datenbank**
2. → **"Restore..."**
3. Backup-Datei auswählen
4. → **"Restore"**

---

## 🛠️ **pgAdmin Service verwalten**

### Service-Status prüfen
```bash
sudo systemctl status pgadmin4
```

### Service neu starten
```bash
sudo systemctl restart pgadmin4
```

### Service stoppen
```bash
sudo systemctl stop pgadmin4
```

### Service deaktivieren
```bash
sudo systemctl disable pgadmin4
```

### Service aktivieren
```bash
sudo systemctl enable pgadmin4
```

### Logs anzeigen
```bash
# Live-Logs (letzte 50 Zeilen)
sudo journalctl -u pgadmin4 -n 50

# Live-Log (folgt neuen Einträgen)
sudo journalctl -u pgadmin4 -f

# pgAdmin-Logdatei
sudo tail -f /var/log/pgadmin/pgadmin4.log
```

---

## 🔧 **Troubleshooting**

### Problem: pgAdmin lädt nicht
**Lösung:**
```bash
# Service-Status prüfen
sudo systemctl status pgadmin4

# Läuft der Service?
systemctl is-active pgadmin4

# Logs ansehen
sudo journalctl -u pgadmin4 -n 50

# Neustart
sudo systemctl restart pgadmin4

# nginx läuft?
sudo systemctl status nginx
```

**WICHTIG:** Diese Installation verwendet **KEIN Apache2**! pgAdmin läuft als eigenständiger Python-Service mit nginx als Reverse Proxy.

### Problem: Port 5050 nicht erreichbar
**Lösung:**
```bash
# Prüfe ob pgAdmin auf Port 5050 hört
sudo netstat -tulpn | grep 5050
# oder
sudo ss -tulpn | grep 5050

# Falls nicht:
sudo systemctl restart pgadmin4
```

### Problem: "Server nicht erreichbar"
**Ursache:** PostgreSQL läuft nicht

**Lösung:**
```bash
sudo systemctl status postgresql
sudo systemctl start postgresql
```

### Problem: "Passwort vergessen"
**Lösung - pgAdmin Admin-Passwort zurücksetzen:**

**Methode 1: Via Python Script:**
```bash
# Service stoppen
sudo systemctl stop pgadmin4

# Passwort ändern
cd /usr/pgadmin4/web
sudo -u www-data python3 <<'PYEOF'
import sys
sys.path.insert(0, '/usr/pgadmin4/web')
from pgadmin import create_app
from pgadmin.model import db, User
from werkzeug.security import generate_password_hash

app = create_app()
with app.app_context():
    email = input('E-Mail: ')
    password = input('Neues Passwort: ')
    user = User.query.filter_by(email=email).first()
    if user:
        user.password = generate_password_hash(password)
        db.session.commit()
        print('✅ Passwort geändert!')
    else:
        print('❌ User nicht gefunden!')
PYEOF

# Service wieder starten
sudo systemctl start pgadmin4
```

**Methode 2: Komplett neu initialisieren:**
```bash
sudo systemctl stop pgadmin4
sudo rm -rf /var/lib/pgadmin/*
sudo systemctl start pgadmin4
# Beim ersten Login wird neuer Admin erstellt
```

### Problem: Kann nicht verbinden (IP-Whitelist)
**Ursache:** Deine IP ist nicht in der Whitelist

**Lösung:**
```bash
# Temporär IP-Filter deaktivieren
sudo nano /etc/nginx/sites-available/pgadmin

# Kommentiere "deny all;" aus:
# deny all;

# Nginx neu laden
sudo systemctl reload nginx

# Jetzt verbinden und IP herausfinden
# Dann IP zur Whitelist hinzufügen
```

### Problem: Port 5050 bereits belegt
**Lösung - Port ändern:**
```bash
# pgAdmin Config bearbeiten
sudo nano /usr/pgadmin4/web/config_local.py

# Füge hinzu:
DEFAULT_SERVER_PORT = 5051

# Service neu starten
sudo systemctl restart pgadmin4

# Nginx-Config anpassen
sudo nano /etc/nginx/sites-available/pgadmin

# Ändere:
proxy_pass http://127.0.0.1:5051;

# Nginx neu laden
sudo systemctl reload nginx
```

---

## 🚀 **Best Practices**

### 1. Regelmäßige Backups
Erstelle automatische Backups via Cronjob:

```bash
sudo crontab -e
```

Füge hinzu (täglich um 3:00 Uhr):
```bash
0 3 * * * su - postgres -c "pg_dump fmsv_database | gzip > /var/backups/fmsv_backup_$(date +\%Y\%m\%d).sql.gz"
```

### 2. Alte Backups löschen
Behalte nur die letzten 30 Tage:
```bash
0 4 * * * find /var/backups -name "fmsv_backup_*.sql.gz" -mtime +30 -delete
```

### 3. IP-Whitelist + Basic Auth verwenden
Maximale Sicherheit = Beides aktivieren!

### 4. SSL/TLS aktivieren
Falls ohne Cloudflare Tunnel:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d pgadmin.fmsv.bartholmes.eu
```

---

## 📚 **Weitere Informationen**

- **pgAdmin Dokumentation:** https://www.pgadmin.org/docs/
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **FMSV GitHub:** https://github.com/Benno2406/fmsv-dingden

---

## 💡 **Wichtige Unterschiede zu Standard-pgAdmin-Installation**

Diese Installation verwendet **nginx statt Apache2**!

### Vorteile:
- ✅ **Einheitlich:** Alles läuft über nginx (Frontend, Backend, pgAdmin)
- ✅ **Einfacher:** Nur ein Webserver zu verwalten
- ✅ **Performanter:** nginx ist leichtgewichtiger als Apache
- ✅ **Sicherer:** Weniger Angriffsfläche

### Technische Details:
- pgAdmin läuft als **systemd Service** (nicht als Apache-WSGI-App)
- Python-Server auf Port **5050**
- nginx als **Reverse Proxy**
- Logs via **journalctl** (nicht Apache-Logs!)

### Service-Management:
```bash
# pgAdmin Service
systemctl status pgadmin4

# nginx (Reverse Proxy)
systemctl status nginx

# KEIN Apache2!
systemctl status apache2  # ← Sollte nicht existieren
```

---

## ✅ **Checkliste nach Installation**

- [ ] pgAdmin Login erfolgreich
- [ ] IP-Whitelist konfiguriert
- [ ] `deny all;` aktiviert
- [ ] PostgreSQL-Server in pgAdmin hinzugefügt
- [ ] Testabfrage erfolgreich
- [ ] Backup erstellt und getestet
- [ ] Optional: Basic Auth aktiviert
- [ ] Optional: Automatische Backups eingerichtet
- [ ] Service läuft: `systemctl is-active pgadmin4`

**Bei Problemen:** Siehe `HILFE-UEBERSICHT.md` im Installation-Ordner
