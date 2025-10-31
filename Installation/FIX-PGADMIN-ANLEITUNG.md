# pgAdmin Fix Script - Anleitung

## 🎯 Wofür ist dieses Script?

Das `fix-pgadmin.sh` Script behebt automatisch häufige Probleme mit pgAdmin 4 und Apache2.

## 🚀 Verwendung

### Einfache Ausführung

```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./fix-pgadmin.sh
```

### Mit Download (falls noch nicht installiert)

```bash
cd /tmp
git clone https://github.com/Benno2406/fmsv-dingden.git
cd fmsv-dingden/Installation/scripts
chmod +x fix-pgadmin.sh
sudo ./fix-pgadmin.sh
```

## 📋 Was macht das Script?

### 1. Diagnose
```
✅ Apache2 Status prüfen
✅ Port 1880 Belegung prüfen
✅ WSGI Modul Status prüfen
✅ pgAdmin Installation finden
✅ Apache Konfiguration testen
✅ Fehler-Logs analysieren
```

### 2. Automatische Reparatur
```
✅ WSGI Modul installieren (falls fehlend)
✅ Benötigte Apache Module aktivieren
✅ Ports konfigurieren (1880/18443)
✅ pgAdmin VirtualHost erstellen/reparieren
✅ Apache neu starten
✅ Erreichbarkeit testen
```

## 📊 Beispiel-Ausgabe

### Erfolgreiche Reparatur

```
╔════════════════════════════════════════════════════════╗
║           pgAdmin 4 Fix & Diagnose Tool                ║
╚════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════
                     DIAGNOSE
═══════════════════════════════════════════════════════

ℹ️  Prüfe Apache2 Status...
❌ Apache2 läuft NICHT

ℹ️  Prüfe Port 1880...
ℹ️  Port 1880 ist frei

ℹ️  Prüfe WSGI Modul...
❌ WSGI Modul fehlt!

ℹ️  Prüfe pgAdmin Installation...
✅ pgAdmin gefunden: /usr/pgadmin4

ℹ️  Prüfe Apache Konfiguration...
✅ Apache Konfiguration OK

═══════════════════════════════════════════════════════
                AUTOMATISCHE REPARATUR
═══════════════════════════════════════════════════════

ℹ️  Installiere WSGI Modul...
✅ WSGI Modul installiert

ℹ️  Aktiviere benötigte Apache Module...
  ✓ ssl aktiviert
  ✓ wsgi aktiviert
  ○ proxy bereits aktiv
  ○ proxy_http bereits aktiv
  ○ headers bereits aktiv
  ○ rewrite bereits aktiv

ℹ️  Prüfe Apache Ports...
✅ Ports bereits korrekt konfiguriert

ℹ️  Erstelle pgAdmin VirtualHost...
✅ pgAdmin VirtualHost erstellt

ℹ️  Starte Apache2 neu...
✅ Apache2 erfolgreich gestartet!

═══════════════════════════════════════════════════════
                     ERGEBNIS
═══════════════════════════════════════════════════════

✅ Apache2 läuft auf Port 1880/18443

Zugriff auf pgAdmin:
  ► Lokal:   http://localhost:1880/pgadmin4
  ► Extern:  http://192.168.178.26:1880/pgadmin4

Teste Zugriff:
  curl -I http://localhost:1880/pgadmin4

✅ pgAdmin ist erreichbar! ✅
```

### Wenn bereits alles funktioniert

```
═══════════════════════════════════════════════════════
                     DIAGNOSE
═══════════════════════════════════════════════════════

ℹ️  Prüfe Apache2 Status...
✅ Apache2 läuft

ℹ️  Prüfe Port 1880...
✅ Port 1880 wird von Apache2 verwendet

ℹ️  Prüfe WSGI Modul...
✅ WSGI Modul ist geladen

ℹ️  Prüfe pgAdmin Installation...
✅ pgAdmin gefunden: /usr/pgadmin4

ℹ️  Prüfe Apache Konfiguration...
✅ Apache Konfiguration OK

═══════════════════════════════════════════════════════
                AUTOMATISCHE REPARATUR
═══════════════════════════════════════════════════════

ℹ️  Aktiviere benötigte Apache Module...
  ○ ssl bereits aktiv
  ○ wsgi bereits aktiv
  ○ proxy bereits aktiv
  ○ proxy_http bereits aktiv
  ○ headers bereits aktiv
  ○ rewrite bereits aktiv

ℹ️  Prüfe Apache Ports...
✅ Ports bereits korrekt konfiguriert

═══════════════════════════════════════════════════════
                     ERGEBNIS
═══════════════════════════════════════════════════════

✅ Apache2 läuft auf Port 1880/18443

Zugriff auf pgAdmin:
  ► Lokal:   http://localhost:1880/pgadmin4
  ► Extern:  http://192.168.178.26:1880/pgadmin4

✅ pgAdmin ist erreichbar! ✅
```

## 🔧 Häufige Probleme die behoben werden

### Problem 1: WSGI Modul fehlt
```
Symptom:  Apache2 startet nicht
Fehler:   "Invalid command 'WSGIDaemonProcess'"
Lösung:   Script installiert libapache2-mod-wsgi-py3
```

### Problem 2: Module nicht aktiviert
```
Symptom:  Apache2 Fehler beim Start
Fehler:   "Module xyz not found"
Lösung:   Script aktiviert ssl, wsgi, proxy, etc.
```

### Problem 3: Falsche Ports
```
Symptom:  Port-Konflikt mit nginx
Fehler:   "Address already in use"
Lösung:   Script konfiguriert Ports 1880/18443
```

### Problem 4: Fehlende VirtualHost
```
Symptom:  pgAdmin nicht erreichbar
Fehler:   404 Not Found
Lösung:   Script erstellt VirtualHost neu
```

### Problem 5: Apache läuft nicht
```
Symptom:  pgAdmin nicht erreichbar
Fehler:   Connection refused
Lösung:   Script startet Apache mit Diagnose
```

## ⚠️ Was das Script NICHT kann

Das Script kann nicht helfen bei:

- **pgAdmin nicht installiert** → Nutze `install.sh` stattdessen
- **Datenbank-Probleme** → Siehe PostgreSQL Logs
- **Netzwerk-Probleme** → Prüfe Firewall und Routing
- **Kaputte pgAdmin Installation** → Neuinstallation erforderlich

## 🆘 Wenn das Script nicht hilft

### 1. Manuelle Diagnose

```bash
# Apache Status
systemctl status apache2

# Apache Logs
journalctl -u apache2 -n 50

# Apache Konfiguration testen
apache2ctl configtest

# Port prüfen
netstat -tulpn | grep 1880

# Module prüfen
apache2ctl -M | grep wsgi
```

### 2. pgAdmin neu installieren

```bash
# pgAdmin deinstallieren
apt-get remove --purge pgadmin4-web

# Apache bereinigen
apt-get remove --purge apache2 libapache2-mod-wsgi-py3
apt-get autoremove

# Neu installieren
cd /var/www/fmsv-dingden/Installation/scripts
./install.sh
# → Bei pgAdmin "Ja" wählen
```

### 3. Logs einsenden

Falls nichts hilft, Logs sammeln:

```bash
# Log-Bundle erstellen
cd /tmp
mkdir pgadmin-logs
journalctl -u apache2 -n 100 > pgadmin-logs/apache.log
apache2ctl -M > pgadmin-logs/modules.txt
netstat -tulpn > pgadmin-logs/ports.txt
cat /etc/apache2/ports.conf > pgadmin-logs/ports.conf
cat /etc/apache2/sites-enabled/* > pgadmin-logs/sites.txt
tar -czf pgadmin-logs.tar.gz pgadmin-logs/

# pgadmin-logs.tar.gz an Support senden
```

## 📚 Weiterführende Hilfe

- [PGADMIN-OPTIMIERUNG.md](PGADMIN-OPTIMIERUNG.md) - Technische Details
- [INSTALL-OPTIMIERUNG-SUMMARY.md](INSTALL-OPTIMIERUNG-SUMMARY.md) - Übersicht
- [BACKEND-DIAGNOSE.md](BACKEND-DIAGNOSE.md) - Backend-Probleme
- [Installation/README.md](README.md) - Allgemeine Installation

## 💡 Tipps

### Präventive Wartung

```bash
# Regelmäßig (z.B. monatlich) ausführen:
sudo ./fix-pgadmin.sh

# Auch wenn alles funktioniert - zur Sicherheit!
```

### Nach System-Updates

```bash
# Nach großen Updates (z.B. Debian 12 → 13):
sudo apt-get update
sudo apt-get upgrade
sudo ./fix-pgadmin.sh  # Sicherstellen dass alles läuft
```

### Vor wichtigen Präsentationen

```bash
# Einen Tag vorher testen:
curl -I http://localhost:1880/pgadmin4

# Falls Probleme:
sudo ./fix-pgadmin.sh
```

## 🔒 Sicherheitshinweis

Das Script benötigt Root-Rechte weil es:
- Pakete installiert (`apt-get install`)
- System-Dienste verwaltet (`systemctl`)
- System-Konfiguration ändert (`/etc/apache2/*`)

**Immer als root/sudo ausführen!**

---

**Fragen? Probleme?**
→ Siehe [Installation/README.md](README.md) für weitere Hilfe

**Stand:** 31. Oktober 2025  
**Version:** 2.1
