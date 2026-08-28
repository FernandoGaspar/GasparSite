import React from 'react';
import axios from 'axios';
import { fireEvent, render, wait } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
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
  recurrenceInterval:1, createdAt:'2026-08-27T10:00:00', completedAt:null, ...overrides,
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
  return render(<ThemeProvider theme={dark}><Activities/></ThemeProvider>);
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
