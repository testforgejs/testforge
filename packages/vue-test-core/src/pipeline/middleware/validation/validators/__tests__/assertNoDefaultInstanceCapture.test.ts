import { describe, expect, it } from "vitest";

import { ERROR_PREFIX, PLUGIN_EXPOSE } from "../../../../../constants/constants.js";
import { captureInstance } from "../../../../../plugins/instances/captureInstance.js";

import { assertNoDefaultInstanceCapture } from "../assertNoDefaultInstanceCapture.js";

import type { ComponentFactoryOptions } from "../../../../../types.js";

describe("assertNoDefaultInstanceCapture", () => {
  it("should allow default mount options without plugins", () => {
    expect(() => assertNoDefaultInstanceCapture({})).not.toThrow();
  });

  it("should allow plugin configurations without instance capture", () => {
    const defaultMountOptions = {
      plugins: {
        pinia: {
          stubActions: false,
        },
        router: false,
      },
    } as ComponentFactoryOptions;

    expect(() => assertNoDefaultInstanceCapture(defaultMountOptions)).not.toThrow();
  });

  it("should reject instance capture in default plugin options", () => {
    const capture = captureInstance();

    const defaultMountOptions = {
      plugins: {
        pinia: {
          stubActions: false,
          ...capture,
        },
      },
    } as ComponentFactoryOptions;

    expect(() => assertNoDefaultInstanceCapture(defaultMountOptions)).toThrow(
      `${ERROR_PREFIX} Instance capture is not allowed in defaultMountOptions.plugins.pinia. ` +
        "Use captureInstance() in mountOptions or extraOptions for each component mount.",
    );
  });

  it("should reject an own capture property even when its value is undefined", () => {
    const defaultMountOptions = {
      plugins: {
        router: {
          [PLUGIN_EXPOSE]: undefined,
        },
      },
    } as ComponentFactoryOptions;

    expect(() => assertNoDefaultInstanceCapture(defaultMountOptions)).toThrow(
      "Instance capture is not allowed in defaultMountOptions.plugins.router.",
    );
  });

  it("should ignore inherited capture properties", () => {
    const capture = captureInstance();

    const pluginOptions = Object.create({
      [PLUGIN_EXPOSE]: capture[PLUGIN_EXPOSE],
    });

    const defaultMountOptions = {
      plugins: {
        pinia: pluginOptions,
      },
    } as ComponentFactoryOptions;

    expect(() => assertNoDefaultInstanceCapture(defaultMountOptions)).not.toThrow();
  });
});
