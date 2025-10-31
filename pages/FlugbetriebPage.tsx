import { MapPin, Shield, Users, Wind, Info, ArrowRight, Plane, Building2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Link } from "react-router-dom";

export function FlugbetriebPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px] overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1615678988660-dd59c44969f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYyUyMHBsYW5lJTIwZmx5aW5nJTIwZmllbGR8ZW58MXx8fHwxNzYxMTY5NDcwfDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Fluggelände FMSV Dingden"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl text-white">
              <h1 className="text-white mb-4">Unser Fluggelände</h1>
              <p className="text-white/90" style={{ fontSize: '1.125rem' }}>
                Herzlich willkommen auf unserem wunderschönen Modellfluggelände in Dingden. 
                Hier findest du alle wichtigen Informationen rund um den Flugbetrieb 
                und die Regeln für ein sicheres Miteinander.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto space-y-24 md:space-y-32">
            
            {/* ============================================ */}
            {/* HAUPTABTEILUNG 1: DER FLUGPLATZ */}
            {/* ============================================ */}
            <section>
              <div className="text-center mb-12 md:mb-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                  <Plane className="h-8 w-8 text-primary" />
                </div>
                <h1 className="mb-4">Der Flugplatz</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto" style={{ fontSize: '1.125rem' }}>
                  Unser Modellfluggelände in Dingden bietet ideale Bedingungen für alle 
                  Flugkategorien – von Seglern bis hin zu Scale-Modellen.
                </p>
              </div>

              <div className="space-y-16">
                {/* Lage & Anfahrt */}
                <div>
                  <div className="flex items-center gap-3 mb-8">
                    <MapPin className="h-8 w-8 text-primary" />
                    <div>
                      <h2 className="mb-1">Lage & Anfahrt</h2>
                      <p className="text-muted-foreground">So findest du zu uns</p>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Adresse</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <div className="text-muted-foreground mb-1">Modellfluggelände</div>
                            <div>Langenhoffsweg</div>
                            <div>46499 Hamminkeln</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground mb-1">GPS-Koordinaten</div>
                            <div className="font-mono" style={{ fontSize: '0.875rem' }}>
                              51.761509, 6.676708
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Anfahrt</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p>
                            Unser Modellflugplatz befindet sich im Bereich von Hamminkeln Dingden 
                            im Kreis Wesel. Er liegt am südlichen Rand der Dingdener Heide und 
                            westlich der Bauernschaft Nordbrock.
                          </p>
                          <p>
                            Die Zufahrt führt über einen kleinen Schotterweg mit dem Straßenschild 
                            "Zur Hohen Heide".
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="h-[400px] rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                      <ImageWithFallback
                        src="https://images.unsplash.com/photo-1695806109473-c90b86f6a9d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2RlbCUyMGFpcnBsYW5lJTIwYWlyZmllbGR8ZW58MXx8fHwxNzYxMTY3NDEyfDA&ixlib=rb-4.1.0&q=80&w=1080"
                        alt="Luftaufnahme Fluggelände"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Ausstattung & Besonderheiten */}
                <div>
                  <div className="flex items-center gap-3 mb-8">
                    <Wind className="h-8 w-8 text-primary" />
                    <div>
                      <h2 className="mb-1">Ausstattung & Besonderheiten</h2>
                      <p className="text-muted-foreground">Was unser Fluggelände auszeichnet</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-2">
                          <h4>Gepflegte Rasenbahn</h4>
                          <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                            Unsere Start- und Landebahn wird regelmäßig gemäht und ist 
                            ideal für Scale-Modelle und Segler.
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-2">
                          <h4>Vereinsheim</h4>
                          <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                            Gemütliches Clubhaus mit Werkstatt und Aufenthaltsraum 
                            für geselliges Beisammensein.
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-2">
                          <h4>Windverhältnisse</h4>
                          <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                            Unser Gelände ist in alle Himmelsrichtungen gut zu verwenden, 
                            ausgenommen ist der Nordwind aufgrund einer Baumreihe im Rücken.
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-2">
                          <h4>Lademöglichkeiten</h4>
                          <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                            Stromanschlüsse für Akkulader und elektrische Geräte 
                            im Vereinsheim.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </section>

            {/* ============================================ */}
            {/* HAUPTABTEILUNG 2: GASTFLIEGER */}
            {/* ============================================ */}
            <section>
              <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent mb-12 md:mb-16" />
              
              <div className="text-center mb-12 md:mb-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h1 className="mb-4">Gastflieger</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto" style={{ fontSize: '1.125rem' }}>
                  Besucher sind bei uns herzlich willkommen! Hier findest du alle wichtigen Informationen 
                  für einen Gastflug auf unserem Gelände.
                </p>
              </div>

              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Voraussetzungen</CardTitle>
                      <CardDescription>Was du als Gastflieger mitbringen musst</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex gap-3 items-start">
                        <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 mt-0.5" style={{ fontSize: '0.75rem' }}>
                          1
                        </div>
                        <div>
                          <div>Gültiger Versicherungsnachweis</div>
                          <div className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                            Haftpflichtversicherung für Modellflug
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 items-start">
                        <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 mt-0.5" style={{ fontSize: '0.75rem' }}>
                          2
                        </div>
                        <div>
                          <div>Kenntnisnachweis (falls erforderlich)</div>
                          <div className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                            Bei Modellen über 2 kg oder bestimmten Antriebsarten
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 items-start">
                        <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 mt-0.5" style={{ fontSize: '0.75rem' }}>
                          3
                        </div>
                        <div>
                          <div>Anmeldung beim Flugleiter</div>
                          <div className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                            Kurze Vorstellung vor dem ersten Flug
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Gastfliegergebühr</CardTitle>
                      <CardDescription>Faire Preise für Besucher</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-baseline gap-2">
                        <div style={{ fontSize: '2rem', fontWeight: 500 }}>10€</div>
                        <div className="text-muted-foreground">pro Tag</div>
                      </div>
                      <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                        Die Gastfliegergebühr wird vor Ort entrichtet und hilft uns, 
                        das Gelände in einem Top-Zustand zu halten.
                      </p>
                      <div className="pt-4 border-t">
                        <div className="text-muted-foreground mb-2">Ansprechpartner</div>
                        <div>Bei Fragen wende dich gerne an unsere Flugleiter vor Ort 
                        oder kontaktiere uns vorab per E-Mail.</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            {/* ============================================ */}
            {/* HAUPTABTEILUNG 3: FLUGBETRIEB & REGELN */}
            {/* ============================================ */}
            <section>
              <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent mb-12 md:mb-16" />
              
              <div className="text-center mb-12 md:mb-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h1 className="mb-4">Flugbetrieb & Regeln</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto" style={{ fontSize: '1.125rem' }}>
                  Die Sicherheit aller Piloten, Besucher und Anwohner steht bei uns an erster Stelle. 
                  Deshalb haben wir klare Regeln für den Flugbetrieb.
                </p>
              </div>

              <div className="space-y-8">
                <Card>
                  <CardContent className="pt-6 space-y-6">
                    <div>
                      <h3 className="mb-4">Unsere Flugordnung</h3>
                      <p>
                        Wir haben eine detaillierte Flugordnung erstellt, die verbindliche Regeln 
                        für den Flugbetrieb auf unserem Gelände festlegt. Diese basiert auf den 
                        gesetzlichen Vorgaben und wurde an unsere örtlichen Gegebenheiten angepasst.
                      </p>
                    </div>
                    
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="text-muted-foreground mb-1" style={{ fontSize: '0.875rem' }}>
                          Wichtig
                        </div>
                        <div>Versicherungsnachweis erforderlich</div>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="text-muted-foreground mb-1" style={{ fontSize: '0.875rem' }}>
                          Pflicht
                        </div>
                        <div>Kenntnisnachweis beachten</div>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="text-muted-foreground mb-1" style={{ fontSize: '0.875rem' }}>
                          Rücksicht
                        </div>
                        <div>Lärmschutz einhalten</div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t">
                      <p className="text-muted-foreground">
                        Die vollständige Flugordnung mit allen Details findest du auf einer separaten Seite.
                      </p>
                      <Button asChild className="shrink-0">
                        <Link to="/flugordnung" className="gap-2">
                          Zur Flugordnung
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* ============================================ */}
            {/* HAUPTABTEILUNG 4: SONSTIGES */}
            {/* ============================================ */}
            <section>
              <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent mb-12 md:mb-16" />
              
              <div className="text-center mb-12 md:mb-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <h1 className="mb-4">Sonstiges</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto" style={{ fontSize: '1.125rem' }}>
                  Unser Fluggelände steht auch Unternehmen und Organisationen zur Verfügung – 
                  für professionelle Drohnenschulungen.
                </p>
              </div>

              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Gelände für Drohnenschulungen</CardTitle>
                    <CardDescription>
                      Unser Flugplatz steht für professionelle Schulungen zur Verfügung
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p>
                      Wir stellen unser Fluggelände mit entsprechender Infrastruktur gerne Unternehmen 
                      und sonstigen Organisationen zur Verfügung, die dort Drohnenschulungen durchführen möchten. 
                      Zusätzlich stehen wir gerne mit unserer Fachexpertise unterstützend zur Seite.
                    </p>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="text-muted-foreground mb-2" style={{ fontSize: '0.875rem' }}>
                        Aktuelle Nutzer
                      </div>
                      <p>
                        Derzeit wird das Angebot unter anderem von der Firma <strong>Westnetz</strong> sowie 
                        <strong> Max Bögl</strong> genutzt.
                      </p>
                    </div>

                    <div className="border-l-4 border-primary pl-4 py-2">
                      <h4 className="mb-2">Warum uns professionelle Schulung wichtig ist</h4>
                      <p className="text-muted-foreground">
                        Uns ist wichtig, dass alle Drohnenpiloten fundiert geschult ihren Dienst verrichten können. 
                        Eine essenzielle Ausbildung ist nötig, um Sicherheit zu gewährleisten und das notwendige 
                        Verständnis für die Regularien zu schaffen. Leider haben Fehlverhalten und mangelnde 
                        Kenntnisse einzelner Piloten in der Vergangenheit zu Vorfällen geführt, die übertriebene 
                        und überregulierende Gesetzesinitiativen nach sich gezogen haben, unter denen insbesondere 
                        wir Modellflieger unverhältnismäßig stark zu leiden haben.
                      </p>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="mb-3">Vorteile unseres Geländes für Schulungen</h4>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="flex gap-3">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          </div>
                          <div>
                            <div>Offenes, weitläufiges Gelände</div>
                            <div className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                              Ausreichend Platz für Flugmanöver
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          </div>
                          <div>
                            <div>Infrastruktur vorhanden</div>
                            <div className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                              Vereinsheim, Strom, Parkplätze
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          </div>
                          <div>
                            <div>Erfahrene Modellflieger vor Ort</div>
                            <div className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                              Langjährige Luftfahrt-Expertise
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          </div>
                          <div>
                            <div>Günstige Lage im Kreis Wesel</div>
                            <div className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                              Gut erreichbar für Unternehmen
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t bg-muted/30 -mx-6 px-6 -mb-6 pb-6 rounded-b-lg">
                      <h4 className="mb-2">Interesse an unserem Gelände?</h4>
                      <p className="text-muted-foreground mb-4">
                        Wenn Sie unser Fluggelände für Drohnenschulungen nutzen möchten, 
                        kontaktieren Sie uns gerne. Wir unterstützen Sie auch gerne mit unserer 
                        langjährigen Erfahrung im Modellflug.
                      </p>
                      <Button asChild>
                        <a href="mailto:info@fmsv-dingden.de" className="gap-2">
                          Kontakt aufnehmen
                          <ArrowRight className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
