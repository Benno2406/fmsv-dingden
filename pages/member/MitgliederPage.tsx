import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { 
  User, 
  Search, 
  Mail, 
  Phone, 
  Calendar,
  UserCircle,
  Crown,
  Wrench,
  Users,
  GraduationCap,
  Shield
} from "lucide-react";

// Mock data
const members = [
  { 
    id: 1,
    name: "Thomas Müller", 
    role: "1. Vorsitzender",
    category: "Vorstand",
    email: "thomas.mueller@fmsv.de", 
    phone: "0172 1234567",
    joinDate: "15.03.2015",
    memberNumber: "FMSV-0001",
    status: "active",
    showEmail: true,
    showPhone: true,
  },
  { 
    id: 2,
    name: "Anna Schmidt", 
    role: "Kassenwart",
    category: "Vorstand",
    email: "anna.schmidt@fmsv.de", 
    phone: "0173 2345678",
    joinDate: "22.08.2016",
    memberNumber: "FMSV-0003",
    status: "active",
    showEmail: true,
    showPhone: false,
  },
  { 
    id: 3,
    name: "Jonas Weber", 
    role: "Jugendleiter",
    category: "Vorstand",
    email: "jonas.weber@fmsv.de", 
    phone: "0174 3456789",
    joinDate: "10.05.2017",
    memberNumber: "FMSV-0007",
    status: "active",
    showEmail: true,
    showPhone: true,
  },
  { 
    id: 4,
    name: "Klaus Fischer", 
    role: "Technischer Leiter",
    category: "Vorstand",
    email: "klaus.fischer@fmsv.de", 
    phone: "0176 5678901",
    joinDate: "03.01.2014",
    memberNumber: "FMSV-0002",
    status: "active",
    showEmail: true,
    showPhone: true,
  },
  { 
    id: 5,
    name: "Lisa Hoffmann", 
    role: "Mitglied",
    category: "Aktive Mitglieder",
    email: "lisa.hoffmann@email.de", 
    phone: "0175 4567890",
    joinDate: "18.09.2019",
    memberNumber: "FMSV-0024",
    status: "active",
    showEmail: false,
    showPhone: true,
  },
  { 
    id: 6,
    name: "Max Mustermann", 
    role: "Mitglied",
    category: "Aktive Mitglieder",
    email: "max.mustermann@email.de", 
    phone: "0172 1234567",
    joinDate: "05.04.2020",
    memberNumber: "FMSV-0031",
    status: "active",
    showEmail: true,
    showPhone: true,
  },
  { 
    id: 7,
    name: "Sandra Becker", 
    role: "Mitglied",
    category: "Aktive Mitglieder",
    email: "sandra.becker@email.de", 
    phone: "0177 6789012",
    joinDate: "12.11.2020",
    memberNumber: "FMSV-0035",
    status: "active",
    showEmail: false,
    showPhone: false,
  },
  { 
    id: 8,
    name: "Tim Schneider", 
    role: "Jugendmitglied",
    category: "Jugend",
    email: "tim.schneider@email.de", 
    phone: "0178 7890123",
    joinDate: "20.03.2023",
    memberNumber: "FMSV-0052",
    status: "active",
    showEmail: true,
    showPhone: true,
  },
  { 
    id: 9,
    name: "Emma Wagner", 
    role: "Jugendmitglied",
    category: "Jugend",
    email: "emma.wagner@email.de", 
    phone: "0179 8901234",
    joinDate: "15.04.2023",
    memberNumber: "FMSV-0053",
    status: "active",
    showEmail: true,
    showPhone: false,
  },
  { 
    id: 10,
    name: "Michael Braun", 
    role: "Webmaster",
    category: "Aktive Mitglieder",
    email: "michael.braun@fmsv.de", 
    phone: "0171 9012345",
    joinDate: "08.07.2018",
    memberNumber: "FMSV-0015",
    status: "active",
    showEmail: true,
    showPhone: true,
  },
];

const getRoleIcon = (role: string) => {
  if (role.includes("Vorsitzender")) return Crown;
  if (role.includes("Technischer")) return Wrench;
  if (role.includes("Jugendleiter")) return GraduationCap;
  if (role.includes("Jugendmitglied")) return GraduationCap;
  if (role.includes("Webmaster")) return Shield;
  return User;
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

export function MitgliederPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedMember, setSelectedMember] = useState<typeof members[0] | null>(null);

  // Filter members based on search and category
  const filteredMembers = members.filter((member) => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === "all" || member.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ["all", ...Array.from(new Set(members.map(m => m.category)))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="mb-2">Mitgliederliste</h2>
        <p className="text-muted-foreground">
          Übersicht und Kontaktdaten aller Vereinsmitglieder.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nach Name, E-Mail oder Rolle suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Alle Kategorien" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kategorien</SelectItem>
                <SelectItem value="Vorstand">Vorstand</SelectItem>
                <SelectItem value="Aktive Mitglieder">Aktive Mitglieder</SelectItem>
                <SelectItem value="Jugend">Jugend</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Count */}
          <div className="mt-4 flex items-center gap-2 text-muted-foreground" style={{ fontSize: '0.875rem' }}>
            <Users className="h-4 w-4" />
            <span>
              {filteredMembers.length} {filteredMembers.length === 1 ? "Mitglied" : "Mitglieder"} gefunden
              {selectedCategory !== "all" && ` in "${selectedCategory}"`}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredMembers.map((member) => {
          const RoleIcon = getRoleIcon(member.role);
          
          return (
            <Card key={member.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="mb-1">{member.name}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="gap-1">
                            <RoleIcon className="h-3 w-3" />
                            {member.role}
                          </Badge>
                          {member.category === "Vorstand" && (
                            <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">
                              Vorstand
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-1.5 mb-3">
                      {member.showEmail ? (
                        <div className="flex items-center gap-2 text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                          <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                          <a 
                            href={`mailto:${member.email}`}
                            className="hover:text-primary transition-colors truncate"
                          >
                            {member.email}
                          </a>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                          <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="italic">E-Mail nicht öffentlich</span>
                        </div>
                      )}
                      {member.showPhone ? (
                        <div className="flex items-center gap-2 text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                          <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                          <a 
                            href={`tel:${member.phone}`}
                            className="hover:text-primary transition-colors"
                          >
                            {member.phone}
                          </a>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                          <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="italic">Telefon nicht öffentlich</span>
                        </div>
                      )}
                    </div>

                    {/* View Details Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-3 -ml-2 gap-2"
                      onClick={() => setSelectedMember(member)}
                    >
                      <UserCircle className="h-4 w-4" />
                      Mehr Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredMembers.length === 0 && (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="mb-2">Keine Mitglieder gefunden</h3>
            <p className="text-muted-foreground mb-4">
              Versuche es mit einem anderen Suchbegriff oder Filter.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
            >
              Filter zurücksetzen
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Member Detail Dialog */}
      <Dialog open={selectedMember !== null} onOpenChange={(open) => !open && setSelectedMember(null)}>
        <DialogContent className="max-w-2xl">
          {selectedMember && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4 mb-2">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {getInitials(selectedMember.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-2xl mb-1">{selectedMember.name}</DialogTitle>
                    <DialogDescription className="flex items-center gap-2 flex-wrap">
                      <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                        Aktiv
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        {(() => {
                          const Icon = getRoleIcon(selectedMember.role);
                          return <Icon className="h-3 w-3" />;
                        })()}
                        {selectedMember.role}
                      </Badge>
                      {selectedMember.category === "Vorstand" && (
                        <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">
                          Vorstand
                        </Badge>
                      )}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 pt-4">
                {/* Contact Information */}
                {(selectedMember.showEmail || selectedMember.showPhone) ? (
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Kontakt
                    </h4>
                    <div className="grid gap-3 ml-6">
                      {selectedMember.showEmail && (
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>E-Mail</span>
                          <a 
                            href={`mailto:${selectedMember.email}`}
                            className="hover:text-primary transition-colors"
                          >
                            {selectedMember.email}
                          </a>
                        </div>
                      )}
                      {selectedMember.showPhone && (
                        <div className="flex flex-col gap-1">
                          <span className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>Telefon</span>
                          <a 
                            href={`tel:${selectedMember.phone}`}
                            className="hover:text-primary transition-colors"
                          >
                            {selectedMember.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Kontakt
                    </h4>
                    <div className="ml-6 p-4 rounded-lg bg-muted/50 border border-dashed">
                      <p className="text-muted-foreground text-center" style={{ fontSize: '0.875rem' }}>
                        Dieses Mitglied hat seine Kontaktdaten nicht zur Veröffentlichung freigegeben.
                      </p>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                {(selectedMember.showEmail || selectedMember.showPhone) && (
                  <div className="flex gap-3 pt-4 border-t">
                    {selectedMember.showEmail && (
                      <Button className="flex-1 gap-2" asChild>
                        <a href={`mailto:${selectedMember.email}`}>
                          <Mail className="h-4 w-4" />
                          E-Mail senden
                        </a>
                      </Button>
                    )}
                    {selectedMember.showPhone && (
                      <Button variant="outline" className="flex-1 gap-2" asChild>
                        <a href={`tel:${selectedMember.phone}`}>
                          <Phone className="h-4 w-4" />
                          Anrufen
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
