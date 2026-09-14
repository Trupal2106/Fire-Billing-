/**
 * Bill design assets and vector drawing helpers for Patel Fire / Fire Care Safety Solution Invoices
 */

/**
 * Returns a high-res data URL of the Fire Safety Shield Emblem Logo
 */
export function getFireShieldLogoDataUrl(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
    <defs>
      <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ef4444" />
        <stop offset="50%" stop-color="#dc2626" />
        <stop offset="100%" stop-color="#991b1b" />
      </linearGradient>
      <linearGradient id="flameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="#f59e0b" />
        <stop offset="50%" stop-color="#ef4444" />
        <stop offset="100%" stop-color="#b91c1c" />
      </linearGradient>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fef08a" />
        <stop offset="100%" stop-color="#f59e0b" />
      </linearGradient>
    </defs>
    
    <!-- Outer Shield Crest -->
    <path d="M100 8 C145 8, 185 24, 185 58 C185 125, 140 175, 100 192 C60 175, 15 125, 15 58 C15 24, 55 8, 100 8 Z" 
          fill="url(#shieldGrad)" stroke="#7f1d1d" stroke-width="4" />
    
    <!-- Inner Gold Ring Border -->
    <path d="M100 18 C138 18, 172 32, 172 62 C172 120, 132 163, 100 178 C68 163, 28 120, 28 62 C28 32, 62 18, 100 18 Z" 
          fill="#ffffff" stroke="url(#goldGrad)" stroke-width="3" />
          
    <!-- Core Red Shield -->
    <path d="M100 28 C132 28, 160 40, 160 65 C160 114, 126 151, 100 164 C74 151, 40 114, 40 65 C40 40, 68 28, 100 28 Z" 
          fill="url(#shieldGrad)" />

    <!-- Stylized Fire Flame -->
    <path d="M100 50 C105 70, 120 78, 125 96 C130 114, 120 134, 100 144 C80 134, 70 114, 75 96 C80 78, 95 70, 100 50 Z" 
          fill="url(#goldGrad)" opacity="0.95" />
    <path d="M100 70 C103 84, 112 90, 115 102 C118 114, 112 126, 100 132 C88 126, 82 114, 85 102 C88 90, 97 84, 100 70 Z" 
          fill="#ffffff" />
          
    <!-- House / Safety Asset Silhouette -->
    <path d="M100 92 L120 110 L114 110 L114 130 L86 130 L86 110 L80 110 Z" fill="#b91c1c" />
    <rect x="94" y="116" width="12" height="14" fill="#ffffff" rx="1" />
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Returns a high-res data URL of the Authorised Signatory Round Stamp Seal
 */
export function getAuthorisedStampDataUrl(companyName: string = 'FIRE SAFETY SOLUTIONS'): string {
  const cleanName = (companyName || 'FIRE SAFETY SOLUTIONS').toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
    <defs>
      <path id="stampCircleTop" d="M 30,100 A 70,70 0 1,1 170,100" />
      <path id="stampCircleBottom" d="M 170,100 A 70,70 0 0,1 30,100" />
    </defs>
    <!-- Outer Double Border with Slight Inky Texture -->
    <circle cx="100" cy="100" r="92" fill="none" stroke="#1d4ed8" stroke-width="3" stroke-dasharray="800" opacity="0.88" />
    <circle cx="100" cy="100" r="84" fill="none" stroke="#1d4ed8" stroke-width="1.5" opacity="0.88" />
    <circle cx="100" cy="100" r="58" fill="none" stroke="#1d4ed8" stroke-width="1.5" stroke-dasharray="3,2" opacity="0.88" />

    <!-- Curved Text Top -->
    <text font-family="Arial, sans-serif" font-size="11" font-weight="900" fill="#1d4ed8" letter-spacing="2.5" opacity="0.9">
      <textPath href="#stampCircleTop" startOffset="50%" text-anchor="middle">
        ${cleanName}
      </textPath>
    </text>

    <!-- Curved Text Bottom -->
    <text font-family="Arial, sans-serif" font-size="10.5" font-weight="800" fill="#1d4ed8" letter-spacing="3" opacity="0.9">
      <textPath href="#stampCircleBottom" startOffset="50%" text-anchor="middle">
        ★ CERTIFIED &amp; APPROVED ★
      </textPath>
    </text>

    <!-- Center Emblem -->
    <g transform="translate(76, 76) scale(0.24)">
      <path d="M100 8 C145 8, 185 24, 185 58 C185 125, 140 175, 100 192 C60 175, 15 125, 15 58 C15 24, 55 8, 100 8 Z" fill="#1d4ed8" />
      <path d="M100 45 L116 80 L154 84 L126 110 L134 148 L100 128 L66 148 L74 110 L46 84 L84 80 Z" fill="#ffffff" />
    </g>
    
    <!-- Signature Line Cross -->
    <line x1="45" y1="100" x2="68" y2="100" stroke="#1d4ed8" stroke-width="1.5" opacity="0.8" />
    <line x1="132" y1="100" x2="155" y2="100" stroke="#1d4ed8" stroke-width="1.5" opacity="0.8" />
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Converts an SVG Data URL to a high-res PNG Data URL for reliable jsPDF embedding
 */
export function svgToPngDataUrl(svgDataUrl: string, width: number = 300, height: number = 300): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(svgDataUrl);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/png'));
          return;
        }
      } catch (e) {
        console.error('Canvas rasterization error:', e);
      }
      resolve(svgDataUrl);
    };
    img.onerror = () => resolve(svgDataUrl);
    img.src = svgDataUrl;
  });
}

