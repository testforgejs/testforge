import { describe, it, expect } from "vitest";

import { vuetifyPlugin, plugin, PLUGIN_NAME } from "../index.js";

describe("vuetify package exports", () => {
  it("should export the plugin through the standard plugin entry point", () => {
    expect(plugin).toBe(vuetifyPlugin);
  });

  it("should export the plugin name through the standard package entry point", () => {
    expect(PLUGIN_NAME).toBe(vuetifyPlugin.getName());
  });
});
