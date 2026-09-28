import axios from 'axios';
import { URL_API } from '../../repositories/baseAPI';

export type CameraMediaMode = 'snapshot' | 'stream';

export type CameraMediaTicket = {
  ticket: string;
  mode: CameraMediaMode;
  expiresAt: number;
  path: string;
};

export const shouldRetryCameraMedia = (attempts: number) => attempts < 1;

export const issueCameraMediaTicket = async (entityId: string, mode: CameraMediaMode) => {
  const { data } = await axios.post<CameraMediaTicket>(
    `${URL_API}/home-assistant/camera/${encodeURIComponent(entityId)}/media-ticket`,
    { mode },
  );
  if (!data?.ticket || data.mode !== mode || !Number.isFinite(Number(data.expiresAt))) {
    throw new Error('A API retornou um ticket de mídia inválido.');
  }
  return data;
};

export const buildCameraMediaUrl = (
  entityId: string,
  mode: CameraMediaMode,
  ticket: string,
  cacheVersion?: number,
) => {
  const query = new URLSearchParams({ mode, media_ticket: ticket });
  if (cacheVersion !== undefined) query.set('v', String(cacheVersion));
  return `${URL_API}/home-assistant/camera/${encodeURIComponent(entityId)}?${query.toString()}`;
};
