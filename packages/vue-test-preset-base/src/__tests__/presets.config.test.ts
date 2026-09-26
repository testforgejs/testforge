import { describe, expect, it } from "vitest";

import { i18nPlugin } from "@testforgejs/vue-test-plugin-i18n";
import { piniaPlugin } from "@testforgejs/vue-test-plugin-pinia";
import { routerPlugin } from "@testforgejs/vue-test-plugin-router";

import { presets } from "../presets.js";

describe("base presets configuration", () => {
  describe("default preset", () => {
    it("should contain the expected plugin manifest", () => {
      expect(presets.default.manifest).toEqual([
        {
          module: piniaPlugin,
          enabled: true,
        },
        {
          module: i18nPlugin,
          enabled: true,
        },
        {
          module: routerPlugin,
          enabled: false,
        },
      ]);
    });

    it("should create the expected Pinia default options", () => {
      expect(presets.default.defaults.pinia()).toEqual({});
    });

    it("should provide i18n default options", () => {
      expect(presets.default.defaults.i18n()).toEqual({
        legacy: false,
        globalInjection: true,
      });
    });

    it("should create the expected Router default options", () => {
      const options = presets.default.defaults.router();

      expect(options.routes).toEqual([]);
      expect(options.history).toBeDefined();
    });
  });

  describe("piniaPreset", () => {
    it("should contain only the Pinia plugin in the manifest", () => {
      expect(presets.piniaPreset.manifest).toEqual([
        {
          module: piniaPlugin,
          enabled: true,
        },
      ]);
    });

    it("should create the expected Pinia default options for piniaPreset", () => {
      expect(presets.piniaPreset.defaults.pinia()).toEqual({});
    });
  });

  describe("i18nPreset", () => {
    it("should contain only i18n in the manifest", () => {
      expect(presets.i18nPreset.manifest).toEqual([
        {
          module: i18nPlugin,
          enabled: true,
        },
      ]);
    });

    it("should provide i18n default options for i18nPreset", () => {
      expect(presets.i18nPreset.defaults.i18n()).toEqual({
        legacy: false,
        globalInjection: true,
      });
    });
  });

  describe("routerPreset", () => {
    it("should contain only Router in the manifest", () => {
      expect(presets.routerPreset.manifest).toEqual([
        {
          module: routerPlugin,
          enabled: true,
        },
      ]);
    });

    it("should create the expected Router default options for routerPreset", () => {
      const options = presets.routerPreset.defaults.router();

      expect(options.routes).toEqual([]);
      expect(options.history).toBeDefined();
    });
  });

  describe("available presets", () => {
    it("should expose default, piniaPreset, i18nPreset and routerPreset presets", () => {
      expect(Object.keys(presets)).toEqual(
        expect.arrayContaining(["default", "piniaPreset", "i18nPreset", "routerPreset"]),
      );
    });
  });
});
