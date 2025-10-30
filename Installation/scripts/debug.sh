#!/bin/bash

################################################################################
# FMSV Dingden - Debug & Fix Tool
# Dieses Script findet und behebt alle Backend-Probleme
################################################################################

set -e

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

BACKEND_DIR="/var/www/fmsv-dingden/backend"
LOG_DIR="/var/www/fmsv-dingden/Logs"
ISSUES_FOUND=0
FIXES_APPLIED=0

################################################################################
# Hilfsfunktionen
################################################################################

print_header() {
    clear
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║         FMSV Dingden - Debug & Fix Tool                  ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_section() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

success() { echo -e "${GREEN}✓${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; ((ISSUES_FOUND++)); }
warning() { echo -e "${YELLOW}⚠${NC} $1"; }
info() { echo -e "${BLUE}ℹ${NC} $1"; }

fix_applied() { 
    echo -e "${GREEN}✓ FIX:${NC} $1"
    ((FIXES_APPLIED++))
}

################################################################################
# Hauptmenü
################################################################################

show_menu() {
    print_header
    echo -e "${YELLOW}Was möchtest du tun?${NC}"
    echo ""
    echo -e "  ${GREEN}1${NC}) Vollständige Diagnose (empfohlen)"
    echo -e "  ${GREEN}2${NC}) Quick-Fix (häufige Probleme beheben)"
    echo -e "  ${GREEN}3${NC}) Backend-Logs anzeigen"
    echo -e "  ${GREEN}4${NC}) Backend manuell starten"
    echo -e "  ${GREEN}5${NC}) Dienste-Status prüfen"
    echo -e "  ${GREEN}6${NC}) Node Modules installieren"
    echo -e "  ${GREEN}7${NC}) Datenbank testen"
    echo -e "  ${GREEN}8${NC}) .env Konfiguration prüfen"
    echo -e "  ${GREEN}9${NC}) HTTP-Endpoint testen"
    echo -e "  ${CYAN}10${NC}) Backend-HTTP-Problem beheben ${YELLOW}⭐${NC}"
    echo -e "  ${GREEN}0${NC}) Beenden"
    echo ""
    read -p "Auswahl [0-10]: " choice
    echo ""
    
    case $choice in
        1) full_diagnosis ;;
        2) quick_fix ;;
        3) show_logs ;;
        4) manual_start ;;
        5) check_services ;;
        6) install_modules ;;
        7) test_database ;;
        8) check_env ;;
        9) test_http ;;
        10) fix_backend_http ;;
        0) exit 0 ;;
        *) echo -e "${RED}Ungültige Auswahl${NC}"; sleep 2; show_menu ;;
    esac
}

################################################################################
# 1. Vollständige Diagnose
################################################################################

full_diagnosis() {
    print_section "VOLLSTÄNDIGE DIAGNOSE"
    
    ISSUES_FOUND=0
    
    # Check 1: Verzeichnisse
    echo -e "${CYAN}[1/10] Verzeichnisstruktur...${NC}"
    if [ ! -d "$BACKEND_DIR" ]; then
        error "Backend-Verzeichnis fehlt: $BACKEND_DIR"
    else
        success "Backend-Verzeichnis vorhanden"
    fi
    
    if [ ! -d "$LOG_DIR" ]; then
        warning "Log-Verzeichnis fehlt: $LOG_DIR"
        mkdir -p "$LOG_DIR/Audit"
        fix_applied "Log-Verzeichnis erstellt"
    else
        success "Log-Verzeichnis vorhanden"
    fi
    echo ""
    
    # Check 2: Wichtige Dateien
    echo -e "${CYAN}[2/10] Wichtige Dateien...${NC}"
    cd "$BACKEND_DIR"
    
    for FILE in package.json server.js config/database.js; do
        if [ -f "$FILE" ]; then
            success "$FILE vorhanden"
        else
            error "$FILE fehlt!"
        fi
    done
    echo ""
    
    # Check 3: .env
    echo -e "${CYAN}[3/10] .env Konfiguration...${NC}"
    if [ ! -f .env ]; then
        error ".env fehlt!"
        if [ -f env.example.txt ]; then
            warning "Soll .env aus env.example.txt erstellt werden? (j/n)"
            read -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Jj]$ ]]; then
                cp env.example.txt .env
                fix_applied ".env erstellt - BITTE KONFIGURIEREN!"
                info "Bearbeite jetzt: nano $BACKEND_DIR/.env"
            fi
        fi
    else
        success ".env vorhanden"
        
        # Prüfe wichtige Variablen
        for VAR in DB_USER DB_PASSWORD DB_NAME JWT_SECRET; do
            if grep -q "^$VAR=" .env 2>/dev/null; then
                success "$VAR gesetzt"
            else
                error "$VAR fehlt in .env"
            fi
        done
    fi
    echo ""
    
    # Check 4: Node Modules
    echo -e "${CYAN}[4/10] Node Dependencies...${NC}"
    if [ ! -d node_modules ]; then
        error "node_modules fehlen!"
        warning "Soll npm install jetzt ausgeführt werden? (j/n)"
        read -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Jj]$ ]]; then
            echo ""
            npm install
            if [ $? -eq 0 ]; then
                fix_applied "Dependencies installiert"
            else
                error "npm install fehlgeschlagen!"
            fi
        fi
    else
        MODULE_COUNT=$(ls node_modules | wc -l)
        success "node_modules vorhanden ($MODULE_COUNT Pakete)"
        
        # Prüfe wichtige Module
        MISSING=""
        for MODULE in express dotenv pg winston helmet cors compression; do
            if [ ! -d "node_modules/$MODULE" ]; then
                MISSING="$MISSING $MODULE"
            fi
        done
        
        if [ -n "$MISSING" ]; then
            error "Fehlende Module:$MISSING"
            warning "npm install ausführen?"
            read -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Jj]$ ]]; then
                npm install
                fix_applied "Fehlende Module nachinstalliert"
            fi
        fi
    fi
    echo ""
    
    # Check 5: PostgreSQL
    echo -e "${CYAN}[5/10] PostgreSQL...${NC}"
    if systemctl is-active --quiet postgresql; then
        success "PostgreSQL läuft"
        
        # Teste Verbindung
        if [ -f .env ]; then
            source .env
            if PGPASSWORD=$DB_PASSWORD psql -h ${DB_HOST:-localhost} -U $DB_USER -d $DB_NAME -c "SELECT 1;" > /dev/null 2>&1; then
                success "Datenbankverbindung OK"
            else
                error "Datenbankverbindung fehlgeschlagen"
                info "Prüfe Credentials in .env"
            fi
        fi
    else
        error "PostgreSQL läuft nicht!"
        warning "PostgreSQL starten? (j/n)"
        read -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Jj]$ ]]; then
            systemctl start postgresql
            fix_applied "PostgreSQL gestartet"
        fi
    fi
    echo ""
    
    # Check 6: Backend Service
    echo -e "${CYAN}[6/10] Backend Service...${NC}"
    if systemctl is-active --quiet fmsv-backend; then
        success "Backend läuft"
    else
        error "Backend läuft NICHT"
        
        # Prüfe ob Service existiert
        if systemctl list-unit-files | grep -q fmsv-backend; then
            success "Service-Datei existiert"
        else
            error "Service-Datei fehlt!"
            info "Führe install.sh erneut aus"
        fi
    fi
    echo ""
    
    # Check 7: Ports
    echo -e "${CYAN}[7/10] Ports...${NC}"
    if netstat -tlnp 2>/dev/null | grep -q :5000; then
        PORT_PROCESS=$(netstat -tlnp 2>/dev/null | grep :5000 | awk '{print $7}')
        success "Port 5000 in Verwendung von: $PORT_PROCESS"
    else
        warning "Port 5000 ist frei (Backend läuft nicht)"
    fi
    echo ""
    
    # Check 8: Logs
    echo -e "${CYAN}[8/10] Aktuelle Logs...${NC}"
    if journalctl -u fmsv-backend -n 1 --no-pager > /dev/null 2>&1; then
        echo -e "${YELLOW}Letzte 5 Log-Zeilen:${NC}"
        journalctl -u fmsv-backend -n 5 --no-pager
    else
        warning "Keine Logs verfügbar"
    fi
    echo ""
    
    # Check 9: HTTP Test
    echo -e "${CYAN}[9/10] HTTP Endpoint...${NC}"
    HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health 2>/dev/null || echo "000")
    if [ "$HTTP_RESPONSE" = "200" ]; then
        success "HTTP /api/health antwortet (200 OK)"
        HEALTH_DATA=$(curl -s http://localhost:5000/api/health 2>/dev/null)
        echo -e "${YELLOW}Health Response:${NC}"
        echo "$HEALTH_DATA" | jq . 2>/dev/null || echo "$HEALTH_DATA"
    else
        error "HTTP /api/health antwortet nicht (Code: $HTTP_RESPONSE)"
    fi
    echo ""
    
    # Check 10: Dateiberechtigungen
    echo -e "${CYAN}[10/10] Dateiberechtigungen...${NC}"
    OWNER=$(stat -c '%U' "$BACKEND_DIR" 2>/dev/null || stat -f '%Su' "$BACKEND_DIR" 2>/dev/null)
    if [ "$OWNER" = "www-data" ] || [ "$OWNER" = "root" ]; then
        success "Owner: $OWNER"
    else
        warning "Owner: $OWNER (erwartet: www-data)"
    fi
    echo ""
    
    # Zusammenfassung
    print_section "DIAGNOSE ABGESCHLOSSEN"
    
    if [ $ISSUES_FOUND -eq 0 ]; then
        echo -e "${GREEN}✓ Keine Probleme gefunden!${NC}"
        echo -e "${GREEN}✓ Backend sollte funktionieren${NC}"
    else
        echo -e "${RED}✗ $ISSUES_FOUND Problem(e) gefunden${NC}"
        if [ $FIXES_APPLIED -gt 0 ]; then
            echo -e "${GREEN}✓ $FIXES_APPLIED Fix(es) angewendet${NC}"
        fi
    fi
    
    echo ""
    read -p "Zurück zum Menü (Enter)" -r
    show_menu
}

################################################################################
# 2. Quick-Fix
################################################################################

quick_fix() {
    print_section "QUICK-FIX"
    
    cd "$BACKEND_DIR"
    FIXES_APPLIED=0
    
    echo -e "${YELLOW}Führe Standard-Fixes aus...${NC}"
    echo ""
    
    # Fix 1: node_modules
    if [ ! -d node_modules ] || [ "$(ls node_modules | wc -l)" -lt 50 ]; then
        info "Installiere node_modules..."
        npm install --silent > /dev/null 2>&1
        fix_applied "node_modules installiert"
    fi
    
    # Fix 2: .env
    if [ ! -f .env ] && [ -f env.example.txt ]; then
        cp env.example.txt .env
        fix_applied ".env erstellt (BITTE KONFIGURIEREN!)"
    fi
    
    # Fix 3: Logs Verzeichnis
    mkdir -p "$LOG_DIR/Audit" 2>/dev/null
    fix_applied "Log-Verzeichnis sichergestellt"
    
    # Fix 4: PostgreSQL
    if ! systemctl is-active --quiet postgresql; then
        systemctl start postgresql 2>/dev/null
        fix_applied "PostgreSQL gestartet"
    fi
    
    # Fix 5: Backend neu starten
    info "Starte Backend neu..."
    systemctl restart fmsv-backend 2>/dev/null
    fix_applied "Backend neu gestartet"
    
    sleep 5
    
    # Prüfe Ergebnis
    echo ""
    if systemctl is-active --quiet fmsv-backend; then
        success "Backend läuft jetzt!"
        
        # Warte bis Backend bereit ist
        info "Warte auf Backend-Start..."
        for i in {1..10}; do
            HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health 2>/dev/null || echo "000")
            if [ "$HTTP_RESPONSE" = "200" ]; then
                success "HTTP-Endpoint antwortet!"
                break
            fi
            echo -n "."
            sleep 1
        done
        echo ""
        
        # Finaler Check
        HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health 2>/dev/null || echo "000")
        if [ "$HTTP_RESPONSE" != "200" ]; then
            warning "HTTP-Endpoint antwortet NICHT (Code: $HTTP_RESPONSE)"
            echo ""
            echo -e "${YELLOW}Mögliche Ursachen:${NC}"
            echo -e "  ${RED}1.${NC} Backend startet noch (warte 10-20 Sekunden)"
            echo -e "  ${RED}2.${NC} Backend hört auf falschem Port"
            echo -e "  ${RED}3.${NC} Backend-Fehler beim Start"
            echo ""
            echo -e "${CYAN}Empfohlene Schritte:${NC}"
            echo -e "  ${GREEN}1.${NC} Logs ansehen: Menü Option 3"
            echo -e "  ${GREEN}2.${NC} Backend manuell starten: Menü Option 4"
            echo -e "  ${GREEN}3.${NC} Port prüfen: ${CYAN}netstat -tlnp | grep 5000${NC}"
        fi
    else
        error "Backend läuft NICHT"
        echo ""
        echo -e "${YELLOW}Backend-Service konnte nicht gestartet werden!${NC}"
        echo ""
        echo -e "${CYAN}Nächste Schritte:${NC}"
        echo -e "  ${GREEN}1.${NC} Logs ansehen: Menü Option 3"
        echo -e "  ${GREEN}2.${NC} Service Status: ${CYAN}systemctl status fmsv-backend${NC}"
        echo -e "  ${GREEN}3.${NC} Vollständige Diagnose: Menü Option 1"
    fi
    
    echo ""
    echo -e "${GREEN}$FIXES_APPLIED Fixes angewendet${NC}"
    echo ""
    read -p "Zurück zum Menü (Enter)" -r
    show_menu
}

################################################################################
# 3. Logs anzeigen
################################################################################

show_logs() {
    print_section "BACKEND LOGS"
    
    echo -e "${YELLOW}Live-Logs (Ctrl+C zum Beenden):${NC}"
    echo ""
    sleep 1
    
    journalctl -u fmsv-backend -f
    
    show_menu
}

################################################################################
# 4. Manueller Start
################################################################################

manual_start() {
    print_section "MANUELLER BACKEND START"
    
    cd "$BACKEND_DIR"
    
    echo -e "${YELLOW}Starte Backend manuell für Debugging...${NC}"
    echo -e "${YELLOW}(Ctrl+C zum Beenden)${NC}"
    echo ""
    sleep 1
    
    # Setze .env Variablen
    if [ -f .env ]; then
        export $(cat .env | grep -v '^#' | xargs)
    fi
    
    # Starte Node direkt
    node server.js
    
    echo ""
    read -p "Zurück zum Menü (Enter)" -r
    show_menu
}

################################################################################
# 5. Services Status
################################################################################

check_services() {
    print_section "DIENSTE-STATUS"
    
    echo -e "${CYAN}PostgreSQL:${NC}"
    systemctl status postgresql --no-pager | head -n 10
    echo ""
    
    echo -e "${CYAN}FMSV Backend:${NC}"
    systemctl status fmsv-backend --no-pager | head -n 10
    echo ""
    
    echo -e "${CYAN}Nginx:${NC}"
    systemctl status nginx --no-pager | head -n 10
    echo ""
    
    read -p "Zurück zum Menü (Enter)" -r
    show_menu
}

################################################################################
# 6. Node Modules installieren
################################################################################

install_modules() {
    print_section "NODE MODULES INSTALLIEREN"
    
    cd "$BACKEND_DIR"
    
    if [ -d node_modules ]; then
        echo -e "${YELLOW}node_modules existiert bereits${NC}"
        echo -e "${YELLOW}Aktuell installiert: $(ls node_modules | wc -l) Pakete${NC}"
        echo ""
        read -p "Neu installieren? (j/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Jj]$ ]]; then
            show_menu
            return
        fi
        rm -rf node_modules package-lock.json
    fi
    
    echo -e "${CYAN}Installiere Dependencies...${NC}"
    echo -e "${YELLOW}(Dies kann 2-5 Minuten dauern)${NC}"
    echo ""
    
    npm install
    
    if [ $? -eq 0 ]; then
        echo ""
        success "Installation erfolgreich!"
        success "Installiert: $(ls node_modules | wc -l) Pakete"
    else
        echo ""
        error "Installation fehlgeschlagen!"
    fi
    
    echo ""
    read -p "Zurück zum Menü (Enter)" -r
    show_menu
}

################################################################################
# 7. Datenbank testen
################################################################################

test_database() {
    print_section "DATENBANK-TEST"
    
    cd "$BACKEND_DIR"
    
    if [ ! -f .env ]; then
        error ".env nicht gefunden!"
        read -p "Zurück zum Menü (Enter)" -r
        show_menu
        return
    fi
    
    source .env
    
    echo -e "${CYAN}Verbindungs-Parameter:${NC}"
    echo -e "  Host:     ${DB_HOST:-localhost}"
    echo -e "  Port:     ${DB_PORT:-5432}"
    echo -e "  Database: $DB_NAME"
    echo -e "  User:     $DB_USER"
    echo ""
    
    echo -e "${CYAN}Teste Verbindung...${NC}"
    if PGPASSWORD=$DB_PASSWORD psql -h ${DB_HOST:-localhost} -U $DB_USER -d $DB_NAME -c "SELECT version();" 2>/dev/null; then
        echo ""
        success "Verbindung erfolgreich!"
        echo ""
        
        echo -e "${CYAN}Teste Tabellen...${NC}"
        TABLE_COUNT=$(PGPASSWORD=$DB_PASSWORD psql -h ${DB_HOST:-localhost} -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs)
        echo -e "  Tabellen: $TABLE_COUNT"
        echo ""
        
        echo -e "${CYAN}Tabellen:${NC}"
        PGPASSWORD=$DB_PASSWORD psql -h ${DB_HOST:-localhost} -U $DB_USER -d $DB_NAME -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;" 2>/dev/null
    else
        echo ""
        error "Verbindung fehlgeschlagen!"
        echo ""
        echo -e "${YELLOW}Mögliche Ursachen:${NC}"
        echo -e "  • PostgreSQL läuft nicht"
        echo -e "  • Falsche Credentials"
        echo -e "  • Datenbank existiert nicht"
        echo ""
    fi
    
    echo ""
    read -p "Zurück zum Menü (Enter)" -r
    show_menu
}

################################################################################
# 8. .env prüfen
################################################################################

check_env() {
    print_section ".ENV KONFIGURATION"
    
    cd "$BACKEND_DIR"
    
    if [ ! -f .env ]; then
        error ".env nicht gefunden!"
        echo ""
        if [ -f env.example.txt ]; then
            warning "Soll .env aus env.example.txt erstellt werden? (j/n)"
            read -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Jj]$ ]]; then
                cp env.example.txt .env
                success ".env erstellt"
                info "Bearbeite: nano $BACKEND_DIR/.env"
            fi
        fi
    else
        success ".env gefunden"
        echo ""
        
        echo -e "${CYAN}Konfiguration:${NC}"
        echo ""
        
        # Zeige Werte (aber verstecke Secrets)
        while IFS= read -r line; do
            if [[ $line =~ ^[A-Z_]+=.+ ]]; then
                KEY=$(echo "$line" | cut -d= -f1)
                VALUE=$(echo "$line" | cut -d= -f2-)
                
                # Verstecke Secrets
                if [[ $KEY =~ (PASSWORD|SECRET|KEY) ]]; then
                    echo -e "  ${GREEN}$KEY${NC}=***"
                else
                    echo -e "  ${GREEN}$KEY${NC}=$VALUE"
                fi
            fi
        done < .env
        
        echo ""
        
        # Prüfe Pflichtfelder
        echo -e "${CYAN}Prüfe Pflichtfelder:${NC}"
        for VAR in DB_USER DB_PASSWORD DB_NAME JWT_SECRET; do
            if grep -q "^$VAR=" .env 2>/dev/null; then
                VALUE=$(grep "^$VAR=" .env | cut -d= -f2-)
                if [ -n "$VALUE" ] && [ "$VALUE" != "your_*" ]; then
                    success "$VAR gesetzt"
                else
                    error "$VAR ist leer oder hat Default-Wert"
                fi
            else
                error "$VAR fehlt"
            fi
        done
    fi
    
    echo ""
    read -p ".env bearbeiten? (j/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Jj]$ ]]; then
        nano .env
    fi
    
    echo ""
    read -p "Zurück zum Menü (Enter)" -r
    show_menu
}

################################################################################
# 9. HTTP Test
################################################################################

test_http() {
    print_section "HTTP-ENDPOINT TEST"
    
    echo -e "${CYAN}Teste /api/health...${NC}"
    HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health 2>/dev/null || echo "000")
    
    if [ "$HTTP_RESPONSE" = "200" ]; then
        success "Endpoint antwortet (200 OK)"
        echo ""
        echo -e "${CYAN}Response:${NC}"
        curl -s http://localhost:5000/api/health 2>/dev/null | jq . 2>/dev/null || curl -s http://localhost:5000/api/health 2>/dev/null
    else
        error "Endpoint antwortet nicht (Code: $HTTP_RESPONSE)"
        echo ""
        if [ "$HTTP_RESPONSE" = "000" ]; then
            warning "Backend ist nicht erreichbar"
            info "Ist der Backend-Service gestartet?"
        fi
    fi
    
    echo ""
    echo -e "${CYAN}Weitere Tests:${NC}"
    echo ""
    
    # Test CORS
    echo -e "${YELLOW}CORS Test...${NC}"
    CORS_RESPONSE=$(curl -s -H "Origin: http://localhost:5173" -H "Access-Control-Request-Method: GET" -I http://localhost:5000/api/health 2>/dev/null | grep -i "access-control" || echo "Keine CORS Header")
    echo "$CORS_RESPONSE"
    echo ""
    
    # Test mit curl verbose
    echo -e "${YELLOW}Detaillierter Request:${NC}"
    curl -v http://localhost:5000/api/health 2>&1 | head -n 20
    
    echo ""
    read -p "Zurück zum Menü (Enter)" -r
    show_menu
}

################################################################################
# 10. Backend-HTTP-Problem beheben
################################################################################

fix_backend_http() {
    print_section "BACKEND-HTTP-PROBLEM BEHEBEN"
    
    cd "$BACKEND_DIR"
    
    echo -e "${YELLOW}Diagnose: Warum antwortet das Backend nicht auf HTTP?${NC}"
    echo ""
    
    # Check 1: Läuft der Service?
    echo -e "${CYAN}[1/7] Backend Service Status...${NC}"
    if systemctl is-active --quiet fmsv-backend; then
        success "Backend-Service läuft"
    else
        error "Backend-Service läuft NICHT!"
        echo ""
        warning "Starte Backend-Service..."
        systemctl start fmsv-backend
        sleep 3
        if systemctl is-active --quiet fmsv-backend; then
            success "Backend-Service gestartet"
        else
            error "Backend-Service Start fehlgeschlagen!"
            echo ""
            echo -e "${YELLOW}Logs:${NC}"
            journalctl -u fmsv-backend -n 20 --no-pager
            echo ""
            read -p "Zurück zum Menü (Enter)" -r
            show_menu
            return
        fi
    fi
    echo ""
    
    # Check 2: Läuft der Node-Prozess?
    echo -e "${CYAN}[2/7] Node.js Prozess...${NC}"
    if pgrep -f "node.*server.js" > /dev/null; then
        PID=$(pgrep -f "node.*server.js")
        success "Node.js läuft (PID: $PID)"
    else
        error "Kein Node.js Prozess gefunden!"
        warning "Backend ist gestartet, aber Node läuft nicht"
    fi
    echo ""
    
    # Check 3: Port 5000 belegt?
    echo -e "${CYAN}[3/7] Port 5000...${NC}"
    if netstat -tlnp 2>/dev/null | grep -q :5000; then
        PORT_INFO=$(netstat -tlnp 2>/dev/null | grep :5000)
        success "Port 5000 ist belegt"
        echo -e "${YELLOW}Details:${NC}"
        echo "$PORT_INFO"
    else
        error "Port 5000 ist FREI!"
        echo ""
        warning "Backend hört nicht auf Port 5000!"
        echo ""
        echo -e "${YELLOW}Prüfe .env Konfiguration...${NC}"
        if grep -q "^PORT=" .env 2>/dev/null; then
            CONFIGURED_PORT=$(grep "^PORT=" .env | cut -d= -f2)
            if [ "$CONFIGURED_PORT" != "5000" ]; then
                error "PORT in .env ist $CONFIGURED_PORT (sollte 5000 sein)"
                echo ""
                read -p "Soll PORT auf 5000 gesetzt werden? (j/N): " -n 1 -r
                echo ""
                if [[ $REPLY =~ ^[Jj]$ ]]; then
                    sed -i 's/^PORT=.*/PORT=5000/' .env
                    success "PORT auf 5000 gesetzt"
                    systemctl restart fmsv-backend
                    sleep 3
                fi
            fi
        else
            warning "PORT nicht in .env gesetzt (verwendet Default 5000)"
        fi
    fi
    echo ""
    
    # Check 4: HTTP Test
    echo -e "${CYAN}[4/7] HTTP Verbindung...${NC}"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        success "HTTP antwortet (200 OK)"
        echo ""
        echo -e "${GREEN}✅ PROBLEM GELÖST!${NC}"
        echo -e "${GREEN}Backend antwortet jetzt korrekt auf HTTP!${NC}"
    elif [ "$HTTP_CODE" = "000" ]; then
        error "Keine Verbindung möglich (Code: 000)"
        echo ""
        echo -e "${YELLOW}Dies bedeutet:${NC}"
        echo -e "  ${RED}•${NC} Backend ist nicht erreichbar"
        echo -e "  ${RED}•${NC} Port falsch oder Backend läuft nicht"
    else
        warning "Unerwarteter HTTP Code: $HTTP_CODE"
    fi
    echo ""
    
    # Check 5: Letzte Logs
    echo -e "${CYAN}[5/7] Backend Logs (letzte 10 Zeilen)...${NC}"
    journalctl -u fmsv-backend -n 10 --no-pager
    echo ""
    
    # Check 6: Fehler in Logs?
    echo -e "${CYAN}[6/7] Suche nach Fehlern in Logs...${NC}"
    if journalctl -u fmsv-backend -n 50 --no-pager | grep -i "error\|failed\|exception" > /dev/null; then
        error "Fehler in Logs gefunden:"
        journalctl -u fmsv-backend -n 50 --no-pager | grep -i "error\|failed\|exception" | tail -n 5
    else
        success "Keine offensichtlichen Fehler in Logs"
    fi
    echo ""
    
    # Check 7: Lösungsvorschläge
    echo -e "${CYAN}[7/7] Lösungsvorschläge...${NC}"
    echo ""
    
    if [ "$HTTP_CODE" != "200" ]; then
        echo -e "${YELLOW}Versuche folgende Schritte:${NC}"
        echo ""
        echo -e "${GREEN}1.${NC} Backend neu starten:"
        echo -e "   ${CYAN}systemctl restart fmsv-backend${NC}"
        echo ""
        echo -e "${GREEN}2.${NC} Backend manuell starten (für genaue Fehlermeldung):"
        echo -e "   ${CYAN}Menü Option 4${NC}"
        echo ""
        echo -e "${GREEN}3.${NC} Logs live ansehen:"
        echo -e "   ${CYAN}Menü Option 3${NC}"
        echo ""
        echo -e "${GREEN}4.${NC} .env prüfen:"
        echo -e "   ${CYAN}Menü Option 8${NC}"
        echo ""
        
        read -p "Soll ich Backend neu starten? (J/n): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            echo ""
            info "Starte Backend neu..."
            systemctl restart fmsv-backend
            echo ""
            info "Warte 10 Sekunden..."
            for i in {10..1}; do
                echo -n "$i "
                sleep 1
            done
            echo ""
            echo ""
            
            # Teste erneut
            HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health 2>/dev/null || echo "000")
            if [ "$HTTP_CODE" = "200" ]; then
                echo ""
                success "✅ PROBLEM GELÖST!"
                success "Backend antwortet jetzt!"
                echo ""
            else
                echo ""
                error "Backend antwortet immer noch nicht (Code: $HTTP_CODE)"
                echo ""
                warning "Empfehlung: Backend manuell starten (Menü Option 4)"
                echo -e "${YELLOW}Das zeigt dir die genaue Fehlermeldung!${NC}"
                echo ""
            fi
        fi
    else
        success "✅ Alles funktioniert!"
    fi
    
    echo ""
    read -p "Zurück zum Menü (Enter)" -r
    show_menu
}

################################################################################
# Start
################################################################################

# Prüfe Root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Bitte als root ausführen (sudo)${NC}"
    exit 1
fi

# Starte Menü
show_menu
