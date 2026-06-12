import { describe, test, expect, vi } from "vitest";
import { validatePresets } from "../validatePresets.js";
import { ERROR_PREFIX } from "../../constants/constants.js";

describe("validatePresets", () => {
  const mockAuthInstance = vi.fn();
  const mockLoggerInstance = vi.fn();

  describe("valid cases", () => {
    test("should accept an empty object", () => {
      expect(() => validatePresets({})).not.toThrow();
    });

    test("should accept valid presets with different configurations", () => {
      const validPresets = {
        default: {
          manifest: [],
          defaults: {},
        },
        mobile: {
          manifest: [
            {
              module: {
                getName: () => "auth",
                getDefinition: () => ({
                  create: () => mockAuthInstance,
                }),
              },
              enabled: true,
            },
          ],
          defaults: {
            auth: { timeout: 5000 },
          },
        },
        minimal: {
          manifest: [
            {
              module: {
                getName: () => "logger",
                getDefinition: () => ({
                  create: () => mockLoggerInstance,
                }),
              },
              enabled: false,
            },
          ],
          defaults: {},
        },
      };

      expect(() => validatePresets(validPresets)).not.toThrow();
    });
  });

  describe("top-level validation", () => {
    test.each([
      { value: null, description: "null", expectedError: "Presets must be a plain object." },
      { value: [], description: "array", expectedError: "Presets must be a plain object." },
      { value: 123, description: "number", expectedError: "Presets must be a plain object." },
      { value: "presets", description: "string", expectedError: "Presets must be a plain object." },
    ])("should reject $description", ({ value, expectedError }) => {
      expect(() => validatePresets(value as any)).toThrow(`${ERROR_PREFIX} ${expectedError}`);
    });
  });

  describe("preset-level validation", () => {
    test("should reject preset that is null or undefined", () => {
      expect(() =>
        validatePresets({
          // @ts-expect-error - intentionally passing invalid preset type
          bad: null,
        }),
      ).toThrow(`${ERROR_PREFIX} Preset "bad" is null or undefined.`);

      expect(() =>
        validatePresets({
          // @ts-expect-error - intentionally passing invalid preset type
          bad: undefined,
        }),
      ).toThrow(`${ERROR_PREFIX} Preset "bad" is null or undefined.`);
    });

    test("should reject preset without manifest array", () => {
      expect(() =>
        validatePresets({
          default: {
            // @ts-expect-error - intentionally passing invalid preset type
            manifest: null,
          },
        }),
      ).toThrow(`${ERROR_PREFIX} Preset "default" must have a "manifest" array.`);
    });

    test("should stop at the first invalid preset", () => {
      expect(() =>
        validatePresets({
          valid: { manifest: [], defaults: {} },
          // @ts-expect-error - intentionally passing invalid preset type
          invalid: { manifest: null, defaults: {} },
          anotherValid: { manifest: [], defaults: {} },
        }),
      ).toThrow(`${ERROR_PREFIX} Preset "invalid" must have a "manifest" array.`);
    });
  });

  describe("manifest validation", () => {
    test("should reject duplicate plugins in manifest", () => {
      expect(() =>
        validatePresets({
          badPreset: {
            manifest: [
              {
                module: {
                  getName: () => "auth",
                  getDefinition: () => ({
                    create: () => mockAuthInstance,
                  }),
                },
                enabled: true,
              },
              {
                module: {
                  getName: () => "auth",
                  getDefinition: () => ({
                    create: () => mockAuthInstance,
                  }),
                },
                enabled: false,
              },
            ],
            defaults: {},
          },
        }),
      ).toThrow(/Duplicate plugin "auth" in manifest of preset "badPreset"/);
    });
  });

  describe("defaults validation", () => {
    test("should reject defaults for plugin not declared in manifest", () => {
      expect(() =>
        validatePresets({
          badDefaults: {
            manifest: [
              {
                module: {
                  getName: () => "auth",
                  getDefinition: () => ({
                    create: () => mockAuthInstance,
                  }),
                },
                enabled: true,
              },
            ],
            defaults: {
              auth: { timeout: 1000 },
              database: { host: "localhost" }, // unknown
            },
          },
        }),
      ).toThrow(/contains defaults for unknown plugin "database"/);
    });

    test("should reject non-object default configurations", () => {
      expect(() =>
        validatePresets({
          badConfig: {
            manifest: [
              {
                module: {
                  getName: () => "auth",
                  getDefinition: () => ({
                    create: () => mockAuthInstance,
                  }),
                },
                enabled: true,
              },
            ],
            defaults: {
              // @ts-expect-error - intentionally passing invalid preset type
              auth: "not-an-object",
            },
          },
        }),
      ).toThrow(/Invalid default configuration for plugin "auth"/);
    });
  });
});
