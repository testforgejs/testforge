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
});
