# 🔄 Datenbank-Migration - Modulares Setup

## ✅ Was wurde geändert?

Das Datenbank-Schema wurde von **einer großen Datei** in **31 kleine Module** aufgeteilt, um Stack-Overflow-Fehler zu vermeiden und die Wartbarkeit zu verbessern.

### Vorher (❌ Problematisch)

```
database/
└── schema.sql          # 5000+ Zeilen - verursacht Stack Overflow!
```

**Problem:** PostgreSQL/Node.js können sehr große SQL-Dateien nicht in einem Query verarbeiten.

### Nachher (✅ Gelöst)

```
database/
├── tables/             # 15 Tabellen-Dateien
│   ├── 01-users.sql
│   ├── 02-refresh_tokens.sql
│   ├── ...
│   └── 15-audit_log.sql
│
└── data/               # 16 Initial-Daten-Dateien
    ├── 01-roles.sql
    ├── 02-permissions-members.sql
    ├── ...
    └── 16-role-permissions-members.sql
```

**Lösung:** Jede Datei wird einzeln geladen - keine Stack-Overflows mehr!

## 🚀 Neuer Initialisierungs-Prozess

### Backend: `scripts/initDatabase.js`

Das Node.js Script lädt die Dateien jetzt Schritt für Schritt:

```javascript
// 1. Tabellen erstellen (01-15)
for (const file of tableFiles) {
  const sql = fs.readFileSync(filePath, 'utf8');
  await client.query(sql);  // Jede Datei einzeln!
}

// 2. Initial-Daten laden (01-16)
for (const file of dataFiles) {
  const sql = fs.readFileSync(filePath, 'utf8');
  await client.query(sql);  // Jede Datei einzeln!
}
```

### Installation: `install.sh`

Das Installations-Script verwendet weiterhin:

```bash
cd $INSTALL_DIR/backend
node scripts/initDatabase.js
```

**Keine Änderung am install.sh nötig!** Das Script funktioniert automatisch mit dem neuen modularen System.

## 📦 Was ist in welcher Datei?

### Tabellen (`tables/`)

| Datei | Inhalt | Foreign Keys |
|-------|--------|--------------|
| `01-users.sql` | Benutzer-Tabelle | - |
| `02-refresh_tokens.sql` | JWT Tokens | → users |
| `03-two_fa_sessions.sql` | 2FA Sessions | → users |
| `04-two_fa_backup_codes.sql` | Backup Codes | → users |
| `05-roles.sql` | RBAC Rollen | - |
| `06-permissions.sql` | RBAC Permissions | - |
| `07-role_permissions.sql` | Rollen ↔ Permissions | → roles, permissions |
| `08-user_roles.sql` | Users ↔ Rollen | → users, roles |
| `09-articles.sql` | Artikel/News | → users (author) |
| `10-events.sql` | Termine | → users (organizer) |
| `11-flugbuch.sql` | Flugbuch | → users (pilot, instructor) |
| `12-images.sql` | Bilder | → users (uploader) |
| `13-protocols.sql` | Protokolle | → users (author) |
| `14-notifications.sql` | Benachrichtigungen | → users |
| `15-audit_log.sql` | Audit Trail | → users |

### Initial-Daten (`data/`)

| Datei | Anzahl | Beschreibung |
|-------|--------|--------------|
| `01-roles.sql` | 12 | System-Rollen (Superadmin → Gastmitglied) |
| `02-permissions-members.sql` | 10 | Mitglieder-Verwaltung |
| `03-permissions-roles.sql` | 7 | Rollen & Permissions |
| `04-permissions-articles.sql` | 8 | Artikel-Management |
| `05-permissions-events.sql` | 7 | Termin-Management |
| `06-permissions-flugbuch.sql` | 9 | Flugbuch-Management |
| `07-permissions-images.sql` | 12 | Bilder & Galerien |
| `08-permissions-documents.sql` | 7 | Dokumente |
| `09-permissions-protocols.sql` | 9 | Protokolle |
| `10-permissions-other.sql` | 20 | Notifications, System, Statistics, Audit, Security |
| `11-role-permissions-superadmin.sql` | Alle | Superadmin bekommt alle Permissions |
| `12-role-permissions-admin.sql` | ~90 | Admin (alle außer DB-Zugriff) |
| `13-role-permissions-vorstand.sql` | ~40 | Vorstand (erweiterte Rechte) |
| `14-role-permissions-webmaster.sql` | ~35 | Webmaster (Content & System) |
| `15-role-permissions-other-roles.sql` | ~20/Rolle | Kassenwart, Schriftführer, Jugendwart, Fluglehrer |
| `16-role-permissions-members.sql` | ~10/Rolle | Aktive, Passive, Ehren-, Gastmitglieder |

**Gesamt:** 
- 15 Tabellen
- 12 Rollen
- 100+ Permissions
- ~300 Rollen-Permission-Zuordnungen

## 🔧 Für Entwickler

### Neue Tabelle hinzufügen

1. Datei erstellen: `tables/16-neue_tabelle.sql`
2. In `scripts/initDatabase.js` hinzufügen:
   ```javascript
   const tableFiles = [
     // ...
     '16-neue_tabelle.sql'
   ];
   ```

### Neue Permission hinzufügen

1. Datei erweitern: `data/10-permissions-other.sql` (oder neue Kategorie)
2. Rollen-Zuordnung: `data/11-role-permissions-*.sql`

### Lokales Testen

```bash
# Datenbank zurücksetzen
psql -U postgres <<EOF
DROP DATABASE IF EXISTS fmsv_dingden;
CREATE DATABASE fmsv_dingden OWNER fmsv_user;
EOF

# Neu initialisieren
cd backend
node scripts/initDatabase.js

# Logs prüfen
# Du siehst jetzt jeden Schritt einzeln!
```

## ⚠️ Breaking Changes

### Für bestehende Installationen

Falls du bereits eine Installation hast und updaten willst:

```bash
# WARNUNG: Löscht alle Daten!
cd /var/www/fmsv-dingden/backend
psql -U postgres <<EOF
DROP DATABASE IF EXISTS fmsv_dingden;
CREATE USER fmsv_user WITH PASSWORD 'dein_passwort';
CREATE DATABASE fmsv_dingden OWNER fmsv_user;
EOF

# Neu initialisieren
node scripts/initDatabase.js
```

### Für neue Installationen

**Keine Änderung!** Das `install.sh` Script funktioniert automatisch.

## 📝 Commit Message

```
refactor(database): Split schema into modular files

- Split schema.sql into 15 table files
- Split init-data into 16 data files
- Update initDatabase.js to load files sequentially
- Fix: Stack overflow with large SQL files
- Add: Better error handling per table/data file
- Add: Detailed logging for each step

BREAKING CHANGE: Existing databases need migration
```

## 🎉 Vorteile

✅ **Kein Stack Overflow mehr**
✅ **Bessere Übersicht** - Jede Tabelle in eigener Datei
✅ **Einfachere Wartung** - Änderungen nur in relevanten Dateien
✅ **Detaillierte Logs** - Sehe genau wo Fehler auftreten
✅ **Modularer** - Tabellen/Daten können einzeln geladen werden
✅ **Versionskontrolle** - Git Diffs sind viel übersichtlicher

## 📞 Support

Bei Fragen oder Problemen:
- Issue erstellen auf GitHub
- `initDatabase.js` Log prüfen
- PostgreSQL Logs: `journalctl -u postgresql -n 100`
