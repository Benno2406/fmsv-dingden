# 📚 Dokumentations-Übersicht

Alle Dokumentationsdateien auf einen Blick.

---

## 🚀 START HIER

| Datei | Zweck | Wann lesen? |
|-------|-------|-------------|
| **[/START-HIER-BACKEND-HTTP.md](/START-HIER-BACKEND-HTTP.md)** | **Dein aktuelles Problem** | **JETZT! Backend antwortet nicht** |
| [QUICK-START.md](QUICK-START.md) | Schnellübersicht - 3 Scripts | Erste Orientierung |
| [QUICK-COMMANDS.md](QUICK-COMMANDS.md) | Häufigste Befehle | Als Spickzettel |

---

## 🔧 Problem-Lösungen

| Datei | Problem | Lösung |
|-------|---------|--------|
| [BACKEND-HTTP-PROBLEM.md](BACKEND-HTTP-PROBLEM.md) | Backend antwortet nicht (Code: 000) | Detaillierte Diagnose & Fixes |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Alle Probleme A-Z | Umfassendes Troubleshooting |
| [/JETZT-AUSFÜHREN.md](/JETZT-AUSFÜHREN.md) | Was jetzt tun? | Quick-Fix Anleitung |

---

## 📖 Haupt-Dokumentation

| Datei | Inhalt |
|-------|--------|
| [README.md](README.md) | **Hauptdokumentation** - Installation, Wartung, FAQ |
| [DATEISTRUKTUR.md](DATEISTRUKTUR.md) | Projektstruktur & Aufbau |

---

## 🛠️ Script-Dokumentation

| Datei | Inhalt |
|-------|--------|
| [scripts/README.md](scripts/README.md) | Die 3 wichtigen Scripts erklärt |

---

## 📚 Detaillierte Anleitungen

Im Verzeichnis `/Installation/Anleitung/`:

| Datei | Thema |
|-------|-------|
| [Installation.md](Anleitung/Installation.md) | Schritt-für-Schritt Installation |
| [Cloudflare-Tunnel-Setup.md](Anleitung/Cloudflare-Tunnel-Setup.md) | HTTPS mit Cloudflare |
| [GitHub-Setup.md](Anleitung/GitHub-Setup.md) | Repository & Auto-Updates |
| [E-Mail-Setup.md](Anleitung/E-Mail-Setup.md) | SMTP Konfiguration |
| [Auto-Update-System.md](Anleitung/Auto-Update-System.md) | Automatische Updates |

---

## 🎯 Empfohlener Lese-Reihenfolge

### Bei aktuellem Problem (Backend HTTP):
1. ✅ **/START-HIER-BACKEND-HTTP.md** ← **JETZT LESEN!**
2. [BACKEND-HTTP-PROBLEM.md](BACKEND-HTTP-PROBLEM.md) (falls mehr Details nötig)
3. [QUICK-COMMANDS.md](QUICK-COMMANDS.md) (als Referenz)

### Erste Orientierung:
1. [QUICK-START.md](QUICK-START.md)
2. [README.md](README.md)
3. [scripts/README.md](scripts/README.md)

### Bei Problemen allgemein:
1. [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. [QUICK-COMMANDS.md](QUICK-COMMANDS.md)
3. Spezifische Problem-Datei

### Für Installation:
1. [Anleitung/Installation.md](Anleitung/Installation.md)
2. [README.md](README.md)
3. Je nach Bedarf: Cloudflare, GitHub, E-Mail

---

## 📁 Datei-Kategorien

### 🚨 Quick-Hilfe (sofort lesen!)
- START-HIER-BACKEND-HTTP.md ⭐
- QUICK-START.md
- QUICK-COMMANDS.md
- JETZT-AUSFÜHREN.md

### 🔧 Problem-Lösungen
- BACKEND-HTTP-PROBLEM.md
- TROUBLESHOOTING.md

### 📖 Referenz
- README.md
- DATEISTRUKTUR.md
- scripts/README.md

### 📚 Tutorials
- Anleitung/Installation.md
- Anleitung/Cloudflare-Tunnel-Setup.md
- Anleitung/GitHub-Setup.md
- Anleitung/E-Mail-Setup.md
- Anleitung/Auto-Update-System.md

---

## 🎯 Nach Situation

### Situation: "Backend antwortet nicht!"
**Lesen:**
1. START-HIER-BACKEND-HTTP.md
2. BACKEND-HTTP-PROBLEM.md
3. QUICK-COMMANDS.md

**Ausführen:**
```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./debug.sh
# → Option 10
```

---

### Situation: "Ich bin neu hier"
**Lesen:**
1. QUICK-START.md
2. README.md
3. Anleitung/Installation.md

---

### Situation: "Ich brauche nur die Befehle"
**Lesen:**
1. QUICK-COMMANDS.md

---

### Situation: "Irgendwas funktioniert nicht"
**Lesen:**
1. TROUBLESHOOTING.md
2. QUICK-COMMANDS.md

**Ausführen:**
```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./debug.sh
```

---

### Situation: "Ich will aktualisieren"
**Lesen:**
1. scripts/README.md (update.sh Sektion)

**Ausführen:**
```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./update.sh
```

---

## 📊 Dokument-Statistik

### Quick-Docs: 4 Dateien
- START-HIER-BACKEND-HTTP.md
- QUICK-START.md  
- QUICK-COMMANDS.md
- JETZT-AUSFÜHREN.md

### Problem-Docs: 2 Dateien
- BACKEND-HTTP-PROBLEM.md
- TROUBLESHOOTING.md

### Referenz-Docs: 3 Dateien
- README.md
- DATEISTRUKTUR.md
- scripts/README.md

### Tutorial-Docs: 5 Dateien
- Alle in Anleitung/

**Gesamt: 14 Dateien** (klar strukturiert!)

---

## 💡 Tipps

### Als Lesezeichen speichern:
- QUICK-COMMANDS.md (am häufigsten gebraucht)
- TROUBLESHOOTING.md (bei Problemen)
- README.md (Übersicht)

### Für Debug immer:
```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./debug.sh
```

### Nie vergessen:
- Scripts sind in `/Installation/scripts/`
- Backend ist in `/var/www/fmsv-dingden/backend/`
- Logs: `journalctl -u fmsv-backend -f`

---

## 🔗 Externe Links

- **GitHub:** https://github.com/Achim-Sommer/fmsv-dingden
- **API-Doku:** `/backend/API-Dokumentation.md`
- **Guidelines:** `/guidelines/Guidelines.md`

---

**Zuletzt aktualisiert:** 2025-10-30  
**Version:** 3.0 (aufgeräumt & vereinfacht)
