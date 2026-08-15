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
      pinia: {
        initialState: {
          user: { id: 1 },
        },
        stubActions: false,
      },
    },
  };

  // ─────────────────────────────────────────────
  // Defaults of existing plugins
  // ─────────────────────────────────────────────
  describe("when extending defaults of an existing plugin", () => {
    it("should fully replace defaults when plugin already exists", () => {
      const result = extendPreset(base, {
        defaults: {
          pinia: {
            createSpy: vi.fn,
          },
        },
      });

      expect(result.defaults.pinia).toEqual({
        createSpy: expect.any(Function),
      });
    });

    it("should not deep-merge nested objects", () => {
      const result = extendPreset(base, {
        defaults: {
          pinia: {
            initialState: {
              cart: { items: [] },
            },
          },
        },
      });

      // original `user` is gone — full replace
      expect(result.defaults.pinia).toEqual({
        initialState: {
          cart: { items: [] },
        },
      });
      expect(result.defaults.pinia).not.toHaveProperty("stubActions");
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
          router: {
            routes: [],
          },
        },
      });

      expect(result.manifest).toHaveLength(2);
      expect(result.manifest.some(({ module }) => module === mockRouterPlugin)).toBe(true);
      expect(result.defaults.router).toEqual({ routes: [] });
    });

    it("should keep original plugins and only append the new one", () => {
      const result = extendPreset(base, {
        manifest: [
          {
            module: mockRouterPlugin,
            enabled: true,
          },
        ],
        defaults: {
          router: { routes: [] },
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

    it("should throw when defaults contain false", () => {
      expect(() =>
        extendPreset(base, {
          defaults: {
            pinia: false as any,
          },
        }),
      ).toThrow(/Preset defaults must be a plain object/);
    });

    it("should throw when defaults reference an unknown plugin", () => {
      expect(() =>
        extendPreset(base, {
          defaults: {
            unknown: {} as any,
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
      const originalDefaults = structuredClone(base.defaults);
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
          pinia: { createSpy: vi.fn },
          router: { routes: [] },
        },
      });

      // defaults не изменились
      expect(base.defaults).toEqual(originalDefaults);
      expect(base.defaults.pinia).toEqual({
        initialState: {
          user: { id: 1 },
        },
        stubActions: false,
      });

      // manifest не изменился
      expect(base.manifest).toEqual(originalManifest);
      expect(base.manifest[0].enabled).toBe(true);
    });

    it("should return a new object reference", () => {
      const result = extendPreset(base, {
        defaults: {
          pinia: { createSpy: vi.fn },
        },
      });

      expect(result).not.toBe(base);
      expect(result.manifest).not.toBe(base.manifest);
      expect(result.defaults).not.toBe(base.defaults);
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
          pinia: {
            createSpy: vi.fn,
          },
          i18n: {
            locale: "ru",
          },
        },
      });

      expect(result.manifest).toHaveLength(2);

      const piniaEntry = result.manifest.find((e) => e.module === mockPiniaPlugin);
      const i18nEntry = result.manifest.find((e) => e.module === mockI18nPlugin);

      expect(piniaEntry?.enabled).toBe(false);
      expect(i18nEntry?.enabled).toBe(true);

      expect(result.defaults.pinia).toEqual({ createSpy: expect.any(Function) });
      expect(result.defaults.i18n).toEqual({ locale: "ru" });
    });
  });
});

/*import { describe, it, expect, vi } from "vitest";
import { extendPreset } from "../extendPreset.js";

describe("extendPreset", () => {
  const mockPinia = {};
  const mockRouter = {};
  const mockPiniaPlugin = {
    getName: () => "pinia",
    getDefinition: () => ({ create: () => mockPinia }),
  };
  const mockRouterPlugin = {
    getName: () => "router",
    getDefinition: () => ({ create: () => mockRouter }),
  };

  const base = {
    manifest: [
      {
        module: mockPiniaPlugin,
        enabled: true,
      },
    ],
    defaults: {
      pinia: {
        initialState: {
          user: { id: 1 },
        },
        stubActions: false,
      },
    },
  };

  it("should replace defaults when plugin exists", () => {
    const result = extendPreset(base, {
      defaults: {
        pinia: {
          createSpy: vi.fn,
        },
      },
    });

    expect(result.defaults.pinia).toEqual({
      createSpy: expect.any(Function),
    });
  });

  it("should override enabled state when plugin exists", () => {
    const result = extendPreset(base, {
      manifest: [
        {
          module: mockPiniaPlugin,
          enabled: false,
        },
      ],
    });

    expect(result.manifest[0].enabled).toBe(false);
  });

  it("should add a new plugin when defaults are provided", () => {
    const result = extendPreset(base, {
      manifest: [
        {
          module: mockRouterPlugin,
          enabled: true,
        },
      ],
      defaults: {
        router: {
          routes: [],
        },
      },
    });

    expect(result.manifest.some(({ module }) => module.getName() === "router")).toBe(true);

    expect(result.defaults.router).toEqual({
      routes: [],
    });
  });
});
*/
