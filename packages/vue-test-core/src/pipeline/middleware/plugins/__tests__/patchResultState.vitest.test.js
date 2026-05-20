import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../state/patchResultState.js", () => ({
  patchResultState: vi.fn(),
}));

import { patchResultState } from "../../../state/patchResultState.js";
import { patchPluginState } from "../../../plugins/logic/patchPluginState.js";

describe("patchResultState", () => {
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

    patchResultState.mockReturnValue(mergedCtx);

    const result = patchPluginState(ctx, "pinia", config);

    expect(patchResultState).toHaveBeenCalledWith(ctx, {
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

    patchResultState.mockReturnValue(ctx);

    patchPluginState(ctx, "pinia", { a: 1 });

    expect(patchResultState).toHaveBeenCalledWith(ctx, {
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

    patchResultState.mockReturnValue(ctx);

    patchPluginState(ctx, "pinia", { b: 2 });

    const [, payload] = patchResultState.mock.calls[0];

    expect(payload.plugins.pinia).not.toBe(existing);
  });

  it("should return the result of mergeResult", () => {
    const ctx = { result: { plugins: {} } };
    const mergedCtx = { ok: true };

    patchResultState.mockReturnValue(mergedCtx);

    const result = patchPluginState(ctx, "pinia", {});

    expect(result).toBe(mergedCtx);
  });
});
