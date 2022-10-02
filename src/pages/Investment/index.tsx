import axios from 'axios';
import React, {useEffect, useMemo, useState} from 'react';
import InvestimentBox from '../../components/InvestmentBox';
import { URL_API } from '../../repositories/baseAPI';
import SelectInput from '../../components/SelectInput';
import listOfPeriodos from '../../utils/periodos';
import ContentHeader from '../../components/ContentHeader';
import { FaPlus } from 'react-icons/fa';
import { CustomDialog } from 'react-st-modal';
import InvestmentAddModal from '../../components/InvestmentAddModal'

import {
    Container,
} from './styles';

interface IDataPost {
    codigo: string	
    codigoGrafico: string
    tipo: string
    dataAtualizada: string	
    dataInicial: string
    valorAtual: number	
    valorInicial: number
    variacao: number
    quantidade: number
    saldoAtual: number
}

const Investment: React.FC = () => {
    const [dataPost, setDataPost] = useState<IDataPost[]>([]);
    const idUsuario = localStorage.getItem('@minha-carteira:usuarioId') as string;
    const [periodoSelected, setperiodoSelected] = useState<number>(3);

    const periodos = useMemo(() => {
        return listOfPeriodos.map((month, index) => {
            return {
                value: index + 1,
                label: month,
            }
        });
    },[]);

    const handlePeriodoSelected = (periodo: number) => {
        try {
            setperiodoSelected(periodo);   
        }
        catch{
            throw new Error('invalid month value. Is accept 0 - 24.')
        }
    }

    const atualizaPapeisMonitorados = async () => {
        console.log ("entrou")
        await axios.post (URL_API+"/papeisMonitorados", {
            headers: {"Access-Control-Allow-Origin": "*"},
            idUsuario: idUsuario,
            periodo: periodoSelected
        })
        .then((response) => {
            const { data } = response
            setDataPost(JSON.parse(data))  
        })
        .catch((error) => {
          console.log(error)
        })
        
    }

    const papeisMonitorados = useMemo(() => {
        return dataPost
    },[dataPost]);
    
    useEffect(() => {
        atualizaPapeisMonitorados()
        
    },[idUsuario, periodoSelected]); 

    return (
        
        <Container>
            <ContentHeader title={"Investimentos"} lineColor={""}>
            <div 
                style={{
                    float: "right"
                }}
                >
            <SelectInput 
                options={periodos}
                onChange={(e) => handlePeriodoSelected(parseInt(e.target.value))} 
                defaultValue={periodoSelected}
                />
            </div>
            </ContentHeader>
            <FaPlus
                style={{
                    fontSize : "35px"
                }}   
                onClick={async () => {
                    await CustomDialog(
                            <InvestmentAddModal
                                // key = 1
                                atualizaPapeisMonitorados = { atualizaPapeisMonitorados }
                            />
                            , {
                                title: "descricao",
                                showCloseIcon: true,
                                isFocusLock: true,
                            });    
                            }}                
                            />

            <br/>
            <br/>
            
            <div >
                {
                papeisMonitorados ?   
                papeisMonitorados.map(item=> (
                    <InvestimentBox
                            key={item.codigo}
                            papel={item.codigo}
                            tipo = {item.tipo}
                            papelGrafico = {item.codigoGrafico}
                            cotacaoAtual={item.valorAtual}
                            variacao={item.variacao}
                            saldo={item.saldoAtual}
                            dataAtualizacao={item.dataAtualizada}
                            atualizaPapeisMonitorados = { atualizaPapeisMonitorados }
                            />
                            )) : <> </>
                        }

            </div>
        </Container>
    );
}

export default Investment;