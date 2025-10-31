import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Checkbox } from "../../components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { Separator } from "../../components/ui/separator";
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Clock, 
  Users, 
  Eye,
  Search,
  Filter,
  X,
  AlertTriangle,
  Ban,
  CheckCircle2,
  Wrench,
  GraduationCap,
  Trophy,
  PartyPopper,
  Building2,
  Mail,
  FileText,
  Info,
  Bell,
  BellOff,
  UserCircle,
  CalendarClock,
  FileDown,
  UserCheck
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Event-Typ mit allen Backend-Feldern
interface Event {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startDate: string; // ISO format
  endDate?: string; // ISO format
  isAllDay: boolean;
  eventType: 'schnuppertag' | 'training' | 'competition' | 'event' | 'maintenance' | 'other';
  isPublic: boolean;
  isMemberOnly: boolean;
  minParticipants?: number;
  maxParticipants?: number;
  registrationDeadline?: string;
  registrationType?: 'required' | 'desired' | 'not_required'; // Anmeldung erforderlich, erwünscht oder nicht erforderlich
  notifyMembers: boolean; // Mitglieder per E-Mail benachrichtigen
  emailTemplate?: string; // Vorlage: standard, platzpflege, wettbewerb, custom
  emailText?: string; // Benutzerdefinierter E-Mail-Text
  isCancelled: boolean;
  cancellationReason?: string;
  attendees?: number;
  createdBy: string;
  createdAt: string;
}

// Anmeldungs-Typ
interface Registration {
  id: string;
  eventId: string;
  userId: string;
  memberName: string;
  memberNumber?: string;
  email?: string;
  phone?: string;
  registeredAt: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  notes?: string;
}

// Event-Typen
const eventTypes = {
  schnuppertag: { label: 'Schnuppertag', icon: PartyPopper, color: 'bg-blue-500/10 text-blue-700 border-blue-200' },
  maintenance: { label: 'Platzpflege', icon: Wrench, color: 'bg-green-500/10 text-green-700 border-green-200' },
  training: { label: 'Schulung', icon: GraduationCap, color: 'bg-purple-500/10 text-purple-700 border-purple-200' },
  competition: { label: 'Wettbewerb', icon: Trophy, color: 'bg-orange-500/10 text-orange-700 border-orange-200' },
  event: { label: 'Veranstaltung', icon: Users, color: 'bg-pink-500/10 text-pink-700 border-pink-200' },
  other: { label: 'Sonstiges', icon: Building2, color: 'bg-gray-500/10 text-gray-700 border-gray-200' },
};

// Beschreibungs-Vorlagen
const descriptionTemplates = {
  none: {
    label: "Keine Vorlage",
    template: () => ""
  },
  schnuppertag: {
    label: "Schnuppertag",
    template: () => "Du möchtest den Modellflug kennenlernen? Komm vorbei und probiere es selbst aus! Wir zeigen dir unsere Modelle, beantworten deine Fragen und bei geeignetem Wetter kannst du auch selbst erste Flugerfahrungen sammeln. Für Jung und Alt geeignet. Keine Anmeldung erforderlich."
  },
  platzpflege: {
    label: "Platzpflege",
    template: () => "Gemeinsam machen wir unser Fluggelände fit für die Saison! Jede helfende Hand ist willkommen. Bitte bringt nach Möglichkeit Werkzeug mit (Spaten, Rechen, Motorsense, Schubkarre, etc.). Für Verpflegung ist gesorgt."
  },
  wettbewerb: {
    label: "Wettbewerb",
    template: () => "Wir freuen uns auf einen spannenden Wettbewerb mit euch! Die Anmeldung erfolgt vor Ort. Zuschauer sind herzlich willkommen. Aktuelle Informationen zum Ablauf werden rechtzeitig bekanntgegeben."
  },
  schulung: {
    label: "Schulung",
    template: () => "In dieser Schulung vermitteln wir theoretisches und praktisches Wissen rund um den Modellflug. Die Teilnehmerzahl ist begrenzt, daher ist eine Anmeldung erforderlich. Bitte beachtet die Anmeldefrist."
  },
  jhv: {
    label: "Jahreshauptversammlung",
    template: () => "Tagesordnung:\n- Bericht des Vorstands\n- Kassenbericht\n- Entlastung des Vorstands\n- Wahlen\n- Planung für das kommende Jahr\n- Verschiedenes\n\nEuer Erscheinen ist wichtig für die Zukunft unseres Vereins!"
  },
  sommerfest: {
    label: "Sommerfest / Veranstaltung",
    template: () => "Wir laden herzlich zu unserem Fest ein! Es erwarten euch Flugvorführungen, leckere Verpflegung vom Grill und ein gemütliches Beisammensein. Freunde und Familie sind herzlich willkommen. Bei schlechtem Wetter behalten wir uns eine Absage vor."
  }
};

// E-Mail-Vorlagen
const emailTemplates = {
  standard: {
    label: "Standard-Benachrichtigung",
    template: (event: Partial<Event>) => 
      `Hallo,\n\nwir möchten dich über einen neuen Termin informieren:\n\n${event.title}\n${event.description ? event.description + '\n' : ''}\nDatum: ${event.startDate ? new Date(event.startDate).toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}\nOrt: ${event.location || 'Siehe Website'}\n\nWeitere Details findest du im Mitgliederbereich.\n\nViele Grüße\nDein Flugmodellsportverein Dingden`
  },
  platzpflege: {
    label: "Platzpflege-Aufruf",
    template: (event: Partial<Event>) => 
      `Liebe Vereinsmitglieder,\n\nam ${event.startDate ? new Date(event.startDate).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''} findet unsere Platzpflege statt.\n\nWir brauchen jede helfende Hand, um unser Fluggelände in Schuss zu halten!\n\n${event.description || ''}\n\nBitte bringt nach Möglichkeit Werkzeug mit (Spaten, Rechen, Motorsense, etc.).\n\nViele Grüße\nDer Vorstand`
  },
  wettbewerb: {
    label: "Wettbewerbs-Einladung",
    template: (event: Partial<Event>) => 
      `Hallo Sportfreunde,\n\nam ${event.startDate ? new Date(event.startDate).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''} findet unser Wettbewerb statt:\n\n${event.title}\n\n${event.description || ''}\n\n${event.maxParticipants ? `Maximale Teilnehmerzahl: ${event.maxParticipants}\n` : ''}${event.registrationDeadline ? `Anmeldeschluss: ${new Date(event.registrationDeadline).toLocaleDateString('de-DE')}\n` : ''}\nWir freuen uns auf spannende Flüge!\n\nSportliche Grüße\nDas Organisationsteam`
  },
  jhv: {
    label: "Jahreshauptversammlung",
    template: (event: Partial<Event>) => 
      `Liebe Vereinsmitglieder,\n\nhiermit laden wir herzlich zur Jahreshauptversammlung ein:\n\nDatum: ${event.startDate ? new Date(event.startDate).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''}\nUhrzeit: ${event.startDate ? new Date(event.startDate).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : ''}\nOrt: ${event.location || ''}\n\nTagesordnung:\n- Bericht des Vorstands\n- Kassenbericht\n- Entlastung des Vorstands\n- Wahlen\n- Planung für das kommende Jahr\n- Verschiedenes\n\nEuer Erscheinen ist wichtig!\n\nMit freundlichen Grüßen\nDer Vorstand`
  },
  custom: {
    label: "Benutzerdefiniert",
    template: () => ""
  }
};

// Status-Berechnung basierend auf Datum
const getEventStatus = (event: Event): 'upcoming' | 'ongoing' | 'completed' | 'cancelled' => {
  if (event.isCancelled) return 'cancelled';
  
  const now = new Date();
  const start = new Date(event.startDate);
  const end = event.endDate ? new Date(event.endDate) : start;
  
  if (now < start) return 'upcoming';
  if (now > end) return 'completed';
  return 'ongoing';
};

// Mock-Daten
const initialEvents: Event[] = [
  {
    id: "E001",
    title: "Jahreshauptversammlung",
    description: "Unsere jährliche Mitgliederversammlung mit Berichten, Wahlen und Planung für das neue Jahr.",
    location: "bei Küpper",
    startDate: "2025-03-14T19:30:00",
    isAllDay: false,
    eventType: "other",
    isPublic: false,
    isMemberOnly: true,
    registrationType: "required",
    notifyMembers: true,
    isCancelled: false,
    attendees: 45,
    createdBy: "Admin",
    createdAt: "2025-01-10T10:00:00"
  },
  {
    id: "E002",
    title: "Frühjahrsplatzpflege",
    description: "Gemeinsam machen wir unser Fluggelände fit für die Saison. Jede helfende Hand ist willkommen!",
    location: "Fluggelände Dingden",
    startDate: "2025-03-22T09:30:00",
    endDate: "2025-03-22T16:00:00",
    isAllDay: false,
    eventType: "maintenance",
    isPublic: true,
    isMemberOnly: false,
    registrationType: "desired",
    notifyMembers: true,
    isCancelled: false,
    attendees: 5,
    createdBy: "Admin",
    createdAt: "2025-01-15T14:00:00"
  },
  {
    id: "E003",
    title: "Drohnenkurs Westnetz (Tag 1)",
    description: "Professionelle Drohnenschulung auf unserem Gelände.",
    location: "Fluggelände Dingden",
    startDate: "2025-05-08T09:00:00",
    endDate: "2025-05-08T13:00:00",
    isAllDay: false,
    eventType: "training",
    isPublic: false,
    isMemberOnly: false,
    maxParticipants: 15,
    registrationDeadline: "2025-05-01",
    registrationType: "required",
    notifyMembers: false,
    isCancelled: false,
    attendees: 3,
    createdBy: "Admin",
    createdAt: "2025-01-20T09:00:00"
  },
  {
    id: "E004",
    title: "F5J-Wettbewerb",
    description: "Spannender Segelflug-Wettbewerb der Klasse F5J. Zuschauer sind herzlich willkommen!",
    location: "Fluggelände Dingden",
    startDate: "2025-07-13T08:00:00",
    endDate: "2025-07-13T18:00:00",
    isAllDay: false,
    eventType: "competition",
    isPublic: true,
    isMemberOnly: false,
    registrationType: "desired",
    notifyMembers: true,
    isCancelled: false,
    attendees: 3,
    createdBy: "Admin",
    createdAt: "2025-01-25T11:00:00"
  },
  {
    id: "E005",
    title: "Schnupperfliegen",
    description: "Du möchtest den Modellflug kennenlernen? Komm vorbei und probiere es selbst aus! Für Kinder und Erwachsene.",
    location: "Fluggelände Dingden",
    startDate: "2025-08-09T10:00:00",
    endDate: "2025-08-09T16:00:00",
    isAllDay: false,
    eventType: "schnuppertag",
    isPublic: true,
    isMemberOnly: false,
    maxParticipants: 40,
    registrationType: "not_required",
    notifyMembers: true,
    isCancelled: false,
    attendees: 18,
    createdBy: "Admin",
    createdAt: "2025-02-01T10:00:00"
  },
  {
    id: "E006",
    title: "Sommerfest",
    description: "Unser jährliches Sommerfest mit Flugvorführungen, Grillstation und gemütlichem Beisammensein. Alle sind herzlich eingeladen!",
    location: "Vereinsgelände",
    startDate: "2025-08-23T15:00:00",
    endDate: "2025-08-24T22:00:00",
    isAllDay: false,
    eventType: "event",
    isPublic: true,
    isMemberOnly: false,
    registrationType: "desired",
    notifyMembers: true,
    isCancelled: false,
    attendees: 2,
    createdBy: "Admin",
    createdAt: "2025-02-05T15:00:00"
  },
];

// Mock-Daten für Anmeldungen
const initialRegistrations: Registration[] = [
  // Anmeldungen für Frühjahrs-Platzpflege (E002)
  {
    id: "R001",
    eventId: "E002",
    userId: "U001",
    memberName: "Max Mustermann",
    memberNumber: "M-001",
    email: "max@example.com",
    phone: "0171-1234567",
    registeredAt: "2025-03-01T10:30:00",
    status: "confirmed",
  },
  {
    id: "R002",
    eventId: "E002",
    userId: "U002",
    memberName: "Thomas Schmidt",
    memberNumber: "M-015",
    email: "thomas.s@example.com",
    registeredAt: "2025-03-02T14:20:00",
    status: "confirmed",
  },
  {
    id: "R003",
    eventId: "E002",
    userId: "U003",
    memberName: "Peter Bauer",
    memberNumber: "M-022",
    registeredAt: "2025-03-05T09:15:00",
    status: "confirmed",
    notes: "Bringe Motorsense mit",
  },
  {
    id: "R004",
    eventId: "E002",
    userId: "U004",
    memberName: "Klaus Meier",
    memberNumber: "M-008",
    email: "k.meier@example.com",
    registeredAt: "2025-03-10T16:45:00",
    status: "confirmed",
  },
  {
    id: "R005",
    eventId: "E002",
    userId: "U005",
    memberName: "Hans Wagner",
    memberNumber: "M-033",
    registeredAt: "2025-03-12T11:00:00",
    status: "pending",
  },
  // Anmeldungen für Drohnenkurs (E003)
  {
    id: "R006",
    eventId: "E003",
    userId: "U006",
    memberName: "Stefan Richter",
    email: "stefan.r@westnetz.de",
    phone: "0172-9876543",
    registeredAt: "2025-04-25T08:30:00",
    status: "confirmed",
  },
  {
    id: "R007",
    eventId: "E003",
    userId: "U007",
    memberName: "Markus Schäfer",
    email: "m.schaefer@westnetz.de",
    registeredAt: "2025-04-26T10:15:00",
    status: "confirmed",
  },
  {
    id: "R008",
    eventId: "E003",
    userId: "U008",
    memberName: "Lars Becker",
    email: "l.becker@westnetz.de",
    registeredAt: "2025-04-27T14:00:00",
    status: "confirmed",
  },
  // Anmeldungen für Schnuppertag (E004)
  {
    id: "R009",
    eventId: "E004",
    userId: "U009",
    memberName: "Julia Neumann",
    email: "julia.n@example.com",
    phone: "0173-5551234",
    registeredAt: "2025-05-10T18:20:00",
    status: "confirmed",
    notes: "Kommt mit Sohn (12 Jahre)",
  },
  {
    id: "R010",
    eventId: "E004",
    userId: "U010",
    memberName: "Michael Koch",
    email: "michael.koch@example.com",
    registeredAt: "2025-05-12T09:45:00",
    status: "confirmed",
  },
  {
    id: "R011",
    eventId: "E004",
    userId: "U011",
    memberName: "Sebastian Wolf",
    phone: "0174-7778888",
    registeredAt: "2025-05-14T15:30:00",
    status: "pending",
  },
  // Anmeldungen für Sommerfest (E006)
  {
    id: "R012",
    eventId: "E006",
    userId: "U012",
    memberName: "Familie Schneider",
    email: "schneider@example.com",
    registeredAt: "2025-07-20T12:00:00",
    status: "confirmed",
    notes: "4 Personen",
  },
  {
    id: "R013",
    eventId: "E006",
    userId: "U013",
    memberName: "Andreas Hoffmann",
    memberNumber: "M-019",
    email: "a.hoffmann@example.com",
    registeredAt: "2025-07-22T16:30:00",
    status: "confirmed",
    notes: "Hilft bei Grillstation",
  },
];

export function TerminePage() {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [registrations, setRegistrations] = useState<Registration[]>(initialRegistrations);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("all");
  
  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  
  // Form State
  const [formData, setFormData] = useState<Partial<Event>>({
    title: "",
    description: "",
    location: "Fluggelände Dingdener Heide",
    startDate: "",
    endDate: "",
    isAllDay: false,
    eventType: "other",
    isPublic: true,
    isMemberOnly: false,
    minParticipants: undefined,
    maxParticipants: undefined,
    registrationDeadline: "",
    notifyMembers: false,
    emailTemplate: "standard",
    emailText: "",
  });

  // Location Type State
  const [locationType, setLocationType] = useState<"fluggelaende" | "custom">("fluggelaende");
  const [customLocation, setCustomLocation] = useState("");
  const [selectedDescriptionTemplate, setSelectedDescriptionTemplate] = useState<string>("none");
  
  // Registration Type State
  const [registrationType, setRegistrationType] = useState<"required" | "desired" | "not_required">("not_required");

  // Filter & Search
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const status = getEventStatus(event);
      
      // Tab-Filter
      if (activeTab === "upcoming" && status !== "upcoming") return false;
      if (activeTab === "past" && status !== "completed") return false;
      if (activeTab === "cancelled" && status !== "cancelled") return false;
      
      // Typ-Filter
      if (typeFilter !== "all" && event.eventType !== typeFilter) return false;
      
      // Suche
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          event.title.toLowerCase().includes(search) ||
          event.description?.toLowerCase().includes(search) ||
          event.location?.toLowerCase().includes(search)
        );
      }
      
      return true;
    }).sort((a, b) => {
      // Sortiere nach Startdatum: neueste/späteste Termine zuerst (absteigend)
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });
  }, [events, activeTab, typeFilter, searchTerm]);

  // Statistiken
  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: events.length,
      upcoming: events.filter(e => getEventStatus(e) === 'upcoming').length,
      ongoing: events.filter(e => getEventStatus(e) === 'ongoing').length,
      cancelled: events.filter(e => e.isCancelled).length,
      totalAttendees: events.reduce((sum, e) => sum + (e.attendees || 0), 0),
      publicEvents: events.filter(e => e.isPublic).length,
    };
  }, [events]);

  // Status Badge
  const getStatusBadge = (event: Event) => {
    const status = getEventStatus(event);
    switch (status) {
      case "upcoming":
        return <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-950/30">Geplant</Badge>;
      case "ongoing":
        return <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50 dark:bg-green-950/30">Läuft</Badge>;
      case "completed":
        return <Badge variant="outline" className="border-gray-500 text-gray-700 bg-gray-50 dark:bg-gray-950/30">Beendet</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="border-red-500 text-red-700 bg-red-50 dark:bg-red-950/30">Abgesagt</Badge>;
    }
  };

  // Datum formatieren
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Event erstellen
  const handleCreateEvent = () => {
    if (!formData.title || !formData.startDate) {
      toast.error("Bitte fülle alle Pflichtfelder aus");
      return;
    }

    const newEvent: Event = {
      id: `E${String(events.length + 1).padStart(3, '0')}`,
      title: formData.title,
      description: formData.description,
      location: formData.location,
      startDate: formData.startDate,
      endDate: formData.endDate,
      isAllDay: formData.isAllDay || false,
      eventType: formData.eventType || 'event',
      isPublic: formData.isPublic !== undefined ? formData.isPublic : true,
      isMemberOnly: formData.isMemberOnly || false,
      minParticipants: formData.minParticipants,
      maxParticipants: formData.maxParticipants,
      registrationDeadline: formData.registrationDeadline,
      registrationType: registrationType,
      notifyMembers: formData.notifyMembers || false,
      isCancelled: false,
      attendees: 0,
      createdBy: "Admin",
      createdAt: new Date().toISOString(),
    };

    setEvents([...events, newEvent]);
    setCreateDialogOpen(false);
    resetForm();
    toast.success("Termin erfolgreich erstellt");
  };

  // Event bearbeiten
  const handleEditEvent = () => {
    if (!selectedEvent || !formData.title || !formData.startDate) {
      toast.error("Bitte fülle alle Pflichtfelder aus");
      return;
    }

    setEvents(events.map(event => 
      event.id === selectedEvent.id 
        ? { ...event, ...formData, registrationType: registrationType }
        : event
    ));
    
    setEditDialogOpen(false);
    setSelectedEvent(null);
    resetForm();
    toast.success("Termin erfolgreich aktualisiert");
  };

  // Event absagen
  const handleCancelEvent = () => {
    if (!selectedEvent) return;

    setEvents(events.map(event => 
      event.id === selectedEvent.id 
        ? { ...event, isCancelled: true, cancellationReason }
        : event
    ));
    
    setCancelDialogOpen(false);
    setSelectedEvent(null);
    setCancellationReason("");
    toast.success("Termin wurde abgesagt");
  };

  // Event löschen
  const handleDeleteEvent = () => {
    if (!selectedEvent) return;

    setEvents(events.filter(event => event.id !== selectedEvent.id));
    setDeleteDialogOpen(false);
    setSelectedEvent(null);
    toast.success("Termin wurde gelöscht");
  };

  // Form zurücksetzen
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      location: "Fluggelände Dingdener Heide",
      startDate: "",
      endDate: "",
      isAllDay: false,
      eventType: "other",
      isPublic: true,
      isMemberOnly: false,
      minParticipants: undefined,
      maxParticipants: undefined,
      registrationDeadline: "",
      notifyMembers: false,
      emailTemplate: "standard",
      emailText: "",
    });
    setLocationType("fluggelaende");
    setCustomLocation("");
    setSelectedDescriptionTemplate("none");
    setRegistrationType("not_required");
  };

  // Beschreibungs-Vorlage anwenden
  const applyDescriptionTemplate = (template: string) => {
    setSelectedDescriptionTemplate(template);
    const templateFunc = descriptionTemplates[template as keyof typeof descriptionTemplates]?.template;
    if (templateFunc) {
      setFormData({ 
        ...formData, 
        description: templateFunc()
      });
    }
  };

  // Update location based on locationType
  const handleLocationTypeChange = (type: "fluggelaende" | "custom") => {
    setLocationType(type);
    if (type === "fluggelaende") {
      setFormData({ ...formData, location: "Fluggelände Dingdener Heide" });
      setCustomLocation("");
    } else {
      setFormData({ ...formData, location: customLocation });
    }
  };

  const handleCustomLocationChange = (value: string) => {
    setCustomLocation(value);
    setFormData({ ...formData, location: value });
  };

  // E-Mail-Vorlage anwenden
  const applyEmailTemplate = (template: string) => {
    if (template === "custom") {
      setFormData({ ...formData, emailTemplate: template, emailText: "" });
    } else {
      const templateFunc = emailTemplates[template as keyof typeof emailTemplates]?.template;
      if (templateFunc) {
        setFormData({ 
          ...formData, 
          emailTemplate: template,
          emailText: templateFunc(formData)
        });
      }
    }
  };

  // Edit-Dialog öffnen
  const openEditDialog = (event: Event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      location: event.location,
      startDate: event.startDate,
      endDate: event.endDate,
      isAllDay: event.isAllDay,
      eventType: event.eventType,
      isPublic: event.isPublic,
      isMemberOnly: event.isMemberOnly,
      minParticipants: event.minParticipants,
      maxParticipants: event.maxParticipants,
      registrationDeadline: event.registrationDeadline,
      notifyMembers: event.notifyMembers,
      emailTemplate: event.emailTemplate || "standard",
      emailText: event.emailText || "",
    });
    
    // Set location type
    if (event.location === "Fluggelände Dingdener Heide") {
      setLocationType("fluggelaende");
      setCustomLocation("");
    } else {
      setLocationType("custom");
      setCustomLocation(event.location || "");
    }
    
    // Set registration type
    setRegistrationType(event.registrationType || "not_required");
    
    // Reset description template selection
    setSelectedDescriptionTemplate("none");
    
    setEditDialogOpen(true);
  };

  // Hilfsfunktion: Dauer berechnen
  const calculateDuration = (start: string, end?: string): string | null => {
    if (!end) return null;
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      const remainingHours = diffHours % 24;
      if (remainingHours > 0) {
        return `${diffDays} Tag${diffDays > 1 ? 'e' : ''} ${remainingHours} Std.`;
      }
      return `${diffDays} Tag${diffDays > 1 ? 'e' : ''}`;
    } else if (diffHours > 0) {
      const remainingMins = diffMins % 60;
      if (remainingMins > 0) {
        return `${diffHours} Std. ${remainingMins} Min.`;
      }
      return `${diffHours} Stunde${diffHours > 1 ? 'n' : ''}`;
    } else if (diffMins > 0) {
      return `${diffMins} Minute${diffMins > 1 ? 'n' : ''}`;
    }
    
    return null;
  };

  // Hilfsfunktion: E-Mail-Template Namen
  const getEmailTemplateName = (template?: string): string => {
    switch (template) {
      case 'standard': return 'Standard';
      case 'platzpflege': return 'Platzpflege';
      case 'wettbewerb': return 'Wettbewerb';
      case 'custom': return 'Benutzerdefiniert';
      default: return 'Standard';
    }
  };

  // PDF Export für Teilnehmerliste (Querformat)
  const exportParticipantsToPDF = (event: Event) => {
    const eventRegistrations = registrations.filter(r => r.eventId === event.id);
    
    if (eventRegistrations.length === 0) {
      toast.error("Keine Anmeldungen vorhanden");
      return;
    }

    // Querformat: 'landscape'
    const doc = new jsPDF('landscape');
    
    // Header
    doc.setFontSize(20);
    doc.text("Flugmodellsportverein Dingden e.V.", doc.internal.pageSize.width / 2, 15, { align: "center" });
    
    doc.setFontSize(16);
    doc.text("Teilnehmerliste", doc.internal.pageSize.width / 2, 25, { align: "center" });
    
    // Event Details - in einer Zeile
    doc.setFontSize(11);
    const eventInfo = `${event.title} | ${formatDate(event.startDate)}${event.location ? ' | ' + event.location : ''}`;
    doc.text(eventInfo, doc.internal.pageSize.width / 2, 35, { align: "center" });
    
    // Stats - kompakt in einer Zeile
    const confirmedCount = eventRegistrations.filter(r => r.status === 'confirmed').length;
    const pendingCount = eventRegistrations.filter(r => r.status === 'pending').length;
    
    doc.setFontSize(10);
    let statsText = `Anmeldungen: ${eventRegistrations.length} (${confirmedCount} bestätigt`;
    if (pendingCount > 0) statsText += `, ${pendingCount} ausstehend`;
    statsText += ')';
    if (event.maxParticipants) {
      statsText += ` | Max. Teilnehmer: ${event.maxParticipants}`;
    }
    doc.text(statsText, doc.internal.pageSize.width / 2, 43, { align: "center" });
    
    // Tabelle mit allen Spalten
    const tableData = eventRegistrations.map((reg, index) => [
      (index + 1).toString(),
      reg.memberName,
      reg.memberNumber || '-',
      reg.email || '-',
      reg.phone || '-',
      new Date(reg.registeredAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      new Date(reg.registeredAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
      reg.status === 'confirmed' ? 'Bestätigt' : reg.status === 'pending' ? 'Ausstehend' : 'Abgesagt',
      reg.notes || '-'
    ]);
    
    autoTable(doc, {
      head: [['Nr.', 'Name', 'Mitgl.-Nr.', 'E-Mail', 'Telefon', 'Datum', 'Uhrzeit', 'Status', 'Notizen']],
      body: tableData,
      startY: 50,
      styles: { 
        fontSize: 9,
        cellPadding: 2,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [3, 2, 19],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'left',
      },
      alternateRowStyles: {
        fillColor: [248, 248, 250],
      },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' }, // Nr.
        1: { cellWidth: 45 }, // Name
        2: { cellWidth: 22, halign: 'center' }, // Mitgl.-Nr.
        3: { cellWidth: 50 }, // E-Mail
        4: { cellWidth: 32 }, // Telefon
        5: { cellWidth: 24, halign: 'center' }, // Datum
        6: { cellWidth: 20, halign: 'center' }, // Uhrzeit
        7: { cellWidth: 24, halign: 'center' }, // Status
        8: { cellWidth: 'auto' }, // Notizen
      },
      didDrawCell: (data) => {
        // Status-Spalte farblich hervorheben
        if (data.column.index === 7 && data.section === 'body') {
          const status = tableData[data.row.index][7];
          if (status === 'Bestätigt') {
            doc.setFillColor(220, 252, 231); // Grün
          } else if (status === 'Ausstehend') {
            doc.setFillColor(254, 249, 195); // Gelb
          }
        }
      }
    });
    
    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Erstellt am ${new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })} um ${new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr`,
        15,
        doc.internal.pageSize.height - 8
      );
      doc.text(
        `Seite ${i} von ${pageCount}`,
        doc.internal.pageSize.width - 15,
        doc.internal.pageSize.height - 8,
        { align: 'right' }
      );
    }
    
    // PDF speichern
    const filename = `Teilnehmerliste_${event.title.replace(/[^a-z0-9]/gi, '_')}_${new Date().toLocaleDateString('de-DE').replace(/\./g, '-')}.pdf`;
    doc.save(filename);
    
    toast.success("PDF erfolgreich erstellt");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="mb-2">Terminverwaltung</h2>
          <p className="text-muted-foreground">
            Verwalte alle Vereinstermine und Veranstaltungen.
          </p>
        </div>
        <Button 
          className="gap-2 w-full sm:w-auto"
          onClick={() => {
            resetForm();
            setCreateDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Neuer Termin
        </Button>
      </div>

      {/* Statistiken */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Geplante Termine</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.upcoming}</div>
            <p className="text-xs text-muted-foreground">
              Kommende Veranstaltungen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Laufende Events</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.ongoing}</div>
            <p className="text-xs text-muted-foreground">
              Aktuell laufend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Anmeldungen</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.totalAttendees}</div>
            <p className="text-xs text-muted-foreground">
              Gesamt
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Öffentlich</CardTitle>
            <PartyPopper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.publicEvents}</div>
            <p className="text-xs text-muted-foreground">
              Für alle sichtbar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Suche */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Suche */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Termine durchsuchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setSearchTerm("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Typ-Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Typ filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Typen</SelectItem>
                <SelectItem value="schnuppertag">Schnuppertag</SelectItem>
                <SelectItem value="maintenance">Platzpflege</SelectItem>
                <SelectItem value="training">Schulung</SelectItem>
                <SelectItem value="competition">Wettbewerb</SelectItem>
                <SelectItem value="event">Veranstaltung</SelectItem>
                <SelectItem value="other">Sonstiges</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs & Event-Liste */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">
            Alle ({events.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Geplant ({stats.upcoming})
          </TabsTrigger>
          <TabsTrigger value="past">
            Vergangen ({events.filter(e => getEventStatus(e) === 'completed').length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Abgesagt ({stats.cancelled})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Keine Termine gefunden</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredEvents.map((event) => {
                const typeConfig = eventTypes[event.eventType];
                const Icon = typeConfig.icon;
                const status = getEventStatus(event);

                return (
                  <Card key={event.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <CardTitle className="text-lg">{event.title}</CardTitle>
                            <Badge variant="outline" className={typeConfig.color}>
                              <Icon className="h-3 w-3 mr-1" />
                              {typeConfig.label}
                            </Badge>
                            {getStatusBadge(event)}
                            {event.isPublic && (
                              <Badge variant="secondary">Öffentlich</Badge>
                            )}
                            {event.isMemberOnly && (
                              <Badge variant="secondary">Nur Mitglieder</Badge>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 flex-shrink-0" />
                              <span>{formatDate(event.startDate)}</span>
                            </div>
                            {!event.isAllDay && (
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 flex-shrink-0" />
                                <span>
                                  {formatTime(event.startDate)}
                                  {event.endDate && ` - ${formatTime(event.endDate)}`}
                                </span>
                              </div>
                            )}
                            {event.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 flex-shrink-0" />
                                <span>{event.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 sm:flex-shrink-0">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedEvent(event);
                              setDetailDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Details</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openEditDialog(event)}
                            disabled={status === 'completed'}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!event.isCancelled && status !== 'completed' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedEvent(event);
                                setCancelDialogOpen(true);
                              }}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-destructive hover:text-destructive hidden sm:inline-flex"
                            onClick={() => {
                              setSelectedEvent(event);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                      {event.isCancelled && event.cancellationReason && (
                        <div className="mb-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <p className="text-destructive mb-1">Absagegrund:</p>
                              <p className="text-muted-foreground">{event.cancellationReason}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        {event.attendees !== undefined && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {event.attendees} {event.maxParticipants && `/ ${event.maxParticipants}`} Teilnehmer
                            </span>
                          </div>
                        )}
                        {event.registrationDeadline && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              Anmeldung bis {new Date(event.registrationDeadline).toLocaleDateString('de-DE')}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={createDialogOpen || editDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setCreateDialogOpen(false);
          setEditDialogOpen(false);
          setSelectedEvent(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {editDialogOpen ? 'Termin bearbeiten' : 'Neuen Termin erstellen'}
            </DialogTitle>
            <DialogDescription>
              {editDialogOpen 
                ? 'Bearbeite die Details des Termins.' 
                : 'Erstelle einen neuen Termin für den Verein.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Grundinformationen */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4" />
                <span>Grundinformationen</span>
              </div>
              
              <div className="space-y-4 pl-6">
                {/* Titel */}
                <div className="space-y-2">
                  <Label htmlFor="title">Titel *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="z.B. Jahreshauptversammlung"
                  />
                </div>

                {/* Event-Typ */}
                <div className="space-y-2">
                  <Label htmlFor="eventType">Event-Typ *</Label>
                  <Select 
                    value={formData.eventType} 
                    onValueChange={(value) => setFormData({ ...formData, eventType: value as Event['eventType'] })}
                  >
                    <SelectTrigger id="eventType">
                      <SelectValue placeholder="Wähle einen Typ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="schnuppertag">
                        <div className="flex items-center gap-2">
                          <PartyPopper className="h-4 w-4" />
                          Schnuppertag
                        </div>
                      </SelectItem>
                      <SelectItem value="maintenance">
                        <div className="flex items-center gap-2">
                          <Wrench className="h-4 w-4" />
                          Platzpflege
                        </div>
                      </SelectItem>
                      <SelectItem value="training">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" />
                          Schulung
                        </div>
                      </SelectItem>
                      <SelectItem value="competition">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4" />
                          Wettbewerb
                        </div>
                      </SelectItem>
                      <SelectItem value="event">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Veranstaltung
                        </div>
                      </SelectItem>
                      <SelectItem value="other">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Sonstiges
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Beschreibung */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="description">Beschreibung</Label>
                    <Select 
                      value={selectedDescriptionTemplate}
                      onValueChange={applyDescriptionTemplate}
                    >
                      <SelectTrigger className="w-[200px] h-8">
                        <SelectValue placeholder="Vorlage wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Keine Vorlage</SelectItem>
                        <SelectItem value="schnuppertag">Schnuppertag</SelectItem>
                        <SelectItem value="platzpflege">Platzpflege</SelectItem>
                        <SelectItem value="wettbewerb">Wettbewerb</SelectItem>
                        <SelectItem value="schulung">Schulung</SelectItem>
                        <SelectItem value="jhv">Jahreshauptversammlung</SelectItem>
                        <SelectItem value="sommerfest">Sommerfest / Veranstaltung</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Details zum Termin..."
                    rows={4}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Datum & Uhrzeit */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Datum & Uhrzeit</span>
              </div>
              
              <div className="space-y-4 pl-6">
                {/* Ganztägig Checkbox zuerst */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isAllDay"
                    checked={formData.isAllDay}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, isAllDay: checked as boolean })
                    }
                  />
                  <Label htmlFor="isAllDay" className="cursor-pointer">
                    Ganztägige Veranstaltung
                  </Label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">
                      {formData.isAllDay ? 'Startdatum *' : 'Startdatum & -zeit *'}
                    </Label>
                    <Input
                      id="startDate"
                      type={formData.isAllDay ? "date" : "datetime-local"}
                      value={formData.isAllDay 
                        ? formData.startDate?.slice(0, 10) 
                        : formData.startDate?.slice(0, 16)
                      }
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">
                      {formData.isAllDay ? 'Enddatum' : 'Enddatum & -zeit'}
                    </Label>
                    <Input
                      id="endDate"
                      type={formData.isAllDay ? "date" : "datetime-local"}
                      value={formData.isAllDay 
                        ? formData.endDate?.slice(0, 10) 
                        : formData.endDate?.slice(0, 16)
                      }
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Ort */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Veranstaltungsort</span>
              </div>
              
              <div className="space-y-4 pl-6">
                <div className="space-y-2">
                  <Label htmlFor="locationType">Ort auswählen</Label>
                  <Select 
                    value={locationType}
                    onValueChange={(value) => handleLocationTypeChange(value as "fluggelaende" | "custom")}
                  >
                    <SelectTrigger id="locationType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fluggelaende">Fluggelände Dingdener Heide</SelectItem>
                      <SelectItem value="custom">Sonstiges</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {locationType === "custom" && (
                  <div className="space-y-2">
                    <Label htmlFor="customLocation">Benutzerdefinierter Ort</Label>
                    <Input
                      id="customLocation"
                      value={customLocation}
                      onChange={(e) => handleCustomLocationChange(e.target.value)}
                      placeholder="z.B. Vereinsheim, Gasthof..."
                    />
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Teilnehmer & Anmeldung */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Teilnehmer & Anmeldung</span>
              </div>
              
              <div className="space-y-4 pl-6">
                {/* Anmeldeoption */}
                <div className="space-y-3">
                  <Label>Anmeldung</Label>
                  <RadioGroup 
                    value={registrationType} 
                    onValueChange={(value) => setRegistrationType(value as "required" | "desired" | "not_required")}
                    className="flex flex-col sm:flex-row sm:gap-6 space-y-2 sm:space-y-0"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="required" id="reg-required" />
                      <Label htmlFor="reg-required" className="cursor-pointer">
                        Erforderlich
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="desired" id="reg-desired" />
                      <Label htmlFor="reg-desired" className="cursor-pointer">
                        Erwünscht
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="not_required" id="reg-not-required" />
                      <Label htmlFor="reg-not-required" className="cursor-pointer">
                        Nicht erforderlich
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minParticipants">Min. Teilnehmer</Label>
                    <Input
                      id="minParticipants"
                      type="number"
                      min="0"
                      value={formData.minParticipants || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        minParticipants: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                      placeholder="Optional"
                      disabled={registrationType === "not_required"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxParticipants">Max. Teilnehmer</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      min="0"
                      value={formData.maxParticipants || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        maxParticipants: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                      placeholder="Optional"
                      disabled={registrationType === "not_required"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registrationDeadline">Anmeldefrist</Label>
                    <Input
                      id="registrationDeadline"
                      type="date"
                      value={formData.registrationDeadline}
                      onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                      disabled={registrationType === "not_required"}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Sichtbarkeit & Benachrichtigungen */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>Sichtbarkeit & Benachrichtigungen</span>
              </div>
              
              <div className="space-y-4 pl-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isPublic"
                      checked={formData.isPublic}
                      onCheckedChange={(checked) => 
                        setFormData({ 
                          ...formData, 
                          isPublic: checked as boolean,
                          isMemberOnly: checked ? false : formData.isMemberOnly
                        })
                      }
                    />
                    <Label htmlFor="isPublic" className="cursor-pointer">
                      Öffentlich sichtbar (auf der Website)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isMemberOnly"
                      checked={formData.isMemberOnly}
                      onCheckedChange={(checked) => 
                        setFormData({ 
                          ...formData, 
                          isMemberOnly: checked as boolean,
                          isPublic: checked ? false : formData.isPublic
                        })
                      }
                    />
                    <Label htmlFor="isMemberOnly" className="cursor-pointer">
                      Nur für Mitglieder
                    </Label>
                  </div>
                </div>

                <Separator className="my-3" />

                {/* E-Mail-Benachrichtigung */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="notifyMembers"
                      checked={formData.notifyMembers}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, notifyMembers: checked as boolean })
                      }
                    />
                    <Label htmlFor="notifyMembers" className="cursor-pointer flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Mitglieder per E-Mail benachrichtigen
                    </Label>
                  </div>

                  {formData.notifyMembers && (
                    <div className="space-y-3 pl-6 pt-2 border-l-2 border-primary/20">
                      {/* E-Mail Vorlage auswählen */}
                      <div className="space-y-2">
                        <Label htmlFor="emailTemplate" className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          E-Mail-Vorlage
                        </Label>
                        <Select 
                          value={formData.emailTemplate} 
                          onValueChange={applyEmailTemplate}
                        >
                          <SelectTrigger id="emailTemplate">
                            <SelectValue placeholder="Wähle eine Vorlage" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">
                              Standard-Benachrichtigung
                            </SelectItem>
                            <SelectItem value="platzpflege">
                              Platzpflege-Aufruf
                            </SelectItem>
                            <SelectItem value="wettbewerb">
                              Wettbewerbs-Einladung
                            </SelectItem>
                            <SelectItem value="jhv">
                              Jahreshauptversammlung
                            </SelectItem>
                            <SelectItem value="custom">
                              Benutzerdefiniert
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* E-Mail-Text */}
                      <div className="space-y-2">
                        <Label htmlFor="emailText">E-Mail-Text</Label>
                        <Textarea
                          id="emailText"
                          value={formData.emailText}
                          onChange={(e) => setFormData({ ...formData, emailText: e.target.value })}
                          placeholder="Bearbeite den E-Mail-Text oder wähle eine Vorlage aus..."
                          rows={8}
                          className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          Diese Nachricht wird an alle Mitglieder per E-Mail verschickt.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setCreateDialogOpen(false);
                setEditDialogOpen(false);
                setSelectedEvent(null);
                resetForm();
              }}
            >
              Abbrechen
            </Button>
            <Button onClick={editDialogOpen ? handleEditEvent : handleCreateEvent}>
              {editDialogOpen ? 'Aktualisieren' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Termindetails</DialogTitle>
            <DialogDescription>
              Vollständige Informationen und Teilnehmerliste für diesen Termin.
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <h3 className="mb-2">{selectedEvent.title}</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={eventTypes[selectedEvent.eventType].color}>
                    {eventTypes[selectedEvent.eventType].label}
                  </Badge>
                  {getStatusBadge(selectedEvent)}
                  {selectedEvent.isAllDay && <Badge variant="secondary">Ganztägig</Badge>}
                  {selectedEvent.isPublic && <Badge variant="secondary">Öffentlich</Badge>}
                  {selectedEvent.isMemberOnly && <Badge variant="secondary">Nur Mitglieder</Badge>}
                  {selectedEvent.notifyMembers && (
                    <Badge variant="secondary" className="gap-1">
                      <Bell className="h-3 w-3" />
                      Benachrichtigt
                    </Badge>
                  )}
                </div>
              </div>

              {selectedEvent.description && (
                <div>
                  <Label className="text-muted-foreground">Beschreibung</Label>
                  <p className="mt-1">{selectedEvent.description}</p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Startdatum</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p>{formatDate(selectedEvent.startDate)}</p>
                  </div>
                  {!selectedEvent.isAllDay && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <p>{formatTime(selectedEvent.startDate)}</p>
                    </div>
                  )}
                </div>

                {selectedEvent.endDate && (
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Enddatum</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p>{formatDate(selectedEvent.endDate)}</p>
                    </div>
                    {!selectedEvent.isAllDay && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <p>{formatTime(selectedEvent.endDate)}</p>
                      </div>
                    )}
                  </div>
                )}

                {selectedEvent.location && (
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Ort</Label>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <p>{selectedEvent.location}</p>
                    </div>
                  </div>
                )}

                {selectedEvent.attendees !== undefined && (
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Teilnehmer</Label>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <p>
                        {selectedEvent.attendees}
                        {selectedEvent.minParticipants && ` (Min: ${selectedEvent.minParticipants})`}
                        {selectedEvent.maxParticipants && ` / ${selectedEvent.maxParticipants}`}
                      </p>
                    </div>
                  </div>
                )}

                {selectedEvent.registrationType && selectedEvent.registrationType !== "not_required" && (
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Anmeldung</Label>
                    <p>
                      {selectedEvent.registrationType === "required" && "Erforderlich"}
                      {selectedEvent.registrationType === "desired" && "Erwünscht"}
                    </p>
                  </div>
                )}

                {selectedEvent.registrationDeadline && (
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Anmeldefrist</Label>
                    <p>{new Date(selectedEvent.registrationDeadline).toLocaleDateString('de-DE')}</p>
                  </div>
                )}

                {selectedEvent.endDate && calculateDuration(selectedEvent.startDate, selectedEvent.endDate) && (
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Dauer</Label>
                    <div className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 text-muted-foreground" />
                      <p>{calculateDuration(selectedEvent.startDate, selectedEvent.endDate)}</p>
                    </div>
                  </div>
                )}
              </div>

              {selectedEvent.isCancelled && selectedEvent.cancellationReason && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <Label className="text-destructive">Absagegrund</Label>
                  <p className="text-sm mt-1">{selectedEvent.cancellationReason}</p>
                </div>
              )}

              {/* E-Mail Benachrichtigung Details */}
              {selectedEvent.notifyMembers && (
                <div className="p-3 bg-muted/50 border rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Label>E-Mail Benachrichtigung</Label>
                  </div>
                  <div className="text-sm space-y-1">
                    <p className="text-muted-foreground">
                      Vorlage: <span className="text-foreground">{getEmailTemplateName(selectedEvent.emailTemplate)}</span>
                    </p>
                    {selectedEvent.emailText && (
                      <div className="mt-2">
                        <p className="text-muted-foreground mb-1">Nachricht:</p>
                        <p className="text-foreground text-sm bg-background p-2 rounded border">
                          {selectedEvent.emailText}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Teilnehmerliste */}
              {(() => {
                const eventRegistrations = registrations.filter(r => r.eventId === selectedEvent.id);
                const confirmedCount = eventRegistrations.filter(r => r.status === 'confirmed').length;
                const pendingCount = eventRegistrations.filter(r => r.status === 'pending').length;
                
                if (eventRegistrations.length > 0) {
                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-5 w-5 text-muted-foreground" />
                          <Label>Anmeldungen ({eventRegistrations.length})</Label>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => exportParticipantsToPDF(selectedEvent)}
                        >
                          <FileDown className="h-4 w-4" />
                          PDF Export
                        </Button>
                      </div>
                      
                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span className="text-muted-foreground">Bestätigt: <span className="text-foreground">{confirmedCount}</span></span>
                        </div>
                        {pendingCount > 0 && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                            <span className="text-muted-foreground">Ausstehend: <span className="text-foreground">{pendingCount}</span></span>
                          </div>
                        )}
                      </div>

                      {/* Kompakte Liste - Scrollbar ab 5 Teilnehmern */}
                      <div className={`border rounded-lg overflow-hidden ${eventRegistrations.length > 4 ? 'max-h-[320px] overflow-y-auto' : ''}`}>
                        <div className="divide-y">
                          {eventRegistrations.map((reg) => (
                            <div key={reg.id} className="p-3 hover:bg-muted/50 transition-colors">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium truncate">{reg.memberName}</p>
                                    {reg.memberNumber && (
                                      <span className="text-xs text-muted-foreground">({reg.memberNumber})</span>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                    {reg.email && (
                                      <span className="flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        {reg.email}
                                      </span>
                                    )}
                                    {reg.phone && (
                                      <span className="flex items-center gap-1">
                                        📞 {reg.phone}
                                      </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {new Date(reg.registeredAt).toLocaleDateString('de-DE', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                  {reg.notes && (
                                    <p className="text-xs text-muted-foreground mt-1 italic">
                                      → {reg.notes}
                                    </p>
                                  )}
                                </div>
                                <Badge 
                                  variant={reg.status === 'confirmed' ? 'default' : reg.status === 'pending' ? 'secondary' : 'destructive'}
                                  className="text-xs shrink-0"
                                >
                                  {reg.status === 'confirmed' ? '✓' : reg.status === 'pending' ? '⏳' : '✗'}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground text-center">
                        Vollständige Details mit allen Spalten im PDF-Export
                      </p>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Meta-Informationen */}
              <div className="pt-3 border-t space-y-2">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <UserCircle className="h-4 w-4 mt-0.5" />
                  <div>
                    <p>
                      Erstellt von <span className="text-foreground">{selectedEvent.createdBy}</span>
                    </p>
                    <p className="text-xs">
                      {new Date(selectedEvent.createdAt).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })} Uhr
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                {!selectedEvent.isCancelled && getEventStatus(selectedEvent) !== 'completed' && (
                  <>
                    <Button 
                      variant="outline" 
                      className="flex-1 sm:flex-initial gap-2"
                      onClick={() => {
                        setDetailDialogOpen(false);
                        openEditDialog(selectedEvent);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                      Bearbeiten
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 sm:flex-initial gap-2"
                      onClick={() => {
                        setDetailDialogOpen(false);
                        setCancelDialogOpen(true);
                      }}
                    >
                      <Ban className="h-4 w-4" />
                      Absagen
                    </Button>
                  </>
                )}
                <Button 
                  variant="outline" 
                  className="flex-1 sm:flex-initial gap-2 text-destructive hover:text-destructive"
                  onClick={() => {
                    setDetailDialogOpen(false);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Löschen
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 sm:flex-initial sm:ml-auto"
                  onClick={() => setDetailDialogOpen(false)}
                >
                  Schließen
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <Ban className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <DialogTitle>Termin absagen</DialogTitle>
                <DialogDescription>
                  Diese Aktion benachrichtigt alle angemeldeten Teilnehmer
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4">
              {/* Termin-Info Card */}
              <div className="bg-muted/50 rounded-lg p-4 border">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium mb-1">{selectedEvent.title}</p>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(selectedEvent.startDate)}
                      </span>
                      {selectedEvent.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {selectedEvent.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Teilnehmer-Warnung */}
                {(() => {
                  const eventRegs = registrations.filter(r => r.eventId === selectedEvent.id);
                  if (eventRegs.length > 0) {
                    return (
                      <div className="mt-3 pt-3 border-t flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                        <span className="text-amber-600 dark:text-amber-500">
                          {eventRegs.length} {eventRegs.length === 1 ? 'Person ist' : 'Personen sind'} angemeldet und {eventRegs.length === 1 ? 'wird' : 'werden'} benachrichtigt
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Absagegrund */}
              <div className="space-y-2">
                <Label htmlFor="cancellationReason" className="flex items-center gap-2">
                  Absagegrund *
                  <span className="text-xs text-muted-foreground">(wird allen Teilnehmern mitgeteilt)</span>
                </Label>
                <Textarea
                  id="cancellationReason"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="z.B. Wegen schlechtem Wetter abgesagt..."
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Mindestens ein paar Wörter eingeben
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
                <div className="flex gap-2">
                  <div className="text-blue-600 dark:text-blue-400 mt-0.5">ℹ️</div>
                  <div className="text-sm text-blue-900 dark:text-blue-100">
                    <p className="font-medium mb-1">Was passiert beim Absagen?</p>
                    <ul className="text-xs space-y-1 text-blue-700 dark:text-blue-300">
                      <li>• Der Termin wird als "Abgesagt" markiert</li>
                      <li>• Alle Teilnehmer erhalten eine Benachrichtigung</li>
                      <li>• Der Absagegrund wird im Termin angezeigt</li>
                      <li>• Weitere Anmeldungen sind nicht mehr möglich</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setCancelDialogOpen(false);
                setCancellationReason("");
              }}
              className="flex-1 sm:flex-initial"
            >
              Zurück
            </Button>
            <Button 
              variant="destructive"
              onClick={handleCancelEvent}
              disabled={!cancellationReason.trim() || cancellationReason.trim().length < 10}
              className="flex-1 sm:flex-initial gap-2"
            >
              <Ban className="h-4 w-4" />
              Termin absagen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Termin löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Bist du sicher, dass du diesen Termin endgültig löschen möchtest? 
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
