import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { usersService, protocolsService } from "../../lib/api";
import { exportProtocolToPDF } from "../../lib/utils/protocol-pdf-export";
import type { Protocol } from "../../lib/api/protocols.service";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import { RichTextEditor } from "../../components/RichTextEditor";
import { HtmlPreview } from "../../components/HtmlPreview";
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
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { 
  FileText, 
  Upload, 
  Trash2, 
  Eye,
  Download,
  Calendar,
  Folder,
  Plus,
  FilePlus,
  FileEdit,
  List,
  Type,
  AlignLeft,
  CheckSquare,
  Circle,
  ChevronDown,
  Mail,
  Phone,
  Hash,
  Image as ImageIcon,
  Table as TableIcon,
  Save,
  X as XIcon,
  GripVertical,
  Users,
  Paperclip,
  Shield,
  Info,
} from "lucide-react";

interface Document {
  id: string;
  name: string;
  category: "Regelungen" | "Formulare" | "Rechtliches" | "Vorlagen";
  size: string;
  uploadDate: string;
  downloads: number;
}

interface ProtocolSubTopic {
  id: string;
  title: string;
  content: string;
}

interface ProtocolTopic {
  id: string;
  title: string;
  content: string;
  subTopics?: ProtocolSubTopic[];
}

interface ProtocolAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  preview?: string; // Für Bilder
}

interface Attendee {
  id: string;
  name: string;
  role?: string;
}

interface Member {
  id: number;
  firstName: string;
  lastName: string;
  roles?: string[];
}

interface PDFTemplate {
  id: string;
  name: string;
  type: "mitgliedsantrag" | "gaesteliste" | "bescheinigung" | "custom";
}

interface PDFElement {
  id: string;
  type: "text" | "heading" | "table" | "image" | "signature";
  content: string;
  x: number;
  y: number;
  fontSize?: number;
  bold?: boolean;
}

export function DokumentePage() {
  const [activeTab, setActiveTab] = useState("overview");

  // Mitglieder laden
  const loadMembers = useCallback(async () => {
    setLoadingMembers(true);
    try {
      const response = await usersService.getAllMembers();
      
      // Mitglieder in das richtige Format konvertieren
      const formattedMembers = response.members.map(member => ({
        id: member.id,
        firstName: member.first_name,
        lastName: member.last_name,
        roles: member.roles || []
      }));
      
      setMembers(formattedMembers);
    } catch (error: any) {
      console.error("Fehler beim Laden der Mitglieder:", error);
      
      // Network Error - Backend nicht erreichbar
      if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') {
        toast.warning("Backend nicht erreichbar", {
          description: "Mitglieder können im Offline-Modus nicht geladen werden. Starte das Backend oder nutze den Gast-Button."
        });
      } else {
        toast.error("Mitglieder konnten nicht geladen werden", {
          description: "Bitte versuche es später erneut oder kontaktiere den Administrator"
        });
      }
    } finally {
      setLoadingMembers(false);
    }
  }, []);

  useEffect(() => {
    loadMembers();
    loadSavedProtocols();
  }, [loadMembers]);

  // Gespeicherte Protokolle laden
  const loadSavedProtocols = useCallback(async () => {
    setLoadingProtocols(true);
    try {
      const protocols = await protocolsService.getAllProtocols(true); // inkl. Entwürfe
      setSavedProtocols(protocols);
    } catch (error: any) {
      console.error("Fehler beim Laden der Protokolle:", error);
      if (error?.code !== 'ERR_NETWORK') {
        toast.error("Protokolle konnten nicht geladen werden");
      }
    } finally {
      setLoadingProtocols(false);
    }
  }, []);
  const [documents] = useState<Document[]>([
    {
      id: "D001",
      name: "Flugordnung 2025.pdf",
      category: "Regelungen",
      size: "245 KB",
      uploadDate: "15.01.2025",
      downloads: 45
    },
    {
      id: "D002",
      name: "Satzung FMSV Dingden.pdf",
      category: "Rechtliches",
      size: "312 KB",
      uploadDate: "15.12.2024",
      downloads: 67
    },
    {
      id: "D003",
      name: "Beitragsordnung.pdf",
      category: "Regelungen",
      size: "156 KB",
      uploadDate: "01.01.2025",
      downloads: 52
    },
    {
      id: "D004",
      name: "Datenschutzerklärung.pdf",
      category: "Rechtliches",
      size: "198 KB",
      uploadDate: "20.12.2024",
      downloads: 38
    },
    {
      id: "D005",
      name: "Mitgliedsantrag.pdf",
      category: "Formulare",
      size: "128 KB",
      uploadDate: "10.01.2025",
      downloads: 24
    },
    {
      id: "D006",
      name: "Gästeliste Vorlage.pdf",
      category: "Vorlagen",
      size: "95 KB",
      uploadDate: "05.01.2025",
      downloads: 18
    },
  ]);

  const groupedDocuments = documents.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  // Protocol Builder State
  const [protocolTitle, setProtocolTitle] = useState("");
  const [protocolDate, setProtocolDate] = useState("");
  const [protocolStartTime, setProtocolStartTime] = useState("");
  const [protocolEndTime, setProtocolEndTime] = useState("");
  const [protocolLocation, setProtocolLocation] = useState("");
  const [protocolSecretary, setProtocolSecretary] = useState<string>("");
  const [attendanceMode, setAttendanceMode] = useState<"list" | "count">("list");
  const [protocolAttendees, setProtocolAttendees] = useState<Attendee[]>([]);
  const [attendeesCount, setAttendeesCount] = useState<number>(0);
  const [votingRightsCount, setVotingRightsCount] = useState<number>(0);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [showGuestDialog, setShowGuestDialog] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [protocolTopics, setProtocolTopics] = useState<ProtocolTopic[]>([
    { id: "1", title: "", content: "", subTopics: [] }
  ]);
  const [protocolAttachments, setProtocolAttachments] = useState<ProtocolAttachment[]>([]);
  const [protocolPermission, setProtocolPermission] = useState<string>("members");
  const [emailNotification, setEmailNotification] = useState(false);
  const [attachPdfToEmail, setAttachPdfToEmail] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState<string>("");

  // PDF Editor State
  const [pdfElements, setPdfElements] = useState<PDFElement[]>([]);
  const [pdfTitle, setPdfTitle] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  
  // Document Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState<Document["category"]>("Regelungen");
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  // Protocol Management State
  const [savedProtocols, setSavedProtocols] = useState<Protocol[]>([]);
  const [loadingProtocols, setLoadingProtocols] = useState(false);
  const [editingProtocolId, setEditingProtocolId] = useState<number | null>(null);
  const [showProtocolList, setShowProtocolList] = useState(false);

  const getCategoryColor = (category: Document["category"]) => {
    const colors: Record<Document["category"], string> = {
      "Regelungen": "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400",
      "Formulare": "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400",
      "Rechtliches": "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400",
      "Vorlagen": "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400"
    };
    return colors[category];
  };

  const pdfTemplates: PDFTemplate[] = [
    { id: "1", name: "Mitgliedsantrag", type: "mitgliedsantrag" },
    { id: "2", name: "Gästeliste", type: "gaesteliste" },
    { id: "3", name: "Bescheinigung", type: "bescheinigung" },
    { id: "4", name: "Leeres Dokument", type: "custom" },
  ];

  // Protocol Builder Funktionen
  const addProtocolTopic = () => {
    const newTopic: ProtocolTopic = {
      id: Date.now().toString(),
      title: "",
      content: "",
      subTopics: []
    };
    setProtocolTopics([...protocolTopics, newTopic]);
  };

  const removeProtocolTopic = (id: string) => {
    if (protocolTopics.length > 1) {
      setProtocolTopics(protocolTopics.filter(t => t.id !== id));
    }
  };

  const updateProtocolTopic = (id: string, field: keyof ProtocolTopic, value: string) => {
    setProtocolTopics(protocolTopics.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  const addSubTopic = (topicId: string) => {
    const newSubTopic: ProtocolSubTopic = {
      id: Date.now().toString(),
      title: "",
      content: ""
    };
    setProtocolTopics(protocolTopics.map(t => 
      t.id === topicId 
        ? { 
            ...t, 
            content: "", // Content des Hauptpunkts leeren beim ersten Unterpunkt
            subTopics: [...(t.subTopics || []), newSubTopic] 
          } 
        : t
    ));
  };

  const removeSubTopic = (topicId: string, subTopicId: string) => {
    setProtocolTopics(protocolTopics.map(t => 
      t.id === topicId 
        ? { ...t, subTopics: (t.subTopics || []).filter(st => st.id !== subTopicId) } 
        : t
    ));
  };

  const updateSubTopic = (topicId: string, subTopicId: string, field: keyof ProtocolSubTopic, value: string) => {
    setProtocolTopics(protocolTopics.map(t => 
      t.id === topicId 
        ? { 
            ...t, 
            subTopics: (t.subTopics || []).map(st => 
              st.id === subTopicId ? { ...st, [field]: value } : st
            ) 
          } 
        : t
    ));
  };

  const moveProtocolTopic = (id: string, direction: "up" | "down") => {
    const index = protocolTopics.findIndex(t => t.id === id);
    if (direction === "up" && index > 0) {
      const newTopics = [...protocolTopics];
      [newTopics[index - 1], newTopics[index]] = [newTopics[index], newTopics[index - 1]];
      setProtocolTopics(newTopics);
    } else if (direction === "down" && index < protocolTopics.length - 1) {
      const newTopics = [...protocolTopics];
      [newTopics[index], newTopics[index + 1]] = [newTopics[index + 1], newTopics[index]];
      setProtocolTopics(newTopics);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileCount = files.length;
    let uploadedCount = 0;

    Array.from(files).forEach(file => {
      // Größenlimit 10MB
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`Datei zu groß: ${file.name}`, {
          description: "Maximale Dateigröße: 10 MB"
        });
        return;
      }

      const newAttachment: ProtocolAttachment = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: file.type,
        size: file.size
      };

      // Für Bilder Preview erstellen
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setProtocolAttachments(prev => prev.map(att => 
            att.id === newAttachment.id 
              ? { ...att, preview: e.target?.result as string }
              : att
          ));
        };
        reader.readAsDataURL(file);
      }

      setProtocolAttachments(prev => [...prev, newAttachment]);
      uploadedCount++;
    });

    if (uploadedCount > 0) {
      toast.success(`${uploadedCount} ${uploadedCount === 1 ? 'Datei' : 'Dateien'} hinzugefügt`);
    }

    // Input zurücksetzen, damit die gleiche Datei nochmal hochgeladen werden kann
    event.target.value = '';
  };

  const removeAttachment = (id: string) => {
    const attachment = protocolAttachments.find(a => a.id === id);
    setProtocolAttachments(protocolAttachments.filter(a => a.id !== id));
    if (attachment) {
      toast.info(`${attachment.name} wurde entfernt`);
    }
  };

  const addAttendee = () => {
    if (!selectedMemberId) {
      toast.warning("Bitte wähle ein Mitglied aus");
      return;
    }

    const member = members.find(m => m.id.toString() === selectedMemberId);
    if (!member) return;

    // Prüfen ob bereits hinzugefügt
    if (protocolAttendees.some(a => a.id === selectedMemberId)) {
      toast.warning(`${member.firstName} ${member.lastName} ist bereits in der Liste`);
      return;
    }

    const newAttendee: Attendee = {
      id: selectedMemberId,
      name: `${member.firstName} ${member.lastName}`,
      role: member.roles && member.roles.length > 0 ? member.roles[0] : undefined
    };

    setProtocolAttendees([...protocolAttendees, newAttendee]);
    setSelectedMemberId("");
    toast.success(`${newAttendee.name} hinzugefügt`);
  };

  const removeAttendee = (id: string) => {
    const attendee = protocolAttendees.find(a => a.id === id);
    setProtocolAttendees(protocolAttendees.filter(a => a.id !== id));
    if (attendee) {
      toast.info(`${attendee.name} wurde entfernt`);
    }
  };

  const addManualAttendee = () => {
    if (!guestName.trim()) {
      toast.warning("Bitte gib einen Namen ein");
      return;
    }

    const newAttendee: Attendee = {
      id: `manual-${Date.now()}`,
      name: guestName.trim(),
      role: "Gast"
    };

    setProtocolAttendees([...protocolAttendees, newAttendee]);
    setGuestName("");
    setShowGuestDialog(false);
    toast.success(`${newAttendee.name} hinzugefügt`);
  };

  // JSON-Export für Offline-Entwürfe
  const exportDraftAsJSON = () => {
    const draftData = {
      title: protocolTitle,
      date: protocolDate,
      startTime: protocolStartTime,
      endTime: protocolEndTime,
      location: protocolLocation,
      secretary: protocolSecretary,
      attendees: protocolAttendees,
      topics: protocolTopics,
      attachments: protocolAttachments,
      permission: protocolPermission,
      emailNotification: emailNotification,
      attachPdfToEmail: attachPdfToEmail,
      emailSubject: emailSubject,
      emailBody: emailBody,
      exportedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(draftData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    
    const fileName = protocolTitle.trim() 
      ? `Protokoll-Entwurf_${protocolTitle.replace(/[^a-z0-9äöüÄÖÜß\s-]/gi, '').replace(/\s+/g, '_')}_${protocolDate || new Date().toISOString().split('T')[0]}.json`
      : `Protokoll-Entwurf_${new Date().toISOString().split('T')[0]}.json`;
    
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("Entwurf als JSON exportiert!", {
      description: "Du kannst die Datei später über 'JSON-Entwurf laden' wieder importieren"
    });
  };

  const loadDraft = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const draftData = JSON.parse(e.target?.result as string);
        
        // Daten laden
        setProtocolTitle(draftData.title || "");
        setProtocolDate(draftData.date || "");
        setProtocolStartTime(draftData.startTime || draftData.time || "");
        setProtocolEndTime(draftData.endTime || "");
        setProtocolLocation(draftData.location || "");
        setProtocolSecretary(draftData.secretary || "");
        setProtocolAttendees(draftData.attendees || []);
        setProtocolTopics(draftData.topics || [{ id: "1", title: "", content: "", subTopics: [] }]);
        setProtocolAttachments(draftData.attachments || []);
        setProtocolPermission(draftData.permission || "members");
        setEmailNotification(draftData.emailNotification || false);
        setAttachPdfToEmail(draftData.attachPdfToEmail || false);
        setEmailSubject(draftData.emailSubject || "");
        setEmailBody(draftData.emailBody || "");

        toast.success("Entwurf wurde geladen!", {
          description: `Protokoll: ${draftData.title}`
        });
      } catch (error) {
        console.error("Fehler beim Laden des Entwurfs:", error);
        toast.error("Fehler beim Laden des Entwurfs", {
          description: "Die Datei konnte nicht gelesen werden"
        });
      }
    };
    reader.readAsText(file);

    // Input zurücksetzen
    event.target.value = '';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const permissionOptions = [
    { value: "public", label: "Öffentlich", description: "Für jeden sichtbar" },
    { value: "members", label: "Alle Mitglieder", description: "Nur eingeloggte Mitglieder" },
    { value: "board", label: "Nur Vorstand", description: "Vorstandsmitglieder" },
    { value: "board_auditors", label: "Vorstand + Kassenprüfer", description: "Erweiterte Vorstandssicht" },
    { value: "admin", label: "Nur Webmaster", description: "Administratoren" },
  ];

  const emailTemplates = [
    {
      id: "custom",
      name: "Eigene Nachricht",
      subject: "",
      body: ""
    },
    {
      id: "board_meeting",
      name: "Vorstandssitzung",
      subject: "Protokoll: {TITEL}",
      body: `Hallo zusammen,

das Protokoll der Vorstandssitzung vom {DATUM} steht nun zur Verfügung.

Wichtigste Punkte:
{TOPICS}

{PDF_INFO}

Das vollständige Protokoll findest du im Mitgliederbereich unter "Dokumente".

Bei Fragen oder Anmerkungen melde dich gerne.

Mit freundlichen Grüßen
Flugmodellsportverein Dingden e.V.`
    },
    {
      id: "general_meeting",
      name: "Mitgliederversammlung",
      subject: "Protokoll der Mitgliederversammlung - {TITEL}",
      body: `Liebe Vereinsmitglieder,

das Protokoll unserer Mitgliederversammlung vom {DATUM} ist nun verfügbar.

Behandelte Themen:
{TOPICS}

{PDF_INFO}

Bitte schaut euch das Protokoll im Mitgliederbereich an. Bei Einwänden oder Ergänzungen meldet euch bitte innerhalb von 14 Tagen.

Vielen Dank für eure Teilnahme!

Beste Grüße
Der Vorstand
Flugmodellsportverein Dingden e.V.`
    },
    {
      id: "info_simple",
      name: "Einfache Info",
      subject: "Neues Protokoll verfügbar: {TITEL}",
      body: `Hallo,

es gibt ein neues Protokoll vom {DATUM}.

{PDF_INFO}

Du findest es im Mitgliederbereich.

Gruß
Flugmodellsportverein Dingden e.V.`
    },
    {
      id: "training_session",
      name: "Schulungstermin",
      subject: "Schulungsprotokoll: {TITEL}",
      body: `Hallo zusammen,

das Protokoll der Schulung vom {DATUM} ist nun dokumentiert.

Besprochene Themen:
{TOPICS}

{PDF_INFO}

Für Nachfragen stehe ich gerne zur Verfügung.

Gruß
Flugmodellsportverein Dingden e.V.`
    }
  ];

  const saveAsDraft = async () => {
    // Validation
    if (!protocolTitle.trim()) {
      toast.error("Bitte gib einen Titel für das Protokoll ein");
      return;
    }
    if (!protocolDate) {
      toast.error("Bitte wähle ein Datum für das Protokoll");
      return;
    }

    const draftData = {
      title: protocolTitle,
      protocol_date: protocolDate,
      protocol_start_time: protocolStartTime || undefined,
      protocol_end_time: protocolEndTime || undefined,
      location: protocolLocation || undefined,
      secretary_id: protocolSecretary || undefined,
      attendance_mode: attendanceMode,
      attendees: protocolAttendees,
      attendees_count: attendeesCount,
      voting_rights_count: votingRightsCount,
      topics: protocolTopics,
      attachments: protocolAttachments,
      permission_level: protocolPermission,
      email_subject: emailSubject || undefined,
      email_body: emailBody || undefined,
      pdf_attached_to_email: attachPdfToEmail,
      is_draft: true
    };

    try {
      if (editingProtocolId) {
        // Update existing draft
        await protocolsService.updateProtocol(editingProtocolId, draftData);
        toast.success("Entwurf wurde aktualisiert!");
      } else {
        // Create new draft
        const result = await protocolsService.saveDraft(draftData);
        setEditingProtocolId(result.protocol_id);
        toast.success("Entwurf wurde gespeichert!", {
          description: "Du kannst das Protokoll später weiter bearbeiten"
        });
      }
      
      // Protokolle neu laden
      await loadSavedProtocols();
    } catch (error: any) {
      console.error("Fehler beim Speichern des Entwurfs:", error);
      
      // Fallback: Als JSON-Datei herunterladen
      if (error?.code === 'ERR_NETWORK') {
        toast.warning("Backend nicht erreichbar - Entwurf wird als Datei gespeichert");
        const dataStr = JSON.stringify(draftData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Protokoll-Entwurf_${protocolTitle.replace(/[^a-z0-9]/gi, '_')}_${protocolDate}.json`;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        toast.error("Fehler beim Speichern des Entwurfs");
      }
    }
  };

  const generatePDF = async () => {
    // Validation
    if (!protocolTitle.trim()) {
      toast.error("Bitte gib einen Titel für das Protokoll ein");
      return;
    }
    if (!protocolDate) {
      toast.error("Bitte wähle ein Datum für das Protokoll");
      return;
    }

    const emptyTopics = protocolTopics.filter(t => !t.title.trim());
    if (emptyTopics.length > 0) {
      toast.warning("Einige Tagesordnungspunkte haben keinen Titel", {
        description: "Bitte fülle alle Themen aus oder entferne leere Punkte"
      });
      return;
    }

    // E-Mail Validierung wenn aktiviert
    if (emailNotification) {
      if (!emailSubject.trim()) {
        toast.error("Bitte gib einen E-Mail-Betreff ein");
        return;
      }
      if (!emailBody.trim()) {
        toast.error("Bitte gib eine E-Mail-Nachricht ein");
        return;
      }
    }

    try {
      // PDF exportieren
      exportProtocolToPDF({
        title: protocolTitle,
        date: protocolDate,
        startTime: protocolStartTime,
        endTime: protocolEndTime,
        location: protocolLocation,
        secretary: protocolSecretary,
        attendanceMode: attendanceMode,
        attendees: protocolAttendees,
        attendeesCount: attendeesCount,
        votingRightsCount: votingRightsCount,
        topics: protocolTopics,
        attachments: protocolAttachments,
        permission: protocolPermission
      });

      // Backend-Integration - Protokoll speichern & E-Mail-Versand
      const protocolData = {
        title: protocolTitle,
        protocol_date: protocolDate,
        protocol_start_time: protocolStartTime || undefined,
        protocol_end_time: protocolEndTime || undefined,
        location: protocolLocation || undefined,
        secretary_id: protocolSecretary || undefined,
        attendance_mode: attendanceMode,
        attendees: protocolAttendees,
        attendees_count: attendeesCount,
        voting_rights_count: votingRightsCount,
        topics: protocolTopics,
        attachments: protocolAttachments,
        permission_level: protocolPermission,
        email_notification: emailNotification,
        email_subject: emailSubject || undefined,
        email_body: emailBody || undefined,
        pdf_attached_to_email: attachPdfToEmail,
        is_draft: false
      };

      try {
        if (editingProtocolId) {
          // Update und veröffentlichen
          await protocolsService.updateProtocol(editingProtocolId, protocolData);
          await protocolsService.publishProtocol(editingProtocolId);
        } else {
          // Neu erstellen
          await protocolsService.createProtocol(protocolData);
        }
        
        // Protokolle neu laden
        await loadSavedProtocols();
        
        const permissionLabel = permissionOptions.find(p => p.value === protocolPermission)?.label;
        
        if (emailNotification) {
          toast.success("Protokoll wurde gespeichert und als PDF exportiert!", {
            description: attachPdfToEmail 
              ? `E-Mail mit PDF wird an alle berechtigten Mitglieder (${permissionLabel}) versendet`
              : `E-Mail-Benachrichtigung wird an alle berechtigten Mitglieder (${permissionLabel}) versendet`
          });
        } else {
          toast.success("Protokoll wurde gespeichert und als PDF exportiert!", {
            description: `Sichtbar für: ${permissionLabel}`
          });
        }

        // Formular zurücksetzen nach erfolgreichem Speichern
        resetProtocol();
        setEditingProtocolId(null);
        
      } catch (backendError: any) {
        console.error("Backend-Fehler:", backendError);
        
        if (backendError?.code === 'ERR_NETWORK') {
          toast.warning("Protokoll wurde als PDF exportiert, konnte aber nicht im System gespeichert werden", {
            description: "Backend ist nicht erreichbar"
          });
        } else {
          const permissionLabel = permissionOptions.find(p => p.value === protocolPermission)?.label;
          toast.success("Protokoll wurde als PDF exportiert!", {
            description: `Sichtbar für: ${permissionLabel}. Hinweis: Speicherung im System fehlgeschlagen.`
          });
        }
      }
    } catch (error) {
      console.error("Fehler beim Erstellen des PDFs:", error);
      toast.error("Fehler beim Erstellen des PDFs", {
        description: "Bitte versuche es erneut"
      });
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const resetProtocol = () => {
    const shouldReset = editingProtocolId 
      ? confirm("Möchtest du die Bearbeitung abbrechen? Nicht gespeicherte Änderungen gehen verloren.")
      : confirm("Möchtest du wirklich alle Eingaben zurücksetzen? Diese Aktion kann nicht rückgängig gemacht werden.");
    
    if (shouldReset) {
      setProtocolTitle("");
      setProtocolDate("");
      setProtocolStartTime("");
      setProtocolEndTime("");
      setProtocolLocation("");
      setProtocolSecretary("");
      setAttendanceMode("list");
      setProtocolAttendees([]);
      setAttendeesCount(0);
      setVotingRightsCount(0);
      setSelectedMemberId("");
      setProtocolTopics([{ id: "1", title: "", content: "", subTopics: [] }]);
      setProtocolAttachments([]);
      setProtocolPermission("members");
      setEmailNotification(false);
      setAttachPdfToEmail(false);
      setEmailSubject("");
      setEmailBody("");
      setSelectedEmailTemplate("");
      setEditingProtocolId(null);
      toast.info("Alle Eingaben wurden zurückgesetzt");
    }
  };

  const loadProtocolForEditing = (protocol: Protocol) => {
    setProtocolTitle(protocol.title);
    setProtocolDate(protocol.protocol_date);
    setProtocolStartTime(protocol.protocol_start_time || protocol.protocol_time || "");
    setProtocolEndTime(protocol.protocol_end_time || "");
    setProtocolLocation(protocol.location || "");
    setProtocolSecretary(protocol.secretary_id?.toString() || "");
    setAttendanceMode(protocol.attendance_mode || "list");
    setProtocolAttendees(protocol.attendees);
    setAttendeesCount(protocol.attendees_count || 0);
    setVotingRightsCount(protocol.voting_rights_count || 0);
    setProtocolTopics(protocol.topics.length > 0 ? protocol.topics : [{ id: "1", title: "", content: "", subTopics: [] }]);
    setProtocolAttachments(protocol.attachments);
    setProtocolPermission(protocol.permission_level);
    setEmailNotification(!!protocol.email_subject);
    setAttachPdfToEmail(protocol.pdf_attached_to_email);
    setEmailSubject(protocol.email_subject || "");
    setEmailBody(protocol.email_body || "");
    setEditingProtocolId(protocol.id);
    setShowProtocolList(false);
    setActiveTab("protocol");
    
    toast.info("Protokoll wurde geladen", {
      description: protocol.is_draft ? "Du bearbeitest einen Entwurf" : "Du bearbeitest ein veröffentlichtes Protokoll"
    });
  };

  const deleteProtocol = async (protocolId: number, protocolTitle: string) => {
    if (!confirm(`Möchtest du das Protokoll "${protocolTitle}" wirklich löschen?`)) {
      return;
    }

    try {
      await protocolsService.deleteProtocol(protocolId);
      toast.success("Protokoll wurde gelöscht");
      
      // Wenn das gerade bearbeitete Protokoll gelöscht wurde, zurücksetzen
      if (editingProtocolId === protocolId) {
        resetProtocol();
      }
      
      // Protokolle neu laden
      await loadSavedProtocols();
    } catch (error: any) {
      console.error("Fehler beim Löschen:", error);
      if (error?.code === 'ERR_NETWORK') {
        toast.error("Backend nicht erreichbar", {
          description: "Protokoll konnte nicht gelöscht werden"
        });
      } else {
        toast.error("Fehler beim Löschen des Protokolls");
      }
    }
  };

  const applyEmailTemplate = (templateId: string) => {
    const template = emailTemplates.find(t => t.id === templateId);
    if (!template) return;

    setSelectedEmailTemplate(templateId);

    if (templateId === "custom") {
      // Leere Vorlage
      if (!emailSubject) setEmailSubject("");
      if (!emailBody) setEmailBody("");
      return;
    }

    // Platzhalter ersetzen
    let subject = template.subject;
    let body = template.body;

    // {TITEL} ersetzen
    subject = subject.replace(/{TITEL}/g, protocolTitle || "[Titel]");
    body = body.replace(/{TITEL}/g, protocolTitle || "[Titel]");

    // {DATUM} ersetzen
    const formattedDate = protocolDate 
      ? new Date(protocolDate).toLocaleDateString('de-DE', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : "[Datum]";
    subject = subject.replace(/{DATUM}/g, formattedDate);
    body = body.replace(/{DATUM}/g, formattedDate);

    // {TOPICS} ersetzen
    const topicsList = protocolTopics
      .filter(t => t.title.trim())
      .map((t, idx) => `• ${t.title}`)
      .join('\n');
    body = body.replace(/{TOPICS}/g, topicsList || "Siehe Protokoll");

    // {PDF_INFO} ersetzen
    const pdfInfo = attachPdfToEmail 
      ? "Das vollständige Protokoll ist als PDF im Anhang dieser E-Mail." 
      : "Das Protokoll findest du im Mitgliederbereich.";
    body = body.replace(/{PDF_INFO}/g, pdfInfo);

    setEmailSubject(subject);
    setEmailBody(body);
  };

  // Automatisches Aktualisieren der Vorlage wenn sich relevante Daten ändern
  useEffect(() => {
    if (selectedEmailTemplate && selectedEmailTemplate !== "custom" && emailNotification) {
      applyEmailTemplate(selectedEmailTemplate);
    }
  }, [protocolTitle, protocolDate, attachPdfToEmail, protocolTopics, selectedEmailTemplate, emailNotification]);

  const loadTemplate = (templateType: string) => {
    setSelectedTemplate(templateType);
    if (templateType === "mitgliedsantrag") {
      setPdfTitle("Mitgliedsantrag - FMSV Dingden e.V.");
      setPdfElements([
        { id: "1", type: "heading", content: "Mitgliedsantrag", x: 0, y: 0, fontSize: 24, bold: true },
        { id: "2", type: "text", content: "Flugmodellsportverein Dingden e.V.", x: 0, y: 40, fontSize: 12 },
        { id: "3", type: "text", content: "Hiermit beantrage ich die Mitgliedschaft im FMSV Dingden e.V.", x: 0, y: 80, fontSize: 11 },
      ]);
    } else if (templateType === "gaesteliste") {
      setPdfTitle("Gästeliste");
      setPdfElements([
        { id: "1", type: "heading", content: "Gästeliste", x: 0, y: 0, fontSize: 20, bold: true },
        { id: "2", type: "table", content: "Name|Datum|Unterschrift", x: 0, y: 40, fontSize: 10 },
      ]);
    } else if (templateType === "bescheinigung") {
      setPdfTitle("Bescheinigung");
      setPdfElements([
        { id: "1", type: "heading", content: "Bescheinigung", x: 0, y: 0, fontSize: 22, bold: true },
        { id: "2", type: "text", content: "Hiermit wird bescheinigt, dass...", x: 0, y: 60, fontSize: 11 },
      ]);
    } else {
      setPdfTitle("Neues Dokument");
      setPdfElements([]);
    }
  };

  const addPDFElement = (type: PDFElement["type"]) => {
    const newElement: PDFElement = {
      id: Date.now().toString(),
      type,
      content: type === "heading" ? "Überschrift" : type === "table" ? "Spalte 1|Spalte 2" : "Neuer Text",
      x: 0,
      y: pdfElements.length * 40,
      fontSize: type === "heading" ? 18 : 11,
      bold: type === "heading",
    };
    setPdfElements([...pdfElements, newElement]);
  };

  const removePDFElement = (id: string) => {
    setPdfElements(pdfElements.filter(e => e.id !== id));
  };

  const updatePDFElement = (id: string, updates: Partial<PDFElement>) => {
    setPdfElements(pdfElements.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const generateCustomPDF = () => {
    // Validation
    if (!pdfTitle.trim()) {
      toast.error("Bitte gib einen Titel für das Dokument ein");
      return;
    }

    if (pdfElements.length === 0) {
      toast.error("Bitte füge mindestens ein Element hinzu");
      return;
    }

    try {
      // Dynamischer Import von jsPDF
      import('jspdf').then(({ jsPDF }) => {
        const doc = new jsPDF();
        let yPosition = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const maxWidth = pageWidth - 2 * margin;

        // Helper function to check if new page is needed
        const checkNewPage = (neededSpace: number) => {
          if (yPosition + neededSpace > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage();
            yPosition = 20;
          }
        };

        // Render each element
        pdfElements.forEach((element) => {
          const fontSize = element.fontSize || 11;
          const fontStyle = element.bold ? "bold" : "normal";

          doc.setFontSize(fontSize);
          doc.setFont("helvetica", fontStyle);

          checkNewPage(fontSize * 0.5);

          if (element.type === "heading") {
            doc.text(element.content, pageWidth / 2, yPosition, { align: "center" });
            yPosition += fontSize * 0.5 + 5;
          } else if (element.type === "text") {
            const lines = doc.splitTextToSize(element.content, maxWidth);
            doc.text(lines, margin, yPosition);
            yPosition += lines.length * (fontSize * 0.4) + 5;
          } else if (element.type === "table") {
            // Simple table rendering
            const columns = element.content.split("|");
            const columnWidth = maxWidth / columns.length;
            
            doc.setFont("helvetica", "bold");
            columns.forEach((col, idx) => {
              doc.text(col.trim(), margin + idx * columnWidth, yPosition);
            });
            
            // Add line under header
            yPosition += fontSize * 0.4 + 2;
            doc.setLineWidth(0.5);
            doc.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 8;
            
            doc.setFont("helvetica", "normal");
          } else if (element.type === "signature") {
            yPosition += 15;
            doc.setLineWidth(0.5);
            doc.line(margin, yPosition, margin + 80, yPosition);
            yPosition += 5;
            doc.setFontSize(9);
            doc.text("Unterschrift", margin, yPosition);
            yPosition += 10;
          }
        });

        // Footer
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(128, 128, 128);
          doc.text(
            `Seite ${i} von ${pageCount} - ${pdfTitle}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: "center" }
          );
        }

        // Save PDF
        const fileName = `${pdfTitle.replace(/[^a-z0-9]/gi, '_')}.pdf`;
        doc.save(fileName);

        toast.success("PDF wurde erfolgreich erstellt!", {
          description: `Datei: ${fileName}`
        });
      });
    } catch (error) {
      console.error("Fehler beim Erstellen des PDFs:", error);
      toast.error("Fehler beim Erstellen des PDFs", {
        description: "Bitte versuche es erneut"
      });
    }
  };

  const previewCustomPDF = () => {
    if (!pdfTitle.trim()) {
      toast.warning("Bitte gib einen Titel ein, um die Vorschau zu sehen");
      return;
    }
    if (pdfElements.length === 0) {
      toast.warning("Füge mindestens ein Element hinzu");
      return;
    }
    toast.info("Vorschau-Funktion", {
      description: "Die Vorschau zeigt eine vereinfachte Darstellung. Nutze 'Als PDF speichern' für das finale Dokument."
    });
  };

  const handleDocumentUpload = () => {
    if (!uploadFile) {
      toast.error("Bitte wähle eine Datei aus");
      return;
    }

    // File size check (5 MB limit)
    if (uploadFile.size > 5 * 1024 * 1024) {
      toast.error("Datei zu groß", {
        description: "Maximale Dateigröße: 5 MB"
      });
      return;
    }

    // File type check
    if (uploadFile.type !== "application/pdf") {
      toast.error("Ungültiger Dateityp", {
        description: "Nur PDF-Dateien sind erlaubt"
      });
      return;
    }

    // TODO: Backend-Integration - Datei hochladen
    console.log("Uploading document:", {
      file: uploadFile,
      category: uploadCategory
    });

    toast.success("Dokument wurde hochgeladen!", {
      description: `${uploadFile.name} wurde in der Kategorie "${uploadCategory}" gespeichert`
    });

    // Reset and close
    setUploadFile(null);
    setUploadCategory("Regelungen");
    setShowUploadDialog(false);
  };

  const savePDFDraft = () => {
    if (!pdfTitle.trim()) {
      toast.error("Bitte gib einen Titel für das Dokument ein");
      return;
    }

    const draftData = {
      title: pdfTitle,
      template: selectedTemplate,
      elements: pdfElements,
      isDraft: true,
      createdAt: new Date().toISOString()
    };

    console.log("PDF-Entwurf gespeichert:", draftData);
    
    // Entwurf als JSON exportieren
    const dataStr = JSON.stringify(draftData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PDF-Entwurf_${pdfTitle.replace(/[^a-z0-9]/gi, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("Entwurf wurde gespeichert!", {
      description: "Du kannst das Dokument später weiter bearbeiten"
    });
  };

  const loadPDFDraft = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const draftData = JSON.parse(e.target?.result as string);
        
        // Daten laden
        setPdfTitle(draftData.title || "");
        setSelectedTemplate(draftData.template || "");
        setPdfElements(draftData.elements || []);

        toast.success("Entwurf wurde geladen!", {
          description: `Dokument: ${draftData.title}`
        });
      } catch (error) {
        console.error("Fehler beim Laden des Entwurfs:", error);
        toast.error("Fehler beim Laden des Entwurfs", {
          description: "Die Datei konnte nicht gelesen werden"
        });
      }
    };
    reader.readAsText(file);

    // Input zurücksetzen
    event.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2">Dokumenten-Verwaltung</h2>
        <p className="text-muted-foreground">
          Verwalte Vereinsdokumente, erstelle PDFs und Formulare.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">Dokumente</span>
          </TabsTrigger>
          <TabsTrigger value="protocols" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Protokolle</span>
            {savedProtocols.filter(p => p.is_draft).length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                {savedProtocols.filter(p => p.is_draft).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pdf" className="gap-2">
            <FilePlus className="h-4 w-4" />
            <span className="hidden sm:inline">PDF erstellen</span>
          </TabsTrigger>
          <TabsTrigger value="protocol" className="gap-2">
            <FileEdit className="h-4 w-4" />
            <span className="hidden sm:inline">Protokoll {editingProtocolId ? "bearbeiten" : "erstellen"}</span>
          </TabsTrigger>
        </TabsList>

        {/* PROTOKOLLÜBERSICHT */}
        <TabsContent value="protocols" className="space-y-6">
          <div className="flex justify-end">
            <Button 
              className="gap-2"
              onClick={() => {
                resetProtocol();
                setActiveTab("protocol");
              }}
            >
              <Plus className="h-4 w-4" />
              Neues Protokoll
            </Button>
          </div>

          {/* Statistics */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Protokolle gesamt</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{savedProtocols.length}</div>
                <p className="text-xs text-muted-foreground">
                  Veröffentlicht: {savedProtocols.filter(p => !p.is_draft).length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Entwürfe</CardTitle>
                <FileEdit className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{savedProtocols.filter(p => p.is_draft).length}</div>
                <p className="text-xs text-muted-foreground">
                  Nicht veröffentlicht
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Neuestes Protokoll</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg truncate">
                  {savedProtocols.length > 0 
                    ? new Date(savedProtocols[0].protocol_date).toLocaleDateString('de-DE')
                    : "—"
                  }
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {savedProtocols.length > 0 ? savedProtocols[0].title : "Keine Protokolle"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Protokoll-Liste */}
          {loadingProtocols ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Lade Protokolle...</p>
              </CardContent>
            </Card>
          ) : savedProtocols.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="mb-2">Noch keine Protokolle</h3>
                <p className="text-muted-foreground mb-4">
                  Erstelle dein erstes Protokoll, um loszulegen
                </p>
                <Button onClick={() => setActiveTab("protocol")} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Protokoll erstellen
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Entwürfe */}
              {savedProtocols.filter(p => p.is_draft).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileEdit className="h-5 w-5" />
                      Entwürfe ({savedProtocols.filter(p => p.is_draft).length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {savedProtocols.filter(p => p.is_draft).map((protocol) => (
                        <div 
                          key={protocol.id} 
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                            <div className="h-10 w-10 rounded-lg bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900 flex items-center justify-center flex-shrink-0">
                              <FileEdit className="h-5 w-5 text-orange-700 dark:text-orange-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="mb-1 break-words">{protocol.title}</p>
                              <div className="flex flex-wrap items-center gap-2 text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                                <span>{new Date(protocol.protocol_date).toLocaleDateString('de-DE')}</span>
                                <span className="hidden sm:inline">·</span>
                                <span>{protocol.topics.length} Themen</span>
                                <span className="hidden sm:inline">·</span>
                                <span>Entwurf</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 sm:flex-shrink-0">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 sm:flex-initial gap-2"
                              onClick={() => loadProtocolForEditing(protocol)}
                            >
                              <FileEdit className="h-4 w-4" />
                              <span className="hidden sm:inline">Bearbeiten</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-destructive hover:text-destructive flex-1 sm:flex-initial gap-2"
                              onClick={() => deleteProtocol(protocol.id, protocol.title)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="hidden sm:inline">Löschen</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Veröffentlichte Protokolle */}
              {savedProtocols.filter(p => !p.is_draft).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Veröffentlichte Protokolle ({savedProtocols.filter(p => !p.is_draft).length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {savedProtocols.filter(p => !p.is_draft).map((protocol) => (
                        <div 
                          key={protocol.id} 
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                            <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 flex items-center justify-center flex-shrink-0">
                              <FileText className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="mb-1 break-words">{protocol.title}</p>
                              <div className="flex flex-wrap items-center gap-2 text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                                <span>{new Date(protocol.protocol_date).toLocaleDateString('de-DE')}</span>
                                <span className="hidden sm:inline">·</span>
                                <span>{protocol.topics.length} Themen</span>
                                <span className="hidden sm:inline">·</span>
                                <span>
                                  {protocol.attendance_mode === "count" && protocol.attendees_count 
                                    ? `${protocol.attendees_count} Anwesende` 
                                    : `${protocol.attendees.length} Anwesende`}
                                </span>
                                {protocol.creator_name && (
                                  <>
                                    <span className="hidden sm:inline">·</span>
                                    <span className="hidden sm:inline">{protocol.creator_name}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 sm:flex-shrink-0">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 sm:flex-initial gap-2"
                              onClick={() => loadProtocolForEditing(protocol)}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="hidden sm:inline">Ansehen</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 sm:flex-initial gap-2"
                              onClick={() => {
                                loadProtocolForEditing(protocol);
                                // Direkt PDF generieren
                                setTimeout(() => generatePDF(), 100);
                              }}
                            >
                              <Download className="h-4 w-4" />
                              <span className="hidden sm:inline">PDF</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-destructive hover:text-destructive hidden sm:inline-flex"
                              onClick={() => deleteProtocol(protocol.id, protocol.title)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* DOKUMENTENÜBERSICHT */}
        <TabsContent value="overview" className="space-y-6">
          <div className="flex justify-end">
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Dokument hochladen
                </Button>
              </DialogTrigger>
              <DialogContent aria-describedby={undefined}>
                <DialogHeader>
                  <DialogTitle>Neues Dokument hochladen</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="file">Datei</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        id="file" 
                        type="file" 
                        accept=".pdf"
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      />
                    </div>
                    {uploadFile && (
                      <p className="text-sm text-muted-foreground">
                        Ausgewählt: {uploadFile.name} ({(uploadFile.size / 1024).toFixed(0)} KB)
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Nur PDF-Dateien, maximal 5 MB
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Kategorie</Label>
                    <Select value={uploadCategory} onValueChange={(value) => setUploadCategory(value as Document["category"])}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Wähle eine Kategorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Regelungen">Regelungen</SelectItem>
                        <SelectItem value="Formulare">Formulare</SelectItem>
                        <SelectItem value="Rechtliches">Rechtliches</SelectItem>
                        <SelectItem value="Vorlagen">Vorlagen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowUploadDialog(false);
                        setUploadFile(null);
                      }}
                    >
                      Abbrechen
                    </Button>
                    <Button 
                      className="gap-2"
                      onClick={handleDocumentUpload}
                      disabled={!uploadFile}
                    >
                      <Upload className="h-4 w-4" />
                      Hochladen
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Statistics */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Dokumente</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{documents.length}</div>
                <p className="text-xs text-muted-foreground">
                  Gesamt
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Downloads</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{documents.reduce((sum, d) => sum + d.downloads, 0)}</div>
                <p className="text-xs text-muted-foreground">
                  Gesamt
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Kategorien</CardTitle>
                <Folder className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{Object.keys(groupedDocuments).length}</div>
                <p className="text-xs text-muted-foreground">
                  Aktive Kategorien
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Beliebtestes</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl truncate">{documents.sort((a, b) => b.downloads - a.downloads)[0]?.name.split('.')[0]}</div>
                <p className="text-xs text-muted-foreground">
                  {documents.sort((a, b) => b.downloads - a.downloads)[0]?.downloads} Downloads
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Documents by Category */}
          {Object.entries(groupedDocuments).map(([category, docs]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Folder className="h-5 w-5" />
                  {category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {docs.map((doc) => (
                    <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getCategoryColor(doc.category as Document["category"])}`}>
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="mb-1 break-words">{doc.name}</p>
                          <div className="flex flex-wrap items-center gap-2 text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                            <span>{doc.size}</span>
                            <span className="hidden sm:inline">·</span>
                            <span>{doc.uploadDate}</span>
                            <span className="hidden sm:inline">·</span>
                            <span>{doc.downloads} Downloads</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 sm:flex-shrink-0">
                        <Button variant="outline" size="sm" className="flex-1 sm:flex-initial gap-2">
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline">Ansehen</span>
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 sm:flex-initial gap-2">
                          <Download className="h-4 w-4" />
                          <span className="hidden sm:inline">Download</span>
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hidden sm:inline-flex">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* PDF-EDITOR */}
        <TabsContent value="pdf" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle>PDF-Dokument erstellen</CardTitle>
              <div className="flex gap-2">
                {/* Entwurf laden */}
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => document.getElementById('load-pdf-draft-input')?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Entwurf laden
                </Button>
                <input
                  id="load-pdf-draft-input"
                  type="file"
                  accept=".json"
                  onChange={loadPDFDraft}
                  className="hidden"
                />
                
                {(pdfTitle || pdfElements.length > 0) && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={savePDFDraft}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Entwurf speichern
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Template Auswahl */}
              <div className="space-y-2">
                <Label>Vorlage wählen</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {pdfTemplates.map((template) => (
                    <Button
                      key={template.id}
                      variant={selectedTemplate === template.type ? "default" : "outline"}
                      className="h-auto py-4 flex-col gap-2"
                      onClick={() => loadTemplate(template.type)}
                    >
                      <FileText className="h-6 w-6" />
                      <span className="text-sm">{template.name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {selectedTemplate && (
                <>
                  {/* PDF Titel */}
                  <div className="space-y-2">
                    <Label htmlFor="pdf-title">Dokumententitel</Label>
                    <Input
                      id="pdf-title"
                      value={pdfTitle}
                      onChange={(e) => setPdfTitle(e.target.value)}
                      placeholder="Titel des Dokuments"
                    />
                  </div>

                  {/* Element Hinzufügen */}
                  <div className="space-y-2">
                    <Label>Elemente hinzufügen</Label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addPDFElement("heading")}
                        className="gap-2"
                      >
                        <Type className="h-4 w-4" />
                        Überschrift
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addPDFElement("text")}
                        className="gap-2"
                      >
                        <AlignLeft className="h-4 w-4" />
                        Text
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addPDFElement("table")}
                        className="gap-2"
                      >
                        <TableIcon className="h-4 w-4" />
                        Tabelle
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addPDFElement("signature")}
                        className="gap-2"
                      >
                        <FileEdit className="h-4 w-4" />
                        Unterschrift
                      </Button>
                    </div>
                  </div>

                  {/* PDF Elemente */}
                  <div className="space-y-3">
                    <Label>Inhalt</Label>
                    {pdfElements.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                        Füge Elemente hinzu, um dein PDF zu erstellen
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pdfElements.map((element, index) => (
                          <Card key={element.id} className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Badge variant="outline">
                                  {element.type === "heading" && "Überschrift"}
                                  {element.type === "text" && "Text"}
                                  {element.type === "table" && "Tabelle"}
                                  {element.type === "signature" && "Unterschrift"}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removePDFElement(element.id)}
                                >
                                  <XIcon className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              {element.type === "table" ? (
                                <div className="space-y-2">
                                  <Label className="text-sm">Tabellenspalten (getrennt mit |)</Label>
                                  <Input
                                    value={element.content}
                                    onChange={(e) => updatePDFElement(element.id, { content: e.target.value })}
                                    placeholder="Spalte 1|Spalte 2|Spalte 3"
                                  />
                                </div>
                              ) : element.type === "signature" ? (
                                <div className="text-sm text-muted-foreground">
                                  Unterschriftsfeld wird automatisch eingefügt
                                </div>
                              ) : (
                                <Textarea
                                  value={element.content}
                                  onChange={(e) => updatePDFElement(element.id, { content: e.target.value })}
                                  placeholder="Inhalt eingeben..."
                                  rows={element.type === "heading" ? 1 : 3}
                                />
                              )}
                              
                              {element.type !== "signature" && (
                                <div className="flex gap-2">
                                  <div className="flex-1 space-y-2">
                                    <Label className="text-sm">Schriftgröße</Label>
                                    <Input
                                      type="number"
                                      value={element.fontSize || 11}
                                      onChange={(e) => updatePDFElement(element.id, { fontSize: parseInt(e.target.value) })}
                                      min="8"
                                      max="48"
                                    />
                                  </div>
                                  <div className="flex items-end">
                                    <Button
                                      variant={element.bold ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => updatePDFElement(element.id, { bold: !element.bold })}
                                    >
                                      <strong>Fett</strong>
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Vorschau und Export */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      className="gap-2 flex-1"
                      onClick={previewCustomPDF}
                    >
                      <Eye className="h-4 w-4" />
                      Vorschau
                    </Button>
                    <Button 
                      className="gap-2 flex-1"
                      onClick={generateCustomPDF}
                    >
                      <Download className="h-4 w-4" />
                      Als PDF speichern
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* VORSCHAU DIALOG */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <DialogTitle>Protokoll-Vorschau</DialogTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">So wird das Protokoll aussehen</p>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Header */}
              <div className="text-center border-b pb-6 bg-gradient-to-r from-muted/30 to-muted/10 rounded-lg p-6 -mx-2">
                <div className="text-sm text-muted-foreground mb-1">Flugmodellsportverein Dingden e.V.</div>
                <h3 className="text-xl font-semibold">{protocolTitle}</h3>
              </div>

              {/* Meta-Informationen */}
              <div className="grid gap-2 text-sm">
                <div className="flex gap-2">
                  <span className="text-muted-foreground min-w-24">Datum:</span>
                  <span>{new Date(protocolDate).toLocaleDateString('de-DE', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                {(protocolStartTime || protocolEndTime) && (
                  <div className="flex gap-2">
                    <span className="text-muted-foreground min-w-24">Uhrzeit:</span>
                    <span>
                      {protocolStartTime && `${protocolStartTime} Uhr`}
                      {protocolStartTime && protocolEndTime && ' - '}
                      {protocolEndTime && `${protocolEndTime} Uhr`}
                    </span>
                  </div>
                )}
                {protocolLocation && (
                  <div className="flex gap-2">
                    <span className="text-muted-foreground min-w-24">Ort:</span>
                    <span>{protocolLocation}</span>
                  </div>
                )}
              </div>

              {/* Anwesende */}
              {(attendanceMode === "count" && attendeesCount > 0) || (attendanceMode === "list" && protocolAttendees.length > 0) ? (
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold">Anwesende Personen</h4>
                    {attendanceMode === "list" && (
                      <Badge variant="secondary" className="ml-auto">{protocolAttendees.length}</Badge>
                    )}
                  </div>
                  
                  {attendanceMode === "count" ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-sm bg-background/50 rounded px-3 py-2">
                        <span className="font-medium">Anzahl Anwesende:</span>
                        <span className="ml-auto">{attendeesCount}</span>
                      </div>
                      {votingRightsCount > 0 && (
                        <div className="flex items-center gap-3 text-sm bg-background/50 rounded px-3 py-2">
                          <span className="font-medium">davon Stimmberechtigte:</span>
                          <span className="ml-auto">{votingRightsCount}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {protocolAttendees.map((attendee) => (
                        <div key={attendee.id} className="flex items-center gap-2 text-sm bg-background/50 rounded px-3 py-2">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <span>{attendee.name}</span>
                          {attendee.role && <span className="text-muted-foreground text-xs ml-auto">({attendee.role})</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              {/* Tagesordnungspunkte */}
              <div className="border-t pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <List className="h-4 w-4 text-primary" />
                  <h4 className="font-semibold">Tagesordnung</h4>
                  <Badge variant="secondary" className="ml-auto">{protocolTopics.length}</Badge>
                </div>
                <div className="space-y-4">
                  {protocolTopics.map((topic, index) => (
                    <div key={topic.id} className="bg-muted/30 rounded-lg p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-primary">{index + 1}</span>
                        </div>
                        <div className="flex-1 space-y-2">
                          <h4 className="font-semibold">{topic.title || `Thema ${index + 1}`}</h4>
                          <HtmlPreview 
                            content={topic.content} 
                            className="text-sm text-muted-foreground"
                          />

                          {/* Unterpunkte in Vorschau */}
                          {topic.subTopics && topic.subTopics.length > 0 && (
                            <div className="space-y-2 mt-3 border-l-2 border-primary/30 pl-3 ml-1">
                              {topic.subTopics.map((subTopic, subIndex) => (
                                <div key={subTopic.id} className="bg-background/50 rounded p-2 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-xs h-5">
                                      {index + 1}.{subIndex + 1}
                                    </Badge>
                                    <p className="text-sm font-medium">{subTopic.title}</p>
                                  </div>
                                  <HtmlPreview 
                                    content={subTopic.content} 
                                    className="text-xs text-muted-foreground pl-2"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Anhänge */}
              {protocolAttachments.length > 0 && (
                <div className="border-t pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Paperclip className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold">Anhänge</h4>
                    <Badge variant="secondary" className="ml-auto">{protocolAttachments.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {protocolAttachments.map((attachment, idx) => (
                      <div key={attachment.id} className="flex items-center gap-3 bg-muted/30 rounded-lg p-3">
                        <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{attachment.name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">{idx + 1}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sichtbarkeit */}
              <div className="border-t pt-6">
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Sichtbarkeit</p>
                      <p className="text-xs text-muted-foreground">{permissionOptions.find(p => p.value === protocolPermission)?.description}</p>
                    </div>
                    <Badge variant="secondary">{permissionOptions.find(p => p.value === protocolPermission)?.label}</Badge>
                  </div>
                  
                  {emailNotification && (
                    <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-lg p-3">
                      <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">E-Mail-Benachrichtigung aktiv</p>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                          Berechtigte Mitglieder werden benachrichtigt{attachPdfToEmail && " (mit PDF-Anhang)"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* E-Mail Vorschau - Nur wenn aktiviert */}
                {emailNotification && (
                  <div className="border-t pt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Mail className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold">E-Mail-Vorschau</h4>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Betreff:</p>
                        <p className="text-sm font-medium">{emailSubject || "[Kein Betreff]"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Nachricht:</p>
                        <div className="text-sm whitespace-pre-wrap bg-background/50 p-3 rounded border max-h-40 overflow-y-auto">
                          {emailBody || "[Keine Nachricht]"}
                        </div>
                      </div>
                      {attachPdfToEmail && (
                        <div className="flex items-center gap-2 text-xs bg-primary/10 text-primary px-3 py-2 rounded">
                          <FileText className="h-3 w-3" />
                          <span className="font-medium">Anhang: {protocolTitle || "Protokoll"}.pdf</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t bg-muted/30 -mx-6 -mb-6 px-6 pb-6 rounded-b-lg">
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Eye className="h-3 w-3" />
                Dies ist nur eine Vorschau - das finale PDF kann leicht abweichen
              </p>
              <Button variant="outline" onClick={() => setShowPreview(false)} className="sm:w-auto w-full">
                Schließen
              </Button>
              <Button onClick={() => {
                setShowPreview(false);
                generatePDF();
              }}>
                Protokoll speichern
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* PROTOKOLL-BUILDER */}
        <TabsContent value="protocol" className="space-y-6">
          {editingProtocolId && (
            <Card className="bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <FileEdit className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">Du bearbeitest ein vorhandenes Protokoll</p>
                    <p className="text-sm text-muted-foreground">
                      Alle Änderungen werden gespeichert, wenn du auf "Entwurf" oder "Speichern" klickst.
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      if (confirm("Möchtest du die Bearbeitung wirklich abbrechen? Nicht gespeicherte Änderungen gehen verloren.")) {
                        resetProtocol();
                      }
                    }}
                    className="flex-shrink-0"
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {!editingProtocolId && (
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-900/50">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="space-y-3 flex-1">
                    <div>
                      <p className="font-semibold text-blue-900 dark:text-blue-100">So erstellst du ein Protokoll</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-0.5">Folge diesen einfachen Schritten</p>
                    </div>
                    <ol className="text-sm space-y-2 text-blue-800 dark:text-blue-200">
                      <li className="flex gap-2">
                        <span className="font-semibold text-blue-600 dark:text-blue-400 flex-shrink-0">1.</span>
                        <span>Fülle die Grunddaten aus (Titel, Datum, Anwesende)</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold text-blue-600 dark:text-blue-400 flex-shrink-0">2.</span>
                        <span>Trage die Tagesordnungspunkte mit den dazugehörigen Notizen ein</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold text-blue-600 dark:text-blue-400 flex-shrink-0">3.</span>
                        <span>Optional: Füge Bilder oder Dokumente als Anhänge hinzu</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold text-blue-600 dark:text-blue-400 flex-shrink-0">4.</span>
                        <span>Wähle aus, wer das Protokoll sehen darf</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold text-blue-600 dark:text-blue-400 flex-shrink-0">5.</span>
                        <span>Optional: Benachrichtige Mitglieder per E-Mail</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold text-blue-600 dark:text-blue-400 flex-shrink-0">6.</span>
                        <span>Klicke auf "Vorschau" zum Kontrollieren oder direkt auf "Speichern"</span>
                      </li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <CardTitle>{editingProtocolId ? "Protokoll bearbeiten" : "Neues Protokoll erstellen"}</CardTitle>
                  {!editingProtocolId && savedProtocols.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {savedProtocols.length} {savedProtocols.length === 1 ? "Protokoll" : "Protokolle"} bereits gespeichert
                    </p>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 items-center">
                  {savedProtocols.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("protocols")}
                      className="gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      <span className="hidden sm:inline">Zur Übersicht</span>
                    </Button>
                  )}
                  
                  <div className="flex gap-2">
                {/* JSON Import/Export */}
                {!editingProtocolId && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => document.getElementById('load-draft-input')?.click()}
                    >
                      <Upload className="h-4 w-4" />
                      <span className="hidden sm:inline">JSON-Entwurf laden</span>
                      <span className="sm:hidden">Laden</span>
                    </Button>
                    <input
                      id="load-draft-input"
                      type="file"
                      accept=".json"
                      onChange={loadDraft}
                      className="hidden"
                    />
                    
                    {(protocolTitle || protocolDate || protocolAttendees.length > 0 || protocolTopics.some(t => t.title || t.content)) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={exportDraftAsJSON}
                      >
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Als JSON exportieren</span>
                        <span className="sm:hidden">Export</span>
                      </Button>
                    )}
                  </>
                )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Grunddaten */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Grunddaten</h3>
                    <p className="text-xs text-muted-foreground">Titel, Datum und Ort des Protokolls</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="protocol-title">Titel des Protokolls *</Label>
                  <Input
                    id="protocol-title"
                    value={protocolTitle}
                    onChange={(e) => setProtocolTitle(e.target.value)}
                    placeholder="z.B. Vorstandssitzung März 2025"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="protocol-date">Datum *</Label>
                    <Input
                      id="protocol-date"
                      type="date"
                      value={protocolDate}
                      onChange={(e) => setProtocolDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="protocol-start-time">Startzeit</Label>
                    <Input
                      id="protocol-start-time"
                      type="time"
                      value={protocolStartTime}
                      onChange={(e) => setProtocolStartTime(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="protocol-end-time">Endzeit</Label>
                    <Input
                      id="protocol-end-time"
                      type="time"
                      value={protocolEndTime}
                      onChange={(e) => setProtocolEndTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="protocol-location">Ort</Label>
                    <Input
                      id="protocol-location"
                      value={protocolLocation}
                      onChange={(e) => setProtocolLocation(e.target.value)}
                      placeholder="z.B. Vereinsheim"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="protocol-secretary">Schriftführer</Label>
                    <Select value={protocolSecretary} onValueChange={setProtocolSecretary}>
                      <SelectTrigger id="protocol-secretary">
                        <SelectValue placeholder="Schriftführer auswählen..." />
                      </SelectTrigger>
                      <SelectContent>
                        {members.length === 0 ? (
                          <SelectItem value="none" disabled>
                            {loadingMembers ? "Lade..." : "Keine Mitglieder verfügbar"}
                          </SelectItem>
                        ) : (
                          members.map((member) => (
                            <SelectItem key={member.id} value={member.id.toString()}>
                              {member.firstName} {member.lastName}
                              {member.roles && member.roles.length > 0 && ` (${member.roles[0]})`}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-2 border-b">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Anwesende Personen</h3>
                      <p className="text-xs text-muted-foreground">Wer war bei der Sitzung dabei?</p>
                    </div>
                  </div>
                  
                  {/* Mode Toggle */}
                  <div className="space-y-3">
                    <Label>Erfassungsmodus</Label>
                    <RadioGroup value={attendanceMode} onValueChange={(value: "list" | "count") => setAttendanceMode(value)} className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="list" id="mode-list" />
                        <Label htmlFor="mode-list" className="cursor-pointer">Namentliche Liste</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="count" id="mode-count" />
                        <Label htmlFor="mode-count" className="cursor-pointer">Nur Anzahl</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {!loadingMembers && members.length === 0 && attendanceMode === "list" && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg p-3">
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        ℹ️ Backend nicht erreichbar. Nutze den "Gast"-Button, um Personen manuell hinzuzufügen.
                      </p>
                    </div>
                  )}

                  {attendanceMode === "list" ? (
                    <Card className="p-4">
                    <div className="space-y-4">
                      {/* Personen hinzufügen */}
                      <div className="flex gap-2">
                        <Select value={selectedMemberId} onValueChange={setSelectedMemberId} disabled={loadingMembers}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder={loadingMembers ? "Mitglieder werden geladen..." : members.length === 0 ? "Keine Mitglieder verfügbar" : "Mitglied auswählen..."} />
                          </SelectTrigger>
                          <SelectContent>
                            {members.length === 0 ? (
                              <SelectItem value="none" disabled>
                                {loadingMembers ? "Lade..." : "Keine Mitglieder verfügbar"}
                              </SelectItem>
                            ) : (
                              members.map((member) => (
                                <SelectItem key={member.id} value={member.id.toString()}>
                                  {member.firstName} {member.lastName}
                                  {member.roles && member.roles.length > 0 && ` (${member.roles[0]})`}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <Button 
                          onClick={addAttendee} 
                          variant="outline"
                          disabled={!selectedMemberId || selectedMemberId === "none" || loadingMembers}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Hinzufügen
                        </Button>
                        <Button onClick={() => setShowGuestDialog(true)} variant="outline" title="Externe Person hinzufügen">
                          <Plus className="h-4 w-4 mr-2" />
                          Gast
                        </Button>
                      </div>

                      {/* Liste der Anwesenden */}
                      {protocolAttendees.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            {protocolAttendees.length} {protocolAttendees.length === 1 ? 'Person' : 'Personen'} anwesend:
                          </p>
                          <div className="space-y-2">
                            {protocolAttendees.map((attendee) => (
                              <div
                                key={attendee.id}
                                className="flex items-center justify-between p-2 rounded border bg-muted/30"
                              >
                                <div className="flex items-center gap-2">
                                  <span>{attendee.name}</span>
                                  {attendee.role && (
                                    <Badge variant="secondary" className="text-xs">
                                      {attendee.role}
                                    </Badge>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeAttendee(attendee.id)}
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                >
                                  <XIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Noch keine Personen hinzugefügt. Wähle Mitglieder aus der Liste oder füge Gäste hinzu.
                        </p>
                      )}
                    </div>
                  </Card>
                  ) : (
                    <Card className="p-4">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="attendees-count">Anzahl Anwesende</Label>
                            <Input
                              id="attendees-count"
                              type="number"
                              min="0"
                              value={attendeesCount}
                              onChange={(e) => setAttendeesCount(parseInt(e.target.value) || 0)}
                              placeholder="z.B. 15"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="voting-rights-count">davon Stimmberechtigte</Label>
                            <Input
                              id="voting-rights-count"
                              type="number"
                              min="0"
                              max={attendeesCount}
                              value={votingRightsCount}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setVotingRightsCount(Math.min(val, attendeesCount));
                              }}
                              placeholder="z.B. 12"
                            />
                          </div>
                        </div>
                        {attendeesCount > 0 && (
                          <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded">
                            <p>
                              Es {attendeesCount === 1 ? 'ist' : 'sind'} <span className="font-semibold">{attendeesCount}</span> {attendeesCount === 1 ? 'Person' : 'Personen'} anwesend{votingRightsCount > 0 && (
                                <>, davon <span className="font-semibold">{votingRightsCount}</span> stimmberechtigt{votingRightsCount === 1 ? 'e' : 'e'}.</>
                              )}.
                            </p>
                          </div>
                        )}
                      </div>
                    </Card>
                  )}
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <List className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Tagesordnungspunkte</h3>
                    <p className="text-xs text-muted-foreground">{protocolTopics.length} {protocolTopics.length === 1 ? 'Punkt' : 'Punkte'}</p>
                  </div>
                  <Button onClick={addProtocolTopic} className="gap-2" variant="outline" size="sm">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Thema hinzufügen</span>
                    <span className="sm:hidden">Hinzufügen</span>
                  </Button>
                </div>

                <div className="space-y-4">
                  {protocolTopics.map((topic, index) => (
                    <Card key={topic.id} className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move mt-1" />
                            <Badge variant="outline">TOP {index + 1}</Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveProtocolTopic(topic.id, "up")}
                              disabled={index === 0}
                            >
                              ↑
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveProtocolTopic(topic.id, "down")}
                              disabled={index === protocolTopics.length - 1}
                            >
                              ↓
                            </Button>
                            {protocolTopics.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeProtocolTopic(topic.id)}
                              >
                                <XIcon className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`topic-title-${topic.id}`}>
                            Thema {index + 1}
                          </Label>
                          <Input
                            id={`topic-title-${topic.id}`}
                            value={topic.title}
                            onChange={(e) => updateProtocolTopic(topic.id, "title", e.target.value)}
                            placeholder="z.B. Bericht des Vorstands, Finanzbericht, Terminplanung..."
                          />
                        </div>

                        {/* Notizfeld - nur anzeigen, wenn keine Unterpunkte vorhanden */}
                        {(!topic.subTopics || topic.subTopics.length === 0) && (
                          <div className="space-y-2">
                            <Label htmlFor={`topic-content-${topic.id}`}>
                              Notizen / Beschlüsse zu {topic.title || `Thema ${index + 1}`}
                            </Label>
                            <RichTextEditor
                              content={topic.content}
                              onChange={(content) => updateProtocolTopic(topic.id, "content", content)}
                              placeholder="Hier die Notizen, Diskussionspunkte und Beschlüsse eintragen..."
                              minHeight="200px"
                            />
                          </div>
                        )}

                        {/* Unterpunkte */}
                        {topic.subTopics && topic.subTopics.length > 0 && (
                          <div className="space-y-3 border-l-2 border-primary/20 pl-4 ml-4">
                            {topic.subTopics.map((subTopic, subIndex) => (
                              <div key={subTopic.id} className="space-y-3 bg-muted/20 rounded-lg p-3">
                                <div className="flex items-center justify-between gap-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {index + 1}.{subIndex + 1}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeSubTopic(topic.id, subTopic.id)}
                                  >
                                    <XIcon className="h-3 w-3" />
                                  </Button>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`subtopic-title-${subTopic.id}`} className="text-xs">
                                    Unterpunkt-Titel
                                  </Label>
                                  <Input
                                    id={`subtopic-title-${subTopic.id}`}
                                    value={subTopic.title}
                                    onChange={(e) => updateSubTopic(topic.id, subTopic.id, "title", e.target.value)}
                                    placeholder="z.B. Beschluss, Detail, Aufgabe..."
                                    className="h-8 text-sm"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`subtopic-content-${subTopic.id}`} className="text-xs">
                                    Inhalt
                                  </Label>
                                  <RichTextEditor
                                    content={subTopic.content}
                                    onChange={(content) => updateSubTopic(topic.id, subTopic.id, "content", content)}
                                    placeholder="Details zum Unterpunkt..."
                                    minHeight="120px"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Unterpunkt hinzufügen Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addSubTopic(topic.id)}
                          className="gap-2 ml-4"
                        >
                          <Plus className="h-3 w-3" />
                          Unterpunkt hinzufügen
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Anhänge */}
              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Paperclip className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Anhänge (optional)</h3>
                    <p className="text-xs text-muted-foreground">Bilder, PDFs oder Dokumente hinzufügen</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Input
                      id="protocol-attachments"
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('protocol-attachments')?.click()}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Dateien / Bilder hinzufügen
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      PDFs, Bilder, Word-Dokumente
                    </p>
                  </div>

                  {protocolAttachments.length > 0 && (
                    <div className="space-y-3">
                      <Label>Hochgeladene Dateien ({protocolAttachments.length})</Label>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {protocolAttachments.map((attachment) => (
                          <Card key={attachment.id} className="p-3">
                            {attachment.preview ? (
                              <div className="space-y-2">
                                <div className="aspect-video relative rounded overflow-hidden bg-muted">
                                  <img
                                    src={attachment.preview}
                                    alt={attachment.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm truncate">{attachment.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatFileSize(attachment.size)}
                                  </p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeAttachment(attachment.id)}
                                  className="w-full gap-2"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  Entfernen
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <div className="h-10 w-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm truncate">{attachment.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatFileSize(attachment.size)}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeAttachment(attachment.id)}
                                  className="w-full gap-2"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  Entfernen
                                </Button>
                              </div>
                            )}
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Berechtigungen und Benachrichtigungen */}
              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Sichtbarkeit & Benachrichtigung</h3>
                    <p className="text-xs text-muted-foreground">Zugriffsrechte und E-Mail-Versand</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="protocol-permission">Wer kann dieses Protokoll lesen?</Label>
                  <Select value={protocolPermission} onValueChange={setProtocolPermission}>
                    <SelectTrigger id="protocol-permission">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {permissionOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex flex-col">
                            <span>{option.label}</span>
                            <span className="text-xs text-muted-foreground">{option.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Legt fest, welche Mitglieder Zugriff auf dieses Protokoll haben
                  </p>
                </div>

                <Card className="p-4 bg-muted/50">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="email-notification"
                        checked={emailNotification}
                        onChange={(e) => {
                          setEmailNotification(e.target.checked);
                          if (!e.target.checked) setAttachPdfToEmail(false);
                        }}
                        className="mt-1 rounded"
                      />
                      <div className="flex-1">
                        <Label htmlFor="email-notification" className="cursor-pointer">
                          Mitglieder per E-Mail benachrichtigen
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Alle berechtigten Mitglieder werden über das neue Protokoll informiert
                        </p>
                      </div>
                    </div>

                    {emailNotification && (
                      <div className="flex items-start gap-3 pl-8 border-l-2 border-primary/20">
                        <input
                          type="checkbox"
                          id="attach-pdf"
                          checked={attachPdfToEmail}
                          onChange={(e) => setAttachPdfToEmail(e.target.checked)}
                          className="mt-1 rounded"
                        />
                        <div className="flex-1">
                          <Label htmlFor="attach-pdf" className="cursor-pointer">
                            Protokoll als PDF anhängen
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Das Protokoll wird direkt als PDF-Datei an die E-Mail angehängt
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* E-Mail Editor - nur wenn Benachrichtigung aktiviert */}
                {emailNotification && (
                  <Card className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4>E-Mail-Nachricht</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Wähle eine Vorlage oder schreibe eine eigene Nachricht
                          </p>
                        </div>
                        <Select 
                          value={selectedEmailTemplate} 
                          onValueChange={applyEmailTemplate}
                        >
                          <SelectTrigger className="w-[220px]">
                            <SelectValue placeholder="Vorlage wählen..." />
                          </SelectTrigger>
                          <SelectContent>
                            {emailTemplates.map(template => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email-subject">Betreff</Label>
                        <Input
                          id="email-subject"
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          placeholder="Betreff der E-Mail eingeben..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email-body">Nachricht</Label>
                        <Textarea
                          id="email-body"
                          value={emailBody}
                          onChange={(e) => setEmailBody(e.target.value)}
                          placeholder="Nachricht eingeben oder Vorlage auswählen..."
                          rows={12}
                          className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          Tipp: Wähle eine Vorlage aus und passe sie nach Bedarf an. Die Platzhalter werden automatisch ersetzt.
                        </p>
                      </div>

                      {selectedEmailTemplate && selectedEmailTemplate !== "custom" && (
                        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded p-3">
                          <p className="text-xs text-muted-foreground">
                            <strong>Verfügbare Platzhalter:</strong><br />
                            {"{TITEL}"} = Protokolltitel • {"{DATUM}"} = Datum formatiert • {"{TOPICS}"} = Liste der Themen • {"{PDF_INFO}"} = Info über PDF-Anhang
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (!emailSubject.trim() || !emailBody.trim()) {
                              toast.warning("E-Mail ist noch nicht vollständig ausgefüllt");
                              return;
                            }
                            toast.success("Test-E-Mail würde versendet", {
                              description: `Empfänger: ${permissionOptions.find(p => p.value === protocolPermission)?.label}`
                            });
                          }}
                          className="gap-2"
                        >
                          <Mail className="h-3 w-3" />
                          Test-E-Mail an mich senden
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const recipientCount = protocolPermission === "members" ? "alle Mitglieder" 
                              : protocolPermission === "board" ? "den Vorstand"
                              : protocolPermission === "public" ? "alle registrierten Benutzer"
                              : "die berechtigten Personen";
                            alert(`Die E-Mail würde an ${recipientCount} versendet werden.\n\nBetreff: ${emailSubject}\n\nZeichen: ${emailBody.length}`);
                          }}
                          className="gap-2 text-muted-foreground"
                        >
                          <Eye className="h-3 w-3" />
                          Empfänger anzeigen
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              {/* Aktionen */}
              <Card className="bg-gradient-to-br from-muted/50 to-muted/30 border-2">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileEdit className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Protokoll fertigstellen</h4>
                        <p className="text-xs text-muted-foreground">Speichern und veröffentlichen</p>
                      </div>
                    </div>
                    
                    {!protocolTitle || !protocolDate ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileEdit className="h-10 w-10 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">
                          Fülle mindestens Titel und Datum aus, um das Protokoll zu speichern
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className="gap-2 flex-1"
                            onClick={handlePreview}
                          >
                            <Eye className="h-4 w-4" />
                            Vorschau
                          </Button>
                          <Button 
                            variant="outline" 
                            className="gap-2 flex-1"
                            onClick={saveAsDraft}
                          >
                            <Save className="h-4 w-4" />
                            Als Entwurf speichern
                          </Button>
                        </div>
                        
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-muted/50 px-2 text-muted-foreground">
                              oder
                            </span>
                          </div>
                        </div>
                        
                        <Button 
                          className="gap-2 w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all"
                          onClick={generatePDF}
                          size="lg"
                        >
                          <Download className="h-5 w-5" />
                          <span className="hidden sm:inline">
                            {editingProtocolId 
                              ? "Protokoll aktualisieren und PDF exportieren"
                              : `Protokoll speichern und ${emailNotification ? "versenden" : "veröffentlichen"}`
                            }
                          </span>
                          <span className="sm:hidden">
                            {editingProtocolId ? "Aktualisieren" : "Speichern"}
                          </span>
                        </Button>
                        
                        {emailNotification && (
                          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded p-3">
                            <div className="flex gap-2">
                              <Mail className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-muted-foreground">
                                {attachPdfToEmail 
                                  ? "Das Protokoll wird im System gespeichert, als PDF exportiert und per E-Mail an alle berechtigten Mitglieder versendet"
                                  : "Das Protokoll wird im System gespeichert, als PDF exportiert und die Mitglieder werden per E-Mail benachrichtigt"
                                }
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {!emailNotification && (
                          <p className="text-xs text-center text-muted-foreground">
                            Das Protokoll wird im System gespeichert und als PDF heruntergeladen
                          </p>
                        )}
                        
                        <div className="pt-3 border-t space-y-2">
                          {!editingProtocolId && (
                            <div className="text-xs text-center text-muted-foreground pb-2">
                              💡 Tipp: Nutze oben den Button "Als JSON exportieren" für Offline-Backups
                            </div>
                          )}
                          <Button 
                            variant="ghost" 
                            className="gap-2 w-full text-muted-foreground"
                            onClick={resetProtocol}
                            size="sm"
                          >
                            <XIcon className="h-4 w-4" />
                            {editingProtocolId ? "Bearbeitung abbrechen" : "Alle Eingaben zurücksetzen"}
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* GAST HINZUFÜGEN DIALOG */}
      <Dialog open={showGuestDialog} onOpenChange={setShowGuestDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gast hinzufügen</DialogTitle>
            <DialogDescription>
              Füge eine externe Person oder einen Gast hinzu, der nicht in der Mitgliederliste ist.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="guest-name">Name der Person</Label>
              <Input
                id="guest-name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="z.B. Max Mustermann"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addManualAttendee();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setShowGuestDialog(false);
              setGuestName("");
            }}>
              Abbrechen
            </Button>
            <Button onClick={addManualAttendee}>
              <Plus className="h-4 w-4 mr-2" />
              Hinzufügen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
