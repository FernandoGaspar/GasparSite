import React, { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import { ModalContent, useDialog } from 'react-st-modal';
import { Button } from '@mui/material';

import axios from 'axios';
import { URL_API } from '../../repositories/baseAPI';

interface IIvestmentAddModalProps {
    atualizaPapeisMonitorados: (arg: string) => void | Promise<void>
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
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const dialog = useDialog();

    const getListaAtivosMonitorar = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await axios.get<{ items: IPapeis[] }>(`${URL_API}/investments/watchlist/options`);
            setListaDePapeisAPI(data.items || []);
        } catch (requestError: any) {
            setError(requestError.response?.data?.message || 'Não foi possível carregar os ativos disponíveis.');
        } finally {
            setLoading(false);
        }
    }

    const adicionaPapel = async () => {
        if (!papelSelecionado) return;
        setSaving(true);
        setError('');
        try {
            await axios.post(`${URL_API}/investments/watchlist`, { codigo: papelSelecionado });
            await atualizaPapeisMonitorados("Entrou");
            dialog.close();
        } catch (requestError: any) {
            setError(requestError.response?.data?.message || 'Não foi possível adicionar o papel.');
        } finally {
            setSaving(false);
        }
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
    },[]);
    return (
        <ModalContent>
            <Select
                options ={ listaDePapeis }
                onChange={(e) => { setPapelSelecionado(e!.value) }}
                isDisabled={loading || saving}
                placeholder={loading ? 'Carregando ativos…' : 'Busque pelo código ou nome'}
                noOptionsMessage={() => 'Nenhum ativo encontrado'}
            />
            {error && <p style={{ color: '#c94a5a', marginTop: 12 }}>{error}</p>}
            <br/>
            <Button
                style = {{
                    border:"solid 1px black",
                    float: "right",
                }}
                color="primary"
                disabled={!papelSelecionado || loading || saving}
                onClick={adicionaPapel}
                    >
                    {saving ? 'Adicionando…' : 'Confirmar'}
            </Button>
            <br/>
            <br/>

        </ModalContent>
    );
}

export default InvestmentAddModal;
