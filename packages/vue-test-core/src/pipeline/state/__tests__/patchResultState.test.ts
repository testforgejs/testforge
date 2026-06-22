import { describe, it, expect } from "vitest";
import { patchResultState } from "../patchResultState.js";
import { createMockCtx } from "../../__tests__/fixtures.js";

import type {
  PipelineContextResult,
  PipelineResultPatch,
  RuntimePluginConfig,
} from "../../../types";
import type { MountingOptions } from "@vue/test-utils";

const createCtxResult = () => ({
  result: {
    mountOptions: { a: 1 },
    plugins: { p1: true },
    pluginDefaultsState: { pinia: false },
    global: { g: 1 },
  } as unknown as PipelineContextResult,
});

describe("patchResultState", () => {
  it("should return the same ctx reference", () => {
    const ctx = createMockCtx(createCtxResult());
    const returned = patchResultState(ctx, {});

    expect(returned).toBe(ctx);
  });

  it("should not overwrite existing data when patch is empty", () => {
    const ctx = createMockCtx(createCtxResult());
    const snapshot = JSON.parse(JSON.stringify(ctx.result));

    patchResultState(ctx, {});

    expect(ctx.result).toEqual(snapshot);
  });

  it("should merge mountOptions correctly", () => {
    const ctx = createMockCtx(createCtxResult());

    patchResultState(ctx, {
      mountOptions: { b: 2 } as MountingOptions<any, any>,
    });

    expect(ctx.result.mountOptions).toEqual({ a: 1, b: 2 });
  });

  it("should merge plugins correctly", () => {
    const ctx = createMockCtx(createCtxResult());

    patchResultState(ctx, {
      plugins: { p2: false },
    });

    expect(ctx.result.plugins).toEqual({ p1: true, p2: false });
  });

  it("should merge pluginDefaultsState correctly", () => {
    const ctx = createMockCtx(createCtxResult());

    patchResultState(ctx, {
      pluginDefaultsState: { i18n: { language: "en" } } as RuntimePluginConfig,
    });

    expect(ctx.result.pluginDefaultsState).toEqual({
      pinia: false,
      i18n: { language: "en" },
    });
  });

  it("should merge global correctly", () => {
    const ctx = createMockCtx(createCtxResult());

    patchResultState(ctx, {
      global: { g2: 2 } as MountingOptions<any, any>["global"],
    });

    expect(ctx.result.global).toEqual({ g: 1, g2: 2 });
  });

  it("should not affect other sections when patching one section", () => {
    const ctx = createMockCtx(createCtxResult());

    patchResultState(ctx, {
      plugins: { p2: false },
    });

    expect(ctx.result.mountOptions).toEqual({ a: 1 });
    expect(ctx.result.pluginDefaultsState).toEqual({ pinia: false });
    expect(ctx.result.global).toEqual({ g: 1 });
  });

  it("should ignore unknown fields in patch", () => {
    const ctx = createMockCtx(createCtxResult());

    patchResultState(ctx, {
      unknown: { x: 1 },
    } as PipelineResultPatch);

    expect(ctx.result).toEqual({
      mountOptions: { a: 1 },
      plugins: { p1: true },
      pluginDefaultsState: { pinia: false },
      global: { g: 1 },
    });
  });

  it("should not mutate the patch object", () => {
    const ctx = createMockCtx(createCtxResult());
    const patch = {
      plugins: { p2: {} },
    };

    const snapshot = JSON.parse(JSON.stringify(patch));

    patchResultState(ctx, patch);

    expect(patch).toEqual(snapshot);
  });

  it("should preserve already initialized result sections", () => {
    const ctx = createMockCtx(createCtxResult());

    patchResultState(ctx, {
      plugins: {},
    });

    expect(ctx.result.mountOptions).toBeDefined();
    expect(ctx.result.plugins).toBeDefined();
    expect(ctx.result.pluginDefaultsState).toBeDefined();
    expect(ctx.result.global).toBeDefined();
  });
});
