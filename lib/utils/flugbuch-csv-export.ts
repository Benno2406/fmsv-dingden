import { FlugbuchEntry } from "../api/flugbuch.service";
import { Member } from "../api/users.service";

interface FlightSupervisor {
  user_id: number;
  name: string;
  start_time?: string;
  end_time?: string;
  incidents?: string;
}

interface ExportOptions {
  entries: FlugbuchEntry[];
  supervisors: Record<string, FlightSupervisor[]>;
  users: Member[];
  startDate: string;
  endDate: string;
  exportType: 'day' | 'month' | 'year' | 'range';
}

/**
 * Helper: Get user name by ID
 */
const getUserName = (userId: number, users: Member[]): string => {
  const user = users.find(u => u.id === userId);
  return user ? `${user.first_name} ${user.last_name}` : `User ${userId}`;
};

/**
 * Helper: Format duration
 */
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Convert data to CSV format
 */
export const exportFlugbuchToCSV = (options: ExportOptions): void => {
  const { entries, supervisors, users, startDate, endDate, exportType } = options;
  
  // Sort entries by date and time
  const sortedEntries = [...entries].sort((a, b) => {
    const dateCompare = a.flight_date.localeCompare(b.flight_date);
    if (dateCompare !== 0) return dateCompare;
    return (a.flight_time || '').localeCompare(b.flight_time || '');
  });
  
  // CSV Headers
  const headers = [
    'Datum',
    'Startzeit',
    'Endzeit',
    'Dauer (h:mm)',
    'Pilot/Lehrer',
    'Schüler',
    'Modell',
    'Typ',
    'Antrieb',
    'Flugtyp',
    'Fernsteuerung',
    'Notizen',
    'Vorfälle',
    'Gastflieger',
    'Zeugen',
    'Flugleiter',
    'FL-Dienstzeit',
    'FL-Vorfälle'
  ];
  
  // Build CSV rows
  const rows: string[][] = [headers];
  
  sortedEntries.forEach(entry => {
    // Determine pilot and student
    let pilot = '';
    let student = '';
    
    if (entry.instructor_id) {
      pilot = `${entry.instructor_first_name} ${entry.instructor_last_name}`;
      student = entry.user_id ? getUserName(entry.user_id, users) : '';
    } else if (entry.user_id) {
      pilot = getUserName(entry.user_id, users);
    } else if (entry.is_guest && entry.witnesses) {
      pilot = entry.witnesses;
    }
    
    // Get flight supervisors for this date
    const daySupervisors = supervisors[entry.flight_date] || [];
    const supervisorNames = daySupervisors.map(s => s.name).join('; ');
    const supervisorTimes = daySupervisors.map(s => {
      if (s.start_time && s.end_time) {
        return `${s.start_time}-${s.end_time}`;
      } else if (s.start_time) {
        return `ab ${s.start_time}`;
      }
      return '';
    }).filter(t => t).join('; ');
    const supervisorIncidents = daySupervisors
      .map(s => s.incidents)
      .filter(i => i)
      .join('; ');
    
    // Flight type translation
    const flightTypeMap: Record<string, string> = {
      training: 'Schulung',
      fun: 'Hobby',
      competition: 'Wettbewerb',
      test: 'Test',
      demonstration: 'Demo'
    };
    
    const row = [
      entry.flight_date,
      entry.flight_time || '',
      entry.end_time || '',
      formatDuration(entry.duration),
      pilot,
      student,
      entry.model_name || '',
      entry.model_type || '',
      entry.model_type || '', // Antrieb (same as Typ for now)
      flightTypeMap[entry.flight_type] || entry.flight_type,
      entry.rc_frequency || '',
      entry.notes || '',
      entry.issues || '',
      entry.is_guest ? 'Ja' : 'Nein',
      entry.witnesses || '',
      supervisorNames,
      supervisorTimes,
      supervisorIncidents
    ];
    
    rows.push(row);
  });
  
  // Convert to CSV string
  const csvContent = rows.map(row => 
    row.map(cell => {
      // Escape quotes and wrap in quotes if contains comma, quote or newline
      const escaped = String(cell).replace(/"/g, '""');
      if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
        return `"${escaped}"`;
      }
      return escaped;
    }).join(',')
  ).join('\n');
  
  // Add BOM for Excel UTF-8 compatibility
  const BOM = '\ufeff';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Generate filename
  let filename = 'flugbuch_export';
  if (exportType === 'day') {
    filename = `flugbuch_${startDate}`;
  } else if (exportType === 'month') {
    const [year, month] = startDate.split('-');
    filename = `flugbuch_${year}_${month}`;
  } else if (exportType === 'year') {
    const year = startDate.split('-')[0];
    filename = `flugbuch_${year}`;
  } else if (exportType === 'range') {
    filename = `flugbuch_${startDate}_bis_${endDate}`;
  }
  filename += '.csv';
  
  // Download file
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};
