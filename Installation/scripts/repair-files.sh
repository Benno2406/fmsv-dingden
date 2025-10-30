#!/bin/bash

################################################################################
# FMSV Dingden - Datei-Reparatur Script
# Stellt fehlende Dateien aus dem Repository wieder her
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
echo -e "${CYAN}║         FMSV Dingden - Datei-Reparatur                    ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Root check
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Bitte als root ausführen!${NC}"
    echo ""
    echo "Ausführen mit:"
    echo -e "  ${CYAN}sudo $0${NC}"
    echo ""
    exit 1
fi

INSTALL_DIR="/var/www/fmsv-dingden"

# Prüfe ob Installation existiert
if [ ! -d "$INSTALL_DIR" ]; then
    echo -e "${RED}❌ Installation nicht gefunden: $INSTALL_DIR${NC}"
    echo ""
    echo "Bitte führe zuerst die Installation durch:"
    echo -e "  ${CYAN}./install.sh${NC}"
    echo ""
    exit 1
fi

cd "$INSTALL_DIR" || exit 1

echo -e "${YELLOW}Analysiere fehlende Dateien...${NC}"
echo ""

MISSING=0
CRITICAL_FILES=(
    "backend/database/schema.sql"
    "backend/scripts/initDatabase.js"
    "backend/scripts/seedDatabase.js"
    "backend/server.js"
    "backend/config/database.js"
    "backend/package.json"
    "package.json"
)

echo -e "${BLUE}Prüfe kritische Dateien:${NC}"
echo ""

for file in "${CRITICAL_FILES[@]}"; do
    echo -n "  • $file... "
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗ FEHLT${NC}"
        ((MISSING++))
    fi
done

echo ""

if [ $MISSING -eq 0 ]; then
    echo -e "${GREEN}✅ Alle Dateien vorhanden!${NC}"
    echo ""
    exit 0
fi

echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${RED}❌ $MISSING Datei(en) fehlen!${NC}"
echo ""
echo -e "${YELLOW}Mögliche Ursachen:${NC}"
echo "  • Git-Clone war unvollständig"
echo "  • Dateien wurden versehentlich gelöscht"
echo "  • Repository ist beschädigt"
echo ""

# Git Status prüfen
echo -e "${BLUE}Git-Status:${NC}"
echo ""
git status --short 2>/dev/null || echo "Git nicht verfügbar"
echo ""

echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Reparatur-Optionen:${NC}"
echo ""
echo -e "  ${GREEN}[1]${NC} Git Pull ausführen (fehlende Dateien holen)"
echo -e "      ${CYAN}→ Versucht fehlende Dateien vom Repository zu holen${NC}"
echo ""
echo -e "  ${GREEN}[2]${NC} Git Reset (alle Dateien wiederherstellen)"
echo -e "      ${CYAN}→ Setzt alle Dateien auf Repository-Stand zurück${NC}"
echo -e "      ${YELLOW}⚠  Lokale Änderungen gehen verloren!${NC}"
echo ""
echo -e "  ${GREEN}[3]${NC} Komplette Neuinstallation"
echo -e "      ${CYAN}→ Löscht alles und installiert neu${NC}"
echo -e "      ${RED}⚠  Datenbank und Uploads bleiben erhalten${NC}"
echo ""
echo -e "  ${GREEN}[0]${NC} Abbrechen"
echo ""
echo -ne "${BLUE}►${NC} Deine Wahl: "
read CHOICE
echo ""

case $CHOICE in
    1)
        echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
        echo -e "${YELLOW}Git Pull ausführen...${NC}"
        echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
        echo ""
        
        # Hole aktuellen Branch
        CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
        
        echo "Aktueller Branch: $CURRENT_BRANCH"
        echo ""
        
        # Git Pull
        echo "Hole fehlende Dateien vom Repository..."
        if git pull origin "$CURRENT_BRANCH" 2>&1; then
            echo ""
            echo -e "${GREEN}✅ Git Pull erfolgreich${NC}"
            echo ""
            
            # Nochmal prüfen
            STILL_MISSING=0
            echo -e "${BLUE}Erneute Prüfung:${NC}"
            echo ""
            
            for file in "${CRITICAL_FILES[@]}"; do
                echo -n "  • $file... "
                if [ -f "$file" ]; then
                    echo -e "${GREEN}✓${NC}"
                else
                    echo -e "${RED}✗ FEHLT IMMER NOCH${NC}"
                    ((STILL_MISSING++))
                fi
            done
            
            echo ""
            
            if [ $STILL_MISSING -eq 0 ]; then
                echo -e "${GREEN}✅ Alle Dateien wiederhergestellt!${NC}"
                echo ""
                echo "Services neustarten:"
                echo -e "  ${CYAN}systemctl restart fmsv-backend${NC}"
            else
                echo -e "${YELLOW}⚠  $STILL_MISSING Datei(en) fehlen noch${NC}"
                echo ""
                echo "Versuche Option 2 (Git Reset) oder Option 3 (Neuinstallation)"
            fi
        else
            echo ""
            echo -e "${RED}❌ Git Pull fehlgeschlagen${NC}"
            echo ""
            echo "Versuche Option 2 oder 3"
        fi
        ;;
        
    2)
        echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
        echo -e "${YELLOW}Git Reset ausführen...${NC}"
        echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
        echo ""
        
        echo -e "${RED}⚠  WARNUNG: Alle lokalen Änderungen gehen verloren!${NC}"
        echo ""
        echo -ne "Wirklich fortfahren? (j/n): "
        read -n 1 -r
        echo ""
        
        if [[ ! $REPLY =~ ^[Jj]$ ]]; then
            echo "Abgebrochen."
            exit 0
        fi
        
        echo ""
        echo "Erstelle Backup der .env Datei..."
        [ -f backend/.env ] && cp backend/.env /tmp/fmsv-backup.env
        
        echo "Führe Git Reset aus..."
        git reset --hard HEAD
        
        echo "Stelle .env wieder her..."
        [ -f /tmp/fmsv-backup.env ] && cp /tmp/fmsv-backup.env backend/.env
        
        echo ""
        echo -e "${GREEN}✅ Git Reset abgeschlossen${NC}"
        echo ""
        
        # Prüfen
        STILL_MISSING=0
        for file in "${CRITICAL_FILES[@]}"; do
            [ ! -f "$file" ] && ((STILL_MISSING++))
        done
        
        if [ $STILL_MISSING -eq 0 ]; then
            echo -e "${GREEN}✅ Alle Dateien wiederhergestellt!${NC}"
            echo ""
            echo "Services neustarten:"
            echo -e "  ${CYAN}systemctl restart fmsv-backend${NC}"
        else
            echo -e "${RED}❌ Immer noch $STILL_MISSING Datei(en) fehlen${NC}"
            echo ""
            echo "Bitte führe eine Neuinstallation durch (Option 3)"
        fi
        ;;
        
    3)
        echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
        echo -e "${YELLOW}Neuinstallation vorbereiten...${NC}"
        echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
        echo ""
        
        echo -e "${RED}⚠  Dies löscht alle Code-Dateien!${NC}"
        echo -e "${GREEN}✅ Datenbank bleibt erhalten${NC}"
        echo -e "${GREEN}✅ Uploads bleiben erhalten${NC}"
        echo ""
        echo -ne "Wirklich fortfahren? (j/n): "
        read -n 1 -r
        echo ""
        
        if [[ ! $REPLY =~ ^[Jj]$ ]]; then
            echo "Abgebrochen."
            exit 0
        fi
        
        echo ""
        echo "Bitte führe die Installation manuell durch:"
        echo ""
        echo -e "  ${CYAN}1. Aktuelles Verzeichnis sichern:${NC}"
        echo -e "     ${BLUE}mv /var/www/fmsv-dingden /var/www/fmsv-dingden.backup${NC}"
        echo ""
        echo -e "  ${CYAN}2. Neu installieren:${NC}"
        echo -e "     ${BLUE}cd /var/www/fmsv-dingden/Installation/scripts${NC}"
        echo -e "     ${BLUE}./install.sh${NC}"
        echo ""
        ;;
        
    0)
        echo "Abgebrochen."
        exit 0
        ;;
        
    *)
        echo -e "${RED}Ungültige Auswahl${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""
