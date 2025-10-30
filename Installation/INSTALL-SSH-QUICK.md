# Schnellanleitung: Installation über SSH/PuTTY

## 🚀 In 5 Minuten installiert

### Schritt 1: Als root einloggen

```bash
su -
```

### Schritt 2: Script ausführen

```bash
cd /var/www/fmsv-dingden/Installation/scripts
chmod +x install.sh
./install.sh
```

### Schritt 3: Optionen wählen

```
1. Update-Kanal: 1 (Stable)
2. Cloudflare: j (Ja)
3. GitHub Repo: Enter (Standard)
4. Auto-Update: 1 (Täglich)
```

### Schritt 4: Datenbank konfigurieren

```
Datenbank-Name: fmsv_database (Enter)
Benutzer: fmsv_user (Enter)
Passwort: [Sicheres Passwort eingeben]
```

### Schritt 5: Cloudflare Login (bei SSH)

**Das Script zeigt zwei Optionen:**

```
⚠️  SSH-Verbindung erkannt - Browser öffnet sich nicht!

═══════════════════════════════════════════════════════════
Wähle deine Login-Methode:

  [1] Zertifikat von lokalem PC kopieren (EMPFOHLEN)
      → cloudflared auf deinem PC installieren
      → Login auf PC durchführen
      → Zertifikat zum Server kopieren

  [2] URL manuell öffnen
      → URL aus Terminal kopieren
      → Im Browser öffnen

Deine Wahl (1/2):
```

#### **OPTION 1: Lokaler PC (EMPFOHLEN)** ✅

**Auf deinem PC:**
```bash
# Windows (PowerShell als Admin)
winget install --id Cloudflare.cloudflared

# Mac
brew install cloudflared

# Linux
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
sudo chmod +x /usr/local/bin/cloudflared
```

**Login auf PC:**
```bash
cloudflared tunnel login
```
→ Browser öffnet sich automatisch
→ Bei Cloudflare einloggen
→ Domain wählen → "Authorize"

**Zertifikat zum Server kopieren (NEUES Terminal auf PC):**
```bash
# Windows
scp C:\Users\DEIN_NAME\.cloudflared\cert.pem root@DEINE_SERVER_IP:/root/.cloudflared/

# Mac/Linux
scp ~/.cloudflared/cert.pem root@DEINE_SERVER_IP:/root/.cloudflared/
```

✅ **Script erkennt Zertifikat automatisch und fährt fort!**

#### **OPTION 2: URL manuell öffnen**

Nur wenn Option 1 nicht funktioniert. Script zeigt URL zum manuellen Kopieren.

**Details:** Siehe `/Installation/CLOUDFLARE-LOKALER-PC.md`

### Schritt 6: Domain eingeben

```
Domain für Tunnel: fmsv.bartholmes.eu (Enter)
```

### Schritt 7: Fertig! ✅

```
╔════════════════════════════════════════════════════════════╗
║           🎉 Installation erfolgreich! 🎉                  ║
╚════════════════════════════════════════════════════════════╝

Website:       https://fmsv.bartholmes.eu
Test-Account:  admin@fmsv-dingden.de / admin123
```

---

## ⚠️ Wichtig nach Installation

### 1. Passwörter ändern

```bash
# Im Browser einloggen und Passwörter ändern!
https://fmsv.bartholmes.eu
```

### 2. SMTP konfigurieren

```bash
nano /var/www/fmsv-dingden/backend/.env

# Ändern:
SMTP_HOST=smtp.sendgrid.net
SMTP_PASSWORD=DEIN_API_KEY

# Service neu starten:
systemctl restart fmsv-backend
```

---

## 🛠️ Nützliche Befehle

### Status prüfen

```bash
systemctl status fmsv-backend
systemctl status nginx
systemctl status cloudflared
```

### Logs ansehen

```bash
# Backend Logs
journalctl -u fmsv-backend -f

# Installation Logs
cat /var/log/fmsv-install.log
```

### Services neu starten

```bash
systemctl restart fmsv-backend
systemctl restart nginx
systemctl restart cloudflared
```

---

## 🆘 Probleme?

### Backend startet nicht

```bash
# Logs prüfen
journalctl -u fmsv-backend -n 50

# Häufige Ursachen:
# • Datenbank nicht erreichbar
# • Port 3000 belegt
# • Fehler in .env
```

### Cloudflare Tunnel funktioniert nicht

```bash
# Status prüfen
systemctl status cloudflared

# Logs ansehen
journalctl -u cloudflared -n 50

# Neu starten
systemctl restart cloudflared
```

### Nginx zeigt 502 Bad Gateway

```bash
# Backend läuft?
systemctl status fmsv-backend

# Nginx neu starten
systemctl restart nginx
```

---

## 📚 Weitere Hilfe

- **Detaillierte Anleitung:** `/Installation/Anleitung/Installation.md`
- **Cloudflare Setup:** `/Installation/CLOUDFLARE-SSH-FIX.md`
- **Logs:** `cat /var/log/fmsv-install.log`

---

**Das war's! 🚀 Viel Erfolg mit FMSV Dingden!**
