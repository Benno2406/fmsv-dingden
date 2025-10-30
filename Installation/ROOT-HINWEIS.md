# ⚠️ Root-Zugriff erforderlich

## Wichtiger Hinweis zu allen Installations-Befehlen

**Alle Installations- und Update-Scripts müssen als root ausgeführt werden.**

---

## 🔑 Du hast zwei Möglichkeiten:

### Option 1: Mit sudo (empfohlen für normale User)

```bash
sudo ./install.sh
sudo ./update.sh
```

Vorteil: Sicherer, du bleibst als normaler User eingeloggt

---

### Option 2: Als root eingeloggt (einfacher)

```bash
# Als root einloggen
su -
# ODER bei SSH:
ssh root@dein-server

# Dann direkt:
./install.sh
./update.sh
```

Vorteil: Kein `sudo` vor jedem Befehl nötig

---

## 📚 Über die Dokumentation

**In dieser Dokumentation findest du beide Varianten:**

### Variante A: Mit sudo
```bash
sudo ./install.sh
sudo apt-get update
sudo systemctl status nginx
```

### Variante B: Ohne sudo (wenn du schon als root eingeloggt bist)
```bash
./install.sh
apt-get update
systemctl status nginx
```

**Beides funktioniert!** Wähle die Variante, die zu deiner Situation passt.

---

## ✅ Wie erkenne ich ob ich root bin?

```bash
whoami
```

**Output:**
- `root` → Du bist root, kein `sudo` nötig
- `anderer-name` → Du bist normaler User, nutze `sudo`

**Oder:**
```bash
echo $EUID
```

**Output:**
- `0` → Du bist root
- `andere-nummer` → Du bist normaler User

---

## 🔒 Sicherheits-Hinweis

**Best Practice:**
- Für Installation/Updates: Als root (sicherer, weniger Fehler)
- Für normale Arbeit: Als normaler User (sicherer)

**Nicht empfohlen:**
- Permanent als root arbeiten
- Root-Login per SSH erlauben (außer für Installation)

---

## 📝 In der Dokumentation

**Wenn du folgendes siehst:**
```bash
sudo ./install.sh
```

**Und du bist schon als root eingeloggt, dann:**
```bash
./install.sh
```

**Das wars!** Einfach `sudo` weglassen.

---

## 🆘 Fehler: "command not found: sudo"

**Du siehst:**
```
bash: sudo: command not found
```

**Das bedeutet:**
- Entweder: Du bist schon als root → Kein `sudo` nötig!
- Oder: sudo ist nicht installiert → Als root einloggen!

**Lösung:**
```bash
# Option 1: Als root einloggen
su -

# Option 2: sudo installieren (als root)
apt-get install sudo
```

---

## 📚 Weitere Infos

- **Installation:** [`README.md`](README.md)
- **Quick Guide:** [`INSTALLATION-QUICK-GUIDE.md`](INSTALLATION-QUICK-GUIDE.md)
- **Hilfe:** [`INSTALLATIONS-HILFE.md`](INSTALLATIONS-HILFE.md)

---

**Zusammenfassung:**
- Scripts brauchen root-Rechte
- Mit `sudo` oder als root eingeloggt
- In der Doku: Beide Varianten möglich
- Bei "command not found: sudo" → Einfach `sudo` weglassen!
