import { assertIsObject } from "../assertIsObject";

declare const value: unknown;

assertIsObject(value, "value");

// Type narrowing check
void value.foo;
void value["bar"];

// @ts-expect-error value is not string
const s: string = value;
