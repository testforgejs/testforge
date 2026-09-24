import { describe, it, expect } from "vitest";

import { i18nPlugin, plugin, PLUGIN_NAME } from "../index.js";

describe("i18n package exports", () => {
  it("should export the plugin through the standard plugin entry point", () => {
    expect(plugin).toBe(i18nPlugin);
  });

  it("should export the plugin name through the standard package entry point", () => {
    expect(PLUGIN_NAME).toBe(i18nPlugin.getName());
  });
});
