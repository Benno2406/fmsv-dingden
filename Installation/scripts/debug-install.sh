#!/bin/bash

################################################################################
# FMSV Dingden - Installation Debug Script
# Prüft alle Voraussetzungen vor der Installation
################################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "=========================================="
echo "  FMSV Dingden - Installation Debug"
echo "=========================================="
echo ""

# 1. Root-Check
echo -n "1. Root-Rechte... "
if [ "$EUID" -eq 0 ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "   Bitte mit sudo ausführen!"
fi

# 2. Internet-Verbindung
echo -n "2. Internet-Verbindung... "
if ping -c 1 google.com &> /dev/null; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "   Keine Internet-Verbindung!"
fi

# 3. DNS-Auflösung
echo -n "3. DNS (github.com)... "
if nslookup github.com &> /dev/null; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "   DNS-Problem!"
fi

# 4. apt update Test
echo -n "4. apt update Test... "
if apt-get update -qq > /tmp/apt-test.log 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "   apt update fehlgeschlagen!"
    echo "   Fehler:"
    tail -n 5 /tmp/apt-test.log | sed 's/^/   /'
fi

# 5. Speicherplatz
echo -n "5. Freier Speicherplatz... "
AVAILABLE=$(df / | awk 'NR==2 {print $4}')
AVAILABLE_GB=$((AVAILABLE / 1024 / 1024))
if [ "$AVAILABLE" -gt 2097152 ]; then
    echo -e "${GREEN}✓ ${AVAILABLE_GB}GB${NC}"
else
    echo -e "${YELLOW}⚠ ${AVAILABLE_GB}GB (wenig!)${NC}"
fi

# 6. Debian Version
echo -n "6. Debian Version... "
DEBIAN_VERSION=$(cat /etc/debian_version 2>/dev/null || echo "unbekannt")
echo -e "${BLUE}$DEBIAN_VERSION${NC}"

# 7. Systemd
echo -n "7. systemd läuft... "
if pidof systemd &> /dev/null; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

# 8. curl vorhanden
echo -n "8. curl installiert... "
if command -v curl &> /dev/null; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "   Installiere: apt install curl"
fi

# 9. git vorhanden
echo -n "9. git installiert... "
if command -v git &> /dev/null; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "   Installiere: apt install git"
fi

# 10. Repository-Zugriff
echo -n "10. GitHub erreichbar... "
if curl -s --head https://github.com | head -n 1 | grep "HTTP/2 200" > /dev/null; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "    GitHub nicht erreichbar!"
fi

echo ""
echo "=========================================="
echo "  System-Informationen"
echo "=========================================="
echo ""

# System-Info
echo "Hostname:     $(hostname)"
echo "Betriebssystem: $(lsb_release -d 2>/dev/null | cut -f2 || echo "unbekannt")"
echo "Kernel:       $(uname -r)"
echo "CPU:          $(nproc) Cores"
echo "RAM:          $(free -h | awk 'NR==2 {print $2}')"
echo "Swap:         $(free -h | awk 'NR==3 {print $2}')"
echo ""

# Aktive Repositories
echo "=========================================="
echo "  APT Repositories"
echo "=========================================="
echo ""
grep -r "^deb " /etc/apt/sources.list /etc/apt/sources.list.d/ 2>/dev/null | head -n 5

echo ""
echo "=========================================="
echo "  Logs"
echo "=========================================="
echo ""

if [ -f /var/log/fmsv-install.log ]; then
    echo "Letzte Installations-Logs:"
    tail -n 10 /var/log/fmsv-install.log
else
    echo "Keine vorherigen Installations-Logs gefunden"
fi

echo ""
echo "=========================================="
echo ""

# Zusammenfassung
ERRORS=0

if [ "$EUID" -ne 0 ]; then ((ERRORS++)); fi
if ! ping -c 1 google.com &> /dev/null; then ((ERRORS++)); fi
if ! nslookup github.com &> /dev/null; then ((ERRORS++)); fi

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Alle Prüfungen bestanden!${NC}"
    echo ""
    echo "Installation kann gestartet werden:"
    echo "  ./install.sh"
else
    echo -e "${RED}❌ $ERRORS Problem(e) gefunden${NC}"
    echo ""
    echo "Bitte behebe die Probleme vor der Installation!"
fi

echo ""
