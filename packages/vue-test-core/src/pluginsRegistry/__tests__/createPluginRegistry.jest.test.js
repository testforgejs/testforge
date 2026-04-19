import { createPluginRegistry } from "../createPluginRegistry.js";

describe("createPluginRegistry", () => {
  // Helpers for creating mock modules
  const createMockModule = (name, definition = { id: `def-${name}` }) => ({
    getName: () => name,
    getDefinition: () => definition,
  });

  const mockPinia = createMockModule("pinia");
  const mockI18n = createMockModule("i18n");

  it("should initialize the registry with plugins from the manifest", () => {
    const manifest = [
      { module: mockPinia, enabled: true },
      { module: mockI18n, enabled: false },
    ];

    const registry = createPluginRegistry(manifest);

    expect(registry.has("pinia")).toBe(true);
    expect(registry.has("i18n")).toBe(true);
    expect(registry.get("pinia")).toEqual(mockPinia.getDefinition());
  });

  it("should return all registered plugin names via getNames()", () => {
    const manifest = [
      { module: mockPinia, enabled: true },
      { module: mockI18n, enabled: true },
    ];
    const registry = createPluginRegistry(manifest);

    expect(registry.getNames()).toEqual(["pinia", "i18n"]);
  });

  it("should allow manual registration of a new plugin via register()", () => {
    const registry = createPluginRegistry([]); // Empty registry
    const mockRouter = createMockModule("router");

    registry.register({ module: mockRouter, enabled: true });

    expect(registry.has("router")).toBe(true);
    expect(registry.get("router")).toEqual(mockRouter.getDefinition());
  });

  it("should overwrite a plugin if registered with the same name", () => {
    const firstDef = { version: 1 };
    const secondDef = { version: 2 };

    const registry = createPluginRegistry([
      { module: createMockModule("plugin", firstDef), enabled: true },
    ]);

    // Register the same plugin with a new definition
    registry.register({
      module: createMockModule("plugin", secondDef),
      enabled: true,
    });

    expect(registry.get("plugin")).toEqual(secondDef);
    expect(registry.getNames()).toHaveLength(1);
  });

  it("should return undefined for non-existent plugins", () => {
    const registry = createPluginRegistry([]);
    expect(registry.get("unknown")).toBeUndefined();
  });

  it("should handle an empty manifest without crashing", () => {
    const registry = createPluginRegistry([]);
    expect(registry.getNames()).toEqual([]);
  });

  it("should ignore entries with missing modules (protection check)", () => {
    const manifest = [
      { module: null, enabled: true },
      { module: undefined, enabled: false },
    ];
    const registry = createPluginRegistry(manifest);
    expect(registry.getNames()).toHaveLength(0);
  });
});
