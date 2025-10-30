import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Plane, 
  Users, 
  Settings, 
  FileText,
  Save,
  X,
  Home,
  Shield,
  AlertCircle,
  CheckCircle2,
  Building2,
  FileCheck
} from "lucide-react";
import { toast } from "sonner";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  beruf?: string;
  email: string;
  phone?: string;
  mobile?: string;
  strasse: string;
  plz: string;
  wohnort: string;
  parent1_name?: string;
  parent1_relation?: string;
  parent1_email?: string;
  parent1_phone?: string;
  parent1_mobile?: string;
  parent2_name?: string;
  parent2_relation?: string;
  parent2_email?: string;
  parent2_phone?: string;
  parent2_mobile?: string;
  iban?: string;
  bic?: string;
  kreditinstitut?: string;
  sepaMandatErteilt?: boolean;
  sepaMandatDatum?: string;
  memberType: "Aktiv" | "Passiv" | "Jugend" | "Ehren";
  role?: "Vorstand" | "Mitglied";
  position?: string;
  joinDate: string;
  kenntnisausweisnummer?: string;
  kenntnisausweisAblauf?: string;
  kenntnisnachweisStatus: "valid" | "expiring" | "expired" | "none";
  luftfahrtId?: string;
  dmfvMitgliedsnummer?: string;
  notes?: string;
}

interface MemberEditDialogProps {
  member: Member | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (member: Member) => void;
}

export function MemberEditDialog({ member, open, onOpenChange, onSave }: MemberEditDialogProps) {
  const [activeTab, setActiveTab] = useState("personal");
  const [formData, setFormData] = useState<Member | null>(member);

  // Calculate status based on expiry date
  const calculateKenntnisStatus = (ablaufDatum: string): Member["kenntnisnachweisStatus"] => {
    if (!ablaufDatum || ablaufDatum === "") return "none";
    
    try {
      const [day, month, year] = ablaufDatum.split('.');
      const expiryDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const today = new Date();
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(today.getMonth() + 3);
      
      if (expiryDate < today) {
        return "expired";
      } else if (expiryDate <= threeMonthsFromNow) {
        return "expiring";
      } else {
        return "valid";
      }
    } catch {
      return "none";
    }
  };

  // Update formData when member changes and recalculate status
  useEffect(() => {
    const updatedMember = { ...member };
    if (updatedMember.kenntnisausweisAblauf) {
      updatedMember.kenntnisnachweisStatus = calculateKenntnisStatus(updatedMember.kenntnisausweisAblauf);
    }
    setFormData(updatedMember);
    setActiveTab("personal"); // Reset to first tab when member changes
  }, [member]);

  if (!formData) return null;

  // Helper functions for date conversion
  const germanToIsoDate = (germanDate: string): string => {
    // Convert DD.MM.YYYY to YYYY-MM-DD
    if (!germanDate || !germanDate.includes('.')) return germanDate;
    const [day, month, year] = germanDate.split('.');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const isoToGermanDate = (isoDate: string): string => {
    // Convert YYYY-MM-DD to DD.MM.YYYY
    if (!isoDate || !isoDate.includes('-')) return isoDate;
    const [year, month, day] = isoDate.split('-');
    return `${day}.${month}.${year}`;
  };

  const handleInputChange = (field: keyof Member, value: string | boolean) => {
    const newFormData = {
      ...formData,
      [field]: value,
    };
    
    // Wenn Rolle auf "Vorstand" gesetzt wird, muss memberType "Aktiv" sein
    if (field === "role" && value === "Vorstand") {
      newFormData.memberType = "Aktiv";
    }
    
    // Wenn memberType von "Aktiv" zu etwas anderem geändert wird und Rolle ist "Vorstand",
    // dann muss die Rolle auf "Mitglied" zurückgesetzt werden
    if (field === "memberType" && value !== "Aktiv" && formData.role === "Vorstand") {
      newFormData.role = "Mitglied";
      newFormData.position = ""; // Position auch zurücksetzen
    }
    
    // Wenn Rolle nicht "Vorstand" ist und Position eine Vorstandsposition ist,
    // dann Position zurücksetzen (außer Webmaster)
    if (field === "role" && value !== "Vorstand") {
      const vorstandsPositionen = ["1. Vorsitzender", "Geschäftsführer", "Kassenwart", "Schriftführer", "Jugendwart", "Platzwart", "Beisitzer"];
      if (formData.position && vorstandsPositionen.includes(formData.position)) {
        newFormData.position = "";
      }
    }
    
    // Wenn SEPA-Mandat deaktiviert wird, Datum zurücksetzen
    if (field === "sepaMandatErteilt" && !value) {
      newFormData.sepaMandatDatum = "";
    }
    
    setFormData(newFormData);
  };

  const handleDateChange = (field: keyof Member, isoDate: string) => {
    // Convert ISO date to German format before saving
    const germanDate = isoToGermanDate(isoDate);
    const newFormData = {
      ...formData,
      [field]: germanDate,
    };
    
    // Auto-calculate status if kenntnisausweisAblauf changes
    if (field === "kenntnisausweisAblauf") {
      newFormData.kenntnisnachweisStatus = calculateKenntnisStatus(germanDate);
    }
    
    setFormData(newFormData);
  };

  const handleSave = () => {
    // Validierung
    if (!formData.firstName || !formData.lastName) {
      toast.error("Vorname und Nachname sind Pflichtfelder");
      setActiveTab("personal");
      return;
    }

    if (!formData.email || !formData.email.includes("@")) {
      toast.error("Bitte gib eine gültige E-Mail-Adresse ein");
      setActiveTab("contact");
      return;
    }

    onSave(formData);
    toast.success("Mitglied erfolgreich aktualisiert");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setFormData(member);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="relative px-6 py-5 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-muted">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <DialogTitle className="text-xl">
                    {formData.firstName} {formData.lastName}
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    Bearbeite die Mitgliedsdaten für {formData.firstName} {formData.lastName}
                  </DialogDescription>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <p className="text-sm text-muted-foreground">
                      Mitgliedsnummer: <span className="font-mono">{formData.id}</span>
                    </p>
                    <Badge variant="outline">{formData.memberType}</Badge>
                    {formData.role && (
                      <Badge variant={formData.role === "Vorstand" ? "default" : "secondary"}>
                        <Shield className="h-3 w-3 mr-1" />
                        {formData.role}
                      </Badge>
                    )}
                    {formData.position && (
                      <Badge variant="outline">
                        {formData.position}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="mr-6">
              <p className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap">
                <AlertCircle className="h-3 w-3" />
                Pflichtfelder mit *
              </p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)]">
          <div className="px-6 py-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              {/* Tabs */}
              <TabsList className={`grid w-full mb-6 ${formData.memberType === "Jugend" ? "grid-cols-7" : "grid-cols-6"}`}>
                <TabsTrigger value="personal" className="flex items-center justify-center gap-1.5 px-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Persönlich</span>
                </TabsTrigger>
                <TabsTrigger value="contact" className="flex items-center justify-center gap-1.5 px-2">
                  <Mail className="h-4 w-4" />
                  <span className="hidden sm:inline">Kontakt</span>
                </TabsTrigger>
                <TabsTrigger value="bank" className="flex items-center justify-center gap-1.5 px-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="hidden sm:inline">Bank</span>
                </TabsTrigger>
                <TabsTrigger value="flight" className="flex items-center justify-center gap-1.5 px-2">
                  <Plane className="h-4 w-4" />
                  <span className="hidden sm:inline">Flug</span>
                </TabsTrigger>
                {formData.memberType === "Jugend" && (
                  <TabsTrigger value="parents" className="flex items-center justify-center gap-1.5 px-2">
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">Kontaktpersonen</span>
                  </TabsTrigger>
                )}
                <TabsTrigger value="membership" className="flex items-center justify-center gap-1.5 px-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Mitglied</span>
                </TabsTrigger>
                <TabsTrigger value="notes" className="flex items-center justify-center gap-1.5 px-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Notizen</span>
                </TabsTrigger>
              </TabsList>

              {/* Persönlich Tab */}
              <TabsContent value="personal" className="space-y-6 mt-0">
                <div className="space-y-6">
                  {/* Name Section */}
                  <div className="p-5 rounded-lg bg-muted/50 border">
                    <h4 className="flex items-center gap-2 mb-4">
                      <User className="h-4 w-4" />
                      Persönliche Informationen
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">
                          Vorname <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          placeholder="Max"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">
                          Nachname <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          placeholder="Mustermann"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 mt-4">
                      <Label htmlFor="birthDate">Geburtsdatum</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={germanToIsoDate(formData.birthDate)}
                        onChange={(e) => handleDateChange("birthDate", e.target.value)}
                        className="[&::-webkit-calendar-picker-indicator]:ml-auto"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Kontakt Tab */}
              <TabsContent value="contact" className="space-y-6 mt-0">
                <div className="space-y-6">
                  {/* Email Section */}
                  <div className="p-5 rounded-lg bg-muted/50 border">
                    <h4 className="flex items-center gap-2 mb-4">
                      <Mail className="h-4 w-4" />
                      E-Mail-Adresse
                    </h4>
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        E-Mail <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="max.mustermann@email.de"
                      />
                    </div>
                  </div>

                  {/* Phone Section */}
                  <div className="p-5 rounded-lg bg-muted/50 border">
                    <h4 className="flex items-center gap-2 mb-4">
                      <Phone className="h-4 w-4" />
                      Telefonnummern
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Festnetz</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone || ""}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          placeholder="02852 123456"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mobile">Mobilfunk</Label>
                        <Input
                          id="mobile"
                          type="tel"
                          value={formData.mobile || ""}
                          onChange={(e) => handleInputChange("mobile", e.target.value)}
                          placeholder="0171 1234567"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="p-5 rounded-lg bg-muted/50 border">
                    <h4 className="flex items-center gap-2 mb-4">
                      <Home className="h-4 w-4" />
                      Anschrift
                    </h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="strasse">Straße und Hausnummer</Label>
                        <Input
                          id="strasse"
                          value={formData.strasse}
                          onChange={(e) => handleInputChange("strasse", e.target.value)}
                          placeholder="Musterstraße 12"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="plz">PLZ</Label>
                          <Input
                            id="plz"
                            value={formData.plz}
                            onChange={(e) => handleInputChange("plz", e.target.value)}
                            placeholder="46499"
                            maxLength={5}
                          />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label htmlFor="wohnort">Wohnort</Label>
                          <Input
                            id="wohnort"
                            value={formData.wohnort}
                            onChange={(e) => handleInputChange("wohnort", e.target.value)}
                            placeholder="Hamminkeln"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Bank Tab */}
              <TabsContent value="bank" className="space-y-6 mt-0">
                <div className="space-y-6">
                  {/* Security Notice */}
                  <div className="p-4 rounded-lg bg-muted border">
                    <p className="flex items-start gap-3 text-sm">
                      <Shield className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <span>
                        Die Bankdaten werden verschlüsselt gespeichert und nur für den automatischen Beitragseinzug verwendet.
                      </span>
                    </p>
                  </div>

                  {/* Bank Details */}
                  <div className="p-5 rounded-lg bg-muted/50 border">
                    <h4 className="flex items-center gap-2 mb-4">
                      <CreditCard className="h-4 w-4" />
                      Bankverbindung
                    </h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="iban">IBAN</Label>
                        <Input
                          id="iban"
                          value={formData.iban || ""}
                          onChange={(e) => handleInputChange("iban", e.target.value)}
                          placeholder="DE89 3704 0044 0532 0130 00"
                          className="font-mono"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bic">BIC</Label>
                        <Input
                          id="bic"
                          value={formData.bic || ""}
                          onChange={(e) => handleInputChange("bic", e.target.value)}
                          placeholder="COBADEFFXXX"
                          className="font-mono"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="kreditinstitut">Kreditinstitut</Label>
                        <Input
                          id="kreditinstitut"
                          value={formData.kreditinstitut || ""}
                          onChange={(e) => handleInputChange("kreditinstitut", e.target.value)}
                          placeholder="Sparkasse Hamminkeln"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SEPA Mandate */}
                  <div className="p-5 rounded-lg bg-muted/50 border">
                    <h4 className="flex items-center gap-2 mb-4">
                      <FileCheck className="h-4 w-4" />
                      SEPA-Lastschriftmandat
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="sepaMandatErteilt"
                          checked={formData.sepaMandatErteilt || false}
                          onCheckedChange={(checked) => handleInputChange("sepaMandatErteilt", checked as boolean)}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor="sepaMandatErteilt"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            Lastschriftmandat erteilt
                          </label>
                          <p className="text-sm text-muted-foreground">
                            Berechtigung zum Einzug von Lastschriften vom angegebenen Konto
                          </p>
                        </div>
                      </div>
                      
                      {formData.sepaMandatErteilt && (
                        <div className="space-y-2 pt-2">
                          <Label htmlFor="sepaMandatDatum">Datum der Mandatserteilung</Label>
                          <Input
                            id="sepaMandatDatum"
                            type="date"
                            value={formData.sepaMandatDatum ? germanToIsoDate(formData.sepaMandatDatum) : ""}
                            onChange={(e) => handleDateChange("sepaMandatDatum", e.target.value)}
                            className="[&::-webkit-calendar-picker-indicator]:ml-auto"
                          />
                          <p className="text-xs text-muted-foreground">
                            Wird für rechtliche Nachweise und Dokumentation benötigt
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Flug Tab */}
              <TabsContent value="flight" className="space-y-6 mt-0">
                <div className="space-y-6">
                  {/* Kenntnisnachweis Section */}
                  <div className="p-5 rounded-lg bg-muted/50 border">
                    <h4 className="flex items-center gap-2 mb-4">
                      <Plane className="h-4 w-4" />
                      Kenntnisnachweis
                    </h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="kenntnisausweisnummer">Ausweisnummer</Label>
                        <Input
                          id="kenntnisausweisnummer"
                          value={formData.kenntnisausweisnummer || ""}
                          onChange={(e) => handleInputChange("kenntnisausweisnummer", e.target.value)}
                          placeholder="AKT-2018-123"
                          className="font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="kenntnisausweisAblauf">Ablaufdatum</Label>
                          <Input
                            id="kenntnisausweisAblauf"
                            type="date"
                            value={formData.kenntnisausweisAblauf ? germanToIsoDate(formData.kenntnisausweisAblauf) : ""}
                            onChange={(e) => handleDateChange("kenntnisausweisAblauf", e.target.value)}
                            className="[&::-webkit-calendar-picker-indicator]:ml-auto"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="kenntnisnachweisStatus">Status (automatisch)</Label>
                          <Select
                            value={formData.kenntnisnachweisStatus}
                            disabled
                          >
                            <SelectTrigger id="kenntnisnachweisStatus" className="opacity-100">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="valid">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  Gültig
                                </div>
                              </SelectItem>
                              <SelectItem value="expiring">
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="h-4 w-4 text-amber-600" />
                                  Läuft bald ab
                                </div>
                              </SelectItem>
                              <SelectItem value="expired">
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="h-4 w-4 text-red-600" />
                                  Abgelaufen
                                </div>
                              </SelectItem>
                              <SelectItem value="none">Kein Nachweis</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Wird automatisch berechnet (≤3 Monate = bald ablaufend)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Luftfahrt ID */}
                  <div className="p-5 rounded-lg bg-muted/50 border">
                    <h4 className="flex items-center gap-2 mb-4">
                      <Shield className="h-4 w-4" />
                      Luftfahrt-ID (eID)
                    </h4>
                    <div className="space-y-2">
                      <Label htmlFor="luftfahrtId">Identifikationsnummer</Label>
                      <Input
                        id="luftfahrtId"
                        value={formData.luftfahrtId || ""}
                        onChange={(e) => handleInputChange("luftfahrtId", e.target.value)}
                        placeholder="LBA-DE-2018-1234"
                        className="font-mono"
                      />
                    </div>
                  </div>

                  {/* DMFV Mitgliedsnummer - Separate Card */}
                  <div className="p-5 rounded-lg bg-muted/50 border">
                    <h4 className="flex items-center gap-2 mb-4">
                      <Building2 className="h-4 w-4" />
                      DMFV-Mitgliedsnummer
                    </h4>
                    <div className="space-y-2">
                      <Label htmlFor="dmfvMitgliedsnummer">Mitgliedsnummer</Label>
                      <Input
                        id="dmfvMitgliedsnummer"
                        value={formData.dmfvMitgliedsnummer || ""}
                        onChange={(e) => handleInputChange("dmfvMitgliedsnummer", e.target.value)}
                        placeholder="DMFV-123456"
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground">
                        Deutscher Modellflieger Verband
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Eltern Tab (nur bei Jugend) */}
              {formData.memberType === "Jugend" && (
                <TabsContent value="parents" className="space-y-6 mt-0">
                  <div className="space-y-6">
                    {/* Kontaktperson 1 */}
                    <div className="space-y-4 p-5 rounded-lg bg-muted/50 border">
                      <h4 className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Kontaktperson 1
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="parent1_name">Name</Label>
                          <Input
                            id="parent1_name"
                            value={formData.parent1_name || ""}
                            onChange={(e) => handleInputChange("parent1_name", e.target.value)}
                            placeholder="Max Mustermann"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="parent1_relation">Beziehungsstatus</Label>
                          <Select
                            value={formData.parent1_relation || ""}
                            onValueChange={(value) => handleInputChange("parent1_relation", value)}
                          >
                            <SelectTrigger id="parent1_relation">
                              <SelectValue placeholder="Auswählen..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Vater">Vater</SelectItem>
                              <SelectItem value="Mutter">Mutter</SelectItem>
                              <SelectItem value="Erziehungsberechtigter">Erziehungsberechtigter</SelectItem>
                              <SelectItem value="Sonstig">Sonstig</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="parent1_email">E-Mail</Label>
                        <Input
                          id="parent1_email"
                          type="email"
                          value={formData.parent1_email || ""}
                          onChange={(e) => handleInputChange("parent1_email", e.target.value)}
                          placeholder="max.mustermann@email.de"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="parent1_phone">Telefon</Label>
                          <Input
                            id="parent1_phone"
                            type="tel"
                            value={formData.parent1_phone || ""}
                            onChange={(e) => handleInputChange("parent1_phone", e.target.value)}
                            placeholder="02852 123456"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="parent1_mobile">Mobilfunk</Label>
                          <Input
                            id="parent1_mobile"
                            type="tel"
                            value={formData.parent1_mobile || ""}
                            onChange={(e) => handleInputChange("parent1_mobile", e.target.value)}
                            placeholder="0171 1234567"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Kontaktperson 2 */}
                    <div className="space-y-4 p-5 rounded-lg bg-muted/50 border">
                      <h4 className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Kontaktperson 2
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="parent2_name">Name</Label>
                          <Input
                            id="parent2_name"
                            value={formData.parent2_name || ""}
                            onChange={(e) => handleInputChange("parent2_name", e.target.value)}
                            placeholder="Maria Mustermann"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="parent2_relation">Beziehungsstatus</Label>
                          <Select
                            value={formData.parent2_relation || ""}
                            onValueChange={(value) => handleInputChange("parent2_relation", value)}
                          >
                            <SelectTrigger id="parent2_relation">
                              <SelectValue placeholder="Auswählen..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Vater">Vater</SelectItem>
                              <SelectItem value="Mutter">Mutter</SelectItem>
                              <SelectItem value="Erziehungsberechtigter">Erziehungsberechtigter</SelectItem>
                              <SelectItem value="Sonstig">Sonstig</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="parent2_email">E-Mail</Label>
                        <Input
                          id="parent2_email"
                          type="email"
                          value={formData.parent2_email || ""}
                          onChange={(e) => handleInputChange("parent2_email", e.target.value)}
                          placeholder="maria.mustermann@email.de"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="parent2_phone">Telefon</Label>
                          <Input
                            id="parent2_phone"
                            type="tel"
                            value={formData.parent2_phone || ""}
                            onChange={(e) => handleInputChange("parent2_phone", e.target.value)}
                            placeholder="02852 123456"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="parent2_mobile">Mobilfunk</Label>
                          <Input
                            id="parent2_mobile"
                            type="tel"
                            value={formData.parent2_mobile || ""}
                            onChange={(e) => handleInputChange("parent2_mobile", e.target.value)}
                            placeholder="0171 1234567"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              )}

              {/* Mitgliedschaft Tab */}
              <TabsContent value="membership" className="space-y-6 mt-0">
                <div className="space-y-6">
                  {/* Member Type & Role */}
                  <div className="p-5 rounded-lg bg-muted/50 border">
                    <h4 className="flex items-center gap-2 mb-4">
                      <Settings className="h-4 w-4" />
                      Mitgliedsstatus
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="memberType">Mitgliedstyp</Label>
                        <Select
                          value={formData.memberType}
                          onValueChange={(value) => handleInputChange("memberType", value as Member["memberType"])}
                          disabled={formData.role === "Vorstand"}
                        >
                          <SelectTrigger id="memberType">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Aktiv">Aktiv</SelectItem>
                            <SelectItem value="Passiv">Passiv</SelectItem>
                            <SelectItem value="Jugend">Jugend</SelectItem>
                            <SelectItem value="Ehren">Ehren</SelectItem>
                          </SelectContent>
                        </Select>
                        {formData.role === "Vorstand" && (
                          <p className="text-xs text-muted-foreground">
                            Vorstandsmitglieder müssen vom Typ "Aktiv" sein
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="role">Rolle</Label>
                        <Select
                          value={formData.role || ""}
                          onValueChange={(value) => handleInputChange("role", value as Member["role"])}
                        >
                          <SelectTrigger id="role">
                            <SelectValue placeholder="Auswählen..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Mitglied">Mitglied</SelectItem>
                            <SelectItem value="Vorstand">Vorstand</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Position */}
                  <div className="p-5 rounded-lg bg-muted/50 border">
                    <div className="space-y-2">
                      <Label htmlFor="position">Position / Funktion</Label>
                      <Select
                        value={formData.position || "keine"}
                        onValueChange={(value) => handleInputChange("position", value === "keine" ? "" : value)}
                      >
                        <SelectTrigger id="position">
                          <SelectValue placeholder="Position auswählen..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="keine">Keine Position</SelectItem>
                          {formData.role === "Vorstand" && (
                            <>
                              <SelectItem value="1. Vorsitzender">1. Vorsitzender</SelectItem>
                              <SelectItem value="Geschäftsführer">Geschäftsführer</SelectItem>
                              <SelectItem value="Kassenwart">Kassenwart</SelectItem>
                              <SelectItem value="Schriftführer">Schriftführer</SelectItem>
                              <SelectItem value="Jugendwart">Jugendwart</SelectItem>
                              <SelectItem value="Platzwart">Platzwart</SelectItem>
                              <SelectItem value="Beisitzer">Beisitzer</SelectItem>
                            </>
                          )}
                          <SelectItem value="Webmaster">Webmaster</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {formData.role === "Vorstand" 
                          ? "Vorstandspositionen sind nur für Mitglieder mit Rolle 'Vorstand' verfügbar"
                          : "Webmaster kann von jedem Mitglied besetzt werden"}
                      </p>
                    </div>
                  </div>

                  {/* Join Date */}
                  <div className="p-5 rounded-lg bg-muted/50 border">
                    <div className="space-y-2">
                      <Label htmlFor="joinDate">Beitrittsdatum</Label>
                      <Input
                        id="joinDate"
                        type="date"
                        value={germanToIsoDate(formData.joinDate)}
                        onChange={(e) => handleDateChange("joinDate", e.target.value)}
                        className="[&::-webkit-calendar-picker-indicator]:ml-auto"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Notizen Tab */}
              <TabsContent value="notes" className="space-y-6 mt-0">
                <div className="space-y-6">
                  {/* Privacy Notice */}
                  <div className="p-4 rounded-lg bg-muted border">
                    <p className="flex items-start gap-3 text-sm">
                      <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <span>
                        Diese Notizen sind nur für Vorstandsmitglieder sichtbar und werden nicht an das Mitglied weitergegeben.
                      </span>
                    </p>
                  </div>

                  {/* Notes Section */}
                  <div className="p-5 rounded-lg bg-muted/50 border">
                    <h4 className="flex items-center gap-2 mb-4">
                      <FileText className="h-4 w-4" />
                      Interne Notizen
                    </h4>
                    <div className="space-y-2">
                      <Textarea
                        id="notes"
                        value={formData.notes || ""}
                        onChange={(e) => handleInputChange("notes", e.target.value)}
                        placeholder="Hier kannst du interne Notizen zum Mitglied hinterlegen...&#10;&#10;Beispiele:&#10;• Besondere Fähigkeiten oder Interessen&#10;• Wichtige Informationen für den Vorstand&#10;• Notizen zu Vereinsaktivitäten"
                        rows={14}
                        className="resize-none"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="flex gap-3 px-6 py-4 border-t">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={handleCancel}
          >
            <X className="h-4 w-4 mr-2" />
            Abbrechen
          </Button>
          <Button 
            className="flex-1" 
            onClick={handleSave}
          >
            <Save className="h-4 w-4 mr-2" />
            Änderungen speichern
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
