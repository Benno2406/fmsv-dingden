# Installations-Hilfe

Häufige Fragen und Probleme während der Installation.

---

## ❓ Script wartet auf Eingabe - Was tun?

### Das siehst du:
```
Installation mit diesen Einstellungen starten? (J/n) :
```

### Was bedeutet das?

Das Script zeigt dir die Einstellungen an und wartet auf deine Bestätigung.

### Was musst du tun?

**Option 1: Installation starten**
```
J
```
Dann `Enter` drücken.

**Option 2: Installation abbrechen**
```
n
```
Dann `Enter` drücken.

### Weitere Eingaben während Installation

Das Script fragt dich nach verschiedenen Informationen:

#### 1. Domain/Subdomain
```
Domain oder Subdomain (z.B. fmsv-dingden.de): 
```
**Eingabe:** `deine-domain.de` + Enter

#### 2. GitHub Repository URL
```
GitHub Repository URL (https://github.com/...): 
```
**Eingabe:** `https://github.com/dein-username/fmsv-dingden.git` + Enter

#### 3. GitHub Personal Access Token
```
GitHub Personal Access Token: 
```
**Eingabe:** `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` + Enter

**Wichtig:** Der Token wird beim Tippen **nicht angezeigt** (aus Sicherheitsgründen)!

#### 4. Update-Branch
```
Update-Branch (main/testing) [main]: 
```
**Eingaben:**
- `main` + Enter (für Production-Server)
- `testing` + Enter (für Test-Server)
- Nur Enter (verwendet default: main)

#### 5. Auto-Update Intervall
```
Auto-Update Intervall:
1) Täglich (03:00 Uhr)
2) Wöchentlich (Sonntag 03:00 Uhr)
3) Monatlich (1. des Monats 03:00 Uhr)
Wähle (1-3) [1]: 
```
**Eingaben:**
- `1` + Enter (täglich)
- `2` + Enter (wöchentlich)
- `3` + Enter (monatlich)
- Nur Enter (verwendet default: täglich)

#### 6. E-Mail für Benachrichtigungen
```
E-Mail für Benachrichtigungen (optional): 
```
**Eingaben:**
- `deine@email.de` + Enter
- Nur Enter (überspringen)

---

## 🚫 Script bricht ab / beendet sich

### Script beendet sich nach "Aktualisiere Paket-Listen"

**Ursachen:**
1. **apt update schlägt fehl** - Repository-Probleme
2. **Netzwerk-Problem** - Keine Verbindung zu den Repositories
3. **DNS-Problem** - Kann Hostnamen nicht auflösen
4. **Alte Debian-Version** - Veraltete Repositories

**Lösung:**

#### 1. Debug-Script ausführen
```bash
cd /var/www/fmsv-dingden/Installation/scripts
chmod +x debug-install.sh
sudo ./debug-install.sh
```

Das zeigt dir genau, was das Problem ist!

#### 2. Logs ansehen
```bash
cat /var/log/fmsv-install.log
```

#### 3. Manuell apt update testen
```bash
sudo apt-get update
```

Falls Fehler angezeigt werden:

**Fehler: "NO_PUBKEY"**
```bash
# Beispiel: NO_PUBKEY 1234567890ABCDEF
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 1234567890ABCDEF
sudo apt-get update
```

**Fehler: "Failed to fetch"**
```bash
# DNS auf Google DNS umstellen
sudo nano /etc/resolv.conf
# Hinzufügen/Ersetzen:
nameserver 8.8.8.8
nameserver 8.8.4.4

# Erneut versuchen
sudo apt-get update
```

**Fehler: "Release file expired"**
```bash
# Bei alten Debian-Versionen
sudo apt-get update -o Acquire::Check-Valid-Until=false
```

#### 4. Installation neu starten
```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./install.sh
```

---

## 🚫 Script scheint zu "hängen"

### Mögliche Ursachen:

#### 1. **Wartet auf Eingabe**
**Symptom:** Cursor blinkt, nichts passiert

**Lösung:** Scrolle nach oben, suche nach Frage/Prompt

**Beispiel:**
```
GitHub Repository URL: _
```
→ URL eingeben + Enter

---

#### 2. **Lädt Pakete herunter**
**Symptom:** 
```
npm install
```
Scheint ewig zu dauern

**Lösung:** Warten! `npm install` kann 2-5 Minuten dauern.

**Fortschritt ansehen (neues Terminal):**
```bash
# Prozesse prüfen
ps aux | grep npm

# Netzwerk-Aktivität
sudo nethogs
```

---

#### 3. **PostgreSQL-Setup**
**Symptom:** 
```
Richte PostgreSQL ein...
```
Lange Pause

**Lösung:** PostgreSQL-Installation dauert 1-2 Minuten. Warten!

---

## 🔍 Script-Ausgabe verstehen

### Grüne Meldungen ✅
```
[OK] PostgreSQL installiert
```
→ Alles gut!

### Blaue Meldungen ℹ️
```
[INFO] Installiere Node.js...
```
→ Information, kein Fehler

### Gelbe Meldungen ⚠️
```
[WARNUNG] .env Datei existiert bereits
```
→ Beachten, aber kein kritischer Fehler

### Rote Meldungen ❌
```
[FEHLER] Installation fehlgeschlagen!
```
→ Problem! Siehe Logs.

---

## 📝 Logs ansehen

### Während Installation
```bash
# Neues Terminal öffnen
tail -f /var/log/fmsv-install.log
```

### Nach Installation
```bash
# Installations-Log
cat /var/log/fmsv-install.log

# Auto-Update Log
tail -f /var/log/fmsv-auto-update.log

# PM2 Logs
pm2 logs

# Nginx Logs
tail -f /var/log/nginx/error.log
```

---

## 🛑 Installation abbrechen

### Während Input-Abfrage
```
Strg + C
```

### Während Installation
```
Strg + C
```
**Dann:**
```bash
# Aufräumen (falls nötig)
sudo rm -rf /var/www/fmsv-dingden
sudo systemctl stop postgresql
sudo apt remove --purge postgresql
```

---

## 🔄 Installation neu starten

```bash
# 1. Aufräumen
sudo rm -rf /var/www/fmsv-dingden
cd /var/www

# 2. Neu klonen
sudo git clone https://github.com/dein-username/fmsv-dingden.git
cd fmsv-dingden

# 3. Dateien umbenennen
sudo ./rename-files.sh

# 4. Installation neu starten
cd Installation/scripts
sudo ./install.sh
```

---

## ❌ Häufige Fehler

### Fehler: "Permission denied"
```
bash: ./install.sh: Permission denied
```

**Lösung:**
```bash
chmod +x install.sh
sudo ./install.sh
```

### Fehler: "Git not found"
```
bash: git: command not found
```

**Lösung:**
```bash
sudo apt update
sudo apt install git
```

### Fehler: "Cannot connect to GitHub"
```
fatal: unable to access 'https://github.com/...': Could not resolve host
```

**Lösung:**
```bash
# Internet-Verbindung prüfen
ping google.com

# DNS prüfen
nslookup github.com

# Falls DNS-Problem:
sudo nano /etc/resolv.conf
# Hinzufügen: nameserver 8.8.8.8
```

### Fehler: "PostgreSQL installation failed"
```
E: Unable to locate package postgresql
```

**Lösung:**
```bash
# Repositories aktualisieren
sudo apt update
sudo apt upgrade

# Erneut versuchen
sudo apt install postgresql
```

### Fehler: "Port 3001 already in use"
```
Error: listen EADDRINUSE :::3001
```

**Lösung:**
```bash
# Welcher Prozess?
sudo lsof -i :3001

# Prozess beenden
sudo kill -9 <PID>

# Oder anderen Port wählen
nano backend/.env
# PORT=3002
```

---

## ✅ Installation erfolgreich?

### Prüfungen nach Installation:

```bash
# 1. Services laufen?
pm2 status
# Sollte zeigen: fmsv-backend, fmsv-frontend (online)

# 2. Nginx läuft?
sudo systemctl status nginx
# Sollte zeigen: active (running)

# 3. PostgreSQL läuft?
sudo systemctl status postgresql
# Sollte zeigen: active (running)

# 4. Cloudflare Tunnel läuft?
sudo systemctl status cloudflared
# Sollte zeigen: active (running)

# 5. Auto-Update aktiv?
systemctl status fmsv-auto-update.timer
# Sollte zeigen: active (waiting)

# 6. Website erreichbar?
curl http://localhost
# Sollte HTML zurückgeben

# 7. API erreichbar?
curl http://localhost:3001/api/health
# Sollte JSON zurückgeben: {"status":"ok"}
```

### Browser-Test
```
https://deine-domain.de
```
→ Homepage sollte laden

---

## 🆘 Immer noch Probleme?

### 1. Logs sammeln
```bash
# Alle Logs in eine Datei
cat /var/log/fmsv-install.log > ~/installation-debug.log
pm2 logs --lines 100 >> ~/installation-debug.log
sudo journalctl -u nginx --lines 100 >> ~/installation-debug.log
systemctl status postgresql >> ~/installation-debug.log
```

### 2. Datei ansehen
```bash
cat ~/installation-debug.log
```

### 3. Detaillierte Installation
Siehe: [`Installation.md`](Anleitung/Installation.md)

### 4. Manuelle Installation
Falls Script nicht funktioniert: Schritt-für-Schritt in [`Installation.md`](Anleitung/Installation.md)

---

## 📚 Weitere Hilfe

| Problem | Dokumentation |
|---------|---------------|
| **Installation allgemein** | [`Installation.md`](Anleitung/Installation.md) |
| **GitHub Setup** | [`GitHub-Setup.md`](Anleitung/GitHub-Setup.md) |
| **Cloudflare Tunnel** | [`Cloudflare-Tunnel-Setup.md`](Anleitung/Cloudflare-Tunnel-Setup.md) |
| **E-Mail Setup** | [`E-Mail-Setup.md`](Anleitung/E-Mail-Setup.md) |
| **Auto-Update** | [`Auto-Update-System.md`](Anleitung/Auto-Update-System.md) |
| **Quick Reference** | [`QUICK-REFERENCE.md`](../QUICK-REFERENCE.md) |

---

## 💡 Tipps

### Tipp 1: Zweites Terminal öffnen
Während Installation läuft:
```bash
# Terminal 1: Installation
sudo ./install.sh

# Terminal 2: Logs ansehen
tail -f /var/log/fmsv-install.log
```

### Tipp 2: Screen/Tmux verwenden
Falls SSH-Verbindung abbricht:
```bash
# Screen starten
screen -S fmsv-install

# Installation starten
sudo ./install.sh

# Detach: Strg+A, dann D
# Reattach: screen -r fmsv-install
```

### Tipp 3: Vorher Prüfen
```bash
# System aktuell?
sudo apt update && sudo apt upgrade

# Genug Speicher?
df -h

# Richtige Debian-Version?
cat /etc/os-release
```

---

**Bei Fragen:** Siehe Dokumentation oder GitHub Issues

**Viel Erfolg!** 🚀
