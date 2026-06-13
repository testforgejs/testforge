import { beforeEach, describe, expect, it, vi } from "vitest";

import { validateComponentFactoryExtraOptions } from "../validateComponentFactoryExtraOptions.js";
import { validateBooleanOption } from "../validateBooleanOption.js";
import { warnRootPluginOptions } from "../warnRootPluginOptions.js";

vi.mock("../validateBooleanOption.js", () => ({
  validateBooleanOption: vi.fn(),
}));

vi.mock("../warnRootPluginOptions.js", () => ({
  warnRootPluginOptions: vi.fn(),
}));

describe("validateComponentFactoryExtraOptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("plain object validation", () => {
    it.each([123, "text", true, [], null])("should throw when options is %o", (value) => {
      expect(() => {
        validateComponentFactoryExtraOptions(value as any);
      }).toThrow('"extraOptions" must be a plain object.');
    });

    it("should not throw when options is a plain object", () => {
      expect(() => {
        validateComponentFactoryExtraOptions({});
      }).not.toThrow();
    });
  });

  describe("skip flags validation", () => {
    it("should validate all skip flags", () => {
      validateComponentFactoryExtraOptions({
        skipDefaultProps: true,
        skipDefaultSlots: false,
        skipDefaultOptions: true,
      });

      expect(validateBooleanOption).toHaveBeenNthCalledWith(1, true, "skipDefaultProps");

      expect(validateBooleanOption).toHaveBeenNthCalledWith(2, false, "skipDefaultSlots");

      expect(validateBooleanOption).toHaveBeenNthCalledWith(3, true, "skipDefaultOptions");
    });

    it("should validate undefined skip flags", () => {
      validateComponentFactoryExtraOptions({});

      expect(validateBooleanOption).toHaveBeenNthCalledWith(1, undefined, "skipDefaultProps");

      expect(validateBooleanOption).toHaveBeenNthCalledWith(2, undefined, "skipDefaultSlots");

      expect(validateBooleanOption).toHaveBeenNthCalledWith(3, undefined, "skipDefaultOptions");
    });
  });

  describe("root plugin warnings", () => {
    it("should delegate plugin validation", () => {
      const presets = {
        default: {
          manifest: [],
          defaults: {},
        },
      };

      const options = {
        preset: "default",
        plugins: {},
      };

      validateComponentFactoryExtraOptions(options, presets);

      expect(warnRootPluginOptions).toHaveBeenCalledTimes(1);

      expect(warnRootPluginOptions).toHaveBeenCalledWith(options, "extraOptions", presets, options);
    });

    it("should use default presets", () => {
      const options = {};

      validateComponentFactoryExtraOptions(options);

      expect(warnRootPluginOptions).toHaveBeenCalledWith(options, "extraOptions", {}, options);
    });
  });

  describe("preset resolution", () => {
    it("should pass extraOptions as the preset lookup source", () => {
      const options = {
        preset: "custom",
      };

      validateComponentFactoryExtraOptions(options);

      expect(warnRootPluginOptions).toHaveBeenCalledWith(options, "extraOptions", {}, options);
    });
  });
});
