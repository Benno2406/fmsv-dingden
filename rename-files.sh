#!/bin/bash

# ========================================
# FMSV Dingden - Dateien Umbenennen
# ========================================
#
# Dieses Script benennt alle .txt Dateien
# zu den richtigen Dateinamen um (.gitignore, .gitkeep)
#

echo ""
echo "========================================"
echo "  FMSV Dingden - Dateien Umbenennen"
echo "========================================"
echo ""

# Prüfen ob wir im richtigen Verzeichnis sind
if [ ! -d "backend" ]; then
    echo "FEHLER: backend/ Ordner nicht gefunden!"
    echo "Bitte führe dieses Script im Haupt-Projektordner aus."
    echo ""
    exit 1
fi

echo "Starte Umbenennung..."
echo ""

# Zähler für Erfolg/Fehler
SUCCESS=0
ERRORS=0

# .gitignore umbenennen
if [ -f "gitignore.txt" ]; then
    echo "[1/4] Benenne gitignore.txt um zu .gitignore"
    if mv "gitignore.txt" ".gitignore" 2>/dev/null; then
        echo "      ✓ OK - .gitignore erstellt"
        ((SUCCESS++))
    else
        echo "      ✗ FEHLER - Umbenennung fehlgeschlagen"
        ((ERRORS++))
    fi
elif [ -f ".gitignore" ]; then
    echo "[1/4] .gitignore existiert bereits"
    ((SUCCESS++))
else
    echo "[1/4] ⚠ WARNUNG: gitignore.txt nicht gefunden!"
    ((ERRORS++))
fi

echo ""

# Saves/.gitkeep umbenennen
if [ -f "Saves/gitkeep.txt" ]; then
    echo "[2/4] Benenne Saves/gitkeep.txt um zu Saves/.gitkeep"
    if mv "Saves/gitkeep.txt" "Saves/.gitkeep" 2>/dev/null; then
        echo "      ✓ OK - Saves/.gitkeep erstellt"
        ((SUCCESS++))
    else
        echo "      ✗ FEHLER - Umbenennung fehlgeschlagen"
        ((ERRORS++))
    fi
elif [ -f "Saves/.gitkeep" ]; then
    echo "[2/4] Saves/.gitkeep existiert bereits"
    ((SUCCESS++))
else
    echo "[2/4] ⚠ WARNUNG: Saves/gitkeep.txt nicht gefunden!"
    ((ERRORS++))
fi

echo ""

# Logs/.gitkeep umbenennen
if [ -f "Logs/gitkeep.txt" ]; then
    echo "[3/4] Benenne Logs/gitkeep.txt um zu Logs/.gitkeep"
    if mv "Logs/gitkeep.txt" "Logs/.gitkeep" 2>/dev/null; then
        echo "      ✓ OK - Logs/.gitkeep erstellt"
        ((SUCCESS++))
    else
        echo "      ✗ FEHLER - Umbenennung fehlgeschlagen"
        ((ERRORS++))
    fi
elif [ -f "Logs/.gitkeep" ]; then
    echo "[3/4] Logs/.gitkeep existiert bereits"
    ((SUCCESS++))
else
    echo "[3/4] ⚠ WARNUNG: Logs/gitkeep.txt nicht gefunden!"
    ((ERRORS++))
fi

echo ""

# Logs/Audit/.gitkeep umbenennen
if [ -f "Logs/Audit/gitkeep.txt" ]; then
    echo "[4/4] Benenne Logs/Audit/gitkeep.txt um zu Logs/Audit/.gitkeep"
    if mv "Logs/Audit/gitkeep.txt" "Logs/Audit/.gitkeep" 2>/dev/null; then
        echo "      ✓ OK - Logs/Audit/.gitkeep erstellt"
        ((SUCCESS++))
    else
        echo "      ✗ FEHLER - Umbenennung fehlgeschlagen"
        ((ERRORS++))
    fi
elif [ -f "Logs/Audit/.gitkeep" ]; then
    echo "[4/4] Logs/Audit/.gitkeep existiert bereits"
    ((SUCCESS++))
else
    echo "[4/4] ⚠ WARNUNG: Logs/Audit/gitkeep.txt nicht gefunden!"
    ((ERRORS++))
fi

echo ""
echo "========================================"
echo "  Umbenennung abgeschlossen!"
echo "========================================"
echo ""
echo "Erfolg: $SUCCESS | Fehler: $ERRORS"
echo ""

# Übersicht anzeigen
echo "Übersicht der erstellten Dateien:"
echo ""

if [ -f ".gitignore" ]; then
    echo "✓ .gitignore"
else
    echo "✗ .gitignore FEHLT!"
fi

if [ -f "Saves/.gitkeep" ]; then
    echo "✓ Saves/.gitkeep"
else
    echo "✗ Saves/.gitkeep FEHLT!"
fi

if [ -f "Logs/.gitkeep" ]; then
    echo "✓ Logs/.gitkeep"
else
    echo "✗ Logs/.gitkeep FEHLT!"
fi

if [ -f "Logs/Audit/.gitkeep" ]; then
    echo "✓ Logs/Audit/.gitkeep"
else
    echo "✗ Logs/Audit/.gitkeep FEHLT!"
fi

echo ""
echo "========================================"
echo "  Nächste Schritte:"
echo "========================================"
echo ""
echo "1. Git Status prüfen:"
echo "   git status"
echo ""
echo "2. Dateien zu Git hinzufügen:"
echo "   git add .gitignore Saves/.gitkeep Logs/.gitkeep Logs/Audit/.gitkeep"
echo ""
echo "3. Weiter mit GitHub Setup:"
echo "   Siehe: Installation/GitHub-QUICK-START.md"
echo ""

# Exit Code basierend auf Fehlern
if [ $ERRORS -gt 0 ]; then
    exit 1
else
    exit 0
fi
