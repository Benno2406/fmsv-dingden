/**
 * Database Admin Page
 * Datenbank-Verwaltung für Webmaster
 * Ersetzt pgAdmin - alles in Node.js/React!
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { databaseService } from '../../lib/api';
import type { DatabaseTable, DatabaseStats, DatabaseHealth } from '../../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import {
    Database,
    Table as TableIcon,
    Code,
    Activity,
    Download,
    AlertCircle,
    CheckCircle,
    RefreshCw,
    Eye,
    Search
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Navigate } from 'react-router-dom';

export function DatabasePage() {
    const { user } = useAuth();
    const [tables, setTables] = useState<DatabaseTable[]>([]);
    const [stats, setStats] = useState<DatabaseStats | null>(null);
    const [health, setHealth] = useState<DatabaseHealth | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTable, setSelectedTable] = useState<string | null>(null);

    // Nur für Webmaster
    if (user?.rang !== 'webmaster') {
        return <Navigate to="/verwaltung" replace />;
    }

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [tablesData, statsData, healthData] = await Promise.all([
                databaseService.getTables(),
                databaseService.getDatabaseStats(),
                databaseService.getDatabaseHealth()
            ]);

            setTables(tablesData);
            setStats(statsData);
            setHealth(healthData);
        } catch (error: any) {
            toast.error('Fehler beim Laden der Datenbank-Informationen');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleBackup = async () => {
        try {
            toast.loading('Erstelle Backup...', { id: 'backup' });
            const result = await databaseService.createBackup();
            toast.success(`Backup erstellt: ${result.backup_file}`, { id: 'backup' });
        } catch (error: any) {
            toast.error('Backup fehlgeschlagen', { id: 'backup' });
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex items-center gap-3">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    <span>Lade Datenbank-Informationen...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-7xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="flex items-center gap-3">
                        <Database className="w-8 h-8" />
                        Datenbank-Verwaltung
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        PostgreSQL Administration - Direkt im Browser, kein pgAdmin benötigt!
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={loadData}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Aktualisieren
                    </Button>
                    <Button onClick={handleBackup}>
                        <Download className="w-4 h-4 mr-2" />
                        Backup erstellen
                    </Button>
                </div>
            </div>

            {/* Health Status */}
            {health && (
                <Alert className={health.status === 'healthy' ? 'border-green-500' : 'border-red-500'}>
                    {health.status === 'healthy' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <AlertDescription className="flex items-center justify-between">
                        <div>
                            <span className="font-medium">Status: {health.status}</span>
                            <span className="ml-4 text-sm text-muted-foreground">
                                {health.postgres_version}
                            </span>
                        </div>
                        <div className="flex gap-4 text-sm">
                            <span>Pool: {health.pool_total} total</span>
                            <span>Idle: {health.pool_idle}</span>
                            <span>Waiting: {health.pool_waiting}</span>
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Datenbank-Größe</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl">{stats.database_size}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Tabellen</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl">{stats.tables.table_count}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stats.tables.total_size}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Verbindungen</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl">{stats.connections.total}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stats.connections.active} aktiv • {stats.connections.idle} idle
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Aktivität</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl">{stats.recent_activity.length}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Aktive Queries
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Main Content */}
            <Tabs defaultValue="tables" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="tables">
                        <TableIcon className="w-4 h-4 mr-2" />
                        Tabellen
                    </TabsTrigger>
                    <TabsTrigger value="query">
                        <Code className="w-4 h-4 mr-2" />
                        SQL Query
                    </TabsTrigger>
                    <TabsTrigger value="activity">
                        <Activity className="w-4 h-4 mr-2" />
                        Aktivität
                    </TabsTrigger>
                </TabsList>

                {/* Tables Tab */}
                <TabsContent value="tables" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Alle Tabellen</CardTitle>
                            <CardDescription>
                                {tables.length} Tabellen in der Datenbank
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {tables.map((table) => (
                                    <div
                                        key={table.table_name}
                                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                                        onClick={() => setSelectedTable(table.table_name)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <TableIcon className="w-5 h-5 text-muted-foreground" />
                                            <div>
                                                <div className="font-medium">{table.table_name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {table.column_count} Spalten • {table.row_count.toLocaleString()} Zeilen
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="secondary">{table.size}</Badge>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedTable(table.table_name);
                                                }}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Selected Table Details */}
                    {selectedTable && (
                        <TableDetails
                            tableName={selectedTable}
                            onClose={() => setSelectedTable(null)}
                        />
                    )}
                </TabsContent>

                {/* Query Tab */}
                <TabsContent value="query">
                    <QueryEditor />
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity">
                    {stats && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Aktive Queries</CardTitle>
                                <CardDescription>
                                    Laufende Datenbank-Operationen
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {stats.recent_activity.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">
                                        Keine aktiven Queries
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {stats.recent_activity.map((activity, idx) => (
                                            <div
                                                key={idx}
                                                className="p-3 rounded-lg border space-y-1"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline">{activity.usename}</Badge>
                                                        <Badge>{activity.state}</Badge>
                                                    </div>
                                                    <span className="text-sm text-muted-foreground">
                                                        {new Date(activity.query_start).toLocaleString()}
                                                    </span>
                                                </div>
                                                <code className="text-xs bg-muted p-2 rounded block">
                                                    {activity.query_preview}...
                                                </code>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

// Komponente für Tabellen-Details wird im nächsten File erstellt
function TableDetails({ tableName, onClose }: { tableName: string; onClose: () => void }) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Tabelle: {tableName}</CardTitle>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        Schließen
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    Details werden geladen... (Komponente wird noch erweitert)
                </p>
            </CardContent>
        </Card>
    );
}

// Query Editor Komponente
function QueryEditor() {
    const [query, setQuery] = useState('SELECT * FROM users LIMIT 10;');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const executeQuery = async () => {
        setLoading(true);
        try {
            const data = await databaseService.executeQuery(query, true);
            setResult(data);
            toast.success(`Query erfolgreich: ${data.rowCount} Zeilen`);
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Query fehlgeschlagen');
            setResult({ error: error.response?.data?.error || error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>SQL Query Editor</CardTitle>
                <CardDescription>
                    Führe SQL-Queries aus (READ-ONLY: nur SELECT erlaubt)
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full h-32 p-3 rounded-lg border font-mono text-sm"
                        placeholder="SELECT * FROM ..."
                    />
                </div>

                <Button onClick={executeQuery} disabled={loading}>
                    {loading ? (
                        <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Ausführen...
                        </>
                    ) : (
                        <>
                            <Code className="w-4 h-4 mr-2" />
                            Query ausführen
                        </>
                    )}
                </Button>

                {result && (
                    <div className="mt-4">
                        {result.error ? (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{result.error}</AlertDescription>
                            </Alert>
                        ) : (
                            <div className="border rounded-lg overflow-auto max-h-96">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted">
                                        <tr>
                                            {result.fields?.map((field: any) => (
                                                <th key={field.name} className="p-2 text-left font-medium">
                                                    {field.name}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {result.rows?.map((row: any, idx: number) => (
                                            <tr key={idx} className="border-t">
                                                {result.fields?.map((field: any) => (
                                                    <td key={field.name} className="p-2">
                                                        {JSON.stringify(row[field.name])}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
