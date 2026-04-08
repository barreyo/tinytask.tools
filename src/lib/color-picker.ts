// ── Linearization ─────────────────────────────────────────────────────────────

function linearize(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function gammaEncode(c: number): number {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

// ── Matrix helpers ────────────────────────────────────────────────────────────

type Vec3 = [number, number, number];

function mul3x3(m: [Vec3, Vec3, Vec3], v: Vec3): Vec3 {
  return [
    m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2],
    m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],
    m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2],
  ];
}

// ── XYZ (D65) ─────────────────────────────────────────────────────────────────

const LINEAR_SRGB_TO_XYZ_D65: [Vec3, Vec3, Vec3] = [
  [0.4124564, 0.3575761, 0.1804375],
  [0.2126729, 0.7151522, 0.072175],
  [0.0193339, 0.119192, 0.9503041],
];

// Bradford D65 → D50
const XYZ_D65_TO_D50: [Vec3, Vec3, Vec3] = [
  [1.0478112, 0.0228866, -0.050127],
  [0.0295424, 0.9904844, -0.0170491],
  [-0.0092345, 0.0150436, 0.7521316],
];

// XYZ D65 → linear display-P3
const XYZ_D65_TO_LINEAR_P3: [Vec3, Vec3, Vec3] = [
  [2.493497, -0.931384, -0.402711],
  [-0.829489, 1.762664, 0.023625],
  [0.035846, -0.076172, 0.956885],
];

// ── Lab ───────────────────────────────────────────────────────────────────────

const D50_WHITE: Vec3 = [0.3457 / 0.3585, 1.0, (1.0 - 0.3457 - 0.3585) / 0.3585];

function labF(t: number): number {
  return t > 0.008856451679 ? Math.cbrt(t) : 7.787037037 * t + 16 / 116;
}

function xyzD50ToLab([x, y, z]: Vec3): Vec3 {
  const fx = labF(x / D50_WHITE[0]);
  const fy = labF(y / D50_WHITE[1]);
  const fz = labF(z / D50_WHITE[2]);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

function labToLch([l, a, b]: Vec3): Vec3 {
  const c = Math.sqrt(a * a + b * b);
  let h = (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return [l, c, h];
}

// ── OKLab / OKLCH ─────────────────────────────────────────────────────────────

const LINEAR_SRGB_TO_LMS: [Vec3, Vec3, Vec3] = [
  [0.4122214708, 0.5363325363, 0.0514459929],
  [0.2119034982, 0.6806995451, 0.1073969566],
  [0.0883024619, 0.2817188376, 0.6299787005],
];

const LMS_GAMMA_TO_OKLAB: [Vec3, Vec3, Vec3] = [
  [0.2104542553, 0.793617785, -0.0040720468],
  [1.9779984951, -2.428592205, 0.4505937099],
  [0.0259040371, 0.7827717662, -0.808675766],
];

function linearRgbToOklab(r: number, g: number, b: number): Vec3 {
  const lms = mul3x3(LINEAR_SRGB_TO_LMS, [r, g, b]);
  const lmsGamma: Vec3 = [Math.cbrt(lms[0]), Math.cbrt(lms[1]), Math.cbrt(lms[2])];
  return mul3x3(LMS_GAMMA_TO_OKLAB, lmsGamma);
}

function oklabToOklch([l, a, b]: Vec3): Vec3 {
  const c = Math.sqrt(a * a + b * b);
  let h = (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return [l, c, h];
}

// ── HSL ───────────────────────────────────────────────────────────────────────

function rgbToHsl(r: number, g: number, b: number): Vec3 {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h * 360, s, l];
}

// ── HSV ───────────────────────────────────────────────────────────────────────

function rgbToHsv(r: number, g: number, b: number): Vec3 {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [h * 360, s, v];
}

// ── HWB ───────────────────────────────────────────────────────────────────────

function rgbToHwb(r: number, g: number, b: number): Vec3 {
  const [h] = rgbToHsl(r, g, b);
  const w = Math.min(r, g, b);
  const bk = 1 - Math.max(r, g, b);
  return [h, w, bk];
}

// ── CMYK ──────────────────────────────────────────────────────────────────────

function rgbToCmyk(r: number, g: number, b: number): [number, number, number, number] {
  const k = 1 - Math.max(r, g, b);
  if (k === 1) return [0, 0, 0, 1];
  return [(1 - r - k) / (1 - k), (1 - g - k) / (1 - k), (1 - b - k) / (1 - k), k];
}

// ── Hex parsing ───────────────────────────────────────────────────────────────

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace(/^#/, '').trim();
  let r: number, g: number, b: number;
  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16);
    g = parseInt(clean[1] + clean[1], 16);
    b = parseInt(clean[2] + clean[2], 16);
  } else if (clean.length === 6) {
    r = parseInt(clean.slice(0, 2), 16);
    g = parseInt(clean.slice(2, 4), 16);
    b = parseInt(clean.slice(4, 6), 16);
  } else {
    return null;
  }
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return { r, g, b };
}

// ── CSS named colors (subset of common ones) ──────────────────────────────────

const NAMED_COLORS: Record<string, string> = {
  '#000000': 'black',
  '#ffffff': 'white',
  '#ff0000': 'red',
  '#00ff00': 'lime',
  '#0000ff': 'blue',
  '#ffff00': 'yellow',
  '#00ffff': 'cyan',
  '#ff00ff': 'magenta',
  '#c0c0c0': 'silver',
  '#808080': 'gray',
  '#800000': 'maroon',
  '#808000': 'olive',
  '#008000': 'green',
  '#800080': 'purple',
  '#008080': 'teal',
  '#000080': 'navy',
  '#ffa500': 'orange',
  '#ffc0cb': 'pink',
  '#a52a2a': 'brown',
  '#f5f5dc': 'beige',
  '#ff7f50': 'coral',
  '#dc143c': 'crimson',
  '#00ced1': 'darkturquoise',
  '#ff1493': 'deeppink',
  '#1e90ff': 'dodgerblue',
  '#b22222': 'firebrick',
  '#228b22': 'forestgreen',
  '#daa520': 'goldenrod',
  '#adff2f': 'greenyellow',
  '#ff69b4': 'hotpink',
  '#4b0082': 'indigo',
  '#f0e68c': 'khaki',
  '#7cfc00': 'lawngreen',
  '#add8e6': 'lightblue',
  '#f08080': 'lightcoral',
  '#90ee90': 'lightgreen',
  '#ffb6c1': 'lightpink',
  '#20b2aa': 'lightseagreen',
  '#87cefa': 'lightskyblue',
  '#778899': 'lightslategray',
  '#b0c4de': 'lightsteelblue',
  '#00fa9a': 'mediumspringgreen',
  '#48d1cc': 'mediumturquoise',
  '#c71585': 'mediumvioletred',
  '#191970': 'midnightblue',
  '#ffe4b5': 'moccasin',
  '#ffdead': 'navajowhite',
  '#fdf5e6': 'oldlace',
  '#6b8e23': 'olivedrab',
  '#ff4500': 'orangered',
  '#da70d6': 'orchid',
  '#eee8aa': 'palegoldenrod',
  '#98fb98': 'palegreen',
  '#afeeee': 'paleturquoise',
  '#db7093': 'palevioletred',
  '#ffdab9': 'peachpuff',
  '#cd853f': 'peru',
  '#dda0dd': 'plum',
  '#b0e0e6': 'powderblue',
  '#bc8f8f': 'rosybrown',
  '#4169e1': 'royalblue',
  '#8b4513': 'saddlebrown',
  '#fa8072': 'salmon',
  '#f4a460': 'sandybrown',
  '#2e8b57': 'seagreen',
  '#fff5ee': 'seashell',
  '#a0522d': 'sienna',
  '#87ceeb': 'skyblue',
  '#6a5acd': 'slateblue',
  '#708090': 'slategray',
  '#00ff7f': 'springgreen',
  '#4682b4': 'steelblue',
  '#d2b48c': 'tan',
  '#40e0d0': 'turquoise',
  '#ee82ee': 'violet',
  '#f5deb3': 'wheat',
  '#9acd32': 'yellowgreen',
};

// ── Luminance for contrast recommendation ─────────────────────────────────────

function relativeLuminance(r8: number, g8: number, b8: number): number {
  const rl = linearize(r8 / 255);
  const gl = linearize(g8 / 255);
  const bl = linearize(b8 / 255);
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

export function contrastOnWhite(r: number, g: number, b: number): number {
  const lum = relativeLuminance(r, g, b);
  return 1.05 / (lum + 0.05);
}

export function contrastOnBlack(r: number, g: number, b: number): number {
  const lum = relativeLuminance(r, g, b);
  return (lum + 0.05) / 0.05;
}

// ── Main conversion ───────────────────────────────────────────────────────────

export interface ColorFormats {
  hex: string;
  hexUpper: string;
  rgb: string;
  rgbValues: string;
  hsl: string;
  hslValues: string;
  hwb: string;
  hsv: string;
  cmyk: string;
  lch: string;
  oklch: string;
  p3: string;
  integer: string;
  floatVec: string;
  cssNamed: string | null;
  contrastWhite: string;
  contrastBlack: string;
  onWhite: 'black' | 'white';
}

export function deriveFormats(r8: number, g8: number, b8: number): ColorFormats {
  const r = r8 / 255;
  const g = g8 / 255;
  const b = b8 / 255;

  // Hex
  const hexLow = `#${r8.toString(16).padStart(2, '0')}${g8.toString(16).padStart(2, '0')}${b8.toString(16).padStart(2, '0')}`;
  const hexUp = hexLow.toUpperCase();

  // RGB
  const rgbStr = `rgb(${r8}, ${g8}, ${b8})`;
  const rgbValuesStr = `${r8}, ${g8}, ${b8}`;

  // HSL
  const [hH, hS, hL] = rgbToHsl(r, g, b);
  const hslStr = `hsl(${Math.round(hH)}, ${(hS * 100).toFixed(1)}%, ${(hL * 100).toFixed(1)}%)`;
  const hslValuesStr = `${Math.round(hH)}° ${(hS * 100).toFixed(1)}% ${(hL * 100).toFixed(1)}%`;

  // HWB
  const [hwH, hwW, hwB] = rgbToHwb(r, g, b);
  const hwbStr = `hwb(${Math.round(hwH)} ${(hwW * 100).toFixed(1)}% ${(hwB * 100).toFixed(1)}%)`;

  // HSV
  const [hvH, hvS, hvV] = rgbToHsv(r, g, b);
  const hsvStr = `hsv(${Math.round(hvH)}, ${(hvS * 100).toFixed(1)}%, ${(hvV * 100).toFixed(1)}%)`;

  // CMYK
  const [c, m, y, k] = rgbToCmyk(r, g, b);
  const cmykStr = `cmyk(${(c * 100).toFixed(0)}%, ${(m * 100).toFixed(0)}%, ${(y * 100).toFixed(0)}%, ${(k * 100).toFixed(0)}%)`;

  // LCH
  const rl = linearize(r);
  const gl = linearize(g);
  const bl = linearize(b);
  const xyzD65 = mul3x3(LINEAR_SRGB_TO_XYZ_D65, [rl, gl, bl]);
  const xyzD50 = mul3x3(XYZ_D65_TO_D50, xyzD65);
  const [lL, lA, lB] = xyzD50ToLab(xyzD50);
  const [lcL, lcC, lcH] = labToLch([lL, lA, lB]);
  const lchStr = `lch(${lcL.toFixed(2)} ${lcC.toFixed(2)} ${lcH.toFixed(2)})`;

  // OKLCH
  const oklab = linearRgbToOklab(rl, gl, bl);
  const [okL, okC, okH] = oklabToOklch(oklab);
  const oklchStr = `oklch(${okL.toFixed(4)} ${okC.toFixed(4)} ${okH.toFixed(2)})`;

  // display-P3
  const linP3 = mul3x3(XYZ_D65_TO_LINEAR_P3, xyzD65);
  const p3R = Math.max(0, Math.min(1, gammaEncode(linP3[0])));
  const p3G = Math.max(0, Math.min(1, gammaEncode(linP3[1])));
  const p3B = Math.max(0, Math.min(1, gammaEncode(linP3[2])));
  const p3Str = `color(display-p3 ${p3R.toFixed(4)} ${p3G.toFixed(4)} ${p3B.toFixed(4)})`;

  // Integer (packed 24-bit)
  const intVal = (r8 << 16) | (g8 << 8) | b8;
  const intStr = intVal.toString(10);

  // Float / vec3 (normalized 0-1, useful for shaders)
  const floatStr = `vec3(${r.toFixed(4)}, ${g.toFixed(4)}, ${b.toFixed(4)})`;

  // CSS named color
  const cssNamed = NAMED_COLORS[hexLow] ?? null;

  // Contrast ratios
  const cw = contrastOnWhite(r8, g8, b8);
  const cb = contrastOnBlack(r8, g8, b8);
  const cwStr = `${cw.toFixed(2)}:1${cw >= 7 ? ' (AAA)' : cw >= 4.5 ? ' (AA)' : cw >= 3 ? ' (AA Large)' : ' (fail)'}`;
  const cbStr = `${cb.toFixed(2)}:1${cb >= 7 ? ' (AAA)' : cb >= 4.5 ? ' (AA)' : cb >= 3 ? ' (AA Large)' : ' (fail)'}`;

  return {
    hex: hexLow,
    hexUpper: hexUp,
    rgb: rgbStr,
    rgbValues: rgbValuesStr,
    hsl: hslStr,
    hslValues: hslValuesStr,
    hwb: hwbStr,
    hsv: hsvStr,
    cmyk: cmykStr,
    lch: lchStr,
    oklch: oklchStr,
    p3: p3Str,
    integer: intStr,
    floatVec: floatStr,
    cssNamed,
    contrastWhite: cwStr,
    contrastBlack: cbStr,
    onWhite: relativeLuminance(r8, g8, b8) > 0.179 ? 'black' : 'white',
  };
}
