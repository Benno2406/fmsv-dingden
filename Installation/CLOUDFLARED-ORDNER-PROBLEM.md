# .cloudflared Ordner nicht sichtbar - Lösung

## 🎯 Das Problem

Du möchtest das Cloudflare-Zertifikat mit WinSCP hochladen, aber der Ordner `.cloudflared` ist auf dem Server nicht sichtbar oder existiert nicht.

**Das ist völlig normal!** 🎉

---

## ✅ Die Lösung

### Warum ist der Ordner nicht da?

Der `.cloudflared` Ordner wird **vom install.sh Script automatisch erstellt**, ABER:

1. **Er beginnt mit einem Punkt** → "Versteckte Datei" in Linux
2. **WinSCP zeigt standardmäßig keine versteckten Dateien**
3. **Bei manuallem Upload musst DU ihn erstellen**

---

## 🚀 Lösung: Ordner in WinSCP erstellen

### Schritt 1: WinSCP mit Server verbunden

Du solltest dieses Fenster sehen:

```
┌────────────────────────┬────────────────────────┐
│  PC (Links)            │  Server (Rechts)       │
├────────────────────────┼────────────────────────┤
│  C:\Users\Max\         │  /root/                │
│  Desktop               │  (verschiedene Ordner) │
│  Downloads             │                        │
│  .cloudflared ✅       │  ❌ .cloudflared fehlt!│
└────────────────────────┴────────────────────────┘
```

---

### Schritt 2: Versteckte Dateien anzeigen (WICHTIG!)

**Damit du den Ordner siehst/erstellen kannst:**

1. Im WinSCP-Menü: **Optionen** → **Einstellungen**
2. Links: **Anzeige** auswählen
3. Rechts: **"Versteckte Dateien anzeigen"** ✅ aktivieren
4. **OK** klicken
5. **F5** drücken (Ansicht aktualisieren)

**Jetzt siehst du alle Ordner, auch die mit Punkt!**

---

### Schritt 3: Ordner erstellen

**Im rechten Fenster (Server /root):**

1. **Rechtsklick** ins leere Fenster
2. **"Neues Verzeichnis"** wählen
   - Englisch: **"New" → "Directory"**
3. Name eingeben: `.cloudflared`
   - ⚠️ **MIT Punkt am Anfang!** → `.cloudflared`
   - ❌ NICHT: `cloudflared` (ohne Punkt)
4. **OK** klicken

**Du siehst jetzt:**

```
┌────────────────────────┬────────────────────────┐
│  PC (Links)            │  Server (Rechts)       │
├────────────────────────┼────────────────────────┤
│  C:\Users\Max\         │  /root/                │
│                        │                        │
│  .cloudflared ✅       │  📁 .cloudflared ✅    │
└────────────────────────┴────────────────────────┘
```

---

### Schritt 4: Ordner öffnen

Im **rechten Fenster (Server):**

1. **Doppelklick** auf `.cloudflared`
2. Ordner öffnet sich (ist leer)
3. Pfad zeigt: `/root/.cloudflared/`

```
┌────────────────────────┬────────────────────────┐
│  PC                    │  Server                │
├────────────────────────┼────────────────────────┤
│  C:\Users\Max\         │  /root/.cloudflared/   │
│  .cloudflared          │                        │
│                        │                        │
│  📄 cert.pem           │  (leer - bereit!)      │
└────────────────────────┴────────────────────────┘
```

---

### Schritt 5: Zertifikat hochladen

**Jetzt kannst du uploaden:**

1. **Links** zu `C:\Users\DEIN_NAME\.cloudflared` navigieren
2. Du siehst: `cert.pem`
3. **Datei anklicken** und **gedrückt halten**
4. Nach **rechts ziehen** (Drag & Drop)
5. **Loslassen**

**Erfolgreich!**

```
┌────────────────────────┬────────────────────────┐
│  PC                    │  Server                │
├────────────────────────┼────────────────────────┤
│  .cloudflared          │  /root/.cloudflared/   │
│                        │                        │
│  📄 cert.pem           │  📄 cert.pem ✅        │
└────────────────────────┴────────────────────────┘
```

**Im Server-Terminal (install.sh):**
```
✅ Zertifikat erfolgreich empfangen!
→ Installation fährt automatisch fort
```

---

## 🔧 Alternative: Im Server-Terminal erstellen

Falls WinSCP nicht funktioniert, kannst du den Ordner im **Server-Terminal** erstellen:

```bash
# SSH zum Server verbinden
ssh root@DEINE_SERVER_IP

# Verzeichnis erstellen
mkdir -p ~/.cloudflared

# Rechte setzen
chmod 700 ~/.cloudflared

# Prüfen
ls -la ~ | grep cloudflared

# Sollte zeigen:
drwx------ 2 root root 4096 Oct 30 12:34 .cloudflared
```

**Dann in WinSCP:**
- **F5** drücken (aktualisieren)
- Ordner sollte jetzt sichtbar sein
- Normal hochladen

---

## 📋 Checkliste

Nach dem Upload **im Server-Terminal** prüfen:

```bash
# Verzeichnis vorhanden?
ls -la ~/.cloudflared/

# Sollte zeigen:
drwx------ 2 root root 4096 Oct 30 12:34 .
drwx------ 5 root root 4096 Oct 30 12:30 ..
-rw------- 1 root root 1234 Oct 30 12:35 cert.pem
```

**Wenn `cert.pem` da ist:** ✅ **Perfekt!**

---

## ⚠️ Häufige Fehler

### Fehler 1: Ordner ohne Punkt erstellt

**Falsch:** `cloudflared` (ohne Punkt)  
**Richtig:** `.cloudflared` (mit Punkt)

**Lösung:**
```bash
# Im Server-Terminal
rm -rf ~/cloudflared      # Falschen Ordner löschen
mkdir -p ~/.cloudflared   # Richtigen Ordner erstellen
chmod 700 ~/.cloudflared
```

---

### Fehler 2: Zertifikat im falschen Ordner

**Falsch:** `/root/cert.pem` (direkt in /root)  
**Richtig:** `/root/.cloudflared/cert.pem`

**Lösung:**
```bash
# Im Server-Terminal
mv ~/cert.pem ~/.cloudflared/cert.pem
chmod 600 ~/.cloudflared/cert.pem
```

---

### Fehler 3: Falsche Rechte

**Problem:** install.sh erkennt Zertifikat nicht

**Prüfen:**
```bash
ls -la ~/.cloudflared/cert.pem

# Sollte zeigen:
-rw------- 1 root root 1234 Oct 30 12:35 cert.pem
```

**Lösung:**
```bash
chmod 600 ~/.cloudflared/cert.pem
```

---

## 🎯 Visual Guide - Schritt für Schritt

### Vorher (Server leer):

```
WinSCP - Rechte Seite (Server)
┌─────────────────────────────┐
│  /root/                     │
├─────────────────────────────┤
│  📁 Desktop                 │
│  📁 Downloads               │
│  📄 .bashrc                 │
│  📄 .profile                │
│                             │
│  ❌ .cloudflared fehlt!     │
│                             │
│  [Rechtsklick hier]         │
│  → "Neues Verzeichnis"      │
└─────────────────────────────┘
```

### Nach Ordner-Erstellung:

```
WinSCP - Rechte Seite (Server)
┌─────────────────────────────┐
│  /root/                     │
├─────────────────────────────┤
│  📁 .cloudflared ✅         │  ← NEU!
│  📁 Desktop                 │
│  📁 Downloads               │
│  📄 .bashrc                 │
│  📄 .profile                │
│                             │
│  [Doppelklick auf          │
│   .cloudflared]             │
└─────────────────────────────┘
```

### Ordner geöffnet:

```
WinSCP - Rechte Seite (Server)
┌─────────────────────────────┐
│  /root/.cloudflared/        │
├─────────────────────────────┤
│                             │
│  (leer)                     │
│                             │
│  Bereit für Upload!         │
│                             │
│  [cert.pem hierher ziehen]  │
│                             │
└─────────────────────────────┘
```

### Nach Upload:

```
WinSCP - Rechte Seite (Server)
┌─────────────────────────────┐
│  /root/.cloudflared/        │
├─────────────────────────────┤
│                             │
│  📄 cert.pem ✅             │
│                             │
│  Upload erfolgreich! 🎉     │
│                             │
└─────────────────────────────┘
```

---

## ✅ Zusammenfassung

### Der Ordner `.cloudflared`:

1. **Existiert anfangs NICHT** auf dem Server
2. **Muss von DIR erstellt werden** (in WinSCP)
3. **Beginnt mit Punkt** → versteckte Datei
4. **Name muss exakt sein:** `.cloudflared`

### Vorgehen:

1. ✅ WinSCP öffnen
2. ✅ Versteckte Dateien anzeigen aktivieren
3. ✅ Rechtsklick → "Neues Verzeichnis" → `.cloudflared`
4. ✅ Ordner öffnen (Doppelklick)
5. ✅ `cert.pem` hochladen (Drag & Drop)
6. ✅ Script erkennt automatisch → fertig!

**Dauer:** 2 Minuten  
**Schwierigkeit:** ⭐ (Sehr einfach)

---

## 📖 Weiterführende Hilfe

- **WinSCP Quick Guide:** [`WINSCP-QUICK-GUIDE.md`](WINSCP-QUICK-GUIDE.md)
- **WinSCP Detailliert:** [`CLOUDFLARE-WINSCP.md`](CLOUDFLARE-WINSCP.md)
- **Alle Upload-Optionen:** [`ZERTIFIKAT-UPLOAD-OPTIONEN.md`](ZERTIFIKAT-UPLOAD-OPTIONEN.md)
- **Cloudflare Lokaler PC:** [`CLOUDFLARE-LOKALER-PC.md`](CLOUDFLARE-LOKALER-PC.md)

---

**Problem gelöst?** Dann kann's weitergehen mit der Installation! 🚀
