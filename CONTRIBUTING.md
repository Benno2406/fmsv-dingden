# Beitragen zum FMSV Dingden Projekt

Vielen Dank für dein Interesse, zum FMSV Dingden Projekt beizutragen!

---

## 🚀 Entwicklungsumgebung einrichten

### 1. Repository forken & klonen

```bash
# Fork auf GitHub erstellen
# Dann klonen:
git clone https://github.com/dein-username/fmsv-dingden.git
cd fmsv-dingden
```

### 2. Setup ausführen

```bash
# Windows:
setup-dev.bat

# Linux/macOS:
chmod +x setup-dev.sh
./setup-dev.sh
```

### 3. Upstream hinzufügen

```bash
git remote add upstream https://github.com/original-owner/fmsv-dingden.git
```

---

## 📝 Entwicklungs-Workflow

### 1. Neuen Feature-Branch erstellen

```bash
# Aktuellsten Stand holen
git checkout main
git pull upstream main

# Feature-Branch erstellen
git checkout -b feature/mein-feature

# Oder für Bugfix:
git checkout -b fix/bug-beschreibung
```

### 2. Entwickeln & Testen

```bash
# Backend starten
cd backend
npm run dev

# Frontend starten (neues Terminal)
npm run dev

# Tests ausführen
npm test
```

### 3. Committen

Wir nutzen [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Beispiele:
git commit -m "feat: Neue Flugbuch-Export-Funktion"
git commit -m "fix: Login-Fehler bei 2FA behoben"
git commit -m "docs: Installation-Anleitung aktualisiert"
git commit -m "style: Code-Formatierung verbessert"
git commit -m "refactor: API-Client umstrukturiert"
git commit -m "test: Unit-Tests für Auth hinzugefügt"
```

**Commit-Typen:**
- `feat:` Neues Feature
- `fix:` Bugfix
- `docs:` Dokumentation
- `style:` Code-Style (kein funktionaler Change)
- `refactor:` Code-Refactoring
- `test:` Tests
- `chore:` Build/Config Changes

### 4. Push & Pull Request

```bash
# Branch pushen
git push origin feature/mein-feature

# Dann auf GitHub:
# Pull Request erstellen zu main Branch
```

---

## 🎯 Code-Standards

### TypeScript

```typescript
// ✅ Gut
interface User {
  id: number;
  email: string;
  name: string;
}

const getUser = async (id: number): Promise<User> => {
  // ...
};

// ❌ Schlecht
const getUser = (id) => {
  // Kein Type
};
```

### React Components

```tsx
// ✅ Gut - Functional Component mit Props Interface
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  disabled = false 
}) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
};

// ❌ Schlecht - Keine Props Types
export const Button = (props) => {
  return <button>{props.label}</button>;
};
```

### Tailwind CSS

```tsx
// ✅ Gut - Semantische Klassen
<div className="flex items-center justify-between p-4 bg-card rounded-lg">
  <h2>Titel</h2>
</div>

// ❌ Schlecht - Inline Styles vermeiden
<div style={{ display: 'flex', padding: '16px' }}>
  <h2>Titel</h2>
</div>
```

### Backend API

```javascript
// ✅ Gut - Async/Await, Error Handling
router.post('/api/users', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    // Validation
    if (!email || !name) {
      return res.status(400).json({ 
        error: 'Email und Name erforderlich' 
      });
    }
    
    const user = await createUser({ email, name });
    res.status(201).json(user);
    
  } catch (error) {
    logger.error('User creation failed:', error);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

// ❌ Schlecht - Callbacks, kein Error Handling
router.post('/api/users', (req, res) => {
  createUser(req.body, (err, user) => {
    res.json(user);
  });
});
```

---

## ✅ Checkliste vor Pull Request

- [ ] Code formatiert mit Prettier
- [ ] ESLint zeigt keine Fehler
- [ ] TypeScript kompiliert ohne Fehler
- [ ] Alle Tests laufen durch
- [ ] Neue Features sind dokumentiert
- [ ] `backend/.env` nicht committed
- [ ] Keine `console.log()` im Production Code
- [ ] Commit Messages folgen Conventional Commits
- [ ] Branch ist up-to-date mit `main`

```bash
# Prüfungen ausführen:
npm run lint
npm run build
cd backend && npm test
```

---

## 🐛 Bugs melden

### Issue erstellen auf GitHub

**Titel:** Kurze Beschreibung des Problems

**Beschreibung:**

```markdown
## Problem
Was ist das Problem?

## Erwartetes Verhalten
Was sollte passieren?

## Aktuelles Verhalten
Was passiert stattdessen?

## Schritte zum Reproduzieren
1. Gehe zu ...
2. Klicke auf ...
3. Siehe Fehler

## Screenshots
Falls zutreffend

## Environment
- OS: [z.B. Windows 11]
- Browser: [z.B. Chrome 120]
- Version: [z.B. 1.0.0]
```

---

## 💡 Feature vorschlagen

### Issue erstellen mit Label "enhancement"

```markdown
## Feature-Beschreibung
Was soll das Feature tun?

## Motivation
Warum ist das Feature nützlich?

## Vorgeschlagene Lösung
Wie könnte es implementiert werden?

## Alternativen
Welche Alternativen gibt es?
```

---

## 📚 Dokumentation

### Code dokumentieren

```typescript
/**
 * Erstellt einen neuen Benutzer in der Datenbank
 * 
 * @param email - E-Mail-Adresse des Benutzers
 * @param name - Name des Benutzers
 * @returns Promise mit dem erstellten Benutzer
 * @throws Error wenn E-Mail bereits existiert
 */
async function createUser(
  email: string, 
  name: string
): Promise<User> {
  // ...
}
```

### README aktualisieren

Bei neuen Features die entsprechenden README-Dateien aktualisieren:

- `/README.md` - Hauptdokumentation
- `/DEV-SETUP.md` - Entwicklungsumgebung
- `/backend/API-Dokumentation.md` - API-Änderungen
- `/Installation/README.md` - Installation

---

## 🧪 Tests

### Frontend Tests (geplant)

```typescript
// Beispiel mit Vitest
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders button with label', () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### Backend Tests (geplant)

```javascript
// Beispiel mit Jest
describe('POST /api/auth/login', () => {
  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
      
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
});
```

---

## 🔒 Security

### Sicherheitslücken melden

**NICHT als öffentliches Issue melden!**

Stattdessen:
1. E-Mail an: security@fmsv-dingden.de
2. Oder GitHub Security Advisory

### Security Best Practices

- ✅ Niemals `.env` Dateien committen
- ✅ Keine API-Keys oder Passwörter im Code
- ✅ Input-Validation auf Backend UND Frontend
- ✅ SQL-Injection vermeiden (Prepared Statements)
- ✅ XSS vermeiden (Input Sanitization)
- ✅ CSRF-Protection nutzen
- ✅ Rate Limiting für APIs

---

## 📖 Weitere Ressourcen

| Thema | Link |
|-------|------|
| **Development Setup** | [`DEV-SETUP.md`](DEV-SETUP.md) |
| **API Dokumentation** | [`backend/API-Dokumentation.md`](backend/API-Dokumentation.md) |
| **Projekt-Struktur** | [`PROJEKT-STRUKTUR.md`](PROJEKT-STRUKTUR.md) |
| **Quick Commands** | [`QUICK-COMMANDS.md`](QUICK-COMMANDS.md) |

---

## 🤝 Code Review

Pull Requests werden von Maintainern reviewed:

- Code-Qualität
- Tests
- Dokumentation
- Sicherheit
- Performance

**Sei geduldig!** Reviews können einige Tage dauern.

---

## 📜 Lizenz

Durch Beitragen zum Projekt stimmst du zu, dass dein Code unter der MIT Lizenz veröffentlicht wird.

---

## 🙏 Danke!

Jeder Beitrag hilft, FMSV Dingden besser zu machen!

Bei Fragen:
- GitHub Issues
- GitHub Discussions
- E-Mail: dev@fmsv-dingden.de

**Happy Coding!** 🚀
