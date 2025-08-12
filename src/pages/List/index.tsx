import React, { useMemo, useState, useEffect } from 'react';
import ContentHeader from '../../components/ContentHeader';
import SelectInput from '../../components/SelectInput';
import HistoryFinanceCard from '../../components/HistoryFinanceCard';
import formatCurrency from '../../utils/formatCurrency';
import listOfMonths from '../../utils/months';
import listOfYear from '../../utils/year';
import axios from 'axios';
import { FaSyncAlt, FaSearchengin } from 'react-icons/fa';
import { URL_API } from '../../repositories/baseAPI';
import {Button} from '@mui/material';
import {TextField} from '@mui/material';
import NumberFormat from 'react-number-format';
import {Dialog} from '@mui/material';
import {DialogActions} from '@mui/material';
import {DialogContent} from '@mui/material';
import {DialogTitle} from '@mui/material' ;
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { 
    Container, 
    Content, 
    Filters, 
    Refresh
} from './styles';

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
    Cor: string
    NfImportada: string
    obraGrupoCode: string
    DataTransacao: string;
    dataInserido: string;
    Parcelas: string
}

interface IRouteParams {
    match: {
        params: {
            type: string;
        }
    }
}

interface ITransacoesIncluidas {
    idTransacoes: number
    descricao: string
    IdContaContabil: string
}

const List: React.FC<IRouteParams> = ({ match }) => {
    const [dataPost, setDataPost] = useState<IDataPost[]>([]);
    const [openModalToken, setOpenModalToken] = React.useState(false);
    const [monthSelected, setMonthSelected] = useState<number>(new Date().getMonth() + 1);
    const [yearSelected, setYearSelected] = useState<number>(new Date().getFullYear());

    const [tokenBradesco, setTokenBradesco] = useState<string>("");

    const [classCSSRefresh, setClassCSSRefresh] = useState<string>();
    const [classCSSSearch, setClassCSSSearch] = useState<string>('tag-search-close');

    const [filtroTexto, setFiltroTexto] = useState<string>("");
    const [subGrupoContaFilterSelected, setSubGrupoContaFilterSelected] = useState<string[]>([]);
    const movimentType = match.params.type;
    
    const idUsuario = localStorage.getItem('@minha-carteira:usuarioId') as string;

    const notify = (Mensagem: string) => toast(Mensagem);
    const [transacoesIncluidas, setTransacoesIncluidas] = useState<ITransacoesIncluidas[]>([]);
    const token = localStorage.getItem('@minha-carteira:token') as string;
    
    const [apenasGastosDoMes, setApenasGastosDoMes] = useState<boolean>(false);
    
    const pageData = useMemo(() => {
        return movimentType === 'entry-balance' ?
            {
                title: 'Entradas',
                lineColor: '#4E41F0',
                tipoDeDado: 'Receita',
            }
            :       
            {
                title: 'Saídas',
                lineColor: '#E44C4E',
                tipoDeDado: 'Custo',
            }       
    },[movimentType]);
    
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

    const subGrupoContaContabilDistinct = useMemo(() => {
        return dataPost.map(item => item.subGrupoContaContabil)
            .filter((value, index, self) => self.indexOf(value) === index)
    }, [dataPost]);
    
    const filtroSubGrupoConta = (filtro: string) => {
        const alreadySelected = subGrupoContaFilterSelected.findIndex(item => item === filtro);

        if(alreadySelected >= 0){
            const filtered = subGrupoContaFilterSelected.filter(item => item !== filtro);
            setSubGrupoContaFilterSelected(filtered);
        }else{            
            setSubGrupoContaFilterSelected((prev) => [...prev, filtro]); 
        }
        console.log (subGrupoContaFilterSelected)
    }

    const handleMonthSelected = (month: string) => {
        try {
            const parseMonth = Number(month);
            setMonthSelected(parseMonth);
        }
        catch{
            throw new Error('invalid month value. Is accept 0 - 24.')
        }
    }

    const handleYearSelected = (year: string) => {
        try {
            const parseYear = 2018+Number(year);
            setYearSelected(parseYear);
        }
        catch{
            throw new Error('invalid year value. Is accept integer numbers.')
        }
    }

    const atualizaTransacoesLista = () => {
        axios.post (URL_API+"/gastos", {
            anomes: yearSelected.toString()+monthSelected.toString().padStart(2, '0'),
            usuario: idUsuario,
            tipo: pageData.tipoDeDado,
            token: token
        })
        .then((response) => {
            const { data } = response
            setDataPost(JSON.parse(data))  
        })
        .catch((error) => {
          console.log(error)
        })
    }

    const solicitarTokenBradesco = useMemo(async () => {
        return await axios.post (URL_API+"/bancosUsuario", {
            idUsuario: idUsuario,
        })
        .then((response) => {   
            const { data } = response
            if (data.includes("4")){
                return true
            } else {
                return false
            }
        })
        .catch((error) => {
          console.log(error)
        })
    },[idUsuario])

    const handleCloseModalToken = () => {
        if (tokenBradesco === ""){
            alert("As transações da Bradesco não serão atualizadas!")
            postAtualizaTransacoesBancos()
            setOpenModalToken(false);
        } else {
            postAtualizaTransacoesBancos()
            setOpenModalToken(false);
        }
    };

    const postAtualizaTransacoesBancos = async (): Promise<void> => {
        await axios.post (URL_API+"/atualizaTransacoesBancos", {
            idUsuario: idUsuario,
            tokenBradesco: tokenBradesco
        })
        .then((response) => {
            const { data } = response
            setTransacoesIncluidas (JSON.parse(data))
            setClassCSSRefresh('')
            let transacoes = 0  
            transacoes = JSON.parse(data).length;
            console.log (transacoes)

            let texto = ""
            if (transacoes == 1){
                texto = "Uma transação incluída com sucesso!"
            }
            else if (transacoes > 1){
                texto = transacoes + " transações incluídas com sucesso!"
            } else {
                texto = "Atualização concluída com sucesso, sem novas transações!"
            }
            console.log (texto)
            notify (texto)
        })
        .catch((error) => {
            notify ("Erro ao atualizar transações!!")
            console.log(error)
        })
        atualizaTransacoesLista()
    }

    async function atualizaTransacoesBancos () {
        setClassCSSRefresh('tag-refresh-sim')
        if (await solicitarTokenBradesco === false){
            postAtualizaTransacoesBancos()
            atualizaTransacoesLista()
        } else {
            setOpenModalToken(true)
        }
    }

    function getColorSubGrupoContaContabil (subGrupoContaContabil: string) {
        let color = dataPost.filter(x => x.subGrupoContaContabil === subGrupoContaContabil)[0].Cor
        return "10px solid " + color;
    }

    function handleSearch (){
        if (classCSSSearch === "tag-search-open") {
            setClassCSSSearch('tag-search-close')
            setFiltroTexto("")
        } else {
            setClassCSSSearch('tag-search-open')
        }
    }

    const dadoFiltrado = useMemo(() => {
        let dadoFiltrado = []
        
        dadoFiltrado =  dataPost.filter(item => {
            return (item.Descricao.toUpperCase().includes(filtroTexto!.toUpperCase()) 
                    || item.contaContabil.toUpperCase().includes(filtroTexto!.toUpperCase())
                    || item.subGrupoContaContabil.toUpperCase().includes(filtroTexto!.toUpperCase())
                    || item.grupoContaContabil.toUpperCase().includes(filtroTexto!.toUpperCase()) 
                    || item.Observacao.toUpperCase().includes(filtroTexto!.toUpperCase())
                    || item.Valor.toString().includes(filtroTexto!.toUpperCase())
                    
                )
        })

        if (subGrupoContaFilterSelected.length > 0){
            dadoFiltrado = dadoFiltrado.filter(item => {
                return subGrupoContaFilterSelected.includes(item.subGrupoContaContabil);
            });
        }

        if (apenasGastosDoMes) {
            let AnoMes = yearSelected.toString()+"-"+monthSelected.toString().padStart(2, '0')
     
            dadoFiltrado = dadoFiltrado.filter(item => {
                const dataTransacao = new Date(item.DataTransacao); // Converte para objeto Date
                const anoMesTransacao = dataTransacao.getFullYear() + "-" + (dataTransacao.getMonth() + 1).toString().padStart(2, '0');
                return anoMesTransacao === AnoMes;
            });
            
            dadoFiltrado = dadoFiltrado.map(item => {
                const valorNumerico = Number(item.Valor); // Converte Valor para número
                const parcelas = Number(item.Parcelas) || 1;
                return {
                    ...item,
                    Valor: (valorNumerico * parcelas).toString()  // Multiplica pelo número de parcelas (assume 1 se Parcelas não existir)
                };
            });   

        }

        return dadoFiltrado
    },[dataPost, filtroTexto, subGrupoContaFilterSelected]);

    const valorTotalDadoFiltrado = useMemo(() => {
        let total: number = 0;
        dadoFiltrado.forEach(item => {
            try{
                total += Number(item.Valor)
            }catch{
                throw new Error('Invalid amount! Amount must be number.')
            }
        });

        return Math.round(total);

        // return 0;
    }, [dadoFiltrado])

    const consultarSemFiltroDeData = () => {
        axios.post (URL_API+"/gastosSemFiltro", {
            usuario: idUsuario,
            tipo: pageData.tipoDeDado,
            filtro: filtroTexto
        })
        .then((response) => {
            const { data } = response
            setDataPost(JSON.parse(data))  
        })
        .catch((error) => {
          console.log(error)
        })
    };


    useEffect(() => {
        atualizaTransacoesLista()
    },[movimentType, monthSelected, yearSelected, idUsuario, pageData, idUsuario, apenasGastosDoMes]); 

    return (
        <Container>
        <ToastContainer />
                <Dialog 
                    open={ openModalToken } 
                    onClose={ handleCloseModalToken } 
                    aria-labelledby="form-dialog-title" >
                        <DialogTitle>Token Bradesco</DialogTitle>
                        <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="name"
                            label="Token Bradesco"
                            type="number"
                            fullWidth
                            onChange={(e) => setTokenBradesco(e.target.value)}
                    />
                    </DialogContent>
                    <DialogActions>
                    <Button onClick={ handleCloseModalToken } color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={ handleCloseModalToken } color="primary">
                        Atualizar
                    </Button>
                    </DialogActions>
                </Dialog>
            <ContentHeader title={pageData.title} lineColor={pageData.lineColor}>
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
            <FaSearchengin
                style={{
                    fontSize: "35px"
                }}   
                onClick={() => {
                    handleSearch ()
                        }}
                />
            <input 
                className={`
                    ${ classCSSSearch }`}
                onChange={(e) => setFiltroTexto(e.target.value)}
                >
            </input>

            <Refresh>
                <FaSyncAlt
                    className={`
                    ${ classCSSRefresh }`}
                    onClick={() => {
                                atualizaTransacoesBancos()
                            }}

                    />
            </Refresh>
            <Filters>
                {
                    subGrupoContaContabilDistinct.map(item => (
                        <button 
                            key = { item }
                            type="button"
                            className={`
                            tag-filter 
                            tag-filter-eventual
                            ${subGrupoContaFilterSelected.includes( item ) && 'tag-actived'}`}
                            onClick={() => filtroSubGrupoConta( item )}
                            style={{
                                    borderBottom: getColorSubGrupoContaContabil ( item )
                                }}
                        >
                        { item }
                        </button>
                    ))
                }   
                
            </Filters>
            <br/>
            <Content>
                {
                    dadoFiltrado.map(item => (
                        <HistoryFinanceCard 
                            key = { item.idTransacoes }
                            idTransacao = { item.idTransacoes }
                            data={ item.Data }
                            descricao ={ item.Descricao }
                            valor={ formatCurrency(Number(item.Valor), 0) }
                            contaContabilCode = { item.contaContabilCode }
                            grupoContaContabil = { item.grupoContaContabil }
                            subGrupoContaContabil = { item.subGrupoContaContabil }
                            contaContabil = { item.contaContabil }
                            observacao = { item.Observacao }
                            tagColor = { item.Cor }
                            NfImportada = { item.NfImportada }
                            tabelaOrigem = { item.tabelaOrigem }
                            atualizaTransacaoList = { atualizaTransacoesLista }
                            obraGrupoCode = { item.obraGrupoCode }
                            dataTransacao = { item.DataTransacao }
                            dataInserido = { item.dataInserido }
                        />
                    ))
                }     
            </Content>  
            <div>   
            {(() => {
                if (filtroTexto !== ""){
                    return (
                        <Button 
                            onClick={ consultarSemFiltroDeData } color="primary">
                            Ver mais
                        </Button>)
                }
                })()}
                
            </div>
            
            <div
                style={{
                    textAlign: "center"
                }}
            >
                <button
                style={{
                    padding: "8px 16px",
                    fontSize: "16px",
                    cursor: "pointer",
                    backgroundColor: "#007BFF",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px"
                }}
                onClick={() => setApenasGastosDoMes(!apenasGastosDoMes)}
                >
                {apenasGastosDoMes ? "Visão caixa" : "Visão gasto"}
                </button>
            </div>
            
            
            <div
                style={{
                    float: "right"
                }}
            >
                Valor total: {
                    
                        <NumberFormat
                        value={valorTotalDadoFiltrado}
                        displayType={'text'}
                        prefix={'R$ '}
                        fixedDecimalScale={true}
                        decimalScale={2}
                        thousandSeparator={"."}
                        decimalSeparator={","}
                    />
                    
                    }
            </div>
            
        </Container>
    );
}

export default List;
