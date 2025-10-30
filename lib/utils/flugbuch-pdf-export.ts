import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FlugbuchEntry } from '../api/flugbuch.service';

interface FlightSupervisor {
  user_id: number;
  name: string;
  start_time?: string;
  end_time?: string;
  incidents?: string;
}

interface DayExportData {
  date: string;
  entries: FlugbuchEntry[];
  supervisors: FlightSupervisor[];
  users: Array<{ id: number; first_name: string; last_name: string }>;
}

/**
 * Design-Farben aus der Anwendung (RGB für jsPDF)
 * Konvertiert von OKLCH zu RGB basierend auf globals.css
 */
const COLORS = {
  // Basis-Farben
  primary: [3, 2, 19],                // #030213
  background: [255, 255, 255],        // #ffffff
  foreground: [37, 37, 37],           // #252525
  muted: [236, 236, 240],             // #ececf0
  mutedForeground: [113, 113, 130],   // #717182
  border: [230, 230, 230],            // #e6e6e6
  
  // Semantic Colors - Flugbuch
  flugleiter: [52, 73, 220],          // Blau - oklch(0.55 0.18 250)
  flugleiterLight: [242, 244, 254],   // Hellblau
  flugleiterText: [30, 43, 130],      // Dunkelblau für Text
  
  pilot: [34, 167, 204],              // Cyan - oklch(0.65 0.14 195)
  pilotLight: [240, 249, 252],        // Hellcyan
  pilotText: [20, 100, 122],          // Dunkelcyan für Text
  
  training: [147, 51, 234],           // Lila - oklch(0.55 0.2 290)
  trainingLight: [250, 245, 255],     // Helllila
  trainingText: [88, 30, 140],        // Dunkellila für Text
  
  guest: [249, 115, 22],              // Orange - oklch(0.65 0.18 50)
  guestLight: [255, 247, 237],        // Hellorange
  guestText: [149, 69, 13],           // Dunkelorange für Text
  
  member: [99, 102, 241],             // Indigo - oklch(0.5 0.17 265)
  memberLight: [238, 242, 255],       // Hellindigo
  memberText: [59, 62, 145],          // Dunkelindigo für Text
  
  warning: [245, 158, 11],            // Amber - oklch(0.75 0.15 85)
  warningLight: [254, 243, 199],      // Hellamber
  warningText: [147, 95, 7],          // Dunkelamber für Text
  
  statusActive: [34, 197, 94],        // Grün - oklch(0.6 0.17 145)
  statusActiveLight: [240, 253, 244], // Hellgrün
  statusActiveText: [20, 118, 56],    // Dunkelgrün für Text
  
  error: [212, 24, 61],               // Rot - #d4183d
  errorLight: [254, 242, 242],        // Hellrot
  errorText: [127, 14, 37],           // Dunkelrot für Text
  
  success: [34, 197, 94],             // Grün (wie statusActive)
  successLight: [240, 253, 244],      // Hellgrün
  successText: [20, 118, 56],         // Dunkelgrün für Text
};

/**
 * Helper: Get pilot name from entry
 */
function getPilotName(entry: FlugbuchEntry, users: DayExportData['users']): string {
  if (entry.is_guest) {
    return entry.witnesses || "Gastflieger";
  }
  
  if (entry.user_id) {
    const user = users.find(u => u.id === entry.user_id);
    if (user) {
      return `${user.first_name} ${user.last_name}`;
    }
  }
  
  return "Unbekannt";
}

/**
 * Helper: Get instructor name from entry
 */
function getInstructorName(entry: FlugbuchEntry): string {
  if (entry.instructor_id && entry.instructor_first_name && entry.instructor_last_name) {
    return `${entry.instructor_first_name} ${entry.instructor_last_name}`;
  }
  return "-";
}

/**
 * Helper: Format duration in minutes to hours and minutes
 */
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}min`;
  } else if (hours > 0) {
    return `${hours}h`;
  }
  return `${mins}min`;
}

/**
 * Helper: Calculate supervisor duration
 */
function calculateSupervisorDuration(supervisor: FlightSupervisor): string {
  if (!supervisor.start_time || !supervisor.end_time) {
    return supervisor.end_time ? "-" : "Im Dienst";
  }
  
  const [startHour, startMin] = supervisor.start_time.split(':').map(Number);
  const [endHour, endMin] = supervisor.end_time.split(':').map(Number);
  const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);
  
  return formatDuration(duration);
}

/**
 * Export a single flight day as PDF
 */
export async function exportFlightDayToPDF(data: DayExportData): Promise<void> {
  const { date, entries, supervisors, users } = data;
  
  // Create new PDF document (A4, portrait)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (2 * margin);
  
  // Format the date nicely
  const formattedDate = new Date(date).toLocaleDateString('de-DE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // ==========================================
  // HEADER
  // ==========================================
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  // Vereinsname
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Flugmodellsportverein Dingden', pageWidth / 2, 18, { align: 'center' });
  
  // Subtitle
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text('Flugtag-Bericht', pageWidth / 2, 30, { align: 'center' });
  
  // Date
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(formattedDate, pageWidth / 2, 42, { align: 'center' });
  
  let currentY = 60;
  
  // ==========================================
  // SECTION 1: FLUGLEITER (Card-Design)
  // ==========================================
  if (supervisors.length > 0) {
    // Card outer border
    const cardStartY = currentY;
    doc.setDrawColor(COLORS.flugleiter[0], COLORS.flugleiter[1], COLORS.flugleiter[2]);
    doc.setLineWidth(0.5);
    
    // Card Header
    doc.setFillColor(COLORS.flugleiterLight[0], COLORS.flugleiterLight[1], COLORS.flugleiterLight[2]);
    doc.roundedRect(margin, currentY, contentWidth, 10, 2, 2, 'F');
    
    doc.setTextColor(COLORS.flugleiterText[0], COLORS.flugleiterText[1], COLORS.flugleiterText[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('FLUGLEITER', margin + 3, currentY + 6.5);
    
    currentY += 10;
    
    // Prepare supervisor table data
    const supervisorData = supervisors.map(supervisor => {
      const timeRange = supervisor.start_time 
        ? `${supervisor.start_time}${supervisor.end_time ? ' - ' + supervisor.end_time : ' - laufend'}`
        : 'Keine Zeit erfasst';
      const duration = calculateSupervisorDuration(supervisor);
      const status = !supervisor.end_time && supervisor.start_time ? 'Aktiv' : 'Beendet';
      
      return [
        supervisor.name,
        timeRange,
        duration,
        status
      ];
    });
    
    autoTable(doc, {
      startY: currentY,
      head: [['Flugleiter', 'Dienstzeit', 'Dauer', 'Status']],
      body: supervisorData,
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.flugleiter,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'left',
        cellPadding: { top: 4, right: 3, bottom: 4, left: 3 }
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: { top: 3, right: 3, bottom: 3, left: 3 },
        textColor: COLORS.foreground,
        lineColor: COLORS.border,
        lineWidth: 0.1
      },
      alternateRowStyles: {
        fillColor: COLORS.flugleiterLight
      },
      columnStyles: {
        0: { cellWidth: 'auto', fontStyle: 'bold', textColor: COLORS.flugleiterText },
        1: { cellWidth: 38 },
        2: { cellWidth: 24 },
        3: { cellWidth: 24, halign: 'center' }
      },
      margin: { left: margin, right: margin }
    });
    
    // Card outer border
    const cardEndY = (doc as any).lastAutoTable.finalY;
    doc.setDrawColor(COLORS.flugleiter[0], COLORS.flugleiter[1], COLORS.flugleiter[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, cardStartY, contentWidth, cardEndY - cardStartY, 2, 2, 'S');
    
    currentY = cardEndY + 10;
  }
  
  // ==========================================
  // SECTION 2: PILOTEN (Card-Design)
  // ==========================================
  
  // Card outer border start
  const pilotenCardStartY = currentY;
  
  // Card Header
  doc.setFillColor(COLORS.pilotLight[0], COLORS.pilotLight[1], COLORS.pilotLight[2]);
  doc.roundedRect(margin, currentY, contentWidth, 10, 2, 2, 'F');
  
  doc.setTextColor(COLORS.pilotText[0], COLORS.pilotText[1], COLORS.pilotText[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PILOTEN', margin + 3, currentY + 6.5);
  
  currentY += 10;
  
  if (entries.length === 0) {
    // No entries message
    doc.setFillColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
    doc.roundedRect(margin + 2, currentY, contentWidth - 4, 16, 2, 2, 'F');
    
    doc.setTextColor(COLORS.mutedForeground[0], COLORS.mutedForeground[1], COLORS.mutedForeground[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    doc.text('An diesem Tag wurde kein Flugbetrieb durchgeführt.', pageWidth / 2, currentY + 9, { align: 'center' });
    
    currentY += 16;
    
    // Card outer border for empty state
    doc.setDrawColor(COLORS.pilot[0], COLORS.pilot[1], COLORS.pilot[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, pilotenCardStartY, contentWidth, currentY - pilotenCardStartY, 2, 2, 'S');
    
    currentY += 10;
  } else {
    
    // Prepare pilot data with new structure
    // Spalten: Pilot | Zeit | Dauer | Typ | Antrieb | Fernsteuerung | Status
    const pilotData: any[] = [];
    
    entries.forEach(entry => {
      const pilot = getPilotName(entry, users);
      const timeRange = `${entry.flight_time}${entry.end_time ? ' - ' + entry.end_time : ' - aktiv'}`;
      const duration = entry.duration && entry.end_time ? formatDuration(entry.duration) : '-';
      const type = entry.is_guest ? 'Gastflieger' : 'Mitglied';
      const antrieb = entry.model_type || '-';
      const fernsteuerung = entry.model_name || '-';
      const status = !entry.end_time ? 'Aktiv' : 'Beendet';
      
      // Wenn es ein Schulungsflug ist, zeige Fluglehrer
      if (entry.flight_type === 'training' && entry.instructor_first_name && entry.instructor_last_name) {
        const instructor = `${entry.instructor_first_name} ${entry.instructor_last_name}`;
        
        // Fluglehrer-Zeile
        pilotData.push({
          data: [instructor, timeRange, duration, 'Mitglied', antrieb, fernsteuerung, status],
          isInstructor: true
        });
        
        // Schüler-Zeile direkt darunter
        pilotData.push({
          data: [`    ${pilot}`, timeRange, duration, 'Mitglied', antrieb, fernsteuerung, status],
          isStudent: true
        });
      } else {
        // Normale Zeile
        pilotData.push({
          data: [pilot, timeRange, duration, type, antrieb, fernsteuerung, status],
          isInstructor: false,
          isStudent: false
        });
      }
    });
    
    autoTable(doc, {
      startY: currentY,
      head: [['Pilot', 'Zeit', 'Dauer', 'Typ', 'Antrieb', 'Fernsteuerung', 'Status']],
      body: pilotData.map(row => row.data),
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.pilot,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'left',
        cellPadding: { top: 3.5, right: 2.5, bottom: 3.5, left: 2.5 }
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: { top: 3, right: 2.5, bottom: 3, left: 2.5 },
        textColor: COLORS.foreground,
        lineColor: COLORS.border,
        lineWidth: 0.1
      },
      alternateRowStyles: {
        fillColor: COLORS.pilotLight
      },
      columnStyles: {
        0: { cellWidth: 'auto' },  // Pilot
        1: { cellWidth: 28 },  // Zeit
        2: { cellWidth: 18 },  // Dauer
        3: { cellWidth: 24 },  // Typ
        4: { cellWidth: 26 },  // Antrieb
        5: { cellWidth: 30 },  // Fernsteuerung
        6: { cellWidth: 22, halign: 'center' }  // Status
      },
      didParseCell: function(data) {
        // Styling für Fluglehrer-Zeilen
        if (data.row.index < pilotData.length && pilotData[data.row.index].isInstructor) {
          data.cell.styles.textColor = COLORS.trainingText;
          if (data.column.index === 0) {
            data.cell.styles.fontStyle = 'bold';
          }
        }
        // Styling für Schüler-Zeilen
        else if (data.row.index < pilotData.length && pilotData[data.row.index].isStudent) {
          data.cell.styles.textColor = COLORS.foreground;
          if (data.column.index === 0) {
            data.cell.styles.fontStyle = 'italic';
          }
        }
        // Normale Zeilen
        else {
          if (data.column.index === 0) {
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
      margin: { left: margin, right: margin }
    });
    
    currentY = (doc as any).lastAutoTable.finalY;
    
    // Card outer border for Piloten section
    doc.setDrawColor(COLORS.pilot[0], COLORS.pilot[1], COLORS.pilot[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, pilotenCardStartY, contentWidth, currentY - pilotenCardStartY, 2, 2, 'S');
    
    currentY += 10;
  }
  
  // ==========================================
  // SECTION 3: VORFÄLLE (Card-Design)
  // ==========================================
  const entriesWithIssues = entries.filter(e => e.issues);
  
  if (entriesWithIssues.length > 0) {
    // Check if we need a new page
    if (currentY > pageHeight - 80) {
      doc.addPage();
      currentY = 20;
    }
    
    // Card start
    const issuesCardStartY = currentY;
    
    // Card Header
    doc.setFillColor(COLORS.warningLight[0], COLORS.warningLight[1], COLORS.warningLight[2]);
    doc.roundedRect(margin, currentY, contentWidth, 10, 2, 2, 'F');
    
    doc.setTextColor(COLORS.warningText[0], COLORS.warningText[1], COLORS.warningText[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('VORFÄLLE', margin + 3, currentY + 6.5);
    
    currentY += 14;
    
    entriesWithIssues.forEach(entry => {
      const pilot = getPilotName(entry, users);
      
      // Check if we need a new page
      if (currentY > pageHeight - 35) {
        doc.addPage();
        currentY = 20;
      }
      
      // Issue box
      const issueLines = doc.splitTextToSize(entry.issues, contentWidth - 12);
      const boxHeight = 10 + (issueLines.length * 4.5);
      
      doc.setFillColor(COLORS.errorLight[0], COLORS.errorLight[1], COLORS.errorLight[2]);
      doc.roundedRect(margin + 2, currentY, contentWidth - 4, boxHeight, 2, 2, 'F');
      
      doc.setDrawColor(COLORS.error[0], COLORS.error[1], COLORS.error[2]);
      doc.setLineWidth(0.8);
      doc.roundedRect(margin + 2, currentY, contentWidth - 4, boxHeight, 2, 2, 'S');
      
      // Header
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(COLORS.error[0], COLORS.error[1], COLORS.error[2]);
      doc.text(`VORFALL - ${pilot} (${entry.flight_time})`, margin + 5, currentY + 5.5);
      
      // Issue text
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(COLORS.foreground[0], COLORS.foreground[1], COLORS.foreground[2]);
      doc.text(issueLines, margin + 5, currentY + 10);
      
      currentY += boxHeight + 4;
    });
    
    // Card outer border for Issues section
    doc.setDrawColor(COLORS.warning[0], COLORS.warning[1], COLORS.warning[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, issuesCardStartY, contentWidth, currentY - issuesCardStartY, 2, 2, 'S');
    
    currentY += 10;
  }
  
  // ==========================================
  // FOOTER (Alle Seiten)
  // ==========================================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);
    
    // Footer text
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.mutedForeground[0], COLORS.mutedForeground[1], COLORS.mutedForeground[2]);
    
    const footerText = `Erstellt am ${new Date().toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    })} um ${new Date().toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })} Uhr`;
    doc.text(footerText, margin, pageHeight - 12);
    
    const pageText = `Seite ${i} von ${totalPages}`;
    doc.text(pageText, pageWidth - margin, pageHeight - 12, { align: 'right' });
    
    // Watermark center
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.text('Flugmodellsportverein Dingden e.V.', pageWidth / 2, pageHeight - 12, { align: 'center' });
  }
  
  // Save the PDF
  const fileName = `Flugtag_${date}.pdf`;
  doc.save(fileName);
}

/**
 * Export multiple days/range to PDF (Summary format)
 */
interface RangeExportData {
  startDate: string;
  endDate: string;
  entries: FlugbuchEntry[];
  supervisors: Record<string, FlightSupervisor[]>;
  users: Array<{ id: number; first_name: string; last_name: string }>;
  exportType: 'month' | 'year' | 'range';
}

export const exportFlugbuchRangeToPDF = (data: RangeExportData) => {
  const { startDate, endDate, entries, supervisors, users, exportType } = data;
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let currentY = 20;
  
  // Helper function: Get user name
  const getUserName = (userId: number): string => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.first_name} ${user.last_name}` : `User ${userId}`;
  };
  
  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  
  let titleText = 'Flugbuch-Export';
  if (exportType === 'month') {
    const [year, month] = startDate.split('-');
    const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 
                       'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    titleText = `Flugbuch ${monthNames[parseInt(month) - 1]} ${year}`;
  } else if (exportType === 'year') {
    const year = startDate.split('-')[0];
    titleText = `Flugbuch ${year}`;
  } else {
    titleText = `Flugbuch ${new Date(startDate).toLocaleDateString('de-DE')} - ${new Date(endDate).toLocaleDateString('de-DE')}`;
  }
  
  doc.text(titleText, pageWidth / 2, currentY, { align: 'center' });
  currentY += 15;
  
  // Statistics (reduced)
  const totalFlights = entries.length;
  const uniquePilots = new Set(entries.map(e => e.user_id).filter(id => id)).size;
  const uniqueDays = new Set(entries.map(e => e.flight_date)).size;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.mutedForeground[0], COLORS.mutedForeground[1], COLORS.mutedForeground[2]);
  
  const stats = [
    `Flugtage: ${uniqueDays}`,
    `Einträge: ${totalFlights}`,
    `Piloten: ${uniquePilots}`
  ];
  
  doc.text(stats.join('  •  '), pageWidth / 2, currentY, { align: 'center' });
  currentY += 12;
  
  // Helper: Get member type
  const getMemberType = (entry: FlugbuchEntry): string => {
    if (entry.is_guest) return 'Gast';
    if (entry.instructor_id) return 'Schulung';
    return 'Mitglied';
  };
  
  // Group entries by date
  const entriesByDate = entries.reduce((acc, entry) => {
    if (!acc[entry.flight_date]) {
      acc[entry.flight_date] = [];
    }
    acc[entry.flight_date].push(entry);
    return acc;
  }, {} as Record<string, FlugbuchEntry[]>);
  
  // Sort dates
  const sortedDates = Object.keys(entriesByDate).sort();
  
  // Table data
  const tableData: any[] = [];
  
  sortedDates.forEach((date, dateIndex) => {
    const dayEntries = entriesByDate[date];
    const daySupervisors = supervisors[date] || [];
    const dayMinutes = dayEntries.reduce((sum, e) => sum + e.duration, 0);
    const dayHours = (dayMinutes / 60).toFixed(1);
    
    // Add spacing before each day (except first) - stronger separation
    if (dateIndex > 0) {
      tableData.push([
        {
          content: '',
          colSpan: 5,
          styles: {
            fillColor: [250, 250, 250],
            minCellHeight: 6,
            lineWidth: { top: 0.3, right: 0, bottom: 0.3, left: 0 },
            lineColor: COLORS.border
          }
        }
      ]);
    }
    
    // Add date header row with stronger visual separation
    tableData.push([
      {
        content: new Date(date).toLocaleDateString('de-DE', { 
          weekday: 'long',
          day: '2-digit', 
          month: 'long', 
          year: 'numeric' 
        }),
        colSpan: 5,
        styles: { 
          fillColor: COLORS.primary,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 11,
          cellPadding: { top: 4, right: 4, bottom: 4, left: 4 }
        }
      }
    ]);
    
    // Add supervisor info if exists
    if (daySupervisors.length > 0) {
      const supervisorInfo = daySupervisors.map(s => {
        let info = s.name;
        if (s.start_time && s.end_time) {
          info += ` (${s.start_time}-${s.end_time})`;
        } else if (s.start_time) {
          info += ` (ab ${s.start_time})`;
        }
        return info;
      }).join(' • ');
      
      tableData.push([
        {
          content: supervisorInfo,
          colSpan: 5,
          styles: {
            fillColor: COLORS.flugleiterLight,
            textColor: COLORS.flugleiterText,
            fontSize: 8,
            fontStyle: 'italic',
            cellPadding: { top: 2, right: 3, bottom: 2, left: 3 }
          }
        }
      ]);
    }
    
    // Add flight entries
    dayEntries.forEach(entry => {
      const time = entry.flight_time && entry.end_time 
        ? `${entry.flight_time}-${entry.end_time}`
        : entry.flight_time || '-';
      
      const memberType = getMemberType(entry);
      const antrieb = entry.model_type || '-';
      const fernsteuerung = entry.rc_frequency || '-';
      
      // Determine row styling based on entry type
      let rowFillColor = [255, 255, 255]; // default white
      let rowTextColor = COLORS.foreground;
      
      if (entry.instructor_id) {
        // Training flight - use training light color
        rowFillColor = COLORS.trainingLight;
        rowTextColor = COLORS.trainingText;
      } else if (entry.is_guest) {
        // Guest flight - use guest light color
        rowFillColor = COLORS.guestLight;
        rowTextColor = COLORS.guestText;
      }
      
      if (entry.instructor_id) {
        // Schulung: Lehrer in erster Zeile
        const instructor = `${entry.instructor_first_name} ${entry.instructor_last_name}`;
        
        tableData.push([
          {
            content: instructor,
            styles: {
              fillColor: rowFillColor,
              textColor: rowTextColor
            }
          },
          {
            content: time,
            styles: {
              fillColor: rowFillColor,
              textColor: rowTextColor
            }
          },
          {
            content: '',  // Kein Mitgliedstyp bei Schulungen
            styles: {
              fillColor: rowFillColor,
              textColor: rowTextColor
            }
          },
          {
            content: antrieb,
            styles: {
              fillColor: rowFillColor,
              textColor: rowTextColor
            }
          },
          {
            content: fernsteuerung,
            styles: {
              fillColor: rowFillColor,
              textColor: rowTextColor
            }
          }
        ]);
        
        // Schüler in separater Zeile darunter (eingerückt)
        const student = entry.user_id ? getUserName(entry.user_id) : '';
        if (student) {
          tableData.push([
            {
              content: `     ${student}`,  // 5 Zeichen Einrückung
              styles: {
                fillColor: rowFillColor,
                textColor: rowTextColor,
                fontStyle: 'italic'
              }
            },
            {
              content: time,  // Gleiche Zeit wie Lehrer
              styles: {
                fillColor: rowFillColor,
                textColor: rowTextColor
              }
            },
            {
              content: '',  // Kein Mitgliedstyp
              styles: {
                fillColor: rowFillColor,
                textColor: rowTextColor
              }
            },
            {
              content: '',
              styles: {
                fillColor: rowFillColor,
                textColor: rowTextColor
              }
            },
            {
              content: '',
              styles: {
                fillColor: rowFillColor,
                textColor: rowTextColor
              }
            }
          ]);
        }
      } else {
        // Normal entry or guest
        let pilot = '';
        if (entry.user_id) {
          pilot = getUserName(entry.user_id);
        } else if (entry.is_guest && entry.witnesses) {
          pilot = entry.witnesses;
        }
        
        tableData.push([
          {
            content: pilot,
            styles: {
              fillColor: rowFillColor,
              textColor: rowTextColor
            }
          },
          {
            content: time,
            styles: {
              fillColor: rowFillColor,
              textColor: rowTextColor
            }
          },
          {
            content: memberType,
            styles: {
              fillColor: rowFillColor,
              textColor: rowTextColor
            }
          },
          {
            content: antrieb,
            styles: {
              fillColor: rowFillColor,
              textColor: rowTextColor
            }
          },
          {
            content: fernsteuerung,
            styles: {
              fillColor: rowFillColor,
              textColor: rowTextColor
            }
          }
        ]);
      }
    });
  });
  
  // Draw table
  autoTable(doc, {
    startY: currentY,
    head: [['Pilot', 'Zeit', 'Mitgliedstyp', 'Antrieb', 'Fernsteuerung']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.primary,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: { top: 3, right: 3, bottom: 3, left: 3 }
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: { top: 2, right: 3, bottom: 2, left: 3 },
      textColor: COLORS.foreground,
      lineColor: COLORS.border,
      lineWidth: 0.1
    },
    columnStyles: {
      0: { cellWidth: 50 },      // Pilot
      1: { cellWidth: 28 },      // Zeit
      2: { cellWidth: 28 },      // Mitgliedstyp
      3: { cellWidth: 24 },      // Antrieb
      4: { cellWidth: 'auto' }   // Fernsteuerung
    },
    margin: { left: margin, right: margin },
    didParseCell: function(data) {
      // Custom styling handled by colSpan rows
    }
  });
  
  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);
    
    // Footer text
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.mutedForeground[0], COLORS.mutedForeground[1], COLORS.mutedForeground[2]);
    
    const footerText = `Erstellt am ${new Date().toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    })} um ${new Date().toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })} Uhr`;
    doc.text(footerText, margin, pageHeight - 12);
    
    const pageText = `Seite ${i} von ${totalPages}`;
    doc.text(pageText, pageWidth - margin, pageHeight - 12, { align: 'right' });
    
    // Watermark
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.text('Flugmodellsportverein Dingden e.V.', pageWidth / 2, pageHeight - 12, { align: 'center' });
  }
  
  // Save
  let fileName = 'flugbuch_export';
  if (exportType === 'month') {
    const [year, month] = startDate.split('-');
    fileName = `Flugbuch_${year}_${month}`;
  } else if (exportType === 'year') {
    const year = startDate.split('-')[0];
    fileName = `Flugbuch_${year}`;
  } else {
    fileName = `Flugbuch_${startDate}_bis_${endDate}`;
  }
  fileName += '.pdf';
  
  doc.save(fileName);
}
