import React, { PropsWithChildren, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Container }  from './styles';

const Content: React.FC<PropsWithChildren> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return <Container ref={containerRef}>{children}</Container>;
};

export default Content;
