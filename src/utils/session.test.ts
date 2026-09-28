import {
  AUTH_STORAGE,
  clearStoredSession,
  hasStoredSession,
  readStoredSession,
  writeStoredSession,
} from './session';

describe('browser session storage', () => {
  beforeEach(() => localStorage.clear());

  it('never treats the legacy logged flag as authentication proof', () => {
    localStorage.setItem(AUTH_STORAGE.logged, 'true');
    expect(hasStoredSession()).toBe(false);
    expect(readStoredSession()).toBeNull();
  });

  it('requires and returns a complete bearer session', () => {
    writeStoredSession({ token: 'signed-token', userId: '7', displayName: 'Fernando' });
    expect(readStoredSession()).toEqual({ token: 'signed-token', userId: '7', displayName: 'Fernando' });
  });

  it('can invalidate credentials while preserving the remembered email', () => {
    localStorage.setItem(AUTH_STORAGE.email, 'user@example.test');
    writeStoredSession({ token: 'signed-token', userId: '7' });
    clearStoredSession({ preserveEmail: true });
    expect(readStoredSession()).toBeNull();
    expect(localStorage.getItem(AUTH_STORAGE.email)).toBe('user@example.test');
  });
});
