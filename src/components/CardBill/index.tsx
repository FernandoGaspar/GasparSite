import React, { useMemo, useState, useEffect } from 'react';
import { Container }  from './styles';
import axios from 'axios';
import { URL_API } from '../../repositories/baseAPI';
import NumberFormat from 'react-number-format';

interface ICardBillProps {
    AnoMes: string;
}

interface IFaturaListPost {
  idTransacoes: string
  tabelaOrigem: string
  idUsuario: string	
  Data: string	
  Descricao: string	
  Valor: string	
  dataLiquidacao: string	
  grupoContaContabil: string	
  subGrupoContaContabil: string	
  contaContabil: string	
  obraGrupoCode: string
}

interface IBancosUsuario {
  idBanco: string
}

const CardBill: React.FC<ICardBillProps> = ({
    AnoMes,
}) => {

  const idUsuario = localStorage.getItem('@minha-carteira:usuarioId') as string;
 
  const [faturaXp, setFaturaXp] = useState<IFaturaListPost[]>([]);
  const [faturaNubank, setFaturaNubank] = useState<IFaturaListPost[]>([]);

  const [bancosUsuario, setBancosUsuario] = useState<IBancosUsuario[]>([]);


  const FaturaTotalNubank = useMemo(() => {
      let total: number = 0;
      faturaNubank.forEach(item => {
        total += Number(item.Valor)
      });
      return Math.round(total)*-1;
  },[faturaNubank]);

  const FaturaTotalXP = useMemo(() => {
    let total: number = 0;
    faturaXp.forEach(item => {
      total += Number(item.Valor)
    });
    return Math.round(total)*-1;
  },[faturaXp]);

  const getTransacoesFatura = async (anoMes: string, idUsuario: string, banco: string) => {
    await axios.post (URL_API+"/getFaturaCartao", {
        headers: {"Access-Control-Allow-Origin": "*"},
        anomes: anoMes,
        usuario: idUsuario,
        banco: banco
    })
    .then((response) => {
        const { data } = response
        if (banco === "1"){
          setFaturaNubank(JSON.parse(data))
        } else {
          setFaturaXp(JSON.parse(data))
        }
    })
    .catch((error) => {
      console.log(error)
    })
  }

  // const getBancosUsuario = async (idUsuario: string) => {
  //   await axios.post (URL_API+"/bancosUsuario", {
  //       headers: {"Access-Control-Allow-Origin": "*"},       
  //       usuario: idUsuario,
  //   })
  //   .then((response) => {
  //     const { data } = response
  //     setBancosUsuario(JSON.parse(data))
  //   })
  //   .catch((error) => {
  //   console.log(error)
  //   })
  // }

  const Faturas = useMemo(() => {
    let faturas = {
      idBanco: "0",
      ValorFatura: "0"
    }
    bancosUsuario.forEach(async item => {
      await getTransacoesFatura (AnoMes, idUsuario, item.idBanco)
      
    });

    return faturas;
  },[bancosUsuario]);

  useEffect(() => { 
    getTransacoesFatura (AnoMes, idUsuario, "1")       
    getTransacoesFatura (AnoMes, idUsuario, "3")
  },[AnoMes, idUsuario]); 

  return (
        <Container>
          <header>
            <h1>
            </h1>
              {/* { AnoMes } */}
              <span>Fatura Nubank </span>
              <strong>R$ </strong>
              <NumberFormat 
                        value={Number(FaturaTotalNubank)}
                        displayType={'text'}
                        decimalSeparator=","
                        thousandSeparator="."
                    />
              <br/>
              <br/>
              
              <span>Fatura XP </span>
              <strong>R$ </strong>
              <NumberFormat 
                        value={Number(FaturaTotalXP)}
                        displayType={'text'}
                        decimalSeparator=","
                        thousandSeparator="."
                    />
                {/* <img src={icon} alt={title}/>  */}
            {/* <p>{description}</p> */}
          </header>

          {/* <footer>
            <span>{footerText}</span>
          </footer> */}
        </Container>
    );
  }

export default CardBill;