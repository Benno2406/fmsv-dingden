import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Tabs as TabsComponent, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { 
  Search, 
  UserPlus, 
  Download, 
  Filter, 
  Edit, 
  Users, 
  UserCheck, 
  GraduationCap, 
  UserX,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Cake,
  Grid3x3,
  List,
  Eye,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  User,
  CreditCard,
  Settings,
  Home,
  Shield,
  Building2,
  FileCheck,
  Save,
  X as XIcon
} from "lucide-react";
import { Tabs, TabsList as ViewTabsList, TabsTrigger as ViewTabsTrigger } from "../../components/ui/tabs";
import { MemberEditDialog } from "../../components/admin/MemberEditDialog";
import { toast } from "sonner";

interface Member {
  id: string;
  // Persönliche Daten
  firstName: string;
  lastName: string;
  birthDate: string;
  beruf?: string;
  
  // Kontaktdaten
  email: string;
  phone?: string;
  mobile?: string;
  
  // Adresse
  strasse: string;
  plz: string;
  wohnort: string;
  
  // Elternteil 1 (nur bei Jugend)
  parent1_name?: string;
  parent1_relation?: string; // z.B. "Vater", "Mutter", "Erziehungsberechtigter"
  parent1_email?: string;
  parent1_phone?: string;
  parent1_mobile?: string;
  
  // Elternteil 2 (nur bei Jugend)
  parent2_name?: string;
  parent2_relation?: string; // z.B. "Vater", "Mutter", "Erziehungsberechtigter"
  parent2_email?: string;
  parent2_phone?: string;
  parent2_mobile?: string;
  
  // Bankdaten
  iban?: string;
  bic?: string;
  kreditinstitut?: string;
  
  // Vereinsdaten
  memberType: "Aktiv" | "Passiv" | "Jugend" | "Ehren";
  role?: "Vorstand" | "Mitglied"; // Hierarchieebene
  position?: string; // z.B. "Vorsitzender", "Kassierer", "Jugendwart", etc.
  joinDate: string;
  
  // Flugdaten
  kenntnisausweisnummer?: string;
  kenntnisausweisAblauf?: string;
  kenntnisnachweisStatus: "valid" | "expiring" | "expired" | "none";
  luftfahrtId?: string;
  dmfvMitgliedsnummer?: string;
  
  // Sonstiges
  notes?: string;
}

export function MitgliederPage() {
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  
  // State für "Neues Mitglied" Dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addMemberActiveTab, setAddMemberActiveTab] = useState("personal");
  const [newMemberData, setNewMemberData] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    email: "",
    phone: "",
    mobile: "",
    strasse: "",
    plz: "",
    wohnort: "",
    iban: "",
    bic: "",
    kreditinstitut: "",
    sepaMandatErteilt: false,
    sepaMandatDatum: "",
    dmfvMitgliedsnummer: "",
    memberType: "Aktiv" as "Aktiv" | "Passiv" | "Jugend" | "Ehren",
    role: "Mitglied" as "Vorstand" | "Mitglied" | undefined,
    position: "",
    joinDate: "",
    parent1_name: "",
    parent1_relation: "",
    parent1_email: "",
    parent1_phone: "",
    parent1_mobile: "",
    parent2_name: "",
    parent2_relation: "",
    parent2_email: "",
    parent2_phone: "",
    parent2_mobile: "",
  });

  // State für "Export" Dialog
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportActiveTab, setExportActiveTab] = useState("members");
  const [exportSelectionTab, setExportSelectionTab] = useState<"all" | "type" | "individual">("all");
  const [exportMemberType, setExportMemberType] = useState<"Aktiv" | "Passiv" | "Jugend" | "Ehren">("Aktiv");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const [members] = useState<Member[]>([
    {
      id: "M001",
      firstName: "Thomas",
      lastName: "Müller",
      birthDate: "12.05.1975",
      beruf: "Ingenieur",
      email: "thomas.mueller@email.de",
      phone: "02852 123456",
      mobile: "0172 1234567",
      strasse: "Musterstraße 12",
      plz: "46499",
      wohnort: "Hamminkeln",
      iban: "DE89 3704 0044 0532 0130 00",
      bic: "COBADEFFXXX",
      kreditinstitut: "Commerzbank",
      memberType: "Aktiv",
      role: "Vorstand",
      position: "1. Vorsitzender",
      joinDate: "15.03.2018",
      kenntnisausweisnummer: "DE-NRW-2018-1234",
      kenntnisausweisAblauf: "15.08.2025",
      kenntnisnachweisStatus: "valid",
      luftfahrtId: "LBA-FM-12345",
      dmfvMitgliedsnummer: "12345",
      notes: "Erfahrener Pilot, Fluglehrer"
    },
    {
      id: "M002",
      firstName: "Anna",
      lastName: "Schmidt",
      birthDate: "08.11.1982",
      beruf: "Lehrerin",
      email: "anna.schmidt@email.de",
      phone: "02852 234567",
      mobile: "0173 2345678",
      strasse: "Gartenweg 5",
      plz: "46499",
      wohnort: "Hamminkeln",
      iban: "DE12 5001 0517 0123 4567 89",
      bic: "INGDDEFFXXX",
      kreditinstitut: "ING-DiBa",
      memberType: "Aktiv",
      role: "Vorstand",
      position: "Kassiererin",
      joinDate: "22.07.2019",
      kenntnisausweisnummer: "DE-NRW-2019-5678",
      kenntnisausweisAblauf: "10.02.2026",
      kenntnisnachweisStatus: "valid",
      luftfahrtId: "LBA-FM-23456",
      dmfvMitgliedsnummer: "23456",
      notes: "Sehr zuverlässig, kümmert sich um die Vereinsfinanzen"
    },
    {
      id: "M003",
      firstName: "Jonas",
      lastName: "Weber",
      birthDate: "15.03.2008",
      beruf: "Schüler",
      email: "jonas.weber@email.de",
      phone: "02852 345678",
      mobile: "0174 3456789",
      strasse: "Schulstraße 23",
      plz: "46499",
      wohnort: "Hamminkeln",
      parent1_name: "Michael Weber",
      parent1_relation: "Vater",
      parent1_email: "michael.weber@email.de",
      parent1_phone: "02852 345678",
      parent1_mobile: "0171 9876543",
      parent2_name: "Sandra Weber",
      parent2_relation: "Mutter",
      parent2_email: "sandra.weber@email.de",
      parent2_phone: "02852 345678",
      parent2_mobile: "0172 8765432",
      iban: "DE89 3704 0044 0532 0130 00",
      bic: "COBADEFFXXX",
      kreditinstitut: "Commerzbank",
      memberType: "Jugend",
      role: "Mitglied",
      joinDate: "10.04.2023",
      kenntnisausweisnummer: "JUG-2023-042",
      kenntnisausweisAblauf: "15.03.2026",
      kenntnisnachweisStatus: "valid",
      luftfahrtId: "LBA-DE-2023-3456",
      dmfvMitgliedsnummer: "DMFV-456789",
      notes: "Sehr motiviert, macht schnelle Fortschritte"
    },
    {
      id: "M004",
      firstName: "Lisa",
      lastName: "Hoffmann",
      birthDate: "20.07.1988",
      beruf: "Architektin",
      email: "lisa.hoffmann@email.de",
      phone: "02852 456789",
      mobile: "0175 4567890",
      strasse: "Birkenallee 8",
      plz: "46499",
      wohnort: "Hamminkeln",
      iban: "DE45 2005 0550 1234 5678 90",
      bic: "HASPDEHHXXX",
      kreditinstitut: "Hamburger Sparkasse",
      memberType: "Aktiv",
      role: "Vorstand",
      position: "Jugendwartin",
      joinDate: "05.09.2020",
      kenntnisausweisnummer: "DE-NRW-2020-9012",
      kenntnisausweisAblauf: "30.04.2025",
      kenntnisnachweisStatus: "expiring",
      luftfahrtId: "LBA-FM-34567",
      dmfvMitgliedsnummer: "34567",
      notes: "Engagiert in der Jugendarbeit, Kenntnisausweis läuft bald ab"
    },
    {
      id: "M005",
      firstName: "Peter",
      lastName: "Klein",
      birthDate: "03.02.1965",
      beruf: "Unternehmer",
      email: "peter.klein@email.de",
      phone: "02852 567890",
      mobile: "0176 5678901",
      strasse: "Hauptstraße 45",
      plz: "46499",
      wohnort: "Hamminkeln",
      iban: "DE89 1203 0000 0012 3456 78",
      bic: "BYLADEM1001",
      kreditinstitut: "Deutsche Kreditbank",
      memberType: "Passiv",
      role: "Mitglied",
      joinDate: "18.11.2017",
      kenntnisnachweisStatus: "none",
      notes: "Fördermitglied"
    },
    {
      id: "M006",
      firstName: "Michael",
      lastName: "Becker",
      birthDate: "28.09.1970",
      beruf: "Elektriker",
      email: "michael.becker@email.de",
      phone: "02852 678901",
      mobile: "0177 6789012",
      strasse: "Feldweg 17",
      plz: "46499",
      wohnort: "Hamminkeln",
      iban: "DE44 5001 0517 5407 3249 31",
      bic: "INGDDEFFXXX",
      kreditinstitut: "ING-DiBa",
      memberType: "Aktiv",
      role: "Mitglied",
      position: "Webmaster",
      joinDate: "12.01.2015",
      kenntnisausweisnummer: "DE-NRW-2015-3456",
      kenntnisausweisAblauf: "01.01.2025",
      kenntnisnachweisStatus: "expired",
      luftfahrtId: "LBA-FM-45678",
      dmfvMitgliedsnummer: "45678",
      notes: "Kümmert sich um die Website, Kenntnisausweis abgelaufen - muss erneuert werden!"
    },
    {
      id: "M007",
      firstName: "Sarah",
      lastName: "Wagner",
      birthDate: "10.06.2009",
      beruf: "Schülerin",
      email: "sarah.wagner@email.de",
      phone: "02852 789012",
      mobile: "0178 7890123",
      strasse: "Dorfstraße 9",
      plz: "46499",
      wohnort: "Hamminkeln",
      
      // Elternteil 1
      parent1_name: "Markus Wagner",
      parent1_relation: "Vater",
      parent1_email: "markus.wagner@email.de",
      parent1_phone: "02852 789012",
      parent1_mobile: "0171 1112223",
      
      // Elternteil 2
      parent2_name: "Claudia Wagner",
      parent2_relation: "Mutter",
      parent2_email: "claudia.wagner@email.de",
      parent2_phone: "02852 789012",
      parent2_mobile: "0172 2223334",
      
      iban: "DE23 3705 0198 1234 5678 90",
      bic: "COLSDE33XXX",
      kreditinstitut: "Sparkasse Duisburg",
      memberType: "Jugend",
      role: "Mitglied",
      joinDate: "15.08.2024",
      kenntnisausweisnummer: "JUG-2024-098",
      kenntnisausweisAblauf: "15.08.2027",
      kenntnisnachweisStatus: "valid",
      luftfahrtId: "LBA-DE-2024-7890",
      dmfvMitgliedsnummer: "DMFV-789012",
      notes: "Anfängerin, zeigt großes Interesse"
    },
    {
      id: "M008",
      firstName: "Klaus",
      lastName: "Schneider",
      birthDate: "15.04.1955",
      beruf: "Rentner",
      email: "klaus.schneider@email.de",
      phone: "02852 890123",
      mobile: "0179 8901234",
      strasse: "Am Berg 3",
      plz: "46499",
      wohnort: "Hamminkeln",
      iban: "DE89 3704 0044 0532 0130 00",
      bic: "COBADEFFXXX",
      kreditinstitut: "Commerzbank",
      memberType: "Ehren",
      role: "Mitglied",
      joinDate: "01.06.2005",
      kenntnisausweisnummer: "DE-NRW-2005-1111",
      kenntnisausweisAblauf: "20.12.2025",
      kenntnisnachweisStatus: "valid",
      luftfahrtId: "LBA-FM-56789",
      dmfvMitgliedsnummer: "11111",
      notes: "Gründungsmitglied, langjähriger 1. Vorsitzender"
    },
    {
      id: "M009",
      firstName: "Sabine",
      lastName: "Fischer",
      birthDate: "22.09.1978",
      beruf: "Verwaltungsangestellte",
      email: "sabine.fischer@email.de",
      phone: "02852 111222",
      mobile: "0170 1112223",
      strasse: "Lindenweg 18",
      plz: "46499",
      wohnort: "Hamminkeln",
      iban: "DE56 3701 0050 0123 4567 89",
      bic: "PBNKDEFFXXX",
      kreditinstitut: "Postbank",
      memberType: "Passiv",
      role: "Mitglied",
      joinDate: "10.03.2022",
      kenntnisnachweisStatus: "none",
      notes: "Fördermitglied, interessiert an Vereinsaktivitäten"
    },
    {
      id: "M010",
      firstName: "Ralf",
      lastName: "Lehmann",
      birthDate: "05.07.1990",
      beruf: "IT-Spezialist",
      email: "ralf.lehmann@email.de",
      phone: "02852 333444",
      mobile: "0171 3334445",
      strasse: "Bergstraße 42",
      plz: "46499",
      wohnort: "Hamminkeln",
      iban: "DE78 1001 0010 0123 4567 89",
      bic: "PBNKDEFFXXX",
      kreditinstitut: "Postbank Berlin",
      memberType: "Aktiv",
      role: "Mitglied",
      joinDate: "18.05.2021",
      kenntnisausweisnummer: "DE-NRW-2021-7890",
      kenntnisausweisAblauf: "20.09.2026",
      kenntnisnachweisStatus: "valid",
      luftfahrtId: "LBA-FM-67890",
      dmfvMitgliedsnummer: "67890",
      notes: "Aktiver Pilot, fliegt gerne Scale-Modelle"
    },
  ]);

  // Filter members
  const filteredMembers = members.filter(member => {
    const matchesSearch = searchQuery === "" || 
      `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === "all" || member.memberType === filterType;
    
    return matchesSearch && matchesFilter;
  });

  // Calculate statistics
  const stats = {
    total: members.length,
    active: members.filter(m => m.memberType === "Aktiv").length,
    youth: members.filter(m => m.memberType === "Jugend").length,
    passive: members.filter(m => m.memberType === "Passiv").length,
    honorary: members.filter(m => m.memberType === "Ehren").length,
    validKenntnisnachweis: members.filter(m => m.kenntnisnachweisStatus === "valid").length,
    expiringKenntnisnachweis: members.filter(m => m.kenntnisnachweisStatus === "expiring").length,
    expiredKenntnisnachweis: members.filter(m => m.kenntnisnachweisStatus === "expired").length,
  };

  // Previous year statistics (from 2024)
  const previousYearStats = {
    total: 6,
    active: 4,
    youth: 1,
    passive: 1,
  };

  // Calculate changes
  const changes = {
    total: stats.total - previousYearStats.total,
    active: stats.active - previousYearStats.active,
    youth: stats.youth - previousYearStats.youth,
    passive: stats.passive - previousYearStats.passive,
  };

  // Helper to get trend icon and color
  const getTrendIndicator = (change: number) => {
    if (change > 0) {
      return {
        icon: TrendingUp,
        color: "text-green-600 dark:text-green-400",
        bg: "bg-green-50 dark:bg-green-950/30",
        text: `+${change}`,
      };
    } else if (change < 0) {
      return {
        icon: TrendingDown,
        color: "text-red-600 dark:text-red-400",
        bg: "bg-red-50 dark:bg-red-950/30",
        text: `${change}`,
      };
    } else {
      return {
        icon: Minus,
        color: "text-gray-600 dark:text-gray-400",
        bg: "bg-gray-50 dark:bg-gray-950/30",
        text: "±0",
      };
    }
  };

  // Calculate age from birthdate
  const calculateAge = (birthDate: string) => {
    const [day, month, year] = birthDate.split('.');
    const birth = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Get initials for avatar
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Get avatar color based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-teal-500",
      "bg-indigo-500",
      "bg-rose-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Get status badge
  const getStatusBadge = (status: Member["kenntnisnachweisStatus"]) => {
    switch (status) {
      case "valid":
        return (
          <Badge variant="outline" className="gap-1 border-green-500 text-green-700 bg-green-50 dark:bg-green-950/30 dark:text-green-400 dark:border-green-700">
            <CheckCircle className="h-3 w-3" />
            <span className="hidden sm:inline">Gültig</span>
          </Badge>
        );
      case "expiring":
        return (
          <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-700 bg-yellow-50 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-700">
            <AlertCircle className="h-3 w-3" />
            <span className="hidden sm:inline">Läuft ab</span>
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="outline" className="gap-1 border-red-500 text-red-700 bg-red-50 dark:bg-red-950/30 dark:text-red-400 dark:border-red-700">
            <XCircle className="h-3 w-3" />
            <span className="hidden sm:inline">Abgelaufen</span>
          </Badge>
        );
      default:
        return null;
    }
  };

  const getMemberTypeBadge = (type: Member["memberType"]) => {
    const variants: Record<Member["memberType"], string> = {
      "Aktiv": "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
      "Jugend": "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800",
      "Passiv": "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-400 dark:border-gray-800",
      "Ehren": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800"
    };
    return <Badge variant="outline" className={variants[type]}>{type}</Badge>;
  };

  const getRoleBadge = (role: Member["role"]) => {
    if (!role) return null;
    
    const variants = {
      "Vorstand": "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800",
      "Mitglied": "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/30 dark:text-slate-400 dark:border-slate-800"
    };
    return <Badge variant="outline" className={variants[role]}>{role}</Badge>;
  };

  const getPositionBadge = (position: string | undefined) => {
    if (!position) return <span className="text-sm text-muted-foreground">-</span>;
    
    return (
      <Badge 
        variant="outline" 
        className="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800"
      >
        {position}
      </Badge>
    );
  };

  const openDetailDialog = (member: Member) => {
    setSelectedMember(member);
    setDetailDialogOpen(true);
  };

  const openEditDialog = (member: Member) => {
    setEditMember(member);
    setEditDialogOpen(true);
  };

  const handleSaveMember = (updatedMember: Member) => {
    // TODO: Implement actual save logic with API call
    console.log("Saving member:", updatedMember);
    // For now, just close the dialog
    setEditDialogOpen(false);
  };

  // Helper functions for date conversion (Neues Mitglied Dialog)
  const germanToIsoDate = (germanDate: string): string => {
    if (!germanDate || !germanDate.includes('.')) return germanDate;
    const [day, month, year] = germanDate.split('.');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const isoToGermanDate = (isoDate: string): string => {
    if (!isoDate || !isoDate.includes('-')) return isoDate;
    const [year, month, day] = isoDate.split('-');
    return `${day}.${month}.${year}`;
  };

  const handleNewMemberInputChange = (field: string, value: string | boolean) => {
    const newData = {
      ...newMemberData,
      [field]: value,
    };
    
    // Wenn Rolle auf "Vorstand" gesetzt wird, muss memberType "Aktiv" sein
    if (field === "role" && value === "Vorstand") {
      newData.memberType = "Aktiv";
    }
    
    // Wenn memberType von "Aktiv" zu etwas anderem geändert wird und Rolle ist "Vorstand",
    // dann muss die Rolle auf "Mitglied" zurückgesetzt werden
    if (field === "memberType" && value !== "Aktiv" && newMemberData.role === "Vorstand") {
      newData.role = "Mitglied";
      newData.position = "";
    }
    
    // Wenn Rolle nicht "Vorstand" ist und Position eine Vorstandsposition ist,
    // dann Position zurücksetzen (außer Webmaster)
    if (field === "role" && value !== "Vorstand") {
      const vorstandsPositionen = ["1. Vorsitzender", "Geschäftsführer", "Kassenwart", "Schriftführer", "Jugendwart", "Platzwart", "Beisitzer"];
      if (newMemberData.position && vorstandsPositionen.includes(newMemberData.position)) {
        newData.position = "";
      }
    }
    
    // Wenn SEPA-Mandat deaktiviert wird, Datum zurücksetzen
    if (field === "sepaMandatErteilt" && !value) {
      newData.sepaMandatDatum = "";
    }
    
    setNewMemberData(newData);
  };

  const handleNewMemberDateChange = (field: string, isoDate: string) => {
    const germanDate = isoToGermanDate(isoDate);
    setNewMemberData({
      ...newMemberData,
      [field]: germanDate,
    });
  };

  const handleAddNewMember = () => {
    // Validierung
    if (!newMemberData.firstName || !newMemberData.lastName) {
      toast.error("Vorname und Nachname sind Pflichtfelder");
      setAddMemberActiveTab("personal");
      return;
    }

    if (!newMemberData.email || !newMemberData.email.includes("@")) {
      toast.error("Bitte gib eine gültige E-Mail-Adresse ein");
      setAddMemberActiveTab("contact");
      return;
    }

    // TODO: Implement actual save logic with API call
    console.log("Creating new member:", newMemberData);
    toast.success("Mitglied erfolgreich angelegt");
    
    // Reset form and close dialog
    setNewMemberData({
      firstName: "",
      lastName: "",
      birthDate: "",
      email: "",
      phone: "",
      mobile: "",
      strasse: "",
      plz: "",
      wohnort: "",
      iban: "",
      bic: "",
      kreditinstitut: "",
      sepaMandatErteilt: false,
      sepaMandatDatum: "",
      dmfvMitgliedsnummer: "",
      memberType: "Aktiv",
      role: "Mitglied",
      position: "",
      joinDate: "",
      parent1_name: "",
      parent1_relation: "",
      parent1_email: "",
      parent1_phone: "",
      parent1_mobile: "",
      parent2_name: "",
      parent2_relation: "",
      parent2_email: "",
      parent2_phone: "",
      parent2_mobile: "",
    });
    setAddDialogOpen(false);
    setAddMemberActiveTab("personal");
  };

  const handleCancelAddMember = () => {
    // Reset form and close dialog
    setNewMemberData({
      firstName: "",
      lastName: "",
      birthDate: "",
      email: "",
      phone: "",
      mobile: "",
      strasse: "",
      plz: "",
      wohnort: "",
      iban: "",
      bic: "",
      kreditinstitut: "",
      sepaMandatErteilt: false,
      sepaMandatDatum: "",
      dmfvMitgliedsnummer: "",
      memberType: "Aktiv",
      role: "Mitglied",
      position: "",
      joinDate: "",
      parent1_name: "",
      parent1_relation: "",
      parent1_email: "",
      parent1_phone: "",
      parent1_mobile: "",
      parent2_name: "",
      parent2_relation: "",
      parent2_email: "",
      parent2_phone: "",
      parent2_mobile: "",
    });
    setAddDialogOpen(false);
    setAddMemberActiveTab("personal");
  };

  // Export-Funktionen
  const handleToggleMemberSelection = (memberId: string) => {
    setSelectedMemberIds(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAllMembers = () => {
    if (selectedMemberIds.length === filteredMembers.length) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(filteredMembers.map(m => m.id));
    }
  };

  const getMembersToExport = () => {
    if (exportSelectionTab === "all") {
      return members;
    } else if (exportSelectionTab === "type") {
      return members.filter(m => m.memberType === exportMemberType);
    } else {
      return members.filter(m => selectedMemberIds.includes(m.id));
    }
  };

  const getSepaMembers = () => {
    return members.filter(m => m.sepaMandatErteilt === true);
  };

  const exportMembersCSV = () => {
    const membersToExport = getMembersToExport();
    
    if (membersToExport.length === 0) {
      toast.error("Keine Mitglieder zum Exportieren ausgewählt");
      return;
    }

    const headers = [
      "ID",
      "Vorname",
      "Nachname",
      "Geburtsdatum",
      "E-Mail",
      "Telefon",
      "Mobilfunk",
      "Straße",
      "PLZ",
      "Wohnort",
      "Mitgliedstyp",
      "Rolle",
      "Position",
      "Beitrittsdatum",
      "DMFV-Nr."
    ];

    const rows = membersToExport.map(m => [
      m.id,
      m.firstName,
      m.lastName,
      m.birthDate,
      m.email,
      m.phone || "",
      m.mobile || "",
      m.strasse,
      m.plz,
      m.wohnort,
      m.memberType,
      m.role || "",
      m.position || "",
      m.joinDate,
      m.dmfvMitgliedsnummer || ""
    ]);

    const csvContent = [
      headers.join(";"),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(";"))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `mitgliederliste_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`${membersToExport.length} Mitglieder als CSV exportiert`);
    setExportDialogOpen(false);
  };

  const exportMembersPDF = async () => {
    const membersToExport = getMembersToExport();
    
    if (membersToExport.length === 0) {
      toast.error("Keine Mitglieder zum Exportieren ausgewählt");
      return;
    }

    toast.info("PDF wird erstellt...");

    try {
      // Dynamischer Import von jsPDF und AutoTable
      const jsPDF = (await import('jspdf')).default;
      const autoTable = (await import('jspdf-autotable')).default;

      // Erstelle neues PDF Dokument im A4 Querformat für breitere Tabellen
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Header mit Vereinsname
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('Flugmodellsportverein Dingden e.V.', 148, 15, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'normal');
      doc.text('Mitgliederliste', 148, 23, { align: 'center' });

      // Datum und Typ
      const today = new Date().toLocaleDateString('de-DE');
      doc.setFontSize(10);
      doc.setTextColor(100);
      
      let exportTypeText = '';
      if (exportSelectionTab === 'all') {
        exportTypeText = `Alle Mitglieder (${membersToExport.length})`;
      } else if (exportSelectionTab === 'type') {
        exportTypeText = `Mitgliedstyp: ${exportMemberType} (${membersToExport.length})`;
      } else {
        exportTypeText = `Ausgewählte Mitglieder (${membersToExport.length})`;
      }
      
      doc.text(`Exportiert am: ${today}`, 14, 30);
      doc.text(exportTypeText, 14, 35);
      
      // Tabellendaten vorbereiten
      const tableData = membersToExport.map(m => [
        m.id,
        `${m.firstName} ${m.lastName}`,
        m.birthDate,
        m.memberType,
        m.strasse,
        `${m.plz} ${m.wohnort}`,
        m.email,
        m.mobile || m.phone || '-',
        m.joinDate
      ]);

      // AutoTable erstellen
      autoTable(doc, {
        startY: 42,
        head: [[
          'ID',
          'Name',
          'Geb.',
          'Typ',
          'Straße',
          'Ort',
          'E-Mail',
          'Telefon',
          'Beitritt'
        ]],
        body: tableData,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 2
        },
        headStyles: {
          fillColor: [3, 2, 19], // Primary color
          textColor: 255,
          fontSize: 8,
          fontStyle: 'bold',
          halign: 'left'
        },
        bodyStyles: {
          fontSize: 7,
          textColor: 50
        },
        columnStyles: {
          0: { cellWidth: 10 }, // ID
          1: { cellWidth: 35 }, // Name
          2: { cellWidth: 18 }, // Geburtsdatum
          3: { cellWidth: 15 }, // Typ
          4: { cellWidth: 30 }, // Straße
          5: { cellWidth: 30 }, // Ort
          6: { cellWidth: 38 }, // E-Mail
          7: { cellWidth: 24 }, // Telefon
          8: { cellWidth: 18 }  // Beitritt
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { left: 10, right: 10 },
        didDrawPage: (data: any) => {
          // Seitenzahl im Footer
          const pageCount = (doc as any).internal.getNumberOfPages();
          const currentPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
          
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text(
            `Seite ${currentPage} von ${pageCount}`,
            148,
            (doc as any).internal.pageSize.height - 10,
            { align: 'center' } as any
          );
          
          // Datenschutzhinweis
          doc.setFontSize(7);
          doc.text(
            'Vertraulich: Diese Liste enthält personenbezogene Daten und ist ausschließlich für Vereinszwecke bestimmt.',
            148,
            (doc as any).internal.pageSize.height - 5,
            { align: 'center' } as any
          );
        }
      });

      // PDF speichern
      const filename = `mitgliederliste_${exportSelectionTab}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);

      toast.success(`PDF mit ${membersToExport.length} Mitgliedern erstellt`);
      setExportDialogOpen(false);
    } catch (error) {
      console.error('PDF-Export Fehler:', error);
      toast.error('Fehler beim Erstellen des PDFs');
    }
  };

  const exportSepaCSV = () => {
    const sepaMembers = getSepaMembers();
    
    if (sepaMembers.length === 0) {
      toast.error("Keine Mitglieder mit SEPA-Mandat gefunden");
      return;
    }

    const headers = [
      "Mandatsreferenz",
      "Name",
      "Vorname",
      "IBAN",
      "BIC",
      "Kreditinstitut",
      "Mandatsdatum",
      "Straße",
      "PLZ",
      "Wohnort",
      "Betrag (EUR)",
      "Verwendungszweck"
    ];

    const rows = sepaMembers.map(m => {
      // Beitrag basierend auf Mitgliedstyp
      let betrag = "0.00";
      switch (m.memberType) {
        case "Aktiv":
          betrag = "180.00";
          break;
        case "Passiv":
          betrag = "60.00";
          break;
        case "Jugend":
          betrag = "60.00";
          break;
        case "Ehren":
          betrag = "0.00";
          break;
      }

      return [
        m.id, // Mandatsreferenz = Mitgliedsnummer
        m.lastName,
        m.firstName,
        m.iban || "",
        m.bic || "",
        m.kreditinstitut || "",
        m.sepaMandatDatum || "",
        m.strasse,
        m.plz,
        m.wohnort,
        betrag,
        `Mitgliedsbeitrag ${new Date().getFullYear()} - ${m.id}`
      ];
    });

    const csvContent = [
      headers.join(";"),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(";"))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `sepa_lastschrift_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`${sepaMembers.length} SEPA-Mandate als CSV exportiert`);
    setExportDialogOpen(false);
  };

  const exportSepaPDF = async () => {
    const sepaMembers = getSepaMembers();
    
    if (sepaMembers.length === 0) {
      toast.error("Keine Mitglieder mit SEPA-Mandat gefunden");
      return;
    }

    toast.info("PDF wird erstellt...");

    try {
      const jsPDF = (await import('jspdf')).default;
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Header
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('Flugmodellsportverein Dingden e.V.', 148, 15, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'normal');
      doc.text('SEPA-Lastschriftmandate', 148, 23, { align: 'center' });

      const today = new Date().toLocaleDateString('de-DE');
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Exportiert am: ${today}`, 14, 30);
      doc.text(`Anzahl Mandate: ${sepaMembers.length}`, 14, 35);
      
      // Tabellendaten vorbereiten
      const tableData = sepaMembers.map(m => {
        let betrag = "0,00 €";
        switch (m.memberType) {
          case "Aktiv": betrag = "180,00 €"; break;
          case "Passiv": betrag = "60,00 €"; break;
          case "Jugend": betrag = "60,00 €"; break;
          case "Ehren": betrag = "0,00 €"; break;
        }

        return [
          m.id,
          m.lastName,
          m.firstName,
          m.iban || '',
          m.bic || '',
          m.kreditinstitut || '',
          m.sepaMandatDatum || '',
          betrag,
          m.memberType
        ];
      });

      // AutoTable erstellen
      autoTable(doc, {
        startY: 42,
        head: [[
          'Ref.',
          'Nachname',
          'Vorname',
          'IBAN',
          'BIC',
          'Bank',
          'Datum',
          'Betrag',
          'Typ'
        ]],
        body: tableData,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 2
        },
        headStyles: {
          fillColor: [3, 2, 19],
          textColor: 255,
          fontSize: 8,
          fontStyle: 'bold',
          halign: 'left'
        },
        bodyStyles: {
          fontSize: 7,
          textColor: 50
        },
        columnStyles: {
          0: { cellWidth: 14 },  // Mandat-Ref
          1: { cellWidth: 24 },  // Nachname
          2: { cellWidth: 24 },  // Vorname
          3: { cellWidth: 46 },  // IBAN
          4: { cellWidth: 20 },  // BIC
          5: { cellWidth: 30 },  // Bank
          6: { cellWidth: 18 },  // Datum
          7: { cellWidth: 18, halign: 'right' },  // Betrag
          8: { cellWidth: 14 }   // Typ
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { left: 10, right: 10 },
        didDrawPage: (data: any) => {
          const pageCount = (doc as any).internal.getNumberOfPages();
          const currentPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
          
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text(
            `Seite ${currentPage} von ${pageCount}`,
            148,
            (doc as any).internal.pageSize.height - 10,
            { align: 'center' } as any
          );
          
          // Verstärkter Datenschutzhinweis für SEPA-Daten
          doc.setFontSize(7);
          doc.setTextColor(200, 0, 0);
          doc.text(
            'VERTRAULICH: Bankdaten! Nur für berechtigte Personen. Nach Verwendung sicher löschen!',
            148,
            (doc as any).internal.pageSize.height - 5,
            { align: 'center' } as any
          );
        }
      });

      const filename = `sepa_lastschrift_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);

      toast.success(`SEPA-PDF mit ${sepaMembers.length} Mandaten erstellt`);
      setExportDialogOpen(false);
    } catch (error) {
      console.error('PDF-Export Fehler:', error);
      toast.error('Fehler beim Erstellen des PDFs');
    }
  };

  const handleExportCSV = () => {
    if (exportActiveTab === "members") {
      exportMembersCSV();
    } else {
      exportSepaCSV();
    }
  };

  const handleExportPDF = () => {
    if (exportActiveTab === "members") {
      exportMembersPDF();
    } else {
      exportSepaPDF();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2">Mitgliederverwaltung</h2>
        <p className="text-muted-foreground">
          Verwalte alle Vereinsmitglieder und ihre Daten.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Gesamtmitglieder</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl mb-2">{stats.total}</div>
            <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md w-fit ${getTrendIndicator(changes.total).bg}`}>
              {(() => {
                const TrendIcon = getTrendIndicator(changes.total).icon;
                return <TrendIcon className={`h-3 w-3 ${getTrendIndicator(changes.total).color}`} />;
              })()}
              <span className={getTrendIndicator(changes.total).color}>
                {getTrendIndicator(changes.total).text} seit 2024
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Aktive Mitglieder</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl mb-2">{stats.active}</div>
            <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md w-fit ${getTrendIndicator(changes.active).bg}`}>
              {(() => {
                const TrendIcon = getTrendIndicator(changes.active).icon;
                return <TrendIcon className={`h-3 w-3 ${getTrendIndicator(changes.active).color}`} />;
              })()}
              <span className={getTrendIndicator(changes.active).color}>
                {getTrendIndicator(changes.active).text} seit 2024
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Jugendmitglieder</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl mb-2">{stats.youth}</div>
            <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md w-fit ${getTrendIndicator(changes.youth).bg}`}>
              {(() => {
                const TrendIcon = getTrendIndicator(changes.youth).icon;
                return <TrendIcon className={`h-3 w-3 ${getTrendIndicator(changes.youth).color}`} />;
              })()}
              <span className={getTrendIndicator(changes.youth).color}>
                {getTrendIndicator(changes.youth).text} seit 2024
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Passive Mitglieder</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl mb-2">{stats.passive}</div>
            <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md w-fit ${getTrendIndicator(changes.passive).bg}`}>
              {(() => {
                const TrendIcon = getTrendIndicator(changes.passive).icon;
                return <TrendIcon className={`h-3 w-3 ${getTrendIndicator(changes.passive).color}`} />;
              })()}
              <span className={getTrendIndicator(changes.passive).color}>
                {getTrendIndicator(changes.passive).text} seit 2024
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Mitglieder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suche nach Name, E-Mail oder ID..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Alle Typen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Typen</SelectItem>
                  <SelectItem value="Aktiv">Aktiv</SelectItem>
                  <SelectItem value="Jugend">Jugend</SelectItem>
                  <SelectItem value="Passiv">Passiv</SelectItem>
                  <SelectItem value="Ehren">Ehren</SelectItem>
                </SelectContent>
              </Select>
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "table" | "grid")} className="hidden sm:block">
                <TabsList>
                  <TabsTrigger value="table" className="gap-2">
                    <List className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="grid" className="gap-2">
                    <Grid3x3 className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {/* Neues Mitglied Dialog */}
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">Neues Mitglied</span>
                  <span className="sm:hidden">Neu</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl max-h-[90vh] p-0 gap-0 overflow-hidden">
                {/* Header */}
                <DialogHeader className="relative px-6 py-5 border-b">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-muted">
                          <UserPlus className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <DialogTitle className="text-xl">
                            Neues Mitglied anlegen
                          </DialogTitle>
                          <DialogDescription className="sr-only">
                            Lege ein neues Vereinsmitglied an
                          </DialogDescription>
                          <p className="text-sm text-muted-foreground mt-1">
                            Trage die Daten des neuen Vereinsmitglieds ein
                          </p>
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
                    <TabsComponent value={addMemberActiveTab} onValueChange={setAddMemberActiveTab}>
                      {/* Tabs */}
                      <TabsList className={`grid w-full mb-6 ${newMemberData.memberType === "Jugend" ? "grid-cols-5" : "grid-cols-4"}`}>
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
                        {newMemberData.memberType === "Jugend" && (
                          <TabsTrigger value="parents" className="flex items-center justify-center gap-1.5 px-2">
                            <Users className="h-4 w-4" />
                            <span className="hidden sm:inline">Kontaktpersonen</span>
                          </TabsTrigger>
                        )}
                        <TabsTrigger value="membership" className="flex items-center justify-center gap-1.5 px-2">
                          <Settings className="h-4 w-4" />
                          <span className="hidden sm:inline">Mitglied</span>
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
                                <Label htmlFor="new-firstName">
                                  Vorname <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                  id="new-firstName"
                                  value={newMemberData.firstName}
                                  onChange={(e) => handleNewMemberInputChange("firstName", e.target.value)}
                                  placeholder="Max"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="new-lastName">
                                  Nachname <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                  id="new-lastName"
                                  value={newMemberData.lastName}
                                  onChange={(e) => handleNewMemberInputChange("lastName", e.target.value)}
                                  placeholder="Mustermann"
                                />
                              </div>
                            </div>

                            <div className="space-y-2 mt-4">
                              <Label htmlFor="new-birthDate">Geburtsdatum</Label>
                              <Input
                                id="new-birthDate"
                                type="date"
                                value={newMemberData.birthDate ? germanToIsoDate(newMemberData.birthDate) : ""}
                                onChange={(e) => handleNewMemberDateChange("birthDate", e.target.value)}
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
                              <Label htmlFor="new-email">
                                E-Mail <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id="new-email"
                                type="email"
                                value={newMemberData.email}
                                onChange={(e) => handleNewMemberInputChange("email", e.target.value)}
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
                                <Label htmlFor="new-phone">Festnetz</Label>
                                <Input
                                  id="new-phone"
                                  type="tel"
                                  value={newMemberData.phone}
                                  onChange={(e) => handleNewMemberInputChange("phone", e.target.value)}
                                  placeholder="02852 123456"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="new-mobile">Mobilfunk</Label>
                                <Input
                                  id="new-mobile"
                                  type="tel"
                                  value={newMemberData.mobile}
                                  onChange={(e) => handleNewMemberInputChange("mobile", e.target.value)}
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
                                <Label htmlFor="new-strasse">Straße und Hausnummer</Label>
                                <Input
                                  id="new-strasse"
                                  value={newMemberData.strasse}
                                  onChange={(e) => handleNewMemberInputChange("strasse", e.target.value)}
                                  placeholder="Musterstraße 12"
                                />
                              </div>

                              <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="new-plz">PLZ</Label>
                                  <Input
                                    id="new-plz"
                                    value={newMemberData.plz}
                                    onChange={(e) => handleNewMemberInputChange("plz", e.target.value)}
                                    placeholder="46499"
                                    maxLength={5}
                                  />
                                </div>
                                <div className="space-y-2 col-span-2">
                                  <Label htmlFor="new-wohnort">Wohnort</Label>
                                  <Input
                                    id="new-wohnort"
                                    value={newMemberData.wohnort}
                                    onChange={(e) => handleNewMemberInputChange("wohnort", e.target.value)}
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
                                <Label htmlFor="new-iban">IBAN</Label>
                                <Input
                                  id="new-iban"
                                  value={newMemberData.iban}
                                  onChange={(e) => handleNewMemberInputChange("iban", e.target.value)}
                                  placeholder="DE89 3704 0044 0532 0130 00"
                                  className="font-mono"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="new-bic">BIC</Label>
                                <Input
                                  id="new-bic"
                                  value={newMemberData.bic}
                                  onChange={(e) => handleNewMemberInputChange("bic", e.target.value)}
                                  placeholder="COBADEFFXXX"
                                  className="font-mono"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="new-kreditinstitut">Kreditinstitut</Label>
                                <Input
                                  id="new-kreditinstitut"
                                  value={newMemberData.kreditinstitut}
                                  onChange={(e) => handleNewMemberInputChange("kreditinstitut", e.target.value)}
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
                                  id="new-sepaMandatErteilt"
                                  checked={newMemberData.sepaMandatErteilt}
                                  onCheckedChange={(checked) => handleNewMemberInputChange("sepaMandatErteilt", checked as boolean)}
                                />
                                <div className="grid gap-1.5 leading-none">
                                  <label
                                    htmlFor="new-sepaMandatErteilt"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                  >
                                    Lastschriftmandat erteilt
                                  </label>
                                  <p className="text-sm text-muted-foreground">
                                    Berechtigung zum Einzug von Lastschriften vom angegebenen Konto
                                  </p>
                                </div>
                              </div>
                              
                              {newMemberData.sepaMandatErteilt && (
                                <div className="space-y-2 pt-2">
                                  <Label htmlFor="new-sepaMandatDatum">Datum der Mandatserteilung</Label>
                                  <Input
                                    id="new-sepaMandatDatum"
                                    type="date"
                                    value={newMemberData.sepaMandatDatum ? germanToIsoDate(newMemberData.sepaMandatDatum) : ""}
                                    onChange={(e) => handleNewMemberDateChange("sepaMandatDatum", e.target.value)}
                                    className="[&::-webkit-calendar-picker-indicator]:ml-auto"
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Wird für rechtliche Nachweise und Dokumentation benötigt
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* DMFV Mitgliedsnummer */}
                          <div className="p-5 rounded-lg bg-muted/50 border">
                            <h4 className="flex items-center gap-2 mb-4">
                              <Building2 className="h-4 w-4" />
                              DMFV-Mitgliedsnummer
                            </h4>
                            <div className="space-y-2">
                              <Label htmlFor="new-dmfvMitgliedsnummer">Mitgliedsnummer</Label>
                              <Input
                                id="new-dmfvMitgliedsnummer"
                                value={newMemberData.dmfvMitgliedsnummer}
                                onChange={(e) => handleNewMemberInputChange("dmfvMitgliedsnummer", e.target.value)}
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

                      {/* Kontaktpersonen Tab (nur bei Jugend) */}
                      {newMemberData.memberType === "Jugend" && (
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
                                  <Label htmlFor="new-parent1_name">Name</Label>
                                  <Input
                                    id="new-parent1_name"
                                    value={newMemberData.parent1_name}
                                    onChange={(e) => handleNewMemberInputChange("parent1_name", e.target.value)}
                                    placeholder="Max Mustermann"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="new-parent1_relation">Beziehungsstatus</Label>
                                  <Select
                                    value={newMemberData.parent1_relation}
                                    onValueChange={(value) => handleNewMemberInputChange("parent1_relation", value)}
                                  >
                                    <SelectTrigger id="new-parent1_relation">
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
                                <Label htmlFor="new-parent1_email">E-Mail</Label>
                                <Input
                                  id="new-parent1_email"
                                  type="email"
                                  value={newMemberData.parent1_email}
                                  onChange={(e) => handleNewMemberInputChange("parent1_email", e.target.value)}
                                  placeholder="max.mustermann@email.de"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="new-parent1_phone">Telefon</Label>
                                  <Input
                                    id="new-parent1_phone"
                                    type="tel"
                                    value={newMemberData.parent1_phone}
                                    onChange={(e) => handleNewMemberInputChange("parent1_phone", e.target.value)}
                                    placeholder="02852 123456"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="new-parent1_mobile">Mobilfunk</Label>
                                  <Input
                                    id="new-parent1_mobile"
                                    type="tel"
                                    value={newMemberData.parent1_mobile}
                                    onChange={(e) => handleNewMemberInputChange("parent1_mobile", e.target.value)}
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
                                  <Label htmlFor="new-parent2_name">Name</Label>
                                  <Input
                                    id="new-parent2_name"
                                    value={newMemberData.parent2_name}
                                    onChange={(e) => handleNewMemberInputChange("parent2_name", e.target.value)}
                                    placeholder="Maria Mustermann"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="new-parent2_relation">Beziehungsstatus</Label>
                                  <Select
                                    value={newMemberData.parent2_relation}
                                    onValueChange={(value) => handleNewMemberInputChange("parent2_relation", value)}
                                  >
                                    <SelectTrigger id="new-parent2_relation">
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
                                <Label htmlFor="new-parent2_email">E-Mail</Label>
                                <Input
                                  id="new-parent2_email"
                                  type="email"
                                  value={newMemberData.parent2_email}
                                  onChange={(e) => handleNewMemberInputChange("parent2_email", e.target.value)}
                                  placeholder="maria.mustermann@email.de"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="new-parent2_phone">Telefon</Label>
                                  <Input
                                    id="new-parent2_phone"
                                    type="tel"
                                    value={newMemberData.parent2_phone}
                                    onChange={(e) => handleNewMemberInputChange("parent2_phone", e.target.value)}
                                    placeholder="02852 123456"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="new-parent2_mobile">Mobilfunk</Label>
                                  <Input
                                    id="new-parent2_mobile"
                                    type="tel"
                                    value={newMemberData.parent2_mobile}
                                    onChange={(e) => handleNewMemberInputChange("parent2_mobile", e.target.value)}
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
                                <Label htmlFor="new-memberType">Mitgliedstyp</Label>
                                <Select
                                  value={newMemberData.memberType}
                                  onValueChange={(value) => handleNewMemberInputChange("memberType", value)}
                                  disabled={newMemberData.role === "Vorstand"}
                                >
                                  <SelectTrigger id="new-memberType">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Aktiv">Aktiv</SelectItem>
                                    <SelectItem value="Passiv">Passiv</SelectItem>
                                    <SelectItem value="Jugend">Jugend</SelectItem>
                                    <SelectItem value="Ehren">Ehren</SelectItem>
                                  </SelectContent>
                                </Select>
                                {newMemberData.role === "Vorstand" && (
                                  <p className="text-xs text-muted-foreground">
                                    Vorstandsmitglieder müssen vom Typ "Aktiv" sein
                                  </p>
                                )}
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="new-role">Rolle</Label>
                                <Select
                                  value={newMemberData.role || ""}
                                  onValueChange={(value) => handleNewMemberInputChange("role", value)}
                                >
                                  <SelectTrigger id="new-role">
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
                              <Label htmlFor="new-position">Position / Funktion</Label>
                              <Select
                                value={newMemberData.position || "keine"}
                                onValueChange={(value) => handleNewMemberInputChange("position", value === "keine" ? "" : value)}
                              >
                                <SelectTrigger id="new-position">
                                  <SelectValue placeholder="Position auswählen..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="keine">Keine Position</SelectItem>
                                  {newMemberData.role === "Vorstand" && (
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
                                {newMemberData.role === "Vorstand" 
                                  ? "Vorstandspositionen sind nur für Mitglieder mit Rolle 'Vorstand' verfügbar"
                                  : "Webmaster kann von jedem Mitglied besetzt werden"}
                              </p>
                            </div>
                          </div>

                          {/* Join Date */}
                          <div className="p-5 rounded-lg bg-muted/50 border">
                            <div className="space-y-2">
                              <Label htmlFor="new-joinDate">Beitrittsdatum</Label>
                              <Input
                                id="new-joinDate"
                                type="date"
                                value={newMemberData.joinDate ? germanToIsoDate(newMemberData.joinDate) : ""}
                                onChange={(e) => handleNewMemberDateChange("joinDate", e.target.value)}
                                className="[&::-webkit-calendar-picker-indicator]:ml-auto"
                              />
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </TabsComponent>
                  </div>
                </ScrollArea>

                {/* Action Buttons */}
                <div className="flex gap-3 px-6 py-4 border-t">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={handleCancelAddMember}
                  >
                    <XIcon className="h-4 w-4 mr-2" />
                    Abbrechen
                  </Button>
                  <Button 
                    className="flex-1" 
                    onClick={handleAddNewMember}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Mitglied anlegen
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Export Dialog */}
            <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Exportieren</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden">
                {/* Header */}
                <DialogHeader className="relative px-6 py-5 border-b">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-muted">
                          <Download className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <DialogTitle className="text-xl">
                            Mitgliederdaten exportieren
                          </DialogTitle>
                          <DialogDescription className="sr-only">
                            Exportiere Mitgliederdaten oder SEPA-Lastschriften
                          </DialogDescription>
                          <p className="text-sm text-muted-foreground mt-1">
                            Wähle den gewünschten Export-Typ
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogHeader>

                <ScrollArea className="max-h-[calc(90vh-200px)]">
                  <div className="px-6 py-6">
                    <TabsComponent value={exportActiveTab} onValueChange={setExportActiveTab}>
                      {/* Main Export Type Tabs */}
                      <TabsList className="grid w-full mb-6 grid-cols-2">
                        <TabsTrigger value="members" className="flex items-center justify-center gap-1.5 px-2">
                          <Users className="h-4 w-4" />
                          <span>Mitgliederliste</span>
                        </TabsTrigger>
                        <TabsTrigger value="sepa" className="flex items-center justify-center gap-1.5 px-2">
                          <CreditCard className="h-4 w-4" />
                          <span>SEPA-Lastschrift</span>
                        </TabsTrigger>
                      </TabsList>

                      {/* Mitgliederliste Tab */}
                      <TabsContent value="members" className="space-y-6 mt-0">
                        <div className="space-y-6">
                          {/* Selection Type Tabs */}
                          <div className="p-5 rounded-lg bg-muted/50 border">
                            <h4 className="flex items-center gap-2 mb-4">
                              <Users className="h-4 w-4" />
                              Mitgliederauswahl
                            </h4>
                            
                            <TabsComponent value={exportSelectionTab} onValueChange={(value: any) => setExportSelectionTab(value)}>
                              <TabsList className="grid w-full grid-cols-3 mb-4">
                                <TabsTrigger value="all">
                                  Alle
                                </TabsTrigger>
                                <TabsTrigger value="type">
                                  Nach Typ
                                </TabsTrigger>
                                <TabsTrigger value="individual">
                                  Einzelauswahl
                                </TabsTrigger>
                              </TabsList>

                              {/* All Members Tab */}
                              <TabsContent value="all" className="mt-0">
                                <Card className="border-2">
                                  <CardContent className="pt-6">
                                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                      <div>
                                        <p className="font-medium">Alle Mitglieder exportieren</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                          Die komplette Mitgliederliste wird exportiert
                                        </p>
                                      </div>
                                      <div className="text-3xl font-bold">
                                        {members.length}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </TabsContent>

                              {/* By Type Tab */}
                              <TabsContent value="type" className="mt-0">
                                <Card className="border-2">
                                  <CardContent className="pt-6 space-y-4">
                                    <div className="space-y-2">
                                      <Label>Mitgliedstyp auswählen</Label>
                                      <Select value={exportMemberType} onValueChange={(value: any) => setExportMemberType(value)}>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Aktiv">
                                            <div className="flex items-center justify-between w-full">
                                              <span>Aktiv</span>
                                              <Badge variant="outline" className="ml-2">
                                                {members.filter(m => m.memberType === "Aktiv").length}
                                              </Badge>
                                            </div>
                                          </SelectItem>
                                          <SelectItem value="Passiv">
                                            <div className="flex items-center justify-between w-full">
                                              <span>Passiv</span>
                                              <Badge variant="outline" className="ml-2">
                                                {members.filter(m => m.memberType === "Passiv").length}
                                              </Badge>
                                            </div>
                                          </SelectItem>
                                          <SelectItem value="Jugend">
                                            <div className="flex items-center justify-between w-full">
                                              <span>Jugend</span>
                                              <Badge variant="outline" className="ml-2">
                                                {members.filter(m => m.memberType === "Jugend").length}
                                              </Badge>
                                            </div>
                                          </SelectItem>
                                          <SelectItem value="Ehren">
                                            <div className="flex items-center justify-between w-full">
                                              <span>Ehren</span>
                                              <Badge variant="outline" className="ml-2">
                                                {members.filter(m => m.memberType === "Ehren").length}
                                              </Badge>
                                            </div>
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div className="p-3 bg-muted/50 rounded-lg">
                                      <p className="text-sm text-muted-foreground">
                                        <CheckCircle className="h-4 w-4 inline mr-2" />
                                        {members.filter(m => m.memberType === exportMemberType).length} Mitglied(er) vom Typ "{exportMemberType}" werden exportiert
                                      </p>
                                    </div>
                                  </CardContent>
                                </Card>
                              </TabsContent>

                              {/* Individual Selection Tab */}
                              <TabsContent value="individual" className="mt-0">
                                <Card className="border-2">
                                  <CardContent className="pt-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                      <Label>Mitglieder auswählen ({selectedMemberIds.length} ausgewählt)</Label>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleSelectAllMembers}
                                      >
                                        {selectedMemberIds.length === filteredMembers.length ? "Alle abwählen" : "Alle auswählen"}
                                      </Button>
                                    </div>

                                    <div className="max-h-[300px] overflow-y-auto border rounded-lg">
                                      <div className="space-y-0">
                                        {filteredMembers.map((member) => (
                                          <div 
                                            key={member.id} 
                                            className="flex items-center space-x-3 p-3 hover:bg-muted border-b last:border-b-0"
                                          >
                                            <Checkbox
                                              id={`member-${member.id}`}
                                              checked={selectedMemberIds.includes(member.id)}
                                              onCheckedChange={() => handleToggleMemberSelection(member.id)}
                                            />
                                            <label
                                              htmlFor={`member-${member.id}`}
                                              className="flex-1 cursor-pointer flex items-center justify-between"
                                            >
                                              <div className="flex items-center gap-3">
                                                <Avatar className={`h-8 w-8 ${getAvatarColor(member.firstName)} flex-shrink-0`}>
                                                  <AvatarFallback className="text-white text-xs">
                                                    {getInitials(member.firstName, member.lastName)}
                                                  </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                  <p className="text-sm font-medium">
                                                    {member.firstName} {member.lastName}
                                                  </p>
                                                  <p className="text-xs text-muted-foreground">
                                                    {member.id}
                                                  </p>
                                                </div>
                                              </div>
                                              <Badge variant="outline">
                                                {member.memberType}
                                              </Badge>
                                            </label>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {selectedMemberIds.length > 0 && (
                                      <div className="p-3 bg-muted/50 rounded-lg">
                                        <p className="text-sm text-muted-foreground">
                                          <CheckCircle className="h-4 w-4 inline mr-2" />
                                          {selectedMemberIds.length} Mitglied(er) ausgewählt
                                        </p>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              </TabsContent>
                            </TabsComponent>
                          </div>

                          {/* Export Info */}
                          <div className="p-4 rounded-lg bg-muted border">
                            <p className="flex items-start gap-3 text-sm">
                              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                              <span>
                                Die exportierte Datei enthält: ID, Name, Geburtsdatum, Kontaktdaten, Adresse, Mitgliedsstatus und Beitrittsdatum.
                              </span>
                            </p>
                          </div>
                        </div>
                      </TabsContent>

                      {/* SEPA-Lastschrift Tab */}
                      <TabsContent value="sepa" className="space-y-6 mt-0">
                        <div className="space-y-6">
                          {/* SEPA Info */}
                          <div className="p-5 rounded-lg bg-muted/50 border">
                            <h4 className="flex items-center gap-2 mb-4">
                              <CreditCard className="h-4 w-4" />
                              SEPA-Lastschriftmandate
                            </h4>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between p-4 bg-background rounded-lg border">
                                <div>
                                  <p className="font-medium">Mitglieder mit erteiltem Mandat</p>
                                  <p className="text-sm text-muted-foreground">
                                    Bereit für Lastschrifteinzug
                                  </p>
                                </div>
                                <div className="text-3xl font-bold">
                                  {getSepaMembers().length}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <p className="text-sm font-medium">Enthaltene Daten:</p>
                                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                                  <li>• Mandatsreferenz (Mitgliedsnummer)</li>
                                  <li>• Name und Vorname</li>
                                  <li>• IBAN, BIC und Kreditinstitut</li>
                                  <li>• Mandatsdatum</li>
                                  <li>• Adresse</li>
                                  <li>• Beitragshöhe (abhängig vom Mitgliedstyp)</li>
                                  <li>• Verwendungszweck</li>
                                </ul>
                              </div>
                            </div>
                          </div>

                          {/* Contribution Amounts */}
                          <div className="p-5 rounded-lg bg-muted/50 border">
                            <h4 className="flex items-center gap-2 mb-4">
                              <Building2 className="h-4 w-4" />
                              Beitragshöhe
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 bg-background rounded-lg border">
                                <p className="text-sm text-muted-foreground">Aktiv</p>
                                <p className="text-xl font-bold">180,00 €</p>
                              </div>
                              <div className="p-3 bg-background rounded-lg border">
                                <p className="text-sm text-muted-foreground">Passiv</p>
                                <p className="text-xl font-bold">60,00 €</p>
                              </div>
                              <div className="p-3 bg-background rounded-lg border">
                                <p className="text-sm text-muted-foreground">Jugend</p>
                                <p className="text-xl font-bold">60,00 €</p>
                              </div>
                              <div className="p-3 bg-background rounded-lg border">
                                <p className="text-sm text-muted-foreground">Ehren</p>
                                <p className="text-xl font-bold">0,00 €</p>
                              </div>
                            </div>
                          </div>

                          {/* Security Notice */}
                          <div className="p-4 rounded-lg bg-muted border">
                            <p className="flex items-start gap-3 text-sm">
                              <Shield className="h-5 w-5 mt-0.5 flex-shrink-0" />
                              <span>
                                Die SEPA-Datei enthält sensible Bankdaten. Bitte handle sie vertraulich und lösche sie nach der Verwendung.
                              </span>
                            </p>
                          </div>

                          {/* Member List with SEPA */}
                          {getSepaMembers().length > 0 && (
                            <div className="p-5 rounded-lg bg-muted/50 border">
                              <h4 className="flex items-center gap-2 mb-4">
                                <CheckCircle className="h-4 w-4" />
                                Mitglieder mit Mandat
                              </h4>
                              <div className="max-h-[200px] overflow-y-auto space-y-2">
                                {getSepaMembers().map((member) => (
                                  <div key={member.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                                    <div className="flex items-center gap-3">
                                      <Avatar className={`h-8 w-8 ${getAvatarColor(member.firstName)} flex-shrink-0`}>
                                        <AvatarFallback className="text-white text-xs">
                                          {getInitials(member.firstName, member.lastName)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="text-sm font-medium">
                                          {member.firstName} {member.lastName}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {member.iban?.replace(/(.{4})/g, '$1 ').trim() || "Keine IBAN"}
                                        </p>
                                      </div>
                                    </div>
                                    <Badge variant="outline">
                                      {member.memberType}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </TabsComponent>
                  </div>
                </ScrollArea>

                {/* Action Buttons */}
                <div className="flex gap-3 px-6 py-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setExportDialogOpen(false);
                      setSelectedMemberIds([]);
                      setExportSelectionTab("all");
                    }}
                  >
                    <XIcon className="h-4 w-4 mr-2" />
                    Abbrechen
                  </Button>
                  
                  <div className="flex-1 flex gap-3">
                    <Button 
                      className="flex-1" 
                      onClick={handleExportCSV}
                      disabled={exportSelectionTab === "individual" && selectedMemberIds.length === 0 && exportActiveTab === "members"}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      CSV exportieren
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="flex-1" 
                      onClick={handleExportPDF}
                      disabled={exportActiveTab === "members" && exportSelectionTab === "individual" && selectedMemberIds.length === 0}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      PDF exportieren
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Table View */}
          {viewMode === "table" && (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Typ</TableHead>
                    <TableHead className="hidden lg:table-cell">Rolle</TableHead>
                    <TableHead className="hidden lg:table-cell">Position</TableHead>
                    <TableHead className="hidden xl:table-cell">E-Mail</TableHead>
                    <TableHead className="hidden 2xl:table-cell">Mobilfunk</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Keine Mitglieder gefunden
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-mono text-sm">{member.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className={`h-8 w-8 ${getAvatarColor(member.firstName)} flex-shrink-0`}>
                              <AvatarFallback className="text-white text-xs">
                                {getInitials(member.firstName, member.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate">{member.firstName} {member.lastName}</p>
                              <p className="text-sm text-muted-foreground truncate md:hidden">
                                {member.memberType}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {getMemberTypeBadge(member.memberType)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {getRoleBadge(member.role)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {getPositionBadge(member.position)}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate max-w-[200px]">{member.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden 2xl:table-cell">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{member.mobile || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDetailDialog(member)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="hidden sm:inline-flex"
                              onClick={() => openEditDialog(member)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Grid View */}
          {viewMode === "grid" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMembers.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  Keine Mitglieder gefunden
                </div>
              ) : (
                filteredMembers.map((member) => (
                  <Card key={member.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar className={`h-10 w-10 ${getAvatarColor(member.firstName)} flex-shrink-0`}>
                            <AvatarFallback className="text-white">
                              {getInitials(member.firstName, member.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate">{member.firstName} {member.lastName}</p>
                            <p className="text-sm text-muted-foreground font-mono">{member.id}</p>
                          </div>
                        </div>
                        {getMemberTypeBadge(member.memberType)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {member.role && (
                        <div className="flex items-center gap-2">
                          {getRoleBadge(member.role)}
                          {member.position && getPositionBadge(member.position)}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3 flex-shrink-0" />
                        <span>{member.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span>Mitglied seit {member.joinDate}</span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => openDetailDialog(member)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openEditDialog(member)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Member Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader className="pb-6 border-b">
            <DialogTitle>Mitgliedsdetails</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-8">
              {/* Header Card */}
              <div className="bg-muted/30 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <Avatar className={`h-20 w-20 ${getAvatarColor(selectedMember.firstName)} ring-2 ring-background shadow-lg`}>
                    <AvatarFallback className="text-white text-2xl">
                      {getInitials(selectedMember.firstName, selectedMember.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="mb-2">{selectedMember.firstName} {selectedMember.lastName}</h2>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {getMemberTypeBadge(selectedMember.memberType)}
                      {getRoleBadge(selectedMember.role)}
                      {getPositionBadge(selectedMember.position)}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Mitgliedsnummer</span>
                        <p className="font-mono mt-0.5">{selectedMember.id}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Mitglied seit</span>
                        <p className="mt-0.5">{selectedMember.joinDate}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Flugdaten - Full Width */}
              {(selectedMember.kenntnisausweisnummer || selectedMember.luftfahrtId || selectedMember.dmfvMitgliedsnummer) && (
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                        <Award className="h-4 w-4 text-primary" />
                      </div>
                      <h4>Flugdaten</h4>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-6">
                      {selectedMember.kenntnisausweisnummer && (
                        <div>
                          <span className="text-sm text-muted-foreground">Kenntnisausweisnummer</span>
                          <p className="font-mono text-sm mt-1">{selectedMember.kenntnisausweisnummer}</p>
                        </div>
                      )}
                      {selectedMember.kenntnisausweisAblauf && (
                        <div>
                          <span className="text-sm text-muted-foreground">Ablaufdatum</span>
                          <div className="flex items-center gap-2 mt-1">
                            <p>{selectedMember.kenntnisausweisAblauf}</p>
                            {selectedMember.kenntnisnachweisStatus !== "none" && getStatusBadge(selectedMember.kenntnisnachweisStatus)}
                          </div>
                        </div>
                      )}
                      {selectedMember.luftfahrtId && (
                        <div>
                          <span className="text-sm text-muted-foreground">Luftfahrt-ID</span>
                          <p className="font-mono text-sm mt-1">{selectedMember.luftfahrtId}</p>
                        </div>
                      )}
                      {selectedMember.dmfvMitgliedsnummer && (
                        <div>
                          <span className="text-sm text-muted-foreground">DMFV-Mitgliedsnummer</span>
                          <p className="font-mono text-sm mt-1">{selectedMember.dmfvMitgliedsnummer}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Kontaktdaten - Full Width */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <h4>Kontaktdaten</h4>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedMember.memberType === "Jugend" ? (
                    /* Jugendmitglied - 3 Spalten Layout */
                    <div className="space-y-6">
                      <div className="grid lg:grid-cols-3 gap-8">
                        {/* Mitglied */}
                        <div className="space-y-4">
                          <h4 className="pb-2 border-b">Mitglied</h4>
                          <div>
                            <span className="text-sm text-muted-foreground">E-Mail</span>
                            <p className="mt-1 break-all">{selectedMember.email}</p>
                          </div>
                          {selectedMember.phone && (
                            <div>
                              <span className="text-sm text-muted-foreground">Telefon</span>
                              <p className="mt-1">{selectedMember.phone}</p>
                            </div>
                          )}
                          {selectedMember.mobile && (
                            <div>
                              <span className="text-sm text-muted-foreground">Mobil</span>
                              <p className="mt-1">{selectedMember.mobile}</p>
                            </div>
                          )}
                        </div>

                        {/* 1. Kontaktperson */}
                        {(selectedMember.parent1_email || selectedMember.parent1_phone || selectedMember.parent1_mobile) && (
                          <div className="space-y-4">
                            <h4 className="pb-2 border-b">1. Kontaktperson</h4>
                            {selectedMember.parent1_email && (
                              <div>
                                <span className="text-sm text-muted-foreground">E-Mail</span>
                                <p className="mt-1 break-all">{selectedMember.parent1_email}</p>
                              </div>
                            )}
                            {selectedMember.parent1_phone && (
                              <div>
                                <span className="text-sm text-muted-foreground">Telefon</span>
                                <p className="mt-1">{selectedMember.parent1_phone}</p>
                              </div>
                            )}
                            {selectedMember.parent1_mobile && (
                              <div>
                                <span className="text-sm text-muted-foreground">Mobil</span>
                                <p className="mt-1">{selectedMember.parent1_mobile}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 2. Kontaktperson */}
                        {(selectedMember.parent2_email || selectedMember.parent2_phone || selectedMember.parent2_mobile) && (
                          <div className="space-y-4">
                            <h4 className="pb-2 border-b">2. Kontaktperson</h4>
                            {selectedMember.parent2_email && (
                              <div>
                                <span className="text-sm text-muted-foreground">E-Mail</span>
                                <p className="mt-1 break-all">{selectedMember.parent2_email}</p>
                              </div>
                            )}
                            {selectedMember.parent2_phone && (
                              <div>
                                <span className="text-sm text-muted-foreground">Telefon</span>
                                <p className="mt-1">{selectedMember.parent2_phone}</p>
                              </div>
                            )}
                            {selectedMember.parent2_mobile && (
                              <div>
                                <span className="text-sm text-muted-foreground">Mobil</span>
                                <p className="mt-1">{selectedMember.parent2_mobile}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Adresse - gemeinsam */}
                      <div className="pt-4 border-t">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Adresse</span>
                        </div>
                        <p>{selectedMember.strasse}</p>
                        <p>{selectedMember.plz} {selectedMember.wohnort}</p>
                      </div>
                    </div>
                  ) : (
                    /* Normales Mitglied - Standard Layout */
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <span className="text-sm text-muted-foreground">E-Mail</span>
                        <p className="mt-1 break-all">{selectedMember.email}</p>
                      </div>
                      {selectedMember.phone && (
                        <div>
                          <span className="text-sm text-muted-foreground">Telefon</span>
                          <p className="mt-1">{selectedMember.phone}</p>
                        </div>
                      )}
                      {selectedMember.mobile && (
                        <div>
                          <span className="text-sm text-muted-foreground">Mobil</span>
                          <p className="mt-1">{selectedMember.mobile}</p>
                        </div>
                      )}
                      <div className="sm:col-span-2 lg:col-span-3 pt-4 border-t">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Adresse</span>
                        </div>
                        <p>{selectedMember.strasse}</p>
                        <p>{selectedMember.plz} {selectedMember.wohnort}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Content Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Persönliche Daten */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                        <Cake className="h-4 w-4 text-primary" />
                      </div>
                      <h4>Persönliche Daten</h4>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Geburtsdatum</span>
                      <p className="mt-1">{selectedMember.birthDate} <span className="text-muted-foreground">({calculateAge(selectedMember.birthDate)} Jahre)</span></p>
                    </div>
                    {selectedMember.memberType === "Jugend" && (
                      <>
                        {selectedMember.parent1_name && (
                          <div>
                            <span className="text-sm text-muted-foreground">1. Kontaktperson ({selectedMember.parent1_relation || "Erziehungsberechtigter"})</span>
                            <p className="mt-1">{selectedMember.parent1_name}</p>
                          </div>
                        )}
                        {selectedMember.parent2_name && (
                          <div>
                            <span className="text-sm text-muted-foreground">2. Kontaktperson ({selectedMember.parent2_relation || "Erziehungsberechtigter"})</span>
                            <p className="mt-1">{selectedMember.parent2_name}</p>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Bankdaten */}
                {(selectedMember.iban || selectedMember.bic || selectedMember.kreditinstitut) && (
                  <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                          <Grid3x3 className="h-4 w-4 text-primary" />
                        </div>
                        <h4>Bankdaten</h4>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedMember.iban && (
                        <div>
                          <span className="text-sm text-muted-foreground">IBAN</span>
                          <p className="font-mono text-sm mt-1">{selectedMember.iban}</p>
                        </div>
                      )}
                      {selectedMember.bic && (
                        <div>
                          <span className="text-sm text-muted-foreground">BIC</span>
                          <p className="font-mono text-sm mt-1">{selectedMember.bic}</p>
                        </div>
                      )}
                      {selectedMember.kreditinstitut && (
                        <div>
                          <span className="text-sm text-muted-foreground">Kreditinstitut</span>
                          <p className="mt-1">{selectedMember.kreditinstitut}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                <Button 
                  className="flex-1 sm:flex-initial gap-2"
                  onClick={() => {
                    setDetailDialogOpen(false);
                    openEditDialog(selectedMember);
                  }}
                >
                  <Edit className="h-4 w-4" />
                  Bearbeiten
                </Button>
                <Button variant="outline" className="flex-1 sm:flex-initial sm:ml-auto" onClick={() => setDetailDialogOpen(false)}>
                  Schließen
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Member Edit Dialog */}
      <MemberEditDialog
        member={editMember}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleSaveMember}
      />
    </div>
  );
}
