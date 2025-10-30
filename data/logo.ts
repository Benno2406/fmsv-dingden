// FMSV Dingden Logo - Echtes Vereinslogo
// Offizielles Logo des Flugmodellsportvereins Dingden e.V. 1978

import fmsvLogo from 'figma:asset/fcdbaa1b2d506964b3605b4891893e87293537c7.png';

// Echtes Vereinslogo für PDF und Web-Nutzung
export const FMSV_LOGO_OFFICIAL = fmsvLogo;

// SVG-Version für Web-Nutzung (Fallback)
export const FMSV_LOGO_BASE64 = `data:image/svg+xml;base64,${btoa(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#030213;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1a1a2e;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Hintergrund Kreis -->
  <circle cx="100" cy="100" r="95" fill="url(#grad1)" stroke="#ffffff" stroke-width="3"/>
  
  <!-- Stilisiertes Flugzeug -->
  <g transform="translate(100, 80)">
    <!-- Rumpf -->
    <ellipse cx="0" cy="0" rx="8" ry="25" fill="#ffffff"/>
    
    <!-- Flügel -->
    <path d="M -45 -5 L -8 -8 L -8 8 L -45 5 Z" fill="#ffffff"/>
    <path d="M 45 -5 L 8 -8 L 8 8 L 45 5 Z" fill="#ffffff"/>
    
    <!-- Leitwerk -->
    <path d="M -15 15 L -5 15 L 0 30 L -15 20 Z" fill="#ffffff"/>
    <path d="M 15 15 L 5 15 L 0 30 L 15 20 Z" fill="#ffffff"/>
    
    <!-- Propeller -->
    <circle cx="0" cy="-28" r="3" fill="#ef4444"/>
    <line x1="-5" y1="-28" x2="5" y2="-28" stroke="#ef4444" stroke-width="2"/>
  </g>
  
  <!-- Text FMSV -->
  <text x="100" y="140" font-family="Arial, sans-serif" font-size="32" font-weight="bold" 
        fill="#ffffff" text-anchor="middle">FMSV</text>
  
  <!-- Text Dingden -->
  <text x="100" y="165" font-family="Arial, sans-serif" font-size="16" 
        fill="#ffffff" text-anchor="middle">Dingden</text>
</svg>
`)}`;

// Alternative: Einfacheres kreisförmiges Logo nur mit Text (SVG)
export const FMSV_LOGO_SIMPLE = `data:image/svg+xml;base64,${btoa(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="48" fill="#030213" stroke="#ffffff" stroke-width="2"/>
  <text x="50" y="58" font-family="Arial, sans-serif" font-size="28" font-weight="bold" 
        fill="#ffffff" text-anchor="middle">FMSV</text>
</svg>
`)}`;
