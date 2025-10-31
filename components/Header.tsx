import { Button } from "./ui/button";
import { Menu, Plane, Home, Calendar, Camera, GraduationCap, Newspaper, Lock, Users, BookOpen, ChevronRight, Shield, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "./ui/sheet";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";
import { Separator } from "./ui/separator";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll-Detection für subtilen Schatten
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  const navItems = [
    { label: "Startseite", icon: Home, path: "/" },
    { label: "Flugbetrieb", icon: Plane, path: "/flugbetrieb" },
    { label: "Flugordnung", icon: BookOpen, path: "/flugordnung" },
    { label: "Jugendarbeit", icon: GraduationCap, path: "/jugendarbeit" },
    { label: "Termine", icon: Calendar, path: "/termine" },
    { label: "Presseberichte", icon: Newspaper, path: "/presseberichte" },
    { label: "Fotoalben & Videos", icon: Camera, path: "/fotoalben" },
  ];

  return (
    <header className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-shadow duration-200 ${
      scrolled ? "shadow-sm" : ""
    }`}>
      <div className="container mx-auto px-4 md:px-6 flex h-14 items-center gap-4">
        {/* Mobile Menu Icon - jetzt links */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" aria-describedby={undefined} className="p-0 w-[280px]">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            
            {/* Header mit Logo */}
            <div className="flex items-center gap-3 px-4 py-4 border-b">
              <img 
                src="https://www.fmsv-dingden.de/.cm4all/uproc.php/0/fmsv_logo.svg?_=18289466808" 
                alt="FMSV Dingden Logo" 
                className="h-10 w-auto"
              />
              <div>
                <div className="tracking-tight">FMSV Dingden</div>
                <div className="text-muted-foreground" style={{ fontSize: '0.75rem', lineHeight: '1rem' }}>
                  Flugmodellsportverein
                </div>
              </div>
            </div>

            <nav className="flex flex-col py-4">
              {/* Bereichs-Navigation ganz oben */}
              <div className="px-3 mb-2">
                <div className="px-3 py-2 text-xs text-muted-foreground uppercase tracking-wider">
                  Bereiche
                </div>
                <div className="space-y-1">
                  {isLoggedIn ? (
                    <>
                      <Button
                        variant={!location.pathname.startsWith('/mitgliederbereich') && !location.pathname.startsWith('/verwaltung') ? "secondary" : "ghost"}
                        className="w-full justify-start gap-3 h-11 px-3"
                        asChild
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Link to="/">
                          <Home className="h-5 w-5" />
                          <span>Öffentlicher Bereich</span>
                        </Link>
                      </Button>
                      <Button
                        variant={location.pathname.startsWith('/mitgliederbereich') ? "secondary" : "ghost"}
                        className="w-full justify-start gap-3 h-11 px-3"
                        asChild
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Link to="/mitgliederbereich">
                          <Users className="h-5 w-5" />
                          <span>Mitgliederbereich</span>
                        </Link>
                      </Button>
                      <Button
                        variant={location.pathname.startsWith('/verwaltung') ? "secondary" : "ghost"}
                        className="w-full justify-start gap-3 h-11 px-3"
                        asChild
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Link to="/verwaltung">
                          <Shield className="h-5 w-5" />
                          <span>Verwaltung</span>
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="default"
                      className="w-full justify-start gap-3 h-11 px-3"
                      asChild
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link to="/login">
                        <Lock className="h-5 w-5" />
                        <span>Anmelden</span>
                        <ChevronRight className="ml-auto h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
              
              <Separator className="my-3" />

              {/* Public Navigation */}
              <div className="px-3 mb-2">
                <div className="px-3 py-2 text-xs text-muted-foreground uppercase tracking-wider">
                  Navigation
                </div>
                <div className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Button
                        key={item.label}
                        variant={isActive ? "secondary" : "ghost"}
                        className="w-full justify-start gap-3 h-11 px-3"
                        asChild
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Link to={item.path}>
                          <item.icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </Link>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Logout Button für eingeloggte Nutzer */}
              {isLoggedIn && (
                <>
                  <Separator className="my-3" />
                  <div className="px-3">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-11 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        logout();
                        navigate("/");
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Ausloggen</span>
                    </Button>
                  </div>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo - Desktop */}
        <Link to="/" className="hidden sm:flex items-center gap-3 transition-opacity hover:opacity-80">
          <img 
            src="https://www.fmsv-dingden.de/.cm4all/uproc.php/0/fmsv_logo.svg?_=18289466808" 
            alt="FMSV Dingden Logo" 
            className="h-10 w-auto"
          />
          <div>
            <div className="tracking-tight">FMSV Dingden</div>
            <div className="text-muted-foreground" style={{ fontSize: '0.75rem', lineHeight: '1rem' }}>
              Flugmodellsportverein
            </div>
          </div>
        </Link>

        {/* Text - Mobile (zentriert) */}
        <Link to="/" className="sm:hidden flex-1 text-center">
          <div className="tracking-tight">FMSV Dingden</div>
          <div className="text-muted-foreground" style={{ fontSize: '0.75rem', lineHeight: '1rem' }}>
            Flugmodellsportverein
          </div>
        </Link>

        {/* Logo - Mobile (jetzt rechts) */}
        <Link to="/" className="sm:hidden lg:hidden">
          <img 
            src="https://www.fmsv-dingden.de/.cm4all/uproc.php/0/fmsv_logo.svg?_=18289466808" 
            alt="FMSV Dingden Logo" 
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.label}
                to={item.path}
                className={`
                  relative flex items-center gap-1.5 h-9 px-3 rounded-md
                  transition-all duration-200
                  ${isActive 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }
                `}
                style={{ fontSize: '0.8125rem' }}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden lg:flex items-center gap-2 ml-auto">
          <ThemeToggle />
          {isLoggedIn ? (
            <Button 
              variant="default"
              className="gap-1.5 h-9 px-4" 
              style={{ fontSize: '0.8125rem' }}
              asChild
            >
              <Link to="/mitgliederbereich">
                <Users className="h-3.5 w-3.5" />
                Mitgliederbereich
              </Link>
            </Button>
          ) : (
            <Button 
              variant="default"
              className="gap-1.5 h-9 px-4" 
              style={{ fontSize: '0.8125rem' }}
              asChild
            >
              <Link to="/login">
                <Lock className="h-3.5 w-3.5" />
                Anmelden
              </Link>
            </Button>
          )}
        </div>


      </div>
    </header>
  );
}
