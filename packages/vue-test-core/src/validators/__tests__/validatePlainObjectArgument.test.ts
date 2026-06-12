import { describe, expect, it } from "vitest";
import { validatePlainObjectArgument } from "../validatePlainObjectArgument.js";
import { ERROR_PREFIX } from "../../constants/constants.js";

class CustomClass {
  foo = "bar";
}

describe("validatePlainObjectArgument", () => {
  describe("positive scenarios", () => {
    it.each([
      { description: "an empty object literal", value: {} },
      { description: "an object literal with properties", value: { foo: "bar" } },
      { description: "an object with an empty prototype", value: Object.create(null) },
    ])("should pass without error when $description is provided", ({ value }) => {
      expect(() => {
        validatePlainObjectArgument(value, "options");
      }).not.toThrow();
    });
  });

  describe("negative scenarios", () => {
    it.each([
      { type: "null", value: null },
      { type: "undefined", value: undefined },
      { type: "string", value: "text" },
      { type: "number", value: 42 },
      { type: "boolean", value: true },
      { type: "array", value: [1, 2, 3] },
      { type: "function", value: () => {} },
      { type: "Date instance", value: new Date() },
      { type: "custom class instance", value: new CustomClass() },
    ])("should throw an error when a $type is provided", ({ value }) => {
      expect(() => {
        validatePlainObjectArgument(value, "config");
      }).toThrow(`${ERROR_PREFIX} "config" must be a plain object.`);
    });
  });

  describe("error message formatting", () => {
    it("should include the provided argument name in the error message", () => {
      const customName = "customParameterName";

      expect(() => {
        validatePlainObjectArgument(null, customName);
      }).toThrow(`${ERROR_PREFIX} "${customName}" must be a plain object.`);
    });
  });
});
