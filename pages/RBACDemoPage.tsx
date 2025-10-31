import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { 
  Shield, 
  User, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Upload, 
  TrendingUp,
  Eye,
  Lock,
  Unlock,
  BarChart3
} from 'lucide-react';
import {
  mockUsers,
  mockRoles,
  mockPermissions,
  getUserPermissions,
  userHasPermission,
  getUserUploadLimit,
  getUserPriority,
  getCategories,
  getPermissionsByCategory,
  type MockUser,
  type MockRole,
} from '../data/mock-rbac';

export default function RBACDemoPage() {
  const [selectedUser, setSelectedUser] = useState<MockUser>(mockUsers[1]); // Max Mustermann als Default
  const [selectedRole, setSelectedRole] = useState<MockRole>(mockRoles[7]); // Vorstand als Default
  const [testPermission, setTestPermission] = useState<string>('articles.create');

  const userPermissions = getUserPermissions(selectedUser);
  const userUploadLimit = getUserUploadLimit(selectedUser);
  const userPriority = getUserPriority(selectedUser);
  const hasTestPermission = userHasPermission(selectedUser, testPermission);

  const categories = getCategories();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Shield className="w-12 h-12 text-primary" />
            <h1 className="text-4xl">RBAC System Demo</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Interaktive Demo des Role-Based Access Control Systems für den Flugmodellsportverein Dingden.
            Teste verschiedene Rollen und Berechtigungen ohne Backend!
          </p>
          <Badge variant="outline" className="text-sm">
            Mock-Daten · {mockUsers.length} Benutzer · {mockRoles.length} Rollen · {mockPermissions.length} Berechtigungen
          </Badge>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="user-test" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="user-test">
              <User className="w-4 h-4 mr-2" />
              Benutzer Testen
            </TabsTrigger>
            <TabsTrigger value="roles">
              <Shield className="w-4 h-4 mr-2" />
              Rollen Übersicht
            </TabsTrigger>
            <TabsTrigger value="permissions">
              <Lock className="w-4 h-4 mr-2" />
              Berechtigungen
            </TabsTrigger>
            <TabsTrigger value="statistics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Statistiken
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Benutzer Testen */}
          <TabsContent value="user-test" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Benutzer Auswahl */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Benutzer wählen
                  </CardTitle>
                  <CardDescription>
                    Wähle einen Benutzer zum Testen aus
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select
                    value={selectedUser.id}
                    onValueChange={(id) => {
                      const user = mockUsers.find(u => u.id === id);
                      if (user) setSelectedUser(user);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mockUsers.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {user.first_name} {user.last_name}
                            {user.is_admin && (
                              <Badge variant="destructive" className="ml-2">Admin</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Separator />

                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm text-muted-foreground">E-Mail</Label>
                      <p className="text-sm">{selectedUser.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Status</Label>
                      <div className="flex items-center gap-2">
                        {selectedUser.is_active ? (
                          <Badge variant="default">Aktiv</Badge>
                        ) : (
                          <Badge variant="secondary">Inaktiv</Badge>
                        )}
                        {selectedUser.is_admin && (
                          <Badge variant="destructive">Legacy Admin</Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Zugewiesene Rollen</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedUser.roles.map(roleName => {
                          const role = mockRoles.find(r => r.name === roleName);
                          return role ? (
                            <Badge
                              key={roleName}
                              style={{ backgroundColor: role.color }}
                              className="text-white"
                            >
                              {role.display_name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Priority</Label>
                      <p className="text-2xl">{userPriority}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Upload-Limit</Label>
                      <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        <p className="text-2xl">{userUploadLimit} MB</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Berechtigungen des Benutzers */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Unlock className="w-5 h-5" />
                    Berechtigungen von {selectedUser.first_name}
                  </CardTitle>
                  <CardDescription>
                    {selectedUser.is_admin 
                      ? '🔥 Legacy Admin - Hat ALLE Berechtigungen!' 
                      : `Hat ${userPermissions.length} Berechtigungen durch ${selectedUser.roles.length} Rolle(n)`
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-6">
                      {categories.map(category => {
                        const categoryPerms = getPermissionsByCategory(category);
                        const userCategoryPerms = categoryPerms.filter(p => 
                          userPermissions.includes(p.name)
                        );

                        if (userCategoryPerms.length === 0 && !selectedUser.is_admin) return null;

                        return (
                          <div key={category}>
                            <h3 className="text-sm mb-3 flex items-center gap-2">
                              <Badge variant="outline">{category}</Badge>
                              <span className="text-muted-foreground">
                                {selectedUser.is_admin ? categoryPerms.length : userCategoryPerms.length} / {categoryPerms.length}
                              </span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {(selectedUser.is_admin ? categoryPerms : userCategoryPerms).map(perm => (
                                <div
                                  key={perm.id}
                                  className="flex items-start gap-2 p-2 rounded-lg bg-muted/50"
                                >
                                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm">{perm.display_name}</p>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {perm.name}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Permission Tester */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Berechtigungs-Checker
                </CardTitle>
                <CardDescription>
                  Teste ob der Benutzer eine bestimmte Berechtigung hat
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label>Berechtigung testen</Label>
                    <Select value={testPermission} onValueChange={setTestPermission}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {mockPermissions.map(perm => (
                          <SelectItem key={perm.id} value={perm.name}>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {perm.category}
                              </Badge>
                              {perm.display_name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={() => {}}>
                    Prüfen
                  </Button>
                </div>

                <div className={`p-6 rounded-lg border-2 ${
                  hasTestPermission 
                    ? 'bg-green-50 border-green-500 dark:bg-green-950/20' 
                    : 'bg-red-50 border-red-500 dark:bg-red-950/20'
                }`}>
                  <div className="flex items-center gap-4">
                    {hasTestPermission ? (
                      <>
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                        <div>
                          <h3 className="text-lg text-green-700 dark:text-green-400">
                            ✅ Berechtigung vorhanden
                          </h3>
                          <p className="text-sm text-green-600 dark:text-green-500">
                            {selectedUser.first_name} hat die Berechtigung "{testPermission}"
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-12 h-12 text-red-500" />
                        <div>
                          <h3 className="text-lg text-red-700 dark:text-red-400">
                            ❌ Keine Berechtigung
                          </h3>
                          <p className="text-sm text-red-600 dark:text-red-500">
                            {selectedUser.first_name} hat KEINE Berechtigung für "{testPermission}"
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: Rollen Übersicht */}
          <TabsContent value="roles" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Rollen Liste */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Rollen</CardTitle>
                  <CardDescription>
                    {mockRoles.length} Rollen verfügbar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-2">
                      {mockRoles
                        .sort((a, b) => b.priority - a.priority)
                        .map(role => (
                          <button
                            key={role.id}
                            onClick={() => setSelectedRole(role)}
                            className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                              selectedRole.id === role.id
                                ? 'border-primary bg-primary/10'
                                : 'border-transparent hover:bg-muted'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: role.color }}
                              />
                              <p className="text-sm">{role.display_name}</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <TrendingUp className="w-3 h-3" />
                              {role.priority}
                              <Users className="w-3 h-3 ml-2" />
                              {role.user_count}
                            </div>
                          </button>
                        ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Rollen Details */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: selectedRole.color }}
                    />
                    <div>
                      <CardTitle>{selectedRole.display_name}</CardTitle>
                      <CardDescription>{selectedRole.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Rolle Infos */}
                  <div className="grid grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <TrendingUp className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-2xl">{selectedRole.priority}</p>
                          <p className="text-xs text-muted-foreground">Priority</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-2xl">{selectedRole.upload_limit_mb}</p>
                          <p className="text-xs text-muted-foreground">MB Upload</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Users className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-2xl">{selectedRole.user_count}</p>
                          <p className="text-xs text-muted-foreground">Benutzer</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Lock className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-2xl">{selectedRole.permission_count}</p>
                          <p className="text-xs text-muted-foreground">Rechte</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Separator />

                  {/* Berechtigungen der Rolle */}
                  <div>
                    <h3 className="text-sm mb-4">
                      Berechtigungen ({selectedRole.permissions.length})
                    </h3>
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="space-y-4">
                        {categories.map(category => {
                          const categoryPerms = mockPermissions.filter(
                            p => p.category === category && selectedRole.permissions.includes(p.name)
                          );

                          if (categoryPerms.length === 0) return null;

                          return (
                            <div key={category}>
                              <Badge variant="outline" className="mb-2">
                                {category} ({categoryPerms.length})
                              </Badge>
                              <div className="grid grid-cols-2 gap-2">
                                {categoryPerms.map(perm => (
                                  <div
                                    key={perm.id}
                                    className="flex items-center gap-2 p-2 rounded bg-muted/50"
                                  >
                                    <Checkbox checked disabled />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm truncate">{perm.display_name}</p>
                                      <p className="text-xs text-muted-foreground truncate">
                                        {perm.name}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 3: Alle Berechtigungen */}
          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Alle Berechtigungen ({mockPermissions.length})
                </CardTitle>
                <CardDescription>
                  Vollständige Übersicht aller verfügbaren Berechtigungen im System
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-6">
                    {categories.map(category => {
                      const categoryPerms = getPermissionsByCategory(category);
                      const systemPerms = categoryPerms.filter(p => p.is_system_permission);
                      const customPerms = categoryPerms.filter(p => !p.is_system_permission);

                      return (
                        <div key={category}>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg">
                              <Badge>{category}</Badge>
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {categoryPerms.length} Berechtigungen
                              {systemPerms.length > 0 && ` (${systemPerms.length} System)`}
                            </p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {categoryPerms.map(perm => (
                              <Card key={perm.id} className={perm.is_system_permission ? 'border-primary/50' : ''}>
                                <CardContent className="pt-4">
                                  <div className="flex items-start gap-2 mb-2">
                                    <Lock className="w-4 h-4 mt-0.5 text-muted-foreground" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm">{perm.display_name}</p>
                                      <p className="text-xs text-muted-foreground truncate">
                                        {perm.name}
                                      </p>
                                    </div>
                                    {perm.is_system_permission && (
                                      <Badge variant="default" className="text-xs">
                                        System
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {perm.description}
                                  </p>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: Statistiken */}
          <TabsContent value="statistics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-3xl">{mockUsers.length}</p>
                    <p className="text-sm text-muted-foreground">Benutzer</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Shield className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-3xl">{mockRoles.length}</p>
                    <p className="text-sm text-muted-foreground">Rollen</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Lock className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-3xl">{mockPermissions.length}</p>
                    <p className="text-sm text-muted-foreground">Berechtigungen</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <BarChart3 className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-3xl">{categories.length}</p>
                    <p className="text-sm text-muted-foreground">Kategorien</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Rollen-Verteilung */}
              <Card>
                <CardHeader>
                  <CardTitle>Rollen-Verteilung</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockRoles
                      .sort((a, b) => (b.user_count || 0) - (a.user_count || 0))
                      .map(role => (
                        <div key={role.id}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: role.color }}
                              />
                              <span className="text-sm">{role.display_name}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {role.user_count} Benutzer
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${((role.user_count || 0) / mockUsers.length) * 100}%`,
                                backgroundColor: role.color,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Berechtigungs-Verteilung */}
              <Card>
                <CardHeader>
                  <CardTitle>Berechtigungen nach Kategorie</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categories.map(category => {
                      const count = getPermissionsByCategory(category).length;
                      const percentage = (count / mockPermissions.length) * 100;

                      return (
                        <div key={category}>
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="outline">{category}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {count} Berechtigungen
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
