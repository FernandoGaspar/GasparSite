import { appendSceneBlinds } from "./sceneBlinds";

describe("appendSceneBlinds", () => {
  it("groups Tuya scenes into one controllable blind per room", () => {
    const states = [
      {
        entity_id: "scene.abrir_persiana_suite_master",
        state: "2026-09-03T20:00:00Z",
        attributes: {},
      },
      {
        entity_id: "scene.fechar_persiana_suite_master",
        state: "2026-09-03T21:00:00Z",
        attributes: {},
      },
      {
        entity_id: "scene.cancelar_persiana_suite_master",
        state: "unknown",
        attributes: {},
      },
    ];

    const result = appendSceneBlinds(states);
    const blind = result.find(
      (item) => item.entity_id === "cover.scene_blind_suite_master",
    );

    expect(blind).toMatchObject({
      state: "closed",
      attributes: {
        friendly_name: "Persiana Suíte Master",
        virtual_room: "Suíte Master",
        virtual_scene_actions: {
          open: "scene.abrir_persiana_suite_master",
          close: "scene.fechar_persiana_suite_master",
          stop: "scene.cancelar_persiana_suite_master",
        },
      },
    });
  });

  it("does not create a blind without both open and close scenes", () => {
    const result = appendSceneBlinds([
      {
        entity_id: "scene.abrir_persiana_incompleta",
        state: "unknown",
        attributes: {},
      },
    ]);

    expect(
      result.some((item) => item.entity_id.startsWith("cover.scene_blind_")),
    ).toBe(false);
  });
});
