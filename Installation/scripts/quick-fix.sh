#!/bin/bash

################################################################################
# QUICK FIX - Findet und behebt häufigste Backend-Probleme
################################################################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Bitte als root ausführen: sudo $0${NC}"
    exit 1
fi

clear
echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║         FMSV Backend - Quick Fix & Diagnosis              ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

BACKEND_DIR="/var/www/fmsv-dingden/backend"
FIXED=0

cd "$BACKEND_DIR" || {
    echo -e "${RED}❌ Backend-Verzeichnis nicht gefunden!${NC}"
    exit 1
}

echo -e "${YELLOW}🔍 Prüfe häufigste Probleme...${NC}"
echo ""

# Check 1: .env
echo -e "${CYAN}[1/6] .env Datei...${NC}"
if [ ! -f .env ]; then
    echo -e "${RED}  ✗ .env fehlt!${NC}"
    if [ -f env.example.txt ]; then
        echo -e "${YELLOW}  → Erstelle .env aus Vorlage...${NC}"
        cp env.example.txt .env
        echo -e "${GREEN}  ✓ .env erstellt - BITTE AUSFÜLLEN!${NC}"
        echo ""
        echo -e "${YELLOW}  WICHTIG: Öffne jetzt .env und fülle alle Werte aus:${NC}"
        echo -e "${CYAN}    nano .env${NC}"
        echo ""
        read -p "  Drücke Enter wenn .env ausgefüllt ist..."
        FIXED=1
    else
        echo -e "${RED}  ✗ env.example.txt nicht gefunden!${NC}"
    fi
else
    echo -e "${GREEN}  ✓ .env existiert${NC}"
    
    # Prüfe wichtige Variablen
    MISSING=""
    for VAR in DB_HOST DB_PORT DB_NAME DB_USER DB_PASSWORD JWT_SECRET; do
        VALUE=$(grep "^$VAR=" .env | cut -d'=' -f2 | tr -d ' ' | tr -d '"' | tr -d "'")
        if [ -z "$VALUE" ]; then
            MISSING="$MISSING $VAR"
        fi
    done
    
    if [ -n "$MISSING" ]; then
        echo -e "${RED}  ✗ Fehlende Werte:$MISSING${NC}"
        echo -e "${YELLOW}  → Öffne .env und ergänze die Werte${NC}"
        FIXED=1
    fi
fi
echo ""

# Check 2: PostgreSQL
echo -e "${CYAN}[2/6] PostgreSQL Service...${NC}"
if systemctl is-active --quiet postgresql; then
    echo -e "${GREEN}  ✓ PostgreSQL läuft${NC}"
else
    echo -e "${RED}  ✗ PostgreSQL läuft nicht${NC}"
    echo -e "${YELLOW}  → Starte PostgreSQL...${NC}"
    systemctl start postgresql
    sleep 2
    if systemctl is-active --quiet postgresql; then
        echo -e "${GREEN}  ✓ PostgreSQL gestartet${NC}"
        FIXED=1
    else
        echo -e "${RED}  ✗ PostgreSQL konnte nicht gestartet werden${NC}"
    fi
fi
echo ""

# Check 3: Datenbank
echo -e "${CYAN}[3/6] Datenbank...${NC}"
if [ -f .env ]; then
    DB_NAME=$(grep "^DB_NAME=" .env | cut -d'=' -f2 | tr -d ' ' | tr -d '"' | tr -d "'")
    DB_USER=$(grep "^DB_USER=" .env | cut -d'=' -f2 | tr -d ' ' | tr -d '"' | tr -d "'")
    
    if [ -n "$DB_NAME" ]; then
        if su - postgres -c "psql -d $DB_NAME -c 'SELECT 1;'" > /dev/null 2>&1; then
            echo -e "${GREEN}  ✓ Datenbank $DB_NAME erreichbar${NC}"
        else
            echo -e "${RED}  ✗ Datenbank $DB_NAME nicht erreichbar${NC}"
            echo -e "${YELLOW}  → Mögliche Lösung:${NC}"
            echo -e "${CYAN}    sudo -u postgres psql${NC}"
            echo -e "${CYAN}    CREATE DATABASE $DB_NAME;${NC}"
            echo -e "${CYAN}    CREATE USER $DB_USER WITH PASSWORD 'dein-passwort';${NC}"
            echo -e "${CYAN}    GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;${NC}"
            FIXED=1
        fi
    fi
fi
echo ""

# Check 4: node_modules
echo -e "${CYAN}[4/6] Dependencies...${NC}"
if [ ! -d node_modules ]; then
    echo -e "${RED}  ✗ node_modules fehlen${NC}"
    echo -e "${YELLOW}  → Installiere Dependencies (dauert 1-2 Minuten)...${NC}"
    npm install > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}  ✓ Dependencies installiert${NC}"
        FIXED=1
    else
        echo -e "${RED}  ✗ npm install fehlgeschlagen${NC}"
    fi
else
    echo -e "${GREEN}  ✓ node_modules vorhanden${NC}"
fi
echo ""

# Check 5: Port
echo -e "${CYAN}[5/6] Port...${NC}"
PORT=$(grep "^PORT=" .env 2>/dev/null | cut -d'=' -f2 | tr -d ' ' | tr -d '"' | tr -d "'")
if [ -z "$PORT" ]; then
    PORT="5000"
fi

if netstat -tuln 2>/dev/null | grep -q ":$PORT "; then
    echo -e "${YELLOW}  ⚠ Port $PORT ist bereits belegt${NC}"
    PID=$(netstat -tulpn 2>/dev/null | grep ":$PORT " | awk '{print $7}' | cut -d'/' -f1)
    if [ -n "$PID" ]; then
        PROCESS=$(ps -p $PID -o comm= 2>/dev/null)
        echo -e "${YELLOW}  → Prozess: $PROCESS (PID: $PID)${NC}"
        if [[ "$PROCESS" == "node" ]]; then
            echo -e "${YELLOW}  → Das ist wahrscheinlich ein alter Node-Prozess${NC}"
            read -p "  Soll ich ihn beenden? (j/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Jj]$ ]]; then
                kill $PID
                sleep 2
                echo -e "${GREEN}  ✓ Prozess beendet${NC}"
                FIXED=1
            fi
        fi
    fi
else
    echo -e "${GREEN}  ✓ Port $PORT ist frei${NC}"
fi
echo ""

# Check 6: Manueller Start-Test
echo -e "${CYAN}[6/6] Server-Start-Test...${NC}"
echo -e "${YELLOW}  → Stoppe Service...${NC}"
systemctl stop fmsv-backend > /dev/null 2>&1
sleep 2

echo -e "${YELLOW}  → Teste manuellen Start (5 Sekunden)...${NC}"
timeout 5s node server.js > /tmp/backend-test.log 2>&1 &
TEST_PID=$!
sleep 5

if ps -p $TEST_PID > /dev/null 2>&1; then
    echo -e "${GREEN}  ✓ Server startet erfolgreich!${NC}"
    kill $TEST_PID 2>/dev/null
else
    echo -e "${RED}  ✗ Server crashed beim Start${NC}"
    echo ""
    echo -e "${YELLOW}  Fehlerausgabe:${NC}"
    cat /tmp/backend-test.log | head -n 20
    echo ""
    echo -e "${YELLOW}  → Zeige vollständige Ausgabe mit:${NC}"
    echo -e "${CYAN}    cat /tmp/backend-test.log${NC}"
fi
rm -f /tmp/backend-test.log

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"

if [ $FIXED -eq 1 ]; then
    echo -e "${YELLOW}⚠  Probleme gefunden und behoben!${NC}"
    echo ""
    echo -e "${CYAN}Starte Backend-Service...${NC}"
    systemctl restart fmsv-backend
    sleep 3
    
    if systemctl is-active --quiet fmsv-backend; then
        echo -e "${GREEN}✅ Backend-Service läuft!${NC}"
        
        # Teste HTTP
        sleep 2
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/api/health 2>/dev/null)
        if [ "$HTTP_CODE" == "200" ]; then
            echo -e "${GREEN}✅ Backend antwortet auf Port $PORT!${NC}"
            echo ""
            echo -e "${GREEN}🎉 ALLES FUNKTIONIERT! 🎉${NC}"
        else
            echo -e "${YELLOW}⚠  Service läuft, aber Port antwortet nicht${NC}"
            echo -e "${CYAN}Prüfe Logs: journalctl -u fmsv-backend -n 50${NC}"
        fi
    else
        echo -e "${RED}❌ Service konnte nicht gestartet werden${NC}"
        echo ""
        echo -e "${YELLOW}Zeige Logs:${NC}"
        journalctl -u fmsv-backend -n 20 --no-pager
    fi
else
    echo -e "${GREEN}✓ Keine offensichtlichen Probleme gefunden${NC}"
    echo ""
    echo -e "${YELLOW}Für detaillierte Diagnose:${NC}"
    echo -e "${CYAN}  ./manual-start.sh${NC}"
fi

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
