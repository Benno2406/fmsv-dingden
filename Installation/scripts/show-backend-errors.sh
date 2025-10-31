#!/bin/bash

################################################################################
# FMSV Backend Error Display Script
################################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

clear
echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║              FMSV Backend Error Logs                       ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}━━━ Letzte 50 Backend Logs ━━━${NC}"
echo ""
journalctl -u fmsv-backend -n 50 --no-pager

echo ""
echo -e "${YELLOW}━━━ Fehler-Filter ━━━${NC}"
echo ""
journalctl -u fmsv-backend -n 100 --no-pager | grep -i "error\|exception\|fatal\|fail" || echo "Keine Fehler gefunden"

echo ""
echo -e "${CYAN}Live-Modus starten? (j/n): ${NC}"
read -n 1 -r
echo
if [[ $REPLY =~ ^[Jj]$ ]]; then
    echo -e "${GREEN}Starte Live-Log... (Ctrl+C zum Beenden)${NC}"
    echo ""
    journalctl -u fmsv-backend -f
fi
