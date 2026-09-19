import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  MdAccessTime, MdAccountBalance, MdClose, MdHome, MdInfoOutline, MdPieChart,
  MdKeyboardArrowDown, MdKeyboardArrowUp, MdRefresh, MdSecurity, MdShowChart,
  MdSupervisorAccount, MdViewList, MdAssignmentTurnedIn,
} from 'react-icons/md';
import Chat, { AgentAlert } from '../../components/Chat';
import { Container } from './styles';
import { URL_API } from '../../repositories/baseAPI';

interface AgentDefinition {
  id: string;
  name: string;
  role: string;
  specialties: string[];
  dataSources: string[];
  prompt: string;
  cadence: string;
  executionMode: 'scheduled' | 'on_demand';
  sharesTeamHistory: boolean;
}

interface AgentStatus {
  agent: string;
  status: string;
  summary: string;
  alerts: AgentAlert[];
  completedAt?: string;
  nextRunAt?: string;
}

interface Schedule { intervalSeconds: number; runsOnStartup: boolean; minimumIntervalSeconds: number; }

const fallbackAgents: AgentDefinition[] = [
  { id:'general', name:'Coordenador geral', role:'Orquestra a equipe e conecta assuntos de mais de uma especialidade.', specialties:['Triagem', 'Delegação', 'Síntese da equipe'], dataSources:['Histórico da equipe', 'Alertas dos especialistas'], prompt:'O prompt completo será carregado pela API.', cadence:'Sob demanda', executionMode:'on_demand', sharesTeamHistory:true },
  { id:'guardian', name:'Guardião financeiro', role:'Detecta riscos e situações financeiras que exigem atenção.', specialties:['Anomalias', 'Duplicidades', 'Contas urgentes'], dataSources:['Transações', 'Recorrências'], prompt:'O prompt completo será carregado pela API.', cadence:'A cada 6 horas', executionMode:'scheduled', sharesTeamHistory:false },
  { id:'organizer', name:'Organizador financeiro', role:'Transforma pendências em uma rotina clara de organização.', specialties:['Categorias', 'Recorrências', 'Conciliação'], dataSources:['Transações', 'Categorias'], prompt:'O prompt completo será carregado pela API.', cadence:'A cada 6 horas', executionMode:'scheduled', sharesTeamHistory:false },
  { id:'planner', name:'Planejador financeiro', role:'Projeta o caixa e transforma objetivos em planos conservadores.', specialties:['Fluxo de caixa', 'Metas', 'Cenários'], dataSources:['Saldo', 'Contas futuras'], prompt:'O prompt completo será carregado pela API.', cadence:'A cada 6 horas', executionMode:'scheduled', sharesTeamHistory:false },
  { id:'economist', name:'Economista doméstico', role:'Encontra economias mensuráveis nos gastos reais.', specialties:['Comparações', 'Economia recorrente', 'Categorias'], dataSources:['Despesas', 'Recorrências'], prompt:'O prompt completo será carregado pela API.', cadence:'A cada 6 horas', executionMode:'scheduled', sharesTeamHistory:false },
  { id:'investor', name:'Especialista em investimentos', role:'Analisa carteira, integração e risco dos investimentos.', specialties:['Diversificação', 'Liquidez', 'Integrações'], dataSources:['Posições', 'Pluggy'], prompt:'O prompt completo será carregado pela API.', cadence:'A cada 6 horas', executionMode:'scheduled', sharesTeamHistory:false },
  { id:'activity_manager', name:'Gestor de atividades', role:'Cruza atividades, responsáveis, projetos, prazos e memória para antecipar gargalos.', specialties:['Prazos', 'Responsáveis', 'Projetos', 'Follow-ups'], dataSources:['Atividades', 'Projetos', 'Memória'], prompt:'O prompt completo será carregado pela API.', cadence:'A cada 6 horas', executionMode:'scheduled', sharesTeamHistory:false },
  { id:'home', name:'Especialista da casa', role:'Cuida dos dispositivos, rotinas e sinais da casa conectada.', specialties:['Dispositivos', 'Rotinas', 'Câmeras'], dataSources:['Home Assistant', 'Snapshots'], prompt:'O prompt completo será carregado pela API.', cadence:'A cada 6 horas', executionMode:'scheduled', sharesTeamHistory:false },
];

const icons: Record<string, React.ComponentType> = {
  general: MdSupervisorAccount, guardian: MdSecurity, organizer: MdViewList,
  planner: MdPieChart, economist: MdAccountBalance, investor: MdShowChart,
  activity_manager: MdAssignmentTurnedIn, home: MdHome,
};

const formatDate = (value?: string) => value
  ? new Date(value).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })
  : 'Ainda não executado';

const Assistant: React.FC = () => {
  const [selected, setSelected] = useState('general');
  const [agents, setAgents] = useState<AgentDefinition[]>(fallbackAgents);
  const [statuses, setStatuses] = useState<Record<string, AgentStatus>>({});
  const [schedule, setSchedule] = useState<Schedule>({ intervalSeconds:21600, runsOnStartup:true, minimumIntervalSeconds:900 });
  const [promptOpen, setPromptOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const userId = localStorage.getItem('@minha-carteira:usuarioId');
  const agent = useMemo(() => agents.find(item => item.id === selected) || agents[0], [agents, selected]);

  const load = async () => {
    setRefreshing(true);
    const [catalogResponse, statusResponse] = await Promise.all([
      axios.get(`${URL_API}/assistant/agents`).catch(() => null),
      axios.get(`${URL_API}/assistant/agents/status`, { params:{ idUsuario:userId } }).catch(() => null),
    ]);
    try {
      if (Array.isArray(catalogResponse?.data.agents)) setAgents(catalogResponse!.data.agents);
      const loadedStatuses = statusResponse?.data.agents || [];
      setStatuses(loadedStatuses.reduce((result:Record<string,AgentStatus>, item:AgentStatus) => ({ ...result, [item.agent]:item }), {}));
      if (statusResponse?.data.schedule) setSchedule(statusResponse.data.schedule);
    } finally { setRefreshing(false); }
  };

  useEffect(() => { if (userId) load(); }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedStatus = statuses[agent.id];
  const teamAlerts = agent.id === 'general'
    ? Object.values(statuses).flatMap(item => (item.alerts || []).map(alert => ({ ...alert, sourceAgent:item.agent })))
    : (selectedStatus?.alerts || []);
  const Icon = icons[agent.id] || MdSupervisorAccount;
  const intervalHours = schedule.intervalSeconds / 3600;
  const scheduledCount = agents.filter(item => item.executionMode === 'scheduled').length;

  return <Container>
    <header className="page-heading">
      <div><span>EQUIPE DE AGENTES</span><h1>Especialistas com memória e responsabilidades próprias</h1>
        <p>Converse com cada agente em um espaço separado ou use o Coordenador para delegar assuntos entre a equipe.</p></div>
      <button className="refresh" onClick={load} disabled={refreshing}><MdRefresh /> {refreshing ? 'Atualizando' : 'Atualizar status'}</button>
    </header>

    <div className="agents" role="list" aria-label="Agentes especializados">{agents.map(item => {
      const ItemIcon = icons[item.id] || MdSupervisorAccount;
      const status = statuses[item.id];
      return <button className={selected === item.id ? 'selected' : ''} onClick={() => { setSelected(item.id); setDetailsOpen(false); }} key={item.id}>
        <ItemIcon/><span><strong>{item.name}</strong><small>{item.role}</small>
          <em className={status?.status || (item.executionMode === 'on_demand' ? 'on-demand' : '')}>
            ● {item.executionMode === 'on_demand' ? 'Sob demanda' : status?.status === 'warning' ? 'Atenção' : status ? 'Monitorando' : 'Aguardando execução'}
          </em></span>
      </button>;
    })}</div>

    <div className="workspace">
      <aside className={`agent-profile ${detailsOpen ? 'expanded' : ''}`}>
        <div className="identity"><i><Icon /></i><div><span>{agent.executionMode === 'on_demand' ? 'ORQUESTRADOR' : 'ESPECIALISTA'}</span><h2>{agent.name}</h2></div></div>
        <p>{agent.role}</p>
        {agent.sharesTeamHistory && <div className="memory-note"><MdSupervisorAccount /><span>Este agente consulta a memória recente da equipe, mas o chat abaixo mostra somente a conversa dele.</span></div>}
        <button className="details-toggle" onClick={() => setDetailsOpen(current => !current)}>{detailsOpen ? 'Ocultar detalhes' : 'Ver detalhes do agente'}{detailsOpen ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}</button>
        <div className="profile-details">
          <section><h3>Especialidades</h3><div className="chips">{agent.specialties.map(item => <span key={item}>{item}</span>)}</div></section>
          <section><h3>Fontes consultadas</h3><ul>{agent.dataSources.map(item => <li key={item}>{item}</li>)}</ul></section>
          <button className="prompt-button" onClick={() => setPromptOpen(true)}><MdInfoOutline /> Ver prompt completo</button>
          <div className="run-info"><MdAccessTime/><div><strong>{agent.cadence}</strong>
            {agent.executionMode === 'scheduled' && <small>Última: {formatDate(selectedStatus?.completedAt)}<br/>Próxima estimada: {formatDate(selectedStatus?.nextRunAt)}</small>}
            {agent.executionMode === 'on_demand' && <small>Executa quando você envia uma mensagem.</small>}</div></div>
        </div>
      </aside>

      <main className="agent-chat">
        <Chat key={agent.id} page agent={agent.id} agentName={agent.name} agentRole={agent.role} alerts={teamAlerts} agentNames={Object.fromEntries(agents.map(item => [item.id, item.name]))} />
      </main>
    </div>

    <p className="cadence-note">Os {scheduledCount} monitores rodam ao iniciar o serviço e depois a cada {intervalHours.toLocaleString('pt-BR')} hora(s). O intervalo é configurável, com mínimo técnico de {schedule.minimumIntervalSeconds / 60} minutos. O Coordenador roda sob demanda.</p>

    {promptOpen && <div className="modal-backdrop" role="presentation" onMouseDown={() => setPromptOpen(false)}>
      <section className="prompt-modal" role="dialog" aria-modal="true" aria-labelledby="agent-prompt-title" onMouseDown={event => event.stopPropagation()}>
        <header><div><span>PROMPT DO AGENTE</span><h2 id="agent-prompt-title">{agent.name}</h2></div><button onClick={() => setPromptOpen(false)} aria-label="Fechar"><MdClose /></button></header>
        <p>Este é o conjunto completo de instruções fixas. Dados pessoais e alertas são anexados dinamicamente somente durante a execução.</p>
        <pre>{agent.prompt}</pre>
      </section>
    </div>}
  </Container>;
};

export default Assistant;
