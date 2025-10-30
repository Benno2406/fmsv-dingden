# Nginx Quick Fix - Installation fehlgeschlagen

## 🎯 Dein Problem

Nach der Installation:
```
❌ Nginx konnte nicht gestartet werden
❌ Installation fehlgeschlagen!
```

---

## ⚡ Schnelle Lösung (5 Minuten)

### Schritt 1: Prüfen ob Frontend gebaut wurde

```bash
cd /var/www/fmsv-dingden
ls -la dist/
```

**Falls "No such file or directory":**

```bash
# Frontend bauen
npm run build

# Prüfen
ls -la dist/index.html
```

**Sollte zeigen:**
```
-rw-r--r-- 1 root root 1234 ... dist/index.html
```

---

### Schritt 2: Berechtigungen setzen

```bash
cd /var/www/fmsv-dingden
chown -R www-data:www-data .
chmod -R 755 dist/
```

---

### Schritt 3: Nginx Konfiguration testen

```bash
nginx -t
```

**Erwartete Ausgabe:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

**Falls Fehler:**
→ Siehe [`NGINX-FEHLER.md`](NGINX-FEHLER.md)

---

### Schritt 4: Nginx starten

```bash
systemctl start nginx
```

**Status prüfen:**
```bash
systemctl status nginx
```

**Sollte zeigen:**
```
● nginx.service - ...
     Active: active (running) since ...
```

---

## ✅ Erfolgreich!

**Test im Browser:**
```
http://deine-server-ip
```

**Sollte die FMSV Website zeigen!**

---

## ❌ Immer noch Fehler?

### Backend auch starten:

```bash
systemctl start fmsv-backend
systemctl status fmsv-backend
```

### Alle Services prüfen:

```bash
systemctl status nginx
systemctl status fmsv-backend
systemctl status postgresql
```

---

## 🔄 Falls nichts hilft

**Installation ab Nginx neu starten:**

```bash
cd /var/www/fmsv-dingden/Installation/scripts

# Script wird erkennen dass vieles schon installiert ist
# und nur die fehlenden Teile nachholen
./install.sh
```

**Beim nginx-Fehler:**
- Script wird jetzt fragen: "Ignorieren und fortfahren?"
- Drücke `j` für Ja
- Danach manuell beheben (siehe oben)

---

## 📖 Ausführliche Hilfe

Siehe: [`NGINX-FEHLER.md`](NGINX-FEHLER.md)

---

**Quick Commands:**

```bash
# Status Check
systemctl status nginx

# Logs
tail /var/log/nginx/error.log

# Neu starten
systemctl restart nginx

# Konfiguration testen
nginx -t
```

---

**Viel Erfolg!** 🚀
