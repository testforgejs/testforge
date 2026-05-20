import { describe, it, expect } from "vitest";
import { mergePluginPresets } from "../mergePluginPresets";

function createCtx({ plugins = {}, pluginPresets = {} } = {}) {
  return {
    result: {
      plugins: { ...plugins },
      pluginPresets: { ...pluginPresets },
    },
  };
}

describe("mergePluginPresets", () => {
  it("should merge preset as base and keeps plugin config priority", () => {
    const ctx = createCtx({
      pluginPresets: {
        pinia: { a: 1, b: 2 },
      },
      plugins: {
        pinia: { b: 999, c: 3 },
      },
    });

    mergePluginPresets(ctx, "pinia");

    expect(ctx.result.plugins.pinia).toEqual({
      a: 1,
      b: 999,
      c: 3,
    });
  });

  it("should use only preset when plugin config is undefined", () => {
    const ctx = createCtx({
      pluginPresets: {
        i18n: { locale: "en" },
      },
      plugins: {},
    });

    mergePluginPresets(ctx, "i18n");

    expect(ctx.result.plugins.i18n).toEqual({
      locale: "en",
    });
  });

  it("should keep plugin disabled when explicitly set to false", () => {
    const ctx = createCtx({
      pluginPresets: {
        router: { history: true },
      },
      plugins: {
        router: false,
      },
    });

    mergePluginPresets(ctx, "router");

    expect(ctx.result.plugins.router).toBe(false);
  });

  it("should create empty object when neither preset nor plugin config exist", () => {
    const ctx = createCtx();

    mergePluginPresets(ctx, "unknown");

    expect(ctx.result.plugins.unknown).toEqual({});
  });

  it("should return the same ctx reference", () => {
    const ctx = createCtx({
      pluginPresets: { pinia: { a: 1 } },
      plugins: { pinia: {} },
    });

    const result = mergePluginPresets(ctx, "pinia");

    expect(result).toBe(ctx);
  });
});
