import React, { useEffect, useMemo, useState } from 'react';
import { useShowNumber } from '../../hooks/showNumber';
import { Cell, Label, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Container, TituloGrupo } from './styles';

interface IPieChartProps {
    titulo: string
    data: { grupo: string; subGrupo: string; Valor: number; Cor: string }[]
}

interface IDataAgrupado { grupo: string; Cor: string; Valor: number }
interface IDataDetalhe extends IDataAgrupado { subGrupo: string }

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL', maximumFractionDigits: 0,
}).format(value);

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
                grupo: item.grupo, subGrupo: item.subGrupo,
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

    const total = useMemo(() => dataAgrupado.reduce((sum, item) => sum + item.Valor, 0), [dataAgrupado]);
    const totalSelecionado = grupoSelecionado
        ? dataAgrupado.find((item) => item.grupo === grupoSelecionado)?.Valor || 0
        : total;

    return (
        <Container>
            <section className="pie-summary">
                <header>
                    <span>{titulo}</span>
                    <small>{grupoSelecionado ? 'Detalhamento do grupo selecionado' : 'Distribuição por classe'}</small>
                </header>
                <main aria-label={`Legenda de ${titulo}`}>
                    {dataAgrupado.map((item) => {
                        const selecionado = item.grupo === grupoSelecionado;
                        const percentual = total ? Math.round((item.Valor / total) * 100) : 0;
                        return (
                            <TituloGrupo
                                key={item.grupo}
                                type="button"
                                lineColor={item.Cor}
                                className={selecionado ? 'selected' : ''}
                                onClick={() => setGrupoSelecionado(selecionado ? null : item.grupo)}
                                title={`Filtrar ${item.grupo}`}
                            >
                                <i />
                                <span>{item.grupo}</span>
                                <strong>{percentual}%</strong>
                                <em>{showNumber ? formatCurrency(item.Valor) : '••••••'}</em>
                            </TituloGrupo>
                        );
                    })}
                </main>
            </section>

            <div className="pie-chart-area">
                {dataAgrupado.length ? (
                    <ResponsiveContainer width="100%" height="100%" debounce={100}>
                        <PieChart>
                            <Tooltip
                                formatter={(value: number) => formatCurrency(Number(value))}
                                labelFormatter={(_, payload) => String(payload?.[0]?.payload?.subGrupo || payload?.[0]?.payload?.grupo || '')}
                            />
                            <Pie dataKey="Valor" nameKey="subGrupo" data={dataDetalhe} cx="50%" cy="50%" innerRadius={48} outerRadius={76} paddingAngle={1} stroke="none">
                                {dataDetalhe.map((item) => <Cell key={`${item.grupo}-${item.subGrupo}`} fill={item.Cor} />)}
                            </Pie>
                            <Pie
                                dataKey="Valor" nameKey="grupo" data={dataAgrupado}
                                cx="50%" cy="50%" innerRadius={84} outerRadius={108}
                                paddingAngle={3} stroke="none"
                                onClick={(item) => setGrupoSelecionado(item.grupo === grupoSelecionado ? null : item.grupo)}
                            >
                                <Label value={showNumber ? formatCurrency(totalSelecionado) : '••••••'} position="center" className="pie-total-value" />
                                {dataAgrupado.map((item) => <Cell key={item.grupo} fill={item.Cor} />)}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                ) : <p className="pie-empty">Sem dados para este período.</p>}
                <div className="pie-total-caption">{grupoSelecionado || 'Total investido'}</div>
            </div>
        </Container>
    );
};

export default PieChartBox;
