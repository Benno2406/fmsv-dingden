# install.sh - TODO Liste & Fix-Plan

**Status:** Basierend auf Detail-Analyse vom 31.10.2025  
**Ziel:** Installation stabil, sicher & wartbar machen

---

## 🚨 PRIORITÄT 1: Kritische Fixes (SOFORT!)

**Zeitbedarf:** 1-2 Stunden  
**Impact:** Installation wird stabil & funktioniert zuverlässig

---

### ☑️ TODO #1: Frontend Build Fehlerbehandlung (KRITISCH!)

**Datei:** `install.sh` Zeile 1798-1800  
**Problem:** Build-Fehler werden verschluckt → Installation zeigt Erfolg obwohl dist/ fehlt  
**Priorität:** 🔴 KRITISCH  
**Zeitaufwand:** 10 Minuten

**Aktueller Code:**
```bash
info "Baue Frontend (dies kann einige Minuten dauern)..."
npm run build > /dev/null 2>&1
success "Frontend gebaut"
```

**Problem:**
- `> /dev/null 2>&1` unterdrückt ALLE Ausgaben inkl. Fehler
- `success` wird IMMER ausgeführt, auch wenn Build fehlschlägt
- Nginx startet später ohne dist/ → 404 Error

**Fix:**
```bash
info "Baue Frontend (dies kann einige Minuten dauern)..."
echo ""
echo -e "${YELLOW}Build-Ausgabe:${NC}"
echo ""

# Build mit Ausgabe & Exit-Code prüfen
if npm run build 2>&1 | tee -a "$LOG_FILE" | tail -20; then
    echo ""
    
    # Validierung: Prüfe ob dist/ wirklich existiert
    if [ ! -d "$INSTALL_DIR/dist" ]; then
        echo ""
        error "Build scheinbar erfolgreich, aber dist/ Verzeichnis fehlt!"
    fi
    
    if [ ! -f "$INSTALL_DIR/dist/index.html" ]; then
        echo ""
        error "dist/index.html nicht gefunden - Build unvollständig!"
    fi
    
    # Prüfe ob dist/ leer ist
    DIST_SIZE=$(du -sb "$INSTALL_DIR/dist" 2>/dev/null | cut -f1)
    if [ -z "$DIST_SIZE" ] || [ "$DIST_SIZE" -lt 1024 ]; then
        echo ""
        error "dist/ Verzeichnis ist zu klein oder leer - Build fehlgeschlagen!"
    fi
    
    success "Frontend gebaut ($(du -sh $INSTALL_DIR/dist | cut -f1))"
else
    echo ""
    error "npm run build fehlgeschlagen!"
    echo ""
    echo -e "${YELLOW}Letzte Build-Ausgabe:${NC}"
    tail -50 "$LOG_FILE"
    echo ""
    echo -e "${YELLOW}Häufige Ursachen:${NC}"
    echo -e "  ${RED}1.${NC} Zu wenig RAM (Frontend-Build braucht ~512MB)"
    echo -e "  ${RED}2.${NC} Disk Space voll"
    echo -e "  ${RED}3.${NC} TypeScript-Fehler im Code"
    echo -e "  ${RED}4.${NC} Fehlende Dependencies"
    echo ""
    echo -e "${YELLOW}Lösung:${NC}"
    echo -e "  ${GREEN}free -h${NC}  ${CYAN}# RAM prüfen${NC}"
    echo -e "  ${GREEN}df -h${NC}   ${CYAN}# Disk Space prüfen${NC}"
    echo -e "  ${GREEN}cd $INSTALL_DIR && npm run build${NC}  ${CYAN}# Manuell testen${NC}"
    echo ""
    exit 1
fi
```

**Test:**
```bash
# Nach Fix testen:
cd /var/www/fmsv-dingden
rm -rf dist/  # Simuliere Build-Fehler
npm run build  # Sollte Fehler zeigen statt "success"
```

---

### ☑️ TODO #2: Nummerierung korrigieren

**Datei:** `install.sh` Zeile 1204 + alle folgenden  
**Problem:** Schritt 8 existiert zweimal → Verwirrend für Benutzer  
**Priorität:** 🔴 Hoch  
**Zeitaufwand:** 5 Minuten

**Änderungen:**
```bash
# Zeile 1204:
print_header 8 "Datenbank-Setup"    # ❌ FALSCH
↓
print_header 9 "Datenbank-Setup"    # ✓ RICHTIG

# Zeile 1259:
print_header 9 "Cloudflare Tunnel Installation"  # ❌
↓
print_header 10 "Cloudflare Tunnel Installation" # ✓

# Zeile 1459:
print_header 10 "Nginx Installation & Konfiguration"  # ❌
↓
print_header 11 "Nginx Installation & Konfiguration" # ✓

# Alle weiteren: +1
```

**Vollständige Nummerierung (nach Fix):**
```
Schritt 1: System-Prüfung
Schritt 2: Installations-Optionen
Schritt 3: System-Updates
Schritt 4: Basis-Tools
Schritt 5: PostgreSQL
Schritt 6: pgAdmin 4 (optional)
Schritt 7: Node.js
Schritt 8: Repository klonen
Schritt 9: Datenbank-Setup          ← FIX
Schritt 10: Cloudflare (optional)   ← FIX
Schritt 11: Nginx                   ← FIX
Schritt 12: Backend-Setup           ← FIX
Schritt 13: Frontend-Build          ← FIX
Schritt 14: Auto-Update (optional)  ← FIX
Schritt 15: Services starten        ← FIX
Schritt 16: Firewall                ← FIX
```

---

### ☑️ TODO #3: Reihenfolge korrigieren (KRITISCH!)

**Problem:** Nginx Config zeigt auf nicht-existierendes dist/  
**Priorität:** 🔴 KRITISCH  
**Zeitaufwand:** 30 Minuten

**Aktuelle Reihenfolge (FALSCH):**
```
Schritt 6: pgAdmin (mit Nginx Reverse Proxy) → Nginx nicht installiert!
Schritt 10: Nginx Config → root /var/www/fmsv-dingden/dist ← dist/ fehlt!
Schritt 11: Backend Setup
Schritt 12: Frontend Build → JETZT ERST wird dist/ erstellt
```

**Neue Reihenfolge (RICHTIG):**
```
Schritt 1-8: (unverändert)
Schritt 9: Datenbank-Setup MIT Schema-Import
Schritt 10: Cloudflare (optional)
Schritt 11: Backend Setup (.env erstellen)
Schritt 12: Frontend Build ← VORHER!
Schritt 13: Nginx Config ← NACHHER! (jetzt existiert dist/)
Schritt 14: Backend Service (systemd)
Schritt 15: pgAdmin (optional) ← NACH Nginx!
Schritt 16: Auto-Update (optional)
Schritt 17: Services starten
Schritt 18: Firewall
```

**Code-Änderungen:**

**A) Frontend Build VORHER (nach Backend Setup):**
```bash
# NEU: Nach Zeile 1784 (Backend Service erstellt)
# JETZT Frontend bauen:

################################################################################
# Schritt 13: Frontend-Build
################################################################################

print_header 13 "Frontend-Build"

cd "$INSTALL_DIR"

info "Installiere Frontend-Dependencies..."
# ... (aktueller Code von Zeile 1794)

# Mit TODO #1 Fix!
```

**B) Nginx Config NACHHER (nach Frontend Build):**
```bash
################################################################################
# Schritt 14: Nginx Installation & Konfiguration
################################################################################

print_header 14 "Nginx Installation & Konfiguration"

# Jetzt kann nginx -t sofort getestet werden!
# ... (aktueller Code von Zeile 1459)

# Nginx Test sofort:
info "Teste Nginx-Konfiguration..."
if nginx -t > /dev/null 2>&1; then
    success "Nginx-Konfiguration OK"
else
    warning "Nginx-Konfiguration fehlerhaft!"
    nginx -t
    exit 1
fi
```

**C) pgAdmin NACHHER (nach Nginx):**
```bash
################################################################################
# Schritt 15: pgAdmin 4 (Optional)
################################################################################

print_header 15 "pgAdmin 4 Installation"

# Jetzt ist Nginx installiert → Reverse Proxy Setup funktioniert!
# ... (aktueller Code von Zeile 720)
```

---

### ☑️ TODO #4: Passwort-Validierung

**Datei:** `install.sh` Zeile 1217-1227  
**Problem:** Leere Passwörter erlaubt, keine Mindestlänge  
**Priorität:** 🔴 Hoch (Sicherheit!)  
**Zeitaufwand:** 10 Minuten

**Aktueller Code:**
```bash
while true; do
    echo -ne "   ${BLUE}►${NC} Datenbank-Passwort: "
    read -s DB_PASSWORD
    echo
    echo -ne "   ${BLUE}►${NC} Passwort wiederholen: "
    read -s DB_PASSWORD2
    echo
    [ "$DB_PASSWORD" = "$DB_PASSWORD2" ] && break
    warning "Passwörter stimmen nicht überein"
    echo ""
done
```

**Fix:**
```bash
while true; do
    echo -ne "   ${BLUE}►${NC} Datenbank-Passwort (min. 8 Zeichen): "
    read -s DB_PASSWORD
    echo
    
    # Validierung 1: Nicht leer
    if [ -z "$DB_PASSWORD" ]; then
        warning "Passwort darf nicht leer sein!"
        echo ""
        continue
    fi
    
    # Validierung 2: Mindestlänge
    if [ ${#DB_PASSWORD} -lt 8 ]; then
        warning "Passwort muss mindestens 8 Zeichen haben! (Aktuell: ${#DB_PASSWORD})"
        echo ""
        continue
    fi
    
    # Validierung 3: Keine Leerzeichen
    if [[ "$DB_PASSWORD" =~ [[:space:]] ]]; then
        warning "Passwort darf keine Leerzeichen enthalten!"
        echo ""
        continue
    fi
    
    echo -ne "   ${BLUE}►${NC} Passwort wiederholen: "
    read -s DB_PASSWORD2
    echo
    
    # Validierung 4: Übereinstimmung
    if [ "$DB_PASSWORD" = "$DB_PASSWORD2" ]; then
        success "Passwort validiert (${#DB_PASSWORD} Zeichen)"
        break
    fi
    
    warning "Passwörter stimmen nicht überein!"
    echo ""
done
```

**Optional - Komplexitäts-Check:**
```bash
# Zusätzliche Prüfung auf Zahl + Buchstabe
if ! [[ "$DB_PASSWORD" =~ [0-9] ]] || ! [[ "$DB_PASSWORD" =~ [a-zA-Z] ]]; then
    warning "Empfehlung: Passwort sollte Buchstaben UND Zahlen enthalten"
    echo -ne "Trotzdem verwenden? (j/n): "
    read -n 1 -r
    echo
    [[ ! $REPLY =~ ^[Jj]$ ]] && continue
fi
```

---

### ☑️ TODO #5: DROP DATABASE Warnung

**Datei:** `install.sh` Zeile 1232-1249  
**Problem:** Bei Re-Installation werden ALLE Daten ohne Warnung gelöscht!  
**Priorität:** 🔴 Hoch (Datenverlust!)  
**Zeitaufwand:** 10 Minuten

**Aktueller Code:**
```bash
info "Erstelle Datenbank '$DB_NAME'..."

su - postgres -c "psql" <<EOF
DROP DATABASE IF EXISTS $DB_NAME;  # ❌ Keine Warnung!
DROP USER IF EXISTS $DB_USER;
CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
# ...
EOF
```

**Fix:**
```bash
info "Prüfe ob Datenbank existiert..."

# Prüfe ob Datenbank bereits existiert
DB_EXISTS=$(su - postgres -c "psql -lqt" | cut -d \| -f 1 | grep -w "$DB_NAME" | wc -l)

if [ "$DB_EXISTS" -gt 0 ]; then
    echo ""
    warning "┌─────────────────────────────────────────────────────┐"
    warning "│  Datenbank '$DB_NAME' existiert bereits!        │"
    warning "└─────────────────────────────────────────────────────┘"
    echo ""
    echo -e "${RED}⚠️  WARNUNG: ALLE DATEN WERDEN GELÖSCHT! ⚠️${NC}"
    echo ""
    echo -e "${YELLOW}Dies betrifft:${NC}"
    echo -e "  • Alle Benutzer-Accounts"
    echo -e "  • Alle Artikel & Events"
    echo -e "  • Alle Flugbuch-Einträge"
    echo -e "  • Alle Protokolle"
    echo -e "  • Alle Uploads bleiben erhalten (Saves/)"
    echo ""
    
    # Zeige aktuelle Datenbankgröße
    DB_SIZE=$(su - postgres -c "psql -c \"SELECT pg_size_pretty(pg_database_size('$DB_NAME'))\" -tA" 2>/dev/null || echo "unbekannt")
    echo -e "${CYAN}Aktuelle Datenbankgröße: ${YELLOW}$DB_SIZE${NC}"
    echo ""
    
    # Backup-Option anbieten
    echo -e "${CYAN}Möchtest du vorher ein Backup erstellen?${NC}"
    echo -ne "   ${BLUE}►${NC} Backup erstellen? (J/n): "
    read -n 1 -r BACKUP_REPLY
    echo
    echo
    
    if [[ ! $BACKUP_REPLY =~ ^[Nn]$ ]]; then
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
    echo -ne "   ${BLUE}►${NC} Zum Löschen 'JA' eingeben (Groß/Kleinschreibung egal): "
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
        echo -e "  ${GREEN}3.${NC} Datenbank behalten und nur Schema aktualisieren"
        echo ""
        exit 0
    fi
    
    echo ""
    warning "Lösche Datenbank '$DB_NAME'..."
fi

# Jetzt erst DROP ausführen
info "Erstelle Datenbank '$DB_NAME'..."

su - postgres -c "psql" <<EOF > /dev/null 2>&1
DROP DATABASE IF EXISTS $DB_NAME;
DROP USER IF EXISTS $DB_USER;
CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
CREATE DATABASE $DB_NAME OWNER $DB_USER;
# ... rest ...
EOF

success "Datenbank '$DB_NAME' erstellt"
```

---

### ☑️ TODO #6: Port 3000 Sicherheit

**Datei:** `install.sh` Zeile 2096 + `backend/server.js`  
**Problem:** Backend API ist von außen erreichbar → Umgeht Nginx!  
**Priorität:** 🔴 Hoch (Sicherheit!)  
**Zeitaufwand:** 5 Minuten

**Problem:**
```bash
# Zeile 2096:
ufw allow 3000/tcp  # ❌ Port 3000 für ALLE offen!
```

**Was passiert:**
- Angreifer kann direkt auf http://server-ip:3000/api zugreifen
- Umgeht Nginx Rate-Limiting
- Umgeht Nginx Logs
- Direkter Zugriff auf Backend

**Fix Option A: Firewall (schnell):**
```bash
# Zeile 2096: ENTFERNEN oder kommentieren
# ufw allow 3000/tcp  # ❌ NICHT öffentlich machen!

# Port 3000 ist nur von localhost erreichbar (Nginx macht Proxy)
info "Backend läuft auf localhost:3000 (nur über Nginx erreichbar)"
```

**Fix Option B: Backend lauscht nur auf localhost (besser):**
```javascript
// backend/server.js (Zeile ~200)

// VORHER:
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// NACHHER:
app.listen(PORT, 'localhost', () => {
  console.log(`Server running on localhost:${PORT}`);
  console.log('Backend ist nur über Nginx erreichbar (Sicherheit)');
});
```

**Test:**
```bash
# Von außen sollte NICHT funktionieren:
curl http://server-ip:3000/api/health  # ❌ Connection refused

# Von localhost sollte funktionieren:
curl http://localhost:3000/api/health  # ✓ OK
```

---

### ☑️ TODO #7: chown zu breit

**Datei:** `install.sh` Zeile 1803  
**Problem:** `.git/` gehört jetzt www-data → git pull fehlschlägt!  
**Priorität:** 🟡 Mittel  
**Zeitaufwand:** 5 Minuten

**Aktueller Code:**
```bash
info "Setze Berechtigungen..."
chown -R www-data:www-data "$INSTALL_DIR"
success "Berechtigungen gesetzt"
```

**Problem:**
```bash
# Nach chown:
ls -la /var/www/fmsv-dingden/.git/
# drwxr-xr-x www-data www-data .git/

# Später als root:
cd /var/www/fmsv-dingden
git pull
# error: cannot open .git/FETCH_HEAD: Permission denied
```

**Fix:**
```bash
info "Setze Berechtigungen..."

# NUR spezifische Verzeichnisse, nicht alles!
chown -R www-data:www-data "$INSTALL_DIR/dist"
chown -R www-data:www-data "$INSTALL_DIR/Saves"
chown -R www-data:www-data "$INSTALL_DIR/Logs"
chown -R www-data:www-data "$INSTALL_DIR/backend"

# Frontend package-lock.json
chown www-data:www-data "$INSTALL_DIR/package.json" 2>/dev/null || true
chown www-data:www-data "$INSTALL_DIR/package-lock.json" 2>/dev/null || true

# .git/ bleibt root!
# Installation/ bleibt root!
# node_modules/ gehört www-data (wegen Backend)

success "Berechtigungen gesetzt (dist, Saves, Logs, backend)"
```

**Alternative (besser für Updates):**
```bash
# Backend läuft als root statt www-data
# Dann brauchen wir kein chown

# In systemd Service:
[Service]
User=root  # Statt www-data
# ...
```

---

### ☑️ TODO #8: Wartungs-Script Pfad-Fehler

**Datei:** `install.sh` Zeile 2127  
**Problem:** `debug.sh` existiert nicht, sollte `debug-new.sh` sein  
**Priorität:** 🟢 Niedrig (aber einfach zu fixen)  
**Zeitaufwand:** 2 Minuten

**Aktueller Code:**
```bash
# Kopiere Debug und Update Scripts
info "Kopiere Wartungs-Scripts..."
cp -f /var/www/fmsv-dingden/Installation/scripts/debug.sh /usr/local/bin/fmsv-debug
cp -f /var/www/fmsv-dingden/Installation/scripts/update.sh /usr/local/bin/fmsv-update
```

**Fix:**
```bash
info "Kopiere Wartungs-Scripts..."

# Debug Script
if [ -f "$INSTALL_DIR/Installation/scripts/debug-new.sh" ]; then
    cp -f "$INSTALL_DIR/Installation/scripts/debug-new.sh" /usr/local/bin/fmsv-debug
    chmod +x /usr/local/bin/fmsv-debug
    success "fmsv-debug installiert"
else
    warning "debug-new.sh nicht gefunden - überspringe"
fi

# Update Script
if [ -f "$INSTALL_DIR/Installation/scripts/update.sh" ]; then
    cp -f "$INSTALL_DIR/Installation/scripts/update.sh" /usr/local/bin/fmsv-update
    chmod +x /usr/local/bin/fmsv-update
    success "fmsv-update installiert"
else
    warning "update.sh nicht gefunden - überspringe"
fi
```

---

## ⚠️ PRIORITÄT 2: Wichtige Verbesserungen (diese Woche)

**Zeitbedarf:** 2-3 Stunden  
**Impact:** Robustheit & Wartbarkeit

---

### ☑️ TODO #9: Schema in Datenbank-Setup integrieren

**Datei:** `install.sh` Zeile 1249 (nach CREATE DATABASE)  
**Problem:** Schema wird erst in Schritt 11 eingespielt, DB existiert 300 Zeilen ohne Tabellen  
**Priorität:** 🟡 Mittel  
**Zeitaufwand:** 20 Minuten

**Aktuell:**
```
Schritt 9: CREATE DATABASE → Datenbank leer!
...
Schritt 11: node scripts/initDatabase.js → JETZT ERST Tabellen!
```

**Besser:**
```
Schritt 9: CREATE DATABASE + Schema einspielen → Datenbank komplett!
Schritt 11: Test-Daten einfügen (optional)
```

**Fix:**
```bash
# Zeile 1249 (nach CREATE DATABASE):

info "Erstelle Datenbank '$DB_NAME'..."

su - postgres -c "psql" <<EOF > /dev/null 2>&1
DROP DATABASE IF EXISTS $DB_NAME;
DROP USER IF EXISTS $DB_USER;
CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
CREATE DATABASE $DB_NAME OWNER $DB_USER;
\\c $DB_NAME
GRANT ALL ON SCHEMA public TO $DB_USER;
# ... (alle GRANTs wie aktuell)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public;
EOF

success "Datenbank '$DB_NAME' erstellt"
success "Benutzer '$DB_USER' angelegt"

# NEU: Schema sofort einspielen
echo ""
info "Installiere Datenbank-Schema..."

SCHEMA_FILE="$INSTALL_DIR/backend/database/schema.sql"

# Prüfe ob schema.sql existiert
if [ ! -f "$SCHEMA_FILE" ]; then
    warning "Schema-Datei nicht gefunden, lade von GitHub..."
    
    # Download von GitHub (aktueller Code von Zeile 1636)
    GITHUB_RAW_URL="https://raw.githubusercontent.com/Benno2406/fmsv-dingden/$BRANCH/backend/database/schema.sql"
    
    mkdir -p "$INSTALL_DIR/backend/database"
    
    if curl -f -L -o "$SCHEMA_FILE" "$GITHUB_RAW_URL" 2>&1 | grep -v "^$"; then
        success "Schema von GitHub geladen"
    else
        error "Schema konnte nicht geladen werden!"
        exit 1
    fi
fi

# Validiere Schema-Datei
SCHEMA_SIZE=$(stat -c%s "$SCHEMA_FILE" 2>/dev/null || stat -f%z "$SCHEMA_FILE" 2>/dev/null || echo "0")
if [ "$SCHEMA_SIZE" -lt 100 ]; then
    error "Schema-Datei ist zu klein ($SCHEMA_SIZE Bytes) oder korrupt!"
    exit 1
fi

success "Schema-Datei gefunden: $(du -h $SCHEMA_FILE | cut -f1)"

# Schema einspielen
info "Spiele Schema ein..."
if su - postgres -c "psql -d $DB_NAME -f $SCHEMA_FILE" > /dev/null 2>&1; then
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

# Prüfe ob Tabellen erstellt wurden
TABLE_COUNT=$(su - postgres -c "psql -d $DB_NAME -c \"SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public'\" -tA" 2>/dev/null || echo "0")

if [ "$TABLE_COUNT" -gt 5 ]; then
    success "Datenbank-Struktur validiert ($TABLE_COUNT Tabellen)"
else
    warning "Wenige Tabellen gefunden ($TABLE_COUNT) - möglicherweise unvollständig"
fi

sleep 1
```

**In Schritt 11 (Backend Setup):**
```bash
# Zeile 1730: ÄNDERN
# VORHER:
info "Initialisiere Datenbank-Schema..."
node scripts/initDatabase.js

# NACHHER:
info "Prüfe Datenbank-Schema..."
if node scripts/initDatabase.js 2>&1 | grep -q "Schema bereits vorhanden"; then
    success "Datenbank-Schema OK"
else
    # Nur bei Fehler
    warning "Schema-Check hatte Warnungen"
fi
```

---

### ☑️ TODO #10: npm install Fehlerbehandlung

**Datei:** `install.sh` Zeile 1794-1796 (Frontend)  
**Problem:** Fehler werden nicht erkannt  
**Priorität:** 🟡 Mittel  
**Zeitaufwand:** 15 Minuten

**Aktueller Code:**
```bash
info "Installiere Frontend-Dependencies..."
npm install --silent > /dev/null 2>&1
success "Frontend-Dependencies installiert"
```

**Problem:**
- `--silent > /dev/null` unterdrückt ALLE Ausgaben
- Exit-Code wird ignoriert
- `success` wird immer ausgeführt

**Fix:**
```bash
info "Installiere Frontend-Dependencies..."
echo ""

# npm install MIT Ausgabe & Exit-Code Check
if npm install 2>&1 | tee -a "$LOG_FILE" | grep -E "added|removed|changed|up to date"; then
    echo ""
    
    # Prüfe ob node_modules existiert
    if [ ! -d "$INSTALL_DIR/node_modules" ]; then
        echo ""
        error "npm install scheinbar erfolgreich, aber node_modules/ fehlt!"
    fi
    
    # Zeige installierte Package-Anzahl
    PACKAGE_COUNT=$(ls -1 "$INSTALL_DIR/node_modules" | wc -l)
    success "Frontend-Dependencies installiert ($PACKAGE_COUNT Pakete)"
else
    echo ""
    error "npm install fehlgeschlagen!"
    echo ""
    echo -e "${YELLOW}Letzte npm-Ausgabe:${NC}"
    tail -50 "$LOG_FILE" | grep -A 5 -B 5 "ERR!"
    echo ""
    echo -e "${YELLOW}Häufige Ursachen:${NC}"
    echo -e "  ${RED}1.${NC} Keine Internetverbindung zu npmjs.com"
    echo -e "  ${RED}2.${NC} package.json korrupt"
    echo -e "  ${RED}3.${NC} Disk Space voll"
    echo -e "  ${RED}4.${NC} npm Cache korrupt"
    echo ""
    echo -e "${YELLOW}Lösungen:${NC}"
    echo -e "  ${GREEN}npm cache clean --force${NC}"
    echo -e "  ${GREEN}rm -rf node_modules package-lock.json${NC}"
    echo -e "  ${GREEN}npm install${NC}"
    echo ""
    exit 1
fi
```

**Gleicher Fix für Backend (Zeile 1560-1563):**
```bash
info "Installiere Backend-Dependencies..."
echo ""

cd "$INSTALL_DIR/backend"

if npm install --production 2>&1 | tee -a "$LOG_FILE" | grep -E "added|up to date"; then
    echo ""
    PACKAGE_COUNT=$(ls -1 "$INSTALL_DIR/backend/node_modules" | wc -l)
    success "Backend-Dependencies installiert ($PACKAGE_COUNT Pakete)"
else
    echo ""
    error "Backend npm install fehlgeschlagen!"
    exit 1
fi
```

---

### ☑️ TODO #11: Doppeltes Backend npm install entfernen

**Datei:** `install.sh` Zeile 1722-1728  
**Problem:** npm install wird zweimal gemacht (unnötig & verwirrend)  
**Priorität:** 🟢 Niedrig  
**Zeitaufwand:** 2 Minuten

**Code:**
```bash
# Zeile 1560-1563: Erstes npm install
npm install --production --silent

# Zeile 1722-1728: Zweites npm install (WARUM??)
info "Installiere Backend-Dependencies..."
npm install 2>&1 | tee -a "$LOG_FILE" | grep -q "added\|up to date"
```

**Fix:** Zeile 1722-1728 LÖSCHEN
```bash
# Zeile 1722-1728: KOMPLETT ENTFERNEN!
# Ist bereits in Zeile 1560 passiert

# ODER: Wenn Dev-Dependencies gebraucht werden:
# Zeile 1561: --production entfernen
npm install  # Statt: npm install --production
```

---

### ☑️ TODO #12: return in Main-Script fixen

**Datei:** `install.sh` Zeile 1289, 1346, 1367, 1393  
**Problem:** `return 0` funktioniert nur in Funktionen, nicht im Main-Script!  
**Priorität:** 🟡 Mittel  
**Zeitaufwand:** 10 Minuten

**Problem-Code:**
```bash
# Zeile 1289 (Cloudflare GPG Key fehlgeschlagen):
if [[ $SKIP_CF =~ ^[Jj]$ ]]; then
    warning "Cloudflare wird übersprungen"
    return 0  # ❌ return in Main-Script funktioniert nicht!
else
    exit 1
fi

# Gleiches Problem: Zeile 1346, 1367, 1393
```

**Was passiert:**
```bash
./install.sh
# ... Cloudflare fehlgeschlagen ...
# Benutzer wählt: "Ja, überspringen"
# return 0
# bash: return: can only `return' from a function or sourced script
# Script bricht ab!
```

**Fix Option A: In Funktion auslagern**
```bash
# Am Anfang der Datei (nach Farb-Definitionen):

################################################################################
# Cloudflare Installation (als Funktion)
################################################################################

install_cloudflare() {
    print_header 10 "Cloudflare Tunnel Installation"
    
    # ... gesamter Cloudflare-Code hier ...
    
    # Jetzt funktioniert return!
    if [[ $SKIP_CF =~ ^[Jj]$ ]]; then
        warning "Cloudflare wird übersprungen"
        return 0  # ✓ OK in Funktion!
    fi
    
    # ...
}

# Später im Script:
if [[ $USE_CLOUDFLARE =~ ^[Jj]$ ]]; then
    install_cloudflare
else
    print_header 10 "Cloudflare Tunnel (Übersprungen)"
    info "Cloudflare wird nicht verwendet"
fi
```

**Fix Option B: return → exit ändern (schneller)**
```bash
# Alle return 0 → exit 0 ändern
# ABER: exit beendet das GESAMTE Script!

# Besser: Nur Cloudflare überspringen, nicht ganzes Script
# → Flag setzen

if [[ $SKIP_CF =~ ^[Jj]$ ]]; then
    warning "Cloudflare wird übersprungen"
    USE_CLOUDFLARE="n"  # Flag setzen
    # KEIN return, KEIN exit - einfach weitermachen!
fi
```

**Empfehlung:** Option B (schneller & einfacher)

---

### ☑️ TODO #13: Auto-Update Backup hinzufügen

**Datei:** `Installation/scripts/auto-update.sh` (wird in install.sh erstellt)  
**Problem:** Update ohne Backup → Datenverlust bei Fehler möglich  
**Priorität:** 🟡 Mittel  
**Zeitaufwand:** 30 Minuten

**Aktueller auto-update.sh:**
```bash
# Zeile 1859-1872:
git fetch origin
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/$BRANCH)

if [ "$LOCAL" = "$REMOTE" ]; then
    log "Keine Updates verfügbar"
    exit 0
fi

log "Updates gefunden: $LOCAL -> $REMOTE"
git pull origin $BRANCH  # ❌ Kein Backup!

# ... Update ...
```

**Fix:**
```bash
# In install.sh, Zeile 1836 (auto-update.sh Template):

cat > "$INSTALL_DIR/Installation/scripts/auto-update.sh" <<'EOF'
#!/bin/bash

# FMSV Auto-Update Script mit Backup & Rollback

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

BRANCH=$(grep UPDATE_BRANCH backend/.env | cut -d '=' -f2)
if [ -z "$BRANCH" ]; then
    BRANCH="main"
fi

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
# BACKUP ERSTELLEN (VOR Update!)
# ══════════════════════════════════════════════════════════

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_SQL="$BACKUP_DIR/database-$TIMESTAMP.sql"
BACKUP_SAVES="$BACKUP_DIR/saves-$TIMESTAMP.tar.gz"

log "Erstelle Backup..."

# Datenbank-Backup
DB_NAME=$(grep DB_NAME backend/.env | cut -d '=' -f2)
if [ -n "$DB_NAME" ]; then
    log "Backup Datenbank: $DB_NAME"
    if su - postgres -c "pg_dump $DB_NAME" > "$BACKUP_SQL" 2>&1; then
        log "Datenbank-Backup: $BACKUP_SQL ($(du -h $BACKUP_SQL | cut -f1))"
    else
        log "WARNUNG: Datenbank-Backup fehlgeschlagen!"
    fi
fi

# Saves-Backup
if [ -d "$INSTALL_DIR/Saves" ]; then
    log "Backup Uploads: Saves/"
    if tar -czf "$BACKUP_SAVES" -C "$INSTALL_DIR" Saves/ 2>&1; then
        log "Uploads-Backup: $BACKUP_SAVES ($(du -h $BACKUP_SAVES | cut -f1))"
    else
        log "WARNUNG: Uploads-Backup fehlgeschlagen!"
    fi
fi

# Git-Commit für Rollback merken
ROLLBACK_COMMIT="$LOCAL"
log "Rollback-Punkt: $ROLLBACK_COMMIT"

# ══════════════════════════════════════════════════════════
# UPDATE DURCHFÜHREN
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
    
    # ROLLBACK
    log "Führe Rollback durch..."
    cd "$INSTALL_DIR"
    git reset --hard "$ROLLBACK_COMMIT"
    systemctl restart fmsv-backend
    
    log "Rollback abgeschlossen - alte Version wiederhergestellt"
    exit 1
fi
cd ..

# Frontend Update
log "Aktualisiere Frontend..."
if ! npm install 2>&1 | tee -a "$LOG_FILE"; then
    log "FEHLER: Frontend npm install fehlgeschlagen!"
    
    # ROLLBACK
    log "Führe Rollback durch..."
    git reset --hard "$ROLLBACK_COMMIT"
    npm run build
    systemctl restart fmsv-backend nginx
    
    log "Rollback abgeschlossen"
    exit 1
fi

if ! npm run build 2>&1 | tee -a "$LOG_FILE"; then
    log "FEHLER: Frontend Build fehlgeschlagen!"
    
    # ROLLBACK
    log "Führe Rollback durch..."
    git reset --hard "$ROLLBACK_COMMIT"
    npm run build
    systemctl restart fmsv-backend nginx
    
    log "Rollback abgeschlossen"
    exit 1
fi

# ══════════════════════════════════════════════════════════
# SERVICES NEU STARTEN
# ══════════════════════════════════════════════════════════

log "Starte Services neu..."

systemctl restart fmsv-backend
sleep 3

# Prüfe ob Backend gestartet ist
if ! systemctl is-active --quiet fmsv-backend; then
    log "FEHLER: Backend konnte nicht gestartet werden!"
    
    # ROLLBACK
    log "Führe Rollback durch..."
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

# Backend erreichbar?
sleep 3
if curl -s http://localhost:3000/api/health > /dev/null; then
    log "Backend erreichbar ✓"
else
    log "WARNUNG: Backend nicht erreichbar!"
fi

# Frontend erreichbar?
if curl -s http://localhost > /dev/null; then
    log "Frontend erreichbar ✓"
else
    log "WARNUNG: Frontend nicht erreichbar!"
fi

# ══════════════════════════════════════════════════════════
# ALTE BACKUPS AUFRÄUMEN (behalte letzte 7)
# ══════════════════════════════════════════════════════════

log "Räume alte Backups auf..."
find "$BACKUP_DIR" -name "database-*.sql" -mtime +7 -delete 2>/dev/null
find "$BACKUP_DIR" -name "saves-*.tar.gz" -mtime +7 -delete 2>/dev/null

BACKUP_COUNT=$(ls -1 "$BACKUP_DIR" | wc -l)
log "Aktuelle Backups: $BACKUP_COUNT"

log "====== Auto-Update abgeschlossen ======"
EOF
```

---

## 📦 PRIORITÄT 3: Refactoring (nächste 2 Wochen)

Siehe separate Datei: `INSTALL-SH-MODULAR.md`

---

## 📝 CHECK-LISTE: Alle TODOs

### Phase 1 - SOFORT (1-2 Std):
- [ ] TODO #1: Frontend Build Fehlerbehandlung ⭐ WICHTIGSTER FIX!
- [ ] TODO #2: Nummerierung korrigieren
- [ ] TODO #3: Reihenfolge korrigieren
- [ ] TODO #4: Passwort-Validierung
- [ ] TODO #5: DROP DATABASE Warnung
- [ ] TODO #6: Port 3000 schließen
- [ ] TODO #7: chown Fix
- [ ] TODO #8: Wartungs-Script Pfad

### Phase 2 - Diese Woche (2-3 Std):
- [ ] TODO #9: Schema in DB-Setup integrieren
- [ ] TODO #10: npm install Error-Handling
- [ ] TODO #11: Doppeltes npm install entfernen
- [ ] TODO #12: return 0 fixen
- [ ] TODO #13: Auto-Update Backup

### Phase 3 - Nächste 2 Wochen (siehe MODULAR.md):
- [ ] pgAdmin auslagern
- [ ] Cloudflare auslagern
- [ ] Error-Handler vereinheitlichen
- [ ] Modularisierung

---

## 🎯 Nach Phase 1 & 2:

**✅ Installation ist:**
- Stabil (keine verschluckten Fehler)
- Sicher (Passwort-Validierung, Port 3000 zu, Backups)
- Wartbar (bessere Error-Messages, Logs)
- Idempotent (kann mehrfach laufen)

**📈 Bewertung:**
- Vorher: 6.5/10
- Nach Phase 1: 8/10
- Nach Phase 2: 8.5/10
- Nach Phase 3: 9.5/10

---

**Bereit zum Starten?** 🚀
