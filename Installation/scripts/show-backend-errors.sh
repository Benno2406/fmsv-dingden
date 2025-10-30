#!/bin/bash

################################################################################
# FMSV Dingden - Backend Error Viewer
# Zeigt die letzten Backend-Fehler aus allen Log-Quellen
################################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

clear

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║         FMSV Dingden - Backend Error Viewer               ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

BACKEND_DIR="/var/www/fmsv-dingden/backend"
LOGS_DIR="/var/www/fmsv-dingden/Logs"

echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}1. Systemd Service Logs (letzte 50 Zeilen)${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""

journalctl -u fmsv-backend -n 50 --no-pager

echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}2. Backend Error Log${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""

if [ -f "$LOGS_DIR/error.log" ]; then
    echo "Pfad: $LOGS_DIR/error.log"
    echo ""
    tail -n 30 "$LOGS_DIR/error.log"
else
    echo -e "${YELLOW}⚠  error.log existiert nicht${NC}"
fi

echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}3. Backend Combined Log${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""

if [ -f "$LOGS_DIR/combined.log" ]; then
    echo "Pfad: $LOGS_DIR/combined.log"
    echo ""
    tail -n 30 "$LOGS_DIR/combined.log"
else
    echo -e "${YELLOW}⚠  combined.log existiert nicht${NC}"
fi

echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}4. Manueller Start-Test (zeigt echte Fehler)${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""

if [ "$EUID" -eq 0 ]; then
    echo "Stoppe Service..."
    systemctl stop fmsv-backend
    sleep 2
    
    echo ""
    echo "Starte Backend manuell (Strg+C zum Beenden)..."
    echo ""
    echo -e "${CYAN}─────────── START OUTPUT ───────────${NC}"
    
    cd "$BACKEND_DIR" || exit 1
    
    # Timeout nach 10 Sekunden
    timeout 10s node server.js 2>&1 || {
        EXIT_CODE=$?
        echo ""
        echo -e "${CYAN}─────────── END OUTPUT ───────────${NC}"
        echo ""
        
        if [ $EXIT_CODE -eq 124 ]; then
            echo -e "${GREEN}✅ Server läuft! (Timeout erreicht ist OK)${NC}"
        else
            echo -e "${RED}❌ Server hat sich mit Exit Code $EXIT_CODE beendet${NC}"
        fi
        
        echo ""
        echo "Starte Service wieder..."
        systemctl start fmsv-backend
    }
else
    echo -e "${YELLOW}⚠  Nicht als root - kann manuellen Test nicht durchführen${NC}"
    echo ""
    echo "Führe aus:"
    echo -e "  ${CYAN}sudo bash $0${NC}"
fi

echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}5. .env Check${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""

if [ -f "$BACKEND_DIR/.env" ]; then
    echo -e "${GREEN}✅ .env existiert${NC}"
    echo ""
    echo "Konfigurierte Variablen (ohne Werte):"
    grep -v "^#" "$BACKEND_DIR/.env" | grep "=" | cut -d'=' -f1 | sed 's/^/  • /'
    echo ""
    
    # Prüfe wichtige Variablen
    echo "Wichtige Variablen:"
    for VAR in DB_HOST DB_PORT DB_NAME DB_USER DB_PASSWORD JWT_SECRET PORT; do
        VALUE=$(grep "^$VAR=" "$BACKEND_DIR/.env" | cut -d'=' -f2)
        if [ -n "$VALUE" ]; then
            if [ "$VAR" == "DB_PASSWORD" ] || [ "$VAR" == "JWT_SECRET" ]; then
                echo -e "  ${GREEN}✓${NC} $VAR: ${CYAN}[***gesetzt***]${NC}"
            else
                echo -e "  ${GREEN}✓${NC} $VAR: ${CYAN}$VALUE${NC}"
            fi
        else
            echo -e "  ${RED}✗${NC} $VAR: ${RED}NICHT GESETZT!${NC}"
        fi
    done
else
    echo -e "${RED}❌ .env existiert NICHT!${NC}"
    echo ""
    echo "Erstelle .env aus env.example.txt:"
    echo -e "  ${CYAN}cd $BACKEND_DIR${NC}"
    echo -e "  ${CYAN}cp env.example.txt .env${NC}"
    echo -e "  ${CYAN}nano .env${NC}"
fi

echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}6. Datenbank Status${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""

if systemctl is-active --quiet postgresql; then
    echo -e "${GREEN}✅ PostgreSQL läuft${NC}"
    
    if [ -f "$BACKEND_DIR/.env" ]; then
        DB_NAME=$(grep "^DB_NAME=" "$BACKEND_DIR/.env" | cut -d'=' -f2 | tr -d ' ')
        DB_USER=$(grep "^DB_USER=" "$BACKEND_DIR/.env" | cut -d'=' -f2 | tr -d ' ')
        
        if [ -n "$DB_NAME" ]; then
            echo ""
            echo "Teste Verbindung zu Datenbank: $DB_NAME"
            
            if su - postgres -c "psql -d $DB_NAME -c 'SELECT 1;'" > /dev/null 2>&1; then
                echo -e "${GREEN}✅ Verbindung erfolgreich${NC}"
            else
                echo -e "${RED}❌ Verbindung fehlgeschlagen${NC}"
                echo ""
                echo "Mögliche Ursachen:"
                echo "  • Datenbank existiert nicht"
                echo "  • Benutzer $DB_USER hat keine Rechte"
                echo "  • Falsches Passwort in .env"
            fi
        fi
    fi
else
    echo -e "${RED}❌ PostgreSQL läuft NICHT${NC}"
fi

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Analyse abgeschlossen${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""
