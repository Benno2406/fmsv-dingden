#!/bin/bash

################################################################################
# FMSV Dingden - Konsolidiertes Debug & Fix Tool
# Alle Diagnose- und Reparatur-Funktionen in einem Script
# Version: 3.0
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
    echo -e "${CYAN}║         FMSV Dingden - Debug & Fix Tool v3.0            ║${NC}"
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
    echo -e "${CYAN}═══ Backend-Diagnose ═══${NC}"
    echo -e "  ${GREEN}1${NC})  Vollständige Diagnose (empfohlen)"
    echo -e "  ${GREEN}2${NC})  Quick-Fix (häufige Probleme beheben)"
    echo -e "  ${GREEN}3${NC})  Backend-Logs anzeigen"
    echo -e "  ${GREEN}4${NC})  Dienste-Status prüfen"
    echo -e "  ${GREEN}5${NC})  Datenbank testen"
    echo -e "  ${GREEN}6${NC})  .env Konfiguration prüfen"
    echo ""
    echo -e "${CYAN}═══ pgAdmin-Diagnose ═══${NC}"
    echo -e "  ${GREEN}7${NC})  pgAdmin Apache-Config reparieren (WSGI-Duplikat)"
    echo -e "  ${GREEN}8${NC})  pgAdmin Nginx-Config reparieren (lädt dauerhaft)"
    echo -e "  ${GREEN}9${NC})  pgAdmin Domain-Konflikt beheben (Haupt-Domain zeigt auf pgAdmin)"
    echo -e "  ${GREEN}10${NC}) pgAdmin vollständige Reparatur ${YELLOW}⭐${NC}"
    echo ""
    echo -e "${CYAN}═══ Erweitert ═══${NC}"
    echo -e "  ${GREEN}11${NC}) Kompletter Cache-Reset ${YELLOW}💣${NC}"
    echo -e "  ${GREEN}12${NC}) Port-Diagnose ${YELLOW}🔍${NC}"
    echo -e "  ${GREEN}13${NC}) Nginx-Konfigurationen anzeigen"
    echo ""
    echo -e "  ${GREEN}0${NC})  Beenden"
    echo ""
    read -p "Auswahl [0-13]: " choice
    echo ""
    
    case $choice in
        1) full_diagnosis ;;
        2) quick_fix ;;
        3) show_logs ;;
        4) check_services ;;
        5) test_database ;;
        6) check_env ;;
        7) fix_pgadmin_apache ;;
        8) fix_pgadmin_nginx ;;
        9) fix_pgadmin_domain_conflict ;;
        10) fix_pgadmin_complete ;;
        11) complete_cache_reset ;;
        12) port_diagnosis ;;
        13) show_nginx_configs ;;
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
    echo -e "${CYAN}[1/8] Verzeichnisstruktur...${NC}"
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
    
    # Check 2: Services
    echo -e "${CYAN}[2/8] Dienste-Status...${NC}"
    services=("fmsv-backend" "nginx" "postgresql" "apache2")
    for service in "${services[@]}"; do
        if systemctl is-active --quiet "$service" 2>/dev/null; then
            success "$service läuft"
        else
            warning "$service läuft nicht"
        fi
    done
    echo ""
    
    # Check 3: .env
    echo -e "${CYAN}[3/8] Backend .env...${NC}"
    cd "$BACKEND_DIR"
    if [ ! -f .env ]; then
        error ".env fehlt!"
    else
        success ".env vorhanden"
        
        # Prüfe wichtige Variablen
        required_vars=("DB_HOST" "DB_USER" "DB_PASSWORD" "DB_NAME" "JWT_SECRET" "PORT")
        for var in "${required_vars[@]}"; do
            if grep -q "^$var=" .env; then
                success "  $var gesetzt"
            else
                error "  $var fehlt!"
            fi
        done
    fi
    echo ""
    
    # Check 4: Node Modules
    echo -e "${CYAN}[4/8] Node Modules...${NC}"
    if [ -d "node_modules" ]; then
        success "node_modules vorhanden"
    else
        error "node_modules fehlen!"
        echo ""
        read -p "Jetzt installieren? (j/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Jj]$ ]]; then
            npm install
            fix_applied "Node Modules installiert"
        fi
    fi
    echo ""
    
    # Check 5: Datenbank
    echo -e "${CYAN}[5/8] Datenbank-Verbindung...${NC}"
    if [ -f .env ]; then
        DB_NAME=$(grep "^DB_NAME=" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
        DB_USER=$(grep "^DB_USER=" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
        
        if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME" 2>/dev/null; then
            success "Datenbank '$DB_NAME' existiert"
        else
            error "Datenbank '$DB_NAME' nicht gefunden!"
        fi
    fi
    echo ""
    
    # Check 6: Ports
    echo -e "${CYAN}[6/8] Port-Belegung...${NC}"
    check_port() {
        local port=$1
        local service=$2
        if netstat -tuln 2>/dev/null | grep -q ":$port " || lsof -ti:$port &>/dev/null; then
            success "Port $port belegt ($service)"
        else
            warning "Port $port frei ($service läuft nicht?)"
        fi
    }
    
    check_port 3000 "Backend"
    check_port 80 "Nginx"
    check_port 5432 "PostgreSQL"
    check_port 1880 "pgAdmin"
    echo ""
    
    # Check 7: Nginx Configs
    echo -e "${CYAN}[7/8] Nginx-Konfiguration...${NC}"
    if nginx -t &>/dev/null; then
        success "Nginx-Konfiguration gültig"
    else
        error "Nginx-Konfiguration fehlerhaft!"
        nginx -t 2>&1 | sed 's/^/  /'
    fi
    echo ""
    
    # Check 8: pgAdmin
    echo -e "${CYAN}[8/8] pgAdmin Status...${NC}"
    if [ -d "/usr/pgadmin4" ]; then
        success "pgAdmin installiert"
        
        if systemctl is-active --quiet apache2; then
            success "Apache (pgAdmin) läuft"
        else
            warning "Apache (pgAdmin) läuft nicht"
        fi
        
        # Prüfe ob erreichbar
        if curl -s http://localhost:1880/pgadmin4 &>/dev/null; then
            success "pgAdmin antwortet auf Port 1880"
        else
            warning "pgAdmin antwortet nicht"
        fi
    else
        info "pgAdmin nicht installiert"
    fi
    echo ""
    
    # Zusammenfassung
    print_section "DIAGNOSE ABGESCHLOSSEN"
    echo -e "${CYAN}Gefundene Probleme:${NC} ${RED}$ISSUES_FOUND${NC}"
    echo -e "${CYAN}Angewendete Fixes:${NC} ${GREEN}$FIXES_APPLIED${NC}"
    echo ""
    
    if [ $ISSUES_FOUND -gt 0 ]; then
        warning "Es wurden Probleme gefunden!"
        echo ""
        echo -e "${CYAN}Empfohlene Aktionen:${NC}"
        echo -e "  ${GREEN}2${NC}) Quick-Fix ausführen"
        echo -e "  ${GREEN}7-10${NC}) pgAdmin-Reparatur"
    else
        success "Alles in Ordnung! ✓"
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
    
    info "Führe automatische Reparaturen durch..."
    echo ""
    
    # Fix 1: Log-Verzeichnis
    if [ ! -d "$LOG_DIR" ]; then
        mkdir -p "$LOG_DIR/Audit"
        chmod 755 "$LOG_DIR"
        chmod 755 "$LOG_DIR/Audit"
        fix_applied "Log-Verzeichnis erstellt"
    fi
    
    # Fix 2: Saves-Verzeichnis
    SAVES_DIR="/var/www/fmsv-dingden/Saves"
    if [ ! -d "$SAVES_DIR" ]; then
        mkdir -p "$SAVES_DIR"
        chmod 755 "$SAVES_DIR"
        fix_applied "Saves-Verzeichnis erstellt"
    fi
    
    # Fix 3: Berechtigungen
    cd /var/www/fmsv-dingden
    chown -R root:root .
    chmod -R 755 .
    fix_applied "Berechtigungen gesetzt"
    
    # Fix 4: Backend Service neu starten
    if systemctl is-active --quiet fmsv-backend; then
        systemctl restart fmsv-backend
        fix_applied "Backend-Service neu gestartet"
    fi
    
    # Fix 5: Nginx neu laden
    if nginx -t &>/dev/null; then
        systemctl reload nginx
        fix_applied "Nginx neu geladen"
    fi
    
    echo ""
    success "Quick-Fix abgeschlossen! ($FIXES_APPLIED Fixes angewendet)"
    echo ""
    read -p "Zurück zum Menü (Enter)" -r
    show_menu
}

################################################################################
# 7. pgAdmin Apache-Config reparieren
################################################################################

fix_pgadmin_apache() {
    print_section "PGADMIN APACHE-CONFIG REPARIEREN"
    
    info "Behebt: WSGI Duplikat-Fehler, Apache startet nicht"
    echo ""
    
    # Prüfe Installation
    if [ ! -d "/usr/pgadmin4" ]; then
        error "pgAdmin ist nicht installiert!"
        echo ""
        read -p "Zurück zum Menü (Enter)" -r
        show_menu
        return
    fi
    
    # Backup
    info "[1/4] Erstelle Backup..."
    mkdir -p /root/apache-backup-$(date +%Y%m%d-%H%M%S)
    cp -r /etc/apache2/sites-available /root/apache-backup-$(date +%Y%m%d-%H%M%S)/ 2>/dev/null || true
    success "Backup erstellt"
    
    # Stoppe Apache
    info "[2/4] Stoppe Apache..."
    systemctl stop apache2 2>/dev/null || true
    pkill -9 apache2 2>/dev/null || true
    success "Apache gestoppt"
    
    # Bereinige alte Configs
    info "[3/4] Bereinige alte Konfigurationen..."
    rm -f /etc/apache2/sites-enabled/*pgadmin* 2>/dev/null
    rm -f /etc/apache2/sites-available/*pgadmin* 2>/dev/null
    rm -f /etc/apache2/conf-enabled/*pgadmin* 2>/dev/null
    rm -f /etc/apache2/conf-available/*pgadmin* 2>/dev/null
    a2dissite pgadmin4 2>/dev/null || true
    a2disconf pgadmin4 2>/dev/null || true
    success "Alte Configs entfernt"
    
    # Erstelle neue Config
    info "[4/4] Erstelle neue Konfiguration..."
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
    success "Neue Config erstellt"
    
    # Teste Config
    echo ""
    info "Teste Apache-Konfiguration..."
    if apache2ctl configtest 2>&1 | grep -q "Syntax OK"; then
        success "Konfiguration gültig"
        
        # Starte Apache
        info "Starte Apache..."
        if systemctl start apache2; then
            sleep 2
            if systemctl is-active --quiet apache2; then
                success "Apache läuft"
                echo ""
                echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
                echo -e "${GREEN}║          pgAdmin Apache erfolgreich repariert!         ║${NC}"
                echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
                echo ""
                echo -e "${CYAN}Zugriff:${NC}"
                echo -e "  ${GREEN}►${NC} http://localhost:1880/pgadmin4"
                echo ""
            else
                error "Apache läuft nicht!"
                journalctl -u apache2 -n 20 --no-pager
            fi
        else
            error "Apache konnte nicht gestartet werden"
            journalctl -u apache2 -n 20 --no-pager
        fi
    else
        error "Apache-Konfiguration fehlerhaft:"
        apache2ctl configtest 2>&1 | sed 's/^/  /'
    fi
    
    echo ""
    read -p "Zurück zum Menü (Enter)" -r
    show_menu
}

################################################################################
# 8. pgAdmin Nginx-Config reparieren
################################################################################

fix_pgadmin_nginx() {
    print_section "PGADMIN NGINX-CONFIG REPARIEREN"
    
    info "Behebt: pgAdmin lädt dauerhaft, zeigt nur Spinner"
    echo ""
    
    # Finde pgAdmin Nginx-Config
    PGADMIN_CONFIG=""
    for config in /etc/nginx/sites-enabled/*; do
        if [ -f "$config" ] && grep -q "proxy_pass.*1880" "$config" 2>/dev/null; then
            PGADMIN_CONFIG="$config"
            break
        fi
    done
    
    if [ -z "$PGADMIN_CONFIG" ]; then
        warning "Keine pgAdmin Nginx-Config gefunden"
        echo ""
        echo -e "${CYAN}Möchtest du eine neue erstellen?${NC}"
        read -p "Domain für pgAdmin (z.B. pgadmin.example.com): " PGADMIN_DOMAIN
        
        if [ -n "$PGADMIN_DOMAIN" ]; then
            # Erstelle neue Config
            cat > "/etc/nginx/sites-available/$PGADMIN_DOMAIN" << 'NGINX_EOF'
# pgAdmin 4 Reverse Proxy
server {
    listen 80;
    listen [::]:80;
    server_name PGADMIN_DOMAIN_PLACEHOLDER;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Logging
    access_log /var/log/nginx/PGADMIN_DOMAIN_PLACEHOLDER_access.log;
    error_log /var/log/nginx/PGADMIN_DOMAIN_PLACEHOLDER_error.log;
    
    # Reverse Proxy zu Apache auf Port 1880
    location / {
        # WICHTIG: Trailing Slash bei proxy_pass!
        proxy_pass http://localhost:1880/;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Script-Name /pgadmin4;
        
        # WebSocket Support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Buffering
        proxy_buffering off;
        proxy_request_buffering off;
        
        # Timeouts
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
        proxy_read_timeout 300;
        send_timeout 300;
        
        # Client Settings
        client_max_body_size 100M;
    }
}
NGINX_EOF
            
            sed -i "s/PGADMIN_DOMAIN_PLACEHOLDER/$PGADMIN_DOMAIN/g" "/etc/nginx/sites-available/$PGADMIN_DOMAIN"
            ln -sf "/etc/nginx/sites-available/$PGADMIN_DOMAIN" "/etc/nginx/sites-enabled/"
            
            PGADMIN_CONFIG="/etc/nginx/sites-enabled/$PGADMIN_DOMAIN"
            success "Neue Config erstellt"
        else
            error "Keine Domain angegeben"
            echo ""
            read -p "Zurück zum Menü (Enter)" -r
            show_menu
            return
        fi
    fi
    
    CONFIG_NAME=$(basename "$PGADMIN_CONFIG")
    info "Repariere: $CONFIG_NAME"
    echo ""
    
    # Backup
    cp "$PGADMIN_CONFIG" "${PGADMIN_CONFIG}.backup-$(date +%Y%m%d-%H%M%S)"
    
    # Fix 1: Trailing Slash
    if ! grep -q "proxy_pass http://localhost:1880/" "$PGADMIN_CONFIG"; then
        sed -i 's|proxy_pass http://localhost:1880;|proxy_pass http://localhost:1880/;|g' "$PGADMIN_CONFIG"
        fix_applied "Trailing Slash hinzugefügt"
    else
        success "Trailing Slash vorhanden"
    fi
    
    # Fix 2: X-Script-Name Header
    if ! grep -q "X-Script-Name" "$PGADMIN_CONFIG"; then
        sed -i '/proxy_set_header X-Forwarded-Proto/a\        proxy_set_header X-Script-Name /pgadmin4;' "$PGADMIN_CONFIG"
        fix_applied "X-Script-Name Header hinzugefügt"
    else
        success "X-Script-Name Header vorhanden"
    fi
    
    # Fix 3: Buffering
    if ! grep -q "proxy_buffering off" "$PGADMIN_CONFIG"; then
        sed -i '/X-Script-Name/a\        \n        # Buffering\n        proxy_buffering off;\n        proxy_request_buffering off;' "$PGADMIN_CONFIG"
        fix_applied "Buffering-Settings hinzugefügt"
    fi
    
    # Teste Nginx
    echo ""
    info "Teste Nginx-Konfiguration..."
    if nginx -t 2>&1 | grep -q "successful"; then
        success "Nginx-Konfiguration gültig"
        
        systemctl reload nginx
        success "Nginx neu geladen"
        
        echo ""
        echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║          pgAdmin Nginx erfolgreich repariert!          ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
        echo ""
        echo -e "${CYAN}pgAdmin sollte jetzt funktionieren!${NC}"
        echo ""
    else
        error "Nginx-Konfiguration fehlerhaft:"
        nginx -t 2>&1 | sed 's/^/  /'
    fi
    
    echo ""
    read -p "Zurück zum Menü (Enter)" -r
    show_menu
}

################################################################################
# 9. pgAdmin Domain-Konflikt beheben
################################################################################

fix_pgadmin_domain_conflict() {
    print_section "PGADMIN DOMAIN-KONFLIKT BEHEBEN"
    
    info "Behebt: Haupt-Domain zeigt auf pgAdmin statt Website"
    echo ""
    
    # Analysiere Configs
    info "Analysiere Nginx-Konfigurationen..."
    echo ""
    
    MAIN_DOMAIN=""
    PGADMIN_DOMAIN=""
    MAIN_CONFIG=""
    
    for config in /etc/nginx/sites-enabled/*; do
        if [ -f "$config" ]; then
            filename=$(basename "$config")
            server_name=$(grep "server_name" "$config" | head -1 | awk '{print $2}' | sed 's/;//')
            
            if grep -q "proxy_pass.*1880" "$config" 2>/dev/null; then
                PGADMIN_DOMAIN="$server_name"
                echo -e "${BLUE}►${NC} pgAdmin Config: ${YELLOW}$filename${NC} → ${CYAN}$server_name${NC}"
            else
                if [ -z "$MAIN_DOMAIN" ] && [ "$server_name" != "default_server" ]; then
                    MAIN_DOMAIN="$server_name"
                    MAIN_CONFIG="$filename"
                    echo -e "${BLUE}►${NC} Haupt-Website: ${YELLOW}$filename${NC} → ${CYAN}$server_name${NC}"
                fi
            fi
        fi
    done
    
    echo ""
    
    if [ -z "$MAIN_DOMAIN" ]; then
        error "Keine Haupt-Website-Config gefunden!"
        read -p "Hauptdomain manuell eingeben: " MAIN_DOMAIN
    fi
    
    if [ -z "$PGADMIN_DOMAIN" ]; then
        warning "Keine pgAdmin-Config gefunden"
        read -p "pgAdmin-Domain eingeben: " PGADMIN_DOMAIN
    fi
    
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo -e "  Haupt-Website: ${GREEN}$MAIN_DOMAIN${NC}"
    echo -e "  pgAdmin:       ${GREEN}$PGADMIN_DOMAIN${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
    echo ""
    
    read -p "Ist das korrekt? (j/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Jj]$ ]]; then
        echo ""
        warning "Abgebrochen"
        read -p "Zurück zum Menü (Enter)" -r
        show_menu
        return
    fi
    
    # Backup
    echo ""
    info "Erstelle Backup..."
    mkdir -p /root/nginx-backup-$(date +%Y%m%d-%H%M%S)
    cp -r /etc/nginx/sites-available /root/nginx-backup-$(date +%Y%m%d-%H%M%S)/
    success "Backup erstellt"
    
    # Prüfe Haupt-Config
    echo ""
    info "Prüfe Haupt-Website-Config..."
    MAIN_CONFIG_PATH="/etc/nginx/sites-available/$MAIN_CONFIG"
    
    if [ -f "$MAIN_CONFIG_PATH" ] && grep -q "proxy_pass.*1880" "$MAIN_CONFIG_PATH"; then
        error "Haupt-Config verweist auf Port 1880 (pgAdmin)!"
        echo ""
        warning "Erstelle korrekte Haupt-Config..."
        
        # Erstelle korrekte Config
        cat > "/etc/nginx/sites-available/$MAIN_DOMAIN" << 'NGINX_CONFIG'
# FMSV Dingden - Haupt-Website
server {
    listen 80;
    listen [::]:80;
    server_name MAIN_DOMAIN_PLACEHOLDER;

    # Frontend (statische Dateien)
    root /var/www/fmsv-dingden/dist;
    index index.html;

    # Frontend-Dateien servieren
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API-Proxy zum Backend
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads
    location /uploads/ {
        alias /var/www/fmsv-dingden/Saves/;
        autoindex off;
    }

    # Logging
    access_log /var/log/nginx/fmsv_access.log;
    error_log /var/log/nginx/fmsv_error.log;
}
NGINX_CONFIG
        
        sed -i "s/MAIN_DOMAIN_PLACEHOLDER/$MAIN_DOMAIN/g" "/etc/nginx/sites-available/$MAIN_DOMAIN"
        ln -sf "/etc/nginx/sites-available/$MAIN_DOMAIN" "/etc/nginx/sites-enabled/"
        
        fix_applied "Haupt-Config korrigiert"
    else
        success "Haupt-Config ist korrekt"
    fi
    
    # Teste Nginx
    echo ""
    info "Teste Nginx-Konfiguration..."
    if nginx -t 2>&1 | grep -q "successful"; then
        success "Nginx-Konfiguration gültig"
        
        systemctl reload nginx
        success "Nginx neu geladen"
        
        echo ""
        echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║          Domain-Konflikt erfolgreich behoben!          ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
        echo ""
        echo -e "${CYAN}Teste die Domains:${NC}"
        echo -e "  ${GREEN}►${NC} Haupt-Website:  ${BLUE}http://$MAIN_DOMAIN${NC}"
        echo -e "  ${GREEN}►${NC} pgAdmin:        ${BLUE}http://$PGADMIN_DOMAIN${NC}"
        echo ""
    else
        error "Nginx-Konfiguration fehlerhaft:"
        nginx -t 2>&1 | sed 's/^/  /'
    fi
    
    echo ""
    read -p "Zurück zum Menü (Enter)" -r
    show_menu
}

################################################################################
# 10. pgAdmin vollständige Reparatur
################################################################################

fix_pgadmin_complete() {
    print_section "PGADMIN VOLLSTÄNDIGE REPARATUR"
    
    info "Führt alle pgAdmin-Reparaturen durch"
    echo ""
    
    read -p "Fortfahren? (j/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Jj]$ ]]; then
        show_menu
        return
    fi
    
    echo ""
    info "Schritt 1/3: Apache-Config reparieren..."
    fix_pgadmin_apache
    
    sleep 2
    
    echo ""
    info "Schritt 2/3: Nginx-Config reparieren..."
    fix_pgadmin_nginx
    
    sleep 2
    
    echo ""
    info "Schritt 3/3: Domain-Konflikt prüfen..."
    fix_pgadmin_domain_conflict
    
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║     pgAdmin vollständige Reparatur abgeschlossen!      ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    read -p "Zurück zum Menü (Enter)" -r
    show_menu
}

################################################################################
# 3. Backend-Logs anzeigen
################################################################################

show_logs() {
    print_section "BACKEND-LOGS"
    
    echo -e "${CYAN}Welche Logs möchtest du sehen?${NC}"
    echo ""
    echo -e "  ${GREEN}1${NC}) Backend Service Logs (systemd)"
    echo -e "  ${GREEN}2${NC}) Backend Log-Dateien"
    echo -e "  ${GREEN}3${NC}) Nginx Error Log"
    echo -e "  ${GREEN}4${NC}) Apache (pgAdmin) Log"
    echo -e "  ${GREEN}5${NC}) PostgreSQL Log"
    echo -e "  ${GREEN}0${NC}) Zurück"
    echo ""
    read -p "Auswahl [0-5]: " log_choice
    echo ""
    
    case $log_choice in
        1)
            echo -e "${CYAN}Backend Service Logs (letzte 50 Zeilen):${NC}"
            echo ""
            journalctl -u fmsv-backend -n 50 --no-pager
            ;;
        2)
            echo -e "${CYAN}Backend Log-Dateien:${NC}"
            echo ""
            if [ -d "$LOG_DIR" ]; then
                ls -lh "$LOG_DIR"/*.log 2>/dev/null || echo "Keine Log-Dateien gefunden"
                echo ""
                read -p "Welche Datei anzeigen? (Dateiname): " logfile
                if [ -f "$LOG_DIR/$logfile" ]; then
                    tail -50 "$LOG_DIR/$logfile"
                fi
            else
                warning "Log-Verzeichnis nicht gefunden"
            fi
            ;;
        3)
            echo -e "${CYAN}Nginx Error Log (letzte 50 Zeilen):${NC}"
            echo ""
            tail -50 /var/log/nginx/error.log
            ;;
        4)
            echo -e "${CYAN}Apache (pgAdmin) Log (letzte 50 Zeilen):${NC}"
            echo ""
            tail -50 /var/log/apache2/pgadmin_error.log 2>/dev/null || echo "Log nicht gefunden"
            ;;
        5)
            echo -e "${CYAN}PostgreSQL Log:${NC}"
            echo ""
            journalctl -u postgresql -n 50 --no-pager
            ;;
        0)
            show_menu
            return
            ;;
    esac
    
    echo ""
    read -p "Zurück zum Menü (Enter)" -r
    show_menu
}

################################################################################
# 4. Dienste-Status prüfen
################################################################################

check_services() {
    print_section "DIENSTE-STATUS"
    
    services=(
        "fmsv-backend:Backend Service"
        "nginx:Webserver"
        "postgresql:Datenbank"
        "apache2:pgAdmin"
        "cloudflared:Cloudflare Tunnel"
    )
    
    for service_info in "${services[@]}"; do
        service=$(echo "$service_info" | cut -d: -f1)
        name=$(echo "$service_info" | cut -d: -f2)
        
        echo -e "${CYAN}$name ($service):${NC}"
        if systemctl is-active --quiet "$service" 2>/dev/null; then
            success "Läuft"
            systemctl status "$service" --no-pager -l | head -5 | sed 's/^/  /'
        else
            warning "Läuft nicht"
        fi
        echo ""
    done
    
    echo ""
    read -p "Service neu starten? (Service-Name oder Enter für zurück): " restart_service
    
    if [ -n "$restart_service" ]; then
        if systemctl restart "$restart_service" 2>/dev/null; then
            success "$restart_service neu gestartet"
        else
            error "$restart_service konnte nicht neu gestartet werden"
        fi
        sleep 2
        check_services
    else
        show_menu
    fi
}

################################################################################
# 5. Datenbank testen
################################################################################

test_database() {
    print_section "DATENBANK TESTEN"
    
    cd "$BACKEND_DIR"
    
    if [ ! -f .env ]; then
        error ".env nicht gefunden!"
        echo ""
        read -p "Zurück zum Menü (Enter)" -r
        show_menu
        return
    fi
    
    # Lade Variablen
    source .env
    
    echo -e "${CYAN}Datenbank-Konfiguration:${NC}"
    echo -e "  Host: ${GREEN}$DB_HOST${NC}"
    echo -e "  Port: ${GREEN}$DB_PORT${NC}"
    echo -e "  User: ${GREEN}$DB_USER${NC}"
    echo -e "  Database: ${GREEN}$DB_NAME${NC}"
    echo ""
    
    # Test 1: PostgreSQL läuft?
    echo -e "${CYAN}[1/3] PostgreSQL Service...${NC}"
    if systemctl is-active --quiet postgresql; then
        success "PostgreSQL läuft"
    else
        error "PostgreSQL läuft nicht!"
        systemctl start postgresql 2>/dev/null && success "PostgreSQL gestartet" || error "Start fehlgeschlagen"
    fi
    echo ""
    
    # Test 2: Datenbank existiert?
    echo -e "${CYAN}[2/3] Datenbank existiert...${NC}"
    if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
        success "Datenbank '$DB_NAME' gefunden"
    else
        error "Datenbank '$DB_NAME' nicht gefunden!"
        echo ""
        read -p "Datenbank erstellen? (j/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Jj]$ ]]; then
            sudo -u postgres createdb "$DB_NAME"
            sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || true
            sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
            fix_applied "Datenbank erstellt"
        fi
    fi
    echo ""
    
    # Test 3: Verbindung testen
    echo -e "${CYAN}[3/3] Datenbank-Verbindung...${NC}"
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" &>/dev/null; then
        success "Verbindung erfolgreich!"
    else
        error "Verbindung fehlgeschlagen!"
        echo ""
        echo -e "${YELLOW}Mögliche Ursachen:${NC}"
        echo -e "  • Falsche Zugangsdaten in .env"
        echo -e "  • PostgreSQL erlaubt keine Verbindung (pg_hba.conf)"
        echo -e "  • User hat keine Berechtigung"
    fi
    
    echo ""
    read -p "Zurück zum Menü (Enter)" -r
    show_menu
}

################################################################################
# 6. .env Konfiguration prüfen
################################################################################

check_env() {
    print_section ".ENV KONFIGURATION"
    
    cd "$BACKEND_DIR"
    
    if [ ! -f .env ]; then
        error ".env nicht gefunden!"
        echo ""
        if [ -f env.example.txt ]; then
            read -p "Aus env.example.txt erstellen? (j/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Jj]$ ]]; then
                cp env.example.txt .env
                fix_applied ".env erstellt - BITTE KONFIGURIEREN!"
                nano .env
            fi
        fi
        echo ""
        read -p "Zurück zum Menü (Enter)" -r
        show_menu
        return
    fi
    
    success ".env gefunden"
    echo ""
    
    # Prüfe wichtige Variablen
    required_vars=(
        "NODE_ENV:Umgebung"
        "PORT:Backend Port"
        "BASE_URL:Base URL"
        "DB_HOST:Datenbank Host"
        "DB_PORT:Datenbank Port"
        "DB_USER:Datenbank User"
        "DB_PASSWORD:Datenbank Passwort"
        "DB_NAME:Datenbank Name"
        "JWT_SECRET:JWT Secret"
        "JWT_EXPIRES_IN:JWT Ablaufzeit"
    )
    
    echo -e "${CYAN}Konfiguration:${NC}"
    echo ""
    
    for var_info in "${required_vars[@]}"; do
        var=$(echo "$var_info" | cut -d: -f1)
        desc=$(echo "$var_info" | cut -d: -f2)
        
        if grep -q "^$var=" .env; then
            value=$(grep "^$var=" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
            
            # Verstecke sensible Daten
            if [[ "$var" == *"PASSWORD"* ]] || [[ "$var" == *"SECRET"* ]]; then
                display_value="***********"
            else
                display_value="$value"
            fi
            
            success "$desc ($var): $display_value"
        else
            error "$desc ($var): FEHLT!"
        fi
    done
    
    echo ""
    read -p ".env bearbeiten? (j/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Jj]$ ]]; then
        nano .env
    fi
    
    echo ""
    read -p "Zurück zum Menü (Enter)" -r
    show_menu
}

################################################################################
# 11. Kompletter Cache-Reset
################################################################################

complete_cache_reset() {
    print_section "KOMPLETTER CACHE-RESET"
    
    warning "ACHTUNG: Dies löscht alle temporären Dateien und startet alle Services neu!"
    echo ""
    read -p "Wirklich fortfahren? (j/n) " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Jj]$ ]]; then
        show_menu
        return
    fi
    
    echo ""
    info "[1/6] Stoppe Services..."
    systemctl stop fmsv-backend 2>/dev/null || true
    systemctl stop nginx 2>/dev/null || true
    success "Services gestoppt"
    
    info "[2/6] Lösche Node Modules..."
    cd "$BACKEND_DIR"
    rm -rf node_modules package-lock.json
    success "Node Modules gelöscht"
    
    info "[3/6] Installiere Node Modules neu..."
    npm install
    success "Node Modules installiert"
    
    info "[4/6] Bereinige npm Cache..."
    npm cache clean --force
    success "npm Cache bereinigt"
    
    info "[5/6] Bereinige Logs..."
    > /var/log/nginx/error.log
    > /var/log/nginx/access.log
    find "$LOG_DIR" -name "*.log" -type f -exec truncate -s 0 {} \;
    success "Logs bereinigt"
    
    info "[6/6] Starte Services neu..."
    systemctl start nginx
    systemctl start fmsv-backend
    success "Services gestartet"
    
    echo ""
    success "Cache-Reset abgeschlossen!"
    
    echo ""
    read -p "Zurück zum Menü (Enter)" -r
    show_menu
}

################################################################################
# 12. Port-Diagnose
################################################################################

port_diagnosis() {
    print_section "PORT-DIAGNOSE"
    
    ports=(
        "3000:Backend"
        "80:Nginx HTTP"
        "443:Nginx HTTPS"
        "1880:pgAdmin"
        "5432:PostgreSQL"
    )
    
    echo -e "${CYAN}Port-Belegung:${NC}"
    echo ""
    
    for port_info in "${ports[@]}"; do
        port=$(echo "$port_info" | cut -d: -f1)
        service=$(echo "$port_info" | cut -d: -f2)
        
        echo -e "${CYAN}Port $port ($service):${NC}"
        
        if netstat -tuln 2>/dev/null | grep -q ":$port " || lsof -ti:$port &>/dev/null 2>&1; then
            success "Belegt"
            
            # Zeige Prozess
            if command -v lsof &>/dev/null; then
                process=$(lsof -ti:$port | head -1 | xargs ps -p 2>/dev/null | tail -1 || echo "Unbekannt")
                echo -e "  ${BLUE}Prozess:${NC} $process"
            fi
        else
            warning "Frei (Service läuft nicht?)"
        fi
        echo ""
    done
    
    echo ""
    read -p "Zurück zum Menü (Enter)" -r
    show_menu
}

################################################################################
# 13. Nginx-Konfigurationen anzeigen
################################################################################

show_nginx_configs() {
    print_section "NGINX-KONFIGURATIONEN"
    
    echo -e "${CYAN}Aktive Nginx-Konfigurationen:${NC}"
    echo ""
    
    if [ ! -d /etc/nginx/sites-enabled ]; then
        error "Nginx sites-enabled Verzeichnis nicht gefunden"
        echo ""
        read -p "Zurück zum Menü (Enter)" -r
        show_menu
        return
    fi
    
    count=1
    declare -a configs
    
    for config in /etc/nginx/sites-enabled/*; do
        if [ -f "$config" ]; then
            filename=$(basename "$config")
            server_name=$(grep "server_name" "$config" | head -1 | awk '{print $2}' | sed 's/;//' || echo "default")
            
            echo -e "${GREEN}[$count]${NC} ${YELLOW}$filename${NC}"
            echo -e "    Server: ${CYAN}$server_name${NC}"
            
            # Prüfe auf pgAdmin
            if grep -q "proxy_pass.*1880" "$config" 2>/dev/null; then
                echo -e "    Typ: ${MAGENTA}pgAdmin Proxy${NC}"
            elif grep -q "proxy_pass.*3000" "$config" 2>/dev/null; then
                echo -e "    Typ: ${BLUE}Backend Proxy${NC}"
            elif grep -q "root" "$config" 2>/dev/null; then
                echo -e "    Typ: ${GREEN}Static Site${NC}"
            fi
            
            echo ""
            configs[$count]="$config"
            ((count++))
        fi
    done
    
    if [ $count -eq 1 ]; then
        warning "Keine Konfigurationen gefunden"
        echo ""
        read -p "Zurück zum Menü (Enter)" -r
        show_menu
        return
    fi
    
    echo ""
    read -p "Config anzeigen? (Nummer oder Enter für zurück): " config_choice
    
    if [ -n "$config_choice" ] && [ -n "${configs[$config_choice]}" ]; then
        echo ""
        echo -e "${CYAN}Inhalt von $(basename "${configs[$config_choice]}"):${NC}"
        echo ""
        cat "${configs[$config_choice]}" | sed 's/^/  /'
        echo ""
        read -p "Zurück (Enter)" -r
        show_nginx_configs
    else
        show_menu
    fi
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
