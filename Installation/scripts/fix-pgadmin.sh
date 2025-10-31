#!/bin/bash

################################################################################
# pgAdmin 4 Fix Script
# Behebt häufige Probleme mit pgAdmin + Apache2
################################################################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

clear
echo -e "${CYAN}"
cat << "EOF"
╔════════════════════════════════════════════════════════╗
║           pgAdmin 4 Fix & Diagnose Tool                ║
╚════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Bitte als root ausführen: sudo ./fix-pgadmin.sh${NC}"
    exit 1
fi

info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; }

################################################################################
# DIAGNOSE
################################################################################

echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}                     DIAGNOSE                          ${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}"
echo ""

# 1. Apache2 Status
info "Prüfe Apache2 Status..."
if systemctl is-active --quiet apache2; then
    success "Apache2 läuft"
    APACHE_RUNNING=1
else
    error "Apache2 läuft NICHT"
    APACHE_RUNNING=0
fi
echo ""

# 2. Port-Belegung
info "Prüfe Port 1880..."
if netstat -tulpn 2>/dev/null | grep -q ":1880"; then
    if [ $APACHE_RUNNING -eq 1 ]; then
        success "Port 1880 wird von Apache2 verwendet"
    else
        warning "Port 1880 ist belegt, aber nicht von Apache2!"
        netstat -tulpn 2>/dev/null | grep ":1880" | sed 's/^/  /'
    fi
else
    if [ $APACHE_RUNNING -eq 1 ]; then
        warning "Apache2 läuft, aber Port 1880 ist nicht offen"
    else
        info "Port 1880 ist frei"
    fi
fi
echo ""

# 3. WSGI Modul
info "Prüfe WSGI Modul..."
if apache2ctl -M 2>/dev/null | grep -q wsgi; then
    success "WSGI Modul ist geladen"
    WSGI_OK=1
else
    error "WSGI Modul fehlt!"
    WSGI_OK=0
fi
echo ""

# 4. pgAdmin Installation
info "Prüfe pgAdmin Installation..."
if [ -d "/usr/pgadmin4" ]; then
    success "pgAdmin gefunden: /usr/pgadmin4"
    PGADMIN_PATH="/usr/pgadmin4"
    PGADMIN_OK=1
elif [ -d "/usr/lib/pgadmin4" ]; then
    success "pgAdmin gefunden: /usr/lib/pgadmin4"
    PGADMIN_PATH="/usr/lib/pgadmin4"
    PGADMIN_OK=1
else
    error "pgAdmin nicht gefunden!"
    PGADMIN_OK=0
    PGADMIN_PATH=""
fi
echo ""

# 5. Apache Konfiguration
info "Prüfe Apache Konfiguration..."
APACHE_TEST=$(apache2ctl configtest 2>&1)
if echo "$APACHE_TEST" | grep -q "Syntax OK"; then
    success "Apache Konfiguration OK"
    CONFIG_OK=1
else
    warning "Apache Konfiguration hat Fehler:"
    echo "$APACHE_TEST" | grep -E "(error|Error|warning|Warning)" | sed 's/^/  /'
    CONFIG_OK=0
fi
echo ""

# 6. Letzte Fehler
if [ $APACHE_RUNNING -eq 0 ]; then
    info "Letzte Apache Fehler:"
    journalctl -u apache2 -n 10 --no-pager 2>/dev/null | grep -E "(error|failed|Error|Failed)" | sed 's/^/  /' || echo "  (Keine Fehler gefunden)"
    echo ""
fi

################################################################################
# AUTOMATISCHE REPARATUR
################################################################################

echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}                AUTOMATISCHE REPARATUR                 ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo ""

FIXES_APPLIED=0

# Fix 1: WSGI Modul installieren
if [ $WSGI_OK -eq 0 ]; then
    info "Installiere WSGI Modul..."
    if apt-get install -y -qq libapache2-mod-wsgi-py3 > /dev/null 2>&1; then
        success "WSGI Modul installiert"
        FIXES_APPLIED=1
    else
        error "WSGI Installation fehlgeschlagen"
    fi
    echo ""
fi

# Fix 2: Module aktivieren
info "Aktiviere benötigte Apache Module..."
MODULES="ssl wsgi proxy proxy_http headers rewrite"
for mod in $MODULES; do
    if a2enmod $mod > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓${NC} $mod aktiviert"
        FIXES_APPLIED=1
    else
        echo -e "  ${BLUE}○${NC} $mod bereits aktiv"
    fi
done
echo ""

# Fix 3: Ports konfigurieren
info "Prüfe Apache Ports..."
if ! grep -q "Listen 1880" /etc/apache2/ports.conf 2>/dev/null; then
    info "Konfiguriere Ports..."
    cat > /etc/apache2/ports.conf << 'EOF'
# Ports für pgAdmin (parallel zu nginx)
Listen 1880

<IfModule ssl_module>
    Listen 18443
</IfModule>

<IfModule mod_gnutls.c>
    Listen 18443
</IfModule>
EOF
    success "Ports konfiguriert (1880/18443)"
    FIXES_APPLIED=1
else
    success "Ports bereits korrekt konfiguriert"
fi
echo ""

# Fix 4: pgAdmin VirtualHost erstellen/reparieren
if [ $PGADMIN_OK -eq 1 ]; then
    info "Erstelle pgAdmin VirtualHost..."
    
    cat > /etc/apache2/sites-available/pgadmin.conf <<EOF
<VirtualHost *:1880>
    ServerName localhost
    
    WSGIDaemonProcess pgadmin processes=1 threads=25 python-home=$PGADMIN_PATH/venv
    WSGIScriptAlias / $PGADMIN_PATH/web/pgAdmin4.wsgi
    
    <Directory $PGADMIN_PATH/web/>
        WSGIProcessGroup pgadmin
        WSGIApplicationGroup %{GLOBAL}
        Require all granted
    </Directory>
    
    ErrorLog \${APACHE_LOG_DIR}/pgadmin_error.log
    CustomLog \${APACHE_LOG_DIR}/pgadmin_access.log combined
</VirtualHost>

<IfModule mod_ssl.c>
<VirtualHost *:18443>
    ServerName localhost
    
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/ssl-cert-snakeoil.pem
    SSLCertificateKeyFile /etc/ssl/private/ssl-cert-snakeoil.key
    
    WSGIDaemonProcess pgadmin-ssl processes=1 threads=25 python-home=$PGADMIN_PATH/venv
    WSGIScriptAlias / $PGADMIN_PATH/web/pgAdmin4.wsgi
    
    <Directory $PGADMIN_PATH/web/>
        WSGIProcessGroup pgadmin-ssl
        WSGIApplicationGroup %{GLOBAL}
        Require all granted
    </Directory>
    
    ErrorLog \${APACHE_LOG_DIR}/pgadmin_ssl_error.log
    CustomLog \${APACHE_LOG_DIR}/pgadmin_ssl_access.log combined
</VirtualHost>
</IfModule>
EOF
    
    # Aktiviere Site
    a2ensite pgadmin > /dev/null 2>&1
    a2dissite 000-default > /dev/null 2>&1
    
    success "pgAdmin VirtualHost erstellt"
    FIXES_APPLIED=1
    echo ""
fi

# Fix 5: Apache neu starten
if [ $FIXES_APPLIED -eq 1 ] || [ $APACHE_RUNNING -eq 0 ]; then
    info "Starte Apache2 neu..."
    systemctl stop apache2 > /dev/null 2>&1
    sleep 1
    systemctl start apache2 > /dev/null 2>&1
    sleep 2
    
    if systemctl is-active --quiet apache2; then
        success "Apache2 erfolgreich gestartet!"
    else
        error "Apache2 konnte nicht gestartet werden"
        echo ""
        warning "Zeige detaillierte Fehler:"
        journalctl -u apache2 -n 20 --no-pager | sed 's/^/  /'
        echo ""
        exit 1
    fi
    echo ""
fi

################################################################################
# ERGEBNIS
################################################################################

echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}                     ERGEBNIS                          ${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""

if systemctl is-active --quiet apache2; then
    success "Apache2 läuft auf Port 1880/18443"
    echo ""
    
    SERVER_IP=$(hostname -I | awk '{print $1}')
    
    echo -e "${CYAN}Zugriff auf pgAdmin:${NC}"
    echo -e "  ${GREEN}►${NC} Lokal:   ${CYAN}http://localhost:1880/pgadmin4${NC}"
    echo -e "  ${GREEN}►${NC} Extern:  ${CYAN}http://$SERVER_IP:1880/pgadmin4${NC}"
    echo ""
    
    echo -e "${YELLOW}Teste Zugriff:${NC}"
    echo -e "  ${CYAN}curl -I http://localhost:1880/pgadmin4${NC}"
    echo ""
    
    # Teste Zugriff
    if curl -I -s http://localhost:1880/pgadmin4 2>/dev/null | head -1 | grep -q "200\|301\|302"; then
        success "pgAdmin ist erreichbar! ✅"
    else
        warning "pgAdmin antwortet nicht wie erwartet"
        info "Teste manuell im Browser: http://$SERVER_IP:1880/pgadmin4"
    fi
else
    error "Apache2 läuft immer noch nicht"
    echo ""
    echo -e "${YELLOW}Manuelle Schritte:${NC}"
    echo -e "  ${CYAN}1.${NC} Logs ansehen: ${CYAN}journalctl -u apache2 -n 50${NC}"
    echo -e "  ${CYAN}2.${NC} Config testen: ${CYAN}apache2ctl configtest${NC}"
    echo -e "  ${CYAN}3.${NC} pgAdmin neu installieren: ${CYAN}apt-get install --reinstall pgadmin4-web${NC}"
fi

echo ""
