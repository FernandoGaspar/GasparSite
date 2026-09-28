import React from 'react';
import axios from 'axios';
import { fireEvent, render, wait } from '@testing-library/react';
import SchedulingCard, { SchedulingAction } from '.';

jest.mock('axios', () => ({
  __esModule:true,
  default:{get:jest.fn(),post:jest.fn()},
}));

const mockedAxios=axios as jest.Mocked<typeof axios>;
const action=(agentAllowed=true):SchedulingAction=>({
  type:'whatsapp_scheduling',id:'schedule-1',actionId:'schedule-1',state:'awaiting_initial_approval',version:3,
  request:'Marcar consulta',draftMessage:'Olá! Podemos combinar um horário?',mode:'negotiate_only',
  contactId:'contact-1',contactCandidates:[{
    id:'contact-1',displayName:'Dra. Marina',channels:[{type:'whatsapp',address:'+5511999991234',isPrimary:true,isAllowed:true,agentAllowed}],
  }],
  constraints:{timezone:'America/Sao_Paulo',durationMinutes:30,allowedWeekdays:[1],allowedStartTime:'09:00',allowedEndTime:'17:00',maxRounds:4},
});

describe('WhatsApp scheduling card',()=>{
  beforeEach(()=>{
    jest.clearAllMocks();
    mockedAxios.get.mockImplementation(()=>new Promise(()=>undefined) as any);
  });

  it('does not approve a contact without explicit agent permission',()=>{
    const page=render(<SchedulingCard action={action(false)}/>);
    expect(page.getByText(/Sem autorização para a secretária/)).toBeTruthy();
    expect((page.getByText('Aprovar início').closest('button') as HTMLButtonElement).disabled).toBe(true);
  });

  it('sends reviewed limits, expected version and an idempotency key',async()=>{
    mockedAxios.post.mockResolvedValue({data:{...action(true),state:'initial_message_queued',version:4}} as any);
    const page=render(<SchedulingCard action={action(true)}/>);
    fireEvent.click(page.getByText('Editar limites'));
    fireEvent.click(page.getByLabelText('Ter'));
    fireEvent.click(page.getByText('Aprovar início'));

    await wait(()=>expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/secretary/scheduling/schedule-1/approve-initial'),
      expect.objectContaining({
        expectedVersion:3,contactId:'contact-1',mode:'negotiate_only',message:'Olá! Podemos combinar um horário?',
        constraints:expect.objectContaining({allowedWeekdays:[1,2],maxRounds:4}),
      }),
      expect.objectContaining({headers:{'Idempotency-Key':expect.stringContaining('secretary-approve-initial:')}}),
    ));
  });

  it('only allows cancellation after reviewing an ambiguous outbound outcome',async()=>{
    const paused={...action(true),state:'paused',pauseReason:'outbound_outcome_unknown',version:9};
    mockedAxios.post.mockResolvedValue({data:{...paused,state:'cancelled',pauseReason:'',version:10}} as any);
    const page=render(<SchedulingCard action={paused}/>);
    expect(page.getByText('O envio pode já ter acontecido.')).toBeTruthy();
    expect(page.getByText(/Não reenvie/)).toBeTruthy();
    expect(page.queryByText('Retomar')).toBeNull();
    expect(page.queryByText('Voltar para revisão')).toBeNull();
    expect(page.queryByText('Intervir')).toBeNull();
    const safeLink=page.getByText('Conferir conversa com segurança').closest('a');
    expect(safeLink?.getAttribute('href')).toContain('/communications?channel=whatsapp');
    const cancel=page.getByText('Encerrar mandato').closest('button') as HTMLButtonElement;
    expect(cancel.disabled).toBe(true);
    fireEvent.click(page.getByLabelText(/Conferi a conversa/));
    expect(cancel.disabled).toBe(false);
    fireEvent.click(cancel);
    await wait(()=>expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/secretary/scheduling/schedule-1/cancel'),
      expect.objectContaining({expectedVersion:9}),
      expect.objectContaining({headers:{'Idempotency-Key':expect.stringContaining('secretary-cancel:')}}),
    ));
  });

  it.each(['outbound_sent_after_state_changed','outbound_outcome_unknown'])('acknowledges reviewed terminal outbound attention (%s) without offering resend actions',async pauseReason=>{
    const cancelled={...action(true),state:'cancelled',pauseReason,version:10};
    mockedAxios.post.mockResolvedValue({data:{...cancelled,pauseReason:'',version:11}} as any);
    const page=render(<SchedulingCard action={cancelled}/>);
    expect(page.getByText('O envio pode já ter acontecido.')).toBeTruthy();
    expect(page.getByText(/mandato (ter sido|já está) encerrado/)).toBeTruthy();
    expect(page.getByText('Conferir conversa com segurança')).toBeTruthy();
    expect(page.queryByText('Retomar')).toBeNull();
    expect(page.queryByText('Intervir')).toBeNull();
    expect(page.queryByText('Encerrar mandato')).toBeNull();
    const acknowledge=page.getByText('Marcar como conferido').closest('button') as HTMLButtonElement;
    expect(acknowledge.disabled).toBe(true);
    fireEvent.click(page.getByLabelText(/estou ciente desta mensagem possivelmente enviada/));
    expect(acknowledge.disabled).toBe(false);
    fireEvent.click(acknowledge);
    await wait(()=>expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/secretary/scheduling/schedule-1/acknowledge-attention'),
      expect.objectContaining({expectedVersion:10}),
      expect.objectContaining({headers:{'Idempotency-Key':expect.stringContaining('secretary-acknowledge-attention:')}}),
    ));
    await wait(()=>expect(page.queryByText('Marcar como conferido')).toBeNull());
  });
});
