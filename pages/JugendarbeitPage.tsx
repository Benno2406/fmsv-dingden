import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import {
  Plane,
  Users,
  Trophy,
  GraduationCap,
  Calendar,
  Clock,
  CheckCircle,
  Heart,
  Target,
  Rocket,
  Shield,
  Sparkles,
  MessageCircle,
  Mail,
  Phone,
} from "lucide-react";

export function JugendarbeitPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1596496356933-9b6e0b186b88?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWVuYWdlciUyMGxlYXJuaW5nJTIwd29ya3Nob3B8ZW58MXx8fHwxNzYxMTc0ODA4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Jugendarbeit beim FMSV Dingden"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center text-white">
          <Badge className="mb-4 bg-white/20 text-white border-white/30 backdrop-blur-sm">
            Nachwuchsförderung
          </Badge>
          <h1 className="text-white mb-4 text-4xl md:text-5xl lg:text-6xl">
            Jugendarbeit
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
            Deine Reise in die faszinierende Welt des Modellflugs beginnt hier
          </p>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="mb-6 text-center">Du willst selbst ein Flugmodell fliegen?</h2>
            
            <div className="space-y-6 text-lg text-muted-foreground">
              <p>
                Perfekt – dann bist du beim Flugmodellsportverein Dingden e.V. genau richtig! 
                Wir heißen jeden Interessierten herzlich willkommen und unterstützen dich gerne 
                beim Einstieg in dieses faszinierende Hobby. Du hast noch kein eigenes Modell? 
                Kein Problem! Für deine ersten Flugversuche stellen wir dir ein vereinseigenes 
                Flugmodell zur Verfügung. So kannst du in Ruhe herausfinden, ob der Modellflug 
                das richtige Hobby für dich ist.
              </p>
              
              <p>
                Der Anfang mag zunächst herausfordernd erscheinen, aber mit der richtigen 
                Unterstützung gelingt der Einstieg heute leichter denn je. Bei uns erwarten 
                dich erfahrene Piloten, die ihr Wissen gerne weitergeben, sowie moderne 
                Funksteuerungen mit Lehrer-Schüler-System. Damit ist sichergestellt, dass 
                dein Fluglehrer jederzeit eingreifen kann. Mit ein wenig Übung und Durchhaltevermögen 
                wirst du schnell Fortschritte machen und bald deine ersten eigenen Flüge meistern.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Button size="lg" className="gap-2">
                <Calendar className="h-5 w-5" />
                Schnuppertermin vereinbaren
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Warum Modellflug Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <Badge className="mb-4">Deine Vorteile</Badge>
            <h2 className="mb-4">Warum Modellflug?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Modellflug ist mehr als nur ein Hobby – es ist eine Leidenschaft, die
              dich fürs Leben prägt
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2">Lernen & Entwicklung</h3>
                <p className="text-muted-foreground">
                  Erweitere dein technisches Wissen und lerne die Grundlagen der
                  Aerodynamik, Elektronik und Mechanik kennen.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2">Gemeinschaft</h3>
                <p className="text-muted-foreground">
                  Finde Freunde mit gleichen Interessen und werde Teil einer
                  tollen Gruppe, die zusammenhält.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2">Erfolge feiern</h3>
                <p className="text-muted-foreground">
                  Vom ersten Flug bis zur Teilnahme an Wettbewerben – erlebe
                  unvergessliche Erfolgserlebnisse.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2">Konzentration & Fokus</h3>
                <p className="text-muted-foreground">
                  Trainiere deine Konzentrationsfähigkeit und Hand-Augen-Koordination
                  beim präzisen Steuern der Modelle.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2">Sicherheit</h3>
                <p className="text-muted-foreground">
                  Lerne von Anfang an die wichtigen Sicherheitsregeln und fliege
                  unter professioneller Aufsicht erfahrener Fluglehrer.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2">Abenteuer & Spaß</h3>
                <p className="text-muted-foreground">
                  Erlebe die Faszination des Fliegens und genieße spannende
                  Stunden an der frischen Luft auf unserem Fluggelände.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Wie läuft es ab Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4">Dein Weg zum Piloten</Badge>
                <h2 className="mb-6">Wie läuft die Ausbildung ab?</h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Wir begleiten dich Schritt für Schritt auf deinem Weg zum
                  eigenständigen Modellpiloten. Unsere erfahrenen Fluglehrer nehmen
                  sich Zeit für dich und passen das Training an dein Tempo an.
                </p>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      1
                    </div>
                    <div>
                      <h4 className="mb-2">Schnuppern & Kennenlernen</h4>
                      <p className="text-muted-foreground">
                        Komm zu einem unserer Schnuppertage und probiere das Fliegen
                        mit einem Lehrer-Schüler-System aus. So bekommst du ein
                        Gefühl für die Steuerung. Entsprechende Termine können auch
                        individuell abgesprochen werden.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      2
                    </div>
                    <div>
                      <h4 className="mb-2">Theorie & Praxis</h4>
                      <p className="text-muted-foreground">
                        Lerne die theoretischen Grundlagen: Aerodynamik und
                        Flugregeln. Parallel dazu übst du mit Trainingsmodellen.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      3
                    </div>
                    <div>
                      <h4 className="mb-2">Erste eigene Flüge</h4>
                      <p className="text-muted-foreground">
                        Unter Aufsicht deines Fluglehrers machst du deine ersten
                        selbstständigen Flüge und lernst Start, Landung und
                        verschiedene Flugmanöver.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      4
                    </div>
                    <div>
                      <h4 className="mb-2">Eigenständiges Fliegen</h4>
                      <p className="text-muted-foreground">
                        Gemeinsam mit deinem Fluglehrer wird entschieden, wann du soweit bist
                        eigenständig zu fliegen. Dies ist ein schleichender Übergang, bei dem
                        du nach und nach mehr Verantwortung übernimmst und dich in verschiedenen
                        Disziplinen weiterentwickeln kannst.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1630406144797-821be1f35d75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbnN0cnVjdG9yJTIwdGVhY2hpbmclMjBzdHVkZW50fGVufDF8fHx8MTc2MTE3NDgwOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Ausbildung zum Modellpiloten"
                  className="rounded-2xl shadow-2xl w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Training & Zeiten Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4">Training</Badge>
              <h2 className="mb-4">Wann findet das Training statt?</h2>
              <p className="text-lg text-muted-foreground">
                Wir trainieren flexibel und passen uns an die Wetterlage und deine Verfügbarkeit an
              </p>
            </div>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Heart className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="mb-2">Flexibles Training</h3>
                    <p className="text-muted-foreground">
                      Wir haben keine festen Trainingszeiten. Wir wissen, dass Schule,
                      Hausaufgaben und andere Hobbys auch wichtig sind. Die Termine
                      werden individuell nach Verfügbarkeit und Wetterlage abgesprochen.
                      Bei Interesse empfehlen wir, vorher kurz anzurufen oder eine
                      Nachricht zu schreiben, um einen passenden Termin zu vereinbaren.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Was du brauchst Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4">Ausrüstung</Badge>
              <h2 className="mb-4">Was brauchst du zum Start?</h2>
              <p className="text-lg text-muted-foreground">
                Keine Sorge – für den Anfang brauchst du fast nichts!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-green-500/10 w-10 h-10 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="text-green-600">Für den Anfang</h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Gute Laune und Interesse am Modellflug</span>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Wetterfeste Kleidung für draußen</span>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Sonnenschutz (Kappe, Sonnencreme)</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center">
                      <Plane className="h-5 w-5 text-primary" />
                    </div>
                    <h3>Wird vom Verein gestellt</h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>Trainingsmodelle und Schulungsflugzeuge</span>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>Fernsteuerungen mit Lehrer-Schüler-System</span>
                    </li>
                    <li className="flex gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>Werkzeug und Material für Reparaturen</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <h4 className="mb-3 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  Später - wenn du dabei bleibst
                </h4>
                <p className="text-muted-foreground mb-4">
                  Wenn du merkst, dass Modellflug dein Hobby wird, kannst du dir
                  nach und nach deine eigene Ausrüstung zulegen. Wir beraten dich
                  gerne bei der Auswahl deines ersten eigenen Modells und der
                  passenden Fernsteuerung. Viele Mitglieder haben auch gebrauchte
                  Ausrüstung zu fairen Preisen abzugeben.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Kosten Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4">Beiträge</Badge>
            <h2 className="mb-6">Was kostet die Mitgliedschaft?</h2>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="text-left">
                <CardContent className="pt-6">
                  <h3 className="mb-4">Kinder bis 16 Jahre</h3>
                  <div className="text-4xl mb-2">72€</div>
                  <p className="text-muted-foreground mb-4">pro Jahr (gesamt)</p>
                  
                  <div className="mb-4 p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Jahresbeitrag</span>
                      <span>10€</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Platzpflegegebühr</span>
                      <span>50€</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">DMFV-Mitgliedschaft + Versicherung</span>
                      <span>12€</span>
                    </div>
                  </div>

                  <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-900">Einmalige Aufnahmegebühr</span>
                      <span className="text-blue-900">12€</span>
                    </div>
                  </div>

                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Nutzung aller Trainingsmodelle</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Betreuung durch unseren Jugendwart</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="text-left">
                <CardContent className="pt-6">
                  <h3 className="mb-4">Jugendliche von 16-18 Jahre</h3>
                  <div className="text-4xl mb-2">102€</div>
                  <p className="text-muted-foreground mb-4">pro Jahr (gesamt)</p>
                  
                  <div className="mb-4 p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Jahresbeitrag</span>
                      <span>40€</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Platzpflegegebühr</span>
                      <span>50€</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">DMFV-Mitgliedschaft + Versicherung</span>
                      <span>12€</span>
                    </div>
                  </div>

                  <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-900">Einmalige Aufnahmegebühr</span>
                      <span className="text-blue-900">30€</span>
                    </div>
                  </div>

                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Nutzung aller Trainingsmodelle</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Betreuung durch unseren Jugendwart</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="mb-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-green-500 p-2 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-green-900 mb-1">Platzpflegegebühr zurückerstatten</h4>
                  <p className="text-sm text-green-800">
                    Spare Geld durch aktive Mithilfe bei unseren Arbeitseinsätzen!
                  </p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 pl-14">
                <div className="bg-white/60 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                      1
                    </div>
                    <span className="text-sm text-green-900">Arbeitseinsatz</span>
                  </div>
                  <div className="text-2xl text-green-700">25€</div>
                  <p className="text-xs text-green-800/70">Rückerstattung</p>
                </div>
                
                <div className="bg-white/60 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                      2
                    </div>
                    <span className="text-sm text-green-900">Arbeitseinsätze</span>
                  </div>
                  <div className="text-2xl text-green-700">50€</div>
                  <p className="text-xs text-green-800/70">Volle Erstattung!</p>
                </div>
              </div>
              
              <p className="text-xs text-green-800/80 mt-4 pl-14">
                Die Arbeitseinsätze finden 2× jährlich statt. Bei Teilnahme erhältst du pro Einsatz 25€ zurück.
              </p>
            </div>

            <p className="text-muted-foreground">
              Schnuppern ist natürlich kostenlos! Komm vorbei und lerne uns kennen,
              bevor du dich entscheidest.
            </p>
          </div>
        </div>
      </section>

      {/* Ansprechpartner Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4">Kontakt</Badge>
              <h2 className="mb-4">Dein Ansprechpartner</h2>
              <p className="text-lg text-muted-foreground">
                Bei Fragen zur Jugendarbeit ist unser Jugendwart gerne für dich da
              </p>
            </div>

            <Card className="max-w-2xl mx-auto">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-start gap-6 mb-8">
                  <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="mb-1">Wolfgang Strzeletz</h3>
                    <p className="text-muted-foreground mb-3">Jugendwart</p>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Bei Fragen zur Jugendarbeit stehe ich dir gerne zur Verfügung. 
                      Melde dich einfach – ich freue mich auf deine Nachricht!
                    </p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="bg-background w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border">
                      <Phone className="h-5 w-5 text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">Mobil</p>
                      <a href="tel:+491749736097" className="hover:underline break-all">
                        +49 174 9736097
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="bg-background w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border">
                      <Mail className="h-5 w-5 text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">E-Mail</p>
                      <a href="mailto:wolfgang.strzeletz@freenet.de" className="hover:underline break-all">
                        wolfgang.strzeletz@freenet.de
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0">
              <CardContent className="pt-8 pb-8 text-center">
                <Rocket className="h-12 w-12 mx-auto mb-4 opacity-90" />
                <h2 className="text-white mb-4">Bereit zum Abheben?</h2>
                <p className="text-xl mb-8 text-white/90">
                  Komm vorbei und erlebe die Faszination des Modellflugs hautnah!
                  Wir freuen uns auf dich.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="gap-2"
                  >
                    <Calendar className="h-5 w-5" />
                    Schnuppertermin vereinbaren
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
