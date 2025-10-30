# 🚨 500 Fehler - SOFORT-HILFE

## Du siehst einen "500 Internal Server Error" im Browser?

### 🎯 Schnellste Lösung (kopiere und führe aus):

```bash
cd /var/www/fmsv-dingden/Installation/scripts && chmod +x diagnose-500.sh && ./diagnose-500.sh
```

Das Diagnose-Script:
- ✅ Prüft automatisch alle wichtigen Komponenten
- ✅ Zeigt genau was nicht funktioniert
- ✅ Bietet einen automatischen Quick-Fix an

---

## ⚡ Noch schneller - One-Line-Fix:

Wenn du es einfach nur zum Laufen bringen willst:

```bash
cd /var/www/fmsv-dingden/backend && node scripts/initDatabase.js && systemctl restart fmsv-backend && sleep 2 && systemctl status fmsv-backend
```

**Was macht das?**
1. Initialisiert die Datenbank
2. Startet das Backend neu
3. Zeigt den Status

---

## 🔍 Manuelle Diagnose in 3 Schritten:

### Schritt 1: Backend-Status prüfen
```bash
systemctl status fmsv-backend
```

**Läuft das Backend?**
- ✅ `active (running)` → Weiter zu Schritt 2
- ❌ `inactive (dead)` → Weiter zu Schritt 3

---

### Schritt 2: Backend-Logs ansehen
```bash
journalctl -u fmsv-backend -n 30 --no-pager
```

Suche nach Fehlermeldungen wie:
- `ECONNREFUSED` → PostgreSQL läuft nicht
- `password authentication failed` → Falsche DB-Credentials
- `Cannot find module` → Dependencies fehlen
- `schema.sql` → Datenbank nicht initialisiert

---

### Schritt 3: Services neu starten

```bash
# PostgreSQL starten
systemctl start postgresql

# Datenbank initialisieren
cd /var/www/fmsv-dingden/backend
node scripts/initDatabase.js

# Backend starten
systemctl restart fmsv-backend

# nginx starten
systemctl restart nginx

# Status prüfen
systemctl status fmsv-backend
```

---

## 📋 Die 5 häufigsten Ursachen:

### 1️⃣ PostgreSQL läuft nicht
```bash
systemctl start postgresql
systemctl status postgresql
```

### 2️⃣ Datenbank nicht initialisiert
```bash
cd /var/www/fmsv-dingden/backend
node scripts/initDatabase.js
```

### 3️⃣ Backend läuft nicht
```bash
systemctl start fmsv-backend
systemctl status fmsv-backend
```

### 4️⃣ Falsche Datenbank-Credentials
```bash
# Prüfe .env Datei
cat /var/www/fmsv-dingden/backend/.env | grep DB_

# Teste Verbindung
su - postgres -c "psql -l" | grep fmsv
```

### 5️⃣ Port 3000 belegt
```bash
# Prüfe was auf Port 3000 läuft
netstat -tulpn | grep :3000

# Falls nötig: Kill den Prozess
kill -9 <PID>
systemctl restart fmsv-backend
```

---

## 🆘 Wenn nichts hilft - Komplett-Neustart:

```bash
# Alle Services stoppen
systemctl stop fmsv-backend
systemctl stop nginx
systemctl stop postgresql

# In richtiger Reihenfolge starten
systemctl start postgresql
sleep 2

cd /var/www/fmsv-dingden/backend
node scripts/initDatabase.js

systemctl start fmsv-backend
sleep 2

systemctl start nginx

# Status prüfen
echo "PostgreSQL:"
systemctl status postgresql --no-pager | head -5
echo ""
echo "Backend:"
systemctl status fmsv-backend --no-pager | head -5
echo ""
echo "nginx:"
systemctl status nginx --no-pager | head -5
```

---

## 📞 Detaillierte Diagnose:

Für eine ausführliche Analyse siehe:
```bash
cat /var/www/fmsv-dingden/Installation/500-FEHLER-DIAGNOSE.md
```

Oder führe das Diagnose-Script aus:
```bash
cd /var/www/fmsv-dingden/Installation/scripts
chmod +x diagnose-500.sh
./diagnose-500.sh
```

---

## 💻 Backend manuell testen (für Entwickler):

```bash
cd /var/www/fmsv-dingden/backend
sudo -u www-data node server.js
```

**Erwartete Ausgabe:**
```
🚀 Server läuft auf Port 3000
📊 Datenbank-Verbindung erfolgreich
```

Wenn das funktioniert, aber systemd nicht:
```bash
# Prüfe systemd Service
systemctl status fmsv-backend
journalctl -u fmsv-backend -n 50

# Neu starten
systemctl restart fmsv-backend
```

---

## ✅ Erfolgreicher Test:

Wenn alles läuft, sollten diese Befehle funktionieren:

```bash
# Backend antwortet
curl http://localhost:3000

# nginx antwortet
curl http://localhost

# API Health-Check (wenn implementiert)
curl http://localhost/api/health
```

---

## 🔄 Installation komplett neu durchführen:

Als letzte Option:

```bash
cd /var/www/fmsv-dingden/Installation/scripts
./install.sh
```

**ACHTUNG:** Dabei gehen bestehende Daten verloren!
Erstelle vorher ein Backup:
```bash
# Datenbank exportieren
su - postgres -c "pg_dump fmsv_database > /tmp/fmsv_backup_$(date +%Y%m%d).sql"

# Uploads sichern
cp -r /var/www/fmsv-dingden/Saves /tmp/fmsv_saves_backup
```

---

## 📊 Schnell-Check - Ist alles OK?

```bash
echo "PostgreSQL: $(systemctl is-active postgresql)"
echo "Backend:    $(systemctl is-active fmsv-backend)"
echo "nginx:      $(systemctl is-active nginx)"
```

Erwartete Ausgabe:
```
PostgreSQL: active
Backend:    active
nginx:      active
```

---

## 🎓 Für SSH/PuTTY Nutzer:

Alle Befehle funktionieren in SSH/PuTTY genauso!

1. Mit PuTTY zum Server verbinden
2. Als root einloggen: `su -`
3. Befehle aus dieser Anleitung kopieren und einfügen
4. Mit der rechten Maustaste in PuTTY einfügen

---

## 🚀 Next Steps nach der Behebung:

Wenn der 500 Fehler behoben ist:

1. ✅ Website im Browser öffnen
2. ✅ Login testen (wenn Test-Daten eingefügt wurden)
3. ✅ Cloudflare Tunnel einrichten (falls noch nicht geschehen)
4. ✅ E-Mail-Konfiguration anpassen

Siehe:
- `/var/www/fmsv-dingden/Installation/QUICK-START.md`
- `/var/www/fmsv-dingden/Installation/Anleitung/E-Mail-Setup.md`
