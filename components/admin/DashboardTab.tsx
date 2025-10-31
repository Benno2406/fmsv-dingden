import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Users, Calendar, Image, FileText, TrendingUp, Plane } from "lucide-react";

export function DashboardTab() {
  const stats = [
    { 
      label: "Gesamtmitglieder", 
      value: "87", 
      change: "+3",
      icon: Users,
      description: "Aktive Vereinsmitglieder"
    },
    { 
      label: "Jugendmitglieder", 
      value: "23", 
      change: "+5",
      icon: Plane,
      description: "Nachwuchspiloten"
    },
    { 
      label: "Termine (30 Tage)", 
      value: "8", 
      change: "+2",
      icon: Calendar,
      description: "Anstehende Events"
    },
    { 
      label: "Fotoalben", 
      value: "12", 
      change: "0",
      icon: Image,
      description: "Veröffentlichte Alben"
    },
    { 
      label: "Presseberichte", 
      value: "24", 
      change: "+1",
      icon: FileText,
      description: "Veröffentlichte Artikel"
    },
    { 
      label: "Wachstum (Jahr)", 
      value: "+12%", 
      change: "",
      icon: TrendingUp,
      description: "Mitgliederzuwachs"
    },
  ];

  const recentActivities = [
    { action: "Neues Mitglied", detail: "Jonas Weber ist dem Verein beigetreten", time: "vor 2 Stunden" },
    { action: "Fotoalbum", detail: "Schnupperflug 2024 wurde hochgeladen", time: "vor 5 Stunden" },
    { action: "Pressebericht", detail: "Sommerfest-Artikel wurde veröffentlicht", time: "vor 1 Tag" },
    { action: "Termin", detail: "Vereinsmeisterschaft 2025 wurde angelegt", time: "vor 2 Tagen" },
  ];

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                    {stat.label}
                  </div>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2 mb-1">
                  <div>{stat.value}</div>
                  {stat.change && (
                    <span className="text-green-600" style={{ fontSize: '0.875rem' }}>
                      {stat.change}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Letzte Aktivitäten</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                <div className="flex-1">
                  <p className="mb-1">{activity.action}</p>
                  <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                    {activity.detail}
                  </p>
                </div>
                <span className="text-muted-foreground whitespace-nowrap" style={{ fontSize: '0.875rem' }}>
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Schnellzugriff</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
              Häufig verwendete Funktionen
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-3 py-1 bg-muted rounded-md cursor-pointer hover:bg-muted/80 transition-colors" style={{ fontSize: '0.875rem' }}>
                + Mitglied hinzufügen
              </span>
              <span className="px-3 py-1 bg-muted rounded-md cursor-pointer hover:bg-muted/80 transition-colors" style={{ fontSize: '0.875rem' }}>
                + Fotoalbum erstellen
              </span>
              <span className="px-3 py-1 bg-muted rounded-md cursor-pointer hover:bg-muted/80 transition-colors" style={{ fontSize: '0.875rem' }}>
                + Pressebericht verfassen
              </span>
              <span className="px-3 py-1 bg-muted rounded-md cursor-pointer hover:bg-muted/80 transition-colors" style={{ fontSize: '0.875rem' }}>
                + Termin anlegen
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Anstehende Termine</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="text-center min-w-[3rem]">
                  <div className="text-primary">15</div>
                  <div className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>Mai</div>
                </div>
                <div>
                  <p>Vereinsmeisterschaft 2025</p>
                  <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                    Fluggelände Dingden
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-center min-w-[3rem]">
                  <div className="text-primary">22</div>
                  <div className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>Jun</div>
                </div>
                <div>
                  <p>Schnupperflug für Kinder</p>
                  <p className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                    Fluggelände Dingden
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
