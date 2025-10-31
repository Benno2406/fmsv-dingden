# RBAC Berechtigungssystem - Dokumentations-Index

Willkommen zur vollständigen Dokumentation des RBAC (Role-Based Access Control) Berechtigungssystems für den Flugmodellsportverein Dingden.

## 📚 Verfügbare Dokumentation

### 1. Quick Reference (Start hier!)
**Datei:** `PERMISSIONS-QUICK-REFERENCE.md`  
**Für:** Entwickler und Administratoren  
**Inhalt:**
- Schnellstart-Guide
- Häufig verwendete Berechtigungen
- Code-Beispiele (Backend & Frontend)
- Rollen-Übersicht
- Fehlerbehebung

**👉 Perfekt für:** Tägliche Arbeit und schnelles Nachschlagen

---

### 2. Vollständige Referenz
**Datei:** `PERMISSIONS-REFERENCE.md`  
**Für:** Administratoren und Power-User  
**Inhalt:**
- Alle 140+ Berechtigungen im Detail
- Kategorien-Übersicht
- Verwendungsbeispiele
- Empfohlene Rollen-Zuweisungen
- Best Practices
- Erweiterbarkeit

**👉 Perfekt für:** Detaillierte Planung und System-Design

---

### 3. Setup & Installation
**Datei:** `RBAC-SETUP.md`  
**Für:** Systemadministratoren  
**Inhalt:**
- Installations-Anleitung
- Datenbank-Schema
- Backend-Integration
- Frontend-Integration
- Migration von Legacy-System

**👉 Perfekt für:** Ersteinrichtung und Updates

---

### 4. Backend RBAC System
**Datei:** `/backend/RBAC-SYSTEM.md`  
**Für:** Backend-Entwickler  
**Inhalt:**
- API-Endpunkte
- Middleware-Dokumentation
- Datenbankstruktur
- Security Best Practices

**👉 Perfekt für:** Backend-Entwicklung

---

## 🗂️ Dateien-Struktur

```
/Installation/
├── PERMISSIONS-INDEX.md           ← Diese Datei
├── PERMISSIONS-QUICK-REFERENCE.md ← Schnellreferenz
├── PERMISSIONS-REFERENCE.md       ← Vollständige Dokumentation
└── RBAC-SETUP.md                  ← Setup-Anleitung

/backend/
├── RBAC-SYSTEM.md                 ← Backend-Dokumentation
└── database/
    ├── schema.sql                 ← Haupt-Datenbankschema (40 Kern-Berechtigungen)
    └── additional-permissions.sql ← Zusätzliche Berechtigungen (100+)

/types/
└── permissions.ts                 ← TypeScript Type Definitions
```

---

## 🚀 Schnellzugriff nach Rolle

### Als Vereins-Administrator
1. **Start:** `PERMISSIONS-QUICK-REFERENCE.md`
2. **Rollen zuweisen:** UI unter `/verwaltung#rollen`
3. **Details nachschlagen:** `PERMISSIONS-REFERENCE.md`

### Als Entwickler
1. **Code-Beispiele:** `PERMISSIONS-QUICK-REFERENCE.md`
2. **Type Definitions:** `/types/permissions.ts`
3. **Backend-APIs:** `/backend/RBAC-SYSTEM.md`
4. **Neue Berechtigungen:** `PERMISSIONS-REFERENCE.md` → "Neue Berechtigungen hinzufügen"

### Als System-Administrator
1. **Installation:** `RBAC-SETUP.md`
2. **Datenbank-Schema:** `/backend/database/schema.sql`
3. **Zusätzliche Berechtigungen:** `/backend/database/additional-permissions.sql`
4. **Troubleshooting:** `PERMISSIONS-QUICK-REFERENCE.md` → "Hilfe & Support"

---

## 📊 System-Übersicht

### Berechtigungen
- **Kern-System:** 40 Berechtigungen (in Datenbank vorhanden)
- **Erweitert:** 100+ Berechtigungen (optional installierbar)
- **Kategorien:** 14

### Rollen
- **System-Rollen:** 6 (Mitglied, Vorstand, Webmaster, Kassenwart, Fluglehrer, Jugendwart)
- **Custom-Rollen:** Unbegrenzt über UI erstellbar

### Integration
- **Backend:** Node.js mit Express
- **Frontend:** React mit TypeScript
- **Datenbank:** PostgreSQL 14+
- **Authentifizierung:** JWT mit automatischer Berechtigungsladung

---

## 🔧 Verwaltungs-Tools

### Web-Interface
- **URL:** `/verwaltung#rollen`
- **Berechtigung:** `system.roles.manage`
- **Features:**
  - Rollen erstellen/bearbeiten/löschen
  - Berechtigungen zuweisen
  - Benutzer-Rollen verwalten
  - Echtzeit-Vorschau

### Datenbank-Tools
```bash
# Alle Berechtigungen anzeigen
psql -U postgres -d fmsv_dingden -c "SELECT * FROM permissions ORDER BY category, name;"

# Benutzer-Berechtigungen anzeigen
psql -U postgres -d fmsv_dingden -c "
  SELECT u.email, r.name as role, p.name as permission
  FROM users u
  LEFT JOIN user_roles ur ON u.id = ur.user_id
  LEFT JOIN roles r ON ur.role_id = r.id
  LEFT JOIN role_permissions rp ON r.id = rp.role_id
  LEFT JOIN permissions p ON rp.permission_id = p.id
  WHERE u.email = 'user@example.com'
  ORDER BY r.priority DESC, p.name;
"

# Zusätzliche Berechtigungen installieren
psql -U postgres -d fmsv_dingden -f /backend/database/additional-permissions.sql
```

---

## 📖 Häufig gestellte Fragen

### Wie erstelle ich eine neue Berechtigung?
1. Siehe `PERMISSIONS-REFERENCE.md` → "Neue Berechtigungen hinzufügen"
2. SQL in Datenbank ausführen
3. TypeScript-Typ aktualisieren (`/types/permissions.ts`)
4. Backend-Route schützen
5. Frontend verwenden

### Wie weise ich einem Benutzer eine Rolle zu?
- **Web-UI:** `/verwaltung#mitglieder` → Benutzer bearbeiten → Rollen zuweisen
- **Web-UI:** `/verwaltung#rollen` → Rolle auswählen → "Benutzer zuweisen"
- **SQL:** `INSERT INTO user_roles (user_id, role_id) VALUES (...);`

### Wie funktioniert die Abwärtskompatibilität?
- Benutzer mit `is_admin = true` haben automatisch ALLE Berechtigungen
- Benutzer ohne RBAC-Rollen werden bei Login automatisch migriert:
  - `is_admin = true` → 'webmaster' Rolle
  - `is_member = true` → 'mitglied' Rolle

### Kann ich eigene Kategorien erstellen?
Ja! Neue Kategorien können in der `permissions` Tabelle angelegt werden. Sie erscheinen dann automatisch in der UI.

### Was passiert wenn ich eine Berechtigung lösche?
- System-Berechtigungen (`is_system_permission = true`) können nicht gelöscht werden
- Custom-Berechtigungen können gelöscht werden
- **Warnung:** Löschen entfernt die Berechtigung von allen Rollen

---

## 🔐 Sicherheitshinweise

### Best Practices
1. **Principle of Least Privilege:** Nur nötige Berechtigungen vergeben
2. **Regelmäßige Audits:** Berechtigungen überprüfen
3. **Rollen statt einzelne Berechtigungen:** Nutze Rollen für einfachere Verwaltung
4. **Dokumentation:** Zweck neuer Berechtigungen dokumentieren
5. **Testing:** Neue Berechtigungen mit verschiedenen Rollen testen

### Audit-Logging
Alle Berechtigungsfehler werden automatisch protokolliert:
- Zeitstempel
- Benutzer-ID
- Angeforderte Berechtigung
- IP-Adresse
- Request-Details

Logs abrufbar über:
- Web-UI: `/verwaltung#database` → Audit-Logs
- Berechtigung: `system.audit.view`

---

## 🆕 Was ist neu?

### Version 1.0.0 (2025-10-31)
✅ Vollständiges RBAC-System implementiert  
✅ 40 Kern-Berechtigungen  
✅ 100+ erweiterte Berechtigungen verfügbar  
✅ 6 Standard-Rollen  
✅ Web-UI für Verwaltung  
✅ TypeScript-Integration  
✅ Vollständige Dokumentation  
✅ Automatische Migration von Legacy-System  
✅ Audit-Logging  

---

## 🗺️ Roadmap

### Geplante Features
- [ ] Import/Export von Rollen und Berechtigungen
- [ ] Berechtigungs-Templates
- [ ] Zeitbasierte Berechtigungen (Ablaufdatum)
- [ ] Berechtigungs-Gruppen
- [ ] Erweiterte Audit-Logs mit Filterung
- [ ] Grafische Berechtigungs-Matrix
- [ ] API für externe Systeme

---

## 💡 Support & Beitragen

### Probleme melden
- GitHub Issues verwenden
- Detaillierte Fehlerbeschreibung
- Logs beifügen (System-Logs & Audit-Logs)

### Dokumentation verbessern
Pull Requests willkommen für:
- Tippfehler-Korrekturen
- Klarstellungen
- Zusätzliche Beispiele
- Übersetzungen

### Neue Berechtigungen vorschlagen
1. Use-Case beschreiben
2. Kategorie vorschlagen
3. Display-Name und Beschreibung formulieren
4. Empfohlene Rollen-Zuweisungen

---

## 📞 Kontakt

Bei Fragen zur Dokumentation:
- E-Mail: webmaster@fmsv-dingden.de
- GitHub: [Repository Issues](https://github.com/fmsv-dingden/vereinsverwaltung/issues)

---

**Letzte Aktualisierung:** 2025-10-31  
**Version:** 1.0.0  
**Status:** Produktiv  

---

## Schnell-Navigation

| Ich möchte... | Dann lies... |
|--------------|--------------|
| Schnell nachschlagen welche Berechtigung ich brauche | `PERMISSIONS-QUICK-REFERENCE.md` |
| Eine vollständige Liste aller Berechtigungen | `PERMISSIONS-REFERENCE.md` |
| Das System installieren | `RBAC-SETUP.md` |
| Backend-Code schreiben | `/backend/RBAC-SYSTEM.md` |
| TypeScript-Typen verwenden | `/types/permissions.ts` |
| Zusätzliche Berechtigungen installieren | `/backend/database/additional-permissions.sql` |
| Die Web-UI nutzen | Öffne `/verwaltung#rollen` |
| Fehler beheben | `PERMISSIONS-QUICK-REFERENCE.md` → "Hilfe & Support" |
