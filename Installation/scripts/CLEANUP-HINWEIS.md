# ⚠️ CLEANUP-MODUL - Wichtiger Hinweis

## 🔴 Problem: Scripts können sich nicht selbst löschen!

### Das ursprüngliche Problem:
```bash
# FALSCH (würde Script löschen während es läuft!):
rm -rf /var/www/fmsv-dingden
# → Script wird mitten in Ausführung gelöscht!
# → Katastrophale Fehler!
```

### Die Lösung: Selektiver Cleanup

Das Cleanup-Modul löscht **NICHT** das gesamte Installations-Verzeichnis, sondern nur:

#### ✅ Was wird gelöscht:
1. **Services**
   - `systemctl stop fmsv-backend`
   - `/etc/systemd/system/fmsv-backend.service`

2. **Nginx Konfiguration**
   - `/etc/nginx/sites-enabled/fmsv`
   - `/etc/nginx/sites-available/fmsv`

3. **Datenbank**
   - `DROP DATABASE fmsv_database`
   - `DROP USER fmsv_user`

4. **Build-Artefakte**
   - `backend/node_modules/`
   - `node_modules/`
   - `dist/`

5. **Optional: Konfiguration**
   - `backend/.env` (nach Bestätigung)

6. **Optional: Uploads**
   - `Saves/*` (nach Bestätigung, gitkeep bleibt)

7. **Optional: Logs**
   - `/var/log/fmsv-install.log` (nach Bestätigung)

#### ❌ Was bleibt erhalten:
1. **Installations-Scripts**
   - `Installation/scripts/**/*.sh` ← **WICHTIG!**
   - Wir können die Scripts nicht löschen, die gerade laufen!

2. **Repository-Struktur**
   - `.git/` Verzeichnis
   - Alle Source-Dateien
   - Wird in Schritt 7 aktualisiert via `git pull`

3. **Optionale Dateien**
   - `backend/.env` (wenn "nein" gewählt)
   - `Saves/` (wenn "nein" gewählt)
   - Log-Dateien (wenn "nein" gewählt)

---

## 🔄 Ablauf mit Repository-Aktualisierung

### Schritt 0: Cleanup
```bash
# Stoppt Services
systemctl stop fmsv-backend

# Löscht Datenbank
DROP DATABASE fmsv_database

# Bereinigt Build-Dateien
rm -rf backend/node_modules
rm -rf node_modules
rm -rf dist

# Verzeichnis bleibt: /var/www/fmsv-dingden
# Scripts bleiben: Installation/scripts/*.sh ✓
```

### Schritt 7: Repository
```bash
cd /var/www/fmsv-dingden

# Repository existiert bereits
# → git pull origin main
git pull origin main

# Aktualisiert alle Dateien
# Scripts bleiben funktionsfähig ✓
```

---

## 📊 Vergleich: Vollständig vs. Selektiv

### ❌ Vollständiges Delete (FALSCH):
```bash
# Schritt 0:
rm -rf /var/www/fmsv-dingden
# → Installation/scripts/*.sh gelöscht!
# → Script kann nicht weiterlaufen!
# → FEHLER!

# Schritt 7:
git clone https://github.com/...
# → Muss neu klonen
# → Dauert länger
```

### ✅ Selektiver Cleanup (RICHTIG):
```bash
# Schritt 0:
rm -rf backend/node_modules
rm -rf node_modules
rm -rf dist
# → Installation/scripts/*.sh bleiben!
# → Script läuft weiter ✓

# Schritt 7:
git pull origin main
# → Nur Updates holen
# → Schneller ✓
```

---

## 🎯 Vorteile des selektiven Cleanups

### 1. **Script-Sicherheit**
- Scripts können sich nicht selbst löschen
- Keine Race-Conditions
- Kein plötzlicher Abbruch

### 2. **Geschwindigkeit**
- Kein kompletter Re-Clone
- Nur `git pull` statt `git clone`
- Spart Zeit & Bandbreite

### 3. **Flexibilität**
- `.env` optional behalten
- Uploads optional behalten
- Logs optional behalten

### 4. **Sicherheit**
- Datenbank wird komplett gelöscht
- Services werden gestoppt
- Build-Cache wird geleert

---

## 🧪 Test-Szenario

### Szenario 1: Erste Installation
```bash
# Cleanup: Nichts gefunden → überspringen
# Repository: git clone
# Rest: Normal
```

### Szenario 2: Zweite Installation (Cleanup)
```bash
# Cleanup:
#   - Service stoppen ✓
#   - Datenbank löschen ✓
#   - node_modules löschen ✓
#   - Scripts bleiben ✓

# Repository:
#   - git pull (schnell!) ✓
#   - Aktualisiert Code ✓

# Rest: Normal
```

### Szenario 3: Installation mit behalten
```bash
# Cleanup:
#   - Service stoppen ✓
#   - Datenbank löschen ✓
#   - .env behalten (auf Wunsch) ✓
#   - Saves behalten (auf Wunsch) ✓

# Repository:
#   - git pull ✓
```

---

## 💡 Fazit

**Problem erkannt, Problem gelöst!** 🎉

Das Cleanup-Modul ist jetzt **produktionsbereit** und:
- ✅ Löscht sich nicht selbst
- ✅ Ist schneller (git pull statt git clone)
- ✅ Ist flexibler (optionale Behalten-Funktion)
- ✅ Ist sicherer (keine Race-Conditions)

**Vielen Dank für den wichtigen Hinweis!** 🙏

---

## 📝 Code-Änderungen

### Vorher (GEFÄHRLICH):
```bash
# 00-cleanup.sh
if [ -d "$INSTALL_DIR" ]; then
    rm -rf "$INSTALL_DIR"  # ← LÖSCHT SCRIPTS!
fi
```

### Nachher (SICHER):
```bash
# 00-cleanup.sh
if [ -d "$INSTALL_DIR" ]; then
    # Selektiv löschen
    rm -rf "$INSTALL_DIR/backend/node_modules"
    rm -rf "$INSTALL_DIR/node_modules"
    rm -rf "$INSTALL_DIR/dist"
    # Scripts bleiben erhalten!
fi
```

### Repository-Modul (unverändert):
```bash
# 07-repository.sh
if [ -d "$INSTALL_DIR/.git" ]; then
    # Repository existiert → pull
    git pull origin $BRANCH
else
    # Neu klonen
    git clone $REPO $INSTALL_DIR
fi
```

---

**Datum:** 2025-01-31  
**Version:** 3.1-modular (cleanup-fix)  
**Status:** ✅ FIXED - Production Ready
