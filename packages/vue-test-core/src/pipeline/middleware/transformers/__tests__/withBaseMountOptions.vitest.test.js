import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../state/patchResultState.js", () => ({
  patchResultState: vi.fn(),
}));

import { patchResultState } from "../../../state/patchResultState.js";
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
    patchResultState.mockReturnValue(mergedCtx);

    const result = withBaseMountOptions(ctx);

    expect(patchResultState).toHaveBeenCalledWith(ctx, {
      mountOptions: {
        shallow: true,
        attachTo: "#app",
      },
    });

    expect(result).toBe(mergedCtx);
  });

  it("should exclude attrs from mountOptions processing", () => {
    const ctx = {
      defaultMountOptions: {
        attrs: { role: "button" },
      },
      mountOptions: {
        attrs: { id: "submit" },
      },
      extraOptions: { skipDefaultOptions: false },
    };

    withBaseMountOptions(ctx);

    expect(patchResultState).toHaveBeenCalledWith(ctx, {
      mountOptions: {},
    });
  });

  it("should ignore default flat mount options when skipDefaultOptions is true", () => {
    const ctx = {
      defaultMountOptions,
      mountOptions,
      extraOptions: { skipDefaultOptions: true },
    };

    patchResultState.mockReturnValue(ctx);

    withBaseMountOptions(ctx);

    expect(patchResultState).toHaveBeenCalledWith(ctx, {
      mountOptions: {
        shallow: true,
      },
    });
  });

  it("should never include global and plugins fields in result", () => {
    const ctx = {
      defaultMountOptions,
      mountOptions,
      extraOptions: { skipDefaultOptions: false },
    };

    patchResultState.mockReturnValue(ctx);

    withBaseMountOptions(ctx);

    const [, payload] = patchResultState.mock.calls[0];

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

    patchResultState.mockReturnValue(ctx);

    withBaseMountOptions(ctx);

    expect(defaultMountOptions).toEqual(defaultsCopy);
    expect(mountOptions).toEqual(overridesCopy);
  });
});
