#!/bin/bash
################################################################################
# Test-Script für modulares Install-System
# Prüft ob alles korrekt eingerichtet ist
################################################################################

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Modulares Install-System - Test Suite                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Test-Funktion
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    ((TESTS_TOTAL++))
    
    printf "%-50s" "Test $TESTS_TOTAL: $test_name"
    
    if eval "$test_command" &>/dev/null; then
        echo "✓ PASS"
        ((TESTS_PASSED++))
        return 0
    else
        echo "✗ FAIL"
        ((TESTS_FAILED++))
        return 1
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Libraries"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

run_test "colors.sh existiert" "[ -f lib/colors.sh ]"
run_test "logging.sh existiert" "[ -f lib/logging.sh ]"
run_test "ui.sh existiert" "[ -f lib/ui.sh ]"
run_test "error-handler.sh existiert" "[ -f lib/error-handler.sh ]"

run_test "colors.sh Syntax OK" "bash -n lib/colors.sh"
run_test "logging.sh Syntax OK" "bash -n lib/logging.sh"
run_test "ui.sh Syntax OK" "bash -n lib/ui.sh"
run_test "error-handler.sh Syntax OK" "bash -n lib/error-handler.sh"

run_test "colors.sh lädt" "source lib/colors.sh && [ -n \"\$GREEN\" ]"
run_test "logging.sh lädt" "source lib/logging.sh && type log_info &>/dev/null"
run_test "ui.sh lädt" "source lib/ui.sh && type success &>/dev/null"
run_test "error-handler.sh lädt" "source lib/error-handler.sh && type run_module &>/dev/null"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Module"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

run_test "01-system-check.sh existiert" "[ -f modules/01-system-check.sh ]"
run_test "02-options.sh existiert" "[ -f modules/02-options.sh ]"
run_test "10-frontend.sh existiert" "[ -f modules/10-frontend.sh ]"

run_test "01-system-check.sh Syntax OK" "bash -n modules/01-system-check.sh"
run_test "02-options.sh Syntax OK" "bash -n modules/02-options.sh"
run_test "10-frontend.sh Syntax OK" "bash -n modules/10-frontend.sh"

run_test "01-system-check.sh ausführbar" "[ -x modules/01-system-check.sh ]"
run_test "02-options.sh ausführbar" "[ -x modules/02-options.sh ]"
run_test "10-frontend.sh ausführbar" "[ -x modules/10-frontend.sh ]"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Haupt-Script"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

run_test "install-modular.sh existiert" "[ -f install-modular.sh ]"
run_test "install-modular.sh Syntax OK" "bash -n install-modular.sh"
run_test "install-modular.sh ausführbar" "[ -x install-modular.sh ]"

# Teste ob Libraries korrekt geladen werden
run_test "Script kann Libraries laden" "bash -c 'source lib/colors.sh && source lib/logging.sh && source lib/ui.sh && source lib/error-handler.sh'"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Verzeichnisstruktur"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

run_test "lib/ Verzeichnis existiert" "[ -d lib ]"
run_test "modules/ Verzeichnis existiert" "[ -d modules ]"
run_test "modules/optional/ Verzeichnis existiert" "[ -d modules/optional ]"
run_test "modules/helpers/ Verzeichnis existiert" "[ -d modules/helpers ]"
run_test "templates/ Verzeichnis existiert" "[ -d templates ]"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Dokumentation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

run_test "MODULAR-README.md existiert" "[ -f MODULAR-README.md ]"
run_test "MODULAR-COMPLETE.md existiert" "[ -f MODULAR-COMPLETE.md ]"
run_test "MIGRATION-GUIDE.md existiert" "[ -f MIGRATION-GUIDE.md ]"
run_test "setup-modular.sh existiert" "[ -f setup-modular.sh ]"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Funktionale Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Teste UI-Funktionen
run_test "UI: info() funktioniert" "bash -c 'source lib/ui.sh && info \"Test\" &>/dev/null'"
run_test "UI: success() funktioniert" "bash -c 'source lib/ui.sh && success \"Test\" &>/dev/null'"
run_test "UI: warning() funktioniert" "bash -c 'source lib/ui.sh && warning \"Test\" &>/dev/null'"
run_test "UI: error() funktioniert" "bash -c 'source lib/ui.sh && error \"Test\" &>/dev/null'"

# Teste Logging-Funktionen
run_test "Log: log_info() funktioniert" "bash -c 'source lib/logging.sh && log_info \"Test\" &>/dev/null'"
run_test "Log: init_logging() funktioniert" "bash -c 'source lib/logging.sh && init_logging /tmp/test.log &>/dev/null'"

# Teste Error-Handler
run_test "Error: require_command() funktioniert" "bash -c 'source lib/error-handler.sh && require_command bash bash &>/dev/null'"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Ergebnis"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Tests gesamt:      $TESTS_TOTAL"
echo "Tests bestanden:   $TESTS_PASSED"
echo "Tests fehlgeschl.: $TESTS_FAILED"
echo ""

SUCCESS_RATE=$((TESTS_PASSED * 100 / TESTS_TOTAL))

if [ $TESTS_FAILED -eq 0 ]; then
    echo "✓ Alle Tests bestanden! (100%)"
    echo ""
    echo "Das modulare System ist bereit!"
    echo ""
    echo "Nächster Schritt:"
    echo "  sudo ./install-modular.sh"
    echo ""
    exit 0
else
    echo "✗ $TESTS_FAILED Test(s) fehlgeschlagen! ($SUCCESS_RATE% erfolgreich)"
    echo ""
    echo "Bitte behebe die Fehler bevor du die Installation startest."
    echo ""
    echo "Hilfe:"
    echo "  • bash setup-modular.sh    - Automatisches Setup"
    echo "  • MODULAR-README.md        - Dokumentation"
    echo "  • MODULAR-COMPLETE.md      - Vollständige Anleitung"
    echo ""
    exit 1
fi
