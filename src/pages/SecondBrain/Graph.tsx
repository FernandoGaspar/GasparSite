import React,{useEffect,useMemo,useRef,useState} from 'react';
import {MdAdd,MdRemove,MdCenterFocusStrong} from 'react-icons/md';
import {colors,GraphData,GraphNode} from './types';

type Point = {node:GraphNode;x:number;y:number;vx:number;vy:number};
export function layoutGraph(data:GraphData,height=670):Point[] {
  const points = data.nodes.map((node,i) => { const a=i*2.39996323; const r=30+Math.sqrt(i)*20; return {node,x:480+Math.cos(a)*r,y:340+Math.sin(a)*r,vx:0,vy:0}; });
  const byId = new Map(points.map(p=>[p.node.id,p]));
  // Deterministic force layout, calculated once per graph rather than every frame.
  for(let step=0;step<95;step++) {
    for(let i=0;i<points.length;i++) {
      const a=points[i];
      for(let j=i+1;j<points.length;j++) { const b=points[j];let dx=a.x-b.x,dy=a.y-b.y;const d2=Math.max(80,dx*dx+dy*dy);const force=210/d2;a.vx+=dx*force;a.vy+=dy*force;b.vx-=dx*force;b.vy-=dy*force; }
      a.vx+=(480-a.x)*.004;a.vy+=(340-a.y)*.004;
    }
    data.edges.forEach(e=>{const a=byId.get(e.from),b=byId.get(e.to);if(!a||!b)return;const dx=b.x-a.x,dy=b.y-a.y;const d=Math.max(1,Math.hypot(dx,dy));const f=(d-(e.kind==='collection'?95:65))*.006;a.vx+=dx/d*f;a.vy+=dy/d*f;b.vx-=dx/d*f;b.vy-=dy/d*f;});
    points.forEach(p=>{p.vx*=.6;p.vy*=.6;p.x+=Math.max(-12,Math.min(12,p.vx));p.y+=Math.max(-12,Math.min(12,p.vy));});
  }
  if(points.length) { const minX=Math.min(...points.map(p=>p.x)),maxX=Math.max(...points.map(p=>p.x)),minY=Math.min(...points.map(p=>p.y)),maxY=Math.max(...points.map(p=>p.y));const scaleX=790/Math.max(1,maxX-minX),scaleY=(height-100)/Math.max(1,maxY-minY);points.forEach(p=>{p.x=480+(p.x-(minX+maxX)/2)*scaleX;p.y=height/2+(p.y-(minY+maxY)/2)*scaleY;}); }
  return points;
}

export default function Graph({data,onOpen,selected,local=false}:{data:GraphData;onOpen:(node:GraphNode)=>void;selected?:string|number;local?:boolean}) {
  const [zoom,setZoom]=useState(1),[pan,setPan]=useState({x:0,y:0}),[hover,setHover]=useState<string|number>();
  const svg=useRef<SVGSVGElement>(null),drag=useRef<{x:number;y:number;px:number;py:number}|null>(null);
  const [compact,setCompact]=useState(false);
  const [height,setHeight]=useState(670);
  useEffect(()=>{const observer=new ResizeObserver(entries=>{const rect=entries[0].contentRect;setCompact(rect.width<500);if(rect.width>0)setHeight(Math.max(280,960*rect.height/rect.width));});if(svg.current)observer.observe(svg.current);return()=>observer.disconnect();},[]);
  const points=useMemo(()=>layoutGraph(data,height),[data,height]);
  const lookup=useMemo(()=>new Map(points.map(p=>[p.node.id,p])),[points]);
  const focus=hover??selected;
  const neighbors=useMemo(()=>new Set(data.edges.flatMap(e=>e.from===focus?[e.to]:e.to===focus?[e.from]:[])),[data.edges,focus]);
  const labelIds=useMemo(()=>{
    const used:Point[]=[];
    const sorted=[...points].sort((a,b)=>Number(b.node.type==='collection')-Number(a.node.type==='collection'));
    sorted.forEach(p=>{if(!used.some(o=>Math.abs(o.y-p.y)<(compact?44:21)&&Math.abs(o.x-p.x)<(compact?290:145)))used.push(p);});
    return new Set(used.map(p=>p.node.id));
  },[points,compact]);
  useEffect(()=>{setZoom(1);setPan({x:0,y:0});},[local]);
  return <div className={`brain-graph ${local?'is-local':''}`}>
    <svg ref={svg} viewBox={`0 0 960 ${height}`} preserveAspectRatio="xMidYMid meet" aria-label={local?'Conexões desta nota':'Grafo do segundo cérebro'}
      onPointerDown={e=>{if(e.target===e.currentTarget){drag.current={x:e.clientX,y:e.clientY,px:pan.x,py:pan.y};e.currentTarget.setPointerCapture(e.pointerId);}}}
      onPointerMove={e=>{if(drag.current){const scale=960/(svg.current?.getBoundingClientRect().width||960);setPan({x:drag.current.px+(e.clientX-drag.current.x)*scale,y:drag.current.py+(e.clientY-drag.current.y)*scale});}}}
      onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}
      onWheel={e=>setZoom(z=>Math.max(.35,Math.min(4,z*(e.deltaY>0?.92:1.08))))}>
      <defs><radialGradient id="brain-halo"><stop stopColor="#a38bfa" stopOpacity=".10"/><stop offset="1" stopColor="#a38bfa" stopOpacity="0"/></radialGradient></defs>
      <circle cx="480" cy={height/2} r="300" fill="url(#brain-halo)" pointerEvents="none"/>
      <g transform={`translate(${480+pan.x} ${height/2+pan.y}) scale(${zoom}) translate(-480 ${-height/2})`}>
        {data.edges.map((edge,i)=>{const a=lookup.get(edge.from),b=lookup.get(edge.to);return a&&b?<line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={`${edge.kind||'explicit'} ${focus!==undefined&&(edge.from===focus||edge.to===focus)?'lit':''}`}><title>{edge.label}</title></line>:null;})}
        {points.map(({node,x,y})=><g key={node.id} transform={`translate(${x} ${y})`} className={`brain-point ${node.type==='collection'?'hub':''} ${focus!==undefined&&focus!==node.id&&!neighbors.has(node.id)?'dim':''}`} tabIndex={0} role="button" aria-label={node.label} onClick={()=>onOpen(node)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onOpen(node);}}} onMouseEnter={()=>setHover(node.id)} onMouseLeave={()=>setHover(undefined)}>
          <circle r="14" fill="transparent" pointerEvents="all"/>{selected===node.id&&<circle r="15" className="selection-ring"/>}<circle r={node.type==='collection'?7:node.entityId?4.5:3.8} fill={colors[node.type]||'#8d9bb8'}/>
          {(zoom>1.7||labelIds.has(node.id)||focus===node.id||neighbors.has(node.id))&&<text y={compact?32:node.type==='collection'?24:17} textAnchor="middle" style={{fontSize:compact?(node.type==='collection'?26:24):(node.type==='collection'?12:10)}}>{node.label.length>29?node.label.slice(0,27)+'…':node.label}</text>}<title>{node.label}</title>
        </g>)}
      </g>
    </svg>
    {!data.nodes.length&&<div className="brain-graph-empty"><h3>Seu conhecimento começa aqui.</h3><p>Conecte suas fontes ou crie a primeira nota.<br/>As conexões aparecerão neste espaço.</p></div>}
    <div className="brain-zoom"><button title="Aproximar" aria-label="Aproximar" onClick={()=>setZoom(z=>Math.min(4,z*1.2))}><MdAdd/></button><span>{Math.round(zoom*100)}%</span><button title="Afastar" aria-label="Afastar" onClick={()=>setZoom(z=>Math.max(.35,z/1.2))}><MdRemove/></button><button title="Centralizar" aria-label="Centralizar" onClick={()=>{setZoom(1);setPan({x:0,y:0});}}><MdCenterFocusStrong/></button></div>
  </div>;
}
