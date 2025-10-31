import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Checkbox } from "../../components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Separator } from "../../components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  CreditCard,
  CheckCircle2,
  Edit,
  Camera,
  Eye,
  EyeOff,
  Lock,
  AlertCircle,
  Bell,
  UserCircle,
  Cake,
  Plus,
  X,
  Building2,
  XCircle,
  Activity
} from "lucide-react";
import { toast } from "sonner";

// Funktion zur Berechnung des Alters
function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

// Funktion zur Formatierung des Datums (DD.MM.YYYY)
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

export function ProfilPage() {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [showInMemberList, setShowInMemberList] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [notifyNews, setNotifyNews] = useState(true);
  const [notifyEvents, setNotifyEvents] = useState(true);
  const [notifyOwnActivities, setNotifyOwnActivities] = useState(true);

  // Form states für Bearbeiten-Dialog
  const [formData, setFormData] = useState({
    name: "Max Mustermann",
    email: "max.mustermann@email.de",
    phone: "0172 1234567",
    birthDate: "1990-05-15", // ISO Format für Input type="date"
    street: "Musterstraße 123",
    city: "46499 Hamminkeln-Dingden",
    parent1Name: "",
    parent1Relation: "",
    parent1Email: "",
    parent1Phone: "",
    parent2Name: "",
    parent2Relation: "",
    parent2Email: "",
    parent2Phone: ""
  });

  // Bankdaten states
  const [bankData, setBankData] = useState({
    accountHolder: "Max Mustermann",
    bankName: "Sparkasse Hamminkeln",
    iban: "DE89 3704 0044 0532 0130 00",
    bic: "COBADEFFXXX"
  });

  // SEPA-Lastschrift State
  const [sepaMandate, setSepaMandate] = useState(true);

  // State für zweiten Elternkontakt
  const [showSecondParent, setShowSecondParent] = useState(false);

  // Berechne Alter und ob Jugendmitglied (< 18 Jahre)
  const age = useMemo(() => calculateAge(formData.birthDate), [formData.birthDate]);
  const isYouthMember = age < 18;

  // Password Dialog States
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const handleSaveProfile = () => {
    // Hier würde die API-Integration erfolgen
    toast.success("Profil erfolgreich aktualisiert!");
    setEditDialogOpen(false);
  };

  const handleChangePassword = () => {
    if (passwordData.new !== passwordData.confirm) {
      toast.error("Die Passwörter stimmen nicht überein!");
      return;
    }
    if (passwordData.new.length < 8) {
      toast.error("Das Passwort muss mindestens 8 Zeichen lang sein!");
      return;
    }
    // Hier würde die API-Integration erfolgen
    toast.success("Passwort erfolgreich geändert!");
    setPasswordDialogOpen(false);
    setPasswordData({ current: "", new: "", confirm: "" });
  };

  const handlePrivacyChange = (field: 'memberList' | 'email' | 'phone', value: boolean) => {
    if (field === 'memberList') {
      setShowInMemberList(value);
      toast.success(value 
        ? "Du bist jetzt in der Mitgliederliste sichtbar" 
        : "Du bist jetzt in der Mitgliederliste verborgen"
      );
    } else if (field === 'email') {
      setShowEmail(value);
      toast.success(value 
        ? "Deine E-Mail-Adresse ist jetzt für andere Mitglieder sichtbar" 
        : "Deine E-Mail-Adresse ist jetzt verborgen"
      );
    } else {
      setShowPhone(value);
      toast.success(value 
        ? "Deine Telefonnummer ist jetzt für andere Mitglieder sichtbar" 
        : "Deine Telefonnummer ist jetzt verborgen"
      );
    }
  };

  const handleNotificationChange = (field: 'main' | 'news' | 'events' | 'activities', value: boolean) => {
    if (field === 'main') {
      setEmailNotifications(value);
      if (!value) {
        // Wenn Haupt-Switch deaktiviert wird, alle Unter-Switches auch deaktivieren
        setNotifyNews(false);
        setNotifyEvents(false);
        setNotifyOwnActivities(false);
      }
      toast.success(value 
        ? "E-Mail-Benachrichtigungen aktiviert" 
        : "E-Mail-Benachrichtigungen deaktiviert"
      );
    } else if (field === 'news') {
      setNotifyNews(value);
      toast.success(value 
        ? "Vereinsnachrichten-Benachrichtigungen aktiviert" 
        : "Vereinsnachrichten-Benachrichtigungen deaktiviert"
      );
    } else if (field === 'events') {
      setNotifyEvents(value);
      toast.success(value 
        ? "Termin-Benachrichtigungen aktiviert" 
        : "Termin-Benachrichtigungen deaktiviert"
      );
    } else {
      setNotifyOwnActivities(value);
      toast.success(value 
        ? "Benachrichtigungen über eigene Aktivitäten aktiviert" 
        : "Benachrichtigungen über eigene Aktivitäten deaktiviert"
      );
    }
  };

  const handleBankDataSave = () => {
    toast.success("Bankdaten erfolgreich aktualisiert");
    setBankDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2">Mein Profil</h2>
        <p className="text-muted-foreground">
          Verwalte deine persönlichen Daten und Einstellungen.
        </p>
      </div>

      {/* Profilübersicht */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5" />
            Persönliche Informationen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6 mb-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="h-12 w-12 text-primary" />
              </div>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md"
                onClick={() => toast.info("Profilbild-Upload noch nicht implementiert")}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <h3 className="mb-1">{formData.name}</h3>
              <p className="text-muted-foreground mb-3">Mitgliedsnummer: FMSV-0031</p>
              <div className="flex gap-2">
                <Badge>{isYouthMember ? "Jugendmitglied" : "Aktives Mitglied"}</Badge>
                {isYouthMember && (
                  <Badge variant="secondary">{age} Jahre</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                    E-Mail
                  </p>
                </div>
                <p>{formData.email}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                    Telefon
                  </p>
                </div>
                <p>{formData.phone}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                    Adresse
                  </p>
                </div>
                <p>{formData.street}</p>
                <p>{formData.city}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Cake className="h-4 w-4 text-muted-foreground" />
                  <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                    Geburtsdatum
                  </p>
                </div>
                <p>{formatDate(formData.birthDate)} ({age} Jahre)</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                    Mitglied seit
                  </p>
                </div>
                <p>05. April 2020</p>
              </div>
            </div>
          </div>

          {/* Elternkontakt bei Jugendmitgliedern */}
          {isYouthMember && (formData.parent1Name || formData.parent2Name) && (
            <>
              <Separator className="my-6" />
              
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <h4>Elternkontakt</h4>
                </div>
                
                <div className="grid gap-6 sm:grid-cols-2">
                  {formData.parent1Name && (
                    <div>
                      <p className="text-muted-foreground mb-3" style={{ fontSize: '0.875rem' }}>
                        {formData.parent1Relation || "Erziehungsberechtigter"}
                      </p>
                      <p className="mb-1">{formData.parent1Name}</p>
                      {formData.parent1Email && (
                        <p className="text-muted-foreground mb-1" style={{ fontSize: '0.875rem' }}>
                          <Mail className="h-3 w-3 inline mr-1" />
                          {formData.parent1Email}
                        </p>
                      )}
                      <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                        <Phone className="h-3 w-3 inline mr-1" />
                        {formData.parent1Phone}
                      </p>
                    </div>
                  )}
                  
                  {formData.parent2Name && (
                    <div>
                      <p className="text-muted-foreground mb-3" style={{ fontSize: '0.875rem' }}>
                        {formData.parent2Relation || "Erziehungsberechtigter"}
                      </p>
                      <p className="mb-1">{formData.parent2Name}</p>
                      {formData.parent2Email && (
                        <p className="text-muted-foreground mb-1" style={{ fontSize: '0.875rem' }}>
                          <Mail className="h-3 w-3 inline mr-1" />
                          {formData.parent2Email}
                        </p>
                      )}
                      <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                        <Phone className="h-3 w-3 inline mr-1" />
                        {formData.parent2Phone}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="mt-6 pt-6 border-t">
            <Button className="gap-2" onClick={() => setEditDialogOpen(true)}>
              <Edit className="h-4 w-4" />
              Profil bearbeiten
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sicherheit */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sicherheit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="mb-2">Passwort</p>
              <p className="text-muted-foreground mb-4" style={{ fontSize: '0.875rem' }}>
                Zuletzt geändert am 10. Januar 2025
              </p>
              <Button variant="outline" className="gap-2" onClick={() => setPasswordDialogOpen(true)}>
                <Lock className="h-4 w-4" />
                Passwort ändern
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bankdaten */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Bankdaten
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground mb-1" style={{ fontSize: '0.875rem' }}>
                  Kontoinhaber
                </p>
                <p>{bankData.accountHolder}</p>
              </div>
              
              <div>
                <p className="text-muted-foreground mb-1" style={{ fontSize: '0.875rem' }}>
                  Bank
                </p>
                <p>{bankData.bankName}</p>
              </div>
              
              <div>
                <p className="text-muted-foreground mb-1" style={{ fontSize: '0.875rem' }}>
                  IBAN
                </p>
                <p className="font-mono" style={{ fontSize: '0.875rem' }}>{bankData.iban}</p>
              </div>
              
              <div>
                <p className="text-muted-foreground mb-1" style={{ fontSize: '0.875rem' }}>
                  BIC
                </p>
                <p className="font-mono" style={{ fontSize: '0.875rem' }}>{bankData.bic}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" className="gap-2" onClick={() => setBankDialogOpen(true)}>
                <Edit className="h-4 w-4" />
                Bankdaten ändern
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy-Einstellungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Datenschutz & Sichtbarkeit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Steuere, welche Kontaktdaten für andere Vereinsmitglieder in der Mitgliederliste sichtbar sind.
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            {/* Grundsätzliche Sichtbarkeit in Mitgliederliste */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <UserCircle className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="show-in-member-list" className="cursor-pointer">In Mitgliederliste anzeigen</Label>
                </div>
                <p className="text-muted-foreground ml-6" style={{ fontSize: '0.875rem' }}>
                  Wenn deaktiviert, bist du für andere Mitglieder in der Mitgliederliste nicht sichtbar. 
                  <span className="line-through opacity-60">(Der Name taucht trotzdem im Digitalen Flugbuch am Fluggelände auf. In der Übersicht am Platz erscheinst du lediglich als anonymer Pilot.)</span>
                </p>
              </div>
              <Switch
                id="show-in-member-list"
                checked={showInMemberList}
                onCheckedChange={(checked) => handlePrivacyChange('memberList', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="show-email" className="cursor-pointer">E-Mail-Adresse anzeigen</Label>
                </div>
                <p className="text-muted-foreground ml-6" style={{ fontSize: '0.875rem' }}>
                  Andere Mitglieder können deine E-Mail-Adresse sehen und dich direkt kontaktieren
                </p>
              </div>
              <Switch
                id="show-email"
                checked={showEmail}
                onCheckedChange={(checked) => handlePrivacyChange('email', checked)}
                disabled={!showInMemberList}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="show-phone" className="cursor-pointer">Telefonnummer anzeigen</Label>
                </div>
                <p className="text-muted-foreground ml-6" style={{ fontSize: '0.875rem' }}>
                  Andere Mitglieder können deine Telefonnummer sehen und dich direkt anrufen
                </p>
              </div>
              <Switch
                id="show-phone"
                checked={showPhone}
                onCheckedChange={(checked) => handlePrivacyChange('phone', checked)}
                disabled={!showInMemberList}
              />
            </div>

            <Separator />

            {/* Benachrichtigungen */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="email-notifications" className="cursor-pointer">E-Mail-Benachrichtigungen</Label>
                </div>
                <p className="text-muted-foreground ml-6" style={{ fontSize: '0.875rem' }}>
                  Aktiviere Benachrichtigungen für wichtige Vereinsinformationen per E-Mail
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={(checked) => handleNotificationChange('main', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="notify-news" className="cursor-pointer">Vereinsnachrichten</Label>
                </div>
                <p className="text-muted-foreground ml-6" style={{ fontSize: '0.875rem' }}>
                  Benachrichtigungen über wichtige Vereinsinformationen und Neuigkeiten
                </p>
              </div>
              <Switch
                id="notify-news"
                checked={notifyNews}
                onCheckedChange={(checked) => handleNotificationChange('news', checked)}
                disabled={!emailNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="notify-events" className="cursor-pointer">Termin-Updates</Label>
                </div>
                <p className="text-muted-foreground ml-6" style={{ fontSize: '0.875rem' }}>
                  Benachrichtigungen über neue oder geänderte Termine
                </p>
              </div>
              <Switch
                id="notify-events"
                checked={notifyEvents}
                onCheckedChange={(checked) => handleNotificationChange('events', checked)}
                disabled={!emailNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="notify-activities" className="cursor-pointer">Eigene Aktivitäten</Label>
                </div>
                <p className="text-muted-foreground ml-6" style={{ fontSize: '0.875rem' }}>
                  Benachrichtigungen bei Statusänderungen deiner Presseberichte und hochgeladenen Bilder/Videos
                </p>
              </div>
              <Switch
                id="notify-activities"
                checked={notifyOwnActivities}
                onCheckedChange={(checked) => handleNotificationChange('activities', checked)}
                disabled={!emailNotifications}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bearbeiten-Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Profil bearbeiten</DialogTitle>
            <DialogDescription>
              Aktualisiere deine persönlichen Informationen und Kontaktdaten.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Persönliche Daten */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-muted-foreground" />
                <h4>Persönliche Daten</h4>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Name *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Vor- und Nachname"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-birthdate">Geburtsdatum *</Label>
                  <Input
                    id="edit-birthdate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              {formData.birthDate && (
                <Alert>
                  <Cake className="h-4 w-4" />
                  <AlertDescription>
                    <span>Alter: <strong>{calculateAge(formData.birthDate)} Jahre</strong></span>
                    {calculateAge(formData.birthDate) < 18 && (
                      <span className="ml-2">• Status: <strong>Jugendmitglied</strong></span>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Separator />

            {/* Kontaktdaten */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <h4>Kontaktdaten</h4>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-email">E-Mail-Adresse *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="beispiel@email.de"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-phone">Telefonnummer *</Label>
                  <Input
                    id="edit-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0172 1234567"
                    required
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Adresse */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <h4>Adresse</h4>
              </div>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-street">Straße & Hausnummer *</Label>
                  <Input
                    id="edit-street"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    placeholder="Musterstraße 123"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-city">PLZ & Ort *</Label>
                  <Input
                    id="edit-city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="46499 Hamminkeln-Dingden"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Elternkontakt (nur für Jugendmitglieder < 18 Jahre) */}
            {calculateAge(formData.birthDate) < 18 && (
              <>
                <Separator className="bg-primary/20" />
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <h4>Elternkontakt</h4>
                  </div>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Da du unter 18 Jahre alt bist, benötigen wir mindestens einen Erziehungsberechtigten-Kontakt für Rückfragen und Notfälle.
                    </AlertDescription>
                  </Alert>
                  
                  {/* Erster Elternkontakt (Pflicht) */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <p style={{ fontSize: '0.875rem' }}>Erster Erziehungsberechtigter</p>
                      </div>
                    </div>
                    <div className="grid gap-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                          <Label htmlFor="edit-parent1-name">Name *</Label>
                          <Input
                            id="edit-parent1-name"
                            value={formData.parent1Name}
                            onChange={(e) => setFormData({ ...formData, parent1Name: e.target.value })}
                            placeholder="z.B. Maria Mustermann"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="edit-parent1-relation">Beziehung *</Label>
                          <Select
                            value={formData.parent1Relation}
                            onValueChange={(value) => setFormData({ ...formData, parent1Relation: value })}
                          >
                            <SelectTrigger id="edit-parent1-relation">
                              <SelectValue placeholder="Bitte auswählen" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Mutter">Mutter</SelectItem>
                              <SelectItem value="Vater">Vater</SelectItem>
                              <SelectItem value="Erziehungsberechtigter">Erziehungsberechtigter</SelectItem>
                              <SelectItem value="Vormund">Vormund</SelectItem>
                              <SelectItem value="Sonstiges">Sonstiges</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                          <Label htmlFor="edit-parent1-email">E-Mail-Adresse *</Label>
                          <Input
                            id="edit-parent1-email"
                            type="email"
                            value={formData.parent1Email}
                            onChange={(e) => setFormData({ ...formData, parent1Email: e.target.value })}
                            placeholder="beispiel@email.de"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="edit-parent1-phone">Telefonnummer *</Label>
                          <Input
                            id="edit-parent1-phone"
                            type="tel"
                            value={formData.parent1Phone}
                            onChange={(e) => setFormData({ ...formData, parent1Phone: e.target.value })}
                            placeholder="z.B. 0173 9876543"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Button zum Hinzufügen des zweiten Elternkontakts */}
                  {!showSecondParent && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => setShowSecondParent(true)}
                    >
                      <Plus className="h-4 w-4" />
                      Zweiten Erziehungsberechtigten hinzufügen
                    </Button>
                  )}

                  {/* Zweiter Elternkontakt (Optional) */}
                  {showSecondParent && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                          <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>Zweiter Erziehungsberechtigter (optional)</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowSecondParent(false);
                            setFormData({
                              ...formData,
                              parent2Name: "",
                              parent2Relation: "",
                              parent2Email: "",
                              parent2Phone: ""
                            });
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid gap-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="grid gap-2">
                            <Label htmlFor="edit-parent2-name">Name</Label>
                            <Input
                              id="edit-parent2-name"
                              value={formData.parent2Name}
                              onChange={(e) => setFormData({ ...formData, parent2Name: e.target.value })}
                              placeholder="z.B. Peter Mustermann"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="edit-parent2-relation">Beziehung</Label>
                            <Select
                              value={formData.parent2Relation}
                              onValueChange={(value) => setFormData({ ...formData, parent2Relation: value })}
                            >
                              <SelectTrigger id="edit-parent2-relation">
                                <SelectValue placeholder="Bitte auswählen" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Mutter">Mutter</SelectItem>
                                <SelectItem value="Vater">Vater</SelectItem>
                                <SelectItem value="Erziehungsberechtigter">Erziehungsberechtigter</SelectItem>
                                <SelectItem value="Vormund">Vormund</SelectItem>
                                <SelectItem value="Sonstiges">Sonstiges</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="grid gap-2">
                            <Label htmlFor="edit-parent2-email">E-Mail-Adresse</Label>
                            <Input
                              id="edit-parent2-email"
                              type="email"
                              value={formData.parent2Email}
                              onChange={(e) => setFormData({ ...formData, parent2Email: e.target.value })}
                              placeholder="beispiel@email.de"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="edit-parent2-phone">Telefonnummer</Label>
                            <Input
                              id="edit-parent2-phone"
                              type="tel"
                              value={formData.parent2Phone}
                              onChange={(e) => setFormData({ ...formData, parent2Phone: e.target.value })}
                              placeholder="z.B. 0172 1234567"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSaveProfile}>
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Passwort-Ändern-Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Passwort ändern</DialogTitle>
            <DialogDescription>
              Wähle ein sicheres Passwort mit mindestens 8 Zeichen.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="current-password">Aktuelles Passwort</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordData.current}
                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">Neues Passwort</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordData.new}
                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Neues Passwort bestätigen</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleChangePassword}>
              Passwort ändern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bankdaten-Ändern-Dialog */}
      <Dialog open={bankDialogOpen} onOpenChange={setBankDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bankdaten ändern</DialogTitle>
            <DialogDescription>
              Aktualisiere deine Bankverbindung für den Mitgliedsbeitrag.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Bitte stelle sicher, dass alle Angaben korrekt sind. Die Bankdaten werden für den automatischen Beitragseinzug verwendet.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <h4>Bankverbindung</h4>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="bank-account-holder">Kontoinhaber *</Label>
                  <Input
                    id="bank-account-holder"
                    value={bankData.accountHolder}
                    onChange={(e) => setBankData({ ...bankData, accountHolder: e.target.value })}
                    placeholder="z.B. Max Mustermann"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bank-name">Bank / Kreditinstitut *</Label>
                  <Input
                    id="bank-name"
                    value={bankData.bankName}
                    onChange={(e) => setBankData({ ...bankData, bankName: e.target.value })}
                    placeholder="z.B. Sparkasse Hamminkeln"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bank-iban">IBAN *</Label>
                  <Input
                    id="bank-iban"
                    value={bankData.iban}
                    onChange={(e) => setBankData({ ...bankData, iban: e.target.value })}
                    placeholder="DE89 3704 0044 0532 0130 00"
                    className="font-mono"
                    required
                  />
                  <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                    Bitte gib die IBAN mit oder ohne Leerzeichen ein
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bank-bic">BIC *</Label>
                  <Input
                    id="bank-bic"
                    value={bankData.bic}
                    onChange={(e) => setBankData({ ...bankData, bic: e.target.value })}
                    placeholder="COBADEFFXXX"
                    className="font-mono"
                    required
                  />
                  <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                    8 oder 11 Zeichen (Bank Identifier Code)
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* SEPA-Lastschriftmandat */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                <h4>SEPA-Lastschriftmandat</h4>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox 
                  id="sepa-mandate"
                  checked={sepaMandate}
                  onCheckedChange={(checked) => setSepaMandate(checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor="sepa-mandate" className="cursor-pointer">
                    Ich erteile dem Flugmodellsportverein Dingden e.V. ein SEPA-Lastschriftmandat
                  </Label>
                  <p className="text-muted-foreground mt-1" style={{ fontSize: '0.875rem' }}>
                    Der Vereinsbeitrag wird jährlich automatisch von deinem Konto eingezogen. 
                    Du kannst das Mandat jederzeit widerrufen.
                  </p>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Mit der Erteilung des SEPA-Lastschriftmandats ermächtigst du den Verein, 
                  den jährlichen Mitgliedsbeitrag von deinem Konto einzuziehen. Die Gläubiger-Identifikationsnummer 
                  und Mandatsreferenz erhältst du per E-Mail.
                </AlertDescription>
              </Alert>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBankDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleBankDataSave} disabled={!sepaMandate}>
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
