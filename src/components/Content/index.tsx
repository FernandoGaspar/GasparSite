import React, { PropsWithChildren } from 'react';
import { Container }  from './styles';

const Content: React.FC<PropsWithChildren> = ({ children }) => (
  <Container>{children}</Container>
);

export default Content;
