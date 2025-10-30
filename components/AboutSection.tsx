import { Card, CardContent } from "./ui/card";
import { Plane, Users, Calendar, MapPin } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function AboutSection() {
  const facts = [
    {
      icon: Calendar,
      label: "Gegründet",
      value: "1978",
    },
    {
      icon: MapPin,
      label: "Standort",
      value: "Dingden",
    },
  ];

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-8 lg:gap-12 lg:grid-cols-2 items-center">
          {/* Text Content */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary">
                <Plane className="h-4 w-4" />
                <span className="text-sm">Über uns</span>
              </div>
              <h2>Flugmodellsportverein Dingden</h2>
              <p className="text-muted-foreground">
                Seit 1978 besteht der Flugmodellsportverein Dingden. Ziel des Vereins ist die 
                Ausübung des Modellflieger-Hobbies in angenehmer Umgebung im Einklang mit der Natur, 
                den Mitmenschen und den gesetzlichen Vorgaben.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-muted-foreground">
                Geflogen wird bei uns hauptsächlich am Wochenende, je nach Wetter und Jahreszeit 
                bis zur Abenddämmerung. Aber auch an anderen Wochentagen trifft man sich "am Platz". 
                Schnell nach Feierabend noch eine Runde drehen oder vom feiertäglichen Kaffeetisch 
                flüchten, den Flieger ins Auto packen und ab in die Natur.
              </p>
              
              <p className="text-muted-foreground">
                Angenehm ist es auch, mit den Vereinskollegen zu fachsimpeln oder einfach nur die 
                freie Natur zu genießen...
              </p>
            </div>

            {/* Facts Grid */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              {facts.map((fact, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-lg bg-background/60 border border-border/50"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 flex-shrink-0">
                    <fact.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{fact.label}</p>
                    <p className="font-medium">{fact.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1695806109473-c90b86f6a9d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2RlbCUyMGFpcnBsYW5lJTIwYWlyZmllbGR8ZW58MXx8fHwxNzYxMTY3NDEyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Flugmodellsportverein Dingden Flugplatz"
                className="w-full h-full object-cover aspect-[4/3]"
              />
              {/* Overlay Badge */}
              <div className="absolute bottom-6 left-6 right-6">
                <Card className="bg-background/95 backdrop-blur-sm border-border/50">
                  <CardContent className="p-4">
                    <p className="text-sm">
                      <span className="font-medium">Unser Motto:</span> Gemeinsam fliegen, gemeinsam wachsen
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
