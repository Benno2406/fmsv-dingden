import { cn } from './ui/utils';

interface HtmlPreviewProps {
  content: string;
  className?: string;
}

export function HtmlPreview({ content, className }: HtmlPreviewProps) {
  // Leerer Inhalt
  if (!content || content.trim() === '' || content === '<p><br></p>') {
    return null;
  }

  return (
    <div
      className={cn('rich-text-editor-content', className)}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
