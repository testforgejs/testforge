import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../state/patchResultState.js", () => ({
  patchResultState: vi.fn(),
}));

import { patchResultState } from "../../../state/patchResultState.js";
import { withPluginsBase } from "../withPluginsBase.js";

describe("withPluginsBase middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultMountOptions = {
    plugins: {
      pinia: { enabled: true },
    },
  };

  const mountOptions = {
    plugins: {
      i18n: { enabled: false },
    },
  };

  it("should merge default and override plugins when skipDefaultOptions is false", () => {
    const ctx = {
      defaultMountOptions,
      mountOptions,
      extraOptions: { skipDefaultOptions: false },
    };

    const mergedCtx = { merged: true };
    patchResultState.mockReturnValue(mergedCtx);

    const result = withPluginsBase(ctx);

    expect(patchResultState).toHaveBeenCalledWith(ctx, {
      plugins: {
        pinia: { enabled: true },
        i18n: { enabled: false },
      },
    });

    expect(result).toBe(mergedCtx);
  });

  it("should use only override plugins when skipDefaultOptions is true", () => {
    const ctx = {
      defaultMountOptions,
      mountOptions,
      extraOptions: { skipDefaultOptions: true },
    };

    patchResultState.mockReturnValue(ctx);

    withPluginsBase(ctx);

    expect(patchResultState).toHaveBeenCalledWith(ctx, {
      plugins: {
        i18n: { enabled: false },
      },
    });
  });

  it("should handle missing plugins safely", () => {
    const ctx = {
      defaultMountOptions: {},
      mountOptions: {},
      extraOptions: { skipDefaultOptions: false },
    };

    patchResultState.mockReturnValue(ctx);

    withPluginsBase(ctx);

    expect(patchResultState).toHaveBeenCalledWith(ctx, {
      plugins: {},
    });
  });

  it("should create a new plugins object (no reference to source)", () => {
    const ctx = {
      defaultMountOptions,
      mountOptions,
      extraOptions: { skipDefaultOptions: false },
    };

    patchResultState.mockReturnValue(ctx);

    withPluginsBase(ctx);

    const [, payload] = patchResultState.mock.calls[0];

    expect(payload.plugins).not.toBe(defaultMountOptions.plugins);
    expect(payload.plugins).not.toBe(mountOptions.plugins);
  });
});
