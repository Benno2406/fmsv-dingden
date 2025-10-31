#!/bin/bash

# ============================================
# Backend Diagnose Script
# Findet heraus, warum Backend nicht läuft
# ============================================

echo "🔍 FMSV Backend Diagnose"
echo "══════════════════════════════════════════════════════════"
echo ""

# Farben
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Node.js Version
echo "1️⃣  Node.js Version prüfen..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "   ${GREEN}✅${NC} Node.js installiert: $NODE_VERSION"
else
    echo -e "   ${RED}❌${NC} Node.js NICHT installiert!"
    exit 1
fi
echo ""

# 2. npm Version
echo "2️⃣  npm Version prüfen..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "   ${GREEN}✅${NC} npm installiert: v$NPM_VERSION"
else
    echo -e "   ${RED}❌${NC} npm NICHT installiert!"
    exit 1
fi
echo ""

# 3. Dependencies
echo "3️⃣  Dependencies prüfen..."
if [ -d "node_modules" ]; then
    echo -e "   ${GREEN}✅${NC} node_modules vorhanden"
    
    # Wichtige Packages prüfen
    REQUIRED_PACKAGES=(
        "express"
        "pg"
        "bcrypt"
        "jsonwebtoken"
        "helmet"
        "cors"
        "dotenv"
        "winston"
        "speakeasy"
        "multer"
    )
    
    for pkg in "${REQUIRED_PACKAGES[@]}"; do
        if [ -d "node_modules/$pkg" ]; then
            echo -e "      ${GREEN}✓${NC} $pkg"
        else
            echo -e "      ${RED}✗${NC} $pkg ${YELLOW}FEHLT!${NC}"
        fi
    done
else
    echo -e "   ${RED}❌${NC} node_modules fehlt! Führe aus: npm install"
    exit 1
fi
echo ""

# 4. .env Datei
echo "4️⃣  Environment Variables prüfen..."
if [ -f ".env" ]; then
    echo -e "   ${GREEN}✅${NC} .env Datei vorhanden"
    
    # Wichtige Variablen prüfen
    source .env 2>/dev/null
    
    [ -n "$DB_HOST" ] && echo -e "      ${GREEN}✓${NC} DB_HOST: $DB_HOST" || echo -e "      ${RED}✗${NC} DB_HOST fehlt"
    [ -n "$DB_PORT" ] && echo -e "      ${GREEN}✓${NC} DB_PORT: $DB_PORT" || echo -e "      ${RED}✗${NC} DB_PORT fehlt"
    [ -n "$DB_NAME" ] && echo -e "      ${GREEN}✓${NC} DB_NAME: $DB_NAME" || echo -e "      ${RED}✗${NC} DB_NAME fehlt"
    [ -n "$DB_USER" ] && echo -e "      ${GREEN}✓${NC} DB_USER: $DB_USER" || echo -e "      ${RED}✗${NC} DB_USER fehlt"
    [ -n "$DB_PASSWORD" ] && echo -e "      ${GREEN}✓${NC} DB_PASSWORD: [***]" || echo -e "      ${RED}✗${NC} DB_PASSWORD fehlt"
    [ -n "$JWT_SECRET" ] && echo -e "      ${GREEN}✓${NC} JWT_SECRET: [***]" || echo -e "      ${RED}✗${NC} JWT_SECRET fehlt"
else
    echo -e "   ${RED}❌${NC} .env Datei fehlt!"
    echo "      Erstelle eine .env Datei basierend auf env.example.txt"
    exit 1
fi
echo ""

# 5. PostgreSQL Verbindung
echo "5️⃣  PostgreSQL Verbindung testen..."
if command -v psql &> /dev/null; then
    echo -e "   ${GREEN}✅${NC} psql verfügbar"
    
    source .env 2>/dev/null
    
    # Test connection
    if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" &> /dev/null; then
        echo -e "   ${GREEN}✅${NC} Datenbank-Verbindung erfolgreich"
    else
        echo -e "   ${RED}❌${NC} Datenbank-Verbindung fehlgeschlagen!"
        echo "      Prüfe DB_* Variablen in .env"
    fi
else
    echo -e "   ${YELLOW}⚠${NC}  psql nicht verfügbar (optional)"
fi
echo ""

# 6. Port verfügbar?
echo "6️⃣  Port 3000 prüfen..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "   ${RED}❌${NC} Port 3000 ist bereits belegt!"
    echo "      Prozess:"
    lsof -i :3000 | tail -1
    echo ""
    echo "      Beenden mit:"
    echo "      kill -9 \$(lsof -t -i:3000)"
else
    echo -e "   ${GREEN}✅${NC} Port 3000 ist verfügbar"
fi
echo ""

# 7. Logs Verzeichnis
echo "7️⃣  Logs Verzeichnis prüfen..."
if [ -d "../Logs" ]; then
    echo -e "   ${GREEN}✅${NC} Logs Verzeichnis vorhanden"
    if [ -w "../Logs" ]; then
        echo -e "      ${GREEN}✓${NC} Schreibrechte OK"
    else
        echo -e "      ${RED}✗${NC} Keine Schreibrechte!"
    fi
else
    echo -e "   ${RED}❌${NC} Logs Verzeichnis fehlt!"
    echo "      Erstelle es mit: mkdir -p ../Logs/Audit"
fi
echo ""

# 8. Saves Verzeichnis
echo "8️⃣  Saves Verzeichnis prüfen..."
if [ -d "../Saves" ]; then
    echo -e "   ${GREEN}✅${NC} Saves Verzeichnis vorhanden"
    if [ -w "../Saves" ]; then
        echo -e "      ${GREEN}✓${NC} Schreibrechte OK"
    else
        echo -e "      ${RED}✗${NC} Keine Schreibrechte!"
    fi
else
    echo -e "   ${RED}❌${NC} Saves Verzeichnis fehlt!"
    echo "      Erstelle es mit: mkdir -p ../Saves"
fi
echo ""

# 9. Backend Module testen
echo "9️⃣  Backend Module testen..."
if node test-backend.js 2>&1 | grep -q "ALLE TESTS BESTANDEN"; then
    echo -e "   ${GREEN}✅${NC} Alle Module laden erfolgreich"
else
    echo -e "   ${RED}❌${NC} Fehler beim Laden der Module!"
    echo "      Führe aus: node test-backend.js"
    echo "      für Details"
fi
echo ""

# Zusammenfassung
echo "══════════════════════════════════════════════════════════"
echo "📊 ZUSAMMENFASSUNG"
echo "══════════════════════════════════════════════════════════"
echo ""

# Check ob alles OK ist
ALL_OK=true

# Node.js
command -v node &> /dev/null || ALL_OK=false

# Dependencies
[ ! -d "node_modules" ] && ALL_OK=false

# .env
[ ! -f ".env" ] && ALL_OK=false

# Datenbank (optional, aber empfohlen)
source .env 2>/dev/null
if command -v psql &> /dev/null; then
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" &> /dev/null || ALL_OK=false
fi

if [ "$ALL_OK" = true ]; then
    echo -e "${GREEN}✅ BACKEND SOLLTE STARTEN KÖNNEN!${NC}"
    echo ""
    echo "Starte Backend mit:"
    echo "  npm start"
    echo "  oder"
    echo "  node server.js"
    echo ""
else
    echo -e "${RED}❌ ES GIBT NOCH PROBLEME!${NC}"
    echo ""
    echo "Behebe die oben genannten Fehler und führe dann aus:"
    echo "  npm start"
    echo ""
fi

echo "══════════════════════════════════════════════════════════"
