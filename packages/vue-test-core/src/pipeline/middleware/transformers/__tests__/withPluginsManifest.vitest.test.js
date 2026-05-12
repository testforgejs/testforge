import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../state/patchResultState.js", () => ({
  patchResultState: vi.fn(),
}));

import { patchResultState } from "../../../state/patchResultState.js";
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

    patchResultState.mockReturnValue(mergedCtx);

    const result = withPluginsManifest(ctx);

    expect(patchResultState).toHaveBeenCalledTimes(1);
    expect(patchResultState).toHaveBeenCalledWith(ctx, {
      plugins: supportedPlugins,
    });

    expect(result).toBe(mergedCtx);
  });

  it("should pass the same supportedPlugins reference (no cloning)", () => {
    const supportedPlugins = { pinia: {} };
    const ctx = { supportedPlugins };

    patchResultState.mockReturnValue(ctx);

    withPluginsManifest(ctx);

    const [, payload] = patchResultState.mock.calls[0];

    expect(payload.plugins).toBe(supportedPlugins);
  });

  it("should work when supportedPlugins is undefined", () => {
    const ctx = {};

    patchResultState.mockReturnValue(ctx);

    const result = withPluginsManifest(ctx);

    expect(patchResultState).toHaveBeenCalledWith(ctx, {
      plugins: undefined,
    });

    expect(result).toBe(ctx);
  });
});
