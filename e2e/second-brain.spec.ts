import {test,expect,Page} from '@playwright/test';

const stamp='2026-09-19T12:00:00Z';
const names=['Projeto Aurora','Decisões de arquitetura','Reunião de planejamento','Estratégia de produto','Ideias para o próximo ciclo','Aprendizados da semana','Experiência do cliente','Pesquisa e referências','Roadmap 2027','Automação residencial','Revisão financeira','Conversas que importam'];
const labels:Record<string,string>={note:'Minhas notas',microsoft_mail:'Outlook',gmail_mail:'Gmail',microsoft_teams:'Teams',activity:'Atividades',assistant_history:'Agentes',context:'Contextos',memory:'Memórias'};
const sourceKeys=['note','microsoft_mail','gmail_mail','microsoft_teams','activity','assistant_history','context','memory'];
async function fixture(page:Page){
  await page.route('http://127.0.0.1:5000/**',route=>route.fulfill({status:404,contentType:'application/json',body:'{"message":"Unmocked test endpoint"}'}));
  await page.addInitScript(()=>{localStorage.setItem('@minha-carteira:logged','true');localStorage.setItem('@minha-carteira:usuarioId','test-user');localStorage.setItem('@minha-carteira:token','test-token');});
  const docs=Array.from({length:72},(_,i)=>({id:i+1,title:i<12?names[i]:names[i%12]+' / '+(Math.floor(i/12)+1),source:sourceKeys[i%sourceKeys.length],folder:labels[sourceKeys[i%8]],contentKind:i%8===1?'preview':'full',content:i===0?'## Uma ideia que merece crescer\n\nO projeto reúne pessoas, contexto e decisões em um mesmo lugar.\n\n### Próximos passos\n\n- Conectar [[Decisões de arquitetura]]\n- Revisar as evidências\n\n> Conhecimento útil é conhecimento que podemos reencontrar.':'Conteúdo do documento sobre o projeto Aurora. Evidências e decisões preservadas para consulta.',excerpt:'Contexto e decisões para o projeto Aurora.',occurredAt:stamp,updatedAt:stamp,pinned:i===0,version:1,tags:['conhecimento'],backlinks:i===0?[{id:2,title:names[1]}]:[],links:i===0?[{id:2,title:names[1]}]:[]}));
  const sources=sourceKeys.slice(1).map(source=>({source,label:({microsoft_mail:'Outlook',gmail_mail:'Gmail',microsoft_teams:'Teams',activity:'Atividades',assistant_history:'Conversas com agentes',context:'Contextos',memory:'Memórias'} as Record<string,string>)[source],available:true,availableCount:9,indexed:9,previews:source==='microsoft_mail'?9:0,lastSyncAt:stamp}));
  await page.route('**/api/second-brain/**',async route=>{const url=new URL(route.request().url()),path=url.pathname,method=route.request().method();let data:any={};
    if(path.endsWith('/sources'))data={sources};
    else if(path.endsWith('/graph')){const hubs=sourceKeys.map(source=>({id:'folder:'+source,label:labels[source],type:'collection',folder:labels[source]}));data={nodes:[...docs.map(d=>({...d,label:d.title,type:d.source,summary:d.excerpt})),...hubs],edges:[...docs.map(d=>({from:'folder:'+d.source,to:d.id,label:'Coleção',kind:'collection'})),...docs.slice(1,45).map(d=>({from:d.id,to:((d.id+9)%72)+1,label:'Referência',kind:'explicit'}))],total:72,shown:72};}
    else if(path.endsWith('/ask'))data={answer:'O projeto Aurora prioriza conexões auditáveis [1].',citations:[{id:1,title:names[0],source:'note',contentKind:'full'}],mode:'ai'};
    else if(path.endsWith('/sync'))data={sources:[{status:'ok'}],indexed:10,more:false};
    else if(path.includes('/import/'))data={read:20,imported:20,complete:true};
    else if(path.endsWith('/export'))return route.fulfill({status:200,contentType:'application/zip',body:Buffer.from('test export')});
    else if(path.endsWith('/hydrate')){const id=Number(path.split('/').at(-2));data={...docs.find(d=>d.id===id),content:'Mensagem completa recuperada do provedor.',contentKind:'full'};}
    else if(/\/documents\/\d+$/.test(path)){const id=Number(path.split('/').pop()),found=docs.find(d=>d.id===id);if(method==='PUT'){Object.assign(found!,route.request().postDataJSON(),{version:found!.version+1});}if(method==='PATCH')Object.assign(found!,route.request().postDataJSON());data=found;}
    else if(path.endsWith('/documents')&&method==='POST'){const input=route.request().postDataJSON();const doc={...docs[0],...input,id:docs.length+1,source:'note',version:1,backlinks:[],links:[]};docs.unshift(doc);data=doc;}
    else if(path.endsWith('/documents')){const q=(url.searchParams.get('q')||'').toLowerCase(),source=url.searchParams.get('source'),folder=url.searchParams.get('folder'),pinned=url.searchParams.get('pinned')==='true';const matching=docs.filter(d=>!(d as any).archived&&(!q||(d.title+' '+d.content).toLowerCase().includes(q))&&(!source||d.source===source)&&(!folder||d.folder===folder)&&(!pinned||d.pinned));const offset=Number(url.searchParams.get('offset')||0);data={documents:matching.slice(offset,offset+60),total:matching.length};}
    return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
  });
  await page.route('**/api/ai/memory-graph**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({processed:12,pending:0,evidence:[]})}));
  // Never send test credentials to a running real API.
  await page.route('**/127.0.0.1:5000/**',route=>route.fallback());
  return docs;
}

test.beforeEach(async({page})=>{await fixture(page);await page.goto('/second-brain?view=graph');await expect(page.getByRole('heading',{name:'Mapa de conhecimento',exact:true})).toBeVisible();});

test('module follows the shared Gaspar theme without separate application chrome',async({page})=>{
  await expect(page.locator('.brain-ribbon,.brain-tabs,.brain-statusbar')).toHaveCount(0);
  await expect(page.locator('.brain-module')).toHaveCSS('color-scheme','dark');
  await expect(page.locator('.brain-graph-page')).toHaveCSS('background-color','rgb(30, 41, 59)');
  await page.getByRole('switch').first().press('Space');
  await expect(page.locator('.brain-module')).toHaveCSS('color-scheme','light');
  await expect(page.locator('.brain-graph-page')).toHaveCSS('background-color','rgb(255, 255, 255)');
  await page.screenshot({path:'tmp/second-brain-native-light.png',fullPage:true});
  await page.getByRole('button',{name:'Biblioteca',exact:true}).click();
  await expect(page.locator('.brain-explorer')).toHaveCSS('background-color','rgb(255, 255, 255)');
  await page.getByRole('button',{name:'Fontes e sincronização',exact:true}).click();
  await expect(page.locator('.brain-scroll-page')).toHaveCSS('background-color','rgb(255, 255, 255)');
});

test('review queue shows newest suggestions and can undo a review',async({page})=>{
  let current='candidate';
  await page.route('**/api/second-brain/connections*',route=>{
    const status=new URL(route.request().url()).searchParams.get('status');
    return route.fulfill({status:200,json:{total:status===current?1:0,connections:status===current?[{id:50,fromLabel:'Projeto Aurora',toLabel:'Decisão de arquitetura',label:'sustenta',createdAt:stamp,status:current}]:[]}});
  });
  await page.route('**/api/ai/memory-graph/edge/50',route=>{current=route.request().postDataJSON().status;return route.fulfill({status:200,json:{status:current}});});
  await page.getByRole('button',{name:'Revisar conexões',exact:true}).first().click();
  await expect(page.locator('.brain-review-card')).toContainText('Sugestão ainda não confirmada');
  await page.getByRole('button',{name:'Confirmar relação',exact:true}).click();
  await expect(page.locator('.brain-review-card')).toHaveCount(0);
  await page.getByRole('button',{name:'Confirmadas',exact:true}).click();
  await expect(page.locator('.brain-review-card')).toContainText('Confirmada por você');
  await page.getByRole('button',{name:'Voltar para pendentes',exact:true}).click();
  await expect(page.locator('.brain-review-card')).toHaveCount(0);
  await page.getByRole('button',{name:'Pendentes',exact:true}).click();
  await expect(page.locator('.brain-review-card')).toContainText('Sugestão ainda não confirmada');
  await page.getByRole('button',{name:'Descartar relação',exact:true}).click();
  await expect(page.locator('.brain-review-card')).toHaveCount(0);
  await expect(page.getByRole('status')).toContainText('Relação descartada');
  await page.reload();
  await page.getByRole('button',{name:'Revisar conexões',exact:true}).first().click();
  await expect(page.locator('.brain-review-card')).toHaveCount(0);
  await page.getByRole('button',{name:'Descartadas',exact:true}).click();
  await expect(page.locator('.brain-review-card')).toContainText('Descartada');
});

test('connection evidence and human review remain inside the Gaspar shell',async({page})=>{
  let status='candidate';
  await page.route('**/api/second-brain/graph*',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({total:72,shown:2,nodes:[
    {id:'entity:10',entityId:10,label:'Projeto revisável',type:'project',summary:'Um projeto sustentado pelas fontes',status:'candidate'},
    {id:'entity:11',entityId:11,label:'Decisão revisável',type:'decision',summary:'Decisão associada ao projeto',status:'candidate'}],
    edges:status==='rejected'?[]:[{from:'entity:10',to:'entity:11',entityId:50,label:'Decisão do projeto',kind:'inferred',status}]})}));
  await page.route('**/api/ai/memory-graph/**',route=>{
    if(route.request().method()==='PATCH'){status=route.request().postDataJSON().status;return route.fulfill({status:200,json:{status}});}
    return route.fulfill({status:200,json:{evidence:[{id:1,title:'Ata de planejamento',excerpt:'A equipe decidiu iniciar a pesquisa.',sourceType:'second_brain',sourceId:'1:1',occurredAt:stamp}]}});
  });
  await page.reload();
  await page.getByRole('button',{name:'Projeto revisável',exact:true}).click();
  await expect(page.locator('.brain-connections')).toContainText('aguarda revisão');
  await page.getByRole('button',{name:'Evidências da relação',exact:true}).click();
  await expect(page.locator('.brain-connection-evidence')).toContainText('A equipe decidiu iniciar a pesquisa.');
  await page.getByRole('button',{name:'Confirmar relação com Decisão revisável',exact:true}).click();
  await expect(page.locator('.brain-connections')).toContainText('Confirmada por você');
  await expect(page.getByRole('button',{name:'Confirmar relação com Decisão revisável',exact:true})).toHaveCount(0);
  await page.getByRole('button',{name:'Descartar relação com Decisão revisável',exact:true}).click();
  await expect(page.locator('.brain-connections')).toContainText('Nenhuma relação nesta janela');
  expect(status).toBe('rejected');
  await expect(page.getByRole('link',{name:'Atividades',exact:true})).toBeVisible();
});

test('desktop graph, notes, backlinks, editing and persistence',async({page})=>{
  await expect(page.getByRole('link',{name:'Atividades',exact:true})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Segundo c\u00e9rebro',exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:'Voltar ao Gaspar'})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Projeto Aurora',exact:true})).toBeVisible();
  await page.screenshot({path:'tmp/second-brain-graph.png',fullPage:true});
  await page.getByRole('button',{name:'Biblioteca',exact:true}).click();
  await page.locator('.brain-doc-list').getByRole('button',{name:/Projeto Aurora/}).first().click();
  await expect(page.locator('.brain-reading h1')).toHaveText('Projeto Aurora');
  await expect(page.locator('.brain-inspector')).toContainText('Referências de entrada');
  await page.getByRole('button',{name:'Editar',exact:true}).click();
  await page.getByLabel('Conteúdo Markdown').fill('## Nova síntese\n\nConectar [[Decisões de arquitetura]] com minhas ideias.');
  await page.getByRole('button',{name:'Salvar',exact:true}).click();
  await expect(page.locator('.brain-reading')).toContainText('Nova síntese');
  await page.screenshot({path:'tmp/second-brain-note.png',fullPage:true});
  await page.getByRole('button',{name:'Nova nota',exact:true}).first().click();
  await page.getByLabel('Título da nota').fill('Minha nova ideia');
  await page.getByLabel('Conteúdo Markdown').fill('Uma nota durável com [[Projeto Aurora]].');
  await page.getByRole('button',{name:'Salvar',exact:true}).click();
  await expect(page.locator('.brain-reading h1')).toHaveText('Minha nova ideia');
});

test('search, original body, sources, import and grounded query',async({page})=>{
  await page.getByLabel('Buscar em toda a base').fill('Decisões de arquitetura');
  await page.getByRole('button',{name:'Biblioteca',exact:true}).click();
  await page.locator('.brain-doc-list').getByRole('button',{name:/^Decisões de arquitetura Outlook/}).click();
  await expect(page.getByText('Esta fonte disponibilizou uma prévia')).toBeVisible();
  await page.getByRole('button',{name:/Carregar mensagem completa/}).click();
  await expect(page.locator('.brain-reading')).toContainText('Mensagem completa recuperada');
  await page.getByRole('button',{name:'Fontes e sincronização',exact:true}).first().click();
  await page.getByRole('button',{name:'Importar histórico completo'}).first().click();
  await expect(page.getByRole('status')).toContainText('Histórico acessível de Outlook importado');
  await page.getByRole('button',{name:'Conversar com minha base',exact:true}).click();
  await page.getByLabel('Pergunta para sua base').fill('O que decidimos sobre Aurora?');
  await page.getByRole('button',{name:/Consultar minha base/}).click();
  await expect(page.locator('.brain-answer')).toContainText('conexões auditáveis');
  await page.locator('.brain-answer').getByRole('button').first().click();
  await expect(page.locator('.brain-reading h1')).toHaveText('Projeto Aurora');
});

test('mobile has no horizontal overflow and explorer stays usable',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.reload();
  await expect(page.locator('.brain-explorer')).not.toBeVisible();
  const sizes=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:window.innerWidth}));expect(sizes.scroll).toBeLessThanOrEqual(sizes.width);
  await page.screenshot({path:'tmp/second-brain-mobile.png',fullPage:true});
  await page.getByRole('button',{name:'Biblioteca',exact:true}).click();
  await page.getByLabel('Buscar em toda a base').fill('Projeto Aurora');
  await page.getByRole('button',{name:'Biblioteca',exact:true}).click();
  await page.locator('.brain-doc-list').getByRole('button').first().click();
  await expect(page.locator('.brain-reading h1')).toHaveText('Projeto Aurora');
  await expect(page.locator('.brain-explorer')).not.toBeVisible();
});

test('API failure is explicit, not disguised as an empty successful vault',async({page})=>{
  await page.route('**/api/second-brain/documents?**',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({message:'Banco indisponível para teste.'})}));
  await page.getByLabel('Buscar em toda a base').fill('inexistente');
  await expect(page.getByRole('alert')).toContainText('Banco indisponível');
});

test('Markdown import and reversible archive',async({page})=>{
  await page.getByRole('button',{name:'Fontes e sincronização',exact:true}).first().click();
  await page.getByLabel('Arquivos Markdown').setInputFiles({name:'Ideia importada.md',mimeType:'text/markdown',buffer:Buffer.from('# Importada\n\nUma ideia com [[Projeto Aurora]].\n\n[Abrir atividades](/activities)')});
  await expect(page.getByRole('status')).toContainText('1 notas Markdown importadas');
  await page.getByRole('button',{name:'Biblioteca',exact:true}).click();
  await page.locator('.brain-doc-list').getByRole('button',{name:/Ideia importada/}).click();
  await expect(page.locator('.brain-reading')).toContainText('Uma ideia com');
  await expect(page.getByRole('link',{name:'Abrir atividades',exact:true})).toHaveAttribute('href','/activities');
  await expect(page.getByRole('link',{name:'Abrir atividades',exact:true})).not.toHaveAttribute('target','_blank');
  await page.getByRole('button',{name:'Arquivar nota',exact:true}).click();
  await expect(page.getByRole('status')).toContainText('Nota arquivada');
  await expect(page.locator('.brain-doc-list').getByRole('button',{name:/Ideia importada/})).toHaveCount(0);
  await page.getByRole('button',{name:'Desfazer',exact:true}).click();
  await expect(page.locator('.brain-reading > h1')).toHaveText('Ideia importada');
});

test('concurrent save conflict preserves the local draft',async({page})=>{
  await page.getByRole('button',{name:'Biblioteca',exact:true}).click();
  await page.locator('.brain-doc-list').getByRole('button',{name:/Projeto Aurora/}).first().click();
  await page.getByRole('button',{name:'Editar',exact:true}).click();
  await page.getByLabel('Conteúdo Markdown').fill('Meu rascunho precisa ser preservado.');
  await page.route('**/api/second-brain/documents/1',route=>route.request().method()==='PUT'?route.fulfill({status:409,contentType:'application/json',body:JSON.stringify({message:'Esta nota mudou em outra sessão.'})}):route.fallback());
  await page.getByRole('button',{name:'Salvar',exact:true}).click();
  await expect(page.getByRole('alert')).toContainText('mudou em outra sessão');
  await expect(page.getByLabel('Conteúdo Markdown')).toHaveValue('Meu rascunho precisa ser preservado.');
});


test('late graph response cannot restore a discarded relation',async({page})=>{
  let status='candidate',holdNext=false;
  let release!:()=>void,started!:()=>void;
  const held=new Promise<void>(resolve=>{release=resolve;});
  const pending=new Promise<void>(resolve=>{started=resolve;});
  await page.route('**/api/second-brain/graph*',async route=>{
    const captured=status;
    if(holdNext){holdNext=false;started();await held;}
    await route.fulfill({status:200,json:{total:0,shown:0,nodes:[
      {id:'entity:10',entityId:10,label:'Projeto teste',type:'project',summary:'Contexto',status:'candidate'},
      {id:'entity:11',entityId:11,label:'Decisão teste',type:'decision',summary:'Contexto',status:'candidate'}],
      edges:captured==='rejected'?[]:[{from:'entity:10',to:'entity:11',entityId:50,label:'Relação teste',kind:'inferred',status:captured}]}});
  });
  await page.route('**/api/ai/memory-graph/edge/50',route=>{status=route.request().postDataJSON().status;return route.fulfill({status:200,json:{status}});});
  await page.reload();
  await page.getByRole('button',{name:'Projeto teste',exact:true}).click();
  await expect(page.locator('.brain-connections')).toContainText('aguarda revisão');
  holdNext=true;
  await page.getByPlaceholder('Buscar ideias, pessoas, projetos ou documentos').fill('teste');
  await pending;
  await page.getByRole('button',{name:'Descartar relação com Decisão teste',exact:true}).click();
  await expect(page.locator('.brain-connections')).toContainText('Nenhuma relação nesta janela');
  const oldResponse=page.waitForResponse(response=>response.url().includes('/second-brain/graph'));
  release();
  await oldResponse;
  await expect(page.locator('.brain-connections')).toContainText('Nenhuma relação nesta janela');
  await expect(page.getByRole('button',{name:'Descartar relação com Decisão teste',exact:true})).toHaveCount(0);
});


test('Teams messages in one conversation have distinct readable entries',async({page})=>{
  await page.route('**/api/second-brain/documents?*',route=>route.fulfill({status:200,json:{total:3,documents:[
    {id:101,title:'Conversa de planejamento',source:'microsoft_teams',excerpt:'Vamos revisar a proposta na sexta.',author:'Ana',occurredAt:'2026-09-19T10:00:00Z'},
    {id:102,title:'Conversa de planejamento',source:'microsoft_teams',excerpt:'Combinado, enviarei a versão final.',author:'Bruno',occurredAt:'2026-09-19T10:02:00Z'},
    {id:103,title:'Conversa de planejamento',source:'microsoft_teams',excerpt:'',author:'Ana',occurredAt:'2026-09-19T10:03:00Z'}
  ]}}));
  await page.reload();
  await page.getByRole('button',{name:'Biblioteca',exact:true}).click();
  const list=page.locator('.brain-doc-list');
  await expect(list.locator('button')).toHaveCount(3);
  await expect(list.locator('strong')).toHaveText(['Vamos revisar a proposta na sexta.','Combinado, enviarei a versão final.','Mensagem sem texto disponível']);
  await expect(list).toContainText('Ana · Teams');
  await expect(list).toContainText('Bruno · Teams');
  await expect(list.locator('.brain-conversation-title')).toHaveCount(3);
  const entries=await list.locator('button').allTextContents();
  expect(new Set(entries).size).toBe(3);
  expect(entries.every(entry=>/\d{2}:\d{2}:\d{2}/.test(entry))).toBe(true);
});


test('organized knowledge groups sources by area and preserves human classification',async({page})=>{
  let enabled=true,area='Carglass',reviewed=false;
  const topic=()=>({id:1,title:'Modernização de operações',area,reviewed,status:'candidate',summary:'## Contexto\nDecisão registrada [1].',nodeId:10});
  await page.route('**/api/second-brain/organization',route=>{
    if(route.request().method()==='PATCH')enabled=route.request().postDataJSON().enabled;
    return route.fulfill({status:200,json:{available:true,enabled,state:enabled?'reading':'paused',total:100,completed:20,empty:2,previews:5,areas:[{name:area,topics:1}],heartbeat:new Date().toISOString()}});
  });
  await page.route('**/api/second-brain/topics*',route=>route.fulfill({status:200,json:{topics:[{...topic(),sources:3}]}}));
  await page.route('**/api/second-brain/topics/1',route=>{
    if(route.request().method()==='PATCH'){area=route.request().postDataJSON().area;reviewed=true;}
    return route.fulfill({status:200,json:{...topic(),sources:[{readingId:1,documentId:1,title:'Reunião de operações',summary:'Decisão contextualizada.',source:'microsoft_teams',contentKind:'full',occurredAt:stamp,confidence:.9}],connections:[]}});
  });
  await page.goto('/second-brain');
  await expect(page.getByRole('heading',{name:'Seu conhecimento, organizado'})).toBeVisible();
  await expect(page.locator('.brain-topic-card')).toHaveCount(1);
  await page.getByRole('button',{name:'Pausar robô',exact:true}).click();
  await expect(page.getByRole('button',{name:'Iniciar organização',exact:true})).toBeVisible();
  await page.locator('.brain-topic-card').click();
  await expect(page.locator('.brain-knowledge-detail')).toContainText('Decisão contextualizada.');
  await page.getByLabel('Área do assunto').fill('Pessoal');
  await page.getByRole('button',{name:'Salvar classificação'}).click();
  await expect(page.locator('.brain-topic-review')).toContainText('Revisado por você');
  await page.getByRole('button',{name:'Todos os assuntos'}).click();
  await expect(page.locator('.brain-topic-card')).toContainText('Pessoal');
  await page.reload();
  await expect(page.locator('.brain-topic-card')).toContainText('Pessoal');
  await page.screenshot({path:'tmp/second-brain-knowledge.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.screenshot({path:'tmp/second-brain-knowledge-mobile.png',fullPage:true});
});

for(const width of [320,390,768])test(`mobile knowledge reading and review at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:844});
  let area='Carglass';
  const topic=()=>({id:1,title:'Modernização das operações',area,summary:'## Contexto\nDecisões com fontes para consulta [1].',reviewed:area==='Pessoal',status:'candidate',sources:1,nodeId:10});
  await page.route('**/api/second-brain/organization',route=>route.fulfill({json:{available:true,enabled:true,state:'reading',total:100,completed:20,areas:[{name:'Carglass',topics:1},{name:'Pessoal',topics:2}],heartbeat:new Date().toISOString()}}));
  await page.route('**/api/second-brain/topics*',route=>route.fulfill({json:{topics:[topic()]}}));
  await page.route('**/api/second-brain/topics/1',route=>{if(route.request().method()==='PATCH')area=route.request().postDataJSON().area;return route.fulfill({json:{...topic(),sources:[{readingId:1,documentId:1,title:'Reunião de operações',summary:'Decisão contextualizada.',source:'microsoft_teams',occurredAt:stamp,confidence:.9}],connections:[]}});});
  await page.goto('/second-brain');
  await expect(page.locator('.brain-topic-card')).toBeVisible();
  if(width<=750){await expect(page.locator('.brain-organizer-status')).not.toBeVisible();await page.locator('.brain-mobile-robot').click();await expect(page.getByRole('button',{name:'Pausar robô'})).toBeVisible();await page.locator('.brain-mobile-robot').click();}
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:`tmp/knowledge-${width}.png`,fullPage:true});
  await page.locator('.brain-topic-card').click();
  await expect(page.locator('.brain-knowledge-detail .brain-markdown')).toContainText('Decisões com fontes');
  await page.getByLabel('Área do assunto').fill('Pessoal');await page.getByRole('button',{name:'Salvar classificação'}).click();
  await expect(page.locator('.brain-topic-review')).toContainText('Revisado por você');
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:`tmp/reading-${width}.png`,fullPage:true});
  await page.getByRole('button',{name:'Todos os assuntos'}).click();await expect(page.locator('.brain-topic-card')).toContainText('Pessoal');
});
