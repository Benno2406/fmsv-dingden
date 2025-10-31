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

### Via Cloudflare Tunnel
Falls du Cloudflare Tunnel verwendest, füge zur Tunnel-Config hinzu:

```bash
nano ~/.cloudflared/config.yml
```

Füge hinzu:
```yaml
ingress:
  - hostname: pgadmin.fmsv.bartholmes.eu
    service: http://localhost:5050
  # ... andere Einträge ...
```

Dann:
```bash
cloudflared tunnel route dns fmsv-dingden pgadmin.fmsv.bartholmes.eu
sudo systemctl restart cloudflared
```

---

## 🔒 **IP-Whitelist konfigurieren (WICHTIG!)**

⚠️ **SICHERHEITSRISIKO:** Standardmäßig ist pgAdmin für JEDEN erreichbar!

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

---

## 🔧 **Troubleshooting**

### Problem: pgAdmin lädt nicht
**Lösung:**
```bash
# Service-Status prüfen
sudo systemctl status pgadmin4

# Apache läuft? (pgAdmin nutzt Apache intern)
sudo systemctl status apache2

# Logs ansehen
sudo journalctl -u pgadmin4 -n 50

# Neustart
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
```bash
# Erneutes Setup (überschreibt Admin-User)
sudo /usr/pgadmin4/bin/setup-web.sh
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

## ✅ **Checkliste nach Installation**

- [ ] pgAdmin Login erfolgreich
- [ ] IP-Whitelist konfiguriert
- [ ] `deny all;` aktiviert
- [ ] PostgreSQL-Server in pgAdmin hinzugefügt
- [ ] Testabfrage erfolgreich
- [ ] Backup erstellt und getestet
- [ ] Optional: Basic Auth aktiviert
- [ ] Optional: Automatische Backups eingerichtet

**Bei Problemen:** Siehe `HILFE-UEBERSICHT.md` im Installation-Ordner
