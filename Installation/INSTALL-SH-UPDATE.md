# install.sh Update für RBAC & 2FA

## ✅ Was wurde implementiert

Das Backend ist **komplett fertig** mit:
- RBAC-System (12 Rollen, 100+ Permissions)
- 2FA-Support (TOTP + Backup-Codes)
- CommonJS-Migration (alle Module)
- pgAdmin 4 auf Port 1880/18443

## 📝 Manuelles Update für install.sh

**Zeile 883-886 in `/Installation/scripts/install.sh` ersetzen:**

### VORHER (ALT):
```bash
success "Datenbank '$DB_NAME' erstellt"
success "Benutzer '$DB_USER' angelegt"
sleep 1
```

### NACHHER (NEU):
```bash
success "Datenbank '$DB_NAME' erstellt"
success "Benutzer '$DB_USER' angelegt"

# Schema laden
info "Lade Datenbank-Schema..."
if su - postgres -c "psql -d $DB_NAME -f $INSTALL_DIR/backend/database/schema-clean.sql" >> "$LOG_FILE" 2>&1; then
    success "Schema geladen (Tabellen erstellt)"
else
    error "Schema konnte nicht geladen werden! Siehe $LOG_FILE"
fi

# Initial-Daten laden (Roles & Permissions)
info "Lade Initial-Daten (Rollen & Berechtigungen)..."
if su - postgres -c "psql -d $DB_NAME -f $INSTALL_DIR/backend/database/init-data.sql" >> "$LOG_FILE" 2>&1; then
    success "Initial-Daten geladen (12 Rollen, 100+ Permissions)"
else
    error "Initial-Daten konnten nicht geladen werden! Siehe $LOG_FILE"
fi

# Berechtigungen sicherstellen
info "Setze finale Berechtigungen..."
su - postgres -c "psql -d $DB_NAME" <<PERMS > /dev/null 2>&1
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;
PERMS

success "Datenbank vollständig initialisiert ✅"
sleep 1
```

## 🚀 Testen

Nach dem Update einfach ausführen:

```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./install.sh
```

Das Script lädt jetzt automatisch:
1. Schema (alle Tabellen)
2. Initial-Daten (12 Rollen + 100+ Permissions)
3. Berechtigungen werden gesetzt

## 📊 Was wird geladen

**12 System-Rollen:**
- Super-Administrator (500MB Upload, 10GB Storage)
- Administrator (200MB / 5GB)
- Vorstand (100MB / 2GB)
- Webmaster (150MB / 3GB)
- Kassenwart, Schriftführer, Jugendwart, Fluglehrer
- Aktives Mitglied (20MB / 300MB)
- Passives Mitglied, Ehrenmitglied, Gastmitglied

**14 Kategorien mit 100+ Permissions:**
- members, roles, articles, events, flugbuch
- images, documents, protocols, notifications
- system, statistics, audit, security

Alle Permissions sind bereits den Rollen zugewiesen! 🎉

## ⚙️ Backend starten

```bash
cd /var/www/fmsv-dingden/backend
npm install
node server.js
```

Du solltest sehen:
```
✅ Datenbank-Verbindung erfolgreich
🚀 FMSV Backend läuft auf Port 3000
🔐 RBAC-System: AKTIV
🔑 2FA-Support: AKTIV
📊 Upload-Limits: Pro Rolle konfigurierbar
✨ Backend bereit!
```

## 🎯 Nächste Schritte

1. **Admin-User erstellen** (per Datenbank oder API)
2. **2FA aktivieren** für wichtige Accounts
3. **Rollen zuweisen** an Mitglieder
4. **Frontend anpassen** für RBAC-Permissions

## 📁 Dateien

- `/backend/database/schema-clean.sql` - Datenbank-Schema
- `/backend/database/init-data.sql` - Initial-Daten
- `/backend/routes/rbac.js` - RBAC-Verwaltung-API
- `/backend/routes/auth.js` - Login mit 2FA
- `/backend/middleware/rbac.js` - Permission-Checks
- `/backend/middleware/twoFactor.js` - 2FA-Logik

Fertig! 🎉
