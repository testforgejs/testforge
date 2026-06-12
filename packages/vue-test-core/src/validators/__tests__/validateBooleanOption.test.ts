import { describe, expect, it } from "vitest";
import { validateBooleanOption } from "../validateBooleanOption.js";
import { ERROR_PREFIX } from "../../constants/constants.js";

describe("validateBooleanOption", () => {
  describe("positive scenarios", () => {
    it.each([
      { description: "true", value: true },
      { description: "false", value: false },
      { description: "undefined (optional field)", value: undefined },
    ])("should pass without error when $description is provided", ({ value }) => {
      expect(() => {
        validateBooleanOption(value, "shallowByDefault");
      }).not.toThrow();
    });
  });

  describe("negative scenarios", () => {
    it.each([
      { type: "null", value: null },
      { type: "string", value: "true" },
      { type: "number", value: 1 },
      { type: "object", value: {} },
      { type: "array", value: [] },
      { type: "function", value: () => {} },
    ])("should throw an error when a $type is provided", ({ value }) => {
      expect(() => {
        validateBooleanOption(value, "shallowByDefault");
      }).toThrow(`${ERROR_PREFIX} "shallowByDefault" must be a boolean.`);
    });
  });

  describe("error message formatting", () => {
    it("should include the provided option name in the error message", () => {
      const optionName = "customOptionName";

      expect(() => {
        validateBooleanOption("not-a-boolean", optionName);
      }).toThrow(`${ERROR_PREFIX} "${optionName}" must be a boolean.`);
    });
  });
});
