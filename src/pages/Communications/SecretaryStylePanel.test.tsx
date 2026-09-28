import React from 'react';
import axios from 'axios';
import { fireEvent, render, wait } from '@testing-library/react';
import SecretaryStylePanel from './SecretaryStylePanel';

jest.mock('axios',()=>({
  __esModule:true,
  default:{get:jest.fn(),patch:jest.fn()},
}));
const mockedAxios=axios as jest.Mocked<typeof axios>;
const style={version:5,formality:'neutral',warmth:'warm',verbosity:'short',emojiUsage:'rare',greetingPreference:'Olá!',closingPreference:'Obrigada.',customInstructions:''};

describe('Secretary communication style',()=>{
  beforeEach(()=>{
    jest.clearAllMocks();
    mockedAxios.get.mockResolvedValue({data:style} as any);
    mockedAxios.patch.mockResolvedValue({data:{...style,version:6,formality:'formal'}} as any);
  });

  it('previews tone while keeping permissions visibly separate',async()=>{
    const page=render(<SecretaryStylePanel/>);
    await wait(()=>page.getByLabelText('Formalidade'));
    expect(page.getByText('Estilo não altera permissões.')).toBeTruthy();
    fireEvent.change(page.getByLabelText('Formalidade'),{target:{value:'formal'}});
    fireEvent.click(page.getByText('Salvar estilo'));
    await wait(()=>expect(mockedAxios.patch).toHaveBeenCalledWith(
      expect.stringContaining('/secretary/style'),
      expect.objectContaining({formality:'formal',expectedVersion:5}),
      expect.objectContaining({headers:{'Idempotency-Key':expect.stringContaining('secretary-style:')}}),
    ));
  });
});
