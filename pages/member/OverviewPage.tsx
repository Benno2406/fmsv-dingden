import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { 
  Users, 
  Calendar, 
  FileText, 
  Plane,
  BookOpen,
  Clock,
  MapPin,
  GraduationCap,
  Trophy,
  PartyPopper,
  Wrench,
  Shield
} from "lucide-react";

// Mock-Daten für Termine
const categories = {
  training: { label: 'Training', icon: GraduationCap, color: 'bg-blue-500/10 text-blue-700 border-blue-200' },
  wettbewerb: { label: 'Wettbewerb', icon: Trophy, color: 'bg-purple-500/10 text-purple-700 border-purple-200' },
  veranstaltung: { label: 'Veranstaltung', icon: PartyPopper, color: 'bg-pink-500/10 text-pink-700 border-pink-200' },
  wartung: { label: 'Wartung', icon: Wrench, color: 'bg-orange-500/10 text-orange-700 border-orange-200' },
  vorstand: { label: 'Vorstand', icon: Shield, color: 'bg-gray-500/10 text-gray-700 border-gray-200' },
};

const upcomingEvents = [
  {
    id: 1,
    kategorie: 'training',
    titel: 'Jugendtraining',
    datumText: 'Sa, 26. Okt 2025',
    uhrzeit: '14:00 - 17:00 Uhr',
    ort: 'Modellflugplatz Dingden',
    beschreibung: 'Regelmäßiges Training für Jugendliche und Anfänger. Trainer: Klaus Müller'
  },
  {
    id: 2,
    kategorie: 'wettbewerb',
    titel: 'Vereinsmeisterschaft 2025',
    datumText: 'So, 3. Nov 2025',
    uhrzeit: '10:00 - 16:00 Uhr',
    ort: 'Modellflugplatz Dingden',
    beschreibung: 'Jährliche Vereinsmeisterschaft mit verschiedenen Wertungsklassen.'
  },
  {
    id: 3,
    kategorie: 'vorstand',
    titel: 'Vorstandssitzung',
    datumText: 'Di, 5. Nov 2025',
    uhrzeit: '19:00 Uhr',
    ort: 'Vereinsheim',
    beschreibung: 'Monatliche Vorstandssitzung - offen für alle Mitglieder'
  },
  {
    id: 4,
    kategorie: 'veranstaltung',
    titel: 'Winterfest',
    datumText: 'Sa, 14. Dez 2025',
    uhrzeit: '18:00 Uhr',
    ort: 'Vereinsheim',
    beschreibung: 'Gemütliches Beisammensein mit Glühwein und Bratwurst'
  },
];

const internalNews = [
  {
    id: 1,
    title: 'Neue Flugordnung ab November',
    date: '20. Okt 2025',
    excerpt: 'Ab dem 1. November gilt eine aktualisierte Flugordnung. Bitte beachtet die neuen Regelungen zu Flugzeiten und Lärmschutz.',
    wichtig: true
  },
  {
    id: 2,
    title: 'Platzpflege am Samstag',
    date: '18. Okt 2025',
    excerpt: 'Am kommenden Samstag findet ab 10 Uhr die monatliche Platzpflege statt. Jede helfende Hand ist willkommen!',
    wichtig: false
  },
  {
    id: 3,
    title: 'Erfolgreiche Herbstmeisterschaft',
    date: '15. Okt 2025',
    excerpt: 'Gratulation an alle Teilnehmer der Herbstmeisterschaft! Die Ergebnisse sind jetzt online verfügbar.',
    wichtig: false
  },
];

export function OverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2">Willkommen im Mitgliederbereich!</h2>
        <p className="text-muted-foreground">
          Hier findest du alle wichtigen Informationen rund um den Verein.
        </p>
      </div>

      {/* Vereinsstatistiken */}
      <Card>
        <CardHeader>
          <CardTitle>Vereinsstatistik</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Badge className="text-sm py-1.5 px-3">87 Mitglieder</Badge>
            <Badge variant="secondary" className="text-sm py-1.5 px-3">23 Jugendliche</Badge>
            <Badge variant="outline" className="text-sm py-1.5 px-3">8 anstehende Termine</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Schnellzugriff */}
      <Card>
        <CardHeader>
          <CardTitle>Schnellzugriff</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-3"
              disabled
            >
              <Plane className="h-8 w-8" />
              <span>Flugbuch eintragen</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-3">
              <Users className="h-8 w-8" />
              <span>Vorstandsliste</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-3">
              <BookOpen className="h-8 w-8" />
              <span>Flugordnung</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Aktuelle Termine und Interne News */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <CardTitle>Anstehende Termine</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2 flex-1">
              {upcomingEvents.map((termin) => {
                const category = categories[termin.kategorie as keyof typeof categories];
                const Icon = category.icon;
                
                return (
                  <div key={termin.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    {/* Header mit Kategorie */}
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className={category.color}>
                        <Icon className="h-3 w-3 mr-1" />
                        {category.label}
                      </Badge>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span style={{ fontSize: '0.75rem' }}>{termin.datumText}</span>
                      </div>
                    </div>
                    
                    {/* Titel und Details */}
                    <div className="mb-2">
                      <h4 className="mb-2">{termin.titel}</h4>
                      <div className="space-y-1">
                        {termin.uhrzeit && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span style={{ fontSize: '0.875rem' }}>{termin.uhrzeit}</span>
                          </div>
                        )}
                        {termin.ort && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            <span style={{ fontSize: '0.875rem' }}>{termin.ort}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Beschreibung */}
                    <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                      {termin.beschreibung}
                    </p>
                  </div>
                );
              })}
            </div>
            <Button variant="outline" className="w-full mt-4 flex-shrink-0">
              Alle Termine ansehen
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <CardTitle>Interne Nachrichten</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2 flex-1">
              {internalNews.map((news) => (
                <div key={news.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  {/* Header mit Datum und Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span style={{ fontSize: '0.75rem' }}>{news.date}</span>
                    </div>
                    {news.wichtig && (
                      <Badge variant="destructive" className="text-xs">
                        Wichtig
                      </Badge>
                    )}
                  </div>
                  
                  {/* Titel */}
                  <div className="mb-2">
                    <h4 className="mb-2 flex items-start gap-2">
                      <FileText className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                      <span>{news.title}</span>
                    </h4>
                  </div>
                  
                  {/* Nachrichtentext */}
                  <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                    {news.excerpt}
                  </p>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 flex-shrink-0">
              Alle Nachrichten
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
