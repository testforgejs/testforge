import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../state/mergeResult.js", () => ({
  mergeResult: vi.fn(),
}));

import { mergeResult } from "../../../state/mergeResult.js";
import { withPreset } from "../withPreset.js";

describe("withPreset middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return same ctx and does not call mergeResult when preset.defaults is missing", () => {
    const ctx = {
      preset: {}, // No defaults
      foo: "bar",
    };

    const result = withPreset(ctx);

    expect(result).toBe(ctx);
    expect(mergeResult).not.toHaveBeenCalled();
  });

  it("should call mergeResult with pluginPresets when preset.defaults exists", () => {
    const ctx = {
      preset: {
        defaults: {
          pinia: true,
          i18n: false,
        },
      },
    };

    const mergedCtx = { merged: true };
    mergeResult.mockReturnValue(mergedCtx);

    const result = withPreset(ctx);

    expect(mergeResult).toHaveBeenCalledTimes(1);
    expect(mergeResult).toHaveBeenCalledWith(ctx, {
      pluginPresets: {
        pinia: true,
        i18n: false,
      },
    });

    expect(result).toBe(mergedCtx);
  });

  it("should handle undefined preset safely", () => {
    const ctx = {};

    const result = withPreset(ctx);

    expect(result).toBe(ctx);
    expect(mergeResult).not.toHaveBeenCalled();
  });

  it("should not mutate preset.defaults object", () => {
    const defaults = { pinia: true };
    const ctx = {
      preset: { defaults },
    };

    mergeResult.mockReturnValue(ctx);

    withPreset(ctx);

    expect(defaults).toEqual({ pinia: true });
  });
});
