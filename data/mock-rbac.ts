/**
 * Mock-Daten für RBAC-System Testing
 * Kann in Figma verwendet werden, um das Rollen-System zu testen
 */

import type { Permission, PermissionCategory } from '../types/permissions';

export interface MockPermission {
  id: string;
  name: Permission | string;
  display_name: string;
  description: string;
  category: PermissionCategory | string;
  is_system_permission: boolean;
}

export interface MockRole {
  id: string;
  name: string;
  display_name: string;
  description: string;
  priority: number;
  upload_limit_mb: number;
  is_system_role: boolean;
  color: string;
  permissions: string[];
  user_count?: number;
  permission_count?: number;
}

export interface MockUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_admin: boolean;
  is_member: boolean;
  is_active: boolean;
  roles: string[];
  avatar_url?: string;
}

// ============================================
// MOCK PERMISSIONS
// ============================================

export const mockPermissions: MockPermission[] = [
  // Artikel & Content
  { id: '1', name: 'articles.view', display_name: 'Artikel ansehen', description: 'Kann interne Artikel ansehen', category: 'articles', is_system_permission: true },
  { id: '2', name: 'articles.create', display_name: 'Artikel erstellen', description: 'Kann neue Artikel erstellen', category: 'articles', is_system_permission: true },
  { id: '3', name: 'articles.edit.own', display_name: 'Eigene Artikel bearbeiten', description: 'Kann eigene Artikel bearbeiten', category: 'articles', is_system_permission: true },
  { id: '4', name: 'articles.edit.all', display_name: 'Alle Artikel bearbeiten', description: 'Kann alle Artikel bearbeiten', category: 'articles', is_system_permission: true },
  { id: '5', name: 'articles.delete', display_name: 'Artikel löschen', description: 'Kann Artikel löschen', category: 'articles', is_system_permission: true },
  { id: '6', name: 'articles.publish', display_name: 'Artikel veröffentlichen', description: 'Kann Artikel veröffentlichen', category: 'articles', is_system_permission: true },
  { id: '7', name: 'articles.moderate', display_name: 'Artikel moderieren', description: 'Kann Artikel vor Veröffentlichung prüfen', category: 'articles', is_system_permission: false },
  { id: '8', name: 'articles.seo.edit', display_name: 'SEO bearbeiten', description: 'Kann SEO-Einstellungen bearbeiten', category: 'articles', is_system_permission: false },

  // Mitgliederverwaltung
  { id: '11', name: 'members.view', display_name: 'Mitglieder ansehen', description: 'Kann Mitgliederliste ansehen', category: 'members', is_system_permission: true },
  { id: '12', name: 'members.view.details', display_name: 'Mitgliederdetails ansehen', description: 'Kann Details aller Mitglieder ansehen', category: 'members', is_system_permission: true },
  { id: '13', name: 'members.edit', display_name: 'Mitglieder bearbeiten', description: 'Kann Mitgliederdaten bearbeiten', category: 'members', is_system_permission: true },
  { id: '14', name: 'members.delete', display_name: 'Mitglieder löschen', description: 'Kann Mitglieder löschen', category: 'members', is_system_permission: true },
  { id: '15', name: 'members.roles.manage', display_name: 'Rollen verwalten', description: 'Kann Rollen von Mitgliedern verwalten', category: 'members', is_system_permission: true },
  { id: '16', name: 'members.export', display_name: 'Mitglieder exportieren', description: 'Kann Mitgliederliste exportieren', category: 'members', is_system_permission: false },
  { id: '17', name: 'members.certificates.view', display_name: 'Kenntnisnachweise ansehen', description: 'Kann Kenntnisnachweise ansehen', category: 'members', is_system_permission: false },

  // Flugbuch
  { id: '21', name: 'flugbuch.view', display_name: 'Flugbuch ansehen', description: 'Kann Flugbucheinträge ansehen', category: 'flugbuch', is_system_permission: true },
  { id: '22', name: 'flugbuch.create', display_name: 'Flugbuch erstellen', description: 'Kann Flugbucheinträge erstellen', category: 'flugbuch', is_system_permission: true },
  { id: '23', name: 'flugbuch.edit.own', display_name: 'Eigene Einträge bearbeiten', description: 'Kann eigene Flugbucheinträge bearbeiten', category: 'flugbuch', is_system_permission: true },
  { id: '24', name: 'flugbuch.edit.all', display_name: 'Alle Einträge bearbeiten', description: 'Kann alle Flugbucheinträge bearbeiten', category: 'flugbuch', is_system_permission: true },
  { id: '25', name: 'flugbuch.delete', display_name: 'Einträge löschen', description: 'Kann Flugbucheinträge löschen', category: 'flugbuch', is_system_permission: true },
  { id: '26', name: 'flugbuch.export', display_name: 'Flugbuch exportieren', description: 'Kann Flugbuch exportieren', category: 'flugbuch', is_system_permission: true },
  { id: '27', name: 'flugbuch.statistics', display_name: 'Statistiken ansehen', description: 'Kann Flugstatistiken ansehen', category: 'flugbuch', is_system_permission: false },
  { id: '28', name: 'flugbuch.incidents.view', display_name: 'Vorfälle ansehen', description: 'Kann Vorfallberichte ansehen', category: 'flugbuch', is_system_permission: false },

  // Termine & Events
  { id: '31', name: 'events.view', display_name: 'Termine ansehen', description: 'Kann interne Termine ansehen', category: 'events', is_system_permission: true },
  { id: '32', name: 'events.create', display_name: 'Termine erstellen', description: 'Kann neue Termine erstellen', category: 'events', is_system_permission: true },
  { id: '33', name: 'events.edit', display_name: 'Termine bearbeiten', description: 'Kann Termine bearbeiten', category: 'events', is_system_permission: true },
  { id: '34', name: 'events.delete', display_name: 'Termine löschen', description: 'Kann Termine löschen', category: 'events', is_system_permission: true },
  { id: '35', name: 'events.participants.view', display_name: 'Teilnehmer ansehen', description: 'Kann Teilnehmerliste ansehen', category: 'events', is_system_permission: false },

  // Bilder & Galerien
  { id: '41', name: 'images.view', display_name: 'Bilder ansehen', description: 'Kann interne Bilder ansehen', category: 'images', is_system_permission: true },
  { id: '42', name: 'images.upload', display_name: 'Bilder hochladen', description: 'Kann Bilder hochladen', category: 'images', is_system_permission: true },
  { id: '43', name: 'images.delete.own', display_name: 'Eigene Bilder löschen', description: 'Kann eigene Bilder löschen', category: 'images', is_system_permission: true },
  { id: '44', name: 'images.delete.all', display_name: 'Alle Bilder löschen', description: 'Kann alle Bilder löschen', category: 'images', is_system_permission: true },
  { id: '45', name: 'images.galleries.manage', display_name: 'Galerien verwalten', description: 'Kann Galerien erstellen und verwalten', category: 'images', is_system_permission: true },

  // Dokumente & Protokolle
  { id: '51', name: 'documents.view', display_name: 'Dokumente ansehen', description: 'Kann interne Dokumente ansehen', category: 'documents', is_system_permission: true },
  { id: '52', name: 'documents.upload', display_name: 'Dokumente hochladen', description: 'Kann Dokumente hochladen', category: 'documents', is_system_permission: true },
  { id: '53', name: 'documents.delete', display_name: 'Dokumente löschen', description: 'Kann Dokumente löschen', category: 'documents', is_system_permission: true },
  { id: '54', name: 'protocols.view', display_name: 'Protokolle ansehen', description: 'Kann Protokolle ansehen', category: 'documents', is_system_permission: true },
  { id: '55', name: 'protocols.create', display_name: 'Protokolle erstellen', description: 'Kann Protokolle erstellen', category: 'documents', is_system_permission: true },
  { id: '56', name: 'protocols.edit', display_name: 'Protokolle bearbeiten', description: 'Kann Protokolle bearbeiten', category: 'documents', is_system_permission: true },

  // Benachrichtigungen
  { id: '61', name: 'notifications.send.own', display_name: 'Benachrichtigungen senden', description: 'Kann Benachrichtigungen an einzelne Mitglieder senden', category: 'notifications', is_system_permission: true },
  { id: '62', name: 'notifications.send.all', display_name: 'Massenbenachrichtigungen', description: 'Kann Benachrichtigungen an alle Mitglieder senden', category: 'notifications', is_system_permission: true },

  // System & Administration
  { id: '71', name: 'system.settings', display_name: 'Systemeinstellungen', description: 'Kann Systemeinstellungen ändern', category: 'system', is_system_permission: true },
  { id: '72', name: 'system.database', display_name: 'Datenbankzugriff', description: 'Kann auf die Datenbankverwaltung zugreifen', category: 'system', is_system_permission: true },
  { id: '73', name: 'system.audit.view', display_name: 'Audit-Log ansehen', description: 'Kann Audit-Logs ansehen', category: 'system', is_system_permission: true },
  { id: '74', name: 'system.roles.manage', display_name: 'Rollen verwalten', description: 'Kann Rollen und Berechtigungen verwalten', category: 'system', is_system_permission: true },

  // Inventar
  { id: '81', name: 'inventory.view', display_name: 'Inventar ansehen', description: 'Kann Inventar ansehen', category: 'inventory', is_system_permission: false },
  { id: '82', name: 'inventory.add', display_name: 'Inventar hinzufügen', description: 'Kann Inventar hinzufügen', category: 'inventory', is_system_permission: false },
  { id: '83', name: 'inventory.edit', display_name: 'Inventar bearbeiten', description: 'Kann Inventar bearbeiten', category: 'inventory', is_system_permission: false },
  { id: '84', name: 'inventory.maintenance.view', display_name: 'Wartung ansehen', description: 'Kann Wartungspläne ansehen', category: 'inventory', is_system_permission: false },
  { id: '85', name: 'inventory.maintenance.create', display_name: 'Wartung erstellen', description: 'Kann Wartungseinträge erstellen', category: 'inventory', is_system_permission: false },
  { id: '86', name: 'inventory.maintenance.complete', display_name: 'Wartung abschließen', description: 'Kann Wartungseinträge abschließen', category: 'inventory', is_system_permission: false },
  { id: '87', name: 'inventory.categories.manage', display_name: 'Kategorien verwalten', description: 'Kann Inventar-Kategorien verwalten', category: 'inventory', is_system_permission: false },

  // Training
  { id: '91', name: 'training.view', display_name: 'Schulungen ansehen', description: 'Kann Schulungen ansehen', category: 'training', is_system_permission: false },
  { id: '92', name: 'training.create', display_name: 'Schulungen erstellen', description: 'Kann Schulungen erstellen', category: 'training', is_system_permission: false },
  { id: '93', name: 'training.edit', display_name: 'Schulungen bearbeiten', description: 'Kann Schulungen bearbeiten', category: 'training', is_system_permission: false },
  { id: '94', name: 'training.participants.view', display_name: 'Teilnehmer ansehen', description: 'Kann Teilnehmerlisten ansehen', category: 'training', is_system_permission: false },
  { id: '95', name: 'training.participants.manage', display_name: 'Teilnehmer verwalten', description: 'Kann Teilnehmer verwalten', category: 'training', is_system_permission: false },
  
  // Erweiterte Artikel-Rechte
  { id: '101', name: 'articles.categories.manage', display_name: 'Artikel-Kategorien verwalten', description: 'Kann Artikel-Kategorien erstellen und verwalten', category: 'articles', is_system_permission: false },
  { id: '102', name: 'articles.schedule', display_name: 'Artikel planen', description: 'Kann zeitgesteuerte Veröffentlichung planen', category: 'articles', is_system_permission: false },
  
  // Erweiterte Event-Rechte
  { id: '111', name: 'events.publish', display_name: 'Termine veröffentlichen', description: 'Kann Termine veröffentlichen', category: 'events', is_system_permission: false },
  { id: '112', name: 'events.participants.manage', display_name: 'Teilnehmer verwalten', description: 'Kann Event-Teilnehmer verwalten', category: 'events', is_system_permission: false },
  { id: '113', name: 'events.export', display_name: 'Termine exportieren', description: 'Kann Termine exportieren (iCal)', category: 'events', is_system_permission: false },
  { id: '114', name: 'events.categories.manage', display_name: 'Event-Kategorien verwalten', description: 'Kann Event-Kategorien verwalten', category: 'events', is_system_permission: false },
  
  // Erweiterte Bilder-Rechte
  { id: '121', name: 'images.edit', display_name: 'Bilder bearbeiten', description: 'Kann Bilder bearbeiten (Rotation, Zuschnitt)', category: 'images', is_system_permission: false },
  { id: '122', name: 'images.moderate', display_name: 'Bilder moderieren', description: 'Kann hochgeladene Bilder prüfen und freigeben', category: 'images', is_system_permission: false },
  { id: '123', name: 'images.download.bulk', display_name: 'Massendownload', description: 'Kann mehrere Bilder gleichzeitig herunterladen', category: 'images', is_system_permission: false },
  { id: '124', name: 'images.watermark', display_name: 'Wasserzeichen hinzufügen', description: 'Kann Wasserzeichen zu Bildern hinzufügen', category: 'images', is_system_permission: false },
  { id: '125', name: 'images.metadata.edit', display_name: 'EXIF-Daten bearbeiten', description: 'Kann Bild-Metadaten bearbeiten', category: 'images', is_system_permission: false },
  { id: '126', name: 'images.albums.create', display_name: 'Alben erstellen', description: 'Kann Fotoalben erstellen', category: 'images', is_system_permission: false },
  
  // Erweiterte Dokument-Rechte
  { id: '131', name: 'documents.edit', display_name: 'Dokumente bearbeiten', description: 'Kann Dokument-Metadaten bearbeiten', category: 'documents', is_system_permission: false },
  { id: '132', name: 'documents.categories.manage', display_name: 'Dokumentkategorien verwalten', description: 'Kann Dokumentkategorien verwalten', category: 'documents', is_system_permission: false },
  { id: '133', name: 'documents.archive', display_name: 'Dokumente archivieren', description: 'Kann Dokumente archivieren', category: 'documents', is_system_permission: false },
  { id: '134', name: 'protocols.approve', display_name: 'Protokolle genehmigen', description: 'Kann Protokolle genehmigen', category: 'documents', is_system_permission: false },
  { id: '135', name: 'protocols.publish', display_name: 'Protokolle veröffentlichen', description: 'Kann Protokolle veröffentlichen', category: 'documents', is_system_permission: false },
  
  // Erweiterte Mitglieder-Rechte
  { id: '141', name: 'members.view.contact', display_name: 'Kontaktdaten ansehen', description: 'Kann Kontaktdaten aller Mitglieder ansehen', category: 'members', is_system_permission: false },
  { id: '142', name: 'members.certificates.edit', display_name: 'Kenntnisnachweise bearbeiten', description: 'Kann Kenntnisnachweise bearbeiten', category: 'members', is_system_permission: false },
  
  // Erweiterte Flugbuch-Rechte
  { id: '151', name: 'flugbuch.incidents.create', display_name: 'Vorfälle erstellen', description: 'Kann Vorfallberichte erstellen', category: 'flugbuch', is_system_permission: false },
  { id: '152', name: 'flugbuch.incidents.edit', display_name: 'Vorfälle bearbeiten', description: 'Kann Vorfallberichte bearbeiten', category: 'flugbuch', is_system_permission: false },
  
  // Erweiterte Benachrichtigungen
  { id: '161', name: 'notifications.send.groups', display_name: 'Gruppen-Benachrichtigungen', description: 'Kann Benachrichtigungen an Gruppen senden', category: 'notifications', is_system_permission: false },
  { id: '162', name: 'notifications.templates.manage', display_name: 'Vorlagen verwalten', description: 'Kann Benachrichtigungs-Vorlagen verwalten', category: 'notifications', is_system_permission: false },
  
  // Finanzen
  { id: '171', name: 'finance.view', display_name: 'Finanzen ansehen', description: 'Kann Finanzdaten ansehen', category: 'finance', is_system_permission: false },
  { id: '172', name: 'finance.transactions.create', display_name: 'Transaktionen erstellen', description: 'Kann Finanztransaktionen erstellen', category: 'finance', is_system_permission: false },
  { id: '173', name: 'finance.transactions.edit', display_name: 'Transaktionen bearbeiten', description: 'Kann Finanztransaktionen bearbeiten', category: 'finance', is_system_permission: false },
  { id: '174', name: 'finance.export', display_name: 'Finanzen exportieren', description: 'Kann Finanzdaten exportieren', category: 'finance', is_system_permission: false },
  { id: '175', name: 'finance.reports.view', display_name: 'Finanzberichte ansehen', description: 'Kann Finanzberichte ansehen', category: 'finance', is_system_permission: false },
  
  // Statistiken
  { id: '181', name: 'statistics.view', display_name: 'Statistiken ansehen', description: 'Kann Vereinsstatistiken ansehen', category: 'statistics', is_system_permission: false },
  { id: '182', name: 'statistics.export', display_name: 'Statistiken exportieren', description: 'Kann Statistiken exportieren', category: 'statistics', is_system_permission: false },
];

// ============================================
// MOCK ROLES
// ============================================

export const mockRoles: MockRole[] = [
  // ============================================
  // STANDARD SYSTEM-ROLLEN
  // ============================================
  {
    id: 'role-1',
    name: 'gast',
    display_name: 'Gast',
    description: 'Gastflieger oder Schnuppermitglied mit eingeschränkten Rechten',
    priority: 2,
    upload_limit_mb: 2,
    is_system_role: false,
    color: '#6B7280',
    permissions: ['articles.view', 'members.view', 'flugbuch.view', 'flugbuch.create', 'events.view', 'images.view', 'documents.view'],
    user_count: 3,
    permission_count: 7,
  },
  {
    id: 'role-2',
    name: 'mitglied',
    display_name: 'Mitglied',
    description: 'Standard-Vereinsmitglied mit Basis-Berechtigungen',
    priority: 5,
    upload_limit_mb: 5,
    is_system_role: true,
    color: '#6366F1',
    permissions: [
      'articles.view', 'members.view', 'flugbuch.view', 'flugbuch.create', 'flugbuch.edit.own',
      'events.view', 'images.view', 'images.upload', 'images.delete.own', 
      'documents.view', 'protocols.view'
    ],
    user_count: 45,
    permission_count: 11,
  },
  
  // ============================================
  // BEISPIEL-ROLLEN (aus example-roles.sql)
  // ============================================
  {
    id: 'role-3',
    name: 'ehrenmitglied',
    display_name: 'Ehrenmitglied',
    description: 'Ehrenmitglied mit erweiterten Leserechten und besonderen Privilegien',
    priority: 8,
    upload_limit_mb: 10,
    is_system_role: false,
    color: '#F59E0B',
    permissions: [
      'articles.view', 'members.view', 'members.view.details', 'flugbuch.view', 'flugbuch.create',
      'flugbuch.edit.own', 'flugbuch.statistics', 'events.view', 'images.view', 'images.upload',
      'images.delete.own', 'documents.view', 'protocols.view'
    ],
    user_count: 5,
    permission_count: 13,
  },
  {
    id: 'role-4',
    name: 'jugendwart',
    display_name: 'Jugendwart',
    description: 'Verantwortlich für Jugendarbeit und Nachwuchsförderung',
    priority: 10,
    upload_limit_mb: 10,
    is_system_role: true,
    color: '#8B5CF6',
    permissions: [
      'articles.view', 'articles.create', 'articles.edit.own', 'members.view', 'members.view.details',
      'flugbuch.view', 'flugbuch.create', 'flugbuch.edit.own', 'events.view', 'events.create',
      'events.edit', 'images.view', 'images.upload', 'images.delete.own', 'documents.view',
      'documents.upload', 'protocols.view', 'training.view', 'training.create', 'training.participants.manage'
    ],
    user_count: 2,
    permission_count: 20,
  },
  {
    id: 'role-5',
    name: 'modellbau_referent',
    display_name: 'Modellbau-Referent',
    description: 'Technischer Berater für Modellbau, Technik und Material',
    priority: 12,
    upload_limit_mb: 15,
    is_system_role: false,
    color: '#0EA5E9',
    permissions: [
      'articles.view', 'articles.create', 'articles.edit.own', 'members.view', 'flugbuch.view',
      'flugbuch.create', 'flugbuch.edit.own', 'events.view', 'images.view', 'images.upload',
      'images.delete.own', 'images.albums.create', 'images.galleries.manage', 'documents.view',
      'documents.upload', 'protocols.view', 'inventory.view', 'inventory.add', 'inventory.edit',
      'inventory.categories.manage'
    ],
    user_count: 3,
    permission_count: 20,
  },
  {
    id: 'role-6',
    name: 'vereinschronist',
    display_name: 'Vereinschronist',
    description: 'Verantwortlich für Vereinsgeschichte, Archiv und historische Dokumentation',
    priority: 13,
    upload_limit_mb: 25,
    is_system_role: false,
    color: '#92400E',
    permissions: [
      'articles.view', 'articles.create', 'articles.edit.own', 'articles.edit.all', 'members.view',
      'members.view.details', 'flugbuch.view', 'flugbuch.create', 'flugbuch.edit.own', 'events.view',
      'images.view', 'images.upload', 'images.delete.own', 'images.galleries.manage', 'images.albums.create',
      'images.metadata.edit', 'documents.view', 'documents.upload', 'documents.archive',
      'documents.categories.manage', 'protocols.view', 'protocols.create', 'protocols.edit'
    ],
    user_count: 1,
    permission_count: 22,
  },
  {
    id: 'role-7',
    name: 'fluglehrer',
    display_name: 'Fluglehrer',
    description: 'Fluglehrer mit Schulungsrechten und Ausbildungsberechtigung',
    priority: 15,
    upload_limit_mb: 10,
    is_system_role: true,
    color: '#8B5CF6',
    permissions: [
      'articles.view', 'members.view', 'members.view.details', 'members.certificates.view',
      'members.certificates.edit', 'flugbuch.view', 'flugbuch.create', 'flugbuch.edit.own',
      'flugbuch.edit.all', 'flugbuch.statistics', 'events.view', 'images.view', 'images.upload',
      'images.delete.own', 'documents.view', 'documents.upload', 'protocols.view', 'training.view',
      'training.create', 'training.edit', 'training.participants.view', 'training.participants.manage'
    ],
    user_count: 8,
    permission_count: 22,
  },
  {
    id: 'role-8',
    name: 'vereinsfotograf',
    display_name: 'Vereinsfotograf',
    description: 'Verantwortlich für Vereinsfotografie und Bildarchiv',
    priority: 15,
    upload_limit_mb: 100,
    is_system_role: false,
    color: '#10B981',
    permissions: [
      'articles.view', 'members.view', 'flugbuch.view', 'flugbuch.create', 'flugbuch.edit.own',
      'events.view', 'events.participants.view', 'images.view', 'images.upload', 'images.delete.own',
      'images.delete.all', 'images.galleries.manage', 'images.edit', 'images.moderate',
      'images.download.bulk', 'images.watermark', 'images.metadata.edit', 'images.albums.create',
      'documents.view', 'protocols.view'
    ],
    user_count: 2,
    permission_count: 20,
  },
  {
    id: 'role-9',
    name: 'platzwart',
    display_name: 'Platzwart',
    description: 'Verantwortlich für Flugplatzwartung, Infrastruktur und Inventar',
    priority: 18,
    upload_limit_mb: 15,
    is_system_role: false,
    color: '#059669',
    permissions: [
      'articles.view', 'members.view', 'flugbuch.view', 'flugbuch.create', 'flugbuch.edit.own',
      'flugbuch.incidents.view', 'flugbuch.incidents.create', 'events.view', 'images.view',
      'images.upload', 'images.delete.own', 'images.albums.create', 'documents.view',
      'documents.upload', 'protocols.view', 'inventory.view', 'inventory.add', 'inventory.edit',
      'inventory.maintenance.view', 'inventory.maintenance.create', 'inventory.maintenance.complete'
    ],
    user_count: 2,
    permission_count: 21,
  },
  {
    id: 'role-10',
    name: 'kassenwart',
    display_name: 'Kassenwart',
    description: 'Verantwortlich für Finanzverwaltung und Buchhaltung',
    priority: 20,
    upload_limit_mb: 30,
    is_system_role: true,
    color: '#8B5CF6',
    permissions: [
      'articles.view', 'members.view', 'members.view.details', 'members.view.contact',
      'members.export', 'flugbuch.view', 'flugbuch.create', 'flugbuch.edit.own', 'events.view',
      'images.view', 'images.upload', 'images.delete.own', 'documents.view', 'documents.upload',
      'protocols.view', 'protocols.create', 'protocols.edit', 'finance.view', 'finance.transactions.create',
      'finance.transactions.edit', 'finance.export', 'finance.reports.view'
    ],
    user_count: 2,
    permission_count: 21,
  },
  {
    id: 'role-11',
    name: 'schriftfuehrer',
    display_name: 'Schriftführer',
    description: 'Verantwortlich für Protokolle, Dokumentation und Vereinsunterlagen',
    priority: 22,
    upload_limit_mb: 20,
    is_system_role: false,
    color: '#8B5CF6',
    permissions: [
      'articles.view', 'articles.create', 'articles.edit.own', 'members.view', 'members.view.details',
      'members.export', 'flugbuch.view', 'flugbuch.create', 'flugbuch.edit.own', 'events.view',
      'images.view', 'images.upload', 'images.delete.own', 'documents.view', 'documents.upload',
      'documents.edit', 'documents.categories.manage', 'documents.archive', 'protocols.view',
      'protocols.create', 'protocols.edit', 'protocols.approve', 'protocols.publish'
    ],
    user_count: 1,
    permission_count: 23,
  },
  {
    id: 'role-12',
    name: 'pressewart',
    display_name: 'Pressewart',
    description: 'Verantwortlich für Öffentlichkeitsarbeit, Presseberichte und Social Media',
    priority: 25,
    upload_limit_mb: 40,
    is_system_role: false,
    color: '#DC2626',
    permissions: [
      'articles.view', 'articles.create', 'articles.edit.own', 'articles.edit.all', 'articles.publish',
      'articles.moderate', 'articles.categories.manage', 'articles.seo.edit', 'articles.schedule',
      'members.view', 'flugbuch.view', 'flugbuch.create', 'flugbuch.edit.own', 'events.view',
      'events.create', 'events.edit', 'images.view', 'images.upload', 'images.delete.own',
      'images.delete.all', 'images.galleries.manage', 'images.edit', 'images.moderate',
      'images.watermark', 'images.albums.create', 'documents.view', 'documents.upload', 'protocols.view'
    ],
    user_count: 2,
    permission_count: 28,
  },
  {
    id: 'role-13',
    name: 'eventmanager',
    display_name: 'Eventmanager',
    description: 'Verantwortlich für Organisation von Vereinsveranstaltungen und Events',
    priority: 28,
    upload_limit_mb: 30,
    is_system_role: false,
    color: '#EC4899',
    permissions: [
      'articles.view', 'articles.create', 'articles.edit.own', 'articles.publish', 'members.view',
      'members.view.details', 'members.view.contact', 'members.export', 'flugbuch.view',
      'flugbuch.create', 'flugbuch.edit.own', 'events.view', 'events.create', 'events.edit',
      'events.delete', 'events.publish', 'events.participants.view', 'events.participants.manage',
      'events.export', 'events.categories.manage', 'images.view', 'images.upload', 'images.delete.own',
      'images.galleries.manage', 'images.albums.create', 'documents.view', 'protocols.view',
      'notifications.send.all', 'notifications.send.groups', 'notifications.templates.manage'
    ],
    user_count: 2,
    permission_count: 30,
  },
  {
    id: 'role-14',
    name: 'sicherheitsbeauftragter',
    display_name: 'Sicherheitsbeauftragter',
    description: 'Verantwortlich für Flugsicherheit, Vorfalluntersuchung und Safety-Management',
    priority: 35,
    upload_limit_mb: 25,
    is_system_role: false,
    color: '#F59E0B',
    permissions: [
      'articles.view', 'articles.create', 'articles.edit.own', 'articles.publish', 'members.view',
      'members.view.details', 'members.certificates.view', 'members.certificates.edit', 'flugbuch.view',
      'flugbuch.create', 'flugbuch.edit.own', 'flugbuch.edit.all', 'flugbuch.export',
      'flugbuch.statistics', 'flugbuch.incidents.view', 'flugbuch.incidents.create',
      'flugbuch.incidents.edit', 'events.view', 'images.view', 'images.upload', 'images.delete.own',
      'documents.view', 'documents.upload', 'protocols.view', 'protocols.create', 'protocols.edit',
      'training.view', 'training.create', 'training.edit', 'training.participants.view',
      'training.participants.manage'
    ],
    user_count: 1,
    permission_count: 31,
  },
  
  // ============================================
  // VORSTAND & WEBMASTER
  // ============================================
  {
    id: 'role-15',
    name: 'vorstand',
    display_name: 'Vorstand',
    description: 'Vorstandsmitglied mit erweiterten Berechtigungen',
    priority: 50,
    upload_limit_mb: 30,
    is_system_role: true,
    color: '#3B82F6',
    permissions: [
      'articles.view', 'articles.create', 'articles.edit.own', 'articles.publish', 'members.view',
      'members.view.details', 'members.edit', 'members.export', 'flugbuch.view', 'flugbuch.create',
      'flugbuch.edit.own', 'flugbuch.edit.all', 'flugbuch.delete', 'flugbuch.export', 'flugbuch.statistics',
      'events.view', 'events.create', 'events.edit', 'events.delete', 'images.view', 'images.upload',
      'images.delete.own', 'images.delete.all', 'images.galleries.manage', 'documents.view',
      'documents.upload', 'documents.delete', 'protocols.view', 'protocols.create', 'protocols.edit',
      'notifications.send.own', 'notifications.send.all'
    ],
    user_count: 7,
    permission_count: 32,
  },
  {
    id: 'role-16',
    name: 'webmaster',
    display_name: 'Webmaster',
    description: 'Vollständige Systemrechte - höchste Zugriffsstufe',
    priority: 100,
    upload_limit_mb: 50,
    is_system_role: true,
    color: '#3B82F6',
    permissions: mockPermissions.map(p => p.name), // Alle Berechtigungen
    user_count: 1,
    permission_count: mockPermissions.length,
  },
];

// ============================================
// MOCK USERS
// ============================================

export const mockUsers: MockUser[] = [
  {
    id: 'user-1',
    email: 'admin@fmsv-dingden.de',
    first_name: 'Admin',
    last_name: 'User',
    is_admin: true,
    is_member: true,
    is_active: true,
    roles: ['webmaster'],
  },
  {
    id: 'user-2',
    email: 'max.mustermann@example.com',
    first_name: 'Max',
    last_name: 'Mustermann',
    is_admin: false,
    is_member: true,
    is_active: true,
    roles: ['vorstand', 'fluglehrer'],
  },
  {
    id: 'user-3',
    email: 'anna.schmidt@example.com',
    first_name: 'Anna',
    last_name: 'Schmidt',
    is_admin: false,
    is_member: true,
    is_active: true,
    roles: ['pressewart'],
  },
  {
    id: 'user-4',
    email: 'peter.mueller@example.com',
    first_name: 'Peter',
    last_name: 'Müller',
    is_admin: false,
    is_member: true,
    is_active: true,
    roles: ['mitglied', 'platzwart'],
  },
  {
    id: 'user-5',
    email: 'lisa.wagner@example.com',
    first_name: 'Lisa',
    last_name: 'Wagner',
    is_admin: false,
    is_member: true,
    is_active: true,
    roles: ['mitglied'],
  },
  {
    id: 'user-6',
    email: 'thomas.becker@example.com',
    first_name: 'Thomas',
    last_name: 'Becker',
    is_admin: false,
    is_member: true,
    is_active: true,
    roles: ['ehrenmitglied'],
  },
  {
    id: 'user-7',
    email: 'gast@example.com',
    first_name: 'Test',
    last_name: 'Gast',
    is_admin: false,
    is_member: false,
    is_active: true,
    roles: ['gast'],
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Gibt alle Berechtigungen einer Kategorie zurück
 */
export function getPermissionsByCategory(category: string): MockPermission[] {
  return mockPermissions.filter(p => p.category === category);
}

/**
 * Gibt alle Kategorien zurück
 */
export function getCategories(): string[] {
  return Array.from(new Set(mockPermissions.map(p => p.category)));
}

/**
 * Gibt eine Rolle anhand des Namens zurück
 */
export function getRoleByName(name: string): MockRole | undefined {
  return mockRoles.find(r => r.name === name);
}

/**
 * Gibt alle Berechtigungen eines Benutzers zurück
 */
export function getUserPermissions(user: MockUser): string[] {
  if (user.is_admin) {
    return mockPermissions.map(p => p.name);
  }

  const permissions = new Set<string>();
  
  user.roles.forEach(roleName => {
    const role = getRoleByName(roleName);
    if (role) {
      role.permissions.forEach(p => permissions.add(p));
    }
  });

  return Array.from(permissions);
}

/**
 * Prüft ob ein Benutzer eine Berechtigung hat
 */
export function userHasPermission(user: MockUser, permission: string): boolean {
  if (user.is_admin) return true;
  
  const userPermissions = getUserPermissions(user);
  return userPermissions.includes(permission);
}

/**
 * Gibt das höchste Upload-Limit eines Benutzers zurück
 */
export function getUserUploadLimit(user: MockUser): number {
  if (user.is_admin) return 50; // Webmaster default
  
  let maxLimit = 5; // Default für Mitglieder
  
  user.roles.forEach(roleName => {
    const role = getRoleByName(roleName);
    if (role && role.upload_limit_mb > maxLimit) {
      maxLimit = role.upload_limit_mb;
    }
  });

  return maxLimit;
}

/**
 * Gibt die höchste Priority eines Benutzers zurück
 */
export function getUserPriority(user: MockUser): number {
  if (user.is_admin) return 100;
  
  let maxPriority = 0;
  
  user.roles.forEach(roleName => {
    const role = getRoleByName(roleName);
    if (role && role.priority > maxPriority) {
      maxPriority = role.priority;
    }
  });

  return maxPriority;
}
