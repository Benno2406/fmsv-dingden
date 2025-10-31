import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../components/ui/command';
import { Plane, GraduationCap, Clock, AlertTriangle, LogOut, ChevronDown, Zap, Fuel, BarChart3, UserCheck, UserCircle, Radio, UserPlus, Check, ChevronsUpDown, Plus, X, Users, ArrowRightLeft, Undo2 } from 'lucide-react';
import { cn } from '../components/ui/utils';
import { Separator } from '../components/ui/separator';
import { Checkbox } from '../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';

// Mock Data - später durch echte API-Calls ersetzen
const mockInstructors = [
  {
    id: 1,
    name: 'Max Mustermann',
    initials: 'MM',
    startTime: '09:30',
    isActive: true,
  },
  {
    id: 2,
    name: 'Hans Müller',
    initials: 'HM',
    startTime: '10:00',
    isActive: true,
  },
];

// Verfügbare Flugleiter (volljährige Vereinsmitglieder)
const mockAvailableInstructors = [
  { id: 1, name: 'Max Mustermann', initials: 'MM', isAdult: true },
  { id: 2, name: 'Hans Müller', initials: 'HM', isAdult: true },
  { id: 3, name: 'Thomas Schmidt', initials: 'TS', isAdult: true },
  { id: 4, name: 'Peter Wagner', initials: 'PW', isAdult: true },
  { id: 5, name: 'Frank Schneider', initials: 'FS', isAdult: true },
  { id: 6, name: 'Jürgen Klein', initials: 'JK', isAdult: true },
  { id: 7, name: 'Wolfgang Bauer', initials: 'WB', isAdult: true },
];

const mockActivePilots = [
  {
    id: 1,
    name: 'Thomas Schmidt',
    initials: 'TS',
    startTime: '10:15',
    currentFlights: 2,
    frequency: '35 MHz (K40)',
    driveTypes: ['Elektro', 'Verbrenner'], // Antriebstypen
    memberType: 'member', // 'member' or 'guest'
    flights: [
      { id: 1, modelName: 'Multiplex Heron', modelType: 'Elektro', startTime: '10:20', endTime: '10:45', duration: 25 },
      { id: 2, modelName: 'Graupner Alpha 110', modelType: 'Verbrenner', startTime: '11:15', endTime: '11:32', duration: 17 },
    ],
    students: [
      {
        id: 1,
        name: 'Lukas Fischer',
        initials: 'LF',
        modelName: 'Graupner Taxi',
        modelType: 'Verbrenner',
        frequency: '35 MHz (K61)',
        notes: '',
        startTime: '10:25',
      },
    ],
  },
  {
    id: 2,
    name: 'Klaus Becker',
    initials: 'KB',
    startTime: '14:20',
    currentFlights: 5,
    frequency: '2.4 GHz',
    driveTypes: ['Elektro'], // Antriebstypen
    memberType: 'guest', // 'member' or 'guest'
    flights: [
      { id: 3, modelName: 'ASW 28', modelType: 'Elektro', startTime: '14:25', endTime: '15:10', duration: 45 },
      { id: 4, modelName: 'Pilatus PC-6', modelType: 'Elektro', startTime: '15:20', endTime: '15:42', duration: 22 },
      { id: 5, modelName: 'ASW 28', modelType: 'Elektro', startTime: '16:00', endTime: '16:35', duration: 35 },
      { id: 6, modelName: 'Extra 330', modelType: 'Verbrenner', startTime: '16:50', endTime: '17:05', duration: 15 },
      { id: 7, modelName: 'ASW 28', modelType: 'Elektro', startTime: '17:15', endTime: '', duration: 0 },
    ],
    students: [],
  },
  {
    id: 3,
    name: 'Peter Wagner',
    initials: 'PW',
    startTime: '11:00',
    currentFlights: 1,
    frequency: '2.4 GHz',
    driveTypes: ['Elektro'], // Antriebstypen
    memberType: 'member', // 'member' or 'guest'
    flights: [
      { id: 8, modelName: 'Multiplex EasyStar 3', modelType: 'Elektro', startTime: '11:05', endTime: '', duration: 0 },
    ],
    students: [
      {
        id: 2,
        name: 'Anna Meier',
        initials: 'AM',
        modelName: 'Multiplex EasyStar 3',
        modelType: 'Elektro',
        frequency: '2.4 GHz',
        notes: '',
        startTime: '11:10',
      },
    ],
  },
];

export function FlugplatzKioskPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [instructors, setInstructors] = useState(mockInstructors);
  const [activePilots, setActivePilots] = useState(mockActivePilots);
  const [expandedPilots, setExpandedPilots] = useState<number[]>([]);
  const [expandedDetails, setExpandedDetails] = useState<number[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [confirmEndShift, setConfirmEndShift] = useState<{ open: boolean; instructorId: number | null; instructorName: string }>({ open: false, instructorId: null, instructorName: '' });
  const [confirmRemovePilot, setConfirmRemovePilot] = useState<{ open: boolean; pilotId: number | null; pilotName: string }>({ open: false, pilotId: null, pilotName: '' });
  const [confirmReplaceInstructor, setConfirmReplaceInstructor] = useState<{ 
    open: boolean; 
    departingInstructorId: number | null; 
    departingInstructorName: string;
    remainingInstructor: { id: number; name: string } | null;
  }>({ open: false, departingInstructorId: null, departingInstructorName: '', remainingInstructor: null });
  const [replacementInstructor, setReplacementInstructor] = useState<string>('');
  const [openReplacementCombobox, setOpenReplacementCombobox] = useState(false);
  
  // Pflicht-Ersatz Dialog (wenn letzter FL bei >= 3 Piloten)
  const [mandatoryReplacement, setMandatoryReplacement] = useState<{
    open: boolean;
    departingInstructorId: number | null;
    departingInstructorName: string;
  }>({ open: false, departingInstructorId: null, departingInstructorName: '' });
  const [mandatoryReplacementInstructor, setMandatoryReplacementInstructor] = useState<string>('');
  const [openMandatoryReplacementCombobox, setOpenMandatoryReplacementCombobox] = useState(false);
  const [needsMandatorySecondInstructor, setNeedsMandatorySecondInstructor] = useState(false);
  const [mandatorySecondInstructor, setMandatorySecondInstructor] = useState<string>('');
  const [openMandatorySecondCombobox, setOpenMandatorySecondCombobox] = useState(false);
  const [mandatoryWarning, setMandatoryWarning] = useState<string>('');
  
  // Flugleiter Eintragung State
  const [selectedInstructor, setSelectedInstructor] = useState<string>('');
  const [needsSecondInstructor, setNeedsSecondInstructor] = useState(false);
  const [secondInstructor, setSecondInstructor] = useState<string>('');
  const [instructorWarning, setInstructorWarning] = useState<string>('');
  const [openInstructorCombobox, setOpenInstructorCombobox] = useState(false);
  const [openSecondInstructorCombobox, setOpenSecondInstructorCombobox] = useState(false);
  
  // Pilot Eintragen States
  const [pilotType, setPilotType] = useState<'member' | 'guest'>('member');
  const [selectedPilotMember, setSelectedPilotMember] = useState<string>('');
  const [pilotMemberSearchOpen, setPilotMemberSearchOpen] = useState(false);
  const [guestPilotName, setGuestPilotName] = useState('');
  const [isElektro, setIsElektro] = useState(false);
  const [isVerbrenner, setIsVerbrenner] = useState(false);
  const [is24GHz, setIs24GHz] = useState(false);
  const [is35MHz, setIs35MHz] = useState(false);
  const [channel, setChannel] = useState('');
  const [isFlugschueler, setIsFlugschueler] = useState(false);
  const [schuelerType, setSchuelerType] = useState<'mitglied' | 'gast'>('mitglied');
  const [selectedSchuelerMember, setSelectedSchuelerMember] = useState<string>('');
  const [schuelerMemberSearchOpen, setSchuelerMemberSearchOpen] = useState(false);
  const [guestSchuelerName, setGuestSchuelerName] = useState('');
  const [guestSchuelerEmail, setGuestSchuelerEmail] = useState('');
  const [guestSchuelerPhone, setGuestSchuelerPhone] = useState('');
  
  type Flugschueler = {
    id: string;
    type: 'mitglied' | 'gast';
    name: string;
    email?: string;
    phone?: string;
  };
  const [flugschuelerListe, setFlugschuelerListe] = useState<Flugschueler[]>([]);
  
  // Nachträgliche Flugschüler-Bearbeitung
  const [editStudentDialog, setEditStudentDialog] = useState<{
    open: boolean;
    pilotId: number | null;
    pilotName: string;
  }>({ open: false, pilotId: null, pilotName: '' });
  const [editStudentType, setEditStudentType] = useState<'mitglied' | 'gast'>('mitglied');
  const [editSelectedStudentMember, setEditSelectedStudentMember] = useState<string>('');
  const [editStudentMemberSearchOpen, setEditStudentMemberSearchOpen] = useState(false);
  const [editGuestStudentName, setEditGuestStudentName] = useState('');
  const [editGuestStudentEmail, setEditGuestStudentEmail] = useState('');
  const [editGuestStudentPhone, setEditGuestStudentPhone] = useState('');
  
  // Flugschüler austragen
  const [confirmRemoveStudent, setConfirmRemoveStudent] = useState<{
    open: boolean;
    pilotId: number | null;
    studentId: number | null;
    studentName: string;
  }>({ open: false, pilotId: null, studentId: null, studentName: '' });
  
  // Flugschüler-Zuweisung bei Pilot-Austragen
  const [reassignStudents, setReassignStudents] = useState<{
    open: boolean;
    pilotId: number | null;
    pilotName: string;
    students: any[];
  }>({ open: false, pilotId: null, pilotName: '', students: [] });
  // Map für jeden Flugschüler: studentId -> 'remove' oder pilotId (als String)
  const [studentActions, setStudentActions] = useState<Record<number, string>>({});
  
  // Flugschüler übertragen (ohne Pilot auszutragen)
  const [transferStudent, setTransferStudent] = useState<{
    open: boolean;
    pilotId: number | null;
    pilotName: string;
    studentId: number | null;
    studentName: string;
  }>({ open: false, pilotId: null, pilotName: '', studentId: null, studentName: '' });
  const [selectedTargetPilot, setSelectedTargetPilot] = useState<string>('');

  // Undo-Funktion
  const [undoAction, setUndoAction] = useState<{
    type: 'pilot-removed' | 'student-removed' | 'instructor-removed' | null;
    data: any;
    timestamp: number;
  } | null>(null);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Prüfe ob ausgewählter Pflicht-Ersatz-Flugleiter als Pilot aktiv ist
  useEffect(() => {
    if (!mandatoryReplacementInstructor) {
      setNeedsMandatorySecondInstructor(false);
      setMandatoryWarning('');
      return;
    }

    const selectedInstructorData = mockAvailableInstructors.find(
      i => i.id.toString() === mandatoryReplacementInstructor
    );

    if (!selectedInstructorData) return;

    // Prüfe ob dieser Flugleiter als Pilot aktiv ist
    const isPilotActive = activePilots.some(
      pilot => pilot.name === selectedInstructorData.name
    );

    if (isPilotActive) {
      setNeedsMandatorySecondInstructor(true);
      setMandatoryWarning(
        `${selectedInstructorData.name} ist aktuell als Pilot aktiv. Es wird ein zweiter Flugleiter benötigt, der die Aufsicht übernimmt.`
      );
    } else {
      setNeedsMandatorySecondInstructor(false);
      setMandatoryWarning('');
      setMandatorySecondInstructor('');
    }
  }, [mandatoryReplacementInstructor, activePilots]);

  // Hilfsfunktion: Bereits belegte 35MHz-Kanäle ermitteln
  const getOccupied35MHzChannels = (): string[] => {
    const channels: string[] = [];
    activePilots.forEach(pilot => {
      if (pilot.frequency.includes('35 MHz')) {
        // Extrahiere Kanal aus "35 MHz (K40)" -> "40"
        const match = pilot.frequency.match(/K(\d+)/);
        if (match && match[1]) {
          channels.push(match[1]);
        }
      }
    });
    return channels.sort((a, b) => parseInt(a) - parseInt(b));
  };

  const occupied35MHzChannels = getOccupied35MHzChannels();

  // Gefilterte Listen für Dropdowns
  
  // 1. Verfügbare Flugleiter: Nicht bereits als Flugleiter aktiv (können aber Piloten sein)
  const availableInstructors = mockAvailableInstructors.filter(
    instructor => !instructors.some(active => active.id === instructor.id && active.isActive)
  );

  // 2. Verfügbare Piloten (Mitglieder): Nicht bereits als Pilot aktiv und nicht als Flugschüler eingetragen
  const availablePilotMembers = mockAvailableInstructors.filter(
    member => {
      // Nicht bereits als Pilot aktiv
      const isActivePilot = activePilots.some(pilot => pilot.memberType === 'member' && pilot.name === member.name);
      // Nicht als Flugschüler bei einem anderen Piloten eingetragen
      const isActiveStudent = activePilots.some(pilot => 
        pilot.students?.some(student => student.name === member.name)
      );
      return !isActivePilot && !isActiveStudent;
    }
  );

  // 3. Verfügbare Flugschüler (Mitglieder): Nicht bereits als Pilot oder Flugschüler aktiv
  const availableStudentMembers = mockAvailableInstructors.filter(
    member => {
      // Nicht als Pilot aktiv
      const isActivePilot = activePilots.some(pilot => pilot.memberType === 'member' && pilot.name === member.name);
      // Nicht bereits als Flugschüler bei einem Piloten eingetragen
      const isActiveStudent = activePilots.some(pilot => 
        pilot.students?.some(student => student.name === member.name)
      );
      // Nicht bereits als Flugschüler in der aktuellen Liste (beim Eintragen)
      const isAlreadyStudent = flugschuelerListe.some(s => s.type === 'mitglied' && s.id === member.id.toString());
      // Nicht der aktuell ausgewählte Pilot selbst (eigener Name)
      const isCurrentPilot = pilotType === 'member' && member.id.toString() === selectedPilotMember;
      return !isActivePilot && !isActiveStudent && !isAlreadyStudent && !isCurrentPilot;
    }
  );

  // Liste für zweiten Flugleiter (ohne den bereits ausgewählten ersten)
  const availableSecondInstructors = availableInstructors.filter(
    instructor => instructor.id.toString() !== selectedInstructor
  );

  // Liste für zweiten Pflicht-Ersatz-Flugleiter (ohne den bereits ausgewählten ersten)
  const availableMandatorySecondInstructors = availableInstructors.filter(
    instructor => instructor.id.toString() !== mandatoryReplacementInstructor
  );
  
  // Liste für nachträgliche Flugschüler-Bearbeitung
  const availableEditStudentMembers = mockAvailableInstructors.filter(
    member => {
      // Nicht als Pilot aktiv
      const isActivePilot = activePilots.some(pilot => pilot.memberType === 'member' && pilot.name === member.name);
      // Nicht bereits als Flugschüler bei irgendeinem Piloten eingetragen
      const isActiveStudent = activePilots.some(pilot => 
        pilot.students?.some(student => student.name === member.name)
      );
      // Nicht der Pilot selbst
      const currentPilot = activePilots.find(p => p.id === editStudentDialog.pilotId);
      const isCurrentPilot = currentPilot?.memberType === 'member' && currentPilot.name === member.name;
      return !isActivePilot && !isActiveStudent && !isCurrentPilot;
    }
  );

  // Aktive Flugleiter (für die Prüfung)
  const activeInstructors = instructors.filter(i => i.isActive);

  // Prüft ob ein Flugleiter erforderlich ist
  // Regel: Flugleiter benötigt bei >= 3 Piloten (inkl. Flugschüler) ODER wenn mindestens ein Gast aktiv ist
  const requiresInstructor = () => {
    // Gesamtzahl der Piloten: aktive Piloten + betreute Flugschüler
    const studentsCount = activePilots.reduce((sum, p) => sum + (p.students?.length || 0), 0);
    const totalPilots = activePilots.length + studentsCount;
    const hasGuestPilot = activePilots.some(pilot => pilot.memberType === 'guest');
    return totalPilots >= 3 || hasGuestPilot;
  };

  const handleEndShift = (instructorId: number, instructorName: string) => {
    const remainingInstructors = activeInstructors.filter(i => i.id !== instructorId);
    
    // Prüfe ob Flugleiter erforderlich ist
    const needsInstructor = requiresInstructor();
    
    // Fall 1: Kein Flugleiter erforderlich - kann ohne Einschränkungen beendet werden
    if (!needsInstructor) {
      setConfirmEndShift({ open: true, instructorId, instructorName });
      return;
    }
    
    // Fall 2: LETZTER Flugleiter und FL wird benötigt - PFLICHT-Ersatz erforderlich
    if (remainingInstructors.length === 0) {
      // Pflicht-Ersatz Dialog öffnen
      setMandatoryReplacement({
        open: true,
        departingInstructorId: instructorId,
        departingInstructorName: instructorName
      });
      return;
    }
    
    // Fall 3: Nur noch 1 Flugleiter übrig und FL wird benötigt
    if (remainingInstructors.length === 1) {
      const remaining = remainingInstructors[0];
      // Ist dieser eine verbleibende Flugleiter als Pilot aktiv?
      // Wichtig: Wir vergleichen Namen, nicht IDs, da IDs in verschiedenen Listen unterschiedliche Personen sein können
      const isRemainingInstructorActivePilot = activePilots.some(
        pilot => pilot.name === remaining.name
      );
      
      if (isRemainingInstructorActivePilot) {
        // Dialog zeigen: Flugleiter ersetzen oder Pilot-Status beenden
        setConfirmReplaceInstructor({
          open: true,
          departingInstructorId: instructorId,
          departingInstructorName: instructorName,
          remainingInstructor: { id: remaining.id, name: remaining.name }
        });
        return; // Abbrechen - warte auf Benutzerentscheidung
      }
    }
    
    // Standard: Bestätigungs-Dialog zeigen
    setConfirmEndShift({ open: true, instructorId, instructorName });
  };

  const confirmEndShiftAction = () => {
    if (confirmEndShift.instructorId !== null) {
      // Speichere Flugleiter für Undo
      const instructor = instructors.find(i => i.id === confirmEndShift.instructorId);
      
      if (instructor) {
        setInstructors(prev => prev.map(i => 
          i.id === confirmEndShift.instructorId 
            ? { ...i, isActive: false }
            : i
        ));
        
        // Setze Undo-Aktion
        setUndoAction({
          type: 'instructor-removed',
          data: { instructor },
          timestamp: Date.now()
        });
        
        // Toast mit Undo
        toast.success(`${confirmEndShift.instructorName} ausgetragen`, {
          action: {
            label: 'Rückgängig',
            onClick: () => handleUndo()
          },
          duration: 5000
        });
      }
      
      setConfirmEndShift({ open: false, instructorId: null, instructorName: '' });
    }
  };

  // Ersatz-Flugleiter hinzufügen (verbleibender bleibt Pilot)
  const handleAddReplacementInstructor = () => {
    if (!replacementInstructor || !confirmReplaceInstructor.departingInstructorId) return;
    
    // Den ausscheidenden Flugleiter beenden
    setInstructors(prev => prev.map(instructor => 
      instructor.id === confirmReplaceInstructor.departingInstructorId
        ? { ...instructor, isActive: false }
        : instructor
    ));
    
    // Neuen Flugleiter hinzufügen
    const newInstructor = mockAvailableInstructors.find(i => i.id.toString() === replacementInstructor);
    if (newInstructor) {
      const now = new Date();
      const startTime = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
      
      setInstructors(prev => [...prev, { 
        ...newInstructor, 
        isActive: true, 
        startTime: startTime
      }]);
    }
    
    // Dialog schließen und State zurücksetzen
    setConfirmReplaceInstructor({ open: false, departingInstructorId: null, departingInstructorName: '', remainingInstructor: null });
    setReplacementInstructor('');
  };

  // Pilot-Status des verbleibenden Flugleiters beenden
  const handleRemoveRemainingPilotStatus = () => {
    if (!confirmReplaceInstructor.departingInstructorId || !confirmReplaceInstructor.remainingInstructor) return;
    
    // Den ausscheidenden Flugleiter beenden
    setInstructors(prev => prev.map(instructor => 
      instructor.id === confirmReplaceInstructor.departingInstructorId
        ? { ...instructor, isActive: false }
        : instructor
    ));
    
    // Den verbleibenden Flugleiter aus der Pilotenliste entfernen
    setActivePilots(prev => prev.filter(pilot => 
      pilot.name !== confirmReplaceInstructor.remainingInstructor?.name
    ));
    
    console.log(`Pilot-Status von ${confirmReplaceInstructor.remainingInstructor.name} beendet und aus Pilotenliste entfernt`);
    
    // Dialog schließen und State zurücksetzen
    setConfirmReplaceInstructor({ open: false, departingInstructorId: null, departingInstructorName: '', remainingInstructor: null });
  };

  // Pflicht-Ersatz hinzufügen (letzter Flugleiter bei >= 3 Piloten)
  const handleAddMandatoryReplacement = () => {
    if (!mandatoryReplacementInstructor || !mandatoryReplacement.departingInstructorId) return;
    
    // Wenn zweiter Flugleiter benötigt wird, prüfe ob dieser ausgewählt wurde
    if (needsMandatorySecondInstructor && !mandatorySecondInstructor) {
      return; // Button sollte disabled sein, aber zur Sicherheit
    }
    
    const now = new Date();
    const startTime = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    
    // Den ausscheidenden Flugleiter beenden
    setInstructors(prev => prev.map(instructor => 
      instructor.id === mandatoryReplacement.departingInstructorId
        ? { ...instructor, isActive: false }
        : instructor
    ));
    
    // Ersten Ersatz-Flugleiter hinzufügen
    const newInstructor = mockAvailableInstructors.find(i => i.id.toString() === mandatoryReplacementInstructor);
    if (newInstructor) {
      setInstructors(prev => [...prev, { 
        ...newInstructor, 
        isActive: true, 
        startTime: startTime
      }]);
    }
    
    // Zweiten Flugleiter hinzufügen (falls erforderlich)
    if (needsMandatorySecondInstructor && mandatorySecondInstructor) {
      const secondInstructorData = mockAvailableInstructors.find(i => i.id.toString() === mandatorySecondInstructor);
      if (secondInstructorData) {
        setInstructors(prev => [...prev, { 
          ...secondInstructorData, 
          isActive: true, 
          startTime: startTime
        }]);
      }
    }
    
    // Dialog schließen und State zurücksetzen
    setMandatoryReplacement({ open: false, departingInstructorId: null, departingInstructorName: '' });
    setMandatoryReplacementInstructor('');
    setMandatorySecondInstructor('');
    setNeedsMandatorySecondInstructor(false);
    setMandatoryWarning('');
  };

  const togglePilotExpansion = (pilotId: number) => {
    setExpandedPilots(prev => 
      prev.includes(pilotId) 
        ? prev.filter(id => id !== pilotId)
        : [...prev, pilotId]
    );
  };

  const toggleDetailsExpansion = (pilotId: number) => {
    setExpandedDetails(prev => 
      prev.includes(pilotId) 
        ? prev.filter(id => id !== pilotId)
        : [...prev, pilotId]
    );
  };

  const handleRemovePilot = (pilotId: number, pilotName: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Verhindert das Aufklappen beim Click auf Austragen
    
    // Prüfen ob Pilot Flugschüler hat
    const pilot = activePilots.find(p => p.id === pilotId);
    const hasStudents = pilot?.students && pilot.students.length > 0;
    
    if (hasStudents) {
      // Dialog für Flugschüler-Zuweisung öffnen
      setReassignStudents({
        open: true,
        pilotId,
        pilotName,
        students: pilot.students || []
      });
      // Initialisiere Aktionen für jeden Flugschüler mit 'remove' als Default
      const initialActions: Record<number, string> = {};
      pilot.students.forEach((student: any) => {
        initialActions[student.id] = 'remove';
      });
      setStudentActions(initialActions);
    } else {
      // Normaler Austragen-Dialog
      setConfirmRemovePilot({ open: true, pilotId, pilotName });
    }
  };

  const confirmRemovePilotAction = () => {
    if (confirmRemovePilot.pilotId !== null) {
      // Pilot aus der Liste entfernen
      setActivePilots(prev => prev.filter(pilot => pilot.id !== confirmRemovePilot.pilotId));
      
      console.log('Pilot ausgetragen:', confirmRemovePilot.pilotName);
      // TODO: API-Integration für Pilot-Austragung
      setConfirmRemovePilot({ open: false, pilotId: null, pilotName: '' });
    }
  };

  const handleOpenAddDialog = () => {
    setIsAddDialogOpen(true);
    // Reset states
    setSelectedInstructor('');
    setNeedsSecondInstructor(false);
    setSecondInstructor('');
    setInstructorWarning('');
  };
  
  // Flugschüler hinzufügen
  const handleAddFlugschueler = () => {
    if (schuelerType === 'mitglied') {
      if (!selectedSchuelerMember) {
        alert('Bitte wähle ein Mitglied aus.');
        return;
      }
      
      if (flugschuelerListe.some(s => s.type === 'mitglied' && s.id === selectedSchuelerMember)) {
        alert('Dieses Mitglied wurde bereits hinzugefügt.');
        return;
      }
      
      const member = mockAvailableInstructors.find(m => m.id.toString() === selectedSchuelerMember);
      if (member) {
        setFlugschuelerListe([...flugschuelerListe, {
          id: selectedSchuelerMember,
          type: 'mitglied',
          name: member.name,
        }]);
        setSelectedSchuelerMember('');
      }
    } else {
      if (!guestSchuelerName.trim()) {
        alert('Bitte gib den Namen des Gastes ein.');
        return;
      }
      if (!guestSchuelerEmail.trim() && !guestSchuelerPhone.trim()) {
        alert('Bitte gib mindestens E-Mail oder Telefon des Gastes an.');
        return;
      }
      
      setFlugschuelerListe([...flugschuelerListe, {
        id: `gast-${Date.now()}`,
        type: 'gast',
        name: guestSchuelerName,
        email: guestSchuelerEmail,
        phone: guestSchuelerPhone,
      }]);
      
      setGuestSchuelerName('');
      setGuestSchuelerEmail('');
      setGuestSchuelerPhone('');
    }
  };
  
  const handleRemoveFlugschueler = (id: string) => {
    setFlugschuelerListe(flugschuelerListe.filter(s => s.id !== id));
  };
  
  // Nachträgliche Flugschüler-Bearbeitung öffnen
  const handleOpenEditStudents = (pilotId: number, pilotName: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditStudentDialog({ open: true, pilotId, pilotName });
    setEditStudentType('mitglied');
    setEditSelectedStudentMember('');
    setEditGuestStudentName('');
    setEditGuestStudentEmail('');
    setEditGuestStudentPhone('');
  };
  
  // Flugschüler nachträglich hinzufügen
  const handleAddEditStudent = () => {
    if (!editStudentDialog.pilotId) return;
    
    const now = new Date();
    const startTime = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    
    let newStudent;
    
    if (editStudentType === 'mitglied') {
      if (!editSelectedStudentMember) {
        alert('Bitte wähle ein Mitglied aus.');
        return;
      }
      
      const member = mockAvailableInstructors.find(m => m.id.toString() === editSelectedStudentMember);
      if (!member) return;
      
      newStudent = {
        id: Date.now(),
        name: member.name,
        initials: member.initials,
        modelName: '',
        modelType: '',
        frequency: '',
        notes: '',
        startTime
      };
    } else {
      if (!editGuestStudentName.trim()) {
        alert('Bitte gib den Namen des Gastes ein.');
        return;
      }
      if (!editGuestStudentEmail.trim() && !editGuestStudentPhone.trim()) {
        alert('Bitte gib mindestens E-Mail oder Telefon des Gastes an.');
        return;
      }
      
      newStudent = {
        id: Date.now(),
        name: editGuestStudentName,
        initials: editGuestStudentName.split(' ').map(n => n[0]).join(''),
        modelName: '',
        modelType: '',
        frequency: '',
        notes: '',
        startTime
      };
    }
    
    // Flugschüler zum Piloten hinzufügen
    setActivePilots(prev => prev.map(pilot => {
      if (pilot.id === editStudentDialog.pilotId) {
        return {
          ...pilot,
          students: [...(pilot.students || []), newStudent]
        };
      }
      return pilot;
    }));
    
    // Reset
    setEditSelectedStudentMember('');
    setEditGuestStudentName('');
    setEditGuestStudentEmail('');
    setEditGuestStudentPhone('');
    
    console.log('Flugschüler nachträglich hinzugefügt:', newStudent);
  };
  
  // Flugschüler austragen
  const handleRemoveStudent = (pilotId: number, studentId: number, studentName: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setConfirmRemoveStudent({ open: true, pilotId, studentId, studentName });
  };
  
  const confirmRemoveStudentAction = () => {
    if (confirmRemoveStudent.pilotId !== null && confirmRemoveStudent.studentId !== null) {
      // Speichere aktuellen Stand für Undo
      const pilot = activePilots.find(p => p.id === confirmRemoveStudent.pilotId);
      const student = pilot?.students?.find(s => s.id === confirmRemoveStudent.studentId);
      
      if (pilot && student) {
        const undoData = {
          pilotId: pilot.id,
          student: student
        };
        
        setActivePilots(prev => prev.map(p => {
          if (p.id === confirmRemoveStudent.pilotId) {
            return {
              ...p,
              students: p.students?.filter(s => s.id !== confirmRemoveStudent.studentId) || []
            };
          }
          return p;
        }));
        
        // Setze Undo-Aktion
        setUndoAction({
          type: 'student-removed',
          data: undoData,
          timestamp: Date.now()
        });
        
        // Toast mit Undo-Button
        toast.success(`${confirmRemoveStudent.studentName} ausgetragen`, {
          action: {
            label: 'Rückgängig',
            onClick: () => handleUndo()
          },
          duration: 5000
        });
        
        console.log('Flugschüler ausgetragen:', confirmRemoveStudent.studentName);
      }
      
      setConfirmRemoveStudent({ open: false, pilotId: null, studentId: null, studentName: '' });
    }
  };
  
  // Flugschüler-Aktionen verarbeiten und Pilot austragen
  const handleProcessStudentActions = () => {
    if (reassignStudents.pilotId === null) return;
    
    // Speichere Pilot für Undo
    const pilot = activePilots.find(p => p.id === reassignStudents.pilotId);
    if (!pilot) return;
    
    // Gruppiere Flugschüler nach Aktion
    const studentsToRemove: any[] = [];
    const studentsToReassign: Record<number, any[]> = {}; // targetPilotId -> students[]
    
    reassignStudents.students.forEach((student) => {
      const action = studentActions[student.id];
      if (action === 'remove') {
        studentsToRemove.push(student);
      } else {
        const targetPilotId = parseInt(action);
        if (!studentsToReassign[targetPilotId]) {
          studentsToReassign[targetPilotId] = [];
        }
        studentsToReassign[targetPilotId].push(student);
      }
    });
    
    // 1. Pilot austragen (damit werden auch alle seine Flugschüler entfernt)
    setActivePilots(prev => prev.filter(p => p.id !== reassignStudents.pilotId));
    
    // 2. Flugschüler, die neu zugewiesen werden sollen, bei neuen Piloten eintragen
    if (Object.keys(studentsToReassign).length > 0) {
      setActivePilots(prev => prev.map(p => {
        const studentsForThisPilot = studentsToReassign[p.id];
        if (studentsForThisPilot && studentsForThisPilot.length > 0) {
          return {
            ...p,
            students: [...(p.students || []), ...studentsForThisPilot]
          };
        }
        return p;
      }));
    }
    
    // Setze Undo-Aktion
    setUndoAction({
      type: 'pilot-removed',
      data: { pilot },
      timestamp: Date.now()
    });
    
    // Toast mit Undo
    toast.success(`${reassignStudents.pilotName} ausgetragen`, {
      action: {
        label: 'Rückgängig',
        onClick: () => handleUndo()
      },
      duration: 5000
    });
    
    console.log('Pilot ausgetragen:', reassignStudents.pilotName);
    console.log('Flugschüler ausgetragen:', studentsToRemove.map(s => s.name));
    Object.entries(studentsToReassign).forEach(([pilotId, students]) => {
      console.log(`Flugschüler zu Pilot ${pilotId} zugewiesen:`, students.map(s => s.name));
    });
    
    // Dialog schließen
    setReassignStudents({ open: false, pilotId: null, pilotName: '', students: [] });
    setStudentActions({});
  };
  
  // Flugschüler übertragen
  const handleTransferStudent = () => {
    if (!transferStudent.pilotId || !transferStudent.studentId || !selectedTargetPilot) return;
    
    const student = activePilots
      .find(p => p.id === transferStudent.pilotId)
      ?.students?.find((s: any) => s.id === transferStudent.studentId);
    
    const targetPilot = activePilots.find(p => p.id.toString() === selectedTargetPilot);
    
    if (!student || !targetPilot) return;
    
    // Flugschüler vom alten Piloten entfernen
    setActivePilots(prev => prev.map(pilot => {
      if (pilot.id === transferStudent.pilotId) {
        return {
          ...pilot,
          students: pilot.students?.filter((s: any) => s.id !== transferStudent.studentId)
        };
      }
      return pilot;
    }));
    
    // Flugschüler zum neuen Piloten hinzufügen
    setActivePilots(prev => prev.map(pilot => {
      if (pilot.id.toString() === selectedTargetPilot) {
        return {
          ...pilot,
          students: [...(pilot.students || []), student]
        };
      }
      return pilot;
    }));
    
    // Toast-Benachrichtigung
    toast.success(`${transferStudent.studentName} zu ${targetPilot.name} übertragen`);
    
    console.log(`Flugschüler ${transferStudent.studentName} von ${transferStudent.pilotName} zu ${targetPilot.name} übertragen`);
    
    // Dialog schließen
    setTransferStudent({ open: false, pilotId: null, pilotName: '', studentId: null, studentName: '' });
    setSelectedTargetPilot('');
  };
  
  // Undo-Funktion
  const handleUndo = () => {
    if (!undoAction) return;
    
    const now = Date.now();
    const timeDiff = now - undoAction.timestamp;
    
    // Undo nur innerhalb von 10 Sekunden erlauben
    if (timeDiff > 10000) {
      toast.error('Rückgängig-Aktion abgelaufen');
      setUndoAction(null);
      return;
    }
    
    switch (undoAction.type) {
      case 'student-removed':
        // Flugschüler wieder hinzufügen
        setActivePilots(prev => prev.map(pilot => {
          if (pilot.id === undoAction.data.pilotId) {
            return {
              ...pilot,
              students: [...(pilot.students || []), undoAction.data.student]
            };
          }
          return pilot;
        }));
        toast.success('Änderung rückgängig gemacht');
        break;
      
      case 'pilot-removed':
        // Pilot wieder hinzufügen
        setActivePilots(prev => [...prev, undoAction.data.pilot]);
        toast.success('Pilot wiederhergestellt');
        break;
      
      case 'instructor-removed':
        // Flugleiter wieder aktivieren
        setInstructors(prev => prev.map(i => 
          i.id === undoAction.data.instructor.id 
            ? { ...i, isActive: true }
            : i
        ));
        toast.success('Flugleiter wiederhergestellt');
        break;
    }
    
    setUndoAction(null);
  };
  
  // Timer für Undo-Aktion (automatisch nach 10 Sekunden entfernen)
  useEffect(() => {
    if (undoAction) {
      const timer = setTimeout(() => {
        setUndoAction(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [undoAction]);
  
  // Hilfsfunktion: Avatar-Farbe basierend auf Status bestimmen
  // Priorisierung: Gastflieger > Flugleiter > Flugschüler/Ausbilder > Mitglied
  const getAvatarColor = (person: any, isInstructor: boolean = false, isStudent: boolean = false, hasStudents: boolean = false) => {
    // 1. Gastflieger (höchste Priorität)
    if (person.memberType === 'guest') {
      return {
        bg: 'bg-orange-500/10 dark:bg-orange-500/20',
        border: 'border-orange-500/30',
        text: 'text-orange-700 dark:text-orange-400'
      };
    }
    
    // 2. Flugleiter
    if (isInstructor) {
      return {
        bg: 'bg-blue-500/10 dark:bg-blue-500/20',
        border: 'border-blue-500/30',
        text: 'text-blue-700 dark:text-blue-400'
      };
    }
    
    // 3. Flugschüler ODER Pilot mit zugewiesenen Flugschülern (Ausbilder)
    if (isStudent || hasStudents) {
      return {
        bg: 'bg-purple-500/10 dark:bg-purple-500/20',
        border: 'border-purple-500/30',
        text: 'text-purple-700 dark:text-purple-400'
      };
    }
    
    // 4. Mitglied (Standard)
    return {
      bg: 'bg-green-500/10 dark:bg-green-500/20',
      border: 'border-green-500/30',
      text: 'text-green-700 dark:text-green-400'
    };
  };
  
  // Hilfsfunktion für Flugschüler-Icon-Farbe (für kompakte Darstellung)
  const getFlightIconColor = (student: any) => {
    return {
      bg: 'bg-purple-500/10 dark:bg-purple-500/20',
      icon: 'text-purple-700 dark:text-purple-400'
    };
  };

  const handleAddPilot = () => {
    // Validierung Pilot
    if (pilotType === 'member' && !selectedPilotMember) {
      alert('Bitte wähle ein Mitglied aus.');
      return;
    }
    if (pilotType === 'guest' && !guestPilotName.trim()) {
      alert('Bitte gib den Namen des Gastfliegers ein.');
      return;
    }
    
    // Validierung Antriebsart
    if (!isElektro && !isVerbrenner) {
      alert('Bitte wähle mindestens eine Antriebsart aus.');
      return;
    }
    
    // Validierung Fernsteuerung
    if (!is24GHz && !is35MHz) {
      alert('Bitte wähle mindestens eine Fernsteuerungsvariante aus.');
      return;
    }
    
    if (is35MHz && !channel.trim()) {
      alert('Bitte gib einen Kanal für 35 MHz an.');
      return;
    }
    
    // Validierung: Kanal-Duplikat bei 35MHz verhindern
    if (is35MHz && channel.trim()) {
      const channelToCheck = `K${channel.trim()}`;
      const isChannelInUse = activePilots.some(pilot => 
        pilot.frequency.includes('35 MHz') && pilot.frequency.includes(channelToCheck)
      );
      
      if (isChannelInUse) {
        const pilotWithChannel = activePilots.find(pilot => 
          pilot.frequency.includes('35 MHz') && pilot.frequency.includes(channelToCheck)
        );
        alert(`❌ Kanal ${channel.trim()} ist bereits belegt!\n\n` +
              `Aktuell verwendet von: ${pilotWithChannel?.name}\n\n` +
              `Bei 35 MHz darf jeder Kanal nur einmal verwendet werden.\n` +
              `Bitte wähle einen anderen Kanal.`);
        return;
      }
    }
    
    // Flugschüler-Validierung
    if (isFlugschueler && flugschuelerListe.length === 0) {
      alert('Bitte füge mindestens einen Flugschüler hinzu.');
      return;
    }
    
    const now = new Date();
    const startTime = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    
    // Erstelle Frequenz-String
    const fernsteuerung = [];
    if (is24GHz) fernsteuerung.push('2,4 GHz');
    if (is35MHz) fernsteuerung.push(`35 MHz (K${channel})`);
    const frequency = fernsteuerung.join(', ');
    
    // Erstelle Antriebstypen-Array
    const driveTypes = [];
    if (isElektro) driveTypes.push('Elektro');
    if (isVerbrenner) driveTypes.push('Verbrenner');
    
    let newPilot;
    
    if (pilotType === 'member') {
      const member = mockAvailableInstructors.find(m => m.id.toString() === selectedPilotMember);
      if (!member) return;
      
      newPilot = {
        id: Date.now(),
        name: member.name,
        initials: member.initials,
        startTime,
        currentFlights: 0,
        frequency,
        driveTypes, // Antriebstypen hinzufügen
        memberType: 'member' as const,
        flights: [],
        students: flugschuelerListe.map((s, idx) => ({
          id: idx + 1,
          name: s.name,
          initials: s.name.split(' ').map(n => n[0]).join(''),
          modelName: '',
          modelType: '',
          frequency: '',
          notes: '',
          startTime
        }))
      };
    } else {
      newPilot = {
        id: Date.now(),
        name: guestPilotName,
        initials: guestPilotName.split(' ').map(n => n[0]).join(''),
        startTime,
        currentFlights: 0,
        frequency,
        driveTypes, // Antriebstypen hinzufügen
        memberType: 'guest' as const,
        flights: [],
        students: flugschuelerListe.map((s, idx) => ({
          id: idx + 1,
          name: s.name,
          initials: s.name.split(' ').map(n => n[0]).join(''),
          modelName: '',
          modelType: '',
          frequency: '',
          notes: '',
          startTime
        }))
      };
    }
    
    setActivePilots([...activePilots, newPilot]);
    
    // Reset form
    setPilotType('member');
    setSelectedPilotMember('');
    setGuestPilotName('');
    setIsElektro(false);
    setIsVerbrenner(false);
    setIs24GHz(false);
    setIs35MHz(false);
    setChannel('');
    setIsFlugschueler(false);
    setFlugschuelerListe([]);
    setSelectedSchuelerMember('');
    setGuestSchuelerName('');
    setGuestSchuelerEmail('');
    setGuestSchuelerPhone('');
    
    setIsAddDialogOpen(false);
    
    // Toast-Benachrichtigung
    toast.success(`${newPilot.name} eingetragen`);
    
    console.log('Pilot hinzugefügt:', newPilot);
  };

  // Prüfen ob ausgewählter Flugleiter bereits als Pilot aktiv ist
  const handleInstructorChange = (instructorId: string) => {
    setSelectedInstructor(instructorId);
    
    if (!instructorId) {
      setNeedsSecondInstructor(false);
      setInstructorWarning('');
      return;
    }

    const instructor = mockAvailableInstructors.find(i => i.id.toString() === instructorId);
    
    // Prüfen ob dieser Flugleiter bereits als Pilot eingetragen ist
    // Wir müssen nach Name vergleichen, da die IDs in verschiedenen Listen unterschiedlich sind
    const isActivePilot = activePilots.some(pilot => pilot.name === instructor?.name);
    
    if (isActivePilot) {
      // Prüfen ob bereits ein anderer Flugleiter im Dienst ist
      const otherActiveInstructors = activeInstructors.filter(i => i.name !== instructor?.name);
      
      if (otherActiveInstructors.length > 0) {
        // Es ist bereits ein anderer Flugleiter im Dienst - kein zweiter Flugleiter nötig
        setNeedsSecondInstructor(false);
        setSecondInstructor('');
        setInstructorWarning(`${instructor?.name} ist bereits als Pilot eingetragen. Da bereits ein Flugleiter im Dienst ist, kann ${instructor?.name} direkt eingetragen werden.`);
      } else {
        // Kein anderer Flugleiter im Dienst - zweiter Flugleiter erforderlich
        setNeedsSecondInstructor(true);
        setInstructorWarning(`${instructor?.name} ist bereits als Pilot eingetragen. Bitte wähle einen zweiten Flugleiter aus.`);
      }
    } else {
      setNeedsSecondInstructor(false);
      setSecondInstructor('');
      setInstructorWarning('');
    }
  };

  // Flugleiter Dienst starten
  const handleStartInstructorShift = () => {
    if (!selectedInstructor) {
      return;
    }

    if (needsSecondInstructor && !secondInstructor) {
      setInstructorWarning('Bitte wähle einen zweiten Flugleiter aus.');
      return;
    }

    // Hier später API-Call
    const instructor1 = mockAvailableInstructors.find(i => i.id.toString() === selectedInstructor);
    const instructor2 = secondInstructor ? mockAvailableInstructors.find(i => i.id.toString() === secondInstructor) : null;
    
    console.log('Flugleiter eintragen:', instructor1?.name, instructor2 ? `mit ${instructor2.name}` : '');
    
    // TODO: API-Integration
    // Temporär zur Demo in die aktiven Flugleiter hinzufügen
    const now = new Date();
    const startTime = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    
    const newInstructors = [];
    
    if (instructor1) {
      newInstructors.push({
        id: instructor1.id,
        name: instructor1.name,
        initials: instructor1.initials,
        startTime: startTime,
        isActive: true,
      });
    }
    
    if (instructor2) {
      newInstructors.push({
        id: instructor2.id,
        name: instructor2.name,
        initials: instructor2.initials,
        startTime: startTime,
        isActive: true,
      });
    }
    
    if (newInstructors.length > 0) {
      setInstructors(prev => [...prev, ...newInstructors]);
    }
    
    // Toast-Benachrichtigung
    const instructorNames = [];
    if (selectedInstructor) {
      const instructor = mockAvailableInstructors.find(i => i.id.toString() === selectedInstructor);
      if (instructor) instructorNames.push(instructor.name);
    }
    if (needsSecondInstructor && secondInstructor) {
      const instructor = mockAvailableInstructors.find(i => i.id.toString() === secondInstructor);
      if (instructor) instructorNames.push(instructor.name);
    }
    if (instructorNames.length > 0) {
      toast.success(`Flugleiter: ${instructorNames.join(' & ')}`);
    }
    
    // Dialog schließen und State zurücksetzen
    setIsAddDialogOpen(false);
    setSelectedInstructor('');
    setSecondInstructor('');
    setNeedsSecondInstructor(false);
    setInstructorWarning('');
  };

  // Helper function to get flight icon color based on priority (für Flugeinträge)
  const getFlightStatusColor = (flight: any) => {
    // Priority 1: Vorfälle -> Rot
    if (flight.notes) {
      return {
        bg: 'bg-red-500/10',
        icon: 'text-red-600 dark:text-red-500'
      };
    }
    
    // Default: Muted
    return {
      bg: 'bg-muted',
      icon: 'text-muted-foreground'
    };
  };

  const totalStudents = mockActivePilots.reduce((sum, pilot) => sum + pilot.students.length, 0);

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl mb-2 text-foreground">Flugbuch</h1>
            <p className="text-muted-foreground text-xl">
              Flugmodellsportverein Dingden e.V.
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl text-foreground">
              {currentTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-muted-foreground text-lg">
              {currentTime.toLocaleDateString('de-DE', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex flex-col lg:flex-row gap-6 h-[80vh]">
        {/* Eintragen Button - absolut positioniert */}
        <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 -top-20 z-10">
          <Button 
            onClick={handleOpenAddDialog}
            size="lg"
            className="gap-2 h-14 px-4 flex-col"
          >
            <UserPlus className="h-6 w-6" />
            <span className="text-sm">Eintragen</span>
          </Button>
        </div>

        {/* Eintragen Button - mobil über den Karten */}
        <div className="lg:hidden mb-4 flex justify-center">
          <Button 
            onClick={handleOpenAddDialog}
            size="lg"
            className="gap-2 h-12 px-6"
          >
            <UserPlus className="h-5 w-5" />
            Eintragen
          </Button>
        </div>

        {/* Flugleiter Section */}
        <Card className="border-2 flex flex-col min-h-0 flex-1">
          <CardHeader className="pb-4 flex-shrink-0">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-muted-foreground" />
              </div>
              Flugleiter im Dienst
              <Badge variant="secondary" className="ml-auto text-lg px-3 py-1">
                {activeInstructors.length}
              </Badge>
            </CardTitle>
            {/* Info: Flugleiter-Anforderung */}
            {(() => {
              const hasGuestPilot = activePilots.some(pilot => pilot.memberType === 'guest');
              const guestCount = activePilots.filter(p => p.memberType === 'guest').length;
              const studentsCount = activePilots.reduce((sum, p) => sum + (p.students?.length || 0), 0);
              const totalPilots = activePilots.length + studentsCount;
              const needsInstructor = totalPilots >= 3 || hasGuestPilot;
              
              if (needsInstructor && activeInstructors.length === 0) {
                return (
                  <Alert variant="destructive" className="mt-3">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Flugleiter erforderlich</AlertTitle>
                    <AlertDescription>
                      {hasGuestPilot && totalPilots < 3 
                        ? 'Bei aktiven Gastfliegern wird zwingend ein Flugleiter benötigt.'
                        : `Bei ${totalPilots} aktiven Piloten${studentsCount > 0 ? ` (${studentsCount} Flugschüler)` : ''}${guestCount > 0 ? `, inkl. ${guestCount} Gast` : ''} wird mindestens ein Flugleiter benötigt.`
                      }
                    </AlertDescription>
                  </Alert>
                );
              }
              
              if (!needsInstructor) {
                return (
                  <Card className="mt-3 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/50">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                          <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            Flugleiter-Anforderung
                          </div>
                          <div className="text-xs text-blue-700 dark:text-blue-300">
                            Ein Flugleiter wird benötigt ab <strong>3 aktiven Piloten</strong> (inkl. Flugschüler) oder bei <strong>Gastfliegern</strong>.
                          </div>
                          <div className="text-xs text-blue-600 dark:text-blue-400 pt-1">
                            Aktuell: {totalPilots} Pilot{totalPilots !== 1 ? 'en' : ''}{studentsCount > 0 ? ` (${studentsCount} Schüler)` : ''}{guestCount > 0 ? `, ${guestCount} Gast` : ''} — Flugleiter optional
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              }
              
              return null;
            })()}
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto min-h-0">
            <div className="space-y-4">
              {activeInstructors.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Aktuell kein Flugleiter im Dienst
                </p>
              ) : (
                activeInstructors.map((instructor) => {
                  const avatarColors = getAvatarColor(instructor, true); // Flugleiter = Blau
                  
                  return (
                    <div
                      key={instructor.id}
                      className="flex items-center gap-3 p-4 rounded-lg bg-card border"
                    >
                      <Avatar className={cn("h-14 w-14 border-2", avatarColors.border)}>
                        <AvatarFallback className={cn(avatarColors.bg, avatarColors.text, "text-lg")}>
                          {instructor.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg truncate">{instructor.name}</h4>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Clock className="h-3.5 w-3.5" />
                          <span>seit {instructor.startTime}</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => handleEndShift(instructor.id, instructor.name)}
                        className="ml-2 gap-2 h-11 px-4"
                      >
                        <LogOut className="h-5 w-5" />
                        <span className="hidden xl:inline">Dienst beenden</span>
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Aktive Piloten Section */}
        <Card className="border-2 flex flex-col min-h-0 flex-1">
          <CardHeader className="pb-4 flex-shrink-0">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Plane className="h-6 w-6 text-muted-foreground" />
              </div>
              Aktive Piloten
              <Badge variant="secondary" className="ml-auto text-lg px-3 py-1">
                {activePilots.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto min-h-0">
            <div className="space-y-4">
              {activePilots.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Aktuell keine aktiven Piloten
                </p>
              ) : (
                <>
                  {/* Gastflieger Section */}
                  {(() => {
                    const guestPilots = activePilots.filter(p => p.memberType === 'guest');
                    // Sortiere nach Startzeit (früh -> spät)
                    guestPilots.sort((a, b) => a.startTime.localeCompare(b.startTime));
                    if (guestPilots.length === 0) return null;
                    
                    return (
                      <>
                        <div className="border-2 rounded-lg p-3 mb-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            <h3 className="text-lg font-medium">
                              Gastflieger
                            </h3>
                            <Badge variant="secondary" className="ml-auto">
                              {guestPilots.length}
                            </Badge>
                          </div>
                          <div className="space-y-3">
                            {guestPilots.map((pilot) => {
                              const isStudentsExpanded = expandedPilots.includes(pilot.id);
                              const isDetailsExpanded = expandedDetails.includes(pilot.id);
                              const hasStudents = pilot.students && pilot.students.length > 0;
                              
                              // Avatar-Farbe ohne Flugleiter-Markierung
                              const avatarColors = getAvatarColor(pilot, false, false, hasStudents);
                              
                              return (
                                <div key={pilot.id}>
                                  {/* Pilot Card - Klickbar für Details */}
                                  <div 
                                    className={`flex items-center gap-3 p-4 bg-card border cursor-pointer hover:bg-accent/50 transition-colors ${
                                      (hasStudents && isStudentsExpanded) || isDetailsExpanded ? 'rounded-t-lg border-b-0' : 'rounded-lg'
                                    }`}
                                    onClick={() => toggleDetailsExpansion(pilot.id)}
                                  >
                                    <Avatar className={cn("h-14 w-14 border-2", avatarColors.border)}>
                                      <AvatarFallback className={cn(avatarColors.bg, avatarColors.text, "text-lg")}>
                                        {pilot.initials}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-lg">{pilot.name}</h4>
                                      <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                                        <div className="flex items-center gap-1.5">
                                          <Clock className="h-3.5 w-3.5" />
                                          <span>seit {pilot.startTime}</span>
                                        </div>
                                        {/* Nur 35 MHz anzeigen (wichtig wegen Kanal-Koordination), 2,4 GHz ist nicht relevant */}
                                        {(() => {
                                          // Extrahiere nur den 35 MHz Teil aus dem Frequency-String
                                          const match = pilot.frequency.match(/35 MHz \(K\d+\)/);
                                          if (match) {
                                            return (
                                              <>
                                                <span>•</span>
                                                <div className="flex items-center gap-1.5">
                                                  <Radio className="h-3.5 w-3.5" />
                                                  <span className="font-mono">{match[0]}</span>
                                                </div>
                                              </>
                                            );
                                          }
                                          return null;
                                        })()}
                                      </div>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                      <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={(e) => handleRemovePilot(pilot.id, pilot.name, e)}
                                        className="gap-2 h-11 px-4"
                                      >
                                        <LogOut className="h-5 w-5" />
                                        <span className="hidden xl:inline">Austragen</span>
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Details-Bereich - Pilot-Informationen */}
                                  {isDetailsExpanded && (
                                    <div className={`border-x border-b bg-muted/10 px-4 py-3 ${
                                      !hasStudents || !isStudentsExpanded ? 'rounded-b-lg' : ''
                                    }`}>
                                      <div className="grid grid-cols-2 gap-4">
                                        {/* Linke Spalte */}
                                        <div className="space-y-3">
                                          {/* Frequenz */}
                                          <div>
                                            <div className="text-xs text-muted-foreground mb-1">Frequenz</div>
                                            <div className="flex items-center gap-2">
                                              <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                                                <BarChart3 className="h-4 w-4 text-primary" />
                                              </div>
                                              <span className="font-mono text-foreground">{pilot.frequency}</span>
                                            </div>
                                          </div>

                                          {/* Antriebstypen */}
                                          <div>
                                            <div className="text-xs text-muted-foreground mb-1">Antriebstypen</div>
                                            <div className="flex flex-wrap gap-2">
                                              {(() => {
                                                // Verwende driveTypes falls vorhanden, ansonsten aus flights ableiten
                                                const types = pilot.driveTypes && pilot.driveTypes.length > 0
                                                  ? pilot.driveTypes
                                                  : [...new Set(pilot.flights?.map(f => f.modelType) || [])];
                                                
                                                if (types.length === 0) {
                                                  return <span className="text-xs text-muted-foreground">Noch keine Flüge</span>;
                                                }
                                                
                                                return types.map((type, idx) => (
                                                  <Badge key={idx} variant="outline" className="gap-1.5">
                                                    {type === 'Elektro' ? (
                                                      <Zap className="h-3 w-3" />
                                                    ) : (
                                                      <Fuel className="h-3 w-3" />
                                                    )}
                                                    {type}
                                                  </Badge>
                                                ));
                                              })()}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Rechte Spalte */}
                                        <div className="space-y-3">
                                          {/* Mitgliedsstatus */}
                                          <div>
                                            <div className="text-xs text-muted-foreground mb-1">Status</div>
                                            <div className="flex items-center gap-2">
                                              <div className={`h-8 w-8 rounded flex items-center justify-center ${
                                                pilot.memberType === 'member' 
                                                  ? 'bg-green-500/10' 
                                                  : 'bg-orange-500/10'
                                              }`}>
                                                {pilot.memberType === 'member' ? (
                                                  <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                ) : (
                                                  <UserCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                                )}
                                              </div>
                                              <Badge 
                                                variant={pilot.memberType === 'member' ? 'default' : 'secondary'}
                                                className={pilot.memberType === 'member' 
                                                  ? 'bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20 border-green-500/20'
                                                  : 'bg-orange-500/10 text-orange-700 dark:text-orange-400 hover:bg-orange-500/20 border-orange-500/20'
                                                }
                                              >
                                                {pilot.memberType === 'member' ? 'Mitglied' : 'Gastflieger'}
                                              </Badge>
                                            </div>
                                          </div>

                                          {/* Anwesenheitsdauer */}
                                          <div>
                                            <div className="text-xs text-muted-foreground mb-1">Anwesenheit</div>
                                            <div className="flex items-center gap-2">
                                              <div className="h-8 w-8 rounded bg-blue-500/10 flex items-center justify-center">
                                                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                              </div>
                                              <div>
                                                <div className="text-sm text-foreground">seit {pilot.startTime}</div>
                                                <div className="text-xs text-muted-foreground">
                                                  {(() => {
                                                    const now = new Date();
                                                    const [hours, minutes] = pilot.startTime.split(':').map(Number);
                                                    const start = new Date();
                                                    start.setHours(hours, minutes, 0);
                                                    const diff = Math.floor((now.getTime() - start.getTime()) / 60000);
                                                    const h = Math.floor(diff / 60);
                                                    const m = diff % 60;
                                                    return `${h}h ${m}min`;
                                                  })()}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Zugeordnete Flugschüler - Ausklappbar (nur für Mitglieder) */}
                                  {isStudentsExpanded && pilot.memberType === 'member' && (
                                    <div className={isDetailsExpanded ? '' : ''}>
                                      {hasStudents && pilot.students?.map((student, index) => (
                                        <div
                                          key={student.id}
                                          className={`border-x border-b bg-muted/20 px-3 py-2`}
                                        >
                                          {/* Kompakte Darstellung in einer Zeile */}
                                          <div className="flex items-center gap-2">
                                            <div className={`h-6 w-6 rounded-full ${getFlightIconColor(student).bg} flex items-center justify-center flex-shrink-0`}>
                                              <GraduationCap className={`h-3.5 w-3.5 ${getFlightIconColor(student).icon}`} />
                                            </div>
                                            <span className="text-sm font-medium text-foreground flex-shrink-0">{student.name}</span>
                                            <Badge variant="outline" className="text-xs flex-shrink-0">
                                              Flugschüler
                                            </Badge>
                                            {student.startTime && (
                                              <>
                                                <span className="text-muted-foreground flex-shrink-0">•</span>
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-shrink-0">
                                                  <Clock className="h-3 w-3" />
                                                  <span>seit {student.startTime}</span>
                                                </div>
                                              </>
                                            )}
                                            <div className="flex-1"></div>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setTransferStudent({
                                                  open: true,
                                                  pilotId: pilot.id,
                                                  pilotName: pilot.name,
                                                  studentId: student.id,
                                                  studentName: student.name
                                                });
                                                setSelectedTargetPilot('');
                                              }}
                                              className="h-10 w-10 p-0 text-muted-foreground hover:text-blue-600 hover:bg-blue-500/10 flex-shrink-0"
                                              title="Zu anderem Piloten übertragen"
                                            >
                                              <ArrowRightLeft className="h-5 w-5" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={(e) => handleRemoveStudent(pilot.id, student.id, student.name, e)}
                                              className="h-10 w-10 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                                              title="Flugschüler entfernen"
                                            >
                                              <X className="h-5 w-5" />
                                            </Button>
                                          </div>

                                          {/* Notizen falls vorhanden */}
                                          {student.notes && (
                                            <div className="flex items-start gap-2 mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded">
                                              <AlertTriangle className="h-3.5 w-3.5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
                                              <p className="text-xs text-red-900 dark:text-red-200">
                                                {student.notes}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                      {/* Button zum Hinzufügen weiterer Flugschüler */}
                                      <div className="border-x border-b bg-muted/10 px-3 py-3 rounded-b-lg">
                                        <Button
                                          variant="ghost"
                                          size="lg"
                                          onClick={(e) => handleOpenEditStudents(pilot.id, pilot.name, e)}
                                          className="w-full gap-2 text-muted-foreground hover:text-foreground h-11"
                                        >
                                          <Plus className="h-5 w-5" />
                                          {hasStudents ? 'Weiteren Flugschüler hinzufügen' : 'Flugschüler hinzufügen'}
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        
                        {/* Separator wenn auch Vereinsmitglieder aktiv sind */}
                        {activePilots.some(p => p.memberType === 'member') && (
                          <Separator className="my-4" />
                        )}
                      </>
                    );
                  })()}
                  
                  {/* Vereinsmitglieder */}
                  {(() => {
                    const memberPilots = activePilots.filter(p => p.memberType === 'member');
                    
                    // Gruppieren nach Flugschülern
                    const pilotsWithStudents = memberPilots.filter(p => p.students && p.students.length > 0);
                    const pilotsWithoutStudents = memberPilots.filter(p => !p.students || p.students.length === 0);
                    
                    // Sortieren nach Startzeit (früh -> spät)
                    const sortByTime = (a: any, b: any) => a.startTime.localeCompare(b.startTime);
                    pilotsWithStudents.sort(sortByTime);
                    pilotsWithoutStudents.sort(sortByTime);
                    
                    // Kombinieren: Erst mit Flugschülern, dann ohne
                    const sortedPilots = [...pilotsWithStudents, ...pilotsWithoutStudents];
                    
                    return sortedPilots.map((pilot) => {
                  const isStudentsExpanded = expandedPilots.includes(pilot.id);
                  const isDetailsExpanded = expandedDetails.includes(pilot.id);
                  const hasStudents = pilot.students && pilot.students.length > 0;
                  
                  // Avatar-Farbe ohne Flugleiter-Markierung
                  const avatarColors = getAvatarColor(pilot, false, false, hasStudents);
                  
                  return (
                    <div key={pilot.id}>
                      {/* Pilot Card - Klickbar für Details */}
                      <div 
                        className={`flex items-center gap-3 p-3 bg-card border cursor-pointer hover:bg-accent/50 transition-colors ${
                          (hasStudents && isStudentsExpanded) || isDetailsExpanded ? 'rounded-t-lg border-b-0' : 'rounded-lg'
                        }`}
                        onClick={() => toggleDetailsExpansion(pilot.id)}
                      >
                        <Avatar className={cn("h-12 w-12 border-2", avatarColors.border)}>
                          <AvatarFallback className={cn(avatarColors.bg, avatarColors.text)}>
                            {pilot.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg">{pilot.name}</h4>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              <span>seit {pilot.startTime}</span>
                            </div>
                            {/* Nur 35 MHz anzeigen (wichtig wegen Kanal-Koordination), 2,4 GHz ist nicht relevant */}
                            {(() => {
                              // Extrahiere nur den 35 MHz Teil aus dem Frequency-String
                              const match = pilot.frequency.match(/35 MHz \(K\d+\)/);
                              if (match) {
                                return (
                                  <>
                                    <span>•</span>
                                    <div className="flex items-center gap-1.5">
                                      <Radio className="h-3.5 w-3.5" />
                                      <span className="font-mono">{match[0]}</span>
                                    </div>
                                  </>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {/* Flugschüler-Badge nur für Mitglieder, nicht für Gäste */}
                          {pilot.memberType === 'member' && (
                            <Badge 
                              variant="secondary" 
                              className="text-base gap-1 cursor-pointer hover:bg-secondary/80 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePilotExpansion(pilot.id);
                              }}
                            >
                              <GraduationCap className="h-4 w-4" />
                              {hasStudents && pilot.students.length}
                            </Badge>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleRemovePilot(pilot.id, pilot.name, e)}
                            className="gap-2"
                          >
                            <LogOut className="h-4 w-4" />
                            <span className="hidden xl:inline">Austragen</span>
                          </Button>
                        </div>
                      </div>

                      {/* Details-Bereich - Pilot-Informationen */}
                      {isDetailsExpanded && (
                        <div className={`border-x border-b bg-muted/10 px-4 py-3 ${
                          !hasStudents || !isStudentsExpanded ? 'rounded-b-lg' : ''
                        }`}>
                          <div className="grid grid-cols-2 gap-4">
                            {/* Linke Spalte */}
                            <div className="space-y-3">
                              {/* Frequenz */}
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">Frequenz</div>
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                                    <BarChart3 className="h-4 w-4 text-primary" />
                                  </div>
                                  <span className="font-mono text-foreground">{pilot.frequency}</span>
                                </div>
                              </div>

                              {/* Antriebstypen */}
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">Antriebstypen</div>
                                <div className="flex flex-wrap gap-2">
                                  {(() => {
                                    // Verwende driveTypes falls vorhanden, ansonsten aus flights ableiten
                                    const types = pilot.driveTypes && pilot.driveTypes.length > 0
                                      ? pilot.driveTypes
                                      : [...new Set(pilot.flights?.map(f => f.modelType) || [])];
                                    
                                    if (types.length === 0) {
                                      return <span className="text-xs text-muted-foreground">Noch keine Flüge</span>;
                                    }
                                    
                                    return types.map((type, idx) => (
                                      <Badge key={idx} variant="outline" className="gap-1.5">
                                        {type === 'Elektro' ? (
                                          <Zap className="h-3 w-3" />
                                        ) : (
                                          <Fuel className="h-3 w-3" />
                                        )}
                                        {type}
                                      </Badge>
                                    ));
                                  })()}
                                </div>
                              </div>
                            </div>

                            {/* Rechte Spalte */}
                            <div className="space-y-3">
                              {/* Mitgliedsstatus */}
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">Status</div>
                                <div className="flex items-center gap-2">
                                  <div className={`h-8 w-8 rounded flex items-center justify-center ${
                                    pilot.memberType === 'member' 
                                      ? 'bg-green-500/10' 
                                      : 'bg-orange-500/10'
                                  }`}>
                                    {pilot.memberType === 'member' ? (
                                      <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    ) : (
                                      <UserCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                    )}
                                  </div>
                                  <Badge 
                                    variant={pilot.memberType === 'member' ? 'default' : 'secondary'}
                                    className={pilot.memberType === 'member' 
                                      ? 'bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20 border-green-500/20'
                                      : 'bg-orange-500/10 text-orange-700 dark:text-orange-400 hover:bg-orange-500/20 border-orange-500/20'
                                    }
                                  >
                                    {pilot.memberType === 'member' ? 'Mitglied' : 'Gastflieger'}
                                  </Badge>
                                </div>
                              </div>

                              {/* Anwesenheitsdauer */}
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">Anwesenheit</div>
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded bg-blue-500/10 flex items-center justify-center">
                                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                  </div>
                                  <div>
                                    <div className="text-sm text-foreground">seit {pilot.startTime}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {(() => {
                                        const now = new Date();
                                        const [hours, minutes] = pilot.startTime.split(':').map(Number);
                                        const start = new Date();
                                        start.setHours(hours, minutes, 0);
                                        const diff = Math.floor((now.getTime() - start.getTime()) / 60000);
                                        const h = Math.floor(diff / 60);
                                        const m = diff % 60;
                                        return `${h}h ${m}min`;
                                      })()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Zugeordnete Flugschüler - Ausklappbar (nur für Mitglieder) */}
                      {isStudentsExpanded && pilot.memberType === 'member' && (
                        <div className={isDetailsExpanded ? '' : ''}>
                          {hasStudents && pilot.students?.map((student, index) => (
                            <div
                              key={student.id}
                              className={`border-x border-b bg-muted/20 px-3 py-2`}
                            >
                              {/* Kompakte Darstellung in einer Zeile */}
                              <div className="flex items-center gap-2">
                                <div className={`h-6 w-6 rounded-full ${getFlightIconColor(student).bg} flex items-center justify-center flex-shrink-0`}>
                                  <GraduationCap className={`h-3.5 w-3.5 ${getFlightIconColor(student).icon}`} />
                                </div>
                                <span className="text-sm font-medium text-foreground flex-shrink-0">{student.name}</span>
                                <Badge variant="outline" className="text-xs flex-shrink-0">
                                  Flugschüler
                                </Badge>
                                {student.startTime && (
                                  <>
                                    <span className="text-muted-foreground flex-shrink-0">•</span>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-shrink-0">
                                      <Clock className="h-3 w-3" />
                                      <span>seit {student.startTime}</span>
                                    </div>
                                  </>
                                )}
                                <div className="flex-1"></div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTransferStudent({
                                      open: true,
                                      pilotId: pilot.id,
                                      pilotName: pilot.name,
                                      studentId: student.id,
                                      studentName: student.name
                                    });
                                    setSelectedTargetPilot('');
                                  }}
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-blue-600 hover:bg-blue-500/10 flex-shrink-0"
                                  title="Zu anderem Piloten übertragen"
                                >
                                  <ArrowRightLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => handleRemoveStudent(pilot.id, student.id, student.name, e)}
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                                  title="Flugschüler entfernen"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>

                              {/* Notizen falls vorhanden */}
                              {student.notes && (
                                <div className="flex items-start gap-2 mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded">
                                  <AlertTriangle className="h-3.5 w-3.5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
                                  <p className="text-xs text-red-900 dark:text-red-200">
                                    {student.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                          {/* Button zum Hinzufügen weiterer Flugschüler */}
                          <div className="border-x border-b bg-muted/10 px-3 py-2 rounded-b-lg">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleOpenEditStudents(pilot.id, pilot.name, e)}
                              className="w-full gap-2 text-muted-foreground hover:text-foreground"
                            >
                              <Plus className="h-4 w-4" />
                              {hasStudents ? 'Weiteren Flugschüler hinzufügen' : 'Flugschüler hinzufügen'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                    });
                  })()}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-center text-muted-foreground">
        <p>Diese Anzeige aktualisiert sich automatisch • Tablet-Kiosk Modus</p>
      </div>

      {/* Eintragen Dialog mit Tabs */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-2xl">Eintragen</DialogTitle>
            <DialogDescription>
              Wähle aus, ob du einen Flugleiter oder einen Piloten eintragen möchtest.
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto flex-1 -mx-6 px-6">
            <Tabs defaultValue="flugleiter" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12">
              <TabsTrigger value="flugleiter" className="gap-2">
                <GraduationCap className="h-4 w-4" />
                Flugleiter
              </TabsTrigger>
              <TabsTrigger value="pilot" className="gap-2">
                <Plane className="h-4 w-4" />
                Pilot
              </TabsTrigger>
            </TabsList>

            {/* Flugleiter Tab */}
            <TabsContent value="flugleiter" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="flugleiter">
                  Flugleiter auswählen
                  <span className="text-muted-foreground text-sm ml-2">(Volljähriges Vereinsmitglied)</span>
                </Label>
                <Popover open={openInstructorCombobox} onOpenChange={setOpenInstructorCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openInstructorCombobox}
                      className="w-full h-12 justify-between"
                    >
                      {selectedInstructor
                        ? availableInstructors.find(i => i.id.toString() === selectedInstructor)?.name
                        : "Bitte wählen..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Flugleiter suchen..." />
                      <CommandList>
                        <CommandEmpty>
                          {availableInstructors.length === 0 
                            ? 'Alle Mitglieder sind bereits als Flugleiter aktiv.' 
                            : 'Kein Flugleiter gefunden.'}
                        </CommandEmpty>
                        <CommandGroup>
                          {availableInstructors.map((instructor) => (
                            <CommandItem
                              key={instructor.id}
                              value={instructor.name}
                              onSelect={() => {
                                handleInstructorChange(instructor.id.toString());
                                setOpenInstructorCombobox(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  selectedInstructor === instructor.id.toString()
                                    ? "opacity-100"
                                    : "opacity-0"
                                }`}
                              />
                              {instructor.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Warnung/Info wenn Flugleiter als Pilot aktiv ist */}
              {instructorWarning && (
                <div className={`rounded-lg p-3 flex items-start gap-3 ${
                  needsSecondInstructor 
                    ? 'bg-orange-500/10 border border-orange-500/20' 
                    : 'bg-blue-500/10 border border-blue-500/20'
                }`}>
                  <AlertTriangle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                    needsSecondInstructor 
                      ? 'text-orange-600 dark:text-orange-400' 
                      : 'text-blue-600 dark:text-blue-400'
                  }`} />
                  <div className="flex-1">
                    <p className={`text-sm ${
                      needsSecondInstructor 
                        ? 'text-orange-900 dark:text-orange-200' 
                        : 'text-blue-900 dark:text-blue-200'
                    }`}>
                      {instructorWarning}
                    </p>
                  </div>
                </div>
              )}

              {/* Zweiter Flugleiter wenn nötig */}
              {needsSecondInstructor && (
                <div className="space-y-2">
                  <Label htmlFor="second-flugleiter">
                    Zweiter Flugleiter (Stellvertreter)
                    <span className="text-muted-foreground text-sm ml-2">(Kann auch Pilot sein)</span>
                  </Label>
                  <Popover open={openSecondInstructorCombobox} onOpenChange={setOpenSecondInstructorCombobox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openSecondInstructorCombobox}
                        className="w-full h-12 justify-between"
                      >
                        {secondInstructor
                          ? availableSecondInstructors.find(i => i.id.toString() === secondInstructor)?.name
                          : "Bitte wählen..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Flugleiter suchen..." />
                        <CommandList>
                          <CommandEmpty>Kein Flugleiter gefunden.</CommandEmpty>
                          <CommandGroup>
                            {availableSecondInstructors.map((instructor) => (
                              <CommandItem
                                key={instructor.id}
                                value={instructor.name}
                                onSelect={() => {
                                  setSecondInstructor(instructor.id.toString());
                                  setOpenSecondInstructorCombobox(false);
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    secondInstructor === instructor.id.toString()
                                      ? "opacity-100"
                                      : "opacity-0"
                                  }`}
                                />
                                {instructor.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <Button 
                  variant="outline" 
                  className="flex-1 h-12"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Abbrechen
                </Button>
                <Button 
                  className="flex-1 h-12 gap-2"
                  onClick={handleStartInstructorShift}
                  disabled={!selectedInstructor || (needsSecondInstructor && !secondInstructor)}
                >
                  <GraduationCap className="h-4 w-4" />
                  Dienst beginnen
                </Button>
              </div>
            </TabsContent>

            {/* Pilot Tab */}
            <TabsContent value="pilot" className="space-y-6 mt-4">
              {/* 1. PILOT AUSWAHL */}
              <div className="space-y-3">
                <Label className="text-base">Pilot auswählen</Label>
                
                <Tabs value={pilotType} onValueChange={(v) => {
                  setPilotType(v as 'member' | 'guest');
                  // Flugschüler zurücksetzen wenn zu Gastflieger gewechselt wird
                  if (v === 'guest') {
                    setIsFlugschueler(false);
                    setFlugschuelerListe([]);
                  }
                }}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="member" className="gap-2">
                      <Users className="h-4 w-4" />
                      Vereinsmitglied
                    </TabsTrigger>
                    <TabsTrigger value="guest" className="gap-2">
                      <UserPlus className="h-4 w-4" />
                      Gastflieger
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Mitglied Tab */}
                  <TabsContent value="member" className="mt-4">
                    <Card>
                      <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                          <Label>Vereinsmitglied auswählen</Label>
                          <Popover open={pilotMemberSearchOpen} onOpenChange={setPilotMemberSearchOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={pilotMemberSearchOpen}
                                className="w-full justify-between h-12"
                              >
                                {selectedPilotMember
                                  ? availablePilotMembers.find((member) => member.id.toString() === selectedPilotMember)?.name
                                  : "Mitglied suchen..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[500px] p-0" align="start">
                              <Command>
                                <CommandInput placeholder="Mitglied suchen..." />
                                <CommandList>
                                  <CommandEmpty>Kein verfügbares Mitglied gefunden.</CommandEmpty>
                                  <CommandGroup>
                                    {availablePilotMembers.map((member) => (
                                      <CommandItem
                                        key={member.id}
                                        value={member.name}
                                        onSelect={() => {
                                          setSelectedPilotMember(member.id.toString());
                                          setPilotMemberSearchOpen(false);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedPilotMember === member.id.toString() ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        {member.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                            {availablePilotMembers.length === 0 
                              ? 'Alle Mitglieder sind bereits als Pilot aktiv'
                              : 'Durchsuche die Mitgliederliste'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Gast Tab */}
                  <TabsContent value="guest" className="mt-4">
                    <Card>
                      <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="guest-pilot-name">Name des Gastfliegers</Label>
                          <Input
                            id="guest-pilot-name"
                            type="text"
                            placeholder="Vor- und Nachname"
                            value={guestPilotName}
                            onChange={(e) => setGuestPilotName(e.target.value)}
                            className="h-12"
                          />
                          <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                            Vor- und Nachname des Gastfliegers
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              <Separator />

              {/* Flugschüler Checkbox - nur für Vereinsmitglieder */}
              {pilotType === 'member' && (
                <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-dashed hover:border-primary/50 transition-colors">
                  <Checkbox
                    id="flugschueler-pilot"
                    checked={isFlugschueler}
                    onCheckedChange={(checked) => {
                      setIsFlugschueler(checked === true);
                      if (!checked) {
                        setFlugschuelerListe([]);
                      }
                    }}
                  />
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <Label 
                    htmlFor="flugschueler-pilot" 
                    className="font-normal cursor-pointer"
                  >
                    Flug mit Flugschüler
                  </Label>
                </div>
              </div>
              )}

              {/* FLUGSCHÜLER DETAILS */}
              {pilotType === 'member' && isFlugschueler && (
                <>
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-6 w-6 text-primary" />
                      <div>
                        <Label className="text-base">Flugschüler</Label>
                        <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                          Mitglied oder Gast auswählen
                        </p>
                      </div>
                    </div>
                    
                    <Tabs value={schuelerType} onValueChange={(v) => setSchuelerType(v as 'mitglied' | 'gast')}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="mitglied" className="gap-2">
                          <Users className="h-4 w-4" />
                          Mitglied
                        </TabsTrigger>
                        <TabsTrigger value="gast" className="gap-2">
                          <UserPlus className="h-4 w-4" />
                          Gast
                        </TabsTrigger>
                      </TabsList>
                      
                      {/* Mitglied Tab */}
                      <TabsContent value="mitglied" className="mt-4">
                        <Card>
                          <CardContent className="pt-6 space-y-4">
                            <div className="space-y-2">
                              <Label>Vereinsmitglied auswählen</Label>
                              <div className="flex gap-2">
                                <Popover open={schuelerMemberSearchOpen} onOpenChange={setSchuelerMemberSearchOpen}>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      aria-expanded={schuelerMemberSearchOpen}
                                      className="flex-1 justify-between"
                                    >
                                      {selectedSchuelerMember
                                        ? availableStudentMembers.find((member) => member.id.toString() === selectedSchuelerMember)?.name
                                        : "Mitglied suchen..."}
                                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-[400px] p-0" align="start">
                                    <Command>
                                      <CommandInput placeholder="Mitglied suchen..." />
                                      <CommandList>
                                        <CommandEmpty>Kein verfügbares Mitglied gefunden.</CommandEmpty>
                                        <CommandGroup>
                                          {availableStudentMembers.map((member) => (
                                            <CommandItem
                                              key={member.id}
                                              value={member.name}
                                              onSelect={() => {
                                                setSelectedSchuelerMember(member.id.toString());
                                                setSchuelerMemberSearchOpen(false);
                                              }}
                                            >
                                              <Check
                                                className={cn(
                                                  "mr-2 h-4 w-4",
                                                  selectedSchuelerMember === member.id.toString() ? "opacity-100" : "opacity-0"
                                                )}
                                              />
                                              {member.name}
                                            </CommandItem>
                                          ))}
                                        </CommandGroup>
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                                <Button
                                  type="button"
                                  onClick={handleAddFlugschueler}
                                  className="gap-2"
                                >
                                  <Plus className="h-4 w-4" />
                                  Hinzufügen
                                </Button>
                              </div>
                              <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                                {availableStudentMembers.length === 0 
                                  ? 'Alle Mitglieder sind bereits als Pilot oder Flugschüler aktiv'
                                  : 'Durchsuche die Mitgliederliste und füge Flugschüler hinzu'}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                      
                      {/* Gast Tab */}
                      <TabsContent value="gast" className="mt-4">
                        <Card>
                          <CardContent className="pt-6 space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="guest-schueler-name">Name des Gastes</Label>
                              <Input
                                id="guest-schueler-name"
                                type="text"
                                placeholder="Vor- und Nachname"
                                value={guestSchuelerName}
                                onChange={(e) => setGuestSchuelerName(e.target.value)}
                              />
                            </div>
                            
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="guest-schueler-email">E-Mail</Label>
                                <Input
                                  id="guest-schueler-email"
                                  type="email"
                                  placeholder="gast@beispiel.de"
                                  value={guestSchuelerEmail}
                                  onChange={(e) => setGuestSchuelerEmail(e.target.value)}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="guest-schueler-phone">Telefon</Label>
                                <Input
                                  id="guest-schueler-phone"
                                  type="tel"
                                  placeholder="0172 1234567"
                                  value={guestSchuelerPhone}
                                  onChange={(e) => setGuestSchuelerPhone(e.target.value)}
                                />
                              </div>
                            </div>
                            
                            <Button
                              type="button"
                              onClick={handleAddFlugschueler}
                              className="w-full gap-2"
                            >
                              <Plus className="h-4 w-4" />
                              Gast hinzufügen
                            </Button>
                            
                            <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                              Name und mindestens E-Mail oder Telefon erforderlich
                            </p>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                    
                    {/* HINZUGEFÜGTE FLUGSCHÜLER LISTE */}
                    {flugschuelerListe.length > 0 && (
                      <>
                        <Separator />
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label>Hinzugefügte Flugschüler ({flugschuelerListe.length})</Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setFlugschuelerListe([])}
                              className="h-8 text-muted-foreground hover:text-destructive"
                            >
                              Alle entfernen
                            </Button>
                          </div>
                          
                          <div className="space-y-2">
                            {flugschuelerListe.map((schueler) => (
                              <div
                                key={schueler.id}
                                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    {schueler.type === 'mitglied' ? (
                                      <Users className="h-4 w-4 text-primary" />
                                    ) : (
                                      <UserPlus className="h-4 w-4 text-primary" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="truncate">{schueler.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="outline" className="text-xs">
                                        {schueler.type === 'mitglied' ? 'Mitglied' : 'Gast'}
                                      </Badge>
                                      {schueler.email && (
                                        <span className="text-muted-foreground truncate" style={{ fontSize: '0.75rem' }}>
                                          {schueler.email}
                                        </span>
                                      )}
                                      {schueler.phone && (
                                        <span className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                                          {schueler.phone}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveFlugschueler(schueler.id)}
                                  className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-destructive"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}

              <Separator />

              {/* 2-SPALTEN LAYOUT FÜR ANTRIEBSART UND FERNSTEUERUNG */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* 2. ANTRIEBSART */}
                <Card className="border-2">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <Zap className="h-6 w-6 text-blue-600 dark:text-blue-500" />
                      <div>
                        <Label className="text-base">Antriebsart *</Label>
                        <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                          Wähle die Antriebsart
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                        <Checkbox
                          id="elektro-pilot"
                          checked={isElektro}
                          onCheckedChange={(checked) => setIsElektro(checked === true)}
                        />
                        <Label htmlFor="elektro-pilot" className="font-normal cursor-pointer flex-1">
                          Elektroflug
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                        <Checkbox
                          id="verbrenner-pilot"
                          checked={isVerbrenner}
                          onCheckedChange={(checked) => setIsVerbrenner(checked === true)}
                        />
                        <Label htmlFor="verbrenner-pilot" className="font-normal cursor-pointer flex-1">
                          Verbrennerflug
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 3. FERNSTEUERUNG */}
                <Card className="border-2">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <Radio className="h-6 w-6 text-purple-600 dark:text-purple-500" />
                      <div>
                        <Label className="text-base">Fernsteuerung *</Label>
                        <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                          Wähle die Frequenz
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                        <Checkbox
                          id="frequency-24ghz-pilot"
                          checked={is24GHz}
                          onCheckedChange={(checked) => setIs24GHz(checked === true)}
                        />
                        <Label
                          htmlFor="frequency-24ghz-pilot"
                          className="font-normal cursor-pointer flex-1"
                        >
                          2,4 GHz
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                        <Checkbox
                          id="frequency-35mhz-pilot"
                          checked={is35MHz}
                          onCheckedChange={(checked) => {
                            setIs35MHz(checked === true);
                            if (!checked) {
                              setChannel('');
                            }
                          }}
                        />
                        <Label
                          htmlFor="frequency-35mhz-pilot"
                          className="font-normal cursor-pointer flex-1"
                        >
                          35 MHz
                        </Label>
                      </div>
                      
                      {is35MHz && (
                        <div className="space-y-2 pt-2">
                          <Label htmlFor="channel-pilot">Kanal *</Label>
                          <Input
                            id="channel-pilot"
                            type="text"
                            placeholder="z.B. 75"
                            value={channel}
                            onChange={(e) => setChannel(e.target.value)}
                            required={is35MHz}
                            className={cn(
                              occupied35MHzChannels.includes(channel.trim()) && channel.trim() 
                                ? "border-destructive focus-visible:ring-destructive" 
                                : ""
                            )}
                          />
                          {occupied35MHzChannels.length > 0 && (
                            <div className="rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-amber-800 dark:text-amber-200">
                                    <span className="font-medium">Bereits belegte Kanäle:</span>{' '}
                                    {occupied35MHzChannels.map((ch, idx) => (
                                      <span key={ch}>
                                        <span className={cn(
                                          "font-mono",
                                          channel.trim() === ch && "text-destructive font-bold"
                                        )}>
                                          K{ch}
                                        </span>
                                        {idx < occupied35MHzChannels.length - 1 && ', '}
                                      </span>
                                    ))}
                                  </p>
                                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                    Jeder Kanal darf nur einmal verwendet werden
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-3 mt-6">
                <Button 
                  variant="outline" 
                  className="flex-1 h-12"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Abbrechen
                </Button>
                <Button 
                  className="flex-1 h-12 gap-2"
                  onClick={handleAddPilot}
                >
                  <Plane className="h-4 w-4" />
                  Pilot eintragen
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bestätigung Dienst beenden */}
      <AlertDialog open={confirmEndShift.open} onOpenChange={(open) => !open && setConfirmEndShift({ open: false, instructorId: null, instructorName: '' })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dienst beenden?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du den Dienst von <strong>{confirmEndShift.instructorName}</strong> wirklich beenden?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={confirmEndShiftAction}>
              Dienst beenden
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bestätigung Pilot austragen */}
      <AlertDialog open={confirmRemovePilot.open} onOpenChange={(open) => !open && setConfirmRemovePilot({ open: false, pilotId: null, pilotName: '' })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pilot austragen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du <strong>{confirmRemovePilot.pilotName}</strong> wirklich austragen? Alle aktiven Flüge werden automatisch beendet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemovePilotAction}>
              Austragen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bestätigung Flugschüler austragen */}
      <AlertDialog open={confirmRemoveStudent.open} onOpenChange={(open) => !open && setConfirmRemoveStudent({ open: false, pilotId: null, studentId: null, studentName: '' })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Flugschüler austragen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du den Flugschüler <strong>{confirmRemoveStudent.studentName}</strong> wirklich austragen?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveStudentAction}>
              Austragen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog: Flugschüler-Zuweisung beim Pilot-Austragen */}
      <Dialog open={reassignStudents.open} onOpenChange={(open) => {
        if (!open) {
          setReassignStudents({ open: false, pilotId: null, pilotName: '', students: [] });
          setStudentActions({});
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pilot mit Flugschülern austragen</DialogTitle>
            <DialogDescription>
              <strong>{reassignStudents.pilotName}</strong> hat Flugschüler eingetragen. Entscheide für jeden Flugschüler einzeln, ob er mit ausgetragen oder einem anderen Piloten zugewiesen werden soll.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Liste der Flugschüler mit individuellen Auswahlmöglichkeiten */}
            <div className="space-y-3">
              {reassignStudents.students.map((student) => (
                <div key={student.id} className="p-4 border rounded-lg bg-muted/20">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <GraduationCap className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{student.name}</div>
                      {student.startTime && (
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>seit {student.startTime}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Aktionsauswahl für diesen Flugschüler */}
                  <div className="space-y-2 ml-11">
                    <Label className="text-xs text-muted-foreground">Aktion wählen:</Label>
                    <Select 
                      value={studentActions[student.id] || 'remove'} 
                      onValueChange={(value) => {
                        setStudentActions(prev => ({
                          ...prev,
                          [student.id]: value
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remove">
                          <div className="flex items-center gap-2">
                            <LogOut className="h-4 w-4" />
                            <span>Mit austragen</span>
                          </div>
                        </SelectItem>
                        {activePilots
                          .filter(p => p.id !== reassignStudents.pilotId && p.memberType === 'member')
                          .map((pilot) => (
                            <SelectItem key={pilot.id} value={pilot.id.toString()}>
                              <div className="flex items-center gap-2">
                                <UserPlus className="h-4 w-4" />
                                <span>Zu {pilot.name} zuweisen</span>
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>

            {/* Zusammenfassung der Aktionen */}
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="text-sm space-y-2">
                <div className="font-medium mb-2">Zusammenfassung:</div>
                {(() => {
                  const toRemove = reassignStudents.students.filter(s => studentActions[s.id] === 'remove');
                  const toReassign = reassignStudents.students.filter(s => studentActions[s.id] !== 'remove');
                  
                  return (
                    <>
                      {toRemove.length > 0 && (
                        <div className="flex items-start gap-2">
                          <LogOut className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="text-muted-foreground">Austragen: </span>
                            <span>{toRemove.map(s => s.name).join(', ')}</span>
                          </div>
                        </div>
                      )}
                      {toReassign.length > 0 && (
                        <div className="flex items-start gap-2">
                          <UserPlus className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="text-muted-foreground">Neu zuweisen: </span>
                            <span>{toReassign.length} Flugschüler</span>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Bestätigen Button */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setReassignStudents({ open: false, pilotId: null, pilotName: '', students: [] });
                  setStudentActions({});
                }}
                className="flex-1"
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleProcessStudentActions}
                className="flex-1 gap-2"
              >
                <Check className="h-4 w-4" />
                Bestätigen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Flugschüler übertragen */}
      <Dialog open={transferStudent.open} onOpenChange={(open) => {
        if (!open) {
          setTransferStudent({ open: false, pilotId: null, pilotName: '', studentId: null, studentName: '' });
          setSelectedTargetPilot('');
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Flugschüler übertragen</DialogTitle>
            <DialogDescription>
              Übertrage <strong>{transferStudent.studentName}</strong> von <strong>{transferStudent.pilotName}</strong> zu einem anderen Piloten.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Neuer Pilot</Label>
              <Select value={selectedTargetPilot} onValueChange={setSelectedTargetPilot}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilot auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {activePilots
                    .filter(p => p.id !== transferStudent.pilotId && p.memberType === 'member')
                    .map((pilot) => (
                      <SelectItem key={pilot.id} value={pilot.id.toString()}>
                        <div className="flex items-center gap-2">
                          <UserPlus className="h-4 w-4" />
                          <span>{pilot.name}</span>
                          {pilot.students && pilot.students.length > 0 && (
                            <Badge variant="outline" className="ml-2">
                              {pilot.students.length} Schüler
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setTransferStudent({ open: false, pilotId: null, pilotName: '', studentId: null, studentName: '' });
                setSelectedTargetPilot('');
              }}
              className="flex-1"
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleTransferStudent}
              disabled={!selectedTargetPilot}
              className="flex-1 gap-2"
            >
              <ArrowRightLeft className="h-4 w-4" />
              Übertragen
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Flugleiter-Ersatz erforderlich */}
      <Dialog open={confirmReplaceInstructor.open} onOpenChange={(open) => {
        if (!open) {
          setConfirmReplaceInstructor({ open: false, departingInstructorId: null, departingInstructorName: '', remainingInstructor: null });
          setReplacementInstructor('');
        }
      }}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Flugleiter-Ersatz erforderlich</DialogTitle>
            <DialogDescription className="space-y-3">
              {confirmReplaceInstructor.remainingInstructor && (
                <>
                  <p>
                    Nach dem Dienstende von <strong>{confirmReplaceInstructor.departingInstructorName}</strong> bleibt nur noch{' '}
                    <strong>{confirmReplaceInstructor.remainingInstructor.name}</strong> als Flugleiter übrig.
                  </p>
                  <p>
                    Da <strong>{confirmReplaceInstructor.remainingInstructor.name}</strong> aktuell als Pilot aktiv ist, 
                    musst du entweder einen weiteren Flugleiter benennen oder den Pilot-Status beenden.
                  </p>
                  
                  {/* Ausdrücklicher Hinweis zur Verantwortung */}
                  <Alert className="border-primary/50 bg-primary/5">
                    <UserCheck className="h-4 w-4 text-primary" />
                    <AlertTitle className="text-primary">Wichtig: Deine Verantwortung</AlertTitle>
                    <AlertDescription className="text-foreground">
                      <strong>Als ausscheidender Flugleiter bist du dafür verantwortlich</strong>, 
                      einen Nachfolger zu organisieren! Bitte wähle einen Ersatz-Flugleiter aus oder 
                      kläre die Situation mit dem verbleibenden Flugleiter, bevor du deinen Dienst beendest.
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Option 1: Neuen Flugleiter hinzufügen */}
            <div className="space-y-2">
              <Label>Option 1: Weiteren Flugleiter hinzufügen</Label>
              <Popover open={openReplacementCombobox} onOpenChange={setOpenReplacementCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openReplacementCombobox}
                    className="w-full h-12 justify-between"
                  >
                    {replacementInstructor
                      ? availableInstructors.find(i => i.id.toString() === replacementInstructor)?.name
                      : "Flugleiter auswählen..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Flugleiter suchen..." />
                    <CommandList>
                      <CommandEmpty>Kein Flugleiter gefunden.</CommandEmpty>
                      <CommandGroup>
                        {availableInstructors
                          .filter(i => confirmReplaceInstructor.remainingInstructor && i.id !== confirmReplaceInstructor.remainingInstructor.id)
                          .map((instructor) => (
                            <CommandItem
                              key={instructor.id}
                              value={instructor.name}
                              onSelect={() => {
                                setReplacementInstructor(instructor.id.toString());
                                setOpenReplacementCombobox(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  replacementInstructor === instructor.id.toString()
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {instructor.name}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <Button 
                onClick={handleAddReplacementInstructor} 
                disabled={!replacementInstructor}
                className="w-full h-12"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Flugleiter hinzufügen
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  oder
                </span>
              </div>
            </div>

            {/* Option 2: Pilot-Status beenden */}
            <div className="space-y-2">
              <Label>Option 2: Pilot-Status beenden</Label>
              <Button 
                onClick={handleRemoveRemainingPilotStatus}
                variant="outline"
                className="w-full h-12"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {confirmReplaceInstructor.remainingInstructor?.name} als Pilot austragen
              </Button>
            </div>

            <Button 
              variant="ghost" 
              onClick={() => {
                setConfirmReplaceInstructor({ open: false, departingInstructorId: null, departingInstructorName: '', remainingInstructor: null });
                setReplacementInstructor('');
              }}
              className="w-full"
            >
              Abbrechen
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Pflicht-Ersatz erforderlich (letzter Flugleiter bei >= 3 Piloten) */}
      <Dialog open={mandatoryReplacement.open} onOpenChange={(open) => {
        if (!open) {
          setMandatoryReplacement({ open: false, departingInstructorId: null, departingInstructorName: '' });
          setMandatoryReplacementInstructor('');
        }
      }}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Ersatz-Flugleiter erforderlich!</DialogTitle>
            <DialogDescription className="space-y-3">
              {(() => {
                const guestCount = activePilots.filter(p => p.memberType === 'guest').length;
                const studentsCount = activePilots.reduce((sum, p) => sum + (p.students?.length || 0), 0);
                const totalPilots = activePilots.length + studentsCount;
                const hasGuests = guestCount > 0;
                
                return (
                  <>
                    <p>
                      Du bist der <strong>letzte aktive Flugleiter</strong> und es sind aktuell{' '}
                      <strong>{totalPilots} Pilot{totalPilots !== 1 ? 'en' : ''}</strong>
                      {(studentsCount > 0 || guestCount > 0) && (
                        <> (
                          {studentsCount > 0 && <><strong>{studentsCount} Flugschüler</strong></>}
                          {studentsCount > 0 && guestCount > 0 && ', '}
                          {guestCount > 0 && <><strong>{guestCount} Gast</strong></>}
                        )</>
                      )} aktiv.
                    </p>
                    
                    {/* Ausdrücklicher Hinweis zur Verantwortung */}
                    <Alert variant="destructive" className="border-destructive/50">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Wichtig: Deine Verantwortung!</AlertTitle>
                      <AlertDescription>
                        <strong>Es ist deine Aufgabe als ausscheidender Flugleiter</strong>, vor dem Beenden 
                        deines Dienstes einen Nachfolger zu organisieren. {hasGuests
                          ? 'Bei aktiven Gastfliegern wird zwingend ein Flugleiter benötigt.' 
                          : 'Ab 3 aktiven Piloten (inkl. Flugschüler) wird zwingend mindestens ein Flugleiter benötigt.'
                        }
                      </AlertDescription>
                    </Alert>

                    <Alert className="border-primary/50 bg-primary/5">
                      <UserCheck className="h-4 w-4 text-primary" />
                      <AlertDescription className="text-foreground">
                        Bitte wähle einen Ersatz-Flugleiter aus, der deinen Dienst übernimmt, 
                        bevor du deinen Dienst beendest.
                      </AlertDescription>
                    </Alert>
                  </>
                );
              })()}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Ersatz-Flugleiter auswählen */}
            <div className="space-y-2">
              <Label htmlFor="mandatory-replacement">
                Ersatz-Flugleiter auswählen <span className="text-destructive">*</span>
              </Label>
              <Popover open={openMandatoryReplacementCombobox} onOpenChange={setOpenMandatoryReplacementCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openMandatoryReplacementCombobox}
                    className="w-full h-12 justify-between"
                  >
                    {mandatoryReplacementInstructor
                      ? availableInstructors.find(i => i.id.toString() === mandatoryReplacementInstructor)?.name
                      : "Flugleiter auswählen..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Flugleiter suchen..." />
                    <CommandList>
                      <CommandEmpty>Kein Flugleiter gefunden.</CommandEmpty>
                      <CommandGroup>
                        {availableInstructors.map((instructor) => (
                          <CommandItem
                            key={instructor.id}
                            value={instructor.name}
                            onSelect={() => {
                              setMandatoryReplacementInstructor(instructor.id.toString());
                              setOpenMandatoryReplacementCombobox(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                mandatoryReplacementInstructor === instructor.id.toString()
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {instructor.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Warnung wenn Ersatz-Flugleiter als Pilot aktiv ist */}
            {mandatoryWarning && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{mandatoryWarning}</AlertDescription>
              </Alert>
            )}

            {/* Zweiter Flugleiter (falls erster als Pilot aktiv) */}
            {needsMandatorySecondInstructor && (
              <div className="space-y-2">
                <Label htmlFor="mandatory-second-instructor">
                  Zweiter Flugleiter (für Aufsicht) <span className="text-destructive">*</span>
                </Label>
                <Popover open={openMandatorySecondCombobox} onOpenChange={setOpenMandatorySecondCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openMandatorySecondCombobox}
                      className="w-full h-12 justify-between"
                    >
                      {mandatorySecondInstructor
                        ? availableMandatorySecondInstructors.find(i => i.id.toString() === mandatorySecondInstructor)?.name
                        : "Zweiten Flugleiter auswählen..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Flugleiter suchen..." />
                      <CommandList>
                        <CommandEmpty>Kein weiterer Flugleiter verfügbar.</CommandEmpty>
                        <CommandGroup>
                          {availableMandatorySecondInstructors.map((instructor) => (
                            <CommandItem
                              key={instructor.id}
                              value={instructor.name}
                              onSelect={() => {
                                setMandatorySecondInstructor(instructor.id.toString());
                                setOpenMandatorySecondCombobox(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  mandatorySecondInstructor === instructor.id.toString()
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {instructor.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => {
                  setMandatoryReplacement({ open: false, departingInstructorId: null, departingInstructorName: '' });
                  setMandatoryReplacementInstructor('');
                  setMandatorySecondInstructor('');
                  setNeedsMandatorySecondInstructor(false);
                  setMandatoryWarning('');
                }}
                className="flex-1"
              >
                Abbrechen
              </Button>
              <Button 
                onClick={handleAddMandatoryReplacement} 
                disabled={!mandatoryReplacementInstructor || (needsMandatorySecondInstructor && !mandatorySecondInstructor)}
                className="flex-1"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Ersatz bestätigen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Flugschüler nachträglich hinzufügen */}
      <Dialog open={editStudentDialog.open} onOpenChange={(open) => {
        if (!open) {
          setEditStudentDialog({ open: false, pilotId: null, pilotName: '' });
          setEditStudentType('mitglied');
          setEditSelectedStudentMember('');
          setEditGuestStudentName('');
          setEditGuestStudentEmail('');
          setEditGuestStudentPhone('');
        }
      }}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-2xl">Flugschüler hinzufügen</DialogTitle>
            <DialogDescription>
              Füge einen Flugschüler zu <strong>{editStudentDialog.pilotName}</strong> hinzu.
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto flex-1 -mx-6 px-6">
            <div className="space-y-4">
              <Tabs value={editStudentType} onValueChange={(v) => setEditStudentType(v as 'mitglied' | 'gast')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="mitglied" className="gap-2">
                    <Users className="h-4 w-4" />
                    Mitglied
                  </TabsTrigger>
                  <TabsTrigger value="gast" className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Gast
                  </TabsTrigger>
                </TabsList>
                
                {/* Mitglied Tab */}
                <TabsContent value="mitglied" className="mt-4">
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <div className="space-y-2">
                        <Label>Vereinsmitglied auswählen</Label>
                        <Popover open={editStudentMemberSearchOpen} onOpenChange={setEditStudentMemberSearchOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={editStudentMemberSearchOpen}
                              className="w-full justify-between h-12"
                            >
                              {editSelectedStudentMember
                                ? availableEditStudentMembers.find((member) => member.id.toString() === editSelectedStudentMember)?.name
                                : "Mitglied suchen..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[500px] p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Mitglied suchen..." />
                              <CommandList>
                                <CommandEmpty>Kein verfügbares Mitglied gefunden.</CommandEmpty>
                                <CommandGroup>
                                  {availableEditStudentMembers.map((member) => (
                                    <CommandItem
                                      key={member.id}
                                      value={member.name}
                                      onSelect={() => {
                                        setEditSelectedStudentMember(member.id.toString());
                                        setEditStudentMemberSearchOpen(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          editSelectedStudentMember === member.id.toString() ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {member.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                          {availableEditStudentMembers.length === 0 
                            ? 'Alle Mitglieder sind bereits als Pilot oder Flugschüler aktiv'
                            : 'Durchsuche die Mitgliederliste'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Gast Tab */}
                <TabsContent value="gast" className="mt-4">
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-guest-student-name">Name des Gastes</Label>
                        <Input
                          id="edit-guest-student-name"
                          type="text"
                          placeholder="Vor- und Nachname"
                          value={editGuestStudentName}
                          onChange={(e) => setEditGuestStudentName(e.target.value)}
                          className="h-12"
                        />
                      </div>
                      
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="edit-guest-student-email">E-Mail</Label>
                          <Input
                            id="edit-guest-student-email"
                            type="email"
                            placeholder="gast@beispiel.de"
                            value={editGuestStudentEmail}
                            onChange={(e) => setEditGuestStudentEmail(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="edit-guest-student-phone">Telefon</Label>
                          <Input
                            id="edit-guest-student-phone"
                            type="tel"
                            placeholder="0172 1234567"
                            value={editGuestStudentPhone}
                            onChange={(e) => setEditGuestStudentPhone(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                        Name und mindestens E-Mail oder Telefon erforderlich
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6 flex-shrink-0">
            <Button 
              variant="outline" 
              className="flex-1 h-12"
              onClick={() => setEditStudentDialog({ open: false, pilotId: null, pilotName: '' })}
            >
              Abbrechen
            </Button>
            <Button 
              className="flex-1 h-12 gap-2"
              onClick={handleAddEditStudent}
            >
              <Plus className="h-4 w-4" />
              Hinzufügen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
