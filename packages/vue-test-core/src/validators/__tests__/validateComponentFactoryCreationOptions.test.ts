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

  const component = {
    name: "TestComponent",
  };

  it("should accept valid creation options", () => {
    expect(() => {
      validateComponentFactoryCreationOptions(
        {
          component,
          presetKey: "admin",
        },
        presets,
      );
    }).not.toThrow();
  });

  it("should accept creation options without presetKey", () => {
    expect(() => {
      validateComponentFactoryCreationOptions(
        {
          component,
        },
        presets,
      );
    }).not.toThrow();
  });

  it("should use options as the validation context", () => {
    expect(() => {
      validateComponentFactoryCreationOptions(null, presets);
    }).toThrow('"options" must be a plain object.');
  });

  it("should reject an invalid presetKey type", () => {
    expect(() => {
      validateComponentFactoryCreationOptions(
        {
          component,
          presetKey: 123,
        },
        presets,
      );
    }).toThrow('"presetKey" must be a string.');
  });

  it("should reject an unknown presetKey", () => {
    expect(() => {
      validateComponentFactoryCreationOptions(
        {
          component,
          presetKey: "unknown",
        },
        presets,
      );
    }).toThrow('Preset "unknown" is not registered.');
  });

  it("should accept the default presetKey", () => {
    expect(() => {
      validateComponentFactoryCreationOptions(
        {
          component,
          presetKey: "default",
        },
        presets,
      );
    }).not.toThrow();
  });
});
