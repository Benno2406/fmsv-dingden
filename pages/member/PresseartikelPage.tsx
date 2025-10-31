import { useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "../../components/ui/alert";
import { 
  Plus,
  Newspaper,
  CheckCircle2,
  Clock as ClockIcon,
  XCircle,
  Edit2,
  Calendar,
  Edit,
  Eye,
  AlertCircle,
  AlertTriangle,
  User,
  Save,
  Upload,
  Link,
  Search,
  Loader2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";

// Mock data
const myArticles = [
  {
    id: 1,
    title: "Erfolgreicher Schnuppertag am Flugplatz Dingden",
    excerpt: "Am vergangenen Samstag konnten wir über 30 interessierte Besucher am Modellflugplatz begrüßen. Bei strahlendem Sonnenschein präsentierten unsere Mitglieder verschiedene Modelle...",
    content: `Am vergangenen Samstag konnten wir über 30 interessierte Besucher am Modellflugplatz begrüßen. Bei strahlendem Sonnenschein präsentierten unsere Mitglieder verschiedene Modelle und gaben Einblicke in unser spannendes Hobby.

## Vielfältiges Programm

Die Veranstaltung bot ein breites Spektrum an Aktivitäten. Von Segelflugmodellen über Motorflugzeuge bis hin zu modernen Elektrofliegern war alles dabei. Besonders begeistert zeigten sich die jüngeren Besucher von den Kunstflugvorführungen unserer erfahrenen Piloten.

## Großes Interesse am Jugendtraining

Viele Eltern erkundigten sich nach unserem Jugendprogramm. Klaus Müller, unser Jugendwart, stand für alle Fragen zur Verfügung und konnte bereits mehrere Anmeldungen für das kommende Training entgegennehmen.

**Erfolgreicher Tag**

Der Schnuppertag war ein voller Erfolg und hat gezeigt, dass das Interesse am Modellflug ungebrochen ist. Wir freuen uns bereits auf die nächste Veranstaltung!`,
    status: "approved",
    dateText: "15. Okt 2025",
    category: "Veranstaltung",
    author: "Max Mustermann",
    imageUrl: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800&q=80",
  },
  {
    id: 2,
    title: "Jugendtraining startet erfolgreich in die Saison",
    excerpt: "Mit 8 begeisterten Nachwuchspiloten ist unser Jugendtraining in die neue Saison gestartet. Trainer Klaus Müller zeigt sich sehr zufrieden...",
    content: `Mit 8 begeisterten Nachwuchspiloten ist unser Jugendtraining in die neue Saison gestartet. Trainer Klaus Müller zeigt sich sehr zufrieden mit der Motivation und dem Engagement der jungen Piloten.

## Optimale Bedingungen

Bei bestem Flugwetter konnten alle Teilnehmer ihre ersten Flugversuche unternehmen. Die neuen Schulungsmodelle haben sich dabei bestens bewährt und ermöglichen einen sicheren Einstieg in das Hobby.

## Theorie und Praxis

Neben den praktischen Flugübungen werden auch wichtige theoretische Grundlagen vermittelt. Aerodynamik, Wetterkunde und Sicherheitsaspekte stehen dabei im Vordergrund.`,
    status: "pending",
    dateText: "12. Okt 2025",
    category: "Jugend",
    author: "Max Mustermann",
    imageUrl: "https://images.unsplash.com/photo-1569321835231-37b4ea778d4b?w=800&q=80",
  },
  {
    id: 3,
    title: "Neue Modelle in der Vereinsflotte",
    excerpt: "Der Verein hat zwei neue Schulungsmodelle angeschafft, die ab sofort für das Jugendtraining zur Verfügung stehen...",
    content: `Der Verein hat zwei neue Schulungsmodelle angeschafft, die ab sofort für das Jugendtraining zur Verfügung stehen. Die modernen Elektroflieger zeichnen sich durch ihre einfache Handhabung und Robustheit aus.

## Technische Details

Die beiden Modelle verfügen über bürstenlose Motoren und moderne 2,4 GHz Fernsteuerungen. Mit einer Spannweite von jeweils 1,40m sind sie ideal für Anfänger geeignet.`,
    status: "rejected",
    dateText: "08. Okt 2025",
    category: "Technik",
    author: "Max Mustermann",
    rejectionReason: "Bitte ergänze noch Informationen zu den technischen Spezifikationen der Modelle und füge mindestens ein Foto hinzu.",
    imageUrl: "https://images.unsplash.com/photo-1473445730015-841f29a9490b?w=800&q=80",
  },
];

const categories = ["Veranstaltung", "Jugend", "Technik", "Vereinsleben", "Wettbewerb", "Sicherheit"];

export function PresseartikelPage() {
  const [selectedArticle, setSelectedArticle] = useState<typeof myArticles[0] | null>(null);
  const [editingArticle, setEditingArticle] = useState<typeof myArticles[0] | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    category: "",
    excerpt: "",
    content: "",
    imageUrl: "",
  });
  
  // Bild-Upload States
  const [imageTab, setImageTab] = useState<string>("url");
  const [unsplashQuery, setUnsplashQuery] = useState("");
  const [unsplashResults, setUnsplashResults] = useState<string[]>([]);
  const [isSearchingUnsplash, setIsSearchingUnsplash] = useState(false);

  const handleCreateArticle = () => {
    // Öffne Bearbeiten-Dialog mit leeren Werten
    setEditForm({
      title: "",
      category: "Veranstaltung",
      excerpt: "",
      content: "",
      imageUrl: "",
    });
    setImageTab("url");
    setUnsplashQuery("");
    setUnsplashResults([]);
    setEditingArticle({ id: 0 } as typeof myArticles[0]); // Dummy article für neuen Artikel
  };

  const handleEditArticle = (article: typeof myArticles[0]) => {
    setEditForm({
      title: article.title,
      category: article.category,
      excerpt: article.excerpt,
      content: article.content,
      imageUrl: article.imageUrl || "",
    });
    setImageTab("url");
    setUnsplashQuery("");
    setUnsplashResults([]);
    setEditingArticle(article);
  };

  const handleSaveArticle = () => {
    console.log("Artikel speichern:", editForm);
    // Hier würde die Speicher-Logik kommen (API-Call, State-Update, etc.)
    setEditingArticle(null);
  };

  const handleViewArticle = (article: typeof myArticles[0]) => {
    setSelectedArticle(article);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Convert to data URL for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm({ ...editForm, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUnsplashSearch = async () => {
    if (!unsplashQuery.trim()) return;
    
    setIsSearchingUnsplash(true);
    try {
      // Simulate Unsplash API call with random images
      // In production, this would use the actual Unsplash API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const queries = [unsplashQuery, `${unsplashQuery} aircraft`, `${unsplashQuery} aviation`];
      const randomQuery = queries[Math.floor(Math.random() * queries.length)];
      
      const mockResults = [
        `https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800&q=80`,
        `https://images.unsplash.com/photo-1569321835231-37b4ea778d4b?w=800&q=80`,
        `https://images.unsplash.com/photo-1473445730015-841f29a9490b?w=800&q=80`,
        `https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80`,
        `https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=800&q=80`,
        `https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=800&q=80`,
      ];
      
      setUnsplashResults(mockResults);
    } catch (error) {
      console.error("Unsplash search error:", error);
    } finally {
      setIsSearchingUnsplash(false);
    }
  };

  const handleSelectUnsplashImage = (url: string) => {
    setEditForm({ ...editForm, imageUrl: url });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="mb-2">Meine Artikel</h2>
          <p className="text-muted-foreground">
            Verfasse Artikel über Vereinsaktivitäten für die Website.
          </p>
        </div>
        <Button className="gap-2 min-h-10 flex-shrink-0" onClick={handleCreateArticle}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Neuer Artikel</span>
        </Button>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Artikel einreichen</AlertTitle>
        <AlertDescription>
          Dein Artikel wird vom Vorstand geprüft, bevor er auf der Website veröffentlicht wird.
        </AlertDescription>
      </Alert>

      {/* Meine Artikel - Übersicht */}
      <div className="space-y-4">
        {myArticles.map((article) => (
          <Card key={article.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                {/* Header mit Icon, Titel und Status */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Newspaper className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2">
                      <h4 className="line-clamp-2 flex-1">{article.title}</h4>
                      {/* Status Badge */}
                      <div className="flex-shrink-0">
                        {article.status === "approved" && (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Freigegeben
                          </Badge>
                        )}
                        {article.status === "pending" && (
                          <Badge variant="secondary" className="gap-1">
                            <ClockIcon className="h-3 w-3" />
                            In Prüfung
                          </Badge>
                        )}
                        {article.status === "rejected" && (
                          <Badge variant="destructive" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Abgelehnt
                          </Badge>
                        )}
                        {article.status === "draft" && (
                          <Badge variant="outline" className="gap-1">
                            <Edit2 className="h-3 w-3" />
                            Entwurf
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Meta-Informationen */}
                    <div className="flex flex-wrap items-center gap-2 text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{article.dateText}</span>
                      </div>
                      <span className="text-muted-foreground/50">•</span>
                      <Badge variant="outline" className="text-xs">
                        {article.category}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Excerpt */}
                <div className="pl-0 sm:pl-[4.5rem]">
                  <p className="text-muted-foreground line-clamp-2" style={{ fontSize: '0.875rem' }}>
                    {article.excerpt}
                  </p>
                </div>
                
                {/* Ablehnungsgrund anzeigen */}
                {article.status === "rejected" && article.rejectionReason && (
                  <div className="pl-0 sm:pl-[4.5rem]">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Rückmeldung vom Vorstand</AlertTitle>
                      <AlertDescription style={{ fontSize: '0.875rem' }}>
                        {article.rejectionReason}
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Aktionen */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t pl-0 sm:pl-[4.5rem]">
                  <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                    {article.status === "draft" && "Noch nicht eingereicht"}
                    {article.status === "pending" && "Wartet auf Freigabe vom Vorstand"}
                    {article.status === "approved" && "Auf der Website veröffentlicht"}
                    {article.status === "rejected" && "Bitte überarbeiten und erneut einreichen"}
                  </p>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="gap-1 sm:gap-2 min-h-9 flex-1 sm:flex-initial"
                      onClick={() => handleEditArticle(article)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="hidden xs:inline">Bearbeiten</span>
                    </Button>
                    {article.status === "approved" && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-1 sm:gap-2 min-h-9 flex-1 sm:flex-initial"
                        onClick={() => handleViewArticle(article)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="hidden xs:inline">Ansehen</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {myArticles.length === 0 && (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Newspaper className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h4 className="mb-2">Noch keine Artikel</h4>
              <p className="text-muted-foreground mb-4">
                Erstelle deinen ersten Artikel über Vereinsaktivitäten.
              </p>
              <Button onClick={handleCreateArticle} className="gap-2">
                <Plus className="h-4 w-4" />
                Ersten Artikel erstellen
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Article Detail Dialog */}
      <Dialog open={selectedArticle !== null} onOpenChange={(open) => !open && setSelectedArticle(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby={selectedArticle ? "article-description" : undefined}>
          {selectedArticle && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge variant="default">
                    Vereinsartikel
                  </Badge>
                  <Badge variant="outline">{selectedArticle.category}</Badge>
                  {selectedArticle.status === "pending" && (
                    <Badge variant="secondary" className="gap-1">
                      <ClockIcon className="h-3 w-3" />
                      In Prüfung
                    </Badge>
                  )}
                  {selectedArticle.status === "approved" && (
                    <Badge variant="default" className="gap-1 bg-green-600">
                      <CheckCircle2 className="h-3 w-3" />
                      Freigegeben
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-2xl pr-8">{selectedArticle.title}</DialogTitle>
                <DialogDescription id="article-description" className="flex flex-col gap-2 pt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>{selectedArticle.dateText}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4" />
                    <span>Autor: {selectedArticle.author}</span>
                  </div>
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6">
                {selectedArticle.imageUrl && (
                  <div className="mb-6 rounded-lg overflow-hidden">
                    <ImageWithFallback
                      src={selectedArticle.imageUrl}
                      alt={selectedArticle.title}
                      className="w-full"
                    />
                  </div>
                )}

                <div className="prose prose-sm max-w-none">
                  {selectedArticle.content.split('\n').map((paragraph, index) => {
                    // Handle headings
                    if (paragraph.startsWith('## ')) {
                      return <h2 key={index} className="mt-6 mb-3">{paragraph.replace('## ', '')}</h2>;
                    }
                    if (paragraph.startsWith('### ')) {
                      return <h3 key={index} className="mt-4 mb-2">{paragraph.replace('### ', '')}</h3>;
                    }
                    // Handle bold text
                    if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                      return <p key={index} className="mb-3"><strong>{paragraph.replace(/\*\*/g, '')}</strong></p>;
                    }
                    // Handle list items
                    if (paragraph.startsWith('- ')) {
                      return <li key={index} className="ml-4">{paragraph.replace('- ', '')}</li>;
                    }
                    // Handle empty lines
                    if (paragraph.trim() === '') {
                      return null;
                    }
                    // Regular paragraphs
                    return <p key={index} className="mb-3 text-muted-foreground">{paragraph}</p>;
                  })}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Article Edit Dialog */}
      <Dialog open={editingArticle !== null} onOpenChange={(open) => !open && setEditingArticle(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="edit-dialog-description">
          <DialogHeader>
            <DialogTitle>
              {editingArticle?.id === 0 ? "Neuen Artikel erstellen" : "Artikel bearbeiten"}
            </DialogTitle>
            <DialogDescription id="edit-dialog-description">
              {editingArticle?.id === 0 
                ? "Erstelle einen neuen Artikel für die Vereins-Website. Der Artikel wird nach der Einreichung vom Vorstand geprüft."
                : "Bearbeite deinen Artikel. Nach dem Speichern wird der Artikel erneut vom Vorstand geprüft."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Titel */}
            <div className="space-y-2">
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                placeholder="z.B. Erfolgreicher Schnuppertag am Flugplatz"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>

            {/* Kategorie */}
            <div className="space-y-2">
              <Label htmlFor="category">Kategorie *</Label>
              <Select value={editForm.category} onValueChange={(value) => setEditForm({ ...editForm, category: value })}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Kategorie wählen" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Kurzbeschreibung */}
            <div className="space-y-2">
              <Label htmlFor="excerpt">Kurzbeschreibung *</Label>
              <Textarea
                id="excerpt"
                placeholder="Eine kurze Zusammenfassung des Artikels (wird in der Artikelübersicht angezeigt)"
                rows={3}
                value={editForm.excerpt}
                onChange={(e) => setEditForm({ ...editForm, excerpt: e.target.value })}
              />
              <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                {editForm.excerpt.length} Zeichen
              </p>
            </div>

            {/* Artikelinhalt */}
            <div className="space-y-2">
              <Label htmlFor="content">Artikelinhalt *</Label>
              <Textarea
                id="content"
                placeholder="Der vollständige Artikeltext. Du kannst Markdown-Formatierung verwenden:&#10;&#10;## Überschrift&#10;### Unterüberschrift&#10;**Fett gedruckt**&#10;- Aufzählungspunkt"
                rows={12}
                value={editForm.content}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                className="font-mono"
                style={{ fontSize: '0.875rem' }}
              />
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Formatierungs-Tipps</AlertTitle>
                <AlertDescription style={{ fontSize: '0.75rem' }}>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Überschriften: <code className="text-xs bg-muted px-1 py-0.5 rounded">## Überschrift</code></li>
                    <li>Fett: <code className="text-xs bg-muted px-1 py-0.5 rounded">**Text**</code></li>
                    <li>Aufzählung: <code className="text-xs bg-muted px-1 py-0.5 rounded">- Punkt</code></li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>

            {/* Artikelbild */}
            <div className="space-y-2">
              <Label>Artikelbild (optional)</Label>
              <Tabs value={imageTab} onValueChange={setImageTab} className="w-full">
                {/* Desktop: Grid Layout */}
                <TabsList className="hidden sm:grid w-full grid-cols-3">
                  <TabsTrigger value="url" className="gap-2">
                    <Link className="h-4 w-4" />
                    URL
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Upload
                  </TabsTrigger>
                  <TabsTrigger value="unsplash" className="gap-2">
                    <Search className="h-4 w-4" />
                    Unsplash
                  </TabsTrigger>
                </TabsList>

                {/* Mobile: Scrollbare horizontale Liste */}
                <div className="sm:hidden -mx-4 px-4 overflow-x-auto">
                  <TabsList className="inline-flex w-auto gap-2 bg-transparent">
                    <TabsTrigger value="url" className="gap-2 min-w-fit px-4">
                      <Link className="h-4 w-4" />
                      URL
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="gap-2 min-w-fit px-4">
                      <Upload className="h-4 w-4" />
                      Upload
                    </TabsTrigger>
                    <TabsTrigger value="unsplash" className="gap-2 min-w-fit px-4">
                      <Search className="h-4 w-4" />
                      Unsplash
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* URL Tab */}
                <TabsContent value="url" className="space-y-3 mt-4">
                  <Input
                    type="url"
                    placeholder="https://example.com/bild.jpg"
                    value={editForm.imageUrl}
                    onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                  />
                  <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                    Gib die URL eines Bildes ein, das du verwenden möchtest.
                  </p>
                </TabsContent>

                {/* Upload Tab */}
                <TabsContent value="upload" className="space-y-3 mt-4">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-8 hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="mb-1">Klicke hier oder ziehe ein Bild hinein</p>
                    <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                      PNG, JPG oder GIF bis zu 10MB
                    </p>
                    <Input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Hinweis</AlertTitle>
                    <AlertDescription style={{ fontSize: '0.75rem' }}>
                      In der finalen Version wird das Bild auf den Server hochgeladen. 
                      Aktuell wird es als Vorschau angezeigt.
                    </AlertDescription>
                  </Alert>
                </TabsContent>

                {/* Unsplash Tab */}
                <TabsContent value="unsplash" className="space-y-3 mt-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="z.B. Flugzeug, Modellflug..."
                      value={unsplashQuery}
                      onChange={(e) => setUnsplashQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleUnsplashSearch()}
                    />
                    <Button
                      type="button"
                      onClick={handleUnsplashSearch}
                      disabled={isSearchingUnsplash || !unsplashQuery.trim()}
                      className="gap-2 min-h-10 flex-shrink-0"
                    >
                      {isSearchingUnsplash ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                      <span className="hidden sm:inline">Suchen</span>
                    </Button>
                  </div>

                  {/* Unsplash Results */}
                  {unsplashResults.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto">
                      {unsplashResults.map((url, index) => (
                        <button
                          key={index}
                          type="button"
                          className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                            editForm.imageUrl === url 
                              ? 'border-primary ring-2 ring-primary' 
                              : 'border-transparent hover:border-primary/50'
                          }`}
                          onClick={() => handleSelectUnsplashImage(url)}
                        >
                          <ImageWithFallback
                            src={url}
                            alt={`Unsplash Bild ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {editForm.imageUrl === url && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                              <div className="bg-primary text-primary-foreground rounded-full p-1">
                                <CheckCircle2 className="h-5 w-5" />
                              </div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                    Kostenlose, professionelle Bilder von Unsplash. Wähle ein Bild durch Klick aus.
                  </p>
                </TabsContent>
              </Tabs>
            </div>

            {/* Bildvorschau */}
            {editForm.imageUrl && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Bildvorschau</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditForm({ ...editForm, imageUrl: "" })}
                    className="h-8 text-xs"
                  >
                    Bild entfernen
                  </Button>
                </div>
                <div className="rounded-lg overflow-hidden border">
                  <ImageWithFallback
                    src={editForm.imageUrl}
                    alt="Vorschau"
                    className="w-full max-h-64 object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 flex-col sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setEditingArticle(null)}
              className="w-full sm:w-auto min-h-10"
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleSaveArticle}
              className="gap-2 w-full sm:w-auto min-h-10"
              disabled={!editForm.title || !editForm.category || !editForm.excerpt || !editForm.content}
            >
              <Save className="h-4 w-4" />
              {editingArticle?.id === 0 ? "Artikel einreichen" : "Änderungen speichern"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
