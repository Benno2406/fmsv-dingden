# ✅ Test-Checkliste für install-modular.sh

## Vor dem Test

### 1. System vorbereiten
```bash
# Als root
sudo su

# In richtiges Verzeichnis
cd /pfad/zu/fmsv-dingden/Installation/scripts

# Dateien prüfen
ls -la
```

### 2. Scripts ausführbar machen
```bash
bash make-executable.sh
```

**Erwartete Ausgabe:**
```
Setze Berechtigungen für modulare Struktur...

✓ install-modular.sh
✓ install.sh
✓ update.sh
✓ debug-new.sh
✓ setup-modular.sh
✓ test-modular.sh
✓ lib/*.sh
✓ modules/**/*.sh (16 Dateien)

✅ Alle Scripts sind jetzt ausführbar!
```

---

## Phase 1: Syntax-Tests

### Test 1.1: Haupt-Script Syntax
```bash
bash -n install-modular.sh
```
**✅ Erfolg:** Keine Ausgabe  
**❌ Fehler:** Syntax-Fehler angezeigt

### Test 1.2: Library Syntax
```bash
bash -n lib/colors.sh
bash -n lib/logging.sh
bash -n lib/ui.sh
bash -n lib/error-handler.sh
```
**✅ Erfolg:** Keine Ausgabe bei allen 4 Dateien

### Test 1.3: Module Syntax
```bash
for f in modules/*.sh; do bash -n "$f" || echo "FEHLER: $f"; done
for f in modules/optional/*.sh; do bash -n "$f" || echo "FEHLER: $f"; done
```
**✅ Erfolg:** Keine Fehler-Meldungen

---

## Phase 2: Library-Tests

### Test 2.1: Colors Library
```bash
source lib/colors.sh
echo -e "${GREEN}Test${NC} ${RED}Farben${NC}"
```
**✅ Erfolg:** Farbige Ausgabe

### Test 2.2: Logging Library
```bash
source lib/colors.sh
source lib/logging.sh

export LOG_FILE="/tmp/test-log.txt"
init_logging "$LOG_FILE"

log_info "Test Info"
log_success "Test Success"
log_warning "Test Warning"
log_error "Test Error"

cat "$LOG_FILE"
rm -f "$LOG_FILE"
```
**✅ Erfolg:** Log-Datei enthält alle 4 Meldungen mit Timestamps

### Test 2.3: UI Library
```bash
source lib/colors.sh
source lib/logging.sh
source lib/ui.sh

export LOG_FILE="/tmp/test.log"
init_logging "$LOG_FILE"

info "Test Info"
success "Test Success"
warning "Test Warning"

rm -f "$LOG_FILE"
```
**✅ Erfolg:** Farbige Ausgaben

### Test 2.4: ask_yes_no Funktion
```bash
source lib/colors.sh
source lib/logging.sh
source lib/ui.sh

export LOG_FILE="/tmp/test.log"
init_logging "$LOG_FILE"

# Test mit Default "yes"
if ask_yes_no "Test-Frage 1" "y"; then
    echo "JA gewählt"
else
    echo "NEIN gewählt"
fi

# Test mit Default "no"
if ask_yes_no "Test-Frage 2" "n"; then
    echo "JA gewählt"
else
    echo "NEIN gewählt"
fi

rm -f "$LOG_FILE"
```
**✅ Erfolg:** Beide Fragen werden angezeigt, Eingabe funktioniert

---

## Phase 3: Modul-Tests

### Test 3.1: System-Check Modul
```bash
source lib/colors.sh
source lib/logging.sh
source lib/ui.sh
source lib/error-handler.sh

export LOG_FILE="/tmp/test.log"
export INSTALL_DIR="/var/www/fmsv-dingden"

init_logging "$LOG_FILE"

bash modules/01-system-check.sh
rm -f "$LOG_FILE"
```
**✅ Erfolg:** Prüfungen werden durchgeführt, keine Fehler

### Test 3.2: Options Modul (interaktiv)
```bash
source lib/colors.sh
source lib/logging.sh
source lib/ui.sh
source lib/error-handler.sh

export LOG_FILE="/tmp/test.log"
export INSTALL_DIR="/var/www/fmsv-dingden"

init_logging "$LOG_FILE"

bash modules/02-options.sh
rm -f "$LOG_FILE"
```
**✅ Erfolg:** Fragen werden angezeigt, Eingaben funktionieren

---

## Phase 4: Integration-Test

### Test 4.1: Dry-Run (erste Sekunden)
```bash
sudo ./install-modular.sh
```

**Dann sofort mit Ctrl+C abbrechen**

**Prüfe:**
1. ✅ Banner wird angezeigt
2. ✅ Version: 3.0-modular
3. ✅ Frage "Installation starten?" erscheint
4. ✅ KEIN Fehler "touch: '' kann nicht berührt werden"
5. ✅ Log-Datei erstellt: `/var/log/fmsv-install.log`

```bash
# Log prüfen
cat /var/log/fmsv-install.log
```

**✅ Erfolg:** Log-Datei existiert und enthält Header

### Test 4.2: Modul 1 bis 3
```bash
sudo ./install-modular.sh
```

**Eingaben:**
1. "Installation starten?" → `j` (Enter)
2. Warte bis Modul 3 abgeschlossen ist
3. Dann Ctrl+C

**Prüfe:**
```bash
tail -50 /var/log/fmsv-install.log
```

**✅ Erfolg:** 
- Modul 01: System-Check ✅
- Modul 02: Options ✅
- Modul 03: System-Update ✅

---

## Phase 5: Vollständiger Installations-Test

### Test 5.1: Komplette Installation

**NUR auf Test-System/VM!**

```bash
sudo ./install-modular.sh
```

**Eingaben:**
- Installation starten: `j`
- Modus: `1` (Produktiv)
- Branch: `main`
- Domain: `fmsv.bartholmes.eu`
- Cloudflare: `n`
- pgAdmin: `n`
- Auto-Update: `3` (Manuell)
- Datenbank-Name: `fmsv_database`
- Datenbank-User: `fmsv_user`
- Datenbank-Passwort: `IhrSicheresPasswort123`
- Test-Daten: `j`
- E-Mail: `test@example.com`

**Dauer:** ~15-30 Minuten

**Prüfe während Installation:**
```bash
# Zweites Terminal
tail -f /var/log/fmsv-install.log
```

**✅ Erfolg:** Installation läuft ohne Fehler durch

### Test 5.2: Nach Installation

**Prüfe Services:**
```bash
systemctl status fmsv-backend
systemctl status nginx
```
**✅ Erfolg:** Beide Services laufen (grün/active)

**Prüfe Backend:**
```bash
curl http://localhost:3000/api/health
```
**✅ Erfolg:** JSON-Response (z.B. `{"status":"ok"}`)

**Prüfe Frontend:**
```bash
curl http://localhost
```
**✅ Erfolg:** HTML wird zurückgegeben

**Prüfe in Browser:**
```
http://SERVER-IP
```
**✅ Erfolg:** Homepage wird angezeigt

---

## Phase 6: Fehlerbehandlung

### Test 6.1: Absichtlicher Fehler
```bash
# Stoppe PostgreSQL
systemctl stop postgresql

# Starte Installation
sudo ./install-modular.sh
```

**✅ Erfolg:** 
- Fehler wird erkannt (z.B. bei Modul 05 oder 08)
- Fehler-Meldung wird angezeigt
- Log-Einträge werden geschrieben
- Installation bricht ab

**Cleanup:**
```bash
systemctl start postgresql
```

### Test 6.2: Optionales Modul-Fehler
```bash
# Cloudflare aktivieren aber nicht einrichten
sudo ./install-modular.sh
```

**Bei "Cloudflare verwenden?":** `j`  
**Bei "Cloudflare Login":** Abbrechen

**✅ Erfolg:** 
- Installation warnt
- Installation wird NICHT abgebrochen
- Weitere Module werden ausgeführt

---

## Checkliste: Gesamtergebnis

### Kritische Tests
- [ ] Test 1.1: Haupt-Script Syntax
- [ ] Test 2.2: Logging Library
- [ ] Test 2.4: ask_yes_no Funktion
- [ ] Test 4.1: Kein LOG_FILE Fehler
- [ ] Test 5.1: Komplette Installation

### Optionale Tests
- [ ] Test 3.1: System-Check Modul
- [ ] Test 4.2: Erste 3 Module
- [ ] Test 5.2: Services nach Installation
- [ ] Test 6.1: Fehlerbehandlung
- [ ] Test 6.2: Optionale Module

---

## Bei Fehlern

### Fehler: "touch: '' kann nicht berührt werden"
**Ursache:** `LOG_FILE` nicht gesetzt  
**Fix:** `lib/logging.sh` überprüfen

```bash
# Prüfen
grep "LOG_FILE" lib/logging.sh
grep "init_logging" install-modular.sh
```

### Fehler: "ask_yes_no: command not found"
**Ursache:** Funktion fehlt in `lib/ui.sh`  
**Fix:** `lib/ui.sh` überprüfen

```bash
# Prüfen
grep "ask_yes_no" lib/ui.sh
```

### Fehler: Module nicht gefunden
**Ursache:** Falsche Pfade oder nicht ausführbar  
**Fix:** Berechtigungen prüfen

```bash
bash make-executable.sh
ls -la modules/
```

### Fehler: Doppelte Library-Loads
**Ursache:** Libraries werden mehrfach geladen  
**Fix:** `lib/error-handler.sh` prüfen

```bash
# Sollte KEINE source-Befehle enthalten
grep "source" lib/error-handler.sh
```

---

## Debug-Modus

```bash
# Detaillierte Ausgabe
DEBUG=yes sudo ./install-modular.sh

# Logs in Echtzeit
tail -f /var/log/fmsv-install.log

# Einzelnes Modul testen
source lib/colors.sh
source lib/logging.sh
source lib/ui.sh
source lib/error-handler.sh
export LOG_FILE="/tmp/test.log"
export INSTALL_DIR="/var/www/fmsv-dingden"
init_logging "$LOG_FILE"
bash modules/01-system-check.sh
```

---

## ✅ Finale Prüfung

**Alle kritischen Tests bestanden?**
- ✅ Ja → **Installation ist bereit für Produktion!**
- ❌ Nein → Siehe Fehler-Sektion oben

---

**Datum:** 2025-01-31  
**Version:** 3.0-modular (bugfixed)  
**Erstellt von:** Benno Bartholmes
