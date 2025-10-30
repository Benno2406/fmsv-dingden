#!/bin/bash

# ========================================
# FMSV Dingden - Entwicklungsumgebung Setup
# ========================================

echo ""
echo "========================================"
echo "  FMSV Dingden - Dev Setup"
echo "========================================"
echo ""

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fehler-Zähler
ERRORS=0

# Prüfen ob Node.js installiert ist
if ! command -v node &> /dev/null; then
    echo -e "${RED}FEHLER: Node.js ist nicht installiert!${NC}"
    echo ""
    echo "Bitte installiere Node.js 20+ von: https://nodejs.org"
    echo ""
    exit 1
fi

# Node Version prüfen
echo -e "${BLUE}[INFO] Node.js Version:${NC}"
node --version
echo ""

# Prüfen ob npm installiert ist
if ! command -v npm &> /dev/null; then
    echo -e "${RED}FEHLER: npm ist nicht installiert!${NC}"
    exit 1
fi

echo -e "${BLUE}[INFO] npm Version:${NC}"
npm --version
echo ""

echo "========================================"
echo "  Schritt 1: .txt Dateien umbenennen"
echo "========================================"
echo ""

# Prüfen ob Dateien umbenannt werden müssen
if [ -f "gitignore.txt" ]; then
    echo -e "${BLUE}[INFO] Führe rename-files.sh aus...${NC}"
    chmod +x rename-files.sh
    ./rename-files.sh
    echo ""
elif [ -f ".gitignore" ]; then
    echo -e "${GREEN}[OK] Dateien bereits umbenannt${NC}"
else
    echo -e "${YELLOW}[WARNUNG] .gitignore nicht gefunden!${NC}"
fi

echo ""
echo "========================================"
echo "  Schritt 2: Frontend Dependencies"
echo "========================================"
echo ""

echo -e "${BLUE}[INFO] Installiere Frontend Dependencies...${NC}"
if npm install; then
    echo ""
    echo -e "${GREEN}[OK] Frontend Dependencies installiert${NC}"
else
    echo ""
    echo -e "${RED}[FEHLER] Frontend Installation fehlgeschlagen!${NC}"
    ((ERRORS++))
fi

echo ""
echo "========================================"
echo "  Schritt 3: Backend Dependencies"
echo "========================================"
echo ""

echo -e "${BLUE}[INFO] Installiere Backend Dependencies...${NC}"
cd backend

if npm install; then
    echo ""
    echo -e "${GREEN}[OK] Backend Dependencies installiert${NC}"
else
    echo ""
    echo -e "${RED}[FEHLER] Backend Installation fehlgeschlagen!${NC}"
    ((ERRORS++))
fi

cd ..

echo ""
echo "========================================"
echo "  Schritt 4: Umgebungsvariablen"
echo "========================================"
echo ""

# .env Dateien erstellen falls nicht vorhanden
if [ ! -f "backend/.env" ]; then
    echo -e "${BLUE}[INFO] Erstelle backend/.env Beispiel-Datei...${NC}"
    
    cat > backend/.env << 'EOF'
# FMSV Dingden Backend - Environment Variables

# PostgreSQL Datenbank
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fmsv_dingden
DB_USER=fmsv_user
DB_PASSWORD=DEIN_SICHERES_PASSWORT

# Server
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=DEIN_JWT_SECRET_MINDESTENS_32_ZEICHEN_LANG
JWT_EXPIRES_IN=24h

# SMTP E-Mail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=deine-email@gmail.com
SMTP_PASS=dein-app-passwort
SMTP_FROM=noreply@fmsv-dingden.de

# Uploads
UPLOAD_DIR=../Saves
MAX_FILE_SIZE_MB_MEMBER=5
MAX_FILE_SIZE_MB_ADMIN=50

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3001
EOF

    echo -e "${GREEN}[OK] backend/.env erstellt - BITTE BEARBEITEN!${NC}"
    echo ""
    echo -e "${YELLOW}WICHTIG: Öffne backend/.env und passe die Werte an!${NC}"
    echo ""
else
    echo -e "${GREEN}[OK] backend/.env existiert bereits${NC}"
    echo ""
fi

echo "========================================"
echo "  Setup abgeschlossen!"
echo "========================================"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}⚠ Setup mit $ERRORS Fehler(n) abgeschlossen${NC}"
    echo ""
fi

echo "Nächste Schritte:"
echo ""
echo "1. PostgreSQL Datenbank einrichten:"
echo "   - PostgreSQL installieren (Version 14+)"
echo "   - Datenbank erstellen: createdb fmsv_dingden"
echo "   - User erstellen und Rechte vergeben"
echo ""
echo "2. backend/.env bearbeiten:"
echo "   - Datenbank-Zugangsdaten anpassen"
echo "   - JWT_SECRET generieren (mindestens 32 Zeichen)"
echo "   - SMTP-Daten eintragen (optional)"
echo ""
echo "3. Datenbank initialisieren:"
echo "   cd backend"
echo "   npm run init-db"
echo "   npm run seed        # optional: Beispiel-Daten"
echo ""
echo "4. Entwicklungsserver starten:"
echo ""
echo "   Terminal 1 - Backend:"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "   Terminal 2 - Frontend:"
echo "   npm run dev"
echo ""
echo "5. Browser öffnen:"
echo "   http://localhost:5173"
echo ""
echo "========================================"
echo ""
echo "Dokumentation:"
echo "   README.md"
echo "   QUICK-START.md"
echo "   Installation/README.md"
echo ""
echo "========================================"
echo ""

# Exit mit Error-Code falls Fehler aufgetreten sind
exit $ERRORS
