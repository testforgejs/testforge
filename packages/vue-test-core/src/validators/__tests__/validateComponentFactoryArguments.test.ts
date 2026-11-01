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
    vi.resetAllMocks();
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
    it("should delegate mountOptions validation with the effective preset", () => {
      const mountOptions = {
        shallow: true,
      };

      const extraOptions = {
        presetKey: "admin",
      };

      const presets = {
        default: {
          manifest: [],
          defaults: {},
        },
        admin: {
          manifest: [],
          defaults: {},
        },
      };

      validateComponentFactoryArguments({}, mountOptions, {}, extraOptions, presets);

      expect(validateComponentFactoryOptions).toHaveBeenCalledExactlyOnceWith(
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
        presetKey: "default",
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

  describe("validation order", () => {
    it("should validate extraOptions before mountOptions", () => {
      validateComponentFactoryArguments({}, { shallow: true }, {}, { presetKey: "admin" });

      const extraOptionsCallOrder = vi.mocked(validateComponentFactoryExtraOptions).mock
        .invocationCallOrder[0];

      const mountOptionsCallOrder = vi.mocked(validateComponentFactoryOptions).mock
        .invocationCallOrder[0];

      expect(extraOptionsCallOrder).toBeLessThan(mountOptionsCallOrder);
    });

    it("should validate props and slots before preset-dependent options", () => {
      validateComponentFactoryArguments({}, {}, {}, {});

      const plainObjectCalls = vi.mocked(validatePlainObjectArgument).mock.invocationCallOrder;

      const extraOptionsCallOrder = vi.mocked(validateComponentFactoryExtraOptions).mock
        .invocationCallOrder[0];

      expect(plainObjectCalls[0]).toBeLessThan(extraOptionsCallOrder);
      expect(plainObjectCalls[1]).toBeLessThan(extraOptionsCallOrder);
    });

    it("should not validate mountOptions when extraOptions validation fails", () => {
      vi.mocked(validateComponentFactoryExtraOptions).mockImplementationOnce(() => {
        throw new Error('"presetKey" must be a string.');
      });

      expect(() => {
        validateComponentFactoryArguments({}, { shallow: true }, {}, { presetKey: 123 });
      }).toThrow('"presetKey" must be a string.');

      expect(validateComponentFactoryExtraOptions).toHaveBeenCalledTimes(1);
      expect(validateComponentFactoryOptions).not.toHaveBeenCalled();
    });

    it("should not validate extraOptions or mountOptions when props validation fails", () => {
      vi.mocked(validatePlainObjectArgument).mockImplementationOnce(() => {
        throw new Error('"props" must be a plain object.');
      });

      expect(() => {
        validateComponentFactoryArguments(null, {}, {}, {});
      }).toThrow('"props" must be a plain object.');

      expect(validateComponentFactoryExtraOptions).not.toHaveBeenCalled();
      expect(validateComponentFactoryOptions).not.toHaveBeenCalled();
    });
  });

  describe("effective preset propagation", () => {
    const presets = {
      default: {
        manifest: [],
        defaults: {},
      },
      admin: {
        manifest: [],
        defaults: {},
      },
    };

    it("should preserve the received presetKey without resolving the default preset", () => {
      const extraOptions = {};

      validateComponentFactoryArguments({}, {}, {}, extraOptions, presets);

      expect(validateComponentFactoryOptions).toHaveBeenCalledExactlyOnceWith(
        {},
        "mountOptions",
        presets,
        extraOptions,
      );

      expect(extraOptions).not.toHaveProperty("presetKey");
    });

    it("should pass the same extraOptions object to both validators", () => {
      const extraOptions = {
        presetKey: "admin",
        skipDefaultProps: true,
      };

      validateComponentFactoryArguments({}, {}, {}, extraOptions, presets);

      expect(validateComponentFactoryExtraOptions).toHaveBeenCalledWith(extraOptions, presets);

      expect(validateComponentFactoryOptions).toHaveBeenCalledWith(
        {},
        "mountOptions",
        presets,
        extraOptions,
      );

      const validatedExtraOptions = vi.mocked(validateComponentFactoryExtraOptions).mock
        .calls[0][0];

      const mountValidationExtraOptions = vi.mocked(validateComponentFactoryOptions).mock
        .calls[0][3];

      expect(validatedExtraOptions).toBe(extraOptions);
      expect(mountValidationExtraOptions).toBe(extraOptions);
    });
  });
});
