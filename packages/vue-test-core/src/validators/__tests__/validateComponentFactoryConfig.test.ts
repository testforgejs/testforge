import { describe, expect, it } from "vitest";
import { validateComponentFactoryConfig } from "../validateComponentFactoryConfig.js";

import type { TestFrameworkPresets } from "../../types.js";

describe("validateComponentFactoryConfig", () => {
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

  describe("config validation", () => {
    it.each([
      { description: "null", value: null },
      { description: "undefined", value: undefined },
      { description: "a number", value: 123 },
      { description: "a string", value: "admin" },
      { description: "an array", value: [] },
      { description: "a class instance", value: new Date() },
    ])("should reject $description", ({ value }) => {
      expect(() => {
        validateComponentFactoryConfig(value, presets);
      }).toThrow('"config" must be a plain object.');
    });

    it("should accept an empty config", () => {
      expect(() => {
        validateComponentFactoryConfig({}, presets);
      }).not.toThrow();
    });

    it("should accept a config with a null prototype", () => {
      const config = Object.assign(Object.create(null), {
        presetKey: "admin",
      });

      expect(() => {
        validateComponentFactoryConfig(config, presets);
      }).not.toThrow();
    });
  });

  describe("context validation", () => {
    it("should use config as the default validation context", () => {
      expect(() => {
        validateComponentFactoryConfig(null, presets);
      }).toThrow('"config" must be a plain object.');
    });

    it("should use options when explicitly provided as context", () => {
      expect(() => {
        validateComponentFactoryConfig(null, presets, "options");
      }).toThrow('"options" must be a plain object.');
    });

    it("should accept a valid config with the options context", () => {
      expect(() => {
        validateComponentFactoryConfig({ presetKey: "admin" }, presets, "options");
      }).not.toThrow();
    });
  });

  describe("presetKey validation", () => {
    it("should accept an omitted presetKey", () => {
      expect(() => {
        validateComponentFactoryConfig({}, presets);
      }).not.toThrow();
    });

    it("should accept an explicitly undefined presetKey", () => {
      expect(() => {
        validateComponentFactoryConfig({ presetKey: undefined }, presets);
      }).not.toThrow();
    });

    it.each(["default", "admin"])("should accept a registered presetKey: %s", (presetKey) => {
      expect(() => {
        validateComponentFactoryConfig({ presetKey }, presets);
      }).not.toThrow();
    });

    it.each([
      { description: "null", value: null },
      { description: "a number", value: 123 },
      { description: "a boolean", value: true },
      { description: "an array", value: [] },
      { description: "an object", value: {} },
    ])("should reject $description as presetKey", ({ value }) => {
      expect(() => {
        validateComponentFactoryConfig({ presetKey: value }, presets);
      }).toThrow('"presetKey" must be a string.');
    });

    it("should reject an unknown presetKey", () => {
      expect(() => {
        validateComponentFactoryConfig({ presetKey: "unknown" }, presets);
      }).toThrow('Preset "unknown" is not registered.');
    });

    it("should reject inherited preset names", () => {
      expect(() => {
        validateComponentFactoryConfig({ presetKey: "toString" }, presets);
      }).toThrow('Preset "toString" is not registered.');
    });

    it("should validate presetKey even when using the options context", () => {
      expect(() => {
        validateComponentFactoryConfig({ presetKey: "unknown" }, presets, "options");
      }).toThrow('Preset "unknown" is not registered.');
    });

    it("should not require a default preset when presetKey is omitted", () => {
      const presetsWithoutDefault: TestFrameworkPresets = {
        admin: {
          manifest: [],
          defaults: {},
        },
      };

      expect(() => {
        validateComponentFactoryConfig({}, presetsWithoutDefault);
      }).not.toThrow();
    });
  });
});
