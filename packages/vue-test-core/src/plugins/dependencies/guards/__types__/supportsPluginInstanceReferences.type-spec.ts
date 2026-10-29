import { test } from "vitest";

import { supportsPluginInstanceReferences } from "../supportsPluginInstanceReferences.js";

import type { PluginDefinition, PluginInstanceName, PluginName } from "../../../../types.js";
import type { Equal, Expect } from "../../../../../tests/utils/type-utils.js";

test("should narrow PluginName to PluginInstanceName when supported", () => {
  const name = "i18n" as PluginName;

  const definition: PluginDefinition = {
    create: () => ({
      install: () => {},
    }),
    supportsInstanceReferences: true,
  };

  if (supportsPluginInstanceReferences(name, definition)) {
    type _NameIsPluginInstanceName = Expect<Equal<typeof name, PluginInstanceName>>;
  }
});

test("should preserve PluginName when instance references are not supported", () => {
  const name = "i18n" as PluginName;

  const definition: PluginDefinition = {
    create: () => ({
      install: () => {},
    }),
  };

  if (!supportsPluginInstanceReferences(name, definition)) {
    type _NameRemainsPluginName = Expect<Equal<typeof name, PluginName>>;
  }
});

test("should accept only true as the supportsInstanceReferences capability marker", () => {
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

  void supportedDefinition;
  void unsupportedDefinition;
  void invalidDefinition;
});
