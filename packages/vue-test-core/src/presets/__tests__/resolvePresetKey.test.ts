import { describe, expect, it } from "vitest";

import { resolvePresetKey } from "../resolvePresetKey.js";

describe("resolvePresetKey", () => {
  it("uses the implicit default when neither level selects a preset", () => {
    expect(resolvePresetKey()).toEqual({
      presetKey: "default",
      requestedPresetKey: undefined,
      explicitPresetKey: undefined,
    });
  });

  it("preserves an explicit default selection", () => {
    expect(resolvePresetKey({ factoryPresetKey: "default" })).toEqual({
      presetKey: "default",
      requestedPresetKey: "default",
      explicitPresetKey: "default",
    });
  });

  it("uses the factory preset when the mount does not override it", () => {
    expect(resolvePresetKey({ factoryPresetKey: "admin" }).presetKey).toBe("admin");
  });

  it("lets a mount override the factory preset, including switching to default", () => {
    expect(resolvePresetKey({ factoryPresetKey: "admin", mountPresetKey: "i18n" }).presetKey).toBe(
      "i18n",
    );
    expect(
      resolvePresetKey({ factoryPresetKey: "admin", mountPresetKey: "default" }).presetKey,
    ).toBe("default");
  });

  it("preserves raw keys but trims the name used for lookup", () => {
    expect(resolvePresetKey({ mountPresetKey: "  admin  " })).toEqual({
      presetKey: "admin",
      requestedPresetKey: "  admin  ",
      explicitPresetKey: "admin",
    });
  });

  it("preserves the existing fallback semantics for an empty mount key", () => {
    expect(resolvePresetKey({ factoryPresetKey: "admin", mountPresetKey: " " })).toEqual({
      presetKey: "default",
      requestedPresetKey: " ",
      explicitPresetKey: undefined,
    });
  });
});
