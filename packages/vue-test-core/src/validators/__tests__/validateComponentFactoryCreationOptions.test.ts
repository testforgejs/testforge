import { describe, expect, it } from "vitest";

import { validateComponentFactoryCreationOptions } from "../validateComponentFactoryCreationOptions.js";

import type { TestFrameworkPresets } from "../../types.js";

describe("validateComponentFactoryCreationOptions", () => {
  const presets: TestFrameworkPresets = {
    default: {
      manifest: [],
      defaults: {},
    },

    admin: {
      manifest: [],
      defaults: {},
    },
  };

  it("should accept valid options", () => {
    expect(() => {
      validateComponentFactoryCreationOptions(
        {
          component: { name: "TestComponent" },
          presetKey: "admin",
        },
        presets,
      );
    }).not.toThrow();
  });

  it("should allow an omitted presetKey", () => {
    expect(() => {
      validateComponentFactoryCreationOptions(
        {
          component: { name: "TestComponent" },
        },
        presets,
      );
    }).not.toThrow();
  });

  it.each([null, undefined, 123, "invalid", []])("should reject non-plain options: %s", (value) => {
    expect(() => {
      validateComponentFactoryCreationOptions(value, presets);
    }).toThrow('"options" must be a plain object.');
  });

  it.each([null, 123, true, [], {}])("should reject invalid presetKey values: %s", (value) => {
    expect(() => {
      validateComponentFactoryCreationOptions(
        {
          component: { name: "TestComponent" },
          presetKey: value,
        },
        presets,
      );
    }).toThrow('"presetKey" must be a string.');
  });

  it("should reject an unknown preset key", () => {
    expect(() => {
      validateComponentFactoryCreationOptions(
        {
          component: { name: "TestComponent" },
          presetKey: "unknown",
        },
        presets,
      );
    }).toThrow('Preset "unknown" is not registered.');
  });

  it("should accept the default preset key", () => {
    expect(() => {
      validateComponentFactoryCreationOptions(
        {
          component: { name: "TestComponent" },
          presetKey: "default",
        },
        presets,
      );
    }).not.toThrow();
  });
});
