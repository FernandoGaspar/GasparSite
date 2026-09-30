import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { MdDateRange, MdPlaylistAddCheck } from 'react-icons/md';
import { URL_API } from '../../repositories/baseAPI';
import MicrosoftWorkspace, { MicrosoftDraft } from '../Activities/MicrosoftWorkspace';
import { Container } from './styles';

type Activity={id:number;title:string;dueDate?:string|null;personName?:string;projectName?:string;status?:string};

export default function Agenda(){
  const history=useHistory();
  const [activities,setActivities]=useState<Activity[]>([]);
  const load=useCallback(async()=>{try{const {data}=await axios.get(`${URL_API}/activities`);setActivities(Array.isArray(data)?data:data?.items||[])}catch{setActivities([])}},[]);
  useEffect(()=>{void load()},[load]);
  const now=new Date();
  const today=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const dueToday=useMemo(()=>activities.filter(item=>item.dueDate?.slice(0,10)===today&&!['done','cancelled'].includes(item.status||'')),[activities,today]);
  const openDraft=(draft:MicrosoftDraft)=>history.push('/activities',{microsoftDraft:draft});
  return <Container>
    <header><span><MdDateRange/> AGENDA INTEGRADA</span><h1>Agenda</h1><p>Compromissos do Microsoft 365 e atividades previstas para o dia em uma única visão.</p></header>
    <section className="today"><div><small>ATIVIDADES DE HOJE</small><h2>{dueToday.length} {dueToday.length===1?'atividade prevista':'atividades previstas'}</h2></div><button onClick={()=>history.push('/activities')}><MdPlaylistAddCheck/>Abrir atividades</button>{dueToday.length?<div className="today-list">{dueToday.map(item=><article key={item.id}><strong>{item.title}</strong><span>{[item.personName,item.projectName].filter(Boolean).join(' · ')||'Sem responsável ou projeto'}</span></article>)}</div>:<p className="empty">Nenhuma atividade com prazo para hoje.</p>}</section>
    <MicrosoftWorkspace mode="agenda" activities={activities} onDraft={openDraft} onManageConnection={()=>history.push('/connections')}/>
  </Container>;
}
