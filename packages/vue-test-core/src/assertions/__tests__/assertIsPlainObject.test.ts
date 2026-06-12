import { describe, expect, it } from "vitest";
import { assertIsPlainObject } from "../assertIsPlainObject.js";

class CustomClass {
  foo = "bar";
}

describe("assertIsPlainObject", () => {
  describe("plain objects", () => {
    it.each([
      { type: "empty object literal", value: {} },
      { type: "object literal with properties", value: { foo: "bar" } },
      { type: "object with an empty prototype", value: Object.create(null) },
    ])("should pass without error when a plain object ($type) is provided", ({ value }) => {
      expect(() => {
        assertIsPlainObject(value);
      }).not.toThrow();
    });
  });

  describe("error messages", () => {
    it("should include the custom parameter name in the error message when it is explicitly provided", () => {
      expect(() => {
        assertIsPlainObject(null as any, "options");
      }).toThrow("options must be a plain object.");
    });

    it("should fallback to the default parameter name 'value' when no name is provided", () => {
      expect(() => {
        assertIsPlainObject(null as any);
      }).toThrow("value must be a plain object.");
    });
  });

  describe("primitive values", () => {
    it.each([
      { type: "string", value: "text" },
      { type: "number", value: 42 },
      { type: "boolean", value: true },
    ])("should throw an error when a primitive ($type) is provided", ({ value }) => {
      expect(() => {
        assertIsPlainObject(value as any);
      }).toThrow("value must be a plain object.");
    });
  });

  describe("arrays", () => {
    it.each([
      { type: "empty array", value: [] },
      { type: "populated array", value: [1, 2, 3] },
    ])("should throw an error when an array ($type) is provided", ({ value }) => {
      expect(() => {
        assertIsPlainObject(value as any);
      }).toThrow("value must be a plain object.");
    });
  });

  describe("built-in class instances", () => {
    it.each([
      { type: "Date instance", value: new Date() },
      { type: "RegExp instance", value: /abc/ },
      { type: "Map instance", value: new Map() },
      { type: "Set instance", value: new Set() },
    ])("should throw an error when a $type is provided", ({ value }) => {
      expect(() => {
        assertIsPlainObject(value as any);
      }).toThrow("value must be a plain object.");
    });
  });

  describe("custom class instances", () => {
    it("should throw an error when a custom class instance is provided", () => {
      expect(() => {
        assertIsPlainObject(new CustomClass() as any);
      }).toThrow("value must be a plain object.");
    });
  });
});
