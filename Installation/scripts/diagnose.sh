#!/bin/bash

################################################################################
# FMSV Backend Diagnose - Interaktives Menü
################################################################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Bitte als root ausführen: sudo $0${NC}"
    exit 1
fi

SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"

while true; do
    clear
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║         FMSV Backend - Diagnose Menü                      ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Wähle eine Option:${NC}"
    echo ""
    echo -e "  ${GREEN}[1]${NC} Quick Fix            ${CYAN}(Automatische Problemlösung)${NC}"
    echo -e "  ${GREEN}[2]${NC} Manueller Start      ${CYAN}(Zeigt ALLE Fehler direkt!)${NC}"
    echo -e "  ${GREEN}[3]${NC} Schritt-für-Schritt  ${CYAN}(Detaillierte Analyse)${NC}"
    echo -e "  ${GREEN}[4]${NC} Log Analyse          ${CYAN}(Alle Logs anzeigen)${NC}"
    echo -e "  ${GREEN}[5]${NC} Backend Tests        ${CYAN}(Vollständiger Test)${NC}"
    echo ""
    echo -e "  ${YELLOW}[S]${NC} Service Status       ${CYAN}(Aktueller Status)${NC}"
    echo -e "  ${YELLOW}[L]${NC} Live Logs            ${CYAN}(Logs in Echtzeit)${NC}"
    echo -e "  ${YELLOW}[R]${NC} Service Restart      ${CYAN}(Backend neu starten)${NC}"
    echo ""
    echo -e "  ${RED}[0]${NC} Beenden"
    echo ""
    echo -n "Eingabe: "
    read -r choice

    case $choice in
        1)
            clear
            echo -e "${CYAN}═══ Quick Fix ═══${NC}"
            echo ""
            bash "$SCRIPT_DIR/quick-fix.sh"
            echo ""
            read -p "Drücke Enter um fortzufahren..."
            ;;
        2)
            clear
            echo -e "${CYAN}═══ Manueller Start ═══${NC}"
            echo ""
            bash "$SCRIPT_DIR/manual-start.sh"
            echo ""
            read -p "Drücke Enter um fortzufahren..."
            ;;
        3)
            clear
            echo -e "${CYAN}═══ Schritt-für-Schritt Debug ═══${NC}"
            echo ""
            bash "$SCRIPT_DIR/simple-debug.sh"
            echo ""
            read -p "Drücke Enter um fortzufahren..."
            ;;
        4)
            clear
            echo -e "${CYAN}═══ Log Analyse ═══${NC}"
            echo ""
            bash "$SCRIPT_DIR/show-real-error.sh"
            echo ""
            read -p "Drücke Enter um fortzufahren..."
            ;;
        5)
            clear
            echo -e "${CYAN}═══ Backend Tests ═══${NC}"
            echo ""
            bash "$SCRIPT_DIR/test-backend.sh"
            echo ""
            read -p "Drücke Enter um fortzufahren..."
            ;;
        [Ss])
            clear
            echo -e "${CYAN}═══ Service Status ═══${NC}"
            echo ""
            systemctl status fmsv-backend --no-pager -l
            echo ""
            echo -e "${CYAN}═══ Port Check ═══${NC}"
            PORT=$(grep "^PORT=" /var/www/fmsv-dingden/backend/.env 2>/dev/null | cut -d'=' -f2 | tr -d ' ')
            if [ -z "$PORT" ]; then
                PORT="5000"
            fi
            if netstat -tuln 2>/dev/null | grep -q ":$PORT "; then
                echo -e "${GREEN}✓ Port $PORT ist offen${NC}"
            else
                echo -e "${RED}✗ Port $PORT ist NICHT offen${NC}"
            fi
            echo ""
            echo -e "${CYAN}═══ HTTP Check ═══${NC}"
            HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/api/health 2>/dev/null)
            if [ "$HTTP_CODE" == "200" ]; then
                echo -e "${GREEN}✓ Backend antwortet (HTTP $HTTP_CODE)${NC}"
                curl -s http://localhost:$PORT/api/health | jq . 2>/dev/null || curl -s http://localhost:$PORT/api/health
            else
                echo -e "${RED}✗ Backend antwortet nicht (HTTP $HTTP_CODE)${NC}"
            fi
            echo ""
            read -p "Drücke Enter um fortzufahren..."
            ;;
        [Ll])
            clear
            echo -e "${CYAN}═══ Live Logs (Strg+C zum Beenden) ═══${NC}"
            echo ""
            journalctl -u fmsv-backend -f
            ;;
        [Rr])
            clear
            echo -e "${CYAN}═══ Service Restart ═══${NC}"
            echo ""
            echo "Stoppe Service..."
            systemctl stop fmsv-backend
            sleep 2
            echo "Starte Service..."
            systemctl start fmsv-backend
            sleep 2
            echo ""
            systemctl status fmsv-backend --no-pager | head -n 15
            echo ""
            read -p "Drücke Enter um fortzufahren..."
            ;;
        0)
            clear
            echo -e "${GREEN}Auf Wiedersehen!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Ungültige Eingabe${NC}"
            sleep 1
            ;;
    esac
done
