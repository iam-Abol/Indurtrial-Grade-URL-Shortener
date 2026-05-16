import { Base62Converter } from './base62.converter';

describe('base62 converter class', () => {
  describe('encode()', () => {
    it('should encode 0 correctly', () => {
      expect(Base62Converter.encode(0)).toBe('0');
    });
    it('should throw an error for negative number', () => {
      expect(() => Base62Converter.encode(-1)).toThrow();
    });
    it('should encode small numbers correctly', () => {
      expect(Base62Converter.encode(1)).toBe('1');
      expect(Base62Converter.encode(61)).toBe('Z');
      expect(Base62Converter.encode(62)).toBe('10');
    });
  });

  describe('decode()', () => {
    it('should decode correctly', () => {
      expect(Base62Converter.decode('0')).toBe(0);
      expect(Base62Converter.decode('10')).toBe(62);
    });
    it('should maintain symmetry encode -> decode', () => {
      const numbers = [10, 99999, 44560, 45645, 7, 11, 1, 8291544887];
      for (const num of numbers) {
        const encoded = Base62Converter.encode(num);
        const decoded = Base62Converter.decode(encoded);
        expect(decoded).toBe(num);
      }
    });

    it('should throw an error for invalid strings', () => {
      expect(() => Base62Converter.decode('-1')).toThrow();
      expect(() => Base62Converter.decode('*+fd')).toThrow();
      expect(() => Base62Converter.decode('df ')).toThrow();
    });
    it('should throw an error for empty string', () => {
      expect(() => Base62Converter.decode('')).toThrow();
    });
    it('should correctly encode/decode random numbers', () => {
      for (let i = 0; i < 100; i++) {
        const num = Math.floor(Math.random() * 100000000);
        const encoded = Base62Converter.encode(num);
        const decoded = Base62Converter.decode(encoded);
        expect(decoded).toBe(num);
      }
    });
  });
});
