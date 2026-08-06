import { describe, it, expect, vi } from "vitest";
import { createPipelineContext } from "../core/createPipelineContext.js";
import { createPipeline } from "../core/createPipeline.js";
import { createMountPipeline } from "../mount/createMountPipeline.js";
import { presets } from "../../__tests__/utils/presets/mockPresets.js";
import { piniaPlugin } from "@testforgejs/vue-test-plugin-pinia";
import { i18nPlugin } from "@testforgejs/vue-test-plugin-i18n";
import { routerPlugin } from "@testforgejs/vue-test-plugin-router";
import { ERROR_PREFIX } from "../../constants/constants.js";

import type { RuntimePluginConfig, TestFrameworkPresets } from "../../types";

describe("Mount Pipeline Integration", () => {
  const run = (
    presets: TestFrameworkPresets,
    defaultMountOptions = {},
    mountOptions = {},
    extraOptions = {},
  ) => {
    const ctx = createPipelineContext({
      defaultMountOptions,
      mountOptions,
      extraOptions,
      presets,
    });
    const pipeline = createPipeline(createMountPipeline(ctx));
    return pipeline.run(ctx).result;
  };

  describe("Global Options (Deep Merge)", () => {
    it("should merge global stubs deep when provided in both default and mount options", () => {
      const defaults = { global: { stubs: { BaseButton: true } } };
      const overrides = { global: { stubs: { MyIcon: true } } };

      const result = run(presets, defaults, overrides);

      expect(result.global.stubs).toEqual({
        BaseButton: true,
        MyIcon: true,
      });
    });
  });

  describe("Plugin Options (Shallow Merge & ExtraOptions)", () => {
    it("should override plugin state entirely when provided in mount options (to avoid array pollution)", () => {
      const defaults = {
        plugins: {
          pinia: { initialState: { list: [1, 2] } },
        },
      };
      const overrides = {
        plugins: {
          pinia: { initialState: { list: [] } },
        },
      };

      const result = run(presets, defaults, overrides);

      const piniaConfig = result.plugins.pinia as RuntimePluginConfig;

      // Verify that the array has been replaced, not concatenated, in [1, 2]
      expect(piniaConfig.initialState.list).toEqual([]);
    });

    it("should augment plugin config when using extraOptions instead of mountOptions", () => {
      const defaults = {
        plugins: {
          pinia: { stubActions: true, initialState: { keyA: 1 } },
        },
      };
      // Pass only one key to extraOptions
      const extra = { plugins: { pinia: { initialState: { keyB: 2 } } } };

      const result = run(presets, defaults, {}, extra);

      const piniaConfig = result.plugins.pinia as RuntimePluginConfig;

      expect(piniaConfig.stubActions).toBe(true);
      expect(piniaConfig.initialState).toEqual({ keyB: 2 });
    });
  });

  describe("Shared Instances (__meta)", () => {
    it("should extract instance to __sharedInstance and remove __meta when provided in extraOptions", () => {
      const mockInstance = { id: "shared-router" };
      const extra = {
        plugins: {
          router: {
            __meta: { instance: mockInstance },
            routes: [],
          },
        },
      };

      const result = run(presets, {}, {}, extra);

      const routerConfig = result.plugins.router as RuntimePluginConfig;

      expect(routerConfig.__sharedInstance).toBe(mockInstance);
      expect(routerConfig.__meta).toBeUndefined();
      expect(routerConfig.routes).toEqual([]);
    });
  });

  describe("Activation & Defaults", () => {
    it("should apply default i18n settings when plugin is active but no options are provided", () => {
      // pluginDefaultsState.i18n contains { locale: ‘en’ }; the plugin is enabled by default
      const result = run(presets);

      const i18nConfig = result.plugins.i18n as RuntimePluginConfig;
      expect(i18nConfig.locale).toBe("en");
    });

    it("should return false for a plugin when it is explicitly disabled in mountOptions", () => {
      const overrides = { plugins: { pinia: false } };

      const result = run(presets, {}, overrides);

      expect(result.plugins.pinia).toBe(false);
    });
  });

  describe("Base Mount Options", () => {
    it('should keep flat mount options like "shallow" while separating them from plugins/global', () => {
      const defaults = { shallow: true, plugins: { i18n: {} } };
      const overrides = { shallow: false };

      const result = run(presets, defaults, overrides);

      expect(result.mountOptions.shallow).toBe(false);
      // Verify that no objects managed by other middleware have been passed into `mountOptions`
      // @ts-expect-error Intentionally passing invalid mountOptions
      expect(result.mountOptions.plugins).toBeUndefined();
      expect(result.mountOptions.global).toBeUndefined();
    });
  });

  /**
   * Verify data override behavior
   *
   * data() definitions are replaced rather than merged.
   * The most specific level wins.
   */
  describe("Data Option (Function Override)", () => {
    it("should use data from defaultMountOptions when no override is provided", () => {
      const defaults = {
        data() {
          return {
            counter: 1,
            status: "idle",
          };
        },
      };

      const result = run(presets, defaults);

      const dataFn = result.mountOptions.data;
      expect(dataFn).toBeDefined();
      expect(dataFn!()).toEqual({
        counter: 1,
        status: "idle",
      });
    });

    it("should override default data function when mountOptions provides data", () => {
      const defaults = {
        data() {
          return {
            counter: 1,
            status: "idle",
          };
        },
      };

      const overrides = {
        data() {
          return {
            counter: 42,
            status: "loading",
          };
        },
      };

      const result = run(presets, defaults, overrides);

      const dataFn = result.mountOptions.data;
      expect(dataFn).toBeDefined();
      expect(dataFn!()).toEqual({
        counter: 42,
        status: "loading",
      });
    });

    it("should not merge results of data functions", () => {
      const defaults = {
        data() {
          return {
            counter: 1,
            status: "idle",
          };
        },
      };

      const overrides = {
        data() {
          return {
            counter: 42,
          };
        },
      };

      const result = run(presets, defaults, overrides);

      const dataFn = result.mountOptions.data;
      expect(dataFn).toBeDefined();
      expect(dataFn!()).toEqual({
        counter: 42,
      });

      expect(dataFn!()).not.toEqual({
        counter: 42,
        status: "idle",
      });
    });

    it("should ignore default data when skipDefaultOptions is true", () => {
      const defaults = {
        data() {
          return {
            counter: 1,
          };
        },
      };

      const extra = {
        skipDefaultOptions: true,
      };

      const result = run(presets, defaults, {}, extra);

      expect(result.mountOptions.data).toBeUndefined();
    });
  });

  /**
   * Verify attrs merge behavior
   *
   * attrs are shallow-merged.
   * More specific values override existing keys.
   */
  describe("Attrs (Shallow Merge)", () => {
    it("should merge attrs from default and mount options", () => {
      const defaults = {
        attrs: {
          id: "base-id",
          class: "base-class",
        },
      };

      const overrides = {
        attrs: {
          title: "tooltip",
        },
      };

      const result = run(presets, defaults, overrides);

      expect(result.mountOptions.attrs).toEqual({
        id: "base-id",
        class: "base-class",
        title: "tooltip",
      });
    });

    it("should override existing attr values", () => {
      const defaults = {
        attrs: {
          class: "base-class",
          title: "base-title",
        },
      };

      const overrides = {
        attrs: {
          title: "custom-title",
        },
      };

      const result = run(presets, defaults, overrides);

      expect(result.mountOptions.attrs).toEqual({
        class: "base-class",
        title: "custom-title",
      });
    });

    it("should replace arrays instead of concatenating them", () => {
      const defaults = {
        attrs: {
          items: [1, 2],
        },
      };

      const overrides = {
        attrs: {
          items: [],
        },
      };

      const result = run(presets, defaults, overrides);

      expect(result.mountOptions.attrs!.items).toEqual([]);
    });

    it("should preserve default attrs when mount options do not provide attrs", () => {
      const defaults = {
        attrs: {
          id: "base-id",
        },
      };

      const result = run(presets, defaults);

      expect(result.mountOptions.attrs).toEqual({
        id: "base-id",
      });
    });

    it("should ignore default attrs when skipDefaultOptions is true", () => {
      const defaults = {
        attrs: {
          id: "base-id",
        },
      };

      const extra = {
        skipDefaultOptions: true,
      };

      const result = run(presets, defaults, {}, extra);

      expect(result.mountOptions.attrs).toBeUndefined();
    });
  });

  describe("Mount Pipeline Advanced Scenarios", () => {
    describe("Plugin Configuration Validation", () => {
      it("should throw an error when a string is passed to plugin options", () => {
        const overrides = { plugins: { pinia: "i_am_a_string" } };

        expect(() => run(presets, {}, overrides)).toThrow(
          `${ERROR_PREFIX} Invalid configuration for plugin "pinia"`,
        );
      });

      it("should throw an error when null is passed to plugin options", () => {
        const overrides = { plugins: { pinia: null } };

        expect(() => run(presets, {}, overrides)).toThrow(
          `${ERROR_PREFIX} Invalid configuration for plugin "pinia"`,
        );
      });

      it("should throw an error when a number is passed to extraOptions", () => {
        const extra = { plugins: { i18n: 123 } };

        expect(() => run(presets, {}, {}, extra)).toThrow(/received number \(123\)/);
      });
    });

    describe("Negative Scenarios & Edge Cases", () => {
      it("should ignore __meta if it is not an object", () => {
        const extra = { plugins: { pinia: { __meta: "not_an_object" } } };
        const result = run(presets, {}, {}, extra);

        const piniaConfig = result.plugins.pinia as RuntimePluginConfig;
        expect(piniaConfig.__sharedInstance).toBeUndefined();
      });
    });

    describe("Middleware Execution Order", () => {
      it("should ensure withPluginsBase runs before specific plugin middleware to allow overrides", () => {
        // If withPluginsBase runs AFTER withPinia, it will overwrite everything
        // that withPinia has prepared with its “raw” spread.
        const defaults = { plugins: { pinia: { keyA: 1 } } };
        const overrides = { plugins: { pinia: { keyB: 2 } } };

        const result = run(presets, defaults, overrides);

        const piniaConfig = result.plugins.pinia as RuntimePluginConfig;

        // If the order is correct:
        // 1. withPluginsBase collected { keyB: 2 }
        // 2. withPinia concatenated pluginDefaultsState.pinia + { keyB: 2 }
        expect(piniaConfig.keyB).toBe(2);
        expect(piniaConfig.initialState).toBeDefined(); // A sign of working withPinia
      });
    });

    describe("Router Specifics", () => {
      it("should apply default placeholder route when Router is enabled but no routes are provided", () => {
        // Explicitly initialize the router with an empty object so that the middleware defaults take effect
        const overrides = { plugins: { router: {} } };

        const result = run(presets, {}, overrides);

        const routerConfig = result.plugins.router as RuntimePluginConfig;

        expect(routerConfig.routes).toHaveLength(1);
        expect(routerConfig.routes[0].path).toBe("/");
      });

      it('should return "false" for Router when no options are provided (default state from manifest)', () => {
        // In manifest, the value for router is false
        // A call without arguments should preserve this state
        const result = run(presets);

        expect(result.plugins.router).toBe(false);
      });

      it("should replace default routes entirely when custom routes are provided in mountOptions", () => {
        const customRoutes = [{ path: "/login", name: "login" }];
        const overrides = {
          plugins: { router: { routes: customRoutes } },
        };

        const result = run(presets, {}, overrides);

        const routerConfig = result.plugins.router as RuntimePluginConfig;

        expect(routerConfig.routes).toEqual(customRoutes);
        expect(routerConfig.routes).not.toContainEqual(expect.objectContaining({ path: "/" }));
      });

      it("should allow providing a shared router instance via __meta while keeping custom routes", () => {
        const mockRouter = { push: vi.fn() };
        const customRoutes = [{ path: "/test" }];
        const extra = {
          plugins: {
            router: {
              __meta: { instance: mockRouter },
              routes: customRoutes,
            },
          },
        };

        const result = run(presets, {}, {}, extra);

        const routerConfig = result.plugins.router as RuntimePluginConfig;

        expect(routerConfig.__sharedInstance).toBe(mockRouter);
        expect(routerConfig.routes).toEqual(customRoutes);
      });
    });
  });

  describe("Global Plugins (Deep Merge)", () => {
    it("should concatenate plugin arrays when provided in both default and mount options", () => {
      const mockVfm = { install: () => {}, name: "vfm" };
      const mockVuetify = { install: () => {}, name: "vuetify" };

      const defaults = {
        global: {
          plugins: [mockVfm],
        },
      };
      const overrides = {
        global: {
          plugins: [mockVuetify],
        },
      };

      const result = run(presets, defaults, overrides);

      // Verify that the arrays have been concatenated, not replaced
      expect(result.global.plugins).toHaveLength(2);
      expect(result.global.plugins).toEqual([mockVfm, mockVuetify]);
    });

    it("should keep base plugins when no overrides are provided in the test", () => {
      const mockVfm = { install: () => {} };
      const defaults = {
        global: {
          plugins: [mockVfm],
        },
      };

      const result = run(presets, defaults, {});

      expect(result.global.plugins).toEqual([mockVfm]);
    });
  });

  describe("Plugin Whitelist Validation", () => {
    it("should throw an error when an unsupported plugin is passed to mountOptions.plugins", () => {
      const overrides = { plugins: { vuetify: {} } };

      expect(() => run(presets, {}, overrides)).toThrow(
        /Plugin "vuetify" is configured but not supported by the active preset/,
      );
    });

    it("should throw an error when an unsupported plugin is passed via extraOptions", () => {
      const extra = {
        plugins: {
          vuetify: {},
        },
      };

      expect(() => run(presets, {}, {}, extra)).toThrow(
        /Plugin "vuetify" is configured but not supported by the active preset/,
      );
    });

    it("should NOT throw an error for unknown keys in extraOptions that are not plugins", () => {
      // Verify that we are not blocking other technical keys in extraOptions
      const extra = { someTechnicalFlag: true };

      expect(() => run(presets, {}, {}, extra)).not.toThrow();
    });

    it("should still validate types for allowed plugins even if they are correctly named", () => {
      const overrides = { plugins: { pinia: "invalid_string" } };

      expect(() => run(presets, {}, overrides)).toThrow(/Expected Object or Boolean/);
    });

    it("should exclude unsupported default plugins from runtime plugin state", () => {
      const defaults = {
        plugins: {
          pinia: {},
          vfm: {},
        },
      };

      const mockPresets = {
        default: {
          manifest: [{ module: piniaPlugin, enabled: true }],
          defaults: {
            pinia: {},
          },
        },
      };

      const result = run(mockPresets, defaults);

      expect(result.plugins.pinia).toEqual({});
      expect(result.plugins.vfm).toBeUndefined();
    });
  });

  describe("Plugin Activation Pipeline (Overriding Logic)", () => {
    // Scenario 1: Default options are disabled; the test is explicitly enabled
    it("should enable plugin when default is false but mountOptions provides an object", () => {
      const baseMountOptions = {
        plugins: { pinia: false },
      };
      const mountOptions = {
        plugins: { pinia: {} },
      };

      const result = run(presets, baseMountOptions, mountOptions);

      // Should be returned object with default values (since {} allowed activation)
      expect(result.plugins.pinia).toEqual(
        expect.objectContaining({
          initialState: {},
          stubActions: false,
        }),
      );
    });

    // Scenario 2: Basic options are disabled; the test says nothing
    it("should stay disabled when default is false and mountOptions is empty", () => {
      const baseMountOptions = {
        plugins: { pinia: false },
      };
      const mountOptions = {
        plugins: {}, // or not passed at all
      };

      const result = run(presets, baseMountOptions, mountOptions);

      expect(result.plugins.pinia).toBe(false);
    });

    // Scenario 3: Basic options are enabled; the test is explicitly disabled
    it("should disable plugin when default is an object but mountOptions provides false", () => {
      const baseMountOptions = {
        plugins: { pinia: {} },
      };
      const mountOptions = {
        plugins: { pinia: false },
      };

      const result = run(presets, baseMountOptions, mountOptions);

      expect(result.plugins.pinia).toBe(false);
    });

    // Scenario 4: Checking via extraOptions (Priority)
    it("should enable plugin via extraOptions even if it was disabled in mountOptions", () => {
      const overrides = { plugins: { pinia: false } };
      const extra = { plugins: { pinia: { keyA: 1 } } };

      const result = run(presets, {}, overrides, extra);

      const piniaConfig = result.plugins.pinia as RuntimePluginConfig;

      // extraOptions has the highest activation priority
      expect(piniaConfig.keyA).toBe(1);
    });
  });

  describe("Default Activation (Empty Options Scenario)", () => {
    it("should activate Pinia by default when no options are provided", () => {
      const result = run(presets);

      expect(result.plugins.pinia).toEqual(
        expect.objectContaining({
          initialState: {},
          stubActions: false,
        }),
      );
    });

    it("should activate i18n by default when no options are provided", () => {
      const result = run(presets);

      expect(result.plugins.i18n).toEqual(
        expect.objectContaining({
          locale: "en",
        }),
      );
    });

    it("should NOT activate Router by default (should be false)", () => {
      const result = run(presets);

      // Since manifest contains false for router,
      // But there's nothing in the overrides; it remains false.
      expect(result.plugins.router).toBe(false);
    });

    it("should activate Router only when explicitly requested in mountOptions", () => {
      const overrides = { plugins: { router: {} } };
      const result = run(presets, {}, overrides);

      expect(result.plugins.router).toEqual(
        expect.objectContaining({
          routes: expect.any(Array),
        }),
      );
    });

    it("should activate Router only when explicitly requested in extraOptions", () => {
      const extra = { plugins: { router: {} } };
      const result = run(presets, {}, {}, extra);

      expect(result.plugins.router).toEqual(
        expect.objectContaining({
          routes: expect.any(Array),
        }),
      );
    });
  });

  describe("Plugin extraOptions Priority & Behavior", () => {
    it("should give extraOptions priority over mountOptions for managed plugins", () => {
      const overrides = {
        plugins: { pinia: { stubActions: false } },
      };
      const extra = {
        plugins: {
          pinia: { stubActions: true },
        },
      };

      const result = run(presets, {}, overrides, extra);

      const piniaConfig = result.plugins.pinia as RuntimePluginConfig;

      // extraOptions overrides the value from mountOptions
      expect(piniaConfig.stubActions).toBe(true);
    });

    it("should NOT affect existing options when extraOptions provides an empty object (Noop behavior)", () => {
      const overrides = {
        plugins: {
          pinia: {
            initialState: { user: { id: 1 } },
            stubActions: true,
          },
        },
      };
      // Passing an empty object—this shouldn't change anything
      const extra = { plugins: { pinia: {} } };

      const result = run(presets, {}, overrides, extra);

      const piniaConfig = result.plugins.pinia as RuntimePluginConfig;

      // The data from `mountOptions` must remain unchanged
      expect(piniaConfig.initialState).toEqual({
        user: { id: 1 },
      });
      expect(piniaConfig.stubActions).toBe(true);
    });

    it("should enable a disabled plugin if extraOptions contains a configuration object", () => {
      const overrides = { plugins: { router: false } };
      const extra = { plugins: { router: { routes: [] } } };

      const result = run(presets, {}, overrides, extra);

      const routerConfig = result.plugins.router as RuntimePluginConfig;

      // extraOptions forces the feature to be enabled, even if the defaultMountOptions or mountOptions returns false
      expect(routerConfig).not.toBe(false);
      expect(routerConfig.routes).toEqual([]);
    });
  });

  describe("Plugin Configuration Overrides (Mount vs Extra)", () => {
    it("should act as a RESET when mountOptions.plugins provides an empty object for a plugin", () => {
      const defaults = {
        plugins: {
          pinia: { stubActions: true, initialState: { keyA: 1 } },
        },
      };
      // The test passes an empty object—this COMPLETELY replaces the object from the database in `withPluginsBase`
      const overrides = {
        plugins: { pinia: {} },
      };

      const result = run(presets, defaults, overrides);

      const piniaConfig = result.plugins.pinia as RuntimePluginConfig;

      // All specific default settings have been cleared (replaced with {}),
      // Only framework's global defaults remain (pluginDefaultsState.pinia)
      expect(piniaConfig.stubActions).toBe(false);
      expect(piniaConfig.initialState).toEqual({});
    });

    it("should act as a NOOP when mountOptions.plugins provides an empty object", () => {
      const defaults = {
        plugins: {
          pinia: { stubActions: true, initialState: { keyA: 1 } },
        },
      };
      // The test passes an empty object—this COMPLETELY replaces the object from the database in `withPluginsBase`
      const overrides = {
        plugins: {},
      };

      const result = run(presets, defaults, overrides);

      const piniaConfig = result.plugins.pinia as RuntimePluginConfig;

      // All specific default settings remain unchanged
      expect(piniaConfig.stubActions).toBe(true);
      expect(piniaConfig.initialState.keyA).toBe(1);
    });

    it("should act as a PARTIAL OVERLAY when extraOptions provides specific keys", () => {
      const defaults = {
        plugins: {
          pinia: { stubActions: true, initialState: { keyA: 1 } },
        },
      };
      // Change only one key in extraOptions
      const extra = {
        plugins: {
          pinia: { stubActions: false },
        },
      };

      const result = run(presets, defaults, {}, extra);

      const piniaConfig = result.plugins.pinia as RuntimePluginConfig;

      // stubActions has changed, but the default initialState remains the same
      expect(piniaConfig.stubActions).toBe(false);
      expect(piniaConfig.initialState).toEqual({ keyA: 1 });
    });
  });

  describe("Option: skipDefaultOptions", () => {
    const BASE_DEFAULTS = {
      shallow: true,
      global: { stubs: { BaseButton: true } },
      plugins: { pinia: { stubActions: true } },
    };

    it("should ignore ALL default options when skipDefaultOptions is true", () => {
      const extra = { skipDefaultOptions: true };
      const overrides = {
        global: { stubs: { MyIcon: true } },
        plugins: { pinia: { initialState: { user: {} } } },
      };

      const result = run(presets, BASE_DEFAULTS, overrides, extra);

      // 1. Checking flat mount options
      // `shallow: true` from the basic options should be missing
      expect(result.mountOptions.shallow).toBeUndefined();
      expect(Object.keys(result.mountOptions)).toHaveLength(0);

      // 2. Verifying global
      // The BaseButton stub should be absent
      expect(result.global.stubs).toEqual({ MyIcon: true });

      const stubs = result.global.stubs as Record<string, any>;
      expect(stubs.BaseButton).toBeUndefined();

      // 3. Verifying plugins
      const piniaConfig = result.plugins.pinia as RuntimePluginConfig;

      // `stubActions: true` from the basic options should be missing
      expect(piniaConfig.initialState).toEqual({ user: {} });
      expect(piniaConfig.stubActions).toBe(false); // Returned to the framework's default settings
    });

    it("should result in empty configurations if skipDefaultOptions is true and mountOptions are empty", () => {
      const extra = { skipDefaultOptions: true };

      const result = run(presets, BASE_DEFAULTS, {}, extra);

      // All sections must be empty (except for the default values of the plugins themselves in the final object)
      expect(result.mountOptions).toEqual({});
      expect(result.global).toEqual({});

      // For plugins: since the basic options have been omitted, only the defaults from manifest remain
      // (for example, false for router)
      expect(result.plugins.router).toBe(false);
    });
  });

  describe("Pipeline: Presets merging", () => {
    /** @type TestFrameworkPresets */
    const defaultPresets = {
      default: {
        manifest: [
          { module: piniaPlugin, enabled: true },
          { module: i18nPlugin, enabled: true },
          { module: routerPlugin, enabled: false },
        ],
        defaults: {
          i18n: { locale: "en", legacy: false },
          pinia: { stubActions: false },
          router: { routes: [{ path: "/", component: {} }] },
        },
      },
      custom: {
        manifest: [{ module: i18nPlugin, enabled: true }],
        defaults: {
          i18n: { locale: "fr" },
        },
      },
    };

    it("should use options from default preset when plugin config is missing", () => {
      const result = run(defaultPresets);

      expect(result.plugins.i18n).toEqual(defaultPresets.default.defaults.i18n);
      expect(result.plugins.pinia).toEqual(defaultPresets.default.defaults.pinia);
    });

    it("should use options from default preset when plugin config is an empty object", () => {
      const mountOptions = {
        plugins: {
          router: {}, // An empty object was passed
        },
      };
      const result = run(defaultPresets, {}, mountOptions);

      // It should be pulled up from the preset
      expect(result.plugins.router).toEqual(defaultPresets.default.defaults.router);
    });

    it("should fill missing keys from preset when user provides partial config", () => {
      const mountOptions = {
        plugins: {
          i18n: { locale: "ua" }, // Overriding only one field
        },
      };
      const result = run(defaultPresets, {}, mountOptions);

      expect(result.plugins.i18n).toEqual({
        legacy: false, // From the preset
        locale: "ua", // From mountOptions (priority)
      });
    });

    it("should switch to specific preset via extraOptions", () => {
      const extraOptions = { preset: "custom" };
      const result = run(defaultPresets, {}, {}, extraOptions);

      const i18nConfig = result.plugins.i18n as RuntimePluginConfig;
      expect(i18nConfig.locale).toBe("fr");
    });

    it("should throw error when requested preset does not exist", () => {
      const extraOptions = { preset: "non-existent" };

      expect(() => {
        run(defaultPresets, {}, {}, extraOptions);
      }).toThrow('[withPreset] Requested preset "non-existent" not found');
    });

    it("should throw when a plugin is configured in extraOptions but no preset supports it", () => {
      expect(() => {
        run(
          {},
          {},
          {},
          {
            plugins: {
              i18n: {},
            },
          },
        );
      }).toThrow(/Plugin "i18n".*not supported by the active preset/);
    });

    it("should NOT re-enable plugin when it is explicitly disabled by user even if preset has data", () => {
      const mountOptions = {
        plugins: {
          i18n: false, // Explicit user deactivation
        },
      };
      const result = run(defaultPresets, {}, mountOptions);

      // The preset should not “activate” the plugin if the user has set it to false
      expect(result.plugins.i18n).toBe(false);
    });

    it("should include all plugins from default manifest when no preset is specified", () => {
      const result = run(defaultPresets);

      // All keys from the ‘default’ preset's manifest must be present
      const expectedKeys = defaultPresets.default.manifest.map((mod) => mod.module.getName());

      expect(Object.keys(result.plugins)).toEqual(expect.arrayContaining(expectedKeys));
      expect(Object.keys(result.plugins)).toHaveLength(expectedKeys.length);
    });

    it("should include only plugins from the specific manifest when custom preset is selected", () => {
      const extraOptions = { preset: "custom" };
      const result = run(defaultPresets, {}, {}, extraOptions);

      // In the ‘custom’ preset, only i18n
      const expectedKeys = defaultPresets.custom.manifest.map((mod) => mod.module.getName());

      expect(Object.keys(result.plugins)).toEqual(expectedKeys);
      expect(result.plugins).toHaveProperty("i18n");
      expect(result.plugins).not.toHaveProperty("pinia");
      expect(result.plugins).not.toHaveProperty("router");
    });
  });
});
