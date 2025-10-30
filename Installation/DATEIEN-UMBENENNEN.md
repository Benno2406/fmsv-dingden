# Dateien umbenennen - Schritt für Schritt

## ❓ Warum .txt Dateien?

Dateien die mit einem Punkt beginnen (`.gitignore`, `.gitkeep`) können in dieser Umgebung nicht erstellt werden. Deshalb habe ich `.txt` Versionen erstellt, die du lokal umbenennen musst.

---

## 📋 Dateien zum Umbenennen

Diese Dateien müssen umbenannt werden:

```
gitignore.txt           → .gitignore
Saves/gitkeep.txt       → Saves/.gitkeep
Logs/gitkeep.txt        → Logs/.gitkeep
Logs/Audit/gitkeep.txt  → Logs/Audit/.gitkeep
```

---

## 🪟 Windows

### Methode 1: Explorer (Grafisch)

1. **Versteckte Dateien anzeigen:**
   - Windows Explorer öffnen
   - `Ansicht` → `Anzeigen` → `Ausgeblendete Elemente` ✓

2. **Dateien umbenennen:**
   - Rechtsklick auf `gitignore.txt` → `Umbenennen`
   - Neuer Name: `.gitignore`
   - Warnung "Möchten Sie wirklich die Erweiterung ändern?" → `Ja`

3. **Für alle Dateien wiederholen**

### Methode 2: PowerShell (Befehl)

```powershell
# PowerShell öffnen im Projekt-Ordner
cd C:\Pfad\zu\fmsv-dingden

# Dateien umbenennen
Rename-Item -Path "gitignore.txt" -NewName ".gitignore"
Rename-Item -Path "Saves\gitkeep.txt" -NewName "Saves\.gitkeep"
Rename-Item -Path "Logs\gitkeep.txt" -NewName "Logs\.gitkeep"
Rename-Item -Path "Logs\Audit\gitkeep.txt" -NewName "Logs\Audit\.gitkeep"

# Überprüfen
Get-ChildItem -Force | Where-Object {$_.Name -like ".*"}
Get-ChildItem Saves -Force | Where-Object {$_.Name -like ".*"}
Get-ChildItem Logs -Force | Where-Object {$_.Name -like ".*"}
Get-ChildItem Logs\Audit -Force | Where-Object {$_.Name -like ".*"}
```

### Methode 3: CMD (Befehl)

```cmd
:: CMD öffnen im Projekt-Ordner
cd C:\Pfad\zu\fmsv-dingden

:: Dateien umbenennen
ren gitignore.txt .gitignore
ren Saves\gitkeep.txt .gitkeep
ren Logs\gitkeep.txt .gitkeep
ren Logs\Audit\gitkeep.txt .gitkeep

:: Überprüfen
dir /a:h .gitignore
dir /a:h Saves\.gitkeep
dir /a:h Logs\.gitkeep
dir /a:h Logs\Audit\.gitkeep
```

---

## 🐧 Linux / macOS

### Terminal-Befehle

```bash
# Terminal öffnen im Projekt-Ordner
cd /pfad/zu/fmsv-dingden

# Dateien umbenennen
mv gitignore.txt .gitignore
mv Saves/gitkeep.txt Saves/.gitkeep
mv Logs/gitkeep.txt Logs/.gitkeep
mv Logs/Audit/gitkeep.txt Logs/Audit/.gitkeep

# Überprüfen
ls -la | grep "^\."
ls -la Saves/ | grep "^\."
ls -la Logs/ | grep "^\."
ls -la Logs/Audit/ | grep "^\."
```

### Alle auf einmal (Einzeiler)

```bash
# Alle Dateien umbenennen
mv gitignore.txt .gitignore && \
mv Saves/gitkeep.txt Saves/.gitkeep && \
mv Logs/gitkeep.txt Logs/.gitkeep && \
mv Logs/Audit/gitkeep.txt Logs/Audit/.gitkeep

# Status
echo "Dateien umbenannt:"
ls -la .gitignore Saves/.gitkeep Logs/.gitkeep Logs/Audit/.gitkeep
```

---

## ✅ Überprüfung

### Nach dem Umbenennen solltest du haben:

```
fmsv-dingden/
├── .gitignore              ✓ (nicht mehr .txt)
├── Saves/
│   └── .gitkeep            ✓ (nicht mehr .txt)
├── Logs/
│   ├── .gitkeep            ✓ (nicht mehr .txt)
│   └── Audit/
│       └── .gitkeep        ✓ (nicht mehr .txt)
```

### Git-Status prüfen:

```bash
git status
```

Sollte zeigen:
```
Untracked files:
  .gitignore
  Saves/.gitkeep
  Logs/.gitkeep
  Logs/Audit/.gitkeep
```

**Alle ohne "gitignore.txt" oder "gitkeep.txt"!**

---

## 🚀 Weiter mit Git

Nach dem Umbenennen:

```bash
# Dateien zu Git hinzufügen
git add .gitignore
git add Saves/.gitkeep
git add Logs/.gitkeep
git add Logs/Audit/.gitkeep

# Status prüfen
git status

# Sollte zeigen:
# Changes to be committed:
#   new file:   .gitignore
#   new file:   Saves/.gitkeep
#   new file:   Logs/.gitkeep
#   new file:   Logs/Audit/.gitkeep

# Committen
git commit -m "Add .gitignore and .gitkeep files"

# Zu GitHub pushen
git push origin main
```

---

## 🗑️ .txt Dateien löschen (optional)

Falls du die `.txt` Dateien noch siehst:

```bash
# Windows PowerShell
Remove-Item gitignore.txt -ErrorAction SilentlyContinue
Remove-Item Saves\gitkeep.txt -ErrorAction SilentlyContinue
Remove-Item Logs\gitkeep.txt -ErrorAction SilentlyContinue
Remove-Item Logs\Audit\gitkeep.txt -ErrorAction SilentlyContinue

# Linux/macOS
rm -f gitignore.txt
rm -f Saves/gitkeep.txt
rm -f Logs/gitkeep.txt
rm -f Logs/Audit/gitkeep.txt
```

---

## 🆘 Probleme?

### Problem: "Datei existiert bereits"

```bash
# Windows
del .gitignore
ren gitignore.txt .gitignore

# Linux/macOS
rm .gitignore
mv gitignore.txt .gitignore
```

### Problem: "Zugriff verweigert"

```bash
# Windows: Als Administrator ausführen
# PowerShell → Rechtsklick → Als Administrator ausführen

# Linux/macOS: Mit sudo
sudo mv gitignore.txt .gitignore
```

### Problem: Dateien nicht sichtbar

**Windows:**
- Explorer → Ansicht → Ausgeblendete Elemente ✓

**Linux/macOS:**
```bash
ls -la  # -a zeigt versteckte Dateien
```

---

## 📝 Checkliste

Nach dem Umbenennen:

- [ ] `.gitignore` existiert (ohne .txt)
- [ ] `Saves/.gitkeep` existiert (ohne .txt)
- [ ] `Logs/.gitkeep` existiert (ohne .txt)
- [ ] `Logs/Audit/.gitkeep` existiert (ohne .txt)
- [ ] `git status` zeigt die Dateien an
- [ ] Keine `.txt` Versionen mehr vorhanden
- [ ] Dateien zu Git hinzugefügt
- [ ] Committed und gepusht

---

## 💡 Quick Commands

### Windows PowerShell (Alles in einem)

```powershell
cd C:\Pfad\zu\fmsv-dingden
Rename-Item "gitignore.txt" ".gitignore"
Rename-Item "Saves\gitkeep.txt" "Saves\.gitkeep"
Rename-Item "Logs\gitkeep.txt" "Logs\.gitkeep"
Rename-Item "Logs\Audit\gitkeep.txt" "Logs\Audit\.gitkeep"
git add .gitignore Saves/.gitkeep Logs/.gitkeep Logs/Audit/.gitkeep
git status
```

### Linux/macOS (Alles in einem)

```bash
cd /pfad/zu/fmsv-dingden
mv gitignore.txt .gitignore
mv Saves/gitkeep.txt Saves/.gitkeep
mv Logs/gitkeep.txt Logs/.gitkeep
mv Logs/Audit/gitkeep.txt Logs/Audit/.gitkeep
git add .gitignore Saves/.gitkeep Logs/.gitkeep Logs/Audit/.gitkeep
git status
```

---

**Fertig!** 🎉 Weiter mit: [`GitHub-QUICK-START.md`](GitHub-QUICK-START.md)
