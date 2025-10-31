import { useState, useEffect } from "react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Camera, Video, Calendar, Play, X, Image as ImageIcon, ChevronLeft, ChevronRight, PartyPopper, Trophy, Users, Wrench, FolderOpen } from "lucide-react";
import Masonry from "react-responsive-masonry";

// Album-Typen
type AlbumCategory = "event" | "wettbewerb" | "jugend" | "platzpflege" | "sonstiges";

interface AlbumImage {
  url: string;
  caption?: string;
}

interface Album {
  id: number;
  titel: string;
  datum: string;
  category: AlbumCategory;
  coverImage: string;
  beschreibung: string;
  bilder: AlbumImage[];
}

interface VideoItem {
  id: number;
  titel: string;
  beschreibung: string;
  thumbnail: string;
  youtubeId?: string;
  datum: string;
  category: string;
}

// Kategorien für Filter
const albumCategories = {
  event: { 
    label: "Veranstaltungen", 
    icon: PartyPopper,
    color: "bg-pink-500/10 text-pink-700 border-pink-200",
    colorActive: "bg-pink-500 text-white border-pink-500",
    description: "Sommerfeste, Schnupperfliegen und mehr"
  },
  wettbewerb: { 
    label: "Wettbewerbe", 
    icon: Trophy,
    color: "bg-orange-500/10 text-orange-700 border-orange-200",
    colorActive: "bg-orange-500 text-white border-orange-500",
    description: "F5J, F3K und andere Wettbewerbe"
  },
  jugend: { 
    label: "Jugendarbeit", 
    icon: Users,
    color: "bg-blue-500/10 text-blue-700 border-blue-200",
    colorActive: "bg-blue-500 text-white border-blue-500",
    description: "Training und Ausbildung unserer Nachwuchspiloten"
  },
  platzpflege: { 
    label: "Platzpflege", 
    icon: Wrench,
    color: "bg-green-500/10 text-green-700 border-green-200",
    colorActive: "bg-green-500 text-white border-green-500",
    description: "Gemeinsame Arbeitseinsätze auf dem Gelände"
  },
  sonstiges: { 
    label: "Sonstiges", 
    icon: FolderOpen,
    color: "bg-gray-500/10 text-gray-700 border-gray-200",
    colorActive: "bg-gray-600 text-white border-gray-600",
    description: "Weitere Vereinsaktivitäten"
  },
};

// Dummy Alben
const alben: Album[] = [
  {
    id: 1,
    titel: "Sommerfest 2024",
    datum: "August 2024",
    category: "event",
    coverImage: "https://images.unsplash.com/photo-1653047807257-1ebbc26a999d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW1tZXIlMjBmZXN0aXZhbCUyMG91dGRvb3J8ZW58MXx8fHwxNzYxMTQ4Nzg5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    beschreibung: "Unser traditionelles Sommerfest mit Flugvorführungen, Grillen und viel guter Laune.",
    bilder: [
      { 
        url: "https://images.unsplash.com/photo-1653047807257-1ebbc26a999d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW1tZXIlMjBmZXN0aXZhbCUyMG91dGRvb3J8ZW58MXx8fHwxNzYxMTQ4Nzg5fDA&ixlib=rb-4.1.0&q=80&w=1080",
        caption: "Traumhaftes Wetter beim Sommerfest - perfekte Bedingungen für tolle Flüge"
      },
      { 
        url: "https://images.unsplash.com/photo-1760080839321-a6aa581c3ef3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncm91cCUyMGNlbGVicmF0aW9uJTIwZXZlbnR8ZW58MXx8fHwxNzYxMTUwNjU0fDA&ixlib=rb-4.1.0&q=80&w=1080",
        caption: "Unsere Mitglieder genießen das gemeinsame Fest und den Austausch"
      },
      { 
        url: "https://images.unsplash.com/photo-1642099415153-e5a9692a77f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2RlbCUyMGFpcnBsYW5lJTIwZmx5aW5nfGVufDF8fHx8MTc2MTE3MzE4OHww&ixlib=rb-4.1.0&q=80&w=1080",
        caption: "Flugvorführung mit dem neuen Segelflugmodell - beeindruckende Thermikflüge"
      },
      { 
        url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZW9wbGUlMjB3b3JraW5nJTIwdG9nZXRoZXJ8ZW58MXx8fHwxNzYxMTQ0OTkxfDA&ixlib=rb-4.1.0&q=80&w=1080",
        caption: "Teamwork beim Aufbau der Grillstation - gemeinsam macht's mehr Spaß"
      },
      { 
        url: "https://images.unsplash.com/photo-1653047807257-1ebbc26a999d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW1tZXIlMjBmZXN0aXZhbCUyMG91dGRvb3J8ZW58MXx8fHwxNzYxMTQ4Nzg5fDA&ixlib=rb-4.1.0&q=80&w=1080",
        caption: "Die Stimmung war den ganzen Tag über fantastisch"
      },
      { 
        url: "https://images.unsplash.com/photo-1760080839321-a6aa581c3ef3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncm91cCUyMGNlbGVicmF0aW9uJTIwZXZlbnR8ZW58MXx8fHwxNzYxMTUwNjU0fDA&ixlib=rb-4.1.0&q=80&w=1080",
        caption: "Ausklang des Fests bei Sonnenuntergang - ein gelungener Tag geht zu Ende"
      },
    ],
  },
  {
    id: 2,
    titel: "F5J-Wettbewerb 2024",
    datum: "Juli 2024",
    category: "wettbewerb",
    coverImage: "https://images.unsplash.com/photo-1659523851113-04fe948554a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wZXRpdGlvbiUyMHRyb3BoeSUyMHdpbm5lcnxlbnwxfHx8fDE3NjExNzMxOTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    beschreibung: "Spannende Flüge und tolle Leistungen beim diesjährigen F5J-Segelflugwettbewerb.",
    bilder: [
      { 
        url: "https://images.unsplash.com/photo-1659523851113-04fe948554a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wZXRpdGlvbiUyMHRyb3BoeSUyMHdpbm5lcnxlbnwxfHx8fDE3NjExNzMxOTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
        caption: "Die Sieger des F5J-Wettbewerbs 2024 - Glückwunsch an alle Teilnehmer!"
      },
      { 
        url: "https://images.unsplash.com/photo-1642099415153-e5a9692a77f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2RlbCUyMGFpcnBsYW5lJTIwZmx5aW5nfGVufDF8fHx8MTc2MTE3MzE4OHww&ixlib=rb-4.1.0&q=80&w=1080",
        caption: "Präzisionsflug in der Thermik - jede Sekunde zählt beim F5J"
      },
      { 
        url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZW9wbGUlMjB3b3JraW5nJTIwdG9nZXRoZXJ8ZW58MXx8fHwxNzYxMTQ0OTkxfDA&ixlib=rb-4.1.0&q=80&w=1080",
        caption: "Die Jury bei der Auswertung der Flugzeiten"
      },
      { 
        url: "https://images.unsplash.com/photo-1659523851113-04fe948554a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wZXRpdGlvbiUyMHRyb3BoeSUyMHdpbm5lcnxlbnwxfHx8fDE3NjExNzMxOTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
        caption: "Stolze Gewinner mit ihren Pokalen"
      },
    ],
  },
  {
    id: 3,
    titel: "Schnupperfliegen 2024",
    datum: "August 2024",
    category: "event",
    coverImage: "https://images.unsplash.com/photo-1642099415153-e5a9692a77f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2RlbCUyMGFpcnBsYW5lJTIwZmx5aW5nfGVufDF8fHx8MTc2MTE3MzE4OHww&ixlib=rb-4.1.0&q=80&w=1080",
    beschreibung: "Viele neue Gesichter durften den Modellflug ausprobieren und ihre ersten Flugversuche starten.",
    bilder: [
      { 
        url: "https://images.unsplash.com/photo-1642099415153-e5a9692a77f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2RlbCUyMGFpcnBsYW5lJTIwZmx5aW5nfGVufDF8fHx8MTc2MTE3MzE4OHww&ixlib=rb-4.1.0&q=80&w=1080",
        caption: "Der erste Flug - unbezahlbare Momente der Begeisterung"
      },
      { 
        url: "https://images.unsplash.com/photo-1759977064094-840dfc694bee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWRzJTIwbGVhcm5pbmclMjBhY3Rpdml0eXxlbnwxfHx8fDE3NjExNzMxODl8MA&ixlib=rb-4.1.0&q=80&w=1080",
        caption: "Unsere Fluglehrer erklären geduldig die Grundlagen des Modellflugs"
      },
      { 
        url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZW9wbGUlMjB3b3JraW5nJTIwdG9nZXRoZXJ8ZW58MXx8fHwxNzYxMTQ0OTkxfDA&ixlib=rb-4.1.0&q=80&w=1080",
        caption: "Gemeinsam am Sender - mit Unterstützung klappt der erste Flug sicher"
      },
      { 
        url: "https://images.unsplash.com/photo-1642099415153-e5a9692a77f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2RlbCUyMGFpcnBsYW5lJTIwZmx5aW5nfGVufDF8fHx8MTc2MTE3MzE4OHww&ixlib=rb-4.1.0&q=80&w=1080",
        caption: "Perfekte Landung - der Stolz ist riesig nach dem gelungenen Flug"
      },
      { 
        url: "https://images.unsplash.com/photo-1759977064094-840dfc694bee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWRzJTIwbGVhcm5pbmclMjBhY3Rpdml0eXxlbnwxfHx8fDE3NjExNzMxODl8MA&ixlib=rb-4.1.0&q=80&w=1080",
        caption: "Begeisterte Kinder und Jugendliche - viele wollen wiederkommen!"
      },
    ],
  },
  {
    id: 4,
    titel: "Jugendtraining Frühjahr",
    datum: "April 2024",
    category: "jugend",
    coverImage: "https://images.unsplash.com/photo-1759977064094-840dfc694bee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWRzJTIwbGVhcm5pbmclMjBhY3Rpdml0eXxlbnwxfHx8fDE3NjExNzMxODl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    beschreibung: "Unsere Jugendlichen beim Training - vom ersten Steuerknüppel bis zum Soloflug.",
    bilder: [
      { 
        url: "https://images.unsplash.com/photo-1759977064094-840dfc694bee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWRzJTIwbGVhcm5pbmclMjBhY3Rpdml0eXxlbnwxfHx8fDE3NjExNzMxODl8MA&ixlib=rb-4.1.0&q=80&w=1080",
        caption: "Konzentriertes Training - hier wird der Grundstein für sichere Piloten gelegt"
      },
      { 
        url: "https://images.unsplash.com/photo-1642099415153-e5a9692a77f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2RlbCUyMGFpcnBsYW5lJTIwZmx5aW5nfGVufDF8fHx8MTc2MTE3MzE4OHww&ixlib=rb-4.1.0&q=80&w=1080",
        caption: "Selbstständiger Flug unter Aufsicht - ein großer Schritt!"
      },
      { 
        url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZW9wbGUlMjB3b3JraW5nJTIwdG9nZXRoZXJ8ZW58MXx8fHwxNzYxMTQ0OTkxfDA&ixlib=rb-4.1.0&q=80&w=1080",
        caption: "Besprechung nach dem Training - jeder Flug wird analysiert und besprochen"
      },
    ],
  },
  {
    id: 5,
    titel: "Frühjahrsplatzpflege 2024",
    datum: "März 2024",
    category: "platzpflege",
    coverImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZW9wbGUlMjB3b3JraW5nJTIwdG9nZXRoZXJ8ZW58MXx8fHwxNzYxMTQ0OTkxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    beschreibung: "Gemeinsam haben wir unser Gelände fit für die neue Saison gemacht.",
    bilder: [
      { 
        url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZW9wbGUlMjB3b3JraW5nJTIwdG9nZXRoZXJ8ZW58MXx8fHwxNzYxMTQ0OTkxfDA&ixlib=rb-4.1.0&q=80&w=1080",
        caption: "Viele helfende Hände beim Frühjahrsputz - so macht die Arbeit Spaß"
      },
      { 
        url: "https://images.unsplash.com/photo-1760080839321-a6aa581c3ef3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncm91cCUyMGNlbGVicmF0aW9uJTIwZXZlbnR8ZW58MXx8fHwxNzYxMTUwNjU0fDA&ixlib=rb-4.1.0&q=80&w=1080",
        caption: "Wohlverdiente Pause nach getaner Arbeit - das Gelände erstrahlt in neuem Glanz"
      },
      { 
        url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZW9wbGUlMjB3b3JraW5nJTIwdG9nZXRoZXJ8ZW58MXx8fHwxNzYxMTQ0OTkxfDA&ixlib=rb-4.1.0&q=80&w=1080",
        caption: "Gemeinsame Planung der Arbeiten - Teamwork wird bei uns großgeschrieben"
      },
    ],
  },
  {
    id: 6,
    titel: "Jahreshauptversammlung 2024",
    datum: "März 2024",
    category: "sonstiges",
    coverImage: "https://images.unsplash.com/photo-1760080839321-a6aa581c3ef3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncm91cCUyMGNlbGVicmF0aW9uJTIwZXZlbnR8ZW58MXx8fHwxNzYxMTUwNjU0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    beschreibung: "Impressionen von unserer Jahreshauptversammlung mit Rückblick auf ein erfolgreiches Jahr.",
    bilder: [
      { 
        url: "https://images.unsplash.com/photo-1760080839321-a6aa581c3ef3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncm91cCUyMGNlbGVicmF0aW9uJTIwZXZlbnR8ZW58MXx8fHwxNzYxMTUwNjU0fDA&ixlib=rb-4.1.0&q=80&w=1080",
        caption: "Unsere Mitglieder bei der Jahreshauptversammlung - ein Rückblick auf 2024"
      },
      { 
        url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZW9wbGUlMjB3b3JraW5nJTIwdG9nZXRoZXJ8ZW58MXx8fHwxNzYxMTQ0OTkxfDA&ixlib=rb-4.1.0&q=80&w=1080",
        caption: "Diskussion und Ausblick auf das kommende Vereinsjahr"
      },
    ],
  },
];

// Dummy Videos
const videos: VideoItem[] = [
  {
    id: 1,
    titel: "F5J-Wettbewerb 2024 Highlights",
    beschreibung: "Die besten Momente vom diesjährigen F5J-Segelflugwettbewerb in Dingden.",
    thumbnail: "https://images.unsplash.com/photo-1642099415153-e5a9692a77f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2RlbCUyMGFpcnBsYW5lJTIwZmx5aW5nfGVufDF8fHx8MTc2MTE3MzE4OHww&ixlib=rb-4.1.0&q=80&w=1080",
    datum: "Juli 2024",
    category: "Wettbewerb",
  },
  {
    id: 2,
    titel: "Sommerfest 2024 - Flugvorführungen",
    beschreibung: "Spektakuläre Flugvorführungen beim Sommerfest mit verschiedenen Modelltypen.",
    thumbnail: "https://images.unsplash.com/photo-1653047807257-1ebbc26a999d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW1tZXIlMjBmZXN0aXZhbCUyMG91dGRvb3J8ZW58MXx8fHwxNzYxMTQ4Nzg5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    datum: "August 2024",
    category: "Event",
  },
  {
    id: 3,
    titel: "Schnupperfliegen - Erste Flugversuche",
    beschreibung: "Anfänger beim ersten Kontakt mit dem Modellflug und ihre Begeisterung.",
    thumbnail: "https://images.unsplash.com/photo-1759977064094-840dfc694bee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWRzJTIwbGVhcm5pbmclMjBhY3Rpdml0eXxlbnwxfHx8fDE3NjExNzMxODl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    datum: "August 2024",
    category: "Event",
  },
  {
    id: 4,
    titel: "Jugendtraining - Fortschritte unserer Nachwuchspiloten",
    beschreibung: "Einblicke in die Ausbildung unserer jungen Modellflieger.",
    thumbnail: "https://images.unsplash.com/photo-1759977064094-840dfc694bee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWRzJTIwbGVhcm5pbmclMjBhY3Rpdml0eXxlbnwxfHx8fDE3NjExNzMxODl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    datum: "Mai 2024",
    category: "Jugendarbeit",
  },
  {
    id: 5,
    titel: "Kunstflug mit dem Jet-Modell",
    beschreibung: "Beeindruckende Kunstflugmanöver mit einem schnellen Jet-Modell.",
    thumbnail: "https://images.unsplash.com/photo-1642099415153-e5a9692a77f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2RlbCUyMGFpcnBsYW5lJTIwZmx5aW5nfGVufDF8fHx8MTc2MTE3MzE4OHww&ixlib=rb-4.1.0&q=80&w=1080",
    datum: "Juni 2024",
    category: "Flugvorführung",
  },
  {
    id: 6,
    titel: "Vereinsporträt FMSV Dingden",
    beschreibung: "Ein Überblick über unseren Verein, das Gelände und unsere Aktivitäten.",
    thumbnail: "https://images.unsplash.com/photo-1653047807257-1ebbc26a999d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW1tZXIlMjBmZXN0aXZhbCUyMG91dGRvb3J8ZW58MXx8fHwxNzYxMTQ4Nzg5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    datum: "März 2024",
    category: "Vereinsinfo",
  },
];

export function FotoalbenPage() {
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<AlbumCategory | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const filteredAlben = selectedCategory
    ? alben.filter((album) => album.category === selectedCategory)
    : alben;

  // Keyboard navigation
  useEffect(() => {
    if (!isLightboxOpen || !selectedAlbum) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        navigateToPrevious();
      } else if (e.key === "ArrowRight") {
        navigateToNext();
      } else if (e.key === "Escape") {
        closeLightbox();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, currentImageIndex, selectedAlbum]);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const navigateToNext = () => {
    if (selectedAlbum && currentImageIndex < selectedAlbum.bilder.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const navigateToPrevious = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px] overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1642099415153-e5a9692a77f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2RlbCUyMGFpcnBsYW5lJTIwZmx5aW5nfGVufDF8fHx8MTc2MTE3MzE4OHww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Fotoalben und Videos"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl text-white">
              <div className="flex items-center gap-2 mb-3">
                <Camera className="h-6 w-6 text-white/80" />
                <span className="text-white/80 tracking-wider" style={{ fontSize: '0.875rem' }}>
                  GALERIE
                </span>
              </div>
              <h1 className="text-white mb-3">Fotoalben & Videos</h1>
              <p className="text-white/90 mb-2" style={{ fontSize: '1.25rem', fontWeight: '500' }}>
                Erlebe unsere schönsten Momente
              </p>
              <p className="text-white/80" style={{ fontSize: '1rem' }}>
                Von Wettbewerben über Vereinsevents bis zur Jugendarbeit – hier findest du Bilder und Videos von allen wichtigen Ereignissen des FMSV Dingden.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <Tabs defaultValue="fotos" className="w-full">
            <div className="flex justify-center mb-12">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="fotos" className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Fotoalben
                </TabsTrigger>
                <TabsTrigger value="videos" className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Videos
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Fotoalben Tab */}
            <TabsContent value="fotos">
              <div className="max-w-7xl mx-auto">
                {/* Filter */}
                <div className="mb-10">
                  <div className="mb-6">
                    <h2 className="mb-2">Nach Kategorie filtern</h2>
                    <p className="text-muted-foreground">
                      Wähle eine Kategorie, um nur Alben aus diesem Bereich anzuzeigen
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {Object.entries(albumCategories).map(([key, category]) => {
                      const isSelected = selectedCategory === key;
                      const count = alben.filter((a) => a.category === key).length;
                      const Icon = category.icon;

                      return (
                        <button
                          key={key}
                          onClick={() => setSelectedCategory(isSelected ? null : (key as AlbumCategory))}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            isSelected
                              ? category.colorActive + " shadow-lg scale-105"
                              : "bg-card hover:bg-muted/30 border-border hover:border-muted-foreground/20 hover:shadow-md"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <Icon className={`h-5 w-5 ${isSelected ? "text-white" : "text-muted-foreground"}`} />
                            <Badge 
                              variant={isSelected ? "secondary" : "outline"} 
                              className={`h-6 px-2 ${isSelected ? "bg-white/20 text-white border-white/30" : ""}`}
                            >
                              {count}
                            </Badge>
                          </div>
                          <div className={`font-medium mb-1 ${isSelected ? "text-white" : ""}`}>
                            {category.label}
                          </div>
                          <p className={`text-xs ${isSelected ? "text-white/80" : "text-muted-foreground"}`}>
                            {category.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {selectedCategory && (
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className="text-primary hover:underline inline-flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        <span>Filter zurücksetzen - Alle {alben.length} Alben anzeigen</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Alben Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAlben.map((album) => {
                    const category = albumCategories[album.category];
                    return (
                      <Card
                        key={album.id}
                        className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all"
                        onClick={() => setSelectedAlbum(album)}
                      >
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <ImageWithFallback
                            src={album.coverImage}
                            alt={album.titel}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                          <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full backdrop-blur-sm border ${category.color}`}>
                            <div className="flex items-center gap-1.5">
                              {(() => {
                                const Icon = category.icon;
                                return <Icon className="h-3.5 w-3.5" />;
                              })()}
                              <span className="text-xs font-medium">{category.label}</span>
                            </div>
                          </div>
                          <div className="absolute bottom-3 left-3 right-3 text-white">
                            <div className="flex items-center gap-2 text-sm mb-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-md w-fit">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{album.datum}</span>
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="mb-2">{album.titel}</h3>
                          <p className="text-muted-foreground text-sm mb-3">{album.beschreibung}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <ImageIcon className="h-4 w-4" />
                            <span>{album.bilder.length} {album.bilder.length === 1 ? 'Bild' : 'Bilder'}</span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            {/* Videos Tab */}
            <TabsContent value="videos">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map((video) => (
                    <Card
                      key={video.id}
                      className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all"
                    >
                      <div className="relative aspect-video overflow-hidden">
                        <ImageWithFallback
                          src={video.thumbnail}
                          alt={video.titel}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="h-16 w-16 rounded-full bg-white/90 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <Play className="h-8 w-8 ml-1" />
                          </div>
                        </div>
                        <Badge className="absolute top-3 right-3 bg-black/70 text-white border-0">
                          {video.category}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="mb-2">{video.titel}</h3>
                        <p className="text-muted-foreground text-sm mb-3">{video.beschreibung}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{video.datum}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Platzhalter für weitere Videos */}
                <Card className="mt-12 bg-muted/30">
                  <CardContent className="p-8 text-center">
                    <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="mb-2">Mehr Videos auf unserem YouTube-Kanal</h3>
                    <p className="text-muted-foreground mb-4">
                      Weitere Videos und Flugaufnahmen findest du auf unserem YouTube-Kanal.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Link zum Kanal wird in Kürze hinzugefügt.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Album Detail Modal */}
      {selectedAlbum && !isLightboxOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedAlbum(null)}>
          <div className="bg-background rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="p-6 border-b">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="mb-2">{selectedAlbum.titel}</h2>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      {selectedAlbum.datum}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="h-4 w-4" />
                      {selectedAlbum.bilder.length} {selectedAlbum.bilder.length === 1 ? 'Bild' : 'Bilder'}
                    </span>
                    <div className={`px-3 py-1.5 rounded-full border inline-flex items-center gap-1.5 ${albumCategories[selectedAlbum.category].color}`}>
                      {(() => {
                        const Icon = albumCategories[selectedAlbum.category].icon;
                        return <Icon className="h-3.5 w-3.5" />;
                      })()}
                      <span className="text-xs font-medium">{albumCategories[selectedAlbum.category].label}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAlbum(null)}
                  className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-muted-foreground mt-4">{selectedAlbum.beschreibung}</p>
            </div>

            {/* Bilder Grid */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <Masonry columnsCount={3} gutter="12px">
                {selectedAlbum.bilder.map((bild, index) => (
                  <div
                    key={index}
                    className="cursor-pointer group relative overflow-hidden rounded-lg"
                    onClick={() => openLightbox(index)}
                  >
                    <ImageWithFallback
                      src={bild.url}
                      alt={bild.caption || `${selectedAlbum.titel} - Bild ${index + 1}`}
                      className="w-full h-auto group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      {bild.caption && (
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-white text-sm">{bild.caption}</p>
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-3">
                        <ImageIcon className="h-6 w-6 text-black" />
                      </div>
                    </div>
                  </div>
                ))}
              </Masonry>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox */}
      {isLightboxOpen && selectedAlbum && (
        <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Schließen"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm">
            {currentImageIndex + 1} / {selectedAlbum.bilder.length}
          </div>

          {/* Image Caption */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-6 py-4 rounded-2xl bg-black/60 backdrop-blur-md text-white max-w-3xl w-[90%] text-center">
            {selectedAlbum.bilder[currentImageIndex].caption ? (
              <>
                <p className="text-sm text-white/70 mb-1">{selectedAlbum.titel}</p>
                <p className="text-base">{selectedAlbum.bilder[currentImageIndex].caption}</p>
              </>
            ) : (
              <p className="text-sm">{selectedAlbum.titel}</p>
            )}
          </div>

          {/* Previous Button */}
          {currentImageIndex > 0 && (
            <button
              onClick={navigateToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-16 w-16 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              aria-label="Vorheriges Bild"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
          )}

          {/* Next Button */}
          {currentImageIndex < selectedAlbum.bilder.length - 1 && (
            <button
              onClick={navigateToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-16 w-16 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              aria-label="Nächstes Bild"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          )}

          {/* Main Image */}
          <div className="w-full h-full flex items-center justify-center p-16">
            <ImageWithFallback
              src={selectedAlbum.bilder[currentImageIndex].url}
              alt={selectedAlbum.bilder[currentImageIndex].caption || `${selectedAlbum.titel} - Bild ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
