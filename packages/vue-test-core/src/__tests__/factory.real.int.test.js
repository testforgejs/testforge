/** @jest-environment jsdom */
// @vitest-environment jsdom
import { captureInstance } from "../utils/captureInstance";

const runner = typeof vi !== "undefined" ? vi : jest;

// 1. Use hoisted to prepare data before mocks are injected (Vitest only)
// In Jest, this will simply be executed in order.
const mocks = {
  shallowMount: runner.fn(),
  i18nCreate: runner.fn(),
  piniaCreate: runner.fn(),
  routerCreate: runner.fn(),
};

// 2. Top-level mocking
// This ensures that any imports within the project will receive exactly these mocks
runner.doMock("@vue/test-utils", () => ({
  __esModule: true,
  mount: runner.fn(),
  shallowMount: mocks.shallowMount,
}));

// 3. Use the same approach for plugins
runner.doMock("@testforge/vue-test-plugin-i18n", () => ({
  i18nPlugin: {
    getName: () => "i18n",
    getDefinition: () => ({ create: mocks.i18nCreate }),
  },
}));

runner.doMock("@testforge/vue-test-plugin-pinia", () => ({
  piniaPlugin: {
    getName: () => "pinia",
    getDefinition: () => ({ create: mocks.piniaCreate }),
  },
}));

runner.doMock("@testforge/vue-test-plugin-router", () => ({
  routerPlugin: {
    getName: () => "router",
    getDefinition: () => ({ create: mocks.routerCreate }),
  },
}));

describe("testComponentFactory Integration (Expose Instance)", () => {
  const MockComponent = { name: "MockComponent", render: () => null };
  let testFactory;

  beforeEach(async () => {
    runner.clearAllMocks();
    // DO NOT call `resetModules` to avoid losing the module-level `doMock`

    // Loading actual implementations for proxying
    let actualI18n, actualPinia, actualRouter;
    if (typeof vi !== "undefined") {
      actualI18n = await vi.importActual("@testforge/vue-test-plugin-i18n");
      actualPinia = await vi.importActual("@testforge/vue-test-plugin-pinia");
      actualRouter = await vi.importActual("@testforge/vue-test-plugin-router");
    } else {
      actualI18n = jest.requireActual("@testforge/vue-test-plugin-i18n");
      actualPinia = jest.requireActual("@testforge/vue-test-plugin-pinia");
      actualRouter = jest.requireActual("@testforge/vue-test-plugin-router");
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

    const { createTestFramework } = await import("../index");
    const { presets } = await import("./utils/mockPresets.js");
    testFactory = createTestFramework({ presets }).testComponentFactory;
  });

  describe("Expose Instance", () => {
    it("should provide access to plugin instances via expose callback", () => {
      let capturedI18n;
      let capturedPinia;
      let capturedRouter;

      const BASE_MOUNT_OPTIONS = {
        plugins: {
          i18n: {
            locale: "en",
            messages: {},
            expose: (instance) => {
              capturedI18n = instance;
            },
          },
          pinia: {
            expose: (instance) => {
              capturedPinia = instance;
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
              capturedRouter = instance;
            },
          },
        },
      };

      const factory = testFactory(MockComponent, {}, BASE_MOUNT_OPTIONS);

      factory();

      // 2. Verify the connection using mock spies (check what the `create` call returned)
      // В The results of Jest/Vitest calls are stored in mock.results
      expect(mocks.i18nCreate.mock.results[0].value).toBe(capturedI18n);
      expect(mocks.piniaCreate.mock.results[0].value).toBe(capturedPinia);
      expect(mocks.routerCreate.mock.results[0].value).toBe(capturedRouter);

      // Verify that these are real instances (for example, by checking for characteristic properties)
      expect(capturedI18n.mode).toBe("composition");
      expect(typeof capturedPinia.install).toBe("function");

      // Verifying synchronization with Vue Test Utils
      const [, options] = mocks.shallowMount.mock.calls[0];
      expect(options.global.plugins).toContain(capturedI18n);
      expect(options.global.plugins).toContain(capturedPinia);
      expect(options.global.plugins).toContain(capturedRouter);
    });

    it("should capture plugin instances using captureInstance helper", () => {
      // 1. Creating Real Captures
      const i18nCapture = captureInstance();
      const piniaCapture = captureInstance();
      const routerCapture = captureInstance();

      const BASE_MOUNT_OPTIONS = {
        plugins: {
          i18n: {
            locale: "en",
            messages: {},
            ...i18nCapture, // Pass to the actual plugin
          },
          pinia: {
            ...piniaCapture,
          },
          router: {
            routes: [{ path: "/", component: { render: () => null } }],
            ...routerCapture,
          },
        },
      };

      const factory = testFactory(MockComponent, {}, BASE_MOUNT_OPTIONS);
      factory();

      // 2. Verify the connection using mock spies (verify the return value of the `create` call)
      // In Jest/Vitest, the results of the calls are stored in `mock.results`
      expect(mocks.i18nCreate.mock.results[0].value).toBe(i18nCapture.instance);
      expect(mocks.piniaCreate.mock.results[0].value).toBe(piniaCapture.instance);
      expect(mocks.routerCreate.mock.results[0].value).toBe(routerCapture.instance);

      // 3. Additional guarantee: instances must be actual plugin objects
      expect(i18nCapture.instance.mode).toBe("composition");
      expect(typeof routerCapture.instance.resolve).toBe("function");

      // Checking the mock call
      expect(mocks.shallowMount).toHaveBeenCalled();

      // 4. Verify that these captured instances were added to the final shallowMount
      const [, options] = mocks.shallowMount.mock.calls[0];
      expect(options.global.plugins).toContain(i18nCapture.instance);
      expect(options.global.plugins).toContain(piniaCapture.instance);
      expect(options.global.plugins).toContain(routerCapture.instance);
      expect(options.global.plugins).toHaveLength(3);
    });
  });
});
