# Installation - Hilfe Übersicht

Schnellzugriff auf alle Hilfe-Dokumente.

---

## 🚀 Schnellstart

| Was? | Datei |
|------|-------|
| **Start hier** | [`README.md`](README.md) |
| **Schnellanleitung** | [`INSTALLATION-QUICK-GUIDE.md`](INSTALLATION-QUICK-GUIDE.md) |
| **GitHub bereits fertig** | [`REPOSITORY-INFO.md`](REPOSITORY-INFO.md) |

---

## ❌ Probleme & Lösungen

### Installation bricht ab

| Problem | Lösung |
|---------|--------|
| **Script bricht einfach ab** | [`SCRIPT-BRICHT-AB.md`](SCRIPT-BRICHT-AB.md) ⭐ |
| **Nginx startet nicht** | [`NGINX-FEHLER.md`](NGINX-FEHLER.md) ⭐ **NEU!** |
| **Script wartet auf Eingabe** | Normal! `J` drücken. Siehe [`README.md`](README.md#-wichtig---zuerst-lesen) |
| **apt update Fehler** | [`APT-UPDATE-FIX.md`](APT-UPDATE-FIX.md) |
| **Git Clone schlägt fehl** | [`GIT-CLONE-FEHLER.md`](GIT-CLONE-FEHLER.md) |
| **Generelle Fehler** | [`INSTALLATIONS-HILFE.md`](INSTALLATIONS-HILFE.md) |

---

### Root & sudo

| Problem | Lösung |
|---------|--------|
| **"sudo: command not found"** | [`ROOT-HINWEIS.md`](ROOT-HINWEIS.md) |
| **Script braucht root** | Als root einloggen: `su -` |
| **Mit oder ohne sudo?** | [`ROOT-HINWEIS.md`](ROOT-HINWEIS.md) |

---

### Cloudflare Tunnel

| Problem | Lösung |
|---------|--------|
| **Browser öffnet sich nicht (SSH/PuTTY)** | [`CLOUDFLARE-SSH-LOGIN.md`](CLOUDFLARE-SSH-LOGIN.md) |
| **PuTTY Schritt-für-Schritt (mit Bildern)** | [`CLOUDFLARE-PUTTY-ANLEITUNG.md`](CLOUDFLARE-PUTTY-ANLEITUNG.md) ⭐ |
| **URL manuell öffnen** | [`CLOUDFLARE-URL-MANUELL.md`](CLOUDFLARE-URL-MANUELL.md) |
| **.cloudflared Ordner nicht sichtbar** | [`CLOUDFLARED-ORDNER-PROBLEM.md`](CLOUDFLARED-ORDNER-PROBLEM.md) |
| **cloudflared Installation fehlgeschlagen** | [`CLOUDFLARED-INSTALLATION-FEHLER.md`](CLOUDFLARED-INSTALLATION-FEHLER.md) ⭐ **NEU!** |
| **WinSCP Upload Guide** | [`WINSCP-QUICK-GUIDE.md`](WINSCP-QUICK-GUIDE.md) |
| **Quick Guide** | [`CLOUDFLARE-QUICK-GUIDE.md`](CLOUDFLARE-QUICK-GUIDE.md) |
| **Setup-Script** | `scripts/cloudflare-setup-manual.sh` |
| **Vollständige Anleitung** | [`Anleitung/Cloudflare-Tunnel-Setup.md`](Anleitung/Cloudflare-Tunnel-Setup.md) |

---

### GitHub

| Problem | Lösung |
|---------|--------|
| **Repository-Infos** | [`REPOSITORY-INFO.md`](REPOSITORY-INFO.md) |
| **Git Clone Fehler** | [`GIT-CLONE-FEHLER.md`](GIT-CLONE-FEHLER.md) |
| **GitHub-Setup** | [`Anleitung/GitHub-Setup.md`](Anleitung/GitHub-Setup.md) |
| **Quick Start** | [`GitHub-QUICK-START.md`](GitHub-QUICK-START.md) |

---

## 📚 Detaillierte Anleitungen

### Installation

| Thema | Datei |
|-------|-------|
| **Hauptanleitung** | [`Anleitung/Installation.md`](Anleitung/Installation.md) |
| **Quick Guide** | [`INSTALLATION-QUICK-GUIDE.md`](INSTALLATION-QUICK-GUIDE.md) |
| **Beispiel-Ausgabe** | [`BEISPIEL-AUSGABE.md`](BEISPIEL-AUSGABE.md) |
| **Scripts** | [`scripts/README.md`](scripts/README.md) |

---

### Setup & Konfiguration

| Thema | Datei |
|-------|-------|
| **GitHub** | [`Anleitung/GitHub-Setup.md`](Anleitung/GitHub-Setup.md) |
| **Cloudflare Tunnel** | [`Anleitung/Cloudflare-Tunnel-Setup.md`](Anleitung/Cloudflare-Tunnel-Setup.md) |
| **E-Mail** | [`Anleitung/E-Mail-Setup.md`](Anleitung/E-Mail-Setup.md) |
| **Auto-Update** | [`Anleitung/Auto-Update-System.md`](Anleitung/Auto-Update-System.md) |

---

### Referenzen

| Thema | Datei |
|-------|-------|
| **Quick Reference** | [`QUICK-REFERENCE.md`](QUICK-REFERENCE.md) |
| **Quick Commands** | [`../QUICK-COMMANDS.md`](../QUICK-COMMANDS.md) |
| **Quick Start** | [`../QUICK-START.md`](../QUICK-START.md) |

---

## 🔧 Scripts

### Installations-Scripts

```bash
cd /var/www/fmsv-dingden/Installation/scripts
```

| Script | Beschreibung |
|--------|--------------|
| **`install.sh`** | Hauptinstallation |
| **`update.sh`** | Updates durchführen |
| **`debug-install.sh`** | System-Check & Debug |
| **`cloudflare-setup-manual.sh`** | Cloudflare für SSH-Nutzer |

---

### Hilfs-Scripts (Root-Verzeichnis)

```bash
cd /var/www/fmsv-dingden
```

| Script | Beschreibung |
|--------|--------------|
| **`rename-files.sh`** | Dateien umbenennen (.txt → dotfiles) |
| **`update-github-urls.sh`** | GitHub-URLs in Doku aktualisieren |
| **`remove-sudo-from-docs.sh`** | sudo aus Doku entfernen |

---

## 🎯 Häufigste Fragen

### Vor Installation

**Q: Muss ich GitHub einrichten?**  
A: Nein! Repository ist bereits fertig. Siehe [`REPOSITORY-INFO.md`](REPOSITORY-INFO.md)

**Q: Brauche ich einen GitHub-Token?**  
A: Nein! Repository ist public. Einfach Enter drücken.

**Q: Brauche ich Cloudflare?**  
A: Optional. Nur wenn du keine Port-Weiterleitungen machen willst.

---

### Während Installation

**Q: Script wartet auf Eingabe - ist das normal?**  
A: Ja! Einfach `J` für Ja drücken.

**Q: Browser öffnet sich nicht für Cloudflare?**  
A: Normal bei SSH/PuTTY. Siehe [`CLOUDFLARE-SSH-LOGIN.md`](CLOUDFLARE-SSH-LOGIN.md)

**Q: Git Clone schlägt fehl?**  
A: URL prüfen. Siehe [`GIT-CLONE-FEHLER.md`](GIT-CLONE-FEHLER.md)

---

### Nach Installation

**Q: Wie mache ich Updates?**  
A: `cd Installation/scripts && ./update.sh`

**Q: Wo sind die Logs?**  
A: `/var/log/fmsv-install.log` oder `journalctl -u fmsv-backend`

**Q: Backend startet nicht?**  
A: `systemctl status fmsv-backend` und Logs prüfen

---

## 🆘 Noch Probleme?

### Debug-Informationen sammeln

```bash
# System-Check
cd /var/www/fmsv-dingden/Installation/scripts
./debug-install.sh

# Installation-Logs
cat /var/log/fmsv-install.log

# Service-Logs
journalctl -u fmsv-backend -n 100
journalctl -u cloudflared -n 100

# System-Info
uname -a
free -h
df -h
```

---

### Hilfe-Reihenfolge

1. **Erst:** Passende Datei oben suchen
2. **Dann:** [`INSTALLATIONS-HILFE.md`](INSTALLATIONS-HILFE.md) lesen
3. **Danach:** Debug-Script ausführen: `./debug-install.sh`
4. **Zuletzt:** Logs ansehen: `cat /var/log/fmsv-install.log`

---

## 📖 Dokumentations-Struktur

```
Installation/
├── README.md                          # ← Start hier
├── INSTALLATION-QUICK-GUIDE.md        # Schnellanleitung
├── INSTALLATIONS-HILFE.md             # Fehlerbehandlung
├── HILFE-UEBERSICHT.md               # ← Diese Datei
│
├── REPOSITORY-INFO.md                 # GitHub-Infos
├── GIT-CLONE-FEHLER.md               # Git-Probleme
├── ROOT-HINWEIS.md                   # sudo vs. root
├── APT-UPDATE-FIX.md                 # apt Probleme
│
├── CLOUDFLARE-SSH-LOGIN.md           # Cloudflare über SSH
├── CLOUDFLARE-QUICK-GUIDE.md         # Cloudflare Quick
│
├── QUICK-REFERENCE.md                # Befehls-Referenz
├── BEISPIEL-AUSGABE.md               # Installation-Output
│
├── Anleitung/
│   ├── Installation.md               # Detailliert
│   ├── GitHub-Setup.md               # GitHub
│   ├── Cloudflare-Tunnel-Setup.md    # Cloudflare
│   ├── E-Mail-Setup.md               # E-Mail
│   └── Auto-Update-System.md         # Auto-Updates
│
└── scripts/
    ├── install.sh                     # Installation
    ├── update.sh                      # Updates
    ├── debug-install.sh               # Debug
    └── cloudflare-setup-manual.sh     # Cloudflare SSH
```

---

## ✅ Checkliste: Alles klar?

Vor Installation:
- [ ] Als root eingeloggt (`su -`)
- [ ] Repository geklont
- [ ] Dateien umbenannt (`./rename-files.sh`)

Häufige Probleme kennen:
- [ ] [`ROOT-HINWEIS.md`](ROOT-HINWEIS.md) gelesen
- [ ] [`GIT-CLONE-FEHLER.md`](GIT-CLONE-FEHLER.md) überflogen
- [ ] Bei Cloudflare: [`CLOUDFLARE-QUICK-GUIDE.md`](CLOUDFLARE-QUICK-GUIDE.md) bereit

Installation starten:
- [ ] `cd Installation/scripts`
- [ ] `chmod +x install.sh`
- [ ] `./install.sh`

---

**Bei Fragen:** Passende Datei oben nachschlagen! 📚
