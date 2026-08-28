import React, { useEffect, useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { MdArrowBack } from 'react-icons/md';
import { useShowNumber } from '../../hooks/showNumber';
import { Container, LegendItem } from './styles';

interface IPieChartProps { titulo:string; data:{ grupo:string; subGrupo:string; Valor:number; Cor:string }[] }
interface IChartItem { name:string; value:number; color:string; source?:string }

const palette=['#6C7CFF','#22C7A9','#F2B84B','#F06D8F','#43A6DD','#9B72F2','#F28C52','#6FCF75'];
const formatCurrency=(value:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(value);
const compact=(items:IChartItem[],limit=7):IChartItem[]=>{
  const sorted=[...items].sort((a,b)=>b.value-a.value);
  if(sorted.length<=limit)return sorted.map((item,index)=>({...item,color:palette[index%palette.length]}));
  const visible=sorted.slice(0,limit-1).map((item,index)=>({...item,color:palette[index%palette.length]}));
  return [...visible,{name:`Outros (${sorted.length-limit+1})`,value:sorted.slice(limit-1).reduce((sum,item)=>sum+item.value,0),color:'#718096'}];
};
const ChartTooltip=({active,payload,showNumber}:any)=>{
  if(!active||!payload?.length)return null;const item=payload[0].payload as IChartItem;
  return <div className="chart-tooltip"><strong>{item.name}</strong><span>{showNumber?formatCurrency(item.value):'••••••'}</span></div>;
};

const PieChartBox:React.FC<IPieChartProps>=({titulo,data})=>{
  const [selectedGroup,setSelectedGroup]=useState<string|null>(null);const {showNumber}=useShowNumber();
  const normalized=useMemo(()=>data.map(item=>({group:String(item.grupo||'Sem categoria'),subgroup:String(item.subGrupo||item.grupo||'Sem categoria'),value:Math.abs(Number(item.Valor)||0)})).filter(item=>item.value>0),[data]);
  const groups=useMemo(()=>{const values=new Map<string,number>();normalized.forEach(item=>values.set(item.group,(values.get(item.group)||0)+item.value));return Array.from(values,([name,value])=>({name,value,color:'',source:name})).sort((a,b)=>b.value-a.value);},[normalized]);
  const chartData=useMemo(()=>{if(!selectedGroup)return compact(groups);const values=new Map<string,number>();normalized.filter(item=>item.group===selectedGroup).forEach(item=>values.set(item.subgroup,(values.get(item.subgroup)||0)+item.value));return compact(Array.from(values,([name,value])=>({name,value,color:'',source:name})));},[groups,normalized,selectedGroup]);
  useEffect(()=>{if(selectedGroup&&!groups.some(item=>item.name===selectedGroup))setSelectedGroup(null);},[groups,selectedGroup]);
  const total=useMemo(()=>chartData.reduce((sum,item)=>sum+item.value,0),[chartData]);const mainTotal=useMemo(()=>groups.reduce((sum,item)=>sum+item.value,0),[groups]);
  const centerLabel=selectedGroup||(titulo.toLowerCase().includes('invest')?'Carteira':'Gastos');
  return <Container><header className="pie-header"><div><span>VISÃO POR CATEGORIA</span><h3>{titulo}</h3><p>{selectedGroup?`Detalhamento de ${selectedGroup}`:`${groups.length} categorias no período`}</p></div>{selectedGroup&&<button onClick={()=>setSelectedGroup(null)}><MdArrowBack/> Todos</button>}</header>
    {chartData.length?<div className="pie-content"><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%" debounce={80}><PieChart><Tooltip content={<ChartTooltip showNumber={showNumber}/>}/><Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="66%" outerRadius="91%" paddingAngle={2.2} cornerRadius={5} stroke="none" onClick={(item)=>!selectedGroup&&item.source&&setSelectedGroup(item.source)}>{chartData.map(item=><Cell key={item.name} fill={item.color} className="pie-cell"/>)}</Pie></PieChart></ResponsiveContainer><div className="pie-center"><small>{centerLabel}</small><strong>{showNumber?formatCurrency(total):'••••••'}</strong>{selectedGroup&&<em>{Math.round(total/mainTotal*100)}% do total</em>}</div></div>
      <div className="pie-legend" aria-label={`Distribuição de ${titulo}`}>{chartData.map(item=>{const percent=total?item.value/total*100:0;return <LegendItem key={item.name} color={item.color} type="button" disabled={!!selectedGroup||!item.source} onClick={()=>item.source&&setSelectedGroup(item.source)}><i/><span><strong>{item.name}</strong><small>{showNumber?formatCurrency(item.value):'••••••'}</small></span><b>{percent<1?'<1':Math.round(percent)}%</b><em><i style={{width:`${Math.max(3,percent)}%`}}/></em></LegendItem>;})}</div></div>:<div className="pie-empty"><strong>Sem dados neste período</strong><span>Quando houver movimentações, a distribuição aparecerá aqui.</span></div>}
  </Container>;
};
export default PieChartBox;
