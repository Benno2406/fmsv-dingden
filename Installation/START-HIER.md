# 🚀 BACKEND STARTET NICHT? START HIER!

## ⚡ Schnellste Lösung (1 Befehl)

Kopiere das und führe es aus:

```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo chmod +x quick-fix.sh
sudo ./quick-fix.sh
```

**Das macht es:**
- ✓ Prüft .env
- ✓ Prüft PostgreSQL  
- ✓ Prüft Datenbank
- ✓ Prüft node_modules
- ✓ Prüft Port
- ✓ Testet Server-Start
- ✓ Behebt Probleme automatisch!

---

## 🔍 Fehler manuell finden (wenn Quick Fix nicht hilft)

### Option 1: Manueller Start (zeigt ALLE Fehler)

```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo chmod +x manual-start.sh
sudo ./manual-start.sh
```

👆 **DAS ZEIGT DEN ECHTEN FEHLER!**

Der Server wird DIREKT gestartet (nicht über systemd), und du siehst ALLE Fehlermeldungen im Klartext.

### Option 2: Schritt-für-Schritt Debug

```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo chmod +x simple-debug.sh
sudo ./simple-debug.sh
```

Prüft jeden einzelnen Schritt und zeigt wo das Problem ist.

### Option 3: Log-Analyse

```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo chmod +x show-real-error.sh
sudo ./show-real-error.sh
```

Zeigt alle Logs und macht einen Neustart-Test.

---

## 📋 Alle Scripts ausführbar machen

Falls du "Permission denied" bekommst:

```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo chmod +x *.sh
```

---

## 🎯 Nach der Installation - Global verfügbare Befehle

Nach dem `install.sh` sind diese Befehle überall verfügbar:

```bash
# Probleme automatisch beheben
sudo fmsv-fix

# Backend manuell starten (zeigt Fehler)
sudo fmsv-manual

# Vollständige Diagnose
sudo fmsv-debug

# Backend testen
sudo fmsv-test

# Fehler anzeigen
sudo fmsv-errors

# System updaten
sudo fmsv-update
```

---

## 💡 Häufigste Probleme (90% aller Fälle)

### 1. .env fehlt
```bash
cd /var/www/fmsv-dingden/backend
sudo cp env.example.txt .env
sudo nano .env
# Fülle ALLE Werte aus!
sudo systemctl restart fmsv-backend
```

### 2. PostgreSQL läuft nicht
```bash
sudo systemctl start postgresql
sudo systemctl restart fmsv-backend
```

### 3. Datenbank existiert nicht
```bash
sudo -u postgres psql
CREATE DATABASE fmsv_database;
CREATE USER fmsv_user WITH PASSWORD 'dein-passwort';
GRANT ALL PRIVILEGES ON DATABASE fmsv_database TO fmsv_user;
\q

cd /var/www/fmsv-dingden/backend
node scripts/initDatabase.js
```

---

## 🆘 Wenn nichts funktioniert

1. **Starte `fmsv-manual`** und kopiere die komplette Ausgabe
2. **Sende mir die Ausgabe**
3. **Oder führe aus:**
   ```bash
   sudo fmsv-manual > ~/fehler.txt 2>&1
   cat ~/fehler.txt
   ```

---

## ✅ Erfolgreich? So testest du:

```bash
# Service Status
sudo systemctl status fmsv-backend

# HTTP Test
curl http://localhost:5000/api/health

# Live Logs
sudo journalctl -u fmsv-backend -f
```

Sollte zurückgeben:
```json
{"status":"ok","timestamp":"...","uptime":...}
```

---

**Erstellt:** 2025-10-30  
**Zweck:** Schnellste Lösung für Backend-Start-Probleme  
**Motto:** Nicht raten - SEHEN was falsch ist!
