import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
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
  XCircle
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  memberType: "Aktiv" | "Passiv" | "Jugend" | "Ehren";
  joinDate: string;
  birthDate: string;
  kenntnisnachweis: string;
  kenntnisnachweisStatus: "valid" | "expiring" | "expired" | "none";
  email: string;
  phone: string;
  address: string;
  notes?: string;
}

export function MembersTab() {
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const [members] = useState<Member[]>([
    {
      id: "M001",
      firstName: "Thomas",
      lastName: "Müller",
      memberType: "Aktiv",
      joinDate: "15.03.2018",
      birthDate: "12.05.1975",
      kenntnisnachweis: "Gültig bis 15.08.2025",
      kenntnisnachweisStatus: "valid",
      email: "thomas.mueller@email.de",
      phone: "0172 1234567",
      address: "Musterstraße 12, 46499 Hamminkeln",
      notes: "Erfahrener Pilot, Fluglehrer"
    },
    {
      id: "M002",
      firstName: "Anna",
      lastName: "Schmidt",
      memberType: "Aktiv",
      joinDate: "22.07.2019",
      birthDate: "08.11.1982",
      kenntnisnachweis: "Gültig bis 10.02.2026",
      kenntnisnachweisStatus: "valid",
      email: "anna.schmidt@email.de",
      phone: "0173 2345678",
      address: "Gartenweg 5, 46499 Hamminkeln"
    },
    {
      id: "M003",
      firstName: "Jonas",
      lastName: "Weber",
      memberType: "Jugend",
      joinDate: "10.04.2023",
      birthDate: "15.03.2008",
      kenntnisnachweis: "In Ausbildung",
      kenntnisnachweisStatus: "none",
      email: "jonas.weber@email.de",
      phone: "0174 3456789",
      address: "Schulstraße 23, 46499 Hamminkeln",
      notes: "Sehr motiviert, macht schnelle Fortschritte"
    },
    {
      id: "M004",
      firstName: "Lisa",
      lastName: "Hoffmann",
      memberType: "Aktiv",
      joinDate: "05.09.2020",
      birthDate: "20.07.1988",
      kenntnisnachweis: "Gültig bis 30.04.2025",
      kenntnisnachweisStatus: "expiring",
      email: "lisa.hoffmann@email.de",
      phone: "0175 4567890",
      address: "Birkenallee 8, 46499 Hamminkeln"
    },
    {
      id: "M005",
      firstName: "Peter",
      lastName: "Klein",
      memberType: "Passiv",
      joinDate: "18.11.2017",
      birthDate: "03.02.1965",
      kenntnisnachweis: "-",
      kenntnisnachweisStatus: "none",
      email: "peter.klein@email.de",
      phone: "0176 5678901",
      address: "Hauptstraße 45, 46499 Hamminkeln",
      notes: "Fördermitglied"
    },
    {
      id: "M006",
      firstName: "Michael",
      lastName: "Becker",
      memberType: "Aktiv",
      joinDate: "12.01.2015",
      birthDate: "28.09.1970",
      kenntnisnachweis: "Abgelaufen seit 01.01.2025",
      kenntnisnachweisStatus: "expired",
      email: "michael.becker@email.de",
      phone: "0177 6789012",
      address: "Feldweg 17, 46499 Hamminkeln"
    },
    {
      id: "M007",
      firstName: "Sarah",
      lastName: "Wagner",
      memberType: "Jugend",
      joinDate: "15.08.2024",
      birthDate: "10.06.2009",
      kenntnisnachweis: "In Ausbildung",
      kenntnisnachweisStatus: "none",
      email: "sarah.wagner@email.de",
      phone: "0178 7890123",
      address: "Dorfstraße 9, 46499 Hamminkeln"
    },
    {
      id: "M008",
      firstName: "Klaus",
      lastName: "Schneider",
      memberType: "Ehren",
      joinDate: "01.06.2005",
      birthDate: "15.04.1955",
      kenntnisnachweis: "Gültig bis 20.12.2025",
      kenntnisnachweisStatus: "valid",
      email: "klaus.schneider@email.de",
      phone: "0179 8901234",
      address: "Am Berg 3, 46499 Hamminkeln",
      notes: "Gründungsmitglied, langjähriger 1. Vorsitzender"
    },
  ]);

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
          <Badge variant="outline" className="gap-1 border-green-500 text-green-700 bg-green-50">
            <CheckCircle className="h-3 w-3" />
            Gültig
          </Badge>
        );
      case "expiring":
        return (
          <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-700 bg-yellow-50">
            <AlertCircle className="h-3 w-3" />
            Läuft bald ab
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="outline" className="gap-1 border-red-500 text-red-700 bg-red-50">
            <XCircle className="h-3 w-3" />
            Abgelaufen
          </Badge>
        );
      default:
        return null;
    }
  };

  const openDetailDialog = (member: Member) => {
    setSelectedMember(member);
    setDetailDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Alle Vereinsmitglieder
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Mitglieder</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              {stats.validKenntnisnachweis} mit gültigem Kenntnisnachweis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jugend</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.youth}</div>
            <p className="text-xs text-muted-foreground">
              In Ausbildung
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Passive & Ehren</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.passive + stats.honorary}</div>
            <p className="text-xs text-muted-foreground">
              {stats.passive} Passiv, {stats.honorary} Ehrenmitglied
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Kenntnisnachweis Status Overview */}
      {(stats.expiringKenntnisnachweis > 0 || stats.expiredKenntnisnachweis > 0) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Kenntnisnachweis-Warnung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.expiringKenntnisnachweis > 0 && (
              <p className="text-sm">
                ⚠️ <strong>{stats.expiringKenntnisnachweis}</strong> {stats.expiringKenntnisnachweis === 1 ? "Mitglied hat" : "Mitglieder haben"} einen bald ablaufenden Kenntnisnachweis
              </p>
            )}
            {stats.expiredKenntnisnachweis > 0 && (
              <p className="text-sm text-red-600">
                🚫 <strong>{stats.expiredKenntnisnachweis}</strong> {stats.expiredKenntnisnachweis === 1 ? "Mitglied hat" : "Mitglieder haben"} einen abgelaufenen Kenntnisnachweis
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Members Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Mitgliederübersicht</CardTitle>
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "table" | "grid")}>
                <TabsList>
                  <TabsTrigger value="table" className="gap-2">
                    <List className="h-4 w-4" />
                    <span className="hidden sm:inline">Tabelle</span>
                  </TabsTrigger>
                  <TabsTrigger value="grid" className="gap-2">
                    <Grid3x3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Karten</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Add Member Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    <span className="hidden sm:inline">Mitglied hinzufügen</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Neues Mitglied anlegen</DialogTitle>
                    <DialogDescription>
                      Trage die Daten des neuen Vereinsmitglieds ein.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Vorname</Label>
                        <Input id="firstName" placeholder="Max" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Nachname</Label>
                        <Input id="lastName" placeholder="Mustermann" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">E-Mail</Label>
                        <Input id="email" type="email" placeholder="max@email.de" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefon</Label>
                        <Input id="phone" type="tel" placeholder="0172 1234567" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="birthDate">Geburtsdatum</Label>
                        <Input id="birthDate" type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="joinDate">Eintrittsdatum</Label>
                        <Input id="joinDate" type="date" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Adresse</Label>
                      <Input id="address" placeholder="Musterstraße 1, 46499 Hamminkeln" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="memberType">Mitgliedstyp</Label>
                        <Select>
                          <SelectTrigger id="memberType">
                            <SelectValue placeholder="Typ auswählen" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="aktiv">Aktiv</SelectItem>
                            <SelectItem value="passiv">Passiv</SelectItem>
                            <SelectItem value="jugend">Jugend</SelectItem>
                            <SelectItem value="ehren">Ehrenmitglied</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="kenntnisnachweis">Kenntnisnachweis</Label>
                        <Input id="kenntnisnachweis" placeholder="Gültig bis..." />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notizen</Label>
                      <Input id="notes" placeholder="Optionale Anmerkungen" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <DialogTrigger asChild>
                      <Button variant="outline">Abbrechen</Button>
                    </DialogTrigger>
                    <Button>Mitglied anlegen</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Mitglied suchen..." className="pl-9" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Mitglieder</SelectItem>
                  <SelectItem value="aktiv">Aktiv</SelectItem>
                  <SelectItem value="passiv">Passiv</SelectItem>
                  <SelectItem value="jugend">Jugend</SelectItem>
                  <SelectItem value="ehren">Ehrenmitglied</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {/* Table View */}
          {viewMode === "table" && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mitglied</TableHead>
                    <TableHead>Mitgliedstyp</TableHead>
                    <TableHead>Kenntnisnachweis</TableHead>
                    <TableHead>Mitglied seit</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className={`${getAvatarColor(member.firstName)} h-10 w-10`}>
                            <AvatarFallback className="bg-transparent text-white">
                              {getInitials(member.firstName, member.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {member.firstName} {member.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {member.id} • {calculateAge(member.birthDate)} Jahre
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            member.memberType === "Aktiv"
                              ? "default"
                              : member.memberType === "Jugend"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {member.memberType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">{member.kenntnisnachweis}</div>
                          {getStatusBadge(member.kenntnisnachweisStatus)}
                        </div>
                      </TableCell>
                      <TableCell>{member.joinDate}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="gap-2"
                            onClick={() => openDetailDialog(member)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Details
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-2">
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Grid View */}
          {viewMode === "grid" && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => (
                <Card key={member.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className={`${getAvatarColor(member.firstName)} h-12 w-12`}>
                          <AvatarFallback className="bg-transparent text-white text-lg">
                            {getInitials(member.firstName, member.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">
                            {member.firstName} {member.lastName}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {member.id} • {calculateAge(member.birthDate)} Jahre
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          member.memberType === "Aktiv"
                            ? "default"
                            : member.memberType === "Jugend"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {member.memberType}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span>Mitglied seit {member.joinDate}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 gap-2"
                        onClick={() => openDetailDialog(member)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Details
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Member Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedMember && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <Avatar className={`${getAvatarColor(selectedMember.firstName)} h-16 w-16`}>
                    <AvatarFallback className="bg-transparent text-white text-2xl">
                      {getInitials(selectedMember.firstName, selectedMember.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <DialogTitle className="text-2xl">
                      {selectedMember.firstName} {selectedMember.lastName}
                    </DialogTitle>
                    <DialogDescription>
                      Mitgliedsnummer: {selectedMember.id}
                    </DialogDescription>
                    <div className="flex gap-2 mt-2">
                      <Badge
                        variant={
                          selectedMember.memberType === "Aktiv"
                            ? "default"
                            : selectedMember.memberType === "Jugend"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {selectedMember.memberType}
                      </Badge>
                      {getStatusBadge(selectedMember.kenntnisnachweisStatus)}
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Personal Information */}
                <div>
                  <h4 className="mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Persönliche Informationen
                  </h4>
                  <div className="grid gap-3 rounded-lg border p-4">
                    <div className="flex items-start gap-3">
                      <Cake className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">Geburtsdatum</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedMember.birthDate} ({calculateAge(selectedMember.birthDate)} Jahre)
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">Mitglied seit</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedMember.joinDate}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">Adresse</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedMember.address}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="mb-3">Kontaktinformationen</h4>
                  <div className="grid gap-3 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">E-Mail</div>
                          <div className="text-sm text-muted-foreground">
                            {selectedMember.email}
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.location.href = `mailto:${selectedMember.email}`}
                      >
                        E-Mail senden
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">Telefon</div>
                          <div className="text-sm text-muted-foreground">
                            {selectedMember.phone}
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.location.href = `tel:${selectedMember.phone.replace(/\s/g, '')}`}
                      >
                        Anrufen
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Kenntnisnachweis */}
                <div>
                  <h4 className="mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Kenntnisnachweis
                  </h4>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium mb-1">
                          {selectedMember.kenntnisnachweis}
                        </div>
                        {getStatusBadge(selectedMember.kenntnisnachweisStatus)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedMember.notes && (
                  <div>
                    <h4 className="mb-3">Notizen</h4>
                    <div className="rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground">
                        {selectedMember.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
                  Schließen
                </Button>
                <Button className="gap-2">
                  <Edit className="h-4 w-4" />
                  Bearbeiten
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
