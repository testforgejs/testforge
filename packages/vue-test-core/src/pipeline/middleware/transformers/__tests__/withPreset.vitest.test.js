import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../state/patchResultState.js", () => ({
  patchResultState: vi.fn(),
}));

import { patchResultState } from "../../../state/patchResultState.js";
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
    expect(patchResultState).not.toHaveBeenCalled();
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
    patchResultState.mockReturnValue(mergedCtx);

    const result = withPreset(ctx);

    expect(patchResultState).toHaveBeenCalledTimes(1);
    expect(patchResultState).toHaveBeenCalledWith(ctx, {
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
    expect(patchResultState).not.toHaveBeenCalled();
  });

  it("should not mutate preset.defaults object", () => {
    const defaults = { pinia: true };
    const ctx = {
      preset: { defaults },
    };

    patchResultState.mockReturnValue(ctx);

    withPreset(ctx);

    expect(defaults).toEqual({ pinia: true });
  });
});
