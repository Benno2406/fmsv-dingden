#!/bin/bash
################################################################################
# Modul: Services starten
# Startet alle Services und prüft ob sie laufen
################################################################################

info "Starte Services..."
echo ""

################################################################################
# 1. Backend starten
################################################################################

info "Starte Backend (fmsv-backend)..."

# Prüfe ob Service existiert
if [ ! -f /etc/systemd/system/fmsv-backend.service ]; then
    error "Backend Service nicht gefunden!"
    echo ""
    echo -e "${YELLOW}Service muss erstellt werden:${NC}"
    echo -e "  siehe Modul 09-backend.sh"
    echo ""
    exit 1
fi

# Starte Service
if systemctl start fmsv-backend 2>&1 | tee -a "$LOG_FILE" > /dev/null; then
    info "Backend gestartet, warte auf Initialisierung..."
    sleep 3
else
    warning "Backend-Start hatte Probleme"
fi

# Prüfe ob Backend läuft
if check_service "fmsv-backend" 10; then
    success "Backend läuft"
else
    error "Backend läuft nicht!"
    echo ""
    echo -e "${YELLOW}Service-Status:${NC}"
    systemctl status fmsv-backend --no-pager -l | sed 's/^/  /'
    echo ""
    echo -e "${YELLOW}Letzte Logs:${NC}"
    journalctl -u fmsv-backend -n 30 --no-pager | sed 's/^/  /'
    echo ""
    exit 1
fi

# Teste Backend-Erreichbarkeit
echo ""
info "Teste Backend-Erreichbarkeit..."
sleep 2

if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    success "Backend antwortet auf http://localhost:3000/api/health"
else
    warning "Backend noch nicht erreichbar (startet möglicherweise noch)"
    info "Warte weitere 5 Sekunden..."
    sleep 5
    
    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        success "Backend jetzt erreichbar"
    else
        warning "Backend-Health-Check fehlgeschlagen"
        warning "Backend läuft aber Service ist aktiv - wird fortgesetzt"
    fi
fi

################################################################################
# 2. Nginx starten
################################################################################

echo ""
info "Starte Nginx..."

# Prüfe Nginx Config nochmal
if ! nginx -t > /dev/null 2>&1; then
    warning "Nginx-Konfiguration fehlerhaft!"
    nginx -t
    echo ""
fi

# Starte Nginx
if systemctl start nginx 2>&1 | tee -a "$LOG_FILE" > /dev/null; then
    sleep 2
    
    if check_service "nginx" 10; then
        success "Nginx läuft"
    else
        error "Nginx läuft nicht!"
        echo ""
        systemctl status nginx --no-pager -l | sed 's/^/  /'
        echo ""
        exit 1
    fi
else
    error "Nginx-Start fehlgeschlagen!"
    exit 1
fi

# Teste Nginx-Erreichbarkeit
echo ""
info "Teste Nginx-Erreichbarkeit..."

if curl -s http://localhost > /dev/null 2>&1; then
    success "Nginx antwortet auf http://localhost"
else
    warning "Nginx nicht erreichbar auf localhost"
fi

################################################################################
# 3. PostgreSQL prüfen
################################################################################

echo ""
info "Prüfe PostgreSQL..."

if check_service "postgresql" 5; then
    success "PostgreSQL läuft"
else
    warning "PostgreSQL läuft nicht - starte..."
    systemctl start postgresql
    sleep 2
    check_service "postgresql" 10 || {
        error "PostgreSQL konnte nicht gestartet werden!"
        exit 1
    }
fi

################################################################################
# 4. Cloudflare Tunnel (falls installiert)
################################################################################

if [[ $USE_CLOUDFLARE =~ ^[Jj]$ ]]; then
    echo ""
    info "Prüfe Cloudflare Tunnel..."
    
    if systemctl list-unit-files | grep -q cloudflared; then
        info "Starte Cloudflare Tunnel..."
        
        if systemctl start cloudflared 2>&1 | tee -a "$LOG_FILE" > /dev/null; then
            sleep 2
            
            if check_service "cloudflared" 10; then
                success "Cloudflare Tunnel läuft"
            else
                warning "Cloudflare Tunnel läuft nicht"
                warning "Kann später manuell gestartet werden"
            fi
        else
            warning "Cloudflare Tunnel konnte nicht gestartet werden"
        fi
    else
        info "Cloudflare Tunnel nicht installiert (OK)"
    fi
fi

################################################################################
# 5. Service-Übersicht
################################################################################

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📊 Service-Übersicht${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Funktion zum Service-Status anzeigen
show_service_status() {
    local service="$1"
    local name="$2"
    
    if systemctl is-active --quiet "$service" 2>/dev/null; then
        echo -e "  ${GREEN}●${NC} $name: ${GREEN}läuft${NC}"
    else
        echo -e "  ${RED}●${NC} $name: ${RED}gestoppt${NC}"
    fi
}

show_service_status "fmsv-backend" "Backend"
show_service_status "nginx" "Nginx"
show_service_status "postgresql" "PostgreSQL"

if [[ $USE_CLOUDFLARE =~ ^[Jj]$ ]] && systemctl list-unit-files | grep -q cloudflared; then
    show_service_status "cloudflared" "Cloudflare Tunnel"
fi

echo ""

################################################################################
# 6. Port-Übersicht
################################################################################

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🔌 Port-Übersicht${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Funktion zum Port-Status anzeigen
show_port_status() {
    local port="$1"
    local name="$2"
    
    if ss -tuln 2>/dev/null | grep -q ":$port " || netstat -tuln 2>/dev/null | grep -q ":$port "; then
        echo -e "  ${GREEN}●${NC} Port $port: ${GREEN}$name${NC}"
    else
        echo -e "  ${RED}●${NC} Port $port: ${RED}nicht belegt${NC} ($name)"
    fi
}

show_port_status "80" "Nginx HTTP"
show_port_status "443" "Nginx HTTPS"
show_port_status "3000" "Backend API"
show_port_status "5432" "PostgreSQL"

echo ""

log_success "All services started and running"
