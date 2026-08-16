import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { CustomDialog } from 'react-st-modal';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

import InvestimentBox from '../../components/InvestmentBox';
import InvestmentAddModal from '../../components/InvestmentAddModal';
import InvestmentEvolution from '../../components/InvestmentEvolution';
import PieChartBox from '../../components/PieChartBox';
import WalletBox from '../../components/WalletBox';
import SelectInput from '../../components/SelectInput';
import NewsFeed from '../../components/NewsFeed';
import listOfPeriodos from '../../utils/periodos';
import { URL_API } from '../../repositories/baseAPI';

import {
    Container,
    Content,
} from './styles';

interface IPapelMonitorado {
    codigo: string
    codigoGrafico: string
    tipo: string
    dataAtualizada: string
    dataInicial: string
    valorAtual: number
    valorInicial: number
    variacao: number
    quantidade: number
    saldoAtual: number
    ultimoDividendo: number
    dataUltimoDiv: string
    tipoPapel: string
}

interface IEvolucaoInvestimentoData {
    AnoMes: number
    UltimoDiaMes: string
    Tipo: string
    Codigo: string
    ValorMedio: number
    dividendo: number
    Saldo: number
    ValorCotacao: number
    ValorCotacaoM1: number
    ValorMedioPonderado: number
    ValorCotacaoPonderado: number
    ValorM1Ponderado: number
    ValorDividendoPonderado: number
}

interface IIndicador {
    AnoMes: string
    Nome: string
    Valor: number
}

interface ISuggestion {
    type: 'buy' | 'hold' | 'sell';
    label: string;
    description: string;
}

function getCorInvestimento(tipo: string) {
    switch (tipo) {
        case 'FUNDOS IMOBILIÁRIOS': return "#02b022"
        case 'EMPRESA LISTADA NA BOLSA BRASILEIRA': return "#8c98ff"
        case 'EMPRESA LISTADA NA BOLSA INTERNACIONAL': return "#ff8cbe"
        case 'CRIPTOMOEDA': return "#fff48c"
        case 'INDICE': return "#8cfbff"
        default: return "#4F8CFF";
    }
}

const Investment: React.FC = () => {
    const [papeisMonitorados, setPapeisMonitorados] = useState<IPapelMonitorado[]>([]);
    const [evolucaoInvestimentos, setEvolucaoInvestimentos] = useState<IEvolucaoInvestimentoData[]>([]);
    const [indicadores, setIndicadores] = useState<IIndicador[]>([]);
    const [periodoSelected, setPeriodoSelected] = useState<number>(1);
    const [selectedCodigo, setSelectedCodigo] = useState<string>('');

    const idUsuario = localStorage.getItem('@minha-carteira:usuarioId') as string;

    const periodos = useMemo(() => {
        return listOfPeriodos.map((month, index) => ({
            value: index + 1,
            label: month,
        }));
    }, []);

    const handlePeriodoSelected = (periodo: number) => {
        if (periodo === 8) {
            periodo = 9999
        }
        setPeriodoSelected(periodo);
    }

    const atualizaPapeisMonitorados = () => {
        axios.post(URL_API + "/papeisMonitorados", {
            headers: { "Access-Control-Allow-Origin": "*" },
            idUsuario: idUsuario,
            periodo: periodoSelected
        })
            .then((response) => {
                const { data } = response
                setPapeisMonitorados(JSON.parse(data))
            })
            .catch((error) => {
                console.log(error)
            })
    }

    const getEvolucaoInvestimento = () => {
        axios.post(URL_API + "/evolucaoInvestimento", {
            headers: { "Access-Control-Allow-Origin": "*" },
            idUsuario: idUsuario,
        })
            .then((response) => {
                const { data } = response
                setEvolucaoInvestimentos(JSON.parse(data))
            })
            .catch((error) => {
                console.log(error)
            })
    }

    const getIndicadoresEconomicos = () => {
        axios.post(URL_API + "/evolucaoIndicadores", {
            headers: { "Access-Control-Allow-Origin": "*" },
        })
            .then((response) => {
                const { data } = response
                setIndicadores(JSON.parse(data))
            })
            .catch((error) => {
                console.log(error)
            })
    }

    useEffect(() => {
        atualizaPapeisMonitorados()
    }, [idUsuario, periodoSelected]);

    useEffect(() => {
        getEvolucaoInvestimento()
        getIndicadoresEconomicos()
    }, [idUsuario]);

    useEffect(() => {
        if (!selectedCodigo && papeisMonitorados.length > 0) {
            setSelectedCodigo(papeisMonitorados[0].codigo)
        }
    }, [papeisMonitorados, selectedCodigo]);

    const totalInvestido = useMemo(() => {
        return papeisMonitorados.reduce((total, item) => total + Number(item.saldoAtual || 0), 0);
    }, [papeisMonitorados]);

    const variacaoMediaPonderada = useMemo(() => {
        if (!totalInvestido) return 0;
        const somaPonderada = papeisMonitorados.reduce((total, item) => total + (item.saldoAtual * item.variacao), 0);
        return (somaPonderada / totalInvestido) * 100;
    }, [papeisMonitorados, totalInvestido]);

    const dividendosRecebidos = useMemo(() => {
        return papeisMonitorados.reduce((total, item) => total + (Number(item.ultimoDividendo || 0) * Number(item.quantidade || 0)), 0);
    }, [papeisMonitorados]);

    const maiorPosicao = useMemo(() => {
        if (!papeisMonitorados.length) return undefined;
        return [...papeisMonitorados].sort((a, b) => b.saldoAtual - a.saldoAtual)[0];
    }, [papeisMonitorados]);

    const alocacaoCarteira = useMemo(() => {
        return papeisMonitorados
            .filter(item => item.saldoAtual > 0)
            .map(item => ({
                grupo: item.tipoPapel,
                subGrupo: item.codigo,
                Valor: item.saldoAtual,
                Cor: getCorInvestimento(item.tipoPapel),
            }));
    }, [papeisMonitorados]);

    const getLatestIndicador = (nome: string) => {
        return indicadores
            .filter(item => item.Nome.toLowerCase() === nome)
            .sort((a, b) => a.AnoMes.localeCompare(b.AnoMes))
            .slice(-1)[0];
    }

    const sentimentoCarteira = useMemo(() => {
        const acoesBovespa = papeisMonitorados.filter(item => item.tipo === 'BOVESPA' && item.saldoAtual > 0);
        const saldoBovespa = acoesBovespa.reduce((total, item) => total + item.saldoAtual, 0);
        if (!saldoBovespa) return null;
        const media = acoesBovespa.reduce((total, item) => total + (item.saldoAtual * item.variacao), 0) / saldoBovespa;
        return media * 100;
    }, [papeisMonitorados]);

    const alertasCarteira = useMemo(() => {
        const mensagens: { type: 'warning' | 'attention' | 'info', title: string, description: string }[] = [];

        if (maiorPosicao && totalInvestido > 0) {
            const participacao = (maiorPosicao.saldoAtual / totalInvestido) * 100;
            if (participacao > 30) {
                mensagens.push({
                    type: 'warning',
                    title: `Concentração alta em ${maiorPosicao.codigo}`,
                    description: `${maiorPosicao.codigo} representa ${participacao.toFixed(2)}% da carteira. Considere diversificar para reduzir o risco.`
                });
            }
        }

        const cdiLatest = getLatestIndicador('cdi');
        if (cdiLatest) {
            const abaixoDoCDI = papeisMonitorados.filter(item => item.tipo === 'BOVESPA' && (item.variacao * 100) < cdiLatest.Valor);
            if (abaixoDoCDI.length) {
                const nomes = abaixoDoCDI.slice(0, 3).map(item => item.codigo).join(', ');
                mensagens.push({
                    type: 'attention',
                    title: `${abaixoDoCDI.length} ${abaixoDoCDI.length === 1 ? 'ativo rendendo' : 'ativos rendendo'} abaixo do CDI`,
                    description: `${nomes}${abaixoDoCDI.length > 3 ? ' e mais outros' : ''} performaram abaixo do CDI (${cdiLatest.Valor.toFixed(2)}%) no período.`
                });
            }
        }

        if (!mensagens.length) {
            mensagens.push({
                type: 'info',
                title: 'Carteira equilibrada',
                description: 'Não identificamos concentração excessiva ou ativos muito abaixo do CDI no momento.'
            });
        }

        return mensagens.slice(0, 3);
    }, [papeisMonitorados, maiorPosicao, totalInvestido, indicadores]);

    const selectedAsset = useMemo(() => {
        return papeisMonitorados.find(item => item.codigo === selectedCodigo);
    }, [papeisMonitorados, selectedCodigo]);

    const priceHistory = useMemo(() => {
        return evolucaoInvestimentos
            .filter(item => item.Codigo === selectedCodigo)
            .sort((a, b) => a.AnoMes - b.AnoMes)
            .map(item => ({
                date: item.AnoMes.toString(),
                price: item.ValorCotacao,
            }));
    }, [evolucaoInvestimentos, selectedCodigo]);

    const suggestion = useMemo<ISuggestion>(() => {
        if (!selectedAsset) {
            return { type: 'hold', label: 'Sem ativo selecionado', description: 'Selecione um ativo da sua carteira para ver uma sugestão.' };
        }
        if (priceHistory.length < 2) {
            return { type: 'hold', label: 'Dados insuficientes', description: 'Ainda não há histórico suficiente deste ativo para gerar uma sugestão confiável.' };
        }

        const tendencia = priceHistory[priceHistory.length - 1].price - priceHistory[0].price;
        const variacaoAtual = selectedAsset.variacao * 100;
        const dividendYield = selectedAsset.valorAtual > 0 ? (selectedAsset.ultimoDividendo / selectedAsset.valorAtual) * 100 : 0;
        const cdiLatest = getLatestIndicador('cdi');
        const benchmark = cdiLatest ? cdiLatest.Valor : 0;

        if (tendencia > 0 && variacaoAtual > benchmark) {
            return {
                type: 'buy',
                label: 'Considere comprar',
                description: `Tendência de alta e rendimento de ${variacaoAtual.toFixed(2)}% no período, acima do CDI (${benchmark.toFixed(2)}%).`
            };
        }

        if (tendencia < 0 && variacaoAtual < benchmark) {
            if (dividendYield > 4) {
                return {
                    type: 'hold',
                    label: 'Manter para dividendos',
                    description: `Cotação em queda, mas o dividend yield de ${dividendYield.toFixed(2)}% ajuda a compensar. Vale acompanhar antes de decidir.`
                };
            }
            return {
                type: 'sell',
                label: 'Vale reavaliar',
                description: `Tendência de queda e desempenho abaixo do CDI (${benchmark.toFixed(2)}%) no período.`
            };
        }

        return {
            type: 'hold',
            label: 'Manter posição',
            description: 'Sem sinal claro de tendência. Continue acompanhando este ativo.'
        };
    }, [selectedAsset, priceHistory, indicadores]);

    return (
        <Container>
            <header className="investment-hero">
                <div>
                    <span className="eyebrow">CARTEIRA</span>
                    <p>Acompanhe o desempenho dos seus investimentos, sugestões e o mercado em geral.</p>
                </div>
                <div className="hero-controls">
                    <div className="period-picker">
                        <span>Período</span>
                        <SelectInput
                            options={periodos}
                            onChange={(e) => handlePeriodoSelected(parseInt(e.target.value))}
                            defaultValue={periodoSelected}
                        />
                    </div>
                    <button
                        className="add-asset-button"
                        onClick={async () => {
                            await CustomDialog(
                                <InvestmentAddModal
                                    atualizaPapeisMonitorados={atualizaPapeisMonitorados}
                                />,
                                {
                                    title: "descricao",
                                    showCloseIcon: true,
                                    isFocusLock: true,
                                });
                        }}
                    >
                        <FaPlus /> Adicionar ativo
                    </button>
                </div>
            </header>

            <Content>
                <div className="summary-cards">
                    <WalletBox
                        title="total investido"
                        color="#FFD166"
                        amount={totalInvestido}
                        footerlabel={`${papeisMonitorados.length} ${papeisMonitorados.length === 1 ? 'ativo monitorado' : 'ativos monitorados'}`}
                        icon="dolar"
                    />
                    <WalletBox
                        title="variação do período"
                        color={variacaoMediaPonderada >= 0 ? "#06D6A0" : "#EF476F"}
                        amount={Number((totalInvestido * (variacaoMediaPonderada / 100)).toFixed(2))}
                        footerlabel={`${variacaoMediaPonderada >= 0 ? '+' : ''}${variacaoMediaPonderada.toFixed(2)}% ponderado pela carteira`}
                        icon={variacaoMediaPonderada >= 0 ? "arrowUp" : "arrowDown"}
                    />
                    <WalletBox
                        title="dividendos recebidos"
                        color="#06D6A0"
                        amount={dividendosRecebidos}
                        footerlabel="Último pagamento por ativo"
                        icon="dolar"
                    />
                    <WalletBox
                        title="maior posição"
                        color="#8c98ff"
                        amount={maiorPosicao ? maiorPosicao.saldoAtual : 0}
                        footerlabel={maiorPosicao ? `${maiorPosicao.codigo} • ${totalInvestido ? ((maiorPosicao.saldoAtual / totalInvestido) * 100).toFixed(2) : '0,00'}% da carteira` : 'Sem ativos'}
                        icon="arrowUp"
                    />
                </div>

                <section className="alerts section-card" aria-label="Alertas da carteira">
                    <div className="section-heading">
                        <h2>Sugestão de investimento</h2>
                        <span>{alertasCarteira.length} {alertasCarteira.length === 1 ? 'alerta' : 'alertas'}</span>
                    </div>
                    <div className="alerts-list">
                        {alertasCarteira.map(alerta => (
                            <article className={`alert ${alerta.type}`} key={alerta.title}>
                                <span className="alert-icon">{alerta.type === 'warning' ? '!' : alerta.type === 'attention' ? '↑' : '✓'}</span>
                                <div><h3>{alerta.title}</h3><p>{alerta.description}</p></div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="allocation-evolution-row">
                    <div className="section-card">
                        <PieChartBox titulo="Alocação da carteira" data={alocacaoCarteira} />
                    </div>
                    <div className="section-card">
                        <InvestmentEvolution evolucaoInvestimentos={evolucaoInvestimentos} />
                    </div>
                </section>

                <section className="section-card">
                    <div className="section-heading">
                        <h2>Meus ativos</h2>
                        <span>Clique num card para abrir o gráfico externo</span>
                    </div>
                    <div className="holdings-grid">
                        {papeisMonitorados.length ? papeisMonitorados.map(item => (
                            <InvestimentBox
                                key={item.codigo}
                                papel={item.codigo}
                                tipo={item.tipo}
                                papelGrafico={item.codigoGrafico}
                                cotacaoAtual={item.valorAtual}
                                variacao={item.variacao}
                                saldo={item.saldoAtual}
                                dataAtualizacao={item.dataAtualizada}
                                ultimoDividendo={item.ultimoDividendo}
                                dataUltimoDiv={item.dataUltimoDiv}
                                tipoPapel={item.tipoPapel}
                                atualizaPapeisMonitorados={atualizaPapeisMonitorados}
                            />
                        )) : <div className="holdings-empty">Nenhum ativo monitorado ainda. Clique em "Adicionar ativo" para começar.</div>}
                    </div>
                </section>

                <section className="section-card">
                    <div className="section-heading">
                        <h2>Análise do ativo</h2>
                    </div>
                    <div className="ticker-row">
                        {papeisMonitorados.map(item => (
                            <span
                                key={item.codigo}
                                className={`ticker-chip ${item.codigo === selectedCodigo ? 'active' : ''}`}
                                onClick={() => setSelectedCodigo(item.codigo)}
                            >
                                {item.codigo}
                            </span>
                        ))}
                    </div>

                    {selectedAsset ? (
                        <div className="asset-detail-grid">
                            <div>
                                <div className="asset-price-header">
                                    <h3>{selectedAsset.codigo}</h3>
                                    <span className="price" style={{ color: selectedAsset.variacao >= 0 ? '#06D6A0' : '#EF476F' }}>
                                        R$ {selectedAsset.valorAtual.toFixed(2)} ({selectedAsset.variacao >= 0 ? '+' : ''}{(selectedAsset.variacao * 100).toFixed(2)}%)
                                    </span>
                                </div>
                                {priceHistory.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <LineChart data={priceHistory}>
                                            <XAxis dataKey="date" />
                                            <YAxis domain={["auto", "auto"]} tickFormatter={(valor) => `R$ ${Number(valor).toFixed(2)}`} width={80} />
                                            <Tooltip formatter={(valor: number) => [`R$ ${valor.toFixed(2)}`, 'Cotação']} />
                                            <Line type="monotone" dataKey="price" stroke="#8c98ff" strokeWidth={2} dot={{ r: 2 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="chart-placeholder">Sem histórico de preço para este ativo</div>
                                )}
                            </div>
                            <div>
                                <div className="suggestion-card">
                                    <span className={`badge ${suggestion.type}`}>{suggestion.label}</span>
                                    <p>{suggestion.description}</p>
                                </div>
                                <NewsFeed ticker={selectedAsset.codigo} />
                            </div>
                        </div>
                    ) : (
                        <div className="chart-placeholder-text">Nenhum ativo selecionado.</div>
                    )}
                </section>

                <section className="section-card">
                    <div className="section-heading">
                        <h2>Mercado hoje</h2>
                        <span>Indicadores econômicos e desempenho da carteira em ações</span>
                    </div>
                    <div className="market-grid">
                        {['selic', 'ipca', 'cdi', 'cdb'].map(nome => {
                            const latest = getLatestIndicador(nome);
                            return (
                                <div className="market-card" key={nome}>
                                    <span className="label">{nome}</span>
                                    <span className="value">{latest ? `${latest.Valor.toFixed(2)}%` : '—'}</span>
                                </div>
                            );
                        })}
                        <div className="market-card">
                            <span className="label">Sentimento da carteira</span>
                            <span className="value" style={{ color: sentimentoCarteira === null ? undefined : (sentimentoCarteira >= 0 ? '#06D6A0' : '#EF476F') }}>
                                {sentimentoCarteira === null ? '—' : `${sentimentoCarteira >= 0 ? '+' : ''}${sentimentoCarteira.toFixed(2)}%`}
                            </span>
                        </div>
                    </div>
                </section>

                <section className="section-card">
                    <div className="section-heading">
                        <h2>Notícias do mercado</h2>
                    </div>
                    <NewsFeed query="mercado financeiro OR bolsa de valores OR Ibovespa OR B3" />
                </section>
            </Content>
        </Container>
    );
}

export default Investment;
