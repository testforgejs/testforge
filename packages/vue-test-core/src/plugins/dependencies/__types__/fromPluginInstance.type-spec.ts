import { test } from "vitest";

import { fromPluginInstance } from "../../../plugins/dependencies/fromPluginInstance.js";

import type { PluginInstanceReference } from "../../../types";
import type { Equal, Expect } from "../../../../tests/utils/type-utils.js";

interface TestPluginInstance {
  value: string;
}

interface OtherPluginInstance {
  count: number;
}

declare module "../../../types" {
  interface PluginOptionsMap {
    testPlugin: object;
    otherPlugin: object;
    installOnlyPlugin: object;
  }

  interface PluginInstanceMap {
    testPlugin: TestPluginInstance;
    otherPlugin: OtherPluginInstance;
  }
}

/**
 * The returned reference must preserve the provider plugin name
 * and infer the resolver's return type.
 */
test("should infer the plugin instance reference type", () => {
  const reference = fromPluginInstance("testPlugin", (instance) => instance.value);

  type _Reference = Expect<Equal<typeof reference, PluginInstanceReference<"testPlugin", string>>>;
});

/**
 * The resolver must receive the registered runtime instance type.
 */
test("should infer the instance type for testPlugin", () => {
  fromPluginInstance("testPlugin", (instance) => {
    type _Instance = Expect<Equal<typeof instance, TestPluginInstance>>;

    return instance.value;
  });
});

/**
 * Instance inference must work independently for different plugins.
 */
test("should infer the instance type for otherPlugin", () => {
  fromPluginInstance("otherPlugin", (instance) => {
    type _Instance = Expect<Equal<typeof instance, OtherPluginInstance>>;

    return instance.count;
  });
});

/**
 * The reference must preserve the structure of the resolver's return type.
 */
test("should infer an object return type from the resolver", () => {
  const reference = fromPluginInstance("otherPlugin", (instance) => ({
    doubled: instance.count * 2,
  }));

  type _Result = Expect<
    Equal<typeof reference, PluginInstanceReference<"otherPlugin", { doubled: number }>>
  >;
});

/**
 * Plugins without registered runtime instances cannot be referenced.
 */
test("should reject plugins without a registered runtime instance", () => {
  // Registered as a plugin, but does not expose a runtime instance.
  // @ts-expect-error install-only plugins cannot be referenced by runtime instance
  fromPluginInstance("installOnlyPlugin", () => null);
});

/**
 * Unknown plugins cannot be referenced.
 */
test("should reject unknown plugin names", () => {
  // @ts-expect-error unknown plugins cannot be referenced
  fromPluginInstance("unknownPlugin", () => null);
});
