import { test } from "vitest";

import { assertIsPlainObjectValue } from "../assertIsPlainObjectValue.js";
import type { Equal, Expect } from "../../../tests/utils/type-utils.js";

/**
 * The function must narrow an unknown value to Record<string, unknown>
 * after the assertion succeeds.
 */
test("should narrow unknown to Record<string, unknown>", () => {
  const unknownValue: unknown = {
    id: 1,
    name: "Alice",
  };

  assertIsPlainObjectValue(unknownValue);

  type _Result = Expect<Equal<typeof unknownValue, Record<string, unknown>>>;
});

/**
 * After the assertion, string-key access must be available.
 */
test("should allow dynamic property access after narrowing", () => {
  const dynamicValue: unknown = {
    id: 1,
    name: "Alice",
  };

  assertIsPlainObjectValue(dynamicValue);

  const id = dynamicValue["id"];
  const name = dynamicValue["name"];

  type _Id = Expect<Equal<typeof id, unknown>>;
  type _Name = Expect<Equal<typeof name, unknown>>;
});

/**
 * The assertion must preserve existing type information when
 * the value already has a more specific object type.
 */
test("should preserve the type of an already typed object", () => {
  const objectValue = {
    id: 1,
    name: "Alice",
  };

  assertIsPlainObjectValue(objectValue);

  type _Result = Expect<
    Equal<
      typeof objectValue,
      {
        id: number;
        name: string;
      }
    >
  >;
});

/**
 * Objects without a prototype are valid plain objects and should
 * be narrowed to Record<string, unknown>.
 */
test("should narrow objects without a prototype", () => {
  const noProtoValue: unknown = Object.create(null);

  assertIsPlainObjectValue(noProtoValue);

  type _Result = Expect<Equal<typeof noProtoValue, Record<string, unknown>>>;
});

/**
 * Any runtime value is accepted by the TypeScript API because the helper
 * is designed to validate unknown runtime input. Invalid values are rejected
 * at runtime, not at compile time.
 */
test("should accept unknown input regardless of its runtime value", () => {
  const runtimeValue: unknown = "abc";

  assertIsPlainObjectValue(runtimeValue);

  type _Result = Expect<Equal<typeof runtimeValue, Record<string, unknown>>>;
});

/**
 * The second argument is optional and must not affect type narrowing.
 */
test("should narrow unknown when the assertion name is omitted", () => {
  const valueWithDefaultName: unknown = {};

  assertIsPlainObjectValue(valueWithDefaultName);

  type _Result = Expect<Equal<typeof valueWithDefaultName, Record<string, unknown>>>;
});

/**
 * A custom assertion name is also accepted.
 */
test("should narrow unknown with a custom assertion name", () => {
  const valueWithCustomName: unknown = {};

  assertIsPlainObjectValue(valueWithCustomName, "custom value");

  type _Result = Expect<Equal<typeof valueWithCustomName, Record<string, unknown>>>;
});
