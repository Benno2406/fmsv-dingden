import { Calendar, Users, Wrench, GraduationCap, Trophy, PartyPopper, MapPin, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useState } from "react";

// Termin-Kategorien
const categories = {
  vereinsintern: { label: "Vereinsintern", color: "bg-blue-500/10 text-blue-700 border-blue-200", icon: Users },
  platzpflege: { label: "Platzpflege", color: "bg-green-500/10 text-green-700 border-green-200", icon: Wrench },
  schulung: { label: "Schulung", color: "bg-purple-500/10 text-purple-700 border-purple-200", icon: GraduationCap },
  wettbewerb: { label: "Wettbewerb", color: "bg-orange-500/10 text-orange-700 border-orange-200", icon: Trophy },
  oeffentlich: { label: "Öffentlich", color: "bg-pink-500/10 text-pink-700 border-pink-200", icon: PartyPopper },
};

const termine = [
  {
    id: 1,
    titel: "Jahreshauptversammlung",
    datum: "2025-03-14",
    datumText: "Freitag, 14. März 2025",
    uhrzeit: "19:30 Uhr",
    ort: "bei Küpper",
    kategorie: "vereinsintern",
    beschreibung: "Unsere jährliche Mitgliederversammlung mit Berichten, Wahlen und Planung für das neue Jahr.",
  },
  {
    id: 2,
    titel: "Frühjahrsplatzpflege",
    datum: "2025-03-22",
    datumText: "Samstag, 22. März 2025",
    uhrzeit: "09:30 Uhr",
    kategorie: "platzpflege",
    beschreibung: "Gemeinsam machen wir unser Fluggelände fit für die Saison. Jede helfende Hand ist willkommen!",
  },
  {
    id: 3,
    titel: "Drohnenkurs Westnetz (Tag 1)",
    datum: "2025-05-08",
    datumText: "Donnerstag, 8. Mai 2025",
    uhrzeit: "09:00 - 13:00 Uhr",
    kategorie: "schulung",
    beschreibung: "Professionelle Drohnenschulung auf unserem Gelände.",
    nurFuerInfo: true,
  },
  {
    id: 4,
    titel: "Drohnenkurs Westnetz (Tag 2)",
    datum: "2025-05-09",
    datumText: "Freitag, 9. Mai 2025",
    uhrzeit: "13:00 - 16:00 Uhr",
    kategorie: "schulung",
    beschreibung: "Professionelle Drohnenschulung auf unserem Gelände.",
    nurFuerInfo: true,
  },
  {
    id: 5,
    titel: "F5J-Wettbewerb",
    datum: "2025-07-13",
    datumText: "Sonntag, 13. Juli 2025",
    kategorie: "wettbewerb",
    beschreibung: "Spannender Segelflug-Wettbewerb der Klasse F5J. Zuschauer sind herzlich willkommen!",
  },
  {
    id: 6,
    titel: "Schnupperfliegen",
    datum: "2025-08-09",
    datumText: "Samstag, 9. August 2025",
    kategorie: "oeffentlich",
    beschreibung: "Du möchtest den Modellflug kennenlernen? Komm vorbei und probiere es selbst aus! Für Kinder und Erwachsene.",
  },
  {
    id: 7,
    titel: "Sommerfest",
    datum: "2025-08-23",
    datumText: "23. & 24. August 2025",
    mehrtaegig: true,
    kategorie: "oeffentlich",
    beschreibung: "Unser jährliches Sommerfest mit Flugvorführungen, Grillstation und gemütlichem Beisammensein. Alle sind herzlich eingeladen!",
  },
  {
    id: 8,
    titel: "Herbstplatzpflege",
    datum: "2025-11-08",
    datumText: "Samstag, 8. November 2025",
    uhrzeit: "09:30 Uhr",
    kategorie: "platzpflege",
    beschreibung: "Gemeinsam bereiten wir das Gelände für die Wintermonate vor. Deine Unterstützung ist gefragt!",
  },
];

export function TerminePage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Filter-Funktion
  const filteredTermine = selectedCategories.length === 0 
    ? termine 
    : termine.filter(termin => selectedCategories.includes(termin.kategorie));

  // Toggle-Funktion für Kategorien
  const toggleCategory = (categoryKey: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryKey) 
        ? prev.filter(k => k !== categoryKey)
        : [...prev, categoryKey]
    );
  };

  // Alle auswählen / abwählen
  const clearFilters = () => {
    setSelectedCategories([]);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[350px] overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWxlbmRhciUyMGV2ZW50c3xlbnwxfHx8fDE3NjExNzI4NzB8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Termine und Veranstaltungen"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl text-white">
              <h1 className="text-white mb-4">Termine 2025</h1>
              <p className="text-white/90" style={{ fontSize: '1.125rem' }}>
                Alle Veranstaltungen, Wettbewerbe und wichtigen Termine des FMSV Dingden 
                auf einen Blick. Wir freuen uns auf deine Teilnahme!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            
            {/* Kategorien-Filter */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2>Filter nach Kategorie</h2>
                {selectedCategories.length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-primary hover:underline"
                    style={{ fontSize: '0.875rem' }}
                  >
                    Alle anzeigen ({termine.length})
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {Object.entries(categories).map(([key, category]) => {
                  const Icon = category.icon;
                  const isSelected = selectedCategories.includes(key);
                  
                  return (
                    <button
                      key={key}
                      onClick={() => toggleCategory(key)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                        isSelected 
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                          : 'bg-card hover:bg-muted/50 border-border'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                      <span className="text-sm">{category.label}</span>
                      {isSelected && (
                        <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                          {termine.filter(t => t.kategorie === key).length}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
              {selectedCategories.length > 0 && (
                <p className="text-muted-foreground mt-4" style={{ fontSize: '0.875rem' }}>
                  {filteredTermine.length} {filteredTermine.length === 1 ? 'Termin' : 'Termine'} gefunden
                </p>
              )}
            </div>

            {/* Termine Liste */}
            <div className="space-y-6">
              {filteredTermine.length === 0 ? (
                <Card className="p-12 text-center">
                  <div className="text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Keine Termine in den ausgewählten Kategorien gefunden.</p>
                  </div>
                </Card>
              ) : (
                filteredTermine.map((termin, index) => {
                const category = categories[termin.kategorie as keyof typeof categories];
                const Icon = category.icon;
                
                return (
                  <Card key={termin.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="flex flex-col md:flex-row">
                      {/* Datum-Box */}
                      <div className="md:w-48 bg-primary/5 p-6 flex flex-col justify-center items-center md:items-start border-b md:border-b-0 md:border-r">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-5 w-5 text-primary" />
                          <Badge variant="outline" className={category.color}>
                            {category.label}
                          </Badge>
                        </div>
                        <div className="text-center md:text-left">
                          <div className="text-muted-foreground mb-1" style={{ fontSize: '0.875rem' }}>
                            {termin.datumText}
                          </div>
                          {termin.uhrzeit && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              <span style={{ fontSize: '0.875rem' }}>{termin.uhrzeit}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-6">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="mb-1">{termin.titel}</h3>
                            {termin.ort && (
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5" />
                                <span style={{ fontSize: '0.875rem' }}>{termin.ort}</span>
                              </div>
                            )}
                          </div>
                          {termin.nurFuerInfo && (
                            <Badge variant="secondary" className="ml-auto">
                              Geschlossene Veranstaltung
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-muted-foreground">
                          {termin.beschreibung}
                        </p>

                        {/* Besondere Hinweise für öffentliche Events */}
                        {termin.kategorie === 'oeffentlich' && !termin.nurFuerInfo && (
                          <div className="mt-4 p-3 bg-primary/5 rounded-lg border-l-4 border-primary">
                            <p style={{ fontSize: '0.875rem' }}>
                              <strong>Öffentliche Veranstaltung:</strong> Alle Interessierten sind herzlich willkommen! 
                              Keine Anmeldung erforderlich.
                            </p>
                          </div>
                        )}

                        {/* Hinweis für Platzpflege */}
                        {termin.kategorie === 'platzpflege' && (
                          <div className="mt-4 p-3 bg-green-500/5 rounded-lg border-l-4 border-green-500">
                            <p style={{ fontSize: '0.875rem' }}>
                              <strong>Mitglieder aufgepasst:</strong> Wir freuen uns über jede helfende Hand. 
                              Bitte Arbeitshandschuhe und wetterfeste Kleidung mitbringen!
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
              )}
            </div>

            {/* Info-Box am Ende */}
            <Card className="mt-12 bg-muted/30">
              <CardHeader>
                <CardTitle>Terminänderungen vorbehalten</CardTitle>
                <CardDescription>
                  Wichtige Information zu unseren Veranstaltungen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>
                  Alle Termine werden nach bestem Wissen und Gewissen geplant. Kurzfristige Änderungen 
                  aufgrund von Wetter oder anderen Umständen sind möglich.
                </p>
                <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                  Bei Fragen zu einzelnen Veranstaltungen oder bei Interesse an einer Teilnahme, 
                  melde dich gerne bei uns per E-Mail oder komm einfach vorbei!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
