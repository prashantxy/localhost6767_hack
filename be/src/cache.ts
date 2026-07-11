const cache = new Map<string, number>();

const TTL = 15000;

export function shouldStore(text: string) {
  const now = Date.now();

  const last = cache.get(text);

  if (last && now - last < TTL) {
    return false;
  }

  cache.set(text, now);

  return true;
}