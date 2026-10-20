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

  describe("__meta.instance", () => {
    it("should reuse the provided plugin instance when __meta.instance is provided", () => {
      const { MockComponent, testComponentFactory, mockMount } = ctx;
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
              __meta: {
                instance: providedPinia,
              },
            },
          },
        },
      );

      const [, options] = mockMount.mock.calls[0];
      expect(options.global.plugins).toContain(providedPinia);
    });

    it("should expose the reused plugin instance through captureInstance when it is provided via __meta.instance", () => {
      const { MockComponent, testComponentFactory, captureInstance } = ctx;
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
              __meta: {
                instance: providedPinia,
              },
            },
          },
        },
      );

      expect(capture.instance).toBe(providedPinia);
    });

    it("should prioritize __meta.instance over native plugin options", () => {
      const { MockComponent, createTestFramework, createPluginInstance, mockMount } = ctx;

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
              __meta: {
                instance: providedInstance,
              },
            },
          },
        },
      );

      expect(nativePluginFactory).not.toHaveBeenCalled();

      const [, mountOptions] = mockMount.mock.calls[0];

      expect(mountOptions.global.plugins).toContain(providedInstance);
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
