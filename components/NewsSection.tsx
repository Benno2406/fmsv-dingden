import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Calendar, ArrowRight, Newspaper, ExternalLink, User, FileText } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { getLatestArticles, type Article } from "../data/articles";

export function NewsSection() {
  // Hole die 3 neuesten Artikel aus der zentralen Datenbasis
  const latestArticles = getLatestArticles(3);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="mb-10 md:mb-14">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-xl bg-primary text-primary-foreground flex-shrink-0">
              <Newspaper className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="mb-0">Aktuelles</h2>
                <div className="h-px flex-1 bg-border max-w-[80px] md:max-w-[100px]"></div>
              </div>
              <p className="text-muted-foreground">
                Bleib auf dem Laufenden über Neuigkeiten aus dem Verein
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* All Articles - Equal Size */}
          {latestArticles.map((item) => (
            <div key={item.id} onClick={() => setSelectedArticle(item)}>
              <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full">
                <div className="relative h-52 overflow-hidden flex-shrink-0">
                  {item.imageUrl ? (
                    <ImageWithFallback 
                      src={item.imageUrl} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Newspaper className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-background/95 backdrop-blur text-foreground hover:bg-background/95" style={{ fontSize: '0.75rem' }}>
                      {item.category}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-5 md:p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-muted-foreground mb-3" style={{ fontSize: '0.875rem' }}>
                    <Calendar className="h-4 w-4" />
                    {item.date}
                  </div>
                  <h3 className="mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground mb-5 line-clamp-3 flex-1">
                    {item.excerpt}
                  </p>
                  <Button variant="ghost" className="gap-2 px-0 group/btn mt-auto">
                    Weiterlesen
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-8 md:mt-12 text-center">
          <Link to="/presseberichte">
            <Button variant="outline" size="lg" className="gap-2">
              Alle Nachrichten anzeigen
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Article Detail Dialog */}
      <Dialog open={selectedArticle !== null} onOpenChange={(open) => !open && setSelectedArticle(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby={selectedArticle ? "article-description" : undefined}>
          {selectedArticle && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">
                    {selectedArticle.category}
                  </Badge>
                  {selectedArticle.type === "Pressebericht" && (
                    <Badge variant="outline" className="gap-1">
                      <FileText className="h-3 w-3" />
                      Pressebericht
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-left pr-8">
                  {selectedArticle.title}
                </DialogTitle>
                <DialogDescription id="article-description" className="text-left space-y-2 pt-2">
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      <span>{selectedArticle.date}</span>
                    </div>
                    {selectedArticle.author && (
                      <div className="flex items-center gap-1.5">
                        <User className="h-4 w-4" />
                        <span>{selectedArticle.author}</span>
                      </div>
                    )}
                  </div>
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-6">
                {selectedArticle.imageUrl && (
                  <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden">
                    <ImageWithFallback 
                      src={selectedArticle.imageUrl} 
                      alt={selectedArticle.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground italic mb-4">
                    {selectedArticle.excerpt}
                  </p>
                  
                  <div className="text-foreground whitespace-pre-line">
                    {selectedArticle.content}
                  </div>
                </div>

                {selectedArticle.sourceUrl && (
                  <div className="pt-4 border-t">
                    <a 
                      href={selectedArticle.sourceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Originalquelle anzeigen
                    </a>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
