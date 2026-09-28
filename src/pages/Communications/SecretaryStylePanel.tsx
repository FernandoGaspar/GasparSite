import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { MdCheckCircle, MdRefresh, MdTune } from 'react-icons/md';
import { URL_API } from '../../repositories/baseAPI';
import { idempotencyConfig } from '../../utils/idempotency';

type Style = {
  version:number;
  formality:'casual'|'neutral'|'formal';
  warmth:'warm'|'neutral'|'reserved';
  verbosity:'short'|'balanced'|'detailed';
  emojiUsage:'none'|'rare'|'moderate';
  greetingPreference:string;
  closingPreference:string;
  customInstructions:string;
  updatedAt?:string;
};
const defaults:Style={version:0,formality:'neutral',warmth:'warm',verbosity:'short',emojiUsage:'rare',greetingPreference:'Olá!',closingPreference:'Obrigada.',customInstructions:''};
const messageOf=(error:any,fallback:string)=>error?.response?.data?.message||fallback;
const unwrap=(data:any):Style=>data?.style||data?.item||data;

export default function SecretaryStylePanel(){
  const [style,setStyle]=useState<Style>(defaults);
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');

  const load=async()=>{setLoading(true);setError('');try{const {data}=await axios.get(`${URL_API}/secretary/style`);setStyle({...defaults,...unwrap(data)})}catch(cause){setError(messageOf(cause,'Não foi possível carregar o estilo da secretária.'))}finally{setLoading(false)}};
  useEffect(()=>{void load()},[]);
  const save=async()=>{if(busy)return;setBusy(true);setError('');setNotice('');try{const {data}=await axios.patch(`${URL_API}/secretary/style`,{...style,expectedVersion:style.version},idempotencyConfig('secretary-style'));setStyle({...style,...unwrap(data)});setNotice('Estilo de comunicação salvo.')}catch(cause:any){if(cause?.response?.status===409){setError('O estilo foi atualizado em outra tela. Recarregue antes de salvar novamente.')}else setError(messageOf(cause,'Não foi possível salvar o estilo.'))}finally{setBusy(false)}};
  const preview=useMemo(()=>{
    const options=style.formality==='formal'
      ? 'Há disponibilidade na terça às 15h ou na quarta às 10h. Qual horário seria mais conveniente?'
      : style.formality==='casual'
        ? 'Tenho terça às 15h ou quarta às 10h. Qual fica melhor pra você?'
        : 'Tenho terça às 15h ou quarta às 10h. Qual funciona melhor?';
    const detail=style.verbosity==='detailed'?`${options} Posso verificar outra opção, se necessário.`:style.verbosity==='balanced'?options:style.formality==='formal'?'Terça às 15h ou quarta às 10h. Qual horário prefere?':'Terça às 15h ou quarta às 10h?';
    const warmth=style.warmth==='warm'?'Espero que esteja tudo bem. ':style.warmth==='reserved'?'':'Tudo bem? ';
    const emoji=style.emojiUsage==='moderate'?' 🙂':style.emojiUsage==='rare'?' ✓':'';
    return `${style.greetingPreference || 'Olá!'} ${warmth}${detail} ${style.closingPreference || ''}${emoji}`.replace(/\s+/g,' ').trim();
  },[style]);
  if(loading)return <div className="wa-empty">Carregando estilo de comunicação…</div>;
  return <section className="style-panel">
    <header className="section-heading"><div><span>TOM DE COMUNICAÇÃO</span><h2>Estilo da secretária</h2><p>Defina como as mensagens soam para os seus contatos.</p></div><button className="secondary-action" onClick={()=>void load()}><MdRefresh/>Recarregar</button></header>
    {error&&<div className="wa-banner error" role="alert">{error}</div>}{notice&&<div className="wa-banner success"><MdCheckCircle/>{notice}</div>}
    <div className="style-layout"><div className="style-form panel-like">
      <label>Formalidade<select value={style.formality} onChange={event=>setStyle({...style,formality:event.target.value as Style['formality']})}><option value="casual">Casual</option><option value="neutral">Neutra</option><option value="formal">Formal</option></select></label>
      <label>Cordialidade<select value={style.warmth} onChange={event=>setStyle({...style,warmth:event.target.value as Style['warmth']})}><option value="warm">Acolhedora</option><option value="neutral">Neutra</option><option value="reserved">Reservada</option></select></label>
      <label>Concisão<select value={style.verbosity} onChange={event=>setStyle({...style,verbosity:event.target.value as Style['verbosity']})}><option value="short">Direta</option><option value="balanced">Equilibrada</option><option value="detailed">Detalhada</option></select></label>
      <label>Emojis<select value={style.emojiUsage} onChange={event=>setStyle({...style,emojiUsage:event.target.value as Style['emojiUsage']})}><option value="none">Não usar</option><option value="rare">Raramente</option><option value="moderate">Com moderação</option></select></label>
      <label>Saudação preferida<input value={style.greetingPreference} onChange={event=>setStyle({...style,greetingPreference:event.target.value})}/></label>
      <label>Despedida preferida<input value={style.closingPreference} onChange={event=>setStyle({...style,closingPreference:event.target.value})}/></label>
      <label className="wide">Orientações adicionais<textarea rows={4} value={style.customInstructions} onChange={event=>setStyle({...style,customInstructions:event.target.value})} placeholder="Ex.: evite abreviações e prefira horários no formato 24h"/></label>
    </div><aside className="style-preview"><span><MdTune/> PRÉVIA</span><div className="preview-bubble">{preview}</div><p>A prévia é ilustrativa; o conteúdo real respeita o contexto da negociação.</p></aside></div>
    <div className="permission-note"><strong>Estilo não altera permissões.</strong><span>Preferências de tom nunca autorizam iniciar, concluir ou reservar algo fora das aprovações e limites definidos por você.</span></div>
    <footer className="style-actions"><button className="primary-action" disabled={busy} onClick={()=>void save()}><MdCheckCircle/>{busy?'Salvando…':'Salvar estilo'}</button></footer>
  </section>;
}
