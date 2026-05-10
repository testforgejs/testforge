import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../../utils/deepMerge.js", () => ({
  deepMerge: vi.fn(),
}));

vi.mock("../../../state/mergeResult.js", () => ({
  mergeResult: vi.fn(),
}));

import { deepMerge } from "../../../../utils/deepMerge.js";
import { mergeResult } from "../../../state/mergeResult.js";
import { withGlobal } from "../withGlobal.js";

describe("withGlobal middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should merge default and override globals when skipDefaultOptions is false", () => {
    const ctx = {
      defaultMountOptions: { global: { a: 1 } },
      mountOptions: { global: { b: 2 } },
      extraOptions: { skipDefaultOptions: false },
    };

    deepMerge.mockReturnValue({ merged: true });
    mergeResult.mockReturnValue(ctx);

    withGlobal(ctx);

    expect(deepMerge).toHaveBeenCalledWith({ a: 1 }, { b: 2 });

    expect(mergeResult).toHaveBeenCalledWith(ctx, {
      global: { merged: true },
    });
  });

  it("should ignore defaults when skipDefaultOptions is true", () => {
    const ctx = {
      defaultMountOptions: { global: { a: 1 } },
      mountOptions: { global: { b: 2 } },
      extraOptions: { skipDefaultOptions: true },
    };

    deepMerge.mockReturnValue({ merged: true });
    mergeResult.mockReturnValue(ctx);

    withGlobal(ctx);

    expect(deepMerge).toHaveBeenCalledWith({}, { b: 2 });
  });

  it("should handle missing global fields safely", () => {
    const ctx = {
      defaultMountOptions: {},
      mountOptions: {},
      extraOptions: { skipDefaultOptions: false },
    };

    deepMerge.mockReturnValue({});
    mergeResult.mockReturnValue(ctx);

    withGlobal(ctx);

    expect(deepMerge).toHaveBeenCalledWith({}, {});
  });

  it("should return result of mergeResult", () => {
    const ctx = {
      defaultMountOptions: { global: {} },
      mountOptions: { global: {} },
      extraOptions: { skipDefaultOptions: false },
    };

    const mergedCtx = { merged: true };

    deepMerge.mockReturnValue({});
    mergeResult.mockReturnValue(mergedCtx);

    const result = withGlobal(ctx);

    expect(result).toBe(mergedCtx);
  });
});
