#!/bin/bash

################################################################################
# FMSV Backend Test & Diagnose Script
################################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║          FMSV Backend Test & Diagnose                     ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

################################################################################
# 1. Service Status
################################################################################

echo -e "${YELLOW}━━━ 1. Service Status ━━━${NC}"
echo ""

if systemctl is-active --quiet fmsv-backend; then
    echo -e "  ${GREEN}✓${NC} Backend Service läuft"
else
    echo -e "  ${RED}✗${NC} Backend Service läuft NICHT"
    echo -e "    ${YELLOW}→ Start mit: ${GREEN}systemctl start fmsv-backend${NC}"
fi

echo ""

################################################################################
# 2. Port Check
################################################################################

echo -e "${YELLOW}━━━ 2. Port Check ━━━${NC}"
echo ""

if netstat -tulpn 2>/dev/null | grep -q ':3000 '; then
    echo -e "  ${GREEN}✓${NC} Port 3000 ist offen"
    PROCESS=$(netstat -tulpn 2>/dev/null | grep ':3000 ' | head -1)
    echo -e "    ${CYAN}$PROCESS${NC}"
else
    echo -e "  ${RED}✗${NC} Port 3000 ist NICHT offen"
    echo -e "    ${YELLOW}→ Backend läuft möglicherweise nicht${NC}"
fi

echo ""

################################################################################
# 3. API Erreichbarkeit
################################################################################

echo -e "${YELLOW}━━━ 3. API Erreichbarkeit ━━━${NC}"
echo ""

# Health Check
if curl -s -f http://localhost:3000/api/health > /dev/null 2>&1; then
    HEALTH=$(curl -s http://localhost:3000/api/health)
    echo -e "  ${GREEN}✓${NC} API Health Check erfolgreich"
    echo -e "    ${CYAN}Response: $HEALTH${NC}"
else
    echo -e "  ${RED}✗${NC} API Health Check fehlgeschlagen"
    
    # Versuche 127.0.0.1
    if curl -s -f http://127.0.0.1:3000/api/health > /dev/null 2>&1; then
        echo -e "  ${YELLOW}→ API über 127.0.0.1 erreichbar${NC}"
    else
        echo -e "  ${RED}→ API ist nicht erreichbar${NC}"
    fi
fi

echo ""

################################################################################
# 4. Environment Check
################################################################################

echo -e "${YELLOW}━━━ 4. Environment Check ━━━${NC}"
echo ""

if [ -f "/var/www/fmsv-dingden/backend/.env" ]; then
    echo -e "  ${GREEN}✓${NC} .env Datei existiert"
    
    # Prüfe wichtige Variablen
    source /var/www/fmsv-dingden/backend/.env 2>/dev/null
    
    if [ -n "$PORT" ]; then
        echo -e "    ${CYAN}PORT: $PORT${NC}"
    else
        echo -e "    ${YELLOW}⚠ PORT nicht gesetzt${NC}"
    fi
    
    if [ -n "$DB_HOST" ]; then
        echo -e "    ${CYAN}DB_HOST: $DB_HOST${NC}"
    else
        echo -e "    ${YELLOW}⚠ DB_HOST nicht gesetzt${NC}"
    fi
    
    if [ -n "$NODE_ENV" ]; then
        echo -e "    ${CYAN}NODE_ENV: $NODE_ENV${NC}"
    else
        echo -e "    ${YELLOW}⚠ NODE_ENV nicht gesetzt${NC}"
    fi
else
    echo -e "  ${RED}✗${NC} .env Datei fehlt"
    echo -e "    ${YELLOW}→ Erstelle .env mit: cd /var/www/fmsv-dingden/backend && cp env.example.txt .env${NC}"
fi

echo ""

################################################################################
# 5. Database Connection
################################################################################

echo -e "${YELLOW}━━━ 5. Database Connection ━━━${NC}"
echo ""

if [ -f "/var/www/fmsv-dingden/backend/.env" ]; then
    source /var/www/fmsv-dingden/backend/.env
    
    # Test PostgreSQL Connection
    if su - postgres -c "psql -d $DB_NAME -c 'SELECT 1;'" > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓${NC} Datenbank-Verbindung erfolgreich"
        echo -e "    ${CYAN}Datenbank: $DB_NAME${NC}"
    else
        echo -e "  ${RED}✗${NC} Datenbank-Verbindung fehlgeschlagen"
        echo -e "    ${YELLOW}→ Prüfe Credentials in .env${NC}"
        echo -e "    ${YELLOW}→ Prüfe ob Datenbank existiert: ${GREEN}su - postgres -c 'psql -l'${NC}"
    fi
else
    echo -e "  ${YELLOW}⚠${NC} Kann Datenbank nicht testen (.env fehlt)"
fi

echo ""

################################################################################
# 6. Logs Check
################################################################################

echo -e "${YELLOW}━━━ 6. Logs Check (letzte 10 Zeilen) ━━━${NC}"
echo ""

if journalctl -u fmsv-backend -n 10 --no-pager 2>/dev/null | grep -q .; then
    echo -e "${CYAN}Backend Logs:${NC}"
    journalctl -u fmsv-backend -n 10 --no-pager 2>/dev/null
else
    echo -e "  ${YELLOW}⚠${NC} Keine Logs verfügbar"
fi

echo ""

################################################################################
# 7. Network Test
################################################################################

echo -e "${YELLOW}━━━ 7. Network Test ━━━${NC}"
echo ""

# Test mit curl
echo -e "${CYAN}Testing with curl...${NC}"
CURL_RESULT=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health 2>&1)

if [ "$CURL_RESULT" = "200" ]; then
    echo -e "  ${GREEN}✓${NC} HTTP 200 OK"
elif [ "$CURL_RESULT" = "000" ]; then
    echo -e "  ${RED}✗${NC} Connection failed (Backend läuft nicht oder Port blockiert)"
else
    echo -e "  ${YELLOW}⚠${NC} HTTP $CURL_RESULT"
fi

echo ""

################################################################################
# 8. Nginx Proxy Check
################################################################################

echo -e "${YELLOW}━━━ 8. Nginx Proxy Check ━━━${NC}"
echo ""

if [ -f "/etc/nginx/sites-enabled/fmsv-dingden" ]; then
    echo -e "  ${GREEN}✓${NC} Nginx Config existiert"
    
    # Prüfe ob /api/ Proxy konfiguriert ist
    if grep -q "location /api/" /etc/nginx/sites-enabled/fmsv-dingden; then
        echo -e "  ${GREEN}✓${NC} /api/ Proxy ist konfiguriert"
        
        # Zeige Proxy-Konfiguration
        echo -e "    ${CYAN}Proxy Target:${NC}"
        grep -A 2 "location /api/" /etc/nginx/sites-enabled/fmsv-dingden | grep proxy_pass | sed 's/^/      /'
    else
        echo -e "  ${YELLOW}⚠${NC} /api/ Proxy ist NICHT konfiguriert"
        echo -e "    ${YELLOW}→ API ist nur über Port 3000 erreichbar${NC}"
    fi
else
    echo -e "  ${RED}✗${NC} Nginx Config fehlt"
fi

echo ""

################################################################################
# 9. Firewall Check
################################################################################

echo -e "${YELLOW}━━━ 9. Firewall Check ━━━${NC}"
echo ""

if command -v ufw &> /dev/null; then
    if ufw status | grep -q "3000.*ALLOW"; then
        echo -e "  ${GREEN}✓${NC} Port 3000 ist in Firewall erlaubt"
    else
        echo -e "  ${YELLOW}⚠${NC} Port 3000 ist NICHT in Firewall erlaubt"
        echo -e "    ${YELLOW}→ Öffne Port mit: ${GREEN}ufw allow 3000/tcp${NC}"
    fi
else
    echo -e "  ${CYAN}ℹ${NC} UFW nicht installiert"
fi

echo ""

################################################################################
# Summary & Actions
################################################################################

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                    Empfohlene Aktionen                     ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Determine issues and suggest actions
ISSUES_FOUND=0

if ! systemctl is-active --quiet fmsv-backend; then
    echo -e "  ${RED}1.${NC} Backend Service starten:"
    echo -e "     ${GREEN}systemctl start fmsv-backend${NC}"
    echo ""
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

if ! netstat -tulpn 2>/dev/null | grep -q ':3000 '; then
    echo -e "  ${RED}2.${NC} Port 3000 ist nicht offen - Service-Logs prüfen:"
    echo -e "     ${GREEN}journalctl -u fmsv-backend -n 50${NC}"
    echo ""
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

if ! curl -s -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "  ${RED}3.${NC} API nicht erreichbar - Backend neu starten:"
    echo -e "     ${GREEN}systemctl restart fmsv-backend${NC}"
    echo -e "     ${GREEN}journalctl -u fmsv-backend -f${NC}"
    echo ""
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "  ${GREEN}✓${NC} Keine Probleme gefunden - Backend läuft korrekt!"
    echo ""
    echo -e "  ${CYAN}Test-Befehle:${NC}"
    echo -e "    ${GREEN}curl http://localhost:3000/api/health${NC}"
    echo -e "    ${GREEN}curl http://localhost/api/health${NC}"
else
    echo -e "  ${YELLOW}Gefundene Probleme: $ISSUES_FOUND${NC}"
fi

echo ""
echo -e "${CYAN}Weitere Hilfe:${NC}"
echo -e "  ${GREEN}fmsv-debug${NC}   - Vollständige System-Diagnose"
echo -e "  ${GREEN}fmsv-fix${NC}     - Automatische Problembehebung"
echo -e "  ${GREEN}fmsv-errors${NC}  - Zeige Backend-Fehler"
echo ""
