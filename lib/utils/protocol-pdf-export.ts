import { jsPDF } from "jspdf";

interface Attendee {
  id: string;
  name: string;
  role?: string;
}

interface ProtocolSubTopic {
  id: string;
  title: string;
  content: string;
}

interface ProtocolTopic {
  id: string;
  title: string;
  content: string;
  subTopics?: ProtocolSubTopic[];
}

interface ProtocolAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  preview?: string;
}

interface ProtocolData {
  title: string;
  date: string;
  time?: string; // Backward compatibility
  startTime?: string;
  endTime?: string;
  location?: string;
  secretary?: string;
  attendanceMode?: "list" | "count";
  attendees: Attendee[];
  attendeesCount?: number;
  votingRightsCount?: number;
  topics: ProtocolTopic[];
  attachments: ProtocolAttachment[];
  permission: string;
}

export const exportProtocolToPDF = (data: ProtocolData): void => {
  const doc = new jsPDF();
  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  const headerHeight = 25; // Höhe für Header reservieren
  const footerHeight = 25; // Höhe für Footer reservieren

  // Professional color palette - Minimalistisch und clean
  const colors = {
    primary: [13, 27, 42],      // Dunkles Blau-Grau
    accent: [59, 130, 246],      // Modernes Blau
    text: [31, 41, 55],          // Dunkelgrau
    textLight: [107, 114, 128],  // Hellgrau
    border: [229, 231, 235],     // Sehr helles Grau
    background: [249, 250, 251], // Off-White
    white: [255, 255, 255],
  };

  // Helper: HTML zu formatiertem Text konvertieren
  const htmlToFormattedText = (html: string): { text: string; isBold: boolean; isItalic: boolean; isUnderline: boolean; isBullet: boolean; isNumbered: boolean; indentLevel?: number; isTableRow?: boolean; tableCells?: string[] }[] => {
    const result: { text: string; isBold: boolean; isItalic: boolean; isUnderline: boolean; isBullet: boolean; isNumbered: boolean; indentLevel?: number; isTableRow?: boolean; tableCells?: string[] }[] = [];
    
    if (!html || !html.trim()) {
      return result;
    }
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Hilfsfunktion: Extrahiere direkten Text aus einem Element (ohne verschachtelte Listen)
    const getDirectText = (element: Element): string => {
      let text = '';
      
      // Durchlaufe alle Kinder
      for (let i = 0; i < element.childNodes.length; i++) {
        const node = element.childNodes[i];
        
        if (node.nodeType === Node.TEXT_NODE) {
          text += node.textContent || '';
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as Element;
          // Ignoriere verschachtelte Listen
          if (el.tagName !== 'UL' && el.tagName !== 'OL') {
            text += el.textContent || '';
          }
        }
      }
      
      return text.trim();
    };
    
    // Rekursive Funktion zum Verarbeiten von Listen
    const processList = (list: Element, indentLevel: number): void => {
      const isOrdered = list.tagName === 'OL';
      
      // Durchlaufe alle Kinder der Liste
      Array.from(list.children).forEach((child, index) => {
        // LI-Element: Verarbeite den Text
        if (child.tagName === 'LI') {
          const text = getDirectText(child);
          
          if (text) {
            const isBold = !!(child.querySelector('strong') || child.querySelector('b'));
            const isItalic = !!(child.querySelector('em') || child.querySelector('i'));
            const isUnderline = !!child.querySelector('u');
            
            result.push({
              text: isOrdered ? `${index + 1}. ${text}` : text,
              isBold,
              isItalic,
              isUnderline,
              isBullet: !isOrdered,
              isNumbered: isOrdered,
              indentLevel
            });
          }
          
          // Verarbeite verschachtelte Listen innerhalb des LI
          const nestedLists = Array.from(child.children).filter(
            c => c.tagName === 'UL' || c.tagName === 'OL'
          );
          nestedLists.forEach(nestedList => {
            processList(nestedList, indentLevel + 1);
          });
        }
        // UL/OL direkt als Kind (verschachtelte Liste ohne LI dazwischen)
        else if (child.tagName === 'UL' || child.tagName === 'OL') {
          processList(child, indentLevel);
        }
      });
    };
    
    // Hauptfunktion zum Verarbeiten von Elementen
    const processElement = (element: Element): void => {
      const tagName = element.tagName.toLowerCase();
      
      // Tabellen
      if (tagName === 'table') {
        const rows = element.querySelectorAll('tr');
        rows.forEach(row => {
          const cells = Array.from(row.querySelectorAll('td, th')).map(cell => cell.textContent?.trim() || '');
          if (cells.some(cell => cell)) {
            result.push({
              text: '',
              isBold: false,
              isItalic: false,
              isUnderline: false,
              isBullet: false,
              isNumbered: false,
              isTableRow: true,
              tableCells: cells
            });
          }
        });
        return;
      }
      
      // Listen
      if (tagName === 'ul' || tagName === 'ol') {
        processList(element, 0);
        return;
      }
      
      // Absätze
      if (tagName === 'p') {
        const text = element.textContent?.trim() || '';
        if (text) {
          const isBold = !!(element.querySelector('strong') || element.querySelector('b'));
          const isItalic = !!(element.querySelector('em') || element.querySelector('i'));
          const isUnderline = !!element.querySelector('u');
          
          result.push({
            text,
            isBold,
            isItalic,
            isUnderline,
            isBullet: false,
            isNumbered: false,
            indentLevel: 0
          });
        }
        return;
      }
      
      // DIV oder andere Container: Kinder durchsuchen
      if (tagName === 'div') {
        console.log('Processing DIV...');
        console.log('  innerHTML:', element.innerHTML.substring(0, 200));
        console.log('  children.length:', element.children.length);
        console.log('  childNodes.length:', element.childNodes.length);
        
        // Alle Kinder durchlaufen (auch Text-Nodes)
        element.childNodes.forEach((node, idx) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const childEl = node as Element;
            console.log(`  Child ${idx}: ELEMENT ${childEl.tagName}`);
            processElement(childEl);
          } else if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent?.trim();
            if (text) {
              console.log(`  Child ${idx}: TEXT "${text.substring(0, 50)}"`);
              result.push({
                text,
                isBold: false,
                isItalic: false,
                isUnderline: false,
                isBullet: false,
                isNumbered: false,
                indentLevel: 0
              });
            }
          }
        });
        return;
      }
    };
    
    // Verarbeite alle Nodes (nicht nur children, auch Text-Nodes!)
    tempDiv.childNodes.forEach((node, idx) => {
      console.log(`Processing childNode ${idx}:`, node.nodeType);
      
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        console.log('  -> Processing element:', element.tagName);
        processElement(element);
      } else if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        console.log('  -> Text node:', text?.substring(0, 50));
        if (text) {
          result.push({
            text,
            isBold: false,
            isItalic: false,
            isUnderline: false,
            isBullet: false,
            isNumbered: false,
            indentLevel: 0
          });
        }
      }
    });
    
    console.log('=== RESULT ===');
    console.log('Total items:', result.length);
    result.forEach((item, idx) => {
      console.log(`${idx}: bullet=${item.isBullet}, numbered=${item.isNumbered}, indent=${item.indentLevel}, text="${item.text?.substring(0, 50)}"`);
    });
    
    // Fallback: Wenn nichts gefunden wurde, nimm den kompletten Text
    if (result.length === 0) {
      console.log('FALLBACK: No items found, using full text');
      const text = tempDiv.textContent?.trim();
      if (text) {
        result.push({
          text,
          isBold: false,
          isItalic: false,
          isUnderline: false,
          isBullet: false,
          isNumbered: false,
          indentLevel: 0
        });
      }
    }
    
    return result;
  };

  // Helper für Linien
  const drawLine = (y: number, color: number[] = colors.border, width: number = 0.5) => {
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(width);
    doc.line(margin, y, pageWidth - margin, y);
  };

  // Header-Funktion für alle Seiten
  const drawPageHeader = (isFirstPage: boolean = false) => {
    const currentY = yPosition;
    yPosition = 15;

    if (isFirstPage) {
      // Erste Seite: Großer Header
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.text("Flugmodellsportverein Dingden e.V.", margin, yPosition);
      yPosition += 8;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
      doc.text("VEREINSPROTOKOLL", margin, yPosition);
      
      const createdText = new Date().toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      doc.text(`Erstellt: ${createdText}`, pageWidth - margin, yPosition, { align: "right" });
      
      yPosition += 10;
      drawLine(yPosition, colors.border, 0.5);
      yPosition += 15;
    } else {
      // Folgeseiten: Kompakter Header
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.text("Flugmodellsportverein Dingden e.V.", margin, yPosition);
      
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
      const shortTitle = data.title.length > 50 ? data.title.substring(0, 47) + "..." : data.title;
      doc.text(shortTitle, pageWidth - margin, yPosition, { align: "right" });
      
      yPosition += 8;
      drawLine(yPosition, colors.border, 0.3);
      yPosition += 12;
    }

    return yPosition;
  };

  // Check für neue Seite - MIT Header
  const checkNewPage = (neededSpace: number): boolean => {
    if (yPosition + neededSpace > pageHeight - footerHeight - 10) {
      doc.addPage();
      yPosition = drawPageHeader(false);
      return true;
    }
    return false;
  };

  // ============================================
  // SEITE 1: HEADER & INHALTSVERZEICHNIS
  // ============================================
  
  yPosition = drawPageHeader(true);

  // ============================================
  // TITEL - Prominent aber clean
  // ============================================
  
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  const titleLines = doc.splitTextToSize(data.title, maxWidth);
  doc.text(titleLines, margin, yPosition);
  yPosition += titleLines.length * 7 + 12;

  // ============================================
  // META-INFORMATIONEN - Grid Layout
  // ============================================
  
  const metaStartY = yPosition;
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
  
  // Linke Spalte - Labels
  let labelY = metaStartY;
  doc.text("DATUM", margin, labelY);
  labelY += 6;
  
  const startTime = data.startTime || data.time;
  const endTime = data.endTime;
  
  if (startTime || endTime) {
    doc.text("UHRZEIT", margin, labelY);
    labelY += 6;
  }
  
  if (data.location) {
    doc.text("ORT", margin, labelY);
    labelY += 6;
  }
  
  doc.text("SICHTBARKEIT", margin, labelY);
  labelY += 6;

  // Rechte Spalte - Werte
  doc.setFont("helvetica", "normal");
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  
  let valueY = metaStartY;
  const formattedDate = new Date(data.date).toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  doc.text(formattedDate, margin + 35, valueY);
  valueY += 6;
  
  if (startTime || endTime) {
    let timeText = '';
    if (startTime && endTime) {
      timeText = `${startTime} - ${endTime} Uhr`;
    } else if (startTime) {
      timeText = `${startTime} Uhr`;
    } else if (endTime) {
      timeText = `bis ${endTime} Uhr`;
    }
    doc.text(timeText, margin + 35, valueY);
    valueY += 6;
  }
  
  if (data.location) {
    doc.text(data.location, margin + 35, valueY);
    valueY += 6;
  }
  
  const permissionLabel = 
    data.permission === "members" ? "Alle Mitglieder" :
    data.permission === "board" ? "Nur Vorstand" :
    data.permission === "public" ? "Öffentlich" :
    data.permission === "board_auditors" ? "Vorstand & Kassenprüfer" :
    "Nur Administratoren";
  doc.text(permissionLabel, margin + 35, valueY);

  yPosition = Math.max(labelY, valueY) + 10;
  
  drawLine(yPosition, colors.border, 0.5);
  yPosition += 12;

  // ============================================
  // ANWESENDE PERSONEN - Kompakt
  // ============================================
  
  const attendanceMode = data.attendanceMode || "list";
  
  if (attendanceMode === "count" && (data.attendeesCount !== undefined && data.attendeesCount > 0)) {
    // Section Header
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.text("Anwesende Personen", margin, yPosition);
    yPosition += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.text(`Anzahl Anwesende: ${data.attendeesCount}`, margin + 3, yPosition);
    
    if (data.votingRightsCount !== undefined && data.votingRightsCount > 0) {
      yPosition += 5;
      doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
      doc.text(`davon Stimmberechtigte: ${data.votingRightsCount}`, margin + 3, yPosition);
    }

    yPosition += 10;
    
  } else if (data.attendees.length > 0 && data.attendees.length <= 8) {
    // Kompakte Liste für max 8 Personen
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.text("Anwesende Personen", margin, yPosition);
    yPosition += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    
    data.attendees.forEach((attendee) => {
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      const attendeeText = attendee.role ? `${attendee.name} (${attendee.role})` : attendee.name;
      doc.text(`• ${attendeeText}`, margin + 3, yPosition);
      yPosition += 4.5;
    });

    yPosition += 6;
  } else if (data.attendees.length > 8) {
    // Bei vielen Teilnehmern nur Anzahl zeigen
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.text("Anwesende Personen", margin, yPosition);
    yPosition += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.text(`${data.attendees.length} Personen (siehe Seite 2)`, margin + 3, yPosition);
    yPosition += 10;
  }

  drawLine(yPosition, colors.border, 0.5);
  yPosition += 12;

  // ============================================
  // INHALTSVERZEICHNIS
  // ============================================
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text("Tagesordnung", margin, yPosition);
  yPosition += 10;

  data.topics.forEach((topic, index) => {
    checkNewPage(8);

    // Hauptpunkt
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    const topNum = `TOP ${index + 1}`;
    doc.text(topNum, margin, yPosition);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    const titleMaxWidth = maxWidth - 25;
    const topicTitleLines = doc.splitTextToSize(topic.title, titleMaxWidth);
    doc.text(topicTitleLines, margin + 20, yPosition);
    yPosition += Math.max(topicTitleLines.length * 4.5, 5);

    // Unterpunkte
    if (topic.subTopics && topic.subTopics.length > 0) {
      topic.subTopics.forEach((subTopic, subIndex) => {
        checkNewPage(5);

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
        const subNum = `${index + 1}.${subIndex + 1}`;
        doc.text(subNum, margin + 24, yPosition);
        
        const subTitleLines = doc.splitTextToSize(subTopic.title, titleMaxWidth - 10);
        doc.text(subTitleLines, margin + 34, yPosition);
        yPosition += Math.max(subTitleLines.length * 4, 4.5);
      });
    }

    yPosition += 3;
  });

  // ============================================
  // SEITE 2+: DETAILLIERTE INHALTE
  // ============================================
  
  doc.addPage();
  yPosition = drawPageHeader(false);

  // Bei vielen Teilnehmern: Komplette Liste auf Seite 2
  if (attendanceMode === "list" && data.attendees.length > 8) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.text("Anwesende Personen", margin, yPosition);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
    doc.text(`${data.attendees.length} ${data.attendees.length === 1 ? 'Person' : 'Personen'}`, pageWidth - margin, yPosition, { align: "right" });
    
    yPosition += 8;

    // Tabellen-Header mit Hintergrund
    doc.setFillColor(colors.background[0], colors.background[1], colors.background[2]);
    doc.rect(margin, yPosition, maxWidth, 7, "F");
    
    drawLine(yPosition, colors.border);
    drawLine(yPosition + 7, colors.border);

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
    doc.text("NAME", margin + 2, yPosition + 4.5);
    doc.text("ROLLE / FUNKTION", margin + (maxWidth * 0.55), yPosition + 4.5);

    yPosition += 7;

    // Tabellen-Zeilen
    data.attendees.forEach((attendee, index) => {
      checkNewPage(6);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      doc.text(attendee.name, margin + 2, yPosition + 4);
      
      if (attendee.role) {
        doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
        doc.text(attendee.role, margin + (maxWidth * 0.55), yPosition + 4);
      }

      yPosition += 6;
      
      // Dünne Trennlinie zwischen Zeilen
      if (index < data.attendees.length - 1) {
        drawLine(yPosition, colors.border, 0.3);
      }
    });

    drawLine(yPosition, colors.border);
    yPosition += 15;
    
    drawLine(yPosition, colors.border, 0.5);
    yPosition += 12;
  }

  // ============================================
  // TAGESORDNUNGSPUNKTE DETAILLIERT MIT MARKDOWN
  // ============================================
  
  if (data.topics.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.text("Tagesordnungspunkte", margin, yPosition);
    yPosition += 10;

    data.topics.forEach((topic, index) => {
      const hasContent = topic.content && topic.content.trim();
      const hasSubTopics = topic.subTopics && topic.subTopics.length > 0;
      
      checkNewPage(20);

      // TOP Nummer mit Akzent-Farbe
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      const topNumber = `TOP ${index + 1}`;
      doc.text(topNumber, margin, yPosition);

      // TOP Titel
      const topNumberWidth = doc.getTextWidth(topNumber);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      const topTitleLines = doc.splitTextToSize(topic.title, maxWidth - topNumberWidth - 5);
      doc.text(topTitleLines, margin + topNumberWidth + 3, yPosition);

      yPosition += Math.max(topTitleLines.length * 4.5, 5) + 3;

      // Hauptinhalt mit HTML-Support
      if (hasContent) {
        const processedLines = htmlToFormattedText(topic.content);

        processedLines.forEach(line => {
          checkNewPage(5);
          
          // Tabellen-Zeile
          if (line.isTableRow && line.tableCells) {
            const cellWidth = maxWidth / line.tableCells.length;
            let xPos = margin + 5;
            
            doc.setFontSize(8.5);
            doc.setFont("helvetica", "normal");
            doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
            
            line.tableCells.forEach((cell, idx) => {
              const cellText = doc.splitTextToSize(cell, cellWidth - 4);
              doc.text(cellText, xPos + 2, yPosition + 3);
              doc.rect(xPos, yPosition, cellWidth, 6);
              xPos += cellWidth;
            });
            
            yPosition += 6;
            return;
          }
          
          if (line.text.trim()) {
            doc.setFontSize(9.5);
            
            // Formatierung anwenden
            let fontStyle = "normal";
            if (line.isBold && line.isItalic) fontStyle = "bolditalic";
            else if (line.isBold) fontStyle = "bold";
            else if (line.isItalic) fontStyle = "italic";
            
            doc.setFont("helvetica", fontStyle);
            doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);

            // Berechne Einrückung basierend auf indentLevel
            const indentLevel = line.indentLevel || 0;
            const baseOffset = margin + 5;
            const indentOffset = indentLevel * 5; // 5mm pro Einrückungsebene
            const bulletOffset = (line.isBullet || line.isNumbered) ? 3 : 0;
            const xOffset = baseOffset + indentOffset + bulletOffset;
            
            if (line.isBullet) {
              doc.text("•", baseOffset + indentOffset, yPosition);
            }
            
            const availableWidth = maxWidth - indentOffset - (line.isBullet || line.isNumbered ? 8 : 5);
            const wrappedLines = doc.splitTextToSize(line.text, availableWidth);
            doc.text(wrappedLines, xOffset, yPosition);
            yPosition += wrappedLines.length * 4;
          } else {
            yPosition += 3;
          }
        });

        yPosition += 4;
      }

      // Unterpunkte mit Markdown-Support
      if (hasSubTopics) {
        topic.subTopics.forEach((subTopic, subIndex) => {
          checkNewPage(12);

          // Unterpunkt-Nummer
          doc.setFontSize(9);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
          const subNumber = `${index + 1}.${subIndex + 1}`;
          doc.text(subNumber, margin + 5, yPosition);

          // Unterpunkt-Titel
          const subNumberWidth = doc.getTextWidth(subNumber);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
          const subTitleLines = doc.splitTextToSize(subTopic.title, maxWidth - subNumberWidth - 12);
          doc.text(subTitleLines, margin + 5 + subNumberWidth + 3, yPosition);

          yPosition += Math.max(subTitleLines.length * 4, 4.5) + 2;

          // Unterpunkt-Inhalt mit HTML-Support
          if (subTopic.content && subTopic.content.trim()) {
            const processedLines = htmlToFormattedText(subTopic.content);

            processedLines.forEach(line => {
              checkNewPage(5);
              
              // Tabellen-Zeile
              if (line.isTableRow && line.tableCells) {
                const cellWidth = (maxWidth - 15) / line.tableCells.length;
                let xPos = margin + 10;
                
                doc.setFontSize(8);
                doc.setFont("helvetica", "normal");
                doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
                
                line.tableCells.forEach((cell, idx) => {
                  const cellText = doc.splitTextToSize(cell, cellWidth - 4);
                  doc.text(cellText, xPos + 2, yPosition + 3);
                  doc.rect(xPos, yPosition, cellWidth, 6);
                  xPos += cellWidth;
                });
                
                yPosition += 6;
                return;
              }
              
              if (line.text.trim()) {
                doc.setFontSize(9);
                
                // Formatierung anwenden
                let fontStyle = "normal";
                if (line.isBold && line.isItalic) fontStyle = "bolditalic";
                else if (line.isBold) fontStyle = "bold";
                else if (line.isItalic) fontStyle = "italic";
                
                doc.setFont("helvetica", fontStyle);
                doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);

                // Berechne Einrückung basierend auf indentLevel (für Sub-Topics)
                const indentLevel = line.indentLevel || 0;
                const baseOffset = margin + 10;
                const indentOffset = indentLevel * 5; // 5mm pro Einrückungsebene
                const bulletOffset = (line.isBullet || line.isNumbered) ? 3 : 0;
                const xOffset = baseOffset + indentOffset + bulletOffset;
                
                if (line.isBullet) {
                  doc.text("•", baseOffset + indentOffset, yPosition);
                }
                
                const availableWidth = maxWidth - 12 - indentOffset - (line.isBullet || line.isNumbered ? 3 : 0);
                const wrappedLines = doc.splitTextToSize(line.text, availableWidth);
                doc.text(wrappedLines, xOffset, yPosition);
                yPosition += wrappedLines.length * 3.8;
              } else {
                yPosition += 3;
              }
            });
          }

          yPosition += 4;
        });

        yPosition += 2;
      }

      // Trennlinie nach jedem TOP (außer dem letzten)
      if (index < data.topics.length - 1) {
        drawLine(yPosition, colors.border, 0.3);
        yPosition += 7;
      }
    });

    yPosition += 8;
  }

  // ============================================
  // ANHÄNGE - Kompakt und Clean
  // ============================================
  
  if (data.attachments.length > 0) {
    checkNewPage(30);

    // Section Header
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.text("Anhänge", margin, yPosition);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
    doc.text(`${data.attachments.length} ${data.attachments.length === 1 ? 'Datei' : 'Dateien'}`, pageWidth - margin, yPosition, { align: "right" });
    
    yPosition += 8;

    data.attachments.forEach((attachment, index) => {
      checkNewPage(7);

      const sizeText = formatFileSize(attachment.size);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      
      // Nummer
      doc.text(`${index + 1}.`, margin, yPosition);
      
      // Dateiname
      const maxNameWidth = maxWidth - 30;
      const fileName = doc.splitTextToSize(attachment.name, maxNameWidth);
      doc.text(fileName, margin + 5, yPosition);

      // Größe - Rechts
      doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
      doc.text(sizeText, pageWidth - margin, yPosition, { align: "right" });

      yPosition += 6;
    });

    yPosition += 5;
  }

  // ============================================
  // FOOTER - Professional & Clean
  // ============================================
  
  const pageCount = doc.getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    const footerY = pageHeight - 15;
    
    // Dünne Linie über Footer
    drawLine(footerY - 3, colors.border, 0.3);

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(colors.textLight[0], colors.textLight[1], colors.textLight[2]);
    
    // Links - Vereinsname
    doc.text("Flugmodellsportverein Dingden e.V.", margin, footerY + 2);
    
    // Mitte - Dokumenttitel (gekürzt)
    const shortTitle = data.title.length > 40 ? data.title.substring(0, 37) + "..." : data.title;
    doc.text(shortTitle, pageWidth / 2, footerY + 2, { align: "center" });
    
    // Rechts - Seitenzahl
    doc.text(`Seite ${i} von ${pageCount}`, pageWidth - margin, footerY + 2, { align: "right" });
  }

  // Download
  const fileName = `${data.title.replace(/[^a-zA-Z0-9äöüÄÖÜß\s-]/g, '').substring(0, 50)}.pdf`;
  doc.save(fileName);
};

// Helper: Dateigrößen formatieren
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};
