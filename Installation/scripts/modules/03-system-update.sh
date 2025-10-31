#!/bin/bash
################################################################################
# Modul: System-Updates
# Aktualisiert das System und installiert wichtige Updates
################################################################################

info "Aktualisiere Paket-Listen..."

# apt-get update mit Fehlerbehandlung
if apt-get update -qq 2>&1 | tee -a "$LOG_FILE" | grep -v "^$"; then
    success "Paket-Listen aktualisiert"
else
    warning "Paket-Listen-Update hatte Warnungen (wird trotzdem fortgesetzt)"
fi

echo ""
info "Installiere System-Updates (kann einige Minuten dauern)..."
echo ""

# apt-get upgrade mit Progress
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" 2>&1 | tee -a "$LOG_FILE" | while read line; do
    # Zeige nur wichtige Zeilen
    if echo "$line" | grep -qE "upgraded|newly installed|to remove|kept back"; then
        echo "  $line"
    fi
done

if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo ""
    success "System-Updates installiert"
else
    echo ""
    warning "Einige Updates konnten nicht installiert werden (wird fortgesetzt)"
fi

# Prüfe ob Reboot nötig ist
if [ -f /var/run/reboot-required ]; then
    echo ""
    warning "┌─────────────────────────────────────────────────────┐"
    warning "│  System-Neustart empfohlen!                        │"
    warning "└─────────────────────────────────────────────────────┘"
    echo ""
    echo -e "${YELLOW}Ein Kernel-Update erfordert einen Neustart${NC}"
    echo ""
    
    if ask_yes_no "Installation jetzt unterbrechen und neustarten?" "n"; then
        info "Installation wird unterbrochen"
        echo ""
        echo -e "${CYAN}Nach dem Neustart fortsetzen:${NC}"
        echo -e "  ${GREEN}sudo ./install-modular.sh${NC}"
        echo ""
        exit 0
    else
        info "Installation wird ohne Neustart fortgesetzt"
    fi
fi

# Alte Pakete aufräumen
info "Räume nicht mehr benötigte Pakete auf..."
apt-get autoremove -y -qq 2>&1 | tee -a "$LOG_FILE" > /dev/null
apt-get autoclean -y -qq 2>&1 | tee -a "$LOG_FILE" > /dev/null
success "Alte Pakete entfernt"

log_success "System-Updates completed"
