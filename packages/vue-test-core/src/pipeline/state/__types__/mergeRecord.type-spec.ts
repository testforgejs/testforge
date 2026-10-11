import { test } from "vitest";

import { mergeRecord } from "../mergeRecord";

import type { Equal, Expect } from "../../../../tests/utils/type-utils.js";

type Base = {
  a: number;
  b: string;
};

type BaseWithOptional = {
  a: number;
  b: string;
  c?: boolean;
};

type BaseWithReadonly = {
  readonly id: string;
  name: string;
};

/**
 * The return type must preserve the original type T.
 */
test("should preserve the base type in the return value", () => {
  const base = {} as Base;

  const result = mergeRecord(base);

  type _Result = Expect<Equal<typeof result, Base>>;
});

/**
 * Applying a patch must not change the return type.
 */
test("should preserve the base type when applying a patch", () => {
  const base = {} as Base;

  const result = mergeRecord(base, { a: 123 });

  type _Result = Expect<Equal<typeof result, Base>>;
});

/**
 * A patch must only contain properties declared in T.
 */
test("should reject patch properties not declared in the base type", () => {
  const base = {} as Base;

  // @ts-expect-error Unknown properties are not allowed in Partial<T>
  mergeRecord(base, { c: true });
});

/**
 * The generic type T must be inferred from an object literal.
 */
test("should infer the return type from an object literal", () => {
  const result = mergeRecord({ x: 1, y: "s" });

  type _Result = Expect<Equal<typeof result, { x: number; y: string }>>;
});

/**
 * Optional properties must remain optional in the return type.
 */
test("should preserve optional properties in the return type", () => {
  const base = {} as BaseWithOptional;

  const result = mergeRecord(base, { a: 42 });

  type _Result = Expect<Equal<typeof result, BaseWithOptional>>;
});

/**
 * A patch may provide a valid value for an optional property.
 */
test("should accept valid values for optional properties", () => {
  const base = {} as BaseWithOptional;

  const result = mergeRecord(base, { c: true });

  type _Result = Expect<Equal<typeof result, BaseWithOptional>>;
});

/**
 * Optional properties may explicitly receive undefined.
 *
 * This is valid under the current TypeScript configuration,
 * where exactOptionalPropertyTypes is not enabled.
 */
test("should accept undefined for optional properties", () => {
  const base = {} as BaseWithOptional;

  const result = mergeRecord(base, { c: undefined });

  type _Result = Expect<Equal<typeof result, BaseWithOptional>>;
});

/**
 * A patch must reject values incompatible with optional properties.
 */
test("should reject invalid values for optional properties", () => {
  const base = {} as BaseWithOptional;

  // @ts-expect-error String is not assignable to boolean | undefined
  mergeRecord(base, { c: "not-a-boolean" });
});

/**
 * A patch may replace a readonly property because mergeRecord
 * returns a new object rather than mutating the original.
 */
test("should allow overriding readonly properties in a patch", () => {
  const base = {} as BaseWithReadonly;

  mergeRecord(base, { id: "new-id" });
});

/**
 * The return type must preserve the readonly modifier.
 */
test("should preserve readonly properties in the return type", () => {
  const base = {} as BaseWithReadonly;

  const result = mergeRecord(base, { id: "new-id" });

  type _Result = Expect<Equal<typeof result, BaseWithReadonly>>;
});

/**
 * Direct assignment to a readonly property must remain prohibited.
 */
test("should reject mutation of readonly properties in the result", () => {
  const base = {} as BaseWithReadonly;

  const result = mergeRecord(base, { id: "new-id" });

  // @ts-expect-error Cannot assign to 'id' because it is readonly
  result.id = "malicious-mutation";
});

test("should reject incompatible patch property types", () => {
  const base = {} as Base;

  // @ts-expect-error Property 'a' must be a number
  mergeRecord(base, { a: "invalid" });
});
