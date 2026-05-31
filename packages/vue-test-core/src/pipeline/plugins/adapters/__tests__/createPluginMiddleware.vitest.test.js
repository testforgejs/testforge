import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../logic/getPluginConfig.js", () => ({
  getPluginConfig: vi.fn(),
}));

vi.mock("../../logic/patchPluginState.js", () => ({
  patchPluginState: vi.fn(),
}));

import { getPluginConfig } from "../../logic/getPluginConfig.js";
import { patchPluginState } from "../../logic/patchPluginState.js";
import { createPluginMiddleware } from "../createPluginMiddleware.js";

describe("createPluginMiddleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const name = "pinia";
  const middleware = createPluginMiddleware(name);

  it("should return ctx when plugin is disabled", () => {
    const ctx = {};
    getPluginConfig.mockReturnValue(false);

    const result = middleware(ctx);

    expect(result).toBe(ctx);
    expect(patchPluginState).not.toHaveBeenCalled();
  });

  it("should call mergePlugin with config when enabled", () => {
    const ctx = { extraOptions: {} };
    const config = { a: 1 };

    getPluginConfig.mockReturnValue(config);
    patchPluginState.mockReturnValue({ merged: true });

    const result = middleware(ctx);

    expect(patchPluginState).toHaveBeenCalledWith(ctx, name, config);
    expect(result).toEqual({ merged: true });
  });

  it("should not mutate original config", () => {
    const instance = {};
    const config = {
      a: 1,
      __meta: { instance: true },
    };

    getPluginConfig.mockReturnValue(config);

    const ctx = {
      extraOptions: {
        [name]: {
          __meta: { instance },
        },
      },
    };

    middleware(ctx);

    expect(config).toEqual({
      a: 1,
      __meta: { instance: true },
    });
  });

  it("should inject __sharedInstance from meta.instance", () => {
    const instance = {};
    const config = { a: 1 };

    const ctx = {
      extraOptions: {
        plugins: {
          [name]: {
            __meta: { instance },
          },
        },
      },
    };

    getPluginConfig.mockReturnValue(config);
    patchPluginState.mockReturnValue(ctx);

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

    const ctx = { extraOptions: {} };

    getPluginConfig.mockReturnValue(config);
    patchPluginState.mockReturnValue(ctx);

    middleware(ctx);

    expect(patchPluginState).toHaveBeenCalledWith(ctx, name, {
      a: 1,
    });
  });
});
