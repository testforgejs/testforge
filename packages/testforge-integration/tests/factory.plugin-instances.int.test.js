import { setupFactoryTestContext } from "./utils/setupFactoryTestContext.js";

const runner = typeof vi !== "undefined" ? vi : jest;

describe("Plugin Instances Integration", () => {
  let ctx;

  beforeEach(async () => {
    ctx = await setupFactoryTestContext(runner);
  });

  describe("Instance Exposing", () => {
    it("should reject instance capture in defaultMountOptions", () => {
      const { MockComponent, testComponentFactory, captureInstance, mockMount } = ctx;
      const capture = captureInstance();

      const factory = testComponentFactory(MockComponent, undefined, () => ({
        plugins: {
          pinia: {
            ...capture,
          },
        },
      }));

      expect(() => factory()).toThrow(
        "Instance capture is not allowed in defaultMountOptions.plugins.pinia.",
      );

      expect(capture.instance).toBeUndefined();
      expect(mockMount).not.toHaveBeenCalled();
    });

    it("should capture the created plugin instance when captureInstance is provided in mountOptions", () => {
      const { MockComponent, testComponentFactory, captureInstance, mockMount } = ctx;
      const capture = captureInstance();

      const factory = testComponentFactory(MockComponent);

      factory(
        {},
        {
          plugins: {
            pinia: {
              ...capture,
            },
          },
        },
      );

      const [, options] = mockMount.mock.calls[0];
      expect(capture.instance).toBeDefined();
      expect(typeof capture.instance.install).toBe("function");
      expect(options.global.plugins).toContain(capture.instance);
    });

    it("should capture the created plugin instance when captureInstance is provided in extraOptions", () => {
      const { MockComponent, testComponentFactory, captureInstance, mockMount } = ctx;
      const capture = captureInstance();

      const factory = testComponentFactory(MockComponent);

      factory(
        {},
        {},
        {},
        {
          plugins: {
            pinia: {
              ...capture,
            },
          },
        },
      );

      const [, options] = mockMount.mock.calls[0];
      expect(capture.instance).toBeDefined();
      expect(typeof capture.instance.install).toBe("function");
      expect(options.global.plugins).toContain(capture.instance);
    });

    it("should reject default instance capture even when overridden by mountOptions", () => {
      const { MockComponent, testComponentFactory, captureInstance, mockMount } = ctx;
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
                  users: [],
                },
              },
            },
          },
        ),
      ).toThrow("Instance capture is not allowed in defaultMountOptions.plugins.pinia.");

      expect(capture.instance).toBeUndefined();
      expect(mockMount).not.toHaveBeenCalled();
    });

    it("should reject instance capture in defaultMountOptions even when skipDefaultOptions is true", () => {
      const { MockComponent, testComponentFactory, captureInstance, mockMount } = ctx;
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
          {},
          {},
          {
            skipDefaultOptions: true,
          },
        ),
      ).toThrow("Instance capture is not allowed in defaultMountOptions.plugins.pinia.");

      expect(capture.instance).toBeUndefined();
      expect(mockMount).not.toHaveBeenCalled();
    });

    it("should not pass instance capture options to the underlying plugin factory", () => {
      const {
        MockComponent,
        createTestFramework,
        createPluginInstance,
        captureInstance,
        mockMount,
      } = ctx;
      const pluginInstance = {
        install() {},
      };
      const nativePluginFactory = runner.fn(() => pluginInstance);
      const testPlugin = {
        getName: () => "testPlugin",
        getDefinition: () => ({
          create: (options) => createPluginInstance(nativePluginFactory, options),
        }),
      };
      const { testComponentFactory: createFactory } = createTestFramework({
        preset: {
          manifest: [{ module: testPlugin, enabled: true }],
          defaults: {},
        },
      });

      const capture = captureInstance();

      const pluginOptions = {
        nativeOption: "value",
        ...capture,
      };

      // The configuration contains the native option and internal capture callback.
      expect(Reflect.ownKeys(pluginOptions)).toHaveLength(2);

      const factory = createFactory(MockComponent);
      factory(
        {},
        {
          plugins: {
            testPlugin: pluginOptions,
          },
        },
      );

      expect(nativePluginFactory).toHaveBeenCalledTimes(1);
      expect(capture.instance).toBe(pluginInstance);
      const [nativeOptions] = nativePluginFactory.mock.calls[0];
      expect(nativeOptions.nativeOption).toBe("value");
      expect(Reflect.ownKeys(nativeOptions)).toEqual(["nativeOption"]);
      const [, mountOptions] = mockMount.mock.calls[0];
      expect(mountOptions.global.plugins).toContain(pluginInstance);
    });

    it("should preserve native expose option without invoking it as a capture callback", () => {
      const { MockComponent, createTestFramework, createPluginInstance, captureInstance } = ctx;
      const pluginInstance = {
        install() {},
      };
      const nativePluginFactory = runner.fn(() => pluginInstance);
      const nativeExpose = runner.fn();
      const testPlugin = {
        getName: () => "testPlugin",
        getDefinition: () => ({
          create: (options) => createPluginInstance(nativePluginFactory, options),
        }),
      };
      const { testComponentFactory: createFactory } = createTestFramework({
        preset: {
          manifest: [{ module: testPlugin, enabled: true }],
          defaults: {},
        },
      });
      const capture = captureInstance();

      const factory = createFactory(MockComponent);
      factory(
        {},
        {
          plugins: {
            testPlugin: {
              expose: nativeExpose,
              ...capture,
            },
          },
        },
      );

      const [nativeOptions] = nativePluginFactory.mock.calls[0];
      expect(nativeOptions.expose).toBe(nativeExpose);
      expect(nativeExpose).not.toHaveBeenCalled();
      expect(capture.instance).toBe(pluginInstance);
    });

    it("should capture multiple plugin instances independently within a single mount", () => {
      const { MockComponent, testComponentFactory, captureInstance, mockMount } = ctx;

      const piniaCapture = captureInstance();
      const routerCapture = captureInstance();

      const factory = testComponentFactory(MockComponent);

      factory(
        {},
        {
          plugins: {
            pinia: { ...piniaCapture },
            router: { ...routerCapture },
          },
        },
      );

      expect(piniaCapture.instance).toBeDefined();
      expect(routerCapture.instance).toBeDefined();
      expect(piniaCapture.instance).not.toBe(routerCapture.instance);

      const [, mountOptions] = mockMount.mock.calls[0];

      expect(mountOptions.global.plugins).toContain(piniaCapture.instance);
      expect(mountOptions.global.plugins).toContain(routerCapture.instance);
    });
  });

  describe("withPluginInstance", () => {
    it("should reuse the provided plugin instance", () => {
      const { MockComponent, testComponentFactory, mockMount, withPluginInstance } = ctx;
      const providedPinia = {
        id: "Mock Pinia Instance",
        install() {},
      };
      const factory = testComponentFactory(MockComponent);

      factory(
        {},
        {},
        {},
        {
          plugins: {
            pinia: {
              ...withPluginInstance(providedPinia),
            },
          },
        },
      );

      const [, options] = mockMount.mock.calls[0];
      expect(options.global.plugins).toContain(providedPinia);
    });

    it("should expose the reused instance through captureInstance", () => {
      const { MockComponent, testComponentFactory, captureInstance, withPluginInstance } = ctx;
      const providedPinia = {
        id: "Mock Pinia Instance",
        install() {},
      };
      const capture = captureInstance();

      const factory = testComponentFactory(MockComponent);

      factory(
        {},
        {
          plugins: {
            pinia: {
              ...capture,
            },
          },
        },
        {},
        {
          plugins: {
            pinia: {
              ...withPluginInstance(providedPinia),
            },
          },
        },
      );

      expect(capture.instance).toBe(providedPinia);
    });

    it("should skip native instance creation when an instance is provided", () => {
      const {
        MockComponent,
        createTestFramework,
        createPluginInstance,
        mockMount,
        withPluginInstance,
      } = ctx;

      const providedInstance = {
        id: "shared-instance",
        install() {},
      };

      const nativePluginFactory = runner.fn(() => ({
        id: "new-instance",
        install() {},
      }));

      const testPlugin = {
        getName: () => "testPlugin",
        getDefinition: () => ({
          create: (options) => createPluginInstance(nativePluginFactory, options),
        }),
      };

      const { testComponentFactory } = createTestFramework({
        preset: {
          manifest: [{ module: testPlugin, enabled: true }],
          defaults: {},
        },
      });

      const factory = testComponentFactory(MockComponent);

      factory(
        {},
        {
          plugins: {
            testPlugin: {
              nativeOption: "ignored",
            },
          },
        },
        {},
        {
          plugins: {
            testPlugin: {
              ...withPluginInstance(providedInstance),
            },
          },
        },
      );

      expect(nativePluginFactory).not.toHaveBeenCalled();

      const [, mountOptions] = mockMount.mock.calls[0];

      expect(mountOptions.global.plugins).toContain(providedInstance);
    });

    it("should apply withMockStores to a reused Pinia instance", async () => {
      // Arrange
      const { MockComponent, testComponentFactory, mockMount, withPluginInstance } = ctx;

      const { createTestingPinia } = await import("@pinia/testing");
      const { withMockStores } = await import("@testforgejs/vue-test-plugin-pinia");

      const existingPinia = createTestingPinia({
        createSpy: runner.fn,
      });

      const mockStores = runner.fn();

      const factory = testComponentFactory(MockComponent);

      // Act
      factory(
        {},
        {
          plugins: {
            pinia: {
              ...withMockStores(mockStores),
            },
          },
        },
        {},
        {
          plugins: {
            pinia: {
              ...withPluginInstance(existingPinia),
            },
          },
        },
      );

      // Assert
      expect(mockStores).toHaveBeenCalledTimes(1);
      expect(mockStores).toHaveBeenCalledWith(existingPinia);

      const [, mountOptions] = mockMount.mock.calls[0];

      expect(mountOptions.global.plugins).toContain(existingPinia);
    });

    describe("Configuration Layers and Precedence", () => {
      const createInstance = (id) => ({
        id,
        install() {},
      });

      const getInstalledPlugins = (mockMount, callIndex = 0) => {
        const [, mountOptions] = mockMount.mock.calls[callIndex];
        return mountOptions.global.plugins;
      };

      it("should reuse an instance provided via mountOptions", () => {
        const { MockComponent, testComponentFactory, mockMount, withPluginInstance } = ctx;

        const instance = createInstance("mount-instance");
        const factory = testComponentFactory(MockComponent);

        factory(
          {},
          {
            plugins: {
              pinia: {
                ...withPluginInstance(instance),
              },
            },
          },
        );

        const plugins = getInstalledPlugins(mockMount);

        expect(plugins).toContain(instance);
      });

      it("should reuse an instance provided via defaultMountOptions", () => {
        const { MockComponent, testComponentFactory, mockMount, withPluginInstance } = ctx;

        const instance = createInstance("default-instance");

        const factory = testComponentFactory(MockComponent, undefined, () => ({
          plugins: {
            pinia: {
              ...withPluginInstance(instance),
            },
          },
        }));

        factory();
        factory();

        expect(mockMount).toHaveBeenCalledTimes(2);

        expect(getInstalledPlugins(mockMount, 0)).toContain(instance);
        expect(getInstalledPlugins(mockMount, 1)).toContain(instance);
      });

      it("should prefer a mountOptions instance over a defaultMountOptions instance", () => {
        const { MockComponent, testComponentFactory, mockMount, withPluginInstance } = ctx;

        const defaultInstance = createInstance("default-instance");
        const mountInstance = createInstance("mount-instance");

        const factory = testComponentFactory(MockComponent, undefined, () => ({
          plugins: {
            pinia: {
              ...withPluginInstance(defaultInstance),
            },
          },
        }));

        factory(
          {},
          {
            plugins: {
              pinia: {
                ...withPluginInstance(mountInstance),
              },
            },
          },
        );

        const plugins = getInstalledPlugins(mockMount);

        expect(plugins).toContain(mountInstance);
        expect(plugins).not.toContain(defaultInstance);
      });

      it("should prefer an extraOptions instance over a defaultMountOptions instance", () => {
        const { MockComponent, testComponentFactory, mockMount, withPluginInstance } = ctx;

        const defaultInstance = createInstance("default-instance");
        const extraInstance = createInstance("extra-instance");

        const factory = testComponentFactory(MockComponent, undefined, () => ({
          plugins: {
            pinia: {
              ...withPluginInstance(defaultInstance),
            },
          },
        }));

        factory(
          {},
          {},
          {},
          {
            plugins: {
              pinia: {
                ...withPluginInstance(extraInstance),
              },
            },
          },
        );

        const plugins = getInstalledPlugins(mockMount);

        expect(plugins).toContain(extraInstance);
        expect(plugins).not.toContain(defaultInstance);
      });

      it("should give extraOptions instance precedence over all previous layers", () => {
        const { MockComponent, testComponentFactory, mockMount, withPluginInstance } = ctx;

        const defaultInstance = createInstance("default-instance");
        const mountInstance = createInstance("mount-instance");
        const extraInstance = createInstance("extra-instance");

        const factory = testComponentFactory(MockComponent, undefined, () => ({
          plugins: {
            pinia: {
              ...withPluginInstance(defaultInstance),
            },
          },
        }));

        factory(
          {},
          {
            plugins: {
              pinia: {
                ...withPluginInstance(mountInstance),
              },
            },
          },
          {},
          {
            plugins: {
              pinia: {
                ...withPluginInstance(extraInstance),
              },
            },
          },
        );

        const plugins = getInstalledPlugins(mockMount);

        expect(plugins).toContain(extraInstance);
        expect(plugins).not.toContain(defaultInstance);
        expect(plugins).not.toContain(mountInstance);
      });

      it("should replace a default instance with native configuration from mountOptions", () => {
        const {
          MockComponent,
          createTestFramework,
          createPluginInstance,
          mockMount,
          withPluginInstance,
        } = ctx;

        const defaultInstance = createInstance("default-instance");
        const createdInstance = createInstance("created-instance");

        const nativePluginFactory = runner.fn(() => createdInstance);

        const testPlugin = {
          getName: () => "testPlugin",
          getDefinition: () => ({
            create: (options) => createPluginInstance(nativePluginFactory, options),
          }),
        };

        const { testComponentFactory } = createTestFramework({
          preset: {
            manifest: [{ module: testPlugin, enabled: true }],
            defaults: {},
          },
        });

        const factory = testComponentFactory(MockComponent, undefined, () => ({
          plugins: {
            testPlugin: {
              ...withPluginInstance(defaultInstance),
            },
          },
        }));

        factory(
          {},
          {
            plugins: {
              testPlugin: {
                nativeOption: "mount-value",
              },
            },
          },
        );

        expect(nativePluginFactory).toHaveBeenCalledTimes(1);
        expect(nativePluginFactory).toHaveBeenCalledWith(
          expect.objectContaining({
            nativeOption: "mount-value",
          }),
        );

        const plugins = getInstalledPlugins(mockMount);

        expect(plugins).toContain(createdInstance);
        expect(plugins).not.toContain(defaultInstance);
      });

      it("should disable a default instance when mountOptions specifies false", () => {
        const { MockComponent, testComponentFactory, mockMount, withPluginInstance } = ctx;

        const defaultInstance = createInstance("default-instance");

        const factory = testComponentFactory(MockComponent, undefined, () => ({
          plugins: {
            pinia: {
              ...withPluginInstance(defaultInstance),
            },
          },
        }));

        factory(
          {},
          {
            plugins: {
              pinia: false,
            },
          },
        );

        const plugins = getInstalledPlugins(mockMount);

        expect(plugins).not.toContain(defaultInstance);
        expect(plugins).toHaveLength(1);
      });

      it("should disable a default instance when extraOptions specifies false", () => {
        const { MockComponent, testComponentFactory, mockMount, withPluginInstance } = ctx;

        const defaultInstance = createInstance("default-instance");

        const factory = testComponentFactory(MockComponent, undefined, () => ({
          plugins: {
            pinia: {
              ...withPluginInstance(defaultInstance),
            },
          },
        }));

        factory(
          {},
          {},
          {},
          {
            plugins: {
              pinia: false,
            },
          },
        );

        const plugins = getInstalledPlugins(mockMount);

        expect(plugins).not.toContain(defaultInstance);
        expect(plugins).toHaveLength(1);
      });

      it("should preserve the default instance across independent factory calls", () => {
        const { MockComponent, testComponentFactory, mockMount, withPluginInstance } = ctx;

        const defaultInstance = createInstance("default-instance");
        const overrideInstance = createInstance("override-instance");

        const factory = testComponentFactory(MockComponent, undefined, () => ({
          plugins: {
            pinia: {
              ...withPluginInstance(defaultInstance),
            },
          },
        }));

        // First mount uses the default instance.
        factory();

        // Second mount overrides the default instance.
        factory(
          {},
          {
            plugins: {
              pinia: {
                ...withPluginInstance(overrideInstance),
              },
            },
          },
        );

        // Third mount should use the original default instance again.
        factory();

        expect(mockMount).toHaveBeenCalledTimes(3);

        const firstPlugins = getInstalledPlugins(mockMount, 0);
        const secondPlugins = getInstalledPlugins(mockMount, 1);
        const thirdPlugins = getInstalledPlugins(mockMount, 2);

        expect(firstPlugins).toContain(defaultInstance);
        expect(secondPlugins).toContain(overrideInstance);
        expect(secondPlugins).not.toContain(defaultInstance);
        expect(thirdPlugins).toContain(defaultInstance);
        expect(thirdPlugins).not.toContain(overrideInstance);
      });

      it("should preserve a default instance when extraOptions provides native options", () => {
        const { MockComponent, testComponentFactory, mockMount, withPluginInstance } = ctx;

        const defaultInstance = {
          id: "default-instance",
          install() {},
        };

        const factory = testComponentFactory(MockComponent, undefined, () => ({
          plugins: {
            pinia: {
              ...withPluginInstance(defaultInstance),
            },
          },
        }));

        factory(
          {},
          {},
          {},
          {
            plugins: {
              pinia: {
                stubActions: false,
              },
            },
          },
        );

        const [, mountOptions] = mockMount.mock.calls[0];

        expect(mountOptions.global.plugins).toContain(defaultInstance);
      });
    });
  });

  describe("Runtime Isolation", () => {
    it("should create an independent router history for each factory call", () => {
      const { MockComponent, testComponentFactory, captureInstance } = ctx;
      const firstCapture = captureInstance();
      const secondCapture = captureInstance();
      const factory = testComponentFactory(MockComponent);

      factory(
        {},
        {
          plugins: {
            router: {
              ...firstCapture,
            },
          },
        },
      );
      factory(
        {},
        {
          plugins: {
            router: {
              ...secondCapture,
            },
          },
        },
      );

      expect(firstCapture.instance).toBeDefined();
      expect(secondCapture.instance).toBeDefined();
      expect(firstCapture.instance).not.toBe(secondCapture.instance);
      const firstRouterHistory = firstCapture.instance.options.history;
      const secondRouterHistory = secondCapture.instance.options.history;
      expect(firstRouterHistory).not.toBe(secondRouterHistory);
    });

    it("should create independent Pinia state for each factory call", () => {
      const { MockComponent, testComponentFactory, captureInstance } = ctx;
      const firstCapture = captureInstance();
      const secondCapture = captureInstance();
      const factory = testComponentFactory(MockComponent);

      factory(
        {},
        {
          plugins: {
            pinia: {
              ...firstCapture,
            },
          },
        },
      );
      factory(
        {},
        {
          plugins: {
            pinia: {
              ...secondCapture,
            },
          },
        },
      );

      expect(firstCapture.instance).toBeDefined();
      expect(secondCapture.instance).toBeDefined();
      expect(firstCapture.instance).not.toBe(secondCapture.instance);
      const firstState = firstCapture.instance.state.value;
      const secondState = secondCapture.instance.state.value;
      expect(firstState).not.toBe(secondState);
    });

    it("should create independent I18n messages for each factory call", () => {
      const { MockComponent, testComponentFactory, captureInstance } = ctx;
      const firstCapture = captureInstance();
      const secondCapture = captureInstance();
      const factory = testComponentFactory(MockComponent);

      factory(
        {},
        {
          plugins: {
            i18n: {
              ...firstCapture,
            },
          },
        },
      );
      factory(
        {},
        {
          plugins: {
            i18n: {
              ...secondCapture,
            },
          },
        },
      );

      expect(firstCapture.instance).toBeDefined();
      expect(secondCapture.instance).toBeDefined();
      expect(firstCapture.instance).not.toBe(secondCapture.instance);
      const firstMessages = firstCapture.instance.global.messages.value;
      const secondMessages = secondCapture.instance.global.messages.value;
      expect(firstMessages).not.toBe(secondMessages);
    });
  });
});
