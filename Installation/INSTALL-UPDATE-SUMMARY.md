# Installation Script Update - Zusammenfassung

## Was wurde geändert?

Das `install.sh` Script wurde umfassend erweitert und verbessert:

### 1. ✅ pgAdmin 4 Integration mit Apache2

**Neu hinzugefügt**:
- Automatische Installation von pgAdmin 4 (falls noch nicht vorhanden)
- Paralleler Betrieb von Apache2 (für pgAdmin) und nginx (für Website)
- Separate Ports für pgAdmin: **1880 (HTTP)** und **18443 (HTTPS)**
- Subdomain-Konfiguration für pgAdmin (z.B. `db.fmsv.bartholmes.eu`)
- Automatische Integration in Cloudflare Tunnel (falls aktiviert)

**Vorteile**:
- Kein Port-Konflikt zwischen nginx und Apache2
- pgAdmin läuft stabil auf eigenen Ports
- Einfacher Zugriff über Subdomain oder direkte Ports
- Automatische SSL-Konfiguration

### 2. ✅ Backend-Erreichbarkeit verbessert

**Neu implementiert**:
- Automatischer Backend-Test nach Installation
- Port 3000 wird explizit in Firewall freigegeben
- Nginx Proxy-Konfiguration wird validiert
- Live-Check ob Backend-API antwortet

**Test-Commands**:
```bash
fmsv-test      # Vollständiger Backend-Test
fmsv-fix       # Automatische Reparatur
fmsv-errors    # Fehler-Logs anzeigen
fmsv-manual    # Backend manuell starten (Debug)
```

### 3. ✅ Neue Diagnose-Tools

**Automatisch installierte Scripts**:

#### `fmsv-test` - Backend Test & Diagnose
- Service Status Check
- Port Verfügbarkeit
- API Erreichbarkeit
- Environment Variablen
- Datenbank-Verbindung
- Nginx Proxy Check
- Firewall Regeln
- Detaillierte Logs

#### `fmsv-fix` - Automatische Problembehebung
- Startet gestoppte Services neu
- Öffnet blockierte Ports
- Korrigiert Firewall-Regeln
- Setzt Berechtigungen
- Testet API nach Reparatur

#### `fmsv-errors` - Fehler-Logs anzeigen
- Zeigt letzte Backend-Logs
- Filtert nach Fehlern
- Live-Log-Modus

#### `fmsv-manual` - Backend manuell starten
- Stoppt systemd Service
- Startet Backend im Vordergrund
- Zeigt alle Logs direkt an
- Perfekt für Debugging

### 4. ✅ Verbesserte Firewall-Konfiguration

**Neue Regeln**:
```bash
Port 22     # SSH (bestehend)
Port 80     # HTTP (bestehend, falls kein Cloudflare)
Port 443    # HTTPS (bestehend, falls kein Cloudflare)
Port 3000   # Backend API (NEU!)
Port 1880   # pgAdmin HTTP (NEU!)
Port 18443  # pgAdmin HTTPS (NEU!)
```

**Wichtig**: PostgreSQL Port 5432 bleibt geschlossen (nur lokal)

### 5. ✅ Erweiterte Dokumentation

**Neue Dokumentations-Dateien**:

- **PGADMIN-SETUP.md**: Vollständiger pgAdmin Guide
  - Zugriff über Subdomain und Ports
  - Apache2 Konfiguration
  - Parallelbetrieb nginx/Apache2
  - Troubleshooting
  - Sicherheits-Tipps

- **BACKEND-DIAGNOSE.md**: Backend Fehlerbehebung
  - Schritt-für-Schritt Diagnose
  - Häufige Fehler und Lösungen
  - Performance-Optimierung
  - Debugging-Techniken

- **NACH-INSTALLATION.md**: Post-Installation Guide
  - Checkliste aller wichtigen Schritte
  - SMTP-Konfiguration
  - SSL-Setup
  - Backup-Einrichtung
  - Monitoring

### 6. ✅ Cloudflare Tunnel erweitert

**pgAdmin Subdomain**:
Die Cloudflare Tunnel Konfiguration wird automatisch erweitert:

```yaml
ingress:
  - hostname: fmsv.bartholmes.eu
    service: http://localhost:80
  - hostname: fmsv.bartholmes.eu
    path: /api/*
    service: http://localhost:3000
  - hostname: db.fmsv.bartholmes.eu      # NEU!
    service: http://localhost:1880
  - service: http_status:404
```

DNS wird automatisch konfiguriert für die Subdomain.

## Installation ausführen

### Neu-Installation
```bash
cd /var/www/fmsv-dingden/Installation/scripts
chmod +x install.sh
./install.sh
```

Das Script fragt automatisch nach der pgAdmin Subdomain.

### Existierende Installation aktualisieren
```bash
# Repository aktualisieren
cd /var/www/fmsv-dingden
git pull origin main

# Script neu ausführen (überspringt bereits installierte Komponenten)
cd Installation/scripts
./install.sh
```

## Nach der Installation

### 1. Backend testen
```bash
fmsv-test
```

Falls Probleme gefunden werden:
```bash
fmsv-fix
```

### 2. Zugriff auf pgAdmin (falls installiert)
- **Lokal**: http://localhost:1880
- **Subdomain**: https://db.fmsv.bartholmes.eu
- **IP**: http://DEINE-IP:1880

### 3. Services prüfen
```bash
systemctl status fmsv-backend
systemctl status nginx
systemctl status apache2
systemctl status postgresql
systemctl status cloudflared  # falls aktiviert
```

### 4. API testen
```bash
curl http://localhost:3000/api/health
# Erwartet: {"status":"ok","timestamp":"..."}
```

## Port-Übersicht

Nach der Installation sind folgende Ports aktiv:

| Service | Port | Beschreibung |
|---------|------|--------------|
| nginx HTTP | 80 | Website |
| nginx HTTPS | 443 | Website (SSL) |
| Backend API | 3000 | REST API |
| Apache HTTP | 1880 | pgAdmin |
| Apache HTTPS | 18443 | pgAdmin (SSL) |
| PostgreSQL | 5432 | Datenbank (nur lokal) |

## Diagnose-Befehle

```bash
# Quick Check
fmsv-test                              # Backend Test
fmsv-fix                               # Automatische Reparatur

# Detaillierte Diagnose
fmsv-debug                             # Vollständige System-Diagnose
fmsv-errors                            # Backend-Fehler anzeigen
fmsv-manual                            # Backend manuell starten

# Service Management
systemctl status fmsv-backend          # Backend Status
systemctl restart fmsv-backend         # Backend neu starten
journalctl -u fmsv-backend -f          # Backend Logs live

# Update
fmsv-update                            # System aktualisieren
```

## Troubleshooting

### Backend nicht erreichbar
```bash
# Schnelle Diagnose & Fix
fmsv-test && fmsv-fix

# Oder manuell:
systemctl restart fmsv-backend
ufw allow 3000/tcp
curl http://localhost:3000/api/health
```

### pgAdmin nicht erreichbar
```bash
# Apache Status
systemctl status apache2

# Apache neu starten
systemctl restart apache2

# Ports prüfen
netstat -tulpn | grep -E ':1880|:18443'

# Firewall
ufw allow 1880/tcp
ufw allow 18443/tcp
```

### Port-Konflikte
```bash
# Prüfe welcher Prozess Port belegt
netstat -tulpn | grep ':PORT'
lsof -i :PORT

# Beende Prozess
kill -9 PID

# Services neu starten
systemctl restart nginx apache2 fmsv-backend
```

## Backup-Empfehlung

Nach erfolgreicher Installation:

```bash
# Erstelle Snapshot/Backup des Servers
# Je nach Hoster unterschiedlich

# Oder manuelles Backup:
tar -czf /tmp/fmsv-backup-$(date +%Y%m%d).tar.gz \
  /var/www/fmsv-dingden \
  /etc/nginx \
  /etc/apache2 \
  /etc/systemd/system/fmsv-backend.service

# Datenbank Backup
su - postgres -c "pg_dump fmsv_database > /tmp/fmsv-db-backup-$(date +%Y%m%d).sql"
```

## Sicherheits-Checklist

- [ ] Test-Account Passwörter geändert
- [ ] PostgreSQL Port 5432 nicht öffentlich (nur lokal)
- [ ] Starke Passwörter für pgAdmin
- [ ] SSL/HTTPS aktiviert (Cloudflare oder Let's Encrypt)
- [ ] Firewall aktiviert und konfiguriert
- [ ] Backup-System eingerichtet
- [ ] Auto-Updates aktiviert oder regelmäßige manuelle Updates

## Support

Bei Problemen:

1. **Dokumentation lesen**:
   - [BACKEND-DIAGNOSE.md](./BACKEND-DIAGNOSE.md)
   - [PGADMIN-SETUP.md](./PGADMIN-SETUP.md)
   - [NACH-INSTALLATION.md](./NACH-INSTALLATION.md)

2. **Diagnose ausführen**:
   ```bash
   fmsv-test    # Backend Test
   fmsv-debug   # Vollständige Diagnose
   ```

3. **Automatische Reparatur**:
   ```bash
   fmsv-fix
   ```

4. **Logs prüfen**:
   ```bash
   journalctl -u fmsv-backend -n 100
   tail -f /var/log/nginx/error.log
   ```

## Changelog

### Version 2.1 (2025-10-31)
- ✅ pgAdmin 4 Integration mit Apache2
- ✅ Backend-Erreichbarkeit massiv verbessert
- ✅ Neue Diagnose-Tools (fmsv-test, fmsv-fix, fmsv-errors, fmsv-manual)
- ✅ Port 3000 explizit in Firewall freigegeben
- ✅ Subdomain für pgAdmin
- ✅ Umfangreiche Dokumentation
- ✅ Automatischer Backend-Test nach Installation
- ✅ Parallelbetrieb nginx & Apache2
- ✅ Erweiterte Cloudflare Tunnel Konfiguration

### Version 2.0 (2025-10-30)
- Initiale Release mit vollständigem RBAC und 2FA

---

**Installation erfolgreich? Führe aus: `fmsv-test`** ✅
