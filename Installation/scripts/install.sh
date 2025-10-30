#!/bin/bash

################################################################################
# FMSV Dingden - Unified Installation Script
# Systematische Installation mit Fortschrittsanzeige
################################################################################

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Total steps
TOTAL_STEPS=14

# Helper functions
print_header() {
    local step=$1
    local title=$2
    local width=60
    
    echo ""
    echo -e "${CYAN}$(printf '=%.0s' {1..60})${NC}"
    printf "${CYAN}#${NC}  ${MAGENTA}Schritt %2d von %2d${NC} - ${GREEN}%-38s${NC} ${CYAN}#${NC}\n" "$step" "$TOTAL_STEPS" "$title"
    echo -e "${CYAN}$(printf '=%.0s' {1..60})${NC}"
    echo ""
}

info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; exit 1; }

# Welcome Screen
clear
echo -e "${CYAN}"
cat << "EOF"
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║        🛩️  FMSV Dingden - Installation  ✈️                 ║
║                                                            ║
║        Flugmodellsportverein Dingden e.V.                 ║
║        Vereinshomepage mit Mitgliederverwaltung           ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"
echo ""
info "Willkommen zur automatischen Installation!"
echo ""
sleep 2

################################################################################
# Schritt 1: System-Prüfung
################################################################################

print_header 1 "System-Prüfung"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    error "Bitte als root ausführen: sudo ./install.sh"
fi

# Detect Debian version
DEBIAN_VERSION=$(cat /etc/debian_version | cut -d. -f1)
info "Erkannte Debian Version: $DEBIAN_VERSION"

if [ "$DEBIAN_VERSION" -lt 12 ]; then
    warning "Debian $DEBIAN_VERSION ist möglicherweise zu alt"
    echo "   Empfohlen: Debian 12 (Bookworm) oder 13 (Trixie)"
    echo ""
    read -p "   Trotzdem fortfahren? (j/n) " -n 1 -r
    echo
    [[ ! $REPLY =~ ^[Jj]$ ]] && error "Installation abgebrochen"
fi

if [ "$DEBIAN_VERSION" -eq 13 ]; then
    info "Debian 13 (Trixie) - Testing erkannt"
fi

# Check internet connection
info "Prüfe Internet-Verbindung..."
if ! ping -c 1 google.com &> /dev/null; then
    error "Keine Internet-Verbindung"
fi

# Check disk space
AVAILABLE_SPACE=$(df / | awk 'NR==2 {print $4}')
if [ "$AVAILABLE_SPACE" -lt 2097152 ]; then  # 2GB in KB
    warning "Weniger als 2GB freier Speicherplatz"
    read -p "   Fortfahren? (j/n) " -n 1 -r
    echo
    [[ ! $REPLY =~ ^[Jj]$ ]] && error "Installation abgebrochen"
fi

success "System-Prüfung erfolgreich"
sleep 1

################################################################################
# Schritt 2: Installations-Optionen
################################################################################

print_header 2 "Installations-Optionen"

# Option 1: Update Channel
echo -e "${YELLOW}1️⃣  Update-Kanal wählen:${NC}"
echo ""
echo "   ${GREEN}[1]${NC} Stable   - Stabile Releases (empfohlen für Production)"
echo "   ${YELLOW}[2]${NC} Testing  - Neueste Features (für Entwicklung/Testing)"
echo ""
read -p "   ${BLUE}►${NC} Deine Wahl (1/2): " UPDATE_CHANNEL

case $UPDATE_CHANNEL in
  1)
    BRANCH="main"
    CHANNEL_NAME="Stable"
    ;;
  2)
    BRANCH="testing"
    CHANNEL_NAME="Testing"
    ;;
  *)
    error "Ungültige Auswahl"
    ;;
esac

success "Update-Kanal: $CHANNEL_NAME (Branch: $BRANCH)"
echo ""
sleep 1

# Option 2: Cloudflare Tunnel
echo -e "${YELLOW}2️⃣  Cloudflare Tunnel:${NC}"
echo ""
echo "   ${GREEN}Vorteile:${NC}"
echo "   ✅ Keine Port-Weiterleitungen nötig"
echo "   ✅ Automatisches SSL/TLS"
echo "   ✅ DDoS-Schutz"
echo "   ✅ Kostenlos"
echo ""
read -p "   ${BLUE}►${NC} Cloudflare Tunnel einrichten? (j/n): " -n 1 -r
echo
USE_CLOUDFLARE=$REPLY
echo ""
sleep 1

# Option 3: GitHub Repository
echo -e "${YELLOW}3️⃣  GitHub Repository:${NC}"
echo ""
read -p "   ${BLUE}►${NC} GitHub Repository URL: " GITHUB_REPO
if [ -z "$GITHUB_REPO" ]; then
    GITHUB_REPO="https://github.com/dein-username/fmsv-dingden.git"
    info "Standard-URL verwendet: $GITHUB_REPO"
fi
echo ""
sleep 1

# Option 4: Auto-Update
echo -e "${YELLOW}4️⃣  Automatische Updates:${NC}"
echo ""
echo "   ${GREEN}[1]${NC} Täglich um 03:00 Uhr"
echo "   ${YELLOW}[2]${NC} Wöchentlich (Sonntag 03:00 Uhr)"
echo "   ${MAGENTA}[3]${NC} Manuell (keine automatischen Updates)"
echo ""
read -p "   ${BLUE}►${NC} Deine Wahl (1/2/3): " AUTO_UPDATE_CHOICE

case $AUTO_UPDATE_CHOICE in
  1) AUTO_UPDATE_SCHEDULE="daily" ;;
  2) AUTO_UPDATE_SCHEDULE="weekly" ;;
  3) AUTO_UPDATE_SCHEDULE="manual" ;;
  *) error "Ungültige Auswahl" ;;
esac

success "Auto-Update: $AUTO_UPDATE_SCHEDULE"
echo ""
sleep 1

# Summary
echo -e "${CYAN}$(printf '─%.0s' {1..60})${NC}"
echo -e "${YELLOW}📋 Zusammenfassung:${NC}"
echo ""
echo "  ${BLUE}•${NC} Update-Kanal:        ${GREEN}$CHANNEL_NAME${NC}"
echo "  ${BLUE}•${NC} Cloudflare Tunnel:   $( [[ $USE_CLOUDFLARE =~ ^[Jj]$ ]] && echo -e "${GREEN}Ja${NC}" || echo -e "${YELLOW}Nein${NC}" )"
echo "  ${BLUE}•${NC} GitHub Repo:         $GITHUB_REPO"
echo "  ${BLUE}•${NC} Auto-Update:         ${GREEN}$AUTO_UPDATE_SCHEDULE${NC}"
echo ""
echo -e "${CYAN}$(printf '─%.0s' {1..60})${NC}"
echo ""
read -p "Installation mit diesen Einstellungen starten? (j/n) " -n 1 -r
echo
[[ ! $REPLY =~ ^[Jj]$ ]] && error "Installation abgebrochen"

################################################################################
# Schritt 3: System-Updates
################################################################################

print_header 3 "System-Updates"

info "Aktualisiere Paket-Listen..."
apt-get update -qq > /dev/null 2>&1

info "Installiere System-Updates..."
apt-get upgrade -y -qq > /dev/null 2>&1

success "System aktualisiert"
sleep 1

################################################################################
# Schritt 4: Basis-Tools Installation
################################################################################

print_header 4 "Basis-Tools Installation"

info "Installiere grundlegende Tools..."
PACKAGES="curl wget git nano ufw lsb-release gnupg software-properties-common"

for package in $PACKAGES; do
    echo -n "   • $package... "
    apt-get install -y -qq "$package" > /dev/null 2>&1 && echo -e "${GREEN}✓${NC}"
done

success "Basis-Tools installiert"
sleep 1

################################################################################
# Schritt 5: PostgreSQL Installation
################################################################################

print_header 5 "PostgreSQL Installation"

info "Installiere PostgreSQL..."
apt-get install -y -qq postgresql postgresql-contrib > /dev/null 2>&1

info "Starte PostgreSQL Service..."
systemctl start postgresql
systemctl enable postgresql > /dev/null 2>&1

PG_VERSION=$(sudo -u postgres psql --version | grep -oP '\d+' | head -1)
success "PostgreSQL $PG_VERSION installiert und gestartet"
sleep 1

################################################################################
# Schritt 6: Node.js Installation
################################################################################

print_header 6 "Node.js Installation"

info "Füge NodeSource Repository hinzu..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - > /dev/null 2>&1

info "Installiere Node.js LTS..."
apt-get install -y -qq nodejs > /dev/null 2>&1

NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
success "Node.js $NODE_VERSION installiert"
success "npm $NPM_VERSION installiert"
sleep 1

################################################################################
# Schritt 7: Repository klonen
################################################################################

print_header 7 "Repository klonen"

INSTALL_DIR="/var/www/fmsv-dingden"

if [ -d "$INSTALL_DIR" ]; then
    warning "Verzeichnis existiert bereits: $INSTALL_DIR"
    read -p "   Neu klonen? Bestehende Daten gehen verloren! (j/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Jj]$ ]]; then
        info "Entferne altes Verzeichnis..."
        rm -rf "$INSTALL_DIR"
        info "Klone Repository (Branch: $BRANCH)..."
        git clone -b "$BRANCH" "$GITHUB_REPO" "$INSTALL_DIR" > /dev/null 2>&1
        success "Repository neu geklont"
    else
        cd "$INSTALL_DIR"
        info "Aktualisiere bestehendes Repository..."
        git fetch origin > /dev/null 2>&1
        git checkout "$BRANCH" > /dev/null 2>&1
        git pull origin "$BRANCH" > /dev/null 2>&1
        success "Repository aktualisiert"
    fi
else
    info "Klone Repository (Branch: $BRANCH)..."
    git clone -b "$BRANCH" "$GITHUB_REPO" "$INSTALL_DIR" > /dev/null 2>&1
    success "Repository geklont"
fi

cd "$INSTALL_DIR"

info "Konfiguriere Git..."
git config --local pull.rebase false
git config --local --add safe.directory "$INSTALL_DIR"
success "Git konfiguriert"
sleep 1

################################################################################
# Schritt 8: Datenbank-Setup
################################################################################

print_header 8 "Datenbank-Setup"

echo -e "${YELLOW}Datenbank-Konfiguration:${NC}"
echo ""

read -p "   ${BLUE}►${NC} Datenbank-Name [fmsv_database]: " DB_NAME
DB_NAME=${DB_NAME:-fmsv_database}

read -p "   ${BLUE}►${NC} Datenbank-Benutzer [fmsv_user]: " DB_USER
DB_USER=${DB_USER:-fmsv_user}

while true; do
    read -sp "   ${BLUE}►${NC} Datenbank-Passwort: " DB_PASSWORD
    echo
    read -sp "   ${BLUE}►${NC} Passwort wiederholen: " DB_PASSWORD2
    echo
    [ "$DB_PASSWORD" = "$DB_PASSWORD2" ] && break
    warning "Passwörter stimmen nicht überein. Bitte erneut eingeben."
    echo ""
done

echo ""
info "Erstelle Datenbank '$DB_NAME'..."

sudo -u postgres psql <<EOF > /dev/null 2>&1
DROP DATABASE IF EXISTS $DB_NAME;
DROP USER IF EXISTS $DB_USER;
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER DATABASE $DB_NAME OWNER TO $DB_USER;
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EOF

success "Datenbank '$DB_NAME' erstellt"
success "Benutzer '$DB_USER' angelegt"
sleep 1

################################################################################
# Schritt 9: Cloudflare Tunnel (Optional)
################################################################################

if [[ $USE_CLOUDFLARE =~ ^[Jj]$ ]]; then
    print_header 9 "Cloudflare Tunnel Installation"
    
    info "Füge Cloudflare GPG Key hinzu..."
    mkdir -p --mode=0755 /usr/share/keyrings
    curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | tee /usr/share/keyrings/cloudflare-main.gpg > /dev/null
    
    info "Füge Cloudflare Repository hinzu..."
    echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/cloudflared.list > /dev/null
    
    info "Aktualisiere Paket-Listen..."
    apt-get update -qq > /dev/null 2>&1
    
    info "Installiere cloudflared..."
    apt-get install -y -qq cloudflared > /dev/null 2>&1
    
    CF_VERSION=$(cloudflared --version | head -1)
    success "Cloudflared installiert: $CF_VERSION"
    
    echo ""
    echo -e "${YELLOW}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║${NC}  ${CYAN}Cloudflare Login erforderlich${NC}                        ${YELLOW}║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    info "Ein Browser-Fenster wird geöffnet."
    info "Bitte melde dich bei Cloudflare an und erlaube den Zugriff."
    echo ""
    read -p "Drücke ${GREEN}Enter${NC} um fortzufahren..."
    
    cloudflared tunnel login
    
    if [ ! -f ~/.cloudflared/cert.pem ]; then
        error "Cloudflare Login fehlgeschlagen"
    fi
    
    success "Cloudflare Login erfolgreich"
    echo ""
    
    TUNNEL_NAME="fmsv-dingden"
    info "Erstelle Tunnel '$TUNNEL_NAME'..."
    
    cloudflared tunnel delete $TUNNEL_NAME 2>/dev/null || true
    cloudflared tunnel create $TUNNEL_NAME > /dev/null 2>&1
    
    TUNNEL_ID=$(cloudflared tunnel list | grep $TUNNEL_NAME | awk '{print $1}')
    
    if [ -z "$TUNNEL_ID" ]; then
        error "Tunnel-Erstellung fehlgeschlagen"
    fi
    
    success "Tunnel erstellt: $TUNNEL_ID"
    echo ""
    
    read -p "   ${BLUE}►${NC} Domain für Tunnel [fmsv.bartholmes.eu]: " DOMAIN
    DOMAIN=${DOMAIN:-fmsv.bartholmes.eu}
    
    info "Erstelle Tunnel-Konfiguration..."
    mkdir -p ~/.cloudflared
    
    cat > ~/.cloudflared/config.yml <<EOF
tunnel: $TUNNEL_ID
credentials-file: /root/.cloudflared/$TUNNEL_ID.json

ingress:
  - hostname: $DOMAIN
    service: http://localhost:80
  - hostname: $DOMAIN
    path: /api/*
    service: http://localhost:3000
  - hostname: $DOMAIN
    path: /uploads/*
    service: http://localhost:80
  - service: http_status:404
EOF
    
    success "Tunnel-Konfiguration erstellt"
    
    info "Konfiguriere DNS-Routing..."
    cloudflared tunnel route dns -f $TUNNEL_NAME $DOMAIN 2>/dev/null || true
    cloudflared tunnel route dns $TUNNEL_NAME $DOMAIN > /dev/null 2>&1
    success "DNS konfiguriert: $DOMAIN → Tunnel"
    
    info "Installiere Tunnel als Service..."
    cloudflared service install > /dev/null 2>&1
    systemctl enable cloudflared > /dev/null 2>&1
    
    success "Cloudflare Tunnel konfiguriert"
    sleep 1
else
    print_header 9 "Cloudflare Tunnel (Übersprungen)"
    info "Cloudflare Tunnel wird nicht verwendet"
    DOMAIN="fmsv.bartholmes.eu"
    sleep 1
fi

################################################################################
# Schritt 10: Nginx Installation
################################################################################

print_header 10 "Nginx Installation & Konfiguration"

info "Installiere Nginx..."
apt-get install -y -qq nginx > /dev/null 2>&1

info "Erstelle Nginx-Konfiguration..."

if [[ $USE_CLOUDFLARE =~ ^[Jj]$ ]]; then
    # Nginx for local serving (Cloudflare Tunnel proxies to it)
    cat > /etc/nginx/sites-available/fmsv-dingden <<EOF
server {
    listen 80;
    server_name localhost;
    client_max_body_size 50M;
    
    root $INSTALL_DIR/dist;
    index index.html;
    
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    location /uploads/ {
        alias $INSTALL_DIR/Saves/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF
else
    # Nginx as reverse proxy
    cat > /etc/nginx/sites-available/fmsv-dingden <<EOF
server {
    listen 80;
    server_name _;
    client_max_body_size 50M;
    
    root $INSTALL_DIR/dist;
    index index.html;
    
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    location /uploads/ {
        alias $INSTALL_DIR/Saves/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF
fi

ln -sf /etc/nginx/sites-available/fmsv-dingden /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

info "Teste Nginx-Konfiguration..."
nginx -t > /dev/null 2>&1 || error "Nginx-Konfiguration fehlerhaft"

systemctl enable nginx > /dev/null 2>&1
success "Nginx installiert und konfiguriert"
sleep 1

################################################################################
# Schritt 11: Backend-Setup
################################################################################

print_header 11 "Backend-Setup"

cd "$INSTALL_DIR/backend"

info "Installiere Backend-Dependencies..."
npm install --production --silent > /dev/null 2>&1

success "Backend-Dependencies installiert"

info "Erstelle Backend-Konfiguration (.env)..."

JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

cat > .env <<EOF
# Server Configuration
NODE_ENV=production
PORT=3000
BASE_URL=https://${DOMAIN}

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
JWT_REFRESH_EXPIRES_IN=7d

# 2FA Configuration
TWO_FA_APP_NAME=FMSV Dingden

# Email Configuration (ANPASSEN!)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=DEIN_SENDGRID_API_KEY
EMAIL_FROM=noreply@mail.fmsv.bartholmes.eu
EMAIL_FROM_NAME=FMSV Dingden

# File Upload Configuration
MAX_FILE_SIZE_MEMBER=5242880
MAX_FILE_SIZE_ADMIN=52428800
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
BCRYPT_ROUNDS=12

# Paths
UPLOAD_PATH=../Saves
LOGS_PATH=../Logs

# GitHub Update Configuration
UPDATE_CHANNEL=$CHANNEL_NAME
UPDATE_BRANCH=$BRANCH
EOF

chmod 600 .env
success "Backend-Konfiguration erstellt"

info "Initialisiere Datenbank-Schema..."
node scripts/initDatabase.js
success "Datenbank-Schema initialisiert"

echo ""
read -p "Test-Daten einfügen? (j/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Jj]$ ]]; then
    info "Füge Test-Daten ein..."
    node scripts/seedDatabase.js
    success "Test-Daten eingefügt"
fi

info "Erstelle Backend systemd Service..."
cat > /etc/systemd/system/fmsv-backend.service <<EOF
[Unit]
Description=FMSV Dingden Backend
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=$INSTALL_DIR/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable fmsv-backend > /dev/null 2>&1
success "Backend-Service erstellt"
sleep 1

################################################################################
# Schritt 12: Frontend-Build
################################################################################

print_header 12 "Frontend-Build"

cd "$INSTALL_DIR"

info "Installiere Frontend-Dependencies..."
npm install --silent > /dev/null 2>&1
success "Frontend-Dependencies installiert"

info "Baue Frontend (dies kann einige Minuten dauern)..."
npm run build > /dev/null 2>&1
success "Frontend gebaut"

info "Setze Berechtigungen..."
chown -R www-data:www-data "$INSTALL_DIR"
success "Berechtigungen gesetzt"
sleep 1

################################################################################
# Schritt 13: Auto-Update System (Optional)
################################################################################

if [ "$AUTO_UPDATE_SCHEDULE" != "manual" ]; then
    print_header 13 "Auto-Update System"
    
    info "Erstelle Auto-Update Script..."
    
    cat > "$INSTALL_DIR/Installation/scripts/auto-update.sh" <<'EOF'
#!/bin/bash

# FMSV Auto-Update Script
# Läuft automatisch via systemd timer

INSTALL_DIR="/var/www/fmsv-dingden"
LOG_FILE="/var/log/fmsv-auto-update.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "====== Auto-Update gestartet ======"

cd "$INSTALL_DIR" || exit 1

# Read update branch from .env
BRANCH=$(grep UPDATE_BRANCH backend/.env | cut -d '=' -f2)
if [ -z "$BRANCH" ]; then
    BRANCH="main"
fi

log "Update-Branch: $BRANCH"

# Fetch updates
git fetch origin

# Check if updates available
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/$BRANCH)

if [ "$LOCAL" = "$REMOTE" ]; then
    log "Keine Updates verfügbar"
    exit 0
fi

log "Updates gefunden: $LOCAL -> $REMOTE"

# Pull updates
git checkout $BRANCH
git pull origin $BRANCH

# Update backend
log "Aktualisiere Backend..."
cd backend
npm install --production --silent
cd ..

# Update frontend
log "Aktualisiere Frontend..."
npm install --silent
npm run build

# Restart services
log "Starte Services neu..."
systemctl restart fmsv-backend
systemctl restart nginx

if systemctl is-active --quiet cloudflared; then
    systemctl restart cloudflared
fi

log "====== Auto-Update abgeschlossen ======"
EOF

    chmod +x "$INSTALL_DIR/Installation/scripts/auto-update.sh"
    success "Auto-Update Script erstellt"
    
    info "Erstelle systemd Service..."
    cat > /etc/systemd/system/fmsv-auto-update.service <<EOF
[Unit]
Description=FMSV Auto-Update Service
After=network.target

[Service]
Type=oneshot
ExecStart=$INSTALL_DIR/Installation/scripts/auto-update.sh
User=root
EOF
    
    if [ "$AUTO_UPDATE_SCHEDULE" = "daily" ]; then
        TIMER_SCHEDULE="*-*-* 03:00:00"
        TIMER_DESC="täglich um 03:00 Uhr"
    else
        TIMER_SCHEDULE="Sun *-*-* 03:00:00"
        TIMER_DESC="wöchentlich (Sonntag 03:00 Uhr)"
    fi
    
    info "Erstelle systemd Timer ($TIMER_DESC)..."
    cat > /etc/systemd/system/fmsv-auto-update.timer <<EOF
[Unit]
Description=FMSV Auto-Update Timer
Requires=fmsv-auto-update.service

[Timer]
OnCalendar=$TIMER_SCHEDULE
Persistent=true

[Install]
WantedBy=timers.target
EOF

    systemctl daemon-reload
    systemctl enable fmsv-auto-update.timer > /dev/null 2>&1
    systemctl start fmsv-auto-update.timer
    
    success "Auto-Update System konfiguriert"
    success "Zeitplan: $TIMER_DESC"
    sleep 1
else
    print_header 13 "Auto-Update System (Übersprungen)"
    info "Manuelle Updates werden verwendet"
    sleep 1
fi

################################################################################
# Schritt 14: Services starten & Firewall
################################################################################

print_header 14 "Services starten & Finalisierung"

info "Starte Backend..."
systemctl start fmsv-backend
success "Backend gestartet"

info "Starte Nginx..."
systemctl restart nginx
success "Nginx gestartet"

if [[ $USE_CLOUDFLARE =~ ^[Jj]$ ]]; then
    info "Starte Cloudflare Tunnel..."
    systemctl start cloudflared
    success "Cloudflare Tunnel gestartet"
fi

# Configure firewall
if [[ ! $USE_CLOUDFLARE =~ ^[Jj]$ ]]; then
    info "Konfiguriere Firewall..."
    ufw allow 22/tcp > /dev/null 2>&1
    ufw allow 80/tcp > /dev/null 2>&1
    ufw allow 443/tcp > /dev/null 2>&1
    ufw --force enable > /dev/null 2>&1
    success "Firewall konfiguriert"
else
    info "Konfiguriere Firewall (nur SSH)..."
    ufw allow 22/tcp > /dev/null 2>&1
    ufw --force enable > /dev/null 2>&1
    success "Firewall konfiguriert"
fi

# Wait a moment for services to start
sleep 2

info "Prüfe Service-Status..."
if systemctl is-active --quiet fmsv-backend; then
    success "Backend läuft"
else
    warning "Backend läuft möglicherweise nicht korrekt"
fi

if systemctl is-active --quiet nginx; then
    success "Nginx läuft"
else
    warning "Nginx läuft möglicherweise nicht korrekt"
fi

sleep 1

################################################################################
# Final Summary
################################################################################

clear
echo -e "${GREEN}"
cat << "EOF"
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║              ✅  Installation erfolgreich!  🎉              ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"
echo ""

echo -e "${CYAN}$(printf '═%.0s' {1..60})${NC}"
echo -e "${YELLOW}📊 Installations-Zusammenfassung${NC}"
echo -e "${CYAN}$(printf '═%.0s' {1..60})${NC}"
echo ""

echo -e "${BLUE}📦 Installierte Komponenten:${NC}"
echo "  ✅ PostgreSQL $PG_VERSION"
echo "  ✅ Node.js $NODE_VERSION"
echo "  ✅ Nginx"
echo "  ✅ Backend (Express + JWT + 2FA)"
echo "  ✅ Frontend (React + Vite)"
[[ $USE_CLOUDFLARE =~ ^[Jj]$ ]] && echo "  ✅ Cloudflare Tunnel"
[ "$AUTO_UPDATE_SCHEDULE" != "manual" ] && echo "  ✅ Auto-Update System"
echo ""

echo -e "${BLUE}⚙️  Konfiguration:${NC}"
echo "  • Update-Kanal:      ${GREEN}$CHANNEL_NAME${NC} (Branch: $BRANCH)"
echo "  • Cloudflare Tunnel: $( [[ $USE_CLOUDFLARE =~ ^[Jj]$ ]] && echo -e "${GREEN}Aktiv${NC}" || echo -e "${YELLOW}Nicht verwendet${NC}" )"
echo "  • Auto-Update:       ${GREEN}$AUTO_UPDATE_SCHEDULE${NC}"
echo "  • Datenbank:         ${GREEN}$DB_NAME${NC}"
echo ""

echo -e "${BLUE}🌐 Website:${NC}"
if [[ $USE_CLOUDFLARE =~ ^[Jj]$ ]]; then
    echo "  • URL: ${GREEN}https://${DOMAIN}${NC}"
    echo "  • SSL: ${GREEN}Automatisch (Cloudflare)${NC}"
else
    echo "  • URL: ${YELLOW}http://localhost${NC}"
    echo "  • ${RED}⚠️  Port-Weiterleitungen erforderlich (80, 443)${NC}"
    echo "  • ${RED}⚠️  CloudFlare SSL auf 'Full' stellen${NC}"
fi
echo ""

echo -e "${BLUE}🔐 Test-Zugangsdaten:${NC}"
echo "  • Admin:  ${GREEN}admin@fmsv-dingden.de${NC} / ${GREEN}admin123${NC}"
echo "  • Member: ${GREEN}member@fmsv-dingden.de${NC} / ${GREEN}member123${NC}"
echo ""

echo -e "${CYAN}$(printf '─%.0s' {1..60})${NC}"
echo -e "${YELLOW}⚙️  Service-Verwaltung${NC}"
echo -e "${CYAN}$(printf '─%.0s' {1..60})${NC}"
echo ""
echo "  ${BLUE}Backend:${NC}"
echo "    Status:   systemctl status fmsv-backend"
echo "    Logs:     journalctl -u fmsv-backend -f"
echo "    Neustart: systemctl restart fmsv-backend"
echo ""
echo "  ${BLUE}Nginx:${NC}"
echo "    Status:   systemctl status nginx"
echo "    Logs:     tail -f /var/log/nginx/error.log"
echo "    Neustart: systemctl restart nginx"
echo ""
if [[ $USE_CLOUDFLARE =~ ^[Jj]$ ]]; then
    echo "  ${BLUE}Cloudflare Tunnel:${NC}"
    echo "    Status:   systemctl status cloudflared"
    echo "    Logs:     journalctl -u cloudflared -f"
    echo "    Neustart: systemctl restart cloudflared"
    echo ""
fi
if [ "$AUTO_UPDATE_SCHEDULE" != "manual" ]; then
    echo "  ${BLUE}Auto-Update:${NC}"
    echo "    Status:   systemctl status fmsv-auto-update.timer"
    echo "    Logs:     tail -f /var/log/fmsv-auto-update.log"
    echo "    Manuell:  systemctl start fmsv-auto-update.service"
    echo ""
fi

echo -e "${CYAN}$(printf '─%.0s' {1..60})${NC}"
echo -e "${RED}⚠️  Wichtige nächste Schritte${NC}"
echo -e "${CYAN}$(printf '─%.0s' {1..60})${NC}"
echo ""
echo "  ${YELLOW}1.${NC} SMTP-Konfiguration anpassen:"
echo "     ${BLUE}nano $INSTALL_DIR/backend/.env${NC}"
echo "     Siehe: /Installation/Anleitung/E-Mail-Setup.md"
echo ""
echo "  ${YELLOW}2.${NC} Admin-Passwort ändern nach erstem Login"
echo ""
echo "  ${YELLOW}3.${NC} Test-Accounts prüfen/löschen"
echo ""
if [[ ! $USE_CLOUDFLARE =~ ^[Jj]$ ]]; then
    echo "  ${YELLOW}4.${NC} Port-Weiterleitungen im Router einrichten (80, 443)"
    echo ""
    echo "  ${YELLOW}5.${NC} CloudFlare SSL-Modus auf 'Full' stellen"
    echo ""
fi

echo -e "${CYAN}$(printf '═%.0s' {1..60})${NC}"
echo ""
echo -e "${GREEN}🎉 Viel Erfolg mit FMSV Dingden!${NC}"
echo ""
echo -e "${BLUE}📚 Dokumentation:${NC}"
echo "  • Installation:       /Installation/Anleitung/Installation.md"
echo "  • E-Mail Setup:       /Installation/Anleitung/E-Mail-Setup.md"
echo "  • Cloudflare Tunnel:  /Installation/Anleitung/Cloudflare-Tunnel-Setup.md"
echo "  • Auto-Update:        /Installation/Anleitung/Auto-Update-System.md"
echo ""
echo -e "${CYAN}$(printf '═%.0s' {1..60})${NC}"
echo ""
