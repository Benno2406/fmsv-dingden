# FMSV Dingden - Datenbank-Schema

## ✅ Implementierte Features

### RBAC (Role-Based Access Control)
- **12 System-Rollen** mit Upload-Limits:
  - Super-Administrator (500MB / 10GB)
  - Administrator (200MB / 5GB)
  - Vorstand (100MB / 2GB)
  - Webmaster (150MB / 3GB)
  - Kassenwart, Schriftführer, Jugendwart, Fluglehrer
  - Aktives Mitglied (20MB / 300MB)
  - Passives Mitglied, Ehrenmitglied, Gastmitglied

- **100+ Permissions** in 14 Kategorien:
  - members, roles, articles, events, flugbuch
  - images, documents, protocols, notifications
  - system, statistics, audit, security

### 2FA (Two-Factor Authentication)
- TOTP-Support (Authenticator Apps)
- Backup-Codes (10 Codes, einmalig verwendbar)
- Session-Management
- QR-Code-Generierung

### Sicherheit
- Account-Locking nach 5 fehlgeschlagenen Login-Versuchen
- Login-Tracking (IP, User-Agent, Timestamps)
- Refresh-Token-Management
- Audit-Logging für alle Aktionen

## Dateien

- **schema.sql** - Hauptschema (nur Table Definitions)
- **schema-clean.sql** - Backup (identisch mit schema.sql)
- **init-data.sql** - Initial-Daten (Roles & Permissions) - NOCH ZU ERSTELLEN

## Installation

Die Datenbank wird automatisch durch das install.sh-Script initialisiert:

```bash
# Schema laden
psql -U postgres -d fmsv_database -f schema.sql

# Initial-Daten laden (nach Erstellung)
# psql -U postgres -d fmsv_database -f init-data.sql
```

## TODO

- [ ] init-data.sql erstellen mit INSERT-Statements für Roles & Permissions
- [ ] Test-Daten für Entwicklung (optional)
