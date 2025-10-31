// Zentrale Datenbasis für alle Artikel (Vereinsnachrichten und Presseberichte)
// In der echten Anwendung würden diese aus einer Datenbank kommen

export type ArticleType = "intern" | "extern";

export interface Article {
  id: number;
  title: string;
  excerpt: string;
  source: string;
  author?: string; // Nur für interne Artikel
  date: string;
  category: string;
  type: ArticleType;
  imageUrl: string | null;
  content: string; // Vollständiger Artikelinhalt
  featured?: boolean; // Für Featured-Artikel auf der Startseite
}

export const articles: Article[] = [
  {
    id: 1,
    title: "3. Platz beim Landeswettbewerb F3A",
    excerpt: "Unser Pilot Michael Bergmann erreicht einen hervorragenden 3. Platz beim Landeswettbewerb im Kunstflug. Mit seiner präzisen Flugführung und beeindruckenden Figuren konnte er sich gegen starke Konkurrenz durchsetzen.",
    source: "FMSV Dingden",
    author: "Vorstand FMSV Dingden",
    date: "18. Oktober 2024",
    category: "Wettbewerb",
    type: "intern",
    imageUrl: "https://images.unsplash.com/photo-1696066765577-310133f31de6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2RlbCUyMGFpcnBsYW5lJTIwY29tcGV0aXRpb258ZW58MXx8fHwxNzYxMTY2MjA0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    featured: true,
    content: `
Der Landeswettbewerb NRW in der F3A-Klasse (Kunstflug mit Motorflugmodellen) fand dieses Jahr bei idealen Wetterbedingungen in Schmallenberg statt. Unser Vereinsmitglied Michael Bergmann konnte sich in einem hochkarätig besetzten Teilnehmerfeld einen hervorragenden 3. Platz sichern.

## Perfekte Vorbereitung zahlt sich aus

Michael hatte sich monatelang auf diesen Wettbewerb vorbereitet. Fast täglich konnte man ihn auf unserem Vereinsgelände beim Training beobachten, wie er die komplexen Figuren der Advanced-Klasse perfektionierte. "Die Vorbereitung war intensiv, aber genau das war nötig, um auf diesem Niveau mithalten zu können", erklärt Michael nach dem Wettbewerb.

## Spannender Wettkampf über drei Runden

Der Wettbewerb erstreckte sich über zwei Tage mit insgesamt drei Wertungsrunden. In jeder Runde musste ein festgelegtes Flugprogramm absolviert werden, das von fünf Kampfrichtern bewertet wurde. Besonders in der zweiten Runde zeigte Michael eine nahezu fehlerfreie Vorstellung und konnte sich damit in die Spitzengruppe vorkämpfen.

## Vereinsstolz und Motivation

"Wir sind unglaublich stolz auf Michaels Leistung", freut sich Vereinsvorsitzender Thomas Schmidt. "Solche Erfolge motivieren auch unsere jüngeren Mitglieder und zeigen, dass man mit konsequentem Training auf höchstem Niveau mitfliegen kann."

Michael selbst plant bereits die nächste Saison: "Der 3. Platz ist ein großer Erfolg, aber ich will mich weiter verbessern. Das Ziel für nächstes Jahr ist klar: der Titel!"

Wir gratulieren Michael herzlich zu diesem tollen Erfolg und drücken ihm für die kommende Saison die Daumen!
    `
  },
  {
    id: 2,
    title: "Rückblick auf unser erfolgreiches Vereinsjahr 2024",
    excerpt: "Das Jahr 2024 war für unseren Verein ein großer Erfolg. Von spannenden Wettbewerben über gelungene Veranstaltungen bis hin zu beeindruckenden Nachwuchserfolgen – wir blicken auf 12 ereignisreiche Monate zurück.",
    source: "FMSV Dingden",
    author: "Vorstand FMSV Dingden",
    date: "20. Dezember 2024",
    category: "Vereinsleben",
    type: "intern",
    imageUrl: "https://images.unsplash.com/photo-1595732301236-42a26208b2fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBldmVudCUyMG91dGRvb3JzfGVufDF8fHx8MTc2MTIwNDIwNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    content: `
Das Jahr 2024 neigt sich dem Ende zu und wir möchten die Gelegenheit nutzen, um auf ein ereignisreiches und erfolgreiches Vereinsjahr zurückzublicken.

## Highlights des Jahres

**Frühjahrsstart mit Rekordbesuch**
Bereits im März konnten wir mit idealen Wetterbedingungen in die Saison starten. Über 30 Mitglieder fanden sich zum Saisonauftakt ein und präsentierten ihre über den Winter vorbereiteten und gewarteten Modelle.

**Erfolgreiche Wettbewerbsteilnahmen**
Unsere Vereinsmitglieder konnten sich bei verschiedenen Regional- und Landesmeisterschaften beweisen. Besonders stolz sind wir auf die Platzierungen in der F3A-Klasse, wo gleich drei unserer Piloten unter den Top 10 landeten.

**Jugendarbeit trägt Früchte**
Ein besonderer Schwerpunkt lag auch 2024 auf unserer Jugendarbeit. Mit 12 neuen Jugendmitgliedern haben wir einen neuen Vereinsrekord aufgestellt. Unsere erfahrenen Fluglehrer investierten hunderte Stunden in die Ausbildung des Nachwuchses.

**Sommerfest mit über 200 Besuchern**
Das traditionelle Sommerfest im Juni war mit über 200 Besuchern ein voller Erfolg. Bei strahlendem Sonnenschein konnten wir zahlreiche Flugvorführungen präsentieren und viele interessierte Gäste für den Modellflug begeistern.

## Ausblick auf 2025

Für das kommende Jahr haben wir bereits einige spannende Projekte in Planung. Unter anderem möchten wir unser Vereinsgelände erweitern und zusätzliche Infrastruktur schaffen. Auch die Zusammenarbeit mit lokalen Schulen soll intensiviert werden.

Wir bedanken uns bei allen Mitgliedern für ihr Engagement und freuen uns auf ein weiteres erfolgreiches Jahr!
    `
  },
  {
    id: 3,
    title: "Schnuppertermin am 15. November - Jetzt anmelden!",
    excerpt: "Interessiert am Modellflug? Bei unserem Schnuppertag kannst du kostenlos erste Flugerfahrungen sammeln. Unter Anleitung erfahrener Fluglehrer darfst du selbst ein Modell steuern.",
    source: "FMSV Dingden",
    author: "Jugendwart FMSV Dingden",
    date: "05. Oktober 2024",
    category: "Veranstaltung",
    type: "intern",
    imageUrl: "https://images.unsplash.com/photo-1567101399388-cb656ef306d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2RlbCUyMGFpcnBsYW5lJTIwZmx5aW5nJTIwZXZlbnR8ZW58MXx8fHwxNzYxMTY2MjA1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    featured: true,
    content: `
Du wolltest schon immer mal ein Flugmodell selbst steuern? Dann ist unser Schnuppertag am 15. November die perfekte Gelegenheit!

## Was erwartet dich?

Bei unserem Schnuppertag hast du die Möglichkeit, den Modellflug hautnah zu erleben. Unter Anleitung erfahrener Fluglehrer kannst du mit unserem Lehrer-Schüler-System erste Flugerfahrungen sammeln – völlig risikofrei und kostenlos.

**Das Programm:**
- 10:00 Uhr: Begrüßung und Einführung
- 10:30 Uhr: Vorstellung verschiedener Modelltypen
- 11:00 Uhr: Erste Flugversuche mit dem Simulator
- 12:00 Uhr: Gemeinsames Mittagessen (Grillwurst & Getränke)
- 13:00 Uhr: Flugvorführungen unserer erfahrenen Piloten
- 14:00 Uhr: Selbst fliegen mit dem Lehrer-Schüler-System
- 16:00 Uhr: Ende der Veranstaltung

## Für wen ist der Schnuppertag geeignet?

Der Schnuppertag richtet sich an alle Interessierten ab 8 Jahren – egal ob jung oder alt, Anfänger oder mit ersten Erfahrungen. Du brauchst keine Vorkenntnisse und auch keine eigene Ausrüstung mitzubringen. Wir stellen alles zur Verfügung!

## Anmeldung

Um besser planen zu können, bitten wir um eine kurze Anmeldung per E-Mail an jugend@fmsv-dingden.de oder telefonisch unter 02856/1234567.

**Termin:** Samstag, 15. November 2024, 10:00 - 16:00 Uhr  
**Ort:** Fluggelände FMSV Dingden, Musterstraße 123, 46499 Hamminkeln-Dingden  
**Kosten:** Kostenlos

Wir freuen uns auf dich!
    `
  },
  {
    id: 4,
    title: "Erfolgreicher Schnuppertag beim FMSV Dingden",
    excerpt: "Zahlreiche interessierte Kinder und Jugendliche besuchten den Schnuppertag des Flugmodellsportvereins. Unter Anleitung erfahrener Piloten konnten die Teilnehmer erste Flugerfahrungen sammeln.",
    source: "Dingdener Zeitung",
    date: "15. September 2024",
    category: "Vereinsleben",
    type: "extern",
    imageUrl: "https://images.unsplash.com/photo-1758485363383-e82089de4d0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3V0aCUyMGxlYXJuaW5nJTIwZmx5aW5nfGVufDF8fHx8MTc2MTIwNDIwNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    content: `
Der Flugmodellsportverein Dingden e.V. lud am vergangenen Samstag zu einem Schnuppertag ein – und das Interesse war überwältigend. Mehr als 25 Kinder und Jugendliche zwischen 8 und 16 Jahren folgten der Einladung und erhielten erste Einblicke in die faszinierende Welt des Modellflug.

## Begeisterung von Anfang an

Bereits am frühen Vormittag füllte sich das Vereinsgelände. Die jungen Besucher zeigten großes Interesse an den verschiedenen Flugmodellen, die die Vereinsmitglieder mitgebracht hatten – vom kleinen Segler bis zum großen Scale-Modell war alles vertreten.

"Die Begeisterung in den Augen der Kinder zu sehen, wenn sie das erste Mal selbst ein Modell steuern dürfen, ist einfach unbezahlbar", berichtet Vereinsvorsitzender Michael Schmidt.

## Sichere erste Flugversuche

Dank der vereinseigenen Lehrer-Schüler-Funksteuerungen konnten die Teilnehmer unter Anleitung erfahrener Piloten gefahrlos erste Flugerfahrungen sammeln. Die Fluglehrer hatten jederzeit die Möglichkeit einzugreifen und so war maximale Sicherheit gewährleistet.

Der nächste Schnuppertag ist bereits in Planung.
    `
  },
  {
    id: 5,
    title: "Tipps für den Winter: So bereitest du dein Modell auf die Saison vor",
    excerpt: "Die kalte Jahreszeit ist die perfekte Gelegenheit, um deine Flugmodelle zu warten und für die kommende Saison vorzubereiten. Wir geben dir wertvolle Tipps für die Winterwartung.",
    source: "FMSV Dingden",
    author: "Klaus Müller, Technikreferent",
    date: "10. November 2024",
    category: "Technik",
    type: "intern",
    imageUrl: null,
    content: `
Der Winter steht vor der Tür und damit auch die ideale Zeit, um deine Flugmodelle gründlich zu warten und für die kommende Saison vorzubereiten. Hier sind unsere wichtigsten Tipps:

## 1. Gründliche Reinigung

Beginne mit einer gründlichen Reinigung deines Modells. Entferne Schmutz, Öl und Grasreste. Achte besonders auf schwer zugängliche Bereiche wie Fahrwerksaufnahmen und Motorhalterungen.

## 2. Überprüfung der Elektronik

- **Servos testen:** Überprüfe alle Servos auf leichtgängige Bewegung und korrekte Zentrierung
- **Empfänger und Verkabelung:** Kontrolliere alle Steckverbindungen auf festen Sitz
- **Akkus prüfen:** Miss die Spannung aller Flug- und Empfängerakkus

## 3. Motorwartung

Bei Verbrennermotoren:
- Vergaser reinigen
- Kerze überprüfen und ggf. erneuern
- Schalldämpfer ausbauen und säubern

Bei Elektromotoren:
- Lagerspiel kontrollieren
- Motorwelle auf Rundlauf prüfen
- Regler auf Beschädigungen untersuchen

## 4. Strukturelle Überprüfung

Untersuche dein Modell auf:
- Risse in der Bespannung
- Lockere Klebestellen
- Beschädigte Ruder und Anlenkungen
- Verschleiß am Fahrwerk

## 5. Lackierung auffrischen

Der Winter ist die perfekte Zeit für Verschönerungsarbeiten. Bessere Lackschäden aus und gib deinem Modell einen frischen Look.

## Werkstatt-Treffs

Übrigens: Jeden Samstag ab 14 Uhr ist unsere Vereinswerkstatt geöffnet. Hier kannst du gemeinsam mit anderen Mitgliedern an deinen Modellen arbeiten und von den Erfahrungen der „alten Hasen" profitieren.

Wir freuen uns auf einen gut vorbereiteten Saisonstart!
    `
  },
  {
    id: 6,
    title: "FMSV-Mitglieder glänzen bei Regionalmeisterschaft",
    excerpt: "Mehrere Mitglieder des Flugmodellsportvereins Dingden konnten sich bei der Regionalmeisterschaft in der F3A-Klasse beweisen und erreichten vordere Platzierungen.",
    source: "Modellflug Aktuell",
    date: "3. August 2024",
    category: "Wettbewerb",
    type: "extern",
    imageUrl: "https://images.unsplash.com/photo-1735081011415-04cdcec4d648?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2RlbCUyMGFpcmNyYWZ0JTIwY29tcGV0aXRpb258ZW58MXx8fHwxNzYxMjA0MjAzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    content: `
Bei der diesjährigen Regionalmeisterschaft in der F3A-Klasse (Kunstflug mit Motorflugmodellen) konnten gleich drei Piloten des FMSV Dingden überzeugende Leistungen zeigen.

## Starke Leistungen in allen Kategorien

In der Advanced-Klasse erreichte Thomas Weber einen hervorragenden 3. Platz. "Die Konkurrenz war stark, aber ich konnte meine Flüge sauber durchziehen", freute sich Weber nach der Siegerehrung.

Auch in der Sportsman-Klasse war der FMSV erfolgreich vertreten: Marcus Klein belegte Platz 5, dicht gefolgt von Vereinskollege Stefan Hoffmann auf Platz 7.

## Harte Vorbereitung zahlt sich aus

Die Erfolge kamen nicht von ungefähr. Alle drei Piloten hatten sich intensiv auf den Wettbewerb vorbereitet und die letzten Wochen vor dem Event täglich trainiert. "Das frühe Aufstehen und die vielen Trainingsstunden haben sich gelohnt", resümiert Klein.

Der Verein gratuliert allen Teilnehmern zu ihren tollen Leistungen!
    `
  },
  {
    id: 7,
    title: "Traditionelles Sommerfest mit Flugvorführungen",
    excerpt: "Das diesjährige Sommerfest des FMSV Dingden lockte zahlreiche Besucher an. Bei strahlendem Sonnenschein begeisterten spektakuläre Flugvorführungen Jung und Alt.",
    source: "Westfälische Rundschau",
    date: "20. Juni 2024",
    category: "Veranstaltung",
    type: "extern",
    imageUrl: "https://images.unsplash.com/photo-1595732301236-42a26208b2fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBldmVudCUyMG91dGRvb3JzfGVufDF8fHx8MTc2MTIwNDIwNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    content: `
Perfektes Flugwetter, begeisterte Zuschauer und spektakuläre Vorführungen – das Sommerfest des Flugmodellsportvereins Dingden war auch in diesem Jahr ein voller Erfolg.

## Buntes Programm für alle Altersgruppen

Über 200 Besucher fanden den Weg zum Vereinsgelände und erlebten ein abwechslungsreiches Programm. Neben beeindruckenden Flugvorführungen mit verschiedensten Modellen – vom kleinen Elektro-Segler bis zum großen Scale-Jet – gab es für die Besucher auch die Möglichkeit, selbst aktiv zu werden.

Am Flugsimulator konnten interessierte Gäste erste virtuelle Flugerfahrungen sammeln, während die jüngeren Besucher bei der Bastelstation ihre eigenen kleinen Wurfgleiter bauen durften.

## Kulinarisches und Geselligkeit

Für das leibliche Wohl war bestens gesorgt. Bratwurst, kühle Getränke und selbstgebackener Kuchen – die Versorgung der Gäste ließ keine Wünsche offen. Bei entspannter Atmosphäre tauschten sich Modellflug-Enthusiasten und interessierte Neulinge über ihr gemeinsames Hobby aus.

"Solche Veranstaltungen sind wichtig, um unser Hobby einer breiten Öffentlichkeit zu präsentieren", erklärte Vereinsvorsitzender Michael Schmidt. "Wir freuen uns über das große Interesse und hoffen, dass wir den einen oder anderen für den Modellflug begeistern konnten."

Das nächste Sommerfest ist bereits für Juni 2025 in Planung.
    `
  },
  {
    id: 8,
    title: "Neue Sicherheitsrichtlinien für das Vereinsgelände",
    excerpt: "Ab dem 1. Januar 2025 gelten aktualisierte Sicherheitsrichtlinien auf unserem Fluggelände. Hier erfährst du alles über die wichtigsten Änderungen und was du beachten musst.",
    source: "FMSV Dingden",
    author: "Sicherheitsbeauftragter FMSV",
    date: "15. Oktober 2024",
    category: "Sicherheit",
    type: "intern",
    imageUrl: null,
    content: `
Liebe Vereinsmitglieder,

zum 1. Januar 2025 treten aktualisierte Sicherheitsrichtlinien für unser Fluggelände in Kraft. Diese Aktualisierung war notwendig geworden, um den neuesten gesetzlichen Vorgaben zu entsprechen und die Sicherheit aller Mitglieder und Besucher weiter zu erhöhen.

## Die wichtigsten Änderungen im Überblick

### 1. Erweiterte Pilotenverantwortung

Jeder Pilot ist nun verpflichtet, vor dem Start eine kurze Sicherheitscheckliste durchzugehen. Diese umfasst:
- Überprüfung der Ruderausschläge
- Test der Fernsteuerung
- Sichtkontrolle des Modells
- Überprüfung der Akkuspannung

### 2. Neue Abstandsregelungen

Der Mindestabstand zu Zuschauern wurde von 5 auf 10 Meter erhöht. Dies gilt besonders für größere Modelle über 5kg Startgewicht.

### 3. Verpflichtende Versicherung

Alle aktiven Piloten müssen ab 2025 eine gültige Haftpflichtversicherung nachweisen können. Die Versicherung über den DMFV wird vom Verein zentral organisiert.

### 4. Dokumentationspflicht

Für Modelle über 25kg ist eine detaillierte Dokumentation erforderlich, die beim Vorstand hinterlegt werden muss.

## Schulung für alle Mitglieder

Am 15. Dezember 2024 findet eine verpflichtende Sicherheitsschulung statt, in der alle Änderungen im Detail besprochen werden. Die Teilnahme ist für alle aktiven Piloten Pflicht.

**Termin:** Sonntag, 15. Dezember 2024, 14:00 Uhr  
**Ort:** Vereinsheim FMSV Dingden

Bei Fragen steht euch der Sicherheitsbeauftragte jederzeit zur Verfügung.

Euer Vorstand
    `
  }
];

// Hilfsfunktionen zum Filtern der Artikel
export const getLatestArticles = (count: number = 3): Article[] => {
  return [...articles]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);
};

export const getFeaturedArticles = (): Article[] => {
  return articles.filter(article => article.featured);
};

export const getArticlesByType = (type: ArticleType): Article[] => {
  return articles.filter(article => article.type === type);
};

export const getArticlesByCategory = (category: string): Article[] => {
  return articles.filter(article => article.category === category);
};
