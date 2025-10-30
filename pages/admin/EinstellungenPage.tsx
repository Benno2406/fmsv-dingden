import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Slider } from "../../components/ui/slider";
import { 
  Settings, 
  Mail, 
  Bell, 
  Shield,
  Users,
  Database,
  Globe,
  Save,
  Palette,
  RotateCcw,
  Sun,
  Moon
} from "lucide-react";

interface ColorConfig {
  base: string;
  foreground: string;
  lightOpacity: number;
  lightForeground: string;
}

interface ThemeColors {
  flugleiter: ColorConfig;
  pilot: ColorConfig;
  training: ColorConfig;
  guest: ColorConfig;
  member: ColorConfig;
  warning: ColorConfig;
  statusActive: ColorConfig;
  statusInactive: ColorConfig;
  success: ColorConfig;
  error: ColorConfig;
}

export function EinstellungenPage() {
  const [colorMode, setColorMode] = useState<"light" | "dark">("light");
  
  // Default Light Mode Colors
  const [lightColors, setLightColors] = useState<ThemeColors>({
    flugleiter: {
      base: "#3b82f6",
      foreground: "#ffffff",
      lightOpacity: 10,
      lightForeground: "#1e3a8a"
    },
    pilot: {
      base: "#06b6d4",
      foreground: "#0f172a",
      lightOpacity: 10,
      lightForeground: "#0e7490"
    },
    training: {
      base: "#a855f7",
      foreground: "#ffffff",
      lightOpacity: 10,
      lightForeground: "#6b21a8"
    },
    guest: {
      base: "#f97316",
      foreground: "#0f172a",
      lightOpacity: 10,
      lightForeground: "#c2410c"
    },
    member: {
      base: "#6366f1",
      foreground: "#ffffff",
      lightOpacity: 10,
      lightForeground: "#4338ca"
    },
    warning: {
      base: "#f59e0b",
      foreground: "#0f172a",
      lightOpacity: 10,
      lightForeground: "#b45309"
    },
    statusActive: {
      base: "#10b981",
      foreground: "#ffffff",
      lightOpacity: 10,
      lightForeground: "#047857"
    },
    statusInactive: {
      base: "#6b7280",
      foreground: "#ffffff",
      lightOpacity: 10,
      lightForeground: "#374151"
    },
    success: {
      base: "#10b981",
      foreground: "#ffffff",
      lightOpacity: 10,
      lightForeground: "#047857"
    },
    error: {
      base: "#ef4444",
      foreground: "#ffffff",
      lightOpacity: 10,
      lightForeground: "#991b1b"
    }
  });

  // Default Dark Mode Colors
  const [darkColors, setDarkColors] = useState<ThemeColors>({
    flugleiter: {
      base: "#60a5fa",
      foreground: "#0f172a",
      lightOpacity: 20,
      lightForeground: "#93c5fd"
    },
    pilot: {
      base: "#22d3ee",
      foreground: "#0f172a",
      lightOpacity: 20,
      lightForeground: "#67e8f9"
    },
    training: {
      base: "#c084fc",
      foreground: "#0f172a",
      lightOpacity: 20,
      lightForeground: "#d8b4fe"
    },
    guest: {
      base: "#fb923c",
      foreground: "#0f172a",
      lightOpacity: 20,
      lightForeground: "#fdba74"
    },
    member: {
      base: "#818cf8",
      foreground: "#0f172a",
      lightOpacity: 20,
      lightForeground: "#a5b4fc"
    },
    warning: {
      base: "#fbbf24",
      foreground: "#0f172a",
      lightOpacity: 20,
      lightForeground: "#fcd34d"
    },
    statusActive: {
      base: "#34d399",
      foreground: "#0f172a",
      lightOpacity: 20,
      lightForeground: "#6ee7b7"
    },
    statusInactive: {
      base: "#9ca3af",
      foreground: "#f9fafb",
      lightOpacity: 20,
      lightForeground: "#d1d5db"
    },
    success: {
      base: "#34d399",
      foreground: "#0f172a",
      lightOpacity: 20,
      lightForeground: "#6ee7b7"
    },
    error: {
      base: "#f87171",
      foreground: "#0f172a",
      lightOpacity: 20,
      lightForeground: "#fca5a5"
    }
  });

  const updateLightColor = (key: keyof ThemeColors, field: keyof ColorConfig, value: string | number) => {
    setLightColors(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const updateDarkColor = (key: keyof ThemeColors, field: keyof ColorConfig, value: string | number) => {
    setDarkColors(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const ColorEditor = ({ 
    label, 
    description, 
    colorKey,
    mode 
  }: { 
    label: string; 
    description: string; 
    colorKey: keyof ThemeColors;
    mode: "light" | "dark";
  }) => {
    const colors = mode === "light" ? lightColors : darkColors;
    const updateColor = mode === "light" ? updateLightColor : updateDarkColor;
    const config = colors[colorKey];

    return (
      <div className="space-y-4 p-4 rounded-lg border">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>{label}</Label>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div className="flex gap-2 items-center">
            <Badge className={`bg-${colorKey} text-${colorKey}-foreground`}>{label}</Badge>
            <Badge variant="outline" className={`bg-${colorKey}-light text-${colorKey}-light-foreground`}>
              Light
            </Badge>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Hauptfarbe */}
          <div className="space-y-2">
            <Label className="text-xs">Hauptfarbe</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={config.base}
                onChange={(e) => updateColor(colorKey, "base", e.target.value)}
                className="w-16 h-10"
              />
              <Input
                type="text"
                value={config.base}
                onChange={(e) => updateColor(colorKey, "base", e.target.value)}
                className="flex-1 font-mono text-xs"
              />
            </div>
          </div>

          {/* Textfarbe auf Hauptfarbe */}
          <div className="space-y-2">
            <Label className="text-xs">Textfarbe (auf Hauptfarbe)</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={config.foreground}
                onChange={(e) => updateColor(colorKey, "foreground", e.target.value)}
                className="w-16 h-10"
              />
              <Input
                type="text"
                value={config.foreground}
                onChange={(e) => updateColor(colorKey, "foreground", e.target.value)}
                className="flex-1 font-mono text-xs"
              />
            </div>
          </div>

          {/* Hintergrund-Opacity */}
          <div className="space-y-2">
            <Label className="text-xs">Hintergrund-Sichtbarkeit: {config.lightOpacity}%</Label>
            <Slider
              value={[config.lightOpacity]}
              onValueChange={(value) => updateColor(colorKey, "lightOpacity", value[0])}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex gap-2 text-xs text-muted-foreground">
              <span>0%</span>
              <span className="ml-auto">100%</span>
            </div>
          </div>

          {/* Textfarbe auf hellem Hintergrund */}
          <div className="space-y-2">
            <Label className="text-xs">Textfarbe (auf hellem Hintergrund)</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={config.lightForeground}
                onChange={(e) => updateColor(colorKey, "lightForeground", e.target.value)}
                className="w-16 h-10"
              />
              <Input
                type="text"
                value={config.lightForeground}
                onChange={(e) => updateColor(colorKey, "lightForeground", e.target.value)}
                className="flex-1 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="pt-2 border-t">
          <Label className="text-xs mb-2 block">Vorschau</Label>
          <div className="grid grid-cols-2 gap-2">
            <div 
              style={{ backgroundColor: config.base, color: config.foreground }}
              className="p-3 rounded text-center text-sm"
            >
              Button-Vorschau
            </div>
            <div 
              style={{ 
                backgroundColor: `${config.base}${Math.round(config.lightOpacity * 2.55).toString(16).padStart(2, '0')}`,
                color: config.lightForeground 
              }}
              className="p-3 rounded text-center text-sm"
            >
              Panel-Vorschau
            </div>
          </div>
        </div>
      </div>
    );
  };
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2">Einstellungen</h2>
        <p className="text-muted-foreground">
          Konfiguriere die Vereinsverwaltung und Systemeinstellungen.
        </p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Allgemeine Einstellungen
          </CardTitle>
          <CardDescription>
            Grundlegende Informationen über den Verein
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="clubName">Vereinsname</Label>
              <Input id="clubName" defaultValue="Flugmodellsportverein Dingden" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clubEmail">Vereins-E-Mail</Label>
              <Input id="clubEmail" type="email" defaultValue="info@fmsv-dingden.de" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="clubAddress">Adresse</Label>
            <Input id="clubAddress" defaultValue="Fluggelände Dingden, 46499 Hamminkeln" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clubDescription">Vereinsbeschreibung</Label>
            <Textarea 
              id="clubDescription" 
              rows={3}
              defaultValue="Wir sind ein aktiver Flugmodellsportverein in Dingden mit über 80 Mitgliedern..."
            />
          </div>
          <div className="flex justify-end pt-4">
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              Speichern
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            E-Mail-Einstellungen
          </CardTitle>
          <CardDescription>
            Konfiguriere den E-Mail-Versand
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="smtpHost">SMTP Server</Label>
              <Input id="smtpHost" placeholder="smtp.example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPort">SMTP Port</Label>
              <Input id="smtpPort" type="number" placeholder="587" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="smtpUser">SMTP Benutzername</Label>
              <Input id="smtpUser" placeholder="mail@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPassword">SMTP Passwort</Label>
              <Input id="smtpPassword" type="password" placeholder="••••••••" />
            </div>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="space-y-0.5">
              <Label>Test-E-Mail senden</Label>
              <p className="text-sm text-muted-foreground">
                Teste die E-Mail-Konfiguration
              </p>
            </div>
            <Button variant="outline">Test senden</Button>
          </div>
          <div className="flex justify-end pt-4">
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              Speichern
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Benachrichtigungen
          </CardTitle>
          <CardDescription>
            Lege fest, wann Benachrichtigungen gesendet werden
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border">
            <div className="space-y-0.5">
              <Label>Neue Mitgliedsanträge</Label>
              <p className="text-sm text-muted-foreground">
                Benachrichtigung bei neuen Anträgen
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border">
            <div className="space-y-0.5">
              <Label>Neue Presseberichte</Label>
              <p className="text-sm text-muted-foreground">
                Benachrichtigung bei eingereichten Artikeln
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border">
            <div className="space-y-0.5">
              <Label>Neue Bilder</Label>
              <p className="text-sm text-muted-foreground">
                Benachrichtigung bei hochgeladenen Bildern
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border">
            <div className="space-y-0.5">
              <Label>Ablaufende Kenntnisnachweise</Label>
              <p className="text-sm text-muted-foreground">
                30 Tage vor Ablauf benachrichtigen
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex justify-end pt-4">
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              Speichern
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Datenschutz & Sicherheit
          </CardTitle>
          <CardDescription>
            Verwalte Datenschutzeinstellungen und Sicherheit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border">
            <div className="space-y-0.5">
              <Label>Mitgliederdaten öffentlich</Label>
              <p className="text-sm text-muted-foreground">
                Namen im öffentlichen Bereich anzeigen
              </p>
            </div>
            <Switch />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border">
            <div className="space-y-0.5">
              <Label>E-Mail-Adressen sichtbar</Label>
              <p className="text-sm text-muted-foreground">
                E-Mails für andere Mitglieder sichtbar machen
              </p>
            </div>
            <Switch />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border">
            <div className="space-y-0.5">
              <Label>Zwei-Faktor-Authentifizierung</Label>
              <p className="text-sm text-muted-foreground">
                Zusätzliche Sicherheit für Admin-Zugriff
              </p>
            </div>
            <Switch />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border">
            <div className="space-y-0.5">
              <Label>Automatisches Logout</Label>
              <p className="text-sm text-muted-foreground">
                Nach 30 Minuten Inaktivität
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex justify-end pt-4">
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              Speichern
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Benutzerverwaltung
          </CardTitle>
          <CardDescription>
            Berechtigungen und Rollen konfigurieren
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border">
            <div className="space-y-0.5">
              <Label>Selbstregistrierung erlauben</Label>
              <p className="text-sm text-muted-foreground">
                Neue Mitglieder können sich selbst registrieren
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border">
            <div className="space-y-0.5">
              <Label>E-Mail-Bestätigung erforderlich</Label>
              <p className="text-sm text-muted-foreground">
                Neue Konten müssen E-Mail bestätigen
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border">
            <div className="space-y-0.5">
              <Label>Admin-Freigabe erforderlich</Label>
              <p className="text-sm text-muted-foreground">
                Neue Konten müssen manuell freigegeben werden
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex justify-end pt-4">
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              Speichern
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System
          </CardTitle>
          <CardDescription>
            Systemeinstellungen und Wartung
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border">
            <div className="space-y-0.5">
              <Label>Automatische Backups</Label>
              <p className="text-sm text-muted-foreground">
                Tägliche Sicherung der Datenbank
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border">
            <div className="space-y-0.5">
              <Label>Wartungsmodus</Label>
              <p className="text-sm text-muted-foreground">
                Website für Wartungsarbeiten deaktivieren
              </p>
            </div>
            <Switch />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 pt-4">
            <Button variant="outline" className="gap-2">
              <Database className="h-4 w-4" />
              Backup erstellen
            </Button>
            <Button variant="outline" className="gap-2">
              <Globe className="h-4 w-4" />
              Cache leeren
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Color System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Farbsystem
          </CardTitle>
          <CardDescription>
            Semantische Farben für Rollen und Status anpassen - getrennt für Light und Dark Mode
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={colorMode} onValueChange={(v) => setColorMode(v as "light" | "dark")}>
            <div className="flex items-center justify-between">
              <TabsList className="grid w-[240px] grid-cols-2">
                <TabsTrigger value="light" className="gap-2">
                  <Sun className="h-4 w-4" />
                  Light Mode
                </TabsTrigger>
                <TabsTrigger value="dark" className="gap-2">
                  <Moon className="h-4 w-4" />
                  Dark Mode
                </TabsTrigger>
              </TabsList>
              <Button variant="ghost" size="sm" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Zurücksetzen
              </Button>
            </div>

            {/* Light Mode Colors */}
            <TabsContent value="light" className="space-y-4 mt-6">
              <div className="space-y-1 pb-2 border-b">
                <h4 className="text-sm font-medium">Rollen & Funktionen</h4>
                <p className="text-xs text-muted-foreground">
                  Farben für verschiedene Benutzerrollen im Light Mode
                </p>
              </div>

              <ColorEditor
                label="Flugleiter"
                description="Für Flugbetriebsleiter"
                colorKey="flugleiter"
                mode="light"
              />

              <ColorEditor
                label="Piloten"
                description="Standard-Piloten"
                colorKey="pilot"
                mode="light"
              />

              <ColorEditor
                label="Schulung/Lehrer"
                description="Fluglehrer und Schulungsbetrieb"
                colorKey="training"
                mode="light"
              />

              <ColorEditor
                label="Gastflieger"
                description="Gäste ohne Mitgliedschaft"
                colorKey="guest"
                mode="light"
              />

              <ColorEditor
                label="Mitglied"
                description="Normale Vereinsmitglieder"
                colorKey="member"
                mode="light"
              />

              <div className="space-y-1 pt-4 pb-2 border-b">
                <h4 className="text-sm font-medium">Status & Hinweise</h4>
                <p className="text-xs text-muted-foreground">
                  Farben für Statusanzeigen und Benachrichtigungen
                </p>
              </div>

              <ColorEditor
                label="Vorfälle/Warnungen"
                description="Wichtige Hinweise"
                colorKey="warning"
                mode="light"
              />

              <ColorEditor
                label="Status Aktiv"
                description="Aktive Mitglieder/Systeme"
                colorKey="statusActive"
                mode="light"
              />

              <ColorEditor
                label="Status Inaktiv"
                description="Inaktive Mitglieder/Systeme"
                colorKey="statusInactive"
                mode="light"
              />

              <ColorEditor
                label="Erfolg"
                description="Erfolgreiche Aktionen"
                colorKey="success"
                mode="light"
              />

              <ColorEditor
                label="Fehler"
                description="Fehlermeldungen"
                colorKey="error"
                mode="light"
              />
            </TabsContent>

            {/* Dark Mode Colors */}
            <TabsContent value="dark" className="space-y-4 mt-6">
              <div className="space-y-1 pb-2 border-b">
                <h4 className="text-sm font-medium">Rollen & Funktionen</h4>
                <p className="text-xs text-muted-foreground">
                  Farben für verschiedene Benutzerrollen im Dark Mode
                </p>
              </div>

              <ColorEditor
                label="Flugleiter"
                description="Für Flugbetriebsleiter"
                colorKey="flugleiter"
                mode="dark"
              />

              <ColorEditor
                label="Piloten"
                description="Standard-Piloten"
                colorKey="pilot"
                mode="dark"
              />

              <ColorEditor
                label="Schulung/Lehrer"
                description="Fluglehrer und Schulungsbetrieb"
                colorKey="training"
                mode="dark"
              />

              <ColorEditor
                label="Gastflieger"
                description="Gäste ohne Mitgliedschaft"
                colorKey="guest"
                mode="dark"
              />

              <ColorEditor
                label="Mitglied"
                description="Normale Vereinsmitglieder"
                colorKey="member"
                mode="dark"
              />

              <div className="space-y-1 pt-4 pb-2 border-b">
                <h4 className="text-sm font-medium">Status & Hinweise</h4>
                <p className="text-xs text-muted-foreground">
                  Farben für Statusanzeigen und Benachrichtigungen
                </p>
              </div>

              <ColorEditor
                label="Vorfälle/Warnungen"
                description="Wichtige Hinweise"
                colorKey="warning"
                mode="dark"
              />

              <ColorEditor
                label="Status Aktiv"
                description="Aktive Mitglieder/Systeme"
                colorKey="statusActive"
                mode="dark"
              />

              <ColorEditor
                label="Status Inaktiv"
                description="Inaktive Mitglieder/Systeme"
                colorKey="statusInactive"
                mode="dark"
              />

              <ColorEditor
                label="Erfolg"
                description="Erfolgreiche Aktionen"
                colorKey="success"
                mode="dark"
              />

              <ColorEditor
                label="Fehler"
                description="Fehlermeldungen"
                colorKey="error"
                mode="dark"
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Alle Änderungen können in Echtzeit vorgeschaut werden
            </p>
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              Speichern
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
