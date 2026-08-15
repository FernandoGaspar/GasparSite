import React, { useState, useEffect, useMemo } from 'react';

// simple buy/sell suggestion based on trend and news
import {
  Container,
  Column,
  Watchlist,
  WatchItem,
  Header,
  TickerTitle,
  Price,
  ChartPlaceholder,
  Section,
  NewsSection,
  FundamentalsGrid,
  Card,
} from './Enhanced.styles';

import NewsFeed from '../../components/NewsFeed';

import mocks from '../../mocks/investmentMocks';
import axios from 'axios';
import { URL_API } from '../../repositories/baseAPI';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface IDataPost {
  codigo: string;
  codigoGrafico: string;
  tipo: string;
  dataAtualizada: string;
  dataInicial: string;
  valorAtual: number;
  valorInicial: number;
  variacao: number;
  quantidade: number;
  saldoAtual: number;
  ultimoDividendo: number;
  dataUltimoDiv: string;
  tipoPapel: string;
}

interface IEvolucaoInvestimentoData {
  AnoMes: number;
  Codigo: string;
  ValorCotacao: number;
  Saldo: number;
}

interface IIndicador {
  AnoMes: string;
  Nome: string;
  Valor: number;
}

const EnhancedInvestment: React.FC = () => {
  const [selected, setSelected] = useState<string>(mocks.watchlist[0].ticker);
  const [investments, setInvestments] = useState<IDataPost[]>([]);

  const idUsuario = localStorage.getItem('@minha-carteira:usuarioId') as string;

  useEffect(() => {
    if (!idUsuario) return;
    axios
      .post(URL_API + '/papeisMonitorados', {
        headers: { 'Access-Control-Allow-Origin': '*' },
        idUsuario,
        periodo: 1,
      })
      .then((response) => {
        try {
          const parsed = JSON.parse(response.data) as IDataPost[];
          setInvestments(parsed);
          if (parsed.length > 0) {
            setSelected(parsed[0].codigo);
          }
        } catch (e) {
          console.error('Erro parsing investments', e);
        }
      })
      .catch((err) => {
        console.error('Erro carregando investimentos', err);
      });
  }, [idUsuario]);

  const watchlist =
    investments.length > 0
      ? investments.map((i) => ({ ticker: i.codigo, name: i.codigo }))
      : mocks.watchlist;

  const defaultAsset = { ticker: selected, name: selected, price: 0, changePercent: 0, fundamentals: {}, news: [] };
  const asset = mocks.assets[selected] || defaultAsset;

  // compute suggestion
  // suggestion will be defined after priceHistory

  const [evolucaoInvestimentos, setEvolucaoInvestimentos] = useState<IEvolucaoInvestimentoData[]>([]);
  const [indicadores, setIndicadores] = useState<IIndicador[]>([]);

  useEffect(() => {
    if (!idUsuario) return;
    axios
      .post(URL_API + '/evolucaoInvestimento', {
        headers: { 'Access-Control-Allow-Origin': '*' },
        idUsuario,
      })
      .then((resp) => {
        try {
          const parsed = JSON.parse(resp.data) as IEvolucaoInvestimentoData[];
          setEvolucaoInvestimentos(parsed);
        } catch (err) {
          console.error('erro parsing evolucaoInvestimento', err);
        }
      })
      .catch((err) => {
        console.error('erro fetch evolucaoInvestimento', err);
      });

    // also fetch macro indicators
    axios
      .post(URL_API + '/evolucaoIndicadores', {
        headers: { 'Access-Control-Allow-Origin': '*' },
      })
      .then((resp) => {
        try {
          const parsed = JSON.parse(resp.data) as IIndicador[];
          setIndicadores(parsed);
        } catch (err) {
          console.error('erro parsing indicadores', err);
        }
      })
      .catch((err) => {
        console.error('erro fetch indicadores', err);
      });
  }, [idUsuario]);

  const priceHistory = useMemo(() => {
    return evolucaoInvestimentos
      .filter((i) => i.Codigo === selected)
      .map((i) => ({
        date: i.AnoMes.toString(),
        price: i.ValorCotacao,
      }));
  }, [evolucaoInvestimentos, selected]);

  const suggestion = useMemo(() => {
    const newsList: { title: string }[] = asset.news || [];
    if (priceHistory.length < 2) return 'Sem dados suficientes';
    const first = priceHistory[0].price;
    const last = priceHistory[priceHistory.length - 1].price;
    const trend = last - first;
    let pos = 0,
      neg = 0;
    const positiveKeywords = ['recorde', 'alta', 'surge', 'aprovado', 'positivo', 'acima'];
    const negativeKeywords = ['queda', 'cai', 'crise', 'negativo', 'baixo', 'perda'];
    newsList.forEach((n) => {
      const t = n.title.toLowerCase();
      positiveKeywords.forEach((k) => {
        if (t.includes(k)) pos++;
      });
      negativeKeywords.forEach((k) => {
        if (t.includes(k)) neg++;
      });
    });
    if (trend > 0 && pos > neg)
      return 'Considere **COMPRAR** (tendência de alta + notícias positivas)';
    if (trend < 0 && neg > pos)
      return 'Considere **VENDER** (tendência de baixa + notícias negativas)';
    return 'Manter / sem sinal claro';
  }, [priceHistory, asset.news]);

  return (
    <Container>
      <Column>
        <Header>
          <div>Watchlist</div>
        </Header>
        <Watchlist>
          {watchlist.map((w: any) => (
            <WatchItem key={w.ticker} active={w.ticker === selected} onClick={() => setSelected(w.ticker)}>
              {w.ticker} {w.name && '— ' + w.name}
            </WatchItem>
          ))}
        </Watchlist>
      </Column>

      <Column>
        <Header>
          <div>
            <TickerTitle>{asset.name} ({asset.ticker})</TickerTitle>
            <Price>R$ {asset.price.toFixed(2)} <small>({asset.changePercent}% )</small></Price>
          </div>
          <div>
            <button style={{ padding: '8px 12px', borderRadius: 6 }}>Adicionar à carteira</button>
          </div>
        </Header>

        {priceHistory.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={priceHistory}>
              <XAxis dataKey="date" />
              <YAxis domain={["auto", "auto"]} />
              <Tooltip />
              <Line type="monotone" dataKey="price" stroke="#8884d8" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ChartPlaceholder>Sem histórico de preço</ChartPlaceholder>
        )}

        <Section>
          <h4>Visão Geral</h4>
          <FundamentalsGrid>
            <Card>P/E: {asset.fundamentals.pe}</Card>
            <Card>P/B: {asset.fundamentals.pb}</Card>
            <Card>ROE: {asset.fundamentals.roe}%</Card>
            <Card>Div Yield: {asset.fundamentals.divYield}%</Card>
          </FundamentalsGrid>
        </Section>

        <Section>
          <h4>Fundamentais (resumo)</h4>
          <div style={{ display: 'flex', gap: 12 }}>
            <Card style={{ flex: 1 }}>
              <div>Receita TTM</div>
              <div style={{ fontWeight: 700 }}>R$ {Number(asset.fundamentals.revenueTTM).toLocaleString()}</div>
            </Card>
            <Card style={{ flex: 1 }}>
              <div>Lucro Líquido TTM</div>
              <div style={{ fontWeight: 700 }}>R$ {Number(asset.fundamentals.netIncomeTTM).toLocaleString()}</div>
            </Card>
          </div>
        </Section>

        <NewsSection>
          <h4>Notícias de {asset.ticker}</h4>
          {/* pass only ticker so feed fetches real data; mocks are not needed now */}
          <NewsFeed ticker={asset.ticker} />
          <div style={{marginTop:10,fontStyle:'italic',color:'#444'}}>{suggestion}</div>
        </NewsSection>
      </Column>

      <Column>
        <Header>
          <div>Insights</div>
        </Header>

        <Section>
          <h4>Scorecard</h4>
          <Card>
            <div style={{ fontSize: 28, fontWeight: 700 }}>Buy</div>
            <div style={{ fontSize: 12, color: '#666' }}>Baseado em regras simples (mock)</div>
          </Card>
        </Section>

        <Section>
          <h4>Indicadores macro</h4>
          <FundamentalsGrid>
            {['selic','ipca','cdi','cdb'].map((nome) => {
              const latest = indicadores
                .filter(i => i.Nome.toLowerCase() === nome)
                .sort((a,b) => a.AnoMes.localeCompare(b.AnoMes))
                .slice(-1)[0];
              return (
                <Card key={nome}>
                  <div style={{ textTransform: 'uppercase' }}>{nome}</div>
                  <div style={{ fontWeight: 700 }}>{latest ? latest.Valor.toFixed(2) : '—'}</div>
                </Card>
              );
            })}
          </FundamentalsGrid>
        </Section>

        <Section>
          <h4>Ações rápidas</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button style={{ padding: '8px 12px', borderRadius: 6 }}>Gerar relatório PDF</button>
            <button style={{ padding: '8px 12px', borderRadius: 6 }}>Exportar CSV</button>
          </div>
        </Section>
      </Column>
    </Container>
  );
};

export default EnhancedInvestment;
