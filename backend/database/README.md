# FMSV Dingden - Datenbank Schema

Dieses Verzeichnis enthält die PostgreSQL Datenbank-Schema Dateien.

## 📁 Dateien

### `schema.sql`
Die vollständige Datenbank-Struktur mit:
- Tabellen für Users, Events, Articles, etc.
- Indizes für Performance
- Trigger für automatische Timestamps
- Foreign Key Constraints

**WICHTIG:** Diese Datei wird beim Installation automatisch ausgeführt!

## 🚀 Schema initialisieren

```bash
# Automatisch (während Installation)
cd /var/www/fmsv-dingden/backend
node scripts/initDatabase.js

# Manuell
psql -U fmsv_user -d fmsv_dingden -f database/schema.sql
```

## 📊 Datenbank-Struktur

### Haupttabellen

- **users** - Mitglieder und Benutzerkonten
- **events** - Termine und Veranstaltungen
- **articles** - News-Artikel
- **images** - Bildergalerie
- **flugbuch** - Flugbuch-Einträge
- **protocols** - Protokolle
- **notifications** - Benachrichtigungen
- **refresh_tokens** - JWT Token für Authentifizierung
- **audit_logs** - Audit-Protokoll für Sicherheit

### Wichtige Features

- ✅ UUID als Primary Keys
- ✅ Automatische Timestamps (created_at, updated_at)
- ✅ Soft Deletes (für DSGVO-Konformität)
- ✅ Indizes für schnelle Suche
- ✅ Foreign Key Constraints

## 🔐 Sicherheit

- Passwörter werden mit bcrypt gehasht
- 2FA Support mit TOTP
- Audit Logging für alle wichtigen Aktionen
- Row-Level Security kann optional aktiviert werden

## 📝 Schema Updates

Bei Schema-Änderungen:

1. Backup erstellen: `pg_dump -U postgres fmsv_dingden > backup.sql`
2. Migration Script erstellen
3. In Beta testen
4. Production Update

## 🆘 Probleme?

### Schema-Datei fehlt

```bash
# Prüfen ob Datei existiert
ls -la /var/www/fmsv-dingden/backend/database/schema.sql

# Aus Git wiederherstellen
cd /var/www/fmsv-dingden
git checkout -- backend/database/schema.sql
```

### Datenbank neu initialisieren

```bash
# ACHTUNG: Löscht alle Daten!
su - postgres -c "psql" <<EOF
DROP DATABASE IF EXISTS fmsv_dingden;
CREATE DATABASE fmsv_dingden OWNER fmsv_user;
EOF

cd /var/www/fmsv-dingden/backend
node scripts/initDatabase.js
```

---

**Version:** 1.0  
**Letztes Update:** Oktober 2025
