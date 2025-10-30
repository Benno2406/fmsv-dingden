# GitHub Repository Information

Wichtige Informationen zum FMSV Dingden Repository.

---

## 📍 Repository-Details

### GitHub Repository
- **Name:** `fmsv-dingden`
- **Owner:** `Benno2406`
- **Visibility:** 🌍 **Public** (keine Authentifizierung nötig!)
- **URL:** https://github.com/Benno2406/fmsv-dingden

---

## 🔗 Clone-URLs

### HTTPS (empfohlen für Installation)
```bash
git clone https://github.com/Benno2406/fmsv-dingden.git
```

**Vorteil:** Funktioniert überall, keine SSH-Konfiguration nötig

---

### SSH (für Entwickler mit SSH-Key)
```bash
git clone git@github.com:Benno2406/fmsv-dingden.git
```

**Vorteil:** Keine Passwort-Eingabe bei push/pull

---

### GitHub CLI (falls installiert)
```bash
gh repo clone Benno2406/fmsv-dingden
```

---

## ✅ Public Repository Vorteile

### Bei Installation:
- ✅ **Keine Authentifizierung nötig** beim Klonen
- ✅ **Kein Personal Access Token** erforderlich
- ✅ **Kein SSH-Key** Setup nötig
- ✅ **Direkt installierbar** auf jedem Server

### Bei Updates:
- ✅ **Automatische Updates** funktionieren ohne Zugangsdaten
- ✅ **git pull** ohne Passwort-Eingabe
- ✅ **Einfacher** für alle Benutzer

---

## 🔒 Wichtig für Entwicklung

### Wenn du am Code mitarbeiten willst:

Du brauchst **Schreibzugriff** auf das Repository!

**Option 1: Als Collaborator hinzugefügt werden**
```
1. GitHub → Repository
2. Settings → Collaborators
3. Add people → Dein GitHub-Username
```

**Option 2: Fork erstellen**
```bash
# 1. Fork auf GitHub erstellen (Button oben rechts)
# 2. Deinen Fork klonen
git clone https://github.com/DEIN-USERNAME/fmsv-dingden.git

# 3. Original als upstream hinzufügen
git remote add upstream https://github.com/Benno2406/fmsv-dingden.git
```

---

## 📋 Branches

### Main Branch
- **Name:** `main`
- **Zweck:** Stabile Production-Version
- **Auto-Deploy:** Kann aktiviert werden

### Testing Branch
- **Name:** `testing` (optional)
- **Zweck:** Neue Features testen vor Production
- **Verwendung:** Für Beta-Tests

---

## 🚀 Installation verwenden

### Einfachste Installation (empfohlen):
```bash
# Als root
cd /var/www
git clone https://github.com/Benno2406/fmsv-dingden.git
cd fmsv-dingden/Installation/scripts
chmod +x install.sh
./install.sh
```

Bei "GitHub Repository URL" einfach **Enter** drücken oder URL eingeben:
```
https://github.com/Benno2406/fmsv-dingden.git
```

---

## 🔄 Updates

### Manuelles Update:
```bash
cd /var/www/fmsv-dingden
git pull
```

### Update-Script:
```bash
cd /var/www/fmsv-dingden/Installation/scripts
./update.sh
```

---

## ⚠️ Bei Private Repository

**Falls das Repository jemals auf Private gestellt wird:**

### Du brauchst dann:

**Personal Access Token:**
```bash
# 1. GitHub → Settings → Developer Settings → Personal Access Tokens
# 2. Generate new token (classic)
# 3. Scopes: repo (full control)
# 4. Token kopieren: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Bei git clone:**
```bash
git clone https://github.com/Benno2406/fmsv-dingden.git
Username: Benno2406
Password: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Token speichern (optional):**
```bash
git config --global credential.helper store
# Beim nächsten git clone wird Token gespeichert
```

**Aber aktuell ist das Repository PUBLIC** → Kein Token nötig! ✅

---

## 📚 Weitere Informationen

- **GitHub-Setup-Anleitung:** [`Anleitung/GitHub-Setup.md`](Anleitung/GitHub-Setup.md)
- **Installation:** [`README.md`](README.md)
- **Git Clone Fehler:** [`GIT-CLONE-FEHLER.md`](GIT-CLONE-FEHLER.md)

---

## 🆘 Probleme?

### "Repository not found"
```bash
# Prüfe die URL:
curl -I https://github.com/Benno2406/fmsv-dingden
# Sollte "HTTP/2 200" zurückgeben
```

### "Could not resolve host"
```bash
# DNS-Problem
nano /etc/resolv.conf
# Hinzufügen:
nameserver 8.8.8.8
```

### Andere Probleme
Siehe: [`INSTALLATIONS-HILFE.md`](INSTALLATIONS-HILFE.md)

---

**Repository-Link:** https://github.com/Benno2406/fmsv-dingden

**Status:** 🌍 Public - Frei klonbar für alle!
