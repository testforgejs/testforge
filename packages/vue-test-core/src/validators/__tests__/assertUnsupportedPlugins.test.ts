import { describe, it, expect } from "vitest";
import { ERROR_PREFIX } from "../../constants/constants.js";
import { assertUnsupportedPlugins } from "../../validators/assertUnsupportedPlugins.js";

import type { ResolvedPluginOptions } from "../../types.js";

describe("assertUnsupportedPlugins", () => {
  describe("Supported Plugins", () => {
    it("should not throw when all configured plugins are supported", () => {
      const plugins = {
        pinia: {},
        i18n: false,
      } satisfies ResolvedPluginOptions;

      const supported = new Set(["pinia", "i18n", "router"]);

      expect(() => {
        assertUnsupportedPlugins(plugins, supported);
      }).not.toThrow();
    });

    it("should not throw for an empty plugin object", () => {
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

    it("should accept a readonly set of supported plugins", () => {
      const plugins = {
        pinia: {},
      };

      const supported: ReadonlySet<string> = new Set(["pinia"]);

      expect(() => {
        assertUnsupportedPlugins(plugins, supported);
      }).not.toThrow();
    });
  });

  describe("Unsupported Plugins", () => {
    it("should throw when an unsupported plugin is configured", () => {
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

    it("should reject unsupported plugins even when configured as false", () => {
      const plugins = {
        pinia: false,
      } satisfies ResolvedPluginOptions;

      const supported = new Set(["i18n"]);

      expect(() => {
        assertUnsupportedPlugins(plugins, supported);
      }).toThrow(
        `${ERROR_PREFIX} Plugin "pinia" is configured but not supported by the active preset.`,
      );
    });
  });

  describe("Error Messages", () => {
    it("should include the unsupported plugin name", () => {
      const plugins = {
        customPlugin: {},
      };

      const supported = new Set(["pinia"]);

      expect(() => {
        assertUnsupportedPlugins(plugins, supported);
      }).toThrow(/customPlugin/);
    });

    it("should include the specified preset description", () => {
      const plugins = {
        pinia: {},
      };

      const supported = new Set(["i18n"]);

      expect(() => {
        assertUnsupportedPlugins(plugins, supported, 'preset "i18nPreset"');
      }).toThrow(
        `${ERROR_PREFIX} Plugin "pinia" is configured but not supported by preset "i18nPreset".`,
      );
    });
  });
});
