# Install Script bricht ab - Debugging Guide

## 🎯 Problem

Das `install.sh` Script bricht einfach ab, ohne klare Fehlermeldung oder hängt sich auf.

---

## 🔍 Schnell-Diagnose

### Schritt 1: Test-Script ausführen

```bash
cd /var/www/fmsv-dingden/Installation/scripts

# Mache Test-Script ausführbar
chmod +x test-cloudflare.sh

# Teste Cloudflare-Verbindung
./test-cloudflare.sh
```

**Das Test-Script prüft:**
1. ✅ Internet-Verbindung
2. ✅ DNS-Auflösung
3. ✅ Cloudflare Server erreichbar
4. ✅ Cloudflare Package Server erreichbar
5. ✅ GPG Key Download funktioniert

**Wenn ein Test fehlschlägt:** Siehe Lösungen unten! ⬇️

---

### Schritt 2: Debug-Script ausführen

```bash
cd /var/www/fmsv-dingden/Installation/scripts
chmod +x debug-install.sh
./debug-install.sh
```

Das zeigt dir:
- ✅ Welche Komponenten bereits installiert sind
- ❌ Was fehlt
- 🔍 Warum das Script abbricht

---

## 🚀 Lösungen

### Lösung 1: Installation ohne Cloudflare

**Am einfachsten!** Installiere erst mal alles ohne Cloudflare:

```bash
cd /var/www/fmsv-dingden/Installation/scripts
./install.sh --no-cloudflare
```

Cloudflare kannst du **später** manuell einrichten:
- Siehe: [`CLOUDFLARE-LOKALER-PC.md`](CLOUDFLARE-LOKALER-PC.md)

---

### Lösung 2: Cloudflare überspringen (interaktiv)

Wenn das Script bei Cloudflare abbricht, wird es dich fragen:

```
❌ Cloudflare GPG Key konnte nicht heruntergeladen werden!

► Cloudflare überspringen und fortfahren? (j/N):
```

**Einfach `j` + Enter drücken!**

Das Script fährt dann ohne Cloudflare fort.

---

### Lösung 3: Manuelle Cloudflare Installation

Falls du Cloudflare **wirklich** brauchst:

```bash
# 1. Test ob pkg.cloudflare.com erreichbar ist
ping pkg.cloudflare.com

# 2. GPG Key manuell herunterladen
mkdir -p --mode=0755 /usr/share/keyrings
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg -o /usr/share/keyrings/cloudflare-main.gpg

# 3. Prüfen ob Key heruntergeladen wurde
ls -la /usr/share/keyrings/cloudflare-main.gpg

# 4. Repository hinzufügen
echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/cloudflared.list

# 5. apt update
apt-get update

# 6. cloudflared installieren
apt-get install -y cloudflared

# 7. Prüfen
cloudflared --version
```

**Erfolgreich?** → Jetzt Script neu starten:
```bash
./install.sh
```

Siehe auch: [`CLOUDFLARED-INSTALLATION-FEHLER.md`](CLOUDFLARED-INSTALLATION-FEHLER.md)

---

## 🔧 Häufige Ursachen

### Ursache 1: Keine Internet-Verbindung zu Cloudflare

**Symptom:**
```
❌ Cloudflare GPG Key konnte nicht heruntergeladen werden!
```

**Test:**
```bash
ping cloudflare.com
ping pkg.cloudflare.com
```

**Lösung bei "Destination Host Unreachable":**

```bash
# DNS prüfen
cat /etc/resolv.conf

# Falls leer oder falsch:
echo "nameserver 8.8.8.8" > /etc/resolv.conf
echo "nameserver 8.8.4.4" >> /etc/resolv.conf

# Neu testen
ping cloudflare.com
```

---

### Ursache 2: Firewall blockiert Zugriff

**Symptom:**
```
curl: (7) Failed to connect to pkg.cloudflare.com
```

**Test:**
```bash
# Firewall Status
ufw status

# iptables Regeln
iptables -L -n
```

**Lösung:**
```bash
# UFW: Ausgehende Verbindungen erlauben
ufw allow out 443/tcp
ufw allow out 80/tcp

# Oder Firewall temporär deaktivieren
ufw disable

# Installation durchführen
./install.sh

# Firewall wieder aktivieren
ufw enable
```

---

### Ursache 3: apt-get hat Lock-Problem

**Symptom:**
```
E: Could not get lock /var/lib/apt/lists/lock
```

**Lösung:**
```bash
# Andere apt Prozesse killen
pkill -9 apt
pkill -9 apt-get
pkill -9 dpkg

# Locks entfernen
rm -f /var/lib/apt/lists/lock
rm -f /var/cache/apt/archives/lock
rm -f /var/lib/dpkg/lock*

# dpkg reparieren
dpkg --configure -a

# Neu versuchen
apt-get update
```

---

### Ursache 4: Alte/Kaputte apt Pakete

**Symptom:**
```
E: dpkg was interrupted
```

**Lösung:**
```bash
# dpkg reparieren
dpkg --configure -a

# Kaputte Pakete entfernen
apt-get clean
apt-get autoclean
apt-get autoremove

# Paket-Datenbank neu aufbauen
apt-get update
apt-get upgrade

# Script neu starten
./install.sh
```

---

### Ursache 5: Falsche Linux-Version

**Symptom:**
```
E: The repository does not have a Release file
```

**Test:**
```bash
lsb_release -a
```

**Lösung:**
Siehe [`CLOUDFLARED-INSTALLATION-FEHLER.md`](CLOUDFLARED-INSTALLATION-FEHLER.md) → "Problem 2: Repository nicht gefunden"

---

## 📋 Installations-Log ansehen

Wenn das Script abbricht, sieh dir das Log an:

```bash
cat /var/log/fmsv-install.log
```

**Oder live während Installation:**
```bash
# Neues Terminal öffnen
tail -f /var/log/fmsv-install.log
```

**Nach was suchst du:**
- Letzte Zeile zeigt wo es fehlschlug
- Rote Fehlermeldungen
- "failed", "error", "cannot"

---

## 🔄 Installation komplett neu starten

Falls alles schief läuft:

```bash
# 1. Alles aufräumen
rm -rf /var/www/fmsv-dingden
cd /var/www

# 2. Repository neu klonen
git clone https://github.com/dein-username/fmsv-dingden.git
cd fmsv-dingden

# 3. Dateien umbenennen
chmod +x rename-files.sh
./rename-files.sh

# 4. Test ob Cloudflare geht
cd Installation/scripts
chmod +x test-cloudflare.sh
./test-cloudflare.sh

# 5a. Wenn Test erfolgreich:
./install.sh

# 5b. Wenn Test fehlschlägt:
./install.sh --no-cloudflare
```

---

## 🎯 Spezielle Szenarien

### Szenario 1: Script friert ein (keine Ausgabe)

**Mögliche Ursachen:**
1. Wartet auf Eingabe (scrolle nach oben!)
2. Lädt große Dateien herunter (npm install dauert 2-5 Min)
3. PostgreSQL Installation (1-2 Min)

**Test ob Script noch läuft:**
```bash
# Neues Terminal öffnen
ps aux | grep install

# Sollte zeigen:
root      1234  0.0  0.1  12345  6789 pts/0    S+   12:34   0:00 /bin/bash ./install.sh
```

**Netzwerk-Aktivität prüfen:**
```bash
# Installiere nethogs
apt-get install nethogs

# Zeige Netzwerk-Traffic
nethogs
```

**Wenn wirklich eingefroren:**
```
Strg + C

# Script neu starten
./install.sh
```

---

### Szenario 2: Script springt zu Schritt X

**Symptom:**
```
Schritt 1 von 14 - Systemprüfung
Schritt 9 von 14 - Cloudflare...
```

Schritt 2-8 fehlen?

**Ursache:** Script läuft im **"Quick"-Modus** oder Komponenten sind bereits installiert.

**Lösung:** Das ist **NORMAL**! Das Script überspringt bereits installierte Komponenten.

---

### Szenario 3: Permission Denied Fehler

**Symptom:**
```
bash: ./install.sh: Permission denied
```

**Lösung:**
```bash
chmod +x install.sh
./install.sh
```

**Oder als root:**
```bash
su -
cd /var/www/fmsv-dingden/Installation/scripts
./install.sh
```

---

## 📖 Weitere Hilfe

### Dokumentation:
- [`INSTALLATIONS-HILFE.md`](INSTALLATIONS-HILFE.md) - Allgemeine Hilfe
- [`CLOUDFLARED-INSTALLATION-FEHLER.md`](CLOUDFLARED-INSTALLATION-FEHLER.md) - Cloudflare Probleme
- [`GIT-CLONE-FEHLER.md`](GIT-CLONE-FEHLER.md) - Git Probleme
- [`HILFE-UEBERSICHT.md`](HILFE-UEBERSICHT.md) - Alle Hilfen

### Tools:
```bash
# Test Cloudflare
./test-cloudflare.sh

# Debug Installation
./debug-install.sh

# Logs ansehen
cat /var/log/fmsv-install.log
```

---

## ✅ Checkliste

Bevor du die Installation startest:

- [ ] Als root eingeloggt (`whoami` → sollte "root" zeigen)
- [ ] Im richtigen Verzeichnis (`pwd` → `/var/www/fmsv-dingden/Installation/scripts`)
- [ ] Internet funktioniert (`ping google.com`)
- [ ] Cloudflare Test bestanden (`./test-cloudflare.sh`) **ODER** `--no-cloudflare` Flag nutzen
- [ ] Genug Speicher (`df -h /` → mindestens 2GB frei)
- [ ] Keine apt Prozesse laufen (`ps aux | grep apt`)

**Alles ✓?** → Los geht's!

```bash
./install.sh
# Oder ohne Cloudflare:
./install.sh --no-cloudflare
```

---

## 🎉 Zusammenfassung

### Das musst du dir merken:

1. **Script bricht bei Cloudflare ab?**
   → Einfach mit `j` überspringen oder `--no-cloudflare` nutzen!

2. **Keine Ahnung was los ist?**
   → `./test-cloudflare.sh` und `./debug-install.sh` ausführen!

3. **Cloudflare Probleme?**
   → Siehe [`CLOUDFLARED-INSTALLATION-FEHLER.md`](CLOUDFLARED-INSTALLATION-FEHLER.md)

4. **Immer noch Probleme?**
   → Installation komplett neu starten (siehe oben)

5. **Cloudflare später einrichten?**
   → Siehe [`CLOUDFLARE-LOKALER-PC.md`](CLOUDFLARE-LOKALER-PC.md)

---

**Viel Erfolg!** 🚀
