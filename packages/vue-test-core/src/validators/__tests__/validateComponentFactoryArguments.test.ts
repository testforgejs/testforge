import { describe, expect, it, vi, beforeEach } from "vitest";
import { validateComponentFactoryArguments } from "../validateComponentFactoryArguments.js";
import { validatePlainObjectArgument } from "../validatePlainObjectArgument.js";
import { validateBooleanOption } from "../validateBooleanOption.js";

// Mock child validators to isolate testing of the current function
vi.mock("../validatePlainObjectArgument.js", () => ({
  validatePlainObjectArgument: vi.fn(),
}));

// Mock child validators to isolate testing of the current function
vi.mock("../validateBooleanOption.js", () => ({
  validateBooleanOption: vi.fn(),
}));

describe("validateComponentFactoryArguments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("plain object arguments validation", () => {
    it("should invoke validatePlainObjectArgument for all four primary arguments", () => {
      const mockProps = { foo: "bar" };
      const mockMountOptions = { shallow: true };
      const mockSlots = { default: "text" };
      const mockExtraOptions = {};

      validateComponentFactoryArguments(mockProps, mockMountOptions, mockSlots, mockExtraOptions);

      // Check that the base arguments are passed to the object validator with the correct names
      expect(validatePlainObjectArgument).toHaveBeenCalledWith(mockProps, "props");
      expect(validatePlainObjectArgument).toHaveBeenCalledWith(mockMountOptions, "mountOptions");
      expect(validatePlainObjectArgument).toHaveBeenCalledWith(mockSlots, "slots");
      expect(validatePlainObjectArgument).toHaveBeenCalledWith(mockExtraOptions, "extraOptions");
    });
  });

  describe("extra options properties validation", () => {
    it("should invoke validateBooleanOption for all specific flags inside extraOptions", () => {
      const mockExtraOptions = {
        skipDefaultProps: true,
        skipDefaultSlots: false,
        skipDefaultOptions: true,
      };

      // Pass valid placeholders as the first 3 arguments
      validateComponentFactoryArguments({}, {}, {}, mockExtraOptions);

      // Check that the properties of the `extraOptions` object are retrieved and validated as Boolean options
      expect(validateBooleanOption).toHaveBeenCalledWith(
        mockExtraOptions.skipDefaultProps,
        "skipDefaultProps",
      );
      expect(validateBooleanOption).toHaveBeenCalledWith(
        mockExtraOptions.skipDefaultSlots,
        "skipDefaultSlots",
      );
      expect(validateBooleanOption).toHaveBeenCalledWith(
        mockExtraOptions.skipDefaultOptions,
        "skipDefaultOptions",
      );
    });
  });
});
