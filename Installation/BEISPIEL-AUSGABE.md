# Beispiel: Installations-Ausgabe

So sieht die Installation aus, wenn du `sudo ./install.sh` ausführst:

---

## Willkommens-Bildschirm

```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║        🛩️  FMSV Dingden - Installation  ✈️                 ║
║                                                            ║
║        Flugmodellsportverein Dingden e.V.                 ║
║        Vereinshomepage mit Mitgliederverwaltung           ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

ℹ️  Willkommen zur automatischen Installation!
```

---

## Schritt 1: System-Prüfung

```
============================================================
#  Schritt  1 von 14 - System-Prüfung                     #
============================================================

ℹ️  Erkannte Debian Version: 13
ℹ️  Debian 13 (Trixie) - Testing erkannt
ℹ️  Prüfe Internet-Verbindung...
✅ System-Prüfung erfolgreich
```

---

## Schritt 2: Installations-Optionen

```
============================================================
#  Schritt  2 von 14 - Installations-Optionen             #
============================================================

1️⃣  Update-Kanal wählen:

   [1] Stable   - Stabile Releases (empfohlen für Production)
   [2] Testing  - Neueste Features (für Entwicklung/Testing)

   ► Deine Wahl (1/2): 1
✅ Update-Kanal: Stable (Branch: main)

2️⃣  Cloudflare Tunnel:

   Vorteile:
   ✅ Keine Port-Weiterleitungen nötig
   ✅ Automatisches SSL/TLS
   ✅ DDoS-Schutz
   ✅ Kostenlos

   ► Cloudflare Tunnel einrichten? (j/n): j

3️⃣  GitHub Repository:

   ► GitHub Repository URL: https://github.com/mein-username/fmsv-dingden.git

4️⃣  Automatische Updates:

   [1] Täglich um 03:00 Uhr
   [2] Wöchentlich (Sonntag 03:00 Uhr)
   [3] Manuell (keine automatischen Updates)

   ► Deine Wahl (1/2/3): 1
✅ Auto-Update: daily

────────────────────────────────────────────────────────────
📋 Zusammenfassung:

  • Update-Kanal:        Stable
  • Cloudflare Tunnel:   Ja
  • GitHub Repo:         https://github.com/mein-username/fmsv-dingden.git
  • Auto-Update:         daily

────────────────────────────────────────────────────────────

Installation mit diesen Einstellungen starten? (j/n) j
```

---

## Schritt 3-7: System-Setup

```
============================================================
#  Schritt  3 von 14 - System-Updates                     #
============================================================

ℹ️  Aktualisiere Paket-Listen...
ℹ️  Installiere System-Updates...
✅ System aktualisiert

============================================================
#  Schritt  4 von 14 - Basis-Tools Installation           #
============================================================

ℹ️  Installiere grundlegende Tools...
   • curl... ✓
   • wget... ✓
   • git... ✓
   • nano... ✓
   • ufw... ✓
   • lsb-release... ✓
   • gnupg... ✓
   • software-properties-common... ✓
✅ Basis-Tools installiert

============================================================
#  Schritt  5 von 14 - PostgreSQL Installation            #
============================================================

ℹ️  Installiere PostgreSQL...
ℹ️  Starte PostgreSQL Service...
✅ PostgreSQL 16 installiert und gestartet

============================================================
#  Schritt  6 von 14 - Node.js Installation               #
============================================================

ℹ️  Füge NodeSource Repository hinzu...
ℹ️  Installiere Node.js LTS...
✅ Node.js v20.11.0 installiert
✅ npm 10.2.4 installiert

============================================================
#  Schritt  7 von 14 - Repository klonen                  #
============================================================

ℹ️  Klone Repository (Branch: main)...
✅ Repository geklont
ℹ️  Konfiguriere Git...
✅ Git konfiguriert
```

---

## Schritt 8: Datenbank-Setup

```
============================================================
#  Schritt  8 von 14 - Datenbank-Setup                    #
============================================================

Datenbank-Konfiguration:

   ► Datenbank-Name [fmsv_database]: 
   ► Datenbank-Benutzer [fmsv_user]: 
   ► Datenbank-Passwort: ********
   ► Passwort wiederholen: ********

ℹ️  Erstelle Datenbank 'fmsv_database'...
✅ Datenbank 'fmsv_database' erstellt
✅ Benutzer 'fmsv_user' angelegt
```

---

## Schritt 9: Cloudflare Tunnel

```
============================================================
#  Schritt  9 von 14 - Cloudflare Tunnel Installation     #
============================================================

ℹ️  Füge Cloudflare GPG Key hinzu...
ℹ️  Füge Cloudflare Repository hinzu...
ℹ️  Aktualisiere Paket-Listen...
ℹ️  Installiere cloudflared...
✅ Cloudflared installiert: cloudflared version 2024.1.5

╔════════════════════════════════════════════════════════╗
║  Cloudflare Login erforderlich                        ║
╚════════════════════════════════════════════════════════╝

ℹ️  Ein Browser-Fenster wird geöffnet.
ℹ️  Bitte melde dich bei Cloudflare an und erlaube den Zugriff.

Drücke Enter um fortzufahren...

[Browser öffnet sich...]

✅ Cloudflare Login erfolgreich

ℹ️  Erstelle Tunnel 'fmsv-dingden'...
✅ Tunnel erstellt: 8f7e6d5c-4b3a-2c1d-0e9f-8a7b6c5d4e3f

   ► Domain für Tunnel [fmsv.bartholmes.eu]: 

ℹ️  Erstelle Tunnel-Konfiguration...
✅ Tunnel-Konfiguration erstellt
ℹ️  Konfiguriere DNS-Routing...
✅ DNS konfiguriert: fmsv.bartholmes.eu → Tunnel
ℹ️  Installiere Tunnel als Service...
✅ Cloudflare Tunnel konfiguriert
```

---

## Schritt 10-12: Backend & Frontend

```
============================================================
#  Schritt 10 von 14 - Nginx Installation & Konfiguration #
============================================================

ℹ️  Installiere Nginx...
ℹ️  Erstelle Nginx-Konfiguration...
ℹ️  Teste Nginx-Konfiguration...
✅ Nginx installiert und konfiguriert

============================================================
#  Schritt 11 von 14 - Backend-Setup                      #
============================================================

ℹ️  Installiere Backend-Dependencies...
✅ Backend-Dependencies installiert
ℹ️  Erstelle Backend-Konfiguration (.env)...
✅ Backend-Konfiguration erstellt
ℹ️  Initialisiere Datenbank-Schema...
✅ Datenbank-Schema initialisiert

Test-Daten einfügen? (j/n) j
ℹ️  Füge Test-Daten ein...
✅ Test-Daten eingefügt
ℹ️  Erstelle Backend systemd Service...
✅ Backend-Service erstellt

============================================================
#  Schritt 12 von 14 - Frontend-Build                     #
============================================================

ℹ️  Installiere Frontend-Dependencies...
✅ Frontend-Dependencies installiert
ℹ️  Baue Frontend (dies kann einige Minuten dauern)...
✅ Frontend gebaut
ℹ️  Setze Berechtigungen...
✅ Berechtigungen gesetzt
```

---

## Schritt 13-14: Auto-Update & Services

```
============================================================
#  Schritt 13 von 14 - Auto-Update System                 #
============================================================

ℹ️  Erstelle Auto-Update Script...
✅ Auto-Update Script erstellt
ℹ️  Erstelle systemd Service...
ℹ️  Erstelle systemd Timer (täglich um 03:00 Uhr)...
✅ Auto-Update System konfiguriert
✅ Zeitplan: täglich um 03:00 Uhr

============================================================
#  Schritt 14 von 14 - Services starten & Finalisierung   #
============================================================

ℹ️  Starte Backend...
✅ Backend gestartet
ℹ️  Starte Nginx...
✅ Nginx gestartet
ℹ️  Starte Cloudflare Tunnel...
✅ Cloudflare Tunnel gestartet
ℹ️  Konfiguriere Firewall (nur SSH)...
✅ Firewall konfiguriert
ℹ️  Prüfe Service-Status...
✅ Backend läuft
✅ Nginx läuft
```

---

## Abschluss-Bildschirm

```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║              ✅  Installation erfolgreich!  🎉              ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

════════════════════════════════════════════════════════════
📊 Installations-Zusammenfassung
════════════════════════════════════════════════════════════

📦 Installierte Komponenten:
  ✅ PostgreSQL 16
  ✅ Node.js v20.11.0
  ✅ Nginx
  ✅ Backend (Express + JWT + 2FA)
  ✅ Frontend (React + Vite)
  ✅ Cloudflare Tunnel
  ✅ Auto-Update System

⚙️  Konfiguration:
  • Update-Kanal:      Stable (Branch: main)
  • Cloudflare Tunnel: Aktiv
  • Auto-Update:       daily
  • Datenbank:         fmsv_database

🌐 Website:
  • URL: https://fmsv.bartholmes.eu
  • SSL: Automatisch (Cloudflare)

🔐 Test-Zugangsdaten:
  • Admin:  admin@fmsv-dingden.de / admin123
  • Member: member@fmsv-dingden.de / member123

────────────────────────────────────────────────────────────
⚙️  Service-Verwaltung
────────────────────────────────────────────────────────────

  Backend:
    Status:   systemctl status fmsv-backend
    Logs:     journalctl -u fmsv-backend -f
    Neustart: systemctl restart fmsv-backend

  Nginx:
    Status:   systemctl status nginx
    Logs:     tail -f /var/log/nginx/error.log
    Neustart: systemctl restart nginx

  Cloudflare Tunnel:
    Status:   systemctl status cloudflared
    Logs:     journalctl -u cloudflared -f
    Neustart: systemctl restart cloudflared

  Auto-Update:
    Status:   systemctl status fmsv-auto-update.timer
    Logs:     tail -f /var/log/fmsv-auto-update.log
    Manuell:  systemctl start fmsv-auto-update.service

────────────────────────────────────────────────────────────
⚠️  Wichtige nächste Schritte
────────────────────────────────────────────────────────────

  1. SMTP-Konfiguration anpassen:
     nano /var/www/fmsv-dingden/backend/.env
     Siehe: /Installation/Anleitung/E-Mail-Setup.md

  2. Admin-Passwort ändern nach erstem Login

  3. Test-Accounts prüfen/löschen

════════════════════════════════════════════════════════════

🎉 Viel Erfolg mit FMSV Dingden!

📚 Dokumentation:
  • Installation:       /Installation/Anleitung/Installation.md
  • E-Mail Setup:       /Installation/Anleitung/E-Mail-Setup.md
  • Cloudflare Tunnel:  /Installation/Anleitung/Cloudflare-Tunnel-Setup.md
  • Auto-Update:        /Installation/Anleitung/Auto-Update-System.md

════════════════════════════════════════════════════════════
```

---

## 🎯 Features

### ✅ Fortschrittsanzeige
Jeder Schritt zeigt klar:
```
#  Schritt  X von 14 - Name des Schritts  #
```

### ✅ Farbcodierung
- 🔵 **Blau** - Informationen
- 🟢 **Grün** - Erfolg
- 🟡 **Gelb** - Warnungen
- 🔴 **Rot** - Fehler
- 🟣 **Magenta** - Schritt-Nummer
- 🔷 **Cyan** - Header/Boxen

### ✅ Übersichtlich
- Klare Trennung zwischen Schritten
- Fortschrittsbalken mit Boxen
- Zusammenfassung am Ende

### ✅ Interaktiv
- Benutzer-Eingaben klar markiert mit `►`
- Ja/Nein Abfragen
- Optionale Schritte

---

**Installation dauert:** ~10-15 Minuten  
**Output:** Klar strukturiert und professionell! 🎯
