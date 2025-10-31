# RBAC Berechtigungen - Vollständige Referenz

Diese Datei enthält alle verfügbaren Berechtigungen im FMSV Dingden Vereinsverwaltungssystem.

## Übersicht

Das System verwendet ein granulares, kategoriebasiertes Berechtigungssystem (RBAC - Role-Based Access Control). Jede Berechtigung folgt dem Schema `kategorie.aktion[.scope]`.

---

## Berechtigungskategorien

### 1. Artikel & Content (`articles`)
Verwaltung von Presseberichten, News und Content.

| Berechtigung | Anzeigename | Beschreibung | Empfohlene Rollen |
|--------------|-------------|--------------|-------------------|
| `articles.view` | Artikel ansehen | Kann interne Artikel ansehen | Mitglied, Vorstand, Webmaster |
| `articles.create` | Artikel erstellen | Kann neue Artikel erstellen | Vorstand, Webmaster |
| `articles.edit.own` | Eigene Artikel bearbeiten | Kann eigene Artikel bearbeiten | Vorstand, Webmaster |
| `articles.edit.all` | Alle Artikel bearbeiten | Kann alle Artikel bearbeiten | Webmaster |
| `articles.delete` | Artikel löschen | Kann Artikel löschen | Webmaster |
| `articles.publish` | Artikel veröffentlichen | Kann Artikel veröffentlichen | Vorstand, Webmaster |

**Verwendung im System:**
- `/mitgliederbereich#presseartikel` - Artikel ansehen (articles.view)
- `/verwaltung#artikel` - Artikel verwalten (articles.create, articles.edit.all, articles.publish)
- Artikel-Editor - Bearbeiten (articles.edit.own oder articles.edit.all)
- Veröffentlichen-Button - Freigabe (articles.publish)

---

### 2. Mitgliederverwaltung (`members`)
Verwaltung von Mitgliederdaten und Benutzerkonten.

| Berechtigung | Anzeigename | Beschreibung | Empfohlene Rollen |
|--------------|-------------|--------------|-------------------|
| `members.view` | Mitglieder ansehen | Kann Mitgliederliste ansehen | Mitglied, Vorstand, Webmaster |
| `members.view.details` | Mitgliederdetails ansehen | Kann Details aller Mitglieder ansehen | Vorstand, Webmaster |
| `members.edit` | Mitglieder bearbeiten | Kann Mitgliederdaten bearbeiten | Vorstand, Webmaster |
| `members.delete` | Mitglieder löschen | Kann Mitglieder löschen | Webmaster |
| `members.roles.manage` | Rollen verwalten | Kann Rollen von Mitgliedern verwalten | Webmaster |

**Verwendung im System:**
- `/mitgliederbereich#mitglieder` - Mitgliederliste (members.view)
- `/verwaltung#mitglieder` - Vollständige Verwaltung (members.view.details, members.edit, members.delete)
- Mitglieder-Editor - Detailansicht (members.view.details)
- Rollen-Zuweisung - Dialog (members.roles.manage)

**Zusätzliche empfohlene Berechtigungen:**
- `members.create` - Neue Mitglieder anlegen (Registrierung über Admin)
- `members.export` - Mitgliederliste exportieren (CSV/Excel)
- `members.import` - Mitglieder importieren (Bulk-Import)
- `members.view.contact` - Kontaktdaten ansehen (E-Mail, Telefon)
- `members.statistics` - Mitgliederstatistiken ansehen
- `members.certificates.view` - Kenntnisnachweise ansehen
- `members.certificates.edit` - Kenntnisnachweise bearbeiten

---

### 3. Flugbuch (`flugbuch`)
Verwaltung von Flugbucheinträgen und Flugbetrieb.

| Berechtigung | Anzeigename | Beschreibung | Empfohlene Rollen |
|--------------|-------------|--------------|-------------------|
| `flugbuch.view` | Flugbuch ansehen | Kann Flugbucheinträge ansehen | Mitglied, Vorstand, Webmaster |
| `flugbuch.create` | Flugbuch erstellen | Kann Flugbucheinträge erstellen | Mitglied, Vorstand, Webmaster |
| `flugbuch.edit.own` | Eigene Einträge bearbeiten | Kann eigene Flugbucheinträge bearbeiten | Mitglied, Vorstand, Webmaster |
| `flugbuch.edit.all` | Alle Einträge bearbeiten | Kann alle Flugbucheinträge bearbeiten | Vorstand, Webmaster |
| `flugbuch.delete` | Einträge löschen | Kann Flugbucheinträge löschen | Vorstand, Webmaster |
| `flugbuch.export` | Flugbuch exportieren | Kann Flugbuch exportieren | Vorstand, Webmaster |

**Verwendung im System:**
- `/mitgliederbereich#flugbuch` - Flugbuch ansehen (flugbuch.view)
- `/verwaltung#flugbuch` - Vollständige Verwaltung (flugbuch.edit.all, flugbuch.delete)
- Flugbuch-Eintrag Dialog - Erstellen (flugbuch.create)
- Export-Buttons - CSV/PDF Export (flugbuch.export)

**Zusätzliche empfohlene Berechtigungen:**
- `flugbuch.statistics` - Statistiken ansehen (Flugstunden, Top-Piloten)
- `flugbuch.approve` - Einträge bestätigen/genehmigen
- `flugbuch.incidents.view` - Vorfälle ansehen
- `flugbuch.incidents.create` - Vorfälle melden
- `flugbuch.incidents.edit` - Vorfälle bearbeiten

---

### 4. Termine & Events (`events`)
Verwaltung von Veranstaltungen und Terminen.

| Berechtigung | Anzeigename | Beschreibung | Empfohlene Rollen |
|--------------|-------------|--------------|-------------------|
| `events.view` | Termine ansehen | Kann interne Termine ansehen | Mitglied, Vorstand, Webmaster |
| `events.create` | Termine erstellen | Kann neue Termine erstellen | Vorstand, Webmaster |
| `events.edit` | Termine bearbeiten | Kann Termine bearbeiten | Vorstand, Webmaster |
| `events.delete` | Termine löschen | Kann Termine löschen | Vorstand, Webmaster |

**Verwendung im System:**
- `/termine` - Öffentliche Termine ansehen (keine Berechtigung nötig)
- `/mitgliederbereich` - Interne Termine (events.view)
- `/verwaltung#termine` - Verwaltung (events.create, events.edit, events.delete)

**Zusätzliche empfohlene Berechtigungen:**
- `events.publish` - Termine öffentlich machen
- `events.participants.view` - Teilnehmerliste ansehen
- `events.participants.manage` - Teilnehmer verwalten
- `events.register` - Für Termine anmelden
- `events.export` - Termine exportieren (iCal)

---

### 5. Bilder & Galerien (`images`)
Verwaltung von Bildern und Fotogalerien.

| Berechtigung | Anzeigename | Beschreibung | Empfohlene Rollen |
|--------------|-------------|--------------|-------------------|
| `images.view` | Bilder ansehen | Kann interne Bilder ansehen | Mitglied, Vorstand, Webmaster |
| `images.upload` | Bilder hochladen | Kann Bilder hochladen | Mitglied, Vorstand, Webmaster |
| `images.delete.own` | Eigene Bilder löschen | Kann eigene Bilder löschen | Mitglied, Vorstand, Webmaster |
| `images.delete.all` | Alle Bilder löschen | Kann alle Bilder löschen | Vorstand, Webmaster |
| `images.galleries.manage` | Galerien verwalten | Kann Galerien erstellen und verwalten | Vorstand, Webmaster |

**Verwendung im System:**
- `/fotoalben` - Öffentliche Galerien (keine Berechtigung nötig)
- `/mitgliederbereich#fotoalben` - Interne Galerien (images.view)
- `/verwaltung#bilder` - Bildverwaltung (images.delete.all, images.galleries.manage)
- Upload-Dialog - Bilder hochladen (images.upload)

**Zusätzliche empfohlene Berechtigungen:**
- `images.edit` - Bilder bearbeiten (Rotation, Zuschnitt)
- `images.moderate` - Bilder moderieren (vor Veröffentlichung)
- `images.download.bulk` - Massendownload
- `images.watermark` - Wasserzeichen hinzufügen

---

### 6. Dokumente & Protokolle (`documents`)
Verwaltung von Dokumenten und Vereinsprotokollen.

| Berechtigung | Anzeigename | Beschreibung | Empfohlene Rollen |
|--------------|-------------|--------------|-------------------|
| `documents.view` | Dokumente ansehen | Kann interne Dokumente ansehen | Mitglied, Vorstand, Webmaster |
| `documents.upload` | Dokumente hochladen | Kann Dokumente hochladen | Vorstand, Webmaster |
| `documents.delete` | Dokumente löschen | Kann Dokumente löschen | Vorstand, Webmaster |
| `protocols.view` | Protokolle ansehen | Kann Protokolle ansehen | Mitglied, Vorstand, Webmaster |
| `protocols.create` | Protokolle erstellen | Kann Protokolle erstellen | Vorstand, Webmaster |
| `protocols.edit` | Protokolle bearbeiten | Kann Protokolle bearbeiten | Vorstand, Webmaster |

**Verwendung im System:**
- `/mitgliederbereich#dokumente` - Dokumente ansehen (documents.view, protocols.view)
- `/verwaltung#dokumente` - Verwaltung (documents.upload, documents.delete, protocols.create)
- Protokoll-Editor - Protokolle erstellen (protocols.create, protocols.edit)

**Zusätzliche empfohlene Berechtigungen:**
- `documents.edit` - Dokumente bearbeiten/ersetzen
- `documents.categories.manage` - Dokumentkategorien verwalten
- `documents.archive` - Dokumente archivieren
- `protocols.approve` - Protokolle genehmigen
- `protocols.publish` - Protokolle veröffentlichen
- `documents.versions.view` - Dokumentversionen ansehen

---

### 7. Benachrichtigungen (`notifications`)
Senden von Benachrichtigungen an Mitglieder.

| Berechtigung | Anzeigename | Beschreibung | Empfohlene Rollen |
|--------------|-------------|--------------|-------------------|
| `notifications.send.own` | Benachrichtigungen senden | Kann Benachrichtigungen an einzelne Mitglieder senden | Vorstand, Webmaster |
| `notifications.send.all` | Massenbenachrichtigungen | Kann Benachrichtigungen an alle Mitglieder senden | Vorstand, Webmaster |

**Verwendung im System:**
- `/verwaltung#benachrichtigungen` - Benachrichtigungen verwalten
- Benachrichtigungs-Dialog - Senden (notifications.send.own, notifications.send.all)

**Zusätzliche empfohlene Berechtigungen:**
- `notifications.templates.manage` - Vorlagen verwalten
- `notifications.scheduled.create` - Geplante Benachrichtigungen erstellen
- `notifications.scheduled.delete` - Geplante Benachrichtigungen löschen
- `notifications.history.view` - Benachrichtigungsverlauf ansehen
- `notifications.send.groups` - An Gruppen senden
- `notifications.send.roles` - An bestimmte Rollen senden

---

### 8. System & Administration (`system`)
Systemweite Einstellungen und administrative Funktionen.

| Berechtigung | Anzeigename | Beschreibung | Empfohlene Rollen |
|--------------|-------------|--------------|-------------------|
| `system.settings` | Systemeinstellungen | Kann Systemeinstellungen ändern | Webmaster |
| `system.database` | Datenbankzugriff | Kann auf die Datenbankverwaltung zugreifen | Webmaster |
| `system.audit.view` | Audit-Log ansehen | Kann Audit-Logs ansehen | Webmaster |
| `system.roles.manage` | Rollen verwalten | Kann Rollen und Berechtigungen verwalten | Webmaster |

**Verwendung im System:**
- `/verwaltung#einstellungen` - Systemeinstellungen (system.settings)
- `/verwaltung#database` - Datenbankverwaltung (system.database)
- `/verwaltung#rollen` - RBAC-System (system.roles.manage)
- Audit-Log-Ansicht - Protokollierung (system.audit.view)

**Zusätzliche empfohlene Berechtigungen:**
- `system.backup.create` - Backups erstellen
- `system.backup.restore` - Backups wiederherstellen
- `system.backup.download` - Backups herunterladen
- `system.logs.view` - Systemlogs ansehen
- `system.logs.delete` - Systemlogs löschen
- `system.maintenance.enable` - Wartungsmodus aktivieren
- `system.cache.clear` - Cache leeren
- `system.updates.install` - Updates installieren
- `system.users.impersonate` - Als anderer Benutzer anmelden
- `system.email.settings` - E-Mail-Einstellungen verwalten
- `system.security.settings` - Sicherheitseinstellungen verwalten

---

## Empfohlene zusätzliche Kategorien

### 9. Vereinsverwaltung (`club`)
Allgemeine Vereinsverwaltung.

| Berechtigung | Anzeigename | Beschreibung |
|--------------|-------------|--------------|
| `club.info.view` | Vereinsinfos ansehen | Kann Vereinsinformationen ansehen |
| `club.info.edit` | Vereinsinfos bearbeiten | Kann Vereinsinformationen bearbeiten |
| `club.departments.view` | Sparten ansehen | Kann Sparten ansehen |
| `club.departments.manage` | Sparten verwalten | Kann Sparten erstellen und verwalten |
| `club.board.view` | Vorstand ansehen | Kann Vorstandsinformationen ansehen |
| `club.board.edit` | Vorstand bearbeiten | Kann Vorstandsdaten bearbeiten |

---

### 10. Finanzen (`finance`)
Finanzielle Verwaltung (für zukünftige Implementierung).

| Berechtigung | Anzeigename | Beschreibung |
|--------------|-------------|--------------|
| `finance.view` | Finanzen ansehen | Kann Finanzdaten ansehen |
| `finance.transactions.create` | Transaktionen erstellen | Kann Transaktionen erstellen |
| `finance.transactions.edit` | Transaktionen bearbeiten | Kann Transaktionen bearbeiten |
| `finance.transactions.delete` | Transaktionen löschen | Kann Transaktionen löschen |
| `finance.reports.view` | Berichte ansehen | Kann Finanzberichte ansehen |
| `finance.reports.create` | Berichte erstellen | Kann Finanzberichte erstellen |
| `finance.budget.view` | Budget ansehen | Kann Budget ansehen |
| `finance.budget.edit` | Budget bearbeiten | Kann Budget bearbeiten |
| `finance.invoices.create` | Rechnungen erstellen | Kann Rechnungen erstellen |
| `finance.invoices.send` | Rechnungen versenden | Kann Rechnungen versenden |

---

### 11. Schulung & Training (`training`)
Schulungsverwaltung und Fluglehrer.

| Berechtigung | Anzeigename | Beschreibung |
|--------------|-------------|--------------|
| `training.view` | Schulungen ansehen | Kann Schulungen ansehen |
| `training.create` | Schulungen erstellen | Kann Schulungen erstellen |
| `training.edit` | Schulungen bearbeiten | Kann Schulungen bearbeiten |
| `training.participants.view` | Teilnehmer ansehen | Kann Teilnehmer ansehen |
| `training.participants.manage` | Teilnehmer verwalten | Kann Teilnehmer verwalten |
| `training.certificates.issue` | Zertifikate ausstellen | Kann Zertifikate ausstellen |
| `training.progress.view` | Fortschritt ansehen | Kann Trainingsfortschritt ansehen |
| `training.progress.edit` | Fortschritt bearbeiten | Kann Trainingsfortschritt bearbeiten |

---

### 12. Inventar & Ausrüstung (`inventory`)
Verwaltung von Vereinsinventar und Ausrüstung.

| Berechtigung | Anzeigename | Beschreibung |
|--------------|-------------|--------------|
| `inventory.view` | Inventar ansehen | Kann Inventar ansehen |
| `inventory.add` | Inventar hinzufügen | Kann Inventar hinzufügen |
| `inventory.edit` | Inventar bearbeiten | Kann Inventar bearbeiten |
| `inventory.delete` | Inventar löschen | Kann Inventar löschen |
| `inventory.borrow` | Ausleihen | Kann Ausrüstung ausleihen |
| `inventory.lend.manage` | Ausleihen verwalten | Kann Ausleihvorgänge verwalten |
| `inventory.maintenance.view` | Wartung ansehen | Kann Wartungspläne ansehen |
| `inventory.maintenance.create` | Wartung erstellen | Kann Wartungseinträge erstellen |

---

### 13. Statistiken & Berichte (`statistics`)
Auswertungen und Statistiken.

| Berechtigung | Anzeigename | Beschreibung |
|--------------|-------------|--------------|
| `statistics.view` | Statistiken ansehen | Kann Statistiken ansehen |
| `statistics.advanced` | Erweiterte Statistiken | Kann erweiterte Statistiken ansehen |
| `statistics.export` | Statistiken exportieren | Kann Statistiken exportieren |
| `reports.create` | Berichte erstellen | Kann benutzerdefinierte Berichte erstellen |
| `reports.schedule` | Berichte planen | Kann automatische Berichte planen |

---

### 14. Kiosk-Modus (`kiosk`)
Spezielle Berechtigungen für Flugplatz-Kiosk.

| Berechtigung | Anzeigename | Beschreibung |
|--------------|-------------|--------------|
| `kiosk.access` | Kiosk-Zugriff | Kann Kiosk-Modus nutzen |
| `kiosk.flugbuch.start` | Flüge starten | Kann Flüge im Kiosk starten |
| `kiosk.flugbuch.end` | Flüge beenden | Kann Flüge im Kiosk beenden |
| `kiosk.weather.view` | Wetter ansehen | Kann Wetterinfos ansehen |
| `kiosk.manage` | Kiosk verwalten | Kann Kiosk-Einstellungen verwalten |

---

## Scope-Konzept

Viele Berechtigungen verwenden ein Scope-Konzept:
- `.own` - Nur eigene Einträge (z.B. `articles.edit.own`)
- `.all` - Alle Einträge (z.B. `articles.edit.all`)

**Best Practice:** Verwende `.own` für normale Benutzer und `.all` für Administratoren.

---

## Standardrollen und ihre Berechtigungen

### Mitglied (Standard)
Grundlegende Berechtigungen für alle Vereinsmitglieder:
- `articles.view`
- `members.view`
- `flugbuch.view`, `flugbuch.create`, `flugbuch.edit.own`
- `events.view`
- `images.view`, `images.upload`, `images.delete.own`
- `documents.view`
- `protocols.view`

### Vorstand
Erweiterte Berechtigungen für Vorstandsmitglieder (inkl. aller Mitglieder-Rechte):
- `articles.create`, `articles.edit.own`, `articles.publish`
- `members.view.details`, `members.edit`
- `flugbuch.edit.all`, `flugbuch.delete`, `flugbuch.export`
- `events.create`, `events.edit`, `events.delete`
- `images.delete.all`, `images.galleries.manage`
- `documents.upload`, `documents.delete`
- `protocols.create`, `protocols.edit`
- `notifications.send.own`, `notifications.send.all`

### Webmaster
Vollständige Systemrechte (inkl. aller Vorstand-Rechte):
- `articles.edit.all`, `articles.delete`
- `members.delete`, `members.roles.manage`
- `system.settings`, `system.database`, `system.audit.view`, `system.roles.manage`

### Kassenwart
Spezielle Rolle für Finanzverwaltung:
- Alle Mitglieder-Rechte
- `finance.*` (alle Finanzberechtigungen - sobald implementiert)
- `members.view.details` (für Beitragsverwaltung)

### Fluglehrer
Spezielle Rolle für Schulung:
- Alle Mitglieder-Rechte
- `training.*` (alle Schulungsberechtigungen)
- `flugbuch.edit.all` (für Schülereinträge)

---

## Berechtigungsprüfung im Code

### Backend (Node.js)
```javascript
// Einzelne Berechtigung prüfen
import { requirePermission } from '../middleware/auth.js';
router.get('/articles', authenticate, requirePermission('articles.view'), async (req, res) => {
  // ...
});

// Mehrere Berechtigungen (EINE muss vorhanden sein)
import { requireAnyPermission } from '../middleware/auth.js';
router.put('/articles/:id', authenticate, 
  requireAnyPermission(['articles.edit.own', 'articles.edit.all']), 
  async (req, res) => {
    // ...
  }
);
```

### Frontend (React)
```tsx
// Hook verwenden
import { usePermissions } from '../contexts/PermissionsContext';

function MyComponent() {
  const { hasPermission } = usePermissions();
  
  return (
    <>
      {hasPermission('articles.create') && (
        <Button>Artikel erstellen</Button>
      )}
    </>
  );
}

// Component verwenden
import { ProtectedComponent } from '../contexts/PermissionsContext';

<ProtectedComponent 
  permission="articles.delete"
  fallback={<p>Keine Berechtigung</p>}
>
  <Button>Löschen</Button>
</ProtectedComponent>
```

---

## Neue Berechtigungen hinzufügen

### 1. Datenbank
```sql
INSERT INTO permissions (name, display_name, description, category, is_system_permission) VALUES
('neue.berechtigung', 'Neuer Name', 'Beschreibung', 'kategorie', true);
```

### 2. Rolle zuweisen
```sql
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'vorstand' AND p.name = 'neue.berechtigung';
```

### 3. Backend nutzen
```javascript
router.get('/neue-route', authenticate, requirePermission('neue.berechtigung'), async (req, res) => {
  // Route-Handler
});
```

### 4. Frontend nutzen
```tsx
{hasPermission('neue.berechtigung') && <NeueKomponente />}
```

---

## Migration & Abwärtskompatibilität

Das System unterstützt automatische Migration von Legacy-Benutzern:
- `is_admin = true` → automatische Zuweisung der "webmaster" Rolle
- `is_member = true` → automatische Zuweisung der "mitglied" Rolle

**Wichtig:** Legacy-Admins (`is_admin = true`) haben weiterhin ALLE Berechtigungen, unabhängig vom RBAC-System.

---

## Audit-Logging

Alle Berechtigungsfehler werden automatisch im Audit-Log protokolliert:
```javascript
{
  userId: 'user-id',
  action: 'UNAUTHORIZED_ACCESS',
  details: {
    reason: 'Missing permission',
    requiredPermission: 'articles.delete',
    path: '/api/articles/123'
  },
  ipAddress: '192.168.1.1',
  timestamp: '2025-10-31T...'
}
```

---

## Best Practices

1. **Principle of Least Privilege**: Vergebe nur die minimal notwendigen Berechtigungen
2. **Gruppierung**: Nutze Rollen anstatt individuelle Berechtigungen zu vergeben
3. **Scope verwenden**: Nutze `.own` und `.all` für granulare Kontrolle
4. **Dokumentation**: Dokumentiere den Zweck jeder neuen Berechtigung
5. **Testing**: Teste neue Berechtigungen mit verschiedenen Rollen
6. **Review**: Überprüfe regelmäßig die vergebenen Berechtigungen

---

## Fehlerbehebung

**Problem:** Benutzer hat keine Berechtigungen trotz Rollenzuweisung
- Prüfe `user_roles` Tabelle: `SELECT * FROM user_roles WHERE user_id = 'user-id';`
- Prüfe `role_permissions` Tabelle: `SELECT * FROM role_permissions WHERE role_id = 'role-id';`
- Prüfe JWT-Token: Enthält es die Berechtigungen?

**Problem:** Neue Berechtigung wird nicht erkannt
- Backend neu starten (JWT wird bei Login erstellt)
- Benutzer neu anmelden
- Datenbank-Migration prüfen

---

## Zusammenfassung

Das RBAC-System bietet:
- ✅ Granulare Berechtigungskontrolle
- ✅ Kategorisierte Berechtigungen
- ✅ Rollenbasierte Verwaltung
- ✅ Scope-Konzept (own/all)
- ✅ Frontend & Backend Integration
- ✅ Audit-Logging
- ✅ Abwärtskompatibilität
- ✅ Erweiterbarkeit

**Aktuelle Statistik:**
- 8 Kategorien
- 40+ Berechtigungen
- 6 Standardrollen
- Vollständig administrierbar über `/verwaltung#rollen`
