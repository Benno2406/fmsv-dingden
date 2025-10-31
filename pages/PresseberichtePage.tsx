import { useState } from "react";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Calendar, ExternalLink, Newspaper, User, FileText } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { articles, type Article, type ArticleType } from "../data/articles";

const categories = ["Alle", "Vereinsleben", "Wettbewerb", "Veranstaltung", "Jugend", "Technik", "Sicherheit"];
const types = ["Alle", "Vereinsartikel", "Presseberichte"];

export function PresseberichtePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("Alle");
  const [selectedType, setSelectedType] = useState<string>("Alle");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Artikel filtern
  const filteredArticles = articles.filter(article => {
    const categoryMatch = selectedCategory === "Alle" || article.category === selectedCategory;
    const typeMatch = 
      selectedType === "Alle" || 
      (selectedType === "Vereinsartikel" && article.type === "intern") ||
      (selectedType === "Presseberichte" && article.type === "extern");
    
    return categoryMatch && typeMatch;
  });

  return (
    <div>
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary to-primary/80">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center text-primary-foreground">
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-6">
              <Newspaper className="h-5 w-5" />
              <span>Aktuelles & Berichte</span>
            </div>
            <h1 className="mb-6">News und Presseberichte</h1>
            <p className="text-lg opacity-90">
              Hier findest du aktuelle Vereinsnachrichten, Berichte von Veranstaltungen 
              und Artikel aus der Presse über den FMSV Dingden
            </p>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 border-b bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto space-y-4">
            {/* Type Filter */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Art des Beitrags</label>
              <div className="flex flex-wrap gap-2">
                {types.map((type) => (
                  <Button
                    key={type}
                    variant={type === selectedType ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType(type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Kategorie</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={category === selectedCategory ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            {/* Results Info */}
            <div className="mb-8">
              <p className="text-muted-foreground">
                {filteredArticles.length} {filteredArticles.length === 1 ? 'Beitrag' : 'Beiträge'} gefunden
              </p>
            </div>

            {/* Articles Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                  {article.imageUrl && (
                    <div className="aspect-video overflow-hidden">
                      <ImageWithFallback
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <CardContent className="pt-6 flex-1 flex flex-col">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge variant={article.type === "intern" ? "default" : "secondary"}>
                        {article.type === "intern" ? "Vereinsartikel" : "Presse"}
                      </Badge>
                      <Badge variant="outline">{article.category}</Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Calendar className="h-3 w-3" />
                      <span>{article.date}</span>
                    </div>
                    
                    <h3 className="mb-3 line-clamp-2">{article.title}</h3>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                      {article.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t mt-auto">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {article.type === "intern" ? (
                          <>
                            <User className="h-3 w-3" />
                            <span className="truncate">{article.author}</span>
                          </>
                        ) : (
                          <>
                            <FileText className="h-3 w-3" />
                            <span className="truncate">{article.source}</span>
                          </>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => setSelectedArticle(article)}
                      >
                        Lesen
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredArticles.length === 0 && (
              <div className="text-center py-12">
                <Card className="bg-muted/30 border-dashed">
                  <CardContent className="pt-8 pb-8">
                    <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="mb-2">Keine Artikel gefunden</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Für die ausgewählten Filter wurden keine Artikel gefunden. 
                      Versuche es mit anderen Filtereinstellungen.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Article Detail Dialog */}
      <Dialog open={selectedArticle !== null} onOpenChange={(open) => !open && setSelectedArticle(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby={selectedArticle ? "article-description" : undefined}>
          {selectedArticle && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge variant={selectedArticle.type === "intern" ? "default" : "secondary"}>
                    {selectedArticle.type === "intern" ? "Vereinsartikel" : "Pressebericht"}
                  </Badge>
                  <Badge variant="outline">{selectedArticle.category}</Badge>
                </div>
                <DialogTitle className="text-2xl pr-8">{selectedArticle.title}</DialogTitle>
                <DialogDescription id="article-description" className="flex flex-col gap-2 pt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>{selectedArticle.date}</span>
                  </div>
                  {selectedArticle.type === "intern" ? (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4" />
                      <span>{selectedArticle.author}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4" />
                      <span>Quelle: {selectedArticle.source}</span>
                    </div>
                  )}
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
    </div>
  );
}
