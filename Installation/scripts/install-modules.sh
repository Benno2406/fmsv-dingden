#!/bin/bash

################################################################################
# Installiert Backend Dependencies (node_modules)
################################################################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

clear
echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║         FMSV Backend - Dependencies Installation         ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

BACKEND_DIR="/var/www/fmsv-dingden/backend"

if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}❌ Backend-Verzeichnis nicht gefunden: $BACKEND_DIR${NC}"
    exit 1
fi

cd "$BACKEND_DIR" || exit 1

echo -e "${YELLOW}📂 Verzeichnis: $(pwd)${NC}"
echo ""

# Prüfe ob package.json existiert
if [ ! -f package.json ]; then
    echo -e "${RED}❌ package.json nicht gefunden!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ package.json gefunden${NC}"
echo ""

# Zeige Dependencies die installiert werden
echo -e "${CYAN}📦 Dependencies aus package.json:${NC}"
cat package.json | grep -A 50 '"dependencies"' | grep -v '^{' | grep -v '^}' | grep ':' | head -n 20
echo ""

# Entferne alte node_modules falls vorhanden
if [ -d node_modules ]; then
    echo -e "${YELLOW}⚠️  Alte node_modules gefunden${NC}"
    read -p "Alte node_modules entfernen? (j/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Jj]$ ]]; then
        echo -e "${YELLOW}Entferne alte node_modules...${NC}"
        rm -rf node_modules package-lock.json
        echo -e "${GREEN}✓ Entfernt${NC}"
    fi
    echo ""
fi

# Installiere Dependencies
echo -e "${CYAN}🔨 Starte npm install...${NC}"
echo -e "${YELLOW}(Das kann 2-5 Minuten dauern)${NC}"
echo ""

npm install

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║              ✅ Installation erfolgreich!                 ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Zeige installierte Module
    echo -e "${CYAN}📊 Installierte Packages:${NC}"
    ls node_modules | wc -l | xargs echo "  Anzahl:"
    echo ""
    
    # Prüfe wichtige Module
    echo -e "${CYAN}🔍 Wichtige Module:${NC}"
    for MODULE in express dotenv pg winston helmet cors compression; do
        if [ -d "node_modules/$MODULE" ]; then
            echo -e "  ${GREEN}✓${NC} $MODULE"
        else
            echo -e "  ${RED}✗${NC} $MODULE ${YELLOW}(fehlt!)${NC}"
        fi
    done
    echo ""
    
    # Teste Imports
    echo -e "${CYAN}🧪 Teste Imports...${NC}"
    cat > /tmp/test-imports.mjs << 'ENDTEST'
try {
    await import('dotenv');
    await import('express');
    await import('pg');
    await import('winston');
    console.log('✅ Alle wichtigen Module laden korrekt!');
    process.exit(0);
} catch (error) {
    console.error('❌ Import-Fehler:', error.message);
    process.exit(1);
}
ENDTEST
    
    if node /tmp/test-imports.mjs; then
        echo ""
        echo -e "${GREEN}✅ Module können geladen werden!${NC}"
    else
        echo ""
        echo -e "${RED}❌ Module können NICHT geladen werden${NC}"
    fi
    rm -f /tmp/test-imports.mjs
    
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}🚀 Nächste Schritte:${NC}"
    echo ""
    echo -e "  ${CYAN}1.${NC} .env konfigurieren (falls noch nicht geschehen):"
    echo -e "     ${GREEN}cd $BACKEND_DIR${NC}"
    echo -e "     ${GREEN}cp env.example.txt .env${NC}"
    echo -e "     ${GREEN}nano .env${NC}"
    echo ""
    echo -e "  ${CYAN}2.${NC} Backend starten:"
    echo -e "     ${GREEN}systemctl restart fmsv-backend${NC}"
    echo ""
    echo -e "  ${CYAN}3.${NC} Status prüfen:"
    echo -e "     ${GREEN}systemctl status fmsv-backend${NC}"
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    
else
    echo ""
    echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║              ❌ Installation fehlgeschlagen!              ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Mögliche Ursachen:${NC}"
    echo -e "  • Keine Internet-Verbindung"
    echo -e "  • package.json ist fehlerhaft"
    echo -e "  • npm ist nicht installiert"
    echo -e "  • Keine Schreibrechte"
    echo ""
    echo -e "${CYAN}Prüfe:${NC}"
    echo -e "  ${GREEN}npm --version${NC}"
    echo -e "  ${GREEN}node --version${NC}"
    echo -e "  ${GREEN}ping -c 3 registry.npmjs.org${NC}"
    echo ""
    exit 1
fi
