import React from 'react';
import axios from 'axios';
import { fireEvent, render, wait } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import dark from '../../styles/themes/dark';
import MicrosoftWorkspace from './MicrosoftWorkspace';

jest.mock('axios', () => ({
  __esModule:true,
  default:{get:jest.fn(),post:jest.fn()},
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Microsoft professional mail filters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockImplementation((url:string) => Promise.resolve({data:String(url).endsWith('/microsoft/connection')
      ? {configured:true,connected:true,displayName:'Fernando'}
      : {items:[],summary:{total:0,unread:0,flagged:0,attachments:0,actionable:0}}} as any));
  });

  it('asks the API for the selected filter before the result limit', async () => {
    const page = render(<ThemeProvider theme={dark}><MicrosoftWorkspace mode="emails" onDraft={jest.fn()}/></ThemeProvider>);

    await wait(() => expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/microsoft/messages'),
      expect.objectContaining({params:expect.objectContaining({mode:'action',limit:50})}),
    ));

    fireEvent.click(page.getByRole('button',{name:'Sinalizados'}));
    await wait(() => expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/microsoft/messages'),
      expect.objectContaining({params:expect.objectContaining({mode:'flagged',limit:50})}),
    ));

    fireEvent.click(page.getByRole('button',{name:'Enviados'}));
    await wait(() => expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/microsoft/messages'),
      expect.objectContaining({params:expect.objectContaining({mode:'sent',limit:50})}),
    ));
  });
});
