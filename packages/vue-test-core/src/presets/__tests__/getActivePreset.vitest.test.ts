import { describe, it, expect, beforeEach, vi } from "vitest";
import { getActivePreset } from "../../presets/getActivePreset.js";
import * as validateModule from "../../presets/validators/validatePreset.js";
import { DEFAULT_PRESET_NAME } from "../../constants/constants.js";

vi.spyOn(validateModule, "validatePreset").mockImplementation(() => {});

describe("getActivePreset", () => {
  const mockPresets = {
    default: { manifest: [], defaults: {} },
    custom: { manifest: [], defaults: {} },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when a valid preset is requested", () => {
    it("should return the requested preset by name from extraOptions", () => {
      const extraOptions = { presetKey: "custom" };
      const result = getActivePreset(mockPresets, extraOptions);

      expect(result).toEqual(mockPresets.custom);
    });
  });

  describe("when no preset is specified (fallback to default)", () => {
    it("should return the default preset when extraOptions is omitted", () => {
      expect(getActivePreset(mockPresets)).toEqual(mockPresets.default);
    });

    it("should return the default preset when no preset key is present in extraOptions", () => {
      const extraOptions = {};
      const result = getActivePreset(mockPresets, extraOptions);

      expect(result).toEqual(mockPresets.default);
    });

    it("should return the default preset when extraOptions.presetKey is an empty string", () => {
      const extraOptions = { presetKey: "" };
      const result = getActivePreset(mockPresets, extraOptions);

      expect(result).toEqual(mockPresets.default);
    });

    it("should return the default preset when extraOptions.presetKey contains only spaces", () => {
      const extraOptions = { presetKey: "   " };
      const result = getActivePreset(mockPresets, extraOptions);

      expect(result).toEqual(mockPresets.default);
    });

    it("should return undefined when no preset is requested and default preset does not exist", () => {
      const emptyPresets = { other: { manifest: [], defaults: {} } };
      const result = getActivePreset(emptyPresets, {});

      expect(result).toBeUndefined();
    });
  });

  describe("preset validation contract", () => {
    it("should call validatePreset with requested preset", () => {
      getActivePreset(mockPresets, { presetKey: "custom" });

      expect(validateModule.validatePreset).toHaveBeenCalledWith("custom", mockPresets.custom);
    });

    it("should call validatePreset for default preset", () => {
      getActivePreset(mockPresets, {});

      expect(validateModule.validatePreset).toHaveBeenCalledWith(
        DEFAULT_PRESET_NAME,
        mockPresets.default,
      );
    });

    it("should NOT call validatePreset if preset is not found", () => {
      const emptyPresets = {};

      getActivePreset(emptyPresets, {});

      expect(validateModule.validatePreset).not.toHaveBeenCalled();
    });
  });

  describe("error handling and edge cases", () => {
    it("should throw an error when the requested preset does not exist", () => {
      const extraOptions = { presetKey: "non-existent" };

      expect(() => {
        getActivePreset(mockPresets, extraOptions);
      }).toThrow(/Requested preset "non-existent" not found/);
    });

    it("should not crash and return default when preset property is explicitly undefined", () => {
      const extraOptions = { presetKey: undefined };

      expect(() => getActivePreset(mockPresets, extraOptions)).not.toThrow();
      expect(getActivePreset(mockPresets, extraOptions)).toEqual(mockPresets.default);
    });
  });
});
