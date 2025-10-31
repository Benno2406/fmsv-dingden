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
echo -e "  ${RED}•${NC} FMSV Datenbank"
echo -e "  ${RED}•${NC} Nginx Konfiguration"
echo -e "  ${RED}•${NC} Installations-Verzeichnis"
echo -e "  ${RED}•${NC} Alle Dateien in ${CYAN}$INSTALL_DIR${NC}"
echo ""
echo -e "${RED}⚠️  ALLE DATEN GEHEN VERLOREN!${NC}"
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
# 4. Installations-Verzeichnis
################################################################################

echo ""
info "Entferne Installations-Verzeichnis..."

if [ -d "$INSTALL_DIR" ]; then
    log_info "Removing installation directory: $INSTALL_DIR"
    
    # Sicherheits-Check: Nur FMSV-Verzeichnisse löschen
    if [[ "$INSTALL_DIR" == *"fmsv"* ]]; then
        rm -rf "$INSTALL_DIR"
        success "Verzeichnis gelöscht: $INSTALL_DIR"
    else
        warning "Sicherheits-Check: Verzeichnis wird nicht gelöscht (kein 'fmsv' im Pfad)"
        log_warning "Skipped directory removal: $INSTALL_DIR (safety check)"
    fi
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
