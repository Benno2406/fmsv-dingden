# ⚡ Quick Start - FMSV Installation

## 1️⃣ Installation in 3 Befehlen

```bash
cd Installation/scripts
bash make-executable.sh
sudo ./install-modular.sh
```

---

## 2️⃣ Empfohlene Antworten

| Frage | Antwort | Bedeutung |
|-------|---------|-----------|
| Installation starten? | `j` | Ja, starten |
| Vorherige Installation entfernen? | `j` | Ja, cleanup |
| Log-Dateien löschen? | `n` | Nein, behalten |
| Installations-Modus? | `1` | Production |
| Update-Kanal? | `1` | Stable |
| Repository URL? | `Enter` | Default verwenden |
| Cloudflare Tunnel? | `n` | Nein (später möglich) |
| Domain? | `deine-domain.de` | Deine Domain |
| pgAdmin? | `n` | Nein (später möglich) |
| Auto-Update? | `3` | Manuell |
| Datenbank-Name? | `Enter` | Default: `fmsv_database` |
| Datenbank-User? | `Enter` | Default: `fmsv_user` |
| Datenbank-Passwort? | `*****` | Sicheres Passwort! |
| Test-Daten? | `j` | Ja (empfohlen) |
| Admin-Email? | `deine@email.de` | Deine E-Mail |

---

## 3️⃣ Nach Installation

### Services prüfen
```bash
systemctl status fmsv-backend
systemctl status nginx
```

### Website öffnen
```bash
http://deine-domain.de
```

### Login
- **Admin:** `admin@example.com` / `admin123`
- **User:** `user@example.com` / `user123`

**⚠️ Passwörter sofort ändern!**

---

## 4️⃣ SSL einrichten

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d deine-domain.de
```

---

## 5️⃣ SMTP konfigurieren

```bash
sudo nano /var/www/fmsv-dingden/backend/.env
```

Ändern:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=deine@email.de
SMTP_PASS=dein-app-passwort
```

Neustart:
```bash
sudo systemctl restart fmsv-backend
```

---

## 🐛 Fehler?

### Logs anschauen
```bash
cat /var/log/fmsv-install.log
journalctl -u fmsv-backend -f
```

### Erneut installieren
```bash
sudo ./install-modular.sh
# Cleanup läuft automatisch!
```

---

## 📞 Weitere Hilfe

- **Vollständige Anleitung:** `MODULAR-README-NEW.md`
- **Bugfixes:** `BUGFIXES-2.md`
- **Test-Checkliste:** `TEST-CHECKLISTE.md`

---

**Version:** 3.1-modular  
**Dauer:** ~15-30 Minuten  
**Status:** ✅ Ready
