import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { Separator } from "../../components/ui/separator";
import { 
  FileText, 
  Check, 
  X, 
  Eye, 
  Calendar, 
  User, 
  AlertCircle,
  Clock,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Ban,
  BookOpen,
  TrendingUp,
  Users,
  MessageSquare,
  Image as ImageIcon,
  Tag,
  Eye as ViewIcon,
  Globe,
  Lock
} from "lucide-react";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { toast } from "sonner";
import {
  getAllArticles,
  approveArticle,
  rejectArticle,
  deleteArticle,
  createArticle,
  updateArticle,
  Article,
  CreateArticleData
} from "../../lib/api/articles.service";

// Form Data Interface
interface ArticleFormData {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string;
  isPublic: boolean;
  isBoardArticle: boolean;
  publishDate: string;
}

export function ArtikelPage() {
  // State
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Form State
  const [formData, setFormData] = useState<ArticleFormData>({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    tags: "",
    isPublic: false,
    isBoardArticle: false,
    publishDate: new Date().toISOString().split('T')[0]
  });

  // Load Articles
  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await getAllArticles();
      setArticles(data);
      setOfflineMode(false);
    } catch (error) {
      // Bei Netzwerkfehler: Mock-Daten verwenden (kein Error-Log)
      console.log("Backend nicht erreichbar - wechsle zu Offline-Modus");
      setOfflineMode(true);
      toast.info("Backend nicht erreichbar - Zeige Beispieldaten");
      setArticles(getMockArticles());
    } finally {
      setLoading(false);
    }
  };

  // Mock Articles für Offline-Betrieb
  const getMockArticles = (): Article[] => {
    return [
      {
        id: 1,
        author_id: 1,
        author_first_name: "Thomas",
        author_last_name: "Müller",
        title: "Erfolgreiche Vereinsmeisterschaft 2024",
        content: "Die diesjährige Vereinsmeisterschaft war ein voller Erfolg. Bei perfektem Flugwetter konnten alle geplanten Wettbewerbe durchgeführt werden. Über 30 Teilnehmer zeigten ihr Können in verschiedenen Disziplinen.\n\nBesonders beeindruckend waren die Kunstflug-Vorführungen und die Präzisionslandungen. Der Verein freut sich über die große Beteiligung und die sportliche Atmosphäre.",
        excerpt: "Bei perfektem Wetter fand unsere Vereinsmeisterschaft mit über 30 Teilnehmern statt.",
        category: "Veranstaltung",
        tags: "Wettbewerb,Meisterschaft,Kunstflug",
        publish_date: "2024-10-20",
        is_featured: true,
        is_public: true,
        is_board_article: false,
        status: "pending",
        view_count: 0,
        created_at: "2024-10-18T10:30:00Z",
        updated_at: "2024-10-18T10:30:00Z"
      },
      {
        id: 2,
        author_id: 2,
        author_first_name: "Anna",
        author_last_name: "Schmidt",
        title: "Wichtige Informationen zur Jahreshauptversammlung",
        content: "Der Vorstand lädt alle Mitglieder herzlich zur Jahreshauptversammlung 2024 ein.\n\nTermin: Samstag, 15. November 2024, 18:00 Uhr\nOrt: Vereinsheim Flugmodellsportverein Dingden\n\nTagesordnung:\n1. Begrüßung und Feststellung der Beschlussfähigkeit\n2. Bericht des Vorstands\n3. Kassenbericht\n4. Entlastung des Vorstands\n5. Haushaltsplan 2025\n6. Verschiedenes\n\nWir freuen uns auf zahlreiches Erscheinen!",
        excerpt: "Einladung zur Jahreshauptversammlung am 15. November 2024.",
        category: "Sonstiges",
        tags: "Vorstand,Jahreshauptversammlung,Termin",
        publish_date: "2024-10-15",
        is_featured: true,
        is_public: false,
        is_board_article: true,
        status: "pending",
        view_count: 0,
        created_at: "2024-10-15T14:20:00Z",
        updated_at: "2024-10-15T14:20:00Z"
      },
      {
        id: 3,
        author_id: 3,
        author_first_name: "Lisa",
        author_last_name: "Hoffmann",
        title: "Sommerfest 2024 - Ein großartiger Tag",
        content: "Das Sommerfest unseres Vereins war auch dieses Jahr wieder ein Highlight. Über 100 Gäste genossen die Vorführungen und das gesellige Beisammensein.\n\nBei strahlendem Sonnenschein wurden verschiedene Flugmodelle präsentiert. Für das leibliche Wohl war bestens gesorgt, und die Kinder konnten sich beim Basteln von kleinen Modellen versuchen.",
        excerpt: "Über 100 Gäste feierten mit uns bei unserem Sommerfest.",
        category: "Veranstaltung",
        tags: "Fest,Sommer,Familie",
        publish_date: "2024-08-10",
        is_featured: true,
        is_public: true,
        is_board_article: false,
        status: "published",
        approved_by: 1,
        approver_first_name: "Max",
        approver_last_name: "Weber",
        approved_at: "2024-08-11T09:00:00Z",
        view_count: 245,
        created_at: "2024-08-10T16:45:00Z",
        updated_at: "2024-08-11T09:00:00Z"
      },
      {
        id: 4,
        author_id: 4,
        author_first_name: "Michael",
        author_last_name: "Becker",
        title: "Interne Mitgliederliste aktualisiert",
        content: "Die Mitgliederliste wurde aktualisiert. Bitte überprüft eure Kontaktdaten im Mitgliederbereich.\n\nBei Fragen wendet euch an den Vorstand.",
        excerpt: "Mitgliederliste aktualisiert - bitte Daten prüfen.",
        category: "Sonstiges",
        tags: "Mitglieder,Intern,Aktualisierung",
        publish_date: "2024-01-05",
        is_featured: false,
        is_public: false,
        is_board_article: false,
        status: "rejected",
        rejection_reason: "Der Artikel ist zu kurz und enthält keine relevanten Informationen für ein Veröffentlichung.",
        view_count: 5,
        created_at: "2024-01-05T11:15:00Z",
        updated_at: "2024-01-06T08:30:00Z"
      },
      {
        id: 5,
        author_id: 1,
        author_first_name: "Thomas",
        author_last_name: "Müller",
        title: "Erfolgreiche Teilnahme am Landeswettbewerb",
        content: "Unser Verein hat beim diesjährigen Landeswettbewerb hervorragend abgeschnitten. Drei unserer Mitglieder konnten sich Podiumsplätze sichern.\n\nIn der Kategorie Kunstflug erreichte Peter Schneider den ersten Platz. Lisa Hoffmann wurde Zweite in der Segelflug-Klasse. Ein großartiger Erfolg für unseren Verein!",
        excerpt: "Drei Podiumsplätze beim Landeswettbewerb.",
        category: "Wettbewerb",
        tags: "Wettbewerb,Erfolg,Landesmeisterschaft",
        publish_date: "2024-09-15",
        is_featured: true,
        is_public: true,
        is_board_article: false,
        status: "published",
        approved_by: 1,
        approver_first_name: "Max",
        approver_last_name: "Weber",
        approved_at: "2024-09-16T10:00:00Z",
        view_count: 189,
        created_at: "2024-09-15T18:20:00Z",
        updated_at: "2024-09-16T10:00:00Z"
      }
    ];
  };

  // Categories
  const categories = ["Veranstaltung", "Jugendarbeit", "Technik", "Wettbewerb", "Platzpflege", "Sonstiges"];

  // Status Helper
  const getStatusBadge = (status: Article["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-700 bg-yellow-50 dark:bg-yellow-950/30">
            <Clock className="h-3 w-3" />
            Ausstehend
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="gap-1 border-green-500 text-green-700 bg-green-50 dark:bg-green-950/30">
            <Check className="h-3 w-3" />
            Genehmigt
          </Badge>
        );
      case "published":
        return (
          <Badge variant="outline" className="gap-1 border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-950/30">
            <BookOpen className="h-3 w-3" />
            Veröffentlicht
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="gap-1 border-red-500 text-red-700 bg-red-50 dark:bg-red-950/30">
            <X className="h-3 w-3" />
            Abgelehnt
          </Badge>
        );
      case "draft":
        return (
          <Badge variant="outline" className="gap-1">
            <FileText className="h-3 w-3" />
            Entwurf
          </Badge>
        );
    }
  };

  // Visibility Badge Helper
  const getVisibilityBadge = (isPublic: boolean) => {
    if (isPublic) {
      return (
        <Badge variant="outline" className="gap-1 border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-950/30">
          <Globe className="h-3 w-3" />
          Öffentlich
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="gap-1 border-purple-500 text-purple-700 bg-purple-50 dark:bg-purple-950/30">
          <Lock className="h-3 w-3" />
          Nur Intern
        </Badge>
      );
    }
  };

  // Author Name Helper
  const getAuthorName = (article: Article) => {
    if (article.is_board_article) {
      return "Der Vorstand";
    }
    return `${article.author_first_name} ${article.author_last_name}`;
  };

  // Format Date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Filter & Search
  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      // Tab-Filter
      if (activeTab === "pending" && article.status !== "pending") return false;
      if (activeTab === "approved" && article.status !== "approved" && article.status !== "published") return false;
      if (activeTab === "rejected" && article.status !== "rejected") return false;
      
      // Category-Filter
      if (categoryFilter !== "all" && article.category !== categoryFilter) return false;
      
      // Suche
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          article.title.toLowerCase().includes(search) ||
          article.content.toLowerCase().includes(search) ||
          article.author_first_name.toLowerCase().includes(search) ||
          article.author_last_name.toLowerCase().includes(search) ||
          article.category?.toLowerCase().includes(search)
        );
      }
      
      return true;
    }).sort((a, b) => {
      // Sortiere nach Erstellungsdatum: neueste zuerst
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [articles, activeTab, categoryFilter, searchTerm]);

  // Statistiken
  const stats = useMemo(() => {
    return {
      total: articles.length,
      pending: articles.filter(a => a.status === 'pending').length,
      approved: articles.filter(a => a.status === 'approved' || a.status === 'published').length,
      rejected: articles.filter(a => a.status === 'rejected').length,
      totalViews: articles.reduce((sum, a) => sum + a.view_count, 0),
    };
  }, [articles]);

  // Handlers
  const handleApprove = async (article: Article) => {
    try {
      await approveArticle(article.id);
      toast.success(`Artikel "${article.title}" wurde genehmigt`);
      await loadArticles();
      setDetailDialogOpen(false);
    } catch (error) {
      // Offline-Modus: Lokale Änderung (kein Error-Log)
      console.log("Offline-Modus: Lokale Änderung wird durchgeführt");
      setArticles(articles.map(a => 
        a.id === article.id 
          ? { ...a, status: 'approved' as const, approved_at: new Date().toISOString() }
          : a
      ));
      toast.warning(`Artikel genehmigt (Offline-Modus - nicht gespeichert)`);
      setDetailDialogOpen(false);
    }
  };

  const handleReject = async () => {
    if (!selectedArticle || !rejectionReason.trim()) return;
    
    try {
      await rejectArticle(selectedArticle.id, rejectionReason);
      toast.success(`Artikel "${selectedArticle.title}" wurde abgelehnt`);
      await loadArticles();
      setRejectDialogOpen(false);
      setDetailDialogOpen(false);
      setRejectionReason("");
    } catch (error) {
      // Offline-Modus: Lokale Änderung (kein Error-Log)
      console.log("Offline-Modus: Lokale Änderung wird durchgeführt");
      setArticles(articles.map(a => 
        a.id === selectedArticle.id 
          ? { ...a, status: 'rejected' as const, rejection_reason: rejectionReason }
          : a
      ));
      toast.warning(`Artikel abgelehnt (Offline-Modus - nicht gespeichert)`);
      setRejectDialogOpen(false);
      setDetailDialogOpen(false);
      setRejectionReason("");
    }
  };

  const handleDelete = async () => {
    if (!selectedArticle) return;
    
    try {
      await deleteArticle(selectedArticle.id);
      toast.success(`Artikel "${selectedArticle.title}" wurde gelöscht`);
      await loadArticles();
      setDeleteDialogOpen(false);
      setDetailDialogOpen(false);
      setSelectedArticle(null);
    } catch (error) {
      // Offline-Modus: Lokale Änderung (kein Error-Log)
      console.log("Offline-Modus: Lokale Änderung wird durchgeführt");
      setArticles(articles.filter(a => a.id !== selectedArticle.id));
      toast.warning(`Artikel gelöscht (Offline-Modus - nicht gespeichert)`);
      setDeleteDialogOpen(false);
      setDetailDialogOpen(false);
      setSelectedArticle(null);
    }
  };

  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Bitte Titel und Inhalt eingeben");
      return;
    }

    try {
      const createData: CreateArticleData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        category: formData.category,
        tags: formData.tags,
        isPublic: formData.isPublic,
        isBoardArticle: formData.isBoardArticle,
        publishDate: formData.publishDate
      };

      await createArticle(createData);
      toast.success("Artikel wurde erstellt");
      await loadArticles();
      setCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      // Offline-Modus: Lokale Änderung (kein Error-Log)
      console.log("Offline-Modus: Lokale Änderung wird durchgeführt");
      const newArticle: Article = {
        id: Date.now(),
        author_id: 1,
        author_first_name: "Demo",
        author_last_name: "User",
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        category: formData.category,
        tags: formData.tags,
        publish_date: formData.publishDate,
        is_featured: false,
        is_public: formData.isPublic,
        is_board_article: formData.isBoardArticle,
        status: 'draft',
        view_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setArticles([newArticle, ...articles]);
      toast.warning("Artikel erstellt (Offline-Modus - nicht gespeichert)");
      setCreateDialogOpen(false);
      resetForm();
    }
  };

  const handleUpdate = async () => {
    if (!selectedArticle || !formData.title.trim() || !formData.content.trim()) {
      toast.error("Bitte Titel und Inhalt eingeben");
      return;
    }

    try {
      const updateData: Partial<CreateArticleData> = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        category: formData.category,
        tags: formData.tags,
        isPublic: formData.isPublic,
        isBoardArticle: formData.isBoardArticle,
        publishDate: formData.publishDate
      };

      await updateArticle(selectedArticle.id, updateData);
      toast.success("Artikel wurde aktualisiert");
      await loadArticles();
      setEditDialogOpen(false);
      setSelectedArticle(null);
      resetForm();
    } catch (error) {
      // Offline-Modus: Lokale Änderung (kein Error-Log)
      console.log("Offline-Modus: Lokale Änderung wird durchgeführt");
      setArticles(articles.map(a => 
        a.id === selectedArticle.id 
          ? {
              ...a,
              title: formData.title,
              content: formData.content,
              excerpt: formData.excerpt,
              category: formData.category,
              tags: formData.tags,
              is_public: formData.isPublic,
              is_board_article: formData.isBoardArticle,
              publish_date: formData.publishDate,
              updated_at: new Date().toISOString()
            }
          : a
      ));
      toast.warning("Artikel aktualisiert (Offline-Modus - nicht gespeichert)");
      setEditDialogOpen(false);
      setSelectedArticle(null);
      resetForm();
    }
  };

  const openDetailDialog = (article: Article) => {
    setSelectedArticle(article);
    setDetailDialogOpen(true);
  };

  const openEditDialog = (article: Article) => {
    setSelectedArticle(article);
    setFormData({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt || "",
      category: article.category || "",
      tags: article.tags || "",
      isPublic: article.is_public,
      isBoardArticle: article.is_board_article,
      publishDate: article.publish_date ? article.publish_date.split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setEditDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setCreateDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      excerpt: "",
      category: "",
      tags: "",
      isPublic: false,
      isBoardArticle: false,
      publishDate: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="mb-2">Artikel-Verwaltung</h2>
          <p className="text-muted-foreground">
            Prüfe und genehmige Presseberichte von Mitgliedern
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Neuer Artikel
        </Button>
      </div>

      {/* Offline-Modus Alert */}
      {offlineMode && (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/30">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900 dark:text-blue-200">
            <strong>Offline-Modus:</strong> Backend nicht erreichbar. Änderungen werden nur lokal angezeigt und nicht gespeichert.
          </AlertDescription>
        </Alert>
      )}

      {/* Alert für ausstehende Artikel */}
      {stats.pending > 0 && !offlineMode && (
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/30">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-900 dark:text-amber-200">
            <strong>{stats.pending} {stats.pending === 1 ? 'Artikel wartet' : 'Artikel warten'}</strong> auf deine Freigabe.
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Gesamt</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Alle Artikel
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Ausstehend</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Zu prüfen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Genehmigt</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">
              Veröffentlicht
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Aufrufe</CardTitle>
            <ViewIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.totalViews}</div>
            <p className="text-xs text-muted-foreground">
              Gesamt-Views
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Artikel durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Kategorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kategorien</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">
            Ausstehend ({articles.filter(a => a.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Genehmigt ({articles.filter(a => a.status === 'approved' || a.status === 'published').length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Abgelehnt ({articles.filter(a => a.status === 'rejected').length})
          </TabsTrigger>
          <TabsTrigger value="all">
            Alle ({articles.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-4 text-muted-foreground">Lade Artikel...</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="mb-2">Keine Artikel gefunden</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  {searchTerm || categoryFilter !== "all"
                    ? "Keine Artikel entsprechen deinen Filterkriterien."
                    : "Es sind noch keine Artikel vorhanden."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredArticles.map((article) => (
                <Card 
                  key={article.id}
                  className={article.status === 'pending' ? "border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/10" : ""}
                >
                  <CardHeader>
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <CardTitle className="text-lg break-words">{article.title}</CardTitle>
                          {getStatusBadge(article.status)}
                          {getVisibilityBadge(article.is_public)}
                          {article.is_featured && (
                            <Badge variant="outline" className="gap-1">
                              <TrendingUp className="h-3 w-3" />
                              Featured
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 flex-shrink-0" />
                            <span>{getAuthorName(article)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span>{formatDate(article.created_at)}</span>
                          </div>
                          {article.category && (
                            <Badge variant="outline" className="gap-1">
                              <Tag className="h-3 w-3" />
                              {article.category}
                            </Badge>
                          )}
                          {article.view_count > 0 && (
                            <div className="flex items-center gap-1">
                              <ViewIcon className="h-3 w-3" />
                              <span>{article.view_count} Aufrufe</span>
                            </div>
                          )}
                        </div>
                        {article.excerpt && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {article.excerpt}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="gap-2"
                          onClick={() => openDetailDialog(article)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline">Ansehen</span>
                        </Button>
                        {article.status === 'pending' && (
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 gap-2"
                            onClick={() => handleApprove(article)}
                          >
                            <Check className="h-4 w-4" />
                            <span className="hidden sm:inline">Genehmigen</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Artikel-Details</DialogTitle>
            <DialogDescription>
              Vollständige Ansicht des Artikels mit allen Details und Aktionen
            </DialogDescription>
          </DialogHeader>
          {selectedArticle && (
            <div className="space-y-6">
              {/* Header Info */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <h3>{selectedArticle.title}</h3>
                  {getStatusBadge(selectedArticle.status)}
                  {getVisibilityBadge(selectedArticle.is_public)}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{getAuthorName(selectedArticle)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(selectedArticle.created_at)}</span>
                  </div>
                  {selectedArticle.category && (
                    <Badge variant="outline">{selectedArticle.category}</Badge>
                  )}
                  {selectedArticle.view_count > 0 && (
                    <div className="flex items-center gap-1">
                      <ViewIcon className="h-4 w-4" />
                      <span>{selectedArticle.view_count} Aufrufe</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Visibility Info */}
              <div className={`rounded-lg p-4 border ${
                selectedArticle.is_public 
                  ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900'
                  : 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900'
              }`}>
                <div className="flex items-start gap-3">
                  {selectedArticle.is_public ? (
                    <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  ) : (
                    <Lock className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium mb-1 ${
                      selectedArticle.is_public 
                        ? 'text-blue-900 dark:text-blue-100'
                        : 'text-purple-900 dark:text-purple-100'
                    }`}>
                      {selectedArticle.is_public ? 'Öffentlicher Artikel' : 'Interner Artikel'}
                    </p>
                    <p className={`text-sm ${
                      selectedArticle.is_public 
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-purple-700 dark:text-purple-300'
                    }`}>
                      {selectedArticle.is_public 
                        ? 'Dieser Artikel ist für alle Besucher auf der öffentlichen Website sichtbar.'
                        : 'Dieser Artikel ist nur für eingeloggte Mitglieder im Mitgliederbereich sichtbar.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Excerpt */}
              {selectedArticle.excerpt && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <Label className="text-sm text-muted-foreground mb-2 block">Zusammenfassung</Label>
                  <p className="text-sm italic">{selectedArticle.excerpt}</p>
                </div>
              )}

              {/* Content */}
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Inhalt</Label>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{selectedArticle.content}</p>
                </div>
              </div>

              {/* Tags */}
              {selectedArticle.tags && (
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedArticle.tags.split(',').map((tag, index) => (
                      <Badge key={index} variant="outline">{tag.trim()}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedArticle.status === 'rejected' && selectedArticle.rejection_reason && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <Label className="text-sm text-destructive mb-2 block">Ablehnungsgrund</Label>
                  <p className="text-sm">{selectedArticle.rejection_reason}</p>
                </div>
              )}

              {/* Approval Info */}
              {selectedArticle.approved_at && selectedArticle.approver_first_name && (
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-4">
                  <Label className="text-sm text-green-700 dark:text-green-400 mb-2 block">Genehmigt</Label>
                  <p className="text-sm">
                    Von {selectedArticle.approver_first_name} {selectedArticle.approver_last_name} am {formatDate(selectedArticle.approved_at)}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                {selectedArticle.status === 'pending' && (
                  <>
                    <Button 
                      className="flex-1 sm:flex-initial gap-2 bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprove(selectedArticle)}
                    >
                      <Check className="h-4 w-4" />
                      Genehmigen
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1 sm:flex-initial gap-2 text-destructive hover:text-destructive"
                      onClick={() => {
                        setDetailDialogOpen(false);
                        setRejectDialogOpen(true);
                      }}
                    >
                      <Ban className="h-4 w-4" />
                      Ablehnen
                    </Button>
                  </>
                )}
                <Button 
                  variant="outline"
                  className="flex-1 sm:flex-initial gap-2"
                  onClick={() => {
                    setDetailDialogOpen(false);
                    openEditDialog(selectedArticle);
                  }}
                >
                  <Edit className="h-4 w-4" />
                  Bearbeiten
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1 sm:flex-initial gap-2 text-destructive hover:text-destructive"
                  onClick={() => {
                    setDetailDialogOpen(false);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Löschen
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1 sm:flex-initial sm:ml-auto"
                  onClick={() => setDetailDialogOpen(false)}
                >
                  Schließen
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <Ban className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <DialogTitle>Artikel ablehnen</DialogTitle>
                <DialogDescription>
                  Der Autor wird über die Ablehnung benachrichtigt
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedArticle && (
            <div className="space-y-4">
              {/* Artikel Info */}
              <div className="bg-muted/50 rounded-lg p-4 border">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium mb-1">{selectedArticle.title}</p>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {selectedArticle.author_first_name} {selectedArticle.author_last_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(selectedArticle.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <Label htmlFor="rejectionReason" className="flex items-center gap-2">
                  Ablehnungsgrund *
                  <span className="text-xs text-muted-foreground">(wird dem Autor mitgeteilt)</span>
                </Label>
                <Textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="z.B. Der Inhalt entspricht nicht unseren Richtlinien..."
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Bitte gib einen aussagekräftigen Grund an
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
                <div className="flex gap-2">
                  <div className="text-blue-600 dark:text-blue-400 mt-0.5">ℹ️</div>
                  <div className="text-sm text-blue-900 dark:text-blue-100">
                    <p className="font-medium mb-1">Was passiert beim Ablehnen?</p>
                    <ul className="text-xs space-y-1 text-blue-700 dark:text-blue-300">
                      <li>• Der Artikel wird als "Abgelehnt" markiert</li>
                      <li>• Der Autor erhält eine Benachrichtigung</li>
                      <li>• Der Ablehnungsgrund wird gespeichert</li>
                      <li>• Der Artikel wird nicht veröffentlicht</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button 
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectionReason("");
              }}
              className="flex-1 sm:flex-initial"
            >
              Zurück
            </Button>
            <Button 
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || rejectionReason.trim().length < 10}
              className="flex-1 sm:flex-initial gap-2"
            >
              <Ban className="h-4 w-4" />
              Artikel ablehnen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Artikel löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Bist du sicher, dass du diesen Artikel endgültig löschen möchtest? 
              Diese Aktion kann nicht rückgängig gemacht werden.
              {selectedArticle && (
                <span className="block mt-2 font-medium text-foreground">
                  "{selectedArticle.title}"
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create/Edit Dialog */}
      <Dialog open={createDialogOpen || editDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setCreateDialogOpen(false);
          setEditDialogOpen(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editDialogOpen ? 'Artikel bearbeiten' : 'Neuer Artikel'}</DialogTitle>
            <DialogDescription>
              {editDialogOpen ? 'Bearbeite die Details des Artikels' : 'Erstelle einen neuen Presseartikel'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="z.B. Erfolgreiche Vereinsmeisterschaft 2024"
              />
            </div>

            {/* Category & Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Kategorie</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Kategorie wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="z.B. Wettbewerb, Erfolg, 2024"
                />
                <p className="text-xs text-muted-foreground">Mit Komma getrennt</p>
              </div>
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <Label htmlFor="excerpt">Zusammenfassung</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Kurze Zusammenfassung für die Vorschau..."
                rows={2}
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Inhalt *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Der vollständige Artikel-Text..."
                rows={10}
              />
            </div>

            {/* Publish Date */}
            <div className="space-y-2">
              <Label htmlFor="publishDate">Veröffentlichungsdatum</Label>
              <Input
                id="publishDate"
                type="date"
                value={formData.publishDate}
                onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
              />
            </div>

            {/* Visibility Settings */}
            <div className="space-y-3">
              <Label>Sichtbarkeit</Label>
              <div className={`rounded-lg p-4 border transition-colors ${
                formData.isPublic 
                  ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900'
                  : 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900'
              }`}>
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="isPublic"
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked as boolean })}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="isPublic" className="cursor-pointer flex items-center gap-2 mb-1">
                      {formData.isPublic ? (
                        <>
                          <Globe className="h-4 w-4" />
                          Öffentlich sichtbar
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" />
                          Nur für Mitglieder
                        </>
                      )}
                    </Label>
                    <p className={`text-xs ${
                      formData.isPublic 
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-purple-700 dark:text-purple-300'
                    }`}>
                      {formData.isPublic 
                        ? 'Der Artikel wird auf der öffentlichen Website für alle Besucher angezeigt.'
                        : 'Der Artikel ist nur für eingeloggte Mitglieder im Mitgliederbereich sichtbar.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Board Article Checkbox */}
            <div className="space-y-3">
              <Label>Autorenangabe</Label>
              <div className="rounded-lg p-4 border bg-muted/50">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="isBoardArticle"
                    checked={formData.isBoardArticle}
                    onCheckedChange={(checked) => setFormData({ ...formData, isBoardArticle: checked as boolean })}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="isBoardArticle" className="cursor-pointer flex items-center gap-2 mb-1">
                      <Users className="h-4 w-4" />
                      Als "Der Vorstand" veröffentlichen
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {formData.isBoardArticle 
                        ? 'Der Artikel wird mit "Der Vorstand" als Autor angezeigt (anonymisiert).'
                        : 'Der Artikel wird mit deinem Namen als Autor angezeigt.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false);
                setEditDialogOpen(false);
                resetForm();
              }}
            >
              Abbrechen
            </Button>
            <Button onClick={editDialogOpen ? handleUpdate : handleCreate}>
              {editDialogOpen ? 'Aktualisieren' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
