# Database Admin in Node.js/React

**pgAdmin war gestern - Heute: Eigene DB-Admin in Node.js!** 🚀

---

## 🎯 **Warum KEINE pgAdmin-Installation mehr?**

### Probleme mit pgAdmin:

❌ **Python/Flask** - Anderer Tech-Stack  
❌ **Apache2-Konflikt** - Port 80/443 Probleme  
❌ **Komplexes Setup** - setup-web.sh, expect, etc.  
❌ **Zusätzliche Dependencies** - Python-Module, Libraries  
❌ **Extra Service** - Noch ein Prozess mehr  
❌ **Separate Authentifizierung** - Eigene User-Verwaltung  
❌ **Keine Integration** - Separates Interface

### ✅ **Unsere Lösung: Database Admin in Node.js/React**

✅ **Gleicher Tech-Stack** - Node.js + React + TypeScript  
✅ **Kein Apache2** - Keine Port-Konflikte  
✅ **Einfaches Setup** - Backend-Route + Frontend-Page  
✅ **Keine zusätzlichen Dependencies** - Nutzt PostgreSQL Pool  
✅ **Kein Extra Service** - Läuft im Haupt-Backend  
✅ **Gleiche Auth** - JWT, nur Webmaster-Zugang  
✅ **Perfekte Integration** - Teil der Haupt-App  

---

## 🏗️ **Architektur**

### Alte Lösung (pgAdmin):

```
┌─────────────────────────────────────────┐
│  Internet / Cloudflare                  │
└──────────────┬──────────────────────────┘
               │
               ↓
     ┌─────────────────┐
     │     nginx       │
     └────┬─────┬──────┘
          │     │
  ┌───────┘     └───────┐
  │                     │
  ↓                     ↓
┌──────────┐      ┌─────────────┐
│  FMSV    │      │  pgAdmin    │
│ (Node.js)│      │ (Python)    │
│ Port 3000│      │ Port 5050   │
└──────────┘      └─────────────┘
                  ↓ (benötigt)
              ┌─────────────┐
              │  Apache2 ?! │
              │  (Konflikt) │
              └─────────────┘
```

### Neue Lösung (Integriert):

```
┌─────────────────────────────────────────┐
│  Internet / Cloudflare                  │
└──────────────┬──────────────────────────┘
               │
               ↓
         ┌─────────┐
         │  nginx  │
         └────┬────┘
              │
              ↓
     ┌─────────────────┐
     │   FMSV Backend  │
     │   (Node.js)     │
     │   Port 3000     │
     ├─────────────────┤
     │ /api/auth       │
     │ /api/users      │
     │ /api/articles   │
     │ ...             │
     │ /api/database ← NEU!
     └────────┬────────┘
              │
              ↓
      ┌───────────────┐
      │  PostgreSQL   │
      │  Port 5432    │
      └───────────────┘
```

**Alles in EINEM Service! 🎉**

---

## 📂 **Implementierung**

### 1. Backend: Database Routes (`/backend/routes/database.js`)

```javascript
/**
 * Alle Routes nur für Webmaster!
 */
router.use(authenticateToken);
router.use(requireRoles(['webmaster']));

// Verfügbare Endpoints:
GET  /api/database/tables                    // Alle Tabellen
GET  /api/database/tables/:name/schema       // Tabellen-Schema
GET  /api/database/tables/:name/data         // Tabellen-Daten (Pagination)
POST /api/database/query                     // SQL Query (READ-ONLY)
POST /api/database/backup                    // Backup erstellen
GET  /api/database/stats                     // Statistiken
GET  /api/database/health                    // Health Check
```

**Features:**

- ✅ **Sicherheit:** Nur Webmaster-Zugriff per JWT
- ✅ **Read-Only Modus:** SELECT-Queries standardmäßig
- ✅ **Query Timeout:** Max. 30 Sekunden
- ✅ **Audit Logging:** Alle Aktionen werden geloggt
- ✅ **Pagination:** Große Tabellen werden seitenweise geladen
- ✅ **Backup-Funktion:** Erstellt pg_dump

### 2. Frontend: Database Admin Page (`/pages/admin/DatabasePage.tsx`)

```typescript
// Zugriff nur für Webmaster
if (user?.rang !== 'webmaster') {
    return <Navigate to="/verwaltung" replace />;
}

// Verfügbare Tabs:
- Tabellen (Liste, Schema, Daten)
- SQL Query Editor
- Aktivitäts-Monitor
```

**Features:**

- ✅ **Tabellen-Browser:** Alle Tabellen mit Größe, Zeilen, Spalten
- ✅ **Schema-Viewer:** Columns, Constraints, Indizes
- ✅ **Daten-Ansicht:** Pagination, Sortierung
- ✅ **Query-Editor:** SQL ausführen (READ-ONLY)
- ✅ **Statistiken:** DB-Größe, Connections, Aktivität
- ✅ **Health-Monitor:** Status, Version, Pool-Info
- ✅ **Backup-Button:** Direktes Backup aus dem Browser

### 3. API Service (`/lib/api/database.service.ts`)

```typescript
// Typsichere API-Calls
export const databaseService = {
    getTables,
    getTableSchema,
    getTableData,
    executeQuery,
    createBackup,
    getDatabaseStats,
    getDatabaseHealth
};
```

---

## 🚀 **Zugriff**

### Als Webmaster:

1. **Login:** `https://fmsv.bartholmes.eu/login`
2. **Verwaltungsbereich:** `/verwaltung`
3. **Datenbank-Admin:** In der Sidebar: "Datenbank" (nur für Webmaster sichtbar!)

### Direktlink:

```
https://fmsv.bartholmes.eu/verwaltung#database
```

---

## 🔐 **Sicherheit**

### Multi-Layer Security:

1. **JWT-Authentifizierung:**
   ```javascript
   router.use(authenticateToken);
   ```

2. **Rolle-Check:**
   ```javascript
   router.use(requireRoles(['webmaster']));
   ```

3. **READ-ONLY Standard:**
   ```javascript
   const { query, readonly = true } = req.body;
   ```

4. **SQL-Injection-Schutz:**
   ```javascript
   // Parametrisierte Queries
   pool.query('SELECT * FROM users WHERE id = $1', [userId]);
   ```

5. **Query Timeout:**
   ```javascript
   // Max. 30 Sekunden
   setTimeout(() => reject(new Error('Timeout')), 30000);
   ```

6. **Audit Logging:**
   ```javascript
   await auditLog(userId, 'database_query', 'database', query, ip);
   ```

### Was IST erlaubt:

- ✅ SELECT Queries
- ✅ SHOW Statements
- ✅ DESCRIBE Queries
- ✅ Tabellen-Browser
- ✅ Schema-Ansicht
- ✅ Statistiken

### Was NICHT erlaubt ist (READ-ONLY):

- ❌ INSERT / UPDATE / DELETE
- ❌ DROP / ALTER
- ❌ CREATE / TRUNCATE
- ❌ Alles außer SELECT

**Für Write-Operations:** Nutze die spezifischen API-Endpoints!

---

## 📊 **Features im Detail**

### 1. Tabellen-Browser

```
┌────────────────────────────────────────────┐
│  Tabelle: users                            │
│  ├─ 15 Spalten                             │
│  ├─ 42 Zeilen                              │
│  └─ 128 KB                                 │
└────────────────────────────────────────────┘
```

**Zeigt:**
- Tabellen-Name
- Anzahl Spalten
- Anzahl Zeilen
- Größe auf Disk

**Aktionen:**
- Klick → Tabellen-Details
- Schema anzeigen
- Daten durchsuchen

### 2. Schema-Viewer

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    rang VARCHAR(50) DEFAULT 'mitglied',
    ...
);

-- Constraints:
PRIMARY KEY (id)
UNIQUE (email)
FOREIGN KEY (flugbetrieb_id) REFERENCES flugbetrieb(id)

-- Indexes:
idx_users_email ON users(email)
idx_users_rang ON users(rang)
```

**Zeigt:**
- Alle Spalten mit Typ
- Primary Keys
- Foreign Keys
- Unique Constraints
- Indizes

### 3. Daten-Ansicht

```
┌─────┬──────────────────────┬───────────┬──────────┐
│ ID  │ Email                │ Rang      │ Aktiv    │
├─────┼──────────────────────┼───────────┼──────────┤
│ 1   │ admin@fmsv.de        │ webmaster │ true     │
│ 2   │ vorstand@fmsv.de     │ vorstand  │ true     │
│ ... │ ...                  │ ...       │ ...      │
└─────┴──────────────────────┴───────────┴──────────┘

Seite 1 von 3 • 42 Zeilen gesamt
```

**Features:**
- Pagination (50 Zeilen pro Seite)
- Sortierung nach jeder Spalte
- JSON-Daten werden formatiert
- Zeitstempel werden lokalisiert

### 4. Query-Editor

```sql
-- Beispiel-Queries:

-- Alle User mit Vorstand-Rang
SELECT * FROM users WHERE rang = 'vorstand';

-- Flugbuch-Statistik pro Jahr
SELECT 
    EXTRACT(YEAR FROM datum) as jahr,
    COUNT(*) as fluege,
    SUM(minuten) as gesamtzeit
FROM flugbuch
GROUP BY jahr
ORDER BY jahr DESC;

-- Neueste Artikel
SELECT * FROM articles 
WHERE status = 'published' 
ORDER BY created_at DESC 
LIMIT 10;
```

**Features:**
- Syntax-Highlighting (Font Mono)
- Multi-Line Queries
- Fehler-Anzeige
- Ergebnis-Tabelle
- Row-Count

### 5. Statistiken

```
┌────────────────────────┐
│ Datenbank-Größe        │
│ 256 MB                 │
└────────────────────────┘

┌────────────────────────┐
│ Tabellen               │
│ 12 Tabellen            │
│ 245 MB total           │
└────────────────────────┘

┌────────────────────────┐
│ Verbindungen           │
│ 5 total                │
│ 2 aktiv • 3 idle       │
└────────────────────────┘

┌────────────────────────┐
│ Aktivität              │
│ 3 laufende Queries     │
└────────────────────────┘
```

### 6. Health-Monitor

```
Status: ✅ healthy

PostgreSQL 15.4 (Ubuntu 15.4-1.pgdg22.04+1)
Server Time: 2024-10-31 15:30:45
Pool: 10 total, 3 idle, 0 waiting
```

### 7. Backup-Funktion

```bash
# Klick auf "Backup erstellen" führt aus:
pg_dump -h localhost -U fmsv_user -d fmsv_db -F p -f /backups/fmsv_backup_2024-10-31T15-30-45.sql

# Backup wird gespeichert in:
/var/www/fmsv-dingden/backups/
```

---

## 🔧 **Entwicklung & Erweiterung**

### Neue Features hinzufügen:

#### Backend (Node.js):

```javascript
// backend/routes/database.js

/**
 * GET /api/database/export/:tableName
 * Exportiere Tabelle als CSV
 */
router.get('/export/:tableName', async (req, res, next) => {
    try {
        const { tableName } = req.params;
        
        // Query ausführen
        const result = await pool.query(`SELECT * FROM ${tableName}`);
        
        // Als CSV formatieren
        const csv = convertToCSV(result.rows);
        
        // Download-Response
        res.header('Content-Type', 'text/csv');
        res.attachment(`${tableName}.csv`);
        res.send(csv);
        
        await auditLog(req.user.id, 'database_export', 'database', tableName, req.ip);
    } catch (error) {
        next(error);
    }
});
```

#### Frontend (React):

```typescript
// components/database/TableExport.tsx

export function TableExport({ tableName }: { tableName: string }) {
    const handleExport = async () => {
        try {
            const blob = await databaseService.exportTable(tableName);
            downloadBlob(blob, `${tableName}.csv`);
            toast.success('Export erfolgreich');
        } catch (error) {
            toast.error('Export fehlgeschlagen');
        }
    };

    return (
        <Button onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Als CSV exportieren
        </Button>
    );
}
```

### Erweiterte Query-Features:

```typescript
// Beispiel: Query-History

const [queryHistory, setQueryHistory] = useState<string[]>([]);

const saveQuery = (query: string) => {
    const history = [...queryHistory, query];
    setQueryHistory(history);
    localStorage.setItem('queryHistory', JSON.stringify(history));
};

const loadHistory = () => {
    const saved = localStorage.getItem('queryHistory');
    if (saved) {
        setQueryHistory(JSON.parse(saved));
    }
};
```

---

## 🆚 **Vergleich: pgAdmin vs. Node.js Admin**

| Feature | pgAdmin 4 | Node.js Admin |
|---------|-----------|---------------|
| **Tech-Stack** | Python/Flask | Node.js/React |
| **Installation** | Komplex (Apache2!) | Keine (integriert) |
| **Dependencies** | Python, Flask, WSGI | Keine zusätzlichen |
| **Services** | +1 (pgAdmin) | 0 (läuft im Backend) |
| **Ports** | 5050 | Keine (nutzt 3000) |
| **Auth** | Eigene User | JWT (gleiche wie App) |
| **Integration** | Separate App | Teil der Haupt-App |
| **UI** | pgAdmin-Design | Dein App-Design |
| **Security** | Extern konfigurieren | Baut-in Webmaster-only |
| **Backup** | Manuell/CLI | Button-Klick |
| **Monitoring** | Via Plugins | Eingebaut |
| **Entwicklung** | Python-Kenntnisse | TypeScript (wie gewohnt) |
| **Wartung** | Separat updaten | Mit App updaten |
| **Logs** | Eigene Log-Files | Audit-System |

---

## 💡 **Best Practices**

### 1. Immer READ-ONLY nutzen

```typescript
// ✅ Gut - Read-Only Standard
await databaseService.executeQuery('SELECT * FROM users', true);

// ⚠️ Vorsicht - Write-Access
await databaseService.executeQuery('DELETE FROM ...', false);
```

### 2. Große Tabellen: Pagination nutzen

```typescript
// ✅ Gut - Pagination
const page1 = await databaseService.getTableData('flugbuch', 1, 50);
const page2 = await databaseService.getTableData('flugbuch', 2, 50);

// ❌ Schlecht - Alle Daten auf einmal
const all = await databaseService.executeQuery('SELECT * FROM flugbuch');
```

### 3. Backup vor kritischen Changes

```typescript
// ✅ Gut - Backup vor Migration
await databaseService.createBackup();
// Dann Migration via /backend/database/migration.sql

// ❌ Schlecht - Direkt Änderungen ohne Backup
```

### 4. Audit Logs prüfen

```sql
-- Wer hat was in der Datenbank gemacht?
SELECT * FROM audit_logs 
WHERE action LIKE 'database_%' 
ORDER BY timestamp DESC 
LIMIT 50;
```

### 5. Statistiken monitoren

```typescript
// Regelmäßig Health-Check
useEffect(() => {
    const interval = setInterval(async () => {
        const health = await databaseService.getDatabaseHealth();
        if (health.status !== 'healthy') {
            toast.error('Datenbank-Problem erkannt!');
        }
    }, 60000); // Alle Minute

    return () => clearInterval(interval);
}, []);
```

---

## 🚫 **pgAdmin komplett entfernen**

Falls pgAdmin noch installiert ist:

```bash
# 1. Service stoppen
sudo systemctl stop pgadmin4
sudo systemctl disable pgadmin4

# 2. Deinstallieren
sudo apt-get remove --purge -y pgadmin4-web
sudo apt-get autoremove -y

# 3. Dateien löschen
sudo rm -rf /var/lib/pgadmin
sudo rm -rf /var/log/pgadmin
sudo rm -rf /usr/pgadmin4
sudo rm /etc/systemd/system/pgadmin4.service

# 4. nginx Config entfernen
sudo rm /etc/nginx/sites-enabled/pgadmin
sudo rm /etc/nginx/sites-available/pgadmin
sudo systemctl reload nginx

# 5. Apache2 auch weg (falls installiert)
sudo systemctl stop apache2
sudo systemctl disable apache2
sudo apt-get remove --purge -y apache2 apache2-bin
sudo apt-get autoremove -y

# ✅ Fertig! Alles sauber!
```

---

## 📚 **Weitere Ressourcen**

### API-Dokumentation:

```
/backend/API-Dokumentation.md
└─ /database Endpoints (NEU!)
```

### Code-Dateien:

```
/backend/routes/database.js          # Backend-Routes
/lib/api/database.service.ts         # Frontend-Service
/pages/admin/DatabasePage.tsx        # Admin-Page
/components/MemberLayout.tsx         # Navigation (Webmaster-Menu)
```

### Logs:

```sql
-- Alle Database-Admin Aktionen
SELECT * FROM audit_logs 
WHERE action LIKE 'database_%'
ORDER BY timestamp DESC;
```

---

## ✨ **Zusammenfassung**

### Vorher (pgAdmin):

```
❌ Python + Flask
❌ Apache2-Konflikt
❌ setup-web.sh Probleme
❌ Separate Auth
❌ Extra Service
❌ Komplexe Installation
```

### Jetzt (Node.js Admin):

```
✅ Node.js + React (gleicher Stack!)
✅ Kein Apache2
✅ Keine extra Installation
✅ JWT Auth (gleiche wie App)
✅ Läuft im Backend
✅ Einfach & integriert
```

**Einzige Voraussetzung:** Webmaster-Rang! 🔐

---

## 🎯 **Nächste Schritte**

1. ✅ **Backend läuft:** `/api/database` Routes sind aktiv
2. ✅ **Frontend fertig:** Zugriff via `/verwaltung#database`
3. ✅ **Nur Webmaster:** Automatische Zugriffskontrolle

**Los geht's:** Login als Webmaster → Verwaltung → Datenbank! 🚀

---

**Keine Python-Probleme mehr. Keine Apache2-Konflikte mehr. Alles in Node.js! 🎉**
