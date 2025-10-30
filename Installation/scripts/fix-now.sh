#!/bin/bash

################################################################################
# FIX NOW - Installiert node_modules und startet Backend
################################################################################

set -e  # Exit bei Fehler

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         FMSV Backend - Quick Install & Start              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

cd /var/www/fmsv-dingden/backend || {
    echo "❌ Backend-Verzeichnis nicht gefunden!"
    exit 1
}

echo "📦 Installiere node_modules..."
npm install

echo ""
echo "🔄 Starte Backend..."
systemctl restart fmsv-backend

sleep 3

echo ""
echo "📊 Status:"
systemctl status fmsv-backend --no-pager | head -n 15

echo ""
echo "🧪 HTTP Test:"
sleep 2
curl -s http://localhost:5000/api/health | jq . 2>/dev/null || curl -s http://localhost:5000/api/health

echo ""
echo "✅ Fertig!"
