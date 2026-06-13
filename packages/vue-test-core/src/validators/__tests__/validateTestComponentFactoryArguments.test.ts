import { beforeEach, describe, expect, it, vi } from "vitest";

import { validateTestComponentFactoryArguments } from "../validateTestComponentFactoryArguments.js";
import { validatePlainObjectArgument } from "../validatePlainObjectArgument.js";
import { validateComponentFactoryOptions } from "../validateComponentFactoryOptions.js";
import { ERROR_PREFIX } from "../../constants/constants.js";

vi.mock("../validatePlainObjectArgument.js", () => ({
  validatePlainObjectArgument: vi.fn(),
}));

vi.mock("../validateComponentFactoryOptions.js", () => ({
  validateComponentFactoryOptions: vi.fn(),
}));

describe("validateTestComponentFactoryArguments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("component argument validation", () => {
    it.each([
      { description: "an object component", value: { render: () => {} } },
      { description: "a functional/class component", value: () => {} },
    ])("should pass component validation when $description is provided", ({ value }) => {
      expect(() => {
        validateTestComponentFactoryArguments(value, {}, {}, {}, {});
      }).not.toThrow();
    });

    it.each([
      { type: "null", value: null },
      { type: "undefined", value: undefined },
      { type: "string", value: "Component" },
      { type: "number", value: 42 },
      { type: "boolean", value: true },
    ])("should throw an error when component is a $type", ({ value }) => {
      expect(() => {
        validateTestComponentFactoryArguments(value, {}, {}, {}, {});
      }).toThrow(`${ERROR_PREFIX} testComponentFactory() requires a valid Vue component.`);
    });
  });

  describe("defaultProps and defaultSlots validation", () => {
    it("should delegate validation of defaultProps and defaultSlots", () => {
      const component = {};
      const defaultProps = { id: 1 };
      const defaultSlots = { default: "text" };

      validateTestComponentFactoryArguments(component, defaultProps, {}, defaultSlots, {});

      expect(validatePlainObjectArgument).toHaveBeenCalledWith(defaultProps, "defaultProps");

      expect(validatePlainObjectArgument).toHaveBeenCalledWith(defaultSlots, "defaultSlots");
    });
  });

  describe("defaultMountOptions validation delegation", () => {
    it("should delegate defaultMountOptions validation to validateComponentFactoryOptions", () => {
      const component = {};
      const defaultMountOptions = {
        shallow: true,
      };

      validateTestComponentFactoryArguments(component, {}, defaultMountOptions, {}, {});

      expect(validateComponentFactoryOptions).toHaveBeenCalledWith(
        defaultMountOptions,
        "defaultMountOptions",
        {},
      );
    });

    it("should pass presets to validateComponentFactoryOptions", () => {
      const component = {};

      const presets = {
        default: {
          manifest: [],
          defaults: {},
        },
      };

      const defaultMountOptions = {
        shallow: true,
      };

      validateTestComponentFactoryArguments(component, {}, defaultMountOptions, {}, presets);

      expect(validateComponentFactoryOptions).toHaveBeenCalledWith(
        defaultMountOptions,
        "defaultMountOptions",
        presets,
      );
    });
  });
});
