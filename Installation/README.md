# Installation

FMSV Dingden Installation & Update-System.

---

## 🎯 Neu hier? START HIER!

**📖 Kompletter Installations-Guide mit allen Links:**

→ **[`START-HIER-INSTALLATION.md`](START-HIER-INSTALLATION.md)**

**Führt dich zum richtigen Dokument für deine Situation!**

---

## ⚠️ WICHTIG - ZUERST LESEN!

### 🔑 Root-Zugriff erforderlich!

**Alle Installations-Scripts müssen als root ausgeführt werden.**

**Als root einloggen:**
```bash
su -
```

**ODER per SSH:**
```bash
ssh root@dein-server
```

**Dann Scripts OHNE `sudo` ausführen:**
```bash
./install.sh    # NICHT: sudo ./install.sh
```

**📚 Mehr Infos:** [`ROOT-HINWEIS.md`](ROOT-HINWEIS.md)

---

### 🆘 Probleme beim Start?

#### Script wartet auf Eingabe?

**Siehst du das?**
```
Installation mit diesen Einstellungen starten? (J/n) :
```

**Das ist normal!** Script wartet auf deine Bestätigung.

**Eingeben:**
- `J` oder `j` (Ja) → Installation startet
- `n` oder `N` (Nein) → Abbruch

---

#### Script bricht ab nach "Aktualisiere Paket-Listen"?

**Lösung 1: Debug-Script ausführen**
```bash
cd /var/www/fmsv-dingden/Installation/scripts
chmod +x debug-install.sh
./debug-install.sh
```

**Lösung 2: Logs ansehen**
```bash
cat /var/log/fmsv-install.log
```

**Lösung 3: apt manuell testen**
```bash
apt-get update
# Fehler beheben, dann:
./install.sh
```

**Mehr Hilfe:** 
- [`INSTALLATIONS-HILFE.md`](INSTALLATIONS-HILFE.md) - Allgemeine Probleme
- [`EINGABE-FEHLER.md`](EINGABE-FEHLER.md) - "Ungültige Auswahl" ⚡ **BEHOBEN**
- [`NGINX-PORT-KONFLIKT.md`](NGINX-PORT-KONFLIKT.md) - Port 80 belegt ⚡ **BEHOBEN**
- [`SCRIPT-BRICHT-AB.md`](SCRIPT-BRICHT-AB.md) - Script bricht ab (Debug Guide)
- [`NGINX-FEHLER.md`](NGINX-FEHLER.md) - Nginx startet nicht
- [`BUGFIXES-2025-10-30.md`](BUGFIXES-2025-10-30.md) - Neueste Bugfixes (Changelog)

---

## 📋 Vor der Installation

### 🔧 Schritt 1: Dateien umbenennen (EINMALIG, VOR DER INSTALLATION)

Einige Dateien liegen als `.txt` vor und müssen umbenannt werden:

```
gitignore.txt           →  .gitignore
Saves/gitkeep.txt       →  Saves/.gitkeep
Logs/gitkeep.txt        →  Logs/.gitkeep
Logs/Audit/gitkeep.txt  →  Logs/Audit/.gitkeep
```

#### ⚡ Automatisch umbenennen (EMPFOHLEN)

**Windows:**
```cmd
rename-files.bat
```

**Linux/macOS:**
```bash
chmod +x rename-files.sh
./rename-files.sh
```

#### 📝 Manuell umbenennen

<details>
<summary>Windows PowerShell (klicken zum Ausklappen)</summary>

```powershell
cd C:\Pfad\zu\fmsv-dingden

Rename-Item "gitignore.txt" ".gitignore"
Rename-Item "Saves\gitkeep.txt" "Saves\.gitkeep"
Rename-Item "Logs\gitkeep.txt" "Logs\.gitkeep"
Rename-Item "Logs\Audit\gitkeep.txt" "Logs\Audit\.gitkeep"
```

</details>

<details>
<summary>Linux/macOS (klicken zum Ausklappen)</summary>

```bash
cd /pfad/zu/fmsv-dingden

mv gitignore.txt .gitignore
mv Saves/gitkeep.txt Saves/.gitkeep
mv Logs/gitkeep.txt Logs/.gitkeep
mv Logs/Audit/gitkeep.txt Logs/Audit/.gitkeep
```

</details>

**Detaillierte Anleitung:** [`DATEIEN-UMBENENNEN.md`](DATEIEN-UMBENENNEN.md)

---

### 📋 Schritt 2: GitHub Repository einrichten

Nach dem Umbenennen der Dateien:

1. Repository auf GitHub erstellen
2. Code zu GitHub pushen
3. Testing/Stable Branches einrichten

**Quick Guide:** [`GitHub-QUICK-START.md`](GitHub-QUICK-START.md) (5 Minuten)

---

### 🚀 Schritt 3: Auf Server installieren

Nach GitHub Setup:

```bash
cd /var/www
git clone https://github.com/Benno2406/fmsv-dingden.git
cd fmsv-dingden/Installation/scripts
chmod +x install.sh
./install.sh
```

**Das wars!** Das Script führt dich durch die Installation.

**Hinweis:** Als root ausführen (ohne `sudo`). Siehe [`ROOT-HINWEIS.md`](ROOT-HINWEIS.md)

---

## 📍 GitHub Repository

**Das Repository ist bereits eingerichtet und PUBLIC!**

- **URL:** https://github.com/Benno2406/fmsv-dingden.git
- **Status:** 🌍 Public (keine Authentifizierung nötig)
- **Branches:** `main` (stable), optional `testing`

**Mehr Infos:** [`REPOSITORY-INFO.md`](REPOSITORY-INFO.md)

**Kein GitHub-Setup nötig!** Einfach klonen und installieren! ✅

---

## 🌐 Cloudflare Tunnel (Optional)

**Für Zugriff ohne Port-Weiterleitungen:**

Bei der Installation wirst du gefragt ob du Cloudflare Tunnel nutzen möchtest.

### ⚠️ SSH/PuTTY-Nutzer aufgepasst!

**Problem:** Browser kann sich für Cloudflare-Login nicht öffnen

**Das ist NORMAL bei SSH!** Das install.sh Script bietet dir automatisch 2 Lösungen:

#### 🎯 Lösung 1: Lokaler PC (EMPFOHLEN) ⭐

cloudflared auf **deinem PC** installieren, dort einloggen, Zertifikat zum Server kopieren.

**Vorteile:**
- ✅ Funktioniert **immer** zuverlässig
- ✅ Browser auf PC funktioniert normal
- ✅ Keine URL-Kopierei
- ✅ Mit WinSCP per Drag & Drop (Windows)

**Anleitungen:**
- **Windows (GUI):** [`CLOUDFLARE-WINSCP.md`](CLOUDFLARE-WINSCP.md) - Einfach per Drag & Drop! ⭐
- **Alle Systeme:** [`CLOUDFLARE-LOKALER-PC.md`](CLOUDFLARE-LOKALER-PC.md) (10 Minuten)

#### 🔧 Lösung 2: URL manuell öffnen

URL aus Terminal kopieren und im Browser öffnen.

**⚠️ Hinweis:** URL wird manchmal nicht angezeigt im Terminal!

**Besser:** Nutze Lösung 1 (Lokaler PC) ⭐

#### 📚 Weitere Hilfen

| Dokument | Zweck | Empfehlung |
|----------|-------|------------|
| [`CLOUDFLARE-LOKALER-PC.md`](CLOUDFLARE-LOKALER-PC.md) | Lokaler PC Methode | ⭐ **EMPFOHLEN** |
| [`WINSCP-QUICK-GUIDE.md`](WINSCP-QUICK-GUIDE.md) | WinSCP Upload (Windows) | ⭐ **Einfach!** |
| [`CLOUDFLARED-ORDNER-PROBLEM.md`](CLOUDFLARED-ORDNER-PROBLEM.md) | `.cloudflared` nicht sichtbar? | Problem-Lösung |
| [`CLOUDFLARED-INSTALLATION-FEHLER.md`](CLOUDFLARED-INSTALLATION-FEHLER.md) | cloudflared Installation fehlgeschlagen | Problem-Lösung |
| [`ZERTIFIKAT-UPLOAD-OPTIONEN.md`](ZERTIFIKAT-UPLOAD-OPTIONEN.md) | Alle Upload-Methoden | Vergleich |
| [`CLOUDFLARE-METHODEN-VERGLEICH.md`](CLOUDFLARE-METHODEN-VERGLEICH.md) | Alle Methoden vergleichen | Übersicht |
| [`INSTALL-SSH-QUICK.md`](INSTALL-SSH-QUICK.md) | Schnellanleitung SSH | Quick Start |
| [`CLOUDFLARE-PUTTY-ANLEITUNG.md`](CLOUDFLARE-PUTTY-ANLEITUNG.md) | Bildliche Anleitung | Detailliert |
| [`Anleitung/Cloudflare-Tunnel-Setup.md`](Anleitung/Cloudflare-Tunnel-Setup.md) | Vollständige Doku | Nachschlagewerk |

---

## ✅ Checkliste vor Installation

Stelle sicher, dass du folgende Schritte erledigt hast:

- [ ] Dateien umbenannt (`.txt` → ohne `.txt`)
  - [ ] `.gitignore` existiert
  - [ ] `Saves/.gitkeep` existiert
  - [ ] `Logs/.gitkeep` existiert
  - [ ] `Logs/Audit/.gitkeep` existiert
- [ ] `git status` zeigt die Dateien an
- [ ] GitHub Repository erstellt
- [ ] Code zu GitHub gepusht
- [ ] Testing/Stable Branches angelegt

**Erst dann:** Installation auf dem Server starten!

---

## 📁 Struktur

```
Installation/
├── scripts/
│   ├── install.sh         # Haupt-Installations-Script
│   ├── update.sh          # Manuelles Update-Script
│   └── auto-update.sh     # Auto-Update (erstellt bei Installation)
└── Anleitung/
    ├── Installation.md    # Detaillierte Anleitung
    ├── E-Mail-Setup.md    # SMTP-Konfiguration
    └── Cloudflare-Tunnel-Setup.md  # Cloudflare Tunnel Details
```

---

## 📖 Dokumentation

### Für erste Installation
→ [`scripts/README.md`](scripts/README.md) oder [`Anleitung/Installation.md`](Anleitung/Installation.md)

### Für Updates
→ [`scripts/README.md`](scripts/README.md) - Abschnitt "Updates"

### Für E-Mail-Setup
→ [`Anleitung/E-Mail-Setup.md`](Anleitung/E-Mail-Setup.md)

### Für Cloudflare Tunnel
→ [`Anleitung/Cloudflare-Tunnel-Setup.md`](Anleitung/Cloudflare-Tunnel-Setup.md)

---

## ⚡ Quick Links

**Installation:**
```bash
./scripts/install.sh
```

**Update:**
```bash
./scripts/update.sh
```

**Hinweis:** Als root ausführen. Siehe [`ROOT-HINWEIS.md`](ROOT-HINWEIS.md)

**Auto-Update Status:**
```bash
systemctl status fmsv-auto-update.timer
```

**Logs:**
```bash
tail -f /var/log/fmsv-auto-update.log
```

---

## 📚 Zusätzliche Ressourcen

- **Beispiel-Ausgabe:** [`BEISPIEL-AUSGABE.md`](BEISPIEL-AUSGABE.md) - So sieht die Installation aus
- **Quick Reference:** [`QUICK-REFERENCE.md`](QUICK-REFERENCE.md) - Alle wichtigen Befehle auf einen Blick
- **GitHub Setup:** [`GitHub-QUICK-START.md`](GitHub-QUICK-START.md) - GitHub in 5 Minuten

---

## 🔗 Nützliche Links

| Was? | Link |
|------|------|
| Dateien umbenennen | [`DATEIEN-UMBENENNEN.md`](DATEIEN-UMBENENNEN.md) |
| GitHub Setup | [`GitHub-QUICK-START.md`](GitHub-QUICK-START.md) |
| .gitignore Erklärung | [`GITIGNORE-ERKLAERUNG.md`](GITIGNORE-ERKLAERUNG.md) |
| Installation Details | [`Anleitung/Installation.md`](Anleitung/Installation.md) |
| E-Mail Setup | [`Anleitung/E-Mail-Setup.md`](Anleitung/E-Mail-Setup.md) |
| Cloudflare Tunnel | [`Anleitung/Cloudflare-Tunnel-Setup.md`](Anleitung/Cloudflare-Tunnel-Setup.md) |
| Auto-Update System | [`Anleitung/Auto-Update-System.md`](Anleitung/Auto-Update-System.md) |

---

## 🆘 Probleme?

### Script wartet und macht nichts

**Siehe:** [`INSTALLATIONS-HILFE.md`](INSTALLATIONS-HILFE.md) - "Script scheint zu hängen"

**Häufigste Ursache:** Script wartet auf deine Eingabe!

Scrolle nach oben und suche nach einer Frage wie:
```
Domain oder Subdomain: _
```

### Dateien können nicht umbenannt werden

```bash
# Script ausführbar machen (Linux/macOS)
chmod +x rename-files.sh
./rename-files.sh

# Oder als Administrator (Windows)
# PowerShell als Admin öffnen, dann:
.\rename-files.bat
```

### Git zeigt .txt Dateien als untracked

Das ist normal! Nach dem Umbenennen verschwinden sie:

```bash
# Vor Umbenennung
git status
# zeigt: gitignore.txt, Saves/gitkeep.txt, etc.

# Nach Umbenennung (Script ausführen)
./rename-files.sh  # oder rename-files.bat

# Erneut prüfen
git status
# zeigt jetzt: .gitignore, Saves/.gitkeep, etc.
```

### Installation schlägt fehl

1. **Checkliste prüfen** (siehe oben)
2. **Logs ansehen:** `cat /var/log/fmsv-install.log`
3. **GitHub-Zugriff testen:** `git clone https://github.com/dein-username/fmsv-dingden.git`
4. **Anleitung:** [`Anleitung/Installation.md`](Anleitung/Installation.md)

---

**Alles klar? Dann viel Erfolg mit der Installation!** 🎯
