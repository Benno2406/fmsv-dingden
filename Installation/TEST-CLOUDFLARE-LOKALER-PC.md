# Test: Cloudflare Login mit lokalem PC

## ✅ Test-Checkliste

Nutze diese Checkliste um sicherzustellen, dass alles funktioniert.

---

## 📋 Vor dem Test

- [ ] Du hast SSH/PuTTY-Zugriff zum Server
- [ ] Du hast einen lokalen PC (Windows, Mac oder Linux)
- [ ] Du hast Zugriff auf deinen Cloudflare Account
- [ ] Du kennst die IP-Adresse deines Servers

---

## 🧪 Test-Ablauf

### Schritt 1: Server-Vorbereitung

```bash
# Als root einloggen
su -

# Zum Script-Verzeichnis
cd /var/www/fmsv-dingden/Installation/scripts

# Script ausführbar machen
chmod +x install.sh

# Installation starten
./install.sh
```

**Erwartet:**
```
╔════════════════════════════════════════════════════════════╗
║        🛩️  FMSV Dingden - Installation  ✈️                 ║
╚════════════════════════════════════════════════════════════╝

ℹ️  Willkommen zur automatischen Installation!
```

- [ ] Banner wird angezeigt
- [ ] Script startet ohne Fehler

---

### Schritt 2: Optionen wählen

```
1️⃣  Update-Kanal wählen:
   [1] Stable
   [2] Testing

►  Deine Wahl (1/2):
```

**Eingabe:** `1` (Stable)

- [ ] Eingabe wird akzeptiert

```
2️⃣  Cloudflare Tunnel:
   Vorteile:
   ✅ Keine Port-Weiterleitungen nötig
   ...

►  Cloudflare Tunnel einrichten? (j/n):
```

**Eingabe:** `j` (Ja)

- [ ] Eingabe wird akzeptiert
- [ ] Script fährt fort

---

### Schritt 3: Cloudflare Login - Auswahl

Nach der Cloudflare-Installation erscheint:

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

═══════════════════════════════════════════════════════════

Deine Wahl (1/2):
```

**Eingabe:** `1` (Lokaler PC)

- [ ] Auswahl wird angezeigt
- [ ] Beide Optionen sind lesbar
- [ ] Eingabe funktioniert

---

### Schritt 4: cloudflared auf PC installieren

**Das Script zeigt:**

```
╔═══════════════════════════════════════════════════════════╗
║  Cloudflare Login auf lokalem PC (Windows/Mac/Linux)     ║
╚═══════════════════════════════════════════════════════════╝

SCHRITT 1: cloudflared auf deinem PC installieren

  Windows:
  1. Öffne PowerShell als Administrator
  2. winget install --id Cloudflare.cloudflared

  Mac:
  brew install cloudflared

  Linux:
  wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
  sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
  sudo chmod +x /usr/local/bin/cloudflared

Drücke Enter wenn cloudflared installiert ist...
```

**Auf deinem PC (Windows PowerShell als Admin):**
```powershell
winget install --id Cloudflare.cloudflared
```

**Oder Mac:**
```bash
brew install cloudflared
```

**Prüfen:**
```bash
cloudflared --version
```

**Erwartet:** `cloudflared version 2024.X.X`

- [ ] Installations-Anleitung wird angezeigt
- [ ] cloudflared lässt sich installieren
- [ ] Version kann abgefragt werden

**Im Server-Terminal:**
- [ ] Script wartet auf Enter
- [ ] Nach Enter geht es weiter

---

### Schritt 5: Login auf PC durchführen

**Das Script zeigt:**

```
SCHRITT 2: Login auf deinem PC durchführen

  Führe auf deinem PC im Terminal/CMD aus:

  cloudflared tunnel login

  → Browser öffnet sich automatisch
  → Bei Cloudflare einloggen
  → Domain wählen (z.B. bartholmes.eu)
  → "Authorize" klicken
  → "Success" Meldung erscheint

Drücke Enter wenn Login erfolgreich war...
```

**Auf deinem PC (Terminal/CMD):**
```bash
cloudflared tunnel login
```

**Erwartet:**
- Browser öffnet sich automatisch
- Cloudflare Login-Seite erscheint
- Nach Login: Domain-Auswahl
- Nach "Authorize": Success-Meldung

**Im Terminal/CMD:**
```
You have successfully logged in.
If you wish to copy your credentials to a server, they have 
been saved to:
C:\Users\DEIN_NAME\.cloudflared\cert.pem  (Windows)
~/.cloudflared/cert.pem                    (Mac/Linux)
```

- [ ] Browser öffnet sich automatisch
- [ ] Login funktioniert
- [ ] Domain kann gewählt werden
- [ ] "Authorize" Button sichtbar
- [ ] Success-Meldung erscheint
- [ ] Zertifikat-Pfad wird angezeigt

**Im Server-Terminal:**
- [ ] Script wartet auf Enter
- [ ] Nach Enter geht es weiter

---

### Schritt 6: Zertifikat-Pfad finden

**Das Script zeigt:**

```
SCHRITT 3: Zertifikat-Pfad finden

  Das Zertifikat liegt hier:

  Windows:
  C:\Users\DEIN_NAME\.cloudflared\cert.pem

  Mac/Linux:
  ~/.cloudflared/cert.pem

Drücke Enter um fortzufahren...
```

**Auf deinem PC prüfen:**

```powershell
# Windows PowerShell
Test-Path "C:\Users\$env:USERNAME\.cloudflared\cert.pem"
# Sollte: True

# Mac/Linux
ls -la ~/.cloudflared/cert.pem
# Sollte: Datei existiert
```

- [ ] Pfade werden angezeigt
- [ ] Zertifikat existiert auf PC
- [ ] Dateigröße > 0 Bytes

**Im Server-Terminal:**
- [ ] Script wartet auf Enter
- [ ] Nach Enter geht es weiter

---

### Schritt 7: Server-IP finden

**Auf dem Server (NEUES SSH-Fenster):**
```bash
hostname -I
```

**Erwartet:** `192.168.1.100` (oder ähnlich)

- [ ] IP-Adresse wird angezeigt
- [ ] IP-Adresse notiert

---

### Schritt 8: Zertifikat zum Server kopieren

**Das Script zeigt:**

```
SCHRITT 4: Zertifikat zum Server kopieren

  Öffne ein NEUES Terminal/CMD auf deinem PC und führe aus:

  Windows (PowerShell):
  scp C:\Users\DEIN_NAME\.cloudflared\cert.pem root@DEINE_SERVER_IP:/root/.cloudflared/

  Mac/Linux:
  scp ~/.cloudflared/cert.pem root@DEINE_SERVER_IP:/root/.cloudflared/

  ⚠️  Ersetze DEINE_SERVER_IP mit deiner echten Server-IP!

  Warte auf Zertifikat...
```

**Auf deinem PC (NEUES Terminal/CMD):**

```powershell
# Windows (ersetze DEIN_NAME und SERVER_IP!)
scp C:\Users\DEIN_NAME\.cloudflared\cert.pem root@192.168.1.100:/root/.cloudflared/

# Mac/Linux (ersetze SERVER_IP!)
scp ~/.cloudflared/cert.pem root@192.168.1.100:/root/.cloudflared/
```

**Erwartet:**
```
root@192.168.1.100's password: [PASSWORT EINGEBEN]
cert.pem                                    100%  1234     1.2KB/s   00:01
```

- [ ] scp-Befehl funktioniert
- [ ] Passwort-Abfrage erscheint
- [ ] Passwort kann eingegeben werden
- [ ] Datei wird übertragen (100%)
- [ ] Keine Fehler

**Im Server-Terminal:**
```
  Warte auf Zertifikat...

✅ Zertifikat erfolgreich empfangen!
✅ Cloudflare Login erfolgreich!
✅ Zertifikat erstellt: ~/.cloudflared/cert.pem
```

- [ ] Script erkennt Zertifikat automatisch
- [ ] Success-Meldung erscheint
- [ ] Script fährt fort

---

### Schritt 9: Zertifikat auf Server überprüfen

**Im Server-Terminal (kann parallel gemacht werden):**

```bash
# Prüfen ob Zertifikat angekommen ist
ls -la ~/.cloudflared/cert.pem
```

**Erwartet:**
```
-rw------- 1 root root 1234 Oct 30 12:34 /root/.cloudflared/cert.pem
```

- [ ] Datei existiert
- [ ] Rechte sind `-rw-------` (600)
- [ ] Owner ist `root`
- [ ] Dateigröße > 0

---

### Schritt 10: Installation fortsetzt automatisch

**Das Script fährt fort:**

```
ℹ️  Erstelle Tunnel 'fmsv-dingden'...
✅ Tunnel erstellt: abcd1234-ef56-7890-abcd-ef1234567890

►  Domain für Tunnel [fmsv.bartholmes.eu]:
```

**Eingabe:** `fmsv.bartholmes.eu` (oder deine Domain)

- [ ] Tunnel wird erstellt
- [ ] Tunnel-ID wird angezeigt
- [ ] Domain-Abfrage erscheint
- [ ] Domain kann eingegeben werden

**Weiter:**
```
✅ Tunnel-Konfiguration erstellt
✅ DNS konfiguriert: fmsv.bartholmes.eu → Tunnel
✅ Cloudflare Tunnel konfiguriert
```

- [ ] Tunnel-Konfiguration erstellt
- [ ] DNS konfiguriert
- [ ] Kein Fehler

---

## ✅ Test erfolgreich!

Wenn alle Checkboxen ✅ sind, funktioniert die Methode "Lokaler PC" perfekt!

---

## ⚠️ Häufige Probleme während des Tests

### Problem 1: "scp: command not found" (Windows)

**Lösung:**
```powershell
# In PowerShell als Administrator
Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0
```

Dann neu versuchen.

---

### Problem 2: "Permission denied" beim SCP

**Lösung:**
```bash
# Auf dem Server: Verzeichnis erstellen
mkdir -p ~/.cloudflared
chmod 700 ~/.cloudflared
```

Dann SCP neu versuchen.

---

### Problem 3: "Connection refused"

**Prüfen:**
```bash
# Auf dem Server
systemctl status sshd

# Port prüfen
ss -tlnp | grep ssh
```

**Lösung:** SSH muss laufen und Port 22 offen sein.

---

### Problem 4: Script wartet ewig auf Zertifikat

**Prüfen:**
```bash
# WÄHREND Script wartet, im zweiten Terminal:
ls -la ~/.cloudflared/cert.pem
```

**Wenn Datei NICHT existiert:**
- SCP nochmal ausführen
- Passwort korrekt eingeben
- Zielpfad prüfen

**Wenn Datei existiert:**
- Script sollte automatisch fortfahren
- Falls nicht: `Strg+C` und neu starten

---

### Problem 5: Browser öffnet sich nicht auf PC

**Prüfen:**
```bash
# Auf PC
cloudflared tunnel login
```

**Wenn "Failed to open browser":**
- URL wird trotzdem angezeigt!
- URL manuell kopieren
- Im Browser öffnen

---

## 🎯 Zusammenfassung Test

**Funktionen die getestet wurden:**

1. ✅ SSH-Erkennung im Script
2. ✅ Auswahl-Dialog für Login-Methoden
3. ✅ Schritt-für-Schritt-Anleitung
4. ✅ cloudflared Installation auf PC
5. ✅ Browser-Login auf PC
6. ✅ Zertifikat-Übertragung via SCP
7. ✅ Automatische Erkennung auf Server
8. ✅ Fortsetzung der Installation

**Ergebnis:**

- [ ] ⭐⭐⭐⭐⭐ Funktioniert perfekt
- [ ] ⭐⭐⭐⭐ Funktioniert mit kleinen Problemen
- [ ] ⭐⭐⭐ Funktioniert nach Troubleshooting
- [ ] ⭐⭐ Funktioniert nur teilweise
- [ ] ⭐ Funktioniert nicht

---

## 📝 Notizen

Notiere hier Probleme die während des Tests aufgetreten sind:

```
[Platz für Notizen]




```

---

**Test abgeschlossen!** Feedback bitte an den Entwickler! 🚀
