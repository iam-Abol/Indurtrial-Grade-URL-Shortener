import { isIP } from 'net';

export function isPrivateIp(ip: string): boolean {
  const version = isIP(ip);
  if (version === 0) return false;

  if (version === 4) {
    if (ip.startsWith('10.')) return true;
    if (ip.startsWith('127.')) return true;
    if (ip.startsWith('192.168.')) return true;
    if (ip.startsWith('169.254.')) return true;

    const parts = ip.split('.').map(Number);
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) {
      return true;
    }

    return false;
  }

  if (version === 6) {
    const normalized = ip.toLowerCase();
    if (normalized === '::1') return true;
    if (normalized.startsWith('fe80')) return true;
    if (normalized.startsWith('fc') || normalized.startsWith('fd')) {
      return true;
    }

    return false;
  }

  return false;
}
