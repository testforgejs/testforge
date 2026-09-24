import { describe, it, expect } from "vitest";

import { piniaPlugin, plugin, PLUGIN_NAME } from "../index.js";

describe("pinia package exports", () => {
  it("should export the plugin through the standard plugin entry point", () => {
    expect(plugin).toBe(piniaPlugin);
  });

  it("should export the plugin name through the standard package entry point", () => {
    expect(PLUGIN_NAME).toBe(piniaPlugin.getName());
  });
});
