import { beforeEach, describe, expect, it, vi } from "vitest";

import { validateComponentFactoryArguments } from "../validateComponentFactoryArguments.js";
import { validatePlainObjectArgument } from "../validatePlainObjectArgument.js";
import { validateComponentFactoryOptions } from "../validateComponentFactoryOptions.js";
import { validateComponentFactoryExtraOptions } from "../validateComponentFactoryExtraOptions.js";

vi.mock("../validatePlainObjectArgument.js", () => ({
  validatePlainObjectArgument: vi.fn(),
}));

vi.mock("../validateComponentFactoryOptions.js", () => ({
  validateComponentFactoryOptions: vi.fn(),
}));

vi.mock("../validateComponentFactoryExtraOptions.js", () => ({
  validateComponentFactoryExtraOptions: vi.fn(),
}));

describe("validateComponentFactoryArguments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("plain object arguments validation", () => {
    it("should validate props and slots as plain objects", () => {
      const mockProps = { foo: "bar" };
      const mockMountOptions = { shallow: true };
      const mockSlots = { default: "text" };

      validateComponentFactoryArguments(mockProps, mockMountOptions, mockSlots, {});

      expect(validatePlainObjectArgument).toHaveBeenCalledWith(mockProps, "props");

      expect(validatePlainObjectArgument).toHaveBeenCalledWith(mockSlots, "slots");
    });
  });

  describe("mountOptions validation delegation", () => {
    it("should delegate mountOptions validation to validateComponentFactoryOptions", () => {
      const mountOptions = {
        shallow: true,
      };

      const extraOptions = {
        preset: "default",
      };

      const presets = {
        default: {
          manifest: [],
          defaults: {},
        },
      };

      validateComponentFactoryArguments({}, mountOptions, {}, extraOptions, presets);

      expect(validateComponentFactoryOptions).toHaveBeenCalledWith(
        mountOptions,
        "mountOptions",
        presets,
        extraOptions,
      );
    });

    it("should pass empty presets by default", () => {
      const mountOptions = {};

      validateComponentFactoryArguments({}, mountOptions, {}, {});

      expect(validateComponentFactoryOptions).toHaveBeenCalledWith(
        mountOptions,
        "mountOptions",
        {},
        {},
      );
    });
  });

  describe("extraOptions validation delegation", () => {
    it("should delegate extraOptions validation to validateComponentFactoryExtraOptions", () => {
      const extraOptions = {
        skipDefaultProps: true,
        skipDefaultSlots: false,
        skipDefaultOptions: true,
      };

      validateComponentFactoryArguments({}, {}, {}, extraOptions);

      expect(validateComponentFactoryExtraOptions).toHaveBeenCalledWith(extraOptions, {});
    });

    it("should pass presets to validateComponentFactoryExtraOptions", () => {
      const presets = {
        default: {
          manifest: [],
          defaults: {},
        },
      };

      const extraOptions = {
        preset: "default",
      };

      validateComponentFactoryArguments({}, {}, {}, extraOptions, presets);

      expect(validateComponentFactoryExtraOptions).toHaveBeenCalledWith(extraOptions, presets);
    });

    it("should pass an empty object as presets by default", () => {
      const extraOptions = {};

      validateComponentFactoryArguments({}, {}, {}, extraOptions);

      expect(validateComponentFactoryExtraOptions).toHaveBeenCalledWith(extraOptions, {});
    });
  });
});
