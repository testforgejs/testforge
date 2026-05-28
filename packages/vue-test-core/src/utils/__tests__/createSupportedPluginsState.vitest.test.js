import { describe, it, expect, vi } from "vitest";
import { createSupportedPluginsState } from "../createSupportedPluginsState.js";

describe("createSupportedPluginsState", () => {
  describe("Edge Cases", () => {
    it("should return empty object when preset is undefined", () => {
      expect(createSupportedPluginsState(undefined)).toEqual({});
    });

    it("should return empty object when preset is null", () => {
      expect(createSupportedPluginsState(null)).toEqual({});
    });

    it("should return empty object when preset has no manifest", () => {
      expect(createSupportedPluginsState({})).toEqual({});
    });

    it("should return empty object when manifest is empty", () => {
      const preset = { manifest: [] };

      expect(createSupportedPluginsState(preset)).toEqual({});
    });
  });

  describe("Manifest Mapping", () => {
    it("should map enabled plugins to true and disabled plugins to false", () => {
      const mockPinia = { getName: vi.fn(() => "pinia") };
      const mockI18n = { getName: vi.fn(() => "i18n") };

      const preset = {
        manifest: [
          { module: mockPinia, enabled: true },
          { module: mockI18n, enabled: false },
        ],
      };

      const result = createSupportedPluginsState(preset);

      expect(result).toEqual({
        pinia: true,
        i18n: false,
      });
    });

    it("should call getName for each manifest entry", () => {
      const getNameA = vi.fn(() => "a");
      const getNameB = vi.fn(() => "b");

      const preset = {
        manifest: [
          { module: { getName: getNameA }, enabled: true },
          { module: { getName: getNameB }, enabled: true },
        ],
      };

      createSupportedPluginsState(preset);

      expect(getNameA).toHaveBeenCalledTimes(1);
      expect(getNameB).toHaveBeenCalledTimes(1);
    });
  });
});
