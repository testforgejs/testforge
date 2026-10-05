import { isPluginInstanceReference } from "../../../../src/plugins/dependencies/isPluginInstanceReference.js";

import type { PluginInstanceName, PluginInstanceReference } from "../../../../src/types";

import type { Equal, Expect } from "../../../../tests/utils/type-utils.js";

interface TestPluginInstance {
  value: string;
}

declare module "../../../../src/types" {
  interface PluginOptionsMap {
    testPlugin: object;
  }

  interface PluginInstanceMap {
    testPlugin: TestPluginInstance;
  }
}

{
  const value: unknown = {};

  if (isPluginInstanceReference(value)) {
    type _Narrowed = Expect<
      Equal<typeof value, PluginInstanceReference<PluginInstanceName, unknown>>
    >;
  }
}

{
  const value: unknown = {};

  if (!isPluginInstanceReference(value)) {
    type _NotNarrowed = Expect<Equal<typeof value, unknown>>;
  }
}
