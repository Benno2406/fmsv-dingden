#!/bin/bash
################################################################################
# Modul: Node.js Installation
# Installiert Node.js LTS über NodeSource Repository
################################################################################

info "Prüfe Node.js Installation..."

# Prüfe ob Node.js bereits installiert ist
if command -v node &> /dev/null; then
    CURRENT_NODE_VERSION=$(node --version)
    CURRENT_NPM_VERSION=$(npm --version)
    
    success "Node.js bereits installiert"
    info "Node.js: $CURRENT_NODE_VERSION"
    info "npm: $CURRENT_NPM_VERSION"
    
    # Prüfe Version (sollte >= 18 sein)
    NODE_MAJOR=$(echo "$CURRENT_NODE_VERSION" | sed 's/v//' | cut -d. -f1)
    if [ "$NODE_MAJOR" -ge 18 ]; then
        success "Node.js Version OK (>= 18.x)"
        log_info "Node.js already installed: $CURRENT_NODE_VERSION"
        return 0
    else
        warning "Node.js Version zu alt ($CURRENT_NODE_VERSION)"
        warning "Empfohlen: Node.js 18.x oder neuer"
        echo ""
        
        if ask_yes_no "Node.js auf LTS aktualisieren?" "y"; then
            info "Node.js wird aktualisiert..."
        else
            info "Installation wird mit alter Node.js Version fortgesetzt"
            return 0
        fi
    fi
fi

echo ""
info "Füge NodeSource Repository hinzu..."

# NodeSource Setup Script herunterladen und ausführen
if curl -fsSL https://deb.nodesource.com/setup_lts.x 2>&1 | tee -a "$LOG_FILE" | bash - > /dev/null 2>&1; then
    success "NodeSource Repository hinzugefügt"
else
    error "NodeSource Repository konnte nicht hinzugefügt werden!"
    echo ""
    echo -e "${YELLOW}Manuelle Installation:${NC}"
    echo -e "  ${GREEN}curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -${NC}"
    echo ""
    exit 1
fi

echo ""
info "Installiere Node.js LTS..."

if DEBIAN_FRONTEND=noninteractive apt-get install -y -qq nodejs 2>&1 | tee -a "$LOG_FILE" > /dev/null; then
    success "Node.js installiert"
else
    error "Node.js Installation fehlgeschlagen!"
    echo ""
    tail -20 "$LOG_FILE" | sed 's/^/  /'
    echo ""
    exit 1
fi

# Validierung
echo ""
info "Validiere Installation..."

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    success "Node.js: $NODE_VERSION"
else
    error "Node.js nicht verfügbar!"
    exit 1
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    success "npm: $NPM_VERSION"
else
    error "npm nicht verfügbar!"
    exit 1
fi

# Prüfe Version
NODE_MAJOR=$(echo "$NODE_VERSION" | sed 's/v//' | cut -d. -f1)
if [ "$NODE_MAJOR" -ge 18 ]; then
    success "Node.js Version OK (LTS)"
else
    warning "Node.js Version niedriger als LTS ($NODE_VERSION)"
fi

# npm Cache konfigurieren
info "Konfiguriere npm..."
npm config set loglevel error 2>/dev/null || true
success "npm konfiguriert"

log_success "Node.js LTS installed"
log_info "Node.js: $NODE_VERSION, npm: $NPM_VERSION"
