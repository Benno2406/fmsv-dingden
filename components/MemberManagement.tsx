import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { LogOut, LayoutDashboard, Users, Image, FileText, Calendar, Settings } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { DashboardTab } from "./admin/DashboardTab";
import { MembersTab } from "./admin/MembersTab";
import { ImagesTab } from "./admin/ImagesTab";
import { ArticlesTab } from "./admin/ArticlesTab";
import { EventsTab } from "./admin/EventsTab";

export function MemberManagement() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 md:px-6">
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <AlertDescription>
            🎨 <strong>Design-Vorschau:</strong> Dies ist ein Designkonzept für den Mitgliederbereich. 
            Die Funktionalität wird in der Node.js-Implementierung umgesetzt.
          </AlertDescription>
        </Alert>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="mb-2">Mitgliederbereich</h2>
            <p className="text-muted-foreground">
              Zentrale Verwaltung deines Vereins
            </p>
          </div>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            <LogOut className="h-4 w-4" />
            Abmelden
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto">
            <TabsTrigger value="dashboard" className="gap-2 py-3">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-2 py-3">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Mitglieder</span>
            </TabsTrigger>
            <TabsTrigger value="images" className="gap-2 py-3">
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">Bilder</span>
            </TabsTrigger>
            <TabsTrigger value="articles" className="gap-2 py-3">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Presseberichte</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2 py-3">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Termine</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 py-3">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Einstellungen</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardTab />
          </TabsContent>

          <TabsContent value="members">
            <MembersTab />
          </TabsContent>

          <TabsContent value="images">
            <ImagesTab />
          </TabsContent>

          <TabsContent value="articles">
            <ArticlesTab />
          </TabsContent>

          <TabsContent value="events">
            <EventsTab />
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-lg border p-6">
                  <h3 className="mb-4">Allgemeine Einstellungen</h3>
                  <p className="text-muted-foreground mb-4">
                    Website-Konfiguration, Vereinsinfos und Kontaktdaten verwalten.
                  </p>
                  <Button variant="outline">Einstellungen öffnen</Button>
                </div>

                <div className="rounded-lg border p-6">
                  <h3 className="mb-4">Benutzerverwaltung</h3>
                  <p className="text-muted-foreground mb-4">
                    Admin-Benutzer anlegen und Berechtigungen verwalten.
                  </p>
                  <Button variant="outline">Benutzer verwalten</Button>
                </div>

                <div className="rounded-lg border p-6">
                  <h3 className="mb-4">Backup & Export</h3>
                  <p className="text-muted-foreground mb-4">
                    Daten sichern und exportieren für Archivierung.
                  </p>
                  <Button variant="outline">Backup erstellen</Button>
                </div>

                <div className="rounded-lg border p-6">
                  <h3 className="mb-4">Dokumentenverwaltung</h3>
                  <p className="text-muted-foreground mb-4">
                    Satzung, Flugordnung und andere Dokumente hochladen.
                  </p>
                  <Button variant="outline">Dokumente verwalten</Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
