export const AUTH_SESSION_CHANGED = 'gaspar:auth-session-changed';

export const AUTH_STORAGE = {
  logged: '@minha-carteira:logged',
  email: '@minha-carteira:email',
  userId: '@minha-carteira:usuarioId',
  displayName: '@minha-carteira:nomeUsuario',
  token: '@minha-carteira:token',
} as const;

export type StoredSession = {
  token: string;
  userId: string;
  displayName?: string;
};

const notifySessionChanged = () => {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(AUTH_SESSION_CHANGED));
};

export const readStoredSession = (): StoredSession | null => {
  const token = localStorage.getItem(AUTH_STORAGE.token)?.trim();
  const userId = localStorage.getItem(AUTH_STORAGE.userId)?.trim();
  if (!token || !userId) return null;
  return {
    token,
    userId,
    displayName: localStorage.getItem(AUTH_STORAGE.displayName)?.trim() || undefined,
  };
};

export const hasStoredSession = () => readStoredSession() !== null;

export const writeStoredSession = (session: StoredSession) => {
  localStorage.setItem(AUTH_STORAGE.logged, 'true');
  localStorage.setItem(AUTH_STORAGE.userId, session.userId);
  localStorage.setItem(AUTH_STORAGE.token, session.token);
  if (session.displayName) localStorage.setItem(AUTH_STORAGE.displayName, session.displayName);
  else localStorage.removeItem(AUTH_STORAGE.displayName);
  notifySessionChanged();
};

export const clearStoredSession = ({ preserveEmail = false } = {}) => {
  localStorage.removeItem(AUTH_STORAGE.logged);
  localStorage.removeItem(AUTH_STORAGE.userId);
  localStorage.removeItem(AUTH_STORAGE.displayName);
  localStorage.removeItem(AUTH_STORAGE.token);
  if (!preserveEmail) localStorage.removeItem(AUTH_STORAGE.email);
  notifySessionChanged();
};
