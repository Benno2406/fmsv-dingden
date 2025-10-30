#!/bin/bash

################################################################################
# FMSV Dingden - Cloudflare Connection Test
# Testet ob Cloudflare Server erreichbar sind
################################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

clear

echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║         Cloudflare Verbindungs-Test                   ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Test 1: Internet Verbindung
echo -e "${BLUE}[1/5]${NC} Teste Internet-Verbindung..."
if ping -c 2 8.8.8.8 > /dev/null 2>&1; then
    echo -e "      ${GREEN}✓${NC} Internet-Verbindung OK"
else
    echo -e "      ${RED}✗${NC} Keine Internet-Verbindung!"
    echo -e "      ${YELLOW}→ Bitte Netzwerk-Verbindung prüfen${NC}"
    exit 1
fi
echo ""

# Test 2: DNS funktioniert
echo -e "${BLUE}[2/5]${NC} Teste DNS-Auflösung..."
if nslookup cloudflare.com > /dev/null 2>&1; then
    echo -e "      ${GREEN}✓${NC} DNS funktioniert"
else
    echo -e "      ${RED}✗${NC} DNS-Auflösung fehlgeschlagen!"
    echo -e "      ${YELLOW}→ DNS Server prüfen: cat /etc/resolv.conf${NC}"
    exit 1
fi
echo ""

# Test 3: Cloudflare Server erreichbar
echo -e "${BLUE}[3/5]${NC} Teste Cloudflare Server (cloudflare.com)..."
if ping -c 2 cloudflare.com > /dev/null 2>&1; then
    echo -e "      ${GREEN}✓${NC} Cloudflare Server erreichbar"
else
    echo -e "      ${RED}✗${NC} Cloudflare Server nicht erreichbar!"
    echo -e "      ${YELLOW}→ Firewall oder Routing-Problem${NC}"
fi
echo ""

# Test 4: Cloudflare Package Server erreichbar
echo -e "${BLUE}[4/5]${NC} Teste Cloudflare Package Server..."
if curl -fsSL -I https://pkg.cloudflare.com/cloudflare-main.gpg > /dev/null 2>&1; then
    echo -e "      ${GREEN}✓${NC} Package Server erreichbar"
else
    echo -e "      ${RED}✗${NC} Package Server nicht erreichbar!"
    echo -e "      ${YELLOW}→ Dies verhindert die cloudflared Installation${NC}"
    echo ""
    echo -e "${YELLOW}Mögliche Lösungen:${NC}"
    echo -e "  ${GREEN}1.${NC} Warte 5 Minuten und versuche es erneut"
    echo -e "  ${GREEN}2.${NC} Installiere ohne Cloudflare: ${CYAN}./install.sh --no-cloudflare${NC}"
    echo -e "  ${GREEN}3.${NC} Manuelle Installation: ${CYAN}Installation/CLOUDFLARED-INSTALLATION-FEHLER.md${NC}"
    exit 1
fi
echo ""

# Test 5: GPG Key herunterladen
echo -e "${BLUE}[5/5]${NC} Teste GPG Key Download..."
TEMP_DIR=$(mktemp -d)
if curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg -o "$TEMP_DIR/test.gpg" 2>&1; then
    if [ -s "$TEMP_DIR/test.gpg" ]; then
        echo -e "      ${GREEN}✓${NC} GPG Key Download erfolgreich"
        rm -rf "$TEMP_DIR"
    else
        echo -e "      ${RED}✗${NC} GPG Key ist leer!"
        rm -rf "$TEMP_DIR"
        exit 1
    fi
else
    echo -e "      ${RED}✗${NC} GPG Key Download fehlgeschlagen!"
    rm -rf "$TEMP_DIR"
    exit 1
fi
echo ""

echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✓ Alle Tests bestanden!                              ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}Cloudflare kann installiert werden!${NC}"
echo ""
echo -e "Starte Installation mit:"
echo -e "  ${GREEN}./install.sh${NC}"
echo ""

# Zeige Netzwerk-Info
echo -e "${BLUE}Deine Server-Informationen:${NC}"
echo -e "  IP-Adresse: ${CYAN}$(hostname -I | awk '{print $1}')${NC}"
echo -e "  DNS Server: ${CYAN}$(grep nameserver /etc/resolv.conf | head -1 | awk '{print $2}')${NC}"
echo ""
