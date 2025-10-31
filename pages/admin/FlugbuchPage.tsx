import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { 
  Plane, 
  Clock, 
  User, 
  Calendar, 
  Timer,
  CheckCircle,
  Trash2,
  Download,
  Filter,
  Search,
  X,
  XCircle,
  Users,
  BarChart3,
  AlertTriangle,
  Zap,
  Fuel,
  GraduationCap,
  FileText,
  ChevronLeft,
  ChevronRight,
  Radio,
  CheckCircle2,
  UserPlus,
  ArrowRight,
  Plus,
  UserCog,
  Activity,
} from "lucide-react";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { toast } from "sonner";
import { 
  getAllEntries, 
  deleteEntry,
  FlugbuchEntry,
} from "../../lib/api/flugbuch.service";
import { getAllMembers, Member } from "../../lib/api/users.service";
import { exportFlightDayToPDF, exportFlugbuchRangeToPDF } from "../../lib/utils/flugbuch-pdf-export";
import { exportFlugbuchToCSV } from "../../lib/utils/flugbuch-csv-export";

// Mock-Daten für Offline-Modus (TAGEWEISE!)
const mockEntries: FlugbuchEntry[] = [
  {
    id: 1,
    user_id: 1,
    flight_date: "2025-10-23",
    flight_time: "14:20",
    end_time: "17:20",
    duration: 180, // 3 Stunden = ganzer Nachmittag
    model_name: "ASW 28, Extra 330",
    model_type: "Elektro",
    flight_type: "fun",
    is_guest: false,
    notes: "Perfektes Wetter, mehrere Thermikflüge",
    created_at: "2025-10-23T14:20:00Z",
    updated_at: "2025-10-23T14:20:00Z",
  },
  {
    id: 2,
    user_id: 2,
    flight_date: "2025-10-23",
    flight_time: "10:30",
    end_time: "14:30",
    duration: 240, // 4 Stunden (Lehrer)
    model_name: "Extra 330SC",
    model_type: "Verbrenner",
    flight_type: "training",
    instructor_id: 3,
    instructor_first_name: "Hans",
    instructor_last_name: "Schmidt",
    is_guest: false,
    // Separate Schüler-Zeiten
    student_flight_time: "11:00",
    student_end_time: "13:45",
    student_duration: 165, // 2h 45min (Schüler)
    notes: "Kunstflugtraining mit 2 Flugschülern",
    created_at: "2025-10-23T10:30:00Z",
    updated_at: "2025-10-23T10:30:00Z",
  },
  {
    id: 3,
    user_id: 1,
    flight_date: "2025-10-22",
    flight_time: "15:30",
    end_time: "17:30",
    duration: 120,
    model_name: "Multiplex Heron",
    model_type: "Elektro",
    flight_type: "fun",
    is_guest: false,
    created_at: "2025-10-22T15:30:00Z",
    updated_at: "2025-10-22T15:30:00Z",
  },
  {
    id: 4,
    user_id: 3,
    flight_date: "2025-10-20",
    flight_time: "13:10",
    end_time: "14:40",
    duration: 90,
    model_name: "Pilatus PC-6",
    model_type: "Elektro",
    flight_type: "fun",
    is_guest: false,
    issues: "Modell bei Landung beschädigt - Reparatur erforderlich",
    created_at: "2025-10-20T13:10:00Z",
    updated_at: "2025-10-20T13:10:00Z",
  },
  {
    id: 5,
    user_id: 4,
    flight_date: "2025-10-20",
    flight_time: "11:00",
    end_time: "14:30",
    duration: 210,
    model_name: "F3A Competition",
    model_type: "Elektro",
    flight_type: "competition",
    is_guest: false,
    notes: "Wettbewerbsvorbereitung - intensive Session",
    created_at: "2025-10-20T11:00:00Z",
    updated_at: "2025-10-20T11:00:00Z",
  },
  {
    id: 6,
    user_id: 2,
    flight_date: "2025-10-15",
    flight_time: "09:00",
    end_time: "09:45",
    duration: 45, // Sehr kurzer Tag - verdächtig
    model_name: "",
    model_type: "",
    flight_type: "fun",
    is_guest: false,
    created_at: "2025-10-15T09:00:00Z",
    updated_at: "2025-10-15T09:00:00Z",
  },
  // Weitere Einträge für Sortierungs-Demo am 23.10.2025
  {
    id: 7,
    user_id: 1,
    flight_date: "2025-10-23",
    flight_time: "16:30",
    end_time: "18:00",
    duration: 90,
    model_name: "DG-1000",
    model_type: "Elektro",
    flight_type: "fun",
    is_guest: false,
    notes: "Normales Mitglied - später Start",
    created_at: "2025-10-23T16:30:00Z",
    updated_at: "2025-10-23T16:30:00Z",
  },
  {
    id: 8,
    user_id: undefined, // Gastflieger!
    flight_date: "2025-10-23",
    flight_time: "09:15",
    end_time: "11:30",
    duration: 135,
    model_name: "Cessna 182",
    model_type: "Verbrenner",
    flight_type: "fun",
    is_guest: true, // Gastflieger
    witnesses: "Max Mustermann (Gast)",
    notes: "Gastflieger aus Köln",
    created_at: "2025-10-23T09:15:00Z",
    updated_at: "2025-10-23T09:15:00Z",
  },
  {
    id: 9,
    user_id: 4,
    flight_date: "2025-10-23",
    flight_time: "13:00",
    end_time: "15:45",
    duration: 165,
    model_name: "ASK 21",
    model_type: "Elektro",
    flight_type: "fun",
    is_guest: false,
    notes: "Normales Mitglied - mittlerer Start",
    created_at: "2025-10-23T13:00:00Z",
    updated_at: "2025-10-23T13:00:00Z",
  },
  {
    id: 10,
    user_id: 3,
    flight_date: "2025-10-23",
    flight_time: "18:45",
    // Kein end_time - noch eingetragen!
    duration: 0,
    model_name: "Piper Cub",
    model_type: "Verbrenner",
    flight_type: "fun",
    is_guest: false,
    notes: "Noch im Flugbetrieb",
    created_at: "2025-10-23T18:45:00Z",
    updated_at: "2025-10-23T18:45:00Z",
  },
  
  // ============================================
  // SEPTEMBER 2024 - Umfangreiche Testdaten
  // ============================================
  
  // 1. September 2024 - Sonntagsflug
  {
    id: 101,
    user_id: 2,
    flight_date: "2024-09-01",
    flight_time: "10:30",
    end_time: "11:45",
    duration: 75,
    model_name: "ASW28",
    model_type: "Elektro",
    flight_type: "fun",
    is_guest: false,
    notes: "Sonnig, 22°C, leichte Thermik am Vormittag",
    created_at: "2024-09-01T10:30:00Z",
    updated_at: "2024-09-01T10:30:00Z",
  },
  {
    id: 102,
    user_id: 1,
    flight_date: "2024-09-01",
    flight_time: "13:15",
    end_time: "13:50",
    duration: 35,
    model_name: "Pilatus B4",
    model_type: "Elektro",
    flight_type: "fun",
    is_guest: false,
    notes: "Sonnig, 24°C, Nachmittagsflug",
    created_at: "2024-09-01T13:15:00Z",
    updated_at: "2024-09-01T13:50:00Z",
  },
  
  // 3. September 2024
  {
    id: 103,
    user_id: 2,
    flight_date: "2024-09-03",
    flight_time: "14:00",
    end_time: "14:50",
    duration: 50,
    model_name: "Extra 330",
    model_type: "Verbrenner",
    flight_type: "fun",
    is_guest: false,
    notes: "Heiter, 20°C, Kunstflugübungen",
    created_at: "2024-09-03T14:00:00Z",
    updated_at: "2024-09-03T14:50:00Z",
  },
  
  // 7. September 2024 - Perfekter Thermiktag
  {
    id: 104,
    user_id: 2,
    flight_date: "2024-09-07",
    flight_time: "11:00",
    end_time: "12:30",
    duration: 90,
    model_name: "ASW28",
    model_type: "Elektro",
    flight_type: "fun",
    is_guest: false,
    notes: "Perfekte Thermik, 23°C, exzellente Bedingungen!",
    created_at: "2024-09-07T11:00:00Z",
    updated_at: "2024-09-07T12:30:00Z",
  },
  
  // 8. September 2024
  {
    id: 105,
    user_id: 3,
    flight_date: "2024-09-08",
    flight_time: "15:30",
    end_time: "16:10",
    duration: 40,
    model_name: "Extra 330",
    model_type: "Verbrenner",
    flight_type: "fun",
    is_guest: false,
    notes: "Bewölkt, 19°C, Wind aus West",
    created_at: "2024-09-08T15:30:00Z",
    updated_at: "2024-09-08T16:10:00Z",
  },
  
  // 10. September 2024
  {
    id: 106,
    user_id: 2,
    flight_date: "2024-09-10",
    flight_time: "09:45",
    end_time: "10:50",
    duration: 65,
    model_name: "ASW20",
    model_type: "Elektro",
    flight_type: "fun",
    is_guest: false,
    notes: "Sonnig, gute Bedingungen, früher Start",
    created_at: "2024-09-10T09:45:00Z",
    updated_at: "2024-09-10T10:50:00Z",
  },
  
  // 14. September 2024 - Samstagsflug
  {
    id: 107,
    user_id: 1,
    flight_date: "2024-09-14",
    flight_time: "10:00",
    end_time: "10:55",
    duration: 55,
    model_name: "Pilatus B4",
    model_type: "Elektro",
    flight_type: "fun",
    is_guest: false,
    notes: "Sonnig, 21°C, schwache Thermik",
    created_at: "2024-09-14T10:00:00Z",
    updated_at: "2024-09-14T10:55:00Z",
  },
  
  // 15. September 2024 - Schulungsflug
  {
    id: 108,
    user_id: 1,
    flight_date: "2024-09-15",
    flight_time: "09:00",
    end_time: "12:30",
    duration: 210,
    model_name: "Extra 330SC",
    model_type: "Verbrenner",
    flight_type: "training",
    instructor_id: 3,
    instructor_first_name: "Hans",
    instructor_last_name: "Becker",
    student_flight_time: "09:30",
    student_end_time: "11:45",
    student_duration: 135,
    is_guest: false,
    notes: "Flugschüler-Training, Platzrunden und Landungen",
    created_at: "2024-09-15T09:00:00Z",
    updated_at: "2024-09-15T12:30:00Z",
  },
  {
    id: 109,
    user_id: 2,
    flight_date: "2024-09-15",
    flight_time: "14:20",
    end_time: "15:05",
    duration: 45,
    model_name: "Extra 330",
    model_type: "Verbrenner",
    flight_type: "fun",
    is_guest: false,
    notes: "Heiter bis wolkig, 20°C",
    created_at: "2024-09-15T14:20:00Z",
    updated_at: "2024-09-15T15:05:00Z",
  },
  
  // 17. September 2024 - Ausgezeichneter Tag
  {
    id: 110,
    user_id: 2,
    flight_date: "2024-09-17",
    flight_time: "10:15",
    end_time: "11:35",
    duration: 80,
    model_name: "ASW28",
    model_type: "Elektro",
    flight_type: "fun",
    is_guest: false,
    notes: "Ausgezeichnete Thermik, 24°C, beste Bedingungen",
    created_at: "2024-09-17T10:15:00Z",
    updated_at: "2024-09-17T11:35:00Z",
  },
  
  // 21. September 2024 - Samstagsflug
  {
    id: 111,
    user_id: 2,
    flight_date: "2024-09-21",
    flight_time: "11:30",
    end_time: "12:40",
    duration: 70,
    model_name: "ASW20",
    model_type: "Elektro",
    flight_type: "fun",
    is_guest: false,
    notes: "Sonnig, 22°C, gute Thermik",
    created_at: "2024-09-21T11:30:00Z",
    updated_at: "2024-09-21T12:40:00Z",
  },
  
  // 22. September 2024 - Gastflieger
  {
    id: 112,
    user_id: 3,
    flight_date: "2024-09-22",
    flight_time: "13:45",
    end_time: "14:20",
    duration: 35,
    model_name: "Extra 330",
    model_type: "Verbrenner",
    flight_type: "fun",
    is_guest: false,
    notes: "Leicht bewölkt, 19°C",
    created_at: "2024-09-22T13:45:00Z",
    updated_at: "2024-09-22T14:20:00Z",
  },
  {
    id: 113,
    user_id: undefined,
    flight_date: "2024-09-22",
    flight_time: "15:00",
    end_time: "16:15",
    duration: 75,
    model_name: "Cessna 182",
    model_type: "Verbrenner",
    flight_type: "fun",
    is_guest: true,
    witnesses: "Besucher aus Münster",
    notes: "Gastflieger, sehr erfahren",
    created_at: "2024-09-22T15:00:00Z",
    updated_at: "2024-09-22T16:15:00Z",
  },
  
  // 24. September 2024
  {
    id: 114,
    user_id: 1,
    flight_date: "2024-09-24",
    flight_time: "10:45",
    end_time: "11:45",
    duration: 60,
    model_name: "Pilatus B4",
    model_type: "Elektro",
    flight_type: "fun",
    is_guest: false,
    notes: "Sonnig, 20°C, angenehme Bedingungen",
    created_at: "2024-09-24T10:45:00Z",
    updated_at: "2024-09-24T11:45:00Z",
  },
  
  // 28. September 2024 - Herbstwetter
  {
    id: 115,
    user_id: 2,
    flight_date: "2024-09-28",
    flight_time: "12:00",
    end_time: "13:25",
    duration: 85,
    model_name: "ASW28",
    model_type: "Elektro",
    flight_type: "fun",
    is_guest: false,
    notes: "Herbstwetter, gute Thermik trotz kühler Temperaturen, 18°C",
    created_at: "2024-09-28T12:00:00Z",
    updated_at: "2024-09-28T13:25:00Z",
  },
  
  // 29. September 2024 - Letzter Flug im September
  {
    id: 116,
    user_id: 2,
    flight_date: "2024-09-29",
    flight_time: "14:30",
    end_time: "15:20",
    duration: 50,
    model_name: "Extra 330",
    model_type: "Verbrenner",
    flight_type: "fun",
    is_guest: false,
    notes: "Heiter, 17°C, Saisonausklang",
    created_at: "2024-09-29T14:30:00Z",
    updated_at: "2024-09-29T15:20:00Z",
  },
  
  // 29. September 2024 - Vorfall
  {
    id: 117,
    user_id: 4,
    flight_date: "2024-09-29",
    flight_time: "16:00",
    end_time: "16:25",
    duration: 25,
    model_name: "DG-1000",
    model_type: "Elektro",
    flight_type: "fun",
    is_guest: false,
    notes: "Kurzer Flug vor Sonnenuntergang",
    issues: "Funkverbindung zeitweise gestört - Antenne überprüfen",
    created_at: "2024-09-29T16:00:00Z",
    updated_at: "2024-09-29T16:25:00Z",
  },
];

const mockUsers: Member[] = [
  { id: 1, first_name: "Thomas", last_name: "Müller", email: "thomas@example.com", role_id: 3, role_name: "Mitglied", status: "active", created_at: "2024-01-01", membership_status: "active", is_youth: false, show_in_member_list: true, show_email: true, show_phone: true, email_notifications: true, notify_news: true, notify_events: true, notify_own_activities: true },
  { id: 2, first_name: "Anna", last_name: "Schmidt", email: "anna@example.com", role_id: 3, role_name: "Mitglied", status: "active", created_at: "2024-01-01", membership_status: "active", is_youth: false, show_in_member_list: true, show_email: true, show_phone: true, email_notifications: true, notify_news: true, notify_events: true, notify_own_activities: true },
  { id: 3, first_name: "Hans", last_name: "Becker", email: "hans@example.com", role_id: 3, role_name: "Mitglied", status: "active", created_at: "2024-01-01", membership_status: "active", is_youth: false, show_in_member_list: true, show_email: true, show_phone: true, email_notifications: true, notify_news: true, notify_events: true, notify_own_activities: true },
  { id: 4, first_name: "Lisa", last_name: "Hoffmann", email: "lisa@example.com", role_id: 3, role_name: "Mitglied", status: "active", created_at: "2024-01-01", membership_status: "active", is_youth: false, show_in_member_list: true, show_email: true, show_phone: true, email_notifications: true, notify_news: true, notify_events: true, notify_own_activities: true },
];

// Mock-Daten für Flugleiter pro Tag (später Backend-Integration)
interface FlightSupervisor {
  user_id: number;
  name: string;
  start_time?: string;
  end_time?: string;
  incidents?: string;
}

const mockFlightSupervisors: Record<string, FlightSupervisor[]> = {
  // Oktober 2025
  "2025-10-23": [
    { user_id: 3, name: "Hans Becker", start_time: "09:00", end_time: "13:00", incidents: "" },
    { user_id: 1, name: "Thomas Müller", start_time: "13:00", end_time: "18:30", incidents: "Windbö um 15:00 - kurze Unterbrechung" },
    { user_id: 2, name: "Anna Schmidt", start_time: "18:30", incidents: "" }, // Noch im Dienst (kein end_time)
  ],
  "2025-10-22": [
    { user_id: 2, name: "Anna Schmidt", start_time: "10:00", end_time: "17:00", incidents: "" },
  ],
  "2025-10-20": [
    { user_id: 4, name: "Lisa Hoffmann", start_time: "08:30", end_time: "12:00", incidents: "" },
    { user_id: 3, name: "Hans Becker", start_time: "12:00", end_time: "16:30", incidents: "Notlandung eines Modells im Maisfeld - erfolgreich geborgen" },
  ],
  "2025-10-15": [
    { user_id: 1, name: "Thomas Müller", start_time: "09:00", end_time: "18:00", incidents: "" },
  ],
  
  // September 2024
  "2024-09-01": [
    { user_id: 3, name: "Hans Becker", start_time: "10:00", end_time: "14:30", incidents: "" },
  ],
  "2024-09-03": [
    { user_id: 1, name: "Thomas Müller", start_time: "13:30", end_time: "15:30", incidents: "" },
  ],
  "2024-09-07": [
    { user_id: 2, name: "Anna Schmidt", start_time: "10:30", end_time: "13:00", incidents: "" },
  ],
  "2024-09-08": [
    { user_id: 4, name: "Lisa Hoffmann", start_time: "15:00", end_time: "17:00", incidents: "" },
  ],
  "2024-09-10": [
    { user_id: 3, name: "Hans Becker", start_time: "09:00", end_time: "11:30", incidents: "" },
  ],
  "2024-09-14": [
    { user_id: 1, name: "Thomas Müller", start_time: "09:30", end_time: "11:30", incidents: "" },
  ],
  "2024-09-15": [
    { user_id: 3, name: "Hans Becker", start_time: "08:30", end_time: "12:30", incidents: "" },
    { user_id: 4, name: "Lisa Hoffmann", start_time: "14:00", end_time: "16:00", incidents: "" },
  ],
  "2024-09-17": [
    { user_id: 2, name: "Anna Schmidt", start_time: "10:00", end_time: "12:00", incidents: "" },
  ],
  "2024-09-21": [
    { user_id: 1, name: "Thomas Müller", start_time: "11:00", end_time: "13:30", incidents: "" },
  ],
  "2024-09-22": [
    { user_id: 3, name: "Hans Becker", start_time: "13:00", end_time: "17:00", incidents: "" },
  ],
  "2024-09-24": [
    { user_id: 2, name: "Anna Schmidt", start_time: "10:00", end_time: "12:30", incidents: "" },
  ],
  "2024-09-28": [
    { user_id: 4, name: "Lisa Hoffmann", start_time: "11:30", end_time: "14:00", incidents: "" },
  ],
  "2024-09-29": [
    { user_id: 1, name: "Thomas Müller", start_time: "14:00", end_time: "17:00", incidents: "Funkverbindung zeitweise gestört (siehe Flugbuch)" },
  ],
};

export function FlugbuchPage() {
  // State
  const [activeTab, setActiveTab] = useState("dashboard");
  const [entries, setEntries] = useState<FlugbuchEntry[]>([]);
  const [users, setUsers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterUser, setFilterUser] = useState<string>("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterModelType, setFilterModelType] = useState<string>("all");
  const [filterWithInstructor, setFilterWithInstructor] = useState<string>("all");
  const [filterWithIssues, setFilterWithIssues] = useState<string>("all");

  // Dialog States
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<FlugbuchEntry | null>(null);
  const [deleteSupervisorDialogOpen, setDeleteSupervisorDialogOpen] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState<{ date: string; userId: number; name: string } | null>(null);
  const [flightSupervisors, setFlightSupervisors] = useState<Record<string, FlightSupervisor[]>>(mockFlightSupervisors);
  
  // Export Dialog States
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportType, setExportType] = useState<'day' | 'month' | 'year' | 'range'>('month');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv'>('pdf');
  const [exportDate, setExportDate] = useState('');
  const [exportMonth, setExportMonth] = useState('');
  const [exportYear, setExportYear] = useState('');
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');

  // Pagination States - 1 Tag pro Seite
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 1;
  const [jumpToDate, setJumpToDate] = useState("");
  const [initialPageSet, setInitialPageSet] = useState(false);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [entriesData, usersResponse] = await Promise.all([
        getAllEntries(),
        getAllMembers(),
      ]);
      setEntries(entriesData);
      setUsers(usersResponse.members);
      setOfflineMode(false);
    } catch (error) {
      console.log("Offline-Modus: Verwende Mock-Daten", error);
      setOfflineMode(true);
      setEntries(mockEntries);
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Get user name by ID
  const getUserName = (userId: number): string => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.first_name} ${user.last_name}` : `User ${userId}`;
  };

  // Helper: Get pilot name (instructor if present, otherwise user)
  const getPilotName = (entry: FlugbuchEntry): string => {
    if (entry.instructor_id) {
      return `${entry.instructor_first_name} ${entry.instructor_last_name}`;
    }
    return getUserName(entry.user_id);
  };

  // Helper: Get student name (only if instructor is present)
  const getStudentName = (entry: FlugbuchEntry): string | null => {
    if (entry.instructor_id) {
      return getUserName(entry.user_id);
    }
    return null;
  };

  // Helper: Check if entry is suspicious
  const isSuspiciousEntry = (entry: FlugbuchEntry): boolean => {
    // Verdächtig wenn: sehr kurze Dauer (<60 min) oder fehlende kritische Infos
    return entry.duration < 60 || (!entry.model_name && !entry.notes);
  };

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const matchesSearch = searchTerm === "" || 
        entry.model_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getPilotName(entry).toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.notes?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesUser = filterUser === "all" || 
        entry.user_id === parseInt(filterUser) ||
        entry.instructor_id === parseInt(filterUser);

      const matchesDateFrom = !filterDateFrom || entry.flight_date >= filterDateFrom;
      const matchesDateTo = !filterDateTo || entry.flight_date <= filterDateTo;

      const matchesModelType = filterModelType === "all" || entry.model_type === filterModelType;

      const matchesInstructor = filterWithInstructor === "all" || 
        (filterWithInstructor === "yes" && entry.instructor_id) ||
        (filterWithInstructor === "no" && !entry.instructor_id);

      const matchesIssues = filterWithIssues === "all" || 
        (filterWithIssues === "yes" && entry.issues) ||
        (filterWithIssues === "no" && !entry.issues);

      return matchesSearch && matchesUser && matchesDateFrom && matchesDateTo && 
             matchesModelType && matchesInstructor && matchesIssues;
    });
  }, [entries, searchTerm, filterUser, filterDateFrom, filterDateTo, filterModelType, filterWithInstructor, filterWithIssues, users]);

  // Statistics
  const stats = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentYear = now.getFullYear();
    const yearStart = `${currentYear}-01-01`;
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Kalenderjahr-Statistiken
    const yearEntries = entries.filter(e => e.flight_date >= yearStart);
    const totalDays = yearEntries.length;
    const totalMinutes = yearEntries.reduce((sum, e) => sum + e.duration, 0);
    const totalHours = (totalMinutes / 60).toFixed(1);
    const uniquePilots = new Set(yearEntries.map(e => e.user_id)).size;
    const guestDays = yearEntries.filter(e => e.is_guest).length;

    // Letzte 30 Tage Statistiken
    const last30DaysEntries = entries.filter(e => e.flight_date >= thirtyDaysAgo);
    const totalDays30 = last30DaysEntries.length;
    const totalMinutes30 = last30DaysEntries.reduce((sum, e) => sum + e.duration, 0);
    const totalHours30 = (totalMinutes30 / 60).toFixed(1);
    const uniquePilots30 = new Set(last30DaysEntries.map(e => e.user_id)).size;
    const guestDays30 = last30DaysEntries.filter(e => e.is_guest).length;

    const todayDays = entries.filter(e => e.flight_date === today).length;
    const weekDays = entries.filter(e => e.flight_date >= weekAgo).length;
    const monthDays = entries.filter(e => e.flight_date >= thirtyDaysAgo).length;

    const withInstructor = yearEntries.filter(e => e.instructor_id).length;
    const withIssues = yearEntries.filter(e => e.issues).length;
    const suspiciousEntries = yearEntries.filter(isSuspiciousEntry).length;

    // Letzte Flugtage für Timeline
    const recentDays = entries
      .reduce((acc, entry) => {
        const date = entry.flight_date;
        if (!acc.find(d => d.date === date)) {
          const dayEntries = entries.filter(e => e.flight_date === date);
          const pilots = [...new Set(dayEntries.map(e => e.user_id))];
          const hasGuests = dayEntries.some(e => e.is_guest);
          const hasTraining = dayEntries.some(e => e.instructor_id);
          
          acc.push({
            date,
            entryCount: dayEntries.length,
            pilotCount: pilots.length,
            pilots: pilots.map(id => getUserName(id)),
            hasGuests,
            hasTraining,
          });
        }
        return acc;
      }, [] as Array<{
        date: string;
        entryCount: number;
        pilotCount: number;
        pilots: string[];
        hasGuests: boolean;
        hasTraining: boolean;
      }>)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);

    return {
      totalDays,
      totalHours,
      uniquePilots,
      guestDays,
      totalDays30,
      totalHours30,
      uniquePilots30,
      guestDays30,
      todayDays,
      weekDays,
      monthDays,
      withInstructor,
      withIssues,
      suspiciousEntries,
      recentDays,
    };
  }, [entries, users]);

  // Helper: Get supervisors for a specific date
  const getSupervisorsForDate = (date: string) => {
    return flightSupervisors[date] || [];
  };

  // Handlers
  const handleDeleteEntry = (entry: FlugbuchEntry) => {
    setSelectedEntry(entry);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSupervisor = (date: string, userId: number, name: string) => {
    setSelectedSupervisor({ date, userId, name });
    setDeleteSupervisorDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedEntry) return;

    try {
      await deleteEntry(selectedEntry.id);
      toast.success("Flugtag wurde gelöscht");
      await loadData();
      setDeleteDialogOpen(false);
      setSelectedEntry(null);
    } catch (error) {
      console.log("Offline-Modus: Lokale Änderung", error);
      setEntries(entries.filter(e => e.id !== selectedEntry.id));
      toast.warning("Flugtag gelöscht (Offline-Modus - nicht gespeichert)");
      setDeleteDialogOpen(false);
      setSelectedEntry(null);
    }
  };

  const confirmDeleteSupervisor = async () => {
    if (!selectedSupervisor) return;

    try {
      // TODO: Backend-Integration für Flugleiter-Löschung
      // await deleteSupervisor(selectedSupervisor.date, selectedSupervisor.userId);
      
      // Vorerst lokale Löschung (Mock-Modus)
      const updatedSupervisors = { ...flightSupervisors };
      if (updatedSupervisors[selectedSupervisor.date]) {
        updatedSupervisors[selectedSupervisor.date] = updatedSupervisors[selectedSupervisor.date].filter(
          s => s.user_id !== selectedSupervisor.userId
        );
        // Wenn keine Flugleiter mehr für diesen Tag, entferne den Tag komplett
        if (updatedSupervisors[selectedSupervisor.date].length === 0) {
          delete updatedSupervisors[selectedSupervisor.date];
        }
      }
      setFlightSupervisors(updatedSupervisors);
      
      toast.success("Flugleiter-Eintrag wurde gelöscht");
      setDeleteSupervisorDialogOpen(false);
      setSelectedSupervisor(null);
    } catch (error) {
      console.error("Fehler beim Löschen des Flugleiter-Eintrags:", error);
      toast.error("Fehler beim Löschen des Flugleiter-Eintrags");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterUser("all");
    setFilterDateFrom("");
    setFilterDateTo("");
    setFilterModelType("all");
    setFilterWithInstructor("all");
    setFilterWithIssues("all");
    setCurrentPage(1);
  };

  const handleJumpToDate = (date: string) => {
    setJumpToDate(date);
    if (!date) return;
    
    // Finde den Index des Datums in allDaysInRange
    const dateIndex = allDaysInRange.findIndex(d => d === date);
    
    if (dateIndex !== -1) {
      // Setze die Seite (Index + 1, da Seiten bei 1 beginnen)
      setCurrentPage(dateIndex + 1);
      toast.success(`Zu ${new Date(date).toLocaleDateString('de-DE', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })} gesprungen`);
    } else {
      toast.error("Kein Flugtag an diesem Datum gefunden");
    }
  };

  const handleExportDayToPDF = async (date: string) => {
    try {
      const dayEntries = filteredEntries.filter(entry => entry.flight_date === date);
      const supervisors = flightSupervisors[date] || [];
      
      await exportFlightDayToPDF({
        date,
        entries: dayEntries,
        supervisors,
        users
      });
      
      toast.success("PDF wurde erfolgreich erstellt");
    } catch (error) {
      console.error("Fehler beim PDF-Export:", error);
      toast.error("Fehler beim Erstellen des PDFs");
    }
  };

  const handleExportSubmit = async () => {
    try {
      let entriesToExport: FlugbuchEntry[] = [];
      let startDate = '';
      let endDate = '';
      
      // Determine date range based on export type
      if (exportType === 'day') {
        if (!exportDate) {
          toast.error('Bitte wähle ein Datum aus');
          return;
        }
        entriesToExport = entries.filter(e => e.flight_date === exportDate);
        startDate = exportDate;
        endDate = exportDate;
      } else if (exportType === 'month') {
        if (!exportMonth) {
          toast.error('Bitte wähle einen Monat aus');
          return;
        }
        const [year, month] = exportMonth.split('-');
        entriesToExport = entries.filter(e => {
          const [eYear, eMonth] = e.flight_date.split('-');
          return eYear === year && eMonth === month;
        });
        startDate = `${year}-${month}-01`;
        const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
        endDate = `${year}-${month}-${lastDay.toString().padStart(2, '0')}`;
      } else if (exportType === 'year') {
        if (!exportYear) {
          toast.error('Bitte wähle ein Jahr aus');
          return;
        }
        entriesToExport = entries.filter(e => e.flight_date.startsWith(exportYear));
        startDate = `${exportYear}-01-01`;
        endDate = `${exportYear}-12-31`;
      } else if (exportType === 'range') {
        if (!exportStartDate || !exportEndDate) {
          toast.error('Bitte wähle Start- und Enddatum aus');
          return;
        }
        entriesToExport = entries.filter(e => 
          e.flight_date >= exportStartDate && e.flight_date <= exportEndDate
        );
        startDate = exportStartDate;
        endDate = exportEndDate;
      }
      
      if (entriesToExport.length === 0) {
        toast.error('Keine Einträge im gewählten Zeitraum gefunden');
        return;
      }
      
      // Export based on format
      if (exportFormat === 'pdf') {
        if (exportType === 'day') {
          // Use detailed day export for single day
          await handleExportDayToPDF(exportDate);
        } else {
          // Use range export for multiple days
          await exportFlugbuchRangeToPDF({
            startDate,
            endDate,
            entries: entriesToExport,
            supervisors: flightSupervisors,
            users,
            exportType: exportType === 'month' ? 'month' : exportType === 'year' ? 'year' : 'range'
          });
        }
        toast.success('PDF wurde erfolgreich erstellt');
      } else if (exportFormat === 'csv') {
        exportFlugbuchToCSV({
          entries: entriesToExport,
          supervisors: flightSupervisors,
          users,
          startDate,
          endDate,
          exportType
        });
        toast.success('CSV wurde erfolgreich erstellt');
      }
      
      setExportDialogOpen(false);
    } catch (error) {
      console.error('Fehler beim Export:', error);
      toast.error('Fehler beim Exportieren');
    }
  };

  const getModelTypeBadge = (type?: string) => {
    if (!type) return null;
    
    if (type === "Elektro") {
      return (
        <Badge variant="outline" className="gap-1 bg-success-light text-success-light-foreground border-success">
          <Zap className="h-3 w-3" />
          Elektro
        </Badge>
      );
    }
    
    if (type === "Verbrenner") {
      return (
        <Badge variant="outline" className="gap-1 bg-guest-light text-guest-light-foreground border-guest">
          <Fuel className="h-3 w-3" />
          Verbrenner
        </Badge>
      );
    }
    
    return <Badge variant="outline">{type}</Badge>;
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  // Sortierfunktion: Gastflieger → Schulung → Mitglieder, jeweils nach Startzeit
  const sortEntriesByGroup = (entries: FlugbuchEntry[]): FlugbuchEntry[] => {
    return entries.sort((a, b) => {
      // Bestimme Gruppe für jeden Eintrag
      const getGroup = (entry: FlugbuchEntry) => {
        if (!entry.user_id) return 0; // Gastflieger (kein registriertes Mitglied)
        if (entry.instructor_id) return 1; // Schulungsbetrieb
        return 2; // Normale Mitglieder
      };
      
      const groupA = getGroup(a);
      const groupB = getGroup(b);
      
      // Erst nach Gruppe sortieren
      if (groupA !== groupB) {
        return groupA - groupB;
      }
      
      // Innerhalb der Gruppe nach Startzeit sortieren
      const timeA = a.flight_time || "99:99"; // Falls keine Zeit, ans Ende
      const timeB = b.flight_time || "99:99";
      
      return timeA.localeCompare(timeB);
    });
  };

  // Gruppiere Einträge nach Datum
  const groupedByDate = useMemo(() => {
    const grouped: Record<string, FlugbuchEntry[]> = {};
    
    filteredEntries.forEach(entry => {
      const date = entry.flight_date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(entry);
    });
    
    // Sortiere Einträge innerhalb jedes Datums
    Object.keys(grouped).forEach(date => {
      grouped[date] = sortEntriesByGroup(grouped[date]);
    });
    
    return grouped;
  }, [filteredEntries]);

  // Erstelle eine Liste aller Tage im Zeitraum (inkl. Lücken)
  const allDaysInRange = useMemo(() => {
    if (filteredEntries.length === 0) return [];
    
    const dates = filteredEntries.map(e => new Date(e.flight_date));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    const days: string[] = [];
    const currentDate = new Date(minDate);
    
    while (currentDate <= maxDate) {
      days.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  }, [filteredEntries]);

  // Paginated days (nicht Einträge!)
  const totalPages = Math.ceil(allDaysInRange.length / itemsPerPage);

  // Set initial page to most recent date (only once on first load)
  useEffect(() => {
    if (allDaysInRange.length === 0 || initialPageSet) return;
    
    // Set to last page (most recent date)
    setCurrentPage(totalPages);
    setInitialPageSet(true);
  }, [allDaysInRange, totalPages, initialPageSet]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lade Flugbuch-Daten...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="mb-2">Flugbuch-Verwaltung</h2>
          <p className="text-muted-foreground">
            Übersicht und Verwaltung aller Flugtage
          </p>
        </div>
        <Button className="gap-2" variant="outline" onClick={() => setExportDialogOpen(true)}>
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Offline-Modus Alert */}
      {offlineMode && (
        <Alert className="border-flugleiter bg-flugleiter-light">
          <AlertTriangle className="h-4 w-4 text-flugleiter" />
          <AlertDescription className="text-flugleiter">
            <strong>Offline-Modus:</strong> Backend nicht erreichbar. Änderungen werden nur lokal angezeigt und nicht gespeichert.
          </AlertDescription>
        </Alert>
      )}

      {/* Issues Alert */}
      {stats.withIssues > 0 && (
        <Alert className="border-warning bg-warning-light">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertDescription className="text-warning">
            <strong>{stats.withIssues} Flugtag(e)</strong> mit gemeldeten Problemen
          </AlertDescription>
        </Alert>
      )}



      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="entries">
            <FileText className="h-4 w-4 mr-2" />
            Flugtage
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-pilot-light to-pilot-light/50 border-pilot/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm text-pilot-light-foreground">Flugtage {new Date().getFullYear()}</CardTitle>
                <div className="rounded-lg bg-pilot/10 p-2">
                  <Calendar className="h-4 w-4 text-pilot" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-pilot-light-foreground">{stats.totalDays}</div>
                <p className="text-xs text-pilot-light-foreground/70">
                  {stats.totalDays30} in den letzten 30 Tagen
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-member-light to-member-light/50 border-member/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm text-member-light-foreground">Aktive Piloten {new Date().getFullYear()}</CardTitle>
                <div className="rounded-lg bg-member/10 p-2">
                  <Users className="h-4 w-4 text-member" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-member-light-foreground">{stats.uniquePilots}</div>
                <p className="text-xs text-member-light-foreground/70">
                  {stats.uniquePilots30} in den letzten 30 Tagen
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-flugleiter-light to-flugleiter-light/50 border-flugleiter/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm text-flugleiter-light-foreground">Flugzeit {new Date().getFullYear()}</CardTitle>
                <div className="rounded-lg bg-flugleiter/10 p-2">
                  <Clock className="h-4 w-4 text-flugleiter" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-flugleiter-light-foreground">{stats.totalHours}h</div>
                <p className="text-xs text-flugleiter-light-foreground/70">
                  {stats.totalHours30}h in den letzten 30 Tagen
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-guest-light to-guest-light/50 border-guest/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm text-guest-light-foreground">Gastflieger {new Date().getFullYear()}</CardTitle>
                <div className="rounded-lg bg-guest/10 p-2">
                  <UserPlus className="h-4 w-4 text-guest" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl text-guest-light-foreground">{stats.guestDays}</div>
                <p className="text-xs text-guest-light-foreground/70">
                  {stats.guestDays30} in den letzten 30 Tagen
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Letzte Flugtage Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Letzte Flugtage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentDays.length > 0 ? (
                  stats.recentDays.map((day, index) => {
                    const date = new Date(day.date);
                    const isToday = day.date === new Date().toISOString().split('T')[0];
                    
                    return (
                      <div 
                        key={day.date} 
                        className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0 hover:bg-muted/50 -mx-4 px-4 py-2 rounded-lg transition-colors cursor-pointer"
                        onClick={() => {
                          setActiveTab("entries");
                          handleJumpToDate(day.date);
                        }}
                      >
                        <div className={`rounded-xl p-3 text-white min-w-[4rem] text-center ${
                          isToday ? 'bg-primary' : 'bg-muted-foreground'
                        }`}>
                          <div className="text-2xl leading-none mb-1">{date.getDate()}</div>
                          <div className="text-xs opacity-90">
                            {date.toLocaleDateString('de-DE', { month: 'short' })}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="font-medium">
                              {date.toLocaleDateString('de-DE', { 
                                weekday: 'long', 
                                day: 'numeric', 
                                month: 'long',
                                year: 'numeric'
                              })}
                            </p>
                            {isToday && (
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                                Heute
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {day.entryCount} {day.entryCount === 1 ? 'Eintrag' : 'Einträge'} • {day.pilotCount} {day.pilotCount === 1 ? 'Pilot' : 'Piloten'}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {day.hasGuests && (
                              <Badge variant="outline" className="gap-1 text-xs bg-guest-light text-guest-light-foreground border-guest/30">
                                <UserPlus className="h-3 w-3" />
                                Gäste
                              </Badge>
                            )}
                            {day.hasTraining && (
                              <Badge variant="outline" className="gap-1 text-xs bg-training-light text-training-light-foreground border-training/30">
                                <GraduationCap className="h-3 w-3" />
                                Schulung
                              </Badge>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">Keine Flugtage vorhanden</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Entries Tab */}
        <TabsContent value="entries" className="space-y-6">

          {/* Pagination - Above Table */}
          {totalPages > 1 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm">
                          Tag {currentPage} von {totalPages} Tagen
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="gap-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Vorheriger Tag</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="gap-2"
                      >
                        <span className="hidden sm:inline">Nächster Tag</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Jump to Date */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-3 border-t">
                    <Label htmlFor="jump-to-date" className="text-sm text-muted-foreground sm:min-w-[120px]">
                      Springe zu Datum:
                    </Label>
                    <div className="flex-1 sm:max-w-xs">
                      <Input
                        id="jump-to-date"
                        type="date"
                        value={jumpToDate}
                        onChange={(e) => handleJumpToDate(e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Flugtag Details - Hauptcard mit Untercards */}
          {allDaysInRange.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((date) => {
            const dayEntries = groupedByDate[date] || [];
            const supervisors = getSupervisorsForDate(date);
            const hasFlights = dayEntries.length > 0;
            
            // Sammle alle Vorfälle des Tages
            const dayIncidents: { source: string; description: string; time?: string }[] = [];
            
            // Vorfälle von Flugleitern
            supervisors.forEach(supervisor => {
              if (supervisor.incidents) {
                dayIncidents.push({
                  source: `Flugleiter: ${supervisor.name}`,
                  description: supervisor.incidents,
                  time: supervisor.start_time && supervisor.end_time ? `${supervisor.start_time} - ${supervisor.end_time}` : undefined
                });
              }
            });
            
            // Vorfälle von Piloten
            dayEntries.forEach(entry => {
              if (entry.issues) {
                dayIncidents.push({
                  source: `Pilot: ${getPilotName(entry)}`,
                  description: entry.issues,
                  time: entry.flight_time
                });
              }
            });

            return (
              <Card key={`day-${date}`} className="overflow-hidden">
                {/* Hauptcard Header */}
                <CardHeader className="bg-muted/30 rounded-t-lg">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <CardTitle className="text-center sm:text-left flex-1">
                      Flugtag vom {new Date(date).toLocaleDateString('de-DE', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </CardTitle>
                    <Button 
                      variant="outline" 
                      className="gap-2 w-full sm:w-auto"
                      onClick={() => handleExportDayToPDF(date)}
                    >
                      <Download className="h-4 w-4" />
                      Tag als PDF Exportieren
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-6 space-y-4">
                  {/* 1. Untercard: Flugleiter */}
                  {supervisors.length > 0 && (
                    <Card className="border-flugleiter overflow-hidden">
                      <CardHeader className="bg-flugleiter-light rounded-t-lg">
                        <CardTitle className="flex items-center gap-2 text-flugleiter-light-foreground">
                          <Radio className="h-5 w-5 text-flugleiter" />
                          Flugleiter
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 sm:px-6 py-0">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-flugleiter-light/50 hover:bg-flugleiter-light/50">
                                <TableHead>Flugleiter</TableHead>
                                <TableHead>Zeit</TableHead>
                                <TableHead>Dauer</TableHead>
                                <TableHead>Vorfälle</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aktionen</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {supervisors.map((supervisor, index) => {
                                // Prüfe ob noch im Dienst (kein end_time)
                                const isActive = supervisor.start_time && !supervisor.end_time;
                                
                                // Calculate duration nur wenn end_time vorhanden
                                let duration = 0;
                                if (supervisor.start_time && supervisor.end_time) {
                                  const [startHour, startMin] = supervisor.start_time.split(':').map(Number);
                                  const [endHour, endMin] = supervisor.end_time.split(':').map(Number);
                                  duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);
                                }
                                
                                return (
                                  <TableRow key={`${date}-${supervisor.user_id}-${index}`} className={isActive ? "bg-status-active-light/30" : ""}>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-flugleiter" />
                                        <span className="text-flugleiter">{supervisor.name}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2 text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        {supervisor.start_time ? (
                                          <span>
                                            {supervisor.start_time}
                                            {supervisor.end_time && ` - ${supervisor.end_time}`}
                                          </span>
                                        ) : (
                                          <span className="text-xs italic">Keine Zeit</span>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      {isActive ? (
                                        <span className="text-muted-foreground text-sm italic"></span>
                                      ) : (
                                        <div className="flex items-center gap-2">
                                          <Timer className="h-4 w-4 text-muted-foreground" />
                                          <span>{duration > 0 ? formatDuration(duration) : ''}</span>
                                        </div>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      {supervisor.incidents ? (
                                        <div className="flex items-start gap-2">
                                          <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                                          <span className="text-sm">{supervisor.incidents}</span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                          <CheckCircle2 className="h-4 w-4 text-success" />
                                          <span className="text-sm italic">Keine Vorfälle</span>
                                        </div>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      {isActive ? (
                                        <Badge variant="outline" className="gap-1 bg-status-active text-status-active-foreground border-status-active">
                                          <Radio className="h-3 w-3" />
                                          Im Dienst
                                        </Badge>
                                      ) : (
                                        <Badge variant="outline" className="gap-1 bg-status-inactive text-status-inactive-foreground border-status-inactive">
                                          <CheckCircle2 className="h-3 w-3" />
                                          Außer Dienst
                                        </Badge>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-destructive hover:text-destructive"
                                        onClick={() => handleDeleteSupervisor(date, supervisor.user_id, supervisor.name)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* 2. Untercard: Piloten */}
                  <Card className="border-pilot overflow-hidden">
                    <CardHeader className="bg-pilot-light rounded-t-lg">
                      <CardTitle className="flex items-center gap-2 text-pilot-light-foreground">
                        <Plane className="h-5 w-5 text-pilot" />
                        Piloten
                        {hasFlights && (
                          <Badge variant="secondary" className="ml-2">
                            {dayEntries.length} {dayEntries.length === 1 ? 'Eintrag' : 'Einträge'}
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6 py-0">
                      {!hasFlights ? (
                        <div className="p-8 text-center">
                          <Alert className="border-status-inactive">
                            <XCircle className="h-5 w-5 text-status-inactive" />
                            <AlertDescription className="text-status-inactive-light-foreground">
                              An diesem Tag wurde kein Flugbetrieb durchgeführt.
                            </AlertDescription>
                          </Alert>
                        </div>
                      ) : (
                        <>
                          {/* Desktop View */}
                          <div className="hidden md:block overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow className="hover:bg-muted/50">
                                  <TableHead>Pilot</TableHead>
                                  <TableHead>Zeit</TableHead>
                                  <TableHead>Dauer</TableHead>
                                  <TableHead>Typ</TableHead>
                                  <TableHead>Antrieb</TableHead>
                                  <TableHead>Fernsteuerung</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead className="text-right">Aktionen</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {dayEntries.map((entry) => {
                                  // Determine pilot type
                                  const getPilotType = () => {
                                    if (entry.is_guest) {
                                      return 'Gastflieger';
                                    }
                                    return 'Mitglied';
                                  };

                                  const getPilotIconColor = () => {
                                    // Schulungsbetrieb = Lila
                                    if (entry.flight_type === 'training') {
                                      return 'text-training';
                                    }
                                    // Gastflieger = Orange
                                    if (entry.is_guest) {
                                      return 'text-guest';
                                    }
                                    // Mitglied = Indigo
                                    return 'text-member';
                                  };

                                  // For training flights, show instructor first
                                  if (entry.flight_type === 'training' && entry.instructor_first_name && entry.instructor_last_name) {
                                    return (
                                      <>
                                        {/* Fluglehrer-Zeile */}
                                        <TableRow key={`${entry.id}-instructor`} className={!entry.end_time ? "bg-status-active-light/30" : ""}>
                                          <TableCell>
                                            <div className="flex items-center gap-2">
                                              <User className="h-4 w-4 text-training" />
                                              <span className="text-training">{entry.instructor_first_name} {entry.instructor_last_name}</span>
                                            </div>
                                          </TableCell>
                                          <TableCell>
                                            <div className="flex items-center gap-2">
                                              <Clock className="h-4 w-4 text-muted-foreground" />
                                              {entry.flight_time ? (
                                                <span>
                                                  {entry.flight_time}
                                                  {entry.end_time && ` - ${entry.end_time}`}
                                                </span>
                                              ) : (
                                                <span className="text-xs italic">Keine Zeit</span>
                                              )}
                                            </div>
                                          </TableCell>
                                          <TableCell>
                                            {!entry.end_time ? (
                                              <span className="text-muted-foreground text-sm italic"></span>
                                            ) : (
                                              <div className="flex items-center gap-2">
                                                <Timer className="h-4 w-4 text-muted-foreground" />
                                                <span>{entry.duration > 0 ? formatDuration(entry.duration) : ''}</span>
                                              </div>
                                            )}
                                          </TableCell>
                                          <TableCell>
                                            <Badge variant="outline" className="bg-member-light text-member-light-foreground border-member">
                                              Mitglied
                                            </Badge>
                                          </TableCell>
                                          <TableCell>{getModelTypeBadge(entry.model_type)}</TableCell>
                                          <TableCell>
                                            <span className="text-sm text-muted-foreground">{entry.model_name || '-'}</span>
                                          </TableCell>
                                          <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                              {!entry.end_time ? (
                                                <Badge variant="outline" className="gap-1 bg-status-active text-status-active-foreground border-status-active">
                                                  <Radio className="h-3 w-3" />
                                                  Aktiv
                                                </Badge>
                                              ) : (
                                                <Badge variant="outline" className="gap-1 bg-status-inactive text-status-inactive-foreground border-status-inactive">
                                                  <CheckCircle2 className="h-3 w-3" />
                                                  Beendet
                                                </Badge>
                                              )}
                                              {entry.issues && (
                                                <Badge variant="outline" className="gap-1 border-warning bg-warning-light text-warning">
                                                  <AlertTriangle className="h-3 w-3" />
                                                  Vorfall
                                                </Badge>
                                              )}
                                            </div>
                                          </TableCell>
                                          <TableCell className="text-right">
                                            <Button 
                                              variant="ghost" 
                                              size="sm" 
                                              className="text-destructive hover:text-destructive"
                                              onClick={() => handleDeleteEntry(entry)}
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </TableCell>
                                        </TableRow>
                                        {/* Schüler-Zeile direkt darunter */}
                                        <TableRow 
                                          key={entry.id} 
                                          className={`border-t-0 ${!entry.end_time ? "bg-status-active-light/30" : ""}`}
                                        >
                                          <TableCell>
                                            <div className="flex items-center gap-2 pl-4">
                                              <GraduationCap className="h-4 w-4 text-training" />
                                              <span className="italic">↳ {getPilotName(entry)}</span>
                                            </div>
                                          </TableCell>
                                          <TableCell>
                                            <div className="flex items-center gap-2">
                                              <Clock className="h-4 w-4 text-muted-foreground" />
                                              {entry.student_flight_time && entry.student_end_time ? (
                                                <span>{entry.student_flight_time} - {entry.student_end_time}</span>
                                              ) : entry.flight_time && entry.end_time ? (
                                                <span className="text-muted-foreground">{entry.flight_time} - {entry.end_time}</span>
                                              ) : (
                                                <span className="text-xs italic">Keine Zeit</span>
                                              )}
                                            </div>
                                          </TableCell>
                                          <TableCell>
                                            {!(entry.student_end_time || entry.end_time) ? (
                                              <span className="text-muted-foreground text-sm italic"></span>
                                            ) : (
                                              <div className="flex items-center gap-2">
                                                <Timer className="h-4 w-4 text-muted-foreground" />
                                                <span>{formatDuration(entry.student_duration || entry.duration)}</span>
                                              </div>
                                            )}
                                          </TableCell>
                                          <TableCell>
                                            <Badge variant="outline" className="bg-member-light text-member-light-foreground border-member">
                                              Mitglied
                                            </Badge>
                                          </TableCell>
                                          <TableCell>{getModelTypeBadge(entry.model_type)}</TableCell>
                                          <TableCell>
                                            <span className="text-sm text-muted-foreground">{entry.model_name || '-'}</span>
                                          </TableCell>
                                          <TableCell>
                                            {!(entry.student_end_time || entry.end_time) ? (
                                              <Badge variant="outline" className="gap-1 bg-status-active text-status-active-foreground border-status-active">
                                                <Radio className="h-3 w-3" />
                                                Aktiv
                                              </Badge>
                                            ) : (
                                              <Badge variant="outline" className="gap-1 bg-status-inactive text-status-inactive-foreground border-status-inactive">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Beendet
                                              </Badge>
                                            )}
                                          </TableCell>
                                          <TableCell className="text-right">
                                            <Button 
                                              variant="ghost" 
                                              size="sm" 
                                              className="text-destructive hover:text-destructive"
                                              onClick={() => handleDeleteEntry(entry)}
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </TableCell>
                                        </TableRow>
                                      </>
                                    );
                                  }

                                  // Normal entry (not training or training without instructor)
                                  return (
                                    <TableRow key={entry.id} className={!entry.end_time ? "bg-status-active-light/30" : ""}>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <User className={`h-4 w-4 ${getPilotIconColor()}`} />
                                          <span>{getPilotName(entry)}</span>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <Clock className="h-4 w-4 text-muted-foreground" />
                                          {entry.flight_time ? (
                                            <span>
                                              {entry.flight_time}
                                              {entry.end_time && ` - ${entry.end_time}`}
                                            </span>
                                          ) : (
                                            <span className="text-xs italic">Keine Zeit</span>
                                          )}
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        {!entry.end_time ? (
                                          <span className="text-muted-foreground text-sm italic"></span>
                                        ) : (
                                          <div className="flex items-center gap-2">
                                            <Timer className="h-4 w-4 text-muted-foreground" />
                                            <span>{entry.duration > 0 ? formatDuration(entry.duration) : ''}</span>
                                          </div>
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        <Badge 
                                          variant="outline" 
                                          className={entry.is_guest 
                                            ? "bg-guest-light text-guest-light-foreground border-guest" 
                                            : "bg-member-light text-member-light-foreground border-member"
                                          }
                                        >
                                          {getPilotType()}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>{getModelTypeBadge(entry.model_type)}</TableCell>
                                      <TableCell>
                                        <span className="text-sm text-muted-foreground">{entry.model_name || '-'}</span>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                          {!entry.end_time ? (
                                            <Badge variant="outline" className="gap-1 bg-status-active text-status-active-foreground border-status-active">
                                              <Radio className="h-3 w-3" />
                                              Aktiv
                                            </Badge>
                                          ) : (
                                            <Badge variant="outline" className="gap-1 bg-status-inactive text-status-inactive-foreground border-status-inactive">
                                              <CheckCircle2 className="h-3 w-3" />
                                              Beendet
                                            </Badge>
                                          )}
                                          {entry.issues && (
                                            <Badge variant="outline" className="gap-1 border-warning bg-warning-light text-warning">
                                              <AlertTriangle className="h-3 w-3" />
                                              Vorfall
                                            </Badge>
                                          )}
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="text-destructive hover:text-destructive"
                                          onClick={() => handleDeleteEntry(entry)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>

                          {/* Mobile View */}
                          <div className="md:hidden divide-y divide-border">{dayEntries.map((entry) => {
                            // Determine pilot icon color based on type
                            const getPilotIconColor = () => {
                              // Schulungsbetrieb = Lila
                              if (entry.flight_type === 'training') {
                                return 'text-training';
                              }
                              // Mitglied (hat user_id) = Indigo
                              if (entry.user_id) {
                                return 'text-member';
                              }
                              // Gastflieger (kein user_id) = Orange
                              return 'text-guest';
                            };

                            return (
                              <div key={entry.id} className={`p-4 ${!entry.end_time ? "bg-status-active-light/30" : ""}`}>
                                <div className="flex items-start justify-between gap-2 mb-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <User className={`h-4 w-4 ${getPilotIconColor()} flex-shrink-0`} />
                                      <p className="truncate">{getPilotName(entry)}</p>
                                    </div>
                                    {getStudentName(entry) && (
                                      <div className="flex flex-col gap-1 ml-6 mt-2">
                                        <div className="flex items-center gap-2 text-sm">
                                          <GraduationCap className="h-3 w-3 text-training flex-shrink-0" />
                                          <p className="truncate">Schüler: {getStudentName(entry)}</p>
                                        </div>
                                        {(entry.student_flight_time || entry.student_end_time || entry.student_duration) && (
                                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            {entry.student_flight_time && entry.student_end_time && (
                                              <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                <span>{entry.student_flight_time} - {entry.student_end_time}</span>
                                              </div>
                                            )}
                                            {entry.student_duration && (
                                              <div className="flex items-center gap-1">
                                                <Timer className="h-3 w-3" />
                                                <span>{formatDuration(entry.student_duration)}</span>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-col gap-1 items-end">
                                    {getModelTypeBadge(entry.model_type)}
                                  </div>
                                </div>
                                <div className="space-y-2 text-sm">
                                  {entry.flight_time && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <Clock className="h-4 w-4" />
                                      <span>
                                        {entry.flight_time}
                                        {entry.end_time && ` - ${entry.end_time}`} Uhr
                                      </span>
                                    </div>
                                  )}
                                  {entry.end_time && entry.duration > 0 && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <Timer className="h-4 w-4" />
                                      <span>{formatDuration(entry.duration)}</span>
                                    </div>
                                  )}
                                  <div className="flex flex-wrap gap-1">
                                    {!entry.end_time ? (
                                      <Badge variant="outline" className="gap-1 border-status-active bg-status-active-light text-status-active text-xs">
                                        <Radio className="h-2.5 w-2.5" />
                                        Eingetragen
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="gap-1 border-status-inactive bg-status-inactive-light text-status-inactive text-xs">
                                        <CheckCircle2 className="h-2.5 w-2.5" />
                                        Ausgetragen
                                      </Badge>
                                    )}
                                    {entry.issues && (
                                      <Badge variant="outline" className="gap-1 border-warning bg-warning-light text-warning text-xs">
                                        <AlertTriangle className="h-2.5 w-2.5" />
                                        Vorfall
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex justify-end pt-2">
                                    <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleDeleteEntry(entry)}>
                                      <Trash2 className="h-4 w-4 mr-1" />
                                      Löschen
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* 3. Untercard: Vorfälle */}
                  {dayIncidents.length > 0 && (
                    <Card className="border-warning overflow-hidden">
                      <CardHeader className="bg-warning-light rounded-t-lg">
                        <CardTitle className="flex items-center gap-2 text-warning-light-foreground">
                          <AlertTriangle className="h-5 w-5 text-warning" />
                          Vorfälle / Besonderheiten
                          <Badge variant="secondary" className="ml-2">
                            {dayIncidents.length}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {dayIncidents.map((incident, index) => (
                            <div 
                              key={index} 
                              className="p-4 bg-background rounded-lg border border-warning"
                            >
                              <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm text-warning">{incident.source}</span>
                                    {incident.time && (
                                      <Badge variant="outline" className="text-xs">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {incident.time}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">{incident.description}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Flugtag löschen?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                Möchtest du diesen Flugtag-Eintrag wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                {selectedEntry && (
                  <div className="mt-4 p-4 bg-muted rounded-md space-y-2">
                    <div><strong>Pilot:</strong> {getPilotName(selectedEntry)}</div>
                    <div><strong>Datum:</strong> {new Date(selectedEntry.flight_date).toLocaleDateString('de-DE')}</div>
                    <div><strong>Dauer:</strong> {formatDuration(selectedEntry.duration)}</div>
                    {selectedEntry.model_name && (
                      <div><strong>Modell:</strong> {selectedEntry.model_name}</div>
                    )}
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Supervisor Confirmation Dialog */}
      <AlertDialog open={deleteSupervisorDialogOpen} onOpenChange={setDeleteSupervisorDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Flugleiter-Eintrag löschen?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                Möchtest du diesen Flugleiter-Eintrag wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                {selectedSupervisor && (
                  <div className="mt-4 p-4 bg-muted rounded-md space-y-2">
                    <div><strong>Flugleiter:</strong> {selectedSupervisor.name}</div>
                    <div><strong>Datum:</strong> {new Date(selectedSupervisor.date).toLocaleDateString('de-DE', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}</div>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSupervisor} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Flugbuch exportieren</DialogTitle>
            <DialogDescription>
              Wähle Zeitraum und Format für den Export aus.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Export Type Selection */}
            <div className="space-y-2">
              <Label>Zeitraum</Label>
              <Select value={exportType} onValueChange={(value: any) => setExportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Einzelner Tag</SelectItem>
                  <SelectItem value="month">Monat</SelectItem>
                  <SelectItem value="year">Jahr</SelectItem>
                  <SelectItem value="range">Zeitraum</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Selection based on Type */}
            {exportType === 'day' && (
              <div className="space-y-2">
                <Label>Datum</Label>
                <Input
                  type="date"
                  value={exportDate}
                  onChange={(e) => setExportDate(e.target.value)}
                />
              </div>
            )}

            {exportType === 'month' && (
              <div className="space-y-2">
                <Label>Monat</Label>
                <Input
                  type="month"
                  value={exportMonth}
                  onChange={(e) => setExportMonth(e.target.value)}
                />
              </div>
            )}

            {exportType === 'year' && (
              <div className="space-y-2">
                <Label>Jahr</Label>
                <Select value={exportYear} onValueChange={setExportYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Jahr auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() - i;
                      return (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

            {exportType === 'range' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Von</Label>
                  <Input
                    type="date"
                    value={exportStartDate}
                    onChange={(e) => setExportStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bis</Label>
                  <Input
                    type="date"
                    value={exportEndDate}
                    onChange={(e) => setExportEndDate(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Format Selection */}
            <div className="space-y-2">
              <Label>Format</Label>
              <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV (Excel)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Info */}
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                {exportFormat === 'pdf' && exportType === 'day' && (
                  "Detaillierter Export mit Flugleitern, Piloten und Vorfällen."
                )}
                {exportFormat === 'pdf' && exportType !== 'day' && (
                  "Übersichts-Export mit Zusammenfassung aller Flugtage."
                )}
                {exportFormat === 'csv' && (
                  "Tabellarischer Export für Excel und andere Tabellenkalkulationen."
                )}
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleExportSubmit} className="gap-2">
              <Download className="h-4 w-4" />
              Exportieren
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
