import { describe, expect, it } from "vitest";

import { ERROR_PREFIX } from "../../constants/constants.js";
import { validateFactoryPresetPlugins } from "../validateFactoryPresetPlugins.js";

import type { TestFrameworkPresets, ComponentFactoryOptions } from "../../types.js";

describe("validateFactoryPresetPlugins", () => {
  const i18nPlugin = {
    getName: () => "i18n",
    getDefinition: () => ({
      create: () => ({}),
    }),
  };

  const piniaPlugin = {
    getName: () => "pinia",
    getDefinition: () => ({
      create: () => ({}),
    }),
  };

  const routerPlugin = {
    getName: () => "router",
    getDefinition: () => ({
      create: () => ({}),
    }),
  };

  const presets: TestFrameworkPresets = {
    default: {
      manifest: [
        { module: i18nPlugin, enabled: true },
        { module: piniaPlugin, enabled: true },
        { module: routerPlugin, enabled: false },
      ],
      defaults: {},
    },

    i18nPreset: {
      manifest: [{ module: i18nPlugin, enabled: true }],
      defaults: {},
    },

    emptyPreset: {
      manifest: [],
      defaults: {},
    },
  };

  describe("Factory Preset Selection", () => {
    it("should skip validation when presetKey is omitted", () => {
      expect(() => {
        validateFactoryPresetPlugins(
          {
            plugins: {
              unsupportedPlugin: {},
            },
          } as unknown as ComponentFactoryOptions,
          undefined,
          presets,
        );
      }).not.toThrow();
    });

    it("should use the selected preset instead of the default preset", () => {
      expect(() => {
        validateFactoryPresetPlugins(
          {
            plugins: {
              pinia: {},
            },
          } as unknown as ComponentFactoryOptions,
          "default",
          presets,
        );
      }).not.toThrow();

      expect(() => {
        validateFactoryPresetPlugins(
          {
            plugins: {
              pinia: {},
            },
          } as unknown as ComponentFactoryOptions,
          "i18nPreset",
          presets,
        );
      }).toThrow(
        `${ERROR_PREFIX} Plugin "pinia" is configured but not supported by preset "i18nPreset".`,
      );
    });
  });

  describe("Supported Plugins", () => {
    it("should accept plugins declared in the selected preset", () => {
      expect(() => {
        validateFactoryPresetPlugins(
          {
            plugins: {
              i18n: {},
              pinia: {},
            },
          } as unknown as ComponentFactoryOptions,
          "default",
          presets,
        );
      }).not.toThrow();
    });

    it("should accept plugins disabled by default in the preset manifest", () => {
      expect(() => {
        validateFactoryPresetPlugins(
          {
            plugins: {
              router: {},
            },
          } as unknown as ComponentFactoryOptions,
          "default",
          presets,
        );
      }).not.toThrow();
    });

    it("should accept supported plugins configured as false", () => {
      expect(() => {
        validateFactoryPresetPlugins(
          {
            plugins: {
              i18n: false,
            },
          } as unknown as ComponentFactoryOptions,
          "i18nPreset",
          presets,
        );
      }).not.toThrow();
    });

    it("should accept defaultMountOptions without plugins", () => {
      expect(() => {
        validateFactoryPresetPlugins({}, "i18nPreset", presets);
      }).not.toThrow();
    });

    it("should accept an empty plugins object", () => {
      expect(() => {
        validateFactoryPresetPlugins(
          {
            plugins: {},
          },
          "i18nPreset",
          presets,
        );
      }).not.toThrow();
    });

    it("should not mutate defaultMountOptions during validation", () => {
      const defaultMountOptions = {
        plugins: {
          i18n: {
            locale: "en",
          },
        },
      } as unknown as ComponentFactoryOptions;

      const originalOptions = structuredClone(defaultMountOptions);

      validateFactoryPresetPlugins(defaultMountOptions, "i18nPreset", presets);

      expect(defaultMountOptions).toEqual(originalOptions);
    });
  });

  describe("Unsupported Plugins", () => {
    it("should reject plugins not declared in the selected preset", () => {
      expect(() => {
        validateFactoryPresetPlugins(
          {
            plugins: {
              pinia: {},
            },
          } as unknown as ComponentFactoryOptions,
          "i18nPreset",
          presets,
        );
      }).toThrow(
        `${ERROR_PREFIX} Plugin "pinia" is configured but not supported by preset "i18nPreset".`,
      );
    });

    it("should reject unsupported plugins even when configured as false", () => {
      expect(() => {
        validateFactoryPresetPlugins(
          {
            plugins: {
              pinia: false,
            },
          } as unknown as ComponentFactoryOptions,
          "i18nPreset",
          presets,
        );
      }).toThrow(
        `${ERROR_PREFIX} Plugin "pinia" is configured but not supported by preset "i18nPreset".`,
      );
    });

    it("should reject any configured plugin when the preset manifest is empty", () => {
      expect(() => {
        validateFactoryPresetPlugins(
          {
            plugins: {
              i18n: {},
            },
          } as unknown as ComponentFactoryOptions,
          "emptyPreset",
          presets,
        );
      }).toThrow(
        `${ERROR_PREFIX} Plugin "i18n" is configured but not supported by preset "emptyPreset".`,
      );
    });
  });

  describe("Preset Validation Responsibility", () => {
    it("should skip validation when the preset is not registered", () => {
      expect(() => {
        validateFactoryPresetPlugins(
          {
            plugins: {
              pinia: {},
            },
          } as unknown as ComponentFactoryOptions,
          "unknownPreset",
          presets,
        );
      }).not.toThrow();
    });
  });
});
