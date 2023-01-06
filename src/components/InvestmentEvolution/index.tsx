import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import { useShowNumber } from '../../hooks/showNumber';
import { URL_API } from '../../repositories/baseAPI';
import { Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Bar, ComposedChart } from 'recharts';
import formatCurrency from '../../utils/formatCurrency';
import { MdAttachMoney } from "react-icons/md";
import { RiPercentLine } from "react-icons/ri";

// RiPercentLine

import { 
    Container,
    Filters,
 }  from './styles';


interface IAreaChartProps {
  AnoMes: string
}

interface IEvolucaoInvestimentoData {
  AnoMes: string
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

const InvestmentEvolution: React.FC<IAreaChartProps> = ({ 
  AnoMes
 }) => { 
  const { showNumber } = useShowNumber();
  const idUsuario = localStorage.getItem('@minha-carteira:usuarioId') as string;
  const [evolucaoInvestimentos, setEvolucaoInvestimentos] = useState<IEvolucaoInvestimentoData[]>([]);
  const [tipoFiltro, setTipoFiltro] = useState<string[]>([]);
  const [tipoValor, setTipoValor] = useState<boolean>(true);

  const getEvolucaoInvestimento = () => {
      axios.post (URL_API+"/evolucaoInvestimento", {
          headers: {"Access-Control-Allow-Origin": "*"},
          idUsuario: idUsuario,
          AnoMes: AnoMes
      })
      .then((response) => {
          const { data } = response
          setEvolucaoInvestimentos(JSON.parse(data))  
      })
      .catch((error) => {
        console.log(error)
      })
      
  }

  const tipoInvestimento = useMemo(() => {
    return evolucaoInvestimentos.map(item => item.Tipo)
        .filter((value, index, self) => self.indexOf(value) === index)
  }, [evolucaoInvestimentos]);

  const dataAjustada = useMemo(() => {
    let dadoFiltrado = evolucaoInvestimentos
    if (tipoFiltro.length > 0){
      dadoFiltrado = dadoFiltrado.filter(item => {
        return tipoFiltro.includes(item.Tipo);
      });
    }
    let dividendo = 0
    dadoFiltrado.forEach(item => {
      item.ValorMedioPonderado = item.ValorMedio*item.Saldo
      item.ValorM1Ponderado = item.ValorCotacaoM1*item.Saldo
      item.ValorDividendoPonderado = item.dividendo*item.Saldo

      if (dividendo == 1){
        item.ValorCotacaoPonderado = (item.ValorCotacao+item.dividendo)*item.Saldo
      }else {
        item.ValorCotacaoPonderado = item.ValorCotacao*item.Saldo
      }
    })

    return dadoFiltrado

  },[evolucaoInvestimentos, tipoFiltro]);

  const dataFinal = useMemo(() => {

    const groupBy = require('group-by-with-sum');
    const agrupado = groupBy(dataAjustada, 'AnoMes', 'ValorMedioPonderado, ValorCotacaoPonderado, ValorM1Ponderado, ValorDividendoPonderado');
    console.log (agrupado)
    let investimentosAgrupados: [{
      AnoMes: string,
      Tipo: string,
      Saldo: number,
      ValorCotacaoPonderado: number,
      ValorMedioPonderado: number,
      ValorM1Ponderado:number,
      ValorDividendoPonderado: number,
      rentabilidadePerc: number,
      variacaoPerc: number,
      dividendoPerc: number,

      rentabilidadeValor: number,
      variacaoValor: number,
      dividendoValor: number,

      base: number
    }] = agrupado

    investimentosAgrupados.forEach(item => {
      item.rentabilidadePerc = (item.ValorCotacaoPonderado/item.ValorMedioPonderado-1)*100
      item.variacaoPerc = (item.ValorCotacaoPonderado/item.ValorM1Ponderado-1)*100
      item.dividendoPerc = (item.ValorDividendoPonderado/item.ValorCotacaoPonderado)*100

      item.rentabilidadeValor = (item.ValorCotacaoPonderado-item.ValorMedioPonderado-1)
      item.variacaoValor = (item.ValorCotacaoPonderado-item.ValorM1Ponderado-1)
      item.dividendoValor = (item.ValorDividendoPonderado)

      item.base = 0
    })
    return investimentosAgrupados 

  },[dataAjustada, evolucaoInvestimentos]);

  const carregou = useMemo(() => { 
    if (dataFinal.length > 0){
      return true
    } return false
  },[dataFinal]);

  const filtroTipo = (filtro: string) => {
    const alreadySelected = tipoFiltro.findIndex(item => item === filtro);

    if(alreadySelected >= 0){
        const filtered = tipoFiltro.filter(item => item !== filtro);
        setTipoFiltro(filtered);
    }else{            
      setTipoFiltro((prev) => [...prev, filtro]); 
    }
  }

  function tickFormatter (valor: any){
    let retorno = "" as string
    if (tipoValor){
      retorno = formatCurrency(Number(valor), 0);
    } else {
      retorno = Number(valor).toFixed(1)+"%";
    } 
    return retorno
  }

  useEffect(() => {
    getEvolucaoInvestimento()
    
  },[]); 

    return (
      <Container>
            <Filters>
                {
                    tipoInvestimento.map(item => (
                        <button 
                            key = { item }
                            type="button"
                            className={`
                            tag-filter 
                            tag-filter-eventual
                            ${tipoFiltro.includes( item ) && 'tag-actived'}`}
                            onClick={() => filtroTipo( item )}
                            style={{
                                    borderBottomColor: "black",
                                }}
                        >
                        { item }
                        </button>
                    ))
                }   
                
            </Filters>
      { carregou ? 

        <ResponsiveContainer width="100%" height="70%">
          <ComposedChart width={1000} height={250} data={dataFinal}
                    margin={{
                      top: 30,
                      right: 20,    
                      left: 30,
                      bottom: 0,
                    }}          >
            <XAxis dataKey="AnoMes" fontSize={14}/>
            <YAxis
              orientation="left"
              fontSize={14}
              yAxisId={1} 
              tickFormatter={(lable: any) => {return tickFormatter(lable)}}
              />
            <YAxis
              orientation="right"
              fontSize={14}
              tickFormatter={(lable: any) => {return tickFormatter(lable)}}
              yAxisId={2} 
              />
            <Tooltip      
              formatter={(lable: any) => {return tickFormatter(lable)}}/>
            <Legend />
            { tipoValor ?
            <>
              <Bar dataKey="dividendoValor" name='Dividendo' barSize={20} fill="#a8a8a8" radius={[5, 5, 0, 0]} yAxisId={2} />
              <Line type="monotone" dataKey="rentabilidadeValor" name='Rentabilidade' stroke="#8884d8" yAxisId={1}/>
              <Line type="monotone" dataKey="variacaoValor" name='Variação' stroke="red" yAxisId={1}/>
              <Line type="monotone" dataKey="base" stroke="black" strokeDasharray="3 3"yAxisId={1} />
            </>
            :
            <>
              <Bar dataKey="dividendoPerc" name='Dividendo' barSize={20} fill="#a8a8a8" radius={[5, 5, 0, 0]} yAxisId={2} />
              <Line type="monotone" dataKey="rentabilidadePerc" name='Rentabilidade' stroke="#8884d8" yAxisId={1}/>
              <Line type="monotone" dataKey="variacaoPerc" name='Variação' stroke="red" yAxisId={1}/>
              <Line type="monotone" dataKey="base" stroke="black" strokeDasharray="3 3"yAxisId={1} />
            </>
            }
          </ComposedChart>
        </ResponsiveContainer>
      : <></> }
      <p>
        <MdAttachMoney  className={`
                            tag-filter 
                            tag-filter-eventual
                            ${tipoValor && 'tag-actived'}`} 
                          onClick = {() => {setTipoValor(!tipoValor);}} 
                          />
        <RiPercentLine  className={`
                            tag-filter 
                            tag-filter-eventual
                            ${!tipoValor && 'tag-actived'}`} 
                            onClick = {() => {setTipoValor(!tipoValor);}} />
      </p>
      </Container>


    );  
}
export default InvestmentEvolution;
