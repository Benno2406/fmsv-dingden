# Installation Quick Guide

Ein-Seiten-Anleitung für die schnelle Server-Installation.

---

## 🚀 Installation in 4 Schritten

### Schritt 1: Repository klonen
```bash
cd /var/www
sudo git clone https://github.com/dein-username/fmsv-dingden.git
cd fmsv-dingden
```

### Schritt 2: Dateien umbenennen
```bash
sudo chmod +x rename-files.sh
sudo ./rename-files.sh
```

### Schritt 3: Installation starten
```bash
cd Installation/scripts
sudo chmod +x install.sh
sudo ./install.sh
```

### Schritt 4: Eingaben machen

#### 1. Bestätigung
```
Installation mit diesen Einstellungen starten? (J/n): J
```

#### 2. Domain
```
Domain oder Subdomain: deine-domain.de
```

#### 3. GitHub URL
```
GitHub Repository URL: https://github.com/dein-username/fmsv-dingden.git
```

#### 4. GitHub Token
```
GitHub Personal Access Token: ghp_xxxxxxxxxxxxxxxxxxxx
```
*Wird beim Tippen nicht angezeigt!*

#### 5. Update-Branch
```
Update-Branch (main/testing) [main]: main
```
Oder einfach Enter für Default

#### 6. Auto-Update Intervall
```
Wähle (1-3) [1]: 1
```
1 = Täglich (empfohlen)

#### 7. E-Mail (optional)
```
E-Mail für Benachrichtigungen: deine@email.de
```
Oder Enter zum Überspringen

---

## ⏱️ Dauer

- **Download & Setup:** 2-3 Minuten
- **PostgreSQL Installation:** 1-2 Minuten
- **Node.js & Dependencies:** 3-5 Minuten
- **Nginx & Cloudflare:** 1-2 Minuten

**Gesamt:** ca. 10-15 Minuten

---

## ✅ Nach der Installation

### Prüfen
```bash
# Services Status
pm2 status

# Website testen
curl http://localhost

# API testen
curl http://localhost:3001/api/health
```

### Browser öffnen
```
https://deine-domain.de
```

---

## 🆘 Probleme?

### Script macht nichts
→ Wartet auf Eingabe! Scrolle hoch.

### Fehler während Installation
```bash
cat /var/log/fmsv-install.log
```

### Service startet nicht
```bash
pm2 logs
systemctl status nginx
systemctl status postgresql
```

---

## 📚 Detaillierte Anleitung

- **Installation:** [`README.md`](README.md)
- **Hilfe:** [`INSTALLATIONS-HILFE.md`](INSTALLATIONS-HILFE.md)
- **GitHub Setup:** [`Anleitung/GitHub-Setup.md`](Anleitung/GitHub-Setup.md)

---

**Viel Erfolg!** 🎉
