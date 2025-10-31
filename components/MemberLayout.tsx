import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Home,
  Users,
  Plane,
  Image as ImageIcon,
  Newspaper,
  FileText,
  Calendar,
  Settings,
  LogOut,
  ChevronRight,
  LayoutDashboard,
  Shield,
  Tablet,
  Bell
} from "lucide-react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { ThemeToggle } from "./ThemeToggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "./ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface MemberLayoutProps {
  children: ReactNode;
}

export function MemberLayout({ children }: MemberLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const isAdminArea = location.pathname === "/verwaltung";

  // Navigation items für Mitgliederbereich
  const memberNavItems = [
    {
      label: "Übersicht",
      icon: LayoutDashboard,
      path: "/mitgliederbereich",
      description: "Startseite"
    },
    {
      label: "Flugbuch",
      icon: Plane,
      path: "/mitgliederbereich#flugbuch",
      description: "Deine Flüge"
    },
    {
      label: "Fotoalben",
      icon: ImageIcon,
      path: "/mitgliederbereich#fotoalben",
      description: "Bilder & Videos"
    },
    {
      label: "Presseartikel",
      icon: Newspaper,
      path: "/mitgliederbereich#presseartikel",
      description: "Berichte schreiben"
    },
    {
      label: "Dokumente",
      icon: FileText,
      path: "/mitgliederbereich#dokumente",
      description: "Formulare & Dateien"
    },
    {
      label: "Mitglieder",
      icon: Users,
      path: "/mitgliederbereich#mitglieder",
      description: "Kontaktliste"
    },
  ];

  // Navigation items für Verwaltung
  const adminNavItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/verwaltung",
      description: "Übersicht"
    },
    {
      label: "Mitglieder",
      icon: Users,
      path: "/verwaltung#mitglieder",
      description: "Verwaltung"
    },
    {
      label: "Termine",
      icon: Calendar,
      path: "/verwaltung#termine",
      description: "Veranstaltungen"
    },
    {
      label: "Artikel",
      icon: Newspaper,
      path: "/verwaltung#artikel",
      description: "Freigaben"
    },
    {
      label: "Bilder",
      icon: ImageIcon,
      path: "/verwaltung#bilder",
      description: "Medienverwaltung"
    },
    {
      label: "Flugbuch",
      icon: Plane,
      path: "/verwaltung#flugbuch",
      description: "Übersicht"
    },
    {
      label: "Dokumente",
      icon: FileText,
      path: "/verwaltung#dokumente",
      description: "Dateiverwaltung"
    },
    {
      label: "Benachrichtigungen",
      icon: Bell,
      path: "/verwaltung#benachrichtigungen",
      description: "Nachrichten"
    },
    {
      label: "Einstellungen",
      icon: Settings,
      path: "/verwaltung#einstellungen",
      description: "Konfiguration"
    },
  ];

  const navItems = isAdminArea ? adminNavItems : memberNavItems;

  const getBreadcrumbs = () => {
    const hash = location.hash.replace("#", "");
    const crumbs = [
      { label: "Öffentlicher Bereich", path: "/" },
    ];

    if (isAdminArea) {
      crumbs.push({ label: "Verwaltung", path: "/verwaltung" });
      const currentItem = adminNavItems.find(item => item.path.includes(`#${hash}`));
      if (currentItem && hash) {
        crumbs.push({ label: currentItem.label, path: "" });
      } else if (hash === "profil" || hash === "profile") {
        crumbs.push({ label: "Profil", path: "" });
      }
    } else {
      crumbs.push({ label: "Mitgliederbereich", path: "/mitgliederbereich" });
      
      // Check for current section based on hash
      if (hash) {
        const currentItem = memberNavItems.find(item => item.path.includes(`#${hash}`));
        if (currentItem) {
          crumbs.push({ label: currentItem.label, path: "" });
        } else if (hash === "profil") {
          // Profil ist nicht in der Navigation, aber als Breadcrumb
          crumbs.push({ label: "Profil", path: "" });
        }
      }
    }

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b">
          <div className="flex items-center gap-3 px-4 py-3">
            <img 
              src="https://www.fmsv-dingden.de/.cm4all/uproc.php/0/fmsv_logo.svg?_=18289466808" 
              alt="FMSV Dingden Logo" 
              className="h-10 w-auto"
            />
            <div>
              <div className="tracking-tight">FMSV Dingden</div>
              <div className="text-muted-foreground text-xs">
                {isAdminArea ? "Verwaltung" : "Mitgliederbereich"}
              </div>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {/* Bereichswechsel */}
          <SidebarGroup>
            <SidebarGroupLabel>Bereiche</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/">
                      <Home className="h-4 w-4" />
                      <span>Öffentlicher Bereich</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={!isAdminArea}>
                    <Link to="/mitgliederbereich">
                      <Users className="h-4 w-4" />
                      <span>Mitgliederbereich</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isAdminArea}>
                    <Link to="/verwaltung">
                      <Shield className="h-4 w-4" />
                      <span>Verwaltung</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <Separator className="my-2" />

          {/* Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const isActive = location.pathname + location.hash === item.path;
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild isActive={isActive} className="h-14">
                        <Link to={item.path}>
                          <item.icon className="h-5 w-5" />
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm">{item.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {item.description}
                            </span>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <Separator className="my-2" />

          {/* Kiosk Modus */}
          <SidebarGroup>
            <SidebarGroupLabel>Kiosk</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname === "/flugplatz-kiosk"} className="h-14">
                    <Link to="/flugplatz-kiosk">
                      <Tablet className="h-5 w-5" />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm">Tablet-Kiosk</span>
                        <span className="text-xs text-muted-foreground">
                          Flugplatz Übersicht
                        </span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="h-auto py-3">
                <Link to={isAdminArea ? "/verwaltung#profil" : "/mitgliederbereich#profil"}>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.name?.substring(0, 2).toUpperCase() || "MU"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{user?.name || "Max Mustermann"}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email || "max@example.com"}
                    </p>
                  </div>
                  <Settings className="h-4 w-4 text-muted-foreground ml-auto" />
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                <LogOut className="h-4 w-4" />
                <span>Ausloggen</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-6">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.path || index} className="flex items-center">
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {index === breadcrumbs.length - 1 || !crumb.path ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={crumb.path}>{crumb.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
