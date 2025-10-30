# Cloudflare Tunnel - Komplette Anleitung

Cloudflare Tunnel (früher Argo Tunnel) ermöglicht es, deinen Server **ohne Port-Weiterleitungen** sicher mit dem Internet zu verbinden.

## 🎯 Vorteile von Cloudflare Tunnel

### ✅ Sicherheit
- **Keine offenen Ports** auf deinem Server nötig
- **Automatisches SSL/TLS** (kein Zertifikats-Management)
- **DDoS-Schutz** durch Cloudflare
- **Zero Trust** - alle Requests durch Cloudflare

### ✅ Einfachheit
- **Keine Port-Weiterleitungen** im Router
- **Keine öffentliche IP** erforderlich
- **Automatisches DNS-Setup**
- **Ein Befehl** zur Installation

### ✅ Kostenlos
- Cloudflare Tunnel ist **komplett kostenlos**
- Unbegrenzter Traffic
- Keine versteckten Kosten

---

## 📋 Voraussetzungen

1. **Cloudflare Account**
   - Kostenlos auf https://cloudflare.com registrieren
   - Domain `fmsv.bartholmes.eu` muss bei Cloudflare verwaltet werden
   - Nameserver müssen auf Cloudflare zeigen

2. **Server**
   - Debian 12 oder 13
   - Root-Zugriff
   - Keine Port-Weiterleitungen nötig!

---

## 🚀 Automatische Installation

### Option 1: Komplettes Setup mit Cloudflare Tunnel

```bash
cd /var/www/fmsv-dingden/Installation/scripts
chmod +x install-backend-cloudflare.sh
sudo ./install-backend-cloudflare.sh
```

Das Script fragt dich, ob du Cloudflare Tunnel nutzen möchtest:
- **Ja (j)**: Cloudflare Tunnel wird automatisch eingerichtet
- **Nein (n)**: Klassisches Nginx-Setup (Port-Weiterleitungen nötig)

### Was passiert automatisch?

1. ✅ Installation von `cloudflared`
2. ✅ Cloudflare Login (Browser öffnet sich)
3. ✅ Tunnel-Erstellung (`fmsv-dingden`)
4. ✅ DNS-Konfiguration (fmsv.bartholmes.eu → Tunnel)
5. ✅ Systemd Service Setup
6. ✅ Nginx für lokales Frontend-Serving
7. ✅ Backend-Konfiguration

**Fertig!** Deine Website ist über `https://fmsv.bartholmes.eu` erreichbar.

---

## 🔧 Manuelle Installation (falls gewünscht)

### Schritt 1: Cloudflared installieren

```bash
# GPG Key hinzufügen
mkdir -p --mode=0755 /usr/share/keyrings
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null

# Repository hinzufügen
echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/cloudflared.list

# Installieren
apt-get update
apt-get install cloudflared
```

### Schritt 2: Bei Cloudflare anmelden

```bash
cloudflared tunnel login
```

Ein Browser-Fenster öffnet sich:
1. Bei Cloudflare anmelden
2. Domain `fmsv.bartholmes.eu` auswählen
3. Berechtigung erteilen

Nach erfolgreicher Anmeldung:
```bash
ls -la ~/.cloudflared/cert.pem
# Sollte existieren
```

### Schritt 3: Tunnel erstellen

```bash
# Tunnel erstellen
cloudflared tunnel create fmsv-dingden

# Tunnel-ID anzeigen
cloudflared tunnel list
```

Notiere dir die **Tunnel-ID** (UUID).

### Schritt 4: Konfigurationsdatei erstellen

```bash
nano ~/.cloudflared/config.yml
```

Inhalt (ersetze `TUNNEL_ID` mit deiner ID):

```yaml
tunnel: TUNNEL_ID
credentials-file: /root/.cloudflared/TUNNEL_ID.json

ingress:
  # Frontend (statische Dateien)
  - hostname: fmsv.bartholmes.eu
    service: http://localhost:80
  
  # API Requests
  - hostname: fmsv.bartholmes.eu
    path: /api/*
    service: http://localhost:3000
  
  # Uploads
  - hostname: fmsv.bartholmes.eu
    path: /uploads/*
    service: http://localhost:80
  
  # Catch-all (404)
  - service: http_status:404
```

### Schritt 5: DNS-Routing konfigurieren

```bash
cloudflared tunnel route dns fmsv-dingden fmsv.bartholmes.eu
```

Dies erstellt automatisch einen CNAME-Eintrag bei Cloudflare.

### Schritt 6: Tunnel als Service installieren

```bash
cloudflared service install
systemctl enable cloudflared
systemctl start cloudflared
```

### Schritt 7: Status prüfen

```bash
systemctl status cloudflared
```

---

## 🏗️ Architektur mit Cloudflare Tunnel

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────────┐
│   Cloudflare    │ ← SSL/TLS, DDoS-Schutz
│   Edge Network  │
└──────┬──────────┘
       │ Verschlüsselter Tunnel
       ▼
┌─────────────────┐
│  cloudflared    │ ← Auf deinem Server
│   (Daemon)      │
└──────┬──────────┘
       │
       ├─────────────────────┐
       │                     │
       ▼                     ▼
┌─────────────┐      ┌─────────────┐
│   Nginx     │      │   Backend   │
│  (Port 80)  │      │  (Port 3000)│
│             │      │             │
│  Frontend   │      │  API        │
│  Uploads    │      │             │
└─────────────┘      └─────────────┘
```

### Traffic-Flow:

1. **User** → `https://fmsv.bartholmes.eu`
2. **Cloudflare Edge** empfängt Request
3. **Cloudflare Tunnel** leitet zu deinem Server
4. **cloudflared** entscheidet basierend auf Path:
   - `/api/*` → Backend (Port 3000)
   - `/uploads/*` → Nginx (Port 80)
   - Alles andere → Nginx (Port 80, Frontend)

---

## ⚙️ Konfiguration anpassen

### Frontend & API auf verschiedenen Domains

```yaml
ingress:
  # API auf Subdomain
  - hostname: api.fmsv.bartholmes.eu
    service: http://localhost:3000
  
  # Frontend auf Hauptdomain
  - hostname: fmsv.bartholmes.eu
    service: http://localhost:80
  
  - service: http_status:404
```

Dann DNS-Route hinzufügen:
```bash
cloudflared tunnel route dns fmsv-dingden api.fmsv.bartholmes.eu
```

### WebSocket Support

Für zukünftige WebSocket-Features:

```yaml
ingress:
  - hostname: fmsv.bartholmes.eu
    path: /api/ws/*
    service: http://localhost:3000
    originRequest:
      noTLSVerify: true
```

### Load Balancing (zukünftig)

```yaml
ingress:
  - hostname: fmsv.bartholmes.eu
    service: http_status:200
    originRequest:
      loadBalancers:
        - http://server1:3000
        - http://server2:3000
```

---

## 🔍 Monitoring & Debugging

### Status prüfen

```bash
# Service Status
systemctl status cloudflared

# Läuft der Tunnel?
cloudflared tunnel info fmsv-dingden

# Tunnel-Liste
cloudflared tunnel list

# DNS-Routen
cloudflared tunnel route dns list
```

### Logs ansehen

```bash
# Live-Logs
journalctl -u cloudflared -f

# Letzte 100 Zeilen
journalctl -u cloudflared -n 100

# Seit heute
journalctl -u cloudflared --since today
```

### Häufige Log-Meldungen

**Erfolgreiche Verbindung:**
```
Connection established successfully
Registered tunnel connection
```

**Kein Service erreichbar:**
```
error="dial tcp 127.0.0.1:3000: connect: connection refused"
```
→ Backend läuft nicht! `systemctl start fmsv-backend`

---

## 🔧 Troubleshooting

### Tunnel startet nicht

```bash
# Logs prüfen
journalctl -u cloudflared -f

# Häufige Ursachen:
# 1. config.yml fehlerhaft
cat ~/.cloudflared/config.yml

# 2. Credentials fehlen
ls -la ~/.cloudflared/*.json

# 3. Tunnel existiert nicht
cloudflared tunnel list
```

### Website nicht erreichbar

```bash
# DNS propagiert?
dig fmsv.bartholmes.eu

# Sollte CNAME zu *.cfargotunnel.com zeigen

# Cloudflare Dashboard prüfen:
# DNS → fmsv.bartholmes.eu → sollte CNAME sein

# Tunnel läuft?
systemctl status cloudflared
```

### 502 Bad Gateway

```bash
# Backend läuft?
systemctl status fmsv-backend

# Port erreichbar?
curl http://localhost:3000/api/health

# Nginx läuft?
systemctl status nginx

# Port 80 erreichbar?
curl http://localhost/
```

### Tunnel neu erstellen

```bash
# Alten Tunnel löschen
cloudflared tunnel delete fmsv-dingden

# Neu erstellen
cloudflared tunnel create fmsv-dingden

# DNS neu routen
cloudflared tunnel route dns fmsv-dingden fmsv.bartholmes.eu

# Service neu starten
systemctl restart cloudflared
```

---

## 🎛️ Management

### Tunnel neu starten

```bash
systemctl restart cloudflared
```

### Tunnel stoppen

```bash
systemctl stop cloudflared
```

### Tunnel deaktivieren

```bash
systemctl disable cloudflared
```

### Config neu laden

```bash
systemctl reload cloudflared
```

### Tunnel löschen

```bash
# Service stoppen
systemctl stop cloudflared
systemctl disable cloudflared

# Tunnel löschen
cloudflared tunnel delete fmsv-dingden

# DNS-Route löschen (manuell in Cloudflare Dashboard)
```

---

## 🔐 Sicherheit

### Best Practices

1. **Credentials schützen**
   ```bash
   chmod 600 ~/.cloudflared/*.json
   ```

2. **Service-User verwenden** (optional)
   ```bash
   # Erstelle User
   useradd -r -s /bin/false cloudflared
   
   # Verschiebe Config
   mkdir -p /etc/cloudflared
   mv ~/.cloudflared/* /etc/cloudflared/
   chown -R cloudflared:cloudflared /etc/cloudflared
   
   # Service anpassen
   # User=cloudflared in systemd-Service
   ```

3. **Firewall konfigurieren**
   ```bash
   # NUR ausgehende Verbindungen erlauben
   # Keine eingehenden Ports nötig!
   ufw default deny incoming
   ufw default allow outgoing
   ufw allow 22/tcp  # SSH
   ufw enable
   ```

4. **Logs rotieren**
   ```bash
   nano /etc/systemd/journald.conf
   ```
   ```ini
   [Journal]
   SystemMaxUse=500M
   MaxFileSec=7day
   ```

---

## 📊 Cloudflare Dashboard

### Tunnel-Übersicht

1. Cloudflare Dashboard → **Zero Trust**
2. **Access** → **Tunnels**
3. Hier siehst du:
   - Tunnel-Status (Active/Inactive)
   - Traffic-Statistiken
   - Verbindungen
   - Health Status

### DNS-Einträge

1. Cloudflare Dashboard → **DNS**
2. Du solltest sehen:
   ```
   Type: CNAME
   Name: fmsv.bartholmes.eu
   Content: <tunnel-id>.cfargotunnel.com
   Proxy: Proxied (Orange Cloud)
   ```

---

## 🆚 Vergleich: Cloudflare Tunnel vs. Nginx

| Feature | Cloudflare Tunnel | Nginx + Port-Forwarding |
|---------|-------------------|-------------------------|
| **Port-Weiterleitungen** | ❌ Nicht nötig | ✅ Nötig (80, 443) |
| **Öffentliche IP** | ❌ Nicht nötig | ✅ Nötig |
| **SSL-Zertifikat** | ✅ Automatisch | ⚠️ Über Cloudflare |
| **DDoS-Schutz** | ✅ Inklusive | ⚠️ Über Cloudflare |
| **Setup-Zeit** | 5 Minuten | 15-30 Minuten |
| **Komplexität** | ⭐⭐ | ⭐⭐⭐⭐ |
| **Kosten** | Kostenlos | Kostenlos |
| **Performance** | ⚡ Sehr gut | ⚡ Sehr gut |
| **Monitoring** | ✅ Dashboard | ⚠️ Manuell |

**Empfehlung für FMSV:**
- 🏆 **Cloudflare Tunnel** - Einfacher, sicherer, keine Port-Probleme
- ⚙️ **Nginx** - Nur wenn du bereits Port-Weiterleitungen hast

---

## 🔄 Updates

### Cloudflared aktualisieren

```bash
apt-get update
apt-get upgrade cloudflared

# Service neu starten
systemctl restart cloudflared
```

### Breaking Changes

Cloudflare informiert über Breaking Changes:
- Per E-Mail
- Im Dashboard
- In Release Notes: https://github.com/cloudflare/cloudflared/releases

---

## 📚 Weitere Ressourcen

- **Offizielle Dokumentation**: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- **GitHub**: https://github.com/cloudflare/cloudflared
- **Community Forum**: https://community.cloudflare.com/

---

## 🎉 Zusammenfassung

**Mit Cloudflare Tunnel:**
- ✅ Keine Port-Weiterleitungen
- ✅ Automatisches SSL
- ✅ DDoS-Schutz
- ✅ Einfaches Setup
- ✅ Kostenlos

**Installation:**
```bash
sudo ./install-backend-cloudflare.sh
# "Ja" bei Cloudflare Tunnel wählen
# Bei Cloudflare anmelden
# Fertig!
```

**Deine Website ist dann erreichbar unter:**
`https://fmsv.bartholmes.eu` ✈️

---

**Viel Erfolg!** Bei Fragen siehe Troubleshooting-Sektion.
