import React from 'react';
import { fireEvent, render, wait } from '@testing-library/react';
import AssignedActivities from './index';

const response = (data:object, status=200) => ({ok:status >= 200 && status < 300,status,json:async()=>data});

describe('assigned activities share access', () => {
  beforeEach(() => {
    window.location.hash = '#person-invite';
    sessionStorage.clear();
  });

  afterEach(() => {jest.restoreAllMocks();});

  it('clears the list, session and invitation after authorization is revoked', async () => {
    sessionStorage.setItem('gaspar:person-share:session','verified-session');
    jest.spyOn(global, 'fetch')
      .mockResolvedValueOnce(response({
        person:{name:'Ana',email:'ana@example.test'},
        activities:[{
          id:7,title:'Documento confidencial',notes:'Somente para Ana',itemType:'follow_up',status:'next',
          dueDate:null,projectName:'Projeto',subtasks:[],subtaskSummary:{total:0,completed:0},
        }],
        events:[],
      }) as Response)
      .mockResolvedValueOnce({
        ok:false,status:403,json:async()=>{throw new Error('Resposta sem JSON');},
      } as unknown as Response);

    const page = render(<AssignedActivities/>);
    await wait(() => page.getByText('Documento confidencial'));
    fireEvent.click(page.getByText('Ver e atualizar'));
    fireEvent.click(page.getByText('Em andamento'));

    await wait(() => page.getByText('Link inválido ou incompleto'));
    expect(page.queryByText('Documento confidencial')).toBeNull();
    expect(sessionStorage.getItem('gaspar:person-share:link')).toBeNull();
    expect(sessionStorage.getItem('gaspar:person-share:session')).toBeNull();
  });
});
