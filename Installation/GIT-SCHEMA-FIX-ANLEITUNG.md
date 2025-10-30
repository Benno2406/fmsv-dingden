# 🔧 schema.sql Git Problem - Komplette Lösung

## ❌ Problem

**Symptom:** Nach `git clone` fehlt die Datei `backend/database/schema.sql`

**Ursache:** Die Datei wurde durch `*.sql` in `.gitignore` blockiert und wurde nie zu Git committed, auch wenn jetzt eine Exception existiert.

---

## ✅ Lösung (für Repository-Besitzer)

### Schritt 1: schema.sql zu Git hinzufügen (EINMALIG)

```bash
cd /pfad/zum/fmsv-dingden

# Automatisches Fix-Script ausführen
chmod +x fix-schema-git.sh
./fix-schema-git.sh

# Commit erstellen
git commit -m "fix: schema.sql zu Repository hinzugefügt

- schema.sql wurde durch *.sql in .gitignore blockiert
- Exception !backend/database/schema.sql existiert jetzt
- Datei wurde force-added zum Git-Index"

# Zum Repository pushen
git push origin main  # oder dein Branch
```

**Das war's!** Ab jetzt wird `schema.sql` bei jedem `git clone` mitgeladen.

---

## 🔄 Lösung (für Nutzer die Repository klonen)

Falls du das Repository **nach** dem Fix klonst, sollte alles funktionieren.

Falls du es **vorher** geklont hast und die Datei fehlt:

### Option 1: Quick-Fix (Empfohlen)

```bash
cd /var/www/fmsv-dingden/Installation/scripts
chmod +x repair-files.sh
sudo ./repair-files.sh

# Wähle Option [1]: Git Pull
```

---

### Option 2: Manueller Git Pull

```bash
cd /var/www/fmsv-dingden
git pull origin main  # oder dein Branch

# Prüfe ob Datei jetzt da ist
ls -lh backend/database/schema.sql
```

---

### Option 3: Direkt von GitHub laden

```bash
cd /var/www/fmsv-dingden

# Von GitHub laden (ersetze BRANCH mit deinem Branch-Namen)
curl -o backend/database/schema.sql \
  https://raw.githubusercontent.com/Achim-Sommer/fmsv-dingden/main/backend/database/schema.sql

# Prüfen
ls -lh backend/database/schema.sql
```

---

### Option 4: Neu klonen

```bash
# Altes Verzeichnis löschen (VORSICHT: Backup von .env!)
cd /var/www/fmsv-dingden/backend
cp .env /tmp/env-backup

cd /
rm -rf /var/www/fmsv-dingden

# Neu klonen
git clone https://github.com/Achim-Sommer/fmsv-dingden.git /var/www/fmsv-dingden
cd /var/www/fmsv-dingden

# .env wiederherstellen
cp /tmp/env-backup backend/.env

# Prüfen
ls -lh backend/database/schema.sql
```

---

## 🛠️ Automatische Reparatur im install.sh

Das `install.sh` Script versucht jetzt **automatisch** die Datei wiederherzustellen:

```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./install.sh
```

**Automatische Versuche:**
1. ✅ `git checkout origin/branch -- backend/database/schema.sql`
2. ✅ `git restore --source=origin/branch backend/database/schema.sql`
3. ✅ Download von GitHub Raw
4. ✅ `git pull origin branch`

Wenn alle Versuche fehlschlagen, zeigt das Script detaillierte Hilfe.

---

## 🔍 Wie prüfe ich ob das Problem behoben ist?

### Test 1: Lokale Prüfung

```bash
cd /pfad/zum/fmsv-dingden
ls -lh backend/database/schema.sql

# Sollte zeigen:
# -rw-r--r-- 1 user group 15K Oct 30 12:00 schema.sql
```

### Test 2: Git-Status

```bash
cd /pfad/zum/fmsv-dingden
git status backend/database/schema.sql

# VORHER (Problem):
# On branch main
# Untracked files:
#   backend/database/schema.sql

# NACHHER (Gelöst):
# On branch main
# nothing to commit, working tree clean
```

### Test 3: Git ls-files

```bash
cd /pfad/zum/fmsv-dingden
git ls-files | grep schema.sql

# Sollte zeigen:
# backend/database/schema.sql
```

### Test 4: Neu-Klonen Test

```bash
# In temporärem Verzeichnis
cd /tmp
rm -rf test-clone
git clone https://github.com/Achim-Sommer/fmsv-dingden.git test-clone
ls -lh test-clone/backend/database/schema.sql

# Sollte Datei zeigen, NICHT "No such file"
```

---

## 📋 Warum ist das passiert?

Git hat ein spezielles Verhalten mit `.gitignore`:

1. **`*.sql` in .gitignore** → Alle .sql Dateien werden ignoriert
2. **Datei wird erstellt** → Git ignoriert sie (wegen Regel #1)
3. **Exception wird hinzugefügt** (`!backend/database/schema.sql`) → Git ignoriert sie **WEITERHIN**!
4. **Warum?** → Git trackt nur Dateien die **explizit** hinzugefügt wurden (`git add`)

**Lösung:** `git add -f` (force) um die Exception zu aktivieren

---

## 🎯 Was macht `fix-schema-git.sh`?

Das Script automatisiert den Fix:

```bash
#!/bin/bash
# 1. Prüft ob schema.sql existiert
# 2. Prüft .gitignore auf Exception
# 3. Fügt Exception hinzu falls fehlend
# 4. Entfernt schema.sql aus Git-Cache
# 5. Fügt schema.sql mit --force hinzu
# 6. Zeigt Git-Status
```

**Wichtig:** Nach dem Script muss noch committed und gepusht werden!

---

## 🚫 Häufige Fehler

### Fehler 1: "Already ignored by a .gitignore rule"

**Problem:** Exception in .gitignore fehlt oder falsch

**Lösung:**
```bash
cat .gitignore | grep schema.sql

# Sollte zeigen:
# *.sql
# !backend/database/schema.sql

# Falls nicht, hinzufügen:
echo "!backend/database/schema.sql" >> .gitignore
```

---

### Fehler 2: "Not tracked by git after adding exception"

**Problem:** Datei wurde nicht force-added

**Lösung:**
```bash
git rm --cached backend/database/schema.sql 2>/dev/null
git add -f backend/database/schema.sql
git status backend/database/schema.sql

# Sollte zeigen:
# Changes to be committed:
#   new file:   backend/database/schema.sql
```

---

### Fehler 3: "File appears after clone but is empty"

**Problem:** Leere Datei wurde committed

**Lösung:**
```bash
# Prüfe Größe
ls -lh backend/database/schema.sql

# Falls 0 Bytes oder sehr klein (<100 Bytes):
rm backend/database/schema.sql

# Hole korrekte Version
git checkout HEAD~1 -- backend/database/schema.sql

# Oder von anderem Branch
git checkout origin/main -- backend/database/schema.sql
```

---

## ✅ Checkliste "Problem ist gelöst"

Gehe diese Liste durch um sicherzustellen dass alles behoben ist:

- [ ] `ls backend/database/schema.sql` zeigt die Datei
- [ ] Datei ist **nicht leer** (mindestens 10 KB)
- [ ] `git ls-files | grep schema.sql` zeigt: `backend/database/schema.sql`
- [ ] `git status` zeigt **NICHT**: `Untracked files: backend/database/schema.sql`
- [ ] `.gitignore` enthält: `!backend/database/schema.sql` nach `*.sql`
- [ ] `git diff .gitignore` zeigt keine Änderungen (schon committed)
- [ ] Neu-Klonen in /tmp funktioniert und Datei ist da

---

## 📞 Immer noch Probleme?

### Debug-Informationen sammeln

```bash
cd /pfad/zum/fmsv-dingden

{
    echo "=== Git Status ==="
    git status backend/database/schema.sql
    echo ""
    
    echo "=== Git ls-files ==="
    git ls-files | grep -i schema
    echo ""
    
    echo "=== File exists? ==="
    ls -lh backend/database/schema.sql 2>&1
    echo ""
    
    echo "=== .gitignore ==="
    grep -A 2 -B 2 "sql" .gitignore
    echo ""
    
    echo "=== Git config ==="
    git config --list | grep -i ignore
    echo ""
} > /tmp/schema-debug.txt

cat /tmp/schema-debug.txt
```

Schicke `/tmp/schema-debug.txt` mit deiner Fehlermeldung.

---

## 🔄 Automatisches Testen

Nach dem Fix kannst du automatisch testen:

```bash
#!/bin/bash
# test-schema-fix.sh

cd /tmp
rm -rf test-fmsv-clone

echo "Klone Repository..."
if git clone https://github.com/Achim-Sommer/fmsv-dingden.git test-fmsv-clone; then
    if [ -f test-fmsv-clone/backend/database/schema.sql ]; then
        SIZE=$(stat -c%s test-fmsv-clone/backend/database/schema.sql)
        if [ "$SIZE" -gt 1000 ]; then
            echo "✅ SUCCESS: schema.sql wurde korrekt geklont ($SIZE Bytes)"
            exit 0
        else
            echo "❌ FAIL: schema.sql zu klein ($SIZE Bytes)"
            exit 1
        fi
    else
        echo "❌ FAIL: schema.sql nicht gefunden"
        exit 1
    fi
else
    echo "❌ FAIL: Git clone fehlgeschlagen"
    exit 1
fi

rm -rf test-fmsv-clone
```

---

**Version:** 1.0  
**Erstellt:** 30. Oktober 2025  
**Problem:** Git .gitignore blockiert schema.sql trotz Exception  
**Status:** Gelöst mit fix-schema-git.sh + automatischer Reparatur im install.sh
