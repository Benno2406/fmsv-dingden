/**
 * Database Admin API Service
 * Nur für Webmaster!
 */

import apiClient from '../api-client';

export interface DatabaseTable {
    table_name: string;
    column_count: number;
    row_count: number;
    size: string;
}

export interface TableColumn {
    column_name: string;
    data_type: string;
    character_maximum_length: number | null;
    is_nullable: string;
    column_default: string | null;
}

export interface TableConstraint {
    constraint_name: string;
    constraint_type: string;
    column_name: string;
    foreign_table_name: string | null;
    foreign_column_name: string | null;
}

export interface TableIndex {
    indexname: string;
    indexdef: string;
}

export interface TableSchema {
    table_name: string;
    columns: TableColumn[];
    constraints: TableConstraint[];
    indexes: TableIndex[];
}

export interface TableDataResponse {
    table_name: string;
    total_rows: number;
    page: number;
    limit: number;
    total_pages: number;
    data: any[];
}

export interface QueryResult {
    rows: any[];
    rowCount: number;
    fields?: { name: string; dataTypeID: number }[];
}

export interface DatabaseStats {
    database_size: string;
    connections: {
        total: number;
        active: number;
        idle: number;
    };
    tables: {
        schemaname: string;
        table_count: number;
        total_size: string;
    };
    recent_activity: Array<{
        usename: string;
        datname: string;
        state: string;
        query_start: string;
        state_change: string;
        query_preview: string;
    }>;
}

export interface DatabaseHealth {
    status: string;
    server_time: string;
    postgres_version: string;
    pool_total: number;
    pool_idle: number;
    pool_waiting: number;
}

/**
 * Alle Tabellen abrufen
 */
export async function getTables(): Promise<DatabaseTable[]> {
    const response = await apiClient.get('/database/tables');
    return response.data;
}

/**
 * Schema einer Tabelle abrufen
 */
export async function getTableSchema(tableName: string): Promise<TableSchema> {
    const response = await apiClient.get(`/database/tables/${tableName}/schema`);
    return response.data;
}

/**
 * Daten einer Tabelle abrufen (mit Pagination)
 */
export async function getTableData(
    tableName: string,
    page: number = 1,
    limit: number = 50,
    orderBy?: string,
    orderDir: 'ASC' | 'DESC' = 'ASC'
): Promise<TableDataResponse> {
    const params: any = { page, limit };
    if (orderBy) {
        params.orderBy = orderBy;
        params.orderDir = orderDir;
    }

    const response = await apiClient.get(`/database/tables/${tableName}/data`, { params });
    return response.data;
}

/**
 * SQL Query ausführen
 */
export async function executeQuery(
    query: string,
    readonly: boolean = true
): Promise<QueryResult> {
    const response = await apiClient.post('/database/query', { query, readonly });
    return response.data;
}

/**
 * Backup erstellen
 */
export async function createBackup(): Promise<{ success: boolean; backup_file: string; timestamp: string }> {
    const response = await apiClient.post('/database/backup');
    return response.data;
}

/**
 * Datenbank-Statistiken abrufen
 */
export async function getDatabaseStats(): Promise<DatabaseStats> {
    const response = await apiClient.get('/database/stats');
    return response.data;
}

/**
 * Health Check
 */
export async function getDatabaseHealth(): Promise<DatabaseHealth> {
    const response = await apiClient.get('/database/health');
    return response.data;
}

export const databaseService = {
    getTables,
    getTableSchema,
    getTableData,
    executeQuery,
    createBackup,
    getDatabaseStats,
    getDatabaseHealth
};
