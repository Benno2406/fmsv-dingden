# Nach der Installation - Wichtige Schritte

## 1. Backend-Erreichbarkeit prüfen ✅

Das ist der wichtigste erste Schritt nach der Installation!

```bash
# Schneller Test
fmsv-test

# Falls Probleme gefunden werden
fmsv-fix

# Backend manuell testen
curl http://localhost:3000/api/health
```

**Erwartetes Ergebnis**: 
```json
{"status":"ok","timestamp":"2025-10-31T..."}
```

Falls das Backend nicht erreichbar ist, siehe [BACKEND-DIAGNOSE.md](./BACKEND-DIAGNOSE.md)

## 2. Services Status prüfen

```bash
# Backend
systemctl status fmsv-backend

# Nginx
systemctl status nginx

# PostgreSQL
systemctl status postgresql

# Apache2 (pgAdmin)
systemctl status apache2

# pgAdmin reparieren falls nötig
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./fix-pgadmin.sh

# Cloudflare Tunnel (falls aktiviert)
systemctl status cloudflared
```

**Alle sollten `active (running)` zeigen.**

Falls nicht:
```bash
systemctl start SERVICE-NAME
systemctl enable SERVICE-NAME
```

## 3. Website aufrufen

### Hauptseite
- **Cloudflare**: https://fmsv.bartholmes.eu
- **Lokal**: http://SERVER-IP oder http://localhost

### pgAdmin
- **Cloudflare**: https://db.fmsv.bartholmes.eu
- **Lokal**: http://localhost:1880 oder http://SERVER-IP:1880

### Backend API
- http://localhost:3000/api/health
- https://fmsv.bartholmes.eu/api/health (über Proxy)

## 4. Test-Accounts verwenden

Die Installation hat automatisch Test-Accounts erstellt (falls aktiviert):

### Admin-Account
- **Email**: admin@fmsv-dingden.de
- **Passwort**: admin123
- **Zugriff**: Vollständiger Admin-Zugang

### Member-Account
- **Email**: member@fmsv-dingden.de
- **Passwort**: member123
- **Zugriff**: Normales Mitglied

**⚠️ WICHTIG**: Diese Passwörter SOFORT ändern!

### Passwörter ändern

1. Auf der Website einloggen
2. Zum Profil navigieren
3. Passwort ändern
4. Ausloggen und neu einloggen

## 5. SMTP/E-Mail konfigurieren ✉️

Das Backend benötigt SMTP für:
- Passwort-Zurücksetzen
- 2FA-Codes
- Benachrichtigungen

### .env Datei bearbeiten
```bash
nano /var/www/fmsv-dingden/backend/.env
```

### SMTP Einstellungen anpassen

#### Beispiel: SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=DEIN_SENDGRID_API_KEY
EMAIL_FROM=noreply@fmsv-dingden.de
EMAIL_FROM_NAME=FMSV Dingden
```

#### Beispiel: Gmail
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=deine@gmail.com
SMTP_PASSWORD=dein-app-passwort
EMAIL_FROM=deine@gmail.com
EMAIL_FROM_NAME=FMSV Dingden
```

#### Beispiel: Ionos/1&1
```env
SMTP_HOST=smtp.ionos.de
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=deine@domain.de
SMTP_PASSWORD=dein-passwort
EMAIL_FROM=deine@domain.de
EMAIL_FROM_NAME=FMSV Dingden
```

### Backend neu starten
```bash
systemctl restart fmsv-backend
```

### E-Mail-Versand testen
```bash
# Im Backend-Verzeichnis
cd /var/www/fmsv-dingden/backend
node -e "
const nodemailer = require('nodemailer');
require('dotenv').config();
const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});
transport.sendMail({
  from: process.env.EMAIL_FROM,
  to: 'test@example.com',
  subject: 'Test',
  text: 'Test Email'
}).then(() => console.log('✓ Email sent')).catch(err => console.error('✗ Error:', err));
"
```

## 6. pgAdmin einrichten 🗄️

Falls pgAdmin installiert wurde:

### 1. pgAdmin öffnen
```
http://localhost:1880
oder
https://db.fmsv.bartholmes.eu
```

### 2. Admin-Account erstellen
Beim ersten Start wirst du nach einem Admin-Account gefragt:
- Email: admin@example.com
- Passwort: (sicheres Passwort wählen)

### 3. PostgreSQL Server hinzufügen
- Rechtsklick auf "Servers" → "Create" → "Server"
- **General Tab**:
  - Name: `FMSV Database`
- **Connection Tab**:
  - Host: `localhost`
  - Port: `5432`
  - Database: `fmsv_database` (aus .env)
  - Username: `fmsv_user` (aus .env)
  - Password: (aus .env: DB_PASSWORD)
  - ✓ Save password

### 4. Verbindung testen
Nach dem Hinzufügen solltest du die Datenbank sehen und alle Tabellen durchsuchen können.

Siehe auch: [PGADMIN-SETUP.md](./PGADMIN-SETUP.md)

## 7. SSL/HTTPS einrichten 🔒

### Mit Cloudflare (empfohlen)
Falls du Cloudflare Tunnel verwendest, ist SSL automatisch aktiviert! ✅

### Ohne Cloudflare - Mit Let's Encrypt
```bash
# Certbot installieren
apt-get install certbot python3-certbot-nginx

# SSL-Zertifikat anfordern
certbot --nginx -d fmsv.bartholmes.eu

# Automatische Erneuerung testen
certbot renew --dry-run
```

Das Zertifikat wird automatisch alle 90 Tage erneuert.

### pgAdmin SSL
```bash
# Für pgAdmin mit Let's Encrypt
apt-get install python3-certbot-apache
certbot --apache -d db.fmsv.bartholmes.eu
```

## 8. Backup einrichten 💾

### Datenbank Backup

#### Manuelles Backup
```bash
# Backup erstellen
su - postgres -c "pg_dump fmsv_database > /tmp/fmsv_backup_$(date +%Y%m%d).sql"

# Backup an sicheren Ort verschieben
mv /tmp/fmsv_backup_*.sql /var/backups/
```

#### Automatisches Backup (täglich um 3 Uhr)
```bash
# Backup-Script erstellen
cat > /usr/local/bin/fmsv-backup <<'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/fmsv"
mkdir -p "$BACKUP_DIR"
DATE=$(date +%Y%m%d_%H%M%S)

# Datenbank Backup
su - postgres -c "pg_dump fmsv_database" | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

# Dateien Backup
tar -czf "$BACKUP_DIR/files_$DATE.tar.gz" /var/www/fmsv-dingden/Saves/

# Alte Backups löschen (älter als 30 Tage)
find "$BACKUP_DIR" -name "*.gz" -mtime +30 -delete

echo "Backup erstellt: $DATE"
EOF

chmod +x /usr/local/bin/fmsv-backup

# Cronjob hinzufügen
crontab -e
# Füge hinzu:
0 3 * * * /usr/local/bin/fmsv-backup >> /var/log/fmsv-backup.log 2>&1
```

#### Backup wiederherstellen
```bash
# Datenbank wiederherstellen
gunzip < /var/backups/fmsv/db_DATUM.sql.gz | su - postgres -c "psql fmsv_database"

# Dateien wiederherstellen
tar -xzf /var/backups/fmsv/files_DATUM.tar.gz -C /
```

## 9. Firewall überprüfen 🔥

```bash
ufw status verbose
```

**Sollte enthalten**:
```
22/tcp    ALLOW    # SSH
80/tcp    ALLOW    # HTTP (falls kein Cloudflare)
443/tcp   ALLOW    # HTTPS (falls kein Cloudflare)
3000/tcp  ALLOW    # Backend API
1880/tcp  ALLOW    # pgAdmin HTTP
18443/tcp ALLOW    # pgAdmin HTTPS
5432      DENY     # PostgreSQL (nur lokal!)
```

**Wichtig**: Port 5432 (PostgreSQL) sollte NICHT von außen erreichbar sein!

```bash
# Falls 5432 offen ist:
ufw deny 5432
```

## 10. Monitoring einrichten 📊

### Log-Rotation
Logs sollten automatisch rotiert werden:

```bash
# Prüfe logrotate Config
cat /etc/logrotate.d/nginx
cat /etc/logrotate.d/apache2

# Manuell rotieren (Test)
logrotate -f /etc/logrotate.conf
```

### Service-Überwachung
```bash
# Erstelle Health-Check Script
cat > /usr/local/bin/fmsv-healthcheck <<'EOF'
#!/bin/bash
# Prüfe Backend
if ! curl -sf http://localhost:3000/api/health > /dev/null; then
  echo "Backend down - restarting..."
  systemctl restart fmsv-backend
  echo "Backend restarted at $(date)" >> /var/log/fmsv-healthcheck.log
fi
EOF

chmod +x /usr/local/bin/fmsv-healthcheck

# Cronjob (alle 5 Minuten)
crontab -e
# Füge hinzu:
*/5 * * * * /usr/local/bin/fmsv-healthcheck
```

## 11. Auto-Update Zeitplan überprüfen

Falls Auto-Update aktiviert wurde:

```bash
# Prüfe Timer
systemctl status fmsv-auto-update.timer

# Nächste Ausführung
systemctl list-timers | grep fmsv

# Timer aktivieren/deaktivieren
systemctl enable fmsv-auto-update.timer
systemctl disable fmsv-auto-update.timer

# Manuelles Update
fmsv-update
```

## 12. Systemressourcen überwachen

```bash
# System-Übersicht
htop

# Speicherplatz
df -h

# Speicher
free -h

# Backend-Prozess
ps aux | grep node

# Datenbank-Größe
su - postgres -c "psql -c \"SELECT pg_size_pretty(pg_database_size('fmsv_database'));\""
```

## Diagnose-Tools

Nach der Installation sind folgende Befehle verfügbar:

```bash
fmsv-test      # Backend Test & Diagnose
fmsv-fix       # Automatische Problembehebung
fmsv-debug     # Vollständige System-Diagnose
fmsv-errors    # Backend-Fehler anzeigen
fmsv-manual    # Backend manuell starten
fmsv-update    # System aktualisieren
```

## Checkliste ✅

Nach der Installation solltest du folgendes erledigt haben:

- [ ] Backend-Erreichbarkeit getestet (`fmsv-test`)
- [ ] Website aufgerufen und getestet
- [ ] Test-Account Passwörter geändert
- [ ] SMTP konfiguriert und getestet
- [ ] pgAdmin eingerichtet (falls installiert)
- [ ] SSL/HTTPS aktiviert
- [ ] Backup-System eingerichtet
- [ ] Firewall überprüft
- [ ] Monitoring eingerichtet
- [ ] Services Status geprüft

## Probleme?

1. **Backend nicht erreichbar**: Siehe [BACKEND-DIAGNOSE.md](./BACKEND-DIAGNOSE.md)
2. **pgAdmin Probleme**: Siehe [PGADMIN-SETUP.md](./PGADMIN-SETUP.md)
3. **Allgemeine Probleme**: Führe `fmsv-debug` aus

## Support-Befehle

```bash
# Schnelle Diagnose
fmsv-test && fmsv-fix

# Detaillierte Logs
journalctl -u fmsv-backend -n 100
tail -f /var/log/nginx/error.log

# Services neu starten
systemctl restart fmsv-backend nginx postgresql apache2

# Vollständiger Neustart
reboot
```

---

**Viel Erfolg mit deiner FMSV Vereinshomepage! ✈️**
