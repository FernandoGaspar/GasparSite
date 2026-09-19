import React, { useEffect, useMemo, useRef } from 'react';
import { ThemeProvider } from 'styled-components';

import { useTheme } from '../../hooks/theme';
import logoBradesco from '../../assets/bradesco.svg';
import logoNubank from '../../assets/nubank.svg';
import logoItau from '../../assets/itau.svg';
import logoItauCard from '../../assets/itaucard.png';

import logoXp from '../../assets/xp.svg';
import formatDate from '../../utils/formatDate';

import { Container, NewTransactionDot, Tag }  from './styles';
import { CustomDialog } from 'react-st-modal';
import { MdInsertDriveFile } from 'react-icons/md';

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
    dataInserido: string | number;
    atualizaTransacaoList: (arg: string) => void
    autoOpen?: boolean
    pluggyData?: Record<string, any>
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
    autoOpen = false,
    pluggyData

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
        const rawValue = String(dataInserido ?? '').trim();
        if (!rawValue) return false;

        const microsoftDate = rawValue.match(/\/Date\((\d+)/);
        const timestamp = microsoftDate
            ? Number(microsoftDate[1])
            : /^\d{10,13}$/.test(rawValue)
                ? Number(rawValue) * (rawValue.length === 10 ? 1000 : 1)
                : Date.parse(rawValue);
        const insertedAt = new Date(timestamp);
        if (Number.isNaN(insertedAt.getTime())) return false;

        const today = new Date();
        return insertedAt.getFullYear() === today.getFullYear()
            && insertedAt.getMonth() === today.getMonth()
            && insertedAt.getDate() === today.getDate();
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
                    pluggyData={pluggyData}
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
                    {novaTransacao ? (
                        <NewTransactionDot
                            aria-label="Nova transação"
                            role="img"
                            title="Nova transação"
                        />
                    ) : null}
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

