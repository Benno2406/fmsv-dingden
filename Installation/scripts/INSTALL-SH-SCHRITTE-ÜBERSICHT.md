# install.sh - Vollständige Schritte-Analyse

## 📊 Aktuelle Struktur (16 Schritte)

### Vorbereitungsphase

**Installations-Modus Auswahl:**
- Auswahl: Production vs. Development
- Hinweis auf dev/setup.sh bei Development

---

### Hauptphase - Installations-Schritte

#### **Schritt 1: System-Prüfung**
- Root-Rechte prüfen
- Debian-Version erkennen
- Internet-Verbindung testen
- Speicherplatz prüfen (mind. 2GB)

#### **Schritt 2: Installations-Optionen**
1. Update-Kanal (Stable/Testing)
2. Cloudflare Tunnel (Ja/Nein)
3. GitHub Repository URL
4. Auto-Update Zeitplan (täglich/wöchentlich/manuell)
- **Zusammenfassung & Bestätigung**

#### **Schritt 3: System-Updates**
- apt-get update
- apt-get upgrade
- **Problem:** Fehlerbehandlung für APT-Warnings/Errors

#### **Schritt 4: Basis-Tools**
- curl, wget, git, nano, ufw, lsb-release, gnupg, software-properties-common, net-tools

#### **Schritt 5: PostgreSQL**
- Installation PostgreSQL + postgresql-contrib
- Service starten & enablen
- Version anzeigen

#### **Schritt 6: pgAdmin 4** (optional)
- Apache2 Installation (Port 1880/18443)
- WSGI-Module
- **WICHTIG:** Ports.conf Konfiguration (1880, 18443)
- pgAdmin Python-Umgebung
- pgAdmin Web-Installation
- Virtual Environment Setup
- Apache-Config für pgAdmin
- Service starten
- **Problem:** Viele Schritte, komplex

#### **Schritt 7: Nginx**
- Installation nginx
- Service starten & enablen
- **Problem:** Keine Default-Config Entfernung

#### **Schritt 8: Node.js**
- NodeSource Repository hinzufügen
- Node.js + npm installieren
- Version prüfen
- **Problem:** Keine Versions-Auswahl (immer latest LTS?)

#### **Schritt 9: Repository klonen**
- Git clone nach /var/www/fmsv-dingden
- Branch auswählen (stable/testing)
- Berechtigungen setzen (755)

#### **Schritt 10: Backend Setup**
- npm install im /backend Verzeichnis
- .env erstellen aus env.example.txt
- Datenbank-Credentials eingeben
- **Problem:** Viele manuelle Eingaben erforderlich

#### **Schritt 11: Datenbank initialisieren**
- PostgreSQL User erstellen
- Datenbank erstellen
- Schema und Tabellen erstellen
- Init-Data einspielen (Roles, Permissions)
- **Problem:** Keine Fehlerprüfung wenn DB schon existiert

#### **Schritt 12: Backend als Systemd Service**
- fmsv-backend.service erstellen
- Service enablen & starten
- Status prüfen
- **Problem:** Startet manchmal nicht sofort

#### **Schritt 13: Frontend Build**
- npm install im Root
- npm run build
- dist/ Verzeichnis erstellen
- **Problem:** Build kann fehlschlagen bei RAM-Mangel

#### **Schritt 14: Nginx Konfiguration**
- Site-Config erstellen (/etc/nginx/sites-available/)
- Frontend (statische Dateien aus dist/)
- API-Proxy (localhost:3000)
- Uploads-Verzeichnis
- Symlink nach sites-enabled/
- nginx -t (Config-Test)
- nginx reload
- **Problem:** Domain muss eingegeben werden

#### **Schritt 15: Cloudflare Tunnel** (optional)
- cloudflared installieren
- cloudflare Login (SSH-Support!)
- Tunnel erstellen
- DNS-Records automatisch erstellen
- **Neu:** pgAdmin-Subdomain erstellen
- Config erstellen
- Service installieren & starten
- **Problem:** Sehr komplex bei SSH, viele Unterabfragen

#### **Schritt 16: Abschluss & Zusammenfassung**
- Firewall-Empfehlung (UFW)
- Erfolgs-Meldung
- Zugangsdaten anzeigen
- Nächste Schritte

---

## ⚠️ Erkannte Probleme

### 1. **Reihenfolge-Probleme**

#### Problem A: pgAdmin vor Nginx
**Aktuell:**
- Schritt 6: pgAdmin (Apache auf 1880)
- Schritt 7: Nginx (Port 80)

**Besser wäre:**
- Nginx zuerst (blockiert Port 80)
- Dann pgAdmin (nutzt 1880 - kein Konflikt)

#### Problem B: Backend Setup vor Datenbank
**Aktuell:**
- Schritt 10: Backend Setup (.env erstellen)
- Schritt 11: Datenbank initialisieren

**Problem:**
- .env braucht DB-Credentials
- Aber DB existiert noch nicht!

**Besser:**
- Datenbank zuerst erstellen
- Dann Backend .env mit korrekten Credentials

#### Problem C: Frontend Build zu spät
**Aktuell:**
- Schritt 13: Frontend Build
- Schritt 14: Nginx Config

**Problem:**
- Nginx Config verweist auf /dist
- Aber dist/ existiert noch nicht beim Testen!

**Besser:**
- Frontend Build vor Nginx-Config
- Dann kann Config sofort getestet werden

### 2. **Fehlerbehandlung**

- **apt-get update:** Warnings werden als Errors behandelt
- **Datenbank:** Keine Prüfung ob DB schon existiert
- **Backend Service:** Startet manchmal nicht sofort
- **Frontend Build:** Keine RAM-Prüfung (kann bei <1GB fehlschlagen)

### 3. **pgAdmin Komplexität**

Der pgAdmin-Schritt ist zu komplex:
- Apache Installation
- Ports-Config
- Python venv
- pgAdmin selbst
- WSGI-Config
- Nginx Reverse Proxy später

**Lösung:** pgAdmin in separates Sub-Script auslagern?

### 4. **Cloudflare SSH-Support**

Sehr viele Unter-Entscheidungen:
- SSH erkannt?
- Methode 1 oder 2?
- WinSCP-Anleitung
- SCP-Anleitung
- URL-Copy-Anleitung

**Macht 50% des Scripts aus!**

---

## 🎯 Optimierte Reihenfolge (Vorschlag)

### Phase 1: System-Vorbereitung
1. **System-Prüfung** (unverändert)
2. **Installations-Optionen** (unverändert)
3. **System-Updates** (apt-get)
4. **Basis-Tools** (curl, wget, git, etc.)

### Phase 2: Datenbank & Backend
5. **PostgreSQL Installation**
6. **Datenbank initialisieren** ⬆️ **NEU: VOR Backend!**
   - DB erstellen
   - User erstellen
   - Credentials notieren
7. **Node.js Installation**
8. **Repository klonen**
9. **Backend Setup** ⬇️ **MIT DB-Credentials von Schritt 6!**
   - npm install
   - .env mit korrekten Credentials
10. **Backend als Service**

### Phase 3: Frontend & Webserver
11. **Frontend Build** ⬆️ **VOR Nginx!**
    - npm install
    - npm run build
    - dist/ existiert jetzt
12. **Nginx Installation**
13. **Nginx Konfiguration** ⬇️ **dist/ existiert schon!**
    - Config mit Domain
    - Sofort testbar

### Phase 4: Zusatz-Dienste
14. **pgAdmin 4** (optional) ⬇️ **Nach Nginx!**
    - Apache auf 1880/18443
    - Nginx Reverse Proxy Sub-Config
15. **Cloudflare Tunnel** (optional)
    - Haupt-Domain
    - pgAdmin-Subdomain (wenn installiert)

### Phase 5: Abschluss
16. **Abschluss & Zusammenfassung**

---

## 📋 Verbesserungsvorschläge

### A. Datenbank-Setup optimieren

**Aktuell:**
```bash
# Schritt 11: Manuell Credentials eingeben
read -p "DB Name: " DB_NAME
read -p "DB User: " DB_USER
read -s -p "DB Password: " DB_PASSWORD
```

**Problem:** Fehleranfällig, Password wird nicht validiert

**Besser:**
```bash
# Auto-generieren mit Rückfrage:
DB_NAME="fmsv_dingden"
DB_USER="fmsv_user"
DB_PASSWORD=$(openssl rand -base64 24)

echo "Generierte Credentials:"
echo "  DB: $DB_NAME"
echo "  User: $DB_USER"
echo "  Pass: $DB_PASSWORD"
echo ""
read -p "Diese verwenden? (j für ja, n für manuell): " -n 1 -r
```

### B. pgAdmin auslagern

```bash
# In Schritt 6:
if [[ $REPLY =~ ^[Jj]$ ]]; then
    ./pgadmin-setup.sh  # Separates Sub-Script!
fi
```

### C. Frontend Build RAM-Check

```bash
# Vor npm run build:
AVAILABLE_RAM=$(free -m | awk 'NR==2 {print $7}')
if [ "$AVAILABLE_RAM" -lt 512 ]; then
    warning "Wenig RAM verfügbar ($AVAILABLE_RAM MB)"
    info "Baue mit reduziertem Memory-Limit..."
    NODE_OPTIONS="--max-old-space-size=512" npm run build
else
    npm run build
fi
```

### D. Nginx Default-Site entfernen

```bash
# Nach Nginx-Installation:
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/fmsv /etc/nginx/sites-enabled/
```

### E. Backend Service Wartezeit

```bash
# Nach systemctl start:
info "Warte auf Backend-Start..."
for i in {1..10}; do
    if systemctl is-active --quiet fmsv-backend; then
        success "Backend gestartet"
        break
    fi
    sleep 1
done
```

---

## 🔄 Migrations-Plan

### Option 1: Komplette Neuordnung (empfohlen)
- Neue install.sh schreiben
- Alte als install-old.sh backup
- Alle Schritte neu testen

### Option 2: Schrittweise Anpassung
1. Datenbank-Schritt nach vorne
2. Frontend-Build nach vorne
3. pgAdmin nach hinten
4. Fehlerbehandlung verbessern

### Option 3: Modular aufteilen
```
install.sh (Hauptscript - kurz!)
├── modules/
│   ├── 01-system-check.sh
│   ├── 02-postgresql.sh
│   ├── 03-database-init.sh
│   ├── 04-nodejs.sh
│   ├── 05-repository.sh
│   ├── 06-backend.sh
│   ├── 07-frontend.sh
│   ├── 08-nginx.sh
│   ├── 09-pgadmin.sh (optional)
│   └── 10-cloudflare.sh (optional)
```

---

## ✅ Nächste Schritte

Was möchtest du tun?

1. **Neuordnung jetzt umsetzen** - Ich erstelle neue install.sh
2. **Modular aufteilen** - Ich erstelle Module
3. **Nur kritische Fixes** - Datenbank + Frontend reihenfolge
4. **Analysieren fortsetzen** - Mehr Details zu einzelnen Schritten

**Empfehlung:** Option 3 (kritische Fixes) für Sofort-Lösung, dann später Option 2 (modular).
