#!/bin/bash
################################################################################
# Modul: Frontend-Build
# Baut das React/Vite Frontend mit vollständiger Fehlerbehandlung
# KRITISCH: Fehler dürfen NICHT verschluckt werden!
################################################################################

cd "$INSTALL_DIR" || {
    error "Verzeichnis nicht gefunden: $INSTALL_DIR"
    exit 1
}

################################################################################
# 1. npm install (Frontend Dependencies)
################################################################################

info "Installiere Frontend-Dependencies..."
echo ""

# npm install MIT Ausgabe & Exit-Code Check
if npm install 2>&1 | tee -a "$LOG_FILE" | grep -E "added|removed|changed|up to date|audited"; then
    echo ""
    
    # Validierung: node_modules existiert?
    if [ ! -d "$INSTALL_DIR/node_modules" ]; then
        error "npm install scheinbar erfolgreich, aber node_modules/ fehlt!"
        exit 1
    fi
    
    # Zeige Statistik
    PACKAGE_COUNT=$(find "$INSTALL_DIR/node_modules" -maxdepth 1 -type d | wc -l)
    NODE_MODULES_SIZE=$(du -sh "$INSTALL_DIR/node_modules" | cut -f1)
    success "Frontend-Dependencies installiert"
    info "Pakete: $PACKAGE_COUNT | Größe: $NODE_MODULES_SIZE"
    
else
    # npm install fehlgeschlagen!
    echo ""
    error "npm install fehlgeschlagen!"
    
    echo ""
    echo -e "${YELLOW}Letzte npm-Ausgabe:${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    tail -50 "$LOG_FILE" | grep -A 5 -B 5 "ERR!" || tail -20 "$LOG_FILE"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    echo ""
    echo -e "${YELLOW}Häufige Ursachen:${NC}"
    echo -e "  ${RED}1.${NC} Keine Internetverbindung zu npmjs.com"
    echo -e "  ${RED}2.${NC} package.json korrupt oder fehlend"
    echo -e "  ${RED}3.${NC} Disk Space voll"
    echo -e "  ${RED}4.${NC} npm Cache korrupt"
    echo -e "  ${RED}5.${NC} Proxy/Firewall blockiert npm"
    
    echo ""
    echo -e "${YELLOW}Lösungsvorschläge:${NC}"
    echo -e "  ${GREEN}1.${NC} Internet prüfen:"
    echo -e "     ${CYAN}ping registry.npmjs.org${NC}"
    echo ""
    echo -e "  ${GREEN}2.${NC} npm Cache bereinigen:"
    echo -e "     ${CYAN}npm cache clean --force${NC}"
    echo -e "     ${CYAN}npm install${NC}"
    echo ""
    echo -e "  ${GREEN}3.${NC} Disk Space prüfen:"
    echo -e "     ${CYAN}df -h${NC}"
    echo ""
    echo -e "  ${GREEN}4.${NC} Manuell versuchen:"
    echo -e "     ${CYAN}cd $INSTALL_DIR${NC}"
    echo -e "     ${CYAN}rm -rf node_modules package-lock.json${NC}"
    echo -e "     ${CYAN}npm install${NC}"
    echo ""
    
    exit 1
fi

################################################################################
# 2. npm run build (KRITISCH!)
################################################################################

echo ""
info "Baue Frontend (kann 2-5 Minuten dauern)..."
info "RAM-Nutzung wird überwacht..."
echo ""

# Zeige RAM vor Build
AVAILABLE_RAM_BEFORE=$(free -m | awk 'NR==2 {print $7}')
info "Verfügbarer RAM vor Build: ${AVAILABLE_RAM_BEFORE}MB"

if [ "$AVAILABLE_RAM_BEFORE" -lt 256 ]; then
    warning "Sehr wenig RAM verfügbar - Build könnte fehlschlagen!"
fi

echo ""
echo -e "${YELLOW}Build-Ausgabe:${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Build mit Ausgabe & Exit-Code Check
if npm run build 2>&1 | tee -a "$LOG_FILE" | tail -30; then
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    ############################################################################
    # VALIDIERUNGEN (KRITISCH!)
    ############################################################################
    
    VALIDATION_FAILED=false
    
    # Validierung 1: dist/ existiert?
    if [ ! -d "$INSTALL_DIR/dist" ]; then
        error "Build scheinbar erfolgreich, aber dist/ Verzeichnis fehlt!"
        VALIDATION_FAILED=true
    else
        success "dist/ Verzeichnis existiert"
    fi
    
    # Validierung 2: index.html existiert?
    if [ ! -f "$INSTALL_DIR/dist/index.html" ]; then
        error "dist/index.html nicht gefunden - Build unvollständig!"
        VALIDATION_FAILED=true
    else
        success "index.html gefunden"
    fi
    
    # Validierung 3: dist/ ist nicht leer?
    if [ -d "$INSTALL_DIR/dist" ]; then
        DIST_SIZE=$(du -sb "$INSTALL_DIR/dist" 2>/dev/null | cut -f1)
        if [ -z "$DIST_SIZE" ] || [ "$DIST_SIZE" -lt 1024 ]; then
            error "dist/ Verzeichnis ist zu klein oder leer! (${DIST_SIZE} bytes)"
            VALIDATION_FAILED=true
        else
            DIST_SIZE_HUMAN=$(du -sh "$INSTALL_DIR/dist" | cut -f1)
            success "dist/ Größe OK ($DIST_SIZE_HUMAN)"
        fi
    fi
    
    # Validierung 4: Assets vorhanden?
    if [ -d "$INSTALL_DIR/dist/assets" ]; then
        ASSET_COUNT=$(find "$INSTALL_DIR/dist/assets" -type f 2>/dev/null | wc -l)
        if [ "$ASSET_COUNT" -lt 2 ]; then
            warning "Wenige Assets gefunden ($ASSET_COUNT) - Build möglicherweise unvollständig"
        else
            success "Assets gefunden ($ASSET_COUNT Dateien)"
        fi
    else
        warning "dist/assets/ Verzeichnis nicht gefunden"
    fi
    
    # Validierung 5: Prüfe kritische Dateien
    CRITICAL_FILES=0
    [ -f "$INSTALL_DIR/dist/index.html" ] && ((CRITICAL_FILES++))
    [ -d "$INSTALL_DIR/dist/assets" ] && ((CRITICAL_FILES++))
    
    if [ $CRITICAL_FILES -lt 2 ]; then
        error "Build unvollständig (kritische Dateien fehlen)"
        VALIDATION_FAILED=true
    fi
    
    # Falls eine Validierung fehlgeschlagen ist → Abbruch!
    if [ "$VALIDATION_FAILED" = true ]; then
        echo ""
        error "Frontend-Build Validierung fehlgeschlagen!"
        echo ""
        echo -e "${YELLOW}Verzeichnis-Struktur:${NC}"
        ls -lah "$INSTALL_DIR/dist" 2>/dev/null | sed 's/^/  /' || echo "  dist/ nicht vorhanden"
        echo ""
        exit 1
    fi
    
    # Erfolg! Zeige Statistik
    echo ""
    success "Frontend erfolgreich gebaut!"
    echo ""
    echo -e "${CYAN}Build-Statistik:${NC}"
    echo -e "  ${BLUE}•${NC} Größe: $DIST_SIZE_HUMAN"
    echo -e "  ${BLUE}•${NC} Assets: $ASSET_COUNT Dateien"
    echo -e "  ${BLUE}•${NC} index.html: $(stat -f%z "$INSTALL_DIR/dist/index.html" 2>/dev/null || stat -c%s "$INSTALL_DIR/dist/index.html") bytes"
    
    # Zeige RAM nach Build
    AVAILABLE_RAM_AFTER=$(free -m | awk 'NR==2 {print $7}')
    echo -e "  ${BLUE}•${NC} RAM verfügbar: ${AVAILABLE_RAM_AFTER}MB (vorher: ${AVAILABLE_RAM_BEFORE}MB)"
    
else
    # Build fehlgeschlagen!
    BUILD_EXIT_CODE=$?
    
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    error "npm run build fehlgeschlagen! (Exit-Code: $BUILD_EXIT_CODE)"
    
    echo ""
    echo -e "${YELLOW}Letzte Build-Ausgabe:${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    tail -50 "$LOG_FILE" | sed 's/^/  /'
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    echo ""
    echo -e "${YELLOW}Häufige Ursachen:${NC}"
    echo -e "  ${RED}1.${NC} Zu wenig RAM (benötigt: ~512MB)"
    echo -e "  ${RED}2.${NC} Disk Space voll"
    echo -e "  ${RED}3.${NC} TypeScript-Fehler im Code"
    echo -e "  ${RED}4.${NC} Fehlende Dependencies"
    echo -e "  ${RED}5.${NC} Vite-Konfiguration fehlerhaft"
    
    echo ""
    echo -e "${YELLOW}Diagnose:${NC}"
    echo -e "  ${GREEN}1.${NC} RAM prüfen:"
    echo -e "     ${CYAN}free -h${NC}"
    echo ""
    echo -e "  ${GREEN}2.${NC} Disk Space prüfen:"
    echo -e "     ${CYAN}df -h${NC}"
    echo ""
    echo -e "  ${GREEN}3.${NC} Build-Logs prüfen:"
    echo -e "     ${CYAN}tail -100 $LOG_FILE${NC}"
    echo ""
    echo -e "  ${GREEN}4.${NC} Manuell testen:"
    echo -e "     ${CYAN}cd $INSTALL_DIR${NC}"
    echo -e "     ${CYAN}npm run build${NC}"
    echo ""
    
    # Zeige Ressourcen-Statistik
    echo -e "${YELLOW}Aktuelle Ressourcen:${NC}"
    echo -e "  ${BLUE}•${NC} RAM:"
    free -h | grep "Mem:" | sed 's/^/     /'
    echo -e "  ${BLUE}•${NC} Disk:"
    df -h / | grep "/" | sed 's/^/     /'
    echo ""
    
    exit 1
fi

################################################################################
# 3. Berechtigungen setzen
################################################################################

echo ""
info "Setze Berechtigungen..."

# NUR spezifische Verzeichnisse, NICHT alles!
# .git/ muss root bleiben für Updates!

chown -R www-data:www-data "$INSTALL_DIR/dist" 2>/dev/null || {
    warning "Konnte Berechtigungen für dist/ nicht setzen"
}

# Erstelle Verzeichnisse falls nicht vorhanden
mkdir -p "$INSTALL_DIR/Saves"
mkdir -p "$INSTALL_DIR/Logs"
mkdir -p "$INSTALL_DIR/Logs/Audit"

chown -R www-data:www-data "$INSTALL_DIR/Saves" 2>/dev/null || true
chown -R www-data:www-data "$INSTALL_DIR/Logs" 2>/dev/null || true

# Backend bleibt zunächst root (wird später in Backend-Modul gesetzt)

success "Berechtigungen gesetzt"
info "dist/, Saves/, Logs/ gehören jetzt www-data"
info ".git/ bleibt root (für Updates)"

################################################################################
# Validierung: Finale Checks
################################################################################

echo ""
info "Finale Validierung..."

FINAL_CHECK_OK=true

# Check 1: dist/ lesbar?
if [ -r "$INSTALL_DIR/dist/index.html" ]; then
    success "index.html ist lesbar"
else
    error "index.html ist nicht lesbar!"
    FINAL_CHECK_OK=false
fi

# Check 2: Saves/ beschreibbar?
if [ -w "$INSTALL_DIR/Saves" ]; then
    success "Saves/ ist beschreibbar"
else
    warning "Saves/ ist nicht beschreibbar!"
fi

# Check 3: Logs/ beschreibbar?
if [ -w "$INSTALL_DIR/Logs" ]; then
    success "Logs/ ist beschreibbar"
else
    warning "Logs/ ist nicht beschreibbar!"
fi

if [ "$FINAL_CHECK_OK" = false ]; then
    error "Finale Validierung fehlgeschlagen!"
    exit 1
fi

log_success "Frontend build completed successfully"
log_info "  dist/ size: $DIST_SIZE_HUMAN"
log_info "  Assets: $ASSET_COUNT files"

success "Frontend-Build abgeschlossen"
