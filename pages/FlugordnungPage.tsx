import { Shield, AlertTriangle, Info } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";

export function FlugordnungPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="mb-4">Flugordnung</h1>
            <p className="text-muted-foreground" style={{ fontSize: '1.125rem' }}>
              Unsere Flugordnung dient der Sicherheit aller Piloten und Besucher. 
              Bitte lies dir diese Regeln aufmerksam durch und halte dich stets daran.
            </p>
          </div>

          <div className="space-y-8">
            {/* Allgemeine Bestimmungen */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <Shield className="h-6 w-6 text-primary" />
                <h2>Allgemeine Bestimmungen</h2>
              </div>
              
              <Card>
                <CardContent className="pt-6">
                  <ol className="space-y-4 list-decimal list-inside">
                    <li>
                      <span className="ml-2">
                        Der Flugbetrieb ist nur zu den vom Verein festgelegten Zeiten gestattet. 
                        Die aktuellen Flugzeiten werden durch Aushang am Vereinsheim bekannt gegeben.
                      </span>
                    </li>
                    <li>
                      <span className="ml-2">
                        Jeder Pilot muss im Besitz einer gültigen Haftpflichtversicherung für 
                        Modellflug sein. Der Versicherungsnachweis ist auf Verlangen vorzuzeigen.
                      </span>
                    </li>
                    <li>
                      <span className="ml-2">
                        Für Modelle über 2 kg Startgewicht oder mit Verbrennungsmotor ist ein 
                        Kenntnisnachweis gemäß aktueller Luftverkehrsordnung erforderlich.
                      </span>
                    </li>
                    <li>
                      <span className="ml-2">
                        Alle Piloten müssen sich vor dem ersten Flug beim Flugleiter melden.
                      </span>
                    </li>
                    <li>
                      <span className="ml-2">
                        Die Anweisungen des Flugleiters sind unbedingt zu befolgen.
                      </span>
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </section>

            {/* Flugbetrieb */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="h-6 w-6 text-primary" />
                <h2>Durchführung des Flugbetriebs</h2>
              </div>
              
              <Card>
                <CardContent className="pt-6">
                  <ol className="space-y-4 list-decimal list-inside" start={6}>
                    <li>
                      <span className="ml-2">
                        Starts und Landungen sind nur in der ausgewiesenen Flugrichtung durchzuführen.
                      </span>
                    </li>
                    <li>
                      <span className="ml-2">
                        Der Sicherheitsabstand zu Personen muss mindestens 30 Meter betragen.
                      </span>
                    </li>
                    <li>
                      <span className="ml-2">
                        Überflüge über Personen, Fahrzeuge und das Vereinsheim sind verboten.
                      </span>
                    </li>
                    <li>
                      <span className="ml-2">
                        Die maximale Flughöhe von 300 Metern über Grund darf nicht überschritten werden.
                      </span>
                    </li>
                    <li>
                      <span className="ml-2">
                        Flüge außerhalb des Sichtbereichs (FPV ohne Spotter) sind untersagt.
                      </span>
                    </li>
                    <li>
                      <span className="ml-2">
                        Bei gleichzeitigem Flugbetrieb mehrerer Modelle ist besondere Vorsicht geboten. 
                        Abstimmung unter den Piloten ist Pflicht.
                      </span>
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </section>

            {/* Lärmschutz */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <Info className="h-6 w-6 text-primary" />
                <h2>Lärmschutz und Rücksichtnahme</h2>
              </div>
              
              <Card>
                <CardContent className="pt-6">
                  <ol className="space-y-4 list-decimal list-inside" start={12}>
                    <li>
                      <span className="ml-2">
                        Alle Modelle müssen den geltenden Lärmschutzbestimmungen entsprechen.
                      </span>
                    </li>
                    <li>
                      <span className="ml-2">
                        Schalldämpfer an Verbrennungsmotoren sind Pflicht und müssen wirksam sein.
                      </span>
                    </li>
                    <li>
                      <span className="ml-2">
                        Besondere Rücksicht auf Anwohner ist zu nehmen. Unnötiger Lärm ist zu vermeiden.
                      </span>
                    </li>
                    <li>
                      <span className="ml-2">
                        Warmlaufen der Motoren ist nur am dafür vorgesehenen Platz gestattet.
                      </span>
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </section>

            {/* Frequenzen */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <Shield className="h-6 w-6 text-primary" />
                <h2>Frequenzverwaltung</h2>
              </div>
              
              <Card>
                <CardContent className="pt-6">
                  <ol className="space-y-4 list-decimal list-inside" start={16}>
                    <li>
                      <span className="ml-2">
                        Die Verwendung von 2,4-GHz-Fernsteueranlagen wird ausdrücklich empfohlen.
                      </span>
                    </li>
                    <li>
                      <span className="ml-2">
                        Bei Verwendung von 35-MHz-Anlagen ist die Frequenztafel zu nutzen. 
                        Vor Inbetriebnahme ist die Frequenztafel zu belegen.
                      </span>
                    </li>
                    <li>
                      <span className="ml-2">
                        Sendetests sind nur mit eingesteckter Antenne und nach Absprache mit 
                        anderen Piloten durchzuführen.
                      </span>
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </section>

            {/* Sicherheit */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="h-6 w-6 text-primary" />
                <h2>Sicherheitsbestimmungen</h2>
              </div>
              
              <Card>
                <CardContent className="pt-6">
                  <ol className="space-y-4 list-decimal list-inside" start={19}>
                    <li>
                      <span className="ml-2">
                        Modelle sind nur in technisch einwandfreiem Zustand zu betreiben.
                      </span>
                    </li>
                    <li>
                      <span className="ml-2">
                        Vor jedem Start ist ein Funktionstest durchzuführen (Ruderausschläge, 
                        Motorlauf, Reichweitentest).
                      </span>
                    </li>
                    <li>
                      <span className="ml-2">
                        Bei technischen Problemen im Flug ist sofort zu landen bzw. ein 
                        kontrollierter Absturz einzuleiten.
                      </span>
                    </li>
                    <li>
                      <span className="ml-2">
                        Akkus und Treibstoffe sind sicher zu lagern und außerhalb des 
                        Vereinsheims zu laden/zu tanken.
                      </span>
                    </li>
                    <li>
                      <span className="ml-2">
                        Minderjährige dürfen nur unter Aufsicht eines erfahrenen Piloten fliegen.
                      </span>
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </section>

            {/* Haftung */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <Info className="h-6 w-6 text-primary" />
                <h2>Haftung und Ordnungswidrigkeiten</h2>
              </div>
              
              <Card>
                <CardContent className="pt-6">
                  <ol className="space-y-4 list-decimal list-inside" start={24}>
                    <li>
                      <span className="ml-2">
                        Jeder Pilot ist für sein Handeln selbst verantwortlich. Der Verein 
                        übernimmt keine Haftung für Personen- oder Sachschäden.
                      </span>
                    </li>
                    <li>
                      <span className="ml-2">
                        Verstöße gegen die Flugordnung können zum Ausschluss vom Flugbetrieb führen.
                      </span>
                    </li>
                    <li>
                      <span className="ml-2">
                        Bei groben oder wiederholten Verstößen behält sich der Vorstand weitere 
                        Maßnahmen vor.
                      </span>
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </section>

            {/* Schlussbestimmungen */}
            <section>
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <h3 className="mb-4">Schlussbestimmungen</h3>
                  <p className="text-muted-foreground mb-4">
                    Diese Flugordnung wurde vom Vorstand des FMSV Dingden beschlossen und tritt 
                    mit sofortiger Wirkung in Kraft. Änderungen bleiben vorbehalten und werden 
                    durch Aushang am Vereinsheim bekannt gegeben.
                  </p>
                  <p className="text-muted-foreground">
                    Mit der Nutzung unseres Fluggeländes erkennst du diese Flugordnung an und 
                    verpflichtest dich, sie einzuhalten.
                  </p>
                </CardContent>
              </Card>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
