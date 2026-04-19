import {
  mount as originalMount,
  shallowMount as originalShallowMount,
} from "@vue/test-utils";
import { captureInstance } from "../utils/captureInstance";
import { createI18nPlugin as originalCreateI18nPlugin } from "@testforge/vue-test-plugin-i18n/src/createI18nPlugin.js";
import { createPiniaPlugin as originalCreatePiniaPlugin } from "@testforge/vue-test-plugin-pinia/src/createPiniaPlugin.js";
import { createRouterPlugin as originalCreateRouterPlugin } from "@testforge/vue-test-plugin-router/src/createRouterPlugin.js";

describe("testComponentFactory Integration", () => {
  const MockComponent = { name: "MockComponent", render: () => null };

  let mockMount;
  let mockShallowMount;

  let mockCreateI18nPlugin;
  let mockCreatePiniaPlugin;
  let mockCreateRouterPlugin;

  let testFactory;

  const setupPluginMocks = () => {
    const mockI18n = jest.fn();
    const mockPinia = jest.fn();
    const mockRouter = jest.fn();

    mockCreateI18nPlugin.mockReturnValue(mockI18n);
    mockCreatePiniaPlugin.mockReturnValue(mockPinia);
    mockCreateRouterPlugin.mockReturnValue(mockRouter);

    return { mockI18n, mockPinia, mockRouter };
  };

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    mockCreateI18nPlugin = jest.fn(originalCreateI18nPlugin);
    mockCreatePiniaPlugin = jest.fn(originalCreatePiniaPlugin);
    mockCreateRouterPlugin = jest.fn(originalCreateRouterPlugin);

    jest.doMock(
      "@testforge/vue-test-plugin-i18n/src/createI18nPlugin.js",
      () => ({
        createI18nPlugin: mockCreateI18nPlugin,
      }),
    );
    jest.doMock(
      "@testforge/vue-test-plugin-pinia/src/createPiniaPlugin.js",
      () => ({
        createPiniaPlugin: mockCreatePiniaPlugin,
      }),
    );
    jest.doMock(
      "@testforge/vue-test-plugin-router/src/createRouterPlugin.js",
      () => ({
        createRouterPlugin: mockCreateRouterPlugin,
      }),
    );

    mockMount = jest.fn(originalMount);
    mockShallowMount = jest.fn(originalShallowMount);

    jest.doMock("@vue/test-utils", () => ({
      mount: mockMount,
      shallowMount: mockShallowMount,
    }));

    const { createTestFramework } = require("../index.js");
    const { presets } = require("./utils/mockPresets.js");
    const { testComponentFactory } = createTestFramework({
      presets,
    });
    testFactory = testComponentFactory;
  });

  describe("VTU Mount Functions", () => {
    it("should use shallowMount by default when no useShallow option is specified", () => {
      const factory = testFactory(MockComponent, {
        title: "Base",
      });

      factory({ title: "Override" });

      expect(mockShallowMount).toHaveBeenCalledTimes(1);
      expect(mockShallowMount).toHaveBeenCalledWith(
        MockComponent,
        expect.objectContaining({
          props: { title: "Override" },
          global: expect.any(Object),
        }),
      );

      expect(mockMount).toHaveBeenCalledTimes(0);
    });

    it("should switch to mount when useShallow is false", () => {
      const factory = testFactory(MockComponent);
      factory({}, { useShallow: false });

      expect(mockMount).toHaveBeenCalledTimes(1);
      expect(mockShallowMount).not.toHaveBeenCalled();
    });
  });

  describe("Props Priority", () => {
    describe("Specific Test Level", () => {
      it("should prioritize direct props over mountOptions.props when keys conflict", () => {
        const factory = testFactory(MockComponent);

        // The props vs. mountOptions.props argument
        factory({ id: 1 }, { props: { id: 2 } });

        expect(mockShallowMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            props: { id: 1 }, // The direct argument won
          }),
        );
      });

      it("should shallow-merge direct props with mountOptions.props when no conflicts", () => {
        const factory = testFactory(MockComponent);

        // The props vs. mountOptions.props argument
        factory({ id: 1 }, { props: { newProps: 2 } });

        expect(mockShallowMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            props: { id: 1, newProps: 2 },
          }),
        );
      });

      it("should use only mountOptions.props when direct props are not provided", () => {
        const factory = testFactory(MockComponent);

        factory({}, { props: { newProps: 2 } });

        expect(mockShallowMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            props: { newProps: 2 },
          }),
        );
      });
    });

    describe("Test Suite Level", () => {
      it("should prioritize direct defaultProps over defaultMountOptions.props when keys conflict", () => {
        // The defaultProps vs. defaultMountOptions.props argument
        const factory = testFactory(
          MockComponent,
          { id: 1 },
          { props: { id: 2 } },
        );

        factory();

        expect(mockShallowMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            props: { id: 1 }, // The direct argument won
          }),
        );
      });

      it("should shallow-merge direct props with mountOptions.props when no conflicts", () => {
        // The defaultProps vs. defaultMountOptions.props argument
        const factory = testFactory(
          MockComponent,
          { id: 1 },
          { props: { newProps: 2 } },
        );

        factory();

        expect(mockShallowMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            props: { id: 1, newProps: 2 },
          }),
        );
      });

      it("should use only mountOptions.props when direct props are not provided", () => {
        const factory = testFactory(
          MockComponent,
          {},
          { props: { newProps: 2 } },
        );

        factory();

        expect(mockShallowMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            props: { newProps: 2 },
          }),
        );
      });
    });

    describe("Both Levels", () => {
      describe("when skipDefaultProps = false (default behavior)", () => {
        // All 4 sources are active
        it("should merge all four sources with direct props having highest priority", () => {
          const factory = testFactory(
            MockComponent,
            { defA: 1, defB: 10 }, // defaultProps
            { props: { defA: 2, defC: 30 } }, // defaultMountOptions.props
          );

          factory(
            { defB: 11, userDirect: 100 }, // props (direct argument)
            { props: { defC: 31, userMount: 200 } }, // mountOptions.props
          );

          expect(mockShallowMount).toHaveBeenCalledWith(
            MockComponent,
            expect.objectContaining({
              props: {
                defA: 1, // defaultProps takes precedence over defaultMountOptions
                defB: 11, // direct props take precedence over defaultProps
                defC: 31, // mountOptions.props take precedence over defaultMountOptions
                userDirect: 100, // direct props
                userMount: 200, // mountOptions.props
              },
            }),
          );
        });

        it("should fall back to defaultMountOptions.props when direct props & mountOptions.props & defaultProps are empty", () => {
          const factory = testFactory(
            MockComponent,
            {},
            { props: { fallback: "from-default-mount" } },
          );

          factory({}, {});

          expect(mockShallowMount).toHaveBeenCalledWith(
            MockComponent,
            expect.objectContaining({
              props: { fallback: "from-default-mount" },
            }),
          );
        });

        it("should fall back to defaultProps when defaultMountOptions.props is empty", () => {
          const factory = testFactory(
            MockComponent,
            { base: "default-props" },
            {},
          );

          factory({}, {});

          expect(mockShallowMount).toHaveBeenCalledWith(
            MockComponent,
            expect.objectContaining({
              props: { base: "default-props" },
            }),
          );
        });
      });

      describe("when skipDefaultProps = true", () => {
        it("should ignore defaultProps and defaultMountOptions but still merge the other two sources", () => {
          const factory = testFactory(
            MockComponent,
            { ignored: "default-props" },
            { props: { ignoredBase: "default-mount" } },
          );

          factory(
            { userDirect: 100 },
            {
              props: { userMount: 200 },
            },
            {},
            { skipDefaultProps: true },
          );

          expect(mockShallowMount).toHaveBeenCalledWith(
            MockComponent,
            expect.objectContaining({
              props: {
                userDirect: 100, // direct props
                userMount: 200, // mountOptions.props
              },
            }),
          );
        });

        it("should prioritize direct props over mountOptions.props", () => {
          const factory = testFactory(
            MockComponent,
            {},
            {
              props: { key: "default-mount-value" },
            },
          );

          factory(
            { key: "direct-value" },
            {
              props: { key: "mount-options-value" },
            },
            {},
            { skipDefaultProps: true },
          );

          expect(mockShallowMount).toHaveBeenCalledWith(
            MockComponent,
            expect.objectContaining({
              props: { key: "direct-value" },
            }),
          );
        });
      });
    });
  });

  describe("Slots Priority", () => {
    describe("Specific Test Level", () => {
      it("should prioritize direct slots over mountOptions.slots when keys conflict", () => {
        const factory = testFactory(MockComponent);

        // Direct slots vs. mountOptions.slots argument
        factory(
          {},
          { slots: { default: "options slot" } },
          { default: "direct slot" },
        );

        expect(mockShallowMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            slots: { default: "direct slot" }, // The direct argument won
          }),
        );
      });

      it("should shallow-merge direct slots with mountOptions.slots when no conflicts", () => {
        const factory = testFactory(MockComponent);

        // The slots vs. mountOptions.slots argument
        factory(
          {},
          { slots: { footer: "footer slot" } },
          { header: "header slot" },
        );

        expect(mockShallowMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            slots: { header: "header slot", footer: "footer slot" },
          }),
        );
      });

      it("should use only mountOptions.slots when direct slots are not provided", () => {
        const factory = testFactory(MockComponent);

        factory({}, { slots: { default: "options slot" } });

        expect(mockShallowMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            slots: { default: "options slot" },
          }),
        );
      });
    });

    describe("Test Suite Level", () => {
      it("should prioritize direct defaultSlots over defaultMountOptions.slots when keys conflict", () => {
        // The defaultSlots vs. defaultMountOptions.slots argument
        const factory = testFactory(
          MockComponent,
          {},
          { slots: { default: "options slot" } },
          { default: "direct slot" },
        );

        factory();

        expect(mockShallowMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            slots: { default: "direct slot" }, // The direct argument won
          }),
        );
      });

      it("should shallow-merge direct defaultSlots with defaultMountOptions.slots when no conflicts", () => {
        // The defaultSlots vs. defaultMountOptions.slots argument
        const factory = testFactory(
          MockComponent,
          {},
          { slots: { footer: "footer slot" } },
          { header: "header slot" },
        );

        factory();

        expect(mockShallowMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            slots: { header: "header slot", footer: "footer slot" },
          }),
        );
      });

      it("should use only defaultMountOptions.slots when direct defaultSlots are not provided", () => {
        const factory = testFactory(
          MockComponent,
          {},
          { slots: { default: "options slot" } },
        );

        factory();

        expect(mockShallowMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            slots: { default: "options slot" },
          }),
        );
      });
    });

    describe("Both Levels", () => {
      describe("when skipDefaultSlots = false (default behavior)", () => {
        it("should merge all four sources with direct slots having highest priority", () => {
          const factory = testFactory(
            MockComponent,
            {},
            { slots: { slotA: "A1", slotC: "C1" } }, // defaultMountOptions.slots
            { slotA: "A2", slotB: "B2" }, // defaultSlots
          );

          factory(
            {},
            { slots: { slotC: "C3", userMount: "user mount" } }, // mountOptions.props
            { slotB: "B4", userDirect: "user direct" }, // slots (direct argument)
          );

          expect(mockShallowMount).toHaveBeenCalledWith(
            MockComponent,
            expect.objectContaining({
              slots: {
                slotA: "A2", // defaultSlots takes precedence over defaultMountOptions
                slotB: "B4", // direct slots take precedence over defaultSlots
                slotC: "C3", // mountOptions.slots take precedence over defaultMountOptions
                userDirect: "user direct", // direct slots
                userMount: "user mount", // mountOptions.slots
              },
            }),
          );
        });

        it("should fall back to defaultMountOptions.slots when direct slots & mountOptions.slots & defaultSlots are empty", () => {
          const factory = testFactory(
            MockComponent,
            {},
            { slots: { fallback: "from-default-mount" } },
          );

          factory({}, {});

          expect(mockShallowMount).toHaveBeenCalledWith(
            MockComponent,
            expect.objectContaining({
              slots: { fallback: "from-default-mount" },
            }),
          );
        });

        it("should fall back to defaultSlots when defaultMountOptions.slots is empty", () => {
          const factory = testFactory(
            MockComponent,
            {},
            {},
            { base: "default-slots" },
          );

          factory();

          expect(mockShallowMount).toHaveBeenCalledWith(
            MockComponent,
            expect.objectContaining({
              slots: { base: "default-slots" },
            }),
          );
        });
      });

      describe("when skipDefaultSlots = true", () => {
        it("should ignore defaultSlots and defaultMountOptions but still merge the other two sources", () => {
          const factory = testFactory(
            MockComponent,
            {},
            { props: { ignoredBase: "default-mount" } },
            { ignored: "default-slots" },
          );

          factory(
            {},
            {
              slots: { userMount: "user-mount" },
            },
            { userDirect: "user-direct" },
            { skipDefaultSlots: true },
          );

          expect(mockShallowMount).toHaveBeenCalledWith(
            MockComponent,
            expect.objectContaining({
              slots: {
                userDirect: "user-direct", // direct slots
                userMount: "user-mount", // mountOptions.slots
              },
            }),
          );
        });

        it("should prioritize direct slots over mountOptions.slots", () => {
          const factory = testFactory(
            MockComponent,
            {},
            {
              slots: { default: "default-mount-value" },
            },
          );

          factory(
            {},
            {
              slots: { default: "mount-options-value" },
            },
            { default: "direct-value" },
            { skipDefaultSlots: true },
          );

          expect(mockShallowMount).toHaveBeenCalledWith(
            MockComponent,
            expect.objectContaining({
              slots: { default: "direct-value" },
            }),
          );
        });
      });
    });
  });

  describe("Global Options Merging", () => {
    it("should use only defaultMountOptions when specific test options are missing", () => {
      const defaults = { global: { stubs: { DefaultBtn: true } } };
      const factory = testFactory(MockComponent, {}, defaults);

      factory();

      const [, options] = mockShallowMount.mock.calls[0];
      expect(options.global.stubs).toEqual({ DefaultBtn: true });
    });

    it("should use only mountOptions when defaultMountOptions are missing", () => {
      const factory = testFactory(MockComponent, {}, {});

      factory({}, { global: { mocks: { $t: () => "" } } });

      const [, options] = mockShallowMount.mock.calls[0];
      expect(options.global.mocks).toHaveProperty("$t");
    });

    it("should deeply merge nested objects like stubs and mocks", () => {
      const defaults = {
        global: {
          stubs: { BaseBtn: true },
          mocks: { $route: { path: "/" } },
        },
      };
      const factory = testFactory(MockComponent, {}, defaults);

      factory(
        {},
        {
          global: {
            stubs: { Icon: true },
            mocks: { $store: {} },
          },
        },
      );

      const [, options] = mockShallowMount.mock.calls[0];
      expect(options.global.stubs).toEqual({ BaseBtn: true, Icon: true });
      expect(options.global.mocks).toEqual({
        $route: { path: "/" },
        $store: {},
      });
    });

    it("should prioritize specific mountOptions over defaultMountOptions for the same key", () => {
      const defaults = { global: { provide: { theme: "light" } } };
      const factory = testFactory(MockComponent, {}, defaults);

      factory({}, { global: { provide: { theme: "dark" } } });

      const [, options] = mockShallowMount.mock.calls[0];
      expect(options.global.provide.theme).toBe("dark");
    });
  });

  describe("Plugin Integration", () => {
    it("should create i18n and pinia plugins by default when no plugin options are provided", () => {
      const factory = testFactory(MockComponent);
      factory();

      expect(mockCreateI18nPlugin).toHaveBeenCalledTimes(1);
      expect(mockCreatePiniaPlugin).toHaveBeenCalledTimes(1);
      expect(mockCreateRouterPlugin).toHaveBeenCalledTimes(0);
    });

    it("should add default i18n and pinia plugins to global.plugins when no plugin options are provided", () => {
      const { mockI18n, mockPinia } = setupPluginMocks();
      const factory = testFactory(MockComponent);
      factory();

      // Verify that the i18n has been created with the default settings (en)
      expect(mockCreateI18nPlugin).toHaveBeenCalledWith(
        expect.objectContaining({
          locale: "en",
        }),
      );

      // Verify that the factory's result has been added to the shallowMount
      const [, options] = mockShallowMount.mock.calls[0];
      expect(options.global.plugins).toContain(mockI18n);
      expect(options.global.plugins).toContain(mockPinia);
      expect(options.global.plugins).toHaveLength(2);
    });

    it("should merge default plugins with third-party plugins when mountOptions.global.plugins is set", () => {
      const { mockI18n, mockPinia } = setupPluginMocks();
      const mockVfm = jest.fn();

      const factory = testFactory(MockComponent);

      factory({}, { global: { plugins: [mockVfm] } });

      // Verify that the i18n has been created with the default settings (en)
      expect(mockCreateI18nPlugin).toHaveBeenCalledWith(
        expect.objectContaining({
          locale: "en",
        }),
      );

      // Verify that the factory's result has been added to the shallowMount
      const [, options] = mockShallowMount.mock.calls[0];
      expect(options.global.plugins).toContain(mockI18n);
      expect(options.global.plugins).toContain(mockPinia);
      expect(options.global.plugins).toContain(mockVfm);
      expect(options.global.plugins).toHaveLength(3);
    });

    it("should skip managed plugins when skipManagedPlugins options is set", () => {
      const mockVfm = jest.fn();

      const factory = testFactory(MockComponent);

      factory(
        {},
        {
          skipManagedPlugins: true,
          global: { plugins: [mockVfm] },
          plugins: { i18n: { locale: "en", messages: {} } },
        },
      );

      // Verify that the i18n has not been created
      expect(mockCreateI18nPlugin).toHaveBeenCalledTimes(0);
      expect(mockCreatePiniaPlugin).toHaveBeenCalledTimes(0);

      // Verify that the factory's result has been added to the shallowMount
      const [, options] = mockShallowMount.mock.calls[0];
      expect(options.global.plugins).toContain(mockVfm);
      expect(options.global.plugins).toHaveLength(1);
    });

    it("should merge base and extra i18n options with extra taking precedence when both are provided", () => {
      const baseOptions = { plugins: { i18n: { locale: "en" } } };
      const extraOptions = { i18n: { locale: "uk" } };

      const factory = testFactory(MockComponent, {}, baseOptions);
      factory({}, {}, {}, extraOptions);

      expect(mockCreateI18nPlugin).toHaveBeenCalledWith(
        expect.objectContaining({
          locale: "uk",
          legacy: false,
        }),
      );
    });

    describe("Enable router when it is disabled by default", () => {
      it("should enable router via defaultMountOptions", () => {
        const { mockRouter } = setupPluginMocks();
        const factory = testFactory(
          MockComponent,
          {},
          { plugins: { router: {} } },
        );
        factory();

        expect(mockCreateRouterPlugin).toHaveBeenCalledWith(
          expect.objectContaining({
            routes: expect.any(Array),
            history: expect.any(Object),
          }),
        );

        // Verify that the factory's result has been added to the shallowMount
        const [, options] = mockShallowMount.mock.calls[0];
        expect(options.global.plugins).toContain(mockRouter);
      });

      it("should enable router via mountOptions", () => {
        const { mockRouter } = setupPluginMocks();
        const factory = testFactory(MockComponent);
        factory({}, { plugins: { router: {} } });

        expect(mockCreateRouterPlugin).toHaveBeenCalledWith(
          expect.objectContaining({
            routes: expect.any(Array),
            history: expect.any(Object),
          }),
        );

        // Verify that the factory's result has been added to the shallowMount
        const [, options] = mockShallowMount.mock.calls[0];
        expect(options.global.plugins).toContain(mockRouter);
      });

      it("should enable router via extraOptions", () => {
        const { mockRouter } = setupPluginMocks();
        const factory = testFactory(MockComponent);

        // Enable the router using the 4th argument
        const customRoutes = [{ path: "/", component: { render: () => null } }];
        factory({}, {}, {}, { router: { routes: customRoutes } });

        expect(mockCreateRouterPlugin).toHaveBeenCalledWith(
          expect.objectContaining({
            routes: customRoutes,
            history: expect.any(Object),
          }),
        );

        // Verify that the factory's result has been added to the shallowMount
        const [, options] = mockShallowMount.mock.calls[0];
        expect(options.global.plugins).toContain(mockRouter);
      });
    });

    it("should merge i18n settings with provided options taking precedence over defaults", () => {
      const baseOptions = {
        plugins: { i18n: { locale: "en", legacy: true } },
      };

      const factory = testFactory(MockComponent, {}, baseOptions);
      factory();

      expect(mockCreateI18nPlugin).toHaveBeenCalledWith(
        expect.objectContaining({
          // provided i18n settings
          locale: "en",
          legacy: true,
          // default i18n settings
          fallbackLocale: "en",
          messages: {},
          fallbackWarn: false,
          missingWarn: false,
        }),
      );
    });

    it("should not create i18n plugin when its option is explicitly set to false", () => {
      const { mockI18n } = setupPluginMocks();
      const factory = testFactory(
        MockComponent,
        {},
        { plugins: { i18n: false } },
      );
      factory();

      expect(mockCreateI18nPlugin).toHaveBeenCalledTimes(0);

      const [, options] = mockShallowMount.mock.calls[0];
      expect(options.global.plugins).not.toContain(mockI18n);
      expect(options.global.plugins).toHaveLength(1);
    });

    describe("Expose Instance", () => {
      it("should provide access to plugin instances via expose callback", () => {
        let i18n;
        let pinia;
        let router;
        const BASE_MOUNT_OPTIONS = {
          plugins: {
            i18n: {
              locale: "en",
              messages: {},
              expose: (instance) => {
                i18n = instance;
              },
            },
            pinia: {
              expose: (instance) => {
                pinia = instance;
              },
            },
            router: {
              routes: [
                {
                  path: "/",
                  component: { render: () => null },
                },
              ],
              expose: (instance) => {
                router = instance;
              },
            },
          },
        };

        const factory = testFactory(MockComponent, {}, BASE_MOUNT_OPTIONS);

        factory();

        expect(mockCreateI18nPlugin.mock.results[0].value).toBe(i18n);
        expect(mockCreatePiniaPlugin.mock.results[0].value).toBe(pinia);
        expect(mockCreateRouterPlugin.mock.results[0].value).toBe(router);
      });

      it("should capture plugin instances using captureInstance helper", () => {
        const i18nCapture = captureInstance();
        const piniaCapture = captureInstance();
        const routerCapture = captureInstance();
        const BASE_MOUNT_OPTIONS = {
          plugins: {
            i18n: {
              locale: "en",
              messages: {},
              ...i18nCapture,
            },
            pinia: { ...piniaCapture },
            router: {
              routes: [
                {
                  path: "/",
                  component: { render: () => null },
                },
              ],
              ...routerCapture,
            },
          },
        };

        const factory = testFactory(MockComponent, {}, BASE_MOUNT_OPTIONS);

        factory();

        expect(mockCreateI18nPlugin.mock.results[0].value).toBe(
          i18nCapture.instance,
        );
        expect(mockCreatePiniaPlugin.mock.results[0].value).toBe(
          piniaCapture.instance,
        );
        expect(mockCreateRouterPlugin.mock.results[0].value).toBe(
          routerCapture.instance,
        );
      });
    });

    describe("Using Presets", () => {
      it("should add default i18n and pinia plugins to `global.plugins` when using `lightweightPreset` preset", () => {
        const { mockI18n, mockPinia } = setupPluginMocks();
        const factory = testFactory(MockComponent);

        factory({}, {}, {}, { preset: "lightweightPreset" });

        // Verify that the i18n has been created with the default settings (en)
        expect(mockCreateI18nPlugin).toHaveBeenCalledWith(
          expect.objectContaining({
            locale: "en",
          }),
        );

        // Verify that the factory's result has been added to the shallowMount
        const [, options] = mockShallowMount.mock.calls[0];
        expect(options.global.plugins).toContain(mockI18n);
        expect(options.global.plugins).toContain(mockPinia);
        expect(options.global.plugins).toHaveLength(2);
      });

      it("should add i18n to `global.plugins` when using `i18nPreset` preset", () => {
        const { mockI18n, mockPinia } = setupPluginMocks();
        const factory = testFactory(MockComponent);

        factory({}, {}, {}, { preset: "i18nPreset" });

        expect(mockCreatePiniaPlugin).toHaveBeenCalledTimes(0);
        expect(mockCreateI18nPlugin).toHaveBeenCalledWith(
          expect.objectContaining({
            locale: "en",
          }),
        );

        // Verify that the factory's result has been added to the shallowMount
        const [, options] = mockShallowMount.mock.calls[0];
        expect(options.global.plugins).toContain(mockI18n);
        expect(options.global.plugins).not.toContain(mockPinia);
        expect(options.global.plugins).toHaveLength(1);
      });

      it("should override preset default options with provided plugin options", () => {
        const { mockI18n } = setupPluginMocks();
        const factory = testFactory(MockComponent);

        // Use i18nPreset, but change the language to 'fr'
        factory(
          {},
          { plugins: { i18n: { locale: "fr" } } },
          {},
          { preset: "i18nPreset" },
        );

        expect(mockCreatePiniaPlugin).toHaveBeenCalledTimes(0);
        expect(mockCreateI18nPlugin).toHaveBeenCalledWith(
          expect.objectContaining({
            locale: "fr",
          }),
        );

        // Verify that the factory's result has been added to the shallowMount
        const [, options] = mockShallowMount.mock.calls[0];
        expect(options.global.plugins).toContain(mockI18n);
        expect(options.global.plugins).toHaveLength(1);
      });

      it("should skip plugin initialization when it is disabled in the preset manifest", () => {
        const factory = testFactory(MockComponent);

        factory({}, {}, {}, { preset: "i18nDisabledPreset" });

        expect(mockCreateI18nPlugin).toHaveBeenCalledTimes(0);

        const [, options] = mockShallowMount.mock.calls[0];
        // No plugins have been created
        expect(options.global.plugins || []).toHaveLength(0);
      });

      it("should override preset manifest and skip plugin when options are set to false", () => {
        const factory = testFactory(MockComponent);

        factory({}, { plugins: { i18n: false } }, {}, { preset: "i18nPreset" });

        expect(mockCreateI18nPlugin).toHaveBeenCalledTimes(0);

        // Verify that the factory's result has been added to the shallowMount
        const [, options] = mockShallowMount.mock.calls[0];
        // No plugins have been created
        expect(options.global.plugins || []).toHaveLength(0);
      });

      describe("Plugin Options Validation Errors", () => {
        const invalidValues = [
          { value: 123, type: "number" },
          { value: "string", type: "string" },
          { value: null, type: "object (null)" }, // Special case: null
        ];

        invalidValues.forEach(({ value, type }) => {
          it(`should throw an error when "${type}" is passed to plugin options`, () => {
            const factory = testFactory(MockComponent);
            expect(() => {
              factory(
                {},
                { plugins: { i18n: value } },
                {},
                { preset: "i18nPreset" },
              );
            }).toThrow(
              new RegExp(
                `Expected Object or Boolean \\(false\\), but received ${type
                  .replace("(", "\\(")
                  .replace(")", "\\)")}`,
              ),
            );
          });
        });

        it("should NOT throw an error when `false` is passed", () => {
          const factory = testFactory(MockComponent);
          expect(() => {
            factory(
              {},
              { plugins: { i18n: false } },
              {},
              { preset: "i18nPreset" },
            );
          }).not.toThrow();
        });
      });
    });
  });
});
