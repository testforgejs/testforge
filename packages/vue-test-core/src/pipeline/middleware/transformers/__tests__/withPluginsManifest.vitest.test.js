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

  it("should convert enabled plugins from true to empty config objects", () => {
    const supportedPlugins = {
      pinia: true,
      i18n: true,
      router: false,
    };

    const ctx = { supportedPlugins };
    const mergedCtx = { merged: true };

    patchResultState.mockReturnValue(mergedCtx);

    const result = withPluginsManifest(ctx);

    expect(patchResultState).toHaveBeenCalledTimes(1);

    expect(patchResultState).toHaveBeenCalledWith(ctx, {
      plugins: {
        pinia: {},
        i18n: {},
        router: false,
      },
    });

    expect(result).toBe(mergedCtx);
  });

  it("should create a new plugins object instead of reusing supportedPlugins reference", () => {
    const supportedPlugins = {
      pinia: true,
    };

    const ctx = { supportedPlugins };

    patchResultState.mockReturnValue(ctx);

    withPluginsManifest(ctx);

    const [, payload] = patchResultState.mock.calls[0];

    expect(payload.plugins).not.toBe(supportedPlugins);
  });

  it("should preserve disabled plugins as false", () => {
    const supportedPlugins = {
      router: false,
    };

    const ctx = { supportedPlugins };

    patchResultState.mockReturnValue(ctx);

    withPluginsManifest(ctx);

    const [, payload] = patchResultState.mock.calls[0];

    expect(payload.plugins).toEqual({
      router: false,
    });
  });

  it("should return empty plugins object when supportedPlugins is empty", () => {
    const ctx = {
      supportedPlugins: {},
    };

    patchResultState.mockReturnValue(ctx);

    const result = withPluginsManifest(ctx);

    expect(patchResultState).toHaveBeenCalledWith(ctx, {
      plugins: {},
    });

    expect(result).toBe(ctx);
  });
});
