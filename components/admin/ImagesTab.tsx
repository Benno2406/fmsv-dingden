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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { FolderPlus, Upload, Edit, Trash2, Image as ImageIcon, Calendar } from "lucide-react";
import { Badge } from "../ui/badge";

export function ImagesTab() {
  const [albums, setAlbums] = useState([
    {
      id: "1",
      title: "Vereinsmeisterschaft 2024",
      date: "15. Mai 2024",
      imageCount: 45,
      coverImage: "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=400",
      description: "Impressionen von unserer Vereinsmeisterschaft"
    },
    {
      id: "2",
      title: "Schnupperflug für Kinder",
      date: "22. Juni 2024",
      imageCount: 32,
      coverImage: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400",
      description: "Toller Tag mit vielen interessierten Kindern"
    },
    {
      id: "3",
      title: "Sommerfest 2024",
      date: "10. August 2024",
      imageCount: 67,
      coverImage: "https://images.unsplash.com/photo-1530024966593-3027859fa38c?w=400",
      description: "Unser jährliches Sommerfest mit Grillen und Flugvorführungen"
    },
  ]);

  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [isCreateAlbumOpen, setIsCreateAlbumOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <div className="space-y-6">
      {!selectedAlbum ? (
        <>
          {/* Album Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Fotoalben Verwaltung</CardTitle>
                <Dialog open={isCreateAlbumOpen} onOpenChange={setIsCreateAlbumOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <FolderPlus className="h-4 w-4" />
                      Neues Album erstellen
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Neues Fotoalbum erstellen</DialogTitle>
                      <DialogDescription>
                        Lege ein neues Album an, um Fotos hochzuladen.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="albumTitle">Album-Titel</Label>
                        <Input id="albumTitle" placeholder="z.B. Vereinsmeisterschaft 2024" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="albumDate">Datum</Label>
                        <Input id="albumDate" type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="albumDescription">Beschreibung</Label>
                        <Textarea 
                          id="albumDescription" 
                          placeholder="Kurze Beschreibung des Albums"
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="coverImage">Titelbild hochladen</Label>
                        <Input id="coverImage" type="file" accept="image/*" />
                        <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                          Wird als Vorschaubild des Albums verwendet
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreateAlbumOpen(false)}>
                        Abbrechen
                      </Button>
                      <Button onClick={() => setIsCreateAlbumOpen(false)}>
                        Album erstellen
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {albums.map((album) => (
                  <Card key={album.id} className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
                    <div 
                      className="aspect-video bg-muted overflow-hidden"
                      onClick={() => setSelectedAlbum(album.id)}
                    >
                      <img 
                        src={album.coverImage} 
                        alt={album.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="mb-2">{album.title}</h3>
                      <div className="flex items-center gap-2 mb-2 text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                        <Calendar className="h-3.5 w-3.5" />
                        {album.date}
                      </div>
                      <p className="text-muted-foreground mb-3" style={{ fontSize: '0.875rem' }}>
                        {album.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="gap-1">
                          <ImageIcon className="h-3 w-3" />
                          {album.imageCount} Bilder
                        </Badge>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="gap-1">
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Album bearbeiten</DialogTitle>
                                <DialogDescription>
                                  Ändere die Details des Albums.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="editTitle">Album-Titel</Label>
                                  <Input id="editTitle" defaultValue={album.title} />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="editDate">Datum</Label>
                                  <Input id="editDate" type="date" />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="editDescription">Beschreibung</Label>
                                  <Textarea 
                                    id="editDescription" 
                                    defaultValue={album.description}
                                    rows={3}
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end gap-2">
                                <DialogTrigger asChild>
                                  <Button variant="outline">Abbrechen</Button>
                                </DialogTrigger>
                                <Button>Änderungen speichern</Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="gap-1 text-destructive">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Album wirklich löschen?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Diese Aktion kann nicht rückgängig gemacht werden. Das Album und alle enthaltenen Bilder werden permanent gelöscht.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  Löschen
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Album Detail View */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <Button 
                    variant="ghost" 
                    onClick={() => setSelectedAlbum(null)}
                    className="mb-2 -ml-2"
                  >
                    ← Zurück zur Übersicht
                  </Button>
                  <CardTitle>{albums.find(a => a.id === selectedAlbum)?.title}</CardTitle>
                </div>
                <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Upload className="h-4 w-4" />
                      Bilder hochladen
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Bilder hochladen</DialogTitle>
                      <DialogDescription>
                        Wähle Bilder aus, um sie zum Album hinzuzufügen.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="imageUpload">Bilder auswählen</Label>
                        <Input 
                          id="imageUpload" 
                          type="file" 
                          accept="image/*" 
                          multiple
                        />
                        <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                          Du kannst mehrere Bilder gleichzeitig auswählen
                        </p>
                      </div>
                      <div className="border-2 border-dashed rounded-lg p-8 text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Oder ziehe Bilder hierher
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
                        Abbrechen
                      </Button>
                      <Button onClick={() => setIsUploadOpen(false)}>
                        Hochladen
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {/* Sample Images Grid */}
              <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="group relative aspect-square bg-muted rounded-lg overflow-hidden">
                    <img 
                      src={`https://images.unsplash.com/photo-147349${6470 + i}904-658ba7c44d8a?w=400`}
                      alt={`Bild ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="sm" variant="secondary">
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Bild wirklich löschen?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Diese Aktion kann nicht rückgängig gemacht werden.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Löschen
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
