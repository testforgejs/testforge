import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../../utils/mergeConfigs.js", () => ({
  mergeConfigs: vi.fn(),
}));

vi.mock("../../../state/patchResultState.js", () => ({
  patchResultState: vi.fn(),
}));

import { mergeConfigs } from "../../../../utils/mergeConfigs.js";
import { patchResultState } from "../../../state/patchResultState.js";
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

    mergeConfigs.mockReturnValue({ merged: true });
    patchResultState.mockReturnValue(ctx);

    withGlobal(ctx);

    expect(mergeConfigs).toHaveBeenCalledWith({ a: 1 }, { b: 2 });

    expect(patchResultState).toHaveBeenCalledWith(ctx, {
      global: { merged: true },
    });
  });

  it("should ignore defaults when skipDefaultOptions is true", () => {
    const ctx = {
      defaultMountOptions: { global: { a: 1 } },
      mountOptions: { global: { b: 2 } },
      extraOptions: { skipDefaultOptions: true },
    };

    mergeConfigs.mockReturnValue({ merged: true });
    patchResultState.mockReturnValue(ctx);

    withGlobal(ctx);

    expect(mergeConfigs).toHaveBeenCalledWith({}, { b: 2 });
  });

  it("should handle missing global fields safely", () => {
    const ctx = {
      defaultMountOptions: {},
      mountOptions: {},
      extraOptions: { skipDefaultOptions: false },
    };

    mergeConfigs.mockReturnValue({});
    patchResultState.mockReturnValue(ctx);

    withGlobal(ctx);

    expect(mergeConfigs).toHaveBeenCalledWith({}, {});
  });

  it("should return result of mergeResult", () => {
    const ctx = {
      defaultMountOptions: { global: {} },
      mountOptions: { global: {} },
      extraOptions: { skipDefaultOptions: false },
    };

    const mergedCtx = { merged: true };

    mergeConfigs.mockReturnValue({});
    patchResultState.mockReturnValue(mergedCtx);

    const result = withGlobal(ctx);

    expect(result).toBe(mergedCtx);
  });
});
