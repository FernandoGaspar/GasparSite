const localDevelopmentHosts = new Set(['localhost', '127.0.0.1', '[::1]']);

const isLocalDevelopmentHost = (hostname: string) => localDevelopmentHosts.has(hostname.toLowerCase());

const parseHttpUrl = (value?: string) => {
  const candidate = String(value || '').trim();
  if (!candidate || Array.from(candidate).some(character => {
    const code = character.charCodeAt(0);
    return code <= 31 || code === 127;
  })) return undefined;
  try {
    const parsed = new URL(candidate, window.location.origin);
    if (!['http:', 'https:'].includes(parsed.protocol)) return undefined;
    if (parsed.username || parsed.password) return undefined;
    if (parsed.protocol === 'http:' && parsed.origin !== window.location.origin) {
      const isLocalDevelopmentRequest = isLocalDevelopmentHost(parsed.hostname)
        && isLocalDevelopmentHost(window.location.hostname);
      if (!isLocalDevelopmentRequest) return undefined;
    }
    return parsed;
  } catch {
    return undefined;
  }
};

/** Returns a browser-safe HTTP(S) URL. Relative paths stay relative. */
export const safeHttpUrl = (value?: string) => {
  const candidate = String(value || '').trim();
  const parsed = parseHttpUrl(candidate);
  if (!parsed) return undefined;
  if (candidate.startsWith('/') && !candidate.startsWith('//') && parsed.origin === window.location.origin) {
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  }
  return parsed.href;
};

/** External redirects (OAuth, providers) must be explicit absolute URLs. */
export const safeExternalUrl = (value?: string) => {
  const candidate = String(value || '').trim();
  if (!/^[a-z][a-z\d+.-]*:/i.test(candidate)) return undefined;
  return safeHttpUrl(candidate);
};

/** Internal actions from API/AI output cannot redirect to another origin. */
export const safeInternalPath = (value?: string) => {
  const candidate = String(value || '').trim();
  if (!candidate.startsWith('/') || candidate.startsWith('//')) return undefined;
  const parsed = parseHttpUrl(candidate);
  if (!parsed || parsed.origin !== window.location.origin) return undefined;
  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
};

/** SVG data URLs are intentionally excluded because they may carry active content. */
export const safeImageSource = (value?: string) => {
  const candidate = String(value || '').trim();
  if (/^data:image\/(?:png|jpe?g|gif|webp);base64,[a-z\d+/=\s]+$/i.test(candidate)) return candidate;
  return safeHttpUrl(candidate);
};
