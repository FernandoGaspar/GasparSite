import axios from 'axios';
import React, {useEffect, useMemo, useState} from 'react';
import { URL_API } from '../../repositories/baseAPI';
import { FaSearchengin } from 'react-icons/fa';
import formatDate from '../../utils/formatDate';
import moment from "moment";

import {
    Container,
} from './styles';

interface IDataResultadoAnaliticoPost {
    idAtividade: number
    Apelido: string
    Atividade: string
    DataHoraInicio: string
    DataHoraFim: string
    Tempo: string
    
}

interface IDataResultado {
    idUsuario: string
    Treinos: string
}

interface IDataStatusTreino {
    TreinoAtivo: string
    idAtividade: string
    DataHoraInicio: string
    
}

const Health: React.FC = () => {
    const [treinoIniciado, setTreinoIniciado] = useState<boolean>(false);
    const idUsuario = localStorage.getItem('@minha-carteira:usuarioId') as string;
    const [dataPost, setDataPost] = useState<IDataResultadoAnaliticoPost[]>([]);
    const [atualizar, setAtualizar] = useState<number>(0);

    const [dataPostStatusTreino, setDataPostStatusTreino] = useState<IDataStatusTreino[]>([]);
    const [dataResultado, setDataResultado] = useState<IDataResultado[]>([]);

    const resultadoFernando = useMemo(() => {
        let resultado = "0"
        if (dataResultado.length > 0){
            resultado =  dataResultado.filter(item => {
                return (item.idUsuario == "1")
            })[0].Treinos    
        }

        return resultado;
    },[dataResultado]);

    const resultadoCintia = useMemo(() => {
        let resultado = "0"

        if (dataResultado.length > 0){
            resultado =  dataResultado.filter(item => {
                return (item.idUsuario == "2")
            })[0].Treinos    
        }

        return resultado;
    },[dataResultado]);

    const horaInicioAtividade = useMemo(() => {
        let resultado = "0"

        if (dataPostStatusTreino.length > 0){
            resultado =  dataPostStatusTreino[0].DataHoraInicio    
        }

        return resultado;
    },[dataPostStatusTreino]);

    const tempoAtividade = useMemo(() => {
        let resultado = "0"
        const startDate = moment(horaInicioAtividade).add(3, 'hour');
        const agora = moment();
        const diff = agora.diff(startDate);
        const diffDuration = moment.duration(diff);

        if (diffDuration.hours() > 0){
            resultado = ("00" + diffDuration.hours()).slice(-2)+":"+("00" + diffDuration.minutes()).slice(-2)+":"+("00" + diffDuration.seconds()).slice(-2)
        } else{
            resultado = ("00" + diffDuration.minutes()).slice(-2)+":"+("00" + diffDuration.seconds()).slice(-2)
        }
        return resultado;
    },[horaInicioAtividade, atualizaData, atualizar]);

    async function atualizaData () {
        let valor = 0
        while (1 == 1){
            valor = valor + 1   
            setAtualizar(valor);                 
            await timeout(1000);
        }
    }

    function timeout(delay: number) {
        return new Promise( res => setTimeout(res, delay) );
    }

    const handleChangeTreinoIniciado = ()=>{        
        setTreinoIniciado(!treinoIniciado);
        mudarTreino ();
        getResultadoTreinos();

    }

    const mudarTreino = () => {
        axios.post (URL_API+"/mudarTreino", {
            headers: {"Access-Control-Allow-Origin": "*"},
            usuario: idUsuario,
            acao: treinoIniciado,
        })
        .then((response) => {
            const { data } = response
            setDataPostStatusTreino(JSON.parse(data))  
        })
        .catch((error) => {
          console.log(error)
        })
    }

    const getStatusTreino = async () => {
        await axios.post (URL_API+"/getTreino", {
            headers: {"Access-Control-Allow-Origin": "*"},
            usuario: idUsuario,
        })
        .then((response) => {
            const { data } = response
            setDataPostStatusTreino(JSON.parse(data))  

            if (JSON.parse(data)[0].TreinoAtivo == "0"){
                setTreinoIniciado(true)
            }

        })
        .catch((error) => {
          console.log(error)
        })
    }

    const getResultadoTreinos = () => {
        axios.post (URL_API+"/getResultadoTreino", {
            headers: {"Access-Control-Allow-Origin": "*"},
            usuario: idUsuario,
        })
        .then((response) => {
            const { data } = response
            setDataResultado(JSON.parse(data))  
        })
        .catch((error) => {
          console.log(error)
        })
    }

    const getResultadoTreinosAnalitico = () => {
        axios.post (URL_API+"/getAnaliticoAtividades", {
            headers: {"Access-Control-Allow-Origin": "*"},
            usuario: idUsuario,
        })
        .then((response) => {
            const { data } = response
            setDataPost(JSON.parse(data))  
        })
        .catch((error) => {
          console.log(error)
        })
    }

    const handleResultadoTreinoAnalitico = () => {
        getResultadoTreinosAnalitico ();
    }

    useEffect(() => {
        getStatusTreino()
        getResultadoTreinos()
        atualizaData()
    },[]); 

    return (
        <Container>
            
            {
                treinoIniciado ?
                <div className="iniciar"
                    onClick={ handleChangeTreinoIniciado }
                >
                    Iniciar treino
                </div>
                :

                <div className="finalizar"
                    onClick={ handleChangeTreinoIniciado }
                >   
                    Finalizar treino 
                    <br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    { tempoAtividade }
                </div>
        }
        <br/>
        <br/>
        <br/>
        
        <div className="resultado">
            Fernando {resultadoFernando} x {resultadoCintia} Cintia 
            &nbsp;
            <FaSearchengin
                onClick={() => {
                    handleResultadoTreinoAnalitico ()
                        }}
            />
        </div>
        {(() => {
                    if (dataPost.length < 2){
                        return <></>
                    }else{
                          return  <div className='tabela'>
                            <table>
                                <thead>
                                    <tr >
                                        <th>Nome</th>
                                        <th>Atividade</th>
                                        <th>Data de Inicio</th>
                                        <th>Data de Finalização</th>
                                        <th>Tempo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {
                                    dataPost.map(item => ( 
                                    <tr key={ item.idAtividade }>
                                        <td>{ item.Apelido } &nbsp;</td>
                                        <td>{ item.Atividade } &nbsp;</td>
                                        <td>{ formatDate(item.DataHoraInicio!, 1) } &nbsp;</td>
                                        <td>{ formatDate(item.DataHoraFim!, 1) } &nbsp;</td>
                                        <td>{ item.Tempo } &nbsp;</td>
                                        
                                    </tr>
                                    ))
                                }  
                                </tbody>
                            </table>    
                        </div>
            
                    }
        
        })()}

        </Container>
    );
}

export default Health;