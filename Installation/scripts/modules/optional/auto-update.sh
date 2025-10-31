#!/bin/bash
################################################################################
# Modul: Auto-Update System
# Richtet automatische Updates via systemd Timer ein
################################################################################

print_header 14 "Auto-Update System" 18

echo ""
info "Auto-Update Zeitplan: $AUTO_UPDATE_SCHEDULE"
echo ""

if [ "$AUTO_UPDATE_SCHEDULE" = "manual" ]; then
    info "Auto-Update ist deaktiviert (manuell)"
    info "Updates können jederzeit manuell ausgeführt werden:"
    echo ""
    echo -e "  ${GREEN}cd $INSTALL_DIR${NC}"
    echo -e "  ${GREEN}git pull origin $BRANCH${NC}"
    echo -e "  ${GREEN}cd backend && npm install --production${NC}"
    echo -e "  ${GREEN}cd .. && npm install && npm run build${NC}"
    echo -e "  ${GREEN}systemctl restart fmsv-backend nginx${NC}"
    echo ""
    return 0
fi

################################################################################
# 1. Auto-Update Script erstellen
################################################################################

info "Erstelle Auto-Update Script..."

mkdir -p "$INSTALL_DIR/Installation/scripts"

cat > "$INSTALL_DIR/Installation/scripts/auto-update.sh" <<'EOFSCRIPT'
#!/bin/bash
################################################################################
# FMSV Dingden - Auto-Update Script
################################################################################

INSTALL_DIR="/var/www/fmsv-dingden"
LOG_FILE="/var/log/fmsv-auto-update.log"
BACKUP_DIR="/var/backups/fmsv"

# Erstelle Backup-Verzeichnis
mkdir -p "$BACKUP_DIR"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "====== Auto-Update gestartet ======"

cd "$INSTALL_DIR" || exit 1

# Branch aus .env laden
BRANCH=$(grep UPDATE_BRANCH backend/.env 2>/dev/null | cut -d '=' -f2 || echo "main")
log "Update-Branch: $BRANCH"

# Prüfe auf Updates
git fetch origin

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/$BRANCH)

if [ "$LOCAL" = "$REMOTE" ]; then
    log "Keine Updates verfügbar"
    exit 0
fi

log "Updates gefunden: $LOCAL -> $REMOTE"

# ══════════════════════════════════════════════════════════
# BACKUP erstellen
# ══════════════════════════════════════════════════════════

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_SQL="$BACKUP_DIR/database-$TIMESTAMP.sql"
BACKUP_SAVES="$BACKUP_DIR/saves-$TIMESTAMP.tar.gz"

log "Erstelle Backup..."

# Datenbank-Backup
DB_NAME=$(grep DB_NAME backend/.env | cut -d '=' -f2)
if [ -n "$DB_NAME" ]; then
    if su - postgres -c "pg_dump $DB_NAME" > "$BACKUP_SQL" 2>&1; then
        log "Datenbank-Backup: $BACKUP_SQL ($(du -h $BACKUP_SQL | cut -f1))"
    else
        log "WARNUNG: Datenbank-Backup fehlgeschlagen!"
    fi
fi

# Saves-Backup
if [ -d "$INSTALL_DIR/Saves" ]; then
    if tar -czf "$BACKUP_SAVES" -C "$INSTALL_DIR" Saves/ 2>&1; then
        log "Uploads-Backup: $BACKUP_SAVES ($(du -h $BACKUP_SAVES | cut -f1))"
    fi
fi

# Git-Commit für Rollback
ROLLBACK_COMMIT="$LOCAL"
log "Rollback-Punkt: $ROLLBACK_COMMIT"

# ══════════════════════════════════════════════════════════
# UPDATE durchführen
# ══════════════════════════════════════════════════════════

log "Starte Update..."

# Git Pull
if ! git pull origin $BRANCH 2>&1 | tee -a "$LOG_FILE"; then
    log "FEHLER: git pull fehlgeschlagen!"
    exit 1
fi

# Backend Update
log "Aktualisiere Backend..."
cd backend
if ! npm install --production 2>&1 | tee -a "$LOG_FILE"; then
    log "FEHLER: Backend npm install fehlgeschlagen!"
    cd "$INSTALL_DIR"
    git reset --hard "$ROLLBACK_COMMIT"
    systemctl restart fmsv-backend
    log "Rollback abgeschlossen"
    exit 1
fi
cd ..

# Frontend Update
log "Aktualisiere Frontend..."
if ! npm install 2>&1 | tee -a "$LOG_FILE"; then
    log "FEHLER: Frontend npm install fehlgeschlagen!"
    git reset --hard "$ROLLBACK_COMMIT"
    npm run build
    systemctl restart fmsv-backend nginx
    log "Rollback abgeschlossen"
    exit 1
fi

if ! npm run build 2>&1 | tee -a "$LOG_FILE"; then
    log "FEHLER: Frontend Build fehlgeschlagen!"
    git reset --hard "$ROLLBACK_COMMIT"
    npm run build
    systemctl restart fmsv-backend nginx
    log "Rollback abgeschlossen"
    exit 1
fi

# ══════════════════════════════════════════════════════════
# SERVICES neu starten
# ══════════════════════════════════════════════════════════

log "Starte Services neu..."

systemctl restart fmsv-backend
sleep 3

if ! systemctl is-active --quiet fmsv-backend; then
    log "FEHLER: Backend konnte nicht gestartet werden!"
    git reset --hard "$ROLLBACK_COMMIT"
    cd backend && npm install --production && cd ..
    systemctl restart fmsv-backend
    log "Rollback abgeschlossen"
    exit 1
fi

log "Backend läuft"

systemctl restart nginx

if systemctl is-active --quiet cloudflared; then
    systemctl restart cloudflared
    log "Cloudflare Tunnel neu gestartet"
fi

# ══════════════════════════════════════════════════════════
# VALIDIERUNG
# ══════════════════════════════════════════════════════════

log "Validiere Update..."

sleep 3
if curl -s http://localhost:3000/api/health > /dev/null; then
    log "Backend erreichbar ✓"
else
    log "WARNUNG: Backend nicht erreichbar!"
fi

if curl -s http://localhost > /dev/null; then
    log "Frontend erreichbar ✓"
else
    log "WARNUNG: Frontend nicht erreichbar!"
fi

# ══════════════════════════════════════════════════════════
# ALTE BACKUPS aufräumen (behalte letzte 7 Tage)
# ══════════════════════════════════════════════════════════

log "Räume alte Backups auf..."
find "$BACKUP_DIR" -name "database-*.sql" -mtime +7 -delete 2>/dev/null
find "$BACKUP_DIR" -name "saves-*.tar.gz" -mtime +7 -delete 2>/dev/null

BACKUP_COUNT=$(ls -1 "$BACKUP_DIR" 2>/dev/null | wc -l)
log "Aktuelle Backups: $BACKUP_COUNT"

log "====== Auto-Update abgeschlossen ======"
EOFSCRIPT

chmod +x "$INSTALL_DIR/Installation/scripts/auto-update.sh"
success "Auto-Update Script erstellt"

################################################################################
# 2. systemd Service erstellen
################################################################################

echo ""
info "Erstelle systemd Service..."

cat > /etc/systemd/system/fmsv-auto-update.service <<EOF
[Unit]
Description=FMSV Dingden Auto-Update
Documentation=https://github.com/Benno2406/fmsv-dingden
After=network.target

[Service]
Type=oneshot
User=root
WorkingDirectory=$INSTALL_DIR
ExecStart=$INSTALL_DIR/Installation/scripts/auto-update.sh
StandardOutput=journal
StandardError=journal
SyslogIdentifier=fmsv-auto-update
EOF

success "systemd Service erstellt"

################################################################################
# 3. systemd Timer erstellen
################################################################################

info "Erstelle systemd Timer..."

# Zeitplan bestimmen
case "$AUTO_UPDATE_SCHEDULE" in
    "daily")
        TIMER_SCHEDULE="*-*-* 03:00:00"
        TIMER_DESC="Täglich um 03:00 Uhr"
        ;;
    "weekly")
        TIMER_SCHEDULE="Sun *-*-* 03:00:00"
        TIMER_DESC="Sonntags um 03:00 Uhr"
        ;;
    *)
        TIMER_SCHEDULE="*-*-* 03:00:00"
        TIMER_DESC="Täglich um 03:00 Uhr"
        ;;
esac

cat > /etc/systemd/system/fmsv-auto-update.timer <<EOF
[Unit]
Description=FMSV Dingden Auto-Update Timer ($TIMER_DESC)
Documentation=https://github.com/Benno2406/fmsv-dingden

[Timer]
OnCalendar=$TIMER_SCHEDULE
Persistent=true
RandomizedDelaySec=300

[Install]
WantedBy=timers.target
EOF

success "systemd Timer erstellt ($TIMER_DESC)"

################################################################################
# 4. Timer aktivieren
################################################################################

echo ""
info "Aktiviere Auto-Update Timer..."

systemctl daemon-reload
systemctl enable fmsv-auto-update.timer > /dev/null 2>&1
systemctl start fmsv-auto-update.timer

if systemctl is-active --quiet fmsv-auto-update.timer; then
    success "Auto-Update Timer aktiviert"
else
    error "Timer konnte nicht aktiviert werden!"
    systemctl status fmsv-auto-update.timer --no-pager -l
    exit 1
fi

################################################################################
# 5. Status anzeigen
################################################################################

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📅 Auto-Update Status${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Zeige Timer-Status
systemctl status fmsv-auto-update.timer --no-pager -l | grep -E "Active|Trigger" | sed 's/^/  /'

echo ""

# Zeige nächste Ausführung
NEXT_RUN=$(systemctl list-timers fmsv-auto-update.timer --no-pager | grep fmsv-auto-update | awk '{print $1" "$2" "$3}')
if [ -n "$NEXT_RUN" ]; then
    echo -e "  ${BLUE}►${NC} Nächste Ausführung: ${GREEN}$NEXT_RUN${NC}"
fi

echo ""

info "Manuelles Update jederzeit möglich:"
echo -e "  ${GREEN}systemctl start fmsv-auto-update.service${NC}"
echo ""

info "Logs ansehen:"
echo -e "  ${GREEN}journalctl -u fmsv-auto-update -f${NC}"
echo -e "  ${GREEN}tail -f /var/log/fmsv-auto-update.log${NC}"

echo ""

log_success "Auto-Update System configured"
log_info "Schedule: $AUTO_UPDATE_SCHEDULE ($TIMER_DESC)"
