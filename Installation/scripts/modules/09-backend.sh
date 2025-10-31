#!/bin/bash
################################################################################
# Modul: Backend-Setup
# Installiert Backend-Dependencies und erstellt Konfiguration
################################################################################

cd "$INSTALL_DIR/backend" || {
    error "Backend-Verzeichnis nicht gefunden: $INSTALL_DIR/backend"
    exit 1
}

################################################################################
# 1. Backend-Dependencies installieren
################################################################################

info "Installiere Backend-Dependencies..."
echo ""

if npm install --production 2>&1 | tee -a "$LOG_FILE" | grep -E "added|removed|changed|up to date|audited"; then
    echo ""
    
    # Validierung
    if [ ! -d "$INSTALL_DIR/backend/node_modules" ]; then
        error "node_modules/ wurde nicht erstellt!"
        exit 1
    fi
    
    PACKAGE_COUNT=$(find "$INSTALL_DIR/backend/node_modules" -maxdepth 1 -type d | wc -l)
    NODE_MODULES_SIZE=$(du -sh "$INSTALL_DIR/backend/node_modules" | cut -f1)
    success "Backend-Dependencies installiert"
    info "Pakete: $PACKAGE_COUNT | Größe: $NODE_MODULES_SIZE"
    
else
    error "Backend npm install fehlgeschlagen!"
    echo ""
    tail -20 "$LOG_FILE" | sed 's/^/  /'
    echo ""
    exit 1
fi

################################################################################
# 2. Backend-Konfiguration (.env) erstellen
################################################################################

echo ""
info "Erstelle Backend-Konfiguration (.env)..."

# Generiere sichere Secrets
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# Erstelle .env Datei
cat > .env <<EOF
# Node.js Environment
NODE_ENV=production
PORT=3000

# Base URL
BASE_URL=https://${DOMAIN}

# Datenbank-Konfiguration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# JWT-Konfiguration
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
JWT_REFRESH_EXPIRES_IN=7d

# 2FA-Konfiguration
TWO_FA_APP_NAME=FMSV Dingden

# Update-Konfiguration
UPDATE_CHANNEL=$CHANNEL_NAME
UPDATE_BRANCH=$BRANCH

# E-Mail-Konfiguration (TODO: Manuell konfigurieren!)
# SMTP_HOST=
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=
# SMTP_PASS=
# SMTP_FROM=noreply@$DOMAIN

# Upload-Konfiguration
UPLOAD_MAX_SIZE=52428800
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/gif,image/webp,application/pdf

# Session-Konfiguration
SESSION_SECRET=$(openssl rand -base64 32)
SESSION_COOKIE_NAME=fmsv_session
SESSION_COOKIE_MAX_AGE=86400000

# Logging
LOG_LEVEL=info
LOG_FILE=../Logs/backend.log

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
EOF

# Setze Berechtigungen (nur root lesbar)
chmod 600 .env

success "Backend-Konfiguration erstellt"
info "JWT Secrets generiert"
info "Datenbank-Verbindung konfiguriert"

################################################################################
# 3. Datenbank-Schema initialisieren
################################################################################

echo ""
info "Initialisiere Datenbank-Schema..."

if [ -f "scripts/initDatabase.js" ]; then
    if node scripts/initDatabase.js 2>&1 | tee -a "$LOG_FILE" | tail -10; then
        echo ""
        success "Datenbank-Schema initialisiert"
    else
        warning "Datenbank-Initialisierung hatte Warnungen"
        warning "Schema wurde möglicherweise bereits installiert (OK)"
    fi
else
    warning "initDatabase.js nicht gefunden - überspringe"
fi

################################################################################
# 4. Test-Daten einfügen (optional)
################################################################################

echo ""
if ask_yes_no "Test-Daten einfügen (empfohlen für erste Installation)?" "j"; then
    info "Füge Test-Daten ein..."
    
    if [ -f "scripts/seedDatabase.js" ]; then
        if node scripts/seedDatabase.js 2>&1 | tee -a "$LOG_FILE" | tail -10; then
            echo ""
            success "Test-Daten eingefügt"
            echo ""
            echo -e "${CYAN}Test-Accounts:${NC}"
            echo -e "  ${GREEN}►${NC} ${YELLOW}Superadmin:${NC} admin@fmsv-dingden.de / Admin123!"
            echo -e "  ${GREEN}►${NC} ${YELLOW}Webmaster:${NC} webmaster@fmsv-dingden.de / Web123!"
            echo -e "  ${GREEN}►${NC} ${YELLOW}Mitglied:${NC} member@fmsv-dingden.de / Member123!"
            echo ""
            warning "⚠️  Passwörter nach erster Anmeldung ändern!"
        else
            warning "Test-Daten konnten nicht eingefügt werden"
        fi
    else
        warning "seedDatabase.js nicht gefunden"
    fi
else
    info "Test-Daten werden übersprungen"
fi

################################################################################
# 5. Backend-Verzeichnisse erstellen
################################################################################

echo ""
info "Erstelle Backend-Verzeichnisse..."

mkdir -p "$INSTALL_DIR/Saves/images"
mkdir -p "$INSTALL_DIR/Saves/documents"
mkdir -p "$INSTALL_DIR/Saves/protocols"
mkdir -p "$INSTALL_DIR/Logs"
mkdir -p "$INSTALL_DIR/Logs/Audit"

success "Verzeichnisse erstellt"

################################################################################
# 6. systemd Service erstellen
################################################################################

echo ""
info "Erstelle systemd Service..."

cat > /etc/systemd/system/fmsv-backend.service <<EOF
[Unit]
Description=FMSV Dingden Backend
Documentation=https://github.com/Benno2406/fmsv-dingden
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=$INSTALL_DIR/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=fmsv-backend

# Security
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
systemctl daemon-reload

# Enable Service
systemctl enable fmsv-backend > /dev/null 2>&1

success "systemd Service erstellt"
info "Service: fmsv-backend"

################################################################################
# 7. Berechtigungen setzen
################################################################################

echo ""
info "Setze Berechtigungen..."

# Backend-Verzeichnis bleibt root (für Service)
# Nur Saves/ und Logs/ für www-data

chown -R root:root "$INSTALL_DIR/backend"
chmod 600 "$INSTALL_DIR/backend/.env"
chmod 755 "$INSTALL_DIR/backend"

chown -R www-data:www-data "$INSTALL_DIR/Saves"
chown -R www-data:www-data "$INSTALL_DIR/Logs"

success "Berechtigungen gesetzt"
info "Backend läuft als root"
info "Saves/ und Logs/ gehören www-data"

log_success "Backend setup completed"
log_info "Service: fmsv-backend, Port: 3000"
