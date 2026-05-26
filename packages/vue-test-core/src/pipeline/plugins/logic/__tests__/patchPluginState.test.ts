import { describe, it, expect, vi, beforeEach } from "vitest";
import type { MockedFunction } from "vitest";

vi.mock("../../../state/patchResultState.js", () => ({
  patchResultState: vi.fn(),
}));

import { patchResultState } from "../../../state/patchResultState.js";
import { patchPluginState } from "../patchPluginState.js";
import { createTestPipelineContext } from "../../../../../tests/utils/createTestPipelineContext.js";

const mockPatchResultState = patchResultState as MockedFunction<typeof patchResultState>;

describe("patchPluginState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("plugin config merge", () => {
    it("should merge new plugin config on top of existing one", () => {
      const ctx = createTestPipelineContext({
        result: {
          plugins: {
            pinia: {
              initialState: { a: 1 },
            },
          },
        },
      });

      const config = { b: 2 };
      const mergedCtx = createTestPipelineContext({ mountOptions: { props: { merged: true } } });

      mockPatchResultState.mockReturnValue(mergedCtx);

      const result = patchPluginState(ctx, "pinia", config);

      expect(mockPatchResultState).toHaveBeenCalledWith(ctx, {
        plugins: {
          pinia: {
            initialState: { a: 1 },
            b: 2,
          },
        },
      });

      expect(result).toBe(mergedCtx);
    });

    it("should give priority to new config over existing plugin state", () => {
      const ctx = createTestPipelineContext({
        result: {
          plugins: {
            i18n: {
              locale: "en",
              legacy: true,
            },
          },
        },
      });

      mockPatchResultState.mockReturnValue(ctx);

      patchPluginState(ctx, "i18n", {
        locale: "fr",
      });

      expect(mockPatchResultState).toHaveBeenCalledWith(ctx, {
        plugins: {
          i18n: {
            locale: "fr",
            legacy: true,
          },
        },
      });
    });

    it("should create plugin entry if it does not exist", () => {
      const ctx = createTestPipelineContext({
        result: {
          plugins: {},
        },
      });

      mockPatchResultState.mockReturnValue(ctx);

      patchPluginState(ctx, "pinia", { a: 1 });

      expect(mockPatchResultState).toHaveBeenCalledWith(ctx, {
        plugins: {
          pinia: { a: 1 },
        },
      });
    });
  });

  describe("merge isolation", () => {
    it("should not affect other plugins", () => {
      const ctx = createTestPipelineContext({
        result: {
          plugins: {
            pinia: {
              initialState: { a: 1 },
            },
            i18n: { locale: "en" },
          },
        },
      });

      mockPatchResultState.mockReturnValue(ctx);

      patchPluginState(ctx, "pinia", { b: 2 });

      const [, payload] = mockPatchResultState.mock.calls[0];

      expect(payload.plugins).not.toHaveProperty("i18n");
    });

    it("should create a new object for plugin config", () => {
      const existing = { initialState: { a: 1 } };

      const ctx = createTestPipelineContext({
        result: {
          plugins: {
            pinia: existing,
          },
        },
      });

      mockPatchResultState.mockReturnValue(ctx);

      patchPluginState(ctx, "pinia", { b: 2 });

      const [, payload] = mockPatchResultState.mock.calls[0];

      expect(payload.plugins).toBeDefined();
      expect(payload.plugins!.pinia).not.toBe(existing);
    });
  });

  describe("return value", () => {
    it("should return the result of patchResultState", () => {
      const ctx = createTestPipelineContext({
        result: {
          plugins: {},
        },
      });

      const mergedCtx = createTestPipelineContext({
        result: { mountOptions: { props: { ok: true } } },
      });

      mockPatchResultState.mockReturnValue(mergedCtx);

      const result = patchPluginState(ctx, "pinia", {});

      expect(result).toBe(mergedCtx);
    });
  });
});
