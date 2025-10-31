# Quick Start: Database Admin (Node.js)

**Von 0 auf 100 in 2 Minuten!** ⚡

---

## ✅ **Was du brauchst:**

- [ ] FMSV Backend läuft (`pm2 status`)
- [ ] PostgreSQL läuft (`sudo systemctl status postgresql`)
- [ ] Webmaster-Account (`rang = 'webmaster'`)

---

## 🚀 **Start (2 Minuten)**

### Schritt 1: Code updaten

```bash
cd /var/www/fmsv-dingden

# Neuesten Code holen
git pull

# Backend-Dependencies
cd backend
npm install

# Backend neu starten
pm2 restart fmsv-backend

# Status prüfen
pm2 status
# ✅ fmsv-backend sollte "online" sein
```

### Schritt 2: Frontend bauen (optional)

```bash
cd /var/www/fmsv-dingden

# Nur wenn du Frontend-Änderungen hast
npm run build
```

### Schritt 3: Testen!

**Browser:**
1. Öffne: https://fmsv.bartholmes.eu/login
2. Login als Webmaster
3. Gehe zu: Verwaltung
4. Sidebar: Klick auf "Datenbank" (nur für Webmaster sichtbar!)

**API-Test:**
```bash
# Health-Check
curl http://localhost:3000/api/database/health

# Sollte 401 zeigen (Auth required) ✅
```

---

## 🎯 **Erste Schritte im Database Admin**

### 1. Tabellen durchsuchen

```
Tab: "Tabellen"
  ↓
Klick auf "users"
  ↓
Siehst du: Schema + Daten
```

### 2. SQL Query ausführen

```
Tab: "SQL Query"
  ↓
Eingeben: SELECT * FROM users WHERE rang = 'webmaster';
  ↓
Klick: "Query ausführen"
  ↓
Ergebnis-Tabelle erscheint
```

### 3. Statistiken anzeigen

```
Tab: "Aktivität"
  ↓
Siehst du: Laufende Queries, Connections, etc.
```

### 4. Backup erstellen

```
Button: "Backup erstellen" (oben rechts)
  ↓
Warte kurz...
  ↓
Backup gespeichert in: /var/www/fmsv-dingden/backups/
```

---

## ✅ **Verifikation (30 Sekunden)**

```bash
# 1. Backend läuft?
pm2 status
# ✅ online

# 2. Database-Route aktiv?
curl http://localhost:3000/api/database/health
# ✅ 401 (Auth required)

# 3. PostgreSQL läuft?
sudo systemctl is-active postgresql
# ✅ active

# 4. Webmaster-User existiert?
psql -h localhost -U fmsv_user -d fmsv_db -c "SELECT email, rang FROM users WHERE rang = 'webmaster';"
# ✅ Zeigt deine Email

# ALLES ✅? → Fertig!
```

---

## 🔧 **Troubleshooting (1 Minute)**

### Problem: "Datenbank" nicht in Sidebar

**Lösung:**
```sql
-- Rang auf Webmaster setzen
UPDATE users SET rang = 'webmaster' WHERE email = 'deine@email.de';
```

### Problem: Backend läuft nicht

**Lösung:**
```bash
cd /var/www/fmsv-dingden/backend
pm2 logs fmsv-backend --lines 20
# Fehler prüfen, dann:
pm2 restart fmsv-backend
```

### Problem: 403 Forbidden

**Lösung:**
```bash
# Neu einloggen
# Dann: F12 → Console → Fehler prüfen
```

---

## 📚 **Mehr Info?**

### Kurze Übersicht:
→ [NEUE-DATABASE-ADMIN-LÖSUNG.md](NEUE-DATABASE-ADMIN-LÖSUNG.md)

### Migration von pgAdmin:
→ [MIGRATION-pgAdmin-zu-NodeJS.md](MIGRATION-pgAdmin-zu-NodeJS.md)

### Vollständige Dokumentation:
→ [Database-Admin-NodeJS.md](Anleitung/Database-Admin-NodeJS.md)

---

## ⚡ **TL;DR (Ultra-Quick)**

```bash
cd /var/www/fmsv-dingden
git pull
cd backend
npm install
pm2 restart fmsv-backend
```

Dann: **Browser → Login → Verwaltung → Datenbank** 🚀

---

**Fertig! Viel Spaß! 🎉**
