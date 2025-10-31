# RBAC Berechtigungen - Quick Reference

Schnelle Übersicht über die wichtigsten Berechtigungen und deren Verwendung.

## 🚀 Schnellstart

### Backend (Node.js)
```javascript
import { requirePermission, requireAnyPermission } from '../middleware/auth.js';

// Einzelne Berechtigung
router.get('/articles', authenticate, requirePermission('articles.view'), handler);

// Eine von mehreren Berechtigungen
router.put('/articles/:id', authenticate, 
  requireAnyPermission(['articles.edit.own', 'articles.edit.all']), 
  handler
);
```

### Frontend (React)
```tsx
import { usePermissions } from '../contexts/PermissionsContext';

// In Komponenten
const { hasPermission } = usePermissions();
{hasPermission('articles.create') && <CreateButton />}

// Oder als Component
<ProtectedComponent permission="articles.delete">
  <DeleteButton />
</ProtectedComponent>
```

---

## 📋 Berechtigungen nach Funktion

### Mitgliederliste ansehen
**Berechtigung:** `members.view`
- **Wo:** `/mitgliederbereich#mitglieder`
- **Wer:** Mitglied, Vorstand, Webmaster

### Mitgliederdetails bearbeiten
**Berechtigung:** `members.edit`
- **Wo:** `/verwaltung#mitglieder`
- **Wer:** Vorstand, Webmaster

### Artikel veröffentlichen
**Berechtigung:** `articles.publish`
- **Wo:** `/verwaltung#artikel`
- **Wer:** Vorstand, Webmaster

### Flugbuch exportieren
**Berechtigung:** `flugbuch.export`
- **Wo:** `/verwaltung#flugbuch`
- **Wer:** Vorstand, Webmaster

### Rollen verwalten
**Berechtigung:** `system.roles.manage`
- **Wo:** `/verwaltung#rollen`
- **Wer:** Webmaster

### Datenbank verwalten
**Berechtigung:** `system.database`
- **Wo:** `/verwaltung#database`
- **Wer:** Webmaster

---

## 🎯 Häufig verwendete Kombinationen

### Artikel-Verwaltung
```typescript
// Kann eigene Artikel bearbeiten ODER alle Artikel
hasAnyPermission(['articles.edit.own', 'articles.edit.all'])

// Kann erstellen UND veröffentlichen
hasAllPermissions(['articles.create', 'articles.publish'])
```

### Flugbuch-Verwaltung
```typescript
// Kann eigene Einträge bearbeiten ODER alle
hasAnyPermission(['flugbuch.edit.own', 'flugbuch.edit.all'])

// Vollständige Verwaltung
hasAllPermissions(['flugbuch.view', 'flugbuch.edit.all', 'flugbuch.delete'])
```

### Bilder-Verwaltung
```typescript
// Kann eigene löschen ODER alle
hasAnyPermission(['images.delete.own', 'images.delete.all'])

// Galerie-Verwaltung
hasPermission('images.galleries.manage')
```

---

## 🏷️ Kategorien Übersicht

| Kategorie | Präfix | Anzahl | Beschreibung |
|-----------|--------|--------|--------------|
| Artikel | `articles.*` | 12 | Content-Verwaltung |
| Mitglieder | `members.*` | 15 | Benutzerverwaltung |
| Flugbuch | `flugbuch.*` | 13 | Flugbetrieb |
| Termine | `events.*` | 10 | Veranstaltungen |
| Bilder | `images.*` | 11 | Medien |
| Dokumente | `documents.*` | 11 | Dateien & Protokolle |
| Benachrichtigungen | `notifications.*` | 9 | Messaging |
| System | `system.*` | 16 | Administration |
| Verein | `club.*` | 8 | Vereinsdaten |
| Finanzen | `finance.*` | 12 | Buchhaltung |
| Schulung | `training.*` | 12 | Ausbildung |
| Inventar | `inventory.*` | 10 | Ausrüstung |
| Statistiken | `statistics.*` | 6 | Auswertungen |
| Kiosk | `kiosk.*` | 7 | Flugplatz-Terminal |

---

## 👥 Standard-Rollen

### Mitglied
```
✓ Basis-Berechtigungen für alle Funktionen
✓ Eigene Einträge bearbeiten
✗ Keine Administrationsrechte
```
**Upload-Limit:** 5 MB

### Vorstand
```
✓ Alle Mitglieder-Rechte
✓ Erweiterte Verwaltung
✓ Veröffentlichen & Moderieren
✗ Keine Systemrechte
```
**Upload-Limit:** 30 MB

### Webmaster
```
✓ Alle Vorstand-Rechte
✓ Systemverwaltung
✓ Datenbank-Zugriff
✓ Rollen-Management
```
**Upload-Limit:** 50 MB

### Kassenwart
```
✓ Alle Mitglieder-Rechte
✓ Vollständige Finanzverwaltung
✓ Mitglieder-Details ansehen
```
**Upload-Limit:** 10 MB

### Fluglehrer
```
✓ Alle Mitglieder-Rechte
✓ Schulungsverwaltung
✓ Alle Flugbucheinträge bearbeiten
```
**Upload-Limit:** 10 MB

---

## 🔒 Scope-Konzept

| Scope | Bedeutung | Beispiel |
|-------|-----------|----------|
| `.view` | Ansehen | `articles.view` |
| `.create` | Erstellen | `articles.create` |
| `.edit.own` | Eigene bearbeiten | `articles.edit.own` |
| `.edit.all` | Alle bearbeiten | `articles.edit.all` |
| `.delete` | Löschen | `articles.delete` |
| `.manage` | Verwalten | `images.galleries.manage` |

---

## 🛠️ Entwickler-Tools

### TypeScript Integration
```typescript
import { Permission, hasPermission } from '../types/permissions';

// Type-safe Permission checking
const permission: Permission = 'articles.create';
if (hasPermission(user, permission)) {
  // ...
}
```

### Neue Berechtigung hinzufügen

#### 1. Datenbank (SQL)
```sql
INSERT INTO permissions (name, display_name, description, category) VALUES
('neue.berechtigung', 'Neuer Name', 'Beschreibung', 'kategorie');
```

#### 2. TypeScript Typ aktualisieren
```typescript
// In /types/permissions.ts
export type ExtendedPermission =
  // ...
  | 'neue.berechtigung';
```

#### 3. Backend Route schützen
```javascript
router.get('/neue-route', authenticate, 
  requirePermission('neue.berechtigung'), 
  handler
);
```

#### 4. Frontend verwenden
```tsx
{hasPermission('neue.berechtigung') && <NeueKomponente />}
```

---

## 📊 Statistiken

- **Gesamt:** 140+ Berechtigungen
- **Kern-System:** 40 Berechtigungen
- **Erweitert:** 100+ Berechtigungen
- **Kategorien:** 14
- **Standard-Rollen:** 6

---

## ⚡ Performance-Tipps

### Backend
- Berechtigungen werden beim Login geladen (JWT)
- Keine zusätzlichen DB-Queries pro Request
- Caching über JWT-Token

### Frontend
- `usePermissions` Hook cached Berechtigungen
- Keine API-Calls für Permission-Checks
- Berechtigungen im Context verfügbar

---

## 🚨 Wichtige Hinweise

### Legacy-Kompatibilität
```javascript
// is_admin = true → Hat ALLE Berechtigungen
if (user.is_admin) {
  return true; // Immer erlaubt
}
```

### Auto-Migration
```javascript
// Benutzer ohne Rollen werden automatisch migriert
is_admin = true  → 'webmaster' Rolle
is_member = true → 'mitglied' Rolle
```

### Audit-Logging
```javascript
// Alle Berechtigungsfehler werden geloggt
{
  action: 'UNAUTHORIZED_ACCESS',
  requiredPermission: 'articles.delete',
  userId: '...',
  timestamp: '...'
}
```

---

## 📚 Weitere Ressourcen

- **Vollständige Referenz:** `/Installation/PERMISSIONS-REFERENCE.md`
- **Zusätzliche Berechtigungen:** `/backend/database/additional-permissions.sql`
- **TypeScript Typen:** `/types/permissions.ts`
- **RBAC Dokumentation:** `/backend/RBAC-SYSTEM.md`
- **Setup Guide:** `/Installation/RBAC-SETUP.md`

---

## 🆘 Hilfe & Support

### Berechtigungsprobleme debuggen
```bash
# PostgreSQL Query
SELECT u.email, r.name, p.name as permission
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
WHERE u.email = 'user@example.com';
```

### Common Issues

**Problem:** Benutzer hat keine Berechtigungen
```sql
-- Prüfe Rollenzuweisung
SELECT * FROM user_roles WHERE user_id = 'USER_ID';

-- Prüfe Berechtigungen der Rolle
SELECT p.* FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
WHERE rp.role_id = 'ROLE_ID';
```

**Problem:** Neue Berechtigung wird nicht erkannt
- Backend neu starten
- Benutzer neu anmelden (JWT aktualisieren)
- Browser-Cache leeren

---

**Letzte Aktualisierung:** 2025-10-31  
**Version:** 1.0.0
