import React from 'react';
import {render} from '@testing-library/react';
import {useAuth} from '../hooks/auth';
import Routes from './index';

jest.mock('../hooks/auth',()=>({useAuth:jest.fn()}));
jest.mock('./app.routes',()=>()=> <div>Área autenticada</div>);
jest.mock('./auth.routes',()=>()=> <div>Formulário de login</div>);

test('remembered email never triggers login during rendering, including rerenders',()=>{
  const signIn=jest.fn();
  (useAuth as jest.Mock).mockReturnValue({logged:false,email:'remembered@example.test',senha:'',signIn});
  const view=render(<React.StrictMode><Routes/></React.StrictMode>);
  expect(view.getByText('Formulário de login')).toBeTruthy();
  view.rerender(<React.StrictMode><Routes/></React.StrictMode>);
  expect(signIn).not.toHaveBeenCalled();
});

test('existing authenticated session opens app without submitting credentials again',()=>{
  const signIn=jest.fn();
  (useAuth as jest.Mock).mockReturnValue({logged:true,email:'remembered@example.test',senha:'',signIn});
  const view=render(<Routes/>);
  expect(view.getByText('Área autenticada')).toBeTruthy();
  expect(signIn).not.toHaveBeenCalled();
});
