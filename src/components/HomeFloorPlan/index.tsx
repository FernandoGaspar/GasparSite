import axios from "axios";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FiCheck,
  FiEdit3,
  FiHome,
  FiLoader,
  FiMinus,
  FiPlus,
  FiRotateCw,
  FiSave,
  FiTrash2,
  FiX,
  FiZap,
} from "react-icons/fi";
import { URL_API } from "../../repositories/baseAPI";
import { Container } from "./styles";

interface Point {
  x: number;
  y: number;
}

interface FloorRoom {
  id: string;
  name: string;
  polygon: Point[];
  labelPosition: Point;
  entities: string[];
  linkedRoom?: string;
  color?: string;
}

interface FloorPlan {
  id: string;
  name: string;
  image: string;
  rooms: FloorRoom[];
  geometryVersion?: number;
}

export interface FloorPlanLight {
  entity_id: string;
  state: string;
  attributes: { friendly_name?: string };
  room?: string;
}

interface Props {
  open: boolean;
  usuarioId: number;
  lights: FloorPlanLight[];
  registeredRooms: string[];
  onClose(): void;
  onSetLight(entityId: string, state: "on" | "off"): Promise<void>;
}

const floorId = "upper-floor";
const imagePath = "/assets/floor-plans/upper-floor.jpg";
const groundFloorId = "ground-floor";
const groundFloorImagePath = "/assets/floor-plans/ground-floor.jpg";
const lightUpdateRetryDelays = [500, 1200];

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));

const defaultPlan: FloorPlan = {
  id: floorId,
  name: "Segundo andar",
  image: imagePath,
  rooms: [
    {
      id: "quarto-leticia",
      name: "Quarto Letícia",
      polygon: [
        { x: 0.126, y: 0.128 },
        { x: 0.276, y: 0.128 },
        { x: 0.276, y: 0.417 },
        { x: 0.126, y: 0.417 },
      ],
      labelPosition: { x: 0.199, y: 0.291 },
      entities: [],
    },
    {
      id: "closet-leticia",
      name: "Closet Letícia",
      polygon: [
        { x: 0.278, y: 0.132 },
        { x: 0.342, y: 0.132 },
        { x: 0.342, y: 0.421 },
        { x: 0.278, y: 0.421 },
      ],
      labelPosition: { x: 0.31, y: 0.292 },
      entities: [],
    },
    {
      id: "banho-1",
      name: "Banho 1",
      polygon: [
        { x: 0.347, y: 0.15 },
        { x: 0.402, y: 0.15 },
        { x: 0.402, y: 0.413 },
        { x: 0.347, y: 0.413 },
      ],
      labelPosition: { x: 0.374, y: 0.27 },
      entities: [],
    },
    {
      id: "banho-2",
      name: "Banho 2",
      polygon: [
        { x: 0.404, y: 0.15 },
        { x: 0.462, y: 0.15 },
        { x: 0.462, y: 0.413 },
        { x: 0.404, y: 0.413 },
      ],
      labelPosition: { x: 0.433, y: 0.27 },
      entities: [],
    },
    {
      id: "closet-isabela",
      name: "Closet Isabela",
      polygon: [
        { x: 0.465, y: 0.154 },
        { x: 0.532, y: 0.154 },
        { x: 0.532, y: 0.411 },
        { x: 0.465, y: 0.411 },
      ],
      labelPosition: { x: 0.498, y: 0.29 },
      entities: [],
    },
    {
      id: "suite-isabela",
      name: "Suíte Isabela",
      polygon: [
        { x: 0.535, y: 0.153 },
        { x: 0.679, y: 0.153 },
        { x: 0.679, y: 0.421 },
        { x: 0.588, y: 0.421 },
        { x: 0.588, y: 0.365 },
        { x: 0.535, y: 0.365 },
      ],
      labelPosition: { x: 0.604, y: 0.281 },
      entities: [],
    },
    {
      id: "suite-master",
      name: "Suíte Master",
      polygon: [
        { x: 0.682, y: 0.153 },
        { x: 0.89, y: 0.153 },
        { x: 0.89, y: 0.507 },
        { x: 0.83, y: 0.507 },
        { x: 0.83, y: 0.453 },
        { x: 0.682, y: 0.453 },
      ],
      labelPosition: { x: 0.786, y: 0.303 },
      entities: [],
    },
    {
      id: "closet-master",
      name: "Closet Master",
      polygon: [
        { x: 0.69, y: 0.488 },
        { x: 0.829, y: 0.488 },
        { x: 0.829, y: 0.612 },
        { x: 0.69, y: 0.612 },
      ],
      labelPosition: { x: 0.759, y: 0.553 },
      entities: [],
    },
    {
      id: "banho-master",
      name: "Banho Master",
      polygon: [
        { x: 0.682, y: 0.614 },
        { x: 0.837, y: 0.614 },
        { x: 0.837, y: 0.806 },
        { x: 0.682, y: 0.806 },
      ],
      labelPosition: { x: 0.758, y: 0.715 },
      entities: [],
    },
    {
      id: "home-office",
      name: "Home Office",
      polygon: [
        { x: 0.427, y: 0.507 },
        { x: 0.505, y: 0.507 },
        { x: 0.505, y: 0.747 },
        { x: 0.427, y: 0.747 },
      ],
      labelPosition: { x: 0.466, y: 0.63 },
      entities: [],
    },
    {
      id: "sala-tv",
      name: "Sala de TV",
      polygon: [
        { x: 0.508, y: 0.507 },
        { x: 0.682, y: 0.507 },
        { x: 0.682, y: 0.76 },
        { x: 0.508, y: 0.76 },
      ],
      labelPosition: { x: 0.594, y: 0.634 },
      entities: [],
    },
    {
      id: "circulacao",
      name: "Circulação",
      polygon: [
        { x: 0.342, y: 0.421 },
        { x: 0.588, y: 0.421 },
        { x: 0.588, y: 0.505 },
        { x: 0.505, y: 0.505 },
        { x: 0.505, y: 0.747 },
        { x: 0.395, y: 0.747 },
        { x: 0.395, y: 0.558 },
        { x: 0.342, y: 0.558 },
      ],
      labelPosition: { x: 0.427, y: 0.461 },
      entities: [],
    },
  ],
};

const groundFloorPlan: FloorPlan = {
  id: groundFloorId,
  name: "Primeiro andar",
  image: groundFloorImagePath,
  geometryVersion: 2,
  rooms: [
    { id: "deposito", name: "Depósito", polygon: [{ x: .056, y: .103 }, { x: .104, y: .103 }, { x: .104, y: .205 }, { x: .056, y: .205 }], labelPosition: { x: .08, y: .153 }, entities: [] },
    { id: "sauna", name: "Sauna", polygon: [{ x: .105, y: .103 }, { x: .149, y: .103 }, { x: .149, y: .205 }, { x: .105, y: .205 }], labelPosition: { x: .127, y: .153 }, entities: [] },
    { id: "piscina-prainha", name: "Piscina e prainha", polygon: [{ x: .075, y: .202 }, { x: .194, y: .202 }, { x: .194, y: .454 }, { x: .171, y: .454 }, { x: .171, y: .554 }, { x: .099, y: .554 }, { x: .099, y: .638 }, { x: .19, y: .638 }, { x: .19, y: .755 }, { x: .075, y: .755 }], labelPosition: { x: .135, y: .39 }, entities: [] },
    { id: "espaco-gourmet", name: "Espaço gourmet", polygon: [{ x: .231, y: .185 }, { x: .395, y: .185 }, { x: .395, y: .454 }, { x: .258, y: .454 }, { x: .258, y: .466 }, { x: .231, y: .466 }], labelPosition: { x: .315, y: .345 }, entities: [] },
    { id: "banho-gourmet", name: "Apoio gourmet", polygon: [{ x: .255, y: .188 }, { x: .28, y: .188 }, { x: .28, y: .235 }, { x: .255, y: .235 }], labelPosition: { x: .267, y: .212 }, entities: [] },
    { id: "sala-jantar", name: "Sala de jantar", polygon: [{ x: .395, y: .232 }, { x: .521, y: .232 }, { x: .521, y: .184 }, { x: .584, y: .184 }, { x: .584, y: .506 }, { x: .435, y: .506 }, { x: .435, y: .455 }, { x: .395, y: .455 }], labelPosition: { x: .465, y: .335 }, entities: [] },
    { id: "sala-estar", name: "Sala de estar", polygon: [{ x: .584, y: .185 }, { x: .71, y: .185 }, { x: .71, y: .397 }, { x: .745, y: .397 }, { x: .745, y: .507 }, { x: .584, y: .507 }], labelPosition: { x: .648, y: .31 }, entities: [] },
    { id: "espaco-spa", name: "Academia", polygon: [{ x: .192, y: .46 }, { x: .259, y: .46 }, { x: .259, y: .718 }, { x: .192, y: .718 }], labelPosition: { x: .226, y: .59 }, entities: [] },
    { id: "cozinha", name: "Cozinha", polygon: [{ x: .259, y: .455 }, { x: .435, y: .455 }, { x: .435, y: .56 }, { x: .373, y: .56 }, { x: .373, y: .721 }, { x: .259, y: .721 }], labelPosition: { x: .33, y: .603 }, entities: [] },
    { id: "area-servico", name: "Área de serviço", polygon: [{ x: .374, y: .558 }, { x: .435, y: .558 }, { x: .435, y: .721 }, { x: .374, y: .721 }], labelPosition: { x: .405, y: .64 }, entities: [] },
    { id: "suite-hospede", name: "Suíte hóspede", polygon: [{ x: .436, y: .508 }, { x: .522, y: .508 }, { x: .522, y: .721 }, { x: .436, y: .721 }], labelPosition: { x: .479, y: .615 }, entities: [] },
    { id: "banho-hospede", name: "Banho hóspede", polygon: [{ x: .523, y: .508 }, { x: .582, y: .508 }, { x: .582, y: .721 }, { x: .523, y: .721 }], labelPosition: { x: .552, y: .615 }, entities: [] },
    { id: "garagem", name: "Garagem", polygon: [{ x: .583, y: .508 }, { x: .744, y: .508 }, { x: .744, y: .823 }, { x: .583, y: .823 }], labelPosition: { x: .664, y: .665 }, entities: [] },
  ],
};

const floorPlans: Record<string, FloorPlan> = {
  [groundFloorId]: groundFloorPlan,
  [floorId]: defaultPlan,
};

const clonePlan = (plan: FloorPlan): FloorPlan =>
  JSON.parse(JSON.stringify(plan));

const slug = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const HomeFloorPlan: React.FC<Props> = ({
  open,
  usuarioId,
  lights,
  registeredRooms,
  onClose,
  onSetLight,
}) => {
  const [selectedFloorId, setSelectedFloorId] = useState(groundFloorId);
  const [plan, setPlan] = useState<FloorPlan>(() => clonePlan(groundFloorPlan));
  const [savedPlan, setSavedPlan] = useState<FloorPlan>(() =>
    clonePlan(groundFloorPlan),
  );
  const [editing, setEditing] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyRoom, setBusyRoom] = useState("");
  const [message, setMessage] = useState("");
  const [draggingPoint, setDraggingPoint] = useState<number | null>(null);
  const [portrait, setPortrait] = useState(() => window.innerWidth <= 900);
  const [zoom, setZoom] = useState(1);
  const svgRef = useRef<SVGSVGElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedRoom = plan.rooms.find((room) => room.id === selectedRoomId);
  const lightMap = useMemo(
    () => Object.fromEntries(lights.map((light) => [light.entity_id, light])),
    [lights],
  );
  const viewWidth = portrait ? 593 : 1000;
  const viewHeight = portrait ? 1000 : 593;
  const displayPoint = (point: Point): Point =>
    portrait ? { x: 1 - point.y, y: point.x } : point;

  const fitFloorPlan = () => {
    setZoom(1);
    window.requestAnimationFrame(() => {
      const scroll = scrollRef.current;
      if (!scroll) return;
      scroll.scrollLeft = 0;
      scroll.scrollTop = 0;
    });
  };

  const changeZoom = (nextZoom: number) => {
    const scroll = scrollRef.current;
    const previousZoom = zoom;
    const centerX = scroll ? scroll.scrollLeft + scroll.clientWidth / 2 : 0;
    const centerY = scroll ? scroll.scrollTop + scroll.clientHeight / 2 : 0;
    const limitedZoom = Math.min(3, Math.max(0.5, nextZoom));
    setZoom(limitedZoom);
    window.requestAnimationFrame(() => {
      if (!scroll || previousZoom === 0) return;
      const ratio = limitedZoom / previousZoom;
      scroll.scrollLeft = centerX * ratio - scroll.clientWidth / 2;
      scroll.scrollTop = centerY * ratio - scroll.clientHeight / 2;
    });
  };

  useEffect(() => {
    if (!open) return;
    const basePlan = floorPlans[selectedFloorId];
    fitFloorPlan();
    setLoading(true);
    setMessage("");
    axios
      .get<FloorPlan>(`${URL_API}/home-assistant/floor-plans/${basePlan.id}`, {
        params: { usuarioId },
      })
      .then(({ data }) => {
        const savedRooms = new Map((data.rooms || []).map(room => [room.id, room]));
        const geometryChanged = basePlan.geometryVersion
          && data.geometryVersion !== basePlan.geometryVersion;
        const loaded = data.rooms?.length && !geometryChanged
          ? { ...data, image: basePlan.image }
          : data.rooms?.length
            ? {
                ...clonePlan(basePlan),
                rooms: basePlan.rooms.map(room => ({
                  ...room,
                  entities: savedRooms.get(room.id)?.entities || [],
                  linkedRoom: savedRooms.get(room.id)?.linkedRoom,
                  color: savedRooms.get(room.id)?.color,
                })),
              }
            : clonePlan(basePlan);
        setPlan(loaded);
        setSavedPlan(clonePlan(loaded));
      })
      .catch(() => {
        const initial = clonePlan(basePlan);
        setPlan(initial);
        setSavedPlan(clonePlan(initial));
        setMessage(
          "A configuração inicial foi carregada. Aplique a migration da planta para salvar no servidor.",
        );
      })
      .finally(() => setLoading(false));
  }, [open, usuarioId, selectedFloorId]);

  useEffect(() => {
    if (!open) {
      setEditing(false);
      setSelectedRoomId("");
    }
    if (open) {
      setPortrait(window.innerWidth <= 900);
      setZoom(1);
    }
  }, [open]);

  useEffect(() => {
    if (!open || loading || !lights.length) return;
    setPlan((current) => {
      const claimedEntities = new Set<string>();
      let changed = false;
      const rooms = current.rooms.map((room) => {
        const registeredRoom = room.linkedRoom ||
          registeredRooms.find((name) => slug(name) === slug(room.name));
        const automaticEntities = registeredRoom
          ? lights
              .filter((light) => slug(light.room || "") === slug(registeredRoom))
              .map((light) => light.entity_id)
          : [];
        const entities = Array.from(
          new Set([...room.entities, ...automaticEntities]),
        ).filter((entityId) => {
          if (claimedEntities.has(entityId)) return false;
          claimedEntities.add(entityId);
          return true;
        });
        if (
          entities.length !== room.entities.length ||
          entities.some((entityId, index) => entityId !== room.entities[index])
        ) {
          changed = true;
          return { ...room, entities };
        }
        return room;
      });
      return changed ? { ...current, rooms } : current;
    });
  }, [open, loading, lights, registeredRooms]);

  if (!open) return null;

  const roomState = (room: FloorRoom) => {
    const roomLights = room.entities
      .map((entityId) => lightMap[entityId])
      .filter(Boolean);
    const available = roomLights.filter(
      (light) => !["unavailable", "unknown"].includes(light.state),
    );
    const onCount = available.filter((light) => light.state === "on").length;
    if (!room.entities.length) return "unassigned";
    if (!available.length) return "unavailable";
    if (onCount === available.length) return "on";
    if (onCount > 0) return "partial";
    return "off";
  };

  const toggleRoom = async (room: FloorRoom) => {
    if (editing || busyRoom) {
      return;
    }
    if (!room.entities.length) {
      setMessage(
        `${room.name} ainda não possui luz associada. Use o botão “Editar planta” para configurar.`,
      );
      return;
    }
    const available = room.entities
      .map((entityId) => lightMap[entityId])
      .filter(
        (light): light is FloorPlanLight =>
          !!light && !["unavailable", "unknown"].includes(light.state),
      );
    if (!available.length) return;
    const nextState = available.some((light) => light.state === "on")
      ? "off"
      : "on";
    setBusyRoom(room.id);
    setMessage("");
    try {
      const updateLight = async (entityId: string) => {
        let lastError: unknown;
        for (let attempt = 0; attempt <= lightUpdateRetryDelays.length; attempt += 1) {
          try {
            await onSetLight(entityId, nextState);
            return;
          } catch (error) {
            lastError = error;
            const retryDelay = lightUpdateRetryDelays[attempt];
            if (retryDelay === undefined) break;
            await wait(retryDelay);
          }
        }
        throw lastError;
      };
      const lightsToUpdate = available.filter((light) => light.state !== nextState);
      const results = await Promise.allSettled(
        lightsToUpdate.map((light) => updateLight(light.entity_id)),
      );
      const failedCount = results.filter((result) => result.status === "rejected").length;
      if (failedCount) {
        setMessage(
          failedCount === lightsToUpdate.length
            ? `Não foi possível atualizar as luzes de ${room.name} após novas tentativas.`
            : `${failedCount} ${failedCount === 1 ? "luz não respondeu" : "luzes não responderam"} em ${room.name}, mesmo após novas tentativas.`,
        );
      }
    } finally {
      setBusyRoom("");
    }
  };

  const updateSelectedRoom = (changes: Partial<FloorRoom>) => {
    setPlan((current) => ({
      ...current,
      rooms: current.rooms.map((room) =>
        room.id === selectedRoomId ? { ...room, ...changes } : room,
      ),
    }));
  };

  const updatePointFromPointer = (
    event: React.PointerEvent<SVGSVGElement>,
    pointIndex: number,
  ) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || !selectedRoom) return;
    const displayX = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const displayY = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    const { x, y } = portrait
      ? { x: displayY, y: 1 - displayX }
      : { x: displayX, y: displayY };
    const polygon = selectedRoom.polygon.map((point, index) =>
      index === pointIndex ? { x, y } : point,
    );
    updateSelectedRoom({ polygon });
  };

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      const { data } = await axios.put<FloorPlan>(
        `${URL_API}/home-assistant/floor-plans/${plan.id}`,
        { usuarioId, plan },
      );
      const saved = { ...data, image: floorPlans[plan.id].image };
      setPlan(saved);
      setSavedPlan(clonePlan(saved));
      setEditing(false);
      setSelectedRoomId("");
      setMessage("Planta salva com sucesso.");
    } catch (requestError: any) {
      setMessage(
        requestError.response?.data?.message ||
          "Não foi possível salvar a configuração da planta.",
      );
    } finally {
      setSaving(false);
    }
  };

  const addRoom = () => {
    const name = `Novo cômodo ${plan.rooms.length + 1}`;
    const baseId = slug(name);
    const existingIds = new Set(plan.rooms.map((room) => room.id));
    let suffix = 1;
    while (existingIds.has(`${baseId}-${suffix}`)) suffix += 1;
    const id = `${baseId}-${suffix}`;
    const room: FloorRoom = {
      id,
      name,
      polygon: [
        { x: 0.4, y: 0.4 },
        { x: 0.55, y: 0.4 },
        { x: 0.55, y: 0.55 },
        { x: 0.4, y: 0.55 },
      ],
      labelPosition: { x: 0.475, y: 0.475 },
      entities: [],
    };
    setPlan((current) => ({ ...current, rooms: [...current.rooms, room] }));
    setSelectedRoomId(id);
  };

  const removeSelectedRoom = () => {
    if (!selectedRoom || !window.confirm(`Excluir “${selectedRoom.name}”?`))
      return;
    setPlan((current) => ({
      ...current,
      rooms: current.rooms.filter((room) => room.id !== selectedRoom.id),
    }));
    setSelectedRoomId("");
  };

  const associateRegisteredRoom = (linkedRoom: string) => {
    if (!selectedRoom) return;
    const entities = linkedRoom
      ? lights
          .filter((light) => light.room === linkedRoom)
          .filter((light) =>
            !plan.rooms.some(
              (room) => room.id !== selectedRoom.id && room.entities.includes(light.entity_id),
            ),
          )
          .map((light) => light.entity_id)
      : selectedRoom.entities;
    updateSelectedRoom({
      linkedRoom,
      name: linkedRoom || selectedRoom.name,
      entities: linkedRoom ? Array.from(new Set([...selectedRoom.entities, ...entities])) : entities,
    });
  };

  const close = () => {
    if (
      editing &&
      JSON.stringify(plan) !== JSON.stringify(savedPlan) &&
      !window.confirm("Descartar as alterações não salvas da planta?")
    )
      return;
    onClose();
  };

  return (
    <Container role="dialog" aria-modal="true" aria-label={plan.name}>
      <button className="floor-backdrop" onClick={close} aria-label="Fechar" />
      <section className="floor-modal">
        <header className="floor-header">
          <div>
            <span><FiHome /></span>
            <div>
              <small>CASA INTELIGENTE</small>
              <h2>{plan.name}</h2>
              <p>Clique em um cômodo para controlar suas luzes.</p>
            </div>
          </div>
          <div className="floor-actions">
            <button
              className={selectedFloorId === groundFloorId ? "" : "secondary"}
              disabled={loading || editing}
              onClick={() => setSelectedFloorId(groundFloorId)}
            >Primeiro andar</button>
            <button
              className={selectedFloorId === floorId ? "" : "secondary"}
              disabled={loading || editing}
              onClick={() => setSelectedFloorId(floorId)}
            >Segundo andar</button>
            {editing ? (
              <>
                <button className="secondary" onClick={addRoom}><FiPlus /> Cômodo</button>
                <button
                  className="secondary"
                  onClick={() => {
                    setPlan(clonePlan(savedPlan));
                    setEditing(false);
                    setSelectedRoomId("");
                  }}
                ><FiX /> Cancelar</button>
                <button onClick={save} disabled={saving || !usuarioId}>
                  {saving ? <FiLoader className="spin" /> : <FiSave />} Salvar
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)}><FiEdit3 /> Editar planta</button>
            )}
            <button className="icon-button" onClick={close} aria-label="Fechar planta"><FiX /></button>
          </div>
        </header>

        {message && <div className="floor-message">{message}</div>}

        <div className="floor-toolbar">
          <div>
            <button type="button" onClick={() => changeZoom(zoom - .25)} aria-label="Diminuir zoom"><FiMinus /></button>
            <strong>{Math.round(zoom * 100)}%</strong>
            <button type="button" onClick={() => changeZoom(zoom + .25)} aria-label="Aumentar zoom"><FiPlus /></button>
            <button type="button" className="toolbar-text" onClick={fitFloorPlan}>Ajustar</button>
          </div>
          <button className="toolbar-text" onClick={() => {
            setPortrait((value) => !value);
            fitFloorPlan();
          }}>
            <FiRotateCw /> {portrait ? "Ver horizontal" : "Ver vertical"}
          </button>
        </div>

        <div className={`floor-content ${editing ? "is-editing" : ""}`}>
          <div className="floor-canvas-wrap">
            {loading ? (
              <div className="floor-loading"><FiLoader className="spin" /> Carregando planta...</div>
            ) : (
              <>
              <div className="floor-scroll" ref={scrollRef}>
              <div
                className={`floor-canvas ${portrait ? "portrait" : "landscape"}`}
                style={{ width: `${zoom * 100}%` }}
              >
                <img src={plan.image || floorPlans[plan.id].image} alt={`Planta do ${plan.name.toLowerCase()}`} />
                <svg
                  ref={svgRef}
                  className={editing ? "editing" : "navigating"}
                  viewBox={`0 0 ${viewWidth} ${viewHeight}`}
                  preserveAspectRatio="none"
                  onPointerMove={(event) => {
                    if (draggingPoint !== null) updatePointFromPointer(event, draggingPoint);
                  }}
                  onPointerUp={() => setDraggingPoint(null)}
                  onPointerLeave={() => setDraggingPoint(null)}
                >
                  <defs>
                    <radialGradient id="room-light-glow">
                      <stop offset="0%" stopColor="#fffbd1" stopOpacity=".98" />
                      <stop offset="18%" stopColor="#fff3a0" stopOpacity=".92" />
                      <stop offset="48%" stopColor="#ffd85a" stopOpacity=".55" />
                      <stop offset="100%" stopColor="#ffc52e" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  {plan.rooms.map((room) => {
                    const state = roomState(room);
                    const selected = room.id === selectedRoomId;
                    const points = room.polygon
                      .map(displayPoint)
                      .map((point) => `${point.x * viewWidth},${point.y * viewHeight}`)
                      .join(" ");
                    const label = displayPoint(room.labelPosition);
                    const glowCount = Math.min(3, Math.max(1, room.entities.length));
                    const glowOffsets =
                      glowCount === 1
                        ? [{ x: 0, y: 0 }]
                        : glowCount === 2
                          ? [{ x: -38, y: 0 }, { x: 38, y: 0 }]
                          : [{ x: -48, y: 12 }, { x: 0, y: -18 }, { x: 48, y: 12 }];
                    return (
                      <g
                        key={room.id}
                        className={`floor-room state-${state} ${selected ? "selected" : ""} ${busyRoom === room.id ? "busy" : ""}`}
                        onClick={() => editing ? setSelectedRoomId(room.id) : toggleRoom(room)}
                      >
                        <defs>
                          <clipPath id={`room-clip-${room.id}`}>
                            <polygon points={points} />
                          </clipPath>
                        </defs>
                        <polygon points={points} />
                        {(state === "on" || state === "partial") && (
                          <g
                            className="room-light-pools"
                            clipPath={`url(#room-clip-${room.id})`}
                          >
                            {glowOffsets.map((offset, index) => (
                              <ellipse
                                key={index}
                                cx={label.x * viewWidth + offset.x}
                                cy={label.y * viewHeight + offset.y}
                                rx={state === "partial" ? 68 : 92}
                                ry={state === "partial" ? 52 : 72}
                                fill="url(#room-light-glow)"
                              />
                            ))}
                          </g>
                        )}
                        <g className="room-label" transform={`translate(${label.x * viewWidth} ${label.y * viewHeight})`}>
                          <rect x="-62" y="-18" width="124" height="36" rx="9" />
                          <text textAnchor="middle" y="-2">{room.name}</text>
                          <text className="room-status" textAnchor="middle" y="11">
                            {busyRoom === room.id ? "Atualizando…" : state === "on" ? "Ligado" : state === "partial" ? "Parcial" : state === "off" ? "Desligado" : state === "unavailable" ? "Indisponível" : "Sem luz associada"}
                          </text>
                        </g>
                        {editing && selected && room.polygon.map(displayPoint).map((point, index) => (
                          <circle
                            key={index}
                            className="edit-point"
                            cx={point.x * viewWidth}
                            cy={point.y * viewHeight}
                            r="8"
                            onPointerDown={(event) => {
                              event.stopPropagation();
                              event.currentTarget.setPointerCapture(event.pointerId);
                              setDraggingPoint(index);
                            }}
                          />
                        ))}
                      </g>
                    );
                  })}
                </svg>
              </div>
              </div>
              <p className="touch-help">Use os botões para ampliar e arraste a planta com o dedo em qualquer direção.</p>
              </>
            )}
            <div className="floor-legend">
              <span><i className="on" /> Ligado</span>
              <span><i className="partial" /> Parcial</span>
              <span><i className="off" /> Desligado</span>
              <span><i className="empty" /> Sem associação</span>
            </div>
          </div>

          {editing && (
            <aside className="floor-editor">
              <label className="area-selector">
                Área desenhada na planta
                <select value={selectedRoomId} onChange={(event) => setSelectedRoomId(event.target.value)}>
                  <option value="">Selecione uma área</option>
                  {plan.rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
                </select>
              </label>
              {selectedRoom ? (
                <>
                  <div className="editor-title">
                    <div><small>EDITANDO CÔMODO</small><strong>{selectedRoom.name}</strong></div>
                    <FiEdit3 />
                  </div>
                  <label className="association-selector">
                    Associar ao cômodo cadastrado
                    <select
                      value={selectedRoom.linkedRoom || ""}
                      onChange={(event) => associateRegisteredRoom(event.target.value)}
                    >
                      <option value="">Selecione o cômodo do sistema</option>
                      {registeredRooms.map((room) => <option key={room} value={room}>{room}</option>)}
                    </select>
                    <small>Ao escolher, as luzes cadastradas nesse cômodo também são marcadas automaticamente.</small>
                  </label>
                  <label>
                    Nome do cômodo
                    <input
                      value={selectedRoom.name}
                      maxLength={120}
                      onChange={(event) => updateSelectedRoom({ name: event.target.value })}
                    />
                  </label>
                  <div className="vertex-help">
                    <FiCheck /> Arraste os pontos azuis sobre a planta para ajustar os limites.
                  </div>
                  <div className="entity-title">
                    <div><strong>Luzes associadas</strong><small>Selecione uma ou mais entidades</small></div>
                    <b>{selectedRoom.entities.length}</b>
                  </div>
                  <div className="entity-list">
                    {lights.map((light) => {
                      const checked = selectedRoom.entities.includes(light.entity_id);
                      const assignedRoom = plan.rooms.find(
                        (room) =>
                          room.id !== selectedRoom.id &&
                          room.entities.includes(light.entity_id),
                      );
                      return (
                        <label
                          className={`${checked ? "checked" : ""} ${assignedRoom ? "disabled" : ""}`}
                          key={light.entity_id}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={!!assignedRoom}
                            onChange={() => updateSelectedRoom({
                              entities: checked
                                ? selectedRoom.entities.filter((id) => id !== light.entity_id)
                                : [...selectedRoom.entities, light.entity_id],
                            })}
                          />
                          <span><FiZap /></span>
                          <div>
                            <strong>{light.attributes.friendly_name || light.entity_id}</strong>
                            <small>{light.entity_id}</small>
                          </div>
                          <em>{assignedRoom ? assignedRoom.name : light.state === "on" ? "Ligada" : light.state === "off" ? "Desligada" : light.state}</em>
                        </label>
                      );
                    })}
                    {!lights.length && <p className="no-lights">Nenhuma entidade `light` foi encontrada no Home Assistant.</p>}
                  </div>
                  <button className="delete-button" onClick={removeSelectedRoom}><FiTrash2 /> Excluir cômodo</button>
                </>
              ) : (
                <div className="select-room"><FiHome /><strong>Selecione um cômodo</strong><p>Clique sobre uma área da planta para editar seus limites e associar as luzes.</p></div>
              )}
            </aside>
          )}
        </div>
      </section>
    </Container>
  );
};

export default HomeFloorPlan;
