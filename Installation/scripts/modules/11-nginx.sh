#!/bin/bash
################################################################################
# Modul: Nginx Installation & Konfiguration
# Installiert Nginx und erstellt Konfiguration für FMSV Dingden
################################################################################

################################################################################
# 1. Nginx installieren
################################################################################

info "Prüfe Nginx Installation..."

if systemctl is-active --quiet nginx 2>/dev/null; then
    NGINX_VERSION=$(nginx -v 2>&1 | awk -F/ '{print $2}')
    success "Nginx bereits installiert (Version $NGINX_VERSION)"
else
    info "Installiere Nginx..."
    
    if DEBIAN_FRONTEND=noninteractive apt-get install -y -qq nginx 2>&1 | tee -a "$LOG_FILE" > /dev/null; then
        success "Nginx installiert"
    else
        error "Nginx Installation fehlgeschlagen!"
        exit 1
    fi
fi

################################################################################
# 2. Nginx-Konfiguration erstellen
################################################################################

echo ""
info "Erstelle Nginx-Konfiguration..."

# Template-Verzeichnis
TEMPLATE_DIR="$SCRIPT_DIR/templates"

# Prüfe ob Cloudflare verwendet wird
if [[ $USE_CLOUDFLARE =~ ^[Jj]$ ]]; then
    info "Nginx-Config für Cloudflare Tunnel"
    TEMPLATE_FILE="$TEMPLATE_DIR/nginx-with-cloudflare.conf"
else
    info "Nginx-Config ohne Cloudflare"
    TEMPLATE_FILE="$TEMPLATE_DIR/nginx-without-cloudflare.conf"
fi

# Prüfe ob Template existiert
if [ -f "$TEMPLATE_FILE" ]; then
    info "Verwende Template: $(basename $TEMPLATE_FILE)"
    
    # Template kopieren und Variablen ersetzen
    cat "$TEMPLATE_FILE" | \
        sed "s|{{INSTALL_DIR}}|$INSTALL_DIR|g" | \
        sed "s|{{DOMAIN}}|$DOMAIN|g" \
        > /etc/nginx/sites-available/fmsv-dingden
    
    success "Nginx-Config aus Template erstellt"
else
    # Fallback: Erstelle Config direkt
    warning "Template nicht gefunden - erstelle Config direkt"
    
    if [[ $USE_CLOUDFLARE =~ ^[Jj]$ ]]; then
        # Cloudflare Config
        cat > /etc/nginx/sites-available/fmsv-dingden <<'EOF'
server {
    listen 80;
    server_name localhost;
    client_max_body_size 50M;
    
    root $INSTALL_DIR/dist;
    index index.html;
    
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    
    location /uploads/ {
        alias $INSTALL_DIR/Saves/;
        expires 30d;
    }
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF
    else
        # Ohne Cloudflare Config
        cat > /etc/nginx/sites-available/fmsv-dingden <<EOF
server {
    listen 80;
    server_name $DOMAIN _;
    client_max_body_size 50M;
    
    root $INSTALL_DIR/dist;
    index index.html;
    
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
    
    location /uploads/ {
        alias $INSTALL_DIR/Saves/;
        expires 30d;
    }
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF
    fi
    
    success "Nginx-Config erstellt (Fallback)"
fi

################################################################################
# 3. Nginx Site aktivieren
################################################################################

echo ""
info "Aktiviere Nginx Site..."

# Symlink erstellen
if ln -sf /etc/nginx/sites-available/fmsv-dingden /etc/nginx/sites-enabled/; then
    success "Site aktiviert"
else
    error "Konnte Site nicht aktivieren!"
    exit 1
fi

# Default Site deaktivieren
if [ -f /etc/nginx/sites-enabled/default ]; then
    rm -f /etc/nginx/sites-enabled/default
    info "Default Site deaktiviert"
fi

################################################################################
# 4. Nginx-Konfiguration testen
################################################################################

echo ""
info "Teste Nginx-Konfiguration..."

if nginx -t 2>&1 | tee -a "$LOG_FILE"; then
    echo ""
    success "Nginx-Konfiguration OK"
else
    echo ""
    error "Nginx-Konfiguration fehlerhaft!"
    echo ""
    echo -e "${YELLOW}Prüfe Konfiguration:${NC}"
    echo -e "  ${GREEN}nginx -t${NC}"
    echo -e "  ${GREEN}cat /etc/nginx/sites-available/fmsv-dingden${NC}"
    echo ""
    exit 1
fi

################################################################################
# 5. Nginx Auto-Start aktivieren
################################################################################

info "Aktiviere Nginx Auto-Start..."
systemctl enable nginx > /dev/null 2>&1
success "Auto-Start aktiviert"

################################################################################
# 6. SSL-Hinweis (falls kein Cloudflare)
################################################################################

if [[ ! $USE_CLOUDFLARE =~ ^[Jj]$ ]]; then
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}📝 SSL-Zertifikat Installation${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}Nach der Installation SSL-Zertifikat installieren:${NC}"
    echo ""
    echo -e "  ${GREEN}apt-get install -y certbot python3-certbot-nginx${NC}"
    echo -e "  ${GREEN}certbot --nginx -d $DOMAIN${NC}"
    echo ""
    echo -e "${CYAN}Certbot richtet automatische Erneuerung ein.${NC}"
    echo ""
fi

log_success "Nginx installed and configured"
log_info "Domain: $DOMAIN, Config: /etc/nginx/sites-available/fmsv-dingden"
