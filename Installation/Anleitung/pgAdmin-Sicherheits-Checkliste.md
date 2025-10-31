# pgAdmin Sicherheits-Checkliste

**⚠️ WICHTIG:** pgAdmin ist ein mächtiges Tool mit Vollzugriff auf deine Datenbank!

Diese Checkliste hilft dir, pgAdmin sicher zu konfigurieren.

---

## 🔒 **Sicherheitsstufen**

### Stufe 1: Basis (MINIMUM!) ⚠️
- [ ] Starkes pgAdmin-Passwort (mind. 16 Zeichen)
- [ ] pgAdmin NICHT öffentlich erreichbar

### Stufe 2: Empfohlen 👍
- [ ] **Stufe 1** erfüllt
- [ ] IP-Whitelist in nginx aktiviert
- [ ] Nur bekannte IPs erlaubt
- [ ] `deny all;` aktiviert

### Stufe 3: Sehr sicher 🔐
- [ ] **Stufe 2** erfüllt
- [ ] Cloudflare Access aktiviert
- [ ] Oder: HTTP Basic Auth zusätzlich
- [ ] Session-Timeout konfiguriert

### Stufe 4: Paranoid 🛡️
- [ ] **Stufe 3** erfüllt
- [ ] pgAdmin nur via VPN erreichbar
- [ ] 2FA auf Cloudflare Access
- [ ] Audit-Logging aktiviert
- [ ] Regelmäßige Passwort-Rotation

---

## ✅ **Quick-Check: Ist dein pgAdmin sicher?**

### Test 1: Öffentliche Erreichbarkeit
```bash
# Von ANDEREM Gerät (nicht Server!) im Browser öffnen:
http://DEINE-SERVER-IP:5050
```

**Erwartung:**
- ❌ Sollte NICHT erreichbar sein (Timeout/Connection refused)
- ✅ Nur via Cloudflare Tunnel: Login-Seite

**Falls direkt erreichbar:**
```bash
# SOFORT nginx IP-Whitelist aktivieren!
sudo nano /etc/nginx/sites-available/pgadmin
# deny all; einkommentieren
sudo systemctl reload nginx
```

### Test 2: Cloudflare Tunnel
```bash
# Im Browser öffnen:
https://pgadmin.fmsv.bartholmes.eu
```

**Erwartung:**
- ✅ Cloudflare Access Login-Seite (falls aktiviert)
- ⚠️ Direkt pgAdmin Login (ohne Access)

**Falls ohne Access:**
- Siehe [`Cloudflare-Access-pgAdmin.md`](Cloudflare-Access-pgAdmin.md)

### Test 3: Passwort-Stärke
```bash
# Frage dich:
# - Mind. 16 Zeichen? ✅
# - Groß- + Kleinbuchstaben? ✅
# - Zahlen + Sonderzeichen? ✅
# - Nicht im Wörterbuch? ✅
# - Nicht wiederverwendet? ✅
```

**Passwort-Generator:**
```bash
# Zufälliges 32-Zeichen Passwort:
openssl rand -base64 32
```

### Test 4: nginx Config
```bash
# Prüfe IP-Whitelist:
sudo cat /etc/nginx/sites-available/pgadmin | grep -A 10 "IP-Whitelist"
```

**Sollte enthalten:**
```nginx
allow 127.0.0.1;        # ✅ Localhost
allow ::1;              # ✅ IPv6 Localhost
allow DEINE-IP;         # ✅ Deine IP
deny all;               # ✅ MUSS aktiv sein!
```

**Falls `deny all;` auskommentiert ist:**
```bash
sudo nano /etc/nginx/sites-available/pgadmin
# Entferne # vor "deny all;"
sudo systemctl reload nginx
```

---

## 🎯 **Empfohlene Konfiguration für FMSV**

### Szenario A: Du bist immer am selben Ort
**Beste Lösung:** nginx IP-Whitelist

```nginx
# /etc/nginx/sites-available/pgadmin
allow 127.0.0.1;
allow ::1;
allow DEINE-HOME-IP;    # Feste IP
deny all;               # ✅ Aktiv!
```

**Vorteil:** Einfach, keine zusätzliche Authentifizierung

### Szenario B: Du bist unterwegs
**Beste Lösung:** Cloudflare Access

- E-Mail-basierter Login
- Session läuft nach 24h ab
- Von überall erreichbar

**Setup:** [`Cloudflare-Access-pgAdmin.md`](Cloudflare-Access-pgAdmin.md)

### Szenario C: Mehrere Administratoren
**Beste Lösung:** Cloudflare Access + nginx Whitelist

```nginx
# nginx: Nur Cloudflare Tunnel
allow 127.0.0.1;
deny all;
```

**Plus:**
- Cloudflare Access mit mehreren E-Mails
- Jeder Admin hat eigene Login-Logs
- Zentrale Verwaltung

### Szenario D: Höchste Sicherheit
**Beste Lösung:** VPN + Cloudflare Access + IP-Whitelist

1. WireGuard VPN auf Server installieren
2. pgAdmin nur via VPN-IP erreichbar
3. Zusätzlich Cloudflare Access
4. Zusätzlich HTTP Basic Auth

**= 4-fache Absicherung!**

---

## 🚨 **Warnsignale**

### ⚠️ Rote Flaggen (SOFORT handeln!)

**1. pgAdmin von überall erreichbar**
```bash
# Test von anderem Gerät:
curl -I http://DEINE-IP:5050
# ❌ 200 OK = SEHR GEFÄHRLICH!
# ✅ Timeout/Connection refused = Gut
```

**Sofort-Maßnahme:**
```bash
# pgAdmin Service stoppen
sudo systemctl stop pgadmin4

# nginx Whitelist aktivieren
sudo nano /etc/nginx/sites-available/pgadmin
# deny all; aktivieren

# nginx neu laden
sudo systemctl reload nginx

# pgAdmin wieder starten
sudo systemctl start pgadmin4
```

**2. Standard-Passwort noch aktiv**
- ❌ `admin123` oder ähnlich
- ❌ Passwort < 12 Zeichen

**Sofort ändern:** Siehe [`pgAdmin-Setup.md`](pgAdmin-Setup.md) → "Passwort vergessen"

**3. Port 5050 öffentlich erreichbar**
```bash
# Prüfe Firewall:
sudo ufw status

# Port 5050 sollte NICHT aufgelistet sein!
# Falls doch:
sudo ufw delete allow 5050
```

**4. Verdächtige Aktivitäten in Logs**
```bash
# pgAdmin Logs prüfen:
sudo journalctl -u pgadmin4 -n 100 | grep -i "failed\|error\|unauthorized"

# nginx Access Logs:
sudo tail -100 /var/log/nginx/access.log | grep pgadmin
```

Achte auf:
- Viele fehlgeschlagene Logins
- Unbekannte IP-Adressen
- Zugriffe zu ungewöhnlichen Zeiten

---

## 🛠️ **Wartungs-Checkliste (monatlich)**

### [ ] 1. Passwort-Rotation
Ändere pgAdmin-Passwort alle 3 Monate:
```bash
# Siehe pgAdmin-Setup.md
```

### [ ] 2. IP-Whitelist aktualisieren
Entferne alte/ungenutzte IPs:
```bash
sudo nano /etc/nginx/sites-available/pgadmin
sudo systemctl reload nginx
```

### [ ] 3. Logs prüfen
```bash
# Letzte 100 Zugriffe:
sudo journalctl -u pgadmin4 -n 100

# Fehler:
sudo journalctl -u pgadmin4 | grep -i error

# nginx Logs:
sudo tail -100 /var/log/nginx/access.log | grep pgadmin
```

### [ ] 4. Updates installieren
```bash
# pgAdmin updaten:
sudo apt update
sudo apt upgrade pgadmin4-web

# Service neu starten:
sudo systemctl restart pgadmin4
```

### [ ] 5. Cloudflare Access Sessions prüfen
Falls Cloudflare Access genutzt wird:
1. Dashboard → Zero Trust → Logs → Access
2. Prüfe auf verdächtige Aktivitäten

### [ ] 6. Backup-Test
Teste ob du Zugriff hast falls Hauptzugang ausfällt:
- Zweite E-Mail in Cloudflare Access?
- Backup-Admin-Account in pgAdmin?
- Direkter Server-Zugriff möglich?

---

## 📊 **Sicherheits-Score**

**Bewerte deine Installation:**

| Maßnahme | Punkte | ✅ |
|----------|--------|---|
| pgAdmin Passwort > 16 Zeichen | 10 | [ ] |
| nginx IP-Whitelist aktiv | 20 | [ ] |
| `deny all;` aktiviert | 20 | [ ] |
| Cloudflare Access aktiv | 15 | [ ] |
| HTTP Basic Auth zusätzlich | 10 | [ ] |
| Port 5050 nicht öffentlich | 10 | [ ] |
| Regelmäßige Passwort-Rotation | 5 | [ ] |
| Logs werden überwacht | 5 | [ ] |
| Backup-Zugang vorhanden | 5 | [ ] |

**Auswertung:**
- **0-30 Punkte:** ⚠️ **GEFÄHRLICH!** Sofort nachbessern!
- **31-50 Punkte:** ⚠️ **Unsicher** - Dringend verbessern
- **51-70 Punkte:** ⚙️ **Okay** - Noch Luft nach oben
- **71-90 Punkte:** ✅ **Gut** - Empfohlenes Niveau
- **91-100 Punkte:** 🔐 **Sehr sicher** - Vorbildlich!

**FMSV Ziel:** Mind. **71 Punkte**

---

## 📚 **Weitere Ressourcen**

- **pgAdmin Setup:** [`pgAdmin-Setup.md`](pgAdmin-Setup.md)
- **Cloudflare Access:** [`Cloudflare-Access-pgAdmin.md`](Cloudflare-Access-pgAdmin.md)
- **Cloudflare Tunnel:** [`Cloudflare-Tunnel-Setup.md`](Cloudflare-Tunnel-Setup.md)

---

## 🎉 **Checkliste abgehakt?**

**Glückwunsch!** Dein pgAdmin ist jetzt sicher konfiguriert! 🔒✈️

**Letzte Empfehlungen:**
1. ⏰ Reminder setzen: Logs monatlich prüfen
2. 📝 Passwörter sicher speichern (Passwort-Manager!)
3. 🔄 Diese Checkliste bei Updates wiederholen

**Bei Fragen:** Siehe Troubleshooting-Sektionen in den Anleitungen.
