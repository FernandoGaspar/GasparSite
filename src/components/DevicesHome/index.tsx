import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import Switch from "react-switch";
import { URL_API_HOME } from '../../repositories/baseAPI';
import { Container }  from './styles';
import LoadingIcons from 'react-loading-icons'

interface IDevicesHomeProps {
  id: string;
  chave: string;
  name: string;
  setStatusAmbiente(statusAmbiente: boolean): void;
  atualizarAmbiente: boolean;
  setAtualizarAmbiente(statusAmbiente: boolean): void;
}

interface IDataInterruptoresDevice {
  code: string
  value: boolean
}

const DevicesHome: React.FC<IDevicesHomeProps> = ({
  id,
  chave,
  name,
  setStatusAmbiente,
  atualizarAmbiente,
  setAtualizarAmbiente
}) => {
  const [interruptores, setInterruptores] = useState<IDataInterruptoresDevice[]>([]);
  const [loadingDispositivo, setLoadingDispositivo] = useState<boolean>(true);
  const [loadingInterruptores, setLoadingInterruptores] = useState<boolean>(false);
  
  const getInterruptoresDispositivos = () => {
    setLoadingInterruptores (true)
    setLoadingDispositivo (true)
    axios.post (URL_API_HOME + "/listarInterruptoresDispositivos", {
        headers: {"Access-Control-Allow-Origin": "*"},
        idDispositivo: id
    })
    .then((response) => {
        const { data } = response
        setInterruptores (data) 
        setLoadingInterruptores (false)
        setLoadingDispositivo (false)
        setAtualizarAmbiente (false)
    })
    .catch((error) => {
      console.log(error)
    })
  }
  
  const setDispositivos = (nextChecked: boolean | ((prevState: boolean) => boolean)) => {
    let URL_API_REGRA = ""
    if (statusDispositivo == false) {
      URL_API_REGRA = URL_API_HOME + "/ligarDispositivo"
    } else {
      URL_API_REGRA = URL_API_HOME + "/desligarDispositivo"
    }
    axios.post (URL_API_REGRA, {
        headers: {"Access-Control-Allow-Origin": "*"},
        idDispositivo: id
    })
    .then((response) => {
      const { data } = response

      if (response.status == 200){
        interruptores.forEach (item => {  
          let i = interruptores.findIndex(x => x.code === item.code);
          let add = {code: item.code, value: true}
          interruptores.splice(i, 1);  
          setInterruptores ([...interruptores, add])
          
        })
        // setStatusDispositivo (!!nextChecked)
      }
      setLoadingDispositivo (false)
    })
    .catch((error) => {
      console.log(error)
    })
  }

  const setInterruptorDispositivo = (dispositivo: string, nextChecked: boolean | ((prevState: boolean) => boolean)) => {
    let URL_API_REGRA = ""
    if (!nextChecked == false) {
      URL_API_REGRA = URL_API_HOME + "/ligarInterruptorDispositivo"
    } else {
      URL_API_REGRA = URL_API_HOME + "/desligarInterruptorDispositivo"
    }
    axios.post (URL_API_REGRA, {
        headers: {"Access-Control-Allow-Origin": "*"},
        idDispositivo: id,
        code: dispositivo
    })
    .then((response) => {
        const { data } = response
        if (response.status == 200){
          let i = interruptores.findIndex(x => x.code === dispositivo);
          interruptores.splice(i, 1);          
          let obj = {"code": dispositivo, "value": !!nextChecked}
          setInterruptores([...interruptores, obj])
        }else{
          let i = interruptores.findIndex(x => x.code === dispositivo);
          interruptores.splice(i, 1);
          let obj = {"code": dispositivo, "value": !nextChecked}
          setInterruptores([...interruptores, obj])          
        }
    })
    .catch((error) => {
      console.log(error)
    })
  }

  const interruptoresStatus = useMemo(() => { 
    return interruptores
  },[interruptores, setDispositivos, getInterruptoresDispositivos]);  

  const statusDispositivo = useMemo(() => {  
    let status = false 
    interruptores.forEach (item => {
      if (item.value == true){
        status = true
      }
    })
    return status
  },[interruptores, getInterruptoresDispositivos]);  

  useEffect(() => {
    getInterruptoresDispositivos ()
    
    //Return status agrupamento
    if (statusDispositivo == false){
      setStatusAmbiente (false)  
    } else {
      setStatusAmbiente (true)  
    }
  },[statusDispositivo, atualizarAmbiente]); 

  return (
      
        <Container>
          <header>
            <h1>
              { name }
            </h1>
          </header>
          <div>
          {
            loadingDispositivo ?
                  <div>
                      <LoadingIcons.TailSpin />
                  </div>
                  :

                    <Switch 
                      onChange={ (e) => setDispositivos(!statusDispositivo) } 
                      checked={ !!statusDispositivo } 
                      className="react-switch"
                      />
          }
          </div>
          <div style={{ 
                    alignSelf: "center"
                  }}>
          {
            loadingInterruptores ?
            <div>
                <LoadingIcons.TailSpin />
            </div>
            :
            interruptoresStatus.map(item => (
              <span key={ item.code + Math.random() }>
              <Switch 
                      onChange={(e) => setInterruptorDispositivo(item.code, !item.value)} 
                      checked={ item.value } 

                      />
              </span>
            ))
          }

          </div>
          <footer>

          </footer>
        </Container>
        

      );
    }

export default DevicesHome;

