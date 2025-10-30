# Cloudflare Tunnel Login über SSH/PuTTY

Wenn du per SSH (z.B. PuTTY) verbunden bist, kann sich kein Browser öffnen. Hier sind die Lösungen.

---

## ⚠️ Problem

**Beim Ausführen von:**
```bash
cloudflared tunnel login
```

**Fehler:**
```
Failed to open browser
Cannot open browser window
```

**Ursache:** Keine grafische Oberfläche über SSH verfügbar.

---

## ✅ Lösung 1: Token auf lokalem PC erstellen (EMPFOHLEN)

### Schritt 1: Cloudflared auf deinem PC installieren

#### Windows
```powershell
# Download
https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe

# Oder mit winget:
winget install --id Cloudflare.cloudflared
```

#### macOS
```bash
brew install cloudflared
```

#### Linux (lokal)
```bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/
```

---

### Schritt 2: Login auf lokalem PC

```bash
# Windows (PowerShell/CMD)
cloudflared tunnel login

# macOS/Linux
cloudflared tunnel login
```

**Browser öffnet sich:**
1. Bei Cloudflare anmelden
2. Domain auswählen (z.B. `bartholmes.eu`)
3. Authorize klicken

**Zertifikat wird erstellt:**
- **Windows:** `%USERPROFILE%\.cloudflared\cert.pem`
- **macOS/Linux:** `~/.cloudflared/cert.pem`

---

### Schritt 3: Tunnel auf lokalem PC erstellen

```bash
# Tunnel erstellen
cloudflared tunnel create fmsv-dingden

# Tunnel-ID anzeigen
cloudflared tunnel list
```

**Ausgabe:**
```
ID                                   NAME          CREATED
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx fmsv-dingden  2025-01-15T10:30:00Z
```

**Notiere die Tunnel-ID!** (die lange UUID)

---

### Schritt 4: Credentials-Datei finden

```bash
# Windows
dir %USERPROFILE%\.cloudflared\*.json

# macOS/Linux
ls -la ~/.cloudflared/*.json
```

**Du findest:**
```
<Tunnel-ID>.json
```

---

### Schritt 5: Dateien auf Server kopieren

#### Mit SCP (von deinem PC aus):

**Windows (PowerShell):**
```powershell
# Ins .cloudflared Verzeichnis wechseln
cd $env:USERPROFILE\.cloudflared

# Dateien kopieren
scp cert.pem root@dein-server:/root/.cloudflared/
scp <Tunnel-ID>.json root@dein-server:/root/.cloudflared/
```

**macOS/Linux:**
```bash
# Ins .cloudflared Verzeichnis wechseln
cd ~/.cloudflared

# Dateien kopieren
scp cert.pem root@dein-server:/root/.cloudflared/
scp <Tunnel-ID>.json root@dein-server:/root/.cloudflared/
```

#### Mit WinSCP (Windows):

1. WinSCP öffnen und zum Server verbinden
2. Links (lokal): `C:\Users\DeinName\.cloudflared\`
3. Rechts (Server): `/root/.cloudflared/`
4. Dateien per Drag & Drop kopieren:
   - `cert.pem`
   - `<Tunnel-ID>.json`

---

### Schritt 6: Berechtigungen auf Server setzen

**Auf dem Server (SSH/PuTTY):**
```bash
# Verzeichnis erstellen falls nicht vorhanden
mkdir -p /root/.cloudflared

# Berechtigungen setzen
chmod 600 /root/.cloudflared/cert.pem
chmod 600 /root/.cloudflared/*.json
chown -R root:root /root/.cloudflared
```

---

### Schritt 7: Tunnel auf Server konfigurieren

**Config-Datei erstellen:**
```bash
nano /root/.cloudflared/config.yml
```

**Inhalt:**
```yaml
tunnel: <Tunnel-ID>
credentials-file: /root/.cloudflared/<Tunnel-ID>.json

ingress:
  - hostname: fmsv.bartholmes.eu
    service: http://localhost:3000
  - service: http_status:404
```

**Ersetze `<Tunnel-ID>`** mit deiner echten Tunnel-ID!

**Speichern:** Strg+O, Enter, Strg+X

---

### Schritt 8: DNS-Route erstellen

**Auf deinem lokalen PC** (wo du eingeloggt bist):
```bash
cloudflared tunnel route dns fmsv-dingden fmsv.bartholmes.eu
```

**Oder manuell in Cloudflare Dashboard:**
1. Cloudflare Dashboard öffnen
2. Domain auswählen
3. DNS → Add record
   - Type: `CNAME`
   - Name: `fmsv` (oder `@` für Haupt-Domain)
   - Target: `<Tunnel-ID>.cfargotunnel.com`
   - Proxy: ☑️ Proxied (Orange Cloud)

---

### Schritt 9: Tunnel auf Server starten

**Testen:**
```bash
cloudflared tunnel run fmsv-dingden
```

**Sollte zeigen:**
```
2025-01-15 10:30:00 INF Connection established
2025-01-15 10:30:00 INF Registered tunnel connection
```

**Strg+C** zum Beenden

**Als Service installieren:**
```bash
cloudflared service install
systemctl enable cloudflared
systemctl start cloudflared
systemctl status cloudflared
```

---

## ✅ Lösung 2: Token-URL manuell öffnen

### Schritt 1: URL generieren

**Auf dem Server:**
```bash
cloudflared tunnel login 2>&1 | grep "https://"
```

**Oder:**
```bash
cloudflared tunnel login
```

**Ausgabe enthält:**
```
Please open the following URL and log in with your Cloudflare account:

https://dash.cloudflare.com/argotunnel?callback=https%3A%2F%2Flogin.cloudflareaccess.org%2F....
```

---

### Schritt 2: URL kopieren

**Die komplette URL kopieren** (beginnt mit `https://dash.cloudflare.com/...`)

---

### Schritt 3: Auf lokalem PC im Browser öffnen

1. URL in Browser auf deinem PC einfügen
2. Bei Cloudflare anmelden
3. Domain auswählen
4. Authorize klicken

**Cloudflare zeigt:**
```
✓ You have successfully authorized cloudflared
```

---

### Schritt 4: Zurück zum Server

**Auf dem Server** sollte nun stehen:
```
You have successfully logged in.
cert.pem saved to /root/.cloudflared/cert.pem
```

**Prüfen:**
```bash
ls -la /root/.cloudflared/cert.pem
```

**Sollte existieren!**

---

## ✅ Lösung 3: X11-Forwarding (fortgeschritten)

### Mit PuTTY:

1. PuTTY öffnen
2. Connection → SSH → X11
3. ☑️ Enable X11 forwarding
4. Session speichern
5. Neu verbinden

### Auf Windows: Xming installieren

1. Xming herunterladen: https://sourceforge.net/projects/xming/
2. Installieren und starten
3. PuTTY mit X11-Forwarding verbinden

### Testen:
```bash
echo $DISPLAY
# Sollte etwas wie "localhost:10.0" zeigen

cloudflared tunnel login
# Browser sollte sich auf deinem PC öffnen
```

---

## 🎯 Empfohlene Lösung

**Für die meisten Nutzer: Lösung 1** (Token auf lokalem PC erstellen)

**Vorteile:**
- ✅ Einfach und zuverlässig
- ✅ Keine zusätzliche Software auf Server
- ✅ Funktioniert immer
- ✅ Sicher (Zertifikat nur lokal erstellt)

**Schritte kurz:**
1. Cloudflared auf PC installieren
2. `cloudflared tunnel login` auf PC
3. `cloudflared tunnel create fmsv-dingden` auf PC
4. Dateien (`cert.pem` + `*.json`) per SCP/WinSCP auf Server kopieren
5. Config auf Server erstellen
6. DNS-Route erstellen (auf PC oder Cloudflare Dashboard)
7. Tunnel auf Server starten

---

## 📋 Komplettes Beispiel

### Auf lokalem PC (Windows PowerShell):

```powershell
# 1. Login
cloudflared tunnel login

# 2. Tunnel erstellen
cloudflared tunnel create fmsv-dingden

# 3. Tunnel-ID notieren
cloudflared tunnel list
# Ausgabe: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# 4. DNS-Route erstellen
cloudflared tunnel route dns fmsv-dingden fmsv.bartholmes.eu

# 5. Zum .cloudflared Verzeichnis
cd $env:USERPROFILE\.cloudflared

# 6. Dateien auf Server kopieren
scp cert.pem root@dein-server:/root/.cloudflared/
scp xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.json root@dein-server:/root/.cloudflared/
```

---

### Auf dem Server (SSH/PuTTY):

```bash
# 1. Berechtigungen setzen
chmod 600 /root/.cloudflared/*
chown -R root:root /root/.cloudflared

# 2. Config erstellen
cat > /root/.cloudflared/config.yml << 'EOF'
tunnel: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
credentials-file: /root/.cloudflared/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.json

ingress:
  - hostname: fmsv.bartholmes.eu
    service: http://localhost:3000
  - service: http_status:404
EOF

# 3. Testen
cloudflared tunnel run fmsv-dingden

# 4. Als Service installieren
cloudflared service install
systemctl enable cloudflared
systemctl start cloudflared

# 5. Status prüfen
systemctl status cloudflared
```

---

## 🔍 Troubleshooting

### "cert.pem not found"

```bash
# Prüfe ob Datei existiert
ls -la /root/.cloudflared/cert.pem

# Falls nicht: Nochmal von PC kopieren
```

---

### "credentials file not found"

```bash
# Alle JSON-Dateien anzeigen
ls -la /root/.cloudflared/*.json

# Tunnel-ID muss in config.yml zur JSON-Datei passen!
```

---

### "tunnel not found"

```bash
# Auf lokalem PC: Tunnel-Liste anzeigen
cloudflared tunnel list

# Tunnel existiert? ID richtig?
```

---

### "DNS record already exists"

**Lösung 1: Cloudflare Dashboard**
```
1. Cloudflare → Domain → DNS
2. Alten CNAME/A Record für fmsv.bartholmes.eu löschen
3. Neuen CNAME erstellen (siehe Schritt 8 oben)
```

**Lösung 2: Route erneut erstellen**
```bash
# Alte Route löschen
cloudflared tunnel route dns delete <Record-ID>

# Neue Route erstellen
cloudflared tunnel route dns fmsv-dingden fmsv.bartholmes.eu
```

---

## 📚 Weitere Infos

- **Cloudflare Tunnel Docs:** https://developers.cloudflare.com/cloudflare-one/connections/connect-apps
- **Vollständige Anleitung:** [`Cloudflare-Tunnel-Setup.md`](Cloudflare-Tunnel-Setup.md)
- **Installation:** [`Installation.md`](Installation.md)

---

## ✅ Zusammenfassung

**Problem:** SSH/PuTTY kann keinen Browser öffnen

**Lösung:** Token auf lokalem PC erstellen und auf Server kopieren

**Schritte:**
1. ✅ Cloudflared auf PC installieren
2. ✅ Login auf PC (Browser funktioniert)
3. ✅ Tunnel auf PC erstellen
4. ✅ Dateien auf Server kopieren (SCP/WinSCP)
5. ✅ Config auf Server erstellen
6. ✅ Tunnel starten

**Fertig!** 🎉
