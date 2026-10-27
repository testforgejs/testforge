import { expectType, expectError } from "tsd";
// Registers PluginOptionsMap test augmentation
import "./shared-plugin-types.js";
import { withPluginInstance } from "../dist/index.js";

import type {
  ComponentFactoryOptions,
  PluginOptionsInput,
  PluginOverridesInput,
} from "../dist/index.js";

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

// PluginOptionsInput supports pre-created plugin instances.

const existingPinia = {
  install() {},
};

const validOptionsWithInstance: PluginOptionsInput = {
  pinia: {
    ...withPluginInstance(existingPinia),
  },
};

expectType<PluginOptionsInput>(validOptionsWithInstance);

// Native options can be combined with a pre-created instance.

const validOptionsWithInstanceAndNativeOptions: PluginOptionsInput = {
  pinia: {
    ...withPluginInstance(existingPinia),
    stubActions: true,
  },
};

expectType<PluginOptionsInput>(validOptionsWithInstanceAndNativeOptions);

// ComponentFactoryOptions supports pre-created plugin instances.

const validMountOptionsWithInstance: ComponentFactoryOptions = {
  plugins: {
    pinia: {
      ...withPluginInstance(existingPinia),
    },
  },
};

expectType<ComponentFactoryOptions>(validMountOptionsWithInstance);

// -----------------------------
// PluginOptionsInput: Required Options
// -----------------------------

const existingRequiredPlugin = {
  install() {},
};

// Valid: all required native options are provided.

const validRequiredOptions: PluginOptionsInput = {
  requiredPlugin: {
    apiKey: "test-key",
    environment: "development",
  },
};

expectType<PluginOptionsInput>(validRequiredOptions);

// Valid: a pre-created instance makes native options optional.

const validRequiredOptionsWithInstance: PluginOptionsInput = {
  requiredPlugin: {
    ...withPluginInstance(existingRequiredPlugin),
  },
};

expectType<PluginOptionsInput>(validRequiredOptionsWithInstance);

// Valid: a pre-created instance can be combined with optional configuration.

const validRequiredOptionsWithInstanceAndOverrides: PluginOptionsInput = {
  requiredPlugin: {
    ...withPluginInstance(existingRequiredPlugin),
    debug: true,
  },
};

expectType<PluginOptionsInput>(validRequiredOptionsWithInstanceAndOverrides);

// Invalid: required native options are missing.

expectError<PluginOptionsInput>({
  requiredPlugin: {
    debug: true,
  },
});

// Invalid: only one of the required native options is provided.

expectError<PluginOptionsInput>({
  requiredPlugin: {
    apiKey: "test-key",
  },
});

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

// Legacy string-keyed metadata is not supported.

expectError<PluginOptionsInput>({
  pinia: {
    __meta: {
      instance: existingPinia,
    },
  },
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
