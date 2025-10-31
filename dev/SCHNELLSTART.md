# 🚀 FMSV Dingden - Development Quick Start

**Für lokale Entwicklung - Nicht für Production-Server!**

Server-Deployment → siehe [../Installation/README.md](../Installation/README.md)

---

## In 3 Befehlen starten

```bash
cd dev
./setup.sh     # Nur beim ersten Mal
./start.sh     # Startet Frontend + Backend
```

→ Frontend: http://localhost:5173  
→ Backend: http://localhost:3000

**Stoppen:** `Ctrl+C`

---

## Was macht was?

### `setup.sh` (Einmalig)

Richtet alles ein:
- ✅ Installiert Dependencies
- ✅ Erstellt .env Dateien
- ✅ Startet Datenbank (Docker)
- ✅ Initialisiert Schema
- ✅ Fügt Test-Daten ein

**Führe nur beim ersten Mal aus!**

### `start.sh` (Täglich)

Startet Development Server:
- ✅ Backend auf Port 3000
- ✅ Frontend auf Port 5173
- ✅ Hot Reload aktiviert
- ✅ Öffnet Browser

**Führe jeden Tag aus wenn du entwickelst!**

---

## Offline-Entwicklung

Du kannst ohne Backend entwickeln:

1. Starte nur Frontend:
   ```bash
   cd ..
   npm run dev
   ```

2. Login mit:
   - E-Mail: `dev@admin`
   - Passwort: (egal)

3. Frontend zeigt Test-Daten

→ Perfekt für UI-Entwicklung!

---

## Datenbank-Zugriff

### pgAdmin (Web-UI)

```bash
cd dev
docker-compose up -d

# Öffne: http://localhost:8080
# Login: dev@pgadmin.local / dev123
```

### Kommandozeile

```bash
# Docker Container
docker exec -it fmsv-dev-postgres psql -U postgres -d fmsv_dev

# Lokal
psql -U fmsv_dev_user -d fmsv_dev -h localhost
```

---

## Häufige Commands

### Dependencies aktualisieren

```bash
# Frontend
cd ..
npm install

# Backend
cd backend
npm install
```

### Datenbank zurücksetzen

```bash
cd backend
npm run init-db    # Schema neu erstellen
npm run seed       # Test-Daten neu laden
```

### Logs ansehen

```bash
# Backend
tail -f ../backend-dev.log

# Frontend
tail -f ../frontend-dev.log

# Docker
cd dev
docker-compose logs -f
```

### Ports freigeben

```bash
# Port 3000 belegt?
lsof -ti:3000 | xargs kill -9

# Port 5173 belegt?
lsof -ti:5173 | xargs kill -9
```

---

## Probleme?

### Backend startet nicht

```bash
# Datenbank läuft?
docker-compose ps

# Datenbank starten
docker-compose up -d

# .env korrekt?
cat ../backend/.env | grep DB_
```

### Frontend kann Backend nicht erreichen

```bash
# Backend läuft?
curl http://localhost:3000/api/health

# .env korrekt?
cat ../.env | grep VITE_API_URL
# Sollte sein: VITE_API_URL=http://localhost:3000/api
```

### "Cannot find module"

```bash
# Dependencies neu installieren
cd ..
rm -rf node_modules package-lock.json
npm install

cd backend
rm -rf node_modules package-lock.json
npm install
```

---

## Workflow-Tipps

### Täglich

```bash
# Morgens
cd dev
./start.sh

# Entwickeln...
# → Änderungen werden automatisch geladen

# Abends
# Ctrl+C (stoppt Server)
docker-compose down  # Optional: Stoppt DB
```

### Neues Feature

```bash
# Branch erstellen
git checkout -b feature/mein-feature

# Entwickeln & committen
git add .
git commit -m "feat: neue Funktion"

# Pushen
git push origin feature/mein-feature
```

### Testen

```bash
# Linting
npm run lint

# Type Check
npx tsc --noEmit

# Build testen
npm run build
npm run preview
```

---

## Next Steps

📚 **Ausführliche Doku:** [README.md](README.md)  
🔧 **Troubleshooting:** [TROUBLESHOOTING.md](TROUBLESHOOTING.md)  
🌐 **API Docs:** [../backend/API-Dokumentation.md](../backend/API-Dokumentation.md)  
🚀 **Production:** [../Installation/README.md](../Installation/README.md)

---

## URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | - |
| Backend API | http://localhost:3000/api | - |
| Health Check | http://localhost:3000/api/health | - |
| pgAdmin | http://localhost:8080 | dev@pgadmin.local / dev123 |
| PostgreSQL | localhost:5432 | postgres / postgres |

---

**Happy Coding! 🎉**
