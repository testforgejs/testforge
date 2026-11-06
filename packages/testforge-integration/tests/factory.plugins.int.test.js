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
    const factory = testComponentFactory(MockComponent, undefined, () => ({
      plugins: { i18n: { locale: "en" } },
    }));
    factory.withOptions({ extraOptions: { plugins: { i18n: { locale: "uk" } } } });

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

      const factory = testComponentFactory(MockComponent, undefined, () => ({
        plugins: {
          pinia: {
            ...capture,
          },
        },
      }));

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
      const factory = testComponentFactory(MockComponent, undefined, () => ({
        plugins: {
          pinia: {
            stubActions: true,
          },
        },
      }));

      factory.withOptions({
        mountOptions: {
          plugins: {
            pinia: {
              initialState: { user: { id: 123 } },
            },
          },
        },
      });

      expect(mockPiniaCreate).toHaveBeenCalledTimes(1);
      const [calledOptions] = mockPiniaCreate.mock.calls[0];

      expect(calledOptions.stubActions).not.toEqual(true);
      expect(calledOptions.initialState).toEqual({ user: { id: 123 } });
    });

    it("should disable a plugin through extraOptions", () => {
      const factory = testComponentFactory(MockComponent, undefined, () => ({
        plugins: {
          pinia: {
            stubActions: true,
          },
        },
      }));

      factory.withOptions({ extraOptions: { plugins: { pinia: false } } });

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
      factory.withOptions({ extraOptions: { plugins: { pinia: false } } });

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

  describe("Factory Plugin Options Isolation", () => {
    it("should isolate nested defaultMountOptions.plugins between mounts (positional API)", () => {
      const factory = testComponentFactory(MockComponent, undefined, () => ({
        plugins: {
          pinia: {
            initialState: {
              user: {
                roles: ["user"],
              },
            },
          },
        },
      }));

      factory();

      expect(mockPiniaCreate).toHaveBeenCalledTimes(1);
      const [firstOptions] = mockPiniaCreate.mock.calls[0];

      // Simulate mutation of the configuration received by the first plugin creator.
      firstOptions.initialState.user.roles.push("admin");

      factory.withOptions({});

      const [secondOptions] = mockPiniaCreate.mock.calls[1];

      expect(mockPiniaCreate).toHaveBeenCalledTimes(2);
      expect(mockMount).toHaveBeenCalledTimes(2);

      expect(firstOptions.initialState.user.roles).toEqual(["user", "admin"]);
      expect(secondOptions.initialState.user.roles).toEqual(["user"]);

      expect(secondOptions).not.toBe(firstOptions);
      expect(secondOptions.initialState).not.toBe(firstOptions.initialState);
      expect(secondOptions.initialState.user).not.toBe(firstOptions.initialState.user);
      expect(secondOptions.initialState.user.roles).not.toBe(firstOptions.initialState.user.roles);
    });

    it("should isolate nested defaultMountOptions.plugins between mounts (object API)", () => {
      const factory = testComponentFactory.withOptions(() => ({
        component: MockComponent,
        defaultMountOptions: {
          plugins: {
            pinia: {
              initialState: {
                user: {
                  roles: ["user"],
                },
              },
            },
          },
        },
      }));

      factory();

      expect(mockPiniaCreate).toHaveBeenCalledTimes(1);
      const [firstOptions] = mockPiniaCreate.mock.calls[0];

      // Simulate mutation of the configuration received by the first plugin creator.
      firstOptions.initialState.user.roles.push("admin");

      factory.withOptions({});

      const [secondOptions] = mockPiniaCreate.mock.calls[1];

      expect(mockPiniaCreate).toHaveBeenCalledTimes(2);
      expect(mockMount).toHaveBeenCalledTimes(2);

      expect(firstOptions.initialState.user.roles).toEqual(["user", "admin"]);
      expect(secondOptions.initialState.user.roles).toEqual(["user"]);

      expect(secondOptions).not.toBe(firstOptions);
      expect(secondOptions.initialState).not.toBe(firstOptions.initialState);
      expect(secondOptions.initialState.user).not.toBe(firstOptions.initialState.user);
      expect(secondOptions.initialState.user.roles).not.toBe(firstOptions.initialState.user.roles);
    });
  });

  describe("Enable router when it is disabled by default", () => {
    it("should enable router via defaultMountOptions", () => {
      // Configure the factory settings so that the router is enabled by default
      const factory = testComponentFactory(
        MockComponent,
        undefined, // defaultProps
        () => ({ plugins: { router: {} } }), // defaultMountOptions
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
      factory.withOptions({ mountOptions: { plugins: { router: {} } } });

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
      factory.withOptions({ extraOptions: { plugins: { router: { routes: customRoutes } } } });

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
    const factory = testComponentFactory(MockComponent, undefined, () => ({
      plugins: { i18n: { locale: "en", legacy: true } },
    }));
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
    const factory = testComponentFactory(MockComponent, undefined, () => ({
      plugins: { i18n: false },
    }));

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

  describe("Mount-level Object API", () => {
    const expectDefaultPlugins = (plugins) => {
      expect(plugins).toEqual(expect.arrayContaining([mockI18nInstance, mockPiniaInstance]));
      expect(plugins).toHaveLength(2);
    };

    it("should initialize default plugins when called with empty options", () => {
      const factory = testComponentFactory(MockComponent);

      factory.withOptions({});

      expect(mockI18nCreate).toHaveBeenCalledTimes(1);
      expect(mockPiniaCreate).toHaveBeenCalledTimes(1);
      expect(mockRouterCreate).not.toHaveBeenCalled();

      const [, options] = mockMount.mock.calls[0];
      expectDefaultPlugins(options.global.plugins);
      expect(mockMount).toHaveBeenCalledTimes(1);
    });

    it("should produce equivalent mount options through positional and object-based calls", () => {
      const factory = testComponentFactory(MockComponent);
      const defaultSlot = () => "Slot content";
      const props = { status: "ready" };
      const mountOptions = {
        plugins: { i18n: { locale: "fr" } },
        global: { stubs: { AppButton: true } },
      };
      const slots = { default: defaultSlot };
      const extraOptions = { plugins: { pinia: false } };

      factory(props, mountOptions, slots, extraOptions);
      factory.withOptions({ props, mountOptions, slots, extraOptions });

      expect(mockI18nCreate).toHaveBeenCalledTimes(2);
      expect(mockI18nCreate).toHaveBeenCalledWith(expect.objectContaining({ locale: "fr" }));
      expect(mockPiniaCreate).not.toHaveBeenCalled();
      expect(mockMount).toHaveBeenCalledTimes(2);

      const [, positionalOptions] = mockMount.mock.calls[0];
      const [, objectOptions] = mockMount.mock.calls[1];

      expect(objectOptions).toEqual(positionalOptions);
      expect(objectOptions.props).toMatchObject(props);
      expect(objectOptions.slots.default).toBe(defaultSlot);
      expect(objectOptions.global.stubs.AppButton).toBe(true);
      expect(objectOptions.global.plugins).toEqual([mockI18nInstance]);
    });

    it("should apply mountOptions.plugins when selecting a mount-level preset", () => {
      const factory = testComponentFactory(MockComponent);

      factory.withOptions({
        mountOptions: { plugins: { i18n: { locale: "fr" } } },
        extraOptions: { presetKey: "i18nPreset" },
      });

      expect(mockI18nCreate).toHaveBeenCalledWith(expect.objectContaining({ locale: "fr" }));
      expect(mockPiniaCreate).not.toHaveBeenCalled();

      const [, options] = mockMount.mock.calls[0];
      expect(options.global.plugins).toEqual([mockI18nInstance]);
    });

    it("should apply extraOptions.plugins over mountOptions.plugins", () => {
      const factory = testComponentFactory(MockComponent);

      factory.withOptions({
        mountOptions: { plugins: { i18n: { locale: "fr" } } },
        extraOptions: { plugins: { i18n: { locale: "uk" } } },
      });

      expect(mockI18nCreate).toHaveBeenCalledTimes(1);
      expect(mockI18nCreate).toHaveBeenCalledWith(expect.objectContaining({ locale: "uk" }));
      expect(mockPiniaCreate).toHaveBeenCalledTimes(1);
      expect(mockMount).toHaveBeenCalledTimes(1);
    });

    it("should replace factory plugin options through mountOptions.plugins", () => {
      const factory = testComponentFactory.withOptions(() => ({
        component: MockComponent,
        defaultMountOptions: { plugins: { pinia: { stubActions: true } } },
      }));

      factory.withOptions({
        mountOptions: { plugins: { pinia: { initialState: { user: { id: 123 } } } } },
      });

      expect(mockPiniaCreate).toHaveBeenCalledTimes(1);
      const [piniaOptions] = mockPiniaCreate.mock.calls[0];
      expect(piniaOptions.stubActions).not.toBe(true);
      expect(piniaOptions.initialState).toEqual({ user: { id: 123 } });
    });

    it("should disable a managed plugin for one object-based mount only", () => {
      const factory = testComponentFactory(MockComponent);

      factory.withOptions({ extraOptions: { plugins: { pinia: false } } });

      const [, firstMountOptions] = mockMount.mock.calls[0];
      expect(firstMountOptions.global.plugins).toEqual([mockI18nInstance]);
      expect(mockPiniaCreate).not.toHaveBeenCalled();

      factory.withOptions({});

      const [, secondMountOptions] = mockMount.mock.calls[1];
      expectDefaultPlugins(secondMountOptions.global.plugins);
      expect(mockPiniaCreate).toHaveBeenCalledTimes(1);
      expect(firstMountOptions.global.plugins).toEqual([mockI18nInstance]);
      expect(mockMount).toHaveBeenCalledTimes(2);
    });

    it("should skip managed plugins and preserve third-party plugins", () => {
      const thirdPartyPlugin = { install: () => {} };
      const factory = testComponentFactory(MockComponent);

      factory.withOptions({
        mountOptions: {
          skipManagedPlugins: true,
          global: { plugins: [thirdPartyPlugin] },
        },
      });

      expect(mockI18nCreate).not.toHaveBeenCalled();
      expect(mockPiniaCreate).not.toHaveBeenCalled();
      expect(mockRouterCreate).not.toHaveBeenCalled();

      const [, options] = mockMount.mock.calls[0];
      expect(options.global.plugins).toEqual([thirdPartyPlugin]);
      expect(mockMount).toHaveBeenCalledTimes(1);
    });

    it("should enable a disabled preset plugin through extraOptions.plugins", () => {
      const factory = testComponentFactory(MockComponent);
      const routes = [{ path: "/", component: { render: () => null } }];

      factory.withOptions({
        extraOptions: { plugins: { router: { routes } } },
      });

      expect(mockRouterCreate).toHaveBeenCalledTimes(1);
      expect(mockRouterCreate).toHaveBeenCalledWith(expect.objectContaining({ routes }));

      const [, options] = mockMount.mock.calls[0];
      expect(options.global.plugins).toContain(mockRouterInstance);
      expect(options.global.plugins).toContain(mockI18nInstance);
      expect(options.global.plugins).toContain(mockPiniaInstance);
      expect(options.global.plugins).toHaveLength(3);
    });

    it("should temporarily override the factory preset and restore it across invocation forms", () => {
      const factory = testComponentFactory.withOptions(() => ({
        component: MockComponent,
        presetKey: "i18nPreset",
      }));

      // Inherit the factory-level preset.
      factory.withOptions({});
      const [, firstMountOptions] = mockMount.mock.calls[0];
      expect(firstMountOptions.global.plugins).toEqual([mockI18nInstance]);

      // The nested mount-level preset overrides the factory-level preset.
      factory.withOptions({ extraOptions: { presetKey: "default" } });
      const [, secondMountOptions] = mockMount.mock.calls[1];
      expectDefaultPlugins(secondMountOptions.global.plugins);

      // A positional invocation of the same factory restores its original preset.
      factory();
      const [, thirdMountOptions] = mockMount.mock.calls[2];
      expect(thirdMountOptions.global.plugins).toEqual([mockI18nInstance]);

      expect(mockI18nCreate).toHaveBeenCalledTimes(3);
      expect(mockPiniaCreate).toHaveBeenCalledTimes(1);
      expect(mockMount).toHaveBeenCalledTimes(3);
      expect(firstMountOptions.global.plugins).toEqual([mockI18nInstance]);
      expectDefaultPlugins(secondMountOptions.global.plugins);
    });

    it("should use the same object-based mount API from a positional factory", () => {
      const factory = testComponentFactory(MockComponent, undefined, undefined, undefined, {
        presetKey: "i18nPreset",
      });

      factory.withOptions({ extraOptions: { presetKey: "default" } });
      factory.withOptions({});

      expectDefaultPlugins(mockMount.mock.calls[0][1].global.plugins);
      expect(mockMount.mock.calls[1][1].global.plugins).toEqual([mockI18nInstance]);
      expect(mockPiniaCreate).toHaveBeenCalledTimes(1);
      expect(mockI18nCreate).toHaveBeenCalledTimes(2);
    });

    it("should ignore unsupported factory defaults under a mount-level preset override", () => {
      const factory = testComponentFactory.withOptions(() => ({
        component: MockComponent,
        presetKey: "default",
        defaultMountOptions: { plugins: { pinia: { stubActions: true } } },
      }));

      factory.withOptions({ extraOptions: { presetKey: "i18nPreset" } });

      expect(mockI18nCreate).toHaveBeenCalledTimes(1);
      expect(mockPiniaCreate).not.toHaveBeenCalled();
      expect(mockMount.mock.calls[0][1].global.plugins).toEqual([mockI18nInstance]);

      // Default configuration remains available when the factory preset is active.
      factory.withOptions({});
      expect(mockPiniaCreate).toHaveBeenCalledWith(expect.objectContaining({ stubActions: true }));
      expectDefaultPlugins(mockMount.mock.calls[1][1].global.plugins);
    });

    it("should reject mountOptions plugins unsupported by the effective preset", () => {
      const factory = testComponentFactory.withOptions(() => ({
        component: MockComponent,
        presetKey: "default",
      }));

      expect(() => {
        factory.withOptions({
          mountOptions: { plugins: { pinia: {} } },
          extraOptions: { presetKey: "i18nPreset" },
        });
      }).toThrow('Plugin "pinia" is configured but not supported by the active preset.');

      expect(mockI18nCreate).not.toHaveBeenCalled();
      expect(mockPiniaCreate).not.toHaveBeenCalled();
      expect(mockMount).not.toHaveBeenCalled();
    });

    it("should reject extraOptions plugins unsupported by the effective preset", () => {
      const factory = testComponentFactory(MockComponent);

      expect(() => {
        factory.withOptions({
          extraOptions: {
            presetKey: "i18nPreset",
            plugins: { pinia: {} },
          },
        });
      }).toThrow('Plugin "pinia" is configured but not supported by the active preset.');

      expect(mockI18nCreate).not.toHaveBeenCalled();
      expect(mockPiniaCreate).not.toHaveBeenCalled();
      expect(mockMount).not.toHaveBeenCalled();
    });

    it("should reject an unknown nested preset before initializing plugins", () => {
      const factory = testComponentFactory(MockComponent);

      expect(() => {
        factory.withOptions({ extraOptions: { presetKey: "unknownPreset" } });
      }).toThrow(/unknownPreset/);

      expect(mockI18nCreate).not.toHaveBeenCalled();
      expect(mockPiniaCreate).not.toHaveBeenCalled();
      expect(mockMount).not.toHaveBeenCalled();
    });

    it("should reject presetKey at the top level rather than silently ignoring it", () => {
      const factory = testComponentFactory(MockComponent);

      expect(() => {
        factory.withOptions({ presetKey: "i18nPreset" });
      }).toThrow(/Unknown option "presetKey" in "options"/);

      expect(mockI18nCreate).not.toHaveBeenCalled();
      expect(mockPiniaCreate).not.toHaveBeenCalled();
      expect(mockMount).not.toHaveBeenCalled();
    });
  });

  describe("Using Presets", () => {
    it("should select presets independently across factory calls", () => {
      const factory = testComponentFactory(MockComponent);

      // First mount: i18n-only preset.
      factory.withOptions({ extraOptions: { presetKey: "i18nPreset" } });

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
        factory.withOptions({ extraOptions: { presetKey: "unknownPreset" } });
      }).toThrow(/unknownPreset/);

      expect(mockI18nCreate).not.toHaveBeenCalled();
      expect(mockPiniaCreate).not.toHaveBeenCalled();
      expect(mockRouterCreate).not.toHaveBeenCalled();

      expect(mockMount).not.toHaveBeenCalled();
    });

    it("should add default i18n and pinia plugins when switching to `lightweightPreset` via extraOptions", () => {
      const factory = testComponentFactory(MockComponent);

      // Switch the preset using the 4th argument
      factory.withOptions({ extraOptions: { presetKey: "lightweightPreset" } });

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
      factory.withOptions({ extraOptions: { presetKey: "i18nPreset" } });

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

      factory.withOptions({ extraOptions: { presetKey: "i18nDisabledPreset" } });

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

    it("should allow mounting without an active preset when default is not registered", () => {
      const { testComponentFactory: createFactory } = createTestFramework({
        presets: {
          custom: {
            manifest: [],
            defaults: {},
          },
        },
      });

      const factory = createFactory(MockComponent);

      expect(() => factory()).not.toThrow();

      expect(mockI18nCreate).not.toHaveBeenCalled();
      expect(mockPiniaCreate).not.toHaveBeenCalled();
      expect(mockRouterCreate).not.toHaveBeenCalled();

      expect(mockMount).toHaveBeenCalledTimes(1);

      const [, options] = mockMount.mock.calls[0];

      expect(options.global?.plugins ?? []).toHaveLength(0);
    });

    it("should restore the factory preset after a mount-level override without a registered default", async () => {
      const { presets } = await import("./utils/presets/mockPresets.js");

      const { testComponentFactory: createFactory } = createTestFramework({
        presets: {
          admin: presets.default,
          i18nOnly: presets.i18nPreset,
        },
      });

      const factory = createFactory.withOptions(() => ({
        component: MockComponent,
        presetKey: "admin",
      }));

      // No "default" is registered. The factory's admin preset is active.
      factory();
      const [, firstOptions] = mockMount.mock.calls[0];
      expect(firstOptions.global.plugins).toEqual(
        expect.arrayContaining([mockI18nInstance, mockPiniaInstance]),
      );
      expect(firstOptions.global.plugins).toHaveLength(2);

      // A mount-level selection temporarily replaces the factory preset.
      factory.withOptions({ extraOptions: { presetKey: "i18nOnly" } });
      const [, secondOptions] = mockMount.mock.calls[1];
      expect(secondOptions.global.plugins).toEqual([mockI18nInstance]);

      // The factory's selected preset is restored on the next mount.
      factory();
      const [, thirdOptions] = mockMount.mock.calls[2];
      expect(thirdOptions.global.plugins).toEqual(
        expect.arrayContaining([mockI18nInstance, mockPiniaInstance]),
      );
      expect(thirdOptions.global.plugins).toHaveLength(2);

      expect(mockI18nCreate).toHaveBeenCalledTimes(3);
      expect(mockPiniaCreate).toHaveBeenCalledTimes(2);
      expect(mockRouterCreate).not.toHaveBeenCalled();
      expect(mockMount).toHaveBeenCalledTimes(3);
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

      it("should reject unknown plugins in mountOptions for the selected preset", () => {
        const factory = testComponentFactory(MockComponent);

        expect(() => {
          factory(
            {},
            {
              plugins: {
                unknownPlugin: {},
              },
            },
            {},
            { presetKey: "i18nPreset" },
          );
        }).toThrow('Plugin "unknownPlugin" is configured but not supported by the active preset.');

        expect(mockI18nCreate).not.toHaveBeenCalled();
        expect(mockPiniaCreate).not.toHaveBeenCalled();
        expect(mockRouterCreate).not.toHaveBeenCalled();

        expect(mockMount).not.toHaveBeenCalled();
      });
    });

    describe("Factory-level Preset Selection", () => {
      it("should use the preset selected via withOptions", () => {
        const factory = testComponentFactory.withOptions(() => ({
          component: MockComponent,
          presetKey: "i18nPreset",
        }));

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
        const factory = testComponentFactory.withOptions(() => ({
          component: MockComponent,
          presetKey: "i18nPreset",
        }));

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
        const factory = testComponentFactory.withOptions(() => ({
          component: MockComponent,
          presetKey: "i18nPreset",
        }));

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
        const factory = testComponentFactory.withOptions(() => ({
          component: MockComponent,
          presetKey: "unknownPreset",
        }));

        expect(() => factory()).toThrow('Preset "unknownPreset" is not registered.');

        expect(mockI18nCreate).not.toHaveBeenCalled();
        expect(mockPiniaCreate).not.toHaveBeenCalled();
        expect(mockMount).not.toHaveBeenCalled();
      });

      it("should restore the positional factory preset after a mount-level override", () => {
        const factory = testComponentFactory(MockComponent, undefined, undefined, undefined, {
          presetKey: "i18nPreset",
        });

        // First mount: use the factory-level preset.
        factory();

        const [, firstMountOptions] = mockMount.mock.calls[0];

        expect(firstMountOptions.global.plugins).toContain(mockI18nInstance);
        expect(firstMountOptions.global.plugins).not.toContain(mockPiniaInstance);
        expect(firstMountOptions.global.plugins).toHaveLength(1);

        // Second mount: override the factory-level preset.
        factory({}, {}, {}, { presetKey: "default" });

        const [, secondMountOptions] = mockMount.mock.calls[1];

        expect(secondMountOptions.global.plugins).toContain(mockI18nInstance);
        expect(secondMountOptions.global.plugins).toContain(mockPiniaInstance);
        expect(secondMountOptions.global.plugins).toHaveLength(2);

        // Third mount: restore the factory-level preset.
        factory();

        const [, thirdMountOptions] = mockMount.mock.calls[2];

        expect(thirdMountOptions.global.plugins).toContain(mockI18nInstance);
        expect(thirdMountOptions.global.plugins).not.toContain(mockPiniaInstance);
        expect(thirdMountOptions.global.plugins).toHaveLength(1);

        // Verify plugin creation across all three mounts.
        expect(mockI18nCreate).toHaveBeenCalledTimes(3);
        expect(mockPiniaCreate).toHaveBeenCalledTimes(1);
        expect(mockRouterCreate).not.toHaveBeenCalled();

        expect(mockMount).toHaveBeenCalledTimes(3);

        // Earlier mount configurations must remain unchanged.
        expect(firstMountOptions.global.plugins).toContain(mockI18nInstance);
        expect(firstMountOptions.global.plugins).not.toContain(mockPiniaInstance);
        expect(firstMountOptions.global.plugins).toHaveLength(1);

        expect(secondMountOptions.global.plugins).toContain(mockI18nInstance);
        expect(secondMountOptions.global.plugins).toContain(mockPiniaInstance);
        expect(secondMountOptions.global.plugins).toHaveLength(2);
      });

      it("should ignore unsupported default plugins during a mount-level preset override", () => {
        const factory = testComponentFactory(
          MockComponent,
          undefined,
          () => ({
            plugins: {
              pinia: {
                stubActions: true,
              },
            },
          }),
          undefined,
          { presetKey: "default" },
        );

        // First mount: use the factory-level preset.
        factory();

        const [, firstMountOptions] = mockMount.mock.calls[0];

        expect(firstMountOptions.global.plugins).toContain(mockI18nInstance);
        expect(firstMountOptions.global.plugins).toContain(mockPiniaInstance);
        expect(firstMountOptions.global.plugins).toHaveLength(2);

        expect(mockPiniaCreate).toHaveBeenCalledTimes(1);
        expect(mockPiniaCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            stubActions: true,
          }),
        );

        // Second mount: switch to i18nPreset, which does not support Pinia.
        expect(() => {
          factory({}, {}, {}, { presetKey: "i18nPreset" });
        }).not.toThrow();

        const [, secondMountOptions] = mockMount.mock.calls[1];

        expect(secondMountOptions.global.plugins).toContain(mockI18nInstance);
        expect(secondMountOptions.global.plugins).not.toContain(mockPiniaInstance);
        expect(secondMountOptions.global.plugins).toHaveLength(1);

        // The unsupported default Pinia configuration must not initialize Pinia.
        expect(mockPiniaCreate).toHaveBeenCalledTimes(1);

        // Third mount: return to the factory-level preset.
        factory();

        const [, thirdMountOptions] = mockMount.mock.calls[2];

        expect(thirdMountOptions.global.plugins).toContain(mockI18nInstance);
        expect(thirdMountOptions.global.plugins).toContain(mockPiniaInstance);
        expect(thirdMountOptions.global.plugins).toHaveLength(2);

        expect(mockPiniaCreate).toHaveBeenCalledTimes(2);
        expect(mockI18nCreate).toHaveBeenCalledTimes(3);

        expect(mockMount).toHaveBeenCalledTimes(3);

        // Previous mount configurations must remain unchanged.
        expect(firstMountOptions.global.plugins).toHaveLength(2);
        expect(secondMountOptions.global.plugins).toHaveLength(1);
      });

      it("should reject unsupported default plugins when selecting a factory-level preset", () => {
        const factory = testComponentFactory(
          MockComponent,
          undefined,
          () => ({
            plugins: {
              pinia: {},
            },
          }),
          undefined,
          { presetKey: "i18nPreset" },
        );

        expect(() => factory()).toThrow(
          'Plugin "pinia" is configured but not supported by preset "i18nPreset".',
        );

        expect(mockI18nCreate).not.toHaveBeenCalled();
        expect(mockPiniaCreate).not.toHaveBeenCalled();
        expect(mockMount).not.toHaveBeenCalled();
      });

      it("should reject unsupported factory-default plugins without an explicit presetKey (positional API)", async () => {
        const { presets } = await import("./utils/presets/mockPresets.js");

        // The implicit default preset supports i18n but not Pinia.
        const { testComponentFactory: createFactory } = createTestFramework({
          presets: { default: presets.i18nPreset },
        });

        const factory = createFactory(MockComponent, undefined, () => ({
          plugins: {
            pinia: {},
          },
        }));

        expect(() => factory()).toThrow(/Plugin "pinia" is configured but not supported/);

        expect(mockI18nCreate).not.toHaveBeenCalled();
        expect(mockPiniaCreate).not.toHaveBeenCalled();
        expect(mockMount).not.toHaveBeenCalled();
      });

      it("should accept supported default plugins in the factory preset", () => {
        const factory = testComponentFactory(
          MockComponent,
          undefined,
          () => ({
            plugins: {
              i18n: {
                locale: "fr",
              },
            },
          }),
          undefined,
          { presetKey: "i18nPreset" },
        );

        expect(() => factory()).not.toThrow();

        expect(mockI18nCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            locale: "fr",
          }),
        );

        expect(mockPiniaCreate).not.toHaveBeenCalled();
      });

      it("should reject unsupported mountOptions plugins inherited from the factory preset", () => {
        const factory = testComponentFactory(MockComponent, undefined, undefined, undefined, {
          presetKey: "i18nPreset",
        });

        // Pinia is not supported by the factory-level preset.
        expect(() => {
          factory(
            {},
            {
              plugins: {
                pinia: {},
              },
            },
          );
        }).toThrow('Plugin "pinia" is configured but not supported by the active preset.');

        expect(mockI18nCreate).not.toHaveBeenCalled();
        expect(mockPiniaCreate).not.toHaveBeenCalled();
        expect(mockRouterCreate).not.toHaveBeenCalled();

        expect(mockMount).not.toHaveBeenCalled();
      });

      it("should reject unsupported extraOptions plugins inherited from the factory preset", () => {
        const factory = testComponentFactory(MockComponent, undefined, undefined, undefined, {
          presetKey: "i18nPreset",
        });

        expect(() => {
          factory(
            {},
            {},
            {},
            {
              plugins: {
                pinia: {},
              },
            },
          );
        }).toThrow('Plugin "pinia" is configured but not supported by the active preset.');

        expect(mockI18nCreate).not.toHaveBeenCalled();
        expect(mockPiniaCreate).not.toHaveBeenCalled();
        expect(mockRouterCreate).not.toHaveBeenCalled();

        expect(mockMount).not.toHaveBeenCalled();
      });

      it("should allow mountOptions plugins supported by the mount-level preset override", () => {
        const factory = testComponentFactory(MockComponent, undefined, undefined, undefined, {
          presetKey: "i18nPreset",
        });

        // Temporarily switch to the default preset, which supports Pinia.
        expect(() => {
          factory(
            {},
            {
              plugins: {
                pinia: {
                  stubActions: true,
                },
              },
            },
            {},
            {
              presetKey: "default",
            },
          );
        }).not.toThrow();

        expect(mockI18nCreate).toHaveBeenCalledTimes(1);
        expect(mockPiniaCreate).toHaveBeenCalledTimes(1);
        expect(mockRouterCreate).not.toHaveBeenCalled();

        expect(mockPiniaCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            stubActions: true,
          }),
        );

        const [, options] = mockMount.mock.calls[0];

        expect(options.global.plugins).toContain(mockI18nInstance);
        expect(options.global.plugins).toContain(mockPiniaInstance);
        expect(options.global.plugins).toHaveLength(2);

        expect(mockMount).toHaveBeenCalledTimes(1);
      });

      it("should reject unsupported default plugins with the object-based factory API", () => {
        const factory = testComponentFactory.withOptions(() => ({
          component: MockComponent,
          presetKey: "i18nPreset",
          defaultMountOptions: {
            plugins: {
              pinia: {},
            },
          },
        }));

        expect(() => factory()).toThrow(
          'Plugin "pinia" is configured but not supported by preset "i18nPreset".',
        );

        expect(mockI18nCreate).not.toHaveBeenCalled();
        expect(mockPiniaCreate).not.toHaveBeenCalled();

        expect(mockMount).not.toHaveBeenCalled();
      });

      it("should reject unsupported factory-default plugins without an explicit presetKey (object API)", async () => {
        const { presets } = await import("./utils/presets/mockPresets.js");

        // The implicit default preset supports i18n but not Pinia.
        const { testComponentFactory: createFactory } = createTestFramework({
          presets: { default: presets.i18nPreset },
        });

        const factory = createFactory.withOptions(() => ({
          component: MockComponent,
          defaultMountOptions: {
            plugins: {
              pinia: {},
            },
          },
        }));

        expect(() => factory()).toThrow(/Plugin "pinia" is configured but not supported/);

        expect(mockI18nCreate).not.toHaveBeenCalled();
        expect(mockPiniaCreate).not.toHaveBeenCalled();
        expect(mockMount).not.toHaveBeenCalled();
      });

      it("should reject mountOptions plugins unsupported by the mount-level preset override", () => {
        const factory = testComponentFactory(MockComponent, undefined, undefined, undefined, {
          presetKey: "default",
        });

        // Pinia is supported by the factory preset,
        // but not by the mount-level preset.
        expect(() => {
          factory(
            {},
            {
              plugins: {
                pinia: {},
              },
            },
            {},
            { presetKey: "i18nPreset" },
          );
        }).toThrow('Plugin "pinia" is configured but not supported by the active preset.');

        expect(mockI18nCreate).not.toHaveBeenCalled();
        expect(mockPiniaCreate).not.toHaveBeenCalled();
        expect(mockRouterCreate).not.toHaveBeenCalled();

        expect(mockMount).not.toHaveBeenCalled();
      });

      it("should reject extraOptions plugins unsupported by the mount-level preset override", () => {
        const factory = testComponentFactory(MockComponent, undefined, undefined, undefined, {
          presetKey: "default",
        });

        // Pinia is supported by the factory preset,
        // but not by the mount-level preset.
        expect(() => {
          factory.withOptions({
            extraOptions: {
              presetKey: "i18nPreset",
              plugins: {
                pinia: {},
              },
            },
          });
        }).toThrow('Plugin "pinia" is configured but not supported by the active preset.');

        expect(mockI18nCreate).not.toHaveBeenCalled();
        expect(mockPiniaCreate).not.toHaveBeenCalled();
        expect(mockRouterCreate).not.toHaveBeenCalled();

        expect(mockMount).not.toHaveBeenCalled();
      });
    });
  });
});
