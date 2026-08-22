import React, { useState, useMemo, useCallback, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { URL_API } from '../../repositories/baseAPI';

import SelectInput from '../../components/SelectInput';
import WalletBox from '../../components/WalletBox';
import MessageBox from '../../components/MessageBox';
import AreaChartBox from '../../components/AreaChartBox';
import InvestmentEvolution from '../../components/InvestmentEvolution';

import listOfMonths from '../../utils/months';
import listOfYear from '../../utils/year';
import happyImg from '../../assets/happy.svg';
import sadImg from '../../assets/sad.svg';
import grinningImg from '../../assets/grinning.svg';
import opsImg from '../../assets/ops.svg';
import formatDate from '../../utils/formatDate';
import CardBill from '../../components/CardBill';

import { 
    Container,
    Content,
} from './styles';
import BudgetBar from '../../components/BudgetBar';
import PieChartBox from '../../components/PieChartBox';
import { useAuth } from '../../hooks/auth';


interface IDataPost {
    idTransacoes: string
    idOrigem: string
    tabelaOrigem: string
    Data: string
    Descricao: string
    Valor: number
    contaContabilCode: string
    grupoContaContabil: string
    subGrupoContaContabil: string
    contaContabil: string
    Observacao: string
    Cor: string
}

interface IDataPostAgrupado {
    subGrupoContaContabil: string
    Valor: number
    AnoMes: string
    Cor: string
    Recorrente: number
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

interface IInvestmentPosition {
    codigo: string
    saldoAtual: number
    tipoPapel: string
}

interface IDataPostValorFatura {
    idUsuario: string
    AnoMesFatura: number
    tabelaOrigem: string
    Valor: number
}

interface IDataBudgetVrsRealizado {
    subGrupoContaContabil: string
    ValorOrcado: number
    ValorRealizado: number
}

interface IContaRecorrenteStatus {
    idContaRecorrente: number
    descricao: string
    competencia: string
    vencimento: string
    valorPrevisto: number
    valorEncontrado: number | null
    status: 'pago' | 'a_vencer' | 'vence_hoje' | 'atrasado' | 'divergente' | 'pendente'
    diasParaVencimento: number
    idTransacao: number | null
}


const Dashboard: React.FC = () => {
    const [monthSelected, setMonthSelected] = useState<number>(new Date().getMonth() + 1);
    const [yearSelected, setYearSelected] = useState<number>(new Date().getFullYear());
    const [saldoPost, setSaldoPost] = useState<string>("0");
    const [dataSaldo, setDataSaldo] = useState<string>();
    const [custo, setCusto] = useState<IDataPost[]>([]);
    const [receita, setReceita] = useState<IDataPost[]>([]);

    const [custoAgrupado, setCustoAgrupado] = useState<IDataPostAgrupado[]>([]);
    const [valoresFatura, setValoresFatura] = useState<IDataPostValorFatura[]>([]);
    const [budgetStatus, setBudgetStatus] = useState<IDataBudgetVrsRealizado[]>([]);
    const [previousCosts, setPreviousCosts] = useState<IDataPost[]>([]);
    const [contasRecorrentes, setContasRecorrentes] = useState<IContaRecorrenteStatus[]>([]);

    const [custoHistoricoAgrupado, setCustoHistoricoAgrupado] = useState<IDataPostAgrupado[]>([]);

    const idUsuario = localStorage.getItem('@minha-carteira:usuarioId') as string;
    const token = localStorage.getItem('@minha-carteira:token') as string;
    const { signOut } = useAuth();
    const [evolucaoInvestimentos, setEvolucaoInvestimentos] = useState<IEvolucaoInvestimentoData[]>([]);
    const [portfolioPositions, setPortfolioPositions] = useState<IInvestmentPosition[]>([]);
  
    const years = useMemo(() => {
        return listOfYear.map((year, index) => {
            return {
                value: index + 1,
                label: year,
            }
        });
    },[]);

    const months = useMemo(() => {
        return listOfMonths.map((month, index) => {
            return {
                value: index + 1,
                label: month,
            }
        });
    },[]);

    const totalExpenses = useMemo(() => {
        let total: number = 0;

        custo.forEach(item => {
            if(item.grupoContaContabil === 'Custo'){
                try{
                    total += Number(item.Valor)
                }catch{
                    throw new Error('Invalid amount! Amount must be number.')
                }
            }
        });

        return Math.round(total)*-1;
    },[custo]);

    const totalGains = useMemo(() => {
        let total: number = 0;

        receita.forEach(item => {
            try{
                total += Number(item.Valor)
            }catch{
                throw new Error('Invalid amount! Amount must be number.')
            }
        });
        return Math.round(total);
    },[receita]);

    const totalBalance = useMemo(() => {
        return totalGains - totalExpenses;
    },[totalGains, totalExpenses]);

    const message = useMemo(() => {
        if(totalBalance < 0){
            return {
                title: "Que triste!!!",
                description: "Neste mês, você gastou mais do que deveria.",
                footerText: "Verifique seus gastos e tente cortar algumas coisas desnecessárias.",
                icon: sadImg
            }
        }      
        else if(totalGains === 0 && totalExpenses === 0){
            return {
                title: "Ops!",
                description: "Neste mês, não há registros de entradas ou saídas.",
                footerText: "Parece que você não fez nenhum registro no mês e ano selecionado.",
                icon: opsImg
            }
        }
        else if(totalBalance === 0){
            return {
                title: "Ufaa!",
                description: "Neste mês, você gastou exatamente o que ganhou.",
                footerText: "Tenha cuidado. No próximo tente poupar o seu dinheiro.",
                icon: grinningImg
            }
        }
        else{
            return {
                title: "Muito bem!",
                description: "Sua carteira está positiva!",
                footerText: "Continue assim. Considere investir o seu saldo.",
                icon: happyImg
            }
        }

    },[totalBalance, totalGains, totalExpenses]);

    const handleMonthSelected = useCallback((month: string) => {
        try {
            const parseMonth = Number(month);
            setMonthSelected(parseMonth);
        }
        catch{
            throw new Error('invalid month value. Is accept 0 - 24.')
        }
    },[]);

    const handleYearSelected = useCallback((year: string) => {
        try {
            const parseYear = 2018+Number(year);
            setYearSelected(parseYear);
        }
        catch{
            throw new Error('invalid year value. Is accept integer numbers.')
        }
    },[]);

    const getfetchTransacoes = async (anoMes: string, idUsuario: string, tipo: string) => {
        await axios.post (URL_API+"/gastos", {
            headers: {"Access-Control-Allow-Origin": "*"},
            anomes: anoMes,
            usuario: idUsuario,
            tipo: tipo,
            token: token
        })
        .then((response) => {
            const { data } = response
            if(tipo === "Custo"){
                setCusto(JSON.parse(data))
            }else{
                setReceita(JSON.parse(data))
            }
                       
        })
        .catch((error) => {
          console.log(error)
        })
    }
        
    const getSaldo = async (idUsuario: string) => {
    try {
        const response = await axios.post(
        `${URL_API}/saldo`,
        { usuario: idUsuario, token: token },
        { headers: { "Access-Control-Allow-Origin": "*" } }
        );

        const parsed = JSON.parse(response.data);
        const saldo = Number(parsed[0].Saldo);

        setSaldoPost(saldo.toString());
        setDataSaldo(parsed[0].DataAtualizado);

        return saldo.toString();
    } catch (error: any) {
        console.error("Erro ao buscar saldo:", error);

        // Só acessa .status se realmente existir
        const status = error?.response?.status ?? null;
        if (status === 401) {
        signOut();
        }

        return saldoPost; // fallback
    }
    };


    const getGastosAgrupados = async (anoMes: string, idUsuario: string, meses: string) => {
        await axios.post (URL_API+"/gastosAgrupados", {
            headers: {"Access-Control-Allow-Origin": "*"},
            anomes: anoMes,
            usuario: idUsuario,
            meses: meses,
            token: token
        }, 
         
        )
        .then((response) => {
            const { data } = response
            if(meses !== "1"){
                setCustoHistoricoAgrupado(JSON.parse(data))
            }else{
                setCustoAgrupado(JSON.parse(data))
            }                         
        })
        .catch((error) => {
          console.log(error)
        })
    }

    const custoAjustadoGraficoPizza = useMemo(() => {
        let custoTratado: [{
            grupo:      string
            subGrupo:   string
            Valor:      number
            AnoMes:     string
            Cor:        string
        }] = [{            
            grupo:      "",
            subGrupo:   "",
            Valor:      0,
            AnoMes:     "",
            Cor:        ""
        }]
        custoTratado.splice (0)

        custo.forEach(item => {
            if (item.grupoContaContabil === "Custo" &&
            item.subGrupoContaContabil != "Construção"){
                custoTratado.push({
                    grupo: item.subGrupoContaContabil,
                    subGrupo: item.contaContabil,
                    Valor: item.Valor*-1,
                    AnoMes: item.Data,
                    Cor: item.Cor,
                })
            }

        })

        return custoTratado;
        
    },[custo]);

    function getCorInvestimento (tipo: string){
        switch (tipo) {
            case 'FUNDOS IMOBILIÁRIOS': return "#02b022"
            case 'EMPRESA LISTADA NA BOLSA BRASILEIRA': return  "#8c98ff"
            case 'EMPRESA LISTADA NA BOLSA INTERNACIONAL': return "#ff8cbe"
            case 'CRIPTOMOEDA': return "#fff48c"
            case 'INDICE':
            case 'INDICADORES': return "#8cfbff"
            default: return "#4F8CFF";
        };
    }

    const investimentoAjustadoGraficoPizza = useMemo(() => {
        return portfolioPositions
            .filter(item => Number(item.saldoAtual) > 0)
            .map(item => ({
                grupo: item.tipoPapel,
                subGrupo: item.codigo,
                Valor: Number(item.saldoAtual),
                Cor: getCorInvestimento(item.tipoPapel),
            }));
    }, [portfolioPositions]);

    const getInvestmentPortfolio = async () => {
        try {
            const [pluggyResponse, cryptoResponse] = await Promise.all([
                axios.get(`${URL_API}/investments/pluggy/portfolio`, {
                    params: { idUsuario: Number(idUsuario), periodo: 6 },
                }),
                axios.get(`${URL_API}/investments/crypto/portfolio`, {
                    params: { idUsuario: Number(idUsuario) },
                }),
            ]);
            setPortfolioPositions([
                ...(pluggyResponse.data.posicoes || []),
                ...(cryptoResponse.data.posicoes || []),
            ]);
        } catch (error) {
            console.log('Não foi possível carregar a carteira atual.', error);
            setPortfolioPositions([]);
        }
    };

    const getEvolucaoInvestimento = () => {
        axios.post (URL_API+"/evolucaoInvestimento", {
            headers: {"Access-Control-Allow-Origin": "*"},
            idUsuario: idUsuario,
            token: token
        })
        .then((response) => {
            const { data } = response
            setEvolucaoInvestimentos(JSON.parse(data))  
        })
        .catch((error) => {
          console.log(error)
        })
        
    }
	
    const getValoresFatura = async (anoMes: string, idUsuario: string) => {
        await axios.post (URL_API+"/getValorFatura", {
            headers: {"Access-Control-Allow-Origin": "*"},
            anomes: anoMes,
            usuario: idUsuario,
            token: token
        }, 
        )
        .then((response) => {
            const { data } = response
            setValoresFatura(JSON.parse(data))
        })
        .catch((error) => {
          console.log(error)
        })
    }

    const getBudgetStatus = async (anoMes: string, idUsuario: string) => {
        try {
            const response = await axios.post(URL_API + "/budgetvrsRealizado", {
                headers: {"Access-Control-Allow-Origin": "*"},
                anomes: anoMes,
                usuario: idUsuario
            });
            setBudgetStatus(JSON.parse(response.data));
        } catch (error) {
            console.log(error);
        }
    }

    const getPreviousCosts = async (anoMes: string, idUsuario: string) => {
        try {
            const response = await axios.post(URL_API + "/gastos", {
                headers: {"Access-Control-Allow-Origin": "*"},
                anomes: anoMes,
                usuario: idUsuario,
                tipo: "Custo",
                token: token
            });
            setPreviousCosts(JSON.parse(response.data));
        } catch (error) {
            console.log(error);
        }
    }

    const getContasRecorrentes = async () => {
        try {
            const response = await axios.get<{ items: IContaRecorrenteStatus[] }>(
                `${URL_API}/contas-recorrentes/status`,
                { params: { meses: 2 } },
            );
            setContasRecorrentes(response.data.items);
        } catch (error) {
            console.log('Não foi possível carregar contas recorrentes.', error);
        }
    }

    const alerts = useMemo(() => {
        const messages: { type: 'warning' | 'attention' | 'info', title: string, description: string }[] = [];
        const overdueRecurring = contasRecorrentes.filter(item => item.status === 'atrasado');
        const dueTodayRecurring = contasRecorrentes.filter(item => item.status === 'vence_hoje');
        const divergentRecurring = contasRecorrentes.filter(item => item.status === 'divergente');

        if (overdueRecurring.length) {
            messages.push({ type: 'attention', title: `${overdueRecurring.length} ${overdueRecurring.length === 1 ? 'conta recorrente em atraso' : 'contas recorrentes em atraso'}`, description: overdueRecurring.slice(0, 2).map(item => item.descricao).join(' e ') + '. Não encontramos um pagamento compatível.' });
        }
        if (dueTodayRecurring.length) {
            messages.push({ type: 'warning', title: `${dueTodayRecurring.length} conta${dueTodayRecurring.length === 1 ? '' : 's'} vence${dueTodayRecurring.length === 1 ? '' : 'm'} hoje`, description: dueTodayRecurring.slice(0, 2).map(item => item.descricao).join(' e ') + '.' });
        }
        if (divergentRecurring.length) {
            messages.push({ type: 'warning', title: 'Pagamento recorrente para conferir', description: `${divergentRecurring[0].descricao} tem uma transação próxima ao vencimento, mas o valor não bate com o esperado.` });
        }
        const budgetExceeded = budgetStatus.filter(item => Math.abs(Number(item.ValorRealizado)) > Math.abs(Number(item.ValorOrcado)));

        if (budgetExceeded.length) {
            const accountNames = budgetExceeded.slice(0, 2).map(item => item.subGrupoContaContabil).join(' e ');
            const complement = budgetExceeded.length > 2 ? ` e mais ${budgetExceeded.length - 2}` : '';
            messages.push({ type: 'warning', title: `Orçamento ultrapassado em ${budgetExceeded.length} ${budgetExceeded.length === 1 ? 'categoria' : 'categorias'}`, description: `${accountNames}${complement} já passaram do valor planejado para este mês.` });
        }

        const electricityPattern = /luz|energia|eletric/i;
        const hadElectricityLastMonth = previousCosts.some(item => electricityPattern.test(`${item.Descricao} ${item.contaContabil} ${item.subGrupoContaContabil}`));
        const hasElectricityThisMonth = custo.some(item => electricityPattern.test(`${item.Descricao} ${item.contaContabil} ${item.subGrupoContaContabil}`));
        if (hadElectricityLastMonth && !hasElectricityThisMonth) {
            messages.push({ type: 'attention', title: 'Pagamento de energia não identificado', description: 'Encontramos uma conta de luz no mês anterior, mas nenhum lançamento correspondente neste mês.' });
        }

        const invoiceByMonth = valoresFatura.reduce((total, item) => ({ ...total, [item.AnoMesFatura]: (total[item.AnoMesFatura] || 0) + Number(item.Valor) }), {} as Record<number, number>);
        const invoiceMonths = Object.keys(invoiceByMonth).map(Number).sort((a, b) => a - b);
        if (invoiceMonths.length > 1) {
            const currentInvoice = invoiceByMonth[invoiceMonths[0]];
            const nextInvoice = invoiceByMonth[invoiceMonths[1]];
            if (currentInvoice > 0 && nextInvoice > currentInvoice * 1.2) {
                const increase = Math.round(((nextInvoice / currentInvoice) - 1) * 100);
                messages.push({ type: 'attention', title: `Próxima fatura ${increase}% maior`, description: 'A fatura seguinte está bem acima da atual. Vale conferir as compras parceladas e recorrentes.' });
            }
        }

        if (!messages.length) messages.push({ type: 'info', title: 'Tudo sob controle por enquanto', description: 'Não identificamos alertas importantes neste período. Continue acompanhando seu orçamento.' });
        return messages.slice(0, 3);
    }, [budgetStatus, previousCosts, custo, valoresFatura, contasRecorrentes]);

    useEffect(() => {        
        getSaldo (idUsuario)
        getfetchTransacoes(yearSelected.toString()+monthSelected.toString().padStart(2, '0'), idUsuario, "Receita") 
        getfetchTransacoes(yearSelected.toString()+monthSelected.toString().padStart(2, '0'), idUsuario, "Custo")        
        getGastosAgrupados(yearSelected.toString()+monthSelected.toString().padStart(2, '0'), idUsuario, "12") 
        getValoresFatura (yearSelected.toString()+monthSelected.toString().padStart(2, '0'), idUsuario)
        getBudgetStatus(yearSelected.toString()+monthSelected.toString().padStart(2, '0'), idUsuario)
        const previousDate = new Date(yearSelected, monthSelected - 2, 1);
        getPreviousCosts(`${previousDate.getFullYear()}${String(previousDate.getMonth() + 1).padStart(2, '0')}`, idUsuario)
        getContasRecorrentes()

        getEvolucaoInvestimento ()

    },[monthSelected, yearSelected]); 

    useEffect(() => {
        getInvestmentPortfolio();
    }, [idUsuario]);

    return (
        <Container>
            <header className="dashboard-hero">
                <div>
                    <span className="eyebrow">VISÃO GERAL</span>
                    <p>Acompanhe suas decisões e mantenha o controle da sua vida financeira.</p>
                </div>
                <div className="period-picker">
                    <span>Período</span>
                    <div>
                <SelectInput 
                    options={months}
                    onChange={(e) => handleMonthSelected(e.target.value)} 
                    defaultValue={monthSelected}
                />
                <SelectInput 
                    options={years} 
                    onChange={(e) => handleYearSelected(e.target.value)} 
                    defaultValue={yearSelected-2018}
                />
                    </div>
                </div>
            </header>
            <Content>
                <div className="summary-cards">
                    <WalletBox
                        title="saldo"
                        color="#06D6A0"
                        amount={ Number(saldoPost) }
                        footerlabel={"Última atualização em " + formatDate(dataSaldo!, 1) }
                        icon="dolar"
                    />

                    <WalletBox
                        title="entradas"
                        color="#FFD166"
                        amount={totalGains}
                        footerlabel={"Última atualização em " + formatDate(dataSaldo!, 1) }
                        icon="arrowUp"
                    />

                    <WalletBox
                        title="saídas"
                        color="#EF476F"
                        amount={ totalExpenses }
                        footerlabel={"Última atualização em " + formatDate(dataSaldo!, 1) }
                        icon="arrowDown"
                    />
                </div>

                <section className="alerts" aria-label="Alertas financeiros">
                    <div className="alerts-heading">
                        <div>
                            <span className="eyebrow">PRECISA DA SUA ATENÇÃO</span>
                            <h2>Alertas financeiros</h2>
                        </div>
                        <div className="alerts-meta"><span>{alerts.length} {alerts.length === 1 ? 'alerta' : 'alertas'}</span><Link to="/settings/contas-recorrentes">Gerenciar recorrências</Link></div>
                    </div>
                    <div className="alerts-list">
                        {alerts.map(alert => (
                            <article className={`alert ${alert.type}`} key={alert.title}>
                                <span className="alert-icon">{alert.type === 'warning' ? '!' : alert.type === 'attention' ? '↑' : '✓'}</span>
                                <div><h3>{alert.title}</h3><p>{alert.description}</p></div>
                            </article>
                        ))}
                    </div>
                </section>

                {false && <section className="recurring-bills" aria-label="Contas recorrentes">
                    <div className="recurring-bills-heading">
                        <div>
                            <span className="eyebrow">CONTROLE DE PAGAMENTOS</span>
                            <h2>Contas recorrentes</h2>
                        </div>
                        <span>{contasRecorrentes.filter(item => item.status !== 'pago').length} pendentes de conciliação</span>
                    </div>
                    <div className="recurring-bills-list">
                        {contasRecorrentes.length === 0 && <p>Nenhuma conta recorrente prevista para este período.</p>}
                        {contasRecorrentes.map(item => (
                            <article className={`recurring-bill ${item.status}`} key={`${item.idContaRecorrente}-${item.competencia}`}>
                                <div className="recurring-bill-main">
                                    <strong>{item.descricao}</strong>
                                    <span>Vence em {new Date(`${item.vencimento}T12:00:00`).toLocaleDateString('pt-BR')}</span>
                                </div>
                                <b>{Math.abs(item.valorPrevisto).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</b>
                                <span className="recurring-status">{({ pago: 'Pago', a_vencer: `Vence em ${item.diasParaVencimento} dias`, vence_hoje: 'Vence hoje', atrasado: `${Math.abs(item.diasParaVencimento)} dias em atraso`, divergente: 'Conferir valor', pendente: 'Programada' } as Record<string, string>)[item.status]}</span>
                                {item.idTransacao && <small>Transação #{item.idTransacao}</small>}
                            </article>
                        ))}
                    </div>
                </section>}
                
                <div className="budget-section">
                    <BudgetBar anoMes = { yearSelected.toString()+monthSelected.toString().padStart(2, '0') } />
                </div>

                <section className="insights-row">
                    <PieChartBox titulo = {"Custo por categoria"} data={ custoAjustadoGraficoPizza } />
                    <CardBill data={ valoresFatura } anomes = { yearSelected.toString()+monthSelected.toString().padStart(2, '0') }  />
                </section>

                <div className="trend-section">
                    <AreaChartBox data={ custoHistoricoAgrupado } />
                </div>

                <div className="investment-section">
                    <InvestmentEvolution evolucaoInvestimentos = { evolucaoInvestimentos } />
                </div>
                <section className="investment-pie-section">
                    <PieChartBox titulo = {"Alocação da carteira"} data ={ investimentoAjustadoGraficoPizza } />
                </section>

                <div className="message-section">
                    <MessageBox
                        title={message.title}
                        description={message.description}
                        footerText={message.footerText}
                        icon={message.icon}
                    />
                </div>


            </Content>
        </Container>
    );
}

export default Dashboard;

