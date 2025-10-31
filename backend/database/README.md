# FMSV Dingden - Database Schema

Dieses Verzeichnis enthält alle SQL-Dateien für die PostgreSQL-Datenbank.

## 📂 Struktur

```
database/
├── tables/          # Tabellen-Definitionen (15 Dateien)
│   ├── 01-users.sql
│   ├── 02-refresh_tokens.sql
│   ├── 03-two_fa_sessions.sql
│   ├── 04-two_fa_backup_codes.sql
│   ├── 05-roles.sql
│   ├── 06-permissions.sql
│   ├── 07-role_permissions.sql
│   ├── 08-user_roles.sql
│   ├── 09-articles.sql
│   ├── 10-events.sql
│   ├── 11-flugbuch.sql
│   ├── 12-images.sql
│   ├── 13-protocols.sql
│   ├── 14-notifications.sql
│   └── 15-audit_log.sql
│
└── data/            # Initial-Daten (16 Dateien)
    ├── 01-roles.sql                          # 12 System-Rollen
    ├── 02-permissions-members.sql            # Mitglieder-Permissions
    ├── 03-permissions-roles.sql              # Rollen-Permissions
    ├── 04-permissions-articles.sql           # Artikel-Permissions
    ├── 05-permissions-events.sql             # Event-Permissions
    ├── 06-permissions-flugbuch.sql           # Flugbuch-Permissions
    ├── 07-permissions-images.sql             # Bilder-Permissions
    ├── 08-permissions-documents.sql          # Dokumente-Permissions
    ├── 09-permissions-protocols.sql          # Protokoll-Permissions
    ├── 10-permissions-other.sql              # Sonstige Permissions
    ├── 11-role-permissions-superadmin.sql    # Superadmin-Zuordnung
    ├── 12-role-permissions-admin.sql         # Admin-Zuordnung
    ├── 13-role-permissions-vorstand.sql      # Vorstand-Zuordnung
    ├── 14-role-permissions-webmaster.sql     # Webmaster-Zuordnung
    ├── 15-role-permissions-other-roles.sql   # Andere Rollen-Zuordnung
    └── 16-role-permissions-members.sql       # Mitglieder-Zuordnung
```

## 🚀 Verwendung

### Automatische Installation (Empfohlen)

Das `initDatabase.js` Script lädt alle Tabellen und Daten automatisch in der richtigen Reihenfolge:

```bash
cd backend
node scripts/initDatabase.js
```

**Vorteile:**
- ✅ Automatische Reihenfolge
- ✅ Fehlerbehandlung
- ✅ Detaillierte Logs
- ✅ Kein Stack Overflow bei großen Dateien

### Manuelle Installation

Falls du die Dateien manuell laden möchtest:

```bash
# 1. Tabellen erstellen
psql -U fmsv_user -d fmsv_dingden -f database/tables/01-users.sql
psql -U fmsv_user -d fmsv_dingden -f database/tables/02-refresh_tokens.sql
# ... etc

# 2. Initial-Daten laden
psql -U fmsv_user -d fmsv_dingden -f database/data/01-roles.sql
psql -U fmsv_user -d fmsv_dingden -f database/data/02-permissions-members.sql
# ... etc
```

**Oder als Loop:**

```bash
# Tabellen
for file in database/tables/*.sql; do
  echo "Loading $file..."
  psql -U fmsv_user -d fmsv_dingden -f "$file"
done

# Daten
for file in database/data/*.sql; do
  echo "Loading $file..."
  psql -U fmsv_user -d fmsv_dingden -f "$file"
done
```

## 📊 Tabellen-Übersicht

### Authentication & Security
- **users** - Benutzer mit 2FA-Support, Account-Locking
- **refresh_tokens** - JWT Refresh Tokens mit Device-Tracking
- **two_fa_sessions** - Temporäre 2FA-Sessions
- **two_fa_backup_codes** - Einmalige Backup-Codes

### RBAC System
- **roles** - Rollen mit Upload-Limits (12 System-Rollen)
- **permissions** - Granulare Berechtigungen (100+ Permissions)
- **role_permissions** - Many-to-Many Zuordnung
- **user_roles** - Benutzer-Rollen-Zuordnung

### Content Management
- **articles** - Artikel & News mit Tags
- **events** - Termine & Veranstaltungen
- **protocols** - Sitzungsprotokolle
- **images** - Bilder & Galerien

### Vereinsverwaltung
- **flugbuch** - Flugbuch-Einträge mit Statistiken
- **notifications** - System-Benachrichtigungen
- **audit_log** - Vollständiger Audit-Trail

## 🔐 RBAC System

### Rollen-Hierarchie (Level)

| Rolle | Level | Upload-Limit | Storage-Limit |
|-------|-------|--------------|---------------|
| **Superadmin** | 1000 | 500 MB | 10 GB |
| **Admin** | 900 | 200 MB | 5 GB |
| **Vorstand** | 800 | 100 MB | 2 GB |
| **Webmaster** | 750 | 150 MB | 3 GB |
| **Kassenwart** | 700 | 50 MB | 1 GB |
| **Schriftführer** | 650 | 50 MB | 1 GB |
| **Jugendwart** | 600 | 50 MB | 1 GB |
| **Fluglehrer** | 550 | 30 MB | 500 MB |
| **Aktives Mitglied** | 500 | 20 MB | 300 MB |
| **Ehrenmitglied** | 450 | 20 MB | 300 MB |
| **Passives Mitglied** | 400 | 10 MB | 100 MB |
| **Gastmitglied** | 300 | 5 MB | 50 MB |

### Permission-Kategorien

- **members** - Mitgliederverwaltung (10 Permissions)
- **roles** - Rollen & Berechtigungen (7 Permissions)
- **articles** - Artikel & News (8 Permissions)
- **events** - Termine (7 Permissions)
- **flugbuch** - Flugbuch (9 Permissions)
- **images** - Bilder & Galerien (12 Permissions)
- **documents** - Dokumente (7 Permissions)
- **protocols** - Protokolle (9 Permissions)
- **notifications** - Benachrichtigungen (4 Permissions)
- **system** - System-Einstellungen (6 Permissions)
- **statistics** - Statistiken (3 Permissions)
- **audit** - Audit-Logs (3 Permissions)
- **security** - Sicherheit & 2FA (4 Permissions)

**Gesamt: 100+ Permissions**

## 🛠 Wartung

### Schema aktualisieren

Wenn du das Schema änderst, aktualisiere die entsprechende Datei in `tables/` oder `data/`:

```bash
# Nach Änderungen testen
node scripts/initDatabase.js
```

### Datenbank zurücksetzen

```bash
# Vorsicht: Löscht alle Daten!
psql -U postgres <<EOF
DROP DATABASE IF EXISTS fmsv_dingden;
CREATE DATABASE fmsv_dingden OWNER fmsv_user;
EOF

# Neu initialisieren
cd backend
node scripts/initDatabase.js
```

## 📝 Hinweise

- **Modular:** Jede Tabelle in eigener Datei für bessere Wartbarkeit
- **Reihenfolge:** Dateien werden nummeriert (01-15) geladen
- **Keine Duplikate:** `IF NOT EXISTS` verhindert Fehler bei Re-Runs
- **Foreign Keys:** Automatisches CASCADE bei Löschungen
- **Indizes:** Optimierte Abfragen durch gezielte Indizes
- **Timestamps:** Automatische created_at/updated_at Felder
