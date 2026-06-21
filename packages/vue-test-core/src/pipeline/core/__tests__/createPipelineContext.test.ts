import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../utils/getActivePreset.js", () => ({
  getActivePreset: vi.fn(),
}));

vi.mock("../../../utils/createSupportedPluginsState.js", () => ({
  createSupportedPluginsState: vi.fn(),
}));

import { getActivePreset } from "../../../utils/getActivePreset.js";
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
    mockGetActivePreset.mockReturnValue({ manifest: [], defaults: { a: { opt: 1 } } });
    mockCreateSupportedPluginsState.mockReturnValue({ pinia: true });

    const ctx = createPipelineContext({
      extraOptions: {},
      presets: {},
    });

    expect(ctx.preset).toEqual({ manifest: [], defaults: { a: { opt: 1 } } });
    expect(ctx.supportedPlugins).toEqual({ pinia: true });
  });

  it("should call buildSupportedPlugins with active preset", () => {
    mockGetActivePreset.mockReturnValue({ manifest: [], defaults: { x: {} } });
    mockCreateSupportedPluginsState.mockReturnValue({});

    createPipelineContext({
      presets: {},
      extraOptions: {},
    });

    expect(mockCreateSupportedPluginsState).toHaveBeenCalledWith({
      manifest: [],
      defaults: { x: {} },
    });
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
