import { describe, expect, it } from "vitest";

import { ERROR_PREFIX } from "../../../../constants/constants.js";
import { fromPluginInstance } from "../../../../plugins/dependencies/fromPluginInstance.js";
import { resolveRuntimePluginState } from "../resolveRuntimePluginState.js";

interface RuntimeStateDependencyInstance {
  id: string;
}

declare module "../../../../types" {
  interface PluginInstanceMap {
    runtimeStateDependency: RuntimeStateDependencyInstance;
  }
}

describe("resolveRuntimePluginState", () => {
  describe("runtime config creation", () => {
    it("should return a shallow copy of config", () => {
      const config = {
        a: 1,
      };

      const result = resolveRuntimePluginState("pinia", config);

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

      const result = resolveRuntimePluginState("i18n", config);

      expect(result).toEqual({
        locale: "en",
        legacy: false,
      });
    });

    it("should preserve nested value identity in the shallow copy", () => {
      const nested = {
        value: "shared",
      };

      const config = {
        nested,
      };

      const result = resolveRuntimePluginState("pinia", config);

      expect(result).not.toBe(config);
      expect(result.nested).toBe(nested);
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

      const result = resolveRuntimePluginState("pinia", config, overlay);

      expect(result.__sharedInstance).toBe(instance);
    });

    it("should preserve pre-created instance identity", () => {
      const instance = {
        install: () => {},
      };

      const result = resolveRuntimePluginState(
        "pinia",
        {},
        {
          __meta: {
            instance,
          },
        },
      );

      expect(result.__sharedInstance).toBe(instance);
    });

    it("should override an existing __sharedInstance with overlay meta.instance", () => {
      const existingInstance = {
        id: "existing",
      };

      const overlayInstance = {
        id: "overlay",
      };

      const result = resolveRuntimePluginState(
        "pinia",
        {
          __sharedInstance: existingInstance,
        },
        {
          __meta: {
            instance: overlayInstance,
          },
        },
      );

      expect(result.__sharedInstance).toBe(overlayInstance);
    });

    it("should not inject __sharedInstance when overlay is undefined", () => {
      const result = resolveRuntimePluginState("pinia", {
        a: 1,
      });

      expect(result.__sharedInstance).toBeUndefined();
    });

    it("should not inject __sharedInstance when overlay is false", () => {
      const result = resolveRuntimePluginState(
        "pinia",
        {
          a: 1,
        },
        false,
      );

      expect(result.__sharedInstance).toBeUndefined();
    });

    it("should not inject __sharedInstance when meta.instance is missing", () => {
      const result = resolveRuntimePluginState(
        "pinia",
        {
          a: 1,
        },
        {
          __meta: {},
        },
      );

      expect(result.__sharedInstance).toBeUndefined();
    });

    it("should reject plugin instance references used as pre-created instances", () => {
      const reference = fromPluginInstance("runtimeStateDependency", (instance) => instance);

      expect(() =>
        resolveRuntimePluginState(
          "i18n",
          {},
          {
            __meta: {
              instance: reference,
            },
          },
        ),
      ).toThrow(
        `${ERROR_PREFIX} Plugin "i18n" cannot use fromPluginInstance() as "__meta.instance". ` +
          `"__meta.instance" must contain a pre-created plugin instance.`,
      );
    });
  });

  describe("__meta cleanup", () => {
    it("should remove __meta from runtime config", () => {
      const result = resolveRuntimePluginState("pinia", {
        a: 1,
        __meta: {
          instance: true,
        },
      });

      expect(result.__meta).toBeUndefined();
    });

    it("should remove config __meta even when overlay contains no metadata", () => {
      const result = resolveRuntimePluginState(
        "pinia",
        {
          a: 1,
          __meta: {
            instance: true,
          },
        },
        {},
      );

      expect(result).toEqual({
        a: 1,
      });
    });

    it("should not mutate original config", () => {
      const meta = {
        instance: true,
      };

      const config = {
        a: 1,
        __meta: meta,
      };

      resolveRuntimePluginState("pinia", config);

      expect(config).toEqual({
        a: 1,
        __meta: {
          instance: true,
        },
      });

      expect(config.__meta).toBe(meta);
    });

    it("should not mutate overlay metadata", () => {
      const instance = {};
      const meta = {
        instance,
      };

      const overlay = {
        __meta: meta,
      };

      resolveRuntimePluginState("pinia", {}, overlay);

      expect(overlay.__meta).toBe(meta);
      expect(overlay.__meta.instance).toBe(instance);
    });
  });
});
