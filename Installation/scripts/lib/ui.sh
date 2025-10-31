#!/bin/bash
################################################################################
# UI-Helper Funktionen für Installation Scripts
################################################################################

# Farben laden falls nicht vorhanden
if [ -z "$GREEN" ]; then
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    source "$SCRIPT_DIR/colors.sh"
fi

################################################################################
# Banner & Header
################################################################################

# Haupt-Banner anzeigen
print_banner() {
    echo -e "${GREEN}"
    cat << "EOF"
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║          FMSV Dingden - Vereinshomepage                   ║
║          Installation & Setup                             ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# Version anzeigen
print_version() {
    local version="$1"
    echo -e "${CYAN}Version: ${YELLOW}$version${NC}"
    echo ""
}

# Schritt-Header
print_header() {
    local step="$1"
    local title="$2"
    local total="${3:-18}"
    
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}Schritt $step von $total:${NC} ${YELLOW}$title${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

################################################################################
# Status-Nachrichten
################################################################################

info() {
    echo -e "   ${BLUE}ℹ${NC} $*"
}

success() {
    echo -e "   ${GREEN}✓${NC} $*"
}

warning() {
    echo -e "   ${YELLOW}⚠${NC} $*"
}

error() {
    echo -e "   ${RED}✗${NC} $*"
}

debug() {
    if [ "${DEBUG:-no}" = "yes" ]; then
        echo -e "   ${DIM}${CYAN}[DEBUG]${NC}${DIM} $*${NC}"
    fi
}

################################################################################
# Fortschrittsanzeige
################################################################################

# Fortschrittsbalken
progress() {
    local current=$1
    local total=$2
    local width=50
    local percent=$((current * 100 / total))
    local filled=$((current * width / total))
    local empty=$((width - filled))
    
    printf "   ["
    printf "${GREEN}%${filled}s${NC}" | tr ' ' '█'
    printf "%${empty}s" | tr ' ' '░'
    printf "] ${YELLOW}%3d%%${NC}\r" $percent
}

# Spinner für lange Operationen
spinner() {
    local pid=$1
    local message="$2"
    local delay=0.1
    local spinstr='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
    
    echo -ne "   "
    while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
        local temp=${spinstr#?}
        printf "${CYAN}[%c]${NC} ${message}..." "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\r"
    done
    
    # Spinner löschen
    printf "   %-70s\r" " "
}

################################################################################
# Eingabe-Funktionen
################################################################################

# Ja/Nein Frage
ask_yes_no() {
    local question="$1"
    local default="${2:-n}"
    
    local prompt
    if [ "$default" = "y" ]; then
        prompt="(J/n)"
    else
        prompt="(j/N)"
    fi
    
    echo -ne "   ${BLUE}►${NC} $question $prompt: "
    read -n 1 -r
    echo
    
    if [ "$default" = "y" ]; then
        [[ ! $REPLY =~ ^[Nn]$ ]]
    else
        [[ $REPLY =~ ^[Jj]$ ]]
    fi
}

# Text-Eingabe
ask_input() {
    local question="$1"
    local default="$2"
    local secret="${3:-no}"
    
    if [ -n "$default" ]; then
        echo -ne "   ${BLUE}►${NC} $question ${DIM}[$default]${NC}: "
    else
        echo -ne "   ${BLUE}►${NC} $question: "
    fi
    
    if [ "$secret" = "yes" ]; then
        read -s REPLY
        echo
    else
        read REPLY
    fi
    
    echo "${REPLY:-$default}"
}

# Passwort-Eingabe mit Bestätigung
ask_password() {
    local question="$1"
    local min_length="${2:-8}"
    
    while true; do
        echo -ne "   ${BLUE}►${NC} $question ${DIM}(min. $min_length Zeichen)${NC}: "
        read -s PASSWORD1
        echo
        
        # Validierung: Nicht leer
        if [ -z "$PASSWORD1" ]; then
            warning "Passwort darf nicht leer sein!"
            echo ""
            continue
        fi
        
        # Validierung: Mindestlänge
        if [ ${#PASSWORD1} -lt $min_length ]; then
            warning "Passwort zu kurz! (${#PASSWORD1} Zeichen, min: $min_length)"
            echo ""
            continue
        fi
        
        # Validierung: Keine Leerzeichen
        if [[ "$PASSWORD1" =~ [[:space:]] ]]; then
            warning "Passwort darf keine Leerzeichen enthalten!"
            echo ""
            continue
        fi
        
        # Bestätigung
        echo -ne "   ${BLUE}►${NC} Passwort wiederholen: "
        read -s PASSWORD2
        echo
        
        if [ "$PASSWORD1" = "$PASSWORD2" ]; then
            success "Passwort validiert (${#PASSWORD1} Zeichen)"
            echo "$PASSWORD1"
            return 0
        fi
        
        warning "Passwörter stimmen nicht überein!"
        echo ""
    done
}

# Auswahl aus Liste
ask_choice() {
    local question="$1"
    shift
    local options=("$@")
    
    echo ""
    echo -e "   ${CYAN}$question${NC}"
    echo ""
    
    for i in "${!options[@]}"; do
        echo -e "     ${GREEN}$((i+1)).${NC} ${options[$i]}"
    done
    
    echo ""
    echo -ne "   ${BLUE}►${NC} Auswahl (1-${#options[@]}): "
    read choice
    
    if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le "${#options[@]}" ]; then
        echo $((choice-1))
        return 0
    else
        error "Ungültige Auswahl!"
        return 1
    fi
}

################################################################################
# Zusammenfassungen
################################################################################

# Boolean zu Text
bool_to_text() {
    if [[ $1 =~ ^[JjYy]$ ]]; then
        echo -e "${GREEN}Aktiviert${NC}"
    else
        echo -e "${YELLOW}Nicht aktiviert${NC}"
    fi
}

# Installations-Zusammenfassung
print_summary() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}📊 Installations-Zusammenfassung${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    for item in "$@"; do
        echo -e "  ${BLUE}•${NC} $item"
    done
    
    echo ""
}

# Zugriffs-Informationen
print_access_info() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}🌐 Zugriff${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    for url in "$@"; do
        echo -e "  ${GREEN}►${NC} $url"
    done
    
    echo ""
}

# Nächste Schritte
print_next_steps() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}📝 Nächste Schritte${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    local step=1
    for item in "$@"; do
        echo -e "  ${BLUE}$step.${NC} ${YELLOW}$item${NC}"
        ((step++))
    done
    
    echo ""
}

# Wichtige Befehle
print_important_commands() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}🔧 Wichtige Befehle${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "  ${BLUE}Status prüfen:${NC}"
    echo -e "    ${GREEN}systemctl status fmsv-backend${NC}"
    echo -e "    ${GREEN}systemctl status nginx${NC}"
    echo ""
    echo -e "  ${BLUE}Logs ansehen:${NC}"
    echo -e "    ${GREEN}journalctl -u fmsv-backend -f${NC}"
    echo -e "    ${GREEN}tail -f /var/log/fmsv-install.log${NC}"
    echo ""
    echo -e "  ${BLUE}Wartung:${NC}"
    echo -e "    ${GREEN}fmsv-update${NC}  ${CYAN}# System aktualisieren${NC}"
    echo -e "    ${GREEN}fmsv-debug${NC}   ${CYAN}# Diagnose & Reparatur${NC}"
    echo ""
}

# Erfolgs-Banner
print_success_banner() {
    clear
    echo ""
    echo -e "${GREEN}"
    cat << "EOF"
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║           🎉 Installation erfolgreich! 🎉                  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    echo ""
}

################################################################################
# Error-Anzeige
################################################################################

# Error mit Hilfe-Text
error_with_help() {
    local message="$1"
    shift
    
    echo ""
    echo -e "${RED}═══════════════════════════════════════════════════════${NC}"
    echo -e "${RED}  FEHLER: $message${NC}"
    echo -e "${RED}═══════════════════════════════════════════════════════${NC}"
    echo ""
    
    if [ $# -gt 0 ]; then
        for line in "$@"; do
            echo -e "  $line"
        done
        echo ""
    fi
}
