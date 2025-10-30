#!/bin/bash

################################################################################
# SUPER EINFACHES DEBUG SCRIPT - ZEIGT GENAU WAS FALSCH IST
################################################################################

clear
echo "╔════════════════════════════════════════════════════════════╗"
echo "║       FMSV Backend - Super Einfaches Debug                ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

cd /var/www/fmsv-dingden/backend || {
    echo "❌ Backend-Verzeichnis nicht gefunden!"
    exit 1
}

echo "📍 Schritt 1: Stoppe Backend-Service"
echo "─────────────────────────────────────────────────────────────"
systemctl stop fmsv-backend
sleep 2
echo "✅ Service gestoppt"
echo ""

echo "📍 Schritt 2: Prüfe .env Datei"
echo "─────────────────────────────────────────────────────────────"
if [ ! -f .env ]; then
    echo "❌❌❌ FEHLER: .env Datei existiert NICHT! ❌❌❌"
    echo ""
    echo "Das ist das Problem! Erstelle .env:"
    echo "  cd /var/www/fmsv-dingden/backend"
    echo "  cp env.example.txt .env"
    echo "  nano .env"
    exit 1
else
    echo "✅ .env existiert"
    echo ""
    echo "Inhalt (ohne Passwörter):"
    while IFS='=' read -r key value; do
        if [[ $key == DB_PASSWORD* ]] || [[ $key == JWT_SECRET* ]] || [[ $key == SMTP_PASSWORD* ]]; then
            echo "  $key=[***versteckt***]"
        elif [[ ! $key == \#* ]] && [[ -n $key ]]; then
            echo "  $key=$value"
        fi
    done < .env
fi
echo ""

echo "📍 Schritt 3: Prüfe PostgreSQL"
echo "─────────────────────────────────────────────────────────────"
if systemctl is-active --quiet postgresql; then
    echo "✅ PostgreSQL läuft"
else
    echo "❌❌❌ FEHLER: PostgreSQL läuft NICHT! ❌❌❌"
    echo ""
    echo "Das ist das Problem! Starte PostgreSQL:"
    echo "  systemctl start postgresql"
    exit 1
fi

# Hole DB Name aus .env
DB_NAME=$(grep "^DB_NAME=" .env | cut -d'=' -f2 | tr -d ' ' | tr -d '"' | tr -d "'")
DB_USER=$(grep "^DB_USER=" .env | cut -d'=' -f2 | tr -d ' ' | tr -d '"' | tr -d "'")

echo ""
echo "Teste Verbindung zu Datenbank: $DB_NAME als Benutzer: $DB_USER"

if su - postgres -c "psql -d $DB_NAME -c 'SELECT 1;'" > /dev/null 2>&1; then
    echo "✅ Datenbank-Verbindung OK"
else
    echo "❌❌❌ FEHLER: Kann nicht mit Datenbank verbinden! ❌❌❌"
    echo ""
    echo "Mögliche Ursachen:"
    echo "  • Datenbank existiert nicht"
    echo "  • Benutzer hat keine Rechte"
    echo "  • Passwort falsch"
    echo ""
    echo "Prüfe ob Datenbank existiert:"
    su - postgres -c "psql -l" | grep "$DB_NAME"
    exit 1
fi
echo ""

echo "📍 Schritt 4: Prüfe node_modules"
echo "─────────────────────────────────────────────────────────────"
if [ ! -d node_modules ]; then
    echo "❌❌❌ FEHLER: node_modules nicht gefunden! ❌❌❌"
    echo ""
    echo "Installiere Dependencies:"
    npm install
    if [ $? -ne 0 ]; then
        echo "npm install fehlgeschlagen!"
        exit 1
    fi
else
    echo "✅ node_modules vorhanden"
fi
echo ""

echo "📍 Schritt 5: Teste ob Node.js und Dependencies laden"
echo "─────────────────────────────────────────────────────────────"
cat > /tmp/test-imports.mjs << 'ENDTEST'
console.log('Teste Imports...');
try {
    console.log('  ↳ Lade dotenv...');
    const dotenv = await import('dotenv');
    dotenv.default.config();
    console.log('  ✓ dotenv OK');
    
    console.log('  ↳ Lade express...');
    await import('express');
    console.log('  ✓ express OK');
    
    console.log('  ↳ Lade pg...');
    await import('pg');
    console.log('  ✓ pg OK');
    
    console.log('  ↳ Lade winston...');
    await import('winston');
    console.log('  ✓ winston OK');
    
    console.log('\n✅ Alle Imports funktionieren!');
    process.exit(0);
} catch (error) {
    console.error('\n❌❌❌ Import-Fehler: ❌❌❌');
    console.error(error);
    process.exit(1);
}
ENDTEST

cd /var/www/fmsv-dingden/backend
if node /tmp/test-imports.mjs; then
    echo "✅ Alle Dependencies laden korrekt"
else
    echo "❌❌❌ FEHLER beim Laden der Dependencies! ❌❌❌"
    rm -f /tmp/test-imports.mjs
    exit 1
fi
rm -f /tmp/test-imports.mjs
echo ""

echo "📍 Schritt 6: Starte Backend MANUELL (zeigt echte Fehler!)"
echo "─────────────────────────────────────────────────────────────"
echo "Wenn hier ein Fehler kommt, ist DAS das Problem!"
echo ""
echo "╔═══════════════ SERVER OUTPUT START ═══════════════╗"

# Starte Server mit Timeout von 5 Sekunden
timeout 5s node server.js 2>&1 &
SERVER_PID=$!

# Warte und zeige Output
sleep 5

# Prüfe ob Server noch läuft
if ps -p $SERVER_PID > /dev/null 2>&1; then
    echo "╚═══════════════ SERVER OUTPUT END ═══════════════╝"
    echo ""
    echo "✅✅✅ SERVER LÄUFT ERFOLGREICH! ✅✅✅"
    echo ""
    echo "Der Server startet ohne Fehler!"
    echo "Das Problem ist woanders..."
    
    # Töte den manuell gestarteten Server
    kill $SERVER_PID 2>/dev/null
    
    # Teste ob Port offen ist
    PORT=$(grep "^PORT=" .env | cut -d'=' -f2 | tr -d ' ' | tr -d '"' | tr -d "'")
    if [ -z "$PORT" ]; then
        PORT="5000"
    fi
    
    echo ""
    echo "📍 Schritt 7: Prüfe ob Port $PORT antwortet"
    echo "─────────────────────────────────────────────────────────────"
    
    # Starte Server nochmal für HTTP Test
    node server.js > /dev/null 2>&1 &
    SERVER_PID=$!
    sleep 3
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/api/health 2>/dev/null)
    
    if [ "$HTTP_CODE" == "200" ]; then
        echo "✅ Backend antwortet auf Port $PORT!"
        echo ""
        echo "🎉🎉🎉 ALLES FUNKTIONIERT! 🎉🎉🎉"
        echo ""
        echo "Backend läuft einwandfrei wenn manuell gestartet!"
        echo "Das Problem ist beim systemd Service!"
        echo ""
        echo "Starte Service:"
        kill $SERVER_PID 2>/dev/null
        sleep 2
        systemctl start fmsv-backend
        sleep 2
        systemctl status fmsv-backend --no-pager
    else
        echo "❌ Backend antwortet NICHT auf Port $PORT"
        echo "HTTP Code: $HTTP_CODE"
        kill $SERVER_PID 2>/dev/null
    fi
else
    echo "╚═══════════════ SERVER OUTPUT END ═══════════════╝"
    echo ""
    echo "❌❌❌ SERVER IST ABGESTÜRZT! ❌❌❌"
    echo ""
    echo "Der Fehler steht oben im 'SERVER OUTPUT' Bereich!"
    echo "Das ist dein Problem!"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "                    DEBUG ABGESCHLOSSEN"
echo "════════════════════════════════════════════════════════════"
