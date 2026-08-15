import { describe, expect, it } from "vitest";
import { validatePluginDefaults } from "../validatePluginDefaults";

describe("validatePluginDefaults", () => {
  const pluginName = "pinia";
  const expectedError =
    '[TestForge] Invalid defaults for plugin "pinia". Preset defaults must be a plain object.';

  it("should accept a plain object", () => {
    expect(() => validatePluginDefaults("pinia", {})).not.toThrow();
  });

  it("should accept a plain object with configuration", () => {
    expect(() =>
      validatePluginDefaults("pinia", {
        initialState: {},
        stubActions: false,
      }),
    ).not.toThrow();
  });

  it.each([
    ["null", null],
    ["undefined", undefined],
    ["string", "options"],
    ["number", 123],
    ["boolean", false],
    ["array", []],
    ["class instance", new (class PluginOptions {})()],
  ])("throws for %s", (_, value) => {
    expect(() => validatePluginDefaults(pluginName, value)).toThrow(expectedError);
  });
});
