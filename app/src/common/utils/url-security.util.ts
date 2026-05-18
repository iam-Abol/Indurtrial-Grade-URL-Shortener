import dns from 'dns/promises';
import { isPrivateIp } from './ip';

export class UnsafeUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnsafeUrlError';
  }
}

export async function assertUrlIsSafe(rawUrl: string) {
  let parsed: URL;

  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new UnsafeUrlError('Invalid URL format');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new UnsafeUrlError('Only http and https protocols are allowed');
  }

  const hostname = parsed.hostname;
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1'
  ) {
    throw new UnsafeUrlError('Localhost URLs are not allowed');
  }

  let address: string;
  try {
    const result = await dns.lookup(hostname, { family: 0 });
    address = result.address;
  } catch (err) {
    throw new UnsafeUrlError('Unable to resolve hostname');
  }

  if (isPrivateIp(address)) {
    throw new UnsafeUrlError(
      'URLs pointing to private IP ranges are not allowed',
    );
  }
}
