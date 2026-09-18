import PrimeVue from "primevue/config";
import { describe, it, expect } from "vitest";
import { primeVuePlugin } from "../primeVuePlugin.js";
import { createPrimeVuePlugin } from "../createPrimeVuePlugin.js";

describe("primeVuePlugin", () => {
  it("should return 'primevue' as plugin name", () => {
    expect(primeVuePlugin.getName()).toBe("primevue");
  });

  it("should expose createPrimeVuePlugin factory", () => {
    const definition = primeVuePlugin.getDefinition();

    expect(definition.create).toBe(createPrimeVuePlugin);
  });

  it("should provide unstyled mode in default options", () => {
    const optionsFactory = primeVuePlugin.getDefaultOptions();
    const options = optionsFactory();

    expect(options).toEqual({
      unstyled: true,
    });
  });

  it("should create PrimeVue plugin tuple using default options", () => {
    const optionsFactory = primeVuePlugin.getDefaultOptions();
    const options = optionsFactory();

    const definition = primeVuePlugin.getDefinition();
    const [plugin, pluginOptions] = definition.create(options);

    expect(plugin).toBe(PrimeVue);
    expect(pluginOptions).toBe(options);
  });
});
