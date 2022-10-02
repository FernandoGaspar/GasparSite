import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Container }  from './styles';
import {Collapse} from 'react-collapse';
import Button from '@material-ui/core/Button';
import Switch from "react-switch";
import { BsChevronDoubleDown } from "react-icons/bs"
import { BsChevronDoubleRight } from "react-icons/bs"

import DevicesHome from '../DevicesHome';
import { URL_API_HOME } from '../../repositories/baseAPI';

interface IDataDevicesHome {
  codeid: string
  dispositivo: string
  ambiente: string
  ordem: string
  exibir: string
  piso: string
}

interface IDevicesHomeGroupProps {
  ambiente: string
  listaDispositivos: IDataDevicesHome[]
  setStatusCasa(statusAmbiente: boolean): void;
  statusCasa: boolean;
}

const DevicesHomeGroup: React.FC<IDevicesHomeGroupProps> = ({
  ambiente, 
  listaDispositivos,
  setStatusCasa,
  statusCasa
}) => {
  const [statusCollapse, setStatusCollapse] = useState<boolean>(false);
  const [statusAmbiente, setStatusAmbiente] = useState<boolean>(false);
  const [atualizarAmbiente, setAtualizarAmbiente] = useState<boolean>(false);
  const [erroAlterarAmbiente, setErroAlterarAmbiente] = useState<boolean>(false);
  
  const  dispositivosFiltrados = useMemo(() => {
    let dadoFiltrado = []
    let dadoOrdenado = []
    dadoFiltrado =  listaDispositivos.filter(item => {
          return (item.ambiente.includes(ambiente))
    })
    dadoOrdenado = dadoFiltrado.sort ((a, b) => (a.ordem > b.ordem) ? 1 : -1)
    return dadoOrdenado

  },[listaDispositivos, ambiente]);

  const handleStatusAmbiente = (nextChecked: boolean | ((prevState: boolean) => boolean)) => {
    let URL_API_REGRA = ""
    if (nextChecked === true) {
      URL_API_REGRA = URL_API_HOME + "/ligarDispositivo"
    } else {
      URL_API_REGRA = URL_API_HOME + "/desligarDispositivo"
    }
    dispositivosFiltrados.forEach(item => {
      axios.post (URL_API_REGRA, {
          headers: {"Access-Control-Allow-Origin": "*"},
          idDispositivo: item.codeid
      })
      .then((response) => {
        if (response.status != 200){
          setErroAlterarAmbiente(true)
        }
      })
      .catch((error) => {
        console.log(error)
      })
     })    
     if (erroAlterarAmbiente == false){
      setStatusAmbiente (nextChecked)
      setAtualizarAmbiente(true)
    }
    setErroAlterarAmbiente (false)
  }

  useEffect(() => {
    if (statusAmbiente == true && statusCasa == false){
      setStatusCasa (true)
    }
  },[statusAmbiente, statusCasa]); 

  return (
        <Container>
          <div className={`divRow`}>  
            <Button
                onClick={() => {setStatusCollapse(!statusCollapse);}}
                className={`button`}
              >
                <div>{ ambiente }</div>
            </Button>
            <Switch 
                onChange={ (e) => handleStatusAmbiente(!statusAmbiente)} 
                checked={ statusAmbiente }
                  />
            {
              statusCollapse ?
              <BsChevronDoubleRight
                  onClick={() => {setStatusCollapse(!statusCollapse);}} 
                  className={`doubleArrow`}/>
                  :
                  <BsChevronDoubleDown
                  onClick={() => {setStatusCollapse(!statusCollapse);}} 
                  className={`doubleArrow`} />
                }
          </div>
          <div className={`divLine`} />
          <Collapse 
              isOpened={ statusCollapse }
              className={`collapse`}
            >

            {
              dispositivosFiltrados.map(item => (
                <DevicesHome 
                  key = { item.codeid }
                  id= { item.codeid }
                  chave = { item.codeid }
                  name = { item.dispositivo }
                  atualizarAmbiente = { atualizarAmbiente }
                  setAtualizarAmbiente = { setAtualizarAmbiente }
                  setStatusAmbiente = { setStatusAmbiente }
                >
                </DevicesHome>
                ))
              }   
          </Collapse>
          

        </Container>
        

      );
    }

export default DevicesHomeGroup;

