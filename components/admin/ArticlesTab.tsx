import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Upload,
  Image as ImageIcon,
  AlertCircle
} from "lucide-react";
import { articles } from "../../data/articles";

interface ArticleFormData {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  type: "intern" | "extern";
  author: string;
  source: string;
  date: string;
  imageFile: File | null;
  imagePreview: string | null;
}

const CATEGORIES = [
  "Vereinsleben",
  "Wettbewerb",
  "Veranstaltung",
  "Jugend",
  "Technik",
  "Sicherheit"
];

export function ArticlesTab() {
  // State für Artikelverwaltung
  const [pendingArticles, setPendingArticles] = useState([
    {
      id: "pending1",
      title: "Herbstwettbewerb 2024 - Tolle Leistungen",
      date: "22. Oktober 2024",
      author: "Peter Schmidt",
      submittedBy: "Peter Schmidt",
      submittedDate: "21. Oktober 2024",
      status: "pending",
      type: "intern",
      category: "Wettbewerb",
      excerpt: "Beim gestrigen Herbstwettbewerb zeigten unsere Mitglieder beeindruckende Flugmanöver...",
    },
    {
      id: "pending2",
      title: "Winterwartung - Wichtige Hinweise",
      date: "28. Oktober 2024",
      author: "Klaus Müller",
      submittedBy: "Klaus Müller",
      submittedDate: "27. Oktober 2024",
      status: "pending",
      type: "intern",
      category: "Technik",
      excerpt: "Die Wintermonate nutzen viele von uns zur gründlichen Modellwartung...",
    },
  ]);

  const [publishedArticles, setPublishedArticles] = useState(
    articles.map(article => ({
      id: article.id.toString(),
      title: article.title,
      date: article.date,
      author: article.author || article.source,
      status: "published",
      type: article.type,
      category: article.category,
      excerpt: article.excerpt,
      source: article.source,
    }))
  );

  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  // Form States
  const [formData, setFormData] = useState<ArticleFormData>({
    title: "",
    excerpt: "",
    content: "",
    category: "Vereinsleben",
    type: "intern",
    author: "",
    source: "FMSV Dingden",
    date: new Date().toISOString().split('T')[0],
    imageFile: null,
    imagePreview: null,
  });

  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [articleToDelete, setArticleToDelete] = useState<any>(null);
  const [articleToProcess, setArticleToProcess] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [rejectReason, setRejectReason] = useState("");

  // Filter States
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  // Handler Functions
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          imageFile: file,
          imagePreview: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateArticle = (publish: boolean = false) => {
    if (!formData.title || !formData.excerpt || !formData.content) {
      alert("Bitte fülle alle Pflichtfelder aus.");
      return;
    }

    const newArticle = {
      id: `new-${Date.now()}`,
      title: formData.title,
      excerpt: formData.excerpt,
      content: formData.content,
      category: formData.category,
      type: formData.type,
      author: formData.type === "intern" ? formData.author : undefined,
      source: formData.type === "extern" ? formData.source : "FMSV Dingden",
      date: formData.date,
      status: publish ? "published" : "pending",
      submittedBy: formData.author,
      submittedDate: new Date().toLocaleDateString("de-DE"),
      imageUrl: formData.imagePreview,
    };

    console.log("Artikel erstellt:", newArticle);

    if (publish) {
      setPublishedArticles([newArticle, ...publishedArticles]);
      alert("Artikel wurde erfolgreich veröffentlicht!");
    } else {
      setPendingArticles([newArticle, ...pendingArticles]);
      alert("Artikel wurde als Entwurf gespeichert und wartet auf Freigabe.");
    }

    // Reset form
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      category: "Vereinsleben",
      type: "intern",
      author: "",
      source: "FMSV Dingden",
      date: new Date().toISOString().split('T')[0],
      imageFile: null,
      imagePreview: null,
    });
    setIsCreateOpen(false);
  };

  const handleApproveArticle = () => {
    if (!articleToProcess) return;

    console.log("Artikel freigegeben:", articleToProcess.id);

    // Artikel von pending zu published verschieben
    const updatedArticle = {
      ...articleToProcess,
      status: "published",
    };

    setPublishedArticles([updatedArticle, ...publishedArticles]);
    setPendingArticles(pendingArticles.filter(a => a.id !== articleToProcess.id));
    
    setIsApprovalDialogOpen(false);
    setArticleToProcess(null);
    alert("Artikel wurde erfolgreich freigegeben!");
  };

  const handleRejectArticle = () => {
    if (!articleToProcess) return;

    console.log("Artikel abgelehnt:", {
      id: articleToProcess.id,
      reason: rejectReason
    });

    setPendingArticles(pendingArticles.filter(a => a.id !== articleToProcess.id));
    
    setIsRejectDialogOpen(false);
    setArticleToProcess(null);
    setRejectReason("");
    alert(`Artikel wurde abgelehnt. Der Verfasser wurde benachrichtigt.`);
  };

  const handleDeleteArticle = () => {
    if (!articleToDelete) return;

    console.log("Artikel gelöscht:", articleToDelete.id);

    if (articleToDelete.status === "pending") {
      setPendingArticles(pendingArticles.filter(a => a.id !== articleToDelete.id));
    } else {
      setPublishedArticles(publishedArticles.filter(a => a.id !== articleToDelete.id));
    }

    setIsDeleteDialogOpen(false);
    setArticleToDelete(null);
    alert("Artikel wurde erfolgreich gelöscht.");
  };

  const handleEditArticle = (article: any) => {
    setSelectedArticle(article);
    setFormData({
      title: article.title,
      excerpt: article.excerpt,
      content: article.content || "",
      category: article.category,
      type: article.type,
      author: article.author || "",
      source: article.source || "FMSV Dingden",
      date: article.date,
      imageFile: null,
      imagePreview: null,
    });
    setIsEditOpen(true);
  };

  const handleUpdateArticle = () => {
    if (!selectedArticle) return;

    console.log("Artikel aktualisiert:", {
      id: selectedArticle.id,
      ...formData
    });

    // Update in entsprechender Liste
    if (selectedArticle.status === "pending") {
      setPendingArticles(pendingArticles.map(a => 
        a.id === selectedArticle.id 
          ? { ...a, ...formData }
          : a
      ));
    } else {
      setPublishedArticles(publishedArticles.map(a => 
        a.id === selectedArticle.id 
          ? { ...a, ...formData }
          : a
      ));
    }

    setIsEditOpen(false);
    setSelectedArticle(null);
    alert("Artikel wurde erfolgreich aktualisiert!");
  };

  const handlePreview = (article: any) => {
    setSelectedArticle(article);
    setIsPreviewOpen(true);
  };

  // Filter articles
  const filterArticles = (articleList: any[]) => {
    return articleList.filter(article => {
      const categoryMatch = filterCategory === "all" || article.category === filterCategory;
      const typeMatch = filterType === "all" || article.type === filterType;
      return categoryMatch && typeMatch;
    });
  };

  const filteredPending = filterArticles(pendingArticles);
  const filteredPublished = filterArticles(publishedArticles);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Presseberichte & Vereinsartikel</CardTitle>
            <Button 
              className="gap-2"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Neuer Artikel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter Section */}
          <div className="flex flex-wrap gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="filter-category" className="mb-2 block">Kategorie</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger id="filter-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Kategorien</SelectItem>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="filter-type" className="mb-2 block">Typ</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger id="filter-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Typen</SelectItem>
                  <SelectItem value="intern">Vereinsartikel</SelectItem>
                  <SelectItem value="extern">Presseberichte</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabs für Pending und Published */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending" className="gap-2">
                <Clock className="h-4 w-4" />
                Wartet auf Freigabe ({filteredPending.length})
              </TabsTrigger>
              <TabsTrigger value="published" className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Veröffentlicht ({filteredPublished.length})
              </TabsTrigger>
            </TabsList>

            {/* Pending Articles Tab */}
            <TabsContent value="pending" className="mt-6">
              {filteredPending.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Titel</TableHead>
                        <TableHead>Typ</TableHead>
                        <TableHead>Kategorie</TableHead>
                        <TableHead>Eingereicht von</TableHead>
                        <TableHead>Datum</TableHead>
                        <TableHead className="text-right">Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPending.map((article) => (
                        <TableRow key={article.id}>
                          <TableCell>
                            <div>
                              <p>{article.title}</p>
                              <p className="text-muted-foreground line-clamp-1" style={{ fontSize: '0.875rem' }}>
                                {article.excerpt}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={article.type === "intern" ? "default" : "secondary"}>
                              {article.type === "intern" ? "Vereinsartikel" : "Pressebericht"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{article.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>{article.submittedBy}</p>
                              <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                                {article.submittedDate}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              {article.date}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="gap-1"
                                onClick={() => handlePreview(article)}
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="gap-1"
                                onClick={() => handleEditArticle(article)}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="gap-1 text-green-600"
                                onClick={() => {
                                  setArticleToProcess(article);
                                  setIsApprovalDialogOpen(true);
                                }}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="gap-1 text-destructive"
                                onClick={() => {
                                  setArticleToProcess(article);
                                  setIsRejectDialogOpen(true);
                                }}
                              >
                                <XCircle className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg bg-muted/30">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="mb-2">Keine ausstehenden Artikel</h3>
                  <p className="text-muted-foreground">
                    Alle Artikel wurden freigegeben oder es wurden noch keine eingereicht.
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Published Articles Tab */}
            <TabsContent value="published" className="mt-6">
              {filteredPublished.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Titel</TableHead>
                        <TableHead>Typ</TableHead>
                        <TableHead>Kategorie</TableHead>
                        <TableHead>Autor/Quelle</TableHead>
                        <TableHead>Datum</TableHead>
                        <TableHead className="text-right">Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPublished.map((article) => (
                        <TableRow key={article.id}>
                          <TableCell>
                            <div>
                              <p>{article.title}</p>
                              <p className="text-muted-foreground line-clamp-1" style={{ fontSize: '0.875rem' }}>
                                {article.excerpt}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={article.type === "intern" ? "default" : "secondary"}>
                              {article.type === "intern" ? "Vereinsartikel" : "Pressebericht"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{article.category}</Badge>
                          </TableCell>
                          <TableCell>{article.author}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              {article.date}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="gap-1"
                                onClick={() => handlePreview(article)}
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="gap-1"
                                onClick={() => handleEditArticle(article)}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="gap-1 text-destructive"
                                onClick={() => {
                                  setArticleToDelete(article);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg bg-muted/30">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="mb-2">Keine veröffentlichten Artikel</h3>
                  <p className="text-muted-foreground">
                    Mit den aktuellen Filtern wurden keine Artikel gefunden.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create Article Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Neuen Artikel erstellen</DialogTitle>
            <DialogDescription>
              Verfasse einen neuen Artikel. Vereinsartikel werden sofort veröffentlicht, 
              Presseberichte müssen vom Vorstand freigegeben werden.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Type Selection */}
            <div className="space-y-2">
              <Label>Art des Artikels *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: "intern" | "extern") => 
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intern">Vereinsartikel</SelectItem>
                  <SelectItem value="extern">Pressebericht</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                Vereinsartikel sind vom Verein verfasst, Presseberichte stammen aus externen Quellen
              </p>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                placeholder="z.B. Sommerfest 2024 - Ein voller Erfolg"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Date, Author/Source */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Datum *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              {formData.type === "intern" ? (
                <div className="space-y-2">
                  <Label htmlFor="author">Autor *</Label>
                  <Input
                    id="author"
                    placeholder="Dein Name"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="source">Quelle *</Label>
                  <Input
                    id="source"
                    placeholder="z.B. Dingdener Zeitung"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  />
                </div>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Kategorie *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <Label htmlFor="excerpt">Kurzbeschreibung *</Label>
              <Textarea
                id="excerpt"
                placeholder="Eine kurze Zusammenfassung für die Übersicht (max. 2-3 Sätze)..."
                rows={3}
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Artikelinhalt *</Label>
              <Textarea
                id="content"
                placeholder="Der vollständige Artikel-Text..."
                rows={12}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-muted-foreground mb-2" style={{ fontSize: '0.875rem' }}>
                  <strong>Formatierungs-Tipps:</strong>
                </p>
                <ul className="text-muted-foreground space-y-1" style={{ fontSize: '0.75rem' }}>
                  <li>• Überschriften: <code>## Überschrift</code> oder <code>### Unterüberschrift</code></li>
                  <li>• Fettdruck: <code>**Fetter Text**</code></li>
                  <li>• Aufzählungen: <code>- Listenpunkt</code></li>
                  <li>• Absätze durch Leerzeilen trennen</li>
                </ul>
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="image">Titelbild (optional)</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              {formData.imagePreview && (
                <div className="mt-3">
                  <p className="text-sm text-muted-foreground mb-2">Vorschau:</p>
                  <div className="aspect-video w-full max-w-md rounded-lg overflow-hidden border">
                    <img
                      src={formData.imagePreview}
                      alt="Vorschau"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Abbrechen
            </Button>
            <Button variant="outline" onClick={() => handleCreateArticle(false)}>
              <Clock className="h-4 w-4 mr-2" />
              Als Entwurf speichern
            </Button>
            <Button onClick={() => handleCreateArticle(true)}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Veröffentlichen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Article Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Artikel bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeite den Artikel oder verwalte die Bilder
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="details" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Artikel-Details</TabsTrigger>
              <TabsTrigger value="media">Medien & Bilder</TabsTrigger>
            </TabsList>

            {/* Artikel-Details Tab */}
            <TabsContent value="details" className="space-y-4 overflow-y-auto flex-1">
              <div className="space-y-4 pb-4">
                <div className="space-y-2">
                  <Label>Art des Artikels *</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value: "intern" | "extern") => 
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="intern">Vereinsartikel</SelectItem>
                      <SelectItem value="extern">Pressebericht</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-title">Titel *</Label>
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-date">Datum *</Label>
                    <Input
                      id="edit-date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  {formData.type === "intern" ? (
                    <div className="space-y-2">
                      <Label htmlFor="edit-author">Autor *</Label>
                      <Input
                        id="edit-author"
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="edit-source">Quelle *</Label>
                      <Input
                        id="edit-source"
                        value={formData.source}
                        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-category">Kategorie *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger id="edit-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-excerpt">Kurzbeschreibung *</Label>
                  <Textarea
                    id="edit-excerpt"
                    rows={3}
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-content">Artikelinhalt *</Label>
                  <Textarea
                    id="edit-content"
                    rows={10}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  />
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-muted-foreground mb-2" style={{ fontSize: '0.875rem' }}>
                      <strong>Formatierungs-Tipps:</strong>
                    </p>
                    <ul className="text-muted-foreground space-y-1" style={{ fontSize: '0.75rem' }}>
                      <li>• Überschriften: <code>## Überschrift</code> oder <code>### Unterüberschrift</code></li>
                      <li>• Fettdruck: <code>**Fetter Text**</code></li>
                      <li>• Aufzählungen: <code>- Listenpunkt</code></li>
                    </ul>
                  </div>
                </div>

                {selectedArticle && (
                  <div className="pt-4 space-y-2">
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div>
                        <p className="mb-1">Status:</p>
                        <Badge variant={selectedArticle.status === 'published' ? 'default' : 'secondary'}>
                          {selectedArticle.status === 'published' ? (
                            <><CheckCircle2 className="h-3 w-3 mr-1" /> Veröffentlicht</>
                          ) : (
                            <><Clock className="h-3 w-3 mr-1" /> Wartet auf Freigabe</>
                          )}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                          {selectedArticle.type === "intern" ? "Autor:" : "Quelle:"}
                        </p>
                        <p>{selectedArticle.author || selectedArticle.source}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Medien & Bilder Tab */}
            <TabsContent value="media" className="overflow-y-auto flex-1">
              <div className="space-y-4 pb-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-image">Titelbild</Label>
                  <Input
                    id="edit-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                    Das Titelbild wird in der Artikelübersicht angezeigt
                  </p>
                </div>

                {/* Aktuelles Titelbild */}
                {(formData.imagePreview || selectedArticle?.imageUrl) && (
                  <div className="space-y-2">
                    <Label>Aktuelles Titelbild</Label>
                    <div className="relative aspect-video w-full rounded-lg overflow-hidden border group">
                      <img
                        src={formData.imagePreview || selectedArticle?.imageUrl}
                        alt="Titelbild"
                        className="w-full h-full object-cover"
                      />
                      {formData.imagePreview && (
                        <div className="absolute top-2 right-2">
                          <Badge variant="default">Neu</Badge>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setFormData({ ...formData, imageFile: null, imagePreview: null });
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Bild entfernen
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {!formData.imagePreview && !selectedArticle?.imageUrl && (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Kein Titelbild vorhanden
                    </p>
                    <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                      Lade ein Bild hoch, um dem Artikel ein Titelbild hinzuzufügen
                    </p>
                  </div>
                )}

                <Separator />

                {/* Zusätzliche Bilder - Platzhalter für zukünftige Funktion */}
                <div className="space-y-2">
                  <Label>Weitere Bilder (in Entwicklung)</Label>
                  <div className="p-4 border-2 border-dashed rounded-lg bg-muted/30">
                    <div className="text-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                        Die Funktion zum Hinzufügen weiterer Bilder zum Artikel wird in einer zukünftigen Version verfügbar sein.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleUpdateArticle}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Änderungen speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedArticle && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge variant={selectedArticle.type === "intern" ? "default" : "secondary"}>
                    {selectedArticle.type === "intern" ? "Vereinsartikel" : "Pressebericht"}
                  </Badge>
                  <Badge variant="outline">{selectedArticle.category}</Badge>
                  {selectedArticle.status === "pending" && (
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" />
                      Wartet auf Freigabe
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-2xl pr-8">{selectedArticle.title}</DialogTitle>
                <DialogDescription className="flex flex-col gap-2 pt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>{selectedArticle.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4" />
                    <span>
                      {selectedArticle.type === "intern" 
                        ? `Autor: ${selectedArticle.author}`
                        : `Quelle: ${selectedArticle.source || selectedArticle.author}`
                      }
                    </span>
                  </div>
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6">
                {selectedArticle.imageUrl && (
                  <div className="mb-6 rounded-lg overflow-hidden">
                    <img
                      src={selectedArticle.imageUrl}
                      alt={selectedArticle.title}
                      className="w-full"
                    />
                  </div>
                )}

                <div className="prose prose-sm max-w-none">
                  <p className="text-lg mb-4">{selectedArticle.excerpt}</p>
                  {selectedArticle.content && selectedArticle.content.split('\n').map((paragraph: string, index: number) => {
                    if (paragraph.startsWith('## ')) {
                      return <h2 key={index} className="mt-6 mb-3">{paragraph.replace('## ', '')}</h2>;
                    }
                    if (paragraph.startsWith('### ')) {
                      return <h3 key={index} className="mt-4 mb-2">{paragraph.replace('### ', '')}</h3>;
                    }
                    if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                      return <p key={index} className="mb-3"><strong>{paragraph.replace(/\*\*/g, '')}</strong></p>;
                    }
                    if (paragraph.startsWith('- ')) {
                      return <li key={index} className="ml-4">{paragraph.replace('- ', '')}</li>;
                    }
                    if (paragraph.trim() === '') {
                      return null;
                    }
                    return <p key={index} className="mb-3 text-muted-foreground">{paragraph}</p>;
                  })}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <AlertDialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Artikel freigeben?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du den Artikel "{articleToProcess?.title}" freigeben? 
              Er wird dann auf der öffentlichen Presseberichte-Seite angezeigt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {articleToProcess && (
            <div className="my-4 p-4 bg-muted rounded-lg">
              <h4 className="mb-2">{articleToProcess.title}</h4>
              <p className="text-muted-foreground mb-2" style={{ fontSize: '0.875rem' }}>
                {articleToProcess.excerpt}
              </p>
              <div className="flex gap-2">
                <Badge variant={articleToProcess.type === "intern" ? "default" : "secondary"}>
                  {articleToProcess.type === "intern" ? "Vereinsartikel" : "Pressebericht"}
                </Badge>
                <Badge variant="outline">{articleToProcess.category}</Badge>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApproveArticle}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Freigeben
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Artikel ablehnen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du den Artikel "{articleToProcess?.title}" ablehnen? 
              Der Verfasser wird über die Ablehnung benachrichtigt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <Label htmlFor="reject-reason">Grund der Ablehnung (optional)</Label>
            <Textarea
              id="reject-reason"
              placeholder="Erkläre kurz, warum der Artikel abgelehnt wurde..."
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRejectReason("")}>
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectArticle}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Ablehnen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Artikel wirklich löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Der Artikel wird permanent gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {articleToDelete && (
            <div className="my-4 p-4 bg-muted rounded-lg">
              <h4 className="mb-2">{articleToDelete.title}</h4>
              <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                {articleToDelete.date} • {articleToDelete.author}
              </p>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteArticle}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
