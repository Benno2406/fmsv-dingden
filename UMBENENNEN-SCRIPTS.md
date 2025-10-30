# Umbenennen-Scripts

Diese Datei erklärt die automatischen Umbenennen-Scripts.

---

## 📦 Verfügbare Scripts

### Windows: `rename-files.bat`

Batch-Datei für Windows (CMD oder PowerShell)

**Verwendung:**
```cmd
rename-files.bat
```

oder per Doppelklick im Explorer.

---

### Linux/macOS: `rename-files.sh`

Shell-Script für Unix-basierte Systeme

**Verwendung:**
```bash
chmod +x rename-files.sh
./rename-files.sh
```

---

## 🎯 Was wird umbenannt?

Beide Scripts benennen folgende Dateien um:

| Vorher (alt) | Nachher (neu) |
|--------------|---------------|
| `gitignore.txt` | `.gitignore` |
| `Saves/gitkeep.txt` | `Saves/.gitkeep` |
| `Logs/gitkeep.txt` | `Logs/.gitkeep` |
| `Logs/Audit/gitkeep.txt` | `Logs/Audit/.gitkeep` |

---

## ✅ Funktionen

### Beide Scripts bieten:

- ✅ **Fehler-Prüfung**: Erkennt ob Dateien bereits existieren
- ✅ **Verzeichnis-Prüfung**: Prüft ob im richtigen Ordner
- ✅ **Status-Anzeige**: Zeigt Fortschritt und Ergebnis
- ✅ **Übersicht**: Liste aller erstellten Dateien
- ✅ **Nächste Schritte**: Zeigt was als nächstes zu tun ist

---

## 📝 Beispiel-Ausgabe

### Windows (rename-files.bat)

```
========================================
  FMSV Dingden - Dateien Umbenennen
========================================

Starte Umbenennung...

[1/4] Benenne gitignore.txt um zu .gitignore
      OK - .gitignore erstellt

[2/4] Benenne Saves\gitkeep.txt um zu Saves\.gitkeep
      OK - Saves\.gitkeep erstellt

[3/4] Benenne Logs\gitkeep.txt um zu Logs\.gitkeep
      OK - Logs\.gitkeep erstellt

[4/4] Benenne Logs\Audit\gitkeep.txt um zu Logs\Audit\.gitkeep
      OK - Logs\Audit\.gitkeep erstellt

========================================
  Umbenennung abgeschlossen!
========================================

Übersicht der erstellten Dateien:

[OK] .gitignore
[OK] Saves\.gitkeep
[OK] Logs\.gitkeep
[OK] Logs\Audit\.gitkeep

========================================
  Nächste Schritte:
========================================

1. Git Status prüfen:
   git status

2. Dateien zu Git hinzufügen:
   git add .gitignore Saves\.gitkeep Logs\.gitkeep Logs\Audit\.gitkeep

3. Weiter mit GitHub Setup:
   Siehe: Installation\GitHub-QUICK-START.md
```

### Linux/macOS (rename-files.sh)

```
========================================
  FMSV Dingden - Dateien Umbenennen
========================================

Starte Umbenennung...

[1/4] Benenne gitignore.txt um zu .gitignore
      ✓ OK - .gitignore erstellt

[2/4] Benenne Saves/gitkeep.txt um zu Saves/.gitkeep
      ✓ OK - Saves/.gitkeep erstellt

[3/4] Benenne Logs/gitkeep.txt um zu Logs/.gitkeep
      ✓ OK - Logs/.gitkeep erstellt

[4/4] Benenne Logs/Audit/gitkeep.txt um zu Logs/Audit/.gitkeep
      ✓ OK - Logs/Audit/.gitkeep erstellt

========================================
  Umbenennung abgeschlossen!
========================================

Erfolg: 4 | Fehler: 0

Übersicht der erstellten Dateien:

✓ .gitignore
✓ Saves/.gitkeep
✓ Logs/.gitkeep
✓ Logs/Audit/.gitkeep

========================================
  Nächste Schritte:
========================================

1. Git Status prüfen:
   git status

2. Dateien zu Git hinzufügen:
   git add .gitignore Saves/.gitkeep Logs/.gitkeep Logs/Audit/.gitkeep

3. Weiter mit GitHub Setup:
   Siehe: Installation/GitHub-QUICK-START.md
```

---

## 🔧 Technische Details

### Windows (.bat)

- **Interpreter**: CMD (Command Prompt)
- **Kompatibilität**: Windows 7+, Windows Server 2008+
- **Befehl**: `ren` (rename)
- **Fehlerbehandlung**: `2>nul` unterdrückt Fehler
- **Prüfung**: `if exist` für Dateien

### Linux/macOS (.sh)

- **Interpreter**: Bash (`#!/bin/bash`)
- **Kompatibilität**: Linux, macOS, WSL
- **Befehl**: `mv` (move)
- **Fehlerbehandlung**: `2>/dev/null` unterdrückt Fehler
- **Prüfung**: `[ -f ]` für Dateien
- **Exit Code**: 0 bei Erfolg, 1 bei Fehler

---

## 🆘 Troubleshooting

### Problem: "Befehl nicht gefunden" (Linux/macOS)

**Lösung:** Script ausführbar machen

```bash
chmod +x rename-files.sh
./rename-files.sh
```

### Problem: "Zugriff verweigert" (Windows)

**Lösung 1:** Als Administrator ausführen
- Rechtsklick auf `rename-files.bat`
- "Als Administrator ausführen"

**Lösung 2:** PowerShell verwenden
```powershell
PowerShell -ExecutionPolicy Bypass -File rename-files.bat
```

### Problem: "Datei existiert bereits"

Das ist normal! Das Script erkennt das und zeigt:

```
[1/4] .gitignore existiert bereits
```

Die Datei wurde bereits umbenannt, alles OK!

### Problem: "FEHLER: backend/ Ordner nicht gefunden"

**Ursache:** Script wurde im falschen Ordner ausgeführt.

**Lösung:** Im Haupt-Projekt-Ordner ausführen:

```bash
cd /pfad/zu/fmsv-dingden
./rename-files.sh
```

### Problem: "Umbenennung fehlgeschlagen"

**Mögliche Ursachen:**
1. Datei ist schreibgeschützt
2. Datei wird von anderem Programm verwendet
3. Keine Schreibrechte im Ordner

**Lösung:**
```bash
# Rechte prüfen
ls -la gitignore.txt

# Schreibschutz entfernen (Linux/macOS)
chmod +w gitignore.txt

# Dann erneut versuchen
./rename-files.sh
```

---

## 🎓 Warum überhaupt umbenennen?

### Das Problem

Dateien die mit `.` (Punkt) beginnen sind:

- **In Unix-Systemen:** Versteckte Dateien
- **In dieser Umgebung:** Können nicht direkt erstellt werden

Deshalb liegen sie als `.txt` Dateien vor und müssen lokal umbenannt werden.

### Die Dateien

#### `.gitignore`
Sagt Git welche Dateien NICHT committed werden sollen:
- `.env` (Passwörter)
- `Saves/*` (User-Uploads)
- `Logs/*.log` (Log-Dateien)
- `node_modules/` (Dependencies)

#### `.gitkeep`
Hält leere Ordner in Git:
- `Saves/` - Für File-Uploads
- `Logs/` - Für Logs
- `Logs/Audit/` - Für Audit-Logs

Git speichert nur Dateien, keine leeren Ordner. Mit `.gitkeep` bleiben sie erhalten!

---

## 🔗 Weitere Infos

| Thema | Datei |
|-------|-------|
| Manuelles Umbenennen | [`Installation/DATEIEN-UMBENENNEN.md`](Installation/DATEIEN-UMBENENNEN.md) |
| .gitignore Erklärung | [`Installation/GITIGNORE-ERKLAERUNG.md`](Installation/GITIGNORE-ERKLAERUNG.md) |
| GitHub Setup | [`Installation/GitHub-QUICK-START.md`](Installation/GitHub-QUICK-START.md) |
| Quick Start | [`START-HIER.md`](START-HIER.md) |

---

## ✅ Nach dem Umbenennen

1. **Git Status prüfen:**
   ```bash
   git status
   ```
   Sollte `.gitignore` und `.gitkeep` Dateien zeigen (ohne .txt)

2. **Dateien zu Git hinzufügen:**
   ```bash
   git add .gitignore Saves/.gitkeep Logs/.gitkeep Logs/Audit/.gitkeep
   ```

3. **Committen:**
   ```bash
   git commit -m "Add .gitignore and .gitkeep files"
   ```

4. **Weiter mit GitHub:**
   Siehe: [`Installation/GitHub-QUICK-START.md`](Installation/GitHub-QUICK-START.md)

---

**Viel Erfolg!** 🚀
