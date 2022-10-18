import React, { useEffect, useMemo } from 'react';
import { Container }  from './styles';
import formatDate from '../../utils/formatDate';

interface ITrackerCardProps {
    nome: string;
    status: string;
    ultimaAtualizacao: string;
    longitude: number;
    latitude: number;
    handleView: (longitude: number, latitude: number) => void
    
}
    const TrackerCard: React.FC<ITrackerCardProps> = ({
        nome,
        status,
        ultimaAtualizacao,
        longitude,
        latitude,
        handleView, 
    }
    ) => (
          <Container>
            <div onClick={ e => handleView (longitude, latitude) }>
                <span>{nome}</span>
                <span>{status}</span>
                <span>{formatDate(ultimaAtualizacao, 1)}</span>
           </div>

            
          </Container>
      );

export default TrackerCard;

