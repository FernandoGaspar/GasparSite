import React, {useEffect, useMemo, useState} from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css';
import L from "leaflet";
import { URL_API_HOME } from '../../repositories/baseAPI';
import axios from 'axios';
import LoadingIcons from 'react-loading-icons'
import formatDate from '../../utils/formatDate';

import {
    Container,
} from './styles';


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
    const position = [-23.4390, -46.8323]
    const BlueIcon = L.icon({ iconUrl: "https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|abcdef&chf=a,s,ee00FFFF" });
    const RedIcon = L.icon({ iconUrl: "https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E5%8D%B1|FF0000|000000" });
    const [dispositivosRastreados, setDispositivosRastreados] = useState<IDispositivosRastreados[]>([]);

    const getDispositivosRastreados = () => {
        axios.post (URL_API_HOME+"/rastreadorDispositivos", {
        })
        .then((response) => {
            const { data } = response
            setDispositivosRastreados(JSON.parse(data))  
            // console.log (dispositivosRastreados)
        })
        .catch((error) => {
          console.log(error)
        })
    }
    
    const loading = useMemo(() => {
        if (dispositivosRastreados.length < 1){
            return true;
        } else {
            return false;
        }
    },[dispositivosRastreados, getDispositivosRastreados]); 

    const lontitudeView = useMemo(() => {
        let longitude = -46.8323
        if (typeof(dispositivosRastreados) !== undefined) {
            longitude = dispositivosRastreados[0]?.longitude
        }
        return longitude
    },[dispositivosRastreados, getDispositivosRastreados]);

    const latitudeView = useMemo(() => {
        let latitude = -23.4390
        if (typeof(dispositivosRastreados) !== undefined) {
            latitude = dispositivosRastreados[0]?.latitude
        }
        return latitude
    },[dispositivosRastreados, getDispositivosRastreados]);

    function returnIconObject (status: String){
        if (status == "Online"){
            return BlueIcon
        }else {
            return RedIcon
        }
    }
    useEffect(() => {
        getDispositivosRastreados()
        // console.log (dispositivosRastreados[0].latitude)
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
            zoom={18} 
            scrollWheelZoom={false}
            style={{ height: '100vh', width: '100%', zIndex:1 }}>
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

        </Container>
    );
}

export default Tracker;