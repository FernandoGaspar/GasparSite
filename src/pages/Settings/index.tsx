import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { MdHistory, MdPlayArrow, MdRefresh, MdSettings } from 'react-icons/md';
import { URL_API } from '../../repositories/baseAPI';
import { Container } from './styles';

interface Automation { name: string; enabled: boolean; description?: string; last_status?: number; last_run_date?: number; last_run_time?: number; last_run_duration?: number; last_message?: string; start_execution_date?: string; stop_execution_date?: string; can_run: boolean; }
interface History { step_id: number; step_name: string; run_status: number; run_date: number; run_time: number; run_duration: number; message: string; }
const status = (value?: number) => value === 1 ? 'Sucesso' : value === 0 ? 'Falhou' : value === 4 ? 'Em andamento' : 'Sem execução';

const Settings: React.FC = () => {
  const [jobs, setJobs] = useState<Automation[]>([]); const [selected, setSelected] = useState<Automation | null>(null); const [history, setHistory] = useState<History[]>([]); const [loading, setLoading] = useState(true); const [message, setMessage] = useState('');
  const load = useCallback(async () => { setLoading(true); try { const { data } = await axios.get(`${URL_API}/automations`); setJobs(data); } catch { setMessage('Não foi possível carregar as automações.'); } finally { setLoading(false); } }, []);
  const select = async (job: Automation) => { setSelected(job); try { const { data } = await axios.get(`${URL_API}/automations/${encodeURIComponent(job.name)}/history`); setHistory(data); } catch { setHistory([]); setMessage('Não foi possível carregar o histórico.'); } };
  const start = async () => { if (!selected || !window.confirm(`Executar “${selected.name}” agora?`)) return; try { const { data } = await axios.post(`${URL_API}/automations/${encodeURIComponent(selected.name)}/start`); setMessage(data.message); load(); } catch (error: any) { setMessage(error?.response?.data?.message || 'Não foi possível iniciar a automação.'); } };
  useEffect(() => { load(); }, [load]);
  return <Container>
    <header><div><span><MdSettings /> CONFIGURAÇÕES</span><h1>Automações</h1><p>Acompanhe os robôs agendados no SQL Server Agent e execute rotinas autorizadas.</p></div><button onClick={load}><MdRefresh /> Atualizar</button></header>
    {message && <div className="notice">{message}</div>}
    <section className="summary"><article><small>Automações</small><strong>{jobs.length}</strong></article><article><small>Em execução</small><strong>{jobs.filter((job) => job.start_execution_date && !job.stop_execution_date).length}</strong></article><article><small>Últimas falhas</small><strong>{jobs.filter((job) => job.last_status === 0).length}</strong></article></section>
    <main><section className="job-list"><div className="section-title"><h2>Rotinas</h2><span>{loading ? 'Carregando...' : `${jobs.length} encontradas`}</span></div>{jobs.map((job) => <button className={`job ${selected?.name === job.name ? 'selected' : ''}`} key={job.name} onClick={() => select(job)}><span className={`dot ${status(job.last_status).replaceAll(' ', '-')}`} /><div><strong>{job.name}</strong><small>{job.description || 'Rotina automática do sistema'}</small></div><em>{status(job.last_status)}</em></button>)}</section>
      <section className="details">{selected ? <><div className="detail-head"><div><span>DETALHES DA AUTOMAÇÃO</span><h2>{selected.name}</h2><p>{selected.description || 'Sem descrição cadastrada.'}</p></div>{selected.can_run && <button className="run" onClick={start}><MdPlayArrow /> Executar agora</button>}</div><div className="meta"><div><small>Status</small><b>{status(selected.last_status)}</b></div><div><small>Última execução</small><b>{selected.last_run_date || '—'}</b></div><div><small>Duração</small><b>{selected.last_run_duration || '—'}</b></div></div><h3><MdHistory /> Histórico de execuções</h3><div className="history">{history.length ? history.map((item, index) => <article key={index}><b>{status(item.run_status)}</b><span>{item.step_name || 'Job'} · {item.run_date || '—'}</span><p>{item.message || 'Sem mensagem registrada.'}</p></article>) : <p>Nenhuma execução encontrada.</p>}</div></> : <div className="empty"><MdSettings /><h2>Selecione uma automação</h2><p>Veja aqui seu histórico, mensagens e controles disponíveis.</p></div>}</section>
    </main>
  </Container>;
};
export default Settings;
