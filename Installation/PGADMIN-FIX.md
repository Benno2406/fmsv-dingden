# pgAdmin Reparatur-Anleitung

## Problem
Bei der Installation kann es zu folgendem Fehler kommen:
```
AH00526: Syntax error on line 5 of /etc/apache2/sites-enabled/pgadmin.conf:
Name duplicates previous WSGI daemon definition.
```

## Ursache
Das pgAdmin Setup-Script (`/usr/pgadmin4/bin/setup-web.sh`) erstellt automatisch eine Apache-Konfiguration. Diese kann doppelte WSGIDaemonProcess-Definitionen enthalten, was Apache nicht akzeptiert.

## Lösung

### Automatische Reparatur (empfohlen)
```bash
fmsv-debug
# Dann Option 13 wählen: "pgAdmin reparieren"
# Dann Option 5 wählen: "Alle Reparaturen durchführen"
```

### Manuelle Reparatur

1. **Apache stoppen:**
   ```bash
   systemctl stop apache2
   ```

2. **Alte Konfigurationen entfernen:**
   ```bash
   rm -f /etc/apache2/sites-enabled/*pgadmin*
   rm -f /etc/apache2/sites-available/*pgadmin*
   ```

3. **Neue, saubere Konfiguration erstellen:**
   ```bash
   cat > /etc/apache2/sites-available/pgadmin.conf << 'EOF'
   <VirtualHost *:1880>
       ServerName localhost
       
       WSGIDaemonProcess pgadmin processes=1 threads=25 python-home=/usr/pgadmin4/venv
       WSGIScriptAlias / /usr/pgadmin4/web/pgAdmin4.wsgi
       
       <Directory /usr/pgadmin4/web>
           WSGIProcessGroup pgadmin
           WSGIApplicationGroup %{GLOBAL}
           Require all granted
       </Directory>
       
       # Static files
       Alias /static /usr/pgadmin4/web/static
       <Directory /usr/pgadmin4/web/static>
           Require all granted
       </Directory>
       
       ErrorLog ${APACHE_LOG_DIR}/pgadmin_error.log
       CustomLog ${APACHE_LOG_DIR}/pgadmin_access.log combined
   </VirtualHost>
   EOF
   ```

4. **Site aktivieren:**
   ```bash
   a2ensite pgadmin.conf
   ```

5. **Konfiguration testen:**
   ```bash
   apache2ctl configtest
   ```

6. **Apache starten:**
   ```bash
   systemctl start apache2
   ```

## Überprüfung

Nach der Reparatur:

1. **Status prüfen:**
   ```bash
   systemctl status apache2
   ```

2. **pgAdmin aufrufen:**
   - Lokal: http://localhost:1880/pgadmin4
   - Extern: http://YOUR_IP:1880/pgadmin4

3. **Logs prüfen:**
   ```bash
   journalctl -u apache2 -n 50
   tail -50 /var/log/apache2/pgadmin_error.log
   ```

## Wichtige Hinweise

- **Port:** pgAdmin läuft auf Port 1880 (nicht 80), damit es nicht mit nginx kollidiert
- **WSGI Module:** Müssen installiert sein (`libapache2-mod-wsgi-py3`)
- **Python Environment:** pgAdmin nutzt ein virtuelles Python-Environment in `/usr/pgadmin4/venv`

## Häufige Probleme

### WSGI Module fehlen
```bash
apt-get install -y libapache2-mod-wsgi-py3
a2enmod wsgi
systemctl restart apache2
```

### Port 1880 bereits belegt
```bash
netstat -tulpn | grep 1880
# Prozess beenden oder anderen Port in pgadmin.conf verwenden
```

### Apache startet nicht
```bash
# Vollständige Logs ansehen
journalctl -u apache2 -n 100 --no-pager

# Apache Konfiguration prüfen
apache2ctl configtest

# Apache neu installieren (letzter Ausweg)
apt-get install --reinstall apache2 libapache2-mod-wsgi-py3
```

## Was wurde in install.sh geändert

Das `install.sh` Script wurde optimiert:

1. **Saubere Konfiguration:** Die pgAdmin-Konfiguration wird jetzt komplett neu erstellt statt nur angepasst
2. **WSGI-Duplikate vermieden:** Alte Konfigurationen werden vor der Neuerstellung entfernt
3. **Bessere Diagnose:** Mehr Details bei Fehlern während der Installation

## Weitere Hilfe

Bei weiteren Problemen:
```bash
fmsv-debug  # Vollständige Diagnose mit Reparatur-Optionen
```
