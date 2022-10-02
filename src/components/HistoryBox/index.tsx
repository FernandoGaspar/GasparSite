import React, { useMemo, useState } from 'react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    CartesianGrid,
    Tooltip,
    YAxis,
} from 'recharts';

import { 
    Container, 
    ChartContainer,
    Header,
    LegendContainer,
    Legend,
}  from './styles';

interface IHistoryBoxProps {
    data: {
        subGrupoContaContabil: string
        Valor: number
        AnoMes: string
        Cor: string
    }[]
}

interface IHistoryBoxProps {
    data: {
        subGrupoContaContabil: string 
        Valor: number
        AnoMes: string
        Cor: string
    }[]
}

// interface IHistoryBoxProps {
//     data: {
//         month: string;
//         amountEntry: number;
//         amountOutput: number;
//     }[],
//     lineColorAmountEntry: string;
//     lineColorAmountOutput: string;
// }

const HistoryBox: React.FC<IHistoryBoxProps> = ({
    data
}) => {
    const dadoAjustado = useMemo(() => {
        let map = new Map();
        let dados = [
            {
                AnoMes: "202101",
                Alimentacao: "100",
                Veiculo: "100",
                Mercado: "100",
            },
            {
                AnoMes: "202102",
                Alimentacao: "200",
                Veiculo: "130",
                Mercado: "120",
            },
        ];

        
        return dados;
    },[data]);

    return (
        <Container>
            <Header>
                <h2>Histórico de saldo</h2>
            </Header>

                <LineChart
                    width={500}
                    height={300}
                    data={dadoAjustado}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5
                    }}
                    >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="AnoMes" />
                    <YAxis />
                    <Tooltip />
                    {/* <Legend /> */}

                    <Line
                        type="monotone"
                        dataKey="Alimentacao"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                    />
                    <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
                </LineChart>
        </Container>
    )}

export default HistoryBox;