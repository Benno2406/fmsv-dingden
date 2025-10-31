#!/bin/bash
################################################################################
# FMSV Dingden - Modulares System Setup
################################################################################
#
# Dieses Script richtet die modulare Struktur ein
# Ausführen mit: bash setup-modular.sh
#
################################################################################

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  FMSV Dingden - Modulares System Setup                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

################################################################################
# Schritt 1: Prüfe was vorhanden ist
################################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Schritt 1: Prüfe vorhandene Struktur"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Zähle vorhandene Komponenten
LIBS_COUNT=0
MODULES_COUNT=0
TEMPLATES_COUNT=0

[ -d "lib" ] && LIBS_COUNT=$(find lib -name "*.sh" 2>/dev/null | wc -l)
[ -d "modules" ] && MODULES_COUNT=$(find modules -name "*.sh" 2>/dev/null | wc -l)
[ -d "templates" ] && TEMPLATES_COUNT=$(find templates -type f 2>/dev/null | wc -l)

echo "Vorhandene Komponenten:"
echo "  • Libraries:  $LIBS_COUNT/4"
echo "  • Module:     $MODULES_COUNT/16+"
echo "  • Templates:  $TEMPLATES_COUNT/4+"
echo ""

################################################################################
# Schritt 2: Erstelle fehlende Verzeichnisse
################################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Schritt 2: Erstelle Verzeichnisstruktur"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

mkdir -p lib
mkdir -p modules/optional
mkdir -p modules/helpers
mkdir -p templates
mkdir -p config

echo "✓ Verzeichnisse erstellt"
echo ""

################################################################################
# Schritt 3: Setze Berechtigungen
################################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Schritt 3: Setze Berechtigungen"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Haupt-Scripts
for script in install-modular.sh install.sh update.sh debug-new.sh; do
    if [ -f "$script" ]; then
        chmod +x "$script"
        echo "✓ $script"
    fi
done

# Libraries
if [ -d "lib" ]; then
    find lib -name "*.sh" -exec chmod +x {} \;
    echo "✓ lib/*.sh"
fi

# Module
if [ -d "modules" ]; then
    find modules -name "*.sh" -exec chmod +x {} \;
    echo "✓ modules/**/*.sh"
fi

echo ""

################################################################################
# Schritt 4: Validiere Libraries
################################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Schritt 4: Validiere Libraries"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

REQUIRED_LIBS=(
    "lib/colors.sh"
    "lib/logging.sh"
    "lib/ui.sh"
    "lib/error-handler.sh"
)

ALL_LIBS_OK=true

for lib in "${REQUIRED_LIBS[@]}"; do
    if [ -f "$lib" ]; then
        echo "✓ $lib vorhanden"
        
        # Syntax-Check
        if bash -n "$lib" 2>/dev/null; then
            echo "  ✓ Syntax OK"
        else
            echo "  ✗ Syntax-Fehler!"
            ALL_LIBS_OK=false
        fi
    else
        echo "✗ $lib FEHLT!"
        ALL_LIBS_OK=false
    fi
done

echo ""

if [ "$ALL_LIBS_OK" = false ]; then
    echo "⚠ Nicht alle Libraries sind vorhanden oder funktionsfähig"
    echo ""
    echo "Lösung:"
    echo "  1. Siehe MODULAR-README.md"
    echo "  2. Libraries aus Dokumentation erstellen"
    echo ""
    exit 1
fi

################################################################################
# Schritt 5: Test Library-Loading
################################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Schritt 5: Teste Library-Loading"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if bash -c "
    source lib/colors.sh
    source lib/logging.sh
    source lib/ui.sh
    source lib/error-handler.sh
    
    # Teste einige Funktionen
    [ -n \"\$GREEN\" ] || exit 1
    [ -n \"\$RED\" ] || exit 1
    type log_info &>/dev/null || exit 1
    type success &>/dev/null || exit 1
    type error &>/dev/null || exit 1
    
    echo 'Alle Libraries laden erfolgreich'
" 2>/dev/null; then
    echo "✓ Library-Test erfolgreich"
else
    echo "✗ Library-Test fehlgeschlagen!"
    exit 1
fi

echo ""

################################################################################
# Schritt 6: Validiere Haupt-Script
################################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Schritt 6: Validiere Haupt-Script"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f "install-modular.sh" ]; then
    echo "✓ install-modular.sh vorhanden"
    
    # Syntax-Check
    if bash -n install-modular.sh 2>/dev/null; then
        echo "✓ Syntax OK"
    else
        echo "✗ Syntax-Fehler!"
        bash -n install-modular.sh
        exit 1
    fi
    
    # Ausführbar?
    if [ -x "install-modular.sh" ]; then
        echo "✓ Ausführbar"
    else
        echo "⚠ Nicht ausführbar - wird korrigiert"
        chmod +x install-modular.sh
    fi
else
    echo "✗ install-modular.sh nicht gefunden!"
    echo ""
    echo "Lösung:"
    echo "  install-modular.sh muss erstellt werden"
    echo "  Siehe MODULAR-README.md für Details"
    echo ""
    exit 1
fi

echo ""

################################################################################
# Schritt 7: Statistik
################################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Schritt 7: Statistik"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Zeilen zählen
MAIN_LINES=$(wc -l < install-modular.sh 2>/dev/null || echo "0")
LIB_LINES=$(find lib -name "*.sh" -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}' || echo "0")
MODULE_LINES=$(find modules -name "*.sh" -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}' || echo "0")

echo "Modulare Struktur:"
echo "  • Haupt-Script:  $MAIN_LINES Zeilen"
echo "  • Libraries:     $LIB_LINES Zeilen ($(find lib -name "*.sh" 2>/dev/null | wc -l) Dateien)"
echo "  • Module:        $MODULE_LINES Zeilen ($(find modules -name "*.sh" 2>/dev/null | wc -l) Dateien)"
echo "  ────────────────────────────────────"
echo "  • Gesamt:        $((MAIN_LINES + LIB_LINES + MODULE_LINES)) Zeilen"
echo ""

if [ -f "install.sh" ]; then
    OLD_LINES=$(wc -l < install.sh)
    echo "Vergleich mit install.sh:"
    echo "  • Alte Version:  $OLD_LINES Zeilen"
    REDUCTION=$((OLD_LINES - MAIN_LINES))
    REDUCTION_PERCENT=$((REDUCTION * 100 / OLD_LINES))
    echo "  • Reduktion:     -$REDUCTION Zeilen (-${REDUCTION_PERCENT}%)"
fi

echo ""

################################################################################
# Fertig!
################################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Setup abgeschlossen!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Modulare Struktur ist bereit!"
echo ""
echo "Nächste Schritte:"
echo ""
echo "1. Test-Run (als normaler User):"
echo "   bash -n install-modular.sh"
echo ""
echo "2. Installation starten (als root):"
echo "   sudo ./install-modular.sh"
echo ""
echo "3. Debug-Modus (falls Probleme):"
echo "   DEBUG=yes sudo ./install-modular.sh"
echo ""
echo "4. Einzelnes Modul testen:"
echo "   bash modules/01-system-check.sh"
echo ""

# Erstelle Quick-Reference
cat > QUICK-REFERENCE.md << 'EOF'
# Modulares Install-System - Quick Reference

## 📂 Struktur

```
Installation/scripts/
├── install-modular.sh          # Haupt-Script
├── lib/                        # Bibliotheken
│   ├── colors.sh              # Farben
│   ├── logging.sh             # Logging
│   ├── ui.sh                  # UI-Funktionen
│   └── error-handler.sh       # Error-Handling
└── modules/                    # Module
    ├── 01-system-check.sh     # System-Prüfung
    ├── 02-options.sh          # Konfiguration
    ├── 10-frontend.sh         # Frontend Build
    └── optional/              # Optionale Features
        ├── pgadmin.sh
        ├── cloudflare.sh
        └── auto-update.sh
```

## 🚀 Verwendung

### Standard-Installation
```bash
sudo ./install-modular.sh
```

### Debug-Modus
```bash
DEBUG=yes sudo ./install-modular.sh
```

### Einzelnes Modul testen
```bash
# Libraries laden
source lib/colors.sh
source lib/logging.sh
source lib/ui.sh

# Modul ausführen
bash modules/01-system-check.sh
```

### Syntax-Check
```bash
bash -n install-modular.sh
bash -n modules/01-system-check.sh
```

## 🔧 Entwicklung

### Neues Modul erstellen
```bash
cat > modules/XX-name.sh << 'EOF'
#!/bin/bash
################################################################################
# Modul: Name
################################################################################

info "Starte Modul..."
# ... Code ...
success "Modul abgeschlossen"
EOF

chmod +x modules/XX-name.sh
```

### Modul in install-modular.sh einbinden
```bash
run_module "XX-name" "Beschreibung" "no" "STEP" "18"
```

### Optionales Modul
```bash
run_module "optional/name" "Beschreibung" "yes" "STEP" "18"
```

## 📝 Verfügbare Funktionen

### UI-Funktionen (lib/ui.sh)
```bash
info "Information"
success "Erfolg"
warning "Warnung"
error "Fehler"

print_header 1 "Titel" 18
ask_yes_no "Frage?" "y"
ask_input "Eingabe?" "default"
ask_password "Passwort?" 8
```

### Logging (lib/logging.sh)
```bash
log_info "Message"
log_success "Success"
log_warning "Warning"
log_error "Error"
log_debug "Debug info"
```

### Error-Handling (lib/error-handler.sh)
```bash
require_command "git" "git"
require_var "VARIABLE_NAME"
require_file "/path/to/file"
check_service "nginx" 10
check_port 80 "yes"
```

## 🐛 Troubleshooting

### Libraries laden nicht
```bash
# Prüfe Pfad
ls -la lib/

# Syntax-Check
bash -n lib/colors.sh
bash -n lib/logging.sh
```

### Modul funktioniert nicht
```bash
# Direkt ausführen
bash -x modules/01-system-check.sh

# Mit Libraries
bash -c "
source lib/colors.sh
source lib/logging.sh
source lib/ui.sh
bash modules/01-system-check.sh
"
```

### Fehler im Haupt-Script
```bash
# Syntax-Check
bash -n install-modular.sh

# Debug-Modus
bash -x install-modular.sh
```

## 📊 Status

- ✅ Libraries: 4/4
- ✅ Kritische Module: 3/3
- ⏳ Basis-Module: 0/10
- ⏳ Optionale Module: 0/3
- ✅ Haupt-Script: Funktionsfähig

## 📞 Hilfe

- MODULAR-README.md - Vollständige Dokumentation
- MIGRATION-GUIDE.md - Migration von alter install.sh
- /var/log/fmsv-install.log - Installation Logs
EOF

echo "Quick-Reference erstellt: QUICK-REFERENCE.md"
echo ""
echo "🚀 Bereit für die erste Installation!"
