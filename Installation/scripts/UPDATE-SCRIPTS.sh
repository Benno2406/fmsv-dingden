#!/bin/bash

################################################################################
# FMSV Script-Update Utility
# Benennt debug-new.sh zu debug.sh um
################################################################################

cd "$(dirname "$0")"

echo "Aktualisiere Scripts..."

if [ -f "debug-new.sh" ]; then
    mv debug-new.sh debug.sh
    chmod +x debug.sh
    echo "✓ debug.sh aktualisiert"
else
    echo "✗ debug-new.sh nicht gefunden"
fi

if [ -f "fix-pgadmin-domain.sh" ]; then
    rm fix-pgadmin-domain.sh
    echo "✓ fix-pgadmin-domain.sh gelöscht (in debug.sh integriert)"
fi

if [ -f "setup-pgadmin-nginx.sh" ]; then
    rm setup-pgadmin-nginx.sh
    echo "✓ setup-pgadmin-nginx.sh gelöscht (in install.sh integriert)"
fi

echo ""
echo "✓ Scripts aktualisiert!"
echo ""
echo "Nutze ab jetzt:"
echo "  • sudo ./install.sh  - Installation"
echo "  • sudo ./debug.sh    - Diagnose & Reparatur"
echo "  • sudo ./update.sh   - Updates"
echo ""
