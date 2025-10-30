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

**Das Script zeigt:**

```
⚠️  SSH-Verbindung erkannt - Browser öffnet sich nicht!

═══════════════════════════════════════════════════════════
WICHTIG - SSH/PuTTY Cloudflare Login:

  1. Die URL wird gleich unten angezeigt
  2. URL KOMPLETT kopieren (von https:// bis Ende!)
     ⚠️  URL geht über mehrere Zeilen!
  3. Browser auf deinem PC öffnen
  4. URL einfügen → Bei Cloudflare einloggen
  5. Domain wählen → "Authorize" klicken
  6. Terminal wartet bis Login fertig ist

Drücke Enter um URL anzuzeigen...
```

**Dann:**

```
▼▼▼ URL BEGINNT HIER - KOMPLETT KOPIEREN! ▼▼▼

Please open the following URL and log in with your Cloudflare 
account:

https://dash.cloudflare.com/argotunnel?callback=https%3A%2F%2F...
...lange URL...

▲▲▲ URL ENDET HIER ▲▲▲
```

**URL kopieren:**
1. In PuTTY: **Linke Maustaste** am Anfang von `https://`
2. **Gedrückt halten** und bis zum Ende ziehen
3. **Loslassen** → Automatisch kopiert!

**Browser öffnen:**
1. Browser auf **deinem PC** öffnen
2. `Strg+L` → URL einfügen (`Strg+V`)
3. Bei Cloudflare einloggen
4. Domain wählen (z.B. bartholmes.eu)
5. **"Authorize"** klicken

**Zurück zum Terminal:**
```
You have successfully logged in.
✅ Cloudflare Login erfolgreich!
```

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
