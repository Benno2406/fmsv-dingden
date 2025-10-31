#!/bin/bash

################################################################################
# FMSV Dingden - Frontend Rebuild Script
# Baut das Frontend neu mit Production-Einstellungen
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
echo -e "${CYAN}║         FMSV Dingden - Frontend Rebuild                   ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

INSTALL_DIR="/var/www/fmsv-dingden"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Bitte als root ausführen: sudo $0${NC}"
    exit 1
fi

echo -e "${BLUE}ℹ️  Wechsle zum Projektverzeichnis...${NC}"
cd "$INSTALL_DIR" || {
    echo -e "${RED}❌ Verzeichnis nicht gefunden: $INSTALL_DIR${NC}"
    exit 1
}

echo -e "${GREEN}✅ In $INSTALL_DIR${NC}"
echo ""

echo -e "${BLUE}ℹ️  Prüfe Umgebungsvariablen...${NC}"

# Erstelle .env.production falls nicht vorhanden
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚠️  .env.production nicht gefunden - erstelle sie...${NC}"
    cat > .env.production <<EOF
# Production Environment Variables
# API URL - wird relativ gesetzt, damit es über Nginx Proxy funktioniert
VITE_API_URL=/api
EOF
    echo -e "${GREEN}✅ .env.production erstellt${NC}"
else
    echo -e "${GREEN}✅ .env.production existiert${NC}"
fi

# Erstelle .env.development falls nicht vorhanden
if [ ! -f ".env.development" ]; then
    echo -e "${YELLOW}⚠️  .env.development nicht gefunden - erstelle sie...${NC}"
    cat > .env.development <<EOF
# Development Environment Variables
# API URL - localhost für lokale Entwicklung
VITE_API_URL=http://localhost:3000/api
EOF
    echo -e "${GREEN}✅ .env.development erstellt${NC}"
else
    echo -e "${GREEN}✅ .env.development existiert${NC}"
fi

echo ""

echo -e "${BLUE}ℹ️  Installiere/Aktualisiere Dependencies...${NC}"
npm install --silent

echo -e "${GREEN}✅ Dependencies installiert${NC}"
echo ""

echo -e "${BLUE}ℹ️  Baue Frontend für Production...${NC}"
echo -e "${CYAN}   (Dies kann einige Minuten dauern)${NC}"
echo ""

# Build mit Production-Einstellungen
NODE_ENV=production npm run build

echo ""
echo -e "${GREEN}✅ Frontend erfolgreich gebaut${NC}"
echo ""

echo -e "${BLUE}ℹ️  Setze Berechtigungen...${NC}"
chown -R www-data:www-data "$INSTALL_DIR/dist"
chmod -R 755 "$INSTALL_DIR/dist"

echo -e "${GREEN}✅ Berechtigungen gesetzt${NC}"
echo ""

echo -e "${BLUE}ℹ️  Teste Nginx-Konfiguration...${NC}"
if nginx -t > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Nginx-Konfiguration OK${NC}"
    echo ""
    
    echo -e "${BLUE}ℹ️  Lade Nginx neu...${NC}"
    systemctl reload nginx
    echo -e "${GREEN}✅ Nginx neu geladen${NC}"
else
    echo -e "${YELLOW}⚠️  Nginx-Konfiguration hat Warnungen${NC}"
    nginx -t
    echo ""
    read -p "Trotzdem fortfahren? (j/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Jj]$ ]]; then
        systemctl reload nginx
        echo -e "${GREEN}✅ Nginx neu geladen${NC}"
    else
        echo -e "${RED}❌ Abgebrochen${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ Frontend erfolgreich rebuilt! ✅           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}Die Website sollte jetzt mit dem Backend verbunden sein.${NC}"
echo -e "${CYAN}API-Endpoint: /api (wird über Nginx zum Backend geroutet)${NC}"
echo ""
echo -e "${YELLOW}Teste den Login jetzt nochmal!${NC}"
echo ""

exit 0
