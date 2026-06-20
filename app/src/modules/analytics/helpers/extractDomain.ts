export function extractDomain(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}
