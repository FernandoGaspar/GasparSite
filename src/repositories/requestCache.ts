type CacheEntry = { expiresAt: number; value: unknown };

const pending = new Map<string, Promise<unknown>>();
const cache = new Map<string, CacheEntry>();
const MAX_ENTRIES = 100;

/** Coalesce identical reads and retain successful results for a very short TTL.
 * This prevents StrictMode/remounts from issuing duplicate API calls without
 * allowing financial data to remain stale for a meaningful period.
 */
export function deduplicatedRequest<T>(
  key: string,
  loader: () => Promise<T>,
  ttlMs = 1500,
): Promise<T> {
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && cached.expiresAt > now) return Promise.resolve(cached.value as T);
  if (cached) cache.delete(key);

  const inFlight = pending.get(key);
  if (inFlight) return inFlight as Promise<T>;

  const request = loader()
    .then((value) => {
      if (cache.size >= MAX_ENTRIES) cache.delete(cache.keys().next().value as string);
      cache.set(key, { expiresAt: Date.now() + ttlMs, value });
      return value;
    })
    .finally(() => pending.delete(key));
  pending.set(key, request);
  return request;
}
