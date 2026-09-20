import SourceLink from './SourceLink';
import React from 'react';
import {safeUrl} from './types';

// React text nodes escape HTML. External content is never injected as markup.
export default function Markdown({text,onLink}:{text:string;onLink:(title:string)=>void}) {
  const inline=(value:string):React.ReactNode[]=>value.split(/(\[\[[^\]\n]+\]\]|\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g).map((part,i)=>{
    if(part.startsWith('[[')){const [target,label]=part.slice(2,-2).split('|');return <button className="brain-wikilink" key={i} onClick={()=>onLink(target.split('#')[0])}>{label||target}</button>;}
    if(part.startsWith('**'))return <strong key={i}>{part.slice(2,-2)}</strong>;
    if(part.startsWith('`'))return <code key={i}>{part.slice(1,-1)}</code>;
    const link=part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);if(link&&safeUrl(link[2]))return <SourceLink key={i} url={link[2]}>{link[1]}</SourceLink>;
    return part;
  });
  const blocks:React.ReactNode[]=[];let code:string[]|null=null;
  text.split('\n').forEach((line,index)=>{
    if(line.startsWith('```')){if(code){blocks.push(<pre key={index}><code>{code.join('\n')}</code></pre>);code=null;}else code=[];return;}
    if(code){code.push(line);return;}
    if(/^### /.test(line))blocks.push(<h3 key={index}>{inline(line.slice(4))}</h3>);
    else if(/^## /.test(line))blocks.push(<h2 key={index}>{inline(line.slice(3))}</h2>);
    else if(/^# /.test(line))blocks.push(<h1 key={index}>{inline(line.slice(2))}</h1>);
    else if(/^>/.test(line))blocks.push(<blockquote key={index}>{inline(line.replace(/^>\s?/,''))}</blockquote>);
    else if(/^[-*] \[[ xX]\]/.test(line))blocks.push(<p className="brain-checkline" key={index}><input type="checkbox" readOnly checked={/^[-*] \[[xX]\]/.test(line)} aria-label="Tarefa"/>{inline(line.slice(6))}</p>);
    else if(/^[-*] /.test(line))blocks.push(<p className="brain-listline" key={index}>• {inline(line.slice(2))}</p>);
    else if(/^---+$/.test(line))blocks.push(<hr key={index}/>);
    else blocks.push(line?<p key={index}>{inline(line)}</p>:<div className="brain-paragraph-gap" key={index}/>);
  });
  if(code)blocks.push(<pre key="last-code">{(code as string[]).join('\n')}</pre>);
  return <div className="brain-markdown">{blocks}</div>;
}
