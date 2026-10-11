import { test } from "vitest";

import { assertIsObject } from "../assertIsObject.js";

test("should narrow unknown to an object with accessible properties", () => {
  const value: unknown = {};

  assertIsObject(value, "value");

  // Type narrowing check
  void value.foo;
  void value["bar"];

  // The narrowed value must not be assignable to a string.
  // @ts-expect-error value is not string
  const s: string = value;
});
