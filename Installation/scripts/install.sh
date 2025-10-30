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
# HILFE-FUNKTIONEN
################################################################################

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
    read
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
        warning "SSH-Verbindung erkannt - Browser öffnet sich nicht!"
        echo ""
        echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
        echo -e "${YELLOW}Wähle deine Login-Methode:${NC}"
        echo ""
        echo -e "  ${GREEN}[1]${NC} Zertifikat von lokalem PC kopieren ${YELLOW}(EMPFOHLEN)${NC}"
        echo -e "      ${CYAN}→ cloudflared auf deinem PC installieren${NC}"
        echo -e "      ${CYAN}→ Login auf PC durchführen${NC}"
        echo -e "      ${CYAN}→ Zertifikat zum Server kopieren${NC}"
        echo ""
        echo -e "  ${GREEN}[2]${NC} URL manuell öffnen"
        echo -e "      ${CYAN}→ URL aus Terminal kopieren${NC}"
        echo -e "      ${CYAN}→ Im Browser öffnen${NC}"
        echo ""
        echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
        echo ""
        echo -ne "Deine Wahl (1/2): "
        read -n 1 -r LOGIN_METHOD
        echo
        echo ""
        
        if [[ $LOGIN_METHOD == "1" ]]; then
            # METHODE 1: Zertifikat von lokalem PC kopieren
            echo -e "${CYAN}╔═══════════════════════════════════════════════════════════╗${NC}"
            echo -e "${CYAN}║  Cloudflare Login auf lokalem PC (Windows/Mac/Linux)     ║${NC}"
            echo -e "${CYAN}╚═══════════════════════════════════════════════════════════╝${NC}"
            echo ""
            echo -e "${YELLOW}SCHRITT 1: cloudflared auf deinem PC installieren${NC}"
            echo ""
            echo -e "  ${BLUE}Windows:${NC}"
            echo -e "  1. Öffne PowerShell als ${GREEN}Administrator${NC}"
            echo -e "  2. ${CYAN}winget install --id Cloudflare.cloudflared${NC}"
            echo ""
            echo -e "  ${BLUE}Mac:${NC}"
            echo -e "  ${CYAN}brew install cloudflared${NC}"
            echo ""
            echo -e "  ${BLUE}Linux:${NC}"
            echo -e "  ${CYAN}wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64${NC}"
            echo -e "  ${CYAN}sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared${NC}"
            echo -e "  ${CYAN}sudo chmod +x /usr/local/bin/cloudflared${NC}"
            echo ""
            echo -ne "Drücke ${GREEN}Enter${NC} wenn cloudflared installiert ist..."
            read
            echo ""
            
            echo -e "${YELLOW}SCHRITT 2: Login auf deinem PC durchführen${NC}"
            echo ""
            echo -e "  Führe auf ${GREEN}deinem PC${NC} im Terminal/CMD aus:"
            echo ""
            echo -e "  ${CYAN}cloudflared tunnel login${NC}"
            echo ""
            echo -e "  ${GREEN}→${NC} Browser öffnet sich automatisch"
            echo -e "  ${GREEN}→${NC} Bei Cloudflare einloggen"
            echo -e "  ${GREEN}→${NC} Domain wählen (z.B. bartholmes.eu)"
            echo -e "  ${GREEN}→${NC} ${GREEN}\"Authorize\"${NC} klicken"
            echo -e "  ${GREEN}→${NC} \"Success\" Meldung erscheint"
            echo ""
            echo -ne "Drücke ${GREEN}Enter${NC} wenn Login erfolgreich war..."
            read
            echo ""
            
            echo -e "${YELLOW}SCHRITT 3: Zertifikat-Pfad finden${NC}"
            echo ""
            echo -e "  Das Zertifikat liegt hier:"
            echo ""
            echo -e "  ${BLUE}Windows:${NC}"
            echo -e "  ${CYAN}C:\\Users\\DEIN_NAME\\.cloudflared\\cert.pem${NC}"
            echo ""
            echo -e "  ${BLUE}Mac/Linux:${NC}"
            echo -e "  ${CYAN}~/.cloudflared/cert.pem${NC}"
            echo ""
            read -p "Drücke ${GREEN}Enter${NC} um fortzufahren..."
            echo ""
            
            echo -e "${YELLOW}SCHRITT 4: Zertifikat zum Server kopieren${NC}"
            echo ""
            
            # Zeige Server-IP
            SERVER_IP=$(hostname -I | awk '{print $1}')
            echo -e "  ${GREEN}Deine Server-IP:${NC} ${CYAN}$SERVER_IP${NC}"
            echo ""
            
            echo -e "  ${GREEN}Wähle deine Methode:${NC}"
            echo ""
            echo -e "  ${BLUE}Option A: WinSCP (Windows - mit GUI)${NC} ${YELLOW}← EINFACH!${NC}"
            echo -e "  ${BLUE}Option B: SCP (Terminal/CMD)${NC}"
            echo ""
            
            echo -e "${CYAN}╔═══════════════════════════════════════════════════════════╗${NC}"
            echo -e "${CYAN}║  OPTION A: WinSCP (Windows)                              ║${NC}"
            echo -e "${CYAN}╚═══════════════════════════════════════════════════════════╝${NC}"
            echo ""
            echo -e "  ${GREEN}1.${NC} WinSCP herunterladen:"
            echo -e "     ${CYAN}https://winscp.net/eng/download.php${NC}"
            echo ""
            echo -e "  ${GREEN}2.${NC} WinSCP öffnen und verbinden:"
            echo -e "     Host:     ${CYAN}$SERVER_IP${NC}"
            echo -e "     Port:     ${CYAN}22${NC}"
            echo -e "     Benutzer: ${CYAN}root${NC}"
            echo -e "     Passwort: ${CYAN}[Dein Server-Passwort]${NC}"
            echo ""
            echo -e "  ${GREEN}3.${NC} Im WinSCP-Fenster - Ordner erstellen:"
            echo -e "     ${BLUE}Rechts${NC} (Server): ${YELLOW}Rechtsklick → \"Neues Verzeichnis\"${NC}"
            echo -e "     ${BLUE}Name:${NC}         ${CYAN}.cloudflared${NC} ${YELLOW}(MIT Punkt!)${NC}"
            echo -e "     ${BLUE}Dann:${NC}         ${CYAN}Doppelklick auf .cloudflared${NC}"
            echo ""
            echo -e "  ${GREEN}4.${NC} Zertifikat hochladen:"
            echo -e "     ${BLUE}Links${NC}  (PC):    ${CYAN}C:\\Users\\DEIN_NAME\\.cloudflared\\cert.pem${NC}"
            echo -e "     ${BLUE}Rechts${NC} (Server): ${CYAN}/root/.cloudflared/${NC} ${GREEN}(geöffnet)${NC}"
            echo -e "     ${BLUE}Upload:${NC}       ${CYAN}cert.pem${NC} von links nach rechts ziehen"
            echo ""
            echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
            echo ""
            echo -e "${CYAN}╔═══════════════════════════════════════════════════════════╗${NC}"
            echo -e "${CYAN}║  OPTION B: SCP im Terminal                               ║${NC}"
            echo -e "${CYAN}╚═══════════════════════════════════════════════════════════╝${NC}"
            echo ""
            echo -e "  ${BLUE}Windows (PowerShell):${NC}"
            echo -e "  ${CYAN}scp C:\\Users\\DEIN_NAME\\.cloudflared\\cert.pem root@$SERVER_IP:/root/.cloudflared/${NC}"
            echo ""
            echo -e "  ${BLUE}Mac/Linux:${NC}"
            echo -e "  ${CYAN}scp ~/.cloudflared/cert.pem root@$SERVER_IP:/root/.cloudflared/${NC}"
            echo ""
            echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
            echo ""
            
            # Erstelle das Zielverzeichnis
            mkdir -p ~/.cloudflared
            chmod 700 ~/.cloudflared
            
            echo -e "  ${GREEN}✅ Server-Verzeichnis erstellt: /root/.cloudflared/${NC}"
            echo -e "  ${GREEN}✅ Server ist bereit - warte auf Zertifikat...${NC}"
            echo ""
            echo -e "  ${BLUE}Tipp:${NC} In WinSCP musst du den Ordner ${CYAN}.cloudflared${NC} trotzdem"
            echo -e "        sehen können. Falls nicht: ${YELLOW}F5 drücken (aktualisieren)${NC}"
            echo -e "        oder ${YELLOW}\"Versteckte Dateien anzeigen\"${NC} aktivieren."
            echo ""
            
            # Warte bis Zertifikat existiert
            while [ ! -f ~/.cloudflared/cert.pem ]; do
                sleep 2
            done
            
            chmod 600 ~/.cloudflared/cert.pem
            
            success "Zertifikat erfolgreich empfangen!"
            
        else
            # METHODE 2: URL manuell öffnen
            echo -e "${CYAN}╔═══════════════════════════════════════════════════════════╗${NC}"
            echo -e "${CYAN}║  Cloudflare Login - URL manuell öffnen                   ║${NC}"
            echo -e "${CYAN}╚═══════════════════════════════════════════════════════════╝${NC}"
            echo ""
            echo -e "${YELLOW}Anleitung:${NC}"
            echo ""
            echo -e "  ${GREEN}1.${NC} URL wird gleich unten angezeigt"
            echo -e "  ${GREEN}2.${NC} URL ${GREEN}KOMPLETT kopieren${NC} (von https:// bis Ende!)"
            echo -e "     ${YELLOW}⚠️  URL geht über mehrere Zeilen!${NC}"
            echo -e "  ${GREEN}3.${NC} Browser auf ${GREEN}deinem PC${NC} öffnen"
            echo -e "  ${GREEN}4.${NC} URL einfügen → Bei Cloudflare einloggen"
            echo -e "  ${GREEN}5.${NC} Domain wählen → ${GREEN}\"Authorize\"${NC} klicken"
            echo -e "  ${GREEN}6.${NC} Terminal wartet bis Login fertig ist"
            echo ""
            echo -ne "Drücke ${GREEN}Enter${NC} um URL anzuzeigen..."
            read
            echo ""
            echo -e "${YELLOW}▼▼▼ URL BEGINNT HIER - KOMPLETT KOPIEREN! ▼▼▼${NC}"
            echo ""
            
            # Output direkt durchreichen
            cloudflared tunnel login
            
            echo ""
            echo -e "${YELLOW}▲▲▲ URL ENDET HIER ▲▲▲${NC}"
            echo ""
        fi
        
    else
        # Kein SSH - normaler Login
        info "Browser-Fenster öffnet sich..."
        echo ""
        cloudflared tunnel login
    fi
    
    # Check if login was successful
    if [ ! -f ~/.cloudflared/cert.pem ]; then
        echo ""
        echo -e "${RED}╔═══════════════════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║               ❌ Cloudflare Login fehlgeschlagen ❌       ║${NC}"
        echo -e "${RED}╚═══════════════════════════════════════════════════════════╝${NC}"
        echo ""
        echo -e "${YELLOW}Lösung:${NC}"
        echo -e "  ${GREEN}1.${NC} Installation neu starten: ${GREEN}./install.sh${NC}"
        echo -e "  ${GREEN}2.${NC} Methode 1 (Lokaler PC) wählen"
        echo ""
        exit 1
    fi
    
    success "Cloudflare Login erfolgreich!"
    success "Zertifikat erstellt: ~/.cloudflared/cert.pem"
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
    echo ""
    echo -e "${YELLOW}Problemlösung:${NC}"
    echo -e "  ${CYAN}1.${NC} Logs ansehen: ${GREEN}cat $LOG_FILE${NC}"
    echo -e "  ${CYAN}2.${NC} Hilfe-Übersicht: ${GREEN}cat /var/www/fmsv-dingden/Installation/HILFE-UEBERSICHT.md${NC}"
    echo -e "  ${CYAN}3.${NC} Häufige Probleme:"
    echo -e "     • Eingabe-Fehler: ${CYAN}Installation/EINGABE-FEHLER.md${NC}"
    echo -e "     • Script bricht ab: ${CYAN}Installation/SCRIPT-BRICHT-AB.md${NC}"
    echo -e "     • Nginx Fehler: ${CYAN}Installation/NGINX-FEHLER.md${NC}"
    echo -e "     • Cloudflare: ${CYAN}Installation/CLOUDFLARED-INSTALLATION-FEHLER.md${NC}"
    echo ""
    exit 1
}



################################################################################
# PARSE ARGUMENTS
################################################################################

SKIP_CLOUDFLARE=0

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
╚════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"
echo ""
info "Willkommen zur automatischen Installation!"
echo ""
sleep 2

################################################################################
# Schritt 1: System-Prüfung
################################################################################

print_header 1 "System-Prüfung"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    error "Bitte als root ausführen: su - && ./install.sh"
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
    error "Keine Internet-Verbindung"
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
echo -e "   ${GREEN}[1]${NC} Stable   - Stabile Releases (empfohlen für Production)"
echo -e "   ${YELLOW}[2]${NC} Testing  - Neueste Features (für Entwicklung/Testing)"
echo ""
echo -ne "   ${BLUE}►${NC} Deine Wahl (1/2): "
read UPDATE_CHANNEL

# Trim whitespace und normalisieren
UPDATE_CHANNEL=$(echo "$UPDATE_CHANNEL" | xargs)

case "$UPDATE_CHANNEL" in
  1|"1"|stable|Stable|STABLE)
    BRANCH="main"
    CHANNEL_NAME="Stable"
    ;;
  2|"2"|testing|Testing|TESTING)
    BRANCH="testing"
    CHANNEL_NAME="Testing"
    ;;
  "")
    # Default bei leerem Input
    BRANCH="main"
    CHANNEL_NAME="Stable"
    warning "Keine Auswahl - verwende Standard: Stable"
    ;;
  *)
    echo ""
    error "Ungültige Auswahl: '$UPDATE_CHANNEL' - Bitte 1 oder 2 eingeben"
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
    echo -ne "   ${BLUE}►${NC} Cloudflare Tunnel einrichten? (j/n): "
    read -n 1 -r
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
echo -e "   ${GREEN}Standard:${NC} https://github.com/Benno2406/fmsv-dingden.git"
echo ""
echo -ne "   ${BLUE}►${NC} GitHub Repository URL [Enter für Standard]: "
read GITHUB_REPO
if [ -z "$GITHUB_REPO" ]; then
    GITHUB_REPO="https://github.com/Benno2406/fmsv-dingden.git"
    info "Standard-URL verwendet"
fi
echo ""
sleep 1

# Option 4: Auto-Update
echo -e "${YELLOW}4️⃣  Automatische Updates:${NC}"
echo ""
echo -e "   ${GREEN}[1]${NC} Täglich um 03:00 Uhr"
echo -e "   ${YELLOW}[2]${NC} Wöchentlich (Sonntag 03:00 Uhr)"
echo -e "   ${MAGENTA}[3]${NC} Manuell (keine automatischen Updates)"
echo ""
echo -ne "   ${BLUE}►${NC} Deine Wahl (1/2/3): "
read AUTO_UPDATE_CHOICE

# Trim whitespace und normalisieren
AUTO_UPDATE_CHOICE=$(echo "$AUTO_UPDATE_CHOICE" | xargs)

case "$AUTO_UPDATE_CHOICE" in
  1|"1"|daily|täglich|Täglich)
    AUTO_UPDATE_SCHEDULE="daily"
    ;;
  2|"2"|weekly|wöchentlich|Wöchentlich)
    AUTO_UPDATE_SCHEDULE="weekly"
    ;;
  3|"3"|manual|manuell|Manuell)
    AUTO_UPDATE_SCHEDULE="manual"
    ;;
  "")
    # Default bei leerem Input
    AUTO_UPDATE_SCHEDULE="weekly"
    warning "Keine Auswahl - verwende Standard: wöchentlich"
    ;;
  *)
    echo ""
    error "Ungültige Auswahl: '$AUTO_UPDATE_CHOICE' - Bitte 1, 2 oder 3 eingeben"
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
echo -e "  ${BLUE}•${NC} Cloudflare Tunnel:   $( [[ $USE_CLOUDFLARE =~ ^[Jj]$ ]] && echo -e "${GREEN}Ja${NC}" || echo -e "${YELLOW}Nein${NC}" )"
echo -e "  ${BLUE}•${NC} GitHub Repo:         $GITHUB_REPO"
echo -e "  ${BLUE}•${NC} Auto-Update:         ${GREEN}$AUTO_UPDATE_SCHEDULE${NC}"
echo ""
echo -e "${CYAN}$(printf '─%.0s' {1..60})${NC}"
echo ""
echo -ne "Installation mit diesen Einstellungen starten? (j/n) "
read -n 1 -r
echo
[[ ! $REPLY =~ ^[Jj]$ ]] && error "Installation abgebrochen"

################################################################################
# Schritt 3: System-Updates
################################################################################

print_header 3 "System-Updates"

info "Aktualisiere Paket-Listen..."
APT_OUTPUT=$(apt-get update 2>&1 | tee -a "$LOG_FILE")
APT_ERRORS=$(echo "$APT_OUTPUT" | grep "^E:" || true)
APT_WARNINGS=$(echo "$APT_OUTPUT" | grep "^W:" || true)

if [ -n "$APT_WARNINGS" ] && [ -z "$APT_ERRORS" ]; then
    # Nur Warnungen, keine Fehler - das ist OK
    success "Paket-Listen aktualisiert (mit Warnungen)"
    warning "Einige Repositories haben Warnungen (nicht kritisch)"
elif [ -n "$APT_ERRORS" ]; then
    # Echte Fehler vorhanden
    warning "Paket-Listen konnten nicht vollständig aktualisiert werden"
    echo ""
    echo -e "${YELLOW}Gefundene Fehler:${NC}"
    echo "$APT_ERRORS" | sed 's/^/  /'
    echo ""
    echo -e "${YELLOW}Häufige Ursachen:${NC}"
    echo "  • Repository nicht erreichbar"
    echo "  • GPG-Key fehlt"
    echo "  • Netzwerk-Problem"
    echo ""
    echo -ne "${CYAN}Trotzdem fortfahren? (j/n):${NC} "
    read -n 1 -r
    echo
    [[ ! $REPLY =~ ^[Jj]$ ]] && error "Installation abgebrochen"
else
    success "Paket-Listen aktualisiert"
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
PACKAGES="curl wget git nano ufw lsb-release gnupg software-properties-common net-tools"

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
    error "PostgreSQL Installation fehlgeschlagen! Siehe $LOG_FILE"
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

echo -ne "   ${BLUE}►${NC} Datenbank-Name [fmsv_database]: "
read DB_NAME
DB_NAME=${DB_NAME:-fmsv_database}

echo -ne "   ${BLUE}►${NC} Datenbank-Benutzer [fmsv_user]: "
read DB_USER
DB_USER=${DB_USER:-fmsv_user}

while true; do
    echo -ne "   ${BLUE}►${NC} Datenbank-Passwort: "
    read -s DB_PASSWORD
    echo
    echo -ne "   ${BLUE}►${NC} Passwort wiederholen: "
    read -s DB_PASSWORD2
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
CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
CREATE DATABASE $DB_NAME OWNER $DB_USER;
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
GRANT USAGE ON SCHEMA public TO $DB_USER;
GRANT CREATE ON SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO $DB_USER;
ALTER SCHEMA public OWNER TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO $DB_USER;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public;
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
        echo -e "  ${GREEN}2.${NC} Installation ohne Cloudflare: ${CYAN}./install.sh --no-cloudflare${NC}"
        echo -e "  ${GREEN}3.${NC} Cloudflare später manuell einrichten"
        echo ""
        
        read -p "   ${BLUE}►${NC} Cloudflare überspringen und fortfahren? (j/N): " SKIP_CF
        echo ""
        
        if [[ $SKIP_CF =~ ^[Jj]$ ]]; then
            warning "Cloudflare wird übersprungen - du kannst es später manuell einrichten!"
            echo ""
            echo -e "  ${CYAN}Siehe: Installation/CLOUDFLARE-LOKALER-PC.md${NC}"
            echo ""
            sleep 2
            return 0
        else
            echo ""
            info "Installation wird abgebrochen."
            echo ""
            echo -e "${YELLOW}Starte neu mit:${NC} ${GREEN}./install.sh --no-cloudflare${NC}"
            echo ""
            exit 1
        fi
    fi
    
    info "Füge Cloudflare Repository hinzu..."
    # Cloudflare unterstützt aktuell nur bookworm, nicht trixie
    # Daher verwenden wir bookworm auch bei Debian 13
    CLOUDFLARE_DIST="bookworm"
    if [ "$DEBIAN_VERSION" -lt 12 ]; then
        # Für ältere Versionen versuchen wir die aktuelle Distribution
        CLOUDFLARE_DIST=$(lsb_release -cs)
    fi
    echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared $CLOUDFLARE_DIST main" | tee /etc/apt/sources.list.d/cloudflared.list > /dev/null
    
    info "Aktualisiere Paket-Listen..."
    APT_CF_OUTPUT=$(apt-get update 2>&1)
    APT_CF_ERRORS=$(echo "$APT_CF_OUTPUT" | grep "^E:" || true)
    
    if [ -n "$APT_CF_ERRORS" ]; then
        echo ""
        warning "apt-get update hatte Fehler - versuche Installation trotzdem..."
        echo ""
    else
        success "Paket-Listen aktualisiert"
    fi
    
    info "Installiere cloudflared..."
    
    # Zeige Installation-Output (nicht komplett silent)
    if ! apt-get install -y cloudflared 2>&1 | grep -v "^Selecting\|^Preparing\|^Unpacking\|^Setting up" | grep -v "^$"; then
        echo ""
        error "cloudflared Installation fehlgeschlagen!"
        echo ""
        echo -e "${YELLOW}Mögliche Ursachen:${NC}"
        echo -e "  ${RED}1.${NC} Repository konnte nicht hinzugefügt werden"
        echo -e "  ${RED}2.${NC} Internetverbindung unterbrochen"
        echo -e "  ${RED}3.${NC} Cloudflare Repository nicht erreichbar"
        echo ""
        echo -e "${YELLOW}Optionen:${NC}"
        echo -e "  ${GREEN}1.${NC} Manuelle Installation versuchen: ${CYAN}apt-get install -y cloudflared${NC}"
        echo -e "  ${GREEN}2.${NC} Installation ohne Cloudflare: ${CYAN}./install.sh --no-cloudflare${NC}"
        echo -e "  ${GREEN}3.${NC} Siehe: ${CYAN}Installation/CLOUDFLARED-INSTALLATION-FEHLER.md${NC}"
        echo ""
        
        read -p "   ${BLUE}►${NC} Cloudflare überspringen und fortfahren? (j/N): " SKIP_CF2
        echo ""
        
        if [[ $SKIP_CF2 =~ ^[Jj]$ ]]; then
            warning "Cloudflare wird übersprungen!"
            echo ""
            return 0
        else
            exit 1
        fi
    fi
    
    # Prüfe ob cloudflared wirklich verfügbar ist
    if ! command -v cloudflared &> /dev/null; then
        echo ""
        warning "cloudflared Installation abgeschlossen, aber Befehl nicht gefunden!"
        echo ""
        echo -e "${YELLOW}Dies ist normal nach der ersten Installation.${NC}"
        echo -e "${YELLOW}Lösung: Shell neu laden oder Server neu starten.${NC}"
        echo ""
        
        read -p "   ${BLUE}►${NC} Trotzdem fortfahren? (J/n): " CONTINUE_CF
        echo ""
        
        if [[ ! $CONTINUE_CF =~ ^[Nn]$ ]]; then
            warning "Fahre fort - Cloudflare kann später konfiguriert werden"
            echo ""
            return 0
        else
            exit 1
        fi
    fi
    
    # Wenn cloudflared verfügbar ist, Version anzeigen
    if command -v cloudflared &> /dev/null; then
        CF_VERSION=$(cloudflared --version 2>/dev/null | head -1)
        success "Cloudflared installiert: $CF_VERSION"
        
        echo ""
        echo -e "${YELLOW}╔════════════════════════════════════════════════════════╗${NC}"
        echo -e "${YELLOW}║${NC}  ${CYAN}Cloudflare Login erforderlich${NC}                        ${YELLOW}║${NC}"
        echo -e "${YELLOW}╚════════════════════════════════════════════════════════╝${NC}"
        echo ""
        
        # Call our intelligent login function
        cloudflare_login_with_help
    else
        # cloudflared nicht verfügbar - wurde übersprungen
        warning "Cloudflare wurde übersprungen - Setup kann später nachgeholt werden"
        echo ""
        echo -e "  ${CYAN}Siehe: Installation/CLOUDFLARE-LOKALER-PC.md${NC}"
        echo ""
        sleep 2
        return 0
    fi
    
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

systemctl enable nginx > /dev/null 2>&1
success "Nginx installiert und konfiguriert"
info "Nginx-Test erfolgt nach Frontend-Build"
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

# Prüfe ob schema.sql existiert
info "Prüfe Datenbank-Schema Datei..."
SCHEMA_FILE="$INSTALL_DIR/backend/database/schema.sql"

if [ ! -f "$SCHEMA_FILE" ]; then
    echo ""
    warning "Schema-Datei nicht gefunden: $SCHEMA_FILE"
    info "Die Datei existiert im GitHub - lade sie herunter..."
    echo ""
    
    cd "$INSTALL_DIR"
    
    # Direkter Download von GitHub (funktioniert immer wenn Datei im Repo ist)
    GITHUB_RAW_URL="https://raw.githubusercontent.com/Benno2406/fmsv-dingden/$BRANCH/backend/database/schema.sql"
    
    info "Lade schema.sql von GitHub..."
    if curl -f -L -o "$SCHEMA_FILE" "$GITHUB_RAW_URL" 2>&1 | grep -v "^$"; then
        if [ -f "$SCHEMA_FILE" ] && [ -s "$SCHEMA_FILE" ]; then
            success "Schema-Datei erfolgreich von GitHub geladen"
        else
            error "Download fehlgeschlagen oder Datei ist leer"
            rm -f "$SCHEMA_FILE"
            
            # Fallback: Git Pull
            info "Versuche git pull als Fallback..."
            git fetch origin $BRANCH
            git checkout origin/$BRANCH -- backend/database/schema.sql
            
            if [ -f "$SCHEMA_FILE" ] && [ -s "$SCHEMA_FILE" ]; then
                success "Schema-Datei via Git wiederhergestellt"
            else
                echo ""
                error "Schema-Datei konnte nicht geladen werden!"
                echo ""
                echo -e "${YELLOW}Die Datei sollte unter diesem Link erreichbar sein:${NC}"
                echo -e "  ${CYAN}$GITHUB_RAW_URL${NC}"
                echo ""
                echo -e "${YELLOW}Bitte prüfe:${NC}"
                echo -e "  ${GREEN}1.${NC} Ist das Repository öffentlich?"
                echo -e "  ${GREEN}2.${NC} Existiert die Datei im Branch '$BRANCH'?"
                echo -e "  ${GREEN}3.${NC} Ist die Internetverbindung OK? (ping github.com)"
                echo ""
                echo -e "${YELLOW}Manuelle Lösung:${NC}"
                echo -e "  ${CYAN}# Auf lokalem PC:${NC}"
                echo -e "  ${CYAN}scp backend/database/schema.sql root@$(hostname):$INSTALL_DIR/backend/database/${NC}"
                echo ""
                echo -e "  ${CYAN}# Oder direkt auf Server:${NC}"
                echo -e "  ${CYAN}wget -O $SCHEMA_FILE $GITHUB_RAW_URL${NC}"
                echo ""
                exit 1
            fi
        fi
    else
        echo ""
        error "Download von GitHub fehlgeschlagen!"
        echo ""
        echo -e "${YELLOW}URL:${NC} $GITHUB_RAW_URL"
        echo ""
        
        # Fallback: Git Pull
        info "Versuche git pull als Fallback..."
        git fetch origin $BRANCH
        git checkout origin/$BRANCH -- backend/database/schema.sql
        
        if [ -f "$SCHEMA_FILE" ] && [ -s "$SCHEMA_FILE" ]; then
            success "Schema-Datei via Git wiederhergestellt"
        else
            echo ""
            error "Alle Versuche fehlgeschlagen!"
            echo ""
            echo -e "${YELLOW}Manuelle Lösung:${NC}"
            echo -e "  ${CYAN}wget -O $SCHEMA_FILE $GITHUB_RAW_URL${NC}"
            echo ""
            exit 1
        fi
    fi
fi

success "Schema-Datei gefunden: $(du -h $SCHEMA_FILE | cut -f1)"

# Validierung: Prüfe ob die Datei nicht leer ist
SCHEMA_SIZE=$(stat -c%s "$SCHEMA_FILE" 2>/dev/null || stat -f%z "$SCHEMA_FILE" 2>/dev/null || echo "0")
if [ "$SCHEMA_SIZE" -lt 100 ]; then
    error "Schema-Datei ist zu klein ($SCHEMA_SIZE Bytes) - möglicherweise korrupt!"
    rm -f "$SCHEMA_FILE"
    
    # Erneuter Download-Versuch
    info "Lade schema.sql erneut..."
    GITHUB_RAW_URL="https://raw.githubusercontent.com/Benno2406/fmsv-dingden/$BRANCH/backend/database/schema.sql"
    curl -f -L -o "$SCHEMA_FILE" "$GITHUB_RAW_URL"
    
    SCHEMA_SIZE=$(stat -c%s "$SCHEMA_FILE" 2>/dev/null || stat -f%z "$SCHEMA_FILE" 2>/dev/null || echo "0")
    if [ "$SCHEMA_SIZE" -lt 100 ]; then
        error "Schema-Datei konnte nicht korrekt geladen werden!"
        exit 1
    fi
    success "Schema-Datei erfolgreich nachgeladen"
fi

info "Initialisiere Datenbank-Schema..."
if node scripts/initDatabase.js; then
    success "Datenbank-Schema initialisiert"
else
    echo ""
    error "Datenbank-Initialisierung fehlgeschlagen!"
    echo ""
    echo -e "${YELLOW}Häufige Ursachen:${NC}"
    echo -e "  ${RED}1.${NC} PostgreSQL läuft nicht"
    echo -e "  ${RED}2.${NC} Datenbank existiert nicht"
    echo -e "  ${RED}3.${NC} Falsche Credentials in .env"
    echo -e "  ${RED}4.${NC} SQL-Syntax Fehler"
    echo ""
    echo -e "${YELLOW}Debug-Befehle:${NC}"
    echo -e "  ${GREEN}1.${NC} PostgreSQL Status: ${CYAN}systemctl status postgresql${NC}"
    echo -e "  ${GREEN}2.${NC} .env prüfen: ${CYAN}cat $INSTALL_DIR/backend/.env | grep DB_${NC}"
    echo -e "  ${GREEN}3.${NC} Manuell testen: ${CYAN}cd $INSTALL_DIR/backend && node scripts/initDatabase.js${NC}"
    echo -e "  ${GREEN}4.${NC} Datenbank-Logs: ${CYAN}journalctl -u postgresql -n 50${NC}"
    echo ""
    exit 1
fi

echo ""
echo -ne "Test-Daten einfügen? (j/n) "
read -n 1 -r
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

# Jetzt erst nginx testen, da dist/ Verzeichnis existiert
info "Teste Nginx-Konfiguration..."
if nginx -t > /dev/null 2>&1; then
    success "Nginx-Konfiguration OK"
else
    echo ""
    warning "Nginx-Konfiguration hat Warnungen (kann ignoriert werden wenn nginx später startet)"
    echo ""
    echo -e "${YELLOW}Detaillierte Ausgabe:${NC}"
    nginx -t
    echo ""
    echo -ne "   ${BLUE}►${NC} Trotzdem fortfahren? (J/n): "
    read NGINX_CONTINUE
    echo ""
    if [[ $NGINX_CONTINUE =~ ^[Nn]$ ]]; then
        error "Installation abgebrochen"
    fi
fi

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

# Prüfe ob nginx bereits läuft
if systemctl is-active --quiet nginx; then
    info "Nginx läuft bereits - stoppe für Neustart..."
    systemctl stop nginx > /dev/null 2>&1
    sleep 1
fi

# Prüfe ob Port 80 belegt ist
if netstat -tulpn 2>/dev/null | grep -q ':80 '; then
    warning "Port 80 ist bereits belegt!"
    echo ""
    echo -e "${YELLOW}Prozesse auf Port 80:${NC}"
    netstat -tulpn | grep ':80 ' || true
    echo ""
    
    # Prüfe ob Apache läuft
    if netstat -tulpn 2>/dev/null | grep -q 'apache'; then
        info "Apache blockiert Port 80 - stoppe Apache..."
        systemctl stop apache2 2>/dev/null || systemctl stop httpd 2>/dev/null || true
        systemctl disable apache2 2>/dev/null || systemctl disable httpd 2>/dev/null || true
        pkill -9 apache2 2>/dev/null || true
        pkill -9 httpd 2>/dev/null || true
        sleep 2
        success "Apache gestoppt und deaktiviert"
    fi
    
    # Versuche alle nginx-Prozesse zu killen
    info "Versuche alle nginx-Prozesse zu beenden..."
    pkill -9 nginx 2>/dev/null || true
    sleep 2
    
    # Prüfe nochmal
    if netstat -tulpn 2>/dev/null | grep -q ':80 '; then
        echo ""
        warning "Port 80 ist immer noch belegt!"
        netstat -tulpn | grep ':80 ' || true
        echo ""
        echo -ne "   ${BLUE}►${NC} Port-Blockierer killen und fortfahren? (j/N): "
        read TRY_NGINX
        echo ""
        if [[ $TRY_NGINX =~ ^[Jj]$ ]]; then
            # Versuche den Prozess zu killen
            PORT_PID=$(netstat -tulpn 2>/dev/null | grep ':80 ' | awk '{print $7}' | cut -d'/' -f1 | head -1)
            if [ -n "$PORT_PID" ]; then
                info "Beende Prozess $PORT_PID..."
                kill -9 "$PORT_PID" 2>/dev/null || true
                sleep 2
            fi
        else
            error "Installation abgebrochen - Port 80 Konflikt muss behoben werden"
        fi
    else
        success "Port 80 freigegeben"
    fi
fi

# Starte nginx
if systemctl start nginx 2>&1 | tee -a "$LOG_FILE" > /dev/null; then
    sleep 2
    if systemctl is-active --quiet nginx; then
        success "Nginx läuft"
    else
        echo ""
        warning "Nginx wurde gestartet, ist aber nicht aktiv"
        echo ""
        echo -e "${YELLOW}Diagnose:${NC}"
        systemctl status nginx --no-pager -l
        echo ""
        echo -e "${YELLOW}Nginx Error Log:${NC}"
        tail -20 /var/log/nginx/error.log 2>/dev/null || echo "Keine Logs gefunden"
        echo ""
        
        echo -ne "   ${BLUE}►${NC} Nginx-Fehler ignorieren und fortfahren? (j/N): "
        read IGNORE_NGINX
        echo ""
        
        if [[ ! $IGNORE_NGINX =~ ^[Jj]$ ]]; then
            error "Installation abgebrochen - Nginx Fehler muss behoben werden"
        else
            warning "Nginx-Fehler wird ignoriert - muss später manuell behoben werden!"
        fi
    fi
else
    echo ""
    error_with_help "Nginx konnte nicht gestartet werden!" \
        "" \
        "Diagnose-Befehle:" \
        "  ${GREEN}systemctl status nginx${NC}" \
        "  ${GREEN}nginx -t${NC}" \
        "  ${GREEN}tail /var/log/nginx/error.log${NC}" \
        "" \
        "Häufige Ursachen:" \
        "• Port 80 bereits belegt (prüfe: ${CYAN}netstat -tulpn | grep :80${NC})" \
        "• Fehlende Berechtigungen auf dist/ Verzeichnis" \
        "• Syntax-Fehler in nginx Konfiguration" \
        "" \
        "Manuelle Behebung:" \
        "  ${GREEN}nginx -t${NC}  ${YELLOW}# Konfiguration testen${NC}" \
        "  ${GREEN}systemctl start nginx${NC}  ${YELLOW}# Nginx starten${NC}"
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

# Kopiere Debug und Update Scripts für späteren Gebrauch
info "Kopiere Wartungs-Scripts..."
cp -f /var/www/fmsv-dingden/Installation/scripts/debug.sh /usr/local/bin/fmsv-debug
cp -f /var/www/fmsv-dingden/Installation/scripts/update.sh /usr/local/bin/fmsv-update
chmod +x /usr/local/bin/fmsv-debug
chmod +x /usr/local/bin/fmsv-update
success "Wartungs-Scripts installiert (fmsv-debug, fmsv-update)"
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
echo -e "  ${BLUE}Updates & Wartung:${NC}"
echo -e "    ${GREEN}fmsv-update${NC}  ${CYAN}# System aktualisieren${NC}"
echo -e "    ${GREEN}fmsv-debug${NC}   ${CYAN}# Diagnose & Fehlersuche${NC}"
echo ""

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📝 Nächste Schritte${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━���━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
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
