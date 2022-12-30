import React, { useState, useMemo, useCallback, useEffect } from 'react';
import axios from 'axios';
import { URL_API } from '../../repositories/baseAPI';

import ContentHeader from '../../components/ContentHeader';
import SelectInput from '../../components/SelectInput';
import WalletBox from '../../components/WalletBox';
import MessageBox from '../../components/MessageBox';
import PieChartBox from '../../components/PieChartBox';
import AreaChartBox from '../../components/AreaChartBox';
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

interface IDataPost {
    idTransacoes: string
    idOrigem: string
    tabelaOrigem: string
    Data: string
    Descricao: string
    Valor: string
    contaContabilCode: string
    grupoContaContabil: string
    subGrupoContaContabil: string
    contaContabil: string
    Observacao: string
}

interface IDataPostAgrupado {
    subGrupoContaContabil: string
    Valor: number
    AnoMes: string
    Cor: string
}

const Dashboard: React.FC = () => {
    const [monthSelected, setMonthSelected] = useState<number>(new Date().getMonth() + 1);
    const [yearSelected, setYearSelected] = useState<number>(new Date().getFullYear());
    const [saldoPost, setSaldoPost] = useState<string>("0");
    const [dataSaldo, setDataSaldo] = useState<string>();
    const [custo, setCusto] = useState<IDataPost[]>([]);
    const [receita, setReceita] = useState<IDataPost[]>([]);

    const [custoAgrupado, setCustoAgrupado] = useState<IDataPostAgrupado[]>([]);
    const [custoHistoricoAgrupado, setCustoHistoricoAgrupado] = useState<IDataPostAgrupado[]>([]);

    const idUsuario = localStorage.getItem('@minha-carteira:usuarioId') as string;

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
                title: "Op's!",
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
        // axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
        await axios.post (URL_API+"/gastos", {
            headers: {"Access-Control-Allow-Origin": "*"},
            anomes: anoMes,
            usuario: idUsuario,
            tipo: tipo
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
        // axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
        await axios.post (URL_API+"/saldo", {
            headers: {"Access-Control-Allow-Origin": "*"},
            usuario: idUsuario,
        }, 
        )
        .then((response) => {
            const { data } = response
            let saldo = Math.round(JSON.parse(data)[0].Saldo) 
            setSaldoPost(saldo.toString())   
            setDataSaldo(JSON.parse(data)[0].DataAtualizado)     
        })
        .catch((error) => {
          console.log(error)
        })
        return saldoPost;
    }

    const getGastosAgrupados = async (anoMes: string, idUsuario: string, meses: string) => {
        // axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
        await axios.post (URL_API+"/gastosAgrupados", {
            headers: {"Access-Control-Allow-Origin": "*"},
            anomes: anoMes,
            usuario: idUsuario,
            meses: meses
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

    useEffect(() => {        
        getSaldo (idUsuario)
        getfetchTransacoes(yearSelected.toString()+monthSelected.toString().padStart(2, '0'), idUsuario, "Receita") 
        getfetchTransacoes(yearSelected.toString()+monthSelected.toString().padStart(2, '0'), idUsuario, "Custo") 
        getGastosAgrupados(yearSelected.toString()+monthSelected.toString().padStart(2, '0'), idUsuario, "1") 
        getGastosAgrupados(yearSelected.toString()+monthSelected.toString().padStart(2, '0'), idUsuario, "12") 

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
                    color="#4E41F0"
                    amount={ Number(saldoPost) }
                    footerlabel={"Última atualização em " + formatDate(dataSaldo!, 1) }
                    icon="dolar"
                />

                <WalletBox 
                    title="entradas"
                    color="#F7931B"
                    amount={totalGains}
                    footerlabel={"Última atualização em " + formatDate(dataSaldo!, 1) }
                    icon="arrowUp"
                />
                
                <WalletBox 
                    title="saídas"
                    color="#E44C4E"
                    amount={ totalExpenses }
                    footerlabel={"Última atualização em " + formatDate(dataSaldo!, 1) }
                    icon="arrowDown"
                />
                
                <BudgetBar anoMes = { yearSelected.toString()+monthSelected.toString().padStart(2, '0') } />

                <section>
                    <PieChartBox data={ custoAgrupado } />

                    <CardBill
                        AnoMes = { yearSelected.toString()+monthSelected.toString().padStart(2, '0') }
                        />
                </section>

                    
                <AreaChartBox data={ custoHistoricoAgrupado } />

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

