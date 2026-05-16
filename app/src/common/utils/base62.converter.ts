export class Base62Converter {
  private static readonly ALPHABET =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  private static readonly BASE = 62;

  static encode(num: number): string {
    let result: string = '';
    if (num < 0) throw new Error('Invalid inputs');
    if (num === 0) return '0';
    while (num > 0) {
      result = this.ALPHABET[num % this.BASE] + result;
      num = Math.floor(num / this.BASE);
    }

    return result;
  }

  static decode(str: string): number {
    let result: number = 0;
    for (const char of str) {
      const index = this.ALPHABET.indexOf(char);
      if (index === -1) throw new Error('Invalid Base62 character');

      result = result * this.BASE + index;
    }
    return result;
  }
}
