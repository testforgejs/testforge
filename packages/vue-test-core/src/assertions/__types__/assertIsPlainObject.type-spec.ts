import { test } from "vitest";

import { assertIsPlainObject } from "../assertIsPlainObject.js";

import type { Equal, Expect } from "../../../tests/utils/type-utils.js";

/**
 * Verification of successful type preservation.
 *
 * The assertion must preserve the object's original type without
 * widening it to a generic `object`.
 */
test("should preserve the original object type", () => {
  interface User {
    id: number;
    name: string;
  }

  const userObj = { id: 1, name: "Alice" } as User;

  assertIsPlainObject(userObj);

  // The type must remain exactly `User`.
  type _Result = Expect<Equal<typeof userObj, User>>;
});

/**
 * Verification of Record<string, unknown> type preservation.
 *
 * The assertion must preserve the existing Record type without
 * changing its index signature or value type.
 */
test("should preserve Record<string, unknown>", () => {
  const dynamicObj = {} as Record<string, unknown>;

  assertIsPlainObject(dynamicObj);

  type _Result = Expect<Equal<typeof dynamicObj, Record<string, unknown>>>;
});

/**
 * Verification of Object.create(null) type preservation.
 *
 * Objects without a prototype must be accepted by the TypeScript API
 * because they satisfy the `T extends object` constraint.
 *
 * The assertion must preserve their original type.
 */
test("should preserve the type of objects without a prototype", () => {
  const noProtoObj = Object.create(null) as Record<string, any>;

  assertIsPlainObject(noProtoObj);

  type _Result = Expect<Equal<typeof noProtoObj, Record<string, any>>>;
});

/**
 * Negative test: primitive arguments must be rejected.
 *
 * The function requires `T extends object`, so primitive values
 * must produce TypeScript compilation errors.
 */
test("should reject primitive arguments", () => {
  // @ts-expect-error Argument of type 'string' is not assignable to parameter of type 'object'
  assertIsPlainObject("abc");

  // @ts-expect-error Argument of type 'number' is not assignable to parameter of type 'object'
  assertIsPlainObject(42);

  // @ts-expect-error Argument of type 'boolean' is not assignable to parameter of type 'object'
  assertIsPlainObject(true);

  // @ts-expect-error Argument of type 'null' is not assignable to parameter of type 'object'
  assertIsPlainObject(null);
});
