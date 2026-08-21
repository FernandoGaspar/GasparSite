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
  indicadoresEconomicos?: IIndicadoresEconomicosData[]
}

interface IIndicadoresEconomicosData {
  AnoMes: string
  Nome: string
  Valor: number
}

const InvestmentEvolution: React.FC<IAreaChartProps> = ({ 
  evolucaoInvestimentos,
  indicadoresEconomicos,
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
    const dadosFiltrados = tipoFiltro.length
      ? evolucaoInvestimentos.filter((item) => tipoFiltro.includes(item.Tipo))
      : evolucaoInvestimentos;

    // Não altere a série retornada pela API: ela também é usada por outros gráficos.
    // Dividendos são uma série própria (colunas) e não devem inflar a cotação.
    return dadosFiltrados.map((item) => {
      const saldo = Number(item.Saldo) || 0;
      return {
        ...item,
        ValorMedioPonderado: (Number(item.ValorMedio) || 0) * saldo,
        ValorCotacaoPonderado: (Number(item.ValorCotacao) || 0) * saldo,
        ValorM1Ponderado: (Number(item.ValorCotacaoM1) || 0) * saldo,
        ValorDividendoPonderado: (Number(item.dividendo) || 0) * saldo,
      };
    });

  },[evolucaoInvestimentos, tipoFiltro]);

  const dataFinal = useMemo(() => {
    const indicadoresPorMes = new Map<string, Record<string, number>>();
    evolucaoIndicadores.forEach((item) => {
      const anoMes = String(item.AnoMes);
      const indicadores = indicadoresPorMes.get(anoMes) || {};
      indicadores[item.Nome.toLowerCase()] = Number(item.Valor) || 0;
      indicadoresPorMes.set(anoMes, indicadores);
    });

    const porMes = new Map<number, any>();
    dataAjustada.forEach((item) => {
      const anoMes = Number(item.AnoMes);
      if (!Number.isFinite(anoMes)) return;
      const acumulado = porMes.get(anoMes) || {
        AnoMes: anoMes,
        ValorMedioPonderado: 0,
        ValorCotacaoPonderado: 0,
        ValorM1Ponderado: 0,
        ValorDividendoPonderado: 0,
      };
      acumulado.ValorMedioPonderado += Number(item.ValorMedioPonderado) || 0;
      acumulado.ValorCotacaoPonderado += Number(item.ValorCotacaoPonderado) || 0;
      acumulado.ValorM1Ponderado += Number(item.ValorM1Ponderado) || 0;
      acumulado.ValorDividendoPonderado += Number(item.ValorDividendoPonderado) || 0;
      porMes.set(anoMes, acumulado);
    });

    const acumulados = { variacao: 0, selic: 0, ipca: 0, cdb: 0, cdi: 0 };
    return [...porMes.values()]
      .sort((a, b) => a.AnoMes - b.AnoMes)
      .map((item, indice) => {
        const indicadores = indicadoresPorMes.get(String(item.AnoMes)) || {};
        const rentabilidadePerc = item.ValorMedioPonderado
          ? ((item.ValorCotacaoPonderado / item.ValorMedioPonderado) - 1) * 100
          : 0;
        const variacaoPerc = indice && item.ValorM1Ponderado
          ? ((item.ValorCotacaoPonderado / item.ValorM1Ponderado) - 1) * 100
          : 0;
        acumulados.variacao = ((1 + acumulados.variacao) * (1 + variacaoPerc / 100)) - 1;
        (['selic', 'ipca', 'cdb', 'cdi'] as const).forEach((nome) => {
          acumulados[nome] = ((1 + acumulados[nome]) * (1 + (indicadores[nome] || 0) / 100)) - 1;
        });

        return {
          ...item,
          rentabilidadePerc,
          variacaoPerc,
          dividendoPerc: item.ValorCotacaoPonderado
            ? (item.ValorDividendoPonderado / item.ValorCotacaoPonderado) * 100
            : 0,
          // Sem o "- 1": ele criava um prejuízo artificial de R$ 1 em cada mês.
          rentabilidadeValor: item.ValorCotacaoPonderado - item.ValorMedioPonderado,
          variacaoValor: item.ValorCotacaoPonderado - item.ValorM1Ponderado,
          dividendoValor: item.ValorDividendoPonderado,
          variacaoPercAcumulado: acumulados.variacao * 100,
          selic: acumulados.selic * 100,
          ipca: acumulados.ipca * 100,
          cdb: acumulados.cdb * 100,
          cdi: acumulados.cdi * 100,
          base: 0,
        };
      });

  },[dataAjustada, evolucaoIndicadores]);

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
    if (indicadoresEconomicos) {
      setEvolucaoIndicadores(indicadoresEconomicos);
      return;
    }
    getIndicadoresEconomicos()
  },[indicadoresEconomicos]);

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
              <Line type="monotone" dataKey="variacaoPercAcumulado" name='Rentabilidade do período' stroke="#8884d8" yAxisId={1}/>
              <Line type="monotone" dataKey="variacaoPerc" name='Variação' stroke="red" yAxisId={1}/>
              
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
