import { useState } from "react";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { 
  Bell, 
  Send, 
  Users, 
  Calendar,
  Mail,
  CheckCircle,
  Clock,
  Plus,
  FileText,
  Edit,
  Trash2,
  Save
} from "lucide-react";
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  message: string;
  recipients: string;
  sentDate: string;
  status: "sent" | "scheduled" | "draft";
  readCount: number;
  totalRecipients: number;
}

interface MessageTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: "standard" | "events" | "maintenance" | "custom";
}

// Nachrichtenvorlagen
const defaultTemplates: MessageTemplate[] = [
  {
    id: "T001",
    name: "Standard-Benachrichtigung",
    subject: "Neue Mitteilung vom Verein",
    content: "Hallo,\n\nwir möchten dich über Folgendes informieren:\n\n[HIER DEINE NACHRICHT EINFÜGEN]\n\nWeitere Details findest du im Mitgliederbereich.\n\nViele Grüße\nDein Flugmodellsportverein Dingden",
    category: "standard"
  },
  {
    id: "T002",
    name: "Termin-Erinnerung",
    subject: "Erinnerung: Anstehender Termin",
    content: "Hallo,\n\nwir möchten dich an folgenden Termin erinnern:\n\n[TITEL]\nDatum: [DATUM]\nOrt: [ORT]\n\n[BESCHREIBUNG]\n\nWir freuen uns auf dein Kommen!\n\nViele Grüße\nDein Flugmodellsportverein Dingden",
    category: "events"
  },
  {
    id: "T003",
    name: "Platzpflege-Aufruf",
    subject: "Platzpflege - Wir brauchen deine Hilfe!",
    content: "Liebe Vereinsmitglieder,\n\nam [DATUM] findet unsere Platzpflege statt.\n\nWir brauchen jede helfende Hand, um unser Fluggelände in Schuss zu halten!\n\nBitte bringt nach Möglichkeit Werkzeug mit (Spaten, Rechen, Motorsense, Schubkarre, etc.).\n\nFür Verpflegung ist gesorgt.\n\nViele Grüße\nDer Vorstand",
    category: "maintenance"
  },
  {
    id: "T004",
    name: "Wettbewerbs-Einladung",
    subject: "Einladung zum Wettbewerb",
    content: "Hallo Sportfreunde,\n\nam [DATUM] findet unser Wettbewerb statt:\n\n[TITEL]\n\n[BESCHREIBUNG]\n\nMaximale Teilnehmerzahl: [ANZAHL]\nAnmeldeschluss: [DATUM]\n\nWir freuen uns auf spannende Flüge!\n\nSportliche Grüße\nDas Organisationsteam",
    category: "events"
  },
  {
    id: "T005",
    name: "Jahreshauptversammlung",
    subject: "Einladung zur Jahreshauptversammlung",
    content: "Liebe Vereinsmitglieder,\n\nhiermit laden wir herzlich zur Jahreshauptversammlung ein:\n\nDatum: [DATUM]\nUhrzeit: [UHRZEIT]\nOrt: [ORT]\n\nTagesordnung:\n- Bericht des Vorstands\n- Kassenbericht\n- Entlastung des Vorstands\n- Wahlen\n- Planung für das kommende Jahr\n- Verschiedenes\n\nEuer Erscheinen ist wichtig!\n\nMit freundlichen Grüßen\nDer Vorstand",
    category: "events"
  },
  {
    id: "T006",
    name: "Schnuppertag",
    subject: "Schnuppertag - Komm vorbei und probier es aus!",
    content: "Hallo,\n\ndu möchtest den Modellflug kennenlernen? Dann komm zu unserem Schnuppertag!\n\nDatum: [DATUM]\nUhrzeit: [UHRZEIT]\nOrt: Fluggelände Dingden\n\nWir zeigen dir unsere Modelle, beantworten deine Fragen und bei geeignetem Wetter kannst du auch selbst erste Flugerfahrungen sammeln.\n\nFür Jung und Alt geeignet. Keine Anmeldung erforderlich.\n\nWir freuen uns auf dich!\n\nViele Grüße\nDein Flugmodellsportverein Dingden",
    category: "events"
  }
];

export function BenachrichtigungenPage() {
  const [notifications] = useState<Notification[]>([
    {
      id: "N001",
      title: "Vereinsmeisterschaft 2025",
      message: "Anmeldung zur Vereinsmeisterschaft ist jetzt möglich...",
      recipients: "Alle Mitglieder",
      sentDate: "18.01.2025",
      status: "sent",
      readCount: 67,
      totalRecipients: 87
    },
    {
      id: "N002",
      title: "Schnupperflug am 22.06.",
      message: "Helfer für den Schnupperflug gesucht...",
      recipients: "Aktive Mitglieder",
      sentDate: "15.01.2025",
      status: "sent",
      readCount: 45,
      totalRecipients: 52
    },
    {
      id: "N003",
      title: "Winterpause beendet",
      message: "Ab diesem Wochenende wieder regulärer Flugbetrieb...",
      recipients: "Alle Mitglieder",
      sentDate: "22.01.2025",
      status: "scheduled",
      readCount: 0,
      totalRecipients: 87
    },
  ]);

  const getStatusBadge = (status: Notification["status"]) => {
    switch (status) {
      case "sent":
        return (
          <Badge variant="outline" className="gap-1 border-green-500 text-green-700 bg-green-50 dark:bg-green-950/30">
            <CheckCircle className="h-3 w-3" />
            <span className="hidden sm:inline">Gesendet</span>
          </Badge>
        );
      case "scheduled":
        return (
          <Badge variant="outline" className="gap-1 border-blue-500 text-blue-700 bg-blue-50 dark:bg-blue-950/30">
            <Clock className="h-3 w-3" />
            <span className="hidden sm:inline">Geplant</span>
          </Badge>
        );
      case "draft":
        return (
          <Badge variant="outline" className="gap-1 border-gray-500 text-gray-700 bg-gray-50 dark:bg-gray-950/30">
            <Mail className="h-3 w-3" />
            <span className="hidden sm:inline">Entwurf</span>
          </Badge>
        );
    }
  };

  const sentNotifications = notifications.filter(n => n.status === "sent");
  const scheduledNotifications = notifications.filter(n => n.status === "scheduled");
  const totalSent = sentNotifications.length;
  const totalReads = sentNotifications.reduce((sum, n) => sum + n.readCount, 0);

  // Template Management
  const [templates, setTemplates] = useState<MessageTemplate[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [editTemplateDialogOpen, setEditTemplateDialogOpen] = useState(false);
  const [newTemplateDialogOpen, setNewTemplateDialogOpen] = useState(false);
  
  // Message Form State
  const [messageTitle, setMessageTitle] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState("");

  // Apply Template to Message
  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setMessageTitle(template.subject);
      setMessageContent(template.content);
    }
  };

  // Template CRUD Operations
  const handleSaveTemplate = (template: MessageTemplate) => {
    if (template.id) {
      // Update existing
      setTemplates(templates.map(t => t.id === template.id ? template : t));
      toast.success("Vorlage wurde aktualisiert");
    } else {
      // Create new
      const newTemplate = {
        ...template,
        id: `T${String(templates.length + 1).padStart(3, '0')}`
      };
      setTemplates([...templates, newTemplate]);
      toast.success("Vorlage wurde erstellt");
    }
    setEditTemplateDialogOpen(false);
    setNewTemplateDialogOpen(false);
    setSelectedTemplate(null);
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(templates.filter(t => t.id !== templateId));
    toast.success("Vorlage wurde gelöscht");
  };

  const handleEditTemplate = (template: MessageTemplate) => {
    setSelectedTemplate(template);
    setEditTemplateDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="mb-2">Benachrichtigungen</h2>
          <p className="text-muted-foreground">
            Sende Nachrichten an Vereinsmitglieder und verwalte Vorlagen.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Neue Benachrichtigung
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl" aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>Neue Benachrichtigung erstellen</DialogTitle>
              <DialogDescription>
                Wähle optional eine Vorlage aus oder erstelle eine individuelle Nachricht.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Vorlage auswählen */}
              <div className="space-y-2">
                <Label htmlFor="template">Vorlage</Label>
                <Select 
                  value=""
                  onValueChange={applyTemplate}
                >
                  <SelectTrigger id="template">
                    <SelectValue placeholder="Vorlage wählen (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Keine Vorlage</SelectItem>
                    {templates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Betreff</Label>
                <Input 
                  id="title" 
                  value={messageTitle}
                  onChange={(e) => setMessageTitle(e.target.value)}
                  placeholder="Betreff der Nachricht..." 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipients">Empfänger</Label>
                <Select value={selectedRecipients} onValueChange={setSelectedRecipients}>
                  <SelectTrigger id="recipients">
                    <SelectValue placeholder="Wähle Empfängergruppe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Mitglieder (87)</SelectItem>
                    <SelectItem value="active">Aktive Mitglieder (52)</SelectItem>
                    <SelectItem value="youth">Jugendmitglieder (23)</SelectItem>
                    <SelectItem value="passive">Passive Mitglieder (12)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Nachricht</Label>
                <Textarea 
                  id="message" 
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Deine Nachricht..." 
                  rows={8} 
                />
                <p className="text-xs text-muted-foreground">
                  Platzhalter: [TITEL], [DATUM], [UHRZEIT], [ORT], [BESCHREIBUNG], [ANZAHL]
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule">Versandzeitpunkt</Label>
                <Select>
                  <SelectTrigger id="schedule">
                    <SelectValue placeholder="Sofort senden" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="now">Sofort senden</SelectItem>
                    <SelectItem value="tomorrow">Morgen um 09:00</SelectItem>
                    <SelectItem value="custom">Benutzerdefiniert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline">Als Entwurf speichern</Button>
                <Button className="gap-2">
                  <Send className="h-4 w-4" />
                  Senden
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Benachrichtigungen
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="h-4 w-4" />
            Vorlagen
          </TabsTrigger>
        </TabsList>

        {/* Benachrichtigungen Tab */}
        <TabsContent value="notifications" className="space-y-6">
          {/* Statistics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Gesendet</CardTitle>
                <Send className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{totalSent}</div>
                <p className="text-xs text-muted-foreground">
                  Diesen Monat
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Geplant</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{scheduledNotifications.length}</div>
                <p className="text-xs text-muted-foreground">
                  Ausstehend
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Gelesen</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{totalReads}</div>
                <p className="text-xs text-muted-foreground">
                  Gesamt
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Lesequote</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">
                  {totalSent > 0 ? Math.round((totalReads / sentNotifications.reduce((sum, n) => sum + n.totalRecipients, 0)) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Durchschnitt
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Scheduled Notifications */}
          {scheduledNotifications.length > 0 && (
            <div>
              <h3 className="mb-4">Geplante Benachrichtigungen</h3>
              <div className="grid gap-4">
                {scheduledNotifications.map((notification) => (
                  <Card key={notification.id} className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/10">
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <CardTitle className="text-lg break-words">{notification.title}</CardTitle>
                            {getStatusBadge(notification.status)}
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 flex-shrink-0" />
                              <span>{notification.recipients}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 flex-shrink-0" />
                              <span>Geplant für {notification.sentDate}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button variant="outline" size="sm">
                            Bearbeiten
                          </Button>
                          <Button variant="default" size="sm" className="gap-2">
                            <Send className="h-4 w-4" />
                            <span className="hidden sm:inline">Jetzt senden</span>
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Sent Notifications */}
          <div>
            <h3 className="mb-4">Gesendete Benachrichtigungen</h3>
            <div className="grid gap-4">
              {sentNotifications.map((notification) => (
                <Card key={notification.id}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <CardTitle className="text-lg break-words">{notification.title}</CardTitle>
                          {getStatusBadge(notification.status)}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 flex-shrink-0" />
                            <span>{notification.recipients}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span>{notification.sentDate}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 flex-shrink-0" />
                            <span>{notification.readCount} / {notification.totalRecipients} gelesen ({Math.round((notification.readCount / notification.totalRecipients) * 100)}%)</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Details
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Vorlagen Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3>Nachrichtenvorlagen</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Erstelle und verwalte wiederverwendbare Nachrichtenvorlagen.
              </p>
            </div>
            <Dialog open={newTemplateDialogOpen} onOpenChange={setNewTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Neue Vorlage
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Neue Vorlage erstellen</DialogTitle>
                  <DialogDescription>
                    Erstelle eine wiederverwendbare Nachrichtenvorlage.
                  </DialogDescription>
                </DialogHeader>
                <TemplateEditor 
                  onSave={handleSaveTemplate}
                  onCancel={() => setNewTemplateDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Template Categories */}
          <div className="space-y-6">
            {/* Standard Templates */}
            <div>
              <h4 className="mb-3 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Standard
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                {templates.filter(t => t.category === "standard").map(template => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onEdit={handleEditTemplate}
                    onDelete={handleDeleteTemplate}
                  />
                ))}
              </div>
            </div>

            {/* Event Templates */}
            <div>
              <h4 className="mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Termine & Veranstaltungen
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                {templates.filter(t => t.category === "events").map(template => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onEdit={handleEditTemplate}
                    onDelete={handleDeleteTemplate}
                  />
                ))}
              </div>
            </div>

            {/* Maintenance Templates */}
            <div>
              <h4 className="mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Platzpflege & Organisation
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                {templates.filter(t => t.category === "maintenance").map(template => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onEdit={handleEditTemplate}
                    onDelete={handleDeleteTemplate}
                  />
                ))}
              </div>
            </div>

            {/* Custom Templates */}
            {templates.filter(t => t.category === "custom").length > 0 && (
              <div>
                <h4 className="mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Benutzerdefiniert
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  {templates.filter(t => t.category === "custom").map(template => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onEdit={handleEditTemplate}
                      onDelete={handleDeleteTemplate}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Template Dialog */}
      <Dialog open={editTemplateDialogOpen} onOpenChange={setEditTemplateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Vorlage bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeite die ausgewählte Nachrichtenvorlage.
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <TemplateEditor 
              template={selectedTemplate}
              onSave={handleSaveTemplate}
              onCancel={() => {
                setEditTemplateDialogOpen(false);
                setSelectedTemplate(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Template Card Component
function TemplateCard({ 
  template, 
  onEdit, 
  onDelete 
}: { 
  template: MessageTemplate;
  onEdit: (template: MessageTemplate) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base break-words">{template.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1 break-words">
              {template.subject}
            </p>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(template)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => {
                if (confirm("Möchtest du diese Vorlage wirklich löschen?")) {
                  onDelete(template.id);
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
          {template.content}
        </p>
      </CardContent>
    </Card>
  );
}

// Template Editor Component
function TemplateEditor({ 
  template, 
  onSave, 
  onCancel 
}: { 
  template?: MessageTemplate;
  onSave: (template: MessageTemplate) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(template?.name || "");
  const [subject, setSubject] = useState(template?.subject || "");
  const [content, setContent] = useState(template?.content || "");
  const [category, setCategory] = useState<MessageTemplate["category"]>(template?.category || "custom");

  const handleSave = () => {
    if (!name.trim() || !subject.trim() || !content.trim()) {
      toast.error("Bitte fülle alle Felder aus");
      return;
    }

    const templateData: MessageTemplate = {
      id: template?.id || "",
      name: name.trim(),
      subject: subject.trim(),
      content: content.trim(),
      category
    };

    onSave(templateData);
  };

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="template-name">Vorlagenname</Label>
        <Input
          id="template-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="z.B. Platzpflege-Aufruf"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="template-category">Kategorie</Label>
        <Select value={category} onValueChange={(v) => setCategory(v as MessageTemplate["category"])}>
          <SelectTrigger id="template-category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="events">Termine & Veranstaltungen</SelectItem>
            <SelectItem value="maintenance">Platzpflege & Organisation</SelectItem>
            <SelectItem value="custom">Benutzerdefiniert</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="template-subject">Betreff</Label>
        <Input
          id="template-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Betreff der E-Mail..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="template-content">Nachrichtentext</Label>
        <Textarea
          id="template-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Nachrichtentext..."
          rows={10}
        />
        <p className="text-xs text-muted-foreground">
          Verfügbare Platzhalter: [TITEL], [DATUM], [UHRZEIT], [ORT], [BESCHREIBUNG], [ANZAHL]
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Abbrechen
        </Button>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Speichern
        </Button>
      </div>
    </div>
  );
}
