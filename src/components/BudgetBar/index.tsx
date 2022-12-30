import React, { useEffect, useMemo, useState } from 'react';


import BudgetBarLine from '../BudgetBarLine';

import axios from 'axios';
import { URL_API } from '../../repositories/baseAPI';

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
  
    const getBudgetVrsRealizado = () => {
        axios.post (URL_API + "/budgetvrsRealizado", {
            headers: {"Access-Control-Allow-Origin": "*"},
            anomes: anoMes,
            usuario: idUsuario
        })
        .then((response) => {
            const { data } = response
            setDataBudgetVrsRealizado (JSON.parse(data))
        })
        .catch((error) => {
          console.log(error)
        })
    }

    useEffect(() => {
        getBudgetVrsRealizado()
    },[anoMes]);

    return (
        <Container>
            {
                dataBudgetVrsRealizado.map(item => (
                    <BudgetBarLine 
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

