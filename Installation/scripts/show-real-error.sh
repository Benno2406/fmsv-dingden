#!/bin/bash

################################################################################
# Zeigt den ECHTEN Fehler aus den Logs
################################################################################

clear
echo "╔════════════════════════════════════════════════════════════╗"
echo "║           FMSV Backend - ECHTER FEHLER VIEWER             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo "🔍 Neustart des Services um frische Logs zu bekommen..."
systemctl restart fmsv-backend
sleep 3

echo ""
echo "════════════════════════════════════════════════════════════"
echo "       SYSTEMD LOGS (letzte 50 Zeilen, neueste zuerst)"
echo "════════════════════════════════════════════════════════════"
echo ""

journalctl -u fmsv-backend -n 50 --no-pager -r

echo ""
echo "════════════════════════════════════════════════════════════"
echo "       BACKEND ERROR LOG"
echo "════════════════════════════════════════════════════════════"
echo ""

if [ -f /var/www/fmsv-dingden/Logs/error.log ]; then
    tail -n 50 /var/www/fmsv-dingden/Logs/error.log
else
    echo "⚠️  Keine error.log gefunden (Backend startet vielleicht gar nicht erst)"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "       MANUELLER START TEST"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Stoppe Service und starte manuell..."
systemctl stop fmsv-backend
sleep 2

cd /var/www/fmsv-dingden/backend || exit 1

echo ""
echo "── Node.js Version ──"
node --version

echo ""
echo "── npm Version ──"
npm --version

echo ""
echo "── Starte server.js (Strg+C zum Beenden) ──"
echo ""

# Starte mit Timeout
timeout 10s node server.js 2>&1

EXIT_CODE=$?

echo ""
echo "── Exit Code: $EXIT_CODE ──"

if [ $EXIT_CODE -eq 124 ]; then
    echo "✅ Timeout erreicht = Server läuft!"
elif [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Server beendet sich sauber"
else
    echo "❌ Server crashed mit Exit Code $EXIT_CODE"
fi

echo ""
echo "Starte Service wieder..."
systemctl start fmsv-backend

echo ""
echo "════════════════════════════════════════════════════════════"
echo "                    ANALYSE FERTIG"
echo "════════════════════════════════════════════════════════════"
