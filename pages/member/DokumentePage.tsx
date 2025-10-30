import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "../../components/ui/alert";
import { 
  FileText,
  Download,
  Eye,
  AlertCircle,
  ExternalLink,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

// Mock data
const regelungenDokumente = [
  { id: 1, name: "Flugordnung 2025.pdf", category: "Regelungen", size: "245 KB", date: "15. Jan 2025", url: "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf" },
  { id: 2, name: "Satzung FMSV Dingden.pdf", category: "Rechtliches", size: "312 KB", date: "15. Dez 2024", url: "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf" },
  { id: 3, name: "Beitragsordnung.pdf", category: "Regelungen", size: "156 KB", date: "01. Jan 2025", url: "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf" },
  { id: 4, name: "Datenschutzerklärung.pdf", category: "Rechtliches", size: "198 KB", date: "20. Dez 2024", url: "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf" },
];

const formulareDokumente = [
  { id: 5, name: "Mitgliedsantrag.pdf", category: "Formulare", size: "128 KB", date: "10. Jan 2025", url: "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf" },
  { id: 6, name: "Gästeliste Vorlage.pdf", category: "Vorlagen", size: "95 KB", date: "05. Jan 2025", url: "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf" },
  { id: 7, name: "Modell-Anmeldung.pdf", category: "Formulare", size: "112 KB", date: "20. Dez 2024", url: "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf" },
  { id: 8, name: "Flugschüler-Anmeldung.pdf", category: "Formulare", size: "134 KB", date: "15. Dez 2024", url: "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf" },
];

type DocumentType = typeof regelungenDokumente[0];

export function DokumentePage() {
  const [currentDocument, setCurrentDocument] = useState<DocumentType | null>(null);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);

  const handleViewDocument = (doc: DocumentType) => {
    setCurrentDocument(doc);
    setDocumentViewerOpen(true);
  };

  const handleDownloadDocument = (doc: DocumentType) => {
    // Trigger download by opening in new window
    window.open(doc.url, '_blank');
  };

  const handleOpenInNewTab = () => {
    if (currentDocument) {
      window.open(currentDocument.url, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2">Dokumente</h2>
        <p className="text-muted-foreground">
          Alle wichtigen Formulare und Vereinsdokumente.
        </p>
      </div>

      {/* Regelungen und Ordnungen - Nur Ansicht */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Regelungen & Ordnungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4" style={{ fontSize: '0.875rem' }}>
            Diese Dokumente kannst du direkt ansehen. Sie stehen nur zur Information zur Verfügung.
          </p>
          <div className="space-y-2">
            {regelungenDokumente.map((doc, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="mb-1 break-words">{doc.name}</p>
                    <div className="flex flex-wrap items-center gap-2 text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                      <span>{doc.category}</span>
                      <span className="hidden sm:inline">·</span>
                      <span>{doc.size}</span>
                      <span className="hidden sm:inline">·</span>
                      <span>{doc.date}</span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 w-full sm:w-auto min-h-9 flex-shrink-0"
                  onClick={() => handleViewDocument(doc)}
                >
                  <Eye className="h-4 w-4" />
                  Anzeigen
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Formulare und Vorlagen - Download */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Formulare & Vorlagen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4" style={{ fontSize: '0.875rem' }}>
            Diese Dokumente kannst du herunterladen, ausfüllen und bei Bedarf beim Vorstand einreichen.
          </p>
          <div className="space-y-2">
            {formulareDokumente.map((doc, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="mb-1 break-words">{doc.name}</p>
                    <div className="flex flex-wrap items-center gap-2 text-muted-foreground" style={{ fontSize: '0.875rem' }}>
                      <span>{doc.category}</span>
                      <span className="hidden sm:inline">·</span>
                      <span>{doc.size}</span>
                      <span className="hidden sm:inline">·</span>
                      <span>{doc.date}</span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 w-full sm:w-auto min-h-9 flex-shrink-0"
                  onClick={() => handleDownloadDocument(doc)}
                >
                  <Download className="h-4 w-4" />
                  Herunterladen
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Box */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Hinweis zu den Dokumenten</AlertTitle>
        <AlertDescription>
          Alle Dokumente werden vom Vorstand gepflegt und auf dem aktuellen Stand gehalten. 
          Bei Fragen zu Formularen oder Regelungen wende dich bitte an den Vorstand.
        </AlertDescription>
      </Alert>

      {/* PDF Viewer Modal */}
      <Dialog open={documentViewerOpen} onOpenChange={setDocumentViewerOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0" aria-describedby={undefined}>
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex-1 min-w-0 pr-0 sm:pr-8">
                <DialogTitle className="break-words">{currentDocument?.name}</DialogTitle>
                <div className="flex flex-wrap items-center gap-2 text-muted-foreground mt-2" style={{ fontSize: '0.875rem' }}>
                  <span>{currentDocument?.category}</span>
                  <span className="hidden sm:inline">·</span>
                  <span>{currentDocument?.size}</span>
                  <span className="hidden sm:inline">·</span>
                  <span>{currentDocument?.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 flex-1 sm:flex-initial min-h-9"
                  onClick={handleOpenInNewTab}
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="hidden sm:inline">Neuer Tab</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 flex-1 sm:flex-initial min-h-9"
                  onClick={() => currentDocument && handleDownloadDocument(currentDocument)}
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex-1 w-full h-[calc(95vh-120px)] sm:h-[calc(95vh-100px)] bg-muted/30">
            {currentDocument && (
              <iframe
                src={currentDocument.url}
                className="w-full h-full border-0"
                title={currentDocument.name}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
