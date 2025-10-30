#!/bin/bash

################################################################################
# FMSV Dingden - Quick 500 Error Debug
# Schnelle Diagnose für 500 Internal Server Error
# Version: 1.0
################################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

clear

echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║         🚨 500 ERROR - SCHNELL-DIAGNOSE 🚨                ║${NC}"
echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Bitte als root ausführen: sudo $0${NC}"
    exit 1
fi

BACKEND_DIR="/var/www/fmsv-dingden/backend"
cd "$BACKEND_DIR" || exit 1

echo -e "${YELLOW}⚡ Blitz-Check der häufigsten Probleme...${NC}"
echo ""

ERRORS=0
WARNINGS=0

# =============================================================================
echo -ne "${BLUE}[1/10]${NC} Backend Service läuft...        "
if systemctl is-active --quiet fmsv-backend; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ FEHLER!${NC}"
    ((ERRORS++))
    echo "        → Service ist gestoppt!"
    echo "        → Starte mit: systemctl start fmsv-backend"
fi

# =============================================================================
echo -ne "${BLUE}[2/10]${NC} .env Datei existiert...         "
if [ -f .env ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ FEHLER!${NC}"
    ((ERRORS++))
    echo "        → .env Datei fehlt!"
fi

# =============================================================================
echo -ne "${BLUE}[3/10]${NC} JWT_SECRET gesetzt...           "
if [ -f .env ] && grep -q "^JWT_SECRET=" .env && [ -n "$(grep '^JWT_SECRET=' .env | cut -d'=' -f2)" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ FEHLER!${NC}"
    ((ERRORS++))
    echo "        → JWT_SECRET fehlt oder ist leer!"
fi

# =============================================================================
echo -ne "${BLUE}[4/10]${NC} DB Credentials gesetzt...       "
if [ -f .env ]; then
    DB_USER=$(grep "^DB_USER=" .env | cut -d'=' -f2)
    DB_PASS=$(grep "^DB_PASSWORD=" .env | cut -d'=' -f2)
    DB_NAME=$(grep "^DB_NAME=" .env | cut -d'=' -f2)
    
    if [ -n "$DB_USER" ] && [ -n "$DB_PASS" ] && [ -n "$DB_NAME" ]; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗ FEHLER!${NC}"
        ((ERRORS++))
        echo "        → Datenbank-Credentials unvollständig!"
    fi
else
    echo -e "${RED}✗${NC}"
    ((ERRORS++))
fi

# =============================================================================
echo -ne "${BLUE}[5/10]${NC} PostgreSQL läuft...             "
if systemctl is-active --quiet postgresql; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ FEHLER!${NC}"
    ((ERRORS++))
    echo "        → PostgreSQL ist gestoppt!"
fi

# =============================================================================
echo -ne "${BLUE}[6/10]${NC} Datenbank existiert...          "
if [ -n "$DB_NAME" ]; then
    if su - postgres -c "psql -lqt" 2>/dev/null | cut -d\| -f1 | grep -qw "$DB_NAME"; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗ FEHLER!${NC}"
        ((ERRORS++))
        echo "        → Datenbank '$DB_NAME' existiert nicht!"
    fi
else
    echo -e "${RED}✗${NC}"
    ((ERRORS++))
fi

# =============================================================================
echo -ne "${BLUE}[7/10]${NC} DB Tabellen vorhanden...        "
if [ -n "$DB_NAME" ]; then
    TABLES=$(su - postgres -c "psql -d $DB_NAME -t -c \"SELECT COUNT(*) FROM pg_tables WHERE schemaname='public';\"" 2>/dev/null | tr -d ' ')
    if [ "$TABLES" -gt 0 ] 2>/dev/null; then
        echo -e "${GREEN}✓ ($TABLES Tabellen)${NC}"
    else
        echo -e "${RED}✗ FEHLER!${NC}"
        ((ERRORS++))
        echo "        → Keine Tabellen! Schema nicht initialisiert!"
    fi
else
    echo -e "${RED}✗${NC}"
    ((ERRORS++))
fi

# =============================================================================
echo -ne "${BLUE}[8/10]${NC} Port ist offen...               "
PORT=$(grep "^PORT=" .env 2>/dev/null | cut -d'=' -f2 | tr -d ' ')
PORT=${PORT:-5000}

if netstat -tuln 2>/dev/null | grep -q ":$PORT "; then
    echo -e "${GREEN}✓ (Port $PORT)${NC}"
else
    echo -e "${RED}✗ FEHLER!${NC}"
    ((ERRORS++))
    echo "        → Port $PORT ist nicht offen!"
fi

# =============================================================================
echo -ne "${BLUE}[9/10]${NC} node_modules installiert...     "
if [ -d "node_modules" ] && [ -d "node_modules/express" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠ WARNUNG!${NC}"
    ((WARNINGS++))
    echo "        → Dependencies fehlen oder sind unvollständig"
fi

# =============================================================================
echo -ne "${BLUE}[10/10]${NC} Backend antwortet auf HTTP...  "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/api/health 2>/dev/null)

if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✓${NC}"
elif [ "$HTTP_CODE" == "500" ]; then
    echo -e "${RED}✗ 500 ERROR!${NC}"
    ((ERRORS++))
    echo "        → Backend läuft, aber wirft 500 Error!"
elif [ "$HTTP_CODE" == "000" ]; then
    echo -e "${RED}✗ KEINE VERBINDUNG!${NC}"
    ((ERRORS++))
    echo "        → Backend antwortet nicht!"
else
    echo -e "${YELLOW}⚠ Status: $HTTP_CODE${NC}"
    ((WARNINGS++))
fi

# =============================================================================
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ ALLES OK - KEINE FEHLER GEFUNDEN!${NC}"
    echo ""
    echo "Backend läuft einwandfrei auf Port $PORT"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠  $WARNINGS Warnung(en) - Backend sollte funktionieren${NC}"
else
    echo -e "${RED}❌ $ERRORS KRITISCHE FEHLER GEFUNDEN!${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}   + $WARNINGS Warnung(en)${NC}"
    fi
fi

echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Wenn Fehler, zeige die letzten Logs
if [ $ERRORS -gt 0 ]; then
    echo -e "${YELLOW}🔍 Letzte Backend-Logs (mögliche Fehlerursache):${NC}"
    echo -e "${CYAN}───────────────────────────────────────────────────────────${NC}"
    journalctl -u fmsv-backend -n 15 --no-pager | tail -n 15
    echo -e "${CYAN}───────────────────────────────────────────────────────────${NC}"
    echo ""
    
    echo -e "${YELLOW}💡 Empfohlene Maßnahmen:${NC}"
    echo ""
    
    # Spezifische Lösungen basierend auf Fehlern
    if ! systemctl is-active --quiet fmsv-backend; then
        echo -e "  ${BLUE}1.${NC} Service starten:"
        echo -e "     ${CYAN}systemctl start fmsv-backend${NC}"
        echo ""
    fi
    
    if [ ! -f .env ] || [ -z "$(grep '^JWT_SECRET=' .env 2>/dev/null | cut -d'=' -f2)" ]; then
        echo -e "  ${BLUE}2.${NC} .env neu erstellen:"
        echo -e "     ${CYAN}cd /var/www/fmsv-dingden/Installation/scripts${NC}"
        echo -e "     ${CYAN}./debug.sh${NC} → Option [2] → Quick-Fix"
        echo ""
    fi
    
    if ! su - postgres -c "psql -lqt" 2>/dev/null | cut -d\| -f1 | grep -qw "$DB_NAME" 2>/dev/null; then
        echo -e "  ${BLUE}3.${NC} Datenbank neu erstellen:"
        echo -e "     ${CYAN}cd $BACKEND_DIR${NC}"
        echo -e "     ${CYAN}node scripts/initDatabase.js${NC}"
        echo ""
    fi
    
    if [ ! -d "node_modules" ]; then
        echo -e "  ${BLUE}4.${NC} Dependencies installieren:"
        echo -e "     ${CYAN}cd $BACKEND_DIR && npm install${NC}"
        echo ""
    fi
    
    echo -e "  ${BLUE}5.${NC} Live-Logs ansehen:"
    echo -e "     ${CYAN}journalctl -u fmsv-backend -f${NC}"
    echo -e "     (mit Strg+C beenden)"
    echo ""
    
    echo -e "  ${BLUE}6.${NC} Vollständigen Test durchführen:"
    echo -e "     ${CYAN}cd /var/www/fmsv-dingden/Installation/scripts${NC}"
    echo -e "     ${CYAN}./test-backend.sh${NC}"
    echo ""
fi

echo ""
