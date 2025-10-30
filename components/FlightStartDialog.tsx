import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent } from "./ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { GraduationCap, Users, UserPlus, ChevronsUpDown, Check, Plus, X, Zap, Radio } from "lucide-react";
import { cn } from "./ui/utils";
import { Badge } from "./ui/badge";

interface FlightStartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock-Daten für Mitglieder (später aus API)
const mockMembers = [
  { id: 1, name: "Thomas Müller" },
  { id: 2, name: "Anna Schmidt" },
  { id: 3, name: "Klaus Fischer" },
  { id: 4, name: "Lisa Hoffmann" },
  { id: 5, name: "Sandra Becker" },
  { id: 6, name: "Michael Braun" },
  { id: 7, name: "Peter Wagner" },
  { id: 8, name: "Julia Schneider" },
];

export function FlightStartDialog({ open, onOpenChange }: FlightStartDialogProps) {
  const [isElektro, setIsElektro] = useState(false);
  const [isVerbrenner, setIsVerbrenner] = useState(false);
  const [is24GHz, setIs24GHz] = useState(false);
  const [is35MHz, setIs35MHz] = useState(false);
  const [channel, setChannel] = useState("");
  
  // Flugschüler-States
  const [isFlugschueler, setIsFlugschueler] = useState(false);
  const [schuelerType, setSchuelerType] = useState<"mitglied" | "gast">("mitglied");
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [memberSearchOpen, setMemberSearchOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  
  // Liste der hinzugefügten Flugschüler
  type Flugschueler = {
    id: string;
    type: "mitglied" | "gast";
    name: string;
    email?: string;
    phone?: string;
  };
  const [flugschuelerListe, setFlugschuelerListe] = useState<Flugschueler[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mindestens eine Antriebsart muss ausgewählt sein
    if (!isElektro && !isVerbrenner) {
      alert("Bitte wähle mindestens eine Antriebsart aus.");
      return;
    }
    
    // Mindestens eine Fernsteuerungsvariante muss ausgewählt sein
    if (!is24GHz && !is35MHz) {
      alert("Bitte wähle mindestens eine Fernsteuerungsvariante aus.");
      return;
    }
    
    // Wenn 35 MHz ausgewählt ist, muss ein Kanal angegeben werden
    if (is35MHz && !channel.trim()) {
      alert("Bitte gib einen Kanal für 35 MHz an.");
      return;
    }
    
    // Flugschüler-Validierung
    if (isFlugschueler && flugschuelerListe.length === 0) {
      alert("Bitte füge mindestens einen Flugschüler hinzu.");
      return;
    }
    
    // Hier würde später die Backend-Logik kommen
    const antriebsarten = [];
    if (isElektro) antriebsarten.push("Elektro");
    if (isVerbrenner) antriebsarten.push("Verbrenner");
    
    const fernsteuerung = [];
    if (is24GHz) fernsteuerung.push("2,4 GHz");
    if (is35MHz) fernsteuerung.push(`35 MHz (Kanal ${channel})`);
    
    const flugData: any = {
      pilot: "Max Mustermann",
      antriebsart: antriebsarten,
      fernsteuerung: fernsteuerung,
      isFlugschueler,
      flugschueler: isFlugschueler ? flugschuelerListe : [],
    };
    
    console.log("Flug gestartet:", flugData);
    
    // Reset form
    setIsFlugschueler(false);
    setFlugschuelerListe([]);
    setSelectedMember("");
    setGuestName("");
    setGuestEmail("");
    setGuestPhone("");
    
    onOpenChange(false);
  };
  
  // Flugschüler hinzufügen
  const handleAddFlugschueler = () => {
    if (schuelerType === "mitglied") {
      if (!selectedMember) {
        alert("Bitte wähle ein Mitglied aus.");
        return;
      }
      
      // Prüfe ob Mitglied bereits hinzugefügt wurde
      if (flugschuelerListe.some(s => s.type === "mitglied" && s.id === selectedMember)) {
        alert("Dieses Mitglied wurde bereits hinzugefügt.");
        return;
      }
      
      const member = mockMembers.find(m => m.id.toString() === selectedMember);
      if (member) {
        setFlugschuelerListe([...flugschuelerListe, {
          id: selectedMember,
          type: "mitglied",
          name: member.name,
        }]);
        setSelectedMember("");
      }
    } else {
      // Gast
      if (!guestName.trim()) {
        alert("Bitte gib den Namen des Gastes ein.");
        return;
      }
      if (!guestEmail.trim() && !guestPhone.trim()) {
        alert("Bitte gib mindestens E-Mail oder Telefon des Gastes an.");
        return;
      }
      
      setFlugschuelerListe([...flugschuelerListe, {
        id: `gast-${Date.now()}`,
        type: "gast",
        name: guestName,
        email: guestEmail,
        phone: guestPhone,
      }]);
      
      // Reset Gast-Felder
      setGuestName("");
      setGuestEmail("");
      setGuestPhone("");
    }
  };
  
  // Flugschüler entfernen
  const handleRemoveFlugschueler = (id: string) => {
    setFlugschuelerListe(flugschuelerListe.filter(s => s.id !== id));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Flugbuch Eintrag hinzufügen</DialogTitle>
          <DialogDescription>
            Trage deinen Flug ins Flugbuch ein. Bitte gib alle erforderlichen Informationen an. Die Startzeit wird automatisch beim Klick auf "Eintragen" erfasst, die Endzeit beim Klick auf "Austragen". Sollte das Austragen vergessen werden, erfolgt dies automatisch am Tageswechsel.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* 1. PILOT */}
          <div className="space-y-3">
            <Label>Pilot</Label>
            <div className="rounded-lg border bg-muted/50 px-4 py-3">
              <p>Max Mustermann</p>
            </div>
            <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>
              Dein Name wurde automatisch aus deinem Login übernommen
            </p>
          </div>

          {/* Flugschüler Checkbox */}
          <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-dashed hover:border-primary/50 transition-colors">
            <Checkbox
              id="flugschueler"
              checked={isFlugschueler}
              onCheckedChange={(checked) => setIsFlugschueler(checked === true)}
            />
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <Label 
                htmlFor="flugschueler" 
                className="font-normal cursor-pointer"
              >
                Flug mit Flugschüler
              </Label>
            </div>
          </div>

          {/* FLUGSCHÜLER DETAILS */}
          {isFlugschueler && (
            <>
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-6 w-6 text-primary" />
                  <div>
                    <Label className="text-base">Flugschüler</Label>
                    <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                      Mitglied oder Gast auswählen
                    </p>
                  </div>
                </div>
                
                <Tabs value={schuelerType} onValueChange={(v) => setSchuelerType(v as "mitglied" | "gast")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="mitglied" className="gap-2">
                      <Users className="h-4 w-4" />
                      Mitglied
                    </TabsTrigger>
                    <TabsTrigger value="gast" className="gap-2">
                      <UserPlus className="h-4 w-4" />
                      Gast
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Mitglied Tab */}
                  <TabsContent value="mitglied" className="mt-4">
                    <Card>
                      <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                          <Label>Vereinsmitglied auswählen</Label>
                          <div className="flex gap-2">
                            <Popover open={memberSearchOpen} onOpenChange={setMemberSearchOpen}>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={memberSearchOpen}
                                  className="flex-1 justify-between"
                                >
                                  {selectedMember
                                    ? mockMembers.find((member) => member.id.toString() === selectedMember)?.name
                                    : "Mitglied suchen..."}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[400px] p-0" align="start">
                                <Command>
                                  <CommandInput placeholder="Mitglied suchen..." />
                                  <CommandList>
                                    <CommandEmpty>Kein Mitglied gefunden.</CommandEmpty>
                                    <CommandGroup>
                                      {mockMembers.map((member) => (
                                        <CommandItem
                                          key={member.id}
                                          value={member.name}
                                          onSelect={() => {
                                            setSelectedMember(member.id.toString());
                                            setMemberSearchOpen(false);
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              selectedMember === member.id.toString() ? "opacity-100" : "opacity-0"
                                            )}
                                          />
                                          {member.name}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                            <Button
                              type="button"
                              onClick={handleAddFlugschueler}
                              className="gap-2"
                            >
                              <Plus className="h-4 w-4" />
                              Hinzufügen
                            </Button>
                          </div>
                          <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                            Durchsuche die Mitgliederliste und füge Flugschüler hinzu
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Gast Tab */}
                  <TabsContent value="gast" className="mt-4">
                    <Card>
                      <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="guest-name">Name des Gastes</Label>
                          <Input
                            id="guest-name"
                            type="text"
                            placeholder="Vor- und Nachname"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                          />
                        </div>
                        
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="guest-email">E-Mail</Label>
                            <Input
                              id="guest-email"
                              type="email"
                              placeholder="gast@beispiel.de"
                              value={guestEmail}
                              onChange={(e) => setGuestEmail(e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="guest-phone">Telefon</Label>
                            <Input
                              id="guest-phone"
                              type="tel"
                              placeholder="0172 1234567"
                              value={guestPhone}
                              onChange={(e) => setGuestPhone(e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <Button
                          type="button"
                          onClick={handleAddFlugschueler}
                          className="w-full gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Gast hinzufügen
                        </Button>
                        
                        <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                          Name und mindestens E-Mail oder Telefon erforderlich
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
                
                {/* HINZUGEFÜGTE FLUGSCHÜLER LISTE */}
                {flugschuelerListe.length > 0 && (
                  <>
                    <Separator />
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Hinzugefügte Flugschüler ({flugschuelerListe.length})</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setFlugschuelerListe([])}
                          className="h-8 text-muted-foreground hover:text-destructive"
                        >
                          Alle entfernen
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {flugschuelerListe.map((schueler) => (
                          <div
                            key={schueler.id}
                            className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                {schueler.type === "mitglied" ? (
                                  <Users className="h-4 w-4 text-primary" />
                                ) : (
                                  <UserPlus className="h-4 w-4 text-primary" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="truncate">{schueler.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {schueler.type === "mitglied" ? "Mitglied" : "Gast"}
                                  </Badge>
                                  {schueler.email && (
                                    <span className="text-muted-foreground truncate" style={{ fontSize: '0.75rem' }}>
                                      {schueler.email}
                                    </span>
                                  )}
                                  {schueler.phone && (
                                    <span className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                                      {schueler.phone}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveFlugschueler(schueler.id)}
                              className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          <Separator />

          {/* 2-SPALTEN LAYOUT FÜR ANTRIEBSART UND FERNSTEUERUNG */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* 2. ANTRIEBSART */}
            <Card className="border-2">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-6 w-6 text-blue-600 dark:text-blue-500" />
                  <div>
                    <Label className="text-base">Antriebsart *</Label>
                    <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                      Wähle die Antriebsart
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                    <Checkbox
                      id="elektro"
                      checked={isElektro}
                      onCheckedChange={(checked) => setIsElektro(checked === true)}
                    />
                    <Label htmlFor="elektro" className="font-normal cursor-pointer flex-1">
                      Elektroflug
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                    <Checkbox
                      id="verbrenner"
                      checked={isVerbrenner}
                      onCheckedChange={(checked) => setIsVerbrenner(checked === true)}
                    />
                    <Label htmlFor="verbrenner" className="font-normal cursor-pointer flex-1">
                      Verbrennerflug
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. FERNSTEUERUNG */}
            <Card className="border-2">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Radio className="h-6 w-6 text-purple-600 dark:text-purple-500" />
                  <div>
                    <Label className="text-base">Fernsteuerung *</Label>
                    <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                      Wähle die Frequenz
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                    <Checkbox
                      id="frequency-24ghz"
                      checked={is24GHz}
                      onCheckedChange={(checked) => setIs24GHz(checked === true)}
                    />
                    <Label
                      htmlFor="frequency-24ghz"
                      className="font-normal cursor-pointer flex-1"
                    >
                      2,4 GHz
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                    <Checkbox
                      id="frequency-35mhz"
                      checked={is35MHz}
                      onCheckedChange={(checked) => {
                        setIs35MHz(checked === true);
                        if (!checked) {
                          setChannel("");
                        }
                      }}
                    />
                    <Label
                      htmlFor="frequency-35mhz"
                      className="font-normal cursor-pointer flex-1"
                    >
                      35 MHz
                    </Label>
                  </div>
                  
                  {is35MHz && (
                    <div className="space-y-2 pt-2">
                      <Label htmlFor="channel">Kanal *</Label>
                      <Input
                        id="channel"
                        type="text"
                        placeholder="z.B. 75"
                        value={channel}
                        onChange={(e) => setChannel(e.target.value)}
                        required={is35MHz}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
            <Button type="submit">Eintragen</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
