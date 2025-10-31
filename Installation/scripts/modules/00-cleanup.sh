#!/bin/bash
################################################################################
# Modul: Cleanup vorheriger Installation
# Deinstalliert und stoppt alle FMSV-Services
################################################################################

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}⚠️  Cleanup vorheriger Installation${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo ""

# Prüfe ob bereits installiert
NEEDS_CLEANUP=false

if systemctl is-active --quiet fmsv-backend 2>/dev/null; then
    NEEDS_CLEANUP=true
fi

if [ -d "$INSTALL_DIR" ]; then
    NEEDS_CLEANUP=true
fi

if sudo -u postgres psql -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw fmsv_database; then
    NEEDS_CLEANUP=true
fi

# Wenn nichts zu cleanen, dann überspringen
if [ "$NEEDS_CLEANUP" = "false" ]; then
    success "Keine vorherige Installation gefunden - Cleanup nicht notwendig"
    log_info "No previous installation found - skipping cleanup"
    return 0
fi

# Warnung anzeigen
echo -e "${RED}⚠️  WARNUNG: Vorherige Installation gefunden!${NC}"
echo ""
echo -e "${YELLOW}Folgendes wird entfernt:${NC}"
echo -e "  ${RED}•${NC} FMSV Backend Service"
echo -e "  ${RED}•${NC} FMSV Datenbank (${CYAN}fmsv_database${NC})"
echo -e "  ${RED}•${NC} Datenbank-User (${CYAN}fmsv_user${NC})"
echo -e "  ${RED}•${NC} Nginx Konfiguration"
echo -e "  ${RED}•${NC} Build-Dateien (node_modules, dist)"
echo -e "  ${YELLOW}•${NC} Optional: Backend .env"
echo -e "  ${YELLOW}•${NC} Optional: Uploads (Saves/)"
echo ""
echo -e "${YELLOW}ℹ️  Installation Scripts bleiben erhalten!${NC}"
echo -e "${RED}⚠️  Datenbank-Daten gehen VERLOREN!${NC}"
echo ""

if ! ask_yes_no "Vorherige Installation WIRKLICH entfernen?" "n"; then
    error "Installation abgebrochen - Cleanup übersprungen"
    echo ""
    echo -e "${YELLOW}Optionen:${NC}"
    echo -e "  1. Manuelle Deinstallation durchführen"
    echo -e "  2. Installation in anderes Verzeichnis"
    echo -e "  3. Script später erneut ausführen"
    echo ""
    exit 1
fi

log_info "Starting cleanup of previous installation"

################################################################################
# 1. Stoppe Services
################################################################################

echo ""
info "Stoppe FMSV Services..."

# Backend Service
if systemctl is-active --quiet fmsv-backend 2>/dev/null; then
    log_info "Stopping fmsv-backend service"
    systemctl stop fmsv-backend || true
    systemctl disable fmsv-backend || true
    success "FMSV Backend gestoppt"
else
    echo -e "  ${DIM}fmsv-backend nicht aktiv${NC}"
fi

# Service-Datei entfernen
if [ -f /etc/systemd/system/fmsv-backend.service ]; then
    log_info "Removing fmsv-backend service file"
    rm -f /etc/systemd/system/fmsv-backend.service
    systemctl daemon-reload
    success "Service-Datei entfernt"
fi

################################################################################
# 2. Nginx Konfiguration
################################################################################

echo ""
info "Entferne Nginx Konfiguration..."

# Nginx Config deaktivieren
if [ -L /etc/nginx/sites-enabled/fmsv ]; then
    log_info "Removing nginx symlink"
    rm -f /etc/nginx/sites-enabled/fmsv
    success "Nginx Symlink entfernt"
fi

# Nginx Config löschen
if [ -f /etc/nginx/sites-available/fmsv ]; then
    log_info "Removing nginx config"
    rm -f /etc/nginx/sites-available/fmsv
    success "Nginx Config entfernt"
fi

# Nginx neu laden (falls läuft)
if systemctl is-active --quiet nginx 2>/dev/null; then
    log_info "Reloading nginx"
    systemctl reload nginx || true
    success "Nginx neu geladen"
fi

################################################################################
# 3. Datenbank
################################################################################

echo ""
info "Entferne FMSV Datenbank..."

# Verbindungen schließen
sudo -u postgres psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'fmsv_database';" 2>/dev/null || true

# Datenbank löschen
if sudo -u postgres psql -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw fmsv_database; then
    log_info "Dropping database fmsv_database"
    sudo -u postgres psql -c "DROP DATABASE IF EXISTS fmsv_database;" || true
    success "Datenbank gelöscht"
else
    echo -e "  ${DIM}Datenbank fmsv_database nicht gefunden${NC}"
fi

# Datenbank-User löschen
if sudo -u postgres psql -t -c "SELECT 1 FROM pg_roles WHERE rolname='fmsv_user'" 2>/dev/null | grep -q 1; then
    log_info "Dropping database user fmsv_user"
    sudo -u postgres psql -c "DROP USER IF EXISTS fmsv_user;" || true
    success "Datenbank-User gelöscht"
else
    echo -e "  ${DIM}Datenbank-User fmsv_user nicht gefunden${NC}"
fi

################################################################################
# 4. Installations-Verzeichnis (selektiver Cleanup)
################################################################################

echo ""
info "Bereinige Installations-Verzeichnis..."

if [ -d "$INSTALL_DIR" ]; then
    log_info "Cleaning installation directory: $INSTALL_DIR"
    
    # WICHTIG: Wir löschen das Verzeichnis NICHT komplett (Scripts laufen darin!)
    # Stattdessen: Nur spezifische Unterverzeichnisse aufräumen
    
    # Backend Node Modules
    if [ -d "$INSTALL_DIR/backend/node_modules" ]; then
        log_info "Removing backend/node_modules"
        rm -rf "$INSTALL_DIR/backend/node_modules"
        success "Backend node_modules gelöscht"
    fi
    
    # Frontend Node Modules
    if [ -d "$INSTALL_DIR/node_modules" ]; then
        log_info "Removing frontend node_modules"
        rm -rf "$INSTALL_DIR/node_modules"
        success "Frontend node_modules gelöscht"
    fi
    
    # Frontend Dist
    if [ -d "$INSTALL_DIR/dist" ]; then
        log_info "Removing frontend dist"
        rm -rf "$INSTALL_DIR/dist"
        success "Frontend dist gelöscht"
    fi
    
    # Backend .env (alte Konfiguration)
    if [ -f "$INSTALL_DIR/backend/.env" ]; then
        if ask_yes_no "Backend .env Datei auch löschen?" "n"; then
            log_info "Removing backend/.env"
            rm -f "$INSTALL_DIR/backend/.env"
            success "Backend .env gelöscht"
        else
            info "Backend .env beibehalten"
        fi
    fi
    
    # Saves Verzeichnis
    if [ -d "$INSTALL_DIR/Saves" ] && [ "$(ls -A $INSTALL_DIR/Saves 2>/dev/null | grep -v gitkeep)" ]; then
        if ask_yes_no "Uploads im Saves/ Verzeichnis löschen?" "n"; then
            log_info "Removing Saves/* (keeping gitkeep)"
            find "$INSTALL_DIR/Saves" -type f ! -name 'gitkeep.txt' -delete
            find "$INSTALL_DIR/Saves" -type d ! -name 'Saves' -exec rm -rf {} + 2>/dev/null || true
            success "Saves Verzeichnis bereinigt"
        else
            info "Saves Verzeichnis beibehalten"
        fi
    fi
    
    success "Verzeichnis bereinigt (Scripts bleiben erhalten)"
else
    echo -e "  ${DIM}Verzeichnis nicht gefunden: $INSTALL_DIR${NC}"
fi

################################################################################
# 5. Logs (optional behalten)
################################################################################

echo ""
if ask_yes_no "Log-Dateien auch löschen?" "n"; then
    info "Entferne Log-Dateien..."
    log_info "Removing log files"
    
    rm -f /var/log/fmsv-install.log || true
    rm -f /var/log/fmsv-backend.log || true
    
    success "Log-Dateien gelöscht"
else
    info "Log-Dateien werden beibehalten"
    log_info "Keeping log files"
fi

################################################################################
# 6. Abschluss
################################################################################

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Cleanup abgeschlossen${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""

log_success "Cleanup completed successfully"

sleep 2
