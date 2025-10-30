import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { X } from 'lucide-react';

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowConsent(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowConsent(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <Card className="mx-auto max-w-4xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-2">
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="mb-2">Cookie-Hinweis</h3>
              <p className="text-muted-foreground mb-4">
                Wir verwenden ausschließlich technisch notwendige Cookies, um dir eine sichere Nutzung 
                unserer Website zu ermöglichen. Diese Cookies sind für die Authentifizierung und 
                grundlegende Funktionen erforderlich. Wir setzen keine Tracking- oder Marketing-Cookies ein.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={acceptCookies} size="sm">
                  Akzeptieren
                </Button>
                <Button onClick={declineCookies} variant="outline" size="sm">
                  Ablehnen
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={declineCookies}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
