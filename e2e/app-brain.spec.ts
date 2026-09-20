import {test,expect} from '@playwright/test';
test('native app: areas, reading, notes, graph and persistent review',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  let area='Carglass',status='candidate',saved=false;
  const topic=()=>({id:1,title:'Operações conectadas',area,summary:'## Decisões\nContexto validado [1].',sources:1,reviewed:area==='Pessoal',status:'candidate',nodeId:1});
  const doc=()=>({id:1,title:saved?'Nota mobile':'Fonte de teste',content:'Conteúdo de referência.',source:'note',version:1,folder:'Notas',occurredAt:'2026-09-19T12:00:00Z',contentKind:'full'});
  await page.addInitScript(()=>sessionStorage.setItem('gaspar-solutions-session',JSON.stringify({token:'fixture-token',userId:'fixture-user',name:'Teste',email:'fixture@example.test'})));
  await page.route('**/*',async route=>{
    if(!['fetch','xhr'].includes(route.request().resourceType()))return route.continue();
    const url=new URL(route.request().url()),path=url.pathname;let data:any={};
    if(path.endsWith('/organization'))data={available:true,enabled:true,state:'reading',completed:20,total:100,areas:[{name:'Carglass',topics:1},{name:'Pessoal',topics:1}]};
    else if(path.endsWith('/topics/1')){if(route.request().method()==='PATCH')area=route.request().postDataJSON().area;data={...topic(),sources:[{readingId:1,documentId:1,title:'Fonte de teste',summary:'Evidência da decisão',source:'note',occurredAt:'2026-09-19T12:00:00Z',confidence:.9}],connections:[]};}
    else if(path.endsWith('/topics'))data={topics:[topic()]};
    else if(path.endsWith('/documents/1'))data=doc();
    else if(path.endsWith('/documents')){if(route.request().method()==='POST'){saved=true;data=doc();}else data={documents:[doc()],total:1};}
    else if(path.endsWith('/connections'))data={connections:url.searchParams.get('status')===status?[{id:5,fromLabel:'Operações',toLabel:'Planejamento',label:'Decisão documentada',status}]:[],total:url.searchParams.get('status')===status?1:0};
    else if(path.endsWith('/edge/5')){status=route.request().postDataJSON().status;data={status};}
    else if(path.endsWith('/graph'))data={nodes:[{id:1,topicId:1,label:'Operações conectadas',type:'project'}],edges:[]};
    else if(path.endsWith('/ask'))data={answer:'Decisão registrada [1].',citations:[{id:1,title:'Fonte de teste'}]};
    return route.fulfill({status:200,json:data});
  });
  await page.goto('/more');
  await page.getByRole('button',{name:/Segundo cérebro/}).click();
  await page.getByRole('button',{name:'Abrir assunto Operações conectadas'}).click();
  await expect(page.getByText('Contexto validado',{exact:false})).toBeVisible();
  await page.getByLabel('Área do assunto').fill('Pessoal');await page.getByRole('button',{name:'Salvar classificação',exact:true}).click();
  await expect(page.getByText('Revisado por você',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'← Voltar',exact:true}).click();
  await page.getByRole('button',{name:'Explorar áreas'}).click();await page.getByRole('button',{name:'Pessoal · 1'}).click();
  await expect(page.getByRole('button',{name:'Abrir assunto Operações conectadas'})).toContainText('Pessoal');
  await expect(page.getByText('Explorar conhecimento',{exact:true})).not.toBeVisible();
  await page.screenshot({path:'tmp/app-brain-mobile.png',fullPage:true});
  await page.getByRole('button',{name:'Revisar',exact:true}).click();await page.getByRole('button',{name:'Descartar',exact:true}).click();
  await expect(page.getByText('Nenhuma relação nesta página.')).toBeVisible();
  await page.getByRole('button',{name:'Descartadas',exact:true}).click();await expect(page.getByText('Decisão documentada')).toBeVisible();
  await page.getByRole('button',{name:'Mapa',exact:true}).click();await expect(page.getByText('Toque em um ponto',{exact:false})).toBeVisible();
  await page.getByRole('button',{name:'Consultar',exact:true}).click();await page.getByLabel('Pergunta para sua base').fill('Qual decisão?');await page.getByRole('button',{name:'Consultar minha base'}).click();await expect(page.getByText('Decisão registrada',{exact:false})).toBeVisible();
  await page.getByRole('button',{name:'Assuntos',exact:true}).click();await page.getByRole('button',{name:'Nova nota',exact:true}).click();await page.getByLabel('Título da nota').fill('Nota mobile');await page.getByLabel('Conteúdo da nota').fill('Conteúdo de referência.');await page.getByRole('button',{name:'Salvar nota',exact:true}).click();await expect(page.getByText('Nota mobile',{exact:true})).toBeVisible();
  expect(errors).toEqual([]);
});
