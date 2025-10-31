# Anleitungen

Dokumentation für Installation und Konfiguration.

## 📚 Verfügbare Anleitungen

### Installation.md
**Haupt-Installationsanleitung**

- Debian 12/13 Installation
- Cloudflare Tunnel Setup
- Auto-Update Konfiguration
- Backup & Restore
- Troubleshooting

→ [`Installation.md`](Installation.md)

---

### E-Mail-Setup.md
**SMTP-Konfiguration**

- SendGrid Setup
- Mailgun Setup
- Eigener SMTP-Server
- Test & Troubleshooting

→ [`E-Mail-Setup.md`](E-Mail-Setup.md)

---

### Cloudflare-Tunnel-Setup.md
**Detaillierte Cloudflare Tunnel Anleitung**

- Manuelle Installation
- Konfiguration
- Monitoring
- Troubleshooting

→ [`Cloudflare-Tunnel-Setup.md`](Cloudflare-Tunnel-Setup.md)

---

### Auto-Update-System.md
**Auto-Update Konfiguration & Verwaltung**

- Funktionsweise
- Monitoring
- Branch-Wechsel
- Troubleshooting

→ [`Auto-Update-System.md`](Auto-Update-System.md)

---

### GitHub-Setup.md
**GitHub Repository einrichten**

- Repository erstellen
- Branches konfigurieren (main/testing)
- Personal Access Token
- Auto-Update mit GitHub
- Workflow für Updates

→ [`GitHub-Setup.md`](GitHub-Setup.md)

---

### pgAdmin-Setup.md
**PostgreSQL Datenbank-Verwaltung**

- pgAdmin 4 Web Interface
- IP-Whitelist konfigurieren
- HTTP Basic Auth
- Cloudflare Tunnel Integration
- Server hinzufügen
- Backup & Restore
- Troubleshooting

→ [`pgAdmin-Setup.md`](pgAdmin-Setup.md)

---

### Cloudflare-Access-pgAdmin.md
**pgAdmin mit Cloudflare Access absichern**

- Zero Trust Authentifizierung
- E-Mail/Google/GitHub Login
- Kostenlos (bis 50 User)
- Session-Management
- Logs & Analytics
- IP-Whitelist + Auth kombinieren

→ [`Cloudflare-Access-pgAdmin.md`](Cloudflare-Access-pgAdmin.md)

---

### pgAdmin-Sicherheits-Checkliste.md
**Sicherheits-Check für pgAdmin**

- Sicherheitsstufen (Basis bis Paranoid)
- Quick-Check Tests
- Empfohlene Konfigurationen
- Warnsignale erkennen
- Wartungs-Checkliste
- Sicherheits-Score

→ [`pgAdmin-Sicherheits-Checkliste.md`](pgAdmin-Sicherheits-Checkliste.md)

---

### pgAdmin-Troubleshooting.md
**pgAdmin Reparatur & Fehlerbehebung**

- Flask/Python Module fehlen
- Service startet nicht
- Login funktioniert nicht
- Cloudflare Tunnel Probleme
- Komplette Neuinstallation
- Health Check Monitoring

→ [`pgAdmin-Troubleshooting.md`](pgAdmin-Troubleshooting.md)

---

### ~~pgAdmin-ohne-Apache2.md~~ ❌ OBSOLET
**Alte Anleitung - Nicht mehr benötigt!**

pgAdmin wird **NICHT MEHR verwendet**! Stattdessen: Node.js Database Admin (siehe unten)

→ ~~[`pgAdmin-ohne-Apache2.md`](pgAdmin-ohne-Apache2.md)~~ (veraltet)

---

### Database-Admin-NodeJS.md 🆕 **NEUE LÖSUNG!**
**Datenbank-Verwaltung direkt in Node.js/React**

- ❌ Kein pgAdmin mehr!
- ✅ Node.js + React Lösung
- ✅ Keine zusätzliche Software
- ✅ Perfekte Integration
- ✅ Webmaster-only Zugriff
- Backend-Routes & Frontend-Page
- Features, Sicherheit, Vergleich

→ [`Database-Admin-NodeJS.md`](Database-Admin-NodeJS.md)

---

### Frontend-Backend-Verbindung.md
**API-Verbindung & Troubleshooting**

- Wie funktioniert die Verbindung?
- "Backend nicht erreichbar" beheben
- Frontend neu builden
- API-Tests durchführen
- Debugging-Tipps

→ [`Frontend-Backend-Verbindung.md`](Frontend-Backend-Verbindung.md)

---

### ENV-Dateien.md
**Environment-Variablen erklärt**

- Frontend vs Backend `.env`
- Warum nicht im Git?
- Automatische Erstellung
- Manuelle Erstellung
- Troubleshooting

→ [`ENV-Dateien.md`](ENV-Dateien.md)

---

## 🚀 Wo anfangen?

**Neu hier?**
→ Starte mit [`Installation.md`](Installation.md)

**Installation läuft schon?**
→ Siehe [`E-Mail-Setup.md`](E-Mail-Setup.md)

**Probleme mit Cloudflare Tunnel?**
→ Siehe [`Cloudflare-Tunnel-Setup.md`](Cloudflare-Tunnel-Setup.md)

**pgAdmin absichern?**
→ Siehe [`pgAdmin-Sicherheits-Checkliste.md`](pgAdmin-Sicherheits-Checkliste.md)

---

**Oder nutze einfach das Installations-Script:** `sudo ./scripts/install.sh` 🎯
