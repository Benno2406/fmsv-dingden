#!/bin/bash
################################################################################
# FMSV Dingden - Modular Installation Script
################################################################################
#
# Autor: Benno Bartholmes
# Datum: 2025-10-31
# Version: 3.0 (Modular Refactored)
#
# Beschreibung:
#   Modulare Installation der FMSV Dingden Vereinshomepage mit:
#   - PostgreSQL Datenbank mit vollständigem RBAC-System
#   - Node.js Backend mit 2FA-Support
#   - React/Vite Frontend
#   - Nginx Webserver
#   - Optional: pgAdmin 4, Cloudflare Tunnel, Auto-Updates
#
################################################################################

set -euo pipefail  # Strikte Error-Handling

################################################################################
# Globale Variablen
################################################################################

# Verzeichnisse
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export SCRIPT_DIR
export LIB_DIR="$SCRIPT_DIR/lib"
export MODULES_DIR="$SCRIPT_DIR/modules"
export TEMPLATES_DIR="$SCRIPT_DIR/templates"

# Installation
export INSTALL_DIR="/var/www/fmsv-dingden"
export LOG_FILE="/var/log/fmsv-install.log"

# Versionierung
SCRIPT_VERSION="3.0-modular"

################################################################################
# Libraries laden
################################################################################

if [ ! -d "$LIB_DIR" ]; then
    echo "ERROR: lib/ Verzeichnis nicht gefunden: $LIB_DIR"
    echo "Bitte stelle sicher, dass die Installation vollständig ist."
    exit 1
fi

source "$LIB_DIR/colors.sh"
source "$LIB_DIR/logging.sh"
source "$LIB_DIR/ui.sh"
source "$LIB_DIR/error-handler.sh"

################################################################################
# Banner & Intro
################################################################################

clear
print_banner
print_version "$SCRIPT_VERSION"

################################################################################
# Logging initialisieren
################################################################################

init_logging "$LOG_FILE"
log_info "===== Installation Started ====="
log_info "Version: $SCRIPT_VERSION"
log_info "User: $(whoami)"
log_info "Directory: $INSTALL_DIR"

echo ""
echo -e "${CYAN}Diese Installation richtet folgendes ein:${NC}"
echo -e "  ${GREEN}•${NC} PostgreSQL Datenbank mit granularem RBAC-System"
echo -e "  ${GREEN}•${NC} Node.js Backend mit JWT & 2FA-Support"
echo -e "  ${GREEN}•${NC} React/Vite Frontend mit modernem UI"
echo -e "  ${GREEN}•${NC} Nginx Webserver mit SSL-Support"
echo -e "  ${GREEN}•${NC} Optional: pgAdmin 4, Cloudflare Tunnel, Auto-Updates"
echo ""
echo -e "${YELLOW}⏱️  Geschätzte Dauer: 15-30 Minuten${NC}"
echo -e "${YELLOW}📝 Alle Aktionen werden geloggt nach: ${CYAN}$LOG_FILE${NC}"
echo ""

if ! ask_yes_no "Installation starten?" "y"; then
    info "Installation abgebrochen"
    log_info "Installation aborted by user"
    exit 0
fi

################################################################################
# SCHRITT 1: System-Prüfung
################################################################################

run_module "01-system-check" "System-Prüfung" "no" "1" "18"

################################################################################
# SCHRITT 2: Installations-Optionen
################################################################################

run_module "02-options" "Installations-Optionen" "no" "2" "18"

# Exportierte Variablen aus Modul 02:
# - INSTALL_MODE
# - BRANCH
# - CHANNEL_NAME
# - GITHUB_REPO
# - DOMAIN
# - USE_CLOUDFLARE
# - INSTALL_PGADMIN
# - PGADMIN_DOMAIN
# - AUTO_UPDATE_SCHEDULE

################################################################################
# SCHRITT 3: System-Updates
################################################################################

run_module "03-system-update" "System-Updates" "no" "3" "18"

################################################################################
# SCHRITT 4: Basis-Tools
################################################################################

run_module "04-base-tools" "Basis-Tools" "no" "4" "18"

################################################################################
# SCHRITT 5: PostgreSQL
################################################################################

run_module "05-postgres" "PostgreSQL Installation" "no" "5" "18"

################################################################################
# SCHRITT 6: Node.js
################################################################################

run_module "06-nodejs" "Node.js Installation" "no" "6" "18"

################################################################################
# SCHRITT 7: Repository klonen
################################################################################

run_module "07-repository" "Repository klonen" "no" "7" "18"

################################################################################
# SCHRITT 8: Datenbank-Setup
################################################################################

run_module "08-database" "Datenbank-Setup" "no" "8" "18"

################################################################################
# SCHRITT 9: Backend-Setup
################################################################################

run_module "09-backend" "Backend-Setup" "no" "9" "18"

################################################################################
# SCHRITT 10: Frontend-Build (KRITISCH!)
################################################################################

run_module "10-frontend" "Frontend-Build" "no" "10" "18"

################################################################################
# SCHRITT 11: Nginx Installation & Konfiguration
################################################################################

run_module "11-nginx" "Nginx-Konfiguration" "no" "11" "18"

################################################################################
# SCHRITT 12: Services starten
################################################################################

run_module "12-services" "Services starten" "no" "12" "18"

################################################################################
# SCHRITT 13: Firewall
################################################################################

run_module "13-firewall" "Firewall-Konfiguration" "no" "13" "18"

################################################################################
# SCHRITT 14-16: Optional - pgAdmin, Cloudflare, Auto-Update
################################################################################

CURRENT_STEP=14

if [[ $INSTALL_PGADMIN =~ ^[Jj]$ ]]; then
    run_module "optional/pgadmin" "pgAdmin 4 (Optional)" "yes" "$CURRENT_STEP" "18"
    ((CURRENT_STEP++))
fi

if [[ $USE_CLOUDFLARE =~ ^[Jj]$ ]]; then
    run_module "optional/cloudflare" "Cloudflare Tunnel (Optional)" "yes" "$CURRENT_STEP" "18"
    ((CURRENT_STEP++))
fi

if [ "$AUTO_UPDATE_SCHEDULE" != "manual" ]; then
    run_module "optional/auto-update" "Auto-Update System (Optional)" "yes" "$CURRENT_STEP" "18"
    ((CURRENT_STEP++))
fi

################################################################################
# SCHRITT 17: Finale Validierung
################################################################################

print_header "$CURRENT_STEP" "Finale Validierung" 18
((CURRENT_STEP++))

info "Validiere Installation..."
echo ""

# Backend-Erreichbarkeit
info "Prüfe Backend-Erreichbarkeit..."
sleep 3

if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    success "Backend ist erreichbar"
else
    warning "Backend noch nicht erreichbar - startet möglicherweise noch"
fi

# Frontend-Erreichbarkeit
info "Prüfe Frontend-Erreichbarkeit..."
if curl -s http://localhost > /dev/null 2>&1; then
    success "Frontend ist erreichbar"
else
    warning "Frontend noch nicht erreichbar"
fi

success "Validierung abgeschlossen"

################################################################################
# FERTIG!
################################################################################

finish_logging "COMPLETED"

print_success_banner

print_summary \
    "Update-Kanal: $CHANNEL_NAME ($BRANCH)" \
    "Domain: $DOMAIN" \
    "Cloudflare: $(bool_to_text $USE_CLOUDFLARE)" \
    "pgAdmin: $(bool_to_text $INSTALL_PGADMIN)" \
    "Auto-Update: $AUTO_UPDATE_SCHEDULE" \
    "Datenbank: $DB_NAME"

print_access_info \
    "Website: https://$DOMAIN" \
    "Lokal: http://localhost" \
    "Backend API: http://localhost:3000/api"

if [[ $INSTALL_PGADMIN =~ ^[Jj]$ ]]; then
    echo -e "  ${GREEN}►${NC} pgAdmin: http://localhost:1880"
fi

print_next_steps \
    "SMTP konfigurieren (nano $INSTALL_DIR/backend/.env)" \
    "Test-Account Passwörter ändern" \
    "Backup einrichten (PostgreSQL + Saves/)" \
    "SSL-Zertifikat installieren (certbot --nginx)"

print_important_commands

echo ""
echo -e "${GREEN}✈️  Viel Erfolg mit der FMSV Dingden Vereinshomepage! ✈️${NC}"
echo ""
echo -e "Vollständige Logs: ${CYAN}$LOG_FILE${NC}"
echo ""

exit 0
