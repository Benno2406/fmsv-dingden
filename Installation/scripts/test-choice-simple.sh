#!/bin/bash
################################################################################
# ULTRA-SIMPLER Test für ask_choice - OHNE FARBEN!
################################################################################

echo ""
echo "=========================================="
echo "TEST 1: Direkte Ausgabe (OHNE Funktion)"
echo "=========================================="
echo ""
echo "   Welchen Modus möchtest du?"
echo ""
echo "     1. Option Eins"
echo "     2. Option Zwei"
echo "     3. Option Drei"
echo ""
echo -n "   Auswahl (1-3): "
read -r choice
echo ""
echo "Du hast gewählt: $choice"
echo ""

echo "=========================================="
echo "TEST 2: Mit einfacher Funktion"
echo "=========================================="
echo ""

simple_choice() {
    local question="$1"
    shift
    local options=("$@")
    
    echo ""
    echo "   $question"
    echo ""
    
    for i in "${!options[@]}"; do
        echo "     $((i+1)). ${options[$i]}"
    done
    
    echo ""
    echo -n "   Auswahl (1-${#options[@]}): "
    read -r choice
    
    if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le "${#options[@]}" ]; then
        echo $((choice-1))
        return 0
    else
        echo "Ungültige Auswahl!"
        return 1
    fi
}

# Test
result=$(simple_choice "Was möchtest du wählen?" "Production" "Development" "Test")
echo ""
echo "Funktion returned: $result"
echo ""

echo "=========================================="
echo "TEST 3: Mit stdbuf (NO Buffering)"
echo "=========================================="
echo ""

stdbuf -oL echo "   Diese Zeile sollte sofort erscheinen"
stdbuf -oL echo ""
stdbuf -oL echo "     1. Production"
stdbuf -oL echo "     2. Development"
stdbuf -oL echo ""

echo "=========================================="
echo "TEST ABGESCHLOSSEN"
echo "=========================================="
echo ""
echo "Wurden ALLE Optionen angezeigt?"
echo "  - Wenn JA: Problem ist die Farbe"
echo "  - Wenn NEIN: Problem ist Buffering/Terminal"
echo ""
