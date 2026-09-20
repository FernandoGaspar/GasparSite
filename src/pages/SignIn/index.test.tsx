import React from 'react';
import {fireEvent,render,waitForElement} from '@testing-library/react';
import {ThemeProvider} from 'styled-components';
import theme from '../../styles/themes/dark';
import {useAuth} from '../../hooks/auth';
import SignIn from './index';

jest.mock('../../hooks/auth',()=>({useAuth:jest.fn()}));

test('429 is handled by the login form with no automatic retry',async()=>{
  const signIn=jest.fn().mockRejectedValue({isAxiosError:true,response:{status:429}});
  (useAuth as jest.Mock).mockReturnValue({signIn});
  const view=render(<ThemeProvider theme={theme}><SignIn/></ThemeProvider>);
  fireEvent.change(view.getByPlaceholderText('voce@exemplo.com'),{target:{value:'test@example.test'}});
  fireEvent.change(view.getByPlaceholderText('Digite sua senha'),{target:{value:'test-password'}});
  fireEvent.submit(view.getByRole('button',{name:'Entrar no Gaspar'}).closest('form')!);
  const message=await waitForElement(()=>view.getByRole('alert'));
  expect(message.textContent).toContain('Muitas tentativas de acesso');
  expect(signIn).toHaveBeenCalledTimes(1);
});
