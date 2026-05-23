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
