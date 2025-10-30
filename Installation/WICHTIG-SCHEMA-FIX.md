# 🚨 WICHTIG: schema.sql Fix

## Problem

Die `backend/database/schema.sql` Datei wurde nicht zu GitHub hochgeladen, weil sie in der `.gitignore` auf der Blacklist stand.

**Status:** ✅ **BEHOBEN**

## Was wurde gefixt?

1. ✅ `.gitignore` angepasst: `schema.sql` wird jetzt committet
2. ✅ `backend/database/README.md` hinzugefügt
3. ✅ Reparatur-Tools aktualisiert

## 🔧 So behebst du das Problem auf dem Server

### Option 1: Automatische Reparatur (Empfohlen)

```bash
# 1. Debug-Tool starten
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./debug.sh

# 2. Option [6] wählen: "Fehlende Dateien reparieren"

# 3. Option [1] wählen: "Git Pull ausführen"
```

Das Tool wird automatisch die fehlende `schema.sql` vom Repository holen.

### Option 2: Manuell mit Git

```bash
# 1. Zum Projektverzeichnis
cd /var/www/fmsv-dingden

# 2. Git Pull ausführen
sudo git pull origin main

# 3. Prüfen ob Datei da ist
ls -lh backend/database/schema.sql

# 4. Backend neu starten
sudo systemctl restart fmsv-backend
```

### Option 3: Quick-Fix im Debug-Tool

```bash
# 1. Debug-Tool starten
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./debug.sh

# 2. Option [2] wählen: "500 Error Diagnose"

# 3. Quick-Fix wird automatisch angeboten
#    → Drücke "j" für Ja
#    → Gib Datenbank-Credentials ein
```

Der Quick-Fix erstellt alles neu (.env + Datenbank + Schema).

## ✅ Überprüfung

Nach dem Fix sollte alles funktionieren:

```bash
# Prüfe ob Datei existiert
ls -lh /var/www/fmsv-dingden/backend/database/schema.sql

# Sollte zeigen: ca. 15-20 KB Datei

# Backend-Status prüfen
sudo systemctl status fmsv-backend

# Logs ansehen
sudo journalctl -u fmsv-backend -n 20
```

## 🎯 Für zukünftige Installationen

Die `.gitignore` wurde gefixt. Bei zukünftigen `git clone` oder `git pull` wird die `schema.sql` automatisch heruntergeladen.

## 📝 Hinweis

Du hattest vollkommen recht - die Datei stand auf der Ignore-Liste! Das ist jetzt behoben.

Die `.gitignore.txt` muss auf dem Server zu `.gitignore` umbenannt werden (machst du ja manuell).

---

**Erstellt:** 30. Oktober 2025  
**Status:** Behoben in Commit nach diesem Datum
