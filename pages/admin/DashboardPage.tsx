import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Plane, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  ArrowRight,
  Activity,
  Image,
  FileText,
  UserPlus,
  ImagePlus,
  PenSquare,
  CalendarPlus
} from "lucide-react";

export function DashboardPage() {
  const stats = [
    { 
      label: "Gesamtmitglieder", 
      value: "87",
      description: "Aktive Vereinsmitglieder",
      icon: Users,
      link: "/verwaltung#mitglieder"
    },
    { 
      label: "Neue Mitglieder", 
      value: "8",
      description: "Beitritte in diesem Jahr (2025)",
      icon: TrendingUp,
      link: "/verwaltung#mitglieder"
    },
    { 
      label: "Flugbucheinträge", 
      value: "1.247",
      description: "Einträge in 2025",
      icon: Activity,
      link: "/verwaltung#flugbuch"
    },
  ];

  const pendingApprovals = [
    { 
      type: "Aufnahmeanträge", 
      count: 4, 
      icon: UserPlus,
      color: "text-green-600 dark:text-green-400", 
      bg: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
      link: "/verwaltung#mitglieder"
    },
    { 
      type: "Artikel", 
      count: 3, 
      icon: FileText,
      color: "text-blue-600 dark:text-blue-400", 
      bg: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      link: "/verwaltung#artikel"
    },
    { 
      type: "Bilder", 
      count: 12, 
      icon: Image,
      color: "text-purple-600 dark:text-purple-400", 
      bg: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20",
      borderColor: "border-purple-200 dark:border-purple-800",
      link: "/verwaltung#bilder"
    },
  ];

  const recentActivities = [
    { 
      action: "Neues Mitglied", 
      detail: "Jonas Weber ist dem Verein beigetreten", 
      time: "vor 2 Stunden", 
      status: "success",
      icon: UserPlus
    },
    { 
      action: "Fotoalbum", 
      detail: "Schnupperflug 2024 wurde hochgeladen", 
      time: "vor 5 Stunden", 
      status: "pending",
      icon: ImagePlus
    },
    { 
      action: "Pressebericht", 
      detail: "Sommerfest-Artikel wurde veröffentlicht", 
      time: "vor 1 Tag", 
      status: "success",
      icon: PenSquare
    },
    { 
      action: "Termin", 
      detail: "Vereinsmeisterschaft 2025 wurde angelegt", 
      time: "vor 2 Tagen", 
      status: "success",
      icon: CalendarPlus
    },
  ];

  const upcomingEvents = [
    {
      day: "15",
      month: "Mai",
      title: "Vereinsmeisterschaft 2025",
      location: "Fluggelände Dingden",
      attendees: 45,
      color: "bg-blue-500"
    },
    {
      day: "22",
      month: "Jun",
      title: "Schnupperflug für Kinder",
      location: "Fluggelände Dingden",
      attendees: 30,
      color: "bg-green-500"
    },
    {
      day: "12",
      month: "Jul",
      title: "Sommerfest",
      location: "Vereinsgelände",
      attendees: 80,
      color: "bg-orange-500"
    }
  ];

  // Filter nur Cards mit count > 0
  const visiblePendingApprovals = pendingApprovals.filter(p => p.count > 0);
  const totalPending = visiblePendingApprovals.reduce((sum, p) => sum + p.count, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="mb-2">Dashboard</h2>
        <p className="text-muted-foreground">
          Willkommen zurück! Hier ist eine Übersicht über deinen Verein.
        </p>
      </div>

      {/* Pending Approvals Cards */}
      {visiblePendingApprovals.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3>Warteschlange</h3>
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              {totalPending} Ausstehend
            </Badge>
          </div>
          <div className={`grid gap-6 ${visiblePendingApprovals.length === 1 ? 'lg:grid-cols-1 lg:max-w-md' : visiblePendingApprovals.length === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-3'}`}>
            {visiblePendingApprovals.map((approval, index) => {
            const Icon = approval.icon;
            return (
              <Link key={index} to={approval.link} className="group">
                <Card className={`${approval.bg} ${approval.borderColor} border-2 transition-all hover:shadow-lg hover:scale-[1.02]`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`rounded-xl ${approval.bg} p-3 border ${approval.borderColor}`}>
                        <Icon className={`h-8 w-8 ${approval.color}`} />
                      </div>
                      <Badge className={`${approval.color} bg-white dark:bg-gray-900`} variant="outline">
                        {approval.count} neu
                      </Badge>
                    </div>
                    <h4 className="mb-1">{approval.type}</h4>
                    <p className="text-muted-foreground text-sm mb-4">
                      Warte auf Prüfung
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full gap-2 group-hover:bg-white dark:group-hover:bg-gray-900"
                    >
                      Jetzt prüfen
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
          </div>
        </div>
      )}

      {/* Statistics */}
      <div>
        <h3 className="mb-4">Vereinsstatistiken</h3>
        <div className="grid gap-4 lg:grid-cols-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            
            return (
              <Link key={index} to={stat.link}>
                <Card className="transition-all hover:shadow-md">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="rounded-lg bg-muted p-2.5">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Letzte Aktivitäten
                </CardTitle>
                <CardDescription>
                  Die neuesten Ereignisse im Verein
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="gap-2">
                Alle anzeigen
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div 
                    key={index} 
                    className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0 hover:bg-muted/50 -mx-4 px-4 py-2 rounded-lg transition-colors"
                  >
                    <div className={`rounded-lg p-2 ${
                      activity.status === 'success' 
                        ? 'bg-green-50 dark:bg-green-950/30' 
                        : 'bg-amber-50 dark:bg-amber-950/30'
                    }`}>
                      <Icon className={`h-4 w-4 ${
                        activity.status === 'success' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-amber-600 dark:text-amber-400'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-medium">{activity.action}</p>
                        {activity.status === 'success' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {activity.detail}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Anstehende Termine
                </CardTitle>
                <CardDescription>
                  Die nächsten Vereinsevents
                </CardDescription>
              </div>
              <Link to="/verwaltung#termine">
                <Button variant="ghost" size="sm" className="gap-2">
                  Alle Termine
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0 hover:bg-muted/50 -mx-4 px-4 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  <div className={`rounded-xl ${event.color} p-3 text-white min-w-[4rem] text-center`}>
                    <div className="text-2xl leading-none mb-1">{event.day}</div>
                    <div className="text-xs opacity-90">{event.month}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium mb-1">{event.title}</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      {event.location}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="gap-1 text-xs">
                        <Users className="h-3 w-3" />
                        {event.attendees} Teilnehmer
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
