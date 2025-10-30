# .gitignore & .gitkeep Erklärung

## ❓ Was war das Problem?

Beim Committen wurden die `.gitkeep` Dateien als gelöscht angezeigt (-3 Zeilen):

```
.gitignore      -180
.gitkeep        -3
.gitkeep        -3
.gitkeep        -3
```

**Ursache:** Die `.gitignore` hat die `.gitkeep` Dateien versehentlich mit ignoriert!

---

## 🔧 Die Lösung

### 1. `.gitkeep` Dateien - Was sind das?

`.gitkeep` Dateien sind ein Trick um **leere Ordner in Git zu behalten**.

**Problem:** Git speichert nur Dateien, keine leeren Ordner.

**Lösung:** Man legt eine `.gitkeep` Datei in den Ordner → Git speichert den Ordner.

### 2. Warum brauchen wir sie?

```
Saves/          ← Muss existieren für File-Uploads
Logs/           ← Muss existieren für Application-Logs
Logs/Audit/     ← Muss existieren für Audit-Logs
```

**Ohne `.gitkeep`:** Diese Ordner würden fehlen nach `git clone`!

**Mit `.gitkeep`:** Git erstellt die Ordner automatisch beim Klonen.

### 3. Das richtige .gitignore-Pattern

#### ❌ FALSCH (wie vorher):

```gitignore
Saves/*
!Saves/README.md
# .gitkeep wird ignoriert!
```

#### ✅ RICHTIG (jetzt):

```gitignore
Saves/*

# Ausnahmen: Diese Dateien NICHT ignorieren
!Saves/.gitkeep
!Saves/README.md
```

**Wichtig:** Das `!` bedeutet "Ausnahme" - diese Datei wird NICHT ignoriert!

---

## 📋 Aktuelle Konfiguration

### .gitignore Struktur

```gitignore
# 1. Alles in Saves/ ignorieren
Saves/*

# 2. ABER: Diese Dateien behalten
!Saves/.gitkeep
!Saves/README.md

# 3. Alles in Logs/ ignorieren
Logs/*.log
Logs/Audit/*.log
Logs/**/*.log

# 4. ABER: Diese Dateien behalten
!Logs/.gitkeep
!Logs/Audit/.gitkeep
!Logs/README.md
!Logs/Audit/README.md
```

### .gitkeep Dateien

```
/Saves/.gitkeep          ← Hält Saves/ Ordner
/Logs/.gitkeep           ← Hält Logs/ Ordner
/Logs/Audit/.gitkeep     ← Hält Logs/Audit/ Ordner
```

Inhalt jeder Datei:
```
# Keep this directory in git
```

---

## 🎯 Was wird jetzt committed?

### ✅ ZU GitHub (committed):

```
✅ .gitignore
✅ Saves/.gitkeep
✅ Saves/README.md
✅ Logs/.gitkeep
✅ Logs/Audit/.gitkeep
✅ Logs/README.md
✅ Logs/Audit/README.md
```

### ❌ NICHT zu GitHub (ignoriert):

```
❌ Saves/user-upload.jpg
❌ Saves/document.pdf
❌ Logs/app.log
❌ Logs/Audit/2025-01-30.log
❌ backend/.env
❌ node_modules/
```

---

## 🧪 Testen

### Test 1: Leere Ordner nach Clone?

```bash
# Repository klonen
git clone https://github.com/user/fmsv-dingden.git
cd fmsv-dingden

# Ordner existieren?
ls -la Saves/          # ✅ Sollte .gitkeep enthalten
ls -la Logs/           # ✅ Sollte .gitkeep enthalten
ls -la Logs/Audit/     # ✅ Sollte .gitkeep enthalten
```

### Test 2: Uploads werden ignoriert?

```bash
# Test-Upload erstellen
echo "test" > Saves/test-upload.jpg

# Git-Status prüfen
git status

# Sollte NICHT in der Liste sein!
# Falls doch → .gitignore funktioniert nicht
```

### Test 3: .env wird ignoriert?

```bash
# Test .env erstellen
echo "SECRET=123" > backend/.env

# Git-Status prüfen
git status

# Sollte NICHT in der Liste sein!
# Falls doch → GEFAHR! Nicht committen!
```

---

## ✅ Checkliste

Vor jedem Commit:

- [ ] `git status` ausführen
- [ ] Keine `.env` Dateien in der Liste
- [ ] Keine `Saves/` Uploads in der Liste
- [ ] Keine `Logs/` Log-Dateien in der Liste
- [ ] `.gitkeep` Dateien SIND in der Liste (beim ersten Mal)

---

## 🆘 Häufige Probleme

### Problem: .gitkeep wird nicht committed

```bash
# 1. Ist die Datei in .gitignore ausgenommen?
cat .gitignore | grep -A2 "Saves/\*"

# Sollte zeigen:
# Saves/*
# !Saves/.gitkeep
# !Saves/README.md

# 2. Datei explizit hinzufügen
git add -f Saves/.gitkeep
git commit -m "Add .gitkeep for Saves directory"
```

### Problem: Uploads werden committed

```bash
# 1. .gitignore prüfen
cat .gitignore | grep "Saves"

# Sollte enthalten:
# Saves/*

# 2. Aus Git entfernen (aber nicht löschen)
git rm --cached Saves/upload.jpg
git commit -m "Remove uploaded files from git"

# 3. .gitignore fixen und neu committen
```

### Problem: .env wurde committed

**🚨 GEFAHR! Sofort handeln:**

```bash
# 1. Aus Git entfernen
git rm --cached backend/.env

# 2. Committen
git commit -m "Remove .env from git"

# 3. Zu GitHub pushen
git push origin main

# 4. Passwörter/Secrets in .env ÄNDERN!
# Sie sind jetzt öffentlich in der Git-Historie!

# 5. GitHub Secret Scanning aktivieren
# Settings → Security → Secret scanning
```

---

## 📚 Weitere Infos

- **Git Ignore Patterns:** [git-scm.com/docs/gitignore](https://git-scm.com/docs/gitignore)
- **GitHub Best Practices:** [docs.github.com/en/get-started/getting-started-with-git/ignoring-files](https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files)
- **.gitkeep Convention:** [stackoverflow.com/questions/7229885/what-are-the-differences-between-gitignore-and-gitkeep](https://stackoverflow.com/questions/7229885/what-are-the-differences-between-gitignore-and-gitkeep)

---

## 💡 Zusammenfassung

**Vorher:**
```
❌ .gitkeep Dateien wurden ignoriert
❌ Leere Ordner fehlen nach clone
❌ -3 Zeilen bei git status
```

**Jetzt:**
```
✅ .gitkeep Dateien werden committed
✅ Leere Ordner bleiben erhalten
✅ Uploads werden ignoriert
✅ .env wird ignoriert
```

**Wichtigste Regel:**
```
Ignoriere alles in einem Ordner: Ordner/*
Behalte .gitkeep:                !Ordner/.gitkeep
```

---

**Problem gelöst!** 🎉
