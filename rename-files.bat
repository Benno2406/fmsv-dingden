@echo off
REM ========================================
REM FMSV Dingden - Dateien Umbenennen
REM ========================================
REM
REM Diese Batch-Datei benennt alle .txt Dateien
REM zu den richtigen Dateinamen um (.gitignore, .gitkeep)
REM

echo.
echo ========================================
echo   FMSV Dingden - Dateien Umbenennen
echo ========================================
echo.

REM Prüfen ob wir im richtigen Verzeichnis sind
if not exist "backend" (
    echo FEHLER: backend/ Ordner nicht gefunden!
    echo Bitte fuehre diese Datei im Haupt-Projektordner aus.
    echo.
    pause
    exit /b 1
)

echo Starte Umbenennung...
echo.

REM .gitignore umbenennen
if exist "gitignore.txt" (
    echo [1/4] Benenne gitignore.txt um zu .gitignore
    ren "gitignore.txt" ".gitignore" 2>nul
    if exist ".gitignore" (
        echo       OK - .gitignore erstellt
    ) else (
        echo       FEHLER - Umbenennung fehlgeschlagen
    )
) else (
    if exist ".gitignore" (
        echo [1/4] .gitignore existiert bereits
    ) else (
        echo [1/4] WARNUNG: gitignore.txt nicht gefunden!
    )
)

echo.

REM Saves/.gitkeep umbenennen
if exist "Saves\gitkeep.txt" (
    echo [2/4] Benenne Saves\gitkeep.txt um zu Saves\.gitkeep
    ren "Saves\gitkeep.txt" ".gitkeep" 2>nul
    if exist "Saves\.gitkeep" (
        echo       OK - Saves\.gitkeep erstellt
    ) else (
        echo       FEHLER - Umbenennung fehlgeschlagen
    )
) else (
    if exist "Saves\.gitkeep" (
        echo [2/4] Saves\.gitkeep existiert bereits
    ) else (
        echo [2/4] WARNUNG: Saves\gitkeep.txt nicht gefunden!
    )
)

echo.

REM Logs/.gitkeep umbenennen
if exist "Logs\gitkeep.txt" (
    echo [3/4] Benenne Logs\gitkeep.txt um zu Logs\.gitkeep
    ren "Logs\gitkeep.txt" ".gitkeep" 2>nul
    if exist "Logs\.gitkeep" (
        echo       OK - Logs\.gitkeep erstellt
    ) else (
        echo       FEHLER - Umbenennung fehlgeschlagen
    )
) else (
    if exist "Logs\.gitkeep" (
        echo [3/4] Logs\.gitkeep existiert bereits
    ) else (
        echo [3/4] WARNUNG: Logs\gitkeep.txt nicht gefunden!
    )
)

echo.

REM Logs/Audit/.gitkeep umbenennen
if exist "Logs\Audit\gitkeep.txt" (
    echo [4/4] Benenne Logs\Audit\gitkeep.txt um zu Logs\Audit\.gitkeep
    ren "Logs\Audit\gitkeep.txt" ".gitkeep" 2>nul
    if exist "Logs\Audit\.gitkeep" (
        echo       OK - Logs\Audit\.gitkeep erstellt
    ) else (
        echo       FEHLER - Umbenennung fehlgeschlagen
    )
) else (
    if exist "Logs\Audit\.gitkeep" (
        echo [4/4] Logs\Audit\.gitkeep existiert bereits
    ) else (
        echo [4/4] WARNUNG: Logs\Audit\gitkeep.txt nicht gefunden!
    )
)

echo.
echo ========================================
echo   Umbenennung abgeschlossen!
echo ========================================
echo.

REM Übersicht anzeigen
echo Uebersicht der erstellten Dateien:
echo.

if exist ".gitignore" (
    echo [OK] .gitignore
) else (
    echo [!!] .gitignore FEHLT!
)

if exist "Saves\.gitkeep" (
    echo [OK] Saves\.gitkeep
) else (
    echo [!!] Saves\.gitkeep FEHLT!
)

if exist "Logs\.gitkeep" (
    echo [OK] Logs\.gitkeep
) else (
    echo [!!] Logs\.gitkeep FEHLT!
)

if exist "Logs\Audit\.gitkeep" (
    echo [OK] Logs\Audit\.gitkeep
) else (
    echo [!!] Logs\Audit\.gitkeep FEHLT!
)

echo.
echo ========================================
echo   Naechste Schritte:
echo ========================================
echo.
echo 1. Git Status pruefen:
echo    git status
echo.
echo 2. Dateien zu Git hinzufuegen:
echo    git add .gitignore Saves\.gitkeep Logs\.gitkeep Logs\Audit\.gitkeep
echo.
echo 3. Weiter mit GitHub Setup:
echo    Siehe: Installation\GitHub-QUICK-START.md
echo.

pause
