import { assertPluginValue } from "../assertPluginValue";

declare const value: unknown;

assertPluginValue(value, "i18n", "plugins");

// Type is now: Record<string, unknown> | false | undefined
value satisfies Record<string, unknown> | false | undefined;

// @ts-expect-error
const s: string = value;

if (value) {
  void value["key"];
}
