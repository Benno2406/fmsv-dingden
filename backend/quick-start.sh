#!/bin/bash

# ============================================
# FMSV Backend Quick Start
# Automatische Installation & Start
# ============================================

set -e  # Exit on error

# Farben
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════╗"
echo "║                                                        ║"
echo "║          FMSV Backend Quick Start                     ║"
echo "║                                                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# 1. Dependencies installieren
echo -e "${YELLOW}1️⃣  Dependencies installieren...${NC}"
if [ ! -d "node_modules" ]; then
    echo "   📦 npm install läuft..."
    npm install --quiet
    echo -e "   ${GREEN}✅${NC} Dependencies installiert"
else
    echo -e "   ${GREEN}✅${NC} Dependencies bereits vorhanden"
fi
echo ""

# 2. .env prüfen
echo -e "${YELLOW}2️⃣  Environment prüfen...${NC}"
if [ ! -f ".env" ]; then
    echo -e "   ${RED}❌${NC} .env Datei fehlt!"
    echo ""
    echo "   Erstelle .env Datei basierend auf env.example.txt..."
    cp env.example.txt .env
    echo ""
    echo -e "   ${YELLOW}⚠️  WICHTIG:${NC} Bitte .env Datei ausfüllen!"
    echo ""
    echo "   Benötigte Felder:"
    echo "   - DB_HOST (z.B. localhost)"
    echo "   - DB_PORT (z.B. 5432)"
    echo "   - DB_NAME (z.B. fmsv_database)"
    echo "   - DB_USER (z.B. fmsv_user)"
    echo "   - DB_PASSWORD (Datenbank-Passwort)"
    echo "   - JWT_SECRET (Langer zufälliger String)"
    echo "   - JWT_REFRESH_SECRET (Anderer langer String)"
    echo ""
    echo "   Öffne mit: nano .env"
    echo ""
    exit 1
else
    # Prüfe wichtige Variablen
    source .env 2>/dev/null
    
    MISSING=()
    [ -z "$DB_HOST" ] && MISSING+=("DB_HOST")
    [ -z "$DB_PORT" ] && MISSING+=("DB_PORT")
    [ -z "$DB_NAME" ] && MISSING+=("DB_NAME")
    [ -z "$DB_USER" ] && MISSING+=("DB_USER")
    [ -z "$DB_PASSWORD" ] && MISSING+=("DB_PASSWORD")
    [ -z "$JWT_SECRET" ] && MISSING+=("JWT_SECRET")
    [ -z "$JWT_REFRESH_SECRET" ] && MISSING+=("JWT_REFRESH_SECRET")
    
    if [ ${#MISSING[@]} -gt 0 ]; then
        echo -e "   ${RED}❌${NC} Fehlende Variablen in .env:"
        for var in "${MISSING[@]}"; do
            echo "      - $var"
        done
        echo ""
        echo "   Öffne mit: nano .env"
        exit 1
    fi
    
    echo -e "   ${GREEN}✅${NC} .env Datei OK"
fi
echo ""

# 3. PostgreSQL prüfen
echo -e "${YELLOW}3️⃣  PostgreSQL prüfen...${NC}"
if command -v psql &> /dev/null; then
    source .env
    if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "SELECT 1;" &> /dev/null; then
        echo -e "   ${GREEN}✅${NC} PostgreSQL erreichbar"
        
        # Prüfe ob Datenbank existiert
        if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" &> /dev/null; then
            echo -e "   ${GREEN}✅${NC} Datenbank $DB_NAME existiert"
        else
            echo -e "   ${YELLOW}⚠️${NC}  Datenbank $DB_NAME existiert nicht"
            echo "      Erstelle Datenbank..."
            
            # Versuche als postgres User zu erstellen
            if sudo -u postgres psql <<EOF > /dev/null 2>&1
CREATE DATABASE $DB_NAME;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
EOF
            then
                echo -e "   ${GREEN}✅${NC} Datenbank erstellt"
            else
                echo -e "   ${RED}❌${NC} Konnte Datenbank nicht erstellen"
                echo "      Bitte manuell erstellen:"
                echo "      sudo -u postgres createdb $DB_NAME"
                echo "      sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;\""
                exit 1
            fi
        fi
    else
        echo -e "   ${RED}❌${NC} PostgreSQL nicht erreichbar"
        echo "      Starte PostgreSQL mit:"
        echo "      sudo systemctl start postgresql"
        exit 1
    fi
else
    echo -e "   ${YELLOW}⚠️${NC}  psql nicht verfügbar (überspringe DB-Check)"
fi
echo ""

# 4. Datenbank initialisieren
echo -e "${YELLOW}4️⃣  Datenbank initialisieren...${NC}"
source .env
if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT COUNT(*) FROM users;" &> /dev/null; then
    echo -e "   ${GREEN}✅${NC} Datenbank bereits initialisiert"
else
    echo "   📊 Initialisiere Datenbank..."
    if node scripts/initDatabase.js; then
        echo -e "   ${GREEN}✅${NC} Datenbank initialisiert"
        
        # Test-Daten einfügen?
        echo ""
        read -p "   Test-Daten einfügen? (Admin + Member User) [y/N]: " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if node scripts/seedDatabase.js; then
                echo -e "   ${GREEN}✅${NC} Test-Daten eingefügt"
                echo ""
                echo "   📝 Login-Daten:"
                echo "      Admin:  admin@fmsv-dingden.de / admin123"
                echo "      Member: member@fmsv-dingden.de / member123"
            fi
        fi
    else
        echo -e "   ${RED}❌${NC} Datenbank-Initialisierung fehlgeschlagen"
        exit 1
    fi
fi
echo ""

# 5. Port prüfen
echo -e "${YELLOW}5️⃣  Port 3000 prüfen...${NC}"
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "   ${YELLOW}⚠️${NC}  Port 3000 ist bereits belegt"
    echo "      Beende bestehenden Prozess..."
    kill -9 $(lsof -t -i:3000) 2>/dev/null || true
    sleep 1
    echo -e "   ${GREEN}✅${NC} Port 3000 freigegeben"
else
    echo -e "   ${GREEN}✅${NC} Port 3000 verfügbar"
fi
echo ""

# 6. Module testen
echo -e "${YELLOW}6️⃣  Module testen...${NC}"
if node test-backend.js 2>&1 | grep -q "ALLE TESTS BESTANDEN"; then
    echo -e "   ${GREEN}✅${NC} Alle Module OK"
else
    echo -e "   ${RED}❌${NC} Module-Test fehlgeschlagen"
    echo "      Führe aus: node test-backend.js"
    exit 1
fi
echo ""

# 7. Backend starten
echo -e "${YELLOW}7️⃣  Backend starten...${NC}"
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                        ║${NC}"
echo -e "${GREEN}║  🚀 Backend wird gestartet...                         ║${NC}"
echo -e "${GREEN}║                                                        ║${NC}"
echo -e "${GREEN}║  Verfügbar unter: http://localhost:3000               ║${NC}"
echo -e "${GREEN}║  Health-Check:    http://localhost:3000/api/health    ║${NC}"
echo -e "${GREEN}║                                                        ║${NC}"
echo -e "${GREEN}║  Beenden mit: Strg+C                                  ║${NC}"
echo -e "${GREEN}║                                                        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Backend starten
node server.js
