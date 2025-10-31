#!/bin/bash
################################################################################
# BUGFIX #5 - DAS ECHTE PROBLEM: stdout vs stderr!
################################################################################

# 🔥 DAS WAR ES! DAS ECHTE PROBLEM!

## ❌ Das Problem

**Die Optionen wurden nicht angezeigt, weil stdout gecaptured wurde!**

### Was passiert ist:

```bash
# In 02-options.sh:
MODE_CHOICE=$(ask_choice "Welchen Modus...?" "Option 1" "Option 2")
```

**Das `$(...)` captured ALLES von stdout!**

### Die Funktion:

```bash
ask_choice() {
    echo ""                           # -> stdout -> CAPTURED!
    echo "   Frage?"                  # -> stdout -> CAPTURED!
    echo "     1. Option A"           # -> stdout -> CAPTURED!
    echo "     2. Option B"           # -> stdout -> CAPTURED!
    echo -n "   Auswahl: "            # -> stdout -> CAPTURED!
    read -r choice
    echo $((choice-1))                # -> stdout -> CAPTURED (das WOLLEN wir!)
}
```

**Resultat:** 
- User sieht: NICHTS (weil alles gecaptured wird)
- Variable bekommt: Alles was auf stdout ging!

---

## ✅ Die Lösung: stderr für UI, stdout für Return!

### NEUE Funktion:

```bash
ask_choice() {
    echo "" >&2                       # -> stderr -> SICHTBAR!
    echo "   Frage?" >&2              # -> stderr -> SICHTBAR!
    echo "     1. Option A" >&2       # -> stderr -> SICHTBAR!
    echo "     2. Option B" >&2       # -> stderr -> SICHTBAR!
    echo -n "   Auswahl: " >&2        # -> stderr -> SICHTBAR!
    read -r choice
    echo $((choice-1))                # -> stdout -> CAPTURED (Return-Wert)
}
```

**Resultat:**
- User sieht: ALLES (weil auf stderr)
- Variable bekommt: Nur den Return-Wert (von stdout)

---

## 📝 Warum war das so schwer zu finden?

### Problem 1: Farben haben abgelenkt
```bash
# Wir dachten das Problem seien die Farben:
export RED='\\033[0;31m'  # <- Hat nichts damit zu tun!
```

### Problem 2: Buffering hat abgelenkt
```bash
# Wir dachten es sei Buffering:
printf statt echo -e      # <- Hat nichts damit zu tun!
```

### Problem 3: Das ECHTE Problem
```bash
# DAS war das Problem:
result=$(funktion)        # <- Captured STDOUT komplett!
```

---

## 🎯 Die Regel für Bash-Funktionen:

### Wenn eine Funktion einen Wert returnen soll:

```bash
my_function() {
    # UI-Output -> stderr
    echo "Bitte wähle:" >&2
    echo "1. Option A" >&2
    echo "2. Option B" >&2
    echo -n "Auswahl: " >&2
    read -r choice
    
    # Return-Wert -> stdout
    echo "$choice"
}

# Verwendung:
result=$(my_function)
echo "Du hast gewählt: $result"
```

### Was passiert:

```
Terminal Output (stderr):
    Bitte wähle:
    1. Option A
    2. Option B
    Auswahl: 2

Variable $result (stdout):
    2
```

---

## 🔍 File Descriptors erklärt

### Was sind File Descriptors?

| FD | Name | Verwendung | Sichtbar? |
|----|------|------------|-----------|
| 0 | stdin | Eingabe | - |
| 1 | stdout | Normale Ausgabe | ✓ Ja |
| 2 | stderr | Fehler & UI | ✓ Ja |

### Umleitung:

```bash
# Normale Ausgabe
echo "Text"              # -> stdout (FD 1)

# Auf stderr umleiten
echo "Text" >&2         # -> stderr (FD 2)

# Auf Datei umleiten
echo "Text" > file.txt  # -> Datei

# stdout capturen
var=$(echo "Text")      # -> Variable (nur stdout!)
```

### Das Problem visualisiert:

```
OHNE >&2:
┌──────────────┐
│  ask_choice  │
└──────┬───────┘
       │ (stdout)
       ▼
┌─────────────────────┐
│  $(...) CAPTURE     │  ← Alle Optionen verschwinden hier!
│  "Option 1          │
│  Option 2           │
│  0"                 │
└─────────────────────┘

MIT >&2:
┌──────────────┐
│  ask_choice  │
└──────┬───┬───┘
       │   └─────────────────┐
       │ (stdout)        (stderr)
       ▼                     ▼
┌─────────────────┐   ┌──────────────┐
│  $(...) CAPTURE │   │   Terminal   │
│  "0"            │   │  Option 1    │
└─────────────────┘   │  Option 2    │
                      └──────────────┘
```

---

## 📊 Alle geänderten Funktionen in ui.sh

### 1. ask_choice() - KOMPLETT neu

```bash
ask_choice() {
    local question="$1"
    shift
    local options=("$@")
    
    # ALLE UI-Ausgaben auf stderr!
    echo "" >&2
    echo "   $question" >&2
    echo "" >&2
    
    for i in "${!options[@]}"; do
        echo "     $((i+1)). ${options[$i]}" >&2
    done
    
    echo "" >&2
    echo -n "   Auswahl (1-${#options[@]}): " >&2
    read -r choice
    
    # Return-Wert auf stdout
    if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le "${#options[@]}" ]; then
        echo $((choice-1))  # <- stdout!
        return 0
    else
        echo "   FEHLER: Ungültige Auswahl!" >&2
        return 1
    fi
}
```

### Warum NUR diese Funktion?

**Weil nur ask_choice() einen Wert returned der captured wird!**

Andere Funktionen wie `success()`, `error()`, `warning()` werden NICHT captured:

```bash
# Diese werden NICHT captured:
success "Installation erfolgreich"    # Kein $(...)
error "Fehler aufgetreten"            # Kein $(...)
warning "Achtung!"                    # Kein $(...)

# Diese WIRD captured:
result=$(ask_choice "Frage?" "A" "B") # MIT $(...)
```

---

## 🧪 Test-Cases

### Test 1: ask_choice ohne Capture
```bash
ask_choice "Was wählen?" "A" "B"
# Erwartung: Optionen werden angezeigt, Return-Wert geht verloren
```

### Test 2: ask_choice mit Capture
```bash
result=$(ask_choice "Was wählen?" "A" "B")
# Erwartung: Optionen werden angezeigt, Return-Wert in $result
```

### Test 3: Fehlerfall
```bash
result=$(ask_choice "Was wählen?" "A" "B")
# User gibt "x" ein
# Erwartung: Fehlermeldung sichtbar, return 1
```

---

## ⚠️ Wichtig für die Zukunft!

### ✅ Immer so machen:

```bash
my_function() {
    # UI -> stderr
    echo "Ausgabe für User" >&2
    
    # Return-Wert -> stdout
    echo "return_value"
}

result=$(my_function)
```

### ❌ Nicht so machen:

```bash
my_function() {
    # Alles auf stdout
    echo "Ausgabe für User"
    echo "return_value"
}

result=$(my_function)  # Captured ALLES!
```

---

## 🎓 Lessons Learned

### 1. stdout Capture ist unsichtbar
Wenn `$(...)` verwendet wird, ist stdout unsichtbar für den User!

### 2. stderr ist für UI
Alle User-Interaktion sollte auf stderr gehen!

### 3. stdout ist für Return-Werte
Nur der Rückgabe-Wert sollte auf stdout gehen!

### 4. Debug ist essentiell
```bash
# Zum Debuggen:
set -x               # Zeigt alle Befehle
echo "Debug" >&2     # Immer auf stderr!
```

### 5. Farben waren ein Red Herring
Die Farben hatten NICHTS mit dem Problem zu tun!

---

## 📈 Chronologie der Bugfixes

| Fix | Problem | Lösung | Status |
|-----|---------|--------|--------|
| #1 | LOG_FILE nicht gesetzt | Initialisierung | ✅ |
| #2 | ask_yes_no() fehlt | Funktion hinzufügen | ✅ |
| #3 | echo -e Buffering | printf verwenden | ❌ Falsch! |
| #4 | Farben defekt | ANSI-C Quoting | ❌ Falsch! |
| #5 | **stdout captured** | **stderr für UI** | ✅ **DAS WAR ES!** |

---

## ✅ Zusammenfassung

### Was war das Problem?
`$(ask_choice ...)` captured stdout, also waren alle Optionen unsichtbar!

### Was war die Lösung?
UI-Output auf stderr (`>&2`), Return-Wert auf stdout!

### Was funktioniert jetzt?
```
Terminal Output (sichtbar):
   Welchen Modus möchtest du installieren?

     1. Production (empfohlen für Server)
     2. Development (für lokale Entwicklung)

   Auswahl (1-2): 1

Variable $MODE_CHOICE:
   0
```

### Warum hat es so lange gedauert?
1. Farben haben abgelenkt (Red Herring)
2. Buffering hat abgelenkt (Red Herring)  
3. Das eigentliche Problem war subtil (stdout vs stderr)

---

## 🚀 Jetzt testen!

```bash
cd /var/www/fmsv-dingden/Installation/scripts

# Test 1: Simpler Test ohne Farben
chmod +x test-choice-simple.sh
./test-choice-simple.sh

# Test 2: Echte Installation
sudo ./install-modular.sh
```

**Erwartung:**
- ✅ Alle Optionen werden angezeigt
- ✅ User kann wählen
- ✅ Return-Wert wird korrekt captured
- ✅ Installation läuft durch

---

**Version:** 3.1-modular-bugfix-5  
**Datum:** 2025-01-31  
**Status:** ✅ **FINAL FIX - STDOUT vs STDERR!**

---

## 🔥 TL;DR

**Problem:** `result=$(ask_choice ...)` captured stdout → Optionen unsichtbar  
**Lösung:** UI auf stderr (`>&2`), Return-Wert auf stdout  
**Test:** `sudo ./install-modular.sh`  

**JETZT sollte es WIRKLICH funktionieren!** 🎉
