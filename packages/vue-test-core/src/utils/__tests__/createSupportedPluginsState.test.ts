import { describe, it, expect, vi } from "vitest";
import { createSupportedPluginsState } from "../createSupportedPluginsState.js";

import type { PluginManifestEntry, PluginModule, PresetDefinition } from "../../types";

const createMockPluginModule = (name: string) => ({
  getName: vi.fn(() => name),
  getDefinition: vi.fn(),
});

describe("createSupportedPluginsState", () => {
  describe("Edge Cases", () => {
    it("should return empty object when preset is undefined", () => {
      expect(createSupportedPluginsState(undefined)).toEqual({});
    });

    it("should return empty object when manifest is empty", () => {
      const preset = { manifest: [], defaults: {} };

      expect(createSupportedPluginsState(preset)).toEqual({});
    });
  });

  describe("Manifest Mapping", () => {
    it("should map enabled plugins to true and disabled plugins to false", () => {
      const mockPinia = createMockPluginModule("pinia");
      const mockI18n = createMockPluginModule("i18n");

      const preset = {
        manifest: [
          { module: mockPinia, enabled: true },
          { module: mockI18n, enabled: false },
        ],
        defaults: {
          pinia: {},
          i18n: {},
        },
      };

      const result = createSupportedPluginsState(preset);

      expect(result).toEqual({
        pinia: true,
        i18n: false,
      });
    });

    it("should call getName for each manifest entry", () => {
      const pluginModuleA = createMockPluginModule("a");
      const pluginModuleB = createMockPluginModule("b");

      const preset = {
        manifest: [
          { module: pluginModuleA, enabled: true },
          { module: pluginModuleB, enabled: true },
        ],
        defaults: {
          a: {},
          b: {},
        },
      };

      createSupportedPluginsState(preset);

      expect(pluginModuleA.getName).toHaveBeenCalledTimes(1);
      expect(pluginModuleB.getName).toHaveBeenCalledTimes(1);
    });
  });

  describe("Robustness & Error Cases", () => {
    it("should return empty object when manifest is not an array", () => {
      // null and undefined are already caught by the guard `!preset?.manifest`
      expect(
        createSupportedPluginsState({
          manifest: null as unknown as PluginManifestEntry[],
          defaults: {},
        }),
      ).toEqual({});
      expect(
        createSupportedPluginsState({
          manifest: undefined as unknown as PluginManifestEntry[],
          defaults: {},
        }),
      ).toEqual({});

      // Non-iterable values cause error — this is current behavior
      expect(() =>
        createSupportedPluginsState({ manifest: {} as PluginManifestEntry[], defaults: {} }),
      ).toThrow();
      expect(() =>
        createSupportedPluginsState({
          manifest: "not-array" as unknown as PluginManifestEntry[],
          defaults: {},
        }),
      ).toThrow();
      expect(() =>
        createSupportedPluginsState({
          manifest: 42 as unknown as PluginManifestEntry[],
          defaults: {},
        }),
      ).toThrow();
    });

    it("should handle missing getName method (throws)", () => {
      const preset = {
        manifest: [{ module: {} as PluginModule, enabled: true }],
        defaults: {},
      };

      expect(() => createSupportedPluginsState(preset)).toThrow();
    });

    it("should handle getName that returns non-string", () => {
      const preset = {
        manifest: [
          {
            module: { getName: () => 123 as unknown as PluginModule, getDefinition: vi.fn() },
            enabled: true,
          },
          {
            module: { getName: () => null as unknown as PluginModule, getDefinition: vi.fn() },
            enabled: false,
          },
        ],
        defaults: {},
      };

      const result = createSupportedPluginsState(preset as unknown as PresetDefinition);
      expect(result).toEqual({
        123: true,
        null: false,
      });
    });

    it("should throw when plugin enabled flag is not a boolean", () => {
      const preset = {
        manifest: [
          {
            module: createMockPluginModule("test"),
            enabled: undefined,
          },
        ],
        defaults: {
          test: {},
        },
      } as unknown as PresetDefinition;

      expect(() => createSupportedPluginsState(preset)).toThrow(
        '[TestForge] Plugin "test" has invalid "enabled" value: undefined. Expected boolean.',
      );
    });

    it("should let last duplicate plugin name win", () => {
      const preset = {
        manifest: [
          { module: createMockPluginModule("router"), enabled: true },
          { module: createMockPluginModule("router"), enabled: false },
          { module: createMockPluginModule("router"), enabled: true },
        ],
        defaults: {
          router: {},
        },
      };

      expect(createSupportedPluginsState(preset)).toEqual({ router: true });
    });
  });
});
