import React, { useCallback, useEffect, useState } from 'react';


import BudgetBarLine from '../BudgetBarLine';

import axios from 'axios';
import { URL_API } from '../../repositories/baseAPI';
import { deduplicatedRequest } from '../../repositories/requestCache';

import { 
    Container,
 }  from './styles';

 
interface IDataBudgetVrsRealizado {
    AnoMes: string
    subGrupoContaContabil: string
    Cor: string
    ValorOrcado: number
    ValorRealizado: number
    Delta: number    
  }

interface IBudgetBar {
    anoMes: string
}

const BudgetBar: React.FC<IBudgetBar> = ({
    anoMes,
}) => {
    

    const [dataBudgetVrsRealizado, setDataBudgetVrsRealizado] = useState<IDataBudgetVrsRealizado[]>([]);
    const idUsuario = localStorage.getItem('@minha-carteira:usuarioId') as string;
  
    const getBudgetVrsRealizado = useCallback(() => {
        deduplicatedRequest(`budget:${idUsuario}:${anoMes}`, () => axios.post (URL_API + "/budgetvrsRealizado", {
            headers: {"Access-Control-Allow-Origin": "*"},
            anomes: anoMes,
            usuario: idUsuario
        }))
        .then((response) => {
            const { data } = response
            setDataBudgetVrsRealizado (JSON.parse(data))
        })
        .catch((error) => {
          console.log(error)
        })
    }, [anoMes, idUsuario])

    useEffect(() => {
        getBudgetVrsRealizado()
    },[getBudgetVrsRealizado]);

    return (
        <Container>
            {
                dataBudgetVrsRealizado.map(item => (
                    <BudgetBarLine 
                        key = {item.subGrupoContaContabil}
                        grupoContaContabil={item.subGrupoContaContabil} 
                        valorRestante={Number(item.ValorOrcado-item.ValorRealizado)} 
                        valorBudget={Number(item.ValorOrcado)} 
                        valorRealizado={Number(item.ValorRealizado)} 
                        progress = {item.Delta*100}
                        cor={item.Cor}/>
                ))
            } 
            
        </Container>
    );  
}
export default BudgetBar;

