import React, { useState, useMemo, useCallback, useEffect } from 'react';
import axios from 'axios';
import { URL_API } from '../../repositories/baseAPI';

import ContentHeader from '../../components/ContentHeader';
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


const Dashboard: React.FC = () => {
    const [monthSelected, setMonthSelected] = useState<number>(new Date().getMonth() + 1);
    const [yearSelected, setYearSelected] = useState<number>(new Date().getFullYear());
    const [saldoPost, setSaldoPost] = useState<string>("0");
    const [dataSaldo, setDataSaldo] = useState<string>();
    const [custo, setCusto] = useState<IDataPost[]>([]);
    const [receita, setReceita] = useState<IDataPost[]>([]);

    const [custoAgrupado, setCustoAgrupado] = useState<IDataPostAgrupado[]>([]);
    const [valoresFatura, setValoresFatura] = useState<IDataPostValorFatura[]>([]);

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

    useEffect(() => {        
        getSaldo (idUsuario)
        getfetchTransacoes(yearSelected.toString()+monthSelected.toString().padStart(2, '0'), idUsuario, "Receita") 
        getfetchTransacoes(yearSelected.toString()+monthSelected.toString().padStart(2, '0'), idUsuario, "Custo")        
        getGastosAgrupados(yearSelected.toString()+monthSelected.toString().padStart(2, '0'), idUsuario, "12") 
        getValoresFatura (yearSelected.toString()+monthSelected.toString().padStart(2, '0'), idUsuario)

        getEvolucaoInvestimento ()

    },[monthSelected, yearSelected]); 

    return (
        <Container>               
            <ContentHeader title="Dashboard" lineColor="#F7931B">
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
            </ContentHeader>
            <Content>
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
                
                <BudgetBar anoMes = { yearSelected.toString()+monthSelected.toString().padStart(2, '0') } />

                <section>
                    <PieChartBox titulo = {"Custo por categoria"} data={ custoAjustadoGraficoPizza } />
                    <CardBill data={ valoresFatura } anomes = { yearSelected.toString()+monthSelected.toString().padStart(2, '0') }  />
                </section>

                    
                <AreaChartBox data={ custoHistoricoAgrupado } />
                
                <InvestmentEvolution evolucaoInvestimentos = { evolucaoInvestimentos } />
                <section>
                        <PieChartBox titulo = {"Investimento"} data ={ investimentoAjustadoGraficoPizza } />
                </section>
                    

                <MessageBox
                    title={message.title}
                    description={message.description}
                    footerText={message.footerText}
                    icon={message.icon}
                />


            </Content>
        </Container>
    );
}

export default Dashboard;

