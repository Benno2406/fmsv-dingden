# FMSV Backend - API Dokumentation

Vollständige REST API Dokumentation für das FMSV Dingden Backend.

## Base URL

```
https://fmsv.bartholmes.eu/api
```

## Authentifizierung

Die meisten Endpoints erfordern einen JWT Token im Authorization Header:

```
Authorization: Bearer <access_token>
```

### Token erhalten

```http
POST /api/auth/login
```

---

## Authentifizierung

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "twoFactorCode": "123456"  // Optional, nur wenn 2FA aktiviert
}
```

**Response (Erfolg):**
```json
{
  "success": true,
  "message": "Login erfolgreich",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Max",
    "lastName": "Mustermann",
    "isAdmin": false,
    "isMember": true,
    "twoFaEnabled": false
  }
}
```

**Response (2FA erforderlich):**
```json
{
  "success": false,
  "requiresTwoFactor": true,
  "message": "2FA-Code erforderlich"
}
```

### Logout

```http
POST /api/auth/logout
Authorization: Bearer <token>
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}
```

### Token erneuern

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "new_access_token",
  "refreshToken": "new_refresh_token"
}
```

### Token verifizieren

```http
GET /api/auth/verify
Authorization: Bearer <token>
```

### 2FA Setup starten

```http
POST /api/auth/2fa/setup
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "secret": "base32_secret",
  "qrCode": "data:image/png;base64,..."
}
```

### 2FA aktivieren

```http
POST /api/auth/2fa/enable
Authorization: Bearer <token>
Content-Type: application/json

{
  "secret": "base32_secret_from_setup",
  "code": "123456"
}
```

### 2FA deaktivieren

```http
POST /api/auth/2fa/disable
Authorization: Bearer <token>
Content-Type: application/json

{
  "password": "current_password"
}
```

---

## Benutzer

### Alle Benutzer abrufen (Admin)

```http
GET /api/users?page=1&limit=50&search=max&isActive=true
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "users": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "pages": 3
  }
}
```

### Benutzer Details

```http
GET /api/users/:id
Authorization: Bearer <token>
```

### Benutzer erstellen (Admin)

```http
POST /api/users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "email": "new@example.com",
  "password": "secure123",
  "firstName": "Max",
  "lastName": "Mustermann",
  "phone": "+49123456789",
  "street": "Musterstraße 1",
  "postalCode": "12345",
  "city": "Musterstadt",
  "isAdmin": false,
  "isMember": true,
  "memberSince": "2024-01-01",
  "memberNumber": "M123"
}
```

### Benutzer aktualisieren

```http
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Max",
  "lastName": "Mustermann",
  "phone": "+49123456789"
  // Weitere Felder...
}
```

### Benutzer löschen (Admin)

```http
DELETE /api/users/:id
Authorization: Bearer <admin_token>
```

### Avatar hochladen

```http
POST /api/users/:id/avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data

avatar: <file>
```

---

## Artikel

### Alle Artikel

```http
GET /api/articles?page=1&limit=10&category=news&search=flug
```

**Parameter:**
- `page`: Seitenzahl (default: 1)
- `limit`: Einträge pro Seite (default: 10)
- `category`: Kategorie filtern
- `search`: Suchbegriff

### Artikel Details

```http
GET /api/articles/:id
```

### Artikel erstellen (Admin)

```http
POST /api/articles
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Neuer Artikel",
  "slug": "neuer-artikel",
  "content": "<p>Artikel-Inhalt...</p>",
  "excerpt": "Kurze Zusammenfassung",
  "category": "news",
  "featuredImage": "/uploads/image.jpg",
  "isPublished": true,
  "metaDescription": "SEO Description"
}
```

### Artikel aktualisieren (Admin)

```http
PUT /api/articles/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Aktualisierter Titel",
  "isPublished": false
  // Weitere Felder...
}
```

### Artikel löschen (Admin)

```http
DELETE /api/articles/:id
Authorization: Bearer <admin_token>
```

---

## Termine

### Alle Termine

```http
GET /api/events?from=2024-01-01&to=2024-12-31&isPublic=true
```

**Parameter:**
- `from`: Start-Datum (ISO 8601)
- `to`: End-Datum (ISO 8601)
- `isPublic`: Öffentliche Termine (true/false)

### Termin erstellen (Admin)

```http
POST /api/events
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Vereinstreffen",
  "description": "Monatliches Treffen",
  "startDate": "2024-06-15T19:00:00Z",
  "endDate": "2024-06-15T21:00:00Z",
  "allDay": false,
  "location": "Vereinsheim",
  "isPublic": true
}
```

### Termin aktualisieren (Admin)

```http
PUT /api/events/:id
Authorization: Bearer <admin_token>
Content-Type: application/json
```

### Termin löschen (Admin)

```http
DELETE /api/events/:id
Authorization: Bearer <admin_token>
```

---

## Flugbuch

### Alle Einträge (Member)

```http
GET /api/flugbuch?from=2024-01-01&to=2024-12-31&pilotId=uuid
Authorization: Bearer <member_token>
```

### Eintrag erstellen (Member)

```http
POST /api/flugbuch
Authorization: Bearer <member_token>
Content-Type: application/json

{
  "pilotName": "Max Mustermann",
  "aircraftType": "Segler",
  "aircraftName": "ASW 27",
  "startTime": "2024-06-15T14:30:00Z",
  "endTime": "2024-06-15T16:45:00Z",
  "notes": "Thermikflug"
}
```

### Eintrag aktualisieren

```http
PUT /api/flugbuch/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "endTime": "2024-06-15T17:00:00Z",
  "notes": "Erweiterter Thermikflug"
}
```

### Eintrag löschen

```http
DELETE /api/flugbuch/:id
Authorization: Bearer <token>
```

---

## Bilder & Galerien

### Alle Galerien

```http
GET /api/images/galleries
```

### Galerie erstellen (Admin)

```http
POST /api/images/galleries
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Sommerfest 2024",
  "description": "Bilder vom Sommerfest",
  "isPublic": true
}
```

### Bilder einer Galerie

```http
GET /api/images/galleries/:galleryId/images
```

### Bilder hochladen (Admin)

```http
POST /api/images/galleries/:galleryId/images
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

images: <file1>, <file2>, <file3>...
```

**Limits:**
- Admin: max 50MB pro Datei
- Member: max 5MB pro Datei
- Bis zu 10 Bilder gleichzeitig

### Bild löschen (Admin)

```http
DELETE /api/images/:id
Authorization: Bearer <admin_token>
```

---

## Protokolle

### Alle Protokolle (Member)

```http
GET /api/protocols?year=2024&type=meeting
Authorization: Bearer <member_token>
```

### Protokoll erstellen (Admin)

```http
POST /api/protocols
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Jahreshauptversammlung 2024",
  "content": "<p>Protokoll-Inhalt...</p>",
  "protocolDate": "2024-03-15",
  "protocolType": "meeting",
  "isPublic": false
}
```

### Protokoll aktualisieren (Admin)

```http
PUT /api/protocols/:id
Authorization: Bearer <admin_token>
Content-Type: application/json
```

### Protokoll löschen (Admin)

```http
DELETE /api/protocols/:id
Authorization: Bearer <admin_token>
```

---

## Benachrichtigungen

### Benachrichtigungen abrufen

```http
GET /api/notifications?unreadOnly=true
Authorization: Bearer <token>
```

### Als gelesen markieren

```http
PATCH /api/notifications/:id/read
Authorization: Bearer <token>
```

### Alle als gelesen markieren

```http
POST /api/notifications/read-all
Authorization: Bearer <token>
```

### Benachrichtigung löschen

```http
DELETE /api/notifications/:id
Authorization: Bearer <token>
```

---

## Fehler-Responses

Alle Fehler folgen diesem Format:

```json
{
  "success": false,
  "message": "Fehlermeldung"
}
```

### HTTP Status Codes

- `200` - Erfolg
- `201` - Erstellt
- `400` - Ungültige Anfrage
- `401` - Nicht authentifiziert
- `403` - Keine Berechtigung
- `404` - Nicht gefunden
- `409` - Konflikt (z.B. E-Mail bereits vorhanden)
- `413` - Datei zu groß
- `429` - Zu viele Anfragen (Rate Limit)
- `500` - Server-Fehler

---

## Rate Limiting

- **Allgemein**: 100 Anfragen / 15 Minuten
- **Login**: 5 Versuche / 15 Minuten
- **Upload**: 50 Uploads / Stunde

Bei Überschreitung: HTTP 429 mit Retry-After Header

---

## Datei-Uploads

### Erlaubte Dateitypen

**Bilder:**
- image/jpeg
- image/png
- image/gif
- image/webp

**Dokumente:**
- application/pdf
- application/msword
- application/vnd.openxmlformats-officedocument.wordprocessingml.document

### Upload-Limits

**Mitglieder:**
- Max. 5 MB pro Datei
- Max. 10 Dateien gleichzeitig

**Administratoren:**
- Max. 50 MB pro Datei
- Max. 10 Dateien gleichzeitig

---

## Beispiel-Integration (JavaScript)

```javascript
// Login
const response = await fetch('https://fmsv.bartholmes.eu/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const data = await response.json();
const token = data.accessToken;

// Artikel abrufen
const articlesResponse = await fetch('https://fmsv.bartholmes.eu/api/articles', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const articles = await articlesResponse.json();
```

---

## WebSocket (Zukünftig)

Für Echtzeit-Updates (Benachrichtigungen, Flugbuch-Updates) kann später WebSocket-Support hinzugefügt werden.

---

## Versionierung

Aktuelle API Version: **v1**

Bei breaking changes wird eine neue Version (v2) eingeführt mit neuem Base Path: `/api/v2/...`
