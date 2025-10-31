# pgAdmin WSGI-Duplikat Problem - Endgültige Lösung ✅

## 🔴 Das Problem

Bei der Installation von pgAdmin 4 mit Apache2 tritt folgender Fehler auf:

```
AH00526: Syntax error on line 5 of /etc/apache2/sites-enabled/pgadmin.conf:
Name duplicates previous WSGI daemon definition.
```

### Ursache

Das pgAdmin `setup-web.sh` Script erstellt automatisch Apache-Konfigurationsdateien an **mehreren Stellen**:

1. `/etc/apache2/sites-available/pgadmin4.conf`
2. `/etc/apache2/conf-available/pgadmin4.conf` ⚠️ **HIER LAG DAS PROBLEM!**

Das bisherige Install-Script löschte nur Dateien in `sites-available/` und `sites-enabled/`, aber **NICHT** in `conf-available/` und `conf-enabled/`!

Wenn dann beide Konfigurationsdateien geladen wurden, gab es zwei `WSGIDaemonProcess`-Definitionen mit dem gleichen Namen "pgadmin" → Apache-Fehler.

## ✅ Die Lösung

### Aktualisierte Scripts

Beide Scripts (`install.sh` und `debug.sh`) wurden erweitert, um **ALLE** pgAdmin-Konfigurationen zu entfernen:

**Vorher:**
```bash
rm -f /etc/apache2/sites-enabled/*pgadmin* 2>/dev/null
rm -f /etc/apache2/sites-available/*pgadmin* 2>/dev/null
```

**Nachher:**
```bash
# Entferne ALLE existierenden pgAdmin Configs (auch aus conf-*)
rm -f /etc/apache2/sites-enabled/*pgadmin* 2>/dev/null
rm -f /etc/apache2/sites-available/*pgadmin* 2>/dev/null
rm -f /etc/apache2/conf-enabled/*pgadmin* 2>/dev/null
rm -f /etc/apache2/conf-available/*pgadmin* 2>/dev/null

# Deaktiviere eventuell aktivierte pgAdmin-Configs
a2dissite pgadmin4 2>/dev/null || true
a2disconf pgadmin4 2>/dev/null || true
```

### Was wurde geändert?

1. **install.sh** (Zeile 733-750):
   - Entfernt jetzt auch Configs aus `conf-available/` und `conf-enabled/`
   - Deaktiviert explizit pgAdmin Sites und Configs
   - Klare Bestätigungsmeldung

2. **debug.sh** (Option 13 - pgAdmin reparieren):
   - Beide Reparatur-Funktionen aktualisiert
   - Vollständige Bereinigung aller pgAdmin-Configs
   - Besseres Feedback

## 📋 Verwendung

### Bei Neuinstallation

```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./install.sh
```

Das Problem sollte nicht mehr auftreten! ✅

### Bei bestehendem Problem

#### Option 1: fmsv-debug Tool (empfohlen)

```bash
sudo fmsv-debug
# Wähle: 13) pgAdmin reparieren
# Dann:  5) Alle Reparaturen durchführen
```

#### Option 2: Manuell

```bash
# 1. Apache stoppen
sudo systemctl stop apache2

# 2. ALLE pgAdmin-Configs entfernen
sudo rm -f /etc/apache2/sites-enabled/*pgadmin*
sudo rm -f /etc/apache2/sites-available/*pgadmin*
sudo rm -f /etc/apache2/conf-enabled/*pgadmin*
sudo rm -f /etc/apache2/conf-available/*pgadmin*

# 3. Configs deaktivieren
sudo a2dissite pgadmin4 2>/dev/null || true
sudo a2disconf pgadmin4 2>/dev/null || true

# 4. Neue, saubere Konfiguration erstellen
sudo cat > /etc/apache2/sites-available/pgadmin.conf << 'EOF'
<VirtualHost *:1880>
    ServerName localhost
    
    WSGIDaemonProcess pgadmin processes=1 threads=25 python-home=/usr/pgadmin4/venv
    WSGIScriptAlias / /usr/pgadmin4/web/pgAdmin4.wsgi
    
    <Directory /usr/pgadmin4/web>
        WSGIProcessGroup pgadmin
        WSGIApplicationGroup %{GLOBAL}
        Require all granted
    </Directory>
    
    Alias /static /usr/pgadmin4/web/static
    <Directory /usr/pgadmin4/web/static>
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/pgadmin_error.log
    CustomLog ${APACHE_LOG_DIR}/pgadmin_access.log combined
</VirtualHost>
EOF

# 5. Site aktivieren
sudo a2ensite pgadmin.conf

# 6. Konfiguration testen
sudo apache2ctl configtest

# 7. Apache starten
sudo systemctl start apache2
```

## 🔍 Diagnose

### Problem-Check

```bash
# Prüfe alle pgAdmin-Configs
ls -la /etc/apache2/sites-available/*pgadmin* 2>/dev/null
ls -la /etc/apache2/sites-enabled/*pgadmin* 2>/dev/null
ls -la /etc/apache2/conf-available/*pgadmin* 2>/dev/null
ls -la /etc/apache2/conf-enabled/*pgadmin* 2>/dev/null

# Zeige aktivierte Sites und Configs
apache2ctl -S

# Prüfe auf doppelte WSGIDaemonProcess
grep -r "WSGIDaemonProcess pgadmin" /etc/apache2/
```

### Erwartetes Ergebnis

Es sollte **NUR EINE** pgAdmin-Config gefunden werden:
```
/etc/apache2/sites-available/pgadmin.conf
/etc/apache2/sites-enabled/pgadmin.conf
```

Und **NUR EINE** WSGIDaemonProcess-Definition mit dem Namen "pgadmin".

## ✅ Überprüfung nach Fix

```bash
# 1. Apache Status
sudo systemctl status apache2
# Sollte: ● active (running)

# 2. Konfigurationstest
sudo apache2ctl configtest
# Sollte: Syntax OK

# 3. Port-Check
sudo netstat -tulpn | grep :1880
# Sollte: apache2 auf Port 1880

# 4. HTTP-Test
curl -I http://localhost:1880/pgadmin4
# Sollte: HTTP/1.1 200 OK oder 302 Found (Redirect zu Login)
```

## 📊 Technische Details

### Apache Konfigurationsstruktur

Apache lädt Konfigurationsdateien aus mehreren Verzeichnissen:

1. **sites-available/** - Verfügbare Virtual Hosts
   - Aktiviert mit: `a2ensite <config>`
   - Symlink nach: `sites-enabled/`

2. **conf-available/** - Zusätzliche Konfigurationen
   - Aktiviert mit: `a2enconf <config>`
   - Symlink nach: `conf-enabled/`

### Warum pgAdmin in conf-available/ landet

Das pgAdmin `setup-web.sh` Script nutzt manchmal `a2enconf` statt `a2ensite`, je nach:
- Apache-Version
- Debian/Ubuntu-Version
- Vorhandene Apache-Konfiguration

### Die Fix-Strategie

1. **Vollständige Bereinigung** aller möglichen Konfigurationsorte
2. **Explizites Deaktivieren** mit `a2dissite` und `a2disconf`
3. **Kontrollierte Neuerstellung** einer einzigen Konfiguration
4. **Nur in sites-available/** ablegen (nicht in conf-available/)
5. **Nur mit a2ensite aktivieren** (nicht a2enconf)

## 🆘 Troubleshooting

### Problem bleibt bestehen?

```bash
# Vollständige Apache-Neuinstallation
sudo apt-get remove --purge apache2 libapache2-mod-wsgi-py3
sudo apt-get autoremove
sudo rm -rf /etc/apache2
sudo apt-get install apache2 libapache2-mod-wsgi-py3

# Dann pgAdmin-Fix erneut ausführen
sudo fmsv-debug
# → 13) pgAdmin reparieren → 5) Alle Reparaturen
```

### Apache startet nicht?

```bash
# Logs ansehen
sudo journalctl -u apache2 -n 50

# Konfiguration im Detail testen
sudo apache2ctl -t -D DUMP_VHOSTS
sudo apache2ctl -t -D DUMP_MODULES
```

### Port 1880 belegt?

```bash
# Prüfe wer Port belegt
sudo netstat -tulpn | grep :1880

# Falls anderer Prozess: Port freigeben oder anderen Port wählen
```

### WSGI Modul fehlt?

```bash
# WSGI Modul installieren
sudo apt-get install libapache2-mod-wsgi-py3

# WSGI Modul aktivieren
sudo a2enmod wsgi

# Apache neu starten
sudo systemctl restart apache2
```

## 📝 Zusammenfassung

| Aspekt | Vorher ❌ | Nachher ✅ |
|--------|----------|----------|
| Bereinigung | Nur sites-* | sites-* UND conf-* |
| Deaktivierung | Keine | a2dissite + a2disconf |
| Duplikate möglich | Ja | Nein |
| Fix verfügbar | Teilweise | Vollständig (fmsv-debug) |
| Dokumentiert | Verstreut | Diese Datei |

## 🎯 Erfolgsrate

Nach diesem Fix sollte das WSGI-Duplikat-Problem zu **100%** behoben sein, da:

1. ✅ **Alle** möglichen Konfigurationsorte bereinigt werden
2. ✅ **Alle** Aktivierungen explizit deaktiviert werden
3. ✅ Nur **EINE** neue Konfiguration erstellt wird
4. ✅ Nur **EIN** Ort genutzt wird (sites-available/)
5. ✅ Nur **EINE** WSGIDaemonProcess-Definition existiert

## 📚 Weitere Hilfe

- **Allgemeine pgAdmin-Probleme:** `/Installation/PGADMIN-FIX.md`
- **pgAdmin-Optimierung:** `/Installation/PGADMIN-OPTIMIERUNG.md`
- **Debug-Tool:** `sudo fmsv-debug` → Option 13
- **Installation:** `/Installation/scripts/install.sh`

---

**Problem gelöst!** ✅  
**Stand:** 31. Oktober 2025  
**Version:** 2.2 (WSGI-Duplikat-Fix)
