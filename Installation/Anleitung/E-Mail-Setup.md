# E-Mail Setup für FMSV Backend

Das Backend benötigt einen SMTP-Server, um E-Mails zu versenden (z.B. für Benachrichtigungen).

## Option 1: SendGrid (Empfohlen für den Start)

### Vorteile
- ✅ 12.000 E-Mails/Monat kostenlos
- ✅ Sehr einfaches Setup
- ✅ Hohe Zustellrate
- ✅ Guter Support

### Setup

1. **Account erstellen**
   - Gehe zu: https://sendgrid.com
   - Klicke auf "Try for Free"
   - Registriere dich

2. **API Key erstellen**
   - Nach dem Login: Settings → API Keys
   - Klicke "Create API Key"
   - Name: "FMSV Backend"
   - Permissions: "Full Access"
   - Kopiere den API Key (wird nur einmal angezeigt!)

3. **Sender Authentication**
   - Settings → Sender Authentication
   - Domain Authentication auswählen
   - Domain: `mail.fmsv.bartholmes.eu`
   - DNS-Einträge bei CloudFlare hinzufügen

4. **Backend konfigurieren**

Bearbeite `/var/www/fmsv-dingden/backend/.env`:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=<dein_api_key_hier>
EMAIL_FROM=noreply@mail.fmsv.bartholmes.eu
EMAIL_FROM_NAME=FMSV Dingden
```

5. **Backend neu starten**
```bash
sudo systemctl restart fmsv-backend
```

---

## Option 2: Mailgun

### Vorteile
- ✅ 5.000 E-Mails/Monat kostenlos (3 Monate)
- ✅ Einfaches Setup
- ✅ Gute Analytics

### Setup

1. **Account erstellen**
   - https://www.mailgun.com
   - Sign Up for Free

2. **Domain hinzufügen**
   - Domains → Add New Domain
   - Domain: `mail.fmsv.bartholmes.eu`
   - DNS-Einträge bei CloudFlare hinzufügen

3. **SMTP Credentials**
   - Domain Settings → SMTP Credentials
   - Create SMTP Credentials
   - Benutzername und Passwort kopieren

4. **Backend konfigurieren**

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@mail.fmsv.bartholmes.eu
SMTP_PASSWORD=<dein_passwort>
EMAIL_FROM=noreply@mail.fmsv.bartholmes.eu
EMAIL_FROM_NAME=FMSV Dingden
```

---

## Option 3: AWS SES (Simple Email Service)

### Vorteile
- ✅ 62.000 E-Mails/Monat kostenlos
- ✅ Sehr günstig danach ($0.10/1000 E-Mails)
- ✅ Zuverlässig

### Nachteile
- ⚠️ Komplexeres Setup
- ⚠️ AWS Account erforderlich

### Setup

1. **AWS Account erstellen**
   - https://aws.amazon.com

2. **SES aktivieren**
   - Console → SES → Verify a New Domain
   - Domain: `mail.fmsv.bartholmes.eu`
   - DNS-Einträge bei CloudFlare hinzufügen

3. **SMTP Credentials erstellen**
   - Account Dashboard → SMTP Settings
   - Create My SMTP Credentials

4. **Production Access beantragen**
   - Standardmäßig im "Sandbox Mode"
   - Account Dashboard → Request Production Access
   - Use Case beschreiben

5. **Backend konfigurieren**

```env
SMTP_HOST=email-smtp.eu-central-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<dein_smtp_user>
SMTP_PASSWORD=<dein_smtp_password>
EMAIL_FROM=noreply@mail.fmsv.bartholmes.eu
EMAIL_FROM_NAME=FMSV Dingden
```

---

## Option 4: Eigener Mailserver (Postfix + Dovecot)

### Vorteile
- ✅ Volle Kontrolle
- ✅ Keine Kosten
- ✅ Unbegrenzte E-Mails

### Nachteile
- ⚠️ Sehr komplex
- ⚠️ Wartungsaufwändig
- ⚠️ Hohe Spam-Wahrscheinlichkeit ohne Erfahrung

### Empfehlung

**Starte mit SendGrid oder Mailgun!**

Ein eigener Mailserver sollte nur eingerichtet werden, wenn:
- Du Erfahrung mit Mailservern hast
- Du Zeit für Wartung hast
- Du SPF, DKIM, DMARC korrekt konfigurieren kannst

---

## DNS-Konfiguration (CloudFlare)

Für alle Optionen benötigst du DNS-Einträge bei CloudFlare:

### SPF Record
```
Type: TXT
Name: mail.fmsv.bartholmes.eu
Content: v=spf1 include:sendgrid.net ~all
```
(Anpassen je nach Provider: sendgrid.net, mailgun.org, amazonses.com)

### DKIM & DMARC
Werden vom jeweiligen Provider bereitgestellt.

---

## Testing

Nach der Konfiguration testen:

```bash
# Im Backend-Verzeichnis
node -e "
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

transporter.sendMail({
  from: process.env.EMAIL_FROM,
  to: 'deine-email@example.com',
  subject: 'FMSV Test E-Mail',
  text: 'Wenn du diese E-Mail erhältst, funktioniert der SMTP-Server!'
}).then(() => console.log('✅ E-Mail gesendet!'))
  .catch(err => console.error('❌ Fehler:', err));
"
```

---

## Troubleshooting

### E-Mails kommen nicht an

1. **Spam-Ordner prüfen**
2. **DNS-Einträge überprüfen**
3. **SMTP-Credentials prüfen**
4. **Logs anschauen**: `journalctl -u fmsv-backend -f`
5. **Provider-Dashboard prüfen** (Bounces, Spam-Reports)

### "Authentication failed"

- SMTP_USER und SMTP_PASSWORD in .env korrekt?
- API Key gültig?
- Bei SendGrid: User muss "apikey" sein (nicht dein Username!)

### "Connection timeout"

- SMTP_HOST korrekt?
- Port 587 erreichbar?
- Firewall-Regeln prüfen

---

## Empfehlung

**Für den Start: SendGrid**
- Schnelles Setup
- Kostenlos für kleine Vereine
- Zuverlässig
- Später Wechsel zu eigenem Server möglich

**Später (bei Bedarf): Eigener Mailserver**
- Nur wenn mehr als 12.000 E-Mails/Monat
- Oder volle Kontrolle gewünscht
