# Frontend-Backend Verbindung

Diese Anleitung erklärt, wie Frontend und Backend miteinander verbunden sind und wie du Probleme beheben kannst.

---

## 🔗 **Wie funktioniert die Verbindung?**

### Architektur-Übersicht

```
Browser (https://fmsv.bartholmes.eu)
    ↓
Cloudflare Tunnel (oder direkt)
    ↓
Nginx (Port 80)
    ├─→ /          → Frontend (dist/)
    ├─→ /api/*     → Backend (Port 3000)
    └─→ /uploads/* → Dateien (Saves/)
    ↓
Backend (Node.js auf Port 3000)
    ↓
PostgreSQL (Port 5432)
```

### API-Endpoint Konfiguration

Das Frontend verwendet **relative API-URLs** (`/api`), die von Nginx zum Backend weitergeleitet werden:

- **Frontend Build:** `.env.production` → `VITE_API_URL=/api` (wird von `install.sh` erstellt)
- **Nginx:** `/api/*` → Proxy zu `http://localhost:3000/api`
- **Backend:** Läuft auf Port 3000

**Wichtig:** Die `.env.production` und `.env.development` Dateien werden **automatisch** vom `install.sh` Script erstellt und sind **nicht** im Git-Repository!

---

## 🚨 **Problem: "Backend nicht erreichbar"**

### Symptom
Bei Login-Versuch erscheint:
> "Backend nicht erreichbar. Verwende für Offline-Tests eine E-Mail mit 'dev@' (z.B. dev@admin)."

### Ursachen & Lösungen

#### **1. Frontend wurde nicht mit Production-Settings gebaut**

**Prüfen:**
```bash
# Schaue ob .env.production existiert
cat /var/www/fmsv-dingden/.env.production
```

**Sollte enthalten:**
```
VITE_API_URL=/api
```

**Falls die Datei fehlt oder falsch ist:**
```bash
# Frontend neu builden (erstellt .env.production automatisch)
sudo fmsv-rebuild
```

Das `fmsv-rebuild` Script erstellt die `.env.production` automatisch falls sie fehlt!

---

#### **2. Backend läuft nicht**

**Prüfen:**
```bash
sudo systemctl status fmsv-backend
```

**Sollte zeigen:** `active (running)`

**Lösung - Backend starten:**
```bash
sudo systemctl start fmsv-backend
sudo systemctl enable fmsv-backend
```

**Logs ansehen:**
```bash
sudo journalctl -u fmsv-backend -n 50 -f
```

---

#### **3. Nginx-Konfiguration fehlt API-Proxy**

**Prüfen:**
```bash
cat /etc/nginx/sites-available/fmsv-dingden | grep -A 10 "location /api"
```

**Sollte enthalten:**
```nginx
location /api/ {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

**Lösung - Nginx-Config aktualisieren:**
```bash
# Backup erstellen
sudo cp /etc/nginx/sites-available/fmsv-dingden /etc/nginx/sites-available/fmsv-dingden.backup

# Config bearbeiten
sudo nano /etc/nginx/sites-available/fmsv-dingden
```

Füge den `location /api/` Block hinzu (siehe oben).

```bash
# Testen & Neu laden
sudo nginx -t
sudo systemctl reload nginx
```

---

#### **4. Port 3000 ist blockiert/belegt**

**Prüfen:**
```bash
sudo netstat -tulpn | grep :3000
```

**Sollte zeigen:** Backend-Prozess auf Port 3000

**Kein Prozess?** → Backend läuft nicht (siehe Punkt 2)

**Anderer Prozess?**
```bash
# Port-Konflikt beheben
sudo kill -9 [PID]
sudo systemctl restart fmsv-backend
```

---

#### **5. Firewall blockiert Port 3000 (intern)**

Port 3000 muss **nicht** von außen erreichbar sein (nur lokal für Nginx).

**Prüfen:**
```bash
curl http://localhost:3000/api/health
```

**Sollte antworten:** `{"status":"ok"}` oder ähnlich

**Fehler?** → Backend-Problem oder Backend läuft nicht

---

## 🧪 **Manuelle Tests**

### Test 1: Backend Health-Check
```bash
curl -v http://localhost:3000/api/health
```

**Erwartete Antwort:**
```json
{"status":"ok","timestamp":"2024-10-31T..."}
```

### Test 2: API via Nginx
```bash
curl -v http://localhost/api/health
```

**Erwartete Antwort:**
```json
{"status":"ok","timestamp":"2024-10-31T..."}
```

### Test 3: Login-Endpoint
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fmsv-dingden.de","password":"admin123"}'
```

**Erwartete Antwort:**
```json
{
  "user": {...},
  "accessToken": "...",
  "refreshToken": "..."
}
```

### Test 4: Frontend API-Call (Browser Console)
Öffne die Browser-Konsole (F12) und führe aus:
```javascript
fetch('/api/health')
  .then(r => r.json())
  .then(console.log)
```

**Erwartete Ausgabe:**
```json
{"status":"ok","timestamp":"2024-10-31T..."}
```

---

## 🔧 **Komplette Neukonfiguration**

Falls nichts hilft:

### Schritt 1: Backend neu starten
```bash
sudo systemctl stop fmsv-backend
cd /var/www/fmsv-dingden/backend
sudo -u www-data node server.js
# Prüfe auf Fehler!
# Dann Ctrl+C und:
sudo systemctl start fmsv-backend
```

### Schritt 2: Frontend neu builden
```bash
cd /var/www/fmsv-dingden
sudo ./Installation/scripts/rebuild-frontend.sh
```

### Schritt 3: Nginx neu starten
```bash
sudo systemctl restart nginx
```

### Schritt 4: Alle Services prüfen
```bash
sudo systemctl status fmsv-backend
sudo systemctl status nginx
sudo systemctl status postgresql
```

---

## 🐛 **Debugging-Tipps**

### Browser Developer Tools
1. Öffne Developer Tools (F12)
2. Gehe zu **Network**-Tab
3. Versuche Login
4. Schaue auf fehlgeschlagene Requests
5. Klicke auf Request → **Preview/Response**

**Typische Fehler:**
- `Failed to fetch` → Nginx Problem
- `404 Not Found` → Nginx Proxy-Config fehlt
- `502 Bad Gateway` → Backend läuft nicht
- `CORS Error` → Backend CORS-Config fehlt

### Backend-Logs Live
```bash
sudo journalctl -u fmsv-backend -f
```

### Nginx Error-Logs
```bash
sudo tail -f /var/log/nginx/error.log
```

### Backend Debug-Modus
```bash
# Backend .env bearbeiten
sudo nano /var/www/fmsv-dingden/backend/.env

# NODE_ENV auf development setzen
NODE_ENV=development

# Backend neu starten
sudo systemctl restart fmsv-backend

# Jetzt mehr Logs in journalctl!
```

---

## 📋 **Checkliste**

Gehe diese Punkte durch:

- [ ] `.env.production` existiert mit `VITE_API_URL=/api`
- [ ] Frontend wurde mit Production-Settings gebaut
- [ ] Backend läuft: `systemctl status fmsv-backend`
- [ ] PostgreSQL läuft: `systemctl status postgresql`
- [ ] Nginx läuft: `systemctl status nginx`
- [ ] Nginx-Config hat `/api/` Location
- [ ] Port 3000 lokal erreichbar: `curl localhost:3000/api/health`
- [ ] API via Nginx erreichbar: `curl localhost/api/health`
- [ ] Browser Console zeigt keine CORS-Fehler
- [ ] Keine 404/502 Fehler im Network-Tab

---

## 🎯 **Quick-Fix Script**

Falls du schnell alles neu starten willst:

```bash
#!/bin/bash
# Quick-Fix: Alle Services neu starten

echo "🔄 Stoppe alle Services..."
sudo systemctl stop fmsv-backend
sudo systemctl stop nginx

echo "🧹 Räume Prozesse auf..."
sudo pkill -9 node || true
sudo pkill -9 nginx || true

echo "🚀 Starte Services neu..."
sudo systemctl start postgresql
sleep 2
sudo systemctl start fmsv-backend
sleep 2
sudo systemctl start nginx

echo "✅ Services gestartet!"
sudo systemctl status fmsv-backend --no-pager
sudo systemctl status nginx --no-pager

echo ""
echo "🧪 Teste API..."
curl http://localhost:3000/api/health
echo ""
curl http://localhost/api/health
```

Speichere als `/usr/local/bin/fmsv-restart` und mache es ausführbar:
```bash
sudo chmod +x /usr/local/bin/fmsv-restart
```

Dann einfach:
```bash
sudo fmsv-restart
```

---

## 📚 **Weitere Hilfe**

- **Backend-API-Dokumentation:** `/backend/API-Dokumentation.md`
- **Installation-Logs:** `cat /var/log/fmsv-install.log`
- **Debug-Script:** `sudo fmsv-debug`

Bei weiteren Problemen:
1. Führe `sudo fmsv-debug` aus
2. Schaue in die Logs
3. Prüfe GitHub Issues

**Du hast es fast geschafft! 🚀**
