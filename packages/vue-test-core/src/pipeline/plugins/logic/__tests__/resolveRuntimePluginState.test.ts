import { describe, expect, it } from "vitest";

import {
  ERROR_PREFIX,
  PLUGIN_META_KEY,
  SHARED_PLUGIN_INSTANCE_KEY,
} from "../../../../constants/constants.js";

import { fromPluginInstance } from "../../../../plugins/dependencies/fromPluginInstance.js";
import { resolveRuntimePluginState } from "../resolveRuntimePluginState.js";

interface RuntimeStateDependencyInstance {
  id: string;
}

declare module "../../../../types.js" {
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

  describe("shared instance injection", () => {
    it("should extract a shared instance from symbol-keyed config metadata", () => {
      const instance = {
        install() {},
      };

      const config = {
        a: 1,
        [PLUGIN_META_KEY]: {
          instance,
        },
      };

      const result = resolveRuntimePluginState("pinia", config);

      expect(result.a).toBe(1);
      expect(result[SHARED_PLUGIN_INSTANCE_KEY]).toBe(instance);
      expect(Reflect.ownKeys(result)).not.toContain(PLUGIN_META_KEY);
    });

    it("should preserve pre-created instance identity", () => {
      const instance = {
        install: () => {},
      };

      const config = {
        [PLUGIN_META_KEY]: {
          instance,
        },
      };

      const result = resolveRuntimePluginState("pinia", config);

      expect(result[SHARED_PLUGIN_INSTANCE_KEY]).toBe(instance);
    });

    it("should override an existing shared instance with the instance from config metadata", () => {
      const existingInstance = {
        id: "existing",
      };

      const providedInstance = {
        id: "provided",
      };

      const config = {
        [SHARED_PLUGIN_INSTANCE_KEY]: existingInstance,
        [PLUGIN_META_KEY]: {
          instance: providedInstance,
        },
      };

      const result = resolveRuntimePluginState("pinia", config);

      expect(result[SHARED_PLUGIN_INSTANCE_KEY]).toBe(providedInstance);
      expect(config[SHARED_PLUGIN_INSTANCE_KEY]).toBe(existingInstance);
    });

    it("should preserve an existing shared instance when config metadata is absent", () => {
      const existingInstance = {
        id: "existing",
      };

      const config = {
        [SHARED_PLUGIN_INSTANCE_KEY]: existingInstance,
      };

      const result = resolveRuntimePluginState("pinia", config);

      expect(result[SHARED_PLUGIN_INSTANCE_KEY]).toBe(existingInstance);
    });

    it("should not inject a shared instance when config metadata is absent", () => {
      const config = {
        a: 1,
      };

      const result = resolveRuntimePluginState("pinia", config);

      expect(result[SHARED_PLUGIN_INSTANCE_KEY]).toBeUndefined();
      expect(Reflect.ownKeys(result)).not.toContain(SHARED_PLUGIN_INSTANCE_KEY);
    });

    it("should not inject a shared instance when instance is missing in config metadata", () => {
      const config = {
        a: 1,
        [PLUGIN_META_KEY]: {},
      };

      const result = resolveRuntimePluginState("pinia", config);

      expect(result).toEqual({
        a: 1,
      });

      expect(Reflect.ownKeys(result)).not.toContain(SHARED_PLUGIN_INSTANCE_KEY);
      expect(Reflect.ownKeys(result)).not.toContain(PLUGIN_META_KEY);
    });

    it("should not inject a shared instance when instance is undefined", () => {
      const config = {
        a: 1,
        [PLUGIN_META_KEY]: {
          instance: undefined,
        },
      };

      const result = resolveRuntimePluginState("pinia", config);

      expect(result).toEqual({
        a: 1,
      });

      expect(Reflect.ownKeys(result)).not.toContain(SHARED_PLUGIN_INSTANCE_KEY);
      expect(Reflect.ownKeys(result)).not.toContain(PLUGIN_META_KEY);
    });

    it("should reject plugin instance references used as pre-created instances", () => {
      const reference = fromPluginInstance("runtimeStateDependency", (instance) => instance);

      const config = {
        [PLUGIN_META_KEY]: {
          instance: reference,
        },
      };

      expect(() => resolveRuntimePluginState("i18n", config)).toThrow(
        `${ERROR_PREFIX} Plugin "i18n" cannot use fromPluginInstance() ` +
          "as an argument to withPluginInstance(). " +
          "withPluginInstance() requires a pre-created plugin instance.",
      );
    });
  });

  describe("symbol-keyed metadata cleanup", () => {
    it("should remove plugin metadata from runtime config", () => {
      const instance = {
        install() {},
      };

      const config = {
        a: 1,
        [PLUGIN_META_KEY]: {
          instance,
        },
      };

      const result = resolveRuntimePluginState("pinia", config);

      expect(result).toEqual({
        a: 1,
        [SHARED_PLUGIN_INSTANCE_KEY]: instance,
      });

      expect(Reflect.ownKeys(result)).not.toContain(PLUGIN_META_KEY);
    });

    it("should remove plugin metadata even when no instance is provided", () => {
      const config = {
        a: 1,
        [PLUGIN_META_KEY]: {},
      };

      const result = resolveRuntimePluginState("pinia", config);

      expect(result).toEqual({
        a: 1,
      });

      expect(Reflect.ownKeys(result)).not.toContain(PLUGIN_META_KEY);
    });

    it("should not mutate the original config", () => {
      const instance = {
        install() {},
      };

      const meta = {
        instance,
      };

      const config = {
        a: 1,
        [PLUGIN_META_KEY]: meta,
      };

      const result = resolveRuntimePluginState("pinia", config);

      expect(result).not.toBe(config);

      expect(config).toEqual({
        a: 1,
        [PLUGIN_META_KEY]: {
          instance,
        },
      });

      expect(config[PLUGIN_META_KEY]).toBe(meta);
      expect(config[PLUGIN_META_KEY].instance).toBe(instance);

      expect(Reflect.ownKeys(config)).toContain(PLUGIN_META_KEY);
      expect(Reflect.ownKeys(config)).not.toContain(SHARED_PLUGIN_INSTANCE_KEY);
    });

    it("should preserve metadata identity in the original config", () => {
      const instance = {
        install() {},
      };

      const meta = {
        instance,
      };

      const config = {
        [PLUGIN_META_KEY]: meta,
      };

      resolveRuntimePluginState("pinia", config);

      expect(config[PLUGIN_META_KEY]).toBe(meta);
      expect(config[PLUGIN_META_KEY].instance).toBe(instance);
    });

    it("should support frozen configuration without mutating it", () => {
      const instance = {
        install() {},
      };

      const config = Object.freeze({
        a: 1,
        [PLUGIN_META_KEY]: {
          instance,
        },
      });

      const result = resolveRuntimePluginState("pinia", config);

      expect(result).toEqual({
        a: 1,
        [SHARED_PLUGIN_INSTANCE_KEY]: instance,
      });

      expect(Reflect.ownKeys(config)).toContain(PLUGIN_META_KEY);
      expect(Reflect.ownKeys(result)).not.toContain(PLUGIN_META_KEY);
    });
  });

  describe("runtime isolation", () => {
    it("should resolve the same config independently across calls", () => {
      const instance = {
        install() {},
      };

      const config = {
        a: 1,
        [PLUGIN_META_KEY]: {
          instance,
        },
      };

      const firstResult = resolveRuntimePluginState("pinia", config);
      const secondResult = resolveRuntimePluginState("pinia", config);

      expect(firstResult).not.toBe(secondResult);

      expect(firstResult[SHARED_PLUGIN_INSTANCE_KEY]).toBe(instance);
      expect(secondResult[SHARED_PLUGIN_INSTANCE_KEY]).toBe(instance);

      expect(Reflect.ownKeys(firstResult)).not.toContain(PLUGIN_META_KEY);
      expect(Reflect.ownKeys(secondResult)).not.toContain(PLUGIN_META_KEY);

      expect(Reflect.ownKeys(config)).toContain(PLUGIN_META_KEY);
    });

    it("should resolve different configs without sharing runtime state", () => {
      const firstInstance = {
        id: "first",
      };

      const secondInstance = {
        id: "second",
      };

      const firstConfig = {
        [PLUGIN_META_KEY]: {
          instance: firstInstance,
        },
      };

      const secondConfig = {
        [PLUGIN_META_KEY]: {
          instance: secondInstance,
        },
      };

      const firstResult = resolveRuntimePluginState("pinia", firstConfig);
      const secondResult = resolveRuntimePluginState("pinia", secondConfig);

      expect(firstResult[SHARED_PLUGIN_INSTANCE_KEY]).toBe(firstInstance);
      expect(secondResult[SHARED_PLUGIN_INSTANCE_KEY]).toBe(secondInstance);

      expect(firstResult[SHARED_PLUGIN_INSTANCE_KEY]).not.toBe(
        secondResult[SHARED_PLUGIN_INSTANCE_KEY],
      );
    });
  });
});
