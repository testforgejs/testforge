import { expectType, expectError } from "tsd";
// Registers PluginOptionsMap test augmentation
import "./shared-plugin-types.js";
import { withPluginInstance } from "../dist/index.js";

import type { PluginOptionsInput, PluginOverridesInput } from "../dist/index.js";

// -----------------------------
// PluginOptionsInput
// -----------------------------

const validOptions: PluginOptionsInput = {
  pinia: {
    stubActions: true,
  },
  i18n: {
    locale: "en",
  },
};

expectType<PluginOptionsInput>(validOptions);

const disabledOptions: PluginOptionsInput = {
  pinia: false,
};

expectType<PluginOptionsInput>(disabledOptions);

// Invalid value type

expectError<PluginOptionsInput>({
  pinia: 123,
});

// Invalid property

expectError<PluginOptionsInput>({
  pinia: {
    unknownProperty: true,
  },
});

// Unknown plugin

expectError<PluginOptionsInput>({
  vuetify: {},
});

// -----------------------------
// PluginOverridesInput
// -----------------------------

const validOverrides: PluginOverridesInput = {
  pinia: {
    stubActions: true,
  },
};

expectType<PluginOverridesInput>(validOverrides);

const existingPinia = {
  install() {},
};

const validOverrideWithMeta: PluginOverridesInput = {
  pinia: {
    ...withPluginInstance(existingPinia),
    stubActions: true,
  },
};

// Legacy string-keyed metadata is no longer supported.

expectError<PluginOverridesInput>({
  pinia: {
    __meta: {
      instance: existingPinia,
    },
  },
});

expectType<PluginOverridesInput>(validOverrideWithMeta);

expectError<PluginOverridesInput>({
  pinia: 123,
});

expectError<PluginOverridesInput>({
  pinia: {
    unknownProperty: true,
  },
});
