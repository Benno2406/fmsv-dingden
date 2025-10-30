# Installation Scripts

Dieses Verzeichnis enthält alle Installations- und Wartungs-Scripts für FMSV Dingden.

---

## 📜 Verfügbare Scripts

### 🚀 Haupt-Scripts

| Script | Beschreibung | Verwendung |
|--------|--------------|------------|
| **install.sh** | Komplette Installation | `./install.sh` |
| **update.sh** | System-Update | `./update.sh` |
| **debug-install.sh** | Debug-Modus Installation | `./debug-install.sh` |

### 🔧 Hilfs-Scripts

| Script | Beschreibung | Verwendung |
|--------|--------------|------------|
| **diagnose-500.sh** | 500 Fehler Diagnose & Fix ⭐ **NEU!** | `./diagnose-500.sh` |
| **fix-install-script.sh** | Behebt "Ungültige Auswahl" Fehler | `./fix-install-script.sh` |
| **test-cloudflare.sh** | Testet Cloudflare Installation | `./test-cloudflare.sh` |
| **cloudflare-setup-manual.sh** | Manuelle Cloudflare Konfiguration | `./cloudflare-setup-manual.sh` |

---

## 🚀 install.sh

**Hauptinstallations-Script mit allen Features:**

```bash
# Standard Installation
./install.sh

# Installation ohne Cloudflare
./install.sh --no-cloudflare

# Installation überspringt Cloudflare
# (nützlich wenn cloudflared Installation Probleme macht)
```

**Was macht es:**
1. System-Prüfung (Debian Version, Internet, Speicherplatz)
2. Installations-Optionen abfragen
3. System-Updates installieren
4. PostgreSQL installieren und konfigurieren
5. Node.js installieren
6. Cloudflare Tunnel einrichten (optional)
7. Nginx installieren und konfigurieren
8. Backend einrichten
9. Frontend bauen
10. Auto-Update System konfigurieren (optional)
11. Services starten

**Logs:** `/var/log/fmsv-install.log`

---

## 🔄 update.sh

**Update-Script für bestehende Installationen:**

```bash
./update.sh
```

**Was macht es:**
- Zieht neueste Änderungen von GitHub
- Aktualisiert Backend-Dependencies
- Baut Frontend neu
- Startet Services neu
- Erstellt Backup vor Update

**Logs:** `/var/log/fmsv-update.log`

---

## 🐛 debug-install.sh

**Installation mit ausführlichem Debug-Output:**

```bash
./debug-install.sh
```

**Verwendung:**
- Wenn install.sh fehlschlägt
- Um genaue Fehlermeldungen zu sehen
- Bei unerklärlichen Problemen

**Unterschied zu install.sh:**
- Zeigt alle Befehls-Ausgaben
- Kein `> /dev/null`
- Detaillierte Logs
- Pausiert bei Fehlern

---

## 🔍 diagnose-500.sh

**Diagnose-Script für 500 Internal Server Error:**

```bash
./diagnose-500.sh
```

**Wann verwenden:**
- Bei "500 Internal Server Error" im Browser
- Wenn Backend nicht läuft
- Nach Installation bei Problemen

**Was macht es:**
1. Prüft PostgreSQL Status
2. Prüft Backend Service
3. Prüft nginx
4. Prüft Datenbank-Schema
5. Prüft .env Konfiguration
6. Prüft Port-Belegung
7. Zeigt detaillierte Fehlermeldungen
8. Bietet automatischen Quick-Fix an

**Siehe auch:** 
- [`../SOFORT-HILFE-500.md`](../SOFORT-HILFE-500.md) - Schnellanleitung
- [`../500-FEHLER-DIAGNOSE.md`](../500-FEHLER-DIAGNOSE.md) - Detaillierte Diagnose

---

## 🔧 fix-install-script.sh

**Behebt das "Ungültige Auswahl" Problem:**

```bash
./fix-install-script.sh
```

**Wann verwenden:**
- Bei "Ungültige Auswahl" Fehlern
- Wenn Eingaben nicht akzeptiert werden
- Wenn Farben nicht korrekt angezeigt werden

**Was macht es:**
1. Erstellt Backup von install.sh
2. Lädt neueste Version
3. Macht Script ausführbar

**Siehe auch:** [`../EINGABE-FEHLER.md`](../EINGABE-FEHLER.md)

---

## ☁️ cloudflare-setup-manual.sh

**Manuelle Cloudflare Tunnel Konfiguration:**

```bash
./cloudflare-setup-manual.sh
```

**Wann verwenden:**
- Wenn automatische Cloudflare-Installation fehlschlägt
- Für manuelle Konfiguration
- Bei Problemen mit cloudflared

**Was macht es:**
- Installiert cloudflared
- Führt durch Login-Prozess
- Erstellt und konfiguriert Tunnel
- Erstellt systemd Service

---

## 🧪 test-cloudflare.sh

**Testet Cloudflare Installation:**

```bash
./test-cloudflare.sh
```

**Prüft:**
- ✅ cloudflared installiert?
- ✅ Zertifikat vorhanden?
- ✅ Tunnel konfiguriert?
- ✅ Service läuft?
- ✅ Tunnel erreichbar?

**Gibt Diagnose-Informationen aus**

---

## 🛡️ Alle Scripts als root ausführen

**WICHTIG:** Alle Scripts müssen als root ausgeführt werden!

```bash
# Option 1: Als root einloggen
su -
cd /var/www/fmsv-dingden/Installation/scripts
./install.sh

# Option 2: sudo (nicht empfohlen)
sudo ./install.sh
```

**Warum root?**
- Installiert System-Pakete (apt)
- Konfiguriert Services (systemd)
- Ändert System-Dateien (/etc/nginx, /etc/systemd)
- Erstellt Datenbank-Benutzer

---

## 📝 Script-Optionen

### install.sh Optionen

```bash
# Keine Cloudflare Installation
./install.sh --no-cloudflare

# (Weitere Optionen können hinzugefügt werden)
```

---

## 🔍 Logs ansehen

**Installation Log:**
```bash
cat /var/log/fmsv-install.log

# Live ansehen (während Installation läuft)
tail -f /var/log/fmsv-install.log
```

**Update Log:**
```bash
cat /var/log/fmsv-update.log
```

**Service Logs:**
```bash
# Backend
journalctl -u fmsv-backend -n 50

# Nginx
journalctl -u nginx -n 50

# Cloudflare
journalctl -u cloudflared -n 50

# PostgreSQL
journalctl -u postgresql -n 50
```

---

## ❌ Bei Fehlern

### 500 Internal Server Error (nach Installation)

```bash
./diagnose-500.sh
```

**Siehe:** 
- [`../SOFORT-HILFE-500.md`](../SOFORT-HILFE-500.md) - **ZUERST LESEN!**
- [`../500-FEHLER-DIAGNOSE.md`](../500-FEHLER-DIAGNOSE.md) - Detaillierte Hilfe

---

### "Ungültige Auswahl" bei Eingaben

```bash
./fix-install-script.sh
```

**Siehe:** [`../EINGABE-FEHLER.md`](../EINGABE-FEHLER.md)

---

### Script bricht ab

```bash
# Debug-Modus verwenden
./debug-install.sh

# Logs ansehen
cat /var/log/fmsv-install.log
```

**Siehe:** [`../SCRIPT-BRICHT-AB.md`](../SCRIPT-BRICHT-AB.md)

---

### Nginx startet nicht

```bash
# Status prüfen
systemctl status nginx

# Konfiguration testen
nginx -t

# Logs ansehen
tail /var/log/nginx/error.log
```

**Siehe:** [`../NGINX-FEHLER.md`](../NGINX-FEHLER.md)

---

### Cloudflare Probleme

```bash
# Test-Script ausführen
./test-cloudflare.sh

# Manuelle Konfiguration
./cloudflare-setup-manual.sh
```

**Siehe:** [`../CLOUDFLARED-INSTALLATION-FEHLER.md`](../CLOUDFLARED-INSTALLATION-FEHLER.md)

---

## 📚 Weitere Dokumentation

| Thema | Dokumentation |
|-------|---------------|
| **Installations-Übersicht** | [`../README.md`](../README.md) |
| **Hilfe-Übersicht** | [`../HILFE-UEBERSICHT.md`](../HILFE-UEBERSICHT.md) |
| **Schritt-für-Schritt** | [`../Anleitung/Installation.md`](../Anleitung/Installation.md) |
| **Häufige Probleme** | [`../INSTALLATIONS-HILFE.md`](../INSTALLATIONS-HILFE.md) |

---

## 🎯 Quick Commands

```bash
# Als root einloggen
su -

# Zum Script-Verzeichnis
cd /var/www/fmsv-dingden/Installation/scripts

# Installation starten
./install.sh

# 🚨 Bei 500 Fehler nach Installation
./diagnose-500.sh

# Bei Problemen: Debug-Modus
./debug-install.sh

# Bei "Ungültige Auswahl": Fix
./fix-install-script.sh

# Logs ansehen
tail -f /var/log/fmsv-install.log

# Services prüfen
systemctl status fmsv-backend nginx postgresql
```

---

## ⚙️ Script-Entwicklung

Wenn du die Scripts anpassen möchtest:

### Script-Struktur

```bash
#!/bin/bash
set -e  # Bei Fehler abbrechen

# Farben definieren
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# Hilfsfunktionen
error() { ... }
success() { ... }
info() { ... }

# Hauptlogik
...
```

### Best Practices

1. **Immer `set -e` verwenden** (bricht bei Fehler ab)
2. **Farben für bessere Lesbarkeit** verwenden
3. **Logs schreiben** für Debugging
4. **Root-Check** am Anfang
5. **Backups erstellen** vor Änderungen
6. **Hilfreiche Fehlermeldungen** mit Lösungsvorschlägen

---

## 🆘 Hilfe benötigt?

1. **Hilfe-Übersicht:** [`../HILFE-UEBERSICHT.md`](../HILFE-UEBERSICHT.md)
2. **Installations-Hilfe:** [`../INSTALLATIONS-HILFE.md`](../INSTALLATIONS-HILFE.md)
3. **GitHub Issues:** [github.com/Benno2406/fmsv-dingden/issues](https://github.com/Benno2406/fmsv-dingden/issues)

---

**Viel Erfolg!** 🚀
