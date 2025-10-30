import { ReactNode, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Home,
  Users,
  Shield,
  Tablet,
  Settings,
  LogOut,
} from "lucide-react";
import { Toaster } from "./ui/sonner";
import { Separator } from "./ui/separator";
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
import { Avatar, AvatarFallback } from "./ui/avatar";

interface KioskLayoutProps {
  children: ReactNode;
}

export function KioskLayout({ children }: KioskLayoutProps) {
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    // Dark Mode beim Mounten aktivieren
    const root = document.documentElement;
    const previousTheme = root.classList.contains('dark') ? 'dark' : 'light';
    
    // Dark Mode erzwingen
    root.classList.remove('light');
    root.classList.add('dark');

    // Beim Unmounten zum vorherigen Theme zurückkehren
    return () => {
      root.classList.remove('dark');
      if (previousTheme === 'light') {
        root.classList.add('light');
      } else {
        root.classList.add('dark');
      }
    };
  }, []);

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
                Kiosk-Modus
              </div>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {/* Bereiche */}
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
                {user && (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/mitgliederbereich">
                          <Users className="h-4 w-4" />
                          <span>Mitgliederbereich</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    {isAdmin && (
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <Link to="/verwaltung">
                            <Shield className="h-4 w-4" />
                            <span>Verwaltung</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                  </>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <Separator className="my-2" />

          {/* Kiosk */}
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
            {user && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-auto py-3">
                  <Link to="/mitgliederbereich#profil">
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
            )}
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-6">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <Tablet className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Flugplatz Kiosk</span>
          </div>
        </header>

        <main className="flex-1">
          {children}
        </main>
        
        <Toaster 
          position="top-center" 
          expand={false}
          richColors
          toastOptions={{
            style: {
              fontSize: '1.125rem',
              padding: '1rem 1.5rem',
            },
          }}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
