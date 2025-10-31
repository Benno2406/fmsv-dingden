import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Checkbox } from "../components/ui/checkbox";
import { 
  UserPlus, 
  CheckCircle, 
  Mail, 
  Phone, 
  MapPin,
  Users,
  FileText,
  Euro,
  Info,
  CreditCard,
  Download,
  Upload,
  X
} from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";

export function MitgliedschaftPage() {
  const [membershipType, setMembershipType] = useState<string>("erwachsene");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const getMembershipDetails = () => {
    switch (membershipType) {
      case "kinder":
        return {
          title: "Kinder bis 16 Jahre",
          jahresbeitrag: 10,
          aufnahme: 12,
          dmfv: 12,
          platzpflege: 50,
          description: "Für junge Modellflieger bis 16 Jahre"
        };
      case "jugendliche":
        return {
          title: "Jugendliche 16-18 Jahre",
          jahresbeitrag: 40,
          aufnahme: 30,
          dmfv: 12,
          platzpflege: 50,
          description: "Für Jugendliche zwischen 16 und 18 Jahren"
        };
      case "erwachsene":
        return {
          title: "Erwachsene ab 18 Jahre",
          jahresbeitrag: 100,
          aufnahme: 100,
          dmfv: 42,
          platzpflege: 50,
          description: "Für erwachsene Modellflieger ab 18 Jahren"
        };
      case "studenten":
        return {
          title: "Studenten & Wehrpflichtige",
          jahresbeitrag: 50,
          aufnahme: 100,
          dmfv: 42,
          platzpflege: 50,
          description: "Ermäßigter Beitrag für Studenten und Wehrpflichtige"
        };
      case "passiv":
        return {
          title: "Passive Mitglieder",
          jahresbeitrag: 30,
          aufnahme: 100,
          dmfv: 0,
          platzpflege: 0,
          description: "Für Fördermitglieder ohne aktiven Flugbetrieb"
        };
      default:
        return {
          title: "",
          jahresbeitrag: 0,
          aufnahme: 0,
          dmfv: 0,
          platzpflege: 0,
          description: ""
        };
    }
  };

  const details = getMembershipDetails();
  const jaehrlichGesamt = details.jahresbeitrag + details.dmfv + details.platzpflege;
  const gesamtErsteJahr = details.aufnahme + jaehrlichGesamt;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Hier würde die Formular-Logik implementiert werden
    console.log("Mitgliedschaftsantrag eingereicht");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setUploadedFiles(prev => [...prev, ...Array.from(files)]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-white py-20 md:py-28">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMi01LjM3My0xMi0xMi0xMnptMCAxOGMtMy4zMTQgMC02LTIuNjg2LTYtNnMyLjY4Ni02IDYtNiA2IDIuNjg2IDYgNi0yLjY4NiA2LTYgNnoiIGZpbGw9IiNmZmYiIG9wYWNpdHk9Ii4wNSIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
        
        <div className="container mx-auto px-4 md:px-6 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-white/30">
              Mitglied werden
            </Badge>
            <h1 className="text-white mb-6">Werde Teil unserer Gemeinschaft</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Stelle deinen Mitgliedschaftsantrag und erlebe die Faszination des Modellflugs im Flugmodellsportverein Dingden. Wir freuen uns auf dich!
            </p>
          </div>
        </div>
      </section>

      {/* Main Form Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="h-6 w-6" />
                      Mitgliedschaftsantrag
                    </CardTitle>
                    <CardDescription>
                      Dieses Formular dient zum Vorausfüllen deines Mitgliedschaftsantrags. Du kannst die Daten hier eingeben und den ausgefüllten Antrag anschließend herunterladen. Alternativ kannst du den Antrag auch direkt als PDF herunterladen und händisch ausfüllen.
                    </CardDescription>
                    
                    {/* Download Button */}
                    <div className="pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full sm:w-auto"
                        onClick={() => window.open('/mitgliedschaftsantrag.pdf', '_blank')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Antrag als PDF herunterladen
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-8">
                      {/* Mitgliedschaftsart */}
                      <div className="space-y-4">
                        <Label className="text-base">Mitgliedschaftsart *</Label>
                        <RadioGroup value={membershipType} onValueChange={setMembershipType}>
                          <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-colors cursor-pointer">
                            <RadioGroupItem value="kinder" id="kinder" className="mt-1" />
                            <Label htmlFor="kinder" className="flex-1 cursor-pointer">
                              <div className="flex items-center justify-between mb-1">
                                <span>Kinder bis 16 Jahre</span>
                                <span className="text-sm text-muted-foreground">84€/Jahr</span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Für junge Modellflieger bis 16 Jahre
                              </p>
                            </Label>
                          </div>
                          
                          <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-colors cursor-pointer">
                            <RadioGroupItem value="jugendliche" id="jugendliche" className="mt-1" />
                            <Label htmlFor="jugendliche" className="flex-1 cursor-pointer">
                              <div className="flex items-center justify-between mb-1">
                                <span>Jugendliche 16-18 Jahre</span>
                                <span className="text-sm text-muted-foreground">102€/Jahr</span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Für Jugendliche zwischen 16 und 18 Jahren
                              </p>
                            </Label>
                          </div>
                          
                          <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-colors cursor-pointer">
                            <RadioGroupItem value="erwachsene" id="erwachsene" className="mt-1" />
                            <Label htmlFor="erwachsene" className="flex-1 cursor-pointer">
                              <div className="flex items-center justify-between mb-1">
                                <span>Erwachsene ab 18 Jahre</span>
                                <span className="text-sm text-muted-foreground">192€/Jahr</span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Für erwachsene Modellflieger ab 18 Jahren
                              </p>
                            </Label>
                          </div>

                          <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-colors cursor-pointer">
                            <RadioGroupItem value="studenten" id="studenten" className="mt-1" />
                            <Label htmlFor="studenten" className="flex-1 cursor-pointer">
                              <div className="flex items-center justify-between mb-1">
                                <span>Studenten & Wehrpflichtige</span>
                                <span className="text-sm text-muted-foreground">142€/Jahr</span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Ermäßigter Beitrag (Nachweis erforderlich)
                              </p>
                            </Label>
                          </div>

                          <div className="flex items-start space-x-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-colors cursor-pointer">
                            <RadioGroupItem value="passiv" id="passiv" className="mt-1" />
                            <Label htmlFor="passiv" className="flex-1 cursor-pointer">
                              <div className="flex items-center justify-between mb-1">
                                <span>Passive Mitgliedschaft</span>
                                <span className="text-sm text-muted-foreground">30€/Jahr</span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Fördermitgliedschaft ohne aktiven Flugbetrieb
                              </p>
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Persönliche Daten */}
                      <div className="space-y-4">
                        <h3 className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          Persönliche Daten
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="vorname">Vorname *</Label>
                            <Input id="vorname" placeholder="Dein Vorname" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="nachname">Nachname *</Label>
                            <Input id="nachname" placeholder="Dein Nachname" required />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="geburtsdatum">Geburtsdatum *</Label>
                          <Input id="geburtsdatum" type="date" required />
                        </div>
                      </div>

                      {/* Kontaktdaten */}
                      <div className="space-y-4">
                        <h3 className="flex items-center gap-2">
                          <Phone className="h-5 w-5" />
                          Kontaktdaten
                        </h3>
                        <div className="space-y-2">
                          <Label htmlFor="email">E-Mail-Adresse *</Label>
                          <Input id="email" type="email" placeholder="deine@email.de" required />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="telefon">Telefonnummer *</Label>
                            <Input id="telefon" type="tel" placeholder="02852 1234567" required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="mobil">Mobilnummer</Label>
                            <Input id="mobil" type="tel" placeholder="0171 1234567" />
                          </div>
                        </div>
                      </div>

                      {/* Adresse */}
                      <div className="space-y-4">
                        <h3 className="flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          Adresse
                        </h3>
                        <div className="space-y-2">
                          <Label htmlFor="strasse">Straße und Hausnummer *</Label>
                          <Input id="strasse" placeholder="Musterstraße 123" required />
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="space-y-2 md:col-span-1">
                            <Label htmlFor="plz">PLZ *</Label>
                            <Input id="plz" placeholder="46499" required />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="wohnort">Wohnort *</Label>
                            <Input id="wohnort" placeholder="Dingden" required />
                          </div>
                        </div>
                      </div>

                      {/* Bankverbindung */}
                      <div className="space-y-4">
                        <h3 className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5" />
                          Bankverbindung
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Für den Bankeinzug des Mitgliedsbeitrags benötigen wir deine Kontodaten.
                        </p>
                        <div className="space-y-2">
                          <Label htmlFor="iban">IBAN *</Label>
                          <Input id="iban" placeholder="DE89 3704 0044 0532 0130 00" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bic">BIC *</Label>
                          <Input id="bic" placeholder="COBADEFFXXX" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="kreditinstitut">Kreditinstitut *</Label>
                          <Input id="kreditinstitut" placeholder="Sparkasse Hamminkeln" required />
                        </div>
                      </div>

                      {/* Bei Studenten/Wehrpflichtigen: Nachweis */}
                      {membershipType === "studenten" && (
                        <Alert className="bg-blue-50 border-blue-200">
                          <Info className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-sm text-blue-900">
                            Bitte füge deinem Antrag einen gültigen Nachweis bei (Studienausweis, Immatrikulationsbescheinigung oder Wehrdienstbescheinigung).
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Anmerkungen */}
                      <div className="space-y-4">
                        <h3 className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Anmerkungen (optional)
                        </h3>
                        <div className="space-y-2">
                          <Label htmlFor="anmerkungen">
                            Hast du Fragen oder möchtest du uns etwas mitteilen?
                          </Label>
                          <Textarea 
                            id="anmerkungen" 
                            placeholder="Deine Nachricht an uns..."
                            rows={4}
                          />
                        </div>
                      </div>

                      {/* Nachweise hochladen */}
                      <div className="space-y-4">
                        <h3 className="flex items-center gap-2">
                          <Upload className="h-5 w-5" />
                          Nachweise hochladen (optional)
                        </h3>
                        <div className="space-y-3">
                          <Label htmlFor="file-upload">
                            Lade hier relevante Nachweise hoch (z.B. Studentenausweis, Immatrikulationsbescheinigung)
                          </Label>
                          
                          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                            <input
                              id="file-upload"
                              type="file"
                              multiple
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                            <label 
                              htmlFor="file-upload" 
                              className="cursor-pointer flex flex-col items-center gap-2"
                            >
                              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                                <Upload className="h-6 w-6 text-muted-foreground" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm">
                                  <span className="text-primary">Klicke hier</span> oder ziehe Dateien hierher
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  PDF, JPG oder PNG (max. 5 MB pro Datei)
                                </p>
                              </div>
                            </label>
                          </div>

                          {/* Hochgeladene Dateien */}
                          {uploadedFiles.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm">Hochgeladene Dateien:</p>
                              <div className="space-y-2">
                                {uploadedFiles.map((file, index) => (
                                  <div 
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                                  >
                                    <div className="flex items-center gap-3">
                                      <FileText className="h-4 w-4 text-muted-foreground" />
                                      <div>
                                        <p className="text-sm">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {(file.size / 1024).toFixed(2)} KB
                                        </p>
                                      </div>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeFile(index)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Datenschutz & AGB */}
                      <div className="space-y-4 p-6 bg-muted/30 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <Checkbox 
                            id="terms" 
                            checked={agreedToTerms}
                            onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                            required
                          />
                          <Label 
                            htmlFor="terms" 
                            className="text-sm cursor-pointer leading-relaxed"
                          >
                            Ich habe die Datenschutzerklärung zur Kenntnis genommen und akzeptiere die Vereinssatzung sowie die Flugordnung des FMSV Dingden. Mir ist bewusst, dass die Mitgliedschaft erst nach Prüfung und Bestätigung durch den Vorstand gültig wird. *
                          </Label>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="flex gap-4">
                        <Button 
                          type="submit" 
                          size="lg" 
                          className="flex-1"
                          disabled={!agreedToTerms}
                        >
                          <Download className="h-5 w-5 mr-2" />
                          Vorausgefüllten Antrag downloaden
                        </Button>
                      </div>

                      <p className="text-sm text-muted-foreground text-center">
                        * Pflichtfelder
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Kostenübersicht */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Euro className="h-5 w-5" />
                      Kostenübersicht
                    </CardTitle>
                    <CardDescription>{details.title}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Einmalige Kosten */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-1 w-1 rounded-full bg-primary"></div>
                        <h4 className="text-sm text-muted-foreground uppercase tracking-wide">Einmalig</h4>
                      </div>
                      <div className="flex justify-between items-center pl-3">
                        <span className="text-sm">Aufnahmegebühr</span>
                        <span className="font-medium">{details.aufnahme}€</span>
                      </div>
                      <div className="h-px bg-border"></div>
                    </div>

                    {/* Jährlich wiederkehrende Kosten */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-1 w-1 rounded-full bg-primary"></div>
                        <h4 className="text-sm text-muted-foreground uppercase tracking-wide">Jährlich wiederkehrend</h4>
                      </div>
                      <div className="flex justify-between items-center pl-3">
                        <span className="text-sm">Jahresbeitrag</span>
                        <span className="font-medium">{details.jahresbeitrag}€</span>
                      </div>
                      {details.dmfv > 0 && (
                        <div className="flex justify-between items-center pl-3">
                          <span className="text-sm">DMFV-Mitgliedschaft</span>
                          <span className="font-medium">{details.dmfv}€</span>
                        </div>
                      )}
                      {details.platzpflege > 0 && (
                        <div className="flex justify-between items-center pl-3">
                          <span className="text-sm">Platzpflegegebühr</span>
                          <span className="font-medium">{details.platzpflege}€</span>
                        </div>
                      )}
                      <div className="h-px bg-border"></div>
                      <div className="flex justify-between items-center pl-3 text-sm text-muted-foreground">
                        <span>Jährlich gesamt</span>
                        <span>{jaehrlichGesamt}€</span>
                      </div>
                    </div>

                    {/* Gesamtkosten 1. Jahr */}
                    <div className="pt-4 border-t-2 border-primary/20">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">Gesamtkosten 1. Jahr</div>
                          <div className="text-xs text-muted-foreground">inkl. Aufnahmegebühr</div>
                        </div>
                        <span className="text-2xl text-primary">{gesamtErsteJahr}€</span>
                      </div>
                    </div>

                    <Alert className="bg-blue-50 border-blue-200">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-sm text-blue-900">
                        Ab dem 2. Jahr: {jaehrlichGesamt}€/Jahr (ohne Aufnahmegebühr)
                      </AlertDescription>
                    </Alert>

                    {details.dmfv > 0 && (
                      <div className="pt-2 text-xs text-muted-foreground">
                        Die DMFV-Mitgliedschaft beinhaltet eine Haftpflicht- und Unfallversicherung für den Modellflugbetrieb.
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Platzpflegegebühr zurückerstatten - nur bei aktiven Mitgliedern */}
                {details.platzpflege > 0 && (
                  <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="bg-green-500 p-2 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-green-900 mb-1">Platzpflegegebühr zurückerstatten</h4>
                        <p className="text-sm text-green-800">
                          Spare Geld durch aktive Mithilfe bei unseren Arbeitseinsätzen!
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="bg-white/60 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                            1
                          </div>
                          <span className="text-sm text-green-900">Arbeitseinsatz</span>
                        </div>
                        <div className="text-2xl text-green-700">25€</div>
                        <p className="text-xs text-green-800/70">Rückerstattung</p>
                      </div>
                      
                      <div className="bg-white/60 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                            2
                          </div>
                          <span className="text-sm text-green-900">Arbeitseinsätze</span>
                        </div>
                        <div className="text-2xl text-green-700">50€</div>
                        <p className="text-xs text-green-800/70">Volle Erstattung!</p>
                      </div>
                    </div>
                    
                    <p className="text-xs text-green-800/80 mt-4">
                      Die Arbeitseinsätze finden 2× jährlich statt. Bei Teilnahme erhältst du pro Einsatz 25€ zurück.
                    </p>
                  </div>
                )}

                {/* Kontaktinfo */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Phone className="h-5 w-5" />
                      Fragen zur Mitgliedschaft?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Bei Fragen zur Mitgliedschaft helfen wir dir gerne weiter.
                    </p>
                    
                    {/* Allgemeine E-Mail */}
                    <div className="pt-3 border-t">
                      <p className="text-sm mb-1">E-Mail</p>
                      <a 
                        href="mailto:info@fmsv-dingden.de" 
                        className="text-sm text-primary hover:underline"
                      >
                        info@fmsv-dingden.de
                      </a>
                    </div>

                    {/* Vorsitzender */}
                    <div className="pt-3 border-t">
                      <p className="text-sm mb-2">Vorsitzender</p>
                      <div className="space-y-1">
                        <p className="text-sm">Klaus-Jürgen Eich</p>
                        <p className="text-sm text-muted-foreground">
                          Akazienweg 9<br />
                          46499 Hamminkeln
                        </p>
                        <a 
                          href="tel:017624990912" 
                          className="text-sm text-primary hover:underline block"
                        >
                          0176 - 24990912
                        </a>
                      </div>
                    </div>

                    {/* Geschäftsführer */}
                    <div className="pt-3 border-t">
                      <p className="text-sm mb-2">Geschäftsführer</p>
                      <div className="space-y-1">
                        <p className="text-sm">Guido Major</p>
                        <p className="text-sm text-muted-foreground">
                          Wittenhorsterweg 1b<br />
                          46499 Hamminkeln
                        </p>
                        <a 
                          href="tel:028577414" 
                          className="text-sm text-primary hover:underline block"
                        >
                          02857 - 7414
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Prozess Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4">So geht's weiter</Badge>
              <h2 className="mb-4">Nach deinem Antrag</h2>
              <p className="text-lg text-muted-foreground">
                Der Weg zu deiner Mitgliedschaft in 3 einfachen Schritten
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
                  1
                </div>
                <h3 className="mb-2">Antrag downloaden & unterschreiben</h3>
                <p className="text-sm text-muted-foreground">
                  Lade den Mitgliedschaftsantrag herunter, fülle ihn aus und unterschreibe ihn.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
                  2
                </div>
                <h3 className="mb-2">Absenden an info@fmsv-dingden.de</h3>
                <p className="text-sm text-muted-foreground">
                  Sende den unterschriebenen Antrag per E-Mail an uns oder wirf ihn in unseren Briefkasten.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
                  3
                </div>
                <h3 className="mb-2">Wir melden uns zeitnah bei dir</h3>
                <p className="text-sm text-muted-foreground">
                  Nach Prüfung deines Antrags erhältst du eine Rückmeldung vom Vorstand.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
