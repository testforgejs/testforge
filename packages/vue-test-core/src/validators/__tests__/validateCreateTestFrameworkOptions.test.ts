import { describe, expect, it, vi } from "vitest";
import { validateCreateTestFrameworkOptions } from "../validateCreateTestFrameworkOptions.js";
import { validatePresets } from "../validatePresets.js";
import { ERROR_PREFIX } from "../../constants/constants.js";

vi.mock("../validatePresets.js", () => ({
  validatePresets: vi.fn(),
}));

describe("validateCreateTestFrameworkOptions", () => {
  it("should pass without errors when valid options are provided", () => {
    expect(() => {
      validateCreateTestFrameworkOptions({
        shallowByDefault: true,
        presets: {},
      });
    }).not.toThrow();
  });

  it("should pass without errors when called with no arguments (uses default empty object)", () => {
    expect(() => {
      validateCreateTestFrameworkOptions();
    }).not.toThrow();
  });

  it("should call validatePresets when presets property is defined", () => {
    const mockPresets = { default: { manifest: [], defaults: {} } };

    validateCreateTestFrameworkOptions({ presets: mockPresets });

    expect(validatePresets).toHaveBeenCalledWith(mockPresets);
  });

  it("should throw an error when options is not a plain object", () => {
    expect(() => {
      validateCreateTestFrameworkOptions(null as any);
    }).toThrow("createTestFramework options must be a plain object.");
  });

  it.each([
    { type: "string", value: "true" },
    { type: "number", value: 1 },
    { type: "object", value: {} },
    { type: "array", value: [] },
  ])("should throw an error when shallowByDefault is a $type", ({ value }) => {
    expect(() => {
      validateCreateTestFrameworkOptions({ shallowByDefault: value as any });
    }).toThrow(`${ERROR_PREFIX} "shallowByDefault" must be a boolean.`);
  });
});
