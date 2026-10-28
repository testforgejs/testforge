import { describe, expect, it } from "vitest";

import {
  ERROR_PREFIX,
  PLUGIN_META_KEY,
  SHARED_PLUGIN_INSTANCE_KEY,
} from "../../../../constants/constants.js";

import { fromPluginInstance } from "../../../../plugins/dependencies/fromPluginInstance.js";

import { createMockCtx } from "../../../__tests__/fixtures.js";
import { isPluginOverlayObject } from "../../../middleware/typeGuards/isPluginOverlayObject.js";

import { withResolvedPluginInstances } from "../withResolvedPluginInstances.js";

import type { RuntimeContext } from "../../../../types";

interface MiddlewareDependencyInstance {
  id: string;
}

declare module "../../../../types.js" {
  interface PluginInstanceMap {
    resolvedMiddlewareDependency: MiddlewareDependencyInstance;
  }
}

describe("withResolvedPluginInstances", () => {
  const supportedPlugins = {
    pinia: true,
    i18n: true,
  };

  const middleware = withResolvedPluginInstances(supportedPlugins);

  describe("plugin configuration normalization", () => {
    it("should normalize a supported plugin with instance metadata", () => {
      const instance = {
        install() {},
      };

      const ctx = createMockCtx<RuntimeContext>();

      ctx.result.plugins.pinia = {
        a: 1,
        [PLUGIN_META_KEY]: {
          instance,
        },
      };

      const result = middleware(ctx);

      const piniaConfig = result.result.plugins.pinia;

      expect(piniaConfig).toEqual({
        a: 1,
        [SHARED_PLUGIN_INSTANCE_KEY]: instance,
      });

      expect(isPluginOverlayObject(piniaConfig)).toBe(true);

      if (!isPluginOverlayObject(piniaConfig)) {
        throw new Error("Expected an enabled plugin configuration.");
      }

      expect(piniaConfig[SHARED_PLUGIN_INSTANCE_KEY]).toBe(instance);

      expect(Reflect.ownKeys(piniaConfig)).not.toContain(PLUGIN_META_KEY);
    });

    it("should normalize multiple supported plugins", () => {
      const piniaInstance = {
        id: "pinia-instance",
      };

      const i18nInstance = {
        id: "i18n-instance",
      };

      const ctx = createMockCtx<RuntimeContext>();

      ctx.result.plugins.pinia = {
        stubActions: true,
        [PLUGIN_META_KEY]: {
          instance: piniaInstance,
        },
      };

      ctx.result.plugins.i18n = {
        locale: "en",
        [PLUGIN_META_KEY]: {
          instance: i18nInstance,
        },
      };

      const result = middleware(ctx);

      expect(result.result.plugins.pinia).toEqual({
        stubActions: true,
        [SHARED_PLUGIN_INSTANCE_KEY]: piniaInstance,
      });

      expect(result.result.plugins.i18n).toEqual({
        locale: "en",
        [SHARED_PLUGIN_INSTANCE_KEY]: i18nInstance,
      });
    });

    it("should preserve normal plugin options without instance metadata", () => {
      const ctx = createMockCtx<RuntimeContext>();

      const config = {
        locale: "en",
        legacy: false,
      };

      ctx.result.plugins.i18n = config;

      const result = middleware(ctx);

      expect(result.result.plugins.i18n).toEqual(config);
    });

    it("should preserve existing shared instance when metadata is absent", () => {
      const instance = {
        id: "existing-instance",
      };

      const ctx = createMockCtx<RuntimeContext>();

      ctx.result.plugins.pinia = {
        [SHARED_PLUGIN_INSTANCE_KEY]: instance,
      };

      const result = middleware(ctx);

      const piniaConfig = result.result.plugins.pinia;

      if (!isPluginOverlayObject(piniaConfig)) {
        throw new Error("Expected an enabled plugin configuration.");
      }

      expect(piniaConfig[SHARED_PLUGIN_INSTANCE_KEY]).toBe(instance);
    });

    it("should replace an existing shared instance with metadata instance", () => {
      const existingInstance = {
        id: "existing",
      };

      const providedInstance = {
        id: "provided",
      };

      const ctx = createMockCtx<RuntimeContext>();

      ctx.result.plugins.pinia = {
        [SHARED_PLUGIN_INSTANCE_KEY]: existingInstance,
        [PLUGIN_META_KEY]: {
          instance: providedInstance,
        },
      };

      const result = middleware(ctx);

      const piniaConfig = result.result.plugins.pinia;

      if (!isPluginOverlayObject(piniaConfig)) {
        throw new Error("Expected an enabled plugin configuration.");
      }

      expect(piniaConfig[SHARED_PLUGIN_INSTANCE_KEY]).toBe(providedInstance);

      expect(Reflect.ownKeys(piniaConfig)).not.toContain(PLUGIN_META_KEY);
    });
  });

  describe("disabled and unsupported plugins", () => {
    it("should preserve disabled plugin state", () => {
      const ctx = createMockCtx<RuntimeContext>();

      ctx.result.plugins.pinia = false;

      const result = middleware(ctx);

      expect(result.result.plugins.pinia).toBe(false);
    });

    it("should preserve disabled plugins while normalizing enabled plugins", () => {
      const i18nInstance = {
        id: "i18n-instance",
      };

      const ctx = createMockCtx<RuntimeContext>();

      ctx.result.plugins.pinia = false;

      ctx.result.plugins.i18n = {
        locale: "en",
        [PLUGIN_META_KEY]: {
          instance: i18nInstance,
        },
      };

      const result = middleware(ctx);

      expect(result.result.plugins.pinia).toBe(false);

      expect(result.result.plugins.i18n).toEqual({
        locale: "en",
        [SHARED_PLUGIN_INSTANCE_KEY]: i18nInstance,
      });
    });

    it("should skip plugins with undefined configuration", () => {
      const ctx = createMockCtx<RuntimeContext>();

      ctx.result.plugins = {};

      const result = middleware(ctx);

      expect(result.result.plugins.pinia).toBeUndefined();
    });

    it("should leave unsupported plugin configurations unchanged", () => {
      const instance = {
        id: "unsupported-instance",
      };

      const unsupportedConfig = {
        a: 1,
        [PLUGIN_META_KEY]: {
          instance,
        },
      };

      const ctx = createMockCtx<RuntimeContext>();

      ctx.result.plugins.unsupportedPlugin = unsupportedConfig;

      const result = middleware(ctx);

      expect(result.result.plugins.unsupportedPlugin).toBe(unsupportedConfig);

      expect(result.result.plugins.unsupportedPlugin).toEqual(unsupportedConfig);

      expect(Reflect.ownKeys(unsupportedConfig)).toContain(PLUGIN_META_KEY);

      expect(Reflect.ownKeys(unsupportedConfig)).not.toContain(SHARED_PLUGIN_INSTANCE_KEY);
    });
  });

  describe("configuration immutability", () => {
    it("should not mutate original plugin configuration", () => {
      const instance = {
        id: "shared-instance",
      };

      const metadata = {
        instance,
      };

      const nested = {
        value: "original",
      };

      const config = {
        nested,
        [PLUGIN_META_KEY]: metadata,
      };

      const ctx = createMockCtx<RuntimeContext>();

      ctx.result.plugins.pinia = config;

      const result = middleware(ctx);

      const piniaConfig = result.result.plugins.pinia;

      expect(piniaConfig).not.toBe(config);

      expect(config[PLUGIN_META_KEY]).toBe(metadata);
      expect(config[PLUGIN_META_KEY].instance).toBe(instance);

      expect(Reflect.ownKeys(config)).toContain(PLUGIN_META_KEY);

      if (!isPluginOverlayObject(piniaConfig)) {
        throw new Error("Expected an enabled plugin configuration.");
      }

      expect(piniaConfig.nested).toBe(nested);
      expect(piniaConfig[SHARED_PLUGIN_INSTANCE_KEY]).toBe(instance);

      expect(Reflect.ownKeys(piniaConfig)).not.toContain(PLUGIN_META_KEY);
    });

    it("should support frozen plugin configurations", () => {
      const instance = {
        id: "frozen-instance",
      };

      const config = Object.freeze({
        a: 1,
        [PLUGIN_META_KEY]: {
          instance,
        },
      });

      const ctx = createMockCtx<RuntimeContext>();

      ctx.result.plugins.pinia = config;

      const result = middleware(ctx);

      expect(result.result.plugins.pinia).toEqual({
        a: 1,
        [SHARED_PLUGIN_INSTANCE_KEY]: instance,
      });

      expect(Reflect.ownKeys(config)).toContain(PLUGIN_META_KEY);
    });
  });

  describe("context preservation", () => {
    it("should preserve context identity", () => {
      const ctx = createMockCtx<RuntimeContext>();

      ctx.result.plugins.pinia = {
        a: 1,
      };

      const result = middleware(ctx);

      expect(result).toBe(ctx);
    });

    it("should preserve unrelated result state", () => {
      const ctx = createMockCtx<RuntimeContext>();

      ctx.result.mountOptions.attrs = {
        merged: true,
      };

      ctx.result.plugins.pinia = {
        a: 1,
      };

      const result = middleware(ctx);

      expect(result.result.plugins.pinia).toEqual({
        a: 1,
      });

      expect(result.result.mountOptions.attrs).toEqual({
        merged: true,
      });
    });
  });

  describe("instance reference validation", () => {
    it("should reject deferred plugin instance references", () => {
      const reference = fromPluginInstance("resolvedMiddlewareDependency", (instance) => instance);

      const ctx = createMockCtx<RuntimeContext>();

      ctx.result.plugins.pinia = {
        [PLUGIN_META_KEY]: {
          instance: reference,
        },
      };

      expect(() => middleware(ctx)).toThrow(
        `${ERROR_PREFIX} Plugin "pinia" cannot use fromPluginInstance() ` +
          "as an argument to withPluginInstance(). " +
          "withPluginInstance() requires a pre-created plugin instance.",
      );
    });

    it("should not apply partial updates when normalization throws", () => {
      const validInstance = {
        id: "valid-instance",
      };

      const reference = fromPluginInstance("resolvedMiddlewareDependency", (instance) => instance);

      const ctx = createMockCtx<RuntimeContext>();

      const piniaConfig = {
        [PLUGIN_META_KEY]: {
          instance: validInstance,
        },
      };

      const i18nConfig = {
        [PLUGIN_META_KEY]: {
          instance: reference,
        },
      };

      ctx.result.plugins.pinia = piniaConfig;
      ctx.result.plugins.i18n = i18nConfig;

      expect(() => middleware(ctx)).toThrow();

      expect(ctx.result.plugins.pinia).toBe(piniaConfig);
      expect(ctx.result.plugins.i18n).toBe(i18nConfig);

      expect(Reflect.ownKeys(piniaConfig)).toContain(PLUGIN_META_KEY);
      expect(Reflect.ownKeys(i18nConfig)).toContain(PLUGIN_META_KEY);
    });
  });

  describe("runtime isolation", () => {
    it("should normalize configurations independently across contexts", () => {
      const firstInstance = {
        id: "first",
      };

      const secondInstance = {
        id: "second",
      };

      const firstCtx = createMockCtx<RuntimeContext>();
      const secondCtx = createMockCtx<RuntimeContext>();

      firstCtx.result.plugins.pinia = {
        [PLUGIN_META_KEY]: {
          instance: firstInstance,
        },
      };

      secondCtx.result.plugins.pinia = {
        [PLUGIN_META_KEY]: {
          instance: secondInstance,
        },
      };

      const firstResult = middleware(firstCtx);
      const secondResult = middleware(secondCtx);

      expect(firstResult.result.plugins.pinia).toEqual({
        [SHARED_PLUGIN_INSTANCE_KEY]: firstInstance,
      });

      expect(secondResult.result.plugins.pinia).toEqual({
        [SHARED_PLUGIN_INSTANCE_KEY]: secondInstance,
      });
    });
  });

  describe("runtime isolation", () => {
    it("should normalize the same source configuration independently across contexts", () => {
      const instance = {
        id: "shared-instance",
        install() {},
      };

      const sourceConfig = {
        a: 1,
        [PLUGIN_META_KEY]: {
          instance,
        },
      };

      const firstCtx = createMockCtx<RuntimeContext>();
      const secondCtx = createMockCtx<RuntimeContext>();

      // Both contexts intentionally reference the same source configuration.
      firstCtx.result.plugins.pinia = sourceConfig;
      secondCtx.result.plugins.pinia = sourceConfig;

      const firstResult = middleware(firstCtx);
      const firstPiniaConfig = firstResult.result.plugins.pinia;

      const secondResult = middleware(secondCtx);
      const secondPiniaConfig = secondResult.result.plugins.pinia;

      // Each normalization must produce an independent config object.
      expect(firstPiniaConfig).not.toBe(sourceConfig);
      expect(secondPiniaConfig).not.toBe(sourceConfig);
      expect(firstPiniaConfig).not.toBe(secondPiniaConfig);

      // Both configs intentionally reuse the same plugin instance.
      expect(firstPiniaConfig).toEqual({
        a: 1,
        [SHARED_PLUGIN_INSTANCE_KEY]: instance,
      });

      expect(secondPiniaConfig).toEqual({
        a: 1,
        [SHARED_PLUGIN_INSTANCE_KEY]: instance,
      });

      // Normalization must not modify the shared input.
      expect(sourceConfig).toEqual({
        a: 1,
        [PLUGIN_META_KEY]: {
          instance,
        },
      });

      expect(Reflect.ownKeys(sourceConfig)).toContain(PLUGIN_META_KEY);

      // The second run must not replace the first result.
      expect(firstCtx.result.plugins.pinia).toBe(firstPiniaConfig);
      expect(secondCtx.result.plugins.pinia).toBe(secondPiniaConfig);
    });

    it("should not leak plugin instances between sequential normalizations", () => {
      const firstInstance = {
        id: "first-instance",
        install() {},
      };

      const secondInstance = {
        id: "second-instance",
        install() {},
      };

      const firstCtx = createMockCtx<RuntimeContext>();

      firstCtx.result.plugins.pinia = {
        a: 1,
        [PLUGIN_META_KEY]: {
          instance: firstInstance,
        },
      };

      const firstResult = middleware(firstCtx);
      const firstPiniaConfig = firstResult.result.plugins.pinia;

      expect(firstPiniaConfig).toEqual({
        a: 1,
        [SHARED_PLUGIN_INSTANCE_KEY]: firstInstance,
      });

      const secondCtx = createMockCtx<RuntimeContext>();

      secondCtx.result.plugins.pinia = {
        a: 2,
        [PLUGIN_META_KEY]: {
          instance: secondInstance,
        },
      };

      const secondResult = middleware(secondCtx);
      const secondPiniaConfig = secondResult.result.plugins.pinia;

      expect(secondPiniaConfig).toEqual({
        a: 2,
        [SHARED_PLUGIN_INSTANCE_KEY]: secondInstance,
      });

      // The second normalization must not affect the first result.
      expect(firstResult.result.plugins.pinia).toBe(firstPiniaConfig);

      expect(firstPiniaConfig).toEqual({
        a: 1,
        [SHARED_PLUGIN_INSTANCE_KEY]: firstInstance,
      });

      expect(firstPiniaConfig).not.toBe(secondPiniaConfig);
    });
  });
});
