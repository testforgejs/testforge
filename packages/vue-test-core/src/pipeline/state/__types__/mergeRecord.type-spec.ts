import { mergeRecord } from "../mergeRecord";

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

type Expect<T extends true> = T;

type Base = {
  a: number;
  b: string;
};

const base = {} as Base;

/**
 * 1. Return type preserves T
 */
const r1 = mergeRecord(base);
type _t1 = Expect<Equal<typeof r1, Base>>;

/**
 * 2. Patch keeps T
 */
const r2 = mergeRecord(base, { a: 123 });
type _t2 = Expect<Equal<typeof r2, Base>>;

/**
 * 3. Patch must be Partial<T>
 */
// @ts-expect-error
mergeRecord(base, { c: true });

/**
 * 4. Inference works from object literal
 */
const r4 = mergeRecord({ x: 1, y: "s" });
type _t4 = Expect<Equal<typeof r4, { x: number; y: string }>>;

type BaseWithOptional = {
  a: number;
  b: string;
  c?: boolean; // <-- Optional property
};

const baseWithOpt = {} as BaseWithOptional;

/**
 * 5. Optional property is preserved in return type
 */
const r5 = mergeRecord(baseWithOpt, { a: 42 });
// Check that the final type ‘c’ remains optional (the type is exactly equal to `BaseWithOptional`)
type _t5 = Expect<Equal<typeof r5, BaseWithOptional>>;

/**
 * 6. Patch allows explicitly passing valid value for optional property
 */
const r6 = mergeRecord(baseWithOpt, { c: true });
type _t6 = Expect<Equal<typeof r6, BaseWithOptional>>;

/**
 * 7. Patch allows passing `undefined` to optional property
 * (This is valid because in Partial<T>, optional fields can be undefined)
 */
const r7 = mergeRecord(baseWithOpt, { c: undefined });
type _t7 = Expect<Equal<typeof r7, BaseWithOptional>>;

/**
 * 8. Negative Test: Cannot pass wrong type to optional property
 */
// @ts-expect-error Type 'string' is not assignable to type 'boolean | undefined'
mergeRecord(baseWithOpt, { c: "not-a-boolean" });

// A base type where one of the properties is write-protected
type BaseWithReadonly = {
  readonly id: string; // <-- Read-only property
  name: string;
};

const baseWithReadonly = {} as BaseWithReadonly;

/**
 * 9. Patch allows changing a readonly property
 * (This is valid because `mergeRecord` returns a new object)
 */
const r9 = mergeRecord(baseWithReadonly, { id: "new-id" });

/**
 * 10. Return type PRESERVES the readonly modifier
 */
type _t10 = Expect<Equal<typeof r9, BaseWithReadonly>>;

/**
 * 11. Negative Test: Ensuring the returned property is indeed readonly
 * (Verify that TypeScript does not allow direct modification of
 * the ‘id’ property on the object returned by the function)
 */
// @ts-expect-error Cannot assign to 'id' because it is a read-only property
r9.id = "malicious-mutation";
