import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import {
  FiActivity,
  FiCamera,
  FiCloud,
  FiCoffee,
  FiEdit3,
  FiEye,
  FiEyeOff,
  FiHome,
  FiLoader,
  FiPlus,
  FiPower,
  FiRefreshCw,
  FiSearch,
  FiSun,
  FiTrash2,
  FiVolume2,
  FiWifi,
  FiWind,
  FiX,
} from "react-icons/fi";
import { URL_API } from "../../repositories/baseAPI";
import { Container } from "./styles";

interface HomeAssistantState {
  entity_id: string;
  state: string;
  attributes: {
    friendly_name?: string;
    current_temperature?: number;
    temperature?: number;
    volume_level?: number;
    supported_features?: number;
    camera_snapshot_url?: string;
    camera_stream_url?: string;
  };
}
interface Device extends HomeAssistantState {
  name: string;
  room: string;
  domain: string;
  isOn: boolean;
}
interface Camera extends HomeAssistantState {
  name: string;
}

const controllableDomains = [
  "light",
  "switch",
  "fan",
  "input_boolean",
  "climate",
  "media_player",
];
const deviceTypeLabels: Record<string, string> = {
  all: "Todos os tipos",
  light: "Iluminação",
  switch: "Interruptores",
  fan: "Ventiladores",
  climate: "Ar-condicionado",
  media_player: "Televisões",
  input_boolean: "Automações",
  camera: "Câmeras",
};
const assignmentStorageKey = "@minha-carteira:home-room-assignments";
const roomsStorageKey = "@minha-carteira:home-custom-rooms";
const priorityStorageKey = "@minha-carteira:home-device-priorities";
const roomOrderStorageKey = "@minha-carteira:home-room-orders";
const hiddenDeviceStorageKey = "@minha-carteira:home-hidden-devices";

const roomFromName = (name: string) => {
  const room = name.match(
    /sala de tv|sala de estar|sala de jantar|su[ií]te[^-]*|cozinha|gourmet|corredor|banheiro|lavanderia|escrit[oó]rio|escada|irriga[cç][aã]o/i,
  );
  return room
    ? room[0].replace(/\b\w/g, (letter) => letter.toUpperCase())
    : "Sem cômodo definido";
};
const TvIcon: React.FC = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <rect
      x="3"
      y="5"
      width="18"
      height="12"
      rx="2.5"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M8 21H16M12 17V21M9.2 2.8L12 5.1L14.8 2.8"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7 9H17"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      opacity=".55"
    />
  </svg>
);
const duplicateDeviceKey = (device: Device) =>
  `${device.entity_id.split(".")[1].replace(/(_\d+)_\d+$/, "$1")}:${device.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()}`;
const duplicateDevicePriority = (device: Device) =>
  device.domain === "light" ? 0 : device.domain === "switch" ? 1 : 2;
const iconFor = (device: Device) => {
  if (device.domain === "fan" || /ar.?condicionado/i.test(device.name))
    return <FiWind />;
  if (/cafe|peixe|gato/i.test(device.name)) return <FiCoffee />;
  if (device.domain === "media_player") return <TvIcon />;
  return device.domain === "light" ? <FiSun /> : <FiPower />;
};
const readStoredJson = <T,>(key: string, fallback: T): T => {
  try {
    return JSON.parse(localStorage.getItem(key) || "") as T;
  } catch {
    return fallback;
  }
};

interface ClimateCardProps {
  device: Device;
  updating: boolean;
  organizing: boolean;
  roomOptions: string[];
  priority: number | undefined;
  onSetState(device: Device, state: "on" | "off"): void;
  onSetTemperature(device: Device, temperature: number): void;
  onMove(entityId: string, room: string): void;
  onPriority(entityId: string, priority: number): void;
  hidden: boolean;
  onVisibility(entityId: string): void;
}

const ClimateCard: React.FC<ClimateCardProps> = ({
  device,
  updating,
  organizing,
  roomOptions,
  priority,
  onSetState,
  onSetTemperature,
  onMove,
  onPriority,
  hidden,
  onVisibility,
}) => {
  const unavailable = ["unavailable", "unknown"].includes(device.state);
  const currentTemperature = device.attributes.current_temperature;
  const targetTemperature = device.attributes.temperature;
  const status = unavailable
    ? "Indisponível"
    : device.isOn
      ? "Climatizando"
      : "Desligado";
  const [selectedTemperature, setSelectedTemperature] = useState(
    targetTemperature || 23,
  );
  const applyTemperature = (temperature: number) => {
    const nextTemperature = Math.min(
      35,
      Math.max(10, Number(temperature) || 23),
    );
    setSelectedTemperature(nextTemperature);
    onSetTemperature(device, nextTemperature);
  };

  return (
    <div
      className={`climate-device ${device.isOn ? "is-on" : ""} ${unavailable ? "unavailable" : ""}`}
    >
      <header>
        <span>
          <FiWind />
        </span>
        <div>
          <small>AR-CONDICIONADO</small>
          <strong>{device.name}</strong>
        </div>
        <em>{status}</em>
      </header>
      <div className="climate-readout">
        <div>
          <span>
            {currentTemperature ?? "--"}
            <sup>°C</sup>
          </span>
          <small>
            {targetTemperature
              ? `ajustado para ${targetTemperature} °C`
              : "temperatura ambiente"}
          </small>
        </div>
      </div>
      <div className="climate-actions">
        <button
          onClick={() => onSetState(device, "on")}
          disabled={updating || unavailable}
        >
          <FiWind /> Ligar
        </button>
        <button
          onClick={() => onSetState(device, "off")}
          disabled={updating || unavailable}
        >
          <FiPower /> Desligar
        </button>
      </div>
      <div className="temperature-control">
        <label>Temperatura desejada</label>
        <div>
          <button
            onClick={() => applyTemperature(selectedTemperature - 1)}
            disabled={updating || unavailable}
            aria-label="Diminuir temperatura"
          >
            −
          </button>
          <span>
            <input
              type="number"
              min="10"
              max="35"
              step="1"
              value={selectedTemperature}
              onChange={(event) =>
                setSelectedTemperature(Number(event.target.value))
              }
              onBlur={() => applyTemperature(selectedTemperature)}
              onKeyDown={(event) =>
                event.key === "Enter" && applyTemperature(selectedTemperature)
              }
              disabled={updating || unavailable}
              aria-label="Temperatura desejada"
            />
            <small>°C</small>
          </span>
          <button
            onClick={() => applyTemperature(selectedTemperature + 1)}
            disabled={updating || unavailable}
            aria-label="Aumentar temperatura"
          >
            +
          </button>
        </div>
      </div>
      {organizing && (
        <div className="device-settings">
          <select
            aria-label={`Mover ${device.name} para outro cômodo`}
            value={device.room}
            onChange={(event) => onMove(device.entity_id, event.target.value)}
          >
            {roomOptions.map((option) => (
              <option value={option} key={option}>
                {option}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            step="1"
            aria-label={`Definir prioridade de ${device.name}`}
            value={priority || ""}
            onChange={(event) =>
              onPriority(
                device.entity_id,
                Math.max(1, Number(event.target.value) || 1),
              )
            }
            placeholder="Ordem"
          />
          <button
            className="visibility-toggle"
            onClick={() => onVisibility(device.entity_id)}
          >
            {hidden ? <FiEye /> : <FiEyeOff />}
            {hidden ? "Exibir" : "Ocultar"}
          </button>
        </div>
      )}
    </div>
  );
};

interface TelevisionCardProps {
  device: Device;
  updating: boolean;
  organizing: boolean;
  roomOptions: string[];
  priority: number | undefined;
  onSetState(device: Device, state: "on" | "off"): void;
  onSetVolume(device: Device, volume: number): void;
  onMove(entityId: string, room: string): void;
  onPriority(entityId: string, priority: number): void;
  hidden: boolean;
  onVisibility(entityId: string): void;
}

const TelevisionCard: React.FC<TelevisionCardProps> = ({
  device,
  updating,
  organizing,
  roomOptions,
  priority,
  onSetState,
  onSetVolume,
  onMove,
  onPriority,
  hidden,
  onVisibility,
}) => {
  const volume = device.attributes.volume_level ?? 0.5;
  const supportsVolume =
    typeof device.attributes.volume_level === "number" ||
    Boolean(Number(device.attributes.supported_features) & (4 | 1024));
  const setVolume = (adjustment: number) =>
    onSetVolume(
      device,
      Math.max(0, Math.min(1, Number((volume + adjustment).toFixed(2)))),
    );

  return (
    <article className={`television-device ${device.isOn ? "is-on" : ""}`}>
      <header>
        <span>
          <TvIcon />
        </span>
        <div>
          <small>TELEVISÃO</small>
          <strong>{device.name}</strong>
        </div>
        <em>{device.isOn ? "Ligada" : "Desligada"}</em>
      </header>
      <div className="television-actions">
        <button
          type="button"
          className="tv-on"
          onClick={() => onSetState(device, "on")}
          disabled={updating || device.isOn}
        >
          <FiPower /> Ligar
        </button>
        <button
          type="button"
          className="tv-off"
          onClick={() => onSetState(device, "off")}
          disabled={updating || !device.isOn}
        >
          <FiPower /> Desligar
        </button>
      </div>
      <div
        className={`television-volume ${supportsVolume ? "" : "unavailable"}`}
      >
        <FiVolume2 />
        <button
          type="button"
          onClick={() => setVolume(-0.05)}
          disabled={updating || !supportsVolume}
          aria-label={`Diminuir volume da ${device.name}`}
        >
          −
        </button>
        <span>
          {supportsVolume
            ? `${Math.round(volume * 100)}%`
            : "Volume indisponível"}
        </span>
        <button
          type="button"
          onClick={() => setVolume(0.05)}
          disabled={updating || !supportsVolume}
          aria-label={`Aumentar volume da ${device.name}`}
        >
          +
        </button>
      </div>
      {organizing && (
        <div className="device-settings">
          <select
            aria-label={`Mover ${device.name} para outro cômodo`}
            value={device.room}
            onChange={(event) => onMove(device.entity_id, event.target.value)}
          >
            {roomOptions.map((option) => (
              <option value={option} key={option}>
                {option}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            step="1"
            aria-label={`Definir prioridade de ${device.name}`}
            value={priority || ""}
            onChange={(event) =>
              onPriority(
                device.entity_id,
                Math.max(1, Number(event.target.value) || 1),
              )
            }
            placeholder="Ordem"
          />
          <button
            className="visibility-toggle"
            onClick={() => onVisibility(device.entity_id)}
          >
            {hidden ? <FiEye /> : <FiEyeOff />}
            {hidden ? "Exibir" : "Ocultar"}
          </button>
        </div>
      )}
    </article>
  );
};

interface CameraCardProps {
  camera: Camera;
  priority: number | undefined;
  hidden: boolean;
  organizing: boolean;
  live: boolean;
  onPriority(entityId: string, priority: number): void;
  onVisibility(entityId: string): void;
  onToggleLive(entityId: string): void;
}

const CameraCard: React.FC<CameraCardProps> = ({
  camera,
  priority,
  hidden,
  organizing,
  live,
  onPriority,
  onVisibility,
  onToggleLive,
}) => {
  const [snapshotVersion, setSnapshotVersion] = useState(() => Date.now());
  const [useProxyFallback, setUseProxyFallback] = useState(false);
  const proxyUrl = `${URL_API}/home-assistant/camera/${encodeURIComponent(
    camera.entity_id,
  )}?mode=${live ? "stream" : "snapshot"}&v=${snapshotVersion}`;
  const directUrl = live
    ? camera.attributes.camera_stream_url
    : camera.attributes.camera_snapshot_url;
  const directUrlWithVersion = directUrl
    ? `${directUrl}${directUrl.includes("?") ? "&" : "?"}v=${snapshotVersion}`
    : "";
  const imageUrl =
    !useProxyFallback && directUrlWithVersion ? directUrlWithVersion : proxyUrl;

  useEffect(() => setUseProxyFallback(false), [camera.entity_id, live]);

  return (
    <article
      className={`camera-card ${hidden ? "is-hidden" : ""} ${live ? "is-live" : ""}`}
    >
      <button
        type="button"
        className="camera-image"
        onClick={() => onToggleLive(camera.entity_id)}
        aria-label={`${live ? "Encerrar" : "Abrir"} ao vivo da câmera ${camera.name}`}
        aria-pressed={live}
        title={live ? "Encerrar transmissão ao vivo" : "Abrir ao vivo"}
      >
        <img
          src={imageUrl}
          alt={`Imagem da câmera ${camera.name}`}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setUseProxyFallback(true)}
        />
        <span>
          {live ? "Ao vivo · clique para encerrar" : "Clique para ao vivo"}
        </span>
      </button>
      <div className="camera-details">
        <div>
          <FiCamera />
          <strong>{camera.name}</strong>
        </div>
        {!live && (
          <button
            type="button"
            className="refresh-camera"
            onClick={() => setSnapshotVersion(Date.now())}
            aria-label={`Atualizar imagem da câmera ${camera.name}`}
            title="Atualizar snapshot"
          >
            <FiRefreshCw />
          </button>
        )}
      </div>
      {organizing && (
        <div className="camera-settings">
          <input
            type="number"
            min="1"
            step="1"
            aria-label={`Definir ordem da câmera ${camera.name}`}
            value={priority || ""}
            onChange={(event) =>
              onPriority(
                camera.entity_id,
                Math.max(1, Number(event.target.value) || 1),
              )
            }
            placeholder="Ordem"
          />
          <button
            type="button"
            className="camera-remove"
            onClick={() => onVisibility(camera.entity_id)}
          >
            <FiTrash2 /> {hidden ? "Restaurar" : "Remover"}
          </button>
        </div>
      )}
    </article>
  );
};

const Home: React.FC = () => {
  const [states, setStates] = useState<HomeAssistantState[]>([]);
  const [search, setSearch] = useState("");
  const [deviceType, setDeviceType] = useState("all");
  const [activeOnly, setActiveOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [roomUpdating, setRoomUpdating] = useState(false);
  const [error, setError] = useState("");
  const [organizing, setOrganizing] = useState(false);
  const [newRoom, setNewRoom] = useState("");
  const [roomAssignments, setRoomAssignments] = useState<
    Record<string, string>
  >(() => readStoredJson(assignmentStorageKey, {}));
  const [customRooms, setCustomRooms] = useState<string[]>(() =>
    readStoredJson(roomsStorageKey, []),
  );
  const [devicePriorities, setDevicePriorities] = useState<
    Record<string, number>
  >(() => readStoredJson(priorityStorageKey, {}));
  const [roomOrders, setRoomOrders] = useState<Record<string, number>>(() =>
    readStoredJson(roomOrderStorageKey, {}),
  );
  const [hiddenDevices, setHiddenDevices] = useState<Record<string, boolean>>(
    () => readStoredJson(hiddenDeviceStorageKey, {}),
  );
  const [preferencesReady, setPreferencesReady] = useState(false);
  const [roomToRename, setRoomToRename] = useState("");
  const [renamedRoom, setRenamedRoom] = useState("");
  const usuarioId = Number(localStorage.getItem("@minha-carteira:usuarioId"));

  const loadStates = async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError("");
    try {
      const response = await axios.get<HomeAssistantState[]>(
        `${URL_API}/home-assistant/states`,
      );
      setStates(response.data);
      if (usuarioId) {
        const preferences = await axios.get<{
          rooms: Array<{ name: string; order?: number; custom: boolean }>;
          devices: Array<{
            entity_id: string;
            room?: string;
            order?: number;
            hidden: boolean;
          }>;
        }>(`${URL_API}/home-assistant/preferences`, { params: { usuarioId } });
        if (preferences.data.rooms.length || preferences.data.devices.length) {
          const assignments = Object.fromEntries(
            preferences.data.devices
              .filter((item) => item.room)
              .map((item) => [item.entity_id, item.room as string]),
          );
          const priorities = Object.fromEntries(
            preferences.data.devices
              .filter((item) => item.order)
              .map((item) => [item.entity_id, item.order as number]),
          );
          const hidden = Object.fromEntries(
            preferences.data.devices
              .filter((item) => item.hidden)
              .map((item) => [item.entity_id, true]),
          );
          const orders = Object.fromEntries(
            preferences.data.rooms
              .filter((item) => item.order)
              .map((item) => [item.name, item.order as number]),
          );
          const custom = preferences.data.rooms
            .filter((item) => item.custom)
            .map((item) => item.name);
          setRoomAssignments(assignments);
          setDevicePriorities(priorities);
          setHiddenDevices(hidden);
          setRoomOrders(orders);
          setCustomRooms(custom);
          localStorage.setItem(
            assignmentStorageKey,
            JSON.stringify(assignments),
          );
          localStorage.setItem(priorityStorageKey, JSON.stringify(priorities));
          localStorage.setItem(hiddenDeviceStorageKey, JSON.stringify(hidden));
          localStorage.setItem(roomOrderStorageKey, JSON.stringify(orders));
          localStorage.setItem(roomsStorageKey, JSON.stringify(custom));
        }
      }
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.message ||
          "Não foi possível conectar ao Home Assistant.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
      setPreferencesReady(true);
    }
  };
  useEffect(() => {
    loadStates();
  }, []);
  useEffect(() => {
    if (!preferencesReady || !usuarioId) return;
    const rooms = Array.from(
      new Set([...customRooms, ...Object.keys(roomOrders)]),
    ).map((name) => ({
      name,
      order: roomOrders[name] || null,
      custom: customRooms.includes(name),
    }));
    const deviceIds = Array.from(
      new Set([
        ...Object.keys(roomAssignments),
        ...Object.keys(devicePriorities),
        ...Object.keys(hiddenDevices),
      ]),
    );
    axios
      .put(`${URL_API}/home-assistant/preferences`, {
        usuarioId,
        rooms,
        devices: deviceIds.map((entity_id) => ({
          entity_id,
          room: roomAssignments[entity_id] || null,
          order: devicePriorities[entity_id] || null,
          hidden: !!hiddenDevices[entity_id],
        })),
      })
      .catch(() =>
        setError("Não foi possível salvar as preferências da Casa."),
      );
  }, [
    preferencesReady,
    usuarioId,
    customRooms,
    roomOrders,
    roomAssignments,
    devicePriorities,
    hiddenDevices,
  ]);
  const priorityFor = (entityId: string) =>
    Number(devicePriorities[entityId]) || 9999;

  const devices = useMemo<Device[]>(
    () =>
      states
        .filter(
          (item) =>
            controllableDomains.includes(item.entity_id.split(".")[0]) &&
            (item.entity_id.startsWith("climate.") ||
              !["unavailable", "unknown"].includes(item.state)) &&
            !/poupança de energia/i.test(item.attributes.friendly_name || ""),
        )
        .map((item) => {
          const name =
            item.attributes.friendly_name ||
            item.entity_id.split(".")[1].replace(/_/g, " ");
          const room = roomAssignments[item.entity_id] || roomFromName(name);
          const domain = item.entity_id.split(".")[0];
          return {
            ...item,
            name,
            room,
            domain,
            isOn:
              domain === "climate"
                ? !["off", "unavailable", "unknown"].includes(item.state)
                : item.state === "on",
          };
        })
        .filter(
          (device, index, allDevices) =>
            !allDevices.some(
              (candidate, candidateIndex) =>
                candidateIndex !== index &&
                duplicateDeviceKey(candidate) === duplicateDeviceKey(device) &&
                (duplicateDevicePriority(candidate) <
                  duplicateDevicePriority(device) ||
                  (duplicateDevicePriority(candidate) ===
                    duplicateDevicePriority(device) &&
                    candidateIndex < index)),
            ),
        )
        .filter(
          (item) =>
            (deviceType === "all" || item.domain === deviceType) &&
            `${item.name} ${item.room}`
              .toLowerCase()
              .includes(search.toLowerCase()) &&
            (!activeOnly || item.isOn) &&
            (organizing || !hiddenDevices[item.entity_id]),
        )
        .sort(
          (first, second) =>
            priorityFor(first.entity_id) - priorityFor(second.entity_id) ||
            first.name.localeCompare(second.name),
        ),
    [
      states,
      search,
      deviceType,
      activeOnly,
      roomAssignments,
      devicePriorities,
      organizing,
      hiddenDevices,
    ],
  );
  const cameras = useMemo<Camera[]>(
    () =>
      states
        .filter((item) => item.entity_id.startsWith("camera."))
        .map((item) => ({
          ...item,
          name:
            item.attributes.friendly_name ||
            item.entity_id.split(".")[1].replace(/_/g, " "),
        }))
        .filter(
          (camera) =>
            (deviceType === "all" || deviceType === "camera") &&
            camera.name.toLowerCase().includes(search.toLowerCase()) &&
            (organizing || !hiddenDevices[camera.entity_id]),
        )
        .sort(
          (first, second) =>
            priorityFor(first.entity_id) - priorityFor(second.entity_id) ||
            first.name.localeCompare(second.name),
        ),
    [states, search, deviceType, devicePriorities, organizing, hiddenDevices],
  );
  const [liveCameras, setLiveCameras] = useState<Record<string, boolean>>({});
  const liveCameraCount = cameras.filter(
    (camera) => liveCameras[camera.entity_id],
  ).length;
  const camerasLive = cameras.length > 0 && liveCameraCount === cameras.length;
  const toggleCameraLive = (entityId: string) =>
    setLiveCameras((current) => ({
      ...current,
      [entityId]: !current[entityId],
    }));
  const toggleAllCamerasLive = () =>
    setLiveCameras((current) => {
      const allLive = cameras.every((camera) => current[camera.entity_id]);
      return allLive
        ? {}
        : Object.fromEntries(cameras.map((camera) => [camera.entity_id, true]));
    });
  const roomOptions = useMemo(
    () =>
      Array.from(
        new Set([...customRooms, ...devices.map((device) => device.room)]),
      ).sort((a, b) => a.localeCompare(b)),
    [customRooms, devices],
  );
  const rooms = useMemo(() => {
    const groups = customRooms.reduce<Record<string, Device[]>>(
      (result, room) => ({ ...result, [room]: [] }),
      {},
    );
    devices.forEach((device) => {
      (groups[device.room] ||= []).push(device);
    });
    return groups;
  }, [devices, customRooms]);
  const enabledDevices = devices.filter(
    (device) => device.isOn && !hiddenDevices[device.entity_id],
  );
  const totalLights = devices.filter(
    (device) => device.domain === "light",
  ).length;

  const persistAssignments = (next: Record<string, string>) => {
    setRoomAssignments(next);
    localStorage.setItem(assignmentStorageKey, JSON.stringify(next));
  };
  const moveDevice = (entityId: string, room: string) =>
    persistAssignments({ ...roomAssignments, [entityId]: room });
  const setRoomOrder = (room: string, order: number) => {
    const next = { ...roomOrders, [room]: order };
    setRoomOrders(next);
    localStorage.setItem(roomOrderStorageKey, JSON.stringify(next));
  };
  const setDevicePriority = (entityId: string, priority: number) => {
    const next = { ...devicePriorities, [entityId]: priority };
    setDevicePriorities(next);
    localStorage.setItem(priorityStorageKey, JSON.stringify(next));
  };
  const toggleDeviceVisibility = (entityId: string) => {
    const next = { ...hiddenDevices, [entityId]: !hiddenDevices[entityId] };
    setHiddenDevices(next);
    localStorage.setItem(hiddenDeviceStorageKey, JSON.stringify(next));
  };
  const addRoom = () => {
    const room = newRoom.trim();
    if (!room || roomOptions.includes(room)) return;
    const next = [...customRooms, room];
    setCustomRooms(next);
    localStorage.setItem(roomsStorageKey, JSON.stringify(next));
    setNewRoom("");
  };
  const renameRoom = () => {
    const nextName = renamedRoom.trim();
    if (
      !roomToRename ||
      !nextName ||
      roomToRename === nextName ||
      roomOptions.includes(nextName)
    )
      return;
    const nextAssignments = Object.fromEntries(
      Object.entries(roomAssignments).map(([entityId, room]) => [
        entityId,
        room === roomToRename ? nextName : room,
      ]),
    );
    states
      .filter(
        (item) =>
          controllableDomains.includes(item.entity_id.split(".")[0]) &&
          !/poupança de energia/i.test(item.attributes.friendly_name || ""),
      )
      .forEach((item) => {
        const name =
          item.attributes.friendly_name ||
          item.entity_id.split(".")[1].replace(/_/g, " ");
        const currentRoom =
          roomAssignments[item.entity_id] || roomFromName(name);

        if (currentRoom === roomToRename) {
          nextAssignments[item.entity_id] = nextName;
        }
      });
    const nextOrders = Object.fromEntries(
      Object.entries(roomOrders).map(([room, order]) => [
        room === roomToRename ? nextName : room,
        order,
      ]),
    );
    const nextCustomRooms = Array.from(
      new Set([
        ...customRooms.filter((room) => room !== roomToRename),
        nextName,
      ]),
    );
    persistAssignments(nextAssignments);
    setRoomOrders(nextOrders);
    setCustomRooms(nextCustomRooms);
    localStorage.setItem(roomOrderStorageKey, JSON.stringify(nextOrders));
    localStorage.setItem(roomsStorageKey, JSON.stringify(nextCustomRooms));
    setRoomToRename("");
    setRenamedRoom("");
  };
  const removeRoom = (room: string) => {
    if (
      !window.confirm(
        `Excluir o cômodo “${room}”? Os dispositivos serão movidos para “Sem cômodo definido”.`,
      )
    )
      return;
    const nextRooms = customRooms.filter((item) => item !== room);
    const nextAssignments = Object.fromEntries(
      Object.entries(roomAssignments).filter(
        ([, assignedRoom]) => assignedRoom !== room,
      ),
    );
    const nextOrders = Object.fromEntries(
      Object.entries(roomOrders).filter(
        ([orderedRoom]) => orderedRoom !== room,
      ),
    );
    setCustomRooms(nextRooms);
    localStorage.setItem(roomsStorageKey, JSON.stringify(nextRooms));
    persistAssignments(nextAssignments);
    setRoomOrders(nextOrders);
    localStorage.setItem(roomOrderStorageKey, JSON.stringify(nextOrders));
  };
  const setDeviceState = async (device: Device, state: "on" | "off") => {
    setUpdating(device.entity_id);
    try {
      await axios.post(`${URL_API}/home-assistant/service`, {
        entity_id: device.entity_id,
        state,
      });
      setStates((current) =>
        current.map((item) =>
          item.entity_id === device.entity_id ? { ...item, state } : item,
        ),
      );
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.message ||
          "Não foi possível atualizar o dispositivo.",
      );
    } finally {
      setUpdating(null);
    }
  };
  const toggleDevice = async (device: Device) =>
    setDeviceState(device, device.isOn ? "off" : "on");
  const setClimateTemperature = async (device: Device, temperature: number) => {
    setUpdating(device.entity_id);
    try {
      await axios.post(`${URL_API}/home-assistant/service`, {
        entity_id: device.entity_id,
        temperature,
      });
      setStates((current) =>
        current.map((item) =>
          item.entity_id === device.entity_id
            ? { ...item, attributes: { ...item.attributes, temperature } }
            : item,
        ),
      );
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.message ||
          "Não foi possível ajustar a temperatura.",
      );
    } finally {
      setUpdating(null);
    }
  };
  const setMediaVolume = async (device: Device, volumeLevel: number) => {
    setUpdating(device.entity_id);
    try {
      await axios.post(`${URL_API}/home-assistant/service`, {
        entity_id: device.entity_id,
        volume_level: volumeLevel,
      });
      setStates((current) =>
        current.map((item) =>
          item.entity_id === device.entity_id
            ? {
                ...item,
                attributes: { ...item.attributes, volume_level: volumeLevel },
              }
            : item,
        ),
      );
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.message ||
          "Não foi possível ajustar o volume.",
      );
    } finally {
      setUpdating(null);
    }
  };
  const turnOffAll = async () => {
    await Promise.all(enabledDevices.map((device) => toggleDevice(device)));
  };
  const toggleRoom = async (roomDevices: Device[]) => {
    const controllableDevices = roomDevices.filter(
      (device) =>
        !hiddenDevices[device.entity_id] &&
        device.state !== "unavailable" &&
        device.state !== "unknown",
    );
    const turnOff = controllableDevices.some((device) => device.isOn);

    setRoomUpdating(true);
    try {
      await Promise.all(
        controllableDevices
          .filter((device) => (turnOff ? device.isOn : !device.isOn))
          .map((device) => setDeviceState(device, turnOff ? "off" : "on")),
      );
    } finally {
      setRoomUpdating(false);
    }
  };

  return (
    <Container>
      <header className="home-hero">
        <div className="title">
          <span className="home-mark">
            <FiHome />
          </span>
          <div>
            <small>CASA INTELIGENTE</small>
            <h1>Sua casa, em sintonia.</h1>
            <p>Controle seus ambientes conectados pelo Home Assistant.</p>
          </div>
        </div>
        <div className="hero-actions">
          <span className="connection">
            <i /> <FiWifi /> Home Assistant local
          </span>
          <button onClick={() => loadStates(true)} disabled={refreshing}>
            <FiRefreshCw className={refreshing ? "spin" : ""} /> Atualizar
          </button>
        </div>
      </header>
      <section className="overview">
        <button
          type="button"
          className={`summary active active-filter ${activeOnly ? "selected" : ""}`}
          onClick={() => setActiveOnly((value) => !value)}
          aria-pressed={activeOnly}
          title={
            activeOnly
              ? "Exibir todos os dispositivos"
              : "Filtrar dispositivos ativos"
          }
        >
          <span>
            <FiPower />
          </span>
          <div>
            <small>Dispositivos ativos</small>
            <strong>{enabledDevices.length}</strong>
            <em>em funcionamento agora</em>
          </div>
        </button>
        <article className="summary">
          <span>
            <FiSun />
          </span>
          <div>
            <small>Iluminação</small>
            <strong>
              {
                devices.filter(
                  (device) => device.domain === "light" && device.isOn,
                ).length
              }
              <b> / {totalLights}</b>
            </strong>
            <em>luzes acesas</em>
          </div>
        </article>
        <article className="summary">
          <span>
            <FiActivity />
          </span>
          <div>
            <small>Cômodos</small>
            <strong>{Object.keys(rooms).length}</strong>
            <em>áreas organizadas</em>
          </div>
        </article>
        <article className="summary weather">
          <span>
            <FiCloud />
          </span>
          <div>
            <small>Conexão</small>
            <strong>Online</strong>
            <em>sincronizado agora</em>
          </div>
        </article>
      </section>
      <section className="command-bar">
        <div className="filters">
          <div className="search">
            <FiSearch />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar dispositivo ou cômodo"
            />
          </div>
          <select
            aria-label="Filtrar por tipo de dispositivo"
            value={deviceType}
            onChange={(event) => setDeviceType(event.target.value)}
          >
            {Object.entries(deviceTypeLabels).map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="command-actions">
          <button
            className={`organize ${organizing ? "selected" : ""}`}
            onClick={() => {
              if (organizing) {
                setRoomToRename("");
                setRenamedRoom("");
              }
              setOrganizing((value) => !value);
            }}
          >
            {organizing ? <FiX /> : <FiEdit3 />}
            {organizing ? "Concluir" : "Organizar cômodos"}
          </button>
          <button
            className="all-off"
            onClick={turnOffAll}
            disabled={
              !enabledDevices.length || updating !== null || roomUpdating
            }
          >
            <FiPower /> Desligar tudo
          </button>
        </div>
      </section>
      {organizing && (
        <section className="room-editor">
          <div>
            <strong>Organize sua casa</strong>
            <span>
              Crie cômodos e escolha onde cada dispositivo deve aparecer.
            </span>
          </div>
          <div className="room-create">
            <input
              value={newRoom}
              onChange={(event) => setNewRoom(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && addRoom()}
              placeholder="Novo cômodo, ex.: Varanda"
            />
            <button onClick={addRoom}>
              <FiPlus /> Adicionar cômodo
            </button>
          </div>
        </section>
      )}
      {error && (
        <div className="notice">
          <FiActivity />
          <div>
            <strong>Integração indisponível</strong>
            <span>{error}</span>
          </div>
          <button onClick={() => loadStates(true)}>Tentar novamente</button>
        </div>
      )}
      {loading ? (
        <div className="loading">
          <FiLoader className="spin" /> Carregando sua casa...
        </div>
      ) : (
        <>
          <section className="rooms">
            {Object.entries(rooms)
              .filter(([, roomDevices]) => organizing || roomDevices.length > 0)
              .sort(
                ([firstRoom], [secondRoom]) =>
                  (Number(roomOrders[firstRoom]) || 9999) -
                    (Number(roomOrders[secondRoom]) || 9999) ||
                  firstRoom.localeCompare(secondRoom),
              )
              .map(([room, roomDevices]) => (
                <article className="room" key={room}>
                  <header>
                    <div>
                      <span>
                        <FiHome />
                      </span>
                      <div className="room-name">
                        {organizing && roomToRename === room ? (
                          <div className="room-rename-inline">
                            <input
                              autoFocus
                              value={renamedRoom}
                              onChange={(event) =>
                                setRenamedRoom(event.target.value)
                              }
                              onKeyDown={(event) => {
                                if (event.key === "Enter") renameRoom();
                                if (event.key === "Escape") {
                                  setRoomToRename("");
                                  setRenamedRoom("");
                                }
                              }}
                              aria-label={`Novo nome do cômodo ${room}`}
                            />
                            <button type="button" onClick={renameRoom}>
                              Salvar
                            </button>
                          </div>
                        ) : (
                          <>
                            <h2>{room}</h2>
                            {organizing && (
                              <button
                                type="button"
                                className="rename-room"
                                onClick={() => {
                                  setRoomToRename(room);
                                  setRenamedRoom(room);
                                }}
                                aria-label={`Renomear cômodo ${room}`}
                                title="Renomear cômodo"
                              >
                                <FiEdit3 />
                              </button>
                            )}
                          </>
                        )}
                        <p>
                          {roomDevices.filter((device) => device.isOn).length}{" "}
                          de {roomDevices.length} dispositivos ativos
                        </p>
                      </div>
                    </div>
                    <div className="room-actions">
                      <button
                        type="button"
                        className={`room-toggle ${
                          roomDevices.some(
                            (device) =>
                              device.isOn && !hiddenDevices[device.entity_id],
                          )
                            ? "is-on"
                            : ""
                        }`}
                        onClick={() => toggleRoom(roomDevices)}
                        disabled={
                          updating !== null ||
                          roomUpdating ||
                          !roomDevices.some(
                            (device) =>
                              !hiddenDevices[device.entity_id] &&
                              device.state !== "unavailable" &&
                              device.state !== "unknown",
                          )
                        }
                        aria-label={`${
                          roomDevices.some(
                            (device) =>
                              device.isOn && !hiddenDevices[device.entity_id],
                          )
                            ? "Desligar"
                            : "Ligar"
                        } todos os dispositivos de ${room}`}
                        title="Ligar ou desligar todos os dispositivos visíveis do cômodo"
                      >
                        <span />
                      </button>
                      <b>
                        {roomDevices.some((device) => device.isOn)
                          ? "Ativo"
                          : "Em espera"}
                      </b>
                      {organizing && (
                        <input
                          className="room-order"
                          type="number"
                          min="1"
                          step="1"
                          aria-label={`Definir ordem do cômodo ${room}`}
                          value={roomOrders[room] || ""}
                          onChange={(event) =>
                            setRoomOrder(
                              room,
                              Math.max(1, Number(event.target.value) || 1),
                            )
                          }
                          placeholder="Ordem"
                        />
                      )}
                      {organizing && customRooms.includes(room) && (
                        <button
                          className="delete-room"
                          onClick={() => removeRoom(room)}
                          aria-label={`Excluir cômodo ${room}`}
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  </header>
                  <div className="device-grid">
                    {roomDevices.map((device) =>
                      device.domain === "climate" ? (
                        <ClimateCard
                          key={device.entity_id}
                          device={device}
                          updating={updating === device.entity_id}
                          organizing={organizing}
                          roomOptions={roomOptions}
                          priority={devicePriorities[device.entity_id]}
                          onSetState={setDeviceState}
                          onSetTemperature={setClimateTemperature}
                          onMove={moveDevice}
                          onPriority={setDevicePriority}
                          hidden={!!hiddenDevices[device.entity_id]}
                          onVisibility={toggleDeviceVisibility}
                        />
                      ) : device.domain === "media_player" ? (
                        <TelevisionCard
                          key={device.entity_id}
                          device={device}
                          updating={updating === device.entity_id}
                          organizing={organizing}
                          roomOptions={roomOptions}
                          priority={devicePriorities[device.entity_id]}
                          onSetState={setDeviceState}
                          onSetVolume={setMediaVolume}
                          onMove={moveDevice}
                          onPriority={setDevicePriority}
                          hidden={!!hiddenDevices[device.entity_id]}
                          onVisibility={toggleDeviceVisibility}
                        />
                      ) : (
                        <div
                          className={`device ${device.isOn ? "is-on" : ""}`}
                          key={device.entity_id}
                        >
                          <button
                            className="device-toggle"
                            onClick={() => toggleDevice(device)}
                            disabled={updating === device.entity_id}
                          >
                            <span className="device-icon">
                              {updating === device.entity_id ? (
                                <FiLoader className="spin" />
                              ) : (
                                iconFor(device)
                              )}
                            </span>
                            <div>
                              <strong>{device.name}</strong>
                              <small>
                                {device.isOn ? "Ligado" : "Desligado"}
                              </small>
                            </div>
                            <i>
                              <span />
                            </i>
                          </button>
                          {organizing && (
                            <div className="device-settings">
                              <select
                                aria-label={`Mover ${device.name} para outro cômodo`}
                                value={device.room}
                                onChange={(event) =>
                                  moveDevice(
                                    device.entity_id,
                                    event.target.value,
                                  )
                                }
                              >
                                {roomOptions.map((option) => (
                                  <option value={option} key={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="number"
                                min="1"
                                step="1"
                                aria-label={`Definir prioridade de ${device.name}`}
                                value={devicePriorities[device.entity_id] || ""}
                                onChange={(event) =>
                                  setDevicePriority(
                                    device.entity_id,
                                    Math.max(
                                      1,
                                      Number(event.target.value) || 1,
                                    ),
                                  )
                                }
                                placeholder="Ordem"
                              />
                              <button
                                className="visibility-toggle"
                                onClick={() =>
                                  toggleDeviceVisibility(device.entity_id)
                                }
                              >
                                {hiddenDevices[device.entity_id] ? (
                                  <FiEye />
                                ) : (
                                  <FiEyeOff />
                                )}
                                {hiddenDevices[device.entity_id]
                                  ? "Exibir"
                                  : "Ocultar"}
                              </button>
                            </div>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                </article>
              ))}
            {!devices.length && !cameras.length && (
              <div className="empty">
                Nenhum dispositivo encontrado para esta busca.
              </div>
            )}
          </section>
          {!!cameras.length && (
            <section className="monitoring">
              <header className="monitoring-header">
                <div>
                  <span>
                    <FiCamera />
                  </span>
                  <div>
                    <small>MONITORAMENTO</small>
                    <h2>Câmeras</h2>
                    <p>
                      {cameras.length} câmera{cameras.length > 1 ? "s" : ""}
                      {liveCameraCount
                        ? ` com ${liveCameraCount} ao vivo`
                        : " com snapshot"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className={`live-cameras ${camerasLive ? "is-live" : ""}`}
                  onClick={toggleAllCamerasLive}
                >
                  <i /> {camerasLive ? "Encerrar ao vivo" : "Ao vivo"}
                </button>
              </header>
              <div className="camera-grid">
                {cameras.map((camera) => (
                  <CameraCard
                    key={camera.entity_id}
                    camera={camera}
                    priority={devicePriorities[camera.entity_id]}
                    hidden={!!hiddenDevices[camera.entity_id]}
                    organizing={organizing}
                    live={!!liveCameras[camera.entity_id]}
                    onPriority={setDevicePriority}
                    onVisibility={toggleDeviceVisibility}
                    onToggleLive={toggleCameraLive}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </Container>
  );
};
export default Home;
