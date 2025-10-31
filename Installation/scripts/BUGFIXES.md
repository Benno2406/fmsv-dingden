# 🐛 Bugfixes für install-modular.sh

## Problem
```
touch: '' kann nicht berührt werden: Datei oder Verzeichnis nicht gefunden
```

## Ursache
Die Variable `$LOG_FILE` wurde von `logging.sh` mit einem leeren Wert überschrieben, bevor sie verwendet wurde.

---

## ✅ Durchgeführte Fixes

### 1. **logging.sh** - LOG_FILE Variable-Konflikt behoben
**Problem:** `LOG_FILE=""` auf Zeile 7 überschrieb die Export-Variable

**Fix:**
```bash
# VORHER (FALSCH):
LOG_FILE=""

init_logging() {
    LOG_FILE="$1"
    touch "$LOG_FILE"
    ...
}

# NACHHER (RICHTIG):
init_logging() {
    local log_file="$1"
    
    # Setze LOG_FILE falls noch nicht gesetzt
    if [ -z "$LOG_FILE" ]; then
        export LOG_FILE="$log_file"
    fi
    
    # Erstelle Log-Verzeichnis
    mkdir -p "$(dirname "$LOG_FILE")"
    touch "$LOG_FILE"
    chmod 644 "$LOG_FILE" 2>/dev/null || true
    ...
}
```

---

### 2. **logging.sh** - Alle Log-Funktionen abgesichert
**Problem:** Funktionen warfen Fehler wenn `$LOG_FILE` leer war

**Fix:** Alle Log-Funktionen prüfen jetzt ob `$LOG_FILE` gesetzt ist:

```bash
# log()
if [ -n "${LOG_FILE:-}" ] && [ -f "$LOG_FILE" ]; then
    echo "..." >> "$LOG_FILE" 2>/dev/null || true
fi

# log_step()
if [ -n "${LOG_FILE:-}" ]; then
    { echo "..." } >> "$LOG_FILE" 2>/dev/null || true
fi

# log_command()
if [ -n "${LOG_FILE:-}" ] && [ -f "$LOG_FILE" ]; then
    eval "$command" >> "$LOG_FILE" 2>&1
else
    eval "$command" > /dev/null 2>&1
fi

# finish_logging()
if [ -n "${LOG_FILE:-}" ] && [ -f "$LOG_FILE" ]; then
    { echo "..." } >> "$LOG_FILE" 2>/dev/null || true
fi
```

---

### 3. **error-handler.sh** - Library-Konflikt behoben
**Problem:** Libraries wurden doppelt geladen (einmal in `install-modular.sh`, einmal in `error-handler.sh`)

**Fix:**
```bash
# VORHER (FALSCH):
# Libraries laden
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/colors.sh"
source "$SCRIPT_DIR/logging.sh"
source "$SCRIPT_DIR/ui.sh"

# NACHHER (RICHTIG):
# HINWEIS: Diese Library benötigt colors.sh, logging.sh und ui.sh
#          Diese müssen VORHER geladen werden!
```

Removed `set -o errexit` aus `error-handler.sh` (wird vom Haupt-Script gesetzt)

---

### 4. **install-modular.sh** - Logging vor User-Input
**Problem:** `init_logging()` wurde NACH `ask_yes_no()` aufgerufen

**Fix:**
```bash
# VORHER (FALSCH):
print_banner
ask_yes_no "Installation starten?"
init_logging "$LOG_FILE"

# NACHHER (RICHTIG):
print_banner
init_logging "$LOG_FILE"  # ← VORHER initialisieren
log_info "Installation Started"
ask_yes_no "Installation starten?"
```

---

### 5. **ui.sh** - Fehlende ask_yes_no() Funktion
**Problem:** `ask_yes_no()` wurde verwendet aber nicht definiert

**Fix:** Funktion hinzugefügt:
```bash
ask_yes_no() {
    local question="$1"
    local default="${2:-n}"
    
    local prompt
    if [[ $default =~ ^[Jj]$ ]] || [[ $default =~ ^[Yy]$ ]]; then
        prompt="(J/n)"
        default="j"
    else
        prompt="(j/N)"
        default="n"
    fi
    
    echo -ne "   ${BLUE}►${NC} $question $prompt: "
    read -n 1 -r REPLY
    echo
    
    if [ -z "$REPLY" ]; then
        REPLY="$default"
    fi
    
    if [[ $REPLY =~ ^[JjYy]$ ]]; then
        return 0
    else
        return 1
    fi
}
```

---

## 🎯 Testen

### 1. Syntax-Test
```bash
cd Installation/scripts
bash -n install-modular.sh
bash -n lib/logging.sh
bash -n lib/error-handler.sh
bash -n lib/ui.sh
```

### 2. Dry-Run
```bash
bash make-executable.sh
bash test-modular.sh
```

### 3. Vollständiger Test
```bash
sudo ./install-modular.sh
```

---

## 📝 Zusammenfassung

| Datei | Geändert | Grund |
|-------|----------|-------|
| `lib/logging.sh` | ✅ | LOG_FILE Variable-Konflikt |
| `lib/logging.sh` | ✅ | Alle Funktionen abgesichert |
| `lib/error-handler.sh` | ✅ | Doppelte Library-Loads entfernt |
| `install-modular.sh` | ✅ | Logging-Reihenfolge korrigiert |
| `lib/ui.sh` | ✅ | ask_yes_no() hinzugefügt |

---

## ✅ Status

**Alle Fehler behoben!** Das Script sollte jetzt ohne Probleme laufen.

```bash
cd Installation/scripts
bash make-executable.sh
sudo ./install-modular.sh
```

---

## 📞 Bei weiteren Problemen

1. **Debug-Modus aktivieren:**
   ```bash
   DEBUG=yes sudo ./install-modular.sh
   ```

2. **Logs prüfen:**
   ```bash
   tail -f /var/log/fmsv-install.log
   ```

3. **Test-Suite:**
   ```bash
   bash test-modular.sh
   ```

---

**Datum:** 2025-01-31  
**Version:** 3.0-modular (bugfixed)
