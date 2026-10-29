import { test } from "vitest";

import { isPluginInstanceReference } from "../../../plugins/dependencies/isPluginInstanceReference.js";

import type { PluginInstanceName, PluginInstanceReference } from "../../../types.js";
import type { Equal, Expect } from "../../../../tests/utils/type-utils.js";

interface TestPluginInstance {
  value: string;
}

declare module "../../../types.js" {
  interface PluginOptionsMap {
    testPlugin: object;
  }

  interface PluginInstanceMap {
    testPlugin: TestPluginInstance;
  }
}

/**
 * The type guard must narrow unknown to PluginInstanceReference
 * when the value is recognized as a plugin instance reference.
 */
test("should narrow unknown to PluginInstanceReference when recognized", () => {
  const value: unknown = {};

  if (isPluginInstanceReference(value)) {
    type _Narrowed = Expect<
      Equal<typeof value, PluginInstanceReference<PluginInstanceName, unknown>>
    >;
  }
});

/**
 * The type guard must preserve unknown when the value is not
 * recognized as a plugin instance reference.
 */
test("should preserve unknown when the value is not a plugin instance reference", () => {
  const value: unknown = {};

  if (!isPluginInstanceReference(value)) {
    type _NotNarrowed = Expect<Equal<typeof value, unknown>>;
  }
});
