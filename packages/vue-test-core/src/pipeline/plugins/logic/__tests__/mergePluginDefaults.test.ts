import { describe, it, expect } from "vitest";
import { mergePluginDefaults } from "../mergePluginDefaults";
import { createMockCtx } from "../../../__tests__/fixtures.js";

import type { PipelineContextResult, RuntimeContext } from "../../../../types";

function createCtx({ plugins = {}, pluginDefaultsState: pluginDefaultsState = {} } = {}) {
  return createMockCtx<RuntimeContext>({
    result: {
      plugins: { ...plugins },
      pluginDefaultsState: { ...pluginDefaultsState },
    } as PipelineContextResult,
  });
}

describe("mergePluginDefaults", () => {
  it("should merge preset as base and keeps plugin config priority", () => {
    const ctx = createCtx({
      pluginDefaultsState: {
        pinia: { a: 1, b: 2 },
      },
      plugins: {
        pinia: { b: 999, c: 3 },
      },
    });

    mergePluginDefaults(ctx, "pinia");

    expect(ctx.result.plugins.pinia).toEqual({
      a: 1,
      b: 999,
      c: 3,
    });
  });

  it("should use only preset when plugin config is undefined", () => {
    const ctx = createCtx({
      pluginDefaultsState: {
        i18n: { locale: "en" },
      },
      plugins: {},
    });

    mergePluginDefaults(ctx, "i18n");

    expect(ctx.result.plugins.i18n).toEqual({
      locale: "en",
    });
  });

  it("should keep plugin disabled when explicitly set to false", () => {
    const ctx = createCtx({
      pluginDefaultsState: {
        router: { history: true },
      },
      plugins: {
        router: false,
      },
    });

    mergePluginDefaults(ctx, "router");

    expect(ctx.result.plugins.router).toBe(false);
  });

  it("should create empty object when neither preset nor plugin config exist", () => {
    const ctx = createCtx();

    mergePluginDefaults(ctx, "unknown");

    expect(ctx.result.plugins.unknown).toEqual({});
  });

  it("should return the same ctx reference", () => {
    const ctx = createCtx({
      pluginDefaultsState: { pinia: { a: 1 } },
      plugins: { pinia: {} },
    });

    const result = mergePluginDefaults(ctx, "pinia");

    expect(result).toBe(ctx);
  });
});
