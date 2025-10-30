# 🔥 BACKEND MODULES FEHLEN - JETZT INSTALLIEREN!

## ⚡ DAS IST DAS PROBLEM!

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'dotenv'
```

**Die `node_modules` sind nicht installiert!** Das ist warum das Backend nicht startet.

---

## ✅ LÖSUNG (2 Befehle)

### Option 1: Mit Script (empfohlen)

```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo chmod +x install-modules.sh
sudo ./install-modules.sh
```

### Option 2: Manuell (direkt)

```bash
cd /var/www/fmsv-dingden/backend
sudo npm install
```

Das war's! 🎉

---

## 🔍 Was passiert?

`npm install` liest die `package.json` und installiert:
- ✅ express (Webserver)
- ✅ dotenv (Umgebungsvariablen)
- ✅ pg (PostgreSQL)
- ✅ winston (Logging)
- ✅ helmet (Security)
- ✅ cors (API)
- ✅ compression (Performance)
- ✅ ... und viele mehr

**Dauer:** 2-5 Minuten

---

## 📊 Nach der Installation

1. **Prüfe ob Module installiert wurden:**
   ```bash
   ls /var/www/fmsv-dingden/backend/node_modules | wc -l
   ```
   ☝️ Sollte > 200 zeigen

2. **Starte Backend:**
   ```bash
   sudo systemctl restart fmsv-backend
   ```

3. **Prüfe Status:**
   ```bash
   sudo systemctl status fmsv-backend
   ```

4. **Teste HTTP:**
   ```bash
   curl http://localhost:5000/api/health
   ```
   ☝️ Sollte: `{"status":"ok",...}` zurückgeben

---

## ❓ Warum waren die Module nicht installiert?

Mögliche Gründe:
- `npm install` wurde während Installation übersprungen
- Internet-Verbindung war unterbrochen
- Fehlende Schreibrechte
- `package.json` wurde nach Installation geändert

---

## 🆘 npm install schlägt fehl?

### Fehler: "npm: command not found"

```bash
# Node.js ist nicht installiert
sudo apt update
sudo apt install -y nodejs npm
```

### Fehler: "EACCES: permission denied"

```bash
# Führe als root aus
sudo npm install
```

### Fehler: "network error"

```bash
# Prüfe Internet
ping registry.npmjs.org

# Versuche anderen npm Registry Mirror
npm config set registry https://registry.npmjs.org/
```

### Fehler: "package.json nicht gefunden"

```bash
# Falsches Verzeichnis - wechsle ins Backend
cd /var/www/fmsv-dingden/backend
ls package.json  # Sollte existieren
```

---

## 🎯 Zusammenfassung

**Problem:** `node_modules` fehlen  
**Lösung:** `npm install` ausführen  
**Dauer:** 2-5 Minuten  
**Dann:** Backend neu starten

---

## 🔄 One-Liner (alles auf einmal)

```bash
cd /var/www/fmsv-dingden/backend && sudo npm install && sudo systemctl restart fmsv-backend && systemctl status fmsv-backend
```

☝️ Kopieren, einfügen, Enter drücken, fertig!

---

**Erstellt:** 2025-10-30  
**Zweck:** node_modules installieren - DAS fehlende Puzzle-Teil!
