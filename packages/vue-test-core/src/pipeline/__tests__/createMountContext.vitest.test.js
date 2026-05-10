import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../utils/getActivePreset.js", () => ({
  getActivePreset: vi.fn(),
}));

vi.mock("../../utils/buildSupportedPlugins.js", () => ({
  buildSupportedPlugins: vi.fn(),
}));

import { getActivePreset } from "../../utils/getActivePreset.js";
import { buildSupportedPlugins } from "../../utils/buildSupportedPlugins.js";
import { createMountContext } from "../createMountContext.js";

describe("createMountContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create base context structure", () => {
    getActivePreset.mockReturnValue("defaultPreset");
    buildSupportedPlugins.mockReturnValue({ pinia: true });

    const ctx = createMountContext({
      defaultMountOptions: { a: 1 },
      mountOptions: { b: 2 },
      extraOptions: { c: 3 },
      presets: {},
    });

    expect(ctx.defaultMountOptions).toEqual({ a: 1 });
    expect(ctx.mountOptions).toEqual({ b: 2 });
    expect(ctx.extraOptions).toEqual({ c: 3 });
  });

  it("should call getActivePreset with correct arguments", () => {
    getActivePreset.mockReturnValue("presetA");
    buildSupportedPlugins.mockReturnValue({});

    createMountContext({
      extraOptions: { preset: "presetA" },
      presets: { presetA: {} },
    });

    expect(getActivePreset).toHaveBeenCalledWith(
      { preset: "presetA" },
      { presetA: {} },
    );
  });

  it("should set preset and supportedPlugins correctly", () => {
    getActivePreset.mockReturnValue("presetA");
    buildSupportedPlugins.mockReturnValue({ pinia: true });

    const ctx = createMountContext({
      extraOptions: {},
      presets: {},
    });

    expect(ctx.preset).toBe("presetA");
    expect(ctx.supportedPlugins).toEqual({ pinia: true });
  });

  it("should call buildSupportedPlugins with active preset", () => {
    getActivePreset.mockReturnValue("presetX");
    buildSupportedPlugins.mockReturnValue({});

    createMountContext({
      presets: {},
      extraOptions: {},
    });

    expect(buildSupportedPlugins).toHaveBeenCalledWith("presetX");
  });

  it("should initialize result with correct structure", () => {
    getActivePreset.mockReturnValue("p");
    buildSupportedPlugins.mockReturnValue({});

    const ctx = createMountContext({
      presets: {},
    });

    expect(ctx.result).toEqual({
      mountOptions: {},
      global: {},
      pluginPresets: {},
      plugins: {},
    });
  });

  it("should work with default parameters", () => {
    getActivePreset.mockReturnValue(undefined);
    buildSupportedPlugins.mockReturnValue({});

    const ctx = createMountContext({ presets: {} });

    expect(ctx.defaultMountOptions).toEqual({});
    expect(ctx.mountOptions).toEqual({});
    expect(ctx.extraOptions).toEqual({});
  });
});
