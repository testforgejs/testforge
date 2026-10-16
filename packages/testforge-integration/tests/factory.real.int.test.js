/** @jest-environment jsdom */
// @vitest-environment jsdom
const runner = typeof vi !== "undefined" ? vi : jest;

// 1. Use hoisted to prepare data before mocks are injected (Vitest only)
// In Jest, this will simply be executed in order.
const mocks = {
  mount: runner.fn(),
  shallowMount: runner.fn(),
  i18nCreate: runner.fn(),
  piniaCreate: runner.fn(),
  routerCreate: runner.fn(),
};

// 2. Top-level mocking
// This ensures that any imports within the project will receive exactly these mocks
runner.doMock("@vue/test-utils", () => ({
  __esModule: true,
  mount: mocks.mount,
  shallowMount: mocks.shallowMount,
}));

// 3. Use the same approach for plugins
runner.doMock("@testforgejs/vue-test-plugin-i18n", () => ({
  i18nPlugin: {
    getName: () => "i18n",
    getDefinition: () => ({ create: mocks.i18nCreate }),
  },
}));

runner.doMock("@testforgejs/vue-test-plugin-pinia", () => ({
  piniaPlugin: {
    getName: () => "pinia",
    getDefinition: () => ({ create: mocks.piniaCreate }),
  },
}));

runner.doMock("@testforgejs/vue-test-plugin-router", () => ({
  routerPlugin: {
    getName: () => "router",
    getDefinition: () => ({ create: mocks.routerCreate }),
  },
}));

describe("testComponentFactory Integration (Expose Instance)", () => {
  const MockComponent = { name: "MockComponent", render: () => null };
  let testComponentFactory;
  let captureInstance;

  beforeEach(async () => {
    runner.clearAllMocks();
    // DO NOT call `resetModules` to avoid losing the module-level `doMock`

    // Loading actual implementations for proxying
    let actualI18n, actualPinia, actualRouter;
    if (typeof vi !== "undefined") {
      actualI18n = await vi.importActual("@testforgejs/vue-test-plugin-i18n");
      actualPinia = await vi.importActual("@testforgejs/vue-test-plugin-pinia");
      actualRouter = await vi.importActual("@testforgejs/vue-test-plugin-router");
    } else {
      actualI18n = jest.requireActual("@testforgejs/vue-test-plugin-i18n");
      actualPinia = jest.requireActual("@testforgejs/vue-test-plugin-pinia");
      actualRouter = jest.requireActual("@testforgejs/vue-test-plugin-router");
    }

    // Customizing spy behavior using custom code
    mocks.i18nCreate.mockImplementation(actualI18n.i18nPlugin.getDefinition().create);
    mocks.piniaCreate.mockImplementation(actualPinia.piniaPlugin.getDefinition().create);
    mocks.routerCreate.mockImplementation(actualRouter.routerPlugin.getDefinition().create);
    mocks.shallowMount.mockReturnValue({
      unmount: runner.fn(),
      vm: {},
      element: {},
    });

    const core = await import("@testforgejs/vue-test-core");

    const { presets } = await import("./utils/presets/mockPresets.js");
    testComponentFactory = core.createTestFramework({
      presets,
    }).testComponentFactory;

    captureInstance = core.captureInstance;
  });

  describe("Instance Capturing", () => {
    it("should capture real plugin instances and pass them to Vue Test Utils", () => {
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
          pinia: {
            ...piniaCapture,
          },
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

      const factory = testComponentFactory(MockComponent, {}, BASE_MOUNT_OPTIONS);

      factory();

      // Verify that native plugin factories were called
      expect(mocks.i18nCreate).toHaveBeenCalledTimes(1);
      expect(mocks.piniaCreate).toHaveBeenCalledTimes(1);
      expect(mocks.routerCreate).toHaveBeenCalledTimes(1);

      // Verify that captureInstance received the actual created instances
      expect(mocks.i18nCreate.mock.results[0].value).toBe(i18nCapture.instance);
      expect(mocks.piniaCreate.mock.results[0].value).toBe(piniaCapture.instance);
      expect(mocks.routerCreate.mock.results[0].value).toBe(routerCapture.instance);

      // Verify that captured instances are real plugin instances
      expect(i18nCapture.instance.mode).toBe("composition");
      expect(typeof piniaCapture.instance.install).toBe("function");
      expect(typeof routerCapture.instance.resolve).toBe("function");

      // Verify that Vue Test Utils received all captured instances
      expect(mocks.mount).toHaveBeenCalledTimes(1);

      const [, options] = mocks.mount.mock.calls[0];

      expect(options.global.plugins).toContain(i18nCapture.instance);
      expect(options.global.plugins).toContain(piniaCapture.instance);
      expect(options.global.plugins).toContain(routerCapture.instance);
      expect(options.global.plugins).toHaveLength(3);
    });
  });
});
