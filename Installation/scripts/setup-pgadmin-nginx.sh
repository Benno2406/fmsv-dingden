#!/bin/bash

################################################################################
# pgAdmin Nginx Reverse Proxy Setup Script
# Für nachträgliche Installation des Nginx Reverse Proxy
################################################################################

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Funktionen
error() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Root-Check
if [[ $EUID -ne 0 ]]; then
   error "Dieses Script muss als root ausgeführt werden (sudo)"
fi

clear
echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║       pgAdmin 4 - Nginx Reverse Proxy Setup           ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Prüfe ob Nginx installiert ist
if ! command -v nginx &> /dev/null; then
    error "Nginx ist nicht installiert! Bitte zuerst installieren: sudo apt-get install nginx"
fi

# Prüfe ob Apache auf Port 1880 läuft
if ! netstat -tuln 2>/dev/null | grep -q ":1880"; then
    error "Apache läuft nicht auf Port 1880! pgAdmin nicht korrekt installiert?"
fi

success "Nginx ist installiert"
success "Apache läuft auf Port 1880"

echo ""
echo -e "${CYAN}Konfiguration:${NC}"
echo ""

# Frage nach Domain
read -p "Subdomain für pgAdmin (z.B. pgadmin.example.com): " PGADMIN_DOMAIN

if [ -z "$PGADMIN_DOMAIN" ]; then
    error "Keine Domain eingegeben, Abbruch"
fi

# Prüfe ob Config bereits existiert
if [ -f "/etc/nginx/sites-available/$PGADMIN_DOMAIN" ]; then
    warning "Konfiguration existiert bereits!"
    echo ""
    read -p "Überschreiben? (j/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Jj]$ ]]; then
        error "Abgebrochen"
    fi
fi

# Erstelle Nginx Config
info "Erstelle Nginx-Konfiguration..."

cat > "/etc/nginx/sites-available/$PGADMIN_DOMAIN" << EOF
# pgAdmin 4 Reverse Proxy
# Erstellt am: $(date '+%Y-%m-%d %H:%M:%S')

server {
    listen 80;
    listen [::]:80;
    server_name $PGADMIN_DOMAIN;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Logging
    access_log /var/log/nginx/${PGADMIN_DOMAIN}_access.log;
    error_log /var/log/nginx/${PGADMIN_DOMAIN}_error.log;
    
    # Client Settings
    client_max_body_size 50M;
    
    # Reverse Proxy zu Apache auf Port 1880
    location / {
        proxy_pass http://localhost:1880;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket Support (für pgAdmin Features)
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts für lange Queries
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
        proxy_read_timeout 300;
        send_timeout 300;
        
        # Buffer Settings
        proxy_buffering off;
        proxy_request_buffering off;
    }
    
    # Health Check Endpoint
    location /health {
        access_log off;
        return 200 "OK\n";
        add_header Content-Type text/plain;
    }
}
EOF

success "Nginx-Konfiguration erstellt"

# Symlink erstellen
info "Aktiviere Site..."
ln -sf "/etc/nginx/sites-available/$PGADMIN_DOMAIN" "/etc/nginx/sites-enabled/"
success "Site aktiviert"

# Nginx Config testen
echo ""
info "Teste Nginx-Konfiguration..."

if nginx -t > /dev/null 2>&1; then
    success "Nginx-Konfiguration OK"
    
    # Nginx neu laden
    info "Lade Nginx neu..."
    systemctl reload nginx
    success "Nginx neu geladen"
    
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║         Nginx Reverse Proxy eingerichtet! ✓           ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    echo -e "${CYAN}Zugriff (nach DNS-Setup):${NC}"
    echo -e "  ${GREEN}►${NC} http://$PGADMIN_DOMAIN"
    echo ""
    
    echo -e "${YELLOW}Nächste Schritte:${NC}"
    echo ""
    
    echo -e "${CYAN}1. DNS A-Record erstellen:${NC}"
    echo -e "   Domain: ${GREEN}$PGADMIN_DOMAIN${NC}"
    echo -e "   Typ:    ${GREEN}A${NC}"
    echo -e "   Wert:   ${GREEN}$(hostname -I | awk '{print $1}')${NC}"
    echo ""
    
    echo -e "${CYAN}2. Testen (nach DNS-Propagierung):${NC}"
    echo -e "   ${BLUE}curl -I http://$PGADMIN_DOMAIN/health${NC}"
    echo -e "   Sollte '200 OK' zurückgeben"
    echo ""
    
    echo -e "${CYAN}3. SSL-Zertifikat installieren (empfohlen):${NC}"
    echo -e "   ${BLUE}sudo certbot --nginx -d $PGADMIN_DOMAIN${NC}"
    echo ""
    echo -e "   Certbot wird automatisch:"
    echo -e "   • SSL-Zertifikat von Let's Encrypt holen"
    echo -e "   • Nginx-Config für HTTPS anpassen"
    echo -e "   • HTTP → HTTPS Redirect einrichten"
    echo -e "   • Auto-Renewal konfigurieren"
    echo ""
    
    echo -e "${CYAN}4. Firewall prüfen:${NC}"
    if command -v ufw &> /dev/null; then
        UFW_STATUS=$(ufw status | grep -c "Status: active")
        if [ "$UFW_STATUS" -eq 1 ]; then
            echo -e "   UFW ist aktiv:"
            echo -e "   ${BLUE}sudo ufw allow 'Nginx Full'${NC}"
        else
            echo -e "   ${GREEN}UFW nicht aktiv${NC}"
        fi
    else
        echo -e "   ${GREEN}UFW nicht installiert${NC}"
    fi
    echo ""
    
    echo -e "${CYAN}Optional - IP-Whitelist einrichten:${NC}"
    echo -e "   Bearbeite: ${BLUE}sudo nano /etc/nginx/sites-available/$PGADMIN_DOMAIN${NC}"
    echo -e "   Füge hinzu:"
    echo -e "   ${YELLOW}location / {${NC}"
    echo -e "   ${YELLOW}    allow 192.168.178.0/24;  # Dein Netzwerk${NC}"
    echo -e "   ${YELLOW}    deny all;${NC}"
    echo -e "   ${YELLOW}    proxy_pass ...${NC}"
    echo -e "   ${YELLOW}}${NC}"
    echo ""
    
    # Zeige aktuelle Nginx-Sites
    echo -e "${CYAN}Aktive Nginx-Sites:${NC}"
    ls -la /etc/nginx/sites-enabled/ | grep -v "^total" | grep -v "^d" | awk '{print "  " $9}' | sed 's/^/  /'
    echo ""
    
else
    error "Nginx-Konfiguration fehlerhaft!"
    echo ""
    echo -e "${RED}Fehlerdetails:${NC}"
    nginx -t
    echo ""
    
    # Cleanup
    warning "Entferne fehlerhafte Konfiguration..."
    rm -f "/etc/nginx/sites-enabled/$PGADMIN_DOMAIN"
    rm -f "/etc/nginx/sites-available/$PGADMIN_DOMAIN"
    
    echo ""
    echo -e "${CYAN}Mögliche Ursachen:${NC}"
    echo -e "  • Syntax-Fehler in der Konfiguration"
    echo -e "  • Konflikte mit anderen Sites"
    echo -e "  • Fehlende Nginx-Module"
    echo ""
    
    error "Setup fehlgeschlagen"
fi
