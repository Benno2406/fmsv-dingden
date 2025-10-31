/**
 * API Services - Barrel Export
 * Zentrale Exports aller API-Services
 */

// Auth
import * as authServiceImport from './auth.service';
export const authService = authServiceImport;
export type { LoginCredentials, RegisterData, User, AuthResponse } from './auth.service';

// Users/Members
import * as usersServiceImport from './users.service';
export const usersService = usersServiceImport;
export type { Member, UpdateProfileData } from './users.service';

// Flugbuch
import * as flugbuchServiceImport from './flugbuch.service';
export const flugbuchService = flugbuchServiceImport;
export type { FlugbuchEntry, FlugbuchStats, CreateFlugbuchEntry } from './flugbuch.service';

// Articles
import * as articlesServiceImport from './articles.service';
export const articlesService = articlesServiceImport;
export type { Article, CreateArticleData } from './articles.service';

// Images & Albums
import * as imagesServiceImport from './images.service';
export const imagesService = imagesServiceImport;
export type { Album, Image } from './images.service';

// Events
import * as eventsServiceImport from './events.service';
export const eventsService = eventsServiceImport;
export type { Event, CreateEventData } from './events.service';

// Notifications
import * as notificationsServiceImport from './notifications.service';
export const notificationsService = notificationsServiceImport;
export type { Notification } from './notifications.service';

// Protocols
export { protocolsService } from './protocols.service';
export type { Protocol, ProtocolTopic, ProtocolAttendee, ProtocolAttachment, CreateProtocolData } from './protocols.service';

// Database Admin (Webmaster only)
import * as databaseServiceImport from './database.service';
export const databaseService = databaseServiceImport;
export type { DatabaseTable, TableSchema, TableDataResponse, QueryResult, DatabaseStats, DatabaseHealth } from './database.service';

// Roles & Permissions
import * as rolesServiceImport from './roles.service';
export const rolesService = rolesServiceImport;
export type { Role, Permission, UserRole } from './roles.service';
