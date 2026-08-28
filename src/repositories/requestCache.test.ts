import { deduplicatedRequest } from './requestCache';

describe('deduplicatedRequest', () => {
  it('shares one loader across concurrent identical reads', async () => {
    let calls = 0;
    const loader = async () => {
      calls += 1;
      await Promise.resolve();
      return { ok: true };
    };
    const key = `test:${Date.now()}:${Math.random()}`;

    const values = await Promise.all([
      deduplicatedRequest(key, loader),
      deduplicatedRequest(key, loader),
      deduplicatedRequest(key, loader),
    ]);

    expect(calls).toBe(1);
    expect(values).toEqual([{ ok: true }, { ok: true }, { ok: true }]);
  });

  it('does not cache failed requests', async () => {
    let calls = 0;
    const key = `failure:${Date.now()}:${Math.random()}`;
    const loader = async () => {
      calls += 1;
      if (calls === 1) throw new Error('temporary');
      return 'recovered';
    };

    await expect(deduplicatedRequest(key, loader)).rejects.toThrow('temporary');
    await expect(deduplicatedRequest(key, loader)).resolves.toBe('recovered');
    expect(calls).toBe(2);
  });
});
