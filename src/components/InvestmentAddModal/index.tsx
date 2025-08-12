import React, { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import { ModalContent, useDialog } from 'react-st-modal';
import { Button } from '@mui/material';

import axios from 'axios';
import { URL_API } from '../../repositories/baseAPI';

interface IIvestmentAddModalProps {
    atualizaPapeisMonitorados: (arg: string) => void
}

interface IPapeis {
    codigo:	string
    descricao:	string
    tipo: string
    listado: string
}



const InvestmentAddModal: React.FC<IIvestmentAddModalProps> = ({ atualizaPapeisMonitorados }) => {
    const [listaDePapeisAPI, setListaDePapeisAPI] = useState<IPapeis[]>([]);   
    const [papelSelecionado, setPapelSelecionado] = useState<string>();  
    const dialog = useDialog();
    const idUsuario = localStorage.getItem('@minha-carteira:usuarioId') as string;

    const getListaAtivosMonitorar = async () => {
        await axios.post (URL_API+"/listaAtivosMonitorar", {
            headers: {"Access-Control-Allow-Origin": "*"},
            idUsuario: idUsuario
        })
        .then((response) => {
            const { data } = response
            setListaDePapeisAPI(JSON.parse(data))  
        })
        .catch((error) => {
          console.log(error)
        })
        
    }

    const alteraListaPapel = async (status: string) => {
        axios.post (URL_API+"/alteraAtivosMonitorar", {
            headers: {"Access-Control-Allow-Origin": "*"},
            idUsuario: idUsuario,
            papel: papelSelecionado,
            status: status
        })
        .then((response) => {
        })
        .catch((error) => {
          console.log(error)
        })
        atualizaPapeisMonitorados ("Entrou")
        dialog.close();
    }

    const listaDePapeis = useMemo(() => {
        return listaDePapeisAPI.map (item => {
            return {
                label: item.codigo + " - " + item.descricao,
                value: item.codigo
            } 
        })
    },[listaDePapeisAPI]);

    useEffect(() => {
        getListaAtivosMonitorar()
    },[idUsuario]); 
    return (
        <ModalContent>
            <Select
                options ={ listaDePapeis }
                onChange={(e) => { setPapelSelecionado(e!.value) }}
            />
            <br/>
            <Button
                style = {{
                    border:"solid 1px black",
                    float: "right",
                        }}
                color="primary"
                onClick={() => {
                        alteraListaPapel("1");
                    }}
                    >
                    Confirmar
            </Button>
            <br/>
            <br/>

        </ModalContent>
    );
}

export default InvestmentAddModal;