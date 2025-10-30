#!/bin/bash

################################################################################
# FMSV Dingden - Backend Runtime Test
# Testet ob der Backend-Server wirklich funktioniert
# Version: 1.1
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
echo -e "${CYAN}║         FMSV Dingden - Backend Runtime Test               ║${NC}"
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
BACKEND_DIR="$INSTALL_DIR/backend"

# Prüfe Installation
if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}❌ Backend nicht gefunden: $BACKEND_DIR${NC}"
    exit 1
fi

cd "$BACKEND_DIR" || exit 1

echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Test 1: Systemd Service Status${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""

if systemctl is-active --quiet fmsv-backend; then
    echo -e "${GREEN}✅ Service läuft${NC}"
    systemctl status fmsv-backend --no-pager | head -n 10
else
    echo -e "${RED}❌ Service läuft NICHT!${NC}"
    echo ""
    echo "Starte Service..."
    systemctl start fmsv-backend
    sleep 2
    
    if systemctl is-active --quiet fmsv-backend; then
        echo -e "${GREEN}✅ Service erfolgreich gestartet${NC}"
    else
        echo -e "${RED}❌ Service kann nicht gestartet werden${NC}"
        echo ""
        echo "Fehlerausgabe:"
        journalctl -u fmsv-backend -n 20 --no-pager
        exit 1
    fi
fi

echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Test 2: Port Check${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Port aus .env lesen
if [ -f .env ]; then
    PORT=$(grep "^PORT=" .env | cut -d'=' -f2 | tr -d ' ')
    if [ -z "$PORT" ]; then
        PORT="5000"
    fi
else
    PORT="5000"
fi

echo "Erwarteter Port: $PORT"
echo ""

if netstat -tuln | grep ":$PORT " > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Port $PORT ist offen${NC}"
    echo ""
    echo "Details:"
    netstat -tuln | grep ":$PORT "
else
    echo -e "${RED}❌ Port $PORT ist NICHT offen${NC}"
    echo ""
    echo "Offene Ports:"
    netstat -tuln | grep LISTEN
    echo ""
    echo -e "${YELLOW}Mögliche Ursachen:${NC}"
    echo "  • Backend ist abgestürzt"
    echo "  • Falscher Port in .env"
    echo "  • Port bereits belegt"
    exit 1
fi

echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Test 3: HTTP Request (Health Check)${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo "Sende Request an http://localhost:$PORT/api/health..."
echo ""

HTTP_CODE=$(curl -s -o /tmp/backend-response.txt -w "%{http_code}" http://localhost:$PORT/api/health 2>/dev/null)
RESPONSE=$(cat /tmp/backend-response.txt 2>/dev/null)

echo "HTTP Status Code: $HTTP_CODE"
echo "Response: $RESPONSE"
echo ""

if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✅ Backend antwortet erfolgreich${NC}"
elif [ "$HTTP_CODE" == "000" ]; then
    echo -e "${RED}❌ Keine Verbindung möglich!${NC}"
    echo ""
    echo -e "${YELLOW}Backend läuft nicht oder Port falsch${NC}"
    exit 1
elif [ "$HTTP_CODE" == "500" ]; then
    echo -e "${RED}❌ 500 Internal Server Error!${NC}"
    echo ""
    echo -e "${YELLOW}Fehlerdetails in Logs:${NC}"
    journalctl -u fmsv-backend -n 30 --no-pager
    exit 1
else
    echo -e "${YELLOW}⚠  Unerwarteter Status Code: $HTTP_CODE${NC}"
fi

echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Test 4: Datenbank-Verbindung${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Lade DB-Credentials aus .env
if [ -f .env ]; then
    DB_NAME=$(grep "^DB_NAME=" .env | cut -d'=' -f2 | tr -d ' ')
    DB_USER=$(grep "^DB_USER=" .env | cut -d'=' -f2 | tr -d ' ')
else
    echo -e "${RED}❌ .env Datei nicht gefunden${NC}"
    exit 1
fi

echo "Teste Verbindung zu Datenbank: $DB_NAME"
echo ""

# Test DB Connection
if su - postgres -c "psql -d $DB_NAME -c 'SELECT 1;'" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Datenbank-Verbindung OK${NC}"
    echo ""
    
    # Prüfe Tabellen
    echo "Vorhandene Tabellen:"
    TABLES=$(su - postgres -c "psql -d $DB_NAME -t -c \"SELECT tablename FROM pg_tables WHERE schemaname='public';\"" 2>/dev/null | grep -v "^$" | wc -l)
    
    if [ "$TABLES" -gt 0 ]; then
        echo -e "${GREEN}✅ $TABLES Tabellen gefunden${NC}"
        su - postgres -c "psql -d $DB_NAME -t -c \"SELECT tablename FROM pg_tables WHERE schemaname='public';\"" 2>/dev/null | grep -v "^$" | head -n 10
    else
        echo -e "${RED}❌ KEINE Tabellen gefunden!${NC}"
        echo ""
        echo -e "${YELLOW}Schema wurde nicht initialisiert${NC}"
        echo ""
        echo "Führe aus:"
        echo -e "  ${CYAN}cd $BACKEND_DIR && node scripts/initDatabase.js${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Datenbank-Verbindung fehlgeschlagen${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Test 5: Node.js Runtime Test${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Prüfe ob node_modules existiert
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠  node_modules nicht gefunden${NC}"
    echo "Installiere Dependencies..."
    echo ""
    
    if npm install 2>&1 | grep -E "(added|up to date)" > /dev/null; then
        echo -e "${GREEN}✅ Dependencies installiert${NC}"
    else
        echo -e "${RED}❌ npm install fehlgeschlagen${NC}"
        exit 1
    fi
    echo ""
else
    echo -e "${GREEN}✅ node_modules vorhanden${NC}"
    echo ""
fi

echo "Teste ob Backend-Code ohne Fehler lädt..."
echo ""

# Erstelle Test-Script im Backend-Verzeichnis (als ES Module)
cat > test-server-load.mjs << 'EOFTEST'
import dotenv from 'dotenv';
import pg from 'pg';

// Lade .env
dotenv.config();

try {
    console.log('✓ dotenv geladen');
    
    // Teste ob alle erforderlichen Env-Variablen da sind
    const required = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        console.error('✗ Fehlende Env-Variablen:', missing.join(', '));
        process.exit(1);
    }
    
    console.log('✓ Alle Env-Variablen vorhanden');
    
    // Teste PostgreSQL Client
    const { Pool } = pg;
    const pool = new Pool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    });
    
    console.log('✓ Pool konfiguriert');
    
    // Teste DB Query (mit await)
    const result = await pool.query('SELECT NOW()');
    console.log('✓ Datenbank-Query erfolgreich');
    
    await pool.end();
    console.log('\n✅ Alle Runtime-Checks erfolgreich!');
    process.exit(0);
    
} catch (error) {
    console.error('✗ Runtime Fehler:', error.message);
    console.error(error.stack);
    process.exit(1);
}
EOFTEST

if node test-server-load.mjs 2>&1; then
    echo -e "${GREEN}✅ Node.js Runtime OK${NC}"
    rm -f test-server-load.mjs
else
    echo -e "${RED}❌ Node.js Runtime Fehler!${NC}"
    echo ""
    echo "Siehe Fehlerausgabe oben"
    rm -f test-server-load.mjs
    exit 1
fi

echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Test 6: Letzte Backend-Logs${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo "Letzte 20 Log-Einträge:"
echo ""
journalctl -u fmsv-backend -n 20 --no-pager

echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Test 7: Nginx Proxy Test${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""

if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx läuft${NC}"
    echo ""
    
    # Teste Nginx Config
    if nginx -t 2>&1 | grep -q "successful"; then
        echo -e "${GREEN}✅ Nginx Config OK${NC}"
    else
        echo -e "${RED}❌ Nginx Config fehlerhaft${NC}"
        nginx -t
    fi
    
    echo ""
    echo "Teste ob Nginx das Backend erreicht..."
    
    # Finde Nginx-konfig für FMSV
    if [ -f /etc/nginx/sites-available/fmsv-dingden ]; then
        echo ""
        echo "Relevante Nginx Config:"
        grep -A 5 "location /api" /etc/nginx/sites-available/fmsv-dingden
    fi
else
    echo -e "${YELLOW}⚠  Nginx läuft nicht${NC}"
    echo ""
    echo "Falls du Nginx verwendest, starte es:"
    echo -e "  ${CYAN}systemctl start nginx${NC}"
fi

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Test abgeschlossen${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Cleanup
rm -f /tmp/backend-response.txt

echo -e "${YELLOW}Nächste Schritte:${NC}"
echo ""
echo "1. Falls 500 Error weiterhin auftritt, führe aus:"
echo -e "   ${CYAN}journalctl -u fmsv-backend -f${NC}"
echo "   (Live-Logs anzeigen, mit Strg+C beenden)"
echo ""
echo "2. Teste mit Browser oder curl:"
echo -e "   ${CYAN}curl http://localhost:$PORT/api/health${NC}"
echo ""
echo "3. Wenn alles OK ist, prüfe Cloudflare Tunnel:"
echo -e "   ${CYAN}./debug.sh${NC} → Option [3]"
echo ""
