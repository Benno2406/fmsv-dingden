import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { DashboardPage } from "./admin/DashboardPage";
import { MitgliederPage } from "./admin/MitgliederPage";
import { TerminePage } from "./admin/TerminePage";
import { ArtikelPage } from "./admin/ArtikelPage";
import { BilderPage } from "./admin/BilderPage";
import { FlugbuchPage } from "./admin/FlugbuchPage";
import { DokumentePage } from "./admin/DokumentePage";
import { BenachrichtigungenPage } from "./admin/BenachrichtigungenPage";
import { EinstellungenPage } from "./admin/EinstellungenPage";
import { ProfilPage } from "./member/ProfilPage";

export function AdminAreaPage() {
  const location = useLocation();
  
  // Get current section from hash
  const currentSection = location.hash.replace('#', '') || 'dashboard';

  // Scroll to top when section changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentSection]);

  // Render based on current section
  switch (currentSection) {
    case 'dashboard':
      return <DashboardPage />;
    
    case 'mitglieder':
    case 'members': // Alternative route
      return <MitgliederPage />;
    
    case 'termine':
    case 'events': // Alternative route
      return <TerminePage />;
    
    case 'artikel':
    case 'articles': // Alternative route
      return <ArtikelPage />;
    
    case 'bilder':
    case 'images': // Alternative route
      return <BilderPage />;
    
    case 'flugbuch':
      return <FlugbuchPage />;
    
    case 'dokumente':
      return <DokumentePage />;
    
    case 'benachrichtigungen':
    case 'notifications': // Alternative route
      return <BenachrichtigungenPage />;
    
    case 'einstellungen':
    case 'settings': // Alternative route
      return <EinstellungenPage />;
    
    case 'profil':
    case 'profile': // Alternative route
      return <ProfilPage />;
    
    // Fallback to dashboard if unknown section
    default:
      return <DashboardPage />;
  }
}
