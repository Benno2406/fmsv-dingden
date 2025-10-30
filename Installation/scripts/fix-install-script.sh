#!/bin/bash

################################################################################
# FMSV Dingden - Install Script Quick Fix
#
# Behebt das "Ungültige Auswahl" Problem beim install.sh
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}║         🔧 Install Script Fix (Ungültige Auswahl)         ║${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Bitte als root ausführen!${NC}"
    echo ""
    echo "   ${YELLOW}Lösung:${NC}"
    echo "   ${GREEN}su -${NC}"
    echo "   ${GREEN}cd /var/www/fmsv-dingden/Installation/scripts${NC}"
    echo "   ${GREEN}./fix-install-script.sh${NC}"
    echo ""
    exit 1
fi

echo -e "${YELLOW}Was macht dieses Script?${NC}"
echo ""
echo "  1. Lädt die neueste Version von install.sh"
echo "  2. Erstellt ein Backup der alten Version"
echo "  3. Ersetzt install.sh mit der fixen Version"
echo ""
echo -e "${GREEN}Das behebt:${NC}"
echo "  ✅ \"Ungültige Auswahl\" Fehler bei Eingaben"
echo "  ✅ Farben werden korrekt angezeigt"
echo "  ✅ Whitespace in Eingaben wird ignoriert"
echo "  ✅ Akzeptiert mehrere Eingabe-Varianten"
echo ""

read -p "Fortfahren? (j/n): " -n 1 -r
echo
echo ""

if [[ ! $REPLY =~ ^[Jj]$ ]]; then
    echo -e "${YELLOW}Abgebrochen.${NC}"
    exit 0
fi

# Navigate to script directory
SCRIPT_DIR="/var/www/fmsv-dingden/Installation/scripts"

if [ ! -d "$SCRIPT_DIR" ]; then
    echo -e "${RED}❌ Verzeichnis nicht gefunden: $SCRIPT_DIR${NC}"
    echo ""
    echo "   ${YELLOW}Lösung:${NC}"
    echo "   ${GREEN}cd /root${NC}"
    echo "   ${GREEN}git clone https://github.com/Benno2406/fmsv-dingden.git /var/www/fmsv-dingden${NC}"
    echo ""
    exit 1
fi

cd "$SCRIPT_DIR"

echo -e "${BLUE}►${NC} Erstelle Backup..."
if [ -f "install.sh" ]; then
    cp install.sh "install.sh.backup.$(date +%s)"
    echo -e "${GREEN}✅${NC} Backup erstellt: install.sh.backup.$(date +%s)"
else
    echo -e "${YELLOW}⚠️${NC}  Keine alte install.sh gefunden (ist OK)"
fi
echo ""

echo -e "${BLUE}►${NC} Lade neue Version..."

# Option 1: Versuche git pull
if [ -d "/var/www/fmsv-dingden/.git" ]; then
    echo -e "${BLUE}  ${NC} Git Repository gefunden - verwende git pull..."
    cd /var/www/fmsv-dingden
    
    # Stash local changes
    git stash > /dev/null 2>&1 || true
    
    # Pull latest version
    if git pull origin main 2>&1; then
        echo -e "${GREEN}✅${NC} Repository aktualisiert"
    else
        echo -e "${YELLOW}⚠️${NC}  git pull fehlgeschlagen - verwende wget als Fallback..."
        
        # Fallback: wget
        cd "$SCRIPT_DIR"
        wget -O install.sh https://raw.githubusercontent.com/Benno2406/fmsv-dingden/main/Installation/scripts/install.sh 2>&1
        chmod +x install.sh
        echo -e "${GREEN}✅${NC} install.sh via wget heruntergeladen"
    fi
else
    # Fallback: wget
    echo -e "${BLUE}  ${NC} Kein Git Repository - verwende wget..."
    wget -O install.sh https://raw.githubusercontent.com/Benno2406/fmsv-dingden/main/Installation/scripts/install.sh 2>&1
    chmod +x install.sh
    echo -e "${GREEN}✅${NC} install.sh via wget heruntergeladen"
fi

echo ""
echo -e "${GREEN}✅ Script erfolgreich aktualisiert!${NC}"
echo ""
echo -e "${YELLOW}Nächste Schritte:${NC}"
echo ""
echo "  ${GREEN}1.${NC} Installation starten:"
echo "     ${GREEN}./install.sh${NC}"
echo ""
echo "  ${GREEN}2.${NC} Bei Eingaben:"
echo "     ${BLUE}►${NC} Einfach 1 oder 2 eingeben"
echo "     ${BLUE}►${NC} Whitespace ist egal"
echo "     ${BLUE}►${NC} Enter für Standard"
echo ""
echo -e "${GREEN}Das Problem sollte jetzt behoben sein!${NC}"
echo ""

# List backups
BACKUPS=$(ls -1 install.sh.backup.* 2>/dev/null | wc -l)
if [ "$BACKUPS" -gt 0 ]; then
    echo -e "${BLUE}ℹ️  Backups verfügbar:${NC}"
    ls -lh install.sh.backup.* 2>/dev/null | tail -3
    echo ""
    echo "   ${YELLOW}Zum Wiederherstellen:${NC}"
    echo "   ${GREEN}cp install.sh.backup.XXXXXXXXXX install.sh${NC}"
    echo ""
fi

echo -e "${BLUE}Viel Erfolg!${NC} 🚀"
echo ""
