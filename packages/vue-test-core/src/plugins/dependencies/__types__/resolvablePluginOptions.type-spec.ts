import { test } from "vitest";

import { fromPluginInstance } from "../../../plugins/dependencies/fromPluginInstance.js";

import type { PluginOptionsInput, PluginOverridesInput } from "../../../types.js";

interface TestProviderInstance {
  currentLocale: string;
}

interface TestLocaleAdapter {
  name: string;
  messages: Record<string, string>;
}

interface TestConsumerOptions {
  enabled: boolean;

  locale?: {
    adapter?: TestLocaleAdapter;
  };
}

declare module "../../../types.js" {
  interface PluginOptionsMap {
    resolvableProvider: object;
    resolvableConsumer: TestConsumerOptions;
  }

  interface PluginInstanceMap {
    resolvableProvider: TestProviderInstance;
  }
}

/**
 * Plugin options must accept nested references when the resolver
 * returns a value compatible with the target property.
 */
test("should accept nested plugin instance references", () => {
  const options = {
    resolvableConsumer: {
      enabled: true,

      locale: {
        adapter: fromPluginInstance("resolvableProvider", (instance) => ({
          name: instance.currentLocale,
          messages: {},
        })),
      },
    },
  } satisfies PluginOptionsInput;

  void options;
});

/**
 * Plugin options must continue accepting ordinary values
 * without requiring deferred instance references.
 */
test("should accept regular plugin options", () => {
  const options = {
    resolvableConsumer: {
      enabled: true,

      locale: {
        adapter: {
          name: "en",
          messages: {},
        },
      },
    },
  } satisfies PluginOptionsInput;

  void options;
});

/**
 * A deferred reference must resolve to a value compatible
 * with the target plugin configuration property.
 */
test("should reject incompatible resolved values", () => {
  const options = {
    resolvableConsumer: {
      enabled: true,

      locale: {
        // @ts-expect-error Adapter must resolve to TestLocaleAdapter.
        adapter: fromPluginInstance("resolvableProvider", () => 123),
      },
    },
  } satisfies PluginOptionsInput;

  void options;
});

/**
 * The top-level managed plugin configuration must remain
 * an options object or false, not an instance reference.
 */
test("should reject references as top-level plugin options", () => {
  const options = {
    // @ts-expect-error Top-level plugin configuration cannot be a reference.
    resolvableConsumer: fromPluginInstance("resolvableProvider", () => ({
      enabled: true,
    })),
  } satisfies PluginOptionsInput;

  void options;
});

/**
 * Plugin overrides must accept nested references while
 * preserving their partial configuration semantics.
 */
test("should accept nested references in partial plugin overrides", () => {
  const overrides = {
    resolvableConsumer: {
      locale: {
        adapter: fromPluginInstance("resolvableProvider", (instance) => ({
          name: instance.currentLocale,
          messages: {},
        })),
      },
    },
  } satisfies PluginOverridesInput;

  void overrides;
});

/**
 * Plugin overrides must reject references whose resolved
 * values are incompatible with the target property.
 */
test("should reject incompatible references in plugin overrides", () => {
  const overrides = {
    resolvableConsumer: {
      locale: {
        // @ts-expect-error Adapter must resolve to TestLocaleAdapter.
        adapter: fromPluginInstance("resolvableProvider", () => 123),
      },
    },
  } satisfies PluginOverridesInput;

  void overrides;
});

/**
 * Managed plugins must remain configurable as disabled
 * through both regular options and plugin overrides.
 */
test("should preserve false as a valid plugin configuration", () => {
  const options = {
    resolvableConsumer: false,
  } satisfies PluginOptionsInput;

  const overrides = {
    resolvableConsumer: false,
  } satisfies PluginOverridesInput;

  void options;
  void overrides;
});
