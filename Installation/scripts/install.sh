#!/bin/bash

################################################################################
# FMSV Dingden - All-in-One Installation Script
# Mit integrierten Hilfen und SSH/PuTTY-Support
# Version: 2.0
################################################################################

# Exit on error disabled - we handle errors manually
# set -e

# Logging
LOG_FILE="/var/log/fmsv-install.log"
touch "$LOG_FILE" 2>/dev/null || LOG_FILE="/tmp/fmsv-install.log"
echo "=====================================" >> "$LOG_FILE"
echo "Installation gestartet: $(date)" >> "$LOG_FILE"
echo "=====================================" >> "$LOG_FILE"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Total steps
TOTAL_STEPS=14

################################################################################
# HILFE-FUNKTIONEN - Direkt im Script integriert
################################################################################

show_help() {
    clear
    cat << EOF
${CYAN}╔════════════════════════════════════════════════════════════╗
║                                                            ║
║             📖 FMSV Installation - Hilfe 📖                ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝${NC}

${YELLOW}Verfügbare Optionen:${NC}

  ${GREEN}./install.sh${NC}            - Normale Installation
  ${GREEN}./install.sh --help${NC}     - Diese Hilfe anzeigen
  ${GREEN}./install.sh --debug${NC}    - Debug-Modus (verbose logging)
  ${GREEN}./install.sh --no-cloudflare${NC}  - Cloudflare überspringen

${YELLOW}Häufige Probleme:${NC}

  ${BLUE}1. sudo: command not found${NC}
     → Als root einloggen: ${GREEN}su -${NC}
     → Dann ohne sudo: ${GREEN}./install.sh${NC}

  ${BLUE}2. Browser öffnet sich nicht (SSH/PuTTY)${NC}
     → Normal bei SSH-Verbindungen!
     → URL wird angezeigt, manuell öffnen
     → Siehe Cloudflare-Hilfe im Script

  ${BLUE}3. apt update schlägt fehl${NC}
     → Prüfen: ${GREEN}apt-get update${NC}
     → Repository-Probleme beheben
     → Dann neu versuchen

  ${BLUE}4. Git Clone Fehler${NC}
     → Repository-URL prüfen
     → Branch prüfen (main/testing)
     → Internet-Verbindung prüfen

${YELLOW}Log-Dateien:${NC}
  ${GREEN}$LOG_FILE${NC}

${YELLOW}Nach der Installation:${NC}
  Systemd Services: ${GREEN}systemctl status fmsv-backend${NC}
  Logs ansehen:     ${GREEN}journalctl -u fmsv-backend -f${NC}
  Config bearbeiten: ${GREEN}nano /var/www/fmsv-dingden/backend/.env${NC}

Drücke ${GREEN}Enter${NC} um fortzufahren...
EOF
    read
}

show_cloudflare_ssh_help() {
    cat << EOF

${YELLOW}╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║        ⚠️  SSH/PuTTY: Browser öffnet sich nicht! ⚠️           ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝${NC}

${CYAN}Das ist NORMAL bei SSH-Verbindungen!${NC}

Du hast jetzt ${GREEN}3 einfache Lösungen${NC}:

${YELLOW}┌─ Lösung 1: URL manuell öffnen (SCHNELLSTE METHODE) ─────────┐${NC}

  ${BLUE}1.${NC} Im Terminal wird eine ${GREEN}lange URL${NC} angezeigt:
     ${CYAN}https://dash.cloudflare.com/argotunnel?callback=...${NC}

  ${BLUE}2.${NC} URL ${GREEN}komplett kopieren${NC} (von https:// bis zum Ende!)
     ${YELLOW}⚠️  URL geht oft über mehrere Zeilen!${NC}

  ${BLUE}3.${NC} ${GREEN}Browser auf deinem PC${NC} öffnen

  ${BLUE}4.${NC} ${GREEN}URL einfügen${NC} und Enter drücken

  ${BLUE}5.${NC} Bei ${GREEN}Cloudflare einloggen${NC}

  ${BLUE}6.${NC} ${GREEN}Domain auswählen${NC} (z.B. bartholmes.eu)

  ${BLUE}7.${NC} ${GREEN}"Authorize"${NC} klicken

  ${BLUE}8.${NC} Zurück zum Terminal → "Successfully logged in"

${YELLOW}┌─ Lösung 2: Setup-Script nutzen (AUTOMATISCH) ───────────────┐${NC}

  ${GREEN}Strg+C${NC} drücken um diese Installation abzubrechen

  Dann:
  ${CYAN}cd /var/www/fmsv-dingden/Installation/scripts
  chmod +x cloudflare-setup-manual.sh
  ./cloudflare-setup-manual.sh${NC}

  Das Script führt dich durch den kompletten Cloudflare-Setup!

${YELLOW}┌─ Lösung 3: Token auf lokalem PC erstellen (Fortgeschritten) ┐${NC}

  1. cloudflared auf PC installieren
  2. ${CYAN}cloudflared tunnel login${NC} auf PC ausführen
  3. Dateien auf Server kopieren:
     ${CYAN}scp ~/.cloudflared/* root@SERVER:/root/.cloudflared/${NC}

${YELLOW}───────────────────────────────────────────────────────────────${NC}

${GREEN}Empfohlen: Lösung 1 (URL manuell öffnen)${NC}
${CYAN}Dauer: 2-3 Minuten${NC}

EOF
}

show_cloudflare_url_help() {
    cat << EOF

${CYAN}╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║            📋 So kopierst du die URL in PuTTY 📋              ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝${NC}

${YELLOW}Methode 1: Mit der Maus${NC}

  1. ${GREEN}Linke Maustaste${NC} am Anfang von ${CYAN}https://${NC}
  2. ${GREEN}Gedrückt halten${NC} und bis zum Ende ziehen
  3. ${GREEN}Loslassen${NC} → Automatisch kopiert!

  ${YELLOW}⚠️  Die URL ist sehr lang!${NC}
  Sie geht oft über 3-4 Zeilen.
  Bis ganz zum ${GREEN}Ende${NC} markieren!

${YELLOW}Methode 2: Mit Tastatur${NC}

  1. Mit Maus am ${CYAN}Anfang${NC} klicken
  2. ${GREEN}SHIFT${NC} gedrückt halten
  3. Mit ${GREEN}Pfeiltasten${NC} bis zum Ende
  4. ${GREEN}Rechtsklick${NC} → Kopiert

${YELLOW}In Browser einfügen:${NC}

  1. ${GREEN}Browser auf deinem PC${NC} öffnen
  2. ${GREEN}Strg+L${NC} (Adressleiste)
  3. ${GREEN}Strg+V${NC} (Einfügen)
  4. ${GREEN}Enter${NC}

${CYAN}Tipp:${NC} In PuTTY ist ${GREEN}Rechtsklick = Einfügen${NC}

EOF
}

detect_ssh_session() {
    # Prüfe ob wir in einer SSH-Session sind
    if [ -n "$SSH_CLIENT" ] || [ -n "$SSH_TTY" ]; then
        return 0  # SSH-Session
    else
        case $(ps -o comm= -p $PPID) in
            sshd|*/sshd) return 0;;
        esac
    fi
    return 1  # Keine SSH-Session
}

cloudflare_login_with_help() {
    local IS_SSH=0
    detect_ssh_session && IS_SSH=1

    if [ $IS_SSH -eq 1 ]; then
        warning "SSH-Verbindung erkannt - Browser kann sich nicht öffnen!"
        echo ""
        show_cloudflare_ssh_help
        echo ""
        warning "Bitte JETZT die Hilfe lesen!"
        echo ""
        read -p "Hast du die Anleitung gelesen? (j/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Jj]$ ]]; then
            show_cloudflare_ssh_help
            echo ""
            read -p "Drücke ${GREEN}Enter${NC} wenn du bereit bist..."
        fi
        
        echo ""
        info "Zeige jetzt die Cloudflare Login-URL..."
        echo ""
        echo -e "${YELLOW}╔═══════════════════════════════════════════════════════════╗${NC}"
        echo -e "${YELLOW}║  ${CYAN}Folgende Schritte:${NC}                                      ${YELLOW}║${NC}"
        echo -e "${YELLOW}║${NC}                                                          ${YELLOW}║${NC}"
        echo -e "${YELLOW}║${NC}  1. ${GREEN}URL komplett kopieren${NC} (siehe unten)                ${YELLOW}║${NC}"
        echo -e "${YELLOW}║${NC}  2. ${GREEN}Browser auf deinem PC öffnen${NC}                       ${YELLOW}║${NC}"
        echo -e "${YELLOW}║${NC}  3. ${GREEN}URL einfügen${NC} und Enter                             ${YELLOW}║${NC}"
        echo -e "${YELLOW}║${NC}  4. ${GREEN}Bei Cloudflare einloggen${NC}                           ${YELLOW}║${NC}"
        echo -e "${YELLOW}║${NC}  5. ${GREEN}Domain wählen${NC} → ${GREEN}"Authorize"${NC}                        ${YELLOW}║${NC}"
        echo -e "${YELLOW}║${NC}  6. Terminal wartet hier bis du fertig bist            ${YELLOW}║${NC}"
        echo -e "${YELLOW}║${NC}                                                          ${YELLOW}║${NC}"
        echo -e "${YELLOW}╚═══════════════════════════════════════════════════════════╝${NC}"
        echo ""
        read -p "Drücke ${GREEN}Enter${NC} um URL anzuzeigen..."
        echo ""
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        
        # Start cloudflared login in background and capture URL
        cloudflared tunnel login 2>&1 | while IFS= read -r line; do
            echo "$line"
            if [[ $line == *"https://dash.cloudflare.com"* ]]; then
                echo ""
                echo -e "${GREEN}☝️  Diese URL komplett kopieren (von https:// bis zum Ende!)${NC}"
                echo ""
            fi
        done &
        
        CLOUDFLARED_PID=$!
        
        # Wait for cloudflared to finish or user to abort
        wait $CLOUDFLARED_PID
        
        echo ""
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        
    else
        # Kein SSH - normaler Login
        info "Browser-Fenster öffnet sich..."
        echo ""
        cloudflared tunnel login
    fi
    
    # Check if login was successful
    if [ ! -f ~/.cloudflared/cert.pem ]; then
        echo ""
        error_with_help "Cloudflare Login fehlgeschlagen!" \
            "Mögliche Ursachen:" \
            "• URL nicht vollständig kopiert" \
            "• Nicht bei Cloudflare eingeloggt" \
            "• Falsche Domain ausgewählt" \
            "• Keine \"Authorize\" geklickt" \
            "" \
            "Lösung:" \
            "1. Installation neu starten: ./install.sh" \
            "2. Oder Setup-Script nutzen:" \
            "   cd /var/www/fmsv-dingden/Installation/scripts" \
            "   ./cloudflare-setup-manual.sh"
    fi
    
    success "Cloudflare Login erfolgreich!"
    success "Zertifikat erstellt: ~/.cloudflared/cert.pem"
}

error_with_help() {
    echo ""
    echo -e "${RED}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                    ❌ FEHLER ❌                            ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    for line in "$@"; do
        if [[ $line == "Lösung:"* ]] || [[ $line == "Mögliche Ursachen:"* ]]; then
            echo -e "${YELLOW}$line${NC}"
        elif [[ $line == "•"* ]] || [[ $line == [0-9]"."* ]]; then
            echo -e "  ${BLUE}$line${NC}"
        else
            echo -e "${RED}$line${NC}"
        fi
    done
    
    echo ""
    echo -e "${YELLOW}Logs ansehen: ${GREEN}cat $LOG_FILE${NC}"
    echo ""
    exit 1
}

################################################################################
# HELPER FUNCTIONS
################################################################################

print_header() {
    local step=$1
    local title=$2
    local width=60
    
    echo ""
    echo -e "${CYAN}$(printf '=%.0s' {1..60})${NC}"
    printf "${CYAN}#${NC}  ${MAGENTA}Schritt %2d von %2d${NC} - ${GREEN}%-38s${NC} ${CYAN}#${NC}\n" "$step" "$TOTAL_STEPS" "$title"
    echo -e "${CYAN}$(printf '=%.0s' {1..60})${NC}"
    echo ""
}

info() { 
    echo -e "${BLUE}ℹ️  $1${NC}"; 
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

success() { 
    echo -e "${GREEN}✅ $1${NC}"; 
    echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

warning() { 
    echo -e "${YELLOW}⚠️  $1${NC}"; 
    echo "[WARNING] $(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

error() { 
    echo -e "${RED}❌ $1${NC}"; 
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
    echo ""
    echo -e "${RED}Installation fehlgeschlagen!${NC}"
    echo -e "${YELLOW}Logs ansehen:${NC} cat $LOG_FILE"
    echo ""
    exit 1
}

progress() {
    local current=$1
    local total=$2
    local width=40
    local percentage=$((current * 100 / total))
    local filled=$((current * width / total))
    local empty=$((width - filled))
    
    printf "\r${BLUE}["
    printf "${GREEN}%${filled}s" | tr ' ' '▓'
    printf "${NC}%${empty}s" | tr ' ' '░'
    printf "${BLUE}]${NC} ${YELLOW}%3d%%${NC}" $percentage
}

################################################################################
# PARSE ARGUMENTS
################################################################################

DEBUG_MODE=0
SKIP_CLOUDFLARE=0

for arg in "$@"; do
    case $arg in
        --help|-h)
            show_help
            exit 0
            ;;
        --debug)
            DEBUG_MODE=1
            set -x
            ;;
        --no-cloudflare)
            SKIP_CLOUDFLARE=1
            ;;
        *)
            echo "Unbekannte Option: $arg"
            echo "Nutze --help für Hilfe"
            exit 1
            ;;
    esac
done

################################################################################
# WELCOME SCREEN
################################################################################

clear
echo -e "${CYAN}"
cat << "EOF"
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║        🛩️  FMSV Dingden - Installation  ✈️                 ║
║                                                            ║
║        Flugmodellsportverein Dingden e.V.                 ║
║        Vereinshomepage mit Mitgliederverwaltung           ║
║                                                            ║
║        Version 2.0 - Mit integrierter Hilfe               ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"
echo ""
info "Willkommen zur automatischen Installation!"
echo ""

# SSH Detection
if detect_ssh_session; then
    warning "SSH-Verbindung erkannt"
    echo ""
    echo -e "  ${YELLOW}⚠️  Bei Cloudflare-Setup kann sich kein Browser öffnen!${NC}"
    echo -e "  ${CYAN}→ Das Script zeigt dir eine URL zum manuellen Öffnen${NC}"
    echo ""
fi

sleep 2

################################################################################
# Schritt 1: System-Prüfung
################################################################################

print_header 1 "System-Prüfung"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    error_with_help "Nicht als root ausgeführt!" \
        "" \
        "Mögliche Ursachen:" \
        "• Mit normalem Benutzer angemeldet" \
        "• sudo benutzt (nicht nötig als root)" \
        "" \
        "Lösung:" \
        "1. Als root einloggen: ${GREEN}su -${NC}" \
        "2. Script ausführen: ${GREEN}./install.sh${NC}" \
        "" \
        "NICHT: ${RED}sudo ./install.sh${NC}"
fi

success "Als root angemeldet"

# Detect Debian version
DEBIAN_VERSION=$(cat /etc/debian_version | cut -d. -f1)
info "Erkannte Debian Version: $DEBIAN_VERSION"

if [ "$DEBIAN_VERSION" -lt 12 ]; then
    warning "Debian $DEBIAN_VERSION ist möglicherweise zu alt"
    echo "   Empfohlen: Debian 12 (Bookworm) oder 13 (Trixie)"
    echo ""
    read -p "   Trotzdem fortfahren? (j/n) " -n 1 -r
    echo
    [[ ! $REPLY =~ ^[Jj]$ ]] && error "Installation abgebrochen"
fi

if [ "$DEBIAN_VERSION" -eq 13 ]; then
    info "Debian 13 (Trixie) - Testing erkannt"
fi

# Check internet connection
info "Prüfe Internet-Verbindung..."
if ! ping -c 1 google.com &> /dev/null; then
    error_with_help "Keine Internet-Verbindung!" \
        "" \
        "Mögliche Ursachen:" \
        "• Netzwerk nicht verbunden" \
        "• DNS-Probleme" \
        "• Firewall blockiert" \
        "" \
        "Lösung:" \
        "1. Netzwerk prüfen: ${GREEN}ip a${NC}" \
        "2. DNS prüfen: ${GREEN}cat /etc/resolv.conf${NC}" \
        "3. Ping testen: ${GREEN}ping 8.8.8.8${NC}"
fi

success "Internet-Verbindung OK"

# Check disk space
AVAILABLE_SPACE=$(df / | awk 'NR==2 {print $4}')
if [ "$AVAILABLE_SPACE" -lt 2097152 ]; then  # 2GB in KB
    warning "Weniger als 2GB freier Speicherplatz"
    read -p "   Fortfahren? (j/n) " -n 1 -r
    echo
    [[ ! $REPLY =~ ^[Jj]$ ]] && error "Installation abgebrochen"
fi

success "System-Prüfung erfolgreich"
sleep 1

################################################################################
# Schritt 2: Installations-Optionen
################################################################################

print_header 2 "Installations-Optionen"

# Option 1: Update Channel
echo -e "${YELLOW}1️⃣  Update-Kanal wählen:${NC}"
echo ""
echo "   ${GREEN}[1]${NC} Stable   - Stabile Releases (empfohlen für Production)"
echo "   ${YELLOW}[2]${NC} Testing  - Neueste Features (für Entwicklung/Testing)"
echo ""
read -p "   ${BLUE}►${NC} Deine Wahl (1/2): " UPDATE_CHANNEL

case $UPDATE_CHANNEL in
  1)
    BRANCH="main"
    CHANNEL_NAME="Stable"
    ;;
  2)
    BRANCH="testing"
    CHANNEL_NAME="Testing"
    ;;
  *)
    error "Ungültige Auswahl"
    ;;
esac

success "Update-Kanal: $CHANNEL_NAME (Branch: $BRANCH)"
echo ""
sleep 1

# Option 2: Cloudflare Tunnel
if [ $SKIP_CLOUDFLARE -eq 0 ]; then
    echo -e "${YELLOW}2️⃣  Cloudflare Tunnel:${NC}"
    echo ""
    echo "   ${GREEN}Vorteile:${NC}"
    echo "   ✅ Keine Port-Weiterleitungen nötig"
    echo "   ✅ Automatisches SSL/TLS"
    echo "   ✅ DDoS-Schutz"
    echo "   ✅ Kostenlos"
    echo ""
    
    if detect_ssh_session; then
        echo -e "   ${YELLOW}⚠️  SSH erkannt - Browser öffnet sich nicht!${NC}"
        echo -e "   ${CYAN}→ URL wird angezeigt zum manuellen Öffnen${NC}"
        echo ""
    fi
    
    read -p "   ${BLUE}►${NC} Cloudflare Tunnel einrichten? (j/n): " -n 1 -r
    echo
    USE_CLOUDFLARE=$REPLY
else
    USE_CLOUDFLARE="n"
    warning "Cloudflare wurde übersprungen (--no-cloudflare)"
fi
echo ""
sleep 1

# Option 3: GitHub Repository
echo -e "${YELLOW}3️⃣  GitHub Repository:${NC}"
echo ""
echo "   ${GREEN}Standard:${NC} https://github.com/Benno2406/fmsv-dingden.git"
echo ""
read -p "   ${BLUE}►${NC} GitHub Repository URL [Enter für Standard]: " GITHUB_REPO
if [ -z "$GITHUB_REPO" ]; then
    GITHUB_REPO="https://github.com/Benno2406/fmsv-dingden.git"
    info "Standard-URL verwendet"
fi
echo ""
sleep 1

# Option 4: Auto-Update
echo -e "${YELLOW}4️⃣  Automatische Updates:${NC}"
echo ""
echo "   ${GREEN}[1]${NC} Täglich um 03:00 Uhr"
echo "   ${YELLOW}[2]${NC} Wöchentlich (Sonntag 03:00 Uhr)"
echo "   ${MAGENTA}[3]${NC} Manuell (keine automatischen Updates)"
echo ""
read -p "   ${BLUE}►${NC} Deine Wahl (1/2/3): " AUTO_UPDATE_CHOICE

case $AUTO_UPDATE_CHOICE in
  1) AUTO_UPDATE_SCHEDULE="daily" ;;
  2) AUTO_UPDATE_SCHEDULE="weekly" ;;
  3) AUTO_UPDATE_SCHEDULE="manual" ;;
  *) error "Ungültige Auswahl" ;;
esac

success "Auto-Update: $AUTO_UPDATE_SCHEDULE"
echo ""
sleep 1

# Summary
echo -e "${CYAN}$(printf '─%.0s' {1..60})${NC}"
echo -e "${YELLOW}📋 Zusammenfassung:${NC}"
echo ""
echo "  ${BLUE}•${NC} Update-Kanal:        ${GREEN}$CHANNEL_NAME${NC}"
echo "  ${BLUE}•${NC} Cloudflare Tunnel:   $( [[ $USE_CLOUDFLARE =~ ^[Jj]$ ]] && echo -e "${GREEN}Ja${NC}" || echo -e "${YELLOW}Nein${NC}" )"
echo "  ${BLUE}•${NC} GitHub Repo:         $GITHUB_REPO"
echo "  ${BLUE}•${NC} Auto-Update:         ${GREEN}$AUTO_UPDATE_SCHEDULE${NC}"
echo ""
echo -e "${CYAN}$(printf '─%.0s' {1..60})${NC}"
echo ""
read -p "Installation mit diesen Einstellungen starten? (j/n) " -n 1 -r
echo
[[ ! $REPLY =~ ^[Jj]$ ]] && error "Installation abgebrochen"

################################################################################
# Schritt 3: System-Updates
################################################################################

print_header 3 "System-Updates"

info "Aktualisiere Paket-Listen..."
if apt-get update -qq 2>&1 | tee -a "$LOG_FILE" > /dev/null; then
    success "Paket-Listen aktualisiert"
else
    warning "Paket-Listen konnten nicht vollständig aktualisiert werden"
    echo ""
    echo -e "${YELLOW}Häufige Ursachen:${NC}"
    echo "  • Repository nicht erreichbar"
    echo "  • GPG-Key fehlt"
    echo "  • Netzwerk-Problem"
    echo ""
    echo -e "${CYAN}Trotzdem fortfahren?${NC}"
    read -p "  (j/n) " -n 1 -r
    echo
    [[ ! $REPLY =~ ^[Jj]$ ]] && error "Installation abgebrochen"
fi

info "Installiere System-Updates..."
apt-get upgrade -y -qq 2>&1 | tee -a "$LOG_FILE" > /dev/null
success "System aktualisiert"
sleep 1

################################################################################
# Schritt 4: Basis-Tools Installation
################################################################################

print_header 4 "Basis-Tools Installation"

info "Installiere grundlegende Tools..."
PACKAGES="curl wget git nano ufw lsb-release gnupg software-properties-common"

for package in $PACKAGES; do
    echo -n "   • $package... "
    if apt-get install -y -qq "$package" 2>&1 | tee -a "$LOG_FILE" > /dev/null; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${YELLOW}übersprungen${NC}"
    fi
done

success "Basis-Tools installiert"
sleep 1

################################################################################
# Schritt 5: PostgreSQL Installation
################################################################################

print_header 5 "PostgreSQL Installation"

info "Installiere PostgreSQL..."
if apt-get install -y -qq postgresql postgresql-contrib 2>&1 | tee -a "$LOG_FILE" > /dev/null; then
    success "PostgreSQL installiert"
else
    error_with_help "PostgreSQL Installation fehlgeschlagen!" \
        "" \
        "Logs ansehen:" \
        "  ${GREEN}cat $LOG_FILE${NC}" \
        "" \
        "Mögliche Lösungen:" \
        "1. apt update ausführen" \
        "2. Repository prüfen" \
        "3. Installation neu versuchen"
fi

info "Starte PostgreSQL Service..."
systemctl start postgresql
systemctl enable postgresql > /dev/null 2>&1

PG_VERSION=$(su - postgres -c "psql --version" | grep -oP '\d+' | head -1)
success "PostgreSQL $PG_VERSION läuft"
sleep 1

################################################################################
# Schritt 6: Node.js Installation
################################################################################

print_header 6 "Node.js Installation"

info "Füge NodeSource Repository hinzu..."
if curl -fsSL https://deb.nodesource.com/setup_lts.x 2>&1 | bash - 2>&1 | tee -a "$LOG_FILE" > /dev/null; then
    success "NodeSource Repository hinzugefügt"
else
    error "NodeSource Repository konnte nicht hinzugefügt werden"
fi

info "Installiere Node.js LTS..."
if apt-get install -y -qq nodejs 2>&1 | tee -a "$LOG_FILE" > /dev/null; then
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    success "Node.js $NODE_VERSION installiert"
    success "npm $NPM_VERSION installiert"
else
    error "Node.js Installation fehlgeschlagen"
fi

sleep 1

################################################################################
# Schritt 7: Repository klonen
################################################################################

print_header 7 "Repository klonen"

INSTALL_DIR="/var/www/fmsv-dingden"

if [ -d "$INSTALL_DIR" ]; then
    warning "Verzeichnis existiert bereits: $INSTALL_DIR"
    read -p "   Neu klonen? Bestehende Daten gehen verloren! (j/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Jj]$ ]]; then
        info "Erstelle Backup..."
        mv "$INSTALL_DIR" "${INSTALL_DIR}.backup.$(date +%s)" 2>/dev/null || rm -rf "$INSTALL_DIR"
        
        info "Klone Repository (Branch: $BRANCH)..."
        if git clone -b "$BRANCH" "$GITHUB_REPO" "$INSTALL_DIR" 2>&1 | tee -a "$LOG_FILE"; then
            success "Repository geklont"
            rm -rf "${INSTALL_DIR}.backup."* 2>/dev/null
        else
            error_with_help "Repository konnte nicht geklont werden!" \
                "" \
                "Mögliche Ursachen:" \
                "• Falsche GitHub URL" \
                "• Branch '$BRANCH' existiert nicht" \
                "• Keine Internet-Verbindung" \
                "" \
                "Lösung:" \
                "1. URL prüfen: $GITHUB_REPO" \
                "2. Branch prüfen: $BRANCH" \
                "3. Erneut versuchen"
        fi
    else
        cd "$INSTALL_DIR" || error "Verzeichnis nicht gefunden"
        info "Aktualisiere Repository..."
        git fetch origin 2>&1 | tee -a "$LOG_FILE" > /dev/null
        git checkout "$BRANCH" 2>&1 | tee -a "$LOG_FILE" > /dev/null
        git pull origin "$BRANCH" 2>&1 | tee -a "$LOG_FILE" > /dev/null
        success "Repository aktualisiert"
    fi
else
    info "Klone Repository (Branch: $BRANCH)..."
    if git clone -b "$BRANCH" "$GITHUB_REPO" "$INSTALL_DIR" 2>&1 | tee -a "$LOG_FILE"; then
        success "Repository geklont"
    else
        error_with_help "Repository konnte nicht geklont werden!" \
            "" \
            "GitHub URL prüfen und erneut versuchen"
    fi
fi

cd "$INSTALL_DIR" || error "Verzeichnis nicht gefunden"
git config --local pull.rebase false 2>&1 | tee -a "$LOG_FILE" > /dev/null
git config --local --add safe.directory "$INSTALL_DIR"
success "Git konfiguriert"
sleep 1

################################################################################
# Schritt 8: Datenbank-Setup
################################################################################

print_header 8 "Datenbank-Setup"

echo -e "${YELLOW}Datenbank-Konfiguration:${NC}"
echo ""

read -p "   ${BLUE}►${NC} Datenbank-Name [fmsv_database]: " DB_NAME
DB_NAME=${DB_NAME:-fmsv_database}

read -p "   ${BLUE}►${NC} Datenbank-Benutzer [fmsv_user]: " DB_USER
DB_USER=${DB_USER:-fmsv_user}

while true; do
    read -sp "   ${BLUE}►${NC} Datenbank-Passwort: " DB_PASSWORD
    echo
    read -sp "   ${BLUE}►${NC} Passwort wiederholen: " DB_PASSWORD2
    echo
    [ "$DB_PASSWORD" = "$DB_PASSWORD2" ] && break
    warning "Passwörter stimmen nicht überein"
    echo ""
done

echo ""
info "Erstelle Datenbank '$DB_NAME'..."

su - postgres -c "psql" <<EOF > /dev/null 2>&1
DROP DATABASE IF EXISTS $DB_NAME;
DROP USER IF EXISTS $DB_USER;
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER DATABASE $DB_NAME OWNER TO $DB_USER;
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EOF

success "Datenbank '$DB_NAME' erstellt"
success "Benutzer '$DB_USER' angelegt"
sleep 1

################################################################################
# Schritt 9: Cloudflare Tunnel (Optional)
################################################################################

if [[ $USE_CLOUDFLARE =~ ^[Jj]$ ]]; then
    print_header 9 "Cloudflare Tunnel Installation"
    
    info "Füge Cloudflare GPG Key hinzu..."
    mkdir -p --mode=0755 /usr/share/keyrings
    curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | tee /usr/share/keyrings/cloudflare-main.gpg > /dev/null
    
    info "Füge Cloudflare Repository hinzu..."
    echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/cloudflared.list > /dev/null
    
    info "Aktualisiere Paket-Listen..."
    apt-get update -qq > /dev/null 2>&1
    
    info "Installiere cloudflared..."
    apt-get install -y -qq cloudflared > /dev/null 2>&1
    
    CF_VERSION=$(cloudflared --version | head -1)
    success "Cloudflared installiert: $CF_VERSION"
    
    echo ""
    echo -e "${YELLOW}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║${NC}  ${CYAN}Cloudflare Login erforderlich${NC}                        ${YELLOW}║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Call our intelligent login function
    cloudflare_login_with_help
    
    echo ""
    
    TUNNEL_NAME="fmsv-dingden"
    info "Erstelle Tunnel '$TUNNEL_NAME'..."
    
    cloudflared tunnel delete $TUNNEL_NAME 2>/dev/null || true
    cloudflared tunnel create $TUNNEL_NAME > /dev/null 2>&1
    
    TUNNEL_ID=$(cloudflared tunnel list | grep $TUNNEL_NAME | awk '{print $1}')
    
    if [ -z "$TUNNEL_ID" ]; then
        error "Tunnel-Erstellung fehlgeschlagen"
    fi
    
    success "Tunnel erstellt: $TUNNEL_ID"
    echo ""
    
    read -p "   ${BLUE}►${NC} Domain für Tunnel [fmsv.bartholmes.eu]: " DOMAIN
    DOMAIN=${DOMAIN:-fmsv.bartholmes.eu}
    
    info "Erstelle Tunnel-Konfiguration..."
    mkdir -p ~/.cloudflared
    
    cat > ~/.cloudflared/config.yml <<EOF
tunnel: $TUNNEL_ID
credentials-file: /root/.cloudflared/$TUNNEL_ID.json

ingress:
  - hostname: $DOMAIN
    service: http://localhost:80
  - hostname: $DOMAIN
    path: /api/*
    service: http://localhost:3000
  - hostname: $DOMAIN
    path: /uploads/*
    service: http://localhost:80
  - service: http_status:404
EOF
    
    success "Tunnel-Konfiguration erstellt"
    
    info "Konfiguriere DNS-Routing..."
    cloudflared tunnel route dns -f $TUNNEL_NAME $DOMAIN 2>/dev/null || true
    cloudflared tunnel route dns $TUNNEL_NAME $DOMAIN > /dev/null 2>&1
    success "DNS konfiguriert: $DOMAIN → Tunnel"
    
    info "Installiere Tunnel als Service..."
    cloudflared service install > /dev/null 2>&1
    systemctl enable cloudflared > /dev/null 2>&1
    
    success "Cloudflare Tunnel konfiguriert"
    sleep 1
else
    print_header 9 "Cloudflare Tunnel (Übersprungen)"
    info "Cloudflare Tunnel wird nicht verwendet"
    DOMAIN="fmsv.bartholmes.eu"
    sleep 1
fi

################################################################################
# Schritt 10: Nginx Installation
################################################################################

print_header 10 "Nginx Installation & Konfiguration"

info "Installiere Nginx..."
apt-get install -y -qq nginx > /dev/null 2>&1

info "Erstelle Nginx-Konfiguration..."

if [[ $USE_CLOUDFLARE =~ ^[Jj]$ ]]; then
    cat > /etc/nginx/sites-available/fmsv-dingden <<EOF
server {
    listen 80;
    server_name localhost;
    client_max_body_size 50M;
    
    root $INSTALL_DIR/dist;
    index index.html;
    
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    location /uploads/ {
        alias $INSTALL_DIR/Saves/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF
else
    cat > /etc/nginx/sites-available/fmsv-dingden <<EOF
server {
    listen 80;
    server_name _;
    client_max_body_size 50M;
    
    root $INSTALL_DIR/dist;
    index index.html;
    
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    location /uploads/ {
        alias $INSTALL_DIR/Saves/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF
fi

ln -sf /etc/nginx/sites-available/fmsv-dingden /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

info "Teste Nginx-Konfiguration..."
nginx -t > /dev/null 2>&1 || error "Nginx-Konfiguration fehlerhaft"

systemctl enable nginx > /dev/null 2>&1
success "Nginx installiert und konfiguriert"
sleep 1

################################################################################
# Schritt 11: Backend-Setup
################################################################################

print_header 11 "Backend-Setup"

cd "$INSTALL_DIR/backend"

info "Installiere Backend-Dependencies..."
npm install --production --silent > /dev/null 2>&1

success "Backend-Dependencies installiert"

info "Erstelle Backend-Konfiguration (.env)..."

JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

cat > .env <<EOF
# Server Configuration
NODE_ENV=production
PORT=3000
BASE_URL=https://${DOMAIN}

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
JWT_REFRESH_EXPIRES_IN=7d

# 2FA Configuration
TWO_FA_APP_NAME=FMSV Dingden

# Email Configuration (ANPASSEN!)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=DEIN_SENDGRID_API_KEY
EMAIL_FROM=noreply@mail.fmsv.bartholmes.eu
EMAIL_FROM_NAME=FMSV Dingden

# File Upload Configuration
MAX_FILE_SIZE_MEMBER=5242880
MAX_FILE_SIZE_ADMIN=52428800
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
BCRYPT_ROUNDS=12

# Paths
UPLOAD_PATH=../Saves
LOGS_PATH=../Logs

# GitHub Update Configuration
UPDATE_CHANNEL=$CHANNEL_NAME
UPDATE_BRANCH=$BRANCH
EOF

chmod 600 .env
success "Backend-Konfiguration erstellt"

info "Initialisiere Datenbank-Schema..."
node scripts/initDatabase.js
success "Datenbank-Schema initialisiert"

echo ""
read -p "Test-Daten einfügen? (j/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Jj]$ ]]; then
    info "Füge Test-Daten ein..."
    node scripts/seedDatabase.js
    success "Test-Daten eingefügt"
fi

info "Erstelle Backend systemd Service..."
cat > /etc/systemd/system/fmsv-backend.service <<EOF
[Unit]
Description=FMSV Dingden Backend
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=$INSTALL_DIR/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable fmsv-backend > /dev/null 2>&1
success "Backend-Service erstellt"
sleep 1

################################################################################
# Schritt 12: Frontend-Build
################################################################################

print_header 12 "Frontend-Build"

cd "$INSTALL_DIR"

info "Installiere Frontend-Dependencies..."
npm install --silent > /dev/null 2>&1
success "Frontend-Dependencies installiert"

info "Baue Frontend (dies kann einige Minuten dauern)..."
npm run build > /dev/null 2>&1
success "Frontend gebaut"

info "Setze Berechtigungen..."
chown -R www-data:www-data "$INSTALL_DIR"
success "Berechtigungen gesetzt"
sleep 1

################################################################################
# Schritt 13: Auto-Update System (Optional)
################################################################################

if [ "$AUTO_UPDATE_SCHEDULE" != "manual" ]; then
    print_header 13 "Auto-Update System"
    
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
    
    info "Erstelle systemd Service..."
    cat > /etc/systemd/system/fmsv-auto-update.service <<EOF
[Unit]
Description=FMSV Auto-Update Service
After=network.target

[Service]
Type=oneshot
ExecStart=$INSTALL_DIR/Installation/scripts/auto-update.sh
User=root
EOF
    
    if [ "$AUTO_UPDATE_SCHEDULE" = "daily" ]; then
        TIMER_SCHEDULE="*-*-* 03:00:00"
        TIMER_DESC="täglich um 03:00 Uhr"
    else
        TIMER_SCHEDULE="Sun *-*-* 03:00:00"
        TIMER_DESC="wöchentlich (Sonntag 03:00 Uhr)"
    fi
    
    info "Erstelle systemd Timer ($TIMER_DESC)..."
    cat > /etc/systemd/system/fmsv-auto-update.timer <<EOF
[Unit]
Description=FMSV Auto-Update Timer
Requires=fmsv-auto-update.service

[Timer]
OnCalendar=$TIMER_SCHEDULE
Persistent=true

[Install]
WantedBy=timers.target
EOF
    
    systemctl daemon-reload
    systemctl enable fmsv-auto-update.timer > /dev/null 2>&1
    systemctl start fmsv-auto-update.timer
    
    success "Auto-Update System konfiguriert"
    success "Zeitplan: $TIMER_DESC"
    sleep 1
else
    print_header 13 "Auto-Update System (Übersprungen)"
    info "Manuelle Updates werden verwendet"
    sleep 1
fi

################################################################################
# Schritt 14: Services starten & Finalisierung
################################################################################

print_header 14 "Services starten & Finalisierung"

info "Starte Backend..."
systemctl start fmsv-backend
sleep 2

if systemctl is-active --quiet fmsv-backend; then
    success "Backend läuft"
else
    error_with_help "Backend konnte nicht gestartet werden!" \
        "" \
        "Logs ansehen:" \
        "  ${GREEN}journalctl -u fmsv-backend -n 50${NC}" \
        "" \
        "Häufige Ursachen:" \
        "• Datenbank nicht erreichbar" \
        "• Port 3000 bereits belegt" \
        "• Fehler in .env Konfiguration"
fi

info "Starte Nginx..."
systemctl start nginx

if systemctl is-active --quiet nginx; then
    success "Nginx läuft"
else
    error "Nginx konnte nicht gestartet werden"
fi

if [[ $USE_CLOUDFLARE =~ ^[Jj]$ ]]; then
    info "Starte Cloudflare Tunnel..."
    systemctl start cloudflared
    sleep 2
    
    if systemctl is-active --quiet cloudflared; then
        success "Cloudflare Tunnel läuft"
    else
        warning "Cloudflare Tunnel konnte nicht gestartet werden"
        echo "   Logs: journalctl -u cloudflared -n 50"
    fi
fi

echo ""
success "Alle Services gestartet!"

# Configure Firewall
info "Konfiguriere Firewall..."
ufw --force enable > /dev/null 2>&1
ufw allow 22/tcp > /dev/null 2>&1

if [[ ! $USE_CLOUDFLARE =~ ^[Jj]$ ]]; then
    ufw allow 80/tcp > /dev/null 2>&1
    ufw allow 443/tcp > /dev/null 2>&1
fi

success "Firewall konfiguriert"
sleep 1

################################################################################
# FERTIG!
################################################################################

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

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📊 Installations-Zusammenfassung${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${BLUE}•${NC} Update-Kanal:      ${GREEN}$CHANNEL_NAME ($BRANCH)${NC}"
echo -e "  ${BLUE}•${NC} Cloudflare Tunnel: $( [[ $USE_CLOUDFLARE =~ ^[Jj]$ ]] && echo -e "${GREEN}Aktiviert${NC}" || echo -e "${YELLOW}Nicht aktiviert${NC}" )"
echo -e "  ${BLUE}•${NC} Domain:            ${GREEN}$DOMAIN${NC}"
echo -e "  ${BLUE}•${NC} Auto-Update:       ${GREEN}$AUTO_UPDATE_SCHEDULE${NC}"
echo -e "  ${BLUE}•${NC} Datenbank:         ${GREEN}$DB_NAME${NC}"
echo ""

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🌐 Zugriff${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${GREEN}Website:${NC}       https://$DOMAIN"
echo -e "  ${GREEN}Lokal:${NC}         http://localhost"
echo ""
echo -e "  ${YELLOW}Test-Accounts (falls aktiviert):${NC}"
echo -e "  ${BLUE}•${NC} Admin:  ${GREEN}admin@fmsv-dingden.de${NC} / ${GREEN}admin123${NC}"
echo -e "  ${BLUE}•${NC} Member: ${GREEN}member@fmsv-dingden.de${NC} / ${GREEN}member123${NC}"
echo ""
echo -e "  ${RED}⚠️  Passwörter sofort ändern!${NC}"
echo ""

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🔧 Wichtige Befehle${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${BLUE}Status prüfen:${NC}"
echo -e "    ${GREEN}systemctl status fmsv-backend${NC}"
echo -e "    ${GREEN}systemctl status nginx${NC}"
if [[ $USE_CLOUDFLARE =~ ^[Jj]$ ]]; then
echo -e "    ${GREEN}systemctl status cloudflared${NC}"
fi
echo ""
echo -e "  ${BLUE}Logs ansehen:${NC}"
echo -e "    ${GREEN}journalctl -u fmsv-backend -f${NC}"
echo -e "    ${GREEN}tail -f /var/log/fmsv-install.log${NC}"
echo ""
echo -e "  ${BLUE}Config bearbeiten:${NC}"
echo -e "    ${GREEN}nano /var/www/fmsv-dingden/backend/.env${NC}"
echo ""
echo -e "  ${BLUE}Updates:${NC}"
echo -e "    ${GREEN}cd /var/www/fmsv-dingden/Installation/scripts${NC}"
echo -e "    ${GREEN}./update.sh${NC}"
echo ""

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📝 Nächste Schritte${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${BLUE}1.${NC} ${YELLOW}SMTP konfigurieren${NC} (E-Mail-Versand)"
echo -e "     ${GREEN}nano /var/www/fmsv-dingden/backend/.env${NC}"
echo -e "     ${CYAN}→ SMTP_* Einstellungen anpassen${NC}"
echo -e "     ${GREEN}systemctl restart fmsv-backend${NC}"
echo ""
echo -e "  ${BLUE}2.${NC} ${YELLOW}Test-Account Passwörter ändern${NC}"
echo -e "     ${CYAN}→ Im Browser einloggen und ändern${NC}"
echo ""
echo -e "  ${BLUE}3.${NC} ${YELLOW}Backup einrichten${NC}"
echo -e "     ${CYAN}→ Datenbank: pg_dump${NC}"
echo -e "     ${CYAN}→ Dateien: /var/www/fmsv-dingden/Saves/${NC}"
echo ""

if [[ ! $USE_CLOUDFLARE =~ ^[Jj]$ ]]; then
echo -e "  ${BLUE}4.${NC} ${YELLOW}SSL-Zertifikat einrichten${NC}"
echo -e "     ${GREEN}apt-get install certbot python3-certbot-nginx${NC}"
echo -e "     ${GREEN}certbot --nginx -d $DOMAIN${NC}"
echo ""
fi

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}✈️  Viel Erfolg mit der FMSV Dingden Vereinshomepage! ✈️${NC}"
echo ""
echo -e "Bei Fragen oder Problemen: Logs ansehen oder Installation wiederholen"
echo ""

# Log completion
echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - Installation abgeschlossen" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"

exit 0
