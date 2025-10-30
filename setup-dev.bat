@echo off
REM ========================================
REM FMSV Dingden - Entwicklungsumgebung Setup
REM ========================================

echo.
echo ========================================
echo   FMSV Dingden - Dev Setup
echo ========================================
echo.

REM Prüfen ob Node.js installiert ist
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo FEHLER: Node.js ist nicht installiert!
    echo.
    echo Bitte installiere Node.js 20+ von: https://nodejs.org
    echo.
    pause
    exit /b 1
)

REM Node Version prüfen
echo [INFO] Node.js Version:
node --version
echo.

REM Prüfen ob npm installiert ist
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo FEHLER: npm ist nicht installiert!
    pause
    exit /b 1
)

echo [INFO] npm Version:
npm --version
echo.

echo ========================================
echo   Schritt 1: .txt Dateien umbenennen
echo ========================================
echo.

REM Prüfen ob Dateien umbenannt werden müssen
if exist "gitignore.txt" (
    echo [INFO] Fuehre rename-files.bat aus...
    call rename-files.bat
    echo.
) else (
    if exist ".gitignore" (
        echo [OK] Dateien bereits umbenannt
    ) else (
        echo [WARNUNG] .gitignore nicht gefunden!
    )
)

echo.
echo ========================================
echo   Schritt 2: Frontend Dependencies
echo ========================================
echo.

echo [INFO] Installiere Frontend Dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [FEHLER] Frontend Installation fehlgeschlagen!
    pause
    exit /b 1
)

echo.
echo [OK] Frontend Dependencies installiert
echo.

echo ========================================
echo   Schritt 3: Backend Dependencies
echo ========================================
echo.

echo [INFO] Installiere Backend Dependencies...
cd backend
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [FEHLER] Backend Installation fehlgeschlagen!
    cd ..
    pause
    exit /b 1
)

cd ..
echo.
echo [OK] Backend Dependencies installiert
echo.

echo ========================================
echo   Schritt 4: Umgebungsvariablen
echo ========================================
echo.

REM .env Dateien erstellen falls nicht vorhanden
if not exist "backend\.env" (
    echo [INFO] Erstelle backend/.env Beispiel-Datei...
    (
        echo # FMSV Dingden Backend - Environment Variables
        echo.
        echo # PostgreSQL Datenbank
        echo DB_HOST=localhost
        echo DB_PORT=5432
        echo DB_NAME=fmsv_dingden
        echo DB_USER=fmsv_user
        echo DB_PASSWORD=DEIN_SICHERES_PASSWORT
        echo.
        echo # Server
        echo PORT=3001
        echo NODE_ENV=development
        echo.
        echo # JWT
        echo JWT_SECRET=DEIN_JWT_SECRET_MINDESTENS_32_ZEICHEN_LANG
        echo JWT_EXPIRES_IN=24h
        echo.
        echo # SMTP E-Mail
        echo SMTP_HOST=smtp.gmail.com
        echo SMTP_PORT=587
        echo SMTP_SECURE=false
        echo SMTP_USER=deine-email@gmail.com
        echo SMTP_PASS=dein-app-passwort
        echo SMTP_FROM=noreply@fmsv-dingden.de
        echo.
        echo # Uploads
        echo UPLOAD_DIR=../Saves
        echo MAX_FILE_SIZE_MB_MEMBER=5
        echo MAX_FILE_SIZE_MB_ADMIN=50
        echo.
        echo # URLs
        echo FRONTEND_URL=http://localhost:5173
        echo BACKEND_URL=http://localhost:3001
    ) > backend\.env
    
    echo [OK] backend/.env erstellt - BITTE BEARBEITEN!
    echo.
    echo WICHTIG: Oeffne backend/.env und passe die Werte an!
    echo.
) else (
    echo [OK] backend/.env existiert bereits
    echo.
)

echo ========================================
echo   Setup abgeschlossen!
echo ========================================
echo.

echo Naechste Schritte:
echo.
echo 1. PostgreSQL Datenbank einrichten:
echo    - PostgreSQL installieren (Version 14+^)
echo    - Datenbank erstellen: createdb fmsv_dingden
echo    - User erstellen und Rechte vergeben
echo.
echo 2. backend/.env bearbeiten:
echo    - Datenbank-Zugangsdaten anpassen
echo    - JWT_SECRET generieren (mindestens 32 Zeichen^)
echo    - SMTP-Daten eintragen (optional^)
echo.
echo 3. Datenbank initialisieren:
echo    cd backend
echo    npm run init-db
echo    npm run seed        (optional: Beispiel-Daten^)
echo.
echo 4. Entwicklungsserver starten:
echo.
echo    Terminal 1 - Backend:
echo    cd backend
echo    npm run dev
echo.
echo    Terminal 2 - Frontend:
echo    npm run dev
echo.
echo 5. Browser oeffnen:
echo    http://localhost:5173
echo.
echo ========================================
echo.
echo Dokumentation:
echo    README.md
echo    QUICK-START.md
echo    Installation/README.md
echo.
echo ========================================
echo.

pause
