/// <reference types="vite/client" />

// Vite Environment
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly DEV?: boolean;
  readonly PROD?: boolean;
  readonly MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Motion/React (Framer Motion nachfolger)
declare module 'motion/react' {
  import * as React from 'react';

  export interface MotionProps {
    initial?: any;
    animate?: any;
    exit?: any;
    transition?: any;
    whileHover?: any;
    whileTap?: any;
    whileFocus?: any;
    whileInView?: any;
    drag?: boolean | 'x' | 'y';
    dragConstraints?: any;
    dragElastic?: number;
    dragMomentum?: boolean;
    layout?: boolean | string;
    layoutId?: string;
    style?: React.CSSProperties;
    className?: string;
    children?: React.ReactNode;
    [key: string]: any;
  }

  export const motion: {
    div: React.FC<MotionProps & React.HTMLAttributes<HTMLDivElement>>;
    span: React.FC<MotionProps & React.HTMLAttributes<HTMLSpanElement>>;
    p: React.FC<MotionProps & React.HTMLAttributes<HTMLParagraphElement>>;
    button: React.FC<MotionProps & React.ButtonHTMLAttributes<HTMLButtonElement>>;
    a: React.FC<MotionProps & React.AnchorHTMLAttributes<HTMLAnchorElement>>;
    img: React.FC<MotionProps & React.ImgHTMLAttributes<HTMLImageElement>>;
    ul: React.FC<MotionProps & React.HTMLAttributes<HTMLUListElement>>;
    li: React.FC<MotionProps & React.LiHTMLAttributes<HTMLLIElement>>;
    h1: React.FC<MotionProps & React.HTMLAttributes<HTMLHeadingElement>>;
    h2: React.FC<MotionProps & React.HTMLAttributes<HTMLHeadingElement>>;
    h3: React.FC<MotionProps & React.HTMLAttributes<HTMLHeadingElement>>;
    h4: React.FC<MotionProps & React.HTMLAttributes<HTMLHeadingElement>>;
    h5: React.FC<MotionProps & React.HTMLAttributes<HTMLHeadingElement>>;
    h6: React.FC<MotionProps & React.HTMLAttributes<HTMLHeadingElement>>;
    section: React.FC<MotionProps & React.HTMLAttributes<HTMLElement>>;
    article: React.FC<MotionProps & React.HTMLAttributes<HTMLElement>>;
    nav: React.FC<MotionProps & React.HTMLAttributes<HTMLElement>>;
    header: React.FC<MotionProps & React.HTMLAttributes<HTMLElement>>;
    footer: React.FC<MotionProps & React.HTMLAttributes<HTMLElement>>;
    [key: string]: any;
  };

  export const AnimatePresence: React.FC<{
    children: React.ReactNode;
    mode?: 'sync' | 'popLayout' | 'wait';
    initial?: boolean;
    [key: string]: any;
  }>;

  export function useAnimation(): any;
  export function useMotionValue(initial: any): any;
  export function useTransform(...args: any[]): any;
  export function useSpring(...args: any[]): any;
}

// jsPDF AutoTable
declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';

  export interface RowInput {
    [key: string]: any;
  }

  export interface AutoTableOptions {
    head?: RowInput[];
    body?: RowInput[];
    foot?: RowInput[];
    startY?: number;
    margin?: number | { top?: number; right?: number; bottom?: number; left?: number };
    pageBreak?: 'auto' | 'avoid' | 'always';
    rowPageBreak?: 'auto' | 'avoid';
    tableWidth?: 'auto' | 'wrap' | number;
    showHead?: 'everyPage' | 'firstPage' | 'never';
    showFoot?: 'everyPage' | 'lastPage' | 'never';
    theme?: 'striped' | 'grid' | 'plain';
    styles?: Partial<Styles>;
    headStyles?: Partial<Styles>;
    bodyStyles?: Partial<Styles>;
    footStyles?: Partial<Styles>;
    alternateRowStyles?: Partial<Styles>;
    columnStyles?: { [key: string]: Partial<Styles> };
    didDrawPage?: (data: any) => void;
    didDrawCell?: (data: any) => void;
    willDrawCell?: (data: any) => void;
    didParseCell?: (data: any) => void;
    [key: string]: any;
  }

  export interface Styles {
    font?: string;
    fontStyle?: 'normal' | 'bold' | 'italic' | 'bolditalic';
    overflow?: 'linebreak' | 'ellipsize' | 'visible' | 'hidden';
    fillColor?: number | [number, number, number] | string | false;
    textColor?: number | [number, number, number] | string;
    cellPadding?: number | { top?: number; right?: number; bottom?: number; left?: number };
    fontSize?: number;
    lineColor?: number | [number, number, number] | string;
    lineWidth?: number;
    cellWidth?: 'auto' | 'wrap' | number;
    minCellHeight?: number;
    minCellWidth?: number;
    halign?: 'left' | 'center' | 'right';
    valign?: 'top' | 'middle' | 'bottom';
    [key: string]: any;
  }

  export default function autoTable(doc: jsPDF, options: AutoTableOptions): jsPDF;

  export interface jsPDFWithAutoTable extends jsPDF {
    autoTable: (options: AutoTableOptions) => jsPDF;
    lastAutoTable?: {
      finalY: number;
      [key: string]: any;
    };
  }
}

// Extend jsPDF
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: import('jspdf-autotable').AutoTableOptions) => jsPDF;
    lastAutoTable?: {
      finalY: number;
      [key: string]: any;
    };
  }
}

// React Hook Form
declare module 'react-hook-form@7.55.0' {
  export * from 'react-hook-form';
}

// Window erweitern für globale Variablen
declare global {
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: any;
  }
}

export {};
