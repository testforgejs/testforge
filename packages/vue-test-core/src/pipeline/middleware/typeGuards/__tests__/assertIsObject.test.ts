import { describe, it, expect } from "vitest";
import { assertIsObject } from "../assertIsObject.js";

describe("assertIsObject (runtime)", () => {
  describe("when given a valid object", () => {
    it("should not throw if the object is plain", () => {
      expect(() => assertIsObject({ a: 1 }, "obj")).not.toThrow();
    });

    it("should not throw if the object is empty", () => {
      expect(() => assertIsObject({}, "empty")).not.toThrow();
    });
  });

  describe("when given a nullish value", () => {
    it("hould throw an error if the value is null", () => {
      expect(() => assertIsObject(null, "nullVal")).toThrow(/"nullVal" must be an Object/);
    });
  });

  describe("when given a non-object primitive", () => {
    it("should throw an error if the value is a number", () => {
      expect(() => assertIsObject(123, "num")).toThrow(/"num" must be an Object/);
    });

    it("should throw an error if the value is a string", () => {
      expect(() => assertIsObject("text", "str")).toThrow(/"str" must be an Object/);
    });

    it("should throw an error if the value is a boolean", () => {
      expect(() => assertIsObject(true, "bool")).toThrow(/"bool" must be an Object/);
    });
  });

  describe("when given a special object type", () => {
    it("should throw an error if the value is an array", () => {
      expect(() => assertIsObject([], "arr")).toThrow(/"arr" must be an Object/);
    });
  });
});
