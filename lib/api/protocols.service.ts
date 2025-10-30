import apiClient from '../api-client';

export interface ProtocolSubTopic {
  id: string;
  title: string;
  content: string;
}

export interface ProtocolTopic {
  id: string;
  title: string;
  content: string;
  subTopics?: ProtocolSubTopic[];
}

export interface ProtocolAttendee {
  id: string;
  name: string;
  role?: string;
}

export interface ProtocolAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  preview?: string;
}

export interface Protocol {
  id: number;
  title: string;
  protocol_date: string;
  protocol_time?: string; // Backward compatibility
  protocol_start_time?: string;
  protocol_end_time?: string;
  location?: string;
  secretary_id?: number;
  attendance_mode?: 'list' | 'count';
  attendees: ProtocolAttendee[];
  attendees_count?: number;
  voting_rights_count?: number;
  attachments: ProtocolAttachment[];
  topics: ProtocolTopic[];
  permission_level: 'public' | 'members' | 'board' | 'board_auditors' | 'admin';
  email_notification_sent: boolean;
  email_subject?: string;
  email_body?: string;
  pdf_attached_to_email: boolean;
  is_draft: boolean;
  is_published: boolean;
  pdf_filename?: string;
  pdf_path?: string;
  created_by: number;
  creator_name?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface CreateProtocolData {
  title: string;
  protocol_date: string;
  protocol_time?: string;
  location?: string;
  attendance_mode?: 'list' | 'count';
  topics: ProtocolTopic[];
  attendees?: ProtocolAttendee[];
  attendees_count?: number;
  voting_rights_count?: number;
  attachments?: ProtocolAttachment[];
  permission_level?: string;
  email_notification?: boolean;
  email_subject?: string;
  email_body?: string;
  pdf_attached_to_email?: boolean;
  is_draft?: boolean;
}

export interface UpdateProtocolData extends Partial<CreateProtocolData> {
  id: number;
}

class ProtocolsService {
  /**
   * Alle Protokolle abrufen
   */
  async getAllProtocols(includeDrafts = false): Promise<Protocol[]> {
    const response = await apiClient.get('/protocols', {
      params: { includeDrafts: includeDrafts ? 'true' : 'false' }
    });
    return response.data.protocols;
  }

  /**
   * Einzelnes Protokoll abrufen
   */
  async getProtocolById(id: number): Promise<Protocol> {
    const response = await apiClient.get(`/protocols/${id}`);
    return response.data.protocol;
  }

  /**
   * Neues Protokoll erstellen
   */
  async createProtocol(data: CreateProtocolData): Promise<{ protocol_id: number }> {
    const response = await apiClient.post('/protocols', data);
    return response.data;
  }

  /**
   * Protokoll als Entwurf speichern
   */
  async saveDraft(data: CreateProtocolData): Promise<{ protocol_id: number }> {
    const response = await apiClient.post('/protocols', {
      ...data,
      is_draft: true
    });
    return response.data;
  }

  /**
   * Protokoll aktualisieren
   */
  async updateProtocol(id: number, data: Partial<CreateProtocolData>): Promise<void> {
    await apiClient.put(`/protocols/${id}`, data);
  }

  /**
   * Entwurf veröffentlichen
   */
  async publishProtocol(id: number): Promise<void> {
    await apiClient.post(`/protocols/${id}/publish`);
  }

  /**
   * Protokoll löschen
   */
  async deleteProtocol(id: number): Promise<void> {
    await apiClient.delete(`/protocols/${id}`);
  }

  /**
   * Entwürfe abrufen
   */
  async getDrafts(): Promise<Protocol[]> {
    return this.getAllProtocols(true);
  }
}

export const protocolsService = new ProtocolsService();
