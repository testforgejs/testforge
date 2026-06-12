import { describe, expectTypeOf, it } from "vitest";
import type { PlainObject } from "../../types";
import { isPlainObject } from "../isPlainObject.js";

describe("isPlainObject type assertions", () => {
  it("should narrow the type from 'unknown' to 'PlainObject' when condition is true", () => {
    const value: unknown = { foo: "bar" };

    if (isPlainObject(value)) {
      // Inside the if block, the type must be successfully narrowed to PlainObject
      expectTypeOf(value).toEqualTypeOf<PlainObject>();
    } else {
      // In the else block, the type remains unknown
      expectTypeOf(value).toEqualTypeOf<unknown>();
    }
  });

  it("should filter out non-object types from a union when condition is true", () => {
    // The original union type, which is often encountered when processing data
    const value = { foo: "bar" } as PlainObject | string | number[];

    if (isPlainObject(value)) {
      // The string and array must be fully filtered by the compiler
      expectTypeOf(value).toEqualTypeOf<PlainObject>();
    } else {
      // Only non-objects (string | number[]) remain in the else block
      expectTypeOf(value).toEqualTypeOf<string | number[]>();
    }
  });
});
