import { describe, it, expect } from "vitest";

import { routerPlugin, plugin, PLUGIN_NAME } from "../index.js";

describe("router package exports", () => {
  it("should export the plugin through the standard plugin entry point", () => {
    expect(plugin).toBe(routerPlugin);
  });

  it("should export the plugin name through the standard package entry point", () => {
    expect(PLUGIN_NAME).toBe(routerPlugin.getName());
  });
});
