import { describe, it, expect } from "vitest";
import { validatePreset } from "../validatePreset.js";

describe("validatePreset", () => {
  // Helpers for creating mock modules
  const createMockModule = (name) => ({
    getName: () => name,
    getDefinition: () => ({ create: () => ({}) }),
  });

  const mockPinia = createMockModule("pinia");
  const mockI18n = createMockModule("i18n");

  describe("valid presets", () => {
    it("should pass when the preset structure is correct", () => {
      const validPreset = {
        manifest: [
          { module: mockPinia, enabled: true },
          { module: mockI18n, enabled: false },
        ],
        defaults: {
          pinia: { store: {} },
          i18n: {},
        },
      };

      expect(() => validatePreset("default", validPreset)).not.toThrow();
    });

    it("should pass even when defaults are missing (optional field)", () => {
      const presetWithoutDefaults = {
        manifest: [{ module: mockPinia, enabled: true }],
      };
      expect(() => validatePreset("minimal", presetWithoutDefaults)).not.toThrow();
    });

    it("should not allow defaults value to be false", () => {
      const preset = {
        manifest: [{ module: mockPinia, enabled: true }],
        defaults: {
          pinia: false,
        },
      };

      expect(() => validatePreset("false-default", preset)).toThrow(
        "Expected Object, but received boolean",
      );
    });

    it("should allow an empty manifest", () => {
      const preset = { manifest: [] };
      expect(() => validatePreset("empty", preset)).not.toThrow();
    });

    it("should allow empty defaults object", () => {
      const preset = {
        manifest: [{ module: mockPinia, enabled: true }],
        defaults: {},
      };

      expect(() => validatePreset("empty-defaults", preset)).not.toThrow();
    });
  });

  describe("manifest validation", () => {
    it("should throw when preset is null or undefined", () => {
      expect(() => validatePreset("null-test", null)).toThrow(/is null or undefined/);
    });

    it("should throw when manifest is not an array", () => {
      const invalid = { manifest: "not-an-array" };
      expect(() => validatePreset("bad-manifest", invalid)).toThrow(/must have a "manifest" array/);
    });

    it("should throw when a module in manifest is invalid", () => {
      const invalid = {
        manifest: [{ module: {}, enabled: true }], // An empty object instead of a module
      };
      expect(() => validatePreset("bad-module", invalid)).toThrow(
        /Invalid module at manifest\[0\]/,
      );
    });

    it("should throw when duplicate plugin names exist in manifest", () => {
      const duplicate = {
        manifest: [
          { module: mockPinia, enabled: true },
          { module: mockPinia, enabled: false },
        ],
      };
      expect(() => validatePreset("dupe-test", duplicate)).toThrow(/Duplicate plugin "pinia"/);
    });

    it("should throw when enabled flag is not a boolean", () => {
      const invalid = {
        manifest: [{ module: mockPinia, enabled: "yes" }],
      };
      expect(() => validatePreset("bad-enabled", invalid)).toThrow(
        /must have a boolean "enabled" flag/,
      );
    });

    it("should throw when plugin config is false", () => {
      const invalid = {
        manifest: [
          { module: mockPinia, enabled: true },
          { module: mockI18n, enabled: false },
        ],
        defaults: {
          pinia: { store: {} },
          i18n: false,
        },
      };
      expect(() => validatePreset("bad-plugin-false", invalid)).toThrow(
        /Expected Object, but received boolean/,
      );
    });
  });

  describe("defaults consistency validation", () => {
    it("should throw when defaults contains a key not present in manifest", () => {
      const inconsistent = {
        manifest: [{ module: mockPinia, enabled: true }],
        defaults: {
          router: { history: {} }, // The router is missing from the manifest
        },
      };
      expect(() => validatePreset("inconsistent", inconsistent)).toThrow(
        /contains defaults for unknown plugin "router"/,
      );
    });

    it("should throw when a default value is not an object or false", () => {
      const badValue = {
        manifest: [{ module: mockPinia, enabled: true }],
        defaults: {
          pinia: 123, // Should be an object or false
        },
      };
      expect(() => validatePreset("bad-value", badValue)).toThrow(
        /Expected Object, but received number/,
      );
    });

    it("should throw when a default value is null", () => {
      const badValue = {
        manifest: [{ module: mockPinia, enabled: true }],
        defaults: {
          pinia: null,
        },
      };
      expect(() => validatePreset("null-value", badValue)).toThrow(
        /Expected Object, but received object/,
      );
    });
  });

  describe("immutability", () => {
    it("should not mutate the preset object", () => {
      const moduleRef = mockPinia;
      const manifestEntryRef = { module: moduleRef, enabled: true };
      const defaultsRef = { pinia: { a: 1 } };

      const preset = {
        manifest: [manifestEntryRef],
        defaults: defaultsRef,
      };

      validatePreset("immutability", preset);

      // links should remain the same
      expect(preset.manifest[0]).toBe(manifestEntryRef);
      expect(preset.manifest[0].module).toBe(moduleRef);
      expect(preset.defaults).toBe(defaultsRef);
      expect(preset.defaults.pinia.a).toBe(1);
    });
  });
});
