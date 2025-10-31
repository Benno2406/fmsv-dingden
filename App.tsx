import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PublicLayout } from "./components/PublicLayout";
import { MemberLayout } from "./components/MemberLayout";
import { KioskLayout } from "./components/KioskLayout";
import { HomePage } from "./pages/HomePage";
import { FlugbetriebPage } from "./pages/FlugbetriebPage";
import { FlugordnungPage } from "./pages/FlugordnungPage";
import { JugendarbeitPage } from "./pages/JugendarbeitPage";
import { TerminePage } from "./pages/TerminePage";
import { PresseberichtePage } from "./pages/PresseberichtePage";
import { FotoalbenPage } from "./pages/FotoalbenPage";
import { MemberAreaPage } from "./pages/MemberAreaPage";
import { AdminPage } from "./pages/AdminPage";
import { MitgliedschaftPage } from "./pages/MitgliedschaftPage";
import { LoginPage } from "./pages/LoginPage";
import { FlugplatzKioskPage } from "./pages/FlugplatzKioskPage";
import { Toaster } from "./components/ui/sonner";
import { CookieConsent } from "./components/CookieConsent";

export default function App() {
  // Handle both preview environment and production
  const basename = window.location.pathname.includes('preview_page.html') 
    ? '/preview_page.html' 
    : '';

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter basename={basename}>
          <Routes>
            {/* Public Routes with PublicLayout */}
            <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
            <Route path="/flugbetrieb" element={<PublicLayout><FlugbetriebPage /></PublicLayout>} />
            <Route path="/flugordnung" element={<PublicLayout><FlugordnungPage /></PublicLayout>} />
            <Route path="/jugendarbeit" element={<PublicLayout><JugendarbeitPage /></PublicLayout>} />
            <Route path="/termine" element={<PublicLayout><TerminePage /></PublicLayout>} />
            <Route path="/presseberichte" element={<PublicLayout><PresseberichtePage /></PublicLayout>} />
            <Route path="/fotoalben" element={<PublicLayout><FotoalbenPage /></PublicLayout>} />
            <Route path="/mitgliedschaft" element={<PublicLayout><MitgliedschaftPage /></PublicLayout>} />
            <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
            
            {/* Member and Admin Routes with MemberLayout */}
            <Route path="/mitgliederbereich" element={<MemberLayout><MemberAreaPage /></MemberLayout>} />
            <Route path="/verwaltung" element={<MemberLayout><AdminPage /></MemberLayout>} />
            
            {/* Kiosk Mode - Always in Dark Mode, fullscreen without navigation */}
            <Route path="/flugplatz-kiosk" element={<KioskLayout><FlugplatzKioskPage /></KioskLayout>} />
          </Routes>
          <Toaster />
          <CookieConsent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
