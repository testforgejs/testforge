import { describe, it, expect } from "vitest";
import { assertIsObject } from "../assertIsObject.js";

describe("assertIsObject (runtime)", () => {
  it("does not throw for plain object", () => {
    expect(() => assertIsObject({ a: 1 }, "obj")).not.toThrow();
  });

  it("does not throw for empty object", () => {
    expect(() => assertIsObject({}, "empty")).not.toThrow();
  });

  it("throws for null", () => {
    expect(() => assertIsObject(null, "nullVal")).toThrow(/"nullVal" must be an Object/);
  });

  it("throws for array", () => {
    expect(() => assertIsObject([], "arr")).toThrow(/"arr" must be an Object/);
  });

  it("throws for number", () => {
    expect(() => assertIsObject(123, "num")).toThrow(/"num" must be an Object/);
  });

  it("throws for string", () => {
    expect(() => assertIsObject("text", "str")).toThrow(/"str" must be an Object/);
  });

  it("throws for boolean", () => {
    expect(() => assertIsObject(true, "bool")).toThrow(/"bool" must be an Object/);
  });
});
