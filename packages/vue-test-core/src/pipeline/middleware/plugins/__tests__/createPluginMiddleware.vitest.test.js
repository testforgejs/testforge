import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../getPluginConfig.js", () => ({
  getPluginConfig: vi.fn(),
}));

vi.mock("../mergePlugin.js", () => ({
  mergePlugin: vi.fn(),
}));

import { getPluginConfig } from "../getPluginConfig.js";
import { mergePlugin } from "../mergePlugin.js";
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
    expect(mergePlugin).not.toHaveBeenCalled();
  });

  it("should call mergePlugin with config when enabled", () => {
    const ctx = { extraOptions: {} };
    const config = { a: 1 };

    getPluginConfig.mockReturnValue(config);
    mergePlugin.mockReturnValue({ merged: true });

    const result = middleware(ctx);

    expect(mergePlugin).toHaveBeenCalledWith(ctx, name, config);
    expect(result).toEqual({ merged: true });
  });

  it("should inject __sharedInstance from meta.instance", () => {
    const instance = {};
    const config = { a: 1 };

    const ctx = {
      extraOptions: {
        [name]: {
          __meta: { instance },
        },
      },
    };

    getPluginConfig.mockReturnValue(config);
    mergePlugin.mockReturnValue(ctx);

    middleware(ctx);

    expect(config.__sharedInstance).toBe(instance);
  });

  it("should remove __meta from config before mergePlugin", () => {
    const config = {
      a: 1,
      __meta: { something: true },
    };

    const ctx = { extraOptions: {} };

    getPluginConfig.mockReturnValue(config);
    mergePlugin.mockReturnValue(ctx);

    middleware(ctx);

    expect(config.__meta).toBeUndefined();
  });
});
