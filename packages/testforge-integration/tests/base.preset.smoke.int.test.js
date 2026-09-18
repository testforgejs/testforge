const runner = typeof vi !== "undefined" ? vi : jest;

describe("base preset smoke", () => {
  const MockComponent = { name: "MockComponent", render: () => null };

  let mockMount;
  let mockShallowMount;
  let testComponentFactory;

  let createTestFramework;

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

  const createFactory = async () => {
    const { presets } = await import("@testforgejs/vue-test-preset-base");

    return createTestFramework({
      presets,
    }).testComponentFactory;
  };

  // Mock plugin creation while preserving the public plugin contract.
  const createMockPlugin = (name, create, defaultOptions) => ({
    getName: () => name,
    getDefinition: () => ({ create }),
    getDefaultOptions: () => () => defaultOptions,
  });

  runner.doMock("@testforgejs/vue-test-plugin-i18n", () => ({
    i18nPlugin: createMockPlugin("i18n", mockI18nCreate, {
      legacy: false,
      locale: "en",
      fallbackLocale: "en",
      messages: {},
      fallbackWarn: false,
      missingWarn: false,
    }),
  }));

  runner.doMock("@testforgejs/vue-test-plugin-pinia", () => ({
    piniaPlugin: createMockPlugin("pinia", mockPiniaCreate, {
      initialState: {},
      stubActions: false,
    }),
  }));

  runner.doMock("@testforgejs/vue-test-plugin-router", () => ({
    routerPlugin: createMockPlugin("router", mockRouterCreate, {
      history: {},
      routes: [{ path: "/", component: { render: () => null } }],
    }),
  }));

  beforeEach(async () => {
    runner.resetModules();
    runner.clearAllMocks();

    // Setting default return values
    mockI18nCreate.mockReturnValue(mockI18nInstance);
    mockPiniaCreate.mockReturnValue(mockPiniaInstance);
    mockRouterCreate.mockReturnValue(mockRouterInstance);

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
      shallowMount: mockShallowMount, // mockShallowMount must be created in advance using runner.fn()
    }));

    const core = await import("@testforgejs/vue-test-core");
    createTestFramework = core.createTestFramework;

    // Initializing the framework
    testComponentFactory = await createFactory();
  });

  it("should initialize the test component factory", () => {
    const factory = testComponentFactory(MockComponent);
    expect(() => factory()).not.toThrow();
  });

  it("should create default i18n and pinia plugins", () => {
    const factory = testComponentFactory(MockComponent);
    factory();

    expect(mockI18nCreate).toHaveBeenCalledWith(expect.objectContaining({ locale: "en" }));
    expect(mockPiniaCreate).toHaveBeenCalledTimes(1);
    expect(mockRouterCreate).not.toHaveBeenCalled();
  });

  it("should add default plugin instances to mount options", () => {
    const factory = testComponentFactory(MockComponent);
    factory();

    const [, options] = mockMount.mock.calls[0];

    expect(options.global.plugins).toContain(mockI18nInstance);
    expect(options.global.plugins).toContain(mockPiniaInstance);
    expect(options.global.plugins).toHaveLength(2);
  });

  it("should override default plugin options", () => {
    const factory = testComponentFactory(MockComponent);
    factory({}, { plugins: { i18n: { locale: "uk" } } });

    expect(mockI18nCreate).toHaveBeenCalledWith(expect.objectContaining({ locale: "uk" }));
  });

  it("should enable a plugin disabled by default", () => {
    const factory = testComponentFactory(MockComponent);
    factory({}, { plugins: { router: {} } });

    expect(mockRouterCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        routes: expect.any(Array),
        history: expect.any(Object),
      }),
    );
  });
});
