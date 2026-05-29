import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../utils/getActivePreset.js", () => ({
  getActivePreset: vi.fn(),
}));

vi.mock("../../../utils/createSupportedPluginsState.js", () => ({
  createSupportedPluginsState: vi.fn(),
}));

import { getActivePreset } from "../../../utils/getActivePreset.js";
import { createSupportedPluginsState } from "../../../utils/createSupportedPluginsState.js";
import { createPipelineContext } from "../../core/createPipelineContext.js";

describe("createPipelineContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create base context structure", () => {
    getActivePreset.mockReturnValue("defaultPreset");
    createSupportedPluginsState.mockReturnValue({ pinia: true });

    const ctx = createPipelineContext({
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
    createSupportedPluginsState.mockReturnValue({});

    createPipelineContext({
      extraOptions: { preset: "presetA" },
      presets: { presetA: {} },
    });

    expect(getActivePreset).toHaveBeenCalledWith({ preset: "presetA" }, { presetA: {} });
  });

  it("should set preset and supportedPlugins correctly", () => {
    getActivePreset.mockReturnValue("presetA");
    createSupportedPluginsState.mockReturnValue({ pinia: true });

    const ctx = createPipelineContext({
      extraOptions: {},
      presets: {},
    });

    expect(ctx.preset).toBe("presetA");
    expect(ctx.supportedPlugins).toEqual({ pinia: true });
  });

  it("should call buildSupportedPlugins with active preset", () => {
    getActivePreset.mockReturnValue("presetX");
    createSupportedPluginsState.mockReturnValue({});

    createPipelineContext({
      presets: {},
      extraOptions: {},
    });

    expect(createSupportedPluginsState).toHaveBeenCalledWith("presetX");
  });

  it("should initialize result with correct structure", () => {
    getActivePreset.mockReturnValue("p");
    createSupportedPluginsState.mockReturnValue({});

    const ctx = createPipelineContext({
      presets: {},
    });

    expect(ctx.result).toEqual({
      mountOptions: {},
      global: {},
      pluginDefaultsState: {},
      plugins: {},
    });
  });

  it("should work with default parameters", () => {
    getActivePreset.mockReturnValue(undefined);
    createSupportedPluginsState.mockReturnValue({});

    const ctx = createPipelineContext({ presets: {} });

    expect(ctx.defaultMountOptions).toEqual({});
    expect(ctx.mountOptions).toEqual({});
    expect(ctx.extraOptions).toEqual({});
  });
});
