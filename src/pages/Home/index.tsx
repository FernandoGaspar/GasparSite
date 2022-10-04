import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import { URL_API_HOME } from '../../repositories/baseAPI';
import LoadingIcons from 'react-loading-icons'
import Switch from "react-switch";

import {
    Container,
} from './styles';
import { FaSearchengin } from 'react-icons/fa';
import DevicesHomeGroup from '../../components/DevicesHomeGroup';

interface IDataDevicesHome {
    codeid: string
    Key: string
    dispositivo: string
    exibir: string
    ambiente: string
    piso: string
    ordem: string
}

const Home: React.FC = () => {
    const [homeDevices, setHomeDevices] = useState<IDataDevicesHome[]>([]);
    const [classCSSSearch, setClassCSSSearch] = useState<string>('tag-search-close');
    const [filtroTexto, setFiltroTexto] = useState<string>("");
    const [statusCasa, setStatusCasa] = useState<boolean>(false);

    const getDispositivos = () => {
        axios.post (URL_API_HOME + "/listarDispositivos", {
            headers: {"Access-Control-Allow-Origin": "*"},
        })
        .then((response) => {
            const { data } = response           
            setHomeDevices(JSON.parse(data))
        })
        .catch((error) => {
          console.log(error)
        })
    }

    const atualizaDispositivos = () => {
        axios.post (URL_API_HOME + "/atualizarDispositivos", {
            headers: {"Access-Control-Allow-Origin": "*"},
        })
        .then((response) => {
            const { data } = response           
            setHomeDevices(JSON.parse(data))
        })
        .catch((error) => {
          console.log(error)
        })
    }

    const handleStatusCasa = (nextChecked: boolean | ((prevState: boolean) => boolean)) => {
        let URL_API_REGRA = ""
        if (nextChecked === true) {
          URL_API_REGRA = URL_API_HOME + "/ligarTudo"
        } else {
          URL_API_REGRA = URL_API_HOME + "/desligarTudo"
        }
          axios.post (URL_API_REGRA, {
              headers: {"Access-Control-Allow-Origin": "*"}
          })
          .then((response) => {
            const { data } = response
            if (response.status != 200){
                setStatusCasa(true)
            }
          })
          .catch((error) => {
            console.log(error)
          })    
      }
    
    const dispositivosFiltrados = useMemo(() => {
        let dadoFiltrado = []
        let dadoOrdenado = []

        dadoFiltrado =  homeDevices.filter(item => {
            return (!item.dispositivo.includes("EKAZA Smart HUB")
                    && !item.dispositivo.includes("Motion Sensor")
                    && !item.dispositivo.includes("Multi-mode Gateway")
                    && item.dispositivo.toUpperCase().includes(filtroTexto!.toUpperCase())
                    
            )
        })
        dadoOrdenado = homeDevices.sort ((a, b) => (a.ordem > b.ordem) ? 1 : -1)
        return dadoOrdenado

    },[homeDevices, filtroTexto]);

    const ambienteDistinct = useMemo(() => {
        return dispositivosFiltrados.map(item => item.ambiente)
                .filter((value, index, self) => self.indexOf(value) === index)
    }, [dispositivosFiltrados]);

    function handleSearch (){
        if (classCSSSearch === "tag-search-open") {
            setClassCSSSearch('tag-search-close')
            setFiltroTexto("")
        } else {
            setClassCSSSearch('tag-search-open')
        }
    }

    const loading = useMemo(() => {
        if (ambienteDistinct.length < 1){
            return true;
        } else {
            return false;
        }
    },[ambienteDistinct, getDispositivos]); 

    useEffect(() => {
        getDispositivos()
        atualizaDispositivos()
    },[]); 

    return (
        
        <Container>
            {
                loading ?
                <div>
                </div>
                :
                <div>   
                    <FaSearchengin
                        style={{
                            fontSize: "35px"
                        }}   
                        onClick={() => {
                            handleSearch ()
                        }}
                        />
                    <input 
                        className={`    
                        ${ classCSSSearch }`}
                        onChange={(e) => setFiltroTexto(e.target.value)}
                        >
                    </input>

                    <Switch 
                        onChange={ (e) => handleStatusCasa(!statusCasa)} 
                        checked={ statusCasa }
                        className="react-switch"
                        />
                </div>
                
            }

            {
                loading ?
                <div>
                    <LoadingIcons.TailSpin />
                </div>
                :
                ambienteDistinct.map(item => (
                    <DevicesHomeGroup
                        key = { Math.random() }
                        ambiente = { item }
                        listaDispositivos = { homeDevices }
                        setStatusCasa = { setStatusCasa }
                        statusCasa = { statusCasa }
                        >
                    </DevicesHomeGroup>
                ))
            }   

        </Container>
    );
}

export default Home;