#!/bin/bash
################################################################################
# Modul: pgAdmin 4 Installation
# Installiert pgAdmin 4 auf Apache2 (Port 1880/18443)
################################################################################

info "pgAdmin 4 Installation..."
echo ""

################################################################################
# 1. Domain-Konfiguration (optional)
################################################################################

if [ -n "$PGADMIN_DOMAIN" ]; then
    info "pgAdmin Domain: $PGADMIN_DOMAIN"
else
    echo -e "${YELLOW}pgAdmin wird auf Ports 1880 (HTTP) und 18443 (HTTPS) laufen${NC}"
    echo ""
    
    if ask_yes_no "Separate Domain für pgAdmin verwenden?" "n"; then
        PGADMIN_DOMAIN=$(ask_input "pgAdmin Domain" "pgadmin.$DOMAIN")
        export PGADMIN_DOMAIN
    else
        PGADMIN_DOMAIN=""
    fi
fi

################################################################################
# 2. Apache2 Installation
################################################################################

info "Installiere Apache2..."

if command -v apache2 &> /dev/null; then
    success "Apache2 bereits installiert"
else
    if DEBIAN_FRONTEND=noninteractive apt-get install -y -qq apache2 2>&1 | tee -a "$LOG_FILE" > /dev/null; then
        success "Apache2 installiert"
    else
        error "Apache2 Installation fehlgeschlagen!"
        exit 1
    fi
fi

# Apache2 Version
APACHE_VERSION=$(apache2 -v 2>/dev/null | head -1)
info "$APACHE_VERSION"

################################################################################
# 3. Python & pip installieren
################################################################################

echo ""
info "Installiere Python & pip..."

PYTHON_PACKAGES=(
    "python3"
    "python3-pip"
    "python3-venv"
    "libpq-dev"
    "python3-dev"
    "libapache2-mod-wsgi-py3"
)

if DEBIAN_FRONTEND=noninteractive apt-get install -y -qq "${PYTHON_PACKAGES[@]}" 2>&1 | tee -a "$LOG_FILE" > /dev/null; then
    success "Python-Pakete installiert"
else
    error "Python-Installation fehlgeschlagen!"
    exit 1
fi

PYTHON_VERSION=$(python3 --version)
success "$PYTHON_VERSION"

################################################################################
# 4. pgAdmin 4 installieren
################################################################################

echo ""
info "Installiere pgAdmin 4..."

# pgAdmin Repository hinzufügen
info "Füge pgAdmin Repository hinzu..."
curl -fsS https://www.pgadmin.org/static/packages_pgadmin_org.pub | gpg --dearmor -o /usr/share/keyrings/packages-pgadmin-org.gpg 2>&1 | tee -a "$LOG_FILE" > /dev/null

echo "deb [signed-by=/usr/share/keyrings/packages-pgadmin-org.gpg] https://ftp.postgresql.org/pub/pgadmin/pgadmin4/apt/$(lsb_release -cs) pgadmin4 main" > /etc/apt/sources.list.d/pgadmin4.list

# Update package list
apt-get update -qq 2>&1 | tee -a "$LOG_FILE" > /dev/null

# Installiere pgAdmin
info "Installiere pgAdmin 4 Web..."
if DEBIAN_FRONTEND=noninteractive apt-get install -y -qq pgadmin4-web 2>&1 | tee -a "$LOG_FILE" > /dev/null; then
    success "pgAdmin 4 installiert"
else
    error "pgAdmin 4 Installation fehlgeschlagen!"
    echo ""
    echo -e "${YELLOW}Manuelle Installation:${NC}"
    echo -e "  ${GREEN}apt-get install -y pgadmin4-web${NC}"
    echo ""
    exit 1
fi

################################################################################
# 5. pgAdmin Konfiguration
################################################################################

echo ""
info "Konfiguriere pgAdmin 4..."

# pgAdmin E-Mail & Passwort
echo ""
PGADMIN_EMAIL=$(ask_input "pgAdmin Admin E-Mail" "admin@$DOMAIN")
PGADMIN_PASSWORD=$(ask_password "pgAdmin Admin Passwort" 8)

# Setup-Script ausführen
info "Führe pgAdmin Setup aus..."

# Erstelle Antwort-Datei für non-interactive Setup
cat > /tmp/pgadmin-setup.exp <<EOF
#!/usr/bin/expect -f
set timeout -1
spawn /usr/pgadmin4/bin/setup-web.sh

expect "Email address:"
send "$PGADMIN_EMAIL\r"

expect "Password:"
send "$PGADMIN_PASSWORD\r"

expect "Retype password:"
send "$PGADMIN_PASSWORD\r"

expect eof
EOF

chmod +x /tmp/pgadmin-setup.exp

# Installiere expect falls nicht vorhanden
if ! command -v expect &> /dev/null; then
    apt-get install -y -qq expect 2>&1 | tee -a "$LOG_FILE" > /dev/null
fi

# Führe Setup aus
if /tmp/pgadmin-setup.exp 2>&1 | tee -a "$LOG_FILE"; then
    rm -f /tmp/pgadmin-setup.exp
    success "pgAdmin Setup abgeschlossen"
else
    rm -f /tmp/pgadmin-setup.exp
    warning "Automatisches Setup fehlgeschlagen - versuche manuell"
    
    # Manueller Fallback
    echo "$PGADMIN_EMAIL" | /usr/pgadmin4/bin/setup-web.sh --yes 2>&1 | tee -a "$LOG_FILE"
fi

################################################################################
# 6. Apache Ports konfigurieren (1880 & 18443)
################################################################################

echo ""
info "Konfiguriere Apache Ports..."

# Backup alte ports.conf
if [ -f /etc/apache2/ports.conf ]; then
    cp /etc/apache2/ports.conf /etc/apache2/ports.conf.backup
fi

# Ports konfigurieren
cat > /etc/apache2/ports.conf <<EOF
# pgAdmin 4 läuft auf Ports 1880 (HTTP) und 18443 (HTTPS)
# um Konflikte mit nginx (80/443) zu vermeiden

Listen 1880
Listen 18443

<IfModule ssl_module>
    Listen 18443
</IfModule>

<IfModule mod_gnutls.c>
    Listen 18443
</IfModule>
EOF

success "Apache Ports konfiguriert (1880, 18443)"

################################################################################
# 7. pgAdmin Apache VirtualHost konfigurieren
################################################################################

info "Erstelle Apache VirtualHost..."

if [ -n "$PGADMIN_DOMAIN" ]; then
    # Mit Domain
    cat > /etc/apache2/sites-available/pgadmin4.conf <<EOF
<VirtualHost *:1880>
    ServerName $PGADMIN_DOMAIN
    
    WSGIDaemonProcess pgadmin processes=1 threads=25 python-home=/usr/pgadmin4/venv
    WSGIScriptAlias / /usr/pgadmin4/web/pgAdmin4.wsgi
    
    <Directory /usr/pgadmin4/web/>
        WSGIProcessGroup pgadmin
        WSGIApplicationGroup %{GLOBAL}
        Require all granted
    </Directory>
    
    ErrorLog \${APACHE_LOG_DIR}/pgadmin-error.log
    CustomLog \${APACHE_LOG_DIR}/pgadmin-access.log combined
</VirtualHost>

<IfModule mod_ssl.c>
<VirtualHost *:18443>
    ServerName $PGADMIN_DOMAIN
    
    WSGIDaemonProcess pgadmin-ssl processes=1 threads=25 python-home=/usr/pgadmin4/venv
    WSGIScriptAlias / /usr/pgadmin4/web/pgAdmin4.wsgi
    
    <Directory /usr/pgadmin4/web/>
        WSGIProcessGroup pgadmin-ssl
        WSGIApplicationGroup %{GLOBAL}
        Require all granted
    </Directory>
    
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/ssl-cert-snakeoil.pem
    SSLCertificateKeyFile /etc/ssl/private/ssl-cert-snakeoil.key
    
    ErrorLog \${APACHE_LOG_DIR}/pgadmin-ssl-error.log
    CustomLog \${APACHE_LOG_DIR}/pgadmin-ssl-access.log combined
</VirtualHost>
</IfModule>
EOF
else
    # Ohne Domain (nur localhost)
    cat > /etc/apache2/sites-available/pgadmin4.conf <<EOF
<VirtualHost *:1880>
    ServerName localhost
    
    WSGIDaemonProcess pgadmin processes=1 threads=25 python-home=/usr/pgadmin4/venv
    WSGIScriptAlias / /usr/pgadmin4/web/pgAdmin4.wsgi
    
    <Directory /usr/pgadmin4/web/>
        WSGIProcessGroup pgadmin
        WSGIApplicationGroup %{GLOBAL}
        Require all granted
    </Directory>
    
    ErrorLog \${APACHE_LOG_DIR}/pgadmin-error.log
    CustomLog \${APACHE_LOG_DIR}/pgadmin-access.log combined
</VirtualHost>

<IfModule mod_ssl.c>
<VirtualHost *:18443>
    ServerName localhost
    
    WSGIDaemonProcess pgadmin-ssl processes=1 threads=25 python-home=/usr/pgadmin4/venv
    WSGIScriptAlias / /usr/pgadmin4/web/pgAdmin4.wsgi
    
    <Directory /usr/pgadmin4/web/>
        WSGIProcessGroup pgadmin-ssl
        WSGIApplicationGroup %{GLOBAL}
        Require all granted
    </Directory>
    
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/ssl-cert-snakeoil.pem
    SSLCertificateKeyFile /etc/ssl/private/ssl-cert-snakeoil.key
    
    ErrorLog \${APACHE_LOG_DIR}/pgadmin-ssl-error.log
    CustomLog \${APACHE_LOG_DIR}/pgadmin-ssl-access.log combined
</VirtualHost>
</IfModule>
EOF
fi

success "Apache VirtualHost erstellt"

################################################################################
# 8. Apache Module aktivieren
################################################################################

echo ""
info "Aktiviere Apache Module..."

a2enmod wsgi > /dev/null 2>&1 || true
a2enmod ssl > /dev/null 2>&1 || true

# Site aktivieren
a2ensite pgadmin4.conf > /dev/null 2>&1

# Default Site deaktivieren (läuft auf 80/443 - Konflikt mit nginx)
a2dissite 000-default.conf > /dev/null 2>&1 || true

success "Apache Module aktiviert"

################################################################################
# 9. Apache neu starten
################################################################################

echo ""
info "Starte Apache2..."

if systemctl restart apache2 2>&1 | tee -a "$LOG_FILE" > /dev/null; then
    sleep 2
    
    if systemctl is-active --quiet apache2; then
        success "Apache2 läuft"
    else
        error "Apache2 läuft nicht!"
        systemctl status apache2 --no-pager -l
        exit 1
    fi
else
    error "Apache2 konnte nicht gestartet werden!"
    exit 1
fi

# Auto-Start aktivieren
systemctl enable apache2 > /dev/null 2>&1

################################################################################
# 10. Firewall-Regeln
################################################################################

echo ""
info "Konfiguriere Firewall für pgAdmin..."

if command -v ufw &> /dev/null; then
    ufw allow 1880/tcp comment 'pgAdmin HTTP' > /dev/null 2>&1
    ufw allow 18443/tcp comment 'pgAdmin HTTPS' > /dev/null 2>&1
    success "Firewall-Regeln hinzugefügt"
fi

################################################################################
# 11. Zusammenfassung
################################################################################

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🎉 pgAdmin 4 erfolgreich installiert!${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${BLUE}►${NC} E-Mail: ${GREEN}$PGADMIN_EMAIL${NC}"
echo -e "  ${BLUE}►${NC} HTTP: ${GREEN}http://localhost:1880${NC}"
echo -e "  ${BLUE}►${NC} HTTPS: ${GREEN}https://localhost:18443${NC}"

if [ -n "$PGADMIN_DOMAIN" ]; then
    echo -e "  ${BLUE}►${NC} Domain: ${GREEN}https://$PGADMIN_DOMAIN:18443${NC}"
fi

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}📝 PostgreSQL Verbindung hinzufügen:${NC}"
echo ""
echo -e "  ${BLUE}1.${NC} Öffne pgAdmin: ${CYAN}http://localhost:1880${NC}"
echo -e "  ${BLUE}2.${NC} Melde dich an mit: ${CYAN}$PGADMIN_EMAIL${NC}"
echo -e "  ${BLUE}3.${NC} Add New Server:"
echo -e "     ${YELLOW}Name:${NC} FMSV Dingden"
echo -e "     ${YELLOW}Host:${NC} localhost"
echo -e "     ${YELLOW}Port:${NC} 5432"
echo -e "     ${YELLOW}Database:${NC} $DB_NAME"
echo -e "     ${YELLOW}User:${NC} $DB_USER"
echo -e "     ${YELLOW}Password:${NC} (Datenbank-Passwort)"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

log_success "pgAdmin 4 installed"
log_info "URL: http://localhost:1880, Email: $PGADMIN_EMAIL"
