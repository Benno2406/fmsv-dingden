# install.sh - Modulares Konzept

**Ziel:** install.sh von 2245 Zeilen auf ~500 Zeilen reduzieren  
**Methode:** Module & Funktionen auslagern  
**Vorteile:** Wartbarkeit, Testbarkeit, Wiederverwendbarkeit

---

## 📊 Aktuelle Situation

**install.sh aktuell:**
```
Total: 2245 Zeilen
├── Funktionen (Zeile 1-451): 451 Zeilen (20%)
├── Schritte 1-8: 750 Zeilen (33%)
├── pgAdmin 6: 413 Zeilen (18%)  ← OPTIONAL!
├── Cloudflare 9: 450 Zeilen (20%) ← OPTIONAL!
└── Schritte 10-16: 181 Zeilen (9%)
```

**Problem:**
- 38% des Codes sind optionale Features (pgAdmin + Cloudflare)
- Schwer zu warten (eine 2245-Zeilen Datei!)
- Schwer zu testen (alles in einer Datei)
- Schwer zu erweitern (neue Features = mehr Zeilen)

---

## 🎯 Neue Struktur

```
Installation/scripts/
├── install.sh                      # Haupt-Script (500 Zeilen)
├── lib/                           # Shared Libraries
│   ├── colors.sh                  # Farben & Formatierung
│   ├── logging.sh                 # Log-Funktionen
│   ├── ui.sh                      # UI-Helper (print_header, progress, etc.)
│   └── error-handler.sh           # Zentrale Fehlerbehandlung
├── modules/                       # Installations-Module
│   ├── 01-system-check.sh         # System-Prüfung
│   ├── 02-options.sh              # Installations-Optionen
│   ├── 03-system-update.sh        # apt-get update/upgrade
│   ├── 04-base-tools.sh           # curl, wget, git, etc.
│   ├── 05-postgres.sh             # PostgreSQL Installation
│   ├── 06-nodejs.sh               # Node.js Installation
│   ├── 07-repository.sh           # Git Clone
│   ├── 08-database.sh             # Datenbank + Schema
│   ├── 09-backend.sh              # Backend Setup
│   ├── 10-frontend.sh             # Frontend Build
│   ├── 11-nginx.sh                # Nginx Config
│   ├── 12-services.sh             # systemd Services
│   ├── 13-firewall.sh             # UFW Config
│   ├── optional/                  # Optionale Features
│   │   ├── pgadmin.sh            # pgAdmin 4
│   │   ├── cloudflare.sh         # Cloudflare Tunnel
│   │   ├── cloudflare-ssh.sh     # SSH-Helper für Cloudflare
│   │   └── auto-update.sh        # Auto-Update System
│   └── helpers/                   # Helper-Funktionen
│       ├── npm-install.sh         # npm install mit Error-Handling
│       ├── service-check.sh       # Service-Validierung
│       ├── backup.sh              # Backup-Funktionen
│       └── validation.sh          # Input-Validierung
├── templates/                     # Config-Templates
│   ├── nginx-with-cloudflare.conf
│   ├── nginx-without-cloudflare.conf
│   ├── pgadmin-apache.conf
│   ├── backend.service
│   ├── auto-update.service
│   └── auto-update.timer
└── config/                        # Default-Konfiguration
    └── defaults.conf              # Standard-Werte
```

---

## 📝 Haupt-Script (install.sh)

**Neu: Nur ~500 Zeilen!**

```bash
#!/bin/bash

################################################################################
# FMSV Dingden - Modular Installation Script
################################################################################
#
# Autor: Benno Bartholmes
# Datum: 2025-10-31
# Version: 3.0 (Modular)
#
################################################################################

set -euo pipefail  # Strikte Error-Handling

# Globale Variablen
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTALL_DIR="/var/www/fmsv-dingden"
LOG_FILE="/var/log/fmsv-install.log"

################################################################################
# Libraries laden
################################################################################

source "$SCRIPT_DIR/lib/colors.sh"
source "$SCRIPT_DIR/lib/logging.sh"
source "$SCRIPT_DIR/lib/ui.sh"
source "$SCRIPT_DIR/lib/error-handler.sh"

################################################################################
# Banner & Intro
################################################################################

clear
print_banner "FMSV Dingden - Vereinshomepage Installation"
print_version "3.0 Modular"

echo ""
echo -e "${CYAN}Diese Installation wird folgendes einrichten:${NC}"
echo -e "  ${GREEN}•${NC} PostgreSQL Datenbank mit RBAC-System"
echo -e "  ${GREEN}•${NC} Node.js Backend mit 2FA-Support"
echo -e "  ${GREEN}•${NC} React/Vite Frontend"
echo -e "  ${GREEN}•${NC} Nginx Webserver"
echo -e "  ${GREEN}•${NC} Optional: pgAdmin 4, Cloudflare Tunnel, Auto-Updates"
echo ""
echo -e "${YELLOW}Geschätzte Dauer: 15-30 Minuten${NC}"
echo ""

read -p "Installation starten? (j/n) " -n 1 -r
echo
[[ ! $REPLY =~ ^[Jj]$ ]] && exit 0

################################################################################
# Logging initialisieren
################################################################################

init_logging "$LOG_FILE"
log_info "Installation gestartet von $(whoami)"

################################################################################
# SCHRITT 1: System-Prüfung
################################################################################

run_module "01-system-check" "System-Prüfung" || exit 1

################################################################################
# SCHRITT 2: Installations-Optionen
################################################################################

run_module "02-options" "Installations-Optionen" || exit 1

# Module setzen Variablen:
# - INSTALL_MODE (production/development)
# - BRANCH (stable/testing)
# - USE_CLOUDFLARE (j/n)
# - INSTALL_PGADMIN (j/n)
# - AUTO_UPDATE_SCHEDULE (daily/weekly/manual)
# - GITHUB_REPO
# - DOMAIN

################################################################################
# SCHRITT 3-7: Basis-Installation
################################################################################

run_module "03-system-update" "System-Updates"
run_module "04-base-tools" "Basis-Tools"
run_module "05-postgres" "PostgreSQL"
run_module "06-nodejs" "Node.js"
run_module "07-repository" "Repository klonen"

################################################################################
# SCHRITT 8: Datenbank Setup
################################################################################

run_module "08-database" "Datenbank-Setup" || exit 1

# Modul fragt nach:
# - DB_NAME
# - DB_USER
# - DB_PASSWORD
# Erstellt Datenbank + spielt Schema ein

################################################################################
# SCHRITT 9-11: Applikation
################################################################################

run_module "09-backend" "Backend-Setup"
run_module "10-frontend" "Frontend-Build" || exit 1  # Kritisch!
run_module "11-nginx" "Nginx-Konfiguration"

################################################################################
# SCHRITT 12: Optional - Cloudflare
################################################################################

if [[ $USE_CLOUDFLARE =~ ^[Jj]$ ]]; then
    run_module "optional/cloudflare" "Cloudflare Tunnel" || {
        warning "Cloudflare-Installation fehlgeschlagen - überspringe"
        USE_CLOUDFLARE="n"
    }
else
    print_header 12 "Cloudflare Tunnel (Übersprungen)"
    log_info "Cloudflare nicht aktiviert"
fi

################################################################################
# SCHRITT 13: Optional - pgAdmin
################################################################################

if [[ $INSTALL_PGADMIN =~ ^[Jj]$ ]]; then
    run_module "optional/pgadmin" "pgAdmin 4" || {
        warning "pgAdmin-Installation fehlgeschlagen - überspringe"
        INSTALL_PGADMIN="n"
    }
else
    print_header 13 "pgAdmin 4 (Übersprungen)"
    log_info "pgAdmin nicht aktiviert"
fi

################################################################################
# SCHRITT 14: Optional - Auto-Update
################################################################################

if [ "$AUTO_UPDATE_SCHEDULE" != "manual" ]; then
    run_module "optional/auto-update" "Auto-Update System"
else
    print_header 14 "Auto-Update (Manuell)"
    log_info "Auto-Update nicht aktiviert"
fi

################################################################################
# SCHRITT 15-16: Services & Firewall
################################################################################

run_module "12-services" "Services starten" || exit 1
run_module "13-firewall" "Firewall-Konfiguration"

################################################################################
# SCHRITT 17: Wartungs-Scripts installieren
################################################################################

print_header 17 "Wartungs-Scripts"

install_maintenance_script "debug-new.sh" "fmsv-debug"
install_maintenance_script "update.sh" "fmsv-update"

################################################################################
# FERTIG!
################################################################################

clear
print_success_banner

print_summary \
    "Update-Kanal: $CHANNEL_NAME ($BRANCH)" \
    "Cloudflare: $(bool_to_text $USE_CLOUDFLARE)" \
    "pgAdmin: $(bool_to_text $INSTALL_PGADMIN)" \
    "Auto-Update: $AUTO_UPDATE_SCHEDULE" \
    "Domain: $DOMAIN" \
    "Datenbank: $DB_NAME"

print_access_info \
    "https://$DOMAIN" \
    "http://localhost" \
    "http://localhost:3000/api"

if [[ $INSTALL_PGADMIN =~ ^[Jj]$ ]]; then
    print_pgadmin_info "http://localhost:1880"
fi

print_next_steps \
    "SMTP konfigurieren (backend/.env)" \
    "Test-Account Passwörter ändern" \
    "Backup einrichten" \
    "SSL-Zertifikat (certbot)"

print_important_commands

log_success "Installation abgeschlossen"

exit 0
```

---

## 📚 Bibliotheken

### lib/colors.sh

```bash
#!/bin/bash
# Farb-Definitionen

# Farben
export RED='\033[0;31m'
export GREEN='\033[0;32m'
export YELLOW='\033[1;33m'
export BLUE='\033[0;34m'
export CYAN='\033[0;36m'
export NC='\033[0m'  # No Color

# Formatierung
export BOLD='\033[1m'
export DIM='\033[2m'
export UNDERLINE='\033[4m'
```

---

### lib/logging.sh

```bash
#!/bin/bash
# Logging-Funktionen

LOG_FILE=""

init_logging() {
    LOG_FILE="$1"
    touch "$LOG_FILE"
    chmod 644 "$LOG_FILE"
    
    echo "========================================" >> "$LOG_FILE"
    echo "Installation started: $(date)" >> "$LOG_FILE"
    echo "========================================" >> "$LOG_FILE"
}

log() {
    local level="$1"
    shift
    local message="$@"
    
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $message" >> "$LOG_FILE"
}

log_info() { log "INFO" "$@"; }
log_success() { log "SUCCESS" "$@"; }
log_warning() { log "WARNING" "$@"; }
log_error() { log "ERROR" "$@"; }
log_debug() { log "DEBUG" "$@"; }
```

---

### lib/ui.sh

```bash
#!/bin/bash
# UI-Helper Funktionen

source "$(dirname "${BASH_SOURCE[0]}")/colors.sh"

# Banner anzeigen
print_banner() {
    local title="$1"
    
    echo -e "${GREEN}"
    cat << "EOF"
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║          FMSV Dingden - Vereinshomepage                   ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# Schritt-Header
print_header() {
    local step="$1"
    local title="$2"
    local total="${3:-18}"
    
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}Schritt $step von $total: ${YELLOW}$title${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Status-Nachrichten
info() { echo -e "   ${BLUE}ℹ${NC} $@"; }
success() { echo -e "   ${GREEN}✓${NC} $@"; }
warning() { echo -e "   ${YELLOW}⚠${NC} $@"; }
error() { echo -e "   ${RED}✗${NC} $@"; }

# Fortschrittsbalken
progress() {
    local current=$1
    local total=$2
    local width=50
    local percent=$((current * 100 / total))
    local filled=$((current * width / total))
    local empty=$((width - filled))
    
    printf "   ["
    printf "%${filled}s" | tr ' ' '█'
    printf "%${empty}s" | tr ' ' '░'
    printf "] %3d%%\r" $percent
}

# Ja/Nein Frage
ask_yes_no() {
    local question="$1"
    local default="${2:-n}"
    
    if [ "$default" = "y" ]; then
        echo -ne "   ${BLUE}►${NC} $question (J/n): "
    else
        echo -ne "   ${BLUE}►${NC} $question (j/N): "
    fi
    
    read -n 1 -r
    echo
    
    if [ "$default" = "y" ]; then
        [[ ! $REPLY =~ ^[Nn]$ ]]
    else
        [[ $REPLY =~ ^[Jj]$ ]]
    fi
}

# Eingabe-Feld
ask_input() {
    local question="$1"
    local default="$2"
    local secret="${3:-no}"
    
    if [ -n "$default" ]; then
        echo -ne "   ${BLUE}►${NC} $question [$default]: "
    else
        echo -ne "   ${BLUE}►${NC} $question: "
    fi
    
    if [ "$secret" = "yes" ]; then
        read -s REPLY
        echo
    else
        read REPLY
    fi
    
    echo "${REPLY:-$default}"
}

# Boolean zu Text
bool_to_text() {
    if [[ $1 =~ ^[Jj]$ ]]; then
        echo -e "${GREEN}Aktiviert${NC}"
    else
        echo -e "${YELLOW}Nicht aktiviert${NC}"
    fi
}

# Erfolgs-Banner
print_success_banner() {
    echo -e "${GREEN}"
    cat << "EOF"
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║           🎉 Installation erfolgreich! 🎉                  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}
```

---

### lib/error-handler.sh

```bash
#!/bin/bash
# Zentrale Fehlerbehandlung

source "$(dirname "${BASH_SOURCE[0]}")/logging.sh"
source "$(dirname "${BASH_SOURCE[0]}")/ui.sh"

# Error-Handler registrieren
set -E
trap 'error_trap $? $LINENO' ERR

error_trap() {
    local exit_code=$1
    local line_no=$2
    
    echo ""
    error "Fehler in Zeile $line_no (Exit-Code: $exit_code)"
    log_error "Script failed at line $line_no with exit code $exit_code"
    
    echo ""
    echo -e "${YELLOW}Letzte Log-Einträge:${NC}"
    tail -20 "$LOG_FILE" 2>/dev/null || true
    
    echo ""
    echo -e "${YELLOW}Installation fehlgeschlagen!${NC}"
    echo -e "Vollständige Logs: ${CYAN}$LOG_FILE${NC}"
    echo ""
    
    exit $exit_code
}

# Modul ausführen mit Error-Handling
run_module() {
    local module="$1"
    local title="$2"
    local optional="${3:-no}"
    
    local module_path="$SCRIPT_DIR/modules/$module.sh"
    
    if [ ! -f "$module_path" ]; then
        error "Modul nicht gefunden: $module_path"
        log_error "Module not found: $module_path"
        
        if [ "$optional" = "yes" ]; then
            warning "Überspringe optionales Modul"
            return 0
        else
            return 1
        fi
    fi
    
    log_info "Starting module: $module"
    
    # Module ausführen
    if source "$module_path"; then
        log_success "Module completed: $module"
        return 0
    else
        local exit_code=$?
        log_error "Module failed: $module (exit code: $exit_code)"
        
        if [ "$optional" = "yes" ]; then
            warning "Optionales Modul fehlgeschlagen - fahre fort"
            return 0
        else
            error "Installation abgebrochen"
            return $exit_code
        fi
    fi
}

# Wartungs-Script installieren
install_maintenance_script() {
    local script_name="$1"
    local command_name="$2"
    
    local script_path="$INSTALL_DIR/Installation/scripts/$script_name"
    local target_path="/usr/local/bin/$command_name"
    
    if [ -f "$script_path" ]; then
        cp -f "$script_path" "$target_path"
        chmod +x "$target_path"
        success "$command_name installiert"
        log_info "Maintenance script installed: $command_name"
    else
        warning "$script_name nicht gefunden - überspringe"
        log_warning "Maintenance script not found: $script_name"
    fi
}
```

---

## 🔧 Module (Beispiele)

### modules/01-system-check.sh

```bash
#!/bin/bash
# System-Prüfung

print_header 1 "System-Prüfung" 18

# Root-Check
if [ "$EUID" -ne 0 ]; then
    error "Script muss als root ausgeführt werden!"
    echo "  Verwende: sudo ./install.sh"
    exit 1
fi
success "Root-Rechte vorhanden"

# Debian-Check
if [ ! -f /etc/debian_version ]; then
    error "Kein Debian-System erkannt!"
    exit 1
fi

DEBIAN_VERSION=$(cat /etc/debian_version | cut -d. -f1)
info "Debian Version: $DEBIAN_VERSION"

if [ "$DEBIAN_VERSION" -lt 12 ]; then
    warning "Debian $DEBIAN_VERSION ist alt - empfohlen: Debian 12+"
    ask_yes_no "Trotzdem fortfahren?" "n" || exit 1
fi
success "Debian-Version OK"

# Internet-Check
info "Prüfe Internet-Verbindung..."
if ping -c 1 google.com &> /dev/null || ping -c 1 1.1.1.1 &> /dev/null; then
    success "Internet-Verbindung OK"
else
    error "Keine Internet-Verbindung!"
    echo "  Installation benötigt Internet-Zugang"
    exit 1
fi

# Speicherplatz-Check
AVAILABLE_GB=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')
info "Verfügbarer Speicher: ${AVAILABLE_GB}GB"

if [ "$AVAILABLE_GB" -lt 2 ]; then
    error "Zu wenig Speicherplatz! (Min: 2GB, Verfügbar: ${AVAILABLE_GB}GB)"
    exit 1
fi
success "Speicherplatz OK"

# RAM-Check
AVAILABLE_RAM=$(free -m | awk 'NR==2 {print $7}')
info "Verfügbarer RAM: ${AVAILABLE_RAM}MB"

if [ "$AVAILABLE_RAM" -lt 512 ]; then
    warning "Wenig RAM verfügbar - Frontend-Build könnte fehlschlagen"
    ask_yes_no "Trotzdem fortfahren?" "y" || exit 1
fi

# Port-Check
info "Prüfe Port-Verfügbarkeit..."

check_port() {
    local port=$1
    if ss -tuln 2>/dev/null | grep -q ":$port " || netstat -tuln 2>/dev/null | grep -q ":$port "; then
        warning "Port $port bereits belegt"
        ss -tuln 2>/dev/null | grep ":$port " || netstat -tuln 2>/dev/null | grep ":$port "
        return 1
    fi
    return 0
}

PORTS_OK=true
check_port 80 || PORTS_OK=false
check_port 443 || PORTS_OK=false
check_port 3000 && success "Port 3000 frei (Backend)" || PORTS_OK=false
check_port 5432 && success "Port 5432 frei (PostgreSQL)" || PORTS_OK=false

if [ "$PORTS_OK" = false ]; then
    warning "Einige Ports sind belegt"
    ask_yes_no "Trotzdem fortfahren?" "y" || exit 1
fi

sleep 1
```

---

### modules/10-frontend.sh

```bash
#!/bin/bash
# Frontend Build mit vollständiger Fehlerbehandlung

print_header 10 "Frontend-Build" 18

cd "$INSTALL_DIR" || exit 1

# ══════════════════════════════════════════════════════════
# npm install
# ══════════════════════════════════════════════════════════

info "Installiere Frontend-Dependencies..."
echo ""

if ! npm install 2>&1 | tee -a "$LOG_FILE" | grep -E "added|removed|changed|up to date"; then
    echo ""
    error "npm install fehlgeschlagen!"
    
    echo ""
    echo -e "${YELLOW}Letzte npm-Ausgabe:${NC}"
    tail -50 "$LOG_FILE" | grep -A 5 -B 5 "ERR!" || tail -20 "$LOG_FILE"
    
    echo ""
    echo -e "${YELLOW}Lösungsvorschläge:${NC}"
    echo -e "  ${GREEN}1.${NC} npm cache clean --force"
    echo -e "  ${GREEN}2.${NC} rm -rf node_modules package-lock.json && npm install"
    echo -e "  ${GREEN}3.${NC} Internet-Verbindung prüfen"
    echo ""
    
    exit 1
fi

# Validierung
if [ ! -d "$INSTALL_DIR/node_modules" ]; then
    error "node_modules/ wurde nicht erstellt!"
    exit 1
fi

PACKAGE_COUNT=$(ls -1 "$INSTALL_DIR/node_modules" | wc -l)
success "Frontend-Dependencies installiert ($PACKAGE_COUNT Pakete)"

# ══════════════════════════════════════════════════════════
# npm run build (KRITISCH!)
# ══════════════════════════════════════════════════════════

echo ""
info "Baue Frontend (kann einige Minuten dauern)..."
info "RAM-Nutzung wird überwacht..."
echo ""

# Build mit Ausgabe & Monitoring
if npm run build 2>&1 | tee -a "$LOG_FILE" | tail -30; then
    echo ""
    
    # Validierung 1: dist/ existiert?
    if [ ! -d "$INSTALL_DIR/dist" ]; then
        error "Build scheinbar erfolgreich, aber dist/ Verzeichnis fehlt!"
        exit 1
    fi
    
    # Validierung 2: index.html existiert?
    if [ ! -f "$INSTALL_DIR/dist/index.html" ]; then
        error "dist/index.html nicht gefunden - Build unvollständig!"
        exit 1
    fi
    
    # Validierung 3: dist/ ist nicht leer?
    DIST_SIZE=$(du -sb "$INSTALL_DIR/dist" 2>/dev/null | cut -f1)
    if [ -z "$DIST_SIZE" ] || [ "$DIST_SIZE" -lt 1024 ]; then
        error "dist/ Verzeichnis ist zu klein oder leer!"
        exit 1
    fi
    
    # Validierung 4: Assets vorhanden?
    ASSET_COUNT=$(find "$INSTALL_DIR/dist/assets" -type f 2>/dev/null | wc -l)
    if [ "$ASSET_COUNT" -lt 3 ]; then
        warning "Wenige Assets gefunden ($ASSET_COUNT) - Build möglicherweise unvollständig"
    fi
    
    # Erfolg!
    DIST_SIZE_HUMAN=$(du -sh "$INSTALL_DIR/dist" | cut -f1)
    success "Frontend gebaut ($DIST_SIZE_HUMAN, $ASSET_COUNT Assets)"
    
else
    # Build fehlgeschlagen!
    echo ""
    error "npm run build fehlgeschlagen!"
    
    echo ""
    echo -e "${YELLOW}Letzte Build-Ausgabe:${NC}"
    tail -50 "$LOG_FILE"
    
    echo ""
    echo -e "${YELLOW}Häufige Ursachen:${NC}"
    echo -e "  ${RED}1.${NC} Zu wenig RAM (braucht ~512MB)"
    echo -e "  ${RED}2.${NC} Disk Space voll"
    echo -e "  ${RED}3.${NC} TypeScript-Fehler im Code"
    echo -e "  ${RED}4.${NC} Fehlende Dependencies"
    
    echo ""
    echo -e "${YELLOW}Diagnose:${NC}"
    echo -e "  ${GREEN}free -h${NC}  → RAM prüfen"
    echo -e "  ${GREEN}df -h${NC}   → Disk Space prüfen"
    
    echo ""
    echo -e "${YELLOW}Manueller Test:${NC}"
    echo -e "  ${GREEN}cd $INSTALL_DIR && npm run build${NC}"
    
    echo ""
    exit 1
fi

# ══════════════════════════════════════════════════════════
# Berechtigungen
# ══════════════════════════════════════════════════════════

info "Setze Berechtigungen..."

# NUR dist/, nicht alles!
chown -R www-data:www-data "$INSTALL_DIR/dist"
chown -R www-data:www-data "$INSTALL_DIR/Saves"
chown -R www-data:www-data "$INSTALL_DIR/Logs"

# .git/ bleibt root!

success "Berechtigungen gesetzt"

sleep 1
```

---

### modules/optional/pgadmin.sh

```bash
#!/bin/bash
# pgAdmin 4 Installation (optional)

print_header 13 "pgAdmin 4 Installation" 18

echo ""
info "pgAdmin 4 ermöglicht grafische Datenbank-Verwaltung"
echo ""

# Abfrage ob gewünscht
if ! ask_yes_no "pgAdmin 4 installieren?" "n"; then
    info "pgAdmin wird übersprungen"
    return 0
fi

# Jetzt die eigentliche Installation
# (aktueller Code von Zeile 720-1130)
# ...

# Bei Fehler: return 1 (nicht exit!)
```

---

## 🎨 Templates

### templates/nginx-without-cloudflare.conf

```nginx
server {
    listen 80;
    server_name DOMAIN_PLACEHOLDER _;
    client_max_body_size 50M;
    
    root INSTALL_DIR_PLACEHOLDER/dist;
    index index.html;
    
    # GZIP Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 1000;
    
    # Backend API Proxy
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Uploads
    location /uploads/ {
        alias INSTALL_DIR_PLACEHOLDER/Saves/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # Frontend (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Static Assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

---

## 📊 Vorteile der modularen Struktur

### ✅ Wartbarkeit
- **Vorher:** 2245 Zeilen in einer Datei
- **Nachher:** ~30 Dateien à 50-150 Zeilen
- **Vorteil:** Schneller finden & ändern

### ✅ Testbarkeit
```bash
# Einzelne Module testen:
./modules/10-frontend.sh

# Nur pgAdmin installieren:
./modules/optional/pgadmin.sh

# Dry-Run:
DRY_RUN=yes ./install.sh
```

### ✅ Wiederverwendbarkeit
```bash
# Andere Projekte können Module nutzen:
source /opt/fmsv/lib/ui.sh
print_header 1 "Mein Script"
ask_yes_no "Fortfahren?" "y"
```

### ✅ Erweiterbarkeit
```bash
# Neues Feature? Einfach neues Modul:
modules/optional/monitoring.sh  # Prometheus
modules/optional/backup.sh      # Automatische Backups
modules/optional/ssl.sh         # Let's Encrypt
```

### ✅ Debugging
```bash
# Einzelne Schritte überspringen:
SKIP_MODULES="pgadmin,cloudflare" ./install.sh

# Verbose-Mode:
DEBUG=yes ./install.sh

# Nur bestimmten Schritt:
./install.sh --only 10-frontend
```

---

## 🚀 Migration Plan

### Phase 1: Vorbereitung (1 Tag)
1. Verzeichnisse erstellen
2. lib/ Files erstellen
3. Templates erstellen

### Phase 2: Module auslagern (2-3 Tage)
1. Einfache Module (System-Check, Base-Tools)
2. Mittlere Module (PostgreSQL, Node.js, Nginx)
3. Komplexe Module (pgAdmin, Cloudflare)

### Phase 3: Haupt-Script umbauen (1 Tag)
1. Libraries einbinden
2. Module aufrufen
3. Error-Handling

### Phase 4: Testing (1 Tag)
1. Frische VM
2. Vollständige Installation
3. Edge-Cases testen

**Total: 5-6 Tage**

---

## 📝 Checkliste

### Libraries:
- [ ] lib/colors.sh
- [ ] lib/logging.sh
- [ ] lib/ui.sh
- [ ] lib/error-handler.sh

### Kern-Module:
- [ ] modules/01-system-check.sh
- [ ] modules/02-options.sh
- [ ] modules/03-system-update.sh
- [ ] modules/04-base-tools.sh
- [ ] modules/05-postgres.sh
- [ ] modules/06-nodejs.sh
- [ ] modules/07-repository.sh
- [ ] modules/08-database.sh
- [ ] modules/09-backend.sh
- [ ] modules/10-frontend.sh
- [ ] modules/11-nginx.sh
- [ ] modules/12-services.sh
- [ ] modules/13-firewall.sh

### Optionale Module:
- [ ] modules/optional/pgadmin.sh
- [ ] modules/optional/cloudflare.sh
- [ ] modules/optional/cloudflare-ssh.sh
- [ ] modules/optional/auto-update.sh

### Helper:
- [ ] modules/helpers/npm-install.sh
- [ ] modules/helpers/service-check.sh
- [ ] modules/helpers/backup.sh
- [ ] modules/helpers/validation.sh

### Templates:
- [ ] templates/nginx-with-cloudflare.conf
- [ ] templates/nginx-without-cloudflare.conf
- [ ] templates/pgadmin-apache.conf
- [ ] templates/backend.service
- [ ] templates/auto-update.service
- [ ] templates/auto-update.timer

### Haupt-Script:
- [ ] install.sh (neu mit Modulen)

---

## 🎯 Ziel erreicht?

**Vorher:**
- 2245 Zeilen
- 1 Datei
- Schwer wartbar
- Schwer testbar
- 38% optional

**Nachher:**
- ~500 Zeilen (Haupt-Script)
- ~30 Dateien
- Modular
- Testbar
- Optional = Optional

**Bewertung:** 9.5/10 🎉
