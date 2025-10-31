# 🐛 Bugfixes #2 - Cleanup, Grafik & INSTALL_MODE

## Probleme behoben

### 1. ❌ **Fehlende Deinstallation**
**Problem:** Alte Installation wurde nicht automatisch entfernt  
**Lösung:** Neues Modul `00-cleanup.sh` erstellt

### 2. 🎨 **Grafische Probleme** 
**Problem:** Text erschien erst nach Eingabe  
**Lösung:** `echo -ne` durch `printf` ersetzt (stdout-Flushing)

### 3. 🔴 **INSTALL_MODE nicht gesetzt**
**Problem:** Variable bei ungültiger Eingabe nicht gesetzt  
**Fehler:** `Zeile 195: INSTALL_MODE ist nicht gesetzt`  
**Lösung:** Error-Handling + Retry-Loop + Fallback

---

## 🆕 Neues Modul: 00-cleanup.sh

### Funktionen:
- ✅ Erkennt vorherige Installation automatisch
- ✅ Stoppt FMSV Backend Service
- ✅ Entfernt Nginx Konfiguration
- ✅ Löscht PostgreSQL Datenbank & User
- ✅ Entfernt Installations-Verzeichnis
- ✅ Optional: Log-Dateien löschen
- ✅ Sicherheits-Check: Nur 'fmsv' Pfade
- ✅ Bestätigung erforderlich (ALLE DATEN GEHEN VERLOREN!)

### Integration:
```bash
# SCHRITT 0: Cleanup (neu!)
run_module "00-cleanup" "Cleanup vorheriger Installation" "no" "0" "19"

# SCHRITT 1: System-Prüfung
run_module "01-system-check" "System-Prüfung" "no" "1" "19"
# ... (alle Schritte jetzt /19 statt /18)
```

### Beispiel-Ablauf:
```
═══════════════════════════════════════════════════════
⚠️  Cleanup vorheriger Installation
═══════════════════════════════════════════════════════

⚠️  WARNUNG: Vorherige Installation gefunden!

Folgendes wird entfernt:
  • FMSV Backend Service
  • FMSV Datenbank
  • Nginx Konfiguration
  • Installations-Verzeichnis
  • Alle Dateien in /var/www/fmsv-dingden

⚠️  ALLE DATEN GEHEN VERLOREN!

   ► Vorherige Installation WIRKLICH entfernen? (j/N): j

✓ Stoppe FMSV Services...
✓ FMSV Backend gestoppt
✓ Service-Datei entfernt

✓ Entferne Nginx Konfiguration...
✓ Nginx Symlink entfernt
✓ Nginx Config entfernt
✓ Nginx neu geladen

✓ Entferne FMSV Datenbank...
✓ Datenbank gelöscht
✓ Datenbank-User gelöscht

✓ Entferne Installations-Verzeichnis...
✓ Verzeichnis gelöscht: /var/www/fmsv-dingden

   ► Log-Dateien auch löschen? (j/N): n
✓ Log-Dateien werden beibehalten

═══════════════════════════════════════════════════════
✅ Cleanup abgeschlossen
═══════════════════════════════════════════════════════
```

---

## 🎨 Grafische Fixes

### Problem:
Eingabe-Prompts erschienen erst **NACH** der Eingabe:
```bash
# VORHER (FALSCH):
echo -ne "Frage: "
read REPLY

# Ausgabe:
# [Benutzer tippt 'j']
Frage: j    # ← Erscheint zu spät!
```

### Lösung:
```bash
# NACHHER (RICHTIG):
printf "Frage: "
read -r REPLY

# Ausgabe:
Frage: j    # ← Erscheint sofort!
```

### Geänderte Funktionen in `lib/ui.sh`:
1. ✅ `ask_yes_no()` - Ja/Nein-Fragen
2. ✅ `ask_input()` - Text-Eingabe
3. ✅ `ask_password()` - Passwort-Eingabe
4. ✅ `ask_choice()` - Auswahl aus Liste

### Technischer Grund:
- `echo -ne` puffert Output (stdout buffering)
- `printf` flusht stdout automatisch vor `read`
- Wichtig bei interaktiven Scripts!

---

## 🔴 INSTALL_MODE Fix

### Fehler:
```
/var/www/fmsv-dingden/Installation/scripts/modules/02-options.sh: Zeile 195: INSTALL_MODE ist nicht gesetzt.
```

### Ursache:
```bash
# VORHER (ANFÄLLIG):
MODE_CHOICE=$(ask_choice "Frage?" "Option 1" "Option 2")

case $MODE_CHOICE in
    0) INSTALL_MODE="production" ;;
    1) INSTALL_MODE="development" ;;
esac

echo "$INSTALL_MODE"  # ← FEHLER wenn ask_choice fehlschlägt!
```

### Lösung:
```bash
# NACHHER (ROBUST):
while true; do
    MODE_CHOICE=$(ask_choice "Frage?" "Option 1" "Option 2")
    
    # Prüfe Exit-Code
    if [ $? -eq 0 ]; then
        break
    else
        warning "Bitte wähle eine gültige Option!"
        echo ""
    fi
done

case $MODE_CHOICE in
    0) export INSTALL_MODE="production" ;;
    1) export INSTALL_MODE="development" ;;
    *)
        # FALLBACK!
        export INSTALL_MODE="production"
        warning "Unbekannte Auswahl - verwende Production-Modus"
        ;;
esac

# Variable ist IMMER gesetzt!
```

### Zusätzliche Fixes in `02-options.sh`:
- ✅ Retry-Loop bei ungültiger Eingabe
- ✅ Fallback auf "production" bei Fehler
- ✅ Gleicher Fix für UPDATE-Kanal Auswahl
- ✅ Bessere Error-Messages

---

## 📝 Geänderte Dateien

| Datei | Änderungen | Grund |
|-------|------------|-------|
| `modules/00-cleanup.sh` | ✨ NEU | Deinstallation |
| `lib/ui.sh` | 🔧 4 Funktionen | Grafik-Fixes |
| `modules/02-options.sh` | 🔧 Error-Handling | INSTALL_MODE Fix |
| `install-modular.sh` | 🔧 Schritt 0 + /19 | Cleanup Integration |
| `make-executable.sh` | 🔧 Cleanup-Modul | Berechtigungen |

---

## ✅ Testing

### 1. Syntax-Test
```bash
bash -n modules/00-cleanup.sh
bash -n lib/ui.sh
bash -n modules/02-options.sh
bash -n install-modular.sh
```

### 2. Cleanup-Test (sicher)
```bash
# Simuliere vorherige Installation
sudo mkdir -p /var/www/fmsv-dingden
sudo touch /var/www/fmsv-dingden/test.txt

# Teste Cleanup
sudo ./install-modular.sh

# Bei Cleanup: "j" eingeben
# Danach: Ctrl+C
```

**Prüfe:**
- ✅ Verzeichnis erkannt: `/var/www/fmsv-dingden`
- ✅ Warnung angezeigt
- ✅ Bestätigung verlangt
- ✅ Verzeichnis gelöscht nach "j"

### 3. Grafik-Test
```bash
sudo ./install-modular.sh
```

**Prüfe:**
- ✅ "Installation starten?" erscheint SOFORT
- ✅ "Welchen Modus?" erscheint SOFORT
- ✅ Cursor blinkt nach Prompt
- ✅ Keine verzögerte Anzeige

### 4. INSTALL_MODE Test
```bash
# Ungültige Eingabe testen
sudo ./install-modular.sh

# Bei "Welchen Modus?": "99" eingeben (ungültig)
# Sollte:
# - Fehler zeigen
# - Erneut fragen
# - NICHT abstürzen
```

---

## 🚀 Neue Features

### Cleanup-Optionen:
1. **Automatische Erkennung**
   - Service: `systemctl is-active fmsv-backend`
   - Verzeichnis: `[ -d $INSTALL_DIR ]`
   - Datenbank: `psql -lqt | grep fmsv_database`

2. **Sicherheits-Features**
   - Bestätigung erforderlich
   - Nur 'fmsv' Pfade löschen
   - Log-Dateien optional behalten

3. **Logging**
   - Alle Aktionen geloggt
   - Fehler werden ignoriert (|| true)
   - Cleanup läuft immer durch

---

## 📊 Statistik

### Module:
- **Vorher:** 13 Kern-Module (01-13) + 3 Optional
- **Nachher:** 14 Kern-Module (00-13) + 3 Optional
- **Total:** 17 Module

### Schritte:
- **Vorher:** 18 Schritte (1-18)
- **Nachher:** 19 Schritte (0-18)

### Code:
- **00-cleanup.sh:** 187 Zeilen
- **Geänderte Zeilen:** ~100
- **Neue Funktionen:** 1 (Cleanup)
- **Fixed Funktionen:** 4 (UI)

---

## 🎯 Zusammenfassung

### Was wurde behoben:
✅ Cleanup alter Installation automatisch  
✅ Grafische Ausgabe-Verzögerung  
✅ INSTALL_MODE Variable-Fehler  
✅ Error-Handling bei User-Input  
✅ Fallbacks bei ungültiger Eingabe  

### Installation jetzt:
1. **Cleanup** → Alte Installation entfernen
2. **System-Check** → Voraussetzungen prüfen
3. **Options** → Robust mit Retry-Logic
4. **...** → Rest wie vorher
5. **Fertig!** → 19 Schritte statt 18

### Nächste Schritte:
```bash
cd Installation/scripts
bash make-executable.sh
sudo ./install-modular.sh
```

---

**Datum:** 2025-01-31  
**Version:** 3.1-modular (cleanup+fixes)  
**Erstellt von:** Benno Bartholmes
