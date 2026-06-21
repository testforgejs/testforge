import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockCtx } from "../../../__tests__/fixtures.js";

vi.mock("../../../../utils/mergeConfigs.js", () => ({
  mergeConfigs: vi.fn(),
}));

vi.mock("../../../state/patchResultState.js", () => ({
  patchResultState: vi.fn(),
}));

import { mergeConfigs } from "../../../../utils/mergeConfigs.js";
import { patchResultState } from "../../../state/patchResultState.js";
import { withGlobal } from "../withGlobal.js";

import type { RuntimeContext } from "../../../../types";

const mockMergeConfigs = vi.mocked(mergeConfigs);
const mockPatchResultState = vi.mocked(patchResultState);
const mergedResult = { merged: true };

describe("withGlobal middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockMergeConfigs.mockReturnValue(mergedResult);

    mockPatchResultState.mockImplementation((ctx) => ctx);
  });

  it("should merge default and override globals when skipDefaultOptions is false", () => {
    const ctx = createMockCtx<RuntimeContext>({
      defaultMountOptions: { global: { a: 1 } as any },
      mountOptions: { global: { b: 2 } as any },
      extraOptions: { skipDefaultOptions: false },
    });

    withGlobal(ctx);

    expect(mockMergeConfigs).toHaveBeenCalledWith({ a: 1 }, { b: 2 });

    expect(mockPatchResultState).toHaveBeenCalledWith(ctx, {
      global: mergedResult,
    });
  });

  it("should ignore defaults when skipDefaultOptions is true", () => {
    const ctx = createMockCtx<RuntimeContext>({
      defaultMountOptions: { global: { a: 1 } as any },
      mountOptions: { global: { b: 2 } as any },
      extraOptions: { skipDefaultOptions: true },
    });
    const mergedResult = { merged: true };
    mockMergeConfigs.mockReturnValue(mergedResult);

    withGlobal(ctx);

    expect(mockMergeConfigs).toHaveBeenCalledWith({}, { b: 2 });
    expect(mockPatchResultState).toHaveBeenCalledWith(ctx, {
      global: mergedResult,
    });
  });

  it("should handle missing global fields safely", () => {
    const ctx = createMockCtx<RuntimeContext>({
      defaultMountOptions: {},
      mountOptions: {},
      extraOptions: { skipDefaultOptions: false },
    });

    withGlobal(ctx);

    expect(mockMergeConfigs).toHaveBeenCalledWith({}, {});

    expect(mockPatchResultState).toHaveBeenCalledWith(ctx, {
      global: mergedResult,
    });
  });

  it("should return result of patchResultState", () => {
    const ctx = createMockCtx<RuntimeContext>({
      defaultMountOptions: { global: {} },
      mountOptions: { global: {} },
      extraOptions: { skipDefaultOptions: false },
    });

    const result = withGlobal(ctx);

    expect(result).toBe(ctx);
  });
});
