import React, { useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { URL_API } from '../../repositories/baseAPI';
import HistoryFinanceCard from '../../components/HistoryFinanceCard';
import formatCurrency from '../../utils/formatCurrency';
import NumberFormat from 'react-number-format';
import { FaSearchengin } from 'react-icons/fa';

import { 
    Container,
    Content,
    Filters
} from './styles';

interface IHistoryFinanceCardProps {
    idTransacoes: string;
    idOrigem: string;
    tabelaOrigem: string;
    Data: string;
    Descricao: string;
    Valor: string;
    contaContabilCode: string;
    grupoContaContabil: string;
    subGrupoContaContabil: string;
    contaContabil: string;
    Observacao: string;
    Cor: string;
    NfImportada: string;
    obraGrupoCode: string;
    DataTransacao: string;
    dataInserido: string;
    atualizaTransacaoList: (arg: string) => void
}

const CardList: React.FC<IHistoryFinanceCardProps> = ({ 

}) => {
    const { Banco, AnoMes }: { Banco: string; AnoMes: string } = useParams();
    const idUsuario = localStorage.getItem('@minha-carteira:usuarioId') as string;
    const [dataPost, setDataPost] = useState<IHistoryFinanceCardProps[]>([]);
    const [filtroTexto, setFiltroTexto] = useState<string>("");
    const [subGrupoContaFilterSelected, setSubGrupoContaFilterSelected] = useState<string[]>([]);
    const [classCSSSearch, setClassCSSSearch] = useState<string>('tag-search-close');

    const filtroSubGrupoConta = (filtro: string) => {
        const alreadySelected = subGrupoContaFilterSelected.findIndex(item => item === filtro);

        if(alreadySelected >= 0){
            const filtered = subGrupoContaFilterSelected.filter(item => item !== filtro);
            setSubGrupoContaFilterSelected(filtered);
        }else{            
            setSubGrupoContaFilterSelected((prev) => [...prev, filtro]); 
        }
    }

    const atualizaTransacoesLista = () => { 
        axios.post (URL_API+"/getFaturaCartao", {
            anomes: AnoMes,
            usuario: idUsuario,
            banco: Banco,
        })
        .then((response) => {
            const { data } = response
            setDataPost(JSON.parse(data))  
        })
        .catch((error) => {
          console.log(error)
        })
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

    const subGrupoContaContabilDistinct = useMemo(() => {
        return dataPost.map(item => item.subGrupoContaContabil)
            .filter((value, index, self) => self.indexOf(value) === index)
    }, [dataPost]);

    useEffect(() => {
        atualizaTransacoesLista()
     },[idUsuario, Banco, AnoMes]); 
    
    return (
        <Container>
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

export default CardList;
