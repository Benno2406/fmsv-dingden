#!/bin/bash
################################################################################
# Modul: Basis-Tools
# Installiert grundlegende Tools für die Installation
################################################################################

info "Installiere Basis-Tools..."
echo ""

# Liste der benötigten Pakete
PACKAGES=(
    "curl"              # HTTP Client
    "wget"              # Download Tool
    "git"               # Version Control
    "nano"              # Text Editor
    "ufw"               # Firewall
    "lsb-release"       # System Info
    "gnupg"             # GPG Keys
    "software-properties-common"  # Repository Management
    "apt-transport-https"         # HTTPS Support für apt
    "ca-certificates"             # SSL Certificates
    "net-tools"         # Network Tools (netstat)
    "dnsutils"          # DNS Tools (dig, nslookup)
)

# Prüfe welche Pakete bereits installiert sind
INSTALLED_COUNT=0
TO_INSTALL=()

for package in "${PACKAGES[@]}"; do
    if dpkg -l | grep -q "^ii  $package "; then
        ((INSTALLED_COUNT++))
        debug "$package bereits installiert"
    else
        TO_INSTALL+=("$package")
    fi
done

if [ ${#TO_INSTALL[@]} -eq 0 ]; then
    success "Alle Basis-Tools bereits installiert ($INSTALLED_COUNT/${#PACKAGES[@]})"
else
    info "Installiere ${#TO_INSTALL[@]} fehlende Pakete..."
    
    # Installiere fehlende Pakete
    if DEBIAN_FRONTEND=noninteractive apt-get install -y -qq "${TO_INSTALL[@]}" 2>&1 | tee -a "$LOG_FILE" > /dev/null; then
        success "Basis-Tools installiert (${#TO_INSTALL[@]} neue, $INSTALLED_COUNT bereits vorhanden)"
    else
        error "Installation einiger Basis-Tools fehlgeschlagen!"
        echo ""
        echo -e "${YELLOW}Fehlende Pakete:${NC}"
        for pkg in "${TO_INSTALL[@]}"; do
            echo "  • $pkg"
        done
        echo ""
        exit 1
    fi
fi

# Validierung: Prüfe wichtige Commands
echo ""
info "Validiere installierte Tools..."

CRITICAL_COMMANDS=(
    "curl:curl"
    "wget:wget"
    "git:git"
    "ufw:ufw"
)

VALIDATION_OK=true

for cmd_pair in "${CRITICAL_COMMANDS[@]}"; do
    cmd="${cmd_pair%%:*}"
    package="${cmd_pair##*:}"
    
    if command -v "$cmd" &> /dev/null; then
        success "$cmd verfügbar"
    else
        error "$cmd nicht verfügbar (Paket: $package)"
        VALIDATION_OK=false
    fi
done

if [ "$VALIDATION_OK" = false ]; then
    error "Einige kritische Tools fehlen!"
    exit 1
fi

log_success "Base tools installed and validated"
