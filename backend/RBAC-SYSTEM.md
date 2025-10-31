# RBAC-System (Role-Based Access Control)

## Überblick

Die FMSV-Vereinshomepage verwendet ein modernes, granulares RBAC-System mit drei Schichten:

```
Benutzer → Rollen → Berechtigungen
```

## Architektur

### 1. Rollen (roles)
Rollen gruppieren Berechtigungen und definieren den Zugriffslevel eines Benutzers.

**Standard-Rollen:**
- `mitglied` (Priorität 10, 5MB Upload) - Basis-Mitglied
- `jugendwart` (Priorität 30, 20MB Upload) - Zuständig für Jugendarbeit
- `kassenwart` (Priorität 30, 20MB Upload) - Zuständig für Finanzen
- `vorstand` (Priorität 50, 50MB Upload) - Vorstandsmitglied
- `webmaster` (Priorität 100, 100MB Upload) - Vollzugriff

**Eigenschaften:**
- `name`: Interner Name (z.B. "mitglied")
- `display_name`: Anzeigename (z.B. "Mitglied")
- `upload_limit_mb`: Max. Upload-Größe in MB
- `priority`: Sortierung (höher = mehr Rechte)
- `color`: Farbe für UI-Darstellung
- `is_system_role`: System-Rollen können nicht gelöscht werden

### 2. Berechtigungen (permissions)
Granulare Berechtigungen für spezifische Aktionen.

**Kategorien:**
- `articles`: Artikel & Content
- `members`: Mitgliederverwaltung
- `flugbuch`: Flugbuch
- `events`: Termine & Events
- `images`: Bilder & Galerien
- `documents`: Dokumente & Protokolle
- `notifications`: Benachrichtigungen
- `system`: System & Administration

**Beispiel-Berechtigungen:**
```
articles.view              - Artikel ansehen
articles.create            - Artikel erstellen
articles.edit.own          - Eigene Artikel bearbeiten
articles.edit.all          - Alle Artikel bearbeiten
members.view               - Mitgliederliste ansehen
members.edit               - Mitglieder bearbeiten
system.roles.manage        - Rollen & Berechtigungen verwalten
```

### 3. Zuordnungen
- **user_roles**: N:M Beziehung Benutzer ↔ Rollen
- **role_permissions**: N:M Beziehung Rollen ↔ Berechtigungen

Ein Benutzer kann **mehrere Rollen** haben (z.B. Mitglied + Kassenwart)

## Backend-Verwendung

### Middleware

```javascript
import { authenticate, requirePermission, requireRole } from '../middleware/auth.js';

// Einfache Authentifizierung
router.get('/data', authenticate, (req, res) => {
  // req.user enthält: id, email, roles[], permissions[], maxUploadMb
});

// Spezifische Berechtigung erforderlich
router.post('/article', authenticate, requirePermission('articles.create'), (req, res) => {
  // Nur Benutzer mit "articles.create" Permission
});

// Eine von mehreren Berechtigungen erforderlich
router.put('/article/:id', authenticate, requireAnyPermission(['articles.edit.own', 'articles.edit.all']), (req, res) => {
  // Benutzer benötigt mindestens eine der Berechtigungen
});

// Spezifische Rolle erforderlich
router.get('/board-only', authenticate, requireRole('vorstand'), (req, res) => {
  // Nur Vorstandsmitglieder
});
```

### User-Objekt nach Authentifizierung

```javascript
req.user = {
  id: 'uuid',
  email: 'user@example.com',
  first_name: 'Max',
  last_name: 'Mustermann',
  is_admin: false,
  is_member: true,
  roles: [
    { id: 'uuid', name: 'mitglied', upload_limit_mb: 5, priority: 10 },
    { id: 'uuid', name: 'jugendwart', upload_limit_mb: 20, priority: 30 }
  ],
  permissions: [
    'articles.view',
    'members.view',
    'flugbuch.create',
    // ...
  ],
  maxUploadMb: 20  // Höchster Wert aus allen Rollen
}
```

## Frontend-Verwendung

### Context & Hooks

```typescript
import { usePermissions } from '../contexts/PermissionsContext';

function MyComponent() {
  const { hasPermission, hasAnyPermission, hasRole, maxUploadMb } = usePermissions();

  if (hasPermission('articles.create')) {
    // Zeige "Artikel erstellen" Button
  }

  if (hasRole('vorstand')) {
    // Zeige Vorstand-spezifische Funktionen
  }

  if (hasAnyPermission(['articles.edit.own', 'articles.edit.all'])) {
    // Zeige Bearbeitungs-Button
  }

  // Max. Upload-Größe basierend auf Rollen
  console.log(`Max Upload: ${maxUploadMb} MB`);
}
```

### Komponenten für bedingte Anzeige

```typescript
import { RequirePermission, RequireRole } from '../contexts/PermissionsContext';

<RequirePermission permission="articles.create">
  <Button>Artikel erstellen</Button>
</RequirePermission>

<RequireRole role="vorstand">
  <VorstandDashboard />
</RequireRole>

<RequireAnyPermission permissions={['articles.edit.own', 'articles.edit.all']}>
  <EditButton />
</RequireAnyPermission>
```

## API-Endpunkte

### Rollen verwalten
```
GET    /api/roles                    - Alle Rollen
GET    /api/roles/:id                - Einzelne Rolle mit Permissions
POST   /api/roles                    - Neue Rolle erstellen
PUT    /api/roles/:id                - Rolle bearbeiten
DELETE /api/roles/:id                - Rolle löschen
```

### Berechtigungen verwalten
```
GET    /api/roles/permissions/all    - Alle Berechtigungen
POST   /api/roles/permissions         - Neue Berechtigung
PUT    /api/roles/permissions/:id     - Berechtigung bearbeiten
DELETE /api/roles/permissions/:id     - Berechtigung löschen
```

### Benutzer-Rollen verwalten
```
GET    /api/roles/user/:userId                - Rollen eines Benutzers
POST   /api/roles/user/:userId/assign         - Rolle zuweisen
POST   /api/roles/user/:userId/remove         - Rolle entfernen
```

## Migration von altem System

Das System ist **vollständig abwärtskompatibel** mit dem alten `is_admin` / `is_member` System.

### Automatische Migration

Wenn ein Benutzer sich einloggt und noch keine RBAC-Rollen hat, wird automatisch migriert:
- `is_admin = true` → erhält Rolle "webmaster"
- `is_member = true` → erhält Rolle "mitglied"

### Manuelle Migration

Für bestehende Benutzer:

```bash
cd backend
node scripts/migrateToRBAC.js
```

Das Script:
1. Weist allen aktiven Mitgliedern die Rolle "mitglied" zu
2. Weist allen Admins die Rolle "webmaster" zu
3. Behält die alten `is_admin` / `is_member` Felder für Kompatibilität bei

## Admin-Oberfläche

### Zugriff
`/verwaltung` → Tab "Rollen & Berechtigungen"

**Erforderliche Berechtigung:** `system.roles.manage`

### Funktionen
- ✅ Rollen erstellen, bearbeiten, löschen
- ✅ Berechtigungen für Rollen zuweisen/entfernen
- ✅ Neue Berechtigungen erstellen
- ✅ Rollen zu Benutzern zuweisen
- ✅ Upload-Limits pro Rolle konfigurieren
- ✅ Prioritäten und Farben anpassen

## Best Practices

### 1. Granulare Berechtigungen verwenden
```javascript
// ✅ Gut - granular
requirePermission('articles.edit.own')

// ❌ Schlecht - zu grob
requireRole('vorstand')
```

### 2. Mehrere Rollen pro Benutzer
Statt viele Rollen mit überlappenden Rechten zu erstellen, lieber mehrere Rollen kombinieren:
```
Benutzer = mitglied + jugendwart + kassenwart
```

### 3. System-Rollen nicht löschen
Die 5 Standard-Rollen sind als `is_system_role = true` markiert und können nicht gelöscht werden.

### 4. Neue Berechtigungen dokumentieren
Beim Erstellen neuer Berechtigungen immer `description` ausfüllen!

## Sicherheit

- ✅ Alle API-Endpunkte sind durch Middleware geschützt
- ✅ Webmaster haben automatisch alle Berechtigungen (`is_admin = true`)
- ✅ System-Rollen und -Berechtigungen können nicht gelöscht werden
- ✅ Rollen mit zugewiesenen Benutzern können nicht gelöscht werden
- ✅ Audit-Log protokolliert alle Änderungen an Rollen und Berechtigungen

## Troubleshooting

### Benutzer kann nicht auf Verwaltungsbereich zugreifen
1. Prüfen ob RBAC-Migration durchgeführt wurde
2. Prüfen ob Benutzer die Rolle "webmaster" oder "vorstand" hat
3. Prüfen ob `is_admin = true` gesetzt ist (Legacy-Fallback)

### Neue Berechtigung wird nicht erkannt
1. Backend neustarten
2. Benutzer ausloggen und wieder einloggen (Token erneuern)

### Rolle hat keine Wirkung
1. Prüfen ob Rolle Berechtigungen zugewiesen hat
2. Prüfen ob Benutzer die Rolle zugewiesen hat
3. User-Objekt im Browser Console prüfen: `console.log(user)`

## Erweiterung

### Neue Berechtigung hinzufügen

1. **In der Datenbank:**
```sql
INSERT INTO permissions (name, display_name, description, category)
VALUES ('custom.action', 'Custom Action', 'Beschreibung', 'system');
```

2. **Oder über Admin-UI:**
`/verwaltung` → Rollen & Berechtigungen → Neue Berechtigung

3. **In der Backend-Route verwenden:**
```javascript
router.post('/custom', authenticate, requirePermission('custom.action'), handler);
```

### Neue Rolle hinzufügen

Über Admin-UI oder SQL:
```sql
INSERT INTO roles (name, display_name, description, upload_limit_mb, priority, color)
VALUES ('fluglehrer', 'Fluglehrer', 'Ausbildung', 30, 40, '#8B5CF6');
```

## Support

Bei Fragen zum RBAC-System:
1. Diese Dokumentation lesen
2. Audit-Log prüfen (`/verwaltung` → Dashboard → Audit-Log)
3. Backend-Logs prüfen: `tail -f Logs/backend.log`
