#!/bin/bash
################################################################################
# Modul: PostgreSQL Installation
# Installiert und konfiguriert PostgreSQL Datenbank-Server
################################################################################

info "Installiere PostgreSQL..."
echo ""

# Prüfe ob PostgreSQL bereits installiert ist
if systemctl is-active --quiet postgresql 2>/dev/null; then
    PG_VERSION=$(psql --version 2>/dev/null | awk '{print $3}' | cut -d. -f1)
    success "PostgreSQL bereits installiert (Version $PG_VERSION)"
    
    # Prüfe ob es läuft
    if systemctl is-active --quiet postgresql; then
        success "PostgreSQL läuft bereits"
    else
        info "Starte PostgreSQL..."
        systemctl start postgresql
        success "PostgreSQL gestartet"
    fi
else
    # Installiere PostgreSQL
    info "Installiere PostgreSQL und postgresql-contrib..."
    
    if DEBIAN_FRONTEND=noninteractive apt-get install -y -qq postgresql postgresql-contrib 2>&1 | tee -a "$LOG_FILE" > /dev/null; then
        success "PostgreSQL installiert"
    else
        error "PostgreSQL Installation fehlgeschlagen!"
        echo ""
        echo -e "${YELLOW}Logs:${NC}"
        tail -20 "$LOG_FILE" | sed 's/^/  /'
        echo ""
        exit 1
    fi
    
    # Starte PostgreSQL
    info "Starte PostgreSQL..."
    systemctl start postgresql
    sleep 2
    
    if systemctl is-active --quiet postgresql; then
        success "PostgreSQL gestartet"
    else
        error "PostgreSQL konnte nicht gestartet werden!"
        echo ""
        systemctl status postgresql --no-pager -l | sed 's/^/  /'
        echo ""
        exit 1
    fi
fi

# Auto-Start aktivieren
info "Aktiviere PostgreSQL Auto-Start..."
systemctl enable postgresql > /dev/null 2>&1
success "Auto-Start aktiviert"

# Version & Status anzeigen
echo ""
PG_VERSION=$(psql --version | awk '{print $3}')
info "PostgreSQL Version: $PG_VERSION"

# Port-Check
if check_port 5432 "no"; then
    success "PostgreSQL lauscht auf Port 5432"
else
    warning "PostgreSQL lauscht nicht auf Port 5432 (möglicherweise nur localhost)"
fi

# Teste PostgreSQL-Verbindung
info "Teste PostgreSQL-Verbindung..."
if su - postgres -c "psql -c 'SELECT version();'" > /dev/null 2>&1; then
    success "PostgreSQL-Verbindung erfolgreich"
else
    error "PostgreSQL-Verbindung fehlgeschlagen!"
    exit 1
fi

log_success "PostgreSQL installed and running"
log_info "PostgreSQL version: $PG_VERSION"
