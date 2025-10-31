#!/bin/bash
################################################################################
# ULTRA-SIMPEL: Test ask_input() mit Command Substitution
################################################################################

# Lade Libraries
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/colors.sh"
source "$SCRIPT_DIR/lib/ui.sh"

echo "==============================================="
echo "TEST: ask_input() mit Command Substitution"
echo "==============================================="
echo ""

echo "SCHRITT 1: Normaler Aufruf (ohne Capture)"
echo ""
ask_input "Dein Name" "Max Mustermann"
echo ""
echo "✅ Schritt 1 abgeschlossen"
echo ""
echo "==============================================="
echo ""

echo "SCHRITT 2: Mit Command Substitution (Capture)"
echo ""
RESULT=$(ask_input "GitHub Repository" "https://github.com/test/test.git")
echo ""
echo "Variable RESULT enthält: '$RESULT'"
echo ""

if [ -n "$RESULT" ]; then
    echo "✅ ERFOLG: Variable ist gesetzt!"
else
    echo "❌ FEHLER: Variable ist leer!"
fi

echo ""
echo "==============================================="
echo "TEST BEENDET"
echo "==============================================="
