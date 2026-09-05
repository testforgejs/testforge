import { describe, expect, it } from "vitest";
import { validatePluginDefaults } from "../validatePluginDefaults";

describe("validatePluginDefaults", () => {
  const pluginName = "pinia";

  const expectedError =
    '[TestForge] Invalid defaults for plugin "pinia". ' +
    "Preset defaults must be provided as a plugin options factory function.";

  it("should accept a plugin options factory function", () => {
    expect(() => validatePluginDefaults(pluginName, () => ({}))).not.toThrow();
  });

  it.each([
    ["null", null],
    ["undefined", undefined],
    ["plain object", {}],
    [
      "configuration object",
      {
        initialState: {},
        stubActions: false,
      },
    ],
    ["string", "options"],
    ["number", 123],
    ["boolean", false],
    ["array", []],
    ["class instance", new (class PluginOptions {})()],
  ])("should throw for %s", (_, value) => {
    expect(() => validatePluginDefaults(pluginName, value)).toThrow(expectedError);
  });
});
