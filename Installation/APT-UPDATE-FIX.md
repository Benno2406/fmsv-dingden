# apt update Fehler beheben

Wenn die Installation beim "Aktualisiere Paket-Listen" abbricht.

---

## 🔍 Problem diagnostizieren

### 1. Debug-Script ausführen
```bash
cd /var/www/fmsv-dingden/Installation/scripts
chmod +x debug-install.sh
sudo ./debug-install.sh
```

**Das Script zeigt:**
- ✅ Was funktioniert
- ❌ Was nicht funktioniert
- 💡 Wie man es behebt

---

### 2. Manuell testen
```bash
sudo apt-get update
```

**Achte auf Fehlermeldungen!**

---

## ❌ Häufige Fehler & Lösungen

### Fehler 1: "NO_PUBKEY"

**Fehler:**
```
W: GPG error: ... NO_PUBKEY 1234567890ABCDEF
```

**Lösung:**
```bash
# Ersetze 1234567890ABCDEF mit dem Key aus der Fehlermeldung
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 1234567890ABCDEF

# Dann erneut:
sudo apt-get update
```

---

### Fehler 2: "Failed to fetch"

**Fehler:**
```
E: Failed to fetch http://deb.debian.org/...
E: Could not resolve 'deb.debian.org'
```

**Lösung - DNS Problem:**
```bash
# DNS auf Google DNS umstellen
sudo nano /etc/resolv.conf
```

**Inhalt ändern/ersetzen:**
```
nameserver 8.8.8.8
nameserver 8.8.4.4
```

**Speichern:** `Ctrl+O`, `Enter`, `Ctrl+X`

**Dann:**
```bash
sudo apt-get update
```

---

### Fehler 3: "Release file expired"

**Fehler:**
```
E: Release file for ... is expired
```

**Lösung:**
```bash
# Bei alten Debian-Versionen
sudo apt-get update -o Acquire::Check-Valid-Until=false

# Oder System aktualisieren:
sudo apt-get upgrade
```

---

### Fehler 4: "Connection timed out"

**Fehler:**
```
E: Failed to fetch ... Connection timed out
```

**Lösung:**

**1. Internet-Verbindung prüfen:**
```bash
ping google.com
```

Falls kein Ping:
```bash
# Netzwerk-Status
ip a
ip route

# Netzwerk neu starten
sudo systemctl restart networking
```

**2. Firewall prüfen:**
```bash
# UFW Status
sudo ufw status

# Falls aktiv, HTTP/HTTPS erlauben
sudo ufw allow out 80/tcp
sudo ufw allow out 443/tcp
```

**3. Proxy-Settings (falls Proxy verwendet):**
```bash
sudo nano /etc/apt/apt.conf.d/proxy.conf
```

Inhalt:
```
Acquire::http::Proxy "http://proxy-server:port";
Acquire::https::Proxy "http://proxy-server:port";
```

---

### Fehler 5: "Hash Sum mismatch"

**Fehler:**
```
E: Failed to fetch ... Hash Sum mismatch
```

**Lösung:**
```bash
# APT Cache löschen
sudo rm -rf /var/lib/apt/lists/*
sudo apt-get clean
sudo apt-get update
```

---

### Fehler 6: "Repository not signed"

**Fehler:**
```
W: The repository is not signed
```

**Lösung:**

**Option 1: Keys hinzufügen (sicher)**
```bash
# Für NodeSource (falls benötigt)
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /usr/share/keyrings/nodesource.gpg

# Dann:
sudo apt-get update
```

**Option 2: Unsigned erlauben (unsicher, nur für Tests!)**
```bash
sudo apt-get update --allow-unauthenticated
```

---

### Fehler 7: "/var/lib/dpkg/lock"

**Fehler:**
```
E: Could not get lock /var/lib/dpkg/lock-frontend
```

**Ursache:** Anderer apt-Prozess läuft

**Lösung:**
```bash
# Prüfen welcher Prozess
ps aux | grep apt

# Warten bis fertig, ODER:

# Prozess beenden (nur wenn sicher dass kein wichtiger Update läuft!)
sudo killall apt-get
sudo killall apt

# Lock-Files entfernen
sudo rm /var/lib/dpkg/lock-frontend
sudo rm /var/lib/dpkg/lock
sudo rm /var/cache/apt/archives/lock

# dpkg reparieren
sudo dpkg --configure -a

# Dann:
sudo apt-get update
```

---

## 🔧 System-Repositories reparieren

### Debian 12 (Bookworm)

```bash
sudo nano /etc/apt/sources.list
```

**Inhalt ersetzen mit:**
```
deb http://deb.debian.org/debian bookworm main contrib non-free non-free-firmware
deb-src http://deb.debian.org/debian bookworm main contrib non-free non-free-firmware

deb http://deb.debian.org/debian-security bookworm-security main contrib non-free non-free-firmware
deb-src http://deb.debian.org/debian-security bookworm-security main contrib non-free non-free-firmware

deb http://deb.debian.org/debian bookworm-updates main contrib non-free non-free-firmware
deb-src http://deb.debian.org/debian bookworm-updates main contrib non-free non-free-firmware
```

**Dann:**
```bash
sudo apt-get update
```

---

### Debian 13 (Trixie/Testing)

```bash
sudo nano /etc/apt/sources.list
```

**Inhalt ersetzen mit:**
```
deb http://deb.debian.org/debian trixie main contrib non-free non-free-firmware
deb-src http://deb.debian.org/debian trixie main contrib non-free non-free-firmware

deb http://deb.debian.org/debian-security trixie-security main contrib non-free non-free-firmware
deb-src http://deb.debian.org/debian-security trixie-security main contrib non-free non-free-firmware
```

**Dann:**
```bash
sudo apt-get update
```

---

## ✅ Nach der Reparatur

### Prüfen ob apt funktioniert:
```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### Installation neu starten:
```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./install.sh
```

---

## 🆘 Immer noch Probleme?

### Vollständige Logs sammeln:
```bash
# APT Update mit vollem Output
sudo apt-get update 2>&1 | tee apt-debug.log

# System-Info
cat apt-debug.log
cat /var/log/fmsv-install.log
cat /etc/debian_version
cat /etc/apt/sources.list
```

### Debug-Info anzeigen:
```bash
sudo ./debug-install.sh
```

---

## 📚 Weitere Hilfe

- **Installations-Hilfe:** [`INSTALLATIONS-HILFE.md`](INSTALLATIONS-HILFE.md)
- **Installation:** [`README.md`](README.md)
- **Quick Guide:** [`INSTALLATION-QUICK-GUIDE.md`](INSTALLATION-QUICK-GUIDE.md)

---

**Debian apt Dokumentation:**
https://wiki.debian.org/AptCLI

**Bei Fragen:** GitHub Issues
