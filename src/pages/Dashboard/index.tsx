import React, { useState, useMemo, useCallback, useEffect } from 'react';
import axios from 'axios';
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

    const [custoHistoricoAgrupado, setCustoHistoricoAgrupado] = useState<IDataPostAgrupado[]>([]);

    const idUsuario = localStorage.getItem('@minha-carteira:usuarioId') as string;
    const token = localStorage.getItem('@minha-carteira:token') as string;
    const { signOut } = useAuth();
    const [evolucaoInvestimentos, setEvolucaoInvestimentos] = useState<IEvolucaoInvestimentoData[]>([]);
  
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
        const saldo = Math.round(parsed[0].Saldo);

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
            case 'INDICE': return "#8cfbff"                            
            default: return "";
        };
    }

    const investimentoAjustadoGraficoPizza = useMemo(() => {
        let investimentoTratado: [{
            grupo:      string
            subGrupo:   string
            Valor:      number
            Cor:        string
        }] = [{            
            grupo:      "",
            subGrupo:   "",
            Valor:      0,
            Cor:        ""
        }]
        investimentoTratado.splice (0)

        evolucaoInvestimentos.forEach(item => {
            if (item.Saldo > 0 &&
                item.AnoMes.toString() == yearSelected.toString()+monthSelected.toString().padStart(2, '0')){

                    investimentoTratado.push({
                    grupo: item.Tipo,
                    subGrupo: item.Codigo,
                    Valor: item.Saldo*item.ValorCotacao,
                    Cor: getCorInvestimento (item.Tipo),
                })
            }
        })
        return investimentoTratado;
        
    },[evolucaoInvestimentos]);

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

    const alerts = useMemo(() => {
        const messages: { type: 'warning' | 'attention' | 'info', title: string, description: string }[] = [];
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
    }, [budgetStatus, previousCosts, custo, valoresFatura]);

    useEffect(() => {        
        getSaldo (idUsuario)
        getfetchTransacoes(yearSelected.toString()+monthSelected.toString().padStart(2, '0'), idUsuario, "Receita") 
        getfetchTransacoes(yearSelected.toString()+monthSelected.toString().padStart(2, '0'), idUsuario, "Custo")        
        getGastosAgrupados(yearSelected.toString()+monthSelected.toString().padStart(2, '0'), idUsuario, "12") 
        getValoresFatura (yearSelected.toString()+monthSelected.toString().padStart(2, '0'), idUsuario)
        getBudgetStatus(yearSelected.toString()+monthSelected.toString().padStart(2, '0'), idUsuario)
        const previousDate = new Date(yearSelected, monthSelected - 2, 1);
        getPreviousCosts(`${previousDate.getFullYear()}${String(previousDate.getMonth() + 1).padStart(2, '0')}`, idUsuario)

        getEvolucaoInvestimento ()

    },[monthSelected, yearSelected]); 

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
                        <span>{alerts.length} {alerts.length === 1 ? 'alerta' : 'alertas'}</span>
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
                    <PieChartBox titulo = {"Investimento"} data ={ investimentoAjustadoGraficoPizza } />
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

