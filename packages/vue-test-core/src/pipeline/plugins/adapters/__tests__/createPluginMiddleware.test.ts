import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockCtx } from "../../../__tests__/fixtures.js";

vi.mock("../../logic/getPluginConfig.js", () => ({
  getPluginConfig: vi.fn(),
}));

vi.mock("../../logic/patchPluginState.js", () => ({
  patchPluginState: vi.fn(),
}));

import { getPluginConfig } from "../../logic/getPluginConfig.js";
import { patchPluginState } from "../../logic/patchPluginState.js";
import { createPluginMiddleware } from "../createPluginMiddleware.js";

import { ComponentFactoryExtraOptions, RuntimeContext } from "../../../../types";

const mockGetPluginConfig = vi.mocked(getPluginConfig);
const mockPatchPluginState = vi.mocked(patchPluginState);
const mergedResult = createMockCtx({ mountOptions: { attrs: { merged: true } } });

describe("createPluginMiddleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockPatchPluginState.mockReturnValue(mergedResult);
  });

  const name = "pinia";
  const middleware = createPluginMiddleware(name);

  it("should return ctx when plugin is disabled", () => {
    const ctx = createMockCtx();
    mockGetPluginConfig.mockReturnValue(false);

    const result = middleware(ctx);

    expect(result).toBe(ctx);
    expect(patchPluginState).not.toHaveBeenCalled();
  });

  it("should call mergePlugin with config when enabled", () => {
    const ctx = createMockCtx<RuntimeContext>({ extraOptions: {} });
    const config = { a: 1 };

    mockGetPluginConfig.mockReturnValue(config);

    const result = middleware(ctx);

    expect(mockPatchPluginState).toHaveBeenCalledWith(ctx, name, config);
    expect(result).toEqual(mergedResult);
  });

  it("should not mutate original config", () => {
    const instance = {};
    const config = {
      a: 1,
      __meta: { instance: true },
    };

    mockGetPluginConfig.mockReturnValue(config);

    const ctx = createMockCtx<RuntimeContext>({
      extraOptions: {
        [name]: {
          __meta: { instance },
        },
      } as ComponentFactoryExtraOptions,
    });
    middleware(ctx);

    expect(config).toEqual({
      a: 1,
      __meta: { instance: true },
    });
  });

  it("should inject __sharedInstance from meta.instance", () => {
    const instance = {};
    const config = { a: 1 };

    const ctx = createMockCtx<RuntimeContext>({
      extraOptions: {
        plugins: {
          [name]: {
            __meta: { instance },
          },
        },
      },
    });
    mockGetPluginConfig.mockReturnValue(config);

    middleware(ctx);

    expect(patchPluginState).toHaveBeenCalledWith(ctx, name, {
      a: 1,
      __sharedInstance: instance,
    });
  });

  it("should remove __meta from config before mergePlugin", () => {
    const config = {
      a: 1,
      __meta: { instance: true },
    };

    const ctx = createMockCtx<RuntimeContext>({ extraOptions: {} });

    mockGetPluginConfig.mockReturnValue(config);

    middleware(ctx);

    expect(patchPluginState).toHaveBeenCalledWith(ctx, name, {
      a: 1,
    });
  });
});
