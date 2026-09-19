export type SceneBlindActions = Partial<
  Record<"open" | "close" | "stop", string>
>;

type HomeEntity = {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
};

type BlindAction = keyof SceneBlindActions;
type BlindGroup = {
  slug: string;
  room: string;
  actions: SceneBlindActions;
  lastAction?: BlindAction;
  lastActivatedAt: number;
};

const scenePattern = /^scene\.(abrir|fechar|cancelar|parar)_persiana_(.+)$/i;
const actionNames: Record<string, BlindAction> = {
  abrir: "open",
  fechar: "close",
  cancelar: "stop",
  parar: "stop",
};

const roomName = (slug: string) =>
  slug
    .split("_")
    .filter(Boolean)
    .map((part, index) => {
      const normalized = part.toLocaleLowerCase();
      if (normalized === "suite") return "Suíte";
      if (normalized === "tv") return "TV";
      if (["de", "da", "do"].includes(normalized) && index > 0)
        return normalized;
      return normalized.charAt(0).toLocaleUpperCase() + normalized.slice(1);
    })
    .join(" ");

const activatedAt = (state: string) => {
  const value = Date.parse(state);
  return Number.isFinite(value) ? value : 0;
};

export const appendSceneBlinds = <T extends HomeEntity>(states: T[]) => {
  const groups = new Map<string, BlindGroup>();

  states.forEach((entity) => {
    const match = entity.entity_id.match(scenePattern);
    if (!match) return;
    const action = actionNames[match[1].toLocaleLowerCase()];
    const slug = match[2].toLocaleLowerCase();
    const group = groups.get(slug) || {
      slug,
      room: roomName(slug),
      actions: {},
      lastActivatedAt: 0,
    };
    group.actions[action] = entity.entity_id;
    const timestamp = activatedAt(entity.state);
    if (timestamp > group.lastActivatedAt) {
      group.lastActivatedAt = timestamp;
      group.lastAction = action;
    }
    groups.set(slug, group);
  });

  const virtualBlinds: HomeEntity[] = [...groups.values()]
    .filter((group) => group.actions.open && group.actions.close)
    .map((group) => ({
      entity_id: "cover.scene_blind_" + group.slug,
      state:
        group.lastAction === "open"
          ? "open"
          : group.lastAction === "close"
            ? "closed"
            : group.lastAction === "stop"
              ? "stopped"
              : "unknown",
      attributes: {
        friendly_name: "Persiana " + group.room,
        virtual_room: group.room,
        virtual_scene_actions: group.actions,
        supported_features: group.actions.stop ? 15 : 3,
      },
    }));

  return [...states, ...virtualBlinds];
};
