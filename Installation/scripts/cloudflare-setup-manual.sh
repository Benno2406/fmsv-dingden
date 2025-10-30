#!/bin/bash

################################################################################
# Cloudflare Tunnel - Manuelle Setup-Hilfe für SSH-Nutzer
################################################################################

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
clear
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}Cloudflare Tunnel - SSH Setup Hilfe${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

################################################################################
# Prüfung: Läuft als root?
################################################################################

if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}✗ Fehler: Script muss als root ausgeführt werden!${NC}"
    echo ""
    echo "Lösung:"
    echo "  su -"
    echo "  ./cloudflare-setup-manual.sh"
    exit 1
fi

################################################################################
# Schritt 1: Prüfe ob cloudflared installiert ist
################################################################################

echo -e "${YELLOW}Schritt 1: Cloudflared Installation prüfen${NC}"
echo ""

if ! command -v cloudflared &> /dev/null; then
    echo -e "${YELLOW}Cloudflared nicht gefunden. Installiere...${NC}"
    
    # GPG Key
    mkdir -p --mode=0755 /usr/share/keyrings
    curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null
    
    # Repository
    echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/cloudflared.list
    
    # Installieren
    apt-get update -qq
    apt-get install -y cloudflared
    
    echo -e "${GREEN}✓ Cloudflared installiert${NC}"
else
    echo -e "${GREEN}✓ Cloudflared bereits installiert${NC}"
fi
echo ""

################################################################################
# Schritt 2: Prüfe ob cert.pem existiert
################################################################################

echo -e "${YELLOW}Schritt 2: Cloudflare Authentifizierung prüfen${NC}"
echo ""

if [ -f "/root/.cloudflared/cert.pem" ]; then
    echo -e "${GREEN}✓ Cloudflare Zertifikat gefunden!${NC}"
    echo "  Datei: /root/.cloudflared/cert.pem"
    echo ""
    
    read -p "Neu authentifizieren? (j/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Jj]$ ]]; then
        echo "Verwende bestehendes Zertifikat."
        echo ""
    else
        rm -f /root/.cloudflared/cert.pem
    fi
fi

if [ ! -f "/root/.cloudflared/cert.pem" ]; then
    echo -e "${RED}✗ Kein Cloudflare Zertifikat gefunden${NC}"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${YELLOW}⚠️  SSH/PuTTY kann keinen Browser öffnen!${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Du hast 3 Möglichkeiten:"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${GREEN}Option 1: Token auf lokalem PC erstellen (EMPFOHLEN)${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "1. Auf deinem PC/Laptop (nicht Server!):"
    echo ""
    echo "   # Windows (PowerShell):"
    echo "   winget install --id Cloudflare.cloudflared"
    echo "   cloudflared tunnel login"
    echo ""
    echo "   # macOS:"
    echo "   brew install cloudflared"
    echo "   cloudflared tunnel login"
    echo ""
    echo "   # Linux:"
    echo "   # Download von: https://github.com/cloudflare/cloudflared/releases"
    echo "   cloudflared tunnel login"
    echo ""
    echo "2. Browser öffnet sich → Anmelden → Domain auswählen"
    echo ""
    echo "3. Tunnel erstellen:"
    echo "   cloudflared tunnel create fmsv-dingden"
    echo ""
    echo "4. Tunnel-ID notieren:"
    echo "   cloudflared tunnel list"
    echo ""
    echo "5. Dateien auf Server kopieren (SCP/WinSCP):"
    echo ""
    echo "   Quelle (PC):"
    echo "   - Windows: C:\\Users\\DeinName\\.cloudflared\\cert.pem"
    echo "   - Windows: C:\\Users\\DeinName\\.cloudflared\\<Tunnel-ID>.json"
    echo "   - macOS/Linux: ~/.cloudflared/cert.pem"
    echo "   - macOS/Linux: ~/.cloudflared/<Tunnel-ID>.json"
    echo ""
    echo "   Ziel (Server):"
    echo "   - /root/.cloudflared/cert.pem"
    echo "   - /root/.cloudflared/<Tunnel-ID>.json"
    echo ""
    echo "   # SCP Befehl (von PC):"
    echo "   scp ~/.cloudflared/cert.pem root@$(hostname -I | awk '{print $1}'):/root/.cloudflared/"
    echo "   scp ~/.cloudflared/*.json root@$(hostname -I | awk '{print $1}'):/root/.cloudflared/"
    echo ""
    echo "6. Danach dieses Script erneut ausführen!"
    echo ""
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${GREEN}Option 2: URL manuell öffnen${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "1. Führe aus:"
    echo "   cloudflared tunnel login"
    echo ""
    echo "2. URL kopieren (beginnt mit https://dash.cloudflare.com/...)"
    echo ""
    echo "3. URL auf deinem PC im Browser öffnen"
    echo ""
    echo "4. Anmelden → Domain auswählen → Authorize"
    echo ""
    echo "5. Zurück zum Server - Zertifikat sollte erstellt sein"
    echo ""
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${GREEN}Option 3: Vollständige Anleitung${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Siehe: Installation/CLOUDFLARE-SSH-LOGIN.md"
    echo ""
    echo "Oder online:"
    echo "cat /var/www/fmsv-dingden/Installation/CLOUDFLARE-SSH-LOGIN.md | less"
    echo ""
    echo ""
    
    read -p "Jetzt Login versuchen? (j/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Jj]$ ]]; then
        echo ""
        echo "Starte Login..."
        echo ""
        echo "WICHTIG:"
        echo "- URL im Terminal kopieren"
        echo "- Auf deinem PC im Browser öffnen"
        echo "- Nach erfolgreichem Login: Strg+C hier drücken"
        echo ""
        cloudflared tunnel login
    else
        echo ""
        echo "Bitte folge den Anweisungen oben."
        echo "Danach dieses Script erneut ausführen."
        exit 0
    fi
fi

################################################################################
# Schritt 3: Tunnel-Info abfragen
################################################################################

echo ""
echo -e "${YELLOW}Schritt 3: Tunnel-Konfiguration${NC}"
echo ""

# Prüfe ob bereits Tunnel-Credentials existieren
EXISTING_CREDS=$(ls /root/.cloudflared/*.json 2>/dev/null | head -1)

if [ -n "$EXISTING_CREDS" ]; then
    TUNNEL_ID=$(basename "$EXISTING_CREDS" .json)
    echo -e "${GREEN}✓ Tunnel-Credentials gefunden!${NC}"
    echo "  Tunnel-ID: $TUNNEL_ID"
    echo ""
    
    read -p "Diesen Tunnel verwenden? (j/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Jj]$ ]]; then
        EXISTING_CREDS=""
    fi
fi

if [ -z "$EXISTING_CREDS" ]; then
    echo "Bitte Tunnel-ID eingeben:"
    echo "(Falls du den Tunnel auf deinem PC erstellt hast)"
    echo ""
    read -p "Tunnel-ID: " TUNNEL_ID
    
    if [ -z "$TUNNEL_ID" ]; then
        echo -e "${RED}✗ Keine Tunnel-ID angegeben!${NC}"
        echo ""
        echo "Tunnel auf deinem PC erstellen:"
        echo "  cloudflared tunnel create fmsv-dingden"
        echo ""
        exit 1
    fi
    
    # Prüfe ob Credentials-Datei existiert
    if [ ! -f "/root/.cloudflared/$TUNNEL_ID.json" ]; then
        echo -e "${RED}✗ Credentials-Datei nicht gefunden!${NC}"
        echo ""
        echo "Erwartet: /root/.cloudflared/$TUNNEL_ID.json"
        echo ""
        echo "Bitte kopiere die Datei von deinem PC:"
        echo "  scp ~/.cloudflared/$TUNNEL_ID.json root@$(hostname -I | awk '{print $1}'):/root/.cloudflared/"
        echo ""
        exit 1
    fi
fi

################################################################################
# Schritt 4: Domain abfragen
################################################################################

echo ""
read -p "Domain/Subdomain [fmsv.bartholmes.eu]: " DOMAIN
if [ -z "$DOMAIN" ]; then
    DOMAIN="fmsv.bartholmes.eu"
fi

################################################################################
# Schritt 5: Backend-Port abfragen
################################################################################

echo ""
read -p "Backend-Port [3000]: " BACKEND_PORT
if [ -z "$BACKEND_PORT" ]; then
    BACKEND_PORT="3000"
fi

################################################################################
# Schritt 6: Config erstellen
################################################################################

echo ""
echo -e "${YELLOW}Schritt 4: Erstelle Tunnel-Konfiguration${NC}"
echo ""

mkdir -p /root/.cloudflared

cat > /root/.cloudflared/config.yml << EOF
tunnel: $TUNNEL_ID
credentials-file: /root/.cloudflared/$TUNNEL_ID.json

ingress:
  - hostname: $DOMAIN
    service: http://localhost:$BACKEND_PORT
  - service: http_status:404
EOF

chmod 600 /root/.cloudflared/config.yml

echo -e "${GREEN}✓ Config erstellt: /root/.cloudflared/config.yml${NC}"
echo ""

################################################################################
# Schritt 7: Tunnel testen
################################################################################

echo -e "${YELLOW}Schritt 5: Tunnel testen${NC}"
echo ""

echo "Teste Tunnel-Konfiguration..."
echo ""

timeout 5 cloudflared tunnel run fmsv-dingden 2>&1 | head -n 10 &
TUNNEL_PID=$!

sleep 3

if ps -p $TUNNEL_PID > /dev/null; then
    echo -e "${GREEN}✓ Tunnel läuft!${NC}"
    kill $TUNNEL_PID 2>/dev/null
else
    echo -e "${YELLOW}⚠ Tunnel-Test abgeschlossen${NC}"
fi

echo ""

################################################################################
# Schritt 8: DNS-Route Info
################################################################################

echo -e "${YELLOW}Schritt 6: DNS-Route erstellen${NC}"
echo ""

echo "DNS-Route muss noch erstellt werden!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Option 1: Auf deinem PC (mit cloudflared)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  cloudflared tunnel route dns fmsv-dingden $DOMAIN"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Option 2: Manuell im Cloudflare Dashboard"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. https://dash.cloudflare.com → Domain wählen"
echo "2. DNS → Add record"
echo "   - Type: CNAME"
echo "   - Name: ${DOMAIN%%.*} (oder @ für Root-Domain)"
echo "   - Target: $TUNNEL_ID.cfargotunnel.com"
echo "   - Proxy: ☑️ Proxied (Orange Cloud)"
echo ""

read -p "DNS-Route bereits erstellt? (j/n) " -n 1 -r
echo

################################################################################
# Schritt 9: Service installieren
################################################################################

echo ""
echo -e "${YELLOW}Schritt 7: Cloudflare Tunnel Service installieren${NC}"
echo ""

read -p "Tunnel als System-Service installieren? (j/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Jj]$ ]]; then
    cloudflared service install
    systemctl enable cloudflared
    systemctl start cloudflared
    
    sleep 2
    
    if systemctl is-active --quiet cloudflared; then
        echo -e "${GREEN}✓ Cloudflare Tunnel Service läuft!${NC}"
    else
        echo -e "${RED}✗ Service konnte nicht gestartet werden${NC}"
        echo ""
        echo "Logs anzeigen:"
        echo "  journalctl -u cloudflared -f"
    fi
else
    echo ""
    echo "Service nicht installiert."
    echo ""
    echo "Tunnel manuell starten:"
    echo "  cloudflared tunnel run fmsv-dingden"
    echo ""
    echo "Service später installieren:"
    echo "  cloudflared service install"
    echo "  systemctl enable cloudflared"
    echo "  systemctl start cloudflared"
fi

################################################################################
# Fertig
################################################################################

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Setup abgeschlossen!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Konfiguration:"
echo "  • Domain: $DOMAIN"
echo "  • Tunnel-ID: $TUNNEL_ID"
echo "  • Backend: http://localhost:$BACKEND_PORT"
echo ""
echo "Nächste Schritte:"
echo ""
echo "1. Stelle sicher, dass Backend läuft:"
echo "   systemctl status fmsv-backend"
echo ""
echo "2. Prüfe Cloudflare Tunnel:"
echo "   systemctl status cloudflared"
echo ""
echo "3. Teste Website:"
echo "   curl https://$DOMAIN"
echo ""
echo "Logs:"
echo "  • Backend: journalctl -u fmsv-backend -f"
echo "  • Tunnel: journalctl -u cloudflared -f"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
