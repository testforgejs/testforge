import { expectType, expectError } from "tsd";
// Registers PluginOptionsMap test augmentation
import "./shared-plugin-types.js";
import { withPluginInstance } from "../dist/index.js";

import type { ComponentFactoryExtraOptions } from "../dist/index.js";

const validOptions: ComponentFactoryExtraOptions = {
  plugins: {
    pinia: {
      stubActions: true,
    },
  },
};

expectType<ComponentFactoryExtraOptions>(validOptions);

const disabledPlugin: ComponentFactoryExtraOptions = {
  plugins: {
    pinia: false,
  },
};

expectType<ComponentFactoryExtraOptions>(disabledPlugin);

const existingPinia = {
  install() {},
};

const withMeta: ComponentFactoryExtraOptions = {
  plugins: {
    pinia: {
      ...withPluginInstance(existingPinia),
      stubActions: true,
    },
  },
};

// Legacy string-keyed metadata is no longer supported.

expectError<ComponentFactoryExtraOptions>({
  plugins: {
    pinia: {
      __meta: {
        instance: {},
      },
    },
  },
});

expectType<ComponentFactoryExtraOptions>(withMeta);

expectError<ComponentFactoryExtraOptions>({
  plugins: {
    vuetify: {},
  },
});

expectError<ComponentFactoryExtraOptions>({
  plugins: {
    pinia: 123,
  },
});

expectError<ComponentFactoryExtraOptions>({
  plugins: {
    pinia: {
      unknownProperty: true,
    },
  },
});

const validFlags: ComponentFactoryExtraOptions = {
  presetKey: "default",
  skipDefaultProps: true,
  skipDefaultSlots: true,
  skipDefaultOptions: true,
};

expectType<ComponentFactoryExtraOptions>(validFlags);

// Preset selection uses a registry key rather than a preset definition.

const validPresetKey: ComponentFactoryExtraOptions = {
  presetKey: "admin",
};

expectType<ComponentFactoryExtraOptions>(validPresetKey);

// Legacy preset selector is no longer supported.

expectError<ComponentFactoryExtraOptions>({
  preset: "admin",
});

// Preset keys must be strings.

expectError<ComponentFactoryExtraOptions>({
  presetKey: 123,
});

expectError<ComponentFactoryExtraOptions>({
  presetKey: null,
});

expectError<ComponentFactoryExtraOptions>({
  skipDefaultOptions: "yes",
});
