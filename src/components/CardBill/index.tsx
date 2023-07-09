import React, { useMemo, PureComponent, useState } from 'react';
import { Container, FiltrHeader }  from './styles';
import formatCurrency from '../../utils/formatCurrency';
import { useShowNumber } from '../../hooks/showNumber';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {isMobile} from 'react-device-detect';
import { parse, addMonths, format } from 'date-fns';


interface IAreaChartProps {
  data: {
    idUsuario: string
    AnoMesFatura: number
    tabelaOrigem: string
    Valor: number
  }[]
  anomes: string
}


const CardBill: React.FC<IAreaChartProps> = ({
    data,
    anomes,
}) => {
  const { showNumber } = useShowNumber();
  const [tipoFiltroIndicador, setTipoFiltroIndicador] = useState<string[]>([]);

  function renameKey ( obj: any, oldKey: any, newKey: any ) {
    obj[newKey] = obj[oldKey];
    delete obj[oldKey];
  }

  const filtroTipoIndicador = (filtro: string) => {
    console.log (tipoFiltroIndicador.length)
    const alreadySelectedIndicador = tipoFiltroIndicador.findIndex(item => item === filtro);
    if(alreadySelectedIndicador >= 0){
      const filteredIndicador = tipoFiltroIndicador.filter(item => item !== filtro);
      setTipoFiltroIndicador(filteredIndicador);
    }else{            
      setTipoFiltroIndicador((prev) => [...prev, filtro]); 
    }
  }

  const dataFinal = useMemo(() => {

    const dataString = anomes
    const date = parse(dataString, 'yyyyMM', new Date()); // Converter a string para um objeto Date
    const dataSubtraida = addMonths(date, 1); // Subtrair um mês da data
    const dataFormatada = format(dataSubtraida, 'yyyyMM');

    let filteredItems = data
    if (tipoFiltroIndicador.length == 0){
      filteredItems = data.filter(item => item.AnoMesFatura <= Number (dataFormatada) );
    }

    var jsonToPivotjson = require("json-to-pivot-json");
    var options = {
        row: "AnoMesFatura", 
        column: "tabelaOrigem", 
        value: "Valor"
    };
    var output = jsonToPivotjson(filteredItems, options)
    
    output.forEach( (obj: any) => renameKey( obj, 'AnoMes', 'name' ) );
    const updatedJson = JSON.stringify( output );
    
    return output

  },[data, tipoFiltroIndicador]);
  

  return (
        <Container>
          <div>
            <span>
                Faturas futuras
            </span>
            <FiltrHeader>
              <button 
                  key = { Math.random() }
                  type="button"
                  className={`
                  tag-filter 
                  tag-filter-eventual
                  ${tipoFiltroIndicador.includes( "Mostrar Tudo" ) && 'tag-actived'}`}
                  onClick={() => filtroTipoIndicador( "Mostrar Tudo" )}
                  style={{
                    borderBottomColor: "black",
                  }}
                  >
                Mostrar tudo
              </button>
            </FiltrHeader>
          </div>
          {
            showNumber?
              // isMobile?

            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                width={500}
                height={300}
                data={dataFinal}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <XAxis dataKey="AnoMesFatura" />
                <Tooltip 
                        formatter={(value) => formatCurrency(Number(value), 0)}
                        labelStyle={{ color: '#222' }}
                        />
                <YAxis 
                      fontSize={14}
                      tickFormatter={(value: any) => formatCurrency(value, 1)} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Nubank" stackId="a" fill="#820ad1" />
                <Bar dataKey="C6 Bank" stackId="a" fill="#000000" />
                <Bar dataKey="XP Investimentos" stackId="a" fill="#1f1f1f" />
                <Bar dataKey="Itau" stackId="a" fill="#ec7000" />              
              </BarChart>
            </ResponsiveContainer>
          :
                          
            <ResponsiveContainer width="100%" height="100%">
            <BarChart
              width={500}
              height={300}
              data={dataFinal}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <XAxis dataKey="AnoMesFatura" />
              <Legend />
              <Bar dataKey="Nubank" stackId="a" fill="#820ad1" />
              <Bar dataKey="C6 Bank" stackId="a" fill="#000000" />
              <Bar dataKey="Itau" stackId="a" fill="#ec7000" />              
              <Bar dataKey="XP Investimentos" stackId="a" fill="#1f1f1f" />
            </BarChart>
          </ResponsiveContainer>
        }
        </Container>
    );
  }

export default CardBill;