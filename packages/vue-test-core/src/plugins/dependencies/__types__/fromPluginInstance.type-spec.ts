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

{
  const reference = fromPluginInstance("testPlugin", (instance) => instance.value);

  type _Reference = Expect<Equal<typeof reference, PluginInstanceReference<"testPlugin", string>>>;
}

{
  fromPluginInstance("testPlugin", (instance) => {
    type _Instance = Expect<Equal<typeof instance, TestPluginInstance>>;

    return instance.value;
  });
}

{
  fromPluginInstance("otherPlugin", (instance) => {
    type _Instance = Expect<Equal<typeof instance, OtherPluginInstance>>;

    return instance.count;
  });
}

{
  const reference = fromPluginInstance("otherPlugin", (instance) => ({
    doubled: instance.count * 2,
  }));

  type _Result = Expect<
    Equal<typeof reference, PluginInstanceReference<"otherPlugin", { doubled: number }>>
  >;
}

{
  // Registered as a plugin, but does not expose a runtime instance.
  // @ts-expect-error install-only plugins cannot be referenced by runtime instance
  fromPluginInstance("installOnlyPlugin", () => null);
}

{
  // @ts-expect-error unknown plugins cannot be referenced
  fromPluginInstance("unknownPlugin", () => null);
}
