#!/bin/bash

################################################################################
# FMSV Manual Backend Start Script (für Debugging)
################################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║        FMSV Backend - Manueller Start (Debug-Modus)       ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Stoppe den Service
echo -e "${YELLOW}Stoppe Backend Service...${NC}"
systemctl stop fmsv-backend
sleep 2

# Wechsle ins Backend-Verzeichnis
cd /var/www/fmsv-dingden/backend || exit 1

# Prüfe .env
if [ ! -f ".env" ]; then
    echo -e "${RED}Fehler: .env Datei fehlt!${NC}"
    exit 1
fi

echo -e "${GREEN}.env Datei gefunden${NC}"
echo ""

# Zeige aktuelle Config
echo -e "${CYAN}Aktuelle Konfiguration:${NC}"
source .env
echo -e "  PORT: ${GREEN}$PORT${NC}"
echo -e "  DB_HOST: ${GREEN}$DB_HOST${NC}"
echo -e "  DB_NAME: ${GREEN}$DB_NAME${NC}"
echo -e "  NODE_ENV: ${GREEN}$NODE_ENV${NC}"
echo ""

# Prüfe Dependencies
echo -e "${YELLOW}Prüfe Node Modules...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}node_modules fehlt - installiere Dependencies...${NC}"
    npm install --production
fi
echo -e "${GREEN}Dependencies OK${NC}"
echo ""

# Starte Backend manuell
echo -e "${GREEN}Starte Backend manuell...${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}(Ctrl+C zum Beenden)${NC}"
echo ""

NODE_ENV=production node server.js
