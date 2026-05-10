import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../state/mergeResult.js", () => ({
  mergeResult: vi.fn(),
}));

import { mergeResult } from "../../../state/mergeResult.js";
import { mergePlugin } from "../mergePlugin.js";

describe("mergePlugin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should merge new plugin config on top of existing one", () => {
    const ctx = {
      result: {
        plugins: {
          pinia: { a: 1 },
        },
      },
    };

    const config = { b: 2 };
    const mergedCtx = { merged: true };

    mergeResult.mockReturnValue(mergedCtx);

    const result = mergePlugin(ctx, "pinia", config);

    expect(mergeResult).toHaveBeenCalledWith(ctx, {
      plugins: {
        pinia: {
          a: 1,
          b: 2,
        },
      },
    });

    expect(result).toBe(mergedCtx);
  });

  it("should create plugin entry if it does not exist", () => {
    const ctx = {
      result: {
        plugins: {},
      },
    };

    mergeResult.mockReturnValue(ctx);

    mergePlugin(ctx, "pinia", { a: 1 });

    expect(mergeResult).toHaveBeenCalledWith(ctx, {
      plugins: {
        pinia: { a: 1 },
      },
    });
  });

  it("should create a new object for plugin config (no reference reuse)", () => {
    const existing = { a: 1 };
    const ctx = {
      result: {
        plugins: {
          pinia: existing,
        },
      },
    };

    mergeResult.mockReturnValue(ctx);

    mergePlugin(ctx, "pinia", { b: 2 });

    const [, payload] = mergeResult.mock.calls[0];

    expect(payload.plugins.pinia).not.toBe(existing);
  });

  it("should return the result of mergeResult", () => {
    const ctx = { result: { plugins: {} } };
    const mergedCtx = { ok: true };

    mergeResult.mockReturnValue(mergedCtx);

    const result = mergePlugin(ctx, "pinia", {});

    expect(result).toBe(mergedCtx);
  });
});
