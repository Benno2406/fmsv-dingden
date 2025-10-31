#!/bin/bash

################################################################################
# FMSV Dingden - Apache2 Entfernen (falls installiert)
# Entfernt Apache2 falls es installiert wurde (z.B. von pgAdmin setup-web.sh)
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║         FMSV Dingden - Apache2 Entfernen                 ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Bitte als root ausführen: sudo $0${NC}"
    exit 1
fi

# Prüfe ob Apache2 installiert ist
if ! command -v apache2 &> /dev/null; then
    echo -e "${GREEN}✅ Apache2 ist nicht installiert - nichts zu tun!${NC}"
    exit 0
fi

echo -e "${YELLOW}⚠️  Apache2 wurde gefunden!${NC}"
echo ""
echo -e "${CYAN}Warum Apache2 entfernen?${NC}"
echo -e "  • Diese Installation verwendet ${GREEN}nginx${NC} als Webserver"
echo -e "  • Apache2 wird ${RED}NICHT${NC} benötigt"
echo -e "  • Spart Ressourcen und vereinfacht die Verwaltung"
echo ""

# Zeige ob Apache2 läuft
if systemctl is-active --quiet apache2; then
    echo -e "${YELLOW}Apache2 läuft aktuell:${NC}"
    systemctl status apache2 --no-pager -l | head -n 10
    echo ""
else
    echo -e "${CYAN}Apache2 ist installiert, läuft aber nicht.${NC}"
    echo ""
fi

# Bestätigung
echo -ne "${YELLOW}Möchtest du Apache2 wirklich entfernen? (j/N): ${NC}"
read -n 1 -r
echo
echo ""

if [[ ! $REPLY =~ ^[Jj]$ ]]; then
    echo -e "${CYAN}Abgebrochen - Apache2 bleibt installiert.${NC}"
    exit 0
fi

# Apache2 stoppen
if systemctl is-active --quiet apache2; then
    echo -e "${BLUE}ℹ️  Stoppe Apache2...${NC}"
    systemctl stop apache2
    echo -e "${GREEN}✅ Apache2 gestoppt${NC}"
fi

# Apache2 deaktivieren
if systemctl is-enabled --quiet apache2 2>/dev/null; then
    echo -e "${BLUE}ℹ️  Deaktiviere Apache2 Autostart...${NC}"
    systemctl disable apache2 > /dev/null 2>&1 || true
    echo -e "${GREEN}✅ Autostart deaktiviert${NC}"
fi

# Apache2 deinstallieren
echo -e "${BLUE}ℹ️  Entferne Apache2...${NC}"
apt-get purge -y apache2 apache2-utils apache2-bin apache2.2-common > /dev/null 2>&1 || true

# Aufräumen
echo -e "${BLUE}ℹ️  Räume auf...${NC}"
apt-get autoremove -y > /dev/null 2>&1 || true
apt-get autoclean -y > /dev/null 2>&1 || true

# Apache2 Konfigurationen löschen (optional)
if [ -d "/etc/apache2" ]; then
    echo ""
    echo -ne "${YELLOW}Apache2 Konfigurationen auch löschen? (j/N): ${NC}"
    read -n 1 -r
    echo
    if [[ $REPLY =~ ^[Jj]$ ]]; then
        rm -rf /etc/apache2
        echo -e "${GREEN}✅ Apache2 Konfigurationen gelöscht${NC}"
    else
        echo -e "${CYAN}Apache2 Konfigurationen bleiben in /etc/apache2${NC}"
    fi
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         ✅ Apache2 erfolgreich entfernt! ✅               ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Prüfe ob nginx läuft
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ nginx läuft und übernimmt alle Dienste:${NC}"
    echo -e "  • Frontend: ${CYAN}http://$(hostname -I | awk '{print $1}')${NC}"
    echo -e "  • Backend:  ${CYAN}http://$(hostname -I | awk '{print $1}')/api${NC}"
    echo -e "  • pgAdmin:  ${CYAN}http://$(hostname -I | awk '{print $1}'):5050${NC}"
else
    echo -e "${RED}⚠️  nginx läuft NICHT!${NC}"
    echo -e "${YELLOW}Starte nginx mit: ${CYAN}systemctl start nginx${NC}"
fi

echo ""
exit 0
