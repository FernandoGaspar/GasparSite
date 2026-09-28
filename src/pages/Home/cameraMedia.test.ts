import axios from 'axios';
import { buildCameraMediaUrl, issueCameraMediaTicket, shouldRetryCameraMedia } from './cameraMedia';

jest.mock('axios', () => ({ __esModule:true, default:{ post:jest.fn() } }));
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ephemeral camera media tickets', () => {
  beforeEach(() => jest.clearAllMocks());

  it('issues a ticket through an authenticated API command', async () => {
    mockedAxios.post.mockResolvedValue({data:{ticket:'short-lived',mode:'snapshot',expiresAt:1893456000,path:'/camera'}} as any);
    await expect(issueCameraMediaTicket('camera.garagem','snapshot')).resolves.toEqual(expect.objectContaining({ticket:'short-lived'}));
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/home-assistant/camera/camera.garagem/media-ticket'),
      {mode:'snapshot'},
    );
  });

  it('builds a media URL without the bearer token or user id', () => {
    const url=buildCameraMediaUrl('camera.frente','stream','signed ticket',123);
    expect(url).toContain('mode=stream');
    expect(url).toContain('media_ticket=signed+ticket');
    expect(url).toContain('v=123');
    expect(url).not.toContain('token=');
    expect(url).not.toContain('user_id=');
  });

  it('rejects malformed ticket responses', async () => {
    mockedAxios.post.mockResolvedValue({data:{ticket:'',mode:'stream',expiresAt:0,path:''}} as any);
    await expect(issueCameraMediaTicket('camera.frente','stream')).rejects.toThrow('ticket de mídia inválido');
  });

  it('allows exactly one ticket refresh after a media load failure', () => {
    expect(shouldRetryCameraMedia(0)).toBe(true);
    expect(shouldRetryCameraMedia(1)).toBe(false);
  });
});
