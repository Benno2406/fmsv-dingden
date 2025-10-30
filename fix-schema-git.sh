#!/bin/bash

################################################################################
# FMSV Dingden - Fix schema.sql in Git
# Fügt schema.sql zum Git-Index hinzu (force)
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

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     FMSV Dingden - schema.sql zu Git hinzufügen           ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Prüfe ob schema.sql existiert
if [ ! -f "backend/database/schema.sql" ]; then
    echo -e "${RED}❌ schema.sql nicht gefunden!${NC}"
    echo ""
    echo "Datei existiert nicht: backend/database/schema.sql"
    exit 1
fi

echo -e "${BLUE}Prüfe .gitignore...${NC}"

# Prüfe ob .gitignore korrekt ist
if [ -f ".gitignore" ]; then
    if grep -q "!backend/database/schema.sql" .gitignore; then
        echo -e "  ${GREEN}✓ .gitignore hat Exception für schema.sql${NC}"
    else
        echo -e "  ${RED}✗ .gitignore fehlt Exception!${NC}"
        echo ""
        echo "Füge Exception hinzu..."
        
        # Finde die Zeile mit *.sql
        if grep -q "^\*.sql" .gitignore; then
            # Füge Exception nach *.sql hinzu
            sed -i '/^\*.sql/a !backend/database/schema.sql' .gitignore
            echo -e "  ${GREEN}✓ Exception hinzugefügt${NC}"
        else
            echo -e "  ${YELLOW}⚠ *.sql nicht in .gitignore gefunden${NC}"
            echo ""
            echo "Füge beides hinzu..."
            echo -e "\n# SQL Dumps - ABER schema.sql behalten!" >> .gitignore
            echo "*.sql" >> .gitignore
            echo "!backend/database/schema.sql" >> .gitignore
            echo -e "  ${GREEN}✓ Regeln hinzugefügt${NC}"
        fi
    fi
elif [ -f "gitignore.txt" ]; then
    echo -e "  ${YELLOW}⚠ .gitignore heißt noch gitignore.txt${NC}"
    echo ""
    echo "Benenne um..."
    mv gitignore.txt .gitignore
    echo -e "  ${GREEN}✓ Umbenannt zu .gitignore${NC}"
else
    echo -e "  ${RED}✗ Keine .gitignore gefunden!${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Entferne schema.sql aus Git-Cache (falls vorhanden)...${NC}"

# Entferne aus Cache (ignoriere Fehler wenn nicht im Cache)
git rm --cached backend/database/schema.sql 2>/dev/null
echo -e "  ${GREEN}✓ Cache bereinigt${NC}"

echo ""
echo -e "${BLUE}Füge schema.sql zum Git hinzu (force)...${NC}"

# Force add
git add -f backend/database/schema.sql

if [ $? -eq 0 ]; then
    echo -e "  ${GREEN}✓ schema.sql erfolgreich hinzugefügt${NC}"
else
    echo -e "  ${RED}✗ Fehler beim Hinzufügen${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Prüfe Git-Status...${NC}"
echo ""

# Zeige Status
git status backend/database/schema.sql

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Fertig!${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}Nächste Schritte:${NC}"
echo ""
echo "1. Commit erstellen:"
echo -e "   ${CYAN}git commit -m \"fix: schema.sql zu Repository hinzugefügt\"${NC}"
echo ""
echo "2. Zum Repository pushen:"
echo -e "   ${CYAN}git push${NC}"
echo ""
echo "3. Nach erneutem Klonen wird schema.sql jetzt mitgeladen!"
echo ""
