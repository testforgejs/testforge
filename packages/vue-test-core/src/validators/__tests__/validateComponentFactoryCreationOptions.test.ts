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
    render: () => null,
  };

  describe("Valid Options", () => {
    it("should accept minimal creation options", () => {
      expect(() =>
        validateComponentFactoryCreationOptions(
          {
            component,
          },
          presets,
        ),
      ).not.toThrow();
    });

    it("should accept valid default configuration", () => {
      expect(() =>
        validateComponentFactoryCreationOptions(
          {
            component,
            defaultProps: { title: "Hello" },
            defaultMountOptions: { shallow: true },
            defaultSlots: { default: "Content" },
          },
          presets,
        ),
      ).not.toThrow();
    });

    it("should accept explicitly undefined optional fields", () => {
      expect(() =>
        validateComponentFactoryCreationOptions(
          {
            component,
            defaultProps: undefined,
            defaultMountOptions: undefined,
            defaultSlots: undefined,
            presetKey: undefined,
          },
          presets,
        ),
      ).not.toThrow();
    });

    it("should accept a registered presetKey", () => {
      expect(() =>
        validateComponentFactoryCreationOptions(
          {
            component,
            presetKey: "admin",
          },
          presets,
        ),
      ).not.toThrow();
    });

    it("should accept the default presetKey", () => {
      expect(() =>
        validateComponentFactoryCreationOptions(
          {
            component,
            presetKey: "default",
          },
          presets,
        ),
      ).not.toThrow();
    });

    it("should accept empty plugin configuration with an implicit default preset", () => {
      expect(() =>
        validateComponentFactoryCreationOptions(
          {
            component,
            defaultMountOptions: {
              plugins: {},
            },
          },
          presets,
        ),
      ).not.toThrow();
    });
  });

  describe("Invalid Options", () => {
    it("should use options as the validation context", () => {
      expect(() => validateComponentFactoryCreationOptions(null, presets)).toThrow(
        '"options" must be a plain object.',
      );
    });

    it("should reject a missing component", () => {
      expect(() => validateComponentFactoryCreationOptions({}, presets)).toThrow(
        /"component" must be a Vue component/,
      );
    });

    it("should reject an invalid component", () => {
      expect(() =>
        validateComponentFactoryCreationOptions(
          {
            component: "InvalidComponent",
          },
          presets,
        ),
      ).toThrow(/"component" must be a Vue component/);
    });

    it("should reject invalid defaultProps", () => {
      expect(() =>
        validateComponentFactoryCreationOptions(
          {
            component,
            defaultProps: null,
          },
          presets,
        ),
      ).toThrow(/defaultProps/);
    });

    it("should reject invalid defaultMountOptions", () => {
      expect(() =>
        validateComponentFactoryCreationOptions(
          {
            component,
            defaultMountOptions: null,
          },
          presets,
        ),
      ).toThrow(/defaultMountOptions/);
    });

    it("should reject invalid defaultSlots", () => {
      expect(() =>
        validateComponentFactoryCreationOptions(
          {
            component,
            defaultSlots: null,
          },
          presets,
        ),
      ).toThrow(/defaultSlots/);
    });

    it("should reject an invalid presetKey type", () => {
      expect(() =>
        validateComponentFactoryCreationOptions(
          {
            component,
            presetKey: 123,
          },
          presets,
        ),
      ).toThrow('"presetKey" must be a string.');
    });

    it("should reject an unknown presetKey", () => {
      expect(() =>
        validateComponentFactoryCreationOptions(
          {
            component,
            presetKey: "unknown",
          },
          presets,
        ),
      ).toThrow('Preset "unknown" is not registered.');
    });

    it("should reject plugins not supported by the selected factory preset", () => {
      expect(() =>
        validateComponentFactoryCreationOptions(
          {
            component,
            presetKey: "admin",
            defaultMountOptions: {
              plugins: {
                router: {},
              },
            },
          },
          presets,
        ),
      ).toThrow();
    });

    it("should reject unsupported plugins with an implicit or explicit default preset", () => {
      for (const presetKey of [undefined, "default"] as const) {
        const options = {
          component,
          ...(presetKey !== undefined ? { presetKey } : {}),
          defaultMountOptions: {
            plugins: {
              router: {},
            },
          },
        };

        expect(() => validateComponentFactoryCreationOptions(options, presets)).toThrow(
          '[TestForge] Plugin "router" is configured but not supported by preset "default".',
        );
      }
    });
  });
});
