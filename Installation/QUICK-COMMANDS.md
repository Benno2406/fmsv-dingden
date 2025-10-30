# ⚡ Quick Commands - Häufigste Befehle

## 🎯 Dein aktuelles Problem: Backend HTTP antwortet nicht

```bash
cd /var/www/fmsv-dingden/Installation/scripts && sudo ./debug.sh
# Wähle: 10 (Backend-HTTP-Problem beheben)
```

---

## 🛠️ Die 3 wichtigsten Scripts

| Problem | Befehl |
|---------|--------|
| **Irgendwas funktioniert nicht** | `cd /var/www/fmsv-dingden/Installation/scripts && sudo ./debug.sh` |
| **System aktualisieren** | `cd /var/www/fmsv-dingden/Installation/scripts && sudo ./update.sh` |
| **Neu installieren** | `cd /var/www/fmsv-dingden/Installation/scripts && sudo ./install.sh` |

---

## 📊 Status-Checks

### Backend läuft?
```bash
systemctl status fmsv-backend
```

### Alle Services prüfen
```bash
systemctl status fmsv-backend nginx postgresql
```

### Backend HTTP funktioniert?
```bash
curl http://localhost:5000/api/health
```

### Port 5000 offen?
```bash
netstat -tlnp | grep 5000
```

---

## 🔄 Services steuern

### Backend neu starten
```bash
systemctl restart fmsv-backend
```

### Alle Services neu starten
```bash
systemctl restart fmsv-backend nginx
```

### Backend stoppen
```bash
systemctl stop fmsv-backend
```

### Backend starten
```bash
systemctl start fmsv-backend
```

---

## 📋 Logs ansehen

### Backend Logs (Live)
```bash
journalctl -u fmsv-backend -f
```

### Backend Logs (letzte 50 Zeilen)
```bash
journalctl -u fmsv-backend -n 50
```

### Nginx Error Log
```bash
tail -f /var/log/nginx/error.log
```

### PostgreSQL Logs
```bash
journalctl -u postgresql -n 50
```

---

## 🔧 Quick-Fixes

### Backend startet nicht?
```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./debug.sh
# Option 2 (Quick-Fix)
```

### node_modules fehlen?
```bash
cd /var/www/fmsv-dingden/backend
npm install
systemctl restart fmsv-backend
```

### .env fehlt?
```bash
cd /var/www/fmsv-dingden/backend
cp env.example.txt .env
nano .env  # Konfigurieren!
systemctl restart fmsv-backend
```

### Backend manuell starten (Debug)
```bash
cd /var/www/fmsv-dingden/backend
sudo -u www-data node server.js
# CTRL+C zum Beenden
```

---

## 🗄️ Datenbank

### Datenbank-Verbindung testen
```bash
sudo -u postgres psql -d fmsv_dingden -c "SELECT 1;"
```

### Tabellen anzeigen
```bash
sudo -u postgres psql -d fmsv_dingden -c "\dt"
```

### PostgreSQL Status
```bash
systemctl status postgresql
```

### PostgreSQL starten
```bash
systemctl start postgresql
```

---

## ⚙️ Konfiguration

### .env bearbeiten
```bash
nano /var/www/fmsv-dingden/backend/.env
```

### .env anzeigen (ohne Secrets)
```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./debug.sh
# Option 8 (.env prüfen)
```

### Nginx Config bearbeiten
```bash
nano /etc/nginx/sites-available/fmsv-dingden
```

---

## 📦 Updates & Installation

### Dependencies aktualisieren
```bash
cd /var/www/fmsv-dingden/backend
npm install
cd ..
npm install
```

### Git Pull (neuester Code)
```bash
cd /var/www/fmsv-dingden
git pull
```

### Komplettes Update (empfohlen!)
```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./update.sh
```

---

## 🔍 Diagnose

### Vollständige Diagnose
```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./debug.sh
# Option 1 (Vollständige Diagnose)
```

### Nur HTTP-Problem
```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./debug.sh
# Option 10 (Backend-HTTP-Problem)
```

### Nur Datenbank testen
```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./debug.sh
# Option 7 (Datenbank testen)
```

---

## 🆘 Notfall-Befehle

### Backend komplett neu starten
```bash
systemctl stop fmsv-backend
sleep 5
systemctl start fmsv-backend
sleep 10
curl http://localhost:5000/api/health
```

### node_modules komplett neu
```bash
cd /var/www/fmsv-dingden/backend
rm -rf node_modules package-lock.json
npm install
systemctl restart fmsv-backend
```

### Logs löschen (bei zu vielen Logs)
```bash
journalctl --vacuum-time=7d
```

### Berechtigungen reparieren
```bash
chown -R www-data:www-data /var/www/fmsv-dingden
chmod -R 755 /var/www/fmsv-dingden
```

---

## 📊 System-Info

### Speicherplatz prüfen
```bash
df -h
```

### RAM-Nutzung
```bash
free -h
```

### CPU-Last
```bash
top -bn1 | grep "Cpu(s)"
```

### System-Version
```bash
cat /etc/os-release
```

### Node.js Version
```bash
node --version
```

### npm Version
```bash
npm --version
```

---

## 🎯 Debug-Workflow

```bash
# 1. Status prüfen
systemctl status fmsv-backend

# 2. Logs ansehen
journalctl -u fmsv-backend -n 50

# 3. HTTP testen
curl http://localhost:5000/api/health

# 4. Wenn nicht läuft: Debug Tool
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./debug.sh

# 5. Wenn immer noch nicht: Manuell starten
cd /var/www/fmsv-dingden/backend
sudo -u www-data node server.js
```

---

## 💡 Wichtigste Befehle memorieren

```bash
# Debug starten
cd /var/www/fmsv-dingden/Installation/scripts && sudo ./debug.sh

# Backend neu starten
systemctl restart fmsv-backend

# Logs ansehen
journalctl -u fmsv-backend -f

# HTTP testen
curl http://localhost:5000/api/health

# Update
cd /var/www/fmsv-dingden/Installation/scripts && sudo ./update.sh
```

**Das sind die 5 wichtigsten Befehle!**

---

## 🔗 Verweise

- **Vollständige Doku:** `/Installation/README.md`
- **Quick Start:** `/Installation/QUICK-START.md`
- **HTTP-Problem:** `/Installation/BACKEND-HTTP-PROBLEM.md`
- **Troubleshooting:** `/Installation/TROUBLESHOOTING.md`

---

**Tipp:** Speichere diese Seite als Lesezeichen! 📑
