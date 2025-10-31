#!/bin/bash

################################################################################
# FMSV Dingden - Development Environment Starter
# Startet Backend und Frontend gleichzeitig
################################################################################

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Header
clear
echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║      FMSV Dingden - Development Environment           ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Projekt-Verzeichnis
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"

# Prüfe ob node_modules existieren
echo -e "${BLUE}[1/5]${NC} Prüfe Dependencies..."

if [ ! -d "$PROJECT_DIR/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Frontend node_modules fehlen${NC}"
    read -p "   Jetzt installieren? (j/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Jj]$ ]]; then
        cd "$PROJECT_DIR"
        npm install
    else
        echo -e "${RED}❌ Abgebrochen${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓${NC} Frontend Dependencies OK"
fi

if [ ! -d "$BACKEND_DIR/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Backend node_modules fehlen${NC}"
    read -p "   Jetzt installieren? (j/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Jj]$ ]]; then
        cd "$BACKEND_DIR"
        npm install
    else
        echo -e "${RED}❌ Abgebrochen${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓${NC} Backend Dependencies OK"
fi

# Prüfe .env Dateien
echo ""
echo -e "${BLUE}[2/5]${NC} Prüfe Konfiguration..."

if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo -e "${YELLOW}⚠️  Backend .env fehlt${NC}"
    if [ -f "$BACKEND_DIR/env.example.txt" ]; then
        read -p "   Aus env.example.txt erstellen? (j/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Jj]$ ]]; then
            cp "$BACKEND_DIR/env.example.txt" "$BACKEND_DIR/.env"
            echo -e "${GREEN}✓${NC} .env erstellt - BITTE KONFIGURIEREN!"
            echo -e "${CYAN}   Bearbeite: nano $BACKEND_DIR/.env${NC}"
            read -p "   Drücke Enter wenn fertig..." -r
        fi
    fi
else
    echo -e "${GREEN}✓${NC} Backend .env vorhanden"
fi

if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo -e "${YELLOW}⚠️  Frontend .env nicht vorhanden (optional)${NC}"
    read -p "   Erstellen? (j/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Jj]$ ]]; then
        cat > "$PROJECT_DIR/.env" << 'EOF'
# Frontend Environment Variables
VITE_API_URL=http://localhost:3000/api
EOF
        echo -e "${GREEN}✓${NC} Frontend .env erstellt"
    fi
else
    echo -e "${GREEN}✓${NC} Frontend .env vorhanden"
fi

# Prüfe Datenbank
echo ""
echo -e "${BLUE}[3/5]${NC} Prüfe Datenbank-Verbindung..."

if command -v psql &> /dev/null; then
    if systemctl is-active --quiet postgresql; then
        echo -e "${GREEN}✓${NC} PostgreSQL läuft"
    else
        echo -e "${YELLOW}⚠️  PostgreSQL läuft nicht${NC}"
        read -p "   Jetzt starten? (j/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Jj]$ ]]; then
            sudo systemctl start postgresql
            echo -e "${GREEN}✓${NC} PostgreSQL gestartet"
        fi
    fi
else
    echo -e "${YELLOW}⚠️  PostgreSQL nicht installiert oder nicht im PATH${NC}"
fi

# Prüfe Ports
echo ""
echo -e "${BLUE}[4/5]${NC} Prüfe Ports..."

if netstat -tuln 2>/dev/null | grep -q ":3000"; then
    echo -e "${YELLOW}⚠️  Port 3000 bereits belegt!${NC}"
    netstat -tuln 2>/dev/null | grep ":3000"
    read -p "   Trotzdem fortfahren? (j/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Jj]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✓${NC} Port 3000 ist frei"
fi

if netstat -tuln 2>/dev/null | grep -q ":5173"; then
    echo -e "${YELLOW}⚠️  Port 5173 bereits belegt!${NC}"
    netstat -tuln 2>/dev/null | grep ":5173"
    read -p "   Trotzdem fortfahren? (j/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Jj]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✓${NC} Port 5173 ist frei"
fi

# Cleanup-Funktion
cleanup() {
    echo ""
    echo ""
    echo -e "${YELLOW}🛑 Stoppe Server...${NC}"
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo -e "${GREEN}✓${NC} Backend gestoppt"
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo -e "${GREEN}✓${NC} Frontend gestoppt"
    fi
    
    # Finde und killen alle node Prozesse für dieses Projekt
    pkill -f "vite.*$PROJECT_DIR" 2>/dev/null
    pkill -f "node.*$BACKEND_DIR" 2>/dev/null
    
    echo ""
    echo -e "${CYAN}👋 Development Environment gestoppt${NC}"
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT SIGTERM

# Starte Backend
echo ""
echo -e "${BLUE}[5/5]${NC} Starte Server..."
echo ""

cd "$BACKEND_DIR"
echo -e "${CYAN}📦 Starting Backend...${NC}"
npm run dev > "$PROJECT_DIR/backend-dev.log" 2>&1 &
BACKEND_PID=$!

# Warte kurz
sleep 3

# Prüfe ob Backend läuft
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}❌ Backend konnte nicht gestartet werden!${NC}"
    echo ""
    echo -e "${YELLOW}Letzte Zeilen aus backend-dev.log:${NC}"
    tail -n 20 "$PROJECT_DIR/backend-dev.log"
    exit 1
fi

# Teste Backend
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend läuft (PID: $BACKEND_PID)"
else
    echo -e "${YELLOW}⚠️${NC} Backend gestartet, aber /api/health antwortet nicht"
fi

# Starte Frontend
cd "$PROJECT_DIR"
echo -e "${CYAN}🎨 Starting Frontend...${NC}"
npm run dev > "$PROJECT_DIR/frontend-dev.log" 2>&1 &
FRONTEND_PID=$!

# Warte kurz
sleep 3

# Prüfe ob Frontend läuft
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${RED}❌ Frontend konnte nicht gestartet werden!${NC}"
    echo ""
    echo -e "${YELLOW}Letzte Zeilen aus frontend-dev.log:${NC}"
    tail -n 20 "$PROJECT_DIR/frontend-dev.log"
    cleanup
    exit 1
fi

echo -e "${GREEN}✓${NC} Frontend läuft (PID: $FRONTEND_PID)"

# Erfolg!
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          ✅ Development Environment Ready! ✅          ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}🌐 URLs:${NC}"
echo -e "   ${GREEN}►${NC} Frontend: ${BLUE}http://localhost:5173${NC}"
echo -e "   ${GREEN}►${NC} Backend:  ${BLUE}http://localhost:3000${NC}"
echo -e "   ${GREEN}►${NC} API:      ${BLUE}http://localhost:3000/api/health${NC}"
echo ""
echo -e "${CYAN}📝 Logs:${NC}"
echo -e "   ${GREEN}►${NC} Backend:  ${YELLOW}tail -f $PROJECT_DIR/backend-dev.log${NC}"
echo -e "   ${GREEN}►${NC} Frontend: ${YELLOW}tail -f $PROJECT_DIR/frontend-dev.log${NC}"
echo ""
echo -e "${CYAN}⌨️  Befehle:${NC}"
echo -e "   ${GREEN}Ctrl+C${NC}   - Beide Server stoppen"
echo ""

# Öffne Browser (optional)
if command -v xdg-open &> /dev/null; then
    read -p "Browser öffnen? (j/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Jj]$ ]]; then
        xdg-open http://localhost:5173 2>/dev/null &
    fi
elif command -v open &> /dev/null; then
    read -p "Browser öffnen? (j/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Jj]$ ]]; then
        open http://localhost:5173 2>/dev/null &
    fi
fi

echo -e "${YELLOW}🔄 Server laufen... (Ctrl+C zum Beenden)${NC}"
echo ""

# Warte auf Signals
wait
