#!/bin/bash

################################################################################
# FMSV Dingden - Development Setup Script
# Einmalige Einrichtung der Development-Umgebung
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
echo -e "${CYAN}║      FMSV Dingden - Development Setup                 ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verzeichnisse
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_DIR/backend"

echo -e "${CYAN}Dieses Script richtet deine lokale Development-Umgebung ein.${NC}"
echo ""

# Schritt 1: Node.js prüfen
echo -e "${BLUE}[1/6]${NC} Prüfe Node.js..."

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js nicht gefunden!${NC}"
    echo ""
    echo -e "${CYAN}Bitte installiere Node.js LTS:${NC}"
    echo -e "  • https://nodejs.org/"
    echo -e "  • Oder mit nvm: https://github.com/nvm-sh/nvm"
    echo ""
    exit 1
fi

NODE_VERSION=$(node --version)
echo -e "${GREEN}✓${NC} Node.js ${NODE_VERSION}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm nicht gefunden!${NC}"
    exit 1
fi

NPM_VERSION=$(npm --version)
echo -e "${GREEN}✓${NC} npm ${NPM_VERSION}"

# Schritt 2: Dependencies installieren
echo ""
echo -e "${BLUE}[2/6]${NC} Installiere Dependencies..."

echo -e "${CYAN}   Frontend Dependencies...${NC}"
cd "$PROJECT_DIR"
if npm install > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Frontend Dependencies installiert"
else
    echo -e "${RED}❌ Fehler bei Frontend Dependencies${NC}"
    exit 1
fi

echo -e "${CYAN}   Backend Dependencies...${NC}"
cd "$BACKEND_DIR"
if npm install > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend Dependencies installiert"
else
    echo -e "${RED}❌ Fehler bei Backend Dependencies${NC}"
    exit 1
fi

# Schritt 3: Environment Variables
echo ""
echo -e "${BLUE}[3/6]${NC} Erstelle Environment Variables..."

# Frontend .env
if [ ! -f "$PROJECT_DIR/.env" ]; then
    cp "$SCRIPT_DIR/.env.frontend.example" "$PROJECT_DIR/.env"
    echo -e "${GREEN}✓${NC} Frontend .env erstellt"
else
    echo -e "${YELLOW}⚠️${NC} Frontend .env existiert bereits (überspringe)"
fi

# Backend .env
if [ ! -f "$BACKEND_DIR/.env" ]; then
    cp "$SCRIPT_DIR/.env.backend.example" "$BACKEND_DIR/.env"
    echo -e "${GREEN}✓${NC} Backend .env erstellt"
    echo -e "${YELLOW}   WICHTIG: Datenbank-Zugangsdaten anpassen!${NC}"
else
    echo -e "${YELLOW}⚠️${NC} Backend .env existiert bereits (überspringe)"
fi

# Schritt 4: Datenbank Setup
echo ""
echo -e "${BLUE}[4/6]${NC} Datenbank Setup..."
echo ""
echo -e "Wähle eine Option:"
echo -e "  ${GREEN}1)${NC} Docker Compose (empfohlen - einfach)"
echo -e "  ${GREEN}2)${NC} Lokales PostgreSQL (fortgeschritten)"
echo -e "  ${GREEN}3)${NC} Überspringen (später manuell)"
echo ""
read -p "Deine Wahl (1-3): " -n 1 -r DB_CHOICE
echo
echo ""

case $DB_CHOICE in
    1)
        # Docker Compose
        if ! command -v docker &> /dev/null; then
            echo -e "${RED}❌ Docker nicht gefunden!${NC}"
            echo ""
            echo -e "${CYAN}Bitte installiere Docker:${NC}"
            echo -e "  • https://docs.docker.com/get-docker/"
            echo ""
            exit 1
        fi
        
        if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
            echo -e "${RED}❌ Docker Compose nicht gefunden!${NC}"
            exit 1
        fi
        
        echo -e "${CYAN}Starte Docker Compose...${NC}"
        cd "$SCRIPT_DIR"
        
        if docker-compose up -d 2>&1 | grep -q "Creating"; then
            echo -e "${GREEN}✓${NC} Docker Compose gestartet"
        else
            docker compose up -d
            echo -e "${GREEN}✓${NC} Docker Compose gestartet"
        fi
        
        echo ""
        echo -e "${CYAN}Warte auf Datenbank...${NC}"
        sleep 5
        
        echo -e "${GREEN}✓${NC} PostgreSQL läuft auf Port 5432"
        echo -e "${GREEN}✓${NC} pgAdmin läuft auf http://localhost:8080"
        echo ""
        echo -e "${CYAN}pgAdmin Login:${NC}"
        echo -e "  E-Mail: ${BLUE}dev@pgadmin.local${NC}"
        echo -e "  Passwort: ${BLUE}dev123${NC}"
        echo ""
        ;;
    
    2)
        # Lokales PostgreSQL
        if ! command -v psql &> /dev/null; then
            echo -e "${RED}❌ PostgreSQL nicht gefunden!${NC}"
            echo ""
            echo -e "${CYAN}Installation:${NC}"
            echo -e "  • Ubuntu/Debian: ${BLUE}sudo apt-get install postgresql${NC}"
            echo -e "  • macOS: ${BLUE}brew install postgresql@14${NC}"
            echo -e "  • Windows: https://www.postgresql.org/download/windows/"
            echo ""
            exit 1
        fi
        
        echo -e "${CYAN}PostgreSQL gefunden${NC}"
        echo ""
        echo -e "${YELLOW}Bitte führe manuell aus:${NC}"
        echo ""
        echo -e "  ${BLUE}sudo -u postgres psql${NC}"
        echo ""
        echo -e "  ${CYAN}CREATE DATABASE fmsv_dev;${NC}"
        echo -e "  ${CYAN}CREATE USER fmsv_dev_user WITH PASSWORD 'dev123';${NC}"
        echo -e "  ${CYAN}GRANT ALL PRIVILEGES ON DATABASE fmsv_dev TO fmsv_dev_user;${NC}"
        echo -e "  ${CYAN}\\q${NC}"
        echo ""
        read -p "Drücke Enter wenn fertig..."
        echo ""
        echo -e "${GREEN}✓${NC} Datenbank manuell eingerichtet"
        ;;
    
    3)
        echo -e "${YELLOW}⚠️${NC} Datenbank-Setup übersprungen"
        echo -e "${CYAN}   Du musst später manuell eine Datenbank einrichten${NC}"
        ;;
    
    *)
        echo -e "${RED}❌ Ungültige Auswahl${NC}"
        exit 1
        ;;
esac

# Schritt 5: Datenbank initialisieren
if [ "$DB_CHOICE" != "3" ]; then
    echo ""
    echo -e "${BLUE}[5/6]${NC} Initialisiere Datenbank..."
    
    read -p "Datenbank-Schema jetzt erstellen? (j/n) " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Jj]$ ]]; then
        cd "$BACKEND_DIR"
        
        echo -e "${CYAN}   Erstelle Tabellen...${NC}"
        if npm run init-db 2>&1 | tail -5; then
            echo -e "${GREEN}✓${NC} Datenbank-Schema erstellt"
        else
            echo -e "${YELLOW}⚠️${NC} Fehler beim Erstellen des Schemas"
            echo -e "${CYAN}   Du kannst dies später manuell machen: ${BLUE}cd backend && npm run init-db${NC}"
        fi
        
        echo ""
        read -p "Test-Daten einfügen? (j/n) " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Jj]$ ]]; then
            echo -e "${CYAN}   Füge Test-Daten ein...${NC}"
            if npm run seed 2>&1 | tail -5; then
                echo -e "${GREEN}✓${NC} Test-Daten eingefügt"
            else
                echo -e "${YELLOW}⚠️${NC} Fehler beim Einfügen der Test-Daten"
            fi
        fi
    fi
else
    echo ""
    echo -e "${BLUE}[5/6]${NC} Datenbank-Initialisierung übersprungen"
fi

# Schritt 6: Zusammenfassung
echo ""
echo -e "${BLUE}[6/6]${NC} Setup abgeschlossen!"
echo ""

echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          ✅ Development Setup Complete! ✅             ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${CYAN}🚀 Nächste Schritte:${NC}"
echo ""
echo -e "${GREEN}1.${NC} Development Server starten:"
echo -e "   ${BLUE}./start.sh${NC}"
echo ""
echo -e "${GREEN}2.${NC} Browser öffnet sich automatisch auf:"
echo -e "   ${BLUE}http://localhost:5173${NC}"
echo ""
echo -e "${GREEN}3.${NC} Test-Login (Offline-Modus):"
echo -e "   E-Mail: ${BLUE}dev@admin${NC}"
echo -e "   Passwort: ${BLUE}(egal)${NC}"
echo ""

if [ "$DB_CHOICE" == "1" ]; then
    echo -e "${CYAN}📊 Datenbank-Verwaltung:${NC}"
    echo -e "   pgAdmin: ${BLUE}http://localhost:8080${NC}"
    echo -e "   Login: ${BLUE}dev@pgadmin.local${NC} / ${BLUE}dev123${NC}"
    echo ""
fi

echo -e "${CYAN}📚 Dokumentation:${NC}"
echo -e "   ${BLUE}dev/README.md${NC} - Development Guide"
echo -e "   ${BLUE}backend/README.md${NC} - Backend API Docs"
echo ""

echo -e "${YELLOW}💡 Tipps:${NC}"
echo -e "   • Hot Reload ist aktiviert (Änderungen werden automatisch geladen)"
echo -e "   • Logs: ${BLUE}tail -f ../backend-dev.log${NC} & ${BLUE}tail -f ../frontend-dev.log${NC}"
echo -e "   • Stoppen: ${BLUE}Ctrl+C${NC} im start.sh Terminal"
echo ""

echo -e "${GREEN}Happy Coding! 🎉${NC}"
echo ""
