import { expectType, expectError, expectAssignable } from "tsd";
// Registers PluginOptionsMap test augmentation
import "./shared-plugin-types.js";
import { captureInstance, withPluginInstance } from "../dist/index.js";

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
// PluginOptionsInput: Unknown Instance Type
// -----------------------------

type UnknownInstancePluginInput = NonNullable<PluginOptionsInput["unknownInstancePluginTypeSpec"]>;

// A plugin explicitly registered with an unknown instance type
// should accept pre-created instances of arbitrary types.

expectAssignable<UnknownInstancePluginInput>({
  ...withPluginInstance({
    id: "custom-instance",
  }),
});

expectAssignable<UnknownInstancePluginInput>({
  ...withPluginInstance({
    install() {},
    customProperty: true,
  }),
});

// Native options can be combined with a pre-created instance.

expectAssignable<UnknownInstancePluginInput>({
  apiKey: "test-key",
  ...withPluginInstance({
    id: "custom-instance",
  }),
});

// Complete native options are accepted without instance metadata.

expectAssignable<UnknownInstancePluginInput>({
  apiKey: "test-key",
});

// Required native options must still be provided
// when no pre-created instance is supplied.

expectError<UnknownInstancePluginInput>({});

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

// -----------------------------
// PluginOverridesInput: Unknown Instance Type
// -----------------------------

type UnknownInstancePluginOverride = NonNullable<
  PluginOverridesInput["unknownInstancePluginTypeSpec"]
>;

// Partial overrides can include pre-created instances
// with an unknown registered instance type.

expectAssignable<UnknownInstancePluginOverride>({
  ...withPluginInstance({
    id: "custom-instance",
  }),
});

// Instance capture is also supported in overrides.

expectAssignable<UnknownInstancePluginOverride>({
  ...captureInstance<unknown>(),
});

// Partial native configuration remains valid.

expectAssignable<UnknownInstancePluginOverride>({
  apiKey: "test-key",
});

// Explicit unknown instance registration also enables captureInstance().

const unknownCapture = captureInstance<unknown>();

expectType<unknown>(unknownCapture.instance);

expectAssignable<UnknownInstancePluginInput>({
  apiKey: "test-key",
  ...unknownCapture,
});
