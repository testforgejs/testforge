export async function setupFactoryTestContext(runner, { configureModules } = {}) {
  runner.resetModules();
  runner.clearAllMocks();

  const MockComponent = {
    name: "MockComponent",
    render: () => null,
  };

  const mockMount = runner.fn().mockReturnValue({
    unmount: runner.fn(),
    vm: {},
    element: {},
  });

  const mockShallowMount = runner.fn().mockReturnValue({
    unmount: runner.fn(),
    vm: {},
    element: {},
  });

  // Mock VTU before importing TestForge.
  runner.doMock("@vue/test-utils", () => ({
    mount: mockMount,
    shallowMount: mockShallowMount,
  }));

  // Allow each test suite to configure plugin modules.
  configureModules?.();

  // All Core helpers must come from the same module instance.
  const core = await import("@testforgejs/vue-test-core");

  const { presets } = await import("./presets/mockPresets.js");

  const createFactory = (options = {}) =>
    core.createTestFramework({
      presets,
      ...options,
    }).testComponentFactory;

  return {
    MockComponent,
    mockMount,
    mockShallowMount,

    createTestFramework: core.createTestFramework,
    createPluginInstance: core.createPluginInstance,
    captureInstance: core.captureInstance,
    fromPluginInstance: core.fromPluginInstance,

    createFactory,
    testComponentFactory: createFactory(),
  };
}
