import { describe, it, expect } from "vitest";

import { primeVuePlugin, plugin, PLUGIN_NAME } from "../index.js";

describe("primevue v3 package exports", () => {
  it("should export the plugin through the standard plugin entry point", () => {
    expect(plugin).toBe(primeVuePlugin);
  });

  it("should export the plugin name through the standard package entry point", () => {
    expect(PLUGIN_NAME).toBe(primeVuePlugin.getName());
  });
});
