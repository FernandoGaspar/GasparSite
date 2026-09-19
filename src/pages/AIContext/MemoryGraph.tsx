import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  MdCheck,
  MdDeviceHub,
  MdLightbulbOutline,
  MdLink,
  MdOpenInNew,
  MdPeopleOutline,
  MdRefresh,
  MdSearch,
  MdBusinessCenter,
} from 'react-icons/md';
import { URL_API } from '../../repositories/baseAPI';
import './MemoryGraph.css';

type Node = { id:number; type:string; label:string; summary:string; horizon:string; importance:number; confidence:number; status:string; occurrences:number };
type Edge = { id:number; from:number; to:number; type:string; label:string; weight:number; confidence:number; status:string; evidenceCount:number };
type Graph = { nodes:Node[]; edges:Edge[]; summary:{ nodes:number; edges:number; episodes:number; pending:number; lastSuccessAt?:string; lastError?:string } };
type Evidence = { id:number; sourceType:string; occurredAt?:string; title:string; author:string; excerpt:string; sourceUrl:string };
type Horizon = '' | 'short' | 'medium' | 'long';

const colors: Record<string,string> = {
  person:'#55d6be', project:'#7c6cff', idea:'#f3c764', topic:'#7398ff',
  decision:'#ff8faa', activity:'#67c5ff', deadline:'#ff7c7c', artifact:'#b28dff', memory:'#a7b3d3',
};
const labels: Record<string,string> = {
  person:'Pessoas', project:'Projetos', idea:'Ideias', topic:'Temas', decision:'Decisões',
  activity:'Atividades', deadline:'Prazos', artifact:'Documentos', memory:'Memórias',
};
const horizonLabels: Record<string,string> = { short:'Curto prazo', medium:'Médio prazo', long:'Longo prazo' };
const clusterOrder = ['person','project','idea','topic','decision','activity','deadline','artifact','memory'];

export default function MemoryGraph({ onError, onNotice }:{ onError:(value:string)=>void; onNotice:(value:string)=>void }) {
  const [graph, setGraph] = useState<Graph | null>(null);
  const [selected, setSelected] = useState<Node | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [busy, setBusy] = useState(false);
  const [type, setType] = useState('');
  const [horizon, setHorizon] = useState<Horizon>('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    try {
      const result = await axios.get(`${URL_API}/api/ai/memory-graph`, { params:{ limit:160 } });
      setGraph(result.data);
    } catch (error:any) {
      onError(error.response?.data?.message || 'Não foi possível carregar o mapa de ideias.');
    }
  }, [onError]);

  useEffect(() => { void load(); }, [load]);

  const process = async () => {
    setBusy(true);
    try {
      const result = await axios.post(`${URL_API}/api/ai/memory-graph`, { limit:80 }, { timeout:120000 });
      onNotice(`${result.data.processed || 0} novas evidências processadas.`);
      await load();
    } catch (error:any) {
      onError(error.response?.data?.message || 'Não foi possível atualizar o mapa agora.');
    } finally {
      setBusy(false);
    }
  };

  const open = async (node:Node) => {
    setSelected(node);
    setEvidence([]);
    try {
      const result = await axios.get(`${URL_API}/api/ai/memory-graph/evidence`, { params:{ nodeId:node.id } });
      setEvidence(result.data.evidence || []);
    } catch {
      setEvidence([]);
    }
  };

  const review = async (status:'confirmed'|'rejected') => {
    if (!selected) return;
    setBusy(true);
    try {
      await axios.patch(`${URL_API}/api/ai/memory-graph/node/${selected.id}`, { status });
      setSelected(null);
      await load();
    } catch (error:any) {
      onError(error.response?.data?.message || 'Não foi possível revisar esta conexão.');
    } finally {
      setBusy(false);
    }
  };

  const filteredNodes = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    return (graph?.nodes || [])
      .filter(node => !type || node.type === type)
      .filter(node => !horizon || node.horizon === horizon)
      .filter(node => !term || `${node.label} ${node.summary}`.toLocaleLowerCase('pt-BR').includes(term))
      .sort((a,b) => b.importance - a.importance || b.occurrences - a.occurrences);
  }, [graph?.nodes, horizon, search, type]);
  const plotted = useMemo(() => layout(filteredNodes), [filteredNodes]);
  const byId = useMemo(() => new Map(plotted.items.map(item => [item.node.id, item])), [plotted.items]);
  const visibleEdges = useMemo(() => (graph?.edges || []).filter(edge => byId.has(edge.from) && byId.has(edge.to)), [byId, graph?.edges]);
  const focus = selected && filteredNodes.some(node => node.id === selected.id) ? selected : null;
  const counts = useMemo(() => (graph?.nodes || []).reduce<Record<string,number>>((result,node) => {
    result[node.type] = (result[node.type] || 0) + 1;
    return result;
  }, {}), [graph?.nodes]);

  return <div className="knowledge-map">
    <section className="knowledge-hero">
      <div className="knowledge-hero-copy"><span className="knowledge-icon"><MdLightbulbOutline /></span><div><small>INTELIGÊNCIA CONECTADA</small><h2>Mapa de ideias</h2><p>Veja como pessoas, projetos, decisões e ideias se relacionam — e volte à mensagem que originou cada conexão.</p></div></div>
      <button className="knowledge-process" disabled={busy} onClick={() => void process()}><MdRefresh className={busy ? 'spin' : ''}/><span>{busy ? 'Analisando novidades…' : 'Atualizar com Teams e Outlook'}<small>Processa apenas o que chegou desde a última leitura</small></span></button>
      <div className="knowledge-health"><span className="live-dot"/><strong>{graph?.summary.lastSuccessAt ? 'Mapa atualizado' : 'Aguardando primeiro processamento'}</strong>{graph?.summary.lastSuccessAt && <small>{new Date(graph.summary.lastSuccessAt).toLocaleString('pt-BR')}</small>}<small>{graph?.summary.pending || 0} evidências aguardando análise</small></div>
    </section>

    <section className="knowledge-kpis">
      <article><span className="idea"><MdLightbulbOutline /></span><div><strong>{counts.idea || 0}</strong><small>Ideias identificadas</small></div></article>
      <article><span className="project"><MdBusinessCenter /></span><div><strong>{counts.project || 0}</strong><small>Projetos conectados</small></div></article>
      <article><span className="person"><MdPeopleOutline /></span><div><strong>{counts.person || 0}</strong><small>Pessoas relacionadas</small></div></article>
      <article><span className="link"><MdLink /></span><div><strong>{graph?.summary.edges || 0}</strong><small>Relações encontradas</small></div></article>
    </section>

    <section className="knowledge-toolbar">
      <label><MdSearch /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar ideia, pessoa, projeto ou decisão" /></label>
      <div className="knowledge-horizons" role="group" aria-label="Filtrar período">{([['','Tudo'],['short','Agora'],['medium','Em andamento'],['long','Estratégico']] as [Horizon,string][]).map(([value,label]) => <button key={value || 'all'} className={horizon === value ? 'active' : ''} onClick={() => setHorizon(value)}>{label}</button>)}</div>
      <select value={type} onChange={event => setType(event.target.value)}><option value="">Todos os núcleos</option>{Object.entries(labels).map(([key,label]) => <option key={key} value={key}>{label}</option>)}</select>
    </section>

    <div className="knowledge-layout">
      <aside className="knowledge-directory">
        <header><div><small>EXPLORAR</small><h3>Assuntos em destaque</h3></div><span>{filteredNodes.length}</span></header>
        <div>{filteredNodes.slice(0, 24).map(node => <button key={node.id} className={focus?.id === node.id ? 'active' : ''} onClick={() => void open(node)}><i style={{ background:colors[node.type] || colors.memory }}/><span><strong>{node.label}</strong><small>{labels[node.type] || node.type} · {node.occurrences} menções</small></span><em>{Math.round(node.importance * 100)}</em></button>)}</div>
        {!filteredNodes.length && <div className="knowledge-no-result">Nenhum assunto corresponde aos filtros.</div>}
      </aside>

      <section className="knowledge-canvas">
        <header><div><small>VISÃO CONECTADA</small><h3>Como os assuntos se relacionam</h3></div><span>Selecione um cartão para ver as evidências</span></header>
        <div className="knowledge-canvas-scroll">
          {plotted.items.length ? <svg viewBox={`0 0 1170 ${plotted.height}`} role="img" aria-label="Mapa de ideias e suas relações">
            <defs><filter id="node-glow"><feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
            <g className="knowledge-edges">{visibleEdges.map(edge => {
              const from = byId.get(edge.from);
              const to = byId.get(edge.to);
              return from && to ? <line key={edge.id} x1={from.x} y1={from.y} x2={to.x} y2={to.y} className={edge.status === 'confirmed' ? 'confirmed' : ''} style={{ strokeWidth:1 + edge.weight * 3, opacity:.2 + edge.confidence * .38 }}/> : null;
            })}</g>
            <g className="knowledge-clusters">{plotted.clusters.map(cluster => <g key={cluster.type}><circle cx={cluster.x} cy={cluster.y + 48} r="92" style={{ fill:colors[cluster.type] || colors.memory }} opacity=".035"/><text x={cluster.x} y={cluster.y - 34} textAnchor="middle">{labels[cluster.type] || cluster.type}</text></g>)}</g>
            <g>{plotted.items.map(({ node,x,y }) => <g key={node.id} className={`knowledge-node${focus?.id === node.id ? ' selected' : ''}`} transform={`translate(${x} ${y})`} role="button" tabIndex={0} onClick={() => void open(node)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') void open(node); }}>
              <rect x="-78" y="-23" width="156" height="46" rx="13"/><circle cx="-58" cy="0" r="7" style={{ fill:colors[node.type] || colors.memory }} filter={focus?.id === node.id ? 'url(#node-glow)' : undefined}/><text x="-43" y="-4" className="node-kind">{labels[node.type] || node.type}</text><text x="-43" y="12" className="node-label">{short(node.label, 19)}</text>
            </g>)}</g>
          </svg> : <div className="knowledge-empty"><MdDeviceHub /><h3>O mapa começa com uma conexão</h3><p>Atualize com Teams e Outlook para identificar pessoas, ideias, projetos e decisões.</p><button onClick={() => void process()}>Processar minhas novidades</button></div>}
        </div>
        <footer>{Object.entries(colors).map(([key,color]) => <span key={key}><i style={{ background:color }}/>{labels[key]}</span>)}</footer>
      </section>

      <aside className="knowledge-detail">
        {focus ? <>
          <header><i style={{ background:colors[focus.type] || colors.memory }}/><div><small>{labels[focus.type] || focus.type} · {horizonLabels[focus.horizon] || 'Memória contínua'}</small><h3>{focus.label}</h3></div></header>
          <p className="knowledge-summary">{focus.summary || 'Este assunto foi identificado nas suas comunicações.'}</p>
          <div className="knowledge-score"><span><strong>{Math.round(focus.importance * 100)}%</strong>relevância</span><span><strong>{Math.round(focus.confidence * 100)}%</strong>confiança</span><span><strong>{focus.occurrences}</strong>menções</span></div>
          <div className="knowledge-evidence-head"><div><small>POR QUE ISSO ESTÁ AQUI?</small><h4>Evidências encontradas</h4></div><span>{evidence.length}</span></div>
          <div className="knowledge-evidence">{evidence.map(item => <article key={item.id}><span>{item.sourceType === 'teams' ? 'Teams' : item.sourceType === 'mail' ? 'Outlook' : item.sourceType}</span><strong>{item.title}</strong><small>{item.author}{item.occurredAt ? ` · ${new Date(item.occurredAt).toLocaleDateString('pt-BR')}` : ''}</small><p>{item.excerpt}</p>{item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noreferrer"><MdOpenInNew />Abrir mensagem original</a>}</article>)}{!evidence.length && <div className="knowledge-no-evidence">As evidências deste assunto ainda estão sendo consolidadas.</div>}</div>
          <div className="knowledge-review">{focus.status !== 'confirmed' && <button className="confirm" disabled={busy} onClick={() => void review('confirmed')}><MdCheck />Manter como memória importante</button>}<button className="dismiss" disabled={busy} onClick={() => void review('rejected')}>Não é relevante</button></div>
        </> : <div className="knowledge-welcome"><span><MdDeviceHub /></span><h3>Explore uma conexão</h3><p>Selecione um assunto na lista ou no mapa. Você verá o resumo, a relevância e as mensagens que deram origem àquela conexão.</p><ol><li><b>1</b>Escolha um assunto</li><li><b>2</b>Revise as evidências</li><li><b>3</b>Confirme o que merece permanecer</li></ol></div>}
      </aside>
    </div>
  </div>;
}

function short(value:string,max:number) {
  return value.length > max ? `${value.slice(0,max - 1)}…` : value;
}

function layout(nodes:Node[]) {
  const grouped = new Map<string,Node[]>();
  nodes.forEach(node => grouped.set(node.type, [...(grouped.get(node.type) || []), node]));
  const types = clusterOrder.filter(type => grouped.has(type));
  const unknown = [...grouped.keys()].filter(type => !clusterOrder.includes(type));
  const activeTypes = [...types, ...unknown].slice(0, 9);
  const offsets = [[-80,16],[80,16],[-80,72],[80,72],[0,128]];
  const items:{ node:Node; x:number; y:number }[] = [];
  const clusters:{ type:string; x:number; y:number }[] = [];
  activeTypes.forEach((nodeType,index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const x = 195 + col * 390;
    const y = 82 + row * 220;
    clusters.push({ type:nodeType,x,y });
    (grouped.get(nodeType) || []).slice(0,5).forEach((node,nodeIndex) => {
      items.push({ node,x:x + offsets[nodeIndex][0],y:y + offsets[nodeIndex][1] });
    });
  });
  return { items,clusters,height:Math.max(480, Math.ceil(activeTypes.length / 3) * 220 + 35) };
}
