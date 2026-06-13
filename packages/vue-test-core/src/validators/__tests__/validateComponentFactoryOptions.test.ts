import { beforeEach, describe, expect, it, vi } from "vitest";

import { validateComponentFactoryOptions } from "../validateComponentFactoryOptions.js";
import { validateBooleanOption } from "../validateBooleanOption.js";
import { warnRootPluginOptions } from "../warnRootPluginOptions.js";

vi.mock("../validateBooleanOption.js", () => ({
  validateBooleanOption: vi.fn(),
}));

vi.mock("../warnRootPluginOptions.js", () => ({
  warnRootPluginOptions: vi.fn(),
}));

describe("validateComponentFactoryOptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("plain object validation", () => {
    it.each([123, "text", true, [], null])("should throw when options is %o", (value) => {
      expect(() => {
        validateComponentFactoryOptions(value as any, "mountOptions");
      }).toThrow('"mountOptions" must be a plain object.');
    });

    it("should accept a plain object", () => {
      expect(() => {
        validateComponentFactoryOptions({}, "mountOptions");
      }).not.toThrow();
    });
  });

  describe("skipManagedPlugins validation", () => {
    it("should validate skipManagedPlugins", () => {
      validateComponentFactoryOptions(
        {
          skipManagedPlugins: true,
        },
        "mountOptions",
      );

      expect(validateBooleanOption).toHaveBeenCalledTimes(1);

      expect(validateBooleanOption).toHaveBeenCalledWith(true, "skipManagedPlugins");
    });

    it("should validate undefined skipManagedPlugins", () => {
      validateComponentFactoryOptions({}, "mountOptions");

      expect(validateBooleanOption).toHaveBeenCalledWith(undefined, "skipManagedPlugins");
    });
  });

  describe("root plugin warnings", () => {
    it("should delegate root plugin checks", () => {
      const presets = {
        default: {
          manifest: [],
          defaults: {},
        },
      };

      const extraOptions = {
        preset: "default",
      };

      const options = {
        plugins: {},
      };

      validateComponentFactoryOptions(options, "defaultMountOptions", presets, extraOptions);

      expect(warnRootPluginOptions).toHaveBeenCalledTimes(1);

      expect(warnRootPluginOptions).toHaveBeenCalledWith(
        options,
        "defaultMountOptions",
        presets,
        extraOptions,
      );
    });

    it("should use default arguments", () => {
      validateComponentFactoryOptions({}, "mountOptions");

      expect(warnRootPluginOptions).toHaveBeenCalledWith({}, "mountOptions", {}, undefined);
    });
  });

  describe("context propagation", () => {
    it.each(["defaultMountOptions", "mountOptions", "extraOptions"])(
      "should pass %s to warnRootPluginOptions",
      (context) => {
        validateComponentFactoryOptions({}, context);

        expect(warnRootPluginOptions).toHaveBeenCalledWith({}, context, {}, undefined);
      },
    );
  });
});
