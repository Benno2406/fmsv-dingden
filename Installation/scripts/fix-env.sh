#!/bin/bash

################################################################################
# FMSV Dingden - .env Syntax Fixer
################################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║           FMSV .env Syntax-Fehler Behebung                    ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Zu /backend wechseln
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/../../backend" && pwd)"

cd "$BACKEND_DIR" || exit 1

echo -e "${YELLOW}Aktuelles Verzeichnis:${NC} $BACKEND_DIR"
echo ""

# Check ob .env existiert
if [ ! -f ".env" ]; then
    echo -e "${RED}✗ .env Datei nicht gefunden!${NC}"
    echo ""
    echo "Erstelle .env aus env.example.txt..."
    
    if [ -f "env.example.txt" ]; then
        cp env.example.txt .env
        echo -e "${GREEN}✓ .env erstellt${NC}"
    else
        echo -e "${RED}✗ env.example.txt nicht gefunden!${NC}"
        exit 1
    fi
fi

echo -e "${CYAN}Zeige Zeile 20 der .env Datei:${NC}"
echo ""
sed -n '20p' .env
echo ""

# Prüfe Zeile 20
LINE_20=$(sed -n '20p' .env)

if echo "$LINE_20" | grep -q "Dingden"; then
    echo -e "${YELLOW}⚠ Problem gefunden in Zeile 20!${NC}"
    echo ""
    echo -e "Zeile enthält: ${RED}$LINE_20${NC}"
    echo ""
    echo "Bash kann Kommentare nach Werten nicht verarbeiten."
    echo ""
    echo -e "${YELLOW}Möchtest du das automatisch fixen?${NC}"
    echo ""
    echo "Optionen:"
    echo -e "  ${GREEN}1${NC}) PORT=3000 setzen (ohne Kommentar)"
    echo -e "  ${GREEN}2${NC}) Zeile manuell bearbeiten"
    echo -e "  ${GREEN}3${NC}) Abbrechen"
    echo ""
    read -p "Auswahl [1-3]: " CHOICE
    echo ""
    
    case $CHOICE in
        1)
            # Ersetze Zeile 20 mit sauberem PORT=3000
            sed -i '20s/.*/PORT=3000/' .env
            echo -e "${GREEN}✓ Zeile 20 auf PORT=3000 gesetzt${NC}"
            echo ""
            echo -e "${CYAN}Neue Zeile 20:${NC}"
            sed -n '20p' .env
            ;;
        2)
            echo -e "${YELLOW}Öffne die Datei mit:${NC}"
            echo -e "  ${CYAN}nano $BACKEND_DIR/.env${NC}"
            echo ""
            echo "Ändere Zeile 20 zu:"
            echo -e "  ${GREEN}PORT=3000${NC}"
            echo ""
            echo "(Kommentare MÜSSEN in einer eigenen Zeile stehen!)"
            exit 0
            ;;
        *)
            echo "Abgebrochen."
            exit 0
            ;;
    esac
fi

# Prüfe weitere häufige Fehler
echo ""
echo -e "${CYAN}Prüfe .env auf weitere Syntax-Fehler...${NC}"
echo ""

# Test ob .env sourcebar ist
if bash -n .env 2>/dev/null; then
    echo -e "${GREEN}✓ .env Syntax ist korrekt${NC}"
else
    echo -e "${RED}✗ .env hat Syntax-Fehler!${NC}"
    echo ""
    echo "Zeige Fehler:"
    bash -n .env
    echo ""
    echo -e "${YELLOW}Häufige Fehler:${NC}"
    echo "  - Kommentare nach Werten (falsch: PORT=3000 # Kommentar)"
    echo "  - Fehlende Anführungszeichen bei Werten mit Leerzeichen"
    echo "  - Sonderzeichen ohne Escaping"
    echo ""
    echo -e "${CYAN}Tipp:${NC} Öffne .env mit: nano $BACKEND_DIR/.env"
fi

echo ""
echo -e "${CYAN}Zeige komplette .env (ohne Secrets):${NC}"
echo ""
echo "─────────────────────────────────────────────────────────────"

# Zeige .env aber verstecke Passwörter
while IFS= read -r line; do
    if echo "$line" | grep -qiE "(PASSWORD|SECRET|PASS)="; then
        KEY=$(echo "$line" | cut -d= -f1)
        echo "$KEY=***versteckt***"
    elif [ -z "$line" ] || echo "$line" | grep -q "^#"; then
        echo "$line"
    else
        echo "$line"
    fi
done < .env

echo "─────────────────────────────────────────────────────────────"
echo ""

echo -e "${GREEN}✓ Fertig!${NC}"
echo ""
echo "Nächste Schritte:"
echo -e "  ${CYAN}1.${NC} Backend neu starten: sudo systemctl restart fmsv-backend"
echo -e "  ${CYAN}2.${NC} Debug ausführen: sudo ./debug.sh"
echo ""
