import React from 'react';
import axios from 'axios';
import {fireEvent,render,wait} from '@testing-library/react';
import SchedulingInbox from './SchedulingInbox';

jest.mock('axios',()=>({__esModule:true,default:{get:jest.fn(),post:jest.fn()}}));
const mockedAxios=axios as jest.Mocked<typeof axios>;
const item=(overrides:Record<string,unknown>)=>({
  type:'whatsapp_scheduling',id:'schedule-1',actionId:'schedule-1',state:'negotiating',version:2,
  request:'Marcar retorno',draftMessage:'Olá',mode:'negotiate_only',constraints:{durationMinutes:30,maxRounds:4,allowedWeekdays:[1]},
  contactId:'contact-1',contact:{id:'contact-1',displayName:'Clínica Aurora',address:'5511999991234@s.whatsapp.net',isAllowed:true,agentAllowed:true},
  updatedAt:'2026-09-27T15:00:00Z',...overrides,
});

describe('Secretary scheduling inbox',()=>{
  beforeEach(()=>{
    jest.clearAllMocks();
    const items=[item({}),item({id:'schedule-2',actionId:'schedule-2',request:'Confirmar exame',state:'paused',pauseReason:'message_needs_user_review',version:4}),item({id:'schedule-3',actionId:'schedule-3',request:'Reunião encerrada',state:'cancelled',pauseReason:'outbound_sent_after_state_changed',version:7})];
    mockedAxios.get.mockImplementation((url:string)=>Promise.resolve({data:String(url).endsWith('/secretary/scheduling')?{items}:items[1]} as any));
  });

  it('recovers an existing negotiation by id and exposes attention and approval inboxes',async()=>{
    const page=render(<SchedulingInbox requestedId="schedule-2"/>);
    await wait(()=>page.getByLabelText('Acompanhamento de agendamento pelo WhatsApp'));
    expect(page.getAllByText('Confirmar exame').length).toBeGreaterThan(0);
    expect(page.getByText('Precisam de atenção')).toBeTruthy();
    expect(page.getByText('Aguardando aprovação')).toBeTruthy();
    fireEvent.click(page.getByText('Precisam de atenção'));
    expect(page.getByText('Reunião encerrada')).toBeTruthy();
    expect(page.getByText(/Verificar envio/)).toBeTruthy();
    expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/secretary/scheduling'),{params:{limit:100}});
  });
});
