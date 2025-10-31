import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Dialog,
  DialogContent,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { 
  Image as ImageIcon, 
  Check, 
  X, 
  Eye, 
  Calendar, 
  User, 
  AlertCircle,
  Clock,
  Folder,
  Plus,
  Edit,
  Trash2,
  Upload,
  FolderPlus,
  LayoutGrid,
  FileImage,
  Globe,
  Lock,
  Search,
  Filter,
  ArrowLeft,
  Info,
  Monitor
} from "lucide-react";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { Switch } from "../../components/ui/switch";
import { toast } from "sonner";
import {
  Album,
  Image,
  getAllAlbums,
  getAlbumById,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  approveAlbum,
  publishAlbum,
  getAllImages,
  uploadImages,
  approveImage,
  rejectImage,
  updateImage,
  deleteImage,
} from "../../lib/api/images.service";

// API URL für Bild-Pfade
const API_URL = (() => {
  try {
    return (import.meta.env?.VITE_API_URL as string) || 'http://localhost:3001';
  } catch {
    return 'http://localhost:3001';
  }
})();

// Hilfsfunktion zum Konstruieren der Bild-URL
const getImageUrl = (filePath: string): string => {
  // Wenn der Pfad bereits eine vollständige URL ist (z.B. Unsplash), gib ihn direkt zurück
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  // Ansonsten konstruiere die URL mit dem API_URL
  return `${API_URL}${filePath}`;
};

export function BilderPage() {
  // State
  const [albums, setAlbums] = useState<Album[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  // Dialog States
  const [albumDialogOpen, setAlbumDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);

  // Album Detail View
  const [viewingAlbum, setViewingAlbum] = useState<Album | null>(null);
  const [albumImages, setAlbumImages] = useState<Image[]>([]);

  // Filter States
  const [activeTab, setActiveTab] = useState("dashboard");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [albumFilter, setAlbumFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Upload States
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Form Data
  const [albumFormData, setAlbumFormData] = useState({
    title: "",
    description: "",
    albumDate: new Date().toISOString().split('T')[0],
    isPublic: false,
  });

  const [imageFormData, setImageFormData] = useState({
    albumId: "",
    title: "",
    description: "",
  });

  // Load data
  useEffect(() => {
    loadAlbums();
    loadImages();
  }, []);

  const loadAlbums = async () => {
    try {
      setLoading(true);
      const data = await getAllAlbums();
      setAlbums(data);
      setOfflineMode(false);
    } catch (error) {
      console.log("Offline-Modus: Verwende Mock-Daten");
      setOfflineMode(true);
      // Mock-Daten für Offline-Modus
      setAlbums([
        {
          id: 1,
          created_by: 1,
          creator_first_name: "Max",
          creator_last_name: "Mustermann",
          title: "Vereinsmeisterschaft 2024",
          description: "Bilder von der Vereinsmeisterschaft",
          album_date: "2024-06-15",
          status: "published",
          is_public: true,
          cover_image: "https://images.unsplash.com/photo-1473445863425-a2bd64d91a0f?w=800&q=80",
          view_count: 156,
          image_count: 24,
          created_at: "2024-06-15T10:00:00Z",
          updated_at: "2024-06-15T10:00:00Z",
        },
        {
          id: 2,
          created_by: 2,
          creator_first_name: "Anna",
          creator_last_name: "Schmidt",
          title: "Schnupperflug Kinder",
          description: "Impressionen vom Schnupperflug",
          album_date: "2024-05-20",
          status: "pending",
          is_public: false,
          cover_image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
          view_count: 0,
          image_count: 18,
          created_at: "2024-05-20T14:30:00Z",
          updated_at: "2024-05-20T14:30:00Z",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadImages = async () => {
    try {
      const data = await getAllImages();
      setImages(data);
    } catch (error) {
      console.log("Offline-Modus: Verwende Mock-Daten für Bilder");
      // Mock-Daten für Bilder (mit Unsplash URLs für Offline-Modus)
      setImages([
        {
          id: 1,
          album_id: 1,
          uploaded_by: 1,
          uploader_first_name: "Max",
          uploader_last_name: "Mustermann",
          filename: "vereinsmeisterschaft-01.jpg",
          stored_filename: "img_001.jpg",
          file_path: "https://images.unsplash.com/photo-1473445863425-a2bd64d91a0f?w=800&q=80",
          file_size: 2048000,
          mime_type: "image/jpeg",
          width: 1920,
          height: 1080,
          title: "Siegerehrung",
          description: "Siegerehrung der Vereinsmeisterschaft",
          status: "approved",
          sort_order: 1,
          created_at: "2024-06-15T10:00:00Z",
        },
        {
          id: 2,
          album_id: 2,
          uploaded_by: 2,
          uploader_first_name: "Anna",
          uploader_last_name: "Schmidt",
          filename: "schnupperflug-01.jpg",
          stored_filename: "img_002.jpg",
          file_path: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
          file_size: 1536000,
          mime_type: "image/jpeg",
          width: 1920,
          height: 1080,
          title: "Kinder beim Schnupperflug",
          status: "pending",
          sort_order: 1,
          created_at: "2024-05-20T14:30:00Z",
        },
        {
          id: 3,
          album_id: 1,
          uploaded_by: 1,
          uploader_first_name: "Max",
          uploader_last_name: "Mustermann",
          filename: "modellflug-winter.jpg",
          stored_filename: "img_003.jpg",
          file_path: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80",
          file_size: 1824000,
          mime_type: "image/jpeg",
          width: 1920,
          height: 1080,
          title: "Winterflug",
          description: "Modellflug im Winter",
          status: "approved",
          sort_order: 2,
          created_at: "2024-06-15T10:30:00Z",
        },
        {
          id: 4,
          album_id: 1,
          uploaded_by: 3,
          uploader_first_name: "Lisa",
          uploader_last_name: "Hoffmann",
          filename: "flugzeug-detail.jpg",
          stored_filename: "img_004.jpg",
          file_path: "https://images.unsplash.com/photo-1511556820780-d912e42b4980?w=800&q=80",
          file_size: 1920000,
          mime_type: "image/jpeg",
          width: 1920,
          height: 1080,
          title: "Modelldetail",
          status: "pending",
          sort_order: 3,
          created_at: "2024-06-15T11:00:00Z",
        },
      ]);
    }
  };

  // Filtered data
  const filteredAlbums = useMemo(() => {
    return albums.filter(album => {
      const matchesSearch = searchTerm === "" || 
        album.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        album.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || album.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [albums, searchTerm, statusFilter]);

  const filteredImages = useMemo(() => {
    const filtered = images.filter(image => {
      const matchesSearch = searchTerm === "" || 
        image.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.filename.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || image.status === statusFilter;
      const matchesAlbum = albumFilter === "all" || String(image.album_id) === albumFilter;
      
      return matchesSearch && matchesStatus && matchesAlbum;
    });
    
    // Sortiere nach Album (zuerst mit Album, dann ohne, und innerhalb nach Album-ID)
    return filtered.sort((a, b) => {
      // Bilder ohne Album ans Ende
      if (!a.album_id && b.album_id) return 1;
      if (a.album_id && !b.album_id) return -1;
      
      // Beide mit Album: nach Album-ID sortieren
      if (a.album_id && b.album_id) {
        if (a.album_id !== b.album_id) {
          return a.album_id - b.album_id;
        }
        // Gleiche Album-ID: nach sort_order
        return a.sort_order - b.sort_order;
      }
      
      // Beide ohne Album: nach Erstellungsdatum
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [images, searchTerm, statusFilter, albumFilter]);

  // Statistics
  const stats = useMemo(() => {
    const pendingImages = images.filter(i => i.status === "pending").length;
    const approvedImages = images.filter(i => i.status === "approved").length;
    const totalImages = images.length;
    const totalAlbums = albums.length;
    const pendingAlbums = albums.filter(a => a.status === "pending").length;
    const publicAlbums = albums.filter(a => a.is_public && a.status === "published").length;

    return {
      pendingImages,
      approvedImages,
      totalImages,
      totalAlbums,
      pendingAlbums,
      publicAlbums,
    };
  }, [albums, images]);

  // Album Handlers
  const handleCreateAlbum = async () => {
    if (!albumFormData.title.trim()) {
      toast.error("Bitte gib einen Titel ein");
      return;
    }

    try {
      const result = await createAlbum({
        title: albumFormData.title,
        description: albumFormData.description,
        albumDate: albumFormData.albumDate,
        isPublic: albumFormData.isPublic,
      });
      toast.success("Album wurde erstellt");
      await loadAlbums();
      setAlbumDialogOpen(false);
      resetAlbumForm();
    } catch (error) {
      console.log("Offline-Modus: Lokale Änderung");
      const newAlbum: Album = {
        id: Math.max(...albums.map(a => a.id), 0) + 1,
        created_by: 1,
        creator_first_name: "Du",
        creator_last_name: "",
        title: albumFormData.title,
        description: albumFormData.description,
        album_date: albumFormData.albumDate,
        status: "draft",
        is_public: albumFormData.isPublic,
        view_count: 0,
        image_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setAlbums([newAlbum, ...albums]);
      toast.warning("Album erstellt (Offline-Modus - nicht gespeichert)");
      setAlbumDialogOpen(false);
      resetAlbumForm();
    }
  };

  const handleUpdateAlbum = async () => {
    if (!selectedAlbum || !albumFormData.title.trim()) {
      toast.error("Bitte gib einen Titel ein");
      return;
    }

    try {
      await updateAlbum(selectedAlbum.id, {
        title: albumFormData.title,
        description: albumFormData.description,
        albumDate: albumFormData.albumDate,
        isPublic: albumFormData.isPublic,
      });
      toast.success("Album wurde aktualisiert");
      await loadAlbums();
      setAlbumDialogOpen(false);
      setSelectedAlbum(null);
      resetAlbumForm();
    } catch (error) {
      console.log("Offline-Modus: Lokale Änderung");
      setAlbums(albums.map(a => 
        a.id === selectedAlbum.id 
          ? {
              ...a,
              title: albumFormData.title,
              description: albumFormData.description,
              album_date: albumFormData.albumDate,
              is_public: albumFormData.isPublic,
              updated_at: new Date().toISOString(),
            }
          : a
      ));
      toast.warning("Album aktualisiert (Offline-Modus - nicht gespeichert)");
      setAlbumDialogOpen(false);
      setSelectedAlbum(null);
      resetAlbumForm();
    }
  };

  const handleDeleteAlbum = async () => {
    if (!selectedAlbum) return;

    try {
      await deleteAlbum(selectedAlbum.id);
      toast.success("Album wurde gelöscht");
      await loadAlbums();
      await loadImages();
      setDeleteDialogOpen(false);
      setSelectedAlbum(null);
    } catch (error) {
      console.log("Offline-Modus: Lokale Änderung");
      setAlbums(albums.filter(a => a.id !== selectedAlbum.id));
      setImages(images.filter(i => i.album_id !== selectedAlbum.id));
      toast.warning("Album gelöscht (Offline-Modus - nicht gespeichert)");
      setDeleteDialogOpen(false);
      setSelectedAlbum(null);
    }
  };

  const handleApproveAlbum = async (album: Album) => {
    try {
      await approveAlbum(album.id);
      toast.success("Album wurde freigegeben");
      await loadAlbums();
    } catch (error) {
      console.log("Offline-Modus: Lokale Änderung");
      setAlbums(albums.map(a => 
        a.id === album.id ? { ...a, status: "approved" as const } : a
      ));
      toast.warning("Album freigegeben (Offline-Modus - nicht gespeichert)");
    }
  };

  const handlePublishAlbum = async (album: Album) => {
    try {
      await publishAlbum(album.id);
      toast.success("Album wurde veröffentlicht");
      await loadAlbums();
    } catch (error) {
      console.log("Offline-Modus: Lokale Änderung");
      setAlbums(albums.map(a => 
        a.id === album.id ? { ...a, status: "published" as const } : a
      ));
      toast.warning("Album veröffentlicht (Offline-Modus - nicht gespeichert)");
    }
  };

  // Image Handlers
  const handleUploadImages = async () => {
    if (uploadFiles.length === 0) {
      toast.error("Bitte wähle mindestens ein Bild aus");
      return;
    }

    try {
      const albumId = imageFormData.albumId ? parseInt(imageFormData.albumId) : undefined;
      await uploadImages(
        uploadFiles,
        albumId,
        imageFormData.title,
        imageFormData.description
      );
      toast.success(`${uploadFiles.length} Bild(er) wurden hochgeladen`);
      await loadImages();
      if (albumId) {
        await loadAlbums();
        // Aktualisiere Album-Detail-Ansicht wenn aktiv
        if (viewingAlbum && albumId === viewingAlbum.id) {
          await openAlbumDetailView(viewingAlbum);
        }
      }
      setUploadDialogOpen(false);
      resetUploadForm();
    } catch (error) {
      console.log("Offline-Modus: Lokale Änderung");
      toast.warning("Bilder hochgeladen (Offline-Modus - nicht gespeichert)");
      setUploadDialogOpen(false);
      resetUploadForm();
    }
  };

  const handleApproveImage = async (image: Image) => {
    try {
      await approveImage(image.id);
      toast.success("Bild wurde freigegeben");
      await loadImages();
      // Aktualisiere Album-Detail-Ansicht wenn aktiv
      if (viewingAlbum && image.album_id === viewingAlbum.id) {
        setAlbumImages(prev => prev.map(i => 
          i.id === image.id ? { ...i, status: "approved" as const } : i
        ));
      }
    } catch (error) {
      console.log("Offline-Modus: Lokale Änderung");
      setImages(images.map(i => 
        i.id === image.id ? { ...i, status: "approved" as const } : i
      ));
      if (viewingAlbum && image.album_id === viewingAlbum.id) {
        setAlbumImages(prev => prev.map(i => 
          i.id === image.id ? { ...i, status: "approved" as const } : i
        ));
      }
      toast.warning("Bild freigegeben (Offline-Modus - nicht gespeichert)");
    }
  };

  const handleRejectImage = async (image: Image) => {
    try {
      await rejectImage(image.id, "Bild entspricht nicht den Richtlinien");
      toast.success("Bild wurde abgelehnt");
      await loadImages();
      // Aktualisiere Album-Detail-Ansicht wenn aktiv
      if (viewingAlbum && image.album_id === viewingAlbum.id) {
        setAlbumImages(prev => prev.map(i => 
          i.id === image.id ? { ...i, status: "rejected" as const } : i
        ));
      }
    } catch (error) {
      console.log("Offline-Modus: Lokale Änderung");
      setImages(images.map(i => 
        i.id === image.id ? { ...i, status: "rejected" as const } : i
      ));
      if (viewingAlbum && image.album_id === viewingAlbum.id) {
        setAlbumImages(prev => prev.map(i => 
          i.id === image.id ? { ...i, status: "rejected" as const } : i
        ));
      }
      toast.warning("Bild abgelehnt (Offline-Modus - nicht gespeichert)");
    }
  };

  const handleDeleteImage = async (image: Image) => {
    if (!confirm("Möchtest du dieses Bild wirklich löschen?")) return;

    try {
      await deleteImage(image.id);
      toast.success("Bild wurde gelöscht");
      await loadImages();
      await loadAlbums();
      // Aktualisiere Album-Detail-Ansicht wenn aktiv
      if (viewingAlbum && image.album_id === viewingAlbum.id) {
        setAlbumImages(prev => prev.filter(i => i.id !== image.id));
      }
    } catch (error) {
      console.log("Offline-Modus: Lokale Änderung");
      setImages(images.filter(i => i.id !== image.id));
      if (viewingAlbum && image.album_id === viewingAlbum.id) {
        setAlbumImages(prev => prev.filter(i => i.id !== image.id));
      }
      toast.warning("Bild gelöscht (Offline-Modus - nicht gespeichert)");
    }
  };

  const handleToggleSliderImage = async (image: Image, isSlider: boolean) => {
    try {
      await updateImage(image.id, { isSliderImage: isSlider });
      toast.success(isSlider ? "Bild für Slider aktiviert" : "Bild vom Slider entfernt");
      await loadImages();
      // Aktualisiere selectedImage wenn es das aktuelle Bild ist
      if (selectedImage && selectedImage.id === image.id) {
        setSelectedImage({ ...selectedImage, is_slider_image: isSlider });
      }
      // Aktualisiere Album-Detail-Ansicht wenn aktiv
      if (viewingAlbum && image.album_id === viewingAlbum.id) {
        setAlbumImages(prev => prev.map(i => 
          i.id === image.id ? { ...i, is_slider_image: isSlider } : i
        ));
      }
    } catch (error) {
      console.log("Offline-Modus: Lokale Änderung");
      setImages(images.map(i => 
        i.id === image.id ? { ...i, is_slider_image: isSlider } : i
      ));
      if (selectedImage && selectedImage.id === image.id) {
        setSelectedImage({ ...selectedImage, is_slider_image: isSlider });
      }
      if (viewingAlbum && image.album_id === viewingAlbum.id) {
        setAlbumImages(prev => prev.map(i => 
          i.id === image.id ? { ...i, is_slider_image: isSlider } : i
        ));
      }
      toast.warning("Slider-Einstellung geändert (Offline-Modus - nicht gespeichert)");
    }
  };

  // Dialog Handlers
  const openCreateAlbumDialog = () => {
    resetAlbumForm();
    setSelectedAlbum(null);
    setAlbumDialogOpen(true);
  };

  const openEditAlbumDialog = (album: Album) => {
    setSelectedAlbum(album);
    setAlbumFormData({
      title: album.title,
      description: album.description || "",
      albumDate: album.album_date?.split('T')[0] || new Date().toISOString().split('T')[0],
      isPublic: album.is_public,
    });
    setAlbumDialogOpen(true);
  };

  const openDeleteAlbumDialog = (album: Album) => {
    setSelectedAlbum(album);
    setDeleteDialogOpen(true);
  };

  const openImageDialog = (image: Image) => {
    setSelectedImage(image);
    setImageDialogOpen(true);
  };

  const openUploadDialog = () => {
    resetUploadForm();
    setUploadDialogOpen(true);
  };

  const openAlbumDetailView = async (album: Album) => {
    setViewingAlbum(album);
    // Lade Bilder des Albums
    const albumImagesFiltered = images.filter(img => img.album_id === album.id);
    setAlbumImages(albumImagesFiltered);
    
    // Optional: Lade Album-Details vom Backend
    try {
      const albumWithImages = await getAlbumById(album.id);
      if (albumWithImages.images) {
        setAlbumImages(albumWithImages.images);
      }
    } catch (error) {
      console.log("Verwende lokale Bilder");
    }
  };

  const closeAlbumDetailView = () => {
    setViewingAlbum(null);
    setAlbumImages([]);
  };

  const resetAlbumForm = () => {
    setAlbumFormData({
      title: "",
      description: "",
      albumDate: new Date().toISOString().split('T')[0],
      isPublic: false,
    });
  };

  const resetUploadForm = () => {
    setUploadFiles([]);
    setImageFormData({
      albumId: "",
      title: "",
      description: "",
    });
  };

  // File Upload Handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      setUploadFiles(prev => [...prev, ...files]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setUploadFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Status Badge
  const getStatusBadge = (status: Album["status"] | Image["status"]) => {
    switch (status) {
      case "draft":
        return (
          <Badge variant="outline" className="gap-1 border-gray-500 text-gray-700 bg-gray-50 dark:bg-gray-950/30">
            <FileImage className="h-3 w-3" />
            Entwurf
          </Badge>
        );
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
      case "rejected":
        return (
          <Badge variant="outline" className="gap-1 border-red-500 text-red-700 bg-red-50 dark:bg-red-950/30">
            <X className="h-3 w-3" />
            Abgelehnt
          </Badge>
        );
      case "published":
        return (
          <Badge variant="outline" className="gap-1 border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-950/30">
            <Globe className="h-3 w-3" />
            Veröffentlicht
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Lade Bilder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="mb-2">Bilder-Verwaltung</h2>
          <p className="text-muted-foreground">
            Verwalte Fotoalben und Bilder des Vereins
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={openUploadDialog} className="gap-2" variant="outline">
            <Upload className="h-4 w-4" />
            Bilder hochladen
          </Button>
          <Button onClick={openCreateAlbumDialog} className="gap-2">
            <FolderPlus className="h-4 w-4" />
            Neues Album
          </Button>
        </div>
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

      {/* Pending Alerts */}
      {stats.pendingAlbums > 0 && !offlineMode && (
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/30">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-900 dark:text-amber-200">
            <strong>{stats.pendingAlbums} Album(e)</strong> warten auf deine Freigabe.
          </AlertDescription>
        </Alert>
      )}

      {stats.pendingImages > 0 && !offlineMode && (
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/30">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-900 dark:text-amber-200">
            <strong>{stats.pendingImages} Bild(er)</strong> warten auf deine Freigabe.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">
            <LayoutGrid className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="albums">
            <Folder className="h-4 w-4 mr-2" />
            Alben ({stats.totalAlbums})
          </TabsTrigger>
          <TabsTrigger value="images">
            <ImageIcon className="h-4 w-4 mr-2" />
            Bilder ({stats.totalImages})
          </TabsTrigger>
          <TabsTrigger value="pending">
            <Clock className="h-4 w-4 mr-2" />
            Freigaben ({stats.pendingImages})
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Statistics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Alben gesamt</CardTitle>
                <Folder className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{stats.totalAlbums}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.publicAlbums} öffentlich
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Bilder gesamt</CardTitle>
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{stats.totalImages}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.approvedImages} freigegeben
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Ausstehend</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{stats.pendingImages}</div>
                <p className="text-xs text-muted-foreground">
                  Bilder zu prüfen
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Alben ausstehend</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{stats.pendingAlbums}</div>
                <p className="text-xs text-muted-foreground">
                  Alben zu prüfen
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Albums */}
          <div>
            <h3 className="mb-4">Neueste Alben</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {albums.slice(0, 6).map((album) => (
                <Card key={album.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
                  setActiveTab("albums");
                  openAlbumDetailView(album);
                }}>
                  <div className="aspect-video relative bg-muted">
                    {album.cover_image && (
                      <ImageWithFallback
                        src={album.cover_image}
                        alt={album.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-2 right-2 flex gap-2">
                      {getStatusBadge(album.status)}
                      {album.is_public && (
                        <Badge className="gap-1 bg-black/60 text-white border-0">
                          <Globe className="h-3 w-3" />
                        </Badge>
                      )}
                    </div>
                    {album.image_count !== undefined && album.image_count > 0 && (
                      <div className="absolute bottom-2 left-2">
                        <Badge className="bg-black/60 text-white border-0">
                          {album.image_count} Bilder
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm break-words">{album.title}</CardTitle>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{album.creator_first_name} {album.creator_last_name}</span>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Albums Tab */}
        <TabsContent value="albums" className="space-y-6">
          {viewingAlbum ? (
            /* Album Detail View */
            <div className="space-y-6">
              {/* Breadcrumb & Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={closeAlbumDetailView}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Zurück zu Alben
                  </Button>
                  <span className="text-muted-foreground">/</span>
                  <h3>{viewingAlbum.title}</h3>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => {
                    setImageFormData({ ...imageFormData, albumId: String(viewingAlbum.id) });
                    openUploadDialog();
                  }} className="gap-2" variant="outline">
                    <Upload className="h-4 w-4" />
                    Bilder hinzufügen
                  </Button>
                  <Button onClick={() => openEditAlbumDialog(viewingAlbum)} className="gap-2" variant="outline">
                    <Edit className="h-4 w-4" />
                    Album bearbeiten
                  </Button>
                </div>
              </div>

              {/* Album Info Card */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row gap-4">
                    {viewingAlbum.cover_image && (
                      <div className="w-full sm:w-48 aspect-video relative bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={viewingAlbum.cover_image}
                          alt={viewingAlbum.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle className="mb-2">{viewingAlbum.title}</CardTitle>
                          {viewingAlbum.description && (
                            <p className="text-sm text-muted-foreground">{viewingAlbum.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {getStatusBadge(viewingAlbum.status)}
                          {viewingAlbum.is_public ? (
                            <Badge className="gap-1">
                              <Globe className="h-3 w-3" />
                              Öffentlich
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1">
                              <Lock className="h-3 w-3" />
                              Privat
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{viewingAlbum.creator_first_name} {viewingAlbum.creator_last_name}</span>
                        </div>
                        {viewingAlbum.album_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(viewingAlbum.album_date).toLocaleDateString('de-DE')}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <ImageIcon className="h-4 w-4" />
                          <span>{albumImages.length} Bilder</span>
                        </div>
                        {viewingAlbum.view_count > 0 && (
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            <span>{viewingAlbum.view_count} Aufrufe</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Pending Images Alert */}
              {albumImages.filter(i => i.status === "pending").length > 0 && (
                <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/30">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-900 dark:text-amber-200">
                    <strong>{albumImages.filter(i => i.status === "pending").length} Bild(er)</strong> in diesem Album warten auf Freigabe.
                  </AlertDescription>
                </Alert>
              )}

              {/* Album Images Grid */}
              {albumImages.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3>Bilder in diesem Album ({albumImages.length})</h3>
                    <div className="flex gap-2 text-sm text-muted-foreground">
                      <span>{albumImages.filter(i => i.status === "approved").length} freigegeben</span>
                      {albumImages.filter(i => i.status === "pending").length > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-amber-600">{albumImages.filter(i => i.status === "pending").length} ausstehend</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {albumImages.map((image) => (
                      <Card key={image.id} className="overflow-hidden group">
                        <div className="aspect-square relative bg-muted cursor-pointer" onClick={() => openImageDialog(image)}>
                          <ImageWithFallback
                            src={getImageUrl(image.file_path)}
                            alt={image.title || image.filename}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2 flex gap-2">
                            {getStatusBadge(image.status)}
                            {image.is_slider_image && (
                              <Badge className="gap-1 bg-blue-600 text-white border-0">
                                <Monitor className="h-3 w-3" />
                              </Badge>
                            )}
                          </div>
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button size="sm" variant="secondary" onClick={(e) => {
                              e.stopPropagation();
                              openImageDialog(image);
                            }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            {image.status === "pending" && (
                              <>
                                <Button 
                                  size="sm" 
                                  className="bg-green-600 hover:bg-green-700" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApproveImage(image);
                                  }}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRejectImage(image);
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteImage(image);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <CardHeader className="p-3">
                          <CardTitle className="text-xs break-words line-clamp-2">
                            {image.title || image.filename}
                          </CardTitle>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="mb-2">Noch keine Bilder</h3>
                    <p className="text-muted-foreground mb-4">
                      Dieses Album enthält noch keine Bilder
                    </p>
                    <Button onClick={() => {
                      setImageFormData({ ...imageFormData, albumId: String(viewingAlbum.id) });
                      openUploadDialog();
                    }} className="gap-2">
                      <Upload className="h-4 w-4" />
                      Bilder hinzufügen
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            /* Album List View */
            <>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Album suchen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Status</SelectItem>
                    <SelectItem value="draft">Entwurf</SelectItem>
                    <SelectItem value="pending">Ausstehend</SelectItem>
                    <SelectItem value="approved">Genehmigt</SelectItem>
                    <SelectItem value="published">Veröffentlicht</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Albums Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredAlbums.map((album) => (
                  <Card key={album.id} className="overflow-hidden group">
                    <div 
                      className="aspect-video relative bg-muted cursor-pointer" 
                      onClick={() => openAlbumDetailView(album)}
                    >
                  {album.cover_image && (
                    <ImageWithFallback
                      src={album.cover_image}
                      alt={album.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-2 right-2 flex gap-2">
                    {getStatusBadge(album.status)}
                    {album.is_public ? (
                      <Badge className="gap-1 bg-black/60 text-white border-0">
                        <Globe className="h-3 w-3" />
                        Öffentlich
                      </Badge>
                    ) : (
                      <Badge className="gap-1 bg-black/60 text-white border-0">
                        <Lock className="h-3 w-3" />
                        Privat
                      </Badge>
                    )}
                  </div>
                  {album.image_count !== undefined && album.image_count > 0 && (
                    <div className="absolute bottom-2 left-2">
                      <Badge className="bg-black/60 text-white border-0">
                        {album.image_count} Bilder
                      </Badge>
                    </div>
                  )}
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm break-words">{album.title}</CardTitle>
                  <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      <span>{album.creator_first_name} {album.creator_last_name}</span>
                    </div>
                    {album.album_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(album.album_date).toLocaleDateString('de-DE')}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-col gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full" 
                      onClick={(e) => {
                        e.stopPropagation();
                        openAlbumDetailView(album);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Bilder ansehen
                    </Button>
                    <div className="flex gap-2">
                      {album.status === "pending" && (
                        <Button 
                          size="sm" 
                          className="flex-1 bg-green-600 hover:bg-green-700" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApproveAlbum(album);
                          }}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Freigeben
                        </Button>
                      )}
                      {album.status === "approved" && (
                        <Button 
                          size="sm" 
                          className="flex-1 bg-blue-600 hover:bg-blue-700" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePublishAlbum(album);
                          }}
                        >
                          <Globe className="h-4 w-4 mr-1" />
                          Veröffentlichen
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1" 
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditAlbumDialog(album);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Bearbeiten
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteAlbumDialog(album);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

              {filteredAlbums.length === 0 && (
                <div className="text-center py-12">
                  <Folder className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="mb-2">Keine Alben gefunden</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || statusFilter !== "all" 
                      ? "Versuche die Filter anzupassen" 
                      : "Erstelle dein erstes Album"}
                  </p>
                  {!searchTerm && statusFilter === "all" && (
                    <Button onClick={openCreateAlbumDialog} className="gap-2">
                      <FolderPlus className="h-4 w-4" />
                      Neues Album erstellen
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Bild suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={albumFilter} onValueChange={setAlbumFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Folder className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Album" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Alben</SelectItem>
                {albums.filter(album => album.id).map(album => (
                  <SelectItem key={album.id} value={String(album.id)}>
                    {album.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="pending">Ausstehend</SelectItem>
                <SelectItem value="approved">Genehmigt</SelectItem>
                <SelectItem value="rejected">Abgelehnt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Images Grid - gruppiert nach Album */}
          <div className="space-y-8">
            {(() => {
              // Gruppiere Bilder nach Album
              const imagesByAlbum = filteredImages.reduce((acc, image) => {
                const albumId = image.album_id || 'no-album';
                if (!acc[albumId]) {
                  acc[albumId] = [];
                }
                acc[albumId].push(image);
                return acc;
              }, {} as Record<string, Image[]>);

              return Object.entries(imagesByAlbum).map(([albumId, albumImages]) => {
                const album = albums.find(a => String(a.id) === albumId);
                const albumTitle = album ? album.title : 'Ohne Album';
                
                return (
                  <div key={albumId}>
                    {/* Album-Überschrift */}
                    <div className="flex items-center gap-3 mb-4">
                      <Folder className="h-5 w-5 text-muted-foreground" />
                      <h3>{albumTitle}</h3>
                      <Badge variant="outline">{albumImages.length} Bilder</Badge>
                      {album && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="ml-auto"
                          onClick={() => {
                            setActiveTab("albums");
                            openAlbumDetailView(album);
                          }}
                        >
                          Zum Album
                        </Button>
                      )}
                    </div>
                    
                    {/* Bilder-Grid für dieses Album */}
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                      {albumImages.map((image) => (
              <Card key={image.id} className="overflow-hidden group">
                <div className="aspect-square relative bg-muted cursor-pointer" onClick={() => openImageDialog(image)}>
                  <ImageWithFallback
                    src={getImageUrl(image.file_path)}
                    alt={image.title || image.filename}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    {getStatusBadge(image.status)}
                    {image.is_slider_image && (
                      <Badge className="gap-1 bg-blue-600 text-white border-0">
                        <Monitor className="h-3 w-3" />
                      </Badge>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary" onClick={(e) => {
                      e.stopPropagation();
                      openImageDialog(image);
                    }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {image.status === "pending" && (
                      <>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApproveImage(image);
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRejectImage(image);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(image);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardHeader className="p-3">
                  <CardTitle className="text-xs break-words line-clamp-2">
                    {image.title || image.filename}
                  </CardTitle>
                  {image.album_id && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Folder className="h-3 w-3" />
                      <span className="truncate">{albums.find(a => a.id === image.album_id)?.title}</span>
                    </div>
                  )}
                </CardHeader>
              </Card>
                      ))}
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          {filteredImages.length === 0 && (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="mb-2">Keine Bilder gefunden</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" || albumFilter !== "all"
                  ? "Versuche die Filter anzupassen" 
                  : "Lade deine ersten Bilder hoch"}
              </p>
              {!searchTerm && statusFilter === "all" && albumFilter === "all" && (
                <Button onClick={openUploadDialog} className="gap-2">
                  <Upload className="h-4 w-4" />
                  Bilder hochladen
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        {/* Pending Tab */}
        <TabsContent value="pending" className="space-y-6">
          {/* Pending Images */}
          {filteredImages.filter(i => i.status === "pending").length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredImages.filter(i => i.status === "pending").map((image) => (
                <Card key={image.id} className="overflow-hidden border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/10">
                  <div className="aspect-square relative bg-muted cursor-pointer" onClick={() => openImageDialog(image)}>
                    <ImageWithFallback
                      src={getImageUrl(image.file_path)}
                      alt={image.title || image.filename}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      {getStatusBadge(image.status)}
                      {image.is_slider_image && (
                        <Badge className="gap-1 bg-blue-600 text-white border-0">
                          <Monitor className="h-3 w-3" />
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm break-words">{image.title || image.filename}</CardTitle>
                    {image.album_id && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Folder className="h-3 w-3" />
                        <span className="truncate">{albums.find(a => a.id === image.album_id)?.title}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <User className="h-3 w-3" />
                      <span>{image.uploader_first_name} {image.uploader_last_name}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-green-600 hover:bg-green-700" 
                        onClick={() => handleApproveImage(image)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Freigeben
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 text-destructive hover:text-destructive"
                        onClick={() => handleRejectImage(image)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Ablehnen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Check className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h3 className="mb-2">Alle Bilder geprüft</h3>
              <p className="text-muted-foreground">
                Es gibt derzeit keine Bilder, die auf Freigabe warten
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Album Dialog */}
      <Dialog open={albumDialogOpen} onOpenChange={setAlbumDialogOpen}>
        <DialogContent className="max-w-2xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>
              {selectedAlbum ? "Album bearbeiten" : "Neues Album erstellen"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="album-title">Titel *</Label>
              <Input
                id="album-title"
                value={albumFormData.title}
                onChange={(e) => setAlbumFormData({ ...albumFormData, title: e.target.value })}
                placeholder="z.B. Vereinsmeisterschaft 2024"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="album-description">Beschreibung</Label>
              <Textarea
                id="album-description"
                value={albumFormData.description}
                onChange={(e) => setAlbumFormData({ ...albumFormData, description: e.target.value })}
                placeholder="Beschreibe das Album..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="album-date">Datum</Label>
              <Input
                id="album-date"
                type="date"
                value={albumFormData.albumDate}
                onChange={(e) => setAlbumFormData({ ...albumFormData, albumDate: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="album-public">Öffentlich sichtbar</Label>
                <p className="text-sm text-muted-foreground">
                  Album ist für alle Besucher sichtbar
                </p>
              </div>
              <Switch
                id="album-public"
                checked={albumFormData.isPublic}
                onCheckedChange={(checked) => setAlbumFormData({ ...albumFormData, isPublic: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAlbumDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={selectedAlbum ? handleUpdateAlbum : handleCreateAlbum}>
              {selectedAlbum ? "Aktualisieren" : "Erstellen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-2xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Bilder hochladen</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Drag & Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="mb-2">
                Ziehe Bilder hierher oder{" "}
                <label className="text-primary cursor-pointer hover:underline">
                  wähle Dateien aus
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              </p>
              <p className="text-sm text-muted-foreground">
                JPG, PNG oder GIF - Max 5 MB pro Bild
              </p>
            </div>

            {/* Selected Files */}
            {uploadFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Ausgewählte Bilder ({uploadFiles.length})</Label>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {uploadFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      <ImageIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm flex-1 truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="upload-album">Album (optional)</Label>
              <Select value={imageFormData.albumId || "none"} onValueChange={(value) => setImageFormData({ ...imageFormData, albumId: value === "none" ? "" : value })}>
                <SelectTrigger id="upload-album">
                  <SelectValue placeholder="Wähle ein Album" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Kein Album</SelectItem>
                  {albums.filter(album => album.id).map(album => (
                    <SelectItem key={album.id} value={String(album.id)}>
                      {album.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="upload-title">Titel (optional)</Label>
              <Input
                id="upload-title"
                value={imageFormData.title}
                onChange={(e) => setImageFormData({ ...imageFormData, title: e.target.value })}
                placeholder="z.B. Vereinsflug"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="upload-description">Beschreibung (optional)</Label>
              <Textarea
                id="upload-description"
                value={imageFormData.description}
                onChange={(e) => setImageFormData({ ...imageFormData, description: e.target.value })}
                placeholder="Beschreibe die Bilder..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleUploadImages} disabled={uploadFiles.length === 0}>
              {uploadFiles.length} Bild(er) hochladen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Detail Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Bildansicht</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-6">
              <div className="aspect-video relative bg-muted rounded-lg overflow-hidden">
                <ImageWithFallback
                  src={getImageUrl(selectedImage.file_path)}
                  alt={selectedImage.title || selectedImage.filename}
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <h3 className="mb-3">{selectedImage.title || selectedImage.filename}</h3>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{selectedImage.uploader_first_name} {selectedImage.uploader_last_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(selectedImage.created_at).toLocaleDateString('de-DE')}</span>
                  </div>
                  {selectedImage.width && selectedImage.height && (
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      <span>{selectedImage.width} × {selectedImage.height}</span>
                    </div>
                  )}
                  {getStatusBadge(selectedImage.status)}
                </div>
                {selectedImage.description && (
                  <p className="text-sm text-muted-foreground mb-4">{selectedImage.description}</p>
                )}
                
                {/* Slider Toggle */}
                <div className="flex items-center justify-between p-4 border rounded-lg mt-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      <Label htmlFor="slider-toggle">Für Slider verwenden</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Dieses Bild wird im Slider auf der Startseite angezeigt
                    </p>
                  </div>
                  <Switch
                    id="slider-toggle"
                    checked={selectedImage.is_slider_image || false}
                    onCheckedChange={(checked) => handleToggleSliderImage(selectedImage, checked)}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                {selectedImage.status === "pending" && (
                  <>
                    <Button 
                      className="flex-1 sm:flex-initial gap-2 bg-green-600 hover:bg-green-700" 
                      onClick={() => {
                        handleApproveImage(selectedImage);
                        setImageDialogOpen(false);
                      }}
                    >
                      <Check className="h-4 w-4" />
                      Freigeben
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 sm:flex-initial gap-2 text-destructive hover:text-destructive" 
                      onClick={() => {
                        handleRejectImage(selectedImage);
                        setImageDialogOpen(false);
                      }}
                    >
                      <X className="h-4 w-4" />
                      Ablehnen
                    </Button>
                  </>
                )}
                <Button 
                  variant="outline" 
                  className="flex-1 sm:flex-initial gap-2 text-destructive hover:text-destructive sm:ml-auto" 
                  onClick={() => {
                    handleDeleteImage(selectedImage);
                    setImageDialogOpen(false);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Löschen
                </Button>
                <Button variant="outline" onClick={() => setImageDialogOpen(false)}>
                  Schließen
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Album wirklich löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du das Album "{selectedAlbum?.title}" wirklich löschen? 
              Alle Bilder in diesem Album werden ebenfalls gelöscht. 
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAlbum} className="bg-destructive hover:bg-destructive/90">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
