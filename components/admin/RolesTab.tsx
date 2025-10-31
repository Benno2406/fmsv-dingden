import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner@2.0.3';
import { rolesService, Role, Permission } from '../../lib/api';
import { Plus, Pencil, Trash2, Shield, Users } from 'lucide-react';

export function RolesTab() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<Record<string, Permission[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    upload_limit_mb: 5,
    priority: 0,
    color: '#6B7280',
    permissions: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesData, permissionsData] = await Promise.all([
        rolesService.getAllRoles(),
        rolesService.getAllPermissions(),
      ]);
      setRoles(rolesData);
      setPermissions(permissionsData.permissions);
      setGroupedPermissions(permissionsData.grouped);
    } catch (error: any) {
      toast.error('Fehler beim Laden der Daten', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    try {
      if (!formData.name || !formData.display_name) {
        toast.error('Bitte fülle alle Pflichtfelder aus');
        return;
      }

      await rolesService.createRole(formData);
      toast.success('Rolle erfolgreich erstellt');
      setIsCreateDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error('Fehler beim Erstellen der Rolle', {
        description: error.message,
      });
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedRole) return;

    try {
      await rolesService.updateRole(selectedRole.id, {
        display_name: formData.display_name,
        description: formData.description,
        upload_limit_mb: formData.upload_limit_mb,
        priority: formData.priority,
        color: formData.color,
        permissions: formData.permissions,
      });
      toast.success('Rolle erfolgreich aktualisiert');
      setIsEditDialogOpen(false);
      setSelectedRole(null);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error('Fehler beim Aktualisieren der Rolle', {
        description: error.message,
      });
    }
  };

  const handleDeleteRole = async (role: Role) => {
    if (role.is_system_role) {
      toast.error('System-Rollen können nicht gelöscht werden');
      return;
    }

    if (!confirm(`Möchtest du die Rolle "${role.display_name}" wirklich löschen?`)) {
      return;
    }

    try {
      await rolesService.deleteRole(role.id);
      toast.success('Rolle erfolgreich gelöscht');
      loadData();
    } catch (error: any) {
      toast.error('Fehler beim Löschen der Rolle', {
        description: error.message,
      });
    }
  };

  const openEditDialog = async (role: Role) => {
    setSelectedRole(role);
    
    // Load role with permissions
    const roleWithPerms = await rolesService.getRole(role.id);
    
    setFormData({
      name: role.name,
      display_name: role.display_name,
      description: role.description || '',
      upload_limit_mb: role.upload_limit_mb,
      priority: role.priority,
      color: role.color,
      permissions: roleWithPerms.permissions?.map(p => p.id) || [],
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      display_name: '',
      description: '',
      upload_limit_mb: 5,
      priority: 0,
      color: '#6B7280',
      permissions: [],
    });
  };

  const togglePermission = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      articles: 'Artikel & Content',
      members: 'Mitgliederverwaltung',
      flugbuch: 'Flugbuch',
      events: 'Termine & Events',
      images: 'Bilder & Galerien',
      documents: 'Dokumente',
      notifications: 'Benachrichtigungen',
      system: 'System & Administration',
    };
    return labels[category] || category;
  };

  if (loading) {
    return <div className="p-6 text-center">Lädt...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Rollen & Berechtigungen
          </h2>
          <p className="text-muted-foreground mt-1">
            Verwalte Rollen und deren Berechtigungen
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Neue Rolle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Neue Rolle erstellen</DialogTitle>
              <DialogDescription>
                Erstelle eine neue Rolle mit individuellen Berechtigungen
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[600px] pr-4">
              <RoleForm
                formData={formData}
                setFormData={setFormData}
                groupedPermissions={groupedPermissions}
                getCategoryLabel={getCategoryLabel}
                togglePermission={togglePermission}
                isCreate={true}
              />
            </ScrollArea>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleCreateRole}>Erstellen</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rolle</TableHead>
              <TableHead>Beschreibung</TableHead>
              <TableHead className="text-center">Upload-Limit</TableHead>
              <TableHead className="text-center">Benutzer</TableHead>
              <TableHead className="text-center">Berechtigungen</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map(role => (
              <TableRow key={role.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge style={{ backgroundColor: role.color }}>
                      {role.display_name}
                    </Badge>
                    {role.is_system_role && (
                      <Badge variant="outline" className="text-xs">
                        System
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="max-w-md">
                  <p className="text-sm text-muted-foreground truncate">
                    {role.description || '-'}
                  </p>
                </TableCell>
                <TableCell className="text-center">
                  {role.upload_limit_mb} MB
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="h-4 w-4" />
                    {role.user_count || 0}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {role.permission_count || 0}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(role)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {!role.is_system_role && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteRole(role)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Rolle bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeite die Rolle "{selectedRole?.display_name}"
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[600px] pr-4">
            <RoleForm
              formData={formData}
              setFormData={setFormData}
              groupedPermissions={groupedPermissions}
              getCategoryLabel={getCategoryLabel}
              togglePermission={togglePermission}
              isCreate={false}
            />
          </ScrollArea>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleUpdateRole}>Speichern</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface RoleFormProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  groupedPermissions: Record<string, Permission[]>;
  getCategoryLabel: (category: string) => string;
  togglePermission: (permissionId: string) => void;
  isCreate: boolean;
}

function RoleForm({
  formData,
  setFormData,
  groupedPermissions,
  getCategoryLabel,
  togglePermission,
  isCreate,
}: RoleFormProps) {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">Allgemein</TabsTrigger>
          <TabsTrigger value="permissions">Berechtigungen</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          {isCreate && (
            <div className="space-y-2">
              <Label htmlFor="name">
                Interner Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e =>
                  setFormData(prev => ({ ...prev, name: e.target.value }))
                }
                placeholder="z.B. fluglehrer"
              />
              <p className="text-xs text-muted-foreground">
                Kleinbuchstaben, keine Leerzeichen. Wird für interne Referenzen verwendet.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="display_name">
              Anzeigename <span className="text-destructive">*</span>
            </Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={e =>
                setFormData(prev => ({ ...prev, display_name: e.target.value }))
              }
              placeholder="z.B. Fluglehrer"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e =>
                setFormData(prev => ({ ...prev, description: e.target.value }))
              }
              placeholder="Kurze Beschreibung der Rolle..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="upload_limit_mb">Upload-Limit (MB)</Label>
              <Input
                id="upload_limit_mb"
                type="number"
                value={formData.upload_limit_mb}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    upload_limit_mb: parseInt(e.target.value) || 5,
                  }))
                }
                min={1}
                max={500}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priorität</Label>
              <Input
                id="priority"
                type="number"
                value={formData.priority}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    priority: parseInt(e.target.value) || 0,
                  }))
                }
                min={0}
                max={100}
              />
              <p className="text-xs text-muted-foreground">
                Höhere Werte = mehr Rechte
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Farbe</Label>
            <div className="flex items-center gap-2">
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={e =>
                  setFormData(prev => ({ ...prev, color: e.target.value }))
                }
                className="w-20 h-10"
              />
              <Input
                value={formData.color}
                onChange={e =>
                  setFormData(prev => ({ ...prev, color: e.target.value }))
                }
                placeholder="#6B7280"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <div className="space-y-4">
            {Object.entries(groupedPermissions).map(([category, perms]) => (
              <Card key={category} className="p-4">
                <h3 className="mb-3">{getCategoryLabel(category)}</h3>
                <div className="space-y-2">
                  {perms.map(permission => (
                    <div
                      key={permission.id}
                      className="flex items-start space-x-2"
                    >
                      <Checkbox
                        id={`perm-${permission.id}`}
                        checked={formData.permissions.includes(permission.id)}
                        onCheckedChange={() => togglePermission(permission.id)}
                      />
                      <div className="grid gap-1 leading-none">
                        <label
                          htmlFor={`perm-${permission.id}`}
                          className="text-sm cursor-pointer"
                        >
                          {permission.display_name}
                        </label>
                        {permission.description && (
                          <p className="text-xs text-muted-foreground">
                            {permission.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
