import React, { useMemo, useState } from 'react';
import { useShowNumber } from '../../hooks/showNumber';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import formatCurrency from '../../utils/formatCurrency';
import {isMobile} from 'react-device-detect';

import { 
    Container,
 }  from './styles';

interface IAreaChartProps {
    data: {
        subGrupoContaContabil: string
        Valor: number
        AnoMes: string
        Cor: string
    }[]
}

const AreaChartBox: React.FC<IAreaChartProps> = ({ data }) => { 
    const { showNumber } = useShowNumber();
      
    const distinctContaContabil = useMemo(() => {
        let uniqueSubGrupoConta: [{subGrupoContaContabil: string, Cor: string}] = [{
            subGrupoContaContabil: "", 
            Cor: "",
        }] 
        uniqueSubGrupoConta.splice (0)
        data.forEach(item => {
            if(!uniqueSubGrupoConta.some(element => element.subGrupoContaContabil == item.subGrupoContaContabil))
            {
                uniqueSubGrupoConta.push({subGrupoContaContabil: item.subGrupoContaContabil, Cor: item.Cor})
            }
        });
        
        return uniqueSubGrupoConta
    },[data]);
    
    function renameKey ( obj: any, oldKey: any, newKey: any ) {
      obj[newKey] = obj[oldKey];
      delete obj[oldKey];
    }
    
    const dataFinal = useMemo(() => {
      var jsonToPivotjson = require("json-to-pivot-json");
      var options = {
          row: "AnoMes", 
          column: "subGrupoContaContabil", 
          value: "Valor"
      };
      var output = jsonToPivotjson(data, options)
      
      output.forEach( (obj: any) => renameKey( obj, 'AnoMes', 'name' ) );
      const updatedJson = JSON.stringify( output );
      
      return output

    },[data]);
    

    return (
        <Container>
          {
            showNumber?
              isMobile?
                <ResponsiveContainer width="100%" height="95%">
                  <AreaChart
                    data={dataFinal}
                    margin={{
                      top: 30,
                      right: 30,    
                      left: 15,
                      bottom: 0,
                    }}
                  >
                    <XAxis 
                      dataKey="name" 
                      fontSize={14}
                    />
                    <Tooltip 
                      formatter={(value) => formatCurrency(Number(value), 0)}
                      labelStyle={{ color: '#222' }}
                      />
                    {
                      distinctContaContabil.map(item => (
                        <Area 
                          key={item.Cor + Math.random()}
                          type="monotone" 
                          dataKey={item.subGrupoContaContabil} 
                          stackId="1" 
                          stroke={ item.Cor }
                          fill={ item.Cor } />
                        ))
                    } 
                  </AreaChart>
                </ResponsiveContainer>
                :
                <ResponsiveContainer width="100%" height="95%">
                <AreaChart
                  data={dataFinal}
                  margin={{
                    top: 30,
                    right: 30,
                    left: 15,
                    bottom: 0,
                  }}
                >
                  <XAxis 
                    dataKey="name" 
                    fontSize={14}
                  />
                  <YAxis 
                    fontSize={14}
                    tickFormatter={(value: any) => formatCurrency(value, 1)} />
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value), 0)}
                    labelStyle={{ color: '#222' }}
                    />
                  {
                    distinctContaContabil.map(item => (
                      <Area 
                        key={item.Cor + Math.random()}
                        type="monotone" 
                        dataKey={item.subGrupoContaContabil} 
                        stackId="1" 
                        stroke={ item.Cor }
                        fill={ item.Cor } />
                      ))
                  } 
                </AreaChart>
                </ResponsiveContainer>  
              :
              <ResponsiveContainer width="100%" height="95%">
              <AreaChart
                data={dataFinal}
                margin={{
                  top: 30,
                  right: 30,
                  left: 30,
                  bottom: 0,
                }}
              >

                <XAxis dataKey="name" />
                {
                  distinctContaContabil.map(item => (
                    <Area type="monotone" dataKey={item.subGrupoContaContabil} stackId="1" stroke={ item.Cor }fill={ item.Cor } />
                    ))
                } 
              </AreaChart>
              </ResponsiveContainer>
          }
        </Container>
    );  
}
export default AreaChartBox;
