#!/bin/bash

################################################################################
# FMSV Quick Fix Script - Automatische Problembehebung
################################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Logging
LOG_FILE="/var/log/fmsv-quickfix.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

clear
echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║           FMSV Quick Fix - Automatische Reparatur         ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

log "Quick Fix gestartet"

################################################################################
# 1. Backend Service Check & Restart
################################################################################

echo -e "${YELLOW}━━━ 1. Backend Service ━━━${NC}"

if systemctl is-active --quiet fmsv-backend; then
    echo -e "  ${GREEN}✓${NC} Backend läuft"
else
    echo -e "  ${YELLOW}⚠${NC} Backend läuft nicht - starte neu..."
    systemctl restart fmsv-backend
    sleep 3
    
    if systemctl is-active --quiet fmsv-backend; then
        echo -e "  ${GREEN}✓${NC} Backend erfolgreich gestartet"
        log "Backend neu gestartet - erfolgreich"
    else
        echo -e "  ${RED}✗${NC} Backend konnte nicht gestartet werden"
        log "Backend Neustart fehlgeschlagen"
    fi
fi

################################################################################
# 2. Port Check
################################################################################

echo ""
echo -e "${YELLOW}━━━ 2. Port 3000 Check ━━━${NC}"

if netstat -tulpn 2>/dev/null | grep -q ':3000 '; then
    echo -e "  ${GREEN}✓${NC} Port 3000 ist offen"
else
    echo -e "  ${YELLOW}⚠${NC} Port 3000 ist nicht offen - Backend-Neustart..."
    systemctl restart fmsv-backend
    sleep 3
    
    if netstat -tulpn 2>/dev/null | grep -q ':3000 '; then
        echo -e "  ${GREEN}✓${NC} Port 3000 jetzt offen"
        log "Port 3000 nach Neustart verfügbar"
    else
        echo -e "  ${RED}✗${NC} Port 3000 noch nicht offen"
        log "Port 3000 Problem besteht"
    fi
fi

################################################################################
# 3. Firewall
################################################################################

echo ""
echo -e "${YELLOW}━━━ 3. Firewall Check ━━━${NC}"

if command -v ufw &> /dev/null; then
    if ! ufw status | grep -q "3000.*ALLOW"; then
        echo -e "  ${YELLOW}⚠${NC} Port 3000 nicht in Firewall - füge hinzu..."
        ufw allow 3000/tcp > /dev/null 2>&1
        echo -e "  ${GREEN}✓${NC} Port 3000 zur Firewall hinzugefügt"
        log "Port 3000 zu Firewall hinzugefügt"
    else
        echo -e "  ${GREEN}✓${NC} Port 3000 in Firewall erlaubt"
    fi
    
    # pgAdmin Ports
    if ! ufw status | grep -q "1880.*ALLOW"; then
        ufw allow 1880/tcp > /dev/null 2>&1
        echo -e "  ${GREEN}✓${NC} Port 1880 (pgAdmin) zur Firewall hinzugefügt"
    fi
    
    if ! ufw status | grep -q "18443.*ALLOW"; then
        ufw allow 18443/tcp > /dev/null 2>&1
        echo -e "  ${GREEN}✓${NC} Port 18443 (pgAdmin SSL) zur Firewall hinzugefügt"
    fi
else
    echo -e "  ${CYAN}ℹ${NC} UFW nicht installiert"
fi

################################################################################
# 4. Nginx Check
################################################################################

echo ""
echo -e "${YELLOW}━━━ 4. Nginx Check ━━━${NC}"

if systemctl is-active --quiet nginx; then
    echo -e "  ${GREEN}✓${NC} Nginx läuft"
    
    # Test nginx config
    if nginx -t > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓${NC} Nginx Config OK"
    else
        echo -e "  ${YELLOW}⚠${NC} Nginx Config hat Fehler - versuche Reload..."
        nginx -t
        systemctl reload nginx 2>/dev/null
    fi
else
    echo -e "  ${YELLOW}⚠${NC} Nginx läuft nicht - starte..."
    systemctl start nginx
    
    if systemctl is-active --quiet nginx; then
        echo -e "  ${GREEN}✓${NC} Nginx gestartet"
        log "Nginx neu gestartet"
    else
        echo -e "  ${RED}✗${NC} Nginx Start fehlgeschlagen"
        log "Nginx Start fehlgeschlagen"
    fi
fi

################################################################################
# 5. Apache2 Check (für pgAdmin)
################################################################################

echo ""
echo -e "${YELLOW}━━━ 5. Apache2 Check (pgAdmin) ━━━${NC}"

if systemctl is-active --quiet apache2; then
    echo -e "  ${GREEN}✓${NC} Apache2 läuft"
else
    echo -e "  ${YELLOW}⚠${NC} Apache2 läuft nicht - starte..."
    systemctl start apache2
    
    if systemctl is-active --quiet apache2; then
        echo -e "  ${GREEN}✓${NC} Apache2 gestartet"
        log "Apache2 neu gestartet"
    else
        echo -e "  ${YELLOW}⚠${NC} Apache2 konnte nicht gestartet werden"
        log "Apache2 Start fehlgeschlagen"
    fi
fi

################################################################################
# 6. Permissions Check
################################################################################

echo ""
echo -e "${YELLOW}━━━ 6. Permissions Check ━━━${NC}"

if [ -d "/var/www/fmsv-dingden" ]; then
    echo -e "  ${CYAN}Setze Berechtigungen...${NC}"
    chown -R www-data:www-data /var/www/fmsv-dingden/dist 2>/dev/null
    chown -R www-data:www-data /var/www/fmsv-dingden/Saves 2>/dev/null
    chown -R www-data:www-data /var/www/fmsv-dingden/Logs 2>/dev/null
    echo -e "  ${GREEN}✓${NC} Berechtigungen gesetzt"
    log "Berechtigungen korrigiert"
else
    echo -e "  ${RED}✗${NC} FMSV Verzeichnis nicht gefunden"
fi

################################################################################
# 7. Database Connection Test
################################################################################

echo ""
echo -e "${YELLOW}━━━ 7. Database Connection ━━━${NC}"

if [ -f "/var/www/fmsv-dingden/backend/.env" ]; then
    source /var/www/fmsv-dingden/backend/.env
    
    if su - postgres -c "psql -d $DB_NAME -c 'SELECT 1;'" > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓${NC} Datenbank-Verbindung OK"
    else
        echo -e "  ${RED}✗${NC} Datenbank-Verbindung fehlgeschlagen"
        echo -e "    ${YELLOW}Prüfe Credentials in .env${NC}"
        log "Datenbank-Verbindung fehlgeschlagen"
    fi
else
    echo -e "  ${YELLOW}⚠${NC} .env Datei nicht gefunden"
fi

################################################################################
# 8. API Test
################################################################################

echo ""
echo -e "${YELLOW}━━━ 8. API Erreichbarkeit ━━━${NC}"

sleep 2  # Warte kurz

if curl -s -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} API ist erreichbar"
    log "API Test erfolgreich"
else
    echo -e "  ${RED}✗${NC} API nicht erreichbar"
    echo -e "    ${CYAN}Letzter Versuch: Backend-Neustart...${NC}"
    
    systemctl restart fmsv-backend
    sleep 5
    
    if curl -s -f http://localhost:3000/api/health > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓${NC} API jetzt erreichbar"
        log "API nach Neustart erreichbar"
    else
        echo -e "  ${RED}✗${NC} API immer noch nicht erreichbar"
        log "API bleibt unerreichbar"
    fi
fi

################################################################################
# Summary
################################################################################

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                      Zusammenfassung                       ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Final checks
ALL_OK=true

if ! systemctl is-active --quiet fmsv-backend; then
    echo -e "  ${RED}✗${NC} Backend Service läuft nicht"
    ALL_OK=false
fi

if ! systemctl is-active --quiet nginx; then
    echo -e "  ${RED}✗${NC} Nginx läuft nicht"
    ALL_OK=false
fi

if ! curl -s -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "  ${RED}✗${NC} API nicht erreichbar"
    ALL_OK=false
fi

if [ "$ALL_OK" = true ]; then
    echo -e "  ${GREEN}✓✓✓ Alle Systeme laufen korrekt! ✓✓✓${NC}"
    echo ""
    echo -e "  ${CYAN}Test-Befehle:${NC}"
    echo -e "    ${GREEN}curl http://localhost:3000/api/health${NC}"
    echo -e "    ${GREEN}systemctl status fmsv-backend${NC}"
else
    echo -e "  ${RED}⚠ Es bestehen noch Probleme${NC}"
    echo ""
    echo -e "  ${CYAN}Weitere Diagnose:${NC}"
    echo -e "    ${GREEN}fmsv-test${NC}    - Ausführlicher Test"
    echo -e "    ${GREEN}fmsv-errors${NC}  - Fehler-Logs anzeigen"
    echo -e "    ${GREEN}fmsv-manual${NC}  - Backend manuell starten"
    echo ""
    echo -e "  ${CYAN}Logs prüfen:${NC}"
    echo -e "    ${GREEN}journalctl -u fmsv-backend -n 50${NC}"
fi

echo ""
log "Quick Fix abgeschlossen"
