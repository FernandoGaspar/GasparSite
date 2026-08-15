export const watchlist = [
  { ticker: 'AAPL', name: 'Apple Inc.' },
  { ticker: 'MSFT', name: 'Microsoft Corp.' },
  { ticker: 'VALE3', name: 'Vale S.A.' },
];

export const assets: Record<string, any> = {
  AAPL: {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    price: 172.35,
    changePercent: -0.42,
    fundamentals: {
      pe: 28.3,
      pb: 27.1,
      roe: 29.4,
      divYield: 0.5,
      revenueTTM: 394_000_000_000,
      netIncomeTTM: 94_680_000_000,
    },
    news: [
      { title: 'Apple anuncia novo iPhone', source: 'FonteX', url: '#', image: 'https://via.placeholder.com/80x60', publishedAt: '2026-02-27T10:00:00Z' },
      { title: 'Resultados trimestrais acima do esperado', source: 'FonteY', url: '#', image: 'https://via.placeholder.com/80x60', publishedAt: '2026-02-26T14:30:00Z' },
    ],
  },
  MSFT: {
    ticker: 'MSFT',
    name: 'Microsoft Corp.',
    price: 331.12,
    changePercent: 0.82,
    fundamentals: {
      pe: 32.8,
      pb: 15.4,
      roe: 41.3,
      divYield: 0.8,
      revenueTTM: 211_000_000_000,
      netIncomeTTM: 61_271_000_000,
    },
    news: [
      { title: 'Microsoft expande serviços cloud', source: 'FonteA', url: '#', image: 'https://via.placeholder.com/80x60', publishedAt: '2026-02-25T08:15:00Z' },
    ],
  },
  VALE3: {
    ticker: 'VALE3',
    name: 'Vale S.A.',
    price: 65.4,
    changePercent: 1.25,
    fundamentals: {
      pe: 5.6,
      pb: 1.8,
      roe: 24.1,
      divYield: 6.2,
      revenueTTM: 85_000_000_000,
      netIncomeTTM: 15_000_000_000,
    },
    news: [
      { title: 'VALE3 divulga produção trimestral', source: 'FonteBr', url: '#', image: 'https://via.placeholder.com/80x60', publishedAt: '2026-02-24T12:00:00Z' },
    ],
  },
  BTC: {
    ticker: 'BTC',
    name: 'Bitcoin',
    price: 450000,
    changePercent: 2.3,
    fundamentals: {
      pe: 0,
      pb: 0,
      roe: 0,
      divYield: 0,
      revenueTTM: 0,
      netIncomeTTM: 0,
    },
    news: [
      { title: 'Bitcoin atinge novo recorde de preço', source: 'CryptoNews', url: 'https://cryptonews.example/recorde', image: 'https://via.placeholder.com/80x60', publishedAt: '2026-02-23T16:45:00Z' },
      { title: 'ETF de Bitcoin aprovado nos EUA', source: 'Finance Daily', url: 'https://financedaily.example/etf', image: 'https://via.placeholder.com/80x60', publishedAt: '2026-02-22T09:20:00Z' },
    ],
  },
};

export default {
  watchlist,
  assets,
};
