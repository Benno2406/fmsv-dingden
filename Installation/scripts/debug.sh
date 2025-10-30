#!/bin/bash

################################################################################
# FMSV Dingden - System Debug & Diagnose Script
# Kombiniert: Pre-Installation Check, 500 Error Diagnose, Cloudflare Test
# Version: 3.0
################################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

clear

show_menu() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║         FMSV Dingden - Debug & Diagnose Tool               ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Wähle eine Option:${NC}"
    echo ""
    echo -e "  ${GREEN}[1]${NC} Pre-Installation Check"
    echo -e "      ${CYAN}→ System-Voraussetzungen prüfen${NC}"
    echo ""
    echo -e "  ${GREEN}[2]${NC} 500 Error Diagnose"
    echo -e "      ${CYAN}→ Backend/Nginx/Datenbank Probleme finden${NC}"
    echo ""
    echo -e "  ${GREEN}[3]${NC} Cloudflare Tunnel Test"
    echo -e "      ${CYAN}→ Cloudflare Konfiguration prüfen${NC}"
    echo ""
    echo -e "  ${GREEN}[4]${NC} Vollständige System-Diagnose"
    echo -e "      ${CYAN}→ Alle Tests durchführen${NC}"
    echo ""
    echo -e "  ${GREEN}[5]${NC} Logs anzeigen"
    echo -e "      ${CYAN}→ Backend/Nginx/Postgres Logs${NC}"
    echo ""
    echo -e "  ${GREEN}[0]${NC} Beenden"
    echo ""
    echo -ne "${BLUE}►${NC} Deine Wahl: "
    read CHOICE
    echo ""
}

################################################################################
# 1. Pre-Installation Check
################################################################################

pre_install_check() {
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}Pre-Installation Check${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    
    ERRORS=0
    
    # 1. Root-Check
    echo -n "1. Root-Rechte... "
    if [ "$EUID" -eq 0 ]; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
        echo -e "   ${YELLOW}Bitte mit sudo ausführen!${NC}"
        ((ERRORS++))
    fi
    
    # 2. Internet-Verbindung
    echo -n "2. Internet-Verbindung... "
    if ping -c 1 google.com &> /dev/null; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
        echo -e "   ${YELLOW}Keine Internet-Verbindung!${NC}"
        ((ERRORS++))
    fi
    
    # 3. DNS-Auflösung
    echo -n "3. DNS (github.com)... "
    if nslookup github.com &> /dev/null; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
        echo -e "   ${YELLOW}DNS-Problem!${NC}"
        ((ERRORS++))
    fi
    
    # 4. apt update Test
    echo -n "4. apt update Test... "
    if apt-get update -qq > /tmp/apt-test.log 2>&1; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
        echo -e "   ${YELLOW}apt update fehlgeschlagen!${NC}"
        echo "   Fehler:"
        tail -n 5 /tmp/apt-test.log | sed 's/^/   /'
        ((ERRORS++))
    fi
    
    # 5. Speicherplatz
    echo -n "5. Freier Speicherplatz... "
    AVAILABLE=$(df / | awk 'NR==2 {print $4}')
    AVAILABLE_GB=$((AVAILABLE / 1024 / 1024))
    if [ "$AVAILABLE" -gt 2097152 ]; then
        echo -e "${GREEN}✓ ${AVAILABLE_GB}GB${NC}"
    else
        echo -e "${YELLOW}⚠ ${AVAILABLE_GB}GB (< 2GB - könnte knapp werden!)${NC}"
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
        ((ERRORS++))
    fi
    
    # 8. curl vorhanden
    echo -n "8. curl installiert... "
    if command -v curl &> /dev/null; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
        echo -e "   ${YELLOW}Installiere: apt install curl${NC}"
        ((ERRORS++))
    fi
    
    # 9. git vorhanden
    echo -n "9. git installiert... "
    if command -v git &> /dev/null; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
        echo -e "   ${YELLOW}Installiere: apt install git${NC}"
        ((ERRORS++))
    fi
    
    # 10. Repository-Zugriff
    echo -n "10. GitHub erreichbar... "
    if curl -s --head https://github.com | head -n 1 | grep -q "HTTP/2 200"; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
        echo -e "    ${YELLOW}GitHub nicht erreichbar!${NC}"
        ((ERRORS++))
    fi
    
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}System-Informationen${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    
    echo "Hostname:       $(hostname)"
    echo "Betriebssystem: $(lsb_release -d 2>/dev/null | cut -f2 || echo "unbekannt")"
    echo "Kernel:         $(uname -r)"
    echo "CPU:            $(nproc) Cores"
    echo "RAM:            $(free -h | awk 'NR==2 {print $2}')"
    echo "Swap:           $(free -h | awk 'NR==3 {print $2}')"
    echo ""
    
    # Zusammenfassung
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    if [ $ERRORS -eq 0 ]; then
        echo -e "${GREEN}✅ Alle Prüfungen bestanden!${NC}"
        echo ""
        echo "Installation kann gestartet werden:"
        echo -e "  ${CYAN}cd /var/www/fmsv-dingden/Installation/scripts${NC}"
        echo -e "  ${CYAN}./install.sh${NC}"
    else
        echo -e "${RED}❌ $ERRORS Problem(e) gefunden${NC}"
        echo ""
        echo "Bitte behebe die Probleme vor der Installation!"
    fi
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

################################################################################
# 2. 500 Error Diagnose
################################################################################

diagnose_500() {
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}500 Error Diagnose${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    
    ERRORS=0
    
    # Backend Service
    echo -e "${BLUE}[1/5]${NC} Backend Service Status..."
    if systemctl is-active --quiet fmsv-backend; then
        echo -e "      ${GREEN}✅ Backend läuft${NC}"
        
        # Port Check
        if netstat -tulpn 2>/dev/null | grep -q ':3000'; then
            echo -e "      ${GREEN}✅ Port 3000 aktiv${NC}"
        else
            echo -e "      ${RED}❌ Port 3000 nicht aktiv${NC}"
            ((ERRORS++))
        fi
    else
        echo -e "      ${RED}❌ Backend läuft nicht!${NC}"
        echo ""
        echo -e "      ${YELLOW}Fehler-Logs:${NC}"
        journalctl -u fmsv-backend -n 10 --no-pager | sed 's/^/      /'
        ((ERRORS++))
    fi
    echo ""
    
    # Nginx
    echo -e "${BLUE}[2/5]${NC} Nginx Status..."
    if systemctl is-active --quiet nginx; then
        echo -e "      ${GREEN}✅ Nginx läuft${NC}"
        
        # Nginx Config Test
        if nginx -t &> /dev/null; then
            echo -e "      ${GREEN}✅ Nginx Konfiguration OK${NC}"
        else
            echo -e "      ${RED}❌ Nginx Konfiguration fehlerhaft${NC}"
            nginx -t 2>&1 | sed 's/^/      /'
            ((ERRORS++))
        fi
    else
        echo -e "      ${RED}❌ Nginx läuft nicht!${NC}"
        echo ""
        echo -e "      ${YELLOW}Fehler-Logs:${NC}"
        journalctl -u nginx -n 10 --no-pager | sed 's/^/      /'
        ((ERRORS++))
    fi
    echo ""
    
    # PostgreSQL
    echo -e "${BLUE}[3/5]${NC} PostgreSQL Status..."
    if systemctl is-active --quiet postgresql; then
        echo -e "      ${GREEN}✅ PostgreSQL läuft${NC}"
        
        # Datenbank Check
        if su - postgres -c "psql -lqt" 2>/dev/null | cut -d \| -f 1 | grep -qw fmsv_dingden; then
            echo -e "      ${GREEN}✅ Datenbank 'fmsv_dingden' existiert${NC}"
        else
            echo -e "      ${RED}❌ Datenbank 'fmsv_dingden' nicht gefunden${NC}"
            ((ERRORS++))
        fi
    else
        echo -e "      ${RED}❌ PostgreSQL läuft nicht!${NC}"
        systemctl start postgresql
        sleep 2
        if systemctl is-active --quiet postgresql; then
            echo -e "      ${GREEN}✅ PostgreSQL wurde gestartet${NC}"
        else
            echo -e "      ${RED}❌ PostgreSQL konnte nicht gestartet werden${NC}"
            ((ERRORS++))
        fi
    fi
    echo ""
    
    # Environment Variablen
    echo -e "${BLUE}[4/5]${NC} Environment Variablen..."
    if [ -f /var/www/fmsv-dingden/backend/.env ]; then
        echo -e "      ${GREEN}✅ .env Datei existiert${NC}"
        
        # Prüfe wichtige Variablen
        if grep -q "DATABASE_URL=" /var/www/fmsv-dingden/backend/.env; then
            echo -e "      ${GREEN}✅ DATABASE_URL gesetzt${NC}"
        else
            echo -e "      ${RED}❌ DATABASE_URL fehlt${NC}"
            ((ERRORS++))
        fi
        
        if grep -q "JWT_SECRET=" /var/www/fmsv-dingden/backend/.env; then
            echo -e "      ${GREEN}✅ JWT_SECRET gesetzt${NC}"
        else
            echo -e "      ${RED}❌ JWT_SECRET fehlt${NC}"
            ((ERRORS++))
        fi
    else
        echo -e "      ${RED}❌ .env Datei nicht gefunden!${NC}"
        ((ERRORS++))
    fi
    echo ""
    
    # Dateiberechtigungen
    echo -e "${BLUE}[5/5]${NC} Dateiberechtigungen..."
    if [ -d /var/www/fmsv-dingden ]; then
        OWNER=$(stat -c '%U' /var/www/fmsv-dingden)
        if [ "$OWNER" = "www-data" ] || [ "$OWNER" = "root" ]; then
            echo -e "      ${GREEN}✅ Besitzer: $OWNER${NC}"
        else
            echo -e "      ${YELLOW}⚠ Besitzer: $OWNER (erwartet: www-data)${NC}"
        fi
        
        # Saves Verzeichnis
        if [ -d /var/www/fmsv-dingden/Saves ]; then
            if [ -w /var/www/fmsv-dingden/Saves ]; then
                echo -e "      ${GREEN}✅ Saves/ beschreibbar${NC}"
            else
                echo -e "      ${RED}❌ Saves/ nicht beschreibbar${NC}"
                ((ERRORS++))
            fi
        fi
        
        # Logs Verzeichnis
        if [ -d /var/www/fmsv-dingden/Logs ]; then
            if [ -w /var/www/fmsv-dingden/Logs ]; then
                echo -e "      ${GREEN}✅ Logs/ beschreibbar${NC}"
            else
                echo -e "      ${RED}❌ Logs/ nicht beschreibbar${NC}"
                ((ERRORS++))
            fi
        fi
    fi
    echo ""
    
    # Zusammenfassung
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    if [ $ERRORS -eq 0 ]; then
        echo -e "${GREEN}✅ Keine Probleme gefunden!${NC}"
        echo ""
        echo "Wenn trotzdem 500 Fehler auftreten:"
        echo -e "  ${CYAN}journalctl -u fmsv-backend -f${NC}  (Live-Logs)"
        echo -e "  ${CYAN}tail -f /var/log/nginx/error.log${NC}"
    else
        echo -e "${RED}❌ $ERRORS Problem(e) gefunden${NC}"
        echo ""
        echo -e "${YELLOW}Schnelle Lösungen:${NC}"
        echo -e "  ${CYAN}systemctl restart fmsv-backend${NC}  (Backend neustarten)"
        echo -e "  ${CYAN}systemctl restart nginx${NC}         (Nginx neustarten)"
        echo -e "  ${CYAN}systemctl restart postgresql${NC}    (PostgreSQL neustarten)"
        echo ""
        echo -e "${YELLOW}Update-Script ausführen:${NC}"
        echo -e "  ${CYAN}./update.sh${NC}"
    fi
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

################################################################################
# 3. Cloudflare Tunnel Test
################################################################################

test_cloudflare() {
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}Cloudflare Tunnel Test${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    
    # cloudflared installiert?
    echo -n "1. cloudflared installiert... "
    if command -v cloudflared &> /dev/null; then
        VERSION=$(cloudflared --version 2>/dev/null | head -1)
        echo -e "${GREEN}✓ $VERSION${NC}"
    else
        echo -e "${RED}✗${NC}"
        echo ""
        echo -e "${YELLOW}cloudflared ist nicht installiert!${NC}"
        echo ""
        echo "Installation:"
        echo -e "  ${CYAN}curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | gpg --dearmor -o /usr/share/keyrings/cloudflare-main.gpg${NC}"
        echo -e "  ${CYAN}echo \"deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared \$(lsb_release -cs) main\" > /etc/apt/sources.list.d/cloudflared.list${NC}"
        echo -e "  ${CYAN}apt update && apt install -y cloudflared${NC}"
        echo ""
        return 1
    fi
    
    # Login Status
    echo -n "2. Cloudflare Login... "
    if [ -f ~/.cloudflared/cert.pem ]; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
        echo -e "   ${YELLOW}Nicht eingeloggt!${NC}"
        echo ""
        echo "Login:"
        echo -e "  ${CYAN}cloudflared tunnel login${NC}"
        echo ""
        return 1
    fi
    
    # Tunnel existiert?
    echo -n "3. Tunnel 'fmsv-dingden'... "
    if cloudflared tunnel list 2>/dev/null | grep -q "fmsv-dingden"; then
        echo -e "${GREEN}✓${NC}"
        
        # Tunnel ID
        TUNNEL_ID=$(cloudflared tunnel list 2>/dev/null | grep "fmsv-dingden" | awk '{print $1}')
        echo -e "   ${CYAN}Tunnel ID: $TUNNEL_ID${NC}"
    else
        echo -e "${RED}✗${NC}"
        echo -e "   ${YELLOW}Tunnel nicht gefunden!${NC}"
        echo ""
        echo "Tunnel erstellen:"
        echo -e "  ${CYAN}cloudflared tunnel create fmsv-dingden${NC}"
        echo ""
        return 1
    fi
    
    # Service läuft?
    echo -n "4. Cloudflare Service... "
    if systemctl is-active --quiet cloudflared; then
        echo -e "${GREEN}✓ läuft${NC}"
    else
        echo -e "${RED}✗ läuft nicht${NC}"
        echo ""
        echo "Service starten:"
        echo -e "  ${CYAN}systemctl start cloudflared${NC}"
        echo -e "  ${CYAN}systemctl enable cloudflared${NC}"
        echo ""
    fi
    
    # Config existiert?
    echo -n "5. Tunnel Config... "
    if [ -f /etc/cloudflared/config.yml ]; then
        echo -e "${GREEN}✓${NC}"
        echo ""
        echo -e "${CYAN}Config Inhalt:${NC}"
        cat /etc/cloudflared/config.yml | sed 's/^/   /'
    else
        echo -e "${RED}✗${NC}"
        echo -e "   ${YELLOW}/etc/cloudflared/config.yml nicht gefunden${NC}"
    fi
    
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}Test abgeschlossen${NC}"
    echo ""
    echo "Nützliche Befehle:"
    echo -e "  ${CYAN}cloudflared tunnel list${NC}           (Alle Tunnels)"
    echo -e "  ${CYAN}systemctl status cloudflared${NC}     (Service Status)"
    echo -e "  ${CYAN}journalctl -u cloudflared -f${NC}     (Live Logs)"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

################################################################################
# 4. Vollständige Diagnose
################################################################################

full_diagnosis() {
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}Vollständige System-Diagnose${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    
    echo -e "${MAGENTA}[1/3] Pre-Installation Check...${NC}"
    echo ""
    pre_install_check
    
    echo ""
    read -p "Weiter mit Enter..."
    echo ""
    
    echo -e "${MAGENTA}[2/3] 500 Error Diagnose...${NC}"
    echo ""
    diagnose_500
    
    echo ""
    read -p "Weiter mit Enter..."
    echo ""
    
    echo -e "${MAGENTA}[3/3] Cloudflare Test...${NC}"
    echo ""
    test_cloudflare
    
    echo ""
    echo -e "${GREEN}✅ Vollständige Diagnose abgeschlossen${NC}"
    echo ""
}

################################################################################
# 5. Logs anzeigen
################################################################################

show_logs() {
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}Logs anzeigen${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    
    echo -e "${YELLOW}Wähle einen Log-Typ:${NC}"
    echo ""
    echo -e "  ${GREEN}[1]${NC} Backend Logs (letzte 50 Zeilen)"
    echo -e "  ${GREEN}[2]${NC} Backend Live-Logs (mit -f)"
    echo -e "  ${GREEN}[3]${NC} Nginx Error Logs"
    echo -e "  ${GREEN}[4]${NC} Nginx Access Logs"
    echo -e "  ${GREEN}[5]${NC} PostgreSQL Logs"
    echo -e "  ${GREEN}[6]${NC} Cloudflare Logs"
    echo -e "  ${GREEN}[7]${NC} Installation Logs"
    echo -e "  ${GREEN}[0]${NC} Zurück"
    echo ""
    echo -ne "${BLUE}►${NC} Deine Wahl: "
    read LOG_CHOICE
    echo ""
    
    case $LOG_CHOICE in
        1)
            echo -e "${CYAN}Backend Logs:${NC}"
            echo ""
            journalctl -u fmsv-backend -n 50 --no-pager
            ;;
        2)
            echo -e "${CYAN}Backend Live-Logs (Strg+C zum Beenden):${NC}"
            echo ""
            journalctl -u fmsv-backend -f
            ;;
        3)
            echo -e "${CYAN}Nginx Error Logs:${NC}"
            echo ""
            if [ -f /var/log/nginx/error.log ]; then
                tail -n 50 /var/log/nginx/error.log
            else
                echo -e "${YELLOW}Keine Error Logs gefunden${NC}"
            fi
            ;;
        4)
            echo -e "${CYAN}Nginx Access Logs:${NC}"
            echo ""
            if [ -f /var/log/nginx/access.log ]; then
                tail -n 50 /var/log/nginx/access.log
            else
                echo -e "${YELLOW}Keine Access Logs gefunden${NC}"
            fi
            ;;
        5)
            echo -e "${CYAN}PostgreSQL Logs:${NC}"
            echo ""
            journalctl -u postgresql -n 50 --no-pager
            ;;
        6)
            echo -e "${CYAN}Cloudflare Logs:${NC}"
            echo ""
            if systemctl list-units --all | grep -q cloudflared; then
                journalctl -u cloudflared -n 50 --no-pager
            else
                echo -e "${YELLOW}Cloudflare Service nicht gefunden${NC}"
            fi
            ;;
        7)
            echo -e "${CYAN}Installation Logs:${NC}"
            echo ""
            if [ -f /var/log/fmsv-install.log ]; then
                tail -n 50 /var/log/fmsv-install.log
            else
                echo -e "${YELLOW}Keine Installation Logs gefunden${NC}"
            fi
            ;;
        0)
            return
            ;;
        *)
            echo -e "${RED}Ungültige Eingabe${NC}"
            ;;
    esac
    
    echo ""
    read -p "Zurück zum Menü mit Enter..."
}

################################################################################
# Main Loop
################################################################################

# Root Check
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Dieses Script muss als root ausgeführt werden!${NC}"
    echo ""
    echo "Bitte ausführen mit:"
    echo -e "  ${CYAN}sudo $0${NC}"
    echo ""
    exit 1
fi

while true; do
    show_menu
    
    case $CHOICE in
        1)
            clear
            pre_install_check
            read -p "Zurück zum Menü mit Enter..."
            clear
            ;;
        2)
            clear
            diagnose_500
            read -p "Zurück zum Menü mit Enter..."
            clear
            ;;
        3)
            clear
            test_cloudflare
            read -p "Zurück zum Menü mit Enter..."
            clear
            ;;
        4)
            clear
            full_diagnosis
            read -p "Zurück zum Menü mit Enter..."
            clear
            ;;
        5)
            clear
            show_logs
            clear
            ;;
        0)
            echo -e "${GREEN}Auf Wiedersehen!${NC}"
            echo ""
            exit 0
            ;;
        *)
            echo -e "${RED}Ungültige Eingabe!${NC}"
            sleep 1
            clear
            ;;
    esac
done
