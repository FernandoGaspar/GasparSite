import React, { useMemo, useState } from 'react';
import { useShowNumber } from '../../hooks/showNumber';
import ProgressBar from '../ProgressBar';
import formatCurrency from '../../utils/formatCurrency';

import { 
    Container,
 }  from './styles';

 interface IBudgetBarLine {
  grupoContaContabil: string
  valorRestante: number
  valorBudget: number
  valorRealizado: number
  progress: number
  cor: string
}

const BudgetBarLine: React.FC <IBudgetBarLine> = ({
  grupoContaContabil, 
  valorRestante,
  valorBudget,
  valorRealizado,
  progress,
  cor
}) => {
    const { showNumber } = useShowNumber();

    const evolucao = useMemo(() => {
      let valor  = 0
      if (progress > 100){
        valor = 100
      }else {
        valor = progress
      }
      return Math.round(valor)
    },[progress]);

    const texto = useMemo(() => {
      let textoRetorno  = "0"
      if (progress <= 100){
        textoRetorno = "Restam"
      }else {
        textoRetorno = "Ultrapassou"
      }
      return textoRetorno
    },[valorRestante]);

    const valorRestanteAjustado = useMemo(() => {
      let retorno = ""
      if (showNumber == false){
        retorno = "***"
      } else {
        retorno = formatCurrency (Math.abs(valorRestante), 0)
      }
      return retorno
    },[valorRestante, showNumber]);

    const valorRealizadoAjustado = useMemo(() => {
      let retorno = ""
      if (showNumber == false){
        retorno = "***"
      } else {
        retorno = formatCurrency (Math.abs(valorRealizado), 1)
      }
      return retorno
    },[valorRealizado, showNumber]);

    const valorBudgetAjustado = useMemo(() => {
      let retorno = ""
      if (showNumber == false){
        retorno = "***"
      } else {
        retorno = formatCurrency (Math.abs(valorBudget), 1)
      }
      return retorno
    },[valorBudget, showNumber]);

    return (
        <Container>
          
          <header>
            <p>{grupoContaContabil}</p>
            <p style={{
              fontWeight: "bold"
            }}
              > {texto} { valorRestanteAjustado }</p>
            
          </header>
          <ProgressBar bgcolor={cor} progress={evolucao}  height={20} />
          <small>{ valorRealizadoAjustado } de { valorBudgetAjustado }</small>
          <br/>
          <h1 />
          <br/>
        </Container>
    );  
}
export default BudgetBarLine;

