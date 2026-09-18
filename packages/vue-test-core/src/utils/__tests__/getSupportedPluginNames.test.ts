import { describe, expect, it } from "vitest";
import { getSupportedPluginNames } from "../getSupportedPluginNames.js";

describe("getSupportedPluginNames", () => {
  // Helpers for creating mock modules
  const createMockModule = (name: string) => ({
    getName: () => name,
    getDefinition: () => ({ create: () => ({}) }),
    getDefaultOptions: () => () => ({}),
  });

  const i18nPlugin = createMockModule("i18n");
  const piniaPlugin = createMockModule("pinia");
  const routerPlugin = createMockModule("router");

  const presets = {
    default: {
      manifest: [
        {
          module: i18nPlugin,
          enabled: true,
        },
        {
          module: piniaPlugin,
          enabled: true,
        },
      ],
      defaults: {},
    },

    custom: {
      manifest: [
        {
          module: routerPlugin,
          enabled: true,
        },
      ],
      defaults: {},
    },
  };

  describe("default preset", () => {
    it("should return plugin names from the default preset", () => {
      expect(getSupportedPluginNames(presets)).toEqual(["i18n", "pinia"]);
    });
  });

  describe("named preset", () => {
    it("should return plugin names from the requested preset", () => {
      expect(
        getSupportedPluginNames(presets, {
          preset: "custom",
        }),
      ).toEqual(["router"]);
    });
  });

  describe("empty preset collection", () => {
    it("should return an empty array when no presets are defined", () => {
      expect(getSupportedPluginNames()).toEqual([]);
    });
  });

  describe("empty manifest", () => {
    it("should return an empty array when the active preset contains no plugins", () => {
      expect(
        getSupportedPluginNames({
          default: {
            manifest: [],
            defaults: {},
          },
        }),
      ).toEqual([]);
    });
  });

  describe("plugin order", () => {
    it("should preserve plugin order defined in the manifest", () => {
      expect(getSupportedPluginNames(presets)).toEqual(["i18n", "pinia"]);
    });
  });
});
