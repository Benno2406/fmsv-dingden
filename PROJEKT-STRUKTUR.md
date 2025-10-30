# FMSV Dingden - Projekt-Struktur

Übersichtliche Struktur aller wichtigen Verzeichnisse und Dateien.

## 📁 Verzeichnisstruktur

```
fmsv-dingden/
│
├── 📱 Frontend
│   ├── App.tsx                 # Haupt-App-Komponente
│   ├── main.tsx                # Entry Point
│   ├── pages/                  # React Pages
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── member/             # Mitgliederbereich
│   │   └── admin/              # Verwaltungsbereich
│   ├── components/             # React Components
│   │   ├── ui/                 # Shadcn UI Components
│   │   └── admin/              # Admin Components
│   ├── lib/                    # Utilities & API Services
│   │   └── api/                # API Service Layer
│   └── contexts/               # React Contexts
│
├── 🔧 Backend
│   └── backend/
│       ├── server.js           # Express Server
│       ├── routes/             # API Routes
│       ├── middleware/         # Express Middleware
│       ├── config/             # Konfiguration
│       ├── database/           # SQL Schema
│       ├── utils/              # Utilities
│       └── scripts/            # DB Scripts
│
├── 📦 Installation
│   └── Installation/
│       ├── scripts/
│       │   ├── install.sh      # Haupt-Installation
│       │   ├── update.sh       # Manuelle Updates
│       │   └── auto-update.sh  # Auto-Update
│       └── Anleitung/
│           ├── Installation.md
│           ├── E-Mail-Setup.md
│           └── Cloudflare-Tunnel-Setup.md
│
├── 📚 Dokumentation
│   ├── README.md               # Projekt-Übersicht
│   ├── QUICK-START.md          # 5-Minuten Start
│   ├── PROJEKT-STRUKTUR.md     # Diese Datei
│   └── Attributions.md         # Lizenzen
│
├── 💾 Daten (nicht in Git)
│   ├── Saves/                  # File Uploads
│   └── Logs/                   # Application Logs
│
└── ⚙️ Konfiguration
    ├── .env                    # Frontend-Env (nicht in Git)
    ├── backend/.env            # Backend-Env (nicht in Git)
    ├── vite.config.ts          # Vite Config
    └── tsconfig.json           # TypeScript Config
```

---

## 🎯 Wichtigste Dateien

### Für Installation

| Datei | Beschreibung |
|-------|--------------|
| `/Installation/scripts/install.sh` | Das eine Installations-Script |
| `/Installation/Anleitung/Installation.md` | Detaillierte Anleitung |
| `/QUICK-START.md` | Schnellstart-Guide |

### Für Entwicklung

| Datei | Beschreibung |
|-------|--------------|
| `/App.tsx` | Haupt-App |
| `/backend/server.js` | Backend Server |
| `/backend/database/schema.sql` | Datenbank-Schema |
| `/lib/api-client.ts` | API Client |

### Für Konfiguration

| Datei | Beschreibung |
|-------|--------------|
| `/.env` | Frontend-Konfiguration |
| `/backend/.env` | Backend-Konfiguration |
| `/backend/config/database.js` | DB-Verbindung |

---

## 📂 Verzeichnis-Details

### `/pages` - React Pages

**Öffentliche Seiten:**
- `HomePage.tsx` - Startseite
- `LoginPage.tsx` - Login
- `FlugbetriebPage.tsx` - Flugbetrieb
- `TerminePage.tsx` - Termine
- ...

**Mitgliederbereich (`/member`):**
- `OverviewPage.tsx` - Dashboard
- `FlugbuchPage.tsx` - Flugbuch
- `ProfilPage.tsx` - Profil
- ...

**Verwaltungsbereich (`/admin`):**
- `DashboardPage.tsx` - Admin-Dashboard
- `MitgliederPage.tsx` - Mitglieder-Verwaltung
- `ArtikelPage.tsx` - Artikel-Verwaltung
- ...

### `/components` - React Components

**Layouts:**
- `PublicLayout.tsx` - Öffentlicher Bereich
- `MemberLayout.tsx` - Mitglieder/Admin
- `KioskLayout.tsx` - Kiosk-Modus

**UI Components (`/ui`):**
- 40+ Shadcn/ui Components
- Button, Dialog, Table, etc.

**Admin Components (`/admin`):**
- `MembersTab.tsx` - Mitglieder-Tab
- `ArticlesTab.tsx` - Artikel-Tab
- ...

### `/backend` - Node.js Backend

**Routes (`/routes`):**
- `auth.js` - Login, 2FA
- `users.js` - User-Verwaltung
- `articles.js` - Artikel
- `events.js` - Termine
- `flugbuch.js` - Flugbuch
- `images.js` - Bilder
- `protocols.js` - Protokolle
- `notifications.js` - Benachrichtigungen

**Middleware (`/middleware`):**
- `auth.js` - JWT-Auth
- `rateLimiter.js` - Rate Limiting
- `upload.js` - File Uploads
- `errorHandler.js` - Error Handling

**Utils (`/utils`):**
- `logger.js` - Winston Logger
- `jwt.js` - JWT Token Management
- `audit.js` - Audit Logging

### `/lib` - Frontend Utilities

**API Services (`/api`):**
- `auth.service.ts` - Auth API
- `users.service.ts` - Users API
- `articles.service.ts` - Articles API
- ...

**Utils (`/utils`):**
- `flugbuch-pdf-export.ts` - PDF Export
- `flugbuch-csv-export.ts` - CSV Export
- `protocol-pdf-export.ts` - Protokoll PDF

---

## 🔄 Update-System

### GitHub → Server

```
Lokaler PC
    ↓ git push
GitHub (main/testing)
    ↓ auto-update
Server (Production/Testing)
```

### Branches

- **`main`** - Stable (Production)
- **`testing`** - Testing (Development)

### Auto-Update

Server zieht automatisch Updates:
- **Täglich** um 03:00 Uhr (oder)
- **Wöchentlich** Sonntag 03:00 Uhr

Via systemd Timer: `fmsv-auto-update.timer`

---

## 📊 Datenfluss

### Frontend → Backend → Datenbank

```
React App (Browser)
    ↓ HTTP/JSON
Express API (Backend)
    ↓ SQL
PostgreSQL (Datenbank)
```

### File Uploads

```
User Upload
    ↓ Multer
/Saves/ (Verzeichnis)
    ↓ Nginx
Browser (Download)
```

---

## 🔒 Nicht in Git

Diese Dateien/Verzeichnisse sind in `.gitignore`:

```
/.env                 # Frontend-Env
/backend/.env         # Backend-Env
/node_modules/        # Dependencies
/backend/node_modules/
/dist/                # Build
/Saves/               # Uploads
/Logs/                # Logs
```

---

## 🎯 Navigation

**Installation starten:**
```bash
sudo ./Installation/scripts/install.sh
```

**Updates durchführen:**
```bash
sudo ./Installation/scripts/update.sh
```

**Dokumentation lesen:**
- [`/Installation/Anleitung/Installation.md`](Installation/Anleitung/Installation.md)
- [`/QUICK-START.md`](QUICK-START.md)
- [`/README.md`](README.md)

---

**Übersichtlich?** Alles an seinem Platz! 🎯
