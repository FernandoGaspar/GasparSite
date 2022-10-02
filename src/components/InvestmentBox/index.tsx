import React, { useMemo } from 'react';

import { Container }  from './styles';
import NumberFormat from 'react-number-format';
import formatDate from '../../utils/formatDate';
import { useShowNumber } from '../../hooks/showNumber';
import { FaLowVision } from 'react-icons/fa';
import axios from 'axios';
import { URL_API } from "../../repositories/baseAPI";

interface IInvestmentBoxProps {
  papel: string;
  papelGrafico: string;
  tipo: string;
  cotacaoAtual: number;
  variacao: number;
  saldo: number;
  dataAtualizacao: string;  
  atualizaPapeisMonitorados: (arg: string) => void
}

const InvestimentBox: React.FC<IInvestmentBoxProps> = ({
  papel,
  papelGrafico,
  tipo,
  cotacaoAtual,
  variacao,
  saldo,
  dataAtualizacao,
  atualizaPapeisMonitorados

}) => {
  const { showNumber } = useShowNumber();
  const idUsuario = localStorage.getItem('@minha-carteira:usuarioId') as string;

  const sinal = useMemo(() => {
    if (variacao > 0){
      return "+"
    }else{
      return ""
    }
  },[variacao]);

  const color = useMemo(() => {
    if (variacao > 0){
      return "green"
    }else{
      return "red"
    }
  },[variacao]);

  const linkGrafico = useMemo(() => {
      let link = ""
      if (tipo === "BOVESPA"){
        link = 'https://finance.yahoo.com/chart/'+papelGrafico
      }if (tipo != "BOVESPA"){
        link = 'https://s.tradingview.com/widgetembed/?frameElementId=tradingview_ac482&symbol=MERCADO%3A<CRIPTOMOEDA>BRL&interval=240&hidesidetoolbar=1&saveimage=1&toolbarbg=F4F7F9&studies=%5B%5D&hideideas=1&theme=Light&timezone=exchange&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=br'
        link = link.replace ("<CRIPTOMOEDA>", papelGrafico)
      }
      return link
  },[tipo, papelGrafico]);

  const alteraListaPapel = async (papel: string, status: string) => {
    axios.post (URL_API+"/alteraAtivosMonitorar", {
        headers: {"Access-Control-Allow-Origin": "*"},
        idUsuario: idUsuario,
        papel: papel,
        status: status
    })
    .then((response) => {
        const { data } = response
    })
    .catch((error) => {
      console.log(error)
    })
    atualizaPapeisMonitorados ("Atualizar")
}

  return (
        <Container
          onClick={() => window.open(linkGrafico)}
        >
          <header>
            <h1
              style={{
                color: color
              }}>
              {papel}  &nbsp; &nbsp; &nbsp;
              <div
                style={{
                  float: "right",
                }}
                >
                <NumberFormat
                    value={cotacaoAtual}
                    displayType={'text'}
                    prefix={sinal+'R$'}
                    fixedDecimalScale={true}
                    decimalScale={2}
                    thousandSeparator={"."}
                    decimalSeparator={","}
                  />   &nbsp;
                (
                <NumberFormat
                  value={variacao*100}
                  displayType={'text'}
                  prefix={sinal}
                  suffix={'%'}
                  fixedDecimalScale={true}
                  decimalScale={2}
                  thousandSeparator={"."}
                  decimalSeparator={","}
                />   
                )
              </div>
            </h1>

          </header>

          <footer>
            {saldo > 0 ? 
            <p>
                Saldo:  &nbsp;
                { showNumber ? 
                  <NumberFormat
                    value={saldo}
                    displayType={'text'}
                    prefix={"R$"}
                    fixedDecimalScale={true}
                    decimalScale={2}
                    thousandSeparator={"."}
                    decimalSeparator={","}
                  /> :
                  <NumberFormat 
                      value={saldo}
                      displayType={'text'}
                      format={"*****"}
                  />  
                }
                  &nbsp;
                (
                { showNumber ? 
                  <NumberFormat
                    value={saldo*variacao}
                    displayType={'text'}
                    prefix={"R$"}
                    fixedDecimalScale={true}
                    decimalScale={2}
                    thousandSeparator={"."}
                    decimalSeparator={","}
                    style={{
                      color:color
                    }}
                  /> :
                  <NumberFormat 
                      value={saldo*variacao}
                      displayType={'text'}
                      format={"*****"}
                  />  
                }
                )
            </p>
            : "" }
            <small>{ "Última atualização em " + formatDate(dataAtualizacao!, 1) } </small>          
            <FaLowVision
                onClick={() => {
                      alteraListaPapel (papel, "0")
                        }}
                style={{
                          // fontSize : "35px",
                          float: "right"
                      }}   
                />
          </footer>
        </Container>
        

      );
    }

export default InvestimentBox;

