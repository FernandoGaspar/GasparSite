const linkKey = (scope: string) => `gaspar:${scope}:link`;
const sessionKey = (scope: string) => `gaspar:${scope}:session`;

/**
 * Captures a capability token from the URL fragment and immediately removes it
 * from the address bar/history entry. The token remains scoped to this browser
 * tab so refresh continues to work without exposing it in navigation UI.
 */
export const captureShareToken = (scope: string) => {
  const fragment = window.location.hash.slice(1).trim();
  const stored = sessionStorage.getItem(linkKey(scope)) || '';
  if (fragment) {
    if (stored && stored !== fragment) sessionStorage.removeItem(sessionKey(scope));
    sessionStorage.setItem(linkKey(scope), fragment);
    window.history.replaceState(
      window.history.state,
      document.title,
      `${window.location.pathname}${window.location.search}`,
    );
    return fragment;
  }
  return stored;
};

export const readShareSession = (scope: string) => sessionStorage.getItem(sessionKey(scope)) || '';

export const writeShareSession = (scope: string, value: string) => {
  sessionStorage.setItem(sessionKey(scope), value);
};

export const clearShareSession = (scope: string) => sessionStorage.removeItem(sessionKey(scope));

export const clearShareAccess = (scope: string) => {
  sessionStorage.removeItem(sessionKey(scope));
  sessionStorage.removeItem(linkKey(scope));
};

export const isShareAccessRejected = (status?: number) => [401, 403, 404].includes(Number(status));
