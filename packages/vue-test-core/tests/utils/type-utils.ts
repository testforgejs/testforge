/**
 * Evaluates to `true` when two types are exactly equal.
 */
export type Equal<TActual, TExpected> =
  (<T>() => T extends TActual ? 1 : 2) extends <T>() => T extends TExpected ? 1 : 2 ? true : false;

/**
 * Produces a type error unless the supplied type evaluates to `true`.
 */
export type Expect<T extends true> = T;

/**
 * Produces a type error unless the supplied type evaluates to `false`.
 */
export type ExpectFalse<T extends false> = T;
