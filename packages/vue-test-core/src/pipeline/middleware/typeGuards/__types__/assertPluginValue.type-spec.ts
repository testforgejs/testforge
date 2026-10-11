import { test } from "vitest";

import { assertPluginValue } from "../assertPluginValue.js";

test("should narrow unknown to a valid plugin configuration value", () => {
  const value: unknown = {};

  assertPluginValue(value, "i18n", "plugins");

  // Type is now: Record<string, unknown> | false | undefined
  value satisfies Record<string, unknown> | false | undefined;

  // The narrowed value must not be assignable to a string.
  // @ts-expect-error
  const s: string = value;

  // Object properties must be accessible after narrowing.
  if (value) {
    void value["key"];
  }
});
