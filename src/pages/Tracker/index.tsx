import React, {useEffect, useMemo, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap  } from 'react-leaflet'

import 'leaflet/dist/leaflet.css';
import L, { map } from "leaflet";
import { URL_API_HOME } from '../../repositories/baseAPI';
import axios from 'axios';
import LoadingIcons from 'react-loading-icons'
import formatDate from '../../utils/formatDate';

import {
    Container,
} from './styles';
import TrackerCard from '../../components/TrackerCard';

interface IDispositivosRastreados {
    idRastreador: string
    deviceId: string
    deviceName: string
    devicetime: string
    lastUpdate: string
    latitude: number
    longitude: number
    statusName: string
}

const Tracker: React.FC = () => {
    const BlueIcon = L.icon({ iconUrl: "https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|abcdef&chf=a,s,ee00FFFF" });
    const RedIcon = L.icon({ iconUrl: "https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E5%8D%B1|FF0000|000000" });
    const [dispositivosRastreados, setDispositivosRastreados] = useState<IDispositivosRastreados[]>([]);
    const [lontitudeView, setLontitudeView] = useState<number>(0);
    const [latitudeView, setLatitudeView] = useState<number>(0);

    const getDispositivosRastreados = () => {
        axios.post (URL_API_HOME+"/rastreadorDispositivos", {
        })
        .then((response) => {
            const { data } = response
            setDispositivosRastreados(JSON.parse(data))  
            setLatitudeView (JSON.parse(data)[0]?.latitude)
            setLontitudeView (JSON.parse(data)[0]?.longitude)

        })
        .catch((error) => {
          console.log(error)
        })
    }
    
    const loading = useMemo(() => {
        if (dispositivosRastreados.length < 1 || lontitudeView == 0 || latitudeView == 0){
            return true;
        } else {
            return false;
        }
    },[dispositivosRastreados, getDispositivosRastreados]); 

    function returnIconObject (status: String){
        if (status == "Online"){
            return BlueIcon
        }else {
            return RedIcon
        }
    }
    
    const handleView = (longitude: number, latitude: number) =>{
        setLontitudeView (longitude)
        setLatitudeView (latitude)
        console.log ("Entrou aqui")
        ChangeView()
    }
    
    function ChangeView() {
        var latlng = L.latLng(latitudeView, lontitudeView);
        const map = useMap();
        map.setView(latlng, 20);
        return null;
      }
            
    useEffect(() => {
        getDispositivosRastreados()
    },[]); 
    
    return (
        <Container>

        {
                loading ?
                <div>
                    <LoadingIcons.TailSpin />
                </div>
                :

        <MapContainer 
            center={[latitudeView, lontitudeView]} 
            zoom={20} 
            scrollWheelZoom={false}
            style={{ height: '65vh', width: '100%', zIndex:1 }}>
        <ChangeView />
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {
                dispositivosRastreados.map(item => (
                    <Marker 
                        key={item.deviceId}
                        position={[item.latitude, item.longitude]}
                        icon={ returnIconObject (item.statusName) }>
                        <Popup>
                            {item.deviceName}
                            <br/>
                            {formatDate(item.devicetime, 1)}
                        </Popup>
                    </Marker>
                        ))
            }
             
        </MapContainer>

        }
        
        {
                dispositivosRastreados.map(item => (
                    <TrackerCard 
                        key={ item.deviceId }
                        nome={ item.deviceName } 
                        status={ item.statusName }  
                        ultimaAtualizacao={ item.lastUpdate }
                        longitude = { item.longitude }
                        latitude = { item.latitude }                        
                        handleView={ handleView }
                        />
                        ))
        }     
        
        </Container>
    );
}

export default Tracker;
