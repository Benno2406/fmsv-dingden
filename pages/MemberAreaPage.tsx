import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { OverviewPage } from "./member/OverviewPage";
import { ProfilPage } from "./member/ProfilPage";
import { PresseartikelPage } from "./member/PresseartikelPage";
import { DokumentePage } from "./member/DokumentePage";
import { MitgliederPage } from "./member/MitgliederPage";
import { FotoalbenPage } from "./member/FotoalbenPage";
import { FlugbuchPage } from "./member/FlugbuchPage";

export function MemberAreaPage() {
  const location = useLocation();
  
  // Get current section from hash
  const currentSection = location.hash.replace('#', '') || 'overview';

  // Scroll to top when section changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentSection]);

  // Render based on current section
  switch (currentSection) {
    case 'overview':
      return <OverviewPage />;
    
    case 'profil':
      return <ProfilPage />;
    
    case 'flugbuch':
      return <FlugbuchPage />;
    
    case 'fotoalben':
      return <FotoalbenPage />;
    
    case 'presseartikel':
    case 'artikel': // Alternative route
      return <PresseartikelPage />;
    
    case 'dokumente':
      return <DokumentePage />;
    
    case 'mitglieder':
      return <MitgliederPage />;
    
    // Fallback to overview if unknown section
    default:
      return <OverviewPage />;
  }
}
