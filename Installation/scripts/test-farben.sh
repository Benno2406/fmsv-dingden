#!/bin/bash
################################################################################
# Test-Script für Farben
# Zeigt alle Farben und testet ob sie funktionieren
################################################################################

# Lade Farben
source "$(dirname "$0")/lib/colors.sh"

echo ""
echo "=========================================="
echo "Farben-Test"
echo "=========================================="
echo ""

echo "Basis-Farben:"
echo "  ${RED}● Rot (RED)${NC}"
echo "  ${GREEN}● Grün (GREEN)${NC}"
echo "  ${YELLOW}● Gelb (YELLOW)${NC}"
echo "  ${BLUE}● Blau (BLUE)${NC}"
echo "  ${MAGENTA}● Magenta (MAGENTA)${NC}"
echo "  ${CYAN}● Cyan (CYAN)${NC}"
echo "  ${WHITE}● Weiß (WHITE)${NC}"
echo ""

echo "Formatierungen:"
echo "  ${BOLD}Fettgedruckt (BOLD)${NC}"
echo "  ${DIM}Abgeblendet (DIM)${NC}"
echo "  ${ITALIC}Kursiv (ITALIC)${NC}"
echo "  ${UNDERLINE}Unterstrichen (UNDERLINE)${NC}"
echo ""

echo "Hintergrund-Farben:"
echo "  ${BG_RED}${WHITE} Roter Hintergrund ${NC}"
echo "  ${BG_GREEN}${WHITE} Grüner Hintergrund ${NC}"
echo "  ${BG_YELLOW} Gelber Hintergrund ${NC}"
echo "  ${BG_BLUE}${WHITE} Blauer Hintergrund ${NC}"
echo "  ${BG_CYAN} Cyan Hintergrund ${NC}"
echo ""

echo "Kombinationen:"
echo "  ${BOLD}${RED}● Fett + Rot${NC}"
echo "  ${BOLD}${GREEN}● Fett + Grün${NC}"
echo "  ${BOLD}${YELLOW}● Fett + Gelb${NC}"
echo "  ${BOLD}${BLUE}● Fett + Blau${NC}"
echo ""

echo "Test: Farben in echo (ohne -e):"
echo "${GREEN}✓ Dieser Text sollte grün sein${NC}"
echo ""

echo "Test: Farben in echo -e:"
echo -e "${YELLOW}⚠ Dieser Text sollte gelb sein${NC}"
echo ""

echo -n "Test: Farben in echo -n: "
echo "${BLUE}● Dieser Text sollte blau sein${NC}"
echo ""

echo "Test: Farben in printf:"
printf "${CYAN}► Dieser Text sollte cyan sein${NC}\n"
echo ""

echo "=========================================="
echo "${GREEN}✓ Farben-Test abgeschlossen!${NC}"
echo "=========================================="
echo ""
echo "Wenn alle Texte farbig angezeigt werden,"
echo "funktionieren die Farben korrekt!"
echo ""
