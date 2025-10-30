# Cloudflare Tunnel - Quick Guide für SSH-Nutzer

Schnellanleitung wenn der Browser sich nicht öffnet.

---

## 🎯 Problem

Du bist per **SSH/PuTTY** verbunden und `cloudflared tunnel login` öffnet keinen Browser.

---

## ✅ Lösung in 3 Schritten

### 1️⃣ Auf deinem PC (Windows/Mac/Linux)

#### Cloudflared installieren:

**Windows:**
```powershell
winget install --id Cloudflare.cloudflared
```

**macOS:**
```bash
brew install cloudflared
```

**Linux:**
```bash
# Download: https://github.com/cloudflare/cloudflared/releases
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
```

---

#### Login & Tunnel erstellen:

```bash
# Login (Browser öffnet sich)
cloudflared tunnel login

# Tunnel erstellen
cloudflared tunnel create fmsv-dingden

# Tunnel-ID anzeigen & notieren
cloudflared tunnel list
```

**Notiere die Tunnel-ID!** (z.B. `a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6`)

---

#### DNS-Route erstellen:

```bash
cloudflared tunnel route dns fmsv-dingden fmsv.bartholmes.eu
```

---

### 2️⃣ Dateien auf Server kopieren

**Finde die Dateien auf deinem PC:**
- **Windows:** `C:\Users\DeinName\.cloudflared\`
- **macOS/Linux:** `~/.cloudflared/`

**Dateien:**
- `cert.pem`
- `<Tunnel-ID>.json`

---

#### Mit SCP kopieren:

**Windows PowerShell:**
```powershell
cd $env:USERPROFILE\.cloudflared
scp cert.pem root@DEIN-SERVER:/root/.cloudflared/
scp *.json root@DEIN-SERVER:/root/.cloudflared/
```

**macOS/Linux:**
```bash
cd ~/.cloudflared
scp cert.pem root@DEIN-SERVER:/root/.cloudflared/
scp *.json root@DEIN-SERVER:/root/.cloudflared/
```

---

#### Mit WinSCP (Windows):

1. WinSCP öffnen
2. Mit Server verbinden
3. Links navigieren zu: `C:\Users\DeinName\.cloudflared\`
4. Rechts navigieren zu: `/root/.cloudflared/`
5. Dateien rüberziehen:
   - `cert.pem`
   - `*.json`

---

### 3️⃣ Auf dem Server konfigurieren

**SSH/PuTTY zum Server verbinden, dann:**

```bash
# Berechtigungen setzen
chmod 600 /root/.cloudflared/*
chown -R root:root /root/.cloudflared

# Config erstellen (Tunnel-ID ersetzen!)
cat > /root/.cloudflared/config.yml << 'EOF'
tunnel: DEINE-TUNNEL-ID
credentials-file: /root/.cloudflared/DEINE-TUNNEL-ID.json

ingress:
  - hostname: fmsv.bartholmes.eu
    service: http://localhost:3000
  - service: http_status:404
EOF

# Tunnel testen
cloudflared tunnel run fmsv-dingden

# Wenn's funktioniert: Strg+C und als Service installieren
cloudflared service install
systemctl enable cloudflared
systemctl start cloudflared

# Status prüfen
systemctl status cloudflared
```

---

## 🚀 Noch einfacher: Setup-Script

**Auf dem Server:**
```bash
cd /var/www/fmsv-dingden/Installation/scripts
chmod +x cloudflare-setup-manual.sh
./cloudflare-setup-manual.sh
```

Das Script führt dich durch alle Schritte! 🎯

---

## ✅ Checkliste

- [ ] Cloudflared auf PC installiert
- [ ] `cloudflared tunnel login` auf PC ausgeführt
- [ ] `cloudflared tunnel create fmsv-dingden` auf PC ausgeführt
- [ ] Tunnel-ID notiert
- [ ] DNS-Route erstellt (`cloudflared tunnel route dns ...`)
- [ ] `cert.pem` auf Server kopiert
- [ ] `<Tunnel-ID>.json` auf Server kopiert
- [ ] Berechtigungen gesetzt (`chmod 600`)
- [ ] `config.yml` auf Server erstellt
- [ ] Tunnel getestet
- [ ] Service installiert & gestartet
- [ ] Website erreichbar unter `https://fmsv.bartholmes.eu`

---

## 🔍 Quick-Checks

### Dateien vorhanden?

```bash
ls -la /root/.cloudflared/
```

**Sollte zeigen:**
```
-rw------- cert.pem
-rw------- <Tunnel-ID>.json
-rw------- config.yml
```

---

### Service läuft?

```bash
systemctl status cloudflared
```

**Sollte zeigen:**
```
● cloudflared.service
   Active: active (running)
```

---

### Website erreichbar?

```bash
curl -I https://fmsv.bartholmes.eu
```

**Sollte zeigen:**
```
HTTP/2 200
```

---

### Logs ansehen:

```bash
# Letzte Logs
journalctl -u cloudflared -n 50

# Live-Logs
journalctl -u cloudflared -f
```

---

## 🆘 Probleme?

### "cert.pem not found"

**Datei existiert auf PC?**
```bash
# Windows (PowerShell)
Test-Path $env:USERPROFILE\.cloudflared\cert.pem

# macOS/Linux
ls -la ~/.cloudflared/cert.pem
```

**Nochmal kopieren:**
```bash
scp ~/.cloudflared/cert.pem root@SERVER:/root/.cloudflared/
```

---

### "tunnel not found"

**Tunnel-ID richtig?**

Auf PC:
```bash
cloudflared tunnel list
```

Auf Server in `config.yml` prüfen:
```bash
cat /root/.cloudflared/config.yml
```

Beide Tunnel-IDs müssen **identisch** sein!

---

### "Connection refused" / "502 Bad Gateway"

**Backend läuft nicht!**

```bash
# Backend-Status prüfen
systemctl status fmsv-backend

# Falls nicht läuft
systemctl start fmsv-backend

# Logs ansehen
journalctl -u fmsv-backend -f
```

**Port in config.yml prüfen:**
```bash
cat /root/.cloudflared/config.yml
```

Sollte `http://localhost:3000` zeigen (oder dein Backend-Port)

---

### "DNS record already exists"

**Im Cloudflare Dashboard:**
1. https://dash.cloudflare.com
2. Domain wählen
3. DNS-Tab
4. Alten Record für `fmsv` löschen
5. Neuen CNAME erstellen:
   - Type: `CNAME`
   - Name: `fmsv`
   - Target: `<Tunnel-ID>.cfargotunnel.com`
   - Proxy: ☑️ Proxied

---

## 📚 Weitere Hilfe

| Problem | Datei |
|---------|-------|
| **Detaillierte Anleitung** | [`CLOUDFLARE-SSH-LOGIN.md`](CLOUDFLARE-SSH-LOGIN.md) |
| **Vollständiges Setup** | [`Anleitung/Cloudflare-Tunnel-Setup.md`](Anleitung/Cloudflare-Tunnel-Setup.md) |
| **Setup-Script** | [`scripts/cloudflare-setup-manual.sh`](scripts/cloudflare-setup-manual.sh) |

---

## ✅ Zusammenfassung

**Problem:** SSH/PuTTY kann keinen Browser öffnen

**Lösung:** 
1. Cloudflared auf PC installieren
2. Login + Tunnel auf PC erstellen
3. Dateien auf Server kopieren
4. Config auf Server erstellen
5. Fertig! 🎉

**Zeit:** ~10 Minuten

**Danach:** Website läuft über `https://fmsv.bartholmes.eu` ✅
