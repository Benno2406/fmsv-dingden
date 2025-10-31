# RBAC-System Setup

## Schnellstart

Das RBAC (Role-Based Access Control) System ist vollständig in die Vereinshomepage integriert und bietet granulare Berechtigungsverwaltung.

## 1. Datenbank-Schema erstellen

Falls noch nicht geschehen, Schema mit RBAC-Tabellen erstellen:

```bash
cd backend
psql -U $DB_USER -d $DB_NAME -f database/schema.sql
```

Das erstellt automatisch:
- ✅ 5 Standard-Rollen (mitglied, jugendwart, kassenwart, vorstand, webmaster)
- ✅ Über 30 Standard-Berechtigungen in 8 Kategorien
- ✅ Vorkonfigurierte Berechtigungszuordnungen

## 2. Bestehende Benutzer migrieren

Weise allen bestehenden Benutzern automatisch Rollen zu:

```bash
cd backend
node scripts/migrateToRBAC.js
```

**Was passiert:**
- Alle Benutzer mit `is_admin = true` erhalten die Rolle "webmaster"
- Alle Benutzer mit `is_member = true` erhalten die Rolle "mitglied"
- Die alten Felder bleiben zur Kompatibilität erhalten

**Ausgabe:**
```
🔄 Starting RBAC migration...
Found 15 active users to migrate
✅ Migrated user admin@fmsv.de - Assigned roles: 1
✅ Migrated user user@fmsv.de - Assigned roles: 1
...
✅ RBAC migration completed!
   Migrated: 15 users
   Skipped: 0 users
```

## 3. Admin-Oberfläche nutzen

### Zugriff
1. Als Webmaster oder Admin einloggen
2. Navigiere zu `/verwaltung`
3. In der Sidebar erscheint jetzt "Rollen & Berechtigungen" (wenn du die Berechtigung `system.roles.manage` hast)

Oder direkt: `/verwaltung#rollen`

### Funktionen

#### Rollen verwalten
- **Neue Rolle erstellen**: Button "Neue Rolle" oben rechts
- **Rolle bearbeiten**: Stift-Symbol in der Tabelle
- **Rolle löschen**: Papierkorb-Symbol (nur für Custom-Rollen)

#### Berechtigungen zuweisen
1. Rolle bearbeiten
2. Tab "Berechtigungen" öffnen
3. Checkboxen aktivieren/deaktivieren
4. Speichern

#### Benutzer-Rollen zuweisen
**Über Mitgliederverwaltung:**
1. `/verwaltung` → Mitglieder
2. Mitglied bearbeiten
3. Sektion "Rollen & Berechtigungen"
4. Rolle hinzufügen/entfernen

## 4. System-Rollen

### Mitglied (mitglied)
- **Upload-Limit:** 5 MB
- **Zugriff:** Mitgliederbereich
- **Berechtigungen:**
  - Artikel ansehen
  - Flugbuch führen
  - Bilder hochladen
  - Dokumente ansehen
  - Mitgliederliste ansehen

### Jugendwart (jugendwart)
- **Upload-Limit:** 20 MB
- **Erweiterte Rechte für:**
  - Veranstaltungen erstellen
  - Galerien verwalten
  - Erweiterte Mitglieder-Details

### Kassenwart (kassenwart)
- **Upload-Limit:** 20 MB
- **Erweiterte Rechte für:**
  - Protokolle erstellen/bearbeiten
  - Finanz-Dokumente verwalten
  - Mitglieder-Details ansehen

### Vorstand (vorstand)
- **Upload-Limit:** 50 MB
- **Zugriff:** Verwaltungsbereich
- **Berechtigungen:**
  - Alle Mitglieder-Rechte
  - Artikel erstellen und veröffentlichen
  - Mitgliederverwaltung
  - Flugbuch komplett verwalten
  - Termine verwalten
  - Benachrichtigungen senden
  - Audit-Log ansehen

### Webmaster (webmaster)
- **Upload-Limit:** 100 MB
- **Zugriff:** Voller System-Zugriff
- **Berechtigungen:** ALLE
- **Zusätzlich:**
  - Datenbankzugriff
  - Rollen & Berechtigungen verwalten
  - Systemeinstellungen

## 5. Custom Rollen erstellen

### Beispiel: Fluglehrer-Rolle

1. **In Admin-UI:**
   - `/verwaltung` → Rollen & Berechtigungen
   - "Neue Rolle" klicken

2. **Allgemein:**
   ```
   Interner Name:    fluglehrer
   Anzeigename:      Fluglehrer
   Beschreibung:     Verantwortlich für Ausbildung
   Upload-Limit:     30 MB
   Priorität:        40
   Farbe:           #10B981 (grün)
   ```

3. **Berechtigungen:**
   - Alle Mitglieder-Berechtigungen
   - `flugbuch.edit.all` - Alle Flugbuch-Einträge bearbeiten
   - `members.view.details` - Mitglieder-Details ansehen
   - `events.create` - Schulungs-Termine erstellen
   - `documents.upload` - Schulungs-Dokumente hochladen

4. **Speichern**

5. **Zuweisen:**
   - `/verwaltung` → Mitglieder
   - Fluglehrer auswählen
   - Rolle "Fluglehrer" hinzufügen

## 6. Berechtigungen im Code verwenden

### Backend (Node.js)

```javascript
import { authenticate, requirePermission } from '../middleware/auth.js';

// Einzelne Berechtigung
router.post('/article', 
  authenticate, 
  requirePermission('articles.create'), 
  createArticle
);

// Eine von mehreren
router.put('/article/:id',
  authenticate,
  requireAnyPermission(['articles.edit.own', 'articles.edit.all']),
  updateArticle
);

// Spezifische Rolle
router.get('/board-meeting',
  authenticate,
  requireRole('vorstand'),
  getBoardMeeting
);
```

### Frontend (React/TypeScript)

```typescript
import { usePermissions, RequirePermission } from '../contexts/PermissionsContext';

function ArticleActions() {
  const { hasPermission } = usePermissions();

  return (
    <>
      {hasPermission('articles.create') && (
        <Button>Artikel erstellen</Button>
      )}
      
      <RequirePermission permission="articles.publish">
        <Button>Veröffentlichen</Button>
      </RequirePermission>
    </>
  );
}
```

## 7. Berechtigungen-Übersicht

### Artikel & Content (articles)
- `articles.view` - Interne Artikel ansehen
- `articles.create` - Artikel erstellen
- `articles.edit.own` - Eigene Artikel bearbeiten
- `articles.edit.all` - Alle Artikel bearbeiten
- `articles.delete` - Artikel löschen
- `articles.publish` - Artikel veröffentlichen

### Mitgliederverwaltung (members)
- `members.view` - Mitgliederliste ansehen
- `members.view.details` - Mitglieder-Details ansehen
- `members.edit` - Mitgliederdaten bearbeiten
- `members.delete` - Mitglieder löschen
- `members.roles.manage` - Rollen zuweisen

### Flugbuch (flugbuch)
- `flugbuch.view` - Einträge ansehen
- `flugbuch.create` - Einträge erstellen
- `flugbuch.edit.own` - Eigene Einträge bearbeiten
- `flugbuch.edit.all` - Alle Einträge bearbeiten
- `flugbuch.delete` - Einträge löschen
- `flugbuch.export` - Flugbuch exportieren

### Termine & Events (events)
- `events.view` - Interne Termine ansehen
- `events.create` - Termine erstellen
- `events.edit` - Termine bearbeiten
- `events.delete` - Termine löschen

### Bilder & Galerien (images)
- `images.view` - Interne Bilder ansehen
- `images.upload` - Bilder hochladen
- `images.delete.own` - Eigene Bilder löschen
- `images.delete.all` - Alle Bilder löschen
- `images.galleries.manage` - Galerien verwalten

### Dokumente (documents)
- `documents.view` - Interne Dokumente ansehen
- `documents.upload` - Dokumente hochladen
- `documents.delete` - Dokumente löschen
- `protocols.view` - Protokolle ansehen
- `protocols.create` - Protokolle erstellen
- `protocols.edit` - Protokolle bearbeiten

### Benachrichtigungen (notifications)
- `notifications.send.own` - An einzelne Mitglieder
- `notifications.send.all` - An alle Mitglieder

### System & Administration (system)
- `system.settings` - Systemeinstellungen ändern
- `system.database` - Datenbankzugriff
- `system.audit.view` - Audit-Logs ansehen
- `system.roles.manage` - Rollen & Berechtigungen verwalten

## 8. Troubleshooting

### User kann sich nicht einloggen
```bash
# Prüfen ob Benutzer Rollen hat
psql -U $DB_USER -d $DB_NAME -c "
  SELECT u.email, r.name 
  FROM users u 
  LEFT JOIN user_roles ur ON u.id = ur.user_id
  LEFT JOIN roles r ON ur.role_id = r.id
  WHERE u.email = 'user@example.com';
"
```

### Verwaltungsbereich nicht zugänglich
Prüfen ob User Admin ist ODER Rolle "webmaster" oder "vorstand" hat:
```sql
SELECT email, is_admin, 
  (SELECT array_agg(r.name) FROM roles r 
   INNER JOIN user_roles ur ON r.id = ur.role_id 
   WHERE ur.user_id = users.id) as roles
FROM users 
WHERE email = 'user@example.com';
```

### Migration erneut ausführen
```bash
# Alle User-Rollen löschen und neu zuweisen
cd backend
node scripts/migrateToRBAC.js
```

### Rollen-Statistik anzeigen
```sql
SELECT 
  r.display_name,
  COUNT(ur.user_id) as user_count,
  COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN user_roles ur ON r.id = ur.role_id
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.display_name
ORDER BY user_count DESC;
```

## 9. Backup vor Änderungen

**Wichtig:** Vor größeren Änderungen am RBAC-System immer Backup erstellen!

```bash
# Nur RBAC-Tabellen
pg_dump -U $DB_USER -d $DB_NAME \
  -t roles -t permissions -t role_permissions -t user_roles \
  > rbac_backup_$(date +%Y%m%d_%H%M%S).sql

# Komplettes Datenbank-Backup
pg_dump -U $DB_USER -d $DB_NAME \
  > full_backup_$(date +%Y%m%d_%H%M%S).sql
```

## Weitere Informationen

- Technische Details: `/backend/RBAC-SYSTEM.md`
- API-Dokumentation: `/backend/API-Dokumentation.md`
- Admin-Oberfläche: `/verwaltung#rollen`
