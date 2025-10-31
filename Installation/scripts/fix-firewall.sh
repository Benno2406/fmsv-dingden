#!/bin/bash
################################################################################
# Quick-Fix für 13-firewall.sh Syntax-Error
################################################################################

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_FILE="$SCRIPT_DIR/modules/13-firewall.sh"

echo "🔧 Quick-Fix für firewall.sh Syntax-Error..."
echo ""

# Backup erstellen
cp "$TARGET_FILE" "$TARGET_FILE.backup-$(date +%Y%m%d-%H%M%S)"
echo "✅ Backup erstellt"

# Fix anwenden
cat > /tmp/firewall-fix.txt << 'EOF'
    info "UFW-Logging bleibt deaktiviert"
fi

log_success "Firewall configured and active"

# Bestimme HTTP/HTTPS Status
if [ "$USE_CLOUDFLARE" = "j" ]; then
    HTTP_STATUS="blocked (Cloudflare)"
else
    HTTP_STATUS="allowed"
fi

log_info "SSH: allowed, HTTP/HTTPS: $HTTP_STATUS"

EOF

# Ersetze Zeilen 176-180 mit dem Fix
head -n 175 "$TARGET_FILE" > /tmp/firewall-temp.sh
cat /tmp/firewall-fix.txt >> /tmp/firewall-temp.sh
mv /tmp/firewall-temp.sh "$TARGET_FILE"

echo "✅ Fix angewendet"
echo ""
echo "📝 Prüfe Syntax..."

# Syntax-Check
if bash -n "$TARGET_FILE"; then
    echo "✅ Syntax OK!"
    echo ""
    echo "🚀 Du kannst jetzt installieren:"
    echo "   sudo ./install-modular.sh"
else
    echo "❌ Syntax-Fehler bleibt bestehen!"
    echo "   Restore Backup:"
    echo "   cp $TARGET_FILE.backup-* $TARGET_FILE"
fi
