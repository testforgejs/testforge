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

  describe("shared instance injection", () => {
    it("should inject shared instance from symbol-keyed overlay metadata", () => {
      const instance = {
        install() {},
      };

      const config = {
        a: 1,
      };

      const overlay = {
        [PLUGIN_META_KEY]: {
          instance,
        },
      };

      const result = resolveRuntimePluginState("pinia", config, overlay);

      expect(result[SHARED_PLUGIN_INSTANCE_KEY]).toBe(instance);
      expect(Reflect.ownKeys(result)).not.toContain(PLUGIN_META_KEY);
    });

    it("should preserve pre-created instance identity", () => {
      const instance = {
        install: () => {},
      };

      const result = resolveRuntimePluginState(
        "pinia",
        {},
        {
          [PLUGIN_META_KEY]: {
            instance,
          },
        },
      );

      expect(result[SHARED_PLUGIN_INSTANCE_KEY]).toBe(instance);
    });

    it("should override an existing [SHARED_PLUGIN_INSTANCE_KEY] with instance from overlay metadata", () => {
      const existingInstance = {
        id: "existing",
      };

      const overlayInstance = {
        id: "overlay",
      };

      const result = resolveRuntimePluginState(
        "pinia",
        {
          [SHARED_PLUGIN_INSTANCE_KEY]: existingInstance,
        },
        {
          [PLUGIN_META_KEY]: {
            instance: overlayInstance,
          },
        },
      );

      expect(result[SHARED_PLUGIN_INSTANCE_KEY]).toBe(overlayInstance);
    });

    it("should not inject shared instance when overlay is undefined", () => {
      const result = resolveRuntimePluginState("pinia", {
        a: 1,
      });

      expect(result[SHARED_PLUGIN_INSTANCE_KEY]).toBeUndefined();
    });

    it("should not inject shared instance when overlay is false", () => {
      const result = resolveRuntimePluginState(
        "pinia",
        {
          a: 1,
        },
        false,
      );

      expect(result[SHARED_PLUGIN_INSTANCE_KEY]).toBeUndefined();
    });

    it("should not inject shared instance when instance is missing in overlay metadata", () => {
      const result = resolveRuntimePluginState(
        "pinia",
        {
          a: 1,
        },
        {
          [PLUGIN_META_KEY]: {},
        },
      );

      expect(result[SHARED_PLUGIN_INSTANCE_KEY]).toBeUndefined();
    });

    it("should reject plugin instance references used as pre-created instances", () => {
      const reference = fromPluginInstance("runtimeStateDependency", (instance) => instance);

      expect(() =>
        resolveRuntimePluginState(
          "i18n",
          {},
          {
            [PLUGIN_META_KEY]: {
              instance: reference,
            },
          },
        ),
      ).toThrow(
        `${ERROR_PREFIX} Plugin "i18n" cannot use fromPluginInstance() as an argument to withPluginInstance(). ` +
          `withPluginInstance() requires a pre-created plugin instance.`,
      );
    });
  });

  describe("symbol-keyed overlay metadata cleanup", () => {
    it("should remove overlay metadata from runtime config", () => {
      const result = resolveRuntimePluginState("pinia", {
        a: 1,
        [PLUGIN_META_KEY]: {
          instance: true,
        },
      });

      expect(result[PLUGIN_META_KEY]).toBeUndefined();
    });

    it("should remove config overlay metadata even when overlay contains no correct metadata", () => {
      const result = resolveRuntimePluginState(
        "pinia",
        {
          a: 1,
          [PLUGIN_META_KEY]: {
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
        [PLUGIN_META_KEY]: meta,
      };

      resolveRuntimePluginState("pinia", config);

      expect(config).toEqual({
        a: 1,
        [PLUGIN_META_KEY]: {
          instance: true,
        },
      });

      expect(config[PLUGIN_META_KEY]).toBe(meta);
    });

    it("should not mutate overlay metadata", () => {
      const instance = {};
      const meta = {
        instance,
      };

      const overlay = {
        [PLUGIN_META_KEY]: meta,
      };

      resolveRuntimePluginState("pinia", {}, overlay);

      expect(overlay[PLUGIN_META_KEY]).toBe(meta);
      expect(overlay[PLUGIN_META_KEY].instance).toBe(instance);
    });
  });
});
