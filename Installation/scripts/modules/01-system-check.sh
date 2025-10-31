#!/bin/bash
################################################################################
# Modul: System-Prüfung
# Prüft ob das System die Voraussetzungen für die Installation erfüllt
################################################################################

# Root-Check
if [ "$EUID" -ne 0 ]; then
    error "Script muss als root ausgeführt werden!"
    echo ""
    echo -e "${YELLOW}Verwendung:${NC}"
    echo -e "  ${GREEN}sudo ./install.sh${NC}"
    echo ""
    exit 1
fi
success "Root-Rechte vorhanden"

# Debian-Check
if [ ! -f /etc/debian_version ]; then
    error "Kein Debian-System erkannt!"
    echo ""
    echo -e "${YELLOW}Dieses Script ist nur für Debian-basierte Systeme!${NC}"
    echo -e "${YELLOW}Erkanntes System:${NC} $(uname -a)"
    echo ""
    exit 1
fi

DEBIAN_VERSION=$(cat /etc/debian_version | cut -d. -f1)
info "Debian Version: $DEBIAN_VERSION"

if [ "$DEBIAN_VERSION" -lt 12 ]; then
    warning "Debian $DEBIAN_VERSION ist älter als empfohlen"
    warning "Empfohlen: Debian 12 (Bookworm) oder neuer"
    echo ""
    
    if ! ask_yes_no "Trotzdem fortfahren?" "n"; then
        info "Installation abgebrochen"
        exit 0
    fi
fi
success "Debian-Version OK"

# Internet-Verbindung prüfen
info "Prüfe Internet-Verbindung..."

if ping -c 1 -W 2 google.com &> /dev/null; then
    success "Internet-Verbindung OK (google.com erreichbar)"
elif ping -c 1 -W 2 1.1.1.1 &> /dev/null; then
    success "Internet-Verbindung OK (1.1.1.1 erreichbar)"
elif ping -c 1 -W 2 debian.org &> /dev/null; then
    success "Internet-Verbindung OK (debian.org erreichbar)"
else
    error "Keine Internet-Verbindung!"
    echo ""
    echo -e "${YELLOW}Die Installation benötigt Internet-Zugang für:${NC}"
    echo -e "  ${BLUE}•${NC} Paket-Downloads (apt-get)"
    echo -e "  ${BLUE}•${NC} Repository-Klonen (git)"
    echo -e "  ${BLUE}•${NC} Node.js Packages (npm)"
    echo ""
    echo -e "${YELLOW}Diagnose:${NC}"
    echo -e "  ${GREEN}ping google.com${NC}"
    echo -e "  ${GREEN}cat /etc/resolv.conf${NC}  ${CYAN}# DNS prüfen${NC}"
    echo -e "  ${GREEN}ip route${NC}  ${CYAN}# Gateway prüfen${NC}"
    echo ""
    exit 1
fi

# Speicherplatz prüfen
info "Prüfe Speicherplatz..."

AVAILABLE_GB=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')
info "Verfügbarer Speicher: ${AVAILABLE_GB}GB"

if [ "$AVAILABLE_GB" -lt 2 ]; then
    error "Zu wenig Speicherplatz!"
    echo ""
    echo -e "${YELLOW}Mindestens 2GB freier Speicher erforderlich${NC}"
    echo -e "${YELLOW}Verfügbar: ${AVAILABLE_GB}GB${NC}"
    echo ""
    echo -e "${CYAN}Speichernutzung:${NC}"
    df -h / | sed 's/^/  /'
    echo ""
    exit 1
fi

if [ "$AVAILABLE_GB" -lt 5 ]; then
    warning "Wenig Speicherplatz verfügbar (${AVAILABLE_GB}GB)"
    warning "Empfohlen: Mindestens 5GB für Updates und Logs"
fi

success "Speicherplatz OK (${AVAILABLE_GB}GB verfügbar)"

# RAM prüfen
info "Prüfe Arbeitsspeicher..."

TOTAL_RAM=$(free -m | awk 'NR==2 {print $2}')
AVAILABLE_RAM=$(free -m | awk 'NR==2 {print $7}')
info "RAM: ${AVAILABLE_RAM}MB verfügbar von ${TOTAL_RAM}MB"

if [ "$AVAILABLE_RAM" -lt 512 ]; then
    warning "Wenig RAM verfügbar (${AVAILABLE_RAM}MB)"
    warning "Frontend-Build benötigt ca. 512MB RAM"
    echo ""
    
    if ! ask_yes_no "Trotzdem fortfahren? (Build könnte fehlschlagen)" "y"; then
        info "Installation abgebrochen"
        exit 0
    fi
fi

success "RAM OK (${AVAILABLE_RAM}MB verfügbar)"

# Port-Prüfung
info "Prüfe Port-Verfügbarkeit..."

PORTS_OK=true

# Funktion zum Port-Check
check_port_availability() {
    local port=$1
    local description="$2"
    
    if ss -tuln 2>/dev/null | grep -q ":$port " || netstat -tuln 2>/dev/null | grep -q ":$port "; then
        warning "Port $port bereits belegt ($description)"
        ss -tuln 2>/dev/null | grep ":$port " | sed 's/^/     /' || netstat -tuln 2>/dev/null | grep ":$port " | sed 's/^/     /'
        return 1
    else
        success "Port $port frei ($description)"
        return 0
    fi
}

# Wichtige Ports prüfen
check_port_availability 80 "Nginx HTTP" || PORTS_OK=false
check_port_availability 443 "Nginx HTTPS" || PORTS_OK=false  
check_port_availability 3000 "Backend API" || PORTS_OK=false
check_port_availability 5432 "PostgreSQL" || PORTS_OK=false

if [ "$PORTS_OK" = false ]; then
    warning "Einige Ports sind bereits belegt"
    echo ""
    echo -e "${YELLOW}Häufige Ursachen:${NC}"
    echo -e "  ${BLUE}•${NC} Vorherige Installation läuft noch"
    echo -e "  ${BLUE}•${NC} Apache/nginx bereits installiert"
    echo -e "  ${BLUE}•${NC} PostgreSQL bereits installiert"
    echo ""
    echo -e "${YELLOW}Lösung:${NC}"
    echo -e "  ${GREEN}systemctl stop apache2 nginx postgresql${NC}"
    echo -e "  ${GREEN}# Oder Installation trotzdem fortsetzen${NC}"
    echo ""
    
    if ! ask_yes_no "Trotzdem fortfahren?" "y"; then
        info "Installation abgebrochen"
        exit 0
    fi
fi

# System-Informationen loggen
log_info "System Information:"
log_info "  OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
log_info "  Kernel: $(uname -r)"
log_info "  Architecture: $(uname -m)"
log_info "  CPUs: $(nproc)"
log_info "  RAM: ${TOTAL_RAM}MB (${AVAILABLE_RAM}MB available)"
log_info "  Disk: ${AVAILABLE_GB}GB available"

success "System-Prüfung abgeschlossen"
