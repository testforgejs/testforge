import { beforeEach, describe, expect, it, vi } from "vitest";

import { warnRootPluginOptions } from "../warnRootPluginOptions.js";
import { getSupportedPluginNames } from "../../utils/getSupportedPluginNames.js";
import { warnRootPluginOption } from "../../utils/warnRootPluginOption.js";

vi.mock("../../utils/getSupportedPluginNames.js", () => ({
  getSupportedPluginNames: vi.fn(),
}));

vi.mock("../../utils/warnRootPluginOption.js", () => ({
  warnRootPluginOption: vi.fn(),
}));

const mockGetSupportedPluginNames = vi.mocked(getSupportedPluginNames);

describe("warnRootPluginOptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when a root plugin option is detected", () => {
    it("should emit a warning", () => {
      mockGetSupportedPluginNames.mockReturnValue(["i18n"]);

      // Intentionally bypass type safety to verify runtime DX warning.
      // Plugin options placed at the root are invalid and should trigger
      // a warning suggesting `plugins.i18n`.
      // @ts-expect-error testing invalid configuration
      warnRootPluginOptions({ i18n: {} }, "mountOptions");

      expect(warnRootPluginOption).toHaveBeenCalledTimes(1);

      expect(warnRootPluginOption).toHaveBeenCalledWith("i18n", "mountOptions");
    });
  });

  describe("when plugin options are already placed under plugins", () => {
    it("should not emit a warning", () => {
      mockGetSupportedPluginNames.mockReturnValue(["i18n"]);

      warnRootPluginOptions(
        {
          // @ts-expect-error testing invalid configuration
          i18n: {},
          plugins: {
            i18n: {},
          },
        },
        "mountOptions",
      );

      expect(warnRootPluginOption).not.toHaveBeenCalled();
    });
  });

  describe("when the root option does not correspond to a supported plugin", () => {
    it("should not emit a warning", () => {
      mockGetSupportedPluginNames.mockReturnValue(["i18n"]);

      // @ts-expect-error testing invalid configuration
      warnRootPluginOptions({ pinia: {} }, "mountOptions");

      expect(warnRootPluginOption).not.toHaveBeenCalled();
    });
  });

  describe("when multiple root plugin options are detected", () => {
    it("should emit a warning for each plugin", () => {
      mockGetSupportedPluginNames.mockReturnValue(["i18n", "pinia", "router"]);

      warnRootPluginOptions(
        {
          // @ts-expect-error testing invalid configuration
          i18n: {},
          pinia: {},
        },
        "defaultMountOptions",
      );

      expect(warnRootPluginOption).toHaveBeenCalledTimes(2);

      expect(warnRootPluginOption).toHaveBeenNthCalledWith(1, "i18n", "defaultMountOptions");

      expect(warnRootPluginOption).toHaveBeenNthCalledWith(2, "pinia", "defaultMountOptions");
    });
  });

  describe("when there are no supported plugins", () => {
    it("should not emit any warnings", () => {
      mockGetSupportedPluginNames.mockReturnValue([]);

      // @ts-expect-error testing invalid configuration
      warnRootPluginOptions({ i18n: {} }, "mountOptions");

      expect(warnRootPluginOption).not.toHaveBeenCalled();
    });
  });

  describe("when some plugins are configured under plugins and others are placed at the root", () => {
    it("should warn only for root plugin options", () => {
      mockGetSupportedPluginNames.mockReturnValue(["i18n", "pinia"]);

      warnRootPluginOptions(
        {
          // @ts-expect-error testing invalid configuration
          i18n: {},
          pinia: {},
          plugins: {
            pinia: {},
          },
        },
        "extraOptions",
      );

      expect(warnRootPluginOption).toHaveBeenCalledTimes(1);

      expect(warnRootPluginOption).toHaveBeenCalledWith("i18n", "extraOptions");
    });
  });

  describe("context propagation", () => {
    it.each(["defaultMountOptions", "mountOptions", "extraOptions"])(
      'should pass "%s" to warnRootPluginOption',
      (context) => {
        mockGetSupportedPluginNames.mockReturnValue(["i18n"]);

        // @ts-expect-error testing invalid configuration
        warnRootPluginOptions({ i18n: {} }, context);

        expect(warnRootPluginOption).toHaveBeenCalledTimes(1);

        expect(warnRootPluginOption).toHaveBeenCalledWith("i18n", context);
      },
    );
  });
});
