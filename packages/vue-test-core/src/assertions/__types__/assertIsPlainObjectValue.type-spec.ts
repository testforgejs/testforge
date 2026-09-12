import { assertIsPlainObjectValue } from "../assertIsPlainObjectValue.js";

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

type Expect<T extends true> = T;

/**
 * 1. Verification of unknown narrowing
 *
 * The function must narrow an unknown value to Record<string, unknown>
 * after the assertion succeeds.
 */
const unknownValue: unknown = {
  id: 1,
  name: "Alice",
};

assertIsPlainObjectValue(unknownValue);

type _t1 = Expect<Equal<typeof unknownValue, Record<string, unknown>>>;

/**
 * 2. Verification of dynamic property access
 *
 * After the assertion, string-key access must be available.
 */
const dynamicValue: unknown = {
  id: 1,
  name: "Alice",
};

assertIsPlainObjectValue(dynamicValue);

const id = dynamicValue["id"];
const name = dynamicValue["name"];

type _t2 = Expect<Equal<typeof id, unknown>>;
type _t3 = Expect<Equal<typeof name, unknown>>;

/**
 * 3. Verification with an already typed object
 *
 * The assertion must preserve existing type information when
 * the value already has a more specific object type.
 */
const objectValue = {
  id: 1,
  name: "Alice",
};

assertIsPlainObjectValue(objectValue);

type _t4 = Expect<
  Equal<
    typeof objectValue,
    {
      id: number;
      name: string;
    }
  >
>;

/**
 * 4. Verification with Object.create(null)
 *
 * Objects without a prototype are valid plain objects and should
 * be narrowed to Record<string, unknown>.
 */
const noProtoValue: unknown = Object.create(null);

assertIsPlainObjectValue(noProtoValue);

type _t5 = Expect<Equal<typeof noProtoValue, Record<string, unknown>>>;

/**
 * 5. Unknown input
 *
 * Any runtime value is accepted by the TypeScript API because the helper
 * is designed to validate unknown runtime input. Invalid values are rejected
 * at runtime, not at compile time.
 */
const runtimeValue: unknown = "abc";

assertIsPlainObjectValue(runtimeValue);

type _t6 = Expect<Equal<typeof runtimeValue, Record<string, unknown>>>;

/**
 * 6. Optional assertion name
 *
 * The second argument is optional and must not affect type narrowing.
 */
const valueWithDefaultName: unknown = {};

assertIsPlainObjectValue(valueWithDefaultName);

type _t7 = Expect<Equal<typeof valueWithDefaultName, Record<string, unknown>>>;

/**
 * A custom assertion name is also accepted.
 */
const valueWithCustomName: unknown = {};

assertIsPlainObjectValue(valueWithCustomName, "custom value");

type _t8 = Expect<Equal<typeof valueWithCustomName, Record<string, unknown>>>;
