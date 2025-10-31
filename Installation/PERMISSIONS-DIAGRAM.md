# RBAC System - Visuelle Diagramme

Visuelle Darstellung der Beziehungen und Strukturen im RBAC-System.

## 📊 Datenbank-Struktur

```
┌─────────────────┐
│     USERS       │
├─────────────────┤
│ id (PK)         │
│ email           │
│ first_name      │
│ last_name       │
│ is_admin        │◄───── Legacy Kompatibilität
│ is_member       │
│ is_active       │
└─────────────────┘
         │
         │ n:m
         ▼
┌─────────────────┐
│   USER_ROLES    │
├─────────────────┤
│ user_id (FK)    │
│ role_id (FK)    │
│ assigned_at     │
│ assigned_by     │
└─────────────────┘
         │
         │ n:1
         ▼
┌─────────────────┐
│     ROLES       │
├─────────────────┤
│ id (PK)         │
│ name            │
│ display_name    │
│ description     │
│ priority        │
│ upload_limit_mb │
│ is_system_role  │
│ color           │
└─────────────────┘
         │
         │ n:m
         ▼
┌──────────────────┐
│ ROLE_PERMISSIONS │
├──────────────────┤
│ role_id (FK)     │
│ permission_id    │
└──────────────────┘
         │
         │ n:1
         ▼
┌─────────────────┐
│  PERMISSIONS    │
├─────────────────┤
│ id (PK)         │
│ name            │
│ display_name    │
│ description     │
│ category        │
│ is_system_perm  │
└─────────────────┘
```

---

## 🔄 Authentifizierungs-Flow

```
┌──────────────┐
│   Login      │
│   Request    │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ Credentials prüfen   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ User-Daten aus DB laden          │
│ - Basis-Info                     │
│ - Rollen (via user_roles)        │
│ - Berechtigungen (via            │
│   role_permissions)              │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Auto-Migration (falls nötig)     │
│ is_admin=true  → webmaster       │
│ is_member=true → mitglied        │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ JWT erstellen mit:               │
│ - User-ID                        │
│ - Rollen-Array                   │
│ - Berechtigungs-Array            │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────┐
│ Access Token +       │
│ Refresh Token        │
│ an Client senden     │
└──────────────────────┘
```

---

## 🛡️ Request-Autorisierung

```
┌──────────────────┐
│  API Request     │
│  + JWT Token     │
└────────┬─────────┘
         │
         ▼
┌─────────────────────────┐
│ authenticate Middleware │
│ - Token validieren      │
│ - User-Objekt erstellen │
└────────┬────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ requirePermission Middleware     │
│                                  │
│ IF user.is_admin → ✓ Allow      │
│ ELSE IF permission in            │
│    user.permissions → ✓ Allow   │
│ ELSE → ✗ Deny (403)             │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────┐
│ Route Handler    │
│ (Business Logic) │
└──────────────────┘
         │
         ▼
┌──────────────────┐
│   Response       │
└──────────────────┘
```

---

## 👥 Rollen-Hierarchie

```
                    ┌───────────────┐
                    │   WEBMASTER   │
                    │               │
                    │ Priority: 100 │
                    │ Upload: 50MB  │
                    └───────┬───────┘
                            │
            ┌───────────────┴───────────────┐
            │                               │
    ┌───────▼────────┐             ┌───────▼────────┐
    │   VORSTAND     │             │  KASSENWART    │
    │                │             │                │
    │ Priority: 50   │             │ Priority: 20   │
    │ Upload: 30MB   │             │ Upload: 30MB   │
    └───────┬────────┘             └───────┬────────┘
            │                               │
            │                               │
    ┌───────▼────────────────────────┬──────┘
    │                                │
┌───▼────────────┐          ┌───────▼────────┐
│  FLUGLEHRER    │          │  JUGENDWART    │
│                │          │                │
│ Priority: 15   │          │ Priority: 10   │
│ Upload: 10MB   │          │ Upload: 10MB   │
└───────┬────────┘          └───────┬────────┘
        │                           │
        └──────────┬────────────────┘
                   │
           ┌───────▼────────┐
           │   MITGLIED     │
           │                │
           │ Priority: 5    │
           │ Upload: 5MB    │
           └────────────────┘
```

**Hinweis:** Höhere Priority = Mehr Rechte  
Bei mehreren Rollen wird die höchste Priority verwendet.

---

## 🗂️ Berechtigungs-Kategorien

```
PERMISSIONS
├── 📰 ARTICLES (12)
│   ├── view
│   ├── create
│   ├── edit.own
│   ├── edit.all
│   ├── delete
│   ├── publish
│   └── ... (6 erweiterte)
│
├── 👥 MEMBERS (15)
│   ├── view
│   ├── view.details
│   ├── edit
│   ├── delete
│   ├── roles.manage
│   └── ... (10 erweiterte)
│
├── ✈️ FLUGBUCH (13)
│   ├── view
│   ├── create
│   ├── edit.own
│   ├── edit.all
│   ├── delete
│   ├── export
│   └── ... (7 erweiterte)
│
├── 📅 EVENTS (10)
│   ├── view
│   ├── create
│   ├── edit
│   ├── delete
│   └── ... (6 erweiterte)
│
├── 🖼️ IMAGES (11)
│   ├── view
│   ├── upload
│   ├── delete.own
│   ├── delete.all
│   ├── galleries.manage
│   └── ... (6 erweiterte)
│
├── 📄 DOCUMENTS (11)
│   ├── view
│   ├── upload
│   ├── delete
│   ├── protocols.view
│   ├── protocols.create
│   ├── protocols.edit
│   └── ... (5 erweiterte)
│
├── 🔔 NOTIFICATIONS (9)
│   ├── send.own
│   ├── send.all
│   └── ... (7 erweiterte)
│
├── ⚙️ SYSTEM (16)
│   ├── settings
│   ├── database
│   ├── audit.view
│   ├── roles.manage
│   └── ... (12 erweiterte)
│
├── 🏛️ CLUB (8)
├── 💰 FINANCE (12)
├── 🎓 TRAINING (12)
├── 📦 INVENTORY (10)
├── 📊 STATISTICS (6)
└── 🖥️ KIOSK (7)

Gesamt: 140+ Berechtigungen
```

---

## 🔐 Scope-Hierarchie

```
PERMISSION SCOPES

┌─────────────────────────────────┐
│         .view                   │  ← Nur ansehen
│    (Niedrigste Stufe)           │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│        .create                  │  ← Neu erstellen
└─────────────────────────────────┘

┌─────────────────────────────────┐
│       .edit.own                 │  ← Eigene bearbeiten
└─────────────────────────────────┘

┌─────────────────────────────────┐
│       .edit.all                 │  ← Alle bearbeiten
└─────────────────────────────────┘

┌─────────────────────────────────┐
│        .delete                  │  ← Löschen
└─────────────────────────────────┘

┌─────────────────────────────────┐
│        .manage                  │  ← Vollständige Verwaltung
│    (Höchste Stufe)              │
└─────────────────────────────────┘


Beispiel: ARTICLES

articles.view           ─┐
                         │
articles.create         ─┤
                         ├─► Mitglied kann:
                         │   - Ansehen
articles.edit.own       ─┘   - Eigene bearbeiten

articles.edit.all       ─┐
                         ├─► Vorstand kann zusätzlich:
articles.publish        ─┤   - Alle bearbeiten
                         │   - Veröffentlichen
                         │
articles.delete         ─┘─► Webmaster kann zusätzlich:
                             - Löschen
```

---

## 🔄 Frontend Permission Check Flow

```
┌───────────────────────┐
│  React Component      │
└───────┬───────────────┘
        │
        │ usePermissions()
        ▼
┌───────────────────────┐
│  PermissionsContext   │
│                       │
│ - user.permissions    │
│ - hasPermission()     │
└───────┬───────────────┘
        │
        ▼
┌──────────────────────────────────┐
│  hasPermission('articles.edit')  │
│                                  │
│  IF user === null                │
│    → return false                │
│                                  │
│  IF user.is_admin === true       │
│    → return true (Legacy)        │
│                                  │
│  IF permission in                │
│     user.permissions             │
│    → return true                 │
│                                  │
│  ELSE                            │
│    → return false                │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────┐
│  Conditional Render  │
│                      │
│  true  → Show        │
│  false → Hide        │
└──────────────────────┘
```

---

## 🎨 UI Rollen-Verwaltung

```
/verwaltung#rollen

┌─────────────────────────────────────────┐
│         ROLLEN ÜBERSICHT                │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────┬──────────┬───────────┐   │
│  │ Rolle   │ Benutzer │ Rechte    │   │
│  ├─────────┼──────────┼───────────┤   │
│  │ Webm... │    1     │    140+   │◄──┼── Klick → Details
│  │ Vorst...│    5     │     60    │   │
│  │ Mitgl...│   75     │     20    │   │
│  └─────────┴──────────┴───────────┘   │
│                                         │
│  [+ Neue Rolle]                         │
└─────────────────────────────────────────┘
                 │
                 │ Rolle bearbeiten
                 ▼
┌─────────────────────────────────────────┐
│      ROLLE BEARBEITEN: Vorstand         │
├─────────────────────────────────────────┤
│                                         │
│  Name:        [Vorstand        ]        │
│  Anzeigename: [Vorstand        ]        │
│  Upload Limit:[30 MB           ]        │
│  Priorität:   [50              ]        │
│  Farbe:       [🟦 #3B82F6      ]        │
│                                         │
│  BERECHTIGUNGEN:                        │
│  ┌─ Artikel ────────────────────┐      │
│  │ ☑ Artikel ansehen             │      │
│  │ ☑ Artikel erstellen           │      │
│  │ ☑ Eigene Artikel bearbeiten   │      │
│  │ ☑ Artikel veröffentlichen     │      │
│  │ ☐ Alle Artikel bearbeiten     │      │
│  └───────────────────────────────┘      │
│                                         │
│  ┌─ Mitglieder ─────────────────┐      │
│  │ ☑ Mitglieder ansehen          │      │
│  │ ☑ Mitgliederdetails ansehen   │      │
│  │ ☑ Mitglieder bearbeiten       │      │
│  │ ☐ Mitglieder löschen          │      │
│  └───────────────────────────────┘      │
│                                         │
│  [Speichern]  [Abbrechen]              │
└─────────────────────────────────────────┘
```

---

## 🗺️ Berechtigungs-Matrix

```
                    │ Mit- │ Vor- │ Web- │ Kassen- │ Flug- │
                    │glied │stand │master│  wart   │lehrer │
────────────────────┼──────┼──────┼──────┼─────────┼───────┤
articles.view       │  ✓   │  ✓   │  ✓   │    ✓    │   ✓   │
articles.create     │      │  ✓   │  ✓   │         │       │
articles.publish    │      │  ✓   │  ✓   │         │       │
articles.delete     │      │      │  ✓   │         │       │
────────────────────┼──────┼──────┼──────┼─────────┼───────┤
members.view        │  ✓   │  ✓   │  ✓   │    ✓    │   ✓   │
members.view.details│      │  ✓   │  ✓   │    ✓    │       │
members.edit        │      │  ✓   │  ✓   │         │       │
members.delete      │      │      │  ✓   │         │       │
────────────────────┼──────┼──────┼──────┼─────────┼───────┤
flugbuch.view       │  ✓   │  ✓   │  ✓   │    ✓    │   ✓   │
flugbuch.create     │  ✓   │  ✓   │  ✓   │    ✓    │   ✓   │
flugbuch.edit.own   │  ✓   │  ✓   │  ✓   │    ✓    │   ✓   │
flugbuch.edit.all   │      │  ✓   │  ✓   │         │   ✓   │
flugbuch.export     │      │  ✓   │  ✓   │         │   ✓   │
────────────────────┼──────┼──────┼──────┼─────────┼───────┤
finance.view        │      │      │  ✓   │    ✓    │       │
finance.*.all       │      │      │  ✓   │    ✓    │       │
────────────────────┼──────┼──────┼──────┼─────────┼───────┤
training.*          │      │      │  ✓   │         │   ✓   │
────────────────────┼──────┼──────┼──────┼─────────┼───────┤
system.settings     │      │      │  ✓   │         │       │
system.database     │      │      │  ✓   │         │       │
system.roles.manage │      │      │  ✓   │         │       │
────────────────────┴──────┴──────┴──────┴─────────┴───────┘

Legende:
✓ = Berechtigung vorhanden
  = Keine Berechtigung
```

---

## 🔄 Migrations-Flow

```
LEGACY SYSTEM                 RBAC SYSTEM
──────────────────────────────────────────

User mit is_admin=true
        │
        │ Bei Login
        ▼
┌────────────────────┐
│ Prüfe ob Rollen    │
│ vorhanden          │
└────────┬───────────┘
         │
         │ Keine Rollen?
         ▼
┌────────────────────┐
│ Suche 'webmaster'  │
│ Rolle              │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ INSERT INTO        │
│ user_roles         │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ Lade alle          │
│ Berechtigungen     │
│ der Rolle          │
└────────┬───────────┘
         │
         ▼
    JWT mit:
    - roles: ['webmaster']
    - permissions: [140+ Berechtigungen]
    - is_admin: true (Legacy)


WICHTIG:
is_admin=true bleibt erhalten!
→ Immer alle Berechtigungen
→ Fallback für Kompatibilität
```

---

## 📡 API-Struktur

```
/api
├── /auth
│   ├── POST /login          → JWT mit permissions
│   ├── POST /register       
│   └── POST /refresh        → Neuer JWT
│
├── /roles                   (requirePermission: system.roles.manage)
│   ├── GET  /               → Alle Rollen
│   ├── GET  /:id            → Eine Rolle mit permissions
│   ├── POST /               → Neue Rolle
│   ├── PUT  /:id            → Rolle bearbeiten
│   └── DELETE /:id          → Rolle löschen
│
├── /permissions             (requirePermission: system.roles.manage)
│   ├── GET  /               → Alle Berechtigungen
│   └── GET  /categories     → Berechtigungen nach Kategorie
│
├── /users
│   ├── GET  /               (requirePermission: members.view)
│   ├── GET  /:id            (requirePermission: members.view.details)
│   ├── PUT  /:id            (requirePermission: members.edit)
│   └── PUT  /:id/roles      (requirePermission: members.roles.manage)
│
└── ...weitere Routen mit jeweiliger Berechtigung
```

---

## 🎯 Zusammenfassung

```
┌──────────────────────────────────────────────┐
│          RBAC SYSTEM OVERVIEW                │
├──────────────────────────────────────────────┤
│                                              │
│  140+ Berechtigungen                         │
│    ├─ 40 Kern-Berechtigungen                │
│    └─ 100+ Erweiterte Berechtigungen         │
│                                              │
│  14 Kategorien                               │
│    ├─ Artikel, Mitglieder, Flugbuch         │
│    ├─ Events, Bilder, Dokumente             │
│    ├─ Benachrichtigungen, System            │
│    └─ Club, Finance, Training, ...          │
│                                              │
│  6 Standard-Rollen                           │
│    ├─ Mitglied      (Priority:   5)         │
│    ├─ Jugendwart    (Priority:  10)         │
│    ├─ Fluglehrer    (Priority:  15)         │
│    ├─ Kassenwart    (Priority:  20)         │
│    ├─ Vorstand      (Priority:  50)         │
│    └─ Webmaster     (Priority: 100)         │
│                                              │
│  ∞ Custom-Rollen                            │
│    └─ Über UI erstellbar                    │
│                                              │
│  Vollständig administrierbar                 │
│    └─ /verwaltung#rollen                    │
│                                              │
│  Legacy-Kompatibel                           │
│    └─ is_admin=true → Alle Rechte          │
│                                              │
│  Audit-Logging                               │
│    └─ Alle Zugriffe protokolliert           │
└──────────────────────────────────────────────┘
```

---

**Letzte Aktualisierung:** 2025-10-31  
**Version:** 1.0.0
