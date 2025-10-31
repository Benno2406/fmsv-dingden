# Environment-Variablen (.env Dateien)

Diese Anleitung erklärt die `.env` Dateien für Frontend und Backend.

---

## 📋 **Übersicht**

Die FMSV-Installation verwendet zwei verschiedene Arten von `.env` Dateien:

### 1. **Backend `.env`** (Node.js)
- **Speicherort:** `/var/www/fmsv-dingden/backend/.env`
- **Zweck:** Backend-Konfiguration (DB, SMTP, JWT, etc.)
- **Erstellt von:** `install.sh` (Schritt 12)

### 2. **Frontend `.env`** (Vite/React)
- **Speicherorte:**
  - `/var/www/fmsv-dingden/.env.production` → Production-Build
  - `/var/www/fmsv-dingden/.env.development` → Lokale Entwicklung
- **Zweck:** API-Endpoint-Konfiguration
- **Erstellt von:** `install.sh` (Schritt 13) oder `rebuild-frontend.sh`

---

## 🔧 **Frontend Environment (.env.production / .env.development)**

### Warum gibt es zwei Dateien?

- **`.env.production`** → Wird beim Production-Build verwendet (`npm run build`)
- **`.env.development`** → Wird bei lokaler Entwicklung verwendet (`npm run dev`)

### Inhalt

#### `.env.production`
```bash
# Production Environment Variables
# API URL - wird relativ gesetzt, damit es über Nginx Proxy funktioniert
VITE_API_URL=/api
```

**Wichtig:** `/api` ist relativ! Das Frontend ruft `/api/...` auf, Nginx leitet das an `localhost:3000` weiter.

#### `.env.development`
```bash
# Development Environment Variables
# API URL - localhost für lokale Entwicklung
VITE_API_URL=http://localhost:3000/api
```

**Wichtig:** Hier ist die volle URL! Bei lokaler Entwicklung läuft das Frontend oft auf Port 5173 (Vite Dev Server) und muss direkt auf Port 3000 zugreifen.

---

## 🚫 **Warum sind diese Dateien nicht im Git-Repository?**

### Grund 1: Sicherheit
Environment-Variablen können sensible Daten enthalten (API-Keys, Secrets, etc.). Diese gehören NICHT ins öffentliche Repository!

### Grund 2: Umgebungs-spezifisch
Jede Installation hat unterschiedliche Werte:
- Lokaler Dev-PC: `http://localhost:3000/api`
- Production-Server: `/api`
- Test-Server: `https://test.example.com/api`

### Grund 3: Best Practice
`.env` Dateien werden **immer** lokal erstellt und **nie** committed. Stattdessen gibt es `env.example.txt` als Vorlage.

---

## 🔨 **Automatische Erstellung**

### Bei Installation
Das `install.sh` Script erstellt beide Dateien automatisch:

```bash
# In install.sh (Zeile ~1463):
cat > .env.production <<EOF
VITE_API_URL=/api
EOF

cat > .env.development <<EOF
VITE_API_URL=http://localhost:3000/api
EOF
```

### Bei Rebuild
Das `rebuild-frontend.sh` Script prüft ob die Dateien existieren und erstellt sie bei Bedarf:

```bash
sudo fmsv-rebuild
```

Ausgabe:
```
ℹ️  Prüfe Umgebungsvariablen...
⚠️  .env.production nicht gefunden - erstelle sie...
✅ .env.production erstellt
✅ .env.development existiert
```

---

## 📝 **Manuelle Erstellung**

Falls du lokal entwickelst und die Dateien manuell erstellen möchtest:

### Schritt 1: Vorlage ansehen
```bash
cat /var/www/fmsv-dingden/env.example.txt
```

### Schritt 2: Production-File erstellen
```bash
cd /var/www/fmsv-dingden
nano .env.production
```

Inhalt:
```
VITE_API_URL=/api
```

### Schritt 3: Development-File erstellen
```bash
nano .env.development
```

Inhalt:
```
VITE_API_URL=http://localhost:3000/api
```

### Schritt 4: Frontend neu builden
```bash
npm run build
```

---

## 🧪 **Testen**

### Test 1: Prüfen ob Dateien existieren
```bash
ls -la /var/www/fmsv-dingden/.env*
```

**Erwartete Ausgabe:**
```
-rw-r--r-- 1 root root 123 Okt 31 12:00 .env.development
-rw-r--r-- 1 root root  89 Okt 31 12:00 .env.production
```

### Test 2: Inhalt prüfen
```bash
cat /var/www/fmsv-dingden/.env.production
cat /var/www/fmsv-dingden/.env.development
```

### Test 3: Build-Prozess prüfen
```bash
cd /var/www/fmsv-dingden
NODE_ENV=production npm run build
```

Der Build sollte die `.env.production` verwenden.

### Test 4: API-Endpoint im gebauten Code prüfen
```bash
grep -r "VITE_API_URL" /var/www/fmsv-dingden/dist/
```

Sollte nichts finden! Die Variable wird beim Build durch den tatsächlichen Wert ersetzt.

---

## 🔍 **Wie verwendet das Frontend die Werte?**

In `lib/api-client.ts`:

```typescript
// Backend URL aus Umgebungsvariable oder Default
const API_BASE_URL = (import.meta.env?.VITE_API_URL as string) || 'http://localhost:3000/api';
```

**Beim Production-Build:**
- Vite liest `.env.production`
- Findet `VITE_API_URL=/api`
- Ersetzt `import.meta.env.VITE_API_URL` durch `"/api"` im Code
- Das gebaute JavaScript enthält direkt `"/api"`

**Bei lokaler Entwicklung:**
- Vite liest `.env.development`
- Findet `VITE_API_URL=http://localhost:3000/api`
- Hot-Reload bei Änderungen

---

## ⚙️ **Andere Environment-Variablen hinzufügen**

### Schritt 1: Variable definieren

**Wichtig:** Alle Frontend-Variablen **müssen** mit `VITE_` beginnen!

```bash
# .env.production
VITE_API_URL=/api
VITE_APP_NAME=FMSV Dingden
VITE_ENABLE_DEBUG=false
```

### Schritt 2: In TypeScript verwenden
```typescript
const appName = import.meta.env.VITE_APP_NAME;
const debugMode = import.meta.env.VITE_ENABLE_DEBUG === 'true';
```

### Schritt 3: TypeScript-Typen hinzufügen

In `vite-env.d.ts`:
```typescript
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_ENABLE_DEBUG: string;
}
```

---

## 🚨 **Häufige Fehler**

### Fehler 1: "Backend nicht erreichbar"

**Ursache:** `.env.production` fehlt oder hat falschen Wert

**Lösung:**
```bash
sudo fmsv-rebuild
```

---

### Fehler 2: CORS-Fehler bei lokaler Entwicklung

**Ursache:** `.env.development` zeigt auf falsche URL

**Lösung:**
```bash
# .env.development prüfen
cat .env.development

# Sollte sein:
VITE_API_URL=http://localhost:3000/api

# Backend muss laufen!
systemctl status fmsv-backend
```

---

### Fehler 3: Variable wird nicht erkannt

**Ursache 1:** Variable beginnt nicht mit `VITE_`

❌ Falsch:
```bash
API_URL=/api  # Wird ignoriert!
```

✅ Richtig:
```bash
VITE_API_URL=/api
```

**Ursache 2:** Dev-Server wurde nicht neu gestartet

```bash
# Bei lokaler Entwicklung: Dev-Server neu starten
npm run dev
```

---

### Fehler 4: Wert wird nicht aktualisiert nach Änderung

**Bei Production:**
```bash
# Nach Änderung in .env.production:
sudo fmsv-rebuild
```

**Bei Development:**
```bash
# Dev-Server neu starten:
npm run dev
```

---

## 📚 **Backend .env (zum Vergleich)**

Das Backend hat eine separate `.env` in `/var/www/fmsv-dingden/backend/.env`:

```bash
# Server Configuration
NODE_ENV=production
PORT=3000
BASE_URL=https://fmsv.bartholmes.eu

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fmsv_database
DB_USER=fmsv_user
DB_PASSWORD=...

# JWT
JWT_SECRET=...
JWT_REFRESH_SECRET=...

# SMTP
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=...
EMAIL_FROM=noreply@fmsv.bartholmes.eu
```

**Unterschied zum Frontend:**
- Kein `VITE_` Präfix
- Wird zur Laufzeit gelesen (nicht beim Build)
- Enthält sensible Daten (Passwörter, Secrets)

---

## 📖 **Zusammenfassung**

| Aspekt | Frontend .env | Backend .env |
|--------|---------------|--------------|
| **Speicherort** | `/var/www/fmsv-dingden/` | `/var/www/fmsv-dingden/backend/` |
| **Dateien** | `.env.production`, `.env.development` | `.env` |
| **Präfix** | `VITE_` erforderlich | Kein Präfix |
| **Verwendung** | Build-Zeit | Laufzeit |
| **Wann gelesen** | Beim `npm run build` | Beim Start von `node server.js` |
| **Erstellt von** | `install.sh` oder `rebuild-frontend.sh` | `install.sh` |
| **Git** | ❌ Nicht committen | ❌ Nicht committen |
| **Vorlage** | `env.example.txt` | `backend/env.example.txt` |

---

## ✅ **Best Practices**

1. **Nie committen:** `.env*` immer in `.gitignore`
2. **Beispiel bereitstellen:** `env.example.txt` ins Repository
3. **Dokumentieren:** Was jede Variable macht
4. **Automatisieren:** Scripts erstellen die Dateien
5. **Validieren:** Beim Start prüfen ob alle Variablen gesetzt sind
6. **Sichern:** `.env` Dateien beim Backup mit sichern!

---

**Weitere Informationen:**
- **Vite Env Docs:** https://vitejs.dev/guide/env-and-mode.html
- **Frontend-Backend-Verbindung:** `Frontend-Backend-Verbindung.md`
- **Installation:** `Installation.md`
