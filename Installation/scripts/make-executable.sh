#!/bin/bash
################################################################################
# Macht alle Scripts ausführbar
################################################################################

echo "Setze Berechtigungen für modulare Struktur..."
echo ""

cd "$(dirname "$0")"

# Haupt-Scripts
chmod +x install-modular.sh 2>/dev/null && echo "✓ install-modular.sh"
chmod +x install.sh 2>/dev/null && echo "✓ install.sh"
chmod +x update.sh 2>/dev/null && echo "✓ update.sh"
chmod +x debug-new.sh 2>/dev/null && echo "✓ debug-new.sh"
chmod +x setup-modular.sh 2>/dev/null && echo "✓ setup-modular.sh"
chmod +x test-modular.sh 2>/dev/null && echo "✓ test-modular.sh"

# Libraries
if [ -d "lib" ]; then
    find lib -name "*.sh" -exec chmod +x {} \;
    echo "✓ lib/*.sh"
fi

# Module
if [ -d "modules" ]; then
    find modules -name "*.sh" -exec chmod +x {} \;
    MODULE_COUNT=$(find modules -name "*.sh" | wc -l)
    echo "✓ modules/**/*.sh ($MODULE_COUNT Dateien)"
fi

echo ""
echo "✅ Alle Scripts sind jetzt ausführbar!"
echo ""
echo "Nächster Schritt:"
echo "  bash setup-modular.sh"
echo "  bash test-modular.sh"
echo "  sudo ./install-modular.sh"
