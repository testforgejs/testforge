import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../state/mergeResult.js", () => ({
  mergeResult: vi.fn(),
}));

import { mergeResult } from "../../../state/mergeResult.js";
import { withPluginsManifest } from "../withPluginsManifest.js";

describe("withPluginsManifest middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call mergeResult with supportedPlugins as plugins", () => {
    const supportedPlugins = {
      pinia: { enabled: true },
      i18n: { enabled: false },
    };

    const ctx = { supportedPlugins };
    const mergedCtx = { merged: true };

    mergeResult.mockReturnValue(mergedCtx);

    const result = withPluginsManifest(ctx);

    expect(mergeResult).toHaveBeenCalledTimes(1);
    expect(mergeResult).toHaveBeenCalledWith(ctx, {
      plugins: supportedPlugins,
    });

    expect(result).toBe(mergedCtx);
  });

  it("should pass the same supportedPlugins reference (no cloning)", () => {
    const supportedPlugins = { pinia: {} };
    const ctx = { supportedPlugins };

    mergeResult.mockReturnValue(ctx);

    withPluginsManifest(ctx);

    const [, payload] = mergeResult.mock.calls[0];

    expect(payload.plugins).toBe(supportedPlugins);
  });

  it("should work when supportedPlugins is undefined", () => {
    const ctx = {};

    mergeResult.mockReturnValue(ctx);

    const result = withPluginsManifest(ctx);

    expect(mergeResult).toHaveBeenCalledWith(ctx, {
      plugins: undefined,
    });

    expect(result).toBe(ctx);
  });
});
