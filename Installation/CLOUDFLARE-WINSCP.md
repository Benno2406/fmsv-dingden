# Cloudflare Zertifikat mit WinSCP hochladen

## 🎯 Die einfachste Methode für Windows-Nutzer!

WinSCP ist ein kostenloses Programm zum Übertragen von Dateien zwischen PC und Server mit grafischer Oberfläche - **keine Terminal-Befehle nötig!**

---

## 📋 Übersicht

### Was du brauchst:
- ✅ Windows PC
- ✅ WinSCP (kostenlos)
- ✅ Cloudflare Zertifikat auf deinem PC
- ✅ Server-IP und Root-Passwort

### Dauer:
⏱️ **5-10 Minuten**

---

## 🚀 Schritt-für-Schritt Anleitung

### **Schritt 1: WinSCP herunterladen und installieren**

#### Download

1. Öffne im Browser: **https://winscp.net/eng/download.php**
2. Klicke auf **"DOWNLOAD WINSCP"** (grüner Button)
3. Lade die **Installation Package** herunter (`.exe`)

**Direkt-Link:**
```
https://winscp.net/download/WinSCP-6.3.5-Setup.exe
```

#### Installation

1. **Doppelklick** auf heruntergeladene `.exe`-Datei
2. **"Ja"** bei Windows-Sicherheitswarnung klicken
3. **"Lizenzvereinbarung akzeptieren"**
4. Installationstyp: **"Typische Installation"** (empfohlen)
5. **"Installieren"** klicken
6. **"Fertigstellen"** klicken

✅ WinSCP ist jetzt installiert!

---

### **Schritt 2: Cloudflare Zertifikat auf PC erstellen**

Falls noch nicht gemacht:

#### PowerShell als Administrator öffnen

1. **Windows-Taste** drücken
2. `PowerShell` eintippen
3. **Rechtsklick** auf "Windows PowerShell"
4. **"Als Administrator ausführen"** klicken

#### cloudflared installieren

```powershell
winget install --id Cloudflare.cloudflared
```

**Erwartete Ausgabe:**
```
Found Cloudflare Tunnel [Cloudflare.cloudflared] Version 2024.x.x
Successfully installed
```

#### Bei Cloudflare einloggen

```powershell
cloudflared tunnel login
```

**Was passiert:**
- ✅ Browser öffnet sich automatisch
- ✅ Cloudflare Login-Seite erscheint
- ✅ Nach Login: Domain auswählen
- ✅ **"Authorize"** klicken
- ✅ "Success" Meldung

**Im PowerShell erscheint:**
```
You have successfully logged in.
If you wish to copy your credentials to a server, they have 
been saved to:
C:\Users\DEIN_NAME\.cloudflared\cert.pem
```

✅ **Zertifikat wurde erstellt!**

---

### **Schritt 3: Zertifikat-Pfad finden**

#### Automatisch öffnen (einfachste Methode)

**In PowerShell:**
```powershell
explorer C:\Users\$env:USERNAME\.cloudflared
```

→ Windows Explorer öffnet sich im `.cloudflared` Ordner
→ Du siehst die Datei: **cert.pem**

#### Manuell öffnen

1. **Windows-Taste + R** drücken
2. Eingeben: `%USERPROFILE%\.cloudflared`
3. **Enter** drücken
4. Du siehst: **cert.pem**

**Merke dir diesen Pfad:**
```
C:\Users\DEIN_NAME\.cloudflared\cert.pem
```

✅ **Zertifikat gefunden!**

---

### **Schritt 4: Server-IP herausfinden**

Im **install.sh Script** wird die IP automatisch angezeigt:
```
Deine Server-IP: 192.168.1.100
```

**Oder manuell im Server-Terminal:**
```bash
hostname -I
```

**Beispiel-Ausgabe:**
```
192.168.1.100
```

✅ **IP notiert!**

---

### **Schritt 5: WinSCP öffnen und verbinden**

#### WinSCP starten

1. **Windows-Taste** drücken
2. `WinSCP` eintippen
3. **Enter** drücken

#### Verbindung einrichten

**WinSCP Login-Fenster erscheint:**

```
┌─────────────────────────────────────────┐
│  WinSCP - Login                         │
├─────────────────────────────────────────┤
│                                         │
│  Übertragungsprotokoll:  SFTP          │
│  Servername:            [________]      │
│  Portnummer:            22              │
│  Benutzername:          [________]      │
│  Passwort:              [________]      │
│                                         │
│  [Speichern] [Anmelden] [Abbrechen]    │
└─────────────────────────────────────────┘
```

**Felder ausfüllen:**

| Feld | Wert | Beispiel |
|------|------|----------|
| **Übertragungsprotokoll** | SFTP | SFTP |
| **Servername** | Deine Server-IP | `192.168.1.100` |
| **Portnummer** | 22 | `22` |
| **Benutzername** | root | `root` |
| **Passwort** | Dein Root-Passwort | `••••••••` |

#### Verbindung testen

1. **"Anmelden"** klicken
2. Bei erster Verbindung: **Sicherheitswarnung**
   ```
   Der Server ist in der Cache-Datei nicht bekannt.
   Schlüssel-Fingerabdruck: ssh-ed25519 255 ...
   
   Möchten Sie diesem Server vertrauen und fortfahren?
   ```
   → **"Ja"** klicken

3. **Verbindung wird hergestellt**

**Erfolgreich verbunden:**
```
┌──────────────────────┬──────────────────────┐
│  Lokales Verzeichnis │ Remote-Verzeichnis   │
├──────────────────────┼──────────────────────┤
│  C:\Users\DEIN_NAME  │  /root               │
│                      │                      │
│  📁 Desktop          │  📁 .cloudflared     │
│  📁 Downloads        │  📁 .ssh             │
│  📁 Dokumente        │  📄 .bashrc          │
│  ...                 │  ...                 │
└──────────────────────┴──────────────────────┘
```

✅ **Verbindung hergestellt!**

---

### **Schritt 6: Zertifikat hochladen**

#### Im WinSCP-Fenster

**Du siehst zwei Seiten:**
- **Links:**  Dein PC (C:\Users\DEIN_NAME)
- **Rechts:** Der Server (/root)

#### Links: Zu Zertifikat navigieren

1. Im **linken** Fenster (PC):
2. Adressleiste anklicken
3. Eingeben: `C:\Users\DEIN_NAME\.cloudflared`
   (Ersetze `DEIN_NAME` mit deinem Windows-Benutzernamen)
4. **Enter** drücken

**Du siehst jetzt:**
```
┌──────────────────────────────────────┐
│  C:\Users\DEIN_NAME\.cloudflared     │
├──────────────────────────────────────┤
│  📄 cert.pem                         │
└──────────────────────────────────────┘
```

#### Rechts: Zielordner erstellen

**WICHTIG:** Das `.cloudflared` Verzeichnis existiert auf dem Server noch NICHT!

Du musst es erst erstellen:

1. Im **rechten** Fenster (Server - /root):
2. **Rechtsklick** ins leere Fenster
3. **"Neues Verzeichnis"** wählen
4. Name eingeben: `.cloudflared` (mit Punkt am Anfang!)
5. **OK** klicken
6. **Doppelklick** auf den neuen Ordner `.cloudflared`

**Tipp:** Falls du versteckte Ordner nicht siehst:
- **Optionen** → **Einstellungen** → **Anzeige**
- **"Versteckte Dateien anzeigen"** ✅ aktivieren

**Du siehst jetzt:**
```
┌────────────────────────┬────────────────────────┐
│  Links (PC)            │  Rechts (Server)       │
├────────────────────────┼────────────────────────┤
│  C:\Users\...\         │  /root/.cloudflared    │
│  .cloudflared          │                        │
│                        │                        │
│  📄 cert.pem           │  (leer)                │
└────────────────────────┴────────────────────────┘
```

#### Datei übertragen

**Methode 1: Drag & Drop (einfachste)**

1. **Links:** Datei `cert.pem` anklicken
2. **Gedrückt halten** und nach **rechts** ziehen
3. **Loslassen**
4. Übertragung startet automatisch

**Methode 2: Kopieren & Einfügen**

1. **Links:** Rechtsklick auf `cert.pem`
2. **"Kopieren"** wählen
3. **Rechts:** Rechtsklick ins leere Fenster
4. **"Einfügen"** wählen

**Methode 3: Menü**

1. **Links:** Datei `cert.pem` markieren
2. **Menü:** Befehle → Hochladen
3. **OK** klicken

#### Übertragung läuft

```
┌───────────────────────────────────────┐
│  Übertrage Datei                      │
├───────────────────────────────────────┤
│  cert.pem                             │
│  ████████████████████ 100%            │
│  1.2 KB von 1.2 KB                    │
│  Geschwindigkeit: 156 KB/s            │
└───────────────────────────────────────┘
```

#### Erfolgreich übertragen!

```
┌────────────────────────┬────────────────────────┐
│  Links (PC)            │  Rechts (Server)       │
├────────────────────────┼────────────────────────┤
│  C:\Users\...\         │  /root/.cloudflared    │
│  .cloudflared          │                        │
│                        │                        │
│  📄 cert.pem           │  📄 cert.pem ✅        │
└────────────────────────┴────────────────────────┘
```

✅ **Zertifikat erfolgreich hochgeladen!**

---

### **Schritt 7: Zurück zum install.sh Script**

Im **Server-Terminal** (wo install.sh läuft):

```
  ✅ Server ist bereit - warte auf Zertifikat...

[Script erkennt Zertifikat automatisch...]

✅ Zertifikat erfolgreich empfangen!
✅ Cloudflare Login erfolgreich!
✅ Zertifikat erstellt: ~/.cloudflared/cert.pem
```

→ **Installation fährt automatisch fort!** 🎉

---

## 🎓 Tipps & Tricks

### WinSCP-Verbindung speichern

Beim ersten Login:
1. **"Speichern"** klicken (statt "Anmelden")
2. **Site-Name** eingeben: `FMSV Server`
3. **OK** klicken
4. Jetzt **"Anmelden"** klicken

**Beim nächsten Mal:**
- WinSCP öffnen
- Gespeicherte Site auswählen
- **"Anmelden"** klicken
- Fertig!

### Tastenkombinationen

| Taste | Funktion |
|-------|----------|
| **F5** | Datei kopieren (links → rechts) |
| **F6** | Datei verschieben |
| **F3** | Datei ansehen |
| **F4** | Datei bearbeiten |
| **F8** | Datei löschen |

### Versteckte Dateien anzeigen

1. **Menü:** Optionen → Einstellungen
2. **Anzeige:** "Versteckte Dateien anzeigen" ✅
3. **OK**

→ Jetzt siehst du `.cloudflared` Ordner automatisch!

---

## 🔧 Troubleshooting

### Problem: "Verbindung fehlgeschlagen"

**Mögliche Ursachen:**

#### 1. Falsche Server-IP

**Prüfen:**
```bash
# Auf Server
hostname -I
```

→ Richtige IP im WinSCP eingeben

#### 2. SSH-Server läuft nicht

**Prüfen:**
```bash
# Auf Server
systemctl status sshd
```

**Lösung:**
```bash
systemctl start sshd
systemctl enable sshd
```

#### 3. Firewall blockiert Port 22

**Prüfen:**
```bash
# Auf Server
ufw status
```

**Lösung:**
```bash
ufw allow 22/tcp
```

#### 4. Falsches Passwort

→ Root-Passwort korrekt eingeben
→ Bei Problemen: Passwort zurücksetzen

---

### Problem: Ordner `.cloudflared` nicht sichtbar

**Das ist normal!** Der Ordner existiert auf dem Server noch nicht.

**📖 Detaillierte Hilfe:** [`CLOUDFLARED-ORDNER-PROBLEM.md`](CLOUDFLARED-ORDNER-PROBLEM.md)

**Lösung: Manuell erstellen (MUSS GEMACHT WERDEN)**

Im rechten Fenster (Server):
1. **Rechtsklick** ins leere Fenster
2. **"Neues Verzeichnis"** oder **"New" → "Directory"**
3. Name: `.cloudflared` (MIT Punkt am Anfang!)
4. **OK** klicken
5. **Doppelklick** auf den Ordner um ihn zu öffnen

**Versteckte Dateien anzeigen (falls Ordner nach Erstellen nicht sichtbar):**

Im WinSCP:
1. **Optionen** → **Einstellungen**
2. **Anzeige** → **"Versteckte Dateien anzeigen"** ✅
3. **OK**

---

### Problem: "Permission denied" beim Upload

**Ursache:** Keine Schreibrechte im Zielordner

**Lösung:**

Im Server-Terminal:
```bash
# Verzeichnis erstellen mit korrekten Rechten
mkdir -p /root/.cloudflared
chmod 700 /root/.cloudflared
```

Dann Upload nochmal versuchen.

---

### Problem: Zertifikat hochgeladen aber Script erkennt es nicht

**Prüfen ob Datei wirklich angekommen ist:**

Im Server-Terminal:
```bash
ls -la /root/.cloudflared/cert.pem
```

**Sollte zeigen:**
```
-rw-r--r-- 1 root root 1234 Oct 30 12:34 /root/.cloudflared/cert.pem
```

**Falls nicht:** Upload nochmal durchführen

**Falls ja, aber Script erkennt nicht:**
```bash
# Rechte korrigieren
chmod 600 /root/.cloudflared/cert.pem
```

---

### Problem: WinSCP lässt sich nicht installieren

**Portable Version nutzen:**

1. Download: **WinSCP Portable**
   ```
   https://winscp.net/download/WinSCP-6.3.5-Portable.zip
   ```
2. ZIP entpacken
3. `WinSCP.exe` direkt ausführen
4. Keine Installation nötig!

---

## ⚡ Alternative: FileZilla

Falls WinSCP nicht funktioniert, nutze FileZilla:

### Download & Installation

1. **https://filezilla-project.org/**
2. **"FileZilla Client herunterladen"**
3. Installieren

### Verbinden

1. **Host:** `sftp://DEINE_SERVER_IP`
2. **Benutzername:** `root`
3. **Passwort:** `[Dein Passwort]`
4. **Port:** `22`
5. **"Verbinden"** klicken

### Upload

- **Links:** Lokaler PC
- **Rechts:** Server
- Datei von links nach rechts ziehen

---

## 📊 Vergleich: WinSCP vs SCP

| Feature | WinSCP | SCP (Terminal) |
|---------|--------|----------------|
| **GUI** | ✅ Ja | ❌ Nein |
| **Einfachheit** | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **Windows** | ✅ Perfekt | ⚠️ OpenSSH nötig |
| **Drag & Drop** | ✅ Ja | ❌ Nein |
| **Visualisierung** | ✅ Dateien sichtbar | ❌ Blind |
| **Fehlersuche** | ✅ Einfach | ⚠️ Schwierig |

**Empfehlung für Windows:** → **WinSCP** ⭐⭐⭐⭐⭐

---

## ✅ Zusammenfassung

### Die 7 Schritte:

1. ⬇️  **WinSCP herunterladen** (2 Min)
2. 🔑 **cloudflared auf PC installieren** (2 Min)
3. 🌐 **Bei Cloudflare einloggen** (2 Min)
4. 📍 **Zertifikat-Pfad finden** (1 Min)
5. 🔌 **Mit WinSCP zum Server verbinden** (2 Min)
6. 📤 **Zertifikat per Drag & Drop hochladen** (1 Min)
7. ✅ **install.sh erkennt automatisch** (automatisch)

**Gesamtdauer:** 10 Minuten

**Schwierigkeit:** ⭐⭐ (Einfach mit GUI)

**Erfolgsrate:** ⭐⭐⭐⭐⭐ (Fast 100%)

---

## 🎯 Vorteile von WinSCP

✅ **Visuell** - Du siehst alle Dateien  
✅ **Einfach** - Drag & Drop statt Befehle  
✅ **Sicher** - Keine Tippfehler möglich  
✅ **Komfortabel** - Verbindung speicherbar  
✅ **Kostenlos** - 100% gratis  
✅ **Deutsch** - Deutsche Oberfläche verfügbar  

---

**Das war's!** Mit WinSCP ist der Upload kinderleicht! 🎉
