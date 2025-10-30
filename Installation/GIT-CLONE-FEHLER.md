# Git Clone Fehler beheben

Wenn das Klonen des Repositories fehlschlägt.

---

## ❌ Fehler: "Repository konnte nicht geklont werden"

**Du siehst:**
```
✗ Verzeichnis /var/www/fmsv-dingden nicht gefunden!
Installation fehlgeschlagen!
```

**Ursache:** Das `git clone` ist fehlgeschlagen.

---

## 🔍 Mögliche Ursachen

### 1. Falsche GitHub URL

**Problem:**
```
fatal: repository 'https://github.com/user/repo.git' not found
```

**Lösung:**
```bash
# Prüfe die URL
# RICHTIG:
https://github.com/Benno2406/fmsv-dingden.git

# FALSCH:
https://github.com/Benno2406/fmsv-dingden      # ← .git fehlt!
http://github.com/Benno2406/fmsv-dingden.git   # ← http statt https
github.com/Benno2406/fmsv-dingden.git          # ← https:// fehlt!
```

**Die korrekte URL für dieses Projekt:**
```
https://github.com/Benno2406/fmsv-dingden.git
```

---

### 2. Repository existiert nicht

**Problem:**
- Repository noch nicht erstellt
- Falscher Repository-Name
- Falscher Username

**Lösung:**
```bash
# 1. GitHub Repository überprüfen
# Gehe zu: https://github.com/Benno2406/fmsv-dingden

# 2. Existiert es?
# JA → Es existiert und ist public! ✅
# Problem: Möglicherweise Internet-/DNS-Problem (siehe unten)
```

**Dieses Repository existiert bereits und ist PUBLIC!**
- Kein Setup nötig
- Keine Authentifizierung erforderlich

---

### 3. Branch existiert nicht

**Problem:**
```
fatal: Remote branch main not found
```

**Lösung:**
```bash
# Welche Branches gibt es?
git ls-remote https://github.com/Benno2406/fmsv-dingden.git

# Das Repository hat 'main' als Haupt-Branch
# Falls Fehler: Internet-/DNS-Problem prüfen (siehe unten)
```

---

### 4. Keine Berechtigung (Private Repo)

**Problem:**
```
fatal: Authentication failed
fatal: could not read Username
```

**Ursache:** Repository ist private, du hast keine Zugangsdaten angegeben.

**⚠️ WICHTIG: Dieses Repository ist bereits PUBLIC!**

Wenn du diesen Fehler siehst, verwendest du wahrscheinlich die **falsche URL** oder hast ein **DNS-Problem**.

**Lösung: Korrekte URL verwenden**
```bash
# Diese URL verwenden:
git clone https://github.com/Benno2406/fmsv-dingden.git

# NICHT eine andere URL!
```

**Falls Repository wirklich private wäre - Personal Access Token verwenden**
```bash
# 1. Token erstellen (siehe GitHub-Setup.md Schritt 6)

# 2. Bei git clone eingeben:
git clone https://github.com/dein-username/fmsv-dingden.git
# Username: dein-username
# Password: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Lösung C: SSH Key verwenden**
```bash
# 1. SSH Key erstellen
ssh-keygen -t ed25519 -C "deine@email.de"

# 2. Public Key zu GitHub hinzufügen
cat ~/.ssh/id_ed25519.pub
# → GitHub → Settings → SSH Keys → New SSH key

# 3. SSH URL verwenden:
git clone git@github.com:dein-username/fmsv-dingden.git
```

---

### 5. Keine Internet-Verbindung

**Problem:**
```
fatal: unable to access 'https://github.com/...': Could not resolve host
```

**Lösung:**
```bash
# Internet-Verbindung testen
ping google.com
ping github.com

# Falls kein Ping:
# 1. Netzwerk prüfen
ip a
ip route

# 2. DNS prüfen
nslookup github.com

# 3. DNS auf Google DNS umstellen
nano /etc/resolv.conf
# Inhalt:
nameserver 8.8.8.8
nameserver 8.8.4.4

# 4. Erneut versuchen
ping github.com
```

---

### 6. Firewall blockiert

**Problem:**
```
fatal: unable to access 'https://github.com/...': Failed to connect
```

**Lösung:**
```bash
# Firewall prüfen
ufw status

# Falls aktiv, ausgehende Verbindungen erlauben
ufw allow out 443/tcp
ufw allow out 80/tcp

# Erneut versuchen
git clone https://github.com/...
```

---

## 🔧 Manuell klonen für Debug

### Test ohne Installation-Script

```bash
# 1. Testverzeichnis
cd /tmp

# 2. Manuell klonen
git clone -v https://github.com/dein-username/fmsv-dingden.git

# 3. Funktioniert es?
```

**JA → Problem ist im Installations-Script:**
```bash
# Logs ansehen
cat /var/log/fmsv-install.log

# Installation erneut versuchen
cd /var/www/fmsv-dingden/Installation/scripts
./install.sh
```

**NEIN → Problem mit Git/GitHub:**
```bash
# Siehe oben: Mögliche Ursachen 1-6
```

---

## 📝 Installation mit vorhandenem Clone

**Wenn du das Repo schon manuell geklont hast:**

```bash
# 1. Repo liegt in /tmp?
mv /tmp/fmsv-dingden /var/www/

# 2. Installation starten
cd /var/www/fmsv-dingden/Installation/scripts
chmod +x install.sh
./install.sh

# 3. Bei "Repository klonen":
# → "Nein" wählen (bestehendes Repo nutzen)
```

---

## ✅ GitHub Repository richtig einrichten

### Checklist:

- [ ] Repository auf GitHub erstellt
- [ ] Repository-Name: `fmsv-dingden`
- [ ] Visibility: Private oder Public
- [ ] Mindestens 1 Commit vorhanden
- [ ] Branch `main` oder `testing` existiert
- [ ] Bei Private: Personal Access Token erstellt
- [ ] URL endet mit `.git`

**Siehe:** [`Anleitung/GitHub-Setup.md`](Anleitung/GitHub-Setup.md)

---

## 🆘 Immer noch Probleme?

### Debug-Informationen sammeln:

```bash
# 1. Git Version
git --version

# 2. GitHub erreichbar?
curl -I https://github.com

# 3. Vollständiger Clone-Versuch
git clone -v https://github.com/dein-username/fmsv-dingden.git /tmp/test-clone 2>&1

# 4. Installations-Logs
cat /var/log/fmsv-install.log
```

### Häufigste Lösungen:

1. **URL prüfen** - Mit `.git` am Ende
2. **Branch prüfen** - Existiert `main` oder `testing`?
3. **Berechtigung** - Personal Access Token bei Private Repo
4. **Internet** - DNS auf 8.8.8.8 umstellen
5. **Neu versuchen** - Oft hilft einfach nochmal versuchen!

---

## 📚 Weitere Hilfe

- **GitHub Setup:** [`Anleitung/GitHub-Setup.md`](Anleitung/GitHub-Setup.md)
- **Installation:** [`README.md`](README.md)
- **Installations-Hilfe:** [`INSTALLATIONS-HILFE.md`](INSTALLATIONS-HILFE.md)
- **APT Probleme:** [`APT-UPDATE-FIX.md`](APT-UPDATE-FIX.md)

---

**Bei Fragen:** GitHub Docs → [https://docs.github.com/en/get-started](https://docs.github.com/en/get-started)
