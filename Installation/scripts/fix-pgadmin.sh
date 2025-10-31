#!/bin/bash

################################################################################
# pgAdmin 4 Quick-Fix Script
# 
# Behebt häufige pgAdmin-Probleme automatisch
################################################################################

set -e

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Funktionen
error() { echo -e "${RED}❌ $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

echo -e "${CYAN}"
cat << "EOF"
╔════════════════════════════════════════════════════════════╗
║            pgAdmin 4 Quick-Fix Script                     ║
╚════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"
echo ""

# Root-Check
if [ "$EUID" -ne 0 ]; then
    error "Bitte als root ausführen (sudo)"
    exit 1
fi

# Menü
echo -e "${YELLOW}Was möchtest du tun?${NC}"
echo ""
echo -e "  ${GREEN}1.${NC} Service-Probleme beheben (nicht startend)"
echo -e "  ${GREEN}2.${NC} Python-Dependencies reparieren (Flask-Fehler)"
echo -e "  ${GREEN}3.${NC} Admin-User zurücksetzen/erstellen"
echo -e "  ${GREEN}4.${NC} Apache2 entfernen (wichtig!)"
echo -e "  ${GREEN}5.${NC} Komplette Neuinstallation"
echo -e "  ${GREEN}6.${NC} Status & Health Check"
echo -e "  ${GREEN}7.${NC} Beenden"
echo ""
echo -ne "${BLUE}►${NC} Auswahl (1-7): "
read CHOICE
echo ""

case $CHOICE in
    1)
        echo -e "${CYAN}═══ Service-Probleme beheben ═══${NC}"
        echo ""
        
        info "Stoppe pgAdmin Service..."
        systemctl stop pgadmin4 2>/dev/null || true
        
        info "Prüfe Port 5050..."
        if lsof -i :5050 > /dev/null 2>&1; then
            warning "Port 5050 ist belegt!"
            echo ""
            lsof -i :5050
            echo ""
            echo -ne "Port 5050 freigeben? (J/n): "
            read KILL_PORT
            if [[ ! $KILL_PORT =~ ^[Nn]$ ]]; then
                PID=$(lsof -t -i :5050)
                kill -9 $PID
                success "Prozess beendet"
            fi
        else
            success "Port 5050 ist frei"
        fi
        
        info "Prüfe Berechtigungen..."
        chown -R www-data:www-data /var/lib/pgadmin 2>/dev/null || true
        chown -R www-data:www-data /var/log/pgadmin 2>/dev/null || true
        chmod 700 /var/lib/pgadmin 2>/dev/null || true
        success "Berechtigungen gesetzt"
        
        info "Starte pgAdmin Service..."
        systemctl daemon-reload
        systemctl start pgadmin4
        
        sleep 3
        
        if systemctl is-active --quiet pgadmin4; then
            success "pgAdmin läuft jetzt!"
            echo ""
            echo -e "${CYAN}Test:${NC} http://localhost:5050"
        else
            error "Service konnte nicht gestartet werden"
            echo ""
            echo -e "${YELLOW}Logs:${NC}"
            journalctl -u pgadmin4 -n 20 --no-pager
        fi
        ;;
        
    2)
        echo -e "${CYAN}═══ Python-Dependencies reparieren ═══${NC}"
        echo ""
        
        info "Installiere expect (für Setup)..."
        apt-get install -y -qq expect > /dev/null 2>&1
        success "expect installiert"
        
        info "Reinstalliere pgAdmin mit allen Dependencies..."
        apt-get install --reinstall -y pgadmin4-web
        success "pgAdmin reinstalliert"
        
        info "Setze Berechtigungen..."
        mkdir -p /var/lib/pgadmin /var/log/pgadmin
        chown -R www-data:www-data /var/lib/pgadmin
        chown -R www-data:www-data /var/log/pgadmin
        chmod 700 /var/lib/pgadmin
        success "Berechtigungen gesetzt"
        
        info "Starte Service neu..."
        systemctl daemon-reload
        systemctl restart pgadmin4
        
        sleep 3
        
        if systemctl is-active --quiet pgadmin4; then
            success "pgAdmin läuft!"
        else
            warning "Service läuft noch nicht - siehe Option 3 für User-Setup"
        fi
        ;;
        
    3)
        echo -e "${CYAN}═══ Admin-User zurücksetzen ═══${NC}"
        echo ""
        
        echo -ne "${BLUE}►${NC} E-Mail für Admin-User: "
        read ADMIN_EMAIL
        echo -ne "${BLUE}►${NC} Neues Passwort: "
        read -s ADMIN_PASSWORD
        echo ""
        echo ""
        
        info "Erstelle/Aktualisiere Admin-User..."
        
        # Setup-Script erstellen
        cat > /tmp/pgadmin-user-setup.sh <<'SETUP'
#!/bin/bash
EMAIL="$1"
PASSWORD="$2"

cd /usr/pgadmin4/web

sudo -u www-data python3 << EOF
import sys
sys.path.insert(0, '/usr/pgadmin4/web')

try:
    from pgadmin.setup import db, User
    from werkzeug.security import generate_password_hash
    from pgadmin import create_app
    
    app = create_app()
    
    with app.app_context():
        db.create_all()
        
        email = '$EMAIL'
        password = '$PASSWORD'
        
        user = User.query.filter_by(email=email).first()
        
        if user:
            user.password = generate_password_hash(password)
            db.session.commit()
            print(f'✅ Password für {email} aktualisiert!')
        else:
            user = User(
                email=email,
                password=generate_password_hash(password),
                active=True,
                role=1
            )
            db.session.add(user)
            db.session.commit()
            print(f'✅ User {email} erstellt!')
            
except Exception as e:
    print(f'❌ Fehler: {e}')
    print('')
    print('Versuche alternatives Setup...')
    
    # Fallback: Offizielles Setup
    import os
    os.system(f'/usr/pgadmin4/bin/setup-web.sh --yes')
EOF
SETUP
        
        chmod +x /tmp/pgadmin-user-setup.sh
        /tmp/pgadmin-user-setup.sh "$ADMIN_EMAIL" "$ADMIN_PASSWORD"
        rm /tmp/pgadmin-user-setup.sh
        
        echo ""
        success "Setup abgeschlossen!"
        echo ""
        echo -e "${CYAN}Login:${NC}"
        echo -e "  E-Mail:   ${GREEN}$ADMIN_EMAIL${NC}"
        echo -e "  Passwort: ${GREEN}[Das gerade eingegebene]${NC}"
        ;;
        
    4)
        echo -e "${CYAN}═══ Apache2 entfernen ═══${NC}"
        echo ""
        
        warning "Apache2 wird von pgAdmin's setup-web.sh installiert, aber wir nutzen nginx!"
        echo ""
        
        if systemctl is-active --quiet apache2 2>/dev/null; then
            error "Apache2 läuft gerade!"
            info "Stoppe Apache2..."
            systemctl stop apache2
            success "Apache2 gestoppt"
        else
            success "Apache2 läuft nicht"
        fi
        
        if systemctl is-enabled apache2 2>/dev/null; then
            info "Deaktiviere Apache2..."
            systemctl disable apache2
            success "Apache2 deaktiviert"
        else
            success "Apache2 ist nicht aktiviert"
        fi
        
        echo ""
        echo -ne "Apache2 komplett deinstallieren? (J/n): "
        read REMOVE_IT
        
        if [[ ! $REMOVE_IT =~ ^[Nn]$ ]]; then
            info "Entferne Apache2..."
            apt-get remove --purge -y apache2 apache2-bin apache2-data apache2-utils 2>/dev/null || true
            apt-get autoremove -y 2>/dev/null || true
            success "Apache2 entfernt"
        fi
        
        echo ""
        info "Starte pgAdmin neu..."
        systemctl restart pgadmin4
        
        if systemctl is-active --quiet pgadmin4; then
            success "pgAdmin läuft (OHNE Apache2)!"
        else
            warning "pgAdmin läuft noch nicht - siehe Option 1"
        fi
        ;;
        
    5)
        echo -e "${CYAN}═══ Komplette Neuinstallation ═══${NC}"
        echo ""
        warning "Dies entfernt ALLE pgAdmin-Daten!"
        echo ""
        echo -ne "Wirklich fortfahren? (ja/NEIN): "
        read CONFIRM
        
        if [ "$CONFIRM" != "ja" ]; then
            info "Abgebrochen"
            exit 0
        fi
        
        echo ""
        info "Stoppe Services..."
        systemctl stop pgadmin4 2>/dev/null || true
        systemctl disable pgadmin4 2>/dev/null || true
        
        info "Entferne pgAdmin..."
        apt-get remove --purge -y pgadmin4-web 2>/dev/null || true
        apt-get autoremove -y 2>/dev/null || true
        
        info "Lösche Daten..."
        rm -rf /var/lib/pgadmin
        rm -rf /var/log/pgadmin
        rm -rf /usr/pgadmin4
        rm -f /etc/systemd/system/pgadmin4.service
        
        info "Installiere pgAdmin neu..."
        apt-get update -qq
        apt-get install -y pgadmin4-web
        
        success "pgAdmin neu installiert!"
        echo ""
        echo -e "${YELLOW}Führe nun Option 3 aus, um Admin-User zu erstellen${NC}"
        ;;
        
    6)
        echo -e "${CYAN}═══ Status & Health Check ═══${NC}"
        echo ""
        
        echo -e "${YELLOW}1. Service Status:${NC}"
        if systemctl is-active --quiet pgadmin4; then
            success "pgAdmin Service läuft"
            systemctl status pgadmin4 --no-pager -l | head -15
        else
            error "pgAdmin Service läuft NICHT"
            systemctl status pgadmin4 --no-pager -l | head -15
        fi
        
        echo ""
        echo -e "${YELLOW}2. Port Check:${NC}"
        if ss -tln | grep -q ":5050"; then
            success "Port 5050 lauscht"
            ss -tlnp | grep 5050
        else
            error "Port 5050 lauscht NICHT"
        fi
        
        echo ""
        echo -e "${YELLOW}3. HTTP Check:${NC}"
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5050)
        if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "302" ]; then
            success "HTTP Response: $HTTP_CODE"
        else
            error "HTTP Response: $HTTP_CODE"
        fi
        
        echo ""
        echo -e "${YELLOW}4. Berechtigungen:${NC}"
        ls -la /var/lib/pgadmin 2>/dev/null | head -5 || error "/var/lib/pgadmin existiert nicht"
        
        echo ""
        echo -e "${YELLOW}5. Letzte Logs:${NC}"
        journalctl -u pgadmin4 -n 10 --no-pager
        
        echo ""
        echo -e "${YELLOW}6. nginx Proxy:${NC}"
        if [ -f /etc/nginx/sites-enabled/pgadmin ]; then
            success "nginx Config aktiv"
            if nginx -t 2>&1 | grep -q "successful"; then
                success "nginx Config OK"
            else
                warning "nginx Config hat Fehler"
            fi
        else
            warning "nginx Config nicht aktiv"
        fi
        
        echo ""
        echo -e "${YELLOW}7. Cloudflare Tunnel:${NC}"
        if command -v cloudflared &> /dev/null; then
            if cloudflared tunnel route dns list 2>/dev/null | grep -q "pgadmin"; then
                success "pgAdmin Subdomain konfiguriert"
            else
                warning "pgAdmin Subdomain fehlt in Cloudflare"
            fi
        else
            info "Cloudflare Tunnel nicht installiert"
        fi
        
        echo ""
        echo -e "${YELLOW}8. Apache2 Check:${NC}"
        if systemctl is-active --quiet apache2 2>/dev/null; then
            error "Apache2 läuft (nicht benötigt!)"
            echo -e "${YELLOW}   Nutze Option 4 um Apache2 zu entfernen${NC}"
        elif command -v apache2 &> /dev/null; then
            warning "Apache2 ist installiert aber inaktiv"
            echo -e "${YELLOW}   Nutze Option 4 um Apache2 zu entfernen${NC}"
        else
            success "Apache2 ist nicht installiert (gut!)"
        fi
        ;;
        
    7)
        info "Beendet"
        exit 0
        ;;
        
    *)
        error "Ungültige Auswahl"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}═══ Fertig! ═══${NC}"
echo ""
echo -e "${CYAN}Weitere Hilfe:${NC}"
echo -e "  ${YELLOW}•${NC} Troubleshooting: ${CYAN}Installation/Anleitung/pgAdmin-Troubleshooting.md${NC}"
echo -e "  ${YELLOW}•${NC} Setup-Anleitung: ${CYAN}Installation/Anleitung/pgAdmin-Setup.md${NC}"
echo ""
