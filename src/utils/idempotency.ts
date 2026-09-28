export const createIdempotencyKey = (scope = 'web') => {
  const random = window.crypto?.randomUUID?.()
    || (() => {
      if (window.crypto?.getRandomValues) {
        const bytes = window.crypto.getRandomValues(new Uint8Array(16));
        return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
      }
      // Only legacy/insecure browser contexts reach this compatibility path.
      return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    })();
  return `${scope}:${random}`;
};

export const idempotencyConfig = (scope: string) => ({
  headers: { 'Idempotency-Key': createIdempotencyKey(scope) },
});
