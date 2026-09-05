import { describe, it, expect, vi } from "vitest";
import { extendPreset } from "../extendPreset.js";

describe("extendPreset", () => {
  const mockPinia = {};
  const mockRouter = {};
  const mockI18n = {};

  const mockPiniaPlugin = {
    getName: () => "pinia",
    getDefinition: () => ({ create: () => mockPinia }),
  };

  const mockRouterPlugin = {
    getName: () => "router",
    getDefinition: () => ({ create: () => mockRouter }),
  };

  const mockI18nPlugin = {
    getName: () => "i18n",
    getDefinition: () => ({ create: () => mockI18n }),
  };

  const base = {
    manifest: [
      {
        module: mockPiniaPlugin,
        enabled: true,
      },
    ],
    defaults: {
      pinia: () => ({
        initialState: {
          user: { id: 1 },
        },
        stubActions: false,
      }),
    },
  };

  // ─────────────────────────────────────────────
  // Defaults of existing plugins
  // ─────────────────────────────────────────────
  describe("when extending defaults of an existing plugin", () => {
    it("should fully replace defaults when plugin already exists", () => {
      const result = extendPreset(base, {
        defaults: {
          pinia: () => ({
            createSpy: vi.fn,
          }),
        },
      });

      expect(result.defaults.pinia()).toEqual({
        createSpy: expect.any(Function),
      });
    });

    it("should not deep-merge nested objects", () => {
      const result = extendPreset(base, {
        defaults: {
          pinia: () => ({
            initialState: {
              cart: { items: [] },
            },
          }),
        },
      });

      // The original `user` state is gone — full replacement
      expect(result.defaults.pinia()).toEqual({
        initialState: {
          cart: { items: [] },
        },
      });
      expect(result.defaults.pinia()).not.toHaveProperty("stubActions");
    });
  });

  // ─────────────────────────────────────────────
  // Enabled state
  // ─────────────────────────────────────────────
  describe("when changing enabled state of an existing plugin", () => {
    it("should override enabled to false when plugin exists", () => {
      const result = extendPreset(base, {
        manifest: [
          {
            module: mockPiniaPlugin,
            enabled: false,
          },
        ],
      });

      expect(result.manifest).toHaveLength(1);
      expect(result.manifest[0].enabled).toBe(false);
      expect(result.manifest[0].module).toBe(mockPiniaPlugin);
    });

    it("should override enabled to true when plugin exists", () => {
      const disabledBase = {
        ...base,
        manifest: [{ module: mockPiniaPlugin, enabled: false }],
      };

      const result = extendPreset(disabledBase, {
        manifest: [
          {
            module: mockPiniaPlugin,
            enabled: true,
          },
        ],
      });

      expect(result.manifest[0].enabled).toBe(true);
    });
  });

  // ─────────────────────────────────────────────
  // Adding new plugins
  // ─────────────────────────────────────────────
  describe("when adding a new plugin", () => {
    it("should add a new plugin when defaults are provided", () => {
      const result = extendPreset(base, {
        manifest: [
          {
            module: mockRouterPlugin,
            enabled: true,
          },
        ],
        defaults: {
          router: () => ({
            routes: [],
          }),
        },
      });

      expect(result.manifest).toHaveLength(2);
      expect(result.manifest.some(({ module }) => module === mockRouterPlugin)).toBe(true);
      expect(result.defaults.router()).toEqual({ routes: [] });
    });

    it("should preserve existing manifest entries and append the new plugin", () => {
      const result = extendPreset(base, {
        manifest: [
          {
            module: mockRouterPlugin,
            enabled: true,
          },
        ],
        defaults: {
          router: () => ({ routes: [] }),
        },
      });

      expect(result.manifest[0].module).toBe(mockPiniaPlugin);
      expect(result.manifest[0].enabled).toBe(true);
      expect(result.manifest[1].module).toBe(mockRouterPlugin);
    });
  });

  // ─────────────────────────────────────────────
  // Error cases
  // ─────────────────────────────────────────────
  describe("when invalid extension is provided", () => {
    it("should throw when adding a new plugin without defaults", () => {
      expect(() =>
        extendPreset(base, {
          manifest: [
            {
              module: mockRouterPlugin,
              enabled: true,
            },
          ],
        }),
      ).toThrow(/without defining its defaults/);
    });

    it("should throw when a plugin default is not a plugin options factory", () => {
      expect(() =>
        extendPreset(base, {
          // @ts-expect-error: Deliberately pass `false` instead of a function factory to check for runtime validation
          defaults: { pinia: false },
        }),
      ).toThrow(/Preset defaults must be provided as a plugin options factory function/);
    });

    it("should throw when defaults reference an unknown plugin", () => {
      expect(() =>
        extendPreset(base, {
          defaults: {
            unknown: () => ({}),
          },
        }),
      ).toThrow(/unknown plugin/);
    });

    it("should throw when base preset is null or undefined", () => {
      expect(() => extendPreset(null as any, {})).toThrow(/null or undefined preset/);
      expect(() => extendPreset(undefined as any, {})).toThrow(/null or undefined preset/);
    });

    it("should throw when extension is null or undefined", () => {
      expect(() => extendPreset(base, null as any)).toThrow(/null or undefined/);
      expect(() => extendPreset(base, undefined as any)).toThrow(/null or undefined/);
    });
  });

  // ─────────────────────────────────────────────
  // Immutability
  // ─────────────────────────────────────────────
  describe("when checking immutability", () => {
    it("should not mutate the original base preset", () => {
      const originalDefaults = base.defaults;
      const originalPiniaFactory = base.defaults.pinia;
      const originalPiniaDefaults = base.defaults.pinia();
      const originalManifest = base.manifest.map((e) => ({ ...e }));

      extendPreset(base, {
        manifest: [
          {
            module: mockPiniaPlugin,
            enabled: false,
          },
          {
            module: mockRouterPlugin,
            enabled: true,
          },
        ],
        defaults: {
          pinia: () => ({
            createSpy: vi.fn,
          }),
          router: () => ({
            routes: [],
          }),
        },
      });

      // The original `defaults` remain unchanged
      expect(base.defaults).toBe(originalDefaults);
      expect(base.defaults.pinia).toBe(originalPiniaFactory);
      expect(base.defaults.pinia()).toEqual(originalPiniaDefaults);

      // The original `manifest` remains unchanged
      expect(base.manifest).toEqual(originalManifest);
      expect(base.manifest[0].enabled).toBe(true);
    });

    it("should return a new object reference", () => {
      const result = extendPreset(base, {
        defaults: {
          pinia: () => ({ createSpy: vi.fn }),
        },
      });

      expect(result).not.toBe(base);
      expect(result.manifest).not.toBe(base.manifest);
      expect(result.defaults).not.toBe(base.defaults);
      expect(result.manifest[0]).not.toBe(base.manifest[0]);
    });
  });

  // ─────────────────────────────────────────────
  // Combined scenarios
  // ─────────────────────────────────────────────
  describe("when combining several changes", () => {
    it("should correctly apply enabled override + new plugin + defaults replace", () => {
      const result = extendPreset(base, {
        manifest: [
          {
            module: mockPiniaPlugin,
            enabled: false,
          },
          {
            module: mockI18nPlugin,
            enabled: true,
          },
        ],
        defaults: {
          pinia: () => ({
            createSpy: vi.fn,
          }),
          i18n: () => ({
            locale: "ru",
          }),
        },
      });

      expect(result.manifest).toHaveLength(2);

      const piniaEntry = result.manifest.find((e) => e.module === mockPiniaPlugin);
      const i18nEntry = result.manifest.find((e) => e.module === mockI18nPlugin);

      expect(piniaEntry?.enabled).toBe(false);
      expect(i18nEntry?.enabled).toBe(true);

      expect(result.defaults.pinia()).toEqual({ createSpy: expect.any(Function) });
      expect(result.defaults.i18n()).toEqual({ locale: "ru" });
    });
  });
});
