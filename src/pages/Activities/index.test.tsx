import React from 'react';
import axios from 'axios';
import { fireEvent, render, wait } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { MemoryRouter } from 'react-router-dom';
import dark from '../../styles/themes/dark';
import Activities from '.';

jest.mock('axios', () => ({
  __esModule:true,
  default:{get:jest.fn(),patch:jest.fn(),post:jest.fn(),delete:jest.fn()},
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const summary = { open:2, inbox:0, doing:0, waiting:0, overdue:0, dueToday:0 };
const activity = (overrides:Record<string,unknown>) => ({
  id:1, title:'Preparar relatório', notes:'', itemType:'task', area:'work', status:'next',
  priority:'medium', dueDate:null, personName:'', projectName:'', recurrence:'none',
  recurrenceInterval:1, createdAt:'2026-08-27T10:00:00', completedAt:null,
  subtasks:[],subtaskSummary:{total:0,completed:0},...overrides,
});
const dataTransfer = () => ({
  effectAllowed:'none', dropEffect:'none', setData:jest.fn(), getData:jest.fn(), clearData:jest.fn(), files:[], items:[], types:[], setDragImage:jest.fn(),
} as unknown as DataTransfer);
const dispatchDrag = (element:HTMLElement, type:string, transfer:DataTransfer) => {
  const event = new Event(type,{bubbles:true,cancelable:true});
  Object.defineProperty(event,'dataTransfer',{value:transfer});
  fireEvent(element,event);
};

const renderPage = (items:ReturnType<typeof activity>[]) => {
  mockedAxios.get.mockResolvedValue({data:{items,summary}} as any);
  mockedAxios.patch.mockResolvedValue({data:{}} as any);
  return render(<MemoryRouter><ThemeProvider theme={dark}><Activities/></ThemeProvider></MemoryRouter>);
};

const findColumn = (container:HTMLElement, selector:string, heading:string) => {
  const columns = Array.from(container.querySelectorAll<HTMLElement>(selector));
  const column = columns.find(element => element.querySelector('h2,h3')?.textContent === heading);
  if (!column) throw new Error(`Coluna ${heading} não encontrada`);
  return column;
};

describe('Activities drag and drop', () => {
  beforeEach(() => jest.clearAllMocks());

  it('changes the status when a card is dropped in another board column', async () => {
    const page = renderPage([activity({})]);
    await wait(() => page.getByText('Preparar relatório'));
    fireEvent.click(page.getByText('Quadro'));

    const card = page.getByText('Preparar relatório').closest<HTMLElement>('.activity-card');
    const target = findColumn(page.container,'.board-column','Em andamento');
    if (!card) throw new Error('Card não encontrado');
    const transfer = dataTransfer();
    dispatchDrag(card,'dragstart',transfer);
    dispatchDrag(target,'dragover',transfer);
    dispatchDrag(target,'drop',transfer);

    await wait(() => expect(mockedAxios.patch).toHaveBeenCalledWith(expect.stringContaining('/activities/1'),{status:'doing'}));
  });

  it('changes the person when a follow-up is dropped in another person column', async () => {
    const ana = activity({id:2,title:'Revisar com Ana',itemType:'follow_up',personName:'Ana'});
    const bruno = activity({id:3,title:'Tema do Bruno',itemType:'follow_up',personName:'Bruno'});
    const page = renderPage([ana,bruno]);
    await wait(() => page.getByText('Revisar com Ana'));
    fireEvent.click(page.getByText('Pessoas'));

    const card = page.getByText('Revisar com Ana').closest<HTMLElement>('.activity-card');
    const target = findColumn(page.container,'.person-card','Bruno');
    if (!card) throw new Error('Card não encontrado');
    const transfer = dataTransfer();
    dispatchDrag(card,'dragstart',transfer);
    dispatchDrag(target,'dragover',transfer);
    dispatchDrag(target,'drop',transfer);

    await wait(() => expect(mockedAxios.patch).toHaveBeenCalledWith(expect.stringContaining('/activities/2'),{personName:'Bruno'}));
  });
});

describe('Activities search', () => {
  beforeEach(() => jest.clearAllMocks());

  it('filters cards using project and description regardless of accents', async () => {
    const page = renderPage([
      activity({id:4,title:'Revisar indicadores',notes:'Renovação anual do contrato',projectName:'AlertGlass'}),
      activity({id:5,title:'Comprar filtros',notes:'Reposição da cozinha',projectName:'Casa'}),
    ]);
    await wait(() => page.getByText('Comprar filtros'));
    const search = page.getByLabelText('Buscar atividades') as HTMLInputElement;

    fireEvent.change(search,{target:{value:'alertglass'}});
    expect(page.getByText('Revisar indicadores')).toBeTruthy();
    expect(page.queryByText('Comprar filtros')).toBeNull();

    fireEvent.change(search,{target:{value:'renovacao'}});
    expect(page.getByText('Revisar indicadores')).toBeTruthy();
    expect(page.queryByText('Comprar filtros')).toBeNull();
  });
});

describe('Activities deadline and people views',()=>{
  beforeEach(()=>jest.clearAllMocks());
  it('lets the user filter overdue and today without hiding more than eight results',async()=>{
    const date=new Date(); date.setDate(date.getDate()-1);
    const yesterday=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    const page=renderPage(Array.from({length:12},(_,index)=>activity({id:100+index,title:`Pendência ${index}`,dueDate:yesterday})));
    await wait(()=>page.getByText('Pendência 11'));
    fireEvent.click(page.getByText('Hoje'));
    expect(page.getByText('Pendência 11')).toBeTruthy();
    fireEvent.click(page.getByText('Atrasadas'));
    expect(page.getByText('Pendência 11')).toBeTruthy();
    fireEvent.click(page.getByText('Amanhã'));
    expect(page.queryByText('Pendência 11')).toBeNull();
  });
  it('groups every activity type by person and keeps an empty unassigned block',async()=>{
    const page=renderPage([activity({id:50,title:'Tarefa de Ana',personName:'Ana'}),activity({id:51,title:'Ainda sem pessoa',personName:'   '})]);
    await wait(()=>page.getByText('Ainda sem pessoa'));
    fireEvent.click(page.getByText('Pessoas'));
    expect(findColumn(page.container,'.person-card','Ana').textContent).toContain('Tarefa de Ana');
    expect(findColumn(page.container,'.person-card','Sem responsável').textContent).toContain('Ainda sem pessoa');
    fireEvent.change(page.getByLabelText('Buscar atividades'),{target:{value:'Tarefa de Ana'}});
    expect(page.getByText('Sem responsável')).toBeTruthy();
    expect(page.getByText('Nenhuma atividade sem responsável neste filtro.')).toBeTruthy();
  });
});

describe('Activities subtasks', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows checklist progress and toggles a subtask in the editor', async () => {
    const page=renderPage([activity({
      id:6,title:'Avaliar rentabilidade',
      subtasks:[
        {id:10,activityId:6,title:'Montar modelo',isCompleted:false,position:0},
        {id:11,activityId:6,title:'Avaliar produtividade',isCompleted:true,position:1},
      ],
      subtaskSummary:{total:2,completed:1},
    })]);
    await wait(()=>page.getByText('Avaliar rentabilidade'));
    expect(page.getByText('1/2 etapas')).toBeTruthy();
    fireEvent.click(page.getByText('Avaliar rentabilidade'));
    await wait(()=>page.getByText('Montar modelo'));
    fireEvent.click(page.getByLabelText('Concluir subtarefa'));
    await wait(()=>expect(mockedAxios.patch).toHaveBeenCalledWith(
      expect.stringContaining('/activities/6/subtasks/10'),{isCompleted:true},
    ));
  });
});

describe('Activities contextual capture', () => {
  beforeEach(() => jest.clearAllMocks());

  it('opens an AI-enriched draft and only persists it after human review', async () => {
    const page = renderPage([]);
    const saved = activity({
      id:8,title:'Preparar apresentação de redução de custos',
      notes:'Consolidar os dados.\n\nEtapas sugeridas:\n- Levantar dados\n- Montar slides',
      itemType:'follow_up',status:'inbox',priority:'high',dueDate:'2026-08-29',
      personName:'Fabio',projectName:'Q3',
    });
    mockedAxios.post
      .mockResolvedValueOnce({data:{
        suggestion:{
          title:'Preparar apresentação de redução de custos',
          notes:'Consolidar os dados.\n\nEtapas sugeridas:\n- Levantar dados\n- Montar slides',
          itemType:'follow_up',area:'work',status:'inbox',priority:'high',dueDate:'2026-08-29',
          personName:'Fabio',projectName:'Q3',recurrence:'none',recurrenceInterval:1,
        },
        analysis:{usedAI:true,usedContext:true,selectedDomains:['professional','communication'],memoryCount:2,estimatedContextTokens:640,model:'gpt-5-mini'},
      }} as any)
      .mockResolvedValueOnce({data:saved} as any);
    await wait(() => page.getByPlaceholderText(/Descreva naturalmente/));
    const capture = page.getByPlaceholderText(/Descreva naturalmente/) as HTMLInputElement;
    fireEvent.change(capture,{target:{value:'Preparar apresentação para o Fabio até amanhã'}});
    fireEvent.submit(capture.closest('form')!);

    await wait(() => page.getByText('Revise antes de salvar'));
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(mockedAxios.post).toHaveBeenCalledWith(expect.stringContaining('/activities/analyze'),{
      text:'Preparar apresentação para o Fabio até amanhã',area:'work',
    });
    expect((page.getByPlaceholderText('O que precisa acontecer?') as HTMLInputElement).value).toBe('Preparar apresentação de redução de custos');
    expect((page.getByPlaceholderText('Com quem?') as HTMLInputElement).value).toBe('Fabio');
    expect((page.getByPlaceholderText(/Contexto, decisão/) as HTMLTextAreaElement).value).toContain('Etapas sugeridas');
    expect(page.getByText(/2 memórias relacionadas/)).toBeTruthy();

    let resolveReload:(value:any)=>void = () => undefined;
    mockedAxios.get.mockReturnValueOnce(new Promise(resolve => { resolveReload=resolve; }) as any);
    fireEvent.click(page.getByText('Salvar atividade'));
    await wait(() => expect(mockedAxios.post).toHaveBeenCalledTimes(2));
    expect(mockedAxios.post.mock.calls[1][0]).toEqual(expect.stringMatching(/\/activities$/));
    expect(mockedAxios.post.mock.calls[1][1]).toEqual(expect.objectContaining({personName:'Fabio',itemType:'follow_up'}));
    await wait(() => expect(page.queryByText('Revise antes de salvar')).toBeNull());
    expect(page.getAllByText('Preparar apresentação de redução de custos').length).toBeGreaterThan(0);
    resolveReload({data:{items:[saved],summary}});
    await wait(() => expect(page.getAllByText('Preparar apresentação de redução de custos').length).toBeGreaterThan(0));
  });

  it('preserves the original capture as a manual draft when AI is unavailable', async () => {
    const page = renderPage([]);
    mockedAxios.post.mockRejectedValueOnce({response:{data:{message:'Serviço temporariamente indisponível.'}}});
    await wait(() => page.getByPlaceholderText(/Descreva naturalmente/));
    const capture = page.getByPlaceholderText(/Descreva naturalmente/) as HTMLInputElement;
    fireEvent.change(capture,{target:{value:'Revisar proposta do fornecedor'}});
    fireEvent.submit(capture.closest('form')!);

    await wait(() => page.getByText(/mantive sua captura como rascunho manual/));
    expect((page.getByPlaceholderText('O que precisa acontecer?') as HTMLInputElement).value).toBe('Revisar proposta do fornecedor');
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  });

  it('reloads activities automatically when the browser regains focus', async () => {
    renderPage([]);
    await wait(() => expect(mockedAxios.get).toHaveBeenCalledTimes(1));
    fireEvent(window,new Event('focus'));
    await wait(() => expect(mockedAxios.get).toHaveBeenCalledTimes(2));
  });
});
