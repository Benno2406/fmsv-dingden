#!/bin/bash
################################################################################
# Modul: Datenbank-Setup
# Erstellt PostgreSQL Datenbank, Benutzer und importiert Schema
################################################################################

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Datenbank-Konfiguration${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo ""

################################################################################
# 1. Datenbank-Credentials abfragen
################################################################################

DB_NAME=$(ask_input "Datenbank-Name" "fmsv_database")
DB_USER=$(ask_input "Datenbank-Benutzer" "fmsv_user")
DB_PASSWORD=$(ask_password "Datenbank-Passwort" 8)

# Exportiere Variablen für andere Module
export DB_NAME
export DB_USER
export DB_PASSWORD

log_info "Database configuration: DB=$DB_NAME, User=$DB_USER"

################################################################################
# 2. Prüfe ob Datenbank bereits existiert
################################################################################

echo ""
info "Prüfe ob Datenbank existiert..."

DB_EXISTS=$(su - postgres -c "psql -lqt" 2>/dev/null | cut -d \| -f 1 | grep -w "$DB_NAME" | wc -l)

if [ "$DB_EXISTS" -gt 0 ]; then
    echo ""
    warning "┌─────────────────────────────────────────────────────┐"
    warning "│  Datenbank '$DB_NAME' existiert bereits!        │"
    warning "└─────────────────────────────────────────────────────┘"
    echo ""
    echo -e "${RED}⚠️  WARNUNG: ALLE DATEN WERDEN GELÖSCHT! ⚠️${NC}"
    echo ""
    echo -e "${YELLOW}Dies betrifft:${NC}"
    echo -e "  ${BLUE}•${NC} Alle Benutzer-Accounts"
    echo -e "  ${BLUE}•${NC} Alle Artikel & Events"
    echo -e "  ${BLUE}•${NC} Alle Flugbuch-Einträge"
    echo -e "  ${BLUE}•${NC} Alle Protokolle"
    echo -e "  ${BLUE}•${NC} Uploads bleiben erhalten (Saves/)"
    echo ""
    
    # Zeige Datenbankgröße
    DB_SIZE=$(su - postgres -c "psql -c \"SELECT pg_size_pretty(pg_database_size('$DB_NAME'))\" -tA" 2>/dev/null || echo "unbekannt")
    echo -e "${CYAN}Aktuelle Datenbankgröße: ${YELLOW}$DB_SIZE${NC}"
    echo ""
    
    # Backup-Option
    if ask_yes_no "Backup erstellen?" "j"; then
        BACKUP_FILE="/tmp/fmsv-backup-$(date +%Y%m%d-%H%M%S).sql"
        info "Erstelle Backup: $BACKUP_FILE"
        
        if su - postgres -c "pg_dump $DB_NAME" > "$BACKUP_FILE" 2>&1; then
            BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
            success "Backup erstellt: $BACKUP_FILE ($BACKUP_SIZE)"
            echo ""
            echo -e "${CYAN}Backup-Datei später wiederherstellen:${NC}"
            echo -e "  ${GREEN}su - postgres -c \"psql $DB_NAME < $BACKUP_FILE\"${NC}"
            echo ""
        else
            warning "Backup fehlgeschlagen!"
            rm -f "$BACKUP_FILE"
        fi
    fi
    
    # Finale Bestätigung
    echo -e "${RED}Datenbank '$DB_NAME' wirklich LÖSCHEN?${NC}"
    echo -ne "   ${BLUE}►${NC} Zum Löschen 'JA' eingeben: "
    read DELETE_CONFIRM
    echo
    
    DELETE_CONFIRM=$(echo "$DELETE_CONFIRM" | tr '[:lower:]' '[:upper:]')
    
    if [ "$DELETE_CONFIRM" != "JA" ]; then
        echo ""
        info "Datenbank-Löschung abgebrochen"
        echo ""
        echo -e "${YELLOW}Optionen:${NC}"
        echo -e "  ${GREEN}1.${NC} Installation mit anderem Datenbank-Namen"
        echo -e "  ${GREEN}2.${NC} Bestehende Datenbank manuell löschen:"
        echo -e "     ${CYAN}su - postgres -c \"dropdb $DB_NAME\"${NC}"
        echo ""
        exit 0
    fi
    
    echo ""
    warning "Lösche Datenbank '$DB_NAME'..."
fi

################################################################################
# 3. Erstelle Datenbank & Benutzer
################################################################################

info "Erstelle Datenbank '$DB_NAME'..."

su - postgres -c "psql" <<EOF > /dev/null 2>&1
DROP DATABASE IF EXISTS $DB_NAME;
DROP USER IF EXISTS $DB_USER;
CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
CREATE DATABASE $DB_NAME OWNER $DB_USER;
\\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
GRANT USAGE ON SCHEMA public TO $DB_USER;
GRANT CREATE ON SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO $DB_USER;
ALTER SCHEMA public OWNER TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO $DB_USER;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public;
EOF

if [ $? -eq 0 ]; then
    success "Datenbank '$DB_NAME' erstellt"
    success "Benutzer '$DB_USER' angelegt"
else
    error "Datenbank-Erstellung fehlgeschlagen!"
    exit 1
fi

################################################################################
# 4. Schema einspielen
################################################################################

echo ""
info "Installiere Datenbank-Schema..."

SCHEMA_FILE="$INSTALL_DIR/backend/database/schema.sql"

# Prüfe ob Schema-Datei existiert
if [ ! -f "$SCHEMA_FILE" ]; then
    warning "Schema-Datei nicht gefunden, lade von GitHub..."
    
    GITHUB_RAW_URL="https://raw.githubusercontent.com/Benno2406/fmsv-dingden/$BRANCH/backend/database/schema.sql"
    
    mkdir -p "$INSTALL_DIR/backend/database"
    
    if curl -f -L -o "$SCHEMA_FILE" "$GITHUB_RAW_URL" 2>&1 | tee -a "$LOG_FILE" > /dev/null; then
        success "Schema von GitHub geladen"
    else
        error "Schema konnte nicht geladen werden!"
        echo ""
        echo -e "${YELLOW}Manueller Download:${NC}"
        echo -e "  ${GREEN}curl -L -o $SCHEMA_FILE $GITHUB_RAW_URL${NC}"
        echo ""
        exit 1
    fi
fi

# Validiere Schema-Datei
SCHEMA_SIZE=$(stat -c%s "$SCHEMA_FILE" 2>/dev/null || stat -f%z "$SCHEMA_FILE" 2>/dev/null || echo "0")
if [ "$SCHEMA_SIZE" -lt 100 ]; then
    error "Schema-Datei ist zu klein ($SCHEMA_SIZE Bytes) oder korrupt!"
    exit 1
fi

SCHEMA_SIZE_HUMAN=$(du -h "$SCHEMA_FILE" | cut -f1)
success "Schema-Datei gefunden ($SCHEMA_SIZE_HUMAN)"

# Schema einspielen
info "Importiere Schema..."
if su - postgres -c "psql -d $DB_NAME -f $SCHEMA_FILE" 2>&1 | tee -a "$LOG_FILE" | tail -10; then
    echo ""
    success "Datenbank-Schema installiert"
else
    echo ""
    error "Schema-Installation fehlgeschlagen!"
    echo ""
    echo -e "${YELLOW}Manuelle Installation:${NC}"
    echo -e "  ${GREEN}su - postgres -c \"psql -d $DB_NAME -f $SCHEMA_FILE\"${NC}"
    echo ""
    exit 1
fi

################################################################################
# 5. Validierung
################################################################################

echo ""
info "Validiere Datenbank-Struktur..."

# Zähle Tabellen
TABLE_COUNT=$(su - postgres -c "psql -d $DB_NAME -c \"SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public'\" -tA" 2>/dev/null || echo "0")

if [ "$TABLE_COUNT" -gt 10 ]; then
    success "Datenbank-Struktur validiert ($TABLE_COUNT Tabellen)"
else
    warning "Wenige Tabellen gefunden ($TABLE_COUNT) - Schema möglicherweise unvollständig"
fi

# Zeige Tabellen
info "Installierte Tabellen:"
su - postgres -c "psql -d $DB_NAME -c \"\\dt\"" 2>/dev/null | grep "public" | awk '{print $3}' | while read table; do
    if [ -n "$table" ]; then
        echo "  ${BLUE}•${NC} $table"
    fi
done

log_success "Database created and schema imported"
log_info "Database: $DB_NAME, User: $DB_USER, Tables: $TABLE_COUNT"
