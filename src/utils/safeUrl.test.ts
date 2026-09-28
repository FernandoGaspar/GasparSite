import { safeExternalUrl, safeHttpUrl, safeImageSource, safeInternalPath } from './safeUrl';

describe('untrusted URL normalization', () => {
  it('rejects script schemes, credentials and insecure remote origins', () => {
    expect(safeHttpUrl('javascript:alert(1)')).toBeUndefined();
    expect(safeHttpUrl('data:text/html,<script>alert(1)</script>')).toBeUndefined();
    expect(safeHttpUrl('https://user:secret@example.test/path')).toBeUndefined();
    expect(safeHttpUrl('http://example.test/path')).toBeUndefined();
  });

  it('only permits insecure loopback URLs while the current page is also local', () => {
    expect(safeHttpUrl('http://127.0.0.1:5000/health')).toBe('http://127.0.0.1:5000/health');

    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: new URL('https://fernandogasparjr.com/dashboard'),
    });
    try {
      expect(safeHttpUrl('http://localhost:5000/private')).toBeUndefined();
      expect(safeHttpUrl('http://127.0.0.1:5000/private')).toBeUndefined();
    } finally {
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: originalLocation,
      });
    }
  });

  it('accepts HTTPS links and same-origin paths', () => {
    expect(safeHttpUrl('https://example.test/path')).toBe('https://example.test/path');
    expect(safeInternalPath('/activities?filter=today')).toBe('/activities?filter=today');
    expect(safeInternalPath('//example.test/path')).toBeUndefined();
  });

  it('requires explicit absolute URLs for external redirects', () => {
    expect(safeExternalUrl('/settings')).toBeUndefined();
    expect(safeExternalUrl('https://accounts.example.test/oauth')).toBe('https://accounts.example.test/oauth');
  });

  it('allows raster data images but rejects active SVG payloads', () => {
    expect(safeImageSource('data:image/png;base64,YWJj')).toBe('data:image/png;base64,YWJj');
    expect(safeImageSource('data:image/svg+xml,<svg onload="alert(1)"/>')).toBeUndefined();
  });
});
