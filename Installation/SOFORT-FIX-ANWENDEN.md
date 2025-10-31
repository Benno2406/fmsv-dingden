# pgAdmin WSGI-Problem - Sofort-Fix anwenden

## 🚀 Schnellstart

Du hast das WSGI-Duplikat-Problem auf deinem Server? Hier ist die schnellste Lösung!

### Option 1: Automatischer Fix (EMPFOHLEN! ⭐)

```bash
# 1. SSH-Verbindung zu deinem Server
ssh root@dein-server

# 2. Zum Projektverzeichnis wechseln
cd /var/www/fmsv-dingden

# 3. Neueste Änderungen pullen
git pull

# 4. Debug-Tool starten
cd Installation/scripts
./debug.sh

# 5. Im Menü wählen:
#    → 13) pgAdmin reparieren
#    → 5) Alle Reparaturen durchführen
```

**Das wars!** Der Fix wird automatisch angewendet. ✅

---

### Option 2: Neuinstallation (bei frischem System)

```bash
# 1. Repository klonen/aktualisieren
cd /var/www
rm -rf fmsv-dingden  # Falls vorhanden
git clone https://github.com/Benno2406/fmsv-dingden.git
cd fmsv-dingden/Installation/scripts

# 2. Installation starten
./install.sh
```

Die aktualisierte `install.sh` enthält den Fix bereits! ✅

---

### Option 3: Manueller Fix (für Fortgeschrittene)

```bash
# 1. Apache stoppen
systemctl stop apache2

# 2. ALLE pgAdmin-Configs entfernen
rm -f /etc/apache2/sites-enabled/*pgadmin*
rm -f /etc/apache2/sites-available/*pgadmin*
rm -f /etc/apache2/conf-enabled/*pgadmin*
rm -f /etc/apache2/conf-available/*pgadmin*

# 3. Explizit deaktivieren
a2dissite pgadmin4 2>/dev/null || true
a2disconf pgadmin4 2>/dev/null || true

# 4. Neue Config erstellen
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
    
    Alias /static /usr/pgadmin4/web/static
    <Directory /usr/pgadmin4/web/static>
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/pgadmin_error.log
    CustomLog ${APACHE_LOG_DIR}/pgadmin_access.log combined
</VirtualHost>
EOF

# 5. Config aktivieren
a2ensite pgadmin.conf

# 6. Apache starten
systemctl start apache2
```

---

## ✅ Überprüfung

Nach dem Fix sollte alles funktionieren:

```bash
# 1. Apache Status prüfen
systemctl status apache2
# Sollte: ● active (running)

# 2. Config-Test
apache2ctl configtest
# Sollte: Syntax OK

# 3. Nur EINE Config vorhanden?
ls -la /etc/apache2/sites-available/*pgadmin*
ls -la /etc/apache2/conf-available/*pgadmin*
# Sollte: NUR in sites-available/ vorhanden sein

# 4. HTTP-Test
curl -I http://localhost:1880/pgadmin4
# Sollte: HTTP/1.1 200 OK oder 302 Found

# 5. Im Browser testen
# http://DEINE-SERVER-IP:1880/pgadmin4
```

---

## 🆘 Immer noch Probleme?

### Diagnose durchführen

```bash
# Vollständige Diagnose
cd /var/www/fmsv-dingden/Installation/scripts
./debug.sh
# → Option 1: Vollständige Diagnose

# Apache Logs ansehen
journalctl -u apache2 -n 50

# Prüfe auf Duplikate
grep -r "WSGIDaemonProcess pgadmin" /etc/apache2/
# Sollte NUR EINE Zeile finden!
```

### Problem bleibt bestehen?

Siehe ausführliche Troubleshooting-Anleitung:
- [PGADMIN-WSGI-DUPLIKAT-FIX.md](PGADMIN-WSGI-DUPLIKAT-FIX.md)

---

## 📋 Was wurde geändert?

Diese Änderungen sind jetzt in den Scripts:

### install.sh
- Bereinigt jetzt auch `conf-available/` und `conf-enabled/`
- Nutzt `a2disconf` zusätzlich zu `a2dissite`

### debug.sh
- Option 13 (pgAdmin reparieren) aktualisiert
- Vollständige Bereinigung aller Config-Orte

### Neue Dokumentation
- `PGADMIN-WSGI-DUPLIKAT-FIX.md` - Ausführliche Anleitung
- `WSGI-DUPLIKAT-FIX-SUMMARY.md` - Zusammenfassung
- `SOFORT-FIX-ANWENDEN.md` - Diese Datei

---

## 🎯 Quick-Reference

| Problem | Lösung |
|---------|--------|
| "Name duplicates WSGI daemon" | `./debug.sh` → 13 → 5 |
| Apache startet nicht | `apache2ctl configtest` |
| pgAdmin nicht erreichbar | `systemctl status apache2` |
| Port 1880 belegt | `netstat -tulpn \| grep 1880` |

---

**Viel Erfolg!** 🎉

Bei weiteren Fragen: Siehe [Installation/README.md](README.md)
