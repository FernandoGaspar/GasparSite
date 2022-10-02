import axios from 'axios';
import React, { useState } from 'react';
import { useShowNumber } from '../../hooks/showNumber';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { URL_API } from '../../repositories/baseAPI';

import { 
    Container,
    SideRight,
 }  from './styles';

 
//  interface IPieChartProps {
//      data: {
//         name: string;
//         value: number;
//         percent: number;
//         color: string;
//      }[];
//  }


interface IPieChartProps {
    data: {
        subGrupoContaContabil: string
        Valor: number
        AnoMes: string
        Cor: string
    }[]
}

interface IDataContaAgrupado {
    contaContabil: string
    Valor: number
    AnoMes: string
    Cor: string
}
const PieChartBox: React.FC<IPieChartProps> = ({ data }) => { 

    const idUsuario = localStorage.getItem('@minha-carteira:usuarioId') as string;
    const [custoContaAgrupado, setCustoContaAgrupado] = useState<IDataContaAgrupado[]>([]);
    const { showNumber } = useShowNumber();

    async function detalharGasto (subGrupoContaContabil: string){
        await axios.post (URL_API+"/gastosAgrupadosPorConta", {
            anomes: data[1].AnoMes,
            usuario: idUsuario,
            subGrupoContaContabil: subGrupoContaContabil
        })
        .then((response) => {
            const { data } = response
            setCustoContaAgrupado(JSON.parse(data))
        })
        .catch((error) => {
          console.log(error)
        })
    } 
    return (
        <Container>
                        <SideRight>
                        <ResponsiveContainer >
                        <PieChart 
                            width={1000} 
                            height={400}
                            >
                        <Tooltip formatter={(value) => new Intl.NumberFormat([], {
                                                                                    style: 'currency',
                                                                                    currency: 'BRL',
                                                                                    maximumFractionDigits: 0
                                                                                    }).format(Number(value))} />
                        <Pie
                            dataKey="Valor"
                            nameKey="contaContabil"                    
                            data={ custoContaAgrupado }
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                        >
                                {
                                    custoContaAgrupado.map((indicator) => (
                                        <Cell 
                                            key={indicator.contaContabil} 
                                            fill={indicator.Cor} 
                                            
                                            />
                                    ))
                                }
                        
                        </Pie>
                        
                        <Pie
                            dataKey="Valor"
                            nameKey="subGrupoContaContabil"
                            label={showNumber? (cutoAgrupadoSubGrup) => new Intl.NumberFormat([], {
                                                                                        style: 'currency',
                                                                                        currency: 'BRL',
                                                                                        maximumFractionDigits: 0
                                                                                        }).format(Number(cutoAgrupadoSubGrup.payload.Valor))
                                    : false
                                                                                    }
                            isAnimationActive={ false }
                            data={ data }
                            cx="50%"
                            cy="50%"
                            innerRadius={70} 
                            outerRadius={90}
                            paddingAngle={5}
                        >
                                {
                                    data.map((indicator) => (
                                        <Cell 
                                            key={indicator.subGrupoContaContabil} 
                                            fill={indicator.Cor} 
                                            onClick={() => {detalharGasto(indicator.subGrupoContaContabil)}}
                                            />
                                    ))
                                }
                        </Pie>
                        <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </SideRight>
            </Container>
    );
}
export default PieChartBox;
