import { expectType, expectError } from "tsd";

import type { ComponentFactoryExtraOptions } from "../dist/index";

interface PiniaOptions {
  stubActions?: boolean;
  initialState?: Record<string, unknown>;
}

interface I18nOptions {
  locale?: string;
}

declare module "../dist/index" {
  interface PluginOptionsMap {
    pinia: PiniaOptions;
    i18n: I18nOptions;
  }
}

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

const withMeta: ComponentFactoryExtraOptions = {
  plugins: {
    pinia: {
      __meta: {},
      stubActions: true,
    },
  },
};

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
  preset: "default",
  skipDefaultProps: true,
  skipDefaultSlots: true,
  skipDefaultOptions: true,
};

expectType<ComponentFactoryExtraOptions>(validFlags);

expectError<ComponentFactoryExtraOptions>({
  skipDefaultOptions: "yes",
});
