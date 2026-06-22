import { describe, it, expect } from "vitest";
import { getPluginConfig } from "../getPluginConfig.js";
import { createMockCtx } from "../../../__tests__/fixtures.js";

import type {
  PipelineContext,
  RuntimeContext,
  ComponentFactoryExtraOptions,
} from "../../../../types";

describe("getPluginConfig helper", () => {
  it("should return false when plugin is explicitly disabled in pipeline state and no extraOptions are provided", () => {
    const ctx = createMockCtx<RuntimeContext>({
      result: { plugins: { pinia: false } },
    });
    expect(getPluginConfig(ctx, "pinia")).toBe(false);
  });

  it("should return false as a defensive fallback when plugin state is undefined everywhere", () => {
    const ctx = createMockCtx<RuntimeContext>({
      result: { plugins: {} },
      extraOptions: {},
    });
    expect(getPluginConfig(ctx, "pinia")).toBe(false);
  });

  it("should return false when extraOptions explicitly disables the plugin, overriding enabled state", () => {
    const ctx = createMockCtx<RuntimeContext>({
      extraOptions: { plugins: { pinia: false } },
    });

    expect(getPluginConfig(ctx, "pinia")).toBe(false);
  });

  it("should extract configuration when plugin is defined only in plugins", () => {
    const ctx = createMockCtx<RuntimeContext>({
      result: { plugins: { pinia: { a: 1 } } },
    });

    expect(getPluginConfig(ctx, "pinia")).toEqual({ a: 1 });
  });

  it("should extract configuration when plugin is defined only via extraOptions overrides", () => {
    const ctx = createMockCtx<RuntimeContext>({
      extraOptions: { plugins: { pinia: { initialState: { b: 2 } } } },
    });

    expect(getPluginConfig(ctx, "pinia")).toEqual({ initialState: { b: 2 } });
  });

  it("should shallow-merge pipeline state with extraOptions, giving priority to extraOptions", () => {
    const ctx = createMockCtx<RuntimeContext>({
      result: { plugins: { pinia: { a: 1, c: 3 } } },
      extraOptions: { plugins: { pinia: { b: 2 } } } as ComponentFactoryExtraOptions,
    });

    expect(getPluginConfig(ctx, "pinia")).toEqual({
      a: 1,
      c: 3,
      b: 2,
    });
  });

  it("should re-enable and configure plugin when it is disabled in plugins but present in extraOptions", () => {
    const ctx = createMockCtx<RuntimeContext>({
      result: { plugins: { pinia: false } },
      extraOptions: { plugins: { pinia: { b: 2 } } } as ComponentFactoryExtraOptions,
    });

    expect(getPluginConfig(ctx, "pinia")).toEqual({ b: 2 });
  });
});
