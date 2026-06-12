import { describe, expect, it, vi, beforeEach } from "vitest";
import { validateTestComponentFactoryArguments } from "../validateTestComponentFactoryArguments.js";
import { validatePlainObjectArgument } from "../validatePlainObjectArgument.js";
import { ERROR_PREFIX } from "../../constants/constants.js";

// Mock the child validator to isolate the logic of the current function
vi.mock("../validatePlainObjectArgument.js", () => ({
  validatePlainObjectArgument: vi.fn(),
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
        validateTestComponentFactoryArguments(value, {}, {}, {});
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
        validateTestComponentFactoryArguments(value, {}, {}, {});
      }).toThrow(`${ERROR_PREFIX} testComponentFactory() requires a valid Vue component.`);
    });
  });

  describe("delegation to validatePlainObjectArgument", () => {
    it("should invoke validatePlainObjectArgument for all optional configuration objects", () => {
      const dummyComponent = {};
      const mockProps = { id: 1 };
      const mockOptions = { shallow: true };
      const mockSlots = { default: "text" };

      validateTestComponentFactoryArguments(dummyComponent, mockProps, mockOptions, mockSlots);

      // Verify that the child validator was called for each argument with the correct name
      expect(validatePlainObjectArgument).toHaveBeenCalledWith(mockProps, "defaultProps");
      expect(validatePlainObjectArgument).toHaveBeenCalledWith(mockOptions, "defaultMountOptions");
      expect(validatePlainObjectArgument).toHaveBeenCalledWith(mockSlots, "defaultSlots");
    });
  });
});
