import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../presets/getActivePreset.js", () => ({
  getActivePreset: vi.fn(),
}));

vi.mock("../../../utils/createSupportedPluginsState.js", () => ({
  createSupportedPluginsState: vi.fn(),
}));

import { getActivePreset } from "../../../presets/getActivePreset.js";
import { createSupportedPluginsState } from "../../../utils/createSupportedPluginsState.js";
import { createPipelineContext } from "../createPipelineContext.js";

const mockGetActivePreset = vi.mocked(getActivePreset);
const mockCreateSupportedPluginsState = vi.mocked(createSupportedPluginsState);

describe("createPipelineContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create base context structure", () => {
    mockGetActivePreset.mockReturnValue({ manifest: [], defaults: {} });
    mockCreateSupportedPluginsState.mockReturnValue({ pinia: true });

    const ctx = createPipelineContext({
      defaultMountOptions: { attrs: { a: 1 } },
      mountOptions: { attrs: { b: 2 } },
      extraOptions: { preset: "presetA" },
      presets: { default: { manifest: [], defaults: {} } },
    });

    expect(ctx.defaultMountOptions).toEqual({ attrs: { a: 1 } });
    expect(ctx.mountOptions).toEqual({ attrs: { b: 2 } });
    expect(ctx.extraOptions).toEqual({ preset: "presetA" });
    expect(ctx.preset).toEqual({ manifest: [], defaults: {} });
  });

  it("should call getActivePreset with correct arguments", () => {
    mockGetActivePreset.mockReturnValue({ manifest: [], defaults: {} });
    mockCreateSupportedPluginsState.mockReturnValue({});

    createPipelineContext({
      extraOptions: { preset: "presetA" },
      presets: { presetA: { manifest: [], defaults: {} } },
    });

    expect(mockGetActivePreset).toHaveBeenCalledWith(
      { presetA: { manifest: [], defaults: {} } },
      { preset: "presetA" },
    );
  });

  it("should set preset and supportedPlugins correctly", () => {
    const preset = {
      manifest: [],
      defaults: {
        a: () => ({ opt: 1 }),
      },
    };

    mockGetActivePreset.mockReturnValue(preset);
    mockCreateSupportedPluginsState.mockReturnValue({ pinia: true });

    const ctx = createPipelineContext({
      extraOptions: {},
      presets: {},
    });

    expect(ctx.preset).toBe(preset);
    expect(ctx.supportedPlugins).toEqual({ pinia: true });
  });

  it("should call createSupportedPluginsState with the active preset", () => {
    const preset = {
      manifest: [],
      defaults: {
        x: () => ({}),
      },
    };

    mockGetActivePreset.mockReturnValue(preset);
    mockCreateSupportedPluginsState.mockReturnValue({});

    createPipelineContext({
      presets: {},
      extraOptions: {},
    });

    expect(mockCreateSupportedPluginsState).toHaveBeenCalledWith(preset);
  });

  it("should initialize result with correct structure", () => {
    mockGetActivePreset.mockReturnValue(undefined);
    mockCreateSupportedPluginsState.mockReturnValue({});

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
    mockGetActivePreset.mockReturnValue(undefined);
    mockCreateSupportedPluginsState.mockReturnValue({});

    const ctx = createPipelineContext({ presets: {} });

    expect(ctx.defaultMountOptions).toEqual({});
    expect(ctx.mountOptions).toEqual({});
    expect(ctx.extraOptions).toEqual({});
  });
});
