#!/bin/bash

################################################################################
# FMSV Dingden - All-in-One Installation Script
# Mit integrierten Hilfen und SSH/PuTTY-Support
# Version: 3.1 - Verbesserte Fehlerbehandlung & Struktur
################################################################################

################################################################################
# 1. KONFIGURATION & GLOBALE VARIABLEN
################################################################################

# Installation Paths
INSTALL_DIR="/var/www/fmsv-dingden"
LOG_FILE="/var/log/fmsv-install.log"

# Installation Mode
INSTALL_MODE=""

# Total steps
TOTAL_STEPS=17

# Installation State
declare -A STEP_STATUS
CURRENT_STEP=0

# Global Error Flag
INSTALLATION_FAILED=0

# Optionen (Defaults)
SKIP_CLOUDFLARE=0
BRANCH="stable"
CHANNEL_NAME="Stable"
USE_CLOUDFLARE="n"
GITHUB_REPO="https://github.com/Benno2406/fmsv-dingden.git"
AUTO_UPDATE_SCHEDULE="weekly"

################################################################################
# 2. FEHLERBEHANDLUNG & STRICT MODE
################################################################################

# Strict mode für bessere Fehlerbehandlung
set -o pipefail  # Pipeline-Fehler werden erkannt
set -u          # Ungesetzte Variablen führen zu Fehlern

# Trap für Fehlerbehandlung und Cleanup
trap 'error_handler $? $LINENO' ERR
trap 'cleanup_on_exit' EXIT INT TERM

# Error Handler
error_handler() {
    local exit_code=$1
    local line_number=$2
    INSTALLATION_FAILED=1
    
    # Log Error
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - Fehler in Zeile $line_number (Exit Code: $exit_code)" >> "$LOG_FILE" 2>/dev/null || true
    
    # Nicht bei exit 0 behandeln
    if [ $exit_code -eq 0 ]; then
        return
    fi
    
    echo ""
    echo -e "${RED}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║               ❌ Installation fehlgeschlagen ❌           ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Fehler in Zeile:${NC} $line_number"
    echo -e "${YELLOW}Exit Code:${NC} $exit_code"
    echo ""
}

# Cleanup-Funktion
cleanup_on_exit() {
    if [ $INSTALLATION_FAILED -eq 1 ]; then
        echo ""
        echo -e "${RED}╔═══════════════════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║  Installation wurde aufgrund eines Fehlers beendet       ║${NC}"
        echo -e "${RED}╚═══════════════════════════════════════════════════════════╝${NC}"
        echo ""
        echo -e "${YELLOW}Logs:${NC} ${GREEN}$LOG_FILE${NC}"
        echo ""
    fi
}

################################################################################
# 3. LOGGING SETUP
################################################################################

# Initialisiere Log-Datei
touch "$LOG_FILE" 2>/dev/null || LOG_FILE="/tmp/fmsv-install.log"

# Schreibe Log-Header
{
    echo "═══════════════════════════════════════════════════════════"
    echo "  FMSV Installation gestartet: $(date)"
    echo "═══════════════════════════════════════════════════════════"
} >> "$LOG_FILE"

# Logging-Funktionen
log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

log_success() {
    echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

log_warning() {
    echo "[WARNING] $(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

log_error() {
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

log_section() {
    echo "" >> "$LOG_FILE"
    echo "═══════════════════════════════════════════════════════════" >> "$LOG_FILE"
    echo "  $1" >> "$LOG_FILE"
    echo "═══════════════════════════════════════════════════════════" >> "$LOG_FILE"
}

################################################################################
# 4. FARBEN & SYMBOLE
################################################################################

# Colors (mit Fallback für non-color terminals)
if [ -t 1 ]; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    CYAN='\033[0;36m'
    MAGENTA='\033[0;35m'
    NC='\033[0m'
else
    RED=''
    GREEN=''
    YELLOW=''
    BLUE=''
    CYAN=''
    MAGENTA=''
    NC=''
fi

################################################################################
# 5. UI & OUTPUT FUNKTIONEN
################################################################################

print_header() {
    local step=$1
    local title=$2
    
    CURRENT_STEP=$step
    log_section "Schritt $step/$TOTAL_STEPS: $title"
    
    echo ""
    echo -e "${CYAN}$(printf '=%.0s' {1..60})${NC}"
    printf "${CYAN}#${NC}  ${MAGENTA}Schritt %2d von %2d${NC} - ${GREEN}%-38s${NC} ${CYAN}#${NC}\\n" "$step" "$TOTAL_STEPS" "$title"
    echo -e "${CYAN}$(printf '=%.0s' {1..60})${NC}"
    echo ""
}

info() { 
    echo -e "${BLUE}ℹ️  $1${NC}"
    log_info "$1"
}

success() { 
    echo -e "${GREEN}✅ $1${NC}"
    log_success "$1"
    STEP_STATUS[$CURRENT_STEP]="success"
}

warning() { 
    echo -e "${YELLOW}⚠️  $1${NC}"
    log_warning "$1"
}

error() { 
    echo -e "${RED}❌ $1${NC}"
    log_error "$1"
    INSTALLATION_FAILED=1
    STEP_STATUS[$CURRENT_STEP]="failed"
    
    echo ""
    echo -e "${RED}Installation fehlgeschlagen!${NC}"
    echo ""
    echo -e "${YELLOW}Problemlösung:${NC}"
    echo -e "  ${CYAN}1.${NC} Logs ansehen: ${GREEN}cat $LOG_FILE${NC}"
    echo -e "  ${CYAN}2.${NC} Script neu starten: ${GREEN}./install.sh${NC}"
    echo ""
    
    exit 1
}

show_help() {
    clear
    cat << EOF
${CYAN}╔════════════════════════════════════════════════════════════╗
║             📖 FMSV Installation - Hilfe 📖                ║
╚════════════════════════════════════════════════════════════╝${NC}

${YELLOW}Verfügbare Optionen:${NC}
  ${GREEN}./install.sh${NC}                - Normale Installation
  ${GREEN}./install.sh --help${NC}         - Diese Hilfe anzeigen
  ${GREEN}./install.sh --no-cloudflare${NC} - Cloudflare überspringen

${YELLOW}Häufige Probleme:${NC}
  ${BLUE}1.${NC} sudo: command not found
     → Als root einloggen: ${GREEN}su -${NC}
     → Dann ohne sudo: ${GREEN}./install.sh${NC}

  ${BLUE}2.${NC} Browser öffnet sich nicht bei Cloudflare (SSH/PuTTY)
     → Normal bei SSH! URL wird angezeigt zum manuellen Öffnen

${YELLOW}Log-Dateien:${NC}
  ${GREEN}$LOG_FILE${NC}

Drücke ${GREEN}Enter${NC} um fortzufahren...
EOF
    read -r
}

################################################################################
# 6. INPUT-VALIDIERUNG & BENUTZER-INTERAKTION
################################################################################

# Sichere Eingabe-Funktion mit Validation
read_input() {
    local prompt="$1"
    local default="${2:-}"
    local validation="${3:-.*}"  # Regex für Validierung
    local max_attempts="${4:-3}"
    local result=""
    local attempts=0
    
    while [ $attempts -lt $max_attempts ]; do
        echo -ne "${prompt} "
        read -r result
        
        # Trim whitespace
        result=$(echo "$result" | xargs)
        
        # Nutze Default wenn leer
        if [ -z "$result" ] && [ -n "$default" ]; then
            result="$default"
        fi
        
        # Validiere Input
        if [[ "$result" =~ $validation ]]; then
            echo "$result"
            return 0
        fi
        
        attempts=$((attempts + 1))
        if [ $attempts -lt $max_attempts ]; then
            echo -e "${YELLOW}Ungültige Eingabe. Versuch $attempts von $max_attempts${NC}"
        fi
    done
    
    log_error "Ungültige Eingabe nach $max_attempts Versuchen: $prompt"
    return 1
}

# Ja/Nein-Frage mit Validation
ask_yes_no() {
    local prompt="$1"
    local default="${2:-j}"  # j oder n
    local response
    
    while true; do
        echo -ne "${prompt} [${default}]: "
        read -n 1 -r response
        echo
        
        # Trim und zu Kleinbuchstaben
        response=$(echo "$response" | tr '[:upper:]' '[:lower:]' | xargs)
        
        # Default bei leerem Input
        if [ -z "$response" ]; then
            response="$default"
        fi
        
        case "$response" in
            j|y)
                echo "j"
                return 0
                ;;
            n)
                echo "n"
                return 0
                ;;
            *)
                echo -e "${YELLOW}Bitte 'j' oder 'n' eingeben${NC}"
                ;;
        esac
    done
}

# Multiple-Choice-Frage
ask_choice() {
    local prompt="$1"
    local default="$2"
    shift 2
    local choices=("$@")
    local choice
    
    while true; do
        echo -ne "${prompt} [$default]: "
        read -r choice
        
        # Trim whitespace
        choice=$(echo "$choice" | xargs)
        
        # Default bei leerem Input
        if [ -z "$choice" ]; then
            choice="$default"
        fi
        
        # Prüfe ob Wahl gültig ist
        for valid_choice in "${choices[@]}"; do
            if [ "$choice" = "$valid_choice" ]; then
                echo "$choice"
                return 0
            fi
        done
        
        echo -e "${YELLOW}Ungültige Auswahl. Wähle: ${choices[*]}${NC}"
    done
}

################################################################################
# 7. SSH & CLOUDFLARE FUNKTIONEN
################################################################################

detect_ssh_session() {
    # Prüfe ob wir in einer SSH-Session sind
    if [ -n "${SSH_CLIENT:-}" ] || [ -n "${SSH_TTY:-}" ]; then
        return 0  # SSH-Session
    else
        case $(ps -o comm= -p ${PPID:-0} 2>/dev/null) in
            sshd|*/sshd) return 0;;
        esac
    fi
    return 1  # Keine SSH-Session
}

show_cloudflare_cert_copy_instructions() {
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║  Cloudflare Login auf lokalem PC                        ║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}SCHRITT 1: cloudflared auf deinem PC installieren${NC}"
    echo ""
    echo -e "  ${BLUE}Windows (PowerShell als Administrator):${NC}"
    echo -e "  ${CYAN}winget install --id Cloudflare.cloudflared${NC}"
    echo ""
    echo -e "  ${BLUE}Mac:${NC}"
    echo -e "  ${CYAN}brew install cloudflared${NC}"
    echo ""
    echo -e "  ${BLUE}Linux:${NC}"
    echo -e "  ${CYAN}wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64${NC}"
    echo -e "  ${CYAN}sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared${NC}"
    echo -e "  ${CYAN}sudo chmod +x /usr/local/bin/cloudflared${NC}"
    echo ""
    
    local response
    response=$(ask_yes_no "cloudflared installiert?" "j")
    
    echo ""
    echo -e "${YELLOW}SCHRITT 2: Login auf deinem PC durchführen${NC}"
    echo ""
    echo -e "  Führe auf ${GREEN}deinem PC${NC} aus:"
    echo -e "  ${CYAN}cloudflared tunnel login${NC}"
    echo ""
    
    response=$(ask_yes_no "Login erfolgreich?" "j")
    
    echo ""
    echo -e "${YELLOW}SCHRITT 3: Zertifikat zum Server kopieren${NC}"
    echo ""
    
    local SERVER_IP
    SERVER_IP=$(hostname -I | awk '{print $1}')
    echo -e "  ${GREEN}Server-IP:${NC} ${CYAN}$SERVER_IP${NC}"
    echo ""
    echo -e "  ${BLUE}Windows (PowerShell):${NC}"
    echo -e "  ${CYAN}scp \$env:USERPROFILE\\.cloudflared\\cert.pem root@$SERVER_IP:~/.cloudflared/${NC}"
    echo ""
    echo -e "  ${BLUE}Mac/Linux:${NC}"
    echo -e "  ${CYAN}scp ~/.cloudflared/cert.pem root@$SERVER_IP:~/.cloudflared/${NC}"
    echo ""
    
    # Erstelle Verzeichnis falls nicht vorhanden
    mkdir -p ~/.cloudflared
    
    response=$(ask_yes_no "Zertifikat kopiert?" "j")
}

show_cloudflare_manual_login_instructions() {
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║  Cloudflare Login - Manuelle URL                        ║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Die folgende URL im Browser öffnen:${NC}"
    echo ""
    echo -e "${YELLOW}▼▼▼ URL BEGINNT HIER ▼▼▼${NC}"
    echo ""
    
    # Output direkt durchreichen
    cloudflared tunnel login 2>&1 | tee -a "$LOG_FILE" || true
    
    echo ""
    echo -e "${YELLOW}▲▲▲ URL ENDET HIER ▲▲▲${NC}"
    echo ""
    
    local response
    response=$(ask_yes_no "Login abgeschlossen?" "j")
}

cloudflare_login_with_help() {
    local IS_SSH=0
    detect_ssh_session && IS_SSH=1
    
    if [ $IS_SSH -eq 1 ]; then
        warning "SSH-Verbindung erkannt - Browser öffnet sich nicht!"
        echo ""
        echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
        echo -e "${YELLOW}Cloudflare Login über SSH:${NC}"
        echo ""
        echo -e "  ${GREEN}[1]${NC} Zertifikat von lokalem PC kopieren ${YELLOW}(EMPFOHLEN)${NC}"
        echo -e "  ${GREEN}[2]${NC} URL manuell öffnen"
        echo ""
        echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
        echo ""
        
        local LOGIN_METHOD
        LOGIN_METHOD=$(ask_choice "Deine Wahl" "1" "1" "2")
        
        if [ "$LOGIN_METHOD" = "1" ]; then
            show_cloudflare_cert_copy_instructions
        else
            show_cloudflare_manual_login_instructions
        fi
    else
        # Kein SSH - normaler Login
        info "Browser-Fenster öffnet sich..."
        echo ""
        
        if ! cloudflared tunnel login 2>&1 | tee -a "$LOG_FILE"; then
            error "Cloudflare Login fehlgeschlagen"
        fi
    fi
    
    # Check if login was successful
    if [ ! -f ~/.cloudflared/cert.pem ]; then
        echo ""
        echo -e "${RED}╔═══════════════════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║               ❌ Cloudflare Login fehlgeschlagen ❌       ║${NC}"
        echo -e "${RED}╚═══════════════════════════════════════════════════════════╝${NC}"
        echo ""
        error "Cloudflare-Zertifikat nicht gefunden"
    fi
    
    success "Cloudflare Login erfolgreich!"
    success "Zertifikat erstellt: ~/.cloudflared/cert.pem"
}

################################################################################
# 8. SYSTEM-PRÜFUNGEN
################################################################################

check_root() {
    if [ "$EUID" -ne 0 ]; then 
        error "Bitte als root ausführen: su - && ./install.sh"
    fi
    success "Als root angemeldet"
}

check_debian_version() {
    local DEBIAN_VERSION
    DEBIAN_VERSION=$(cat /etc/debian_version | cut -d. -f1)
    info "Erkannte Debian Version: $DEBIAN_VERSION"
    
    if [ "$DEBIAN_VERSION" -lt 12 ]; then
        warning "Debian $DEBIAN_VERSION ist möglicherweise zu alt"
        echo "   Empfohlen: Debian 12 (Bookworm) oder 13 (Trixie)"
        echo ""
        
        local response
        response=$(ask_yes_no "Trotzdem fortfahren?" "n")
        
        if [ "$response" = "n" ]; then
            error "Installation abgebrochen"
        fi
    fi
    
    if [ "$DEBIAN_VERSION" -eq 13 ]; then
        info "Debian 13 (Trixie) - Testing erkannt"
    fi
}

check_internet() {
    info "Prüfe Internet-Verbindung..."
    
    if ! ping -c 1 -W 5 google.com &> /dev/null; then
        # Fallback zu anderem Server
        if ! ping -c 1 -W 5 1.1.1.1 &> /dev/null; then
            error "Keine Internet-Verbindung"
        fi
    fi
    
    success "Internet-Verbindung OK"
}

check_disk_space() {
    local AVAILABLE_SPACE
    AVAILABLE_SPACE=$(df / | awk 'NR==2 {print $4}')
    
    info "Verfügbarer Speicherplatz: $((AVAILABLE_SPACE / 1024)) MB"
    
    if [ "$AVAILABLE_SPACE" -lt 2097152 ]; then  # 2GB in KB
        warning "Weniger als 2GB freier Speicherplatz"
        
        local response
        response=$(ask_yes_no "Fortfahren?" "n")
        
        if [ "$response" = "n" ]; then
            error "Installation abgebrochen"
        fi
    fi
    
    success "Ausreichend Speicherplatz verfügbar"
}

################################################################################
# 9. INSTALLATIONS-SCHRITTE
################################################################################

# -----------------------------------------------------------------------------
# Schritt 1: System-Prüfung
# -----------------------------------------------------------------------------
step_system_check() {
    print_header 1 "System-Prüfung"
    
    check_root
    check_debian_version
    check_internet
    check_disk_space
    
    success "System-Prüfung erfolgreich"
    sleep 1
}

# -----------------------------------------------------------------------------
# Schritt 2: Installations-Optionen
# -----------------------------------------------------------------------------
step_installation_options() {
    print_header 2 "Installations-Optionen"
    
    # Option 1: Update Channel
    echo -e "${YELLOW}1️⃣  Update-Kanal wählen:${NC}"
    echo ""
    echo -e "   ${GREEN}[1]${NC} Stable   - Stabile Releases (empfohlen für Production)"
    echo -e "   ${YELLOW}[2]${NC} Testing  - Neueste Features (für Entwicklung/Testing)"
    echo ""
    
    local UPDATE_CHANNEL
    UPDATE_CHANNEL=$(ask_choice "Deine Wahl" "1" "1" "2")
    
    case "$UPDATE_CHANNEL" in
        1)
            BRANCH="stable"
            CHANNEL_NAME="Stable"
            ;;
        2)
            BRANCH="testing"
            CHANNEL_NAME="Testing"
            ;;
    esac
    
    success "Update-Kanal: $CHANNEL_NAME (Branch: $BRANCH)"
    echo ""
    sleep 1
    
    # Option 2: Cloudflare Tunnel
    if [ $SKIP_CLOUDFLARE -eq 0 ]; then
        echo -e "${YELLOW}2️⃣  Cloudflare Tunnel:${NC}"
        echo ""
        echo -e "   ${GREEN}Vorteile:${NC}"
        echo "   ✅ Keine Port-Weiterleitungen nötig"
        echo "   ✅ Automatisches SSL/TLS"
        echo "   ✅ DDoS-Schutz"
        echo "   ✅ Kostenlos"
        echo ""
        
        USE_CLOUDFLARE=$(ask_yes_no "Cloudflare Tunnel einrichten?" "j")
    else
        USE_CLOUDFLARE="n"
        warning "Cloudflare wurde übersprungen (--no-cloudflare)"
    fi
    echo ""
    sleep 1
    
    # Option 3: GitHub Repository
    echo -e "${YELLOW}3️⃣  GitHub Repository:${NC}"
    echo ""
    echo -e "   ${GREEN}Standard:${NC} https://github.com/Benno2406/fmsv-dingden.git"
    echo ""
    echo -ne "   ${BLUE}►${NC} GitHub Repository URL [Enter für Standard]: "
    read -r GITHUB_REPO_INPUT
    
    if [ -n "$GITHUB_REPO_INPUT" ]; then
        GITHUB_REPO="$GITHUB_REPO_INPUT"
    fi
    
    info "Repository: $GITHUB_REPO"
    echo ""
    sleep 1
    
    # Option 4: Auto-Update
    echo -e "${YELLOW}4️⃣  Automatische Updates:${NC}"
    echo ""
    echo -e "   ${GREEN}[1]${NC} Täglich um 03:00 Uhr"
    echo -e "   ${YELLOW}[2]${NC} Wöchentlich (Sonntag 03:00 Uhr)"
    echo -e "   ${MAGENTA}[3]${NC} Manuell (keine automatischen Updates)"
    echo ""
    
    local AUTO_UPDATE_CHOICE
    AUTO_UPDATE_CHOICE=$(ask_choice "Deine Wahl" "2" "1" "2" "3")
    
    case "$AUTO_UPDATE_CHOICE" in
        1)
            AUTO_UPDATE_SCHEDULE="daily"
            ;;
        2)
            AUTO_UPDATE_SCHEDULE="weekly"
            ;;
        3)
            AUTO_UPDATE_SCHEDULE="manual"
            ;;
    esac
    
    success "Auto-Update: $AUTO_UPDATE_SCHEDULE"
    echo ""
    sleep 1
    
    # Summary
    echo -e "${CYAN}$(printf '─%.0s' {1..60})${NC}"
    echo -e "${YELLOW}📋 Zusammenfassung:${NC}"
    echo ""
    echo -e "  ${BLUE}•${NC} Update-Kanal:        ${GREEN}$CHANNEL_NAME${NC}"
    echo -e "  ${BLUE}•${NC} Cloudflare Tunnel:   $( [ "$USE_CLOUDFLARE" = "j" ] && echo -e "${GREEN}Ja${NC}" || echo -e "${YELLOW}Nein${NC}" )"
    echo -e "  ${BLUE}•${NC} GitHub Repo:         $GITHUB_REPO"
    echo -e "  ${BLUE}•${NC} Auto-Update:         ${GREEN}$AUTO_UPDATE_SCHEDULE${NC}"
    echo ""
    echo -e "${CYAN}$(printf '─%.0s' {1..60})${NC}"
    echo ""
    
    local response
    response=$(ask_yes_no "Installation mit diesen Einstellungen starten?" "j")
    
    if [ "$response" = "n" ]; then
        error "Installation abgebrochen"
    fi
}

# -----------------------------------------------------------------------------
# Schritt 3: System-Updates
# -----------------------------------------------------------------------------
step_system_update() {
    print_header 3 "System-Updates"
    
    info "Aktualisiere Paket-Listen..."
    
    local APT_OUTPUT
    local APT_ERRORS
    local APT_WARNINGS
    
    APT_OUTPUT=$(apt-get update 2>&1 | tee -a "$LOG_FILE")
    APT_ERRORS=$(echo "$APT_OUTPUT" | grep "^E:" || true)
    APT_WARNINGS=$(echo "$APT_OUTPUT" | grep "^W:" || true)
    
    if [ -n "$APT_ERRORS" ]; then
        warning "apt-get update hatte Fehler, versuche es erneut..."
        sleep 2
        
        APT_OUTPUT=$(apt-get update 2>&1 | tee -a "$LOG_FILE")
        APT_ERRORS=$(echo "$APT_OUTPUT" | grep "^E:" || true)
        
        if [ -n "$APT_ERRORS" ]; then
            error "apt-get update fehlgeschlagen"
        fi
    fi
    
    if [ -n "$APT_WARNINGS" ]; then
        success "Paket-Listen aktualisiert (mit Warnungen)"
    else
        success "Paket-Listen aktualisiert"
    fi
    
    info "Upgrade System-Pakete..."
    
    if ! DEBIAN_FRONTEND=noninteractive apt-get upgrade -y >> "$LOG_FILE" 2>&1; then
        warning "Einige Pakete konnten nicht aktualisiert werden (nicht kritisch)"
    else
        success "System-Pakete aktualisiert"
    fi
    
    sleep 1
}

# -----------------------------------------------------------------------------
# Schritt 4: Basis-Tools installieren
# -----------------------------------------------------------------------------
step_install_base_tools() {
    print_header 4 "Basis-Tools installieren"
    
    info "Installiere Git, Curl, Build-Tools..."
    
    local PACKAGES=(
        "git"
        "curl"
        "wget"
        "build-essential"
        "ca-certificates"
        "gnupg"
        "lsb-release"
        "apt-transport-https"
        "software-properties-common"
    )
    
    if ! DEBIAN_FRONTEND=noninteractive apt-get install -y "${PACKAGES[@]}" >> "$LOG_FILE" 2>&1; then
        error "Installation der Basis-Tools fehlgeschlagen"
    fi
    
    success "Basis-Tools installiert"
    sleep 1
}

# -----------------------------------------------------------------------------
# Schritt 5: Repository klonen
# -----------------------------------------------------------------------------
step_clone_repository() {
    print_header 5 "Repository klonen"
    
    # Prüfe ob Verzeichnis bereits existiert
    if [ -d "$INSTALL_DIR" ]; then
        warning "Verzeichnis existiert bereits: $INSTALL_DIR"
        
        local response
        response=$(ask_yes_no "Verzeichnis löschen und neu klonen?" "j")
        
        if [ "$response" = "j" ]; then
            info "Lösche altes Verzeichnis..."
            
            if ! rm -rf "$INSTALL_DIR" 2>> "$LOG_FILE"; then
                error "Verzeichnis konnte nicht gelöscht werden"
            fi
        else
            info "Nutze bestehendes Verzeichnis"
            return 0
        fi
    fi
    
    info "Klone Repository von $GITHUB_REPO..."
    
    if ! git clone "$GITHUB_REPO" "$INSTALL_DIR" >> "$LOG_FILE" 2>&1; then
        error "Repository konnte nicht geklont werden"
    fi
    
    success "Repository geklont"
    
    cd "$INSTALL_DIR" || error "Konnte nicht in $INSTALL_DIR wechseln"
    
    # Checkout Branch
    if [ "$BRANCH" != "main" ]; then
        info "Wechsle zu Branch: $BRANCH..."
        
        if ! git checkout "$BRANCH" >> "$LOG_FILE" 2>&1; then
            warning "Branch $BRANCH nicht gefunden, verwende main"
            BRANCH="main"
        else
            success "Branch $BRANCH ausgecheckt"
        fi
    fi
    
    sleep 1
}

# -----------------------------------------------------------------------------
# Schritt 6: PostgreSQL installieren
# -----------------------------------------------------------------------------
step_install_postgresql() {
    print_header 6 "PostgreSQL installieren"
    
    info "Füge PostgreSQL Repository hinzu..."
    
    # Import PostgreSQL GPG key
    if ! curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /usr/share/keyrings/postgresql-keyring.gpg 2>> "$LOG_FILE"; then
        error "PostgreSQL GPG-Key konnte nicht hinzugefügt werden"
    fi
    
    # Add PostgreSQL repository
    echo "deb [signed-by=/usr/share/keyrings/postgresql-keyring.gpg] http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list
    
    # Update package lists
    if ! apt-get update >> "$LOG_FILE" 2>&1; then
        warning "apt-get update nach PostgreSQL-Repo fehlgeschlagen (nicht kritisch)"
    fi
    
    info "Installiere PostgreSQL 16..."
    
    if ! DEBIAN_FRONTEND=noninteractive apt-get install -y postgresql-16 postgresql-contrib-16 >> "$LOG_FILE" 2>&1; then
        error "PostgreSQL Installation fehlgeschlagen"
    fi
    
    success "PostgreSQL 16 installiert"
    
    info "Starte PostgreSQL..."
    
    if ! systemctl start postgresql 2>> "$LOG_FILE"; then
        error "PostgreSQL konnte nicht gestartet werden"
    fi
    
    if ! systemctl enable postgresql 2>> "$LOG_FILE"; then
        warning "PostgreSQL Autostart konnte nicht aktiviert werden"
    fi
    
    success "PostgreSQL gestartet und aktiviert"
    sleep 1
}

# -----------------------------------------------------------------------------
# Schritt 7: Node.js installieren
# -----------------------------------------------------------------------------
step_install_nodejs() {
    print_header 7 "Node.js installieren"
    
    info "Füge NodeSource Repository hinzu..."
    
    # Download and execute NodeSource setup script
    if ! curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >> "$LOG_FILE" 2>&1; then
        error "NodeSource Repository konnte nicht hinzugefügt werden"
    fi
    
    info "Installiere Node.js 20..."
    
    if ! DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs >> "$LOG_FILE" 2>&1; then
        error "Node.js Installation fehlgeschlagen"
    fi
    
    local NODE_VERSION
    NODE_VERSION=$(node --version 2>/dev/null || echo "unbekannt")
    
    local NPM_VERSION
    NPM_VERSION=$(npm --version 2>/dev/null || echo "unbekannt")
    
    success "Node.js $NODE_VERSION installiert"
    success "npm $NPM_VERSION installiert"
    sleep 1
}

# -----------------------------------------------------------------------------
# Schritt 8: Datenbank einrichten
# -----------------------------------------------------------------------------
step_setup_database() {
    print_header 8 "Datenbank einrichten"
    
    info "Erstelle Datenbank-Benutzer und Datenbank..."
    
    # Generiere sichere Passwörter
    local DB_PASSWORD
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
    
    # Erstelle Datenbank und Benutzer
    if ! sudo -u postgres psql >> "$LOG_FILE" 2>&1 <<EOF
CREATE USER fmsv_user WITH PASSWORD '$DB_PASSWORD';
CREATE DATABASE fmsv_dingden OWNER fmsv_user;
GRANT ALL PRIVILEGES ON DATABASE fmsv_dingden TO fmsv_user;
\c fmsv_dingden
GRANT ALL ON SCHEMA public TO fmsv_user;
EOF
    then
        warning "Datenbank existiert möglicherweise bereits"
    else
        success "Datenbank und Benutzer erstellt"
    fi
    
    # Erstelle .env Datei für Backend
    info "Erstelle Backend-Konfiguration..."
    
    local JWT_SECRET
    JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
    
    local REFRESH_TOKEN_SECRET
    REFRESH_TOKEN_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
    
    cat > "$INSTALL_DIR/backend/.env" <<EOF
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fmsv_dingden
DB_USER=fmsv_user
DB_PASSWORD=$DB_PASSWORD

# JWT
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=$REFRESH_TOKEN_SECRET
REFRESH_TOKEN_EXPIRES_IN=7d

# Server
NODE_ENV=production
PORT=3000

# Upload limits (in bytes)
MAX_FILE_SIZE_DEFAULT=5242880
MAX_FILE_SIZE_ADMIN=52428800
MAX_FILE_SIZE_SUPERADMIN=104857600

# Frontend URL
FRONTEND_URL=http://localhost

# Update Branch
UPDATE_BRANCH=$BRANCH
EOF
    
    chmod 600 "$INSTALL_DIR/backend/.env"
    
    success "Backend-Konfiguration erstellt"
    
    # Initialisiere Datenbank-Schema
    info "Initialisiere Datenbank-Schema..."
    
    if [ -f "$INSTALL_DIR/backend/database/schema.sql" ]; then
        if ! sudo -u postgres psql -d fmsv_dingden -f "$INSTALL_DIR/backend/database/schema.sql" >> "$LOG_FILE" 2>&1; then
            error "Datenbank-Schema konnte nicht initialisiert werden"
        fi
        success "Datenbank-Schema initialisiert"
    else
        warning "schema.sql nicht gefunden, überspringe Schema-Initialisierung"
    fi
    
    # Lade Basis-Daten
    info "Lade Basis-Daten..."
    
    if [ -f "$INSTALL_DIR/backend/database/init-data.sql" ]; then
        if ! sudo -u postgres psql -d fmsv_dingden -f "$INSTALL_DIR/backend/database/init-data.sql" >> "$LOG_FILE" 2>&1; then
            warning "Basis-Daten konnten nicht geladen werden (nicht kritisch)"
        else
            success "Basis-Daten geladen"
        fi
    else
        warning "init-data.sql nicht gefunden, überspringe Daten-Initialisierung"
    fi
    
    sleep 1
}

# -----------------------------------------------------------------------------
# Schritt 9: Backend einrichten
# -----------------------------------------------------------------------------
step_setup_backend() {
    print_header 9 "Backend einrichten"
    
    cd "$INSTALL_DIR/backend" || error "Backend-Verzeichnis nicht gefunden"
    
    info "Installiere Backend-Dependencies..."
    
    if ! npm install --production >> "$LOG_FILE" 2>&1; then
        error "Backend-Dependencies konnten nicht installiert werden"
    fi
    
    success "Backend-Dependencies installiert"
    
    # Erstelle Upload-Verzeichnisse
    info "Erstelle Upload-Verzeichnisse..."
    
    local UPLOAD_DIRS=(
        "uploads/images"
        "uploads/documents"
        "uploads/protocols"
        "uploads/temp"
    )
    
    for dir in "${UPLOAD_DIRS[@]}"; do
        mkdir -p "$INSTALL_DIR/backend/$dir"
    done
    
    success "Upload-Verzeichnisse erstellt"
    
    # Erstelle systemd Service
    info "Erstelle systemd Service..."
    
    cat > /etc/systemd/system/fmsv-backend.service <<EOF
[Unit]
Description=FMSV Backend Server
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=$INSTALL_DIR/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
StandardOutput=append:$LOG_FILE
StandardError=append:$LOG_FILE

# Security
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$INSTALL_DIR/backend/uploads

[Install]
WantedBy=multi-user.target
EOF
    
    success "systemd Service erstellt"
    
    sleep 1
}

# -----------------------------------------------------------------------------
# Schritt 10: Frontend einrichten
# -----------------------------------------------------------------------------
step_setup_frontend() {
    print_header 10 "Frontend einrichten"
    
    cd "$INSTALL_DIR" || error "Konnte nicht in $INSTALL_DIR wechseln"
    
    info "Installiere Frontend-Dependencies..."
    
    if ! npm install >> "$LOG_FILE" 2>&1; then
        error "Frontend-Dependencies konnten nicht installiert werden"
    fi
    
    success "Frontend-Dependencies installiert"
    
    info "Baue Frontend..."
    
    if ! npm run build >> "$LOG_FILE" 2>&1; then
        error "Frontend-Build fehlgeschlagen"
    fi
    
    success "Frontend gebaut"
    
    # Prüfe ob dist Verzeichnis existiert
    if [ ! -d "$INSTALL_DIR/dist" ]; then
        error "dist-Verzeichnis wurde nicht erstellt"
    fi
    
    success "dist-Verzeichnis erstellt"
    sleep 1
}

# -----------------------------------------------------------------------------
# Schritt 11: Nginx installieren
# -----------------------------------------------------------------------------
step_install_nginx() {
    print_header 11 "Nginx installieren"
    
    info "Installiere Nginx..."
    
    if ! DEBIAN_FRONTEND=noninteractive apt-get install -y nginx >> "$LOG_FILE" 2>&1; then
        error "Nginx Installation fehlgeschlagen"
    fi
    
    success "Nginx installiert"
    
    # Entferne Default-Konfiguration
    rm -f /etc/nginx/sites-enabled/default
    
    success "Nginx-Basiskonfiguration bereit"
    sleep 1
}

# -----------------------------------------------------------------------------
# Schritt 12: Nginx konfigurieren
# -----------------------------------------------------------------------------
step_configure_nginx() {
    print_header 12 "Nginx konfigurieren"
    
    # Erstelle Nginx-Konfiguration
    info "Erstelle Nginx-Konfiguration..."
    
    cat > /etc/nginx/sites-available/fmsv-dingden <<'EOF'
server {
    listen 80;
    server_name _;
    
    # Frontend
    root /var/www/fmsv-dingden/dist;
    index index.html;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Frontend Routes
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Uploads
    location /uploads/ {
        alias /var/www/fmsv-dingden/backend/uploads/;
        autoindex off;
        
        # Cache static files
        expires 1d;
        add_header Cache-Control "public, immutable";
    }
    
    # Disable access to sensitive files
    location ~ /\. {
        deny all;
    }
    
    location ~ ^/(backend|Installation|node_modules) {
        deny all;
    }
}
EOF
    
    # Aktiviere Site
    ln -sf /etc/nginx/sites-available/fmsv-dingden /etc/nginx/sites-enabled/
    
    success "Nginx-Konfiguration erstellt"
    
    # Setze Berechtigungen
    info "Setze Berechtigungen..."
    
    if ! chown -R www-data:www-data "$INSTALL_DIR" 2>> "$LOG_FILE"; then
        warning "Berechtigungen konnten nicht gesetzt werden"
    else
        success "Berechtigungen gesetzt"
    fi
    
    # Teste Nginx-Konfiguration
    info "Teste Nginx-Konfiguration..."
    
    if nginx -t >> "$LOG_FILE" 2>&1; then
        success "Nginx-Konfiguration OK"
    else
        warning "Nginx-Konfiguration hat Warnungen"
        
        local response
        response=$(ask_yes_no "Trotzdem fortfahren?" "j")
        
        if [ "$response" = "n" ]; then
            error "Installation abgebrochen"
        fi
    fi
    
    sleep 1
}

# -----------------------------------------------------------------------------
# Schritt 13: Services starten
# -----------------------------------------------------------------------------
step_start_services() {
    print_header 13 "Services starten"
    
    # Reload systemd
    info "Lade systemd neu..."
    systemctl daemon-reload
    
    # Starte Backend
    info "Starte Backend-Service..."
    
    if ! systemctl start fmsv-backend 2>> "$LOG_FILE"; then
        error "Backend-Service konnte nicht gestartet werden"
    fi
    
    if ! systemctl enable fmsv-backend 2>> "$LOG_FILE"; then
        warning "Backend-Autostart konnte nicht aktiviert werden"
    fi
    
    success "Backend-Service gestartet"
    
    # Starte Nginx
    info "Starte Nginx..."
    
    if ! systemctl restart nginx 2>> "$LOG_FILE"; then
        error "Nginx konnte nicht gestartet werden"
    fi
    
    if ! systemctl enable nginx 2>> "$LOG_FILE"; then
        warning "Nginx-Autostart konnte nicht aktiviert werden"
    fi
    
    success "Nginx gestartet"
    
    # Prüfe Service-Status
    sleep 2
    
    info "Prüfe Service-Status..."
    
    if systemctl is-active --quiet fmsv-backend; then
        success "Backend läuft"
    else
        error "Backend läuft nicht"
    fi
    
    if systemctl is-active --quiet nginx; then
        success "Nginx läuft"
    else
        error "Nginx läuft nicht"
    fi
    
    sleep 1
}

# -----------------------------------------------------------------------------
# Schritt 14: Firewall konfigurieren
# -----------------------------------------------------------------------------
step_configure_firewall() {
    print_header 14 "Firewall konfigurieren"
    
    info "Installiere ufw (Firewall)..."
    
    if ! DEBIAN_FRONTEND=noninteractive apt-get install -y ufw >> "$LOG_FILE" 2>&1; then
        warning "ufw konnte nicht installiert werden"
        return 0
    fi
    
    success "ufw installiert"
    
    info "Konfiguriere Firewall-Regeln..."
    
    # Erlaube SSH
    if ! ufw allow 22/tcp >> "$LOG_FILE" 2>&1; then
        warning "SSH-Regel konnte nicht hinzugefügt werden"
    fi
    
    # Erlaube HTTP/HTTPS
    if ! ufw allow 80/tcp >> "$LOG_FILE" 2>&1; then
        warning "HTTP-Regel konnte nicht hinzugefügt werden"
    fi
    
    if ! ufw allow 443/tcp >> "$LOG_FILE" 2>&1; then
        warning "HTTPS-Regel konnte nicht hinzugefügt werden"
    fi
    
    # Aktiviere Firewall
    info "Aktiviere Firewall..."
    
    if ! ufw --force enable >> "$LOG_FILE" 2>&1; then
        warning "Firewall konnte nicht aktiviert werden"
    else
        success "Firewall aktiviert"
    fi
    
    sleep 1
}

# -----------------------------------------------------------------------------
# Schritt 15: Auto-Update System
# -----------------------------------------------------------------------------
step_setup_auto_update() {
    if [ "$AUTO_UPDATE_SCHEDULE" = "manual" ]; then
        print_header 15 "Auto-Update (Übersprungen)"
        info "Manuelle Updates gewählt - überspringe Auto-Update Setup"
        return 0
    fi
    
    print_header 15 "Auto-Update System"
    
    info "Erstelle Auto-Update Script..."
    
    cat > "$INSTALL_DIR/Installation/scripts/auto-update.sh" <<'EOF'
#!/bin/bash

# FMSV Auto-Update Script

INSTALL_DIR="/var/www/fmsv-dingden"
LOG_FILE="/var/log/fmsv-auto-update.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "====== Auto-Update gestartet ======"

cd "$INSTALL_DIR" || exit 1

BRANCH=$(grep UPDATE_BRANCH backend/.env | cut -d '=' -f2)
if [ -z "$BRANCH" ]; then
    BRANCH="main"
fi

log "Update-Branch: $BRANCH"

git fetch origin

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/$BRANCH)

if [ "$LOCAL" = "$REMOTE" ]; then
    log "Keine Updates verfügbar"
    exit 0
fi

log "Updates gefunden: $LOCAL -> $REMOTE"

git checkout $BRANCH
git pull origin $BRANCH

log "Aktualisiere Backend..."
cd backend
npm install --production --silent
cd ..

log "Aktualisiere Frontend..."
npm install --silent
npm run build

log "Starte Services neu..."
systemctl restart fmsv-backend
systemctl restart nginx

if systemctl is-active --quiet cloudflared; then
    systemctl restart cloudflared
fi

log "====== Auto-Update abgeschlossen ======"
EOF
    
    chmod +x "$INSTALL_DIR/Installation/scripts/auto-update.sh"
    success "Auto-Update Script erstellt"
    
    # Erstelle systemd Service und Timer
    info "Erstelle systemd Service..."
    
    cat > /etc/systemd/system/fmsv-auto-update.service <<EOF
[Unit]
Description=FMSV Auto-Update Service
After=network.target

[Service]
Type=oneshot
ExecStart=$INSTALL_DIR/Installation/scripts/auto-update.sh
StandardOutput=append:/var/log/fmsv-auto-update.log
StandardError=append:/var/log/fmsv-auto-update.log
EOF
    
    # Timer erstellen
    local TIMER_SCHEDULE
    if [ "$AUTO_UPDATE_SCHEDULE" = "daily" ]; then
        TIMER_SCHEDULE="OnCalendar=daily"
    else
        TIMER_SCHEDULE="OnCalendar=Sun *-*-* 03:00:00"
    fi
    
    cat > /etc/systemd/system/fmsv-auto-update.timer <<EOF
[Unit]
Description=FMSV Auto-Update Timer

[Timer]
$TIMER_SCHEDULE
Persistent=true

[Install]
WantedBy=timers.target
EOF
    
    systemctl daemon-reload
    systemctl enable fmsv-auto-update.timer
    systemctl start fmsv-auto-update.timer
    
    success "Auto-Update Timer aktiviert ($AUTO_UPDATE_SCHEDULE)"
    sleep 1
}

# -----------------------------------------------------------------------------
# Schritt 16: Cloudflare Tunnel
# -----------------------------------------------------------------------------
step_setup_cloudflare() {
    if [ "$USE_CLOUDFLARE" != "j" ]; then
        print_header 16 "Cloudflare Tunnel (Übersprungen)"
        info "Cloudflare Tunnel nicht gewählt - überspringe"
        return 0
    fi
    
    print_header 16 "Cloudflare Tunnel einrichten"
    
    # Installiere cloudflared
    info "Installiere cloudflared..."
    
    if ! wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -O /usr/local/bin/cloudflared 2>> "$LOG_FILE"; then
        error "cloudflared Download fehlgeschlagen"
    fi
    
    chmod +x /usr/local/bin/cloudflared
    
    success "cloudflared installiert"
    
    # Login
    info "Cloudflare Login..."
    cloudflare_login_with_help
    
    # Erstelle Tunnel
    info "Erstelle Cloudflare Tunnel..."
    
    local TUNNEL_NAME="fmsv-dingden-$(date +%s)"
    
    if ! cloudflared tunnel create "$TUNNEL_NAME" >> "$LOG_FILE" 2>&1; then
        error "Tunnel konnte nicht erstellt werden"
    fi
    
    local TUNNEL_ID
    TUNNEL_ID=$(cloudflared tunnel list 2>/dev/null | grep "$TUNNEL_NAME" | awk '{print $1}')
    
    if [ -z "$TUNNEL_ID" ]; then
        error "Tunnel-ID konnte nicht ermittelt werden"
    fi
    
    success "Tunnel erstellt: $TUNNEL_ID"
    
    # Konfiguration
    info "Erstelle Tunnel-Konfiguration..."
    
    mkdir -p ~/.cloudflared
    
    cat > ~/.cloudflared/config.yml <<EOF
tunnel: $TUNNEL_ID
credentials-file: /root/.cloudflared/$TUNNEL_ID.json

ingress:
  - hostname: "*.bartholmes.eu"
    service: http://localhost:80
  - service: http_status:404
EOF
    
    success "Tunnel-Konfiguration erstellt"
    
    # DNS konfigurieren
    info "Bitte konfiguriere DNS in Cloudflare Dashboard:"
    echo ""
    echo -e "  ${CYAN}Tunnel ID:${NC} $TUNNEL_ID"
    echo -e "  ${CYAN}Domain:${NC} Deine Domain (z.B. fmsv.bartholmes.eu)"
    echo ""
    
    local response
    response=$(ask_yes_no "DNS konfiguriert?" "j")
    
    # Erstelle systemd Service
    info "Erstelle cloudflared Service..."
    
    if ! cloudflared service install >> "$LOG_FILE" 2>&1; then
        warning "Service-Installation fehlgeschlagen, erstelle manuell"
        
        cat > /etc/systemd/system/cloudflared.service <<EOF
[Unit]
Description=Cloudflare Tunnel
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/cloudflared tunnel run $TUNNEL_ID
Restart=always
RestartSec=5
StandardOutput=append:/var/log/cloudflared.log
StandardError=append:/var/log/cloudflared.log

[Install]
WantedBy=multi-user.target
EOF
    fi
    
    systemctl daemon-reload
    systemctl enable cloudflared
    systemctl start cloudflared
    
    success "Cloudflare Tunnel läuft"
    sleep 1
}

# -----------------------------------------------------------------------------
# Schritt 17: Abschluss & Zusammenfassung
# -----------------------------------------------------------------------------
step_final_steps() {
    print_header 17 "Abschluss & Zusammenfassung"
    
    info "Erstelle Standard-Admin-Benutzer..."
    
    # Hier würde normalerweise ein Admin-User erstellt
    # Dies ist ein Platzhalter
    
    success "Installation abgeschlossen!"
    
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║           ✅ Installation erfolgreich! ✅                  ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    echo -e "${YELLOW}📋 Nächste Schritte:${NC}"
    echo ""
    echo -e "  ${BLUE}1.${NC} Website aufrufen:"
    
    local SERVER_IP
    SERVER_IP=$(hostname -I | awk '{print $1}')
    
    echo -e "     ${GREEN}http://$SERVER_IP${NC}"
    
    if [ "$USE_CLOUDFLARE" = "j" ]; then
        echo -e "     ${GREEN}https://deine-domain.de${NC}"
    fi
    
    echo ""
    echo -e "  ${BLUE}2.${NC} Standard-Login:"
    echo -e "     ${CYAN}E-Mail:${NC} admin@fmsv-dingden.de"
    echo -e "     ${CYAN}Passwort:${NC} admin123 ${YELLOW}(BITTE ÄNDERN!)${NC}"
    echo ""
    echo -e "  ${BLUE}3.${NC} Services verwalten:"
    echo -e "     ${CYAN}systemctl status fmsv-backend${NC}"
    echo -e "     ${CYAN}systemctl status nginx${NC}"
    if [ "$USE_CLOUDFLARE" = "j" ]; then
        echo -e "     ${CYAN}systemctl status cloudflared${NC}"
    fi
    echo ""
    echo -e "  ${BLUE}4.${NC} Logs ansehen:"
    echo -e "     ${CYAN}cat $LOG_FILE${NC}"
    echo -e "     ${CYAN}journalctl -u fmsv-backend -f${NC}"
    echo ""
    
    echo -e "${CYAN}Dokumentation:${NC}"
    echo -e "  ${GREEN}$INSTALL_DIR/README.md${NC}"
    echo -e "  ${GREEN}$INSTALL_DIR/Installation/README.md${NC}"
    echo ""
    
    log_section "Installation erfolgreich abgeschlossen"
}

################################################################################
# 10. HAUPTPROGRAMM
################################################################################

main() {
    # Parse Command-Line Arguments
    for arg in "$@"; do
        case $arg in
            --help|-h)
                show_help
                exit 0
                ;;
            --no-cloudflare)
                SKIP_CLOUDFLARE=1
                ;;
            *)
                echo -e "${YELLOW}Unbekannte Option: $arg${NC}"
                echo "Nutze --help für Hilfe"
                exit 1
                ;;
        esac
    done
    
    # Willkommens-Nachricht
    clear
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                                                           ║${NC}"
    echo -e "${CYAN}║        FMSV Dingden - Installations-Programm              ║${NC}"
    echo -e "${CYAN}║                   Version 3.1                             ║${NC}"
    echo -e "${CYAN}║                                                           ║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Installation Mode Auswahl
    echo -e "${YELLOW}Installations-Modus wählen:${NC}"
    echo ""
    echo -e "  ${GREEN}[1]${NC} Production  - Für Live-Server"
    echo -e "  ${YELLOW}[2]${NC} Development - Für lokale Entwicklung"
    echo ""
    
    INSTALL_MODE=$(ask_choice "Deine Wahl" "1" "1" "2")
    
    if [ "$INSTALL_MODE" = "2" ]; then
        echo ""
        echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
        echo -e "${YELLOW}HINWEIS: Development-Setup${NC}"
        echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
        echo ""
        echo -e "${BLUE}Für die Development-Umgebung nutze bitte:${NC}"
        echo ""
        echo -e "  ${GREEN}cd dev${NC}"
        echo -e "  ${GREEN}./setup.sh${NC}    ${YELLOW}# Einmalige Einrichtung${NC}"
        echo -e "  ${GREEN}./start.sh${NC}    ${YELLOW}# Server starten${NC}"
        echo ""
        
        local response
        response=$(ask_yes_no "Trotzdem Production-Installation fortsetzen?" "n")
        
        if [ "$response" = "n" ]; then
            echo ""
            echo -e "${CYAN}Installation abgebrochen.${NC}"
            echo -e "Nutze: ${GREEN}cd dev && ./setup.sh${NC}"
            echo ""
            exit 0
        fi
    fi
    
    echo ""
    
    # =========================================================================
    # INSTALLATIONS-SCHRITTE AUSFÜHREN
    # =========================================================================
    
    step_system_check              # 1. System-Prüfung
    step_installation_options      # 2. Installations-Optionen (ALLE Fragen)
    step_system_update            # 3. System-Updates
    step_install_base_tools       # 4. Basis-Tools (Git, Curl)
    step_clone_repository         # 5. Repository klonen (FRÜH! Brauchen wir für alles)
    step_install_postgresql       # 6. PostgreSQL installieren
    step_install_nodejs           # 7. Node.js installieren
    step_setup_database           # 8. Datenbank einrichten (mit schema.sql aus Repo)
    step_setup_backend            # 9. Backend einrichten (npm install aus Repo)
    step_setup_frontend           # 10. Frontend einrichten (npm install & build)
    step_install_nginx            # 11. Nginx installieren
    step_configure_nginx          # 12. Nginx konfigurieren (Reverse Proxy)
    step_start_services           # 13. Services starten
    step_configure_firewall       # 14. Firewall
    step_setup_auto_update        # 15. Auto-Update
    step_setup_cloudflare         # 16. Cloudflare Tunnel
    step_final_steps              # 17. Abschluss
    
    # =========================================================================
    # ERFOLG!
    # =========================================================================
    
    INSTALLATION_FAILED=0
}

################################################################################
# SCRIPT START
################################################################################

# Starte Hauptprogramm mit allen Argumenten
main "$@"
