import { expectType, expectError } from "tsd";
import type { PluginOptionsInput, PluginOverridesInput } from "../dist/index";

// Test plugin types

interface PiniaOptions {
  stubActions?: boolean;
  initialState?: Record<string, unknown>;
}

interface I18nOptions {
  locale?: string;
}

// Module augmentation

declare module "../dist/index" {
  interface PluginOptionsMap {
    pinia: PiniaOptions;
    i18n: I18nOptions;
  }
}

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

const validOverrideWithMeta: PluginOverridesInput = {
  pinia: {
    __meta: {},
    stubActions: true,
  },
};

expectType<PluginOverridesInput>(validOverrideWithMeta);

expectError<PluginOverridesInput>({
  pinia: 123,
});

expectError<PluginOverridesInput>({
  pinia: {
    unknownProperty: true,
  },
});
