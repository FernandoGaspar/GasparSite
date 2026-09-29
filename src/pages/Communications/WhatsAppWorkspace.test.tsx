import React from 'react';
import axios from 'axios';
import {fireEvent,render,wait} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import WhatsAppWorkspace,{ sameWhatsAppIdentity } from './WhatsAppWorkspace';

jest.mock('axios',()=>({__esModule:true,default:{get:jest.fn(),post:jest.fn()}}));
const mockedAxios=axios as jest.Mocked<typeof axios>;
let schedulingItems:any[]=[];
let manualAttentions:any[]=[];

describe('WhatsApp canonical identity',()=>{
  it('normalizes formatting but never merges partial phone numbers',()=>{
    expect(sameWhatsAppIdentity('+55 (11) 99999-1234','5511999991234@s.whatsapp.net')).toBe(true);
    expect(sameWhatsAppIdentity('5511999991234:3@s.whatsapp.net','5511999991234@s.whatsapp.net')).toBe(true);
    expect(sameWhatsAppIdentity('5511999991234@s.whatsapp.net','11999991234@s.whatsapp.net')).toBe(false);
    expect(sameWhatsAppIdentity('5511999991234@s.whatsapp.net','999991234')).toBe(false);
    expect(sameWhatsAppIdentity('123@lid','123@s.whatsapp.net')).toBe(false);
  });
});

describe('WhatsApp manual send idempotency',()=>{
  beforeEach(()=>{
    jest.clearAllMocks();
    schedulingItems=[];
    manualAttentions=[];
    jest.spyOn(window,'confirm').mockReturnValue(true);
    mockedAxios.get.mockImplementation((url:any)=>{
      const path=String(url);
      if(path.includes('/whatsapp/connection'))return Promise.resolve({data:{configured:true,connected:true,allowSend:true,groupsEnabled:false,gatewayState:'connected'}} as any);
      if(path.endsWith('/contacts'))return Promise.resolve({data:{contacts:[]}} as any);
      if(path.endsWith('/secretary/scheduling'))return Promise.resolve({data:{items:schedulingItems}} as any);
      if(path.endsWith('/whatsapp/outbound-attentions'))return Promise.resolve({data:{items:manualAttentions}} as any);
      if(path.includes('/messages'))return Promise.resolve({data:{items:[]}} as any);
      return Promise.resolve({data:{items:[{id:'5511999991234@s.whatsapp.net',title:'Contato de teste',isGroup:false,preview:'Oi',unreadCount:0,messageCount:1}]}} as any);
    });
  });

  afterEach(()=>jest.restoreAllMocks());

  it('opens the secretary shortcut directly in the scheduling inbox',async()=>{
    const page=render(<MemoryRouter><WhatsAppWorkspace initialView="scheduling" onDraft={jest.fn()} onManageConnection={jest.fn()}/></MemoryRouter>);
    await wait(()=>page.getByText('Agendamentos pelo WhatsApp'));
    expect(page.getByText('INBOX DA SECRETÁRIA')).toBeTruthy();
    expect(page.getByText('Novo agendamento').closest('a')?.getAttribute('href')).toBe('/assistant');
    expect(page.queryByText('Escolha uma conversa')).toBeNull();
  });

  it('reuses the same key after an ambiguous error and discards it only after success',async()=>{
    mockedAxios.post.mockRejectedValueOnce({}).mockResolvedValue({data:{ok:true}} as any);
    const page=render(<WhatsAppWorkspace onDraft={jest.fn()} onManageConnection={jest.fn()}/>);
    await wait(()=>page.getByText('Contato de teste'));
    fireEvent.click(page.getByText('Contato de teste'));
    await wait(()=>page.getByPlaceholderText('Escreva uma resposta…'));
    const editor=page.getByPlaceholderText('Escreva uma resposta…');
    fireEvent.change(editor,{target:{value:'Olá, tudo bem?'}});
    fireEvent.click(page.getByText('Revisar e enviar'));
    await wait(()=>page.getByText(/Tente novamente sem alterar o texto/));
    fireEvent.change(editor,{target:{value:'Texto temporário'}});
    fireEvent.change(editor,{target:{value:'Olá, tudo bem?'}});
    fireEvent.click(page.getByText('Revisar e enviar'));
    await wait(()=>expect(mockedAxios.post).toHaveBeenCalledTimes(2));

    const firstKey=(mockedAxios.post.mock.calls[0][2] as any).headers['Idempotency-Key'];
    const retryKey=(mockedAxios.post.mock.calls[1][2] as any).headers['Idempotency-Key'];
    expect(retryKey).toBe(firstKey);

    await wait(()=>expect((editor as HTMLTextAreaElement).value).toBe(''));
    fireEvent.change(editor,{target:{value:'Olá, tudo bem?'}});
    fireEvent.click(page.getByText('Revisar e enviar'));
    await wait(()=>expect(mockedAxios.post).toHaveBeenCalledTimes(3));
    const afterSuccessKey=(mockedAxios.post.mock.calls[2][2] as any).headers['Idempotency-Key'];
    expect(afterSuccessKey).not.toBe(firstKey);
  });

  it.each(['outbound_outcome_unknown','outbound_sent_after_state_changed'])('blocks the matching conversation while outbound attention remains (%s)',async pauseReason=>{
    schedulingItems=[{type:'whatsapp_scheduling',id:'schedule-blocked',actionId:'schedule-blocked',state:pauseReason==='outbound_outcome_unknown'?'paused':'cancelled',version:5,pauseReason,chatId:'5511999991234@s.whatsapp.net'}];
    const page=render(<WhatsAppWorkspace onDraft={jest.fn()} onManageConnection={jest.fn()}/>);
    await wait(()=>page.getByText('Contato de teste'));
    fireEvent.click(page.getByText('Contato de teste'));
    await wait(()=>page.getByText('Envio manual bloqueado para esta conversa.'));
    const editor=page.container.querySelector('.wa-layout main textarea') as HTMLTextAreaElement;
    const sendButton=page.getByText('Revisar e enviar').closest('button') as HTMLButtonElement;
    expect(editor.disabled).toBe(true);
    expect(sendButton.disabled).toBe(true);
    expect(page.getByText('Ver agendamento')).toBeTruthy();
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it('refreshes, blocks and acknowledges a durable manual attention before allowing a new key',async()=>{
    const attention={type:'whatsapp_manual_outbound_attention',id:'command-1',commandId:'command-1',chatId:'5511999991234@s.whatsapp.net',messagePreview:'Mensagem incerta',state:'outcome_unknown',isBlocking:true,version:4};
    let sendCount=0;
    mockedAxios.post.mockImplementation((url:any)=>{
      const path=String(url);
      if(path.includes('/outbound-attentions/command-1/acknowledge')){
        manualAttentions=[];
        return Promise.resolve({data:{...attention,state:'acknowledged',isBlocking:false,version:5}} as any);
      }
      if(path.endsWith('/whatsapp/messages')){
        sendCount+=1;
        if(sendCount===1){manualAttentions=[attention];return Promise.reject({response:{data:{code:'outcome_unknown',message:'Resultado incerto.'}}});}
        return Promise.resolve({data:{sent:true,messageId:'message-2'}} as any);
      }
      return Promise.resolve({data:{}} as any);
    });
    const page=render(<WhatsAppWorkspace onDraft={jest.fn()} onManageConnection={jest.fn()}/>);
    await wait(()=>page.getByText('Contato de teste'));
    fireEvent.click(page.getByText('Contato de teste'));
    await wait(()=>page.getByPlaceholderText('Escreva uma resposta…'));
    const editor=page.getByPlaceholderText('Escreva uma resposta…');
    fireEvent.change(editor,{target:{value:'Mensagem incerta'}});
    fireEvent.click(page.getByText('Revisar e enviar'));
    await wait(()=>page.getByText('Envio manual aguardando conferência.'));
    const firstSend=mockedAxios.post.mock.calls.find(call=>String(call[0]).endsWith('/whatsapp/messages'))!;
    const firstKey=(firstSend[2] as any).headers['Idempotency-Key'];
    expect(mockedAxios.get.mock.calls.filter(call=>String(call[0]).endsWith('/whatsapp/outbound-attentions')).length).toBeGreaterThan(1);

    fireEvent.click(page.getByText('Conferi a conversa'));
    await wait(()=>expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/whatsapp/outbound-attentions/command-1/acknowledge'),
      {confirmed:true,expectedVersion:4},
      expect.objectContaining({headers:{'Idempotency-Key':expect.stringContaining('whatsapp-manual-attention-ack:')}}),
    ));
    await wait(()=>expect(page.queryByText('Envio manual aguardando conferência.')).toBeNull());
    fireEvent.click(page.getByText('Revisar e enviar'));
    await wait(()=>expect(sendCount).toBe(2));
    const sends=mockedAxios.post.mock.calls.filter(call=>String(call[0]).endsWith('/whatsapp/messages'));
    expect((sends[1][2] as any).headers['Idempotency-Key']).not.toBe(firstKey);
  });
});
