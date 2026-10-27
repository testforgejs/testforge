import { beforeEach, describe, expect, it, vi } from "vitest";

import { PLUGIN_META_KEY, SHARED_PLUGIN_INSTANCE_KEY } from "../../../../constants/constants.js";

import { createMockCtx } from "../../../__tests__/fixtures.js";

import { getPluginConfig } from "../../logic/getPluginConfig.js";
import { createPluginMiddleware } from "../createPluginMiddleware.js";
import { isPluginOverlayObject } from "../../../middleware/typeGuards/isPluginOverlayObject.js";

import type { RuntimeContext } from "../../../../types";

vi.mock("../../logic/getPluginConfig.js", () => ({
  getPluginConfig: vi.fn(),
}));

const mockGetPluginConfig = vi.mocked(getPluginConfig);

describe("createPluginMiddleware", () => {
  const name = "testPlugin";
  const middleware = createPluginMiddleware(name);

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("configuration resolution", () => {
    it("should resolve configuration for the specified plugin", () => {
      const ctx = createMockCtx();

      mockGetPluginConfig.mockReturnValue({
        a: 1,
      });

      middleware(ctx);

      expect(mockGetPluginConfig).toHaveBeenCalledExactlyOnceWith(ctx, name);
    });

    it("should write resolved plugin configuration into result.plugins", () => {
      const ctx = createMockCtx();

      const config = {
        a: 1,
        enabled: true,
      };

      mockGetPluginConfig.mockReturnValue(config);

      const result = middleware(ctx);

      expect(result.result.plugins[name]).toEqual(config);
    });

    it("should replace existing plugin configuration with resolved configuration", () => {
      const ctx = createMockCtx();

      ctx.result.plugins[name] = {
        oldOption: true,
      };

      const config = {
        newOption: true,
      };

      mockGetPluginConfig.mockReturnValue(config);

      const result = middleware(ctx);

      expect(result.result.plugins[name]).toEqual({
        newOption: true,
      });

      expect(result.result.plugins[name]).not.toHaveProperty("oldOption");
    });

    it("should preserve configurations of other plugins", () => {
      const ctx = createMockCtx();

      const otherPluginConfig = {
        locale: "en",
      };

      ctx.result.plugins.i18n = otherPluginConfig;

      mockGetPluginConfig.mockReturnValue({
        a: 1,
      });

      const result = middleware(ctx);

      expect(result.result.plugins[name]).toEqual({
        a: 1,
      });

      expect(result.result.plugins.i18n).toBe(otherPluginConfig);
    });
  });

  describe("plugin disabling", () => {
    it("should write false when the plugin is disabled", () => {
      const ctx = createMockCtx();

      mockGetPluginConfig.mockReturnValue(false);

      const result = middleware(ctx);

      expect(result.result.plugins[name]).toBe(false);
      expect(mockGetPluginConfig).toHaveBeenCalledWith(ctx, name);
    });

    it("should replace existing configuration with false", () => {
      const ctx = createMockCtx();

      ctx.result.plugins[name] = {
        a: 1,
      };

      mockGetPluginConfig.mockReturnValue(false);

      const result = middleware(ctx);

      expect(result.result.plugins[name]).toBe(false);
    });
  });

  describe("plugin metadata preservation", () => {
    it("should preserve symbol-keyed metadata without normalization", () => {
      const instance = {
        install() {},
      };

      const config = {
        a: 1,
        [PLUGIN_META_KEY]: {
          instance,
        },
      };

      const ctx = createMockCtx();

      mockGetPluginConfig.mockReturnValue(config);

      const result = middleware(ctx);
      const pluginConfig = result.result.plugins[name];

      expect(pluginConfig).toEqual(config);

      if (!isPluginOverlayObject(pluginConfig)) {
        throw new Error("Expected an enabled plugin configuration");
      }

      expect(Reflect.ownKeys(pluginConfig)).toContain(PLUGIN_META_KEY);
      expect(Reflect.ownKeys(pluginConfig)).not.toContain(SHARED_PLUGIN_INSTANCE_KEY);
    });

    it("should not convert metadata into a shared plugin instance", () => {
      const instance = {
        install() {},
      };

      const config = {
        [PLUGIN_META_KEY]: {
          instance,
        },
      };

      const ctx = createMockCtx();

      mockGetPluginConfig.mockReturnValue(config);

      const result = middleware(ctx);
      const pluginConfig = result.result.plugins[name];

      if (!isPluginOverlayObject(pluginConfig)) {
        throw new Error("Expected an enabled plugin configuration");
      }

      expect(pluginConfig[PLUGIN_META_KEY]?.instance).toBe(instance);

      expect(Reflect.ownKeys(pluginConfig)).not.toContain(SHARED_PLUGIN_INSTANCE_KEY);
    });

    it("should not mutate the original resolved configuration", () => {
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

      const ctx = createMockCtx();

      mockGetPluginConfig.mockReturnValue(config);

      middleware(ctx);

      expect(config).toEqual({
        a: 1,
        [PLUGIN_META_KEY]: {
          instance,
        },
      });

      expect(config[PLUGIN_META_KEY]).toBe(meta);
      expect(config[PLUGIN_META_KEY].instance).toBe(instance);
    });
  });

  describe("context preservation", () => {
    it("should preserve unrelated result state", () => {
      const ctx = createMockCtx<RuntimeContext>();

      // Simulate mount options already processed by an earlier pipeline stage.
      ctx.result.mountOptions.attrs = {
        merged: true,
      };

      mockGetPluginConfig.mockReturnValue({
        a: 1,
      });

      const result = middleware(ctx);

      expect(result.result.plugins[name]).toEqual({
        a: 1,
      });

      expect(result.result.mountOptions.attrs).toEqual({
        merged: true,
      });
    });

    it("should preserve context identity", () => {
      const ctx = createMockCtx();

      mockGetPluginConfig.mockReturnValue({
        a: 1,
      });

      const result = middleware(ctx);

      expect(result).toBe(ctx);
    });
  });
});
