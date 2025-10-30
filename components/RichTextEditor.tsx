import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Table as TableIcon,
  Undo,
  Redo,
  Indent,
  Outdent,
} from 'lucide-react';
import { cn } from './ui/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Schreibe hier...',
  className,
  minHeight = '150px',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

  // Initiales Setzen des Contents
  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      editorRef.current.innerHTML = content || '';
      setIsInitialized(true);
    }
  }, []);

  // Updates des Contents
  useEffect(() => {
    if (editorRef.current && isInitialized) {
      const currentContent = editorRef.current.innerHTML;
      const newContent = content || '';
      
      // Nur aktualisieren, wenn der Inhalt sich wirklich geändert hat und der Editor nicht fokussiert ist
      if (currentContent !== newContent && document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = newContent;
      }
    }
  }, [content, isInitialized]);

  const handleInput = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      onChange(newContent);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const insertTable = (rows: number, cols: number) => {
    if (!editorRef.current) return;
    
    let tableHTML = '<table style="width: 100%; border-collapse: collapse; margin: 10px 0;">';
    
    // Header-Zeile (zusätzlich zu den gewählten Zeilen)
    tableHTML += '<tr>';
    for (let j = 0; j < cols; j++) {
      tableHTML += `<th style="border: 1px solid #e5e7eb; padding: 8px;">Spalte ${j + 1}</th>`;
    }
    tableHTML += '</tr>';
    
    // Datenzeilen (so viele wie gewählt wurden)
    for (let i = 0; i < rows; i++) {
      tableHTML += '<tr>';
      for (let j = 0; j < cols; j++) {
        tableHTML += `<td style="border: 1px solid #e5e7eb; padding: 8px;"></td>`;
      }
      tableHTML += '</tr>';
    }
    tableHTML += '</table><p><br></p>';
    
    // Fokus setzen und Selection wiederherstellen
    editorRef.current.focus();
    
    // Sicherstellen, dass der Editor fokussiert ist
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      // Wenn eine Selection existiert, nutzen wir execCommand
      document.execCommand('insertHTML', false, tableHTML);
    } else {
      // Fallback: Direkt am Ende einfügen
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false); // Am Ende positionieren
      selection?.removeAllRanges();
      selection?.addRange(range);
      document.execCommand('insertHTML', false, tableHTML);
    }
    
    handleInput();
  };

  const handleInsertTable = () => {
    if (tableRows > 0 && tableCols > 0) {
      const rows = tableRows;
      const cols = tableCols;
      
      // Dialog schließen
      setShowTableDialog(false);
      
      // Reset zu Standardwerten
      setTableRows(3);
      setTableCols(3);
      setHoveredCell(null);
      
      // Tabelle mit kleinem Delay einfügen, damit Dialog Zeit hat sich zu schließen
      setTimeout(() => {
        insertTable(rows, cols);
      }, 100);
    }
  };

  const handleCellHover = (row: number, col: number) => {
    setHoveredCell({ row, col });
    setTableRows(row + 1);
    setTableCols(col + 1);
  };

  const queryCommandState = (command: string): boolean => {
    return document.queryCommandState(command);
  };

  return (
    <>
      <div className={cn('border rounded-md bg-background', className)}>
        {/* Toolbar */}
        <div className="border-b p-2 flex flex-wrap items-center gap-1 bg-muted/30">
        {/* Undo/Redo */}
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => execCommand('undo')}
          className="h-8 w-8 p-0"
          title="Rückgängig"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => execCommand('redo')}
          className="h-8 w-8 p-0"
          title="Wiederholen"
        >
          <Redo className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Text Formatting */}
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => execCommand('bold')}
          className={cn(
            'h-8 w-8 p-0',
            queryCommandState('bold') && 'bg-muted'
          )}
          title="Fett"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => execCommand('italic')}
          className={cn(
            'h-8 w-8 p-0',
            queryCommandState('italic') && 'bg-muted'
          )}
          title="Kursiv"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => execCommand('underline')}
          className={cn(
            'h-8 w-8 p-0',
            queryCommandState('underline') && 'bg-muted'
          )}
          title="Unterstrichen"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Lists */}
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className={cn(
            'h-8 w-8 p-0',
            queryCommandState('insertUnorderedList') && 'bg-muted'
          )}
          title="Aufzählungsliste"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          className={cn(
            'h-8 w-8 p-0',
            queryCommandState('insertOrderedList') && 'bg-muted'
          )}
          title="Nummerierte Liste"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        {/* Indent/Outdent */}
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => execCommand('outdent')}
          className="h-8 w-8 p-0"
          title="Ausrücken"
        >
          <Outdent className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => execCommand('indent')}
          className="h-8 w-8 p-0"
          title="Einrücken"
        >
          <Indent className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Table */}
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => setShowTableDialog(true)}
          className="h-8 w-8 p-0"
          title="Tabelle einfügen"
        >
          <TableIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor Content */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          'rich-text-editor-content p-3 outline-none focus:outline-none',
          !content && !isFocused && 'empty'
        )}
        style={{ minHeight }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
    </div>

    {/* Table Dialog */}
    <Dialog 
      open={showTableDialog} 
      onOpenChange={(open) => {
        setShowTableDialog(open);
        if (!open) {
          setTableRows(3);
          setTableCols(3);
          setHoveredCell(null);
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TableIcon className="h-5 w-5" />
            Tabelle einfügen
          </DialogTitle>
          <DialogDescription>
            Bewege die Maus über das Raster oder gib die Werte manuell ein.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Visual Grid Selector */}
          <div className="flex flex-col items-center gap-3">
            <div 
              className="inline-grid gap-1 p-3 bg-muted/30 rounded-lg border-2 border-muted"
              style={{ 
                gridTemplateColumns: 'repeat(10, 1fr)',
                gridTemplateRows: 'repeat(10, 1fr)',
              }}
              onMouseLeave={() => setHoveredCell(null)}
            >
              {Array.from({ length: 100 }, (_, index) => {
                const row = Math.floor(index / 10);
                const col = index % 10;
                const isHovered = hoveredCell && row <= hoveredCell.row && col <= hoveredCell.col;
                
                return (
                  <div
                    key={index}
                    className={cn(
                      'w-6 h-6 border rounded transition-all cursor-pointer',
                      isHovered 
                        ? 'bg-primary border-primary scale-95 shadow-sm' 
                        : 'bg-background border-border/50 hover:border-primary/40 hover:bg-primary/5'
                    )}
                    onMouseEnter={() => handleCellHover(row, col)}
                    onClick={handleInsertTable}
                  />
                );
              })}
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-md">
              <TableIcon className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-primary">
                {tableRows} Zeilen × {tableCols} Spalten
              </p>
            </div>
          </div>

          {/* Manual Input */}
          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="table-rows" className="text-right">
                Zeilen
              </Label>
              <Input
                id="table-rows"
                type="number"
                min="1"
                max="20"
                value={tableRows}
                onChange={(e) => setTableRows(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="table-cols" className="text-right">
                Spalten
              </Label>
              <Input
                id="table-cols"
                type="number"
                min="1"
                max="10"
                value={tableCols}
                onChange={(e) => setTableCols(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                className="col-span-3"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowTableDialog(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleInsertTable}>
            <TableIcon className="h-4 w-4 mr-2" />
            Tabelle einfügen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
