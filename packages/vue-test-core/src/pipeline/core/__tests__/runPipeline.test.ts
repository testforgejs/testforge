import { describe, it, expect, vi } from "vitest";
import { runPipeline } from "../runPipeline.js";
import { createMockCtx } from "../../__tests__/fixtures.js";

const ctx = createMockCtx();

describe("runPipeline", () => {
  it("should run middlewares sequentially", () => {
    const calls: string[] = [];

    const m1 = vi.fn((ctx) => {
      calls.push("m1");
      return ctx;
    });

    const m2 = vi.fn((ctx) => {
      calls.push("m2");
      return ctx;
    });

    runPipeline(ctx, [m1, m2]);

    expect(calls).toEqual(["m1", "m2"]);
  });

  it("should pass updated ctx to the next middleware", () => {
    const updatedCtx = createMockCtx({ extraOptions: { preset: "x" } });
    const m1 = vi.fn(() => updatedCtx);

    const m2 = vi.fn((ctx) => {
      expect(ctx.extraOptions).toEqual({ preset: "x" });
      return ctx;
    });

    runPipeline(ctx, [m1, m2]);

    expect(m2).toHaveBeenCalled();
  });

  it("should use previous ctx when middleware returns undefined", () => {
    const initialCtx = createMockCtx({ mountOptions: { attrs: { a: 1 } } });

    const m1 = vi.fn(() => undefined);
    const m2 = vi.fn((ctx) => ctx);

    const result = runPipeline(initialCtx, [m1, m2]);

    expect(result).toBe(initialCtx);
    expect(m2).toHaveBeenCalledWith(initialCtx);
  });

  it("should use previous ctx when middleware returns null", () => {
    const initialCtx = createMockCtx({ mountOptions: { attrs: { a: 1 } } });

    const m1 = vi.fn(() => null);
    const m2 = vi.fn((ctx) => ctx);

    const result = runPipeline(initialCtx, [m1, m2]);

    expect(result).toBe(initialCtx);
    expect(m2).toHaveBeenCalledWith(initialCtx);
  });

  it("should return final ctx after all middlewares", () => {
    const m1 = vi.fn(() => createMockCtx({ mountOptions: { attrs: { step: 1 } } }));
    const m2 = vi.fn(() => createMockCtx({ mountOptions: { attrs: { step: 2 } } }));

    const result = runPipeline(ctx, [m1, m2]);

    expect(result.mountOptions.attrs).toEqual({ step: 2 });
  });

  it("should return initial ctx when no middlewares provided", () => {
    const initialCtx = createMockCtx({ mountOptions: { attrs: { a: 1 } } });
    const result = runPipeline(initialCtx, []);
    expect(result).toBe(initialCtx);
  });
});
