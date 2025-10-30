#!/bin/bash

################################################################################
# FMSV Dingden - Make Scripts Executable
# Setzt Execute-Rechte für alle Scripts
# Version: 1.0
################################################################################

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}   FMSV Dingden - Make Scripts Executable${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
echo ""

cd "$SCRIPT_DIR" || exit 1

echo -e "${BLUE}Setze Execute-Rechte für alle Scripts...${NC}"
echo ""

SCRIPTS=(
    "install.sh"
    "update.sh"
    "debug.sh"
    "make-executable.sh"
)

COUNT=0
for script in "${SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        chmod +x "$script"
        echo -e "  ${GREEN}✓${NC} $script"
        ((COUNT++))
    else
        echo -e "  ${YELLOW}⚠${NC} $script (nicht gefunden)"
    fi
done

echo ""
echo -e "${GREEN}✅ $COUNT Scripts sind jetzt ausführbar${NC}"
echo ""
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
echo ""

echo "Du kannst nun die Scripts ausführen mit:"
echo -e "  ${BLUE}sudo ./install.sh${NC}   ${CYAN}# Erstinstallation${NC}"
echo -e "  ${BLUE}sudo ./debug.sh${NC}     ${CYAN}# Fehlersuche & Fixes${NC}"
echo -e "  ${BLUE}sudo ./update.sh${NC}    ${CYAN}# System aktualisieren${NC}"
echo ""
