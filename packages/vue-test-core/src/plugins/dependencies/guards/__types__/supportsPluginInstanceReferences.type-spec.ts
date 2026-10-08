import { supportsPluginInstanceReferences } from "../supportsPluginInstanceReferences.js";

import type { PluginDefinition, PluginInstanceName, PluginName } from "../../../../types";
import type { Equal, Expect } from "../../../../../tests/utils/type-utils.js";

declare const name: PluginName;
declare const definition: PluginDefinition;

if (supportsPluginInstanceReferences(name, definition)) {
  type _NameIsPluginInstanceName = Expect<Equal<typeof name, PluginInstanceName>>;
}

declare const anotherName: PluginName;
declare const anotherDefinition: PluginDefinition;

if (!supportsPluginInstanceReferences(anotherName, anotherDefinition)) {
  type _NameRemainsPluginName = Expect<Equal<typeof anotherName, PluginName>>;
}

const supportedDefinition = {
  create: () => ({
    install: () => {},
  }),
  supportsInstanceReferences: true,
} satisfies PluginDefinition;

const unsupportedDefinition = {
  create: () => ({
    install: () => {},
  }),
} satisfies PluginDefinition;

const invalidDefinition: PluginDefinition = {
  create: () => ({
    install: () => {},
  }),
  // @ts-expect-error supportsInstanceReferences is a capability marker and may only be true
  supportsInstanceReferences: false,
};
