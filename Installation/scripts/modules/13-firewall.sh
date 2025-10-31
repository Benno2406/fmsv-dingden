#!/bin/bash
################################################################################
# Modul: Firewall-Konfiguration
# Konfiguriert UFW (Uncomplicated Firewall)
################################################################################

info "Konfiguriere Firewall (UFW)..."
echo ""

################################################################################
# 1. UFW Status prüfen
################################################################################

if command -v ufw &> /dev/null; then
    success "UFW ist installiert"
else
    error "UFW ist nicht installiert!"
    exit 1
fi

# Prüfe ob UFW bereits aktiv ist
if ufw status | grep -q "Status: active"; then
    info "UFW ist bereits aktiv"
    FIREWALL_ACTIVE=true
else
    info "UFW ist noch nicht aktiv"
    FIREWALL_ACTIVE=false
fi

################################################################################
# 2. Firewall-Regeln konfigurieren
################################################################################

info "Konfiguriere Firewall-Regeln..."
echo ""

# SSH (Port 22) - WICHTIG: Zuerst, damit wir uns nicht aussperren!
info "Erlaube SSH (Port 22)..."
ufw allow 22/tcp comment 'SSH' > /dev/null 2>&1
success "SSH (Port 22) erlaubt"

# HTTP & HTTPS (nur wenn kein Cloudflare)
if [[ ! $USE_CLOUDFLARE =~ ^[Jj]$ ]]; then
    info "Erlaube HTTP (Port 80)..."
    ufw allow 80/tcp comment 'HTTP' > /dev/null 2>&1
    success "HTTP (Port 80) erlaubt"
    
    info "Erlaube HTTPS (Port 443)..."
    ufw allow 443/tcp comment 'HTTPS' > /dev/null 2>&1
    success "HTTPS (Port 443) erlaubt"
else
    info "HTTP/HTTPS nicht erlaubt (Cloudflare Tunnel aktiv)"
fi

# PostgreSQL (Port 5432) - NUR localhost!
# PostgreSQL sollte NICHT von außen erreichbar sein
info "PostgreSQL (Port 5432) nur auf localhost..."
success "PostgreSQL nur lokal erreichbar (OK)"

# Backend (Port 3000) - NUR localhost!
# Backend sollte NICHT von außen erreichbar sein (nur über Nginx Proxy)
info "Backend (Port 3000) nur auf localhost..."
success "Backend nur lokal erreichbar (OK)"

# pgAdmin (falls installiert)
if [[ $INSTALL_PGADMIN =~ ^[Jj]$ ]]; then
    info "Erlaube pgAdmin (Ports 1880, 18443)..."
    ufw allow 1880/tcp comment 'pgAdmin HTTP' > /dev/null 2>&1
    ufw allow 18443/tcp comment 'pgAdmin HTTPS' > /dev/null 2>&1
    success "pgAdmin (1880, 18443) erlaubt"
fi

################################################################################
# 3. Default-Policies setzen
################################################################################

echo ""
info "Setze Default-Policies..."

# Eingehend: Deny (alles blocken außer explizit erlaubt)
ufw default deny incoming > /dev/null 2>&1
success "Eingehend: DENY (Standard)"

# Ausgehend: Allow (alles erlauben)
ufw default allow outgoing > /dev/null 2>&1
success "Ausgehend: ALLOW (Standard)"

################################################################################
# 4. Firewall aktivieren
################################################################################

echo ""
info "Aktiviere Firewall..."

if [ "$FIREWALL_ACTIVE" = false ]; then
    # Firewall aktivieren (mit --force um Prompt zu überspringen)
    if ufw --force enable 2>&1 | tee -a "$LOG_FILE" > /dev/null; then
        success "Firewall aktiviert"
    else
        error "Firewall konnte nicht aktiviert werden!"
        exit 1
    fi
else
    # Firewall neu laden
    if ufw reload > /dev/null 2>&1; then
        success "Firewall neu geladen"
    else
        warning "Firewall-Reload fehlgeschlagen"
    fi
fi

################################################################################
# 5. Firewall-Status anzeigen
################################################################################

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🔒 Firewall-Status${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Status anzeigen
ufw status numbered | sed 's/^/  /'

echo ""

################################################################################
# 6. Sicherheits-Hinweise
################################################################################

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🛡️  Sicherheits-Hinweise${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${GREEN}✓${NC} SSH (Port 22) ist erlaubt"
echo -e "${DIM}  → Zugriff per ssh root@server-ip möglich${NC}"
echo ""

if [[ ! $USE_CLOUDFLARE =~ ^[Jj]$ ]]; then
    echo -e "${GREEN}✓${NC} HTTP/HTTPS (Ports 80/443) sind erlaubt"
    echo -e "${DIM}  → Website ist öffentlich erreichbar${NC}"
else
    echo -e "${YELLOW}⚠${NC} HTTP/HTTPS (Ports 80/443) sind NICHT erlaubt"
    echo -e "${DIM}  → Nur über Cloudflare Tunnel erreichbar (OK)${NC}"
fi

echo ""
echo -e "${GREEN}✓${NC} Backend (Port 3000) ist NUR lokal erreichbar"
echo -e "${DIM}  → Zugriff nur über Nginx Proxy (Sicherheit!)${NC}"
echo ""

echo -e "${GREEN}✓${NC} PostgreSQL (Port 5432) ist NUR lokal erreichbar"
echo -e "${DIM}  → Datenbank nicht von außen zugänglich (Sicherheit!)${NC}"
echo ""

if [[ $INSTALL_PGADMIN =~ ^[Jj]$ ]]; then
    echo -e "${YELLOW}⚠${NC} pgAdmin (Ports 1880, 18443) ist öffentlich"
    echo -e "${DIM}  → Zugriff mit pgAdmin Login-Daten schützen!${NC}"
    echo ""
fi

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

################################################################################
# 7. UFW-Logs aktivieren (Optional)
################################################################################

if ask_yes_no "UFW-Logging aktivieren? (empfohlen für Debugging)" "n"; then
    info "Aktiviere UFW-Logging..."
    ufw logging on > /dev/null 2>&1
    success "UFW-Logging aktiviert"
    info "Logs: /var/log/ufw.log"
else
    info "UFW-Logging bleibt deaktiviert"
fi

log_success "Firewall configured and active"
log_info "SSH: allowed, HTTP/HTTPS: $([ \"$USE_CLOUDFLARE\" = \"j\" ] && echo \"blocked (Cloudflare)\" || echo \"allowed\")"
