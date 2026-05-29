import { describe, it, expect, vi } from "vitest";
import { runPipeline } from "../runPipeline.js";

describe("runPipeline", () => {
  it("should run middlewares sequentially", () => {
    const calls = [];

    const m1 = vi.fn((ctx) => {
      calls.push("m1");
      return ctx;
    });

    const m2 = vi.fn((ctx) => {
      calls.push("m2");
      return ctx;
    });

    runPipeline({}, [m1, m2]);

    expect(calls).toEqual(["m1", "m2"]);
  });

  it("should pass updated ctx to the next middleware", () => {
    const m1 = vi.fn(() => ({ value: 1 }));
    const m2 = vi.fn((ctx) => {
      expect(ctx).toEqual({ value: 1 });
      return ctx;
    });

    runPipeline({}, [m1, m2]);

    expect(m2).toHaveBeenCalled();
  });

  it("should use previous ctx when middleware returns undefined", () => {
    const initialCtx = { a: 1 };

    const m1 = vi.fn(() => undefined);
    const m2 = vi.fn((ctx) => ctx);

    const result = runPipeline(initialCtx, [m1, m2]);

    expect(result).toBe(initialCtx);
    expect(m2).toHaveBeenCalledWith(initialCtx);
  });

  it("should use previous ctx when middleware returns null", () => {
    const initialCtx = { a: 1 };

    const m1 = vi.fn(() => null);
    const m2 = vi.fn((ctx) => ctx);

    const result = runPipeline(initialCtx, [m1, m2]);

    expect(result).toBe(initialCtx);
    expect(m2).toHaveBeenCalledWith(initialCtx);
  });

  it("should return final ctx after all middlewares", () => {
    const m1 = vi.fn(() => ({ step: 1 }));
    const m2 = vi.fn(() => ({ step: 2 }));

    const result = runPipeline({}, [m1, m2]);

    expect(result).toEqual({ step: 2 });
  });

  it("should return initial ctx when no middlewares provided", () => {
    const ctx = { a: 1 };
    const result = runPipeline(ctx, []);

    expect(result).toBe(ctx);
  });
});
