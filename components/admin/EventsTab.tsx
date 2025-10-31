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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { CalendarPlus, Edit, Trash2, MapPin, Clock } from "lucide-react";

export function EventsTab() {
  const [events] = useState([
    {
      id: "1",
      title: "Vereinsmeisterschaft 2025",
      date: "15. Mai 2025",
      time: "10:00 - 18:00 Uhr",
      location: "Fluggelände Dingden",
      type: "Wettbewerb",
      description: "Unsere jährliche Vereinsmeisterschaft mit verschiedenen Kategorien",
    },
    {
      id: "2",
      title: "Schnupperflug für Kinder",
      date: "22. Juni 2025",
      time: "14:00 - 17:00 Uhr",
      location: "Fluggelände Dingden",
      type: "Veranstaltung",
      description: "Kinder können unter Anleitung erste Flugerfahrungen sammeln",
    },
    {
      id: "3",
      title: "Sommerfest 2025",
      date: "10. August 2025",
      time: "11:00 - 20:00 Uhr",
      location: "Vereinsgelände",
      type: "Veranstaltung",
      description: "Jährliches Sommerfest mit Grillen und Flugvorführungen",
    },
    {
      id: "4",
      title: "Mitgliederversammlung",
      date: "15. März 2025",
      time: "19:00 - 21:00 Uhr",
      location: "Vereinsheim",
      type: "Versammlung",
      description: "Ordentliche Mitgliederversammlung mit Vorstandswahl",
    },
  ]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Terminverwaltung</CardTitle>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <CalendarPlus className="h-4 w-4" />
                  Neuer Termin
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Neuen Termin erstellen</DialogTitle>
                  <DialogDescription>
                    Lege einen neuen Termin für die Website an.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventTitle">Titel</Label>
                    <Input 
                      id="eventTitle" 
                      placeholder="z.B. Vereinsmeisterschaft 2025" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="eventDate">Datum</Label>
                      <Input id="eventDate" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="eventTime">Uhrzeit</Label>
                      <Input id="eventTime" placeholder="10:00 - 18:00 Uhr" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventLocation">Ort</Label>
                    <Input 
                      id="eventLocation" 
                      placeholder="z.B. Fluggelände Dingden" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventType">Typ</Label>
                    <Select>
                      <SelectTrigger id="eventType">
                        <SelectValue placeholder="Typ auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wettbewerb">Wettbewerb</SelectItem>
                        <SelectItem value="veranstaltung">Veranstaltung</SelectItem>
                        <SelectItem value="versammlung">Versammlung</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                        <SelectItem value="sonstiges">Sonstiges</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventDescription">Beschreibung</Label>
                    <Textarea 
                      id="eventDescription" 
                      placeholder="Kurze Beschreibung des Termins..."
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventImage">Bild hochladen (optional)</Label>
                    <Input id="eventImage" type="file" accept="image/*" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Abbrechen
                  </Button>
                  <Button onClick={() => setIsCreateOpen(false)}>
                    Termin erstellen
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Events Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Termin</TableHead>
                  <TableHead>Datum & Uhrzeit</TableHead>
                  <TableHead>Ort</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div>
                        <p>{event.title}</p>
                        <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                          {event.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          {event.date}
                        </div>
                        <div className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                          {event.time}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        {event.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          event.type === "Wettbewerb"
                            ? "default"
                            : event.type === "Veranstaltung"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {event.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-1">
                              <Edit className="h-3.5 w-3.5" />
                              Bearbeiten
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Termin bearbeiten</DialogTitle>
                              <DialogDescription>
                                Bearbeite die Details des Termins.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="editTitle">Titel</Label>
                                <Input 
                                  id="editTitle" 
                                  defaultValue={event.title}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="editDate">Datum</Label>
                                  <Input id="editDate" type="date" />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="editTime">Uhrzeit</Label>
                                  <Input id="editTime" defaultValue={event.time} />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="editLocation">Ort</Label>
                                <Input 
                                  id="editLocation" 
                                  defaultValue={event.location}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="editDescription">Beschreibung</Label>
                                <Textarea 
                                  id="editDescription" 
                                  defaultValue={event.description}
                                  rows={4}
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
                              <AlertDialogTitle>Termin wirklich löschen?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Diese Aktion kann nicht rückgängig gemacht werden. Der Termin wird permanent gelöscht.
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
