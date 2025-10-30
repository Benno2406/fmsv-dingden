# WinSCP - Häufig gestellte Fragen (FAQ)

## 🎯 Die wichtigsten Fragen zu WinSCP beim Cloudflare-Zertifikat-Upload

---

## ❓ Frage 1: Der Ordner `.cloudflared` ist nicht auf dem Server sichtbar!

### ✅ Antwort:

**Das ist völlig normal!** Der Ordner existiert noch nicht und muss von dir erstellt werden.

**Lösung:**

1. **Versteckte Dateien anzeigen:**
   - WinSCP → Optionen → Einstellungen
   - Anzeige → "Versteckte Dateien anzeigen" ✅
   - OK

2. **Ordner erstellen:**
   - Rechtsklick rechts (Server) → "Neues Verzeichnis"
   - Name: `.cloudflared` (MIT Punkt!)
   - OK
   - Doppelklick auf `.cloudflared`

3. **Zertifikat hochladen:**
   - `cert.pem` von links nach rechts ziehen
   - Fertig!

**📖 Detaillierte Hilfe:** [`CLOUDFLARED-ORDNER-PROBLEM.md`](CLOUDFLARED-ORDNER-PROBLEM.md)

---

## ❓ Frage 2: Wo finde ich das Zertifikat auf meinem PC?

### ✅ Antwort:

**Windows:**
```
C:\Users\DEIN_NAME\.cloudflared\cert.pem
```

**Schnell öffnen:**

PowerShell:
```powershell
explorer C:\Users\$env:USERNAME\.cloudflared
```

Oder Windows-Taste + R:
```
%USERPROFILE%\.cloudflared
```

**Mac:**
```
~/.cloudflared/cert.pem
```

Finder öffnen:
```bash
open ~/.cloudflared
```

**Linux:**
```
~/.cloudflared/cert.pem
```

Terminal:
```bash
nautilus ~/.cloudflared  # Ubuntu/Gnome
dolphin ~/.cloudflared   # KDE
```

---

## ❓ Frage 3: WinSCP zeigt "Verbindung fehlgeschlagen"

### ✅ Antwort:

**Mögliche Ursachen & Lösungen:**

### 1. Falsche Server-IP

**Prüfen auf Server:**
```bash
hostname -I
```

**Beispiel:** `192.168.1.100`

→ Diese IP in WinSCP eingeben!

### 2. SSH läuft nicht

**Prüfen auf Server:**
```bash
systemctl status sshd
```

**Starten falls nötig:**
```bash
systemctl start sshd
systemctl enable sshd
```

### 3. Firewall blockiert

**Prüfen auf Server:**
```bash
ufw status
```

**Port 22 freigeben:**
```bash
ufw allow 22/tcp
```

### 4. Falsches Passwort

→ Root-Passwort korrekt eingeben
→ Bei Problemen: Passwort zurücksetzen

---

## ❓ Frage 4: Wie verbinde ich mich mit WinSCP zum Server?

### ✅ Antwort:

**Schritt-für-Schritt:**

1. **WinSCP öffnen**

2. **Login-Fenster ausfüllen:**
   ```
   Übertragungsprotokoll: SFTP
   Servername:            [DEINE_SERVER_IP]
   Portnummer:            22
   Benutzername:          root
   Passwort:              [DEIN_PASSWORT]
   ```

3. **"Anmelden" klicken**

4. **Bei Sicherheitswarnung:** "Ja" klicken

5. **Verbunden!** ✅

**📖 Komplette Anleitung:** [`CLOUDFLARE-WINSCP.md`](CLOUDFLARE-WINSCP.md)

---

## ❓ Frage 5: Wo finde ich meine Server-IP?

### ✅ Antwort:

**Im Server-Terminal:**
```bash
hostname -I
```

**Beispiel-Ausgabe:**
```
192.168.1.100
```

→ Das ist deine Server-IP!

**Oder im install.sh Script:**
```
Deine Server-IP: 192.168.1.100
```

→ Wird automatisch angezeigt!

---

## ❓ Frage 6: Muss ich den Ordner `.cloudflared` mit Punkt schreiben?

### ✅ Antwort:

**JA! Unbedingt MIT Punkt am Anfang!**

❌ **FALSCH:** `cloudflared`  
✅ **RICHTIG:** `.cloudflared`

**Warum?**
- In Linux sind Dateien/Ordner mit Punkt am Anfang "versteckt"
- Das Script sucht nach `~/.cloudflared/cert.pem`
- Ohne Punkt findet es das Zertifikat nicht!

**Test auf Server:**
```bash
# Richtig:
ls -la ~/.cloudflared/cert.pem

# Sollte zeigen:
-rw------- 1 root root 1234 Oct 30 12:34 /root/.cloudflared/cert.pem
```

---

## ❓ Frage 7: Das Zertifikat wurde hochgeladen, aber das Script erkennt es nicht!

### ✅ Antwort:

**Prüfen im Server-Terminal:**

```bash
# 1. Zertifikat vorhanden?
ls -la ~/.cloudflared/cert.pem

# 2. Im richtigen Ordner?
pwd
# Sollte zeigen: /root

# 3. Rechte korrekt?
chmod 600 ~/.cloudflared/cert.pem

# 4. Nochmal prüfen
ls -la ~/.cloudflared/cert.pem
# Sollte zeigen:
# -rw------- 1 root root 1234 Oct 30 12:34 cert.pem
```

**Häufigster Fehler:**
- Zertifikat im falschen Ordner (z.B. `/root/cert.pem` statt `/root/.cloudflared/cert.pem`)

**Lösung:**
```bash
# Falls im falschen Ordner:
mv ~/cert.pem ~/.cloudflared/cert.pem
chmod 600 ~/.cloudflared/cert.pem
```

---

## ❓ Frage 8: Kann ich WinSCP-Verbindung speichern?

### ✅ Antwort:

**Ja! Sehr praktisch für wiederholte Verbindungen:**

1. **Beim ersten Login:** Vor "Anmelden" auf **"Speichern"** klicken

2. **Site-Name eingeben:** z.B. `FMSV Server`

3. **Passwort speichern?** Optional (Sicherheit beachten!)

4. **OK** → Dann **"Anmelden"**

**Beim nächsten Mal:**
- WinSCP öffnen
- Gespeicherte Site auswählen
- "Anmelden" klicken
- Fertig!

---

## ❓ Frage 9: Wo lade ich WinSCP herunter?

### ✅ Antwort:

**Offizielle Website:**
```
https://winscp.net/eng/download.php
```

**Direkt-Link (aktuell):**
```
https://winscp.net/download/WinSCP-6.3.5-Setup.exe
```

**Portable Version (ohne Installation):**
```
https://winscp.net/download/WinSCP-6.3.5-Portable.zip
```

**Installation:**
1. `.exe` herunterladen
2. Doppelklick
3. "Typische Installation" wählen
4. Fertig!

---

## ❓ Frage 10: Gibt es Alternativen zu WinSCP?

### ✅ Antwort:

**Ja, mehrere Optionen:**

### Option 1: FileZilla (Alle Systeme)
```
https://filezilla-project.org/
```
- ✅ Funktioniert auf Windows, Mac & Linux
- ✅ Ähnliche GUI wie WinSCP
- ⚠️ Installer enthält manchmal Zusatzsoftware (ablehnen!)

### Option 2: SCP im Terminal (Mac/Linux)
```bash
scp ~/.cloudflared/cert.pem root@SERVER_IP:/root/.cloudflared/
```
- ✅ Vorinstalliert auf Mac/Linux
- ✅ Ein Befehl reicht
- ❌ Kein GUI

### Option 3: SCP in PowerShell (Windows)
```powershell
scp C:\Users\DEIN_NAME\.cloudflared\cert.pem root@SERVER_IP:/root/.cloudflared/
```
- ⚠️ OpenSSH muss installiert sein
- ❌ Kein GUI

**📖 Alle Optionen vergleichen:** [`ZERTIFIKAT-UPLOAD-OPTIONEN.md`](ZERTIFIKAT-UPLOAD-OPTIONEN.md)

**Empfehlung für Windows:** → **WinSCP** ⭐⭐⭐⭐⭐

---

## ❓ Frage 11: Wie erkenne ich, dass der Upload erfolgreich war?

### ✅ Antwort:

**In WinSCP:**
```
┌────────────────────────┬────────────────────────┐
│  PC (Links)            │  Server (Rechts)       │
├────────────────────────┼────────────────────────┤
│  .cloudflared          │  /root/.cloudflared/   │
│  📄 cert.pem           │  📄 cert.pem ✅        │
└────────────────────────┴────────────────────────┘
```

→ Datei ist auf **beiden Seiten** sichtbar!

**Im Server-Terminal (install.sh):**
```
✅ Zertifikat erfolgreich empfangen!
✅ Cloudflare Login erfolgreich!
✅ Zertifikat erstellt: ~/.cloudflared/cert.pem

→ Installation fährt automatisch fort!
```

**Manuell prüfen:**
```bash
ls -la ~/.cloudflared/cert.pem

# Sollte zeigen:
-rw------- 1 root root 1234 Oct 30 12:34 /root/.cloudflared/cert.pem
```

---

## ❓ Frage 12: WinSCP fragt nach SSH-Key - was tun?

### ✅ Antwort:

**Das brauchst du nicht!**

**Authentifizierung:**
- ✅ **Mit Passwort** (Standard) → Einfach Passwort eingeben
- ⚠️ Mit SSH-Key (Optional, für Fortgeschrittene)

**Wenn SSH-Key-Dialog erscheint:**
1. Einfach **"Abbrechen"** oder **"Skip"**
2. Passwort-Authentifizierung wird verwendet
3. Funktioniert genauso!

**SSH-Key nur nötig wenn:**
- Du Key-basierte Authentifizierung eingerichtet hast
- Server Passwort-Login deaktiviert hat

Für Standard-Installation: **Passwort reicht!**

---

## ❓ Frage 13: Wie lange dauert der Upload?

### ✅ Antwort:

**Das Zertifikat `cert.pem` ist nur ca. 1-2 KB groß.**

**Upload-Dauer:**
- Lokales Netzwerk: **< 1 Sekunde** ⚡
- Internet: **1-3 Sekunden** 🚀

**Wenn länger als 10 Sekunden:**
→ Überprüfe Internetverbindung
→ Prüfe ob Server erreichbar ist

---

## ❓ Frage 14: Kann ich WinSCP auf Deutsch umstellen?

### ✅ Antwort:

**Ja! WinSCP unterstützt Deutsch:**

1. WinSCP öffnen
2. **Tools** → **Preferences** (oder **Optionen**)
3. **Environment** → **Languages**
4. **Deutsch** auswählen
5. **OK**
6. WinSCP neustarten

→ Jetzt ist alles auf Deutsch! 🇩🇪

---

## ❓ Frage 15: Kann ich mehrere Dateien gleichzeitig hochladen?

### ✅ Antwort:

**Ja! WinSCP unterstützt Multi-Upload:**

**Mehrere Dateien markieren:**
- **Strg + Klick** auf jede Datei
- Oder: Erste Datei → **Shift + Klick** auf letzte Datei

**Drag & Drop:**
- Alle markierten Dateien zusammen ziehen
- Auf Server-Seite loslassen

**Aber für Cloudflare-Zertifikat:**
→ Nur `cert.pem` wird benötigt!

---

## 🎓 Weitere Hilfe

### Dokumentation:

- **Quick Start:** [`WINSCP-QUICK-GUIDE.md`](WINSCP-QUICK-GUIDE.md)
- **Detailliert:** [`CLOUDFLARE-WINSCP.md`](CLOUDFLARE-WINSCP.md)
- **Ordner-Problem:** [`CLOUDFLARED-ORDNER-PROBLEM.md`](CLOUDFLARED-ORDNER-PROBLEM.md)
- **Alle Optionen:** [`ZERTIFIKAT-UPLOAD-OPTIONEN.md`](ZERTIFIKAT-UPLOAD-OPTIONEN.md)

### Installation:

- **Start:** [`START-HIER-INSTALLATION.md`](START-HIER-INSTALLATION.md)
- **Cloudflare:** [`CLOUDFLARE-LOKALER-PC.md`](CLOUDFLARE-LOKALER-PC.md)
- **Quick Guide:** [`INSTALLATION-QUICK-GUIDE.md`](INSTALLATION-QUICK-GUIDE.md)

---

## 💡 Tipps & Tricks

### Tastenkombinationen in WinSCP:

| Taste | Funktion |
|-------|----------|
| **F5** | Datei kopieren (links → rechts) |
| **F6** | Datei verschieben |
| **F8** | Datei löschen |
| **F3** | Datei ansehen |
| **F4** | Datei bearbeiten |
| **Strg+R** | Ansicht aktualisieren |

### Nützliche Einstellungen:

1. **Versteckte Dateien immer anzeigen:**
   - Optionen → Einstellungen → Anzeige
   - "Versteckte Dateien anzeigen" ✅

2. **Verbindungen speichern:**
   - Login-Fenster → "Speichern"
   - Name vergeben → Schneller Zugriff!

3. **Automatisches Neuladen:**
   - Optionen → Einstellungen → Anzeige
   - "Verzeichnis automatisch neuladen" ✅

---

**Deine Frage nicht dabei?** 

→ Siehe [`INSTALLATIONS-HILFE.md`](INSTALLATIONS-HILFE.md) für mehr Hilfe!
