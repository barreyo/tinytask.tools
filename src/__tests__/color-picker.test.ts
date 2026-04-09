import { describe, it, expect } from 'vitest';
import { hexToRgb, contrastOnWhite, contrastOnBlack, deriveFormats } from '../lib/color-picker';

// ── hexToRgb ──────────────────────────────────────────────────────────────────

describe('hexToRgb', () => {
  it('parses a 6-digit hex with hash', () => {
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('parses a 6-digit hex without hash', () => {
    expect(hexToRgb('00ff00')).toEqual({ r: 0, g: 255, b: 0 });
  });

  it('parses a 3-digit shorthand hex', () => {
    expect(hexToRgb('#f00')).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb('#0f0')).toEqual({ r: 0, g: 255, b: 0 });
    expect(hexToRgb('#00f')).toEqual({ r: 0, g: 0, b: 255 });
  });

  it('parses black', () => {
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('parses white', () => {
    expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('handles uppercase hex letters', () => {
    expect(hexToRgb('#FF8800')).toEqual({ r: 255, g: 136, b: 0 });
  });

  it('handles mixed case', () => {
    expect(hexToRgb('#aAbBcC')).toEqual({ r: 170, g: 187, b: 204 });
  });

  it('returns null for invalid length', () => {
    expect(hexToRgb('#ff00')).toBeNull();
    expect(hexToRgb('#ff')).toBeNull();
    expect(hexToRgb('')).toBeNull();
  });

  it('returns null for non-hex characters', () => {
    expect(hexToRgb('#gghhii')).toBeNull();
    expect(hexToRgb('#xyz')).toBeNull();
  });

  it('strips leading hash before checking length', () => {
    expect(hexToRgb('#abc')).toEqual(hexToRgb('abc'));
  });
});

// ── contrastOnWhite / contrastOnBlack ─────────────────────────────────────────

describe('contrastOnWhite', () => {
  it('white-on-white contrast ratio is 1:1', () => {
    expect(contrastOnWhite(255, 255, 255)).toBeCloseTo(1.0, 2);
  });

  it('black-on-white contrast ratio is 21:1', () => {
    expect(contrastOnWhite(0, 0, 0)).toBeCloseTo(21.0, 1);
  });

  it('returns a value ≥ 1', () => {
    expect(contrastOnWhite(128, 64, 200)).toBeGreaterThanOrEqual(1);
  });

  it('darker colours have higher contrast on white', () => {
    const dark = contrastOnWhite(50, 50, 50);
    const light = contrastOnWhite(200, 200, 200);
    expect(dark).toBeGreaterThan(light);
  });
});

describe('contrastOnBlack', () => {
  it('black-on-black contrast ratio is 1:1', () => {
    expect(contrastOnBlack(0, 0, 0)).toBeCloseTo(1.0, 2);
  });

  it('white-on-black contrast ratio is 21:1', () => {
    expect(contrastOnBlack(255, 255, 255)).toBeCloseTo(21.0, 1);
  });

  it('returns a value ≥ 1', () => {
    expect(contrastOnBlack(100, 150, 200)).toBeGreaterThanOrEqual(1);
  });

  it('lighter colours have higher contrast on black', () => {
    const light = contrastOnBlack(200, 200, 200);
    const dark = contrastOnBlack(50, 50, 50);
    expect(light).toBeGreaterThan(dark);
  });
});

// ── deriveFormats ─────────────────────────────────────────────────────────────

describe('deriveFormats', () => {
  describe('red (#ff0000)', () => {
    const f = deriveFormats(255, 0, 0);

    it('produces correct hex', () => {
      expect(f.hex).toBe('#ff0000');
      expect(f.hexUpper).toBe('#FF0000');
    });

    it('produces correct rgb string', () => {
      expect(f.rgb).toBe('rgb(255, 0, 0)');
    });

    it('produces correct hsl (red = 0°, fully saturated, 50% lightness)', () => {
      expect(f.hsl).toBe('hsl(0, 100.0%, 50.0%)');
    });

    it('produces correct cmyk (no key, full cyan-like)', () => {
      expect(f.cmyk).toBe('cmyk(0%, 100%, 100%, 0%)');
    });

    it('maps to CSS named color "red"', () => {
      expect(f.cssNamed).toBe('red');
    });

    it('integer is packed 24-bit value', () => {
      expect(f.integer).toBe(String(0xff0000));
    });
  });

  describe('black (#000000)', () => {
    const f = deriveFormats(0, 0, 0);

    it('produces correct hex', () => {
      expect(f.hex).toBe('#000000');
    });

    it('maps to CSS named color "black"', () => {
      expect(f.cssNamed).toBe('black');
    });

    it('contrast on white is 21:1', () => {
      expect(f.contrastWhite).toContain('21.');
    });

    it('onWhite recommends white text for dark background', () => {
      expect(f.onWhite).toBe('white');
    });
  });

  describe('white (#ffffff)', () => {
    const f = deriveFormats(255, 255, 255);

    it('produces correct hex', () => {
      expect(f.hex).toBe('#ffffff');
    });

    it('maps to CSS named color "white"', () => {
      expect(f.cssNamed).toBe('white');
    });

    it('onWhite recommends black text for light background', () => {
      expect(f.onWhite).toBe('black');
    });
  });

  describe('blue (#0000ff)', () => {
    const f = deriveFormats(0, 0, 255);

    it('produces correct hsl (blue = 240°)', () => {
      expect(f.hsl).toContain('240');
    });

    it('maps to CSS named color "blue"', () => {
      expect(f.cssNamed).toBe('blue');
    });
  });

  describe('unknown color (no CSS name)', () => {
    it('returns null for cssNamed', () => {
      const f = deriveFormats(1, 2, 3);
      expect(f.cssNamed).toBeNull();
    });
  });

  describe('float vector output', () => {
    it('contains 4-decimal float components for white', () => {
      const f = deriveFormats(255, 255, 255);
      expect(f.floatVec).toBe('vec3(1.0000, 1.0000, 1.0000)');
    });

    it('contains 4-decimal float components for black', () => {
      const f = deriveFormats(0, 0, 0);
      expect(f.floatVec).toBe('vec3(0.0000, 0.0000, 0.0000)');
    });
  });

  describe('WCAG accessibility labels', () => {
    it('black on white passes AAA', () => {
      const f = deriveFormats(0, 0, 0);
      expect(f.contrastWhite).toContain('AAA');
    });

    it('white on white fails', () => {
      const f = deriveFormats(255, 255, 255);
      expect(f.contrastWhite).toContain('fail');
    });
  });
});
