# 🔴 Backend HTTP-Problem - Schnelllösung

## Problem

```
Teste /api/health...
✗ Endpoint antwortet nicht (Code: 000)
```

Das Backend läuft, aber antwortet nicht auf HTTP-Anfragen.

---

## ⚡ Schnelllösung (2 Minuten)

```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./debug.sh
```

**Wähle: 10** (Backend-HTTP-Problem beheben)

Das Script macht automatisch:
1. ✅ Prüft ob Backend-Service läuft
2. ✅ Prüft ob Node.js Prozess läuft
3. ✅ Prüft ob Port 5000 belegt ist
4. ✅ Testet HTTP-Verbindung
5. ✅ Zeigt Logs
6. ✅ Bietet automatischen Neustart an

---

## 🔍 Manuelle Diagnose

### Schritt 1: Service-Status prüfen

```bash
systemctl status fmsv-backend
```

**Erwartetes Ergebnis:** `Active: active (running)`

**Wenn nicht aktiv:**
```bash
systemctl start fmsv-backend
```

---

### Schritt 2: Node.js Prozess prüfen

```bash
ps aux | grep "node.*server.js"
```

**Erwartetes Ergebnis:** Ein laufender Prozess

**Wenn kein Prozess:**
```bash
journalctl -u fmsv-backend -n 50
# Zeigt warum Backend nicht startet
```

---

### Schritt 3: Port 5000 prüfen

```bash
netstat -tlnp | grep 5000
```

**Erwartetes Ergebnis:**
```
tcp   0   0   0.0.0.0:5000   0.0.0.0:*   LISTEN   1234/node
```

**Wenn Port frei ist:**
- Backend läuft nicht richtig
- Backend hört auf anderem Port
- Fehler beim Start

---

### Schritt 4: HTTP-Test

```bash
curl -v http://localhost:5000/api/health
```

**Erwartetes Ergebnis:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-30T..."
}
```

---

## 🛠️ Häufige Ursachen & Lösungen

### 1. Backend startet nicht richtig

**Symptome:**
- Service läuft, aber kein Node-Prozess
- Port 5000 ist frei

**Diagnose:**
```bash
journalctl -u fmsv-backend -n 50
```

**Häufige Fehler:**
- `Cannot find module 'dotenv'` → node_modules fehlen
- `Database connection failed` → PostgreSQL Problem
- `Port 5000 already in use` → Port belegt

**Lösung:**
```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./debug.sh
# → Option 2 (Quick-Fix)
```

---

### 2. Falscher Port in .env

**Diagnose:**
```bash
grep "^PORT=" /var/www/fmsv-dingden/backend/.env
```

**Sollte sein:**
```
PORT=5000
```

**Wenn anders:**
```bash
cd /var/www/fmsv-dingden/backend
nano .env
# Ändere PORT=5000
systemctl restart fmsv-backend
```

---

### 3. Node.js abstürzt beim Start

**Diagnose:**
```bash
cd /var/www/fmsv-dingden/backend
sudo node server.js
# Zeigt genaue Fehlermeldung
```

**Oder mit debug.sh:**
```bash
sudo ./debug.sh
# → Option 4 (Backend manuell starten)
```

**Häufige Fehler:**
- **Syntax Error:** Code-Problem
- **Module not found:** `npm install` ausführen
- **EADDRINUSE:** Port belegt → anderen Prozess beenden
- **Database error:** Datenbank prüfen

---

### 4. Firewall blockiert

**Diagnose:**
```bash
# Lokal testen
curl http://localhost:5000/api/health

# Von außen testen (falls zutreffend)
curl http://SERVER-IP:5000/api/health
```

**Wenn lokal funktioniert, aber nicht von außen:**
```bash
# Firewall-Regel hinzufügen (nur wenn nötig!)
ufw allow 5000/tcp
```

**HINWEIS:** Normalerweise sollte Port 5000 NICHT von außen erreichbar sein!
Nginx leitet auf Port 80/443 weiter.

---

### 5. Backend braucht länger zum Starten

**Symptome:**
- Service läuft
- Nach 30-60 Sekunden funktioniert es

**Das ist normal bei:**
- Erster Start
- Nach Updates
- Wenn Datenbank langsam antwortet

**Lösung:**
Einfach 30 Sekunden warten, dann erneut testen:
```bash
sleep 30
curl http://localhost:5000/api/health
```

---

## 🎯 Schritt-für-Schritt Fix

### 1. Quick-Fix versuchen (90% Erfolgsrate)

```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./debug.sh
# Wähle: 2 (Quick-Fix)
```

Warte 1 Minute, dann teste:
```bash
curl http://localhost:5000/api/health
```

---

### 2. Wenn Quick-Fix nicht hilft: HTTP-Problem beheben

```bash
sudo ./debug.sh
# Wähle: 10 (Backend-HTTP-Problem beheben)
```

Folge den Anweisungen!

---

### 3. Wenn das nicht hilft: Manueller Start

```bash
sudo ./debug.sh
# Wähle: 4 (Backend manuell starten)
```

Das zeigt dir die **genaue Fehlermeldung**!

---

### 4. Wenn immer noch nicht: Vollständige Diagnose

```bash
sudo ./debug.sh
# Wähle: 1 (Vollständige Diagnose)
```

Prüft alle 10 wichtigen Punkte!

---

## 📋 Diagnose-Checkliste

Arbeite diese Liste ab:

- [ ] Backend-Service läuft? `systemctl status fmsv-backend`
- [ ] Node.js Prozess läuft? `ps aux | grep node`
- [ ] Port 5000 belegt? `netstat -tlnp | grep 5000`
- [ ] HTTP antwortet? `curl http://localhost:5000/api/health`
- [ ] Logs zeigen Fehler? `journalctl -u fmsv-backend -n 50`
- [ ] .env vorhanden? `ls -la /var/www/fmsv-dingden/backend/.env`
- [ ] node_modules vorhanden? `ls /var/www/fmsv-dingden/backend/node_modules | wc -l` (sollte >200 sein)
- [ ] PostgreSQL läuft? `systemctl status postgresql`
- [ ] DB-Verbindung OK? (debug.sh → Option 7)

---

## 💡 Wichtige Erkenntnisse

### Normal:
- ✅ Service läuft
- ✅ Node-Prozess läuft  
- ✅ Port 5000 belegt
- ✅ HTTP Code 200

### Problem:
- ❌ Service läuft, aber Port frei
- ❌ HTTP Code 000 (keine Verbindung)
- ❌ Logs zeigen Fehler

---

## 🆘 Wenn nichts hilft

1. **Sammle Infos:**
   ```bash
   # System
   uname -a
   cat /etc/os-release
   
   # Backend Status
   systemctl status fmsv-backend
   
   # Logs
   journalctl -u fmsv-backend -n 100
   
   # Prozesse
   ps aux | grep node
   
   # Ports
   netstat -tlnp | grep 5000
   ```

2. **Backend komplett neu starten:**
   ```bash
   systemctl stop fmsv-backend
   sleep 5
   systemctl start fmsv-backend
   sleep 10
   curl http://localhost:5000/api/health
   ```

3. **Im Zweifel: Manueller Start zeigt den Fehler:**
   ```bash
   systemctl stop fmsv-backend
   cd /var/www/fmsv-dingden/backend
   sudo -u www-data node server.js
   # CTRL+C zum Beenden
   ```

---

## ✅ Erfolgreich wenn:

```bash
curl http://localhost:5000/api/health
```

**Gibt zurück:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-30T12:34:56.789Z",
  "database": "connected",
  "uptime": 123
}
```

**Und HTTP Status Code ist 200!**

---

**Erstellt:** 2025-10-30  
**Für:** Backend HTTP-Probleme (Code: 000)
