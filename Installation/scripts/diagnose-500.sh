#!/bin/bash

################################################################################
# FMSV Dingden - 500 Fehler Diagnose Script
# Führt alle wichtigen Checks durch und zeigt Lösungsvorschläge
################################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

INSTALL_DIR="/var/www/fmsv-dingden"

clear
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}          🔍 FMSV Backend Diagnose - 500 Fehler            ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Check 1: PostgreSQL
echo -e "${YELLOW}1️⃣  PostgreSQL Service:${NC}"
if systemctl is-active --quiet postgresql; then
    echo -e "   ${GREEN}✓${NC} PostgreSQL läuft"
    PG_OK=1
else
    echo -e "   ${RED}✗${NC} PostgreSQL läuft NICHT!"
    echo -e "   ${CYAN}→ Lösung: systemctl start postgresql${NC}"
    PG_OK=0
fi
echo ""

# Check 2: Backend Service
echo -e "${YELLOW}2️⃣  Backend Service:${NC}"
if systemctl is-active --quiet fmsv-backend; then
    echo -e "   ${GREEN}✓${NC} Backend läuft"
    BACKEND_OK=1
else
    echo -e "   ${RED}✗${NC} Backend läuft NICHT!"
    echo -e "   ${CYAN}→ Lösung: systemctl start fmsv-backend${NC}"
    BACKEND_OK=0
fi

# Zeige letzte Backend-Fehler
if [ $BACKEND_OK -eq 0 ]; then
    echo ""
    echo -e "   ${YELLOW}Letzte Fehler:${NC}"
    journalctl -u fmsv-backend -n 5 --no-pager | sed 's/^/   /'
fi
echo ""

# Check 3: nginx
echo -e "${YELLOW}3️⃣  nginx Service:${NC}"
if systemctl is-active --quiet nginx; then
    echo -e "   ${GREEN}✓${NC} nginx läuft"
    NGINX_OK=1
else
    echo -e "   ${RED}✗${NC} nginx läuft NICHT!"
    echo -e "   ${CYAN}→ Lösung: systemctl start nginx${NC}"
    NGINX_OK=0
fi
echo ""

# Check 4: Schema-Datei
echo -e "${YELLOW}4️⃣  Datenbank Schema-Datei:${NC}"
SCHEMA_PATH="$INSTALL_DIR/backend/database/schema.sql"
if [ -f "$SCHEMA_PATH" ]; then
    SCHEMA_SIZE=$(stat -f%z "$SCHEMA_PATH" 2>/dev/null || stat -c%s "$SCHEMA_PATH" 2>/dev/null)
    echo -e "   ${GREEN}✓${NC} schema.sql existiert (${SCHEMA_SIZE} bytes)"
    SCHEMA_OK=1
else
    echo -e "   ${RED}✗${NC} schema.sql FEHLT!"
    echo -e "   ${CYAN}→ Pfad: $SCHEMA_PATH${NC}"
    echo -e "   ${CYAN}→ Lösung: Repository neu klonen${NC}"
    SCHEMA_OK=0
fi
echo ""

# Check 5: .env Datei
echo -e "${YELLOW}5️⃣  Backend Konfiguration (.env):${NC}"
ENV_PATH="$INSTALL_DIR/backend/.env"
if [ -f "$ENV_PATH" ]; then
    echo -e "   ${GREEN}✓${NC} .env Datei existiert"
    
    # Zeige Datenbank-Config (ohne Passwort)
    echo -e "   ${BLUE}Datenbank-Konfiguration:${NC}"
    grep "DB_NAME=" "$ENV_PATH" | sed 's/^/     /'
    grep "DB_USER=" "$ENV_PATH" | sed 's/^/     /'
    echo "     DB_PASSWORD=***********"
    grep "DB_HOST=" "$ENV_PATH" | sed 's/^/     /' || echo "     DB_HOST=localhost (default)"
    grep "DB_PORT=" "$ENV_PATH" | sed 's/^/     /' || echo "     DB_PORT=5432 (default)"
    ENV_OK=1
else
    echo -e "   ${RED}✗${NC} .env Datei FEHLT!"
    echo -e "   ${CYAN}→ Lösung: Installation neu durchführen${NC}"
    ENV_OK=0
fi
echo ""

# Check 6: Datenbank existiert
echo -e "${YELLOW}6️⃣  Datenbank:${NC}"
if [ $PG_OK -eq 1 ]; then
    DB_NAME=$(grep "DB_NAME=" "$ENV_PATH" 2>/dev/null | cut -d= -f2)
    if su - postgres -c "psql -l" 2>/dev/null | grep -q "$DB_NAME"; then
        echo -e "   ${GREEN}✓${NC} Datenbank '$DB_NAME' existiert"
        DB_OK=1
    else
        echo -e "   ${RED}✗${NC} Datenbank '$DB_NAME' existiert NICHT!"
        echo -e "   ${CYAN}→ Lösung: Datenbank erstellen (siehe install.sh)${NC}"
        DB_OK=0
    fi
else
    echo -e "   ${YELLOW}⚠${NC}  Kann nicht prüfen (PostgreSQL läuft nicht)"
    DB_OK=0
fi
echo ""

# Check 7: Port-Belegung
echo -e "${YELLOW}7️⃣  Port-Belegung:${NC}"
if netstat -tulpn 2>/dev/null | grep -q ':3000 '; then
    PORT_3000_PROCESS=$(netstat -tulpn 2>/dev/null | grep ':3000 ' | awk '{print $7}' | head -1)
    if echo "$PORT_3000_PROCESS" | grep -q "node"; then
        echo -e "   ${GREEN}✓${NC} Port 3000: Backend (node)"
    else
        echo -e "   ${RED}✗${NC} Port 3000: Belegt von anderem Prozess ($PORT_3000_PROCESS)"
        echo -e "   ${CYAN}→ Lösung: Prozess beenden oder Port in .env ändern${NC}"
    fi
else
    if [ $BACKEND_OK -eq 1 ]; then
        echo -e "   ${YELLOW}⚠${NC}  Port 3000: NICHT belegt (Backend sollte aber laufen?)"
    else
        echo -e "   ${YELLOW}⚠${NC}  Port 3000: Nicht belegt (Backend läuft nicht)"
    fi
fi

if netstat -tulpn 2>/dev/null | grep -q ':80 '; then
    PORT_80_PROCESS=$(netstat -tulpn 2>/dev/null | grep ':80 ' | awk '{print $7}' | head -1)
    if echo "$PORT_80_PROCESS" | grep -q "nginx"; then
        echo -e "   ${GREEN}✓${NC} Port 80: nginx"
    else
        echo -e "   ${RED}✗${NC} Port 80: Belegt von anderem Prozess ($PORT_80_PROCESS)"
        echo -e "   ${CYAN}→ Lösung: Prozess beenden (z.B. Apache)${NC}"
    fi
else
    echo -e "   ${YELLOW}⚠${NC}  Port 80: NICHT belegt"
fi
echo ""

# Check 8: Dateiberechtigungen
echo -e "${YELLOW}8️⃣  Dateiberechtigungen:${NC}"
BACKEND_DIR="$INSTALL_DIR/backend"
if [ -d "$BACKEND_DIR" ]; then
    OWNER=$(stat -c '%U:%G' "$BACKEND_DIR" 2>/dev/null || stat -f '%Su:%Sg' "$BACKEND_DIR" 2>/dev/null)
    if [ "$OWNER" = "www-data:www-data" ]; then
        echo -e "   ${GREEN}✓${NC} Backend-Verzeichnis: $OWNER"
    else
        echo -e "   ${YELLOW}⚠${NC}  Backend-Verzeichnis: $OWNER (sollte www-data:www-data sein)"
        echo -e "   ${CYAN}→ Lösung: chown -R www-data:www-data $INSTALL_DIR${NC}"
    fi
else
    echo -e "   ${RED}✗${NC} Backend-Verzeichnis nicht gefunden"
fi
echo ""

# Zusammenfassung
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}📊 Zusammenfassung:${NC}"
echo ""

TOTAL_CHECKS=6
PASSED_CHECKS=0
[ $PG_OK -eq 1 ] && PASSED_CHECKS=$((PASSED_CHECKS + 1))
[ $BACKEND_OK -eq 1 ] && PASSED_CHECKS=$((PASSED_CHECKS + 1))
[ $NGINX_OK -eq 1 ] && PASSED_CHECKS=$((PASSED_CHECKS + 1))
[ $SCHEMA_OK -eq 1 ] && PASSED_CHECKS=$((PASSED_CHECKS + 1))
[ $ENV_OK -eq 1 ] && PASSED_CHECKS=$((PASSED_CHECKS + 1))
[ $DB_OK -eq 1 ] && PASSED_CHECKS=$((PASSED_CHECKS + 1))

echo -e "   ${GREEN}✓${NC} $PASSED_CHECKS von $TOTAL_CHECKS Checks erfolgreich"
echo ""

# Diagnose
if [ $PASSED_CHECKS -eq $TOTAL_CHECKS ] && [ $BACKEND_OK -eq 1 ]; then
    echo -e "${GREEN}✅ Alle Checks OK - Backend sollte erreichbar sein!${NC}"
    echo ""
    echo -e "${YELLOW}Test:${NC}"
    echo -e "  ${CYAN}curl http://localhost/api/health${NC}"
    echo ""
elif [ $BACKEND_OK -eq 0 ]; then
    echo -e "${RED}❌ HAUPTPROBLEM: Backend läuft nicht!${NC}"
    echo ""
    echo -e "${YELLOW}🔧 Lösungsvorschläge:${NC}"
    echo ""
    
    if [ $PG_OK -eq 0 ]; then
        echo -e "${BLUE}1.${NC} PostgreSQL starten:"
        echo -e "   ${CYAN}systemctl start postgresql${NC}"
        echo ""
    fi
    
    if [ $DB_OK -eq 0 ]; then
        echo -e "${BLUE}2.${NC} Datenbank initialisieren:"
        echo -e "   ${CYAN}cd $INSTALL_DIR/backend${NC}"
        echo -e "   ${CYAN}node scripts/initDatabase.js${NC}"
        echo ""
    fi
    
    echo -e "${BLUE}3.${NC} Backend starten:"
    echo -e "   ${CYAN}systemctl start fmsv-backend${NC}"
    echo ""
    
    echo -e "${BLUE}4.${NC} Logs ansehen:"
    echo -e "   ${CYAN}journalctl -u fmsv-backend -n 50${NC}"
    echo ""
    
    echo -e "${BLUE}5.${NC} Manuell testen:"
    echo -e "   ${CYAN}cd $INSTALL_DIR/backend${NC}"
    echo -e "   ${CYAN}sudo -u www-data node server.js${NC}"
    echo ""
else
    echo -e "${YELLOW}⚠️  Einige Checks fehlgeschlagen${NC}"
    echo ""
    echo -e "${YELLOW}Siehe Details oben für Lösungsvorschläge${NC}"
    echo ""
fi

echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Quick-Fix Option
if [ $BACKEND_OK -eq 0 ]; then
    echo -ne "${YELLOW}Möchtest du einen automatischen Quick-Fix versuchen? (j/n):${NC} "
    read -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Jj]$ ]]; then
        echo ""
        echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
        echo -e "${YELLOW}🔧 Quick-Fix wird ausgeführt...${NC}"
        echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
        echo ""
        
        # PostgreSQL starten falls nötig
        if [ $PG_OK -eq 0 ]; then
            echo -e "${BLUE}►${NC} Starte PostgreSQL..."
            systemctl start postgresql
            sleep 2
        fi
        
        # Datenbank initialisieren
        if [ $DB_OK -eq 0 ] || [ $SCHEMA_OK -eq 1 ]; then
            echo -e "${BLUE}►${NC} Initialisiere Datenbank..."
            cd "$INSTALL_DIR/backend"
            if node scripts/initDatabase.js; then
                echo -e "   ${GREEN}✓${NC} Datenbank initialisiert"
            else
                echo -e "   ${RED}✗${NC} Datenbank-Initialisierung fehlgeschlagen"
                echo -e "   ${CYAN}→ Siehe Fehlermeldung oben${NC}"
            fi
        fi
        
        # Backend starten
        echo -e "${BLUE}►${NC} Starte Backend..."
        systemctl restart fmsv-backend
        sleep 3
        
        # nginx starten falls nötig
        if [ $NGINX_OK -eq 0 ]; then
            echo -e "${BLUE}►${NC} Starte nginx..."
            systemctl start nginx
        fi
        
        echo ""
        echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
        echo -e "${YELLOW}📊 Status nach Quick-Fix:${NC}"
        echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
        echo ""
        
        # Prüfe Services
        if systemctl is-active --quiet postgresql; then
            echo -e "   ${GREEN}✓${NC} PostgreSQL läuft"
        else
            echo -e "   ${RED}✗${NC} PostgreSQL läuft nicht"
        fi
        
        if systemctl is-active --quiet fmsv-backend; then
            echo -e "   ${GREEN}✓${NC} Backend läuft"
        else
            echo -e "   ${RED}✗${NC} Backend läuft nicht"
            echo ""
            echo -e "   ${YELLOW}Letzte Fehler:${NC}"
            journalctl -u fmsv-backend -n 10 --no-pager | sed 's/^/   /'
        fi
        
        if systemctl is-active --quiet nginx; then
            echo -e "   ${GREEN}✓${NC} nginx läuft"
        else
            echo -e "   ${RED}✗${NC} nginx läuft nicht"
        fi
        
        echo ""
        
        # Teste Backend
        echo -e "${BLUE}►${NC} Teste Backend-Verbindung..."
        if curl -s http://localhost:3000 > /dev/null 2>&1 || curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
            echo -e "   ${GREEN}✓${NC} Backend antwortet!"
            echo ""
            echo -e "${GREEN}✅ Quick-Fix erfolgreich!${NC}"
            echo -e "${CYAN}→ Versuche jetzt die Website im Browser zu öffnen${NC}"
        else
            echo -e "   ${RED}✗${NC} Backend antwortet nicht"
            echo ""
            echo -e "${YELLOW}Weitere Diagnose nötig:${NC}"
            echo -e "   ${CYAN}journalctl -u fmsv-backend -n 50${NC}"
        fi
        
        echo ""
    fi
fi

echo -e "${BLUE}💡 Weitere Hilfe:${NC}"
echo -e "   ${CYAN}cat $INSTALL_DIR/Installation/500-FEHLER-DIAGNOSE.md${NC}"
echo ""
