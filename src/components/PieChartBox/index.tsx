import React, { useEffect, useMemo, useState } from 'react';
import { useShowNumber } from '../../hooks/showNumber';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

import { 
    Container,
    TituloGrupo,
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
    const [grupoSelecionado, setGrupoSelecionado] = useState<string | null>(null);
    const { showNumber } = useShowNumber();

    const dadosNormalizados = useMemo(() => data
        .map((item) => ({
            grupo: String(item.grupo || 'Sem categoria'),
            subGrupo: String(item.subGrupo || item.grupo || 'Sem categoria'),
            Cor: item.Cor || '#4F8CFF',
            Valor: Math.abs(Number(item.Valor) || 0),
        }))
        .filter((item) => item.Valor > 0), [data]);

    const dataAgrupado = useMemo(() => {
        const grupos = new Map<string, IDataAgrupado>();

        dadosNormalizados.forEach((item) => {
            const atual = grupos.get(item.grupo);
            grupos.set(item.grupo, {
                grupo: item.grupo,
                Cor: atual?.Cor || item.Cor,
                Valor: (atual?.Valor || 0) + item.Valor,
            });
        });

        return Array.from(grupos.values()).sort((a, b) => b.Valor - a.Valor);
    }, [dadosNormalizados]);

    const dataDetalhe = useMemo(() => {
        const detalhes = new Map<string, IDataDetalhe>();
        const itens = grupoSelecionado
            ? dadosNormalizados.filter((item) => item.grupo === grupoSelecionado)
            : dadosNormalizados;

        itens.forEach((item) => {
            const chave = `${item.grupo}-${item.subGrupo}`;
            const atual = detalhes.get(chave);
            detalhes.set(chave, {
                grupo: item.grupo,
                subGrupo: item.subGrupo,
                Cor: atual?.Cor || item.Cor,
                Valor: (atual?.Valor || 0) + item.Valor,
            });
        });

        return Array.from(detalhes.values()).sort((a, b) => b.Valor - a.Valor);
    }, [dadosNormalizados, grupoSelecionado]);

    useEffect(() => {
        if (grupoSelecionado && !dataAgrupado.some((item) => item.grupo === grupoSelecionado)) {
            setGrupoSelecionado(null);
        }
    }, [dataAgrupado, grupoSelecionado]);
    
    const valorTotalDadoFiltrado = useMemo(() => {
        let total: number = 0;
        dataAgrupado.forEach(item => {
            total += Number(item.Valor) || 0;
        });

        return Math.round(total);

        // return 0;
    }, [dataAgrupado])

    return (
        <Container>

            <section>
                <span>
                    { titulo }
                </span>
                <main>
                    {
                        dataAgrupado.map((item) => (
                            <TituloGrupo 
                                lineColor={item.Cor}
                                onClick={() => setGrupoSelecionado(item.grupo === grupoSelecionado ? null : item.grupo)} >
                                <footer>
                                    { item.grupo }
                                </footer>
                                <h1>
                                    { valorTotalDadoFiltrado ? Math.round(item.Valor / valorTotalDadoFiltrado * 100) + "%" : "0%" }
                                </h1>
                            </TituloGrupo>
                        ))
                    }      
                </main>          
            </section>


            <ResponsiveContainer width="100%" height={240} debounce={100}>
                <PieChart >
                <Tooltip formatter={(value) => new Intl.NumberFormat([], {
                                                                            style: 'currency',
                                                                            currency: 'BRL',
                                                                            maximumFractionDigits: 0
                                                                            }).format(Number(value))} />
                <Pie
                    dataKey="Valor"
                    nameKey="subGrupo"                    
                    data={ dataDetalhe }
                    outerRadius={60}
                >
                

                        {
                            dataDetalhe.map((indicator) => (
                                <Cell 
                                    key={`${indicator.grupo}-${indicator.subGrupo}`}
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
                                    onClick={() => setGrupoSelecionado(indicator.grupo === grupoSelecionado ? null : indicator.grupo)}
                                    />
                            ))
                        }
                </Pie>
                <Tooltip />
                </PieChart>
                                
            </ResponsiveContainer>
        </Container>
    );
}
export default PieChartBox;
