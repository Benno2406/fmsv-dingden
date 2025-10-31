# GitHub Setup & Konfiguration

Vollständige Anleitung zum Einrichten des GitHub Repositories für FMSV Dingden mit Auto-Update-System.

---

## 📋 Übersicht

Das Auto-Update-System funktioniert so:

```
GitHub Repository (main/testing)
        ↓
Server prüft regelmäßig auf Updates
        ↓
Falls Updates verfügbar → Pull & Deploy
Falls keine Updates → Nichts tun
```

**Wichtig:** Das Auto-Update-System prüft **immer erst**, ob neue Commits verfügbar sind, bevor es updated!

---

## 🚀 Schritt 1: GitHub Repository erstellen

### 1.1 Auf GitHub

1. Gehe zu [github.com](https://github.com)
2. Klicke auf **"New repository"** (grüner Button)
3. Konfiguration:
   - **Repository name:** `fmsv-dingden`
   - **Description:** `Vereinshomepage für Flugmodellsportverein Dingden e.V.`
   - **Visibility:** 
     - `Private` (empfohlen) - Nur du hast Zugriff
     - `Public` - Jeder kann sehen (wenn gewünscht)
   - **Initialize:**
     - ❌ **NICHT** "Add a README file" anklicken
     - ❌ **NICHT** ".gitignore" hinzufügen
     - ❌ **NICHT** "Choose a license" auswählen

4. Klicke auf **"Create repository"**

### 1.2 Repository-URL notieren

Nach dem Erstellen siehst du die Repository-URL:

```
https://github.com/Benno2406/fmsv-dingden.git
```

**Diese URL brauchst du später!**

---

## 📁 Schritt 2: .gitignore erstellen

Das `.gitignore` File definiert, welche Dateien **NICHT** zu GitHub hochgeladen werden.

### 2.1 .gitignore erstellen

Erstelle die Datei im Projekt-Root:

```bash
cd /path/to/fmsv-dingden
nano .gitignore
```

### 2.2 .gitignore Inhalt

**Wichtig:** Die `.gitignore` ist bereits im Projekt vorhanden!

Prüfe ob sie korrekt ist:

```bash
cat .gitignore | grep -A3 "Saves/"
```

Sollte zeigen:
```gitignore
Saves/*

# ABER: .gitkeep und README.md behalten!
!Saves/.gitkeep
!Saves/README.md
```

**Das `!` bedeutet Ausnahme** - diese Dateien werden NICHT ignoriert!

Vollständiger Inhalt (bereits vorhanden):

```gitignore
# Dependencies
node_modules/
backend/node_modules/

# Build Output
dist/
build/
*.tsbuildinfo

# Environment Variables (WICHTIG!)
.env
backend/.env
.env.local
.env.production

# Logs
*.log
npm-debug.log*
Logs/*.log
Logs/Audit/*.log

# ABER: .gitkeep behalten!
!Logs/.gitkeep
!Logs/Audit/.gitkeep

# Uploads (nicht in Git!)
Saves/*

# ABER: .gitkeep und README.md behalten!
!Saves/.gitkeep
!Saves/README.md

# OS Files
.DS_Store
Thumbs.db
desktop.ini

# IDE Files
.vscode/
.idea/
*.swp
*.swo
*~

# Temporary Files
*.tmp
*.temp
.cache/

# Database
*.sql
*.sqlite
*.db

# Backups
*.backup
*.bak

# Coverage & Tests
coverage/
.nyc_output/
test-results/

# Cloudflare
.cloudflared/
```

### 2.3 Speichern

- `Ctrl + O` zum Speichern
- `Enter` bestätigen
- `Ctrl + X` zum Beenden

---

## 🔧 Schritt 3: Git initialisieren

### 3.1 Git Repository initialisieren

```bash
cd /path/to/fmsv-dingden

# Git initialisieren
git init

# Überprüfen
git status
```

### 3.2 Erste Dateien hinzufügen

```bash
# Alle Dateien hinzufügen (außer .gitignore)
git add .

# Status prüfen (welche Dateien werden committed?)
git status
```

**Wichtig:** Überprüfe, dass **KEINE** `.env` Dateien oder Uploads in der Liste sind!

```bash
# Sollte leer sein:
git status | grep .env
git status | grep Saves
```

### 3.3 Erster Commit

```bash
git commit -m "Initial commit - FMSV Dingden Vereinshomepage"
```

### 3.4 Branch in 'main' umbenennen

```bash
# Aktuellen Branch überprüfen
git branch

# Falls nicht 'main', umbenennen:
git branch -M main
```

---

## 🌿 Schritt 4: Testing Branch erstellen

Der Testing-Branch ist für neue Features und Tests.

```bash
# Testing Branch erstellen
git checkout -b testing

# Zurück zu main
git checkout main

# Überprüfen
git branch
```

Du solltest jetzt sehen:
```
* main
  testing
```

---

## 🔗 Schritt 5: Mit GitHub verbinden

### 5.1 Remote hinzufügen

```bash
# GitHub Repository als Remote hinzufügen
git remote add origin https://github.com/DEIN-USERNAME/fmsv-dingden.git

# Überprüfen
git remote -v
```

Du solltest sehen:
```
origin  https://github.com/DEIN-USERNAME/fmsv-dingden.git (fetch)
origin  https://github.com/DEIN-USERNAME/fmsv-dingden.git (push)
```

### 5.2 Main Branch pushen

```bash
# Main Branch zu GitHub pushen
git push -u origin main
```

**Erste mal pushen?** Du wirst nach GitHub-Zugangsdaten gefragt:
- Username: `dein-github-username`
- Password: **Personal Access Token** (siehe unten)

### 5.3 Testing Branch pushen

```bash
# Testing Branch pushen
git push -u origin testing
```

---

## 🔑 Schritt 6: Personal Access Token erstellen

GitHub erlaubt keine Passwort-Authentifizierung mehr. Du brauchst einen **Personal Access Token**.

### 6.1 Token erstellen

1. Gehe zu GitHub → Settings
2. Scrolle nach unten zu **"Developer settings"**
3. Klicke auf **"Personal access tokens"** → **"Tokens (classic)"**
4. Klicke auf **"Generate new token"** → **"Generate new token (classic)"**

### 6.2 Token konfigurieren

- **Note:** `FMSV Dingden Server Access`
- **Expiration:** 90 days (oder länger)
- **Scopes:** 
  - ✅ `repo` (Full control of private repositories)
  - ✅ `workflow` (Update GitHub Action workflows)

### 6.3 Token kopieren

⚠️ **Wichtig:** Der Token wird nur **einmal** angezeigt!

```
ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Kopiere ihn und speichere ihn sicher!**

### 6.4 Token verwenden

Wenn du das nächste Mal pushst:
- **Username:** dein-github-username
- **Password:** dein-personal-access-token

Oder speichere ihn im Git Credential Helper:

```bash
# Token speichern
git config --global credential.helper store

# Nächstes mal pushen - Token wird gespeichert
git push
```

---

## 📊 Schritt 7: GitHub Actions konfigurieren

Die GitHub Actions testen automatisch jeden Commit.

### 7.1 Workflows-Verzeichnis verschieben

Das Workflow-File liegt aktuell falsch:

```bash
# Von /workflows nach /.github/workflows verschieben
mkdir -p .github/workflows
mv workflows/deploy.yml .github/workflows/

# Altes Verzeichnis löschen
rmdir workflows
```

### 7.2 Workflow committen

```bash
git add .github/workflows/deploy.yml
git commit -m "GitHub Actions Workflow hinzugefügt"
git push origin main
git push origin testing
```

### 7.3 Workflow überprüfen

1. Gehe zu GitHub → Dein Repository
2. Klicke auf **"Actions"**
3. Du solltest den Workflow **"Deploy"** sehen

Jeder Push löst jetzt automatisch einen Build-Test aus!

---

## 🔄 Schritt 8: Auto-Update testen

### 8.1 Auf Server installieren

```bash
# Auf Server
cd /var/www
git clone https://github.com/DEIN-USERNAME/fmsv-dingden.git
cd fmsv-dingden/Installation/scripts
chmod +x install.sh
sudo ./install.sh
```

Gib bei **"GitHub Repository URL"** deine URL ein:
```
https://github.com/DEIN-USERNAME/fmsv-dingden.git
```

### 8.2 Auto-Update Status prüfen

```bash
# Timer-Status
systemctl status fmsv-auto-update.timer

# Nächster Update-Zeitpunkt
systemctl list-timers | grep fmsv

# Logs
tail -f /var/log/fmsv-auto-update.log
```

### 8.3 Manuell testen

```bash
# Update manuell auslösen
systemctl start fmsv-auto-update.service

# Logs ansehen
journalctl -u fmsv-auto-update.service -f
```

**Was passiert:**
1. Script fetched von GitHub
2. Vergleicht lokale mit Remote-Version
3. **Falls keine Updates:** "Keine Updates verfügbar" → Exit
4. **Falls Updates verfügbar:** Pull → Build → Deploy

---

## 🎯 Schritt 9: Workflow für Updates

### 9.1 Lokaler PC → Testing

```bash
# Auf lokalem PC
cd /path/to/fmsv-dingden

# Zu Testing-Branch wechseln
git checkout testing

# Änderungen machen...
nano App.tsx

# Committen
git add .
git commit -m "Neues Feature: XYZ"

# Zu GitHub pushen
git push origin testing
```

**Auf Testing-Server:**
```bash
# Auto-Update läuft automatisch (täglich/wöchentlich)
# Oder manuell:
systemctl start fmsv-auto-update.service
```

### 9.2 Testing → Stable (Production)

Nach erfolgreichem Testing:

```bash
# Auf lokalem PC
git checkout main
git merge testing
git push origin main
```

**Auf Production-Server:**
```bash
# Auto-Update läuft automatisch
# Oder manuell:
systemctl start fmsv-auto-update.service
```

### 9.3 Workflow-Diagramm

**Entwicklungs-Workflow:**

1. **Lokaler PC:** Feature entwickeln
2. **Push zu GitHub:** `git push origin testing`
3. **Testing-Server:** Auto-Update zieht Updates
4. **Testen:** Feature auf Testing-Server testen
5. **Merge:** `git checkout main && git merge testing`
6. **Push zu GitHub:** `git push origin main`
7. **Production-Server:** Auto-Update zieht Updates

**Visualisiert:**
```
Lokaler PC → GitHub (testing) → Testing-Server
                                      ↓
                                  Alles OK?
                                      ↓
Lokaler PC → GitHub (main) → Production-Server
   (merge)
```

---

## 🔍 Schritt 10: Auto-Update Funktionsweise

### 10.1 Was macht das Auto-Update Script?

```bash
# 1. Update-Branch aus .env lesen
BRANCH=$(grep UPDATE_BRANCH backend/.env | cut -d '=' -f2)

# 2. Updates fetchen
git fetch origin

# 3. Versionen vergleichen
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/$BRANCH)

# 4. Prüfung
if [ "$LOCAL" = "$REMOTE" ]; then
    echo "Keine Updates verfügbar"
    exit 0  # ← Beendet hier! Kein Update!
fi

# 5. Nur wenn Updates verfügbar:
git pull origin $BRANCH
npm install
npm run build
systemctl restart services
```

**Wichtig:** Das Script updated **NUR** wenn neue Commits auf GitHub sind!

### 10.2 Logs überprüfen

```bash
# Auto-Update Logs
tail -f /var/log/fmsv-auto-update.log
```

**Bei keinen Updates:**
```
[2025-01-30 03:00:01] ====== Auto-Update gestartet ======
[2025-01-30 03:00:01] Update-Branch: main
[2025-01-30 03:00:02] Keine Updates verfügbar
```

**Bei Updates:**
```
[2025-01-30 03:00:01] ====== Auto-Update gestartet ======
[2025-01-30 03:00:01] Update-Branch: main
[2025-01-30 03:00:02] Updates gefunden: abc123 -> def456
[2025-01-30 03:00:03] Aktualisiere Backend...
[2025-01-30 03:00:15] Aktualisiere Frontend...
[2025-01-30 03:02:30] Starte Services neu...
[2025-01-30 03:02:35] ====== Auto-Update abgeschlossen ======
```

---

## 🛡️ Schritt 11: Sicherheit

### 11.1 Sensible Daten schützen

**NIEMALS zu GitHub pushen:**
- ❌ `.env` Dateien
- ❌ Datenbank-Passwörter
- ❌ JWT Secrets
- ❌ API Keys
- ❌ Uploads (Bilder, Dokumente)

**Überprüfen:**
```bash
# Vor jedem Commit:
git status

# Sollte NICHT in der Liste sein:
# - backend/.env
# - Saves/
# - Logs/
```

### 11.2 Token-Sicherheit

- ✅ Personal Access Token sicher aufbewahren
- ✅ Nicht in Skripten einbetten
- ✅ Regelmäßig erneuern (alle 90 Tage)
- ✅ Bei Verdacht sofort löschen und neu erstellen

### 11.3 Repository-Zugriff

**Private Repository (empfohlen):**
- Nur du hast Zugriff
- Sicherer für Vereins-Daten

**Public Repository:**
- Jeder kann Code sehen
- Keine sensiblen Daten in Code!
- Nur wenn du Open Source willst

---

## 📚 Schritt 12: Häufige Commands

### Lokaler PC

```bash
# Status prüfen
git status

# Änderungen hinzufügen
git add .

# Committen
git commit -m "Beschreibung der Änderung"

# Zu GitHub pushen
git push origin main        # oder testing

# Von GitHub pullen
git pull origin main        # oder testing

# Branch wechseln
git checkout testing        # oder main

# Merge testing → main
git checkout main
git merge testing
git push origin main

# Commit-Historie ansehen
git log --oneline -10
```

### Server

```bash
# Aktuellen Branch prüfen
cd /var/www/fmsv-dingden
git branch

# Welche Version läuft?
git log --oneline -1

# Git-Status
git status

# Manuelle Updates
cd Installation/scripts
sudo ./update.sh

# Auto-Update Status
systemctl status fmsv-auto-update.timer

# Auto-Update manuell auslösen
systemctl start fmsv-auto-update.service

# Logs
tail -f /var/log/fmsv-auto-update.log
```

---

## 🆘 Troubleshooting

### Problem: Push funktioniert nicht

**Fehler:** `Authentication failed`

**Lösung:**
```bash
# 1. Überprüfe Remote-URL
git remote -v

# 2. Erstelle neuen Personal Access Token
# (siehe Schritt 6)

# 3. Verwende Token als Passwort
git push
# Username: dein-username
# Password: ghp_xxxxxxxxxxxx
```

### Problem: Auto-Update zieht keine Updates

**Überprüfen:**
```bash
# 1. Auf Server
cd /var/www/fmsv-dingden
git fetch origin

# 2. Vergleichen
git log HEAD..origin/main  # oder origin/testing

# 3. Manuell ziehen
git pull origin main

# 4. Wenn Fehler: Lokale Änderungen zurücksetzen
git reset --hard origin/main
```

### Problem: Git zeigt Änderungen an, die nicht da sein sollten

**Lösung:**
```bash
# 1. Welche Dateien?
git status

# 2. Falls .env oder ähnliches:
# .gitignore erstellen/anpassen
nano .gitignore

# 3. Cached files entfernen
git rm --cached backend/.env
git rm --cached -r Saves/

# 4. Committen
git commit -m ".gitignore aktualisiert"
git push origin main
```

### Problem: Merge-Konflikte

**Fehler:** `CONFLICT (content): Merge conflict in App.tsx`

**Lösung:**
```bash
# 1. Konflikt-Dateien ansehen
git status

# 2. Datei bearbeiten und Konflikte lösen
nano App.tsx
# Suche nach: <<<<<<<, =======, >>>>>>>

# 3. Dateien hinzufügen
git add App.tsx

# 4. Merge abschließen
git commit -m "Merge-Konflikt gelöst"
git push origin main
```

---

## ✅ Checkliste

### Einmalig Setup

- [ ] GitHub Repository erstellt
- [ ] .gitignore erstellt und konfiguriert
- [ ] Git initialisiert (`git init`)
- [ ] Main Branch erstellt und gepusht
- [ ] Testing Branch erstellt und gepusht
- [ ] Personal Access Token erstellt
- [ ] GitHub Actions Workflow verschoben
- [ ] Auf Server installiert mit korrekter GitHub-URL

### Regelmäßig

- [ ] Vor Commit: `git status` prüfen
- [ ] Keine sensiblen Daten in Commits
- [ ] Testing vor Production
- [ ] Auto-Update Logs regelmäßig checken
- [ ] Personal Access Token erneuern (alle 90 Tage)

---

## 🎓 Zusammenfassung

### Wichtigste Punkte

1. **Auto-Update prüft IMMER erst** ob Updates verfügbar sind
2. **Nur bei neuen Commits** wird updated
3. **Testing-Branch** für neue Features
4. **Main-Branch** nur für getestete, stabile Versionen
5. **Niemals** `.env` oder sensible Daten zu GitHub pushen
6. **Personal Access Token** statt Passwort verwenden

### Update-Flow

**Schritt für Schritt:**
1. Entwickeln → Testing-Branch pushen → GitHub
2. Testing-Server zieht Updates automatisch
3. Testen auf Testing-Server
4. Bei Erfolg: Merge Testing → Main
5. Main-Branch pushen → GitHub
6. Production-Server zieht Updates automatisch

---

## 📚 Weitere Ressourcen

- **Git Basics:** [https://git-scm.com/book/de/v2](https://git-scm.com/book/de/v2)
- **GitHub Docs:** [https://docs.github.com](https://docs.github.com)
- **Auto-Update System:** [`Auto-Update-System.md`](Auto-Update-System.md)
- **Quick Reference:** [`/Installation/QUICK-REFERENCE.md`](../QUICK-REFERENCE.md)

---

**Bereit zum Loslegen?** Folge der Anleitung Schritt für Schritt! 🚀

Bei Fragen: Siehe Troubleshooting oder GitHub Docs.
