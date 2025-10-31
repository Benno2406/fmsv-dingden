import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Lock, Mail, Loader2 } from "lucide-react";
import { handleApiError } from "../lib/api-client";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      await login(email, password);
      // Nach erfolgreichem Login zur Mitgliederbereich-Übersicht
      navigate("/mitgliederbereich");
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center bg-muted/30 py-12">
      <div className="container mx-auto px-4 md:px-6">
        <Card className="max-w-md mx-auto">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-center">Mitgliederbereich</CardTitle>
            <CardDescription className="text-center">
              Melde dich mit deinen Zugangsdaten an
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="deine.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Dein Passwort"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Anmeldung läuft...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Anmelden
                  </>
                )}
              </Button>

              <div className="text-center">
                <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                  Noch kein Zugang? Wende dich an den Vorstand.
                </p>
              </div>

              {/* Test-Daten Hinweis (nur Dev) */}
              {import.meta.env?.DEV && (
                <div className="space-y-3">
                  <Alert className="border-blue-200 bg-blue-50">
                    <AlertDescription>
                      <strong>🔧 Backend-Login (lokal):</strong><br />
                      <span className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                        Admin: admin@fmsv-dingden.de / Test123!<br />
                        Vorstand: vorstand@fmsv-dingden.de / Test123!<br />
                        Mitglied: mitglied@fmsv-dingden.de / Test123!
                      </span>
                    </AlertDescription>
                  </Alert>

                  <Alert className="border-green-200 bg-green-50">
                    <AlertDescription>
                      <strong>💻 Dev-Mode (ohne Backend):</strong><br />
                      <span className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                        Beliebiges Passwort + eine dieser E-Mails:<br />
                        dev@admin (Admin-Rechte)<br />
                        dev@vorstand (Vorstands-Rechte)<br />
                        dev@mitglied (Mitglieder-Rechte)
                      </span>
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
