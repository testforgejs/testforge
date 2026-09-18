import { describe, it, expect } from "vitest";
import { vuetifyPlugin } from "../vuetifyPlugin.js";
import { createVuetifyPlugin } from "../createVuetifyPlugin.js";

describe("vuetifyPlugin", () => {
  it("should return 'vuetify' as plugin name when getName is called", () => {
    expect(vuetifyPlugin.getName()).toBe("vuetify");
  });

  it("should return definition containing createVuetifyPlugin when getDefinition is called", () => {
    const definition = vuetifyPlugin.getDefinition();

    expect(definition.create).toBe(createVuetifyPlugin);
  });

  it("should return default options factory when getDefaultOptions is called", () => {
    const optionsFactory = vuetifyPlugin.getDefaultOptions();

    expect(optionsFactory).toBeTypeOf("function");
  });

  it("should create Vuetify instance using default options", () => {
    const optionsFactory = vuetifyPlugin.getDefaultOptions();
    const options = optionsFactory();

    const definition = vuetifyPlugin.getDefinition();
    const instance = definition.create(options);

    expect(instance).toBeDefined();
    expect(instance.install).toBeTypeOf("function");
  });

  it("should provide components and directives in default options", () => {
    const optionsFactory = vuetifyPlugin.getDefaultOptions();
    const options = optionsFactory();

    expect(options.components).toBeDefined();
    expect(options.directives).toBeDefined();
  });
});
