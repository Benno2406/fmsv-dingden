#!/bin/bash

################################################################################
# FMSV Dingden - Development Server Starter
# Startet Frontend (Vite) und Backend (Node.js) für lokale Entwicklung
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

# Verzeichnisse
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_DIR/backend"

echo -e "${BLUE}📁 Projekt-Verzeichnis:${NC} $PROJECT_DIR"
echo ""

# Prüfe ob wir in dev/ sind
if [ "$(basename "$SCRIPT_DIR")" != "dev" ]; then
    echo -e "${RED}❌ Fehler: Dieses Script muss aus dem 'dev/' Verzeichnis ausgeführt werden${NC}"
    echo ""
    echo -e "${CYAN}Richtig:${NC}"
    echo -e "  cd dev"
    echo -e "  ./start.sh"
    echo ""
    exit 1
fi

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
    if [ -f "$SCRIPT_DIR/.env.backend.example" ]; then
        read -p "   Aus .env.backend.example erstellen? (j/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Jj]$ ]]; then
            cp "$SCRIPT_DIR/.env.backend.example" "$BACKEND_DIR/.env"
            echo -e "${GREEN}✓${NC} Backend .env erstellt"
            echo -e "${CYAN}   Bitte prüfen: nano $BACKEND_DIR/.env${NC}"
            read -p "   Drücke Enter wenn fertig..." -r
        fi
    elif [ -f "$BACKEND_DIR/env.example.txt" ]; then
        read -p "   Aus env.example.txt erstellen? (j/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Jj]$ ]]; then
            cp "$BACKEND_DIR/env.example.txt" "$BACKEND_DIR/.env"
            echo -e "${GREEN}✓${NC} Backend .env erstellt"
            echo -e "${CYAN}   WICHTIG: Für Development anpassen!${NC}"
            echo -e "${CYAN}   Bearbeite: nano $BACKEND_DIR/.env${NC}"
            read -p "   Drücke Enter wenn fertig..." -r
        fi
    fi
else
    echo -e "${GREEN}✓${NC} Backend .env vorhanden"
fi

if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo -e "${YELLOW}⚠️  Frontend .env nicht vorhanden${NC}"
    if [ -f "$SCRIPT_DIR/.env.frontend.example" ]; then
        read -p "   Aus .env.frontend.example erstellen? (j/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Jj]$ ]]; then
            cp "$SCRIPT_DIR/.env.frontend.example" "$PROJECT_DIR/.env"
            echo -e "${GREEN}✓${NC} Frontend .env erstellt"
        fi
    else
        read -p "   Standard .env erstellen? (j/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Jj]$ ]]; then
            cat > "$PROJECT_DIR/.env" << 'EOF'
# Frontend Environment Variables (Development)
VITE_API_URL=http://localhost:3000/api
EOF
            echo -e "${GREEN}✓${NC} Frontend .env erstellt"
        fi
    fi
else
    echo -e "${GREEN}✓${NC} Frontend .env vorhanden"
fi

# Prüfe Datenbank
echo ""
echo -e "${BLUE}[3/5]${NC} Prüfe Datenbank..."

if command -v psql &> /dev/null; then
    # PostgreSQL installiert
    if systemctl is-active --quiet postgresql 2>/dev/null || pg_isready &>/dev/null; then
        echo -e "${GREEN}✓${NC} PostgreSQL läuft"
    else
        echo -e "${YELLOW}⚠️  PostgreSQL läuft nicht${NC}"
        echo ""
        echo -e "  ${CYAN}Optionen:${NC}"
        echo -e "  1. PostgreSQL starten: ${BLUE}sudo systemctl start postgresql${NC}"
        echo -e "  2. Docker verwenden: ${BLUE}cd dev && docker-compose up -d${NC}"
        echo ""
        read -p "Trotzdem fortfahren? (j/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Jj]$ ]]; then
            exit 1
        fi
    fi
elif command -v docker-compose &> /dev/null || command -v docker &> /dev/null; then
    # Docker verfügbar
    if [ -f "$SCRIPT_DIR/docker-compose.yml" ]; then
        if docker-compose -f "$SCRIPT_DIR/docker-compose.yml" ps | grep -q "Up"; then
            echo -e "${GREEN}✓${NC} PostgreSQL (Docker) läuft"
        else
            echo -e "${YELLOW}⚠️  PostgreSQL (Docker) läuft nicht${NC}"
            read -p "   Docker Compose starten? (j/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Jj]$ ]]; then
                cd "$SCRIPT_DIR"
                docker-compose up -d
                echo -e "${GREEN}✓${NC} Docker Compose gestartet"
            fi
        fi
    else
        echo -e "${YELLOW}⚠️  docker-compose.yml nicht gefunden${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Keine Datenbank gefunden (PostgreSQL oder Docker)${NC}"
    echo ""
    echo -e "  ${CYAN}Hinweis:${NC}"
    echo -e "  Du kannst trotzdem entwickeln (Frontend-Only)"
    echo -e "  Für Backend-Entwicklung installiere PostgreSQL oder Docker"
    echo ""
fi

# Prüfe Ports
echo ""
echo -e "${BLUE}[4/5]${NC} Prüfe Ports..."

if netstat -tuln 2>/dev/null | grep -q ":3000" || lsof -ti:3000 &>/dev/null; then
    echo -e "${YELLOW}⚠️  Port 3000 bereits belegt!${NC}"
    if command -v lsof &> /dev/null; then
        lsof -ti:3000 | head -1 | xargs ps -p 2>/dev/null | tail -1
    fi
    read -p "   Prozess beenden und fortfahren? (j/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Jj]$ ]]; then
        if command -v lsof &> /dev/null; then
            kill -9 $(lsof -ti:3000) 2>/dev/null
            echo -e "${GREEN}✓${NC} Port 3000 freigegeben"
        fi
    else
        exit 1
    fi
else
    echo -e "${GREEN}✓${NC} Port 3000 ist frei"
fi

if netstat -tuln 2>/dev/null | grep -q ":5173" || lsof -ti:5173 &>/dev/null; then
    echo -e "${YELLOW}⚠️  Port 5173 bereits belegt!${NC}"
    if command -v lsof &> /dev/null; then
        lsof -ti:5173 | head -1 | xargs ps -p 2>/dev/null | tail -1
    fi
    read -p "   Prozess beenden und fortfahren? (j/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Jj]$ ]]; then
        if command -v lsof &> /dev/null; then
            kill -9 $(lsof -ti:5173) 2>/dev/null
            echo -e "${GREEN}✓${NC} Port 5173 freigegeben"
        fi
    else
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
    
    # Finde und killen alle node/vite Prozesse für dieses Projekt
    pkill -f "vite.*$PROJECT_DIR" 2>/dev/null
    pkill -f "node.*$BACKEND_DIR" 2>/dev/null
    
    echo ""
    echo -e "${CYAN}👋 Development Environment gestoppt${NC}"
    echo ""
    echo -e "${BLUE}💡 Tipp:${NC} Datenbank läuft weiter (Docker/PostgreSQL)"
    echo -e "   Stoppen mit: ${CYAN}docker-compose down${NC} (im dev/ Verzeichnis)"
    echo ""
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
    echo ""
    echo -e "${CYAN}💡 Tipps:${NC}"
    echo -e "  • Prüfe Datenbank-Verbindung in backend/.env"
    echo -e "  • Vollständige Logs: ${BLUE}tail -f backend-dev.log${NC}"
    echo ""
    exit 1
fi

# Teste Backend
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend läuft (PID: $BACKEND_PID)"
else
    echo -e "${YELLOW}⚠️${NC} Backend gestartet, aber /api/health antwortet nicht"
    echo -e "   ${CYAN}Hinweis:${NC} Datenbank-Verbindung könnte fehlen"
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
echo -e "${CYAN}💡 Features:${NC}"
echo -e "   ${GREEN}►${NC} Hot Reload aktiviert (Änderungen werden automatisch geladen)"
echo -e "   ${GREEN}►${NC} Offline-Modus: Login mit ${BLUE}dev@admin${NC} (ohne Backend)"
echo -e "   ${GREEN}►${NC} API-Proxy: ${BLUE}/api${NC} → ${BLUE}http://localhost:3000/api${NC}"
echo ""
echo -e "${CYAN}⌨️  Befehle:${NC}"
echo -e "   ${GREEN}Ctrl+C${NC}   - Beide Server stoppen"
echo ""

# Öffne Browser (optional)
if command -v xdg-open &> /dev/null; then
    read -p "Browser öffnen? (j/n) " -n 1 -r -t 5
    echo
    if [[ $REPLY =~ ^[Jj]$ ]]; then
        xdg-open http://localhost:5173 2>/dev/null &
    fi
elif command -v open &> /dev/null; then
    read -p "Browser öffnen? (j/n) " -n 1 -r -t 5
    echo
    if [[ $REPLY =~ ^[Jj]$ ]]; then
        open http://localhost:5173 2>/dev/null &
    fi
fi

echo -e "${YELLOW}🔄 Server laufen... (Ctrl+C zum Beenden)${NC}"
echo ""

# Warte auf Signals
wait
