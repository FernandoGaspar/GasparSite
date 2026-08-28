import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import LoadingIcons from 'react-loading-icons';
import 'leaflet/dist/leaflet.css';

import TrackerCard from '../../components/TrackerCard';
import { URL_API } from '../../repositories/baseAPI';
import formatDate from '../../utils/formatDate';
import { Container } from './styles';

interface TrackedDevice {
  idRastreador: string;
  deviceId: string;
  deviceName: string;
  devicetime: string;
  lastUpdate: string;
  latitude: number;
  longitude: number;
  statusName: string;
}

function MapView({ latitude, longitude }: { latitude: number; longitude: number }) {
  const map = useMap();
  useEffect(() => { map.setView([latitude, longitude], 20); }, [latitude, longitude, map]);
  return null;
}

const Tracker: React.FC = () => {
  const [devices, setDevices] = useState<TrackedDevice[]>([]);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const blueIcon = useMemo(() => L.icon({ iconUrl: 'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|abcdef&chf=a,s,ee00FFFF' }), []);
  const redIcon = useMemo(() => L.icon({ iconUrl: 'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E5%8D%B1|FF0000|000000' }), []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get<TrackedDevice[]>(`${URL_API}/tracker/devices`);
      setDevices(data);
      if (data[0]) setSelected([Number(data[0].latitude), Number(data[0].longitude)]);
    } catch {
      setError('Não foi possível carregar os rastreadores.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Container><LoadingIcons.TailSpin /></Container>;
  if (error || !selected) return <Container><p>{error || 'Nenhum rastreador disponível.'}</p><button onClick={load}>Tentar novamente</button></Container>;

  return <Container>
    <MapContainer center={selected} zoom={20} scrollWheelZoom={false} style={{ height: '65vh', width: '100%', zIndex: 1 }}>
      <MapView latitude={selected[0]} longitude={selected[1]} />
      <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {devices.map(item => <Marker key={item.deviceId} position={[item.latitude, item.longitude]} icon={item.statusName === 'Online' ? blueIcon : redIcon}>
        <Popup>{item.deviceName}<br />{formatDate(item.devicetime, 1)}</Popup>
      </Marker>)}
    </MapContainer>
    {devices.map(item => <TrackerCard key={item.deviceId} nome={item.deviceName} status={item.statusName} ultimaAtualizacao={item.lastUpdate} longitude={item.longitude} latitude={item.latitude} handleView={(longitude, latitude) => setSelected([latitude, longitude])} />)}
  </Container>;
};

export default Tracker;
