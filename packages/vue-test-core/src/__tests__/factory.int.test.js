import { ERROR_PREFIX } from "../constants/constants.js";

const runner = typeof vi !== "undefined" ? vi : jest;

const createFactory = async () => {
  const { createTestFramework } = await import("../index");
  const { presets } = await import("./utils/presets/mockPresets.js");

  return createTestFramework({
    presets,
  }).testComponentFactory;
};

const createFactoryWithShallowDefault = async (shallowByDefault) => {
  const { createTestFramework } = await import("../index");
  const { presets } = await import("./utils/presets/mockPresets.js");

  return createTestFramework({
    presets,
    shallowByDefault,
  }).testComponentFactory;
};

describe("testComponentFactory Integration (Universal)", () => {
  const MockComponent = { name: "MockComponent", render: () => null };

  let mockMount;
  let mockShallowMount;
  let testComponentFactory;

  // References to mocked `create` functions to verify their calls
  const mockI18nCreate = runner.fn();
  const mockPiniaCreate = runner.fn();
  const mockRouterCreate = runner.fn();

  // References to instances that are “returned” by plugins
  const mockI18nInstance = {
    install: (app) => {
      app.config.globalProperties.$t = (key) => key;
    },
  };
  const mockPiniaInstance = {
    install: () => {},
  };
  const mockRouterInstance = {
    install: () => {},
  };

  beforeEach(async () => {
    runner.resetModules();
    runner.clearAllMocks();

    // Setting default return values
    mockI18nCreate.mockReturnValue(mockI18nInstance);
    mockPiniaCreate.mockReturnValue(mockPiniaInstance);
    mockRouterCreate.mockReturnValue(mockRouterInstance);

    // Mock the PUBLIC interfaces of the packages
    runner.doMock("@testforge/vue-test-plugin-i18n", () => ({
      i18nPlugin: {
        getName: () => "i18n",
        getDefinition: () => ({ create: mockI18nCreate }),
      },
    }));

    runner.doMock("@testforge/vue-test-plugin-pinia", () => ({
      piniaPlugin: {
        getName: () => "pinia",
        getDefinition: () => ({ create: mockPiniaCreate }),
      },
    }));

    runner.doMock("@testforge/vue-test-plugin-router", () => ({
      routerPlugin: {
        getName: () => "router",
        getDefinition: () => ({ create: mockRouterCreate }),
      },
    }));

    // Mock vue-test-utils
    mockMount = runner.fn().mockReturnValue({
      unmount: runner.fn(),
      vm: {},
      element: {},
    });

    mockShallowMount = runner.fn().mockReturnValue({
      unmount: runner.fn(),
      vm: {},
      element: {},
    });

    runner.doMock("@vue/test-utils", () => ({
      mount: mockMount,
      shallowMount: mockShallowMount, // mockShallowMount должен быть создан заранее через runner.fn()
    }));

    // Initializing the framework
    testComponentFactory = await createFactory();
  });

  describe("VTU Mount Functions", () => {
    describe("when shallowByDefault = true", () => {
      beforeEach(async () => {
        testComponentFactory = await createFactoryWithShallowDefault(true);
      });

      it("should use shallowMount when shallow option is not provided", () => {
        const factory = testComponentFactory(MockComponent);

        factory();

        expect(mockShallowMount).toHaveBeenCalledTimes(1);
        expect(mockMount).not.toHaveBeenCalled();
      });

      it("should use shallowMount when shallow is true", () => {
        const factory = testComponentFactory(MockComponent);

        factory({}, { shallow: true });

        expect(mockShallowMount).toHaveBeenCalledTimes(1);
        expect(mockMount).not.toHaveBeenCalled();
      });

      it("should use mount when shallow is false", () => {
        const factory = testComponentFactory(MockComponent);

        factory({}, { shallow: false });

        expect(mockMount).toHaveBeenCalledTimes(1);
        expect(mockShallowMount).not.toHaveBeenCalled();
      });
    });

    describe("when shallowByDefault = false", () => {
      beforeEach(async () => {
        testComponentFactory = await createFactoryWithShallowDefault(false);
      });

      it("should use mount when shallow option is not provided", () => {
        const factory = testComponentFactory(MockComponent);

        factory();

        expect(mockMount).toHaveBeenCalledTimes(1);
        expect(mockShallowMount).not.toHaveBeenCalled();
      });

      it("should use shallowMount when shallow is true", () => {
        const factory = testComponentFactory(MockComponent);

        factory({}, { shallow: true });

        expect(mockShallowMount).toHaveBeenCalledTimes(1);
        expect(mockMount).not.toHaveBeenCalled();
      });

      it("should use mount when shallow is false", () => {
        const factory = testComponentFactory(MockComponent);

        factory({}, { shallow: false });

        expect(mockMount).toHaveBeenCalledTimes(1);
        expect(mockShallowMount).not.toHaveBeenCalled();
      });
    });
  });

  describe("Props Priority", () => {
    describe("Specific Test Level", () => {
      it("should prioritize direct props over mountOptions.props when keys conflict", () => {
        const factory = testComponentFactory(MockComponent);

        // The props vs. mountOptions.props argument
        factory({ id: 1 }, { props: { id: 2 } });

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            props: { id: 1 }, // The direct argument won
          }),
        );
      });

      it("should shallow-merge direct props with mountOptions.props when no conflicts", () => {
        const factory = testComponentFactory(MockComponent);

        // The props vs. mountOptions.props argument
        factory({ id: 1 }, { props: { newProps: 2 } });

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            props: { id: 1, newProps: 2 },
          }),
        );
      });

      it("should use only mountOptions.props when direct props are not provided", () => {
        const factory = testComponentFactory(MockComponent);

        factory({}, { props: { newProps: 2 } });

        expect(mockMount).toHaveBeenCalledWith(
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
        const factory = testComponentFactory(MockComponent, { id: 1 }, { props: { id: 2 } });

        factory();

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            props: { id: 1 }, // The direct argument won
          }),
        );
      });

      it("should shallow-merge direct props with mountOptions.props when no conflicts", () => {
        // The defaultProps vs. defaultMountOptions.props argument
        const factory = testComponentFactory(MockComponent, { id: 1 }, { props: { newProps: 2 } });

        factory();

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            props: { id: 1, newProps: 2 },
          }),
        );
      });

      it("should use only mountOptions.props when direct props are not provided", () => {
        const factory = testComponentFactory(MockComponent, {}, { props: { newProps: 2 } });

        factory();

        expect(mockMount).toHaveBeenCalledWith(
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
          const factory = testComponentFactory(
            MockComponent,
            { defA: 1, defB: 10 }, // defaultProps
            { props: { defA: 2, defC: 30 } }, // defaultMountOptions.props
          );

          factory(
            { defB: 11, userDirect: 100 }, // props (direct argument)
            { props: { defC: 31, userMount: 200 } }, // mountOptions.props
          );

          expect(mockMount).toHaveBeenCalledWith(
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
          const factory = testComponentFactory(
            MockComponent,
            {},
            { props: { fallback: "from-default-mount" } },
          );

          factory({}, {});

          expect(mockMount).toHaveBeenCalledWith(
            MockComponent,
            expect.objectContaining({
              props: { fallback: "from-default-mount" },
            }),
          );
        });

        it("should fall back to defaultProps when defaultMountOptions.props is empty", () => {
          const factory = testComponentFactory(MockComponent, { base: "default-props" }, {});

          factory({}, {});

          expect(mockMount).toHaveBeenCalledWith(
            MockComponent,
            expect.objectContaining({
              props: { base: "default-props" },
            }),
          );
        });
      });

      describe("when skipDefaultProps = true", () => {
        it("should ignore defaultProps and defaultMountOptions but still merge the other two sources", () => {
          const factory = testComponentFactory(
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

          expect(mockMount).toHaveBeenCalledWith(
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
          const factory = testComponentFactory(
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

          expect(mockMount).toHaveBeenCalledWith(
            MockComponent,
            expect.objectContaining({
              props: { key: "direct-value" },
            }),
          );
        });
      });
    });

    describe("defaultMountOptions.props vs mountOptions.props", () => {
      it("should shallow-merge props between defaultMountOptions and mountOptions", () => {
        const factory = testComponentFactory(
          MockComponent,
          {},
          {
            props: {
              role: "button",
            },
          },
        );

        factory(
          {},
          {
            props: {
              id: "submit",
            },
          },
        );

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            props: {
              role: "button",
              id: "submit",
            },
          }),
        );
      });

      it("should prioritize mountOptions.props over defaultMountOptions.props when keys conflict", () => {
        const factory = testComponentFactory(
          MockComponent,
          {},
          {
            props: {
              id: 1,
              role: "button",
            },
          },
        );

        factory(
          {},
          {
            props: {
              id: 2,
            },
          },
        );

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            props: {
              id: 2,
              role: "button",
            },
          }),
        );
      });
    });
  });

  describe("Slots Priority", () => {
    describe("Specific Test Level", () => {
      it("should prioritize direct slots over mountOptions.slots when keys conflict", () => {
        const factory = testComponentFactory(MockComponent);

        // Direct slots vs. mountOptions.slots argument
        factory({}, { slots: { default: "options slot" } }, { default: "direct slot" });

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            slots: { default: "direct slot" }, // The direct argument won
          }),
        );
      });

      it("should shallow-merge direct slots with mountOptions.slots when no conflicts", () => {
        const factory = testComponentFactory(MockComponent);

        // The slots vs. mountOptions.slots argument
        factory({}, { slots: { footer: "footer slot" } }, { header: "header slot" });

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            slots: { header: "header slot", footer: "footer slot" },
          }),
        );
      });

      it("should use only mountOptions.slots when direct slots are not provided", () => {
        const factory = testComponentFactory(MockComponent);

        factory({}, { slots: { default: "options slot" } });

        expect(mockMount).toHaveBeenCalledWith(
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
        const factory = testComponentFactory(
          MockComponent,
          {},
          { slots: { default: "options slot" } },
          { default: "direct slot" },
        );

        factory();

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            slots: { default: "direct slot" }, // The direct argument won
          }),
        );
      });

      it("should shallow-merge direct defaultSlots with defaultMountOptions.slots when no conflicts", () => {
        // The defaultSlots vs. defaultMountOptions.slots argument
        const factory = testComponentFactory(
          MockComponent,
          {},
          { slots: { footer: "footer slot" } },
          { header: "header slot" },
        );

        factory();

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            slots: { header: "header slot", footer: "footer slot" },
          }),
        );
      });

      it("should use only defaultMountOptions.slots when direct defaultSlots are not provided", () => {
        const factory = testComponentFactory(
          MockComponent,
          {},
          { slots: { default: "options slot" } },
        );

        factory();

        expect(mockMount).toHaveBeenCalledWith(
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
          const factory = testComponentFactory(
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

          expect(mockMount).toHaveBeenCalledWith(
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
          const factory = testComponentFactory(
            MockComponent,
            {},
            { slots: { fallback: "from-default-mount" } },
          );

          factory({}, {});

          expect(mockMount).toHaveBeenCalledWith(
            MockComponent,
            expect.objectContaining({
              slots: { fallback: "from-default-mount" },
            }),
          );
        });

        it("should fall back to defaultSlots when defaultMountOptions.slots is empty", () => {
          const factory = testComponentFactory(MockComponent, {}, {}, { base: "default-slots" });

          factory();

          expect(mockMount).toHaveBeenCalledWith(
            MockComponent,
            expect.objectContaining({
              slots: { base: "default-slots" },
            }),
          );
        });
      });

      describe("when skipDefaultSlots = true", () => {
        it("should ignore defaultSlots and defaultMountOptions but still merge the other two sources", () => {
          const factory = testComponentFactory(
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

          expect(mockMount).toHaveBeenCalledWith(
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
          const factory = testComponentFactory(
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

          expect(mockMount).toHaveBeenCalledWith(
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
      const factory = testComponentFactory(MockComponent, {}, defaults);

      factory();

      const [, options] = mockMount.mock.calls[0];
      expect(options.global.stubs).toEqual({ DefaultBtn: true });
    });

    it("should use only mountOptions when defaultMountOptions are missing", () => {
      const factory = testComponentFactory(MockComponent, {}, {});

      factory({}, { global: { mocks: { $t: () => "" } } });

      const [, options] = mockMount.mock.calls[0];
      expect(options.global.mocks).toHaveProperty("$t");
    });

    it("should deeply merge nested objects like stubs and mocks", () => {
      const defaults = {
        global: {
          stubs: { BaseBtn: true },
          mocks: { $route: { path: "/" } },
        },
      };
      const factory = testComponentFactory(MockComponent, {}, defaults);

      factory(
        {},
        {
          global: {
            stubs: { Icon: true },
            mocks: { $store: {} },
          },
        },
      );

      const [, options] = mockMount.mock.calls[0];
      expect(options.global.stubs).toEqual({ BaseBtn: true, Icon: true });
      expect(options.global.mocks).toEqual({
        $route: { path: "/" },
        $store: {},
      });
    });

    it("should prioritize specific mountOptions over defaultMountOptions for the same key", () => {
      const defaults = { global: { provide: { theme: "light" } } };
      const factory = testComponentFactory(MockComponent, {}, defaults);

      factory({}, { global: { provide: { theme: "dark" } } });

      const [, options] = mockMount.mock.calls[0];
      expect(options.global.provide.theme).toBe("dark");
    });
  });

  describe("VTU Mounting Options Passthrough", () => {
    describe("data", () => {
      it("should pass data option to mount()", () => {
        const factory = testComponentFactory(MockComponent);

        const dataFn = () => ({
          count: 1,
        });

        factory({}, { data: dataFn });

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            data: dataFn,
          }),
        );
      });
    });

    describe("attrs", () => {
      it("should pass attrs option to mount()", () => {
        const factory = testComponentFactory(MockComponent);

        factory(
          {},
          {
            attrs: {
              id: "test-id",
              "data-testid": "button",
            },
          },
        );

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            attrs: {
              id: "test-id",
              "data-testid": "button",
            },
          }),
        );
      });

      it("should use defaultMountOptions.attrs when mountOptions.attrs are not provided", () => {
        const factory = testComponentFactory(
          MockComponent,
          {},
          {
            attrs: {
              role: "button",
            },
          },
        );

        factory();

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            attrs: {
              role: "button",
            },
          }),
        );
      });

      it("should shallow-merge attrs between defaultMountOptions and mountOptions", () => {
        const factory = testComponentFactory(
          MockComponent,
          {},
          {
            attrs: {
              role: "button",
            },
          },
        );

        factory(
          {},
          {
            attrs: {
              id: "submit",
            },
          },
        );

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            attrs: {
              role: "button",
              id: "submit",
            },
          }),
        );
      });

      it("should prioritize mountOptions.attrs over defaultMountOptions.attrs when keys conflict", () => {
        const factory = testComponentFactory(
          MockComponent,
          {},
          {
            attrs: {
              role: "button",
            },
          },
        );

        factory(
          {},
          {
            attrs: {
              role: "link",
            },
          },
        );

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            attrs: {
              role: "link",
            },
          }),
        );
      });

      it("should ignore defaultMountOptions.attrs when skipDefaultOptions is true", () => {
        const factory = testComponentFactory(
          MockComponent,
          {},
          {
            attrs: {
              role: "button",
            },
          },
        );

        factory(
          {},
          {
            attrs: {
              id: "submit",
            },
          },
          {},
          {
            skipDefaultOptions: true,
          },
        );

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            attrs: {
              id: "submit",
            },
          }),
        );
      });
    });

    describe("attachTo", () => {
      it("should pass attachTo option to mount()", () => {
        const target = "#app";

        const factory = testComponentFactory(MockComponent);

        factory(
          {},
          {
            attachTo: target,
          },
        );

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            attachTo: target,
          }),
        );
      });

      it("should allow mountOptions.attachTo to override defaultMountOptions.attachTo", () => {
        const factory = testComponentFactory(
          MockComponent,
          {},
          {
            attachTo: "#default-root",
          },
        );

        factory(
          {},
          {
            attachTo: "#test-root",
          },
        );

        expect(mockMount).toHaveBeenCalledWith(
          MockComponent,
          expect.objectContaining({
            attachTo: "#test-root",
          }),
        );
      });
    });

    it("should preserve unknown VTU options", () => {
      const factory = testComponentFactory(MockComponent);

      factory(
        {},
        {
          inheritAttrs: false,
        },
      );

      expect(mockMount).toHaveBeenCalledWith(
        MockComponent,
        expect.objectContaining({
          inheritAttrs: false,
        }),
      );
    });
  });

  describe("Plugin Integration", () => {
    it("should create i18n and pinia plugins by default when no plugin options are provided", () => {
      const factory = testComponentFactory(MockComponent);
      factory();

      expect(mockI18nCreate).toHaveBeenCalledTimes(1);
      expect(mockPiniaCreate).toHaveBeenCalledTimes(1);
    });

    it("should not create router plugin if it is not in default presets and not requested", () => {
      const factory = testComponentFactory(MockComponent);
      factory();

      expect(mockRouterCreate).not.toHaveBeenCalled();
    });

    it("should add default i18n and pinia plugins to global.plugins when no plugin options are provided", () => {
      const factory = testComponentFactory(MockComponent);
      factory();

      // 1. Verify that the plugin creators have been invoked (contract)
      // i18n should be created using the default configuration from the presets (e.g., en)
      expect(mockI18nCreate).toHaveBeenCalledWith(expect.objectContaining({ locale: "en" }));
      expect(mockPiniaCreate).toHaveBeenCalledTimes(1);

      // 2. Verify that the RESULT of the `create` operation is included in the mount options
      const [, options] = mockMount.mock.calls[0];

      expect(options.global.plugins).toContain(mockI18nInstance);
      expect(options.global.plugins).toContain(mockPiniaInstance);
      expect(options.global.plugins).toHaveLength(2);
    });

    it("should merge default plugins with third-party plugins when mountOptions.global.plugins is set", () => {
      // Create a third-party placeholder plugin (e.g., Vue Final Modal)
      const mockVfm = runner.fn(() => ({ install: () => {} }));

      const factory = testComponentFactory(MockComponent);

      // Call the factory by passing a third-party plugin in the mount options
      factory({}, { global: { plugins: [mockVfm] } });

      // 1. Verify that the default plugins were created anyway (contract)
      expect(mockI18nCreate).toHaveBeenCalledWith(expect.objectContaining({ locale: "en" }));
      expect(mockPiniaCreate).toHaveBeenCalledTimes(1);

      // 2. Verify that both default and third-party plugins are included in the final shallowMount
      const [, options] = mockMount.mock.calls[0];

      expect(options.global.plugins).toContain(mockI18nInstance); // i18n mock
      expect(options.global.plugins).toContain(mockPiniaInstance); // pinia mock
      expect(options.global.plugins).toContain(mockVfm); // Third-party plugin
      expect(options.global.plugins).toHaveLength(3);
    });

    it("should skip managed plugins when skipManagedPlugins options is set", () => {
      const mockVfm = runner.fn(() => ({ install: () => {} }));

      const factory = testComponentFactory(MockComponent);

      factory(
        {},
        {
          skipManagedPlugins: true,
          global: { plugins: [mockVfm] },
          plugins: { i18n: { locale: "en", messages: {} } },
        },
      );

      // Verify that the i18n has not been created
      expect(mockI18nCreate).toHaveBeenCalledTimes(0);
      expect(mockPiniaCreate).toHaveBeenCalledTimes(0);

      // Verify that the factory's result has been added to the shallowMount
      const [, options] = mockMount.mock.calls[0];
      expect(options.global.plugins).toContain(mockVfm);
      expect(options.global.plugins).toHaveLength(1);
    });

    it("should merge base and extra i18n options with extra taking precedence when both are provided", () => {
      const baseOptions = { plugins: { i18n: { locale: "en" } } };
      const extraOptions = { plugins: { i18n: { locale: "uk" } } };

      const factory = testComponentFactory(MockComponent, {}, baseOptions);
      factory({}, {}, {}, extraOptions);

      expect(mockI18nCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          locale: "uk",
          legacy: false,
        }),
      );
    });

    describe("Enable router when it is disabled by default", () => {
      it("should enable router via defaultMountOptions", () => {
        // Configure the factory settings so that the router is enabled by default
        const factory = testComponentFactory(
          MockComponent,
          {}, // defaultProps
          { plugins: { router: {} } }, // defaultMountOptions
        );

        factory();

        // 1. Verifying a contract-based call
        // The framework should provide default routes and history if they are not explicitly specified
        expect(mockRouterCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            routes: expect.any(Array),
            history: expect.any(Object),
          }),
        );

        // 2. Verify that the router instance has been added to the mounting plugins
        const [, options] = mockMount.mock.calls[0];
        expect(options.global.plugins).toContain(mockRouterInstance);
      });

      it("should enable router via mountOptions", () => {
        // Create a regular factory (without a router in the default settings)
        const factory = testComponentFactory(MockComponent);

        // Enable the router only in this specific call
        factory({}, { plugins: { router: {} } });

        // 1. Verify that the contract for the creation of the router has been fulfilled
        expect(mockRouterCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            routes: expect.any(Array),
            history: expect.any(Object),
          }),
        );

        // 2. Verify that the router instance has been successfully injected into Vue Test Utils
        const [, options] = mockMount.mock.calls[0];
        expect(options.global.plugins).toContain(mockRouterInstance);

        // Also, check that the default plugins (i18n, pinia) are still there
        expect(options.global.plugins).toContain(mockI18nInstance);
        expect(options.global.plugins).toContain(mockPiniaInstance);
        expect(options.global.plugins).toHaveLength(3);
      });

      it("should enable router via extraOptions (4th argument)", () => {
        const factory = testComponentFactory(MockComponent);

        const customRoutes = [{ path: "/", component: { render: () => null } }];

        // Enable the router using the 4th argument (extraOptions)
        factory({}, {}, {}, { plugins: { router: { routes: customRoutes } } });

        // 1. Verify that the contract for creating the router is invoked with our custom routes
        expect(mockRouterCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            routes: customRoutes,
            history: expect.any(Object),
          }),
        );

        // 2. Verify that the router instance has been added to the plugins
        const [, options] = mockMount.mock.calls[0];
        expect(options.global.plugins).toContain(mockRouterInstance);

        // Also, check that the default plugins (i18n, pinia) are still there
        expect(options.global.plugins).toContain(mockI18nInstance);
        expect(options.global.plugins).toContain(mockPiniaInstance);
        expect(options.global.plugins).toHaveLength(3);
      });
    });

    it("should merge i18n settings with provided options taking precedence over defaults", () => {
      const baseOptions = {
        plugins: { i18n: { locale: "en", legacy: true } },
      };

      const factory = testComponentFactory(MockComponent, {}, baseOptions);
      factory();

      expect(mockI18nCreate).toHaveBeenCalledWith(
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
      // Configuring the factory with explicit i18n disabling
      const factory = testComponentFactory(MockComponent, {}, { plugins: { i18n: false } });

      factory();

      // 1. Verify that the create method for i18n has NOT been called
      expect(mockI18nCreate).not.toHaveBeenCalled();

      // 2. Verify the mounting options
      const [, options] = mockMount.mock.calls[0];

      // i18n should not be on the list
      expect(options.global.plugins).not.toContain(mockI18nInstance);

      // Only one plugin (pinia) should remain, since i18n has been disabled and the router has not been enabled
      expect(options.global.plugins).toContain(mockPiniaInstance);
      expect(options.global.plugins).toHaveLength(1);
    });

    describe("Using Presets", () => {
      it("should add default i18n and pinia plugins when switching to `lightweightPreset` via extraOptions", () => {
        const factory = testComponentFactory(MockComponent);

        // Switch the preset using the 4th argument
        factory({}, {}, {}, { preset: "lightweightPreset" });

        // 1. Verify that the plugins from the lightweight preset have been created
        expect(mockI18nCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            locale: "en",
          }),
        );
        expect(mockPiniaCreate).toHaveBeenCalled();

        // 2. Verify the presence of instances in the mount options
        const [, options] = mockMount.mock.calls[0];
        expect(options.global.plugins).toContain(mockI18nInstance);
        expect(options.global.plugins).toContain(mockPiniaInstance);

        // Verify that the number of plugins matches the preset
        expect(options.global.plugins).toHaveLength(2);
      });

      it("should add only i18n to `global.plugins` when switching to `i18nPreset` preset", () => {
        const factory = testComponentFactory(MockComponent);

        // Enable the preset that contains only i18n
        factory({}, {}, {}, { preset: "i18nPreset" });

        // 1. Verifying contracts: i18n is created, pinia is not
        expect(mockI18nCreate).toHaveBeenCalledWith(expect.objectContaining({ locale: "en" }));
        expect(mockPiniaCreate).not.toHaveBeenCalled();

        // 2. Verify the mounting options (make sure to include [0])
        const [, options] = mockMount.mock.calls[0];

        expect(options.global.plugins).toContain(mockI18nInstance);
        expect(options.global.plugins).not.toContain(mockPiniaInstance);

        // Verify that there is exactly one plugin in the array
        expect(options.global.plugins).toHaveLength(1);
      });

      it("should override preset default options with provided plugin options", () => {
        const factory = testComponentFactory(MockComponent);

        // Use i18nPreset, but override the language to ‘fr’ via mountOptions
        factory({}, { plugins: { i18n: { locale: "fr" } } }, {}, { preset: "i18nPreset" });

        // 1. Verify that pinia was not created (a feature of i18nPreset)
        expect(mockPiniaCreate).not.toHaveBeenCalled();

        // 2. Verify that i18n was created with ‘fr’ rather than the default 'en'
        expect(mockI18nCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            locale: "fr",
          }),
        );

        // 3. Verify the presence of an instance in the final options
        const [, options] = mockMount.mock.calls[0];
        expect(options.global.plugins).toContain(mockI18nInstance);
        expect(options.global.plugins).toHaveLength(1);
      });

      it("should skip plugin initialization when it is disabled in the preset manifest", () => {
        const factory = testComponentFactory(MockComponent);

        factory({}, {}, {}, { preset: "i18nDisabledPreset" });

        expect(mockI18nCreate).toHaveBeenCalledTimes(0);

        const [, options] = mockMount.mock.calls[0];
        // No plugins have been created
        expect(options.global.plugins || []).toHaveLength(0);
      });

      it("should override preset manifest and skip plugin when options are set to false", () => {
        const factory = testComponentFactory(MockComponent);

        factory({}, { plugins: { i18n: false } }, {}, { preset: "i18nPreset" });

        expect(mockI18nCreate).toHaveBeenCalledTimes(0);

        // Verify that the factory's result has been added to the shallowMount
        const [, options] = mockMount.mock.calls[0];
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
            const factory = testComponentFactory(MockComponent);
            expect(() => {
              factory({}, { plugins: { i18n: value } }, {}, { preset: "i18nPreset" });
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
          const factory = testComponentFactory(MockComponent);
          expect(() => {
            factory({}, { plugins: { i18n: false } }, {}, { preset: "i18nPreset" });
          }).not.toThrow();
        });
      });

      describe("Unsupported Plugins", () => {
        it("should throw when plugin is configured but not supported by preset", () => {
          const factory = testComponentFactory(MockComponent);

          expect(() => {
            factory(
              {},
              {
                plugins: {
                  pinia: {},
                },
              },
              {},
              {
                preset: "i18nPreset",
              },
            );
          }).toThrow(
            `${ERROR_PREFIX} Plugin "pinia" is configured but not supported by the active preset.`,
          );
        });

        it("should allow supported plugins from preset", () => {
          const factory = testComponentFactory(MockComponent);

          expect(() => {
            factory(
              {},
              {
                plugins: {
                  i18n: {
                    locale: "fr",
                  },
                },
              },
              {},
              {
                preset: "i18nPreset",
              },
            );
          }).not.toThrow();
        });

        it("should throw when enabling router in preset that does not support it", () => {
          const factory = testComponentFactory(MockComponent);

          expect(() => {
            factory(
              {},
              {
                plugins: {
                  router: {},
                },
              },
              {},
              {
                preset: "i18nPreset",
              },
            );
          }).toThrow(
            `${ERROR_PREFIX} Plugin "router" is configured but not supported by the active preset.`,
          );
        });
      });
    });
  });
});
