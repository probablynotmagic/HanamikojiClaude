export const GEISHA = [
  { name: 'Kiku', v: 2, color: '#9b78cc', dark: '#4e3577', light: '#e6dbf5', item: 'Scroll' },
  { name: 'Akane', v: 2, color: '#d6513f', dark: '#7a1f1a', light: '#f8dcd6', item: 'Flute' },
  { name: 'Hana', v: 2, color: '#dcb43e', dark: '#7d6116', light: '#f7edcc', item: 'Tea Set' },
  { name: 'Aoi', v: 3, color: '#4a8bd0', dark: '#1d3f6b', light: '#d8e7f7', item: 'Parasol' },
  { name: 'Yuzu', v: 3, color: '#e88b3c', dark: '#7f4012', light: '#fae3cf', item: 'Shamisen' },
  { name: 'Midori', v: 4, color: '#56a862', dark: '#22502a', light: '#d9efdc', item: 'Fan' },
  { name: 'Sakura', v: 5, color: '#e783ad', dark: '#7c2e52', light: '#fbe0ec', item: 'Kanzashi' },
];

export function itemIcon(i) {
  const { color, dark } = GEISHA[i];
  switch (i) {
    case 0:
      return `
        <rect x="22" y="30" width="56" height="40" fill="#f7eed5" stroke="${dark}" stroke-width="2"/>
        <path d="M30 40h40M30 48h32M30 56h36M30 63h22" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
        <rect x="14" y="24" width="10" height="52" rx="4" fill="${dark}"/>
        <rect x="76" y="24" width="10" height="52" rx="4" fill="${dark}"/>
        <circle cx="19" cy="22" r="3" fill="#e9c55a"/><circle cx="81" cy="22" r="3" fill="#e9c55a"/>
        <path d="M81 76 q4 8 0 14" stroke="${color}" stroke-width="2" fill="none"/>`;
    case 1:
      return `
        <g transform="rotate(-35 50 50)">
          <rect x="6" y="44" width="88" height="12" rx="6" fill="#c99a5b" stroke="${dark}" stroke-width="2"/>
          ${[28, 40, 52, 64, 76].map((x) => `<circle cx="${x}" cy="50" r="2.6" fill="${dark}"/>`).join('')}
          <rect x="14" y="43" width="4" height="14" fill="${color}"/><rect x="84" y="43" width="4" height="14" fill="${color}"/>
        </g>
        <path d="M22 70 q-4 10 2 18" stroke="${color}" stroke-width="2" fill="none"/>
        <circle cx="24" cy="89" r="3" fill="${color}"/>`;
    case 2:
      return `
        <path d="M60 34 q6 -8 0 -16 M70 36 q6 -8 0 -16" stroke="#ffffff" stroke-opacity=".8" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M18 46 h64 a32 30 0 0 1 -64 0z" fill="${color}" stroke="${dark}" stroke-width="2.5"/>
        <ellipse cx="50" cy="46" rx="32" ry="6" fill="#5f8a3a" stroke="${dark}" stroke-width="2"/>
        <path d="M30 60 q20 10 40 0" stroke="#fff" stroke-opacity=".5" stroke-width="2" fill="none"/>
        <rect x="38" y="74" width="24" height="6" rx="2" fill="${dark}"/>`;
    case 3:
      return `
        <path d="M12 54 Q50 6 88 54 Q81 48 75 54 Q69 48 63 54 Q56 48 50 54 Q44 48 37 54 Q31 48 25 54 Q19 48 12 54Z" fill="${color}" stroke="${dark}" stroke-width="2.5"/>
        ${[12, 25, 37, 50, 63, 75, 88].map((x) => `<line x1="50" y1="21" x2="${x}" y2="54" stroke="${dark}" stroke-width="1.3" opacity=".7"/>`).join('')}
        <circle cx="50" cy="38" r="7" fill="#fff" opacity=".6"/>
        <path d="M50 54 V84 q0 7 -7 7" stroke="${dark}" stroke-width="4" fill="none" stroke-linecap="round"/>
        <circle cx="50" cy="19" r="3" fill="${dark}"/>`;
    case 4:
      return `
        <rect x="45" y="8" width="7" height="52" rx="2" fill="${dark}"/>
        <rect x="40" y="10" width="17" height="4" rx="2" fill="#e9c55a"/><rect x="40" y="18" width="17" height="4" rx="2" fill="#e9c55a"/>
        <rect x="30" y="54" width="38" height="36" rx="8" fill="#f6e8cb" stroke="${dark}" stroke-width="3"/>
        <rect x="34" y="58" width="30" height="28" rx="6" fill="none" stroke="${color}" stroke-width="2"/>
        <path d="M46.5 14 V84 M49 14 V84 M51.5 14 V84" stroke="#333" stroke-width=".7"/>
        <path d="M60 72 L84 60 L86 72 Z" fill="${color}" stroke="${dark}" stroke-width="2"/>`;
    case 5: {
      const ribs = [];
      for (let k = 0; k <= 8; k++) {
        const a = Math.PI * (1.15 + (0.7 * k) / 8);
        ribs.push(`<line x1="50" y1="82" x2="${50 + 48 * Math.cos(a)}" y2="${82 + 48 * Math.sin(a)}" stroke="${dark}" stroke-width="1.3"/>`);
      }
      return `
        <path d="M50 82 L${50 + 48 * Math.cos(Math.PI * 1.15)} ${82 + 48 * Math.sin(Math.PI * 1.15)} A48 48 0 0 1 ${50 + 48 * Math.cos(Math.PI * 1.85)} ${82 + 48 * Math.sin(Math.PI * 1.85)} Z" fill="${color}" stroke="${dark}" stroke-width="2.5"/>
        ${ribs.join('')}
        <circle cx="50" cy="52" r="10" fill="#f4d35e" opacity=".9"/>
        <path d="M24 54 q8 -6 14 0 q8 -6 14 0" stroke="#fff" stroke-width="2" fill="none" opacity=".7"/>
        <circle cx="50" cy="82" r="4" fill="${dark}"/>`;
    }
    case 6: {
      const petals = [0, 1, 2, 3, 4]
        .map((k) => {
          const a = (k * 2 * Math.PI) / 5 - Math.PI / 2;
          return `<ellipse cx="${62 + 10 * Math.cos(a)}" cy="${30 + 10 * Math.sin(a)}" rx="8" ry="8" fill="${color}" stroke="${dark}" stroke-width="1.5"/>`;
        })
        .join('');
      return `
        <line x1="24" y1="92" x2="60" y2="32" stroke="#d9b64a" stroke-width="4" stroke-linecap="round"/>
        ${petals}
        <circle cx="62" cy="30" r="5" fill="#f4d35e"/>
        <path d="M56 42 V66 M62 42 V72 M68 42 V62" stroke="#d9b64a" stroke-width="1.5"/>
        <circle cx="56" cy="68" r="3" fill="${color}"/><circle cx="62" cy="74" r="3" fill="${color}"/><circle cx="68" cy="64" r="3" fill="${color}"/>`;
    }
  }
  return '';
}

export function geishaSVG(i) {
  const g = GEISHA[i];
  const petals = [
    [20, 40], [118, 90], [30, 130], [112, 160], [60, 22], [126, 30],
  ]
    .map(([x, y]) => `<path d="M${x} ${y} q4 -6 8 0 q-4 6 -8 0z" fill="#fff" opacity=".35"/>`)
    .join('');
  return `<svg viewBox="0 0 140 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gbg${i}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${g.light}"/><stop offset="1" stop-color="${g.color}"/>
      </linearGradient>
      <pattern id="gpat${i}" width="16" height="16" patternUnits="userSpaceOnUse">
        <circle cx="8" cy="8" r="3" fill="${g.color}" opacity=".7"/>
        <circle cx="0" cy="0" r="2" fill="#fff" opacity=".35"/>
      </pattern>
      <clipPath id="gclip${i}"><rect width="140" height="200" rx="10"/></clipPath>
    </defs>
    <g clip-path="url(#gclip${i})">
      <rect width="140" height="200" fill="url(#gbg${i})"/>
      <circle cx="104" cy="52" r="30" fill="#fff" opacity=".35"/>
      ${petals}
      <path d="M0 150 Q35 135 70 150 T140 150 V200 H0Z" fill="${g.dark}" opacity=".25"/>
      <path d="M14 205 Q22 128 70 116 Q118 128 126 205 Z" fill="${g.dark}"/>
      <path d="M14 205 Q22 128 70 116 Q118 128 126 205 Z" fill="url(#gpat${i})"/>
      <rect x="30" y="160" width="80" height="18" fill="#f2cf6e"/>
      <path d="M30 166 h80 M30 172 h80" stroke="${g.dark}" stroke-width="1"/>
      <rect x="63" y="98" width="14" height="22" fill="#fbeee6"/>
      <path d="M54 118 L70 152 L86 118" stroke="#c4162a" stroke-width="7" fill="none"/>
      <path d="M54 118 L70 152 L86 118" stroke="#fff" stroke-width="3" fill="none"/>
      <ellipse cx="70" cy="40" rx="28" ry="17" fill="#1b1420"/>
      <circle cx="45" cy="58" r="12" fill="#1b1420"/>
      <circle cx="95" cy="58" r="12" fill="#1b1420"/>
      <ellipse cx="70" cy="86" rx="21" ry="25" fill="#fdf3ec"/>
      <path d="M48 88 Q44 52 70 52 Q96 52 92 88 Q86 64 70 62 Q54 64 48 88Z" fill="#1b1420"/>
      <path d="M58 87 q5 3 10 0 M72 87 q5 3 10 0" stroke="#2a1a1a" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <path d="M57 79 q5 -3 10 -1 M73 78 q5 -2 10 1" stroke="#2a1a1a" stroke-width="1.1" fill="none"/>
      <ellipse cx="58" cy="95" rx="5" ry="3" fill="#f39aa8" opacity=".55"/>
      <ellipse cx="82" cy="95" rx="5" ry="3" fill="#f39aa8" opacity=".55"/>
      <ellipse cx="70" cy="101" rx="3.5" ry="2.2" fill="#c4162a"/>
      <line x1="84" y1="30" x2="108" y2="18" stroke="#e9c55a" stroke-width="2.5"/>
      ${[0, 1, 2, 3, 4].map((k) => { const a = (k * 2 * Math.PI) / 5; return `<circle cx="${92 + 6 * Math.cos(a)}" cy="${32 + 6 * Math.sin(a)}" r="4.5" fill="${g.color}" stroke="#fff" stroke-width="1"/>`; }).join('')}
      <circle cx="92" cy="32" r="2.5" fill="#f4d35e"/>
      <path d="M86 38 V52 M92 38 V56 M98 38 V50" stroke="#e9c55a" stroke-width="1"/>
      <rect x="0" y="180" width="140" height="20" fill="#1a1220" opacity=".78"/>
      <text x="70" y="194" text-anchor="middle" font-family="Shippori Mincho, Georgia, serif" font-size="13" fill="#f6e2a8" letter-spacing="2">${g.name}</text>
    </g>
    <rect x="1.5" y="1.5" width="137" height="197" rx="9" fill="none" stroke="#e9c55a" stroke-width="3"/>
    <circle cx="20" cy="22" r="14" fill="#1a1220" stroke="#e9c55a" stroke-width="2"/>
    <text x="20" y="28.5" text-anchor="middle" font-family="Shippori Mincho, Georgia, serif" font-weight="700" font-size="18" fill="#f6e2a8">${g.v}</text>
    <circle cx="118" cy="158" r="17" fill="#fffaf0" stroke="${g.dark}" stroke-width="2"/>
    <g transform="translate(103 143) scale(.3)">${itemIcon(i)}</g>
  </svg>`;
}

export function itemSVG(i) {
  const g = GEISHA[i];
  return `<svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="ibg${i}" cx=".5" cy=".4" r=".8">
        <stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="${g.light}"/>
      </radialGradient>
    </defs>
    <rect x="1" y="1" width="98" height="138" rx="8" fill="url(#ibg${i})" stroke="${g.color}" stroke-width="2"/>
    <rect x="6" y="6" width="88" height="128" rx="5" fill="none" stroke="${g.color}" stroke-width="1" stroke-dasharray="3 3" opacity=".7"/>
    <g transform="translate(5 22) scale(.9)">${itemIcon(i)}</g>
    <path d="M1 9 a8 8 0 0 1 8 -8 h18 l-26 26z" fill="${g.dark}"/>
    <text x="9" y="17" text-anchor="middle" font-family="Shippori Mincho, Georgia, serif" font-weight="700" font-size="13" fill="#f6e2a8">${g.v}</text>
    <text x="50" y="126" text-anchor="middle" font-family="Shippori Mincho, Georgia, serif" font-size="11" fill="${g.dark}">${g.item}</text>
  </svg>`;
}

export function backSVG() {
  return `<svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="seigaiha" width="20" height="10" patternUnits="userSpaceOnUse">
        <path d="M0 10 a10 10 0 0 1 20 0" fill="none" stroke="#c9a24a" stroke-width="1" opacity=".5"/>
        <path d="M4 10 a6 6 0 0 1 12 0" fill="none" stroke="#c9a24a" stroke-width="1" opacity=".35"/>
      </pattern>
    </defs>
    <rect x="1" y="1" width="98" height="138" rx="8" fill="#3a1d3f"/>
    <rect x="1" y="1" width="98" height="138" rx="8" fill="url(#seigaiha)"/>
    <rect x="8" y="8" width="84" height="124" rx="5" fill="none" stroke="#e9c55a" stroke-width="1.5"/>
    <circle cx="50" cy="70" r="22" fill="#2a1230" stroke="#e9c55a" stroke-width="2"/>
    <text x="50" y="79" text-anchor="middle" font-family="Shippori Mincho, serif" font-size="24" fill="#f6e2a8">花</text>
  </svg>`;
}

const MINI = (x, y, r = 0, fill = '#fffaf0') =>
  `<rect x="${x}" y="${y}" width="16" height="22" rx="2.5" fill="${fill}" stroke="#2a1230" stroke-width="1.5" transform="rotate(${r} ${x + 8} ${y + 11})"/>`;

export function markerSVG(type, color) {
  let inner = '';
  if (type === 'secret')
    inner = `${MINI(42, 39, 0, '#3a1d3f')}<path d="M34 54 l10 10 l22 -26" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  else if (type === 'trade')
    inner = `${MINI(34, 39, -10)}${MINI(50, 39, 10)}<path d="M32 36 L68 72 M68 36 L32 72" stroke="#c4162a" stroke-width="5" stroke-linecap="round"/>`;
  else if (type === 'gift')
    inner = `${MINI(26, 42, -14)}${MINI(42, 36)}${MINI(58, 42, 14)}<path d="M50 66 v8 M46 70 l4 4 l4 -4" stroke="#fff" stroke-width="2.5" fill="none"/>`;
  else
    inner = `${MINI(22, 36, -8)}${MINI(32, 40, -8)}${MINI(52, 36, 8)}${MINI(62, 40, 8)}`;
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="46" fill="${color}" stroke="#e9c55a" stroke-width="3"/>
    <circle cx="50" cy="50" r="39" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="1.5" stroke-dasharray="4 3"/>
    ${inner}
  </svg>`;
}

export function favorSVG(owner) {
  const fill = owner === 0 ? '#c4162a' : owner === 1 ? '#2b4f8c' : '#2a1230';
  return `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="18" fill="${fill}" stroke="#e9c55a" stroke-width="2.5"/>
    <path d="M20 8 L23 17 L32 20 L23 23 L20 32 L17 23 L8 20 L17 17Z" fill="#f6e2a8"/>
    <path d="M12 12 L28 28 M28 12 L12 28" stroke="#f6e2a8" stroke-width="1.2" opacity=".6"/>
  </svg>`;
}

export function lanternSVG(hue = '#d6513f') {
  return `<svg viewBox="0 0 60 110" xmlns="http://www.w3.org/2000/svg">
    <line x1="30" y1="0" x2="30" y2="14" stroke="#2a1230" stroke-width="2"/>
    <rect x="20" y="12" width="20" height="6" rx="2" fill="#2a1230"/>
    <ellipse cx="30" cy="52" rx="24" ry="34" fill="${hue}"/>
    <ellipse cx="30" cy="52" rx="24" ry="34" fill="none" stroke="#7a1f1a" stroke-width="1"/>
    ${[30, 40, 52, 64, 74].map((y) => `<path d="M8 ${y} Q30 ${y + 4} 52 ${y}" stroke="#7a1f1a" stroke-width="1" fill="none" opacity=".6"/>`).join('')}
    <ellipse cx="22" cy="44" rx="6" ry="14" fill="#fff" opacity=".2"/>
    <text x="30" y="60" text-anchor="middle" font-family="Shippori Mincho, serif" font-size="18" fill="#1a1220">花</text>
    <rect x="20" y="84" width="20" height="6" rx="2" fill="#2a1230"/>
    <path d="M26 90 v16 M30 90 v18 M34 90 v16" stroke="#e9c55a" stroke-width="1.5"/>
  </svg>`;
}
