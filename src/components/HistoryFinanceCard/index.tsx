import React, { useEffect, useMemo } from 'react';

import logoBradesco from '../../assets/bradesco.svg';
import logoNubank from '../../assets/nubank.svg';
import logoItau from '../../assets/itau.svg';
import logoXp from '../../assets/xp.svg';
import formatDate from '../../utils/formatDate';
import { FaCircle } from 'react-icons/fa';

import { Container, Tag }  from './styles';
import { CustomDialog } from 'react-st-modal';
import { MdInsertDriveFile } from 'react-icons/md';
import Moment from 'moment';

import HistoryFinanceModal from '../HistoryFinanceModal';
interface IHistoryFinanceCardProps {
    idTransacao: string;
    data: string;
    descricao: string;
    valor: string;
    contaContabilCode: string;
    grupoContaContabil: string;
    subGrupoContaContabil: string;
    contaContabil: string;
    observacao: string;
    tagColor: string;
    NfImportada: string;
    tabelaOrigem: string;
    obraGrupoCode: string;
    dataTransacao: string;
    atualizaTransacaoList: (arg: string) => void
}

const HistoryFinanceCard: React.FC<IHistoryFinanceCardProps> = ({
    idTransacao,
    data,
    descricao,
    valor,
    contaContabilCode,
    grupoContaContabil,
    subGrupoContaContabil,
    contaContabil,
    observacao,
    tagColor,
    NfImportada,
    tabelaOrigem,
    obraGrupoCode,
    dataTransacao,
    atualizaTransacaoList

})  => {
    const banco = useMemo(() => {
        switch (tabelaOrigem) {
            case 'tbItauConta':
                return logoItau;
            case 'tbNubankCredito': 
                return logoNubank;
            case 'tbNubankConta': 
                return logoNubank;
            case 'tbBradescoConta':
                return logoBradesco;
            case 'tbXPCredito':
                return undefined;                            
            default:
              return undefined;
        }
    },[tabelaOrigem]);

    const novaTransacao = useMemo(() => {
        let retornar = false;
        let dataForamatada = formatDate(dataTransacao, 0);
        let hoje = new Date()
        let hojeFormatada = Moment(hoje).format('YYYY-MM-DD');
        
        if (hojeFormatada === dataForamatada){
            retornar = true;
        }

        return retornar;
    },[dataTransacao]);


    useEffect(() => {
    },[]);    
    return (
        
        <Container>
            <Tag color={tagColor} />
            <div 
                onClick={async () => {
                    await CustomDialog(
                        <HistoryFinanceModal
                            key = { idTransacao }
                            idTransacao = { idTransacao }
                            data={ data }
                            descricao = { descricao }
                            valor= { valor }
                            contaContabilCode = { contaContabilCode }
                            grupoContaContabil = { grupoContaContabil }
                            subGrupoContaContabil = { subGrupoContaContabil }
                            contaContabil = { contaContabil }
                            observacao = { observacao }
                            tagColor = { "" }
                            obraGrupoCode = { obraGrupoCode }
                            atualizaTransacao = {atualizaTransacaoList}

                        />, {
                            title: descricao,
                            showCloseIcon: true,
                        });    
                        }}                
                        >
                <div>
                    <small>{contaContabil}</small>
                    <span>{ descricao }
                    &nbsp;
                    { novaTransacao ? 
                                        <FaCircle
                                            style={{ 
                                                height: 15,
                                                color: "green"
                                                }}
                                            /> 
                                            : <></> }
                    </span> 
                    <small>{ formatDate(data, 1) }</small>
                </div>    
                <div>
                    {(() => {
                        if (Number(NfImportada) === 1 && subGrupoContaContabil === "Construção") {
                            return <MdInsertDriveFile 
                            style={{ 
                                marginLeft: "auto"
                            }}
                            />
                        }if (Number(NfImportada) === 0 && subGrupoContaContabil === "Construção") {
                            return <MdInsertDriveFile 
                                style={{ 
                                    color: "red" ,
                                    marginLeft: "auto"
                                }}
                            />
                        } 
                    })()}
                    <h3 />
                    <h3>{valor}</h3>
                    <div>
                        <img src={banco}  
                                style={{ 
                                    marginLeft: "auto",
                                    height: 20,
                                }}/>
                    </div> 
                    <h3 />
                </div>    
            </div>

        </Container>
    );
    }

export default HistoryFinanceCard;

