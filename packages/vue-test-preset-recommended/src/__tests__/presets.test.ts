import { describe, it, expect } from "vitest";
import { presets } from "../presets.js";
import { validatePresets } from "@testforge/vue-test-core";

describe("presets", () => {
  describe("validation", () => {
    it("should pass preset validation", () => {
      validatePresets(presets);
    });
  });

  describe("default preset", () => {
    it("should configure Pinia, i18n and Router plugins", () => {
      expect(
        presets.default.manifest.map((entry) => ({
          name: entry.module.getName(),
          enabled: entry.enabled,
        })),
      ).toEqual([
        {
          name: "pinia",
          enabled: true,
        },
        {
          name: "i18n",
          enabled: true,
        },
        {
          name: "router",
          enabled: false,
        },
      ]);
    });

    it("should provide default plugin configuration", () => {
      expect(presets.default.defaults.i18n).toMatchObject({
        locale: "en",
        fallbackLocale: "en",
        messages: {},
        fallbackWarn: false,
        missingWarn: false,
      });

      expect(presets.default.defaults.pinia).toMatchObject({
        initialState: {},
        stubActions: false,
      });

      expect(presets.default.defaults.router.routes).toHaveLength(1);
    });
  });

  describe("i18nPreset", () => {
    it("should configure only the i18n plugin", () => {
      expect(
        presets.i18nPreset.manifest.map((entry) => ({
          name: entry.module.getName(),
          enabled: entry.enabled,
        })),
      ).toEqual([
        {
          name: "i18n",
          enabled: true,
        },
      ]);
    });

    it("should provide i18n defaults", () => {
      expect(presets.i18nPreset.defaults.i18n).toMatchObject({
        locale: "en",
        fallbackLocale: "en",
        messages: {},
        fallbackWarn: false,
        missingWarn: false,
      });
    });
  });

  describe("available presets", () => {
    it("should expose default and i18nPreset presets", () => {
      expect(Object.keys(presets)).toEqual(expect.arrayContaining(["default", "i18nPreset"]));
    });
  });
});
