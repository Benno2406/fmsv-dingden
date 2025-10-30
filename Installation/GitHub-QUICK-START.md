# GitHub Quick Start

Schneller Einstieg für GitHub-Setup - die wichtigsten Schritte auf einen Blick.

---

## ⚠️ WICHTIG: Dateien umbenennen

**Vor dem Start:** Einige Dateien liegen als `.txt` vor und müssen umbenannt werden!

→ Siehe: [`DATEIEN-UMBENENNEN.md`](DATEIEN-UMBENENNEN.md)

**Quick Commands:**

```bash
# Linux/macOS
mv gitignore.txt .gitignore
mv Saves/gitkeep.txt Saves/.gitkeep
mv Logs/gitkeep.txt Logs/.gitkeep
mv Logs/Audit/gitkeep.txt Logs/Audit/.gitkeep

# Windows PowerShell
Rename-Item "gitignore.txt" ".gitignore"
Rename-Item "Saves\gitkeep.txt" "Saves\.gitkeep"
Rename-Item "Logs\gitkeep.txt" "Logs\.gitkeep"
Rename-Item "Logs\Audit\gitkeep.txt" "Logs\Audit\.gitkeep"
```

---

## 🚀 In 5 Minuten zu GitHub

### 1. Repository auf GitHub erstellen

```
https://github.com → New repository
Name: fmsv-dingden
Private ✓
NICHT initialisieren!
→ Create repository
```

### 2. Lokal einrichten

```bash
cd /path/to/fmsv-dingden

# Git initialisieren
git init
git add .
git commit -m "Initial commit"
git branch -M main

# Mit GitHub verbinden
git remote add origin https://github.com/DEIN-USERNAME/fmsv-dingden.git
git push -u origin main

# Testing Branch
git checkout -b testing
git push -u origin testing
```

### 3. Personal Access Token erstellen

```
GitHub → Settings → Developer settings
→ Personal access tokens → Tokens (classic)
→ Generate new token

Scopes:
✓ repo
✓ workflow

→ Generate token
→ Token kopieren: ghp_xxxxx...
```

### 4. Token verwenden

Beim nächsten Push:
- **Username:** dein-github-username
- **Password:** ghp_xxxxx... (Token)

### 5. Workflow-File verschieben

```bash
mkdir -p .github/workflows
mv workflows/deploy.yml .github/workflows/
rmdir workflows
git add .github/workflows/deploy.yml
git commit -m "GitHub Actions hinzugefügt"
git push origin main
git push origin testing
```

### 6. Auf Server installieren

```bash
ssh root@dein-server
cd /var/www
git clone https://github.com/DEIN-USERNAME/fmsv-dingden.git
cd fmsv-dingden/Installation/scripts
chmod +x install.sh
sudo ./install.sh
```

Bei "GitHub Repository URL": `https://github.com/DEIN-USERNAME/fmsv-dingden.git`

---

## 🔄 Update-Workflow

### Neues Feature entwickeln

```bash
# Lokal
git checkout testing
# ... Code ändern ...
git add .
git commit -m "Feature: XYZ"
git push origin testing
```

→ Testing-Server updated automatisch

### Nach erfolgreichem Test → Production

```bash
# Lokal
git checkout main
git merge testing
git push origin main
```

→ Production-Server updated automatisch

---

## ✅ Wichtigste Regeln

1. ❌ **NIEMALS** `.env` Dateien pushen
2. ❌ **NIEMALS** `Saves/` Uploads pushen
3. ✅ **IMMER** erst `git status` prüfen
4. ✅ Testing vor Production
5. ✅ Token sicher aufbewahren

---

## 🆘 Häufigste Probleme

### Push schlägt fehl

```bash
# Token verwenden statt Passwort!
git push
Username: dein-username
Password: ghp_xxxxx...
```

### .env ist in Git

```bash
# Aus Git entfernen
git rm --cached backend/.env
git commit -m ".env entfernt"
git push origin main
```

### Auto-Update zieht keine Updates

```bash
# Auf Server
cd /var/www/fmsv-dingden
git status
git fetch origin
git log HEAD..origin/main

# Falls nötig
git reset --hard origin/main
```

---

## 📚 Ausführliche Anleitung

→ [`/Installation/Anleitung/GitHub-Setup.md`](Anleitung/GitHub-Setup.md)

**Alles detailliert erklärt:** Repository-Setup, Branches, Token, Workflow, Troubleshooting

---

**Fertig in 5 Minuten!** 🎉
