# Installation

FMSV Dingden Installation & Update-System.

---

## ⚠️ WICHTIG - ZUERST LESEN!

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
git clone https://github.com/dein-username/fmsv-dingden.git
cd fmsv-dingden/Installation/scripts
chmod +x install.sh
sudo ./install.sh
```

**Das wars!** Das Script führt dich durch die Installation.

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
sudo ./scripts/install.sh
```

**Update:**
```bash
sudo ./scripts/update.sh
```

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
