import React, { useMemo } from 'react';
import { Container }  from './styles';
import NumberFormat from 'react-number-format';
import formatDate from '../../utils/formatDate';
import { useShowNumber } from '../../hooks/showNumber';
import axios from 'axios';
import { URL_API } from "../../repositories/baseAPI";
import { FaBitcoin, FaLowVision } from "react-icons/fa";
import { AiOutlineStock, AiOutlineShop, AiOutlineNodeIndex } from "react-icons/ai";
import { GiWorld } from "react-icons/gi";


interface IInvestmentBoxProps {
  papel: string;
  papelGrafico: string;
  tipo: string;
  cotacaoAtual: number;
  variacao: number;
  saldo: number;
  dataAtualizacao: string;  
  ultimoDividendo: number;
  dataUltimoDiv: string
  tipoPapel: string
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
  ultimoDividendo,
  dataUltimoDiv,
  tipoPapel,
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
        link = 'https://www.binance.com/en/trade/<CRIPTOMOEDA>_BRL?theme=dark&type=spot'
        // link = 'https://s.tradingview.com/widgetembed/?frameElementId=tradingview_ac482&symbol=MERCADO%3A<CRIPTOMOEDA>BRL&interval=240&hidesidetoolbar=1&saveimage=1&toolbarbg=F4F7F9&studies=%5B%5D&hideideas=1&theme=Light&timezone=exchange&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=br'
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
        atualizaPapeisMonitorados ("Atualizar")
    })
    .catch((error) => {
      console.log(error)
    })
    atualizaPapeisMonitorados ("Atualizar")
  }

  const tipoPapelIcone = useMemo(() => {
    switch (tipoPapel) {
        case 'FUNDOS IMOBILIÁRIOS':
            return <AiOutlineShop />;
        case 'EMPRESA LISTADA NA BOLSA BRASILEIRA': 
            return <AiOutlineStock />;
        case 'EMPRESA LISTADA NA BOLSA INTERNACIONAL': 
            return <GiWorld />;
        case 'CRIPTOMOEDA': 
            return <FaBitcoin />;
          case 'INDICE': 
            return <AiOutlineNodeIndex />;                            
        default:
          return undefined;
    }
  },[tipoPapel]);

  return (
        <Container
          onClick={() => window.open(linkGrafico)}
        >
          <header>

            <h1
              style={{
                color: color
              }}>
              {tipoPapelIcone} &nbsp;
              {papel}  &nbsp; &nbsp;
              <div
                style={{
                  float: "right",
                }}
                >
                <NumberFormat
                    value={cotacaoAtual}
                    displayType={'text'}
                    prefix={'R$'}
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
            <section>
            {ultimoDividendo > 0 ?
              <p>
                Dividendo: &nbsp;
                <NumberFormat
                          value={ultimoDividendo}
                          displayType={'text'}
                          prefix={'R$'}
                          fixedDecimalScale={true}
                          decimalScale={2}
                          thousandSeparator={"."}
                          decimalSeparator={","}
                          />   &nbsp;
                                (
                    <NumberFormat
                      value={ultimoDividendo/cotacaoAtual*100}
                      displayType={'text'}
                      prefix={sinal}
                      suffix={'%'}
                      fixedDecimalScale={true}
                      decimalScale={2}
                      thousandSeparator={"."}
                      decimalSeparator={","}
                      />   
                    )
                    <div>
                      { formatDate(dataUltimoDiv!, 2) }
                    </div>
              </p> : ""
            }
            </section>
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

