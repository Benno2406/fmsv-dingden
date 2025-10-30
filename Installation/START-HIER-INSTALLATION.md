# Installation - START HIER! 🚀

**Willkommen zur FMSV Dingden Installation!**

Diese Seite führt dich zum richtigen Dokument für deine Situation.

---

## 🎯 Was möchtest du machen?

### ✅ Ich möchte installieren

**Du bist hier richtig!** Wähle deinen Weg:

#### 🚀 Quick-Start (Empfohlen für die meisten)

**Du willst schnell loslegen ohne viel zu lesen?**

→ **[`INSTALLATION-QUICK-GUIDE.md`](INSTALLATION-QUICK-GUIDE.md)**

**Inhalt:**
- 5-Minuten Installation
- Wichtigste Befehle
- Häufigste Probleme
- Keine langen Erklärungen

---

#### 📖 Vollständige Anleitung (Empfohlen für Produktion)

**Du möchtest alles verstehen und nichts falsch machen?**

→ **[`Anleitung/Installation.md`](Anleitung/Installation.md)**

**Inhalt:**
- Detaillierte Schritt-für-Schritt Anleitung
- Alle Optionen erklärt
- Konfiguration nach Installation
- Troubleshooting
- Production Checklist

---

#### 🖥️ Ich nutze SSH/PuTTY

**Du bist per SSH oder PuTTY mit dem Server verbunden?**

**WICHTIG:** Bei Cloudflare-Login kann sich kein Browser öffnen!

→ **[`CLOUDFLARE-PUTTY-ANLEITUNG.md`](CLOUDFLARE-PUTTY-ANLEITUNG.md)** ⭐

**Das brauchst du:**
- Bildliche Anleitung wie du die URL öffnest
- 3 verschiedene Lösungswege
- Häufige Fehler & Lösungen
- PuTTY-spezifische Tipps

**Alternative:**
- Quick Guide: [`CLOUDFLARE-QUICK-GUIDE.md`](CLOUDFLARE-QUICK-GUIDE.md)
- Alle Lösungen: [`CLOUDFLARE-SSH-LOGIN.md`](CLOUDFLARE-SSH-LOGIN.md)
- Setup-Script: `scripts/cloudflare-setup-manual.sh`

---

## 🆘 Ich habe Probleme

### Installation bricht ab

→ **[`INSTALLATIONS-HILFE.md`](INSTALLATIONS-HILFE.md)**

**Häufige Probleme:**
- Script wartet auf Eingabe
- `apt update` Fehler
- Berechtigungs-Probleme
- Services starten nicht

---

### Browser öffnet sich nicht (Cloudflare)

→ **[`CLOUDFLARE-PUTTY-ANLEITUNG.md`](CLOUDFLARE-PUTTY-ANLEITUNG.md)**

**Symptom:**
```
Failed to open browser
Cannot open browser window
```

**Lösung:** URL manuell öffnen oder Setup-Script nutzen

---

### Git Clone schlägt fehl

→ **[`GIT-CLONE-FEHLER.md`](GIT-CLONE-FEHLER.md)**

**Häufige Fehler:**
- Repository not found
- Authentication failed
- Permission denied

---

### sudo: command not found

→ **[`ROOT-HINWEIS.md`](ROOT-HINWEIS.md)**

**Du musst als root eingeloggt sein:**
```bash
su -
./install.sh
```

**NICHT:**
```bash
sudo ./install.sh
```

---

### Dateien müssen umbenannt werden

→ **[`DATEIEN-UMBENENNEN.md`](DATEIEN-UMBENENNEN.md)**

**Vor der Installation:**
```bash
chmod +x rename-files.sh
./rename-files.sh
```

---

## 📚 Alle Hilfe-Dokumente

→ **[`HILFE-UEBERSICHT.md`](HILFE-UEBERSICHT.md)**

**Komplette Übersicht** aller Hilfe-Dokumente mit:
- Problem-Lösungen
- Detaillierte Anleitungen
- Script-Übersicht
- FAQ
- Dokumentations-Struktur

---

## 🔍 Schnellsuche

| Ich suche... | Gehe zu... |
|--------------|------------|
| **Schnelle Installation** | [`INSTALLATION-QUICK-GUIDE.md`](INSTALLATION-QUICK-GUIDE.md) |
| **Vollständige Anleitung** | [`Anleitung/Installation.md`](Anleitung/Installation.md) |
| **SSH/PuTTY Browser-Problem** | [`CLOUDFLARE-PUTTY-ANLEITUNG.md`](CLOUDFLARE-PUTTY-ANLEITUNG.md) |
| **Installation bricht ab** | [`INSTALLATIONS-HILFE.md`](INSTALLATIONS-HILFE.md) |
| **Git Clone Fehler** | [`GIT-CLONE-FEHLER.md`](GIT-CLONE-FEHLER.md) |
| **Root/sudo Probleme** | [`ROOT-HINWEIS.md`](ROOT-HINWEIS.md) |
| **Cloudflare Setup** | [`Anleitung/Cloudflare-Tunnel-Setup.md`](Anleitung/Cloudflare-Tunnel-Setup.md) |
| **Alle Hilfen** | [`HILFE-UEBERSICHT.md`](HILFE-UEBERSICHT.md) |
| **Quick Commands** | [`QUICK-REFERENCE.md`](QUICK-REFERENCE.md) |

---

## 🎯 Empfohlener Installations-Ablauf

### Für Anfänger

```
1. README.md lesen
2. INSTALLATION-QUICK-GUIDE.md folgen
3. Bei Problemen: INSTALLATIONS-HILFE.md
4. Bei SSH/PuTTY: CLOUDFLARE-PUTTY-ANLEITUNG.md
```

### Für Fortgeschrittene

```
1. Anleitung/Installation.md überfliegen
2. Installation starten
3. Bei Cloudflare über SSH: CLOUDFLARE-SSH-LOGIN.md
4. Nach Installation: Production Checklist abarbeiten
```

### Für SSH/PuTTY-Nutzer

```
1. README.md lesen
2. CLOUDFLARE-PUTTY-ANLEITUNG.md bereithalten
3. Anleitung/Installation.md folgen
4. Bei Cloudflare-Login: URL manuell öffnen
5. Oder: scripts/cloudflare-setup-manual.sh nutzen
```

---

## ⚡ Quick Commands

**Installation starten:**
```bash
# 1. Als root einloggen
su -

# 2. Zum Script-Verzeichnis
cd /var/www/fmsv-dingden/Installation/scripts

# 3. Installation starten
chmod +x install.sh
./install.sh
```

**Cloudflare SSH-Setup:**
```bash
cd /var/www/fmsv-dingden/Installation/scripts
chmod +x cloudflare-setup-manual.sh
./cloudflare-setup-manual.sh
```

**Debug bei Problemen:**
```bash
cd /var/www/fmsv-dingden/Installation/scripts
chmod +x debug-install.sh
./debug-install.sh
```

**Logs ansehen:**
```bash
cat /var/log/fmsv-install.log
journalctl -u fmsv-backend -f
```

---

## 📖 Dokumentations-Struktur

```
Installation/
├── START-HIER-INSTALLATION.md        # ← Diese Datei
├── README.md                          # Übersicht
│
├── INSTALLATION-QUICK-GUIDE.md        # 5-Min Installation
├── INSTALLATIONS-HILFE.md             # Problem-Lösungen
├── HILFE-UEBERSICHT.md               # Alle Hilfen
│
├── CLOUDFLARE-PUTTY-ANLEITUNG.md     # SSH Browser-Problem ⭐
├── CLOUDFLARE-SSH-LOGIN.md           # Alle CF-Lösungen
├── CLOUDFLARE-QUICK-GUIDE.md         # CF Quick Guide
├── CLOUDFLARE-URL-MANUELL.md         # URL öffnen Detail
│
├── GIT-CLONE-FEHLER.md               # Git Probleme
├── ROOT-HINWEIS.md                   # sudo vs. root
├── DATEIEN-UMBENENNEN.md             # .txt → dotfiles
│
├── Anleitung/
│   ├── Installation.md               # Hauptanleitung
│   ├── Cloudflare-Tunnel-Setup.md    # CF vollständig
│   ├── E-Mail-Setup.md               # SMTP
│   ├── Auto-Update-System.md         # Updates
│   └── GitHub-Setup.md               # GitHub
│
└── scripts/
    ├── install.sh                     # Hauptinstallation
    ├── update.sh                      # Updates
    ├── debug-install.sh               # Debug
    └── cloudflare-setup-manual.sh     # CF für SSH
```

---

## ✅ Vor der Installation - Checkliste

- [ ] Als root eingeloggt (`su -`)
- [ ] Repository geklont
- [ ] Im richtigen Verzeichnis (`/var/www/fmsv-dingden`)
- [ ] Dateien umbenannt (`./rename-files.sh`)
- [ ] Bei SSH: Cloudflare-Anleitung gelesen
- [ ] README.md gelesen

**Alles erledigt?** → [Installation starten](Anleitung/Installation.md)!

---

## 🎉 Los geht's!

**Wähle deinen Weg:**

- **Schnell & einfach:** [`INSTALLATION-QUICK-GUIDE.md`](INSTALLATION-QUICK-GUIDE.md)
- **Vollständig & sicher:** [`Anleitung/Installation.md`](Anleitung/Installation.md)
- **SSH/PuTTY:** [`CLOUDFLARE-PUTTY-ANLEITUNG.md`](CLOUDFLARE-PUTTY-ANLEITUNG.md)
- **Probleme?** [`HILFE-UEBERSICHT.md`](HILFE-UEBERSICHT.md)

**Viel Erfolg bei der Installation!** ✈️
