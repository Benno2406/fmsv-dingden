import { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "../../components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Separator } from "../../components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
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
import { 
  Upload,
  AlertCircle,
  Activity,
  Users,
  Video,
  Image as ImageIcon,
  Plus,
  CheckCircle2,
  Clock as ClockIcon,
  Eye,
  Filter,
  Edit,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ExternalLink,
  Play
} from "lucide-react";

// Mock data
const publicAlbums = [
  { 
    id: "pub1",
    title: "Vereinsmeisterschaft 2024", 
    date: "15. Mai 2024", 
    images: 42,
    creator: "Thomas Müller",
    coverImage: "https://images.unsplash.com/photo-1642099415153-e5a9692a77f5?w=800&h=600&fit=crop",
    albumImages: [
      { 
        id: "img1", 
        url: "https://images.unsplash.com/photo-1642099415153-e5a9692a77f5?w=1200",
        uploadedBy: "Thomas Müller"
      },
      { 
        id: "img2", 
        url: "https://images.unsplash.com/photo-1630097216458-da5e60f32867?w=1200",
        uploadedBy: "Max Mustermann"
      },
      { 
        id: "img3", 
        url: "https://images.unsplash.com/photo-1761055277571-afaec795f900?w=1200",
        uploadedBy: "Anna Schmidt"
      },
    ],
    description: "Die besten Momente unserer diesjährigen Vereinsmeisterschaft"
  },
  { 
    id: "pub2",
    title: "Sommerfest 2024", 
    date: "10. Juli 2024", 
    images: 35,
    creator: "Anna Schmidt",
    coverImage: "https://images.unsplash.com/photo-1760135436773-af6c70a4dff4?w=800&h=600&fit=crop",
    albumImages: [
      { 
        id: "img4", 
        url: "https://images.unsplash.com/photo-1760135436773-af6c70a4dff4?w=1200",
        uploadedBy: "Anna Schmidt"
      },
      { 
        id: "img5", 
        url: "https://images.unsplash.com/photo-1630097216458-da5e60f32867?w=1200",
        uploadedBy: "Max Mustermann"
      },
    ],
    description: "Unser Sommerfest mit Grillen und Flugvorführungen"
  },
];

const myAlbums = [
  { 
    id: "my1",
    title: "Schnupperflug Juni", 
    date: "22. Juni 2024", 
    images: 28,
    status: "pending" as const,
    coverImage: "https://images.unsplash.com/photo-1642099415153-e5a9692a77f5?w=800&h=600&fit=crop",
    albumImages: [
      { 
        id: "myimg1", 
        url: "https://images.unsplash.com/photo-1642099415153-e5a9692a77f5?w=1200",
        uploadedBy: "Max Mustermann"
      },
      { 
        id: "myimg2", 
        url: "https://images.unsplash.com/photo-1630097216458-da5e60f32867?w=1200",
        uploadedBy: "Max Mustermann"
      },
    ],
    description: "Tolle Schnupperflüge mit neuen Interessenten"
  },
  { 
    id: "my2",
    title: "Mein erstes F3A Training", 
    date: "5. August 2024", 
    images: 15,
    status: "approved" as const,
    coverImage: "https://images.unsplash.com/photo-1630097216458-da5e60f32867?w=800&h=600&fit=crop",
    albumImages: [
      { 
        id: "myimg3", 
        url: "https://images.unsplash.com/photo-1630097216458-da5e60f32867?w=1200",
        uploadedBy: "Max Mustermann"
      },
      { 
        id: "myimg4", 
        url: "https://images.unsplash.com/photo-1761055277571-afaec795f900?w=1200",
        uploadedBy: "Max Mustermann"
      },
    ],
    description: "Meine ersten Schritte im Kunstflug"
  },
];

const clubVideos = [
  {
    id: "vid1",
    title: "Vereinsmeisterschaft 2024 - Highlights",
    youtubeId: "dQw4w9WgXcQ",
    date: "15. Mai 2024",
    creator: "Thomas Müller",
    views: 245
  },
  {
    id: "vid2",
    title: "F5J Wettbewerb - Impressionen",
    youtubeId: "9bZkp7q19f0",
    date: "20. Juli 2024",
    creator: "Anna Schmidt",
    views: 189
  },
  {
    id: "vid3",
    title: "Schnupperflug Tag - Die besten Momente",
    youtubeId: "jNQXAC9IVRw",
    date: "10. Juni 2024",
    creator: "Max Mustermann",
    views: 312
  },
];

export function FotoalbenPage() {
  // Album Detail & Lightbox State
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null);
  const [albumDetailOpen, setAlbumDetailOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);

  // Video States
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [submitVideoOpen, setSubmitVideoOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null);

  // Upload States
  const [uploadToAlbumOpen, setUploadToAlbumOpen] = useState(false);
  const [uploadTargetAlbum, setUploadTargetAlbum] = useState<any>(null);
  const [uploadImages, setUploadImages] = useState<File[]>([]);
  const [uploadPreviewUrls, setUploadPreviewUrls] = useState<string[]>([]);
  const [uploadDescription, setUploadDescription] = useState("");

  // Album Edit States
  const [editAlbumOpen, setEditAlbumOpen] = useState(false);
  const [albumToEdit, setAlbumToEdit] = useState<any>(null);
  const [editAlbumTitle, setEditAlbumTitle] = useState("");
  const [editAlbumDescription, setEditAlbumDescription] = useState("");

  // Delete States
  const [deleteImageDialogOpen, setDeleteImageDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<any>(null);
  const [deleteAlbumDialogOpen, setDeleteAlbumDialogOpen] = useState(false);

  // Funktion zum Extrahieren der YouTube Video-ID
  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    
    if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
      return url.trim();
    }
    
    const standardMatch = url.match(/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/);
    if (standardMatch) return standardMatch[1];
    
    const shortMatch = url.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (shortMatch) return shortMatch[1];
    
    const embedMatch = url.match(/(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (embedMatch) return embedMatch[1];
    
    return null;
  };

  const handleVideoUrlChange = (url: string) => {
    setVideoUrl(url);
    const extractedId = extractYouTubeId(url);
    setPreviewVideoId(extractedId);
  };

  const handleSubmitVideo = () => {
    const videoId = extractYouTubeId(videoUrl);
    
    if (!videoId) {
      alert("Bitte gib eine gültige YouTube-URL oder Video-ID ein.");
      return;
    }
    
    if (!videoTitle.trim()) {
      alert("Bitte gib einen Titel für das Video ein.");
      return;
    }

    console.log("Video eingereicht:", {
      youtubeId: videoId,
      title: videoTitle,
      description: videoDescription,
      status: "pending"
    });

    setSubmitVideoOpen(false);
    setVideoUrl("");
    setVideoTitle("");
    setVideoDescription("");
    setPreviewVideoId(null);
    
    alert("Video erfolgreich eingereicht! Es wird vom Vorstand geprüft.");
  };

  const handleOpenAlbum = (album: any) => {
    setSelectedAlbum(album);
    setAlbumDetailOpen(true);
  };

  const handleOpenUploadToAlbum = (album: any) => {
    setUploadTargetAlbum(album);
    setUploadToAlbumOpen(true);
  };

  const handleUploadImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    setUploadImages(fileArray);

    const previewUrls = fileArray.map(file => URL.createObjectURL(file));
    setUploadPreviewUrls(previewUrls);
  };

  const handleUploadToAlbum = () => {
    if (uploadImages.length === 0) {
      alert("Bitte wähle mindestens ein Bild aus.");
      return;
    }

    console.log("Bilder zu Album hochgeladen:", {
      albumId: uploadTargetAlbum.id,
      albumTitle: uploadTargetAlbum.title,
      description: uploadDescription,
      imageCount: uploadImages.length,
      status: "pending"
    });

    uploadPreviewUrls.forEach(url => URL.revokeObjectURL(url));

    setUploadToAlbumOpen(false);
    setUploadImages([]);
    setUploadPreviewUrls([]);
    setUploadDescription("");

    alert(`${uploadImages.length} Bilder erfolgreich hochgeladen! Sie werden vom Vorstand geprüft.`);
  };

  const handleOpenLightbox = (index: number) => {
    setLightboxImageIndex(index);
    setLightboxOpen(true);
  };

  const handleNextImage = () => {
    if (selectedAlbum && lightboxImageIndex < selectedAlbum.albumImages.length - 1) {
      setLightboxImageIndex(lightboxImageIndex + 1);
    }
  };

  const handlePrevImage = () => {
    if (lightboxImageIndex > 0) {
      setLightboxImageIndex(lightboxImageIndex - 1);
    }
  };

  // Keyboard Navigation für Lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        handleNextImage();
      } else if (e.key === "ArrowLeft") {
        handlePrevImage();
      } else if (e.key === "Escape") {
        setLightboxOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, lightboxImageIndex, selectedAlbum]);

  const handleOpenEditAlbum = (album: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setAlbumToEdit(album);
    setEditAlbumTitle(album.title);
    setEditAlbumDescription(album.description || "");
    setEditAlbumOpen(true);
  };

  const handleSaveAlbumChanges = () => {
    if (!editAlbumTitle.trim()) {
      alert("Bitte gib einen Titel für das Album ein.");
      return;
    }

    console.log("Album aktualisiert:", {
      albumId: albumToEdit.id,
      oldTitle: albumToEdit.title,
      newTitle: editAlbumTitle,
      newDescription: editAlbumDescription
    });

    setEditAlbumOpen(false);
    setAlbumToEdit(null);
    setEditAlbumTitle("");
    setEditAlbumDescription("");

    alert("Album erfolgreich aktualisiert!");
  };

  const handlePrepareDeleteAlbum = () => {
    setDeleteAlbumDialogOpen(true);
  };

  const handleConfirmDeleteAlbum = () => {
    if (!albumToEdit) return;

    console.log("Album gelöscht:", {
      albumId: albumToEdit.id,
      albumTitle: albumToEdit.title,
      imageCount: albumToEdit.albumImages?.length || 0
    });

    setDeleteAlbumDialogOpen(false);
    setEditAlbumOpen(false);
    setAlbumToEdit(null);
    setEditAlbumTitle("");
    setEditAlbumDescription("");

    alert("Dein Album wurde erfolgreich gelöscht.");
  };

  const handlePrepareDeleteImage = (image: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setImageToDelete(image);
    setDeleteImageDialogOpen(true);
  };

  const handleConfirmDeleteImage = () => {
    if (!imageToDelete) return;

    console.log("Bild gelöscht:", {
      albumId: selectedAlbum?.id,
      imageId: imageToDelete.id,
      imageUrl: imageToDelete.url
    });

    setDeleteImageDialogOpen(false);
    setImageToDelete(null);
    
    alert("Dein Bild wurde erfolgreich gelöscht.");
  };

  const handleOpenVideo = (videoId: string) => {
    setSelectedVideo(videoId);
    setVideoDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2">Fotoalben</h2>
        <p className="text-muted-foreground">
          Erstelle Alben und teile deine Bilder mit dem Verein.
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Hochgeladene Bilder prüfen</AlertTitle>
        <AlertDescription>
          Alle hochgeladenen Bilder werden vom Vorstand geprüft und freigegeben, bevor sie öffentlich sichtbar sind.
        </AlertDescription>
      </Alert>

      {/* Tab Navigation - Mobile optimiert */}
      <Tabs defaultValue="overview" className="w-full">
        {/* Desktop: Grid Layout */}
        <TabsList className="hidden md:grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="overview" className="gap-2">
            <Activity className="h-4 w-4" />
            Übersicht
          </TabsTrigger>
          <TabsTrigger value="allalbums" className="gap-2">
            <Users className="h-4 w-4" />
            Alle Alben
          </TabsTrigger>
          <TabsTrigger value="videos" className="gap-2">
            <Video className="h-4 w-4" />
            Videos
          </TabsTrigger>
          <TabsTrigger value="myalbums" className="gap-2">
            <ImageIcon className="h-4 w-4" />
            Meine Alben
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-2">
            <Plus className="h-4 w-4" />
            Album gründen
          </TabsTrigger>
        </TabsList>

        {/* Mobile: Scrollbare horizontale Liste */}
        <div className="md:hidden mb-6 -mx-6 px-6 overflow-x-auto">
          <TabsList className="inline-flex w-auto gap-2 bg-transparent">
            <TabsTrigger value="overview" className="gap-2 min-w-fit px-4">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Übersicht</span>
            </TabsTrigger>
            <TabsTrigger value="allalbums" className="gap-2 min-w-fit px-4">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Alle Alben</span>
            </TabsTrigger>
            <TabsTrigger value="videos" className="gap-2 min-w-fit px-4">
              <Video className="h-4 w-4" />
              <span className="hidden sm:inline">Videos</span>
            </TabsTrigger>
            <TabsTrigger value="myalbums" className="gap-2 min-w-fit px-4">
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Meine Alben</span>
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-2 min-w-fit px-4">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Neu</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Übersicht Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div>
            <h3>Übersicht</h3>
          </div>

          {/* Statistiken */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-blue-500/10">
                    <ImageIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                      Meine Alben
                    </p>
                    <p className="text-2xl font-medium">{myAlbums.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-green-500/10">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                      Freigegeben
                    </p>
                    <p className="text-2xl font-medium">
                      {myAlbums.filter(a => a.status === 'approved').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-orange-500/10">
                    <ClockIcon className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                      In Prüfung
                    </p>
                    <p className="text-2xl font-medium">
                      {myAlbums.filter(a => a.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="mb-4">Schnellaktionen</h3>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="p-4 rounded-lg bg-blue-500/10">
                      <Upload className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="mb-1">Neues Album erstellen</h4>
                      <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                        Bilder hochladen
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="p-4 rounded-lg bg-purple-500/10">
                      <Users className="h-8 w-8 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="mb-1">Alle Alben ansehen</h4>
                      <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                        {publicAlbums.length} Vereinsalben
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="p-4 rounded-lg bg-red-500/10">
                      <Video className="h-8 w-8 text-red-600" />
                    </div>
                    <div>
                      <h4 className="mb-1">Videos durchstöbern</h4>
                      <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                        {clubVideos.length} Videos verfügbar
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Alle Alben Tab */}
        <TabsContent value="allalbums" className="space-y-4">
          <div>
            <h3>Alle Alben</h3>
          </div>

          <div className="flex gap-2 sm:gap-3">
            <Input 
              placeholder="Alben durchsuchen..." 
              className="flex-1"
            />
            <Button variant="outline" className="gap-2 min-h-10">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {publicAlbums.map((album) => (
              <div 
                key={album.id} 
                className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div 
                  className="aspect-video bg-muted overflow-hidden cursor-pointer"
                  onClick={() => handleOpenAlbum(album)}
                >
                  <img 
                    src={album.coverImage} 
                    alt={album.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h4 className="mb-2">{album.title}</h4>
                  <p className="text-muted-foreground mb-2" style={{ fontSize: '0.875rem' }}>
                    {album.date} · {album.images} Bilder
                  </p>
                  <p className="text-muted-foreground mb-3" style={{ fontSize: '0.75rem' }}>
                    von {album.creator}
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-1 min-h-9"
                      onClick={() => handleOpenAlbum(album)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span className="hidden xs:inline">Ansehen</span>
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1 gap-1 min-h-9"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenUploadToAlbum(album);
                      }}
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span className="hidden xs:inline">Hochladen</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Videos Tab */}
        <TabsContent value="videos" className="space-y-4">
          <div>
            <h3>Videos</h3>
          </div>

          <div className="flex gap-2 sm:gap-3">
            <Input 
              placeholder="Videos durchsuchen..." 
              className="flex-1"
            />
            <Button variant="outline" className="gap-2 min-h-10 hidden sm:flex">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button 
              className="gap-2 min-h-10"
              onClick={() => setSubmitVideoOpen(true)}
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Video einsenden</span>
            </Button>
          </div>

          <Alert>
            <Video className="h-4 w-4" />
            <AlertTitle>Vereinsvideos auf YouTube</AlertTitle>
            <AlertDescription>
              Unsere Videos werden über YouTube gehostet. Klicke auf ein Video, um es direkt hier anzusehen.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {clubVideos.map((video) => (
              <div 
                key={video.id} 
                className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleOpenVideo(video.youtubeId)}
              >
                <div className="aspect-video bg-muted relative">
                  <img 
                    src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                    <div className="h-16 w-16 rounded-full bg-red-600 flex items-center justify-center">
                      <Play className="h-8 w-8 text-white ml-1" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="mb-2">{video.title}</h4>
                  <p className="text-muted-foreground mb-2" style={{ fontSize: '0.875rem' }}>
                    {video.date}
                  </p>
                  <div className="flex items-center justify-between text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                    <span>von {video.creator}</span>
                    <span>{video.views} Aufrufe</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Meine Alben Tab */}
        <TabsContent value="myalbums" className="space-y-4">
          <div>
            <h3>Meine Alben</h3>
          </div>

          {myAlbums.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Du hast noch keine Alben erstellt.
              </p>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Erstes Album erstellen
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {myAlbums.map((album) => (
                <div 
                  key={album.id} 
                  className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div 
                    className="aspect-video bg-muted overflow-hidden cursor-pointer relative"
                    onClick={() => handleOpenAlbum(album)}
                  >
                    <img 
                      src={album.coverImage} 
                      alt={album.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    {album.status === 'pending' && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="gap-1">
                          <ClockIcon className="h-3 w-3" />
                          In Prüfung
                        </Badge>
                      </div>
                    )}
                    {album.status === 'approved' && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="default" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Freigegeben
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="mb-2">{album.title}</h4>
                    <p className="text-muted-foreground mb-3" style={{ fontSize: '0.875rem' }}>
                      {album.date} · {album.images} Bilder
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 gap-1 min-h-9"
                        onClick={() => handleOpenAlbum(album)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span className="hidden xs:inline">Ansehen</span>
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm" 
                        className="gap-1 min-h-9 min-w-9"
                        onClick={(e) => handleOpenEditAlbum(album, e)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Album gründen Tab */}
        <TabsContent value="upload" className="space-y-6">
          <div>
            <h3>Neues Album erstellen</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="album-title">Album-Titel</Label>
              <Input 
                id="album-title"
                placeholder="z.B. Schnupperflug Juni 2025" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="album-date">Datum der Veranstaltung</Label>
              <Input 
                id="album-date"
                type="date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="album-description">Beschreibung (optional)</Label>
              <Textarea 
                id="album-description"
                placeholder="Beschreibe kurz, worum es in diesem Album geht..."
                rows={3}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Bilder hochladen</Label>
            <div className="border-2 border-dashed rounded-lg p-12 text-center hover:bg-muted/50 transition-colors cursor-pointer">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h4 className="mb-2">Bilder hierher ziehen</h4>
              <p className="text-muted-foreground mb-4" style={{ fontSize: '0.875rem' }}>
                oder klicke hier, um Dateien auszuwählen
              </p>
              <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                JPG, PNG oder GIF (max. 10 MB pro Bild)
              </p>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Wichtiger Hinweis</AlertTitle>
            <AlertDescription>
              Dein Album wird nach dem Hochladen vom Vorstand geprüft, bevor es öffentlich sichtbar wird. 
              Bitte stelle sicher, dass du die Einwilligung aller abgebildeten Personen hast.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">
              Abbrechen
            </Button>
            <Button className="flex-1 gap-2">
              <Plus className="h-4 w-4" />
              Album erstellen
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Album Detail Dialog */}
      <Dialog open={albumDetailOpen} onOpenChange={setAlbumDetailOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedAlbum?.title}</DialogTitle>
            <DialogDescription>
              {selectedAlbum?.date} · {selectedAlbum?.images} Bilder · von {selectedAlbum?.creator}
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            {selectedAlbum?.description && (
              <p className="text-muted-foreground mb-6">
                {selectedAlbum.description}
              </p>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {selectedAlbum?.albumImages?.map((image: any, index: number) => (
                <div 
                  key={image.id}
                  className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity relative group"
                  onClick={() => handleOpenLightbox(index)}
                >
                  <img 
                    src={image.url} 
                    alt={`Bild ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {image.uploadedBy === "Max Mustermann" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handlePrepareDeleteImage(image, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95" aria-describedby={undefined}>
          <DialogHeader className="sr-only">
            <DialogTitle>Bildansicht</DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-[95vh] flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            {lightboxImageIndex > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 text-white hover:bg-white/20"
                onClick={handlePrevImage}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
            )}

            <img 
              src={selectedAlbum?.albumImages?.[lightboxImageIndex]?.url}
              alt={`Bild ${lightboxImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {selectedAlbum && lightboxImageIndex < selectedAlbum.albumImages.length - 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 text-white hover:bg-white/20"
                onClick={handleNextImage}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
              {lightboxImageIndex + 1} / {selectedAlbum?.albumImages?.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload to Album Dialog */}
      <Dialog open={uploadToAlbumOpen} onOpenChange={setUploadToAlbumOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Bilder zu Album hinzufügen</DialogTitle>
            <DialogDescription>
              Album: {uploadTargetAlbum?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="upload-images">Bilder auswählen</Label>
              <Input
                id="upload-images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleUploadImagesChange}
              />
            </div>

            {uploadPreviewUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {uploadPreviewUrls.map((url, index) => (
                  <div key={index} className="aspect-square bg-muted rounded-lg overflow-hidden">
                    <img 
                      src={url} 
                      alt={`Vorschau ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="upload-description">Beschreibung (optional)</Label>
              <Textarea
                id="upload-description"
                placeholder="Beschreibe deine Bilder..."
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                rows={3}
              />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Wichtiger Hinweis</AlertTitle>
              <AlertDescription>
                Die hochgeladenen Bilder werden vom Vorstand geprüft, bevor sie im Album erscheinen.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadToAlbumOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleUploadToAlbum}>
              Hochladen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Album Dialog */}
      <Dialog open={editAlbumOpen} onOpenChange={setEditAlbumOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Album bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeite die Details deines Albums
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="edit-album-title">Album-Titel</Label>
              <Input
                id="edit-album-title"
                value={editAlbumTitle}
                onChange={(e) => setEditAlbumTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-album-description">Beschreibung</Label>
              <Textarea
                id="edit-album-description"
                value={editAlbumDescription}
                onChange={(e) => setEditAlbumDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button 
              variant="destructive" 
              onClick={handlePrepareDeleteAlbum}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Album löschen
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditAlbumOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleSaveAlbumChanges}>
                Speichern
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Album Confirmation */}
      <AlertDialog open={deleteAlbumDialogOpen} onOpenChange={setDeleteAlbumDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Album löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du dieses Album wirklich löschen? Alle Bilder in diesem Album werden ebenfalls gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteAlbum}>
              Album löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Image Confirmation */}
      <AlertDialog open={deleteImageDialogOpen} onOpenChange={setDeleteImageDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bild löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du dieses Bild wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteImage}>
              Bild löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Video Player Dialog */}
      <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
        <DialogContent className="max-w-4xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Video abspielen</DialogTitle>
          </DialogHeader>
          <div className="aspect-video">
            {selectedVideo && (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube-nocookie.com/embed/${selectedVideo}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Submit Video Dialog */}
      <Dialog open={submitVideoOpen} onOpenChange={setSubmitVideoOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Video einsenden</DialogTitle>
            <DialogDescription>
              Sende ein YouTube-Video zur Freigabe ein
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="video-url">YouTube-URL oder Video-ID</Label>
              <Input
                id="video-url"
                placeholder="https://www.youtube.com/watch?v=... oder Video-ID"
                value={videoUrl}
                onChange={(e) => handleVideoUrlChange(e.target.value)}
              />
            </div>

            {previewVideoId && (
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img 
                  src={`https://img.youtube.com/vi/${previewVideoId}/maxresdefault.jpg`}
                  alt="Video Vorschau"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="video-title">Titel</Label>
              <Input
                id="video-title"
                placeholder="Titel des Videos"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="video-description">Beschreibung (optional)</Label>
              <Textarea
                id="video-description"
                placeholder="Beschreibe das Video..."
                value={videoDescription}
                onChange={(e) => setVideoDescription(e.target.value)}
                rows={3}
              />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Hinweis</AlertTitle>
              <AlertDescription>
                Das Video wird vom Vorstand geprüft, bevor es in der Galerie erscheint.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitVideoOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSubmitVideo}>
              Video einsenden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
