import React, { useState } from 'react';

interface SchoolLogoProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function SchoolLogo({ className = "w-20 h-20", style }: SchoolLogoProps) {
  // Candidate list of image URLs (handles physical uploads from user)
  const [candidates] = useState(() => {
    const base = import.meta.env.BASE_URL || '/';
    const cleanBase = base.endsWith('/') ? base : base + '/';
    return [
      `${cleanBase}logo_muhipa.png`,
      "https://drive.google.com/thumbnail?id=1bsOgQSN_qJNaTjYCgL59EDzGZKEK1TvI&sz=w1000",
    ];
  });
  const [imgIndex, setImgIndex] = useState(0);

  // If one of the image sources loaded successfully, render the image element
  if (imgIndex < candidates.length) {
    return (
      <img
        src={candidates[imgIndex]}
        alt="SMP Muhammadiyah Pakem Logo"
        className={className}
        style={style}
        referrerPolicy="no-referrer"
        onError={() => setImgIndex(prev => prev + 1)}
      />
    );
  }

  // --- MATHEMATICALLY PERFECT ROYAL BLUE & GOLD FALBACK VECTOR SVG ---
  const cx = 200;
  const cy = 202; 

  // Generate 12 outer crevices (valleys) symmetric across x = cx
  const getCrevice = (i: number, inner: boolean = false) => {
    const angles = [-105, -75, -45, -15, 15, 45, 75, 105, 135, 165, 195, 225];
    const angle = angles[i];
    const rad = (angle * Math.PI) / 180;
    
    let r = 155;
    if (inner) {
      if (i === 0 || i === 1) r = 143;
      else if (i === 2 || i === 11) r = 145;
      else if (i === 3 || i === 10) r = 176;
      else if (i === 4 || i === 9) r = 182;
      else if (i === 5 || i === 8) r = 148;
      else if (i === 6 || i === 7) r = 134;
    } else {
      if (i === 0 || i === 1) r = 153;
      else if (i === 2 || i === 11) r = 155;
      else if (i === 3 || i === 10) r = 186;
      else if (i === 4 || i === 9) r = 192;
      else if (i === 5 || i === 8) r = 158;
      else if (i === 6 || i === 7) r = 144;
    }

    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad)
    };
  };

  const crevices: {x: number, y: number}[] = [];
  const innerCrevices: {x: number, y: number}[] = [];
  for (let i = 0; i < 12; i++) {
    crevices.push(getCrevice(i, false));
    innerCrevices.push(getCrevice(i, true));
  }

  // Generate the 12-lobed outer shield path
  let outerShieldPath = `M ${crevices[1].x} ${crevices[1].y}`;
  outerShieldPath += ` A 50 50 0 0,1 ${crevices[2].x} ${crevices[2].y}`;
  outerShieldPath += ` A 45 45 0 0,1 ${crevices[3].x} ${crevices[3].y}`;
  outerShieldPath += ` A 55 55 0 0,1 ${crevices[4].x} ${crevices[4].y}`;
  outerShieldPath += ` A 55 55 0 0,1 ${crevices[5].x} ${crevices[5].y}`;
  outerShieldPath += ` A 45 45 0 0,1 ${crevices[6].x} ${crevices[6].y}`;
  outerShieldPath += ` A 54 54 0 0,1 ${crevices[7].x} ${crevices[7].y}`;
  outerShieldPath += ` A 45 45 0 0,1 ${crevices[8].x} ${crevices[8].y}`;
  outerShieldPath += ` A 55 55 0 0,1 ${crevices[9].x} ${crevices[9].y}`;
  outerShieldPath += ` A 55 55 0 0,1 ${crevices[10].x} ${crevices[10].y}`;
  outerShieldPath += ` A 45 45 0 0,1 ${crevices[11].x} ${crevices[11].y}`;
  outerShieldPath += ` A 50 50 0 0,1 ${crevices[0].x} ${crevices[0].y}`;
  outerShieldPath += ` C ${crevices[0].x + 3},${crevices[0].y - 18} 200,10 200,10 C 200,10 ${crevices[1].x - 3},${crevices[1].y - 18} ${crevices[1].x} ${crevices[1].y} Z`;

  // Generate the 12-lobed inner trace path
  let innerShieldPath = `M ${innerCrevices[1].x} ${innerCrevices[1].y}`;
  innerShieldPath += ` A 45 45 0 0,1 ${innerCrevices[2].x} ${innerCrevices[2].y}`;
  innerShieldPath += ` A 40 40 0 0,1 ${innerCrevices[3].x} ${innerCrevices[3].y}`;
  innerShieldPath += ` A 50 50 0 0,1 ${innerCrevices[4].x} ${innerCrevices[4].y}`;
  innerShieldPath += ` A 50 50 0 0,1 ${innerCrevices[5].x} ${innerCrevices[5].y}`;
  innerShieldPath += ` A 40 40 0 0,1 ${innerCrevices[6].x} ${innerCrevices[6].y}`;
  innerShieldPath += ` A 48 48 0 0,1 ${innerCrevices[7].x} ${innerCrevices[7].y}`;
  innerShieldPath += ` A 40 40 0 0,1 ${innerCrevices[8].x} ${innerCrevices[8].y}`;
  innerShieldPath += ` A 50 50 0 0,1 ${innerCrevices[9].x} ${innerCrevices[9].y}`;
  innerShieldPath += ` A 50 50 0 0,1 ${innerCrevices[10].x} ${innerCrevices[10].y}`;
  innerShieldPath += ` A 40 40 0 0,1 ${innerCrevices[11].x} ${innerCrevices[11].y}`;
  innerShieldPath += ` A 45 45 0 0,1 ${innerCrevices[0].x} ${innerCrevices[0].y}`;
  innerShieldPath += ` C ${innerCrevices[0].x + 3},${innerCrevices[0].y - 15} 200,20 200,20 C 200,20 ${innerCrevices[1].x - 3},${innerCrevices[1].y - 15} ${innerCrevices[1].x} ${innerCrevices[1].y} Z`;

  // Generate 24 sun rays centered at (cx, cy)
  const rays = [];
  for (let i = 0; i < 24; i++) {
    const angle = i * 15; // 360 / 24 = 15 degrees
    const rad = (angle * Math.PI) / 180;
    
    const isPrimary = i % 2 === 0;
    const isTopRay = angle === 270;
    const isLeftRightRay = angle === 0 || angle === 180;

    const rInner = 36;
    let rOuter = 88; // Default secondary ray length

    if (isPrimary) {
      rOuter = 108; // Default primary ray length
      if (isTopRay) {
        rOuter = 138; // Majestic vertical top ray
      } else if (isLeftRightRay) {
        rOuter = 126; // Prominent horizontal rays
      }
    }

    // Compress rays pointing downwards to leave clean breathing room for the jasmine buds
    const isDownward = angle > 45 && angle < 135;
    if (isDownward) {
      rOuter = isPrimary ? 80 : 66;
    }

    const x2 = cx + rOuter * Math.cos(rad);
    const y2 = cy + rOuter * Math.sin(rad);

    // Compute base points for a sharp triangle ray
    const baseWidthRad = ((isPrimary ? 2.5 : 1.6) * Math.PI) / 180;
    const xb1 = cx + rInner * Math.cos(rad - baseWidthRad);
    const yb1 = cy + rInner * Math.sin(rad - baseWidthRad);
    const xb2 = cx + rInner * Math.cos(rad + baseWidthRad);
    const yb2 = cy + rInner * Math.sin(rad + baseWidthRad);

    rays.push(
      <polygon
        key={i}
        points={`${xb1},${yb1} ${x2},${y2} ${xb2},${yb2}`}
        fill="#FEE21E"
      />
    );
  }

  // Helper to generate coordinates for perfect five-pointed stars
  const renderStarPoints = (scx: number, scy: number, r: number) => {
    const pts = [];
    for (let i = 0; i < 5; i++) {
      const outerAngle = (i * 72 - 90) * Math.PI / 180;
      const innerAngle = (i * 72 - 54) * Math.PI / 180;
      pts.push(`${scx + r * Math.cos(outerAngle)},${scy + r * Math.sin(outerAngle)}`);
      pts.push(`${scx + (r / 2.3) * Math.cos(innerAngle)},${scy + (r / 2.3) * Math.sin(innerAngle)}`);
    }
    return pts.join(' ');
  };

  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      style={style}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Curving path over the top half of the sun for SMP MUHAMMADIYAH PAKEM */}
        <path
          id="topCapPathRefined"
          d="M 68,198 A 132,132 0 0,1 332,198"
          fill="none"
        />
        {/* Curving path under the bottom half for YOGYAKARTA */}
        <path
          id="bottomCapPathRefined"
          d="M 66,206 A 134,134 0 0,0 334,206"
          fill="none"
        />
      </defs>

      {/* 12-lobed Scalloped Shield Background in deep Royal Blue & Gold border */}
      <path
        d={outerShieldPath}
        fill="#133285"
        stroke="#FEE21E"
        strokeWidth="6"
        strokeLinejoin="round"
      />

      {/* Inner outline mirroring the 12-lobed shape exactly */}
      <path
        d={innerShieldPath}
        fill="none"
        stroke="#FEE21E"
        strokeWidth="2.2"
      />

      {/* Sun Rays */}
      {rays}

      {/* Radiant Sun Circle base */}
      <circle cx={cx} cy={cy} r="35" fill="#FEE21E" />
      <circle cx={cx} cy={cy} r="29" fill="#133285" stroke="#FEE21E" strokeWidth="2" />

      {/* Arabic Calligraphy 'Muhammad' */}
      <g transform="translate(0, 5)" fill="#FEE21E">
        {/* Main calligraphy body 'Muhammad' */}
        <path d="M 224,191 
                 C 229,185 235,186 237,192 
                 C 239,198 234,205 225,203 
                 C 216,201 209,195 205,192 
                 C 201,189 195,189 189,194 
                 C 183,199 178,206 176,210
                 C 174,213 179,216 183,213
                 C 187,210 190,204 195,204
                 C 199,204 200,207 203,209
                 C 206,211 210,210 212,207
                 C 214,204 216,196 224,191 Z" />
        {/* Calligraphy mark 'Daal' */}
        <path d="M 183,196 
                 C 176,192 169,198 166,206 
                 C 166,214 172,220 178,218 
                 C 184,216 188,209 186,202 
                 C 184,196 184,196 183,196 Z" />
        {/* Calligraphy mark 'Shaddah' ّ */}
        <path d="M 197,180 
                 C 195,177 192,178 191,181 
                 C 190,184 192,186 194,185 
                 C 196,184 198,182 197,180 Z 
                 M 201,179
                 C 199,176 196,177 195,180 
                 C 194,183 196,185 198,184 
                 C 200,183 202,181 201,179 Z" />
      </g>

      {/* Symmetrical Jasmine buds drawing under the sun */}
      <rect x="195" y="244" width="3.5" height="42" fill="#FEE21E" />
      <rect x="201.5" y="244" width="3.5" height="42" fill="#FEE21E" />

      {/* Left jasmine flower bud */}
      <path
        d="M 194,253 
           C 181,248 149,253 144,275 
           C 139,297 169,303 184,303
           C 184,303 182,288 177,287
           C 172,286 161,293 161,281
           C 161,269 180,261 194,263 Z"
        fill="#FEE21E"
      />

      {/* Right jasmine flower bud (mirrored) */}
      <path
        d="M 206,253 
           C 219,248 251,253 256,275 
           C 261,297 231,303 216,303
           C 216,303 218,288 223,287
           C 228,286 239,293 239,281
           C 239,269 220,261 206,263 Z"
        fill="#FEE21E"
      />

      {/* Decorative stars aligned with bottom curves */}
      <polygon points={renderStarPoints(78, 285, 10.5)} fill="#FEE21E" />
      <polygon points={renderStarPoints(322, 285, 10.5)} fill="#FEE21E" />

      {/* Curved texts */}
      {/* Top curved text: SMP MUHAMMADIYAH PAKEM */}
      <text fontSize="14" fontWeight="800" fontFamily="Inter, system-ui, sans-serif" fill="#FEE21E" letterSpacing="3.2">
        <textPath href="#topCapPathRefined" startOffset="50%" textAnchor="middle">
          SMP MUHAMMADIYAH PAKEM
        </textPath>
      </text>

      {/* Straight Text "SLEMAN" */}
      <text 
        x="200" 
        y="312" 
        textAnchor="middle" 
        fill="#FEE21E" 
        fontSize="15" 
        fontWeight="800" 
        fontFamily="Inter, system-ui, sans-serif" 
        letterSpacing="1.2"
      >
        SLEMAN
      </text>

      {/* Bottom curved text: YOGYAKARTA */}
      <text fontSize="14" fontWeight="900" fontFamily="Inter, system-ui, sans-serif" fill="#FEE21E" letterSpacing="3.5">
        <textPath href="#bottomCapPathRefined" startOffset="50%" textAnchor="middle">
          YOGYAKARTA
        </textPath>
      </text>
    </svg>
  );
}

