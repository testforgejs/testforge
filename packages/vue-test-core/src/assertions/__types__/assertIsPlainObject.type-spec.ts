import { assertIsPlainObject } from "../assertIsPlainObject.js";

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

type Expect<T extends true> = T;

/**
 * 1. Verification of Successful Type Preservation (Positive Test)
 * The function must preserve the object's original structure after the assert
 */
interface User {
  id: number;
  name: string;
}

const userObj = { id: 1, name: "Alice" } as User;

// Calling an assert
assertIsPlainObject(userObj);

// Check that the type remains strictly `User` and has not been converted to an abstract `object`
type _t1 = Expect<Equal<typeof userObj, User>>;

/**
 * 2. Testing operations with Record<string, unknown>
 */
const dynamicObj = {} as Record<string, unknown>;
assertIsPlainObject(dynamicObj);
type _t2 = Expect<Equal<typeof dynamicObj, Record<string, unknown>>>;

/**
 * 3. Verification of Object.create(null) type preservation
 * It should accept objects without a prototype and treat them as an object type
 */
const noProtoObj = Object.create(null) as Record<string, any>;

// Function must accept it without compilation errors because it satisfies `T extends object`
assertIsPlainObject(noProtoObj);

// Check that the type remains strictly preserved
type _t3 = Expect<Equal<typeof noProtoObj, Record<string, any>>>;

/**
 * 4. Negative test: Prohibiting the passing of primitives
 * The function requires `T extends object`, so primitives should cause a compilation error
 */
// @ts-expect-error Argument of type 'string' is not assignable to parameter of type 'object'
assertIsPlainObject("abc");

// @ts-expect-error Argument of type 'number' is not assignable to parameter of type 'object'
assertIsPlainObject(42);

// @ts-expect-error Argument of type 'boolean' is not assignable to parameter of type 'object'
assertIsPlainObject(true);

// @ts-expect-error Argument of type 'null' is not assignable to parameter of type 'object'
assertIsPlainObject(null);
