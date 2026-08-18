import React, { useEffect, useMemo, useRef } from 'react';
import { ThemeProvider } from 'styled-components';

import { useTheme } from '../../hooks/theme';
import logoBradesco from '../../assets/bradesco.svg';
import logoNubank from '../../assets/nubank.svg';
import logoItau from '../../assets/itau.svg';
import logoItauCard from '../../assets/itaucard.png';

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
    dataInserido: string;
    atualizaTransacaoList: (arg: string) => void
    autoOpen?: boolean
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
    dataInserido,
    atualizaTransacaoList,
    autoOpen = false

})  => {
    const { theme } = useTheme();

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
            case 'tbItauCredito':
                return logoItauCard;
            case 'tbXPCredito':
                return undefined;                            
            default:
              return undefined;
        }
    },[tabelaOrigem]);

    const novaTransacao = useMemo(() => {
        let retornar = false;
        let dataForamatada = formatDate(dataInserido, 0);
        let hoje = new Date()
        let hojeFormatada = Moment(hoje).format('YYYY-MM-DD');
        
        if (hojeFormatada === dataForamatada){
            retornar = true;
        }

        return retornar;
    },[dataInserido]);


    const openedFromLink = useRef(false);
    const openTransaction = async () => {
        await CustomDialog(
            <ThemeProvider theme={theme}>
                <HistoryFinanceModal
                    key={idTransacao}
                    idTransacao={idTransacao}
                    data={data}
                    descricao={descricao}
                    valor={valor}
                    contaContabilCode={contaContabilCode}
                    grupoContaContabil={grupoContaContabil}
                    subGrupoContaContabil={subGrupoContaContabil}
                    contaContabil={contaContabil}
                    observacao={observacao}
                    tagColor={tagColor}
                    obraGrupoCode={obraGrupoCode}
                    atualizaTransacao={atualizaTransacaoList}
                />
            </ThemeProvider>, { title: descricao, showCloseIcon: true });
    };

    useEffect(() => {
        if (autoOpen && !openedFromLink.current) {
            openedFromLink.current = true;
            openTransaction();
        }
    }, [autoOpen]);
    return (
        
        <Container>
            <Tag color={tagColor} />
            <div 
                onClick={openTransaction}
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

