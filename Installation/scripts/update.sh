#!/bin/bash

################################################################################
# FMSV Dingden - Manual Update Script
# Systematische Updates mit Fortschrittsanzeige
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Helper functions
print_header() {
    local step=$1
    local total=$2
    local title=$3
    
    echo ""
    echo -e "${CYAN}$(printf '=%.0s' {1..60})${NC}"
    printf "${CYAN}#${NC}  ${MAGENTA}Schritt %2d von %2d${NC} - ${GREEN}%-38s${NC} ${CYAN}#${NC}\n" "$step" "$total" "$title"
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
║           🔄 FMSV Dingden - Update  🔄                     ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  error "Bitte als root ausführen: sudo ./update.sh"
fi

INSTALL_DIR="/var/www/fmsv-dingden"

if [ ! -d "$INSTALL_DIR" ]; then
  error "Installation nicht gefunden: $INSTALL_DIR"
fi

cd "$INSTALL_DIR"

# Read current configuration
if [ -f "backend/.env" ]; then
  CURRENT_BRANCH=$(grep UPDATE_BRANCH backend/.env | cut -d '=' -f2 | tr -d ' ')
  CURRENT_CHANNEL=$(grep UPDATE_CHANNEL backend/.env | cut -d '=' -f2 | tr -d ' ')
else
  CURRENT_BRANCH="main"
  CURRENT_CHANNEL="Stable"
fi

info "Aktueller Update-Kanal: ${GREEN}$CURRENT_CHANNEL${NC} (Branch: $CURRENT_BRANCH)"

# Check current git status
GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$GIT_BRANCH" != "$CURRENT_BRANCH" ]; then
  warning "Git-Branch ($GIT_BRANCH) stimmt nicht mit Config überein ($CURRENT_BRANCH)"
fi

echo ""
echo -e "${YELLOW}Was möchtest du tun?${NC}"
echo ""
echo "  ${GREEN}[1]${NC} Update durchführen (aktueller Branch: ${CYAN}$CURRENT_BRANCH${NC})"
echo "  ${YELLOW}[2]${NC} Zwischen Stable/Testing wechseln"
echo "  ${RED}[3]${NC} Abbrechen"
echo ""
read -p "   ${BLUE}►${NC} Deine Wahl (1/2/3): " ACTION

################################################################################
# Option 1: Update durchführen
################################################################################

if [ "$ACTION" = "1" ]; then
    TOTAL_STEPS=7
    
    ############################################################################
    # Schritt 1: Auf Updates prüfen
    ############################################################################
    
    print_header 1 $TOTAL_STEPS "Auf Updates prüfen"
    
    info "Fetche Updates von GitHub..."
    git fetch origin > /dev/null 2>&1
    
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse origin/$CURRENT_BRANCH)
    
    if [ "$LOCAL" = "$REMOTE" ]; then
        success "Bereits auf neuestem Stand!"
        echo ""
        echo -e "${GREEN}Keine Updates verfügbar.${NC}"
        echo ""
        exit 0
    fi
    
    success "Updates verfügbar"
    
    echo ""
    echo -e "${YELLOW}Verfügbare Updates:${NC}"
    echo ""
    git log --oneline --decorate --color=always $LOCAL..$REMOTE
    echo ""
    
    read -p "Update jetzt installieren? (j/n) " -n 1 -r
    echo
    [[ ! $REPLY =~ ^[Jj]$ ]] && exit 0
    
    ############################################################################
    # Schritt 2: Backup erstellen
    ############################################################################
    
    print_header 2 $TOTAL_STEPS "Backup erstellen"
    
    BACKUP_DIR="/var/backups/fmsv-$(date +%Y%m%d-%H%M%S)"
    info "Erstelle Backup in $BACKUP_DIR..."
    mkdir -p "$BACKUP_DIR"
    
    # Backup database
    info "Sichere Datenbank..."
    DB_NAME=$(grep DB_NAME backend/.env | cut -d '=' -f2 | tr -d ' ')
    su - postgres -c "pg_dump \"$DB_NAME\"" > "$BACKUP_DIR/database.sql" 2>/dev/null
    success "Datenbank gesichert"
    
    # Backup uploads
    info "Sichere Uploads..."
    if [ -d "Saves" ]; then
        tar -czf "$BACKUP_DIR/uploads.tar.gz" Saves/ 2>/dev/null || true
        success "Uploads gesichert"
    fi
    
    # Backup .env
    info "Sichere Konfiguration..."
    cp backend/.env "$BACKUP_DIR/.env"
    success "Konfiguration gesichert"
    
    success "Backup erstellt: $BACKUP_DIR"
    sleep 1
    
    ############################################################################
    # Schritt 3: Updates ziehen
    ############################################################################
    
    print_header 3 $TOTAL_STEPS "Updates ziehen"
    
    info "Wechsle zu Branch '$CURRENT_BRANCH'..."
    git checkout $CURRENT_BRANCH > /dev/null 2>&1
    
    info "Ziehe Updates..."
    git pull origin $CURRENT_BRANCH
    
    success "Updates erfolgreich gezogen"
    sleep 1
    
    ############################################################################
    # Schritt 4: Backend aktualisieren
    ############################################################################
    
    print_header 4 $TOTAL_STEPS "Backend aktualisieren"
    
    cd backend
    
    info "Installiere Backend-Dependencies..."
    npm install --production --silent > /dev/null 2>&1
    success "Backend-Dependencies aktualisiert"
    
    cd ..
    sleep 1
    
    ############################################################################
    # Schritt 5: Frontend aktualisieren
    ############################################################################
    
    print_header 5 $TOTAL_STEPS "Frontend aktualisieren"
    
    info "Installiere Frontend-Dependencies..."
    npm install --silent > /dev/null 2>&1
    success "Frontend-Dependencies aktualisiert"
    
    info "Baue Frontend..."
    npm run build > /dev/null 2>&1
    success "Frontend gebaut"
    
    sleep 1
    
    ############################################################################
    # Schritt 6: Services neu starten
    ############################################################################
    
    print_header 6 $TOTAL_STEPS "Services neu starten"
    
    info "Starte Backend neu..."
    systemctl restart fmsv-backend
    success "Backend neu gestartet"
    
    info "Starte Nginx neu..."
    systemctl restart nginx
    success "Nginx neu gestartet"
    
    if systemctl is-active --quiet cloudflared; then
        info "Starte Cloudflare Tunnel neu..."
        systemctl restart cloudflared
        success "Cloudflare Tunnel neu gestartet"
    fi
    
    sleep 2
    
    ############################################################################
    # Schritt 7: Überprüfung
    ############################################################################
    
    print_header 7 $TOTAL_STEPS "Überprüfung"
    
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
    
    CURRENT_COMMIT=$(git rev-parse --short HEAD)
    success "Aktueller Commit: $CURRENT_COMMIT"
    
    sleep 1
    
    # Success message
    clear
    echo -e "${GREEN}"
    cat << "EOF"
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║              ✅  Update erfolgreich!  🎉                    ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    echo ""
    
    echo -e "${CYAN}$(printf '═%.0s' {1..60})${NC}"
    echo -e "${YELLOW}📊 Update-Zusammenfassung${NC}"
    echo -e "${CYAN}$(printf '═%.0s' {1..60})${NC}"
    echo ""
    echo "  ${BLUE}•${NC} Update-Kanal:  ${GREEN}$CURRENT_CHANNEL${NC}"
    echo "  ${BLUE}•${NC} Branch:        ${GREEN}$CURRENT_BRANCH${NC}"
    echo "  ${BLUE}•${NC} Commit:        ${GREEN}$CURRENT_COMMIT${NC}"
    echo "  ${BLUE}•${NC} Backup:        ${GREEN}$BACKUP_DIR${NC}"
    echo ""
    echo -e "${CYAN}$(printf '═%.0s' {1..60})${NC}"
    echo ""

################################################################################
# Option 2: Branch wechseln
################################################################################

elif [ "$ACTION" = "2" ]; then
    TOTAL_STEPS=8
    
    ############################################################################
    # Schritt 1: Branch-Auswahl
    ############################################################################
    
    print_header 1 $TOTAL_STEPS "Branch-Auswahl"
    
    echo -e "${YELLOW}Aktueller Kanal:${NC} ${GREEN}$CURRENT_CHANNEL${NC}"
    echo ""
    echo "Wechseln zu:"
    echo "  ${GREEN}[1]${NC} Stable   - Stabile Releases"
    echo "  ${YELLOW}[2]${NC} Testing  - Neueste Features"
    echo ""
    read -p "   ${BLUE}►${NC} Deine Wahl (1/2): " BRANCH_CHOICE
    
    case $BRANCH_CHOICE in
      1)
        NEW_BRANCH="main"
        NEW_CHANNEL="Stable"
        ;;
      2)
        NEW_BRANCH="testing"
        NEW_CHANNEL="Testing"
        ;;
      *)
        error "Ungültige Auswahl"
        ;;
    esac
    
    if [ "$NEW_BRANCH" = "$CURRENT_BRANCH" ]; then
        info "Bereits auf $NEW_CHANNEL"
        exit 0
    fi
    
    echo ""
    warning "Du wechselst von '${YELLOW}$CURRENT_CHANNEL${NC}' zu '${GREEN}$NEW_CHANNEL${NC}'"
    echo ""
    echo "  Dies kann zu Inkompatibilitäten führen!"
    echo "  Ein Backup wird automatisch erstellt."
    echo ""
    read -p "Fortfahren? (j/n) " -n 1 -r
    echo
    [[ ! $REPLY =~ ^[Jj]$ ]] && exit 0
    
    ############################################################################
    # Schritt 2: Backup erstellen
    ############################################################################
    
    print_header 2 $TOTAL_STEPS "Backup erstellen"
    
    BACKUP_DIR="/var/backups/fmsv-branch-switch-$(date +%Y%m%d-%H%M%S)"
    info "Erstelle Backup in $BACKUP_DIR..."
    mkdir -p "$BACKUP_DIR"
    
    DB_NAME=$(grep DB_NAME backend/.env | cut -d '=' -f2 | tr -d ' ')
    
    info "Sichere Datenbank..."
    su - postgres -c "pg_dump \"$DB_NAME\"" > "$BACKUP_DIR/database.sql" 2>/dev/null
    success "Datenbank gesichert"
    
    info "Sichere Uploads..."
    if [ -d "Saves" ]; then
        tar -czf "$BACKUP_DIR/uploads.tar.gz" Saves/ 2>/dev/null || true
        success "Uploads gesichert"
    fi
    
    info "Sichere Konfiguration..."
    cp backend/.env "$BACKUP_DIR/.env"
    success "Konfiguration gesichert"
    
    success "Backup erstellt: $BACKUP_DIR"
    sleep 1
    
    ############################################################################
    # Schritt 3: Branch wechseln
    ############################################################################
    
    print_header 3 $TOTAL_STEPS "Branch wechseln"
    
    info "Fetche Updates..."
    git fetch origin > /dev/null 2>&1
    
    info "Wechsle zu Branch '$NEW_BRANCH'..."
    git checkout $NEW_BRANCH > /dev/null 2>&1
    
    info "Ziehe neueste Changes..."
    git pull origin $NEW_BRANCH
    
    success "Branch gewechselt: $NEW_BRANCH"
    sleep 1
    
    ############################################################################
    # Schritt 4: Konfiguration aktualisieren
    ############################################################################
    
    print_header 4 $TOTAL_STEPS "Konfiguration aktualisieren"
    
    info "Aktualisiere .env mit neuem Branch..."
    sed -i "s/UPDATE_CHANNEL=.*/UPDATE_CHANNEL=$NEW_CHANNEL/" backend/.env
    sed -i "s/UPDATE_BRANCH=.*/UPDATE_BRANCH=$NEW_BRANCH/" backend/.env
    
    success "Konfiguration aktualisiert"
    sleep 1
    
    ############################################################################
    # Schritt 5: Backend aktualisieren
    ############################################################################
    
    print_header 5 $TOTAL_STEPS "Backend aktualisieren"
    
    cd backend
    
    info "Installiere Backend-Dependencies..."
    npm install --production --silent > /dev/null 2>&1
    success "Backend-Dependencies installiert"
    
    cd ..
    sleep 1
    
    ############################################################################
    # Schritt 6: Frontend aktualisieren
    ############################################################################
    
    print_header 6 $TOTAL_STEPS "Frontend aktualisieren"
    
    info "Installiere Frontend-Dependencies..."
    npm install --silent > /dev/null 2>&1
    success "Frontend-Dependencies installiert"
    
    info "Baue Frontend..."
    npm run build > /dev/null 2>&1
    success "Frontend gebaut"
    
    sleep 1
    
    ############################################################################
    # Schritt 7: Services neu starten
    ############################################################################
    
    print_header 7 $TOTAL_STEPS "Services neu starten"
    
    info "Starte Backend neu..."
    systemctl restart fmsv-backend
    success "Backend neu gestartet"
    
    info "Starte Nginx neu..."
    systemctl restart nginx
    success "Nginx neu gestartet"
    
    if systemctl is-active --quiet cloudflared; then
        info "Starte Cloudflare Tunnel neu..."
        systemctl restart cloudflared
        success "Cloudflare Tunnel neu gestartet"
    fi
    
    sleep 2
    
    ############################################################################
    # Schritt 8: Überprüfung
    ############################################################################
    
    print_header 8 $TOTAL_STEPS "Überprüfung"
    
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
    
    CURRENT_COMMIT=$(git rev-parse --short HEAD)
    success "Aktueller Commit: $CURRENT_COMMIT"
    
    sleep 1
    
    # Success message
    clear
    echo -e "${GREEN}"
    cat << "EOF"
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║           ✅  Branch-Wechsel erfolgreich!  🎉               ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    echo ""
    
    echo -e "${CYAN}$(printf '═%.0s' {1..60})${NC}"
    echo -e "${YELLOW}📊 Branch-Wechsel Zusammenfassung${NC}"
    echo -e "${CYAN}$(printf '═%.0s' {1..60})${NC}"
    echo ""
    echo "  ${BLUE}•${NC} Alter Kanal:   ${YELLOW}$CURRENT_CHANNEL${NC}"
    echo "  ${BLUE}•${NC} Neuer Kanal:   ${GREEN}$NEW_CHANNEL${NC}"
    echo "  ${BLUE}•${NC} Branch:        ${GREEN}$NEW_BRANCH${NC}"
    echo "  ${BLUE}•${NC} Commit:        ${GREEN}$CURRENT_COMMIT${NC}"
    echo "  ${BLUE}•${NC} Backup:        ${GREEN}$BACKUP_DIR${NC}"
    echo ""
    echo -e "${CYAN}$(printf '═%.0s' {1..60})${NC}"
    echo ""

################################################################################
# Option 3: Abbrechen
################################################################################

elif [ "$ACTION" = "3" ]; then
    info "Update abgebrochen"
    exit 0
else
    error "Ungültige Auswahl"
fi

# Final info
echo -e "${BLUE}⚙️  Services:${NC}"
echo "  • Backend: ${GREEN}systemctl status fmsv-backend${NC}"
echo "  • Nginx:   ${GREEN}systemctl status nginx${NC}"
echo ""
echo -e "${BLUE}🌐 Website:${NC}"
echo "  • Prüfe:   ${GREEN}https://fmsv.bartholmes.eu${NC}"
echo ""
