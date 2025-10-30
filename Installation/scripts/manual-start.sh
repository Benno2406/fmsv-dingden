#!/bin/bash

################################################################################
# MANUELLER BACKEND START - Zeigt ALLE Fehler!
################################################################################

if [ "$EUID" -ne 0 ]; then
    echo "❌ Bitte als root ausführen: sudo $0"
    exit 1
fi

clear
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         MANUELLER BACKEND START (zeigt Fehler!)           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo "1. Stoppe systemd Service..."
systemctl stop fmsv-backend
sleep 2
echo "   ✓ Gestoppt"
echo ""

echo "2. Wechsle ins Backend-Verzeichnis..."
cd /var/www/fmsv-dingden/backend || {
    echo "   ✗ Verzeichnis nicht gefunden!"
    exit 1
}
echo "   ✓ In $(pwd)"
echo ""

echo "3. Zeige Node.js Version..."
node --version
echo ""

echo "4. Zeige .env Status..."
if [ -f .env ]; then
    echo "   ✓ .env existiert"
    echo ""
    echo "   Konfigurierte Variablen:"
    grep -E "^[A-Z_]+=" .env | while IFS='=' read -r key value; do
        if [[ $key == *"PASSWORD"* ]] || [[ $key == *"SECRET"* ]]; then
            echo "     $key=[***]"
        else
            echo "     $key=$value"
        fi
    done
else
    echo "   ✗ .env EXISTIERT NICHT!"
    echo ""
    echo "   Das ist wahrscheinlich das Problem!"
    echo ""
    echo "   Erstelle .env:"
    echo "   cp env.example.txt .env"
    echo "   nano .env"
    exit 1
fi
echo ""

echo "5. STARTE SERVER (Strg+C zum Beenden)..."
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    SERVER OUTPUT                           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Starte Server
node server.js

# Wenn wir hier ankommen, ist der Server beendet
EXIT_CODE=$?

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                 SERVER BEENDET                             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Exit Code: $EXIT_CODE"
echo ""

if [ $EXIT_CODE -ne 0 ]; then
    echo "❌ Server hat sich mit Fehler beendet!"
    echo ""
    echo "Der Fehler steht oben im 'SERVER OUTPUT' Bereich!"
else
    echo "✓ Server hat sich sauber beendet"
fi

echo ""
echo "Starte systemd Service wieder..."
systemctl start fmsv-backend
systemctl status fmsv-backend --no-pager | head -n 15
