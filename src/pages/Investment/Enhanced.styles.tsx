import styled from 'styled-components';

export const Container = styled.div`
  display: grid;
  grid-template-columns: 260px 1fr 320px;
  gap: 20px;
  padding: 20px;
`;

export const Column = styled.div`
  background: ${({ theme }) => theme.colors.secondary || '#fff'};
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
`;

export const Watchlist = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const WatchItem = styled.li<{ active?: boolean }>`
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  background: ${({ active, theme }) => (active ? theme.colors.primary || '#1976d2' : 'transparent')};
  color: ${({ active }) => (active ? '#fff' : 'inherit')};
  margin-bottom: 6px;
`;

export const Header = styled.div`
  display:flex;
  align-items:center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

export const TickerTitle = styled.h2`
  margin: 0;
  font-size: 18px;
`;

export const Price = styled.div`
  font-weight: 700;
  margin-top: 6px;
`;

export const ChartPlaceholder = styled.div`
  height: 220px;
  background: linear-gradient(90deg, rgba(0,0,0,0.03), rgba(0,0,0,0.01));
  border-radius: 8px;
  display:flex;
  align-items:center;
  justify-content:center;
  color: #666;
`;

export const Section = styled.div`
  margin-top: 12px;
`;

export const NewsSection = styled(Section)`
  background: ${({ theme }) => theme.colors.secondary};
  padding: 12px;
  border-radius: 8px;

  h4 {
    margin: 0 0 8px 0;
    font-size: 16px;
  }
`;

export const NewsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const NewsItem = styled.li`
  padding: 8px 0;
  border-bottom: 1px solid rgba(0,0,0,0.04);
`;

export const FundamentalsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
`;

export const Card = styled.div`
  padding: 8px;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.tertiary || '#fafafa'};
`;
