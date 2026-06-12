import { describe, expect, it } from "vitest";
import { isPlainObject } from "../isPlainObject.js";

class CustomClass {
  foo = "bar";
}

describe("isPlainObject", () => {
  describe("positive scenarios", () => {
    it.each([
      { description: "an empty object", value: {} },
      { description: "an object with properties", value: { foo: "bar" } },
      { description: "an object with an empty prototype", value: Object.create(null) },
    ])("should return true when $description is provided", ({ value }) => {
      expect(isPlainObject(value)).toBe(true);
    });
  });

  describe("negative scenarios", () => {
    it.each([
      { description: "null", value: null },
      { description: "undefined", value: undefined },
      { description: "an empty array", value: [] },
      { description: "a populated array", value: [1, 2, 3] },
      { description: "a string primitive", value: "text" },
      { description: "a number primitive", value: 42 },
      { description: "a boolean primitive", value: true },
      { description: "a function", value: () => {} },
      { description: "a symbol", value: Symbol("test") },
      // test cases for class instances
      { description: "a built-in class instance (Date)", value: new Date() },
      { description: "a built-in class instance (RegExp)", value: /abc/ },
      { description: "a custom class instance", value: new CustomClass() },
    ])("should return false when $description is provided", ({ value }) => {
      expect(isPlainObject(value)).toBe(false);
    });
  });
});
