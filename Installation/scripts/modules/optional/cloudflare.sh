#!/bin/bash
################################################################################
# Modul: Cloudflare Tunnel
# Installiert und konfiguriert Cloudflare Tunnel für sicheren Zugriff
################################################################################

info "Cloudflare Tunnel Installation..."
echo ""

################################################################################
# 1. Cloudflare GPG Key & Repository
################################################################################

info "Füge Cloudflare GPG Key hinzu..."
mkdir -p --mode=0755 /usr/share/keyrings

if ! curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | tee /usr/share/keyrings/cloudflare-main.gpg > /dev/null 2>&1; then
    echo ""
    error "Cloudflare GPG Key konnte nicht heruntergeladen werden!"
    echo ""
    echo -e "${YELLOW}Mögliche Ursachen:${NC}"
    echo -e "  ${RED}1.${NC} Keine Internetverbindung zu Cloudflare"
    echo -e "  ${RED}2.${NC} Cloudflare Server nicht erreichbar"
    echo -e "  ${RED}3.${NC} Firewall blockiert Zugriff"
    echo ""
    echo -e "${YELLOW}Optionen:${NC}"
    echo -e "  ${GREEN}1.${NC} Internetverbindung prüfen: ${CYAN}ping cloudflare.com${NC}"
    echo -e "  ${GREEN}2.${NC} Cloudflare später manuell einrichten"
    echo ""
    
    if ask_yes_no "Cloudflare überspringen und fortfahren?" "j"; then
        warning "Cloudflare wird übersprungen - kann später nachgeholt werden!"
        echo ""
        echo -e "  ${CYAN}Siehe: Installation/Anleitung/Cloudflare-Tunnel-Setup.md${NC}"
        echo ""
        return 0
    else
        echo ""
        info "Installation wird abgebrochen."
        exit 1
    fi
fi

success "Cloudflare GPG Key hinzugefügt"

################################################################################
# 2. Cloudflare Repository hinzufügen
################################################################################

echo ""
info "Füge Cloudflare Repository hinzu..."

# Cloudflare unterstützt aktuell nur bookworm, nicht trixie
# Daher verwenden wir bookworm auch bei Debian 13
CLOUDFLARE_DIST="bookworm"

# Debian Version prüfen
DEBIAN_VERSION=$(cat /etc/debian_version | cut -d. -f1)
if [ "$DEBIAN_VERSION" -lt 12 ]; then
    CLOUDFLARE_DIST="bullseye"
fi

info "Verwende Cloudflare Repository für: $CLOUDFLARE_DIST"

cat > /etc/apt/sources.list.d/cloudflared.list <<EOF
deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared $CLOUDFLARE_DIST main
EOF

success "Cloudflare Repository hinzugefügt"

################################################################################
# 3. Paket-Listen aktualisieren & cloudflared installieren
################################################################################

echo ""
info "Aktualisiere Paket-Listen..."
apt-get update -qq 2>&1 | tee -a "$LOG_FILE" > /dev/null

info "Installiere cloudflared..."
if apt-get install -y -qq cloudflared 2>&1 | tee -a "$LOG_FILE" > /dev/null; then
    success "cloudflared installiert"
else
    error "cloudflared Installation fehlgeschlagen!"
    echo ""
    echo -e "${YELLOW}Manuelle Installation:${NC}"
    echo -e "  ${GREEN}apt-get install -y cloudflared${NC}"
    echo ""
    exit 1
fi

# Version anzeigen
CF_VERSION=$(cloudflared --version 2>/dev/null | head -1)
info "Version: $CF_VERSION"

################################################################################
# 4. Cloudflare Login
################################################################################

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  ${YELLOW}Cloudflare Login benötigt${NC}                          ${CYAN}║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Um Cloudflare Tunnel zu konfigurieren, musst du dich${NC}"
echo -e "${YELLOW}in deinem Cloudflare-Account anmelden.${NC}"
echo ""
echo -e "${CYAN}So funktioniert's:${NC}"
echo -e "  ${BLUE}1.${NC} Ein Browser-Fenster öffnet sich automatisch"
echo -e "  ${BLUE}2.${NC} Melde dich bei Cloudflare an"
echo -e "  ${BLUE}3.${NC} Autorisiere den Tunnel"
echo -e "  ${BLUE}4.${NC} Das Script fährt automatisch fort"
echo ""
echo -e "${YELLOW}Falls kein Browser verfügbar ist:${NC}"
echo -e "  ${BLUE}•${NC} URL wird im Terminal angezeigt"
echo -e "  ${BLUE}•${NC} Öffne die URL auf einem anderen Gerät"
echo -e "  ${BLUE}•${NC} Melde dich an und kehre zurück"
echo ""

if ! ask_yes_no "Jetzt bei Cloudflare anmelden?" "j"; then
    warning "Cloudflare Login abgebrochen"
    echo ""
    echo -e "${YELLOW}Später manuell fortsetzen:${NC}"
    echo -e "  ${GREEN}cloudflared tunnel login${NC}"
    echo ""
    return 0
fi

echo ""
info "Starte Cloudflare Login..."
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Login durchführen
if cloudflared tunnel login 2>&1 | tee -a "$LOG_FILE"; then
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    success "Cloudflare Login erfolgreich"
else
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    error "Cloudflare Login fehlgeschlagen!"
    echo ""
    echo -e "${YELLOW}Häufige Probleme:${NC}"
    echo -e "  ${RED}1.${NC} Kein Browser verfügbar (Server ohne GUI)"
    echo -e "  ${RED}2.${NC} Login-Timeout"
    echo -e "  ${RED}3.${NC} Falscher Cloudflare Account"
    echo ""
    echo -e "${YELLOW}Lösung:${NC}"
    echo -e "  ${GREEN}1.${NC} Login auf anderem Gerät:"
    echo -e "     ${CYAN}cloudflared tunnel login${NC}"
    echo -e "     ${CYAN}# Öffne URL im Browser${NC}"
    echo -e "  ${GREEN}2.${NC} Cert-Datei auf Server kopieren:"
    echo -e "     ${CYAN}~/.cloudflared/cert.pem${NC}"
    echo ""
    exit 1
fi

################################################################################
# 5. Tunnel erstellen
################################################################################

echo ""
TUNNEL_NAME="fmsv-dingden"
info "Erstelle Tunnel '$TUNNEL_NAME'..."

# Lösche alten Tunnel falls vorhanden
cloudflared tunnel delete $TUNNEL_NAME 2>/dev/null || true

# Erstelle neuen Tunnel
if cloudflared tunnel create $TUNNEL_NAME > /dev/null 2>&1; then
    success "Tunnel erstellt"
else
    error "Tunnel-Erstellung fehlgeschlagen!"
    exit 1
fi

# Tunnel-ID abrufen
TUNNEL_ID=$(cloudflared tunnel list | grep $TUNNEL_NAME | awk '{print $1}')

if [ -z "$TUNNEL_ID" ]; then
    error "Tunnel-ID konnte nicht ermittelt werden!"
    echo ""
    echo -e "${YELLOW}Verfügbare Tunnel:${NC}"
    cloudflared tunnel list
    echo ""
    exit 1
fi

success "Tunnel-ID: $TUNNEL_ID"

################################################################################
# 6. Tunnel-Konfiguration erstellen
################################################################################

echo ""
info "Erstelle Tunnel-Konfiguration..."

# Domain abfragen (wurde bereits in Modul 02 gesetzt, aber sicherheitshalber)
if [ -z "$DOMAIN" ]; then
    DOMAIN=$(ask_input "Domain für Tunnel" "fmsv.bartholmes.eu")
fi

mkdir -p ~/.cloudflared

cat > ~/.cloudflared/config.yml <<EOF
# FMSV Dingden - Cloudflare Tunnel Configuration
# Tunnel: $TUNNEL_NAME
# ID: $TUNNEL_ID

tunnel: $TUNNEL_ID
credentials-file: /root/.cloudflared/$TUNNEL_ID.json

ingress:
  # Hauptdomain
  - hostname: $DOMAIN
    service: http://localhost:80
  
  # Backend API
  - hostname: $DOMAIN
    path: /api/*
    service: http://localhost:3000
  
  # Uploads
  - hostname: $DOMAIN
    path: /uploads/*
    service: http://localhost:80
  
  # Catch-all (404)
  - service: http_status:404
EOF

success "Tunnel-Konfiguration erstellt"

################################################################################
# 7. DNS-Routing konfigurieren
################################################################################

echo ""
info "Konfiguriere DNS-Routing..."

# Versuche DNS-Route zu erstellen (kann bei bestehender Route fehlschlagen)
if cloudflared tunnel route dns -f $TUNNEL_NAME $DOMAIN 2>/dev/null; then
    success "DNS konfiguriert: $DOMAIN → Tunnel"
elif cloudflared tunnel route dns $TUNNEL_NAME $DOMAIN 2>/dev/null; then
    success "DNS konfiguriert: $DOMAIN → Tunnel"
else
    warning "DNS-Route konnte nicht automatisch erstellt werden"
    echo ""
    echo -e "${YELLOW}Manuell in Cloudflare Dashboard konfigurieren:${NC}"
    echo -e "  ${BLUE}1.${NC} Gehe zu: ${CYAN}https://dash.cloudflare.com${NC}"
    echo -e "  ${BLUE}2.${NC} Wähle deine Domain: ${CYAN}$DOMAIN${NC}"
    echo -e "  ${BLUE}3.${NC} DNS → Add Record"
    echo -e "  ${BLUE}4.${NC} Type: ${CYAN}CNAME${NC}, Name: ${CYAN}@${NC} oder ${CYAN}subdomain${NC}"
    echo -e "  ${BLUE}5.${NC} Target: ${CYAN}$TUNNEL_ID.cfargotunnel.com${NC}"
    echo ""
fi

################################################################################
# 8. Service installieren
################################################################################

echo ""
info "Installiere Cloudflare Tunnel als systemd Service..."

if cloudflared service install > /dev/null 2>&1; then
    success "Service installiert"
else
    warning "Service-Installation hatte Probleme (möglicherweise bereits installiert)"
fi

# Service aktivieren
systemctl enable cloudflared > /dev/null 2>&1
success "Auto-Start aktiviert"

################################################################################
# 9. Zusammenfassung & nächste Schritte
################################################################################

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🎉 Cloudflare Tunnel konfiguriert!${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${BLUE}►${NC} Tunnel-Name: ${GREEN}$TUNNEL_NAME${NC}"
echo -e "  ${BLUE}►${NC} Tunnel-ID: ${GREEN}$TUNNEL_ID${NC}"
echo -e "  ${BLUE}►${NC} Domain: ${GREEN}$DOMAIN${NC}"
echo -e "  ${BLUE}►${NC} Config: ${CYAN}~/.cloudflared/config.yml${NC}"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}📝 Nächste Schritte:${NC}"
echo ""
echo -e "  ${GREEN}1.${NC} Tunnel wird am Ende der Installation automatisch gestartet"
echo -e "  ${GREEN}2.${NC} Prüfe DNS-Einstellungen im Cloudflare Dashboard:"
echo -e "     ${CYAN}https://dash.cloudflare.com${NC}"
echo -e "  ${GREEN}3.${NC} Nach Installation erreichbar unter:"
echo -e "     ${CYAN}https://$DOMAIN${NC}"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

log_success "Cloudflare Tunnel configured"
log_info "Tunnel: $TUNNEL_NAME ($TUNNEL_ID), Domain: $DOMAIN"
