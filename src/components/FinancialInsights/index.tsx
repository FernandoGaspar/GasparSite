import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MdLightbulbOutline } from 'react-icons/md';
import { URL_API } from '../../repositories/baseAPI';
import { deduplicatedRequest } from '../../repositories/requestCache';
import { Container } from './styles';

export interface Insight {
  type: 'warning' | 'positive' | 'info';
  title: string;
  description: string;
  actionLabel: string;
  actionUrl: string;
  details?: DuplicateDetail[];
}

interface DuplicateDetail {
  description: string;
  value: number;
  firstDate: string;
  secondDate: string;
  firstTransactionId: string | number;
  secondTransactionId: string | number;
}

const money = (value: number) => Math.abs(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const date = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR');

const FinancialInsights: React.FC = () => {
  const [items, setItems] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const userId = localStorage.getItem('@minha-carteira:usuarioId');

  useEffect(() => {
    if (!userId) return;
    deduplicatedRequest(
      `financial-planning:${userId}:90`,
      () => axios.get(`${URL_API}/financial-planning`, { params: { idUsuario: userId, days: 90 } }),
    )
      .then(({ data }) => setItems(Array.isArray(data.insights) ? data.insights : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [userId]);

  return <Container aria-label="Insights financeiros">
    <div className="insight-heading">
      <div><span>LEITURA INTELIGENTE</span><h2>Insights para você</h2></div>
      <Link to="/planning">Ver planejamento</Link>
    </div>
    <div className="insight-list">
      {loading && <p className="empty">Analisando seus dados…</p>}
      {!loading && items.length === 0 && <p className="empty">Não foi possível carregar os insights agora.</p>}
      {items.map((item, index) => <article className={`${item.type} ${expanded === index ? 'expanded' : ''}`} key={`${item.title}-${index}`}>
        <MdLightbulbOutline />
        <div><h3>{item.title}</h3><p>{item.description}</p>
          {item.details?.length
            ? <button className="details-toggle" onClick={() => setExpanded(expanded === index ? null : index)}>{expanded === index ? 'Ocultar duplicidades' : item.actionLabel} →</button>
            : <Link to={item.actionUrl}>{item.actionLabel} →</Link>}
          {item.details?.length && expanded === index && <div className="duplicate-list">{item.details.map((detail, detailIndex) => <div className="duplicate" key={`${detail.firstTransactionId}-${detail.secondTransactionId}-${detailIndex}`}>
            <strong>{detail.description}</strong><b>{money(detail.value)}</b>
            <small>{date(detail.firstDate)} e {date(detail.secondDate)}</small>
            <em>Transações #{detail.firstTransactionId} e #{detail.secondTransactionId}</em>
          </div>)}</div>}
        </div>
      </article>)}
    </div>
  </Container>;
};

export default FinancialInsights;
