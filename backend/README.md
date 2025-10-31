# FMSV Dingden - Backend

Sicheres Node.js Backend mit PostgreSQL, JWT-Authentifizierung und 2FA.

## 🚨 Backend startet nicht?

**Schnelle Diagnose:**
```bash
cd backend
chmod +x diagnose.sh
./diagnose.sh
```

📖 **Ausführliche Hilfe:** [BACKEND-NICHT-ERREICHBAR.md](./BACKEND-NICHT-ERREICHBAR.md)

## Features

✅ **Sicherheit**
- JWT-basierte Authentifizierung mit Refresh Tokens
- 2-Faktor-Authentifizierung (2FA) mit Authenticator Apps
- Bcrypt Password Hashing (12 Rounds)
- Rate Limiting
- Helmet Security Headers
- CORS Protection
- Input Validation & Sanitization
- Audit Logging (Datenbank + Dateien)

✅ **Datenspeicherung**
- PostgreSQL Datenbank für strukturierte Daten
- Lokale Datei-Speicherung in `/Saves` für Uploads
- Audit Logs in `/Logs/Audit`

✅ **Funktionen**
- User Management (CRUD)
- Article/News System
- Events/Calendar
- Flugbuch (Flight Log)
- Image Galleries
- Document Management
- Protocols
- Notifications
- File Uploads (Bilder, PDFs)
  - Mitglieder: max 5MB
  - Admins: max 50MB

## Technologie-Stack

- **Runtime**: Node.js 20+ LTS
- **Framework**: Express.js
- **Datenbank**: PostgreSQL 14+
- **Authentifizierung**: JWT + 2FA (Speakeasy)
- **Validation**: Express-Validator
- **Security**: Helmet, bcrypt, CORS
- **Logging**: Winston
- **File Upload**: Multer

## Installation

### Voraussetzungen

- Debian 12 (Bookworm)
- Root-Zugriff

### Automatische Installation

```bash
cd /var/www/fmsv-dingden/Installation/scripts
chmod +x install-backend.sh
sudo ./install-backend.sh
```

### Manuelle Installation

1. **PostgreSQL installieren**
```bash
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

2. **Node.js installieren**
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo bash -
sudo apt-get install -y nodejs
```

3. **Datenbank erstellen**
```bash
sudo -u postgres psql
CREATE DATABASE fmsv_database;
CREATE USER fmsv_user WITH ENCRYPTED PASSWORD 'dein_passwort';
GRANT ALL PRIVILEGES ON DATABASE fmsv_database TO fmsv_user;
\q
```

4. **Backend Setup**
```bash
cd /var/www/fmsv-dingden/backend
npm install
cp .env.example .env
# .env editieren und anpassen!
```

5. **Datenbank initialisieren**
```bash
npm run init-db
npm run seed  # Optional: Test-Daten
```

6. **Backend starten**
```bash
npm start
```

## Konfiguration

### Umgebungsvariablen (.env)

Wichtige Variablen, die angepasst werden müssen:

```env
# JWT Secrets (automatisch generiert)
JWT_SECRET=<generiert>
JWT_REFRESH_SECRET=<generiert>

# E-Mail (ANPASSEN!)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=<dein_api_key>
EMAIL_FROM=noreply@mail.fmsv.bartholmes.eu
```

### SMTP-Konfiguration

Siehe `/Installation/Anleitung` für detaillierte E-Mail-Setup-Anleitungen.

**Empfohlene Dienste:**
- **SendGrid** (12.000 E-Mails/Monat kostenlos)
- **Mailgun** (5.000 E-Mails/Monat kostenlos)
- **AWS SES** (62.000 E-Mails/Monat kostenlos)

## API Endpoints

### Authentifizierung
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh Token
- `GET /api/auth/verify` - Verify Token
- `POST /api/auth/2fa/setup` - 2FA Setup
- `POST /api/auth/2fa/enable` - 2FA aktivieren
- `POST /api/auth/2fa/disable` - 2FA deaktivieren

### Benutzer
- `GET /api/users` - Alle Benutzer (Admin)
- `GET /api/users/:id` - Benutzer Details
- `POST /api/users` - Benutzer erstellen (Admin)
- `PUT /api/users/:id` - Benutzer aktualisieren
- `DELETE /api/users/:id` - Benutzer löschen (Admin)
- `POST /api/users/:id/avatar` - Avatar hochladen

### Artikel
- `GET /api/articles` - Alle Artikel
- `GET /api/articles/:id` - Artikel Details
- `POST /api/articles` - Artikel erstellen (Admin)
- `PUT /api/articles/:id` - Artikel aktualisieren (Admin)
- `DELETE /api/articles/:id` - Artikel löschen (Admin)

### Termine
- `GET /api/events` - Alle Termine
- `POST /api/events` - Termin erstellen (Admin)
- `PUT /api/events/:id` - Termin aktualisieren (Admin)
- `DELETE /api/events/:id` - Termin löschen (Admin)

### Flugbuch
- `GET /api/flugbuch` - Alle Einträge (Member)
- `POST /api/flugbuch` - Eintrag erstellen (Member)
- `PUT /api/flugbuch/:id` - Eintrag aktualisieren
- `DELETE /api/flugbuch/:id` - Eintrag löschen

### Bilder
- `GET /api/images/galleries` - Alle Galerien
- `POST /api/images/galleries` - Galerie erstellen (Admin)
- `GET /api/images/galleries/:id/images` - Bilder einer Galerie
- `POST /api/images/galleries/:id/images` - Bilder hochladen (Admin)
- `DELETE /api/images/:id` - Bild löschen (Admin)

### Protokolle
- `GET /api/protocols` - Alle Protokolle (Member)
- `POST /api/protocols` - Protokoll erstellen (Admin)
- `PUT /api/protocols/:id` - Protokoll aktualisieren (Admin)
- `DELETE /api/protocols/:id` - Protokoll löschen (Admin)

### Benachrichtigungen
- `GET /api/notifications` - Benachrichtigungen
- `PATCH /api/notifications/:id/read` - Als gelesen markieren
- `POST /api/notifications/read-all` - Alle als gelesen
- `DELETE /api/notifications/:id` - Löschen

## Systemd Service

```bash
# Status prüfen
sudo systemctl status fmsv-backend

# Neustarten
sudo systemctl restart fmsv-backend

# Logs anzeigen
sudo journalctl -u fmsv-backend -f
```

## Logs

- **Application Logs**: `/Logs/combined.log`
- **Error Logs**: `/Logs/error.log`
- **Audit Logs**: `/Logs/Audit/audit-YYYY-MM-DD.log`

## Sicherheit

### Best Practices

1. **Starke Passwörter**: Mindestens 8 Zeichen
2. **2FA aktivieren**: Für Admin-Accounts
3. **Regelmäßige Updates**: System und npm Packages
4. **Backup**: Tägliche Datenbank-Backups
5. **Monitoring**: Logs regelmäßig prüfen
6. **SSL/TLS**: Nur HTTPS verwenden (CloudFlare)

### Audit Logging

Alle wichtigen Aktionen werden geloggt:
- Login/Logout
- Datenänderungen (Create, Update, Delete)
- Fehlgeschlagene Login-Versuche
- Unbefugte Zugriffs-Versuche
- Rate-Limit-Überschreitungen

## Entwicklung

### Lokale Entwicklung

```bash
npm install
npm run dev  # Mit nodemon
```

### Debugging

```bash
NODE_ENV=development node server.js
```

## Support

Bei Fragen oder Problemen:
- Logs prüfen: `journalctl -u fmsv-backend -f`
- Datenbank-Connection testen
- .env Konfiguration überprüfen

## Lizenz

MIT License - FMSV Dingden
