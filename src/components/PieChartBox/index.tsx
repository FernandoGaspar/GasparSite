import React, { useEffect, useMemo, useState } from 'react';
import { useShowNumber } from '../../hooks/showNumber';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

import { 
    Container,
    SideRight,
 }  from './styles';

interface IPieChartProps {
    titulo: string
    data: {
        grupo: string
        subGrupo: string
        Valor: number
        Cor: string
    }[]
}

interface IDataAgrupado {
    grupo: string
    Cor: string
    Valor: number
}

interface IDataDetalhe {
    grupo: string
    subGrupo: string
    Cor: string
    Valor: number
}


const PieChartBox: React.FC<IPieChartProps> = ({ titulo, data }) => { 
    const [dataAgrupado, setDataAgrupado] = useState<IDataAgrupado[]>([]);
    const [dataDetalhe, setDataDetalhe] = useState<IDataDetalhe[]>([]);
    const { showNumber } = useShowNumber();


    function agruparDado () {
        const groupBy = require('group-by-with-sum');
        const agrupado = groupBy(data, 'grupo, Cor', 'Valor');
        setDataAgrupado(agrupado)

    }

    function detalharGrupo (grupo: string){
        const dadoFiltrado = data.filter(item => item.grupo === grupo);
        const groupBy = require('group-by-with-sum');
        const agrupado = groupBy(dadoFiltrado, 'grupo, subGrupo, Cor', 'Valor');
        setDataDetalhe(agrupado)
    }

    useEffect(() => {
        agruparDado ()
    },[data]); 
    return (
        <Container>
            {/* <span>
                { titulo }
            </span> */}
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
                            nameKey="subGrupo"                    
                            data={ dataDetalhe }
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                        >
                                {
                                    dataDetalhe.map((indicator) => (
                                        <Cell 
                                            key={indicator.subGrupo} 
                                            fill={indicator.Cor} 
                                            
                                            />
                                    ))
                                }
                        
                        </Pie>
                        
                        <Pie
                            dataKey="Valor"
                            nameKey="grupo"
                            label={showNumber? (valorGrupo) => new Intl.NumberFormat([], {
                                                                                        style: 'currency',
                                                                                        currency: 'BRL',
                                                                                        maximumFractionDigits: 0
                                                                                        }).format(Number(valorGrupo.payload.Valor))
                                    : false
                                                                                    }
                            isAnimationActive={ false }
                            data={ dataAgrupado }
                            cx="50%"
                            cy="50%"
                            innerRadius={70} 
                            outerRadius={90}
                            paddingAngle={5}
                        >
                                {
                                    dataAgrupado.map((indicator) => (
                                        <Cell 
                                            key={indicator.grupo} 
                                            fill={indicator.Cor} 
                                            onClick={() => {detalharGrupo(indicator.grupo)}}
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
