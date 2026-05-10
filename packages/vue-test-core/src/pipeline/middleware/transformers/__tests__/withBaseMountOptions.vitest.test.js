import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../state/mergeResult.js", () => ({
  mergeResult: vi.fn(),
}));

import { mergeResult } from "../../../state/mergeResult.js";
import { withBaseMountOptions } from "../withBaseMountOptions.js";

describe("withBaseMountOptions middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultMountOptions = {
    global: { a: 1 },
    plugins: { b: 2 },
    shallow: false,
    attachTo: "#app",
  };

  const mountOptions = {
    global: { c: 3 },
    plugins: { d: 4 },
    shallow: true,
    attrs: { id: "test" },
  };

  it("should merge only flat fields from defaults and overrides", () => {
    const ctx = {
      defaultMountOptions,
      mountOptions,
      extraOptions: { skipDefaultOptions: false },
    };

    const mergedCtx = { merged: true };
    mergeResult.mockReturnValue(mergedCtx);

    const result = withBaseMountOptions(ctx);

    expect(mergeResult).toHaveBeenCalledWith(ctx, {
      mountOptions: {
        shallow: true, // override
        attachTo: "#app", // from defaults
        attrs: { id: "test" }, // from overrides
      },
    });

    expect(result).toBe(mergedCtx);
  });

  it("should ignore defaults when skipDefaultOptions is true", () => {
    const ctx = {
      defaultMountOptions,
      mountOptions,
      extraOptions: { skipDefaultOptions: true },
    };

    mergeResult.mockReturnValue(ctx);

    withBaseMountOptions(ctx);

    expect(mergeResult).toHaveBeenCalledWith(ctx, {
      mountOptions: {
        shallow: true,
        attrs: { id: "test" },
      },
    });
  });

  it("should never include global and plugins fields in result", () => {
    const ctx = {
      defaultMountOptions,
      mountOptions,
      extraOptions: { skipDefaultOptions: false },
    };

    mergeResult.mockReturnValue(ctx);

    withBaseMountOptions(ctx);

    const [, payload] = mergeResult.mock.calls[0];

    expect(payload.mountOptions.global).toBeUndefined();
    expect(payload.mountOptions.plugins).toBeUndefined();
  });

  it("should not mutate source mount option objects", () => {
    const defaultsCopy = structuredClone(defaultMountOptions);
    const overridesCopy = structuredClone(mountOptions);

    const ctx = {
      defaultMountOptions,
      mountOptions,
      extraOptions: { skipDefaultOptions: false },
    };

    mergeResult.mockReturnValue(ctx);

    withBaseMountOptions(ctx);

    expect(defaultMountOptions).toEqual(defaultsCopy);
    expect(mountOptions).toEqual(overridesCopy);
  });
});
