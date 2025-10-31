#!/bin/bash
################################################################################
# Modul: Installations-Optionen
# Sammelt alle notwendigen Konfigurationsoptionen vom Benutzer
################################################################################

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Installations-Konfiguration${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo ""

################################################################################
# 1. Installations-Modus
################################################################################

echo -e "${YELLOW}1. Installations-Modus${NC}"
echo ""

# Frage nach Modus mit Error-Handling
while true; do
    MODE_CHOICE=$(ask_choice "Welchen Modus möchtest du installieren?" \
        "Production (empfohlen für Server)" \
        "Development (für lokale Entwicklung)")
    
    # Prüfe ob Wahl erfolgreich
    if [ $? -eq 0 ]; then
        break
    else
        warning "Bitte wähle eine gültige Option!"
        echo ""
    fi
done

case $MODE_CHOICE in
    0)
        export INSTALL_MODE="production"
        info "Production-Modus ausgewählt"
        ;;
    1)
        export INSTALL_MODE="development"
        warning "Development-Modus ausgewählt"
        echo ""
        echo -e "${YELLOW}Hinweis: Für Development gibt es ein separates Setup!${NC}"
        echo -e "  ${GREEN}cd dev && ./setup.sh${NC}"
        echo ""
        
        if ask_yes_no "Trotzdem mit Production-Installation fortfahren?" "n"; then
            export INSTALL_MODE="production"
            info "Wechsle zu Production-Modus"
        else
            info "Installation abgebrochen"
            exit 0
        fi
        ;;
    *)
        # Fallback falls irgendetwas schiefgeht
        export INSTALL_MODE="production"
        warning "Unbekannte Auswahl - verwende Production-Modus"
        ;;
esac

################################################################################
# 2. Update-Kanal
################################################################################

echo ""
echo -e "${YELLOW}2. Update-Kanal${NC}"
echo ""

# Frage nach Kanal mit Error-Handling
while true; do
    CHANNEL_CHOICE=$(ask_choice "Welchen Update-Kanal möchtest du verwenden?" \
        "Stable (empfohlen)" \
        "Testing (experimentell)")
    
    if [ $? -eq 0 ]; then
        break
    else
        warning "Bitte wähle eine gültige Option!"
        echo ""
    fi
done

case $CHANNEL_CHOICE in
    0)
        export BRANCH="main"
        export CHANNEL_NAME="Stable"
        info "Stable-Kanal ausgewählt (Branch: main)"
        ;;
    1)
        export BRANCH="testing"
        export CHANNEL_NAME="Testing"
        warning "Testing-Kanal ausgewählt (Branch: testing)"
        ;;
    *)
        # Fallback
        export BRANCH="main"
        export CHANNEL_NAME="Stable"
        warning "Unbekannte Auswahl - verwende Stable-Kanal"
        ;;
esac

################################################################################
# 3. GitHub Repository
################################################################################

echo "" >&2
echo -e "${YELLOW}3. GitHub Repository${NC}" >&2
echo "" >&2

DEFAULT_REPO="https://github.com/Benno2406/fmsv-dingden.git"
export GITHUB_REPO=$(ask_input "GitHub Repository URL" "$DEFAULT_REPO")

info "Repository: $GITHUB_REPO"

################################################################################
# 4. Cloudflare Tunnel
################################################################################

echo ""
echo -e "${YELLOW}4. Cloudflare Tunnel (Optional)${NC}"
echo ""

if ask_yes_no "Cloudflare Tunnel installieren?" "n"; then
    export USE_CLOUDFLARE="j"
    info "Cloudflare wird installiert"
else
    export USE_CLOUDFLARE="n"
    info "Cloudflare wird übersprungen"
fi

################################################################################
# 5. Domain
################################################################################

echo "" >&2
echo -e "${YELLOW}5. Domain-Konfiguration${NC}" >&2
echo "" >&2

if [[ $USE_CLOUDFLARE =~ ^[Jj]$ ]]; then
    export DOMAIN=$(ask_input "Deine Domain" "fmsv.bartholmes.eu")
else
    export DOMAIN=$(ask_input "Deine Domain (oder IP-Adresse)" "fmsv.bartholmes.eu")
fi

info "Domain: $DOMAIN"

################################################################################
# 6. pgAdmin 4
################################################################################

echo ""
echo -e "${YELLOW}6. pgAdmin 4 (Optional)${NC}"
echo ""

if ask_yes_no "pgAdmin 4 installieren?" "n"; then
    export INSTALL_PGADMIN="j"
    info "pgAdmin wird installiert"
    
    # pgAdmin Domain (optional)
    echo "" >&2
    if ask_yes_no "Separate Domain für pgAdmin?" "n"; then
        export PGADMIN_DOMAIN=$(ask_input "pgAdmin Domain" "pgadmin.$DOMAIN")
        info "pgAdmin Domain: $PGADMIN_DOMAIN"
    else
        export PGADMIN_DOMAIN=""
    fi
else
    export INSTALL_PGADMIN="n"
    export PGADMIN_DOMAIN=""
    info "pgAdmin wird übersprungen"
fi

################################################################################
# 7. Auto-Update System
################################################################################

echo ""
echo -e "${YELLOW}7. Auto-Update System (Optional)${NC}"
echo ""

# Frage nach Auto-Update mit Error-Handling
while true; do
    UPDATE_CHOICE=$(ask_choice "Auto-Update Zeitplan" \
        "Täglich (03:00 Uhr)" \
        "Wöchentlich (Sonntag 03:00 Uhr)" \
        "Manuell (keine Auto-Updates)")
    
    if [ $? -eq 0 ]; then
        break
    else
        warning "Bitte wähle eine gültige Option!"
        echo ""
    fi
done

case $UPDATE_CHOICE in
    0)
        export AUTO_UPDATE_SCHEDULE="daily"
        info "Tägliche Auto-Updates aktiviert"
        ;;
    1)
        export AUTO_UPDATE_SCHEDULE="weekly"
        info "Wöchentliche Auto-Updates aktiviert"
        ;;
    2)
        export AUTO_UPDATE_SCHEDULE="manual"
        info "Keine Auto-Updates (manuelle Updates)"
        ;;
    *)
        # Fallback
        export AUTO_UPDATE_SCHEDULE="manual"
        warning "Unbekannte Auswahl - verwende manuelle Updates"
        ;;
esac

################################################################################
# Zusammenfassung
################################################################################

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Konfigurations-Zusammenfassung${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${BLUE}•${NC} Modus:         ${GREEN}$INSTALL_MODE${NC}"
echo -e "  ${BLUE}•${NC} Update-Kanal:  ${GREEN}$CHANNEL_NAME ($BRANCH)${NC}"
echo -e "  ${BLUE}•${NC} Repository:    ${GREEN}$GITHUB_REPO${NC}"
echo -e "  ${BLUE}•${NC} Domain:        ${GREEN}$DOMAIN${NC}"
echo -e "  ${BLUE}•${NC} Cloudflare:    $(bool_to_text $USE_CLOUDFLARE)"
echo -e "  ${BLUE}•${NC} pgAdmin:       $(bool_to_text $INSTALL_PGADMIN)"
if [[ $INSTALL_PGADMIN =~ ^[Jj]$ ]] && [ -n "$PGADMIN_DOMAIN" ]; then
    echo -e "  ${BLUE}•${NC} pgAdmin URL:   ${GREEN}$PGADMIN_DOMAIN${NC}"
fi
echo -e "  ${BLUE}•${NC} Auto-Update:   ${GREEN}$AUTO_UPDATE_SCHEDULE${NC}"
echo ""

# Logging
log_info "Installation Configuration:"
log_info "  Mode: $INSTALL_MODE"
log_info "  Channel: $CHANNEL_NAME ($BRANCH)"
log_info "  Repository: $GITHUB_REPO"
log_info "  Domain: $DOMAIN"
log_info "  Cloudflare: $USE_CLOUDFLARE"
log_info "  pgAdmin: $INSTALL_PGADMIN"
log_info "  Auto-Update: $AUTO_UPDATE_SCHEDULE"

# Bestätigung
if ! ask_yes_no "Mit dieser Konfiguration fortfahren?" "y"; then
    warning "Installation abgebrochen"
    exit 0
fi

success "Konfiguration gespeichert"
