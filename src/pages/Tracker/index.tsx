import React, {useEffect, useMemo, useState} from 'react';
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
// import 'leaflet/dist/leaflet.css';
// import L from "leaflet";
import { URL_API_HOME } from '../../repositories/baseAPI';

import {
    Container,
} from './styles';
import axios from 'axios';

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
    // const BlueIcon = L.icon({ iconUrl: "https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|abcdef&chf=a,s,ee00FFFF" });
    // const RedIcon = L.icon({ iconUrl: "https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E5%8D%B1|FF0000|000000" });
    const [dispositivosRastreados, setDispositivosRastreados] = useState<IDispositivosRastreados[]>([]);

    const getDispositivosRastreados = () => {
        axios.post (URL_API_HOME+"/rastreadorDispositivos", {
        })
        .then((response) => {
            const { data } = response
            setDispositivosRastreados(JSON.parse(data))  
            console.log (dispositivosRastreados)
        })
        .catch((error) => {
          console.log(error)
        })
    }

    // const longitude = useMemo(() => {
    //     return dispositivosRastreados[0].longitude
    // },[dispositivosRastreados, getDispositivosRastreados]);

    // const latitude = useMemo(() => {
    //     console.log(dispositivosRastreados[0].latitude)
    //     // return dispositivosRastreados[0].latitude
    //     return -23.4390
    // },[dispositivosRastreados, getDispositivosRastreados]);

    useEffect(() => {
        getDispositivosRastreados()
    },[]); 
    
    return (
        <div>

        </div>
    //     <MapContainer 
    //         center={[-23.4390, -46.8323]} 
    //         zoom={13} 
    //         scrollWheelZoom={false}
    //         style={{ height: '100vh', width: '100%', zIndex:1 }}>
    //     <TileLayer
    //         attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    //         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    //         />
    //         {
    //             dispositivosRastreados.map(item => (
    //                 <Marker position={[item.latitude, item.longitude]}
    //                     icon={RedIcon}>
    //                     <Popup>
    //                         {item.deviceName}
    //                         {item.devicetime}
    //                     </Popup>
    //                 </Marker>
    //                     ))
    //         }     
    // </MapContainer>
    );
}

export default Tracker;