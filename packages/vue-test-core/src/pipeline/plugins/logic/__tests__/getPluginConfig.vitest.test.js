import { describe, it, expect } from "vitest";
import { getPluginConfig } from "../getPluginConfig.js";

describe("getPluginConfig helper", () => {
  const baseCtx = {
    result: { plugins: {} },
    extraOptions: {},
  };

  it("should return false when plugin is disabled in plugins and no extraOptions", () => {
    const ctx = {
      ...baseCtx,
      result: { plugins: { pinia: false } },
    };

    expect(getPluginConfig(ctx, "pinia")).toBe(false);
  });

  it("should return false when plugin is undefined everywhere", () => {
    const ctx = { ...baseCtx };
    expect(getPluginConfig(ctx, "pinia")).toBe(false);
  });

  it("should return false when extraOptions explicitly sets false", () => {
    const ctx = {
      ...baseCtx,
      extraOptions: { pinia: false },
    };

    expect(getPluginConfig(ctx, "pinia")).toBe(false);
  });

  it("should enable plugin when defined in plugins", () => {
    const ctx = {
      ...baseCtx,
      result: { plugins: { pinia: { a: 1 } } },
    };

    expect(getPluginConfig(ctx, "pinia")).toEqual({ a: 1 });
  });

  it("should enable plugin when defined only in extraOptions", () => {
    const ctx = {
      ...baseCtx,
      extraOptions: { pinia: { b: 2 } },
    };

    expect(getPluginConfig(ctx, "pinia")).toEqual({ b: 2 });
  });

  it("should overrides plugins config using extraOptions", () => {
    const ctx = {
      ...baseCtx,
      result: { plugins: { pinia: { a: 1, c: 3 } } },
      extraOptions: { pinia: { b: 2 } },
    };

    expect(getPluginConfig(ctx, "pinia")).toEqual({
      a: 1,
      c: 3,
      b: 2,
    });
  });

  it("should re-enable and configure plugin when it is disabled in plugins but present in extraOptions", () => {
    const ctx = {
      ...baseCtx,
      result: { plugins: { pinia: false } },
      extraOptions: { pinia: { b: 2 } },
    };

    expect(getPluginConfig(ctx, "pinia")).toEqual({ b: 2 });
  });
});
