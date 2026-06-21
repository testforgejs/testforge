import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockCtx } from "../../../__tests__/fixtures.js";

vi.mock("../../../state/patchResultState.js", () => ({
  patchResultState: vi.fn(),
}));

import { patchResultState } from "../../../state/patchResultState.js";
import { withPreset } from "../withPreset.js";

import { PresetDefinition, RuntimeContext } from "../../../../types";

const mockPatchResultState = vi.mocked(patchResultState);

describe("withPreset middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPatchResultState.mockImplementation((ctx) => ctx);
  });

  it("should return same ctx and not call patchResultState when preset is undefined", () => {
    const ctx = createMockCtx<RuntimeContext>({ preset: undefined });
    const result = withPreset(ctx);

    expect(result).toBe(ctx);
    expect(mockPatchResultState).not.toHaveBeenCalled();
  });

  it("should return same ctx and not call patchResultState when preset.defaults is missing", () => {
    const ctx = createMockCtx<RuntimeContext>({
      preset: { manifest: [] } as unknown as PresetDefinition,
    });
    const result = withPreset(ctx);

    expect(result).toBe(ctx);
    expect(mockPatchResultState).not.toHaveBeenCalled();
  });

  it("should call patchResultState with pluginDefaultsState when preset.defaults exists", () => {
    const pluginDefaultsState = {
      pinia: { app: { isLoaded: true } },
      i18n: { language: "en" },
    };
    const ctx = createMockCtx<RuntimeContext>({
      preset: {
        manifest: [],
        defaults: pluginDefaultsState,
      },
    });
    const result = withPreset(ctx);

    expect(mockPatchResultState).toHaveBeenCalledTimes(1);
    expect(mockPatchResultState).toHaveBeenCalledWith(ctx, { pluginDefaultsState });
    expect(result).toBe(ctx);
  });

  it("should shallow-copy preset.defaults to protect the original reference from direct root mutation", () => {
    const defaults = { pinia: { app: { isLoaded: true } } };
    const ctx = createMockCtx<RuntimeContext>({
      preset: { manifest: [], defaults },
    });

    withPreset(ctx);

    const [, payload] = mockPatchResultState.mock.calls[0];

    expect(payload.pluginDefaultsState).not.toBe(defaults);
    expect(payload.pluginDefaultsState).toEqual(defaults);
  });
});
