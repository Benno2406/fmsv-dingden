import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";
import { Textarea } from "../../components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Separator } from "../../components/ui/separator";
import { 
  Plane,
  Clock,
  Users,
  Plus,
  Download,
  Edit,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Zap,
  Radio,
  ShieldCheck,
  GraduationCap,
  TrendingUp,
  Award,
  Target,
  Wind,
  CloudRain,
  Sun,
  Calendar,
  BookOpen,
  CheckCircle2,
  Trophy,
  ChevronsUpDown,
  Check,
  X,
  UserPlus
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { cn } from "../../components/ui/utils";
import { FlightStartDialog } from "../../components/FlightStartDialog";
import { useAuth } from "../../contexts/AuthContext";

// Mock-Daten für Flugschüler
const mockStudents = [
  { id: 1, name: "Max Mustermann" },
  { id: 2, name: "Thomas Müller" },
  { id: 3, name: "Anna Schmidt" },
  { id: 4, name: "Klaus Fischer" },
  { id: 5, name: "Lisa Hoffmann" },
];

// Mock flight data
const mockFlights = [
  { 
    id: 1, 
    date: '23.10.2025', 
    startTime: '14:20', 
    endTime: '15:05', 
    duration: '45 min', 
    motorTypes: ['Elektro'], 
    frequencies: ['2,4 GHz'],
    notes: '',
    type: 'solo', // solo, training, practice
    instructor: null,
    trainingGoal: null,
    studentName: null
  },
  { 
    id: 2, 
    date: '23.10.2025', 
    startTime: '10:30', 
    endTime: '11:15', 
    duration: '45 min', 
    motorTypes: ['Elektro', 'Verbrenner'], 
    frequencies: ['2,4 GHz', '35 MHz (K75)'],
    notes: '',
    type: 'training',
    instructor: 'Hans Schmidt',
    trainingGoal: 'Kurvenflug & Landeanflug',
    flightNumber: 18,
    studentName: 'Max Mustermann'
  },
  { 
    id: 3, 
    date: '22.10.2025', 
    startTime: '15:30', 
    endTime: '16:15', 
    duration: '45 min', 
    motorTypes: ['Verbrenner'], 
    frequencies: ['35 MHz (K75)'],
    notes: '',
    type: 'training',
    instructor: 'Hans Schmidt',
    trainingGoal: 'Start- und Landeübungen',
    flightNumber: 17,
    studentName: 'Max Mustermann'
  },
  { 
    id: 4, 
    date: '20.10.2025', 
    startTime: '13:10', 
    endTime: '13:35', 
    duration: '25 min', 
    motorTypes: ['Elektro'], 
    frequencies: ['2,4 GHz'],
    notes: 'Modell bei Landung beschädigt, Reparatur erforderlich',
    type: 'solo',
    instructor: null,
    trainingGoal: null,
    studentName: null
  },
];

export function FlugbuchPage() {
  const { hasRole } = useAuth();
  
  const [flightDialogOpen, setFlightDialogOpen] = useState(false);
  const [editFlightDialogOpen, setEditFlightDialogOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  
  // Edit Flight States
  const [editEndTime, setEditEndTime] = useState("");
  const [editIsElektro, setEditIsElektro] = useState(false);
  const [editIsVerbrenner, setEditIsVerbrenner] = useState(false);
  const [editIs24GHz, setEditIs24GHz] = useState(false);
  const [editIs35MHz, setEditIs35MHz] = useState(false);
  const [editChannel, setEditChannel] = useState("");
  const [editNotes, setEditNotes] = useState("");
  
  // Flugschüler Edit States
  type EditFlugschueler = {
    id: string;
    type: "mitglied" | "gast";
    name: string;
    email?: string;
    phone?: string;
  };
  const [editIsFlugschueler, setEditIsFlugschueler] = useState(false);
  const [editFlugschuelerListe, setEditFlugschuelerListe] = useState<EditFlugschueler[]>([]);
  const [editSchuelerType, setEditSchuelerType] = useState<"mitglied" | "gast">("mitglied");
  const [editSelectedMember, setEditSelectedMember] = useState<string>("");
  const [editMemberSearchOpen, setEditMemberSearchOpen] = useState(false);
  const [editGuestName, setEditGuestName] = useState("");
  const [editGuestEmail, setEditGuestEmail] = useState("");
  const [editGuestPhone, setEditGuestPhone] = useState("");

  // Filter States
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterElektro, setFilterElektro] = useState(false);
  const [filterVerbrenner, setFilterVerbrenner] = useState(false);
  const [filterWithNotes, setFilterWithNotes] = useState<'all' | 'yes' | 'no'>('all');
  
  // Pagination State
  const [currentMonth, setCurrentMonth] = useState("2025-10");

  // PDF Export States
  const [pdfExportOpen, setPdfExportOpen] = useState(false);
  const [pdfExportPeriod, setPdfExportPeriod] = useState<'current' | 'multiple' | 'year' | 'filtered'>('current');
  const [pdfStartMonth, setPdfStartMonth] = useState("");
  const [pdfEndMonth, setPdfEndMonth] = useState("");
  const [pdfYear, setPdfYear] = useState("");
  const [pdfOnlyIncidents, setPdfOnlyIncidents] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  // Initialize edit form when selectedFlight changes
  useEffect(() => {
    if (editFlightDialogOpen && selectedFlight) {
      setEditEndTime(selectedFlight.endTime || "");
      setEditIsElektro(selectedFlight.motorTypes?.includes('Elektro') || false);
      setEditIsVerbrenner(selectedFlight.motorTypes?.includes('Verbrenner') || false);
      setEditIs24GHz(selectedFlight.frequencies?.includes('2,4 GHz') || false);
      setEditIs35MHz(selectedFlight.frequencies?.some((f: string) => f.includes('35 MHz')) || false);
      setEditChannel(selectedFlight.frequencies?.find((f: string) => f.includes('35 MHz'))?.match(/\d+/)?.[0] || "");
      setEditNotes(selectedFlight.notes || "");
      
      // Load Flugschüler if present (convert old format to new format)
      if (selectedFlight.studentName) {
        setEditFlugschuelerListe([{
          id: `member-${Date.now()}`,
          type: "mitglied",
          name: selectedFlight.studentName,
        }]);
      } else {
        setEditFlugschuelerListe([]);
      }
      
      // Reset add-student form
      setEditSelectedMember("");
      setEditGuestName("");
      setEditGuestEmail("");
      setEditGuestPhone("");
    }
  }, [editFlightDialogOpen, selectedFlight]);

  const handleEditFlight = (flight: any) => {
    setSelectedFlight(flight);
    setEditFlightDialogOpen(true);
  };

  // Handler to add Flugschüler in edit dialog
  const handleAddEditFlugschueler = () => {
    if (editSchuelerType === "mitglied") {
      if (!editSelectedMember) {
        alert("Bitte wähle ein Mitglied aus.");
        return;
      }
      
      // Check if member already added
      if (editFlugschuelerListe.some(s => s.type === "mitglied" && s.id === editSelectedMember)) {
        alert("Dieses Mitglied wurde bereits hinzugefügt.");
        return;
      }
      
      const member = mockStudents.find(m => m.id.toString() === editSelectedMember);
      if (member) {
        setEditFlugschuelerListe([...editFlugschuelerListe, {
          id: editSelectedMember,
          type: "mitglied",
          name: member.name,
        }]);
        setEditSelectedMember("");
      }
    } else {
      // Gast
      if (!editGuestName.trim()) {
        alert("Bitte gib den Namen des Gastes ein.");
        return;
      }
      if (!editGuestEmail.trim() && !editGuestPhone.trim()) {
        alert("Bitte gib mindestens E-Mail oder Telefon des Gastes an.");
        return;
      }
      
      setEditFlugschuelerListe([...editFlugschuelerListe, {
        id: `gast-${Date.now()}`,
        type: "gast",
        name: editGuestName,
        email: editGuestEmail,
        phone: editGuestPhone,
      }]);
      
      // Reset Gast-Felder
      setEditGuestName("");
      setEditGuestEmail("");
      setEditGuestPhone("");
    }
  };
  
  // Handler to remove Flugschüler in edit dialog
  const handleRemoveEditFlugschueler = (id: string) => {
    setEditFlugschuelerListe(editFlugschuelerListe.filter(s => s.id !== id));
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Flug bearbeitet:", {
      ...selectedFlight,
      endTime: editEndTime,
      motorTypes: [editIsElektro && 'Elektro', editIsVerbrenner && 'Verbrenner'].filter(Boolean),
      frequencies: [
        editIs24GHz && '2,4 GHz',
        editIs35MHz && `35 MHz (K${editChannel})`
      ].filter(Boolean),
      notes: editNotes,
      flugschueler: editFlugschuelerListe
    });
    setEditFlightDialogOpen(false);
  };

  const handleApplyFilter = () => {
    console.log("Filter anwenden:", {
      dateFrom: filterDateFrom,
      dateTo: filterDateTo,
      elektro: filterElektro,
      verbrenner: filterVerbrenner,
      withNotes: filterWithNotes
    });
    setFilterOpen(false);
  };

  const handleResetFilter = () => {
    setFilterDateFrom("");
    setFilterDateTo("");
    setFilterElektro(false);
    setFilterVerbrenner(false);
    setFilterWithNotes('all');
  };

  const handlePdfExport = () => {
    setIsPdfGenerating(true);
    console.log("PDF Export:", {
      period: pdfExportPeriod,
      startMonth: pdfStartMonth,
      endMonth: pdfEndMonth,
      year: pdfYear,
      onlyIncidents: pdfOnlyIncidents
    });
    
    setTimeout(() => {
      setIsPdfGenerating(false);
      setPdfExportOpen(false);
      alert("PDF wurde erfolgreich erstellt!");
    }, 2000);
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
  };

  const availableMonths = ['2025-10', '2025-09', '2025-08', '2025-07', '2025-06', '2025-05'];
  const filteredFlights = mockFlights;

  // Helper function to determine header background with color segments
  const getFlightHeaderStyle = (flight: any) => {
    // No background colors - clean header
    return {};
  };

  // Helper function to get icon background color based on priority
  const getFlightIconColor = (flight: any) => {
    // Priority 1: Vorfälle -> Rot
    if (flight.notes) {
      return {
        bg: 'bg-warning-light',
        icon: 'text-warning'
      };
    }
    
    // Priority 2: Flugschüler -> Lila
    if (flight.studentName) {
      return {
        bg: 'bg-training-light',
        icon: 'text-training'
      };
    }
    
    // Priority 3: Verbrennerantrieb -> Orange
    if (flight.motorTypes?.includes('Verbrenner')) {
      return {
        bg: 'bg-guest-light',
        icon: 'text-guest'
      };
    }
    
    // Priority 4: Elektroantrieb -> Grün
    if (flight.motorTypes?.includes('Elektro')) {
      return {
        bg: 'bg-success-light',
        icon: 'text-success'
      };
    }
    
    // Default: Primary color
    return {
      bg: 'bg-primary/10',
      icon: 'text-primary'
    };
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2">Mein Flugbuch</h2>
        <p className="text-muted-foreground">
          Hier kannst du deine Flüge eintragen und deine Flugstatistiken einsehen.
        </p>
      </div>

      {/* Anwesenheit am Platz */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <CardTitle>Am Platz anwesend</CardTitle>
            </div>
            <Button className="gap-2" onClick={() => setFlightDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Flug eintragen
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            <AccordionItem value="attendance" className="border-none">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-8 w-8 text-green-600 dark:text-green-500" />
                    <div className="text-left">
                      <div>5 Personen am Platz</div>
                      <div className="text-muted-foreground" style={{ fontSize: '0.875rem', fontWeight: 'var(--font-weight-normal)' }}>
                        1 Flugleiter • 1 Stellv. • 1 Fluglehrer • 2 Flugschüler • 2 Mitglieder
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-4">
                  {/* Flugleiter Bereich */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                      <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                      <h4 className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>Verantwortliche Flugleiter</h4>
                    </div>
                    
                    <div className="grid gap-2 sm:grid-cols-2">
                      {/* Hauptflugleiter */}
                      <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-flugleiter bg-flugleiter-light">
                        <div className="h-10 w-10 rounded-full bg-flugleiter flex items-center justify-center shrink-0">
                          <ShieldCheck className="h-5 w-5 text-flugleiter-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold">Klaus Müller</span>
                        </div>
                      </div>

                      {/* Stellvertretender Flugleiter */}
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span>Peter Wagner</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Piloten am Platz */}
                  <div>
                    <h4 className="mb-3 text-muted-foreground" style={{ fontSize: '0.875rem' }}>Aktive Piloten</h4>
                    <div className="space-y-1">
                      {/* Fluglehrer mit Schülern */}
                      <Collapsible className="space-y-1">
                        {/* Fluglehrer - ganze Card ist klickbar */}
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center gap-3 p-4 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="relative flex items-center justify-center">
                                <div className="h-10 w-10 rounded-full bg-training-light flex items-center justify-center">
                                  <GraduationCap className="h-5 w-5 text-training" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-success border-2 border-background" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4>Hans Schmidt</h4>
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span style={{ fontSize: '0.875rem' }}>Am Platz seit 14:10 Uhr</span>
                                </div>
                              </div>
                              <Badge variant="outline" className="gap-1 ml-auto" style={{ fontSize: '0.65rem' }}>
                                <Users className="h-3 w-3" />
                                2 Flugschüler
                              </Badge>
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        
                        {/* Flugschüler */}
                        <CollapsibleContent>
                          <div className="ml-7 pl-6 border-l-2 border-purple-200 dark:border-purple-900 space-y-1 pt-1">
                            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                <span style={{ fontSize: '0.875rem' }}>TW</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span style={{ fontSize: '0.9375rem' }}>Thomas Weber</span>
                                  <Badge variant="outline" style={{ fontSize: '0.65rem' }}>Flugschüler</Badge>
                                  <span className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>• Mitglied</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                <span style={{ fontSize: '0.875rem' }}>JM</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span style={{ fontSize: '0.9375rem' }}>Julia Meier</span>
                                  <Badge variant="outline" style={{ fontSize: '0.65rem' }}>Flugschüler</Badge>
                                  <span className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>• Gast</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      {/* Normale Mitglieder */}
                      <div className="flex items-center gap-3 p-4 rounded-lg hover:bg-muted/50 transition-colors group">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="relative flex items-center justify-center">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span>MM</span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-success border-2 border-background" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">Max Mustermann (Du)</h4>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                              <Clock className="h-3.5 w-3.5" />
                              <span style={{ fontSize: '0.875rem' }}>Am Platz seit 14:23 Uhr</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 rounded-lg hover:bg-muted/50 transition-colors group">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="relative flex items-center justify-center">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                              <span>PW</span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-success border-2 border-background" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4>Peter Wagner</h4>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                              <Clock className="h-3.5 w-3.5" />
                              <span style={{ fontSize: '0.875rem' }}>Am Platz seit 14:20 Uhr</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Statistik-Übersicht */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Deine Flugstatistik 2025</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-6 text-center hover:border-primary/20 transition-colors">
                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                  <Plane className="h-4 w-4" />
                  <p>Gesamtflugtage</p>
                </div>
                <p className="text-3xl">127</p>
              </div>
              <div className="rounded-lg border p-6 text-center hover:border-primary/20 transition-colors">
                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                  <Clock className="h-4 w-4" />
                  <p>Gesamtflugzeit</p>
                </div>
                <p className="text-3xl">42.5h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Flugtage pro Monat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[120px] flex items-end justify-between gap-2">
              {[12, 8, 15, 22, 18, 25].map((value, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-primary rounded-t transition-all hover:opacity-80 cursor-pointer"
                    style={{ height: `${(value / 25) * 100}%` }}
                  />
                  <span className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                    {['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun'][index]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flugtage Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Flugtage {formatMonth(currentMonth)}</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => setFilterOpen(true)}
              >
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={() => setPdfExportOpen(true)}
              >
                <Download className="h-4 w-4" />
                PDF Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Flights List */}
          <div className="space-y-4">
            {filteredFlights.map((flight, index) => (
              <div key={flight.id}>
                {/* Flight Card */}
                <div className="rounded-lg border-2 border-border bg-card overflow-hidden hover:shadow-md transition-all">
                  {/* Card Header with Dynamic Color */}
                  <div 
                    className="px-4 py-3 border-b flex items-center justify-between"
                    style={getFlightHeaderStyle(flight)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full ${getFlightIconColor(flight).bg} flex items-center justify-center`}>
                        <Plane className={`h-5 w-5 ${getFlightIconColor(flight).icon}`} />
                      </div>
                      <div>
                        <h4>{flight.date}</h4>
                        <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                          {flight.startTime} - {flight.endTime} Uhr • {flight.duration}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditFlight(flight)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-3">
                    {/* Flight Details */}
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-muted-foreground mb-2" style={{ fontSize: '0.75rem' }}>Antriebsart</p>
                        <div className="flex gap-2 flex-wrap">
                          {flight.motorTypes.map((type, idx) => (
                            <Badge key={idx} variant="secondary" className="gap-1">
                              <Zap className="h-3 w-3" />
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-2" style={{ fontSize: '0.75rem' }}>Fernsteuerung</p>
                        <div className="flex gap-2 flex-wrap">
                          {flight.frequencies.map((freq, idx) => (
                            <Badge key={idx} variant="outline" className="gap-1">
                              <Radio className="h-3 w-3" />
                              {freq}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Notes/Incidents */}
                    {flight.notes && (
                      <div className="pt-3 border-t">
                        <div className="flex items-start gap-2 text-orange-600 dark:text-orange-500">
                          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="mb-1" style={{ fontSize: '0.75rem' }}>Vorkommnis</p>
                            <p style={{ fontSize: '0.875rem' }}>{flight.notes}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Student Assignment */}
                    {flight.studentName && (
                      <div className="pt-3 border-t">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <p style={{ fontSize: '0.875rem' }}>
                            Zugeteilter Flugschüler: <span className="text-foreground">{flight.studentName}</span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
              {filteredFlights.length} Flugtage
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const currentIndex = availableMonths.indexOf(currentMonth);
                  if (currentIndex < availableMonths.length - 1) {
                    setCurrentMonth(availableMonths[currentIndex + 1]);
                  }
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const currentIndex = availableMonths.indexOf(currentMonth);
                  if (currentIndex > 0) {
                    setCurrentMonth(availableMonths[currentIndex - 1]);
                  }
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flight Start Dialog */}
      <FlightStartDialog 
        open={flightDialogOpen} 
        onOpenChange={setFlightDialogOpen}
      />

      {/* Edit Flight Dialog */}
      <Dialog open={editFlightDialogOpen} onOpenChange={setEditFlightDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Flug bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeite die Details deines Flugbuch-Eintrags
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-6 py-4">
            {/* Flugschüler Checkbox */}
            <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-dashed hover:border-primary/50 transition-colors">
              <Checkbox
                id="edit-flugschueler"
                checked={editIsFlugschueler}
                onCheckedChange={(checked) => {
                  setEditIsFlugschueler(checked === true);
                  if (!checked) {
                    setEditFlugschuelerListe([]);
                  }
                }}
              />
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <Label 
                  htmlFor="edit-flugschueler" 
                  className="font-normal cursor-pointer"
                >
                  Flug mit Flugschüler
                </Label>
              </div>
            </div>

            {/* FLUGSCHÜLER DETAILS */}
            {editIsFlugschueler && (
              <>
                <Separator />

                {/* Flugschüler-Verwaltung */}
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
              
              {/* Tabs zum Hinzufügen von Flugschülern */}
              <Tabs value={editSchuelerType} onValueChange={(v) => setEditSchuelerType(v as "mitglied" | "gast")}>
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
                          <Popover open={editMemberSearchOpen} onOpenChange={setEditMemberSearchOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                role="combobox"
                                aria-expanded={editMemberSearchOpen}
                                className="flex-1 justify-between"
                              >
                                {editSelectedMember
                                  ? mockStudents.find((m) => m.id.toString() === editSelectedMember)?.name
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
                                    {mockStudents.map((member) => (
                                      <CommandItem
                                        key={member.id}
                                        value={member.name}
                                        onSelect={() => {
                                          setEditSelectedMember(member.id.toString());
                                          setEditMemberSearchOpen(false);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            editSelectedMember === member.id.toString() ? "opacity-100" : "opacity-0"
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
                            onClick={handleAddEditFlugschueler}
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
                        <Label htmlFor="edit-guest-name">Name des Gastes</Label>
                        <Input
                          id="edit-guest-name"
                          type="text"
                          placeholder="Vor- und Nachname"
                          value={editGuestName}
                          onChange={(e) => setEditGuestName(e.target.value)}
                        />
                      </div>
                      
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="edit-guest-email">E-Mail</Label>
                          <Input
                            id="edit-guest-email"
                            type="email"
                            placeholder="gast@beispiel.de"
                            value={editGuestEmail}
                            onChange={(e) => setEditGuestEmail(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="edit-guest-phone">Telefon</Label>
                          <Input
                            id="edit-guest-phone"
                            type="tel"
                            placeholder="0172 1234567"
                            value={editGuestPhone}
                            onChange={(e) => setEditGuestPhone(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <Button
                        type="button"
                        onClick={handleAddEditFlugschueler}
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
              {editFlugschuelerListe.length > 0 && (
                <>
                  <Separator />
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Hinzugefügte Flugschüler ({editFlugschuelerListe.length})</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditFlugschuelerListe([])}
                        className="h-8 text-muted-foreground hover:text-destructive"
                      >
                        Alle entfernen
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {editFlugschuelerListe.map((schueler) => (
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
                            onClick={() => handleRemoveEditFlugschueler(schueler.id)}
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

            {/* Endzeit */}
            <div className="space-y-2">
              <Label htmlFor="edit-endtime">Endzeit *</Label>
              <Input
                id="edit-endtime"
                type="time"
                value={editEndTime}
                onChange={(e) => setEditEndTime(e.target.value)}
                required
              />
            </div>

            <Separator />

            {/* 2-SPALTEN LAYOUT FÜR ANTRIEBSART UND FERNSTEUERUNG */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* ANTRIEBSART */}
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
                        id="edit-elektro"
                        checked={editIsElektro}
                        onCheckedChange={(checked) => setEditIsElektro(checked === true)}
                      />
                      <Label htmlFor="edit-elektro" className="font-normal cursor-pointer flex-1">
                        Elektroflug
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                      <Checkbox
                        id="edit-verbrenner"
                        checked={editIsVerbrenner}
                        onCheckedChange={(checked) => setEditIsVerbrenner(checked === true)}
                      />
                      <Label htmlFor="edit-verbrenner" className="font-normal cursor-pointer flex-1">
                        Verbrennerflug
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FERNSTEUERUNG */}
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
                        id="edit-frequency-24ghz"
                        checked={editIs24GHz}
                        onCheckedChange={(checked) => setEditIs24GHz(checked === true)}
                      />
                      <Label
                        htmlFor="edit-frequency-24ghz"
                        className="font-normal cursor-pointer flex-1"
                      >
                        2,4 GHz
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                      <Checkbox
                        id="edit-frequency-35mhz"
                        checked={editIs35MHz}
                        onCheckedChange={(checked) => {
                          setEditIs35MHz(checked === true);
                          if (!checked) {
                            setEditChannel("");
                          }
                        }}
                      />
                      <Label
                        htmlFor="edit-frequency-35mhz"
                        className="font-normal cursor-pointer flex-1"
                      >
                        35 MHz
                      </Label>
                    </div>
                    
                    {editIs35MHz && (
                      <div className="space-y-2 pt-2">
                        <Label htmlFor="edit-channel">Kanal *</Label>
                        <Input
                          id="edit-channel"
                          type="text"
                          placeholder="z.B. 75"
                          value={editChannel}
                          onChange={(e) => setEditChannel(e.target.value)}
                          required={editIs35MHz}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* Vorkommnisse */}
            <div className="space-y-3">
              <Label htmlFor="edit-notes">⚠️ Schäden / Versicherungsrelevante Vorkommnisse</Label>
              <Textarea
                id="edit-notes"
                placeholder="Nur ausfüllen bei: Beschädigung an Vereinseigentum, Umweltschäden, Unfälle oder sonstige versicherungsrelevante Ereignisse"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={3}
              />
              <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                ⚠️ Dieses Feld ist nur für Schäden und versicherungsrelevante Vorfälle gedacht.
              </p>
            </div>

            <DialogFooter>
              <Button 
                type="button"
                variant="outline" 
                onClick={() => setEditFlightDialogOpen(false)}
              >
                Abbrechen
              </Button>
              <Button type="submit">
                Speichern
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Flugtage filtern</DialogTitle>
            <DialogDescription>
              Filtere deine Flugtage nach verschiedenen Kriterien
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Zeitraum */}
            <div className="space-y-3">
              <Label>Zeitraum</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="filter-date-from">Von</Label>
                  <Input
                    id="filter-date-from"
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filter-date-to">Bis</Label>
                  <Input
                    id="filter-date-to"
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Antriebsart */}
            <div className="space-y-3">
              <Label>Antriebsart</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 rounded-lg border p-4">
                  <Checkbox
                    id="filter-elektro"
                    checked={filterElektro}
                    onCheckedChange={(checked) => setFilterElektro(checked === true)}
                  />
                  <Label htmlFor="filter-elektro" className="font-normal cursor-pointer">
                    Elektroflug
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-lg border p-4">
                  <Checkbox
                    id="filter-verbrenner"
                    checked={filterVerbrenner}
                    onCheckedChange={(checked) => setFilterVerbrenner(checked === true)}
                  />
                  <Label htmlFor="filter-verbrenner" className="font-normal cursor-pointer">
                    Verbrennerflug
                  </Label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Vorkommnisse */}
            <div className="space-y-3">
              <Label>Vorkommnisse</Label>
              <RadioGroup value={filterWithNotes} onValueChange={(value) => setFilterWithNotes(value as any)}>
                <div className="flex items-center space-x-2 rounded-lg border p-4">
                  <RadioGroupItem value="all" id="filter-notes-all" />
                  <Label htmlFor="filter-notes-all" className="font-normal cursor-pointer flex-1">
                    Alle Flugtage
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-lg border p-4">
                  <RadioGroupItem value="yes" id="filter-notes-yes" />
                  <Label htmlFor="filter-notes-yes" className="font-normal cursor-pointer flex-1">
                    Nur mit Vorkommnissen
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-lg border p-4">
                  <RadioGroupItem value="no" id="filter-notes-no" />
                  <Label htmlFor="filter-notes-no" className="font-normal cursor-pointer flex-1">
                    Ohne Vorkommnisse
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleResetFilter}>
              Zurücksetzen
            </Button>
            <Button onClick={handleApplyFilter}>
              Filter anwenden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PDF Export Dialog */}
      <Dialog open={pdfExportOpen} onOpenChange={setPdfExportOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Flugbuch als PDF exportieren</DialogTitle>
            <DialogDescription>
              Wähle den Zeitraum und die Optionen für deinen PDF-Export.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Zeitraum-Auswahl */}
            <div className="space-y-3">
              <Label>Zeitraum</Label>
              <RadioGroup value={pdfExportPeriod} onValueChange={(value) => setPdfExportPeriod(value as any)}>
                <div className="flex items-center gap-2 rounded-lg border p-4">
                  <RadioGroupItem value="current" id="pdf-current" />
                  <Label htmlFor="pdf-current" className="cursor-pointer flex-1">
                    <span className="block mb-1">Aktueller Monat</span>
                    <span className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                      {formatMonth(currentMonth)}
                    </span>
                  </Label>
                </div>

                <div className="flex items-center gap-2 rounded-lg border p-4">
                  <RadioGroupItem value="year" id="pdf-year" />
                  <Label htmlFor="pdf-year" className="cursor-pointer flex-1">
                    <span className="block mb-1">Ganzes Jahr</span>
                    <span className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                      Alle Flugtage eines Jahres
                    </span>
                  </Label>
                </div>

                <div className="flex items-center gap-2 rounded-lg border p-4">
                  <RadioGroupItem value="filtered" id="pdf-filtered" />
                  <Label htmlFor="pdf-filtered" className="cursor-pointer flex-1">
                    <span className="block mb-1">Gefilterte Ansicht</span>
                    <span className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                      Aktuell gefilterte Flugtage ({filteredFlights.length} Flugtage)
                    </span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Jahr-Auswahl bei "Ganzes Jahr" */}
            {pdfExportPeriod === 'year' && (
              <div className="space-y-2 p-4 border rounded-lg bg-muted/30">
                <Label htmlFor="pdf-year-select">Jahr auswählen</Label>
                <Select value={pdfYear} onValueChange={setPdfYear}>
                  <SelectTrigger id="pdf-year-select">
                    <SelectValue placeholder="Jahr wählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Separator />

            {/* Optionen */}
            <div className="space-y-3">
              <Label>Optionen</Label>
              <div className="flex items-center space-x-2 rounded-lg border p-4">
                <Checkbox
                  id="pdf-only-incidents"
                  checked={pdfOnlyIncidents}
                  onCheckedChange={(checked) => setPdfOnlyIncidents(checked === true)}
                />
                <Label htmlFor="pdf-only-incidents" className="font-normal cursor-pointer">
                  Nur Flugtage mit Vorkommnissen exportieren
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPdfExportOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handlePdfExport} disabled={isPdfGenerating}>
              {isPdfGenerating ? "PDF wird erstellt..." : "PDF erstellen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
