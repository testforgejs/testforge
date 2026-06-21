import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockCtx } from "../../../__tests__/fixtures.js";

vi.mock("../../../state/patchResultState.js", () => ({
  patchResultState: vi.fn(),
}));

import { patchResultState } from "../../../state/patchResultState.js";
import { withPluginsBase } from "../withPluginsBase.js";

import type { ComponentFactoryOptions, RuntimeContext } from "../../../../types";

const mockPatchResultState = vi.mocked(patchResultState);

describe("withPluginsBase middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPatchResultState.mockImplementation((ctx) => ctx);
  });

  const defaultMountOptions: ComponentFactoryOptions = {
    plugins: {
      pinia: { initialState: {} },
    },
  };

  const mountOptions: ComponentFactoryOptions = {
    plugins: {
      i18n: { messages: {} },
    },
  };

  it("should merge default and override plugins when skipDefaultOptions is false", () => {
    const ctx = createMockCtx<RuntimeContext>({
      defaultMountOptions,
      mountOptions,
      extraOptions: { skipDefaultOptions: false },
    });

    const result = withPluginsBase(ctx);

    expect(mockPatchResultState).toHaveBeenCalledWith(ctx, {
      plugins: {
        pinia: { initialState: {} },
        i18n: { messages: {} },
      },
    });

    expect(result).toBe(ctx);
  });

  it("should use only override plugins when skipDefaultOptions is true", () => {
    const ctx = createMockCtx<RuntimeContext>({
      defaultMountOptions,
      mountOptions,
      extraOptions: { skipDefaultOptions: true },
    });

    withPluginsBase(ctx);

    expect(mockPatchResultState).toHaveBeenCalledWith(ctx, {
      plugins: {
        i18n: { messages: {} },
      },
    });
  });

  it("should handle missing plugins safely", () => {
    const ctx = createMockCtx<RuntimeContext>({
      defaultMountOptions: {},
      mountOptions: {},
      extraOptions: { skipDefaultOptions: false },
    });

    withPluginsBase(ctx);

    expect(mockPatchResultState).toHaveBeenCalledWith(ctx, {
      plugins: {},
    });
  });

  it("should create a new plugins object (no reference to source)", () => {
    const ctx = createMockCtx<RuntimeContext>({
      defaultMountOptions,
      mountOptions,
      extraOptions: { skipDefaultOptions: false },
    });

    withPluginsBase(ctx);

    const [, payload] = mockPatchResultState.mock.calls[0];

    expect(payload.plugins).not.toBe(defaultMountOptions.plugins);
    expect(payload.plugins).not.toBe(mountOptions.plugins);
  });
});
