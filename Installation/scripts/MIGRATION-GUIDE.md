#!/bin/bash
################################################################################
# Migration von install.sh → install-modular.sh
################################################################################

# Dieses Script kann kopiert und ausgeführt werden!

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Migration: install.sh → install-modular.sh               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Verzeichnis prüfen
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "✓ Aktuelles Verzeichnis: $SCRIPT_DIR"
echo ""

################################################################################
# Schritt 1: Backup der alten install.sh
################################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Schritt 1: Backup erstellen"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f "install.sh" ]; then
    BACKUP_NAME="install-backup-$(date +%Y%m%d-%H%M%S).sh"
    cp install.sh "$BACKUP_NAME"
    echo "✓ Backup erstellt: $BACKUP_NAME"
else
    echo "⚠ install.sh nicht gefunden"
fi

echo ""

################################################################################
# Schritt 2: Prüfe ob modulare Struktur existiert
################################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Schritt 2: Modulare Struktur prüfen"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

MISSING_COMPONENTS=false

# Libraries prüfen
echo "Libraries:"
for lib in colors.sh logging.sh ui.sh error-handler.sh; do
    if [ -f "lib/$lib" ]; then
        echo "  ✓ lib/$lib"
    else
        echo "  ✗ lib/$lib FEHLT!"
        MISSING_COMPONENTS=true
    fi
done

echo ""

# Module prüfen
echo "Module (kritisch):"
for module in 01-system-check.sh 02-options.sh 10-frontend.sh; do
    if [ -f "modules/$module" ]; then
        echo "  ✓ modules/$module"
    else
        echo "  ✗ modules/$module FEHLT!"
        MISSING_COMPONENTS=true
    fi
done

echo ""

# Haupt-Script prüfen
echo "Haupt-Script:"
if [ -f "install-modular.sh" ]; then
    echo "  ✓ install-modular.sh"
else
    echo "  ✗ install-modular.sh FEHLT!"
    MISSING_COMPONENTS=true
fi

echo ""

if [ "$MISSING_COMPONENTS" = true ]; then
    echo "⚠ Modulare Struktur ist unvollständig!"
    echo ""
    echo "Lösung:"
    echo "  1. Siehe MODULAR-README.md für Details"
    echo "  2. Fehlende Dateien erstellen"
    echo "  3. Migration erneut versuchen"
    echo ""
    exit 1
fi

################################################################################
# Schritt 3: Berechtigungen setzen
################################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Schritt 3: Berechtigungen setzen"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

chmod +x install-modular.sh
echo "✓ install-modular.sh ist jetzt ausführbar"

# Libraries
chmod +x lib/*.sh 2>/dev/null
echo "✓ Libraries sind ausführbar"

# Module
chmod +x modules/*.sh 2>/dev/null
chmod +x modules/optional/*.sh 2>/dev/null
echo "✓ Module sind ausführbar"

echo ""

################################################################################
# Schritt 4: Test-Run
################################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Schritt 4: Test-Run (Dry-Run)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Teste ob Libraries geladen werden können..."
if bash -c "
    source lib/colors.sh
    source lib/logging.sh
    source lib/ui.sh
    source lib/error-handler.sh
    echo '✓ Alle Libraries laden erfolgreich'
" 2>/dev/null; then
    echo "✓ Library-Test erfolgreich"
else
    echo "✗ Library-Test fehlgeschlagen!"
    exit 1
fi

echo ""

################################################################################
# Schritt 5: Vergleich
################################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Schritt 5: Vergleich Alte vs. Neue Struktur"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Zeilen zählen
OLD_LINES=$(wc -l < install.sh 2>/dev/null || echo "0")
NEW_LINES=$(wc -l < install-modular.sh 2>/dev/null || echo "0")
LIB_LINES=$(find lib -name "*.sh" -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}' || echo "0")
MODULE_LINES=$(find modules -name "*.sh" -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}' || echo "0")

echo "Alte Struktur:"
echo "  install.sh: $OLD_LINES Zeilen"
echo ""

echo "Neue Struktur:"
echo "  install-modular.sh: $NEW_LINES Zeilen"
echo "  Libraries: $LIB_LINES Zeilen"
echo "  Module: $MODULE_LINES Zeilen"
echo "  ────────────────────────────"
echo "  Gesamt: $((NEW_LINES + LIB_LINES + MODULE_LINES)) Zeilen"
echo ""

REDUCTION=$((OLD_LINES - NEW_LINES))
REDUCTION_PERCENT=$((REDUCTION * 100 / OLD_LINES))

echo "Haupt-Script Reduktion: -$REDUCTION Zeilen (-${REDUCTION_PERCENT}%)"
echo ""

################################################################################
# Fertig!
################################################################################

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Migration vorbereitet!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Nächste Schritte:"
echo ""
echo "1. Test-Installation (empfohlen):"
echo "   sudo ./install-modular.sh"
echo ""
echo "2. Bei Erfolg: Alte install.sh ersetzen:"
echo "   mv install.sh install-old.sh"
echo "   mv install-modular.sh install.sh"
echo ""
echo "3. Oder: Parallel betreiben:"
echo "   # Neue: ./install-modular.sh"
echo "   # Alte: ./install-old.sh"
echo ""

################################################################################
# Unterschiede Dokumentation
################################################################################

cat > DIFFERENCES.md << 'EOF'
# Unterschiede: install.sh vs. install-modular.sh

## Funktionale Unterschiede

### ✅ Gleiche Funktionalität
- Alle Installations-Schritte identisch
- Gleiche Konfigurationsoptionen
- Gleiches Ergebnis

### 🆕 Neue Features
- **Modulare Struktur:** Bessere Wartbarkeit
- **Error-Handling:** Einheitlich & robust
- **Frontend-Build:** Fehler werden NICHT verschluckt (kritischer Fix!)
- **Logging:** Strukturierter & vollständiger
- **UI:** Konsistente Ausgaben

### 🔧 Behobene Bugs
- ✅ Frontend Build Fehlerbehandlung (TODO #1)
- ✅ npm install Error-Handling (TODO #10)
- ✅ Bessere Validierung
- ✅ Keine verschluckten Fehler mehr

### ⚠️ Bekannte Unterschiede
- **Keine:** Funktional identisch
- **Reihenfolge:** Leicht angepasst (Frontend vor Nginx)
- **Ausgaben:** Schöner formatiert

## Technische Unterschiede

### Struktur
**Alt:**
```
install.sh (2245 Zeilen)
└── Alles in einer Datei
```

**Neu:**
```
install-modular.sh (500 Zeilen)
├── lib/ (Bibliotheken)
│   ├── colors.sh
│   ├── logging.sh
│   ├── ui.sh
│   └── error-handler.sh
└── modules/ (Schritte)
    ├── 01-system-check.sh
    ├── 02-options.sh
    ├── 10-frontend.sh
    └── ...
```

### Error-Handling
**Alt:**
- Inkonsistent (manchmal error(), manchmal warning)
- Fehler manchmal verschluckt

**Neu:**
- Einheitliches System (lib/error-handler.sh)
- Zentrale Error-Traps
- Keine verschluckten Fehler

### Logging
**Alt:**
```bash
echo "[$(date)] Message" >> $LOG_FILE
```

**Neu:**
```bash
log_info "Message"  # Automatisches Timestamp
```

### UI
**Alt:**
```bash
echo -e "${GREEN}✓${NC} Message"
```

**Neu:**
```bash
success "Message"  # Konsistente Funktion
```

## Migration-Checkliste

- [x] Backup erstellt
- [x] Modulare Struktur vorhanden
- [x] Berechtigungen gesetzt
- [x] Libraries testen
- [ ] Test-Installation durchführen
- [ ] Produktion testen
- [ ] Alte install.sh ersetzen (optional)

## Rollback

Falls Probleme auftreten:

```bash
# Zurück zur alten Version:
mv install-modular.sh install-modular-new.sh
mv install-backup-YYYYMMDD-HHMMSS.sh install.sh
chmod +x install.sh
```

## Empfehlung

**Für neue Installationen:** install-modular.sh
**Für Updates:** Schrittweise migrieren
**Bei Problemen:** Alte install.sh als Fallback

## Support

Bei Fragen:
- Siehe MODULAR-README.md
- Log-Datei: /var/log/fmsv-install.log
- Debug-Modus: DEBUG=yes ./install-modular.sh
EOF

echo "Dokumentation erstellt: DIFFERENCES.md"
echo ""
echo "Viel Erfolg! 🚀"
