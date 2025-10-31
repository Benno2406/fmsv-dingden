# BUGFIX #6 - Input-Funktionen auf stderr!

## ❌ Das Problem

**Bei Schritt 3 (GitHub Repository) hängt die Installation!**

### Ursache:

```bash
# In 02-options.sh Zeile 113:
export GITHUB_REPO=$(ask_input "GitHub Repository URL" "$DEFAULT_REPO")
```

**`ask_input()` hatte die Prompts auf stdout statt stderr!**

### Was passierte:

```bash
ask_input() {
    printf "   ► GitHub Repository URL [https://...]: "  # stdout!
    read -r REPLY
    echo "${REPLY:-$default}"  # stdout!
}

# Bei Capture:
result=$(ask_input "Frage" "Default")
```

**Resultat:**
- Prompt geht auf stdout → wird gecaptured → unsichtbar
- Variable bekommt: `"   ► GitHub Repository URL [https://...]: user_eingabe"`
- Kompletter Müll in der Variable!

---

## ✅ Die Lösung

**ALLE Prompts auf stderr (`>&2`), nur Return-Wert auf stdout!**

### Geänderte Funktionen:

#### 1. ask_input()
```bash
ask_input() {
    # Prompt auf stderr
    printf "   ${BLUE}►${NC} %s ${DIM}[%s]${NC}: " "$question" "$default" >&2
    read -r REPLY
    
    # Return-Wert auf stdout
    echo "${REPLY:-$default}"
}
```

#### 2. ask_password()
```bash
ask_password() {
    # Prompt auf stderr
    printf "   ${BLUE}►${NC} %s: " "$question" >&2
    read -s PASSWORD1
    echo >&2  # Newline auf stderr
    
    # Validierungen (warnings auf stderr)
    warning "Fehler" >&2
    
    # Return-Wert auf stdout
    echo "$PASSWORD1"
}
```

#### 3. ask_yes_no()
```bash
ask_yes_no() {
    # Prompt auf stderr
    printf "   ${BLUE}►${NC} %s %s: " "$question" "$prompt" >&2
    read -n 1 -r REPLY
    echo >&2  # Newline auf stderr
    
    # Nur Return-Code (kein stdout!)
    if [[ $REPLY =~ ^[JjYy]$ ]]; then
        return 0
    else
        return 1
    fi
}
```

#### 4. ask_choice()
```bash
ask_choice() {
    # Alle UI auf stderr
    echo "" >&2
    echo "   $question" >&2
    echo "     1. Option A" >&2
    echo -n "   Auswahl: " >&2
    read -r choice
    
    # Return-Wert auf stdout
    echo $((choice-1))
}
```

---

## 📝 Geänderte Datei

**`lib/ui.sh`**:
- ✅ `ask_input()` - Alle Prompts auf stderr
- ✅ `ask_password()` - Alle Prompts auf stderr
- ✅ `ask_yes_no()` - Prompts auf stderr
- ✅ `ask_choice()` - Bereits in BUGFIX #5 gefixt
- ✅ Doppelte `ask_yes_no()` entfernt

---

## 🎯 Die Regel

### Für Funktionen die einen Wert returnen:

```bash
my_function() {
    # ALLE UI-Ausgaben -> stderr
    echo "Frage?" >&2
    printf "Prompt: " >&2
    warning "Warnung" >&2
    info "Info" >&2
    
    # NUR Return-Wert -> stdout
    echo "$result"
}
```

### Für Funktionen die NUR Status-Meldungen ausgeben:

```bash
success() {
    # Keine Capture, kann auf stdout bleiben
    echo "   ✓ $*"
}

# ABER: Besser immer stderr für UI!
success() {
    echo "   ✓ $*" >&2
}
```

---

## 🧪 Test

Nach dem Fix sollte das funktionieren:

```bash
# Schritt 3 - GitHub Repository
export GITHUB_REPO=$(ask_input "GitHub Repository URL" "https://...")

# User sieht:
   ► GitHub Repository URL [https://...]: _

# Variable bekommt:
https://github.com/Benno2406/fmsv-dingden.git
```

---

## 📊 Chronologie

| Fix | Problem | Status |
|-----|---------|--------|
| #1 | LOG_FILE nicht gesetzt | ✅ |
| #2 | ask_yes_no() fehlt | ✅ |
| #3 | echo -e Buffering | ❌ |
| #4 | Farben defekt | ❌ |
| #5 | ask_choice() stdout | ✅ |
| #6 | **ask_input/password/yes_no stdout** | ✅ **JETZT!** |

---

## ✅ Status

**Version:** 3.1-modular-bugfix-6  
**Datum:** 2025-01-31  
**Status:** ✅ **ALLE Input-Funktionen auf stderr!**

---

## 🚀 Jetzt testen!

```bash
sudo ./install-modular.sh
```

**Erwartung:**
- ✅ Schritt 1: Installations-Modus → funktioniert
- ✅ Schritt 2: Update-Kanal → funktioniert
- ✅ **Schritt 3: GitHub Repository → sollte JETZT funktionieren!**
- ✅ Alle weiteren Schritte

**Bitte teste jetzt nochmal!** 🎉
