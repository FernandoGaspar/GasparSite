import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

interface NewsItem {
  title: string;
  source?: string;
  url?: string;
  image?: string;
  publishedAt?: string;
}

interface NewsFeedProps {
  ticker?: string;
  items?: NewsItem[]; // optional pre-fetched list (may include other ticks)
}

const Wrapper = styled.div`
  background: ${({ theme }) => theme.colors.tertiary};
  border-radius: 8px;
  padding: 12px;
  max-height: 340px;
  overflow: hidden;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 320px;
  overflow-y: auto;

  /* custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0,0,0,0.2);
    border-radius: 3px;
  }
`;

const Item = styled.li`
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(0,0,0,0.08);

  a.title {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    font-weight: 500;
    font-size: 14px;
  }
  a.title:hover {
    text-decoration: underline;
  }

  small {
    display: block;
    margin-top: 4px;
    font-size: 11px;
    color: #666;
  }
`;

const Placeholder = styled.div`
  padding: 16px;
  text-align: center;
  color: #666;
`;

const NewsFeed: React.FC<NewsFeedProps> = ({ ticker, items }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('NewsFeed effect run', { ticker, items });
    // if caller gave items we can use them immediately while a fetch may follow
    if (items) {
      setNews(items);
    }

    if (ticker) {
      // fetch remote articles to get images/dates or live updates
      const apiKey = "d394c4f38e1c49789d41305b66cf526c"
      console.log('NewsFeed apiKey', apiKey);
      if (!apiKey) {
        console.warn('NewsFeed: no API key, skipping request');
        return;
      }

      setLoading(true);
      axios
        // request multiple articles
        .get(`https://newsapi.org/v2/everything?q=${ticker}&pageSize=10&apiKey=${apiKey}`)
        .then((resp) => {
          console.log('NewsAPI response', resp.data);
          const articles = resp.data.articles || [];
          const parsed = articles.map((a: any) => ({
            title: a.title,
            source: a.source?.name,
            url: a.url,
            image: a.urlToImage,
            publishedAt: a.publishedAt,
          }));
          // sort by most recent first
          parsed.sort((a: NewsItem, b: NewsItem) => {
            const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
            const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
            return dateB - dateA;
          });
          setNews(parsed);
        })
        .catch((err) => {
          console.error('news fetch error', err);
          setError('Não foi possível carregar notícias: ' + (err.message || err));
        })
        .finally(() => setLoading(false));
    }
  }, [ticker, items]);

  if (loading) return <Placeholder>Carregando notícias...</Placeholder>;
  if (error) return <Placeholder>{error}</Placeholder>;
  if (!news || news.length === 0) return <Placeholder>Nenhuma notícia de {ticker || 'valor'} disponível</Placeholder>;
  console.log ("Entrou!")
  console.log (news)
  return (
    <Wrapper>
      <List>
      {news.map((n, idx) => (
        <Item key={idx}>
          {n.image && (
            <img
              src={n.image}
              alt=""
              style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 4 }}
            />
          )}
          <div style={{ flex: 1 }}>
            {n.url ? (
              <a className="title" href={n.url} target="_blank" rel="noreferrer">
                {n.title}
              </a>
            ) : (
              <span>{n.title}</span>
            )}
            <small>
              {n.source}
              {n.publishedAt ? ` • ${new Date(n.publishedAt).toLocaleDateString()}` : ''}
            </small>
          </div>
        </Item>
      ))}
      </List>
    </Wrapper>
  );
};

export default NewsFeed;
