import { setupFactoryTestContext } from "./utils/setupFactoryTestContext.js";

const runner = typeof vi !== "undefined" ? vi : jest;

describe("Plugin Integration", () => {
  let MockComponent;
  let mockMount;
  let testComponentFactory;
  let createTestFramework;
  let captureInstance;

  const mockI18nCreate = runner.fn();
  const mockPiniaCreate = runner.fn();
  const mockRouterCreate = runner.fn();

  const mockI18nInstance = {
    install: (app) => {
      app.config.globalProperties.$t = (key) => key;
    },
  };
  const mockPiniaInstance = { install: () => {} };
  const mockRouterInstance = { install: () => {} };

  beforeEach(async () => {
    const ctx = await setupFactoryTestContext(runner, {
      configureModules: () => {
        mockI18nCreate.mockReturnValue(mockI18nInstance);
        mockPiniaCreate.mockReturnValue(mockPiniaInstance);
        mockRouterCreate.mockReturnValue(mockRouterInstance);

        // Mock public plugin interfaces before importing Core and presets.
        runner.doMock("@testforgejs/vue-test-plugin-i18n", () => ({
          i18nPlugin: {
            getName: () => "i18n",
            getDefinition: () => ({ create: mockI18nCreate }),
          },
        }));

        runner.doMock("@testforgejs/vue-test-plugin-pinia", () => ({
          piniaPlugin: {
            getName: () => "pinia",
            getDefinition: () => ({ create: mockPiniaCreate }),
          },
        }));

        runner.doMock("@testforgejs/vue-test-plugin-router", () => ({
          routerPlugin: {
            getName: () => "router",
            getDefinition: () => ({ create: mockRouterCreate }),
          },
        }));
      },
    });

    ({ MockComponent, mockMount, testComponentFactory, createTestFramework, captureInstance } =
      ctx);
  });

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

  describe("Plugin Configuration Replacement", () => {
    it("should reject instance capture in defaultMountOptions even when plugin configuration is overridden", () => {
      const capture = captureInstance();

      const factory = testComponentFactory(
        MockComponent,
        {},
        {
          plugins: {
            pinia: {
              ...capture,
            },
          },
        },
      );

      expect(() =>
        factory(
          {},
          {
            plugins: {
              pinia: {
                initialState: {
                  user: {
                    id: 1,
                  },
                },
              },
            },
          },
        ),
      ).toThrow("Instance capture is not allowed in defaultMountOptions.plugins.pinia.");

      expect(capture.instance).toBeUndefined();
      expect(mockPiniaCreate).not.toHaveBeenCalled();
      expect(mockMount).not.toHaveBeenCalled();
    });

    it("should completely replace plugin configuration before invoking plugin factory", () => {
      const factory = testComponentFactory(
        MockComponent,
        {},
        {
          plugins: {
            pinia: {
              stubActions: true,
            },
          },
        },
      );

      factory(
        {},
        {
          plugins: {
            pinia: {
              initialState: { user: { id: 123 } },
            },
          },
        },
        {},
        {},
      );

      expect(mockPiniaCreate).toHaveBeenCalledTimes(1);
      const [calledOptions] = mockPiniaCreate.mock.calls[0];

      expect(calledOptions.stubActions).not.toEqual(true);
      expect(calledOptions.initialState).toEqual({ user: { id: 123 } });
    });

    it("should disable a plugin through extraOptions", () => {
      const factory = testComponentFactory(
        MockComponent,
        {},
        {
          plugins: {
            pinia: {
              stubActions: true,
            },
          },
        },
      );

      factory({}, {}, {}, { plugins: { pinia: false } });

      expect(mockPiniaCreate).not.toHaveBeenCalled();
      expect(mockI18nCreate).toHaveBeenCalledTimes(1);

      const [, options] = mockMount.mock.calls[0];

      expect(options.global.plugins).not.toContain(mockPiniaInstance);
      expect(options.global.plugins).toContain(mockI18nInstance);
      expect(options.global.plugins).toHaveLength(1);
    });

    it("should disable a plugin only for the current mount", () => {
      const factory = testComponentFactory(MockComponent);

      // Disable Pinia for the first mount.
      factory({}, {}, {}, { plugins: { pinia: false } });

      expect(mockPiniaCreate).not.toHaveBeenCalled();

      const [, firstMountOptions] = mockMount.mock.calls[0];

      expect(firstMountOptions.global.plugins).not.toContain(mockPiniaInstance);

      // Pinia should be enabled again for the next mount.
      factory();

      expect(mockPiniaCreate).toHaveBeenCalledTimes(1);

      const [, secondMountOptions] = mockMount.mock.calls[1];

      expect(secondMountOptions.global.plugins).toContain(mockPiniaInstance);
    });
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

    it("should enable router via extraOptions and preserve preset defaults", async () => {
      const { presets } = await import("./utils/presets/mockPresets.js");

      const presetLinkActiveClass = "preset-router-active";

      // Create a local preset with an additional Router default.
      const preset = {
        ...presets.default,
        defaults: {
          ...presets.default.defaults,
          router: () => ({
            ...presets.default.defaults.router?.(),
            linkActiveClass: presetLinkActiveClass,
          }),
        },
      };

      // Ensure Router is disabled by default in the preset manifest.
      const routerEntry = preset.manifest.find(({ module }) => module.getName() === "router");

      expect(routerEntry?.enabled).toBe(false);

      const { testComponentFactory: createFactory } = createTestFramework({
        preset,
      });

      const factory = createFactory(MockComponent);

      const customRoutes = [{ path: "/", component: { render: () => null } }];

      // Enable Router through Layer 4.
      factory({}, {}, {}, { plugins: { router: { routes: customRoutes } } });

      // Verify that Router receives both the runtime options
      // and the defaults from the disabled preset entry.
      expect(mockRouterCreate).toHaveBeenCalledTimes(1);

      expect(mockRouterCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          routes: customRoutes,
          history: expect.any(Object),
          linkActiveClass: presetLinkActiveClass,
        }),
      );

      // Verify that Router is installed alongside the default plugins.
      const [, options] = mockMount.mock.calls[0];

      expect(options.global.plugins).toContain(mockRouterInstance);
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
    it("should select presets independently across factory calls", () => {
      const factory = testComponentFactory(MockComponent);

      // First mount: i18n-only preset.
      factory({}, {}, {}, { presetKey: "i18nPreset" });

      expect(mockI18nCreate).toHaveBeenCalledTimes(1);
      expect(mockPiniaCreate).not.toHaveBeenCalled();

      const [, firstMountOptions] = mockMount.mock.calls[0];

      expect(firstMountOptions.global.plugins).toContain(mockI18nInstance);
      expect(firstMountOptions.global.plugins).not.toContain(mockPiniaInstance);
      expect(firstMountOptions.global.plugins).toHaveLength(1);

      // Second mount: preset with i18n disabled.
      factory({}, {}, {}, { presetKey: "i18nDisabledPreset" });

      expect(mockI18nCreate).toHaveBeenCalledTimes(1);
      expect(mockPiniaCreate).not.toHaveBeenCalled();

      const [, secondMountOptions] = mockMount.mock.calls[1];

      expect(secondMountOptions.global.plugins || []).toHaveLength(0);

      // Third mount: no explicit preset, so the default must be restored.
      factory();

      expect(mockI18nCreate).toHaveBeenCalledTimes(2);
      expect(mockPiniaCreate).toHaveBeenCalledTimes(1);

      const [, thirdMountOptions] = mockMount.mock.calls[2];

      expect(thirdMountOptions.global.plugins).toContain(mockI18nInstance);
      expect(thirdMountOptions.global.plugins).toContain(mockPiniaInstance);
      expect(thirdMountOptions.global.plugins).toHaveLength(2);

      expect(mockMount).toHaveBeenCalledTimes(3);

      // Earlier mount configurations must remain unchanged.
      expect(firstMountOptions.global.plugins).toEqual([mockI18nInstance]);
      expect(secondMountOptions.global.plugins || []).toHaveLength(0);
    });

    it("should reject an unknown preset key", () => {
      const factory = testComponentFactory(MockComponent);

      expect(() => {
        factory({}, {}, {}, { presetKey: "unknownPreset" });
      }).toThrow();

      expect(mockI18nCreate).not.toHaveBeenCalled();
      expect(mockPiniaCreate).not.toHaveBeenCalled();
      expect(mockRouterCreate).not.toHaveBeenCalled();

      expect(mockMount).not.toHaveBeenCalled();
    });

    it("should add default i18n and pinia plugins when switching to `lightweightPreset` via extraOptions", () => {
      const factory = testComponentFactory(MockComponent);

      // Switch the preset using the 4th argument
      factory({}, {}, {}, { presetKey: "lightweightPreset" });

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
      factory({}, {}, {}, { presetKey: "i18nPreset" });

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
      factory({}, { plugins: { i18n: { locale: "fr" } } }, {}, { presetKey: "i18nPreset" });

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

      factory({}, {}, {}, { presetKey: "i18nDisabledPreset" });

      expect(mockI18nCreate).toHaveBeenCalledTimes(0);

      const [, options] = mockMount.mock.calls[0];
      // No plugins have been created
      expect(options.global.plugins || []).toHaveLength(0);
    });

    it("should override preset manifest and skip plugin when options are set to false", () => {
      const factory = testComponentFactory(MockComponent);

      factory({}, { plugins: { i18n: false } }, {}, { presetKey: "i18nPreset" });

      expect(mockI18nCreate).toHaveBeenCalledTimes(0);

      // Verify that the factory's result has been added to the shallowMount
      const [, options] = mockMount.mock.calls[0];
      // No plugins have been created
      expect(options.global.plugins || []).toHaveLength(0);
    });

    it("should not throw when defaultMountOptions contains additional plugins", () => {
      const factory = testComponentFactory(MockComponent, {}, { plugins: { pinia: {} } });
      factory({});
      expect(() => factory({}, {}, {}, { presetKey: "i18nPreset" })).not.toThrow();
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
            factory({}, { plugins: { i18n: value } }, {}, { presetKey: "i18nPreset" });
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
          factory({}, { plugins: { i18n: false } }, {}, { presetKey: "i18nPreset" });
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
              presetKey: "i18nPreset",
            },
          );
        }).toThrow('Plugin "pinia" is configured but not supported by the active preset.');
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
              presetKey: "i18nPreset",
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
              presetKey: "i18nPreset",
            },
          );
        }).toThrow('Plugin "router" is configured but not supported by the active preset.');
      });
    });

    describe("Factory-level Preset Selection", () => {
      it("should use the preset selected via withOptions", () => {
        const factory = testComponentFactory.withOptions({
          component: MockComponent,
          presetKey: "i18nPreset",
        });

        factory();

        // Only i18n should be created by the selected preset.
        expect(mockI18nCreate).toHaveBeenCalledTimes(1);
        expect(mockPiniaCreate).not.toHaveBeenCalled();
        expect(mockRouterCreate).not.toHaveBeenCalled();

        // Verify the plugins passed to Vue Test Utils.
        const [, options] = mockMount.mock.calls[0];

        expect(options.global.plugins).toContain(mockI18nInstance);
        expect(options.global.plugins).not.toContain(mockPiniaInstance);
        expect(options.global.plugins).toHaveLength(1);

        expect(mockMount).toHaveBeenCalledTimes(1);
      });

      it("should override the factory preset via extraOptions.presetKey", () => {
        const factory = testComponentFactory.withOptions({
          component: MockComponent,
          presetKey: "i18nPreset",
        });

        // Override the factory-level preset for this mount.
        factory({}, {}, {}, { presetKey: "default" });

        // The default preset enables both i18n and Pinia.
        expect(mockI18nCreate).toHaveBeenCalledTimes(1);
        expect(mockPiniaCreate).toHaveBeenCalledTimes(1);
        expect(mockRouterCreate).not.toHaveBeenCalled();

        const [, options] = mockMount.mock.calls[0];

        expect(options.global.plugins).toContain(mockI18nInstance);
        expect(options.global.plugins).toContain(mockPiniaInstance);
        expect(options.global.plugins).toHaveLength(2);

        expect(mockMount).toHaveBeenCalledTimes(1);
      });

      it("should restore the factory preset after a mount-level override", () => {
        const factory = testComponentFactory.withOptions({
          component: MockComponent,
          presetKey: "i18nPreset",
        });

        // First mount: use the factory-level preset.
        factory();

        const [, firstMountOptions] = mockMount.mock.calls[0];

        expect(firstMountOptions.global.plugins).toContain(mockI18nInstance);
        expect(firstMountOptions.global.plugins).not.toContain(mockPiniaInstance);
        expect(firstMountOptions.global.plugins).toHaveLength(1);

        // Second mount: override the factory preset.
        factory({}, {}, {}, { presetKey: "default" });

        const [, secondMountOptions] = mockMount.mock.calls[1];

        expect(secondMountOptions.global.plugins).toContain(mockI18nInstance);
        expect(secondMountOptions.global.plugins).toContain(mockPiniaInstance);
        expect(secondMountOptions.global.plugins).toHaveLength(2);

        // Third mount: the factory-level preset must be restored.
        factory();

        const [, thirdMountOptions] = mockMount.mock.calls[2];

        expect(thirdMountOptions.global.plugins).toContain(mockI18nInstance);
        expect(thirdMountOptions.global.plugins).not.toContain(mockPiniaInstance);
        expect(thirdMountOptions.global.plugins).toHaveLength(1);

        // Verify cumulative plugin creation.
        expect(mockI18nCreate).toHaveBeenCalledTimes(3);
        expect(mockPiniaCreate).toHaveBeenCalledTimes(1);
        expect(mockRouterCreate).not.toHaveBeenCalled();

        expect(mockMount).toHaveBeenCalledTimes(3);

        // Later mounts must not mutate earlier mount configurations.
        expect(firstMountOptions.global.plugins).toHaveLength(1);
        expect(firstMountOptions.global.plugins).toContain(mockI18nInstance);

        expect(secondMountOptions.global.plugins).toHaveLength(2);
        expect(secondMountOptions.global.plugins).toContain(mockI18nInstance);
        expect(secondMountOptions.global.plugins).toContain(mockPiniaInstance);
      });

      it("should reject an unknown factory preset before mounting", () => {
        expect(() => {
          testComponentFactory.withOptions({
            component: MockComponent,
            presetKey: "unknownPreset",
          });
        }).toThrow('Preset "unknownPreset" is not registered.');

        expect(mockI18nCreate).not.toHaveBeenCalled();
        expect(mockPiniaCreate).not.toHaveBeenCalled();
        expect(mockMount).not.toHaveBeenCalled();
      });
    });
  });
});
