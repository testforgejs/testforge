import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockCtx } from "../../../__tests__/fixtures.js";

vi.mock("../../../state/patchResultState.js", () => ({
  patchResultState: vi.fn(),
}));

import { patchResultState } from "../../../state/patchResultState.js";
import { withPluginsManifest } from "../withPluginsManifest.js";

import type { RuntimeContext } from "../../../../types";

const mockPatchResultState = vi.mocked(patchResultState);

describe("withPluginsManifest middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPatchResultState.mockImplementation((ctx) => ctx);
  });

  it("should convert enabled plugins from true to empty config objects", () => {
    const supportedPlugins = {
      pinia: true,
      i18n: true,
    };

    const ctx = createMockCtx<RuntimeContext>({ supportedPlugins });

    const result = withPluginsManifest(ctx);

    expect(mockPatchResultState).toHaveBeenCalledTimes(1);
    expect(mockPatchResultState).toHaveBeenCalledWith(ctx, {
      plugins: {
        pinia: {},
        i18n: {},
      },
    });

    expect(result).toBe(ctx);
  });

  it("should guarantee that the output plugins object is a new reference", () => {
    const supportedPlugins = { pinia: true };
    const ctx = createMockCtx<RuntimeContext>({ supportedPlugins });

    withPluginsManifest(ctx);

    const [, payload] = mockPatchResultState.mock.calls[0];

    expect(payload.plugins).not.toBe(supportedPlugins);
  });

  it("should not mutate the source supportedPlugins configuration manifest", () => {
    const supportedPlugins = { pinia: true, router: false };
    const manifestCopy = { ...supportedPlugins };
    const ctx = createMockCtx<RuntimeContext>({ supportedPlugins });

    withPluginsManifest(ctx);

    // Guaranteed that the middleware works cleanly and does not mutate the preset's original manifest
    expect(supportedPlugins).toEqual(manifestCopy);
  });

  it("should preserve disabled plugins as false", () => {
    const supportedPlugins = {
      router: false,
    };
    const ctx = createMockCtx<RuntimeContext>({ supportedPlugins });

    withPluginsManifest(ctx);

    const [, payload] = mockPatchResultState.mock.calls[0];

    expect(payload.plugins).toEqual({
      router: false,
    });
  });

  it("should return empty plugins object when supportedPlugins is empty", () => {
    const ctx = createMockCtx<RuntimeContext>({
      supportedPlugins: {},
    });

    const result = withPluginsManifest(ctx);

    expect(mockPatchResultState).toHaveBeenCalledWith(ctx, {
      plugins: {},
    });

    expect(result).toBe(ctx);
  });
});
