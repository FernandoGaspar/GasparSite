import React from 'react';
import axios from 'axios';
import { fireEvent, render, wait } from '@testing-library/react';
import ContactManager, { CanonicalContact } from './ContactManager';

jest.mock('axios',()=>({
  __esModule:true,
  default:{get:jest.fn(),post:jest.fn(),patch:jest.fn()},
}));
const mockedAxios=axios as jest.Mocked<typeof axios>;
const contact:CanonicalContact={
  id:'contact-1',displayName:'Clínica Aurora',contactType:'company',tags:['saúde'],notes:'Recepção',isActive:true,version:7,
  channels:[
    {id:2,type:'whatsapp',address:'+5511999991234',label:'Recepção',isPrimary:true,isAllowed:true,agentAllowed:false},
    {id:3,type:'whatsapp',address:'+5511988884321',label:'Plantão',isPrimary:false,isAllowed:true,agentAllowed:true},
  ],
};

describe('Canonical contacts',()=>{
  beforeEach(()=>jest.clearAllMocks());

  it('masks channels and persists explicit secretary permission with versioning',async()=>{
    const onChange=jest.fn();
    mockedAxios.patch.mockResolvedValue({data:{contact:{...contact,version:8,channels:[{...contact.channels[0],agentAllowed:true},{...contact.channels[1],isAllowed:false,agentAllowed:false}]}}} as any);
    const page=render(<ContactManager contacts={[contact]} onReload={async()=>undefined} onChange={onChange}/>);
    expect(page.container.textContent).not.toContain('+5511999991234');
    expect(page.getByText('Sem autorização')).toBeTruthy();
    fireEvent.click(page.getByLabelText('Editar Clínica Aurora'));
    fireEvent.click(page.getByLabelText('Permitir secretária — Recepção'));
    fireEvent.click(page.getByLabelText('Canal ativo — Plantão'));
    fireEvent.click(page.getByText('Salvar contato'));

    await wait(()=>expect(mockedAxios.patch).toHaveBeenCalledWith(
      expect.stringContaining('/contacts/contact-1'),
      expect.objectContaining({
        expectedVersion:7,contactType:'company',tags:['saúde'],
        channels:[
          expect.objectContaining({id:2,address:'+5511999991234',isAllowed:true,agentAllowed:true}),
          expect.objectContaining({id:3,address:'+5511988884321',isAllowed:false,agentAllowed:false}),
        ],
      }),
      expect.objectContaining({headers:{'Idempotency-Key':expect.stringContaining('contact-update:')}}),
    ));
    expect(onChange).toHaveBeenCalled();
  });
});
