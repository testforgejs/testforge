import { describe, it, expect } from "vitest";
import { assertPluginOptions } from "../assertPluginOptions.js";

describe("assertPluginOptions middleware", () => {
  const supportedPlugins = {
    pinia: {},
    i18n: {},
  };

  const baseCtx = {
    supportedPlugins,
    result: { plugins: {} },
    extraOptions: {},
  };

  describe("resolved plugin configuration", () => {
    it("should pass for valid plugin objects and false", () => {
      const ctx = {
        ...baseCtx,
        result: {
          plugins: {
            pinia: {},
            i18n: false,
          },
        },
      };

      expect(() => assertPluginOptions(ctx)).not.toThrow();
    });

    it("should throw for unsupported plugin in result.plugins", () => {
      const ctx = {
        ...baseCtx,
        result: {
          plugins: {
            unknown: {},
          },
        },
      };

      expect(() => assertPluginOptions(ctx)).toThrow(
        'Plugin "unknown" is configured but not supported by the active preset',
      );
    });

    const invalidValues = [null, [], true, 123, "str"];

    it.each(invalidValues)("should throw for invalid plugin value %p in result.plugins", (val) => {
      const ctx = {
        ...baseCtx,
        result: {
          plugins: {
            pinia: val,
          },
        },
      };

      expect(() => assertPluginOptions(ctx)).toThrow(
        'Invalid configuration for plugin "pinia" in plugins',
      );
    });
  });

  describe("extra plugin overrides", () => {
    it("should validate plugin options from extraOptions when key matches plugin", () => {
      const ctx = {
        ...baseCtx,
        extraOptions: {
          plugins: {
            pinia: {},
          },
        },
      };

      expect(() => assertPluginOptions(ctx)).not.toThrow();
    });

    it("should throw for invalid plugin value in extraOptions", () => {
      const ctx = {
        ...baseCtx,
        extraOptions: {
          plugins: {
            pinia: 123,
          },
        },
      };

      expect(() => assertPluginOptions(ctx)).toThrow(
        'Invalid configuration for plugin "pinia" in extraOptions',
      );
    });

    it("should throw for unsupported plugin in extraOptions.plugins", () => {
      const ctx = {
        ...baseCtx,
        extraOptions: {
          plugins: {
            vuetify: {},
          },
        },
      };

      expect(() => assertPluginOptions(ctx)).toThrow(
        'Plugin "vuetify" is configured but not supported by the active preset',
      );
    });

    it("should throw unsupported plugin error before validating plugin value", () => {
      const ctx = {
        ...baseCtx,
        extraOptions: {
          plugins: {
            vuetify: 123,
          },
        },
      };

      expect(() => assertPluginOptions(ctx)).toThrow(
        'Plugin "vuetify" is configured but not supported by the active preset',
      );
    });

    it("should allow false in extraOptions.plugins", () => {
      const ctx = {
        ...baseCtx,
        extraOptions: {
          plugins: {
            pinia: false,
          },
        },
      };

      expect(() => assertPluginOptions(ctx)).not.toThrow();
    });
  });

  describe("non-plugin extra options", () => {
    it("should NOT throw for unknown keys in extraOptions", () => {
      const ctx = {
        ...baseCtx,
        extraOptions: {
          somethingElse: 123,
        },
      };

      expect(() => assertPluginOptions(ctx)).not.toThrow();
    });
  });
});
