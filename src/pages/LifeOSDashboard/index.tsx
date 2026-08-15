import React from 'react';
import { FiAlertTriangle, FiArrowDownLeft, FiArrowUpRight, FiBell, FiCalendar, FiCheckSquare, FiChevronRight, FiHome, FiMoreHorizontal, FiSearch, FiShoppingCart, FiSun, FiTruck, FiZap } from 'react-icons/fi';
import { Container, Header, MetricCard, Panel, QuickAction, SectionHeader, Trend } from './styles';

const transactions = [
    { icon: <FiShoppingCart />, title: 'Supermercado Extra', category: 'Alimentação', date: '24/05', value: '-R$ 356,50', tone: 'green' },
    { icon: <FiArrowUpRight />, title: 'Transferência recebida', category: 'Salário', date: '24/05', value: '+R$ 4.850,00', tone: 'green' },
    { icon: <FiTruck />, title: 'Uber Trip', category: 'Transporte', date: '23/05', value: '-R$ 28,40', tone: 'orange' },
    { icon: <FiMoreHorizontal />, title: 'Netflix', category: 'Entretenimento', date: '22/05', value: '-R$ 55,90', tone: 'red' },
];

const LifeOSDashboard: React.FC = () => (
    <Container>
        <Header>
            <div className="search"><FiSearch /><span>Buscar no LifeOS...</span></div>
            <div className="header-actions"><button className="period"><FiCalendar /> 01 – 31 de mai. de 2025 <FiChevronRight /></button><button className="notification"><FiBell /><b>2</b></button><div className="profile"><div className="avatar">CG</div><div><strong>Olá, Carlos</strong><small>Plano Premium</small></div></div></div>
        </Header>

        <section className="metrics">
            <MetricCard className="wealth"><span>Patrimônio consolidado</span><strong>R$ 282.650,20</strong><small>↑ 4,7% no mês</small><Trend><i /><i /><i /><i /><i /><i /><i /><i /></Trend></MetricCard>
            <MetricCard><span><b className="mint">◈</b> Gastos do mês</span><strong>R$ 8.736,42</strong><small className="mint-text">78% do orçamento</small><div className="progress"><i /></div></MetricCard>
            <MetricCard><span><b className="amber">◉</b> Budget utilizado</span><strong>78%</strong><small className="amber-text">R$ 8.736,42 de R$ 11.200</small><div className="progress amber-progress"><i /></div></MetricCard>
            <MetricCard><span><b className="violet">▣</b> Contas a vencer</span><strong>R$ 2.345,90</strong><small>5 contas</small><div className="progress violet-progress"><i /></div></MetricCard>
        </section>

        <section className="quick-actions">
            <QuickAction className="primary"><b>＋</b> Adicionar gasto</QuickAction><QuickAction><FiArrowDownLeft /> Transferir</QuickAction><QuickAction><FiCalendar /> Pagar conta</QuickAction><QuickAction><FiCheckSquare /> Nova tarefa</QuickAction>
        </section>

        <section className="main-grid">
            <Panel className="budget"><SectionHeader title="Orçamento vs. Realizado" action="Mês" /><div className="chart-key"><span><i /> Orçamento</span><span><i /> Realizado</span></div><div className="bar-chart">{[36, 58, 42, 72, 53, 78, 62, 88, 69, 95, 81, 100].map((height, index) => <div key={index}><i style={{ height: `${height}%` }} /><b style={{ height: `${Math.max(height - (index % 3) * 14, 18)}%` }} /></div>)}</div><div className="chart-labels"><span>01/mai</span><span>08/mai</span><span>15/mai</span><span>22/mai</span><span>31/mai</span></div></Panel>
            <Panel className="categories"><SectionHeader title="Gastos por categoria" /><div className="category-content"><div className="donut"><div><strong>R$ 8.736</strong><small>Total</small></div></div><ul><li><i className="blue" />Moradia <b>30%</b></li><li><i className="mint-dot" />Alimentação <b>21%</b></li><li><i className="orange-dot" />Transporte <b>15%</b></li><li><i className="violet-dot" />Lazer <b>10%</b></li><li><i className="gray-dot" />Outros <b>24%</b></li></ul></div><button className="link">Ver todas as categorias <FiChevronRight /></button></Panel>
            <Panel className="transactions"><SectionHeader title="Transações recentes" action="Ver todas" />{transactions.map(item => <article key={item.title}><span className={`transaction-icon ${item.tone}`}>{item.icon}</span><div><strong>{item.title}</strong><small>{item.category}</small></div><time>{item.date}</time><b className={item.tone}>{item.value}</b></article>)}</Panel>
        </section>

        <section className="bottom-grid">
            <Panel className="smart-home"><SectionHeader title="Casa inteligente" action="Ver dispositivos" /><div className="devices"><div><FiSun /><strong>Iluminação</strong><small>5 luzes acesas</small></div><div><FiZap /><strong>Ar-condicionado</strong><small>23 °C · Sala</small></div><div><FiHome /><strong>Câmeras</strong><small>3 online</small></div><div><FiHome /><strong>Portão</strong><small>Fechado</small></div><div><span>≈</span><strong>Piscina</strong><small>28,5 °C</small></div><div><FiZap /><strong>Energia solar</strong><small>3,2 kW</small></div></div><footer><span>●</span> Tudo funcionando normalmente <FiChevronRight /></footer></Panel>
            <Panel className="radar"><SectionHeader title="Radar da IA" action="Ver insights" /><article><b className="danger"><FiAlertTriangle /></b><div><strong>Gasto acima do habitual</strong><small>Compras em supermercados em 23/05: R$ 118,90</small></div><em>Atenção</em></article><article><b className="opportunity">✦</b><div><strong>Oportunidade</strong><small>Você pode economizar até R$ 320/mês</small></div><em className="green-label">Sugestão</em></article><article><b className="info">◈</b><div><strong>Meta em dia</strong><small>Você está no caminho certo com suas metas.</small></div><em className="blue-label">Info</em></article></Panel>
            <Panel className="tasks"><SectionHeader title="Próximas ações" action="Ver todas" />{['Reunião com time', 'Almoço com cliente', 'Conta de luz', 'Seguro do carro', 'Plano de saúde'].map((task, index) => <article key={task}><span className="check" /> <div><strong>{task}</strong><small>{index < 2 ? 'Hoje' : index === 2 ? 'Amanhã' : `${index + 1} dias`}</small></div><em className={index < 2 ? 'blue-label' : index === 2 ? 'amber-label' : 'danger-label'}>{index < 2 ? 'Hoje' : index === 2 ? 'Amanhã' : `${index + 1} dias`}</em></article>)}</Panel>
        </section>

        <footer className="integrations"><strong>Integrações</strong><span>◧ Itaú</span><span>◈ Nubank</span><span>⌂ Google Home</span><span>◉ Mercado Pago</span><span>● Spotify</span><button>Ver todas integrações <FiChevronRight /></button></footer>
    </Container>
);

export default LifeOSDashboard;
