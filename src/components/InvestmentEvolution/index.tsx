import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import { useShowNumber } from '../../hooks/showNumber';
import { URL_API } from '../../repositories/baseAPI';
import { Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Bar, ComposedChart } from 'recharts';
import formatCurrency from '../../utils/formatCurrency';
import { MdAttachMoney } from "react-icons/md";
import { RiPercentLine } from "react-icons/ri";
import { isMobile } from 'react-device-detect';

import { 
    Container,
    Filters,
    FiltersFooter,
 }  from './styles';

interface IAreaChartProps {
  evolucaoInvestimentos: {
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
  }[]
}

interface IIndicadoresEconomicosData {
  AnoMes: string
  Nome: string
  Valor: number
}

const InvestmentEvolution: React.FC<IAreaChartProps> = ({ 
  evolucaoInvestimentos
 }) => { 
  const { showNumber } = useShowNumber();
  const idUsuario = localStorage.getItem('@minha-carteira:usuarioId') as string;
  // const [evolucaoInvestimentos, setEvolucaoInvestimentos] = useState<IEvolucaoInvestimentoData[]>([]);
  const [evolucaoIndicadores, setEvolucaoIndicadores] = useState<IIndicadoresEconomicosData[]>([]);
  const [tipoFiltroIndicador, setTipoFiltroIndicador] = useState<string[]>([]);
  const [prazoFiltro, setPrazoFiltro] = useState<string[]>([]);
  const [tipoFiltro, setTipoFiltro] = useState<string[]>([]);
  
  const [tipoValor, setTipoValor] = useState<boolean>(false);

  const getIndicadoresEconomicos = () => {
    axios.post (URL_API+"/evolucaoIndicadores", {
        headers: {"Access-Control-Allow-Origin": "*"},
    })
    .then((response) => {
        const { data } = response
        setEvolucaoIndicadores(JSON.parse(data))  

    })
    .catch((error) => {
      console.log(error)
    })
      
  }

  const distinctIndicadores = useMemo(() => {
      let indicadores: [{Nome: string}] = [{
        Nome: "", 
      }] 
      indicadores.splice (0)
      evolucaoIndicadores.forEach(item => {
          if(!indicadores.some(element => element.Nome == item.Nome))
          {
            indicadores.push({Nome: item.Nome})
          }
      });
      
      return indicadores
  },[evolucaoIndicadores]);

  const indicadoresDataFinal = useMemo(() => {

    let dadoFiltrado = evolucaoIndicadores

    if (tipoFiltroIndicador.length > 0){
      dadoFiltrado = dadoFiltrado.filter(item => {
        return tipoFiltroIndicador.includes(item.Nome);
      });
    }

    var jsonToPivotjson = require("json-to-pivot-json");
    var options = {
        row: "AnoMes", 
        column: "Nome", 
        value: "Valor"
    };
    var output = jsonToPivotjson(dadoFiltrado, options)

    return output 

  },[evolucaoIndicadores, tipoFiltroIndicador]);



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

      if (dividendo !== null){
        item.ValorCotacaoPonderado = (item.ValorCotacao+item.dividendo)*item.Saldo
      }else {
        item.ValorCotacaoPonderado = item.ValorCotacao*item.Saldo
      }
      // item.ValorCotacaoPonderado = item.ValorCotacao*item.Saldo
    })

    return dadoFiltrado

  },[evolucaoInvestimentos, tipoFiltro]);

  const dataFinal = useMemo(() => {
    const groupBy = require('group-by-with-sum');
    const agrupado = groupBy(dataAjustada, 'AnoMes', 'ValorMedioPonderado, ValorCotacaoPonderado, ValorM1Ponderado, ValorDividendoPonderado');
    let primeiroMes = 999999;
    let investimentosAgrupados: [{
      AnoMes: number,
      Tipo: string,
      Saldo: number,
      ValorCotacaoPonderado: number,
      ValorMedioPonderado: number,
      ValorM1Ponderado:number,
      ValorDividendoPonderado: number,
      rentabilidadePerc: number,
      variacaoPerc: number,
      dividendoPerc: number,

      variacaoPercAcumulado: number,

      rentabilidadeValor: number,
      variacaoValor: number,
      dividendoValor: number,

      selic: number
      ipca: number
      cdb: number
      cdi: number
      base: number
    }] = agrupado

    investimentosAgrupados.forEach(item => {
      if (primeiroMes > item.AnoMes){
        primeiroMes = item.AnoMes;
      }
      item.rentabilidadePerc = (item.ValorCotacaoPonderado/item.ValorMedioPonderado-1)*100
      item.variacaoPerc = (item.ValorCotacaoPonderado/item.ValorM1Ponderado-1)*100
      item.dividendoPerc = (item.ValorDividendoPonderado/item.ValorCotacaoPonderado)*100
      
      item.rentabilidadeValor = (item.ValorCotacaoPonderado-item.ValorMedioPonderado-1)
      item.variacaoValor = (item.ValorCotacaoPonderado-item.ValorM1Ponderado-1)
      item.dividendoValor = (item.ValorDividendoPonderado)
      
      try {
        item.selic = evolucaoIndicadores.filter((i, index) => {return i.AnoMes.toString() == item.AnoMes.toString() && i.Nome == "selic"})[0].Valor
      }catch{
      }
      try {
        item.ipca = evolucaoIndicadores.filter((i, index) => {return i.AnoMes.toString() == item.AnoMes.toString() && i.Nome == "ipca"})[0].Valor
      }catch{
      }
      try {
        item.cdb = evolucaoIndicadores.filter((i, index) => {return i.AnoMes.toString() == item.AnoMes.toString() && i.Nome == "cdb"})[0].Valor
      }catch{
      }
      try {
        item.cdi = evolucaoIndicadores.filter((i, index) => {return i.AnoMes.toString() == item.AnoMes.toString() && i.Nome == "cdi"})[0].Valor
      }catch{
      }

      item.base = 0
      
    })
    
    investimentosAgrupados.forEach(item => {
      if (primeiroMes == item.AnoMes){
        item.variacaoPerc = 0;
      }
    })
    let variacaoPercAcumuladoVar = 0
    let selicAcumulado = 0
    let ipcaAcumulado = 0
    let cdbAcumulado = 0
    let cdiAcumulado = 0
    
    investimentosAgrupados.forEach(item => {
      if (item.variacaoPercAcumulado === undefined){
        item.variacaoPercAcumulado = item.variacaoPerc/100
      }
      variacaoPercAcumuladoVar = ((1+variacaoPercAcumuladoVar) * (1+(item.variacaoPerc/100)))-1
      item.variacaoPercAcumulado = variacaoPercAcumuladoVar*100
      
      selicAcumulado = ((1+selicAcumulado) * (1+(item.selic/100)))-1
      item.selic = selicAcumulado*100

      ipcaAcumulado = ((1+ipcaAcumulado) * (1+(item.ipca/100)))-1
      item.ipca = ipcaAcumulado*100

      cdbAcumulado = ((1+cdbAcumulado) * (1+(item.cdb/100)))-1
      item.cdb = cdbAcumulado*100

      cdiAcumulado = ((1+cdiAcumulado) * (1+(item.cdi/100)))-1
      item.cdi = cdiAcumulado*100
      
    })
    

    return investimentosAgrupados 

  },[dataAjustada, evolucaoInvestimentos, evolucaoIndicadores, distinctIndicadores]);

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

  const filtroTipoIndicador = (filtro: string) => {
    const alreadySelectedIndicador = tipoFiltroIndicador.findIndex(item => item === filtro);
    if(alreadySelectedIndicador >= 0){
      const filteredIndicador = tipoFiltroIndicador.filter(item => item !== filtro);
      setTipoFiltroIndicador(filteredIndicador);
    }else{            
      setTipoFiltroIndicador((prev) => [...prev, filtro]); 
    }
  }

  function tickFormatter (valor: any){
    let retorno = "" as string
    if (tipoValor){
      retorno = formatCurrency(Number(valor), 0);
    } else {
      retorno = Number(valor).toFixed(2)+"%";
    } 
    return retorno
  }

  useEffect(() => {
    getIndicadoresEconomicos()
  },[]); 

    return (
      <Container>
        <Filters>
            {
                tipoInvestimento.map(item => (
                    <button 
                        key = { Math.random() }
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

        <ResponsiveContainer width="100%" height={210} debounce={100}>
          <ComposedChart width={1000} height={250} data={dataFinal}
                    margin={{
                      top: 30,
                      right: 20,    
                      left: 25,
                      bottom: 0,
                    }}          >
            <XAxis dataKey="AnoMes" fontSize={14}/>
            {
              isMobile ?
              <></>
              :
              <>
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
              </>
            }
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
              <Line type="monotone" dataKey="rentabilidadePerc" name='Rentabilidade histórica' stroke="#8884d8" yAxisId={1}/>
              <Line type="monotone" dataKey="variacaoPerc" name='Variação' stroke="red" yAxisId={1}/>

              <Line type="monotone" dataKey="variacaoPercAcumulado" name='Variação acumulada' stroke="green" yAxisId={1}/>
              
              <Line type="monotone" dataKey="base" stroke="black" yAxisId={1} />
              
              {(() => {
                        if (tipoFiltroIndicador.includes("selic")){
                          return <Line type="monotone" dataKey="selic" stroke="green" strokeDasharray="3 3" yAxisId={1} />
                        }
              })()}


              {(() => {
                        if (tipoFiltroIndicador.includes("ipca")){
                          return <Line type="monotone" dataKey="ipca" stroke="#fb5959" strokeDasharray="3 3" yAxisId={1} />
                        }
              })()}


              {(() => {
                        if (tipoFiltroIndicador.includes("cdi")){
                          return <Line type="monotone" dataKey="cdi" stroke="#6c9561" strokeDasharray="3 3" yAxisId={1} />
                        }
              })()}


              {(() => {
                        if (tipoFiltroIndicador.includes("cdb")){
                          return <Line type="monotone" dataKey="cdb" stroke="#826a00" strokeDasharray="3 3" yAxisId={1} />
                        }
              })()}

            </>
            }
          </ComposedChart>
        </ResponsiveContainer>
      : <></> }
      <section>
        <FiltersFooter>
              {
                  distinctIndicadores.map(item => (
                      <button 
                          key = { Math.random() }
                          type="button"
                          className={`
                          tag-filter 
                          tag-filter-eventual
                          ${tipoFiltroIndicador.includes( item.Nome ) && 'tag-actived'}`}
                          onClick={() => filtroTipoIndicador( item.Nome )}
                          style={{
                                  borderBottomColor: "black",
                              }}
                      >
                      { item.Nome }
                      </button>
                  ))
              }   
              <MdAttachMoney  className={`
                                  tag-filter 
                                  tag-filter-eventual
                                  tipoValor
                                  ${tipoValor && 'tag-actived'}`} 
                                  onClick = {() => {setTipoValor(!tipoValor);}} 
                                  />
              <RiPercentLine  className={`
                                  tag-filter  
                                  tag-filter-eventual
                                  tipoValor
                                  ${!tipoValor && 'tag-actived'}`} 
                                  onClick = {() => {setTipoValor(!tipoValor);}} />  
          </FiltersFooter>
      </section>
      </Container>


    );  
}
export default InvestmentEvolution;
