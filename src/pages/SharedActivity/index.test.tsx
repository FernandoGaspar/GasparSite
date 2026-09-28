import React from 'react';
import { fireEvent, render, wait } from '@testing-library/react';
import SharedActivity from './index';

const response = (data:object, status=200) => ({ok:status >= 200 && status < 300,status,json:async()=>data});

describe('shared activity', () => {
  beforeEach(() => {
    window.location.hash = '#private-invite';
    sessionStorage.clear();
  });

  afterEach(() => {jest.restoreAllMocks();});

  it('does not load activity details before email verification', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(response({message:'Código enviado.'}) as Response);
    const page = render(<SharedActivity/>);
    expect(page.getByText('Acesse sua atividade')).toBeTruthy();
    expect(window.location.hash).toBe('');
    expect(fetchMock).not.toHaveBeenCalled();
    fireEvent.click(page.getByText('Enviar código por e-mail'));
    await wait(() => expect(page.getByText('Código enviado.')).toBeTruthy());
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain('/shared-activities/code');
    expect(fetchMock.mock.calls[0][1]?.headers).toEqual(expect.objectContaining({'X-Share-Link':'private-invite'}));
    expect(String(fetchMock.mock.calls[0][0])).not.toContain('private-invite');
  });

  it('keeps the captured link scoped to the tab across a refresh', () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(response({message:'Código enviado.'}) as Response);
    const first = render(<SharedActivity/>);
    first.unmount();
    expect(window.location.hash).toBe('');
    const second = render(<SharedActivity/>);
    expect(second.getByText('Acesse sua atividade')).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([401,403,404])('removes displayed data and both share credentials after HTTP %s', async status => {
    sessionStorage.setItem('gaspar:activity-share:session','verified-session');
    const fetchMock = jest.spyOn(global, 'fetch')
      .mockResolvedValueOnce(response({
        activity:{title:'Plano confidencial',notes:'Detalhes privados',status:'next',dueDate:null,projectName:'Projeto',subtasks:[]},
        guestName:'Ana',events:[],
      }) as Response)
      .mockResolvedValueOnce(response({message:'Acesso encerrado.'},status) as Response);

    const page = render(<SharedActivity/>);
    await wait(() => page.getByText('Plano confidencial'));
    fireEvent.click(page.getByText('Em andamento'));

    await wait(() => page.getByText('Link inválido ou incompleto'));
    expect(page.queryByText('Plano confidencial')).toBeNull();
    expect(sessionStorage.getItem('gaspar:activity-share:link')).toBeNull();
    expect(sessionStorage.getItem('gaspar:activity-share:session')).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
