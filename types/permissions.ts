/**
 * RBAC Permissions Type Definitions
 * Auto-generiert basierend auf dem Datenbankschema
 * 
 * Diese Datei definiert alle verfügbaren Berechtigungen im System
 * als TypeScript-Typen für Type-Safety im Frontend.
 */

// ============================================
// BERECHTIGUNGS-KATEGORIEN
// ============================================

export type PermissionCategory = 
  | 'articles'
  | 'members'
  | 'flugbuch'
  | 'events'
  | 'images'
  | 'documents'
  | 'notifications'
  | 'system'
  | 'club'
  | 'finance'
  | 'training'
  | 'inventory'
  | 'statistics'
  | 'kiosk';

// ============================================
// KERN-BERECHTIGUNGEN (in Datenbank vorhanden)
// ============================================

export type CorePermission =
  // Artikel & Content
  | 'articles.view'
  | 'articles.create'
  | 'articles.edit.own'
  | 'articles.edit.all'
  | 'articles.delete'
  | 'articles.publish'
  
  // Mitgliederverwaltung
  | 'members.view'
  | 'members.view.details'
  | 'members.edit'
  | 'members.delete'
  | 'members.roles.manage'
  
  // Flugbuch
  | 'flugbuch.view'
  | 'flugbuch.create'
  | 'flugbuch.edit.own'
  | 'flugbuch.edit.all'
  | 'flugbuch.delete'
  | 'flugbuch.export'
  
  // Termine & Events
  | 'events.view'
  | 'events.create'
  | 'events.edit'
  | 'events.delete'
  
  // Bilder & Galerien
  | 'images.view'
  | 'images.upload'
  | 'images.delete.own'
  | 'images.delete.all'
  | 'images.galleries.manage'
  
  // Dokumente & Protokolle
  | 'documents.view'
  | 'documents.upload'
  | 'documents.delete'
  | 'protocols.view'
  | 'protocols.create'
  | 'protocols.edit'
  
  // Benachrichtigungen
  | 'notifications.send.own'
  | 'notifications.send.all'
  
  // System & Administration
  | 'system.settings'
  | 'system.database'
  | 'system.audit.view'
  | 'system.roles.manage';

// ============================================
// ERWEITERTE BERECHTIGUNGEN
// ============================================

export type ExtendedPermission =
  // Erweiterte Artikel
  | 'articles.moderate'
  | 'articles.categories.manage'
  | 'articles.comments.view'
  | 'articles.comments.moderate'
  | 'articles.seo.edit'
  | 'articles.schedule'
  
  // Erweiterte Mitglieder
  | 'members.create'
  | 'members.export'
  | 'members.import'
  | 'members.view.contact'
  | 'members.statistics'
  | 'members.certificates.view'
  | 'members.certificates.edit'
  | 'members.status.change'
  | 'members.merge'
  | 'members.history.view'
  
  // Erweiterte Flugbuch
  | 'flugbuch.statistics'
  | 'flugbuch.approve'
  | 'flugbuch.incidents.view'
  | 'flugbuch.incidents.create'
  | 'flugbuch.incidents.edit'
  | 'flugbuch.lock'
  | 'flugbuch.import'
  
  // Erweiterte Termine
  | 'events.publish'
  | 'events.participants.view'
  | 'events.participants.manage'
  | 'events.register'
  | 'events.export'
  | 'events.categories.manage'
  
  // Erweiterte Bilder
  | 'images.edit'
  | 'images.moderate'
  | 'images.download.bulk'
  | 'images.watermark'
  | 'images.metadata.edit'
  | 'images.albums.create'
  
  // Erweiterte Dokumente
  | 'documents.edit'
  | 'documents.categories.manage'
  | 'documents.archive'
  | 'documents.versions.view'
  | 'documents.share'
  | 'protocols.approve'
  | 'protocols.publish'
  | 'protocols.delete'
  
  // Erweiterte Benachrichtigungen
  | 'notifications.templates.manage'
  | 'notifications.scheduled.create'
  | 'notifications.scheduled.delete'
  | 'notifications.history.view'
  | 'notifications.send.groups'
  | 'notifications.send.roles'
  | 'notifications.sms.send'
  
  // Erweiterte System
  | 'system.backup.create'
  | 'system.backup.restore'
  | 'system.backup.download'
  | 'system.logs.view'
  | 'system.logs.delete'
  | 'system.maintenance.enable'
  | 'system.cache.clear'
  | 'system.updates.install'
  | 'system.users.impersonate'
  | 'system.email.settings'
  | 'system.security.settings'
  | 'system.integrations.manage'
  
  // Vereinsverwaltung
  | 'club.info.view'
  | 'club.info.edit'
  | 'club.departments.view'
  | 'club.departments.manage'
  | 'club.board.view'
  | 'club.board.edit'
  | 'club.history.view'
  | 'club.history.edit'
  
  // Finanzverwaltung
  | 'finance.view'
  | 'finance.transactions.create'
  | 'finance.transactions.edit'
  | 'finance.transactions.delete'
  | 'finance.reports.view'
  | 'finance.reports.create'
  | 'finance.budget.view'
  | 'finance.budget.edit'
  | 'finance.invoices.create'
  | 'finance.invoices.send'
  | 'finance.invoices.cancel'
  | 'finance.export'
  
  // Schulung & Training
  | 'training.view'
  | 'training.create'
  | 'training.edit'
  | 'training.delete'
  | 'training.participants.view'
  | 'training.participants.manage'
  | 'training.certificates.issue'
  | 'training.progress.view'
  | 'training.progress.edit'
  | 'training.materials.upload'
  | 'training.exams.create'
  | 'training.exams.grade'
  
  // Inventar & Ausrüstung
  | 'inventory.view'
  | 'inventory.add'
  | 'inventory.edit'
  | 'inventory.delete'
  | 'inventory.borrow'
  | 'inventory.lend.manage'
  | 'inventory.maintenance.view'
  | 'inventory.maintenance.create'
  | 'inventory.maintenance.complete'
  | 'inventory.categories.manage'
  
  // Statistiken & Berichte
  | 'statistics.view'
  | 'statistics.advanced'
  | 'statistics.export'
  | 'reports.create'
  | 'reports.schedule'
  | 'reports.delete'
  
  // Kiosk-Modus
  | 'kiosk.access'
  | 'kiosk.flugbuch.start'
  | 'kiosk.flugbuch.end'
  | 'kiosk.weather.view'
  | 'kiosk.manage'
  | 'kiosk.announcements.view'
  | 'kiosk.announcements.create';

// ============================================
// KOMBINIERTE BERECHTIGUNGEN
// ============================================

/**
 * Alle verfügbaren Berechtigungen im System
 */
export type Permission = CorePermission | ExtendedPermission;

// ============================================
// BERECHTIGUNGS-GRUPPEN
// ============================================

/**
 * Gruppierte Berechtigungen nach Kategorie für einfachere Verwaltung
 */
export const PermissionGroups = {
  articles: [
    'articles.view',
    'articles.create',
    'articles.edit.own',
    'articles.edit.all',
    'articles.delete',
    'articles.publish',
    'articles.moderate',
    'articles.categories.manage',
    'articles.comments.view',
    'articles.comments.moderate',
    'articles.seo.edit',
    'articles.schedule',
  ] as const,
  
  members: [
    'members.view',
    'members.view.details',
    'members.edit',
    'members.delete',
    'members.roles.manage',
    'members.create',
    'members.export',
    'members.import',
    'members.view.contact',
    'members.statistics',
    'members.certificates.view',
    'members.certificates.edit',
    'members.status.change',
    'members.merge',
    'members.history.view',
  ] as const,
  
  flugbuch: [
    'flugbuch.view',
    'flugbuch.create',
    'flugbuch.edit.own',
    'flugbuch.edit.all',
    'flugbuch.delete',
    'flugbuch.export',
    'flugbuch.statistics',
    'flugbuch.approve',
    'flugbuch.incidents.view',
    'flugbuch.incidents.create',
    'flugbuch.incidents.edit',
    'flugbuch.lock',
    'flugbuch.import',
  ] as const,
  
  events: [
    'events.view',
    'events.create',
    'events.edit',
    'events.delete',
    'events.publish',
    'events.participants.view',
    'events.participants.manage',
    'events.register',
    'events.export',
    'events.categories.manage',
  ] as const,
  
  images: [
    'images.view',
    'images.upload',
    'images.delete.own',
    'images.delete.all',
    'images.galleries.manage',
    'images.edit',
    'images.moderate',
    'images.download.bulk',
    'images.watermark',
    'images.metadata.edit',
    'images.albums.create',
  ] as const,
  
  documents: [
    'documents.view',
    'documents.upload',
    'documents.delete',
    'protocols.view',
    'protocols.create',
    'protocols.edit',
    'documents.edit',
    'documents.categories.manage',
    'documents.archive',
    'documents.versions.view',
    'documents.share',
    'protocols.approve',
    'protocols.publish',
    'protocols.delete',
  ] as const,
  
  notifications: [
    'notifications.send.own',
    'notifications.send.all',
    'notifications.templates.manage',
    'notifications.scheduled.create',
    'notifications.scheduled.delete',
    'notifications.history.view',
    'notifications.send.groups',
    'notifications.send.roles',
    'notifications.sms.send',
  ] as const,
  
  system: [
    'system.settings',
    'system.database',
    'system.audit.view',
    'system.roles.manage',
    'system.backup.create',
    'system.backup.restore',
    'system.backup.download',
    'system.logs.view',
    'system.logs.delete',
    'system.maintenance.enable',
    'system.cache.clear',
    'system.updates.install',
    'system.users.impersonate',
    'system.email.settings',
    'system.security.settings',
    'system.integrations.manage',
  ] as const,
  
  club: [
    'club.info.view',
    'club.info.edit',
    'club.departments.view',
    'club.departments.manage',
    'club.board.view',
    'club.board.edit',
    'club.history.view',
    'club.history.edit',
  ] as const,
  
  finance: [
    'finance.view',
    'finance.transactions.create',
    'finance.transactions.edit',
    'finance.transactions.delete',
    'finance.reports.view',
    'finance.reports.create',
    'finance.budget.view',
    'finance.budget.edit',
    'finance.invoices.create',
    'finance.invoices.send',
    'finance.invoices.cancel',
    'finance.export',
  ] as const,
  
  training: [
    'training.view',
    'training.create',
    'training.edit',
    'training.delete',
    'training.participants.view',
    'training.participants.manage',
    'training.certificates.issue',
    'training.progress.view',
    'training.progress.edit',
    'training.materials.upload',
    'training.exams.create',
    'training.exams.grade',
  ] as const,
  
  inventory: [
    'inventory.view',
    'inventory.add',
    'inventory.edit',
    'inventory.delete',
    'inventory.borrow',
    'inventory.lend.manage',
    'inventory.maintenance.view',
    'inventory.maintenance.create',
    'inventory.maintenance.complete',
    'inventory.categories.manage',
  ] as const,
  
  statistics: [
    'statistics.view',
    'statistics.advanced',
    'statistics.export',
    'reports.create',
    'reports.schedule',
    'reports.delete',
  ] as const,
  
  kiosk: [
    'kiosk.access',
    'kiosk.flugbuch.start',
    'kiosk.flugbuch.end',
    'kiosk.weather.view',
    'kiosk.manage',
    'kiosk.announcements.view',
    'kiosk.announcements.create',
  ] as const,
} as const;

// ============================================
// HELPER TYPES
// ============================================

/**
 * Berechtigungsdefinition aus der Datenbank
 */
export interface PermissionDefinition {
  id: string;
  name: Permission;
  display_name: string;
  description: string;
  category: PermissionCategory;
  is_system_permission: boolean;
  created_at: string;
}

/**
 * Rolle mit Berechtigungen
 */
export interface RoleWithPermissions {
  id: string;
  name: string;
  display_name: string;
  description: string;
  priority: number;
  upload_limit_mb: number;
  is_system_role: boolean;
  color: string;
  permissions: Permission[];
  user_count?: number;
  permission_count?: number;
}

/**
 * Benutzer mit Rollen und Berechtigungen
 */
export interface UserWithPermissions {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_admin: boolean;
  is_member: boolean;
  is_active: boolean;
  roles: Array<{
    id: string;
    name: string;
    upload_limit_mb: number;
    priority: number;
  }>;
  permissions: Permission[];
}

// ============================================
// PERMISSION CHECKER HELPERS
// ============================================

/**
 * Prüft ob ein Benutzer eine spezifische Berechtigung hat
 */
export function hasPermission(
  user: UserWithPermissions | null,
  permission: Permission
): boolean {
  if (!user) return false;
  
  // Legacy Admins haben alle Berechtigungen
  if (user.is_admin) return true;
  
  // Prüfe RBAC Berechtigungen
  return user.permissions?.includes(permission) ?? false;
}

/**
 * Prüft ob ein Benutzer EINE der angegebenen Berechtigungen hat
 */
export function hasAnyPermission(
  user: UserWithPermissions | null,
  permissions: Permission[]
): boolean {
  if (!user) return false;
  
  // Legacy Admins haben alle Berechtigungen
  if (user.is_admin) return true;
  
  // Prüfe ob mindestens eine Berechtigung vorhanden ist
  return permissions.some(p => user.permissions?.includes(p) ?? false);
}

/**
 * Prüft ob ein Benutzer ALLE angegebenen Berechtigungen hat
 */
export function hasAllPermissions(
  user: UserWithPermissions | null,
  permissions: Permission[]
): boolean {
  if (!user) return false;
  
  // Legacy Admins haben alle Berechtigungen
  if (user.is_admin) return true;
  
  // Prüfe ob alle Berechtigungen vorhanden sind
  return permissions.every(p => user.permissions?.includes(p) ?? false);
}

/**
 * Gibt alle Berechtigungen einer Kategorie zurück
 */
export function getPermissionsByCategory(category: PermissionCategory): readonly Permission[] {
  return PermissionGroups[category] || [];
}

// ============================================
// EXPORTS
// ============================================

export default {
  PermissionGroups,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getPermissionsByCategory,
};
