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
MAGENTA='\033[0;35m'
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
    echo -e "  ${RED}11${NC}) Kompletter Cache-Reset ${YELLOW}💣${NC}"
    echo -e "  ${YELLOW}12${NC}) Port-Diagnose (Auf welchem Port läuft Backend?) ${YELLOW}🔍${NC}"
    echo -e "  ${MAGENTA}13${NC}) pgAdmin reparieren ${YELLOW}🔧${NC}"
    echo -e "  ${GREEN}0${NC}) Beenden"
    echo ""
    read -p "Auswahl [0-13]: " choice
    echo ""
    
    case $choice in
        1) full_diagnosis ;;
        2) quick_fix ;;
        3) show_logs ;;
        4) manual_start ;;
        11) complete_cache_reset ;;
        12) port_diagnosis ;;
        13) fix_pgadmin ;;
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
    if netstat -tlnp 2>/dev/null | grep -q :3000; then
        PORT_PROCESS=$(netstat -tlnp 2>/dev/null | grep :3000 | awk '{print $7}')
        success "Port 3000 in Verwendung von: $PORT_PROCESS"
    else
        warning "Port 3000 ist frei (Backend läuft nicht)"
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
    HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health 2>/dev/null || echo "000")
    if [ "$HTTP_RESPONSE" = "200" ]; then
        success "HTTP /api/health antwortet (200 OK)"
        HEALTH_DATA=$(curl -s http://localhost:3000/api/health 2>/dev/null)
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
            HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health 2>/dev/null || echo "000")
            if [ "$HTTP_RESPONSE" = "200" ]; then
                success "HTTP-Endpoint antwortet!"
                break
            fi
            echo -n "."
            sleep 1
        done
        echo ""
        
        # Finaler Check
        HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health 2>/dev/null || echo "000")
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
            echo -e "  ${GREEN}3.${NC} Port prüfen: ${CYAN}netstat -tlnp | grep 3000${NC}"
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
    HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health 2>/dev/null || echo "000")
    
    if [ "$HTTP_RESPONSE" = "200" ]; then
        success "Endpoint antwortet (200 OK)"
        echo ""
        echo -e "${CYAN}Response:${NC}"
        curl -s http://localhost:3000/api/health 2>/dev/null | jq . 2>/dev/null || curl -s http://localhost:3000/api/health 2>/dev/null
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
    CORS_RESPONSE=$(curl -s -H "Origin: http://localhost:5173" -H "Access-Control-Request-Method: GET" -I http://localhost:3000/api/health 2>/dev/null | grep -i "access-control" || echo "Keine CORS Header")
    echo "$CORS_RESPONSE"
    echo ""
    
    # Test mit curl verbose
    echo -e "${YELLOW}Detaillierter Request:${NC}"
    curl -v http://localhost:3000/api/health 2>&1 | head -n 20
    
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
    
    # Check 3: Port 3000 belegt?
    echo -e "${CYAN}[3/7] Port 3000...${NC}"
    if netstat -tlnp 2>/dev/null | grep -q :3000; then
        PORT_INFO=$(netstat -tlnp 2>/dev/null | grep :3000)
        success "Port 3000 ist belegt"
        echo -e "${YELLOW}Details:${NC}"
        echo "$PORT_INFO"
    else
        error "Port 3000 ist FREI!"
        echo ""
        warning "Backend hört nicht auf Port 3000!"
        
        # Wenn Node läuft aber Port frei ist, ist der Prozess in einem fehlerhaften Zustand
        if pgrep -f "node.*server.js" > /dev/null; then
            echo ""
            warning "Node.js Prozess läuft, aber bindet nicht an Port 3000!"
            warning "Der Prozess ist vermutlich in einem fehlerhaften Zustand."
        fi
        
        echo ""
        echo -e "${YELLOW}Prüfe .env Konfiguration...${NC}"
        if grep -q "^PORT=" .env 2>/dev/null; then
            CONFIGURED_PORT=$(grep "^PORT=" .env | cut -d= -f2)
            if [ "$CONFIGURED_PORT" != "3000" ]; then
                error "PORT in .env ist $CONFIGURED_PORT (sollte 3000 sein)"
                echo ""
                info "Setze PORT auf 3000..."
                sed -i 's/^PORT=.*/PORT=3000/' .env
                success "PORT auf 3000 gesetzt"
            else
                success "PORT ist korrekt auf 3000 gesetzt"
            fi
        else
            warning "PORT nicht in .env gesetzt"
            info "Füge PORT=3000 zur .env hinzu..."
            echo "PORT=3000" >> .env
            success "PORT hinzugefügt"
        fi
    fi
    echo ""
    
    # Check 4: HTTP Test
    echo -e "${CYAN}[4/7] HTTP Verbindung...${NC}"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health 2>/dev/null || echo "000")
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
            
            # Beende evtl. hängende Node.js Prozesse
            if pgrep -f "node.*server.js" > /dev/null; then
                info "Beende bestehende Node.js Prozesse..."
                pkill -9 -f "node.*server.js"
                sleep 2
                success "Prozesse beendet"
                echo ""
            fi
            
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
            
            # Prüfe ob Port nun belegt ist
            if netstat -tlnp 2>/dev/null | grep -q :3000; then
                success "Port 3000 ist jetzt belegt!"
                echo ""
            else
                warning "Port 3000 ist immer noch frei..."
                echo ""
            fi
            
            # Teste erneut
            HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health 2>/dev/null || echo "000")
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
# 11. Kompletter Cache-Reset
################################################################################
complete_cache_reset() {
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║           KOMPLETTER CACHE-RESET (Nuclear Option)            ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    echo -e "${RED}⚠️  WARNUNG: Dies löscht ALLE Caches und installiert alles neu!${NC}"
    echo ""
    echo -e "${YELLOW}Was wird gemacht:${NC}"
    echo -e "  ${RED}•${NC} Stoppt Backend-Service"
    echo -e "  ${RED}•${NC} Beendet alle Node.js Prozesse"
    echo -e "  ${RED}•${NC} Löscht node_modules komplett"
    echo -e "  ${RED}•${NC} Löscht npm Cache"
    echo -e "  ${RED}•${NC} Installiert Dependencies neu"
    echo -e "  ${RED}•${NC} Startet Backend neu"
    echo ""
    
    read -p "Wirklich fortfahren? (j/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Jj]$ ]]; then
        info "Abgebrochen"
        echo ""
        read -p "Zurück zum Menü (Enter)" -r
        show_menu
        return
    fi
    
    echo ""
    echo -e "${CYAN}[1/8] Stoppe Backend-Service...${NC}"
    systemctl stop fmsv-backend
    success "Service gestoppt"
    echo ""
    
    echo -e "${CYAN}[2/8] Beende alle Node.js Prozesse...${NC}"
    if pgrep -f "node" > /dev/null; then
        pkill -9 -f "node"
        sleep 2
        success "Alle Node.js Prozesse beendet"
    else
        info "Keine Node.js Prozesse gefunden"
    fi
    echo ""
    
    echo -e "${CYAN}[3/8] Lösche node_modules...${NC}"
    if [ -d "$BACKEND_DIR/node_modules" ]; then
        rm -rf "$BACKEND_DIR/node_modules"
        success "node_modules gelöscht"
    else
        info "node_modules nicht vorhanden"
    fi
    echo ""
    
    echo -e "${CYAN}[4/8] Lösche package-lock.json...${NC}"
    if [ -f "$BACKEND_DIR/package-lock.json" ]; then
        rm -f "$BACKEND_DIR/package-lock.json"
        success "package-lock.json gelöscht"
    else
        info "package-lock.json nicht vorhanden"
    fi
    echo ""
    
    echo -e "${CYAN}[5/8] Leere npm Cache...${NC}"
    npm cache clean --force
    success "npm Cache geleert"
    echo ""
    
    echo -e "${CYAN}[6/8] Installiere Dependencies neu...${NC}"
    cd "$BACKEND_DIR"
    npm install
    if [ $? -eq 0 ]; then
        success "Dependencies installiert"
    else
        error "Installation fehlgeschlagen!"
        echo ""
        read -p "Zurück zum Menü (Enter)" -r
        show_menu
        return
    fi
    echo ""
    
    echo -e "${CYAN}[7/8] Starte Backend-Service...${NC}"
    systemctl start fmsv-backend
    sleep 5
    if systemctl is-active --quiet fmsv-backend; then
        success "Backend-Service gestartet"
    else
        error "Backend-Service Start fehlgeschlagen!"
        echo ""
        echo -e "${YELLOW}Logs:${NC}"
        journalctl -u fmsv-backend -n 20 --no-pager
    fi
    echo ""
    
    echo -e "${CYAN}[8/8] Teste Backend...${NC}"
    sleep 3
    
    # Port Check
    if netstat -tlnp 2>/dev/null | grep -q :3000; then
        success "Port 3000 ist belegt"
    else
        error "Port 3000 ist FREI!"
    fi
    
    # HTTP Check
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        success "HTTP antwortet (200 OK)"
        echo ""
        echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║              ✅ CACHE-RESET ERFOLGREICH! ✅                   ║${NC}"
        echo -e "${GREEN}║         Backend läuft jetzt sauber und antwortet!             ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    else
        error "HTTP antwortet nicht (Code: $HTTP_CODE)"
        echo ""
        warning "Cache wurde geleert, aber Backend antwortet noch nicht."
        echo ""
        echo -e "${YELLOW}Empfehlung:${NC}"
        echo -e "  ${CYAN}1.${NC} Logs prüfen (Option 3)"
        echo -e "  ${CYAN}2.${NC} Backend manuell starten (Option 4)"
    fi
    
    echo ""
    read -p "Zurück zum Menü (Enter)" -r
    show_menu
}

################################################################################
# 12. Port-Diagnose
################################################################################
port_diagnosis() {
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                      PORT-DIAGNOSE                             ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    cd "$BACKEND_DIR"
    
    echo -e "${YELLOW}═══ 1. .env Datei Prüfung ═══${NC}"
    echo ""
    
    # Prüfe .env Datei
    if [ -f ".env" ]; then
        success ".env Datei existiert in $BACKEND_DIR"
        echo ""
        
        if grep -q "^PORT=" .env; then
            CONFIGURED_PORT=$(grep "^PORT=" .env | cut -d= -f2 | tr -d ' \r\n')
            info "Konfigurierter PORT in .env: ${YELLOW}$CONFIGURED_PORT${NC}"
        else
            warning "PORT nicht in .env gesetzt!"
            info "Default Port laut server.js: ${YELLOW}3000${NC}"
            CONFIGURED_PORT=3000
        fi
    else
        error ".env Datei FEHLT in $BACKEND_DIR!"
        warning "Backend nutzt Default Port: ${YELLOW}3000${NC}"
        CONFIGURED_PORT=3000
        echo ""
        info "Kopiere env.example.txt zu .env..."
        if [ -f "env.example.txt" ]; then
            cp env.example.txt .env
            success ".env Datei erstellt"
            echo ""
            warning "WICHTIG: Du musst die .env Datei noch konfigurieren!"
            echo -e "  ${CYAN}→${NC} DB Credentials eintragen"
            echo -e "  ${CYAN}→${NC} PORT auf 3000 setzen"
            echo -e "  ${CYAN}→${NC} JWT_SECRET generieren"
        fi
    fi
    
    echo ""
    echo -e "${YELLOW}═══ 2. Node.js Prozess Prüfung ═══${NC}"
    echo ""
    
    if pgrep -f "node.*server.js" > /dev/null; then
        NODE_PID=$(pgrep -f "node.*server.js")
        success "Node.js Prozess läuft (PID: ${YELLOW}$NODE_PID${NC})"
        echo ""
        
        # Finde auf welchem Port Node läuft
        echo -e "${CYAN}Suche aktive Ports...${NC}"
        echo ""
        
        FOUND_PORTS=$(netstat -tlnp 2>/dev/null | grep "$NODE_PID/node" | awk '{print $4}' | awk -F: '{print $NF}' | sort -u)
        
        if [ -n "$FOUND_PORTS" ]; then
            success "Backend hört auf folgende(n) Port(s):"
            echo ""
            for PORT_NUM in $FOUND_PORTS; do
                echo -e "  ${GREEN}✓${NC} Port: ${YELLOW}$PORT_NUM${NC}"
                
                # Teste HTTP auf diesem Port
                HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT_NUM/api/health 2>/dev/null || echo "000")
                if [ "$HTTP_CODE" = "200" ]; then
                    echo -e "    ${GREEN}→ HTTP funktioniert! (200 OK)${NC}"
                elif [ "$HTTP_CODE" != "000" ]; then
                    echo -e "    ${YELLOW}→ HTTP Code: $HTTP_CODE${NC}"
                else
                    echo -e "    ${RED}→ Keine HTTP-Antwort${NC}"
                fi
                echo ""
            done
            
            # Vergleiche mit konfiguriertem Port
            if echo "$FOUND_PORTS" | grep -q "^${CONFIGURED_PORT}$"; then
                success "✅ Backend läuft auf dem RICHTIGEN Port ($CONFIGURED_PORT)"
            else
                echo ""
                error "❌ PORT-KONFLIKT!"
                echo -e "${RED}Backend läuft auf Port(s): $FOUND_PORTS${NC}"
                echo -e "${RED}Erwartet wurde Port: $CONFIGURED_PORT${NC}"
                echo ""
                
                # Biete Fix an
                echo -e "${YELLOW}Möchtest du den PORT in .env korrigieren?${NC}"
                echo ""
                echo "Optionen:"
                for PORT_NUM in $FOUND_PORTS; do
                    echo -e "  ${CYAN}1${NC}) PORT auf $PORT_NUM setzen (Backend läuft bereits darauf)"
                done
                echo -e "  ${CYAN}2${NC}) PORT auf 3000 setzen und Backend neu starten"
                echo -e "  ${CYAN}3${NC}) Nichts ändern"
                echo ""
                
                read -p "Auswahl [1-3]: " PORT_FIX_CHOICE
                echo ""
                
                case $PORT_FIX_CHOICE in
                    1)
                        FIRST_PORT=$(echo "$FOUND_PORTS" | head -n1)
                        if grep -q "^PORT=" .env; then
                            sed -i "s/^PORT=.*/PORT=$FIRST_PORT/" .env
                        else
                            echo "PORT=$FIRST_PORT" >> .env
                        fi
                        success "PORT in .env auf $FIRST_PORT gesetzt"
                        info "Backend läuft bereits auf diesem Port - kein Neustart nötig"
                        ;;
                    2)
                        if grep -q "^PORT=" .env; then
                            sed -i 's/^PORT=.*/PORT=3000/' .env
                        else
                            echo "PORT=3000" >> .env
                        fi
                        success "PORT in .env auf 3000 gesetzt"
                        echo ""
                        info "Starte Backend neu..."
                        systemctl restart fmsv-backend
                        sleep 5
                        success "Backend neu gestartet"
                        echo ""
                        
                        # Teste Port 3000
                        if netstat -tlnp 2>/dev/null | grep -q :3000; then
                            success "✅ Backend läuft jetzt auf Port 3000!"
                        else
                            error "Backend läuft NICHT auf Port 3000"
                            warning "Prüfe die Logs (Option 3)"
                        fi
                        ;;
                    *)
                        info "Keine Änderungen vorgenommen"
                        ;;
                esac
            fi
        else
            error "Backend-Prozess läuft, aber bindet an KEINEN Port!"
            warning "Der Prozess ist wahrscheinlich gecrasht oder in einem fehlerhaften Zustand"
            echo ""
            info "Empfehlung:"
            echo -e "  ${CYAN}1.${NC} Logs prüfen (Option 3)"
            echo -e "  ${CYAN}2.${NC} Backend manuell starten (Option 4) um Fehler zu sehen"
            echo -e "  ${CYAN}3.${NC} Cache-Reset (Option 11)"
        fi
    else
        error "Kein Node.js Prozess gefunden!"
        echo ""
        info "Backend läuft nicht. Starte es mit Option 4 (Backend manuell starten)"
    fi
    
    echo ""
    echo -e "${YELLOW}═══ 3. Port-Übersicht ═══${NC}"
    echo ""
    
    # Zeige alle Ports die in Verwendung sind
    echo -e "${CYAN}Alle aktiven Node.js Ports:${NC}"
    if netstat -tlnp 2>/dev/null | grep -q "node"; then
        netstat -tlnp 2>/dev/null | grep "node" | awk '{print $4 " → " $7}' | sed 's/\(.*\):\([0-9]*\)/Port \2/'
    else
        info "Keine Node.js Prozesse hören auf Ports"
    fi
    
    echo ""
    echo -e "${CYAN}Zusammenfassung:${NC}"
    echo -e "  ${YELLOW}Konfigurierter Port (.env):${NC} $CONFIGURED_PORT"
    if [ -n "$FOUND_PORTS" ]; then
        echo -e "  ${YELLOW}Tatsächlicher Port:${NC} $FOUND_PORTS"
    else
        echo -e "  ${YELLOW}Tatsächlicher Port:${NC} ${RED}Keiner (Backend läuft nicht richtig)${NC}"
    fi
    
    echo ""
    read -p "Zurück zum Menü (Enter)" -r
    show_menu
}

################################################################################
# 13. pgAdmin reparieren
################################################################################

fix_pgadmin() {
    print_section "PGADMIN REPARATUR"
    
    info "Prüfe pgAdmin Installation..."
    
    # Prüfe ob pgAdmin installiert ist
    if [ ! -d "/usr/pgadmin4" ]; then
        error "pgAdmin ist nicht installiert!"
        echo ""
        read -p "Zurück zum Menü (Enter)" -r
        show_menu
        return
    fi
    
    success "pgAdmin ist installiert"
    echo ""
    
    # Prüfe Apache Status
    echo -e "${CYAN}Apache2 Status:${NC}"
    if systemctl is-active --quiet apache2; then
        success "Apache2 läuft"
        APACHE_RUNNING=true
    else
        warning "Apache2 läuft nicht"
        APACHE_RUNNING=false
    fi
    echo ""
    
    # Zeige Apache Fehler
    echo -e "${CYAN}Letzte Apache Fehler:${NC}"
    journalctl -u apache2 -n 10 --no-pager 2>/dev/null | grep -E "(error|failed|Error|Failed)" | tail -5 | sed 's/^/  /' || echo "  Keine Fehler gefunden"
    echo ""
    
    # Teste Apache Konfiguration
    echo -e "${CYAN}Apache Konfiguration Test:${NC}"
    APACHE_TEST=$(apache2ctl configtest 2>&1)
    if echo "$APACHE_TEST" | grep -q "Syntax OK"; then
        success "Apache Konfiguration OK"
    else
        error "Apache Konfiguration fehlerhaft:"
        echo "$APACHE_TEST" | sed 's/^/  /'
    fi
    echo ""
    
    # Reparatur anbieten
    echo -e "${YELLOW}═══ Reparatur-Optionen ═══${NC}"
    echo ""
    echo -e "  ${GREEN}1${NC}) pgAdmin Konfiguration neu erstellen (behebt WSGI-Duplikat-Fehler)"
    echo -e "  ${GREEN}2${NC}) Apache vollständig neu starten"
    echo -e "  ${GREEN}3${NC}) WSGI Module neu installieren"
    echo -e "  ${GREEN}4${NC}) Apache Logs anzeigen"
    echo -e "  ${GREEN}5${NC}) Alle Reparaturen durchführen ${YELLOW}⭐${NC}"
    echo -e "  ${GREEN}0${NC}) Zurück"
    echo ""
    read -p "Auswahl [0-5]: " fix_choice
    echo ""
    
    case $fix_choice in
        1)
            info "Erstelle neue pgAdmin Konfiguration..."
            
            # Stoppe Apache
            systemctl stop apache2 2>/dev/null || true
            
            # Entferne ALLE existierenden pgAdmin Configs (auch aus conf-*)
            info "Bereinige alle pgAdmin-Konfigurationen..."
            rm -f /etc/apache2/sites-enabled/*pgadmin* 2>/dev/null
            rm -f /etc/apache2/sites-available/*pgadmin* 2>/dev/null
            rm -f /etc/apache2/conf-enabled/*pgadmin* 2>/dev/null
            rm -f /etc/apache2/conf-available/*pgadmin* 2>/dev/null
            
            # Deaktiviere eventuell aktivierte pgAdmin-Configs
            a2dissite pgadmin4 2>/dev/null || true
            a2disconf pgadmin4 2>/dev/null || true
            
            fix_applied "Alle alten pgAdmin-Konfigurationen entfernt"
            
            # Erstelle neue, saubere pgAdmin Konfiguration
            cat > /etc/apache2/sites-available/pgadmin.conf << 'EOF'
<VirtualHost *:1880>
    ServerName localhost
    
    WSGIDaemonProcess pgadmin processes=1 threads=25 python-home=/usr/pgadmin4/venv
    WSGIScriptAlias / /usr/pgadmin4/web/pgAdmin4.wsgi
    
    <Directory /usr/pgadmin4/web>
        WSGIProcessGroup pgadmin
        WSGIApplicationGroup %{GLOBAL}
        Require all granted
    </Directory>
    
    # Static files
    Alias /static /usr/pgadmin4/web/static
    <Directory /usr/pgadmin4/web/static>
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/pgadmin_error.log
    CustomLog ${APACHE_LOG_DIR}/pgadmin_access.log combined
</VirtualHost>
EOF
            
            # Aktiviere Site
            a2ensite pgadmin.conf > /dev/null 2>&1
            
            fix_applied "pgAdmin Konfiguration neu erstellt"
            
            # Teste Konfiguration
            info "Teste Apache Konfiguration..."
            if apache2ctl configtest 2>&1 | grep -q "Syntax OK"; then
                success "Apache Konfiguration OK"
                
                # Starte Apache
                info "Starte Apache..."
                if systemctl start apache2; then
                    success "Apache gestartet"
                    echo ""
                    success "pgAdmin sollte jetzt erreichbar sein: http://localhost:1880/pgadmin4"
                else
                    error "Apache konnte nicht gestartet werden"
                    echo ""
                    journalctl -u apache2 -n 20 --no-pager
                fi
            else
                error "Apache Konfiguration immer noch fehlerhaft:"
                apache2ctl configtest 2>&1 | sed 's/^/  /'
            fi
            ;;
            
        2)
            info "Starte Apache neu..."
            systemctl stop apache2 2>/dev/null || true
            pkill -9 apache2 2>/dev/null || true
            sleep 2
            
            if systemctl start apache2; then
                fix_applied "Apache neu gestartet"
                
                if systemctl is-active --quiet apache2; then
                    success "Apache läuft"
                else
                    error "Apache läuft nicht"
                fi
            else
                error "Apache konnte nicht gestartet werden"
                journalctl -u apache2 -n 20 --no-pager
            fi
            ;;
            
        3)
            info "Installiere WSGI Module neu..."
            apt-get install -y --reinstall libapache2-mod-wsgi-py3
            a2enmod wsgi > /dev/null 2>&1
            fix_applied "WSGI Module neu installiert"
            
            info "Starte Apache neu..."
            systemctl restart apache2
            
            if systemctl is-active --quiet apache2; then
                success "Apache läuft"
            else
                error "Apache läuft nicht"
            fi
            ;;
            
        4)
            echo -e "${CYAN}═══ Apache Error Log ═══${NC}"
            tail -50 /var/log/apache2/error.log 2>/dev/null || echo "Keine Logs gefunden"
            echo ""
            echo -e "${CYAN}═══ pgAdmin Error Log ═══${NC}"
            tail -50 /var/log/apache2/pgadmin_error.log 2>/dev/null || echo "Keine Logs gefunden"
            ;;
            
        5)
            info "Führe alle Reparaturen durch..."
            echo ""
            
            # 1. WSGI Module
            info "[1/4] WSGI Module neu installieren..."
            apt-get install -y --reinstall libapache2-mod-wsgi-py3 > /dev/null 2>&1
            a2enmod wsgi > /dev/null 2>&1
            success "WSGI Module installiert"
            
            # 2. Apache stoppen
            info "[2/4] Apache stoppen..."
            systemctl stop apache2 2>/dev/null || true
            pkill -9 apache2 2>/dev/null || true
            sleep 2
            success "Apache gestoppt"
            
            # 3. Konfiguration neu erstellen
            info "[3/4] pgAdmin Konfiguration neu erstellen..."
            rm -f /etc/apache2/sites-enabled/*pgadmin* 2>/dev/null
            rm -f /etc/apache2/sites-available/*pgadmin* 2>/dev/null
            rm -f /etc/apache2/conf-enabled/*pgadmin* 2>/dev/null
            rm -f /etc/apache2/conf-available/*pgadmin* 2>/dev/null
            
            # Deaktiviere eventuell aktivierte pgAdmin-Configs
            a2dissite pgadmin4 2>/dev/null || true
            a2disconf pgadmin4 2>/dev/null || true
            
            cat > /etc/apache2/sites-available/pgadmin.conf << 'EOF'
<VirtualHost *:1880>
    ServerName localhost
    
    WSGIDaemonProcess pgadmin processes=1 threads=25 python-home=/usr/pgadmin4/venv
    WSGIScriptAlias / /usr/pgadmin4/web/pgAdmin4.wsgi
    
    <Directory /usr/pgadmin4/web>
        WSGIProcessGroup pgadmin
        WSGIApplicationGroup %{GLOBAL}
        Require all granted
    </Directory>
    
    # Static files
    Alias /static /usr/pgadmin4/web/static
    <Directory /usr/pgadmin4/web/static>
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/pgadmin_error.log
    CustomLog ${APACHE_LOG_DIR}/pgadmin_access.log combined
</VirtualHost>
EOF
            
            a2ensite pgadmin.conf > /dev/null 2>&1
            success "Konfiguration erstellt"
            
            # 4. Apache starten
            info "[4/4] Apache starten..."
            if systemctl start apache2; then
                sleep 2
                if systemctl is-active --quiet apache2; then
                    success "Apache läuft"
                    echo ""
                    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
                    echo -e "${GREEN}║          pgAdmin erfolgreich repariert!                ║${NC}"
                    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
                    echo ""
                    echo -e "${CYAN}Zugriff:${NC}"
                    echo -e "  ${GREEN}►${NC} Lokal:   http://localhost:1880/pgadmin4"
                    echo -e "  ${GREEN}►${NC} Extern:  http://$(hostname -I | awk '{print $1}'):1880/pgadmin4"
                    echo ""
                else
                    error "Apache läuft nicht"
                    journalctl -u apache2 -n 20 --no-pager
                fi
            else
                error "Apache konnte nicht gestartet werden"
                journalctl -u apache2 -n 20 --no-pager
            fi
            ;;
            
        0)
            show_menu
            return
            ;;
            
        *)
            warning "Ungültige Auswahl"
            ;;
    esac
    
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
