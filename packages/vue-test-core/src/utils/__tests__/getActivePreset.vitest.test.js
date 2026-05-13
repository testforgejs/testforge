import { describe, it, expect, beforeEach } from "vitest";
import { getActivePreset } from "../getActivePreset.js";
import * as validateModule from "../validatePreset.js";
vi.spyOn(validateModule, "validatePreset").mockImplementation(() => {});

describe("getActivePreset", () => {
  const mockPresets = {
    default: { name: "default-preset", manifest: [] },
    custom: { name: "custom-preset", manifest: [] },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when a valid preset is requested", () => {
    it("should return the requested preset by name from extraOptions", () => {
      const extraOptions = { preset: "custom" };
      const result = getActivePreset(extraOptions, mockPresets);

      expect(result).toEqual(mockPresets.custom);
    });
  });

  describe("when no preset is specified (fallback to default)", () => {
    it("should return the default preset when extraOptions is null or undefined", () => {
      expect(getActivePreset(null, mockPresets)).toEqual(mockPresets.default);
      expect(getActivePreset(undefined, mockPresets)).toEqual(
        mockPresets.default,
      );
    });

    it("should return the default preset when no preset key is present in extraOptions", () => {
      const extraOptions = {};
      const result = getActivePreset(extraOptions, mockPresets);

      expect(result).toEqual(mockPresets.default);
    });

    it("should return the default preset when extraOptions.preset is an empty string", () => {
      const extraOptions = { preset: "" };
      const result = getActivePreset(extraOptions, mockPresets);

      expect(result).toEqual(mockPresets.default);
    });

    it("should return the default preset when extraOptions.preset contains only spaces", () => {
      const extraOptions = { preset: "   " };
      const result = getActivePreset(extraOptions, mockPresets);

      expect(result).toEqual(mockPresets.default);
    });

    it("should return undefined when no preset is requested and default preset does not exist", () => {
      const emptyPresets = { other: { name: "other" } };
      const result = getActivePreset({}, emptyPresets);

      expect(result).toBeUndefined();
    });
  });

  describe("preset validation contract", () => {
    it("should call validatePreset with requested preset", () => {
      getActivePreset({ preset: "custom" }, mockPresets);

      expect(validateModule.validatePreset).toHaveBeenCalledWith(
        "custom",
        mockPresets.custom,
      );
    });

    it("should call validatePreset for default preset", () => {
      getActivePreset({}, mockPresets);

      expect(validateModule.validatePreset).toHaveBeenCalledWith(
        "default",
        mockPresets.default,
      );
    });

    it("should NOT call validatePreset if preset is not found", () => {
      const emptyPresets = {};

      getActivePreset({}, emptyPresets);

      expect(validateModule.validatePreset).not.toHaveBeenCalled();
    });
  });

  describe("error handling and edge cases", () => {
    it("should throw an error when the requested preset does not exist", () => {
      const extraOptions = { preset: "non-existent" };

      expect(() => {
        getActivePreset(extraOptions, mockPresets);
      }).toThrow(/Requested preset "non-existent" not found/);
    });

    it("should not crash and return default when preset property is explicitly undefined", () => {
      const extraOptions = { preset: undefined };

      expect(() => getActivePreset(extraOptions, mockPresets)).not.toThrow();
      expect(getActivePreset(extraOptions, mockPresets)).toEqual(
        mockPresets.default,
      );
    });
  });
});
