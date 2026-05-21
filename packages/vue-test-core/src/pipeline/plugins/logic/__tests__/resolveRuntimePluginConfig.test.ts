import { describe, it, expect } from "vitest";

import { resolveRuntimePluginConfig } from "../resolveRuntimePluginConfig.js";

describe("resolveRuntimePluginConfig", () => {
  describe("runtime config creation", () => {
    it("should return a shallow copy of config", () => {
      const config = {
        a: 1,
      };

      const result = resolveRuntimePluginConfig(config);

      expect(result).toEqual({
        a: 1,
      });

      expect(result).not.toBe(config);
    });

    it("should preserve normal config fields", () => {
      const config = {
        locale: "en",
        legacy: false,
      };

      const result = resolveRuntimePluginConfig(config);

      expect(result).toEqual({
        locale: "en",
        legacy: false,
      });
    });
  });

  describe("__sharedInstance injection", () => {
    it("should inject __sharedInstance from overlay meta.instance", () => {
      const instance = {};

      const config = {
        a: 1,
      };

      const overlay = {
        __meta: {
          instance,
        },
      };

      const result = resolveRuntimePluginConfig(config, overlay);

      expect(result.__sharedInstance).toBe(instance);
    });

    it("should not inject __sharedInstance when overlay is undefined", () => {
      const result = resolveRuntimePluginConfig({ a: 1 });

      expect(result.__sharedInstance).toBeUndefined();
    });

    it("should not inject __sharedInstance when overlay is false", () => {
      const result = resolveRuntimePluginConfig({ a: 1 }, false);

      expect(result.__sharedInstance).toBeUndefined();
    });

    it("should not inject __sharedInstance when meta.instance is missing", () => {
      const result = resolveRuntimePluginConfig(
        { a: 1 },
        {
          __meta: {},
        },
      );

      expect(result.__sharedInstance).toBeUndefined();
    });
  });

  describe("__meta cleanup", () => {
    it("should remove __meta from runtime config", () => {
      const result = resolveRuntimePluginConfig({
        a: 1,
        __meta: {
          instance: true,
        },
      });

      expect(result.__meta).toBeUndefined();
    });

    it("should not mutate original config", () => {
      const config = {
        a: 1,
        __meta: {
          instance: true,
        },
      };

      resolveRuntimePluginConfig(config);

      expect(config).toEqual({
        a: 1,
        __meta: {
          instance: true,
        },
      });
    });
  });
});
