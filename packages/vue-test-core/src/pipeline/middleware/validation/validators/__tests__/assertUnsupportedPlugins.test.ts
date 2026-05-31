import { describe, it, expect } from "vitest";

import type { ResolvedPluginOptions } from "../../../../../types";

import { ERROR_PREFIX } from "../../../../../constants/constants.js";

import { assertUnsupportedPlugins } from "../assertUnsupportedPlugins.js";

describe("assertUnsupportedPlugins", () => {
  it("should NOT throw when all configured plugins are supported", () => {
    const plugins = {
      pinia: {},
      i18n: false,
    } satisfies ResolvedPluginOptions;

    const supported = new Set(["pinia", "i18n", "router"]);

    expect(() => {
      assertUnsupportedPlugins(plugins, supported);
    }).not.toThrow();
  });

  it("should throw when unsupported plugin is configured", () => {
    const plugins = {
      pinia: {},
      vuetify: {},
    };

    const supported = new Set(["pinia", "i18n"]);

    expect(() => {
      assertUnsupportedPlugins(plugins, supported);
    }).toThrow(
      `${ERROR_PREFIX} Plugin "vuetify" is configured but not supported by the active preset.`,
    );
  });

  it("should include unsupported plugin name in error message", () => {
    const plugins = {
      customPlugin: {},
    };

    const supported = new Set(["pinia"]);

    expect(() => {
      assertUnsupportedPlugins(plugins, supported);
    }).toThrow(/customPlugin/);
  });

  it("should NOT throw for empty plugin object", () => {
    const plugins = {};

    const supported = new Set(["pinia"]);

    expect(() => {
      assertUnsupportedPlugins(plugins, supported);
    }).not.toThrow();
  });

  it("should allow supported plugins configured as false", () => {
    const plugins = {
      pinia: false,
    } satisfies ResolvedPluginOptions;

    const supported = new Set(["pinia"]);

    expect(() => {
      assertUnsupportedPlugins(plugins, supported);
    }).not.toThrow();
  });
});
